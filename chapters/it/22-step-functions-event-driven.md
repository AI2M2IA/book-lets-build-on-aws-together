# Capitolo 22: Il Diagramma di Flusso Che Si Esegue da Solo

Una conferma d'ordine su Nimbus richiedeva che cinque cose accadesse in sequenza: addebitare la carta, inviare l'email di conferma, notificare il ristorante, aggiornare l'inventario e registrare la transazione per la contabilità. Se il passaggio tre falliva – se il timeout della notifica al ristorante – i passaggi uno e due erano già avvenuti. Il cliente era stato addebitato. L'email era stata inviata. Ma il ristorante non sapeva che l'ordine esisteva.

Leo aveva un nome per questa categoria di bug: il successo parziale. "Tutto ha funzionato," disse, "eccetto la parte che contava."

"Quante volte è successo?" chiese Maya.

"Undici volte nelle ultime due settimane. Ne abbiamo presi la maggior parte da chiamate arrabbiate al ristorante. Due le abbiamo trovate nei log, a posteriori."

"Quindi non abbiamo coordinamento," disse Priya. "Cinque passaggi, che vengono eseguiti come uno script, senza alcuna garanzia che tutti vengano completati."

"O che vengano completati nell'ordine giusto."

"O che sappiamo quale è fallito."

Leo fece apparire il codice sul proiettore. Era una funzione Python: cinquanta righe, cinque chiamate API sequenziali, un singolo blocco try/except attorno a tutto. "Se qualcosa qui solleva un'eccezione, otteniamo un errore 500 e il cliente vede un errore. Ma gli addebiti e le email non si annullano."

"Abbiamo bisogno di un flusso di lavoro," disse Maya. "Qualcosa che tracci ogni passaggio."

**AWS Step Functions: Orchestrando i Flussi di Lavoro**

**AWS Step Functions** è un servizio di orchestrazione serverless che coordina i passaggi di un'applicazione come un flusso di lavoro visivo. Ogni passaggio è uno **stato** in una **macchina a stati**.

Invece di uno script Python che viene eseguito dall'alto verso il basso e si blocca, si definisce il flusso di lavoro come una macchina a stati JSON/YAML:

```json
{
  "StartAt": "ValidateLicense",
  "States": {
    "ValidateLicense": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:validate-license",
      "Next": "ImportMenu",
      "Catch": [{"ErrorEquals": ["*"], "Next": "OnboardingFailed"}]
    },
    "ImportMenu": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:import-menu",
      "Next": "SetupPayments",
      "Retry": [{"ErrorEquals": ["*"], "MaxAttempts": 3, "IntervalSeconds": 5}]
    },
    ...
  }
}
```

Ecco la traduzione del Markdown in italiano:

Ogni stato può:

- **Eseguire una funzione Lambda** (il pattern più comune)
- **Eseguire un task ECS** (per lavori di lunga durata)
- **Attendere un tempo specifico** o **un evento** (mettere in pausa il flusso di lavoro fino a quando qualcosa di esterno non accade)
- **Scegliere un percorso** in base a condizioni (logica if/else)
- **Eseguire rami paralleli** simultaneamente
- **Riprovare in caso di fallimento** con un backoff configurabile
- **Intercettare errori** e indirizzarli a stati di gestione degli errori

Step Functions gestisce l’esecuzione dello stato in modo persistente. Se il passo 3 fallisce, l’esecuzione si ferma al passo 3. Puoi ispezionare l’esecuzione fallita nel pannello di controllo, risolvere il problema e riavviarla dal passo 3 — senza ripetere i passaggi 1 e 2.

**Tipi di Stato: I Mattoni Fondamentali**

**Task**: Eseguire un’azione — chiamare una funzione Lambda, avviare un task ECS, chiamare un’API. Qui avviene il vero lavoro.

**Choice**: Ramificare in base a condizioni nei dati di input. Come un if/else nel codice.

**Parallel**: Eseguire più rami simultaneamente e attendere che tutti siano completati.

**Map**: Applicare un insieme di stati a ciascun elemento in una lista. Elaborare 50 menu di ristoranti in parallelo.

**Wait**: Attendere per un tempo specificato o fino a quando un timestamp non viene raggiunto. Utile per ritardi programmati.

**Pass**: Passare l’input all’output senza fare nulla. Utilizzato per la trasformazione dei dati e i test.

