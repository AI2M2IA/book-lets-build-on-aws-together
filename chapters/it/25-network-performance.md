# Capitolo 25: La Corsia Privata

Alzati un momento. Scuoti le mani.

Senti la distanza tra la punta delle tue dita e qualcosa dall'altra parte del paese. Immagina di inviare un messaggio che deve percorrere quella distanza, farsi strada attraverso una dozzina di passaggi tra carrier diversi, e tornare indietro prima che tu possa continuare a lavorare. Ora immagina di farlo migliaia di volte al secondo.

Ecco cosa significa spostare dati nella realtà — distanza fisica, infrastruttura fisica, vincoli fisici.

Parleremo di come spostare i dati. Non tra i servizi all'interno del cloud, ma tra il mondo reale e il cloud — tra il tuo ufficio e la tua infrastruttura, tra i continenti.

---

Con il database scalato e i costi di storage ridotti, Tom si era dedicato alla bolletta del networking. Ma Leo aveva un problema più immediato — spostare 4 terabyte di dati storici sugli ordini in AWS stava mettendo a nudo i limiti della loro connessione attuale.

---

Il team di infrastruttura di Nimbus (ora quattro ingegneri) lavorava da un ufficio condiviso a Seattle. Avevano bisogno di accedere all'infrastruttura AWS che gestivano. Alcune operazioni richiedevano la connessione a risorse nel VPC.

Al momento usavano una VPN sui loro laptop per accedere al bastion host nella subnet pubblica, poi si connettevano tramite SSH alle risorse da lì.

Funzionava. Era lenta. La connessione VPN instradava il traffico attraverso l'internet pubblico: Seattle → molteplici hop tra carrier → us-west-2. I round trip erano inconsistenti — da 30 a 80 millisecondi a seconda dell'orario — e il throughput era limitato dall'uplink dell'ufficio e dal percorso pubblico.

"Per SSH quotidiano va bene," disse Leo. "Ma stiamo per iniziare a spostare il nostro database di analisi. 4 terabyte di dati storici sugli ordini. Con questa connessione, la migrazione richiederà settimane."

"Abbiamo bisogno di una connessione migliore," disse Maya.

"Una connessione privata," aggiunse Priya. "Non attraverso l'internet pubblico. E se qualcuno tentasse di intromettersi durante il trasferimento dei dati? 4TB di storico degli ordini attraverso l'internet pubblico — anche crittografato — è un bersaglio appetibile."

Pensa all'andare al lavoro. Una Site-to-Site VPN è come guidare su strade pubbliche: chiudi le porte dell'auto (crittografia), ma condividi comunque le corsie con tutti gli altri, e gli ingorghi rallentano in modo imprevedibile. Direct Connect è come noleggiare una corsia privata dedicata sull'autostrada — nessun traffico condiviso, velocità costante e un pedaggio mensile più alto. La maggior parte dei giorni la strada pubblica va benissimo. Quando devi spostare un camion pieno di merci preziose con una tabella di marcia rigida, paghi per la corsia privata.

Snow Family è l'opzione che la maggior parte delle persone non considera: noleggiare un vero volo cargo. Non è sempre disponibile. Non è adatta per carichi piccoli. Ma per un camion pieno, arriva più velocemente di guidare e non dipende affatto dalle condizioni dell'autostrada. La fisica non è cambiata — stai ancora spostando gli stessi bit — ma il meccanismo è fondamentalmente diverso.

**AWS Site-to-Site VPN: L'Opzione Rapida**

**AWS Site-to-Site VPN** crea un tunnel crittografato tra la tua rete on-premises e il tuo VPC, attraversando l'internet pubblico.

Configurazione:

1. Crea un Virtual Private Gateway (VGW) collegato al tuo VPC
2. Crea un Customer Gateway che rappresenta il tuo router on-premises
3. Stabilisci due tunnel VPN (per ridondanza) tra di essi

Il traffico è crittografato (AES-256). Viaggia attraverso l'internet pubblico, il che significa che la latenza dipende dalle condizioni della rete. AWS fornisce due tunnel automaticamente per la ridondanza — se un tunnel ha problemi, il traffico si sposta all'altro.

**Quando usare Site-to-Site VPN**:

- Configurazione rapida (da minuti a ore)
- Economico ($0.05/ora per connessione VPN)
- Larghezza di banda: fino a 1.25 Gbps per tunnel
- Latenza internet accettabile per il caso d'uso

**Accelerated Site-to-Site VPN** instrada il traffico VPN attraverso la rete globale di AWS anziché l'internet pubblico — la stessa ottimizzazione offerta da Global Accelerator, applicata ai tunnel VPN. La latenza è inferiore e più costante rispetto a una VPN standard. Il costo è leggermente superiore (si applicano i costi di trasferimento dati di Global Accelerator). Per i team che vogliono la configurazione rapida e il costo contenuto della VPN ma necessitano di latenza migliore, la Accelerated VPN è la via di mezzo pratica tra VPN standard e Direct Connect.

Per la migrazione da 4TB di Nimbus, una VPN su internet con un massimo di 1.25 Gbps richiederebbe: 4TB / 1.25 Gbps ≈ 7 ore minimo, con un overhead reale più vicino a 12-20 ore. Accettabile, ma la congestione sul percorso internet pubblico la rende imprevedibile.

Leo fece i calcoli con più attenzione, perché il calcolo teorico e il tempo di trasferimento effettivo non avevano mai coinciso in tutta la sua esperienza.

**Teorico**: 4 TB = 4.096 GB = 32.768 Gb. A 1 Gbps: 32.768 secondi ≈ 9,1 ore. Arrotondando a 9 ore.

**Reale**: Leo aveva eseguito un trasferimento di prova la settimana precedente — 50 GB dall'ufficio di Seattle a S3. Tempo teorico alla velocità upstream misurata (875 Mbps): 457 secondi. Tempo effettivo: 724 secondi. Fattore di overhead: 1,58.

Applicato al trasferimento da 4TB a 875 Mbps upstream: 32.768 Gb / 0,875 Gbps × 1,58 di overhead ≈ **59.200 secondi ≈ 16,4 ore**.

