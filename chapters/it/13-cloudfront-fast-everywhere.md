# Capitolo 13: Velocità Ovunque

Una foto che viaggia da un server in Oregon a uno smartphone a Boston attraversa circa 4.100 chilometri di fibra ottica. A due terzi della velocità della luce, sono circa 25 millisecondi di pura fisica — inevitabili, non negoziabili, inscritti nelle leggi dell'universo.

Poi aggiungi il viaggio di ritorno. Poi aggiungi il tempo di elaborazione. Il browser non ha ancora iniziato a renderizzare e 80 millisecondi sono già passati.

---

*`eatnimbus.com` era online e il nome di dominio era reale. Gli utenti potevano trovare l'app. Ma trovarla non era lo stesso che godersela. Tom aveva eseguito misurazioni di latenza da diverse città, e i numeri dalla East Coast e dal Sud America non erano buoni. Il problema del nome di dominio era risolto. Il problema della fisica no.*

---

`eatnimbus.com` era online. Leo aveva controllato le metriche di latenza degli utenti della East Coast: 80-100 millisecondi per richiesta. Può sembrare poco, ma si accumula.

Caricare il menu: 90ms. Caricare l'elenco dei ristoranti: 80ms. Caricare le foto del ristorante: 200ms (le immagini sono grandi). Tempo totale prima che un utente potesse effettuare un ordine: oltre mezzo secondo con una buona connessione.

"Il problema è la fisica," disse Leo. "I server sono in Oregon. La crescita è sulla East Coast — e a San Paolo."

"Allora sposta i server sulla East Coast," disse Tom.

"Costa soldi."

"Quanto costa al mese?" chiese Tom.

"Far girare un duplicato completo della nostra infrastruttura in us-east-1? Probabilmente il triplo dei nostri costi attuali. E crea un problema completamente nuovo: mantenere sincronizzati il database della West Coast e quello della East Coast."

Priya alzò lo sguardo dal suo laptop. "Oppure non spostiamo i server. Spostiamo il *contenuto*."

Maya alzò lo sguardo. "Qual è la differenza? Se il contenuto è su un server, e il server è in Oregon, il contenuto è in Oregon."

"La maggior parte di quello che una pagina consegna è statico," disse Priya. "Immagini, fogli di stile, file JavaScript, font. Sono gli stessi per ogni utente. Non vengono dal database. Vivono in S3. E gli oggetti S3 possono essere serviti da qualsiasi luogo."

"Quindi li copiamo su server più vicini agli utenti?"

"Lasciamo che un servizio lo gestisca per noi. Una sola fonte di verità. Copie ovunque servano."

Tom aveva già aperto la pagina dei prezzi. Stava facendo i calcoli prima ancora che Priya finisse di spiegare.

**L'Analogia del Magazzino Pre-Rifornito**

Immagina Amazon il rivenditore, non l'azienda cloud. Hanno un enorme magazzino in un'unica posizione con ogni prodotto. Se spedissero ogni ordine da quell'unico magazzino, i clienti nelle città lontane aspetterebbero giorni.

Invece, Amazon ha centri di distribuzione vicino ai principali centri abitati. Quando un prodotto è popolare, pre-riforniscono quei magazzini locali. Quando un cliente a Seattle ordina un libro, viene spedito dal centro di distribuzione locale — non dall'altra parte del paese.

Questo è un **Content Delivery Network (CDN)**: una rete di server distribuiti geograficamente che memorizzano in cache copie dei tuoi contenuti vicino ai tuoi utenti.

Quando un utente a Boston richiede la tua homepage, la CDN la serve da un server a Boston. Non dall'Oregon. La richiesta non attraversa mai il paese.

**Ecco a Voi CloudFront**

Amazon CloudFront è la CDN di AWS. Opera attraverso una rete globale di **edge location** — server di caching posizionati in città di tutto il mondo. Al momento della stesura di questo libro, ci sono più di 700 punti di presenza in oltre 100 città.

Quando configuri CloudFront, specifichi un'**origine**: la fonte del tuo contenuto effettivo. La tua origine potrebbe essere:

- Un bucket S3 (file statici: immagini, CSS, JavaScript, PDF)
- Un Application Load Balancer (contenuto dinamico dalla tua applicazione)
- Un'istanza EC2
- Un server HTTP ovunque su Internet

CloudFront si trova davanti alla tua origine. Le richieste arrivano alla edge location più vicina. Se la edge ha il contenuto in cache, lo restituisce immediatamente. Se no (un *cache miss*), lo recupera dalla tua origine, lo mette in cache e lo restituisce.

**Come Funziona il Caching di CloudFront**

La prima richiesta per qualsiasi contenuto è sempre un cache miss — va all'origine. Ogni richiesta successiva colpisce la cache nella edge location.

Per Nimbus, le foto dei menu sono candidate perfette per CloudFront. Le foto dei ristoranti cambiano raramente (magari quando il ristorante aggiorna il proprio profilo). Con CloudFront:

1. Un utente a Boston richiede `images.eatnimbus.com/restaurant-047/photo.jpg`
2. CloudFront controlla la edge location di Boston — non ancora in cache (cache miss)
3. CloudFront recupera da S3 in us-west-2 (~80ms)
4. CloudFront memorizza la foto nella edge location di Boston
5. L'utente successivo a Boston richiede la stessa foto
6. CloudFront la serve dalla cache della edge locale (~5ms)

Stessa penalità di 80ms per la prima richiesta. Ma la millesima richiesta dalla stessa città è di 5 millisecondi.

Gli **header Cache-Control** e le **impostazioni TTL** in CloudFront determinano per quanto tempo il contenuto resta in cache nella edge. I file immagine possono restare in cache per ore o giorni. Le pagine HTML (che cambiano più spesso) potrebbero restare in cache per minuti o secondi.

