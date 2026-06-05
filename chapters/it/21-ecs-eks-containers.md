# Capitolo 21: Contenitori per Codice

"Funziona sulla mia macchina."

Leo aveva imparato a non dire queste cose ad alta voce. Non era una difesa – era una diagnosi. E la diagnosi di questa volta era l'istanza EC2 di produzione numero tre, che aveva ricevuto un patch di libreria sei settimane prima che nessuno lo documentasse, che le altre due istanze non lo avevano ricevuto, e che stava causando un bug che esisteva solo lì, in quella singola istanza, invisibile ovunque altro.

Aveva passato tre ore la notte prima a rintracciarlo.

"Ogni volta che deployiamo," disse il mattino seguente, "coordiniamo su più istanze. Nuova versione, diverse dipendenze. Funziona in staging, si rompe in produzione perché gli ambienti si sono diversificati."

"Perché qualcuno ha aggiornato un pacchetto sull'istanza tre senza aggiornare gli altri," disse Priya. Non unkindly.

"Avevo bisogno di una versione specifica di—"

"Lo so," disse lei. "E ora l'istanza tre ha una storia diversa dall'istanza uno e due. Questo è il drift di configurazione. È silenzioso fino a quando non lo è."

Lambda aveva risolto il problema del server inattivo per i servizi più piccoli di Nimbus. Ma l'API principale – quella che trasportava tutto il traffico degli ordini – era ancora su EC2. E le istanze EC2, a differenza delle funzioni, accumulavano la cronologia.

"Qual è la soluzione reale?" chiese Maya.

"Smetti di trattare i server come cose permanenti che configuri," disse Priya. "Inizia a trattarli come unità sostituibili che sostituisci."

Esiste un'analogia che spiega questo così precisamente che compare in quasi ogni spiegazione dei contenitori software. Proviene dal 1956 e non ha niente a che fare con il software. La risposta, quando qualcuno alla fine chiese "qual è la soluzione per spedire merci in modo affidabile su diversi vettori?", fu: standardizzare il contenitore. Invia la scatola, non solo il contenuto.

**Cos'è un Contenitore?**

Un **contenitore** è un'unità leggera e portatile che racchiude la tua applicazione insieme a tutto ciò di cui ha bisogno per funzionare: il runtime (Python 3.11, Node.js 20, Java 17), le librerie e le dipendenze, i file di configurazione e il codice dell'applicazione stesso.

A differenza di una macchina virtuale (che emula un intero computer, incluso il kernel del sistema operativo), un contenitore condivide il kernel del sistema operativo host mentre isola tutto il resto. Questo rende i contenitori veloci da avviare (secondi, a volte millisecondi) e piccoli (megabytes, non gigabytes).

La tecnologia di contenitore più popolare è **Docker**. Un'immagine Docker è il progetto – una snapshot dell'applicazione e del suo ambiente. Un contenitore Docker è un'istanza in esecuzione di quell'immagine.

La proprietà chiave: **immutabilità**. Un'immagine costruita oggi funzionerà identicamente su qualsiasi host che supporti Docker – un laptop, un'istanza EC2, un server in un altro data center. L'ambiente è incorporato. Il drift di configurazione è impossibile.

"Quindi invece di preoccuparsi di ciò che è installato sull'istanza EC2," disse Leo, "costruiamo un'immagine che ha tutto. L'immagine funziona nello stesso modo ovunque."

"E se hai bisogno di testarlo localmente, esegui la stessa immagine," aggiunse Priya. "Non ci sono più 'funziona sulla mia macchina.'"

**Amazon ECS: L'Orchestratore**

Eseguire un singolo contenitore è semplice. Eseguire dozzine di contenitori su più host, instradare il traffico tra di essi, riavviare i contenitori falliti, distribuire nuove versioni senza tempi di inattività – ciò richiede un **orchestratore**.

**Amazon ECS (Elastic Container Service)** è il servizio di orchestrazione di contenitori gestito da AWS. Definisci:

- **Definizione del task**: quale immagine del contenitore eseguire, quanta CPU e memoria, quali variabili d'ambiente, quali porte esporre
- **Servizio**: quante copie del task eseguire, come gestire i fallimenti e le distribuzioni
- **Cluster**: l'infrastruttura di calcolo sottostante

ECS gestisce il resto: posiziona i task sulla capacità disponibile, riavvia i task falliti, esaurisce le connessioni durante le distribuzioni, registra i task sani con il load balancer.

