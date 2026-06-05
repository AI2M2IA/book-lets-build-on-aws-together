# Capitolo 19: La Macchina dei Biglietti

La macchina dei biglietti era una rivoluzione silenziosa. Prendi un numero, aspetta di essere chiamato. La coda diventava una fila. Le persone potevano sedersi. Il bancone del servizio funzionava al proprio ritmo. Nessuno bloccava gli altri.

Nimbus aveva un problema che non sembrava un problema finché gli ordini non divennero popolari.

Ogni volta che veniva effettuato un ordine, il server API doveva:

1. Salvare l'ordine nel database
2. Inviare una notifica al tablet del ristorante
3. Inviare un'e-mail di conferma al cliente
4. Aggiornare il pannello di controllo delle analisi del ristorante
5. Registrare l'evento per la fatturazione

Tutti questi dovevano avvenire in modo sincrono prima che l'API potesse rispondere al cliente. Se il servizio di posta elettronica era lento (a volte lo era), il cliente aspettava. Se il pannello di controllo delle analisi era inattivo (a volte lo era), l'ordine falliva.

"Siamo strettamente accoppiati", disse Priya. "Se un passaggio a valle fallisce, l'intero ordine fallisce."

"Cosa succede se potessimo salvare l'ordine e confermare immediatamente al cliente", disse Leo, "e poi elaborare il resto in background?"

"È una coda", disse Priya.

**Il Modello del Bancone del Deli**

In un bancone del deli affollato, la persona alla cassa non aspetta che il taglierino finisca di tagliare prima di passare al prossimo cliente. Prende l'ordine, lo passa alla cucina e inizia a servire la prossima persona. La cucina lavora attraverso gli ordini al proprio ritmo.

Il cliente riceve un servizio più veloce. La cucina non viene sopraffatta da improvvisi picchi. Se la cucina ha un momento lento, gli ordini si accumulano nella coda piuttosto che causare errori alla cassa.

Questo è **decoupling**: separare il componente che accetta il lavoro dai componenti che lo elaborano.

Nei sistemi software, la coda è spesso un message broker – un servizio che accetta messaggi dai produttori e li consegna ai consumatori.

**Amazon SQS: La Coda**

**Amazon SQS (Simple Queue Service)** è il servizio di coda di messaggi gestito da AWS. Memorizza i messaggi in modo duraturo fino a quando non vengono elaborati da un consumatore.

Il flusso di base:

1. **Produttore** (il server API) mette un messaggio nella coda: `{ "orderId": "ORD-5532", "restaurantId": "47", "items": [...] }`
2. L'API risponde immediatamente al cliente: "Ordine confermato!"
3. **Consumatori** (servizi di lavoro separati) leggono i messaggi dalla coda e li elaborano: inviano la notifica al ristorante, inviano l'e-mail di conferma, aggiornano le analisi

L'esperienza del cliente: conferma immediata. L'elaborazione a valle: avviene in modo asincrono, al ritmo dei lavoratori.

**Concetti Chiave SQS**

**Timeout di visibilità del messaggio**: quando un consumatore legge un messaggio dalla SQS, il messaggio diventa *invisibile* ad altri consumatori per un periodo (predefinito: 30 secondi). Questo dà al consumatore il tempo di elaborarlo. Se il consumatore finisce con successo, lo elimina. Se il consumatore si blocca, il timeout di visibilità scade e il messaggio diventa di nuovo visibile per un altro consumatore per riprovare.

Questo garantisce la consegna almeno una volta: ogni messaggio verrà elaborato almeno una volta, anche se un consumatore fallisce durante l'elaborazione.

**Code di morte (DLQ)**: se un messaggio fallisce l'elaborazione troppe volte (configurabile - ad esempio, 5 tentativi), SQS lo sposta in una coda di morte. Si ispeziona la DLQ per capire perché i messaggi stanno fallendo senza perderli.

**Tipi di coda**:

**Code standard**: throughput massimo (numero illimitato di messaggi al secondo). L'ordine di consegna è di "best effort" (non garantito). Consegna almeno una volta (molto raramente, un messaggio potrebbe essere consegnato due volte).

**Code FIFO**: ordinamento "first-in, first-out" rigoroso. Consegna esattamente una volta. Limitato a 3.000 messaggi al secondo con il batching, 300 senza. Utilizzato quando l'ordine conta (transazioni finanziarie, modifiche di stato sequenziali).

