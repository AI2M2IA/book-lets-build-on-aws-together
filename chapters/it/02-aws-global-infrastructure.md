# Capitolo 2: Dove nel Mondo è il Tuo Server?

Alzati. Cammina verso una finestra se ce n'è una nelle vicinanze.

Guarda fuori. Qualunque cosa tu veda — edifici, alberi, un parcheggio, il cortile di qualcuno — niente di tutto ciò è dove vivono i tuoi dati. I tuoi dati vivono da qualche altra parte interamente. Probabilmente da qualche parte dove non sei mai stato.

Non è un problema. Ma capire *dove* fa scattare un sorprendente numero di cose.

Dopo la sessione alla lavagna, la decisione era presa: Nimbus avrebbe usato AWS. Il cloud era la risposta. Ma "il cloud" si era rivelato essere una cosa specifica in una posizione specifica — e Leo aveva scelto quella posizione senza volerlo.

La mattina dopo, Maya notò che il server era a Singapore.

"Perché Singapore?" chiese.

"Era il valore predefinito," disse Leo.

Tom alzò lo sguardo dal caffè. "Quanto costa far girare un server a Singapore quando tutti i nostri clienti sono sulla Costa Ovest?"

Leo non aveva una risposta.

Priya aveva già una preoccupazione diversa. "E chi sa per quali giurisdizioni passano quei dati?"

Questo capitolo riguarda la correzione di quella decisione — e la comprensione del perché è importante.

**Il Problema con "Da Qualche Parte"**

Quando usi AWS, non stai usando un singolo data center. Stai usando una rete globale di data center. AWS ha infrastrutture in decine di paesi.

Questo è una funzionalità, non solo un fatto. Ma significa che devi fare una scelta: *dove* vuoi che giri la tua infrastruttura?

La scelta è importante per tre motivi:

**Prestazioni.** Più vicini sono i tuoi server ai tuoi utenti, più veloce è la risposta. La fisica non è negoziabile. I dati viaggiano a circa due terzi della velocità della luce attraverso cavi in fibra ottica. Un viaggio di andata e ritorno da Seattle a Singapore impiega circa 170 millisecondi solo in transito — prima che la tua applicazione faccia qualsiasi cosa. La stessa richiesta da Seattle all'Oregon (`us-west-2`) impiega circa 20 millisecondi. La differenza non è un errore di arrotondamento. Per un'app di ordinazione di ristoranti dove i clienti si aspettano che le pagine si sentano immediate — e dove una singola pagina innesca diversi andata e ritorno — 170 ms di latenza di base per ogni andata e ritorno è la differenza tra un prodotto veloce e uno lento.

Tom tirò fuori il telefono, aprì l'app Nimbus e caricò la pagina di un ristorante. La cronometrò con un'app cronometro.

"Quasi tre secondi," disse.

Leo controllò la ripartizione della latenza nei log del server. Solo il viaggio di andata e ritorno verso Singapore — indipendentemente dalle query al database — stava aggiungendo circa 170 millisecondi per richiesta, e l'app faceva più andata e ritorno per pagina.

"E se spostiamo il server in Oregon?" chiese Tom.

"Venti millisecondi," disse Leo. "Forse meno."

"Quanto costa al mese?"

La differenza di prezzo era di qualche punto percentuale. Non zero, ma non la variabile principale. Spostarono il server in `us-west-2` quel pomeriggio.

"Ho già fatto il deploy dell'agente di monitoraggio sull'istanza Singapore," disse Leo, quasi tra sé. "Oh." Fece una pausa. "Lo configuro in Oregon invece."

**Conformità.** Alcuni settori hanno leggi su dove i dati possono essere archiviati. I dati sanitari statunitensi potrebbero dover rimanere all'interno del paese. I dati finanziari potrebbero dover rimanere all'interno di una region specifica. Scegliere la Region sbagliata può creare problemi legali.

Priya aveva ricercato questo prima che qualcuno glielo chiedesse.

"GDPR," disse, alzando gli occhi dagli appunti al prossimo standup mattutino. "Se Nimbus servisse mai clienti nell'Unione Europea — anche solo uno — i dati personali su di loro potrebbero dover rimanere all'interno dell'UE o in un paese con protezioni equivalenti. Non è opzionale. È la legge."

"Siamo un'app di ordinazione di ristoranti," disse Leo. "In California."

"Per ora," disse Priya. "Abbiamo pensato a cosa succede se ci espandiamo in Europa tra diciotto mesi e scopriamo che abbiamo archiviato i dati dei clienti europei in Oregon per un anno e mezzo?"

Una pausa.

"Lo sistemeremmo allora," disse Leo.

"Non puoi sistemare violazioni retroattive della residenza dei dati," disse Priya. "La violazione è già avvenuta."

Non stava esagerando. Le sanzioni GDPR arrivano fino al 4% del fatturato annuo globale. Le violazioni HIPAA nella sanità statunitense possono superare i 2 milioni di dollari per categoria di violazione all'anno. Non sono ipotesi — sono il motivo per cui le grandi decisioni cloud aziendali iniziano con la mappatura della conformità, non con la configurazione dell'infrastruttura.

