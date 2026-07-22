# Capitolo 22: Il Diagramma di Flusso Che Si Esegue da Solo

Leo fissava lo stesso file di log da un'ora. I singoli stack trace erano abbastanza chiari, ma il pattern che emergeva nel complesso — il modo in cui un passaggio falliva silenziosamente e quello successivo continuava comunque — ci aveva messo un po' a vederlo. Alla fine si appoggiò allo schienale, posò il caffè e scrisse una sola parola sul suo blocco note: *coordinamento*.

Immagina un direttore d'orchestra che scende dal podio a metà esibizione. L'orchestra continua a suonare — ma non c'è nessuno a portare i fiati alla battuta 47, nessuno a dare il via al silenzio prima del finale. I singoli musicisti suonano correttamente la loro parte. L'esibizione va comunque a pezzi, perché le parti dipendono da un coordinamento che nessuno sta gestendo.

Questo era il problema che Leo aveva trovato nel codice di conferma degli ordini. Non un bug in nessun singolo passaggio. Un fallimento di coordinamento.

---

I container giravano correttamente e facevano il deploy in modo pulito. La pipeline di deployment ECS era solida. Ma all'interno del codice applicativo, un diverso tipo di fallimento si era accumulato per settimane. I container erano a posto. La logica all'interno di uno di essi non lo era.

Leo aveva seguito il pattern nei log ma non lo aveva capito fino a quando non aveva contato le occorrenze.

Undici volte. In due settimane.

---

Una conferma d'ordine su Nimbus richiedeva che cinque cose accadessero in sequenza: addebitare la carta, inviare l'email di conferma, notificare il ristorante, aggiornare l'inventario e registrare la transazione per la contabilità.

Quando Leo aveva scritto la funzione originale di conferma degli ordini, aveva avvolto il tutto in un unico blocco `try/except` e aveva detto "andrà bene — prenderemo gli errori nei log." Era otto mesi prima.

Non era andato bene.

Se il passaggio tre falliva — se il timeout della notifica al ristorante scattava — i passaggi uno e due erano già avvenuti. Il cliente era stato addebitato. L'email era stata inviata. Ma il ristorante non sapeva che l'ordine esistesse.

Leo aveva un nome per questa categoria di bug: il successo parziale. "Tutto ha funzionato," disse, "eccetto la parte che contava."

"Quante volte è successo?" chiese Maya.

"Undici volte nelle ultime due settimane. Ne abbiamo presi la maggior parte da chiamate arrabbiate al ristorante. Due le abbiamo trovate nei log, a posteriori."

"Quindi non abbiamo coordinamento," disse Priya. "Cinque passaggi, eseguiti come uno script, senza alcuna garanzia che vengano tutti completati. E se qualcuno cercasse di intromettersi durante il passaggio due — dopo che l'addebito è andato a buon fine ma prima che il ristorante venga notificato? Abbiamo già fatturato al cliente per un ordine che il ristorante non ha."

"O che vengano completati nell'ordine giusto."

"O che sappiamo quale è fallito."

Leo fece apparire il codice sul proiettore. Era una funzione Python: cinquanta righe, cinque chiamate API sequenziali, un singolo blocco try/except attorno a tutto.

"Abbiamo bisogno di un workflow," disse Maya. "Qualcosa che tracci ogni passaggio. Aspetta — ma *perché* non possiamo semplicemente aggiungere una gestione degli errori migliore alla funzione Python esistente? Perché abbiamo bisogno di un servizio completamente nuovo?"

Pensa a una checklist di produzione — in cui ogni stazione conferma il completamento prima di passare alla successiva, e in cui l'intera linea mantiene la sua posizione quando qualcosa va storto. La linea non riparte dall'inizio. Riprende esattamente dalla stazione che ha fallito. Lo stato di quella stazione è registrato. I passaggi precedenti sono fatti e non vengono ripetuti. I passaggi successivi aspettano finché il problema non viene risolto.

"Perché una gestione degli errori migliore gira comunque in un singolo processo che può fallire in qualsiasi momento," disse Leo. "Se il server si riavvia a metà esecuzione, la gestione degli errori riparte con esso. Step Functions persiste lo stato esternamente."

Questo è ciò di cui il flusso di conferma degli ordini aveva bisogno. Non più codice attorno al problema. Un sistema progettato per gestire il problema.

**AWS Step Functions: Orchestrare i Workflow**

**AWS Step Functions** è un servizio di orchestrazione serverless che coordina i passaggi di un'applicazione come un workflow visivo. Ogni passaggio è uno **stato** in una **macchina a stati**.

Invece di uno script Python che viene eseguito dall'alto verso il basso e si blocca, si definisce il workflow come una macchina a stati JSON/YAML:

```json
{
  "StartAt": "ValidateLicense",
  "States": {
    "ValidateLicense": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:validate-license",
      "Next": "ImportMenu",
      "Catch": [{"ErrorEquals": ["States.ALL"], "Next": "OnboardingFailed"}]
    },
    "ImportMenu": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:import-menu",
      "Next": "SetupPayments",
      "Retry": [{"ErrorEquals": ["States.ALL"], "MaxAttempts": 3, "IntervalSeconds": 5}]
    },
    ...
  }
}
```

Ogni stato può:

- **Eseguire una funzione Lambda** (il pattern più comune)
- **Eseguire un task ECS** (per lavori di lunga durata)
- **Attendere un tempo specifico** o **un evento** (mettere in pausa il workflow finché qualcosa di esterno non accade)
- **Scegliere un percorso** in base a condizioni (logica if/else)
- **Eseguire rami paralleli** simultaneamente
- **Riprovare in caso di fallimento** con un backoff configurabile
- **Intercettare errori** e indirizzarli a stati di gestione degli errori

Step Functions gestisce lo stato di esecuzione in modo durevole. Se il passaggio 3 fallisce, l'esecuzione si ferma al passaggio 3. Puoi ispezionare l'esecuzione fallita nel pannello di controllo, risolvere il problema e riavviarla dal passaggio 3 — senza ripetere i passaggi 1 e 2.

Potresti chiederti: non si può semplicemente scrivere la logica di retry nella funzione Lambda? Sì — ma allora stai anche scrivendo il tracciamento dei fallimenti, la persistenza dello stato e il logging degli audit nel codice. E quando il passaggio 3 di 7 fallisce, devi sapere quale ristorante stava venendo elaborato, cosa era successo prima e da dove riprendere. Step Functions fa tutto questo.

**Il Flusso degli Ordini di Nimbus: Macchina a Stati Annotata**

Ecco una versione semplificata dell'effettiva macchina a stati Step Functions che Nimbus ha costruito per la conferma degli ordini — annotata così da poter vedere cosa fa ogni parte:

```json
{
  "Comment": "Nimbus order confirmation workflow",
  "StartAt": "ChargeCard",
  "States": {
    "ChargeCard": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:charge-card",
      "Next": "SendConfirmationEmail",
      "Retry": [
        {
          "ErrorEquals": ["PaymentRetryableError"],
          "MaxAttempts": 2,
          "IntervalSeconds": 3,
          "BackoffRate": 2.0
        }
      ],
      "Catch": [
        {
          "ErrorEquals": ["PaymentDeclinedError"],
          "Next": "NotifyCustomerOfDecline"
        },
        {
          "ErrorEquals": ["States.ALL"],
          "Next": "ChargeCardFailed"
        }
      ]
    },
    "SendConfirmationEmail": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:send-confirmation-email",
      "Next": "NotifyRestaurant",
      "Retry": [
        {
          "ErrorEquals": ["States.ALL"],
          "MaxAttempts": 3,
          "IntervalSeconds": 5
        }
      ]
    },
    "NotifyRestaurant": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:notify-restaurant",
      "Next": "UpdateInventory",
      "Retry": [
        {
          "ErrorEquals": ["States.ALL"],
          "MaxAttempts": 3,
          "IntervalSeconds": 10,
          "BackoffRate": 2.0
        }
      ],
      "Catch": [
        {
          "ErrorEquals": ["States.ALL"],
          "Next": "RestaurantNotificationFailed"
        }
      ]
    },
    "UpdateInventory": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:update-inventory",
      "Next": "LogTransaction",
      "Retry": [{"ErrorEquals": ["States.ALL"], "MaxAttempts": 2}]
    },
    "LogTransaction": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:log-transaction",
      "End": true
    },
    "NotifyCustomerOfDecline": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:notify-decline",
      "End": true
    },
    "ChargeCardFailed": {
      "Type": "Fail",
      "Error": "ChargeCardFailed",
      "Cause": "Card charge failed after retries"
    },
    "RestaurantNotificationFailed": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:alert-support",
      "Comment": "Alert support team — order charged but restaurant not notified",
      "End": true
    }
  }
}
```

Alcune cose da notare:

**`ChargeCard` ha due clausole Catch.** Una per `PaymentDeclinedError` (un fallimento noto e atteso — la carta è stata rifiutata, non un errore di sistema) e una per `States.ALL` (qualsiasi altra cosa — un'interruzione di sistema, un timeout, un'eccezione imprevista). Vengono indirizzati a stati diversi perché significano cose diverse.

**`NotifyRestaurant` ha un Catch che indirizza a `RestaurantNotificationFailed`.** Questo è il bug che ha causato gli undici incidenti. Nel vecchio script Python non c'era niente di equivalente — se la notifica falliva, la funzione o crashava silenziosamente o registrava un errore e continuava. Step Functions rende esplicito il percorso di fallimento: va da qualche parte di specifico, e quel "da qualche parte" avvisa il team di supporto prima che qualcuno debba chiamare.

**Ogni Task ha Retry.** Se il servizio email ha un timeout transitorio, riprova automaticamente, tre volte, con un backoff crescente. Il cliente non lo vede mai. L'ordine non va perso.

**Il flusso è un grafo, non uno script.** Se `NotifyRestaurant` fallisce definitivamente (dopo i retry), l'esecuzione non continua verso `UpdateInventory`. Il workflow si ferma a `RestaurantNotificationFailed`. L'inventario non viene aggiornato per un ristorante che non sa dell'ordine. Questo è il comportamento corretto.

"Aspetta — ma *perché* abbiamo bisogno di percorsi di fallimento separati per carta rifiutata rispetto a errore di sistema?" chiese Maya.

"Perché richiedono risposte completamente diverse," disse Leo. "Una carta rifiutata significa che mandiamo un'email al cliente chiedendogli di riprovare. Un errore di sistema nella funzione di addebito significa che abbiamo bisogno di un ingegnere che indaghi sul perché la funzione Lambda stia fallendo. Stesso risultato osservabile — l'ordine non è andato a buon fine — ma rimediazione completamente diversa."

