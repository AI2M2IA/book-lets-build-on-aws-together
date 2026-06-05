# Capitolo 11: Il Tuo Angolo Privato nel Cloud

Priya aveva un foglio di carta con un disegno sopra.

Non era un disegno complicato. Un rettangolo, etichettato "AWS". All'interno del rettangolo, un gruppo di scatole: istanze EC2, un database RDS, un cluster ElastiCache. Linee che collegavano tutto a tutto. E all'esterno del rettangolo, un'unica etichetta: "Internet".

Lo posò al centro del tavolo.

"Questo è quello che abbiamo," disse. "Il nostro database ha un indirizzo IP pubblico. Il nostro livello di cache può essere raggiunto dall'internet. Le nostre istanze EC2 sono tutte su una rete a blocchi. "

"Sembra tutto a posto," disse Leo. "Abbiamo i gruppi di sicurezza."

"I gruppi di sicurezza che hai configurato," disse Priya. "La notte. Durante la configurazione iniziale."

Leo non disse nulla.

"Non sto criticando la configurazione," disse lei. "Sto dicendo che quando tutto vive su una rete pubblica a blocchi, una singola configurazione errata è la differenza tra un sistema funzionante e uno accessibile a chiunque su internet."

Prese un pennarello rosso e disegnò un cerchio attorno al database.

"Questo non dovrebbe essere raggiungibile dall'internet. Per niente. Né tramite una regola del gruppo di sicurezza, né tramite una configurazione rafforzata. Dovrebbe essere strutturalmente inaccessibile."

"Dobbiamo parlare di architettura di rete," disse Maya.

"Dovevamo parlarne tre mesi fa," disse Priya. "Ma va bene anche adesso."

Il team si riunì attorno a una lavagna bianca per la prima volta in settimane.

**Il Problema del Parcheggio Aperto**

Immagina un enorme parcheggio pubblico. Diecimila auto. Qualsiasi auto può parcheggiare ovunque. Non ci sono barriere tra le zone, non ci sono cancelli, non ci sono sezioni riservate.

Questo è una rete aperta. Ogni servizio può raggiungere ogni altro servizio. Il tuo server web può parlare con il tuo database. Il tuo database può raggiungere l'internet. Il tuo livello di caching può ricevere connessioni da qualsiasi luogo.

Quando tutto può parlare con tutto, una singola compromissione influisce su tutto.

"Quindi, se qualcuno fa irruzione nel parcheggio," disse Tom, "può entrare in qualsiasi auto."

"E da qualsiasi auto, guidare ovunque," confermò Priya. "Vogliamo recinzioni. Vogliamo cancelli chiusi. Vogliamo zone."

Il VPC è il modo per costruire queste zone in AWS.

**Cos'è un VPC?**

Un **Virtual Private Cloud (VPC)** è una sezione logicamente isolata del cloud AWS – una rete privata che definisci, che solo le tue risorse possono accedere per impostazione predefinita.

Pensalo come un'area privata recintata all'interno del parcheggio pubblico enorme. La tua area ha le sue proprie regole: chi può entrare, chi può uscire, quali percorsi esistono tra le sezioni.

Quando crei un VPC, definisci:

**Un blocco CIDR:** L'intervallo di indirizzi IP disponibili all'interno della tua rete. Ad esempio, `10.0.0.0/16` ti fornisce 65.536 indirizzi IP possibili (da 10.0.0.0 a 10.0.255.255).

**Sottoreti:** Divisioni della tua VPC, ognuna assegnata a una porzione dell'intervallo di indirizzi IP e associata a una specifica Availability Zone.

**Tabelle di routing:** Regole che determinano dove vanno il traffico di rete.

**Internet Gateway:** La connessione tra la tua VPC e l'internet pubblico.

**Sottoreti: Pubbliche vs Private**

Non tutte le risorse dovrebbero essere accessibili pubblicamente.

Il tuo server web deve accettare il traffico dall'internet – i browser degli utenti devono essere in grado di raggiungerlo.

Il tuo database non dovrebbe mai accettare il traffico dall'internet – solo il tuo server web dovrebbe essere in grado di parlarne.

Questo è dove entrano in gioco le sottoreti.

Una **sottorete pubblica** è connessa a un Internet Gateway e può avere risorse con indirizzi IP pubblici. Il traffico può fluire verso e dal internet.

Una **sottorete privata** non ha una connessione internet diretta. Le risorse in una sottorete privata possono comunicare solo con altre risorse nella tua VPC (a meno che tu non configuri percorsi in uscita specifici). Non hanno indirizzi IP pubblici.

Per Nimbus, la progettazione divenne chiara:

```
Internet
    |
Internet Gateway
    |
Public Subnet (AZ-a)     Public Subnet (AZ-b)
  [Load Balancer]          [Load Balancer]
    |                          |
Private Subnet (AZ-a)    Private Subnet (AZ-b)
  [EC2 Instances]           [EC2 Instances]
    |                          |
Private Subnet (AZ-a)    Private Subnet (AZ-b)
  [RDS Primary]             [RDS Standby]
  [ElastiCache]             [ElastiCache]
```

Il load balancer è orientato al pubblico — deve ricevere traffico da Internet. Le istanze EC2 sono private — ricevono traffico solo dal load balancer. I database sono privati — ricevono traffico solo dalle istanze EC2.

"Quindi per raggiungere il database," disse Tom, "qualcuno dovrebbe passare attraverso il load balancer, poi attraverso l'istanza EC2, poi attraverso il gruppo di sicurezza del database?"

"Tre livelli," confermò Priya. "Difesa a strati."

**Il Gateway NAT: Sottoreti Private che Possono Ancora Scaricare Cose**

Le sottoreti private non possono raggiungere Internet. Ma a volte ne hanno bisogno. La tua istanza EC2 deve scaricare un aggiornamento software. La tua applicazione deve chiamare un'API esterna.

Questo è dove entra in gioco il **Gateway NAT** (Traduzione degli Indirizzi di Rete).

Un Gateway NAT si trova in una sottorete pubblica. Le risorse nelle sottoreti private possono inviare traffico in uscita al Gateway NAT, che lo inoltra a Internet, ma Internet non può avviare connessioni in uscita.

È come una porta girevole a senso unico. Puoi uscire. Nessuno può entrare da fuori.

"Quanto costa un Gateway NAT?" chiese Tom.

Nessuno fu sorpreso dalla domanda.

Il prezzo del Gateway NAT ha due componenti: una tariffa oraria per ogni Gateway NAT, più una tariffa per GB di dati di elaborazione. Questo può sommarsi in modo inaspettato (Capitolo 30 lo tratta in dettaglio). Per ora: non utilizzare più Gateway NAT di quanti ne servano, e siate consapevoli che grandi quantità di dati in uscita appariranno sulla vostra fattura.

**Tabelle di Routing: Come il Traffico Trova la Sua Strada**

Ogni sottorete ha una **tabella di routing** che indica a dove inviare il traffico.

Una tabella di routing tipica per una sottorete pubblica appare così:

| Destinazione | Target                      |
|-------------|-----------------------------|
| 10.0.0.0/16 | local                       |
| 0.0.0.0/0   | igw-xxxx (Internet Gateway) |

La prima regola: il traffico verso qualsiasi indirizzo IP nel tuo intervallo VPC rimane locale. La seconda regola: tutto il resto del traffico (`0.0.0.0/0` significa "tutto") va all'Internet Gateway.

Una tabella di routing per una sottorete privata:

| Destinazione | Target                 |
|-------------|------------------------|
| 10.0.0.0/16 | local                  |
| 0.0.0.0/0   | nat-xxxx (NAT Gateway) |

Il traffico delle sottoreti private rimane locale o esce tramite il Gateway NAT. Nessuna route diretta all'Internet Gateway.

**Gruppi di Sicurezza vs NACL (Anteprima)**

All'interno del VPC, hai due strumenti per controllare il traffico a livello di risorsa:

**Gruppi di Sicurezza** (Capitolo 15 tratta questo in dettaglio) agiscono come firewall virtuali per le singole risorse — un'istanza EC2, un'istanza RDS, un load balancer. Sono *statistici*: se il traffico è consentito in entrata, il traffico di risposta consentito in uscita.

**NACL (NACL)** operano a livello di sottorete e sono *stateless*: è necessario consentire esplicitamente sia il traffico in entrata che quello in uscita separatamente.

Per la maggior parte dei casi d'uso, i Gruppi di Sicurezza sono sufficienti. Le NACL aggiungono un ulteriore livello quando è necessario un controllo a livello di sottorete — ad esempio, bloccare un intervallo di indirizzi IP specifico affinché non raggiunga mai una sottorete.

"I gruppi di sicurezza a livello di istanza," scrisse Leo sulla lavagna. "Le NACL a livello di sottorete."

"E non lasciare mai aperto il porto 22 a 0.0.0.0/0," aggiunse Priya, guardando Leo.

"Ci è capitato una volta," disse Leo.

"È sempre esattamente una volta, finché non lo è," disse Priya, "finché non lo è."

**Peering VPC: Collegamento di Reti Private**

