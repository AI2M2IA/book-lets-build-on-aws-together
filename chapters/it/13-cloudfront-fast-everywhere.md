# Capitolo 13: Velocità Ovunque

Una foto che viaggia da un server in Virginia a uno smartphone a Seattle attraversa circa 4.400 chilometri di fibra ottica. A due terzi della velocità della luce, questo equivale a circa 25 millisecondi di pura fisica — inevitabile, non negoziabile, inscritta nelle leggi dell'universo.

Poi aggiungiamo il viaggio di ritorno. Poi aggiungiamo il tempo di elaborazione. Il browser non ha ancora iniziato a renderizzare e 80 millisecondi sono già passati.

`eatnimbus.com` era attivo. Leo aveva controllato le metriche di latenza provenienti da utenti della costa occidentale: 80-100 millisecondi per richiesta. Potrebbe sembrare piccolo, ma si accumula.

Caricare il menu: 90ms. Caricare l'elenco dei ristoranti: 80ms. Caricare le foto del ristorante: 200ms (le immagini sono grandi). Il tempo totale prima che un utente potesse effettuare un ordine: oltre mezzo secondo con una buona connessione.

"La fisica è il problema," disse Leo. "I server sono in Virginia. Gli utenti sono sulla costa occidentale."

"Quindi sposta i server sulla costa occidentale," disse Tom.

"Ci vuole dei soldi."

"Quanto?"

"Tanto. E crea un intero nuovo problema: mantenere sincronizzati i database della costa est e della costa occidentale."

Priya alzò lo sguardo dal suo laptop. "Oppure non spostiamo i server. Spostiamo il *contenuto*."

**L'Analogo del Magazzino Pre-Riempito**

Immagina Amazon il rivenditore, non la società cloud. Ha un enorme magazzino in una posizione e tutti i prodotti. Se spedissero ogni ordine da quel magazzino, i clienti in città lontane aspetterebbero giorni.

Invece, Amazon ha centri di distribuzione vicino ai centri abitati principali. Quando un prodotto è popolare, pre-riempiono quei magazzini locali. Quando un utente a Seattle ordina un libro, viene spedito dal centro di distribuzione locale — non da Virginia.

Questo è un **Content Delivery Network (CDN)**: una rete di server distribuiti geograficamente che memorizzano copie del tuo contenuto vicino ai tuoi utenti.

Quando un utente a Seattle richiede la tua homepage, la CDN la serve da un server a Seattle. Non da Virginia. La richiesta non attraversa il paese.

**Incontra CloudFront**

Amazon CloudFront è la CDN di AWS. Opera attraverso una rete globale di **locazioni di frontiera** — server di caching posizionati in città in tutto il mondo. Ad oggi, ci sono oltre 500 locazioni di frontiera in più di 90 città.

Quando configuri CloudFront, specifichi un **origine**: la fonte del tuo contenuto effettivo. La tua origine potrebbe essere:

- Un bucket S3 (file statici: immagini, CSS, JavaScript, PDF)
- Un Load Balancer Applicativo (contenuto dinamico dalla tua applicazione)
- Un'istanza EC2
- Un server HTTP ovunque su Internet

CloudFront si trova davanti alla tua origine. Le richieste arrivano alla locazione di frontiera più vicina. Se la locazione ha il contenuto memorizzato nella cache, lo restituisce immediatamente. Se non lo ha (un *cache miss*), lo recupera dall'origine, lo memorizza nella cache e lo restituisce.

**Come Funziona la Memorizzazione nella Cache di CloudFront**

La prima richiesta per qualsiasi elemento di contenuto è sempre un cache miss — va all'origine. Ogni richiesta successiva colpisce la cache nella locazione di frontiera.

Per Nimbus, le foto del menu sono candidati perfetti per CloudFront. Le foto dei ristoranti cambiano raramente (forse quando il ristorante aggiorna il suo profilo). Con CloudFront:

1. Utente a Seattle richiede `images.eatnimbus.com/restaurant-047/photo.jpg`
2. CloudFront controlla la locazione di frontiera a Seattle — non memorizzata nella cache ancora (cache miss)
3. CloudFront recupera da S3 in us-east-1 (~80ms)
4. CloudFront memorizza la foto nella locazione di frontiera di Seattle
5. La prossima utente a Seattle richiede la stessa foto
6. CloudFront serve dalla cache locale di frontiera (~5ms)

