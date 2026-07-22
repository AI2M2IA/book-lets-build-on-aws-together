# Capitolo 32: Difendere il Piano

Carlos era tornato, qualche settimana dopo la sessione di revisione. Questa volta il laptop rimase nella borsa; prese invece un pennarello per la lavagna, salutò ciascuno nel locale, trovò posto vicino alla lavagna e stappò il pennarello.

"Parlami di Nimbus," disse. Come se non ne avesse mai sentito parlare.

La revisione Well-Architected del Capitolo 31 aveva fatto emergere tre osservazioni ad alto rischio e una consapevolezza crescente in Maya: c'era un divario tra le decisioni che il team aveva preso e quelle che aveva davvero *ragionato a fondo*. Il framework aveva fornito loro un vocabolario per nominare quel divario. Quello che non poteva dare era la pratica di colmarlo in tempo reale — prima che una funzionalità venisse rilasciata, non dopo. Per questo Carlos era lì. Maya lo aveva invitato specificamente perché Nimbus stava per costruire qualcosa di significativo, e voleva una sfida strutturata prima che venisse scritta la prima riga di codice in produzione.

Una buona revisione architetturale è come una checklist pre-volo per un pilota. L'aereo può sembrare perfettamente pronto a volare — motori accesi, serbatoio pieno, passeggeri a bordo. Ma la checklist esiste perché i piloti esperti sanno che le cose più probabili a causare problemi sono esattamente quelle che sembrano a posto fino a quando non smettono di esserlo. La checklist non significa che il pilota non sappia il fatto suo. Significa che ha interiorizzato che anche gli esperti mancano delle cose quando saltano il processo strutturato.

**Il Primo Atto dell'Architetto**

Quello che accadde dopo sorprese il team.

Maya iniziò a descrivere il sistema — istanze EC2, Aurora, CloudFront, ElastiCache, DynamoDB per il menu, VPC con subnet private...

Carlos la fermò con gentilezza.

"Inizia dal business," disse. "Non dalla tecnologia."

Lei si fermò. Poi: "Nimbus è una piattaforma di ordinazione per ristoranti. Abbiamo 287 ristoranti partner. Elaboriamo circa 4.200 ordini al giorno. Il valore medio dell'ordine è di 34 dollari. Stiamo crescendo del 18% trimestre su trimestre."

"Bene. Qual è la cosa più importante che Nimbus deve fare?"

"Elaborare gli ordini," disse Leo.

"Nello specifico," insistette Carlos.

"Un ordine deve raggiungere il ristorante entro cinque secondi dal momento in cui viene effettuato," disse Priya, "altrimenti la cucina perde la finestra temporale."

"Cosa succede se non ci riesce?"

"Il ristorante sbaglia. Il cliente riceve il cibo sbagliato o aspetta troppo. Si lamenta. Perdiamo un partner ristorante."

"Quindi la SLA dei cinque secondi," disse Carlos, "non è un obiettivo tecnico. È un requisito di sopravvivenza aziendale."

Silenzio.

"Ecco perché," disse, "le conversazioni sull'architettura devono iniziare dai requisiti di business. La tecnologia è a valle del vincolo."

**La Struttura della Revisione Architetturale**

Una vera revisione architetturale — quella che avviene prima di costruire qualcosa di importante, o quando si valuta se scalare — ha una struttura.

Carlos la scrisse sulla lavagna:

**1. Comprendere i vincoli**

Cosa deve essere vero? Cosa non può accadere? (Non "cosa vogliamo." Quali sono i punti non negoziabili?)

**2. Comprendere le incognite**

Cosa non sappiamo? Dove stiamo facendo assunzioni? Cosa succede se quelle assunzioni sono sbagliate?

**3. Valutare le opzioni**

Quali sono le alternative realistiche? Quali sono i compromessi di ciascuna?

**4. Identificare i modi di guasto**

Come si rompe? Qual è la sequenza di eventi quando si attiva ogni modo di guasto?

**5. Validare il monitoraggio**

Come saprai quando qualcosa non va? Prima che te lo dicano gli utenti?

**6. Definire il runbook**

Cosa fa qualcuno alle 3 di notte quando questo si rompe?

Questa non è una checklist da seguire meccanicamente. È un framework di pensiero. L'obiettivo è garantire che le domande importanti vengano poste *prima* di essere in produzione.

**Condurre la Revisione: La Nuova Funzionalità di Nimbus**

Carlos era stato invitato specificamente perché Nimbus stava per costruire qualcosa di nuovo.

**La funzionalità**: "Nimbus Instant" — una garanzia di consegna in 15 minuti. Se un ristorante partner non rispetta la finestra dei 15 minuti più di una volta a settimana, Nimbus avrebbe rimborsato automaticamente il cliente.

"Illustrami i requisiti tecnici," disse Carlos.

Priya iniziò. "Abbiamo bisogno di un tracciamento in tempo reale dall'inserimento dell'ordine alla consegna. Dobbiamo confrontare il tempo di consegna effettivo con la SLA dei 15 minuti. Dobbiamo attivare i rimborsi automaticamente."

"Qual è il requisito di latenza per i dati di tracciamento?"

