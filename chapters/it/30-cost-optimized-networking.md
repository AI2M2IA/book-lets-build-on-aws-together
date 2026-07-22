# Capitolo 30: Il Costo Nascosto

Tom aveva una lavagna nella sala riunioni con tre colonne: compute, storage, networking. Le prime due erano compilate — numeri, date, nomi delle ottimizzazioni completate. Si fermò davanti alla lavagna per un momento prima di scrivere qualcosa nella terza colonna. Le voci di networking sulla bolletta cloud si disperdevano per la pagina in un modo che le altre non facevano. Ognuna aveva un nome diverso, un'unità diversa, una giustificazione diversa per cui il denaro stava uscendo.

Tolse il tappo al pennarello.

L'audit del database aveva chiuso l'ultima voce principale su cui Tom stava lavorando attivamente — $491/mese recuperati, $5.892 all'anno. Aggiungendo i Compute Savings Plan di EC2, le policy di lifecycle di S3 e la pulizia dello storage, il totale corrente era $34.092 di risparmi annuali in tre mesi di lavoro. Ma Tom aveva notato, durante il deep-dive nel database, che una categoria era stata appena esaminata. I costi di storage apparivano come una riga: "S3: $198." I costi di compute apparivano come una riga: "EC2: $2.340" — prima che gli sconti del Savings Plan del Capitolo 27 si applicassero. I costi di networking si disperdevano su decine di voci con nomi come "Data Transfer Out," "NAT Gateway Processing," "VPC Peering Data Transfer," e "CloudFront Data Transfer." Non li aveva mai sommati e guardati come totale. Era il lavoro di oggi.

Tom aprì la bolletta. Trovò la sezione del trasferimento dati. Sommò tutte le voci.

I costi di rete in AWS sono come il sistema di pedaggi di una città: entrare in città è gratuito, ma ogni tunnel che prendi in uscita costa, e muoversi tra i quartieri costa un po'. La maggior parte delle persone non pensa ai pedaggi finché non riceve la bolletta alla fine del mese e si rende conto di aver preso il tunnel ogni giorno quando c'era una strada libera tutto il tempo. L'obiettivo di questo capitolo è capire ogni casello — e decidere quali vale la pena pagare.

$847/mese.

"Stiamo spendendo $847 al mese di trasferimento dati," disse.

"È tanto?" chiese Leo.

"È esattamente quanto era la nostra bolletta S3 prima di ottimizzarla. E non sapevo nemmeno di avere una bolletta di trasferimento dati di queste dimensioni."

Maya guardò. "Cosa è esattamente il trasferimento dati?"

"È quello che AWS addebita per spostare i byte in giro. Byte in entrata in AWS: di solito gratuito. Byte in uscita da AWS verso internet: addebitato. Byte tra servizi in regioni diverse: addebitato. Byte che passano attraverso un NAT Gateway: addebitato."

"Puoi scomporlo?"

Tom poteva. Ma questa volta non si fermò alla console di fatturazione. Abilitò VPC Flow Logs su tutti i loro VPC e li inserì in CloudWatch Logs Insights. Questo gli permetteva di interrogare i flussi di traffico effettivi — non solo gli importi in dollari, ma quali origini stavano inviando dati dove, e quanto.

La query impiegò due minuti per girare. Combinata con un'altra fonte di log che avrebbe incluso a breve, l'output era abbastanza specifico da consentire azioni concrete.

**Analisi del Traffico: Cosa Sta Generando Effettivamente la Bolletta**

I primi cinque flussi di traffico per volume, in ordine:

1. Server applicativi EC2 → NAT Gateway → servizi AWS (SSM, Secrets Manager, CloudWatch, SQS): 3,9TB/mese
2. Server applicativi EC2 → NAT Gateway → API esterne: 1,3TB/mese
3. Endpoint reader Aurora → server applicativi EC2 (cross-AZ): 0,4TB/mese
4. Pipeline analytics → bucket S3 in us-east-1 (cross-region): 0,3TB/mese
5. CloudFront → origine S3 (cache miss): 0,2TB/mese

I primi quattro venivano direttamente dai Flow Log. Il quinto no: i VPC Flow Log vedono solo il traffico che attraversa le interfacce di rete all'interno dei tuoi VPC, e un cache miss di CloudFront che recupera da S3 non tocca mai il VPC — è CloudFront che parla direttamente con S3. Per quel flusso, Tom estrasse i log di accesso standard di CloudFront e filtrò sul campo `x-edge-result-type`: ogni voce contrassegnata come `Miss` è una richiesta che CloudFront ha dovuto recuperare dall'origine, e sommando i byte ottenne i 0,2TB. Una bolletta, due strumenti — ognuno cieco a ciò che l'altro vede.

"Il flusso numero quattro," disse Priya. "Perché la nostra pipeline analytics sta parlando con un bucket in us-east-1?"

Leo aveva un'espressione che Tom riconosceva.

"L'avevo già deployed — oh," disse Leo. "Sei mesi fa stavo testando se la nostra pipeline analytics poteva distribuirsi su più regioni in parallelo. Ho creato un bucket di test in us-east-1, ho puntato la pipeline su di esso, e l'ho eseguita per una settimana. Il test è finito ma mi sono dimenticato di rimuovere la destinazione us-east-1 dalla configurazione della pipeline."

"Quindi per cinque mesi," disse Tom, "abbiamo scritto una copia di ogni risultato analytics su un bucket in Virginia."

"Quanto ci costa al mese?" chiese Tom.

Trasferimento cross-region da us-west-2 a us-east-1: $0,02/GB. 300GB/mese = $6/mese per il trasferimento. Più il costo di storage S3 per i dati duplicati in us-east-1: 300GB × 5 mesi × $0,023/GB = $34,50 in dati conservati.

"Non è tanto," disse Leo.

