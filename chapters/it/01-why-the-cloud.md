# Capitolo 1: Perché Affittare Quando Potresti Comprare?

Il taccuino era aperto sul tavolo, e Tom aveva cancellato la stessa riga tre volte.

Era rimasto sveglio fino a tardi. La domanda non lo lasciava andare. Verso mezzanotte l'aveva scritta per intero, poi sottolineata, poi disegnato un riquadro attorno, e poi cancellata perché scriverla non l'aveva resa più chiara. L'aveva scritta di nuovo nel margine.

Quando Leo e Priya arrivarono la mattina dopo — caffè in mano, a discutere di qualcosa di non correlato — Tom era già alla lavagna. La terza opzione era ancora lì, intatta. Una forma di nuvola, disegnata da qualcuno che aveva ammesso di non sapere cosa significasse.

Il problema degli ordini del ristorante aveva cristallizzato qualcosa di reale. Maya aveva dichiarato il cloud come la via da seguire. Quella decisione era presa. Ciò che rimaneva era la domanda che Tom non riusciva a scrollarsi di dosso, seduta nel margine del suo taccuino: se affittare era la risposta, perché era più economico che possedere?

"Ho bisogno che qualcuno mi spieghi una cosa," disse Tom, senza girarsi. "Se affittiamo computer da Amazon invece di comprare i nostri — perché sarebbe *più economico*?"

La stanza tacque. Era il tipo di domanda che sembra semplice e non lo è.

"Perché," iniziò Leo.

"No," disse Tom. "Voglio capirlo. Non solo sentire la risposta. Perché affittare è più economico che possedere?"

Leo si sedette. Posò il caffè sul tavolo. Ci pensò davvero.

"Perché," disse di nuovo, più attentamente questa volta, "compreremmo per il caso peggiore. Il venerdì sera più affollato, il momento virale, l'evento di lancio. Ma la maggior parte delle volte non è così affollato."

"Giusto," disse Tom. "Continua."

"Quindi pagheremmo per una capacità che non stiamo usando. Ogni tranquillo martedì. Ogni lunedì mattina. Avremmo un server lì fermo, che consuma elettricità, facendo quasi nulla."

"E se invece affittiamo?"

"Paghiamo per quello che usiamo," disse Leo. "Quando è tranquillo, paghiamo quasi nulla. Quando è affollato, paghiamo di più. Ma non paghiamo mai per capacità che sta semplicemente lì ferma."

Tom sembrò soddisfatto. Non perché la risposta fosse nuova per lui — l'aveva elaborata la notte prima. Ma perché dirla ad alta voce la rendeva reale. Prese il suo taccuino e cancellò la domanda un'ultima volta.

Questa era la fondamenta. Tutto il resto in questo capitolo si costruisce su di essa.

**Il Problema Ovvio con i Server di Proprietà**

Immagina di decidere di aprire un ristorante. Non il tipo Nimbus — un ristorante normale.

Prima che il primo cliente entri, hai bisogno di tavoli. Sedie. Una cucina. Un piano cottura. Piatti. Personale. Hai bisogno di tutto questo il giorno uno, anche se la tua prima settimana è lenta, anche se passi tre mesi con sei clienti al giorno prima che la voce si sparga.

I server fisici funzionano allo stesso modo.

Se Nimbus compra i propri server, deve comprarli per il picco previsto. Il venerdì sera più affollato che riescono a immaginare. Il momento virale in cui un food blogger pubblica sull'arepa e diecimila persone cercano di ordinare contemporaneamente.

Ma la maggior parte delle volte non è così affollato. La maggior parte delle volte quei server restano lì, consumando elettricità, facendo quasi nulla.

"Pagheremmo per una capacità che non stiamo usando," disse Maya.

"Esattamente," disse Tom, il che sorprese tutti perché era lui ad aver fatto la domanda.

**Il Costo Reale dell'Hardware: Il Foglio di Calcolo di Tom**

Tom aveva costruito un modello di costo dettagliato per il momento in cui il team si incontrò. Lo illustrò.

Aveva davvero valutato hardware reale. Un Dell PowerEdge R550 — un server di fascia media in grado di gestire diverse centinaia di utenti contemporanei — costava circa 8.000 dollari configurato con abbastanza RAM e storage per un'applicazione web in produzione. Questo per un server solo. Per la ridondanza (in modo che un guasto non abbattesse l'intero sistema), ne servivano almeno due. Sedicimila dollari prima di iniziare.

