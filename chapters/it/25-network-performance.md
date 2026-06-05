# Capitolo 25: La Strada Privata

Alzati per un momento. Scuoti le tue mani.

Stiamo per parlare di spostamento di dati. Non tra i servizi di AWS, ma tra il mondo reale e AWS – tra il tuo ufficio e la tua infrastruttura cloud, tra i continenti.

Il team di infrastruttura di Nimbus (ora composto da quattro ingegneri) lavorava da un ufficio condiviso a Seattle. Avevano bisogno di accedere all'infrastruttura AWS che gestivano. Alcune operazioni richiedevano la connessione a risorse nel VPC.

Attualmente, utilizzavano una VPN sui loro laptop per accedere all'host bastion nel subnet pubblico, quindi si connettevano alle risorse da lì.

Funzionava. Era lenta. La connessione VPN instradava il traffico attraverso internet pubblico: Seattle → fibra transcontinentale → molteplici hop di operatori → us-east-1. Ogni viaggio di andata e ritorno richiedeva 80+ millisecondi.

"Per l'uso quotidiano di SSH, è accettabile," disse Leo. "Ma stiamo per iniziare a spostare il nostro database di analisi. 4 terabyte di dati storici sugli ordini. Attraverso questa connessione, la migrazione richiederà settimane."

"Abbiamo bisogno di una connessione migliore," disse Maya.

"Una connessione privata," aggiunse Priya. "Non attraverso internet pubblico."

Immagina di andare al lavoro. Una VPN Site-to-Site è come guidare su strade pubbliche: chiudi le porte dell'auto (crittografia), ma condividi comunque le corsie con tutti gli altri, e il traffico congestionato rallenta in modo imprevedibile. Direct Connect è come noleggiare una corsia privata dedicata sulla autostrada – nessun traffico condiviso, velocità costante e un canone mensile più elevato. La strada pubblica è generalmente accettabile. Quando devi trasportare un camion pieno di merci preziose con un programma rigoroso, paghi per la corsia privata.

**AWS Site-to-Site VPN: L'Opzione Rapida**

**AWS Site-to-Site VPN** crea un tunnel crittografato tra la tua rete on-premises e il tuo VPC, attraversando internet pubblico.

Configurazione:

1. Crea un Gateway Virtuale Privato (VGW) collegato al tuo VPC
2. Crea un Gateway Cliente che rappresenta il tuo router on-premises
3. Stabilisci due tunnel VPN (per ridondanza) tra di essi

Il traffico è crittografato (AES-256). Viaggia attraverso internet pubblico, il che significa che la latenza dipende dalle condizioni di internet. AWS fornisce due tunnel automaticamente per la ridondanza – se un tunnel ha problemi, il traffico si sposta all'altro.

**Quando utilizzare Site-to-Site VPN:**

- Configurazione rapida (minuti a ore)
- Costo-efficace ($0.05/ora per connessione VPN)
- Larghezza di banda: fino a 1.25 Gbps per tunnel
- Latenza internet accettabile per l'uso previsto

Per la migrazione di Nimbus da 4TB, la larghezza di banda basata su internet di 1.25 Gbps richiederebbe: 4TB / 1.25 Gbps ≈ 7 ore minimo, con un overhead reale più vicino a 12-20 ore. Accettabile, ma la congestione sul percorso internet pubblico lo rende imprevedibile.

"Qual è l'altra opzione?" chiese Tom.

**AWS Direct Connect: La Linea Dedicata**

**AWS Direct Connect** stabilisce una connessione di rete privata dedicata tra la tua posizione (o la tua struttura di collocazione) e AWS. Il traffico non tocca mai internet pubblico.

Direct Connect è una connessione fisica – una linea in fibra dalla tua rete a una posizione Direct Connect di AWS. Collabori con un fornitore di servizi di telecomunicazioni per stabilire il circuito fisico. AWS fornisce la porta sul proprio lato.

**Vantaggi:**

- Latenza costante e prevedibile (nessuna variazione dovuta a internet)
- Velocità da 50 Mbps a 100 Gbps
- Costi di trasferimento dati inferiori rispetto a internet (i tassi di trasferimento dati AWS Direct Connect sono più economici dei tassi di trasferimento dati standard di uscita AWS)
- Maggiore sicurezza (circuito privato, non internet pubblico)

**Svantaggi:**