"Quasi in tempo reale. I clienti vedono gli aggiornamenti di stato sul telefono."

"Entro quanto?"

"Cinque secondi circa."

"Circa cinque secondi?"

"Entro cinque secondi. Questo è il requisito di prodotto."

"Bene. Kinesis per lo stream di eventi, allora. Qual è il modo di guasto se Kinesis è in ritardo?"

"Gli aggiornamenti di stato arrivano in ritardo al cliente."

"È accettabile?"

"Per 10 secondi? Probabilmente. Per 60 secondi? No."

"Quindi qual è la SLA per il sistema di tracciamento?"

Priya guardò Leo. "Non la abbiamo ancora."

Carlos scrisse sulla lavagna: *Incognita: SLA del tracciamento.*

"Questo conta," disse. "Perché la SLA determina il design dell'infrastruttura. Se la tua SLA è 5 secondi, hai bisogno di una soluzione diversa rispetto a quella per 60 secondi."

"Aspetta — ma *perché* faremmo le cose in quel modo?" chiese Maya. "Perché non usare semplicemente un meccanismo di polling che l'app controlla ogni pochi secondi invece di un push in tempo reale?"

"Latenza e costo," disse Carlos. "Un approccio di polling su larga scala — diciamo, 10.000 ordini attivi, ognuno che fa polling ogni 5 secondi — genera 2.000 richieste al secondo, ovvero 120.000 richieste al minuto. Un modello push tramite Kinesis invia aggiornamenti solo quando lo stato cambia. Meno richieste, latenza più bassa, e l'impegno della SLA è più facile da verificare da un log di eventi. Il polling funziona su piccola scala. Alla scala verso cui si sta dirigendo Nimbus, il push è la base giusta."

Leo era rimasto in silenzio durante la spiegazione di Carlos. Poi: "Stavo per costruire questo con i WebSocket."

Carlos lo guardò. "Spiegami."

"Ogni ordine ottiene una connessione WebSocket. Il client si connette quando l'ordine viene effettuato. Il server invia i cambiamenti di stato — confermato, in preparazione, in consegna, consegnato — man mano che accadono. Nessun polling, bassa latenza, modello semplice."

"Cosa mantiene la connessione WebSocket?"

"Un endpoint WebSocket di API Gateway. Le funzioni Lambda gestiscono gli eventi di connessione e messaggi. DynamoDB memorizza gli ID delle connessioni."

Carlos lo scrisse sulla lavagna. "E il modo di guasto quando la rete del client cade per 15 secondi?"

"La connessione viene terminata. Il client si riconnette e chiede lo stato corrente."

"Da dove?"

"Dal... handler Lambda, che legge da DynamoDB."

"Quindi hai sia un percorso push sia un percorso pull," disse Carlos. "Il push WebSocket è il percorso felice. La lettura DynamoDB è il percorso di ripristino. Come garantisci che la connessione venga ristabilita prima che il cliente noti che lo stato è obsoleto?"

Leo rifletté. "Il client rileva la disconnessione e si riconnette in pochi secondi. La logica di riconnessione è semplice."

"Con 10.000 ordini attivi simultaneamente — che è dove si sta dirigendo Nimbus — quante connessioni WebSocket concorrenti sono?"

"10.000."

"API Gateway WebSocket ha una quota predefinita di 500 **nuove connessioni al secondo** per account," disse Carlos. "Non connessioni concorrenti — *velocità* di connessione. 10.000 connessioni stabili vanno bene. Il problema è la reconnect storm: quando un disturbo di rete interrompe alcune migliaia di client contemporaneamente e tutti si riconnettono negli stessi due secondi, si tocca il limite di velocità e le riconnessioni iniziano a fallire esattamente quando gli utenti stanno prestando più attenzione. Puoi richiedere un aumento, ma è una quota che dovresti riesaminare man mano che cresci. Inoltre: API Gateway WebSocket addebita 0,25 dollari per milione di minuti di connessione, più 1,00 dollaro per milione di messaggi. A 10.000 ordini al giorno con una finestra di tracciamento media di 40 minuti, sono solo circa 400.000 minuti di connessione al giorno — spiccioli. Con 10.000 ordini attivi simultaneamente, è una scala diversa."

"Non è molto," disse Leo.

"Non a 10.000 ordini attivi," disse Carlos. "A quella scala, sono circa 150 dollari al mese tra costi di minuti di connessione e messaggi. Il costo non è l'argomento contro i WebSocket qui. Il limite di velocità di connessione durante le reconnect storm e la gestione dello stato delle connessioni lo sono."

"Quindi i WebSocket si complicano su larga scala," disse Maya.

"Diventano gestibili su larga scala se ci si progetta attorno," disse Carlos. "Non è sbagliato — è un diverso insieme di compromessi. Ora fammi mostrare l'alternativa con il polling."

Disegnò la seconda opzione.

"Polling: il client invia una richiesta GET a `/orders/{order_id}/status` ogni 5 secondi. Il backend legge da DynamoDB. Restituisce lo stato corrente."

"Sono un sacco di richieste," disse Priya.

