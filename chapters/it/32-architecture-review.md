# Capitolo 32: Difendere il Piano

La domanda di Maya alla fine del Capitolo 31: "Qual è la differenza tra prendere decisioni architettoniche e pensare come un architetto?"

Aveva invitato un ospite per aiutarla a rispondere.

Si chiamava Carlos. Era stato un ingegnere per 20 anni, un responsabile di ingegneria per sette e un consulente per startup per tre. Era il tipo di persona che aveva visto abbastanza sistemi avere successo e fallire per aver calibrato gli istinti su entrambi.

Arrivò senza nulla: senza presentazioni, senza agenda. Solo una penna per lavagna e una domanda.

"Parlami di Nimbus," disse.

Una buona revisione architettonica è come una lista di controllo pre-volo per un pilota. L'aereo potrebbe sembrare perfettamente pronto a volare - motori in funzione, carburante pieno, passeggeri a bordo. Ma la lista di controllo esiste perché i piloti esperti sanno che le cose più probabili a causare problemi sono proprio quelle che sembrano andare bene fino a quando non diventano tali. La lista di controllo non significa che il pilota non sappia cosa sta facendo. Significa che ha interiorizzato che anche gli esperti possono mancare le cose quando saltano il processo strutturato.

**Il Primo Movimento dell'Architetto**

Quello che accadde dopo sorprese il team.

Maya iniziò a descrivere il sistema - istanze EC2, Aurora, CloudFront, ElastiCache, DynamoDB per il menu, VPC con subnet private...

Carlos la fermò gentilmente.

"Inizia con il business," disse. "Non con la tecnologia."

Lei fece una pausa. Poi: "Nimbus è una piattaforma di ordinazione di ristoranti. Abbiamo 287 partner ristoranti. Elaboriamo circa 4.200 ordini al giorno. Il valore medio dell'ordine è di 34 dollari. Stiamo crescendo dell'18% trimestre su trimestre."

"Bene. Qual è la cosa più importante che Nimbus deve fare?"

"Elaborare gli ordini," disse Leo.

"Specificamente," insistette Carlos.

"Un ordine deve raggiungere il ristorante entro cinque secondi dal momento in cui viene effettuato, altrimenti la cucina perde la finestra temporale," disse Priya, "e il cliente si lamenta. Perdi un partner ristorante."

"Cosa succede se non lo fa?"

"Il ristorante commette un errore. Il cliente riceve il cibo sbagliato o aspetta troppo a lungo. Si lamenta. Perdi un partner ristorante."

"Quindi la SLA di cinque secondi," disse Carlos, "non è un obiettivo tecnico. È un requisito di sopravvivenza aziendale."

Silenzio.

"Questo," disse, "è il motivo per cui le conversazioni sull'architettura devono iniziare con i requisiti aziendali. La tecnologia è a valle del vincolo."

**La Struttura della Revisione Architettonica**

Una vera revisione architettonica - quella che avviene prima di costruire qualcosa di importante, o quando si valuta se aumentare - ha una struttura.

Carlos la scrisse sulla lavagna:

**1. Comprendere i vincoli**

Cosa deve essere vero? Cosa non può accadere? (Non "cosa vogliamo". Quali sono i requisiti non negoziabili?)

**2. Comprendere le incognite**

Cosa non sappiamo? Dove stiamo facendo delle assunzioni? Cosa succede se quelle assunzioni sono sbagliate?

**3. Valutare le opzioni**

Quali sono le alternative realistiche? Quali sono i compromessi di ciascuna?

**4. Identificare i modi di guasto**

Come si rompe? Qual è la sequenza di eventi quando ogni modalità di guasto innesca?

**5. Validare il monitoraggio**

Come saprai quando qualcosa è sbagliato? Prima che gli utenti te ne informino?

**6. Definire il manuale operativo**

Cosa fa qualcuno a mezzanotte quando questo si rompe?

