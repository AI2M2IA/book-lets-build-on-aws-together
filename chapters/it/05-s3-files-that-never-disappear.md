# Capitolo 5: L'Armadietto Che Vive Nel Cloud

Leo stava facendo pulizia sul server alle nove del mattino quando trovò la cartella.

L'ufficio era silenzioso. Maya non era ancora arrivata. Il caffè stava ancora passando. Fuori dalla finestra, i primi pendolari sfilavano alla spicciolata. Leo aveva le cuffie nelle orecchie e stava scorrendo le directory quando si fermò.

Ottocento file. Tutti foto di menu. Tutti su una singola macchina senza backup.

Il server su cui girava l'app Nimbus era stato aggiornato una volta dopo l'interruzione di dodici minuti, ma l'archiviazione delle foto non si era mai spostata. Ogni arepa croccante, ogni piatto di salmone alla griglia, ogni ciotola di insalata perfettamente impiattata — tutte sedute su una singola macchina virtuale che avevano già dimostrato poter andare giù senza preavviso.

E se quella macchina fosse mai stata riavviata, ridimensionata o sostituita?

Sparite.

"Quante foto hanno caricato i clienti finora?" chiese Maya, quando arrivò.

Leo si girò. "Circa ottocento."

"E cosa succede a quelle ottocento foto se riavviamo il server?"

Un'altra delle pause significative di Leo.

Questo capitolo parla di dove i file dovrebbero davvero stare nel cloud.

**Il Problema di Memorizzare i File "Sul Server"**

Quando memorizzi i file direttamente su un'istanza EC2 — all'interno del suo filesystem — leghi quei file al ciclo di vita di quella specifica macchina.

Questo crea diversi problemi:

**Effimero per natura.** Le istanze EC2 possono essere fermate, terminate, sostituite. Il loro disco locale non è destinato a essere permanente. È spazio di lavoro temporaneo.

**Singolo punto di guasto.** Se l'istanza si guasta, i file se ne vanno con essa. Nessuna ridondanza. Nessun backup. Una brutta mattina e ottocento foto di menu scompaiono.

**Non si possono condividere tra istanze.** Quando aggiungi un secondo server (cosa che farai, nel Capitolo 7), non vedrà i file memorizzati sul disco del primo server. I due server sono isolati. Un utente che carica una foto potrebbe vederla; un altro utente che finisce su un server diverso potrebbe non vederla.

**Nessuna scalabilità.** Lo spazio su disco di EC2 è finito. Se lo riempi, o smetti di accettare caricamenti o ti affanni ad espandere lo storage sotto pressione.

Leo non aveva considerato cosa sarebbe successo con più server. Lo menzionò di sfuggita a Priya.

"Aspetta — come funzionerebbe la questione delle foto con due server?" chiese Priya.

"Cosa intendi?"

"Se abbiamo il Server A e il Server B dietro un load balancer," disse Priya, "e un cliente carica una foto — la sua richiesta va al Server A, giusto? Quindi la foto viene salvata sul disco del Server A. Ora la sua richiesta successiva va al Server B. Il Server B non ha la foto. Cosa vede il cliente?"

Leo aprì la bocca. Poi la richiuse.

"Un'immagine rotta," disse infine.

"O un errore 404," disse Priya. "O, se l'applicazione prova a caricarla e va in crash, una pagina di errore."

Disegnò sulla lavagna il piano del load balancer — aggiungere un secondo server era già nella roadmap. Nel momento in cui fosse successo, ogni caricamento di foto sarebbe diventato un lancio di moneta: caricata sul Server A, possibilmente servita dal Server B, foto mancante, cliente confuso.

"Avremmo passato una settimana a fare debugging prima di capire cosa c'era che non andava," disse Leo.

"Abbiamo pensato a cosa succede quando attiviamo l'Auto Scaling e all'improvviso abbiamo tre o quattro server?" chiese Priya. "Avremmo foto mancanti in continuazione."

Questa è una classe di bug che non si manifesta negli unit test. Appare solo in produzione, sotto carico, quando il traffico reale è distribuito su più server. La soluzione è smettere completamente di memorizzare i file sui server.

Esiste un modello migliore. AWS lo ha costruito nel 2006, ed è ancora uno dei servizi cloud più utilizzati al mondo.

**L'Hard Disk Che Vive Online**

Immagina un hard disk che vive su internet — uno che scala per contenere tutto ciò di cui avrai mai bisogno, e che ti addebita solo ciò che usi davvero. Non lo provisioni mai. Non ti preoccupi mai di finire lo spazio. Se ci metti ottocento foto oggi e otto milioni l'anno prossimo, dalla tua parte non cambia niente tranne la voce sulla fattura.

È questo che offre AWS. Lo chiamano **Amazon S3** — Simple Storage Service.

S3 è il servizio di archiviazione oggetti di AWS. Non è esattamente come un filesystem, e non è esattamente come un database. Memorizza file — chiamati oggetti — in contenitori nominati chiamati bucket. Il modello è semplice, e questa semplicità è il punto.

Il concetto chiave in S3 è l'**oggetto**.