Per Nimbus, l'API si è spostata dalle istanze EC2 con le distribuzioni gestite manualmente a ECS. Ogni nuova distribuzione ha spinto una nuova immagine Docker a **Amazon ECR (Elastic Container Registry)** – il registro di container gestito da AWS – e ECS l'ha distribuita su tutti i task con zero tempi di inattività.

**Fargate vs Tipo di Lancio EC2**

ECS può eseguire i contenitori in due modalità:

**Tipo di lancio EC2**: gestisci le istanze EC2 sottostanti. Sei responsabile della patch delle istanze, della loro ridimensionamento e della garanzia che ci sia abbastanza capacità per i tuoi contenitori. Più controllo, più responsabilità.

**Fargate (calcolo serverless per contenitori)**: AWS gestisce l'infrastruttura sottostante interamente. Specifichi CPU e memoria per task; Fargate provisiona la capacità giusta automaticamente. Nessuna istanza EC2 da gestire. Paghi per vCPU-secondo e GB-secondo di memoria.

Fargate è il modello "contenitori serverless" – ottieni l'isolamento dell'ambiente dei contenitori senza gestire server. Il compromesso: meno controllo sulla configurazione dell'istanza sottostante e un costo leggermente più elevato per unità.

For Nimbus: Fargate per il servizio API. Non volevano gestire istanze EC2 per i container.

**Amazon EKS: Quando hai bisogno di Kubernetes**

**Kubernetes** è un sistema di orchestrazione di container open-source — essenzialmente lo standard del settore per la gestione dei container su larga scala. È potente, estendibile e complesso.

**Amazon EKS (Elastic Kubernetes Service)** è il servizio Kubernetes gestito di AWS. Esegue il piano di controllo di Kubernetes (lo strato di gestione) per te, mentre tu gestisci i nodi worker (o usi Fargate anche per quelli).

Quando usare EKS rispetto a ECS?

**Usa ECS** se:

- Sei principalmente su AWS e desideri un'esperienza più semplice e nativa per AWS
- Il tuo team non ha competenze esistenti in Kubernetes
- Vuoi meno oneri operativi

**Usa EKS** se:

- Hai bisogno di funzionalità specifiche di Kubernetes (Definizioni di Risorse Personalizzate, Helm charts, l'ecosistema Kubernetes)
- Il tuo team conosce già Kubernetes
- Stai eseguendo un ambiente ibrido (alcuni on-premises, alcuni su AWS) e desideri un livello di orchestrazione coerente
- Il tuo carico di lavoro ha requisiti che corrispondono alla flessibilità di Kubernetes

"Quale dovremmo usare?" chiese Maya.

"ECS," rispose Priya immediatamente. "Non abbiamo competenze in Kubernetes. ECS fa tutto ciò di cui abbiamo bisogno. Aggiungere Kubernetes in questo momento aggiungerebbe complessità operativa senza un beneficio pratico."

"Possiamo sempre migrare a EKS in seguito se superiamo ECS," aggiunse Leo.

Questa è una risposta senior corretta: scegli lo strumento più semplice che si adatta alle tue esigenze attuali.

**Come i Container Cambiano i Deployments**

Prima dei container, il rilascio di una nuova versione dell'API Nimbus significava:

1. Accedere tramite SSH a ogni istanza EC2
2. Estrarre il codice più recente da Git
3. Installare/aggiornare le dipendenze
4. Riavviare il processo dell'applicazione
5. Verificare la salute
6. Passare all'istanza successiva

Questo era soggetto a errori e lento. Richiedeva coordinamento. Se il passaggio 3 falliva sull'istanza 4, avresti avuto un deployment misto con alcune istanze che eseguivano la vecchia versione e alcune che non riuscivano a eseguire la nuova versione.

Con ECS e i container:

1. Costruisci una nuova immagine Docker (automatizzata nel pipeline CI/CD)
2. Carica su ECR
3. Aggiorna il servizio ECS per utilizzare la nuova versione dell'immagine

ECS gestisce il deployment graduale: avvia nuove attività con la nuova immagine, attende che siano sane e poi interrompe le vecchie attività. Zero-downtime deployment, automatizzato.

Se la nuova versione fallisce nei controlli di salute, ECS interrompe il deployment e la vecchia versione continua a servire il traffico.

## Punti di Forza e Limitazioni

**Container:**

- Eliminano l'incoerenza dell'ambiente ("funziona sulla mia macchina")
- Consentono deploy rapidi e affidabili
- Immobili — la stessa immagine viene eseguita identicamente ovunque
- Efficienti — più leggeri delle VM, avvio più rapido

**ECS:**

- Più semplice di Kubernetes per carichi di lavoro incentrati su AWS
- Integrazione stretta con AWS (IAM, ALB, CloudWatch, Secrets Manager)
- Opzione Fargate elimina la gestione delle istanze EC2

**EKS:**

- Piena compatibilità con Kubernetes — utilizza l'intero ecosistema
- Migliore per ambienti ibridi o team con competenze in Kubernetes
- Più complesso da configurare e gestire rispetto a ECS

**Dove diventa complicato:**

- Le immagini dei container devono essere costruite e versionate — richiede un pipeline CI/CD
- Il debug dei container richiede strumenti diversi rispetto al debug dei processi tradizionali
- I container stativi (database in container) richiedono una configurazione accurata dello storage persistente
- La comunicazione tra i container (tra servizi) richiede la comprensione dei concetti di networking dei container

## Riepilogo

- **Container** raggruppano il codice dell'applicazione, il runtime e le dipendenze insieme — vengono eseguiti identicamente ovunque.
- **Docker** è la tecnologia di container standard. Le immagini sono progetti; i container sono istanze in esecuzione.
- **ECR (Elastic Container Registry)** è il registro Docker gestito di AWS — memorizza e gestisce le versioni delle tue immagini qui.
- **ECS (Elastic Container Service)** orchestra i container. Definisci task e servizi; ECS gestisce il posizionamento e il ciclo di vita.
- **Fargate** è il calcolo serverless per i container — non è necessario gestire istanze EC2.
- **EKS (Elastic Kubernetes Service)** è Kubernetes gestito — per i team che hanno bisogno di funzionalità di Kubernetes o compatibilità.
- Scegli ECS per la semplicità su AWS; scegli EKS per la compatibilità con l'ecosistema Kubernetes.

## Suggerimenti per l'Esame

*SAA-C03 Domain: Design Resilient Architectures (Domain 2, Task 2.1)*

- **Segnali ECS vs EKS**: Scenari d'esame che menzionano "Kubernetes", "Helm", "esperienza esistente con Kubernetes" o "orchestrazione di container multi-cloud" → EKS. Tutto il resto → ECS.
- **Tipo di lancio Fargate vs EC2**: "Non voglio gestire istanze EC2 per i container", "container serverless", "nessuna gestione dell'infrastruttura" → Fargate. "Ho bisogno di tipi di istanza specifici", "carichi di lavoro GPU", "controllo granulare dell'istanza" → Tipo di lancio EC2.
- **Ruoli di attività ECS**: Come i ruoli di istanza EC2, le attività ECS hanno ruoli IAM. Ogni attività può avere diverse autorizzazioni. Scenario d'esame: "il contenitore deve leggere da S3" → applica un ruolo IAM all'attività di definizione.
- **Scansione immagini ECR**: ECR può scansionare le immagini dei container per vulnerabilità note (CVE). Segnale d'esame: "scansiona i container per vulnerabilità di sicurezza" → Scansione immagini ECR.
- **Distribuzioni blu/verde**: ECS supporta le distribuzioni blu/verde tramite l'integrazione di CodeDeploy. Distribuzione senza tempi di inattività con ripristino automatico. Scenario d'esame: "distribuisci senza tempi di inattività con ripristino automatico" → ECS + CodeDeploy blu/verde.
- **Scala automatica del servizio ECS**: Scala il numero di attività in base a CPU, memoria o metriche personalizzate di CloudWatch. Funziona con ALB per instradare il traffico al numero corretto di attività in esecuzione.

## Esercizi

**Esercizio 1 — Ricordo**

Spiega la differenza tra un'immagine Docker e un contenitore Docker. Spiega la differenza tra ECS e ECR.

*(Suggerimento: l'immagine è per il contenitore come una ricetta è per il piatto cucinato. ECR memorizza le immagini; ECS le esegue.)*

**Esercizio 2 — Esercitazione d'esame**

*Scenario*: Un'azienda ha un'applicazione a microservizi attualmente in esecuzione su istanze EC2 gestite manualmente. Il team fatica con i deployment incoerenti: istanze EC2 diverse hanno librerie diverse, causando bug difficili da riprodurre. Vogliono standardizzare i deployment riducendo al minimo il carico operativo per la gestione dei server sottostanti. Il team non ha esperienza con Kubernetes.

Quale soluzione soddisfa meglio questi requisiti?

A) Distribuisci su EC2 con AWS Systems Manager Patch Manager per mantenere le istanze coerenti
B) Contenutizza l'applicazione con Docker; usa Amazon ECS con il tipo di lancio Fargate
C) Contenutizza l'applicazione con Docker; usa Amazon EKS con nodi auto-gestiti
D) Usa AWS Elastic Beanstalk per gestire i deployment e la configurazione dell'istanza automaticamente

