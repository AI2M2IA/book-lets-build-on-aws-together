# Capitolo 6: Il Disco Che Ti Segue

Tom aveva una penna rossa e un’abitudine che metteva in ansia Leo.

Ogni sabato mattina, Tom stampava il riepilogo della console AWS – istanze in esecuzione, volumi di storage, dischi collegati – e lo passava in rassegna riga per riga. Lo faceva da due settimane. Lo chiamava “il registro”. Leo lo chiamava “la cosa che fa Tom che fa sentire Leo come se avesse fatto qualcosa di sbagliato”.

Quel sabato, Tom circondò qualcosa con un cerchio e lasciò la stampa sul tavolo di Maya senza dire una parola.

Lei lo trovò lunedì mattina. Un cerchio. Un appunto sul margine, tre parole:

*Tutto. Una macchina.*

Il server web. Il database. Tutti gli ordini dei clienti. Due mesi di cronologia degli ordini. Tutto ciò che girava su una singola istanza EC2.

“Cosa succede al database se l’istanza va in crash?” chiese Maya, tenendo la stampa in mano.

“Anche lui va in crash,” rispose Leo.

“E i dati?”

“Dipende da come il database li memorizza.”

Quel “dipende” era il problema.

**Come le Istanze EC2 Memorizzano i Dati**

Quando un’istanza EC2 è in esecuzione, il suo sistema operativo vive da qualche parte su un disco. Quel disco
è chiamato **volume root**. Per impostazione predefinita, questo è un **volume EBS** – anche se non ci pensi.

Ma c’è anche qualcos’altro: le istanze EC2 hanno anche **storage istantaneo**.

Lo storage istantaneo è uno storage temporaneo fisicamente collegato all’hardware sottostante che esegue la tua macchina virtuale. È estremamente veloce – più veloce di quasi qualsiasi altra opzione di storage in AWS. Ma ha un “catch”.

Lo storage istantaneo è **ephemero**.

Quando l’istanza si arresta o viene terminata, lo storage istantaneo scompare. In modo permanente.
Non è recuperabile. AWS non ti avverte molto forte di questo, il che è il modo in cui i team lo scoprono: perdendo i dati.

Lo storage istantaneo è appropriato per cache, file di elaborazione temporanei e spazio di lavoro. Mai per dati di cui ti preoccupi.

**EBS: Il Disco Persistente**

**Amazon EBS** – Elastic Block Store – è uno storage a blocchi persistente per le istanze EC2.

Lo storage a blocchi significa che si comporta come un vero hard disk: il tuo sistema operativo può creare
sistemi di file su di esso, leggere e scrivere byte arbitrari in posizioni arbitrarie, eseguire database su di esso e trattarlo esattamente come un disco collegato.

Le proprietà chiave:

**Persistente.** A differenza dello storage istantaneo, i volumi EBS sopravvivono agli arresti, agli avvii e persino alla terminazione delle istanze (a seconda della configurazione). I dati rimangono sul volume anche quando nessuna istanza lo sta utilizzando.

**Attachable e detachable.** Un volume EBS può essere scollegato da una istanza e collegato a un'altra. Se hai bisogno di migrare i dati o recuperarti da un'istanza fallita, puoi scollegare il volume e ricollegarlo altrove.

