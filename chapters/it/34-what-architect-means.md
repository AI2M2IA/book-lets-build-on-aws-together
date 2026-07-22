# Epilogo: Cosa Significa Essere un Architetto

*Questo capitolo è un epilogo. Non ci sono esercizi, né suggerimenti per l'esame, né scena post-crediti — perché non c'è un capitolo successivo.*

Il tavolo nell'angolo aveva la migliore luce nel caffè. Attraverso la finestra, il pomeriggio stava facendo qualcosa di lento e senza fretta alla strada all'esterno.

Maya aveva ordinato tè. Tom aveva ordinato espresso. Priya aveva ordinato qualcosa che descrisse solo come "quello che stavano preparando quando sono entrata." Leo era in ritardo di venti minuti, il che era prevedibile.

Erano passati quattordici mesi dalla Serie A.

Il team di ingegneria contava ora diciannove persone. C'erano due fusi orari. C'era un team di piattaforma, un team di prodotto, un team dati. C'era una revisione architettonica settimanale che durava novanta minuti e di solito ne avrebbe avuto bisogno di più. Il finanziamento aveva fatto quello che fanno i finanziamenti: i 947 ristoranti partner che Maya aveva presentato agli investitori erano diventati 3.000, le due città che erano "in fase di lancio" erano operative insieme ad altre tre, e la piattaforma che una volta aveva servito un singolo ristorante di famiglia ora gestiva la corsa del venerdì sera da una costa all'altra.

Leo arrivò con una borsa da laptop e l'espressione di qualcuno che aveva fatto tre telefonate prima delle 9. Si sedette. Ordinò un caffè. Disse: "Okay. Cosa stiamo facendo?"

"Pensare," disse Maya.

"A cosa?"

Lei aveva pensato, in treno, a qualcosa che un nuovo assunto aveva detto durante la sua prima settimana. Era un buon ingegnere — attento, preciso, faceva buone domande. Venerdì, alla fine della sua prima revisione architettonica, aveva detto: "Voglio diventare un architetto un giorno."

Lei aveva detto: "Stai già prendendo decisioni architettoniche."

Lui aveva avuto un'espressione incerta. "Ma sono solo un junior."

"Anch'io lo ero," disse lei. "Lo erano tutti in questa stanza, una volta."

Raccontò questa storia al tavolo. Quando finì, Tom disse: "Cosa intendevi con quello?"

"Non sono sicura di averlo spiegato bene," disse Maya. "Ecco perché siamo qui."

E perché la domanda era rimasta con lei per tutto il fine settimana.

Non perché fosse lusingata di essere interpellata.

Perché era il tipo di domanda che cambia il modo in cui qualcuno vede il proprio futuro, se si risponde bene.

**La Domanda**

Cos'è un architetto?

Non il titolo. Non l'organigramma. Non gli anni di esperienza elencati in una descrizione del lavoro. La cosa vera.

Nei quattordici mesi dal round di finanziamento, tutti e quattro erano diventati, formalmente o informalmente, responsabili delle decisioni architettoniche di Nimbus. Maya era ufficialmente la CTO. Tom era Head of Infrastructure. Priya guidava il team di piattaforma. Leo era Principal Engineer, il che significava che veniva consultato su tutto e non possedeva nulla di specifico, cosa che trovava allo stesso tempo liberatoria e, a volte, frustrante.

Nessuno di loro si aspettava di essere arrivato fin lì. Maya aveva studiato amministrazione aziendale e gestito il ristorante di famiglia — non aveva mai scritto codice in produzione quando tutto era cominciato. Tom aveva trascorso otto anni come amministratore di sistemi convinto di restarlo. Priya aveva una laurea in informatica e uno stage in un'azienda di sicurezza. Leo si era insegnato a programmare da solo, pubblicando la sua prima app a sedici anni.

Nessuno di tutto ciò corrispondeva alla descrizione del lavoro di "architetto."

"Ecco cosa penso," disse Priya. "Un architetto è qualcuno che ha accettato di essere responsabile delle conseguenze delle proprie decisioni — non solo della decisione in sé."

"Continua," disse Leo.

