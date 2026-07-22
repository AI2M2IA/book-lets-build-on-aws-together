# Capitolo 29: Il Conto del Database

Tom stampò i grafici di utilizzo. Quattordici pagine. Le sparse sulla scrivania prima di fidarsi abbastanza di sé stesso da leggere i numeri. Meglio vedere tutto insieme che trovare sorprese a metà pagina.

L'audit dello storage aveva portato alla luce $6.700 in sprechi accumulati — non da decisioni sbagliate, ma da disattenzione. Volumi non collegati, snapshot vecchie, cronologie di versioni che nessuno aveva detto a S3 di pulire, upload multipart incompleti che si stavano accumulando silenziosamente da mesi. Tom aveva sistemato tutto, implementato regole di pulizia automatica, e si era spostato alla scheda successiva del foglio di calcolo. Il data tier era la più grande incognita rimasta: database relazionali, tabelle NoSQL, nodi di cache, storage di backup, e una voce che lo tormentava da settimane.

Le voci del data tier in esame:

Cluster Aurora: $647/mese.
Read replica RDS PostgreSQL legacy: $340/mese.
Tabelle DynamoDB: $340/mese.
ElastiCache: $185/mese.
Snapshot manuali Aurora: $87/mese.

Totale data tier in esame: $1.599/mese.

"Voglio capire ciascuna voce prima di decidere qualsiasi cosa," disse. "Perché il database non è il posto in cui risparmiare tagliando gli angoli."

Era un atteggiamento saggio. Una configurazione errata del database che causa perdita di dati o degrado delle performance costa molto più dei risparmi ottenuti.

Pensa a un database come al motore di un'auto. Puoi risparmiare denaro su un'auto passando a carburante più economico, regolando la pressione degli pneumatici e rimuovendo peso inutile dal bagagliaio. Ma se cerchi di risparmiare saltando il cambio olio, rischi di bruciare il motore — e un motore bruciato costa molto più di qualsiasi risparmio sul carburante. L'audit che Tom sta per eseguire segue la stessa logica: trovare gli sprechi nel bagagliaio e nel serbatoio, e lasciare il motore in pace finché non sai esattamente cosa stai facendo.

**Capire Prima il Tuo Workload di Database**

L'ottimizzazione dei costi nei database richiede di capire il workload prima di toccare qualsiasi cosa. Tom aveva imparato questa lezione da un quasi-incidente sei mesi prima: aveva iniziato a ridurre la dimensione dell'istanza database basandosi sull'utilizzo medio della CPU — 18% — senza prima guardare i valori p95. Un collega gli aveva chiesto di controllare più attentamente le metriche di CloudWatch. La CPU al p95 era al 61%, e durante una particolarmente intensa cena del venerdì sera, aveva raggiunto l'84%.

"La media non ti dice cosa succede al picco," disse Tom, quando lo raccontò a Priya. "Se avessi fatto il right-sizing sulla media, saremmo stati throttled il venerdì sera."

"Per questo guardi il p95, non la media," disse Priya. "Sempre."

Quel principio si estendeva oltre la CPU. Tom aveva ora una checklist standard pre-audit:

- CPU: p95, non la media
- Memoria: FreeableMemory (in byte assoluti, non percentuale) — quanto siamo vicini al limite?
- Connessioni: massimo di DatabaseConnections negli ultimi 30 giorni — quanto ci siamo avvicinati al limite di connessioni?
- Rapporto lettura/scrittura: determina se le read replica stanno guadagnando il loro costo
- Tasso di crescita dello storage: quanti GB al mese stiamo aggiungendo?
- Replication lag (per le replica): la replica tiene il passo?

Domande chiave:

- Qual è l'utilizzo medio e di picco della CPU?
- Qual è il rapporto lettura/scrittura?
- Lo storage sta crescendo, rimanendo stabile, o diminuendo?
- Le read replica vengono utilizzate?
- L'istanza è sotto-provisioned (causando rallentamenti) o sovra-provisioned (pagando per capacità inattiva)?

Tom aprì le metriche di CloudWatch per tutti e tre i servizi di database nei 30 giorni precedenti:

**Cluster Aurora**:

- CPU media: 18% (p95: 61%; picco: 84% il venerdì sera)
- FreeableMemory: costantemente sopra i 4GB degli 8GB disponibili. Non è un problema.
- Rapporto lettura/scrittura: 14:1 (lettura-intensiva)
- Storage: 180GB (in crescita di ~5GB/mese)
- Massimo di DatabaseConnections: 312 su 1.000 disponibili. Confortante.

**Read replica (RDS PostgreSQL, separate da Aurora)**:

- Erano due read replica RDS legacy create prima della migrazione ad Aurora, ancora in esecuzione.
- Connessioni medie su ciascuna: 2 al giorno. CPU media: 3%.
- FreeableMemory: 7,2GB degli 8GB disponibili. Le istanze erano quasi completamente inattive.

"Perché queste sono ancora in esecuzione?" chiese Tom.

"L'avevo già deployed — oh," disse Leo. Guardò le date di creazione delle istanze. "Erano per il fallback durante la migrazione ad Aurora. Non le ho mai eliminate."

Quel momento — quando qualcosa di costoso è in esecuzione da mesi senza essere usato — è familiare negli ambienti cloud. Leo aveva creato le replica come rete di sicurezza. La rete di sicurezza non era mai stata necessaria. Ma nessuno aveva fatto la domanda fino ad allora.

