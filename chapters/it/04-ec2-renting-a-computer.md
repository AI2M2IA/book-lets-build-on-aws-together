# Capitolo 4: Un Computer nell'Edificio di Qualcun Altro

L'app Nimbus girava sul laptop di Tom.

Andava bene per mostrare una demo agli investitori. Non andava bene quando Maya premette "lancia" e 200 ristoranti si iscrissero nella prima settimana. Il laptop di Tom stava ora gestendo ordini reali, menu reali e clienti reali — seduto sotto la scrivania di Tom, collegato al Wi-Fi dell'ufficio, attaccato a una multipresa che alimentava anche un termoventilatore e una macchina del caffè.

"Abbiamo bisogno di un server," disse Maya. "Uno vero. Che giri da qualche parte che non sia sotto la tua scrivania."

Tom guardò il suo laptop. La ventola era udibile dall'altra parte della stanza.

Fu allora che iniziarono a capire cosa significhi davvero noleggiare un computer.

**L'Astrazione che Nessuno Spiega**

Quando le persone dicono che la loro applicazione "gira sul cloud," di solito intendono che gira su una macchina virtuale — un computer che non esiste fisicamente come hardware dedicato, ma che si comporta in ogni modo come se lo facesse.

Ecco il meccanismo.

Un server fisico in un data center AWS ha molte risorse: core CPU, memoria, disco e larghezza di banda di rete. AWS prende quel server fisico e lo divide usando un software chiamato **hypervisor**. L'hypervisor crea più macchine virtuali, ognuna delle quali sembra avere la propria CPU, memoria e disco dedicati — ma che in realtà condivide l'hardware fisico sottostante.

Ognuna di quelle macchine virtuali è ciò che AWS chiama un'**istanza EC2**.

EC2 sta per Elastic Compute Cloud. La parte "elastica" è importante, e ci arriveremo. Per ora: un'istanza EC2 è un computer che noleggi all'ora. Ha un sistema operativo, una connessione di rete e potenza di calcolo. Esegue la tua applicazione proprio come farebbe un server fisico.

L'analogia: noleggiare un appartamento in un grande edificio versus comprare una casa.

Il proprietario dell'edificio (AWS) mantiene la struttura fisica, l'impianto idraulico, l'impianto elettrico, la sicurezza. Tu ricevi un'unità. La arredi come vuoi. Paghi mensilmente (o ogni ora). Quando hai bisogno di più spazio, ti sposti in un'unità più grande. Quando ti trasferisci, smetti di pagare.

**Scegliere la Tua Istanza: Le Dimensioni Contano**

Non tutte le istanze EC2 sono uguali. AWS offre centinaia di tipi di istanza, organizzati in famiglie basate su ciò per cui sono ottimizzate.

**Uso generale** (es. `t3`, `m6i`): CPU e memoria bilanciate. Buona scelta predefinita per la maggior parte delle applicazioni web.

**Ottimizzato per il calcolo** (es. `c7g`): Più CPU rispetto alla memoria. Buono per la codifica video, la modellazione scientifica, l'elaborazione batch.

**Ottimizzato per la memoria** (es. `r7i`): Più memoria rispetto alla CPU. Buono per database, caching, analisi in-memory.

**Ottimizzato per lo storage** (es. `i3`): Storage locale ad alta velocità. Buono per carichi di lavoro intensivi di dati che necessitano di I/O su disco molto veloce.

**Calcolo accelerato** (es. `p4`): GPU allegate. Buono per training di machine learning e rendering grafico.

Ogni famiglia ha dimensioni. Un `t3.micro` ha 2 CPU virtuali e 1 GB di memoria. Un `t3.xlarge` ha 4 CPU virtuali e 16 GB. Scegli la dimensione giusta per il carico di lavoro.

Leo aveva scelto un `t3.micro`.

"Quanti utenti può gestire un `t3.micro`?" chiese Tom.

"Dipende dall'applicazione," disse Leo. "Ma probabilmente non un centinaio di utenti simultanei che caricano immagini e fanno query sul database."

Tom scrisse "t3.micro" sulla lavagna e disegnò una faccia triste accanto.

**L'AMI: Lo Stato Iniziale della Tua Macchina**