**Tipi di Stato: I Mattoni Fondamentali**

**Task**: Eseguire un'azione — chiamare una funzione Lambda, avviare un task ECS, chiamare un'API. Qui avviene il vero lavoro.

**Choice**: Ramificare in base a condizioni nei dati di input. Come un if/else nel codice.

**Parallel**: Eseguire più rami simultaneamente e attendere che tutti siano completati.

**Map**: Applicare un insieme di stati a ciascun elemento in una lista. Elaborare 50 voci del menu di un ristorante in parallelo.

Quando Nimbus importava il menu di un ristorante, il menu poteva contenere da 8 a 200 voci. Per ogni voce, il processo di importazione doveva: validare il formato, verificare i dati sugli allergeni, ridimensionare la foto e scrivere il record su DynamoDB.

Senza lo stato Map, questo sarebbe stato un singolo Lambda che elaborava le voci in sequenza — 200 voci × 200ms per voce = 40 secondi di tempo di elaborazione. Con lo stato Map, Step Functions avvia esecuzioni concorrenti degli stati di elaborazione — fino al limite di concorrenza configurato — e attende che tutte completino. Le stesse 200 voci possono essere completate in meno di 5 secondi.

**Wait**: Attendere per un tempo specificato o fino a un timestamp. Utile per ritardi programmati.

**Pass**: Passare l'input all'output senza fare nulla. Utilizzato per la trasformazione dei dati e i test.

**Succeed/Fail**: Stati terminali che terminano l'esecuzione.

Per l'onboarding del ristorante, Leo progettò un workflow:

1. ValidateLicense (Task → Lambda)
2. ImportMenu (Task → Lambda, con 3 retry)
3. Ramo parallelo:
   a. SetupPayments (Task → Lambda)
   b. CreateIAMRole (Task → Lambda)
4. SendWelcomeEmail (Task → Lambda, attende il completamento del ramo parallelo)
5. NotifySalesTeam (Task → Lambda)

I passaggi 3a e 3b vengono eseguiti in parallelo — non dipendono l'uno dall'altro, e l'esecuzione simultanea fa risparmiare tempo.

Dopo che il primo gruppo di ristoranti aveva completato l'onboarding, emerse un requisito di conformità: prima che un partner ristoratore potesse andare live, un account manager di Nimbus doveva revisionare e approvare manualmente la documentazione della licenza. Questo poteva richiedere da uno a tre giorni lavorativi.

"E se qualcuno cercasse di intromettersi durante quella finestra?" chiese Priya. "Se il ristorante è parzialmente configurato — account di pagamento creato ma non ancora approvato — e qualcuno scopre lo stato di attesa, potrebbe cercare di sfruttare la configurazione semi-aperta."

Più concretamente: come si mette in pausa un workflow Step Functions per tre giorni in attesa di un essere umano?

La risposta è il **pattern callback con task token**.

Quando `ValidateLicense` viene eseguito, invece di completarsi automaticamente, chiama una Lambda che fa tre cose:

1. Invia un'email all'account manager con i documenti del ristorante
2. Registra un **task token** (un identificatore univoco che Step Functions genera per questa specifica esecuzione e stato) in un database, associato a quella revisione in attesa
3. Restituisce il controllo a Step Functions con `.waitForTaskToken` — che dice a Step Functions di mettere in pausa l'esecuzione a questo stato indefinitamente

Step Functions parcheggia l'esecuzione. Niente altro viene bloccato — nessun server rimane in attesa. La macchina a stati si limita ad aspettare, senza consumare risorse di calcolo.

Tre giorni dopo, l'account manager fa clic su "Approva" nello strumento di amministrazione interno. Lo strumento di amministrazione cerca il task token nel database e chiama:

```python
stepfunctions.send_task_success(
    taskToken=token,
    output=json.dumps({"approved": True, "reviewedBy": "dana.cole@eatnimbus.com"})
)
```

Step Functions riprende. L'esecuzione continua dal passaggio 2 (`ImportMenu`), con le informazioni del revisore disponibili nello stato del workflow.

"L'esecuzione era in pausa da tre giorni," disse Leo, "e l'unica cosa che è successa quando l'ho approvata è stata una chiamata API."

"E se l'account manager la rifiuta?" chiese Maya.

"Chiamiamo `send_task_failure` invece. La macchina a stati intercetta questo e indirizza a uno stato `NotifyRejection` che manda un'email al partner ristoratore."

Step Functions non esegue polling. Non riprova. Non va in timeout (a meno che non si imposti un heartbeat timeout). Semplicemente aspetta finché arriva il callback, poi continua. Questo è fondamentalmente diverso dal fare polling su un database o una coda — ed è il motivo per cui Step Functions è adatto per i workflow che mescolano passaggi automatizzati e manuali.

**Leggere la Console di Esecuzione: Com'è un Fallimento**

Quando la Lambda di notifica al ristorante andò in timeout durante la prima settimana di Nimbus su Step Functions, Leo aprì la console di Step Functions e fece clic sull'esecuzione fallita.

La **Cronologia degli eventi di esecuzione** mostrava una timeline di esattamente ciò che era successo:

```
14:23:01.442  ExecutionStarted       {"orderId": "ORD-8812", "restaurantId": "94"}
14:23:01.698  TaskStateEntered       ChargeCard
14:23:02.104  TaskStateExited        ChargeCard — success
14:23:02.201  TaskStateEntered       SendConfirmationEmail
14:23:02.884  TaskStateExited        SendConfirmationEmail — success
14:23:02.901  TaskStateEntered       NotifyRestaurant
14:23:12.901  TaskTimedOut           NotifyRestaurant — attempt 1/3 (Lambda timeout: 10s)
14:23:23.001  TaskTimedOut           NotifyRestaurant — attempt 2/3
14:23:43.001  TaskTimedOut           NotifyRestaurant — attempt 3/3
14:23:43.022  CatchStateEntered      RestaurantNotificationFailed
14:23:43.155  TaskStateEntered       RestaurantNotificationFailed (alert-support Lambda)
14:23:43.640  TaskStateExited        RestaurantNotificationFailed — success
14:23:43.642  ExecutionFailed
```

In 42 secondi, Step Functions aveva addebitato la carta, inviato l'email, tentato la notifica al ristorante tre volte, intercettato il fallimento, avvisato il team di supporto e registrato la cronologia completa. Prima di Step Functions, questo fallimento sarebbe stato invisibile — la funzione Python avrebbe registrato "notifica fallita" e restituito 200 al chiamante come se nulla fosse andato storto.

"La timeline mostra esattamente dove le cose sono andate storte e quando," disse Leo. "E ogni tentativo di retry è con timestamp. Puoi vedere gli intervalli di backoff."

Priya guardò la console. "E questa cronologia viene conservata per quanto tempo?"

La cronologia di esecuzione dei workflow standard viene conservata per 90 giorni. Per conformità o auditing a lungo termine, gli eventi di esecuzione possono anche essere esportati in CloudWatch Logs e conservati indefinitamente.

**Standard vs Express Workflows**

Step Functions offre due tipi di workflow:

**Standard workflows**:

- Durata massima: 1 anno
- Le esecuzioni sono durevoli — lo stato è persistente, può essere ispezionato e controllato
- Esecuzione exactly-once (un task non viene mai eseguito più di una volta a meno che non si configuri un Retry)
- Prezzo per transizione di stato
- Ideale per workflow di lunga durata e importanti (elaborazione degli ordini, onboarding, flussi di pagamento)

**Express workflows**:

- Durata massima: 5 minuti
- Throughput più elevato — fino a 100.000 al secondo
- Esecuzione at-least-once (asincrona) o at-most-once (sincrona) — progetta i task per essere idempotenti
- Prezzo per durata (come Lambda)
- Ideale per workflow ad alto volume e breve durata (elaborazione di eventi in tempo reale, ingestione di dati IoT)

"Quanto costa al mese?" chiese Tom, aprendo la pagina dei prezzi. "Per transizione di stato per Standard — si accumula se hai molti passaggi."

Leo fece i calcoli. Per il workflow di onboarding del ristorante (sei stati task per esecuzione, circa 12-15 nuovi ristoranti al mese): meno di cento transizioni di stato — meno di un centesimo, e interamente all'interno del livello gratuito mensile di 4.000 transizioni, quindi praticamente $0. Per il workflow di conferma degli ordini al traffico pieno di Nimbus: più significativo, ma comunque ben al di sotto del costo di eseguire il debug di undici successi parziali al mese manualmente.

"Il tempo di debug è il costo nascosto," disse Leo.

"È sempre il costo nascosto," disse Tom.

Tom fece i calcoli più attentamente, perché era Tom.

**Costo del workflow Standard per il flusso di conferma degli ordini di Nimbus**: cinque stati per ordine nel percorso felice, a $0,000025 per transizione di stato. Cinque transizioni di stato × $0,000025 × 15.000 ordini al mese = **$1,88/mese**. A dieci volte il volume degli ordini: circa $19/mese. Il costo di debug per un singolo incidente di successo parziale (24 minuti di tempo di un ingegnere di supporto) superava molte volte la fattura mensile di Step Functions.

Il confronto diventa importante se qualcuno suggerisce di usare Standard workflows per eventi analitici ad alta frequenza. Supponiamo che Nimbus volesse usare Step Functions per elaborare ogni evento di clickstream grezzo — ogni visualizzazione di pagina menu, ogni scroll, ogni ricerca. Sono circa 800.000 eventi al giorno alla loro scala attuale. Un workflow Standard a cinque stati per ogni evento: 800.000 × 5 × $0,000025 × 30 giorni = **$3.000/mese**. Sono soldi veri per una pipeline di analisi.

Express workflows per lo stesso volume: prezzo per richiesta più durata, non per transizione di stato. Le 24 milioni di esecuzioni mensili costano $1,00 per milione di richieste = $24. Durata: 24M × 500ms al minimo di fatturazione di 64MB ≈ 208 GB-ore × $0,06 = $12,50. Totale ≈ **$36,50/mese** — quasi due ordini di grandezza più economico rispetto ai $3.000 di Standard.

"Quindi il tipo di workflow non è solo una decisione architetturale," disse Tom. "È una decisione di costo. Lo stesso numero di stati può costare quasi cento volte di più a seconda del tipo di workflow che usi."