"10.000 ordini attivi × 1 poll ogni 5 secondi = 2.000 richieste al secondo. La tua API deve gestire 2.000 RPS. DynamoDB scala automaticamente. API Gateway gestisce il carico. Il costo: 2.000 RPS × 3.600 secondi × 24 ore × 30 giorni = 5,18 miliardi di richieste al mese. Prezzo API Gateway REST: 3,50 dollari per milione di richieste = 18.130 dollari al mese."

La stanza rimase silenziosa.

"Non è un'opzione praticabile su larga scala," disse Tom.

"Esatto," disse Carlos. "Il polling a intervalli di 5 secondi è l'implementazione più semplice e la più costosa su larga scala. Genera anche carico proporzionale alle connessioni attive, non ai cambiamenti di stato. Se un ordine rimane in 'in preparazione' per 20 minuti, il polling genera 240 richieste che restituiscono tutte lo stesso stato. È uno spreco."

"E Kinesis?" chiese Maya.

"Kinesis genera un evento per ogni cambio di stato. Conferma dell'ordine: un evento. Accettazione in cucina: un evento. Ritiro da parte del fattorino: un evento. Consegna: un evento. Quattro eventi per ordine, indipendentemente da quanto dura ogni stato. Il consumer — il tuo backend — legge dallo stream Kinesis e invia l'aggiornamento al client attraverso qualsiasi meccanismo di consegna tu scelga."

"Ma il client ha ancora bisogno di un modo per ricevere il push," disse Leo.

"Sì. Puoi usare Server-Sent Events, un endpoint long-poll, o WebSocket per la consegna dell'ultimo miglio. Kinesis gestisce lo stream di eventi affidabile, ordinato e riproducibile per il tuo backend. Il meccanismo di consegna al client è una decisione separata. Il vantaggio chiave: Kinesis disaccoppia la fonte degli eventi dal consumer. Il sistema di tracciamento delle consegne, il sistema di rimborso, il sistema di notifica al ristorante e la visualizzazione dello stato al cliente consumano tutti indipendentemente dallo stesso stream Kinesis."

"Quindi non è Kinesis invece dei WebSocket," disse Maya. "È Kinesis più un meccanismo di consegna al client più leggero."

"Esattamente. L'analisi dei compromessi:"

Scrisse:

| Opzione | Latenza | Costo (500 / 10K ordini attivi) | Complessità |
|---|---|---|---|
| Solo WebSocket | ~50ms | $8 / $150 al mese | Media |
| Polling (5s) | 0–5s | $906 / $18.130 al mese | Bassa |
| Kinesis + SSE | ~200ms | $8 / $75 al mese | Medio-alta |

"L'opzione polling viene eliminata per i costi," disse Carlos. "I WebSocket sono praticabili ma richiedono la gestione delle connessioni su larga scala. Kinesis più Server-Sent Events ha latenza leggermente superiore e un costo comparabile — quello che ti dà è il log di eventi duraturo e riproducibile di cui hai bisogno per il sistema di rimborso, e consumer disaccoppiati."

"Aspetta — ma *perché* faremmo le cose in quel modo?" chiese Maya. "Se i WebSocket hanno latenza inferiore, perché accettare una latenza più alta da Kinesis più SSE?"

"200ms contro 50ms è percepibile da un cliente che guarda un aggiornamento di stato della consegna?" chiese Carlos.

"No," disse lei.

"Allora la differenza di latenza è sotto la soglia percettiva. La differenza di costo a diecimila ordini attivi è modesta — 75 contro 150 dollari al mese. La differenza architetturale è il vero argomento: Kinesis ti dà un log di eventi duraturo e riproducibile — di cui avrai bisogno per la traccia di audit dei rimborsi — e disaccoppia i tuoi consumer di tracciamento. Con i WebSocket dovresti ricostruire il disaccoppiamento in seguito."

Leo guardò la tabella. "Stavamo quasi per rilasciare la versione WebSocket."

"Avrebbe funzionato," disse Carlos. "Questa è la cosa importante da capire. I WebSocket avrebbero funzionato. La domanda nell'architettura è raramente 'funziona questo?' La domanda è 'quanto costa man mano che cresce, e cosa dovremo ricostruire dopo?'"


**Le Domande che Pongono gli Architetti**

Nelle successive due ore, Carlos guidò il team attraverso la revisione. Una selezione delle sue domande:

**Sul data storage**:

"Dove viene memorizzato lo stato dell'ordine durante l'evasione? Se l'applicazione crasha a metà consegna, qual è il processo di ripristino? Puoi ricostruire lo stato dai soli eventi?"

**Sul meccanismo di rimborso**:

"Il rimborso viene attivato automaticamente. Cosa impedisce che venga emesso due volte? E se il payment processor va in timeout e non sei sicuro che il rimborso sia stato accettato?"

**Sul tracciamento delle consegne**:

"Ti stai affidando ai dati GPS del corriere. Cosa succede se il segnale GPS viene perso per 90 secondi? Come distingui 'GPS perso' da 'consegna in corso' da 'problema di consegna'?"

**Sulla gestione dei guasti**:

"Se il servizio di rimborso è inattivo, l'ordine va comunque avanti? Il cliente riceve comunque il suo cibo? Qual è l'esperienza utente durante un guasto parziale del sistema?"