L'overhead proveniva da diverse fonti: TCP slow-start all'avvio delle connessioni, perdita di pacchetti con necessità di ritrasmissione (il percorso pubblico da Seattle a us-west-2 aveva in media uno 0,2% di perdita di pacchetti — piccolo, ma moltiplicativo su milioni di pacchetti), overhead dell'handshake HTTPS per ogni segmento di upload multipart, e il tempo di elaborazione per S3 nell'assemblare gli upload multipart.

"Sedici ore vanno bene per una migrazione una tantum," disse Leo. "Il problema vero è se il trasferimento si interrompe all'ora quattordici."

L'upload multipart di S3 risolve il problema dell'interruzione: se il trasferimento fallisce all'ora quattordici, solo la parte corrente deve essere ricaricata. Le parti precedenti sono già salvate in S3 e il trasferimento può riprendere. Ma l'overhead della gestione degli upload multipart aggiungeva circa il 3% al tempo totale di trasferimento.

La stima finale nel mondo reale: **circa 9 ore teoriche su 1 Gbps internet, circa 17 ore reali** — tenendo conto dei 875 Mbps upstream misurati dell'ufficio, dell'overhead per perdita di pacchetti e dell'elaborazione degli upload multipart.

Leo ci rifletté un momento. Poi guardò la pagina dei prezzi di Snow Family.

"Qual è l'altra opzione?" chiese Tom.

"Aspetta — ma *perché* avremmo bisogno di qualcosa di più di una VPN?" chiese Maya. "La migrazione da 4TB è un evento una tantum."

"Non lo è," disse Priya. "Una volta che i dati sono in AWS, il team deve comunque accedervi ogni giorno. E la latenza della VPN si accumula."

**AWS Direct Connect: La Linea Dedicata**

**AWS Direct Connect** stabilisce una connessione di rete privata e dedicata tra la tua sede (o la tua struttura di colocation) e AWS. Il traffico non tocca mai l'internet pubblico.

Direct Connect è una connessione fisica — una linea in fibra dalla tua rete a una Direct Connect location di AWS. Lavori con un provider di telecomunicazioni per stabilire il circuito fisico. AWS fornisce la porta sul proprio lato.

**Vantaggi**:

- Latenza costante e prevedibile (nessuna varianza dovuta all'internet pubblico)
- Velocità da 50 Mbps a 100 Gbps (con porte dedicate native da 400 Gbps in alcune location selezionate dal 2024)
- Costi di trasferimento dati inferiori rispetto a internet (i costi di trasferimento dati Direct Connect sono più bassi dei costi standard di AWS per il traffico in uscita)
- Maggiore sicurezza (circuito privato, non internet pubblico)

**Limiti**:

- La configurazione richiede settimane o mesi (provisioning dell'infrastruttura fisica)
- Costo significativamente superiore alla VPN
- Nessuna ridondanza integrata (devi stabilire circuiti ridondanti da solo)
- Non adatto per uffici geograficamente distribuiti senza più circuiti

Potresti chiederti: se Direct Connect è un cavo in fibra fisico, cosa succede se qualcuno lo taglia accidentalmente? Questo è il problema del single point of failure con un singolo circuito — per questo motivo le installazioni Direct Connect in produzione usano circuiti ridondanti su percorsi geograficamente separati, o mantengono una VPN come backup. Il cavo può essere tagliato; il business continua.

"Quanto costa al mese?" chiese Tom. Lo aveva già cercato. "Una porta dedicata da 1Gbps costa $216/mese," disse. "Più il circuito dal nostro ufficio, per cui un operatore di telecomunicazioni ha fatto un preventivo di $800/mese."

"Quindi circa mille al mese in totale."

Per Nimbus: Direct Connect era eccessivo per le loro dimensioni attuali. Ma per le aziende con volumi di trasferimento dati significativi o requisiti di conformità per connessioni di rete private, Direct Connect si ripaga da solo.

**Hosted Connections: La Via di Mezzo**

Non tutte le organizzazioni possono impegnarsi in un circuito in fibra dedicato da 100 Gbps. **Direct Connect Hosted Connections** consentono ai Direct Connect Partner di AWS (operatori di telecomunicazioni approvati) di fornire connessioni al di sotto di 1Gbps che condividi con altri clienti.

La configurazione è più rapida (da giorni a settimane, non mesi) e i costi sono inferiori rispetto a una connessione dedicata. Il compromesso: la capacità condivisa significa throughput meno costante.

Per Nimbus (con la crescita): una connessione hosted da 500 Mbps tramite un partner fornirebbe connettività privata a un prezzo ragionevole.

La differenza pratica che conta all'esame: le Hosted Connection sono disponibili a velocità da 50 Mbps a 10 Gbps (alcuni partner offrono fino a 25 Gbps), fornite da un AWS Partner. Le Dedicated Connection vanno direttamente ad AWS e sono disponibili a 1 Gbps, 10 Gbps e 100 Gbps (più 400 Gbps in location selezionate). Per velocità inferiori a 1 Gbps, una Hosted Connection è l'unica opzione Direct Connect — le Dedicated Connection partono da un minimo di 1 Gbps.

**AWS Transit Gateway: Hub-and-Spoke per i VPC**

Con la crescita di Nimbus, si sarebbero accumulati più VPC: il VPC di produzione, il VPC di staging, il VPC di analisi, il VPC per gli strumenti di sicurezza.

Senza una pianificazione attenta, connettere questi VPC richiede una mesh completa di connessioni di VPC peering. Per 4 VPC: 6 connessioni di peering. Per 10 VPC: 45 connessioni di peering. Per 20 VPC: 190 connessioni. Non scala.

**AWS Transit Gateway** è un hub di rete che connette più VPC e reti on-premises. Invece di una mesh di connessioni di peering, ogni VPC si connette al Transit Gateway. Il Transit Gateway instrada il traffico tra di essi.

```
On-premises ──── Direct Connect ──┐
                                  │
Production VPC ───────────────── Transit Gateway
Staging VPC ──────────────────── Transit Gateway
Analytics VPC ────────────────── Transit Gateway
Security VPC ─────────────────── Transit Gateway
```

**Routing transitivo**: se il VPC A e il VPC B sono entrambi connessi al Transit Gateway, possono comunicare — senza un peer diretto. Il Transit Gateway gestisce il routing. A differenza del VPC peering (che non è transitivo), il Transit Gateway abilita una topologia hub-and-spoke.

**Costi del Transit Gateway**: addebitati per attachment (VPC o connessione VPN/Direct Connect) più per GB di dati elaborati. Su larga scala, vale la semplicità.

Per Nimbus, l'evento che ha determinato l'adozione del Transit Gateway è stata l'aggiunta di un quarto VPC. Avevano: produzione, staging, analisi, e ora gli strumenti di sicurezza (un VPC per la scansione delle vulnerabilità e il monitoraggio della conformità SOC2 che non dovrebbe trovarsi sullo stesso segmento di rete della produzione).

Senza Transit Gateway, connettere quattro VPC richiede sei connessioni di peering:

- Production ↔ Staging
- Production ↔ Analytics
- Production ↔ Security
- Staging ↔ Analytics
- Staging ↔ Security
- Analytics ↔ Security

Sei connessioni di peering, sei voci di route table per VPC, sei regole di security group da revisionare. E il VPC peering non è transitivo: se Production e Analytics sono in peering, e Analytics e Security sono in peering, Production non può raggiungere Security attraverso il VPC di Analytics. Devi esplicitamente creare il peering Production ↔ Security.

Con il Transit Gateway:

```
Production VPC  ──┐
Staging VPC     ──┤──── Transit Gateway ────── On-premises (Direct Connect)
Analytics VPC   ──┤
Security VPC    ──┘
```

Quattro attachment. Una sola route table da gestire. Routing transitivo: Production può raggiungere Security attraverso il Transit Gateway senza un peer diretto.

"E se qualcuno tentasse di intromettersi attraverso il Transit Gateway?" chiese Priya. "Se tutti e quattro i VPC condividono un Transit Gateway, una risorsa compromessa nel VPC di staging potrebbe raggiungere Production."

Il Transit Gateway supporta **route table con isolamento**: puoi definire quali VPC sono autorizzati a comunicare attraverso il Transit Gateway e quali sono isolati. Il VPC degli strumenti di sicurezza può raggiungere tutti gli altri (ha bisogno di scansionarli). Staging non può raggiungere Production. Production non può raggiungere direttamente Analytics (Analytics interroga i dati attraverso un endpoint specifico in sola lettura).

"Un Transit Gateway," disse Priya, "con politiche di routing che esprimono il modello di accesso effettivo. Contro sei connessioni di peering senza un modo centralizzato per verificare chi raggiunge cosa."

**VPC Endpoint: Accesso Privato ai Servizi AWS**

C'è un problema sottile di costi e sicurezza: quando la tua istanza EC2 (in una subnet privata) chiama l'API S3, quel traffico passa attraverso il NAT Gateway (per raggiungere l'internet, dove si trova l'endpoint pubblico di S3). Paghi per l'elaborazione del NAT Gateway.

**I VPC Endpoint** consentono alle risorse nel tuo VPC di comunicare con i servizi AWS in modo privato, senza passare attraverso l'internet pubblico — e senza NAT Gateway.

Due tipi:

**Gateway endpoint** (gratuiti): per S3 e DynamoDB. Aggiungi una route nella tua route table che indirizzi il traffico verso S3 o DynamoDB all'endpoint invece che al NAT Gateway. Gratuiti da creare e da usare.

**Interface endpoint** (a pagamento): per altri servizi AWS (SQS, SNS, Secrets Manager, SSM, ecc.). Crea un ENI (Elastic Network Interface) nella tua subnet con un indirizzo IP privato. Il traffico verso il servizio usa questo IP privato. Costa circa $0.01/ora per AZ più l'elaborazione dei dati.

Leo aveva già creato i Gateway endpoint la settimana precedente senza aggiornare le route table. "L'ho già deployato — ah," disse, controllando la configurazione. "Le route non erano state aggiornate. Lo sistemo subito."

Tom creò immediatamente i Gateway endpoint per S3 e DynamoDB dopo aver scoperto che erano gratuiti. La tariffa di elaborazione del NAT Gateway scese del 65%.

I calcoli del perché: le funzioni Lambda di Nimbus e i task ECS nelle subnet private facevano richieste continue a S3 (leggendo file di configurazione, scrivendo esportazioni di log) e a DynamoDB (leggendo i dati dei ristoranti, scrivendo i record degli ordini). Ogni richiesta passava attraverso il NAT Gateway, che addebitava $0.045 per GB di dati elaborati.

Elaborazione mensile del NAT Gateway di Nimbus: 533 GB. Costo: $24/mese. Dopo aver aggiunto i Gateway Endpoint per S3 e DynamoDB e aggiornato le route table: il traffico verso S3 e DynamoDB bypassava il NAT Gateway completamente. L'elaborazione mensile del NAT Gateway scese a 187 GB — il traffico rimanente erano chiamate API ad altri servizi (Secrets Manager, SES, webhook esterni). Costo: $8.40/mese.

Risparmio: $15.60/mese, $187/anno, per due configurazioni gratuite di Gateway Endpoint che hanno richiesto 10 minuti di configurazione.

"Gratuiti," disse Tom, per la terza volta.

"I Gateway endpoint sono gratuiti da creare e da usare," confermò Leo. "Non sono solo un miglioramento della sicurezza — instradare il traffico verso S3 e DynamoDB attraverso un endpoint privato anziché attraverso il NAT Gateway lo rimuove completamente dall'internet pubblico."

"E se qualcuno tentasse di intromettersi attraverso il traffico del NAT Gateway?" chiese Priya. "Se il traffico verso S3 passa per il NAT, è raggiungibile da internet. Via Gateway Endpoint, è privato."

Questo è il beneficio secondario dei Gateway Endpoint che la discussione sui costi a volte oscura. Il traffico verso S3 e DynamoDB attraverso un VPC Gateway Endpoint non lascia mai la rete AWS, non attraversa mai un indirizzo IP pubblico, ed è governato dalla endpoint policy (una resource-based policy che può limitare a quali bucket S3 o tabelle DynamoDB l'endpoint può accedere). Un Gateway Endpoint su un bucket che archivia dati dei clienti aggiunge un livello extra: anche con una bucket policy mal configurata, la endpoint policy può limitare l'accesso al traffico proveniente dallo specifico VPC.

**AWS Global Accelerator: Routing al Edge**

Quando Nimbus serviva gli utenti della East Coast da us-west-2 (Oregon), la latenza era di 80ms. Non perché il server fosse troppo lontano, ma perché il routing internet pubblico tra Boston e Oregon era subottimale, rimbalzando attraverso molteplici reti di carrier.

**AWS Global Accelerator** usa la rete backbone globale privata di AWS — una rete distribuita di edge location che instrada il traffico verso la tua applicazione attraverso percorsi controllati da AWS anziché attraverso gli hop dei carrier dell'internet pubblico. Invece del routing su internet pubblico, il traffico entra nella rete AWS alla edge location più vicina e viaggia lungo il percorso privato ottimizzato fino alla tua applicazione.

Per Nimbus, un utente a Boston:

- **Senza Global Accelerator**: instradamento attraverso i carrier dell'internet pubblico → ~80ms
- **Con Global Accelerator**: raggiunge il edge AWS più vicino a Boston → viaggia sulla backbone di AWS → arriva a us-west-2 → ~60ms

Global Accelerator non mette in cache i contenuti (quello lo fa CloudFront). Ottimizza il percorso di rete per le richieste dinamiche.

Leo eseguì un confronto della latenza in diverse città dopo aver abilitato Global Accelerator per le API di Nimbus:

| Città | Prima | Dopo | Miglioramento |
|------|--------|-------|-------------|
| Seattle, WA | 12ms | 11ms | 8% |
| Los Angeles, CA | 28ms | 22ms | 21% |
| Chicago, IL | 55ms | 40ms | 27% |
| New York, NY | 82ms | 61ms | 26% |
| London, UK | 145ms | 112ms | 23% |
| Tokyo, Japan | 180ms | 95ms | 47% |
| Sydney, Australia | 210ms | 118ms | 44% |

Il miglioramento era più marcato per gli utenti geograficamente lontani — Tokyo da 180ms a 95ms, Sydney da 210ms a 118ms. Per Seattle (vicino ai data center di us-west-2 in Oregon), il miglioramento era minore — c'erano meno hop internet pubblici da ottimizzare.

"Aspetta — ma *perché* Tokyo ottiene un miglioramento del 47%?" chiese Maya. "Se il data center è ancora in us-west-2, la velocità della luce non è il vero vincolo?"

"La velocità della luce è il pavimento," disse Leo. "Il vincolo reale è il routing su internet pubblico. Il traffico da Tokyo a us-west-2 attraversa decine di sistemi autonomi — carrier diversi, router diversi, accordi di peering diversi. Ogni hop aggiunge latenza. Global Accelerator instrada il traffico dalla edge location di Tokyo a us-west-2 sulla fibra privata di AWS, che ha percorsi più brevi e un routing meglio ottimizzato."

Il minimo teorico da Tokyo a us-west-2 (basato sulla velocità della luce sulla fibra, circa 15.500 km di andata e ritorno): ~77ms. I 95ms con Global Accelerator si avvicinano a quel minimo teorico. I 180ms senza riflettono l'inefficienza del routing su internet pubblico, non le leggi della fisica.

Global Accelerator fornisce due **indirizzi IP anycast** statici che instradano alla edge location più vicina. A differenza di CloudFront (che usa indirizzi IP dinamici che cambiano), questi IP sono stabili — utili per la allowlist nei firewall e per le applicazioni che richiedono un IP fisso a cui i client si connettono.

**Quando usare Global Accelerator vs CloudFront**:

- CloudFront: contenuto statico e memorizzabile in cache, caso d'uso CDN
- Global Accelerator: contenuto dinamico, protocolli non HTTP (UDP, gaming, IoT), o quando hai bisogno di un indirizzo IP Anycast statico

## Spostare Dati, Non Solo Traffico: DataSync e Transfer Family

Mentre l'architettura di rete prendeva forma, Maya si ritrovò con tre nuovi progetti di onboarding di catene di ristoranti in contemporanea. Ognuno aveva un requisito di migrazione dei dati — e ogni requisito era diverso.

La prima catena, Pacific Table, doveva spostare 40 TB di file share NFS in S3. Il loro storage di file attuale era on-premises, distribuito su quattro file server nella sede centrale di Seattle. Leo iniziò a scrivere un piano di migrazione.

La seconda catena, Marisol Group, aveva un team di contabilità che caricava fatture ogni giorno su un server SFTP locale. Il flusso SFTP era in funzione dal 2015. Il personale di contabilità sapeva fare una cosa sola: aprivano il loro client SFTP ogni mattina alle 9, lasciavano cadere le fatture e lo chiudevano. Nessuno voleva cambiare questa routine. "I loro contabili usano WinSCP," disse Maya. "Non è negoziabile."

"Sono due strumenti diversi," disse Priya.

"Sì," disse Leo. "Ma esistono entrambi."

**AWS DataSync: rsync con il Turbo, con una Console AWS**

Per la migrazione da 40 TB di Pacific Table, la sfida non era la larghezza di banda — l'ufficio di Seattle aveva una solida connessione upstream. La sfida era l'orchestrazione: scoprire quali file esistevano, trasferirli in modo affidabile, verificare i checksum, pianificare il trasferimento per evitare di saturare la rete dell'ufficio durante l'orario lavorativo, e monitorare il progresso per quella che sarebbe stata un'operazione continua di diversi giorni.

**AWS DataSync** è un servizio agent-based per la migrazione e la replica dei dati. Installi un agente DataSync leggero nel tuo ambiente on-premises — una macchina virtuale che gira su VMware o come istanza EC2. L'agente si connette ai tuoi file server tramite NFS o SMB, scopre le tue share e le sincronizza con una destinazione in AWS: un bucket S3, un filesystem EFS o un filesystem FSx.

Pensa a rsync con il turbo, con una console AWS. DataSync gestisce:

- **Discovery**: l'agente fa l'inventario delle tue share sorgente automaticamente
- **Scheduling**: i trasferimenti possono essere eseguiti su un programma definito (fuori dall'orario lavorativo) o in modo continuativo
- **Verification**: DataSync calcola i checksum da entrambe le parti e ti avvisa di qualsiasi inconsistenza
- **Monitoring**: progresso del trasferimento, conteggi dei file, report degli errori e utilizzo della larghezza di banda sono tutti visibili nella console
- **Crittografia in transit**: tutti i dati sono crittografati con TLS durante il trasferimento

Per Pacific Table, Leo installò l'agente DataSync su una VM nella loro rete di Seattle, lo puntò sulle quattro share NFS e configurò un programma di trasferimento: dalle 20:00 alle 6:00 nei giorni feriali, continuativo nel fine settimana. Dopo sei giorni, tutti i 40 TB erano arrivati in S3. Verificò il trasferimento con il report di checksum integrato di DataSync. Zero discrepanze.

"E per la replica continuativa?" chiese Maya. "Pacific Table continuerà ad aggiungere file dopo la migrazione."

"DataSync supporta i trasferimenti incrementali," disse Leo. "Dopo la sincronizzazione iniziale, copia solo ciò che è cambiato. Possiamo eseguirlo ogni notte come job di replica."

**AWS Transfer Family: Il Tuo Flusso SFTP, Supportato da S3**

Per il team di contabilità di Marisol Group, il requisito era diverso. Nessuno avrebbe abbandonato SFTP. I contabili avrebbero continuato a usare WinSCP. La domanda era: dove finiscono quegli upload SFTP?

Al momento, finivano su un server Linux locale nel back office di Marisol. I file venivano poi spostati manualmente nel loro sistema contabile. Il server locale richiedeva manutenzione, backup e qualcuno con accesso SSH per gestirlo.

**AWS Transfer Family** è un server SFTP, FTPS e FTP completamente gestito — supportato da S3 o EFS come destinazione di storage. Provisioni un endpoint Transfer Family (riceve un hostname e, facoltativamente, un indirizzo IP statico). I tuoi client vi si connettono usando il loro software SFTP esistente. Quando caricano file, quei file finiscono direttamente in un bucket S3.

Il team di contabilità non cambia nulla. Apre ancora WinSCP ogni mattina alle 9. Si connette ancora a un server SFTP con le proprie credenziali esistenti. Lascia ancora cadere le fatture nella stessa cartella. La differenza è invisibile per loro: sul lato server, i file ora vanno direttamente in S3 invece che su un server Linux locale.

"E da S3, possiamo innescare automaticamente il resto del flusso di lavoro," disse Priya. "Un evento S3 avvia una funzione Lambda che elabora la fattura e la inserisce nel sistema contabile. Nessun passaggio manuale."

"Quindi il flusso di lavoro dei contabili non cambia," disse Maya, "ma dal nostro lato, tutto è automatizzato."

"Esatto. E il server SFTP è completamente gestito — niente patch, niente backup, nessun server da manutenere."

Tom aveva già verificato i prezzi. Transfer Family addebita per ore di disponibilità dell'endpoint più per GB trasferiti. Per il volume di fatture di Marisol Group, il costo mensile era ben al di sotto di $30. Il costo di mantenere il server locale che stava sostituendo — ammortamento dell'hardware, tempo ingegneristico per la manutenzione, gestione dei backup — era considerevolmente superiore.

---

> **Nota — DataSync e Transfer Family**
>
> *SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.1)*
>
> - **DataSync** = spostare dati in blocco da on-premises ad AWS (file share NFS o SMB → S3, EFS o FSx). I segnali dell'esame: "migrare file share," "replicare dati NFS in S3," "trasferimento dati da on-premises ad AWS," "replica continuativa di dati su file." DataSync usa un agente installato on-premises; l'agente gestisce discovery, scheduling e verifica.
> - **Transfer Family** = trasferimento file continuativo tramite protocolli SFTP, FTPS o FTP, senza cambiare gli strumenti del client. I segnali dell'esame: "flusso SFTP esistente," "i partner caricano file via SFTP," "server SFTP supportato da S3," "lift-and-shift SFTP," "impossibile modificare il processo di trasferimento file." Transfer Family è la risposta quando il requisito è la compatibilità SFTP, non il volume di dati.
> - **La distinzione è importante**: DataSync è per la migrazione in blocco e la replica (agent-based, schedule-driven, ottimizzato per la rete). Transfer Family è per servizi di trasferimento file compatibili con il protocollo (endpoint-based, sempre attivo, trasparente per il client). Risolvono problemi diversi.
> - DataSync supporta S3, EFS e FSx come destinazioni. Transfer Family supporta S3 e EFS come backend di storage.

---

**Migrare Server, Non Solo File: Le 7 R e MGN**

La terza catena nella pipeline di Maya non aveva solo file — aveva interi server: un'applicazione di prenotazioni personalizzata su due macchine on-premises che nessuno voleva riscrivere prima del trasferimento. Spostare *le applicazioni* è una disciplina a sé, e AWS descrive **sette modi per migrare** (le "7 R") che devi principalmente saper riconoscere:

- **Rehost** ("lift and shift"): sposta i server così come sono. Il più veloce, con il minimo cambiamento.
- **Replatform** ("lift, tinker, and shift"): piccoli aggiornamenti durante il percorso — come spostare un database self-managed su RDS.
- **Repurchase**: abbandona il vecchio sistema, compra SaaS al suo posto.
- **Refactor**: ridisegna cloud-native. Massimo sforzo, massimo ritorno.
- **Retire**: si scopre che nessuno lo usava. Eliminalo.
- **Retain**: lascialo dov'è, per ora.
- **Relocate**: sposta a livello hypervisor senza cambiare nulla.

Per il caso di rehost, lo strumento è **AWS Application Migration Service (MGN)**: un agente replica i dischi dei server sorgente, blocco per blocco, in un'area di staging a basso costo in AWS; puoi avviare copie di test quando vuoi; al momento del cutover, MGN converte i server replicati in istanze EC2 native. Lift, shift, fatto — il refactoring può arrivare in seguito, a tempo di cloud. (I suoi strumenti correlati per la pianificazione del portfolio, Application Discovery Service e Migration Hub, hanno chiuso ai nuovi clienti nel tardo 2025 — conosci i loro nomi come "scoperta dell'inventario" e "tracciamento centralizzato della migrazione" se l'esame li menziona.)

---

**AWS Snow Family: L'Opzione Fisica**

Restava ancora la questione dei 4TB di dati storici e della stima di 17 ore via internet. Dopo aver fatto i calcoli, Leo aveva guardato la pagina dei prezzi di Snow Family e aveva preso la decisione immediatamente.

Per le migrazioni al di sopra di qualche terabyte dove il tempo conta più della semplicità, AWS spedisce appliance di storage fisico alla tua sede. Le riempi di dati. Le rispedisci. AWS inserisce i dati direttamente in S3.

**Snowball Edge Storage Optimized**: 80 TB di capacità utilizzabile, contenitore rinforzato. Viene spedito alla tua sede in 2-5 giorni lavorativi. Carichi i dati usando l'interfaccia locale (NFS, interfaccia S3). La rispedisci. AWS inserisce i dati in circa 1-3 giorni lavorativi dal ricevimento.

Per la migrazione da 4TB di Nimbus, il processo:

1. **Ordina** un Snowball Edge attraverso la console AWS (richiede 2 minuti, viene spedito in 3 giorni)
2. **Connetti** l'appliance alla rete dell'ufficio di Seattle; si presenta come un mount point NFS
3. **Copia** i 4TB di dati storici degli ordini sull'appliance attraverso la sua interfaccia compatibile S3 — gli stessi familiari comandi S3 copy, solo puntati all'endpoint locale del dispositivo invece che al vero S3
4. **La copia completa** in circa 2 ore (rete locale, nessun internet)
5. **Rispedisci** l'appliance ad AWS (etichetta prepagata inclusa)
6. AWS **inserisce** i dati in S3 entro 72 ore dal ricevimento
7. **Verifica** — S3 fornisce un report di completamento del job che mostra ogni file trasferito e il relativo checksum

Tempo totale trascorso: 3 giorni per la consegna + 2 ore per copiare + 1 giorno di spedizione + 2 giorni di inserimento = circa 7 giorni di calendario. Contro circa 17 ore in modo continuativo — che avrebbe richiesto una connessione internet stabile e ininterrotta, saturando l'uplink dell'ufficio durante la notte e per gran parte di una giornata lavorativa.

Costo: il noleggio del dispositivo Snowball Edge è di $300 per 10 giorni. Spedizione (andata e ritorno): circa $80. Il trasferimento dati in ingresso in S3 è gratuito. Costo totale della migrazione: **$380**.

A confronto con circa 17 ore di utilizzo internet sostenuto a 875 Mbps: il tunnel VPN era gratuito ($0.05/ora ma il tunnel era già attivo); il trasferimento in ingresso in S3 era gratuito. Il percorso internet "gratuito" aveva un costo reale in tempo ingegneristico (monitorare un trasferimento di 17 ore), rischio (qualsiasi interruzione richiedeva il riavvio) e costo opportunità (la loro connessione internet era saturata durante la finestra di trasferimento). Leo effettuò l'ordine.

---

## Punti di Forza e Limitazioni

**Site-to-Site VPN**:

- Configurazione rapida, basso costo
- Il percorso internet pubblico significa latenza variabile
- Soffitto di larghezza di banda limitato (1.25 Gbps per tunnel)
- L'opzione Accelerated VPN migliora la latenza a un costo leggermente superiore

**Direct Connect**:

- Costante, privato, alta larghezza di banda
- Lento da configurare, costo ricorrente significativo
- Il circuito fisico è un single point of failure (aggiungi ridondanza o mantieni un backup VPN)
- Break-even con i risparmi sui costi di egress a circa 10-15 TB al mese a seconda dello scenario di prezzi

**AWS Snow Family**:

- Per migrazioni una tantum al di sopra di 1-2 TB, spesso più veloce e meno costoso del trasferimento di rete
- Nessun consumo di larghezza di banda internet durante la migrazione
- Finestra di noleggio del dispositivo di 10 giorni; spedizione prepagata

**Transit Gateway**:

- Semplifica notevolmente la connettività multi-VPC
- Routing transitivo (a differenza del VPC peering)
- Le route table con isolamento consentono la segmentazione senza connessioni di peering separate
- Il costo si accumula per molti attachment

**VPC Endpoint**:

- Vantaggio di sicurezza e costo per S3/DynamoDB (Gateway endpoint gratuiti)
- Elimina i costi del NAT Gateway per il traffico verso i servizi AWS
- Le endpoint policy aggiungono un livello di controllo degli accessi aggiuntivo rispetto a IAM e alle bucket policy
- Gli Interface endpoint per altri servizi (Secrets Manager, SSM, SES) mantengono il traffico privato ma costano circa $0.01/ora per AZ

**Global Accelerator**:

- Migliora la latenza delle applicazioni dinamiche per gli utenti globali: miglioramento del 33-47% in pratica per gli utenti lontani
- IP Anycast fissi (a differenza degli IP dinamici di CloudFront) — utili per la allowlist nei firewall
- Protocolli non HTTP (UDP, TCP) — CloudFront è solo HTTP/HTTPS
- Costo aggiuntivo ($0.025/ora per acceleratore + trasferimento dati)

## Riepilogo

Il lavoro su Aurora nel capitolo 24 ha ottimizzato il modo in cui Nimbus serve i dati alla propria applicazione. Questo capitolo riguarda come i dati si spostano tra il mondo esterno e AWS — e come rendere questo spostamento più affidabile, più veloce e meno costoso.

- **Site-to-Site VPN**: Tunnel crittografato su internet pubblico tra on-premises e VPC. Configurazione rapida, costo inferiore, latenza variabile. Due tunnel per la ridondanza. Massimo 1.25 Gbps per tunnel.
- **Direct Connect**: Connessione in fibra privata e dedicata ad AWS. Latenza prevedibile, larghezza di banda superiore, settimane per la configurazione, costo significativo. Break-even con i risparmi di egress VPN a circa 10-15 TB al mese per lo scenario di prezzi di Nimbus.
- **AWS Snow Family**: Appliance di storage fisico per la migrazione di dati in blocco. Più veloce del trasferimento internet per le migrazioni multi-TB. $380 in totale per la migrazione da 4TB di Nimbus vs. circa 17 ore di saturazione della rete.
- **Transit Gateway**: Hub per la connettività VPC e on-premises. Abilita il routing transitivo (a differenza del VPC peering). Supporta route table con isolamento per controllare quali VPC possono raggiungere quali. Scala a centinaia di connessioni.
- **VPC Endpoint**: Accesso privato ai servizi AWS senza NAT Gateway. I Gateway endpoint (S3, DynamoDB) sono gratuiti — aggiungili a ogni VPC che accede a S3 o DynamoDB. Ha fatto risparmiare a Nimbus $15.60/mese e ha rimosso il traffico S3/DynamoDB dal NAT Gateway.
- **Global Accelerator**: Instrada il traffico dinamico sulla backbone privata di AWS per una latenza inferiore e più costante a livello globale. IP Anycast statici. Miglioramenti della latenza del 33-47% per gli utenti lontani (Tokyo: 180ms → 95ms; Sydney: 210ms → 118ms). Non è una CDN — non mette in cache.
- **AWS DataSync**: Servizio agent-based per la migrazione e la replica di dati su file NFS/SMB on-premises in S3, EFS o FSx. Gestisce scheduling, verifica dei checksum, monitoraggio. Usato per migrazioni una tantum e replica continuativa di file share.
- **AWS Transfer Family**: Server SFTP, FTPS e FTP gestito supportato da S3 o EFS. Consente ai client SFTP esistenti di caricare file in S3 senza modificare il loro flusso di lavoro.

## Suggerimenti per l'Esame

*Dominio SAA-C03: Design High-Performing Architectures (Domain 3, Task 3.4)*

- **Segnali VPN vs Direct Connect**: VPN = "cifrare il traffico verso il VPC," "configurazione rapida," "costi contenuti." Direct Connect = "latenza costante e bassa," "trasferimenti di grandi volumi di dati," "connessione privata," "conformità che richiede una rete privata."
- **Transit Gateway vs VPC Peering**: Il peering non è transitivo (A→B→C non consente A→C). Il Transit Gateway è transitivo. "Molti VPC che devono comunicare" → Transit Gateway.
- **VPC Gateway Endpoint**: Gratuiti. Solo S3 e DynamoDB. Modifica della route table. Nessun costo aggiuntivo. Scenario d'esame: "ridurre i costi di trasferimento dati per l'accesso a S3 da una subnet privata" → Gateway Endpoint.
- **Global Accelerator vs CloudFront**: Accelerator = contenuto dinamico, protocolli non HTTP, IP statico, ottimizzazione della rete. CloudFront = caching, contenuto HTTP, CDN.
- **Direct Connect + VPN**: Puoi usare una VPN come backup per una connessione Direct Connect. Se il circuito Direct Connect si guasta, il traffico effettua il failover alla VPN. Più costoso della sola VPN, più affidabile della sola Direct Connect.
- **Direct Connect Gateway**: Connette un circuito Direct Connect a più VPC in più regioni o account. Senza di esso, un circuito Direct Connect si connette a un solo VGW in una sola regione.
- **AWS Snow Family**: "Migrazione di grandi volumi di dati," "la velocità di trasferimento è troppo lenta," "migrazione a scala petabyte" → Snow Family. Snowball Edge = fino a 80TB. Fai prima il calcolo del trasferimento: se spostare i dati attraverso la rete disponibile richiederebbe circa una settimana o più, la risposta è un dispositivo fisico. *Reality check (2026)*: AWS sta ritirando la famiglia — Snowmobile è stato ritirato nel 2024, Snowcone è stato dismesso nel tardo 2024, e a partire da novembre 2025 i dispositivi Snow non sono più offerti ai nuovi clienti (AWS ora punta a DataSync su link veloci e ai **Data Transfer Terminal**, luoghi sicuri dove porti le tue unità). Il question bank SAA-C03 è precedente a tutto questo, quindi all'esame "settimane di trasferimento di rete, larghezza di banda limitata" indica ancora Snowball.
- **Route table del Transit Gateway**: Il Transit Gateway supporta più route table per la segmentazione della rete. Segnale d'esame: "isolare il VPC di produzione dallo staging" con connettività condivisa attraverso il Transit Gateway → route table separate.
- **IP fissi di Global Accelerator**: A differenza di CloudFront, Global Accelerator fornisce due IP Anycast statici. Segnale d'esame: "l'applicazione ha bisogno di un indirizzo IP fisso per la allowlist dei client" o "traffico UDP" → Global Accelerator (CloudFront è solo HTTP/HTTPS).
- **Segnali AWS DataSync**: "migrare file share NFS/SMB in S3/EFS/FSx," "replica continuativa di dati su file on-premises," "migrazione di file agent-based." DataSync non è per il trasferimento SFTP compatibile con il protocollo — è per la migrazione e la replica di file share in blocco.
- **Segnali AWS Transfer Family**: "flusso SFTP esistente," "i partner o i clienti caricano file via SFTP," "migra il server SFTP nel cloud senza cambiare gli strumenti del client," "SFTP/FTPS/FTP supportato da S3." Transfer Family non è uno strumento di migrazione dei dati — è un endpoint di protocollo gestito. La distinzione: DataSync sposta i dati in blocco su un programma; Transfer Family fornisce un endpoint SFTP/FTP sempre attivo per upload di file continuativi.
- **MGN (Application Migration Service)**: "migrare centinaia di VM rapidamente, senza modifiche al codice," "rehost / lift-and-shift dei server su EC2" → MGN (replica a livello di blocco, avvii di test, cutover su istanze EC2 native). DataSync sposta *file*; DMS sposta *database*; MGN sposta *interi server*.

## Esercizi

**Esercizio 1 — Ricordo**

Spiega la differenza tra AWS Site-to-Site VPN e AWS Direct Connect. In quale scenario sceglieresti ciascuno?

*(Suggerimento: Pensa al tragitto casa-lavoro — la VPN è la strada pubblica con le porte dell'auto chiuse, mentre Direct Connect è la corsia privata noleggiata sull'autostrada con un pedaggio mensile.)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: Un'azienda di servizi finanziari richiede una connessione di rete privata, crittografata e dedicata dal loro data center on-premises ad AWS. Trasferiscono 500GB di dati finanziari sensibili ogni giorno. La connessione deve avere una latenza costante e prevedibile e non deve attraversare l'internet pubblico. Hanno anche bisogno di una connessione di backup nel caso in cui la principale si guasti.

Quale architettura soddisfa MEGLIO questi requisiti?

A) Una Site-to-Site VPN con routing BGP e una seconda VPN per la ridondanza
B) Una Direct Connect Hosted Connection con Direct Connect Gateway
C) Due connessioni Site-to-Site VPN attraverso diversi provider internet
D) Una connessione Direct Connect con una Site-to-Site VPN come backup

