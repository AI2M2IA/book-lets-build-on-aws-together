# Capitolo 20: Il Modello Freelancer

Era un tranquillo mercoledì pomeriggio. Priya, per una volta, aveva le cuffie abbassate, e l'ufficio aveva quel brusio di sottofondo che significava che tutti erano concentrati ma nessuno era nel panico. Leo aveva una dashboard dei costi aperta su uno schermo e la lista delle istanze EC2 sull'altro.

Pensa a un freelancer che lavora su chiamata. Non sta seduto a una scrivania dalle nove alle cinque. Aspetta. Il telefono squilla, fa il lavoro, manda la fattura, torna ad aspettare. Niente lavoro, niente costi. Una raffica di richieste, le gestisce tutte simultaneamente. Paghi solo le ore effettivamente lavorate — non le ore passate a essere disponibile.

Questo è il modello di cui parla questo capitolo.

---

Il fan-out SQS/SNS aveva disaccoppiato il flusso degli ordini, ma i worker che consumavano quelle code giravano ancora su istanze EC2 che fatturavano a ore — indipendentemente da quante email inviassero davvero. L'architettura era giusta; il modello di costo aveva ancora una falla.

Priya l'aveva notato per prima.

"Il servizio email," disse. "Quante email inviamo al giorno?"

Leo controllò le metriche. "In media 400 al giorno. Picco di circa 1.200 il venerdì sera."

"E l'istanza EC2 che esegue il servizio email — per quanto tempo gira?"

"Sempre. 24 ore su 24, 7 giorni su 7."

"Anche alle 3 di notte quando inviamo zero email?"

Silenzio.

Leo aprì il grafico CPU di CloudWatch per l'istanza EC2 del servizio email. Il grafico mostrava 18 ore di funzionamento continuo. Al picco del venerdì: CPU al 38%, mentre gestiva la raffica di email. Dopo mezzanotte: la CPU scendeva al 3%. Restava lì finché non iniziavano gli ordini del pranzo.

Tre per cento di CPU per 18 ore di fila. L'istanza era in esecuzione. Stava fatturando. Non stava facendo niente di significativo.

"Stiamo pagando un computer perché stia lì a non fare niente," disse Leo.

"Per quante ore al giorno?"

Altro silenzio.

"Circa 18."

Tom ora era molto attento.

"E non è solo il servizio email," aggiunse Priya. "Il servizio di ridimensionamento delle immagini per le foto dei ristoranti gira all'1% di CPU per la maggior parte del tempo. Ha picchi solo quando un ristorante carica un nuovo menu. Il che succede, quanto, qualche volta al giorno per ristorante?"

"Sì," confermò Leo.

"Il job notturno di pulizia che elimina i file temporanei — quello gira per 4 minuti alle 2 di notte e poi resta completamente inattivo per 23 ore e 56 minuti."

"Anche quello, sì."

Il pattern era lo stesso per tutti i servizi più piccoli di Nimbus: compute pagato 24 ore al giorno, usato per una frazione di quel tempo.

---

**Il Server Non È Sempre la Risposta**

Le istanze EC2 sono permanenti. Ne avvii una e gira finché non la fermi — 24 ore al giorno, 7 giorni su 7, indipendentemente dall'uso effettivo. Per il tuo web server (che gestisce traffico a tutte le ore), è corretto. Per il servizio email (che invia raffiche di email e poi resta inattivo per ore), è uno spreco.

L'Auto Scaling Group può ridurre il servizio email a una sola istanza durante le ore di calma. Ma una istanza gira comunque costantemente.

Questa è la domanda su cui Tom continuava a tornare guardando la bolletta: cosa stava facendo davvero ogni servizio durante quelle 18 ore al 3% di CPU? Non niente, tecnicamente — l'istanza aspettava, controllava gli eventi, manteneva il suo stato. Ma dal punto di vista del business: niente. Il servizio non stava producendo valore. Stava fatturando.

Per i carichi di lavoro che sono davvero inattivi per la maggior parte del tempo, un'istanza EC2 sempre accesa è come pagare l'affitto di un appartamento che visiti solo nei weekend. L'appartamento è tuo; l'affitto non si ferma.

C'è una sottigliezza qui che vale la pena tenere a mente. Il modello tradizionale è: assumi un dipendente, paghi 8 ore, ottieni un output variabile. Il modello freelancer è: paghi solo quando il telefono squilla, ottieni esattamente ciò che è stato richiesto. Per una domanda prevedibile e costante, il modello del dipendente è più efficiente — il telefono squilla in continuazione, quindi pagare a ore è equivalente. Per una domanda variabile, a picchi o infrequente, il modello freelancer è drasticamente più economico. La maggior parte dei sistemi reali è un misto: alcune cose girano costantemente (il server API, il database), altre girano solo quando vengono attivate (elaborazione di eventi, generazione di report, ridimensionamento di immagini). Il modello freelancer è per la seconda categoria — e Nimbus stava per scoprire quanta parte della sua bolletta apparteneva a quella categoria.

Il modello freelancer risolve tutto questo completamente. Il codice esiste. Semplicemente non gira finché non c'è un motivo per farlo girare. Nessun costo di inattività. Nessuna capacità riservata. Nessun server in attesa accanto al telefono.

Questa è la premessa del **serverless computing**.

**AWS Lambda: Codice Senza Server**

**AWS Lambda** ti permette di eseguire codice in risposta a eventi senza fare provisioning o gestire server. Carichi una funzione, specifichi cosa la attiva, e Lambda la esegue quando il trigger scatta.

Una funzione Lambda:

- Non ha stato persistente (ogni invocazione è indipendente)
- Gira per un massimo di 15 minuti per invocazione
- Scala automaticamente da 0 a migliaia di invocazioni concorrenti
- Viene fatturata solo quando è in esecuzione (per 1 ms di esecuzione, arrotondato per eccesso, per GB di memoria allocata)