*(Suggerimento 1*: I contenitori risolvono direttamente il problema dell'"ambiente incoerente". Quali opzioni usano i contenitori?

*(Suggerimento 2*: "Ridurre al minimo il carico operativo per la gestione dei server" → Fargate (nessuna gestione EC2) vs nodi auto-gestiti (ancora gestiti EC2).

*(Suggerimento 3*: "Nessuna esperienza con Kubernetes" → EKS è maggiore complessità rispetto a ECS.

**Risposta**: B

**Spiegazione**: Contenutizzare con Docker garantisce che ogni distribuzione utilizzi la stessa immagine con le stesse dipendenze — eliminando il drift di configurazione. ECS con Fargate significa nessun'istanza EC2 da gestire. Il team si concentra sul codice dell'applicazione e sulle definizioni dei contenitori, non sulla manutenzione dei server. ECS (non EKS) è appropriato per i team senza esperienza con Kubernetes.

**Perché non A?** Patch Manager mantiene le istanze EC2 aggiornate, ma non risolve il problema delle versioni delle librerie tra le applicazioni. Il problema fondamentale (ambienti di codice diversi su istanze diverse) rimane.

**Perché non C?** EKS con nodi auto-gestiti richiede la gestione delle istanze EC2 *e* l'apprendimento di Kubernetes. Nessuno dei due si allinea ai requisiti.

**Perché non D?** Elastic Beanstalk gestisce il deployment dell'applicazione su EC2, ma non risolve il problema dell'incoerenza dell'ambiente a meno che non vengano utilizzati i contenitori. Beanstalk non utilizza le immagini Docker per impostazione predefinita (anche se può essere configurato per farlo).

*SAA-C03 Dominio: Progetta Architetture Resilienti — Task 2.1*

**Esercizio 3 — Sfida Architettonica** *(Opzionale)*

Nimbus sta suddividendo l'API monolitica in tre microservizi: il servizio ordine, il servizio menu e il servizio di notifica. Ogni servizio ha requisiti di scalabilità diversi (il servizio ordine scala con il traffico; il servizio menu è principalmente di sola lettura e stabile; il servizio di notifica ha scatti).

Progetta l'architettura ECS per questi tre servizi. Come gestiresti la comunicazione tra i servizi? Usaresti un singolo cluster ECS o tre? Come configureresti l'Auto Scaling in modo diverso per ogni servizio?

*(Non esiste una risposta corretta. L'obiettivo è praticare l'architettura dei microservizi su ECS.)*

## Scena Post-Crediti

Il primo deployment di container è stato perfetto.

Nuova versione dell'API: zero downtime. ECS l'ha distribuita, i controlli di salute sono passati, le attività vecchie sono state drenate, le nuove attività hanno preso il controllo. Leo ha osservato lo stato dell'attività nel pannello con qualcosa che assomigliava alla incredulità.

"Funziona semplicemente", ha detto.

"Questo è il punto", ha detto Priya.

"Nessun SSH. Nessun downtime. Nessun 'attendi che si riavvii'."

"L'immagine è l'artefatto di distribuzione", ha detto. "L'ambiente è immutabile. Il processo di distribuzione è dichiarativo. Questo è il modo in cui dovrebbero essere spediti il software."

Leo ha fissato il pannello per un altro momento.

"Ho passato tre anni a coordinare le implementazioni di EC2," disse lui. "Coordinando gli script SSH. Scrivendo i manuali operativi per le implementazioni."

"Stavi risolvendo un problema," disse Priya, "che i container risolvono per design."

Non disse altro dopo. Ma la mattina seguente, iniziò a scrivere la documentazione sul processo di build dei container, così nessuno avrebbe dovuto passare tre anni a scoprirlo.

Nel prossimo capitolo: il diagramma di flusso che si esegue da solo — e ricorda dove si è fermato.
