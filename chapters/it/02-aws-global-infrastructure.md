# Capitolo 2: Dove nel Mondo è il Tuo Server?

Alzati. Cammina verso una finestra se ce n'è una nelle vicinanze.

Guarda fuori. Qualunque cosa tu veda — edifici, alberi, un parcheggio, il cortile di qualcuno — nessuno di questi è dove vivono i tuoi dati. I tuoi dati vivono da qualche altra parte interamente. Probabilmente da qualche parte dove non sei mai stato.

Non è un problema. Ma capire *dove* fa scattare un sorprendente numero di cose.

Nel capitolo precedente, Leo ha creato un account AWS alle 23 e ha avviato un server da qualche parte. Da qualche parte è la parola operativa — non era sicuro di quale parte del mondo avesse scelto, perché non l'aveva scelta intenzionalmente.

La mattina dopo, Maya notò che il server era a Singapore.

"Perché Singapore?" chiese.

"Era il valore predefinito," disse Leo.

Tom alzò lo sguardo dal suo caffè. "Quanto costa far girare un server a Singapore quando tutti i nostri clienti sono sulla Costa Ovest?"

Leo non aveva una risposta.

Priya ne aveva già una: "È anche più lento. Ogni richiesta deve viaggiare a metà del mondo."

Questo capitolo riguarda la correzione di quella decisione — e la comprensione del perché è importante.

**Il Problema con "Da Qualche Parte"**

Quando usi AWS, non stai usando un singolo data center. Stai usando una rete globale di data center. AWS ha infrastrutture in decine di paesi.

Questo è una funzionalità, non solo un fatto. Ma significa che devi fare una scelta: *dove* vuoi che giri la tua infrastruttura?

La scelta è importante per tre motivi:

**Prestazioni.** Più vicini sono i tuoi server ai tuoi utenti, più veloce è la risposta. La fisica non è negoziabile. I dati viaggiano a circa due terzi della velocità della luce attraverso cavi in fibra ottica. Una richiesta da Seattle a Singapore impiega circa 300 millisecondi solo in transito — prima che la tua applicazione faccia qualsiasi cosa.

**Conformità.** Alcuni settori hanno leggi su dove i dati possono essere archiviati. I dati sanitari statunitensi potrebbero dover rimanere all'interno del paese. I dati finanziari potrebbero dover rimanere all'interno di una regione specifica. Scegliere la Regione sbagliata può creare problemi legali.

**Resilienza ai disastri.** Se una posizione subisce un'interruzione di corrente, un terremoto o un guasto alla rete, vuoi che il tuo sistema sopravviva. Distribuire l'infrastruttura su più posizioni è il modo in cui ci si protegge dai disastri locali.

**Come AWS Organizza la Sua Infrastruttura**

AWS suddivide la sua infrastruttura globale in tre concetti annidati. Pensali come bambole russe, dalla più grande alla più piccola.

**Regioni → Zone di Disponibilità → Edge Location**

Apriamone ognuna.

**Regioni: Le Grandi Scatole**

Una **Regione** è un'area geografica dove AWS ha un cluster di data center. Ogni Regione prende il nome dalla sua posizione: `us-west-2` è l'Oregon, `us-east-1` è la Virginia del Nord, `eu-west-1` è l'Irlanda, `ap-southeast-1` è Singapore — dove si nascondeva il server di Leo.

Ci sono oltre 30 Regioni in tutto il mondo, e AWS ne aggiunge regolarmente.

Ogni Regione è completamente indipendente. I dati in `us-west-2` rimangono in `us-west-2` a meno che non li sposti esplicitamente. Questo è fondamentale per la conformità e per la resilienza — una grande interruzione in una Regione non influisce automaticamente sulle altre.

"Quindi dovremmo scegliere `us-west-2` per Nimbus?" chiese Tom.

Sì. Per un'azienda statunitense che serve clienti della Costa Ovest, sì. Latenza inferiore e i tuoi utenti ottengono risposte più veloci.

"Quanto è più costoso di Singapore?" aggiunse Tom.

I prezzi variano per Regione — di solito di pochi punti percentuali. Il vantaggio di prestazioni e conformità della Regione giusta vale la piccola differenza di prezzo.