**Sull'osservabilità**:

"Come sai in questo momento quanti ordini sono attualmente entro 5 minuti dalla SLA dei 15 minuti? Se quel numero cresce bruscamente, chi viene notificato?"

Ogni domanda rivelava un'assunzione che il team stava facendo senza rendersene conto.

"Stavo per deployare stasera — okay, okay, prima il design," disse Leo. "L'endpoint di rimborso. Stavo solo per chiamare l'API di pagamento direttamente. Non avevamo pensato a chiamarla due volte." Si fermò. "Quindi se la prima chiamata ha successo ma la nostra conferma si perde in transito, chiamiamo di nuovo e il cliente riceve due rimborsi."

"Abbiamo pensato a cosa succede se l'API di pagamento accetta la prima chiamata ma la nostra conferma si perde in transito?" chiese Priya.

"È idempotenza," disse Carlos.

"Una chiave di idempotenza — un ID univoco per ogni tentativo di rimborso, memorizzato in un DB prima di chiamare l'API di pagamento," disse Priya. "Se chiamiamo due volte con la stessa chiave, l'API di pagamento ignora la seconda chiamata."

"Il che significa," aggiunse Carlos, "che hai bisogno di un data store persistente per le operazioni di rimborso, non solo un evento in una coda."


"Il monitoraggio di cui abbiamo parlato," disse Carlos, "è tutto monitoraggio dell'infrastruttura. CPU. Numero di connessioni. Lag di Kinesis. Questi sono importanti — ma non sono il monitoraggio che ti dice se Nimbus Instant sta funzionando."

"Qual è il monitoraggio che ci dice se funziona?" chiese Maya.

"Il tempo di conferma al P95 per ristorante. Quanto tempo, al 95° percentile, impiega dall'inserimento dell'ordine alla conferma del ristorante — misurato separatamente per ogni partner ristorante?"

"Non abbiamo quella metrica," disse Priya.

"Questo è il gap," disse Carlos. "Puoi avere un'infrastruttura perfetta — CloudWatch verde su tutti gli alarm — e avere comunque un partner ristorante la cui latenza di conferma si è degradata per tre settimane perché il software del loro tablet ha un bug. L'infrastruttura è a posto. La SLA di business viene violata. E non lo saprai finché il ristorante non chiama per lamentarsi."

"Come catturiamo quel dato?" chiese Leo.

"Emetti una metrica CloudWatch personalizzata o invia al tuo pipeline di analytics ogni volta che viene ricevuta una conferma d'ordine. Registra il timestamp dell'inserimento dell'ordine. Registra il timestamp della conferma. Calcola la differenza. Emettila taggata con `restaurant_id`. Costruisci una dashboard CloudWatch che mostra il tempo di conferma p95 per ristorante negli ultimi 7 giorni."

"E un alarm quando peggiora?" chiese Tom.

"Alarm quando il p95 per un ristorante specifico supera 90 secondi per più di 5 minuti consecutivi," disse Carlos. "È un'anomalia che giustifica un contatto proattivo, non una risposta ad attesa della lamentela."

"Questa è la differenza tra monitorare l'infrastruttura e monitorare il prodotto," disse Priya.

"Esattamente," disse Carlos. "Il monitoraggio dell'infrastruttura ti dice se i tuoi sistemi sono sani. Il monitoraggio a livello di business ti dice se i tuoi clienti stanno vivendo ciò che hai promesso loro. Hai bisogno di entrambi. La maggior parte dei team ha solo il primo."

Maya lo aggiunse alla sua lista di domande aperte: tracciare il tempo di conferma p95 per ristorante in aggiunta alle metriche di salute dell'infrastruttura. Soglie di alarm da definire dal team di prodotto in consultazione con il team di supporto ai ristoranti.

"Questo è anche il punto in cui il monitoraggio dei costi e il monitoraggio del business si intersecano," disse Tom. "Se la nostra latenza di conferma cresce per un sottoinsieme di ristoranti il venerdì sera, la causa potrebbe essere un cold start Lambda che colpisce gli shard di Kinesis di quei ristoranti. La metrica di business rivela il sintomo. Le metriche dell'infrastruttura rivelano la causa."

"E la soluzione potrebbe non essere più infrastruttura," disse Carlos. "Potrebbe essere concurrency provisionata sulla specifica funzione Lambda. Oppure il ribilanciamento degli shard. Oppure un bug nell'endpoint di conferma del ristorante. Non puoi sapere quale sia finché non hai entrambi i livelli di osservabilità."

"Abbiamo pensato a cosa succede se correggiamo l'infrastruttura e la metrica di business ancora non migliora?" chiese Priya.

"Allora la causa non è nell'infrastruttura," disse Carlos. "Il che è un'informazione preziosa. Senza la metrica di business, staresti inseguendo miglioramenti dell'infrastruttura per un problema che risiede altrove."


"Quanto costa al mese quando abbiamo 500 consegne concorrenti tracciate?" chiese Tom. "Il data store, lo stream Kinesis, le funzioni Lambda che elaborano gli eventi?"

