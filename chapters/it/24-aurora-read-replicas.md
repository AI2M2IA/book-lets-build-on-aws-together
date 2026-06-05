# Capitolo 24: Il Database che Cresce con Te

Tom aveva effettuato una revisione dei costi che aveva individuato qualcosa di inaspettato nel livello del database.

Nimbus utilizzava RDS PostgreSQL: Multi-AZ, istanza db.r6g.large. $340 al mese.

"Sembra costoso," disse Tom. "Ma non sono sicuro di a cosa confrontarlo."

Leo ha fatto apparire le metriche delle prestazioni. La CPU del database saliva fino all'85% durante la frenesia del venerdì sera. Le query di lettura si trovavano in coda. La latenza delle query P95 aveva raddoppiato il suo valore negli ultimi sei mesi.

"Il database è il collo di bottiglia," disse. "Il traffico è aumentato. Il database non si è adattato ad esso."

"Possiamo semplicemente rendere più grande l'istanza?" chiese Maya.

"Sì," disse Leo. "Questo è lo scaling verticale. Passiamo da r6g.large a r6g.xlarge. Più CPU, più memoria. Costerà di più e ci darà tempo."

"Ma non risolve il problema di fondo," disse Priya. "Alla fine, raggiungeremo l'istanza più grande e avremo bisogno di un approccio diverso."

"Ci sono due approcci," disse Leo. "Replica di lettura, o Aurora."

"Qual è la differenza?"

Una buona domanda. Il resto di questo capitolo è la risposta.

Immagina una biblioteca affollata con un unico bibliotecario che sia responsabile della registrazione dei libri e della risposta alle domande dei clienti. Quando la biblioteca diventa popolare, si forma una coda. La soluzione: assumere più bibliotecari – solo per rispondere alle domande. La registrazione dei libri continua attraverso il bancone originale. Questo è un replica di lettura: capacità aggiuntiva che gestisce le letture, mentre tutti gli scritture vengono ancora gestite dalla fonte principale. Aurora va oltre, ridisegnando l’intero sistema di scaffalature in modo che tutti i bibliotecari utilizzino gli stessi scaffali e vedano sempre gli stessi libri, senza ritardi.

**Replica di Lettura: Distribuzione del Traffico di Lettura**

Nella maggior parte delle applicazioni web, i dati vengono letti molto più spesso di quanto vengano scritti. Un cliente che naviga nel menu effettua decine di query SELECT. Effettuare un ordine comporta alcuni inserimenti/aggiornamenti di query. Il rapporto è tipicamente 10:1 o superiore.

Una **replica di lettura** è un'istanza RDS aggiuntiva che riceve tutte le scritture dalla primaria e le rende disponibili per le query SELECT.

Come funziona:

1. Le operazioni di scrittura (INSERT, UPDATE, DELETE) vanno al database principale
2. Il database principale replica questi cambiamenti in modo asincrono alle replica di lettura
3. Le operazioni di lettura (SELECT) sono distribuite sulle replica di lettura
4. Le replica di lettura condividono il carico — ognuna gestisce una frazione del traffico di lettura totale

Il risultato: il database principale gestisce solo le scritture (e opzionalmente alcune letture). Le replica di lettura gestiscono il carico di lettura. Per un rapporto di lettura/scrittura di 10:1, l'aggiunta di una replica di lettura riduce approssimativamente la carica del principale di circa la metà.

**Limitazione importante**: La replica è **asincrona**. C'è un ritardo di replica — tipicamente millisecondi, ma può essere secondi sotto carico. Una lettura da una replica potrebbe vedere dati leggermente indietro rispetto al principale. Per la maggior parte delle letture (navigazione nel menu, visualizzazione della cronologia degli ordini) questo è accettabile. Per "il mio ordine è andato a buon fine?" — leggi dal principale.

**Replica di Lettura: I Dettagli**

* Puoi avere fino a 5 replica di lettura per un'istanza primaria RDS
* Le replica di lettura possono essere nella stessa regione o in una regione diversa (replica cross-region)
* Le replica di lettura possono avere a loro volta replica di lettura (catene)
* Le replica di lettura sono endpoint separati — la tua applicazione deve indirizzare le letture all'endpoint della replica
* Le replica di lettura possono essere promosse a database autonomi (utile per DR)

Per Nimbus, Leo ha aggiunto una replica di lettura. Ha aggiornato l'applicazione in modo che:

* Le operazioni di scrittura → endpoint principale
* Navigazione nel menu, cronologia degli ordini → endpoint della replica

La CPU sul principale è diminuita dallo 85% al 41% al picco.

Tom ha guardato i costi: una replica di lettura dello stesso tipo di istanza costa lo stesso del principale. Da $340 al mese a $680 al mese.

"Abbiamo raddoppiato il costo per ridurre approssimativamente il carico della metà," disse Tom.

