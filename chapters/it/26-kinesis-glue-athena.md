# Capitolo 26: Dare Senso a Tutto

Tom stava fissando un foglio stampato.

Erano due pagine di numeri: conteggi degli ordini, totali di fatturato, timestamp, codici di regione. Aveva chiesto a Leo di raccogliere tutto ciò che era disponibile sui pattern degli ordini del venerdì. Leo aveva passato un'ora a scrivere uno script che univa tre fonti di dati diverse — il database, il dashboard delle metriche e l'archivio — e questo era ciò che ne era uscito.

I numeri erano tutti lì. Non gli dicevano nulla.

Riusciva a vedere che erano stati effettuati 847 ordini il venerdì. Non riusciva a capire quando erano stati effettuati, quali ristoranti erano stati più affollati, o qual era stata l'ora di punta. Quelle informazioni erano nei dati. Erano solo invisibili.

---

Tutta l'ottimizzazione della rete del capitolo 25 aveva reso l'infrastruttura di Nimbus più veloce e meno costosa. Ma i dati che quella infrastruttura stava generando — in DynamoDB, nei log di CloudWatch, nell'esportazione di analisi in S3 che girava una volta a notte — erano sparsi in tre posti diversi, in tre formati diversi, scollegati da qualsiasi cosa Tom potesse effettivamente usare.

La domanda di Maya lo rese concreto. "Qual è il nostro orario di ordine più intenso del venerdì?"

Leo la guardò. "Non è nel nostro dashboard."

"Possiamo aggiungerlo?"

"I dati sono in DynamoDB. E nei log di CloudWatch. E in S3 dall'export delle analisi." Leo si fermò. "In tre posti diversi, in tre formati diversi."

Maya aggiunse: "E l'export delle analisi gira solo una volta a notte. Se vuoi i dati di venerdì, dovresti aspettare fino a sabato mattina."

Tom guardò il foglio stampato. "Quindi abbiamo i dati. Semplicemente non riusciamo a usarli."

Quella frase descrive metà dell'analisi moderna.

---

**La Lavagna**

Maya era arrivata in ufficio presto e aveva già riempito metà della lavagna quando arrivò Leo.

Sette domande, scritte in due colonne, tutte domande di business, nessuna rispondibile dai dashboard attuali:

1. Quali ristoranti hanno il tasso di cancellazione degli ordini più alto nei primi 30 giorni?
2. Qual è il tempo medio tra la ricezione di una notifica di ordine da parte di un ristorante e la sua conferma? Come varia per ristorante e per giorno della settimana?
3. Quali città hanno il tasso più alto di clienti che riordinano dallo stesso ristorante entro 14 giorni?
4. Che percentuale degli ordini viene effettuata nella prima sessione dell'app rispetto alle sessioni successive?
5. Quali categorie di menu generano il fatturato più alto per ristorante?
6. Qual è la correlazione tra il tempo di risposta del ristorante e il tasso di riordino dei clienti?
7. Come varia il volume degli ordini nelle 48 ore prima e dopo che un ristorante partner pubblica sui social media?

"Riusciamo a rispondere a una qualsiasi di queste?" chiese.

Leo guardò l'elenco. Guardò il dashboard attuale — conteggio ordini, totale fatturato, ristoranti attivi.

"La numero uno," disse lentamente. "In parte. Abbiamo i record delle cancellazioni. Ma avremmo bisogno di unirli alle date di onboarding dei ristoranti, e quello è in un sistema diverso."

"La numero due?" chiese Tom.

"Conserviamo il timestamp della notifica. Conserviamo il timestamp della conferma. Sono in tabelle diverse in formati diversi. Avremmo bisogno di fare un JOIN e calcolare il delta."

"Quindi i dati esistono," disse Maya.

"I dati esistono," confermò Leo. "Semplicemente non abbiamo modo di fare query su tutti insieme."

"Aspetta — ma *perché* non possiamo semplicemente interrogare il database?" chiese Maya. "Abbiamo PostgreSQL. Abbiamo tutti questi dati."

"Perché i dati sono in tre posti," disse Leo. "Gli eventi degli ordini sono in DynamoDB. I timestamp delle notifiche sono nei log di CloudWatch. Le date di onboarding sono nel database RDS PostgreSQL. E alcuni — gli export delle analisi — sono in S3 come file JSON che nessuno ha mai unito a nulla."

Tom guardò la lavagna. "Stiamo generando questi dati da 18 mesi," disse. "Abbiamo volato alla cieca per 18 mesi."

"Non alla cieca," disse Maya. "Solo miopi. Riuscivamo a vedere quello che avevamo subito davanti. Non riuscivamo a vedere i pattern."

Era l'inquadratura giusta. I singoli punti dati c'erano. Il sistema per collegarli no.

**Tre Problemi Diversi**

Il problema dei dati di Nimbus aveva tre dimensioni:

**Streaming in tempo reale**: Gli ordini vengono effettuati proprio ora. Vuoi vedere un dashboard in tempo reale della velocità degli ordini — quanti al minuto, per regione, per ristorante. I dati devono essere elaborati mentre arrivano.

**Trasformazione dei dati**: I dati sono in S3 da vari sistemi, in formati diversi (JSON, CSV, Parquet). Prima di poterli analizzare, devi normalizzarli — stesso schema, stesso formato, ripuliti, uniti con dati di riferimento.

**Analisi ad hoc**: Una volta organizzati i dati, vuoi eseguire query SQL su di essi senza doverli prima caricare in un database. "Dammi i primi 10 ristoranti per fatturato negli ultimi 30 giorni." Senza caricare i dati in un database.

Ognuno di questi è un problema distinto. AWS ha un servizio dedicato per ciascuno.

**Lo Stream in Tempo Reale: Un Nastro Telegrafico per i Dati**

Immagina un nastro telegrafico — il tipo che stampava i prezzi delle azioni su un rotolo continuo di carta. I prezzi venivano stampati non appena cambiavano. Chiunque volesse il prezzo attuale poteva leggere il nastro. Nessuno doveva aspettare nessun altro; il nastro continuava a stampare indipendentemente dal numero di lettori.