"Non è tanto al mese," disse Tom. "Ma è in esecuzione da cinque mesi e nessuno lo sapeva. È un costo non intenzionale. La domanda non è se $6 contano — è se sappiamo perché ogni dollaro viene speso."

Leo eliminò il bucket di test in us-east-1 e rimosse la destinazione dalla configurazione della pipeline.

La scoperta più attuabile nell'output dei flow log era il flusso numero uno: i server applicativi EC2 che chiamano servizi AWS attraverso il NAT Gateway.

Tom estrasse le voci di log specifiche per la query di CloudWatch Logs Insights, filtrata per mostrare solo il traffico destinato agli intervalli IP dei servizi AWS:

```
fields @timestamp, srcAddr, dstAddr, bytes, protocol
| filter dstAddr like "52.94." or dstAddr like "54.239." or dstAddr like "52.46."
| stats sum(bytes) as totalBytes by srcAddr, dstAddr
| sort totalBytes desc
| limit 20
```

L'output mostrava qualcosa che non si aspettava: circa 300 GB al mese di traffico S3 nella stessa regione — separato dal flusso cross-region verso il bucket us-east-1 di Leo — stava passando attraverso il NAT Gateway. Ma Tom aveva già configurato gli S3 Gateway Endpoint mesi prima.

"Abbiamo un S3 Gateway Endpoint," disse Leo. "Perché il traffico S3 passa ancora attraverso NAT?"

Tom guardò la route table. Il Gateway Endpoint era configurato — ma solo per il VPC applicativo. La pipeline analytics girava in un VPC separato creato nove mesi prima per l'isolamento dei dati. Quel VPC non aveva nessun S3 Gateway Endpoint. Ogni chiamata S3 dalle istanze EC2 della pipeline analytics passava attraverso il NAT Gateway di quel VPC.

"0,3TB di traffico della pipeline analytics × $0,045/GB = $13,50/mese," disse Tom. "Solo dall'endpoint mancante nel secondo VPC."

"Quanto costerebbe aggiungere l'endpoint?" chiese Leo.

"Zero," disse Tom. "Gli S3 Gateway Endpoint sono gratuiti. È una voce nella route table."

Aggiungere il Gateway Endpoint al VPC analytics avrebbe richiesto quattro minuti e avrebbe tolto $13,50 dal costo mensile del NAT Gateway — un numero assoluto piccolo, ma il punto era il principio. Avevano aggiunto un controllo dei costi in un VPC e si erano dimenticati di replicarlo quando avevano creato il secondo. La coerenza richiedeva un processo, non solo la conoscenza.

Tom aggiunse alla checklist di deployment: quando si crea un nuovo VPC, aggiungere gli S3 e DynamoDB Gateway Endpoint prima di collegare qualsiasi workload.

La seconda scoperta specifica dai flow log era più costosa. Il traffico dalle funzioni Lambda che gestivano il sistema di notifica degli ordini — accesso S3 per la lettura dei file di configurazione dei ristoranti — stava passando attraverso il NAT Gateway invece dell'endpoint S3. Le funzioni Lambda giravano all'interno del VPC (per l'accesso a RDS), e l'endpoint S3 del VPC era configurato solo per le istanze EC2 nella subnet applicativa. Le funzioni Lambda nella subnet Lambda stavano instradando attraverso NAT.

"Aspetta — ma *perché* lo faremmo in questo modo?" chiese Maya. "Abbiamo l'endpoint. Perché Lambda non lo usa?"

"I VPC Gateway Endpoint si applicano per subnet in base alle route table," disse Tom. "Le funzioni Lambda sono nella loro subnet con la propria route table. Quella route table non aveva la route dell'endpoint. L'avevo aggiunta per la subnet applicativa. Mi sono perso la subnet Lambda."

Aggiungere la route dell'endpoint S3 alla route table della subnet Lambda avrebbe risparmiato altri $41/mese in commissioni di elaborazione del NAT Gateway che stavano addebitando per le chiamate S3 che avrebbero dovuto essere gratuite.

L'analisi dei flow log si era pagata da sola. Tre ore di tempo di query, tre scoperte concrete: l'endpoint VPC analytics dimenticato ($13,50/mese), il gap di routing della subnet Lambda ($41/mese), e la grande scoperta originale che era diventata la base per le decisioni sugli Interface Endpoint. Risparmio mensile aggiuntivo totale identificato dall'analisi dei flow log: $54,50, oltre ai $78 dagli Interface Endpoint che l'analisi aveva già portato alla luce. Queste due correzioni più piccole andarono nel backlog per il prossimo sprint; la tabella dei risparmi alla fine di questo capitolo conta solo quello che è stato rilasciato.

"La lezione è che i VPC endpoint non sono una configurazione una tantum," disse Tom. "Ogni nuovo VPC, ogni nuova subnet, ogni nuovo tipo di workload richiede lo stesso controllo. Il default per qualsiasi cosa in una subnet privata è instradare attraverso NAT. Il controllo è: questo workload chiama S3, DynamoDB, o uno qualsiasi dei servizi AWS ad alto traffico? Se sì, ha una route endpoint?"

"Abbiamo pensato ad automatizzare quel controllo?" chiese Priya. "Una regola di AWS Config che avvisa quando viene creata una subnet privata senza una route endpoint S3?"

"È nella lista," disse Tom. "Subito dopo l'avviso per i volumi orfani."

E con questo, Tom aveva la risposta alla domanda che aveva dato il via all'analisi. I costi di networking non erano un singolo problema. Erano cinque problemi diversi, ognuno con una soluzione diversa.

**Come AWS Addebita il Trasferimento Dati**

Il prezzo del trasferimento dati di AWS è asimmetrico:

**In entrata in AWS (inbound)**: Gratuito. Puoi caricare quanti dati vuoi.

**In uscita da AWS verso internet (outbound)**: Addebitato. I primi 100GB/mese sono gratuiti. Dopo:

- $0,09/GB per i primi 10TB/mese (regioni USA)
- $0,085/GB per i successivi 40TB
- Inferiore a volumi più elevati

**All'interno della stessa Availability Zone**: Gratuito. Le istanze EC2 che comunicano tra loro nella stessa AZ non pagano nulla.

**Tra Availability Zone (stessa regione)**: $0,01/GB per ogni direzione. Un costo piccolo ma reale.

**Tra Regioni**: $0,02-0,08/GB a seconda delle regioni. Il traffico cross-region è significativamente più costoso.

**NAT Gateway**: $0,045/GB elaborato. Ogni byte che la tua istanza EC2 privata invia attraverso il NAT Gateway per raggiungere internet — e ogni byte che torna indietro — viene addebitato.

**CloudFront**: Tariffe di trasferimento dati inferiori rispetto al trasferimento diretto da AWS a internet. $0,085/GB per i primi 10TB (leggermente meno del trasferimento dati diretto). CloudFront spesso riduce i costi totali di trasferimento perché il suo caching edge significa che l'origine serve i dati meno frequentemente.

**La Scomposizione di Tom**

"Quanto costa al mese?" chiese Tom, per ogni voce a turno. Le aggiunse a una scheda separata nel foglio di calcolo — non il totale mensile, ma ogni categoria analizzata separatamente. Il totale era meno utile del capire quale parte della bolletta era quale tipo di costo.

Dopo aver categorizzato ogni voce:

**Dati in uscita verso internet**: $214/mese

- Risposte API ai clienti in tutto il mondo
- Asset ancora serviti direttamente da S3 e dall'ALB ai client, bypassando CloudFront (le cache fill stesse — CloudFront che recupera da un'origine AWS — sono gratuite: AWS rinuncia al trasferimento origin-to-CloudFront)