"E quale sia il migliore dipende interamente da cosa fa il workflow," disse Leo. "Conferma degli ordini: Standard. È importante, ha percorsi di fallimento significativi, vogliamo l'audit trail. Elaborazione degli eventi analitici: Express. È ad alto volume, breve durata, e non abbiamo bisogno di 90 giorni di cronologia di esecuzione per ogni visualizzazione di pagina."

Se il tuo processo ha due passaggi e non ha bisogno di un audit trail, una semplice funzione Lambda è più economica e non richiede la sintassi JSON della macchina a stati — ma se qualsiasi passaggio può fallire indipendentemente e deve essere riprovato o riavviato senza ripetere quelli precedenti, Step Functions ripaga in debug ridotto e rimediazione manuale.

Per l'onboarding dei ristoranti di Nimbus: Standard (è importante, durevole, può richiedere ore se sono coinvolti passaggi manuali).

Per gli aggiornamenti dello stato degli ordini in tempo reale di Nimbus: Express (alto volume, breve durata, meno critico).

**Architettura Event-Driven: Il Quadro Generale**

Step Functions è un elemento di un pattern più ampio: **architettura event-driven**. Invece che i servizi si chiamino direttamente l'uno con l'altro (accoppiamento stretto), i servizi emettono eventi e altri servizi reagiscono a quegli eventi.

Abbiamo visto questo in tutto il libro:

- Ordini effettuati → SNS pubblica un evento → le code SQS consegnano ai consumatori
- File S3 caricato → Lambda attivato per elaborarlo
- Record DynamoDB modificato → DynamoDB Streams → Lambda aggiorna una cache

**Amazon EventBridge** (precedentemente CloudWatch Events) è l'event bus avanzato per questo pattern. Instrada eventi da servizi AWS e dalle tue applicazioni a destinazioni (Lambda, SQS, Step Functions, ecc.) in base a regole.

EventBridge consente un accoppiamento allentato a livello architetturale: il servizio degli ordini pubblica eventi `order.placed` senza sapere chi sta ascoltando. Il servizio di analisi, il servizio di notifica e il servizio di punti fedeltà ascoltano tutti in modo indipendente. Aggiungere un nuovo listener non richiede di modificare il servizio degli ordini.

EventBridge si integra nativamente con decine di servizi AWS come **sorgenti di eventi**. Quando una chiamata API CloudTrail corrisponde a un pattern, EventBridge può attivare una regola. Quando un'istanza EC2 cambia stato, EventBridge può attivare una Lambda. Quando un'istanza RDS va in failover, EventBridge può avvisare l'ingegnere di turno. Puoi trattare l'intero piano di controllo AWS come uno stream di eventi.

Per Nimbus, una regola EventBridge particolarmente utile: attivare una Lambda ogni volta che una nuova immagine viene inviata all'ECR. La Lambda controlla il risultato della scansione dell'immagine e pubblica sul canale Slack dell'ingegneria se vengono trovate CVE HIGH o CRITICAL — prima che qualcuno faccia il deploy dell'immagine. Questo combina la scansione di sicurezza di ECR (dal capitolo 21) con il routing degli eventi di EventBridge in un gate di sicurezza automatizzato.

Il principio dell'architettura event-driven è lo stesso della logica di retry di Step Functions: rendere espliciti i fallimenti e indirizzarli, non silenziosi e inghiottiti. I servizi che comunicano attraverso gli eventi falliscono in modo elegante — se la Lambda dei punti fedeltà è giù quando un evento `OrderConfirmed` viene inviato, EventBridge può riprovare la consegna o inviare a una dead-letter queue. La conferma dell'ordine stessa non è interessata. Il disaccoppiamento è la resilienza.

**EventBridge: Disaccoppiare gli Effetti Collaterali dal Flusso Principale**

Dopo che la macchina a stati di conferma degli ordini girava in modo pulito, Maya sollevò una domanda alla successiva review dell'architettura.

"Vogliamo aggiungere punti fedeltà quando un ordine viene confermato. Il cliente ottiene un punto per ogni dollaro speso. Dove va nella macchina a stati?"

Il primo istinto di Leo: aggiungere uno stato `GrantLoyaltyPoints` dopo `LogTransaction`.

La risposta di Priya: "E poi quando aggiungiamo i bonus di referral? E i sondaggi post-ordine? E le richieste di valutazione del ristorante? Ognuno aggiunge uno stato al percorso critico. Se la Lambda dei punti fedeltà fallisce, l'intera conferma dell'ordine fallisce."

"Il flusso di conferma degli ordini dovrebbe fare una cosa," disse. "Confermare l'ordine. Tutto il resto è un effetto collaterale."

Questo è l'argomento architetturale per **Amazon EventBridge** come meccanismo per il disaccoppiamento degli effetti collaterali dal workflow principale.

L'approccio rivisto: quando lo stato `LogTransaction` si completa con successo, la Lambda pubblica un evento su EventBridge:

```json
{
  "source": "nimbus.orders",
  "detail-type": "OrderConfirmed",
  "detail": {
    "orderId": "ORD-8812",
    "customerId": "CUST-441",
    "restaurantId": "94",
    "total": 3200,
    "timestamp": "2024-03-15T14:23:43Z"
  }
}
```

Poi le regole di EventBridge indirizzano quell'evento a destinazioni indipendenti:

- **Regola 1**: `OrderConfirmed` → Lambda Punti Fedeltà (assegna 32 punti per un ordine da $32)
- **Regola 2**: `OrderConfirmed` → Lambda Sondaggio Post-Ordine (mette in coda un sondaggio 2 ore dopo la consegna)
- **Regola 3**: `OrderConfirmed` → Kinesis Stream Analytics (alimenta il dashboard in tempo reale)