"Com'è la situazione del connection pool?" chiese Priya, avvicinandosi. "Prima di eliminarle, qualche componente dell'applicazione sta ancora instradando letture lì?"

Tom controllò i log delle connessioni. Le due connessioni al giorno provenivano da uno script di monitoraggio che Priya aveva scritto quattordici mesi prima — interrogava tutti gli endpoint di database noti per verificare che stessero rispondendo. Le replica venivano interrogate solo dall'health checker, non da alcun traffico applicativo reale.

"Eliminale," disse Maya.

Le replica furono terminate. Risparmio mensile: $340.

**Il Quasi-Incidente del Connection Pool**

Mentre aveva aperte le metriche delle connessioni, Tom eseguì un controllo più ampio su tutti gli endpoint di database. Quello che trovò lo fece fermare.

L'endpoint writer di Aurora mostrava un massimo di DatabaseConnections pari a 312. Confortante. Ma l'endpoint reader raccontava una storia diversa.

"L'endpoint reader ha raggiunto 847 connessioni in tre venerdì sera consecutivi," disse Tom.

"Qual è il limite?" chiese Priya.

"Il limite per la nostra attuale classe di istanza è 1.000. Siamo arrivati a 847. Che è l'85% del limite."

"E non l'abbiamo notato perché l'allarme scattava solo al 90%?" chiese Maya.

"Non scattava affatto," disse Tom. "Non c'è alcun allarme CloudWatch sull'endpoint reader per le connessioni. L'ho scoperto solo perché stavo guardando le metriche grezze."

A 1.000 connessioni, il database rifiuta le nuove connessioni. Qualsiasi thread dell'applicazione che tenti di acquisire una connessione al database in quel momento genera un'eccezione. Se quell'eccezione non viene gestita in modo elegante, l'utente vede un errore 500.

"Eravamo a trenta secondi da un incidente venerdì sera," disse Leo. "Tre volte di fila."

"Abbiamo considerato cosa succede quando quella soglia viene superata?" chiese Priya.

"I partner ristoratori vedono gli ordini fallire durante la cena del venerdì," disse Maya. "Non è una preoccupazione teorica."

Tom impostò immediatamente un allarme CloudWatch: avviso a 750 connessioni (75% del limite), pager a 900 (90%). Implementò anche RDS Proxy per l'endpoint reader — RDS Proxy raggruppa e gestisce le connessioni al database dal livello applicativo, il che significa che cinquanta thread dell'applicazione possono condividere dieci connessioni al database. Il proxy gestisce il multiplexing. Il database vede molte meno connessioni anche quando l'applicazione è sotto carico elevato.

"Per Aurora Serverless v2, RDS Proxy è prezzato a $0,015 per ACU per ora, con un costo minimo di 8 ACU per proxy," disse Tom. "Ma se una violazione del limite di connessioni causa anche solo una parziale interruzione un venerdì sera, il costo reputazionale per Nimbus è di ordini di grandezza superiore."

"Quanto costa al mese?" si chiese Tom, eseguendo il calcolo. Il loro reader gira su Serverless v2, quindi il proxy fattura sul minimo di 8 ACU: $0,015 × 8 × 730 = $87,60/mese. Era un costo che era felice di pagare.

Potresti chiederti: se stiamo già risparmiando con la scalabilità automatica di Serverless v2, perché preoccuparsi delle Reserved Instances per il tier provisioned? La risposta è che la scalabilità di Serverless v2 ha un costo — paghi per ACU-ora che tu lo abbia pianificato o meno. Per i team che eseguono configurazioni Aurora fisse, l'impegno RI converte il costo variabile in costo prevedibile. Per i team che eseguono istanze provisioned (non Serverless v2), quella distinzione conta in modo significativo.

**RDS Reserved Instances: Per i Tier di Database Provisioned**

Come EC2, RDS offre Reserved Instances per l'utilizzo su base di impegno.

Per i team che usano configurazioni di istanza Aurora fisse (non Serverless v2), le Reserved Instances possono far risparmiare dal 30 al 60%. Ecco come funziona l'approccio RI provisioned: ti impegni per un tipo di istanza specifico per 1 o 3 anni in cambio di uno sconto significativo sulla tariffa oraria.

A titolo illustrativo: un'istanza writer db.r6g.large a $0,26/ora On-Demand costa $190/mese. Una Reserved Instance annuale per la stessa riduce a circa $108/mese — risparmiando $82/mese per istanza, ovvero quasi $1.000 all'anno per istanza di database.

**Aurora Serverless v2 vs RI Standard — Il Punto di Pareggio**

Tom calcolò i numeri per la loro specifica configurazione Aurora. La domanda era: la scalabilità automatica di Aurora Serverless v2 stava fornendo un beneficio sufficiente, oppure un'istanza provisioned fissa con un impegno Reserved Instance sarebbe stata più economica?

Prezzo di Serverless v2: $0,12 per ACU-ora. Il loro cluster scalava tra 0,5 ACU (inattivo) e 16 ACU (carico di picco). Negli ultimi 30 giorni, la media era di 4,2 ACU.

Costo mensile di Serverless v2: 4,2 ACU × $0,12 × 730 ore = $368/mese per il writer.