Un oggetto è qualsiasi file: una foto, un video, un PDF, un CSV, un backup, un file di log. S3 non si preoccupa del tipo o della struttura. Memorizza i byte e li restituisce quando glielo chiedi.

Gli oggetti vivono all'interno di **bucket**. Un bucket è come una cartella di primo livello — un contenitore nominato all'interno di S3 che contiene i tuoi oggetti. Ogni bucket ha un nome univoco a livello globale (due bucket, in tutti gli account AWS, non possono condividere lo stesso nome) ed esiste in una specifica Regione.

**Come Funziona S3**

**Carichi** un oggetto in un bucket. S3 gli assegna una **chiave** — essenzialmente un nome di percorso come `menus/restaurant-001/photo-arepa.jpg`. Quella chiave identifica in modo univoco l'oggetto all'interno del bucket.

**Scarichi** (o recuperi) l'oggetto usando il nome del bucket e la chiave.

Puoi anche rendere gli oggetti accessibili pubblicamente — il che significa che chiunque abbia l'URL può scaricarli. È così che la maggior parte dei siti web serve le immagini: memorizza l'immagine in S3, la rende pubblica, incorpora l'URL nel proprio HTML.

Oppure mantieni gli oggetti privati — accessibili solo tramite richieste autenticate. Questo è il modello giusto per i dati dei clienti, i backup e qualsiasi cosa sensibile.

S3 non è un filesystem. Non ci sono vere cartelle. Il `/` nel nome di una chiave è solo una convenzione — S3 tratta l'intera chiave come una stringa piatta. Ma sembra fatto di cartelle e la maggior parte degli strumenti lo presenta come cartelle, quindi nella pratica non preoccuparti di questa distinzione.

Ci sono alcune caratteristiche operative di S3 che contano nella pratica ma non sono ovvie dalla descrizione:

**Immutabilità degli oggetti**: Gli oggetti S3 non vengono modificati sul posto. Se aggiorni un file, carichi una nuova versione dell'oggetto con la stessa chiave. S3 sostituisce il vecchio oggetto con il nuovo (oppure, con il versioning abilitato, li conserva entrambi). A differenza di un database dove fai l'`UPDATE` di una riga, gli oggetti S3 sono write-once, read-many. Per i file di testo e i documenti che modifichi spesso, va bene così — carichi semplicemente la nuova versione. Per i file molto grandi in cui vuoi aggiornare solo una parte del contenuto, il modello a oggetti di S3 significa che ricarichi l'intero file ogni volta.

**Forte consistenza read-after-write**: Da dicembre 2020, S3 fornisce consistenza forte per tutti gli oggetti — le nuove scritture sono immediatamente visibili alle letture successive. Prima del 2020, S3 aveva consistenza eventuale per alcune operazioni, il che causava bug sottili nelle applicazioni che scrivevano un oggetto e provavano immediatamente a leggerlo. Il miglioramento del modello di consistenza ha eliminato questa classe di bug.

**URL degli oggetti**: Ogni oggetto S3 ha un URL. Per un oggetto pubblico, assomiglia a: `https://bucket-name.s3.region.amazonaws.com/key/path`. Per gli oggetti privati, puoi generare URL pre-firmati che includono le informazioni di autenticazione e scadono dopo un tempo configurato. Entrambi i formati di URL sono il modo in cui le applicazioni e i browser recuperano effettivamente gli oggetti — non c'è nessun protocollo proprietario di mezzo.

**Nessuna directory da creare**: Poiché S3 non ha vere cartelle, non ci sono operazioni di creazione di directory. Carichi semplicemente un oggetto con una chiave che include il prefisso del percorso. La "cartella" appare automaticamente nella console quando esistono oggetti con quel prefisso, e scompare automaticamente quando tutti gli oggetti con quel prefisso vengono eliminati.

**Perché S3 è Diverso da un Hard Disk Normale**

Tre cose rendono S3 fondamentalmente diverso dall'archiviazione di file su un'istanza EC2:

**Durabilità.** AWS progetta S3 per una durabilità del 99,999999999% (undici nove). Significa che se memorizzi dieci milioni di oggetti, potresti aspettarti di perdere un oggetto ogni diecimila anni a causa di guasti hardware. Lo ottengono memorizzando automaticamente più copie di ogni oggetto su almeno tre Availability Zone.

Ma la durabilità protegge dai guasti hardware — non dal fatto che tu elimini accidentalmente qualcosa. Per quello c'è il versioning.

C'è una distinzione importante tra **durabilità** e **disponibilità**. La durabilità riguarda se i tuoi dati esistono ancora. La disponibilità riguarda se puoi accedervi in questo momento. S3 Standard offre il 99,999999999% di durabilità e il 99,99% di disponibilità. Il numero della durabilità è quasi incomprensibilmente alto; la cifra del 99,99% di disponibilità è un *obiettivo di progettazione* — circa 52 minuti di indisponibilità all'anno. Lo *SLA* contrattuale è in realtà più basso (99,9% al mese), e mancarlo ti fa guadagnare crediti di servizio, non uptime. Nella pratica, la disponibilità di S3 è molto più alta di entrambi i numeri — ma vale la pena capire che durabilità e disponibilità sono garanzie separate, e che gli obiettivi di progettazione e gli SLA sono promesse separate.