Potresti chiederti: perché non ospitare semplicemente l'intera applicazione in più regioni invece di usare una CDN? Se i dati sono in Oregon, perché non mettere una copia completa a New York, Tokyo e San Paolo? Potresti. Ma significherebbe mantenere sincronizzati più database, gestire deployment in più regioni simultaneamente, affrontare scenari di split-brain in cui le regioni sono in disaccordo. Una CDN è una risposta molto più semplice per i contenuti statici e semi-statici: una sola origine, molte copie in cache alla edge. Aggiungi la complessità multi-regione solo quando hai davvero bisogno di calcolo o operazioni di database vicino all'utente — per la maggior parte dei contenuti, il caching alla edge è sufficiente.

"Aspetta — ma *perché* dovremmo farlo in questo modo?" chiese Maya. "Perché mettere la cache alla edge invece di aggiungere semplicemente un cluster ElastiCache più grande in Oregon?"

"Perché il problema resta la fisica," disse Priya. "Anche se l'Oregon risponde in un millisecondo, quella risposta deve comunque viaggiare fino a Boston. Il tempo di andata e ritorno è di 70 millisecondi minimo — alla velocità della luce non importa quanto siano veloci i nostri server. Il caching alla edge sposta la risposta più vicino alla domanda."

**Contenuto Dinamico: CloudFront Oltre il Caching**

"Ma le nostre risposte API?" chiese Leo. "Quelle sono dinamiche — cambiano per utente, per richiesta. Non puoi mettere in cache una pagina di cronologia ordini."

Vero. Ma CloudFront aiuta comunque con il contenuto dinamico.

Anche quando il contenuto non può essere messo in cache, CloudFront instrada la richiesta dalla edge location all'origine attraverso la rete backbone privata di AWS — la fibra ad alta velocità che collega l'infrastruttura AWS a livello globale. Questo è più veloce e affidabile dell'instradamento sull'internet pubblico, dove il traffico può rimbalzare attraverso più operatori.

Il risultato: le richieste dinamiche sono comunque il 20-40% più veloci attraverso CloudFront rispetto all'andare direttamente all'origine sull'internet pubblico. Non grazie al caching, ma grazie al percorso di rete.

"I conti non tornano," disse Maya. "Se la risposta dell'API deve comunque viaggiare dall'Oregon alla edge e poi a Boston, com'è possibile che sia più veloce dell'andare direttamente dall'Oregon a Boston?"

"Due ragioni," disse Priya. "Primo, il backbone privato di AWS è più veloce e affidabile dell'internet pubblico. Il traffico dell'internet pubblico passa attraverso più operatori, ognuno dei quali aggiunge la propria latenza e variabilità. Il backbone è fibra diretta, a bassa latenza. Secondo, la terminazione SSL avviene alla edge. L'utente stabilisce una connessione TLS con la edge location CloudFront più vicina — l'handshake è veloce. CloudFront mantiene poi una connessione persistente, pre-stabilita, con l'origine. Due connessioni a breve distanza invece di una a lunga distanza."

"Quindi anche per i contenuti non in cache, CloudFront riduce l'overhead di connessione," disse Leo.

"Di solito dal dieci al quaranta percento. Non drammatico come il caching. Ma reale."

Inoltre, CloudFront fornisce:

**Terminazione SSL/TLS**: CloudFront gestisce l'HTTPS alla edge. La connessione tra l'utente e CloudFront è crittografata. CloudFront può connettersi alla tua origine via HTTP internamente (riducendo il carico sull'origine) o via HTTPS (per la crittografia end-to-end).

**Protezione DDoS**: CloudFront è integrato con AWS Shield Standard. La distribuzione del traffico su centinaia di edge location significa che gli attacchi vengono assorbiti alla edge invece di martellare la tua origine.

**Geo-restriction**: Blocca l'accesso da paesi specifici. Se Nimbus ha la licenza per operare solo in determinati mercati, CloudFront può farla rispettare alla edge senza che la richiesta raggiunga mai i tuoi server.

"E se qualcuno provasse a entrare attraverso la CDN?" chiese Priya. "Cache poisoning — cosa succede se qualcuno riesce a iniettare contenuti malevoli nella cache della edge?"

"CloudFront ha i controlli sulla cache key," disse Leo. "Definisci esattamente quali attributi determinano se due richieste ottengono la stessa risposta in cache. Header, query string, cookie. Un attaccante non può iniettare una risposta in cache diversa senza corrispondere esattamente alla cache key."

"E l'Origin Access Control fa sì che il bucket S3 non serva nulla che non passi da CloudFront," disse Priya. "Una superficie d'attacco invece di due."

**Behavior di CloudFront: Regole di Caching a Grana Fine**

Una distribuzione CloudFront può avere più **behavior** — regole di routing basate su pattern di URL.

Per Nimbus:

- `/images/*` → Cache alla edge per 7 giorni (le foto non cambiano spesso)
- `/static/*` → Cache alla edge per 30 giorni (CSS e JavaScript con nomi di file versionati)
- `/api/*` → Niente cache; inoltro diretto al load balancer
- `/*` → Cache per 5 minuti (pagine HTML)

Questo permette a CloudFront di essere intelligente: mettere in cache aggressivamente ciò che è stabile, far passare ciò che è dinamico.

I behavior vengono confrontati dal più specifico al meno specifico. `/images/hero.jpg` corrisponde a `/images/*` prima di corrispondere a `/*`. Il catch-all `/*` in fondo è il default — si applica a tutto ciò che non corrisponde a un pattern più specifico.

"E se volessimo un caching diverso per gli utenti autenticati rispetto a quelli non autenticati?" chiese Priya. "Lo stesso URL potrebbe restituire contenuti diversi a seconda che un utente sia loggato o no."

"Allora includi il cookie di sessione nella cache key," disse Leo. "Ma significa che ogni utente loggato ottiene la propria voce in cache. Il tuo hit rate crolla per i contenuti autenticati."

"Ed è per questo che si separano i contenuti autenticati da quelli pubblici a livello di URL," disse Priya. "Tutto ciò che richiede autenticazione va in `/app/*` e non viene messo in cache. I contenuti pubblici vanno in `/browse/*` e vengono messi in cache aggressivamente. Un confine chiaro."

La lezione: CloudFront funziona al meglio quando la struttura dei tuoi URL riflette le intenzioni di caching. Gli URL che puntano a dati completamente pubblici e statici dovrebbero avere un aspetto diverso dagli URL che restituiscono dati personalizzati e dinamici. Se per CloudFront sembrano uguali, o la cache è rotta o viene servito il contenuto sbagliato.

Leo ristrutturò lo schema degli URL di Nimbus in un weekend. Gli endpoint di navigazione si spostarono su `/browse/`. Gli endpoint API si spostarono su `/api/`. La UI dell'app autenticata si spostò su `/app/`. Tre behavior, tre policy di caching chiare, zero ambiguità.

"È un bel po' di refactoring," disse.

"È la struttura giusta," disse Priya. "Ti sarebbe servita comunque, prima o poi."

**Origin Access Control: Proteggere S3 con CloudFront**

Se il tuo bucket S3 contiene contenuti privati che dovrebbero essere serviti solo attraverso CloudFront (non direttamente), puoi usare l'**Origin Access Control (OAC)** per assicurarti che S3 rifiuti le richieste che non provengono da CloudFront.

In questo modo:

- `d1234abcd.cloudfront.net/image.jpg` → Servito (CloudFront ha il permesso)
- `nimbus-assets.s3.amazonaws.com/image.jpg` → Bloccato (accesso diretto a S3 negato)

Il tuo contenuto è raggiungibile solo attraverso la tua distribuzione, con le tue regole di cache e le tue impostazioni di sicurezza applicate.

---

**L'Incidente della Foto Obsoleta**

Il ristorante 112 — il locale colombiano dell'Eastside — scrisse al supporto un giovedì mattina. Un cliente si era lamentato che la foto principale del ristorante mostrava ancora la vecchia vetrina, anche se il proprietario ne aveva caricata una nuova due giorni prima.

Leo aprì le impostazioni della distribuzione CloudFront.

Il behavior per `/images/*` aveva un TTL di sette giorni. Il portale dei partner ristoratori aveva caricato una nuova foto due giorni prima, sostituendo il file allo stesso percorso di chiave S3: `restaurant-112/hero.jpg`. Il vecchio file era sparito da S3. Ma CloudFront lo stava ancora servendo dalla cache in ogni edge location che lo aveva recuperato negli ultimi sette giorni.

"Abbiamo cambiato il contenuto all'origine," disse Leo. "Ma CloudFront non lo sa. Ha una copia in cache e non andrà a controllare per sette giorni."

"L'ho già deployato — oh." Aveva dato per scontato che sostituire il file S3 avrebbe aggiornato automaticamente la cache di CloudFront. Non è così. CloudFront non ha alcun meccanismo per rilevare che il contenuto a una chiave S3 è cambiato — serve semplicemente quello che ha messo in cache finché il TTL non scade.

Due opzioni:

**Opzione uno: Invalidazione.** Invii a CloudFront una richiesta di invalidazione per `/images/restaurant-112/hero.jpg`. CloudFront contrassegna quel percorso come obsoleto in tutte le edge location. La richiesta successiva per quel percorso recupera contenuto fresco da S3. Costo: i primi 1.000 percorsi di invalidazione al mese sono gratuiti; oltre, $0.005 *per percorso*. Per un singolo file, gratis. Per invalidare migliaia di file durante un aggiornamento di massa, i costi si accumulano.

**Opzione due: Nomi di file versionati.** Invece di `hero.jpg`, chiama il file `hero-v2.jpg`. Aggiorna il riferimento nel database. CloudFront non ha alcuna voce in cache per `hero-v2.jpg` — la prima richiesta lo recupera da S3, e gli utenti lo vedono immediatamente. Il vecchio `hero.jpg` resta in cache ma non è più referenziato da nessuna parte. Scade naturalmente dopo sette giorni.

"Per i contenuti caricati dagli utenti," disse Priya, "i nomi versionati sono il pattern giusto. Aggiungi un hash o un timestamp al nome del file. Ogni nuovo upload è una nuova voce in cache. Nessun costo di invalidazione, nessun contenuto obsoleto."

Leo aggiornò il portale dei partner. I nuovi upload sarebbero stati salvati come `hero-{timestamp}.jpg`. Il record nel database veniva aggiornato con il nuovo percorso. Il vecchio percorso in cache era irrilevante.

"E il caso dei deployment?" chiese Maya. "Quando pubblichiamo una nuova versione dell'app e il JavaScript cambia?"

"Stesso principio," disse Priya. "Gli strumenti di build come Webpack producono nomi di file con hash: `app.a3b9c2d4.js`. Fai il deploy di una nuova versione e l'hash cambia: `app.f7e1b3c5.js`. CloudFront serve entrambi dalla cache — i vecchi utenti ricevono il vecchio file, i nuovi utenti il nuovo. Nessuna invalidazione, nessun problema di coordinamento."

"La pagina HTML referenzia l'hash corrente," disse Leo. "Quindi i nuovi utenti ricevono il nuovo HTML con il nuovo hash JS, e la CDN serve il file giusto."

"Prassi standard," confermò Priya.

---

**La Latenza con Numeri Reali**

Tom aveva eseguito misurazioni di latenza da tre città.

| Località | Senza CloudFront | Con CloudFront | Miglioramento |
|---|---|---|---|
| Seattle | 15ms | 12ms | 20% |
| New York | 80ms | 10ms | 88% |
| San Paolo | 290ms | 35ms | 88% |
| Tokyo | 260ms | 28ms | 89% |

"Il miglioramento è maggiore dove il problema della fisica è peggiore," osservò Tom. "Da San Paolo all'Oregon sono più di duecento millisecondi. È più di un quarto di secondo, solo per iniziare la conversazione."

"E il contenuto non raggiunge mai San Paolo la seconda volta," disse Leo. "Il primo utente a San Paolo lo recupera dall'Oregon e lo mette in cache localmente. Ogni utente successivo ottiene trentacinque millisecondi."

"Il primo utente a San Paolo si accolla il costo," disse Tom. "Tutti gli altri ne beneficiano."

"È così che funzionano le CDN," disse Priya. "La prima richiesta popola la cache. Ogni cache hit successivo è quasi gratis."

L'implicazione per i prodotti globali è significativa. Senza CloudFront, un utente a Tokyo che aspetta 260 millisecondi per la tua immagine principale sta aspettando a causa della fisica — cavi in fibra ottica e velocità della luce. Con CloudFront, metti una copia di quell'immagine a Tokyo, e il problema della fisica essenzialmente scompare.

---

**Origini Multiple: ALB e S3 Insieme**

"Abbiamo le immagini su S3 e l'API sul load balancer," disse Maya. "Ci servono due distribuzioni CloudFront?"

"No," disse Leo. "Una distribuzione, più origini."

Una singola distribuzione CloudFront può instradare pattern di URL diversi verso origini diverse. Questo è il pattern multi-origine:

```
eatnimbus.com/*         → Origine: ALB in us-west-2 (contenuto dinamico)
eatnimbus.com/images/*  → Origine: bucket S3 (immagini statiche)
eatnimbus.com/static/*  → Origine: bucket S3 (CSS, JS, font)
```

CloudFront valuta i behavior in ordine di specificità. Una richiesta a `/images/hero.jpg` corrisponde al behavior `/images/*` e va a S3. Una richiesta a `/api/orders` corrisponde al catch-all `/*` e va all'ALB.

Il vantaggio: un dominio, un certificato SSL, una distribuzione CloudFront, più backend. Gli utenti vedono un dominio unificato. Il routing per loro è invisibile.

Un dettaglio operativo che è anche un fatto garantito all'esame: quel certificato SSL viene da AWS Certificate Manager (ACM), e **un certificato usato da CloudFront deve essere richiesto o importato in `us-east-1`** — indipendentemente da dove vivono le tue origini. CloudFront è un servizio globale il cui piano di controllo vive in us-east-1; un certificato che si trova in us-west-2 semplicemente non comparirà nel menu a tendina della distribuzione. (Per i servizi regionali come un ALB, il certificato vive nella regione dell'ALB stesso.)

