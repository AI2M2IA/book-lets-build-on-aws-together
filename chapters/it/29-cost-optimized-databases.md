# Capitolo 29: Il Conto del Database

Tom's audit di storage aveva identificato 8.800 dollari in sprechi. Si rivolse alle voci di database.

RDS Aurora: 647 dollari al mese.
RDS PostgreSQL (repliche di lettura): 340 dollari al mese.
ElastiCache: 183 dollari al mese.

Costo totale della tier del database: 1.170 dollari al mese.

"Vorrei capire ogni voce prima di prendere qualsiasi decisione," disse. "Perché nel database non si risparmia tagliando gli angoli."

Era un consiglio saggio. Una configurazione errata del database che causa perdita di dati o degrado delle prestazioni costa molto più dei risparmi.

Pensa a un database come al motore di un'auto. Puoi risparmiare denaro su un'auto passando a carburante più economico, regolando la pressione degli pneumatici e rimuovendo peso inutile dal bagagliaio. Ma se provi a risparmiare denaro evitando un cambio olio, rischi di danneggiare il motore — e un motore danneggiato costa molto più di qualsiasi risparmio sul carburante. L'audit che Tom sta per eseguire segue la stessa logica: trovare gli sprechi nel bagagliaio e nel serbatoio del carburante, e lasciare il motore da solo finché non sai esattamente cosa stai facendo.

**Comprendere il Tuo Carico di Lavoro di Database**

L'ottimizzazione dei costi nei database richiede di comprendere il carico di lavoro prima di toccare qualsiasi cosa.

Domande chiave:

- Qual è l'utilizzo medio e di picco della CPU?
- Qual è il rapporto lettura/scrittura?
- Lo storage sta crescendo, rimanendo stabile o diminuendo?
- Le repliche di lettura sono utilizzate?
- L'istanza è sotto-provisionata (causando rallentamenti) o sovra-provisionata (pagando per capacità inutilizzata)?

Tom ha aperto CloudWatch metrics per tutti e tre i servizi di database negli ultimi 30 giorni:

**Cluster Aurora:**

- Utilizzo medio della CPU: 18% (picco: 67% venerdì sera)
- Rapporto lettura/scrittura: 14:1 (lettura-intensa)
- Storage: 180 GB (in crescita di circa 5 GB al mese)