Questo non è un elenco di controllo da seguire meccanicamente. È un quadro di riferimento di pensiero. L'obiettivo è garantire che le domande importanti vengano poste *prima* che tu sia in produzione.

**Esecuzione della Revisione: Le Nuove Funzionalità di Nimbus**

Carlos era stato invitato specificamente perché Nimbus stava per costruire qualcosa di nuovo.

**La funzionalità:** "Nimbus Instant" - una garanzia di consegna di 15 minuti. Se un partner ristorante non soddisfa la finestra temporale di 15 minuti più di una volta alla settimana, Nimbus avrebbe automaticamente rimborsato il cliente.

"Riprendimi in mano i requisiti tecnici," disse Carlos.

Priya iniziò. "Abbiamo bisogno di un tracciamento in tempo reale dall'ordine di collocazione alla consegna. Abbiamo bisogno di confrontare il tempo di consegna effettivo con la SLA di 15 minuti. Abbiamo bisogno di attivare i rimborsi automaticamente."

"Qual è il requisito di latenza per i dati di tracciamento?"

"Quasi in tempo reale. I clienti vedono gli aggiornamenti dello stato sul loro telefono."

"In quanto tempo?"

"Circa cinque secondi."

"Circa cinque secondi?"

"Sì, circa cinque secondi. Questo è il requisito di prodotto."

"Bene. Usiamo Kinesis per il flusso di eventi. Qual è il modo di guasto se Kinesis è in ritardo?"

"Gli aggiornamenti di stato sono in ritardo per il cliente."

"È accettabile?"

"Per 10 secondi? Probabilmente. Per 60 secondi? No."

"Quindi qual è la SLA per il sistema di tracciamento?"

Priya guardò Leo. "Non ce l'abbiamo ancora."

Carlos scrisse sulla lavagna: *Sconosciuta: SLA di tracciamento.*

"Questo conta," disse. "Perché la SLA determina il design dell'infrastruttura. Se la tua SLA è di 5 secondi, hai bisogno di una soluzione diversa rispetto a quando è di 60 secondi."

**Le Domande che gli Architetti Si Ponettono**

Durante le successive due ore, Carlos guidò il team attraverso la revisione. Una selezione delle sue domande:

**Sul storage dei dati:**

"Dove viene memorizzato lo stato dell'ordine durante l'elaborazione? Se l'applicazione cade a metà consegna, qual è il processo di ripristino? Puoi ricostruire lo stato dai soli eventi?"

"Il rimborso viene attivato automaticamente. Cosa impedisce l'emissione di un rimborso due volte? E se il processore di pagamento va in timeout e non si è sicuri che il rimborso sia stato accettato?"

**Sul tracciamento delle consegne**:

"Si fa affidamento sui dati GPS del corriere. Cosa succede se il segnale GPS viene perso per 90 secondi? Come si distingue 'segnale GPS perso' da 'consegna in corso' da 'problema di consegna'?"

**Sul trattamento dei fallimenti**:

"Se il servizio di rimborso è inattivo, l'ordine va comunque avanti? Il cliente riceve comunque il suo cibo? Qual è l'esperienza utente durante un guasto parziale del sistema?"

**Sull'osservabilità**:

"Come si sa esattamente ora quanti ordini sono attualmente entro 5 minuti dal SLA di 15 minuti? Se quel numero aumenta bruscamente, chi viene notificato?"

Queste domande hanno rivelato un'assunzione che il team aveva fatto senza rendersene conto.

"Non avevamo pensato al problema dei rimborsi doppi", ha detto Leo successivamente. "Stavamo semplicemente chiamando l'API di pagamento."

"Non è sbagliato", ha detto Priya. "Ma hai bisogno di idempotenza. L'operazione di rimborso deve essere sicura da chiamare due volte."

"Una chiave di idempotenza — un ID univoco per ogni tentativo di rimborso, memorizzato in un DB prima di chiamare l'API di pagamento. Se chiamiamo due volte con la stessa chiave, l'API di pagamento ignora la seconda chiamata."