**Disponibilità.** S3 è progettato per essere accessibile anche quando i singoli componenti si guastano. Non ti stai connettendo a un solo server — ti stai connettendo a un sistema distribuito che aggira i guasti.

**Scalabilità.** S3 contiene una quantità di dati essenzialmente illimitata. Un singolo bucket può contenere trilioni di oggetti. Amazon stessa usa S3 per memorizzare dati a una scala difficile da comprendere. I bucket S3 più grandi del mondo contengono exabyte di dati — milioni di terabyte. Tu non gestisci questa scala; carichi semplicemente gli oggetti e S3 gestisce tutto ciò che sta sotto.

**Costo.** S3 Standard costa approssimativamente 0,023 dollari per GB al mese al momento in cui scriviamo. Per le ottocento foto di menu di Nimbus, con una media di 2 MB ciascuna, sono 1,6 GB di storage — circa 0,04 dollari al mese. Anche con 800.000 foto, parliamo di 37 dollari al mese di storage. Il costo dello stesso storage su un volume EBS sarebbe approssimativamente di 128 dollari al mese, con un tetto fisso che richiederebbe un'espansione prima di poter aggiungere altro. S3 cresce automaticamente e addebita proporzionalmente. EBS ha una dimensione fissa e un costo fisso.

**Versioning: Il Pulsante "Annulla"**

Ecco qualcosa che Maya trovò mentre esplorava la console S3.

S3 supporta il **versioning**. Quando abiliti il versioning su un bucket, S3 conserva ogni versione di ogni oggetto — incluse le versioni precedenti e le versioni eliminate.

Questo è il pulsante "annulla" per i tuoi file.

Priya volle testarlo prima di fidarsi. Caricò una foto di menu nel bucket, poi caricò una nuova versione con il file sbagliato — un'immagine tutta nera che creò in trenta secondi.

Aprì la console S3, fece clic su "Show versions" e le trovò entrambe: la versione sbagliata (corrente) e l'originale (precedente). Ripristinò la versione precedente copiandola di nuovo come nuova versione corrente.

"Funziona," disse.

"Quanto costa conservare tutte quelle versioni?" chiese Tom.

Paghi lo storage di ogni versione. Se hai molte versioni di file di grandi dimensioni, la cifra si accumula. AWS ha le **policy di lifecycle** che eliminano automaticamente le versioni vecchie dopo un certo periodo — le trattiamo nel Capitolo 23 quando approfondiamo l'ottimizzazione dei costi.

"Quindi abilitiamo il versioning ma impostiamo una regola di lifecycle che elimina le versioni vecchie dopo trenta giorni," disse Priya. "Così abbiamo una finestra di recupero senza pagare per conservare ogni versione per sempre."

Tom annotò il numero. Il costo di storage per trenta giorni di versioni era accettabile.

**S3 Event Notifications: File Che Fanno Cose**

Leo stava guardando le foto dei menu da un'angolazione diversa.

"In questo momento," disse, "quando un ristorante carica una foto, memorizziamo l'originale a piena risoluzione. Alcune sono quattromila per tremila pixel. Ogni volta che un cliente carica la pagina del menu su un telefono, stiamo servendo un'immagine da quattro megabyte."

"Quanto ci costa in larghezza di banda?" chiese Tom.

Leo aprì i numeri del trasferimento dati sulla fattura. La risposta era "più di quanto dovrebbe."

S3 ha una funzionalità chiamata **Event Notifications**. Quando un oggetto viene caricato in un bucket, S3 può attivare automaticamente un altro servizio — come Lambda, il servizio di calcolo serverless che trattiamo nel Capitolo 20. Quel trigger può eseguire del codice in risposta al caricamento senza alcun intervento manuale.

La soluzione di Nimbus: ogni volta che una foto viene caricata nel bucket delle foto originali, una S3 Event Notification attiva una funzione Lambda. La funzione Lambda legge la foto originale, genera una miniatura larga 400 pixel e la salva in un bucket di foto elaborate. L'app rivolta ai clienti serve la miniatura invece dell'originale.

La pipeline:

1. Il ristorante carica la foto originale da 4 MB in `nimbus-photos-raw/restaurant-001/arepa.jpg`
2. S3 emette una Event Notification
3. La funzione Lambda legge l'originale, genera una miniatura 400x300
4. Lambda salva la miniatura in `nimbus-photos-processed/restaurant-001/arepa.jpg`
5. Il cliente carica il menu, l'app serve la miniatura da 40 KB invece dell'originale da 4 MB

Il risultato: riduzione del 99% della larghezza di banda per le immagini. Caricamenti di pagina più veloci. Una voce di trasferimento dati più piccola sulla fattura. Gli originali sono preservati nel bucket raw, così se Nimbus vorrà mai generare versioni a risoluzione più alta, il materiale di partenza è lì.

"E gira automaticamente?" chiese Maya.

"Ogni volta che qualcuno carica una foto," disse Leo. "Noi non lo tocchiamo mai."

Questo pattern — elaborazione event-driven attivata da eventi di storage — è uno dei pattern più comuni e potenti nell'architettura cloud moderna. Lo riprendiamo a fondo nel Capitolo 20.