Carlos annuì. "Questa è la domanda giusta da fare ora, mentre stai progettando, non dopo averlo costruito."

Questo è il tipo di dettaglio architetturale che emerge in una revisione strutturata — e spesso non emerge quando si sta semplicemente costruendo.

**L'Architecture Decision Record**

Dopo la revisione, Carlos raccomandò al team di documentare le proprie decisioni in **Architecture Decision Record (ADR)** — brevi documenti che catturano:

- **Quale decisione è stata presa**
- **Quali alternative sono state considerate**
- **Perché questa decisione è stata presa (il contesto e i vincoli al momento)**
- **Quali sono i compromessi**
- **Cosa ci porterebbe a riesaminare questa decisione**

Forse ti stai chiedendo: gli ADR devono essere documenti formali? No. Un ADR può essere un paragrafo in un thread Slack se è lì che lavora il tuo team. Il formato è irrilevante. L'atto di scrivere cosa hai deciso e perché — prima di andare avanti — è ciò che crea la memoria istituzionale.

"Gli ADR sono per il tuo sé futuro," disse Carlos. "Tra 18 mesi, guarderai un pezzo di architettura e ti chiederai perché è stato fatto in quel modo. Se hai un ADR, capirai il contesto. Se non ce l'hai, o lo lascerai così com'è (perché hai paura di toccarlo) o lo cambierai (perché non capivi perché era stato fatto in quel modo)."

Leo scrisse il primo ADR quel pomeriggio: la decisione di usare Kinesis per gli eventi di tracciamento delle consegne, con il contesto, le alternative considerate (SQS, EventBridge, polling) e i compromessi.

Carlos guardò l'ADR che Leo aveva redatto. Lo lesse in trenta secondi. Poi disse: "Mostra al team come appare ADR-001."

Leo lo proiettò.

---

**ADR-001: Infrastruttura per gli Eventi di Tracciamento delle Consegne**

**Data**: 2025-03-14
**Stato**: Accettato
**Autore**: Leo (con revisione di Carlos, Priya)

---

**Problema**

Nimbus Instant richiede il tracciamento in tempo reale dello stato della consegna. Gli ordini devono aggiornare il loro stato (confermato → in preparazione → in consegna → consegnato) e far emergere quegli aggiornamenti sull'app mobile del cliente entro 5 secondi dal cambio di stato. Il sistema di rimborso ha inoltre bisogno di un log di eventi auditabile e riproducibile per determinare la conformità alla SLA.

---

**Opzioni Considerate**

**Opzione 1: WebSocket API Gateway + stato DynamoDB**
- Il client mantiene una connessione WebSocket per ordine
- Il backend invia i cambiamenti di stato sulla connessione aperta
- Alla riconnessione, il client recupera lo stato corrente da DynamoDB
- Costo stimato su larga scala (10K ordini attivi simultaneamente): ~$150/mese
- Debolezza: gestione del limite di connessioni su larga scala; nessun replay integrato per l'audit

**Opzione 2: Polling client (intervallo di 5 secondi)**
- Il client fa polling su `/orders/{order_id}/status` ogni 5 secondi
- Il backend legge da DynamoDB ad ogni poll
- Implementazione più semplice
- Costo stimato su larga scala (10K ordini attivi simultaneamente): $18.130/mese
- Eliminata a causa del costo

**Opzione 3: Kinesis Data Streams + Server-Sent Events**
- I cambiamenti di stato della consegna vengono pubblicati nello stream Kinesis, dimensionato per throughput: uno shard ingerisce 1 MB/s o 1.000 record/s. Con 10K ordini attivi (~4 eventi di cambio stato per ordine, piccoli payload JSON), il picco di scrittura è ~40-50 eventi/s — sufficiente per un singolo shard. Provisioning di 3 shard per distribuzione delle partizioni e margine per i consumer.
- L'endpoint SSE si abbona allo shard Kinesis assegnato alla partizione dell'ordine
- Il client riceve eventi SSE; si riconnette usando l'API EventSource standard
- Costo stimato su larga scala (10K ordini attivi simultaneamente): ~$75/mese
- Fornisce un log di eventi duraturo e riproducibile; disaccoppia tutti i consumer

---

**Decisione**

Opzione 3: Kinesis Data Streams + SSE.

Razionale: il vantaggio di costo è significativo su larga scala; il log di eventi Kinesis soddisfa il requisito di audit per i rimborsi senza un'implementazione separata della traccia di audit; la gestione della riconnessione SSE è più semplice della gestione delle connessioni WebSocket su larga scala.

---

**Conseguenze**

- *Positivo*: il sistema di rimborso, il sistema di notifica ai ristoranti e l'app del cliente consumano tutti indipendentemente dallo stesso stream Kinesis. Nuovi consumer possono essere aggiunti senza modificare il producer.
- *Positivo*: gli eventi sono riproducibili fino a 7 giorni (la nostra retention estesa configurata; Kinesis supporta fino a 365 giorni a costo aggiuntivo). Se la Lambda di elaborazione dei rimborsi fallisce, può riprodurre gli eventi persi.
- *Negativo*: la latenza SSE (~200ms) è superiore alla latenza WebSocket (~50ms). Accettabile perché questa differenza è sotto la soglia percettiva del cliente per gli aggiornamenti di stato.
- *Negativo*: il prezzo provisionato di Kinesis scala con le ore di shard, e la retention estesa raddoppia approssimativamente il costo per shard. Il margine di throughput è ampio (uno shard ingerisce 1.000 record/s), ma man mano che il numero di consumer e il carico di lettura per consumer crescono oltre circa 50K ordini giornalieri attivi, il numero di shard — e una strategia di re-shard/consumer fan-out — dovrà essere rivisto.

