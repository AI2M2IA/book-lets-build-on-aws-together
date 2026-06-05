# Capitolo 26: Capire Tutto

I dati sono grezzi: timestamp, clic, eventi, numeri. Le informazioni sono ciò che si ottiene quando i dati sono organizzati, elaborati e forniti di contesto. Il divario tra i due è dove vive questo capitolo.

E nei sistemi in crescita, questo divario diventa rapidamente costoso.

Nimbus stava generando enormi quantità di dati. Ogni ordine: registrato. Ogni visualizzazione del menu: registrata. Ogni aggiornamento del ristorante: catturato. Ogni interazione con il cliente: tracciata.

Tom aveva una domanda.

"Qual è il nostro orario di ordine più intenso del venerdì?"

Leo lo guardò. "Non è nel nostro dashboard."

"Possiamo aggiungerlo?"

"I dati sono in DynamoDB. E nei log di CloudWatch. E in S3 dal lavoro di esportazione delle analisi." Leo fece una pausa. "In tre posti diversi, in tre formati diversi."

Maya aggiunse: "E il lavoro di esportazione delle analisi viene eseguito solo una volta a notte. Se vuoi i dati del venerdì, dovrai aspettare fino al sabato mattina."

Tom guardò lo schermo. "Quindi abbiamo i dati. Non possiamo semplicemente usarli."

Questa frase descrive metà dell'analisi moderna.

Questo è il problema dell'ingegneria dei dati: hai i dati, ma non sono in una forma in cui puoi analizzarli quando ne hai bisogno.

**Tre Problemi Diversi**

Il problema dei dati di Nimbus aveva tre dimensioni:

**Streaming in tempo reale:** Gli ordini vengono effettuati proprio ora. Vuoi vedere un pannello di controllo in tempo reale della velocità degli ordini — quanti al minuto, per regione, per ristorante. I dati devono essere elaborati mentre arrivano.

**Trasformazione dei dati:** I dati sono in S3 da vari sistemi, in formati diversi (JSON, CSV, Parquet). Prima di poterli analizzare, devi normalizzarli — schema lo stesso, formato lo stesso, puliti, uniti con dati di riferimento.

**Analisi ad hoc:** Una volta organizzati i dati, vuoi eseguire query SQL su di essi senza doverli prima caricare in un database. "Dammi i primi 10 ristoranti per fatturato negli ultimi 30 giorni." Senza caricare i dati in un database.

Ognuno di questi è un problema distinto. AWS offre un servizio dedicato per ciascuno:

- **Amazon Kinesis**: Streaming di dati in tempo reale
- **AWS Glue**: Trasformazione dei dati e catalogazione
- **Amazon Athena**: Query SQL serverless su S3

**Amazon Kinesis: Il Cronometro in Tempo Reale**

**Amazon Kinesis Data Streams** è un servizio di streaming di dati in tempo reale. I produttori inviano record di dati allo stream. Molteplici consumatori possono leggere dallo stream contemporaneamente, ciascuno al proprio ritmo.

Pensa a una macchina per la cassa continua: i prezzi vengono stampati continuamente, tutti possono leggere la pellicola, e la pellicola non rallenta per nessun lettore individuale.

Per Nimbus, quando viene effettuato un ordine, l'applicazione pubblica un evento a un flusso Kinesis: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`.

I consumatori di questo flusso:

- Un pannello di controllo in tempo reale (legge gli eventi mentre arrivano, aggiorna le metriche)
- Un Lambda di rilevamento frodi (cerca schemi di ordini insoliti)
- Un flusso verso S3 per l'archiviazione permanente

**Concetti di Kinesis Data Streams:**

- **Shard**: L'unità di capacità di base. Uno shard gestisce 1 MB/s di scrittura, 2 MB/s di lettura.
- **Periodo di conservazione**: i dati rimangono nello stream per 24 ore (predefinito) fino a 7 giorni.
- **Numero di sequenza**: ogni record ha un numero di sequenza. I consumatori tracciano la loro posizione nello stream.

**Amazon Data Firehose** (precedentemente **Kinesis Data Firehose**): Il servizio di consegna gestito tra i produttori di streaming e le destinazioni come S3, Redshift e OpenSearch. Bufferizza, comprime, trasforma e consegna i dati automaticamente.

Per Nimbus: Kinesis Data Streams → Amazon Data Firehose → S3 (formato Parquet, compresso, suddiviso per data).

**AWS Glue: Il Traduttore**

I dati in S3 sono grezzi. Prima di poterli analizzare in modo efficiente, devi:

- Scoprire cosa c'è e il suo schema (quali colonne, quali tipi)
- Trasformarli in un formato coerente
- Unire diversi set di dati insieme
- Gestire i record scadenti, le modifiche dello schema, i valori mancanti