La stima di 2.000 dollari sulla lavagna era ottimistica. L'hardware di produzione costava di più. Serviva abbastanza memoria perché l'applicazione e il database girassero simultaneamente. Serviva il RAID per la ridondanza dello storage. Serviva una scheda di rete abbastanza veloce da gestire traffico reale. Per il momento in cui si configurava un vero server di produzione, il numero di 8.000 dollari non era un'esagerazione.

"Due server: 16.000 dollari," disse Tom, annotandolo.

Poi i costi ricorrenti. Energia: un server che gira h24 a 400 watt consuma circa 3.500 kilowattora all'anno. A 0,12 dollari per kWh, erano circa 420 dollari all'anno, per server. Per due: 840 dollari all'anno solo in elettricità.

Poi internet. Una connessione aziendale abbastanza veloce da gestire traffico reale — non il Wi-Fi residenziale che il ristorante usava attualmente, ma una connessione in fibra simmetrica di livello aziendale con un accordo sul livello di servizio — costava da 200 a 400 dollari al mese. Erano da 2.400 a 4.800 dollari all'anno.

Poi il ciclo di vita dell'hardware. I server duravano da tre a cinque anni prima di diventare troppo lenti o inaffidabili per un carico di lavoro in produzione. Dopo il quarto anno, si girava su hardware che non poteva essere protetto da certe vulnerabilità e che il fornitore non supportava più. Quindi si ammortizzava il costo iniziale: 16.000 dollari su quattro anni facevano 4.000 dollari all'anno in ammortamento del capitale.

Poi i costi che nessuno annotava: un gruppo di continuità UPS per sopravvivere alle brevi interruzioni di corrente, circa 400 dollari. Uno switch di rete gestito, 300 dollari. Un firewall con funzionalità di sicurezza adeguate, da 500 a 2.000 dollari. Dischi rigidi di riserva sullo scaffale per il guasto inevitabile, 200 dollari. Raffreddamento — se i server vivevano nell'ufficio sul retro del ristorante, qualcuno doveva tenere conto del calore che generavano, il che significava un circuito di aria condizionata dedicato o una bolletta elettrica a sorpresa.

Sommando tutto: tra 8.000 e 12.000 dollari all'anno tra ammortamento del capitale e costi ricorrenti, prima di pagare qualcuno per manutenere, configurare o riparare l'hardware. E "manutenzione" non era solo una voce di bilancio — era un requisito di competenze. O assumevi qualcuno che sapesse gestire i server, oppure eri tu la persona che li riparava alle 2 di notte quando qualcosa andava storto.

"E quando si rompe," disse Tom, "non sappiamo come ripararlo. Pagheremmo qualcuno a tariffe di emergenza. E mentre aspettiamo, il ristorante è al buio."

"Confronta con AWS," disse Tom. Aprì la pagina dei prezzi di EC2. Un'istanza `t3.medium` — sufficiente compute per il carico di lavoro iniziale di Nimbus — costava circa 30 dollari al mese. Due, per la ridondanza, erano 60 dollari al mese, ovvero 720 dollari all'anno.

Quattromila dollari all'anno in ammortamento contro 720. La differenza non era nemmeno ravvicinata. Anche aggiungendo networking, trasferimento dati e un servizio di database gestito su AWS, la fattura cloud per un carico di lavoro in scala startup era una frazione del costo dell'hardware fisico.

"Ma," disse Tom, perché Tom aveva sempre un ma, "dovremmo essere onesti su quando smette di essere così evidente."

Aveva ragione. A enormi scale — migliaia di server, utilizzo costante — l'economia cambia. Un'azienda che gestisce 5.000 server al 90% di utilizzo h24 potrebbe scoprire che possedere hardware è più economico per unità che affittare a quei volumi. Le grandi aziende a volte raggiungono questo punto. Le startup quasi mai. Per una startup con crescita imprevedibile, nessuna competenza hardware e scala incerta, i calcoli del cloud erano ovvi.

**Il Modello di Affitto**

Ecco cosa rende diverso il cloud computing.

Quando usi AWS, non compri server. Affitti potenza di calcolo e paghi solo per quello che usi. È più simile all'affitto di una location che al possedere un edificio per un ristorante.

Pensa in questo modo.

Se hai bisogno di ospitare una festa di compleanno per cinquanta persone, potresti comprare una casa grande abbastanza per cinquanta persone con i loro tavoli e le loro sedie. Oppure potresti affittare una location per quattro ore di sabato, pagare esattamente lo spazio e il tempo di cui hai bisogno, e restituire le chiavi quando la festa è finita.

