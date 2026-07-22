# Capitolo 0: Prima di Iniziare

Maya era in piedi dietro al bancone del ristorante di famiglia un venerdì sera quando il pensiero la colpì.

Erano aperti da quattro anni. Il cibo era buono — la gente attraversava tutta la città per l'arepa. Ma ogni volta che qualcuno chiamava per fare un ordine, la linea era occupata. Ogni volta che qualcuno si presentava a ritirare del cibo che non aveva mai ordinato, era perché aveva chiamato e aveva rinunciato.

Si stavano perdendo ordini. I soldi uscivano dalla porta prima ancora di entrare.

E la parte peggiore era che nessuno riusciva a indicare un singolo fallimento drammatico.

Non era esploso nulla. Nulla si era bloccato. Non c'era nessun cattivo, nessun banner di interruzione del servizio, nessuno schermo rotto ovvio.

Era solo attrito. Piccolo, silenzioso, costoso attrito.

"Stiamo perdendo ordini ogni venerdì," disse Maya a nessuno in particolare. "Non perché il cibo sia cattivo. Perché nessuno riesce a raggiungerci. Abbiamo bisogno di un sito web."

Suo cugino Tom alzò lo sguardo dal foglio di calcolo che stava aggiornando a mano. Tom — un ex amministratore di sistemi che aveva scambiato le sale server per l'attività di famiglia — gestiva i "sistemi" del ristorante — una parola generosa per un Google Sheet condiviso e una lavagna — da due anni.

"Un sito web," ripeté. "E dove esattamente vive un sito web?"

Maya aprì la bocca. La chiuse.

Non ne aveva idea.

**Una Domanda che Sembra Semplice**

Dove vive un sito web?

Probabilmente non ci hai mai pensato. La maggior parte delle persone non lo fa. Digiti un indirizzo nel browser, appare una pagina, e da qualche parte tra questi due eventi accade la magia.

Finché non arriva il giorno in cui sei tu a pagare per la magia.

Ma non è magia. Sono computer.

Da qualche parte nel mondo, proprio ora, c'è un computer fisico — un server — che sta archiviando i file che compongono quel sito web. Quando chiedi al tuo browser la pagina, la tua richiesta viaggia attraverso internet, raggiunge quel computer, e il computer ti rimanda i file.

Tutto qui. Questo è un sito web.

Quindi la vera domanda è: il computer di *chi*?

Quella domanda portò Maya alla lavagna. E la lavagna portò a tutto il resto.

**Tre Opzioni, Un Problema**

Tornati nel ristorante, Maya e Tom abbozzarono le opzioni sulla lavagna.

**Opzione uno**: Comprare un computer, installarlo nel ristorante e gestire il sito web da lì. Questo si chiama operare "on-premises" — il tuo edificio, le tue macchine. Vedrai questo termine per tutto il libro.

Tom scrisse "bolletta elettrica" e "cosa succede se si rompe" accanto a questa opzione. Poi si fermò e iniziò a cercare davvero i prezzi sul telefono. Un server in grado di gestire un'applicazione web modesta costava tra gli ottocento e i duemila dollari anticipati. Aggiungi un gruppo di continuità UPS, uno switch gestito e un'appliance firewall, ed eri più vicino ai quattromila dollari prima di aver pagato una singola ora di funzionamento. Poi arrivavano la bolletta elettrica, i requisiti di raffreddamento e il fatto che dovevi sostituire l'hardware ogni tre-cinque anni.

"Quanto costa al mese se consideri tutto?" chiese Tom, più a se stesso che a Maya.

Fece i conti. Un server da $2,000 ammortizzato su quattro anni: circa $42 al mese. Il consumo di energia in funzione 24/7 a 300-500 watt: circa $25-$40 al mese. Una connessione internet di livello business in grado di gestire traffico reale: $100-$300 al mese. In più, ogni tre-cinque anni, dovevi rifare tutto da capo. L'hardware non dura per sempre.

"Quindi tra i $170 e i $400 al mese," disse Tom, "prima di pagare qualcuno per ripararlo quando si rompe. E si romperà."

"Cosa succede se si rompe alle 23 di un venerdì?" chiese Maya.