Lo stesso 80ms di penalità per la prima richiesta. Ma la millesima richiesta dalla stessa città è di 5 millisecondi.

**Intestazioni Cache-Control** e **impostazioni TTL** in CloudFront determinano per quanto tempo il contenuto rimane memorizzato nella cache nella frontiera. I file immagine possono essere memorizzati nella cache per ore o giorni. Le pagine HTML (che cambiano più spesso) potrebbero essere memorizzate nella cache per minuti o secondi.

**Contenuto Dinamico: CloudFront per Più di Semplicemente la Memorizzazione nella Cache**

"Ma cosa succede con le nostre risposte API? Queste sono dinamiche — cambiano per utente, per richiesta. Non puoi memorizzare nella cache una pagina di cronologia degli ordini."

Vero. Ma CloudFront aiuta ancora con il contenuto dinamico.

Anche quando il contenuto non può essere memorizzato nella cache, CloudFront instrada la richiesta alla locazione di frontiera tramite la rete privata ad alta velocità di AWS — la fibra ottica che collega l'infrastruttura AWS globalmente. Questo è più veloce e affidabile che instradare il traffico tramite Internet pubblico, dove il traffico può essere instradato attraverso più operatori.

Il risultato: le richieste dinamiche sono comunque del 20-40% più veloci tramite CloudFront rispetto a quelle che vanno direttamente all'origine tramite Internet pubblico. Non per via della memorizzazione nella cache, ma per via del percorso di rete.

Inoltre, CloudFront fornisce:

**Terminazione SSL/TLS**: CloudFront gestisce HTTPS alla frontiera. La connessione tra l'utente e CloudFront è crittografata. CloudFront può connettersi all'origine tramite HTTP internamente (riducendo il carico dell'origine) o HTTPS (per la crittografia end-to-end).

**Protezione DDoS**: CloudFront è integrato con AWS Shield Standard. La distribuzione del traffico su centinaia di posizioni di edge significa che gli attacchi vengono assorbiti sul perimetro piuttosto che colpire il tuo origine.

**Restrizioni Geografiche**: Blocca l'accesso da paesi specifici. Se Nimbus è autorizzato a operare solo in determinati mercati, CloudFront può applicare questa restrizione sul perimetro senza che la richiesta raggiunga mai i tuoi server.

**Comportamenti CloudFront: Regole di Cache Granulari**

Una distribuzione CloudFront può avere più **comportamenti** — regole di routing basate su modelli di URL.

Per Nimbus:

- `/images/*` → Cache sul perimetro per 7 giorni (le foto non cambiano spesso)
- `/static/*` → Cache sul perimetro per 30 giorni (CSS e JavaScript con nomi di file versionati)
- `/api/*` → Non cache; inoltra direttamente al load balancer
- `/*` → Cache per 5 minuti (pagine HTML)

Questo permette a CloudFront di essere intelligente: cache aggressivamente ciò che è stabile, inoltra ciò che è dinamico.

**Controllo dell'Accesso all'Origine: Sicurezza di S3 con CloudFront**

Se il tuo bucket S3 contiene contenuti privati che devono essere serviti solo tramite CloudFront (non direttamente), puoi utilizzare **Controllo dell'Accesso all'Origine (OAC)** per assicurarti che S3 rifiuti le richieste che non provengono da CloudFront.

In questo modo:

- `d1234abcd.cloudfront.net/image.jpg` Servito (CloudFront ha l'autorizzazione)
- `nimbus-assets.s3.amazonaws.com/image.jpg` Bloccato (accesso diretto a S3 negato)

Il tuo contenuto è accessibile solo tramite la tua distribuzione, con le tue regole di cache e le tue impostazioni di sicurezza applicate.

## Punti di Forza e Limitazioni

**Perché CloudFront è potente**:

- Posizioni di edge in oltre 90 città — la maggior parte degli utenti ottiene i contenuti a meno di 20ms di distanza
- Contenuti statici serviti in millisecondi singoli dopo la prima cache
- Riduce significativamente il carico dell'origine (traffico ripetuto non colpisce mai i tuoi server)
- Integrato con AWS Shield, WAF e Certificate Manager
- Nessuna pianificazione della capacità necessaria — CloudFront si scala automaticamente

**Dove diventa complicato**:

- Il contenuto in cache può essere obsoleto — invalidare la cache costa denaro ($0.005 per 1.000 percorsi)
- Le intestazioni Cache-Control devono essere impostate correttamente all'origine — gli errori causano contenuti obsoleti
- Il contenuto dinamico beneficia dell'ottimizzazione del routing ma non dalla cache
- Il debug del comportamento della cache (cosa viene memorizzato nella cache dove e per quanto tempo) richiede la comprensione di più livelli: intestazioni dell'origine, impostazioni TTL di CloudFront, regole di comportamento
- Il trasferimento dati in uscita tramite CloudFront costa denaro, sebbene sia inferiore al trasferimento dati standard

## Riepilogo

- Un **CDN** memorizza copie del tuo contenuto in posizioni di edge vicino ai tuoi utenti — riducendo la latenza e il carico dell'origine.
- **CloudFront** è la CDN di AWS, con oltre 500 posizioni di edge in tutto il mondo.
- Le miss rate recuperano dal **origine** (S3, ALB, EC2). I hit di cache servono dal perimetro — millisecondi, non centinaia di millisecondi.
- **Comportamenti** ti permettono di impostare regole di caching diverse per diversi modelli di URL.
- Il contenuto dinamico non viene memorizzato nella cache, ma CloudFront migliora comunque le prestazioni tramite la rete privata di AWS.
- **Controllo dell'Accesso all'Origine** limita l'accesso diretto a S3 — il contenuto viene servito solo tramite CloudFront.
- Integrato con Shield (DDoS), WAF (firewall di applicazione) e ACM (certificati SSL).

## Suggerimenti per l'Esame

*SAA-C03 Dominio: Progettare Architetture ad Alte Prestazioni (Dominio 3, Task 3.4)*

- **CloudFront + S3**: Modello di esame classico per servire siti web statici globalmente. Bucket S3 come origine, CloudFront come CDN, Controllo dell'Accesso all'Origine per prevenire l'accesso diretto a S3.
- **Posizioni di edge vs Regioni vs AZ**: Le posizioni di edge sono più numerose e esistono solo per scopi di caching/CDN. Non sono le stesse delle AZ (che eseguono il tuo calcolo).
- **Invalidazione della cache**: Crea un'invalidazione `/images/*` per forzare CloudFront a recuperare contenuti freschi. Costa denaro — l'esame potrebbe chiedere l'alternativa più conveniente: URL versionati (`image-v2.jpg` invece di `image.jpg`), che bypassano naturalmente la cache.
- **Controllo TTL**: `Cache-Control: max-age=3600` all'origine imposta un TTL di cache di 1 ora. CloudFront rispetta queste intestazioni.
- **CloudFront Functions vs Lambda@Edge**: CloudFront Functions eseguono sul perimetro per la manipolazione di richiesta/risposta leggera (sotto i millisecondi). Lambda@Edge esegue il tuo codice Lambda sul perimetro per l'elaborazione più pesante. L'esame distingue tra loro per complessità di caso d'uso.
- **URL firmati e Cookie firmati**: Controllano chi può accedere al contenuto tramite CloudFront. Gli URL firmati forniscono l'accesso a file specifici; i cookie firmati forniscono l'accesso a più file. L'esame utilizza questi per il "contenuto a pagamento".

## Esercizi

**Esercizio 1 — Ricordo**

Spiega la differenza tra una cache hit di CloudFront e una miss di cache. Cosa succede in ciascun caso?

*(Suggerimento: Pensa da dove proviene il contenuto e come differisce il tempo di risposta tra i due casi.)*

**Esercizio 2 — Esercizio per l'Esame**

*Scenario*: Un'azienda software distribuisce file di installazione di grandi dimensioni (~2GB) da un bucket S3 ai clienti in tutto il mondo. Le velocità di download sono lente per i clienti in Asia. Il team vuole migliorare le prestazioni senza replicare il bucket S3 in più regioni. Inoltre, devono assicurarsi che solo i clienti paganti possano scaricare i file di installazione.

Quale soluzione soddisfa al meglio questi requisiti?

A) Abilitare S3 Transfer Acceleration sul bucket e generare URL pre-firmat per i clienti paganti.
B) Utilizzare CloudFront con il bucket S3 come origine, abilitare Origin Access Control e utilizzare CloudFront Signed URLs per i clienti paganti.
C) Creare un bucket S3 in ogni regione AWS e utilizzare Route 53 geolocation routing per indirizzare i clienti al bucket più vicino.
D) Utilizzare un Application Load Balancer in ogni regione con istanze EC2 che servono i file di installazione.

