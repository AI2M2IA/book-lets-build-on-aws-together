# Capitolo 23: Il Sistema di Archiviazione Che Si Ordina da Solo

Uno studio legale conserva i fascicoli dei casi attivi sulla scrivania. I casi conclusi vanno in un armadio archivio. I casi di tre anni fa vanno in scatole di immagazzinamento nel seminterrato. I casi di dieci anni fa vanno in una struttura di archiviazione esterna che costa pochi centesimi per scatola ma richiede due giorni per recuperare qualsiasi cosa.

La stessa informazione, conservata a costi diversi in base alla frequenza con cui viene acceduta.

---

Con l'automazione del workflow in atto e il flusso degli ordini finalmente stabile, Tom era tornato alla sua revisione dei costi. La fattura S3 era rimasta in fondo alla sua testa fin dal trimestre precedente — una di quelle voci che continuava a crescere senza che nessuno la guardasse direttamente. Finalmente aveva tempo di guardarla.

Chiamò Leo.

"Abbiamo 4,2 terabyte in S3," disse Leo dopo aver controllato.

"Di cosa?"

"Foto dei ristoranti. Ricevute d'ordine. Esportazioni di analisi. Snapshot di backup di 18 mesi fa."

"Quando è stata l'ultima volta che qualcuno ha acceduto a un backup di 18 mesi fa?"

Leo controllò i log di accesso.

"Lo scorso ottobre," disse. "Una volta. Per verificare il formato del backup."

"Quindi stiamo pagando per 18 mesi di backup ai prezzi interi di S3 Standard."

"Sì."

"Quanto costa al mese — Glacier vs Standard?" chiese Tom, già aprendo la pagina dei prezzi.

S3 Standard: $0,023 per GB al mese. S3 Glacier Instant Retrieval: $0,004 per GB al mese.

Tom fece i calcoli.

"Potremmo ridurre significativamente questa bolletta," disse, "semplicemente spostando i dati vecchi in uno storage più economico."

"Dovremmo sapere cosa è vecchio," disse Leo.

"S3 sa quanto è vecchio ogni oggetto. Le lifecycle rule funzionano sull'età — e se abbiamo bisogno dei pattern di accesso effettivi, Intelligent-Tiering e Storage Class Analysis li tracciano."

**Classi di Storage S3: Lo Spettro Completo**