Per Nimbus, la maggior parte delle code utilizzava code standard. La coda di fatturazione utilizzava una coda FIFO per garantire che le tariffe fossero elaborate in ordine.

**Amazon SNS: Il Trasmettitore**

**Amazon SNS (Simple Notification Service)** è un servizio di messaggi publish/subscribe (pub/sub). Invece di un singolo produttore, un singolo consumatore (coda), SNS supporta la consegna di un singolo messaggio a *molti* abbonati contemporaneamente.

Il modello:

1. Un **pubblicatore** invia un messaggio a un **argomento** SNS
2. Tutti gli **abbonati** a quell'argomento ricevono il messaggio simultaneamente (fan-out)

Gli abbonati possono essere:

- Code SQS (spinge il messaggio alla sua coda per l'elaborazione asincrona)
- Funzioni Lambda (avvia la funzione direttamente)
- Endpoint HTTP/HTTPS (consegna webhook)
- Indirizzi e-mail
- Numeri di telefono SMS

Per Nimbus, l'evento di ordine effettuato viene pubblicato a un argomento SNS chiamato `order-events`:

- Il servizio di notifica del ristorante si abbona (riceve sulla sua coda SQS)
- Il servizio di posta elettronica si abbona (riceve sulla sua coda SQS)
- Il servizio di analisi si abbona (riceve sulla sua coda SQS)
- Il servizio di fatturazione si abbona (riceve sulla sua coda FIFO SQS)

Un singolo evento di ordine. Quattro abbonati. Tutti notificati simultaneamente. Ognuno elabora al proprio ritmo.

"Quindi SNS è l'annuncio", disse Maya, "e SQS è la casella di posta dove ogni team elabora l'annuncio al proprio ritmo."

"Esattamente," disse Leo. "Il modello SNS/SQS con 'fan-out' è il pattern standard."

**Il Modello SNS/SQS con 'Fan-Out'**

Questa combinazione – un topic SNS che alimenta più code SQS – è uno dei pattern architetturali più importanti di AWS:

```
API Server
    |
    | publishes to
    ↓
SNS Topic: "order-placed"
    |
    |—————————————————|—————————————————|
    ↓                 ↓                 ↓
SQS Queue         SQS Queue         SQS Queue
(notifications)  (email service)   (analytics)
    |                 |                 |
    ↓                 ↓                 ↓
Worker             Worker            Worker
Lambda/EC2        Lambda/EC2        Lambda/EC2
```

Ogni coda è indipendente. Il servizio di analisi può essere lento — la sua coda si riempie, ma i servizi di notifica e posta elettronica continuano inalterati. Se il servizio di analisi va offline, i suoi messaggi attendono nella coda finché non torna online. Nulla va perso.

Questa è la proprietà chiave: **guasto indipendente**. I problemi in un consumatore non si propagano agli altri.

**Filtraggio dei Messaggi: Non Ogni Messaggio per Ogni Abbonato**

Quando i sistemi crescono, non si vuole che ogni abbonato elabori ogni messaggio. Un servizio di notifica per ristoranti non dovrebbe ricevere messaggi su elaborazioni di pagamento fallite se si preoccupa solo degli ordini completati.

**Il filtraggio dei messaggi SNS** consente agli abbonati di specificare politiche di filtro — consegnare solo i messaggi che corrispondono a determinati attributi.

Il servizio di notifica per ristoranti si abbona con un filtro: solo messaggi dove `status = "confermato"`.

Il servizio di avvisi di errore si abbona con un filtro: solo messaggi dove `status = "fallito"`.

Ogni abbonato riceve solo ciò di cui ha bisogno.

**Quando Usare SQS vs SNS**

**SQS da solo**: Un produttore, un consumatore (o più consumatori concorrenti sulla stessa coda). I messaggi devono essere elaborati una sola volta, in ordine (FIFO) o meno (standard). Modello di coda di lavoro — una coda, più lavoratori che consumano da essa.

**SNS da solo**: Notifiche "fire and forget". Inviare a email, SMS o endpoint HTTP. Non è necessario mettere in coda il messaggio — solo notificare e andare avanti.

**SNS + SQS (fan-out)**: Un evento, più consumatori indipendenti. Ogni consumatore ha la propria coda, elabora in modo indipendente e può fallire in modo indipendente.

## Punti di Forza e Limitazioni

**Perché SQS e SNS sono potenti**:

- SQS fornisce una consegna di messaggi duratura e affidabile — i messaggi sono memorizzati su più AZ
- Il decentramento consente di scalare e distribuire in modo indipendente i servizi produttore e consumatore
- Le code di morte assicurano che nessun messaggio vada perso in caso di errore
- Il modello di fan-out SNS consente di aggiungere nuovi consumatori senza modificare il produttore

**Dove si complica**:

- La consegna "almeno una volta" significa che i consumatori devono essere *idempotenti* — elaborare lo stesso messaggio due volte non deve causare problemi (ordini duplicati, addebiti duplicati)
- Le code FIFO sono più costose e hanno limiti di throughput
- La risoluzione dei messaggi falliti su più code e servizi richiede una buona registrazione e osservabilità
- Le garanzie di ordinamento dei messaggi sono limitate — se l'ordinamento è rigoroso su più servizi, il design diventa complesso

## Riepilogo

- **Decoupling** separa i componenti che producono il lavoro dai componenti che lo elaborano.
- **SQS** è una coda gestita. I produttori inviano messaggi; i consumatori leggono e li elaborano in modo asincrono.
- **SQS Standard**: elevato throughput, ordinamento di "miglior impegno", consegna "almeno una volta".
- **SQS FIFO**: ordinamento rigoroso, consegna "esattamente una volta", throughput inferiore.
- **SNS** è un servizio pub/sub. Un messaggio, molti abbonati che lo ricevono simultaneamente.
- **SNS + SQS fan-out**: il modello standard per un evento che innesca più pipeline di elaborazione indipendenti.
- **Code di morte**: catturano i messaggi che falliscono l'elaborazione dopo troppe tentativi.
- **Idempotenza**: progettare i consumatori per elaborare in modo sicuro messaggi duplicati.

## Suggerimenti per l'Esame

*SAA-C03 Dominio: Progettare Architetture Resilienti (Dominio 2, Attività 2.1)*

- **SQS Standard vs FIFO**: l'esame distingue per ordinamento e garanzie di consegna. "Devi elaborare in ordine" → FIFO. "Massimo throughput" → Standard.
- **Timeout di visibilità**: concetto chiave per la consegna "almeno una volta". Se un consumatore fallisce, il messaggio diventa di nuovo visibile dopo il timeout. Scenario d'esame: "i messaggi vengono elaborati due volte" → il timeout di visibilità è troppo breve (il consumatore impiega più tempo del timeout per elaborare).
- **Code di morte**: messaggi che falliscono dopo N tentativi vengono spostati qui. Scenario d'esame: "assicura che nessun messaggio vada perso, anche se l'elaborazione fallisce ripetutamente" → DLQ.
- **Fan-out SNS**: modello classico d'esame per un evento che innesca più consumatori. "La notifica dell'ordine effettuato deve attivare email, SMS e aggiornamento dell'inventario simultaneamente" → Topic SNS con sottoscrizioni SQS.
- **SQS + Lambda**: Lambda può essere configurato per interrogare una coda SQS e attivarsi su ogni batch di messaggi. Scenario d'esame: questo viene utilizzato per l'elaborazione guidata da eventi su larga scala.
- **Polling a lungo di SQS**: invece che i consumatori interrogassero ogni pochi secondi (interrogazione breve, spreca chiamate API), il polling a lungo attende fino a 20 secondi per un messaggio. Riduce i costi e le risposte vuote false.

## Esercizi

**Esercizio 1 — Ricorda**

Spiega il modello fan-out SNS/SQS. Perché il modello utilizza code SQS invece di avere i servizi sottoscriverli direttamente all'argomento SNS con endpoint HTTP?

*(Suggerimento: pensa a cosa succede se uno degli endpoint HTTP è inattivo quando SNS pubblica un messaggio.)*

**Esercizio 2 — Esercizio d'esame**

*Scenario*: Una piattaforma di e-commerce elabora 10.000 ordini all'ora. Quando viene effettuato un ordine, il sistema deve: (1) memorizzare l'ordine nel database, (2) dedurre l'inventario, (3) inviare un'e-mail di conferma e (4) aggiornare il pannello di analisi. Attualmente, tutti e quattro i passaggi avvengono in modo sincrono — se il servizio di analisi è lento, i clienti attendono. Il team vuole migliorare i tempi di risposta per l'utente finale garantendo che nessun ordine venga perso.

Quale architettura affronta al meglio questo requisito?

A) Utilizzare code FIFO SQS per elaborare tutti e quattro i passaggi in sequenza
B) Far salvare dall'API l'ordine e confermare immediatamente al cliente; pubblicare un evento su un topic SNS; far sottoscrivere a code SQS i servizi di inventario, e-mail e analisi
C) Utilizzare istanze EC2 parallele per elaborare ogni passaggio simultaneamente, in modo sincrono
D) Utilizzare un API Gateway con convalida delle richieste per velocizzare l'elaborazione degli ordini