"Quando sei all'inizio della carriera, prendi una decisione e vai avanti. La implementi oppure no. Qualcuno la rivede, la approva, la distribuisce. La conseguenza di sbagliare è che qualcuno a monte coglie l'errore."

"E più avanti?"

"Più avanti, nessuno è a monte. La decisione va in produzione. La conseguenza è la produzione stessa."

Tom annuì lentamente. "È lì che inizi a pensare in modo diverso. Non perché sai di più — anche se è vero — ma perché il raggio d'azione di un errore è cambiato."

**Da Junior ad Architetto: La Vera Progressione**

La progressione da ingegnere junior ad architetto non è una linea retta di conoscenze accumulate. È una serie di cambiamenti nel modo in cui comprendi il tuo lavoro.

*Gli ingegneri junior* si chiedono: come lo faccio funzionare? La loro domanda principale è l'implementazione. Dato un requisito, come produco un sistema funzionante? Questa è la prima competenza essenziale. Tutto il resto si fonda su di essa.

*Gli ingegneri mid-level* si chiedono: come lo faccio funzionare correttamente? La domanda si allarga fino a includere la correttezza — non solo "funziona" ma "gestisce i casi limite, le condizioni di errore, gli input inattesi." Cominciano a pensare ai test. Cominciano a pensare alla manutenzione.

*Gli ingegneri senior* si chiedono: come lo faccio funzionare correttamente *e* in modo sostenibile? L'orizzonte temporale si estende. Pensano all'ingegnere che leggerà questo codice tra un anno. Pensano al sistema che dovrà reggere dieci volte il carico attuale. Pensano a cosa succede quando una dipendenza cambia.

*Gli ingegneri staff e principal* si chiedono: perché stiamo costruendo questo, in primo luogo? Fanno un passo indietro rispetto all'implementazione e mettono in discussione la premessa. È il problema giusto da risolvere? È il momento giusto per risolverlo? Esiste un approccio più semplice che rinuncia alla sofisticazione in cambio della sopravvivenza?

*Gli architetti* si chiedono: cosa si rompe per primo, come lo sappiamo, e cosa fa qualcuno alle 3 di notte quando accade?

"La domanda delle 3 di notte," disse Leo. "Carlos la usava."

"Perché è vera," disse Priya. "Questo è il test. Sai scrivere il runbook? Conosci le modalità di guasto abbastanza bene da scrivere i passaggi per qualcuno che è mezzo addormentato e sotto pressione?"

**Cosa Non Cambia**

Ci sono cose che gli architetti sanno e che gli ingegneri junior non sanno. Il comportamento specifico dei servizi. Le caratteristiche di guasto su larga scala. Le dinamiche organizzative per ottenere l'approvazione delle decisioni. La storia delle decisioni prese in contesti simili che non hanno funzionato.

Ma la conoscenza non è la cosa.

La cosa è l'insieme predefinito di domande. Il modello mentale che si attiva quando qualcuno descrive un problema.

Gli ingegneri junior ascoltano un problema e pensano alle soluzioni. Gli architetti ascoltano un problema e pensano ai vincoli, alle modalità di guasto e al divario tra quello che l'azienda dice di aver bisogno e quello di cui ha davvero bisogno.

Non perché siano più freddi.

Perché stanno cercando di proteggere le persone che dovranno vivere dentro le conseguenze.

"Non è che sappiamo di più," disse Tom. "Facciamo domande diverse per prime."

Maya era rimasta in silenzio per un po'. Disse: "Quando ho parlato con quel nuovo ingegnere, ho capito cosa stavo cercando di dire davvero. Mi ha chiesto come diventare un architetto. E volevo dirgli: inizia a notare cosa si rompe. Non solo quando qualcosa è già rotto — ma prima. Durante la progettazione. Durante la revisione. Chiedi: cosa si rompe per primo? Come lo sapremo? Chi chiamiamo?"

"Non è un titolo," disse Leo. "È un'abitudine."

"Sì."

**Proprietà**

L'altra cosa, concordarono, era la proprietà.

Non la proprietà in senso legale. La proprietà in senso psicologico: la sensazione che, se questo sistema degrada, sarai tu a preoccupartene di più.