"Sì. Ma l'alternativa era passare a un tipo di istanza più grande, che avrebbe comunque costato di più e non avrebbe distribuito il carico di lettura."

Tom ha fatto i calcoli. Ha annuito, con riluttanza.

"Cos'è Aurora?" ha chiesto.

**Aurora: Rielaborazione del Motore di Database**

Aurora è il motore di database relazionale proprietario di AWS, compatibile con MySQL e PostgreSQL. È stato progettato dall'inizio per i carichi di lavoro cloud, rimodellando il modo in cui lo strato di archiviazione di un database relazionale funziona.

In una configurazione RDS tradizionale (MySQL, PostgreSQL), lo storage e l'elaborazione sono accoppiati strettamente. Il motore di database gestisce i file di dati. La replica copia i dati dal principale alla replica. La replica deve ripetere ogni operazione di scrittura.

Aurora separa lo storage dal calcolo. Utilizza un livello di archiviazione distribuito e tollerante agli errori che replica automaticamente in tre zone di disponibilità in sei copie. Il livello di calcolo (le istanze di database) si trova sopra questo livello di archiviazione.

**Cosa cambia**:

**Replica di lettura**: le replica di Aurora non hanno bisogno di replicare i dati — hanno già accesso allo stesso livello di archiviazione. Ciò significa:

* Fino a 15 replica di lettura (rispetto a 5 per RDS standard)
* Il ritardo di replica è tipicamente inferiore a 100 millisecondi (rispetto a secondi per RDS sotto carico)
* Le replica possono essere promosse a primarie in meno di 30 secondi (rispetto a minuti)

**Failover**: Grazie alle repliche che condividono lo storage, il failover è molto più veloce – la promozione non prevede il trasferimento di dati, ma solo il reindirizzamento degli scritture.

**Storage**: Aurora scala automaticamente lo storage in incrementi di 10 GB, fino a 128 TB. Non devi mai provisionare lo storage in anticipo.

**Performance**: Aurora afferma un throughput di 5 volte superiore rispetto a MySQL standard e 3 volte superiore a PostgreSQL standard per tipi di istanza equivalenti.

**Aurora Pricing: La Domanda di Tom**

"Quanto costa?" chiese Tom.

Il prezzo di Aurora è diverso da quello di RDS:

**Prezzo delle istanze**: Simile al prezzo delle istanze di RDS per tipo.

**Prezzo dello storage**: 0,10 dollari al GB al mese (paghi per ciò che è memorizzato, in modo automatico scalabile).

**Prezzo I/O**: Aurora addebita per ogni richiesta I/O (lettura/scrittura allo storage). Questo può essere significativo per i carichi di lavoro orientati alla scrittura.

"Aspetta," disse Tom. "Stiamo pagando per l'I/O separatamente?"

"Aurora Serverless v2 e Aurora I/O-Optimized cambiano questo modello di prezzo," disse Leo. "Aurora I/O-Optimized non addebita alcun costo I/O ma un prezzo di istanza e storage più elevato. È migliore per i carichi di lavoro orientati all'I/O."

Tom guardò il compromesso. Per Nimbus, che era orientato alla lettura (molte query di menu, poche scritture), Aurora I/O-Optimized potrebbe costare di più. Il prezzo standard di Aurora potrebbe essere appropriato.

Questa è una decisione di costo reale che gli ingegneri senior prendono: devi conoscere i modelli di I/O del tuo carico di lavoro per scegliere correttamente.

**Aurora Serverless: Scalabilità Senza Pensare alle Istanze**

**Aurora Serverless v2** è una configurazione che scala automaticamente la capacità di calcolo in base al carico di database effettivo. Invece di scegliere una dimensione di istanza fissa (db.r6g.large), imposti una capacità minima e massima in Aurora Capacity Units (ACUs).

Aurora Serverless v2:

- Si espande in pochi secondi quando aumenta il carico
- Si riduce a quasi zero durante i periodi di inattività
- Costo: 0,12 dollari per ACU-ora (più storage e I/O)

Per i carichi di lavoro con traffico variabile – gli picchi del venerdì di Nimbus contro il silenzio del lunedì mattina – Serverless v2 riduce i costi durante i periodi di punta e gestisce i picchi senza pre-provisioning.

"Quindi durante il picco del venerdì," disse Leo, "Aurora scala automaticamente verso l'alto. Domenica mattina quando abbiamo quasi nessun traffico, scala di nuovo verso il minimo."

"E paghiamo solo per la capacità che stiamo utilizzando," disse Tom.

"Corretto."

Tom aveva l'espressione di qualcuno che aveva trovato esattamente ciò che stava cercando.

**Aurora Global Database: Letture Multi-Regione**

**Aurora Global Database** estende Aurora su più regioni AWS:

- **Una regione primaria** gestisce tutti gli scritture
- **Fino a cinque regioni secondarie** servono le letture con un ritardo di replica tipicamente inferiore a 1 secondo
- Le regioni secondarie possono essere promosse alla primaria in meno di 1 minuto (per scenari di DR)

Per l'espansione globale di Nimbus, Aurora Global Database consentirebbe a un partner ristorativo a Londra di interrogare il loro menu locale dalla replica di lettura dell'UE, mentre tutti gli ordini (scritture) passerebbero ancora attraverso la primaria negli Stati Uniti.

**RDS vs Aurora: Quando Scegliere Ognuno**

| Fattore            | RDS (PostgreSQL/MySQL)        | Aurora                                                     |
|-------------------|-------------------------------|------------------------------------------------------------|
| Cost              | Inferiore per piccoli carichi di lavoro     | Superiore base, ma scala meglio                             |
| Compatibilità     | Completa                          | MySQL/PostgreSQL compatibile (con lievi differenze)       |
| Max repliche      | 5                             | 15                                                         |
| Replica lag       | Può essere secondi                | Tipicamente <100ms                                             |
| Storage           | Provisioning fisso            | Auto-scalabile fino a 128 TB                               |
| Failover time     | 60-120 secondi                | <30 secondi                                                |
| Serverless option | Limitato                       | Aurora Serverless v2                                       |
| Migliore per       | Carichi di lavoro stabili e prevedibili | Traffico variabile, alto volume di lettura, necessità di failover rapido |

## Punti di Forza e Limitazioni

**Punti di forza di Aurora**:

- Failover significativamente più veloce rispetto a RDS standard
- Fino a 15 repliche di lettura con minimo ritardo
- Storage auto-scalabile
- Serverless v2 per carichi di lavoro variabili
- Global Database per il deployment multi-regione

**Limitazioni di Aurora**:

- Costo più elevato per piccoli carichi di lavoro stabili
- Il costo I/O può essere significativo per i carichi di lavoro orientati alla scrittura (utilizza I/O-Optimized per questo)
- Lievi differenze di compatibilità tra MySQL/PostgreSQL possono richiedere modifiche al codice
- Cold start di Serverless v2 (da quasi zero) può causare picchi di latenza

## Riepilogo

- **Replica di lettura** distribuiscono il traffico di lettura al primario. Replicazione asincrona – un leggero ritardo accettabile per la maggior parte delle letture.
- **Aurora** reinventa lo strato di storage: distribuito, condiviso tra le repliche, auto-scaling.
- Aurora offre: 15 replica di lettura, <100ms di ritardo di replica, <30s di failover, fino a 128TB di storage auto-scaling.
- **Aurora Serverless v2**: scala automaticamente la capacità di calcolo in base al carico. Adatta per traffico variabile.
- **Aurora Database Globale**: primario in una regione, replica di lettura in fino a cinque regioni.
- Scegli RDS per carichi di lavoro più piccoli, stabili e prevedibili. Scegli Aurora quando hai bisogno di scalabilità, failover rapido o gestione del traffico variabile.

## Consigli per l'Esame

*Dominio SAA-C03: Progettazione di Architetture ad Alte Prestazioni (Dominio 3, Task 3.3)*

- **Replica di lettura di Aurora vs Replica di lettura di RDS**: le repliche di Aurora condividono lo storage (ritardo quasi zero, <30s di failover). Le repliche di lettura di RDS replicano i dati (il ritardo può essere possibile, minuti per il failover).
- **Aurora Serverless v2**: "scala automaticamente la capacità del database", "traffico di database imprevedibile o a picchi", "scala a zero" → Aurora Serverless v2.
- **Aurora Database Globale**: "database multi-regione", "lettura dall'UE con bassa latenza dal primario statunitense", "RTO < 1 minuto per il failover regionale" → Aurora Database Globale.
- **Tempi di failover**: Aurora < 30 secondi. RDS Multi-AZ 60-120 secondi. Conosci entrambi.
- **Aurora I/O-Ottimizzata**: costo di storage e istanza più elevato, nessun costo per I/O. Utilizza quando i costi di I/O dominano (scritture intensive). Aurora Standard: costo di storage inferiore, pagamento per I/O. Utilizza per letture intensive.
- **Aurora Backtrack**: torna indietro il database a un punto specifico nel tempo senza ripristinare da un snapshot di backup. Disponibile solo per Aurora compatibile con MySQL. Segnale dell'esame: "dati accidentalmente eliminati, hai bisogno di recuperarli rapidamente senza ripristinare un backup completo".

## Esercizi

**Esercizio 1 — Ricordo**

Spiega la differenza tra Aurora e replica di lettura standard di RDS. Perché il ritardo di replica di Aurora è tipicamente inferiore?