Ogni regola è indipendente. La Lambda dei punti fedeltà può fallire senza influenzare la coda del sondaggio. La pipeline di analisi può essere in ritardo senza bloccare il sistema fedeltà. Aggiungere un nuovo effetto collaterale (una richiesta di valutazione del ristorante, una notifica cashback) richiede di creare una nuova regola EventBridge — non di modificare la macchina a stati.

"E se qualcuno cercasse di intromettersi attraverso una regola EventBridge?" chiese Priya. "Se l'evento contiene PII del cliente, ogni Lambda che lo riceve è ora un punto di accesso PII."

L'evento era stato progettato attentamente: solo gli ID, non i nomi, gli indirizzi o i dati di pagamento. Qualsiasi Lambda che avesse bisogno dei dati del cliente li avrebbe cercati nel database usando l'ID cliente — con le proprie autorizzazioni IAM che controllano cosa poteva accedere.

"L'evento è un segnale," disse Priya. "Non un dump di dati."

**Quando Step Functions è lo Strumento Giusto**

Step Functions eccelle quando hai:

**Workflow a più passaggi** che devono tracciare i progressi attraverso i passaggi

**Processi con intervento umano** — Step Functions può attendere indefinitamente un evento esterno (come un essere umano che approva qualcosa) e poi continuare

**Gestione degli errori su larga scala** — logica di retry, catch e fallback integrata attraverso molti passaggi

**Processi auditabili** — ogni esecuzione registra ogni transizione di stato. Puoi vedere esattamente cosa è successo e quando.

**Logica parallela o sequenziale complessa** — il workflow visivo rende più facile ragionare rispetto al codice equivalente

Step Functions è eccessivo per semplici processi a due passaggi. Usalo quando il coordinamento stesso è prezioso e gli scenari di fallimento sono importanti.

**Quando Step Functions è lo Strumento Sbagliato**

"Aspetta — ma *perché* non useremmo Step Functions per tutto?" chiese Maya alla fine della sessione di progettazione. "Abbiamo costruito il workflow di onboarding del ristorante. Abbiamo il flusso di conferma degli ordini. Perché non convertire tutto in macchine a stati?"

La risposta onesta: perché Step Functions aggiunge un overhead che non ogni workflow giustifica.

**Semplici processi a due passaggi**: Se hai una Lambda che elabora un file caricato chiamando una seconda Lambda, l'overhead di coordinamento di una macchina a stati non vale il beneficio operativo. Due Lambda chiamate sequenzialmente all'interno di una singola funzione è più semplice, più facile da testare e non ha alcun costo per transizione di stato.