Tom sapeva come riparare un server — aveva passato anni a fare esattamente quello, in una vita precedente come amministratore di sistemi. Era proprio quello il problema. Sapeva esattamente cosa significasse essere l'unica persona in grado di riparare la macchina: le telefonate alle 2 di notte, i weekend persi dietro ai dischi guasti, la vacanza interrotta perché un alimentatore era morto. Maya non poteva farlo, e Tom non voleva essere il singolo punto di guasto del singolo punto di guasto. Il ristorante sarebbe rimasto al buio. Gli ordini si sarebbero fermati. E non c'era ridondanza — una macchina, nessun piano di riserva.

"E se cresciamo in fretta?" aggiunse Maya. "Compreremmo il server per il volume di oggi, e se tra sei mesi ci servisse il triplo della capacità? Dovremmo comprare altro hardware, aspettare la spedizione, configurarlo..."

Tom aggiunse "non può scalare," "costo di sostituzione" e "chi lo ripara alle 2 di notte" all'opzione uno. La colonna si stava allungando.

**Opzione due**: Pagare una società di hosting per gestire un piccolo server per loro. Economico, semplice. Funzionava per i blog personali nel 2008. Probabilmente non abbastanza flessibile per un'azienda in crescita.

"E se improvvisamente riceviamo mille ordini contemporaneamente?" chiese Maya.

Tom aggiunse "non può scalare" all'opzione due.

Aveva guardato alcuni piani di hosting condiviso mentre faceva ricerche. Otto dollari al mese, dodici dollari al mese. Ma ogni piano aveva limiti rigidi: spazio su disco, banda, connessioni simultanee. Un piano popolare vantava "banda illimitata" nel titolo e poi seppelliva la politica di throttling quattro paragrafi dentro i termini di servizio. Cento visitatori simultanei e il servizio degradava. Duecento e il sito andava giù.

"Quella non è illimitata," disse Tom. "È 'illimitata finché non conta.'"

Un server dedicato presso una società di hosting era più promettente — da $80 a $200 al mese per qualcosa di vero — ma il team avrebbe comunque dovuto configurarlo e manutenerlo da solo. E avrebbero comunque comprato un tetto fisso, senza alcuna risposta elastica alla domanda.

"Ogni giorno in cui siamo sotto capacità, sprechiamo soldi," disse Maya. "Ogni giorno in cui siamo sopra capacità, perdiamo clienti. Non c'è modo di essere esattamente giusti."

"A meno che il tetto non si muova con noi," disse Tom.

Non l'aveva intesa come una transizione, ma era quella giusta.

**Opzione tre**: Qualcos'altro. Qualcosa di cui avevano sentito parlare. Qualcosa chiamato "il cloud."

Tom disegnò una nuvola sulla lavagna. Una forma di nuvola letterale, come il disegno di un bambino.

"Non so davvero cosa significhi," ammise.

"Nemmeno io," disse Maya.

Quello fu l'inizio di tutto.

**Cos'è Davvero "Il Cloud"**

Chiariamolo subito, perché la parola "cloud" è uno dei termini più usati e meno spiegati in tecnologia.

Il cloud non è un posto magico dove i tuoi dati galleggiano.

Il cloud sono i computer di qualcun altro.

Tutto qui. Quando salvi una foto su iCloud o Google Drive, la tua foto è archiviata su un computer fisico di proprietà di Apple o Google, seduto in un edificio da qualche parte. Quando usi Netflix, il video che stai guardando viene inviato da server fisici in data center di tutto il mondo.

Il "cloud" significa semplicemente: computer a cui si accede tramite internet, che non devi possedere o manutenere tu stesso.

E Amazon — sì, la società che consegna i pacchi — ha costruito una delle più grandi raccolte di questi computer al mondo. La chiamano Amazon Web Services, o AWS.

**L'Analogia della Rete Elettrica**

Pensala come la rete elettrica.

Cento anni fa, se volevi gestire una fabbrica, costruivi la tua centrale elettrica. Assumevi ingegneri per farla funzionare. Pagavi per il combustibile, per la manutenzione, per le competenze necessarie a tenere le luci accese. Se il generatore si rompeva, la tua fabbrica si fermava. Se la domanda cresceva, dovevi costruire un generatore più grande — un processo costoso e lento che richiedeva di prevedere la domanda futura con anni di anticipo e di impegnare capitale prima di sapere se ne avevi bisogno.

Poi arrivò la rete elettrica, e il gioco cambiò completamente.