Per Nimbus, l'esposizione normativa immediata era bassa: clienti statunitensi, nessun dato sanitario, nessun servizio finanziario. Ma scegliere una Region per un'azienda che intende crescere significa scegliere con la crescita in mente.

**Resilienza ai disastri.** Se una posizione subisce un'interruzione di corrente, un terremoto o un guasto alla rete, vuoi che il tuo sistema sopravviva. Distribuire l'infrastruttura su più posizioni è il modo in cui ci si protegge dai disastri locali.

**Come AWS Organizza la Sua Infrastruttura**

AWS suddivide la sua infrastruttura globale in tre concetti annidati. Pensali come bambole russe, dalla più grande alla più piccola: una grande bambola che si apre per rivelare una media, che si apre per rivelare una piccola. Ogni livello annidato nel successivo.

La bambola più esterna è quella che AWS chiama **Region**. Dentro una Region si trova un cluster di **Availability Zone**. E sparse ovunque nel mondo, indipendenti da entrambe, ci sono le **Edge Location**.

Apriamone ognuna.

**Region: Le Grandi Scatole**

Una **Region** è un'area geografica dove AWS ha un cluster di data center. Ogni Region prende il nome dalla sua posizione: `us-west-2` è l'Oregon, `us-east-1` è la Virginia del Nord, `eu-west-1` è l'Irlanda, `ap-southeast-1` è Singapore — dove si nascondeva il server di Leo.

Ci sono quasi 40 Region in tutto il mondo, e AWS ne aggiunge regolarmente. La lista continua a crescere mentre AWS si espande: ci sono Region in Nord America, Sud America, Europa, Medio Oriente, Asia Pacifico e Africa. Ogni nuova Region viene tipicamente annunciata mesi prima dell'apertura, include almeno tre Availability Zone al lancio, e richiede qualche anno prima che tutti i servizi AWS siano disponibili.

Ogni Region è completamente indipendente. I dati in `us-west-2` rimangono in `us-west-2` a meno che non li sposti esplicitamente. Questo è fondamentale per la conformità e per la resilienza — una grande interruzione in una Region non influisce automaticamente sulle altre. Un evento che interrompe la rete elettrica in Virginia del Nord non influisce sull'Oregon. Un disastro naturale in Irlanda non influisce su Singapore. Le Region sono genuinamente isolate l'una dall'altra a livello di infrastruttura fisica.

L'indipendenza è così completa che se una Region sta vivendo una grande interruzione, persino la console di gestione AWS potrebbe caricarsi lentamente — perché la console stessa gira su infrastruttura AWS. Vale la pena saperlo: durante un vero incidente AWS, potresti trovare difficile accedere agli strumenti di monitoraggio di cui hai bisogno esattamente quando ne hai più bisogno. Questo è parte del motivo per cui i team esperti monitorano i propri servizi indipendentemente dalla console AWS.

"Quindi dovremmo scegliere `us-west-2` per Nimbus?" chiese Tom.

Sì. Per un'azienda statunitense che serve clienti della Costa Ovest, sì. Latenza inferiore e i tuoi utenti ottengono risposte più veloci.

"Quanto è più costoso di Singapore?" aggiunse Tom.

I prezzi variano per Region — di solito di qualche punto percentuale. Il vantaggio di prestazioni e conformità della Region giusta vale la piccola differenza di prezzo.

**Il Dibattito sulla Scelta della Region che Nimbus Quasi Sbagliò**

Prima che il team si stabilisse su `us-west-2`, ci fu una breve discussione su se `us-east-1` (Virginia del Nord) avesse più senso. È la Region più vecchia, la più grande, quella in cui AWS lancia per prima i nuovi servizi. È anche la Region più economica sulla maggior parte delle pagine dei prezzi. A Tom piaceva.

"Ma i nostri utenti sono in California, Oregon e Washington," disse Maya. "Perché gestiremmo i nostri server dall'altra parte del paese?"

"Più economico," disse Tom. "E più servizi disponibili."

"Aspetta — ma *perché* lo faremmo in quel modo?" disse Maya. "I nostri utenti sono sulla Costa Ovest. I nostri server dovrebbero essere sulla Costa Ovest. La differenza di prezzo è cosa, sei percento? Sette? Spendiamo di più sulla latenza extra in clienti persi di quanto risparmieremo nelle fatture di compute."

Aveva ragione. La Region giusta per un carico di lavoro è la Region più vicina agli utenti che contano di più — a meno che la conformità, la disponibilità del servizio o il differenziale di costo non giustifichino il compromesso. Per Nimbus, nessuno di questi lo faceva.

Questa è una decisione che sembra piccola e non lo è. I team che scelgono `us-east-1` perché "è il valore predefinito" e poi servono utenti della Costa Ovest dalla Costa Est stanno lasciando prestazioni reali sul tavolo. La console AWS per impostazione predefinita è `us-east-1` per ragioni storiche. Non è una raccomandazione.

**Availability Zone: La Vera Ridondanza**