**Repliche di lettura (RDS PostgreSQL, separate dall'Aurora):**

- Erano due repliche di lettura RDS legacy create prima della migrazione all'Aurora, ancora in esecuzione.
- Utilizzo medio delle connessioni per ciascuna: 2 al giorno. Utilizzo medio della CPU: 3%.

"Perché queste sono ancora in esecuzione?" chiese Tom.

Leo ha esaminato le date di creazione dell'istanza. "Sono state create durante la migrazione all'Aurora come fallback. Ci siamo dimenticati di eliminarle."

Quel momento — quando una cosa costosa è in esecuzione da mesi senza essere utilizzata — è un momento familiare negli ambienti cloud.

Le repliche sono state terminate. Risparmio mensile: 340 dollari.

**Istanza Riservata (Reserved Instances): La Versione del Database**

Come per EC2, RDS offre Istanza Riservata per un utilizzo impegnato.

Per Aurora con Serverless v2, le Istanza Riservata non si applicano direttamente — Serverless v2 scala dinamicamente e si paga per ACU-ora. Tuttavia, se si utilizza una configurazione Aurora istanza fissa (non Serverless), le Istanza Riservata possono offrire uno sconto del 30-60%.

Tom ha rivisto le istanze provisionate di Aurora (il writer e un reader):

- Istanza writer: db.r6g.large, On-Demand = 0,26 dollari/ora = 190 dollari al mese
- Istanza reader: db.r6g.large, On-Demand = 0,26 dollari/ora = 190 dollari al mese

Istanza Riservata per 1 anno per entrambi: circa 108 dollari al mese. Risparmio annuale: 984 dollari.

"Aspetta," disse Leo. "Abbiamo migrato a Aurora Serverless v2 nel Capitolo 24. Perché Tom sta guardando On-Demand per istanze provisionate?"

Buon colpo. Cerchiamo di essere precisi: l'Aurora writer principale di Nimbus utilizza Serverless v2. Il reader (per le repliche di lettura) utilizza anche Serverless v2. Serverless v2 non ha Istanza Riservata tradizionali — si paga per ACU-ora.

Per i team che eseguono istanze Aurora fisse (non Serverless), le Istanza Riservata offrono risparmi significativi. Per i carichi di lavoro Serverless v2, i risparmi derivano dalla natura auto-scaling del servizio stesso — non si paga per la capacità inutilizzata.

**DynamoDB: On-Demand vs Provisioned**

Nel Capitolo 9, abbiamo introdotto le due modalità di capacità di DynamoDB: on-demand e provisioned.

Nimbus aveva eseguito DynamoDB in modalità on-demand dall'inizio. A basso traffico, questo era corretto — on-demand è più costoso per richiesta ma non ha una tariffa minima.

Ora, con 18 mesi di dati di traffico in CloudWatch, Tom poteva vedere i modelli.

Capacità di lettura media per giorno: 45.000 unità
Capacità di scrittura media per giorno: 12.000 unità
Picco di giorno (venerdì): 180% del volume di richieste DynamoDB medio (ElastiCache assorbe circa il 95% del picco di lettura, quindi DynamoDB vede solo una frazione del volume complessivo di picco di 25x)

**Tariffa on-demand:** 1,25 dollari per milione di richieste di scrittura, 0,25 dollari per milione di richieste di lettura.
**Tariffa provisioned:** 0,00065 dollari per unità di capacità di scrittura all'ora, 0,00013 dollari per unità di capacità di lettura all'ora.

Tom ha calcolato il punto di pareggio: la capacità provisioned diventa più economica quando si utilizza in modo coerente tale da non pagare il sovrapprezzo on-demand durante i periodi di inattività.

Con 18 mesi di dati che mostrano modelli giornalieri coerenti, la capacità provisioned con **DynamoDB Auto Scaling** era la scelta giusta:

- Imposta la capacità minima al 60% del carico medio
- Imposta la capacità massima al 250% dell'average (gestisce i picchi di venerdì)
- Auto Scaling regola la capacità provisioned tra questi limiti

Costo mensile di DynamoDB: è diminuito da 340 dollari (on-demand) a 230 dollari (provisioned con auto scaling). Riduzione del 32%.

"Ma se sovra-provisioniamo," chiese Leo, "paghiamo per la capacità inutilizzata."

"Quella è la posta in gioco," disse Tom. "Con l'Auto Scaling, impostiamo il minimo sufficientemente alto da evitare il throttling e lasciamo che AWS gestisca entro i nostri limiti."

"E se il nostro modello di traffico cambia significativamente?"

"Allora regoliamo i limiti. Lo rivediamo trimestralmente."

**ElastiCache: Ottimizzazione delle Risorse e Nodi Riservati**

La bolletta di ElastiCache: 183$/mese. Una singola cache.r6g.large istanza Redis in ogni AZ (due nodi, primario + replica).

I metadati di CloudWatch hanno mostrato:

- Utilizzo medio della memoria: 34%
- Picco: 58%

L'istanza era sovradimensionata. Una cache.r6g.medium avrebbe probabilmente gestito il carico con un margine di sicurezza.

Passando da r6g.large (2 nodi × 0,127$/ora) a r6g.medium (2 nodi × 0,065$/ora):

- Risparmio mensile: 113$ → in attesa.

In realtà i calcoli: large = 2 × 0,127 × 730 ore = 185$/mese. Medium = 2 × 0,065 × 730 = 95$/mese. Risparmio: 90$/mese.

Tom ha testato l'istanza medium in staging per due settimane sotto carico. L'utilizzo della memoria ha raggiunto il 71%. Abbastanza vicino al limite che lo rendeva insicuro.

Ha provato cache.r6g.large ma con Nodi Riservati (impegno di 1 anno): da On-Demand 185$ a Riservati 120$/mese. Risparmio: 65$/mese senza modificare il tipo di istanza.

"A volte ottimizzare verso un'istanza più piccola rischia un incidente di prestazioni," ha detto. "I Nodi Riservati ci danno gli stessi risparmi con meno rischi."

**Backup di RDS: Il Compromesso sullo Spazio di Archiviazione**

I backup automatici di RDS sono memorizzati in S3 (a nessun costo aggiuntivo per lo spazio di archiviazione fino alla dimensione del tuo database) . La retention predefinita è di 7 giorni.

Per Nimbus, un database Aurora da 180GB, 7 giorni di backup erano appropriati: erano stati in grado di ripristinare da un backup entro quella finestra di tempo durante i test.

Ma Tom ha notato: avevano anche snapshot manuali da ogni importante implementazione, conservati indefinitamente.

23 snapshot manuali, totale 4,1TB di spazio di archiviazione snapshot.
Costo: 0,095$/GB/mese per i backup di Aurora = 389$/mese per lo spazio di archiviazione snapshot manuale.

Conservavano gli ultimi 3 snapshot manuali per ambiente (produzione, staging). Eliminavano il resto.
Risparmio: 350$/mese.

"Stavamo pagando 350$ al mese per un'assicurazione che non usavamo," disse Leo.

"Stavamo pagando per la tranquillità," corresse Tom. "La domanda è: quanto vale la tranquillità a 350$ al mese?"

"Con un piano di disaster recovery adeguato," disse Priya, "puoi ottenere la stessa tranquillità da 7 giorni di backup automatici e 3 snapshot manuali."

"D'accordo. Ora."

**Riepilogo dell'Ottimizzazione del Database**

| Servizio                                           | Prima     | Dopo    | Risparmio Mensile |
|---------------------------------------------------|------------|----------|------------------|
| RDS Read Replicas (non utilizzate)                        | 340$       | 0$       | 340$             |
| Aurora (Nodi Riservati)                       | 190$       | 120$     | 70$              |
| DynamoDB (On-Demand → Provisioned + Auto Scaling) | 340$       | 230$     | 110$             |
| ElastiCache (Nodi Riservati)                      | 185$       | 120$     | 65$              |
| Aurora snapshot manuali                           | 389$       | 39$      | 350$             |
| **Totale**                                         | **1.444$** | **509$** | **935$/mese**    |

935$ al mese di risparmio sui database. 11.220$ all'anno.

Tom ha messo questo numero accanto al risparmio sullo spazio di archiviazione (6.200$ all'anno) e al risparmio sui Piani di Risparmio (14.200$ all'anno).

Impatto complessivo dell'ottimizzazione: 31.620$ all'anno.

"Questi sono tre ingegneri junior," disse Maya.

"O uno senior," disse Priya.

"O dodici mesi di esperimenti," disse Leo.

Tutti e tre avevano ragione.

## Punti di Forza e Limiti

**DynamoDB Provisioned con Auto Scaling**:

- Più economico rispetto all'on-demand per carichi di lavoro prevedibili e coerenti
- Auto Scaling gestisce la variabilità senza sovradimensionare permanentemente
- Richiede il monitoraggio per garantire che i limiti di capacità rimangano appropriati

**RDS Nodi Riservati / ElastiCache Nodi Riservati**:

- Risparmi significativi per carichi di lavoro stabili e a lungo termine
- Impegno bloccato – se le tue esigenze cambiano, hai pagato per capacità inutilizzata
- Il Marketplace RI consente di vendere RDS RI non utilizzati (a differenza di Convertible, che non può essere venduto)

**Il principio generale**:

- Comprendere l'utilizzo prima di ottimizzare
- Le risorse inutilizzate (come le legacy read replicas) sono l'ottimizzazione a più alto rendimento
- Il ridimensionamento richiede la validazione in staging prima dell'applicazione in produzione
- I prezzi dei nodi riservati richiedono fiducia nella stabilità del carico di lavoro

## Riepilogo

- **Effettua un controllo preliminare**: estrai le metriche di CloudWatch prima di apportare modifiche al database.
- **Elimina le risorse inutilizzate**: replica di lettura, database inattivi e istanze di test che non sono più necessarie.
- **DynamoDB On-Demand vs Provisioned**: On-Demand per traffico imprevedibile; Provisioned + Auto Scaling per modelli coerenti.
- **ElastiCache Nodi Riservati**: come le istanze EC2 Riservate per Redis/Memcached. Risparmio del 30-50% per carichi di lavoro stabili.
- **Gestione degli snapshot di RDS**: conserva solo gli snapshot di cui hai bisogno. Gli snapshot manuali sono memorizzati indefinitamente a meno che non vengano eliminati.
- **Dimensiona con cautela**: i problemi di prestazioni derivanti dal dimensionamento del database possono essere rischiosi. Testa in staging, convalida sotto carico.

## Consigli per l'esame

*SAA-C03 Dominio: Progettazione di architetture ottimizzate per i costi (Dominio 4, Attività 4.3)*

- **Modi di prezzo di DynamoDB**: On-Demand = pagamento per richiesta (costo unitario più elevato, nessun limite minimo). Provisioned = pagamento per unità di capacità all'ora (costo unitario inferiore, è necessario allocare la capacità). **DynamoDB Auto Scaling** regola automaticamente la capacità provisioned.
- **Istanze RDS Riservate**: disponibili per tutti i tipi di motore RDS. I deployment Multi-AZ possono utilizzare le Istanze Riservate (è necessario impegnarsi per Multi-AZ). Termine di 1 o 3 anni.
- **ElastiCache Nodi Riservati**: stesso modello di impegno delle Istanze Riservate EC2. Applicato per nodo, non per cluster.
- **Archiviazione degli snapshot di RDS**: i backup automatici sono gratuiti fino al 100% della dimensione del database. Gli snapshot manuali sono addebitati a GB al mese in S3. Scenario di esame: "riduci i costi di archiviazione RDS" → elimina vecchi snapshot manuali.
- **Capacità riservata di DynamoDB**: disponibile anche per DynamoDB (impegnata per una lettura/scrittura specifica per 1 o 3 anni con uno sconto). Diversa dalla provisioned standard — pre-paghi la capacità per tutti i tuoi tabelle DynamoDB in una regione.
- **Aurora Serverless v2 vs provisioned**: Serverless v2 scala automaticamente, ideale per carichi di lavoro variabili. Provisioned con Istanze Riservate è più economico per carichi di lavoro stabili e prevedibili.

## Esercizi

**Esercizio 1 — Richiamo**

Quando dovresti utilizzare la capacità on-demand di DynamoDB rispetto alla capacità provisioned con Auto Scaling? Quali informazioni hai bisogno per prendere questa decisione?

*(Suggerimento: pensa a cosa significa "prevedibile" in termini di dati sul traffico e a quale rischio l'on-demand elimina che la provisioned introduce.)*

**Esercizio 2 — Esercitazione per l'esame**

*Scenario*: un'azienda esegue una tabella DynamoDB per il leaderboard di un gioco mobile. Il traffico punta pesantemente durante un evento stagionale (una settimana ogni trimestre, 10x traffico normale) ma è altrimenti molto coerente. Al di fuori dell'evento stagionale, l'azienda vuole ridurre al minimo i costi del database mantenendo le prestazioni.

Quale strategia di capacità DynamoDB soddisfa meglio questi requisiti?

A) Capacità on-demand per gestire i picchi stagionali senza throttling
B) Capacità provisioned impostata ai livelli stagionali di picco (provisionata sempre per 10x traffico)
C) Capacità provisioned con DynamoDB Auto Scaling, con una capacità massima impostata per il picco stagionale
D) Unità di capacità riservata di DynamoDB per 3 anni a livelli di traffico normali