Ti collegavi alla rete e pagavi esattamente l'elettricità che consumavi. Niente centrale elettrica. Niente personale di manutenzione. Niente contratti per il combustibile. La capacità era lì quando ti serviva. Non la pagavi quando non ti serviva. Potevi avviare una piccola officina e crescere fino a una grande fabbrica senza fare una scommessa di capitale su una scala futura incerta.

Il cloud computing è la stessa idea applicata al calcolo. AWS ha costruito la centrale elettrica — anzi, migliaia di centrali in decine di paesi, gestite da team di ingegneri il cui intero scopo professionale è mantenere quelle macchine in funzione. Le aziende si collegano e pagano per quello che usano. L'infrastruttura è condivisa, manutenuta professionalmente e disponibile su richiesta. Smetti di preoccuparti del livello fisico e ti concentri su quello che stai davvero costruendo.

C'è una differenza rispetto all'analogia elettrica che vale la pena nominare: l'elettricità è una cosa sola. Il cloud computing arriva in molte varietà. Storage, calcolo, database, networking, machine learning, sicurezza — ogni tipo di risorsa ha i suoi prezzi, i suoi compromessi e i suoi casi d'uso appropriati. La rete elettrica consegna una cosa sola in modo uniforme. AWS consegna un catalogo di centinaia di servizi. Questo libro è la tua guida a quel catalogo, a partire dai servizi che contano di più.

**Perché Amazon?**

È una domanda legittima. Amazon è nata come libreria.

Ecco cosa è successo: Amazon è cresciuta così in fretta che aveva bisogno di un'enorme quantità di potenza di calcolo per gestire i propri sistemi. Hanno costruito data center. Hanno assunto ingegneri per gestirli. Sono diventati molto, molto bravi a gestire computer su larga scala.

Poi qualcuno in Amazon ha avuto un'idea: e se vendessimo l'accesso a tutta questa potenza di calcolo ad altre persone?

Nel 2006, Amazon Web Services è stata lanciata. Oggi, AWS gestisce una parte significativa di internet. Il sito web che usi per prenotare i voli, l'app che traccia la tua consegna, il servizio di streaming che hai guardato ieri sera — c'è una buona probabilità che almeno una parte di esso giri su AWS.

Non è un monopolio. Google Cloud e Microsoft Azure sono concorrenti seri. Ma AWS è stata la prima, è grande, ed è di questo che parla questo libro.

**Conosci il Team**

Maya non ha costruito Nimbus da sola.

Ha chiamato Tom per primo — ovviamente. Tom aveva i fogli di calcolo, i contatti con i fornitori e la tenacia necessaria per realizzare davvero un'idea.

Tom era il tipo di persona che leggeva i Termini di Servizio. Non perché avesse paura, ma perché credeva che capire quanto qualcosa costa davvero — in denaro, in rischio, in tempo — fosse l'unico modo per prendere una buona decisione. Le colonne della lavagna con le loro liste crescenti di obiezioni non erano pessimismo. Erano Tom che faceva quello che Tom faceva sempre: prezzare il mondo reale prima di impegnarsi in qualsiasi cosa. Chiedeva "quanto costa al mese?" nei momenti in cui tutti gli altri erano ancora entusiasti di quello che una cosa poteva fare. Faceva risparmiare soldi all'azienda, regolarmente, e occasionalmente preveniva catastrofi prima che potessero essere classificate come tali.

Tom conosceva uno sviluppatore. Leo. Ventiquattro anni, autodidatta, il tipo di persona che ha già costruito un prototipo prima che tu abbia finito di spiegare il problema. È arrivato al loro primo incontro con un laptop e un'app a metà.

"L'ho già distribuita — oh," disse, aprendo lo schermo. L'espressione sul suo viso rese chiaro che aveva trovato qualcosa di inaspettato. "Credo di averla distribuita da qualche parte."

Così era. Su un server che non capiva del tutto, in una regione che non aveva scelto intenzionalmente, con codice che si sarebbe sicuramente rotto sotto carico.

Lo amarono immediatamente.

Leo si muoveva veloce. A volte troppo veloce. Aveva il dono dello sviluppatore di costruire cose che funzionavano e il punto cieco dello sviluppatore per le cose che funzionavano *in quel momento* ma stavano silenziosamente accumulando debito tecnico. Trattava i messaggi di errore come alcune persone trattano le etichette di avvertenza — informativi ma non necessariamente vincolanti. La sua risposta predefinita a un potenziale problema era "andrà tutto bene," e aveva ragione abbastanza spesso che ci volle un po' prima che il team imparasse a preoccuparsi quando lo diceva con quel particolare tono di disinvolta certezza che significava che non aveva davvero controllato.