"E l'ALB non è esposto al pubblico?" chiese Priya.

"Solo CloudFront parla con l'ALB," disse Leo. "Restringiamo il security group dell'ALB alla prefix list gestita di CloudFront. Le connessioni dirette all'ALB da internet sono bloccate."

"Quindi l'unico modo per raggiungere l'applicazione è attraverso CloudFront."

"Il che significa che le regole WAF, la terminazione SSL e la protezione DDoS si applicano a tutto il traffico prima che ci raggiunga."

---

**CloudFront Functions vs Lambda@Edge**

"Abbiamo pensato a cosa faremmo se dovessimo riscrivere un URL alla edge?" chiese Priya. "O aggiungere un header di sicurezza a ogni risposta?"

"Non possiamo farlo nell'applicazione?" chiese Leo.

"Possiamo. Ma se avviene alla edge — prima che CloudFront serva dalla cache — risparmiamo un viaggio di andata e ritorno verso l'origine."

CloudFront supporta due meccanismi per eseguire codice alla edge:

Le **CloudFront Functions** sono funzioni JavaScript leggere che girano in ogni edge location. Vengono eseguite in tempi inferiori al millisecondo, gestiscono milioni di richieste al secondo e sono progettate per trasformazioni semplici: riscritture di URL, manipolazione di header, normalizzazione di query string, redirect semplici. Possono girare sulle viewer request e sulle viewer response (prima e dopo la cache, dal punto di vista dell'utente). Non possono fare chiamate di rete. Costo: $0.10 per milione di invocazioni.

**Lambda@Edge** esegue vere e proprie funzioni Lambda nelle regional edge location di CloudFront (non in ogni punto di presenza, ma in decine di sedi principali a livello globale). Lambda@Edge può fare chiamate di rete, accedere a database, generare risposte dinamiche, eseguire logica di autenticazione complessa. Gira sulle viewer request, origin request, origin response e viewer response — dandoti quattro punti di intervento nel ciclo di vita della richiesta. Costo: più alto delle CloudFront Functions, fatturato per richiesta e durata.

Il modello mentale:

| Caso d'uso | Strumento |
|---|---|
| Riscrivere `/old-path` in `/new-path` | CloudFront Functions |
| Aggiungere l'header `Strict-Transport-Security` | CloudFront Functions |
| Normalizzare le query string prima della ricerca in cache | CloudFront Functions |
| A/B test: assegnare un cookie di test sulla viewer request | CloudFront Functions |
| A/B test: instradare il 10% degli utenti verso un'origine diversa | Lambda@Edge (origin request — le CloudFront Functions non possono cambiare l'origine) |
| Autenticare un token JWT (richiede una libreria crittografica) | Lambda@Edge |
| Recuperare contenuti personalizzati da un database alla edge | Lambda@Edge |
| Generare una miniatura di un'immagine on-demand alla edge | Lambda@Edge |