E se Nimbus cresce in più VPC? (Succede. I team diventano grandi. I servizi vengono isolati in account separati.)

**Peering VPC** consente a due VPC di comunicare privatamente come se fossero sulla stessa rete. Il traffico non lascia la rete privata di AWS.

Limiti importanti:

- Il peering VPC non è transitivo. Se VPC A è collegato a VPC B e VPC B è collegato a VPC C, A e C non possono comunicare — a meno che non si aggiunga un peering diretto A-C.
- Gli intervalli CIDR non possono sovrapporsi tra le sottoreti collegate.

Per architetture più grandi con molti VPC, **AWS Transit Gateway** (Capitolo 25) gestisce il routing transitivo senza richiedere una rete di peering completa.

## Punti di Forza e Limitazioni

**Perché la progettazione del VPC è importante**:

- L'isolamento della rete è difesa a strati — violare un livello non significa compromettere tutto
- Le sottoreti private riducono significativamente la superficie di attacco
- Le tabelle di routing e i gruppi di sicurezza forniscono un controllo preciso sui flussi di traffico
- I VPC si integrano con tutti i servizi di rete AWS (Direct Connect, VPN, Transit Gateway)

**Dove diventa complicato**:

- La progettazione del VPC richiede una pianificazione iniziale — gli intervalli CIDR sono difficili da modificare in seguito
- Troppe piccole VPC creano complessità di peering (problema n-quadrato)
- La risoluzione dei problemi dei problemi di rete nei VPC richiede la comprensione delle tabelle di routing, dei gruppi di sicurezza, delle NACL e delle associazioni di sottorete simultaneamente
- I costi del Gateway NAT possono sorprendervi a su larga scala (tariffe per GB di elaborazione)

## Riepilogo

- Una **VPC** è una rete privata logica in AWS — la tua area recintata all'interno del cloud pubblico.
- I **subnet** dividono la tua VPC per Availability Zone. I subnet pubblici si connettono all'Internet Gateway; i subnet privati non lo fanno.
- Posiziona le risorse orientate a Internet (bilanciatori di carico) nei subnet pubblici. Metti tutto il resto (EC2, database, cache) nei subnet privati.
- Le **route table** controllano il flusso del traffico. Ogni subnet ne ha una.
- **NAT Gateway** (in un subnet pubblico) consente alle risorse private di avviare connessioni in uscita a Internet senza accettare connessioni in entrata.
- **VPC Peering** collega due VPC in modo privato. Non è transitivo — per una connettività su larga scala, usa Transit Gateway.
- I **security group** proteggono le singole risorse (stateless). **NACLs** proteggono interi subnet (stateless).

## Consigli per l'Esame

*SAA-C03 Dominio: Progettazione di Architetture Sicure (Dominio 1, Task 1.2)*

- **Pubblico vs. subnet privato**: la differenza è la route table. Il subnet pubblico ha una route per un Internet Gateway. Il subnet privato non ce l'ha.
- **Posizionamento del NAT Gateway**: sempre nel *subnet pubblico*. Le risorse del subnet privato utilizzano la route table per instradare il traffico in uscita al NAT Gateway.
- **Alta disponibilità per NAT**: crea un NAT Gateway per AZ. Se hai un NAT Gateway in AZ-a e AZ-b le istanze instradano il traffico attraverso di esso, il fallimento di AZ-a fa anche cadere l'accesso a Internet di AZ-b.
- **VPC Peering non è transitivo**: l'esame descriverà tre VPC e chiederà se possono comunicare attraverso il mediano — la risposta è no senza peering diretto o Transit Gateway.
- **Sovrapposizione CIDR**: le VPC peering non possono avere blocchi CIDR sovrapposti. Trappola classica dell'esame.
- **Host bastion (jump box)**: per accedere tramite SSH a un'istanza EC2 privata, è necessario un host bastion nel subnet pubblico. L'host bastion è l'unica macchina con un indirizzo IP pubblico; le istanze private accettano solo SSH dall'indirizzo IP del security group dell'host bastion.
- **Endpoint VPC**: consentono alle risorse private di raggiungere i servizi AWS (S3, DynamoDB) senza passare attraverso il NAT Gateway. Esistono due tipi: **endpoint gateway** (S3, DynamoDB — gratuiti) e **endpoint di interfaccia** (altri servizi — a pagamento a ore più dati).

## Esercizi

**Esercizio 1 — Ricordo**

Spiega perché un database dovrebbe essere in un subnet privato. Qual'è la minaccia specifica che questo mitiga?

*(Suggerimento: Cosa può fare qualcuno a un database che è su Internet pubblico che non può fare a uno che è solo accessibile dalla VPC?)*