Il capitolo 5 ha introdotto S3 Standard come classe di storage primaria. S3 ha in realtà otto classi di storage, ognuna progettata per pattern di accesso diversi (l'ottava, **S3 Express One Zone**, è una classe specializzata a singola AZ per workload critici per la latenza e appare raramente al di fuori di scenari ad alte prestazioni):

**S3 Standard**: Per i dati accessibili frequentemente. Bassa latenza (millisecondi). Costo più alto. Nessuna durata minima di storage. Usalo per i dati attivi: le foto del menu correnti, gli ordini di oggi, i log recenti.

**S3 Standard-Infrequent Access (S3 Standard-IA)**: Per i dati accessibili meno di una volta al mese. La stessa latenza di millisecondi di Standard, ma costo di storage inferiore + tariffa di recupero per GB. Durata minima di storage di 30 giorni. Usalo per i dati di cui hai bisogno immediatamente quando li accedi, ma raramente lo fai: ricevute d'ordine più vecchie, esportazioni di analisi di 6 mesi.

**S3 One Zone-Infrequent Access (S3 One Zone-IA)**: Come S3 Standard-IA (incluso il minimo di 30 giorni) ma conservato in una sola Zona di Disponibilità (invece di tre). Meno durevole (se quella AZ subisce un disastro, i dati possono andare persi), ma il 20% più economico. Usalo per i dati che possono essere ricreati se persi: cache delle miniature, output di elaborazione temporanei.

**S3 Glacier Instant Retrieval**: Dati archiviati di cui hai bisogno occasionalmente. Recupero in millisecondi. Costo di storage molto basso, costo di recupero per GB più alto. Durata minima di storage di 90 giorni. Usalo per i dati accessibili una volta per trimestre o meno: rapporti di conformità trimestrali, snapshot di backup di 12 mesi.

**S3 Glacier Flexible Retrieval**: Archivio profondo, recuperato in minuti o ore. Costo inferiore rispetto a Glacier Instant Retrieval. Usalo per i dati di archiviazione con meno urgenza.

**S3 Glacier Deep Archive**: Opzione a costo più basso. Recuperato in 12 ore. Durata minima di storage di 180 giorni. Usalo per i dati che devono essere conservati per la conformità normativa ma non si prevede vengano mai accessibili: registri fiscali di 7 anni, log di audit di 10 anni.

Il pattern: man mano che la frequenza di accesso diminuisce, il costo diminuisce ma il tempo di recupero aumenta (e il costo per recupero aumenta). Scegli la classe che corrisponde al tuo pattern di accesso.

**Lifecycle Policy S3: Il Sistema di Archiviazione Automatizzato**

Spostare manualmente i file tra le classi di storage è soggetto a errori e richiede tempo. Le **lifecycle policy** S3 automatizzano questo in base alle regole che definisci.

Una lifecycle rule ha due componenti:

**Filtro**: A quali oggetti si applica la regola (tutti gli oggetti, oggetti con un prefisso specifico, oggetti con tag specifici).

**Azioni**: Cosa fare, dopo quanti giorni.

Esempio di lifecycle policy per le ricevute d'ordine di Nimbus:

```
Transition to S3 Standard-IA after 90 days
Transition to S3 Glacier Instant Retrieval after 365 days
Transition to S3 Glacier Flexible Retrieval after 540 days (18 months)
Transition to S3 Glacier Deep Archive after 2555 days (7 years)
Delete after 2920 days (8 years)
```

Questa singola policy garantisce:

- Ricevute attive (< 90 giorni): S3 Standard, accesso rapido
- Ricevute recenti (90-365 giorni): Standard-IA, economico ma disponibile istantaneamente
- Ricevute più vecchie (da 1 anno a 18 mesi): Glacier Instant, molto economico, millisecondi quando necessario
- Ricevute storiche (da 18 mesi a 7 anni): Glacier Flexible, ancora più economico — il recupero richiede ore, non millisecondi
- Ricevute scadute (> 8 anni): Eliminate automaticamente

Un problema quasi ha fatto deragliare il piano. Dalla fine del 2024, le lifecycle rule **non spostano per impostazione predefinita gli oggetti più piccoli di 128 KB** — e le ricevute di Nimbus avevano una media di 18 KB ciascuna. Per far sì che la policy le spostasse effettivamente, Leo dovette sovrascrivere la dimensione minima dell'oggetto predefinita sulla regola (i filtri delle lifecycle rule possono anche selezionare per dimensione con `ObjectSizeGreaterThan`/`ObjectSizeLessThan`). L'impostazione predefinita esiste per una buona ragione: le classi di archivio fatturano ~40 KB di overhead di metadati per oggetto e ogni transizione costa una tariffa di richiesta, quindi per milioni di oggetti piccoli la transizione può costare più di quanto risparmia. Leo fece i calcoli per le ricevute — con una conservazione di sette anni, era comunque conveniente.

Tom rivide i risparmi previsti: da $847/mese a circa $220/mese.

"Semplicemente... definendo cosa è vecchio e dove dovrebbe andare?" disse.

"E S3 lo sposta automaticamente," confermò Leo. "Nessun cron job. Nessuna migrazione manuale. Nessuno che lo dimentica."

"Aspetta — ma *perché* S3 non lo fa di default?" chiese Maya dall'altra parte della stanza. "Perché devi definire una policy?"

"Perché 'vecchio' è diverso per ogni bucket," disse Leo. "Un archivio di conformità e un upload di foto hanno bisogno di regole di conservazione completamente diverse. S3 non può indovinare quale è quale."

Potresti chiederti: cosa succede se i dati sbagliati vengono spostati in Glacier e ne hai urgente bisogno? Pagheresti una tariffa di recupero e aspetteresti — ecco perché dovresti testare le tue lifecycle rule su un bucket piccolo e non critico prima di procedere, e verificare i log di accesso prima di distribuirle ai dati di produzione. Un errore di recupero su 18 mesi di backup costerebbe molto meno di un incidente rivolto ai clienti, ma vale comunque la pena testare prima.

Se il pattern di accesso dei tuoi dati è prevedibile (i log sono sempre freddi dopo 30 giorni), usa lifecycle rule esplicite — sono più convenienti della tariffa di monitoraggio per oggetto di Intelligent-Tiering. Se i tuoi pattern di accesso cambiano nel tempo o sono difficili da prevedere, usa Intelligent-Tiering — ma sappi che ignora semplicemente gli oggetti più piccoli di 128 KB: non vengono monitorati, non viene addebitata la tariffa di monitoraggio e non lasciano mai il livello di Accesso Frequente.

**S3 Intelligent-Tiering: La Classe Auto-Organizzata**

E se non sai quanto spesso accederai ai tuoi dati?

**S3 Intelligent-Tiering** monitora i pattern di accesso per ogni oggetto e lo sposta automaticamente tra i livelli di accesso:

- **Livello di Accesso Frequente**: Per gli oggetti accessibili di recente
- **Livello di Accesso Non Frequente**: Oggetti non accessibili per 30 giorni
- **Livello di Accesso Istantaneo all'Archivio**: Oggetti non accessibili per 90 giorni
- **Livello di Accesso all'Archivio**: Oggetti non accessibili per 90-730 giorni (opzionale)
- **Livello di Accesso all'Archivio Profondo**: Oggetti non accessibili per 180-730+ giorni (opzionale)

S3 Intelligent-Tiering addebita una piccola tariffa di monitoraggio per oggetto al mese ($0,0025 per 1.000 oggetti), ma nessuna tariffa di recupero per i livelli Frequente e Non Frequente.

Usa Intelligent-Tiering quando:

- I pattern di accesso sono imprevedibili o cambiano nel tempo
- Hai un mix di dati caldi e freddi che non puoi facilmente classificare
- Hai oggetti più grandi di 128 KB (gli oggetti più piccoli non vengono monitorati né suddivisi automaticamente in livelli)

Usa classi di storage esplicite (con lifecycle policy) quando:

- I pattern di accesso sono prevedibili
- Vuoi che ogni oggetto — inclusi quelli piccoli — venga effettivamente spostato in classi più economiche
- Gli oggetti sono piccoli (< 128 KB)

La nota sugli oggetti piccoli merita enfasi. Nimbus aveva 2,3 milioni di oggetti ricevuta d'ordine in S3 — ognuno era un piccolo file JSON, con una media di circa 18 KB. Tom aveva inizialmente considerato Intelligent-Tiering per il bucket delle ricevute, finché non lesse le note in piccolo.

Gli oggetti più piccoli di 128 KB **non vengono monitorati e non vengono suddivisi automaticamente in livelli** in Intelligent-Tiering. Non pagano la tariffa di monitoraggio ($0,0025 per 1.000 oggetti al mese) — ma non si spostano mai: rimangono nel livello di Accesso Frequente, ai prezzi equivalenti a Standard, per sempre.

Quindi per le ricevute da 18 KB, Intelligent-Tiering non avrebbe costato a Nimbus niente in più — semplicemente non avrebbe *fatto* niente. 2,3 milioni di ricevute fredde avrebbero continuato a pagare i prezzi dello storage caldo ($0,023/GB) indefinitamente, mentre i livelli Archivio ($0,00099/GB) sarebbero rimasti fuori portata.

"Quindi Intelligent-Tiering è progettato per oggetti grandi," disse Maya.

"O per workload dove genuinamente non conosci il pattern di accesso," disse Tom. "Per un bucket di file piccoli dove sappiamo che le ricevute sono calde per 90 giorni e fredde dopo, una lifecycle rule esplicita — con la sovrascrittura degli oggetti piccoli di prima — è l'unica cosa che le sposta effettivamente."

Intelligent-Tiering è un ottimo servizio. Non è solo lo strumento giusto per ogni bucket: al di sotto della soglia di 128 KB è innocuo ma inutile, e solo le lifecycle rule esplicite (con una sovrascrittura della dimensione) classificheranno gli oggetti piccoli in livelli.

**Quando Hai Effettivamente Bisogno dei Dati: Una Storia di Recupero da Glacier**

Tre mesi dopo il deployment delle lifecycle policy, Nimbus ricevette una notifica legale. Un ex partner ristoratore stava contestando un termine contrattuale, e i legali di Nimbus avevano bisogno di 18 mesi di record degli ordini per quel partner — tutto dall'apertura fino alla chiusura del contratto.

"E se qualcuno cercasse di intromettersi attraverso il processo di discovery legale?" disse Priya. Non stava scherzando. "I legali che richiedono esportazioni di dati in blocco sono un vettore comune di social engineering. Verifica che la richiesta sia legittima prima di aprire qualsiasi archivio dati."

La richiesta era legittima. I record erano in S3, distribuiti su tre classi di storage: i 90 giorni più recenti in Standard-IA, l'anno precedente in Glacier Instant Retrieval, il resto in Glacier Flexible Retrieval (la lifecycle policy aveva usato Flexible per i dati con più di 18 mesi).

I record Glacier Instant erano immediatamente disponibili. Leo filtrò per ID ristorante, eseguì una query Athena per identificare i record degli ordini corrispondenti e li esportò in una posizione S3 sicura. Cinque minuti di lavoro.

I record Glacier Flexible richiedevano una richiesta di restore:

```bash
aws s3api restore-object \
    --bucket nimbus-order-receipts \
    --key "2022/06/restaurant-47/" \
    --restore-request '{"Days":7,"GlacierJobParameters":{"Tier":"Standard"}}'
```

Glacier Flexible Retrieval **livello Standard**: 3-5 ore. I record sarebbero stati disponibili come copia temporanea in S3 Standard per 7 giorni, poi rimossi automaticamente. La copia archiviata originale rimane in Glacier.

Costo dell'intero recupero: $0,01 per GB recuperato al livello Standard, per 4,2 GB di record archiviati. Circa quattro centesimi. (Il livello Expedited — da 1 a 5 minuti — costa $0,03 per GB, ma la sua disponibilità non è garantita come quella di Standard.)

"Quattro centesimi," disse Maya, quando Leo riferì. "Per 18 mesi di record."

"Abbiamo conservato 4,2 GB a $0,0036 per GB al mese per un anno e mezzo," disse Leo. "Il costo di storage è stato di circa ventisette centesimi in totale. Il costo di recupero era quattro. Contro $1,74 se li avessimo tenuti in S3 Standard per 18 mesi."

"E l'unica cosa che contava," disse Priya, "era che ricordavamo che erano in Flexible Retrieval e avevamo pianificato l'attesa di 3-5 ore. Se i legali avessero avuto bisogno di questi dati in 30 minuti, avremmo avuto un problema."

Questa è la lezione operativa importante su Glacier: non è solo una decisione di costo, è una decisione di SLA per il recupero. Prima di archiviare i dati in Glacier Flexible o Deep Archive, documenta il tempo di recupero per chiunque potrebbe averne bisogno. "I dati esistono" e "possiamo ottenerli in 30 minuti" sono due garanzie diverse.

**Multipart Upload: Per Oggetti Grandi**

S3 ha un limite di upload singolo di 5 GB. Per oggetti più grandi, devi usare il **multipart upload**: dividi l'oggetto in parti, carica ciascuna in parallelo e S3 le assembla.

Vantaggi:

- Upload più veloci (paralleli)
- Possibilità di riprendere gli upload falliti (ricarica solo le parti fallite)
- Richiesto per oggetti > 5 GB

Suggerimento sulle lifecycle rule: imposta una lifecycle rule per eliminare i multipart upload incompleti dopo 7 giorni. Se un upload fallisce a metà e non viene ripulito, queste parti parziali vengono conservate e fatturate — senza un oggetto assemblato da mostrare.

Tom apprezzò enormemente questo suggerimento.

Eseguì il comando AWS CLI per elencare i multipart upload incompleti in tutti i bucket di Nimbus:

```bash
aws s3api list-multipart-uploads --bucket nimbus-restaurant-photos
```

L'output era più lungo di quanto si aspettasse. Lo passò a un contatore.

340 upload incompleti. Il più vecchio risaliva a 8 mesi prima — il load test di Leo del flusso di upload delle foto del ristorante. Il load test aveva generato centinaia di upload parziali, nessuno dei quali era stato completato (il test non era stato progettato per completarli, solo per testare l'endpoint di avvio). 340 upload incompleti, seduti in S3, ognuno che rappresentava dati parziali che AWS stava conservando e fatturando.

"Quanto costa al mese?" disse Tom. Non stava chiedendo informazioni. Stava calcolando ad alta voce.

La dimensione combinata delle parti incomplete: 48 GB. A $0,023/GB: $1,10/mese. Per otto mesi: $8,80 già spesi.

Al ritmo di crescita attuale, se non venisse pulito: continuando indefinitamente.

"Leo," disse Tom.

"L'ho già deployato — oh," disse Leo, avvicinandosi. "Il load test. Mi sono dimenticato di ripulire gli upload parziali."

"Otto mesi fa."

"Non sapevo che S3 conservasse le parti anche se l'upload non si completa mai."

"Le conserva. Le fattura. E non esiste un avviso nel dashboard a riguardo. Si accumulano e basta."

La soluzione: una lifecycle rule per eliminare le parti di multipart upload incomplete dopo 7 giorni.

```
Rule: Delete incomplete multipart upload parts
Prefix: (all objects)
Action: Delete incomplete multipart uploads after 7 days
```

I 340 upload esistenti furono ripuliti manualmente. La lifecycle rule garantisce che nessun futuro load test o upload fallito si accumuli allo stesso modo. Il $1,10/mese che si stava costruendo silenziosamente da otto mesi si fermò — piccolo in dollari, ma il pattern (invisibile, in crescita, illimitato) era la parte che valeva la pena eliminare.

"La regola sono tre righe," disse Tom. "Avrei dovuto impostarla su ogni bucket alla creazione." Aggiornò la checklist di creazione dei bucket: ogni nuovo bucket S3 ottiene per default una lifecycle rule di pulizia dei multipart upload.

**Tre Livelli di Sicurezza: Un Rapido Riepilogo Prima della Digressione**

"E se qualcuno cercasse di intromettersi e cancellare i log di audit?" chiese di nuovo Priya — questa volta nel contesto di un threat model specifico. "Non solo una lifecycle rule mal configurata. Un insider malintenzionato. Una chiave IAM compromessa con accesso in scrittura."

Il team aveva già le risposte — le aveva solo applicate a questo bucket. Tre livelli, ciascuno trattato precedentemente nel libro, ciascuno che affronta un diverso vettore di minaccia:

Il **versioning** (capitolo 5) rende le eliminazioni reversibili — un DELETE diventa un delete marker e le versioni precedenti rimangono ripristinabili. Per i dati write-once come le ricevute d'ordine, l'overhead di storage è minimo: c'è sempre solo una versione per oggetto.

**S3 Object Lock** (capitolo 5) rende gli oggetti veramente immutabili — storage WORM che nemmeno una chiave admin può eliminare durante il periodo di conservazione. Per le ricevute, con il loro requisito di conservazione fiscale di 7 anni, il team scelse la modalità Compliance: nessuna lifecycle rule mal configurata, nessun errore IAM, nessuna credenziale compromessa può rimuoverle prima che l'auditor le chieda. E Object Lock coesiste con le transizioni lifecycle — una regola che sposta le ricevute in Glacier Deep Archive funziona ancora; i dati diventano più economici e rimangono immutabili.

Gli **eventi di dati S3 di CloudTrail** (capitoli 16-17) dicono cosa è successo ai dati: ogni GET, PUT, DELETE e COPY registrato con chi, da dove e quando — il materiale grezzo che GuardDuty (capitolo 17) usa per avvisare sulle anomalie.

"Versioning per il recupero dagli incidenti. Object Lock per l'immutabilità di conformità. CloudTrail per la forensica," riassunse Priya. "Abbiamo trattato ciascuno di questi singolarmente. La nuova decisione oggi è abilitare tutti e tre per questo bucket."

**Cross-Region Replication: I Record degli Ordini come Disaster Recovery**

Il bucket delle ricevute d'ordine di Nimbus era in us-west-2. Era intenzionale — us-west-2 era dove girava l'applicazione. Ma "l'applicazione è in us-west-2" e "tutti i record degli ordini sono solo in us-west-2" sono profili di rischio diversi.

Se Nimbus avesse dovuto attivare un sito di disaster recovery in us-east-1, i record degli ordini avrebbero dovuto essere lì anche. Aspettare di copiarli nel mezzo di un fallimento regionale non è un piano di recovery.

Priya raccomandò la **Cross-Region Replication (CRR)** per il bucket delle ricevute d'ordine. La regola:

```
Source: nimbus-order-receipts (us-west-2)
Destination: nimbus-order-receipts-dr (us-east-1)
Replication: All objects
Storage class in destination: S3 Standard-IA (cheaper — this is the DR copy, rarely accessed)
```

I meccanismi erano familiari dal capitolo 5: replica asincrona delle nuove scritture (la maggior parte degli oggetti entro 15 minuti; un SLA garantito richiede il pagamento di **S3 Replication Time Control**), versioning richiesto su entrambi i bucket, un ruolo IAM con permesso di lettura-sorgente/scrittura-destinazione. Il dettaglio da notare nella regola sopra: la destinazione usa una *classe di storage diversa* rispetto alla sorgente — Standard-IA per la copia DR, invece di pagare per una seconda copia Standard che viene raramente letta. E il prerequisito del versioning non costava niente in più — lo stavano già abilitando per il recupero dagli incidenti. (La sorella della CRR, la **Same-Region Replication (SRR)**, copia gli oggetti tra bucket nella *stessa* regione — utile per una copia di conformità in un account separato, aggregazione di log o ambienti di test alimentati dai dati di produzione.)

Un problema che Priya segnalò prima che qualcuno ci si scontrasse: la replica **non è retroattiva**. Gli oggetti che esistono già nel bucket quando abiliti la regola non vengono replicati — solo le nuove scritture lo sono. I team abilitano CRR aspettandosi che tutti i dati esistenti appaiano nella destinazione, poi scoprono che il bucket DR è quasi vuoto. Per gli oggetti preesistenti, esegui **S3 Batch Replication**, un'operazione separata che applica le regole di replica agli oggetti già presenti. Nimbus la eseguì una volta per popolare il bucket DR con gli 0,8 TB di ricevute esistenti.

"E i delete marker?" chiese Priya. "Se qualcuno elimina una ricevuta in us-west-2, replica l'eliminazione in us-east-1?"

Per impostazione predefinita, no — nelle configurazioni di replica correnti (lo schema V2 che la console crea), **i delete marker non vengono replicati**. Qualcuno elimina una ricevuta in us-west-2 e la copia in us-east-1 continua a servirla come se nulla fosse successo. Se *vuoi* che il bucket DR rispecchi le eliminazioni, abiliti esplicitamente la replica dei delete marker sulla regola (non supportato su regole con filtri di tag) — quella era l'impostazione predefinita nel legacy schema V1, che il materiale più vecchio descrive ancora. In ogni caso, le scadenze lifecycle non replicano mai i loro delete marker.

La replica comunque *non* è una soluzione di backup — per le ragioni opposte: non protegge dalle eliminazioni permanenti di versione o dalle sovrascritture malevole che si replicano al mirror, e non ha semantiche di conservazione. Per un vero backup, abbina il versioning con Object Lock, o usa AWS Backup.

"Quanto costa al mese?" chiese Tom.

Storage per 0,8 TB in S3 Standard-IA in us-east-1: $10,00/mese. Più il trasferimento dati di replica (fatturato per GB trasferito cross-region): minimo al loro volume di scrittura attuale. Costo aggiuntivo totale: circa $10-11/mese per una copia cross-region completa di tutti i record degli ordini.

Tom lo annotò senza protestare.

**S3 Storage Lens: Vedere il Quadro Completo**

Tom aveva fatto il suo audit manualmente — aprendo la console AWS bucket per bucket, eseguendo comandi AWS CLI per contare gli oggetti, controllando il billing explorer per i costi di storage per bucket. Gli era costato quasi un pomeriggio intero per costruire quel foglio di calcolo.

**S3 Storage Lens** è lo strumento AWS che sostituisce quel processo manuale. Fornisce visibilità a livello organizzativo sull'utilizzo e l'attività di S3 in tutti i bucket, tutti gli account e tutte le regioni — in un unico dashboard.

Le metriche più importanti per l'ottimizzazione dei costi:

**Non-current version bytes**: Quanto storage è consumato dalle versioni precedenti (quando il versioning è abilitato). Il versioning è essenziale per la sicurezza, ma se un documento viene aggiornato frequentemente, le versioni precedenti si accumulano. Una lifecycle rule per scadere le versioni non correnti dopo 30 giorni previene il bloat delle versioni.

**Incomplete multipart upload bytes**: Esattamente il problema che Leo aveva causato con il load test, emerso automaticamente. Senza Storage Lens, Tom avrebbe dovuto sapere di cercare i multipart upload incompleti. Con Storage Lens, appaiono nel dashboard come una voce di riga.

**% richieste che restituiscono 403**: Un picco di risposte 403 (Forbidden) su un bucket che dovrebbe essere pubblicamente accessibile potrebbe indicare una bucket policy mal configurata. Un picco su un bucket privato potrebbe indicare un tentativo di scansione o sondaggio. In ogni caso, è un segnale che vale la pena investigare.

**Dimensione media degli oggetti**: Un bucket di oggetti piccoli (media 2 KB) si comporta diversamente da un bucket di oggetti grandi (media 50 MB) in termini di economia di Intelligent-Tiering, costi delle richieste e prestazioni delle query per Athena.

S3 Storage Lens ha un livello gratuito che copre le metriche essenziali. Le metriche avanzate (statistiche delle richieste, gruppi lens per il filtraggio) hanno un costo aggiuntivo per milione di oggetti al mese — piccolo rispetto ai risparmi che consente.

"Perché non l'abbiamo usato dall'inizio?" chiese Maya.

"Non avevamo 4,2 terabyte dall'inizio," disse Tom. "Su scala ridotta, un foglio di calcolo funziona. A questa scala, la scala stessa diventa un argomento per lo strumento."

Questo è un tema ricorrente nell'architettura di Nimbus: lo strumento giusto per una data scala non è sempre lo strumento giusto per la scala successiva. S3 Storage Lens vale la pena configurarlo non appena il tuo utilizzo di S3 cresce oltre quello che puoi auditare manualmente in un pomeriggio — che è più o meno quando i risparmi che consente iniziano a superare in modo significativo il tempo che fa risparmiare.

## Punti di Forza e Limitazioni

**Perché i livelli di storage S3 sono importanti**:

- Significativa riduzione dei costi senza sacrificare la durabilità o la disponibilità per ciò che viene effettivamente acceduto
- Le lifecycle policy automatizzano l'intero processo — nessun onere operativo
- S3 Intelligent-Tiering elimina la necessità di prevedere i pattern di accesso

**Dove diventa complicato**:

- Si applicano addebiti per la durata minima di storage alle classi Glacier (90 giorni per Glacier Instant, 180 giorni per Deep Archive) — eliminare prima incorre comunque nell'addebito minimo
- Le tariffe di recupero possono sorprenderti se accedi frequentemente ai dati archiviati
- Le transizioni lifecycle richiedono tempo — gli oggetti non vengono spostati istantaneamente dopo che la regola viene attivata
- Intelligent-Tiering ignora gli oggetti sotto i 128 KB — nessuna tariffa, ma neanche nessun tiering; e le lifecycle rule li saltano per impostazione predefinita a meno che non si sovrascriva la dimensione minima dell'oggetto

## Riepilogo

L'automazione del workflow del capitolo 22 ha ottimizzato il modo in cui Nimbus elabora le richieste. Questo capitolo ottimizza quello che Nimbus paga per i dati che conserva ma non accede. Il principio è lo stesso: smetti di pagare per il livello sbagliato.

- S3 ha otto classi di storage: Standard, Standard-IA, Intelligent-Tiering, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive — più Express One Zone (specializzato a bassa latenza, singola AZ).
- Le **lifecycle policy** automatizzano le transizioni tra classi di storage in base all'età — definisci una volta, S3 se ne occupa per sempre.
- **S3 Intelligent-Tiering** sposta automaticamente gli oggetti tra i livelli in base ai pattern di accesso effettivi — usalo per workload imprevedibili con oggetti più grandi di 128 KB. Gli oggetti più piccoli non vengono monitorati né suddivisi automaticamente in livelli (e non pagano la tariffa di monitoraggio) — rimangono nel livello di Accesso Frequente.
- **Il recupero da Glacier** richiede una richiesta di restore per i livelli Flexible e Deep Archive. Pianifica il tempo di recupero (da minuti a 12 ore) prima di archiviare qualsiasi dato con un SLA per il recupero.
- I **multipart upload incompleti** si accumulano silenziosamente e comportano addebiti di storage. Aggiungi una lifecycle rule per eliminare le parti incomplete dopo 7 giorni su ogni bucket.
- **Tre livelli di sicurezza**: versioning (eliminazioni reversibili), Object Lock (immutabilità WORM per la conformità — la modalità Governance può essere sovrascritta dagli amministratori; la modalità Compliance non può essere sovrascritta da nessuno), eventi di dati CloudTrail (forensica e rilevamento delle anomalie).
- **Cross-Region Replication (CRR)**: replica i record degli ordini in una regione DR automaticamente. Richiede versioning su entrambi i bucket. Configura se i delete marker si replicano in base al fatto che la copia DR sia un mirror o un backup.
- Il **multipart upload** è richiesto per oggetti > 5 GB e consigliato per tutto ciò che supera i 100 MB.

## Suggerimenti per l'Esame

*Dominio SAA-C03: Progettare Architetture Ottimizzate per i Costi (Dominio 4, Task 4.1)*

- **Segnali di selezione della classe di storage**:
  - "Accessato frequentemente" → Standard
  - "Accessato una volta al mese, necessità di recupero istantaneo" → Standard-IA
  - "Può tollerare ore di tempo di recupero, raramente accessato" → Glacier Flexible Retrieval
  - "Conformità normativa, conservazione di 7+ anni, mai accessato" → Glacier Deep Archive
  - "Pattern di accesso sconosciuti o in evoluzione" → Intelligent-Tiering
- **Pattern d'esame per le lifecycle policy**: "ridurre automaticamente i costi di storage man mano che i dati invecchiano", "transizione all'archivio dopo 90 giorni" → lifecycle policy.
- **Intelligent-Tiering e oggetti piccoli**: gli oggetti sotto i 128 KB non vengono monitorati, non pagano la tariffa di monitoraggio e non vengono mai suddivisi automaticamente in livelli — rimangono in Accesso Frequente. Le lifecycle rule saltano anche gli oggetti sotto i 128 KB per impostazione predefinita (sovrascrivibile). L'esame potrebbe testare entrambi i fatti.
- **Requisiti CRR**: il versioning deve essere abilitato su entrambi i bucket sorgente e destinazione. Sorgente e destinazione devono essere in regioni diverse.
- **S3 Object Lock**: "WORM", "immutabile", "SEC 17a-4", "non può essere eliminato o modificato" → Object Lock. Modalità Governance (può essere sovrascritta dagli amministratori). Modalità Compliance (non può essere sovrascritta da nessuno, incluso root).
- **Restore da Glacier**: gli oggetti in Glacier non sono immediatamente disponibili. Devi "ripristinare" una copia in S3 Standard per l'accesso. La copia ripristinata è temporanea (imposti la durata). L'originale rimane in Glacier.

## Esercizi

**Esercizio 1 — Ricordo**

Spiega la differenza tra S3 Standard-IA e S3 Glacier Instant Retrieval. Quale pattern di accesso rende ciascuno appropriato?

*(Suggerimento: Pensa ai file che si spostano nel seminterrato — quanto spesso ci vai a guardare, e quanto sei disposto ad aspettare quando lo fai?)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: Un'azienda genera 500 GB di log applicativi al giorno. I log vengono interrogati intensamente nei primi 7 giorni (debug e monitoraggio). Dopo 7 giorni, i log vengono raramente accessibili ma devono essere disponibili entro 30 minuti se necessario. Dopo 1 anno, i log devono essere conservati per la conformità ma non vengono mai accessibili. L'azienda deve minimizzare i costi di storage rispettando questi requisiti.

Quale lifecycle policy S3 soddisfa MEGLIO questi requisiti?

A) Conserva in S3 Standard per 7 giorni; transizione a S3 Glacier Deep Archive dopo 7 giorni; scadenza dopo 365 giorni
B) Conserva in S3 Standard per 7 giorni; transizione a S3 Standard-IA dopo 7 giorni; transizione a S3 Glacier Flexible Retrieval dopo 365 giorni
C) Conserva tutti i log in S3 Intelligent-Tiering dal giorno 1
D) Conserva in S3 Standard per 7 giorni; transizione a S3 Glacier Instant Retrieval dopo 7 giorni; transizione a S3 Glacier Deep Archive dopo 365 giorni