Priya arrivò dopo — segnalata da un amico comune. Laurea in informatica, specializzazione in sicurezza, il tipo di persona che legge i post-mortem di famosi fallimenti tecnologici nelle sere del fine settimana. Aveva una domanda al suo primo incontro.

"Qualcuno ha pensato a cosa succede se qualcuno tenta di entrare?"

Silenzio.

"Benvenuta nel team," disse Maya.

La versione dell'entusiasmo di Priya era un modello delle minacce dettagliato. Le piaceva genuinamente il processo di revisione dell'architettura. Era lei che leggeva i white paper sulla sicurezza di AWS ed evidenziava le sezioni rilevanti prima che qualcuno glielo chiedesse. Era anche, come il team avrebbe scoperto, affidabilmente nel giusto sulle cose a cui non avevano ancora pensato. Faceva domande nel modo in cui un buon ingegnere strutturale controlla i muri portanti — non perché si aspettasse che cedessero, ma perché l'unico modo per sapere che sono solidi è guardare con attenzione e documentare quello che si trova.

"Abbiamo pensato a cosa succede se..." era il modo in cui Priya iniziava la maggior parte dei suoi contributi. Col tempo, il team arrivò a capire che questa domanda, più di ogni altra, era il modo in cui i disastri venivano prevenuti prima che potessero diventare incidenti.

Insieme, i quattro fecero qualcosa che funzionava. Maya vedeva il prodotto. Tom sorvegliava i costi. Leo lo costruiva. Priya lo metteva in sicurezza. Il libro che stai leggendo è il resoconto di quello che hanno imparato.

**Cos'è Questo Libro**

Questa è la storia di Nimbus.

Nimbus è iniziato come un sistema di ordinazione per ristoranti ed è diventato qualcosa di molto più grande. Man mano che cresceva, ha incontrato ogni problema che il software in crescita incontra: sistemi che non riuscivano a gestire il traffico, dati che andavano persi, server che cadevano nei momenti peggiori, costi che crescevano più velocemente delle entrate.

E ogni volta che incappavano in un problema, trovavano un servizio AWS progettato per risolvere esattamente quel tipo di problema.

Questo libro ti insegna AWS seguendo quel percorso.

Imparerai non solo *cosa* fa ogni servizio, ma *perché* esiste, *quando* usarlo, e — altrettanto importante — *quando non usarlo*. Ogni strumento ha dei compromessi. Ogni decisione ha dei costi. Questo è ciò che gli ingegneri senior capiscono e che quelli junior stanno ancora imparando.

Quando avrai finito questo libro, sarai pronto per sostenere l'esame AWS Solutions Architect Associate (SAA-C03). Ancora di più: sarai pronto per entrare in una vera conversazione tecnica e reggere il confronto.

Questa è la promessa.

Ecco come si presenta in pratica, sezione per sezione.

**Capitoli 1–5: Le Fondamenta**. Quando arriverai alla fine del Capitolo 5, capirai cos'è davvero il cloud computing e perché esiste, come controllare chi ha accesso al tuo account AWS e perché l'account root terrorizza gli ingegneri della sicurezza, dove vivono i tuoi server e perché la geografia conta, cosa sono le istanze EC2 e come dimensionarle, e come archiviare file nel cloud senza legarli a una singola macchina. Questi capitoli coprono i concetti che ogni architetto AWS dà per scontati — ma che nessuno spiega abbastanza chiaramente la prima volta.

**Capitoli 6–10: Dati e Scala**. Questa sezione riguarda cosa succede quando la tua applicazione cresce. Vedrai Nimbus sbattere contro il muro della scalabilità — un server, troppi utenti, nessun margine di crescita — e li guarderai risolverlo con load balancer, auto scaling, database gestiti e caching. Alla fine di questa sezione capirai come i veri sistemi di produzione gestiscono il carico variabile e perché il database è quasi sempre il primo collo di bottiglia.

**Capitoli 11–17: Networking e Sicurezza**. I concetti qui sembrano astratti finché non ne hai bisogno. VPC, security group, DNS, gestione dei certificati, gestione delle chiavi. Alla fine di questa sezione capirai come il traffico si muove attraverso un'applicazione cloud e come impedirgli di muoversi verso posti dove non dovrebbe.