All'inizio della carriera, questa non è la postura attesa. Sei responsabile dei tuoi ticket, delle tue PR, delle tue storie assegnate. Il sistema appartiene a qualcun altro.

Più avanti, il confine si dissolve. Il sistema è tuo. Non solo tuo — condiviso, sempre condiviso — ma tuo nel senso che ne senti i guasti personalmente. Un incidente in produzione alle 2 di notte non è un'interruzione della tua vita. È parte del tuo lavoro.

"Questo è il cambiamento che non avrei potuto insegnare a nessuno," disse Tom. "Devi sentire qualche interruzione di servizio. Devi essere tu quello che non ha colto la modalità di guasto prima che colpisse la produzione. È lì che la domanda cambia."


L'altra cosa che notarono riguardo al cambiamento era che non era avvenuto in un momento specifico, ma nel corso di una serie di incidenti.

Per Tom, era stata la prima volta che un volume EBS senza tag era apparso sulla fattura e nessuno sapeva a cosa servisse. Aveva trascorso due ore a rintracciarlo. Lo aveva trovato. Lo aveva eliminato. E poi — invece di andare avanti — aveva scritto una policy sui tag e trascorso un altro pomeriggio a verificare che il resto dell'infrastruttura la seguisse. Nessuno glielo aveva chiesto. Lo aveva fatto perché l'idea di non farlo lo disturbava.

Per Priya, era stata la prima volta che era stata chiamata alle 2 di notte per un rilevamento di GuardDuty. All'inizio era seccata. Poi aveva letto il rilevamento. Un utente IAM aveva effettuato 47 chiamate API fallite verso un endpoint che normalmente non accedeva. Si era rivelato essere uno script di automazione mal configurato. Ma i 20 minuti che aveva trascorso a tracciare il rilevamento si erano conclusi con una domanda: se fosse stato un vero compromesso, cosa avremmo potuto vedere? La risposta era: pochissimo. Aveva trascorso il successivo sprint a costruire l'infrastruttura di logging e alerting che avrebbe risposto a quella domanda.

Per Leo, era stato il sistema di notifiche. Non durante l'incidente — durante le due settimane successive. Il modo in cui aveva pensato all'architettura di notte, non perché qualcuno lo guardasse, ma perché qualcosa dentro di lui non riusciva a lasciare andare finché non aveva capito cosa aveva costruito di sbagliato e perché.

Nessuno di loro era stato istruito a preoccuparsene così tanto. Era arrivato nel modo in cui arrivano la maggior parte delle cose importanti: gradualmente, senza annuncio, nel mezzo del lavoro ordinario.



"Alcune persone non fanno quel cambiamento," disse Priya. "Buoni ingegneri. Eccellenti ingegneri. Fanno un lavoro eccellente all'interno di un ambito definito e sono attenti e affidabili al suo interno. Non sentono la proprietà. Non è un fallimento morale — è semplicemente un rapporto diverso con il lavoro."

"E gli architetti devono sentirla," disse Maya.

"Gli architetti la sentono per impostazione predefinita," disse Priya. "Anche quando sono fuori servizio. Specialmente allora."

**Ampiezza vs. Profondità Tecnica**

C'è una domanda che viene posta in ogni colloquio di architettura: sei un generalista o uno specialista?

La risposta onesta è: nessuno dei due da solo è sufficiente.

Gli architetti hanno bisogno di abbastanza profondità per sapere quello che non sanno — per riconoscere quando un problema è ai margini della loro conoscenza, quando coinvolgere qualcuno con un'expertise più specifica. Non puoi sapere quando chiamare un esperto di database se non capisci i database abbastanza bene da sapere cosa ti manca.

E gli architetti hanno bisogno di abbastanza ampiezza per connettere le cose. I sistemi che progettano attraversano i domini: storage e compute e network e security e observability e costo. Le decisioni in un'area hanno conseguenze in un'altra. Non puoi ottimizzare i costi di rete senza capire il comportamento dell'applicazione. Non puoi progettare un modello di dati senza capire i pattern di accesso. Non puoi scegliere un modello di deployment senza capire le modalità di guasto.

"Non è profondità o ampiezza," disse Leo. "È profondità in alcune cose e consapevolezza di tutto."