**Suggerimento 1**: "Disponibile entro 30 minuti" esclude quale classe di storage?

**Suggerimento 2**: Deep Archive richiede 12 ore per il recupero — non soddisfa il requisito di 30 minuti per i giorni 7-365.

**Suggerimento 3**: Dopo 365 giorni, il tempo di recupero non conta (mai accessato), quindi si applica l'opzione più economica.

**Risposta**: D

**Spiegazione**: S3 Standard per 7 giorni gestisce l'accesso frequente. Glacier Instant Retrieval fornisce accesso in millisecondi per i giorni 7-365 — soddisfacendo il requisito di 30 minuti a un costo significativamente inferiore rispetto a Standard-IA. Dopo 365 giorni, Glacier Deep Archive è l'opzione più economica per i dati che non vengono mai accessibili.

**Perché non A?** Glacier Deep Archive richiede 12 ore per il recupero — non soddisfa il requisito di "disponibilità entro 30 minuti" per i giorni 7-365.

**Perché non B?** Standard-IA non può nemmeno essere la prima tappa qui: S3 richiede che gli oggetti maturino 30 giorni in Standard prima che una lifecycle rule possa spostarli in Standard-IA o One Zone-IA — quindi "Standard-IA dopo 7 giorni" è una regola non valida. (La regola dei 30 giorni non si applica alle classi Glacier, che è esattamente il motivo per cui D funziona.) E anche mettendo da parte questo, Glacier Instant Retrieval è significativamente più economico per i dati che vengono raramente accessibili dopo il giorno 7.