- Il tempo di configurazione è di settimane o mesi (provisioning dell'infrastruttura fisica)
- Costo significativamente superiore alla VPN ($0.025-0.30/ora per porta, più costi del circuito di telecomunicazioni – spesso $500-1000+/mese minimo)
- Nessuna ridondanza integrata (devi stabilire circuiti ridondanti da solo)
- Non adatto per uffici distribuiti geograficamente senza più circuiti

Per Nimbus: Direct Connect era eccessivo per le loro attuali dimensioni. Ma per le aziende con volumi di trasferimento dati significativi o requisiti di conformità per connessioni di rete private, Direct Connect si ripagherà.

**Connessioni Ospitate: Il Punto Intermedio**

Non tutte le organizzazioni possono impegnarsi in un circuito in fibra dedicato da 100 Gbps. **Direct Connect Hosted Connections** consentono ai Partner Direct Connect di AWS (telecom provider approvati) di fornire connessioni con capacità inferiore a 1 Gbps che vengono condivise con altri clienti.

La configurazione è più veloce (giorni a settimane, non mesi) e i costi sono inferiori a una connessione dedicata. Lo svantaggio: la capacità condivisa significa una latenza meno coerente.

Per Nimbus (man mano che cresce): una connessione ospitata da 500 Mbps tramite un partner fornirebbe una connettività privata a un prezzo accessibile.

**AWS Transit Gateway: Hub-and-Spoke per VPC**

Man mano che Nimbus cresceva, avrebbe accumulato più VPC: il VPC di produzione, il VPC di staging, il VPC di analisi, il VPC di strumenti di sicurezza.

Senza una pianificazione accurata, connettere questi VPC richiede una mesh completa di peering VPC connessioni. Per 4 VPC: 6 peering connessioni. Per 10 VPC: 45 peering connessioni. Per 20 VPC: 190 connessioni. Questo non scala.

**AWS Transit Gateway** è un hub di rete che collega più VPC (Virtual Private Cloud) e reti on-premises. Invece di una rete a maglia di connessioni di peering, ogni VPC si connette al Transit Gateway. Transit Gateway instradare il traffico tra di essi.

```
On-premises ──── Direct Connect ──┐
                                  │
Production VPC ───────────────── Transit Gateway
Staging VPC ──────────────────── Transit Gateway
Analytics VPC ────────────────── Transit Gateway
Security VPC ─────────────────── Transit Gateway
```

**Routing Transitivo**: Se VPC A e VPC B sono entrambi connessi a un Transit Gateway, possono comunicare – senza una connessione peer diretta. Il Transit Gateway gestisce il routing. A differenza del peering tra VPC (che non è transibile), il Transit Gateway abilita una topologia hub-and-spoke.

**Costi del Transit Gateway**: Sono calcolati per ogni collegamento (VPC o connessione VPN/Direct Connect) più per GB di dati elaborati. A livello di produzione, questo vale la semplicità.

**Endpoint VPC: Accesso Privato ai Servizi AWS**

Un costo e un problema di sicurezza sottili: quando un'istanza EC2 (in una subnet privata) chiama l'API S3, quel traffico viene indirizzato attraverso il NAT Gateway (per raggiungere internet, dove l'endpoint pubblico di S3 è) e si paga per l'elaborazione del NAT Gateway.

**Endpoint VPC** consentono alle risorse all'interno della tua VPC di comunicare con i servizi AWS in modo privato, senza passare attraverso internet pubblico – e senza NAT Gateway.

Esistono due tipi:

**Endpoint di Gateway** (a pagamento): Per S3 e DynamoDB. Devi aggiungere un percorso nella tua tabella di routing che indirizzi il traffico verso S3 o DynamoDB all'endpoint invece del NAT Gateway. Creazione e utilizzo gratuiti.

**Endpoint di Interfaccia** (a pagamento): Per altri servizi AWS (SQS, SNS, Secrets Manager, SSM, ecc.). Crea un ENI (Elastic Network Interface) nella tua subnet con un indirizzo IP privato. Il traffico verso il servizio utilizza questo indirizzo IP privato. I costi sono di circa $0,01/ora per zona di disponibilità (AZ) più l'elaborazione dei dati.

Tom ha immediatamente creato Endpoint di Gateway per S3 e DynamoDB dopo aver appreso che erano gratuiti. La tariffa di elaborazione del NAT Gateway è diminuita del 30%.

**AWS Global Accelerator: Routing al Bordo**

Quando Nimbus serviva gli utenti della costa occidentale da us-east-1 (Virginia), la latenza era di 80ms. Non perché il server fosse eccessivamente lontano, ma perché il routing internet pubblico tra Seattle e Virginia era subottimale, saltando attraverso più reti di operatori.

**AWS Global Accelerator** utilizza la rete backbone privata di AWS (la stessa infrastruttura che alimenta CloudFront) per instradare il traffico tra gli utenti e le applicazioni AWS. Invece di un routing internet pubblico, il traffico entra nella rete AWS nella posizione edge più vicina e viaggia lungo il percorso privato ottimizzato verso la tua applicazione.

Per Nimbus, un utente di Seattle avrebbe:

- **Senza Global Accelerator**: Routing attraverso i carrier internet pubblici → ~80ms
- **Con Global Accelerator**: Raggiunge il punto edge AWS più vicino a Seattle → viaggia lungo la backbone di AWS → raggiunge us-east-1 → ~45ms

Global Accelerator non memorizza nella cache i contenuti (CloudFront lo fa). Ottimizza il percorso di rete per le richieste dinamiche.

**Quando utilizzare Global Accelerator vs CloudFront**:

- CloudFront: contenuti statici e memorizzabili nella cache, caso d'uso CDN
- Global Accelerator: contenuti dinamici, protocolli non HTTP (UDP, gaming, IoT) o quando hai bisogno di un indirizzo IP Anycast statico

## Punti di Forza e Limitazioni

**VPN Site-to-Site**:

- Configurazione rapida, basso costo
- Percorso internet pubblico significa latenza variabile
- Limitato soffitto di banda

**Direct Connect**:

- Percorso privato, fibra dedicata all'AWS
- Configurazione lenta, costo ricorrente significativo
- Un circuito fisico è un singolo punto di guasto (aggiungi la ridondanza)

**Transit Gateway**:

- Semplifica notevolmente la connettività tra VPC
- Routing transibile (a differenza del peering tra VPC)
- I costi si accumulano per molti collegamenti

**Endpoint VPC**:

- Vantaggio di sicurezza e costi per S3/DynamoDB (endpoint di gateway gratuiti)
- Elimina i costi di elaborazione del NAT Gateway per il traffico verso i servizi AWS

**Global Accelerator**:

- Migliora la latenza dinamica delle applicazioni per gli utenti globali
- Indirizzi Anycast fissi (a differenza degli indirizzi Anycast dinamici di CloudFront)
- Costo aggiuntivo ($0,025/ora per acceleratore + trasferimento dati)

## Riepilogo

- **VPN Site-to-Site**: Tunnel crittografato sull'internet pubblico tra on-premises e VPC. Configurazione rapida, costo inferiore, latenza variabile.
- **Direct Connect**: Connessione in fibra dedicata e privata all'AWS. Latenza prevedibile, larghezza di banda elevata, settimane per la configurazione, costo significativo.
- **Transit Gateway**: Hub per la connettività VPC e on-premises. Consente il routing transibile. Scala fino a centinaia di connessioni.
- **Endpoint VPC**: Accesso privato ai servizi AWS senza NAT Gateway. Endpoint di gateway (S3, DynamoDB) sono gratuiti.
- **Global Accelerator**: Instradamento del traffico dinamico sulla backbone di AWS per una latenza più bassa e più coerente a livello globale.

## Suggerimenti per l'Esame

*SAA-C03 Dominio: Progettare Architetture ad Alte Prestazioni (Dominio 3, Task 3.4)*

- **Segnali VPN vs Direct Connect**: VPN = "crittografa il traffico verso il VPC", "configurazione rapida", "costi sensibili". Direct Connect = "latenza costante e a bassa latenza", "trasferimenti di dati di grandi dimensioni", "connessione privata", "requisiti di conformità per una rete privata".
- **Transit Gateway vs Peering VPC**: Il peering non è transitivo (A→B→C non consente A→C). Il Transit Gateway è transitivo. "Molti VPC che necessitano di comunicare" → Transit Gateway.
- **Endpoint Gateway VPC**: Gratuiti. S3 e DynamoDB solo. Modifica della tabella di routing. Nessun costo aggiuntivo. Scenario di esame: "ridurre i costi di trasferimento dei dati per l'accesso a S3 da un subnet privato" → Endpoint Gateway.
- **Global Accelerator vs CloudFront**: L'acceleratore = contenuto dinamico, non HTTP, indirizzo IP statico, ottimizzazione della rete. CloudFront = caching, contenuto HTTP, CDN.
- **Direct Connect + VPN**: È possibile utilizzare una VPN come backup per una connessione Direct Connect. Se il circuito Direct Connect fallisce, il traffico passa al backup VPN. Più costoso di una VPN da solo, più affidabile di una Direct Connect da solo.
- **Gateway Direct Connect**: Collegare un circuito Direct Connect a più VPC in più regioni o account. Senza di esso, un circuito Direct Connect si connette a un VGW in una sola regione.

## Esercizi

**Esercizio 1 — Ricordo**

Spiega la differenza tra AWS Site-to-Site VPN e AWS Direct Connect. In quale scenario sceglieresti ciascuno?

*(Suggerimento: Pensa al tempo di configurazione, al costo, alla coerenza della latenza e ai requisiti di larghezza di banda.)*

**Esercizio 2 — Esercitazione d'esame**

*Scenario*: Un'azienda di servizi finanziari necessita di una connessione di rete privata e crittografata dal loro data center on-premises ad AWS. Trasferiscono 500 GB di dati finanziari sensibili ogni giorno. La connessione deve avere una latenza costante e prevedibile e non deve attraversare Internet pubblico. Hanno anche bisogno di una connessione di backup nel caso in cui la principale fallisca.

Quale architettura soddisfa meglio questi requisiti?

A) Una VPN Site-to-Site con routing BGP e una seconda VPN per la ridondanza
B) Una connessione Direct Connect con una VPN Site-to-Site come backup
C) Due connessioni VPN Site-to-Site attraverso diversi provider Internet
D) Una connessione Direct Connect Hosted con Direct Connect Gateway