Questo è il modello dello streaming di dati in tempo reale. I produttori inviano dati non appena accadono. Molteplici consumatori possono leggere lo stream contemporaneamente, ciascuno al proprio ritmo, ciascuno ottenendo il quadro completo.

**Amazon Kinesis Data Streams** è quella macchina per Nimbus. Quando viene effettuato un ordine, l'applicazione pubblica un evento a uno stream Kinesis: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`.

I consumatori di questo stream:

- Un dashboard in tempo reale (legge gli eventi mentre arrivano, aggiorna le metriche)
- Un Lambda di rilevamento frodi (cerca pattern di ordini insoliti)
- Uno stream verso S3 per l'archiviazione permanente

**Concetti di Kinesis Data Streams**:

- **Shard**: L'unità di capacità di base. Uno shard gestisce 1 MB/s in scrittura, 2 MB/s in lettura.
- **Retention period**: I dati rimangono nello stream per 24 ore (impostazione predefinita), estensibile fino a **365 giorni** (1 anno) con Extended Data Retention.
- **Sequence number**: Ogni record ha un numero di sequenza. I consumatori tracciano la loro posizione nello stream.

**Amazon Data Firehose** (precedentemente **Kinesis Data Firehose**): Il servizio di consegna gestito tra i produttori di streaming e le destinazioni come S3, Redshift e OpenSearch. Bufferizza, comprime, trasforma e consegna i dati automaticamente.

Per Nimbus: Kinesis Data Streams → Amazon Data Firehose → S3 (formato Parquet, compresso, partizionato per data).

"L'ho già deployato — ah." Leo aveva impostato il conteggio degli shard a uno senza calcolare prima il throughput di scrittura. Al volume di ordini di Nimbus, uno shard andava benissimo. Lo confermò prima che qualcuno si accorgesse che aveva tirato a indovinare.

**Il Traduttore: Dare Senso ai Dati Grezzi**

I dati in S3 sono grezzi. Prima di poterli analizzare in modo efficiente, devi scoprire cosa c'è, trasformarli in un formato coerente, unire dataset diversi e gestire i record anomali e i valori mancanti.

Questo è il lavoro di uno strato di traduzione dedicato.

**AWS Glue** è un servizio ETL (Extract, Transform, Load) completamente gestito. Ha due componenti principali:

**Glue Data Catalog**: Un archivio di metadati che descrive i tuoi dati S3 — quali tabelle esistono, quali colonne hanno, dove si trovano i file di dati. È come un catalogo per schede del tuo data lake.

**Glue Crawler**: Agenti automatizzati che scansionano S3, inferiscono lo schema e popolano il Data Catalog. Avvia un crawler sul tuo bucket S3 e 10 minuti dopo hai un catalogo di tutte le tue tabelle.

**Glue Job**: Job serverless Spark/Python che eseguono la trasformazione effettiva. Scrivi la logica di trasformazione (o usa lo strumento ETL visivo di Glue), e Glue la esegue su infrastruttura gestita.

Per Nimbus:

1. Glue Crawler scansiona i dati degli ordini in S3 → crea una definizione di tabella nel Glue Data Catalog
2. Glue Job trasforma gli eventi di ordine JSON grezzi in un formato Parquet pulito e partizionato
3. I dati trasformati vengono scritti nuovamente in S3 in un layout ottimizzato per le query

**Quando l'ETL si Rompe: Il Problema dell'Evoluzione dello Schema**

Il pipeline Glue girò correttamente per le prime tre settimane. Poi il partner ristorante #412 aggiunse un nuovo campo al proprio export di menu: `allergen_tags`. Il campo era un array di stringhe — `["gluten", "dairy", "nuts"]` — e compariva nell'export notturno del ristorante.

Lo schema del Glue job era rigido. Era stato scritto per aspettarsi campi specifici nel JSON degli ordini. Quando incontrò `allergen_tags` — un campo non nello schema — il Glue job fallì.

