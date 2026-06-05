# Capitolo 30: Il Costo Nascosto

I costi di storage si presentano come una singola riga: "S3: $198". I costi di calcolo si presentano come una singola riga: "EC2: $2.340". I costi di rete si diffondono su dozzine di voci di spesa con nomi come "Trasferimento Dati in Uscita", "Elaborazione Gateway NAT", "Trasferimento Dati Peering VPC" e "Trasferimento Dati CloudFront". La maggior parte degli ingegneri li somma una volta, li guarda e li somma di nuovo.

Tom aveva detto: "I costi di rete. Quello è il prossimo".

Prelevò la fattura. Trovò la sezione relativa al trasferimento dati. Sommò tutte le voci di spesa.

I costi di rete in AWS sono come il sistema di pedaggi di una città: entrare in città è gratuito, ma ogni tunnel che si prende in uscita costa, e muoversi tra i quartieri costa un po'. La maggior parte delle persone non pensa ai pedaggi finché non riceve una fattura alla fine del mese e si rende conto di aver preso il tunnel ogni giorno quando c'era una strada libera per tutto il tempo. L'obiettivo di questo capitolo è comprendere ogni casello autostradale – e decidere quali sono degni di essere pagati.

$847/mese.

"Stiamo spendendo $847 al mese per il trasferimento dati", disse.

"È molto?" chiese Leo.

"È più di quanto il nostro account S3 fosse prima che lo ottimizzassimo. E non sapevo nemmeno di avere un account per il trasferimento dati di queste dimensioni".

Maya guardò. "Cosa significa esattamente il trasferimento dati?"

"È ciò che AWS addebita per spostare i byte in giro. Byte in AWS: solitamente gratuito. Byte fuori da AWS verso internet: addebitato. Byte tra servizi in diverse regioni: addebitato. Byte che passano attraverso un Gateway NAT: addebitato".

"Puoi scomporlo?"

Tom lo poteva. E ciò che scoprì cambiò il modo in cui il team pensava alla propria architettura.

**Come AWS Addebita i Costi di Trasferimento Dati**

I prezzi di trasferimento dati di AWS sono asimmetrici:

**In entrata in AWS (inbound)**: Gratuito. Puoi caricare quanti dati vuoi.

**In uscita da AWS verso internet (outbound)**: Addebitato. I primi 100GB/mese sono gratuiti. Dopo di ciò:

- $0.09/GB per i primi 10TB/mese (regioni USA)
- $0.085/GB per i successivi 40TB
- Inferiore a volumi più elevati

**All'interno della stessa Zona di Disponibilità (same Availability Zone)**: Gratuito. Le istanze EC2 che comunicano tra loro nella stessa zona di disponibilità non pagano nulla.

**Tra le Zone di Disponibilità (same region)**: $0.01/GB in ciascuna direzione. Un piccolo ma reale costo.

**Tra le Regioni**: $0.02-0.08/GB a seconda delle regioni. Il traffico inter-regione è significativamente più costoso.

**Gateway NAT**: $0.045/GB elaborato. Ogni byte che la tua istanza EC2 privata invia attraverso il Gateway NAT per raggiungere internet – e ogni byte che torna indietro – è addebitato.

**CloudFront**: Tassi di trasferimento dati inferiori rispetto al trasferimento diretto da AWS verso internet. $0.085/GB per i primi 10TB (leggermente inferiore al trasferimento dati diretto). CloudFront spesso riduce i costi totali di trasferimento perché il suo caching edge significa che l'origine serve i dati meno frequentemente.

**La Scomposizione di Tom**

Dopo aver categorizzato ogni voce di spesa:

**Trasferimento dati in uscita verso internet**: $214/mese

- Risposte API ai clienti in tutto il mondo
- Riempimento della cache CloudFront (quando le posizioni edge recuperano dai sorgenti)

**Elaborazione Gateway NAT**: $289/mese