La location c'è ancora quando ne hai bisogno. È disponibile di nuovo quando si presenta qualcos'altro. Non hai dovuto assumere un amministratore dell'edificio. Non hai pagato le tasse sulla proprietà per tutto l'anno.

Ma ecco la parte che l'analogia non cattura appieno: con AWS, la "location" può crescere o ridursi per adattarsi alla tua festa. Se si presentassero cinquanta persone e poi altre duecento inaspettatamente, la location si espanderebbe per accoglierle. Se la festa finisse prima, la location si ridurrebbe e smettesti di pagare per lo spazio extra immediatamente.

Nessun affitto di location funziona così. Il cloud computing sì.

Questo è il modello cloud. AWS ha le "location." Tu arrivi quando ne hai bisogno.

C'è una seconda analogia che illustra una parte diversa del quadro.

Immagina di essere una startup che ha bisogno di fotografia professionale. Potresti assumere un fotografo a tempo pieno — stipendio, attrezzatura, benefit, spazio ufficio, il pacchetto completo. Oppure potresti assumere un fotografo a ore quando ne hai bisogno, pagare per il lavoro fatto, e congedarlo quando il servizio è finito.

Il fotografo on-demand costa di più all'ora rispetto a uno stipendiato. Ma a meno che tu non abbia bisogno di fotografia ogni ora di ogni giorno, il modello on-demand è drammaticamente più economico in totale. E puoi assumere uno specialista diverso per lavori diversi — un fotografo di ritratti per i headshot, un fotografo di prodotto per le foto del catalogo — senza mantenere organico per entrambi.

Il cloud computing ha la stessa economia della specializzazione. AWS mantiene team di specialisti per ogni livello dell'infrastruttura: ingegneri di networking, amministratori di database, ricercatori di sicurezza, esperti di approvvigionamento hardware. Accedi al risultato della loro competenza — un database affidabile, una rete sicura, un server ben configurato — a ore, senza assumere nessuno di quegli specialisti tu stesso.

Potresti chiederti: se affittare per ora è più costoso che comprare di acquisto per unità, come funziona l'economia? La risposta è l'utilizzo. Un server fisico di tua proprietà è al 9% di CPU nei tranquilli martedì. Un server cloud che affitti per le ore che ti servono davvero gira a qualunque utilizzo il carico di lavoro richieda, e smetti di pagare quando il carico di lavoro si ferma. Il totale che paghi per le ore che usi effettivamente è inferiore al totale che pagheresti per il server fermo nell'angolo.

**Ma Aspetta — C'è Di Più**

"Ok," disse Leo, "ma cosa succede se la mia location brucia?"

Buon istinto. Cupo, ma buono.

Uno dei presupposti silenziosi quando possiedi i tuoi server è che *tu* sei responsabile del loro funzionamento. Se il server nel tuo ufficio viene rovesciato da uno stagista goffo, il tuo sito web è giù. Se l'edificio perde corrente, il tuo sito web è giù. Se il disco rigido si guasta — e i dischi rigidi alla fine si guastano sempre — il tuo sito web è giù.

AWS gestisce data center. Strutture enormi e gestite professionalmente con alimentazione di riserva, connessioni di rete ridondanti, sicurezza fisica e team di ingegneri il cui unico lavoro è mantenere quelle macchine in funzione. Hanno alimentatori ridondanti. Hanno generatori di backup. Hanno connessioni di rete ridondanti da più provider. Hanno una sicurezza fisica che la maggior parte degli edifici per uffici non potrebbe avvicinare.

Non stai solo affittando potenza di calcolo. Stai affittando affidabilità.

"Quanto costa?" chiese Tom.

Ci arriveremo. I prezzi sono un capitolo a parte, e se lo meritano.

**Tre Cose che il Cloud Fa Diversamente**

Rendiamolo concreto. Ecco le tre differenze fondamentali tra gestire i propri server e usare un provider cloud.

**1. Paghi per quello che usi.**

Nessun server inattivo. Nessun acquisto anticipato. Se Nimbus riceve zero ordini di lunedì mattina, paga quasi nulla. Se vengono travolti la notte di Capodanno, AWS ha automaticamente la capacità pronta.

Questo modello fa corrispondere il costo al valore in un modo che l'infrastruttura fissa non può fare. Quando i tuoi costi tracciano le tue entrate, la pianificazione finanziaria diventa più semplice.

In contabilità c'è un termine per questo: passare dalla spesa in conto capitale alla spesa operativa. CapEx è un acquisto anticipato che ammortizzi nel tempo — come comprare il Dell PowerEdge. OpEx è una spesa ricorrente che paghi man mano che vai — come la fattura AWS. Per una startup con capitale limitato e entrate incerte, OpEx è drammaticamente preferibile. Non stai scommettendo 16.000 dollari su una previsione della domanda di cui non puoi essere sicuro.