"Il che significa", ha aggiunto Carlos, "che hai bisogno di un repository di stato persistente per le operazioni di rimborso, non solo un evento in una coda."

Questo è il tipo di dettaglio architettonico che emerge in una revisione strutturata — e spesso non emerge quando si sta semplicemente costruendo.

**Il Record Decisione Architetturale**

Dopo la revisione, Carlos ha raccomandato al team di documentare le loro decisioni in **Record Decisione Architetturale (ADR)** — brevi documenti che catturano:

- **Quale decisione è stata presa**
- **Quali alternative sono state prese in considerazione**
- **Perché questa decisione è stata presa (il contesto e i vincoli al momento)**
- **Quali sono i compromessi**
- **Cosa ci farebbe tornare indietro a rivedere questa decisione**

"Gli ADR sono per il tuo futuro sé", ha detto Carlos. "In 18 mesi, guarderai un'architettura e ti chiederai perché è stata fatta in quel modo. Se hai un ADR, capirai il contesto. Se non ce l'hai, lo lascerai stare (perché hai paura di toccarlo) o lo modificherai (perché non capivi perché era stato fatto in quel modo)."

Leo ha scritto il primo ADR quel pomeriggio: la decisione di utilizzare Kinesis per gli eventi di tracciamento delle consegne, con il contesto, le alternative prese in considerazione (SQS, EventBridge, polling) e i compromessi.

**Cosa Rende un Architetto**

Alla fine della sessione, Maya ha chiesto a Carlos la domanda originale: "Qual è la differenza tra prendere decisioni architettoniche e pensare come un architetto?"

Ci ha pensato.

"Un architetto non sa più tecnologia di un ingegnere senior", ha detto. "Un buon architetto probabilmente conosce un po' meno i framework più recenti. Ma un architetto ha un insieme di domande predefinite diverso."

"Cosa intendi?"

"Quando sei un ingegnere senior che guarda una nuova funzionalità, le tue prime domande sono di solito: 'Cosa costruiamo? Come funziona? Qual è la migliore libreria per questo?' Quando un architetto guarda la stessa funzionalità, le prime domande sono: 'Quale problema risolve questo? Cosa va in crash quando il traffico raddoppia? Come sappiamo quando è degradato? Qual è l'esperienza utente quando il processore di pagamento è lento?'"

"L'architetto chiede sul sistema sotto stress", ha detto Leo.

"E sulle conseguenze aziendali di ogni guasto", ha aggiunto Priya.

"E", ha detto Tom, "cosa succede al conto quando questo scala."

Carlos ha annuito. "Tutti voi state già facendo questo. Lo state facendo da quando è il capitolo 1. La differenza tra un ingegnere senior e un architetto non è una certificazione o un titolo. È un'abitudine di porre la prossima domanda — quella che rivela la cosa che non hai ancora pensato."

## Punti di Forza e Limitazioni

**Revisioni architettoniche**:

- Catturano i modi di fallimento prima che siano in produzione
- Creano una comprensione condivisa tra i membri del team che spesso hanno conoscenze frammentate
- Generano documentazione che dà frutti per anni
- Rallentano le decisioni in modi benefici — "vai veloce" senza una revisione è "vai veloce e colpiti contro il muro che non hai visto"

**Dove diventano complicate**:

- Richiedono qualcuno abbastanza abile da porre le domande giuste — la revisione è valida quanto il revisore
- Possono diventare burocratiche se trattate come un controllo di spunta piuttosto che una conversazione
- Alcune decisioni architettoniche non hanno bisogno di una revisione completa — sapere quali ce ne hanno è di per sé un'abilità architettonica
- L'output (ADR, diagrammi, registri di decisioni) deve essere mantenuto man mano che il sistema evolve

Nel prossimo capitolo: la risposta più utile, frustrante e onesta in tutta l'ingegneria del software.

## Riepilogo