Per Nimbus: usarono una CloudFront Function per aggiungere header di sicurezza a ogni risposta — `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`. Una ventina di righe di JavaScript. Esecuzione sotto il millisecondo. Nessun viaggio verso l'origine necessario.

"Ci vorrebbe più tempo a spiegare gli header a un ingegnere junior," disse Leo, "che a scrivere la funzione."

---

**Price Class: Scegliere Quali Edge Location**

"Abbiamo pensato a quanto costa questa cosa su larga scala?" chiese Tom, scorrendo la pagina dei prezzi di CloudFront.

"Quanto costa al mese?" qui erano tecnicamente due domande. La prima: quanto fa pagare CloudFront? La seconda: ti serve davvero ogni edge location del mondo?

Il prezzo del trasferimento dati di CloudFront varia per regione. Il traffico servito dalle edge location in Nord America ed Europa è il più economico. Il traffico da Sud America, Asia Pacifico, Australia e India è più costoso — perché lì l'infrastruttura costa di più.

AWS ti permette di scegliere una **price class** per la tua distribuzione:

- **Price Class All**: Usa tutte le edge location a livello globale. Migliori prestazioni ovunque. Costo di trasferimento dati più alto per le regioni fuori da Nord America ed Europa.
- **Price Class 200**: Usa la maggior parte delle edge location (Nord America, Europa, Asia, Medio Oriente, Africa). Esclude le sedi sudamericane più costose e alcune dell'Oceania.
- **Price Class 100**: Usa solo le edge location di Nord America ed Europa. La più economica. Gli utenti a San Paolo, Tokyo e Sydney vengono comunque serviti — ma da una edge nordamericana o europea, non dalla più vicina a loro.

"Quindi se scegliamo la Price Class 100," disse Tom, "un utente a San Paolo viene servito da... Miami? New York?"

"Da qualunque sia la edge inclusa più vicina. Forse 50 millisecondi invece dei 230 millisecondi diretti verso l'Oregon," disse Priya. "Comunque un miglioramento significativo. Non buono quanto la Price Class All."

"E la differenza di costo?"

"Il trasferimento dati in uscita dal Sud America costa circa il doppio del Nord America. Per una startup che sta ancora costruendo il proprio traffico, la Price Class 200 è un compromesso ragionevole — ottieni Asia ed Europa a un costo inferiore alla Price Class All, e la maggior parte dei tuoi utenti è coperta."

"Iniziamo con la 200," disse Tom. "Quando avremo dati di traffico reali da ogni regione, decideremo se la All vale la pena."

La price class giusta dipende da dove sono i tuoi utenti. Se non hai utenti in Sud America, pagare per le edge location sudamericane è puro costo. Se il venti percento del tuo fatturato viene dal Brasile, il miglioramento di prestazioni della Price Class All probabilmente si ripaga da solo.

---

**Progettare la Cache Key**

"Abbiamo pensato a cosa succede quando due utenti diversi richiedono lo stesso URL ma ottengono contenuti diversi?" chiese Priya.

Leo ci pensò. "Pagine personalizzate."

"O pagine specifiche per lingua. O versioni mobile contro desktop. O pagine che variano in base ai cookie."

Di default, CloudFront usa solo il percorso dell'URL come cache key. Due richieste a `/browse` ottengono la stessa risposta in cache, indipendentemente dalla preferenza di lingua dell'utente, dal tipo di dispositivo o dal cookie di sessione.

Se la tua applicazione serve contenuti diversi in base a query string, header o cookie — e vuoi che CloudFront metta in cache quelle variazioni separatamente — devi includere quegli attributi nella **cache key**.

Per Nimbus:

- `/browse?city=miami` dovrebbe andare in cache separatamente da `/browse?city=boston` — elenchi di ristoranti diversi. Includi le query string nella cache key.
- Gli utenti mobile potrebbero ricevere un layout diverso. Includi un tipo di dispositivo normalizzato (derivato dall'header `User-Agent`) nella cache key.
- L'header `Accept-Language` determina in quale lingua viene renderizzata la pagina. Includilo nella cache key.

Attenzione, però. Ogni attributo che aggiungi alla cache key crea più variazioni in cache. Se includi l'intera stringa `User-Agent` (che varia per versione del browser, versione del sistema operativo e livello di patch), di fatto rompi il caching — ogni utente ha uno User-Agent leggermente diverso, quindi ogni richiesta è un cache miss.

La disciplina: normalizzare prima di mettere in cache. Riduci "iPhone 15 Pro Safari 17.4.1" a "mobile". Riduci tutte le lingue accettate alle due o tre che supporti davvero. Includi solo ciò che cambia genuinamente la risposta.

"Più la tua cache key è specifica," disse Leo, "peggiore è il tuo hit rate."

"E più è generica," disse Priya, "più è probabile che tu serva il contenuto sbagliato all'utente sbagliato."

"Quindi progettare la cache key è lo stesso compromesso di tutto il resto nel caching."

"Sì," disse Priya. "È sempre lo stesso compromesso."

---

## Quando CloudFront Non È la Risposta: Global Accelerator

L'app mobile di Nimbus aveva una funzionalità che Tom osservava in silenzio da due mesi: lo stato dell'ordine in tempo reale. Quando un cliente effettuava un ordine, l'app restava connessa via WebSocket e lo schermo di gestione ordini della cucina si aggiornava in tempo reale. Nessun pulsante di aggiornamento. Nessun polling. Una connessione viva che inviava aggiornamenti nell'istante in cui la cucina segnava un piatto come pronto.

"Questa usa i WebSocket," disse Tom, guardando le metriche di latenza una mattina. "Dagli utenti a San Paolo, lo stabilire la connessione richiede 340 millisecondi. Qualcosa non va."

"CloudFront non mette in cache le connessioni WebSocket," disse Leo. "Le fa da proxy — le passa all'origine. Nessun beneficio di caching."

"Giusto. E allora perché è comunque lenta?"

"Perché il WebSocket viaggia comunque da San Paolo ai nostri server in Oregon sull'internet pubblico," disse Leo. "CloudFront aiuta, perché termina l'handshake TLS alla edge e poi usa il backbone di AWS verso l'origine. Ma per una connessione WebSocket persistente, resta una connessione a lunga distanza."

"C'è un servizio esattamente per questo problema," disse Priya.

**AWS Global Accelerator** non è una CDN. Non mette in cache nulla. Non serve contenuti dalle edge location. Quello che fa è darti due indirizzi IP statici Anycast annunciati globalmente da tutte le edge location AWS simultaneamente — e poi instradare il traffico dei tuoi utenti sul backbone privato di AWS invece che sull'internet pubblico.

Quando un cliente a San Paolo apre l'app Nimbus, il suo dispositivo si connette alla edge location AWS più vicina (che potrebbe essere a San Paolo stessa). Da quella edge location, il traffico viaggia verso i server di Nimbus in Oregon sulla rete in fibra privata, monitorata e ottimizzata di AWS — non sull'internet pubblico dove i pacchetti rimbalzano attraverso operatori e salti di routing imprevedibili.

L'internet pubblico non è progettato per la latenza. È progettato per la resilienza — i pacchetti possono prendere qualsiasi percorso disponibile. Il backbone di AWS è progettato diversamente: è diretto, a bassa congestione e sotto il controllo operativo di AWS.

Tom misurò la differenza.

| Percorso | Latenza (San Paolo verso Oregon) |
|---|---|
| Internet pubblico | 340ms |
| Via Global Accelerator | 180ms |

Una riduzione del 47%. Non dal caching — da un percorso di rete migliore.

"Allora perché non usiamo semplicemente CloudFront per tutto?" chiese Maya. "CloudFront instrada già attraverso il backbone di AWS per i contenuti dinamici."

"CloudFront è solo HTTP e HTTPS," disse Priya. "I WebSocket funzionano con CloudFront, ma solo tramite upgrade HTTP. E alcuni dei nostri protocolli — i dati dei sensori IoT, per esempio — sono puro TCP o UDP. CloudFront non li gestisce. Global Accelerator è agnostico rispetto al protocollo. TCP, UDP, WebSocket, quello che vuoi. Sposta pacchetti, non richieste HTTP."

C'era un'altra differenza che Priya annotò nella sua documentazione di sicurezza.

"Global Accelerator ci dà due IP statici Anycast," disse. "Quegli IP non cambiano mai. Significa che possiamo aggiungerli alla nostra policy di sicurezza, aggiungerli alle whitelist dei partner, aggiungerli alle regole dei firewall. Gli indirizzi IP di CloudFront cambiano nel tempo — sono gestiti da AWS e non sono fissi."

"E il failover?" chiese Leo.

"Istantaneo," disse Priya. "Se la nostra applicazione in us-west-2 ha un problema, Global Accelerator può spostare il traffico su un backup in us-east-1 in meno di 30 secondi — senza cambiare l'indirizzo IP a cui gli utenti si stanno connettendo. Il failover DNS tramite Route 53 richiede 60-300 secondi a seconda del TTL. Global Accelerator è più veloce."

**CloudFront vs. Global Accelerator — il modello mentale:**

CloudFront migliora la consegna tramite il caching. È costruito per HTTP/HTTPS e il beneficio è massimo quando il contenuto può essere messo in cache vicino agli utenti — file statici, immagini, JavaScript. Quando il contenuto non può essere messo in cache, CloudFront aiuta comunque tramite il routing sul backbone, ma il miglioramento è minore.

Global Accelerator migliora la consegna tramite il routing. Non sposta contenuti. Non mette in cache nulla. Il beneficio si applica a ogni pacchetto — in cache o no, HTTP o no, statico o dinamico. I due IP statici funzionano a livello globale. Il failover è quasi istantaneo. I casi d'uso in cui CloudFront non basta — WebSocket in tempo reale, protocolli basati su UDP, traffico non HTTP, applicazioni globali che richiedono IP fissi — sono quelli in cui Global Accelerator è lo strumento giusto.

Tom aggiornò l'app mobile di Nimbus perché si connettesse all'endpoint di Global Accelerator per la funzionalità di stato ordine in tempo reale. Lo stabilire la connessione WebSocket a San Paolo scese da 340ms a 180ms. Gli aggiornamenti della cucina sembravano ancora istantanei — perché ora, per gli utenti fuori dal Nord America, lo erano davvero.

## Punti di Forza e Limitazioni

**Perché CloudFront è potente**:

- Più di 700 punti di presenza in oltre 100 città — la maggior parte degli utenti riceve i contenuti da meno di 20ms di distanza
- Contenuti statici serviti in millisecondi a una cifra dopo la prima messa in cache
- Riduce significativamente il carico sull'origine (il traffico ripetuto non raggiunge mai i tuoi server)
- Integrato con AWS Shield, WAF e Certificate Manager
- Nessuna pianificazione della capacità necessaria — CloudFront scala automaticamente
- Le distribuzioni multi-origine instradano percorsi diversi verso backend diversi da un unico dominio
- Le CloudFront Functions gestiscono logica leggera alla edge con latenza inferiore al millisecondo

**Dove si complica**:

- Il contenuto in cache può essere obsoleto — invalidare la cache costa denaro ($0.005 per percorso dopo i primi 1.000 percorsi gratuiti al mese). Usa invece nomi di file versionati.
- Gli header Cache-Control devono essere impostati correttamente all'origine — gli errori causano contenuti obsoleti
- Il contenuto dinamico beneficia dell'ottimizzazione del routing ma non del caching
- Il debug del comportamento della cache (cosa è in cache, dove, per quanto tempo) richiede la comprensione di più livelli: header dell'origine, impostazioni TTL di CloudFront, regole dei behavior
- Il trasferimento dati in uscita attraverso CloudFront costa denaro, anche se meno del trasferimento dati standard
- La progettazione della cache key richiede attenzione — troppo specifica rompe il caching, troppo generica serve contenuti sbagliati

## Riepilogo

CloudFront non ha cambiato la fisica. La luce viaggia ancora alla stessa velocità. Ma ha cambiato dove viveva la risposta — e per la maggior parte degli utenti, la risposta ora era a pochi millisecondi invece che a qualche centinaio. Hit rate della cache dopo il deployment: 83%. Significava che 830.000 richieste su ogni milione non raggiungevano mai i server di origine. Gli utenti a San Paolo passarono da 290 millisecondi a 35. Gli utenti a Tokyo da 260 a 28.

- Una **CDN** mette in cache copie dei tuoi contenuti in edge location vicine ai tuoi utenti — riducendo la latenza e il carico sull'origine. **CloudFront** è la CDN di AWS, con più di 700 punti di presenza a livello globale.
- I cache miss recuperano dall'**origine** (S3, ALB, EC2). I cache hit servono dalla edge — millisecondi, non centinaia di millisecondi.
- I **behavior** ti permettono di impostare regole di caching diverse per pattern di URL diversi. Una distribuzione può servire `/images/*` da S3 e `/*` da un ALB.
- Il contenuto dinamico non viene messo in cache, ma CloudFront migliora comunque le prestazioni attraverso la rete backbone privata di AWS.
- **Evita i contenuti obsoleti** usando nomi di file versionati (ad esempio `hero-v2.jpg`) invece delle invalidazioni — più economico e affidabile.
- Le **CloudFront Functions** gestiscono logica leggera alla edge (manipolazione di header, riscritture di URL) a velocità inferiore al millisecondo. **Lambda@Edge** gestisce elaborazioni più pesanti che richiedono chiamate di rete.
- Le **price class** ti permettono di controllare quali edge location servono il tuo traffico — e quindi il tuo costo di trasferimento dati.
- La **progettazione della cache key** determina quali attributi della richiesta creano variazioni in cache separate. Chiavi più specifiche = hit rate più basso. Meno specifiche = rischio di servire contenuti sbagliati.

## Suggerimenti per l'Esame

*SAA-C03 Dominio: Progettare Architetture ad Alte Prestazioni (Dominio 3, Task 3.4)*

- **CloudFront + S3**: Pattern d'esame classico per servire siti web statici a livello globale. Bucket S3 come origine, CloudFront come CDN, Origin Access Control per impedire l'accesso diretto a S3.
- **Edge location vs Regioni vs AZ**: Le edge location sono più numerose ed esistono solo per scopi di caching/CDN. Non sono la stessa cosa delle AZ (che eseguono il tuo calcolo).
- **Invalidazione della cache**: Crea un'invalidazione `/images/*` per forzare CloudFront a recuperare contenuti freschi. Costa denaro — l'esame può chiedere l'alternativa economica: URL versionati (`image-v2.jpg` invece di `image.jpg`), che bypassano naturalmente la cache.
- **Controllo del TTL**: `Cache-Control: max-age=3600` all'origine imposta un TTL di cache di 1 ora. CloudFront rispetta questi header. TTL minimo, TTL massimo e TTL di default possono anche essere impostati nel behavior della distribuzione.
- **CloudFront Functions vs Lambda@Edge**: Le CloudFront Functions girano alla edge per manipolazioni leggere di richiesta/risposta (sotto il millisecondo). Lambda@Edge esegue il tuo codice Lambda nelle regional edge location per elaborazioni più pesanti. L'esame le distingue per complessità del caso d'uso. Le CloudFront Functions non possono fare chiamate di rete; Lambda@Edge sì.
- **Signed URL e Signed Cookie**: Controllano chi può accedere ai contenuti attraverso CloudFront. I signed URL danno accesso a file specifici; i signed cookie danno accesso a più file. L'esame li usa per i "contenuti per abbonati paganti".
- **Price Class**: L'esame può chiedere quale price class scegliere per un pubblico globale rispetto a un pubblico Nord America/Europa. Price Class All = migliori prestazioni, costo più alto. Price Class 100 = solo Nord America ed Europa, costo più basso.
- **Cache key**: La cache key di default è l'URL. Aggiungere query string, header o cookie alla cache key crea variazioni in cache separate — ma aumenta il tasso di cache miss. L'esame può presentare uno scenario in cui il contenuto varia in base a un parametro di query e chiedere come configurare il caching.
- **Origin failover**: CloudFront supporta un origin group con un'origine primaria e una secondaria. Se l'origine primaria restituisce un errore 5xx, CloudFront riprova automaticamente con la secondaria. Diverso dal failover di Route 53 — questo avviene all'interno di una singola distribuzione CloudFront.
- **Behavior multi-origine**: Una singola distribuzione può instradare `/images/*` verso S3 e `/*` verso un ALB. L'esame può presentarlo come "come servire contenuti statici e dinamici da un unico dominio senza due distribuzioni".
- **CloudFront vs. Global Accelerator:** CloudFront = CDN HTTP/HTTPS, mette in cache i contenuti nelle edge location, riduce il carico sull'origine, ideale per contenuti statici e memorizzabili in cache. Global Accelerator = qualsiasi protocollo TCP/UDP, non mette in cache nulla, instrada il traffico sul backbone privato di AWS, fornisce 2 IP statici Anycast, supporta un failover regionale quasi istantaneo. Trigger d'esame: "migliorare la latenza per traffico non HTTP" o "IP statico per un'applicazione globale" o "prestazioni WebSocket per utenti globali" o "failover regionale più veloce del DNS" → Global Accelerator. "Servire file statici a livello globale con bassa latenza" → CloudFront.

## Esercizi

**Esercizio 1 — Richiamo**

Spiega la differenza tra un cache hit e un cache miss di CloudFront. Cosa succede in ciascun caso?

*(Suggerimento: Pensa ai magazzini locali pre-riforniti di articoli popolari — a volte l'articolo è già sullo scaffale vicino, e a volte deve prima essere spedito dal lontano magazzino principale.)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: Un'azienda software distribuisce file di installazione di grandi dimensioni (~2GB ciascuno) da un bucket S3 a clienti in tutto il mondo. Le velocità di download sono lente per i clienti in Asia. Il team vuole migliorare le prestazioni senza replicare il bucket S3 in più regioni. Devono inoltre assicurarsi che solo i clienti paganti possano scaricare gli installer.

Quale soluzione soddisfa MEGLIO questi requisiti?

A) Abilitare S3 Transfer Acceleration sul bucket e generare URL pre-firmati per i clienti paganti  
B) Usare CloudFront con il bucket S3 come origine, abilitare l'Origin Access Control e usare i Signed URL di CloudFront per i clienti paganti  
C) Creare un bucket S3 in ogni regione AWS e usare il routing geolocation di Route 53 per indirizzare i clienti verso il bucket più vicino  
D) Usare un Application Load Balancer in ogni regione con istanze EC2 che servono i file di installazione