Sei ore di dati di ordini da 47 ristoranti (tutti che usavano lo stesso formato di export di menu del partner #412) si accumularono in S3 senza essere elaborati. Il run notturno di Glue che avrebbe dovuto rendere gli ordini della notte precedente interrogabili entro la mattina si era invece interrotto alle 2:47 e aveva scritto un record di errore in CloudWatch.

Tom lo scoprì quando cercò di eseguire una query Athena alle 9 — uno strumento che Leo stava testando in silenzio esattamente per questo tipo di domande — e ottenne `0 rows returned` per le 12 ore precedenti.

"L'ETL si è rotto perché i dati sorgente sono cambiati?" chiese Maya, quando Leo spiegò cosa era successo.

"L'ETL si è rotto perché l'ETL non sapeva come gestire un cambiamento di schema," disse Leo. "Abbiamo scritto un job rigido che si aspettava esattamente questi campi. Quando è comparso un nuovo campo, ha mandato tutto in errore."

"E se qualcuno tentasse di introdursi attraverso un cambiamento di schema?" chiese Priya. "Un partner ristorante malintenzionato che deliberatamente invia campi inaspettati per mandare in crash il pipeline?"

La domanda valeva la pena considerarla. Un pipeline ETL che va in crash su input inaspettato è un vettore di denial-of-service: invia un formato di dati insolito, manda in crash il pipeline, e quel ristorante (e tutti gli altri che condividono il formato) smette di essere elaborato.

La correzione aveva due parti:

**Glue schema evolution**: Il dynamic frame di Glue supporta l'evoluzione dello schema — i campi non presenti nello schema atteso vengono passati attraverso anziché causare errori. Abilitalo usando DynamicFrame invece di DataFrame nello script del job, con `mergeSchema` impostato nelle opzioni aggiuntive. I nuovi campi vengono aggiunti automaticamente allo schema al prossimo run del crawler.

```python
# Prima (rigido, va in crash con nuovi campi)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders"
)

# Dopo (schema evolution abilitato)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders",
    additional_options={"mergeSchema": "true"}
)
```

**Alerting per il Glue job**: Il fallimento del pipeline fu silenzioso per circa sei ore prima che Tom lo notasse. Un allarme CloudWatch sullo stato del run del Glue job (`FAILED`) avrebbe avvisato l'ingegnere di turno entro 5 minuti. Il costo dell'allarme: dieci centesimi al mese — praticamente gratuito (la metrica stessa non costa nulla, e i primi dieci allarmi rientrano nel free tier).

"Sei ore di dati erano ferme non elaborate in S3," disse Leo, dopo aver eseguito nuovamente il Glue job manualmente per recuperare il ritardo. "Non è andato perso nulla — ma le analisi erano così indietro. Se avessimo avuto l'allarme, il ritardo sarebbe stato di 30 minuti."

La lezione più ampia: i pipeline ETL che elaborano dati esterni devono gestire i cambiamenti di schema in modo elegante. I partner esterni — ristoranti, provider di pagamento, servizi di consegna — cambieranno i loro formati di dati. Il pipeline non deve essere fragile a quei cambiamenti.

**Il Layer di Query: SQL Direttamente su S3**

Ora i dati erano in S3, in formato Parquet, partizionati per data. L'ultimo pezzo: un modo per interrogarli senza doverli prima caricare in un database.

**Amazon Athena** è un servizio di query interattivo e serverless che esegue query SQL direttamente sui dati in S3. SQL diretto sull'archivio — un bibliotecario che risponde alle domande senza farti rimettere nulla sugli scaffali. Nessun database da provisioning, nessun dato da caricare. Definisci una tabella (o usa il Glue Data Catalog), scrivi SQL, e Athena esegue la query sui file S3.

```sql
SELECT 
    restaurant_id,
    COUNT(*) as order_count,
    SUM(total) as revenue
FROM orders
WHERE year='2024' AND month='09'
GROUP BY restaurant_id
ORDER BY revenue DESC
LIMIT 10;
```

Il prezzo di Athena si basa su quanti dati una query scansiona. In us-east-1, us-west-2 e nella maggior parte delle regioni principali, le query SQL standard costano $5 per terabyte scansionato. Usare il formato Parquet (colonnare) con partition pruning (`WHERE year='2024' AND month='09'`) significa che Athena scansiona solo i file di cui ha bisogno, riducendo drasticamente il costo.

"Possiamo eseguire questa query per 30 giorni di dati," disse Leo, "e può costare sorprendentemente poco se lo conserviamo bene."

"Come può costare così poco?" chiese Maya. "Se sta scansionando terabyte di dati, come fa a non essere costoso?"

Leo spiegò Parquet. In un formato riga per riga (JSON, CSV), una query che cerca due colonne su venti deve leggere tutte e venti. In un formato colonnare come Parquet, legge solo le due di cui ha bisogno. Per un dataset da 50TB, una query ben ottimizzata potrebbe scansionare 200GB. A $5/TB, questo è un dollaro.

"E se qualcuno interroga per sbaglio l'intera tabella?" insistette Maya.

"Questo è il vero rischio di costo," disse Leo.

Potresti chiederti: se Athena addebita per terabyte scansionato, potrebbe una query scritta male generare una bolletta inaspettata elevata? Sì — e questo succede in ambienti di produzione reali. Una query su una tabella non ottimizzata da 50TB può costare più dell'intera bolletta S3 mensile. Per questo il formato Parquet e il partizionamento non sono ottimizzazioni opzionali — sono i controlli di costo. Athena supporta anche limiti di scansione per query per workgroup che limitano la quantità di dati che una singola query può scansionare.

"Per qualsiasi domanda arbitraria possiamo pensare?" chiese Tom.

"Per qualsiasi domanda possiamo esprimere in SQL, su qualsiasi dato che abbiamo archiviato in S3."

Tom si sedette al laptop di Leo e scrisse la prima query:

```sql
SELECT
    r.restaurant_id,
    r.restaurant_name,
    AVG(EXTRACT(EPOCH FROM (o.confirmed_at - o.notification_sent_at)) / 60) 
        AS avg_confirmation_minutes,
    COUNT(DISTINCT c.customer_id) AS unique_customers,
    COUNT(DISTINCT CASE WHEN c.order_count > 1 THEN c.customer_id END) 
        AS returning_customers,
    ROUND(
        COUNT(DISTINCT CASE WHEN c.order_count > 1 THEN c.customer_id END) * 100.0 /
        NULLIF(COUNT(DISTINCT c.customer_id), 0),
        2
    ) AS reorder_rate_pct
FROM orders o
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
JOIN (
    SELECT customer_id, restaurant_id, COUNT(*) AS order_count
    FROM orders
    WHERE year >= '2024'
    GROUP BY customer_id, restaurant_id
) c ON c.customer_id = o.customer_id AND c.restaurant_id = o.restaurant_id
WHERE o.year = '2024'
  AND o.status = 'delivered'
GROUP BY r.restaurant_id, r.restaurant_name
ORDER BY avg_confirmation_minutes ASC
LIMIT 20;
```

La query girò per 11 secondi. Il risultato: 20 ristoranti, ordinati per tempo medio di conferma più rapido, con i rispettivi tassi di riordino.

Tom fissò l'output.

I ristoranti con la conferma più rapida — quelli che riconoscevano e confermavano gli ordini in una media di 3-4 minuti — avevano un tasso medio di riordino del 41%. I ristoranti con la conferma più lenta (tempo medio di conferma 18-22 minuti) avevano un tasso di riordino del 13%.

"I ristoranti che confermano velocemente ottengono tre volte più clienti abituali," disse Tom.

"È un divario enorme," disse Maya. "Perché la velocità di conferma influisce così tanto sul tasso di riordino?"

"Perché il cliente ha effettuato un ordine e poi è rimasto lì a fissare il telefono," disse Leo. "Se la conferma arriva in 3 minuti, si sente sicuro. Se arriva dopo 22 minuti — o mai — si sente ansioso. L'ansia è il fallimento del prodotto, anche se il cibo arriva bene."

"Questo è un insight di prodotto," disse Maya. "Non solo un insight di analisi. Dovremmo mostrare ai ristoranti il loro benchmark di tempo di conferma rispetto alla media della categoria."

La query Athena aveva scansionato 1,2 GB di dati (due mesi di ordini in formato Parquet, partizionati per anno e mese). Costo: $0.006.

Mezzo centesimo. Per un insight di business che avrebbe cambiato il modo in cui Nimbus avrebbe progettato l'onboarding dei ristoranti — quali ristoranti prioritizzare per il coaching al successo, quali obiettivi di tempo di conferma impostare come parte degli SLA dei partner.

Tom aveva l'espressione di qualcuno che stava ricalcolando il valore di tutti i dati che avevano buttato via.

"E se qualcuno tentasse di intromettersi attraverso il layer di query?" chiese Priya. "O semplicemente un analista che per sbaglio esporta gli indirizzi dei clienti dai dati grezzi degli ordini? PII dei clienti, storico degli ordini, dati finanziari — chi controlla quali tabelle sono anche solo visibili?"

Prima che finisse la domanda, anche Leo aveva realizzato il problema operativo: come impedire a un team di eseguire una scansione catastrofica dell'intera tabella che genera una bolletta Athena da $500 in una singola query?

**Gli Athena Workgroup** risolvono entrambi i problemi simultaneamente.

Un workgroup è una configurazione con nome che raggruppa gli utenti Athena e applica impostazioni condivise: posizione dei risultati delle query, crittografia, e — criticamente — limiti di scansione dati per query.

```
Workgroup: analytics-team
  Query scan limit: 10 GB per query
  Action on limit exceeded: Cancel query

Workgroup: engineering-team
  Query scan limit: 100 GB per query
  Action on limit exceeded: Warn only

Workgroup: finance-reports
  Query scan limit: 1 GB per query
  Action on limit exceeded: Cancel query
```

Un analista nel workgroup `analytics-team` non può accidentalmente scansionare 50TB di dati e generare un addebito Athena da $250. La query viene annullata quando supererebbe i 10GB di dati scansionati. L'analista vede un messaggio di errore e sa che deve aggiungere un filtro di partizione.

I workgroup applicano anche posizioni di risultato separate per team: i risultati delle query del team di engineering vanno in `s3://nimbus-query-results/engineering/`; i risultati del team finance vanno in `s3://nimbus-query-results/finance/`. Nessun accesso cross-team ai risultati delle query.

IAM controlla quali utenti possono usare quale workgroup. Una funzione Lambda che esegue report automatizzati usa il workgroup `finance-reports` (con limite stretto). Un ingegnere che fa debugging di un problema di produzione usa il workgroup `engineering-team` (limite più ampio, avviso senza annullamento). L'accesso alla tabella degli eventi raw (contenente PII dei clienti) è limitato al workgroup `engineering-team` attraverso una condizione IAM sulla tabella del Glue Data Catalog.

"Non è solo controllo dei costi," disse Priya. "È controllo degli accessi. I workgroup sono il punto di enforcement."

Rispose alla sua domanda in modo completo. Ogni discussione di pipeline dati che salta il controllo degli accessi alla fine diventa un incidente di conformità — e qui, il team di analisi vedeva solo tabelle di ordini aggregate, mentre gli eventi raw con PII dei clienti rimanevano dietro un'autorizzazione IAM esplicita. Il Glue Data Catalog non era solo una directory di schemi. Era un confine di controllo degli accessi.

"Non è lavoro extra," disse Priya. "È il design."

**L'Architettura del Data Lake**

Questi tre servizi si combinano in quella che viene chiamata **architettura del data lake** — un repository S3 centralizzato per tutti i tuoi dati, con strumenti per elaborarli e interrogarli:

```
Applications (orders, menus, events)
    |
    | Real-time events
    ↓
Kinesis Data Streams ──→ Amazon Data Firehose ──→ S3 (raw)
                                                   |
                                                   | Glue Crawler discovers schema
                                                   ↓
                                              Glue Data Catalog
                                                   |
                                                   | Glue Jobs transform
                                                   ↓
                                              S3 (clean, Parquet, partitioned)
                                                   |
                                                   | SQL queries
                                                   ↓
                                              Amazon Athena
                                                   |
                                                   ↓
                                          Business Intelligence Tools
                                       (QuickSight, Tableau, etc.)
```

I dati grezzi sono sempre preservati (nel bucket S3 originale). I dati trasformati sono interrogabili via Athena. Nuove domande possono sempre essere risposto eseguendo nuovi Glue job sui dati grezzi.

**Amazon Redshift: Quando Athena Non Basta**

Per alcuni casi d'uso, Athena è troppo lenta o troppo costosa:

- Query molto complesse con molti join
- Dashboard che eseguono la stessa query migliaia di volte al giorno
- Machine learning su dati strutturati
- Requisiti di tempo di risposta inferiore al secondo per gli strumenti BI

**Amazon Redshift** è un data warehouse completamente gestito: un database analitico colonnare progettato per carichi di lavoro analitici grandi e ripetuti. A differenza di Athena, che interroga i dati dove vivono in S3, Redshift carica i dati in storage warehouse ottimizzato e usa ottimizzazione delle query, strategie di ordinamento e strategie di distribuzione per accelerare le analisi complesse.

Se il volume dei tuoi dati è piccolo e le tue query girano raramente (settimanalmente o mensilmente), Athena con dati S3 ben organizzati è sufficiente e quasi gratuita — ma se esegui gli stessi dashboard analitici centinaia di volte al giorno, lo storage colonnare pre-ottimizzato di Redshift sarà più veloce e alla fine più conveniente, nonostante richieda di caricare i dati in anticipo.

Redshift è significativamente più veloce per query analitiche complesse al costo di un prezzo più alto (capacità provisionata) e del requisito di caricare i dati prima di interrogarli.

**Redshift Serverless** rimuove l'onere della pianificazione della capacità — interroghi, Redshift scala. Il costo si basa sulla capacità di calcolo effettivamente utilizzata, misurata in **RPU-hour** e fatturata al secondo (con un minimo di 60 secondi per attivazione), più storage gestito per GB-mese — e nulla per il calcolo mentre il warehouse è inattivo. (Athena è quello con il prezzo per query: $5 per TB scansionato.)

Per Nimbus alle loro dimensioni attuali: Athena è sufficiente. Con cinque volte il volume di dati e con gli strumenti BI che interrogano gli stessi dashboard centinaia di volte al giorno, Redshift diventerebbe conveniente.

**Quando Athena è lo Strumento Sbagliato**

"Qual è il lato negativo?" chiese Maya. "Perché non useremmo Athena per tutto? È serverless, pay per query, nessuna infrastruttura — sembra perfetto."

I casi in cui Athena non è la risposta giusta:

**Dashboard ad alta frequenza**: Un dashboard di analisi rivolto ai clienti che si aggiorna ogni 30 secondi ed esegue 50 query al minuto non è un buon caso d'uso per Athena. A $5/TB scansionato, quelle query devono essere estremamente ben ottimizzate per essere convenienti a quella frequenza. Redshift o un database pre-aggregato (anche RDS) è più appropriato per dashboard con requisiti di tempo di risposta inferiore al secondo.

**Query operative con requisiti di bassa latenza**: Se un agente del servizio clienti ha bisogno di cercare un ordine specifico in meno di 500ms, Athena non è lo strumento — lo è una ricerca DynamoDB o una query RDS. Athena è ottimizzata per il throughput analitico, non per la latenza operativa. Anche una query Athena ben ottimizzata su un dataset piccolo ha un overhead di cold-start di 1-3 secondi.

**Sistemi transazionali**: Athena è di sola lettura. Non puoi fare INSERT, UPDATE o DELETE di record in Athena (eccetto tramite integrazioni specifiche come Lake Formation o il formato di tabella Iceberg, che hanno la loro complessità). Per i carichi di lavoro di scrittura operativi, usa un database transazionale.

**Dataset molto piccoli che cambiano frequentemente**: Se il tuo dataset cambia ogni minuto e ha solo 1GB, caricarlo in RDS o DynamoDB e interrogarlo lì è più semplice e veloce che eseguire query Athena su file S3 che potrebbero essere obsoleti. Le query Athena su file S3 riflettono lo stato al momento della query — se i file sono stati scritti 2 minuti fa, quella è la freschezza che ottieni.

Il pattern che emerge: Athena è eccellente per query analitiche ad hoc di larga scala e poco frequenti su dati S3. Per tutto ciò che è operativo, transazionale o che richiede latenza inferiore al secondo, usa il database operativo appropriato.

**Kinesis vs SQS: Fare Chiarezza sulla Confusione**

Questa è la domanda che emerge in ogni discussione di architettura dati. Kinesis e SQS si occupano entrambi di messaggi. Quando si usa ciascuno?

La confusione nasce dalla somiglianza superficiale: entrambi accettano messaggi dai produttori. Entrambi consegnano quei messaggi ai consumatori. Entrambi sono servizi AWS gestiti. Ma i loro modelli di dati sono fondamentalmente diversi.

**SQS (Simple Queue Service)** è una coda di task. Metti un messaggio dentro. Un consumatore lo prende e lo elabora. Quando l'elaborazione è completa, il messaggio viene eliminato. Se hai dieci consumatori, ogni messaggio va a esattamente uno di essi. Il messaggio scompare dopo il consumo.

**Kinesis Data Streams** è un log. Metti un record dentro. Ogni consumatore legge ogni record. Il consumatore A li legge tutti. Anche il consumatore B li legge tutti, al suo ritmo. Nessun consumatore elimina il record — rimane nello stream fino alla scadenza del periodo di retention. Puoi aggiungere un terzo consumatore in qualsiasi momento, e può leggere dall'inizio dello stream (nella finestra di retention).

"Quando vorresti davvero che ogni consumatore vedesse ogni messaggio?" chiese Maya.

La risposta sono i casi d'uso in cui Kinesis eccelle:

**Dashboard in tempo reale + rilevamento frodi + archivio S3**: Tutti e tre consumano lo stesso stream di eventi degli ordini simultaneamente. Se usassi SQS, dovresti pubblicare su tre code separate — e chiunque pubblichi deve conoscere tutti e tre i consumatori. Con Kinesis, il produttore pubblica una volta; qualsiasi numero di consumatori può leggere in modo indipendente.

**Replay**: Un consumatore si ferma per 2 ore (limite di concorrenza Lambda raggiunto, servizio downstream inattivo). Con SQS, quei messaggi erano già stati eliminati (o hanno un timeout di visibilità definito). Con Kinesis, il consumatore riprende dall'ultimo checkpoint ed elabora le 2 ore di record persi. I dati erano conservati nello stream (fino a 365 giorni con Extended Data Retention).

**Ordine all'interno di uno shard**: I record con la stessa chiave di partizione vanno sempre allo stesso shard, preservando l'ordine. Per un sistema di trading azionario dove devi elaborare tutti i trade per il simbolo `AMZN` in sequenza, Kinesis lo garantisce. SQS FIFO fornisce l'ordinamento per gruppo ma a throughput inferiore (fino a 3.000 messaggi/secondo per coda con batching in modalità standard — la modalità high-throughput lo porta a decine di migliaia — contro 1 MB/s o 1.000 record/s per shard di Kinesis, moltiplicati per quanti shard hai bisogno).

La domanda decisiva: **Ogni messaggio deve essere consumato da esattamente un consumatore e poi scartato?** → SQS. **Ogni messaggio deve essere visto da più consumatori in modo indipendente, o hai bisogno della funzionalità di replay?** → Kinesis.

Per il dashboard in tempo reale di Nimbus: Kinesis. Più consumatori (dashboard, rilevamento frodi, archivio S3) che leggono tutti lo stesso stream.

Per la coda di elaborazione degli ordini di Nimbus (un ordine effettuato → un task ECS lo elabora): SQS. Un consumatore, nessun replay necessario, nessun fan-out richiesto.

## Visualizzare i Dati: Amazon QuickSight

Athena interroga i dati. Glue li prepara. Ma a un certo punto qualcuno ha bisogno di vedere un grafico — e non eseguendo query SQL nella console.

"Abbiamo davvero bisogno di un altro servizio per quello?" chiese Maya. "Non posso semplicemente esportare i risultati di Athena in un foglio di calcolo?"

"Per una query, sì," disse Tom. Aveva l'espressione di qualcuno che ci aveva già provato. "Per un dashboard che vuoi condividere con tutto il team, quello è un nuovo foglio di calcolo ogni mattina."

**Amazon QuickSight** è il servizio di business intelligence (BI) gestito di AWS. Si connette direttamente ad Athena, S3, RDS, Redshift e altre sorgenti, e ti consente di creare dashboard e visualizzazioni senza un server BI separato.

Funzionalità principali:

- **SPICE** (Super-fast, Parallel, In-memory Calculation Engine): QuickSight può importare dataset nel suo motore in-memory per prestazioni di query inferiori al secondo su scala, senza ri-interrogare Athena ad ogni caricamento del dashboard
- **ML Insights:** rilevamento delle anomalie e previsioni integrate — senza data science richiesta
- **Dashboard embedded:** puoi incorporare i dashboard di QuickSight nella tua applicazione web tramite URL

Tom connesse QuickSight alla sorgente dati Athena e in un pomeriggio aveva un dashboard funzionante che mostrava gli ordini giornalieri, il fatturato per ristorante e il funnel di conversione.

"Quanto costa al mese?" chiese — poi rispose alla sua stessa domanda prima che qualcun altro potesse. "QuickSight costa circa $24/mese per autore — le persone che creano i dashboard — e $3/mese per lettore. Abbiamo quattro persone che lo userebbero."

"Quindi circa cento dollari al mese," disse Maya.

"Per un servizio BI che altrimenti richiederebbe un server di analisi separato," disse Priya. "Sì."

Tom pubblicò il dashboard. La mattina dopo, invece di eseguire query Athena, tutto il team aprì un URL.

> **Suggerimento per l'Esame — QuickSight**
>
> QuickSight è il servizio BI e di visualizzazione gestito di AWS. Si connette ad Athena, S3, Redshift, RDS. SPICE è il motore di query in-memory che accelera le query ripetute del dashboard. Trigger dell'esame: "dashboard di business intelligence su AWS" o "visualizzare dati da Athena/Redshift" → QuickSight.

## Governare il Lake: AWS Lake Formation

Con la crescita del data lake di Nimbus, l'accesso ai dati divenne un problema di governance.

"Chi può interrogare i log delle transazioni grezzi?" chiese Priya, alla prossima revisione dell'architettura. "Chi può vedere la PII dei clienti? Chi può accedere alle tabelle di riepilogo finanziario?"

"Engineering ha accesso completo," disse Leo. "Il team di analisi ha accesso alle tabelle aggregate. Finance ha accesso alle tabelle di fatturato."

"Configurato dove?"

Leo si fermò. "In... posti diversi. Le policy del bucket S3, le policy IAM, le autorizzazioni del catalogo Glue."

"Tre sistemi separati, tutti di cui devono essere coerenti," disse Priya. "Cosa succede quando aggiungiamo un nuovo analista? O quando decidiamo di limitare l'accesso a una colonna specifica — diciamo, i numeri di telefono dei clienti — dal team di analisi?"

Quella domanda esponeva il gap. Gestire l'accesso ai dati dettagliato attraverso le policy del bucket S3, IAM e le autorizzazioni del Glue Data Catalog simultaneamente era fragile.

**AWS Lake Formation** è un servizio gestito che centralizza il controllo degli accessi per il tuo data lake. Invece di gestire le policy del bucket, le policy IAM e le autorizzazioni del catalogo Glue separatamente, Lake Formation fornisce un unico punto per concedere autorizzazioni a livello di colonna, riga e tabella sui tuoi dati.

Funzionalità principali:

- Si basa su S3 e il Glue Data Catalog — nessuna migrazione dei dati richiesta
- **Controllo degli accessi dettagliato:** concedi a utenti o ruoli specifici l'accesso a tabelle, colonne o persino righe filtrate specifiche — l'equivalente delle autorizzazioni a livello di database sui dati S3
- **Filtraggio dei dati:** quando un utente interroga una tabella governata da Lake Formation via Athena, Lake Formation filtra automaticamente le colonne o le righe che non è autorizzato a vedere

Priya configurò Lake Formation con tre livelli di autorizzazione, con Rafael che elaborava le regole a livello di colonna: il ruolo engineering vedeva tutte le tabelle e tutte le colonne. Il ruolo analytics vedeva le tabelle degli ordini aggregate ma non le colonne PII dei clienti. Il ruolo finance vedeva le tabelle di fatturato con gli identificatori dei clienti mascherati.

"Quindi l'analista esegue la stessa query Athena," confermò Leo. "Ma Lake Formation la intercetta e rimuove le colonne che non è autorizzato a vedere?"

"Corretto. Il filtraggio è automatico. L'analista non ha bisogno di sapere che sta accadendo — e non può aggirarlo interrogando direttamente i file S3 grezzi, perché Lake Formation controlla l'accesso a livello di catalogo."

"Come i workgroup," disse Priya. "Non lavoro extra. Il design."

> **Suggerimento per l'Esame — Lake Formation**
>
> Lake Formation centralizza il controllo degli accessi per un data lake costruito su S3 e il Glue Data Catalog. Supporta autorizzazioni dettagliate a livello di tabella, colonna e riga. Trigger dell'esame: "limitare l'accesso a colonne specifiche in un data lake S3" o "centralizzare la governance del data lake" → Lake Formation. La distinzione chiave rispetto a IAM puro: Lake Formation applica un filtraggio a livello di colonna e riga che le sole policy IAM non possono esprimere.

## Punti di Forza e Limitazioni

**Kinesis Data Streams**: Usa Kinesis quando i tuoi dati arrivano continuamente e l'ordine è importante — clickstream, transazioni finanziarie, telemetria IoT. Kinesis preserva l'ordine dei record all'interno di uno shard e consente il replay durante la finestra di retention configurata (24 ore di default, fino a 365 giorni con Extended Data Retention), il che lo rende fondamentalmente diverso da SQS. Il compromesso è la complessità operativa: in modalità provisionata, gestisci la capacità degli shard e il comportamento dei consumatori. Per semplici code di task dove l'ordine non importa e il replay non è necessario, SQS è la scelta più semplice.

**AWS Glue**: Glue elimina l'infrastruttura di un cluster ETL tradizionale. Scrivi la logica di trasformazione; AWS gestisce l'ambiente Spark. Questo è prezioso quando le trasformazioni sono complesse o i volumi di dati sono grandi. La limitazione è il costo e il cold start — i Glue job hanno un ritardo di avvio di decine di secondi fino a un paio di minuti nelle versioni correnti di Glue, rendendoli inadatti per trasformazioni vicine al tempo reale. Per semplici conversioni di formato file (CSV in Parquet), l'overhead di Glue potrebbe non valere rispetto a una funzione Lambda o uno script leggero.

**Amazon Athena**: Athena ti consente di interrogare i dati S3 con SQL standard e nessuna infrastruttura da gestire. Il vincolo critico è il costo: Athena addebita per terabyte di dati scansionati. Una query su una tabella da 10 TB che scansiona l'intera tabella costa significativamente di più rispetto alla stessa query su una tabella in formato Parquet e partizionata che scansiona 200 GB. Usa sempre formati colonnari (Parquet o ORC) e partiziona i tuoi dati prima di usare Athena in produzione. Senza queste ottimizzazioni, le bollette di Athena possono sorprenderti.

## Riepilogo

Il lavoro sulla rete nel capitolo 25 ha reso possibile il pipeline dati di Nimbus. Questo capitolo riguarda lo scopo di quel pipeline: rendere tutti i dati che Nimbus ha generato effettivamente visibili e utilizzabili.

- **Amazon Kinesis**: Streaming di dati in tempo reale. I produttori scrivono record; i consumatori leggono al loro ritmo. Amazon Data Firehose può poi consegnare i dati in streaming a S3, Redshift e altre destinazioni con meno lavoro operativo.
- **Kinesis vs SQS**: Kinesis per fan-out a più consumatori e funzionalità di replay. SQS Standard per semplici code di task; SQS FIFO per elaborazione di task ordinata e deduplicata. La domanda decisiva: ogni consumatore ha bisogno di vedere ogni messaggio, o ogni messaggio va a un solo consumatore?
- **AWS Glue**: ETL e catalogazione dei dati. I Crawler scoprono gli schemi; i Job trasformano i dati; il Data Catalog rende i dati scopribili da Athena e altri strumenti. I pipeline che elaborano dati esterni devono gestire i cambiamenti di schema in modo elegante — usa DynamicFrame con `mergeSchema: true` per evitare errori quando i dati upstream aggiungono nuovi campi.
- **Amazon Athena**: SQL serverless su S3, con prezzo per TB scansionato — usa Parquet e il partizionamento per minimizzare il costo, e gli Athena Workgroup per i limiti di scansione per team e le posizioni dei risultati (controllo dei costi e controllo degli accessi in un'unica configurazione).
- **Quando Athena è sbagliato**: dashboard ad alta frequenza (usa Redshift — il data warehouse gestito ottimizzato per query analitiche ripetute su scala), query operative (usa RDS o DynamoDB), dataset molto piccoli che cambiano frequentemente (usa semplicemente un database).
- Il **pattern del data lake**: dati grezzi in S3 → Glue li trasforma → Athena li interroga → gli strumenti BI li visualizzano.
- **Amazon QuickSight**: Il servizio BI gestito di AWS. Si connette ad Athena, S3, Redshift e RDS per creare dashboard senza un server BI separato. SPICE è il motore in-memory che accelera le query ripetute del dashboard.
- **AWS Lake Formation**: Controllo degli accessi centralizzato per data lake su S3 + Glue Data Catalog. Abilita autorizzazioni a livello di colonna, riga e tabella — governance dei dati dettagliata che IAM da solo non può esprimere.

## Suggerimenti per l'Esame

*Dominio SAA-C03: Design High-Performing Architectures (Domain 3, Task 3.5)*

- **Kinesis vs SQS**: Kinesis = streaming ordinato in tempo reale, più consumatori, replay nella finestra di retention (24 ore di default, fino a 365 giorni). SQS = coda di task, ogni messaggio elaborato una volta. "Più consumatori che leggono lo stesso stream simultaneamente" → Kinesis. "Un worker per messaggio" → SQS.
- **Segnali d'esame di Athena**: "SQL serverless su S3," "analizzare dati S3 senza caricarli in un database," "pay per query" → Athena.
- **Ottimizzazione dei costi di Athena**: Formato colonnare (Parquet o ORC) + partizionamento riduce drasticamente i dati scansionati e il costo. L'esame potrebbe chiedere come ridurre i costi di Athena.
- **Prezzi di Athena**: $5 per TB scansionato (us-east-1, us-west-2 e nella maggior parte delle regioni principali). Il costo è calcolato sui dati scansionati, non sui dati restituiti — ottimizza sempre il formato di storage prima di eseguire query di produzione.
- **Glue Crawler**: "Scoprire automaticamente lo schema dei dati S3" → Glue Crawler.
- **Amazon Data Firehose**: "Caricare automaticamente i dati in streaming su S3/Redshift/OpenSearch senza gestire i consumatori" → Amazon Data Firehose. I materiali più vecchi potrebbero ancora chiamarlo Kinesis Data Firehose.
- **Redshift vs Athena**: Redshift per query ad alta frequenza e complesse su un dataset fisso (dashboard BI). Athena per query ad hoc su dati S3 che cambiano frequentemente.
- **EMR (Elastic MapReduce)**: Cluster Hadoop/Spark gestiti da AWS. L'esame lo usa quando si menzionano "carichi di lavoro Hadoop/Spark esistenti" o "framework di elaborazione dati personalizzati". Glue è l'alternativa gestita per la maggior parte dei casi d'uso.
- **QuickSight:** BI e visualizzazione gestita da AWS. Si connette ad Athena, S3, Redshift, RDS. SPICE = motore in-memory per query rapide ripetute. Trigger dell'esame: "dashboard di business intelligence su AWS" → QuickSight.
- **Lake Formation:** Controllo degli accessi centralizzato per un data lake (S3 + Glue Data Catalog). Autorizzazioni dettagliate: a livello di tabella, colonna e riga. Trigger dell'esame: "limitare l'accesso a colonne specifiche nel data lake S3" o "centralizzare la governance del data lake" → Lake Formation.

## Esercizi

**Esercizio 1 — Ricordo**

Spiega la differenza tra Amazon Kinesis e Amazon SQS. Quando useresti ciascuno?

*(Suggerimento: Pensa al nastro telegrafico — ogni lettore vede l'intero nastro al proprio ritmo e nulla viene strappato dopo la lettura, mentre una coda consegna ogni foglietto a esattamente un lavoratore e poi lo scarta.)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: Un'azienda di ride-sharing vuole analizzare i dati dei viaggi. 1 milione di viaggi vengono completati ogni giorno. I record dei viaggi sono archiviati in S3 come file JSON (circa 2KB ciascuno). Il team di analisi vuole eseguire query SQL ad hoc come "durata media del viaggio per città nell'ultima settimana". Le query devono completarsi in meno di 2 minuti. I costi di storage devono essere minimizzati. Il team eseguirà 20-30 query a settimana.

Quale architettura soddisfa MEGLIO questi requisiti?

A) Usa AWS Glue per convertire JSON in formato Parquet partizionato per data e città; interroga con Amazon Athena
B) Carica i dati dei viaggi in RDS PostgreSQL ogni giorno; interroga usando SQL standard
C) Usa Amazon Data Firehose per consegnare i dati dei viaggi ad Amazon Redshift; interroga con Redshift
D) Carica i dati dei viaggi in DynamoDB e usa PartiQL per le query SQL