"A forma di T," disse Priya.

"Ho sempre odiato quella metafora," disse lui. "Ma sì."

**Ragionamento sui Trade-off**

La cosa più comune che dicono gli architetti è: dipende.

L'errore è dirlo senza completare la frase.

*Dipende dal pattern di accesso.* Dipende dalla scala. Dipende dalla conseguenza del guasto. Dipende dalla capacità operativa del team. Dipende dal vincolo di costo. Dipende da quanto tempo ci si aspetta che il sistema rimanga nella sua forma attuale.

Completare la frase è il lavoro. Ogni frase completata rivela una dimensione del problema che era precedentemente invisibile. Ogni dimensione resa visibile è una decisione che può essere presa deliberatamente invece che accidentalmente.

Priya aveva scritto una lista, alcuni mesi prima, delle decisioni che Nimbus aveva preso accidentalmente — non in malafede, non per negligenza, ma senza capire appieno che la decisione stesse venendo presa. La rivedeva a volte. Era un documento utile.

"Le migliori decisioni architettoniche che ho visto," disse, "sono quelle in cui qualcuno ha detto: ecco le quattro opzioni, ecco i trade-off, ecco cosa raccomando, ecco cosa mi farebbe cambiare la raccomandazione."

"Un ADR," disse Leo.

"Un ADR," convenne lei. "O semplicemente una frase in un messaggio Slack. Il formato non importa. Il ragionamento sì."

"Perché il ragionamento sopravvive anche quando la decisione viene riesaminata," disse Tom.

"Perché il ragionamento è la conoscenza," disse Maya. "La decisione è solo l'output."

**Cosa Non È la Seniority**

Non è l'anzianità. Puoi lavorare da qualche parte per dieci anni senza sviluppare giudizio architettonico. Puoi averne tre di anzianità e pensare come un architetto. Il tempo correla debolmente con la cosa.

Non è sapere tutto. Ci sono servizi nel catalogo di AWS che nessuno di loro aveva mai usato — offerte specializzate per settori specifici, funzionalità annunciate e non ancora necessarie. Va bene. Il catalogo è vasto. Il lavoro non è la conoscenza enciclopedica; è il ragionamento basato su principi a partire da quello che sai.

Non è l'assenza di dubbio. Gli architetti dubitano costantemente. Mantengono le proprie decisioni con più leggerezza rispetto agli ingegneri junior, perché hanno visto abbastanza buone decisioni fallire in circostanze inaspettate da sapere che la fiducia è situazionale. "Sono fiducioso in questo dati i vincoli attuali" è la postura corretta. Non "ho ragione."

Non è l'incapacità di sbagliare. Carlos aveva raccontato loro, in quella prima revisione architettonica, di un sistema che aveva progettato e che era fallito catastroficamente perché aveva sbagliato l'analisi delle modalità di guasto. Lo descrisse con chiarezza, senza difese. "Me lo sono perso," disse. "Abbiamo imparato da quello. Il sistema successivo non aveva quella modalità di guasto."

Non è la certezza sul futuro. Gli architetti più esperti sono i più a proprio agio nel dire: non so come si comporterà questo a 10x del traffico. Testiamolo. La disponibilità ad ammettere l'incertezza — e a progettare sistemi in grado di sopravvivere all'errore — è un segno di maturità, non di debolezza.

"Questo l'ha reso affidabile," disse Maya, quando raccontò la storia al nuovo assunto. "Non perché non avesse mai sbagliato. Perché aveva sbagliato, aveva capito perché, e lo aveva portato avanti con sé."

**La Transizione verso la Seniority**

Per chiunque stia leggendo questo ed è ancora junior o mid-level, che si trova sul percorso verso questo tipo di pensiero:

La transizione non è un esame che superi. È una postura che adotti, gradualmente, e poi non abbandoni.

Inizia a fare la domanda sul guasto. In ogni progetto, in ogni revisione, per ogni sistema che tocchi: *cosa si rompe per primo?* Non ipoteticamente — percorrila. Segui la catena. Il load balancer riceve una richiesta. Il server applicativo la elabora. Il database riceve la query. Cosa si rompe per primo sotto carico? Cosa si rompe per primo se una dipendenza è lenta? Cosa si rompe per primo a 10x del traffico attuale?

