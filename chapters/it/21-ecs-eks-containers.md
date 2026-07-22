# Capitolo 21: Container per il Codice

Prima del 1956, caricare le merci su una nave era una trattativa specializzata e complessa. Ogni nave aveva stive diverse. Ogni porto aveva gru diverse. Ogni vettore aveva sistemi diversi per tracciare cosa andava dove. Una cassa di merci passava da camion a banchina, da banchina a nave, da nave a banchina, da banchina a camion, attraverso una catena di persone che la maneggiavano ciascuna a modo suo. Le merci andavano perse. Le merci si danneggiavano. Le stesse merci, spedite due volte, arrivavano in condizioni diverse perché la gestione era stata diversa entrambe le volte.

La risposta, quando qualcuno alla fine la formulò con chiarezza, fu: standardizzare il container. Non risolvere il problema in ogni porto. Risolverlo una volta sola, a livello di container. Spedire la scatola, non solo il contenuto. Il container di spedizione standardizzato non rese solo le spedizioni più veloci — le rese *prevedibili*. Il contenuto di un container a Shanghai era esattamente nello stesso stato quando arrivava a Rotterdam, perché il container lo proteggeva dalla variabilità in ogni punto di trasferimento.

Questo era esattamente il problema di Leo. Il container non lo avrebbe reso uno sviluppatore più veloce. Avrebbe reso i deploy prevedibili.

---

La migrazione a Lambda di Leo aveva ridotto il conto EC2 per i servizi più piccoli. Ma l'API principale era diversa — girava in continuazione, gestiva tutto il traffico degli ordini e accumulava cronologia di configurazione da otto mesi. Lambda risolveva il problema dell'inattività. I container avrebbero risolto l'inconsistenza.

L'API principale non era inattiva; non poteva passare a Lambda. Ma aveva un problema diverso: le istanze EC2 che la eseguivano avevano divergito tra loro.

---

Leo aveva imparato a non dire "funziona sulla mia macchina" ad alta voce. Non era una difesa — era una diagnosi. E la diagnosi questa volta era l'istanza EC2 di produzione numero tre, che aveva ricevuto un patch di libreria sei settimane prima senza che nessuno lo documentasse, che le altre due istanze non avevano ricevuto, e che stava ora causando un bug esistente solo lì, in quell'unica istanza, invisibile ovunque altrove.

Aveva passato tre ore la notte prima a rintracciarlo.

"Ogni volta che facciamo il deploy," disse la mattina dopo, "dobbiamo coordinare su più istanze. Nuova versione, dipendenze diverse. Funziona in staging, si rompe in produzione perché gli ambienti hanno divergito."

"Perché qualcuno ha aggiornato un pacchetto sull'istanza tre senza aggiornare le altre," disse Priya. Non con cattiveria.

"Avevo bisogno di una versione specifica di—"

"Lo so," disse lei. "E ora l'istanza tre ha una storia diversa dall'istanza uno e due. Questo è il configuration drift. È silenzioso finché non esplode."

"Qual è la vera soluzione?" chiese Maya.

"Smettila di trattare i server come oggetti permanenti da configurare," disse Priya. "Inizia a trattarli come unità usa e getta da sostituire."

**Cos'è un Container?**

"Pensatelo come un container di spedizione," disse Leo, prendendo un pennarello. "Al container non importa su quale nave si trova. Alla nave non importa cosa c'è dentro il container. Hanno concordato le dimensioni e il meccanismo di bloccaggio. Tutto il resto è dentro la scatola."

Un **container** è un'unità leggera e portatile che racchiude la tua applicazione insieme a tutto ciò di cui ha bisogno per girare: il runtime (Python 3.11, Node.js 20, Java 17), le librerie e le dipendenze, i file di configurazione e il codice dell'applicazione stesso.

A differenza di una macchina virtuale (che emula un intero computer, kernel del sistema operativo incluso), un container condivide il kernel del sistema operativo host mantenendo tutto il resto isolato. Questo rende i container veloci da avviare (secondi, a volte millisecondi) e leggeri (megabyte, non gigabyte).

La tecnologia di container più diffusa è **Docker**. Un'immagine Docker è il blueprint — uno snapshot dell'applicazione e del suo ambiente. Un container Docker è un'istanza in esecuzione di quell'immagine.

La proprietà chiave: **immutabilità**. Un'immagine costruita oggi girerà in modo identico su qualsiasi host che supporti Docker — un laptop, un'istanza EC2, un server in un altro data center. L'ambiente è incorporato nell'immagine. Il configuration drift è impossibile.

"Quindi invece di preoccuparci di cosa è installato sull'istanza EC2," disse Leo, "costruiamo un'immagine che ha tutto. L'immagine gira allo stesso modo ovunque."

"E se hai bisogno di testarlo in locale, esegui la stessa immagine," aggiunse Priya. "Basta con il 'funziona sulla mia macchina.'"

**Costruire l'Immagine Docker e Caricarla su ECR**

Prima che qualsiasi orchestratore potesse gestire il container, Leo doveva costruirlo e salvarlo in un posto da cui ECS potesse scaricarlo.

Scrisse il Dockerfile:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

La riga chiave: `FROM python:3.11-slim`. Non Python 3.9. Non Python 3.10. 3.11 — la versione specifica su cui il team si era accordato, incorporata nell'immagine. Ogni istanza che avesse eseguito questa immagine avrebbe usato esattamente Python 3.11. Il comportamento di arrotondamento del modulo decimal sarebbe stato identico ovunque.