**Zone di Disponibilità: La Vera Ridondanza**

Ecco dove diventa interessante.

Ogni Regione non è un singolo data center. È un cluster di più data center fisicamente separati chiamati **Zone di Disponibilità** (o AZ).

L'Oregon (`us-west-2`) ha quattro Zone di Disponibilità: `us-west-2a`, `us-west-2b`, `us-west-2c`, `us-west-2d`. Questi sono edifici reali, separati da distanze significative — abbastanza lontani da far sì che un incendio, un'alluvione o un'interruzione di corrente in uno non influenzi gli altri, ma abbastanza vicini da far sì che la rete tra loro sia estremamente veloce (latenza a singola cifra in millisecondi).

Questa è l'architettura che rende AWS affidabile a un livello che nessun singolo data center può eguagliare.

Priya si sporse in avanti. "Quindi se facciamo girare la nostra applicazione su due Zone di Disponibilità e una va giù—"

"L'altra continua a girare," concluse Maya.

"Esattamente."

Leo, che aveva ascoltato in silenzio: "Ho distribuito tutto in una sola AZ."

"Sì," disse Priya. "L'abbiamo notato."

Il concetto di distribuire la tua applicazione su più AZ — chiamato **distribuzione Multi-AZ** — è uno dei pattern di resilienza più importanti in AWS. Approfondiremo nel Capitolo 18. Per ora, capisci che le AZ esistono specificamente per rendere questo possibile.

**Edge Location: Velocità, Ovunque**

Le AZ risolvono la resilienza. Non risolvono il problema di servire contenuti velocemente agli utenti in città lontane dalla tua Regione principale.

Ecco le **Edge Location**.

Le Edge Location sono piccoli punti di infrastruttura leggeri distribuiti in oltre 400 città nel mondo. Non sono data center completi — non possono far girare la tua applicazione. Quello che *possono* fare è mettere in cache i contenuti vicino ai tuoi utenti.

Immagina un'immagine di menu archiviata su un server in Virginia. Ogni volta che qualcuno a Tokyo vuole vederla, la richiesta viaggia attraverso il Pacifico e ritorna. Con le Edge Location, AWS può archiviare una copia di quel file a Tokyo e servirla localmente — millisecondi invece di centinaia di millisecondi.

Questa è la spina dorsale di CloudFront, la rete di distribuzione dei contenuti di AWS. Approfondiamo CloudFront nel Capitolo 13. Per ora: le Edge Location riguardano la velocità per i contenuti statici.

**Scegliere una Regione: La Checklist dell'Ingegnere Senior**

Quando Nimbus si espande per servire utenti in Messico e Colombia (cosa che accade nel Capitolo 12), la decisione sulla Regione non è arbitraria. Ecco il ragionamento:

**1. Dove sono i tuoi utenti?**

Inizia da qui. Scegli la Regione più vicina alla maggioranza dei tuoi utenti. La latenza è l'impatto più diretto e misurabile della scelta della Regione.

**2. Ci sono requisiti di conformità?**

I carichi di lavoro sanitari, finanziari e governativi spesso hanno regole rigorose sulla residenza dei dati. Conosci il tuo ambiente normativo prima di scegliere.

**3. Quali servizi ti servono?**

Non tutti i servizi AWS sono disponibili in ogni Regione. I nuovi servizi vengono lanciati prima in `us-east-1`. Se hai bisogno di un servizio specifico, verifica che la tua Regione target lo supporti.

**4. Qual è il prezzo?**

Le Regioni variano nel prezzo. `us-east-1` (Virginia del Nord) tende a essere la più economica per la sua scala e anzianità. Il Sud America è leggermente più costoso. Controlla la pagina dei prezzi AWS prima di finalizzare.

**5. Hai bisogno del multi-Regione?**

Per la maggior parte delle applicazioni, più AZ all'interno di una Regione sono sufficienti per la resilienza. Per le applicazioni critiche dove anche un'interruzione regionale è inaccettabile, progetti per il multi-Regione — ma questo è un impegno architetturale significativo. Non farlo speculativamente.

**La Limitazione di cui Nessuno Parla**

