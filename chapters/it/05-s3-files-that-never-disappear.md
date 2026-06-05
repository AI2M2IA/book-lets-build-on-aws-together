# Capitolo 5: L'Armadietto Che Vive Nel Cloud

Leo si rese conto che Nimbus stava memorizzando direttamente le foto dei menu caricati sull'istanza EC2.
Ogni foto che i clienti caricano – la deliziosa arepa croccante, il piatto di salmone alla griglia, la ciotola di insalata perfettamente presentata – era seduta su una singola macchina virtuale.

E se quella macchina fosse mai riavviata, ridimensionata o sostituita?

Scomparirebbe.

"Quante foto hanno caricato i clienti finora?" chiese Maya.

Leo aprì la console. "Circa ottocento."

"E cosa succede a quelle ottocento foto se riavviamo il server?"

Un altro dei momenti di pausa significativi di Leo.

Questo capitolo parla di dove dovrebbero realmente trovarsi i file nel cloud.

**Il Problema di Memorizzare i File "Sul Server"**

Quando si memorizzano i file direttamente su un'istanza EC2 – all'interno del suo filesystem – si lega quei file alla vita di quella specifica macchina.

Questo crea diversi problemi:

**Effimero per natura.** Le istanze EC2 possono essere interrotte, terminate, sostituite. Il loro disco locale non è destinato ad essere permanente. È uno spazio temporaneo di lavoro.

**Punto di guasto singolo.** Se l'istanza fallisce, i file vanno con essa. Non c'è ridondanza. Nessun backup. Una brutta mattina e ottocento foto di menu scompaiono.

**Non si possono condividere tra istanze.** Quando si aggiunge un secondo server (come farà nel Capitolo 7), non vedrà i file memorizzati sul disco della prima istanza. I due server sono isolati. Un utente che carica una foto potrebbe vederla; un altro utente che colpisce un server diverso potrebbe non vederla.

**Nessuna scalabilità.** Lo spazio su disco EC2 è finito. Se lo si riempie, si smettono di accettare caricamenti o si cerca di espandere lo spazio di archiviazione di fretta.

Esiste un modello migliore. AWS lo ha costruito nel 2006 ed è ancora uno dei servizi cloud più utilizzati al mondo.

**Amazon S3: L'Hard Disk Che Vive Online**

**Amazon S3** – Simple Storage Service – è il servizio di archiviazione oggetti di AWS.

Immaginatelo come un hard disk che vive su internet. Un hard disk infinito.
Uno che è automaticamente sottoposto a backup su più Zone di Disponibilità in modo che la perdita di un singolo data center non comporti la perdita dei suoi file.

Il concetto chiave in S3 è l'**oggetto**.

Un oggetto è qualsiasi file: una foto, un video, un PDF, un CSV, un backup, un file di log. S3 non si preoccupa del tipo o della struttura. Memorizza i byte e li restituisce quando richiesto.

Gli oggetti vivono all'interno di **bucket**. Un bucket è come una cartella di primo livello – un contenitore nominato all'interno di S3 che contiene i tuoi oggetti. Ogni bucket ha un nome univoco a livello globale (nessun bucket in tutti gli account AWS può condividere un nome) e esiste in una specifica Regione.

**Come Funziona S3**

Il modello è semplice, e questa semplicità è il punto.

Si **carica** un oggetto in un bucket. S3 gli assegna una **chiave** – essenzialmente un nome di percorso come `menu/ristorante-001/foto-arepa.jpg`. Questa chiave identifica in modo univoco l'oggetto all'interno del bucket.

Si **scarica** (o recupera) l'oggetto utilizzando il nome del bucket e la chiave.

È anche possibile rendere gli oggetti accessibili pubblicamente – il che significa che chiunque con l'URL può scaricarli. Questo è il modo in cui la maggior parte dei siti web serve le immagini: memorizza l'immagine in S3, la rende pubblica, incorpora l'URL nel tuo HTML.

Oppure si possono mantenere gli oggetti privati – accessibili solo tramite richieste autenticate. Questo è il modello giusto per i dati dei clienti, i backup e qualsiasi cosa sensibile.

S3 non è un filesystem. Non ci sono vere cartelle. Il `/` nel nome di una chiave è solo una convenzione – S3 tratta l'intera chiave come una stringa piatta. Ma appare come cartelle e la maggior parte degli strumenti la presenta come cartelle, quindi non preoccuparti di questa distinzione in pratica.

**Perché S3 è Diverso da un Hard Disk Normale**