Inizia ad avere responsabilità sulle cose oltre la loro consegna. Quando distribuisci qualcosa, non consegnarlo e andare avanti. Osservalo per una settimana. Guarda le metriche. Guarda i log degli errori. Guarda il costo. Chiedi: questo sistema si comporta nel modo in cui mi aspettavo? Se no, perché?

Inizia a rendere espliciti i trade-off. Quando scegli un approccio, articola perché hai scartato le alternative. Scrivilo, anche brevemente. "Ho scelto X rispetto a Y perché Z." Quell'articolazione è l'inizio del ragionamento architettonico.

Inizia a trattare i post-mortem come educazione, non come processo. Ogni incidente è un caso di studio. Leggi quelli pubblici — AWS, Cloudflare, Stripe, GitHub li pubblicano tutti. Leggi quelli interni. Chiedi: qual era la modalità di guasto? Quale assunzione si è rivelata sbagliata? Cosa avrei fatto diversamente?

La progressione da junior ad architetto non riguarda principalmente quello che sai. Riguarda quello che noti.

**La Vista dal Tavolo d'Angolo**

Il caffè era finito. La luce del pomeriggio attraverso la finestra si era spostata mentre parlavano — come succede quando smetti di notarla.

Leo disse: "Penso a quell'incidente iniziale. Quello in cui il database è andato giù durante la corsa della cena e non avevamo un runbook né il monitoraggio e abbiamo trascorso quaranta minuti senza sapere cosa stesse andando storto."

"Pensavamo fosse l'applicazione," disse Priya.

"Pensavamo fosse il CDN," disse Tom.

"Era il pool di connessioni al database," disse Maya. "E nessuno di noi sapeva di guardare lì per primo."

"A questo penso," disse Leo. "Non perché fosse imbarazzante. Perché riesco ancora a sentire il divario tra quello che sapevo allora e quello che so ora. E sono consapevole che tra cinque anni sentirò lo stesso divario tra ora e allora."

"Questa è la sensazione giusta," disse Priya.

"C'è un nome per questo?"

"Umiltà calibrata," disse lei. "Sapere quello che non sai. Il che richiede prima di sapere quello che sai."


Poi Leo disse qualcosa che aveva dentro da un po'.

"Posso dirti quella a cui penso di più?"

Nessuno glielo vietò.

"Il sistema di notifiche," disse. "La coda SQS. Quella che ho costruito quando avevamo 40 ristoranti."

Priya lo guardò. Conosceva questa storia. Era stata lei a risolverla.

"Raccontacela," disse Maya.

Leo aveva costruito il sistema di notifiche per i ristoranti in un lungo fine settimana durante la spinta del Series Seed. Il requisito era semplice: quando veniva effettuato un ordine, notificare immediatamente il ristorante. Il meccanismo che aveva scelto era SQS — una coda Standard, una funzione Lambda come consumer, impostazioni di concorrenza predefinite. Aveva funzionato immediatamente, in modo affidabile e senza problemi — per più di due anni, mentre 40 ristoranti diventavano silenziosamente centinaia, e centinaia diventavano migliaia.

Finché non erano arrivati a 3.000 ristoranti.

"La corsa del venerdì sera con 3.000 ristoranti," disse Leo. "A quel punto ogni ordine produceva una manciata di messaggi — la notifica del nuovo ordine, la conferma, l'aggiornamento pronto per il ritiro. Alle 18 la coda riceveva circa 2.000 messaggi al minuto. Normalmente era nulla: ogni invocazione terminava in meno di due secondi, quindi non avevamo mai più di sessanta o settanta Lambda in esecuzione contemporaneamente. Ma quel venerdì, il provider di push per i tablet degradò. Le chiamate che impiegavano due secondi iniziarono a bloccarsi fino a raggiungere il timeout di 30 secondi della funzione."

"E Lambda iniziò a essere throttled," disse Priya.