**Elaborazione NAT Gateway**: $289/mese

- Server applicativi che chiamano API esterne (processore di pagamento, servizio email, dati mappe)
- Chiamate DynamoDB che passano attraverso il NAT Gateway (prima che fossero configurati endpoint VPC per alcune tabelle)

**Trasferimento dati cross-AZ**: $178/mese

- Load balancer verso istanze EC2 (il load balancer è in una AZ, alcune istanze in un'altra)
- Server applicativo verso replica di lettura RDS (in una AZ diversa)

**Trasferimento dati cross-region**: $166/mese

- Replica Aurora Global Database (primario in us-west-2, reader in us-east-1)
- S3 Cross-Region Replication per i backup
- La pipeline di test dimenticata di Leo ($6/mese di questo totale)

**NAT Gateway: La Sorpresa Più Grande**

$289/mese in commissioni di elaborazione NAT Gateway era la voce più grande. Quando Tom aveva guardato l'ultima volta questa riga — quando aveva configurato i Gateway Endpoint — l'elaborazione NAT era di $8,40 al mese. Da allora, il volume degli ordini si era moltiplicato e una flotta di nuovi servizi in background era entrata in produzione, ognuno che spediva log, interrogava code e recuperava credenziali attraverso lo stesso NAT Gateway. E l'analisi dei VPC Flow Log l'aveva resa specifica: il principale consumatore erano i server applicativi che chiamavano le API dei servizi AWS (SSM, Secrets Manager, CloudWatch Logs) attraverso il NAT Gateway.

Nel Capitolo 25, Tom aveva configurato i VPC Gateway Endpoint per S3 e DynamoDB. Erano gratuiti. Ma si era perso la configurazione degli Interface Endpoint per diversi altri servizi:

- Systems Manager (SSM) per la gestione delle patch
- Secrets Manager per il recupero delle credenziali
- CloudWatch per la spedizione di metriche e log
- SQS per il polling dei messaggi

Ogni chiamata a questi servizi da istanze EC2 private stava passando attraverso il NAT Gateway. Ogni chiamata addebitava $0,045/GB.

Potresti chiederti perché AWS addebita per il traffico che passa attraverso il NAT Gateway quando sei già all'interno della rete di AWS. La risposta è che il NAT Gateway stesso è un servizio gestito — costa denaro da gestire, e AWS trasferisce quel costo per gigabyte. I VPC Endpoint eliminano l'intermediario, ed è per questo che riducono la bolletta.

"Aspetta — ma *perché* stiamo pagando tariffe NAT per questi?" chiese Maya, quando Tom mostrò i numeri. "Abbiamo configurato Gateway Endpoint per S3 e DynamoDB. Perché non abbiamo fatto lo stesso per SSM e CloudWatch?"

"I Gateway Endpoint sono disponibili solo per S3 e DynamoDB," disse Tom. "Per tutto il resto — SSM, Secrets Manager, SQS — hai bisogno degli Interface Endpoint. Non sono gratuiti, ma sono più economici dell'instradamento attraverso NAT ai volumi che stiamo generando."

**Interface Endpoint** per questi servizi: $0,01/ora per AZ + $0,01/GB di dati elaborati.

Al volume di Nimbus, l'Interface Endpoint per SSM costerebbe circa $25/mese (costi orari più elaborazione per GB) e risparmierebbe circa $45/mese in costi del NAT Gateway (perché SSM genera un volume significativo di dati per la gestione delle patch e le chiamate al parameter store).

I costi degli endpoint e i risparmi variavano per servizio e volume. Tom calcolò che configurare Interface Endpoint per i quattro servizi ad alto traffico — due AZ ciascuno, più l'elaborazione $0,01/GB sui 3,9TB che avrebbero gestito — sarebbe costato circa $97/mese in totale e avrebbe risparmiato circa $176/mese in elaborazione del NAT Gateway.

Risparmio netto: $78/mese solo dalla configurazione degli endpoint.

"E se qualcuno cercasse di intrufolarsi?" disse Priya, quando la conversazione sul VPC endpoint si spostò all'implementazione. "Il VPC endpoint significa che il traffico non tocca mai internet pubblico — non è solo costo, è riduzione della superficie di attacco. Avremmo dovuto farlo già per il solo beneficio di sicurezza."

"D'accordo," disse Tom. "Il risparmio sui costi è un bonus."

Leo guardò la lista dei servizi che stavano instradando attraverso NAT. "Potrei aver configurato gli endpoint di logging di CloudWatch senza controllare se esistesse un VPC endpoint per esso," disse. "Andrà bene per ora — ma sì, sta passando attraverso NAT da sei mesi."

"È nella lista," disse Tom. "CloudWatch è uno dei quattro che stiamo sistemando."

**Il Calcolo di PrivateLink: Quando Ha Senso**

C'è una versione più complessa di questa conversazione che emerge con la crescita delle architetture: usare AWS PrivateLink per fornire connettività privata a servizi ospitati da altri clienti AWS (o i tuoi stessi servizi in altri VPC).

Gli Interface Endpoint PrivateLink costano $0,01/ora per AZ più $0,01/GB. Per un servizio che genera 1TB/mese di traffico attraverso l'endpoint:

- Costo PrivateLink: $0,01 × 2 AZ × 730 ore + $0,01 × 1.000GB = $14,60 + $10 = $24,60/mese
- Instradare lo stesso traffico attraverso il NAT Gateway esistente invece: $0,045 × 1.000GB = $45/mese di costi di elaborazione incrementali

Il confronto è *incrementale*, perché il NAT Gateway rimane in ogni caso — serve ancora il resto del traffico diretto verso internet, quindi il suo costo orario ($0,045 × 2 × 730 = $65,70) non scompare quando questo servizio si sposta su un endpoint. A questo volume di traffico, PrivateLink risparmia circa $20/mese. Il punto di pareggio è circa 420GB/mese — al di sotto di questo, il costo orario dell'endpoint supera i risparmi per GB rispetto all'elaborazione NAT.

"Aspetta — ma *perché* useremmo PrivateLink invece di una VPN o del peering?" chiese Maya.

"Il VPC Peering è più semplice e gratuito per i trasferimenti intra-region," disse Tom. "Ma il peering crea una connessione completamente instradata tra VPC — qualsiasi cosa nel VPC A può potenzialmente raggiungere qualsiasi cosa nel VPC B. PrivateLink è più chirurgico. L'endpoint espone un servizio specifico, non una route di rete completa. Per le architetture attente alla sicurezza, quella specificità conta."

"E se qualcuno cercasse di intrufolarsi in un VPC in peering?" chiese Priya. "Il peering completo significa che un'istanza compromessa in un VPC ha una route verso ogni istanza nel VPC in peering."

"Questo è l'argomento per PrivateLink rispetto al peering quando ci si connette a un servizio di terze parti o a un servizio di proprietà di un team separato," disse Tom. "Peering per VPC intra-aziendali fidati. PrivateLink per qualsiasi cosa dove si vuole la connessione con la minima esposizione."

**Traffico Cross-AZ: Una Questione Architetturale**

I $178/mese di trasferimento dati cross-AZ erano più complicati.

Alcuni erano inevitabili: il load balancer distribuisce il traffico tra le AZ, quindi alcune richieste originano in una AZ e il load balancer le invia a un'istanza in un'altra AZ.

Alcuni erano ottimizzabili: l'applicazione era configurata per scrivere sul primario RDS (in us-west-2a) e leggere dalla replica di lettura (in us-west-2b). Ogni query di lettura attraversava i confini AZ.

Per le letture, una soluzione: configurare l'applicazione per preferire una replica di lettura nella stessa AZ dell'istanza richiedente. Ogni AZ ottiene la propria replica di lettura. Il traffico rimane locale.

Compromesso: più replica di lettura = più costi. Se il costo del traffico cross-AZ è di $50/mese e una replica di lettura aggiuntiva costa $190/mese, l'ottimizzazione locale per AZ non conviene.

Tom calcolò: al loro volume di query attuale, il traffico cross-AZ era solo $31/mese dei $178. Non valeva la pena aggiungere replica per questo.

Gli altri costi cross-AZ erano il routing del load balancer e la comunicazione tra servizi — in gran parte inevitabili al livello architetturale attuale.

"Questo è uno di quei casi in cui capire il costo non significa che tu debba sistemarlo," disse Tom.

"Quanto costerebbe eliminare completamente il traffico cross-AZ?" chiese Maya.

"Tutto in una singola AZ vanifica lo scopo del Multi-AZ. Quel risparmio è $31/mese al costo di perdere l'alta disponibilità."

"Quindi lo lasciamo," disse lei.

"Lo lasciamo."

**S3 Select: Ridurre il Trasferimento Dati nelle Query**

Mentre revisionava la pipeline analytics, Tom trovò un'altra ottimizzazione specifica per il modo in cui il team di analytics interrogava i grandi file S3.

Il pattern: ogni mattina, un job di analytics scaricava un file Parquet da 500MB da S3 per filtrarlo in memoria per i dati degli ordini specifici del ristorante. Circa il 95% del file veniva scartato dopo il download.

**S3 Select** permette di recuperare solo le righe e le colonne di cui hai bisogno da un oggetto S3 (CSV, JSON, Parquet), invece di scaricare l'intero file per filtrarlo nella tua applicazione.

> **Aggiornamento importante**: a metà del 2024, AWS ha smesso di offrire S3 Select ai nuovi clienti — gli utenti esistenti lo mantengono, ma è un vicolo cieco per le nuove architetture. Il principio insegnato in questa sezione (filtra al livello dello storage, non trasportare l'intero file) è senza tempo; lo strumento moderno per farlo è **Amazon Athena** (SQL direttamente su S3, incluse join e aggregazioni che S3 Select non aveva mai avuto). **S3 Object Lambda**, un tempo l'altra alternativa, ha seguito S3 Select nello stato legacy: dal 7 novembre 2025 è chiuso ai nuovi clienti (i workload esistenti continuano a funzionare). In un esame attuale, "interrogare dati direttamente su S3" punta ad Athena. La storia sotto è preservata perché il *ragionamento* — misura prima, sposta il filtro verso il dato — è la lezione.

Senza S3 Select:
```python
# Download 500MB file, process in memory
data = s3.get_object(Bucket='analytics', Key='orders-2024.csv')
df = pd.read_csv(data['Body'])
result = df[df['restaurant_id'] == '47'][['order_id', 'total']]
```

Con S3 Select:
```python
# Let S3 filter first, transfer only matching rows (~2MB instead of 500MB)
response = s3.select_object_content(
    Bucket='analytics',
    Key='orders-2024.csv',
    Expression="SELECT order_id, total FROM S3Object WHERE restaurant_id = '47'"
)
```

S3 Select riduce i dati spostati da S3 alla tua applicazione. Per file grandi con query selettive, questo può essere una riduzione di 10-100x nel volume di dati — e, poiché l'istanza analytics gira nella stessa regione del bucket, il guadagno non è sulla bolletta del trasferimento (il trasferimento S3-to-EC2 nella stessa regione è gratuito): è il compute, la memoria e il tempo spesi a scaricare e filtrare dati che vengono immediatamente scartati.

Tom lo sollevò con il team di analytics. All'inizio opposero resistenza.

"Sappiamo già scrivere pandas," disse un analista.

"Non si tratta di pandas," disse Tom. "Si tratta del fatto che stai scaricando 500MB per ottenere 2MB di dati. Il download stesso è gratuito — stessa regione — ma l'istanza no. Lo esegui per ogni ristorante: 287 ristoranti, 287 query, 140GB estratti e filtrati in pandas ogni notte. Questo è ciò che tiene occupato il box analytics per due ore — ed è per questo che è un xlarge."

"E S3 Select?"

"S3 Select addebita $0,002 per GB scansionato e $0,0007 per GB restituito — circa un decimo di centesimo per query. In cambio, l'istanza riceve 600MB a notte invece di 140GB, il job finisce in minuti, e il box può scendere di dimensione."

"Sono $450 al mese," disse l'analista, dopo aver fatto i calcoli sull'istanza — una stima approssimativa dalla tariffa oraria dell'istanza e dalle ore che passava a macinare.

"Ecco perché sono qui," disse Tom. Il numero reale si sarebbe rivelato inferiore — quando Tom estrasse in seguito la spesa di compute effettiva attribuibile al job notturno, arrivava a $202/mese, non $450. I calcoli approssimativi trovano il problema; la misurazione lo dimensiona.

Tom ne parlò prima con Leo, prima di coinvolgere il team di analytics nella conversazione. Sapeva che Leo avrebbe opposto resistenza, e voleva capire la resistenza prima che diventasse un dibattito di gruppo.

"S3 Select risparmierebbe $180/mese sulle query della pipeline analytics," disse Tom.

"Richiede di riscrivere ogni query," disse Leo.

"Richiede di cambiare il pattern di accesso ai dati da 'scarica e filtra' a 'interroga via S3 Select API.'"

"Che è una riscrittura."

"È un cambio nelle chiamate alla libreria client," disse Tom. "La logica delle query — le espressioni di filtro — rimane la stessa. Quello che cambia è dove avviene il filtraggio. Attualmente: EC2. Con S3 Select: S3."

"Ho letto la documentazione di S3 Select," disse Leo. "Non puoi fare join. Non puoi fare aggregazioni più complesse di SUM e COUNT di base. Alcune delle nostre query analytics sono più sofisticate di così."

"Lo so," disse Tom. "Ed è per questo che non sto proponendo S3 Select per tutte le query. Lo propongo per le query di riepilogo giornaliero specifiche per ristorante. È il file Parquet da 500MB filtrato per restaurant_id, che estrae due colonne. Quella query è un puro filtro-e-proiezione. S3 Select è esattamente lo strumento giusto per quel caso."

Leo rimase in silenzio per un momento. Aprì la query in questione.

```python
# Current: download 500MB, filter in memory
df = pd.read_parquet('s3://analytics/orders-2024.parquet')
result = df[df['restaurant_id'] == restaurant_id][['order_id', 'total', 'timestamp']]
```

"La versione S3 Select sarebbe cosa — la chiamata select_object_content?"

"Sì," disse Tom. "Sostituiresti la chiamata read_parquet con una chiamata select_object_content che spinge la clausola WHERE a S3. Il risultato torna già filtrato. Ottieni uno stream di record corrispondenti invece dell'intero file Parquet."

"E dovrei gestire la risposta in modo diverso."

"Il formato della risposta è CSV per default. Avresti bisogno di un piccolo wrapper per rianalizzarlo in un DataFrame, oppure usi il formato di output Parquet se vuoi mantenere la logica di parsing attuale."

Leo ci guardò. "Quanto lavoro è?"

"Mezza giornata," disse Tom. "Forse una giornata se vuoi testarlo accuratamente su tutti i 287 restaurant ID nel batch notturno."

"Per $180/mese."

"$2.160 all'anno," disse Tom. "E l'approccio scala. A 2.000 ristoranti, la stessa query sullo stesso file costa ancora di più senza S3 Select. Stai investendo una giornata oggi per evitare un problema molto più grande in seguito."

Leo chiuse il notebook. "Le query dove S3 Select non funziona — le query di aggregazione, i confronti tra ristoranti — rimangono com'erano?"

"Rimangono com'erano," confermò Tom. "Non sto cercando di riscrivere la pipeline analytics. Sto cercando di smettere di scaricare 500 MB per usarne 2 MB."

"Okay," disse Leo. "Lo faccio questa settimana."

Lo fece. L'implementazione richiese sei ore. Avvolse la chiamata S3 Select in una funzione di utilità che aveva la stessa interfaccia della chiamata read_parquet esistente — il codice chiamante nel batch notturno non richiedeva nessuna modifica. Solo il livello di accesso ai dati cambiò.

Il mese seguente, la bolletta di compute notturna della pipeline analytics scese da $202 a $22 — il job finiva in minuti invece di ore, su un'istanza più piccola. Il risparmio di $180/mese era costato sei ore di tempo di engineering. Annualizzato, era un ritorno del 1.800% sull'investimento di tempo.

"La parte a cui ho resistito," disse Leo, nella revisione mensile, "era la riscrittura. Si è rivelata una sostituzione di funzione, non una riscrittura. Stavo risolvendo un problema immaginario."

"Vale la pena notarlo," disse Tom. "Quando stai valutando se implementare un'ottimizzazione, sii specifico su cosa richiede effettivamente il lavoro. 'Richiede di riscrivere le query' era la versione immaginaria. 'Richiede di cambiare la funzione di accesso ai dati' era la versione reale."

**"Costo Intenzionale vs Non Intenzionale"**

Alla fine delle tre settimane di analisi del networking, Tom portò la scomposizione completa al team. Aveva una nuova colonna nel suo foglio di calcolo: "Intenzionale?" con sì o no per ogni voce.

"Questo è il frame che sto usando ora," disse. "Non solo 'quanto costa' ma 'abbiamo deciso di spendere questo?'"

"Cos'è un costo intenzionale?" chiese Maya.

"La replica di Aurora Global Database. Abbiamo deciso di replicare in us-east-1 perché abbiamo partner ristoratori sulla East Coast. Sono $120/mese di replica cross-region — all'incirca il doppio della stima approssimativa dei giorni di pianificazione DR. Abbiamo scelto quel costo per una ragione specifica."

"E non intenzionale?"

"La pipeline analytics di Leo che scriveva in us-east-1 per cinque mesi dopo che un test era finito. Nessuno lo aveva scelto. Stava accadendo perché nessuno stava guardando."

"E i costi del NAT Gateway per le chiamate ai servizi AWS?"

"Da qualche parte nel mezzo," disse Tom. "Non abbiamo esplicitamente deciso di instradare SSM attraverso il NAT Gateway — era il default. Non sapevamo che ci fosse un'opzione più economica. È intenzionale? Abbiamo fatto una scelta, solo non sapevamo cosa stavamo scegliendo."

"Questa è la categoria più pericolosa," disse Priya. "Le decisioni che non sai di stare prendendo."

"Ecco perché l'analisi dei VPC Flow Log è importante," disse Tom. "Rende l'invisibile visibile. Ogni byte che attraversa un confine ora ha una storia che possiamo tracciare."

"Abbiamo pensato a cosa succede se lasciamo che questo si degradi di nuovo?" chiese Priya. "Abbiamo fatto un'analisi una tantum. Tra sei mesi, Leo avrà creato un altro bucket di test da qualche parte."

"Sarò qui," disse Leo. "La prossima volta la farò in eu-west-1 così almeno costa di più per GB e ve ne accorgete più in fretta."

"Revisione mensile dei VPC Flow Log," disse Tom. "La aggiungo alla revisione trimestrale dei costi. Se vediamo un nuovo flusso cross-region o un picco del NAT Gateway, lo tracciamo prima della prossima bolletta."

**Variante: Il Compromesso che Accetti**

Se elimini il traffico cross-AZ eseguendo tutto in una singola Availability Zone, risparmi circa $31/mese al volume attuale di Nimbus — ma perdi la ridondanza Multi-AZ che vale molto di più in termini di rischio di incidenti. La conversazione matura sui costi non riguarda sempre il trovare risparmi; a volte riguarda il capire esattamente per cosa stai pagando e decidere che ne vale la pena.

Il costo cross-AZ è il prezzo della resilienza. Alcuni costi di networking sono impegni architetturali, non inefficienze.

Connessione SAA-C03: l'esame presenta frequentemente scenari in cui una "ottimizzazione dei costi" eliminerebbe una ridondanza. La risposta corretta di solito è preservare la ridondanza e ottimizzare altrove — conosci la differenza tra spreco e costo dell'affidabilità.

**CloudFront: Lo Sconto sul Trasferimento Dati**

Ecco un fatto controintuitivo: servire i dati attraverso CloudFront è generalmente più economico che servirli direttamente da EC2 o S3.

**EC2 diretto verso internet**: $0,09/GB
**CloudFront verso internet**: $0,085/GB (leggermente più economico)

Ma il risparmio reale non è la tariffa per GB — è che CloudFront memorizza i dati nella cache nelle edge location. Se 1.000 utenti richiedono la stessa foto del menu:

- **Senza CloudFront**: 1.000 richieste escono direttamente da S3 verso internet × dimensione della foto × $0,09/GB
- **Con CloudFront**: i client ottengono la foto dall'edge alla tariffa di CloudFront ($0,085/GB), e la cache fill — CloudFront che recupera da S3 sul singolo miss — è **gratuita** (AWS rinuncia al trasferimento origin-to-CloudFront; paghi solo le richieste GET all'origine)

Per Nimbus con un tasso di cache hit dell'83% (dal Capitolo 13), l'83% delle richieste non ha mai toccato l'origine — meno richieste all'origine, meno carico sull'origine, e ogni byte fatturato alla tariffa edge invece della tariffa internet di S3.

"CloudFront non è solo un CDN per le performance," disse Tom. "È anche un'ottimizzazione dei costi per il trasferimento dati."

Leo sembrava pensieroso. "Dovremmo spostare tutta la distribuzione di contenuti statici attraverso CloudFront, anche per gli asset che non sono sensibili alla latenza."

"Esatto. Se gli utenti lo stanno scaricando da AWS, dovrebbe passare per CloudFront."

**L'Ottimizzazione Completa del Networking**

Dopo tre settimane di analisi e implementazione:

| Voce di Costo | Prima | Dopo | Risparmio Mensile |
|---|---|---|---|
| NAT Gateway (Interface Endpoint) | $289 | $211 | $78 |
| Ottimizzazione CloudFront (spostamento di più asset) | $214 | $147 | $67 |
| Traffico cross-AZ (accettato com'è) | $178 | $178 | $0 |
| Traffico cross-region (bucket di test di Leo) | $166 | $160 | $6 |
| **Totale** | **$847** | **$696** | **$151/mese** |

$151/mese, $1.812/anno in risparmi sul networking. Modesto rispetto a compute e storage, ma significativo.

Ancora più importante: Tom ora capiva ogni riga della bolletta di networking. Poteva spiegare ogni costo e aveva deliberatamente deciso quali ottimizzare e quali accettare. La distinzione tra costo intenzionale e non intenzionale era ora esplicita e documentata.

## Punti di Forza e Limitazioni

**Costi del NAT Gateway**:

- Grandi volumi di dati attraverso il NAT Gateway si accumulano rapidamente
- I VPC Endpoint eliminano completamente alcuni costi NAT
- Rivedi quali servizi chiamano le tue istanze private e se sono disponibili endpoint

**CloudFront per il costo**:

- Il tasso di cache hit determina direttamente i risparmi sui costi
- Alto tasso di cache hit = meno richieste all'origine e meno carico sull'origine, più byte fatturati alla tariffa viewer-side più economica di CloudFront (il trasferimento origin-to-CloudFront da origini AWS non viene addebitato affatto)
- Sposta tutta la distribuzione di asset statici attraverso CloudFront

**Compromessi cross-AZ**:

- Eliminare il traffico cross-AZ di solito richiede modifiche architetturali che costano più dei risparmi
- Calcola attentamente prima di ottimizzare

**S3 Select** (legacy — non disponibile per i nuovi clienti dal 2024; usa Athena invece. S3 Object Lambda è ora anch'esso legacy — chiuso ai nuovi clienti dal novembre 2025, i workload esistenti non sono interessati):

- Il principio rimane valido: filtra al livello dello storage invece di scaricare grandi oggetti S3 — i risparmi si manifestano nel tempo di compute, nella dimensione dell'istanza e nella durata del job (il trasferimento S3 nella stessa regione è già gratuito)
- Non aiuta quando hai bisogno dell'intero file

## Riepilogo

Tom chiuse l'analisi del networking con un numero sulla lavagna e una comprensione più chiara di cosa fosse effettivamente l'ultima incognita sulla bolletta. I $847/mese di costi di networking non erano stati un mistero di incompetenza — erano il costo atteso di un sistema distribuito che si estendeva su availability zone, serviva utenti globali e replicava dati tra regioni. La maggior parte valeva la pena pagarla. Una parte no. Il progresso chiave era riuscire a distinguere quale era quale.

- AWS addebita per i **dati in uscita** (internet: ~$0,09/GB), **traffico cross-AZ** ($0,01/GB per ogni direzione), **traffico cross-region** ($0,02-0,08/GB) e **elaborazione NAT Gateway** ($0,045/GB).
- **I dati in entrata** sono gratuiti. **Il traffico nella stessa AZ** è gratuito.
- **VPC Flow Log** rivelano quali flussi di traffico specifici all'interno dei tuoi VPC generano ciascuna categoria di costo — essenziale per un'ottimizzazione mirata. I flussi che non attraversano mai un'interfaccia di rete VPC (come CloudFront che recupera da un'origine S3) hanno bisogno dei propri strumenti: log standard di CloudFront o log di accesso al server S3.
- **VPC Gateway Endpoint** (S3, DynamoDB): Gratuiti. Eliminano i costi del NAT Gateway per questi servizi.
- **VPC Interface Endpoint**: Prezzati per ora più per GB. Più economici del NAT Gateway per servizi ad alto volume.
- **CloudFront** serve i dati a tariffe inferiori rispetto al traffico diretto EC2-to-internet e riduce drasticamente il volume di trasferimento dall'origine attraverso il caching.
- La domanda critica non è solo "quanto" ma "questo costo è intenzionale?" I costi non intenzionali — pipeline di test dimenticate, routing di default attraverso NAT — sono dove si nascondono i veri risparmi.

## Suggerimenti per l'Esame

*Dominio SAA-C03: Design Cost-Optimized Architectures (Dominio 4, Task 4.4)*

- **NAT Gateway vs VPC Endpoint**: Scenario d'esame: "EC2 in subnet privata chiama frequentemente S3/DynamoDB — come ridurre i costi del NAT Gateway?" → VPC Gateway Endpoint (gratuiti per S3 e DynamoDB).
- **Regole di prezzo del trasferimento dati**:
  - In entrata in AWS: gratuito
  - Stessa AZ: gratuito
  - Cross-AZ: addebitato
  - Cross-region: addebitato (tariffa più alta)
  - Internet: addebitato (tariffa significativa)
- **CloudFront come ottimizzazione dei costi**: "Ridurre i costi di trasferimento dati per la distribuzione di contenuti globale" → CloudFront. Il livello di cache riduce le richieste all'origine.
- **S3 Transfer Acceleration**: Velocizza i caricamenti *verso* S3 usando le edge location di CloudFront. Costo più elevato rispetto a S3 standard. Da usare per clienti che caricano file grandi da posizioni geograficamente distanti.
- **Costi di replica cross-region**: Replicare dati tra regioni comporta costi di trasferimento dati. Per S3 CRR, paghi sia la tariffa di trasferimento dati in uscita che il costo della richiesta S3.
- **PrivateLink (VPC Interface Endpoint)**: Fornisce connettività privata ai servizi AWS e ai servizi ospitati da altri clienti AWS. Più sicuro dell'instradamento attraverso NAT, spesso più economico per servizi ad alto volume. Il punto di pareggio rispetto all'elaborazione del NAT Gateway è circa 420GB/mese (considerando il costo orario per AZ dell'endpoint, e assumendo che il NAT Gateway rimanga per altro traffico).

## Esercizi

**Esercizio 1 — Ricordo**

Spiega la differenza tra un VPC Gateway Endpoint e un VPC Interface Endpoint. Per quali servizi AWS è disponibile ciascuno, e qual è il costo di ciascuno?

*(Suggerimento: pensa al sistema di pedaggi — i Gateway Endpoint per S3 e DynamoDB sono le strade secondarie gratuite, mentre gli Interface Endpoint addebitano un piccolo pedaggio che è comunque più economico che prendere il tunnel NAT ogni giorno.)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: L'applicazione di un'azienda gira su istanze EC2 in subnet private. Le istanze effettuano frequenti chiamate API ad Amazon SQS e Amazon S3. Attualmente, tutto il traffico esce attraverso un NAT Gateway. Il team vuole ridurre i costi del NAT Gateway. La sicurezza dei dati deve essere mantenuta — nessun traffico deve attraversare internet pubblico.

Quale approccio soddisfa MEGLIO questi requisiti con il minimo costo continuativo?

A) Crea un Gateway Endpoint per SQS e un Gateway Endpoint per S3
B) Crea Interface Endpoint per entrambi SQS e S3
C) Crea un Interface Endpoint per SQS e un Gateway Endpoint per S3
D) Rimuovi il NAT Gateway e usa direttamente l'internet gateway per le chiamate API