**Capitoli 18–22: Resilienza e Architettura Moderna**. Design multi-regione, sistemi disaccoppiati, calcolo serverless, container. Questi capitoli coprono i pattern architetturali che separano i sistemi di produzione dai progetti giocattolo. Finirai questa sezione capendo perché gli architetti esperti pensano al fallimento prima di pensare alle funzionalità.

**Capitoli 23–26: Prestazioni e Dati**. Livelli di storage, policy di lifecycle, Aurora e read replica, prestazioni di rete, e i servizi di analytics che trasformano i dati grezzi in risposte. Alla fine di questa sezione capirai come rendere un sistema più veloce — e come sapere quale parte è davvero lenta.

**Capitoli 27–30: Ottimizzazione dei Costi**. I prezzi di AWS sono complicati, ma seguono dei principi. Alla fine di questa sezione capirai come leggere una fattura AWS, come prevedere i costi prima di impegnarti in un'architettura, e come trovare le ottimizzazioni che contano rispetto a quelle che non contano.

**Capitoli 31–34: Pensare da Architetto**. La sezione finale fa un passo indietro dai servizi specifici e affronta il processo di ragionamento. Quando aggiungi complessità? Quando la mantieni semplice? Come difendi una decisione quando esistono alternative ragionevoli? Questa è la parte più difficile e più preziosa.


**Alcune Cose Prima di Iniziare**

**Questo libro presuppone che tu non sappia quasi nulla di cloud computing.** Se hai sentito parlare di AWS ma non lo hai mai usato, sei nel posto giusto. Se non hai mai sentito parlare di AWS, sei anche tu nel posto giusto.

**Questo libro non presuppone che tu sia uno sviluppatore.** Maya non lo è. Tom a malapena. Non hai bisogno di scrivere codice per capire l'architettura. Hai bisogno di capire problemi e soluzioni.

**Questo libro a volte sarà sbagliato di proposito.** Il team farà errori. Sceglierà il servizio sbagliato. Salterà un passaggio di sicurezza di cui si pentirà. Provisionerà troppo e troppo poco. È così che impareranno, ed è così che imparerai anche tu.

**I suggerimenti per l'esame sono reali.** Il SAA-C03 è un vero esame. Le domande basate su scenari alla fine di ogni capitolo sono progettate per sembrare l'esame vero. Se riesci a rispondere, sei sulla buona strada.

E un'altra cosa.

Leggi questo libro con una matita, o un'app per appunti, o un elenco corrente di momenti "penso che la risposta sia...".

Fai una pausa prima che il team decida qualcosa. Prendi tu stesso la decisione. Poi continua a leggere e guarda se avresti fatto lo stesso compromesso.

Forse ti starai chiedendo: perché seguire una startup di ristorazione attraverso un libro per una certificazione AWS? La risposta è che i concetti astratti restano impressi quando hai già sentito il problema. Quando incontrerai ogni servizio AWS, Nimbus ne avrà avuto bisogno per prima.

**Come Leggere Questo Libro**

Ogni capitolo segue la stessa struttura. Vedrai il team imbattersi in un problema — qualcosa che si rompe, qualcosa di lento, qualcosa che non scala. Poi li guarderai capire cosa sta davvero succedendo. Poi appare il servizio AWS rilevante, nominato e spiegato. Poi c'è un approfondimento sui dettagli tecnici. Poi compromessi, esercizi e una scena che prepara il capitolo successivo.

Gli esercizi alla fine di ogni capitolo sono di tre tipi. Gli esercizi di richiamo verificano che tu abbia capito quello che hai appena letto. Le domande scenario SAA-C03 hanno l'aspetto e la sensazione di vere domande d'esame — leggi i suggerimenti prima di tirare a indovinare, perché il ragionamento conta quanto la risposta. Le sfide architetturali non hanno una singola risposta corretta; esistono per farti praticare il ragionamento, non per memorizzare il risultato.

Se stai leggendo principalmente per superare il SAA-C03, presta molta attenzione alle sezioni Suggerimenti per l'Esame. Segnalano cosa l'esame verifica davvero, comprese le trappole comuni e il vocabolario specifico che l'esame usa. Se stai leggendo per costruire una comprensione pratica, le Sfide Architetturali sono dove avviene l'apprendimento più profondo.

