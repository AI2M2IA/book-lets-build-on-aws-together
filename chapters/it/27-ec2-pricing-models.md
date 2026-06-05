# Capitolo 27: Pagamento per Ciò di Cui Hai Bisogno

Tom aveva rivisto la bolletta AWS ogni mese da quando Nimbus era iniziato. Per il primo anno, capiva approssimativamente il 60% di ciò che vedeva. A quel punto, capiva quasi tutto, tranne la sezione EC2.

La sezione EC2 era un mix di "Istanza On-Demand" di diversi tipi di istanza, tutte a tariffa oraria, che sommavano 2.340 dollari al mese.

"Sappiamo di aver bisogno di queste istanze," disse Tom. "Ma non capisco perché stiamo pagando la tariffa standard per tutte."

"La tariffa standard?" chiese Leo.

"On-Demand pricing," disse Tom. "È come prenotare una stanza d'albergo la mattina in cui ne hai bisogno. Massima flessibilità. Massima tariffa."

"Quindi qual è l'alternativa?"

Tom aprì la pagina dei prezzi di EC2.

"Ci sono quattro modelli di prezzi," disse. "E ne stiamo usando solo uno."

**L'Analogo della Stanza d'Albergo**

I prezzi di EC2 si mappano sorprendentemente bene alle strategie di prenotazione delle camere d'albergo:

**On-Demand**: Si presenta alla reception senza una prenotazione. Si paga il prezzo pieno al metro quadro, ma si può uscire quando si vuole. Perfetto per soggiorni imprevedibili.

**Istanza Riservata/Piani di Risparmio**: Si prenota una stanza per l'intero anno in anticipo. Si ottiene uno sconto significativo – da 30-72% in meno – in cambio dell'impegno a utilizzarla.

**Istanza Spot**: Si offre un prezzo per le stanze non utilizzate al momento accettato dall'hotel. Fino al 90% in meno. Ma l'hotel può chiederti di lasciare con due minuti di preavviso se ha bisogno della stanza per un cliente a prezzo pieno.

**Host Dedicati**: Si affitta l'intero piano dell'hotel esclusivamente per sé. Nessun condivisione con altri ospiti. Significativamente più costoso. Richiesto quando i software licensing o le regole di conformità proibiscono la condivisione di un host fisico.

Ogni modello ha un caso d'uso. L'errore che Nimbus stava commettendo era quello di usare On-Demand per tutto, compresi i carichi di lavoro che funzionavano 24 ore su 24 e 7 giorni su 7 e che erano completamente prevedibili.

**Istanza On-Demand: Massima Flessibilità, Massimo Costo**

**Quando usarla:**

- Carichi di lavoro imprevedibili (picchi di traffico che non si possono prevedere)
- Sviluppo e test (avviato e arrestato frequentemente)
- Carichi di lavoro a breve termine (esecuzione di un esperimento per una settimana)
- Prima implementazione (prima di capire i tuoi schemi di utilizzo)

**Quando non usarla:**

- Carichi di lavoro di produzione a regime che sai che funzioneranno per più di un anno
- Qualsiasi cosa con un carico di base prevedibile

Tom ha identificato le istanze On-Demand di Nimbus:

- Server API web: 4 istanze EC2, in esecuzione 24 ore su 24, 7 giorni su 7 per 18 mesi. *Carico di base prevedibile.*
- Proxy di database (RDS Proxy): Sempre in esecuzione. *Carico di base prevedibile.*
- Server VPN: Sempre in esecuzione. *Carico di base prevedibile.*
- Server API aggiuntivi per picchi di traffico: Imprevedibile. *On-Demand è corretto qui.*

**Istanza Riservata: L'Impegno Annuale**

**Istanza Riservata (RI)** è un impegno di fatturazione – si accetta di utilizzare un tipo di istanza specifico in una specifica regione per 1 o 3 anni. In cambio, AWS addebita un costo orario inferiore.

**Livelli di sconto:**