**Suggerimento 1**: I Gateway Endpoint sono disponibili solo per S3 e DynamoDB.

**Suggerimento 2**: Gli Interface Endpoint sono disponibili per SQS e molti altri servizi (ma costano).

**Suggerimento 3**: Un Internet Gateway nella route table della subnet privata la renderebbe una subnet pubblica — violando i requisiti di sicurezza.

**Risposta**: C

**Spiegazione**: S3 usa un Gateway Endpoint (gratuito). SQS richiede un Interface Endpoint (a pagamento). Questa combinazione elimina i costi di elaborazione del NAT Gateway per entrambi i servizi. Tutto il traffico rimane all'interno della rete privata di AWS — nessun attraversamento di internet pubblico.

**Perché non A?** I Gateway Endpoint non sono disponibili per SQS. Solo S3 e DynamoDB hanno Gateway Endpoint.

**Perché non B?** Pur funzionando, usare un Interface Endpoint per S3 (invece del Gateway Endpoint gratuito) comporta costi orari non necessari. Usa sempre il Gateway Endpoint gratuito per S3 e DynamoDB.

**Perché non D?** Aggiungere una route all'Internet Gateway dalla subnet privata la rende una subnet pubblica. Le istanze EC2 nelle subnet private di solito non hanno Elastic IP, quindi non potrebbero instradare attraverso un Internet Gateway senza ulteriori modifiche — e farlo le esporrebbe al traffico internet in entrata.