Le Regioni sono potenti, ma creano una tensione importante.

Operare in più Regioni è genuinamente difficile.

La replica dei dati tra Regioni ha latenza. Mantenere due Regioni sincronizzate — in modo che una transazione nella Regione A sia immediatamente visibile nella Regione B — è uno dei problemi più difficili nei sistemi distribuiti. AWS fornisce strumenti per farlo, ma costa denaro e aggiunge complessità operativa.

La maggior parte delle applicazioni dovrebbe iniziare con una Regione, più AZ, ed espandersi al multi-Regione solo quando hanno un requisito chiaro: mandati normativi, SLA contrattuali che richiedono un tempo di inattività regionale quasi nullo, o una base utenti genuinamente distribuita su tutti i continenti.

L'architettura multi-Regione prematura è uno degli errori più comuni e costosi che fanno gli ingegneri junior quando iniziano a sentirsi sicuri.

Tom annuì. "Quindi non facciamo multi-Regione solo perché possiamo."

"Non finché non ne abbiamo bisogno," disse Maya. "E sapremo quando ne avremo bisogno."

"Come lo sapremo?" chiese Leo.

"Quando il tuo documento di architettura ha un requisito che dice 'deve sopravvivere a un'interruzione regionale'," disse Priya. "Fino ad allora: multi-AZ."

## Punti di Forza e Limitazioni

**Usa il design multi-Regione e multi-AZ quando**: la tua applicazione ha utenti in più aree geografiche e la latenza è importante; il tuo SLA richiede una disponibilità del 99,99% o superiore; i requisiti normativi impongono la residenza dei dati in regioni specifiche; hai bisogno del disaster recovery con un RTO inferiore a un'ora.

**I compromessi sono reali**: La replica dei dati tra regioni aggiunge costi — il trasferimento di dati cross-region è una delle voci più sottovalutate su una fattura AWS. Aggiunge anche complessità operativa: ogni scrittura che deve essere coerente tra regioni aggiunge latenza. La maggior parte dei guasti che influenzano le applicazioni reali non sono catastrofi cross-region — sono problemi all'interno della regione come un security group mal configurato o un deployment fallito. Investi nel multi-AZ prima del multi-region. Aggiungi il multi-region quando il caso aziendale è chiaro.

## Riepilogo

- AWS organizza la sua infrastruttura globale in **Regioni**, **Zone di Disponibilità** e **Edge Location**.
- Una **Regione** è un cluster geografico di data center. Ogni Regione è isolata — i dati rimangono nella Regione a meno che non li sposti esplicitamente.
- Le **Zone di Disponibilità** sono data center fisicamente separati all'interno di una Regione, collegati da reti a bassa latenza. Distribuire su più AZ è il modo standard per sopravvivere ai guasti locali.
- Le **Edge Location** mettono in cache i contenuti vicino agli utenti nel mondo. Alimentano CloudFront.
- Scegli la tua Regione in base alla posizione degli utenti, ai requisiti di conformità, alla disponibilità dei servizi e al prezzo — in quest'ordine.
- Il multi-AZ è la baseline di resilienza standard. Il multi-Regione è per carichi di lavoro critici con requisiti specifici e documentati — non un punto di partenza predefinito.

## Consigli per l'Esame

*Dominio SAA-C03 1 — Task 1.1 / Dominio 2 — Task 2.2*

- **Le Regioni sono isolate per impostazione predefinita.** I dati non si replicano tra Regioni a meno che non lo configuri tu. Questo è importante per la sovranità dei dati e gli scenari di conformità.
- **Le AZ sono l'unità di resilienza per la maggior parte delle domande.** Quando l'esame chiede come sopravvivere a un guasto del data center, la risposta coinvolge più AZ all'interno di una Regione.
- **Il multi-Regione è per la resilienza alle interruzioni regionali.** Se lo scenario dice "deve rimanere operativo anche se un'intera Regione AWS si guasta," la risposta coinvolge l'architettura multi-Regione.
- **Le Edge Location ≠ AZ.** Le Edge Location mettono in cache i contenuti — non possono far girare il tuo server applicativo. Non confonderle con i data center.
- L'esame verifica frequentemente la relazione tra conformità e selezione della Regione. Se uno scenario menziona requisiti di residenza dei dati, la scelta della Regione fa parte della risposta.