**AWS Glue** è un servizio ETL (Extract, Transform, Load) gestito completamente. Ha due componenti principali:

**Glue Data Catalog**: Un archivio di metadati che descrive i tuoi dati S3 — quali tabelle esistono, quali colonne hanno, dove si trovano i file di dati. È come un catalogo dei libri per il tuo data lake.

**Glue Crawlers**: Agenti automatizzati che scansionano S3, deducono lo schema e popolano il Data Catalog. Esegui un crawler sul tuo bucket S3 e 10 minuti dopo hai un catalogo di tutti i tuoi tabelle.

**Glue Jobs**: Lavori serverless Spark/Python che eseguono la trasformazione effettiva. Scrivi la logica di trasformazione (o usa lo strumento ETL visivo di Glue), e Glue la esegue su infrastrutture gestite.

Per Nimbus:

1. Glue Crawler scansiona i dati degli ordini in S3 → crea una definizione di tabella nel Glue Data Catalog
2. Glue Job trasforma gli eventi di ordine JSON grezzi in un formato Parquet pulito e suddiviso per data
3. I dati trasformati vengono scritti nuovamente in S3 in un layout ottimizzato per le query

**Amazon Athena: Il Bibliotecario**

**Amazon Athena** è un servizio di interrogazione interattivo e serverless che esegue query SQL direttamente sui dati di S3. Non è necessario provisionare un database, né caricare i dati. Definisci una tabella (o utilizza il Glue Data Catalog), scrivi la query SQL e Athena esegue la query sui file S3.

```sql
SELECT 
    restaurant_id,
    COUNT(*) as order_count,
    SUM(total) as revenue
FROM orders
WHERE year='2024' AND month='01'
GROUP BY restaurant_id
ORDER BY revenue DESC
LIMIT 10;
```

Athena ha un modello di prezzi basato sulla quantità di dati scansionati da una query. In molte regioni, le query standard SQL iniziano da $5 per terabyte scansionato. Utilizzando il formato Parquet (colonnare) con la suddivisione per partizioni (`WHERE year='2024' AND month='01'`) significa che Athena scansiona solo i file di cui ha bisogno, riducendo drasticamente i costi.

"Possiamo eseguire questa query per 30 giorni di dati," disse Leo, "e potrebbe costare sorprendentemente poco se lo conserviamo bene."

"Per qualsiasi domanda possiamo pensare?" chiese Tom.

"Per qualsiasi domanda possiamo esprimere in SQL, contro qualsiasi dato abbiamo memorizzato in S3."

Tom aveva l'espressione di qualcuno che ricalcola il valore di tutti i dati che stava buttando via.

**L'Architettura del Data Lake**