*Dominio SAA-C03: Design Cost-Optimized Architectures — Task 4.4*

**Esercizio 3 — Sfida di Architettura** *(Opzionale)*

Gli utenti della East Coast di Nimbus generano traffico significativo. L'applicazione li serve da us-west-2 (Oregon). Attualmente:

- Le risposte API vanno direttamente dalle istanze EC2 di us-west-2 agli utenti della East Coast (~80ms, $0,09/GB)
- Le foto del menu vanno da S3 us-west-2 attraverso l'edge CloudFront a Boston (~8ms dopo il caching)

Il team sta considerando di aggiungere una seconda regione applicativa in us-east-1 (Northern Virginia) per gli utenti della East Coast per ridurre la latenza delle API.

Analizza i costi di trasferimento dati di questa modifica. Quali nuovi costi di trasferimento cross-region comporterebbe la configurazione dual-region? Il routing basato sulla latenza di Route 53 ridurrebbe o aumenterebbe i costi totali di trasferimento? In quali condizioni (volume di traffico, sensibilità alla latenza) la configurazione dual-region sarebbe conveniente?

*(Non esiste una risposta univoca corretta. L'obiettivo è esercitarsi nell'analisi costi-benefici multi-region.)*

## Scena Post-Crediti

Tom chiuse l'analisi del networking.