**Cosa ci porterebbe a riesaminare questa decisione**: se il volume degli ordini cresce al punto in cui i costi degli shard Kinesis superano i costi WebSocket alla nuova scala, o se la latenza SSE di 200ms diventa un elemento di differenziazione del prodotto.

---

"L'ultima riga," disse Maya. "Quella a cui non avevo pensato."

"Il trigger per riesaminare," disse Carlos. "Ogni decisione ha condizioni in cui diventa sbagliata. Scriverle significa che le riconoscerai quando compaiono."

"Invece di scoprirle in un post-mortem," disse Priya.

"Invece di quello, sì."

Tom stava leggendo la conseguenza del costo. "La strategia di re-shard e fan-out — non ce l'abbiamo ancora."

"Non ne hai bisogno fino a 50K ordini giornalieri attivi," disse Carlos. "Con i tuoi attuali 287 ristoranti e 4.200 ordini giornalieri, hai un margine significativo. L'ADR ti dice cosa costruire prima che diventi urgente, non prima che diventi rilevante."

Leo stava prendendo appunti. "L'ADR sta facendo due cose," disse. "Documenta ciò che abbiamo deciso. E documenta ciò che dovremmo decidere dopo se la situazione cambia."

"Questo è ciò che rende un ADR utile tra diciotto mesi," disse Carlos. "Non la decisione in sé — le decisioni diventano obsolete. Il ragionamento. Il ragionamento ti dice se la decisione dovrebbe essere riesaminata, anche quando la decisione è ancora in vigore."


**Cosa Fa un Architetto**

Al termine della sessione, Maya pose a Carlos la domanda originale: "Qual è la differenza tra prendere decisioni architetturali e pensare come un architetto?"

Ci rifletté.

"Un architetto non sa più tecnologia di un ingegnere senior," disse. "Un buon architetto probabilmente conosce un po' meno i framework più recenti. Ma un architetto ha un insieme di domande predefinite diverso."

"Cosa intendi?"

"Quando sei un ingegnere senior che guarda una nuova funzionalità, le tue prime domande di solito sono: 'Cosa costruiamo? Come funziona? Qual è la migliore libreria per questo?' Quando un architetto guarda la stessa funzionalità, le prime domande sono: 'Quale problema risolve questo? Cosa cede per primo quando il traffico raddoppia? Come sappiamo quando è degradato? Qual è l'esperienza utente quando il payment processor è lento?'"

"L'architetto chiede del sistema sotto stress," disse Leo.

"E delle conseguenze di business di ogni guasto," aggiunse Priya.

"E," disse Tom, "di cosa succede al conto quando questo scala."

Carlos annuì. "Tutti voi state già facendo questo. Lo fate dal Capitolo 1. La differenza tra un ingegnere senior e un architetto non è una certificazione o un titolo. È un'abitudine di porre la prossima domanda — quella che rivela la cosa a cui non hai ancora pensato."

**Variazione: Quando una Revisione Architetturale Aggiunge Rischio invece di Rimuoverlo**

Se la tua revisione viene trattata come un gate di approvazione piuttosto che come un processo di apprendimento, i team inizieranno a nascondere le scelte di design per evitare il ritardo — e i modi di guasto esisteranno comunque, solo non documentati. Una revisione architetturale che rallenta il rilascio senza migliorare la qualità è peggio di nessuna revisione.

Se il problema di idempotenza per il servizio di rimborso fosse stato trattato come un ritardo inaspettato al lancio della funzionalità piuttosto che come una scoperta necessaria, Leo avrebbe rilasciato l'endpoint originale, il doppio rimborso si sarebbe eventualmente verificato, e il team lo avrebbe scoperto da un cliente arrabbiato. La revisione fa emergere il problema in un momento in cui correggerlo costa un giorno, non un rollback.

Il valore della revisione è proporzionale a quanto il team è disposto a lasciarle cambiare il design.

## Punti di Forza e Limitazioni

**Le revisioni architetturali**:

- Intercettano i modi di guasto prima che siano in produzione
- Creano comprensione condivisa tra i membri del team che spesso hanno conoscenze parcellizzate
- Generano documentazione (ADR) che porta dividendi per anni
- Rallentano il processo decisionale in modo benefico — "muoversi veloce" senza una revisione significa "muoversi veloce e schiantarsi contro il muro che non avevi visto"

**Dove diventano complicate**:

- Richiedono qualcuno abbastanza bravo da porre le domande giuste — la revisione è valida quanto chi la conduce
- Possono diventare burocratiche se trattate come una spunta anziché come una conversazione
- Alcune decisioni architetturali non richiedono davvero una revisione completa — sapere quali la richiedono è di per sé una competenza architetturale
- L'output (ADR, diagrammi, log di decisioni) deve essere mantenuto man mano che il sistema evolve