Questi tre servizi si combinano in ciò che viene chiamato un'**architettura del data lake** — un repository S3 centralizzato per tutti i tuoi dati, con strumenti per elaborare e interrogare questi dati:
```

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

# Dati Grezzi: La Preservazione Inalterata (nella S3 Bucket Originale) e Querying tramite Athena.

Nuove domande possono sempre essere risolte eseguendo nuovi job Glue sui dati grezzi.

**Amazon Redshift: Quando Athena Non Basta**

Per alcuni casi d'uso, Athena è troppo lenta o troppo costosa:

- Query molto complesse con molti join
- Dashboard che eseguono la stessa query migliaia di volte al giorno
- Machine learning su dati strutturati
- Requisiti di risposta inferiore a un secondo per gli strumenti BI

**Amazon Redshift** è un data warehouse gestito completamente: un database analitico a colonne progettato per carichi di lavoro analitici ripetuti e di grandi dimensioni. A differenza di Athena, che interroga i dati dove risiedono in S3, Redshift carica i dati in un archivio di storage ottimizzato e utilizza l'ottimizzazione delle query, le strategie di ordinamento e le strategie di distribuzione per accelerare l'analisi complessa.

Redshift è significativamente più veloce per le query di analisi complesse a scapito del costo (capacità provisionata) e del requisito di caricamento dei dati prima dell'interrogazione.

**Redshift Serverless** elimina l'onere della pianificazione della capacità: interroghi, Redshift scala. Il costo è per query.

Per Nimbus al loro attuale livello, Athena è sufficiente. Con un volume di dati cinque volte superiore e con gli strumenti BI che interrogano gli stessi dashboard centinaia di volte al giorno, Redshift diventerebbe conveniente.

## Punti di Forza e Limiti

**Kinesis Data Streams**: Utilizza Kinesis quando i tuoi dati arrivano continuamente e l'ordine è importante: clickstream, transazioni finanziarie, telemetria IoT. Kinesis preserva l'ordine dei record all'interno di uno shard e consente la riproduzione durante la finestra di conservazione configurata, il che lo rende fondamentalmente diverso da SQS. Il compromesso è la complessità operativa: in modalità provisionata, gestisci la capacità dello shard e il comportamento dei consumatori. Per semplici code di attività dove l'ordine non è importante e la riproduzione non è necessaria, SQS è la scelta più semplice.

**AWS Glue**: Glue elimina l'infrastruttura di un cluster ETL tradizionale. Scrivi la logica di trasformazione; AWS gestisce l'ambiente Spark. Questo è prezioso quando le trasformazioni sono complesse o i volumi di dati sono elevati. La limitazione è il costo e il cold start: i job Glue hanno un ritardo di avvio di diversi minuti, rendendoli inadatti per trasformazioni in tempo quasi reale. Per semplici conversioni di formati di file (CSV a Parquet), il sovraccarico di Glue potrebbe non valere la pena rispetto a una funzione Lambda o a uno script leggero.

**Amazon Athena**: Athena ti consente di interrogare i dati S3 con SQL standard e senza dover gestire alcuna infrastruttura. Il vincolo critico è il costo: Athena addebita per terabyte di dati scansionati. Una query su una tabella di 10 TB che scansiona l'intera cosa costa significativamente di più rispetto alla stessa query su una tabella formattata in colonne e partizionata che scansiona 200 GB. Utilizza sempre formati a colonne (Parquet o ORC) e partiziona i tuoi dati prima di eseguire Athena in produzione. Senza queste ottimizzazioni, le fatture di Athena possono sorprenderti.

## Riepilogo

- **Amazon Kinesis**: Streaming di dati in tempo reale. I produttori scrivono i record; i consumatori leggono al loro ritmo. Amazon Data Firehose può quindi consegnare i dati in streaming a S3, Redshift e altre destinazioni con meno lavoro operativo.
- **AWS Glue**: ETL e catalogazione dei dati. I crawler scoprono gli schemi; i job trasformano i dati; il Data Catalog rende i dati ricercabili da Athena e altri strumenti.
- **Amazon Athena**: SQL serverless su S3. Interroga qualsiasi dato in S3 utilizzando SQL standard. Addebitato per TB scansionati – utilizza Parquet e la partizione per ridurre al minimo i costi.
- **Amazon Redshift**: Data warehouse gestito per analisi ad alte prestazioni. Carica i dati, ottimizzali per query analitiche ripetute e interrogali velocemente su scala di data center.
- Il **pattern del data lake**: dati grezzi a S3 → Glue li trasforma → Athena li interroga → gli strumenti BI li visualizzano.

## Consigli per l'Esame

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.5)*

- **Kinesis vs SQS**: Kinesis = flusso di dati ordinato e in tempo reale, con più consumatori, possibilità di riprodurre i dati all'interno della finestra di retention. SQS = coda di attività, dove ogni messaggio viene elaborato una sola volta. "Più consumatori che leggono lo stesso flusso simultaneamente" → Kinesis. "Un worker per messaggio" → SQS.
- **Segnali di esame di Athena**: "SQL serverless su S3", "analizzare i dati S3 senza caricarli in un database", "pagamento per query" → Athena.
- **Ottimizzazione dei costi di Athena**: Formato a colonne (Parquet o ORC) + partizionamento riduce drasticamente i dati scansionati e i costi. L'esame potrebbe chiedere come ridurre i costi di Athena.
- **Crawler di Glue**: "Scoprire lo schema dei dati S3 automaticamente" → Glue Crawler.
- **Amazon Data Firehose**: "Caricare automaticamente i dati in streaming su S3/Redshift/OpenSearch senza gestire i consumatori" → Amazon Data Firehose. Materiali più vecchi potrebbero ancora chiamarlo Kinesis Data Firehose.
- **Redshift vs Athena**: Redshift per query ad alta frequenza e complesse su un dataset fisso (dashboard BI). Athena per query ad hoc sui dati S3 che cambiano frequentemente.
- **EMR (Elastic MapReduce)**: Cluster gestiti da AWS di Hadoop/Spark. L'esame utilizza questo quando si menzionano "carichi di lavoro Hadoop/Spark esistenti" o "framework di elaborazione dati personalizzati". Glue è l'alternativa gestita per la maggior parte dei casi d'uso.

## Esercizi

**Esercizio 1 — Ricordo**

Spiega la differenza tra Amazon Kinesis e Amazon SQS. Quando lo useresti?

*(Suggerimento: Pensa a quanti consumatori possono leggere gli stessi dati, se i messaggi vengono eliminati dopo la lettura e se l'ordine è importante.)*

**Esercizio 2 — Esercitazione per l'esame**

*Scenario*: Un'azienda di ride-sharing vuole analizzare i dati dei viaggi. 1 milione di viaggi vengono completati ogni giorno. I record di viaggio sono memorizzati su S3 come file JSON (circa 2KB ciascuno). Il team di analisi vuole eseguire query SQL ad hoc come "durata media del viaggio per città nell'ultima settimana". Le query devono completarsi in meno di 2 minuti. I costi di archiviazione devono essere minimizzati. Il team eseguirà 20-30 query a settimana.

Quale architettura soddisfa meglio questi requisiti?

A) Caricare i dati di viaggio in RDS PostgreSQL quotidianamente; interrogare utilizzando SQL standard
B) Utilizzare AWS Glue per convertire JSON in formato Parquet partizionato per data e città; interrogare con Amazon Athena
C) Utilizzare Amazon Data Firehose per consegnare i dati di viaggio a Amazon Redshift; interrogare con Redshift
D) Caricare i dati di viaggio in DynamoDB e utilizzare PartiQL per le query SQL

*(Suggerimento 1: 20-30 query a settimana è una frequenza bassa. Quale servizio è il più conveniente per interrogazioni occasionali?)*

*(Suggerimento 2: Il formato Parquet + partizionamento riduce drasticamente i dati scansionati da Athena — e quindi i costi.)*

*(Suggerimento 3: 1 milione di viaggi × 2KB = ~2GB al giorno. In una settimana, ~14GB. A $5/TB per Athena, anche senza ottimizzazione, è conveniente.)*

**Risposta**: B

**Spiegazione**: Glue converte JSON in Parquet (il formato a colonne riduce drasticamente i dati scansionati) partizionato per data e città (la partizionamento pruning significa "nell'ultima settimana" le query scansionano solo 7 giorni di partizioni). Athena interroga S3 direttamente con SQL standard. Per 20-30 query a settimana, il costo per query di Athena è estremamente conveniente rispetto all'esecuzione continua di Redshift.

**Perché non A?** Caricare 2GB di dati al giorno in RDS, quindi interrogare, richiede un'istanza del database in esecuzione 24 ore su 24, 7 giorni su 7. Per 20-30 query a settimana, questo è eccessivamente ingegnerizzato e costoso.

**Perché non C?** Redshift è conveniente per query ad alta frequenza (centinaia al giorno sullo stesso dataset). Per 20-30 query a settimana, l'istanza Redshift in esecuzione continua costa molto di più del costo per query di Athena.

**Perché non D?** DynamoDB è un archivio chiave-valore/documento ottimizzato per l'accesso basato su chiave, non per query analitiche ad hoc. PartiQL su DynamoDB non supporta i tipi di GROUP BY aggregazioni descritti.

*Dominio SAA-C03: Progettare architetture ad alte prestazioni — Task 3.5*

**Esercizio 3 — Sfida di architettura** *(Opzionale)*

Nimbus vuole costruire un sistema di rilevamento frodi in tempo reale per gli ordini. Il sistema dovrebbe:

- Rilevare gli ordini effettuati dallo stesso account più di 5 volte in 60 secondi
- Segnalare gli ordini superiori a $500 da account nuovi (< 30 giorni)
- Inviare gli ordini segnalati a una coda di revisione umana

Progetta l'architettura. Cosa fornisce Kinesis? Dove viene eseguita la logica di frode? Come si correlano "stesso account, finestra di 60 secondi"? Quale servizio riceve gli ordini segnalati?

*(Non esiste una risposta corretta. L'obiettivo è praticare la progettazione di architetture di streaming in tempo reale.)*

## Scena post-titoli di credito

Tom ha eseguito la prima query di Athena.

"I 10 migliori ristoranti per fatturato nell'ultimo trimestre," ha detto.

12 secondi dopo, i risultati sono apparsi.

Ha fissato gli occhi su di essi.

"Ristorante 47 era in cima," ha detto. Era il ristorante di famiglia di Maya — quello dove Nimbus era iniziato.

"Certo che lo era," ha detto Maya. "Le arepa sono così buone."

Tom ha eseguito un'altra query. E un'altra. Ognuna ha risposto in secondi, ognuna costando frazioni di un centesimo.

"Perché non abbiamo costruito questa cosa prima?" chiese Leo.

"Avevamo i dati," rispose Leo. "Semplicemente non avevamo il flusso di lavoro per utilizzarli."

"I dati erano sempre lì," disse Maya con voce bassa. "Semplicemente non riuscivamo a vederli."

Nel prossimo capitolo: ora che possiamo vedere chiaramente il business, parliamo di come pagare l'infrastruttura che lo alimenta — in modo più efficiente.