"Ogni dollaro che non spendiamo in hardware," disse Tom, "è un dollaro che possiamo spendere per costruire effettivamente il prodotto."

Non è un punto banale. Il costo hardware anticipato che Tom aveva calcolato — 16.000 dollari per due server di livello produttivo — rappresentava il tipo di esborso di capitale che fa fare agli investitori domande scomode e costringe i fondatori a fare scelte difficili sulla liquidità.

**2. Qualcun altro gestisce l'hardware.**

AWS mantiene le macchine fisiche. I cavi di rete. Gli alimentatori. I sistemi di raffreddamento. Nimbus non assume nessuno per farlo. Si concentrano sulla loro applicazione, non sull'infrastruttura sottostante.

Vale la pena soffermarsi su questo. Le competenze necessarie per gestire l'infrastruttura fisica di un data center sono reali. Sistemi di raffreddamento, gestione dell'energia, programmi di sostituzione hardware, ridondanza di rete — queste sono discipline distinte. Usando AWS, Nimbus ottiene accesso a queste competenze senza doverle assumere.

Un amministratore di sistemi con le competenze per manutenere adeguatamente i server in produzione guadagna tra 80.000 e 130.000 dollari all'anno. Un team in grado di gestire guasti hardware, sicurezza a livello di sistema operativo, configurazione di rete e gestione dello storage costa di più. I servizi AWS costano una frazione di tutto ciò — e la competenza operativa è inclusa nel servizio.

Questo è l'argomento delle economie di scala che AWS fa esplicitamente. Poiché AWS gestisce infrastrutture per migliaia di clienti simultaneamente, il costo per unità di mantenere quella competenza è condiviso tra tutti loro. Ogni singolo cliente ottiene accesso a operazioni infrastrutturali di livello mondiale per una fattura che è una piccola frazione di quanto costerebbero quelle operazioni se le costruissero da soli.

**3. Puoi scalare su — e giù — istantaneamente.**

Questo è quello che richiede un po' di tempo per essere apprezzato appieno. Con i server fisici, scalare su significa ordinare nuovo hardware, aspettare settimane per la consegna, configurarlo. Con AWS, scalare su significa fare clic su un pulsante (o far fare tutto automaticamente al sistema). E quando non hai più bisogno della capacità extra, scala di nuovo. Smetti di pagare.

La parte "e giù" è sottovalutata. Scalare giù su hardware fisico significa che possiedi ancora l'hardware, paghi ancora l'elettricità, mantieni ancora il sistema. Hai solo più del necessario. Con il cloud, scalare giù è reale — le risorse spariscono, e il costo sparisce con loro.

Leo descrisse questo come "la parte che sembra imbrogliare." Aveva trascorso anni a lavorare intorno a sistemi a capacità fissa — stimando attentamente quanto server gli sarebbe servito, provisionando in modo conservativo, guardando il misuratore di capacità, e a volte sbagliando in entrambe le direzioni. L'idea di poter aggiungere un server, usarlo per quattro ore un venerdì sera, e rimuoverlo — pagando solo quelle quattro ore — sembrava sbagliata nel modo in cui sembrano sbagliate le cose troppo belle per essere vere.

Non era troppo bella per essere vera. Era il modello di business. AWS guadagna quando usi la loro infrastruttura. Hanno ogni incentivo a rendere quell'utilizzo il più fluido possibile.

Priya era rimasta in silenzio durante questa spiegazione. Aveva una domanda.

"E se qualcuno tenta di entrare? Di chi è il problema?"

Ed è lì che diventa interessante.

**Il Modello di Responsabilità Condivisa**

Questo è uno dei concetti più importanti in tutto AWS. È semplice una volta che lo capisci, ma fa inciampare molte persone — anche all'esame.

AWS e tu condividete la responsabilità per la sicurezza. Ma ciascuna parte è responsabile di cose diverse.

**AWS è responsabile della sicurezza *del* cloud.**

I data center fisici. L'hardware. L'infrastruttura di rete. Gli hypervisor che eseguono le macchine virtuali. Se qualcuno entra in un data center AWS, è un problema di Amazon. Se un disco fisico si guasta, l'hardware rotto è un problema di Amazon — ma se riesci a recuperare i dati che vi erano sopra dipende dagli snapshot e dai backup che *tu* hai configurato, e quella parte è tua. Se l'infrastruttura di rete tra le availability zone viene compromessa, è un problema di Amazon.

