# Capitolo 24: Il Database Che Cresce Con Te

Immagina una biblioteca che è partita con due scaffali e un bibliotecario. Era abbastanza, per un po'. Il bibliotecario sapeva dove si trovava tutto. Le richieste ricevevano risposta rapidamente. Poi la biblioteca è cresciuta: dieci scaffali, venti, quaranta. Lo stesso bibliotecario, la stessa scrivania, lo stesso catalogo a schede. Ora trovare qualcosa richiede di aspettare. Il bibliotecario non è lento — c'è solo più biblioteca di quanta una sola persona possa servire al ritmo originale.

La soluzione non è un bibliotecario più veloce. È un tipo di biblioteca diverso.

---

Dopo la riduzione dei costi S3, Tom continuò la sua revisione. Il livello del database era un tipo diverso di problema — non dati inattivi nella classe di storage sbagliata, ma un sistema che lottava attivamente sotto il carico di sei mesi di crescita del traffico.

---

I numeri non erano confortanti.

Nimbus stava usando RDS PostgreSQL: Multi-AZ, istanza db.r6g.large. $340/mese.

Leo aprì il dashboard delle metriche di CloudWatch. I numeri avevano un pattern.

**DatabaseConnections**: 198 su un massimo di 200 durante il picco del venerdì. Due connessioni dalla saturazione. A 200, i nuovi tentativi di connessione sarebbero falliti con "too many connections" — un errore che si sarebbe manifestato come HTTP 500 ai clienti che ordinavano la cena.

**CPUUtilization**: 89% di picco durante il rush del venerdì sera. L'istanza era progettata per gestire i picchi — una db.r6g.large ha 2 vCPU e 16 GB di memoria — ma un CPU sostenuto all'89% significava che il database era al limite prima ancora che arrivasse l'ora di punta.

**ReadLatency**: 840 millisecondi P95. Sei mesi prima era 180ms. Il degrado era stato graduale — da 10 a 20ms per settimana — invisibile finché non era diventato catastrofico. La settimana prima della revisione di Tom, la latenza P99 aveva superato il secondo intero. I clienti che cliccavano sul menu di un ristorante aspettavano più di un secondo per il caricamento della pagina.

**FreeStorageSpace**: 18% dello storage provisionato rimanente. Agli attuali tassi di crescita, il database sarebbe rimasto senza storage provisionato in circa 11 settimane.

"Ognuno di questi è risolvibile singolarmente," disse Leo, guardando il dashboard. "Ma li abbiamo tutti e quattro contemporaneamente."

Il picco nel conteggio delle connessioni indicava problemi di connection pooling nell'applicazione — troppi task ECS che aprivano le proprie connessioni al database. Il problema della CPU indicava query costose. Il problema della latenza e quello della CPU erano quasi certamente lo stesso problema: una query lenta eseguita troppo spesso.

"Aspetta — ma *perché* siamo a 198 connessioni?" chiese Maya. "Abbiamo tre task ECS. Come abbiamo quasi 200 connessioni al database?"

Ogni task ECS usava SQLAlchemy con una dimensione del pool predefinita di 5 connessioni più un overflow di 10. Tre task × 15 connessioni potenziali = 45 connessioni dall'applicazione. Le altre 153 provenivano dalle funzioni Lambda di analisi, dai worker dei job in background, dal job ETL di Glue, dalle connessioni locali del team di sviluppo attraverso il bastion host, e da diverse connessioni che erano state aperte ma non chiuse correttamente da una versione precedente del codice.

"Il problema del conteggio delle connessioni," disse Leo, "è in realtà un problema applicativo che sembra un problema del database." Aggiunse PgBouncer (un connection pooler) alla lista dei task — ma il collo di bottiglia immediato era la query lenta.

La CPU del database saliva all'89% durante il rush del venerdì sera. Le query di lettura erano in coda. La latenza P95 delle query era raddoppiata in sei mesi.

"Il database è il collo di bottiglia," disse. "Il traffico è cresciuto. Il database non si è adattato."

"Possiamo semplicemente rendere più grande l'istanza?" chiese Maya. "Aspetta — ma *perché* abbiamo un singolo database che gestisce tutte le letture e le scritture? Perché non abbiamo distribuito questo fin dall'inizio?"

"Sì," disse Leo. "Questo è lo scaling verticale. Passiamo da r6g.large a r6g.xlarge. Più CPU, più memoria. Costerà di più e ci darà tempo."

"Ma non risolve il problema di fondo," disse Priya. "Alla fine raggiungeremo l'istanza più grande e avremo bisogno di un approccio diverso. E abbiamo pensato a cosa succede se una scrittura va accidentalmente a una copia in sola lettura? La copia la rifiuta e l'ordine fallisce silenziosamente."

"Pensa a una biblioteca," disse Leo, prendendo un pennarello. "Un bibliotecario che sia registra i libri che risponde alle domande dei clienti. Quando la biblioteca diventa popolare, si forma una coda. La soluzione: assumere più bibliotecari — ma solo per rispondere alle domande. La registrazione dei libri continua attraverso il bancone originale."

"Quindi assumiamo aiuto per il bancone delle domande," disse Priya.

"Ci sono due approcci," disse Leo. "Read replica, o Aurora."

"Qual è la differenza?"

"Una read replica è il bibliotecario aggiuntivo. Aurora fa un passo in più — ridisegna l'intero sistema di scaffalature così che ogni bibliotecario condivida gli stessi scaffali e veda sempre gli stessi libri, senza ritardi. Niente attesa che gli aggiornamenti si propaghino da un bancone all'altro."