Confronto: un db.r6g.xlarge fisso (il loro equivalente provisioned stimato, dimensionato per gestire il carico p95 nei giorni feriali) con un RI annuale: $0,52/ora × 0,60 (sconto RI) × 730 = $228/mese.

"Il RI è più economico," disse Leo.

"Per un carico fisso, sì," disse Tom. "Ma guarda la variazione. Il nostro periodo di basso traffico — dalle 2 alle 7 di mattina, dal lunedì al giovedì — fa una media di 0,8 ACU. Su un'istanza provisioned fissa, staremmo pagando molte volte quello che stiamo usando durante quelle ore, semplicemente inattivo."

"E Serverless v2 scala verso il basso per adeguarsi?"

"A 0,5 ACU. Il costo inattivo è una frazione di quello che pagheremmo per un'istanza provisioned dimensionata per il picco."

Il calcolo del punto di pareggio: Serverless v2 è più economico quando il tuo rapporto picco/baseline è superiore a circa 4:1. Per Nimbus, con picchi del venerdì a 16 ACU e minimi del lunedì mattina a 0,8 ACU — un rapporto di 20:1 — Serverless v2 era la scelta giusta. Se il loro traffico fosse stato più costante (diciamo, 8 ACU ± 20%), un RI provisioned sarebbe stato più economico.

"Non si tratta solo di quale numero è più piccolo questo mese," disse Tom. "Si tratta di quale modello gestisce correttamente la nostra crescita. Se cresciamo del 50% il prossimo trimestre, Serverless v2 scala semplicemente verso l'alto. Un RI provisioned avrebbe bisogno di un ridimensionamento, e staremmo pagando per headroom inutilizzato durante la transizione."

Tom delineò esplicitamente il confronto su base annua in modo che il team potesse seguire il ragionamento, non solo la conclusione.

**Costo mensile di Aurora: Serverless v2 vs RI provisioned**

L'opzione provisioned: un db.r6g.xlarge con una Reserved Instance annuale. Costo: $0,52/ora On-Demand × 0,60 (sconto RI) × 730 ore = $228/mese. Fisso, indipendentemente dal carico.

L'opzione Serverless v2: paga per ACU-ora a $0,12. Variabile, in linea con il carico effettivo.

Tom estrasse 30 giorni di metriche ACU di Aurora Serverless v2 da CloudWatch e costruì una distribuzione:

- Dalle 2 alle 7 di mattina, lunedì–giovedì (basso traffico): media 0,8 ACU → $0,096/ora
- Dalle 7 alle 11 di mattina, giorni feriali (moderato): media 3,2 ACU → $0,384/ora
- Dalle 11 alle 21, giorni feriali (ore di punta): media 5,8 ACU → $0,696/ora
- Venerdì dalle 18 alle 22 (cena del weekend): media 14,1 ACU → $1,692/ora
- Sabato dalle 12 alle 20 (weekend affollato): media 9,3 ACU → $1,116/ora
- Domenica (giorno più tranquillo): media 2,1 ACU → $0,252/ora

Media ponderata sull'intero mese: 4,2 ACU → $0,504/ora → $368/mese.

Con un RI provisioned: $228/mese. Serverless: $368/mese. L'opzione provisioned risparmiava $140/mese.

"Sembra ovvio," disse Leo. "Perché siamo su Serverless?"

"Perché $368 è la media," disse Tom. "Guarda i venerdì sera."

Venerdì dalle 18 alle 22: media di 14,1 ACU. Per quella finestra di quattro ore, Serverless costa $1,692/ora. Un db.r6g.xlarge a $228/mese si ferma a 32 GiB di memoria — l'equivalente di circa 16 ACU. Il cluster Serverless faceva una media di 14,1 ACU durante quella finestra, sfiorando il massimo dell'xlarge senza alcun margine per i picchi.

"Un'istanza provisioned dimensionata per il nostro picco del venerdì con vero headroom sarebbe un db.r6g.2xlarge," disse Tom. "Al tasso RI, sono $1,04/ora × 0,60 = $0,624/ora. Mensile: $456/mese."

"È più della media Serverless di $368," disse Maya.

"Esatto. E se avessimo dimensionato l'istanza provisioned per la baseline dei giorni feriali — il db.r6g.xlarge — il venerdì sera sarebbe un problema. Al carico di picco, staremmo spingendo 14 ACU contro circa l'intera capacità dell'xlarge. È saturazione."

"Quindi dovresti pre-dimensionare per il picco," disse Priya.

"Al costo di pagare per capacità inattiva le altre 160 ore della settimana," disse Tom. "La matematica del RI provisioned che risulta più economica funziona solo quando il tuo rapporto picco/baseline è basso. Il nostro è 20:1. È esattamente lo scenario per cui Serverless v2 è stato progettato."

Mostrò i numeri affiancati:

| Opzione | Mese medio | Notte tranquilla (2 AM) | Cena del venerdì (20:00) |
|---|---|---|---|
| Serverless v2 | $368 | $0,096/ora | $1,692/ora |
| RI provisioned (r6g.xl) | $228 | $228/730ore = $0,312/ora | al limite — rischio di saturazione |
| RI provisioned (r6g.2xl) | $456 | $0,624/ora | headroom confortante |

"L'opzione Serverless è $368," disse Tom. "L'opzione provisioned correttamente dimensionata è $456 — e questo è prima di tenere conto del costo operativo del monitoraggio e del ridimensionamento manuale dell'istanza provisioned quando i nostri pattern di traffico cambieranno il prossimo trimestre."

