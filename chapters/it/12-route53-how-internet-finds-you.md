# Capitolo 12: Come Internet Ti Trova

Nimbus era in esecuzione. Il load balancer aveva un indirizzo IP pubblico. Le istanze EC2 avevano un indirizzo IP privato. I database erano bloccati in subnet private. Priya aveva annuito approvando il diagramma di rete.

Tom guardava l'URL del load balancer: `nimbus-alb-123456789.us-east-1.elb.amazonaws.com`.

"È quello che i clienti digitano nel loro browser?" chiese.

"È quello che AWS assegna automaticamente," disse Maya.

"Non metterò questo su una tessera di visita."

"Nemmeno io."

Avevano bisogno di un nome di dominio. Avevano comprato `eatnimbus.com` da un registrar di domini. Ora avevano bisogno di collegare quel nome alla loro infrastruttura AWS.

"Come fa Internet a sapere che `eatnimbus.com` significa il load balancer in us-east-1?" chiese Leo.

Buava domanda, Leo.

**L'Analogo dell'Enciclopedia Telefonica**

Prima degli smartphone, ogni città aveva un'enciclopedia telefonica. Se volevi raggiungere "Pizzeria Mario", non dovevi memorizzare il loro numero di telefono — lo cercavi nel nome, ottenevi il numero e chiamavi.

Internet ha la sua enciclopedia telefonica: il **Sistema dei Nomi di Dominio (DNS)**.

Il DNS traduce i nomi leggibili dall'uomo (come `eatnimbus.com`) in indirizzi IP leggibili dalle macchine (come `203.0.113.42`). Ogni volta che visiti un sito web, il tuo computer esegue silenziosamente una ricerca del nome di dominio nel DNS e ottiene l'indirizzo IP per connettersi.

Se cambiassi l'indirizzo IP del server, dovresti aggiornare il record DNS — come cambiare il tuo numero nell'enciclopedia telefonica — e Internet ti troverebbe nella tua nuova posizione.

**Incontra Route 53**

Amazon Route 53 è il servizio DNS gestito di AWS. Si chiama Route 53 perché la porta 53 è la porta DNS standard (A volte AWS chiama le cose in modo semplice).

Route 53 fa diverse cose:

**Registrazione del dominio**: Puoi acquistare nomi di dominio tramite Route 53 direttamente.

**Hosting DNS (zone ospitate)**: Puoi creare una *zona ospitata* per il tuo dominio e Route 53 gestisce i record DNS che dicono al mondo dove trovare te.

**Controllo dello stato**: Route 53 può monitorare i tuoi endpoint e reindirizzare il traffico da quelli non funzionanti.

**Politiche di reindirizzamento del traffico**: Route 53 supporta più strategie di reindirizzamento oltre al semplice DNS — ponderata, basata sulla latenza, basata sulla posizione geografica, failover.

**Record DNS: Le Entrate dell'Enciclopedia**

Un record DNS mappa un nome a una destinazione. I tipi più comuni:

**Record A**: Mappa un nome a un indirizzo IPv4.
`eatnimbus.com → 203.0.113.42`

**Record AAAA**: Mappa un nome a un indirizzo IPv6.

**Record CNAME**: Mappa un nome a un altro nome (alias).
`www.eatnimbus.com → eatnimbus.com`

**Record MX**: Specifica i server che gestiscono la posta elettronica per il dominio.

**Record TXT**: Memorizza testo arbitrario. Spesso utilizzato per la verifica del dominio (dimostrare di possedere il dominio) e l'autenticazione della posta elettronica (SPF, DKIM).

Per Nimbus, la configurazione primaria:

- `eatnimbus.com → Record A che punta all'indirizzo IP del load balancer`
- `www.eatnimbus.com → Record CNAME che punta a `eatnimbus.com`
- `api.eatnimbus.com → Record A che punta al load balancer API`

"Aspetta," disse Tom. "L'indirizzo IP del load balancer può cambiare. AWS lo ha detto nella documentazione."

Buon colpo, Tom.

**Record Alias: La Soluzione di AWS per Indirizzi IP Dinamici**

I load balancer, le distribuzioni CloudFront e i siti web S3 hanno nomi DNS, non indirizzi IP statici. Gli indirizzi sottostanti possono cambiare.

Se crei un CNAME che punta al nome DNS di un load balancer, funziona — ma non puoi usare i CNAME per i domini root (`eatnimbus.com` senza il `www`) a causa degli standard DNS.

Route 53 risolve questo con **Record Alias** — un'estensione DNS specifica di AWS. Un Record Alias mappa un nome direttamente a una risorsa AWS (load balancer, distribuzione CloudFront, sito web S3) e Route 53 gestisce automaticamente la risoluzione dell'indirizzo IP dinamico. I Record Alias possono essere utilizzati a livello di dominio root. E a differenza delle query DNS standard a servizi esterni, le query dei Record Alias alle risorse AWS sono gratuite.

"Quindi usiamo un Record Alias per `eatnimbus.com` che punta al load balancer," confermò Leo.

"E Route 53 gestisce qualsiasi indirizzo IP che il load balancer stia usando in un dato momento," ha aggiunto Priya.

"Gratis," ha detto Tom, improvvisamente molto interessato.

**Politiche di Reindirizzamento: Più che "Dove Si Trova?"**

Questo è dove Route 53 diventa interessante. Il DNS non è solo un servizio di ricerca — può essere uno strumento di gestione del traffico.

**Reindirizzamento semplice**: Un record, una destinazione. DNS standard.

**Reindirizzamento ponderato**: Dividi il traffico verso più destinazioni in base al peso. Invia il 90% al nuovo server, il 10% all'antico durante una migrazione fino a quando non sei sicuro del nuovo server, quindi passa al 100%.

**Reindirizzamento basato sulla latenza**: Reindirizza gli utenti al regione AWS con la latenza più bassa per loro. Un utente a Seattle viene reindirizzato a `us-west-2`. Un utente a Tokyo viene reindirizzato a `ap-northeast-1`. Stesso nome di dominio, destinazioni diverse.

**Reindirizzamento basato sulla posizione geografica**: Reindirizza in base alla posizione geografica dell'utente. Tutti gli utenti europei vanno a `eu-west-1`. Tutti gli utenti nordamericani vanno a `us-east-1`. Utile per la conformità alla data di scadenza (mantenere i dati degli utenti dell'UE nelle regioni dell'UE) o per la personalizzazione dei contenuti (lingua, valuta).

**Instradidirizzo di failover**: Designa un endpoint primario e uno secondario. Se l'endpoint primario fallisce, il controllo di salute di Route 53 reindirizza automaticamente il traffico all'endpoint secondario. Questo è lo strato DNS della disaster recovery.

**Instradidirizzo di più valori**: Restituisce fino a otto indirizzi IP sani per una query, permettendo al client di scegliere. Un'alternativa semplice a un load balancer per distribuire il traffico su più server.

"Quindi Route 53 non è solo un annuario," disse Maya. "È un annuario intelligente che può instradare le chiamate in base a dove stai chiamando."

"E disconnetterti se il numero non è sano," aggiunse Priya.

**Controlli di Salute: Instradidirizzo intorno al fallimento**

Route 53 può monitorare i tuoi endpoint con controlli di salute. Se un endpoint fallisce, Route 53 può:

- Rimuoverlo dalle risposte DNS (interrompere l'invio del traffico lì)
- Avviare un failover a un endpoint di backup
- Inviare una notifica tramite CloudWatch

I controlli di salute sono il collegamento tra l'instradidirizzo DNS e la salute effettiva dell'applicazione. In una configurazione di failover: Route 53 monitora l'endpoint primario ogni 30 secondi. Se tre controlli consecutivi falliscono, Route 53 inizia a restituire l'indirizzo dell'endpoint secondario.

Questo non è istantaneo — DNS ha tempi di propagazione. Una volta che Route 53 modifica un record DNS, i resolver DNS in tutto il mondo devono acquisire la modifica, il che può richiedere secondi o minuti a seconda delle impostazioni TTL.

**TTL: La Cache DNS**

Le risposte DNS vengono memorizzate nella cache a diversi livelli — sul tuo router, sul tuo ISP, nel tuo browser. Il **TTL (Time-To-Live)** su un record DNS indica alle cache per quanto tempo ricordare la risposta prima di controllarne una di nuovo.

TTL elevato (1 ora o più): Meno query DNS, minore carico su Route 53, ma i cambiamenti impiegano più tempo a propagarsi.

TTL basso (60 secondi o meno): I cambiamenti si propagano rapidamente, ma sono necessarie più query DNS.

Prima di una migrazione pianificata (aggiornamento DNS per puntare a un nuovo server), abbassa il TTL a 60 secondi in anticipo. Quindi, quando fai la modifica, si propaga in circa un minuto. Dopo la migrazione, rialzalo al valore normale.

"Se semplicemente lo abbassiamo durante la migrazione e non prima," disse Leo lentamente, "il TTL vecchio significa che alcuni utenti vedranno il vecchio server per un'ora."

"Esattamente," disse Priya. "Le migrazioni DNS richiedono la pianificazione prima della migrazione, non solo durante."

## Punti di Forza e Limitazioni

**Route 53 è la scelta giusta per**: la registrazione e la gestione dei nomi di dominio interamente all'interno di AWS; l'instradidirizzo del traffico in base alla latenza, alla geolocalizzazione o alla distribuzione ponderata su più endpoint; il failover basato su controlli di salute tra regioni o tra un primario e un endpoint di disaster recovery; l'integrazione del DNS con altri servizi AWS tramite record alias.

**Quando Route 53 non è quello di cui hai bisogno**: Route 53 è un servizio DNS, non un load balancer. Se hai bisogno di distribuire il traffico tra più server o container all'interno di una regione, usa un Load Balancer applicativo — Route 53 non può fare una distribuzione del traffico a rotta arbitraria a livello di connessione come può fare un load balancer. L'instradidirizzo basato sulla latenza attraverso le regioni aggiunge costi e complessità operative che hanno senso solo quando i tuoi utenti sono genuinamente distribuiti globalmente e i millisecondi contano per la conversione. Per la maggior parte delle applicazioni a singola regione, un singolo record A che punta a un ALB è tutta la configurazione Route 53 di cui hai bisogno.

## Riepilogo

- **DNS** traduce i nomi di dominio in indirizzi IP — l'annuario del telefono di Internet.
- **Route 53** è il servizio DNS gestito di AWS: registrazione del dominio, hosting DNS, controlli di salute e politiche di instradidirizzo.
- **Record A** mappa i nomi agli indirizzi IPv4. **Record CNAME** mappa i nomi ad altri nomi. **Record Alias** mappa i nomi alle risorse AWS (load balancer, CloudFront, S3).
- Usa i record Alias (non i record CNAME) per i domini root e per le risorse con indirizzi IP dinamici.
- Le politiche di instradidirizzo vanno oltre un semplice DNS: **ponderata** (divisione del traffico), **basata sulla latenza** (prestazioni), **basata sulla geolocalizzazione** (sovranità dei dati), **failover** (disaster recovery).
- **Controlli di salute** monitorano gli endpoint e rimuovono automaticamente gli obiettivi non sani dalle risposte DNS.
- Pianifica i cambiamenti TTL prima delle migrazioni — abbassa il TTL in anticipo in modo che i cambiamenti si propaghino rapidamente.

## Suggerimenti per l'Esame

*SAA-C03 Dominio: Progettare Architetture ad Alte Prestazioni (Dominio 3, Task 3.4)*

- **Alias vs CNAME**: I record Alias possono essere utilizzati alla root del dominio; i CNAME non lo possono. I record Alias verso le risorse AWS sono gratuiti; le query DNS CNAME sono a pagamento. Quando l'esame chiede di mappare una root domain a un load balancer → record Alias.
- **Utilizzi delle policy di routing** (scenari comuni dell'esame):
  - "Migrare gradualmente il traffico a una nuova versione" → Routing pesato
  - "Instradare gli utenti alla regione AWS più vicina" → Routing basato sulla latenza
  - "Mantenere i dati degli utenti europei nelle regioni europee" → Routing basato sulla geolocalizzazione
  - "Failover DNS automatico quando il primario è inattivo" → Routing di failover con controlli di salute
- **Route 53 controlli di salute**: Possono controllare endpoint HTTP/HTTPS/TCP, e possono attivare allarmi CloudWatch. L'esame utilizza questi in scenari di disaster recovery.
- **TTL e propagazione**: Sapere che TTL controlla per quanto tempo i resolver DNS memorizzano nella cache un record. TTL breve = modifiche più rapide. Scenario d'esame: "il team ha aggiornato il DNS ma gli utenti stanno ancora colpendo il vecchio server" → TTL troppo alta.
- **Zone ospitate in privato**: Route 53 può creare record DNS che risolvono solo all'interno di una VPC. L'esame utilizza questo per la discovery di servizi interni (ad esempio, `database.internal` che risolve in un endpoint RDS privato).
- Route 53 è **globale** — non è distribuita in una regione. Non è necessario selezionare una regione quando si creano zone ospitate.

## Esercizi

**Esercizio 1 — Ricordo**

Spiega la differenza tra un record CNAME e un record Alias. Quando li useresti?

*(Suggerimento: Considera i vincoli sui CNAME ai domini root e il comportamento dei record Alias con risorse AWS dinamiche.)*

**Esercizio 2 — Esercitazione dell'esame**

*Scenario*: Una società di media opera un sito web da due regioni AWS: `us-east-1` (primaria) e `eu-west-1` (secondaria). Il team vuole instradare il traffico automaticamente a `eu-west-1` se la regione primaria diventa non disponibile. L'azienda vuole anche verificare che il meccanismo di failover funzioni correttamente senza interrompere la regione primaria.

Quale configurazione Route 53 soddisfa meglio questi requisiti?

A) Routing pesato con 100% di peso su `us-east-1` e 0% di peso su `eu-west-1`
B) Routing basato sulla latenza con controlli di salute su entrambi i punti finali
C) Routing di failover con un controllo di salute sul punto finale primario e un record secondario che punta a `eu-west-1`
D) Routing basato sulla geolocalizzazione con Nord America che punta a `us-east-1` e Europa che punta a `eu-west-1`

*(Suggerimento 1*: Il requisito è il failover automatico quando il primario fallisce. Quale policy di routing è progettata esattamente per questo?

*(Suggerimento 2*: "Test senza interrompere la regione primaria" — i controlli di salute possono essere impostati manualmente su "non sano" per il test.

*(Suggerimento 3*: Il routing basato sulla latenza ottimizza per la velocità, non per il failover.

**Risposta**: C

**Spiegazione**: La policy di routing di failover è progettata esattamente per questo caso d'uso. Il record primario punta a `us-east-1` con un controllo di salute. Il record secondario punta a `eu-west-1`. Se il controllo di salute fallisce, Route 53 serve automaticamente il record secondario. I controlli di salute possono essere forzati manualmente per fallire per il test senza interrompere la regione primaria.

**Perché non A?** Il routing pesato con 100%/0% è essenzialmente statico — non passa automaticamente quando il primario fallisce.

**Perché non B?** Il routing basato sulla latenza seleziona il punto finale più veloce per ogni utente. Non esclude automaticamente una regione in base alla salute — continuerebbe a instradare del traffico a `us-east-1` non sano se la latenza lo favorisce.

**Perché non D?** Il routing basato sulla geolocalizzazione instrada in base alla posizione dell'utente, non alla salute del punto finale. Gli utenti europei rimarrebbero su `eu-west-1` anche se `us-east-1` è sano, e gli utenti nordamericani non fallirebbero su `eu-west-1` anche se `us-east-1` fallisce.

*SAA-C03 Domain: Design High-Performing Architectures — Task 3.4*

**Esercizio 3 — Sfida di architettura** *(Opzionale)*

Nimbus sta espandendo la sua attività a livello internazionale. Vogliono che `eatnimbus.com` si carichi rapidamente per gli utenti sulla West Coast, sulla East Coast e in Australia. Hanno anche un requisito normativo: gli ordini effettuati da utenti europei devono essere elaborati da server nell'UE.

Progetta una policy di routing Route 53 che affronti entrambi i requisiti. Quale policy di routing o combinazione di policy useresti? Quali infrastrutture in ciascuna regione dovresti avere?

*(Non esiste una risposta corretta univoca. L'obiettivo è praticare la progettazione di routing multi-regione.)*

## Scena post-crediti

`eatnimbus.com` era attivo.

Sofia aveva digitato l'indirizzo nel suo browser e la pagina di ordinazione di Nimbus si era caricata. Aveva ordinato un arepa dal suo stesso ristorante di famiglia, solo per testare il flusso. L'ordine era andato a buon fine. La cucina l'aveva ricevuto.

Si sedette.

Leo era già a leggere i log dei controlli di salute di Route 53. "Il tempo di risposta è di 47 millisecondi da `us-east-1`."

"È veloce?" chiese Sofia.

"Per DNS? Sì."

"Ma per un utente a Seattle?"

Leo guardò il grafico di latenza. "Circa 80 millisecondi."

Sofia pensò a questo. "Se la maggior parte dei nostri clienti è sulla West Coast e i nostri server sono in Virginia..."

Tom

"Ogni richiesta viaggia da Seattle a Virginia e ritorno," disse Leo dall'altra parte della stanza. "La velocità della luce. Non si può battere la fisica."

"Quindi abbiamo bisogno di server più vicini a Seattle."

"O qualcosa più vicino a Seattle che serva il contenuto per loro conto."

Quel pensiero fluttuava nell'aria.

Nel prossimo capitolo: i magazzini che mettono il contenuto di Nimbus a un millisecondo da ogni utente, ovunque.