- Server di applicazioni che chiamano API esterne (processore di pagamento, servizio di posta elettronica, dati di mappe)
- Chiamate DynamoDB che passano attraverso il Gateway NAT (prima che fossero impostati endpoint VPC per alcuni tavoli)

**Trasferimento dati tra Zone di Disponibilità**: $178/mese

- Load balancer verso istanze EC2 (il load balancer è in una zona di disponibilità, alcune istanze in un'altra)
- Server di applicazioni verso replica RDS in lettura (in un'altra zona di disponibilità)

**Trasferimento dati tra Regioni**: $166/mese

- Replica Aurora Global Database (primaria in us-east-1, lettore in us-west-2)
- S3 Cross-Region Replication per i backup

**Gateway NAT: La Sorpresa Più Grande**

$289/mese in commissioni di elaborazione Gateway NAT era l'elemento più grande. E in parte era non necessario.

Nel Capitolo 11, Tom aveva configurato Endpoint Gateway VPC per S3 e DynamoDB. Questi erano gratuiti. Ma non aveva configurato Endpoint Interfacce per altri servizi:

- Systems Manager (SSM) per la gestione dei patch
- Secrets Manager per il recupero delle credenziali
- CloudWatch per l'invio di metriche e log
- SQS per il polling dei messaggi

Ogni chiamata a questi servizi da istanze EC2 private stava passando attraverso il Gateway NAT. Ogni chiamata addebitava $0.045/GB.

**Endpoint Interfacce** per questi servizi: $0.01/ora per zona di disponibilità + $0.01/GB dati elaborati.

A seguito del volume di Nimbus, l'Endpoint SSM costerebbe circa $15/mese e risparmierebbe circa $43/mese nelle commissioni di Gateway NAT (perché SSM genera un volume significativo di dati per la gestione dei patch e le chiamate di store dei parametri).

I costi degli endpoint e i risparmi variavano in base al servizio e al volume. Tom calcolò che la configurazione degli endpoint per i quattro servizi ad alto traffico costerebbe $62/mese in totale e risparmierebbe circa $140/mese nelle commissioni di elaborazione Gateway NAT.

Risparmio netto: $78/mese grazie alla sola configurazione degli endpoint.

**Traffico tra Zone di Disponibilità: Una Domanda Architetturale**

I $178/mese di traffico tra le zone di disponibilità erano più complicati.

Alcuni di essi erano inevitabili: il load balancer distribuisce il traffico tra le zone di disponibilità, quindi alcuni richieste originano in una zona di disponibilità e il load balancer le inoltra a un'istanza in un'altra zona di disponibilità.

Some parti erano ottimizzabili: l'applicazione era configurata per scrivere su RDS primario (in us-east-1a) e leggere dalla replica di lettura (in us-east-1b). Ogni query di lettura attraversava i confini AZ.

Per le letture, una soluzione: configurare l'applicazione per preferire una replica di lettura nella stessa AZ dell'istanza richiedente. Ogni AZ ha la propria replica di lettura. Il traffico rimane locale.

Compromesso: più repliche di lettura = più costi. Se il costo del traffico cross-AZ è di $50 al mese e una replica di lettura aggiuntiva costa $190 al mese, l'ottimizzazione locale per AZ non ripaga.

Tom ha calcolato: al loro volume di query attuale, il traffico cross-AZ era solo di $31 al mese di $178. Non vale la pena aggiungere repliche.

Gli altri costi cross-AZ erano il routing del load balancer e la comunicazione tra servizi — in gran parte inevitabile al livello di architettura attuale.

"Questo è uno di quei casi in cui capire il costo non significa che tu debba risolverlo", ha detto Tom.

"Quanto costerebbe eliminare il traffico cross-AZ completamente?" ha chiesto Maya.

"Tutto in una singola AZ annulla lo scopo di Multi-AZ. Quello è un risparmio di $31 al mese a costo di perdere l'alta disponibilità."

"Quindi la lasciamo", ha detto lei.

"La lasciamo."

Questa è la conversazione matura sui costi: a volte paghi per qualcosa perché l'alternativa costa di più in termini di rischio.

**CloudFront: Il Sconto sul Trasferimento Dati**

Ecco un fatto controintuitivo: servire i dati tramite CloudFront è generalmente più economico che servirli direttamente da EC2 o S3.

**EC2 diretto verso internet**: $0.09/GB
**CloudFront verso internet**: $0.085/GB (leggermente più economico)

Ma il vero risparmio non è il tasso per GB — è che CloudFront memorizza nella cache i dati nelle posizioni di edge. Se 1.000 utenti richiedono la stessa foto del menu:

- **Senza CloudFront**: 1.000 richieste colpiscono l'origine S3 × dimensione della foto × $0.09/GB
- **Con CloudFront**: 1 richiesta colpisce S3 (mancata memorizzazione nella cache) + 999 richieste servite dalla cache di edge a tariffe CloudFront

Per Nimbus con un tasso di successo della memorizzazione nella cache dell'83% (dal Capitolo 13), stava servendo l'83% delle richieste dalla cache di edge. I dati di origine effettivi rappresentavano il 17% del traffico totale — l'83% del loro traffico "in uscita" era memorizzato nella cache sul bordo.

"CloudFront non è solo un CDN per le prestazioni", ha detto Tom. "È anche un'ottimizzazione dei costi per il trasferimento dei dati."

Leo sembrava pensieroso. "Dovremmo spostare tutta la consegna dei contenuti statici tramite CloudFront, anche per gli asset che non sono sensibili alla latenza."

"Corretto. Se gli utenti lo stanno scaricando da AWS, dovrebbe andare tramite CloudFront."

**S3 Select: Riduzione dei Trasferimenti di Dati nelle Query**

Un'ottimizzazione sottile: **S3 Select** consente di recuperare solo le righe e le colonne di cui è necessario da un oggetto S3 (CSV, JSON, Parquet), piuttosto che scaricare l'intero file per filtrarlo nella propria applicazione.

Senza S3 Select:
```

```python
# Download 500MB file, process in memory
data = s3.get_object(Bucket='analytics', Key='orders-2024.csv')
df = pd.read_csv(data['Body'])
result = df[df['restaurant_id'] == '47'][['order_id', 'total']]

With S3 Select:

## S3 Select: Interrogare i tuoi dati direttamente in S3

S3 Select ti permette di interrogare direttamente i dati all'interno degli oggetti S3 utilizzando query SQL.  Questo significa che puoi filtrare, aggregare e raggruppare i dati senza dover scaricare l'intero oggetto S3 nel tuo ambiente locale o in un'istanza EC2.  È un modo molto efficiente per analizzare grandi quantità di dati archiviati in S3, soprattutto quando non hai bisogno di tutti i dati.

### Come funziona

S3 Select funziona analizzando i dati direttamente all'interno dell'oggetto S3 e restituendo solo i dati che corrispondono alla tua query SQL.  Questo processo è gestito dal servizio S3 Select, che ottimizza le query per prestazioni elevate.

### Casi d'uso comuni

*   **Analisi di log:**  Puoi utilizzare S3 Select per analizzare i file di log di Amazon CloudWatch, Amazon EC2 e altri servizi AWS.
*   **Analisi di dati di sensori:**  Puoi interrogare i dati di sensori archiviati in S3 per identificare tendenze e anomalie.
*   **Analisi di dati di marketing:**  Puoi analizzare i dati di marketing archiviati in S3 per comprendere il comportamento dei clienti.
*   **Backup e ripristino:**  Puoi utilizzare S3 Select per interrogare i backup archiviati in S3 e ripristinare i dati necessari.

### Esempio di query SQL

Ecco un esempio di query SQL che puoi utilizzare per filtrare i dati in un oggetto S3:

```sql
SELECT column1, column2 FROM s3://your-bucket/your-object WHERE column3 > 10

Questa query seleziona le colonne `column1` e `column2` dall'oggetto S3 `s3://your-bucket/your-object` dove il valore della colonna `column3` è maggiore di 10.  Sostituisci `your-bucket` e `your-object` con i nomi del tuo bucket S3 e dell'oggetto.

```python
# Let S3 filter first, transfer only matching rows (~2MB instead of 500MB)
response = s3.select_object_content(
    Bucket='analytics',
    Key='orders-2024.csv',
    Expression="SELECT order_id, total FROM S3Object WHERE restaurant_id = '47'"
)

S3 Select riduce il volume di dati trasferiti dal tuo S3 all'applicazione. Per file di grandi dimensioni con query selettive, questo può comportare una riduzione di 10-100 volte del volume di dati — e quindi dei costi.

**L'Ottimizzazione Completa della Rete**

Dopo tre settimane di analisi e implementazione:

| Voce di Costo                               | Prima   | Dopo    | Risparmio Mensile |
|--------------------------------------------|----------|----------|------------------|
| NAT Gateway (Endpoint Interfaccia)          | $289     | $211     | $78               |
| Ottimizzazione CloudFront (spostamento di più asset) | $214     | $147     | $67               |
| Traffico tra Zone AZ (accettato come tale)          | $178     | $178     | $0                |
| Traffico tra Regioni (accettato come tale)      | $166     | $166     | $0                |
| **Totale**                                  | **$847** | **$702** | **$145/mese**      |

$145/mese, $1.740/anno in risparmi sulla rete. Modesto rispetto a calcolo e storage, ma significativo.

Più importante ancora: Tom ora capiva ogni riga della bolletta di rete. Poteva spiegare ogni costo e aveva deliberatamente deciso quali ottimizzare e quali accettare.

## Punti di Forza e Limiti

**Costi del NAT Gateway:**

- Grandi volumi di dati attraverso il NAT Gateway si accumulano rapidamente
- Gli Endpoint VPC eliminano completamente alcuni costi del NAT
- Rivedi quali servizi le tue istanze private chiamano e se sono disponibili endpoint

**CloudFront per i costi:**

- Il tasso di hit della cache determina direttamente i risparmi sui costi
- Alto tasso di hit della cache = trasferimento di origine inferiore + costo di trasferimento complessivo inferiore
- Sposta tutta la consegna degli asset statici tramite CloudFront

**Compromessi tra Zone AZ:**

- Eliminare il traffico tra Zone AZ di solito richiede modifiche architetturali che costano più dei risparmi
- Calcola attentamente prima di ottimizzare

**S3 Select:**

- Risparmi significativi per query selettive su grandi oggetti S3
- Non aiuta quando hai bisogno dell'intero file

Nel prossimo capitolo: il framework a sei pilastri che pone le domande che ogni revisione architetturale dovrebbe iniziare.

## Riepilogo

- AWS addebita per i **dati in uscita** (internet: circa $0,09/GB), **tra le Zone AZ** ($0,01/GB per direzione), **tra le Regioni** ($0,02-0,08/GB) e **l'elaborazione del NAT Gateway** ($0,045/GB).
- **I dati in entrata** sono gratuiti. **Il traffico all'interno della stessa Zona AZ** è gratuito.
- **Endpoint Gateway VPC** (S3, DynamoDB): Gratuiti. Eliminano i costi del NAT Gateway per questi servizi.
- **Endpoint Interfaccia VPC**: Prezzati per ora più per GB. Più economici del NAT Gateway per servizi ad alto volume.
- **CloudFront** serve i dati a tassi inferiori rispetto al traffico diretto EC2-a-internet e riduce drasticamente il volume di trasferimento di origine tramite la memorizzazione nella cache.
- **S3 Select** riduce il trasferimento di dati da S3 filtrando alla fonte.
- Alcuni costi di rete sono compromessi architetturali (Zone AZ per HA) — capiscili, non eliminarli sempre.

## Suggerimenti per l'Esame

*SAA-C03 Dominio: Progettazione di Architetture Ottimizzate per i Costi (Dominio 4, Attività 4.4)*

- **NAT Gateway vs Endpoint VPC:** Scenario d'esame: "Un'istanza EC2 in una subnet privata chiama frequentemente S3/DynamoDB — come ridurre i costi del NAT Gateway?" → Endpoint Gateway VPC (gratuiti per S3 e DynamoDB).
- **Regole di prezzo per il trasferimento dei dati:**
  - In AWS: gratuito
  - All'interno della stessa Zona AZ: gratuito
  - Tra le Zone AZ: a pagamento
  - Tra le Regioni: a pagamento (tasso più alto)
  - Internet: a pagamento (tasso significativo)
- **CloudFront come ottimizzazione dei costi:** "Ridurre i costi di trasferimento dei dati per la consegna di contenuti globale" → CloudFront. Lo strato di cache riduce le richieste di origine.
- **Accelerazione del trasferimento S3:** Velocizza i caricamenti *verso* S3 utilizzando posizioni Edge CloudFront. Costo più elevato rispetto al trasferimento S3 standard. Utilizzare per i clienti che caricano file di grandi dimensioni da posizioni geograficamente distanti.
- **Costi di replicazione tra Regioni:** La replicazione dei dati tra regioni comporta costi di trasferimento dei dati. Per S3 CRR, paghi sia il tasso di trasferimento dei dati in uscita che il costo di richiesta di S3.
- **PrivateLink (Endpoint Interfaccia VPC)**: Fornisce connettività privata ai servizi AWS e ai servizi ospitati da altri clienti AWS. Più sicuro rispetto al passaggio attraverso il NAT, spesso più economico per servizi ad alto volume.

## Esercizi

**Esercizio 1 — Ricorda**

Spiega la differenza tra un Endpoint Gateway VPC e un Endpoint Interfaccia VPC. Per quali servizi AWS è disponibile ciascuno e qual è il costo di ciascuno?

*(Suggerimento: gli Endpoint Gateway sono gratuiti ma solo per S3 e DynamoDB. Gli Endpoint Interfaccia costano per ora ma funzionano per la maggior parte altri servizi AWS.)*

**Esercizio 2 — Esercitazione per l'Esame**

*Scenario*: Un'applicazione viene eseguita su istanze EC2 in subnet private. Le istanze effettuano chiamate API frequenti a Amazon SQS e Amazon S3. Attualmente, tutto il traffico esce attraverso un NAT Gateway. Il team vuole ridurre i costi del NAT Gateway. La sicurezza dei dati deve essere mantenuta — nessun traffico deve attraversare internet pubblico.

Quale approccio soddisfa meglio questi requisiti con costi minimi continui?

A) Crea un Endpoint Gateway per SQS e un Endpoint Gateway per S3
B) Crea un Endpoint Interfaccia per SQS e un Endpoint Gateway per S3
C) Crea Endpoint Interfaccia per entrambi SQS e S3
D) Rimuovi il NAT Gateway e utilizza direttamente il gateway Internet per le chiamate API

**Suggerimento 1**: Gli Endpoint Gateway sono disponibili solo per S3 e DynamoDB.

**Suggerimento 2**: Gli Endpoint Interfaccia sono disponibili per SQS e molti altri servizi (ma comportano un costo).

**Suggerimento 3**: Un gateway Internet nella tabella dei percorsi del subnet privato lo renderebbe un subnet pubblico — violando i requisiti di sicurezza.

**Risposta**: B

**Spiegazione**: S3 utilizza un Endpoint Gateway (gratuito). SQS richiede un Endpoint Interfaccia (a pagamento). Questa combinazione elimina i costi di elaborazione dei dati NAT per entrambi i servizi. Tutto il traffico rimane all'interno della rete privata di AWS — senza attraversamento di Internet pubblico.

**Perché non A?** Gli Endpoint Gateway non sono disponibili per SQS. Solo S3 e DynamoDB hanno Endpoint Gateway.

**Perché non C?** Sebbene questo funzioni, l'utilizzo di un Endpoint Interfaccia per S3 (invece del Gateway Endpoint gratuito) comporta costi orari non necessari. Utilizzare sempre il Gateway Endpoint gratuito per S3 e DynamoDB.

**Perché non D?** Aggiungere un percorso al gateway Internet dal subnet privato lo renderebbe un subnet pubblico. Le istanze EC2 nei subnet privati tipicamente non hanno Elastic IPs, quindi non potrebbero instradare attraverso un gateway Internet senza ulteriori modifiche — e farlo esporrebbe le stesse a traffico in entrata da Internet.

*SAA-C03 Dominio: Progettazione di Architetture Ottimizzate per il Costo — Attività 4.4*

**Esercizio 3 — Sfida Architetturale** *(Opzionale)*

Nimbus's utenti della costa occidentale generano un traffico significativo. L'applicazione viene servita da us-east-1 (Virginia). Attualmente:

- Le risposte API vanno direttamente dalle istanze EC2 di us-east-1 agli utenti della costa occidentale (~80ms, $0.09/GB)
- Le foto del menu vanno da S3 us-east-1 attraverso CloudFront edge a Seattle (~8ms dopo la memorizzazione nella cache)

Il team sta considerando di aggiungere una seconda regione di applicazione in us-west-2 (Oregon) per gli utenti della costa occidentale per ridurre la latenza delle API.

Analizza i costi di trasferimento dei dati di questo cambiamento. Quali nuovi costi di trasferimento inter-regione incorrerebbe la configurazione a doppia regione? Il routing basato sulla latenza di Route 53 ridurrebbe o aumenterebbe i costi totali di trasferimento? Sotto quali condizioni (volume di traffico, sensibilità alla latenza) la configurazione a doppia regione sarebbe redditizia?

*(Non esiste una risposta corretta univoca. L'obiettivo è praticare l'analisi dei costi e dei benefici multi-regione.)*

## Scena Post-Crediti

Tom chiudeva l'analisi di rete.

Impatto totale del progetto di ottimizzazione di tre mesi:

- Piani di risparmio EC2: -$14.200/anno
- Archiviazione (S3 + EBS): -$6.200/anno
- Livello del database: -$11.220/anno
- Networking: -$1.740/anno
- **Totale: -$33.360/anno**

Lo scriveva su una lavagna nella sala riunioni.

Leo lo guardava. "Trentatré mila."

"E cambio," disse Tom.

"Per anno."

"Per anno."

Priya faceva i calcoli. "Stavamo spendendo $2.780 al mese per cose che non creavano valore."

"Non tutti," corresse Tom. "Alcune di queste cose erano cose da cui ottenevamo valore, ma pagavamo troppo per esse. I Piani di risparmio — stavamo ottenendo esattamente la stessa capacità EC2, solo a un prezzo migliore."

Maya rimaneva a lungo di fronte alla lavagna.

"Quando abbiamo iniziato Nimbus," disse, "ogni dollaro contava. Potevamo permetterci appena un'istanza EC2."

"Sì," disse Tom.

"E in qualche modo abbiamo smesso di guardare i soldi come se fossero importanti."

"La crescita lo fa," disse Priya. "Si sposta il focus sulla costruzione, non sull'ottimizzazione."

"Entrambi contano," disse Maya. "Entrambi, sempre. Aggiungi questo al wiki. E imposta una revisione trimestrale sui costi."

Tom stava già aprendo il suo calendario.

Nei prossimi capitoli: ci allontaneremo dai singoli servizi e inizieremo a pensare come architetti.