Costruì l'immagine in locale: `docker build -t nimbus-api:1.0.0 .`

La build impiegò 4 minuti. Docker scaricò l'immagine base, installò le dipendenze, copiò il codice dell'applicazione e produsse un'immagine con tag `nimbus-api:1.0.0`.

La eseguì in locale: `docker run -p 8000:8000 nimbus-api:1.0.0`

L'API si avviò. Stessa porta, stesso comportamento del server di produzione — perché l'ambiente era identico.

Poi la caricò su ECR:

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region us-west-2 |   docker login --username AWS --password-stdin   123456789012.dkr.ecr.us-west-2.amazonaws.com

# Tag the image for ECR
docker tag nimbus-api:1.0.0   123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0

# Push
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0
```

Il caricamento impiegò 2 minuti. ECR salvò l'immagine, avviò immediatamente una scansione e riportò i risultati entro 5 minuti.

**Amazon ECS: L'Orchestratore**

Eseguire un singolo container è semplice. Eseguire dozzine di container su più host, instradare il traffico tra di essi, riavviare i container falliti, fare il deploy di nuove versioni senza downtime — questo richiede un **orchestratore**.

**Amazon ECS (Elastic Container Service)** è il servizio di orchestrazione container gestito da AWS. Definisci:

- **Task definition**: quale immagine container eseguire, quanta CPU e memoria, quali variabili d'ambiente, quali porte esporre
- **Service**: quante copie del task eseguire, come gestire i fallimenti e i deploy
- **Cluster**: l'infrastruttura di calcolo sottostante

ECS gestisce il resto: posiziona i task sulla capacità disponibile, riavvia i task falliti, drena le connessioni durante i deploy, registra i task sani con il load balancer.

Per Nimbus, l'API passò dalle istanze EC2 con deploy gestiti manualmente a ECS. Ogni nuovo deploy caricava una nuova immagine Docker su **Amazon ECR (Elastic Container Registry)** — il registro container gestito da AWS — e ECS la distribuiva su tutti i task con zero downtime.

**Fargate vs EC2 Launch Type**

ECS può eseguire container in due modalità:

**EC2 launch type**: tu gestisci le istanze EC2 sottostanti. Sei responsabile del patching delle istanze, del dimensionamento corretto e di garantire che ci sia capacità sufficiente per i tuoi container. Più controllo, più responsabilità.

**Fargate (calcolo serverless per container)**: AWS gestisce interamente l'infrastruttura sottostante. Specifichi CPU e memoria per task; Fargate provisiona automaticamente la capacità giusta. Nessuna istanza EC2 da gestire. Paghi per vCPU-secondo e GB-secondo di memoria.

Fargate è il modello "container serverless" — ottieni l'isolamento dell'ambiente dei container senza gestire server. Il compromesso: meno controllo sulla configurazione dell'istanza sottostante e un costo leggermente più alto per unità.

"Quanto costa al mese?" chiese Tom, aprendo il calcolatore dei prezzi. "Fargate rispetto a EC2 launch type — voglio vedere i numeri reali."

La stima a spanne di Leo — quella che tutti portano in testa — era che Fargate sarebbe costato di più. Convenienza serverless, prezzo premium. Calcolava forse un venti o trenta percento in più rispetto a EC2.

"Fai i conti veri," disse Tom, perché Tom era fatto così.

Il servizio API di Nimbus girava con 3 task, ciascuno con 0,5 vCPU e 1 GB di memoria, 24/7:

**Fargate**: $0,04048/vCPU-ora × 0,5 × 3 × 720 ore = $43,72/mese per CPU. $0,004445/GB-ora × 1 × 3 × 720 = $9,60/mese per memoria. Totale: $53,32/mese.

**EC2 launch type** (3 × t3.medium a $0,0416/ora — tre istanze perché il fleet da eseguire ne richiedeva una per Availability Zone per garantire disponibilità): $0,0416 × 3 × 720 = $89,86/mese.

"Aspetta," disse Tom. "Fargate è più economico?"

"A questa scala, sì," disse Leo. "Fargate addebita esattamente quello che allochi. Le istanze EC2 hanno overhead — il sistema operativo e l'agente ECS consumano CPU e memoria prima ancora che i tuoi container partano. Una t3.medium offre 2 vCPU e 4 GB, ma stai usando 0,5 vCPU e 1 GB per container. Il resto va sprecato."

"Ma con EC2 launch type puoi impacchettare più task su una sola istanza."

"Sì. A scale maggiori, con un bin-packing accurato, EC2 launch type diventa più economico. Alla nostra scala — tre task — Fargate vince."

Tom lo scrisse.

Per Nimbus: Fargate per il servizio API. Non volevano gestire istanze EC2 per i container.

Se containerizzi con Fargate, elimini tutto l'overhead di gestione EC2 — ma rinunci alla possibilità di personalizzare i tipi di istanza, il che conta per workload GPU o networking specializzato. Se scegli ECS per la semplicità AWS-native, guadagni una stretta integrazione con IAM e ALB — ma rimani fuori dall'ecosistema Kubernetes, il che richiederebbe una rearchitettura se in futuro ti servisse la portabilità multi-cloud.

**Amazon EKS: Quando Hai Bisogno di Kubernetes**

**Kubernetes** è un sistema di orchestrazione container open-source — essenzialmente lo standard del settore per gestire container su larga scala. È potente, estendibile e complesso.

**Amazon EKS (Elastic Kubernetes Service)** è il servizio Kubernetes gestito da AWS. Gestisce il control plane di Kubernetes (lo strato di gestione) per te, mentre tu gestisci i worker node (o usi anche Fargate per quelli).

Potresti chiederti: se Kubernetes è lo standard del settore e compare in ogni annuncio di lavoro, perché non usarlo direttamente? Perché "standard del settore" descrive quello che usano le grandi aziende con team di piattaforma dedicati. Per un team di sei persone che costruisce un'app di ordinazione cibo, Kubernetes aggiunge complessità operativa senza alcun beneficio pratico concreto. La complessità è reale; il beneficio è teorico a questa scala.

Kubernetes offre valore a un livello di complessità che la maggior parte dei team non necessita: definizioni di risorse personalizzate per costruire piattaforme interne, constraint di scheduling avanzati, pod disruption budget per un controllo granulare dei deploy, integrazione con service mesh per la gestione del traffico tra centinaia di microservizi. Queste sono capacità genuine. Sono anche capacità che una startup delle dimensioni di Nimbus non eserciterà mai.

Il principio di ingegneria qui si chiama talvolta YAGNI: You Aren't Gonna Need It. ECS dà a Nimbus tutto ciò di cui ha bisogno ora. EKS dà loro più di quanto servano, più una curva di apprendimento significativa e overhead operativo. "Sarà utile in futuro" non è una buona ragione per aggiungere complessità adesso.

Quando usare EKS rispetto a ECS?

**Usa ECS** se:

- Sei principalmente su AWS e vuoi un'esperienza più semplice e AWS-native
- Il tuo team non ha competenze esistenti in Kubernetes
- Vuoi meno overhead operativo

**Usa EKS** se:

- Hai bisogno di funzionalità specifiche di Kubernetes (Custom Resource Definition, Helm chart, l'ecosistema Kubernetes)
- Il tuo team conosce già Kubernetes
- Stai eseguendo un ambiente ibrido (parte on-premises, parte su AWS) e vuoi un livello di orchestrazione coerente
- Il tuo workload ha requisiti che corrispondono all'estendibilità di Kubernetes

**Networking dei Container: IP Effimeri e Service Discovery**

Una cosa che coglie i team di sorpresa quando passano ai container: l'indirizzo IP di un container cambia ogni volta che viene riavviato.

Nel mondo EC2, le istanze avevano IP privati relativamente stabili. Potevi (anche se non avresti dovuto) inserirli direttamente nei file di configurazione. I servizi si conoscevano tramite IP.

Nel mondo dei container, ogni task in ECS riceve un IP dalla subnet VPC quando parte. Quando si ferma e ne parte uno nuovo (come parte di un deploy o di un riavvio), il nuovo task riceve un IP diverso.

"Cosa succede quando un servizio è hardcoded per chiamare `10.0.1.45` e quel container viene sostituito da `10.0.1.82`?" chiese Priya. "Il servizio chiamante inizia a non raggiungere niente."

Per questo la service discovery è importante negli ambienti a container. ECS + Application Load Balancer gestisce questo automaticamente: il nome DNS dell'ALB è stabile; ECS registra i task sani nel target group; l'ALB instrada verso i task attualmente sani. Il servizio chiamante parla al nome DNS dell'ALB, non agli IP dei singoli container.

Per la comunicazione interna tra servizi (non esposta agli utenti), **AWS Cloud Map** fornisce la service discovery: ogni servizio ECS si registra con Cloud Map, che fornisce un nome DNS stabile. Il servizio ordini chiama `http://notification.nimbus.local:8080`, e Cloud Map risolve quel nome verso i task attualmente sani del servizio notifiche.