**Suggerimento 1**: Il requisito è migliorare le prestazioni globali *senza* replicare il bucket. Quale opzione non richiede più bucket?

**Suggerimento 2**: Quale servizio controlla specificamente chi può accedere ai contenuti serviti attraverso CloudFront?

**Suggerimento 3**: S3 Transfer Acceleration è ottimizzato per gli upload a lunga distanza *verso* S3. Per consegnare contenuti *da* S3 agli utenti finali a livello globale, CloudFront è lo strumento giusto.

**Risposta**: B

**Spiegazione**: CloudFront mette in cache i file di installazione nelle edge location a livello globale dopo il primo download. I download successivi dalla stessa regione provengono dalla edge — molto più veloci che attraversare il Pacifico da S3 in us-west-2. L'Origin Access Control garantisce che il bucket S3 sia accessibile solo attraverso CloudFront. I Signed URL limitano l'accesso ai clienti paganti.

**Perché non A?** S3 Transfer Acceleration è ottimizzato per gli upload a lunga distanza *verso* S3 — non per distribuire contenuti *da* S3 a un pubblico globale. Per quello, CloudFront è lo strumento corretto. Gli URL pre-firmati controllano l'accesso ma non migliorano le prestazioni globali.

**Perché non C?** Creare un bucket S3 per regione funziona per le prestazioni, ma contraddice il requisito di evitare la replicazione. Richiede inoltre una strategia di sincronizzazione dei dati tra i bucket.