## Riepilogo

La revisione con Carlos aveva richiesto due ore e prodotto tre ADR, un elenco di sei incognite da risolvere prima che la funzionalità venisse costruita, e una modifica architetturale (il data store per l'idempotenza) che sarebbe stata dolorosa da aggiungere a posteriori dopo il lancio. La metafora della checklist pre-volo aveva retto per tutto il tempo: non era stato scoperto nulla di catastrofico, ma diverse cose che avrebbero causato problemi in seguito erano state individuate e documentate mentre erano ancora facili da correggere.

- Le revisioni architetturali iniziano dai **requisiti di business, non dalla tecnologia**.
- La struttura della revisione: vincoli → incognite → opzioni → modi di guasto → monitoraggio → runbook.
- Gli architetti chiedono: cosa cede per primo? Come sappiamo che è degradato? Qual è l'esperienza utente durante il guasto? Qual è il costo su larga scala?
- Gli **Architecture Decision Record (ADR)** catturano cosa è stato deciso, perché, e cosa porterebbe a riconsiderarlo.
- Pensare come un architetto è un'abitudine: porre la prossima domanda, specialmente sui modi di guasto, sulle conseguenze di business e sull'economia della scala.

## Suggerimenti per l'Esame

*Dominio SAA-C03: Cross-domain — ragionamento architetturale*

Questo capitolo riguarda meno argomenti specifici dell'esame e più la mentalità che l'esame verifica.

- **Gli scenari SAA-C03** descrivono quasi sempre prima un vincolo di business ("l'azienda non può permettersi più di 1 ora di downtime") e ti chiedono di selezionare l'architettura che lo soddisfa. Esercitati a tradurre i vincoli di business in requisiti tecnici.
- **Pensiero sui modi di guasto**: molte domande d'esame descrivono un sistema e chiedono cosa succede quando un componente fallisce. Esercitati a chiederti "cosa cede per primo?" per le architetture che incontri.
- **Pensiero sui compromessi**: l'esame ha raramente una risposta "perfetta". Chiede la risposta *migliore* dato un insieme di vincoli. Abituati a "questa opzione è corretta dati questi requisiti specifici, anche se un'altra opzione sarebbe migliore con requisiti diversi."
- **Architecture Decision Record**: non è un servizio AWS, ma una best practice che riflette il pilastro Eccellenza Operativa del Framework Well-Architected.
- **Kinesis per lo streaming di eventi in tempo reale**: la funzionalità Nimbus Instant del capitolo usa Kinesis per lo streaming degli eventi di consegna. Segnale d'esame: "ingestione di eventi in tempo reale con elaborazione ordinata" → Kinesis Data Streams. "Disaccoppiamento dei componenti, consegna at-least-once" → SQS. Sapere quando usare ciascuno è un pattern ricorrente nell'esame.
- **L'idempotenza come pattern verificabile**: l'SAA-C03 testa frequentemente l'idempotenza nei sistemi distribuiti. Il pattern fondamentale: genera una chiave di idempotenza univoca prima di chiamare un sistema esterno; persisti la chiave e il risultato; al retry, controlla la chiave esistente prima di rieseguire. Se trovata, restituisci il risultato precedentemente memorizzato senza rieseguire. Questo impedisce addebiti doppi, invii doppi e mutazioni di stato duplicate quando si verificano retry dopo un timeout di rete. Segnale d'esame: "prevenire operazioni duplicate quando una chiamata di servizio viene riprovata" o "garantire l'elaborazione exactly-once degli eventi di pagamento" → chiave di idempotenza memorizzata in DynamoDB con scrittura condizionale.
- **Server-Sent Events vs WebSocket**: SSE è unidirezionale (server verso client), usa HTTP standard e si riconnette automaticamente tramite l'API EventSource. I WebSocket sono bidirezionali, richiedono la gestione della connessione e sono appropriati quando il client deve anche inviare dati al server. Per gli aggiornamenti di stato della consegna (solo server-to-client), SSE è più semplice e meno costoso dei WebSocket su larga scala.

## Esercizi

**Esercizio 1 — Ricordo**

Carlos ha posto sei tipi di domande durante la revisione architetturale. Riesci a ricostruire le sei aree senza guardare il capitolo?

*(Suggerimento: pensa alla checklist pre-volo — prova a ricordare i sei controlli a memoria prima del decollo; l'atto stesso di tentare il ricordo, anche se fallisci, rafforza la ritenzione a lungo termine.)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: Un'azienda sta costruendo un sistema di gestione delle offerte in tempo reale per la pubblicità online. Le offerte devono essere valutate e risposte entro 100 millisecondi. Il sistema elabora 1 milione di offerte al secondo al picco. Se il sistema di offerte è inattivo, l'azienda perde entrate pubblicitarie. Il team di database aziendale propone di usare RDS Aurora con 10 read replica. Il solution architect deve valutare se la proposta è fondamentalmente praticabile prima di esaminarne le caratteristiche secondarie.

Quale preoccupazione dovrebbe sollevare l'architetto PER PRIMA?

A) Il costo di 10 read replica Aurora è troppo alto per il budget

B) Le read replica Aurora hanno un lag di replica che può causare problemi di consistenza