Ecco dove diventa interessante.

Ogni Region non è un singolo data center. È un cluster di più data center fisicamente separati chiamati **Availability Zone** (o AZ).

L'Oregon (`us-west-2`) ha quattro Availability Zone: `us-west-2a`, `us-west-2b`, `us-west-2c`, `us-west-2d`. Questi sono edifici reali, separati da distanze significative — abbastanza lontani da far sì che un incendio, un'alluvione o un'interruzione di corrente in uno non influenzi gli altri, ma abbastanza vicini da far sì che la rete tra loro sia estremamente veloce (latenza a singola cifra in millisecondi).

Quanto lontano è una "distanza significativa"? AWS non pubblica le coordinate esatte, ma ricercatori indipendenti stimano che le AZ all'interno di una Region siano tipicamente separate di decine di miglia — abbastanza lontane da trovarsi su reti elettriche diverse e percorsi in fibra diversi, non così lontane che la velocità della luce diventi un fattore limitante per la replica sincrona.

Questa separazione è deliberata e importante. Se due AZ condividessero la stessa sottostazione elettrica, un guasto alla sottostazione le abbatterebbe entrambe simultaneamente — eliminando la ridondanza. La separazione fisica garantisce che i guasti di modalità comune (il tipo che colpisce un'intera area geografica) siano eventi genuinamente rari piuttosto che rischi prevedibili.

Questa è l'architettura che rende AWS affidabile a un livello che nessun singolo data center può eguagliare.

Priya si sporse in avanti. "Quindi se facciamo girare la nostra applicazione su due Availability Zone e una va giù—"

"L'altra continua a girare," concluse Maya.

"Esattamente."

Leo, che aveva ascoltato in silenzio: "Ho distribuito tutto in una sola AZ."

"Sì," disse Priya. "L'abbiamo notato."

Il concetto di distribuire la tua applicazione su più AZ — chiamato **deployment Multi-AZ** — è uno dei pattern di resilienza più importanti in AWS. Lo approfondiamo nel Capitolo 18. Per ora, capisci che le AZ esistono specificamente per rendere questo possibile.

Una sfumatura vale la pena conoscere: i nomi delle AZ (`us-west-2a`, `us-west-2b`, ecc.) non sono coerenti tra account AWS. Quella che appare come `us-west-2a` nel tuo account potrebbe essere un data center fisico diverso da quello che appare come `us-west-2a` nell'account di un collega. AWS randomizza la mappatura per evitare che tutti i clienti facciano il deploy nella stessa AZ fisica quando usano il valore predefinito "a". Se devi coordinare in quale AZ fisica ti trovi con un altro account (per comunicazione inter-account a bassa latenza, per esempio), AWS fornisce gli AZ ID — identificatori stabili che mappano alla stessa posizione fisica tra account. Le AZ con nome (`2a`, `2b`) sono relative all'account. Gli AZ ID (`usw2-az1`, `usw2-az2`) sono fisici. L'esame testa questa distinzione occasionalmente.

**Come Appare Davvero un Guasto a una AZ**

Questo non è astratto. Lascia che ti illustri una timeline reale.

Sono le 14:47 di un martedì. Un guasto elettrico in uno dei trasformatori che fornisce corrente a `us-west-2b` causa un'interruzione in quel data center. L'evento non è previsto.

Se Nimbus gira interamente in `us-west-2b`:

- 14:47: l'istanza EC2 perde corrente. Il server del database perde corrente.
- 14:47: le richieste in arrivo all'app Nimbus iniziano a fallire con timeout di connessione.
- 14:47: gli alert di monitoraggio di Tom si attivano.
- 14:50: Leo inizia il processo di ripristino. Lancia una nuova istanza EC2 in `us-west-2a`.
- 15:05: il database torna online da un ripristino di snapshot.
- 15:12: l'applicazione viene riconfigurata per puntare al nuovo endpoint del database.
- 15:20: Nimbus sta di nuovo servendo traffico.

Questo fa 33 minuti di downtime. Durante il servizio cena del venerdì, 33 minuti potrebbero costare migliaia in ordini persi e il tipo di danno alla reputazione che non appare nel rapporto dell'incidente.

Se Nimbus gira tra `us-west-2a` e `us-west-2b` con un deployment Multi-AZ adeguato:

- 14:47: l'istanza EC2 in `us-west-2b` perde corrente.
- 14:47: l'Application Load Balancer rileva l'istanza non in buona salute tramite health check.
- 14:47: l'ALB smette di instradare il traffico all'istanza guasta, automaticamente.
- 14:47: il traffico continua a fluire verso l'istanza in `us-west-2a`.
- 14:48: l'Auto Scaling Group lancia un'istanza sostitutiva.
- 14:55: la sostituzione supera gli health check e rientra nel parco.

Downtime: zero. Impatto sui clienti: quasi zero. Il monitoraggio di Tom si attiva, ma l'azione di Leo è "osserva e conferma che il ripristino è completato", non "ricostruisci tutto manualmente".

Questa è la differenza tra Multi-AZ e singola AZ. Il confine AZ è dove il design di ridondanza di AWS diventa la resilienza della tua applicazione.

**La Matematica dell'Affidabilità Multi-AZ**

AWS progetta ogni AZ in modo che sia indipendente — non solo fisicamente, ma con alimentazione, raffreddamento e networking separati. La probabilità che due AZ nella stessa Region falliscano simultaneamente è progettata per essere estremamente bassa.

Se una singola AZ ha disponibilità del 99,9% (circa 8,7 ore di downtime all'anno), allora un'architettura a due AZ che tratta i guasti come eventi indipendenti ha circa 99,9999% di disponibilità per lo stesso modo di guasto — circa 31 secondi di downtime all'anno dai guasti AZ.

In pratica, il fattore limitante per la maggior parte delle applicazioni non è la disponibilità delle AZ. È il codice dell'applicazione, il processo di deployment e il database. Ma la matematica illustra perché Multi-AZ è la baseline standard: il costo di girare su due AZ è modesto; il miglioramento della disponibilità è grande.

**Edge Location: Velocità, Ovunque**

Le AZ risolvono la resilienza. Non risolvono il problema di servire contenuti velocemente agli utenti in città lontane dalla tua Region principale.

Ecco le **Edge Location**.

Le Edge Location sono piccoli punti di infrastruttura leggeri — oltre 750 punti di presenza distribuiti in oltre 100 città nel mondo. Non sono data center completi — non possono far girare la tua applicazione. Quello che *possono* fare è mettere in cache i contenuti vicino ai tuoi utenti.

Immagina un'immagine di menu archiviata su un server in Virginia. Ogni volta che qualcuno a Tokyo vuole vederla, la richiesta viaggia attraverso il Pacifico e ritorna. Con le Edge Location, AWS può archiviare una copia di quel file a Tokyo e servirla localmente — millisecondi invece di centinaia di millisecondi.

Questa è la spina dorsale di CloudFront, la rete di distribuzione dei contenuti di AWS. Approfondiamo CloudFront nel Capitolo 13. Per ora: le Edge Location riguardano la velocità per i contenuti statici.

Potresti chiederti: se le Edge Location mettono in cache i contenuti, li archiviano anche permanentemente? No. Le Edge Location tengono copie temporanee dei contenuti per servirli più velocemente — l'originale vive sempre nella tua Region. Se la cache scade o il contenuto cambia, l'Edge Location recupera una copia aggiornata dall'origine.

La rete Edge Location è separata dalla struttura di Region e AZ. Quando pensi a dove gira la tua applicazione, pensi a Region e AZ. Quando pensi a come i contenuti raggiungono i tuoi utenti *rapidamente*, pensi a Edge Location e CloudFront. Risolvono problemi diversi e operano a livelli diversi.

AWS ha anche un concetto correlato chiamato **Regional Edge Cache** — nodi di caching più grandi che si trovano tra la tua Region e le Edge Location. Se un'Edge Location in una città non ha una copia in cache di un file, recupera dalla Regional Edge Cache piuttosto che tornare tutta la strada fino alla tua Region. Questo riduce il carico sulla tua origine e migliora le percentuali di cache hit per i contenuti meno popolari. Non configuri le Regional Edge Cache direttamente — fanno parte dell'infrastruttura CloudFront che opera automaticamente.

Il risultato pratico per Nimbus: quando il team aggiunge CloudFront nel Capitolo 13, le immagini del menu che prima viaggiavano dall'Oregon al browser di un cliente ad ogni richiesta verranno invece servite dalla Edge Location più vicina — Dallas per i clienti texani, Atlanta per quelli georgiani, Chicago per quelli dell'Illinois. L'utente a Chicago ottiene la sua immagine del menu da un server a 500 chilometri di distanza invece che da 3.200 chilometri. La differenza è misurabile e significativa.

**Un Caveat sulle Copie in Cache**

C'è un dettaglio sulle Edge Location che vale la pena segnalare ora, anche se la storia completa appartiene al Capitolo 13: una copia in cache è una *copia*, e le copie possono diventare obsolete. Se l'originale cambia nella tua Region, l'Edge Location potrebbe continuare a servire la vecchia versione per un po'. Quanto a lungo, e cosa puoi fare al riguardo, sono esattamente il tipo di controlli che una CDN ti offre — ed esattamente ciò con cui il team si scontrerà quando Nimbus distribuirà davvero CloudFront. Per ora, porta avanti solo questo: i contenuti possono vivere vicino all'utente, e "vicino" a volte significa "leggermente non aggiornato."

**Scegliere una Region: La Checklist dell'Ingegnere Senior**

Se Nimbus un giorno si espande per servire utenti in Messico e Colombia — uno scenario che praticheremo negli esercizi di questo capitolo — la decisione sulla Region non è arbitraria. Ecco il ragionamento:

**1. Dove sono i tuoi utenti?**

Inizia da qui. Scegli la Region più vicina alla maggioranza dei tuoi utenti. La latenza è l'impatto più diretto e misurabile della scelta della Region.

La distanza fisica tra un utente e un server conta in un modo facile da sottovalutare. Un viaggio di andata e ritorno di 170 ms verso Singapore versus 20 ms verso l'Oregon non è una metrica di prestazione astratta — è la differenza tra una pagina che si sente immediata e una che si sente lenta. Su un dispositivo mobile con latenza radio aggiuntiva, la penalità di Singapore si amplifica ulteriormente. Per un utente a San Jose, `us-west-2` (Oregon) è la Region giusta prima ancora di considerare qualsiasi altro fattore.

**2. Ci sono requisiti di conformità?**

I carichi di lavoro sanitari, finanziari e governativi spesso hanno regole rigorose sulla residenza dei dati. Conosci il tuo ambiente normativo prima di scegliere. Il GDPR richiede che i dati personali dei residenti UE siano archiviati in giurisdizioni con protezione dei dati adeguata — nell'UE stessa o in un paese con una decisione di adeguatezza. HIPAA richiede misure di protezione documentate per i dati sanitari statunitensi. Queste non sono considerazioni opzionali da rivisitare in seguito.

In pratica: parla con il tuo team legale prima di scegliere una Region per qualsiasi carico di lavoro regolamentato. AWS mantiene documentazione di conformità estesa per ogni Region, incluse certificazioni come SOC 2, ISO 27001, PCI DSS e idoneità HIPAA. Ma le certificazioni ti dicono cosa ha fatto AWS; il tuo team legale ti dice se è sufficiente per il tuo specifico contesto normativo.

**3. Quali servizi ti servono?**

Non tutti i servizi AWS sono disponibili in ogni Region. I nuovi servizi vengono lanciati prima in `us-east-1`. Se hai bisogno di un servizio specifico, verifica che la tua Region target lo supporti.

Questo è meno preoccupante per i servizi in questo libro — tutti i servizi principali sono ampiamente disponibili — ma conta per i servizi più nuovi, l'hardware specializzato (alcuni tipi di istanze GPU esistono solo in certe Region) e AWS GovCloud (una Region separata progettata per i carichi di lavoro del governo statunitense con requisiti normativi specifici).

**4. Qual è il prezzo?**

Le Region variano nel prezzo. `us-east-1` (Virginia del Nord) tende a essere la più economica per la sua scala e anzianità. Il Sud America è leggermente più costoso. Controlla la pagina dei prezzi AWS prima di finalizzare.

Il differenziale di prezzo è di solito piccolo — qualche percento fino al dieci percento tra le Region più popolari. Raramente è il fattore decisivo. Ma per un carico di lavoro sensibile ai costi che gestisce migliaia di istanze, anche una differenza del 5% si accumula nel tempo. Tom controllava il numero e lo considerava, come Tom controllava tutti i numeri e li considerava.

**5. Hai bisogno del multi-Region?**

Per la maggior parte delle applicazioni, più AZ all'interno di una Region sono sufficienti per la resilienza. Per le applicazioni critiche dove anche un'interruzione regionale è inaccettabile, si progetta per il multi-Region — ma questo è un impegno architetturale significativo. Non farlo speculativamente.

"Qual è la regola per quando aggiungiamo una seconda Region?" chiese Leo.

"Quando abbiamo un requisito documentato che dice 'deve rimanere operativo se un'intera Region AWS non è disponibile'," disse Priya. "Non 'sarebbe bello'. Un requisito specifico, con una giustificazione aziendale specifica, che abbiamo pesato rispetto alla complessità e al costo."

"Come appare nella pratica?"

"Un contratto con un cliente con un SLA che richiede uptime al 99,99%. Un mandato normativo per la ridondanza geografica. Uno scenario di perdita di una Region che possiamo effettivamente quantificare in termini di entrate. Non solo 'e se us-west-2 va giù'."

Leo guardò l'architettura attuale di Nimbus. Erano ancora su una sola AZ.

"Prima Multi-AZ," disse.

"Prima Multi-AZ," confermò Priya.

**La Limitazione di cui Nessuno Parla**

Le Region sono potenti, ma creano una tensione importante.

Operare in più Region è genuinamente difficile.

La replica dei dati tra Region ha latenza. Mantenere due Region sincronizzate — in modo che una transazione nella Region A sia immediatamente visibile nella Region B — è uno dei problemi più difficili nei sistemi distribuiti. AWS fornisce strumenti per farlo, ma costa denaro e aggiunge complessità operativa.

La maggior parte delle applicazioni dovrebbe iniziare con una Region, più AZ, ed espandersi al multi-Region solo quando ha un requisito chiaro: mandati normativi, SLA contrattuali che richiedono un downtime regionale quasi nullo, o una base utenti genuinamente distribuita su tutti i continenti.

Replicare i dati tra region aggiunge costi — il trasferimento dati cross-region è una delle voci più sottovalutate su una fattura AWS. Aggiunge anche complessità operativa: ogni scrittura che deve essere coerente tra region aggiunge latenza.

La maggior parte dei guasti che colpiscono le applicazioni reali non sono catastrofi cross-region. Sono problemi all'interno della region come un security group mal configurato o un deployment fallito. Lo scenario drammatico "l'intera region va giù" fa notizia esattamente perché è raro. Investi in Multi-AZ prima del multi-region. Aggiungi il multi-region quando il caso aziendale è chiaro.

Per dare numeri specifici: AWS ha avuto un piccolo numero di eventi significativi a singola region nella sua storia. Le interruzioni regionali complete sono genuinamente rare. Gli eventi a livello AZ — brevi interruzioni che colpiscono un data center all'interno di una region — sono meno rari e sono esattamente ciò che il deployment Multi-AZ è progettato per assorbire. La frequenza degli eventi AZ rispetto agli eventi regionali è di circa un ordine di grandezza superiore. Dedicare sforzi architetturali al modo di guasto più comune prima è la scelta razionale.

L'architettura multi-Region prematura è uno degli errori più comuni e costosi che fanno gli ingegneri junior quando iniziano a sentirsi sicuri.

Tom annuì. "Quindi non facciamo multi-Region solo perché possiamo."

"Non finché non ne abbiamo bisogno," disse Maya. "E sapremo quando ne avremo bisogno."

"Come lo sapremo?" chiese Leo.

"Quando il tuo documento di architecture review ha un requisito che dice 'deve sopravvivere a un'interruzione regionale'," disse Priya. "Abbiamo pensato a cosa succede se un'intera AZ va giù prima ancora che abbiamo configurato Multi-AZ? Dovremmo sistemare quello prima. Fino ad allora: multi-AZ."

Potresti chiederti: come verifichi che il tuo deployment Multi-AZ funzioni effettivamente prima di averne bisogno? Lo testi. AWS fornisce uno strumento chiamato **AWS Fault Injection Service (FIS)** — precedentemente Fault Injection Simulator — che può simulare guasti alle AZ, terminazione di istanze e altre condizioni di guasto sulla tua architettura in esecuzione — così puoi osservare come il tuo sistema si comporta sotto condizioni di guasto in modo controllato, piuttosto che scoprire il comportamento durante un incidente reale. Testare la tua architettura di resilienza è importante quanto costruirla. Priya inserì "test di fault injection" nel calendario di architecture review trimestrale immediatamente dopo averlo letto.

## Quando AWS Viene da Te: Outposts e Wavelength

Le Region e le Availability Zone coprono il mondo — ma non ogni problema si risolve spostando i dati su AWS. Alcuni carichi di lavoro devono restare on-premises: sistemi di produzione in fabbrica che hanno bisogno di latenza inferiore al millisecondo, applicazioni sanitarie con requisiti di residenza dei dati, sistemi punto-vendita retail in negozi senza connessione internet affidabile. Per questi, AWS estende la sua infrastruttura alla posizione del cliente.

"Aspetta — e se lavorassimo eventualmente con un sistema ospedaliero?" chiese Priya. "Il loro software di monitoraggio dei pazienti letteralmente non può tollerare un andata e ritorno al cloud. E potrebbe non essere legalmente consentito lasciare l'edificio."

Maya aprì la documentazione AWS. Due servizi continuavano ad apparire.

**AWS Outposts**

Un rack di hardware AWS completamente gestito installato nel tuo data center o struttura di co-location. Outposts esegue la stessa infrastruttura, gli stessi servizi, le stesse API e gli stessi strumenti AWS del cloud AWS — EC2, EBS, RDS, EKS, S3 su Outposts — ma fisicamente nel tuo edificio.

Casi d'uso: carichi di lavoro manifatturieri sensibili alla latenza, requisiti di residenza dei dati dove i dati devono rimanere fisicamente in una posizione specifica, applicazioni che hanno bisogno delle API AWS ma non possono tollerare gap di connettività al cloud pubblico.

Punto chiave: Outposts è ancora gestito da AWS. AWS lo installa, lo aggiorna e lo monitora. Tu sei proprietario dello spazio rack e dell'alimentazione. Le API e la tooling sono identici al cloud pubblico — gli stessi template CloudFormation, le stesse policy IAM, gli stessi comandi CLI. La distinzione nell'esame è la posizione fisica, non il modello operativo.

"Quindi è AWS, ma nell'edificio del nostro cliente," disse Leo.

"Esattamente," disse Maya. "Stesse API. Codice postale diverso."

**AWS Wavelength**

Infrastruttura AWS distribuita all'interno delle reti 5G dei provider di telecomunicazioni. Le Wavelength Zone si trovano al bordo delle reti 5G, fisicamente vicine agli utenti mobili, consentendo latenza a singola cifra in millisecondi per le applicazioni mobili.

Casi d'uso: gaming in tempo reale, AR/VR, telemetria dei veicoli autonomi, elaborazione video live al bordo 5G.

"Quello non è per un ospedale," disse Tom. "Quello è per qualcuno che costruisce la prossima generazione di giochi mobili multiplayer."

"O telemetria delle auto a guida autonoma," disse Priya. "Qualsiasi cosa dove un dispositivo mobile deve parlare con un server e 50 millisecondi sono troppo lenti."

**La differenza:** Outposts porta AWS nel tuo data center — il tuo edificio, il tuo rack, la tua alimentazione. Wavelength porta AWS al bordo della rete telco — fisicamente co-locato con l'infrastruttura radio 5G, vicino agli utenti mobili che non toccano mai la tua rete privata.

**AWS Local Zone**

C'è un terzo fratello in questa famiglia — e nell'esame, è il più frequentemente testato dei tre. Le **Local Zone** sono infrastrutture AWS distribuite nelle grandi aree metropolitane che non hanno una Region completa — Los Angeles, Houston, Miami, Lagos e molte altre. Una Local Zone è un'estensione di una Region madre: esegui EC2, EBS e un sottoinsieme di altri servizi *nella metropoli stessa*, ottenendo latenza a singola cifra in millisecondi per gli utenti in quella città, mentre tutto il resto (e tutta la gestione) rimane nella Region madre.

Il pattern da memorizzare — tre fratelli di "edge compute", tre trigger:

- "Latenza a singola cifra in millisecondi per gli utenti finali **in una città/area metropolitana specifica**" → **Local Zone**
- "Latenza ultra-bassa per **dispositivi mobili 5G**" → **Wavelength**
- "Servizi AWS che girano **nel nostro data center** / i dati devono rimanere on-premises" → **Outposts**

Nessuno dei tre è la risposta per una tipica applicazione web. Tutti e tre appaiono nell'esame SAA-C03 come trappole di pattern-matching: la frase trigger conta.

## Punti di Forza e Limitazioni

**Usa il design multi-region e multi-AZ quando**: la tua applicazione ha utenti in più aree geografiche e la latenza è importante; il tuo SLA richiede una disponibilità del 99,99% o superiore; i requisiti normativi impongono la residenza dei dati in region specifiche; hai bisogno del disaster recovery con un RTO inferiore a un'ora.

**I compromessi sono reali**: Operare in più Region ti dà ridondanza contro le interruzioni regionali — ma a costo e complessità significativi.

Ricorda l'avvertimento sui costi di prima in questo capitolo: ogni byte che si muove tra region costa denaro. In un setup multi-region active-active dove le scritture devono essere coerenti, stai pagando quel costo costantemente.

Anche la complessità operativa scala. Fare il debug di un incidente in una region è difficile. Fare il debug di un incidente distribuito e cross-region — dove la stessa richiesta ha toccato infrastrutture su due continenti — è un tipo diverso di difficoltà.

**La progressione giusta per la maggior parte delle applicazioni**: Inizia con una singola Region e più AZ. Questo ti dà resilienza contro i guasti che si verificano davvero — interruzioni a livello AZ, guasti hardware, eventi di corrente — a una frazione della complessità di un'architettura multi-region. Aggiungi il multi-region quando un requisito specifico e documentato lo rende necessario. Non prima.

Il pattern comune per i team che saltano al multi-region troppo presto: la complessità della gestione di due region introduce i propri modi di guasto — bug di sincronizzazione dei dati, scenari split-brain, deployment inconsistenti. La stessa architettura di resilienza progettata per prevenire i guasti a volte introduce nuove categorie di guasto che non sarebbero esistite in un design più semplice.

Priya aveva un documento che chiamava "il budget di complessità". L'idea: ogni decisione architetturale che aggiunge complessità operativa ha un costo, e l'organizzazione ha una capacità finita di gestire quella complessità. Spendere il budget di complessità in un'architettura multi-region prima di aver padroneggiato l'affidabilità single-region è un investimento povero. La complessità dovrebbe andare verso i modi di guasto che si affrontano davvero, non verso quelli che fanno buone storie di disaster recovery.

"Abbiamo una region, una AZ, e un processo di deployment che rende Leo nervoso ogni volta che lo esegue," disse Priya. "Il passo successivo giusto è Multi-AZ, non multi-region."

Tom scrisse "budget di complessità" nel suo taccuino. Avrebbe usato quella frase regolarmente per i due anni successivi.

## Riepilogo

L'incidente di Singapore di Leo si rivelò una lezione utile — non perché causò danni duraturi, ma perché costrinse il team a capire qualcosa che di solito viene saltato: dove gira la tua infrastruttura non è una decisione cosmetica. La fisica non è negoziabile. Centosettanta millisecondi di latenza di base per ogni andata e ritorno è la differenza tra un prodotto veloce e uno lento, e le regole di conformità su dove vivono i dati non si preoccupano di quanto velocemente ti sei mosso.

- AWS organizza la sua infrastruttura globale in **Region**, **Availability Zone** e **Edge Location**.
- Una **Region** è un cluster geografico di data center. Ogni Region è isolata — i dati rimangono nella Region a meno che non li sposti esplicitamente.
- Le **Availability Zone** sono data center fisicamente separati all'interno di una Region, collegati da reti a bassa latenza. Distribuire su più AZ è il modo standard per sopravvivere ai guasti locali.
- Scegli la tua Region in base alla posizione degli utenti, ai requisiti di conformità, alla disponibilità dei servizi e al prezzo — in quest'ordine.
- Il Multi-AZ è la baseline di resilienza standard. Il Multi-Region è per i carichi di lavoro critici con requisiti specifici e documentati — non un punto di partenza predefinito.

## Suggerimenti per l'Esame

*Dominio SAA-C03 1 — Task 1.1 / Dominio 2 — Task 2.2*

- **Le Region sono isolate per impostazione predefinita.** I dati non si replicano tra Region a meno che non lo configuri tu. Questo è importante per la sovranità dei dati e gli scenari di conformità.
- **Le AZ sono l'unità di resilienza per la maggior parte delle domande.** Quando l'esame chiede come sopravvivere a un guasto del data center, la risposta coinvolge più AZ all'interno di una Region.
- **Il Multi-Region è per la resilienza alle interruzioni regionali.** Se lo scenario dice "deve rimanere operativo anche se un'intera Region AWS si guasta," la risposta coinvolge l'architettura multi-Region.
- **Le Edge Location non sono AZ.** Le Edge Location mettono in cache i contenuti — non possono far girare il tuo server applicativo. Non confonderle con i data center.
- L'esame verifica frequentemente la relazione tra conformità e selezione della Region. Se uno scenario menziona requisiti di residenza dei dati, la scelta della Region fa parte della risposta.
- **Scenari GDPR e residenza dei dati** nell'esame puntano tipicamente a mantenere i dati all'interno di una Region specifica e a garantire che la replica cross-region sia disabilitata o controllata.
- **Outposts vs Wavelength vs Local Zone:** Outposts = rack AWS nel tuo data center (on-premises, residenza dei dati, latenza locale). Wavelength = AWS al bordo della rete 5G (utenti mobili, latenza ultra-bassa). Local Zone = compute AWS in un'area metropolitana senza una Region completa. Trigger dell'esame: "eseguire AWS nella propria struttura" → Outposts. "Latenza ultra-bassa per utenti mobili 5G" → Wavelength. "Latenza a singola cifra in millisecondi per gli utenti in una città specifica" → Local Zone.

## Esercizi

**Esercizio 1 — Ricordo**

Con parole tue: qual è la differenza tra una Region e una Availability Zone? Perché quella distinzione è importante quando si progetta un'applicazione web resiliente?

*(Suggerimento: Pensa alle bambole russe annidate — quale bambola contiene quale, e contro quale tipo di guasto protegge ogni livello.)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: Un'azienda sanitaria statunitense deve archiviare tutti i dati dei pazienti all'interno di una singola Region AWS per rispettare le policy interne di residenza dei dati. Stanno progettando una nuova applicazione cloud sulla Costa Ovest e vogliono massimizzare la resilienza senza spostare i dati in un'altra Region.

Quale configurazione soddisfa MEGLIO i loro requisiti?

A) Distribuire in `us-east-1` e usare le Edge Location di CloudFront in Oregon per servire i contenuti più velocemente
B) Distribuire in `us-west-2` in una singola Availability Zone per minimizzare i costi
C) Distribuire in più Region incluse `us-west-2` e `us-east-1` con replica cross-Region dei dati
D) Distribuire in `us-west-2` (Oregon) su più Availability Zone