**Suggerimento 1**: La conferma del cliente dovrebbe essere immediata. Quali passaggi devono avvenire prima della risposta e quali possono avvenire dopo?

**Suggerimento 2**: Il servizio di analisi che è lento non dovrebbe influire sui servizi di e-mail o inventario.

**Suggerimento 3**: Il fan-out SNS consente a tutti e tre i servizi downstream di ricevere l'evento simultaneamente.

**Risposta**: B

**Spiegazione**: L'API salva l'ordine nel database (sincrono — deve essere fatto prima di confermare) e restituisce immediatamente una conferma. Quindi pubblica un evento `order-placed` su un topic SNS. Inventario, e-mail e analisi si sottoscrivono tramite code SQS indipendenti. Elaborano al loro ritmo — se l'analisi è lenta, la sua coda cresce ma gli altri servizi non sono influenzati. Se un servizio fallisce, i suoi messaggi rimangono nella coda SQS e vengono riprovati; dopo il numero configurato di tentativi falliti, vengono spostati nella DLQ.

**Perché non A?** Le code FIFO elaborano i messaggi in sequenza — questo non aiuta con il rallentamento sincrono. Inoltre, l'elaborazione sequenziale significa che anche se il servizio di analisi è lento, l'e-mail o l'inventario non sono influenzati.