**Tu sei responsabile della sicurezza *nel* cloud.**

I tuoi dati. La tua applicazione. I tuoi account utente e chi ha accesso a cosa. Le configurazioni che scegli. Se qualcuno ruba la tua password e accede al tuo account AWS, è un tuo problema. Se configuri erroneamente un database rendendolo pubblicamente accessibile, è un tuo problema. Se la tua applicazione ha una vulnerabilità che consente SQL injection, è un tuo problema.

Priya annuì lentamente. "Quindi loro proteggono l'edificio. Noi proteggiamo quello che c'è dentro."

"Esattamente," disse Maya.

"Quindi se Leo apre una porta che non dovrebbe..."

"Rimane il nostro problema," confermò Maya, guardando Leo.

Leo stava già digitando qualcosa sul suo laptop e fingeva di non sentire.

Potresti chiederti: questo significa che AWS è mai responsabile di una violazione dei dati? Solo se la violazione avviene a livello fisico o dell'infrastruttura — un data center compromesso, un guasto hardware, una vulnerabilità nell'hypervisor stesso. Le violazioni causate da applicazioni mal configurate, password deboli o controlli di accesso mal impostati sono sempre responsabilità del cliente, indipendentemente da quanto grande o affidabile sia il provider cloud.

**L'Analogia dell'Aeroporto**

Ecco un secondo modo di pensare al Modello di Responsabilità Condivisa, perché emerge abbastanza spesso nell'esame da valere due angolazioni.

Immagina un aeroporto.

Il gestore dell'aeroporto protegge le strutture — le piste, i terminal, i recinti, i checkpoint di sicurezza, cosa succede quando qualcuno non autorizzato viene trovato vicino al deposito di carburante.

Ma una volta dentro, ogni compagnia aerea è responsabile delle proprie operazioni: la manutenzione dei propri aerei, le procedure del proprio equipaggio, i propri manifesti dei passeggeri. Se una compagnia aerea perde il bagaglio di un passeggero o un pilota salta una checklist, non è colpa dell'aeroporto. Le strutture erano protette. La compagnia aerea che opera al loro interno ha fatto una scelta sbagliata.

AWS è l'aeroporto. Tu sei la compagnia aerea che opera al suo interno. AWS protegge la struttura fisica e l'infrastruttura di base. Tu proteggi i tuoi dati, i tuoi controlli di accesso e le tue decisioni applicative.

Questa analogia è importante perché chiarisce dove si trova il confine quando le cose vanno storte. "Siamo su AWS, quindi è un loro problema" è sempre la risposta sbagliata nell'esame, e quasi sempre la risposta sbagliata nel mondo reale.

**Il Tipo di Servizio Conta**

C'è un'altra sfumatura vale la pena conoscere ora, anche se la rivisiteremo per tutto il libro.

La divisione della responsabilità cambia a seconda di quanto è gestito un servizio.

Per EC2 — le macchine virtuali che controlli — sei responsabile del patching del sistema operativo. AWS fornisce la macchina fisica e l'hypervisor. Tutto ciò che è sopra il sistema operativo è tuo.

Per RDS — il servizio di database gestito che trattiamo nel Capitolo 8 — AWS fa il patching del motore del database stesso. Non gestisci il sistema operativo. La tua responsabilità si riduce alla configurazione del database, ai dati al suo interno e a chi ha accesso.

Per S3 — il servizio di storage dei file — AWS gestisce completamente l'infrastruttura. La tua responsabilità è il controllo degli accessi (chi può leggere e scrivere nei tuoi bucket) e i dati stessi.

Più gestito è il servizio, più responsabilità si sposta su AWS. Questo è un pattern chiave dell'esame: quando una domanda chiede chi è responsabile di qualcosa, chiedi prima "quanto è gestito questo servizio?"

**Se Cloud Allora Convenienza Ma Non Controllo**

Il modello cloud offre vantaggi reali: nessun hardware da gestire, costi elastici, scalabilità istantanea. Ma significa cedere qualcosa anche.

Se sposti la tua infrastruttura nel cloud, guadagni flessibilità e riduci i costi di capitale anticipato — ma rinunci al pieno controllo sulle macchine sottostanti. Non puoi ispezionarle fisicamente. Non puoi garantire dove si trovano in un data center. Dipendi dall'uptime di AWS, dalle finestre di manutenzione di AWS e dalla risposta agli incidenti di AWS quando qualcosa va storto a livello infrastrutturale. Per la maggior parte dei team, è un ottimo scambio. Per alcuni settori regolamentati, richiede documentazione attenta e le certificazioni di conformità di AWS. Sappi cosa stai scambiando prima di scambiarlo.

