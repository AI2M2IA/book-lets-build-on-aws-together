# Capitolo 33: Dipende

Fai un ultimo respiro prima di questo capitolo.

Il cursore lampeggiava sulla diapositiva vuota di Maya. Titolo: "L'Architettura di Nimbus." Lo cancellò e scrisse: "La Domanda." Poi guardò la stanza e si rese conto che non aveva bisogno della diapositiva.

**Riepilogo: Dalla Revisione alla Presentazione**

La revisione architetturale con Carlos — sei mesi e qualche centinaio di lanci di ristoranti alle spalle — aveva lasciato al team una pila di ADR e un modo più chiaro di pensare alle decisioni prima del rilascio. Maya stava preparando la presentazione agli investitori quando si accorse che tutto quello che Carlos aveva chiesto — e tutto quello a cui lei aveva risposto con sicurezza — si riduceva alla stessa logica di fondo. Gli investitori avrebbero chiesto perché. Aveva imparato, nel corso di due anni di costruzione di Nimbus, che la risposta non era mai il nome del servizio. La risposta era sempre l'insieme delle condizioni che rendevano un servizio giusto e un altro sbagliato. Stava per entrare in una stanza di persone che le avrebbero chiesto di difendere ogni scelta architetturale. Era pronta.

**La Domanda**

Alla fine di quasi ogni discussione sull'architettura, qualcuno alla fine chiede: "Qual è la risposta giusta?"

E la risposta più utile, frustrante, onesta e fraintesa di tutta l'ingegneria del software è:

**Dipende.**

Non perché la domanda sia irrisolvibile. Non perché l'esperto stia eludendo. Ma perché la risposta giusta dipende genuinamente, strutturalmente, da un contesto che non era nella domanda.

Questo capitolo è dedicato ad imparare a dire "dipende" correttamente — il che significa essere in grado di completare la frase.

Pensa a un medico a cui viene chiesto: "L'intervento chirurgico è il trattamento giusto?" Un medico scadente dice sì o no senza esaminare il paziente. Un buon medico dice: "Dipende — dalla diagnosi, dall'età del paziente, dalle altre patologie, e da cosa succede se aspettiamo." La risposta non è evasione. È precisione. "Dipende" seguito da una frase completa è la cosa più utile che un medico — o un architetto — possa dire.

**L'Incontro con gli Investitori**

Due anni e mezzo dall'inizio. Maya era in piedi in una sala conferenze a Seattle, presentando a una stanza di investitori venture capital.

Nimbus era cresciuta: 947 ristoranti partner. 18.000 ordini giornalieri. 18 milioni di dollari di GMV mensile. Tre città operative, due in lancio. Un team di quattordici ingegneri su due fusi orari.

Gli investitori avevano domande. Uno di loro — un partner tecnico nel fondo — si sporse in avanti.

"Quale database usate?" chiese.

Maya non esitò.

"Per gli ordini e i dati dei clienti: Aurora PostgreSQL. Per il catalogo dei menu: DynamoDB. Per la gestione delle sessioni e il caching: ElastiCache Redis. Per l'analisi: Athena su file Parquet su S3, con Redshift per le query del dashboard ad alta frequenza."

Annuì. "Perché Aurora per gli ordini e non DynamoDB?"

"Perché gli ordini hanno una struttura relazionale complessa — fanno riferimento a voci di menu, account cliente, indirizzi dei ristoranti, metodi di pagamento. Abbiamo bisogno di consistenza transazionale su più entità. Un database relazionale è lo strumento giusto. La forza di DynamoDB è l'accesso chiave-valore ad alto throughput con schema flessibile, che è esattamente il modello di accesso del catalogo dei menu."

Scrisse qualcosa. "E la scalabilità? Dici 18.000 ordini giornalieri. Sono circa 12 al minuto di media. Come ha progettato per il picco?"

"Il picco del venerdì sera è circa 25 volte la media. Scaliamo orizzontalmente con ECS e Aurora Serverless v2, che gestisce i picchi automaticamente. CloudFront assorbe il carico dei contenuti statici. L'API è stateless, quindi la scalabilità orizzontale è pulita."

"E se Aurora Serverless v2 non riesce a scalare abbastanza velocemente?"

"Abbiamo i risultati dei test di carico. Il tempo di scalabilità per Aurora Serverless v2 è inferiore ai 10 secondi. Il nostro picco del venerdì impiega 8 minuti per salire dalla baseline. Abbiamo un margine confortevole."

Il partner tecnico guardò gli altri investitori. "Conosce il suo sistema."

Aveva altre domande.

"Come gestisce la sicurezza dei deployment? Con 947 ristoranti, un deployment errato significa che 947 ristoranti non possono ricevere ordini."

