# Capitolo 6: Il Disco Che Ti Segue

Tom aveva una penna rossa e un'abitudine che metteva in ansia Leo.

Ogni sabato mattina, si sedeva con un caffè e stampava qualcosa. Non email. Non report. Stampava l'elenco di tutto quello che girava su Nimbus e lo leggeva come un libro mastro, riga per riga, penna in mano. Lo faceva da due settimane. Il rumore della stampante in fase di riscaldamento era diventato parte del fine settimana.

Leo la chiamava "la cosa che fa Tom che fa sentire Leo come se avesse fatto qualcosa di sbagliato."

Quel sabato, Tom circondò qualcosa con la penna e lasciò la stampa sulla scrivania di Maya senza dire una parola.

Lei la trovò lunedì mattina. Un cerchio. Un appunto sul margine, tre parole:

*Tutto. Una macchina.*

Le foto erano ora al sicuro in S3 — quel problema era risolto. Ma il database era ancora sulla stessa istanza EC2 del web server. Cronologia degli ordini, dati dei clienti, due mesi di transazioni. L'applicazione e tutto ciò che stava sotto di lei, che condividevano un singolo disco virtuale.

"Cosa succede al database se l'istanza va in crash?" chiese Maya, la stampa in mano.

"Va in crash anche lui," disse Leo.

"E i dati?"

"Dipende da come il database li memorizza."

Quel "dipende" era il problema.

**Come le Istanze EC2 Memorizzano i Dati**

Quando un'istanza EC2 è in esecuzione, il suo sistema operativo vive da qualche parte su un disco. Quel disco
è chiamato **volume root**. Per impostazione predefinita, si tratta di un **volume EBS** — anche quando
non ci pensi.

Ma c'è anche qualcos'altro: le istanze EC2 hanno anche lo storage **instance store**.

L'instance store è uno storage temporaneo fisicamente collegato all'hardware sottostante che
esegue la tua macchina virtuale. È estremamente veloce — più veloce di quasi qualsiasi altra opzione
di storage in AWS. Ma ha un'insidia.

L'instance store è **effimero**.

Quando l'istanza si arresta o viene terminata, i dati dell'instance store scompaiono. In modo permanente.
Non sono recuperabili. AWS non avverte in modo particolarmente chiaro di questo, ed è così che i team
lo scoprono: perdendo dati.

L'instance store è appropriato per cache, file di elaborazione temporanei e spazio scratch.
Mai per dati di cui hai cura.

**EBS: Il Disco Persistente**

Immagina un hard disk esterno che puoi collegare alla tua istanza EC2 — uno che
non scompare quando lo disconnetti, e che puoi spostare su un'altra macchina
se necessario. AWS lo chiama **EBS**: Elastic Block Store.

EBS è uno storage a blocchi persistente per le istanze EC2.

Storage a blocchi significa che si comporta come un vero hard disk: il tuo sistema operativo può creare
filesystem su di esso, leggere e scrivere byte arbitrari in posizioni arbitrarie, eseguire database
su di esso e trattarlo esattamente come un disco collegato.

Le proprietà chiave:

**Persistente.** A differenza dell'instance store, i volumi EBS sopravvivono agli arresti, agli avvii e
persino alla terminazione dell'istanza (a seconda della configurazione). I dati rimangono sul volume
anche quando nessuna istanza lo sta utilizzando.

C'è una sfumatura di configurazione da tenere a mente: quando crei un'istanza EC2, il volume root
ha un'impostazione chiamata "Delete on Termination". Per impostazione predefinita, è impostata su true — il
volume root viene eliminato quando l'istanza viene terminata. Per i volumi dati aggiuntivi
che colleghi, il valore predefinito è false — persistono dopo la terminazione dell'istanza.
Puoi cambiare entrambe le impostazioni. Se vuoi che il volume root sopravviva alla terminazione dell'istanza
(per analisi forensi o recupero dati), disabilita "Delete on Termination". Se vuoi
che i volumi dati vengano puliti automaticamente, abilitala.

**Collegabile e scollegabile.** Un volume EBS può essere scollegato da un'istanza e
collegato a un'altra. Se devi migrare dati o recuperarti da un'istanza guasta,
puoi scollegare il volume e ricollegarlo altrove.