Entrambe le cose sono vere allo stesso tempo: questo è un libro di preparazione all'esame e una guida pratica. Ogni concetto che appare nella storia appare anche negli obiettivi dei domini d'esame. Il viaggio di Nimbus non è decorazione. È il curriculum.

Un'ultima nota sui personaggi. Maya chiede spesso "aspetta — ma *perché* dovremmo farlo in quel modo?". È intenzionale. Lei è la rappresentante del lettore. Ogni volta che lo chiede, è perché un vero studente si starebbe chiedendo la stessa cosa. Segui le sue domande con attenzione — segnano i momenti in cui il ragionamento conta di più.

Anche Tom chiede spesso "quanto costa al mese?". Anche questo è intenzionale. Il costo è un vincolo reale in ogni decisione architetturale. Una risposta che ignora il costo non è una risposta completa. Tom si assicura che il team non lo dimentichi mai.

**Una nota pratica sulla lettura attiva.** Questo non è un libro da leggere passivamente. I capitoli si costruiscono uno sull'altro — le decisioni architetturali prese nel Capitolo 4 creano problemi che il Capitolo 7 risolve, e i compromessi accettati nel Capitolo 7 creano costi che il Capitolo 27 risolve. Se salti avanti verso i servizi che ti interessano, mancherà il contesto e il ragionamento non avrà lo stesso effetto.

Leggi con qualcosa per scrivere. Quando il team sta per prendere una decisione, chiudi il libro per un momento e prendi prima la tua decisione. Quale servizio sceglieresti? Quale compromesso accetteresti? Poi continua a leggere. Confrontare il tuo istinto con la decisione del team — e capire dove divergono — è dove avviene il vero apprendimento.

Quando incontri una domanda scenario alla fine di un capitolo, leggi i suggerimenti solo dopo aver fatto una scelta. I suggerimenti sono progettati per correggere le risposte sbagliate più comuni, il che significa che sono più utili dopo che ti sei già impegnato in una direzione.

Se stai leggendo questo libro come parte della preparazione all'esame SAA-C03, stabilisci un ritmo che ti permetta di riflettere tra i capitoli. Uno o due capitoli al giorno sono più efficaci di una maratona nel weekend. I concetti si accumulano — l'esame verifica il ragionamento tra servizi, non solo la conoscenza dei singoli servizi, e quel ragionamento richiede tempo per consolidarsi.

E se qualcosa non è chiaro: il team farà la domanda prima che tu debba farla. Maya chiede "aspetta — ma *perché* dovremmo farlo in quel modo?" esattamente per questo motivo. Se ti trovi confuso da una decisione che il team prende, aspetta due paragrafi. Maya probabilmente sta per chiedere la stessa cosa.

Un'altra cosa prima di iniziare. Tom citerà prezzi per tutto il libro, perché Tom cita prezzi su qualsiasi cosa. Quei numeri — insieme ai limiti dei servizi e ai dettagli delle funzionalità — riflettono la documentazione AWS a metà 2026. AWS li cambia spesso, e quasi sempre al ribasso sul prezzo. Il ragionamento dietro ogni decisione reggerà; i dollari e i limiti esatti potrebbero non farlo. Quando sono i tuoi soldi, controlla la documentazione AWS attuale come farebbe Tom.

**E un avvertimento onesto**: il cloud non è sempre la risposta giusta. Per la maggior parte delle startup e delle aziende in fase di crescita lo è chiaramente — i calcoli che Tom ha fatto alla lavagna lo dimostrano — ma esistono situazioni reali, dai dati classificati ai carichi di lavoro massicci e stabili, in cui possedere il proprio hardware vince. Il team affronta quelle eccezioni nel prossimo capitolo, quando Tom insiste per sentire le argomentazioni contro il cloud prima di impegnarsi.

## Punti di Forza e Limitazioni

**Punti di forza di questo approccio**: Imparare attraverso una narrativa continua dà contesto ai concetti prima che ricevano un nome. Quando arrivi a IAM o RDS, hai già sentito il problema che risolvono — perché Nimbus lo ha sentito per primo. Questo rende la memorizzazione più alta e il ragionamento sui compromessi più naturale rispetto a memorizzare elenchi di funzionalità.