## Punti di Forza e Limitazioni

Nessuno strumento è perfetto. Siamo onesti su entrambi i lati.

**Perché il cloud è ottimo**:

- Nessun costo hardware anticipato
- Paghi solo per quello che usi
- Scala istantaneamente in entrambe le direzioni
- Affidabilità professionale e sicurezza fisica
- Accesso a centinaia di servizi gestiti (database, code, machine learning, e altro)
  senza doverli costruire o manutenere tu stesso
- Portata globale: fare il deploy in una nuova area geografica è una modifica di configurazione,
  non un processo di approvvigionamento hardware

**Dove diventa complicato**:

- I costi possono essere imprevedibili se non stai prestando attenzione (il futuro incubo di Tom)
- Dipendi da terze parti per la tua infrastruttura — se AWS ha un'interruzione nella tua
  region, anche il tuo servizio ne risente
- C'è una curva di apprendimento. AWS ha centinaia di servizi. Sapere quale usare
  richiede esperienza, o un libro come questo.
- I dati che escono dal cloud possono essere costosi. Spostare grandi quantità di dati fuori
  da AWS costa denaro. (Lo rivisiteremo nel Capitolo 30.)
- Il vendor lock-in è reale per i servizi di livello superiore. Usare un database AWS gestito
  è facile da iniziare e più difficile da cui allontanarsi. Più servizi specifici di AWS usi,
  più sei impegnato nell'ecosistema e nei prezzi di AWS.

"Quindi stiamo scambiando controllo per convenienza," disse Tom.

"E scambiamo costo anticipato per costo continuativo," aggiunse Maya.

"E scambiamo il problema di qualcun altro con il nostro problema, sul lato della sicurezza," disse Priya.

"Ma stiamo anche scambiando il server rotto di Leo con il server molto-non-rotto di Amazon," disse Leo, che apparentemente aveva ascoltato tutto il tempo.

Non aveva del tutto torto.

Tom aveva un'altra preoccupazione.

"Se costruiamo tutto su AWS e AWS aumenta i prezzi tra tre anni, non possiamo certo spostare il nostro database nel retro del ristorante."

"Vero," disse Maya. "Ma la traiettoria dei prezzi di Amazon è stata generalmente verso il basso — hanno tagliato i prezzi oltre 100 volte dal 2006. Il rischio di lock-in è reale, ma il rischio storico effettivo di aumenti di prezzo a sorpresa è basso."

"Generalmente," disse Tom. Lo annotò. Avrebbe rivisitato questo calcolo, come rivisitava tutti i suoi calcoli, in un futuro sabato mattina con una penna rossa e un caffè.

**Quando l'On-Premises È la Scelta Giusta**

Il cloud vince chiaramente il confronto con Nimbus. Ma l'onestà intellettuale richiede di dire quando non vince.

**Le grandi aziende con carichi di lavoro stabili e prevedibili** a volte scoprono che possedere hardware diventa economicamente competitivo con l'affitto una volta che l'utilizzo è costantemente alto. Se gestisci migliaia di server all'80% di utilizzo h24, l'economia della proprietà appare diversa rispetto a una startup con traffico variabile. Il modello pay-per-use del cloud è più vantaggioso quando l'utilizzo è variabile. Quando l'utilizzo è stabile e alto, l'economia per unità della proprietà può essere competitiva. Ecco perché alcune grandi aziende gestiscono architetture ibride: cloud per i carichi di lavoro variabili, on-premises per quelli stabili.

**Gli ambienti dati regolamentati con requisiti di localizzazione rigorosi** possono non avere altra opzione che l'on-premises. Gli ambienti informatici classificati del governo — sistemi che gestiscono informazioni classificate di sicurezza nazionale — non possono usare provider cloud commerciali. I dati non possono lasciare una struttura fisicamente controllata. I sistemi finanziari in alcune giurisdizioni hanno requisiti simili. Le organizzazioni sanitarie che elaborano determinate categorie di dati possono affrontare requisiti che le certificazioni cloud commerciali non soddisfano pienamente. In queste situazioni, l'on-premises non è una preferenza; è un obbligo.