Tre cose rendono S3 fondamentalmente diverso dallo storage di file su un'istanza EC2:

**Durabilità.** AWS progetta S3 per una durabilità del 99,999999999% (undici decimali di nove). Ciò significa che se memorizzi dieci milioni di oggetti, potresti aspettarti di perdere un solo oggetto ogni diecimila anni a causa di un guasto hardware. Lo ottiene memorizzando più copie di ogni oggetto su almeno tre Zone di Disponibilità automaticamente.

**Disponibilità.** S3 è progettato per essere accessibile anche quando i singoli componenti falliscono. Non ti connetti a un singolo server – ti connetti a un sistema distribuito che aggira i guasti.

**Scalabilità.** S3 contiene una quantità di dati essenzialmente illimitata. Un singolo bucket può contenere trilioni di oggetti. Amazon stesso utilizza S3 per memorizzare dati a una scala che è difficile da comprendere.

**Versioning: Il Pulsante "Annulla"**

Ecco qualcosa che Maya ha trovato quando stava esplorando la console S3.

S3 supporta il **versioning**. Quando si abilita il versioning su un bucket, S3 conserva ogni versione di ogni oggetto – comprese le versioni precedenti e le versioni eliminate.

Questo è il pulsante "annulla" per i tuoi file.

Carichi una nuova foto del menu che sovrascrive accidentalmente la vecchia? La vecchia versione è ancora lì. Elimini un file per errore? Può essere ripristinato. Vi venite colpiti da ransomware che sovrascrive tutti i tuoi file con spazzatura crittografata? Con il versioning, lo ripristini prima dell'attacco.

"Quanto costa mantenere tutte queste versioni?" chiese Tom.

Si paghi per lo storage di ogni versione. Se hai molte versioni di file di grandi dimensioni, questo si somma. AWS ha le **policy di lifecycle** che eliminano automaticamente le versioni vecchie dopo un certo periodo di tempo – le approfondiremo nel Capitolo 23 quando analizzeremo in dettaglio l'ottimizzazione dei costi.

**Controllo degli Accessi: Pubblico vs. Privato**

Per impostazione predefinita, tutto in S3 è privato. Solo il tuo account AWS può accedervi.

Puoi rendere oggetti individuali pubblici – il modo in cui serviresti le immagini dei menu ai visitatori del sito web. Oppure puoi mantenere tutto privato e generare **URL pre-firmatari**: link a tempo limitato che consentono a qualcuno di scaricare un oggetto specifico senza aver bisogno di credenziali AWS. Perfetto per consentire a un cliente di scaricare la propria fattura per 24 ore.

Priya aveva forti opinioni al riguardo.

"Non rendere mai un bucket completamente pubblico a meno che tu non abbia deliberatamente deciso di rendere accessibile a Internet ogni oggetto al suo interno", disse. "L'errore di sicurezza S3 più comune è accidentalmente esporre un bucket che contiene dati sensibili."

AWS ora ha un'impostazione chiamata "Block Public Access" che puoi applicare a livello di account, costringendo tutti i bucket a essere privati a meno che tu non lo sovrascriva esplicitamente per bucket.

Attivala. Sempre.

**Storage Class di S3: Non Tutti i Dati Sono Uguali**

Non tutti i dati vengono acceduti allo stesso modo.

Le tue foto dei menu più popolari vengono recuperate decine di volte al secondo. I tuoi log di tre anni fa vengono acceduti forse una volta all'anno, se mai. S3 riconosce questo e offre diverse **classi di storage** con diversi compromessi tra prestazioni e costi.

| Classe di Storage           | Caso d'uso                                      | Recupero        | Cost                        |
|-------------------------|-----------------------------------------------|------------------|-----------------------------|
| S3 Standard             | Dati frequentemente accessibili                      | Immediato        | Più alto per GB               |
| S3 Standard-IA          | Accesso raro, ma ha bisogno di un recupero veloce | Immediato        | Più basso per GB, costo di recupero |
| S3 Glacier Instant      | Archivi accessibili occasionalmente                | Immediato        | Molto più basso                  |
| S3 Glacier Flexible     | Archivi raramente accessibili                      | Minuti-ore       | Molto basso                    |
| S3 Glacier Deep Archive | Archivi di conformità, accessi quasi mai    | Fino a 12 ore   | Più basso                      |

Le approfondiremo nel Capitolo 23. Per ora: il concetto è che puoi spostare automaticamente gli oggetti tra le classi di storage in base alla loro età e ai modelli di accesso, risparmiando denaro sui dati che raramente tocchi.

## Punti di Forza e Limiti

