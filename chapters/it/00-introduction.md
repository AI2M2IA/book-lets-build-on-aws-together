# Capitolo 0: Prima di Iniziare

Maya era in piedi dietro al bancone del ristorante di famiglia un venerdì sera quando il pensiero la colpì.

Erano aperti da quattro anni. Il cibo era buono — la gente attraversava tutta la città per l'arepa. Ma ogni volta che qualcuno chiamava per fare un ordine, la linea era occupata. Ogni volta che qualcuno veniva a prendere del cibo che non aveva mai ordinato, era perché aveva chiamato e aveva rinunciato.

Si stavano perdendo ordini. I soldi uscivano dalla porta prima ancora di entrare.

E la parte peggiore era che nessuno riusciva a indicare un singolo fallimento drammatico.

Non era esploso nulla. Nulla si era bloccato. Non c'era nessun cattivo, nessun banner di interruzione del servizio, nessuno schermo rotto ovvio.

Era solo attrito. Piccolo, silenzioso, costoso attrito.

"Abbiamo bisogno di un sito web," disse Maya a nessuno in particolare.

Suo cugino Tom alzò lo sguardo dal foglio di calcolo che stava aggiornando a mano. Tom gestiva i "sistemi" del ristorante — una parola generosa per un Google Sheet condiviso e una lavagna — da due anni.

"Un sito web," ripeté. "E dove esattamente vive un sito web?"

Maya aprì la bocca. La chiuse.

Non ne aveva idea.

**Una Domanda che Sembra Semplice**

Dove vive un sito web?

Probabilmente non ci hai mai pensato. La maggior parte delle persone non lo fa. Digiti un indirizzo nel browser, appare una pagina, e da qualche parte tra questi due eventi accade la magia.

Finché non sei tu a pagare per la magia.

Ma non è magia. Sono computer.

Da qualche parte nel mondo, proprio ora, c'è un computer fisico — un server — che sta archiviando i file che compongono quel sito web. Quando chiedi al tuo browser la pagina, la tua richiesta viaggia attraverso internet, raggiunge quel computer, e il computer ti rimanda i file.

Tutto qui. Questo è un sito web.

Quindi la vera domanda è: il computer di *chi*?

**Tre Opzioni, Un Problema**

Nel ristorante, Maya e Tom annotarono le opzioni sulla lavagna.

**Opzione uno**: Comprare un computer, installarlo nel ristorante e gestire il sito web da lì. (Nel settore, questo si chiama gestire "on-premises" — il tuo edificio, i tuoi macchinari. Vedrai questo termine continuamente.)

Tom scrisse "bolletta elettrica" e "cosa succede se si rompe" accanto a questa opzione.

**Opzione due**: Pagare una società di hosting per gestire un piccolo server per loro. Economico, semplice. Funzionava per i blog personali nel 2008. Probabilmente non abbastanza flessibile per un'azienda in crescita.

"E se improvvisamente riceviamo mille ordini contemporaneamente?" chiese Maya.

Tom aggiunse "non può scalare" all'opzione due.

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

**Perché Amazon?**

È una domanda legittima. Amazon è nata come libreria.

Ecco cosa è successo: Amazon è cresciuta così in fretta che aveva bisogno di un'enorme quantità di potenza di calcolo per gestire i propri sistemi. Hanno costruito data center. Hanno assunto ingegneri per gestirli. Sono diventati molto, molto bravi a gestire computer su larga scala.

Poi qualcuno in Amazon ha avuto un'idea: e se vendessimo l'accesso a tutta questa potenza di calcolo ad altre persone?

Nel 2006, Amazon Web Services è stata lanciata. Oggi, AWS gestisce una parte significativa di internet. Il sito web che usi per prenotare i voli, l'app che traccia la tua consegna, il servizio di streaming che hai guardato ieri sera — c'è una buona probabilità che almeno una parte di esso giri su AWS.

Non è un monopolio. Google Cloud e Microsoft Azure sono concorrenti seri. Ma AWS è stata la prima, è grande, ed è di questo che parla questo libro.

**Conosci il Team**

Maya non ha costruito Nimbus da sola.

Ha chiamato Tom per prima — ovviamente. Tom aveva i fogli di calcolo, i contatti con i fornitori e la tenacia necessaria per realizzare davvero un'idea.

Tom conosceva uno sviluppatore. Leo. Ventiquattro anni, autodidatta, il tipo di persona che ha già costruito un prototipo prima che tu abbia finito di spiegare il problema. È arrivato al loro primo incontro con un laptop e un'app a metà.

"Ho già iniziato," disse, aprendo lo schermo. "Credo di averla distribuita da qualche parte."

Così era. Su un server che non capiva del tutto, in una regione che non aveva scelto intenzionalmente, che eseguiva codice che si sarebbe sicuramente rotto sotto carico.

