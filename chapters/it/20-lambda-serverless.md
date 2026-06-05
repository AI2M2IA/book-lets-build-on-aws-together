# Capitolo 20: Il Modello Freelancer

La funzione di notifica dell'ordine veniva eseguita esattamente una volta per ogni ordine. Tra un ordine e l'altro, non faceva nulla. Per sedici ore di mercoledì, non arrivavano nuovi ordini. Durante quelle sedici ore, la funzione non costava nulla. Non un centesimo. Nessun server inattivo, nessuna istanza in attesa, nessuna capacità riservata inutilizzata. La funzione esisteva. Semplicemente non veniva eseguita.

Il fan-out SNS/SQS funzionava. Il servizio di analisi, il servizio di notifica e il servizio di posta elettronica consumavano ciascuno dai propri code SQS.

Ma Priya aveva notato qualcosa.

"Il servizio di posta elettronica", disse. "Quanti email inviamo all'ora?"

Leo controllò le metriche. "In media 400. Picco di circa 1.200 nelle serate di venerdì."

"E l'istanza EC2 che esegue il servizio di posta elettronica — quanto tempo viene eseguita?"

"Costantemente. 24 ore su 24, 7 giorni su 7."

"Anche alle 3 del mattino quando inviamo zero email?"

Silenzio.

"Stiamo pagando per un computer che rimane seduto a fare niente", disse Leo.

"Per quante ore al giorno?"

Ancora silenzio.

"Circa 18."

Tom era diventato molto attento ora.

**Il Server Non È Sempre la Soluzione**

Le istanze EC2 sono permanenti. Ne avvii una e rimane in esecuzione fino a quando non la fermi — 24 ore su 24, 7 giorni su 7, indipendentemente dall'effettivo utilizzo. Per il tuo server web (che gestisce il traffico in ogni ora), è corretto. Per il servizio di posta elettronica (che invia esplosioni di email e poi è inattivo per ore), è uno spreco.

Il Gruppo di Scalatura Automatica può ridurre il servizio di posta elettronica a un'istanza durante le ore non di punta. Ma un'istanza rimane in esecuzione costantemente.

Cosa succederebbe se il codice venisse eseguito solo quando c'è del lavoro da fare?

Questo è il presupposto del calcolo serverless.

**AWS Lambda: Codice Senza Server**

**AWS Lambda** ti permette di eseguire il codice in risposta a eventi senza provisionare o gestire server. Carichi una funzione, specifichi cosa la attiva e Lambda la esegue quando l'attivazione si verifica.

Una funzione Lambda:

- Non ha uno stato persistente (ogni invocazione è indipendente)
- Esegue per un massimo di 15 minuti per invocazione
- Si scala automaticamente da 0 a migliaia di invocazioni concorrenti
- Viene fatturato solo quando è in esecuzione (per 1 ms di esecuzione, arrotondato per eccesso, per GB di memoria allocata)

Quando non c'è un trigger, Lambda non costa nulla. Quando i trigger si verificano, Lambda esegue e addebita. Quando 10.000 trigger si verificano simultaneamente, Lambda esegue 10.000 invocazioni concorrenti. Lo scaling è automatico e quasi istantaneo.

**Trigger di Eventi: Cosa Risveglia Lambda**

Le funzioni Lambda non vengono eseguite da sole — rispondono agli eventi. Trigger comuni includono:

- **Code SQS**: Elabora messaggi da una coda. Lambda sondare la coda e invoca la funzione con batch di messaggi.
- **API Gateway**: Arriva una richiesta HTTP. API Gateway attiva Lambda. Lambda genera una risposta.
- **Evento S3**: Viene caricato un file su S3. Lambda lo elabora (ridimensiona un'immagine, analizza un CSV, convalida un documento).
- **SNS**: Viene pubblicato un messaggio su un argomento. Lambda viene notificato.
- **Stream DynamoDB**: Un record in DynamoDB cambia. Lambda elabora la modifica.
- **CloudWatch Events (EventBridge)**: Un evento programmato (come un cron job) viene eseguito a un orario definito.
- **ALB**: Arriva una richiesta HTTP al load balancer. Lambda può gestire alcuni percorsi.

Per Nimbus, il servizio di posta elettronica divenne una funzione Lambda attivata dalla sua coda SQS. Quando arriva un messaggio nella coda, Lambda viene invocata con il contenuto del messaggio, invia l'email tramite SES (Simple Email Service) e esce.

Nessun server. Nessun tempo inattivo. Nessun costo quando inattivo.

**Il Problema del Cold Start**

Le funzioni Lambda vengono eseguite in **ambienti di esecuzione** — piccoli, isolati container. Quando una funzione viene invocata:

1. AWS controlla se è disponibile un ambiente di esecuzione caldo (uno che ha gestito una recente invocazione)
2. Se caldo: la funzione viene eseguita immediatamente
3. Se freddo: AWS inizializza un nuovo ambiente di esecuzione — scarica il tuo codice, avvia il runtime, esegue il tuo codice di inizializzazione — poi esegue la funzione

Un **cold start** aggiunge 100ms a diversi secondi di latenza a seconda del runtime (Java e .NET hanno cold start più lunghi rispetto a Python e Node.js) e della dimensione del pacchetto del codice.

Per l'elaborazione asincrona (invio di email, ridimensionamento di immagini), i cold start sono invisibili agli utenti.

Per le API sincrone (richieste HTTP dove un utente sta aspettando una risposta), i cold start possono causare occasionali risposte lente.

**Mitigazioni:**

- **Concurrency Provisionata**: Pre-riscalda un numero specificato di ambienti di esecuzione. Sono sempre pronti. Si paga per questo anche quando non vengono elaborati i requisiti.
- **Dimensioni del pacchetto più piccole**: Pacchetti più piccoli si inizializzano più velocemente.
- **Invocazioni di riscaldamento**: Pinger programmati per mantenere le funzioni calde (un approccio comune ma poco elegante).
- **Scegliere il runtime giusto**: Python e Node.js hanno cold start più veloci rispetto a Java.

**Prezzi di Lambda: Perché Tom Sorrideva**

I prezzi di Lambda hanno due componenti:

1. **Costo della richiesta**: $0,20 per milione di invocazioni
2. **Costo della durata**: $0,0000166667 per GB-secondo (memoria allocata × secondi in esecuzione)

Le prime 1.000.000 di richieste al mese sono gratuite (sempre, non solo nel primo anno).

Tom ha fatto i calcoli per il servizio di posta elettronica:

- 1.200 email al giorno × 30 giorni = 36.000 invocazioni al mese
- Ogni invocazione richiede circa 2 secondi con 256MB di memoria
- Durata: 36.000 × 2 × 0,25GB × $0,0000166667 = $0,30/mese
- Richieste: 36.000 << 1.000.000 (tier gratuito) = $0,00/mese

L'istanza EC2 per il servizio di posta elettronica: $18/mese.

Tom rimase in silenzio per un momento. Poi: "Dovremmo fare questo per tutto."

**Cosa Lambda È Bravo a Fare (e Cosa Non È Bravo a Fare)**

Lambda è eccellente per:

- **Elaborazione guidata dagli eventi**: Rispondere agli eventi (caricamenti di file, messaggi di coda, attività pianificate)
- **Compiti a breve durata**: Elaborazioni che completano bene entro 15 minuti
- **Traffico irregolare e imprevedibile**: Lambda scala da 0 a migliaia istantaneamente — senza pre-provisioning
- **Operazioni infrequenti**: Un report che viene eseguito alle 2 del mattino ogni giorno. Un lavoro di pulizia che viene eseguito settimanalmente.
- **Codice Glue**: Funzioni piccole che spostano i dati tra i servizi

Lambda è scarso per:

- **Processi a lunga durata**: Il limite di 15 minuti è un muro invalicabile
- **Applicazioni stateful**: Le funzioni Lambda sono stateless per design — ogni invocazione è indipendente
- **API ad alto throughput, a bassa latenza**: I cold start possono causare picchi di latenza; la concurrency fornita mitiga questo ma aggiunge costi
- **Applicazioni che necessitano di connessioni persistenti**: Lambda non può mantenere facilmente un pool di connessioni di database a lungo termine (anche se gli strumenti di pooling di connessioni come RDS Proxy aiutano)
- **Server web tradizionali**: Possibile, ma non è la soluzione più naturale

"Quindi Lambda non è un sostituto per EC2", disse Maya. "È uno strumento diverso per diversi lavori."

"L'API web di Nimbus rimane su EC2 o ECS", confermò Leo. "Il servizio di posta elettronica, il ridimensionatore di immagini, il generatore di report notturno, il pulitore di log — quelli si spostano su Lambda."

**La Filosofia Serverless**

Lambda fa parte di un concetto più ampio: **serverless** — costruire applicazioni dove non gestisci server, solo codice.

Un stack Nimbus completamente serverless potrebbe apparire così:

- API Gateway + Lambda (invece di EC2 con un server web)
- DynamoDB (invece di RDS — anch'esso serverless, senza gestione dei server)
- S3 (asset statici — intrinsecamente serverless)
- SNS + SQS (messaggistica — serverless)
- Lambda (tutto l'elaborazione in background)

Il fascino: scrivi il codice; AWS gestisce tutto il resto. Nessuna patch, nessuna configurazione di scalabilità, nessuna pianificazione della capacità.

La realtà: la filosofia serverless ha la propria complessità operativa — il debug di funzioni Lambda distribuite, la gestione dei cold start, la comprensione dei limiti di concurrency. Non è più semplice, solo diverso.

## Punti di Forza e Limitazioni

**Perché Lambda è potente**:

- Pagamento a consumo vero — zero costi quando è inattivo
- Scalabilità automatica senza configurazione
- Nessun server da patch o mantenere
- Generoso tier gratuito (1 milione di richieste al mese, per sempre)
- Integrazione stretta con il resto di AWS

**Dove diventa complicato**:

- I cold start sono reali e richiedono una gestione attenta per i carichi di lavoro sensibili alla latenza
- Il limite di esecuzione di 15 minuti esclude i compiti a lunga durata
- Il debug è più difficile — nessun server a cui accedere tramite SSH
- Il design stateless richiede l'esternazione di tutto lo stato (database, cache, S3)
- Limiti di concurrency (1.000 invocazioni concorrenti predefinite per account) possono limitare a livello di scala
- Le funzioni Lambda collegate a VPC hanno ulteriori problemi di latenza e cold start

## Riepilogo

- **AWS Lambda** esegue il codice in risposta agli eventi senza gestire server.
- **Pagamento a consumo**: fatturato per invocazione e per 1 ms di esecuzione (arrotondato per eccesso). Zero costi quando è inattivo.
- Scala automaticamente da 0 a migliaia di invocazioni concorrenti.
- **Cold start**: latenza di inizializzazione quando non esiste un ambiente di esecuzione caldo. Mitigato con concurrency fornita o runtime leggeri.
- Migliore per: elaborazione guidata dagli eventi, a breve durata, irregolare o infrequente.
- Non ideale per: compiti a lunga durata, applicazioni stateful, API ad alto throughput a bassa latenza senza concurrency fornita.
- **Serverless** è una filosofia di progettazione — gestisci il codice, non l'infrastruttura.

## Suggerimenti per l'Esame

*SAA-C03 Domain: Design Resilient Architectures (Domain 2, Task 2.1)*

- **Lambda + S3**: Pattern classico — file caricato su S3 innesca Lambda per l'elaborazione (generazione di miniature, scansione antivirus, trasformazione dei dati). Non è necessario un server.
- **Lambda + SQS**: Lambda interroga SQS e elabora batch. SQS fornisce il meccanismo di retry/DLQ. Lambda fornisce l'elaborazione.
- **Lambda + API Gateway**: API HTTP serverless. API Gateway gestisce il routing, l'autenticazione, il throttling. Lambda gestisce la logica di business.
- **Segnali di cold start**: "picchi di latenza al primo request", "tempi di risposta incoerenti" → cold start. Soluzione: concurrency provisionata (costa denaro), pacchetto più piccolo, runtime più leggero.
- **Limiti di esecuzione**: massimo 15 minuti. massimo 10 GB di memoria. 512 MB di storage temporaneo /tmp per impostazione predefinita (configurabile fino a 10 GB). Questi limiti appaiono negli scenari di esame.
- **Concurrency di Lambda**: default 1.000 esecuzioni concorrenti per account (può essere aumentato). **Concurrency riservata**: garantisce che una funzione ottenga un numero specifico di esecuzioni; impedisce ad altre funzioni di consumarne. **Concurrency provisionata**: pre-riscalda un numero di ambienti di esecuzione.
- **Mapping della sorgente di eventi**: la funzionalità Lambda che collega SQS/DynamoDB Streams/Kinesis a Lambda. Lambda interroga la sorgente e raggruppa i record.

## Esercizi

**Esercizio 1 — Ricordo**

Spiega il problema del cold start. In che tipo di applicazione i cold start sarebbero più problematici? In quali sarebbero accettabili?

*(Suggerimento: confronta un'API in tempo reale (l'utente aspetta una risposta) con un lavoro in background asincrono (l'utente ha già ricevuto la sua conferma e sta facendo altre cose).)*

**Esercizio 2 — Esercitazione d'esame**

*Scenario*: Un'azienda riceve immagini di prodotti dai propri fornitori tramite un bucket S3. Ogni immagine deve essere ridimensionata a quattro dimensioni standard (miniatura, piccola, media, grande) e memorizzata nuovamente in S3. Il volume è imprevedibile — alcuni giorni 10 immagini, alcuni giorni 100.000 — e l'elaborazione deve essere completata entro 10 minuti per immagine. Il costo deve essere minimizzato.

Quale architettura soddisfa meglio questi requisiti?

A) Istanza EC2 in un Auto Scaling Group che monitora il bucket S3 con polling a lungo termine
B) Notifica S3 che innesca una funzione Lambda per ridimensionare le immagini e memorizzare i risultati in S3
C) Task ECS Fargate innescati da una coda SQS, con S3 eventi che pubblicano nella coda
D) Un'istanza EC2 dedicata con un cron job che controlla S3 ogni minuto per nuove immagini