**Workflow ultra-ad alta frequenza e sub-secondo**: I workflow Standard hanno un costo per transizione di stato non trascurabile che si accumula ad alto volume (come ha mostrato l'esempio dei analytics sopra). I workflow Express risolvono il problema del costo ma non forniscono una cronologia dello stato durevole. Ad alta frequenza molto elevata con durata molto breve, SQS più Lambda (il pattern del capitolo 19) è più semplice e più economico di entrambi i tipi di Step Functions.

**Fan-out puro senza coordinamento**: Se hai bisogno di inviare lo stesso evento a venti consumatori e non ti interessa il risultato di ciascuno, SNS è lo strumento. Step Functions aggiunge il tracciamento dello stato di cui non hai bisogno e per cui pagheresti inutilmente.

**Interazioni utente sincrone in tempo reale**: Le esecuzioni di Step Functions sono asincrone. Se un utente sta aspettando a una schermata di checkout una risposta sincrona in meno di 500ms, un workflow Standard di Step Functions non è progettato per questo (i workflow Express possono essere invocati in modo sincrono, ma l'overhead di latenza è comunque più alto di una chiamata Lambda diretta). Per i flussi sincroni rivolti agli utenti, Lambda + API Gateway con una gestione degli errori ben progettata è spesso più appropriato.

Il principio: usa Step Functions quando il *coordinamento* dei passaggi è di per sé complesso — quando i passaggi possono fallire indipendentemente, quando hai bisogno di riprovare singoli passaggi senza ripetere quelli precedenti, quando la cronologia di esecuzione ha valore di conformità o debug, o quando il workflow coinvolge passaggi di approvazione umana che potrebbero richiedere giorni. Non usarlo per aggiungere overhead di orchestrazione alla logica sequenziale semplice che funziona bene come singola funzione.

## Punti di Forza e Limitazioni

**Perché Step Functions è potente**:

- Cronologia di esecuzione visiva — vedi esattamente dove si trova un workflow (o dove è fallito)
- Retry e gestione degli errori integrati — nessun codice di retry personalizzato
- Stato durevole — le esecuzioni sopravvivono ai riavvii dei servizi e alle interruzioni
- Integrazioni dirette con oltre 200 servizi AWS (non solo Lambda)
- Il workflow visivo è auto-documentato
- Il pattern callback consente un'attesa indefinita per azioni umane senza consumare risorse di calcolo

**Dove diventa complicato**:

- I workflow Standard sono prezzati per transizione di stato — workflow complessi con molti stati possono diventare costosi su larga scala
- Il formato JSON di ASL (Amazon States Language) ha una curva di apprendimento
- La dimensione massima del payload è 256KB — i dati grandi devono essere passati tramite riferimenti S3, non direttamente attraverso il workflow
- I workflow di lunga durata con molti passaggi manuali richiedono una configurazione attenta dei timeout
- Il debug degli errori ASL richiede l'esecuzione di esecuzioni; non esiste un emulatore locale altrettanto capace del servizio reale
- Le autorizzazioni IAM devono essere concesse separatamente per ogni risorsa che la macchina a stati chiama — dimenticare un'autorizzazione causa un errore confuso a runtime

## Riepilogo

I container del capitolo 21 hanno reso i deployment affidabili. Step Functions rende i processi aziendali a più passaggi affidabili — lo stesso principio di "eliminare il rischio del passaggio di consegna" applicato alla logica applicativa.

- **Step Functions** orchestra workflow a più passaggi come macchine a stati. Ogni **stato** può eseguire una funzione Lambda, un task ECS, attendere, ramificare o eseguire passaggi paralleli.
- **Retry e catch** sono integrati in ogni stato — nessun codice di retry personalizzato necessario.
- **Standard workflows**: lunga durata (fino a 1 anno), durevoli, exactly-once, prezzati per transizione di stato ($0,000025 — conferma degli ordini a $1,88/mese per Nimbus) — per processi aziendali critici. **Express workflows**: breve durata (fino a 5 minuti), alto throughput, prezzati per richiesta più durata — per eventi ad alta frequenza dove Standard costerebbe decine di volte di più (~80x nei calcoli del clickstream di Nimbus).
- **Pattern callback con task token**: metti in pausa un workflow indefinitamente in attesa di un evento esterno o di un'azione umana; riprendi con una singola chiamata API.
- **Stato Map**: elabora un elenco di elementi in modo concorrente — sostituisci i loop sequenziali con fan-out parallelo. **Integrazioni SDK dirette**: chiama DynamoDB, S3, SQS e oltre 200 servizi AWS direttamente da uno stato, senza un wrapper Lambda.
- **EventBridge** è il cuore dell'**architettura event-driven**: disaccoppia gli effetti collaterali dal workflow principale — pubblica un singolo evento, lascia che regole indipendenti lo indirizzino ai punti fedeltà, all'analisi e ai servizi di sondaggio senza modificare la macchina a stati centrale.
- Usa Step Functions quando il coordinamento dei passaggi è di per sé complesso e quando l'auditabilità conta. Non usarlo per semplici sequenze a due passaggi, workflow ultra-ad alta frequenza, fan-out puro o flussi sincroni rivolti agli utenti.

## Suggerimenti per l'Esame

*Dominio SAA-C03: Progettare Architetture Resilienti (Dominio 2, Task 2.1)*

- **Segnali di utilizzo di Step Functions**: "orchestra più funzioni Lambda", "workflow con retry e gestione degli errori", "passaggio di approvazione umana in un workflow automatizzato", "audit trail di ogni passaggio del workflow" → Step Functions.
- **Standard vs Express**: Standard per workflow di lunga durata, auditabili, critici per il business. Express per l'elaborazione di eventi ad alto throughput e breve durata.
- **SQS vs Step Functions**: SQS per code di task semplici (produttore/consumatore). Step Functions per workflow a più passaggi con logica complessa, retry e tracciamento dello stato.
- **Segnali di EventBridge**: "instradare eventi da servizi AWS a destinazioni", "integrazione event-driven tra servizi", "pianificare una funzione Lambda" → EventBridge (precedentemente CloudWatch Events).
- **Pattern callback**: Step Functions può sospendere l'esecuzione e attendere un callback esterno (un task token). Il worker richiama quando ha finito. Utile per task ECS di lunga durata in cui non vuoi il limite di 15 minuti di Lambda.
- **Integrazioni SDK dirette**: Step Functions può chiamare i servizi AWS direttamente (DynamoDB, S3, SQS, ecc.) senza passare per Lambda. Riduce il costo e la latenza per chiamate di servizio semplici. Ad esempio, scrivere un record di ordine su DynamoDB può essere una chiamata SDK diretta dalla macchina a stati senza una funzione Lambda: `"Resource": "arn:aws:states:::dynamodb:putItem"`. Questo elimina il cold start di Lambda, il costo di esecuzione di Lambda e il codice che chiama semplicemente `dynamodb.put_item(...)` e restituisce.

## Esercizi

**Esercizio 1 — Ricordo**

Spiega perché Step Functions è utile per i workflow a più passaggi. Cosa fornisce che un semplice Lambda che chiama altre Lambda non fornisce?

*(Suggerimento: Pensa al diagramma di flusso che si esegue da solo — ricorda esattamente in quale casella si è fermato, così quando il passaggio 3 di 5 fallisce puoi riprendere dal passaggio 3 invece di rieseguire l'intero diagramma.)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: Un'azienda di servizi finanziari elabora le domande di prestito in più passaggi: verifica del credito, verifica del reddito, validazione dei documenti, revisione dell'underwriter (manuale) e notifica della decisione. Ogni passaggio può richiedere da pochi secondi (verifica del credito) a giorni (revisione dell'underwriter). L'azienda ha bisogno di un audit trail completo di ogni passaggio per la conformità. I passaggi automatizzati falliti devono riprovare automaticamente; i passaggi manuali devono mettersi in pausa e attendere una decisione umana.

Quale servizio soddisfa MEGLIO questi requisiti?

A) Funzioni AWS Lambda concatenate tra loro con code SQS tra ogni passaggio
B) AWS Step Functions Standard workflows con un pattern Wait for callback per il passaggio di revisione dell'underwriter
C) AWS Step Functions Express workflows per i passaggi automatizzati e SQS FIFO per il passaggio manuale
D) Amazon EventBridge con regole evento che indirizzano tra funzioni Lambda per ogni passaggio