Lo amarono immediatamente.

Priya arrivò dopo — segnalata da un amico comune. Laurea in ingegneria, specializzazione in sicurezza, il tipo di persona che legge post-mortem di famosi fallimenti tecnologici le domeniche sera. Aveva una domanda al suo primo incontro.

"Qualcuno ha pensato a cosa succede se qualcuno tenta di entrare?"

Silenzio.

"Benvenuta nel team," disse Maya.

**Cos'è Questo Libro**

Questa è la storia di Nimbus.

Nimbus è iniziato come un sistema di ordinazione per ristoranti ed è diventato qualcosa di molto più grande. Man mano che cresceva, ha incontrato ogni problema che il software in crescita incontra: sistemi che non riuscivano a gestire il traffico, dati che andavano persi, server che cadevano nei momenti peggiori, costi che crescevano più velocemente delle entrate.

E ogni volta che incappavano in un problema, trovavano un servizio AWS progettato per risolvere esattamente quel tipo di problema.

Questo libro ti insegna AWS seguendo quel percorso.

Imparerai non solo *cosa* fa ogni servizio, ma *perché* esiste, *quando* usarlo, e — altrettanto importante — *quando non usarlo*. Ogni strumento ha dei compromessi. Ogni decisione ha dei costi. Questo è ciò che gli ingegneri senior capiscono che quelli junior stanno ancora imparando.

Quando avrai finito questo libro, sarai pronto per sostenere l'esame AWS Solutions Architect Associate (SAA-C03). Ancora di più: sarai pronto per entrare in una vera conversazione tecnica e tenerti il tuo posto.

Questa è la promessa.

**Alcune Cose Prima di Iniziare**

**Questo libro presuppone che tu sappia quasi nulla di cloud computing.** Se hai sentito parlare di AWS ma non lo hai mai usato, sei nel posto giusto. Se non hai mai sentito parlare di AWS, sei anche nel posto giusto.

**Questo libro non presuppone che tu sia uno sviluppatore.** Maya non lo è. Tom a malapena. Non hai bisogno di scrivere codice per capire l'architettura. Hai bisogno di capire problemi e soluzioni.

**Questo libro a volte sarà sbagliato di proposito.** Il team farà errori. Sceglierà il servizio sbagliato. Salterà un passaggio di sicurezza di cui si pentirà. Provisionerà troppo e troppo poco. È così che impareranno, ed è così che imparerai anche tu.

**I consigli per l'esame sono reali.** Il SAA-C03 è un vero esame. Le domande basate su scenari alla fine di ogni capitolo sono progettate per sembrare l'esame vero. Se riesci a risponderle, sei sulla buona strada.

E un'altra cosa.

Leggi questo libro con una matita, o un'app per appunti, o un elenco corrente di momenti "penso che la risposta sia...".

Fai una pausa prima che il team decida qualcosa. Prendi tu stesso la decisione. Poi continua a leggere e guarda se avresti fatto lo stesso compromesso.

## Riepilogo

- **Il cloud** è l'accesso on-demand a risorse di calcolo tramite internet — i computer di qualcun altro che non devi possedere o manutenere.
- Le tre opzioni di hosting: on-premises (il tuo hardware, i tuoi costi), hosting condiviso (limitato, non scala), cloud (pay-as-you-go, scala con la domanda).
- **AWS** è stata lanciata nel 2006 quando Amazon ha aperto la sua infrastruttura di data center ai clienti esterni. Rimane il più grande fornitore di cloud, seguito da Microsoft Azure e Google Cloud.
- Nimbus — la storia che questo libro segue — inizia come sistema di ordinazione per ristoranti e cresce fino a diventare un'architettura cloud di livello produttivo.
- Questo libro insegna non solo *cosa* fa ogni servizio AWS, ma *perché* esiste, *quando* usarlo e *quando non usarlo*.

## Consigli per l'Esame

*Dominio SAA-C03: Cross-domain — Fondamentali del cloud computing*

- **Il cloud nell'esame** significa calcolo on-demand e pay-as-you-go tramite internet. È un modello di consegna, non una tecnologia.
- **CapEx vs. OpEx**: L'infrastruttura on-premises è una spesa in conto capitale (CapEx — acquisto hardware anticipato). Il cloud è una spesa operativa (OpEx — tariffe di utilizzo ricorrenti). Gli scenari dell'esame che chiedono di "eliminare i costi anticipati" o "passare da CapEx a OpEx" puntano verso l'adozione del cloud.
- **Vantaggi del cloud**: Nessun hardware anticipato, scalabilità elastica, paghi solo per ciò che usi, nessuna gestione dell'infrastruttura fisica. Gli scenari con "traffico imprevedibile" o "piccolo team, nessuna competenza hardware" sono forti segnali per il cloud.
- **AWS non è l'unico cloud** — Azure e GCP sono concorrenti reali — ma l'esame SAA-C03 è specifico per AWS. Non ti verrà chiesto di confrontare i provider.