**Suggerimento 1**: Il requisito è migliorare le prestazioni globali *senza* replicare il bucket. Quale opzione non richiede più bucket?

**Suggerimento 2**: Quale servizio controlla specificamente chi può accedere ai contenuti serviti tramite CloudFront?

**Suggerimento 3**: S3 Transfer Acceleration è ottimizzato per i caricamenti a lunga distanza *in* S3. Per la distribuzione dei contenuti *da* S3 agli utenti finali globalmente, CloudFront è lo strumento giusto.

**Risposta**: B

**Spiegazione**: CloudFront memorizza nella cache i file di installazione in posizioni di frontiera globalmente dopo il primo download. I download successivi dalla stessa regione provengono dalla frontiera — molto più veloci che attraversare il Pacifico da us-east-1. Origin Access Control garantisce che il bucket S3 sia accessibile solo tramite CloudFront. I Signed URLs limitano l'accesso ai clienti paganti.

**Perché non A?** S3 Transfer Acceleration è ottimizzato per i caricamenti a lunga distanza *in* S3 — non per la distribuzione dei contenuti *da* S3 a un pubblico globale. Per questo, CloudFront è lo strumento corretto. Gli URL pre-firmat controllano l'accesso, ma non migliorano le prestazioni globali.

**Perché non C?** Creare un bucket S3 per regione funziona, ma contraddice il requisito di evitare la replicazione. Inoltre, richiede una strategia di sincronizzazione dei dati tra i bucket.

**Perché non D?** Un load balancer applicativo in ogni regione con istanze EC2 che servono i file è significativamente più costoso di CloudFront e richiede la gestione di server in più regioni.

*SAA-C03 Domain: Progettare Architetture ad Alte Prestazioni — Task 3.4*

**Esercizio 3 — Sfida Architetturale** *(Opzionale)*

Nimbus vuole aggiungere contenuti video — brevi tutorial di cucina da partner ristoranti. I video possono essere da 50 a 500MB. Si aspettano che lo stesso video venga visualizzato da migliaia di utenti nella stessa città entro poche ore dalla pubblicazione.

Progetta l'architettura di storage e delivery. Utilizzeresti S3 e CloudFront? Come gestiresti la prima richiesta (cold start) per minimizzare il ritardo prima che il video venga memorizzato nella cache? Quale TTL (Time To Live) imposteresti per un video che non cambierà dopo la pubblicazione?

*(Non esiste una risposta univoca corretta. L'obiettivo è praticare le decisioni di progettazione CDN.)*

## Scena Post-Titoli

Priya osservava le metriche di CloudFront dopo il deployment.

Tasso di hit nella cache: 83%.

"Cosa significa?" chiese Tom.

"Significa che l'83% dei nostri utenti sta ottenendo contenuti da una posizione di frontiera vicino a loro, non da us-east-1."

"E il 17%?"

"Prime richieste. Contenuti che non sono ancora stati memorizzati nella cache in quella posizione di frontiera."

Tom fissò le metriche. "Quindi stiamo servendo quasi un milione di richieste al giorno da nodi di frontiera CloudFront. E solo 170.000 di queste colpiscono i nostri server."

"Sì."

"Quindi se non avessimo CloudFront, i nostri server dovrebbero gestire un milione di richieste."

"A 140-160 millisecondi ciascuna, per gli utenti globali."

Tom si sedette. Aveva un'espressione che Maya riconosceva — l'espressione di qualcuno che ricalcola i costi in tempo reale.

"Vale la pena," disse.

Maya era già al suo laptop. "Due nuovi ingegneri si uniscono a noi la prossima settimana: Soo-Jin dal team della piattaforma nella sua ultima azienda, e Rafael — si è specializzato in sicurezza. Voglio che siano stati inseriti in IAM prima del loro primo giorno."

"IAM avanzato?" chiese Leo.

"Ruoli, policy, accesso cross-account. La vera roba."

Nel prossimo capitolo: le autorizzazioni granulari che consentono a una parte del sistema di parlare con un'altra — in modo sicuro.