**Read Replica: Distribuire il Traffico di Lettura**

La maggior parte delle applicazioni web legge i dati molto più spesso di quanto li scriva. Un cliente che naviga nel menu fa decine di query SELECT. Effettuare un ordine comporta alcune query INSERT/UPDATE. Il rapporto è tipicamente 10:1 o superiore.

Una **read replica** è un'istanza RDS aggiuntiva che riceve una copia di tutte le scritture dalla primaria e rende quelle scritture disponibili per le query SELECT.

Come funziona:

1. Le operazioni di scrittura (INSERT, UPDATE, DELETE) vanno al database primario
2. Il primario replica questi cambiamenti in modo asincrono alle read replica
3. Le operazioni di lettura (SELECT) sono distribuite tra le read replica
4. Le read replica condividono il carico — ciascuna gestisce una frazione del traffico di lettura totale

Il risultato: il database primario gestisce solo le scritture (e opzionalmente alcune letture). Le read replica gestiscono il carico di lettura. Per un rapporto di lettura/scrittura di 10:1, aggiungere una read replica dimezza approssimativamente il carico totale del primario.

**Limitazione importante**: La replica è **asincrona**. C'è un ritardo di replica — tipicamente millisecondi, ma può essere secondi sotto carico. Una lettura da una replica potrebbe vedere dati leggermente indietro rispetto al primario. Per la maggior parte delle letture (navigare nel menu, visualizzare la cronologia degli ordini), questo è accettabile. Per "il mio ordine è andato a buon fine?" — leggi dal primario.

**Read Replica: I Dettagli**

- Puoi avere fino a 15 read replica per istanza primaria RDS (MySQL, PostgreSQL, MariaDB)
- Le read replica possono essere nella stessa regione o in una regione diversa (replica cross-region)
- Le read replica possono avere a loro volta delle read replica (concatenamento)
- Le read replica sono endpoint separati — la tua applicazione deve indirizzare le letture all'endpoint della replica
- Le read replica possono essere promosse a database autonomi (utile per DR)

Per Nimbus, Leo aggiunse una read replica. "Andrà bene," disse quando Priya chiese se avesse testato la logica di routing lettura/scrittura dell'applicazione prima di trasferire il traffico. Non lo aveva fatto. Trascorse i successivi quaranta minuti a verificare che le scritture non andassero all'endpoint della read replica.

Aggiornò l'applicazione per:

- Operazioni di scrittura → endpoint primario
- Navigazione nel menu, cronologia degli ordini → endpoint della replica

La CPU sul primario scese dall'89% al 41% al picco.

**Il Problema della Consistenza Read-After-Write**

Tre giorni dopo l'abilitazione della read replica, arrivò un ticket di supporto. Un partner ristoratore aveva aggiornato il loro menu — rimosso un articolo discontinuato — e poi aveva chiamato per confermare che fosse stato rimosso. L'agente del servizio clienti aprì il menu dall'interfaccia di Nimbus. L'articolo era ancora lì.

Venti secondi dopo, era sparito.

Ritardo di replica asincrona. La scrittura (DELETE articolo menu) era andata al primario. La lettura dell'agente del servizio clienti era andata alla replica, che non aveva ancora ricevuto la modifica. La replica era indietro di 15 secondi in quel momento — non insolito, ma visibile.

"E se qualcuno cercasse di intromettersi attraverso la finestra di eventual consistency?" chiese Priya. "O semplicemente — cosa succederebbe se venisse effettuato un ordine per un articolo del menu che è appena stato eliminato? Addebiteremmo il cliente e il ristorante non avrebbe l'articolo."

Era una vera preoccupazione di consistenza, non solo un fastidio UX.

La soluzione: identificare quali letture hanno requisiti di consistenza e instradarle al primario.

**Letture che possono andare alla replica** (eventual consistency è accettabile):
- Il cliente naviga nel menu di un ristorante (stale di 1-2 secondi è impercettibile)
- Query sulla cronologia degli ordini (un utente che visualizza la propria cronologia degli ordini di un minuto fa)
- Letture di tipo analitico (i migliori ristoranti di questa settimana)

**Letture che devono andare al primario** (richiedono consistenza read-after-write):
- Immediatamente dopo una scrittura, quando l'applicazione deve confermare che la scrittura sia riuscita
- Letture dello stato dell'ordine immediatamente dopo il piazzamento dell'ordine
- Letture del menu attivate dall'interfaccia di gestione del ristorante (il ristorante ha appena modificato il menu)

L'applicazione aggiunse un routing hint nel layer di connessione al database: se la richiesta proveniva dal dashboard di gestione del ristorante, instradare al primario. Se proveniva da un cliente che navigava, instradare alla replica. Le richieste del dashboard portavano un header HTTP `X-Read-Consistency: strong`, che il layer di connessione usava come segnale di routing.

"Non è poi così difficile," disse Leo. "Basta sapere quali letture lo richiedono."

"E documentarlo," disse Priya. "Così la prossima persona che aggiunge un nuovo endpoint sa quale pool usare."

"Quanto costa al mese?" chiese Tom. Era la sua domanda di apertura standard per qualsiasi nuovo servizio.

Una read replica dello stesso tipo di istanza costa uguale al primario. Da $340/mese a $680/mese.

"Abbiamo raddoppiato il costo per dimezzare approssimativamente il carico," disse Tom.