*(Suggerimento 1*: Il volume imprevedibile favorisce la scalabilità a zero. Quale opzione lo fa?

*(Suggerimento 2*: 10 minuti per immagine rientrano nel limite di 15 minuti di Lambda. Controlla se il lavoro di ridimensionamento delle immagini si adatta ai limiti di Lambda.

*(Suggerimento 3*: Un'istanza EC2 dedicata che funziona 24 ore su 24, 7 giorni su 7 è costosa e non scala.

**Risposta**: B

**Spiegazione**: Le notifiche S3 innescano Lambda quando viene caricata un'immagine. Lambda ridimensiona l'immagine a quattro dimensioni e memorizza i risultati in S3. Lambda scala da 0 a migliaia di invocazioni concorrenti automaticamente, gestendo il volume imprevedibile senza pre-provisioning. Zero costo quando non vengono elaborate immagini.

**Perché non A?** EC2 in un ASG non scala a zero — c'è sempre un'istanza minima in esecuzione. Il polling a lungo termine S3 non è un meccanismo di eventi S3 nativo. Costo più elevato rispetto a Lambda per i carichi di lavoro a picco.

**Perché non C?** ECS Fargate funziona, ma è più complesso (richiede la gestione dei container, ECR, definizioni di task) e ha una latenza di cold start leggermente superiore rispetto a Lambda per i carichi di lavoro a picco. Lambda è più semplice per questo caso d'uso.

**Perché non D?** Un'istanza EC2 dedicata è un punto di guasto singolo, non scala, funziona 24 ore su 24, 7 giorni su 7 e un approccio basato su cron ha un ritardo di rilevamento fino a 60 secondi.

**SAA-C03 Domain: Design Resilient Architectures — Task 2.1**

**Esercizio 3 — Sfida di architettura** *(Opzionale)*

Nimbus vuole generare un report giornaliero alle 5 del mattino con le 10 migliori ristoranti del giorno per volume di ordini. Il report viene generato da dati DynamoDB, formattato come PDF, memorizzato in S3 e inviato via email a tutti i partner dei ristoranti.

Progetta l'intera pipeline Lambda per questo. Quale innesca la Lambda? Cosa succede se la generazione del PDF richiede 12 minuti? Cosa succede se ci sono 5.000 partner dei ristoranti e l'invio di tutti via email richiede tempo? Userebbe una sola Lambda o più Lambda?

*(Non esiste una risposta corretta univoca. L'obiettivo è praticare la composizione di Lambda con altri servizi.)*

## Scena post-titoli di credito

Tom ha rivisto il conto alla fine del mese.

Il servizio di posta elettronica: era sparito dalla bolletta EC2.
Il lavoro di ridimensionamento delle immagini: sparito.
Il task di pulizia notturno: sparito.
Il report di analisi giornaliero: sparito.

Costi totali di Lambda per il mese: $4,23.

"Quattro dollari e ventitré centesimi," disse Tom.

"E ventitré centesimi," aggiunse Leo con cortesia.

Tom guardò lo schermo per un lungo periodo di tempo.

"Ci arrendiamo a tutto quello che abbiamo detto sul serverless essere un termine di trovata," disse.

Nel prossimo capitolo: il contenitore che trasforma qualsiasi server in un ambiente familiare.