**Suggerimento 1**: "Non deve attraversare l'internet pubblico" — il traffico VPN passa attraverso l'internet pubblico (crittografato). Solo Direct Connect è privato.

**Suggerimento 2**: "Latenza costante e prevedibile" — le prestazioni della VPN su internet pubblico variano. Direct Connect è costante.

**Suggerimento 3**: "Connessione di backup" — qual è l'approccio consigliato quando Direct Connect è il primario?

**Risposta**: D

**Spiegazione**: Direct Connect fornisce una connessione privata e dedicata che non attraversa l'internet pubblico — soddisfacendo i requisiti di privacy e latenza. Una Site-to-Site VPN come backup fornisce ridondanza: se il circuito Direct Connect si guasta, il traffico effettua il failover alla VPN crittografata. Questo è il pattern HA standard per Direct Connect.

**Perché non A?** Il traffico Site-to-Site VPN attraversa l'internet pubblico, il che viola il requisito "non deve attraversare l'internet pubblico."

**Perché non B?** Una Hosted Connection fornisce una connessione Direct Connect ma l'opzione B non include un backup. Una Direct Connect singola senza backup è un single point of failure — la fibra fisica può essere tagliata.

**Perché non C?** Due connessioni VPN attraverso ISP diversi attraversano comunque l'internet pubblico, anche se crittografate. Non soddisfa il requisito di rete privata.