C) La latenza tipica delle query Aurora di 1-5ms potrebbe non soddisfare la SLA di risposta di 100ms

D) RDS Aurora non supporta i volumi di transazione di 1 milione di richieste al secondo con questo requisito di latenza

**Suggerimento 1**: Il vincolo primario è 100ms di tempo di risposta totale a 1 milione di richieste/secondo. Quale di queste preoccupazioni, se valida, rende la proposta inattuabile indipendentemente da come vengono affrontate le altre tre?

**Suggerimento 2**: La latenza delle query Aurora è tipicamente 1-5ms. 1-5ms per la query al database lascia 95-99ms per rete, logica applicativa e serializzazione. Il vincolo dei 100ms è a rischio?

**Suggerimento 3**: Aurora può gestire IOPS elevati, ma 1 milione di richieste al secondo è un rate straordinario. Cosa succede all'architettura a quella scala?

**Risposta**: D

**Spiegazione**: Sebbene Aurora sia ad alte prestazioni, 1 milione di richieste al secondo con un tempo di risposta totale di 100ms è un requisito estremo — è il blocco architetturale che determina se la proposta può esistere del tutto. L'architetto dovrebbe innanzitutto mettere in discussione se Aurora (o qualsiasi database relazionale) possa fungere da sistema di lookup primario a questa scala e latenza. Sistemi di questo tipo tipicamente usano data store in memoria (Redis) o database specializzati a bassa latenza, non database relazionali con la piena semantica SQL. La SLA dei 100ms è raggiungibile per le sole query Aurora, ma la combinazione di 1M RPS e 100ms di tempo di risposta totale supera le caratteristiche di throughput tipiche di Aurora. "PER PRIMA" significa fattibilità prima del raffinamento: se il motore non può sostenere il carico, ogni altra preoccupazione sulla proposta è priva di senso.

**Perché non A?** Il costo è una preoccupazione valida, ma la prima preoccupazione dovrebbe essere se l'architettura è tecnicamente fattibile con i requisiti dichiarati.

**Perché non B?** Il lag di replica è una caratteristica reale ma *secondaria* della proposta — una proprietà da ottimizzare una volta che l'architettura è praticabile. Il lag delle replica Aurora è tipicamente <100ms e accettabile per la maggior parte dei casi d'uso; sollevarlo prima significherebbe discutere del comportamento di consistenza di un sistema che non può sostenere il throughput richiesto in primo luogo. La domanda di fattibilità (D) la ingloba.

**Perché non C?** La latenza Aurora di 1-5ms è ben all'interno della SLA dei 100ms per la porzione di query al database. Non è la preoccupazione principale.

*Dominio SAA-C03: Cross-domain — progettazione di sistemi*

**Esercizio 3 — Sfida di Architettura** *(Opzionale)*

Applica la struttura della revisione architetturale a un sistema reale o ipotetico:

Una startup vuole costruire un gioco di trivia multiplayer in tempo reale. I giocatori entrano in stanze di gioco (fino a 10 giocatori ciascuna). Ogni round mostra una domanda per 15 secondi; tutti i giocatori rispondono simultaneamente. I punteggi vengono calcolati istantaneamente dopo ogni domanda. Le partite durano 10 round. Utilizzo al picco: 50.000 partite concorrenti.

Percorri la revisione in sei fasi:

1. Quali sono i vincoli non negoziabili?
2. Quali sono le incognite e le assunzioni?
3. Quali sono le opzioni tecnologiche realistiche?
4. Quali sono i modi di guasto?
5. Come saprai quando è degradato?
6. Come appare il runbook delle 3 di notte?

*(Non esiste una risposta unica corretta. L'obiettivo è esercitarsi con la struttura della revisione come strumento di pensiero.)*

## Scena Post-Crediti

Carlos lasciò l'ufficio alle 18:00.

Il team rimase seduto per un po', senza fare nulla in particolare.

"Mi sembra di aver imparato di più in quelle due ore che in qualsiasi capitolo dedicato a un singolo servizio AWS," disse Leo.

"Perché quei capitoli erano sugli strumenti," disse Maya. "Questo era sul giudizio."

"Il giudizio si insegna?" chiese.

"Sì," disse Priya. "Ma non leggendo. Attraverso la pratica. Prendendo decisioni, vedendo cosa si rompe, riflettendo sul perché."

"Attraverso l'esperienza," disse Tom.

"Attraverso un'esperienza strutturata," corresse Priya. "L'esperienza senza riflessione non costruisce il giudizio. Devi porre le domande dopo."

Maya guardò la lavagna. Gli appunti della revisione erano ancora lì — vincoli, incognite, modi di guasto, domande sul monitoraggio. Riempivano due lavagne.

"Questo dovrebbe andare nell'ADR," disse.

Leo stava già digitando.

Nel prossimo capitolo: l'unica cosa che nessuno strumento o framework può darti — e perché "dipende" è la risposta più onesta e potente nell'architettura software.
