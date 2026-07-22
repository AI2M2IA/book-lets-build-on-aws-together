# Capitolo 4: Un Computer nell'Edificio di Qualcun Altro

Il grafico della CPU era diventato musica di sottofondo.

Il laptop di Tom era aperto nell'angolo della scrivania, la dashboard delle metriche che si aggiornava ogni minuto, la linea di utilizzo che saliva con un'inclinazione che significava che qualcosa stava lavorando sodo. Maya l'aveva notato tre giorni fa e non ne aveva parlato con nessuno. Stava guardando la coda degli ordini.

IAM era a posto. Le credenziali erano in ordine. Priya aveva l'MFA su tutto. Il team si sentiva, per la prima volta, leggermente responsabile. Ma la responsabilità non risolveva il problema che Maya stava osservando: i numeri sulla dashboard degli ordini che salivano mentre la linea della CPU saliva con loro.

L'app Nimbus girava sull'istanza che Leo aveva avviato senza pensarci — quella che aveva "deployato da qualche parte" prima che qualcuno sapesse cosa fosse una Region.

Andava bene per mostrare una demo agli investitori. Non andava bene quando Maya premette "lancia" e duecento iscrizioni arrivarono nella prima settimana — quarantasette ristoranti che prendevano ordini ogni giorno. L'istanza improvvisata di Leo stava ora gestendo ordini reali, menu reali e clienti reali — una macchina scelta per caso, dimensionata per impostazione predefinita, configurata da una persona che stava imparando AWS mentre digitava.

"Abbiamo bisogno di un server," disse Maya. "Uno vero. Uno che qualcuno ha scelto intenzionalmente."

Tom guardò il grafico della CPU. La linea era visibile dall'altra parte della stanza.

Fu allora che iniziarono a capire cosa significhi davvero noleggiare un computer.

**L'Astrazione che Nessuno Spiega**

Quando le persone dicono che la loro applicazione "gira sul cloud," di solito intendono che
gira su una macchina virtuale — un computer che non esiste fisicamente come hardware
dedicato, ma che si comporta in ogni modo come se lo facesse.

Ecco il meccanismo.

Un server fisico in un data center AWS ha molte risorse: core CPU, memoria, disco
e larghezza di banda di rete. AWS prende quel server fisico e lo divide usando un software
chiamato **hypervisor** — un software che funziona come il portinaio di un edificio, dividendo
le risorse del server fisico tra più tenant virtuali. L'hypervisor crea più macchine
virtuali, ognuna che sembra avere la propria CPU, memoria e disco dedicati — ma che in
realtà condivide l'hardware fisico sottostante.

Pensalo come affittare un appartamento in un grande edificio, invece di comprare una casa.

Il proprietario dell'edificio (AWS) mantiene la struttura fisica — l'impianto idraulico,
l'impianto elettrico, la sicurezza. Tu ricevi un'unità. La arredi come vuoi. Paghi
mensilmente (o ogni ora). Quando hai bisogno di più spazio, ti sposti in un'unità più
grande. Quando ti trasferisci, smetti di pagare.

Ognuna di quelle macchine virtuali in affitto è ciò che AWS chiama un'**istanza EC2** —
Elastic Compute Cloud.

EC2 sta per Elastic Compute Cloud. La parte "elastica" è importante, e ci arriveremo.
Per ora: un'istanza EC2 è un computer che noleggi all'ora. Ha un sistema operativo,
una connessione di rete e potenza di calcolo. Esegue la tua applicazione proprio come
farebbe un server fisico.

**Scegliere la Tua Istanza: Le Dimensioni Contano**

Non tutte le istanze EC2 sono uguali. AWS offre centinaia di tipi di istanza, organizzati
in famiglie basate su ciò per cui sono ottimizzate.

**Uso generale** (es. `t3`, `m6i`): CPU e memoria bilanciate. Buona scelta predefinita
per la maggior parte delle applicazioni web. La famiglia `t3` è burstable — accumula
crediti CPU durante i periodi di basso utilizzo e li spende durante i picchi. Ottima per
gli ambienti di sviluppo e i carichi di lavoro con domanda CPU variabile. La famiglia `m6i`
fornisce prestazioni costanti e non burstable — migliore per i carichi di lavoro di
produzione con necessità di CPU sostenuta.

**Ottimizzato per il calcolo** (es. `c7g`): Più CPU rispetto alla memoria. Buono per la
codifica video, la modellazione scientifica, l'elaborazione batch. Il suffisso "g" in
`c7g` significa che l'istanza usa processori AWS Graviton — chip basati su ARM progettati
internamente da AWS, che offrono un miglior rapporto prezzo-prestazioni per molti carichi
di lavoro rispetto alle istanze x86 equivalenti.

**Ottimizzato per la memoria** (es. `r7i`): Più memoria rispetto alla CPU. Buono per
database, caching, analisi in-memory. Se gestisci un database dove le prestazioni
migliorano notevolmente mantenendo più dati in RAM, la famiglia R è il punto di partenza
corretto.

**Ottimizzato per lo storage** (es. `i3`): Storage locale ad alta velocità. Buono per
carichi di lavoro intensivi di dati che necessitano di I/O su disco molto veloce. Lo
storage NVMe locale su queste istanze è significativamente più veloce di EBS — ma è anche
effimero. Usalo per dati temporanei, non per nulla che non puoi permetterti di perdere.