"È la matematica che nessuno fa finché non fa male," disse Leo. "La concorrenza è il tasso di arrivo per la durata. Trentatré messaggi al secondo per due secondi fa circa settanta esecuzioni concorrenti. Trentatré messaggi al secondo per trenta secondi fa mille — ogni unità di concorrenza che l'account aveva. Il limite predefinito a livello di account è 1.000 esecuzioni concorrenti. Non ci avevamo mai pensato perché con 40 ristoranti eravamo lontanissimi. Con 3.000 ristoranti un venerdì alle 18, con una dipendenza downstream lenta, lo abbiamo raggiunto in sette minuti."

Quando una funzione Lambda raggiunge il limite di concorrenza, non elabora ulteriori messaggi. I messaggi restano nella coda SQS. Con una coda Standard, SQS continua a riprovare — ma non c'è concorrenza aggiuntiva per elaborarli. I messaggi si accumulano. Le notifiche si bloccano. I ristoranti non ricevono le notifiche degli ordini. I timer della cucina non partono. Gli ordini sono in ritardo o vengono persi.

"Quanto tempo prima che i ristoranti partner iniziassero a chiamare?" chiese Tom.

"Undici minuti dopo l'inizio del throttling," disse Leo. "Avevamo 430 notifiche in arretrato."

"Cosa hai fatto per prima cosa?" chiese Maya.

Leo ebbe la grazia di sembrare leggermente imbarazzato. "Ho aumentato il timeout di Lambda da 30 secondi a 5 minuti. L'idea era che se ogni invocazione poteva girare più a lungo, forse avrebbe elaborato il backlog più velocemente."

"Ha peggiorato le cose?" chiese Tom.

"Ha peggiorato le cose. I messaggi arretrati venivano ritentati mentre le invocazioni originali erano ancora in esecuzione con il timeout esteso. Avevo creato una situazione in cui la concorrenza già al limite era tenuta occupata da funzioni a lunga esecuzione mentre nuovi messaggi arrivavano e non venivano elaborati."

"Mi ricordo," disse Priya sottovoce.

"Il mio secondo tentativo," continuò Leo. "Ho aggiunto una seconda funzione Lambda. Stessa coda, nuovo consumer. Pensavo che se raddoppiavo i consumer avrei raddoppiato il throughput."

"Ma la concorrenza è per account, non per funzione," disse Priya.

"Esatto. Due funzioni Lambda, entrambe che raggiungevano lo stesso tetto di concorrenza a livello di account. Throughput totale: identico a una funzione. Backlog: ancora in crescita. La seconda Lambda divideva semplicemente la stessa capacità limitata tra due funzioni."

Tom fissava il tavolo. "Qual è la soluzione corretta?"

"L'ha trovata Priya," disse Leo.

"Alle 2 di notte," aggiunse Priya. Stava leggendo la documentazione di Lambda a letto, con la luminosità del telefono al minimo.

"Concorrenza riservata," disse. "A ogni funzione Lambda può essere assegnata una concorrenza riservata — una porzione del limite di concorrenza totale dell'account garantita esclusivamente per quella funzione, e non disponibile per nessun'altra funzione. Se avessi dato alla Lambda delle notifiche 400 unità di concorrenza riservata, le altre Lambda dell'account avrebbero avuto 600 unità da condividere, e la Lambda delle notifiche non avrebbe potuto essere privata delle risorse da altre funzioni."

"Ha risolto?" chiese Tom.

"Ha risolto il problema di starvation," disse Priya. "Ma c'era ancora un tetto di throughput sulla Lambda delle notifiche. 400 invocazioni concorrenti, ognuna che elabora un messaggio alla volta. A due secondi per messaggio, è più che sufficiente per 2.000 messaggi al minuto. Ma nel momento in cui una dipendenza downstream rallenta oltre i dodici secondi per chiamata, la stessa matematica che ci aveva distrutto a 1.000 ci distrugge a 400. Le 400 unità avevano abbastanza margine per il traffico di quella settimana. Per quella settimana."

"Era un fix temporaneo," disse Leo.

"Era il terzo fix in una serie escalante," disse Priya. "Ogni fix affrontava un sintomo. Nessuno di essi affrontava l'architettura."

La soluzione corretta — che costruirono nelle due settimane successive — aveva tre parti.