Maya aveva già risposto a questa domanda internamente. "Feature flag per tutte le modifiche di comportamento. Deployamo il codice continuamente, ma il nuovo comportamento è bloccato dietro flag che abilitiamo gradualmente. Un deployment che cambia il flusso di conferma dell'ordine viene distribuito all'1% dei ristoranti per 24 ore, poi al 10%, poi al 50%, poi al 100% — con rollback automatico se i tassi di errore superano la soglia in qualsiasi fase."

"Quanto dura un rollout completo?"

"Tre giorni per una modifica ad alto rischio. Un giorno per le modifiche a basso rischio. I rollback di emergenza si completano in meno di quattro minuti."

"Qual è la latenza p99 di Stripe?"

Tom rispose prima di Maya. "214 millisecondi."

"È alta," disse l'investitore.

"La nostra SLA con i ristoranti è l'inserimento dell'ordine fino alla conferma in meno di 5 secondi," disse Tom. "214ms per la chiamata Stripe è il 4,3% di quel budget. Il tempo rimanente è la scrittura su Aurora, la consegna del messaggio SQS, la push notification al tablet del ristorante. Abbiamo margine."

"E se Stripe ha un'interruzione?"

"Usiamo il payment capture asincrono di Stripe. L'ordine viene accettato e il ristorante notificato immediatamente. Il payment capture avviene in modo asincrono. Se Stripe è lento, l'ordine passa comunque — il capture riprova. Se Stripe è completamente inattivo, mettiamo in coda il tentativo di capture con backoff esponenziale e allarmiamo il nostro on-call. Non abbiamo trattenuto un ordine per Stripe da 14 mesi."

L'investitore scrisse qualcosa. "Avete singoli punti di guasto?"

Priya rispose. "Aurora in una singola regione è una dipendenza a singola regione. Abbiamo Multi-AZ per i guasti a livello di AZ, e un reader Aurora Global Database già operativo in us-east-1. Un guasto regionale completo significherebbe eseguire il failover su quel reader — e il failover regionale automatizzato attorno a esso è quello che stiamo costruendo questo trimestre. Fino ad allora, sì — un guasto regionale in us-west-2 abbatterebbe Nimbus."

"Perché non avete ancora costruito il failover multi-regione?"

"Perché fino a sei mesi fa, il costo ingegneristico di costruirlo correttamente superava il rischio di business dell'interruzione," disse Priya. "Non abbiamo mai avuto un guasto regionale AWS che durasse più di 30 minuti nella nostra regione operativa. Con 287 ristoranti — circa 4.200 ordini al giorno a un valore medio di 34 dollari — un'interruzione regionale di 2 ore ci costa circa 12.000 dollari di GMV. Il costo ingegneristico di un warm standby correttamente implementato è 3 mesi di tempo di un ingegnere senior. Alla nostra revenue attuale, i conti favorivano il rinvio."

"E adesso?"

"Con 947 ristoranti e 18.000 ordini giornalieri, la stessa interruzione di 2 ore costa circa 51.000 dollari di GMV e genera danni reputazionali significativi con i partner ristoratori che dipendono da noi per il loro servizio serale. I conti sono cambiati. Il progetto di failover inizia nel prossimo sprint."

L'investitore guardò gli altri investitori in sala. "Conosce anche il suo profilo di rischio."


**Le Quattro Domande Sotto "Dipende"**

Maya aveva posto qualche variante di ciascuna di queste domande per due anni senza sapere di porre la stessa domanda in quattro modi diversi. La sessione con gli investitori lo aveva chiarito. Ogni scelta che aveva spiegato con sicurezza tornava agli stessi quattro assi.

**1. Qual è il modello di accesso?**

Come vengono scritti e letti i dati? A quale frequenza? Da quanti utenti concorrenti? In che ordine? Per quali chiavi?

Questa domanda determina la selezione della tecnologia al livello più fondamentale. DynamoDB vs Aurora vs Redshift vs Athena — la risposta giusta dipende quasi interamente dal modello di accesso.

**2. Qual è la scala?**

Non solo ora — tra 12 mesi, tra 5 anni. La scala cambia la risposta corretta. Ciò che funziona a 100 richieste al giorno si rompe a 100 milioni. Ciò che è eccessivo per 10 utenti è necessario per 10.000.