**Perché non D?** Istanze EC2 dietro un load balancer in ogni regione costano significativamente più di CloudFront e richiedono la gestione di server in più regioni.

*SAA-C03 Dominio: Progettare Architetture ad Alte Prestazioni — Task 3.4*

**Esercizio 3 — Sfida di Architettura**

Nimbus vuole aggiungere contenuti video — brevi video tutorial di cucina dai ristoranti partner. I video possono essere da 50 a 500MB. Si aspettano che lo stesso video venga guardato da migliaia di utenti nella stessa città nel giro di poche ore dalla pubblicazione.

Progetta l'architettura di storage e delivery. Useresti S3 e CloudFront? Come gestiresti la prima richiesta (cold start) per minimizzare il ritardo prima che il video venga messo in cache? Quale TTL di cache imposteresti per un video che non cambierà dopo la pubblicazione?

*(Non esiste un'unica risposta corretta. L'obiettivo è esercitarsi nelle decisioni di progettazione di una CDN.)*

## Scena Post-Crediti

"L'ho già deployato — oh." Leo aveva puntato la distribuzione CloudFront all'origine sbagliata — il bucket S3 di sviluppo invece di quello di produzione. Per circa quattro minuti, alcuni utenti della West Coast avevano visto una vecchia versione dell'app. Aveva corretto le impostazioni dell'origine, invalidato la cache e aggiornato in silenzio il registro degli incidenti.

Priya osservava le metriche di CloudFront dopo il deployment.

Hit rate della cache: 83%.

"Cosa significa?" chiese Tom.

"Significa che l'83% dei nostri utenti riceve i contenuti da una edge location vicino a loro, non da us-west-2."

"E l'altro 17%?"

"Prime richieste. Contenuti che non sono ancora stati messi in cache in quella edge location."

Tom fissò le metriche. "Quindi stiamo servendo quasi un milione di richieste al giorno dai nodi edge di CloudFront. E solo 170.000 di queste raggiungono effettivamente i nostri server."

"Sì."

"Quindi se non avessimo CloudFront, i nostri server gestirebbero un milione di richieste."

"A 140-160 millisecondi ciascuna, per gli utenti globali."

Tom si appoggiò allo schienale. Aveva un'espressione che Maya riconosceva — l'espressione di qualcuno che ricalcola i costi in tempo reale.

"Ne vale la pena," disse.

Maya era già al suo laptop. "Due nuovi ingegneri si uniscono a noi la prossima settimana. Soo-Jin dal team di piattaforma della sua ultima azienda, e Rafael — lui era specializzato in sicurezza. Prima del loro primo giorno, voglio che sia cristallino chi può toccare cosa."

"Già il salto nel profondo?" chiese Leo.

"La roba vera."

Nel prossimo capitolo: i permessi a grana fine che permettono a una parte del sistema di parlare con un'altra — in sicurezza.