**Cross-Region Replication: Quando Una Copia Non Basta**

Priya sollevò una questione di conformità alla fine della settimana.

"Se Nimbus si espande per servire ristoranti nell'UE," disse, "e quei ristoranti caricano foto — quelle foto vengono memorizzate nel nostro bucket in `us-west-2`?"

"Sì," disse Leo.

"E il GDPR ha qualcosa da dire su dove vengono memorizzati quei dati?"

Ce l'ha. Le disposizioni del GDPR sul trasferimento dei dati implicano che i dati personali dei residenti UE possano richiedere l'archiviazione all'interno dell'UE o in una giurisdizione con protezione dei dati adeguata.

La risposta di S3 a questo è la **Cross-Region Replication** (CRR). Quando abiliti la CRR su un bucket, ogni nuovo oggetto caricato viene replicato automaticamente in un bucket in un'altra Regione. Configuri il bucket di origine, il bucket di destinazione e il ruolo IAM che dà a S3 il permesso di eseguire la replica.

Quando l'espansione nell'UE avverrà, il piano è questo: le foto caricate dai ristoranti UE andranno in un bucket `eu-west-1`, e la CRR le replicherà in un bucket di backup in `eu-central-1` (Francoforte) per il disaster recovery. I dati UE restano nelle Regioni UE.

"Quanto costerebbe?" chiese Tom.

Si applicano i costi di trasferimento dati cross-region e di storage — all'incirca la tariffa di trasferimento per GB dalla Regione di origine a quella di destinazione, più lo storage per le copie replicate. Tom fece i conti sul volume di foto UE previsto per Nimbus e stabilì che sarebbe stato accettabile.

"E se qualcuno tentasse di violare la pipeline di replica?" chiese Priya. "Il ruolo IAM che esegue la replica dovrebbe essere limitato strettamente — solo le azioni di replica S3, solo sui bucket specifici."

Scrisse quel requisito nel piano di espansione.

**Multipart Upload e il Problema dei Caricamenti Incompleti**

Tom trovò una voce inattesa sulla fattura AWS.

"Stiamo pagando per lo storage in S3," disse, "ma l'importo è più alto di quanto mi aspetterei dal numero di foto che abbiamo."

Leo indagò. Trovò una categoria nel report di S3 Storage Lens: **caricamenti multipart incompleti**.

Quando un client carica un file di grandi dimensioni su S3, può usare il **multipart upload**: il client divide il file in parti, carica ogni parte separatamente, e S3 assembla le parti nell'oggetto finale. È obbligatorio per gli oggetti più grandi di 5 GB (il limite per una singola PUT) e raccomandato per qualsiasi cosa sopra all'incirca i 100 MB. Questo rende i caricamenti di grandi dimensioni più affidabili — se una parte fallisce, solo quella parte deve essere ritentata, non l'intero file.

Ma se un multipart upload viene avviato e poi abbandonato — l'utente ha chiuso il browser, la rete è caduta, l'applicazione è andata in crash — le parti parziali rimangono in S3, accumulando costi di storage. Non sono visibili come oggetti completati, ma vengono fatturate come storage.

"Quanto?" chiese Tom.

"Circa 12 dollari al mese," disse Leo. "Da caricamenti parziali mai completati."

La soluzione: una **regola di lifecycle** S3 che elimina automaticamente i multipart upload incompleti dopo sette giorni. Qualsiasi caricamento che non si è completato in una settimana è abbandonato, e le parti parziali vengono ripulite.

Tom aggiunse la regola di lifecycle quel pomeriggio. L'addebito da 12 dollari al mese scomparve nel giro di pochi giorni.

"Sono 144 dollari all'anno," disse Tom, guardando il suo foglio di calcolo. "Per niente."

"Avevo configurato un load test che usava i multipart upload," disse Leo. "Oh." Una pausa. "Probabilmente sono per la maggior parte quelli. Ho dimenticato di fare pulizia quando il test è finito."

Tom lo annotò comunque.

**Controllo degli Accessi: Pubblico vs. Privato**

Per impostazione predefinita, tutto in S3 è privato. Solo il tuo account AWS può accedervi.

Puoi rendere pubblici i singoli oggetti — che è il modo in cui serviresti le immagini dei menu ai visitatori del sito web. Oppure puoi mantenere tutto privato e generare **URL pre-firmati**: link a tempo limitato che consentono a qualcuno di scaricare un oggetto specifico senza aver bisogno di credenziali AWS. Perfetto per consentire a un cliente di scaricare la propria fattura per 24 ore.

Priya aveva opinioni molto forti al riguardo.

"E se qualcuno tentasse di entrare attraverso un bucket mal configurato?" disse. "Non rendere mai un bucket completamente pubblico a meno che tu non abbia consapevolmente deciso di rendere ogni oggetto al suo interno accessibile all'intera internet. L'errore di sicurezza S3 più comune è esporre accidentalmente un bucket che contiene dati sensibili."

AWS ora ha un'impostazione "Block Public Access" che puoi applicare a livello di account, costringendo tutti i bucket a essere privati a meno che tu non la sovrascriva esplicitamente per singolo bucket.

Abilitala. Sempre.