"Sì. Ma l'alternativa era passare a un tipo di istanza più grande, che sarebbe costata di più e non avrebbe distribuito il carico di lettura."

Tom fece i calcoli. Annuì, a malincuore.

"Cosa succede se il primario va in down?" chiese Maya, prima che Tom potesse passare ad Aurora. "Cosa succede alla read replica?"

Leo spiegò la promozione della replica.

**Se l'istanza RDS primaria va in down**, AWS effettua automaticamente il failover verso la replica standby in configurazione Multi-AZ (un tipo diverso di replica — uno standby sincrono, non una read replica). Lo standby Multi-AZ diventa il nuovo primario. Le read replica continuano a servire le letture, ora replicando dal nuovo primario. Dal punto di vista dell'applicazione, il DNS dell'endpoint primario cambia per puntare all'ex standby, e l'applicazione si riconnette.

Il failover richiede tipicamente 60-120 secondi per RDS PostgreSQL. Durante quella finestra, le scritture falliscono.

La **promozione della read replica** è un'operazione separata — e uno scenario separato. Se vuoi prendere una read replica e renderla un database scrivibile indipendente (per DR, per la migrazione a una nuova regione, o perché il primario è sparito e hai bisogno di promuovere invece di aspettare il failover Multi-AZ), puoi promuovere una read replica a un primario autonomo. La promozione richiede alcuni minuti, dopodiché la replica non replica più dall'originale primario — è il suo database.

"Abbiamo pensato a cosa succede se il primario di us-west-2 va giù completamente?" chiese Priya. "Non solo un failover verso lo standby Multi-AZ — l'intera regione."

"Se la regione va in down," disse Leo, "lo standby Multi-AZ è anch'esso in us-west-2. Vanno in down insieme."

"Quindi per un vero scenario di DR regionale," disse Tom, "avremmo bisogno di una read replica in us-east-1 che potremmo promuovere."

"Sì. Una read replica cross-region. Non ce l'abbiamo ancora."

"Quanto costa al mese?" chiese Tom. Sapeva già che la risposta avrebbe coinvolto una decisione.

Una read replica cross-region di un db.r6g.large in us-east-1: $340/mese (stesso costo di istanza). Più il trasferimento dati cross-region per la replica: minimo al volume di scrittura di Nimbus. Totale: circa $350/mese per una replica DR.

"Sono $4.200 all'anno," disse Tom, "per proteggersi da uno scenario che si è verificato nelle regioni AWS meno di cinque volte in dieci anni."

"E il costo di Nimbus che è giù per 24 ore durante un evento regionale è?" chiese Priya.

Tom calcolò. Non rispose ad alta voce. Ma aggiunse "read replica cross-region" al backlog DR.

"Cos'è Aurora?" chiese.

**Amazon Aurora: Ripensare il Motore del Database**

Aurora è il motore di database relazionale proprietario di AWS, compatibile con MySQL e PostgreSQL. È stato progettato dall'inizio per i workload cloud, ridisegnando il modo in cui funziona lo storage layer di un database relazionale.

In una configurazione RDS tradizionale (MySQL, PostgreSQL), lo storage e il calcolo sono strettamente accoppiati. Il motore del database gestisce i file di dati. La replica copia i dati dal primario alla replica. La replica deve ripetere ogni operazione di scrittura.

Questo crea un limite alla velocità di replica: una replica può applicare le scritture solo alla velocità con cui può elaborare il log di replica. Durante un periodo di scritture intense — un'importazione in blocco, un flash sale, un aggiornamento batch — la replica può rimanere indietro. Il ritardo di replica non è un difetto nell'implementazione; è una conseguenza dell'architettura.

Priya aveva evidenziato questo immediatamente quando Leo aveva proposto le read replica. "E abbiamo pensato a cosa succede se il ritardo di replica sale a 30 secondi durante il rush del venerdì? La replica è indietro di 30 secondi. Un cliente effettua un ordine, lo slot in cucina è riservato nel primario, ma un secondo cliente che interroga la replica non vede la prenotazione. Due ordini, uno slot."

"È un problema di consistenza dell'inventario," disse Leo.

"È esattamente un problema di consistenza dell'inventario," confermò Priya. "Ecco perché le letture dell'inventario — 'questo articolo è ancora disponibile?' — devono andare al primario."

L'architettura di Aurora affronta direttamente il ritardo.

Aurora separa lo storage dal calcolo. Usa uno storage layer distribuito e fault-tolerant che replica automaticamente i dati su tre Zone di Disponibilità in sei copie. Il layer di calcolo (le istanze del database) si trova sopra questo storage layer.

**Cosa cambia questo**:

**Read replica**: Le repliche di Aurora non hanno bisogno di replicare i dati — condividono già lo stesso storage layer. Questo significa:

- Fino a 15 Aurora Replica che condividono il volume di storage (l'RDS normale consente anche fino a 15 read replica, ma ciascuna è una copia completa dei dati)
- Il ritardo di replica è tipicamente inferiore a 100 millisecondi (vs secondi per RDS sotto carico)
- Le repliche possono essere promosse a primario in meno di 30 secondi (vs minuti)

**Failover**: Poiché le repliche condividono lo storage, il failover è molto più veloce — la promozione non comporta il trasferimento di dati, solo il reindirizzamento delle scritture.

**Storage**: Aurora scala automaticamente lo storage in incrementi di 10 GB, fino a 128 TiB (256 TiB nelle versioni più recenti del motore). Non devi mai provisionare lo storage in anticipo.

**Performance**: Aurora dichiara un throughput 5 volte superiore a MySQL standard e 3 volte superiore a PostgreSQL standard per tipi di istanza equivalenti.

Potresti chiederti: se tutte le repliche condividono lo stesso storage, non diventa quello storage un single point of failure? Lo storage layer di Aurora replica automaticamente i dati su sei copie in tre Zone di Disponibilità. Lo storage stesso è più resiliente di qualsiasi configurazione Multi-AZ di un singolo RDS — è progettato per sopravvivere alla perdita di un'intera AZ con zero perdita di dati e nessun failover necessario.

Una seconda domanda comune: se Aurora è compatibile con MySQL/PostgreSQL, puoi migrare da RDS PostgreSQL ad Aurora PostgreSQL senza modificare il codice dell'applicazione? Quasi. La compatibilità con PostgreSQL di Aurora significa che Aurora implementa il wire protocol di PostgreSQL e supporta la grande maggioranza della sintassi SQL e delle funzionalità di PostgreSQL. La maggior parte delle applicazioni migra senza modifiche al codice. I casi limite: un piccolo numero di estensioni PostgreSQL non è disponibile su Aurora, alcune query sul catalogo di sistema restituiscono valori diversi, e alcune operazioni amministrative differiscono. Per le migrazioni in produzione, testa con traffico di lettura parallelo prima di trasferire le scritture.

Per Nimbus, la migrazione da RDS PostgreSQL ad Aurora PostgreSQL richiese un pomeriggio. L'applicazione puntò all'endpoint Aurora. La query del menu — dopo che Leo aggiunse l'indice che Performance Insights aveva indicato come il principale consumatore di carico del database — girò in 4ms invece di 620ms. Il connection pool non raggiunse più 198 su 200. La latenza P95 scese a 28ms.

"È un motore di database diverso," disse Leo, "che l'applicazione pensa sia lo stesso motore di database."

"E la parte interessante?" chiese Maya.

"Il cloning rapido del database."

"Annotato," disse Sam tranquillamente dall'altra parte della stanza, già digitando. Sam era un backend engineer che era entrato nel team alcune settimane prima per togliere un po' del lavoro sul database dal piatto di Leo. Nessuno chiese cosa stesse facendo.

**Aurora Pricing: La Domanda di Tom**

Il pricing di Aurora è diverso da quello di RDS:

**Prezzo delle istanze**: Simile al prezzo delle istanze RDS per tipo.

**Prezzo dello storage**: $0,10 per GB al mese (paghi per ciò che è conservato, scalato automaticamente).

**Prezzo I/O**: Aurora addebita per ogni richiesta I/O (lettura/scrittura allo storage). Questo può essere significativo per i workload con molte scritture.

"Aspetta," disse Tom. "Stiamo pagando per I/O separatamente?"

"Aurora Serverless v2 e Aurora I/O-Optimized cambiano questo modello di pricing," disse Leo. "Aurora I/O-Optimized non addebita alcun costo I/O ma un prezzo di storage e istanza più elevato. È migliore per i workload con molte operazioni I/O."

Tom esaminò il compromesso. Per Nimbus, che era read-heavy (molte query di menu, poche scritture), Aurora I/O-Optimized potrebbe costare di più. Il pricing standard di Aurora potrebbe essere appropriato.

Un'euristica utile: se i tuoi addebiti I/O superano circa il 25% della tua fattura Aurora totale, I/O-Optimized è probabilmente più economico. Per il workload read-heavy di Nimbus, gli addebiti I/O erano bassi — si applica il pricing standard. Per un workload write-heavy come un sistema di event logging, I/O-Optimized potrebbe ridurre significativamente i costi.

Questa è una vera decisione di costo che gli ingegneri senior prendono: devi conoscere i pattern I/O del tuo workload per scegliere correttamente.

Se il tuo workload è piccolo, stabile e prevedibile, RDS PostgreSQL è più semplice e significativamente più economico — ma se il tuo traffico è imprevedibile, il tuo volume di dati sta crescendo oltre ciò che puoi provisionare in anticipo, o hai bisogno di failover automatico in meno di 30 secondi, il modello di storage condiviso di Aurora giustifica il costo base più elevato.

**Aurora Serverless: Scaling Senza Pensare alle Istanze**

**Aurora Serverless v2** è una configurazione che scala automaticamente la capacità di calcolo in base al carico effettivo del database. Invece di scegliere una dimensione di istanza fissa (db.r6g.large), imposti una capacità minima e massima in Aurora Capacity Units (ACU).

Aurora Serverless v2:

- Scala verso l'alto in pochi secondi quando il carico aumenta
- Scala verso il basso durante i periodi di inattività — e dalla fine del 2024, può mettersi in auto-pause fino a 0 ACU quando non ci sono connessioni (la ripresa richiede ~15 secondi; l'auto-pause non funziona con RDS Proxy o altri proxy che mantengono le connessioni)
- Costo: $0,12 per ACU-ora (più storage e I/O)

Per i workload con traffico variabile — i picchi del venerdì di Nimbus vs la quiete del lunedì mattina — Serverless v2 riduce i costi durante i periodi fuori picco e gestisce i picchi senza pre-provisioning.

"Quindi durante il picco del venerdì," disse Leo, "Aurora scala automaticamente verso l'alto. Domenica mattina quando abbiamo quasi nessun traffico, scala di nuovo verso il minimo."

"E paghiamo solo per la capacità che stiamo usando," disse Tom.

"Esatto."

Dopo un mese su Aurora Serverless v2, Leo aprì il grafico ACU (Aurora Capacity Unit) della settimana precedente.

Il grafico mostrava due pattern distinti. Durante la settimana, il database girava a 2-4 ACU — un ronzio silenzioso di query in background, health check ECS, job ETL di Glue e test di sviluppo. Il venerdì sera tra le 18:00 e le 22:00, il conteggio ACU salì:

```
Friday 18:00  → 6 ACUs
Friday 19:00  → 14 ACUs
Friday 19:45  → 26 ACUs  (peak — pizza orders spike before NFL kickoff)
Friday 20:30  → 18 ACUs
Friday 21:00  → 12 ACUs
Friday 22:30  → 4 ACUs
Saturday 02:00 → 2 ACUs  (minimum)
```

Lo scaling era quasi istantaneo — Aurora Serverless v2 scala in incrementi di 0,5 ACU, e può aggiungere capacità in pochi secondi piuttosto che i minuti richiesti per provisionare una nuova istanza RDS.

"Quanto è costato quel picco del venerdì?" chiese Tom.

A $0,12 per ACU-ora: il picco del venerdì fu di 4 ore con una media di 18 ACU → $8,64 per il periodo di picco. Il resto della settimana a una media di 3 ACU × 164 ore × $0,12 = $59,04. Totale per la settimana: $67,68.

L'istanza provisionata equivalente per gestire il picco del venerdì (db.r6g.xlarge, 4 vCPU, 32 GB) costerebbe $0,937/ora × 168 ore = **$157,42 per la settimana** — che il picco del venerdì si materializzasse o meno.

"Serverless v2 è $67 per la settimana. Un'istanza provisionata dimensionata per il picco è $157," disse Tom. "È una riduzione del 57%."

"Su un database che usa legittimamente 26 ACU per quattro ore il venerdì e 2 ACU per il resto della settimana," disse Leo. "Se il tuo database gira a carico elevato costante per tutta la settimana, un'istanza provisionata è più economica. I risparmi vengono dalla variabilità."

Tom annuì lentamente. Stava aggiungendo questo a un pattern nei suoi appunti: ogni storia di risparmio di questo trimestre aveva la stessa forma. Paghi per quello che usi, non per quello di cui potresti aver bisogno. Le lifecycle policy S3 pagavano solo per la classe di storage che ogni oggetto richiedeva. Lambda pagava solo per il tempo di invocazione. Fargate pagava solo per CPU e memoria del task. Aurora Serverless v2 pagava solo per le ACU che il database consumava effettivamente.

Tom aveva l'espressione di qualcuno che aveva trovato esattamente quello che stava cercando.

**Recuperarsi da una Migrazione Andata Male: Clone, PITR e il Tasto Annulla**

Due settimane dopo il passaggio ad Aurora, Sam eseguì uno script di migrazione del database in produzione. Lo script avrebbe dovuto rimuovere la colonna `legacy_menu_format` dalla tabella `menu_items`. Lo eseguì senza la clausola WHERE che pensava di aver incluso.

Il risultato non fu la rimozione di una colonna. Fu un'istruzione DELETE che cancellò 40.000 righe dalla tabella `menu_items` — circa 200 ristoranti di dati del menu, spariti.

L'alert si attivò entro 30 secondi. I fallimenti degli ordini salirono a picco. Il servizio menu cominciò a restituire risultati vuoti per 200 ristoranti.

"Avrebbe dovuto avere una clausola WHERE," disse Sam, fissando la console.

Il percorso di recovery tradizionale: ripristinare dall'ultimo snapshot di backup automatizzato. I backup automatizzati vengono eseguiti una volta ogni 24 ore, e un ripristino e sostituzione completi avrebbero richiesto 20-40 minuti — durante i quali *tutti* i ristoranti sarebbero stati oscurati, non solo i 200 interessati — e ogni ordine effettuato dal backup sarebbe andato perso.

Leo non lo fece. Come l'RDS standard, Aurora mantiene backup continui per il **point-in-time recovery (PITR)** — puoi ripristinare il cluster a qualsiasi secondo nella finestra di conservazione del backup, non solo all'ultimo snapshot notturno. E, aspetto critico, il ripristino crea un *nuovo* cluster; la produzione rimane attiva mentre recuperi.

Leo avviò un restore point-in-time in un nuovo cluster di recovery, puntando alle 15:42 — quattro minuti prima che Sam eseguisse lo script di migrazione. Mentre il cluster di recovery si avviava, il resto della produzione continuava a servire i ristoranti non interessati. Una volta disponibile, Leo eseguì il dump delle righe `menu_items` per i 200 ristoranti interessati dal cluster di recovery e le reinserì in produzione. Tempo totale dall'alert ai menu completamente ripristinati: poco meno di 40 minuti — e poiché aveva riparato le righe chirurgicamente invece di sostituire l'intero database, nessun ordine effettuato dopo le 15:42 andò perso. Il cluster di recovery fu eliminato dopo; aveva svolto il suo scopo.

"Cosa abbiamo perso?" chiese Maya.

Sei ordini effettuati contro i menu temporaneamente vuoti erano falliti al checkout — erano tutti nella coda SQS e potevano essere riprodotti. Nessun dato cliente era andato perso definitivamente.

"Ed è qui che entra in gioco il **fast database cloning**," disse Leo, radunando il team dopo. Aurora può creare un **clone** di un cluster in pochi minuti, indipendentemente dalla dimensione del database, usando copy-on-write: il clone condivide lo storage layer dell'originale e solo le pagine nuove o modificate consumano spazio aggiuntivo. Un clone del database di produzione attuale è economico, veloce e completamente isolato — le scritture al clone non toccano mai la produzione.

"Il che significa," disse Priya, guardando Sam, "che lo script di migrazione viene testato su un clone dei dati di produzione prima di essere mai eseguito in produzione. Questa è la nuova regola."

Sam annuì. L'aveva già scritto su un post-it.

Un altro strumento appartiene a questo quadro. Aurora MySQL — non Aurora PostgreSQL — ha **Aurora Backtrack**: una funzionalità che fa tornare indietro il cluster *in place* a un punto specifico nel tempo, senza eseguire il ripristino su un nuovo cluster. Se il cluster di Nimbus fosse stato Aurora MySQL, Leo avrebbe potuto effettuare il backtrack alle 15:42 in meno di tre minuti — anche se riavvolgere l'intero cluster avrebbe anche ripristinato la manciata di ordini legittimi scritti dopo la cancellazione, che invece l'approccio PITR chirurgico aveva preservato.

"E se qualcuno cercasse di intromettersi usando Backtrack — o un restore point-in-time?" chiese Priya. "Un attaccante potrebbe riavvolgere i log di audit o i dati di conformità?"

Backtrack richiede il permesso API `rds:BacktrackDBCluster`, e i restore richiedono `rds:RestoreDBClusterToPointInTime` — azioni IAM separate dalle normali operazioni del database. I ruoli standard dell'applicazione non hanno questi permessi. Solo il team operativo, con policy IAM esplicite che lo consentono, potrebbe usarli. Lei aggiunse questo alla checklist di revisione dei permessi IAM.

I caveat importanti: Aurora Backtrack è disponibile solo per i cluster Aurora compatibili con MySQL, non PostgreSQL. La finestra di Backtrack è configurata alla creazione del cluster (da 1 ora a 72 ore, con addebiti per ora di finestra di backtrack). E Backtrack interessa l'intero cluster — non puoi fare il Backtrack di una tabella o di un insieme di righe. Per il recovery chirurgico a livello di riga — su entrambi i motori — l'approccio PITR-verso-un-cluster-temporaneo che Leo ha usato è lo strumento.

**Aurora Global Database: Letture Multi-Regione**

**Aurora Global Database** estende Aurora su più regioni AWS:

- **Una regione primaria** gestisce tutte le scritture
- **Fino a cinque regioni secondarie** servono le letture con tipicamente <1 secondo di ritardo di replica
- Le regioni secondarie possono essere promosse a primario in meno di 1 minuto (per scenari DR)

Per l'espansione globale di Nimbus, Aurora Global Database consentirebbe a un partner ristoratore a Londra di interrogare il proprio menu locale dalla read replica EU, mentre tutti gli ordini (scritture) passerebbero ancora attraverso il primario statunitense.

**RDS vs Aurora: Quando Scegliere l'Uno o l'Altro**

| Fattore            | RDS (PostgreSQL/MySQL)        | Aurora                                                     |
|-------------------|-------------------------------|------------------------------------------------------------|
| Costo              | Inferiore per workload piccoli     | Base più alta, ma scala meglio                             |
| Compatibilità     | Completa                          | MySQL/PostgreSQL compatibile (con lievi differenze)       |
| Max repliche      | 15 (ciascuna una copia completa dei dati)    | 15 (volume di storage condiviso)                                                         |
| Replica lag       | Può essere secondi                | Di solito <100ms                                             |
| Storage           | Provisioning fisso            | Auto-scala fino a 128 TiB (256 TiB nelle versioni recenti)                               |
| Failover time     | 60-120 secondi                | <30 secondi                                                |
| Opzione Serverless | Limitata                       | Aurora Serverless v2                                       |
| Ideale per       | Workload stabili e prevedibili | Traffico variabile, alto volume di lettura, necessità di failover rapido |

**Oltre il Relazionale: La Famiglia Purpose-Built**

Il capitolo 9 ha introdotto DocumentDB (documenti compatibili con MongoDB), Neptune (relazioni tra grafi) e Keyspaces (colonne larghe compatibili con Cassandra), e il capitolo 10 ha introdotto MemoryDB (database primario durevole compatibile con Redis). Altri due nomi completano la famiglia — come Aurora, ciascuno è un database modellato attorno a un pattern di accesso. Non hai bisogno di approfondirli, solo la capacità di riconoscere quale forma dei dati punta a quale motore, perché appaiono costantemente come opzioni di risposta:

- **Amazon Timestream**: dati di **serie temporali** — letture di sensori, metriche, telemetria. Segnale d'esame: "misurazioni IoT nel tempo." (Nel mondo reale l'offerta attuale è Timestream for InfluxDB; il flavor originale "LiveAnalytics" ha chiuso ai nuovi clienti nel 2025.)
- **Amazon QLDB**: potresti ancora incontrarlo in domande più vecchie come il "ledger immutabile e crittograficamente verificabile". AWS ha dismesso QLDB nel 2025 (raccomandando Aurora PostgreSQL in alternativa) — trattalo come un distratture legacy, non un blocco da costruzione.

La regola che vale la pena scrivere su una lavagna: **righe relazionali → RDS/Aurora; key-value su scala → DynamoDB; documenti → DocumentDB; relazioni → Neptune; tempo → Timestream; Cassandra → Keyspaces; Redis durevole → MemoryDB.** Abbina la forma, e la domanda si risponde da sola.

## Punti di Forza e Limitazioni

**Punti di forza di Aurora**:

- Failover significativamente più veloce rispetto a RDS standard
- Fino a 15 read replica con ritardo minimo
- Storage auto-scalabile
- Serverless v2 per workload variabili
- Global Database per il deployment multi-regione

**Limitazioni di Aurora**:

- Costo più elevato per workload piccoli e stabili
- Il pricing I/O può essere significativo per workload write-heavy (usa I/O-Optimized per questo)
- Lievi differenze di compatibilità con MySQL/PostgreSQL possono richiedere modifiche al codice
- La ripresa di Serverless v2 dall'auto-pause (~15 secondi) e lo scale-up rapido possono causare picchi di latenza

## Riepilogo

Il lavoro sulle lifecycle S3 nel capitolo 23 ha ridotto i costi spostando i dati al livello di storage corretto. Aurora fa l'equivalente per il calcolo: invece di provisionare per il carico di picco e pagarlo sempre, Serverless v2 scala per corrispondere alla domanda.

- Le **read replica** distribuiscono il traffico di lettura dal primario. Replica asincrona — un leggero ritardo accettabile per la maggior parte delle letture. Instrada le letture che richiedono consistenza in scrittura (letture immediatamente post-scrittura, letture dall'interfaccia amministrativa) al primario, non alla replica.
- **Aurora** ridisegna lo storage layer — distribuito, condiviso tra le repliche, auto-scaling: 15 read replica, <100ms di ritardo di replica, <30s di failover, fino a 128 TiB (256 TiB nelle versioni recenti) di storage.
- Diagnostica prima di scalare: **Performance Insights** identifica le specifiche query SQL che causano il carico (un indice mancante può eliminare la necessità di un'istanza più grande), e le **metriche del database CloudWatch** ti dicono quale problema hai — DatabaseConnections vicino alla saturazione significa connection pooling rotto, CPUUtilization sostenuta elevata significa query costose, ReadLatency che degrada nel tempo è spesso una tabella che cresce con un indice mancante.
- **Aurora Serverless v2**: scala automaticamente il calcolo in incrementi di 0,5 ACU. Addebitato per ACU-ora. Significativamente più economico delle istanze provisionatate per workload con alta variabilità tra picco e fuori picco.
- Il **point-in-time recovery (PITR)** ripristina un cluster Aurora a qualsiasi secondo nella finestra di conservazione del backup — in un *nuovo* cluster, così la produzione rimane attiva mentre copi chirurgicamente le righe perse. Il **fast database cloning** fornisce un clone copy-on-write in pochi minuti indipendentemente dalla dimensione — economico e isolato, ideale per testare prima le migrazioni sui dati di produzione.
- **Aurora Backtrack** (solo per Aurora MySQL-compatibile — non PostgreSQL): riavvolge il cluster in place a un punto nel tempo senza ripristinare da un backup. Disponibile per finestre fino a 72 ore. Richiede il permesso IAM `rds:BacktrackDBCluster` — limita al team operativo.
- **Aurora Global Database**: primario in una regione, read replica in fino a cinque regioni; le read replica cross-region possono essere promosse a primari autonomi per DR regionale — bilancia il vantaggio DR con il costo di eseguire una seconda istanza completa.
- Scegli RDS per workload più piccoli, stabili e prevedibili. Scegli Aurora quando hai bisogno di scala, failover rapido o gestione del traffico variabile.

## Suggerimenti per l'Esame

*Dominio SAA-C03: Progettare Architetture ad Alte Prestazioni (Dominio 3, Task 3.3)*

- **Aurora replica vs RDS read replica**: le repliche Aurora condividono lo storage (ritardo quasi nullo, <30s di failover). Le RDS read replica replicano i dati (ritardo possibile, minuti per il failover).
- **Aurora Serverless v2**: "scala automaticamente la capacità del database", "traffico di database imprevedibile o a picchi" → Aurora Serverless v2. Attenzione: storicamente solo Serverless **v1** scalava a zero; il minimo di v2 era 0,5 ACU fino alla fine del 2024, quando v2 ha acquisito l'auto-pause a 0 ACU. Le domande d'esame più vecchie potrebbero ancora assumere che v2 non possa scalare a zero.
- **Aurora Global Database**: "database multi-regione", "lettura dall'EU con bassa latenza dal primario statunitense", "RTO < 1 minuto per failover regionale" → Aurora Global Database.
- **Tempi di failover**: Aurora < 30 secondi. RDS Multi-AZ 60-120 secondi. Conosci entrambi.
- **Database purpose-built per forma dei dati**: "grafo sociale / raccomandazioni / anelli di frode" → Neptune. "MongoDB" → DocumentDB. "Cassandra" → Keyspaces. "serie temporali / telemetria IoT" → Timestream. "database *primario* compatibile con Redis (durevole)" → MemoryDB (vs ElastiCache = cache). "Ledger crittografico immutabile" → QLDB nelle domande vecchie (dismesso nel 2025).
- **Aurora I/O-Optimized**: costo di storage e istanza più elevato, nessun addebito per I/O. Usa quando i costi I/O dominano (write-heavy). Aurora Standard: costo di storage inferiore, pagamento per I/O. Usa per read-heavy.
- **Aurora Backtrack**: riavvolge il database in place a un punto specifico nel tempo senza ripristinare da uno snapshot di backup. Disponibile solo per Aurora compatibile con MySQL — per Aurora PostgreSQL, la risposta è il restore point-in-time (su un nuovo cluster) o un clone rapido. Segnale d'esame: "dati cancellati accidentalmente, bisogno di recuperare rapidamente senza ripristinare un backup completo" + MySQL → Backtrack.
- **Aurora fast database cloning**: clone copy-on-write in pochi minuti, indipendentemente dalla dimensione del database. Segnale d'esame: "testare su una copia dei dati di produzione rapidamente ed economicamente" → clone, non snapshot-restore.

## Esercizi

**Esercizio 1 — Ricordo**

Spiega la differenza tra Aurora e le read replica standard di RDS. Perché il ritardo di replica di Aurora è tipicamente inferiore?

*(Suggerimento: Torna alla biblioteca — le repliche di Aurora sono più bibliotecari che condividono gli stessi scaffali, mentre l'RDS standard consegna a ogni nuovo bibliotecario una copia completa della collezione da tenere aggiornata.)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: Il database MySQL di una piattaforma di social media sta sperimentando alta latenza di lettura a causa del traffico crescente. L'applicazione è read-heavy (95% letture, 5% scritture). Il team ha bisogno di una latenza di lettura coerente, anche durante i picchi di traffico. Ha bisogno di failover automatico con tempi di inattività minimi (RTO target < 30 secondi). Il volume dei dati sta crescendo in modo imprevedibile.

Quale soluzione di database soddisfa MEGLIO questi requisiti?

A) RDS MySQL Multi-AZ con cinque read replica
B) Aurora MySQL con Aurora Replica e Aurora Serverless v2
C) RDS MySQL con un tipo di istanza più grande (scaling verticale)
D) DynamoDB con DynamoDB DAX per la cache di lettura