- 1 anno, Nessun anticipo: ~30-40% di sconto rispetto a On-Demand
- 1 anno, Parziale anticipo: ~35-45% di sconto (si paga parte ora, meno all'ora)
- 1 anno, Tutto anticipo: ~40-50% di sconto (si paga il prezzo intero ora)
- 3 anni, Tutto anticipo: ~55-72% di sconto (massimo sconto, massimo impegno)

**Istanza Standard vs Convertibile**

- **Standard**: Bloccata al tipo di istanza e alla regione esatti. Può essere venduta sul Mercato delle Istanza Riservate se non ne hai più bisogno.
- **Convertibile**: Può cambiare tipo di istanza, sistema operativo e tenancy durante il periodo di impegno. Meno sconto rispetto allo Standard (~50% max vs 72%).

Tom ha calcolato i costi per i 4 server API (r6g.large, $0.252/ora On-Demand):

- Costo annuale On-Demand: $0.252 × 24 × 365 × 4 = $8.820
- 1 anno All Upfront RI (1 istanza): ~$1.600 in anticipo
- 4 istanze: ~$6.400 in anticipo = **$2.420 risparmiati nel primo anno**

"Potremmo risparmiare $2.420 nel primo anno solo impegnandoci," disse Tom.

"È un impegno," disse Maya. "Cosa succede se dobbiamo cambiare il tipo di istanza?"

"Ottieni Istanza Convertibile se pensiamo di averne bisogno."

"Cosa succede se AWS rilascia un tipo di istanza migliore?"

"Lo controlliamo quando scade l'RI. Se il nuovo tipo è migliore, ne compriamo uno nuovo."

**Piani di Risparmio: L'Impegno Flessibile**

**Piani di Risparmio** sono un'alternativa più recente e flessibile alle Istanza Riservate. Invece di impegnarsi per un tipo di istanza specifico, ci si impegna per un importo specifico di spesa oraria (in dollari).

**Piani di Risparmio per Compute**: Applicano a qualsiasi istanza EC2, indipendentemente dal tipo, dalla dimensione, dalla regione o dal sistema operativo. Più flessibile. Fino al 66% di sconto.

**Piani di Risparmio per le Istanza EC2**: Applicano a una famiglia specifica di istanze in una regione (ad esempio, "istanze c6g in us-east-1"). Più restrittivo rispetto a Compute, ma fino al 72% di sconto (stesso del massimo RI).

**Piani di Risparmio per SageMaker**: Specifici per l'addestramento e l'inferenza di SageMaker ML.

"Questo è meglio delle Istanza Dedicate per noi," disse Leo. "Stiamo ancora sperimentando con i tipi di istanza. Il Piano di Risparmio su Calcolo ci dà lo sconto senza bloccarci specificamente alle r6g."

**Istanze Spot: Lo Sconto del 90%**

**Istanze Spot** utilizzano la capacità EC2 inutilizzata di AWS. Quando AWS ha server inutilizzati, puoi affittarli a 60-90% al di sotto del prezzo On-Demand. Quando AWS ha bisogno di quella capacità di nuovo (per i clienti On-Demand o con Istanza Dedicata), ti dà un preavviso di 2 minuti e termina la tua istanza.

Il rischio di interruzione è la caratteristica distintiva. Le Istanze Spot sono appropriate solo per:

- **Carichi di lavoro tolleranti ai guasti**: Se un'istanza viene interrotta durante un'attività, l'attività può riavviarsi senza corrompere nulla
- **Elaborazione senza stato**: Ridimensionamento di immagini, codifica video, analisi batch, addestramento di ML
- **Lavori a batch di breve durata**: Il preavviso di 2 minuti è sufficiente per salvare lo stato e fare il checkpoint
- **Flotte di Auto Scaling miste**: Utilizza Spot per la maggior parte della tua ASG con On-Demand come baseline

Per Nimbus: Le Istanze Spot hanno fatto senso per i lavori di analisi batch che venivano eseguiti ogni notte (elaborando i dati degli ordini giornalieri in report aggregati). Se un'Istanza Spot viene interrotta durante un'attività, l'attività fallisce, ma riparte dall'inizio su una nuova istanza. I dati in S3 sono al sicuro.

"Utilizzare Spot per il lavoro notturno ha ridotto il suo costo da 12 dollari a notte a 2 dollari a notte," ha riferito Leo.

**Istanze Dedicate: L'Opzione di Conformità**

Alcene licenze software (Oracle, Windows Server in alcune configurazioni) sono vendute a prezzo per socket o core. Quando si esegue questo software su un host condiviso (il predefinito per EC2), si potrebbe pagare per la capacità che non si sta utilizzando.

**Istanze Dedicate** ti danno accesso a un server fisico interamente per il tuo uso. Puoi portare le tue licenze esistenti a prezzo per socket. Nessun altro cliente AWS esegue istanze sullo stesso hardware.

Le Istanze Dedicate sono significativamente più costose delle istanze standard EC2. Sono uno strumento di conformità e licenza, non uno strumento di ottimizzazione dei costi.

Nimbus non aveva requisiti di licenza che necessitassero Istanze Dedicate. La maggior parte delle applicazioni native cloud non ne ha.

**Costruzione di una Flotta Mista**

L'approccio maturo: utilizzare più modelli di prezzi insieme.

Per la flotta API di Nimbus:

- **Carico di base (4 istanze, sempre in esecuzione)**: Coperto da un impegno del Piano di Risparmio su Calcolo
- **Picchi prevedibili (2 istanze aggiuntive durante l'orario di lavoro)**: Coperto dal Piano di Risparmio su Calcolo se l'impegno lo copre, altrimenti On-Demand
- **Sovraccarico del traffico**: Istanze Spot (accettabile perché i server API sono stateless — le richieste si ridistribuiscono se un'istanza viene interrotta)

Il risultato: una flotta che ottimizza il costo a ogni livello — prezzi impegnati per la parte prevedibile, On-Demand per la crescita imprevedibile, Spot per la capacità di picco.

## Punti di Forza e Limitazioni

**On-Demand**: Nessun impegno. Prezzo pieno. Utilizzare per carichi di lavoro imprevedibili o a breve termine.

**Istanze Dedicate/Piano di Risparmio**: Fino al 72% di sconto. Bloccato a tipo di istanza/regione/OS specifico. Vendere capacità inutilizzata sul Marketplace del Piano di Risparmio.

**Piano di Risparmio**: Fino al 66-72% di sconto. Più flessibile delle Istanze Dedicate (i Piano di Risparmio si applicano a qualsiasi tipo di istanza). Applicazione automatica all'utilizzo corrispondente.

**Istanze Spot**: Fino al 90% di sconto. Rischio di interruzione di 2 minuti. Solo per carichi di lavoro tolleranti ai guasti, senza stato, interruptibili.

**Istanze Dedicate**: Server fisico completo. Più costoso. Richiesto per determinati scenari di licenza o conformità.

## Riepilogo

- Il prezzo EC2 ha quattro modelli: **On-Demand** (prezzo pieno, nessun impegno), **Istanze Dedicate/Piano di Risparmio** (spesa impegnata per uno sconto significativo), **Spot** (capacità inutilizzata a 60-90% di sconto, interruptibile), **Istanze Dedicate** (server fisico esclusivo).
- **Piano di Risparmio** è generalmente preferito rispetto alle Istanze Dedicate per la flessibilità.
- **Istanze Spot** richiedono carichi di lavoro tolleranti ai guasti e senza stato — solo per lavori a batch, addestramento di ML e elaborazione interruptibile.
- La strategia ottimale è una **flotta mista**: Piano di Risparmio per la baseline, On-Demand per la crescita imprevedibile, Spot per il lavoro a batch interruptibile.
- Rivedere i modelli di prezzo quando i carichi di lavoro sono in esecuzione in modo costante per 3+ mesi — è quando On-Demand inizia a essere uno spreco.

## Suggerimenti per l'Esame

*SAA-C03 Dominio: Progettare Architetture Ottimizzate per il Costo (Dominio 4, Task 4.2)*

- **Piani di Risparmio vs. Istance di Riserva**: I Piani di Risparmio sono più flessibili (si applicano a qualsiasi istanza EC2 per i Piani di Risparmio su Calcolo). Le Istance di Riserva si bloccano a un tipo di istanza specifico. Scenari di esame: "bisogno di massima flessibilità pur ottenendo sconti" → Piani di Risparmio. "Conoscere il tipo di istanza esatto per 3 anni" → Istanza di Riserva Standard per il massimo sconto.
- **Segnali Spot**: "sensibile al costo", "tollerante ai guasti", "elaborazione batch", "può gestire le interruzioni", "carichi di lavoro stateless", "addestramento ML" → Spot.
- **Gestione delle interruzioni Spot**: Le istanze Spot ricevono un avviso di 2 minuti prima della terminazione. La tua applicazione deve gestirlo in modo elegante (salvare lo stato, disconnettere le connessioni, uscire in modo pulito).
- **On-Demand vs Spot per server web**: I server web che servono il traffico utente in tempo reale NON devono utilizzare Spot (l'interruzione causa richieste fallite). Utilizza On-Demand o Piani di Risparmio per il livello web.
- **EC2 Savings Plans vs Compute Savings Plans**: I Piani di Risparmio EC2 si applicano a una famiglia di istanze specifica e a una regione (sconto più elevato). I Piani di Risparmio su Calcolo si applicano a qualsiasi istanza EC2, Lambda e Fargate (sconto massimo inferiore, maggiore flessibilità).
- **Mercato delle Istance di Riserva**: Le Istance di Riserva Standard inutilizzate possono essere vendute ad altri clienti AWS. Le Istance di Riserva Convertible non possono essere vendute.

## Esercizi

**Esercizio 1 — Ricordo**

Quando le Istance Spot sono appropriate e quando non lo sono? Quale caratteristica rende un carico di lavoro adatto per Spot?

*(Suggerimento: Pensa a cosa succede quando l'istanza viene terminata con 2 minuti di preavviso. Quali carichi di lavoro si riprendono in modo pulito? Quali no?)*

**Esercizio 2 — Esercitazione per l'Esame**

*Scenario*: Un'azienda di media esegue una pipeline di transcodifica video che converte i video caricati in vari formati. I lavori di transcodifica vengono eseguiti continuamente quando i video vengono caricati (operazione 24/7, volume variabile). Ogni lavoro richiede da 5 a 30 minuti. Se un lavoro di transcodifica viene interrotto, il lavoro può essere riavviato dall'inizio senza perdita di dati. L'azienda vuole ridurre al minimo i costi.

Quale modello di prezzi EC2 soddisfa meglio questi requisiti?

A) Istanze On-Demand in un Gruppo di Scalabilità Automatica
B) Istanze di Riserva (1 anno, Tutte in Anticipo)
C) Istanze Spot con Spot Fleet per la diversificazione automatica dell'istanza
D) Host Dedicati con le licenze software esistenti dell'azienda

*(Suggerimento 1: "Può essere riavviato dall'inizio senza perdita di dati" — questa è la frase chiave che abilita un modello di prezzi specifico.*

*(Suggerimento 2: "Ridurre al minimo i costi" con un carico di lavoro interrompibile punta all'opzione con il massimo sconto.*

*(Suggerimento 3: Le richieste Spot Fleet richiedono istanze da più tipi di istanza e zone di disponibilità, riducendo la probabilità di interruzioni massiva.*)

**Risposta**: C

**Spiegazione**: I lavori di transcodifica sono tolleranti ai guasti — possono essere riavviati se interrotti. Questo li rende ideali per le Istanze Spot, che offrono uno sconto del 60-90% rispetto a On-Demand. Spot Fleet diversifica su tipi di istanza e zone di disponibilità, riducendo la probabilità di interruzioni di massa.

**Perché non A?** On-Demand è l'opzione più costosa. Per un'esecuzione continua e tollerante ai guasti, questo è uno spreco.

**Perché non B?** Le Istanze di Riserva forniscono uno sconto del 50-72% ma non offrono il potenziale sconto del 90% delle Istanze Spot per i carichi di lavoro tolleranti ai guasti. Inoltre, le Istanze di Riserva sono per carichi di lavoro stabili e prevedibili — Spot è specificamente progettato per i carichi di lavoro interrompibili.

**Perché non D?** Gli Host Dedicati sono per la conformità alle licenze, non per l'ottimizzazione dei costi. Sono l'opzione più costosa.

*SAA-C03 Dominio: Progettazione di Architetture a Costo Ottimizzato — Attività 4.2*

**Esercizio 3 — Sfida Architetturale** *(Opzionale)*

Nimbus ha questi carichi di lavoro:

1. Server API: 6 istanze, in esecuzione 24/7, stabili da 2 anni, r6g.large
2. Lavori di batch di analisi notturni: 4 istanze, in esecuzione dalle 3:00 alle 6:00 ogni notte, sempre lo stesso tipo di istanza
3. Ambiente di test: 2 istanze, utilizzato dagli ingegneri dalle 9:00 alle 18:00 nei giorni feriali
4. Overflow di picchi di traffico: 0-8 istanze, avviate durante le ore di punta, completamente imprevedibile

Progetta la strategia di prezzo ottimale per ogni tipo di carico di lavoro. Quale importo di impegno per Piani di Risparmio coprirebbe i carichi di lavoro 1 e 2? Per il carico di lavoro 3, c'è una strategia più intelligente rispetto a On-Demand?

*(Non esiste una risposta corretta univoca. L'obiettivo è praticare la strategia di prezzi EC2.)*

## Scena Post-Crediti

Tom ha presentato l'acquisto del Piano di Risparmio.

"5,76 €/ora di impegno. Termine di 3 anni. Piani di Risparmio su Calcolo per la flessibilità."

Il risparmio stimato: 42.500 € in 3 anni.

Maya ha letto il numero. "Quarantaquattro mila e cinquecento euro."

"Confrontato con On-Demand per le stesse istanze, in 3 anni."

"Quanto è costato per fare questo?"

"Una sola serata di analisi," ha detto Tom. "E la decisione di impegnarsi."

"Tre anni è un lungo periodo," ha detto Leo. "Cosa succede se cambiamo il tipo di istanza?"

"I Piani di Risparmio su Calcolo si applicano a qualsiasi tipo di istanza EC2. E in tre anni, saremo grandi abbastanza da far sembrare questa conversazione diversa comunque."

Leo ha pensato a questo.

"Da quanto tempo conosci i Piani di Risparmio?" ha chiesto.

"Da quando abbiamo iniziato," disse Tom. "Stavo aspettando che il carico di lavoro fosse stabile abbastanza da poterlo implementare."

"Diciotto mesi a pagare On-Demand mentre aspettavamo."

"Sì." Tom chiuse il pannello di controllo. "A volte la cosa più costosa che fai è aspettare per risparmiare denaro."

Nel prossimo capitolo: la stessa disciplina applicata ai costi di archiviazione, con alcune sorprese su cosa sta guidando la fattura.