"Quindi i container si parlano tramite nomi DNS, non IP?" confermò Leo.

"Esatto. L'IP è effimero. Il nome DNS è il contratto."

**Iniezione dei Segreti: Niente Segreti nelle Variabili d'Ambiente**

Il deploy originale su EC2 aveva un problema che Priya aveva segnalato per mesi: i segreti (password del database, chiavi API, credenziali SES) erano memorizzati come variabili d'ambiente sull'istanza EC2, impostati tramite uno script di deploy.

Le variabili d'ambiente sono accessibili a qualsiasi processo in esecuzione sull'istanza. Compaiono negli strumenti di debug, in alcuni crash report e nelle liste dei processi. Sono visibili anche in CloudWatch se le si registra (cosa che alcuni strumenti di sviluppo fanno per impostazione predefinita).

I container non risolvono questo automaticamente — potresti ancora passare i segreti come variabili d'ambiente nella task definition ECS. E le task definition ECS sono conservate nella console AWS, visibili a chiunque abbia accesso a ECS.

Il pattern corretto: **integrazione tra AWS Secrets Manager e la task definition ECS**.

Invece di memorizzare la password del database nella task definition:

```json
"secrets": [
  {
    "name": "DB_PASSWORD",
    "valueFrom": "arn:aws:secretsmanager:us-west-2:123456789012:secret:nimbus/prod/db-password"
  }
]
```

ECS recupera il segreto da Secrets Manager al momento dell'avvio del task e lo inietta nel container come variabile d'ambiente. Il valore del segreto non viene mai memorizzato nella task definition — solo l'ARN del segreto in Secrets Manager. Il container riceve il valore a runtime. Secrets Manager può ruotare il valore senza modificare la task definition.