**Suggerimento 1**: "RTO < 30 secondi" — quale servizio lo raggiunge? Controlla i tempi di failover per ciascuna opzione.

**Suggerimento 2**: "Latenza di lettura coerente durante i picchi" — quale servizio ha repliche con ritardo quasi nullo vs potenziali secondi di ritardo?

**Suggerimento 3**: "Volume di dati che cresce in modo imprevedibile" — quale servizio scala automaticamente lo storage?

**Risposta**: B

**Spiegazione**: Aurora MySQL con Aurora Replica fornisce un ritardo di replica quasi nullo (millisecondi, non secondi) per prestazioni di lettura coerenti sotto carico. Aurora Serverless v2 scala automaticamente il calcolo durante i picchi di traffico senza over-provisioning. Lo storage di Aurora scala automaticamente man mano che i dati crescono. Il failover di Aurora (promozione di una replica) si completa in meno di 30 secondi — soddisfacendo il requisito RTO.

**Perché non A?** Il failover di RDS Multi-AZ richiede 60-120 secondi — non soddisfa il requisito RTO < 30 secondi. Il ritardo standard delle RDS read replica può raggiungere i secondi sotto carico — la latenza di lettura "coerente" è più difficile da garantire.

**Perché non C?** Lo scaling verticale (istanza più grande) aumenta la capacità ma non distribuisce il carico di lettura. Il database rimane un single point of failure per le letture.