**Perché non C?** Intelligent-Tiering ha una tariffa di monitoraggio per oggetto e potrebbe non spostare i log ai livelli di archivio in modo così aggressivo come le lifecycle rule esplicite. Per un grande volume di log con un pattern di accesso prevedibile, le lifecycle rule esplicite sono più convenienti.

*Dominio SAA-C03: Progettare Architetture Ottimizzate per i Costi — Task 4.1*

**Esercizio 3 — Sfida di Architettura** *(Opzionale)*

Nimbus ha tre tipi di dati S3 con caratteristiche diverse:

- Foto dei ristoranti: caricate una volta, accessibili molte volte dai clienti, mai eliminate
- Ricevute d'ordine: accessibili dai clienti nel primo mese, conservate 7 anni per scopi fiscali
- Esportazioni di analisi: generate quotidianamente, analizzate nella settimana successiva, conservate 2 anni

Progetta una lifecycle policy per ciascuno. Per le foto dei ristoranti, avrebbe senso Intelligent-Tiering? Per le ricevute d'ordine, quale classe di storage copre il periodo da 1 mese a 7 anni? Per le esportazioni di analisi, come struttureresti il bucket per applicare policy diverse a prefissi diversi?

*(Non esiste una risposta corretta univoca. L'obiettivo è esercitarsi nella selezione dei livelli di storage per dati reali.)*

## Scena Post-Crediti

Tom implementò le lifecycle policy.

Leo aveva aiutato a configurare la prima regola. "Andrà bene," aveva detto. "La durata minima di storage si applica solo se eliminiamo prima del tempo — e non stiamo eliminando niente." Controllò i requisiti di durata minima di Glacier a metà configurazione. "In realtà, fammi rileggere questo."

Su un bucket diverso — le esportazioni temporanee di staging per le analisi — aveva quasi combinato una transizione di 30 giorni a Glacier Instant Retrieval con una regola di scadenza a 60 giorni. La durata minima di storage per Glacier Instant è di 90 giorni: quegli oggetti sarebbero entrati in Glacier al giorno 30 ed eliminati al giorno 60, e S3 avrebbe comunque fatturato i 90 giorni interi per ciascuno — pagando prezzi di archivio per uno storage che non esisteva più. Abbandonò del tutto la transizione Glacier per quel bucket; i dati eliminati a 60 giorni non vivono abbastanza a lungo per ammortizzare un minimo di 90 giorni. La policy delle ricevute era sicura come progettata: transizione a Standard-IA a 90 giorni, Glacier Instant Retrieval a 365 giorni, Glacier Flexible Retrieval a 540 giorni, Glacier Deep Archive a 2.555 giorni.

Impostò anche la lifecycle rule di pulizia dei multipart upload su ogni bucket. Non perché ci fossero altri upload abbandonati — non c'erano — ma perché ci sarebbero stati. I load test accadono. I deployment falliscono a metà. La regola era più economica della memoria necessaria per ricordarsi di pulire manualmente.

La fattura S3 scese da $847 a $198 il mese successivo.

Stampò il confronto e lo mise sulla scrivania di Maya senza dire nulla.

Maya lo guardò. Poi guardò la data. Poi guardò Tom.

"Tre settimane," disse.

"Un pomeriggio per progettare le policy," disse lui. "Un'ora per implementarle. Tre settimane per vedere il primo ciclo di fatturazione completo."

"Tre quarti di riduzione dei costi S3."

"Per i dati che non accediamo."

"E la cross-region replication?" chiese Leo.

"Dieci dollari al mese in più," disse Tom. "Per una copia completa di ogni ricevuta d'ordine in una seconda regione."

"È la decisione di disaster recovery più economica che abbiamo mai preso."

Maya guardò di nuovo i numeri.

"Tom," disse, "voglio che tu faccia questa revisione per ogni servizio AWS che usiamo. Storage, calcolo, networking. Trova gli sprechi."

Era già tornato alla sua scrivania.

"Ho iniziato la settimana scorsa," disse.

Nel prossimo capitolo: il livello del database ha la sua versione di questa conversazione — un database che promette failover misurati in secondi, e una fattura che Tom non si aspettava di apprezzare.