**Succeed/Fail**: Stati terminali che terminano l’esecuzione.

Per l’onboarding del ristorante, Leo ha progettato un flusso di lavoro:

1.  ValidaLicenza (Task → Lambda)
2.  ImportaMenu (Task → Lambda, con 3 tentativi)
3.  Ramo parallelo:
    a.  SetupPagamenti (Task → Lambda)
    b.  CreaIAMRole (Task → Lambda)
4.  InviaEmailBenvenuto (Task → Lambda, attende il completamento del ramo parallelo)
5.  NotificaTeamVendite (Task → Lambda)

I passaggi 3a e 3b vengono eseguiti in parallelo — non dipendono l’uno dall’altro e l’esecuzione simultanea del risparmia tempo.

**Standard vs Express Workflows**

Step Functions offre due tipi di flusso di lavoro:

**Standard workflows**:

-   Durata massima: 1 anno
-   Le esecuzioni sono durature — lo stato è persistente, può essere ispezionato e controllato
-   Esecuzione "almeno una volta" (ogni task viene eseguito almeno una volta)
-   Prezzo in base allo stato di transizione
-   Ideale per flussi di lavoro di lunga durata, importanti (elaborazione degli ordini, onboarding, flussi di pagamento)

**Express workflows**:

-   Durata massima: 5 minuti
-   Maggiore throughput — fino a 100.000 al secondo
-   "almeno una volta" o "al massimo una volta" (configurabile)
-   Prezzo in base alla durata (come Lambda)
-   Ideale per flussi di lavoro ad alto volume, di breve durata (elaborazione di eventi in tempo reale, ingestione di dati IoT)

Per l’onboarding di Nimbus del ristorante: Standard (è importante, duraturo, potrebbe richiedere ore se sono coinvolti passaggi manuali).

Per gli aggiornamenti dello stato degli ordini in tempo reale di Nimbus: Express (alto volume, breve durata, meno critico).

**Architettura Event-Driven: Il Quadro Generale**

Step Functions è un elemento di un modello più ampio: **architettura event-driven**. Invece che i servizi chiamino direttamente l’uno l’altro (accoppiamento stretto), i servizi emettono eventi e altri servizi reagiscono a tali eventi.

Abbiamo visto questo in tutto il libro:

-   Ordini effettuati → SNS pubblica un evento → code SQS consegnano ai consumatori
-   File S3 caricato → Lambda attivato per elaborarlo
-   Record DynamoDB modificato → DynamoDB Streams → Lambda aggiorna una cache

**Amazon EventBridge** (precedentemente CloudWatch Events) è l'event bus avanzato per questo modello. Instrada eventi da servizi AWS e dalle tue applicazioni a destinazioni (Lambda, SQS, Step Functions, ecc.) in base alle regole.

EventBridge consente un accoppiamento allentato a livello architetturale: il servizio di ordinazione pubblica eventi `order.placed` senza sapere chi sta ascoltando. Il servizio di analisi, il servizio di notifica e il servizio di punti fedeltà ascoltano tutti in modo indipendente. Aggiungere un nuovo ascoltatore non richiede la modifica del servizio di ordinazione.

**Quando Step Functions è lo strumento giusto**

Step Functions eccelle quando hai:

**Flussi di lavoro a più passaggi** che devono tenere traccia dei progressi attraverso i passaggi

**Processi con intervento umano** — Step Functions può attendere indefinitamente un evento esterno (come un umano che approva qualcosa) e quindi continuare

**Gestione degli errori su larga scala** — retry, catch e fallback integrati attraverso molti passaggi

**Processi auditabili** — ogni esecuzione registra ogni transizione di stato. Puoi vedere esattamente cosa è successo e quando.

**Logica parallela o sequenziale complessa** — il flusso di lavoro visivo rende più facile ragionare rispetto a equivalenti di codice

Step Functions è eccessivo per semplici processi a due passaggi. Usalo quando la coordinazione stessa è preziosa e gli scenari di errore sono importanti.

## Punti di Forza e Limitazioni

**Perché Step Functions è potente**:

-   Cronologia di esecuzione visiva — vedi esattamente dove si trova (o è fallito) il flusso di lavoro
-   Retry e gestione degli errori integrati — nessuna codifica personalizzata di retry
-   Stato duraturo — le esecuzioni sopravvivono ai riavvii dei servizi e alle interruzioni
-   Integrazioni dirette con oltre 200 servizi AWS (non solo Lambda)
-   Il flusso di lavoro visivo è auto-documentato