**Suggerimento 1**: 20-30 query a settimana è una frequenza bassa. Quale servizio è più conveniente per interrogazioni occasionali?

**Suggerimento 2**: Il formato Parquet + partizionamento riduce drasticamente i dati scansionati da Athena — e quindi il costo.

**Suggerimento 3**: 1 milione di viaggi × 2KB = ~2GB al giorno. In una settimana, ~14GB. A $5/TB per Athena, anche senza ottimizzazione, è conveniente.

**Risposta**: A

**Spiegazione**: Glue converte JSON in Parquet (il formato colonnare riduce drasticamente i dati scansionati) partizionato per data e città (il partition pruning significa che le query "nell'ultima settimana" scansionano solo 7 giorni di partizioni). Athena interroga S3 direttamente con SQL standard. Per 20-30 query a settimana, Athena con pay-per-query è estremamente conveniente rispetto a Redshift in esecuzione continua.

**Perché non B?** Caricare 2GB di dati al giorno in RDS, poi interrogarli, richiede un'istanza di database in esecuzione 24/7. Per 20-30 query a settimana, questo è eccessivamente ingegnerizzato e costoso.

**Perché non C?** Redshift è conveniente per query ad alta frequenza (centinaia al giorno sullo stesso dataset). Per 20-30 query a settimana, il cluster Redshift sempre attivo costa molto di più del prezzo per query di Athena.