## Esercizi

**Esercizio 1 — Ricorda**

Con parole tue: qual è la differenza tra una Regione e una Zona di Disponibilità? Perché quella distinzione è importante quando si progetta un'applicazione web resiliente?

*(Suggerimento: Pensa ai due diversi tipi di guasto contro cui ciascuna protegge.)*

**Esercizio 2 — Pratica per l'Esame**

*Scenario*: Un'azienda sanitaria statunitense deve archiviare tutti i dati dei pazienti all'interno di una singola Regione AWS per rispettare le policy interne di residenza dei dati. Stanno progettando una nuova applicazione cloud sulla Costa Ovest e vogliono massimizzare la resilienza senza spostare i dati in un'altra Regione.

Quale configurazione soddisfa MEGLIO i loro requisiti?

A) Distribuire in `us-east-1` e usare le Edge Location di CloudFront in Oregon per servire i contenuti più velocemente  
B) Distribuire in `us-west-2` (Oregon) su più Zone di Disponibilità  
C) Distribuire in più Regioni incluse `us-west-2` e `us-east-1` con replica cross-Regione dei dati  
D) Distribuire in `us-west-2` in una singola Zona di Disponibilità per minimizzare i costi

**Suggerimento 1**: La policy significa che i dati devono rimanere in una singola Regione. Quali opzioni spostano i dati in un'altra Regione?

**Suggerimento 2**: Tra le opzioni che mantengono i dati in `us-west-2`, quale fornisce la massima resilienza?

**Suggerimento 3**: Più AZ all'interno di una singola Regione forniscono resilienza senza attraversare i confini di Regione.

**Risposta**: B

**Spiegazione**: `us-west-2` mantiene tutti i dati in una singola Regione, soddisfacendo il requisito della policy. Distribuire su più AZ all'interno di quella Regione protegge dai guasti del data center senza spostare i dati in un'altra Regione. Questo è il giusto equilibrio tra conformità e resilienza.

**Perché non A?** CloudFront mette in cache i contenuti nelle Edge Location globalmente — i dati lascerebbero fisicamente `us-west-2`, violando la policy di residenza.

**Perché non C?** Replicare verso `us-east-1` sposta i dati dei pazienti sulla Costa Est, violando direttamente il requisito di una singola Regione.

**Perché non D?** Una singola AZ non ha resilienza. Se quella AZ subisce un'interruzione, l'applicazione si guasta completamente.

*Dominio SAA-C03 1 — Task 1.1 (infrastruttura globale, sovranità dei dati)*

**Esercizio 3 — Sfida Architetturale** *(Facoltativo)*

Nimbus si sta espandendo per servire clienti in Messico e Colombia. Attualmente tutto gira in `us-west-2`. Il team sta discutendo: dovrebbero aggiungere una seconda Regione `us-east-1`, o rimanere single-Region con più AZ?

Quali domande faresti prima di decidere? Quali sono i costi e rischi principali dell'aggiunta di una seconda Regione? Qual è il costo principale del *non* aggiungerne una?

*(Non esiste una risposta unica corretta. Pratica il ragionamento sui compromessi multi-Regione.)*

## Scena Post-Crediti

Leo risolse il problema di Singapore. Nimbus si spostò in `us-west-2`. La latenza scese. La domanda di follow-up di Tom — "ha cambiato la nostra bolletta?" — fu risposta con un numero leggermente più alto, che accettò con riluttanza visibile.

Durò due giorni prima del problema successivo.

Leo arrivò allo standup con l'espressione che Maya aveva imparato a riconoscere: lo sguardo di qualcuno che aveva fatto qualcosa che non poteva disfare.

"Quindi," disse con cautela. "Ho configurato il server. E avevo bisogno di un modo per accedere. Quindi ho creato un nome utente."

"E?" chiese Priya.

"'Admin'."

Silenzio.

"E la password?"

Un silenzio più lungo.

"'Admin123'."

Priya si alzò.

Nel prossimo capitolo: come Nimbus controlla chi può toccare cosa — e cosa succede quando sbagliano.