**Perché S3 è eccellente**:

- Durabilità a nove-nove-nove. I tuoi dati sono più sicuri in S3 che su quasi qualsiasi altro sistema.
- Scala illimitata. Non hai bisogno di provisionare lo storage – cresce semplicemente.
- Estremamente economico per ciò che offre (frammenti di un centesimo al GB al mese).
- Integrazione nativa con quasi tutti gli altri servizi AWS.
- Supporta l'hosting di siti web statici – puoi servire un intero sito web statico direttamente da S3, senza server richiesti.

**Dove S3 non è la scelta giusta**:

- S3 non è un file system. Se la tua applicazione ha bisogno di montare un disco e usarlo come disco locale (leggere, scrivere, modificare i file sul posto), S3 non è lo strumento giusto. Usa EFS (Elastic File System, Capitolo 6) o EBS invece.
- S3 ha una latenza notevolmente superiore a un disco locale. Per database o applicazioni che necessitano di accesso casuale ad alta velocità, lo storage a blocchi (EBS, Capitolo 6) è appropriato.
- I trasferimenti di dati di grandi dimensioni in S3 sono gratuiti. I trasferimenti di dati di grandi dimensioni *fuori* costano denaro. Questa è una comune sorpresa di fatturazione – la affrontiamo nel Capitolo 30.

## Riepilogo

- **Amazon S3** è lo storage di oggetti – un posto dove archiviare file (chiamati oggetti) in contenitori nominati (chiamati bucket).
- S3 è progettato per una durabilità a nove-nove-nove, memorizzando automaticamente copie di ogni oggetto in almeno tre Availability Zone.
- I file memorizzati su istanze EC2 sono legati al ciclo di vita di tale istanza. I file importanti appartengono a S3, non al server.
- **Versioning** conserva le versioni precedenti degli oggetti – il tuo pulsante "undo".
- Per impostazione predefinita, S3 è privato. Abilita "Block Public Access" a livello di account.
- S3 ha diverse **classi di storage** per diversi modelli di accesso e costi. Le classi di accesso raro hanno un costo di recupero.

## Suggerimenti per l'Esame

*SAA-C03 Domain 3 — Task 3.1 (soluzioni ad alte prestazioni)*

- **S3 è un archivio di oggetti, non un archivio a blocchi.** Quando uno scenario d'esame ha bisogno di un filesystem che più server possano montare, si usa EFS. Quando ha bisogno di un disco per una singola istanza EC2, si usa EBS. Quando ha bisogno di archiviare file, backup, immagini o dati accessibili tramite HTTP — si usa S3.
- **Durabilità nove-nove** significa che S3 replica i dati su più AZ (Availability Zones) automaticamente. Non devi configurare questa funzionalità — è l'impostazione predefinita.
- **S3 è Regionale**, ma accessibile globalmente. I bucket esistono in una specifica Regione, ma puoi accedervi da qualsiasi luogo.
- **URL pre-firmat** consentono l'accesso temporaneo agli oggetti privati. Modello comune: la tua applicazione genera un URL pre-firmat valido per 15 minuti, glielo fornisce, l'utente scarica il file direttamente da S3.
- **S3 Standard-IA** ha una tariffa minima di durata dello storage (30 giorni). Non usarlo per i dati che eliminerai rapidamente. L'esame verifica se conosci i compromessi tra le classi di storage.
- **Albero decisionale per la classe di storage**: *accessi frequenti* → S3 Standard; *accessi infrequenti ma necessitano di recupero rapido* → S3 Standard-IA; *archivi accessi occasionali* → S3 Glacier Instant Retrieval; *archivi raramente accessati* → S3 Glacier Flexible Retrieval; *archivi di conformità, quasi mai accessati* → S3 Glacier Deep Archive. Quando uno scenario menziona "ottimizzazione dei costi" e "accessi infrequenti," Standard-IA è quasi sempre la risposta. Quando menziona "conformità" o "sette anni di conservazione," pensa a Glacier Deep Archive.

## Esercizi

**Esercizio 1 — Ricordo**

Con parole tue: cos'è un oggetto S3? Cos'è un bucket S3? Perché archiviare file in S3 è meglio che archiviarli sul disco locale di un'istanza EC2?

*(Suggerimento: Cosa succede ai file su un'istanza EC2 se l'istanza viene terminata? Cosa fa S3 in modo diverso?)*

**Esercizio 2 — Esercitazione per l'Esame**