**Perché non D?** DynamoDB è un archivio chiave-valore/documento ottimizzato per l'accesso basato su chiave, non per query analitiche ad hoc. PartiQL su DynamoDB non supporta il tipo di aggregazioni GROUP BY descritte.

*Dominio SAA-C03: Design High-Performing Architectures — Task 3.5*

**Esercizio 3 — Sfida di Architettura** *(Opzionale)*

Nimbus vuole costruire un sistema di rilevamento frodi in tempo reale per gli ordini. Il sistema dovrebbe:

- Rilevare ordini effettuati dallo stesso account più di 5 volte in 60 secondi
- Segnalare ordini superiori a $500 da account nuovi (< 30 giorni)
- Inviare gli ordini segnalati a una coda di revisione umana

Progetta l'architettura. Cosa fornisce Kinesis? Dove gira la logica antifrode? Come si correla "stesso account, finestra di 60 secondi"? Quale servizio riceve gli ordini segnalati?

*(Non esiste una risposta corretta unica. L'obiettivo è praticare il design di architetture di streaming in tempo reale.)*

## Scena Post-Crediti

Tom eseguì la sua prima sessione Athena da solo quella sera.

"I top 10 ristoranti per fatturato nell'ultimo trimestre," disse.

12 secondi dopo, i risultati comparvero.

Li fissò.

"Il ristorante 47 era primo," disse. Era il ristorante di famiglia di Maya — quello dove era iniziato Nimbus.

"Certo che lo era," disse Maya. "Le arepe sono così buone."

Tom eseguì un'altra query. E un'altra. "Quanto costa al mese?" chiese Tom prima che Leo potesse dire nulla. Leo verificò la cronologia di scansione delle query. Tre query, dati totali scansionati: 1,2GB. Costo: meno di un centesimo.

Dopo un'ora, Tom aveva un quadro completo del business di Nimbus in un modo che non aveva mai avuto prima. Quali categorie di ristoranti erano cresciute più velocemente. Quali coorti di clienti avevano la retention più lunga. Quali voci di menu generavano più ordini ripetuti.

"Perché non l'abbiamo costruito prima?" chiese.

"Avevamo i dati," disse Leo. "Semplicemente non avevamo il pipeline per usarli."

"I dati erano sempre lì," disse Maya sottovoce. "Non riuscivamo solo a vederli."

Nel prossimo capitolo: ora che riusciamo a vedere chiaramente il business, parliamo di come pagare l'infrastruttura che lo fa girare — in modo più efficiente.