Impatto totale del progetto di ottimizzazione di tre mesi:

- Compute Savings Plan EC2: -$14.200/anno
- Policy di lifecycle S3: -$7.800/anno
- Storage (S3 + EBS): -$6.200/anno
- Tier database: -$5.892/anno
- Networking: -$1.812/anno
- **Totale: -$35.904/anno**

Lo scrisse sulla lavagna nella sala riunioni.

Leo la guardò fisso. "Trentacinquemila."

"E rotti," disse Tom.

"All'anno."

"All'anno."

Priya fece i calcoli. "Stavamo spendendo $2.992 al mese per cose che non creavano valore."

"Non tutte," corresse Tom. "Alcune erano cose da cui ottenevamo valore, ma pagavamo troppo. I Savings Plan — ottenevamo esattamente la stessa capacità EC2, solo a un prezzo migliore."

Maya rimase a lungo davanti alla lavagna.

"Quando abbiamo iniziato Nimbus," disse, "ogni dollaro contava. Riuscivamo a malapena a permetterci la prima istanza EC2."

"Sì," disse Tom.

"E a un certo punto abbiamo smesso di guardare i dollari con la stessa attenzione."

"La crescita fa questo," disse Priya. "Il focus si sposta sul costruire, non sull'ottimizzare."

"Entrambi contano," disse Maya. "Entrambi, sempre. Aggiungi questo alla wiki. E imposta una revisione trimestrale sui costi."

Tom stava già aprendo il calendario.

Nei prossimi capitoli: ci allontaniamo dai singoli servizi e iniziamo a pensare come architetti.