Quando non c'è nessun trigger, Lambda non costa nulla. Quando i trigger scattano, Lambda gira e addebita. Quando 10.000 trigger scattano simultaneamente, Lambda esegue 10.000 invocazioni concorrenti. Lo scaling è automatico e quasi istantaneo.

**Trigger di Eventi: Cosa Sveglia Lambda**

Le funzioni Lambda non girano da sole — rispondono agli eventi. I trigger comuni includono:

- **Coda SQS**: elabora i messaggi da una coda. Lambda fa polling sulla coda e invoca la funzione con batch di messaggi.
- **API Gateway**: arriva una richiesta HTTP. API Gateway attiva Lambda. Lambda genera una risposta.
- **Evento S3**: un file viene caricato su S3. Lambda lo elabora (ridimensiona un'immagine, fa il parsing di un CSV, valida un documento).
- **SNS**: un messaggio viene pubblicato su un topic. Lambda viene notificata.
- **DynamoDB Streams**: un record in DynamoDB cambia. Lambda elabora la modifica.
- **CloudWatch Events (EventBridge)**: un evento programmato (come un cron job) viene eseguito a un orario definito.
- **ALB**: una richiesta HTTP arriva al load balancer. Lambda può gestire determinate route.

Per Nimbus, il servizio email divenne una funzione Lambda attivata dalla sua coda SQS. Quando un messaggio arriva nella coda, Lambda viene invocata con il contenuto del messaggio, invia l'email tramite SES (Simple Email Service) ed esce.

Zero server. Zero tempo di inattività. Zero costi quando è inattiva.

Il pattern Lambda + SQS vale la pena di essere interiorizzato: SQS gestisce la coda, la durabilità, la logica di retry e la DLQ. Lambda gestisce l'elaborazione. Ottieni i benefici di decoupling di SQS con l'economia scale-to-zero di Lambda. Nessuno dei due servizi fa il lavoro dell'altro. Si compongono in modo pulito.

"Cosa succede con un messaggio malformato nella coda?" chiese Priya. "Un input difettoso può far crashare Lambda in un modo che colpisce le altre funzioni nell'account?"

Le invocazioni Lambda sono isolate l'una dall'altra. Una funzione che va in crash non influenza le altre funzioni. Una Lambda che lancia un'eccezione non gestita su un messaggio malformato: il messaggio torna nella coda, viene ritentato fino al limite configurato, poi passa alla DLQ. La Lambda stessa rimane disponibile per il messaggio successivo. La validazione degli input dentro l'handler della Lambda è comunque importante — per intercettare i dati malformati prima di tentare di elaborarli — ma un singolo messaggio difettoso non può buttare giù la funzione.

**Il Problema del Cold Start**

Le funzioni Lambda girano in **ambienti di esecuzione** — piccoli container isolati. Quando una funzione viene invocata:

1. AWS controlla se è disponibile un ambiente di esecuzione caldo (uno che ha gestito un'invocazione recente)
2. Se è caldo: la funzione gira immediatamente
3. Se è freddo: AWS inizializza un nuovo ambiente di esecuzione — scarica il tuo codice, avvia il runtime, esegue il tuo codice di inizializzazione — e poi esegue la funzione

Un **cold start** aggiunge da 100ms a diversi secondi di latenza a seconda del runtime (Java e .NET hanno cold start più lunghi di Python e Node.js) e della dimensione del pacchetto del tuo codice.

Forse ti starai chiedendo: se Lambda parte da zero ogni volta, questo non la rende più lenta di un server che è già in esecuzione? Sì — a volte. Questo è il problema del cold start, e conta per le API rivolte agli utenti sensibili al tempo. Non conta affatto per i job in background dove l'utente ha già ricevuto la sua conferma. Un cold start di 200ms su un servizio email che gira in background è invisibile a chiunque.

Per l'elaborazione asincrona (invio di email, ridimensionamento di immagini), i cold start sono invisibili agli utenti.

Per le API sincrone (richieste HTTP dove un utente sta aspettando una risposta), i cold start possono causare occasionali risposte lente.

**Mitigazioni**:

- **Provisioned concurrency**: pre-riscalda un numero specificato di ambienti di esecuzione. Sono sempre pronti. Paghi per questo anche quando non stanno elaborando richieste.
- **Pacchetti più piccoli**: codice più piccolo si inizializza più velocemente.
- **Invocazioni di riscaldamento**: ping programmati per mantenere le funzioni calde (un approccio comune ma poco elegante).
- **Scegliere il runtime giusto**: Python e Node.js hanno cold start più veloci di Java.

**Un'Indagine Reale su un Cold Start**

Due settimane dopo la migrazione a Lambda, Leo ricevette un messaggio Slack da un ristorante partner: "La conferma dell'ordine a volte impiega 3 secondi. Di solito è veloce. Cosa sta succedendo?"

Leo aprì le metriche CloudWatch della funzione Lambda. Nel grafico "Duration", riusciva a vedere un pattern: la prima invocazione dopo qualsiasi pausa superiore a 15-20 minuti schizzava a 2.800-3.200 millisecondi. Le invocazioni successive: 180-220 millisecondi.

Cold start classici.

Estrasse la traccia X-Ray di una delle invocazioni da 3 secondi. La timeline lo mostrava chiaramente:

- Fase di inizializzazione: 2.640ms (download del codice della funzione, avvio del runtime Node.js, esecuzione del codice di inizializzazione a livello di modulo)
- Esecuzione della funzione handler: 290ms

La fase di inizializzazione era il problema. Guardò il codice di inizializzazione. La funzione importava un SDK voluminoso, inizializzava una connessione al database e caricava la configurazione da AWS Secrets Manager — tutto all'avvio.

"Parte di questa inizializzazione deve avvenire solo una volta per ambiente di esecuzione," disse Leo. "Ma sta avvenendo a ogni cold start."

Ristrutturò il codice della Lambda per inizializzare la connessione al database fuori dalla funzione handler (così viene riutilizzata tra le invocazioni calde) e ridusse la dimensione del pacchetto rimuovendo i moduli SDK inutilizzati. Passò anche dall'includere l'intero AWS SDK all'importare solo i servizi specifici di cui aveva bisogno.

Dopo l'ottimizzazione:

- Durata del cold start: 1.100ms (ancora presente, ma meno grave)
- Invocazioni calde: 165ms

Il cold start di 1,1 secondi continuava a verificarsi occasionalmente. Per il servizio email (asincrono, ritardo invisibile all'utente), era accettabile. Per la Lambda di notifica ai ristoranti (rivolta al cliente, con ordini da un tablet), Priya spinse per la provisioned concurrency: due ambienti pre-riscaldati sempre pronti.

"Quanto costa al mese?" chiese Tom.

Due ambienti di provisioned concurrency a 256MB: circa $5,40/mese. I picchi di latenza si fermarono.

**I Prezzi di Lambda: Perché Tom Sorrideva**

I prezzi di Lambda hanno due componenti:

1. **Costo per richiesta**: $0,20 per milione di invocazioni
2. **Costo per durata**: $0.0000166667 per GB-secondo (memoria allocata × secondi di esecuzione)

Il primo milione di richieste al mese è gratuito (sempre, non solo nel primo anno).

"Quanto costa al mese?" chiese Tom prima che Leo potesse aprire la calcolatrice.

Tom fece i conti per il servizio email da solo:

- Assumiamo che ogni giorno sia un venerdì — caso peggiore: 1.200 email al giorno × 30 giorni = 36.000 invocazioni al mese
- Ogni invocazione richiede ~2 secondi a 256MB di memoria
- Durata: 36.000 × 2 × 0,25GB × $0.0000166667 = $0,30/mese
- Richieste: 36.000 << 1.000.000 (tier gratuito) = $0,00/mese

"E quei 18.000 GB-secondi sono ben dentro i 400.000 GB-secondi di durata che sono sempre gratuiti," aggiunse Tom. "Quindi l'addebito effettivo sarebbe zero. Ma sto ignorando il tier gratuito di proposito — voglio conoscere il vero costo unitario."

L'istanza EC2 per il servizio email: $18/mese.

"L'ho già deployato — oh." Leo si fermò. Aveva spinto la Lambda del servizio email in produzione prima di finire la configurazione della DLQ. "Dammi cinque minuti."

Tom rimase in silenzio per un momento. Poi: "Dovremmo farlo per tutto."

**In Cosa Lambda È Bravo (e in Cosa Non Lo È)**

"Aspetta — ma *perché* allora non dovremmo semplicemente usare Lambda per tutto?" chiese Maya. "Se è più economico e scala automaticamente, qual è la fregatura?"

"Il limite dei 15 minuti," disse Leo. "E i cold start per qualsiasi cosa rivolta agli utenti. E la statelessness — non puoi tenere niente in memoria tra un'invocazione e l'altra."

Se il tuo carico di lavoro è a picchi, event-driven e si completa in meno di 15 minuti, Lambda costerà una frazione di un'istanza EC2 sempre accesa — ma se il tuo carico di lavoro è un job di elaborazione dati di lunga durata che si avvicina o supera il limite dei 15 minuti, Lambda è lo strumento sbagliato e ti servirà ECS, Batch o un approccio basato su EC2.

Lambda è eccellente per:

- **Elaborazione event-driven**: rispondere agli eventi (caricamenti di file, messaggi in coda, task pianificati)
- **Task di breve durata**: elaborazioni che si completano ben entro i 15 minuti
- **Traffico a picchi e imprevedibile**: Lambda scala da 0 a migliaia istantaneamente — nessun pre-provisioning
- **Operazioni infrequenti**: un report che gira alle 2 di notte ogni giorno. Un job di pulizia che gira settimanalmente.
- **Codice collante (glue code)**: piccole funzioni che spostano dati tra servizi

Forse ti starai chiedendo: cosa succede allo scaling di Lambda quando arriva improvvisamente una raffica di 10.000 eventi simultanei? Il limite di concorrenza di default di Lambda è di 1.000 esecuzioni concorrenti per account. Se arrivano 10.000 eventi in una volta, fino a 1.000 invocazioni girano immediatamente; il resto aspetta nella coda SQS (se attivato via SQS) e viene elaborato man mano che si libera capacità. Di solito va benissimo per l'elaborazione basata su code. Per i casi d'uso sensibili alla latenza, il burst limit di Lambda (il tasso iniziale con cui vengono aggiunte nuove esecuzioni concorrenti) può causare brevi throttling durante picchi improvvisi — la provisioned concurrency aggira questo problema avendo capacità pre-allocata.

Per il servizio email di Nimbus alla loro scala attuale, 1.000 invocazioni concorrenti erano molto più di quanto avrebbero mai avuto bisogno. Ma è il vincolo giusto da conoscere prima di sbatterci contro.

Lambda è scarso per:

- **Processi di lunga durata**: il limite dei 15 minuti è un muro invalicabile
- **Applicazioni stateful**: le funzioni Lambda sono stateless per design — ogni invocazione è indipendente
- **API ad alto throughput e bassa latenza**: i cold start possono causare picchi di latenza; la provisioned concurrency lo mitiga ma aggiunge costi
- **Applicazioni che necessitano di connessioni persistenti**: Lambda non può mantenere facilmente un connection pool di database a lunga vita (anche se strumenti di connection pooling come RDS Proxy aiutano)
- **Web server tradizionali**: possibile, ma non è la soluzione naturale

**Il Muro dei 15 Minuti: Quando Lambda È lo Strumento Sbagliato**

Tre settimane dopo la migrazione, Leo provò a spostare su Lambda un altro carico di lavoro: il generatore notturno del report di analytics. Estraeva i dati degli ordini dal database, li univa con i metadati dei ristoranti, calcolava le statistiche e generava un PDF.

La prima notte, l'invocazione Lambda fallì con un errore di timeout.

"La generazione del report ha richiesto 17 minuti," disse Leo la mattina seguente.

"Il massimo di Lambda è 15," disse Priya.

"Sì. Ora lo so."

Aveva controllato il tempo medio di elaborazione (8 minuti) e aveva dato per scontato che Lambda avrebbe funzionato. Non aveva controllato la coda della distribuzione — le notti in cui il volume di dati era più alto e la query richiedeva più tempo. In quelle notti, 15 minuti non bastavano.

"Quindi il report semplicemente... non viene generato?" chiese Maya.

"Corretto. Nessuna notifica di errore. Nessun report parziale. Solo silenzio."

"L'ho già deployato — oh," disse Leo.

Questo era uno dei modi specifici in cui Lambda fallisce in modo poco elegante: un timeout non produce alcun output, nessun messaggio di errore nell'applicazione, solo un log di errore in CloudWatch. Se non stai monitorando specificamente gli errori di timeout di Lambda, potresti non accorgertene per giorni.

La soluzione: spostare il generatore di report su ECS Fargate — un modo per eseguire container senza gestire server, che il prossimo capitolo tratta come si deve — perché i task Fargate non hanno limiti di tempo di esecuzione. Lambda era lo strumento sbagliato per carichi di lavoro che potevano superare i 15 minuti anche solo occasionalmente. La lezione non era "Lambda è cattivo." La lezione era "Lambda è lo strumento giusto per i carichi di lavoro che rientrano nei suoi vincoli — e una fonte di fallimenti sorprendenti quando non ci rientrano."

**RDS Proxy: Connection Pooling per Lambda**

La natura stateless di Lambda crea un problema specifico con i database.

Quando un'istanza EC2 si connette a RDS, mantiene un connection pool persistente. L'applicazione riutilizza le connessioni dal pool. RDS può gestire, diciamo, 200 connessioni simultanee.

Quando Lambda gestisce 500 invocazioni simultanee, ogni invocazione cerca di aprire la propria connessione al database. Sono 500 nuove connessioni — che travolgono un database che ne supporta 200.

**Amazon RDS Proxy** si posiziona tra le funzioni Lambda e RDS, mantenendo un connection pool persistente e multiplexando le connessioni di breve durata di Lambda attraverso di esso.

Invece di: invocazione Lambda → nuova connessione RDS (per ognuna delle 500 invocazioni concorrenti)

Con RDS Proxy: invocazione Lambda → RDS Proxy → pool di 20 connessioni RDS persistenti

"Il proxy ha bisogno delle credenziali RDS," disse Priya. "Dove vivono? Le memorizza?"

RDS Proxy memorizza le credenziali in Secrets Manager e le ruota automaticamente. Il ruolo IAM della funzione Lambda le concede l'accesso al proxy (usando l'autenticazione IAM), non alle credenziali RDS direttamente. Le credenziali non vengono mai esposte al codice della Lambda.

"Quindi la funzione Lambda si autentica via IAM," confermò Leo, "e il proxy gestisce le vere credenziali del database."

Per la Lambda di elaborazione degli ordini di Nimbus (quella che interrogava RDS per la validazione degli ordini), RDS Proxy eliminò l'esaurimento del connection pool durante il traffico di picco del venerdì.

**Lambda Layers: Dipendenze Condivise**

La Lambda del servizio email, la Lambda di notifica e la Lambda dei report condividevano tutte lo stesso codice di libreria interna: funzioni di utilità per formattare la valuta, sanificare gli input, fare logging nel formato standard.

Senza i Lambda Layers, quel codice condiviso doveva essere incluso nel pacchetto di deployment di ogni funzione. Tre funzioni, tre copie della stessa libreria da 2MB. Quando la libreria si aggiornava, tutte e tre le funzioni avevano bisogno di nuovi deployment.

I **Lambda Layers** sono pacchetti separati che le funzioni Lambda possono referenziare a runtime. La libreria condivisa fu estratta in un layer. Le tre funzioni referenziavano il layer. Gli aggiornamenti alla libreria condivisa significavano aggiornare la versione del layer — non rideployare tutte e tre le funzioni.

Beneficio aggiuntivo: pacchetti di funzione individuali più piccoli significano cold start più veloci.

"Una cosa che i layer non cambiano: il ruolo di esecuzione," disse Priya. "Se una Lambda ha permessi troppo ampi, una funzione compromessa può accedere a tutto nell'account."

"Stesso principio dei ruoli EC2," disse Leo. "Privilegio minimo. Ogni Lambda ottiene solo i permessi di cui ha davvero bisogno."

"Quindi Lambda non è un sostituto di EC2," disse Maya. "È uno strumento diverso per lavori diversi."

"L'API web di Nimbus resta su EC2 o ECS," confermò Leo. "Il servizio email, il ridimensionatore di immagini, il generatore del report notturno, il pulitore di log — quelli si spostano su Lambda."

**La Filosofia Serverless**

Lambda fa parte di un concetto più ampio: il **serverless** — costruire applicazioni in cui non gestisci server, solo codice.

Uno stack Nimbus completamente serverless potrebbe apparire così:

- API Gateway + Lambda (invece di EC2 con un web server)
- DynamoDB (invece di RDS — anch'esso serverless, nessuna gestione di server)
- S3 (asset statici — intrinsecamente serverless)
- SNS + SQS (messaggistica — serverless)
- Lambda (tutta l'elaborazione in background)

Il fascino: tu scrivi il codice; AWS gestisce tutto il resto. Niente patching, niente configurazione di scaling, niente capacity planning.

## Amazon API Gateway

La lista dei trigger di Lambda menzionava brevemente API Gateway: arriva una richiesta HTTP, API Gateway attiva Lambda. È accurato, ma sminuisce ciò che API Gateway è davvero.

"Aspetta — ma *perché* dovremmo mettere API Gateway davanti a Lambda?" chiese Maya. "Lambda non può semplicemente ricevere le richieste HTTP direttamente?"

Lambda può ricevere richieste HTTP tramite una function URL — un endpoint HTTPS semplice e diretto. Ma non gestisce routing, autorizzazione, throttling, caching o trasformazione delle richieste. Per un'API di produzione, queste esigenze esistono indipendentemente dal fatto che il tuo backend sia Lambda o EC2.

**Amazon API Gateway** è un servizio completamente gestito per creare, deployare e gestire API a qualsiasi scala. Gestisce la gestione del traffico, l'autorizzazione, il throttling, il caching e il monitoraggio in modo che la tua funzione Lambda (o EC2, o qualsiasi backend HTTP) non debba implementarli da sola.

**Tre tipi di API:**

La **REST API** è l'opzione più ricca di funzionalità. Supporta la trasformazione di richieste e risposte, il caching delle risposte, i piani di utilizzo legati alle API key e tutti i tipi di autorizzazione. La maggior parte delle domande dell'esame SAA-C03 che menzionano API Gateway riguardano la REST API.

La **HTTP API** è più semplice ed economica — circa il 70% di costo in meno rispetto alla REST API. È progettata per backend Lambda e proxy HTTP. Supporta l'autorizzazione OIDC e OAuth 2.0 ma non la trasformazione delle richieste o il caching. Se non ti servono le funzionalità avanzate della REST API, la HTTP API è la scelta giusta.

La **WebSocket API** gestisce connessioni bidirezionali persistenti. API Gateway gestisce il ciclo di vita della connessione e instrada i messaggi verso Lambda in base al contenuto del messaggio. La funzione Lambda non ha bisogno di gestire lo stato del socket — lo fa API Gateway.

**Opzioni di autorizzazione** (quelle che l'esame verifica):

Il **Cognito User Pool authorizer** valida un JWT da un Cognito User Pool. Nessuna Lambda richiesta. API Gateway controlla il token da solo. Se è valido, la richiesta passa.

Il **Lambda authorizer** esegue una tua funzione Lambda per validare un token — un JWT custom, un token OAuth da un identity provider di terze parti, un'API key in un formato proprietario. La Lambda restituisce una policy IAM. Se la policy consente l'azione, la richiesta procede.

L'**API key** è una semplice chiave passata in un header della richiesta. Le API key servono per il rate limiting per client, non per l'autenticazione. Non usarle come meccanismo di sicurezza — non sono segreti, sono identificatori.

**Throttling e piani di utilizzo:**

Di default, API Gateway consente 10.000 richieste al secondo a livello di account (un soft limit), con un burst di 5.000. Superalo e i client ricevono un `429 Too Many Requests` — il tuo backend non lo percepisce nemmeno. Quando ti servono limiti per client, crei un piano di utilizzo: lo colleghi a un'API key, imposti un tasso di richieste e una quota giornaliera o mensile. I burst di un client non consumano l'allocazione di un altro client.

Due numeri da tenere a mente: il payload massimo è di **10 MB**, e il timeout di integrazione di default è di **29 secondi** — se il tuo backend impiega di più, il gateway si arrende. (Dal 2024, quel timeout può essere alzato oltre i 29 secondi per le REST API Regional e private tramite un aumento di quota — ma il default di 29 secondi è ancora ciò che l'esame si aspetta.) API Gateway è per le API request/response, non per i job di lunga durata; per quelli, passa il lavoro a SQS o Step Functions e rispondi immediatamente.

"Quanto costa al mese?" chiese Tom.

Per la REST API: $3,50 per milione di chiamate API, più $0,09 per GB di trasferimento dati. Per traffico medio-piccolo, è essenzialmente gratis. Per le API ad alto volume, il prezzo più basso della HTTP API diventa significativo.

Leo indicò la lista dei trigger di Lambda che aveva scritto prima. "Quindi API Gateway non è solo un modo per attivare Lambda. È la cosa che fa sembrare Lambda una vera API."

"La funzione Lambda gestisce la logica di business," disse Priya. "API Gateway gestisce tutto ciò che le sta davanti — routing, auth, throttling, monitoraggio. Ognuno fa una cosa sola."

"E se qualcuno provasse a chiamare la Lambda direttamente, scavalcando API Gateway?"

"La policy di esecuzione della Lambda consente le invocazioni solo da API Gateway," disse Priya. "La resource-based policy sulla Lambda nega tutto il resto."

La realtà: il serverless ha una complessità operativa tutta sua — debuggare funzioni Lambda distribuite, gestire i cold start, capire i limiti di concorrenza. Non è più semplice, solo diverso.

"Aspetta — ma *perché* il serverless 'non è più semplice'?" chiese Maya. "Tutta la promessa è che rimuove il carico operativo."

"Rimuove una parte del carico operativo," disse Leo. "Il provisioning dell'infrastruttura, il patching, la configurazione dello scaling — quelli spariscono. Quello che resta è diverso: gestione dei cold start, tracing distribuito attraverso funzioni in cui non puoi entrare via SSH, limiti di concorrenza, gestione di versioni e alias delle funzioni, capire come si propagano gli aggiornamenti dei Layer, gestire con eleganza i timeout di 15 minuti."

"Quindi il carico si sposta," disse Priya. "Dalle operazioni sull'infrastruttura alle operazioni sulle funzioni."

"Sì. Per molti carichi di lavoro — specialmente quelli event-driven, piccoli e a picchi — è uno scambio migliore. Per un application server a lunga esecuzione con cui gli ingegneri devono interagire e fare debugging, EC2 o i container restano spesso la scelta giusta."

Forse ti starai chiedendo: il serverless è il futuro, e tutto dovrebbe prima o poi spostarsi su Lambda? La risposta onesta è che dipende dal carico di lavoro. Il serverless ha dominato l'elaborazione event-driven. Ha fatto progressi significativi nelle API HTTP (via API Gateway + Lambda). Non ha sostituito gli application server sempre accesi, l'elaborazione batch di lunga durata o i servizi stateful — e probabilmente non lo farà, perché quei casi d'uso non traggono beneficio dal modello di Lambda. La domanda sullo strumento giusto non sparisce mai; si applica semplicemente a opzioni diverse nel tempo.

**Monitorare Lambda Senza SSH**

La prima volta che qualcosa si ruppe in una funzione Lambda, l'istinto di Leo fu di entrare via SSH e guardare il processo. Non c'è nessun processo in cui entrare via SSH. Gli ambienti di esecuzione di Lambda sono effimeri e inaccessibili.

Debuggare Lambda richiede di imparare un toolkit diverso:

**CloudWatch Logs**: ogni invocazione Lambda scrive il suo stdout/stderr in un Log Group di CloudWatch. Il logging strutturato (formato JSON) li rende filtrabili. I campi più utili: nome della funzione, ID dell'invocazione, durata, tipo di errore e il tuo correlation ID custom.

**CloudWatch Metrics**: Lambda pubblica automaticamente le metriche Invocations, Duration, Errors, Throttles e ConcurrentExecutions. Impostare allarmi su Errors e Throttles dovrebbe essere il giorno uno di qualsiasi deployment Lambda.

**AWS X-Ray**: tracing distribuito per Lambda. Aggiunge un piccolo overhead (2-5ms per invocazione) ma ti dà un flame graph di dove viene speso il tempo dentro la funzione. Essenziale per l'analisi dei cold start — X-Ray mostra la fase di inizializzazione separatamente dalla fase dell'handler.

**Lambda Insights**: monitoraggio avanzato per Lambda, disponibile tramite CloudWatch Lambda Insights. Aggiunge uso della memoria, tempo CPU e durata di init alle metriche standard. Costa leggermente di più ma ne vale la pena per le funzioni di produzione.

"E se qualcuno provasse a intrufolarsi attraverso l'ambiente di esecuzione?" chiese Priya. "Le funzioni Lambda girano in container isolati, ma se una dipendenza ha una vulnerabilità, un attaccante potrebbe ottenere l'esecuzione di codice dentro la nostra Lambda?"

Le mitigazioni: mantenere le dipendenze minime e aggiornate (l'analisi dei cold start aveva già spinto Leo a ridurre le dimensioni dei pacchetti), usare i Lambda Layers per versionare le librerie condivise e concedere al ruolo di esecuzione della Lambda i permessi minimi necessari. Se la funzione può solo scrivere su un bucket S3 specifico e interrogare una tabella DynamoDB specifica, il raggio d'azione di una funzione compromessa è limitato esattamente a quello.

"Il privilegio minimo per i ruoli di esecuzione Lambda non è opzionale," disse Priya. "È ciò che limita il danno quando qualcosa va storto."

Aveva ragione. E come la maggior parte dei consigli di sicurezza, era anche semplicemente buona ingegneria.

## Punti di Forza e Limitazioni

**Perché Lambda è potente**:

- Vero pay-per-use — costo zero quando è inattivo
- Scaling automatico senza configurazione
- Nessun server da patchare o mantenere
- Tier gratuito generoso (1 milione di richieste al mese, gratuito per sempre)
- Integrazione stretta con il resto di AWS
- RDS Proxy e Lambda Layers risolvono due dei punti dolenti più comuni di Lambda (connection pooling e condivisione del codice) senza richiedere cambiamenti architetturali

**Dove si complica**:

- I cold start sono reali e richiedono una gestione attenta per i carichi di lavoro sensibili alla latenza
- Il limite di esecuzione di 15 minuti esclude i task di lunga durata
- Il debugging è più difficile — nessun server persistente in cui entrare via SSH
- Il design stateless richiede di esternalizzare tutto lo stato (database, cache, S3)
- I limiti di concorrenza (default 1.000 invocazioni concorrenti per account) possono causare throttling su larga scala
- Le funzioni Lambda connesse a una VPC hanno latenza aggiuntiva e problemi di cold start

## Riepilogo

L'architettura SQS/SNS del capitolo 19 ha separato le responsabilità di accettare il lavoro ed elaborarlo. Lambda porta tutto questo oltre: separa le responsabilità di elaborare il lavoro e pagare per la capacità di farlo.

- **AWS Lambda** esegue codice in risposta a eventi senza gestire server. **Pay per use**: fatturato per invocazione e per 1 ms di esecuzione (arrotondato per eccesso) — costo zero quando è inattivo.
- Scala automaticamente da 0 a migliaia di invocazioni concorrenti.
- **Cold start**: latenza di inizializzazione quando non esiste un ambiente di esecuzione caldo. Mitigato con provisioned concurrency o runtime leggeri.
- **Lambda Layers**: pacchetti di codice condiviso che più funzioni possono referenziare, riducendo duplicazione e dimensione dei pacchetti.
- **RDS Proxy**: risolve il problema dell'esaurimento delle connessioni di Lambda mantenendo un connection pool di database persistente tra Lambda e RDS.
- **Monitoraggio**: usa CloudWatch Logs, Metrics, il tracing X-Ray e Lambda Insights — non c'è nessun server in cui entrare via SSH.
- Ideale per: carichi di lavoro event-driven, di breve durata, a picchi o infrequenti. Non ideale per: task di lunga durata (limite invalicabile di 15 minuti), applicazioni stateful, API ad alto throughput e bassa latenza senza provisioned concurrency.
- Il **serverless** è una filosofia di design — gestisci il codice, non l'infrastruttura. La complessità operativa si sposta, non sparisce.

## Suggerimenti per l'Esame

*SAA-C03 Dominio: Progettare Architetture Resilienti (Dominio 2, Task 2.1)*

- **Lambda + S3**: pattern classico — un file caricato su S3 attiva Lambda per l'elaborazione (generazione di miniature, scansione antivirus, trasformazione dei dati). Nessun server necessario.
- **Lambda + SQS**: Lambda fa polling su SQS ed elabora i batch. SQS fornisce il meccanismo di retry/DLQ. Lambda fornisce l'elaborazione.
- **Lambda + API Gateway**: API HTTP serverless. API Gateway gestisce routing, auth, throttling. Lambda gestisce la logica di business.
- **Tipi di API Gateway:** REST API = funzionalità complete, trasformazione delle richieste, caching, piani di utilizzo. HTTP API = più semplice, più economica, solo OIDC/OAuth. WebSocket API = connessioni bidirezionali persistenti. **Autorizzazione:** Cognito authorizer = valida i JWT di Cognito nativamente. Lambda authorizer = logica di validazione di token custom. API key = rate limiting per client (non autenticazione). Trigger d'esame: "API REST serverless" → API Gateway + Lambda.
- **Segnali di cold start**: "picchi di latenza alla prima richiesta," "tempi di risposta incoerenti" → cold start. Soluzione: provisioned concurrency (costa denaro), pacchetto più piccolo, runtime più leggero.
- **Limiti di esecuzione**: massimo 15 minuti. Massimo 10GB di memoria. 512MB di storage effimero /tmp di default (configurabile fino a 10GB). Questi limiti compaiono negli scenari d'esame.
- **Gli errori di timeout di Lambda sono silenziosi**: se una funzione Lambda va in timeout, produce un errore in CloudWatch ma nessuna risposta d'errore a livello applicativo. Monitora esplicitamente gli errori di timeout Lambda in CloudWatch. È così che il generatore di report da 17 minuti di Leo è fallito la sua prima notte senza alcun allarme a livello applicativo.
- **Cold start delle Lambda in VPC**: le funzioni Lambda dentro una VPC hanno latenza di cold start aggiuntiva (provisioning delle ENI). AWS lo ha migliorato significativamente con le Hyperplane ENI, ma i cold start delle Lambda in VPC sono ancora più lenti di quelle fuori VPC. Evita la VPC per le funzioni Lambda che non hanno bisogno di risorse VPC (cioè che non si connettono a RDS, ElastiCache o altre risorse solo-VPC).
- **Concorrenza Lambda**: default 1.000 esecuzioni concorrenti per account (aumentabile). **Reserved concurrency**: garantisce a una funzione un numero specifico di esecuzioni; impedisce alle altre funzioni di consumarle. **Provisioned concurrency**: pre-riscalda un numero di ambienti di esecuzione.
- **Event source mapping**: la funzionalità Lambda che collega SQS/DynamoDB Streams/Kinesis a Lambda. Lambda fa polling sulla sorgente e raggruppa i record in batch.
- **Raggiungere i limiti dell'account**: "l'applicazione subisce throttling / LimitExceeded mentre scala" → controlla il limite in **Service Quotas** e richiedi lì un aumento (molte quote, come la concorrenza Lambda, sono modificabili; alcune sono limiti rigidi).
- **RDS Proxy**: segnale d'esame: "le funzioni Lambda causano troppe connessioni al database," "esaurimento del connection pool con Lambda." → RDS Proxy mantiene connessioni persistenti e multiplexa le connessioni di breve durata di Lambda.
- **Lambda Layers**: segnale d'esame: "condividere codice tra più funzioni Lambda," "ridurre la dimensione del pacchetto di deployment" → Lambda Layers.
- **Lambda + X-Ray**: tracing distribuito per Lambda. Scenario d'esame: "tracciare le richieste attraverso più funzioni Lambda e servizi" → abilita il tracing X-Ray su Lambda.
- **Lambda Destinations:** per le invocazioni Lambda asincrone, puoi configurare una Destination sia per gli esiti di successo sia per quelli di fallimento. Invia i risultati riusciti a SQS, SNS, EventBridge o a un'altra funzione Lambda. Invia i fallimenti a SQS o SNS per l'alerting. È l'alternativa preferita alle DLQ per le invocazioni async perché cattura sia i successi sia i fallimenti, non solo i fallimenti. Segnale d'esame: "instradare i risultati Lambda riusciti verso un altro servizio" o "catturare sia gli esiti di successo sia quelli di fallimento da Lambda async" → Lambda Destinations. "Catturare solo i messaggi falliti per l'invocazione async" → la DLQ è ancora valida ma Destinations è la soluzione più completa.

## Esercizi

**Esercizio 1 — Richiamo**

Spiega il problema del cold start. In che tipo di applicazione i cold start sarebbero più problematici? In quale tipo sarebbero accettabili?

*(Suggerimento: pensa al freelancer che risponde a una chiamata a freddo — c'è un ritardo prima che il lavoro inizi, che conta se un cliente è in linea ma non se si tratta di un job in background a cottimo, rispetto a un dipendente a tempo pieno già alla scrivania.)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: un'azienda riceve immagini di prodotti dai propri fornitori tramite un bucket S3. Ogni immagine deve essere ridimensionata in quattro dimensioni standard (miniatura, piccola, media, grande) e rimemorizzata in S3. Il volume è imprevedibile — alcuni giorni 10 immagini, altri 100.000. L'elaborazione deve completarsi entro 10 minuti per immagine. Il costo deve essere minimizzato.

Quale architettura soddisfa MEGLIO questi requisiti?

A) Istanze EC2 in un Auto Scaling Group che monitorano il bucket S3 con long polling  
B) Un'istanza EC2 dedicata con un cron job che controlla S3 ogni minuto in cerca di nuove immagini  
C) Task ECS Fargate attivati da una coda SQS, con eventi S3 che pubblicano sulla coda  
D) Notifica di evento S3 che attiva una funzione Lambda che ridimensiona le immagini e memorizza i risultati in S3

**Suggerimento 1**: il volume imprevedibile favorisce lo scaling a zero. Quale opzione lo fa?

**Suggerimento 2**: 10 minuti per immagine rientrano nel limite di 15 minuti di Lambda. Verifica se il lavoro di ridimensionamento delle immagini rientra nei vincoli di Lambda.

**Suggerimento 3**: un'istanza EC2 dedicata che gira 24 ore su 24, 7 giorni su 7, è costosa e non scala.

**Risposta**: D

**Spiegazione**: le notifiche di evento S3 attivano Lambda quando viene caricata un'immagine. Lambda ridimensiona l'immagine nelle quattro dimensioni e memorizza i risultati in S3. Lambda scala da 0 a migliaia di invocazioni concorrenti automaticamente, gestendo il volume imprevedibile senza pre-provisioning. Costo zero quando nessuna immagine viene elaborata.

**Perché non A?** EC2 in un ASG non scala a zero — c'è sempre almeno un'istanza in esecuzione. Il long polling su S3 non è un meccanismo nativo di eventi S3. Costo più alto di Lambda per i carichi di lavoro a picchi.

**Perché non B?** Un'istanza EC2 dedicata è un singolo punto di guasto, non scala, gira 24 ore su 24, 7 giorni su 7, e un approccio basato su cron ha un ritardo di rilevamento fino a 60 secondi.

**Perché non C?** ECS Fargate funziona, ma è più complesso (richiede gestione dei container, ECR, task definition) e l'avvio di un task Fargate richiede da decine di secondi a minuti — molto più lento di un cold start Lambda — rendendolo poco adatto a lavori a picchi ed event-driven. Lambda è più semplice per questo caso d'uso.

*SAA-C03 Dominio: Progettare Architetture Resilienti — Task 2.1*

**Esercizio 3 — Sfida di Architettura**

Nimbus vuole generare un report giornaliero alle 5 del mattino con i 10 migliori ristoranti del giorno precedente per volume di ordini. Il report viene generato dai dati di DynamoDB, formattato come PDF, memorizzato in S3 e inviato via email a tutti i ristoranti partner.

Progetta l'intera pipeline basata su Lambda per questo. Cosa attiva la Lambda? Cosa succede se la generazione del PDF richiede 12 minuti? E se ci sono 5.000 ristoranti partner e inviare email a tutti richiede tempo? Useresti una sola Lambda o più di una?

Considera anche: cosa succede se la Lambda va in timeout dopo 14 minuti, avendo elaborato 4.500 delle 5.000 email ai ristoranti? Come eviti di inviare email duplicate quando la Lambda viene ritentata? Quali permessi IAM servono a questa Lambda, e qual è l'insieme minimo necessario?

*(Non esiste un'unica risposta corretta. L'obiettivo è esercitarsi a comporre Lambda con altri servizi.)*

## Scena Post-Crediti

Tom esaminò la bolletta alla fine del mese.

Il servizio email: sparito dalla bolletta EC2.
Il job di ridimensionamento delle immagini: sparito.
Il task di pulizia notturno: sparito.
Il report di analytics giornaliero: sparito. (Il generatore di report era stato spostato su ECS Fargate dopo l'incidente del timeout dei 17 minuti, ma il costo di compute della Lambda era zero perché ora era orchestrato diversamente.)

Addebiti totali Lambda per il mese: $5,47.

"Cinque dollari," disse Tom.

"E quarantasette centesimi," aggiunse Leo servizievole.

Tom guardò la bolletta del mese precedente, quando quei servizi erano tutti su istanze EC2.

"Stavamo pagando $187 per quegli stessi carichi di lavoro."

"Lambda non fattura il tempo di inattività," disse Leo. "E la maggior parte di quei servizi era inattiva il 90% del tempo."

Tom aprì i grafici CloudWatch un'altra volta. La Lambda del servizio email era stata invocata 36.412 volte. Durata totale: circa 18.200 GB-secondi. A $0.0000166667 per GB-secondo: $0,30 — e anche quello era teorico, dato che 18.200 GB-secondi stavano comodamente dentro i 400.000 GB-secondi di durata sempre gratuita. La voce effettiva in bolletta era zero.

"L'istanza EC2 costava $18 al mese," disse Tom. "Abbiamo speso trenta centesimi — e questo ignorando il tier gratuito, così conosciamo il vero costo unitario. La bolletta dice zero."

"La maggior parte dei $5,47 era la provisioned concurrency sulla Lambda di notifica — quella fattura sia che giri sia che non giri. Il ridimensionatore di immagini, il task di pulizia e il resto rientrano nel tier gratuito."

Tom fissò lo schermo a lungo.

"Ritiro tutto quello che ho detto sul serverless come parola di moda," disse.

"Non l'hai mai detto," disse Leo.

"L'ho pensato molto forte."

Maya, guardando la lista crescente di funzioni, code e trigger sulla lavagna, si chiese ad alta voce quanti pezzi in movimento potesse avere un workflow prima che qualcuno dovesse disegnarlo.

Nel prossimo capitolo: il container che fa sentire qualsiasi server come casa propria.