**Perché non D?** DynamoDB è NoSQL — migrare da MySQL a DynamoDB richiede di rearchitettare il modello dei dati e le query dell'applicazione, il che va ben oltre lo scopo di questo task di miglioramento delle prestazioni.

*Dominio SAA-C03: Progettare Architetture ad Alte Prestazioni — Task 3.3*

**Esercizio 3 — Sfida di Architettura** *(Opzionale)*

Nimbus sta progettando un'espansione globale. Vuole che i partner ristoratori sulla Costa Est, in Germania e in Australia vedano i propri dati degli ordini rapidamente, senza latenza cross-region. Tuttavia, tutte le scritture devono passare attraverso il singolo primario di us-west-2 per mantenere la consistenza.

Progetta l'architettura del database usando Aurora. Come struttureresti il Global Database — ad esempio, cluster secondari in us-east-1, eu-central-1 e ap-southeast-2? Cosa succede se il primario di us-west-2 va giù? Come gestiresti il processo di promozione?

*(Non esiste una risposta corretta univoca. L'obiettivo è esercitarsi nella progettazione di database multi-regione.)*

## Scena Post-Crediti

Leo migrò ad Aurora con Serverless v2.

Il picco del venerdì arrivò e passò. La CPU non superò mai il 60%. La latenza delle query rimase coerente. Aurora aveva scalato verso l'alto per gestire il carico automaticamente, poi era scalata verso il basso dopo il rush.

"Quanto è costato questo rispetto al venerdì scorso?" chiese Tom il lunedì mattina.

Leo aprì il billing explorer. "Venerdì ha mediato circa $2,16/ora durante il picco serale. Sabato mattina era $0,24/ora."

Tom non disse nulla.

"La vecchia configurazione era un costo fisso di $0,47/ora indipendentemente dal carico," aggiunse Leo.

"Quindi abbiamo pagato di più durante il picco rispetto a prima," disse Tom.

"Sì. Ma significativamente meno fuori picco. Il costo netto della settimana è inferiore."

Tom calcolò. Poi annuì.

"C'è una lezione qui," disse. "La domanda giusta non è 'è più economico?' È 'è più economico per il nostro pattern di utilizzo effettivo?'"

"Questo," disse Priya dall'altra parte della stanza, "è l'istinto di un ingegnere senior."

Tom sembrava leggermente preoccupato di essere descritto in quel modo.

Nel prossimo capitolo: quando la tua rete è il collo di bottiglia, e perché un'autostrada privata potrebbe valere il pedaggio.