**Single attachment (mostly).** Per impostazione predefinita, un volume EBS è collegato a esattamente una istanza EC2 alla volta. Una singola istanza può avere più volumi EBS, ma un singolo volume EBS non può essere montato da più istanze contemporaneamente (con una eccezione: EBS Multi-Attach, che ha casi d'uso limitati e importanti restrizioni).

L'analogia: EBS è un hard disk esterno che si collega a un laptop. Il laptop (istanza EC2) può leggere e scrivere su di esso. Quando hai finito, puoi scollegarlo e collegarlo a un altro laptop.

**Tipi di Volume EBS**

Non tutti i volumi EBS sono uguali. AWS offre diversi tipi con profili di prestazioni e costi diversi.

**gp3 (General Purpose SSD)**: La scelta predefinita per la maggior parte dei carichi di lavoro. Buon equilibrio tra prestazioni e prezzo. Adatto per volumi di avvio, piccoli database e ambienti di sviluppo.

**io2 (Provisioned IOPS SSD)**: Opzione ad alte prestazioni per carichi di lavoro intensivi di I/O.
Specifichi quante operazioni di input/output al secondo (IOPS) ti servono, e AWS garantisce quel livello di prestazioni. Adatto per grandi database di produzione.

**st1 (Throughput Optimized HDD)**: Storage magnetico ottimizzato per ampi trasferimenti sequenziali di dati. Costo inferiore rispetto agli SSD, ma più lento per l'I/O casuale. Buono per data warehousing e log processing.

**sc1 (Cold HDD)**: L'opzione EBS più economica. Per i dati accessi raramente. Non è appropriato per nulla di sensibile al tempo.

Non è necessario che tu memorizzi tutti i tipi di esame. Tuttavia, è testato la tua capacità di abbinare i requisiti al tipo giusto: requisiti di IOPS → io2. Carichi di lavoro sequenziali sensibili al costo → st1. Applicazioni web generiche → gp3.

**Snapshot EBS: Il Backup**

Ecco qualcosa che le aziende fanno regolarmente.

Uno **snapshot EBS** è un punto nel tempo di un volume EBS, memorizzato in S3 (anche se lo accedi tramite l'interfaccia EBS, non direttamente tramite S3). Gli snapshot sono incrementali: il primo snapshot cattura l'intero volume; snapshot successivi memorizzano solo ciò che è cambiato dall'ultimo.

Puoi creare un nuovo volume EBS da uno snapshot – ripristinando a un punto nel tempo prima di una corruzione del database, un cattivo deployment o una cancellazione accidentale.

Dovresti automatizzare gli snapshot. AWS fornisce **Amazon Data Lifecycle Manager** per questo scopo: definisci una policy (prendi uno snapshot ogni 6 ore, conserva gli ultimi 7 giorni), e viene eseguita automaticamente.

Priya aveva configurato tutto prima che il database entrasse in produzione.

Leo non ci aveva pensato.

**EFS: Il Sistema di Archiviazione Condiviso**

EBS è un disco collegato a una singola istanza. Cosa succede se più istanze hanno bisogno di accedere agli stessi file contemporaneamente?

Entra in scena **Amazon EFS – Elastic File System**.

EFS è un file system di rete gestito. Più istanze EC2 possono montare lo stesso file system EFS contemporaneamente e leggere e scrivere file condivisi. Questa è la capacità chiave che EBS non fornisce.

Pensatene in questo modo:

EBS è un disco esterno collegato a un solo laptop. Solo quel laptop può usarlo in un momento.

EFS è un armadietto blindato al centro di un ufficio. Ogni membro del team può avvicinarsi, aprire un cassetto, leggere un file, mettere qualcosa indietro. Più persone, contemporaneamente, che accedono allo stesso storage.

**Quando hai bisogno di EFS?**

- Quando più istanze EC2 hanno bisogno di condividere file – sistemi di gestione dei contenuti, file di configurazione condivisi, librerie multimediali condivise
- Quando hai un'applicazione scalata orizzontalmente in cui tutte le istanze hanno bisogno di accedere agli stessi dati
- Quando hai bisogno di un file system persistente che sopravvive ai guasti dell'istanza

**EFS vs. S3:** EFS è un file system (cartelle, file, permessi, blocco) mentre S3 è un storage di oggetti (caricamento, download, senza semantica di file system). EFS è molto più costoso di S3. Usa S3 per i file che vengono memorizzati e recuperati interi. Usa EFS per i file che le applicazioni leggono e scrivono attivamente tramite operazioni standard di file system.

**Scegliere lo Storage Giusto**

Adesso hai visto tre tipi di storage in AWS. Cerchiamo di prendere la decisione in modo chiaro.

| Esigenze                                  | Tipo di Storage     |
|---------------------------------------|------------------|
| Database con bisogno di disco persistente e veloce | EBS (gp3 o io2) |
| Più server con bisogno di file condivisi    | EFS              |
| File, backup, immagini, grandi oggetti | S3               |
| Spazio di calcolo temporaneo scratch | Instance Store   |
| Archivi a lungo termine al minimo costo    | S3 Glacier       |

Fare questa decisione giusta è importante. Usare S3 dove si ha bisogno di EFS aggiunge complessità operativa. Usare EBS dove si ha bisogno di EFS causa guasti quando si scala. Usare instance store dove si ha bisogno di persistenza perde i dati.

Priya ha stampato questa tabella e l'ha appesa al muro.

"Ogni volta che aggiungiamo un requisito di storage", ha detto, "iniziamo qui."

## Punti di Forza e Limitazioni

**Punti di forza di EBS**:

- Storage a blocchi persistente e veloce per EC2
- Snapshot per backup e ripristino point-in-time
- Più livelli di prestazioni per diversi carichi di lavoro
- Crittografia a riposo supportata nativamente

**Limitazioni di EBS**:

- Collegato a una singola istanza alla volta (con alcune eccezioni minori)
- Nell' stesso AZ dell'istanza EC2 (copiare in un altro AZ richiede uno snapshot)
- Si paga per lo storage provisionato, non per quello che si usa

**Punti di forza di EFS**:

- File system condiviso multi-istanza – protocollo nativo NFS
- Scala automaticamente, non è necessario provisionare la capacità
- Accessibile attraverso AZ diversi all'interno di una Regione

**Limitazioni di EFS**:

- Più costoso di S3 per GB
- Maggiore latenza rispetto a EBS per I/O casuali
- Non disponibile in tutte le Regioni

## Riepilogo

- **Instance store** è un storage temporaneo, veloce, fisicamente collegato all'host. I dati vengono persi quando l'istanza si arresta o termina. Solo per lo spazio di scratch.
- **EBS** (Elastic Block Store) è un storage a blocchi persistente per una singola istanza EC2. Sopravvive agli arresti dell'istanza. Può essere snapshot per il backup. Scegli il volume giusto (gp3 per uso generale, io2 per requisiti di I/O elevati).
- **EFS** (Elastic File System) è un file system di rete condiviso che più istanze possono montare contemporaneamente. Usalo quando più server hanno bisogno di accedere agli stessi file.
- Abbina il tipo di storage al requisito: database → EBS; file condivisi → EFS; oggetti/backup → S3; archivi → S3 Glacier.

## Suggerimenti per l'Esame

*SAA-C03 Dominio 3 — Task 3.1 (soluzioni di storage)*

- **I volumi EBS vivono in un AZ.** Possono essere collegati solo a un'istanza nello stesso AZ. Per utilizzare un volume EBS in un'altra AZ, è necessario creare uno snapshot e ripristinarlo nella regione di destinazione.
- **Gli snapshot EBS sono incrementali e memorizzati in S3.** Il primo snapshot è completo; le successive memorizzano solo le modifiche. È possibile copiare gli snapshot in altre regioni per il ripristino di emergenza.
- **EFS è cross-AZ.** Più istanze in diverse AZ all'interno della stessa Regione possono montare lo stesso file system EFS. Questa è una differenza chiave rispetto a EBS.
- Quando uno scenario d'esame dice "applicazione web con contenuti condivisi" o "più istanze che accedono agli stessi file", pensa a EFS. Quando dice "storage per database" o "storage a blocchi persistente per un server", pensa a EBS.
- **I dati di instance store sopravvivono a un riavvio ma non a un arresto o alla terminazione.** Una domanda potrebbe descrivere dati che "scompare dopo che l'istanza è stata arrestata" - questo è instance store in gioco.

## Esercizi

**Esercizio 1 — Ricordo**

In parole tue: qual è la differenza tra EBS e EFS? Quando sceglieresti uno rispetto all'altro?

*(Suggerimento: Considera se un'istanza o più istanze necessitano di accedere allo
archiviazione contemporaneamente.)*

**Esercizio 2 — Esercitazione d'Esame**

*Scenario*: Un'azienda gestisce un'applicazione web su quattro istanze EC2 dietro un load
balancer. Gli utenti possono caricare foto del profilo. Tutte e quattro le istanze devono
essere in grado di servire qualsiasi foto utente immediatamente dopo che è stata
caricata, indipendentemente dall'istanza che ha gestito il caricamento. Il team
ha bisogno di un archivio di file persistente e condiviso.

Quale soluzione di archiviazione soddisfa al meglio i loro requisiti?

A) Attacca un volume EBS gp3 a ciascuna istanza EC2 e sincronizza i file tra di essi utilizzando
   un cron job
B) Memorizza le foto direttamente sulla memoria istanza dell'istanza EC2
C) Utilizza Amazon EFS, montato su tutte e quattro le istanze EC2 simultaneamente
D) Memorizza le foto in S3 e accedile direttamente dal codice dell'applicazione