Prima di avviare un'istanza EC2, scegli il suo sistema operativo e la configurazione iniziale. In AWS, questo si chiama **Amazon Machine Image** (AMI).

Un'AMI è un template. Definisce:

- Il sistema operativo (Amazon Linux, Ubuntu, Windows Server, ecc.)
- Software preinstallato
- Lo stato iniziale del disco

Quando avvii un'istanza da un'AMI, AWS crea una copia fresca di quel template solo per te. Puoi anche creare le tue AMI — se configuri un server esattamente come vuoi, puoi "salvare" quello stato come AMI personalizzata e usarla per avviare server identici rapidamente. È così che distribuisci ambienti coerenti su larga scala.

Pensa a un'AMI come a una ricetta. La ricetta descrive il pasto. Ogni volta che segui la ricetta, ottieni lo stesso pasto. Se vuoi cambiare il pasto in modo permanente, aggiorni la ricetta.

**Le Key Pair: Il Modo Giusto per Accedere a un Server**

Ricordi il disastro di "Admin123" del capitolo precedente?

Il modo corretto per accedere a un'istanza EC2 è con una **key pair**.

Una key pair è una coppia crittografica: una chiave pubblica (archiviata da AWS sul server) e una chiave privata (un file che scarichi e mantieni segreto). Per accedere, usi SSH — un protocollo sicuro — con la tua chiave privata. Non c'è password. Se perdi la chiave privata, perdi l'accesso. Non c'è "ho dimenticato la password" per SSH.

Questo è importante perché le key pair sono:

- Uniche per te
- Crittograficamente impossibili da indovinare
- Non archiviate da AWS (tu mantieni la chiave privata)
- Facili da revocare (elimina la chiave dal server, genera una nuova coppia)

Priya aveva già impostato l'accesso basato su chiave sul server Nimbus. Il server Admin123 fu dismesso. Nessuno ne fu dispiaciuto.

**Ciclo di Vita dell'Istanza: Non Per Sempre**

Questo è qualcosa che molti principianti trascurano.

Le istanze EC2 non sono permanenti per impostazione predefinita. Quando fermi un'istanza, la risorsa di calcolo viene rilasciata. Quando la riavvii, potrebbe girare su hardware fisico diverso. Qualsiasi dato archiviato *sull'istanza stessa* (sul suo volume root) sopravvive a un ciclo di stop/start — ma l'indirizzo IP pubblico cambia.

Quando *termini* un'istanza, è sparita. A meno che tu non abbia storage separato allegato (che copriamo nel Capitolo 6), qualsiasi dato sull'istanza scompare.

Questa "effemeratezza" è in realtà una funzionalità, non un difetto. Significa che puoi avviare server, usarli e buttarli via. Abilita il scaling orizzontale. Ma significa anche che non dovresti mai archiviare dati importanti *sull'istanza* EC2 stessa.

Dove vivono i dati, allora?

Nello storage separato. Ci arriviamo nei prossimi due capitoli.

**Cosa Significa "Elastic"**

Abbiamo detto che EC2 sta per Elastic Compute Cloud. Cosa c'è di elastico?

Due cose:

**Elasticità verticale**: Puoi cambiare le dimensioni di un'istanza. Ferma l'istanza, cambiala da `t3.micro` a `t3.xlarge`, riavviala. Più CPU e memoria, stessa applicazione, stesso setup.

**Elasticità orizzontale**: Puoi aggiungere più istanze. Invece di un grande server, fai girare dieci server medi dietro un load balancer. Quando il traffico scende, rimuovi le istanze e smetti di pagarle.

Entrambi gli approcci risolvono il problema del "server singolo, troppo traffico". Hanno compromessi diversi, che esploriamo nel Capitolo 7 quando aggiungiamo l'Auto Scaling alla storia.

L'intuizione chiave: con EC2, la potenza di calcolo è qualcosa che *regoli* piuttosto che qualcosa che *compri*. Ne hai bisogno di più? Gira la manopola in su. Ne hai bisogno di meno? Girala in giù. Paga di conseguenza.

## Punti di Forza e Limitazioni

**Perché EC2 è potente**:

- Controllo completo. Scegli il sistema operativo, il software, la configurazione. È il tuo computer.
- Dimensionamento flessibile. Centinaia di tipi di istanza per ogni caso d'uso.
- Nessun hardware da gestire. AWS gestisce il layer fisico.
- Fatturazione per secondo (per la maggior parte dei tipi di istanza). Fermi l'istanza, smetti di pagare.
- Funziona con tutto. EC2 è la base su cui sono costruiti la maggior parte degli altri servizi AWS.

**Dove diventa complicato**:

- Sei responsabile del patching e aggiornamento del sistema operativo. (Modello di Responsabilità Condivisa — questa è la parte "nel cloud" che è tua.)
- Gestire EC2 su larga scala significa gestire lo stato dell'istanza, le AMI, le patch di sicurezza e il ciclo di vita su potenzialmente migliaia di macchine. Questo è overhead operativo.
- EC2 non è la risposta giusta per tutto. Per codice event-driven che gira raramente, Lambda (Capitolo 20) è più economico e semplice. Per carichi di lavoro containerizzati, ECS e EKS (Capitolo 21) offrono una migliore efficienza delle risorse.
- Le istanze inutilizzate costano comunque denaro. Se fermi un'istanza, smetti di pagare per il calcolo — ma se hai storage allegato, continui a pagarlo.

## Riepilogo

- Un'**istanza EC2** è una macchina virtuale che noleggi in AWS. Ha un SO, accesso alla rete e risorse di calcolo.
- I tipi di istanza sono organizzati per caso d'uso: uso generale, ottimizzato per il calcolo, ottimizzato per la memoria, ottimizzato per lo storage, calcolo accelerato. Scegli la famiglia e la dimensione giuste per il tuo carico di lavoro.
- Un'**AMI** (Amazon Machine Image) è il template per il SO e la configurazione iniziale dell'istanza. Le AMI personalizzate abilitano distribuzioni coerenti e ripetibili.
- Le **key pair** sono il modo sicuro per accedere alle istanze EC2. Niente password.
- Le istanze EC2 non sono permanenti per impostazione predefinita. Le istanze terminate perdono i loro dati. Archivia i dati importanti in servizi di storage separati.
- "Elastic" significa che puoi scalare il calcolo su e giù — sia verticalmente (istanze più grandi) che orizzontalmente (più istanze).

## Consigli per l'Esame

*Dominio SAA-C03 3 — Task 3.2 (soluzioni di calcolo ad alte prestazioni)*

- **Responsabilità Condivisa per EC2**: Sei responsabile del patching del SO. AWS mantiene l'hardware fisico e l'hypervisor. Questa è una distinzione frequentemente testata.
- **Le famiglie di istanza sono importanti per le domande a scenario.** Se uno scenario menziona requisiti di memoria elevata (cache in-memory, SAP HANA), la risposta coinvolge probabilmente un'istanza ottimizzata per la memoria. Se menziona elaborazione batch o HPC, ottimizzata per il calcolo.
- **Fermare ≠ Terminare.** Fermare un'istanza la preserva (puoi riavviarla). Terminarla la elimina. Gli scenari d'esame testano se conosci questa distinzione.
- **L'IP pubblico cambia al riavvio.** Se la tua applicazione ha bisogno di un indirizzo IP stabile, usa un **Elastic IP** — un IP pubblico statico che rimane associato al tuo account. Questo costa denaro se ne allochi uno e non lo usi.
- **I modelli di pricing On-Demand, Reserved e Spot** sono testati pesantemente nel Dominio 4. Li copriamo nel Capitolo 27. Per ora, sappi che On-Demand significa pagare al secondo senza impegno.

## Esercizi

**Esercizio 1 — Ricorda**

Con parole tue: cos'è un'istanza EC2? Cos'è un'AMI? Qual è la relazione tra loro?

*(Suggerimento: Pensa all'analogia della ricetta — qual è la ricetta e qual è il pasto?)*

**Esercizio 2 — Pratica per l'Esame**

*Scenario*: Un'azienda sta distribuendo un'applicazione web ad alto traffico. L'applicazione gestisce ricerche nel catalogo prodotti con logica di filtraggio complessa che è intensiva per la CPU. Il team si aspetta picchi di traffico significativi durante gli eventi di saldi. Vogliono assicurarsi di scegliere il tipo di istanza EC2 giusto e di essere preparati per i picchi di traffico.

Quale combinazione di scelte soddisfa MEGLIO i loro requisiti?

A) Istanze ottimizzate per la memoria con un numero fisso per garantire prestazioni costanti  
B) Istanze ottimizzate per il calcolo con Auto Scaling per gestire i picchi di traffico  
C) Istanze di uso generale con una singola istanza di grandi dimensioni  
D) Istanze ottimizzate per lo storage perché il catalogo prodotti richiede accesso rapido al disco