**Calcolo accelerato** (es. `p4`): GPU allegate. Buono per il training di machine learning
e il rendering grafico. Queste istanze sono costose — una `p3.8xlarge` costa oltre 12
dollari all'ora — ma per i carichi di lavoro che beneficiano del parallelismo GPU, non c'è
alternativa.

Ogni famiglia ha dimensioni. Una `t3.micro` ha 2 CPU virtuali e 1 GB di memoria. Una
`t3.xlarge` ha 4 CPU virtuali e 16 GB. Una `t3.2xlarge` raddoppia di nuovo. Il pattern
di denominazione è coerente: il suffisso va `nano`, `micro`, `small`, `medium`, `large`,
`xlarge`, `2xlarge`, `4xlarge`, `8xlarge` e oltre.

Leo aveva scelto una `t3.micro`.

"Quanti utenti può gestire una `t3.micro`?" chiese Tom. "E quanto costa di più una più grande?"

"Dipende dall'applicazione," disse Leo. "Ma probabilmente non un centinaio di utenti
simultanei che caricano immagini e fanno query sul database."

"Quanto costa al mese?" chiese Tom, guardando la pagina di confronto dei tipi di istanza.

Leo aprì la pagina dei prezzi AWS. La t3.micro costava circa 8 dollari al mese. La t3.small era 17 dollari. La t3.medium era 33 dollari. La t3.large era intorno ai 60 dollari. Il divario si allargava rapidamente man mano che si saliva — non in modo lineare, ma più o meno raddoppiando a ogni passo di dimensione. Tom scrisse i numeri, notando che ogni passo di dimensione raddoppiava la memoria — ma, curiosamente, non il numero di CPU. Ogni t3 dalla micro alla large aveva le stesse 2 vCPU; il conteggio non aumentava fino alla xlarge. Ogni passo raddoppiava la memoria; il **baseline dei crediti CPU** — la quota di quelle vCPU che l'istanza poteva usare continuamente senza bruciare i crediti burst — cresceva anche lui, sebbene non a ogni passo.

Tom scrisse "t3.micro" sulla lavagna e disegnò una faccia triste accanto.

**La Conversazione sul Dimensionamento Corretto**

La t3.micro durò circa un mese prima che il traffico del venerdì sera la travolgesse. Leo fece l'upgrade di corsa — direttamente a una t3.large, ragionando che troppo grande era più sicuro di troppo piccolo. Due settimane dopo il passaggio alla t3.large, Tom segnalò qualcosa.

"La CPU è al 9%," disse. "In media. Negli ultimi sette giorni."

Leo guardò il grafico di CloudWatch. CPU al 9% in media. Picchi forse del 35% durante la cena del venerdì. Il resto del tempo: appena attiva.

"Stiamo pagando un server da 60 dollari al mese," disse Tom, "al 9% della sua capacità."

"Ma i picchi del venerdì?" disse Leo. "Abbiamo bisogno di margine."

"I picchi del venerdì arrivano al 35%," disse Tom. "Una t3.small ha le stesse due vCPU — quello che è più piccolo è il baseline dei crediti, circa il 20% sostenuto. Facciamo una media del 9%. Questo significa che accantonerei crediti CPU tutto il giorno, ogni giorno, e ne spenderei alcuni per qualche ora i venerdì sera. Ho controllato la matematica del `CPUCreditBalance` — il saldo non si avvicina mai allo zero. Sono 17 dollari al mese. Abbiamo margine."

Leo guardò i numeri. Guardò il grafico. Sentì il disagio di un ingegnere che ha fatto over-provisioning e lo sa.

"Ma se arriva un picco?" disse.

"Allora le metriche ce lo diranno prima che faccia male," disse Priya. "E alla fine configureremo l'Auto Scaling — è letteralmente per quello che esiste. Non dovrai fare il provisioning per il picco manualmente una volta che il sistema potrà aggiungere istanze automaticamente."

Fecero il downsize a una t3.small. La fattura mensile scese di 40 dollari. Nel corso di un anno, erano 480 dollari — non trascurabili, soprattutto per una startup. Tom lo annotò nel suo foglio di calcolo con la soddisfazione silenziosa di chi aspettava da due settimane di fare questo punto.

Questo pattern ha un nome: **right-sizing**. Significa adattare la dimensione dell'istanza al carico di lavoro effettivo, non al caso peggiore immaginato. Strumenti AWS come AWS Compute Optimizer e le metriche di CloudWatch rendono il right-sizing una decisione basata sui dati piuttosto che un'ipotesi.

**L'AMI: Lo Stato Iniziale della Tua Macchina**

Prima di avviare un'istanza EC2, scegli il suo sistema operativo e la configurazione
iniziale. In AWS, questo si chiama **Amazon Machine Image** (AMI).

Un'AMI è un template. Definisce:

- Il sistema operativo (Amazon Linux, Ubuntu, Windows Server, ecc.)
- Software preinstallato
- Lo stato iniziale del disco

Quando avvii un'istanza da un'AMI, AWS crea una copia fresca di quel template
solo per te. Puoi anche creare le tue AMI — se configuri un server esattamente
come vuoi, puoi "salvare" quello stato come AMI personalizzata e usarla per avviare
server identici rapidamente. Questo è come si fa il deploy di ambienti coerenti su larga scala.

Pensa a un'AMI come a una ricetta. La ricetta descrive il pasto. Ogni volta che segui
la ricetta, ottieni lo stesso pasto. Se vuoi cambiare il pasto in modo permanente, aggiorni
la ricetta.