**I requisiti di latenza estremamente bassa e prossimità fisica** creano una terza categoria. Alcuni sistemi di trading finanziario hanno bisogno di latenza inferiore al millisecondo tra la loro applicazione e il motore di matching della borsa. La co-location nello stesso data center fisico della borsa — con connessioni in fibra dirette — ottiene latenze che nessuna region cloud potrebbe eguagliare. Alcuni strumenti scientifici — acceleratori di particelle, reti sismiche, radiotelescopi — generano dati che devono essere elaborati localmente prima che la trasmissione sia fattibile. Questi sono casi d'uso reali che richiedono prossimità fisica all'hardware.

**I contratti a lungo termine esistenti** sono il vincolo più banale ma spesso più rilevante. Un'azienda che ha firmato un contratto di affitto di un data center per cinque anni nel 2022 ha un obbligo contrattuale. Passare al cloud prima della scadenza del contratto ha un costo reale — i pagamenti di affitto rimanenti — che cambia significativamente l'economia. Le decisioni architetturali non avvengono nel vuoto. Avvengono in organizzazioni con contratti esistenti, programmi di ammortamento hardware esistenti e competenze del personale esistenti.

"Qualcuno di questi siamo noi?" chiese Maya.

"No," disse Tom. "Non abbiamo hardware. Nessun contratto. Nessun mandato normativo. E un team senza esperienza nell'amministrazione di server."

"Quindi cloud."

"Cloud. Ma sapere quando non è la risposta fa parte del sapere quello che si fa."

Nessuna delle eccezioni on-premises si applica a Nimbus. Ma sono reali, e un buon cloud architect sa quando dire "il cloud non è la risposta giusta qui." L'obiettivo non è essere un sostenitore del cloud. L'obiettivo è avere ragione.

## Riepilogo

La domanda che Tom non riusciva a scrollarsi di dosso — perché affittare è più economico che possedere? — aveva una risposta semplice e una complicata. La risposta semplice è l'utilizzo: smetti di pagare per capacità ferma nei tranquilli martedì. La risposta complicata coinvolge il Modello di Responsabilità Condivisa, il compromesso tra CapEx e OpEx, e alcune situazioni oneste in cui il cloud è effettivamente la scelta sbagliata. Tom aveva ragione a fare la domanda. La risposta ha cambiato il modo in cui il team ha pensato a tutto il resto.

- Il vantaggio fondamentale è la scalabilità pay-as-you-go: paghi solo per quello che usi, e puoi scalare su o giù secondo necessità.
- Il confronto dei costi di Tom ha mostrato chiaramente l'economia hardware: 720 dollari all'anno per due istanze EC2 contro 8.000–12.000 dollari all'anno per hardware fisico equivalente, prima dei costi di manutenzione.
- AWS gestisce l'infrastruttura fisica. Tu gestisci la tua applicazione, i tuoi dati e le tue configurazioni. Questa divisione si chiama **Modello di Responsabilità Condivisa**.
- Il Modello di Responsabilità Condivisa cambia a seconda del tipo di servizio — i servizi più gestiti significano più responsabilità di AWS.
- Il cloud non è sempre più economico o più semplice — ma rimuove le barriere all'avvio e rende possibile la scalabilità in modi che i server fisici non possono eguagliare.

## Suggerimenti per l'Esame

*Dominio SAA-C03: Cross-domain — Fondamentali del cloud computing*