La storia dietro tutto questo: prima che AWS aggiungesse il Block Public Access a livello di account, l'incidente di sicurezza S3 più comune era rendere accidentalmente pubblico un bucket. Uno sviluppatore creava un bucket per dei test, spuntava la casella "public" per comodità, aggiungeva alcuni file inclusi alcuni provenienti da altre cartelle a cui non aveva pensato, e poi se ne dimenticava. Il bucket restava lì, pubblicamente accessibile, per mesi. In alcuni casi di alto profilo, il "bucket di test dimenticato" conteneva dati dei clienti, documenti interni o credenziali.

Il Block Public Access a livello di account è una protezione contro questo. Anche se uno sviluppatore configura accidentalmente un bucket come pubblico, l'impostazione a livello di account lo sovrascrive. Devi disabilitare esplicitamente l'impostazione a livello di account prima che qualsiasi bucket possa diventare pubblico — il che crea un rallentamento deliberato che previene gli incidenti.

Nimbus aveva il Block Public Access abilitato a livello di account. Allora come sarebbero state servite le immagini dei menu che dovevano essere pubblicamente accessibili? Il pattern standard — uno che Nimbus avrebbe adottato più avanti, nel Capitolo 13 — è mettere una CDN come CloudFront davanti al bucket con una policy di Origin Access Control: la CDN può recuperare gli oggetti da un bucket S3 privato, ma nessuno può accedere al bucket direttamente. Questo pattern è più sicuro di un bucket pubblico e consente alla cache della CDN di ridurre i costi delle richieste S3.

"Aspetta — ma *perché* dovremmo farlo in quel modo?" chiese Maya. "Le immagini sono comunque pubbliche, quindi che importanza ha se il bucket è pubblico?"

"Perché un bucket pubblico significa che chiunque può enumerare cosa c'è dentro," disse Priya. "Possono elencare tutti gli oggetti nel bucket. Con CloudFront davanti, vedono solo gli URL che esponiamo nell'applicazione. Il bucket in sé resta privato."

Maya aggiunse "enumerare" al suo modello mentale delle superfici di attacco.

**Le Storage Class di S3: Non Tutti i Dati Sono Uguali**

Non tutti i dati vengono acceduti allo stesso modo.

Le tue foto di menu più popolari vengono recuperate decine di volte al secondo. I tuoi log di tre anni fa vengono acceduti forse una volta all'anno, se va bene. S3 lo riconosce e offre diverse **classi di storage** con diversi compromessi tra prestazioni e costi.

| Classe di Storage       | Caso d'uso                                       | Recupero         | Costo                            |
|-------------------------|-----------------------------------------------|------------------|-----------------------------|
| S3 Standard             | Dati acceduti frequentemente                     | Immediato        | Più alto per GB                  |
| S3 Standard-IA          | Accesso infrequente, ma serve recupero veloce    | Immediato        | Più basso per GB, costo di recupero |
| S3 Glacier Instant      | Archivi acceduti occasionalmente                 | Immediato        | Molto più basso                  |
| S3 Glacier Flexible     | Archivi raramente acceduti                       | Da minuti a ore  | Molto basso                      |
| S3 Glacier Deep Archive | Archivi di conformità, acceduti quasi mai        | Fino a 12 ore    | Il più basso                     |

Le approfondiamo nel Capitolo 23. Per ora: il concetto è che puoi spostare automaticamente gli oggetti tra le classi di storage in base alla loro età e ai pattern di accesso, risparmiando cifre significative sui dati che tocchi raramente.

C'è anche **S3 Intelligent-Tiering** — una classe di storage che sposta automaticamente gli oggetti tra i livelli ad accesso frequente e ad accesso infrequente in base ai pattern di accesso osservati. Paghi una piccola tariffa di monitoraggio per oggetto al mese, e S3 gestisce automaticamente il tiering. È utile quando non sei sicuro di quali oggetti verranno acceduti frequentemente e quali no — il servizio impara il pattern e ottimizza di conseguenza.

L'approccio di Tom era più manuale: "Voglio sapere dove va ogni dollaro." Scelse regole di lifecycle esplicite invece dell'Intelligent-Tiering, perché le regole esplicite sono prevedibili e verificabili. Dopo sei mesi di gestione dello storage S3 di Nimbus, aveva un quadro chiaro dei pattern di accesso e poté impostare regole di lifecycle che spostavano gli oggetti in Standard-IA dopo 30 giorni e in Glacier Flexible Retrieval dopo 180 giorni.

Il risparmio totale di storage dalla gestione del lifecycle nel primo anno: approssimativamente 340 dollari. Non una cifra che ti cambia la vita, ma reale — e il pattern si ripete su decine di bucket in qualsiasi account AWS serio.

"È quasi un volo andata e ritorno," disse Maya.

"È buona pratica ingegneristica," disse Tom. Lo mise nel foglio di calcolo.

C'è una trappola nella scelta della classe di storage che coglie molti team: la **durata minima di storage**. S3 Standard-IA ha una durata minima di storage di 30 giorni — se memorizzi un oggetto in Standard-IA e lo elimini dopo 15 giorni, paghi comunque per 30 giorni. Glacier Flexible Retrieval ha un minimo di 90 giorni. Glacier Deep Archive ha un minimo di 180 giorni.