**Limitazioni di cui essere consapevoli**: Questo libro copre il curriculum AWS SAA-C03 Solutions Architect Associate. È un ambito sostanziale, ma non include ogni servizio AWS — e le architetture di produzione coinvolgono sempre servizi e vincoli specifici del tuo settore e della tua scala. La storia di Nimbus è fittizia; le startup reali prendono decisioni più disordinate per ragioni più disordinate. Usa questo libro per costruire il ragionamento, non per copiare l'architettura.

## Riepilogo

Nimbus è iniziato con un problema che qualsiasi piccola impresa potrebbe avere: clienti che non riuscivano a mettersi in contatto, e nessuno riusciva a indicare un singolo fallimento drammatico. Era solo attrito — piccolo, silenzioso e costoso. La sessione alla lavagna non produsse una soluzione. Produsse una domanda che valeva la pena fare: cos'è, esattamente, il cloud? La risposta si rivelò più importante di quanto chiunque si aspettasse.

- **Il cloud** è l'accesso on-demand a risorse di calcolo tramite internet — i computer di qualcun altro che non devi possedere o manutenere.
- Le tre opzioni di hosting: on-premises (il tuo hardware, i tuoi costi, le tue competenze richieste), hosting di piccoli server presso terzi (limitato, non scala), cloud (pay-as-you-go, scala con la domanda).
- I costi on-premises sono reali e spesso sottostimati: deprezzamento dell'hardware, energia, connettività internet e competenze di manutenzione si sommano in modo significativo prima ancora di scrivere una singola riga di codice applicativo.
- **AWS** è stata lanciata nel 2006 quando Amazon ha aperto la sua infrastruttura di data center ai clienti esterni. Rimane il più grande fornitore di cloud, seguito da Microsoft Azure e Google Cloud.
- Il cloud non è sempre la risposta giusta — ma per la maggior parte delle startup e delle aziende in fase di crescita con domanda imprevedibile e team piccoli, lo è chiaramente.

## Suggerimenti per l'Esame

*Dominio SAA-C03: Cross-domain — Fondamentali dei concetti cloud*

- **Il cloud nell'esame** significa calcolo on-demand e pay-as-you-go tramite internet. È un modello di consegna, non una tecnologia.
- **CapEx vs. OpEx**: L'infrastruttura on-premises è una spesa in conto capitale (CapEx — acquisto hardware anticipato). Il cloud è una spesa operativa (OpEx — tariffe di utilizzo ricorrenti). Gli scenari dell'esame che chiedono di "eliminare i costi anticipati" o "passare da CapEx a OpEx" puntano verso l'adozione del cloud.
- **Vantaggi del cloud**: Nessun hardware anticipato, scalabilità elastica, paghi solo per ciò che usi, nessuna gestione dell'infrastruttura fisica. Gli scenari con "traffico imprevedibile" o "piccolo team, nessuna competenza hardware" sono forti segnali per il cloud.
- **On-premises** significa far girare il proprio hardware nella propria struttura. L'esame confronta frequentemente le architetture on-premises con le alternative cloud.
- **AWS non è l'unico cloud** — Azure e GCP sono concorrenti reali — ma l'esame SAA-C03 è specifico per AWS. Non ti verrà chiesto di confrontare i provider.
- **Economie di scala**: AWS ottiene costi unitari più bassi perché aggrega la domanda di migliaia di clienti. Questo è uno dei vantaggi dichiarati del cloud rispetto all'on-premises nel framework d'esame AWS. Quando vedi "vantaggio del cloud" nell'esame, le economie di scala sono sempre una risposta valida.
- **I sei vantaggi del cloud computing** secondo la documentazione AWS: scambiare spese fisse per spese variabili, beneficiare di enormi economie di scala, smettere di indovinare la capacità, aumentare velocità e agilità, smettere di spendere soldi per gestire data center, diventare globali in pochi minuti. Compaiono testualmente nelle domande d'esame sul perché le organizzazioni migrano al cloud.
- **L'agilità nell'esame** significa la capacità di sperimentare e distribuire rapidamente con un basso costo per tentativo — non la pura velocità. Quando uno scenario menziona la riduzione del time to market o la possibilità di iterare rapidamente, l'agilità è il vantaggio del cloud che viene testato.

## Esercizi

**Esercizio 1 — Richiamo**

Con parole tue: cos'è "il cloud" e perché una piccola impresa lo sceglierebbe invece di comprare i propri server?