**Dove diventa complicato**:

- I workflow standardizzati sono tarati per transizione di stato — workflow complessi con molti stati possono diventare costosi su larga scala.
- Il formato JSON di ASL (Amazon States Language) ha una curva di apprendimento.
- La dimensione massima del payload è di 256 KB — i dati di grandi dimensioni devono essere trasmessi tramite riferimenti S3, non direttamente tramite il workflow.
- I workflow a lunga esecuzione con molti passaggi manuali richiedono una configurazione di timeout accurata.

## Riepilogo

- **Step Functions** orchestra workflow a più fasi come macchine a stati.
- Ogni **stato** può eseguire una funzione Lambda, eseguire un'attività ECS, attendere, ramificare o eseguire passaggi paralleli.
- **Retry e catch** sono integrati in ogni stato — non è necessario codice di retry personalizzato.
- **Workflow standard**: a lunga esecuzione (fino a 1 anno), durevole, almeno una volta. Per processi aziendali critici.
- **Workflow espressi**: a breve durata (fino a 5 minuti), ad alto throughput. Per l'elaborazione di eventi ad alto volume.
- **Architettura guidata dagli eventi** utilizza servizi come SNS, SQS, Lambda ed EventBridge per disaccoppiare i sistemi attorno agli eventi piuttosto che chiamate dirette.
- Utilizza Step Functions quando la coordinazione dei passaggi è di per sé complessa e quando è importante l'auditabilità.

## Suggerimenti per l'Esame

*Dominio SAA-C03: Progetta Architetture Resilienti (Dominio 2, Task 2.1)*

- **Segnali di utilizzo di Step Functions**: "orchestra più funzioni Lambda", "workflow con retry e gestione degli errori", "passo di approvazione umana in un workflow automatizzato", "traccia di audit di ogni passaggio del workflow" → Step Functions.
- **Standard vs Express**: Standard per workflow a lunga esecuzione, auditabili, critici per il business. Express per l'elaborazione di eventi ad alto throughput, a breve durata.
- **SQS vs Step Functions**: SQS per code di attività semplici (produttore/consumatore). Step Functions per workflow a più fasi con logica complessa, retry e tracciamento dello stato.
- **Segnali di EventBridge**: "instradare eventi da servizi AWS verso target", "integrazione guidata dagli eventi tra servizi", "pianificare l'esecuzione di una funzione Lambda" → EventBridge (precedentemente CloudWatch Events).
- **Pattern di callback**: Step Functions può sospendere l'esecuzione e attendere un callback esterno (un token di attività). Il worker chiama indietro quando è terminato. Utile per attività ECS a lunga esecuzione in cui non si desidera il limite di 15 minuti di Lambda.
- **Integrazioni SDK dirette**: Step Functions può chiamare servizi AWS direttamente (DynamoDB, S3, SQS, ecc.) senza passare attraverso Lambda. Riduce il costo e la latenza per le chiamate di servizio semplici.

## Esercizi

**Esercizio 1 — Richiamo**

Spiega perché Step Functions è utile per i workflow a più fasi. Cosa fornisce che un semplice Lambda che chiama altre Lambda funzioni non fornisce?

*(Suggerimento: Pensa a cosa succede quando il passaggio 3 di 5 fallisce in ciascun approccio. Come sai cosa è successo? Come riesegui solo il passaggio 3?)*

**Esercizio 2 — Esercitazione per l'Esame**

*Scenario*: Un'azienda di servizi finanziari elabora le domande di prestito in più fasi: controllo del credito, verifica del reddito, convalida dei documenti, revisione dell'underwriter (manuale) e notifica della decisione. Ogni fase può richiedere da pochi secondi (controllo del credito) a giorni (revisione dell'underwriter). L'azienda ha bisogno di un registro completo di ogni fase per la conformità. I passaggi automatizzati falliti devono riprovare automaticamente; i passaggi manuali devono attendere e aspettare una decisione umana.

Quale servizio soddisfa meglio questi requisiti?

A) Funzioni AWS Lambda innescate in sequenza con code SQS tra ogni fase
B) Workflow AWS Step Functions Standard con un pattern "Attendere per callback" per il passaggio di revisione dell'underwriter
C) Workflow AWS Step Functions Express per i passaggi automatizzati e SQS FIFO per il passaggio manuale
D) Amazon EventBridge con regole di evento che indirizzano gli eventi tra le funzioni Lambda per ogni fase