Per gli oggetti che vengono eliminati frequentemente o hanno vite brevi, questi minimi rendono le classi IA e Glacier più costose di Standard, non meno. Prima di passare a una classe di storage più economica, verifica che gli oggetti ci vivranno effettivamente abbastanza a lungo perché i risparmi superino le penalità della durata minima.

**Come Vengono Crittografati gli Oggetti S3**

"E se qualcuno tentasse di entrare?" chiese Priya, prevedibilmente, il giorno in cui le foto andarono online. "Questi oggetti sono crittografati a riposo?"

Lo erano — e vale la pena capirlo, perché la crittografia S3 è uno degli argomenti più testati all'esame. Ogni oggetto caricato su S3 è crittografato a riposo per impostazione predefinita. La domanda è *chi detiene la chiave*:

**SSE-S3 (l'impostazione predefinita)**: S3 crittografa ogni oggetto con chiavi che S3 stesso gestisce, usando AES-256. Non fai niente, non configuri niente, non paghi niente. Da gennaio 2023, è automatico su ogni bucket. Per la maggior parte dei dati, è sufficiente.

**SSE-KMS**: S3 crittografa gli oggetti con una chiave KMS — o la chiave gestita da AWS `aws/s3` o una chiave gestita dal cliente che controlli tu (il Capitolo 16 tratta KMS in profondità). Cosa guadagni: un audit trail in CloudTrail di ogni uso della chiave, la capacità di controllare esattamente chi può decrittografare tramite la key policy, e la possibilità di revocare l'accesso disabilitando la chiave. Cosa paghi: i costi delle API KMS per richiesta. Ad alti volumi di richieste, abilita le **S3 Bucket Key** — S3 deriva una chiave a livello di bucket di breve durata dalla tua chiave KMS, riducendo le chiamate API KMS (e i costi) fino al 99%.

**SSE-C**: Fornisci tu la tua chiave di crittografia *con ogni richiesta*. AWS la usa in memoria e non la memorizza mai. Per le organizzazioni le cui regole di conformità dicono che AWS non deve mai detenere la chiave. Operativamente impegnativo — perdi la chiave, perdi i dati.

Il pattern d'esame: "crittografia con un audit trail dell'uso delle chiavi" o "controllare chi può decrittografare" → SSE-KMS. "L'azienda deve gestire le proprie chiavi e AWS non deve mai memorizzarle" → SSE-C. "Crittografia a riposo senza overhead di gestione" → SSE-S3 (già attivo).

**S3 Object Lock: Write Once, Read Many**

Alcuni dati devono essere *impossibili* da eliminare — non protetti da una policy, ma strutturalmente immutabili. Registrazioni di transazioni finanziarie, log di audit, prove legali. **S3 Object Lock** rende gli oggetti non eliminabili e non modificabili per un periodo di retention, anche da parte degli amministratori. Richiede il versioning, e ha due modalità che l'esame ama mettere a confronto: la **governance mode** (gli utenti con un permesso speciale possono comunque bypassare il lock) e la **compliance mode** (nessuno può accorciare la retention o eliminare l'oggetto — nemmeno l'utente root — finché il periodo non scade). Frasi normative come "WORM storage" o "SEC Rule 17a-4" sono trigger d'esame per Object Lock in compliance mode.

**S3 Transfer Acceleration: Caricamenti Veloci da Lontano**

Quando gli utenti caricano file di grandi dimensioni in un bucket dall'altra parte del mondo, la parte lenta è il lungo percorso sulla rete internet pubblica fino alla regione del bucket. **S3 Transfer Acceleration** dà al bucket un endpoint speciale che instrada i caricamenti verso la edge location AWS più vicina, poi li trasporta sulla backbone privata di AWS fino al bucket. Trigger d'esame: "utenti in tutto il mondo caricano file di grandi dimensioni in un bucket centrale; i caricamenti sono lenti" → Transfer Acceleration (spesso abbinato al multipart upload). Nota la direzione: Transfer Acceleration serve a far entrare i dati *dentro* S3; CloudFront serve a distribuire i dati *fuori*.

Un'altra classe di storage che vale la pena conoscere fin d'ora: **S3 One Zone-IA** — come Standard-IA ma memorizzata in una singola Availability Zone, circa il 20% più economica, per dati ad accesso infrequente che potresti ricreare se quella AZ andasse persa (miniature, report rigenerabili). È un classico distrattore d'esame; il Capitolo 23 copre l'intero spettro delle classi di storage.

## Punti di Forza e Limitazioni

**Perché S3 è eccellente**:

- Durabilità a undici nove. I tuoi dati sono più al sicuro in S3 che su quasi qualsiasi altro sistema.
- Scala illimitata. Non hai mai bisogno di provisionare lo storage — cresce e basta.
- Estremamente economico per ciò che offre (frazioni di centesimo per GB al mese).
- Integrazione nativa con quasi tutti gli altri servizi AWS.
- Supporta l'hosting di siti web statici — puoi servire un intero sito web statico direttamente da S3, senza bisogno di server.
- Elaborazione event-driven: le S3 Event Notifications attivano automaticamente Lambda, SQS o SNS quando gli oggetti vengono creati o eliminati, abilitando potenti pipeline di elaborazione senza polling o job pianificati.
- Cross-Region Replication per la residenza dei dati a fini di conformità e per il disaster recovery.

**Dove S3 non è la scelta giusta**:

- S3 non è un filesystem. Se la tua applicazione ha bisogno di montare un disco e usarlo come un disco locale (leggere, scrivere, modificare i file sul posto), S3 è lo strumento sbagliato. Usa invece EFS (Elastic File System, Capitolo 6) o EBS.
- S3 ha una latenza notevolmente più alta di un disco locale. Per i database o le applicazioni che necessitano di I/O veloce ad accesso casuale, lo storage a blocchi (EBS, Capitolo 6) è appropriato.
- Il trasferimento dati *verso* S3 è esente da costi di banda — ma non del tutto gratuito: ogni caricamento è una richiesta PUT, e S3 addebita per richiesta. Caricare milioni di piccoli oggetti può costare più in tariffe di richiesta che in storage. Il trasferimento dati *in uscita* costa per GB. Entrambe sono sorprese di fatturazione comuni — le affrontiamo nel Capitolo 30.
- S3 non è un database. Puoi memorizzare e recuperare oggetti per chiave, ma non puoi interrogare gli oggetti per il loro contenuto, eseguire aggregazioni o fare operazioni relazionali. Se hai bisogno di interrogare il contenuto dei dati memorizzati (non solo recuperarli per nome), ti serve un database o un servizio come Athena (Capitolo 26) che può interrogare gli oggetti S3 usando SQL.
- I costi del versioning degli oggetti si accumulano. Ogni versione precedente di ogni oggetto versionato viene fatturata come storage. Le regole di lifecycle che fanno scadere le versioni vecchie non sono facoltative — fanno parte della strategia di gestione dei costi per qualsiasi bucket con il versioning abilitato.

## Riepilogo

Ottocento foto su una singola istanza erano il problema. S3 lo ha risolto — ma S3 è più di un posto dove accantonare file. È un object store durabile, scalabile e accessibile globalmente, con il proprio modello di accesso, le proprie classi di storage, le proprie policy di lifecycle e il proprio sistema di eventi. Capire in cosa S3 eccelle, e cosa deliberatamente non è, plasma ogni decisione di storage che il team avrebbe preso da qui in avanti.

- **Amazon S3** è storage di oggetti — file (oggetti) in contenitori nominati (bucket). Memorizza copie su almeno tre Availability Zone per una durabilità a undici nove. S3 non è un filesystem: usa EFS per i mount condivisi, EBS per lo storage a blocchi a singola istanza.
- I file memorizzati sulle istanze EC2 sono legati al ciclo di vita di quell'istanza, causando bug di foto mancanti quando il traffico si distribuisce su più server. S3 lo risolve essendo indipendente da qualsiasi istanza.
- Il **versioning** preserva le versioni precedenti degli oggetti. Le **regole di lifecycle** automatizzano le transizioni tra le classi di storage e ripuliscono i multipart upload incompleti che altrimenti accumulerebbero addebiti silenziosi in fattura.
- Per impostazione predefinita, S3 è privato. Abilita il "Block Public Access" a livello di account. Servi gli oggetti pubblici attraverso CloudFront con Origin Access Control invece di rendere i bucket direttamente pubblici.
- Le classi di storage di S3 ti permettono di adattare il costo alla frequenza di accesso — ma fai attenzione agli addebiti per la durata minima di storage prima di far transitare oggetti a vita breve verso i livelli Infrequent Access o Glacier.

## Suggerimenti per l'Esame

*Dominio SAA-C03 3 — Task 3.1 (soluzioni di storage ad alte prestazioni)*

- **S3 è storage di oggetti, non storage a blocchi.** Quando uno scenario d'esame ha bisogno di un filesystem che più server possano montare, quello è EFS. Quando ha bisogno di un disco per una singola istanza EC2, quello è EBS. Quando ha bisogno di memorizzare file, backup, immagini o dati acceduti via HTTP — quello è S3.
- **Durabilità a undici nove** significa che S3 replica i dati su più AZ automaticamente. Non lo configuri tu — è l'impostazione predefinita.
- **S3 è Regionale**, ma accessibile globalmente. I bucket esistono in una specifica Regione, ma puoi accedervi da qualsiasi luogo.
- Gli **URL pre-firmati** consentono l'accesso a tempo limitato agli oggetti privati. Pattern comune: la tua applicazione genera un URL pre-firmato valido per 15 minuti, lo dà all'utente, l'utente scarica il file direttamente da S3.
- **S3 Standard-IA** ha un addebito di durata minima di storage (30 giorni). Non usarlo per dati che eliminerai rapidamente. L'esame verifica se conosci i compromessi tra le classi di storage.
- **Albero decisionale delle classi di storage**: *accesso frequente* → S3 Standard; *accesso infrequente ma serve recupero veloce* → S3 Standard-IA; *archivio acceduto occasionalmente* → S3 Glacier Instant Retrieval; *archivio raramente acceduto* → S3 Glacier Flexible Retrieval; *archivio di conformità, quasi mai acceduto* → S3 Glacier Deep Archive.
- La **Cross-Region Replication** richiede che il versioning sia abilitato sia sul bucket di origine sia su quello di destinazione. Le domande d'esame sul disaster recovery o sulla sovranità dei dati spesso coinvolgono la CRR.

## Esercizi

**Esercizio 1 — Ricorda**

Con parole tue: cos'è un oggetto S3? Cos'è un bucket S3? Perché memorizzare file in S3 è meglio che memorizzarli sul disco locale di un'istanza EC2?

*(Suggerimento: Pensa all'hard disk che vive su internet — cosa succede ai file legati al disco di una sola macchina, e cosa cambia quando invece vivono online?)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: Un'azienda di media produce video documentari. Deve memorizzare le riprese originali in 4K (accedute frequentemente durante la produzione), i montaggi finali (acceduti mensilmente per la distribuzione) e i master d'archivio (conservati a tempo indeterminato ma acceduti al massimo una volta all'anno per motivi di conformità). Vogliono minimizzare i costi di storage soddisfacendo al contempo i requisiti di accesso di ciascun livello.

Quale strategia di storage soddisfa MEGLIO le loro esigenze?

A) Memorizzare le riprese originali in S3 Standard, i montaggi finali in S3 Standard-IA e gli archivi in S3 Glacier Deep Archive  
B) Memorizzare tutto il contenuto in S3 Standard per prestazioni costanti e semplicità  
C) Memorizzare tutto il contenuto sullo storage dell'istanza EC2 per l'accesso più veloce  
D) Memorizzare tutto il contenuto in S3 Glacier Deep Archive per minimizzare i costi