**Suggerimento 1**: Durata "fino a giorni" — quale tipo di Step Functions la supporta?

**Suggerimento 2**: "Attendere una decisione umana" — quale pattern di Step Functions è progettato per questo?

**Suggerimento 3**: "Audit trail completo per la conformità" — quale servizio fornisce la cronologia dello stato per esecuzione?

**Risposta**: B

**Spiegazione**: I workflow Standard di Step Functions possono essere eseguiti fino a 1 anno, supportando il passaggio di revisione dell'underwriter che può durare giorni. Il pattern Wait for callback sospende l'esecuzione al passaggio dell'underwriter con un task token; quando l'underwriter prende una decisione, richiama con il token per continuare il workflow. I workflow Standard registrano ogni transizione di stato — audit trail completo per la conformità.

**Perché non A?** Lambda concatenate tramite SQS non forniscono alcun tracciamento dello stato o audit trail integrato. I passaggi falliti richiedono logica di retry personalizzata. Riavviare da un passaggio specifico fallito richiede un'implementazione personalizzata.

**Perché non C?** I workflow Express hanno una durata massima di 5 minuti — incompatibile con un passaggio che può durare giorni.

**Perché non D?** EventBridge instrada eventi tra servizi ma non mantiene lo stato del workflow né fornisce retry/audit integrati. Costruire questo su EventBridge da solo richiede una gestione dello stato personalizzata.

*Dominio SAA-C03: Progettare Architetture Resilienti — Task 2.1*

**Esercizio 3 — Sfida di Architettura** *(Opzionale)*

Nimbus sta costruendo un processo di risoluzione delle controversie sulla qualità del cibo. Quando un cliente segnala un'esperienza negativa:

1. La segnalazione viene automaticamente validata (verifica se l'ordine esiste, se è recente abbastanza)
2. Il ristorante viene automaticamente notificato
3. Un agente di supporto di Nimbus esamina il reclamo (passaggio manuale — può richiedere 1-3 giorni lavorativi)
4. In base alla decisione dell'agente: emetti un rimborso (Lambda → processore di pagamento) OPPURE invia un coupon di scuse (Lambda → servizio coupon) OPPURE scala al management (sub-workflow Step Functions)
5. Il cliente viene notificato dell'esito

Progetta questo come un workflow Step Functions. Che tipo di stato gestisce ogni passaggio? Come gestiresti l'attesa di 1-3 giorni? Come modelleresti la ramificazione al passaggio 4?

*(Non esiste una risposta corretta univoca. L'obiettivo è esercitarsi nella progettazione degli stati di Step Functions.)*

**Estensione**: Dopo che la macchina a stati si completa (qualunque sia il ramo), pubblica un evento `OrderDisputeResolved` su EventBridge. Quali effetti collaterali potrebbero ascoltare questo evento? Considera: il sistema di valutazione del ristorante, i punti fedeltà del cliente (i rimborsi potrebbero sottrarre punti), la pipeline di analisi (il tasso di controversie è una metrica chiave di qualità del ristorante) e il dashboard di tracciamento degli SLA del team di supporto clienti. Come fa l'utilizzo di EventBridge qui a evitare che la macchina a stati delle controversie diventi una ragnatela di dipendenze?

## Scena Post-Crediti

Il workflow di onboarding del ristorante era live.

Nel corso del mese successivo, 12 nuovi partner ristoratori completarono l'onboarding. Due ebbero fallimenti durante il passaggio di elaborazione dei pagamenti (passaggio 3). In entrambi i casi, Step Functions catturò l'errore esatto, salvò lo stato dell'esecuzione e inviò un avviso al team di Nimbus.

Leo risolse la causa principale (una chiave API configurata in modo errato per il fornitore di pagamenti) e riprovò entrambe le esecuzioni dal passaggio 3. Le esecuzioni si completarono in 23 secondi ciascuna, riprendendo esattamente da dove avevano fallito.

Nessun ristorante dovette essere reimportato. Nessun ruolo IAM fu creato in duplicato. Nessuna email di benvenuto duplicata fu inviata.

"Prima di Step Functions," disse Leo a Maya, "questo avrebbe richiesto a qualcuno di tracciare manualmente cosa era stato e non era stato fatto per ogni ristorante, e di rieseguire manualmente i passaggi mancanti."

"E ora?"

"Ora clicco su retry nella console. Il sistema sa cosa è fatto."

Maya ci pensò su.

"Non è solo un miglioramento tecnico," disse. "È la differenza tra un processo che scala e uno che non lo fa."

Dall'altra parte della stanza, Tom alzò gli occhi da un grafico di storage che andava solo verso l'alto. "E cosa facciamo con tutti i record che questi workflow lasciano dietro?"

Nel prossimo capitolo: cosa fare con i dati che non stai accedendo in questo momento, ma che vuoi assolutamente conservare per sempre.