*(Suggerimento 1*: "Non deve attraversare Internet pubblico" — il traffico VPN passa attraverso Internet pubblico (crittografato). Solo Direct Connect è privato.

*(Suggerimento 2*: "Latenza costante e prevedibile" — le prestazioni VPN su Internet pubblico variano. Direct Connect è costante.

*(Suggerimento 3*: "Connessione di backup" — qual è l'approccio standard quando Direct Connect è la principale?

**Risposta**: B

**Spiegazione**: Direct Connect fornisce una connessione privata e dedicata che non attraversa Internet pubblico — soddisfacendo i requisiti di privacy e latenza. Una VPN Site-to-Site come backup fornisce la ridondanza: se il circuito Direct Connect fallisce, il traffico passa al backup VPN crittografato. Questo è il modello HA standard per Direct Connect.

**Perché non A?** Il traffico VPN Site-to-Site attraversa Internet pubblico, il che viola il requisito di "non attraversare Internet pubblico".

**Perché non C?** Due connessioni VPN attraverso diversi ISP comunque attraversano Internet pubblico, anche se crittografate. Non soddisfa il requisito di rete privata.

**Perché non D?** Una Hosted Connection fornisce una connessione Direct Connect ma l'opzione D non include un backup. Una Direct Connect senza backup è un singolo punto di errore — la fibra può essere tagliata.

*SAA-C03 Dominio: Progettare Architetture ad Alte Prestazioni — Attività 3.4*

**Esercizio 3 — Sfida Architetturale** *(Opzionale)*

Nimbus sta espandendo la sua presenza per avere team di ingegneria regionali a Seattle, Berlino e Singapore. Ogni team regionale ha bisogno di accedere a:

- Il VPC di produzione (solo lettura per il debug)
- Il VPC di staging (accesso completo per i test)
- Il VPC di analisi (solo lettura per la reportistica)

Progetta la connettività di rete. Utilizzeresti Transit Gateway? Direct Connect in ogni regione o Site-to-Site VPN? Come applicheresti l'accesso in sola lettura per la produzione? (Suggerimento: si tratta sia di una domanda di rete che di IAM.)

*(Non esiste una risposta corretta univoca. L'obiettivo è praticare la progettazione di reti multi-regione, multi-team.)*

## Scena Post-Crediti

La migrazione dei dati è stata completata in 14 ore.

Non attraverso il lento percorso di Internet pubblico — Leo aveva utilizzato AWS Snow Family (apparecchiature di archiviazione fisiche spedite e ricevute da AWS) per la maggior parte dei dati, quindi ha sincronizzato il delta rimanente tramite VPN.

"La prossima volta," disse, "dovremmo configurare una Direct Connect."

Tom ha cercato i prezzi.

"Una porta a 1Gbps dedicata costa 216 dollari al mese," ha detto. "Più il circuito dal nostro ufficio, che un operatore di telecomunicazioni ha quotato a 800 dollari al mese."

"Quindi circa mille al mese in totale."

"Per quello che facciamo ora, probabilmente non ne vale la pena. Ma se iniziamo a spostare più di 10 TB al mese tra il nostro ufficio e AWS, i risparmi sui costi di trasferimento dati di Direct Connect compenserebbero il costo."

"Quindi monitoriamo il volume di trasferimento dei dati," ha detto Priya, "e lo rivediamo quando supera la soglia."

"Questo è l'architettura consapevole dei costi," ha detto Tom.

"Questo è sempre stato il punto," ha detto Maya.

Nel prossimo capitolo: cosa succede quando hai più dati di quanto qualsiasi database possa gestire ragionevolmente, e hai bisogno di farne un senso.