- Il **Modello di Responsabilità Condivisa** appare regolarmente nell'esame. Ricorda: AWS
  è responsabile della sicurezza *del* cloud (hardware, data center, rete globale).
  Tu sei responsabile della sicurezza *nel* cloud (dati, identità, configurazione dell'applicazione).
- **Sfumatura critica**: la divisione cambia a seconda del tipo di servizio. Per EC2
  (una macchina virtuale che controlli), *tu* fai il patching del sistema operativo. Per RDS (un
  database gestito), AWS fa il patching del motore del database. Più "gestito" è un servizio,
  più responsabilità si sposta su AWS. Gli scenari dell'esame descriveranno un incidente
  e chiederanno chi è responsabile — chiedi sempre "quanto è gestito questo servizio?"
- Le domande sui *vantaggi* del cloud spesso testano CapEx vs. OpEx. L'hardware on-premises
  è una spesa in conto capitale (CapEx — compri una volta, ammortizzi nel tempo). Il cloud è
  una spesa operativa (OpEx — paghi mensilmente). AWS sposta i costi da CapEx a OpEx.
- "Elasticità" — la capacità di scalare su *e giù* automaticamente — è un vantaggio fondamentale
  del cloud. Potresti vederla abbinata a "scalabilità" nell'esame. L'elasticità significa
  scalabilità automatica e guidata dalla domanda in entrambe le direzioni. La scalabilità significa
  che il sistema *può* crescere, ma non necessariamente si riduce automaticamente.
- L'esame potrebbe descrivere uno scenario in cui un'azienda sta passando dall'"acquisto di server"
  al "cloud." La formulazione corretta: passaggio da CapEx a OpEx, eliminazione dei costi anticipati,
  ottenimento dell'elasticità e trasferimento della responsabilità infrastrutturale al provider cloud.

## Esercizi

**Esercizio 1 — Ricordo**

Con parole tue: spiega il Modello di Responsabilità Condivisa. Chi è responsabile di cosa, e perché quella distinzione è importante?

*(Suggerimento: Pensa all'analogia di Priya — chi protegge l'edificio e chi protegge quello che c'è dentro.)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: Un'azienda sta migrando la sua applicazione web da un data center on-premises ad AWS. Il team di sicurezza è preoccupato di mantenere la conformità con le proprie policy di protezione dei dati. Un nuovo ingegnere chiede: "Ora che siamo su AWS, Amazon gestisce tutti i nostri requisiti di sicurezza?"

Quale delle seguenti descrizioni MEGLIO descrive come sono divise le responsabilità di sicurezza?

A) AWS è pienamente responsabile di tutta la sicurezza una volta che l'applicazione è ospitata nel cloud
B) Il cliente è pienamente responsabile di tutta la sicurezza, inclusa la sicurezza fisica del data center
C) AWS gestisce la sicurezza dell'infrastruttura sottostante; il cliente gestisce la sicurezza dei propri dati, applicazioni e configurazioni
D) Le responsabilità di sicurezza vengono negoziate per account e dipendono dal livello di servizio del cliente

**Suggerimento 1**: Pensa a cosa AWS controlla fisicamente versus cosa controlli tu.

**Suggerimento 2**: AWS possiede i data center. Tu hai scelto cosa mettere al loro interno e come configurare la tua applicazione.

**Suggerimento 3**: Abbiamo introdotto un nome specifico per questa divisione di responsabilità in questo capitolo.

**Risposta**: C

**Spiegazione**: Il Modello di Responsabilità Condivisa di AWS divide la sicurezza in due domini. AWS protegge l'infrastruttura fisica — data center, hardware e rete. Il cliente protegge tutto ciò che distribuisce sopra di essa: i propri dati, i propri controlli di accesso, le configurazioni dell'applicazione e le impostazioni di rete.

**Perché non A?** AWS non si assume mai la piena responsabilità per la sicurezza dell'applicazione del cliente. Dal momento in cui configuri qualcosa, quella configurazione è tua da gestire.

**Perché non B?** I clienti non sono responsabili della sicurezza fisica del data center — questo è precisamente uno dei vantaggi dell'utilizzo di AWS.

**Perché non D?** Il Modello di Responsabilità Condivisa è un framework fisso, non un accordo negoziato.

*Dominio SAA-C03: Cross-domain — Concetti cloud / Responsabilità Condivisa*

**Esercizio 3 — Sfida di Architettura** *(Opzionale)*

Un amico sta lanciando una nuova app e chiede la tua opinione. Sta decidendo tra l'acquisto di due server fisici (uno per l'app, uno per il database) o l'utilizzo di un provider cloud. Il traffico previsto è di 10-100 utenti al giorno, ma ha un evento di lancio tra tre mesi che potrebbe portare 10.000 utenti in un solo giorno.

Analizza i compromessi. Quale opzione raccomanderesti e qual è il motivo principale? Cosa rinunceresti con la tua scelta?

*(Non esiste una risposta unica corretta. L'obiettivo è praticare il pensiero sui compromessi.)*

## Scena Post-Crediti

Tre giorni dopo, Nimbus aveva un account AWS.

Leo lo aveva creato alle 23 usando la sua email personale, una carta di credito che aveva dovuto prendere in prestito da Tom, e un entusiasmo che era, in retrospettiva, leggermente allarmante.

"Ho trovato qualcosa che si chiama EC2," disse la mattina dopo, mostrando lo schermo del suo laptop. "È come un computer che noleggi. Credo di averne avviato uno."

"*Credi*?" chiese Priya.

"Voglio dire, l'ho sicuramente avviato." Scorrò verso il basso. "Non so solo dove si trova."

Maya si avvicinò e guardò lo schermo.

"Leo," disse. "Perché dice 'Region: ap-southeast-1'?"

"Cosa significa?"

"Aspetta — ma *perché* saremmo a Singapore?" disse Maya. "Tutti i nostri clienti sono sulla Costa Ovest."

Nel prossimo capitolo: la geografia di AWS — dove si trovano effettivamente i server e perché è importante.