## Punti di Forza e Limitazioni

**Punti di forza di questo approccio**: Imparare attraverso una narrativa continua dà contesto ai concetti prima che ricevano un nome. Quando arrivi a IAM o RDS, hai già sentito il problema che risolvono — perché Nimbus lo ha sentito per primo. Questo rende la memorizzazione più alta e il ragionamento sui compromessi più naturale rispetto a memorizzare elenchi di funzionalità.

**Limitazioni di cui essere consapevoli**: Questo libro copre il curriculum AWS SAA-C03 Solutions Architect Associate. È un ambito sostanziale, ma non include ogni servizio AWS — e le architetture di produzione coinvolgono sempre servizi e vincoli specifici del tuo settore e della tua scala. La storia di Nimbus è fittizia; le startup reali prendono decisioni più disordinate per ragioni più disordinate. Usa questo libro per costruire il ragionamento, non per copiare l'architettura.

## Esercizi

**Esercizio 1 — Ricorda**

Con parole tue: cos'è "il cloud" e perché una piccola impresa lo sceglierebbe invece di comprare i propri server?

*(Suggerimento: Pensa a cosa Maya e Tom hanno scritto accanto all'Opzione 1 sulla lavagna.)*

**Esercizio 2 — Pratica per l'Esame**

*Scenario*: Una piccola startup sta lanciando un'applicazione per la consegna di cibo. Si aspettano un traffico basso inizialmente, ma anticipano una rapida crescita se il prodotto avrà successo. Il team fondatore non ha esperienza nella gestione di server fisici. Vogliono ridurre al minimo i costi anticipati ed evitare l'onere operativo di manutenere l'hardware.

Quale dei seguenti approcci soddisfa MEGLIO i loro requisiti?

A) Acquistare un server dedicato e ospitare l'applicazione nel loro ufficio  
B) Utilizzare un provider cloud per ospitare l'applicazione e pagare solo per ciò che si usa  
C) Collaborare con un data center co-location per installare i propri server  
D) Costruire l'applicazione per funzionare completamente offline senza infrastruttura internet

**Suggerimento 1**: Pensa a cosa la startup deve *evitare* tanto quanto a cosa deve avere.

**Suggerimento 2**: Lo scenario menziona specificamente "nessuna esperienza nella gestione dell'hardware" e "ridurre al minimo i costi anticipati." Quale opzione elimina queste preoccupazioni?

**Suggerimento 3**: Abbiamo descritto questa opzione in questo capitolo come pagare per "i computer di qualcun altro."

**Risposta**: B

**Spiegazione**: I provider cloud come AWS offrono prezzi pay-as-you-go senza costi hardware anticipati, e gestiscono tutta la manutenzione dell'infrastruttura fisica. Questo è esattamente il modello che ha senso per una startup con traffico incerto e nessuna competenza hardware — proprio come Nimbus.

**Perché non A?** Acquistare un server dedicato richiede capitale anticipato, manutenzione continua e non offre capacità di scalare incorporata man mano che il traffico cresce.

**Perché non C?** La co-location risolve il problema dello spazio ma la startup deve ancora comprare, manutenere e gestire i propri server.

**Perché non D?** Un'applicazione per la consegna di cibo richiede per definizione la connettività internet.

*Dominio SAA-C03: Cross-domain — Fondamentali del cloud computing*

**Esercizio 3 — Sfida Architetturale** *(Facoltativo)*

Maya vuole convincere suo zio (che possiede il ristorante) a lasciarle costruire un sistema di ordinazione basato su cloud. Lui è scettico: "Perché dovremmo pagare Amazon ogni mese quando potremmo comprare un computer una volta sola?"

Come spiegheresti i compromessi? Quali pensi siano i maggiori vantaggi dell'approccio cloud per un ristorante? E qual è lo scenario in cui comprare il proprio computer potrebbe avere effettivamente più senso?

*(Non esiste una risposta unica corretta. L'obiettivo è praticare il pensiero sui compromessi.)*

## Scena Post-Crediti

Tardi quella notte, dopo che tutti gli altri erano andati a casa, Maya era seduta da sola nel ristorante con il suo laptop.

Aveva trovato il sito web di AWS. Aveva navigato su alcune pagine. Erano elencati centinaia di servizi. Centinaia.

Ha scorso verso il basso. E ancora. E ancora.

Poi ha chiuso il laptop.

"Abbiamo bisogno di un piano," disse alla stanza vuota.

Nel prossimo capitolo: perché le aziende hanno smesso di comprare server e hanno iniziato ad affittarli — e cosa è cambiato.