**Suggerimento 1**: "Traffico coerente tranne che per i picchi stagionali" — quale modalità gestisce entrambi in modo efficiente?

**Suggerimento 2**: "Minimizza i costi" durante i periodi di bassa attività significa che non puoi sovra-provisionare per 10x tutto il tempo.

**Suggerimento 3**: DynamoDB Auto Scaling può scalare per l'evento stagionale e tornare indietro dopo.

**Risposta**: C

**Spiegazione**: la capacità provisioned con Auto Scaling scala la tabella in base al traffico effettivo. Durante i periodi normali, la capacità è a livelli normali (costo basso). Durante l'evento stagionale, Auto Scaling rileva l'aumento del traffico e scala al livello massimo configurato (gestisce il 10x di picco). Dopo l'evento, torna indietro. Questo è più economico rispetto all'on-demand durante i periodi normali (l'on-demand costa più per richiesta rispetto alla provisioned durante il traffico normale prevedibile) e più economico rispetto alla provisioned sempre per 10x.

**Perché non A?** On-demand gestisce i picchi senza throttling ma costa più per richiesta rispetto alla provisioned durante il traffico normale prevedibile.

**Perché non B?** Provisionare a 10x in modo permanente significa che il 75% della capacità provisioned è inutilizzato per il 75% dell'anno — si paga per la capacità che non viene mai utilizzata.

**Perché non D?** Le unità di capacità riservata ti bloccano a livelli di traffico normali. Durante il picco stagionale del 10x, saresti throttled oltre l'importo riservato, o avresti bisogno di aggiungere on-demand sopra.

*SAA-C03 Dominio: Progettazione di architetture ottimizzate per i costi — Attività 4.3*

**Esercizio 3 — Sfida di architettura** *(Opzionale)*

Nimbus sta valutando una nuova funzionalità: un pannello di controllo per l'analisi dei ristoranti che mostra il conteggio dei comandi in tempo reale, il ricavo all'ora e la demografia dei clienti. Questi dati verrebbero interrogati da un database circa 200 volte al minuto (una query per analista per refresh di pagina, con 10 analisti), il che significa che la query è eseguita ogni minuto.

Attualmente i dati di analisi sono in Athena (S3). Dovrebbero costruire il pannello di controllo su Athena o dovrebbero caricare i dati in un database? Se un database, quale (Aurora, DynamoDB, Redshift)?

Considera: la frequenza delle query, i requisiti di freschezza dei dati, la complessità delle query (aggregazioni, join) e il costo per query a questo volume.

*(Non esiste una risposta univoca. L'obiettivo è esercitarsi nella selezione di database per i carichi di lavoro di analisi.)*

## Scena Post-Crediti

Tom presentò il riepilogo completo dell'ottimizzazione dei costi a Maya.

Tre mesi di lavoro. Identificati risparmi annuali di $31.620. Implementate già $26.400 di modifiche.

"Quali sono i restanti $5.220?" chiese Maya.

"Ottimizzazioni su cui non sono ancora sicuro," rispose Tom. "La configurazione di Aurora potrebbe essere ulteriormente ottimizzata, ma vorrei un altro trimestre di dati prima di impegnarmi. E c'è una questione di trasferimento dati che non ho ancora analizzato completamente."

"I costi di rete."

"Sì. Quello è il prossimo."

Maya guardò i numeri. "Tom, voglio capire una cosa. Questa ottimizzazione – ci hai lavorato per tre mesi. È una parte significativa del tuo tempo."

"Circa il 30%."

"E hai risparmiato $26.400 all'anno. Quindi l'ottimizzazione si ammortizza in – cosa, quattro mesi di stipendio?"

Tom la guardò. "Circa così."

"E ogni anno dopo, è solo risparmio."

"O puro reinvestimento," disse lui. "Stesso effetto."

Maya annuì. "Questo è quello che voglio che tu faccia. Non solo per lo storage e i database – per tutto. Rendi l'ottimizzazione dei costi una funzione continua del tuo ruolo."

Tom non aveva mai sentito la sua posizione descritta in questo modo. Lo trovò accurato e soddisfacente.

Nel prossimo capitolo: l'ultima categoria di costi rimanente – e quella che sorprende quasi tutti.