"E se qualcuno legge la task definition?" chiese Priya. "Vedrebbe l'ARN di Secrets Manager, ma non il valore."

"E senza le giuste autorizzazioni IAM," confermò Leo, "non può nemmeno recuperare il valore da Secrets Manager."

"È il design," disse Priya. "Il ruolo di esecuzione del task ha il permesso di leggere quel segreto specifico. Nient'altro. Compromettere la task definition ti dà un ARN, non una password."

"Quale dovremmo usare?" chiese Maya. "E perché non Kubernetes? È in ogni descrizione di lavoro. In ogni talk di conferenza."

"ECS," disse Priya immediatamente. "Non abbiamo competenze in Kubernetes. ECS fa tutto quello di cui abbiamo bisogno. Aggiungere Kubernetes adesso significherebbe aggiungere complessità operativa senza alcun beneficio pratico."

Soo-Jin, che aveva gestito cluster Kubernetes nella sua azienda precedente, annuì. "Ho portato quel cercapersone. Non lo vuoi finché non ne hai bisogno."

"Possiamo sempre migrare a EKS in seguito se ECS non ci basta," aggiunse Leo.

Questa è una risposta senior corretta: scegli lo strumento più semplice che si adatta alle tue esigenze attuali.

**ECR: Proteggere le Immagini**

"E se qualcuno cercasse di entrare attraverso un'immagine base vulnerabile?" chiese Priya. "Qualcuno prende un'immagine vecchia con una CVE nota e la usa per ottenere un punto d'appoggio nel container dell'applicazione?"

Era la domanda giusta da fare prima di eseguire qualsiasi container in produzione.

**Amazon ECR (Elastic Container Registry)** conserva le tue immagini Docker e può scansionarle alla ricerca di vulnerabilità note prima del deploy. La scansione delle immagini ECR verifica l'immagine rispetto a un database di CVE (Common Vulnerabilities and Exposures) note e segnala i problemi per severità.

La policy che Priya scrisse: nessuna immagine con una CVE di severità CRITICAL sarebbe stata distribuita in produzione. La pipeline CI/CD avrebbe controllato i risultati della scansione prima di aggiornare il servizio ECS. Se fosse stata trovata una vulnerabilità critica, la pipeline sarebbe fallita e avrebbe allertato il team.

"Non è paranoia," disse Priya. "È semplicemente avere un controllo prima del deploy."

**Come i Container Cambiano i Deploy**

Prima dei container, fare il deploy di una nuova versione dell'API Nimbus significava:

1. Connettersi via SSH a ogni istanza EC2
2. Scaricare il codice più recente da Git
3. Installare/aggiornare le dipendenze
4. Riavviare il processo applicativo
5. Verificare la salute
6. Passare all'istanza successiva

Era soggetto a errori e lento. Richiedeva coordinamento. Se il passaggio 3 falliva sull'istanza 4, ti ritrovavi con un deploy misto: alcune istanze con la vecchia versione e alcune che non riuscivano ad avviare la nuova.

Con ECS e i container:

1. Costruisci una nuova immagine Docker (automatizzata nella pipeline CI/CD)
2. Caricala su ECR
3. Aggiorna il servizio ECS per usare la nuova versione dell'immagine

ECS gestisce il rolling deployment: avvia i nuovi task con la nuova immagine, attende che siano sani, poi ferma i vecchi task. Deploy a zero downtime, automatizzato.

Se la nuova versione fallisce gli health check, ECS interrompe il deploy e la vecchia versione continua a servire il traffico.

**La Configurazione Minima per i Deploy: Gli Health Check**

Tutta la sicurezza dei deploy a container dipende dal fatto che gli health check funzionino davvero.

ECS usa due tipi di health check:

**Health check a livello di container**: definito nel Dockerfile o nella task definition. Gira dentro il container per verificare che l'applicazione risponda.

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3   CMD curl -f http://localhost:8000/health || exit 1
```

**Health check del target group ALB**: il load balancer invia periodicamente richieste HTTP a un endpoint di salute. I task che falliscono l'health check vengono rimossi dal target group.

Se nessuno dei due health check è configurato correttamente, ECS considera tutti i task sani — e farà il deploy di un'immagine rotta senza fermarsi. Questo è l'errore più comune nei deploy a container.

"L'endpoint di health check potrebbe esporre informazioni interne?" chiese Priya.

L'endpoint di health check su `/health` restituiva solo: `{"status": "ok"}`. Nessun numero di versione, nessuno stato delle dipendenze, nessuna configurazione interna. Qualsiasi informazione nella risposta di salute potrebbe essere utile a qualcuno che mappa l'applicazione. Mantieni gli endpoint di health minimali.

Per lo stato di salute interno dettagliato (connettività al database, controlli delle dipendenze), usa un endpoint separato autenticato `/health/detail` — accessibile solo dall'interno del VPC.

**Logging Strutturato: L'Unica Finestra su un Container in Esecuzione**

Su EC2, qualcosa andava storto e ci si connetteva via SSH. Si faceva la tail del file di log. Si controllava la tabella dei processi. Si verificava l'uso del disco. Si girava intorno.

In un container, non c'è SSH. Il container è effimero — potrebbe girare su qualsiasi host del cluster, e ECS lo sostituirà senza preavviso se fallisce gli health check. Nel momento in cui pensi di connetterti via SSH, il container che volevi esaminare potrebbe non esistere più.

I log non sono una comodità di debug negli ambienti containerizzati. Sono l'unica prova che qualcosa sia accaduto.

"E se un container fallisce silenziosamente e non abbiamo log?" chiese Priya durante la review dell'architettura a container. "Potremmo avere un task che esce con codice 1 e non sapere mai la causa se i log non erano stati catturati prima che terminasse."

Non è un'ipotesi. Succede sui primi deploy a container, sistematicamente.

Il pattern corretto: configura ogni container per inviare log strutturati ad **Amazon CloudWatch Logs** usando il log driver `awslogs`. ECS gestisce l'invio automaticamente — nessun agente di log da installare, nessun container sidecar necessario.

Nella task definition:

```json
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/nimbus-api",
    "awslogs-region": "us-west-2",
    "awslogs-stream-prefix": "ecs"
  }
}
```

Ogni riga scritta su stdout o stderr dentro il container viene catturata e inviata al log group `/ecs/nimbus-api`, organizzata per ID task. ECS crea un nuovo log stream per ogni task, così puoi trovare i log del container specifico che ha fallito — anche dopo che è stato sostituito.

Il ruolo di esecuzione del task ha bisogno del permesso di scrivere su CloudWatch Logs. Senza di esso, il log driver fallisce silenziosamente e tutti i log vengono persi.

**Log strutturati vs testo semplice**: i log in testo semplice ("Order 7741 placed") richiedono grep. I log JSON strutturati (`{"event": "order_placed", "order_id": "7741", "restaurant_id": "47", "amount": 3200}`) possono essere interrogati con CloudWatch Logs Insights usando una sintassi simile a SQL:

```
fields @timestamp, event, order_id, restaurant_id
| filter event = "order_placed"
| stats count(*) by restaurant_id
| sort count desc
| limit 10
```

Questa query gira direttamente sul log group. Nessun database. Nessuna pipeline di dati. Nessun ETL job. La risposta è lì in pochi secondi.

Questo non sostituisce il data lake di analytics che costruiremo nel capitolo 26. Risponde a domande operative — "quanti ordini dal ristorante 47 negli ultimi 30 minuti?" — nel mezzo di un incidente, quando non hai tempo di eseguire una query Athena.

**CloudWatch Container Insights**

**Container Insights** è una funzionalità di CloudWatch che raccoglie e aggrega metriche a livello di container — CPU, memoria, I/O di rete, I/O di storage — per cluster ECS, service e task. Invece di metriche a livello EC2 (come sta andando l'host?), vedi metriche a livello di task (come sta andando questo specifico servizio ECS?).

Abilitalo con un'impostazione sul cluster ECS:

```bash
aws ecs update-cluster-settings \
  --cluster nimbus-production \
  --settings name=containerInsights,value=enabled