*Scenario*: Un'azienda di produzione di documentari necessita di archiviare riprese originali in 4K (accessibili frequentemente durante la produzione), tagli finali modificati (accessibili mensilmente per la distribuzione) e master archiviati (conservati indefinitamente ma accessibili al massimo una volta all'anno per motivi di conformità). Vogliono minimizzare i costi di archiviazione pur soddisfacendo i requisiti di accesso di ciascun livello.

Quale strategia di storage è la MIGLIORE che soddisfa le loro esigenze?

A) Archiviare tutto il contenuto in S3 Standard per prestazioni e semplicità costanti
B) Archiviare le riprese originali in S3 Standard, i tagli finali in S3 Standard-IA e gli archivi in S3 Glacier Deep Archive
C) Archiviare tutto il contenuto sull'archiviazione del disco dell'istanza EC2 per l'accesso più veloce
D) Archiviare tutto il contenuto in S3 Glacier Deep Archive per minimizzare i costi

*(Suggerimento 1*: Diversi file hanno modelli di accesso diversi. S3 offre diverse classi di storage per diverse frequenze di accesso. Quale classe corrisponde a "accessi frequenti"?

*(Suggerimento 2*: Gli archivi accessibili "al massimo una volta all'anno" non necessitano di recupero immediato. Quale classe di storage è progettata per l'archiviazione a lungo termine con costi minimi?

*(Suggerimento 3*: Abbina la frequenza di accesso di ciascun livello al corrispondente classe di storage. Accessi frequenti = Standard. Mensile = Standard-IA. Una volta all'anno = Glacier Deep Archive.

**Risposta**: B

**Spiegazione**: Questa strategia corrisponde correttamente a ciascun livello di dati alla classe di storage S3 appropriata. Le riprese originali accessibili frequentemente rimangono in Standard per l'accesso immediato senza costi di recupero. I tagli finali accessibili mensilmente vanno in Standard-IA (costo di storage inferiore, costo di recupero accessibile). Gli archivi accessibili una volta all'anno vanno in Glacier Deep Archive per il costo di storage più basso.

**Perché non A?** Archivare tutto in Standard è semplice ma costoso. Stai pagando prezzi premium per i contenuti di archiviazione che raramente accedi.

**Perché non C?** L'archiviazione del disco dell'istanza EC2 è effimera e non è adatta per l'archiviazione a lungo termine dei media. Se l'istanza viene terminata, tutto il contenuto viene perso.

**Perché non D?** Glacier Deep Archive ha tempi di recupero fino a 12 ore. Archiviare riprese di produzione frequentemente accessibili lì renderebbe impossibile il lavoro di produzione.

*SAA-C03 Dominio 3 — Attività 3.1 / Dominio 4 — Attività 4.1*

**Esercizio 3 — Sfida Architetturale** *(Opzionale)*

Nimbus archivia le foto degli ordini dei clienti in S3. Una normativa sulla protezione dei dati richiede che le foto dei clienti siano conservate per 7 anni, ma possono essere eliminate dopo. Il team vuole anche minimizzare i costi di archiviazione delle vecchie foto degli anni precedenti.

Progetta una strategia di storage S3 per questo requisito. Quali classi di storage utilizzeresti e quando passeresti da una classe all'altra? Cosa faresti riguardo al requisito di eliminazione?

*(Suggerimento: Pensa alle policy di ciclo di vita. Non esiste una risposta corretta — ragionare sui compromessi tra costo e tempo di recupero.)*

## Scena Post-Crediti

Leo ha migrato le foto del menu su S3 nel pomeriggio. Ottomila oggetti, in modo sicuro archiviati su tre Availability Zones, con la funzionalità di versioning abilitata.

"In realtà sono più sicuri adesso di quanto lo fossero prima," disse, con un certo soddisfazione.

"Erano sempre più sicuri in S3," disse Priya. "Ci abbiamo solo aspettato fino dopo aver costruito il problema per risolverlo."

Leo accettò.

La mattina seguente, Tom arrivò con una stampa. La fattura AWS, annotata con penna rossa.

"Abbiamo un problema con il database," disse. "Stiamo eseguendo il nostro database degli ordini sulla stessa istanza EC2 del server web. E il nostro database del menu. E i nostri record dei clienti."

Fece una pausa.

"Tutto è sulla stessa macchina. Una macchina. Tutti i nostri dati."

Maya guardò la stampa. Poi Tom. Poi il soffitto.

"E se quella macchina si guasta?"

Tom indicò l'annotazione con la penna rossa.

Nel prossimo capitolo: la differenza tra un disco rigido che noleggi e un archivio che l'intero ufficio condivide.