"Code FIFO," disse Priya, "per tier di ristorante. I ristoranti erano segmentati in tre tier: enterprise, growth e standard. Ogni tier aveva la propria coda SQS FIFO. Ogni coda aveva il proprio consumer Lambda con la propria allocazione di concorrenza riservata."

"Perché FIFO?" chiese Tom. "Le code Standard costano meno."

"Perché le code FIFO garantiscono l'ordinamento dei messaggi per gruppo," disse Priya. "Per le notifiche ai ristoranti, l'ordine dei messaggi è importante. Se un aggiornamento di un ordine arriva prima della notifica dell'ordine originale, il ristorante vede una sequenza confusa. Le code FIFO, con un message group ID per ristorante, garantiscono che i messaggi di ogni ristorante vengano elaborati nell'ordine in cui sono stati inviati."

"E la separazione per tier?" chiese Tom.

"Raggio di danno isolato," disse Priya. "Se la coda del tier enterprise ha un problema di elaborazione, non degrada il tier standard. I ristoranti enterprise hanno i requisiti di SLA più elevati — sono quelli in cui una notifica ritardata costa a Nimbus soldi veri in penali contrattuali. Separarli garantisce che la loro coda non possa essere riempita dal traffico dei ristoranti standard."

"E la DLQ," aggiunse Leo.

"Una dead-letter queue su ogni coda FIFO," disse Priya. "I messaggi che falliscono l'elaborazione dopo tre tentativi vengono spostati nella DLQ. Un allarme CloudWatch scatta quando la profondità della DLQ supera zero. L'ingegnere on-call rivede i messaggi falliti e determina se necessitano di rielaborazione o indagine."

"Prima dell'allarme DLQ," disse Leo, "venivamo a sapere delle notifiche fallite quando un ristorante partner chiamava. L'allarme DLQ significa che lo sappiamo prima della telefonata."

La conversazione si era fatta silenziosa per un momento. La luce del pomeriggio aveva continuato il suo lento spostamento attraverso la finestra del caffè.

"A cui penso," disse Leo, "è il divario tra quello che ho costruito e quello che costruirei ora. Non come autocritica. Come misura. Perché quel divario è il modo in cui so di aver imparato qualcosa."

"Cosa avresti costruito dall'inizio?" chiese Maya.

"Code FIFO a tier dal giorno uno," disse Leo. "Non perché avessi bisogno di tre tier con 40 ristoranti. Ma perché il design sarebbe stato giusto per quello che saremmo diventati. Il costo di tre code invece di una era trascurabile. Il costo di una coda che fallisce su scala è stato tre ore di incidenti il venerdì sera e due settimane di rimedi."

"Non sapevi che saresti arrivato a 3.000 ristoranti quando l'hai costruita," disse Priya. Non era una difesa. Era una precisazione.

"No," disse Leo. "Ma sapevo che stavamo costruendo un sistema di notifiche per una piattaforma di ristoranti con ambizioni di crescita. La domanda che non mi sono posto era: come appare questo a 10x? A 100x? Qual è la prima cosa che si rompe quando cresciamo?"

"Il limite di concorrenza," disse Tom.

"Il limite di concorrenza," concordò Leo. "Che è nella documentazione di Lambda. Avevo letto la documentazione. Avevo solo non posto la domanda che avrebbe reso rilevante la sezione pertinente."

"Questa è l'abitudine architettonico," disse Priya. "La domanda che rende rilevante la documentazione giusta. Non puoi leggere ogni riga. Ma se ti chiedi 'cosa si rompe su scala?', finisci per leggere le righe giuste."

Maya aveva ascoltato senza parlare per un po'. Disse: "Il motivo per cui volevo parlarne oggi — il motivo per cui vi ho chiesto di venire tutti — è che ho cercato di capire cosa possiamo insegnare ai nuovi ingegneri. Non i servizi. I servizi li impareranno. Qual è la cosa che ci vuole più tempo a imparare di quanto dovrebbe?"

Nessuno rispose immediatamente.

"Quella domanda," disse Leo alla fine. "Quella su cosa si rompe su scala. La poniamo per riflesso ora. Non la ponevamo per riflesso quando abbiamo iniziato. Non so come insegnare a qualcuno a porla per riflesso senza lasciargli costruire qualche cosa che si rompe su scala prima."