*(Suggerimento: Pensa all'analogia della rete elettrica — perché le fabbriche hanno smesso di costruire le proprie centrali elettriche e si sono collegate alla rete?)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: Una piccola startup sta lanciando un'applicazione per la consegna di cibo. Si aspettano un traffico basso inizialmente, ma anticipano una rapida crescita se il prodotto avrà successo. Il team fondatore non ha esperienza nella gestione di server fisici. Vogliono ridurre al minimo i costi anticipati ed evitare l'onere operativo di manutenere l'hardware.

Quale dei seguenti approcci soddisfa MEGLIO i loro requisiti?

A) Utilizzare un provider cloud per ospitare l'applicazione e pagare solo per ciò che si usa  
B) Acquistare un server dedicato e ospitare l'applicazione nel loro ufficio  
C) Collaborare con un data center di co-location per installare i propri server  
D) Costruire l'applicazione per funzionare completamente offline senza infrastruttura internet

**Suggerimento 1**: Pensa a cosa la startup deve *evitare* tanto quanto a cosa deve avere.

**Suggerimento 2**: Lo scenario menziona specificamente "nessuna esperienza nella gestione dell'hardware" e "ridurre al minimo i costi anticipati." Quale opzione elimina queste preoccupazioni?

**Suggerimento 3**: Abbiamo descritto questa opzione in questo capitolo come pagare per "i computer di qualcun altro."

**Risposta**: A

**Spiegazione**: I provider cloud come AWS offrono prezzi pay-as-you-go senza costi hardware anticipati, e gestiscono tutta la manutenzione dell'infrastruttura fisica. Questo è esattamente il modello che ha senso per una startup con traffico incerto e nessuna competenza hardware — proprio come Nimbus.

**Perché non B?** Acquistare un server dedicato richiede capitale anticipato, manutenzione continua e non offre capacità di scalare incorporata man mano che il traffico cresce.

**Perché non C?** La co-location risolve il problema dello spazio ma la startup deve ancora comprare, manutenere e gestire i propri server.

**Perché non D?** Un'applicazione per la consegna di cibo richiede per definizione la connettività internet.

*Dominio SAA-C03: Cross-domain — Fondamentali dei concetti cloud*

**Esercizio 3 — Sfida Architetturale** *(Facoltativo)*

Maya vuole convincere suo zio (che possiede il ristorante) a lasciarle costruire un sistema di ordinazione basato su cloud. Lui è scettico: "Perché dovremmo pagare Amazon ogni mese quando potremmo comprare un computer una volta sola?"

Come spiegheresti i compromessi? Quali pensi siano i maggiori vantaggi dell'approccio cloud per un ristorante? E qual è lo scenario in cui comprare il proprio computer potrebbe avere effettivamente più senso?

Pensaci in termini dell'analogia della rete elettrica: quando ha senso per un'azienda far funzionare il proprio generatore invece di collegarsi alla rete? La risposta a quella domanda si mappa quasi direttamente su quando ha senso far girare i propri server.

*(Non esiste una risposta unica corretta. L'obiettivo è praticare il ragionamento sui compromessi.)*

## Scena Post-Crediti

Tardi quella notte, dopo che tutti gli altri erano andati a casa, Maya era seduta da sola nel ristorante con il suo laptop.

Aveva trovato il sito web di AWS. Aveva navigato su alcune pagine. Erano elencati centinaia di servizi. Centinaia.

Scorse verso il basso. E ancora. E ancora.

Poi chiuse il laptop.

"Ci servirà un piano," disse alla stanza vuota.

Tom le aveva mandato per messaggio i prezzi dei server che aveva trovato prima. Lesse di nuovo i numeri: costi anticipati, deprezzamento, elettricità, cicli di sostituzione. Poi aprì il calcolatore dei prezzi AWS. Digitò un server virtuale — il tipo più piccolo, solo per vedere. La cifra mensile era più bassa di quanto sarebbe stata la bolletta elettrica per una sala server fisica.

Fissò quel numero per un po'.

Poi mandò un messaggio a Tom: *Facciamo il cloud.*

La sua risposta arrivò in meno di un minuto: *Lo so. Ho fatto i conti anch'io. Ma lo facciamo con attenzione.*

Posò il telefono. Fuori, il ristorante era silenzioso. La cucina era buia. Da qualche parte tra la cucina e il cloud, c'era un'azienda che stava per costruire.

Nel prossimo capitolo: perché le aziende hanno smesso di comprare server e hanno iniziato ad affittarli — e cosa è cambiato.