E la scala non è solo traffico. È la dimensione del team (l'architettura deve essere mantenibile dal team che hai). È il volume dei dati. È la portata geografica.

**3. Qual è la conseguenza del guasto?**

Se questo si rompe, cosa succede? Un utente vede una pagina lenta? Un ordine fallisce? Il denaro si sposta in modo errato? La cartella clinica di qualcuno diventa inaccessibile?

La conseguenza determina quanto si investe in affidabilità. Una pagina del menu lenta giustifica la consistenza eventuale. Un pagamento fallito giustifica le scritture sincrone e la conferma esplicita.

**4. Qual è il vincolo di costo?**

Non solo il denaro — anche la complessità operativa (che è a sua volta una forma di costo). Una soluzione che richiede tre servizi aggiuntivi può essere tecnicamente superiore a una più semplice ma troppo costosa da mantenere con un team di quattro persone.

"Aspetta — ma *perché* il modello di accesso è così importante?" aveva chiesto Maya, due anni prima, quando Tom aveva proposto per la prima volta di separare il catalogo dei menu dal database degli ordini. "Non possiamo ottimizzare in seguito?"

Quella domanda, si scoprì, era l'inizio della risposta. Non si può ottimizzare uno schema relazionale per modelli di accesso chiave-valore senza ricostruirlo. Il modello di accesso doveva essere noto al momento del design, non aggiunto in seguito. Ogni decisione architetturale che aveva preso da allora era iniziata con la stessa domanda.

Forse ti stai chiedendo: se "dipende" è sempre la risposta giusta, come si arriva mai a prendere una decisione? La risposta è che completare la frase ti obbliga a nominare le condizioni, e una volta che le hai nominate, sai quali informazioni ti servono. "Dipende dal modello di accesso" diventa "vai a scoprire qual è effettivamente il modello di accesso." Le quattro domande non sono un modo per evitare le decisioni — sono un modo per prenderle con le informazioni giuste.

**"Dipende": Come Completare la Frase**

Il modo corretto di dire "dipende" è completarlo immediatamente:

*"Dovremmo usare DynamoDB o Aurora?"*

"Dipende dal modello di accesso. Se hai bisogno di ricerche ad alto throughput basate su chiave con schema flessibile, DynamoDB. Se hai bisogno di consistenza transazionale tra entità correlate con query complesse, Aurora."

*"Dovremmo usare Lambda o EC2?"*

"Dipende dalle caratteristiche del carico di lavoro. Lambda per carichi di lavoro event-driven, a breve durata, variabili, in cui il costo zero a riposo conta. EC2 o ECS per processi persistenti, stateful o a lunga durata, dove la prevedibilità delle prestazioni è più importante del costo a riposo."

*"Dovremmo usare Multi-AZ o Multi-Region?"*

"Dipende dai tuoi requisiti RTO/RPO e dal tuo modello di minaccia. Multi-AZ protegge dai guasti di AZ (il modo di guasto AWS più comune) e fornisce RPO ~0 e RTO ~60 secondi per RDS. Multi-Region protegge dai guasti regionali (rari) e serve utenti distribuiti globalmente. Se hai bisogno di un failover sub-minuto da un disastro regionale, Multi-Region. Se la resilienza di AZ è sufficiente, Multi-AZ è molto più semplice e meno costoso."

"Dipende" non è la fine della risposta. È l'inizio della risposta vera.


*"Dovremmo usare EKS o ECS per l'orchestrazione dei container?"*

L'investitore aveva posto questa domanda prima che Maya passasse alla diapositiva successiva. Lei si fermò.

"Dipende dalla dimensione del team, dall'esperienza Kubernetes esistente e dal fatto che siano necessarie funzionalità specifiche di Kubernetes."

"Espanda," disse.

"Kubernetes è una potente piattaforma di orchestrazione," disse Maya. "Ha un ricco ecosistema — Helm chart, custom resource definition, federazione multi-cluster, policy di scheduling avanzate. Se hai un team che conosce Kubernetes, ha strumenti costruiti attorno ad esso e ha bisogno di quelle capacità, EKS è la scelta giusta. Ottieni un control plane gestito, ma stai comunque gestendo la complessità Kubernetes di network policy, sicurezza dei pod, resource quota e il resto."

"E ECS?"

"ECS è più semplice. Nessuna API Kubernetes. Nessun etcd. Nessuna complessità di pod networking. Definisci task, service e cluster. IAM si integra nativamente senza richiedere plugin aggiuntivi. Il modello mentale è significativamente più piccolo. Per un team che non conosce già Kubernetes, ECS elimina mesi di curva di apprendimento."

"Quale usa Nimbus?"

"ECS," disse. "Abbiamo valutato EKS diciotto mesi fa. Avevamo un ingegnere con esperienza Kubernetes. Gli altri avrebbero avuto bisogno di 3-4 mesi per diventare produttivi in un ambiente Kubernetes in produzione. Le funzionalità che EKS ci avrebbe dato — gestione multi-cluster, scheduling personalizzato — non ci servivano. ECS con Fargate gestisce i nostri container. Il team era produttivo in due settimane."

"Sarebbe la scelta giusta a 50 ingegneri?" chiese.

"Potrebbe non esserlo," disse Maya. "Con 50 ingegneri e più team di prodotto che necessitano di namespace isolati, policy di networking personalizzate e resource quota per team — il modello di namespace di Kubernetes diventa genuinamente prezioso. ECS non ha un isolamento di namespace equivalente. A quella scala, la curva di apprendimento di Kubernetes è ammortizzata su un team molto più grande. La risposta 'dipende' cambia."

"A quale dimensione del team avviene il cambiamento?" chiese.

Ci aveva pensato. "La regola che uso: quando l'overhead operativo di Kubernetes diventa inferiore all'overhead organizzativo di lavorare attorno ai limiti di ECS, si cambia. Per un team di 14 persone, ECS. Per un team di 50 persone con più verticals di prodotto, probabilmente EKS. Il numero non è fisso — dipende da cosa stai costruendo e da chi lo sta costruendo."

"Aspetta — ma *perché* faremmo le cose in quel modo?" si chiese Maya, ripetendo la domanda che aveva imparato nel corso di due anni di costruzione. "Perché non scegliere uno e restare su quello?"

Perché la risposta giusta cambia man mano che l'organizzazione cambia. Una decisione architetturale presa per un team di 4 persone non è necessariamente corretta per un team di 40. Le condizioni cambiano. La risposta cambia con esse.

"Questo è il punto," disse all'investitore. "La risposta corretta oggi è ECS. La risposta corretta tra tre anni potrebbe essere EKS. Lo rivaluteremo quando le condizioni lo giustificano. Abbiamo un ADR che documenta perché abbiamo scelto ECS, e indica esplicitamente cosa innescherebbe una riconsiderazione."

L'investitore scrisse un'ultima nota. "Questo è un modo maturo di tenere una decisione tecnica."


**Variazione: Quando "Dipende" Ti Porta nei Guai**

Se il modello di accesso favorisce le ricerche chiave-valore e scegli DynamoDB, supererai Aurora in termini di prestazioni su larga scala — ma se aggiungi una funzionalità che richiede query JOIN su tre entità, hai costruito la fondamenta sbagliata e dovrai migrare sotto pressione. La risposta "dipende" è valida solo quanto la tua comprensione delle condizioni da cui dipende.

Se ottimizzi per la scala attuale e il modello di accesso attuale, prenderai la decisione giusta per oggi — ma se il traffico cresce di 50 volte in un anno senza che la tua architettura si adatti, la decisione corretta al giorno uno diventa il collo di bottiglia al giorno 365. Le quattro domande devono essere poste non solo al momento del design ma riesaminate man mano che il sistema cresce.

**I Pattern Che Non Cambiano**

Mentre le scelte tecnologiche specifiche evolvono — nuovi servizi vengono lanciati, i prezzi cambiano, emergono alternative migliori — alcuni pattern fondamentali sono rimasti stabili per decenni:

**Separazione degli ambiti**: i componenti che fanno cose diverse dovrebbero essere indipendenti. Un cambiamento in uno non dovrebbe richiedere un cambiamento nell'altro. È per questo che si disaccoppia con SQS, non con chiamate dirette. Perché si usa S3 per gli oggetti, non i database. Perché il tier web e il tier database sono separati.

**Difesa in profondità**: nessun singolo controllo di sicurezza è sufficiente. Hai IAM, security group, NACL, WAF, GuardDuty, Secrets Manager, KMS. Se un livello fallisce, il successivo lo intercetta.

**Paga per quello che usi, quando lo usi**: il principio economico fondamentale del cloud. Lambda scala a zero. Le istanze Spot usano la capacità di riserva. Le lifecycle policy di S3 spostano i dati freddi su storage più economico. DynamoDB on-demand addebita per richiesta. Tom aveva chiesto "Quanto costa al mese?" diecimila volte nel corso di due anni. Quella domanda — posta costantemente, risposta rigorosamente — si era trasformata in quasi 36.000 dollari di risparmi annuali. I pattern sono diversi; il principio è lo stesso.

**Ottimizza per il guasto più probabile**: prima Multi-AZ (i guasti di AZ accadono). DR cross-regione come secondo (i guasti regionali sono più rari). Ridondanza all'interno di AZ (istanze multiple) prima della complessità cross-regione. Costruisci per il guasto realistico, non per quello catastrofico ma improbabile.

**Misura prima di ottimizzare**: l'approccio di Tom — estrarre le metriche CloudWatch, comprendere il pattern effettivo, poi prendere decisioni — vale più dell'ottimizzazione prematura basata su assunzioni. L'istinto di Leo sui batch job notturni — "andrà bene" — era la cosa più importante su cui allenarsi a non fare affidamento. Di solito va bene, finché una volta non va, e non hai misurato nulla.


**Il costo composto dei default sbagliati.**

Tom aveva un altro pattern da aggiungere alla lista, uno che aveva identificato solo dopo tre mesi di revisione dei costi: il costo del non cambiare il default.

I servizi AWS sono progettati per essere sicuri e funzionali out of the box. I default non sono progettati per essere ottimali per ogni carico di lavoro. gp2 era il tipo di volume EBS predefinito fino al lancio di gp3 nel dicembre 2020. Dopo di allora, gp3 è diventato il default per i nuovi volumi — ma i volumi gp2 esistenti non sono mai stati convertiti, perché AWS non modifica le risorse dei clienti esistenti senza azione esplicita.

L'implicazione sui costi: ogni team che aveva creato volumi EBS prima di gp3 e non aveva mai eseguito un audit di migrazione aveva pagato il 25% in più per GB per anni, non perché avesse preso la decisione sbagliata, ma perché non aveva preso alcuna decisione. Il default era persistito, e il costo si era accumulato silenziosamente.

Per questo la domanda "aspetta, ma perché faremmo le cose in quel modo?" era diventata la cosa più preziosa che il team chiedeva. Non si trattava sempre di mettere in discussione una decisione presa. A volte si trattava di mettere in discussione una non-decisione: un default accettato senza esame.

Il pattern si generalizza: riesamina i default quando AWS lancia una nuova opzione. gp2 a gp3. DynamoDB On-Demand a provisionato con Auto Scaling quando il traffico si stabilizza. S3 Standard a Intelligent-Tiering quando i modelli di accesso diventano incerti. Il riesame non deve essere costoso — un pomeriggio di analisi per categoria, ogni trimestre. Ma non può essere saltato. I default si accumulano.

"Ogni dollaro che stiamo spendendo su qualcosa che abbiamo scelto è un costo intenzionale," disse Tom nella revisione mensile. "Ogni dollaro che stiamo spendendo su qualcosa che non abbiamo esaminato da quando l'abbiamo provisionato è un potenziale default che dovrebbe essere messo in discussione."

"Quanti ne abbiamo?" chiese Maya.

"Meno di sei mesi fa," disse. "Più di zero."

Quella era la risposta onesta. Era sempre la risposta onesta.


**Cosa Questo Libro Non Può Insegnarti**

Siamo diretti sui limiti.

Questo libro ti ha insegnato:

- Cosa fa ogni servizio AWS principale
- Le analogie che li rendono intuitivi
- I compromessi tra le alternative
- La conoscenza dell'esame necessaria per SAA-C03
- Un framework per pensare alle decisioni architetturali

Questo libro non può insegnarti:

- **L'istinto operativo**: la sensazione viscerale che dice "questo diventerà strano sotto carico" prima di vederlo accadere. Questo deriva dall'operare sistemi reali.
- **Il giudizio tecnico sotto pressione**: decidere cosa fare alle 3 di notte quando il sistema è inattivo e hai informazioni incomplete. Questo deriva dagli incidenti.
- **L'intuizione sugli stakeholder**: sapere quando opporsi a un requisito di business perché il costo tecnico è troppo alto. Questo deriva dall'esperienza sia sul lato tecnico che su quello di business.
- **La domanda giusta per il contesto specifico**: Carlos riusciva a porre le domande giuste perché aveva visto problemi simili decine di volte. Quella conoscenza si guadagna, non si legge.

Non hai finito di imparare. Hai appena iniziato.

**L'Esame Non È la Destinazione**

Hai preso questo libro per prepararti all'esame AWS Solutions Architect Associate. È valido. La certificazione SAA-C03 è reale, apprezzata e apre porte.

Ma l'esame verifica la conoscenza e il riconoscimento dei pattern. Non verifica il giudizio. Non verifica l'esperienza operativa. Non verifica cosa fai quando l'architettura che hai costruito smette di funzionare alle 23:00 di un venerdì.

La certificazione è una credenziale di inizio. Quando superi l'esame, saprai come funzionano i servizi AWS e come si combinano. Avrai un framework per pensare all'architettura. Non lo avrai ancora fatto.

Il passo successivo dopo l'esame: costruisci qualcosa di reale. Deployalo. Operalo. Osservalo fallire. Correggilo. Esaurisci il budget su un servizio e sposta il costo altrove. Vieni chiamato nel mezzo della notte e prendi una decisione con informazioni insufficienti.

Così la conoscenza di questo libro diventa giudizio.

**L'Ultima Risposta di Maya**

Alla fine dell'incontro con gli investitori, il partner tecnico aveva un'ultima domanda.

"Se dovesse ricominciare oggi, sapendo quello che sa ora, cosa farebbe diversamente?"

Maya ci rifletté un momento.

"Inizierei con l'infrastructure as code dal primo giorno," disse. "Leo ha deployato la prima istanza EC2 manualmente. Ci sono voluti sei mesi per migrare tutto su Terraform. Sei mesi di debito tecnico che ci sono costati tempo reale."

"Altro?"

"Sarei più conservativa sui managed service all'inizio. Abbiamo usato DynamoDB quando un semplice database RDS sarebbe stato sufficiente per mesi. Il design del modello di accesso DynamoDB richiedeva un pensiero esperto che non avevamo ancora. Abbiamo ridisegnato lo schema due volte."

"Quindi più semplice è meglio all'inizio?"

"Più semplice è meglio *sempre*. La domanda è sempre: qual è la cosa più semplice che risolve il problema reale, non il problema futuro anticipato? Abbiamo aggiunto complessità per risolvere problemi che non avevamo ancora. Parte di quella complessità ha causato i propri problemi."

Il partner tecnico lo annotò.

"Ultima domanda," disse. "Qual è la cosa più importante che sa su come costruire su AWS che non sapeva quando ha iniziato?"

Maya pensò ai due anni. Gli incidenti. Le revisioni dei costi. La revisione Well-Architected. Le decisioni architetturali prese sotto pressione e quelle prese con cura. Quelle che avevano preso bene e quelle che avevano dovuto rifare.

"Che il cloud non risolve i problemi di architettura," disse. "Li amplifica. Una cattiva decisione on-premise può costarti una settimana. Una cattiva decisione nel cloud può costarti denaro ogni mese, su larga scala, finché qualcuno non se ne accorge."

Si fermò.

"Il cloud fa scalare le buone decisioni. E anche quelle cattive."

Quella sera, Maya raccontò a Tom, Priya e Leo della sessione con gli investitori.

"Ha chiesto dei database," disse. "Tutti."

"Quanto costa al mese?" chiese Tom immediatamente, che era esattamente la domanda sbagliata e anche quella giusta. "Ha chiesto del modello di costo?"

"Sì. Ho spiegato i Savings Plans, il passaggio di DynamoDB a provisionato. Ha annuito."

"E se qualcuno cerca di violare il sistema?" chiese Priya. "Sono venute fuori le domande sulla sicurezza?"

"IAM, cifratura, GuardDuty. Sì. Sembrava soddisfatto."

Leo era rimasto in silenzio. "Ha chiesto delle parti che non sono andate bene?"

"Ha chiesto cosa avrei fatto diversamente. Gli ho parlato di iniziare con l'infrastructure as code, e di essere più conservativa sui managed service all'inizio."

"Lo schema DynamoDB che abbiamo ridisegnato due volte," disse Leo. "Ho sempre pensato che fosse colpa mia."

"Era colpa di tutti noi," disse Maya. "Questo è il punto."

**Prima dell'Epilogo**

Hai imparato moltissimo. I servizi AWS. I compromessi. I pattern.

Ora fai qualcosa con quello che hai imparato.

Costruisci qualcosa. Fai errori intenzionalmente. Leggi i post-mortem (sono pubblici — AWS, Cloudflare, GitHub, Stripe li pubblicano tutti). Lavora con team che sono migliori di te nelle cose in cui sei più debole.

L'esame SAA-C03 verificherà se conosci il materiale. La tua carriera verificherà se sai applicarlo.

Entrambi valgono la pena. Nessuno dei due è la destinazione finale.

Non esiste una destinazione finale in questo campo. C'è solo il prossimo problema, la prossima decisione e l'abitudine di porre la prossima domanda giusta.

**Le Lezioni che Non Sono Finite nel Deck**

Sul treno di ritorno da Seattle, Maya raccontò a Leo e Priya due cose di cui era stata contenta che l'investitore non avesse chiesto direttamente — perché le risposte oneste avrebbero richiesto venti minuti ciascuna.

**L'incidente del pipeline di analytics.**

Otto mesi prima, il pipeline di analytics era accoppiato al servizio principale di elaborazione degli ordini. Gli eventi degli ordini venivano scritti nella stessa coda SQS che il pipeline di analytics consumava. L'accoppiamento sembrava ragionevole: l'analytics aveva bisogno dei dati degli ordini, l'elaborazione degli ordini produceva dati degli ordini.

Un mercoledì sera, un bug nell'aggregazione Lambda dell'analytics aveva fatto sì che smettesse di consumare dalla coda. La profondità della coda cresceva. Poiché il servizio di elaborazione degli ordini condivideva la stessa coda SQS per i suoi messaggi di conferma, sia il pipeline di analytics sia il percorso di conferma degli ordini stavano accumulando ritardi contemporaneamente. I partner ristoratori iniziavano a vedere ritardi nelle conferme. La coda SQS si avvicinava al limite di retention dei messaggi.

"Ho già deployato la correzione," aveva detto Leo, alle 23:00 di quella notte — e poi si era fermato. La correzione per il bug di analytics avrebbe richiesto un redeployment Lambda che avrebbe svuotato la coda, ma non aveva verificato se i messaggi di conferma dell'ordine nella coda fossero ancora entro il loro visibility timeout. Se il timeout fosse scaduto, la Lambda avrebbe rielaborato i messaggi, e i partner ristoratori avrebbero ricevuto conferme di ordine duplicate.

L'incidente era durato tre ore e aveva richiesto due rollback.

La lezione architetturale era semplice: analytics e elaborazione operativa non dovrebbero mai condividere la stessa coda. Hanno caratteristiche di prestazione diverse, modi di guasto diversi e conseguenze diverse quando falliscono. Accoppiarle significava che un guasto nel percorso a priorità inferiore poteva degradare il percorso a priorità superiore.

Dopo l'incidente, Nimbus aveva separato completamente i pipeline. Gli eventi degli ordini andavano in una coda operativa dedicata. Una regola EventBridge separata duplicava gli eventi in una coda solo per analytics. I due pipeline non avevano infrastruttura condivisa eccetto la fonte degli eventi. La volta successiva che la Lambda di analytics aveva un bug — e lo ebbe, due mesi dopo — fallì silenziosamente, la coda di analytics si accumulò, i report del mattino erano in ritardo, e il percorso di conferma degli ordini fu completamente incolume.

"Separazione degli ambiti," aveva detto Priya, dopo il secondo bug della Lambda di analytics. "Stesso principio a livello di infrastruttura che a livello di codice. Due cose che falliscono in modo diverso non dovrebbero condividere lo stesso dominio di guasto."

**L'astrazione prematura.**

Tre mesi prima del Series A, Leo aveva proposto di costruire un servizio generico di configurazione dei ristoranti. Nimbus aveva tre tipi di configurazione specifica per ristorante all'epoca: impostazioni del menu, parametri della zona di consegna e preferenze di notifica. Un servizio di configurazione generico, aveva argomentato Leo, avrebbe permesso di aggiungere nuovi tipi di configurazione senza costruire ogni volta nuova logica di storage e recupero.

Il team lo aveva costruito. Due settimane per progettare il modello dati. Una settimana per implementare il servizio. Un'altra settimana per migrare i tre tipi di configurazione esistenti. Quattro settimane in totale.

Quando avevano finito di costruire il servizio di configurazione generico, avevano... tre tipi di configurazione. Gli stessi tre di prima. Il servizio generico non aggiungeva nessuna nuova capacità; rendeva solo la capacità esistente più difficile da capire. Lo schema chiave-valore che rendeva il servizio "generico" rendeva anche impossibile aggiungere validazione o vincoli di tipo senza costruire un registry di schemi sopra di esso.

"Abbiamo costruito un framework per una libreria," disse Tom, quando raccontò la storia dell'investitore a Leo.

"Cosa significa?" chiese Leo.

"Avevamo tre libri. Abbiamo costruito un sistema di gestione della biblioteca per organizzarli. Sarebbe stato meglio mettere semplicemente i tre libri su uno scaffale."

Il servizio di configurazione era stato silenziosamente dismesso otto mesi dopo, quando il team era cresciuto abbastanza che quattro ingegneri avevano trascorso tempo non trascurabile a imparare come funzionava prima di scoprire che era un sottile wrapper attorno a una tabella DynamoDB. Erano tornati all'accesso DynamoDB diretto con schemi tipizzati per tipo di configurazione in due giorni.

"Quattro settimane per costruirlo," disse Tom. "Due giorni per disfarlo. Più il costo continuo di spiegarlo a ogni nuovo ingegnere."

"Qual era la scelta giusta?" chiese Priya.

"Costruire il servizio di configurazione quando hai più di dieci tipi di configurazione e il pattern è chiaramente stabile," disse Tom. "Non quando ne hai tre e stai speculando sui bisogni futuri. L'astrazione era prematura. I bisogni per cui era stata progettata non si sono materializzati."

"Abbiamo pensato a cosa succede se costruiamo astrazioni prima di capire il dominio del problema?" chiese Priya.

"L'abbiamo appena descritto," disse Tom. "Passi tempo a mantenere un'astrazione che costa più del problema che stava risolvendo."

Maya aggiunse questo al suo modello mentale di anti-pattern architetturali: il servizio generico costruito per tre casi d'uso. Il pipeline accoppiato. La decisione di ridimensionamento presa su una finestra di osservazione insufficiente. Ognuno era una decisione che aveva senso localmente, nel momento, con le informazioni disponibili. Ognuno si era rivelato sbagliato in modi che erano diventati visibili solo in seguito.

"Quelli che sembrano bene sulla carta," disse a Priya, "sono quelli che ti costano di più."

"Perché non li riesamini," disse Priya. "Guardi il design, è coerente, la logica regge, e vai avanti. Il modo di guasto è invisibile finché il sistema non è sotto un carico o uno stress che la versione cartacea non aveva mai modellato."

"Per questo la revisione architetturale è importante," disse Maya. "Non perché il revisore ne sappia di più. Perché farà la domanda che non hai pensato di fare."


## Riepilogo

L'incontro con gli investitori era andato bene. Non perché Maya avesse memorizzato la struttura dei prezzi di ogni servizio, ma perché riusciva a rispondere *perché* per ogni scelta che Nimbus aveva fatto. Le risposte "dipende" che aveva dato erano precise, condizionali e radicate nelle stesse quattro domande che aveva posto, in varie forme, per due anni.

- **"Dipende" è l'inizio della risposta**, non la fine. Completa sempre la frase con le condizioni da cui dipende.
- Le quattro domande sotto ogni compromesso architetturale: modello di accesso, scala, conseguenza del guasto, vincolo di costo.
- I pattern che durano: separazione degli ambiti, difesa in profondità, paga per quello che usi, ottimizza per il guasto probabile, misura prima di ottimizzare.
- **Il cloud amplifica le decisioni** — quelle buone e quelle cattive. Una cattiva decisione on-premise costa una settimana; una cattiva decisione nel cloud si accumula mensilmente, su larga scala.
- La certificazione SAA-C03 verifica la conoscenza e il riconoscimento dei pattern. L'esperienza di produzione trasforma quella conoscenza in giudizio.

## Suggerimenti per l'Esame

*Dominio SAA-C03: Cross-domain — tutti i domini*

Questo capitolo chiude il contenuto dell'esame di questo libro. Prima di sostenere l'esame:

**Ripassa i servizi su cui ti senti meno sicuro**:

- Per la maggior parte delle persone: Kinesis vs SQS (la distinzione stream vs coda)
- Networking VPC (route table, subnet, NAT Gateway, Internet Gateway)
- Logica di valutazione delle policy IAM (deny esplicito > allow esplicito > deny implicito)
- Selezione delle classi di storage (conosci tutte e otto le classi di storage S3 e i loro compromessi)
- RDS vs Aurora vs DynamoDB per casi d'uso specifici

**Conosci la struttura tipica degli scenari dell'esame**:

L'SAA-C03 presenta un requisito di business ("l'azienda necessita di una disponibilità del 99,99%") e ti chiede di identificare l'architettura che lo soddisfa. Leggi sempre il requisito, identifica il vincolo chiave ed elimina le opzioni che non lo soddisfano.

**Esercitati nell'identificazione dei distrattori**:

Ogni risposta sbagliata nell'esame è sbagliata per un motivo specifico. Imparare *perché* ogni risposta sbagliata è sbagliata è più prezioso che memorizzare le risposte corrette.

**L'esame premia il riconoscimento dei pattern**:

- "Decouple" → SQS/SNS
- "Serverless" → Lambda, DynamoDB, Aurora Serverless
- "Global low latency" → CloudFront, Global Accelerator, Global DynamoDB, Aurora Global
- "Compliance/auditing" → CloudTrail, Config, Security Hub, Macie
- "Cost optimization" → Spot Instance, Savings Plans, lifecycle policy, ridimensionamento

**Sei pronto**. Non perché questo libro abbia coperto tutto — niente lo fa. Ma perché capisci i principi abbastanza bene da ragionare verso la risposta anche quando non riconosci immediatamente lo scenario esatto.

## Esercizi

**Esercizio Finale**

Non ci sono altre domande d'esame strutturate dopo questo capitolo.

Invece: una sola domanda aperta.

Quale sistema costruiresti oggi, sapendo quello che sai?

Scrivilo. Abbozza l'architettura. Identifica i servizi. Annota i compromessi che faresti e perché. Anticipa i modi di guasto.

Poi costruiscilo.

Questo è il compito. Non c'è scadenza. Non c'è voto. C'è solo il lavoro.

## Scena Post-Crediti

L'investimento arrivò.

Series A. 4 milioni di dollari. Abbastanza per espandersi in cinque nuove città, triplicare il team di ingegneria e costruire Nimbus Instant.

Quella sera, Maya era al ristorante di famiglia. Quello originale. Quello dove era nata Nimbus, quando si era resa conto che stavano perdendo ordini perché il telefono era sempre occupato.

Ordinò un'arepa — lo stesso piatto che ordinava sempre.

Mentre aspettava, aprì il laptop e lesse il primo capitolo di questo libro.

*"Dove vive un sito web?"*

Si ricordò di non sapere la risposta.

Sorrise.

Chiuse il laptop.

Arrivò il cibo.

Era perfetto.

Nel prossimo capitolo: cosa cambia quando il lavoro non è più costruire il sistema — ma esserne responsabili.