**Suggerimento 1**: Il requisito è "tutte e quattro le istanze devono servire qualsiasi foto". Quali opzioni
rendono un file immediatamente visibile a tutte le istanze?

**Suggerimento 2**: La memoria istanza è effimera. EBS non può essere montato su più istanze
simultaneamente. Questo riduce le opzioni.

**Suggerimento 3**: Sia C che D potrebbero teoricamente funzionare. Quale è più appropriata
per un caso in cui l'applicazione ha bisogno di accedere alle foto tramite operazioni
filesystem rispetto a richieste HTTP?

**Risposta**: D

**Spiegazione**: Memorizzare le foto in S3 e servirle tramite URL è la scelta architettonicamente
corretta per un'applicazione web. Le foto caricate sono immediatamente accessibili da
qualsiasi server (e da qualsiasi browser) tramite l'URL di S3. S3 è progettato per questo
caso d'uso specifico: memorizzare file caricati dagli utenti su larga scala con elevata
disponibilità e senza gestione.

Nota: C (EFS) funzionerebbe tecnicamente, ma S3 è il modello preferito per i file binari
caricati dagli utenti in applicazioni web perché è più economico, più scalabile e serve
i file direttamente tramite HTTP senza che l'applicazione agisca come proxy.

**Perché non A?** La sincronizzazione dei file tramite cron job crea race conditions e problemi
di coerenza. Tra il caricamento e il prossimo sincronismo, i file potrebbero essere
mancanti su altre istanze.