**Perché non C?** "Istanze EC2 parallele che elaborano in modo sincrono" richiede ancora che tutti i passaggi vengano completati prima di rispondere al cliente. Aggiungere istanze non risolve il legame sincrono.

**Perché non D?** L'API Gateway accelera il routing e la convalida delle API, ma non disaccoppia i passaggi di elaborazione downstream.

*SAA-C03 Domain: Design Resilient Architectures — Task 2.1*

**Esercizio 3 — Sfida Architetturale** *(Opzionale)*

Nimbus sta costruendo un sistema di notifiche per i partner dei ristoranti. Quando un cliente effettua un ordine, il ristorante deve essere notificato tramite:

- Il loro tablet app (notifica push)
- Un sistema di visualizzazione della cucina (webhook HTTP al loro hardware locale)
- Un SMS di backup (se la notifica push fallisce)

Il servizio di notifica push è affidabile. Il webhook della cucina a volte è inattivo (i ristoranti spengono il loro hardware al termine della giornata). L'SMS dovrebbe scattare solo se la notifica push fallisce.

Progetta l'architettura utilizzando SNS e SQS. Come gestiresti il requisito "SMS solo se il push fallisce"? Come ti assicureresti che il webhook della cucina non blocchi la notifica push quando è offline?

*(Non esiste una risposta corretta univoca. L'obiettivo è praticare il design a diffusione con il routing condizionale.)*

## Scena Post-Titoli

Il nuovo flusso di ordini era in funzione.

I clienti effettuavano ordini. L'API rispondeva in 95 millisecondi. La conferma appariva istantaneamente sui loro telefoni.

Dietro le quinte: quattro servizi che elaboravano in modo asincrono. Il servizio di analisi aveva un bug che causava il suo blocco su ordini contenenti caratteri speciali specifici nel nome dell'articolo. La sua coda si era riempita di 3.200 messaggi in due ore.

I clienti non se ne accorsero.

Quando Leo ha corretto il bug e il servizio di analisi è stato riavviato, ha elaborato il backlog in 18 minuti. Nessun dato è stato perso. La DLQ era vuota.

"Questo è ciò che significa il disaccoppiamento," disse Priya.

Tom stava leggendo la pagina dei prezzi di SQS. "A quanto pare, 0,40 dollari per milione di richieste."

"È brutto?"

"Al nostro volume attuale, circa dodici dollari al mese." Si fissò allo schermo. "Mi aspettavo di più."

Si trovava di fronte a una scoperta inaspettatamente economica che era anche inaspettatamente buona.

Nel prossimo capitolo: la funzione che viene eseguita quando qualcuno bussà — e costa niente quando non bussano.