- Le revisione architettoniche iniziano con i **requisiti aziendali**, non dalla tecnologia.
- La struttura della revisione: vincoli → incognite → opzioni → modalità di guasto → monitoraggio → manuali operativi.
- Gli architetti pongono domande come: "Cosa si guasta per primo? Come sappiamo che è degradato? Qual è l'esperienza utente durante il guasto? Qual è il costo su larga scala?"
- **Architetture Decisionali (ADR)** catturano ciò che è stato deciso, perché e cosa causerebbe una riesame.
- Pensare come un architetto è un'abitudine: porre la prossima domanda, soprattutto riguardo alle modalità di guasto, alle conseguenze aziendali e all'economia della scala.
- La differenza tra prendere decisioni e essere un architetto è l'insieme predefinito di domande: gli architetti hanno un insieme predefinito di domande a livello di sistema e di guasto, non solo domande di implementazione.

## Consigli per l'Esame

*Dominio SAA-C03: Cross-domain — ragionamento architettonico*

Questo capitolo è meno incentrato su argomenti specifici dell'esame e più sul modo di pensare che l'esame valuta.

- I **scenari SAA-C03** descrivono quasi sempre un vincolo aziendale ("l'azienda non può permettersi più di 1 ora di downtime") e ti chiedono di selezionare l'architettura che lo soddisfa. Pratica la traduzione dei vincoli aziendali in requisiti tecnici.
- **Pensiero sulle modalità di guasto**: Molti dei quesiti dell'esame descrivono un sistema e ti chiedono cosa succede quando un componente fallisce. Pratica ponendo la domanda "cosa si guasta per primo?" per le architetture che incontri.
- **Pensiero sui compromessi**: L'esame raramente offre una "risposta perfetta". Ti chiede di fornire la *migliore* risposta date un insieme di vincoli. Impara ad accettare che "questa opzione è corretta date questi requisiti specifici, anche se un'altra opzione sarebbe migliore sotto diversi requisiti."
- **Idempotenza**: Il problema del doppio rimborso è una vera sfida dei sistemi distribuiti. Le chiavi idempotenti (uniche per ogni operazione, controllate prima dell'esecuzione) sono la soluzione standard. Conosci questo pattern.
- **Architetture Decisionali**: Non è un servizio AWS, ma una best practice che riflette il pilastro dell'Eccellenza Operativa del Framework Well-Architected.

## Esercizi

**Esercizio 1 — Ricordo**

Leo ha posto sei tipi di domande durante la revisione architettonica. Puoi ricostruire le sei aree senza guardare il capitolo?

*(Suggerimento: sono elencate nella sezione "Struttura della revisione architettonica". Cerca di ricordare le aree da solo — il semplice tentativo di ricordare (anche se fallisci) rafforza la ritenzione a lungo termine.)*

**Esercizio 2 — Esercitazione per l'Esame**

*Scenario*: Un'azienda sta costruendo un sistema di gestione delle offerte in tempo reale per la pubblicità online. Le offerte devono essere valutate e risposte entro 100 millisecondi. Il sistema elabora 1 milione di offerte al secondo a picco. Se il sistema di offerte è inattivo, l'azienda perde entrate pubblicitarie. Il team di database dell'azienda propone di utilizzare RDS Aurora con 10 replica di lettura. Il soluzionista architettonico deve valutare questa proposta.

Quale preoccupazione dovrebbe sollevare per prima il progettista?

A) Il costo di 10 replica Aurora di lettura è troppo alto per il budget
B) Le replica Aurora di lettura hanno un ritardo di replica che potrebbe causare problemi di coerenza
C) La latenza tipica delle query di Aurora di 1-5ms potrebbe non soddisfare la SLA di 100ms
D) RDS Aurora non supporta i volumi di transazione di 1 milione di richieste al secondo a questa latenza richiesta

**Suggerimento 1**: Il vincolo primario è 100ms di tempo di risposta totale a 1 milione di richieste/secondo. Quale di queste preoccupazioni minaccia direttamente il raggiungimento di questo vincolo?