"Non puoi," disse Tom. "Ma puoi rendere l'ambiente più sicuro per l'apprendimento. Puoi costruire sistemi in cui il guasto è visibile, contenuto e tracciabile. Puoi assicurarti che il post-mortem sia un documento di apprendimento, non un documento di accusa. Puoi porre la domanda sulla scala nella code review, anche quando conosci la risposta, perché la persona che scrive il codice ha bisogno di sentirla posta."

"E puoi raccontare storie," disse Priya. "Come questa."


Maya guardava la strada.

"Il nuovo ingegnere ha chiesto come diventare un architetto," disse. "Quello che avrei dovuto dire è: diventa qualcuno che si preoccupa di cosa si rompe. Tutto il resto ne consegue."

Nessuno parlò per un momento.

Era uno di quei silenzi che non hanno bisogno di essere riempiti.

Fuori, qualcuno attraversò la strada portando due sacchetti di carta del cibo da asporto. Tom lo notò per primo e rise.

"Cerchio chiuso," disse.

Maya sorrise. "Già," disse. "Cerchio chiuso."

---

## La Progressione da Junior ad Architetto

| Livello         | Domanda Principale                                              | Orizzonte Temporale | Responsabilità   |
|-----------------|----------------------------------------------------------------|---------------------|------------------|
| Junior          | Come lo faccio funzionare?                                     | Ticket corrente     | La mia PR        |
| Mid-level       | Come lo faccio funzionare correttamente e in modo manutenibile? | Questo sprint       | Il mio componente |
| Senior          | Come regge nel tempo e su scala?                               | Prossimo trimestre  | Questo servizio  |
| Staff/Principal | Perché stiamo costruendo questo, ed esiste un percorso più semplice? | Prossimo anno   | Questo sistema   |
| Architetto      | Cosa si rompe per primo, come lo sappiamo, e cosa facciamo?    | Indefinito          | Il prodotto      |

---

## Cosa Cambia Man Mano che Cresci

**Dall'implementazione alle conseguenze.** Gli ingegneri junior si chiedono "funziona?" Gli ingegneri senior si chiedono "continuerà a funzionare?" Gli architetti si chiedono "cosa succede quando smette di funzionare?"

**Dalle funzionalità ai sistemi.** Gli ingegneri junior aggiungono funzionalità. Gli architetti pensano a cosa diventa il sistema quando ne sono state aggiunte dieci. La forma delle decisioni future è già visibile nelle decisioni attuali.

**Dalla correttezza ai trade-off.** Di solito esiste un'implementazione "più corretta" di una funzionalità. Raramente esiste un'architettura "più corretta." Ci sono trade-off, e i migliori architetti li fanno esplicitamente e consapevolmente piuttosto che accidentalmente.

**Dalla fiducia alla calibrazione.** Gli ingegneri junior sono spesso o troppo poco sicuri (incerti sulle decisioni corrette) o troppo sicuri (inconsapevoli di quello che non sanno). Gli architetti esperti sono calibrati: conoscono l'estensione e i limiti della propria conoscenza, e mantengono le proprie conclusioni al livello appropriato di certezza.

**Dalla conoscenza al giudizio.** La conoscenza è sapere che DynamoDB usa le partition key. Il giudizio è sapere che il pattern di accesso di questo specifico caso d'uso causerà hot partition, e che l'impatto aziendale di quella modalità di guasto alla scala prevista significa che devi riconsiderare il design ora.

---

*Grazie per aver letto.*

*L'esame AWS Solutions Architect Associate (SAA-C03) è disponibile nei centri di test Pearson VUE e online tramite il loro sistema di test da remoto. Visita aws.amazon.com/certification per registrarti.*

*La storia di Nimbus è fittizia. I servizi AWS, i modelli di prezzo e le best practice descritte in questo libro sono reali. Entrambi possono cambiare — AWS aggiorna i propri servizi frequentemente. Verifica sempre prezzi e capacità dei servizi attuali su aws.amazon.com.*

*Buona fortuna.*

---

*Stesso posto l'anno prossimo?*