"E il costo operativo," disse Priya, "non è zero."

"No. Con Serverless, non dobbiamo preoccuparci del dimensionamento dell'istanza. Aurora lo gestisce. Con il provisioned, ogni trimestre avrei bisogno di rivalutare se la classe di istanza attuale si adatta ancora al nostro traffico. Non è costoso in termini di tempo, ma è qualcosa che può andare storto se smettiamo di prestare attenzione."

"Andrà tutto bene finché non dimentichiamo di ridimensionarla," disse Leo, e poi si corresse. "Il che è esattamente quando non andrà bene."

"Esattamente," disse Tom.

La conclusione reggeva: Serverless v2 a $368/mese era la scelta giusta per il rapporto picco/baseline di 20:1 di Nimbus e la preferenza del team per la semplicità operativa. Il RI provisioned era conveniente solo per i team con traffico che non variava in modo significativo — un rapporto di 2:1 o 3:1 in cui l'istanza provisioned era raramente inattiva.

"Cosa ci farebbe passare al provisioned?" chiese Maya.

"Se il nostro pattern di traffico si appiattisse," disse Tom. "Se Nimbus crescesse al punto in cui anche la baseline di basso traffico fosse alta — diciamo, 8 ACU alle 2 di mattina invece di 0,8 — il rapporto scenderebbe a 2:1 e il provisioned avrebbe senso economico. È un problema di business diverso. Uno che vorremmo avere."

Per Aurora con Serverless v2, le Reserved Instances non si applicano direttamente — Serverless v2 scala dinamicamente e paghi per ACU-ora. Questa è la configurazione attuale di Nimbus: sia il writer che il reader Aurora principale usano Serverless v2. I risparmi per Nimbus derivano dalla natura auto-scaling di Serverless v2 in sé — non paghi per capacità inutilizzata quando il traffico è basso.

I team che ancora eseguono istanze Aurora fisse dovrebbero valutare l'impegno RI una volta che il tipo di istanza è stato stabile per tre o più mesi.

**DynamoDB: On-Demand vs Provisioned**

Nel Capitolo 9, abbiamo introdotto le due modalità di capacità di DynamoDB: on-demand e provisioned.

Nimbus aveva eseguito DynamoDB in modalità on-demand dall'inizio. A basso traffico, era la scelta corretta — on-demand è più costoso per richiesta ma non ha un costo minimo.

Ora, con 18 mesi di dati di traffico in CloudWatch, Tom riusciva a vedere i pattern.

Richieste di lettura medie: 225 al secondo (circa 19,4 milioni al giorno)
Richieste di scrittura medie: 60 al secondo (circa 5,2 milioni al giorno)
Giorno di picco (venerdì): 180% delle richieste DynamoDB medie (ElastiCache assorbe ~95% delle letture, quindi DynamoDB vede solo una frazione del picco complessivo di 25x del volume degli ordini)

**Prezzo on-demand**: $1,25 per milione di richieste di scrittura, $0,25 per milione di richieste di lettura.
**Prezzo provisioned**: $0,00065 per write capacity unit per ora, $0,00013 per read capacity unit per ora.

Tom calcolò il punto di pareggio: la capacità provisioned diventa più economica quando viene utilizzata in modo sufficientemente costante da non pagare il sovrapprezzo on-demand durante i periodi inattivi.

(Una nota sui numeri in questa sezione: riflettono la bolletta del team all'epoca, e sono illustrativi. Alla fine del 2024, AWS ha tagliato i prezzi on-demand di DynamoDB del 50%, il che ha spostato il punto di pareggio in modo sostanziale — oggi la capacità provisioned vince solo quando l'utilizzo è costantemente elevato. Rifai sempre questo calcolo con i prezzi attuali.)

Con 18 mesi di dati che mostravano pattern giornalieri costanti, la capacità provisioned con **DynamoDB Auto Scaling** era la scelta giusta:

- Imposta la capacità minima al 60% del carico medio
- Imposta la capacità massima al 250% della media (gestisce i picchi del venerdì)
- Auto Scaling regola la capacità provisioned tra questi limiti

Costo mensile di DynamoDB: sceso da $340 (on-demand) a $230 (provisioned con auto scaling). Riduzione del 32%.

"Aspetta — ma *perché* dovremmo farlo in questo modo?" chiese Maya. "Eravamo on-demand dall'inizio perché non ci fidavamo dei nostri pattern di traffico. Cos'è cambiato?"

"Diciotto mesi di dati," disse Tom. "Ora sappiamo com'è il nostro pattern — baseline feriale costante, picchi del venerdì, periodi tranquilli della domenica. L'on-demand era la scelta giusta quando non lo sapevamo. Il provisioned con Auto Scaling è la scelta giusta ora che lo sappiamo."

"Ma se sovra-provisioniamo," chiese Leo, "paghiamo per capacità inutilizzata."

"Questo è il rischio," disse Tom. "Con Auto Scaling, impostiamo il minimo abbastanza alto da evitare il throttling, e lasciamo che AWS gestisca entro il nostro range."

"E se il nostro pattern di traffico cambia significativamente?"

"Allora aggiustiamo i limiti. Lo rivediamo trimestralmente."

**ElastiCache: Right-Sizing e il Racconto Ammonitore**