Il flusso di scollegamento e ricollegamento è più lento di un restore da snapshot ma preserva
lo stato esatto del volume — tutte le scritture non committate, tutti i dati in cache, lo stato esatto
del filesystem. Questo lo rende utile per l'analisi forense (collegare il volume a
un'istanza di analisi senza avviare il sistema originale) e per la migrazione dei dati
(spostare un volume database su un'istanza più grande senza scattare uno snapshot).

**Singolo collegamento (per lo più).** Per impostazione predefinita, un volume EBS è collegato a esattamente una
istanza EC2 alla volta. Una singola istanza può avere più volumi EBS, ma un singolo
volume EBS non può essere montato da più istanze contemporaneamente (con un'eccezione:
EBS Multi-Attach, che ha casi d'uso limitati e importanti restrizioni).

EBS Multi-Attach consente ai volumi io1/io2 (Provisioned IOPS) di essere collegati a più istanze contemporaneamente
nella stessa AZ. Questo sembra risolvere il problema dello "storage condiviso", ma viene
con vincoli seri: le applicazioni sulle istanze collegate devono essere in grado di
coordinare l'accesso concorrente — la semantica del filesystem condiviso (gestione dei lock, ordinamento delle scritture)
non è fornita da EBS. In pratica, EBS Multi-Attach viene utilizzato per applicazioni di database
in cluster che gestiscono la coordinazione da sole. Per l'accesso condiviso generale ai file,
EFS è più semplice e appropriato.

L'analogia con EBS: un hard disk esterno collegato a un laptop. Il laptop
(istanza EC2) può leggere e scrivere su di esso. Quando hai finito, puoi scollegarlo e
collegarlo a un laptop diverso.

**Tipi di Volume EBS**

Non tutti i volumi EBS sono uguali. AWS offre diversi tipi con profili di prestazioni
e costi diversi.

**gp3 (General Purpose SSD)**: La scelta predefinita per la maggior parte dei carichi di lavoro. Buon equilibrio di
prestazioni e prezzo. Adatto per volumi di avvio, piccoli database e ambienti di sviluppo.

Prima che gp3 diventasse il valore predefinito, c'era il **gp2** — e lo incontrerai ancora in circolazione. I volumi gp2 legano le prestazioni IOPS direttamente alle dimensioni del volume: ottieni 3 IOPS per gigabyte, fino a un massimo di 16.000 IOPS (il che richiede un volume da 5.334 GB). La throughput è limitata a 250 MB/s. Questo accoppiamento significa che su gp2, l'unico modo per ottenere più IOPS è ingrandire il volume — anche se non hai bisogno dello spazio aggiuntivo. gp3 ha spezzato questa dipendenza: parte da 3.000 IOPS e 125 MB/s indipendentemente dalle dimensioni, e ti consente di configurare IOPS e throughput in modo indipendente, a costo inferiore. AWS raccomanda gp3 per i nuovi volumi, ma poiché molti carichi di lavoro esistenti girano ancora su gp2, è necessario conoscere entrambi.

**io2 (Provisioned IOPS SSD)**: Opzione ad alte prestazioni per carichi di lavoro intensivi di I/O.
Specifichi quante operazioni di I/O al secondo (IOPS) ti servono, e AWS garantisce
quel livello di prestazioni. Appropriato per grandi database di produzione.

**st1 (Throughput Optimized HDD)**: Storage magnetico ottimizzato per letture e scritture
sequenziali di grandi dimensioni. Costo inferiore rispetto agli SSD, ma più lento per l'I/O casuale. Adatto per data
warehousing e log processing.

**sc1 (Cold HDD)**: L'opzione EBS più economica. Per dati con accesso infrequente. Non
appropriato per nulla di sensibile al tempo.

"Quanto costa in più io2 rispetto a gp3?" chiese Tom, alzando gli occhi dal quaderno.

Leo aprì la pagina dei prezzi. io2 costava circa il 50-60% in più per GB rispetto a gp3, più un
addebito separato per IOPS provisionati — e su un volume ad alte prestazioni, queste
spese per IOPS sono quelle che dominano la bolletta. Tom annotò il divario. "Quindi usiamo gp3 finché
il database non ha effettivamente bisogno della garanzia di prestazioni."

L'esame non richiede di memorizzare tutti i tipi. Verifica la tua capacità di
abbinare i requisiti al tipo giusto: requisiti IOPS → io2. Carichi di lavoro sequenziali
sensibili ai costi → st1. Applicazioni web generiche → gp3.

**IOPS vs. Throughput: Perché la Distinzione è Importante**

Tom tornò alla questione del volume EBS il martedì successivo, dopo aver controllato CloudWatch.

"Vedo due metriche nel dashboard EBS," disse. "IOPS e throughput. Sono cose diverse?"

Lo sono.

**IOPS** (Input/Output Operations Per Second) misura quante operazioni di lettura o scrittura il disco può gestire al secondo. Ogni operazione è tipicamente piccola — da 4 KB a 256 KB. Gli IOPS elevati sono importanti per i database che eseguono molte letture e scritture piccole e casuali: recuperare singole righe, aggiornare record, gestire query concorrenti.

**Throughput** (misurata in MB/s) misura quanti dati si spostano al secondo. La throughput elevata è importante per i carichi di lavoro sequenziali: leggere grandi file di log, analisi in streaming, caricare grandi dataset.

Un database richiede tipicamente IOPS elevati e throughput da bassa a moderata. Un data warehouse che scansiona tabelle di grandi dimensioni ha bisogno di throughput elevata e può convivere con IOPS moderati.

Tom stava monitorando le metriche CloudWatch del database di Nimbus. Gli IOPS avevano picchi durante l'ora di cena — letture brevi e casuali mentre l'applicazione recuperava voci di menu e dati degli ordini. La throughput era bassa. Il pattern corrispondeva a un carico di lavoro di database che necessitava di IOPS migliori, non di throughput migliore.

"Quindi se il database diventa lento," disse Tom, "controlliamo se è limitato dagli IOPS o dalla throughput prima di aggiornare il volume?"

"Esatto," disse Priya. "Passare da gp3 a io2 aggiunge IOPS a un costo. Se il problema è la throughput, quell'aggiornamento non aiuterà. Controlla prima la metrica."

Questo è esattamente il modo in cui eviti costosi aggiornamenti di storage che risolvono il problema sbagliato.

**Snapshot EBS: Il Backup**

Ecco qualcosa che salva le aziende regolarmente.

Uno **snapshot EBS** è un backup point-in-time di un volume EBS, memorizzato in S3 (anche se
lo accedi attraverso l'interfaccia EBS, non direttamente attraverso S3). Gli snapshot sono
incrementali: il primo snapshot cattura l'intero volume; gli snapshot successivi memorizzano solo
ciò che è cambiato dall'ultimo.

Puoi creare un nuovo volume EBS da uno snapshot — ripristinando a un punto nel tempo prima di
una corruzione del database, un deployment errato o un'eliminazione accidentale.

Dovresti automatizzare gli snapshot. AWS fornisce **Amazon Data Lifecycle Manager** per questo
scopo: definisci una policy (scatta uno snapshot ogni 6 ore, conserva gli ultimi 7 giorni), e
viene eseguita automaticamente.

Priya aveva configurato tutto prima ancora che il database entrasse in produzione.

Leo non ci aveva pensato.

"Abbiamo pensato a cosa succede se il job di snapshot fallisce silenziosamente?" chiese Priya. "Se la policy viene eseguita ma gli snapshot non sono effettivamente validi?"

Testarono il processo di restore quel pomeriggio.

La policy di backup completo con snapshot di Priya per il database di produzione di Nimbus, una volta che ebbe il tempo di documentarla correttamente:

- **Snapshot giornalieri**, conservati per 7 giorni. Questi coprono il normale scenario di recupero: un deployment errato, un'eliminazione accidentale, un evento di corruzione scoperto entro una settimana.
- **Snapshot settimanali** (scattati ogni domenica alle 2:00), conservati per 30 giorni. Questi coprono lo scenario in cui un problema non viene rilevato immediatamente — una corruzione dei dati sottile che viene notata solo settimane dopo.
- Copia snapshot cross-region in `us-east-1`, una volta alla settimana, conservata per 30 giorni. Questi coprono lo scenario in cui l'intera Region `us-west-2` non è disponibile e Nimbus ha bisogno di ricostruire il database altrove.

"Sembrano molti snapshot," disse Leo.

"Ogni snapshot incrementale dopo il primo è piccolo," disse Priya. "Stai memorizzando solo ciò che è cambiato. Il costo totale di storage è modesto."

Tom aveva già controllato il prezzo. Snapshot giornalieri di un database da 50 GB, conservati per 7 giorni, più snapshot settimanali conservati per 30 giorni — circa 3-5 dollari al mese. Il costo di non averli, se il database fosse mai stato corrotto, era incommensurabilmente più alto.

"E Fast Snapshot Restore?" chiese Leo. "Ho visto quell'opzione quando stavo guardando le impostazioni."

**Fast Snapshot Restore** (FSR) è una funzionalità EBS che elimina la penalità di prestazioni di I/O che si verifica normalmente quando si usa per la prima volta uno snapshot ripristinato. Senza FSR, un volume EBS appena ripristinato ha prestazioni scarse per i primi minuti o ore mentre i dati vengono caricati pigramente da S3 — le letture colpiscono S3 per i dati che non sono ancora stati portati nel volume. Con FSR abilitato su uno snapshot in una specifica AZ, il volume ripristinato è immediatamente pronto per le prestazioni complete.

FSR costa di più — si paga per snapshot per AZ per ora in cui FSR è abilitato. Per gli snapshot di disaster recovery di Nimbus, l'uso occasionale non giustificava il costo continuo di FSR. Per uno snapshot di database di produzione che doveva essere ripristinato e operativo entro pochi minuti in un'emergenza, FSR valeva il costo.

"Abilita FSR sullo snapshot settimanale che useremmo effettivamente per il disaster recovery," disse Priya. "Non abilitarlo su ogni snapshot giornaliero nella finestra di retention."

Tom aggiunse il calcolo dei costi al suo foglio di calcolo.

**Copia Snapshot Cross-Region per il Disaster Recovery**

Gli snapshot EBS risiedono nella Region dove sono stati creati. Se l'intera Region `us-west-2` va giù, i tuoi snapshot in `us-west-2` sono inaccessibili.

La soluzione: **copia snapshot cross-region**. Puoi copiare uno snapshot EBS in un'altra Region, dandoti un backup utilizzabile anche se la tua Region primaria non è disponibile.

AWS Data Lifecycle Manager supporta la copia cross-region automatizzata come parte di una policy di snapshot: scatta uno snapshot giornaliero in `us-west-2`, copialo automaticamente in `us-east-1` una volta alla settimana. Se si verifica un disastro, avvia una nuova istanza EC2 in `us-east-1`, ripristina dallo snapshot cross-region, aggiorna l'endpoint DNS e continua a operare.

"Questo è il nostro piano di disaster recovery per il database," disse Priya, presentando la documentazione della policy al team. "Non un'architettura multi-region completa — è più complessità di quanta ne abbiamo bisogno in questo momento. Ma se `us-west-2` va giù completamente, possiamo ripristinare in `us-east-1` entro due ore."

"Due ore di downtime," disse Tom.

"Contro downtime infinito," disse Priya.

Tom riconobbe la distinzione.

**Crittografia EBS: La Storia di Perché Non Puoi Crittografare Sul Posto**

Il database di produzione di Nimbus era in esecuzione da sei settimane quando Priya segnalò qualcosa.

"Il volume EBS non è crittografato," disse.

"Possiamo crittografarlo?" chiese Leo.

"Sì. Ma non sul posto."

Ecco il problema con la crittografia EBS: non puoi crittografare un volume EBS esistente non crittografato direttamente. I dati sono già scritti in chiaro. Per crittografarlo, devi:

1. Creare uno snapshot del volume non crittografato
2. Copiare lo snapshot, abilitando la crittografia sulla copia
3. Creare un nuovo volume EBS crittografato dallo snapshot crittografato
4. Arrestare l'istanza
5. Scollegare il vecchio volume non crittografato
6. Collegare il nuovo volume crittografato
7. Avviare l'istanza e verificare che tutto funzioni

Questo processo ha una finestra di downtime — la sequenza di arresto, scollegamento, collegamento, avvio. Per Nimbus, con un database piccolo, la finestra era di circa quindici minuti. Per un grande database di produzione con centinaia di GB, il processo di snapshot e copia può richiedere più tempo, anche se il downtime effettivo dell'istanza è ancora solo il ciclo di arresto/avvio.

"Perché non possiamo semplicemente cambiare un'impostazione?" chiese Leo.

"Perché i dati esistenti sul disco sono byte non crittografati," disse Priya. "AWS non può re-crittografarli senza leggere e riscrivere ogni blocco — ed è esattamente quello che fa il processo di copia dello snapshot. Legge ogni blocco dallo snapshot sorgente, lo crittografa e lo scrive nel nuovo snapshot."

Leo eseguì il processo. Il nuovo volume crittografato fu collegato. L'istanza tornò online. Il database era in esecuzione su un volume crittografato.

"I nuovi volumi EBS possono essere creati crittografati per impostazione predefinita," disse Priya. "C'è un'impostazione a livello di account. Ogni nuovo volume viene crittografato automaticamente. Avremmo dovuto abilitarla dal primo giorno."

Lo abilitò. Da quel momento in poi, ogni volume EBS creato nell'account AWS di Nimbus era crittografato per impostazione predefinita — senza passaggi aggiuntivi richiesti.

**EFS: Il Classificatore Condiviso**

EBS è un disco collegato a una sola istanza. E se più istanze avessero bisogno di accedere
agli stessi file contemporaneamente?

Quello di cui hai bisogno è qualcosa come il classificatore al centro di un ufficio — chiunque
può avvicinarsi, prendere un file, rimetterlo a posto, e la persona successiva vede immediatamente la modifica.
Più persone, contemporaneamente, che accedono allo stesso storage.

AWS lo chiama **EFS**: Elastic File System.

EFS è un filesystem di rete gestito. Più istanze EC2 possono montare lo stesso filesystem EFS
contemporaneamente e leggere/scrivere file condivisi. Questa è la capacità chiave che EBS non fornisce.

Per essere chiari:

EBS è un hard disk esterno collegato a un laptop. Solo quel laptop può usarlo in un dato
momento.

EFS è il classificatore al centro dell'ufficio. Qualsiasi membro del team può avvicinarsi, aprire
un cassetto, leggere un file, rimettere qualcosa a posto.

**Quando hai bisogno di EFS?**

- Quando più istanze EC2 devono condividere file — sistemi di gestione dei contenuti, file di
  configurazione condivisi, librerie multimediali condivise
- Quando hai un'applicazione scalata orizzontalmente in cui tutte le istanze devono accedere agli
  stessi dati
- Quando hai bisogno di un filesystem persistente che sopravvive ai guasti dell'istanza

EFS è accessibile tramite rete utilizzando il protocollo NFS (specificamente NFSv4). Qualsiasi istanza EC2
che ha connettività di rete al mount target EFS può montarlo — incluse
istanze in diverse AZ all'interno della stessa Region. Configuri i mount target in ogni
AZ, e le istanze si connettono al mount target più vicino per prestazioni ottimali.

L'implicazione pratica: EFS funziona su più AZ per impostazione predefinita. Se hai web server
in `us-west-2a` e `us-west-2b` che montano entrambi lo stesso filesystem EFS, un file scritto
da un server in `2a` è immediatamente visibile a un server in `2b`. Questo è il comportamento
del filesystem condiviso che EBS non può fornire.

**Modalità di Prestazioni EFS**

EFS ha due modalità di throughput rilevanti per il dimensionamento:

**Elastic Throughput** (il valore predefinito per la maggior parte dei nuovi filesystem): EFS scala automaticamente la throughput verso l'alto e verso il basso in base all'utilizzo effettivo. Non provisioniamo un livello di throughput. Paghi per ciò che usi. Questa è la modalità giusta per carichi di lavoro variabili in cui le esigenze di throughput fluttuano — come Nimbus, dove il traffico del lunedì mattina è diverso da quello del venerdì sera.

**Provisioned Throughput**: Specifichi il livello di throughput indipendentemente dai dati memorizzati. Utile quando il tuo carico di lavoro ha bisogno di throughput elevata e costante che supera ciò che il volume di dati memorizzati fornirebbe in modalità Elastic. Se stai eseguendo un sistema di build che legge decine di gigabyte al minuto indipendentemente da quanto è memorizzato, Provisioned Throughput è appropriato.

C'è anche una terza modalità, **Bursting Throughput**, che è il comportamento originale di EFS e ancora il valore predefinito per i filesystem creati prima che Elastic diventasse disponibile. In modalità Bursting, la throughput scala con la quantità di dati memorizzati: ottieni una baseline di 50 KB/s per GB, più crediti burst che si accumulano quando sei al di sotto della baseline e che puoi spendere quando hai bisogno di throughput più elevata (fino a 100 MB/s per filesystem di dimensioni minori, o fino a un multiplo della baseline per quelli più grandi). È la scelta giusta per carichi di lavoro con pattern di accesso imprevedibili o a picchi in cui il filesystem è abbastanza grande da guadagnare crediti burst significativi. Se il tuo filesystem è piccolo e il tuo pattern di accesso è a picchi, puoi esaurire rapidamente i crediti — monitora la metrica CloudWatch `BurstCreditBalance` per sapere dove sei.

La domanda immediata di Tom fu: "Elastic è più costoso?"

"Dipende dal pattern di utilizzo," disse Leo. "Con Elastic, paghi per la throughput che consumi effettivamente. Con Provisioned, paghi per la throughput che hai specificato anche se non la stai usando."

"Quindi per i carichi di lavoro variabili, Elastic è di solito più economico," disse Tom.

"Di solito," disse Priya. "Controlla i tuoi pattern di throughput effettivi in CloudWatch prima di decidere."

EFS ha anche due modalità di prestazioni: **General Purpose** (bassa latenza, adatta alla maggior parte dei carichi di lavoro, la predefinita) e **Max I/O** (throughput più elevata per carichi di lavoro altamente parallelizzati al costo di una latenza leggermente più elevata). General Purpose gestisce la vasta maggioranza dei casi d'uso. Max I/O è stata progettata per applicazioni che devono eseguire migliaia di operazioni filesystem simultanee — pipeline di elaborazione multimediale su larga scala, flussi di lavoro di calcolo scientifico con molti lettori paralleli.

**EFS vs. S3:** EFS è un filesystem (cartelle, file, permessi, blocco). S3 è
storage di oggetti (upload, download, nessuna semantica filesystem). EFS è molto più costoso
di S3 — circa 0,30 dollari per GB al mese per EFS Standard contro 0,023 dollari per GB al mese
per S3 Standard. Usa S3 per i file che vengono memorizzati e recuperati interi. Usa EFS per i file
che le applicazioni leggono e scrivono attivamente attraverso operazioni filesystem standard.

**Se EBS Allora Una Sola Istanza, Se EFS Allora Molte**

La decisione EBS/EFS si riduce a una domanda: quante istanze devono accedere a questo storage contemporaneamente?

Se costruisci un'applicazione scalata orizzontalmente su EBS, ogni istanza ha il suo disco — ma quando un utente carica un file sull'istanza A, l'istanza B non può vederlo. Va bene per i database (ogni DB ha il suo disco), ma è un problema per i contenuti condivisi. Se hai bisogno di accesso condiviso, EFS è la risposta — ma EFS costa di più per GB rispetto a S3, e ha latenza più elevata rispetto a EBS per l'I/O casuale. La scelta giusta dipende interamente da cosa fa la tua applicazione con i dati.

**Scegliere lo Storage Giusto**

A questo punto hai visto tre tipi di storage in AWS. Rendiamo la decisione chiara.

| Esigenza                                       | Tipo di Storage   |
|------------------------------------------------|-------------------|
| Il database ha bisogno di disco persistente e veloce | EBS (gp3 o io2) |
| Più server hanno bisogno di file condivisi     | EFS               |
| File, backup, immagini, oggetti grandi         | S3                |
| Spazio scratch di calcolo temporaneo           | Instance Store    |
| Archivi a lungo termine al costo minimo        | S3 Glacier        |

Ti starai chiedendo: se EFS consente a più istanze di condividere file, perché non usarlo per tutto? Perché EFS costa significativamente di più per GB rispetto a S3, e ha latenza più elevata rispetto a EBS locale per l'I/O casuale. È lo strumento giusto per l'accesso condiviso al filesystem — non per lo storage generale di file o per lo storage di database.

Prendere questa decisione correttamente è importante. Usare S3 dove hai bisogno di EFS aggiunge
complessità operativa. Usare EBS dove hai bisogno di EFS causa guasti quando scali. Usare
l'instance store dove hai bisogno di persistenza fa perdere dati.

Priya stampò questa tabella e la appese al muro.

"Ogni volta che aggiungiamo un requisito di storage," disse, "partiamo da qui."

Esaminiamo alcuni scenari reali per rendere concreta la decisione:

**Scenario A**: Un job di training machine learning gira su un'istanza EC2 con GPU e deve
leggere un dataset da 200 GB. Il job gira una volta al giorno e dura due ore. Il dataset
è condiviso da più team di ricerca.

Decisione: S3. Il dataset è grande, letto una volta per job e condiviso. S3 è economico, durevole
e accessibile da qualsiasi istanza EC2 o account di qualsiasi team. L'istanza GPU lo legge
tramite l'API S3. Non c'è bisogno di un filesystem qui.

**Scenario B**: Un sito WordPress gira su quattro istanze EC2 dietro un load balancer.
WordPress memorizza i file dei plugin, i file del tema e i caricamenti degli utenti in una directory sul
server. Tutte e quattro le istanze devono leggere e scrivere gli stessi file.

Decisione: EFS. WordPress usa la semantica filesystem — crea directory, scrive
file, legge file per percorso. S3 richiederebbe di riscrivere l'ecosistema dei plugin di WordPress.
EFS si monta come un filesystem NFS standard, con cui WordPress funziona nativamente.

**Scenario C**: Un database PostgreSQL gira su un'istanza EC2. Ha bisogno di I/O casuale veloce
per l'esecuzione di query e le ricerche negli indici.

Decisione: EBS (gp3 o io2). I database hanno bisogno di storage a blocchi con bassa latenza per letture e
scritture piccole e casuali. S3 è troppo lento e non supporta la semantica filesystem.
EFS ha latenza più elevata rispetto a EBS per l'I/O casuale.

Il pattern: il valore predefinito per i file è S3. Aggiungi EBS quando hai bisogno di storage a blocchi per una
specifica istanza. Aggiungi EFS quando più istanze devono condividere un filesystem.
Instance store solo per spazio scratch temporaneo.

## Quando EFS Non Basta: Amazon FSx

La lezione di storage successiva non arrivò come un'interruzione o un dibattito alla lavagna. Arrivò come un contratto di vendita — il tipo che Maya stava inseguendo sin dal lancio del portale, il tipo che aveva richiesto un intero trimestre di demo e chiamate di follow-up per concludere. Tre mesi dopo il lancio del portale per operatori di ristoranti, Nimbus firmò il suo primo cliente multi-sede: Copper Kettle, un gruppo a conduzione familiare di una dozzina di sedi nel midwest. Maya aveva gestito la trattativa. Tom aveva costruito il modello finanziario. Leo aveva iniziato a pianificare l'integrazione tecnica prima ancora che l'inchiostro si asciugasse.

Poi lesse le note infrastrutturali del team IT di Copper Kettle.

"I loro file server sono Windows," disse. "Tutto è Windows. Il loro software di gestione della cucina, il sistema HR, lo strumento di pianificazione — tutto scrive su drive condivise su file server Windows. Protocollo SMB. Autenticazione Active Directory."

"Possiamo portarli su EFS?" chiese Maya.

Leo scosse la testa. "EFS usa NFS. Le loro applicazioni parlano SMB. Sono protocolli diversi. Il software di Copper Kettle non sa cosa sia NFS. Non puoi semplicemente puntarlo a un mount EFS."

"Quindi non possiamo usare EFS."

"Non per questo. C'è un servizio diverso."

**FSx for Windows File Server: EFS, Ma per Windows**

**Amazon FSx for Windows File Server** è un filesystem condiviso completamente gestito e nativo per Windows. Supporta il protocollo SMB (Server Message Block) — lo stesso protocollo che i server Windows, le applicazioni Windows e le condivisioni file Windows on-premises hanno usato per decenni. Si integra con Active Directory, supporta le ACL Windows (permessi a livello di file) e supporta le funzionalità specifiche di Windows da cui le applicazioni Windows dipendono effettivamente.

Pensalo come EFS, ma per Windows — con tutte le funzionalità specifiche di Windows che il tuo ambiente Active Directory già si aspetta. Il software di gestione della cucina di Copper Kettle si connetterebbe ad esso esattamente come si era connesso ai file server on-premises. L'applicazione non cambia. Il protocollo non cambia. I dati vivono semplicemente su un servizio AWS gestito invece che su un server in uno scantinato da qualche parte a Chicago.

Per la migrazione di Copper Kettle: Leo provisionò un filesystem FSx for Windows File Server, lo connesse all'Active Directory di Copper Kettle (esteso ad AWS tramite AWS Managed Microsoft AD) e mappò le lettere dei drive esistenti. Il software di cucina trovò le sue condivisioni di file esattamente dove se le aspettava.

"Quanto costa al mese?" chiese Tom.

Leo aveva già controllato. FSx for Windows è prezzato per GB di storage al mese — più costoso di EFS, significativamente più di S3, ma molto più economico rispetto a mantenere file server Windows su una dozzina di sedi. Tom scrisse il numero senza obiezioni.

**FSx for Lustre: Quando il Tuo Job ML Deve Alimentare Centinaia di GPU**

Nel frattempo, Leo aveva iniziato a prototipare un motore di raccomandazione sul lato — prevedendo quali piatti un cliente avrebbe probabilmente ordinato in base al comportamento passato e a ciò che clienti simili avevano ordinato. I dati di training erano ancora piccoli, ma l'esperimento lo portò a esplorare come i team ML seri alimentano i loro modelli: job di training che leggono centinaia di gigabyte da S3 ad ogni esecuzione.

"Il pattern che continua a emergere nei case study," riportò al pranzo del team successivo, "è job di training in bottleneck sull'I/O. GPU costose inattive il 40% del tempo, in attesa del prossimo batch di dati."

Questo è un problema diverso dallo storage di file condiviso. È un problema di high-performance computing (HPC): quando hai centinaia di unità di elaborazione che devono tutte leggere dati contemporaneamente, ad altissima throughput, dallo stesso dataset.

**Amazon FSx for Lustre** è un'implementazione completamente gestita del filesystem parallelo Lustre. Lustre è progettato appositamente per questo scenario — letture parallele ad altissima throughput, tra molti client simultanei. Si integra nativamente con S3: punti FSx for Lustre a un bucket S3, e rende automaticamente disponibili quei dati attraverso il filesystem Lustre. Il job di training legge da un punto di mount locale; FSx trasmette i dati da S3 dietro le quinte.

Quando il tuo job di training ML ha bisogno di alimentare dati a centinaia di GPU contemporaneamente, FSx for Lustre è lo strumento. Lo stesso vale per la modellazione finanziaria, i carichi di lavoro di genomica e il rendering video — qualsiasi carico di lavoro in cui il bottleneck è la throughput di I/O parallelo piuttosto che la capacità di storage.

Il case study che Leo aveva segnato raccontava la storia in due numeri: dopo aver migrato il job di training su FSx for Lustre, l'utilizzo della GPU era salito dal 60% al 94%, e l'esecuzione di training che aveva richiesto sei ore si completava in tre e mezza. Nimbus non avrebbe avuto bisogno di quel tipo di potenza per molto tempo — ma Leo archiviò il pattern per il giorno in cui il motore di raccomandazione sarebbe cresciuto.

**Le Altre Opzioni FSx**

AWS offre anche **FSx for NetApp ONTAP** — per le aziende che già eseguono storage NetApp on-premises e vogliono accesso multi-protocollo (NFS, SMB e iSCSI dallo stesso filesystem) — e **FSx for OpenZFS**, per i carichi di lavoro che necessitano di funzionalità specifiche di ZFS come snapshot e clone a livello di filesystem. Entrambi sono strumenti specializzati per organizzazioni con infrastrutture esistenti o requisiti specifici.

Per la maggior parte dei team, la decisione è tra le quattro varianti FSx e EFS. La domanda è sempre la stessa: quale protocollo usa il carico di lavoro, e quali caratteristiche di prestazioni richiede?

---

> **Suggerimento per l'Esame — Amazon FSx**
>
> *Dominio SAA-C03: Design di Architetture ad Alte Prestazioni (Dominio 3, Task 3.1)*
>
> - **FSx for Windows = SMB + Active Directory + carichi di lavoro Windows**. I segnali dell'esame: "Windows file server", "protocollo SMB", "integrazione Active Directory", "lift-and-shift di applicazioni Windows". Quando vedi una di queste frasi, FSx for Windows è la risposta.
> - **FSx for Lustre = HPC + training ML + I/O parallelo + integrazione S3**. I segnali dell'esame: "training machine learning", "high-performance computing", "HPC", "filesystem parallelo", "carichi di lavoro intensivi di I/O", "cluster GPU", "integrare il filesystem con S3". Quando vedi queste frasi, FSx for Lustre è la risposta.
> - **EFS non è un sostituto per nessuno dei due.** EFS è NFS per carichi di lavoro Linux. Non parla SMB. Non è un filesystem parallelo ad alte prestazioni. Usare EFS dove è necessario FSx significa che l'applicazione non funziona (Windows) o è in bottleneck di I/O (HPC).
> - **FSx for NetApp ONTAP e FSx for OpenZFS** appaiono meno spesso, ma i segnali sono distintivi. "Migrare storage NetApp/ONTAP esistente", "accesso multi-protocollo (NFS + SMB + iSCSI)" o "SnapMirror" → FSx for NetApp ONTAP. "ZFS", "NFS con snapshot/clone istantanei" o "migrare un file server ZFS on-premises" → FSx for OpenZFS.
> - Riferimento rapido: "SMB o Windows file server" → FSx for Windows. "Training machine learning o high-performance computing" → FSx for Lustre. "NetApp/multi-protocollo" → FSx for ONTAP. "ZFS" → FSx for OpenZFS.

---

## Il Ponte verso il Cloud: AWS Storage Gateway

Il prospect più grande di Nimbus fino ad allora — una catena regionale chiamata Meridian Kitchen, venti sedi in tre stati — portava con sé un problema che non poteva essere risolto con `aws s3 cp`.

Meridian aveva anni di dati operativi che vivevano su file server on-premises. Ricette, fatture, filmati video della cucina, contratti con i fornitori. Non pochi gigabyte. Terabyte. E il software che generava e consumava questi dati — il loro sistema di gestione della cucina, la piattaforma di fatturazione, gli strumenti HR — tutto scriveva su condivisioni file locali usando NFS o SMB. Riscrivere quelle applicazioni non era fattibile. Spostare tutti i dati in una notte nemmeno.

"Quindi come iniziamo a portare i loro dati in AWS," chiese Maya, "senza chiedere loro di cambiare una singola applicazione?"

"C'è un servizio per esattamente questo," disse Priya. "Gira nel loro data center come VM, sembra un normale file server o dispositivo di storage per il loro software esistente, e memorizza silenziosamente tutto in AWS dietro le quinte."

Quel servizio è **AWS Storage Gateway**: un servizio di storage ibrido che connette gli ambienti on-premises allo storage AWS. Presenta lo storage alle tue applicazioni usando i protocolli che già conoscono, mentre persiste effettivamente i dati in S3, S3 Glacier o come snapshot EBS.

Ci sono tre tipi di gateway, ognuno che risolve un diverso problema on-premises.

**File Gateway** presenta un'interfaccia NFS o SMB alle applicazioni on-premises. I file scritti nel gateway vengono memorizzati come oggetti in S3 — ma l'applicazione non lo sa. Vede un filesystem. I file a cui si accede frequentemente vengono memorizzati nella cache locale per letture a bassa latenza; il resto vive in S3. Questo è quello di cui aveva bisogno Meridian: il software di gestione della cucina scrive su quello che sembra una condivisione file, e i dati finiscono in S3 dove Nimbus può analizzarli, eseguirne il backup e ricercarli.

"Aspetta — ma *perché* faremmo così?" chiese Maya. "Perché non puntare direttamente il software a S3?"

Perché NFS e SMB non sono S3. Il software di cucina non parla l'API di S3. Apre percorsi di file. Scrive byte in una directory. File Gateway traduce questo in operazioni sugli oggetti S3 senza che l'applicazione sappia che qualcosa è cambiato.

**Volume Gateway** presenta volumi di storage a blocchi iSCSI ai server on-premises — la stessa interfaccia che presenterebbe un hard disk fisico o un dispositivo SAN. Ha due modalità: i *volumi stored* mantengono i dati primari on-premises con backup asincroni su S3 come snapshot EBS (per i carichi di lavoro on-premises-first che vogliono anche il backup nel cloud), e i *volumi cached* mantengono i dati primari in S3 con i dati a cui si accede frequentemente memorizzati nella cache on-premises (per le organizzazioni pronte a trattare S3 come storage primario).

**Tape Gateway** presenta una virtual tape library (VTL) al software di backup come Veeam, Veritas o NetBackup. Il software di backup scrive su quello che sembra cartucce di nastro fisiche. Quei nastri virtuali vengono memorizzati in S3 e possono essere archiviati in S3 Glacier. Il software di backup non cambia. I robot e gli scaffali di nastri fisici scompaiono.

"Il team di backup di Meridian usa Veeam," disse Leo. "Hanno nastri fisici reali. Storage fuori sede, programmi di rotazione, tutto quanto."

"Tape Gateway sostituisce i nastri fisici," disse Priya. "Stessa configurazione Veeam. Stessi job di backup. I nastri vivono semplicemente in S3 invece che in un rack."

Tom cercò il costo dello storage di nastri fuori sede. Chiuse quella scheda senza commentare e approvò il piano di migrazione.

---

> **Suggerimento per l'Esame — AWS Storage Gateway**
>
> *Dominio SAA-C03: Design di Architetture ad Alte Prestazioni (Dominio 3)*
>
> - **File Gateway = NFS/SMB → S3.** I file scritti dalle applicazioni on-premises diventano oggetti S3. I file a cui si accede frequentemente vengono memorizzati nella cache locale. Segnale dell'esame: "l'applicazione on-premises deve memorizzare file in S3 senza modifiche al codice."
> - **Volume Gateway = storage a blocchi iSCSI → snapshot S3.** Modalità stored: dati primari on-premises, backup in S3 come snapshot EBS. Modalità cached: dati primari in S3, blocchi a cui si accede frequentemente memorizzati nella cache locale. Segnale dell'esame: "il server on-premises ha bisogno di storage a blocchi con backup nel cloud."
> - **Tape Gateway = VTL → S3/Glacier.** Il software di backup scrive su nastri virtuali; i nastri vengono memorizzati in S3 o archiviati in Glacier. Segnale dell'esame: "sostituire l'infrastruttura di backup su nastro fisico senza cambiare il software di backup."
> - **Pattern chiave dell'esame:** "l'applicazione on-premises ha bisogno di storage nel cloud senza modifiche al codice" → Storage Gateway. "Sostituire il backup su nastro" → Tape Gateway specificamente.

---

## Spostare Dati in Blocco: DataSync e la Snow Family

Storage Gateway mantiene le applicazioni on-premises *continuamente connesse* allo storage cloud. Ma altri due scenari di migrazione appaiono costantemente nell'esame — e alla fine anche in progetti reali:

**AWS DataSync** è per il *trasferimento bulk online*: spostare grandi dataset sulla rete tra file server NFS/SMB on-premises (o altri cloud) e S3, EFS o FSx — una volta sola o secondo una pianificazione. Gestisce la parallelizzazione, la verifica dell'integrità, i tentativi e la limitazione della larghezza di banda, ed è circa 10 volte più veloce degli script rsync fatti a mano. Segnale dell'esame: "migrare/trasferire milioni di file da un server NFS on-premises ad Amazon EFS/S3" → DataSync. (Non confonderlo con Storage Gateway, che è per *l'accesso ibrido continuo*, o DMS, che migra *database*.)

**La AWS Snow Family** è per quando la rete è il collo di bottiglia. Spostare 100 TB su una linea da 100 Mbps richiede più di tre mesi; un camion è più veloce. **Snowball Edge** è un apparecchio robusto che AWS ti spedisce — carica fino a circa 80 TB localmente, rispediscilo, AWS lo importa in S3. **Snowcone** era la versione piccola e portatile (circa 8-14 TB) per le location periferiche — dismessa alla fine del 2024, anche se potrebbe ancora apparire in domande d'esame precedenti (vedi il controllo della realtà nel Capitolo 25). Segnale dell'esame matematico: quando il testo fornisce la dimensione di un dataset e un collegamento sottile o inaffidabile e chiede la migrazione più veloce/pratica, calcola il tempo di trasferimento — se sono settimane o mesi, la risposta è la Snow Family.

> **Suggerimento per l'Esame — AWS Backup**
>
> Un altro servizio che collega questo capitolo: **AWS Backup** centralizza e automatizza i backup su EBS, EFS, RDS, DynamoDB, FSx e Storage Gateway con un unico piano di backup — pianificazioni, retention, copie cross-region e cross-account, e Backup Vault Lock per l'immutabilità. Segnale dell'esame: "gestire centralmente i backup su più servizi/account AWS" → AWS Backup, non script per singolo servizio.

## Punti di Forza e Limitazioni

**Punti di forza di EBS**:

- Storage a blocchi persistente e veloce per EC2
- Snapshot per backup e ripristino point-in-time
- Più livelli di prestazioni per diversi carichi di lavoro
- Crittografia a riposo supportata nativamente — abilita la crittografia predefinita a livello di account

**Limitazioni di EBS**:

- Collegato a una sola istanza alla volta (con eccezioni minori)
- Nella stessa AZ dell'istanza EC2 (copiare in un'altra AZ richiede uno snapshot)
- Si paga per lo storage provisionato, non solo per quello che si usa
- Crittografare un volume non crittografato esistente richiede un ciclo snapshot-copia-restore con una finestra di manutenzione

**Punti di forza di EFS**:

- Filesystem condiviso multi-istanza — protocollo NFS nativo
- Scala automaticamente, non è necessario provisionare la capacità
- Accessibile tra AZ all'interno di una Region
- La modalità Elastic Throughput si adatta automaticamente al carico di lavoro

**Limitazioni di EFS**:

- Più costoso di S3 per GB
- Latenza più elevata rispetto a EBS per l'I/O casuale

## Riepilogo

La penna rossa di Tom aveva cerchiato il vero problema: troppo su una sola macchina. Spostare lo storage fuori dall'istanza EC2 non riguarda solo la capacità — si tratta di separare le responsabilità in modo che ogni layer possa essere gestito, scalato e protetto in modo indipendente. La scelta dello storage giusta dipende da quattro domande: chi ha bisogno dello storage, quante cose ne hanno bisogno contemporaneamente, quanto tempo deve vivere e come vi si accede? Queste quattro domande portano costantemente alla risposta giusta.

- **EBS** (Elastic Block Store) è uno storage a blocchi persistente per una singola istanza EC2. Sopravvive agli arresti delle istanze e può essere snapshotted per il backup. Usa gp3 per i carichi di lavoro generali, io2 per i requisiti di IOPS elevati. L'instance store è temporaneo e veloce ma viene perso quando l'istanza termina.
- **EFS** (Elastic File System) è un filesystem di rete condiviso che più istanze possono montare contemporaneamente. EFS si estende tra AZ all'interno di una Region; EBS è vincolato a una singola AZ.
- Abbina il tipo di storage al requisito: database EC2 singolo → EBS; file condivisi tra server → EFS; oggetti, media, backup → S3; archivi → S3 Glacier.
- Crittografare un volume EBS esistente richiede: snapshot → copia crittografata → nuovo volume → sostituzione. Abilita la crittografia predefinita a livello di account per evitare di creare volumi non crittografati accidentalmente.
- **"Delete on Termination" di EBS**: i volumi root vengono eliminati per impostazione predefinita alla terminazione dell'istanza; i volumi dati persistono per impostazione predefinita. Rivedi entrambe le impostazioni quando progetti le policy del ciclo di vita delle istanze.

## Suggerimenti per l'Esame

*SAA-C03 Dominio 3 — Task 3.1 (soluzioni di storage)*

- **I volumi EBS vivono in una sola AZ.** Possono essere collegati solo a un'istanza nella
  stessa AZ. Per usare un volume EBS in una AZ diversa, crei uno snapshot e lo ripristini
  nella AZ di destinazione.
- **Gli snapshot EBS sono incrementali e memorizzati in S3.** Il primo snapshot è completo;
  i successivi memorizzano solo le modifiche. Puoi copiare gli snapshot in altre Region per
  il disaster recovery.
- **EFS è cross-AZ.** Più istanze in diverse AZ all'interno della stessa Region
  possono montare lo stesso filesystem EFS. Questo è un differenziatore chiave rispetto a EBS.
- **Quando uno scenario d'esame dice "applicazione web con contenuti condivisi" o "più
  istanze che accedono agli stessi file", pensa a EFS.** Quando dice "storage per database"
  o "disco persistente per un server", pensa a EBS.
- **I dati dell'instance store sopravvivono a un riavvio ma non a un arresto o una terminazione.** Una domanda
  potrebbe descrivere dati che "scompaiono dopo che l'istanza viene arrestata" — è l'instance
  store in gioco.
- **gp3 vs. io2**: gp3 è il valore predefinito per uso generale; io2 è per i carichi di lavoro che
  necessitano di IOPS garantiti (grandi database, sistemi mission-critical). Gli scenari d'esame
  che descrivono "requisiti IOPS" o "prestazioni del database a bassa latenza costante"
  puntano verso io2.
- **gp2 vs. gp3:** gli IOPS di gp2 sono accoppiati alle dimensioni (3 IOPS/GB, max 16.000 IOPS a 5.334 GB); gli IOPS di gp3 sono indipendenti dalle dimensioni (3.000 base, configurabile fino a 80.000 da settembre 2025 — il materiale più vecchio, e possibilmente il banco di domande dell'esame, assume ancora il precedente limite di 16.000). Pattern di domanda d'esame: un carico di lavoro ha bisogno di più IOPS senza aumentare lo storage — la risposta è gp3 o io2, non gp2.
- **Crittografia a riposo per EBS**: Non puoi crittografare un volume non crittografato esistente
  sul posto — devi fare lo snapshot, copiarlo crittografato, ripristinarlo. Abilita le impostazioni predefinite di
  crittografia a livello di account per evitare di creare volumi non crittografati accidentalmente. La crittografia è AES-256
  usando chiavi KMS.
- **Fast Snapshot Restore** elimina la penalità di prestazioni sui volumi appena ripristinati
  ma costa denaro per snapshot per AZ. Le domande d'esame sul ripristino di volumi
  "immediatamente a piena prestazione" puntano a FSR.
- **Modalità di prestazioni EFS**: General Purpose (bassa latenza, adatta alla maggior parte dei carichi di lavoro)
  vs. Max I/O (throughput più elevata per carichi di lavoro altamente parallelizzati).
- **Modalità di throughput EFS — tre opzioni:** Bursting (la throughput scala con la dimensione dello storage, usa crediti burst — buona per carichi di lavoro a picchi), Elastic (auto-scala, pagamento per utilizzo — buona per carichi di lavoro imprevedibili), Provisioned (throughput fissa indipendentemente dallo storage — buona per esigenze di throughput elevata e costante). L'esame verifica se sai quando provisionare la throughput vs. lasciarla scalare elasticamente o affidarsi ai crediti burst.
- **Copia snapshot cross-region**: gli snapshot EBS possono essere copiati in altre Region per
  il disaster recovery. Lo snapshot copiato è indipendente e non aggiunge costi di trasferimento dati durante il restore — solo durante l'operazione di copia stessa.
- **Tipi di Storage Gateway:** File Gateway = NFS/SMB → S3 (i file diventano oggetti). Volume Gateway = storage a blocchi iSCSI → snapshot S3 (stored: primario on-prem; cached: primario in S3). Tape Gateway = VTL → S3/Glacier (sostituisce i nastri fisici). Segnale dell'esame: "l'app on-premises ha bisogno di storage nel cloud senza modifiche al codice" → Storage Gateway. "Sostituire il backup su nastro" → Tape Gateway.

## Esercizi

**Esercizio 1 — Ricordo**

In parole tue: qual è la differenza tra EBS e EFS? Quando sceglieresti
uno rispetto all'altro?

*(Suggerimento: Pensa all'analogia del capitolo — un hard disk esterno collegato a un solo
laptop versus il classificatore condiviso che tutto l'ufficio può raggiungere.)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: Un'azienda gestisce un'applicazione web su quattro istanze EC2 dietro un load
balancer. Gli utenti possono caricare foto del profilo. Qualsiasi foto deve essere visualizzabile dagli utenti
immediatamente dopo il caricamento, indipendentemente dall'istanza che l'ha gestita. Le foto vengono
servite ai browser via HTTP, non vengono mai modificate sul posto, e il team vuole la
soluzione PIÙ conveniente e scalabile con il minimo overhead operativo.

Quale soluzione di storage soddisfa MEGLIO i loro requisiti?

A) Collegare un volume EBS gp3 a ciascuna istanza EC2 e sincronizzare i file tra di esse usando
   un cron job  
B) Memorizzare le foto direttamente nell'instance store dell'istanza EC2  
C) Usare Amazon EFS, montato su tutte e quattro le istanze EC2 contemporaneamente  
D) Memorizzare le foto in S3 e accedervi direttamente dal codice dell'applicazione

**Suggerimento 1**: Il requisito è "tutte e quattro le istanze devono servire qualsiasi foto". Quali opzioni
rendono un file immediatamente visibile a tutte le istanze?

**Suggerimento 2**: L'instance store è effimero. EBS non può essere montato su più istanze
contemporaneamente. Questo restringe le opzioni.

**Suggerimento 3**: Sia C che D potrebbero teoricamente funzionare. Quale è più appropriata per un
caso in cui l'applicazione ha bisogno di accedere alle foto tramite operazioni filesystem vs.
richieste HTTP?

**Risposta**: D

**Spiegazione**: Memorizzare le foto in S3 e servirle tramite URL è la scelta architettonicamente
corretta per un'applicazione web. Le foto caricate sono immediatamente accessibili da
qualsiasi server (e da qualsiasi browser) tramite l'URL di S3. S3 è progettato esattamente per questo
caso d'uso: memorizzare file caricati dagli utenti su larga scala con alta disponibilità e zero
overhead di gestione.

Nota: C (EFS) funzionerebbe tecnicamente, ma S3 è il pattern preferito per i file binari
caricati dagli utenti nelle applicazioni web perché è più economico, più scalabile e serve i file
direttamente via HTTP senza che l'applicazione faccia da proxy.

**Perché non A?** Sincronizzare i file tramite cron job crea race condition e problemi di consistenza.
Tra i caricamenti e la prossima sincronizzazione, i file mancherebbero sulle altre istanze.

**Perché non B?** I dati dell'instance store vengono persi quando l'istanza viene arrestata o terminata.
Le foto sparirebbero.

**Perché non C?** EFS è la risposta giusta quando la domanda richiede la semantica del filesystem
(es. un CMS che modifica i file sul posto). Per le foto degli utenti servite sul
web, S3 è più semplice, più economico e più appropriato.

**Avvertenza sulle parole chiave dell'esame**: nel vero esame, leggi il testo letteralmente. Se dice
"storage **file** condiviso", "file system", "NFS" o "POSIX", la risposta chiave è
**EFS** — non sovrascrivere il requisito dichiarato con il gusto architetturale. Questo
scenario punta a S3 perché chiede la distribuzione di oggetti cost-effective via HTTP,
non un file system.

*Dominio SAA-C03 3 — Task 3.1*

**Esercizio 3 — Sfida di Architettura** *(Opzionale)*

Nimbus sta aggiungendo una nuova funzionalità: i proprietari di ristoranti possono caricare menu PDF che vengono
poi analizzati e usati per popolare il database di Nimbus. Il job di elaborazione PDF gira
su una flotta di istanze EC2 che devono: (a) leggere il PDF caricato, (b) scrivere
file di elaborazione temporanei, (c) scrivere l'output analizzato.

Quali servizi di storage useresti per ciascuno di questi tre passaggi, e perché?

*(Non esiste una risposta corretta unica. Concentrati sull'abbinamento del tipo di storage alle
caratteristiche di ciascun passaggio.)*

## Scena Post-Crediti

Quel pomeriggio, Nimbus separò correttamente il proprio storage. Il database ottenne il suo
volume EBS con snapshot automatici e crittografia abilitata. Le foto dei menu furono spostate su S3. L'istanza EC2
finalmente aveva spazio per respirare.

Leo eseguì un test di carico. Il sito gestì duecento utenti concorrenti senza
battere ciglio.

"Andrà bene da qui in poi," disse, guardando i grafici stabilizzarsi dolcemente.

Tom guardò la bolletta. Il volume EBS stava aggiungendo 8 dollari al mese. Lo annotò.

"Continuo ad aggiungere cose a questa bolletta," disse. "Quando si equilibra?"

"Quando smettiamo di avere interruzioni," disse Maya. "Ogni interruzione costa più della prevenzione."

Tom non sembrava convinto. Lo sarebbe stato, alla fine.

Tre giorni dopo, un proprietario di ristorante sulla piattaforma tentò di effettuare un ordine e ricevette
un errore. Maya controllò i log.

Il database c'era. L'applicazione era in esecuzione. Ma venti utenti simultanei stavano
tutti cercando di leggere il menu contemporaneamente, e ognuno stava interrogando il database.

"Ogni caricamento di pagina è una query al database," disse Leo. "Ogni. Singola. Una."

Priya stava già cercando su Google qualcosa.

Nel prossimo capitolo: cosa succede quando arrivano più clienti di quanti il server possa gestire.