AWS fornisce un marketplace di AMI — alcune sono mantenute da AWS (Amazon Linux 2, Amazon
Linux 2023), alcune sono mantenute dalle principali distribuzioni Linux (Ubuntu, Red Hat,
SUSE), e alcune provengono da fornitori terzi (server di database preconfigurati, appliance
di sicurezza, software commerciale). Per la maggior parte delle applicazioni web, un'AMI
Amazon Linux o Ubuntu LTS mantenuta da AWS è il punto di partenza corretto.

Per Nimbus, Leo costruì un'AMI personalizzata che partiva dall'ultima base Amazon Linux 2023
e aggiungeva il runtime Node.js, le dipendenze di sistema dell'applicazione e un file di
servizio preconfigurato per il processo dell'applicazione. Le nuove istanze avviate da
questa AMI iniziavano a servire il traffico in meno di 90 secondi — significativamente
più veloce dei quattro minuti di avvio quando si usavano gli script UserData per installare
tutto da zero.

C'è un compromesso: le AMI personalizzate devono essere mantenute. Ogni volta che aggiorni
una dipendenza di sistema o la versione del runtime, devi ricostruire l'AMI. I team che
lasciano le loro AMI diventare obsolete si ritrovano a eseguire istanze con software
datato — un rischio di sicurezza. Priya inserì "ricostruire l'AMI con i pacchetti più
recenti" nella checklist mensile di engineering.

"Quanto costa archiviare le AMI?" chiese Tom.

Le AMI sono archiviate come snapshot EBS — si paga il prezzo degli snapshot EBS
(approssimativamente 0,05 dollari per GB al mese) per la dimensione dell'AMI. Una tipica
AMI Amazon Linux con lo stack applicativo Nimbus era di circa 4 GB. A 0,05 $/GB:
0,20 dollari al mese per AMI. Mantenere cinque AMI storiche per scopi di rollback:
1 dollaro/mese. Non è un costo significativo.

**UserData: Lo Script di Bootstrap**

C'è un'altra opzione di configurazione in EC2 che Leo scoprì quando cercava di evitare
di costruire una nuova AMI ogni volta che il codice dell'applicazione cambiava.

Quando avvii un'istanza EC2, puoi fornire uno **script UserData** — uno script shell che
viene eseguito automaticamente quando l'istanza si avvia per la prima volta. Viene eseguito
come root, prima che l'istanza sia considerata "pronta."

Per Nimbus, lo script UserData era qualcosa del genere:

```bash
#!/bin/bash
yum update -y
yum install -y nodejs npm git
git clone https://github.com/nimbus-app/server.git /opt/nimbus
cd /opt/nimbus
npm install
systemctl enable nimbus
systemctl start nimbus
```

Quello script installa Node.js, scarica l'ultimo codice dell'applicazione, installa le
dipendenze e avvia il servizio dell'applicazione. Ogni nuova istanza avviata dall'AMI base
esegue questo script e si avvia con la versione corrente dell'applicazione installata — automaticamente.

Questo approccio significa che l'AMI rimane semplice (solo un OS base), e UserData gestisce
la configurazione dell'applicazione. Il compromesso: gli script UserData richiedono tempo per
essere eseguiti. Un'istanza potrebbe richiedere da tre a cinque minuti per avviarsi ed
essere pronta. Per le applicazioni dove il tempo di avvio è importante — per l'Auto Scaling,
dove si ha bisogno che le nuove istanze siano pronte rapidamente — incorporare l'applicazione
in un'AMI personalizzata riduce significativamente il tempo di avvio.

"Andrà bene," disse Leo, quando Priya gli chiese del tempo di avvio.

"Qual è il tempo di avvio?" chiese lei.

"Quattro minuti."

"E durante quei quattro minuti, l'istanza è in esecuzione ma non serve il traffico?"

"Sì."

"Quindi durante un picco di traffico improvviso, potremmo avere quattro minuti in cui le
nuove istanze non stanno ancora aiutando?"

Leo guardò il suo script UserData. Iniziò a capire come costruire un'AMI personalizzata.

**Le Key Pair: Il Modo Giusto per Accedere a un Server**

Ricordi il disastro di "Admin123" del capitolo precedente?

Il modo corretto per accedere a un'istanza EC2 è con una **key pair**.

Una key pair è una coppia crittografica: una chiave pubblica (archiviata da AWS sul server)
e una chiave privata (un file che scarichi e mantieni segreto). Per accedere, usi SSH — un
protocollo sicuro — con la tua chiave privata. Non c'è password. Se perdi la chiave privata,
perdi l'accesso. Non c'è "ho dimenticato la password" per SSH.

Questo è importante perché le key pair sono:

- Uniche per te
- Crittograficamente impossibili da indovinare
- Non archiviate da AWS (tu mantieni la chiave privata)
- Facili da revocare (elimina la chiave dal server, genera una nuova coppia)

Priya aveva già impostato l'accesso basato su chiave sul server Nimbus. Il server Admin123
fu dismesso. Nessuno ne fu dispiaciuto.

"E se qualcuno tenta di intercettare una key pair in transito?" chiese Priya. Aveva già elaborato la risposta: la chiave privata non viaggia mai sulla rete. La scarichi una volta. La conservi in locale. Non lascia mai la tua macchina.