*(Suggerimento: la differenza principale è lo storage condiviso rispetto alla replica dei dati. Pensa a cosa deve fare ogni replica quando arriva una scrittura.)*

**Esercizio 2 — Esercitazione per l'Esame**

*Scenario*: un database MySQL di una piattaforma di social media sta sperimentando alta latenza di lettura a causa dell'aumento del traffico. L'applicazione è di lettura (95% letture, 5% scritture). Il team ha bisogno di una latenza di lettura coerente, anche durante i picchi di traffico. Ha bisogno di failover automatico con tempi di inattività minimi (RTO target < 30 secondi). Il volume dei dati sta crescendo in modo imprevedibile.

Quale soluzione di database soddisfa meglio questi requisiti?

A) RDS MySQL Multi-AZ con cinque replica di lettura
B) Aurora MySQL con Aurora Replicas e Aurora Serverless v2
C) RDS MySQL con un tipo di istanza più grande (scalabilità verticale)
D) DynamoDB con DynamoDB DAX per la cache di lettura

*(Suggerimento 1*: "RTO < 30 secondi" — quale servizio lo raggiunge? Controlla i tempi di failover per ciascuna opzione.

*(Suggerimento 2*: "Latenza di lettura coerente durante i picchi" — quale servizio ha repliche con ritardo quasi zero rispetto a potenziali secondi di ritardo?

*(Suggerimento 3*: "Volume di dati in crescita imprevedibile" — quale servizio scala automaticamente lo storage?

**Risposta**: B

**Spiegazione**: Aurora MySQL con Aurora Replicas fornisce un ritardo di replica quasi zero (millisecondi, non secondi) per prestazioni di lettura coerenti sotto carico. Aurora Serverless v2 scala automaticamente la capacità di calcolo durante i picchi di traffico senza sovra-provisioning. Lo storage di Aurora scala automaticamente man mano che i dati crescono. Il failover di Aurora (promozione di una replica) completa in meno di 30 secondi — soddisfacendo il requisito RTO.

**Perché non A?** Il failover di RDS Multi-AZ richiede 60-120 secondi — non soddisfa il requisito RTO < 30 secondi. Il ritardo di replica standard di RDS può raggiungere i secondi sotto carico — la latenza "coerente" di lettura è più difficile da garantire.

**Perché non C?** La scalabilità verticale (istanza più grande) aumenta la capacità ma non distribuisce il carico di lettura. Il database rimane un singolo punto di errore per le letture.

**Perché non D?** DynamoDB è NoSQL — migrare da MySQL a DynamoDB richiede la riprogettazione del modello dei dati e delle query dell'applicazione, il che è molto al di là dello scopo di questo miglioramento delle prestazioni.

*Dominio SAA-C03: Progettazione di Architetture ad Alte Prestazioni — Task 3.3*

**Esercizio 3 — Sfida Architetturale** *(Opzionale)*

Nimbus sta progettando un'espansione globale. Vogliono che i partner ristoranti sulla costa occidentale, in Germania e in Australia vedano i propri dati di ordine rapidamente, senza latenza cross-region. Tuttavia, tutte le scritture devono andare attraverso un primario statunitense-Est principale per mantenere la coerenza.

Progetta l'architettura del database utilizzando Aurora. Come strutturerebbe il Database Globale? Cosa succede se il primario statunitense-Est va giù? Come gestirebbe il processo di promozione?

*(Non esiste una risposta corretta singola. L'obiettivo è praticare la progettazione di database multi-regione.)*

## Scena Post-Crediti

Leo si è trasferito ad Aurora con Serverless v2.

Il picco del venerdì è passato e via. CPU non ha superato i 60%. La latenza delle query è rimasta coerente. Aurora ha scalato automaticamente per gestire il carico, quindi si è ridotta dopo l'ora di punta.

"Quanto è costato questo rispetto a venerdì?" Tom chiese lunedì mattina.

Leo aprì l'esploratore delle fatture. "Venerdì ha raggiunto i $0,89/ora. Sabato mattina era a $0,11/ora."

Tom non disse nulla.

"La vecchia configurazione era un costo fisso di $0,47/ora indipendentemente dal carico," aggiunse Leo.

"Quindi abbiamo pagato di più durante la picchia rispetto a prima," disse Tom.

"Sì. Ma significativamente meno durante le ore non di punta. Il costo netto della settimana è inferiore."

Tom calcolò. Poi annuì.

"C'è una lezione qui," disse. "La domanda giusta non è 'è questo più economico?'. È 'è questo più economico per il nostro modello di utilizzo effettivo?'"

"Questo," disse Priya dalla parte opposta della stanza, "è un istinto di un ingegnere senior."

Tom si sentì leggermente preoccupato di essere descritto in quel modo.

Nel prossimo capitolo: quando la tua rete è il collo di bottiglia e perché un'autostrada privata potrebbe valere la pedaggio.