**Suggerimento 1**: Il carico di lavoro è descritto come "intensivo per la CPU." Quale famiglia di istanza è ottimizzata per la CPU?

**Suggerimento 2**: Lo scenario menziona "picchi di traffico durante gli eventi di saldi." Un numero fisso di istanze non gestirà in modo efficiente il traffico variabile. Quale funzionalità AWS gestisce questo?

**Suggerimento 3**: Le istanze ottimizzate per il calcolo gestiscono il lavoro CPU-intensivo. Auto Scaling aggiunge e rimuove istanze in base alla domanda. Insieme rispondono a entrambi i requisiti.

**Risposta**: B

**Spiegazione**: Le istanze ottimizzate per il calcolo (come la famiglia `c`) forniscono più CPU per dollaro per i carichi di lavoro CPU-intensivi. Auto Scaling regola automaticamente il numero di istanze in base al carico — aggiungendo istanze durante gli eventi di saldi, rimuovendole quando il traffico torna alla normalità. Questa combinazione ottimizza sia le prestazioni che i costi.

**Perché non A?** Le istanze ottimizzate per la memoria sono progettate per carichi di lavoro che necessitano di grandi quantità di RAM (database, cache in-memory). Questo è un carico di lavoro CPU-bound. E un numero fisso di istanze significa o over-provisioning (spreco) o under-provisioning (guasto).

**Perché non C?** Le istanze di uso generale scambiano un po' di efficienza CPU per bilanciamento. Per un carico di lavoro noto CPU-intensivo, l'ottimizzazione per il calcolo è più appropriata. E una singola istanza grande è un singolo punto di guasto.

**Perché non D?** Il collo di bottiglia è la CPU, non l'I/O del disco. Le istanze ottimizzate per lo storage sono progettate per carichi di lavoro che necessitano di throughput molto elevato verso lo storage locale.

*Dominio SAA-C03 3 — Task 3.2*

**Esercizio 3 — Sfida Architetturale** *(Facoltativo)*

Nimbus attualmente gestisce una singola istanza EC2 `t3.micro` per l'intera applicazione. Il team deve decidere: aggiornare a un'istanza più grande (`t3.2xlarge`) o aggiungere più istanze `t3.micro` dietro un load balancer?

Analizza i compromessi. Quali sono i vantaggi di ogni approccio? Quali domande faresti per decidere? (Suggerimento: pensa ai singoli punti di guasto, ai costi, alla complessità della distribuzione, e a cosa succede durante la manutenzione.)

*(Non esiste una risposta unica corretta. Si tratta di ragionare sullo scaling verticale vs. orizzontale.)*

## Scena Post-Crediti

Leo trascorse il pomeriggio a ridimensionare il server. Passò da un `t3.micro` a un `t3.large`. La CPU scese al 30%. Le pagine si caricarono in meno di un secondo.

Tom guardò la fattura AWS aggiornarsi in tempo reale. La nuova istanza costava quattro volte di più all'ora. Prese nota.

Maya stava guardando qualcos'altro sul suo schermo.

"Leo," disse. "Mentre ridimensionavi l'istanza, il sito web è stato giù per dodici minuti."

Leo alzò lo sguardo.

"Avevamo una coda di duecento ordini non evasi."

Guardò lo schermo. Poi il soffitto. Poi di nuovo lo schermo.

"Abbiamo bisogno di qualcosa per le nostre immagini," disse, cambiando leggermente argomento. "In questo momento, le foto dei menu caricate vengono salvate direttamente sul server. Se ridimensioniamo o riavviamo l'istanza, le perdiamo?"

Priya conosceva già la risposta.

Nel prossimo capitolo: dove vivono i file quando non c'è nessun disco rigido a cui puntare.