**Suggerimento 1**: File diversi hanno pattern di accesso diversi. S3 offre diverse classi di storage per diverse frequenze di accesso. Quale classe corrisponde ad "accedute frequentemente"?

**Suggerimento 2**: Gli archivi acceduti "al massimo una volta all'anno" non hanno bisogno di recupero immediato. Quale classe di storage è progettata per l'archiviazione a lungo termine al costo minimo?

**Suggerimento 3**: Abbina la frequenza di accesso di ciascun livello alla classe di storage appropriata. Accesso frequente = Standard. Mensile = Standard-IA. Una volta all'anno = Glacier Deep Archive.

**Risposta**: A

**Spiegazione**: Questa strategia abbina correttamente ogni livello di dati alla classe di storage S3 appropriata. Le riprese originali accedute frequentemente restano in Standard per l'accesso immediato senza costi di recupero. I montaggi finali acceduti mensilmente vanno in Standard-IA (costo di storage più basso, costo di recupero accessibile). Gli archivi acceduti una volta all'anno vanno in Glacier Deep Archive per il costo di storage più basso possibile.

**Perché non B?** Memorizzare tutto in Standard è semplice ma costoso.

**Perché non C?** Lo storage dell'istanza EC2 è effimero e non appropriato per l'archiviazione di media a lungo termine. Se l'istanza viene terminata, tutto il contenuto è perso.