La bolletta di ElastiCache: $185/mese. Un'istanza Redis cache.r6g.large in ogni AZ (due nodi, primario + replica).

Le metriche di CloudWatch mostravano:

- Utilizzo medio della memoria: 34%
- Picco: 44%

L'istanza era sovra-provisioned. Una cache.m6g.large — la metà della memoria dell'r6g.large — avrebbe probabilmente gestito il carico con un certo margine.

Ma qui Tom si fermò. Ricordò quello che era successo in una compagnia precedente quando aveva eseguito aggressivamente il right-sizing di una cache — e raccontò al team la storia completa, perché era il tipo di storia che bisognava raccontare prima di trovarsi nel mezzo di essa.

Nella sua azienda precedente — una piattaforma SaaS per i report finanziari — il cluster ElastiCache era una cache.r6g.large. Due nodi, primario e replica. Utilizzo medio della memoria: 26%. Picco osservato: 37%. L'ingegnere on-call che l'aveva segnalato aveva fatto i calcoli: una cache.m6g.large avrebbe gestito il carico con circa il 25% di headroom sopra il picco osservato. Risparmio: $60/mese — prezzi in quella regione e generazione di nodi all'epoca, inferiori al gap equivalente a Nimbus oggi. La modifica fu approvata un martedì.

Il mese successivo, un giovedì sera alle 23:47, iniziò il batch di liquidazione di fine mese.

Il batch di liquidazione girava trimestralmente. Estraeva i record delle transazioni di ogni account attivo per i tre mesi precedenti, li aggregava, calcolava le tasse e scriveva i record di liquidazione. La cache veniva usata per memorizzare lo stato intermedio di aggregazione — il totale progressivo di ogni account mentre il batch avanzava. La cache.r6g.large l'aveva sempre gestita. Nessuno aveva guardato le metriche specifiche del batch di liquidazione quando aveva preso la decisione di right-sizing, perché il batch era trimestrale e la finestra di osservazione era stata di quattro settimane.

Sull'istanza più piccola, maxMemoryPolicy era impostata su `allkeys-lru` — quando la memoria era piena, Redis avrebbe evicted la chiave usata meno di recente per fare spazio. Questa è la policy corretta per una cache generica. Ma per il batch di liquidazione, ogni chiave nella cache era attivamente necessaria. Quando la memoria si riempì all'84% dei 6,38 GB dell'm6g.large, Redis iniziò a evict le chiavi. Ogni eviction era una cache miss. Ogni cache miss inviava una query al database PostgreSQL sottostante per ricalcolare il valore evicted dai record di transazione grezzi.

Il connection pool del database era configurato per il traffico in condizioni normali, non per il carico del batch di liquidazione. Entro quattro minuti dall'inizio delle eviction, il database aveva 847 connessioni attive. Il limite di connessioni era 1.000. A 9 minuti, i primi thread dell'applicazione iniziarono a vedere errori "too many connections". A 12 minuti, tre servizi che condividevano il connection pool del database — il batch di liquidazione, il servizio di reporting in tempo reale, e l'API lato client — erano tutti colpiti.

L'ingegnere on-call escalò alle 23:59. La revisione dell'incidente iniziò alle 00:08.

Prima risposta: aumentare il timeout Lambda per la funzione del batch di liquidazione (il batch era in parte basato su Lambda). Errata. Il timeout non era il problema.

Seconda risposta: aggiungere una seconda funzione Lambda per parallelizzare il batch di liquidazione. Anche questa errata. Più parallelismo significava più accesso simultaneo alla cache, il che significava eviction più rapide, il che peggiorava la situazione.

Terza risposta: ridurre il batch di liquidazione per ridurre la pressione sul database. Aiutò leggermente ma non affrontò la causa radice.

Quarta risposta, alle 2:31: ripristinare la cache.r6g.large. La pressione sulla memoria scese immediatamente. Le eviction si fermarono. Il connection pool del database si svuotò. Il batch di liquidazione si completò alle 4:17, ritardato di oltre quattro ore.

Totale dell'incidente: quattro ore di performance degradata dell'API per i client che tentavano di accedere ai report. Un batch di liquidazione completo ritardato. Tempo degli ingegneri: circa 22 ore su cinque ingegneri. Costo diretto stimato: $40.000.

Il risparmio di $60/mese era costato $40.000 in un singolo incidente.

"L'errore non era la decisione di right-sizing," disse Tom. "La decisione era difendibile sulla base dei dati disponibili. L'errore era la finestra di osservazione. Misurammo quattro settimane di metriche. Il batch di liquidazione era trimestrale. Stavamo guardando il timeframe sbagliato."

"Quindi come lo si evita?" chiese Maya.

"Ti chiedi: qual è l'operazione più critica supportata da questa cache? E trovi le metriche specifiche di quell'operazione. Non la settimana media. La settimana specifica — o il mese — o il trimestre — in cui il carico è più alto. E dimensioni per quello."

"E se non riesci a trovare le metriche perché l'operazione è rara?"

"Quella è la risposta," disse Tom. "Se non riesci a trovare le metriche per uno specifico scenario ad alto carico, la risposta corretta è non fare ancora il right-sizing. Aspetta la prossima occorrenza, strumentala pesantemente, poi dimensiona in base a quello che hai osservato."