*(Suggerimento 1*: "Fino a giorni" di durata — quale tipo di workflow Step Functions supporta questo?)

*(Suggerimento 2*: "Attendere per una decisione umana" — quale pattern di callback Step Functions è progettato per questo?)

*(Suggerimento 3*: "Registro completo di conformità" — quale servizio fornisce la cronologia dello stato per ogni esecuzione?)

**Risposta**: B

**Spiegazione**: Step Functions Standard workflow può eseguire fino a 1 anno, supportando il passaggio di revisione dell'underwriter che può durare giorni. Il pattern "Attendere per callback" sospende l'esecuzione al passaggio dell'underwriter con un token di attività; quando l'underwriter prende una decisione, chiama indietro con il token per continuare il workflow. I workflow standard registrano ogni transizione di stato — registro completo di conformità.

**Perché non A?** Lambda innescate tramite SQS non forniscono alcun tracciamento di stato o registro di audit integrato. I passaggi falliti richiedono logica di retry personalizzata. Riavviare da un passaggio fallito specifico richiede un'implementazione personalizzata.

**Perché non C?** I workflow Express hanno una durata massima di 5 minuti — incompatibile con un passaggio che può durare giorni.

**Perché non D?** EventBridge indirizza gli eventi tra i servizi, ma non mantiene lo stato del workflow né fornisce retry/audit integrati. Costruire questo su EventBridge da solo richiede la gestione dello stato personalizzata.

*Dominio SAA-C03: Progetta Architetture Resilienti — Task 2.1*

**Esercizio 3 — Sfida Architetturale** *(Opzionale)*

Nimbus sta sviluppando un processo di risoluzione delle controversie sulla qualità del cibo. Quando un cliente segnala un'esperienza negativa:

1.  La segnalazione viene automaticamente validata (verifica se l'ordine esiste, se è recente abbastanza)
2.  Il ristorante viene automaticamente informato
3.  Un agente di supporto di Nimbus esamina il reclamo (passo manuale — può richiedere 1-3 giorni lavorativi)
4.  In base alla decisione dell'agente: emetti un rimborso (Lambda → processore di pagamento) OPPURE invia un coupon di scuse (Lambda → servizio coupon) OPPURE inoltra al management (workflow secondario di Step Functions)
5.  Il cliente viene informato dell'esito

Progetta questo come un flusso di lavoro di Step Functions. Che tipo di stato gestisce ogni passaggio? Come gestiresti l'attesa di 1-3 giorni? Come modellaresti la diramazione al passaggio 4?

*(Non esiste una risposta corretta univoca. L'obiettivo è esercitarsi nella progettazione degli stati di Step Functions.)*

## Scena Post-Crediti

Il flusso di lavoro di onboarding del ristorante era in produzione.

Nel corso del mese successivo, 12 nuovi partner ristorativi sono stati a bordo. Due hanno avuto fallimenti durante il passaggio di elaborazione dei pagamenti (passaggio 3). In entrambi i casi, Step Functions ha catturato l'errore esatto, ha salvato lo stato dell'esecuzione e ha inviato un avviso al team di Nimbus.

Leo ha risolto la causa principale (una chiave API configurata in modo errato per il fornitore di pagamenti) e ha riprovato entrambe le esecuzioni dal passaggio 3. Le esecuzioni sono state completate in 23 secondi ciascuna, riprendendo esattamente da dove avevano fallito.

Nessun ristorante ha avuto bisogno di essere reimportato. Nessun ruolo IAM è stato creato in doppioni. Nessun'e-mail di benvenuto duplicata è stata inviata.

"Prima di Step Functions", ha detto Leo a Maya, "questo avrebbe richiesto a qualcuno di tenere traccia manualmente cosa era stato e non era stato fatto per ogni ristorante e di rieseguire manualmente i passaggi mancanti."

"E ora?"

"Ora clicco su 'riprova' nella console. Il sistema sa cosa è stato fatto."

Maya ha pensato a questo.

"Non si tratta solo di un miglioramento tecnico", ha detto. "Si tratta della differenza tra un processo che scala e uno che non lo fa."

Nel prossimo capitolo: cosa fare con i dati che non stai accedendo al momento, ma che vuoi comunque conservare per sempre.