**Suggerimento 2**: La latenza delle query di Aurora è tipicamente 1-5ms. 1-5ms per la query di database lascia 95-99ms per la rete, la logica dell'applicazione e la serializzazione. Il vincolo di 100ms è a rischio?

**Suggerimento 3**: Aurora può gestire IOPS elevati, ma 1 milione di richieste al secondo è un tasso straordinario. Cosa succede all'architettura a quella scala?

**Risposta**: D

**Spiegazione**: Sebbene Aurora sia ad alte prestazioni, 1 milione di richieste al secondo a 100ms di tempo di risposta totale è un requisito estremo. L'architetto dovrebbe per prima cosa mettere in discussione se Aurora (o qualsiasi database relazionale) può servire come sistema di lookup primario a questa scala e latenza. Sistemi come questo tipicamente utilizzano archivi in memoria (Redis) o database a bassa latenza specializzati, non database relazionali con la piena semantica SQL. Il vincolo di 100ms è raggiungibile per le query di Aurora da sole, ma la combinazione di 1M RPS e 100ms di tempo di risposta totale supera le caratteristiche di throughput tipiche di Aurora.

**Perché non A?** Il costo è una preoccupazione valida, ma la prima preoccupazione dovrebbe essere se l'architettura è tecnicamente fattibile ai requisiti dichiarati.

**Perché non B?** Il ritardo di replica in Aurora read replicas è tipicamente <100ms — accettabile per la maggior parte dei casi d'uso. I problemi di coerenza sono reali, ma secondari alla questione di fattibilità.

**Perché non C?** La latenza di Aurora di 1-5ms è ben all'interno della 100ms SLA per la parte di query del database. Questo non è la preoccupazione principale.

*Dominio SAA-C03: Cross-domain — progettazione di sistemi*

**Esercizio 3 — Sfida di Architettura** *(Opzionale)*

Applica la struttura della revisione architettonica a un sistema reale o ipotetico:

Un'azienda di startup vuole sviluppare un gioco di trivia multiplayer in tempo reale. I giocatori si uniscono alle stanze di gioco (fino a 10 giocatori per stanza). Ogni round mostra una domanda per 15 secondi; tutti i giocatori rispondono simultaneamente. I punteggi vengono tabulati istantaneamente dopo ogni domanda. I giochi durano 10 round. Utilizzo di picco: 50.000 giochi simultanei.

Procedete attraverso la revisione in sei fasi:

1. Quali sono i vincoli inderogabili?
2. Quali sono gli incerti e le assunzioni?
3. Quali sono le opzioni tecnologiche realistiche?
4. Quali sono i modi di fallimento?
5. Come saprete quando è degradato?
6. Come appare il manuale di emergenza per le 3 del mattino?

*(Non esiste una risposta corretta univoca. L'obiettivo è esercitarsi con la struttura di revisione come strumento di pensiero.)*

## Scena Post-Crediti

Carlos lasciò l'ufficio alle 18:00.

Il team rimase seduto per un po' dopo, senza fare nulla di particolare.

"Mi sembra di aver imparato più in quelle due ore che in qualsiasi capitolo dedicato a un singolo servizio AWS," disse Leo.

"Questo perché quei capitoli erano sui tool," rispose Maya. "Questo era sul giudizio."

"Il giudizio è insegnabile?" chiese.

"Sì," rispose Priya. "Ma non leggendo. Attraverso la pratica. Prendendo decisioni, vedendo cosa si rompe, pensando al perché."

"Attraverso l'esperienza," disse Tom.

"Attraverso un'esperienza strutturata," corresse Priya. "L'esperienza senza riflessione non costruisce il giudizio. Bisogna porre le domande dopo."

Maya guardò la lavagna. Gli appunti di revisione erano ancora lì: vincoli, incerti, modi di fallimento, domande di monitoraggio. Riempivano due lavagne.

"Questo dovrebbe andare nell'ADR," disse.

Leo stava già digitando.

Nel capitolo finale: l'unica cosa che nessun tool o framework può darti – e perché "dipende" è la risposta più onesta e potente nell'architettura del software.