Il cluster ElastiCache di Nimbus aveva la sua operazione ad alto rischio: la cena del venerdì sera. Tom aveva quei dati — tre venerdì sera consecutivi avevano raggiunto il 44% di utilizzo della memoria sull'r6g.large, circa 5,7 GB di dati live. Sugli 6,38 GB dell'm6g.large, lo stesso working set si sarebbe già trovato vicino al 90% — e se qualcosa nella pipeline di elaborazione degli ordini fosse cambiato per usare più spazio cache — una nuova funzionalità, una strategia di caching diversa — il 90% diventa territorio di eviction.

Fece i calcoli comunque. Passare da r6g.large a m6g.large: due nodi a $0,127/ora versus due nodi a $0,090/ora, funzionando 730 ore al mese. Large: $185/mese. La coppia m6g: $131/mese. Risparmio potenziale: $54/mese. Testò il m6g.large in staging per due settimane sotto carico. La memoria raggiunse il 71% — abbastanza vicino al limite da renderlo a disagio.

Poi calcolò l'alternativa: tenere la cache.r6g.large, ma acquistare Reserved Nodes (impegno di 1 anno). Da $185 On-Demand a $120/mese Reserved. Risparmio: $65/mese senza cambiare il tipo di istanza.

"Il risparmio di $65/mese che otterrei con i Reserved Nodes alla stessa dimensione di istanza è un risparmio reale," disse Tom. "Il risparmio di $54/mese che otterrei passando all'm6g.large è una falsa economia se mette a rischio la cena del venerdì sera — e non risparmia nemmeno di più. A volte il right-sizing verso un'istanza più piccola rischia un incidente di performance — i Reserved Nodes ci danno più risparmi senza nessuno dei rischi."

Acquistò i Reserved Nodes per l'r6g.large.

"Quando l'opzione più sicura risparmia anche di più," disse Tom, "non è nemmeno un compromesso."

**Conservazione dei Backup RDS: Il Compromesso sullo Storage**

I backup automatici di RDS sono conservati in S3 (senza costi aggiuntivi per storage fino al 100% della dimensione del database). La conservazione predefinita è di 7 giorni.

Per il database Aurora da 180GB di Nimbus, 7 giorni di backup erano appropriati — erano riusciti a ripristinare dal backup entro quella finestra nei test.

Ma Tom notò: avevano anche snapshot manuali da ogni deployment significativo, conservati indefinitamente.

23 snapshot manuali, totale 4,1TB di storage snapshot.
Costo: $0,021/GB/mese per storage backup Aurora = circa $87/mese in storage snapshot manuale.

Conservarono le ultime 3 snapshot manuali per ambiente (produzione, staging). Eliminarono il resto — circa 1,1TB conservati.
Risparmio: $64/mese.

"Stavamo pagando $64 al mese per un'assicurazione che non abbiamo mai usato," disse Leo.

"Stavamo pagando per la tranquillità," corresse Tom. "La domanda è: quanto vale la tranquillità a $64 al mese?"

"Con un piano di disaster recovery adeguato," disse Priya, "puoi ottenere la stessa tranquillità con 7 giorni di backup automatici e 3 snapshot manuali."

"D'accordo. Ora."

**Variante: Quando il Provisioned si Rivela Sbagliato**

Se il tuo pattern di traffico è costante e prevedibile, la capacità provisioned con Auto Scaling risparmia il 30% rispetto all'on-demand. Ma se una nuova funzionalità viene lanciata e il volume di scrittura schizza 5x da un giorno all'altro, sarai throttled prima che Auto Scaling riesca ad adeguarsi — Auto Scaling reagisce al traffico osservato, il che significa che c'è un ritardo. Mantenere la modalità on-demand per le settimane intorno al lancio di una funzionalità principale è un compromesso ragionevole: costo leggermente più alto, nessun rischio di throttling durante un periodo in cui stai osservando i pattern di traffico cambiare in tempo reale.

Se elimini read replica inutilizzate (come le replica PostgreSQL legacy di Nimbus), i risparmi sono immediati e inequivocabili — non c'è compromesso, perché le replica non fornivano alcun valore. Ma se sei tentato di eliminare una read replica che gestisce solo il 2% del traffico, controlla cosa succede al primario quando quel 2% non ha dove andare durante un picco. Alcune read replica esistono per headroom, non per il carico attuale.

All'esame, si applica la stessa logica: un workload con baseline stabile punta alla capacità reserved; picchioso-e-inattivo punta all'on-demand o Serverless.

**Il Riepilogo dell'Ottimizzazione del Database**