**Suggerimento 1**: La policy significa che i dati devono rimanere in una singola Region. Quali opzioni spostano i dati in un'altra Region?

**Suggerimento 2**: Tra le opzioni che mantengono i dati in `us-west-2`, quale fornisce la massima resilienza?

**Suggerimento 3**: Più AZ all'interno di una singola Region forniscono resilienza senza attraversare i confini di Region.

**Risposta**: D

**Spiegazione**: `us-west-2` mantiene tutti i dati in una singola Region, soddisfacendo il requisito della policy. Distribuire su più AZ all'interno di quella Region protegge dai guasti del data center senza spostare i dati in un'altra Region. Questo è il giusto equilibrio tra conformità e resilienza.

**Perché non A?** L'opzione A distribuisce in `us-east-1`, lontano dagli utenti della Costa Ovest — e CloudFront metterebbe in cache i contenuti adiacenti ai dati dei pazienti nelle Edge Location fuori dalla Region scelta, violando la policy di residenza.

**Perché non B?** Una singola AZ non ha resilienza. Se quella AZ subisce un'interruzione, l'applicazione si guasta completamente.

**Perché non C?** Replicare verso `us-east-1` sposta i dati dei pazienti sulla Costa Est, violando direttamente il requisito di una singola Region.

*Dominio SAA-C03 1 — Task 1.1 (infrastruttura globale, sovranità dei dati)*

**Esercizio 3 — Sfida di Architettura** *(Opzionale)*

Nimbus si sta espandendo per servire clienti in Messico e Colombia. Attualmente tutto gira in `us-west-2`. Il team sta discutendo: dovrebbero aggiungere una seconda Region `us-east-1`, o rimanere single-Region con più AZ?

Quali domande faresti prima di decidere? Quali sono i costi e rischi principali dell'aggiunta di una seconda Region? Qual è il costo principale del *non* aggiungerne una?

*(Non esiste una risposta unica corretta. Pratica il ragionamento sui compromessi multi-Region.)*

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