**Esercizio 2 — Esercitazione per l'Esame**

*Scenario*: Un'azienda sta progettando un'applicazione web a tre livelli su AWS. Il livello web (ALB + EC2) deve accettare il traffico Internet. Il livello di applicazione (EC2) deve ricevere traffico solo dal livello web. Il livello del database (RDS) deve ricevere traffico solo dal livello di applicazione. Le istanze EC2 del livello di applicazione devono scaricare pacchetti software da Internet. La soluzione deve essere altamente disponibile.

Quale architettura soddisfa meglio questi requisiti?

A) Tutte le fasce di livello in subnet pubblici; i security group limitano il traffico tra le fasce di livello
B) Fascia di livello web in subnet pubblici; fasce di app e database in subnet privati; un NAT Gateway in un subnet pubblico
C) Fascia di livello web in subnet pubblici; fasce di app e database in subnet privati; un NAT Gateway per AZ
D) Tutte le fasce di livello in subnet privati; un Internet Gateway fornisce accesso Internet bidirezionale a tutte le fasce di livello

**Suggerimento 1**: "Altamente disponibile" significa nessun singolo punto di errore. Quale opzione introduce un NAT Gateway come singolo punto di errore?

**Suggerimento 2**: Se l'AZ del NAT Gateway fallisce, quali istanze perdono l'accesso a Internet?

**Suggerimento 3**: Leggi attentamente il requisito — il livello di applicazione ha bisogno di accesso *in uscita* a Internet, non di accesso in entrata.

**Risposta**: C

**Spiegazione**: La fascia di livello web nei subnet pubblici fornisce l'accesso Internet attraverso l'ALB. Le fasce di app e database nei subnet privati assicurano che non siano direttamente accessibili da Internet, creando un modello di sicurezza a livelli. Un NAT Gateway per AZ (uno in ogni subnet pubblico) fornisce un accesso Internet in uscita ad alta disponibilità per le istanze nei subnet privati — se un AZ fallisce, il NAT Gateway dell'altro AZ continua a servire il traffico.

**Perché non A?** I subnet pubblici per tutte le fasce di livello espongono l'applicazione e il database direttamente a Internet, vanificando lo scopo del modello di sicurezza a livelli.

**Perché non B?** Un NAT Gateway in un singolo AZ è un singolo punto di errore. Se l'AZ del NAT Gateway fallisce, tutte le istanze private perdono l'accesso a Internet.

**Perché non D?** Un Internet Gateway fornisce una connettività bidirezionale — le subnet private con una route all'Internet Gateway sono effettivamente subnet pubbliche.

*SAA-C03 Dominio: Progettazione di Architetture Sicure — Task 1.2*

**Esercizio 3 — Sfida di Architettura** *(Opzionale)*

Nimbus sta crescendo. Il team di ingegneria vuole separare il "servizio menu" nel suo account con la sua VPC, mantenendo l'applicazione Nimbus principale in un account e una VPC separati.

Come connetteresti queste due VPC per consentire all'applicazione principale di interrogare il servizio menu? Quali sono i vincoli che dovresti considerare? Cosa useresti invece se Nimbus avesse dieci VPC separati per microservizi che tutti dovevano comunicare?

*(Non esiste una risposta univoca corretta. L'obiettivo è esercitarsi nella progettazione di reti multi-VPC.)*

## Scena Post-Crediti

Priya ha ridisegnato la rete.

Tre giorni dopo, ogni risorsa era al suo posto giusto. Istance EC2 in subnet private, load balancer in subnet pubbliche, RDS e ElastiCache accessibili solo dallo strato applicativo. Gruppi di sicurezza con le porte minime richieste.

Leo aveva tentato di SSH direttamente nel database per controllare qualcosa. Non riusciva. La connessione era scaduta.

"Bene," disse Priya.

"Volevo solo controllare una cosa," disse Leo.

"Che cosa?"

"Se l'indice era stato impostato correttamente."

Priya aprì il suo laptop. "Posso verificarlo dal bastion host, attraverso l'istanza applicativa, che ha le credenziali corrette per il database in Secrets Manager."

"Sono quattro salti."

"È corretto." Digita qualcosa. "L'indice è stato impostato. Benvenuto."

Leo guardò lo schermo per un momento.

"Lo imparerò," disse.

"Lo stai già facendo," rispose lei. "Ti sei limitato a lamentarti dei controlli di sicurezza invece di lamentarti che non esistessero."

Nel prossimo capitolo: come internet trova Nimbus – la macchina invisibile dei nomi di dominio.