| Servizio | Prima | Dopo | Risparmio Mensile |
|---|---|---|---|
| Aurora (Serverless v2 mantenuto dopo l'analisi) | $647 | $647 | $0 (modello corretto) |
| RDS Read Replica (inutilizzate) | $340 | $0 | $340 |
| DynamoDB (On-Demand → Provisioned + Auto Scaling) | $340 | $230 | $110 |
| ElastiCache (Reserved Nodes) | $185 | $120 | $65 |
| Aurora snapshot manuali | $87 | $23 | $64 |
| RDS Proxy (sicurezza delle connessioni) | $0 | $88 | -$88 |
| **Totale** | **$1.599** | **$1.108** | **$491/mese** |

$491 al mese di risparmio sui database. $5.892 all'anno.

Tom affiancò questo numero al risparmio dalla pulizia dello storage ($6.200/anno), alle policy di lifecycle S3 del Capitolo 23 ($7.800/anno), e ai risparmi del Savings Plan ($14.200/anno).

Impatto totale dell'ottimizzazione fino ad ora: $34.092/anno.

"È runway reale," disse Maya.

"O diversi esperimenti seri," disse Priya.

"O dodici mesi di esperimenti," disse Leo.

Tutti e tre avevano ragione.

## Punti di Forza e Limitazioni

**DynamoDB Provisioned con Auto Scaling**:

- Più economico dell'on-demand per workload prevedibili e costanti
- Auto Scaling gestisce la variabilità senza sovra-provisioning permanente
- Richiede monitoraggio per garantire che i limiti di capacità rimangano appropriati

**RDS Reserved Instances / ElastiCache Reserved Nodes**:

- Risparmi significativi per workload stabili e a lungo termine
- Impegno bloccato — se le tue esigenze cambiano, hai pagato per capacità inutilizzata
- A differenza delle RI EC2 Standard, le RI RDS **non possono** essere rivendute sul Reserved Instance Marketplace — il Marketplace è solo per EC2. Una RI RDS inutilizzata è un costo irrecuperabile, il che rende la decisione di dimensionamento ancora più importante

**Il principio generale**:

- Comprendi sempre l'utilizzo prima di ottimizzare — usa il p95, non la media
- Le risorse inutilizzate (come le read replica legacy) sono l'ottimizzazione con il rendimento più alto
- Il right-sizing richiede la validazione in staging prima di applicarlo in produzione, e il controllo dei pattern di workload stagionali che potrebbero non apparire in una finestra di osservazione standard
- Il prezzo reserved richiede fiducia nella stabilità del workload

## Riepilogo

L'audit del database ha chiuso un gap da $491 al mese senza mai toccare il motore — i risparmi sono venuti dal bagagliaio: replica inattive, snapshot dimenticate, e capacità prezzata per pattern di traffico che Nimbus aveva ormai superato. La disciplina di Tom ha retto attraverso ogni voce: capisci il workload prima, poi ottimizza. La sola nuova spesa, RDS Proxy, era l'assicurazione che i numeri delle connessioni del venerdì sera dicevano di cui avevano bisogno.

- **Prima l'audit**: estrai le metriche di CloudWatch prima di apportare qualsiasi modifica al database. Usa la latenza p95 e la CPU p95 — non le medie. Controlla FreeableMemory e i massimi delle connessioni.
- **Elimina le risorse inutilizzate**: read replica, database inattivi, e istanze di test che non sono più necessarie.
- **Attenzione al connection pool**: imposta allarmi su DatabaseConnections al 75% e al 90% del limite. Considera RDS Proxy per il multiplexing delle connessioni.
- **DynamoDB On-Demand vs Provisioned**: On-Demand per traffico imprevedibile; Provisioned + Auto Scaling per pattern costanti.
- **Right-sizing di ElastiCache**: testa in staging sotto carichi di picco realistici, inclusi i picchi stagionali. I Reserved Nodes offrono risparmi alla stessa dimensione di istanza quando il downsizing aggressivo comporta rischi.
- **Gestione degli snapshot RDS**: conserva solo le snapshot di cui hai bisogno. Le snapshot manuali sono conservate indefinitamente a meno che non vengano eliminate.

## Suggerimenti per l'Esame

*Dominio SAA-C03: Design Cost-Optimized Architectures (Dominio 4, Task 4.3)*

- **Modalità di prezzo di DynamoDB**: On-Demand = paga per richiesta (costo unitario più alto, nessun minimo). Provisioned = paga per capacity unit per ora (costo unitario più basso, devi allocare la capacità). **DynamoDB Auto Scaling** regola automaticamente la capacità provisioned.
- **RDS Reserved Instances**: disponibili per tutti i tipi di motore RDS. I deployment Multi-AZ possono usare Reserved Instances (ti impegni per il Multi-AZ). Termine di 1 o 3 anni.
- **ElastiCache Reserved Nodes**: stesso modello di impegno delle EC2 Reserved Instances. Applicato per nodo, non per cluster.
- **Storage degli snapshot RDS**: i backup automatici sono gratuiti fino al 100% della dimensione del database. Le snapshot manuali vengono addebitate per GB al mese in S3. Scenario d'esame: "ridurre i costi di storage RDS" → eliminare le snapshot manuali vecchie.
- **Capacità reserved di DynamoDB**: disponibile anche per DynamoDB (impegno per una specifica capacità di lettura/scrittura per 1 o 3 anni con uno sconto). Diversa dal provisioned standard — pre-paghi la capacità su tutte le tue tabelle DynamoDB in una regione.
- **Aurora Serverless v2 vs provisioned**: Serverless v2 scala automaticamente, ideale per workload variabili. Provisioned con Reserved Instances è più economico per workload stabili e prevedibili.

## Esercizi

**Esercizio 1 — Ricordo**

Spiega quando dovresti usare la capacità on-demand di DynamoDB versus la capacità provisioned con Auto Scaling. Quali informazioni ti servono per prendere questa decisione?

*(Suggerimento: pensa al motore dell'auto — impegnarsi per la capacità provisioned senza dati di traffico è il cambio olio che salti, mentre restare on-demand dopo 18 mesi di pattern prevedibili è pagare un tagliando che non ti serve.)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: Un'azienda gestisce una tabella DynamoDB per la classifica di un gioco mobile. Il traffico è molto costante durante tutto l'anno, tranne durante un evento stagionale programmato con mesi di anticipo (una settimana per trimestre, che raggiunge 10x il traffico normale man mano che i giocatori si uniscono nel primo giorno). La priorità dell'azienda è minimizzare i costi del database durante i lunghi periodi stabili e prevedibili mantenendo le performance durante le settimane di evento conosciute.

Quale strategia di capacità DynamoDB soddisfa MEGLIO questi requisiti?

A) Capacità on-demand per gestire i picchi stagionali senza throttling
B) Capacità provisioned impostata ai livelli stagionali di picco (sempre provisioned per 10x del traffico)
C) Capacità provisioned con DynamoDB Auto Scaling, con una capacità massima impostata per il picco stagionale
D) Unità di capacità reserved di DynamoDB per 3 anni ai livelli di traffico normali