**Perché non D?** Glacier Deep Archive ha tempi di recupero fino a 12 ore. Memorizzarci le riprese di produzione accedute frequentemente renderebbe impossibile il lavoro di produzione.

*Dominio SAA-C03 3 — Task 3.1 / Dominio 4 — Task 4.1*

**Esercizio 3 — Sfida Architetturale** *(Facoltativo)*

Nimbus memorizza in S3 le foto degli ordini caricate dai clienti. Una normativa sulla protezione dei dati richiede che le foto dei clienti siano conservate per 7 anni, ma possano essere eliminate dopo. Il team vuole anche minimizzare il costo di archiviazione delle foto vecchie degli anni precedenti.

Progetta una strategia di storage S3 per questo requisito. Quali classi di storage useresti, e quando faresti la transizione tra di esse? Cosa faresti riguardo al requisito di eliminazione?

*(Suggerimento: Pensa alle policy di lifecycle. Non esiste una risposta unica corretta — ragiona sui compromessi tra costo e tempo di recupero.)*

## Scena Post-Crediti

Leo migrò le foto dei menu su S3 quel pomeriggio. Ottocento oggetti, memorizzati al sicuro su tre Availability Zone, con il versioning abilitato.

"In realtà adesso sono più al sicuro di quanto lo fossero prima," disse, con una certa soddisfazione.

"Sono sempre stati più al sicuro in S3," disse Priya. "Abbiamo solo aspettato di costruire il problema prima di risolverlo."

Leo lo accettò.

La mattina dopo, Tom arrivò con una stampa. La fattura AWS, annotata con penna rossa.

"Abbiamo un problema con il database," disse. "Stiamo facendo girare il nostro database degli ordini sulla stessa istanza EC2 del server web. E il nostro database dei menu. E i record dei nostri clienti."

Fece una pausa.

"Tutto è sulla stessa macchina. Una macchina. Tutti i nostri dati."

Maya guardò la stampa. Poi Tom. Poi il soffitto.

"E se quella macchina si rompe?"

Tom indicò l'annotazione a penna rossa.

Nel prossimo capitolo: la differenza tra un disco rigido che noleggi e un armadietto che l'intero ufficio condivide.