```

Dopo l'abilitazione:

- Vedi una dashboard per ogni service: numero di task, utilizzo CPU, utilizzo memoria
- Puoi impostare allarmi sulla CPU a livello di task (anziché sulla CPU dell'host EC2, che è un segnale molto più grossolano)
- Puoi correlare i picchi di memoria con gli eventi di log — la memoria del task è salita al 95% alle 14:22; i log mostrano un picco di richieste in entrata dall'importazione del menu del ristorante 47 esattamente alle 14:21

"Quanto costa al mese?" chiese Tom.

Container Insights addebita le metriche personalizzate e lo storage dei log che genera. Alla scala di Nimbus (tre service, 3-6 task ciascuno), erano circa $12/mese — un costo ragionevole per la visibilità operativa a livello di task.

Leo lo abilitò entro la giornata.

La prima volta che un task fallì un health check e fu sostituito da ECS, la dashboard di Container Insights catturò l'evento automaticamente: ID task, ora di avvio, ora di fallimento, codice di uscita. Il log stream CloudWatch di quel task preservò le ultime 40 righe di output prima della terminazione — che mostravano un'eccezione non gestita scatenata da un JSON di menu malformato proveniente da un nuovo partner ristoratore.

Senza Container Insights e logging strutturato: un misterioso picco nei tassi di errore, un'indagine che richiedeva di connettersi via SSH a un host che non girava più sul task fallito, 45 minuti di supposizioni.

Con loro: un link al log stream nella dashboard CloudWatch, l'eccezione esatta, l'ID del ristorante, il campo incriminato — in meno di cinque minuti.

"Niente SSH," disse Leo, rivedendo il post-mortem. "Nessun downtime per investigare. I log hanno fatto il lavoro."

"I log fanno il lavoro," disse Priya, "solo se li hai configurati per essere catturati."


**Quando i Container Sono la Scelta Sbagliata**

"Aspetta — ma *perché* non dovremmo containerizzare tutto?" chiese Maya. "Mi hai appena convinto che i container risolvono tutti i problemi di configuration drift. Perché non eseguire ogni singolo servizio come container?"

Era la stessa domanda che aveva fatto su Lambda. La risposta era simile.

I container aggiungono requisiti operativi: hai bisogno di un container registry (ECR), una pipeline CI/CD che costruisca e carichi le immagini, un orchestratore (ECS), un monitoring configurato per visibilità a livello di task anziché a livello di istanza, e un team che capisca Docker e il versioning delle immagini.

Per un servizio che già funziona bene su EC2, stabile e senza configuration drift, il costo di containerizzarlo può superare il beneficio.

Casi specifici in cui i container sono la scelta sbagliata:

**Servizi stateful non progettati per la mobilità dei container**: i database nei container richiedono una gestione attenta dei volumi persistenti. La maggior parte dei team che esegue database nei container li sposta eventualmente su servizi gestiti (RDS, ElastiCache) dopo aver incontrato questa complessità.

**Servizi con requisiti hardware specializzati**: workload GPU, configurazioni di interfaccia di rete specifiche o elaborazione basata su FPGA richiedono istanze EC2 con hardware specifico. I container non cambiano questo — useresti comunque EC2 launch type, solo con container sopra, e l'astrazione dei container aggiunge complessità senza beneficio.

**Script e job molto semplici**: uno script Python di 40 righe che gira una volta a settimana e non ha problemi di configuration drift. Aggiungere Docker, ECR, task definition ECS e una pipeline CI/CD per questo è sproporzionato. Lambda è più semplice. Un semplice cron job su EC2 potrebbe esserlo ancora di più.

"Il principio," disse Leo, "è lo stesso di sempre: abbina lo strumento al problema. I container risolvono il configuration drift e la coerenza dei deploy. Se non hai quel problema, non hai bisogno dei container."

## AWS Batch: Container per Job su Larga Scala

ECS e EKS sono progettati per servizi a esecuzione continua — applicazioni che girano ininterrottamente, accettano richieste e scalano con il traffico. Ma alcuni workload sono diversi: girano per una durata fissa, elaborano un dataset definito, poi si fermano. Generare le fatture di fine mese per centinaia di ristoranti. Eseguire un job di training machine learning. Processare un'esportazione di analytics notturna.

Per questi workload, non vuoi un service — vuoi un job.

**AWS Batch** è un servizio completamente gestito che esegue job di batch computing a qualsiasi scala. Definisci il tuo job come container Docker (lo stesso formato usato da ECS), e Batch gestisce il resto: provisioning di compute EC2 o Fargate, scheduling dei job nelle code, scaling della capacità verso l'alto quando arrivano i job e verso zero quando hanno finito.

Concetti chiave:

- **Job definition:** il container Docker, i requisiti di risorse (vCPU, memoria) e il comando da eseguire
- **Job queue:** dove i job inviati aspettano prima di girare; ogni coda è associata a uno o più compute environment
- **Compute environment:** la capacità EC2 o Fargate sottostante. Può usare Spot Instance per risparmiare fino al 90% — Batch gestisce le interruzioni e i retry automaticamente

"Aspetta — ma *perché* useremmo Batch invece di eseguire semplicemente un task ECS?" chiese Maya.

"Perché un service ECS è sempre acceso," disse Leo. "Aspetta le richieste. Un job Batch gira, finisce, e Batch ridimensiona il compute a zero. Non paghi nulla tra un'esecuzione e l'altra."

Tom alzò lo sguardo dalla pagina dei prezzi. "E le Spot Instance?"

"Batch può girare su Spot. Se un'istanza Spot viene reclamata a metà job, Batch riprova automaticamente. Per un job di fatturazione di 45 minuti, va benissimo."

**vs. ECS/EKS:** ECS/EKS eseguono service — sempre accesi, guidati dalle richieste. Batch esegue job — durata finita, guidati dai dati, scala a zero quando inattivi.

**vs. Lambda:** Lambda ha un timeout di 15 minuti. I job Batch possono girare per ore o giorni.

Contesto Nimbus: il job di generazione fatture notturno richiede 45 minuti per centinaia di partner ristoratori. Lambda va in timeout a 15 minuti. Un service ECS sempre attivo spreca denaro 23 ore al giorno. Batch esegue il job su Spot Instance, finisce in 38 minuti, costa $1,20 e si spegne.

"Meno del caffè che ho comprato mentre aspettavo che finisse il vecchio script," disse Leo.

"E nessun EC2 da gestire," aggiunse Priya. "Batch lo provisiona, lo esegue, lo termina."

## Punti di Forza e Limitazioni

**Container**:

- Eliminano l'inconsistenza dell'ambiente ("funziona sulla mia macchina")
- Abilitano deploy rapidi e affidabili
- Immutabili — la stessa immagine gira in modo identico ovunque
- Efficienti — più leggeri delle VM, avvio più rapido

**ECS**:

- Più semplice di Kubernetes per workload incentrati su AWS
- Stretta integrazione AWS (IAM, ALB, CloudWatch, Secrets Manager)
- L'opzione Fargate elimina interamente la gestione di EC2

**EKS**:

- Piena compatibilità Kubernetes — usa l'intero ecosistema
- Migliore per ambienti ibridi o team con competenze Kubernetes
- Più complesso da configurare e gestire rispetto a ECS

**Dove si complica**:

- Le immagini container devono essere costruite e versionizzate — richiede una pipeline CI/CD
- Il debug dei container richiede strumenti diversi rispetto al debug dei processi tradizionali
- I container stateful (database nei container) richiedono una configurazione attenta dello storage persistente
- Il networking tra container (comunicazione service-to-service) richiede di capire i concetti di networking dei container

## Riepilogo

Lambda ha reso gratuito il compute inattivo. I container hanno reso deterministici i deploy. Insieme, hanno risolto due delle cause più comuni di dolore operativo per i team di ingegneria in crescita.

- **I container** raggruppano codice dell'applicazione, runtime e dipendenze insieme — girano in modo identico ovunque.
- **Docker** è la tecnologia container standard. Le immagini sono blueprint; i container sono istanze in esecuzione.
- **ECR (Elastic Container Registry)** è il registro Docker gestito da AWS — conserva, versiona e scansiona le tue immagini qui. Abilita la scansione delle immagini per individuare CVE prima del deploy.
- **ECS (Elastic Container Service)** orchestra i container. Definisci task e service; ECS gestisce il posizionamento e il ciclo di vita.
- **Fargate** è il calcolo serverless per container — nessuna istanza EC2 da gestire. Spesso più economico dell'EC2 launch type a scale ridotte grazie all'eliminazione dell'overhead EC2. A scale maggiori con un bin-packing attento dei task, EC2 launch type può diventare più conveniente.
- **EKS (Elastic Kubernetes Service)** è Kubernetes gestito — per team che necessitano di funzionalità o compatibilità Kubernetes. Scegli ECS per semplicità su AWS; scegli EKS per compatibilità con l'ecosistema Kubernetes.
- **Integrazione con Secrets Manager**: inietta i segreti nei container al momento del lancio tramite la task definition — non memorizzare valori segreti nelle variabili d'ambiente o direttamente nelle task definition.
- **Service discovery**: gli IP dei container sono effimeri. Usa nomi DNS ALB o Cloud Map per un indirizzamento stabile dei service.

## Suggerimenti per l'Esame

*Dominio SAA-C03: Progettare Architetture Resilienti (Dominio 2, Task 2.1)*

- **Segnali ECS vs EKS**: gli scenari d'esame che menzionano "Kubernetes", "Helm", "competenze Kubernetes esistenti" o "orchestrazione container multi-cloud" → EKS. Tutto il resto → ECS.
- **Fargate vs EC2 launch type**: "non vuole gestire istanze EC2 per i container", "container serverless", "nessuna gestione dell'infrastruttura" → Fargate. "Ha bisogno di tipi di istanza specifici", "workload GPU", "controllo granulare dell'istanza" → EC2 launch type.
- **Task role vs. task execution role** — un vero discriminatore d'esame. Il **task execution role** è usato dall'*agente* ECS per conto del task, prima e intorno al tuo codice: scarica l'immagine da ECR, recupera i segreti da Secrets Manager, scrive i log su CloudWatch. Il **task role** è quello che usa *il codice della tua applicazione dentro il container* per chiamare i service AWS: leggere da S3, scrivere su DynamoDB — come i ruoli dell'istanza EC2, ma per task, così ogni task può avere permessi diversi. "Il container ha bisogno di leggere da S3" → **task role** (allegato nella task definition). "Il task fallisce nel scaricare l'immagine / non riesce a recuperare il segreto" → al **execution role** mancano i permessi.
- **Fargate Spot**: esegui container tolleranti agli errori su capacità spare con uno sconto fino a ~70%, con un avviso di interruzione di due minuti — l'equivalente Fargate di EC2 Spot, configurato tramite capacity provider. Trigger d'esame: "eseguire container tolleranti alle interruzioni al costo minimo senza gestire istanze" → Fargate Spot.
- **Scansione immagini ECR**: ECR può scansionare le immagini container alla ricerca di vulnerabilità note (CVE). Segnale d'esame: "scansionare i container per vulnerabilità di sicurezza" → scansione immagini ECR.
- **Deploy blue/green**: ECS supporta i deploy blue/green tramite l'integrazione con CodeDeploy. Deploy a zero downtime con rollback automatico. Pattern d'esame: "fare il deploy senza downtime con rollback automatico" → ECS + CodeDeploy blue/green.
- **Integrazione Secrets Manager**: segnale d'esame: "iniettare segreti nei container senza memorizzare valori nelle task definition" → usa il campo `secrets` nella task definition referenziando un ARN di Secrets Manager. Il task execution role necessita del permesso `secretsmanager:GetSecretValue`.
- **ECS Service Auto Scaling**: scala il numero di task in base a CPU, memoria o metriche CloudWatch personalizzate. Funziona con ALB per instradare il traffico al numero corretto di task in esecuzione.
- **AWS Batch:** compute batch gestito per container Docker. Job queue → compute environment (EC2 o Fargate, supporta Spot). Da usare quando: il timeout di Lambda è troppo breve, un service ECS è uno spreco per job a durata finita. Trigger d'esame: "elaborazione batch su larga scala" o "job che gira per ore" → AWS Batch.

## Esercizi

**Esercizio 1 — Ricordo**

Spiega la differenza tra un'immagine Docker e un container Docker. Spiega la differenza tra ECS e ECR.

*(Suggerimento: l'immagine è il container di spedizione standardizzato che aspetta nel piazzale, e il container in esecuzione è quella stessa scatola in transito — ECR è il piazzale dei container, ECS è la compagnia di spedizione.)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: Un'azienda ha un'applicazione a microservizi attualmente in esecuzione su istanze EC2 gestite manualmente. Il team fatica con deploy inconsistenti — istanze EC2 diverse hanno versioni di libreria diverse, causando bug difficili da riprodurre. Vogliono standardizzare i deploy riducendo al minimo l'overhead operativo per la gestione dei server sottostanti. Il team non ha esperienza con Kubernetes.

Quale soluzione soddisfa MEGLIO questi requisiti?

A) Containerizza l'applicazione con Docker; usa Amazon ECS con EC2 launch type Fargate  
B) Esegui il deploy su EC2 con AWS Systems Manager Patch Manager per mantenere le istanze coerenti  
C) Containerizza l'applicazione con Docker; usa Amazon EKS con node group autogestiti  
D) Usa AWS Elastic Beanstalk per gestire i deploy e la configurazione dell'istanza automaticamente

**Suggerimento 1**: I container risolvono direttamente il problema dell'"ambiente inconsistente". Quali opzioni usano i container?

**Suggerimento 2**: "Ridurre al minimo l'overhead operativo per la gestione dei server" → Fargate (nessuna gestione EC2) vs nodi autogestiti (ancora gestione EC2).

**Suggerimento 3**: "Nessuna esperienza con Kubernetes" → EKS è più complessità operativa rispetto a ECS.

**Risposta**: A

**Spiegazione**: Containerizzare con Docker garantisce che ogni deploy usi la stessa immagine con le stesse dipendenze — eliminando il configuration drift. ECS con Fargate significa nessuna istanza EC2 da gestire. Il team si concentra sul codice dell'applicazione e sulle definizioni dei container, non sulla manutenzione dei server. ECS (non EKS) è appropriato per team senza esperienza con Kubernetes.

**Perché non B?** Patch Manager mantiene le istanze EC2 aggiornate ma non risolve l'inconsistenza delle versioni di libreria tra le applicazioni. Il problema fondamentale (ambienti di codice diversi su istanze diverse) rimane.

**Perché non C?** EKS con node group autogestiti richiede la gestione delle istanze EC2 *e* l'apprendimento di Kubernetes. Nessuno dei due è in linea con i requisiti.

**Perché non D?** Elastic Beanstalk gestisce il deploy dell'applicazione su EC2 ma non risolve l'inconsistenza dell'ambiente a meno che non vengano usati i container. Beanstalk non usa immagini Docker per impostazione predefinita (anche se può essere configurato per farlo).

*Dominio SAA-C03: Progettare Architetture Resilienti — Task 2.1*

**Esercizio 3 — Sfida di Architettura** *(Opzionale)*

Nimbus sta dividendo l'API monolitica in tre microservizi: il service degli ordini, il service del menu e il service delle notifiche. Ogni service ha requisiti di scaling diversi (il service degli ordini scala con il traffico; il service del menu è principalmente in sola lettura e stabile; il service delle notifiche ha picchi improvvisi).

Progetta l'architettura ECS per questi tre service. Come gestiresti la comunicazione service-to-service? Useresti un cluster ECS o tre? Come configureresti l'Auto Scaling in modo diverso per ogni service?

Considera: il service del menu è read-heavy e potrebbe servire dati con 60 secondi di staleness — aggiungeresti caching davanti ad esso? Il service delle notifiche scala in modo esplosivo il venerdì sera — imposteresti la capacità minima Fargate a 1 e la massima a 20? Cosa succede alle notifiche in transito durante un evento di scale-down?

*(Non esiste una risposta corretta. L'obiettivo è praticare l'architettura a microservizi su ECS.)*

## Scena Post-Crediti

Il primo deploy a container fu perfetto.

Nuova versione dell'API: zero downtime. ECS la distribuì, gli health check passarono, i vecchi task si svuotarono, i nuovi task presero il controllo. Leo guardò lo stato dei task nella console con qualcosa che assomigliava all'incredulità.

"Ha semplicemente funzionato," disse.

"La settimana scorsa hai detto la stessa cosa del deploy SSH manuale prima che fallisse sull'istanza tre," disse Priya.

"Ho già fatto il deploy — oh." Leo si fermò. "Ho fatto il deploy senza taggare la versione dell'immagine. Lasciatemi correggere."

"Questo è il punto," disse Priya. "Il versioning delle immagini è il modo in cui tieni traccia di cosa gira."

"Come sai quale versione è in produzione adesso?" chiese Maya.

Leo aprì la console ECS. Sotto il task in esecuzione, l'immagine era elencata: `123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.3`. Versione 1.0.3. Costruita alle 14:22 UTC. Distribuita alle 14:31 UTC.

"Con il vecchio setup EC2," disse Leo, "avrei dovuto connettermi via SSH a un'istanza ed eseguire `pip show` per vedere quale versione di ogni dipendenza era installata. E poteva essere diversa sulle altre istanze."

"E adesso?"

"Il tag sull'immagine mi dice esattamente cosa gira. La cronologia delle scansioni ECR mi dice se è stata scansionata. La cronologia dei deploy ECS mi dice quando è stata distribuita e qual era la versione precedente."

"Niente SSH. Nessun downtime. Nessun 'aspetta che si riavvii.'"

"L'immagine è l'artefatto di deploy," disse Priya. "L'ambiente è immutabile. Il processo di deploy è dichiarativo. Questo è il modo in cui il software dovrebbe essere spedito."

Leo fissò la console per un altro momento.

"Ho passato tre anni a coordinare i deploy su EC2," disse. "A coordinare script SSH. A scrivere runbook di deploy."

"Stavi risolvendo un problema," disse Priya, "che i container risolvono per design."

Non disse altro dopo. Ma la mattina seguente, iniziò a scrivere la documentazione sul processo di build dei container, perché nessun altro dovesse passare tre anni a capirlo.

Il bug dell'istanza tre, le sei settimane di drift non documentato, e i problemi simili che non avevano ancora scoperto — tutto aveva un'unica causa radice. Non un attore malevolo. Non un guasto hardware. Solo un server trattato come un oggetto permanente invece che come un'unità usa e getta.

Il container era la risposta a quello. Non perché fosse nuovo e interessante. Perché rendeva impossibile fare la domanda.

Nel prossimo capitolo: il diagramma di flusso che si esegue da solo — e ricorda dove si è fermato.