**Suggerimento 1**: "Traffico molto costante tranne per un picco stagionale programmato e conosciuto" — quale modalità gestisce entrambi in modo efficiente? (Il punto di forza dell'on-demand è il traffico *imprevedibile*; questo traffico è prevedibile.)

**Suggerimento 2**: "Minimizzare i costi" fuori picco significa che non puoi sovra-provisioning per 10x tutto il tempo.

**Suggerimento 3**: DynamoDB Auto Scaling può scalare verso l'alto per l'evento stagionale e tornare verso il basso dopo.

**Risposta**: C

**Spiegazione**: La capacità provisioned con Auto Scaling scala la tabella in base al traffico effettivo. Durante i periodi normali, la capacità è a livelli normali (costo basso). Durante l'evento stagionale — le cui date sono conosciute in anticipo e il cui traffico cresce gradualmente nel primo giorno — Auto Scaling segue l'aumento fino al livello massimo configurato (gestendo il picco 10x), e il team può anche alzare il minimo prima dell'inizio programmato come headroom extra. Dopo l'evento, la capacità scala verso il basso. Questo è più economico dell'on-demand durante la condizione stabile che domina l'anno (l'on-demand costa di più per richiesta) e più economico che provisioning sempre per 10x.

**Perché non A?** L'on-demand gestisce i picchi senza throttling, ma il suo punto di forza è il traffico *imprevedibile*. Qui il traffico è molto costante e il picco è programmato e graduale — pagare il sovrapprezzo on-demand per richiesta per il ~92% dell'anno che è in steady-state contraddice la priorità dichiarata di minimizzare i costi durante i periodi normali.

**Perché non B?** Provisioning a 10x in modo permanente significa che ~90% della capacità provisioned rimane inutilizzata per ~92% dell'anno — pagando per capacità che non viene mai usata.

**Perché non D?** Le unità di capacità reserved ti bloccano ai livelli di traffico normali. Durante l'evento stagionale 10x, saresti throttled oltre l'importo reserved, oppure dovresti aggiungere on-demand sopra.

*Dominio SAA-C03: Design Cost-Optimized Architectures — Task 4.3*

**Esercizio 3 — Sfida di Architettura** *(Opzionale)*

Nimbus sta valutando una nuova funzionalità: un dashboard di analytics per i ristoranti che mostra i conteggi degli ordini in tempo reale, il ricavo per ora, e la demografia dei clienti. Questi dati verrebbero interrogati da un database circa 200 volte al minuto (una query per analista per ogni refresh della pagina, con 10 analisti).

Attualmente i dati di analytics sono in Athena (S3). Dovrebbero costruire il dashboard su Athena, oppure caricare i dati in un database? Se database, quale (Aurora, DynamoDB, Redshift)?

Considera: frequenza delle query, requisiti di freschezza dei dati, complessità delle query (aggregazioni, join), e costo per query a questo volume.

*(Non esiste una risposta univoca corretta. L'obiettivo è esercitarsi nella selezione del database per workload di analytics.)*

## Scena Post-Crediti

Tom presentò il riepilogo completo dell'ottimizzazione dei costi a Maya.

Tre mesi di lavoro. $34.092 di risparmi annuali identificati, la maggior parte già implementata.

"Cosa resta?" chiese Maya.

"Ottimizzazioni su cui non sono ancora sicuro," disse Tom. "La configurazione di Aurora potrebbe forse essere ulteriormente ridimensionata, ma voglio ancora un trimestre di dati prima di impegnarmi. E c'è una questione sul trasferimento dati che non ho ancora analizzato completamente."

"I costi di rete."

"Sì. È il prossimo."

Maya guardò i numeri. "Tom, voglio capire una cosa. Questa ottimizzazione — ci hai lavorato per tre mesi. È una parte significativa del tuo tempo."

"Circa il 30%."

"E hai trovato circa $34.000 all'anno. Quindi l'ottimizzazione si ripaga in — cosa, qualche mese del tuo stipendio?"

Tom la guardò. "Più o meno."

"E ogni anno dopo, è puro risparmio."

"O puro reinvestimento," disse lui. "Stesso effetto."

Maya annuì. "Questo è quello che voglio che tu faccia. Non solo su storage e database — su tutto. Rendi l'ottimizzazione dei costi una funzione continua del tuo ruolo."

Tom non aveva mai sentito il suo lavoro descritto in questo modo. Lo trovò al tempo stesso accurato e soddisfacente.

Nel prossimo capitolo: l'ultima categoria di costi rimanente — e quella che sorprende quasi tutti.