**Perché non B?** I dati sulla memoria istanza vengono persi quando l'istanza viene
interrotta o terminata. Le foto scomparirebbero.

**Perché non C?** EFS è la risposta giusta se l'applicazione ha bisogno di semantiche
filesystem (ad esempio, un CMS che modifica i file sul posto). Per le foto utente caricate
tramite il web servite tramite HTTP, S3 è più semplice, più economico e più appropriato.

*SAA-C03 Dominio 3 — Attività 3.1*

**Esercizio 3 — Sfida Architetturale** *(Opzionale)*

Nimbus sta aggiungendo una nuova funzionalità: i proprietari di ristoranti possono caricare
menu PDF che vengono quindi analizzati e utilizzati per popolare il database Nimbus. Il
lavoro di elaborazione PDF viene eseguito su una flotta di istanze EC2 che devono: (a)
leggere il PDF caricato, (b) scrivere file di elaborazione temporanei, (c) scrivere l'output
analizzato.

Quali servizi di archiviazione utilizzeresti per ciascuno di questi tre passaggi e perché?

*(Non esiste una risposta corretta univoca. Concentrati sull'abbinamento del tipo di
archiviazione alle caratteristiche di ciascun passaggio.)*

## Scena Post-Titoli

Quel pomeriggio, Nimbus aveva separato correttamente i propri archivi. Il database aveva il suo
volume EBS con snapshot automatici. Le foto del menu sono state spostate su S3. L'istanza
EC2 finalmente aveva spazio per respirare.

Leo ha eseguito un test di carico. Il sito è riuscito a gestire duecento utenti
concorrenti senza spegnersi.

Tom ha guardato la bolletta. Il volume EBS stava aggiungendo 8 euro al mese. Lo ha
scritto giù.

"Sto aggiungendo sempre più cose a questa bolletta", ha detto. "Quando si equilibra?"

"Quando smettiamo di avere interruzioni", ha detto Maya. "Ogni interruzione costa più della
prevenzione."

Tom non sembrava convinto. Lo sarebbe stato, alla fine.

Tre giorni dopo, un proprietario di un ristorante sulla piattaforma ha provato a effettuare
un ordine e ha ricevuto un errore. Maya ha controllato i log.

Il database era lì. L'applicazione era in esecuzione. Ma venti utenti simultanei stavano
tutti cercando di leggere il menu contemporaneamente e ognuno stava colpendo il database.

"Ogni caricamento di pagina è una query al database", ha detto Leo. "Ogni singolo
uno."

Priya stava già cercando su Google.

Nel prossimo capitolo: cosa succede quando arrivano più clienti di quanti il server possa
gestire.