*Dominio SAA-C03: Design High-Performing Architectures — Task 3.4*

**Esercizio 3 — Sfida di Architettura** *(Opzionale)*

Nimbus si sta espandendo per avere team di ingegneria regionali a Seattle, Berlino e Singapore. Ogni team regionale ha bisogno di accedere a:

- Il VPC di produzione (sola lettura per il debugging)
- Il VPC di staging (accesso completo per i test)
- Il VPC di analisi (sola lettura per la reportistica)

Progetta la connettività di rete. Useresti il Transit Gateway? Direct Connect in ogni regione o Site-to-Site VPN? Come applicheresti l'accesso in sola lettura per la produzione? (Suggerimento: è sia una domanda di rete che di IAM.)

*(Non esiste una risposta corretta unica. L'obiettivo è praticare il design di reti multi-regione e multi-team.)*

**Extension**: Il team di Berlino segnala che la loro latenza VPN verso il VPC di produzione (us-west-2) è in media di 160ms. A quale volume di dati la Accelerated Site-to-Site VPN o una Direct Connect Hosted Connection diventerebbero l'opzione migliore? Ricerca il prezzo attuale della Direct Connect Hosted Connection da un AWS Partner europeo. Il solo miglioramento della latenza giustificherebbe il costo al volume di dati stimato?

## Scena Post-Crediti

"L'ho già deployato — ah," disse Leo, guardando la copia completarsi sul Snowball Edge dopo 94 minuti. "Avrei dovuto impostare il throttle della larghezza di banda sulla copia locale per evitare di saturare la rete dell'ufficio durante l'orario lavorativo."

Non aveva impostato il throttle. La rete dell'ufficio era rimasta a posto — il Snowball era un'operazione di rete locale. Ma lo switch di rete era diventato brevemente un collo di bottiglia mentre la copia si avvicinava a 9 Gbps di throughput locale. Corresse l'impostazione per la volta successiva.

La migrazione dei dati si completò in 8 giorni di calendario — 3 giorni perché il Snowball Edge arrivasse, 94 minuti per copiare i dati, 4 giorni perché AWS ricevesse il dispositivo e inserisse i dati, poi una sincronizzazione finale del delta accumulato mentre il Snowball era in transito. Tempo di lavoro effettivo per tutto il processo: meno di quattro ore.

Quell'ultimo passaggio era importante. Il Snowball Edge aveva copiato uno snapshot point-in-time del dataset da 4TB. Mentre era in transito, il database di produzione aveva continuato a girare — nuovi ordini venivano effettuati, nuovi record venivano creati. La sincronizzazione delta via VPN era di 12GB, completata in 18 minuti.

"Il trasferimento in blocco era il Snowball," disse Leo. "La sincronizzazione erano solo i dati netti-nuovi degli 8 giorni che ci ha impiegato."

"Il punto," disse, "è che la posta fisica è più veloce di internet al di sopra di un certo volume di dati."

"È ovvio o controintuitivo," disse Maya, "a seconda di come lo si vede."

"La prossima volta," disse Leo, "dovremmo configurare un Direct Connect."

Tom non allungò la mano verso la calcolatrice — aveva già fatto i conti prima, quando Direct Connect era emerso per la prima volta: circa mille al mese, porta più circuito.

"Per quello che facciamo adesso, probabilmente non vale la pena. Ma se iniziamo a spostare circa 10-15 TB al mese tra il nostro ufficio e AWS, i risparmi sul trasferimento dati di Direct Connect compenserebbero il costo."

"Quindi monitoriamo il volume di trasferimento dati," disse Priya, "e riesaminiamo quando supera la soglia."

"Questa è l'architettura cost-aware," disse Tom.

"È sempre stato questo il punto," disse Maya.

Priya aveva osservato la migrazione dall'altro lato della stanza. "La prossima volta che facciamo qualcosa del genere," disse, "possiamo farlo prima che i dati siano in produzione e il business ne dipenda? Migrare dati live è sempre più rischioso che migrare dati a riposo."

"Non sono mai a riposo quando il business è in funzione," disse Leo.

"Lo so," disse lei. "Questo è il punto. Pianifica la migrazione prima di averne bisogno. Non dopo."

Tom aveva già calcolato quanto costerebbe avere un secondo set di infrastruttura in us-east-1 pronto a ricevere una migrazione in qualsiasi momento. Tenne il numero per sé per ora. C'erano capitoli più immediati da chiudere.

Nel prossimo capitolo: cosa succede quando hai più dati di quanti qualsiasi database possa ragionevolmente gestire, e hai bisogno di dargli un senso.