**Cosa Succede Se Perdi la Key Pair**

Leo pose questa domanda nella terza settimana, con l'energia specifica di qualcuno che
non ha ancora perso la sua key pair ma ci sta pensando.

"Se perdo il file della chiave privata, cosa succede?"

"Perdi l'accesso SSH all'istanza," disse Priya.

"In modo permanente?"

"Non necessariamente. Ma il processo di recupero è spiacevole."

Il processo di recupero: ferma l'istanza, stacca il volume EBS root, allegalo a una
diversa istanza a cui *hai* accesso, monta il volume, aggiungi una nuova chiave pubblica
al file `authorized_keys` sul volume montato, staccalo e riattaccalo all'istanza originale,
riavvia.

Funziona. Richiede da trenta a sessanta minuti e richiede un'esecuzione attenta. Un passo sbagliato e puoi peggiorare le cose.

L'alternativa, se la tua applicazione non archivia nulla di critico sul volume root (perché hai seguito i consigli di questo libro e archivi i dati in S3 e EBS): termina l'istanza e avviane una nuova dall'AMI. Genera una nuova key pair quando lo fai.

"Archivia la chiave privata in un posto sicuro," disse Priya. "E mai su un'istanza EC2."

Leo guardò la cartella sul desktop etichettata `AWS_keys`. Poi Priya. Poi spostò la cartella nel suo gestore di password cifrato.

**Security Group: Il Firewall dell'Istanza**

Quando un'istanza EC2 viene avviata, ha bisogno di un **security group** — un firewall
virtuale che controlla quale traffico di rete può raggiungerla e quale traffico può inviare.

Un security group ha due set di regole: **inbound** (traffico in entrata) e **outbound**
(traffico in uscita).

Per impostazione predefinita, un nuovo security group blocca tutto il traffico in entrata
e consente tutto il traffico in uscita. Si aggiungono regole inbound per aprire porte
specifiche a sorgenti specifiche.

Per il server web Nimbus, Priya configurò:

- Consentire TCP porta 443 (HTTPS) da `0.0.0.0/0` (l'intera internet)
- Consentire TCP porta 80 (HTTP) da `0.0.0.0/0` (reindirizzato a 443 nell'applicazione)
- Consentire TCP porta 22 (SSH) solo dall'indirizzo IP dell'ufficio — non da internet

"Aspetta — ma *perché* dovremmo limitare SSH solo all'IP dell'ufficio?" chiese Maya.

"Perché se SSH è aperto all'intera internet," disse Priya, "i bot automatizzati colpiranno
la porta 22 cercando combinazioni di credenziali ventiquattro ore al giorno. I nostri log
si riempiranno di tentativi falliti. E se mai ci fosse una vulnerabilità nel daemon SSH
stesso, ogni attaccante nel mondo potrebbe cercare di sfruttarla."

"Ma se Leo ha bisogno di accedere da casa?"

"VPN," disse Priya.

Leo aveva già una VPN configurata. Aveva l'espressione di qualcuno a cui era già stata posta questa domanda in precedenza.

Il database viveva ancora sulla stessa macchina dell'applicazione — ma Priya preparò un
security group separato per il giorno in cui non sarebbe più stato così: la porta del
database aperta solo al traffico dal security group del server web — non da internet, non
da SSH (per l'accesso diretto al DB), non da nessun altro posto. Nel frattempo, si
assicurò che il security group dell'istanza condivisa non esponesse la porta del database
a internet. Il database sarebbe stato invisibile a tutto tranne all'applicazione che ne
aveva bisogno.

Per raggiungere il database direttamente, un attaccante avrebbe dovuto compromettere prima
il server web. Questo era il primo livello di difesa.

"E il secondo livello?" chiese Tom.

"Autenticazione IAM per il database. E cifratura in transito."

Aggiunse entrambi alla checklist di configurazione.

**EC2 Instance Metadata e IMDSv2**

C'è un altro aspetto della sicurezza di EC2 che è importante nella pratica, anche se
raramente viene spiegato nei contenuti introduttivi.

Quando un'applicazione gira su un'istanza EC2, può interrogare un endpoint interno speciale
all'indirizzo `http://169.254.169.254/latest/meta-data/` per recuperare informazioni
sull'istanza: il suo ID, la sua Region, la sua availability zone, e — fondamentalmente —
le credenziali IAM temporanee associate a qualsiasi IAM Role allegato.

Questo è il modo in cui l'applicazione sull'istanza EC2 chiama i servizi AWS senza credenziali
hardcoded. Chiede al servizio di metadati: "Quali credenziali dovrei usare adesso?" Il servizio
di metadati restituisce credenziali temporanee che scadono e ruotano automaticamente.

Il problema di sicurezza: le versioni precedenti di questo servizio di metadati (IMDSv1)
rispondevano a qualsiasi richiesta da qualsiasi processo sull'istanza. Se un'applicazione
aveva una vulnerabilità Server-Side Request Forgery (SSRF) — un bug per cui un attaccante
poteva far scaricare al server un URL a sua scelta — l'attaccante poteva usare quella
vulnerabilità per recuperare `http://169.254.169.254/latest/meta-data/iam/security-credentials/`
e ottenere le credenziali IAM dell'istanza.

Questo attacco è stato usato in violazioni reali.

**IMDSv2** (Instance Metadata Service versione 2) risolve questo richiedendo un token di
sessione prima che il servizio di metadati risponda. Il token viene ottenuto tramite una
richiesta PUT. Gli attacchi SSRF, che tipicamente usano richieste GET, non possono completare
il passo PUT — quindi non riescono a ottenere il token e i metadati non vengono restituiti.

"Dovremmo abilitare IMDSv2?" chiese Leo.

"È l'impostazione predefinita per le nuove istanze ora," disse Priya. "Ma per le istanze
esistenti, devi farne l'opt-in."

Lo abilitò su tutte le istanze Nimbus esistenti quel pomeriggio.

**Ciclo di Vita dell'Istanza: Non Per Sempre**

Questo è qualcosa che molti principianti trascurano.

Le istanze EC2 non sono permanenti per impostazione predefinita. Quando fermi un'istanza,
la risorsa di calcolo viene rilasciata. Quando la riavvii, potrebbe girare su hardware
fisico diverso. Qualsiasi dato archiviato *sull'istanza stessa* (sul suo volume root) sopravvive
a un ciclo di stop/start — ma l'indirizzo IP pubblico cambia.

Quando *termini* un'istanza, è sparita. A meno che tu non abbia storage separato allegato
(che copriamo nel Capitolo 6), qualsiasi dato sull'istanza scompare.

I quattro stati in cui può trovarsi un'istanza EC2:

**Pending**: L'istanza si sta avviando. L'hardware è stato allocato ma non ha finito
di avviarsi.

**Running**: L'istanza è attiva e accessibile. Stai pagando per essa. Al primo avvio,
è anche quando viene eseguito lo script UserData.

**Stopping/Stopped**: L'istanza è spenta. Il volume EBS root è preservato. Non stai
pagando per il calcolo, ma stai ancora pagando per lo storage EBS allegato.

**Shutting-down/Terminated**: L'istanza viene eliminata. A meno che tu non abbia
configurato i volumi EBS per persistere, i loro dati sono andati.

Questa "effemeratezza" è in realtà una funzionalità, non un difetto. Significa che puoi
avviare server, usarli e buttarli via. Abilita lo scaling orizzontale. Ma significa anche
che non dovresti mai archiviare dati importanti *sull'istanza* EC2 stessa.

Dove vivono i dati, allora?

Nello storage separato. Ci arriviamo nei prossimi due capitoli.

Ti starai chiedendo: se un'istanza ottiene un nuovo indirizzo IP ogni volta che viene riavviata, come fa la tua applicazione a mantenere un indirizzo stabile? AWS ha una soluzione chiamata Elastic IP — un IP pubblico statico di tua proprietà che rimane lo stesso anche dopo i riavvii. Una nota sui costi: da febbraio 2024, AWS addebita una piccola tariffa oraria per ogni indirizzo IPv4 pubblico — gli Elastic IP (allegati o no) e gli IP pubblici assegnati automaticamente alle istanze allo stesso modo. Gli IPv4 pubblici non sono più gratuiti, il che è un motivo in più per tenere le istanze in subnet private dietro un load balancer.

Per le applicazioni dietro un load balancer — che è l'architettura corretta per qualsiasi
applicazione web di produzione — non hai affatto bisogno degli Elastic IP. Gli utenti si
connettono al nome DNS stabile del load balancer. Il load balancer si connette alle istanze
tramite i loro indirizzi IP privati all'interno del VPC. Le istanze possono andare e venire,
ottenere nuovi IP, scalare in su e in giù — il load balancer gestisce tutto in modo
trasparente. Gli Elastic IP sono per casi d'uso specifici: un server a cui i client si
connettono direttamente tramite IP, un bastion host con un indirizzo stabile,
un'applicazione che per qualche motivo specifico non è dietro un load balancer.

Leo inizialmente pianificò di usare gli Elastic IP per i server web Nimbus. Priya fece
notare che con un load balancer, gli indirizzi IP dei server web erano irrilevanti per
i client esterni. Il load balancer aveva il nome DNS stabile. Le istanze dietro di esso
erano usa-e-getta per design.

"Quindi gli Elastic IP sono per l'eccezione, non per la regola," disse Leo.

"Esatto," disse Priya. "E se ti ritrovi ad averne bisogno uno, chiediti se
l'architettura dovrebbe avere un load balancer."

**Cosa Significa "Elastic"**

Abbiamo detto che EC2 sta per Elastic Compute Cloud. Cosa c'è di elastico?

Due cose:

**Elasticità verticale**: Puoi cambiare le dimensioni di un'istanza. Ferma l'istanza,
cambiala da `t3.micro` a `t3.xlarge`, riavviala. Più CPU e memoria, stessa applicazione,
stesso setup.

**Elasticità orizzontale**: Puoi aggiungere più istanze. Invece di un grande server,
fai girare dieci server medi dietro un load balancer. Quando il traffico scende, rimuovi
le istanze e smetti di pagarle.

Entrambi gli approcci risolvono il problema del "un solo server, troppo traffico". Hanno
compromessi diversi, che esploriamo nel Capitolo 7 quando aggiungiamo l'Auto Scaling alla
storia.

L'intuizione chiave: con EC2, la potenza di calcolo è qualcosa che *regoli* piuttosto che
qualcosa che *compri*. Ne hai bisogno di più? Gira la manopola in su. Ne hai bisogno di meno?
Girala in giù. Paga di conseguenza.

Maya guardò la tabella dei tipi di istanza. "Se possiamo semplicemente rendere il server più grande, perché preoccuparsi di dieci server medi?"

"Perché," disse Leo, "un server grande è comunque un solo server. Se va giù, va giù tutto. Dieci server medi significano che uno può guastarsi e nove continuano a girare."

"E," aggiunse Priya, "non puoi rendere un server più grande senza riavviarlo. Dieci piccoli significano che puoi aggiungerne altri senza toccare quelli che sono in esecuzione."

Tom aveva già scritto "riavvio = downtime" nel suo taccuino.

**EC2 Placement Group: Controllare Dove Atterrano le Istanze**

EC2 ti dà il controllo su cosa è la tua istanza — le sue dimensioni, il suo OS, la sua
configurazione. Ti dà anche un controllo limitato su *dove* atterra fisicamente, attraverso
una funzionalità chiamata **placement group**.

Per impostazione predefinita, AWS distribuisce le istanze sull'hardware fisico per massimizzare
la disponibilità. Ma per certi carichi di lavoro, vuoi sovrascrivere quell'impostazione
predefinita — sia per avvicinare le istanze tra loro, sia per garantire che rimangano
lontane.

Tre tipi di placement group:

**Cluster**: Riunisce le istanze nello stesso posto all'interno di una singola Availability Zone,
tipicamente sullo stesso rack fisico o hardware adiacente. Il risultato è la latenza di rete
più bassa e il throughput di rete più alto tra le istanze del gruppo — con throughput di rete
di 10 Gbps o superiore tra le istanze (da non confondere con Enhanced Networking/ENA, che è
una funzionalità di networking per istanza indipendente dai placement group). Questa è la
scelta per HPC (high-performance computing), grandi lavori di training ML e carichi di lavoro
paralleli strettamente accoppiati dove le istanze passano molto tempo a inviare dati l'una
all'altra. Il compromesso è la disponibilità: se il segmento hardware sottostante si guasta,
tutte le istanze nel cluster possono essere colpite simultaneamente.

**Partition**: Divide le istanze su partizioni logiche, dove ogni partizione si trova sul
proprio set di hardware — rack separati, alimentazione separata, switch di rete separati.
Le istanze all'interno di una partizione condividono l'hardware tra loro, ma le partizioni
non condividono mai l'hardware con altre partizioni. Questo design limita il raggio d'impatto
di un guasto hardware: un rack che si guasta colpisce una partizione ma non le altre. I
placement group di tipo Partition sono costruiti per grandi carichi di lavoro distribuiti e
replicati — Apache Hadoop, Apache Cassandra, Apache Kafka — dove si vuole un isolamento dai
guasti sufficiente che un guasto a livello di rack non abbatta l'intero cluster.

**Spread**: Posiziona ogni istanza su hardware sottostante completamente separato. Massimo
isolamento tra le istanze. Se hai cinque istanze dell'applicazione critiche che non devono
mai condividere un host fisico (perché un singolo guasto hardware non dovrebbe mai abbattere
più di uno), Spread è la risposta. Il limite: **7 istanze per Availability Zone per placement
group**. Spread è progettato per piccoli numeri di istanze critiche che non possono tollerare
la co-locazione, non per grandi flotte.

"Quindi Cluster è per la velocità, Spread è per l'isolamento, e Partition è per i sistemi
distribuiti che hanno bisogno sia di clustering che di isolamento?" chiese Maya.

"Abbastanza vicino," disse Priya. "Cluster: bassa latenza tra le istanze, un grande rischio.
Spread: massimo isolamento, limite di sette per AZ. Partition: isolamento strutturato per
grandi sistemi distribuiti — controlli quale partizione va in ogni istanza."

Per l'architettura attuale di Nimbus, nessuno di questi si applicava ancora. Ma sapere che
esistevano significava sapere quando farne uso — e, più immediatamente, sapere cosa stava
chiedendo una domanda d'esame su "carichi di lavoro HPC che necessitano di bassa latenza
tra nodi."

## Punti di Forza e Limitazioni

**Perché EC2 è potente**:

- Controllo completo. Scegli il sistema operativo, il software, la configurazione. È il tuo computer.
- Dimensionamento flessibile. Centinaia di tipi di istanza per ogni caso d'uso.
- Nessun hardware da gestire. AWS gestisce il layer fisico.
- Fatturazione al secondo, con un minimo di 60 secondi, per AMI Amazon Linux, Windows e Ubuntu. (Alcune AMI Linux commerciali, come RHEL e SUSE, fatturano ancora per ora — verifica i termini di fatturazione dell'AMI.) Fermi l'istanza, smetti di pagare.
- Funziona con tutto. EC2 è la base su cui sono costruiti la maggior parte degli altri servizi AWS.
- Più modelli di prezzo (On-Demand, Reserved, Spot) consentono una significativa ottimizzazione dei costi
  per carichi di lavoro prevedibili o flessibili — trattato in dettaglio nel Capitolo 27.

**Dove diventa complicato**:

- Sei responsabile del patching e aggiornamento del sistema operativo. (Modello di Responsabilità
  Condivisa — questa è la parte "nel cloud" che è tua.)
- Il patching del sistema operativo non è facoltativo. Le istanze EC2 non patchate sono uno dei
  vettori di attacco più comuni nelle violazioni cloud. AWS Systems Manager Patch Manager può
  automatizzarlo — ma devi configurarlo e monitorarlo.
- Gestire EC2 su larga scala significa gestire lo stato dell'istanza, le AMI, le patch di sicurezza
  e il ciclo di vita su potenzialmente migliaia di macchine. Questo è overhead operativo.
- EC2 non è la risposta giusta per tutto. Per codice event-driven che gira raramente, Lambda
  (Capitolo 20) è più economico e semplice. Per carichi di lavoro containerizzati, ECS e EKS
  (Capitolo 21) offrono una migliore efficienza delle risorse.
- Le istanze inutilizzate costano comunque denaro. Se fermi un'istanza, smetti di pagare per
  il calcolo — ma se hai storage allegato, continui a pagarlo.

**La valutazione su quando non usare EC2**: EC2 ti dà il massimo controllo — ma il controllo ha un costo operativo. Ogni istanza EC2 che gestisci è qualcosa che devi patchare, monitorare e alla fine sostituire. Per le applicazioni che girano raramente (Lambda è più economico), per le applicazioni che devono scalare orizzontalmente a decine o centinaia di istanze (i container sono più efficienti), o per database e altri carichi di lavoro gestiti (RDS, ElastiCache), i servizi completamente gestiti eliminano un overhead operativo significativo a un modesto sovrapprezzo. EC2 è la scelta giusta quando hai bisogno del controllo che offre — non per impostazione predefinita.

Priya aveva un'euristica: "Se saremmo contenti di un servizio gestito che fa ciò di cui abbiamo bisogno, usiamo il servizio gestito. Usiamo EC2 quando l'opzione gestita non esiste o non si adatta."

Leo inizialmente si oppose. "Ma EC2 ci dà più opzioni."

"Le opzioni sono overhead," disse Priya. "Non abbiamo bisogno di ogni opzione. Abbiamo bisogno della configurazione giusta, mantenuta in modo affidabile."

## Riepilogo

Un'istanza avviata per caso non sarebbe mai stata un server di produzione. Capire EC2 correttamente non risolse solo il problema della capacità — introdusse un nuovo set di concetti che sarebbero apparsi in quasi ogni capitolo successivo. I tipi di istanza, le AMI, le key pair, i security group e il right-sizing non sono curiosità EC2; sono il vocabolario su cui è costruito il resto del libro. Imparale qui e tutto il resto ha più senso.

- Un'**istanza EC2** è una macchina virtuale che noleggi in AWS. I tipi di istanza sono organizzati per caso d'uso: uso generale, ottimizzato per il calcolo, ottimizzato per la memoria, ottimizzato per lo storage. Scegli la famiglia giusta e ridimensiona correttamente in base alle metriche effettive del carico di lavoro — non al caso peggiore immaginato.
- Un'**AMI** (Amazon Machine Image) è il template per il sistema operativo e la configurazione iniziale dell'istanza. Le AMI personalizzate abilitano deployment coerenti e ripetibili.
- Le **key pair** sono il modo sicuro per accedere alle istanze EC2. I **security group** sono il firewall dell'istanza — limita SSH agli IP noti e blocca le porte del database al security group dell'applicazione.
- **IMDSv2** dovrebbe essere abilitato su tutte le istanze per proteggersi dal furto di credenziali basato su SSRF tramite il servizio di metadati dell'istanza.
- Le istanze EC2 non sono permanenti per impostazione predefinita. Le istanze terminate perdono i loro dati locali — archivia i dati importanti in S3 o EBS, non sul disco dell'istanza.

## Suggerimenti per l'Esame

*Dominio SAA-C03: 3 — Task 3.2 (soluzioni di calcolo ad alte prestazioni)*

- **Responsabilità Condivisa per EC2**: Sei responsabile del patching del SO.
  AWS mantiene l'hardware fisico e l'hypervisor. Questa è una distinzione frequentemente
  testata.
- **Le famiglie di istanza sono importanti per le domande a scenario.** Se uno scenario
  menziona requisiti di memoria elevata (cache in-memory, SAP HANA), la risposta coinvolge
  probabilmente un'istanza ottimizzata per la memoria. Se menziona elaborazione batch o HPC,
  ottimizzata per il calcolo.
- **Stop ≠ Terminate.** Fermare un'istanza la preserva (puoi riavviarla). Terminarla la
  elimina. Gli scenari d'esame verificano se conosci questa distinzione.
- **L'IP pubblico cambia al riavvio.** Se la tua applicazione ha bisogno di un indirizzo IP
  stabile, usa un **Elastic IP** — un IP pubblico statico che rimane associato al tuo account.
  Da febbraio 2024, AWS addebita ogni indirizzo IPv4 pubblico ogni ora — gli Elastic IP
  (allegati o no) e gli IP pubblici assegnati automaticamente alle istanze allo stesso modo.
- **I modelli di pricing On-Demand, Reserved e Spot** sono testati pesantemente nel Dominio 4.
  Li copriamo nel Capitolo 27. Per ora, sappi che On-Demand significa pagare al secondo
  senza impegno.
- **I security group sono stateful.** Se consenti il traffico in entrata su una porta, il
  traffico di ritorno è automaticamente consentito senza una regola outbound esplicita. Le
  NACL (trattate nel Capitolo 15) sono stateless — richiedono regole sia inbound che outbound.
- **Placement Group:** Cluster = latenza più bassa tra le istanze (HPC, training ML — ma rischio di single point of failure per il gruppo); Partition = sistemi distribuiti (Hadoop, Kafka, Cassandra) con isolamento dai guasti per partizione; Spread = massimo isolamento dell'istanza, max 7 per AZ. Pattern della domanda d'esame: "carico di lavoro HPC strettamente accoppiato necessita di massimo throughput di rete tra nodi" → Cluster placement group.

## Esercizi

**Esercizio 1 — Ricordo**

Con parole tue: cos'è un'istanza EC2? Cos'è un'AMI? Qual è la relazione tra loro?

*(Suggerimento: Pensa all'analogia della ricetta — qual è la ricetta e qual è il pasto?)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: Un'azienda sta effettuando il deploy di un'applicazione web ad alto traffico.
L'applicazione gestisce ricerche nel catalogo prodotti con logica di filtraggio complessa
che è CPU-intensiva. Il team si aspetta picchi di traffico significativi durante gli
eventi di saldi. Vogliono assicurarsi di scegliere il tipo di istanza EC2 giusto e di
essere preparati per i picchi di traffico.

Quale combinazione di scelte soddisfa MEGLIO i loro requisiti?

A) Istanze ottimizzate per la memoria con un numero fisso per garantire prestazioni costanti
B) Istanze ottimizzate per il calcolo con Auto Scaling per gestire i picchi di traffico
C) Istanze di uso generale con una singola istanza di grandi dimensioni
D) Istanze ottimizzate per lo storage perché il catalogo prodotti richiede accesso rapido al disco

**Suggerimento 1**: Il carico di lavoro è descritto come "CPU-intensivo." Quale famiglia
di istanza è ottimizzata per la CPU?

**Suggerimento 2**: Lo scenario menziona "picchi di traffico durante gli eventi di saldi."
Un numero fisso di istanze non gestirà in modo efficiente il traffico variabile. Quale
funzionalità AWS gestisce questo?

**Suggerimento 3**: Le istanze ottimizzate per il calcolo gestiscono il lavoro CPU-intensivo.
Auto Scaling aggiunge e rimuove istanze in base alla domanda. Insieme rispondono a entrambi
i requisiti.

**Risposta**: B

**Spiegazione**: Le istanze ottimizzate per il calcolo (come la famiglia `c`) forniscono
più CPU per dollaro per i carichi di lavoro CPU-intensivi. Auto Scaling regola
automaticamente il numero di istanze in base al carico — aggiungendo istanze durante gli
eventi di saldi, rimuovendole quando il traffico torna alla normalità. Questa combinazione
ottimizza sia le prestazioni che i costi.

**Perché non A?** Le istanze ottimizzate per la memoria sono progettate per carichi di
lavoro che necessitano di grandi quantità di RAM (database, cache in-memory). Questo è un
carico di lavoro CPU-bound. E un numero fisso di istanze significa o over-provisioning
(spreco) o under-provisioning (guasto).

**Perché non C?** Le istanze di uso generale scambiano un po' di efficienza CPU per
bilanciamento. Per un carico di lavoro noto CPU-intensivo, l'ottimizzazione per il calcolo
è più appropriata. E una singola istanza grande è un singolo punto di guasto.

**Perché non D?** Il collo di bottiglia è la CPU, non l'I/O del disco. Le istanze
ottimizzate per lo storage sono progettate per carichi di lavoro che necessitano di
throughput molto elevato verso lo storage locale.

*Dominio SAA-C03: 3 — Task 3.2*

**Esercizio 3 — Sfida di Architettura** *(Opzionale)*

Nimbus attualmente gestisce una singola istanza EC2 `t3.micro` per l'intera applicazione.
Il team deve decidere: aggiornare a un'istanza più grande (`t3.2xlarge`) o aggiungere più
istanze `t3.micro` dietro un load balancer?

Analizza i compromessi. Quali sono i vantaggi di ogni approccio? Quali domande faresti per
decidere? (Suggerimento: pensa ai singoli punti di guasto, ai costi, alla complessità del
deployment e a cosa succede durante la manutenzione.)

*(Non esiste una risposta unica corretta. Si tratta di ragionare sullo scaling verticale
vs. orizzontale.)*

## Scena Post-Crediti

Leo trascorse il pomeriggio a eseguire il downsize. Passò dalla `t3.large` a una `t3.small`,
usando i dati di right-sizing che Tom aveva raccolto da CloudWatch. La CPU si stabilizzò
intorno al 12% durante il carico normale. Le pagine si caricavano in meno di un secondo.

Tom guardò la fattura AWS aggiornarsi in tempo reale. La t3.small costava ancora circa il
doppio all'ora rispetto alla micro originale — ma un terzo della t3.large per cui stavano
pagando troppo. Prese nota: *40 $/mese risparmiati rispetto alla t3.large precedente.
Decisione giusta.*

Maya stava guardando qualcos'altro sul suo schermo.

"Leo," disse. "Mentre ridimensionavi l'istanza, il sito web è stato giù per
dodici minuti."

Leo alzò lo sguardo.

"Avevamo una coda di duecento ordini non evasi."

Guardò lo schermo. Poi il soffitto. Poi di nuovo lo schermo.

"Abbiamo bisogno di qualcosa per le nostre immagini," disse, cambiando leggermente argomento.
"In questo momento, le foto dei menu caricate vengono salvate direttamente sul server. Se
ridimensioniamo o riavviamo l'istanza, le perdiamo?"

Priya conosceva già la risposta.

Nel prossimo capitolo: dove vivono i file quando non c'è nessun disco rigido a cui puntare.
