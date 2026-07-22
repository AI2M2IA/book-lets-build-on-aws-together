# Capitolo 9: Quando la Tabella Diventa Enorme

La cucina del primo ristorante partner di Nimbus profumava di aglio e pane caldo anche alle dieci di mattina. Maya era lì per una demo, a guardare un cuoco che scorreva l'app per registrare una sostituzione — pesce invece di gamberi, temporaneamente esaurito. Lo swipe avvenne. Il menu si aggiornò. Un cliente dall'altra parte della città vide il cambiamento in pochi secondi.

Sembrava magia.

Di ritorno in ufficio, la magia aveva iniziato a rallentare.

La tabella del menu aveva 50.000 voci.

Questo riguardava 287 ristoranti — il numero di partner era esploso dai quarantasette dell'era del load balancer a quasi trecento nel giro di meno di un anno — ognuno con offerte speciali giornaliere, articoli stagionali e variazioni regionali. Alcune voci avevano modificatori — dimensione, livello di piccantezza, scelta della proteina. Alcune avevano offerte combinate che facevano riferimento ad altri articoli. Alcune apparivano nel menu solo nei giorni feriali, o solo a pranzo, o solo in determinate città.

La query SQL che recuperava il menu completo di un ristorante restituiva in 200 millisecondi.

Ora impiegava quattro secondi.

Non era il problema dell'indice mancante che Leo aveva individuato con Performance Insights — quella singola ricerca su una tabella restituiva ancora in 14 millisecondi. Era la query ricca di join che assemblava l'intero menu di un ristorante: voci, modificatori, combo e finestre di disponibilità, tutto cucito insieme.

Quattro secondi è la differenza tra qualcuno che effettua un ordine e qualcuno che chiude l'app. Leo aveva esaminato il piano di query. Tom aveva guardato la configurazione degli indici. Priya aveva aumentato il numero di repliche di lettura. Nessuno aveva fatto una differenza significativa.

E questo aveva cambiato l'umore nella stanza.

---

*La settimana precedente, il team aveva finalmente messo RDS sotto controllo. Standby Multi-AZ, backup automatici, una replica di lettura per gestire le query di reporting. Il problema del DBA — quello che teneva Leo sveglio di notte — era risolto. Il livello del database gestito era stabile. Ma stabile non significava veloce, e la velocità era ora il problema. La tabella del menu aveva iniziato a toccare limiti che più repliche non potevano risolvere. La forma stessa dei dati era sbagliata.*

---

**Il Primo Tentativo: Più Indici**

Leo aveva il piano di query aperto. Lo percorse con attenzione.

"Il problema è questo join," disse. "Quando recuperiamo il menu di un ristorante, uniamo la tabella menu_items contro la tabella modifiers, poi contro la tabella combos, poi contro la tabella availability_windows. Quattro tabelle, tre join, cinquantamila righe."

Aggiunse un indice su `restaurantId` in ogni tabella. Rieseguì la query. Due secondi. Meglio, ma non abbastanza.

Tom aveva letto qualcosa sugli hint per le query. Trascorse un pomeriggio a fare aggiustamenti. Un secondo e tre decimi. Ancora non buono.

"E se denormalizzassimo?" chiese Leo. "Combiniamo i modificatori in una colonna JSON direttamente nella tabella menu_items. Meno join."

Provarono. Un secondo preciso. Sembrava un progresso. Maya mandò un messaggio ai partner dei ristoranti dicendo che avevano risolto il problema di velocità. Era un martedì.

Giovedì la query era tornata a 2,8 secondi. I loro dati erano cresciuti. Più ristoranti erano stati onboarded. Più voci per ristorante. La query che sembrava risolta non era risolta.

"L'approccio con gli indici tiene il passo con i dati di oggi," disse Priya. "Ma stiamo aggiungendo quaranta ristoranti a settimana. Nel prossimo trimestre avremo il doppio delle voci. Come sarà la query allora?"

"Tre secondi come minimo," disse Leo. "Probabilmente cinque."

"Quindi ci siamo guadagnati qualche settimana."

"Sì."

Si sedettero con questa consapevolezza. Una soluzione che scade non è davvero una soluzione.

---

**Il Secondo Tentativo: Repliche di Lettura**

Priya aveva già aumentato il numero di repliche di lettura una volta. Ci riprovò — ora due repliche di lettura, e l'applicazione bilanciava il carico tra di esse. La teoria era solida: distribuire il traffico di lettura, ogni replica gestisce meno lavoro.

Aiutò un po'. Il carico di picco scese da 2,8 secondi a 2,2 secondi.

"Il problema non è il numero di letture," disse Tom, guardando le metriche del database. "È la query stessa. Più repliche significa più server che eseguono la stessa query lenta. La query è ancora lenta."

"Quanto costa al mese?" aggiunse, perché lo chiedeva sempre. "Due repliche di lettura extra su un db.r5.large — circa 350 dollari al mese. Per un miglioramento di due secondi."

Leo chiuse il pannello delle repliche.

"Quindi più hardware non risolve una query cattiva," disse Maya.

"Quando un problema sopravvive all'indicizzazione, ai tentativi di caching e a repliche extra," disse Leo lentamente, "forse il problema non è la configurazione. Forse è la forma del sistema."

Fu l'inizio di una conversazione più lunga.

---

**Il Problema di Inserire Tutto in una Tabella**

Ecco la tensione centrale dei database relazionali: sono progettati per archiviare dati *strutturati* in forme *fisse*.

Se ogni voce del menu avesse gli stessi campi — nome, prezzo, descrizione, categoria — SQL sarebbe perfetto. Avresti una tabella pulita `menu_items`, righe per ogni voce e query che hanno senso.

Ma i menu reali non funzionano così.

Una voce potrebbe avere un modificatore di "livello di piccantezza". Un'altra potrebbe avere una "scelta della proteina". Una terza potrebbe avere combo annidate — "ordina il pasto per famiglia e ottieni due piatti principali, due contorni e una bevanda." La struttura dei dati varia *per voce*.

In SQL, hai due opzioni:

**Opzione 1**: Crea una colonna per ogni possibile modificatore. Questo produce una tabella molto larga dove la maggior parte delle colonne è vuota la maggior parte del tempo.

**Opzione 2**: Crea una tabella separata per i modificatori e uniscila alla tabella menu_items. Questo funziona, ma i menu complessi richiedono più join e, a cinquantamila voci con un alto volume di lettura, quei join diventano costosi.

"C'è una terza opzione," disse Priya, che aveva letto la documentazione tranquillamente nell'angolo.

Aprì una nuova scheda. "E se i dati non dovessero adattarsi a una tabella?"

**Un Modo Diverso di Pensare ai Dati**

I database relazionali archiviano i dati come righe in tabelle. Ogni riga deve conformarsi allo schema della tabella. Lo schema è concordato in anticipo.

I database NoSQL archiviano i dati in modo diverso. Un approccio comune è il *modello a documento*: ogni record è memorizzato come un documento autonomo (solitamente JSON) e i documenti nella stessa collezione non devono avere gli stessi campi.

Una voce del menu in un modello a documento potrebbe apparire così:

```json
{
  "itemId": "ITEM-001",
  "restaurantId": "NIMBUS-047",
  "name": "Shrimp Arepa",
  "price": 3200,
  "modifiers": [
    { "name": "Spice Level", "options": ["mild", "medium", "hot"] },
    { "name": "Protein", "options": ["shrimp", "fish", "mixed"] }
  ],
  "available": true,
  "seasonalUntil": "2024-03-31"
}
```

Un'altra voce potrebbe apparire completamente diversa:

```json
{
  "itemId": "ITEM-002",
  "restaurantId": "NIMBUS-047",
  "name": "Family Feast",
  "price": 9800,
  "includes": ["ITEM-010", "ITEM-011", "ITEM-015", "ITEM-020"],
  "servings": 4,
  "available": true
}
```

Forme diverse. Stessa collezione. Nessun problema.

"Quindi il database è più simile a un sistema di archiviazione che a una tabella," disse Maya.

"Esattamente," disse Priya. "Puoi mettere qualsiasi documento in qualsiasi cassetto. Non devi ritagliare il documento per farlo stare in una dimensione fissa."

**Alla Scoperta di DynamoDB**

Amazon DynamoDB è il servizio di database NoSQL gestito di AWS. Memorizza i dati come elementi (non righe), e gli elementi sono raccolti in tabelle (la nomenclatura è simile a SQL, ma il comportamento è diverso).

Ogni elemento in una tabella DynamoDB deve avere una **chiave primaria**, che lo identifica in modo univoco. Tutto il resto è flessibile.

La chiave primaria può avere una di due forme:

**Solo chiave di partizione**: Un singolo attributo che deve essere univoco per tutti gli elementi.

**Chiave di partizione + chiave di ordinamento (chiave primaria composta)**: Due attributi che *insieme* formano una combinazione univoca. Questo ti consente di avere più elementi con la stessa chiave di partizione, differenziati dalla loro chiave di ordinamento.

Per il menu di Nimbus:

- Chiave di partizione: `restaurantId`
- Chiave di ordinamento: `itemId`

Questo significa che puoi recuperare tutti gli elementi per un ristorante specifico in modo efficiente — DynamoDB sa esattamente in quale partizione cercare.

"Perché si chiama chiave di partizione?" chiese Tom.

"Perché decide dove i dati risiedono fisicamente," disse Leo. "DynamoDB suddivide una tabella su molte partizioni fisiche — storage separato su server separati — e la chiave determina in quale partizione finisce ogni elemento."

"E se qualcuno tenta di violare il sistema?" chiese Priya. "Se la chiave di partizione è indovinabile, qualcuno potrebbe inondare una partizione con scritture e causare intenzionalmente la condizione di hot spot?"

"Sì," disse Leo. "In realtà è un vettore di denial-of-service per le tabelle mal progettate. Il che è un altro motivo per scegliere chiavi ad alta cardinalità."

Priya lo annotò.

**Come DynamoDB Memorizza i Dati Internamente**

DynamoDB è costruito per scalare orizzontalmente a dimensioni enormi. Lo ottiene attraverso la *partizionamento* — i dati sono suddivisi su molte macchine fisiche in base alla chiave di partizione.

Quando scrivi un elemento, DynamoDB calcola l'hash del valore della chiave di partizione e lo usa per determinare quale partizione fisica (e quindi quale server) memorizza l'elemento. Quando leggi un elemento, DynamoDB esegue lo stesso calcolo per trovarlo istantaneamente.

Pensalo come un sistema postale. Se ogni busta ha un codice postale, il servizio postale non legge ogni busta per capire dove appartiene — la smista per codice postale. DynamoDB smista per hash della chiave di partizione.

"Aspetta — ma *perché* dovremmo farlo in questo modo?" chiese Maya. "Perché la scelta della chiave di partizione è così importante? Non possiamo scegliere qualsiasi cosa?"

Questa è la domanda giusta. La chiave di partizione è la singola decisione di design più importante in uno schema DynamoDB. Ecco perché:

Se scegli una chiave di partizione con bassa cardinalità — ad esempio, `available: true/false`, o `category: "main/side/drink"` — la maggior parte dei tuoi dati finisce nelle stesse poche partizioni. DynamoDB chiama questo una "partizione calda". Un server gestisce la maggior parte del traffico. Si sovraccarica. DynamoDB inizia a limitare le richieste. Gli utenti iniziano a vedere errori.

- **Buono**: Alta cardinalità, valori distribuiti uniformemente (`restaurantId` con molti ristoranti)
- **Cattivo**: Bassa cardinalità (`true/false`, `category`) — la maggior parte dei dati finisce su poche partizioni, creando "hot spot"

"Quindi se avessi usato `available: true` come chiave di partizione," disse Leo lentamente, "tutti gli elementi disponibili si accumulerebbero sulla stessa partizione."

"E il tuo database si scioglierebbe durante l'ora di punta della cena," confermò Priya.

Leo chiuse il laptop lentamente.

---

**L'Incidente della Partizione Calda**

Non avrebbero dovuto immaginarlo. Ecco un'anteprima di un incidente avvenuto mesi dopo — il loro secondo mese su DynamoDB, prima che avessero davvero interiorizzato la regola — quando la impararono a proprie spese.

Il team aveva lanciato una nuova funzionalità: un badge "Articoli in Evidenza". I partner ristoranti potevano contrassegnare fino a cinque articoli come in evidenza. La funzionalità memorizzava un attributo `featured: true` su ogni articolo.

Leo pensava che sarebbe stato utile interrogare tutti gli articoli in evidenza di tutti i ristoranti — per un widget "articoli di tendenza" nella homepage. Aveva creato un indice secondario per supportare questa query. L'indice usava `featured` come chiave di partizione.

"Andrà bene," aveva detto. "Quanti articoli in evidenza ci possono essere?"

Circa milleduecento, distribuiti su duecentoquaranta ristoranti.

Ma il widget "articoli di tendenza" si caricava su ogni pagina. Ogni caricamento di pagina attivava una query contro l'indice `featured`. Tutti e milleduecento gli articoli vivevano su due partizioni — `true` e `false`. La partizione `true` riceveva ogni hit.

Venerdì sera durante l'ora di punta della cena. Ottomila utenti concorrenti. Tutti che caricavano la homepage.

Il tasso di errore di DynamoDB salì al diciotto percento. Alcuni utenti videro un widget di tendenza vuoto. Alcuni videro spinner di caricamento. Alcuni ricevettero errori che si propagarono nel flusso degli ordini.

Leo estrasse le metriche. "La partizione dell'indice viene limitata," disse. "Stiamo raggiungendo il limite di throughput su una singola partizione."

"Come?" chiese Priya.

"La chiave `featured` ha solo due valori. Tutti e milleduecento gli articoli in evidenza vivono sulla stessa partizione. Ogni caricamento della homepage colpisce quella partizione."

Disabilitarono il widget di tendenza entro tre minuti. Il tasso di errore scese a zero.

"Quindi una chiave di partizione con due valori ci ha limitato un venerdì sera," disse Tom.

"Sì," disse Leo.

"Quanto ci è costato?"

"Circa quaranta minuti di esperienza degradata per ottomila utenti," disse Priya. "Impatto sui ricavi, probabilmente qualche centinaio di ordini."

Leo sostituì l'indice con un design diverso: una tabella DynamoDB dedicata chiamata `featured_items` con `restaurantId` come chiave di partizione e una Lambda pianificata — un piccolo pezzo di codice che AWS esegue per te (Capitolo 20) — che la aggiornava ogni quindici minuti dalla tabella principale. La query diventò una scansione su una piccola tabella isolata invece di una partizione calda sulla principale.

"Progetta prima i tuoi pattern di accesso," disse Priya. "Poi scegli il tuo modello di dati."

"Lo so," disse Leo. "Lo so adesso."

---

**Lettura e Scrittura su Scala**

DynamoDB può gestire milioni di richieste al secondo. Ma ha bisogno di sapere quanta capacità allocare.

Ci sono due modalità di capacità:

**Capacità provisioned**: Specifichi quante unità di lettura e scrittura desideri. DynamoDB riserva quella capacità per te e limita il traffico che la supera. Costo prevedibile, prezzo inferiore per richiesta.

Le unità hanno definizioni precise, e l'esame si aspetta che tu le conosca: una **Read Capacity Unit (RCU)** corrisponde a una lettura fortemente coerente al secondo di un elemento fino a 4 KB — oppure a due letture eventualmente coerenti della stessa dimensione. Una **Write Capacity Unit (WCU)** corrisponde a una scrittura al secondo di un elemento fino a 1 KB. Gli elementi più grandi consumano proporzionalmente di più: leggere un elemento da 12 KB in modo fortemente coerente costa 3 RCU; scrivere un elemento da 3 KB costa 3 WCU.

**Capacità on-demand**: DynamoDB scala automaticamente con il tuo traffico effettivo. Non è richiesta una pianificazione ordinaria della capacità. Costo più elevato per richiesta e molto più semplice dal punto di vista operativo, anche se picchi improvvisi ben oltre il recente pattern di traffico di una tabella possono comunque causare limitazioni se crescono troppo rapidamente.

Per Nimbus, il menu viene letto molto più spesso di quanto venga scritto. Un cliente apre l'app, sfoglia il menu — questo comporta molte letture. Un partner del ristorante aggiorna il proprio menu due volte a settimana — questo comporta scritture occasionali.

"La capacità on-demand ha senso per ora," disse Tom. "Non conosciamo ancora i nostri pattern di traffico. Meglio pagare di più per richiesta che sottodimensionare e ricevere limitazioni."

Saggezza infrastrutturale riluttante. Da Tom. Il team era ufficialmente cresciuto.

"Quanto costa al mese?" chiese Tom, aprendo il calcolatore dei prezzi.

"Al nostro volume attuale di letture — circa quarantamila letture al giorno, dove ogni lettura è una query multi-elemento del menu che restituisce circa cento kilobyte, quindi circa venticinque unità di richiesta di lettura ciascuna — la modalità on-demand è circa dodici dollari al mese," disse Leo. "Con il provisioned, se lo calibriamo bene, è più vicino a quattro. Ma dovremmo impostare manualmente la capacità e rischiare di ricevere limitazioni se indoviniamo male."

Tom annotò entrambi i numeri. Annotava sempre i numeri.

**Coerenza: Quanto Freschi Sono i Tuoi Dati?**

DynamoDB replica i dati su più Availability Zone automaticamente. Questo è ottimo per la durabilità, ma significa anche che devi pensare con chiarezza alla coerenza delle letture.

Quando leggi da DynamoDB, hai una scelta:

**Lettura eventualmente coerente**: Questa è l'opzione predefinita. È più economica e il risultato potrebbe essere temporaneamente in ritardo rispetto a una scrittura appena completata.

**Lettura fortemente coerente**: Per le letture su una tabella o un indice secondario locale, DynamoDB può restituire l'ultimo valore confermato da scritture precedenti riuscite. Questo costa più capacità di lettura e non è disponibile per gli indici secondari globali.

Per i dati del menu, la coerenza eventuale va bene. Una voce del menu che è un millisecondo indietro non importa.

Per i dati di conferma dell'ordine — "questo ordine è stato effettuato?" — vorresti la coerenza forte. Il cliente non dovrebbe vedere un messaggio "riprova" quando il suo ordine è appena stato salvato.

"È come la differenza tra controllare il saldo sul conto via app e chiamare la banca direttamente," disse Maya. "L'app potrebbe essere trenta secondi indietro. La telefonata è sempre aggiornata."

Potresti chiederti: se DynamoDB replica su più AZ automaticamente, perché la modalità di coerenza è rilevante? Ecco la risposta: la replica richiede una quantità piccola ma non nulla di tempo — in genere millisecondi. Una lettura eventualmente coerente potrebbe essere servita da una replica che non ha ancora ricevuto l'ultima scrittura. Una lettura fortemente coerente contatta sempre la copia primaria dei dati. Per la maggior parte dei casi d'uso (voci del menu, cataloghi prodotti, profili utente) il ritardo è impercettibile. Per i casi d'uso in cui la correttezza è fondamentale nel momento della lettura (conferma del pagamento, disponibilità delle scorte), vuoi la coerenza forte.

**Indici Secondari: Interrogare Oltre la Chiave Primaria**

E se hai bisogno di accedere ai dati in modo diverso da quello consentito dalla chiave primaria?

DynamoDB supporta gli **indici secondari** — chiavi alternative che ti permettono di interrogare gli stessi dati usando attributi diversi.

**Local Secondary Index (LSI)**: Usa la stessa chiave di partizione della tabella, ma una chiave di ordinamento diversa. Deve essere definito al momento della creazione della tabella e non può essere aggiunto successivamente. Condivide la capacità provisioned della tabella. Poiché i LSI condividono la partizione, supportano le letture fortemente coerenti.

**Global Secondary Index (GSI)**: Un indice completamente separato con la propria chiave di partizione e chiave di ordinamento — diverse dalla chiave primaria della tabella. Può essere aggiunto o rimosso dopo che la tabella esiste, il che ti dà flessibilità. Ha le proprie impostazioni di capacità provisioned, separate dalla tabella.

Per Nimbus: se avessero bisogno di interrogare le voci per fascia di prezzo, un GSI potrebbe supportarlo — ma con una regola in mente: una chiave di partizione accetta solo confronti di *uguaglianza*, quindi `price` (su cui vuoi fare range) deve essere la **chiave di ordinamento**, con un attributo di raggruppamento come category o `cuisineType#region` come chiave di partizione del GSI. È esattamente l'indice costruito nella procedura dettagliata qui sotto.

Se scegli un LSI, ottieni coerenza forte e capacità condivisa, ma sei vincolato a quel design al momento della creazione della tabella; se scegli un GSI, ottieni la flessibilità di aggiungerlo in seguito e la scalabilità indipendente, ma perdi la possibilità di eseguire letture fortemente coerenti sull'indice.

---

**Una Procedura Dettagliata su una Query GSI**

Priya illustrò un esempio concreto. Nimbus voleva supportare una funzionalità "sfoglia per cucina": mostrare tutti i piatti disponibili di un particolare tipo di cucina in tutti i ristoranti partner.

La tabella principale ha `restaurantId` come chiave di partizione e `itemId` come chiave di ordinamento. Non puoi interrogare "tutti gli elementi con cuisineType = Colombiana" in modo efficiente — richiederebbe una scansione di ogni partizione.

Crearono un GSI:

- Chiave di partizione del GSI: `cuisineType#region` (ad esempio, "Colombiana#NYC", "Messicana#Chicago")
- Chiave di ordinamento del GSI: `price`

Il GSI duplica una proiezione di ogni elemento — solo i campi necessari per la pagina di navigazione — nell'archivio dell'indice. Ora una query contro il GSI con `cuisineType#region = "Colombiana#NYC"` va direttamente a quella partizione dell'indice.

"Perché non usare solo `cuisineType`?" chiese Leo.

"Perché cuisineType da solo ha bassa cardinalità," disse Priya. "Colombiana, Messicana, Thailandese — venti valori in totale. Di nuovo le partizioni calde. Aggiungendo la regione otteniamo Colombiana#NYC, Colombiana#Chicago, Colombiana#LA. Più partizioni, distribuzione migliore."

"Sembra un po' un trucco."

"È un pattern standard di DynamoDB. Si chiama write sharding. A volte devi lavorare con lo strumento."

La query GSI nel codice appariva così:

```python
response = dynamodb.query(
    TableName='menu',
    IndexName='cuisineType-price-index',
    KeyConditionExpression='#ct = :ct AND price BETWEEN :lo AND :hi',
    ExpressionAttributeNames={'#ct': 'cuisineType#region'},
    ExpressionAttributeValues={
        ':ct': {'S': 'Colombian#NYC'},
        ':lo': {'N': '1000'},
        ':hi': {'N': '2500'}
    }
)
```

Restituì tutti i piatti colombiani a New York City con prezzi compresi tra $10 e $25, ordinati per prezzo, in circa 4 millisecondi.

"È più veloce della vecchia query SQL di un fattore mille," disse Leo.

"Perché tocca solo una partizione di un indice," confermò Priya. "Non scansiona ogni riga in una tabella con join."

---

**DynamoDB Streams: Reagire ai Cambiamenti**

"Abbiamo pensato a cosa succede quando una voce del menu viene aggiornata?" chiese Priya una mattina. "Un partner del ristorante cambia un prezzo. Dobbiamo aggiornare l'indice di ricerca. Dobbiamo invalidare la voce di ElastiCache" — il servizio di caching che incontreremo nel prossimo capitolo — "e dobbiamo registrare la modifica per la nostra pipeline di analisi."

"Potremmo fare tutto questo nell'handler dell'API," disse Leo. "Quando avviene la scrittura, attiviamo tutti gli aggiornamenti a valle."

"E se uno di essi fallisce?"

"Allora... riproviamo."

"E se l'istanza EC2 si blocca dopo la scrittura ma prima degli aggiornamenti a valle? Il dato è salvato, ma nulla sa del cambiamento."

Leo ci pensò.

"Abbiamo bisogno che l'aggiornamento sia garantito," disse. "Anche se il nostro codice applicativo fallisce a metà."

Questo è ciò che **DynamoDB Streams** risolve.

DynamoDB Streams cattura un log ordinato per tempo di ogni modifica degli elementi in una tabella DynamoDB. Ogni inserimento, aggiornamento e cancellazione viene scritto nello stream come evento. Lo stream conserva gli eventi per 24 ore.

Puoi collegare una funzione Lambda allo stream. Ogni volta che un elemento cambia, la funzione Lambda viene invocata con lo stato prima e dopo dell'elemento. La Lambda può quindi:

- Aggiornare un indice di ricerca (OpenSearch)
- Invalidare una voce della cache in ElastiCache
- Inviare una notifica a un altro sistema
- Alimentare una pipeline di analisi
- Replicare il cambiamento in un'altra tabella o database

La differenza critica: Streams disaccoppiano la scrittura dagli effetti a valle. La scrittura su DynamoDB ha successo indipendentemente dal fatto che la Lambda abbia successo. Se la Lambda fallisce, DynamoDB la riprova. Se l'applicazione si blocca dopo la scrittura, l'evento dello stream è ancora lì — la Lambda lo elaborerà quando le cose si riprendono.

"Quindi scriviamo su DynamoDB," disse Leo lentamente, "e DynamoDB garantisce che l'elaborazione a valle avvenga eventualmente, anche se ci blochiamo."

"Esattamente," disse Priya. "È la differenza tra sperare che tutti i tuoi effetti collaterali vengano eseguiti e avere il database che li garantisce."

Per Nimbus, collegarono DynamoDB Streams sulla tabella menu a una Lambda che invalidava le voci di ElastiCache quando le voci del menu cambiavano. La cache rimaneva coerente con il database, automaticamente, senza alcun codice applicativo che gestisse l'invalidazione.

"Quanto costa Streams?" chiese Tom.

"Paghi per la lettura dallo stream — ogni invocazione della Lambda legge da esso. Al nostro volume, probabilmente due o tre dollari al mese."

Tom lo approvò senza ulteriori domande. Aveva imparato quando due dollari al mese valevano la pena.

**Il Compromesso: Cosa Non Può Fare DynamoDB**

NoSQL non è strettamente migliore di SQL. È uno strumento diverso per un lavoro diverso.

Ciò a cui DynamoDB rinuncia:

**Query flessibili**: In SQL, puoi filtrare e ordinare per qualsiasi colonna. In DynamoDB, puoi interrogare in modo efficiente solo per chiave primaria. Interrogare per campi arbitrari richiede una *scan* (lettura di ogni elemento nella tabella), che è costosa e lenta su larga scala.

**Join**: DynamoDB non fa join. Se hai bisogno di dati da due tabelle, esegui due letture separate nel tuo codice applicativo.

**Transazioni**: DynamoDB supporta le transazioni, ma i database relazionali sono ancora più adatti per molte workflow multi-entità, sistemi con molti report e design con molti join.

**Familiarità**: Decenni di strumenti SQL, competenze e modelli mentali non si trasferiscono direttamente.

Dove DynamoDB eccelle:

- Pattern di accesso chiave-valore e a documento
- Scala massiva (latenza a singola cifra di millisecondi a qualsiasi dimensione)
- Serverless, nessuna gestione dell'infrastruttura
- Scalabilità automatica, replica multi-AZ, backup
- Prestazioni prevedibili indipendentemente dal volume dei dati

"Quindi la regola è," disse Maya, "usa DynamoDB quando sai *esattamente* come accederai ai dati. Usa SQL quando non lo sai ancora."

Priya annuì. "Progetta prima i tuoi pattern di accesso. Poi scegli il tuo database."

Questo è uno dei risultati più saggi che una conversazione su un database possa produrre.

---

**Quando DynamoDB È la Scelta Sbagliata**

Tom, che si era occupato del modulo di reporting finanziario, aveva una domanda.

"Stiamo costruendo il reporting finanziario," disse. "Riepiloghi mensili dei ricavi per ristorante, calcoli fiscali, storico delle fatture. Possiamo mettere anche quello in DynamoDB?"

Il team si guardò l'un l'altro.

"Aspetta — ma *perché* dovremmo farlo in questo modo?" chiese Maya, prima che Priya potesse farlo.

Priya sorrise. Maya stava acquisendo l'abitudine.

"Illustraci le query," disse Priya a Tom.

Lui aprì la specifica. "Abbiamo bisogno di: ricavi totali per ristorante, raggruppati per settimana. Articoli con le migliori performance per numero di ordini, in tutti i ristoranti. Ricavi suddivisi per tipo di cucina. Valore medio dell'ordine per città. Confronto anno su anno per il reporting dei partner."

Leo lesse l'elenco. "Ognuna di queste è un'aggregazione. Somma, raggruppa, media, confronta."

"DynamoDB non ha funzioni di aggregazione," disse Priya. "Nessun GROUP BY. Nessun SUM. Nessun AVG. Per rispondere a 'ricavi totali per ristorante questa settimana', dovresti scansionare ogni ordine della settimana, caricarli tutti in memoria applicativa e calcolarlo tu stesso."

"Sembra brutto," disse Tom.

"Alla nostra scala, sono decine di migliaia di record caricati in memoria per ogni richiesta di report. Sarebbe lento e costoso. E ogni volta che aggiungessimo un nuovo requisito di report, scriveremmo nuovo codice di scan e calcolo."

"Quindi cosa usiamo?"

"Per il reporting finanziario? RDS. PostgreSQL con indici adeguati. Le query che hai descritto sono esattamente per quello che SQL è stato progettato. Sarebbero dieci righe di SQL. Sarebbero duecento righe di codice di scan DynamoDB."

DynamoDB è sbagliato quando:

- Non conosci i tuoi pattern di accesso in anticipo (il reporting è intrinsecamente esplorativo)
- Hai bisogno di aggregazioni (SUM, GROUP BY, COUNT) su grandi dataset
- I tuoi dati hanno relazioni complesse e hai bisogno di join
- Hai bisogno di flessibilità di query ad hoc — per fare domande che non hai ancora pensato
- I tuoi dati hanno una struttura fondamentalmente relazionale che non si mappa naturalmente su chiave-valore

"Quindi la scelta non è 'la nuova tecnologia è meglio,'" disse Maya.

"La scelta è 'che forma hanno i tuoi dati, e come li accederai,'" confermò Priya. "DynamoDB è genuinamente migliore per il menu. Sarebbe genuinamente peggiore per i report finanziari. Entrambe le affermazioni sono vere allo stesso tempo."

Tom costruì il reporting finanziario su PostgreSQL. La prima query GROUP BY che scrisse restituì in 80 millisecondi. Non dovette scrivere una singola riga di codice di scan.

---

**Quando Usare Ciascuno**

| Situazione                                                    | Scegli                  |
|---------------------------------------------------------------|-------------------------|
| Dati strutturati, query complesse, reporting                  | RDS (PostgreSQL, MySQL) |
| Forme di dati flessibili, accesso basato su chiave, scala massiva | DynamoDB            |
| Scritture intensive con relazioni complesse                   | RDS                     |
| Letture intensive con pattern di accesso prevedibili          | DynamoDB                |
| Hai bisogno di join e aggregazioni                            | RDS                     |
| Hai bisogno di latenza a millisecondi a milioni di req/sec    | DynamoDB                |
| Transazioni tra più entità                                    | RDS (solitamente)       |
| Traffico serverless / picchi imprevedibili                    | DynamoDB on-demand      |
| Reporting finanziario, analisi ad hoc                         | RDS o un data warehouse |
| Event sourcing, change capture, elaborazione in tempo reale   | DynamoDB + Streams      |

La risposta sbagliata è sempre "usare sempre uno o l'altro." Nimbus finì per usare entrambi: RDS per lo storico degli ordini e i registri finanziari (strutturati, relazionali, necessita di reporting), DynamoDB per il menu (schema flessibile, alto volume di lettura, accesso tramite ID ristorante).

## Il Database Giusto per il Carico di Lavoro Giusto

Saltiamo in avanti di sei mesi — ben dopo che la migrazione a DynamoDB si era stabilizzata — e Nimbus aveva tre nuovi progetti in agenda. Maya li illustrò al team un martedì mattina.

"Primo: un motore di raccomandazioni. Vogliamo mostrare ai clienti i piatti che probabilmente ordineranno in base alla loro cronologia e a ciò che le persone con gusti simili hanno ordinato. Secondo: stiamo spostando i dati del menu per supportare contenuti più ricchi — documenti di menu completi in JSON, struttura diversa per ristorante, schema flessibile. Terzo: stiamo per chiudere l'acquisizione di Barato, e il loro team di dati gestisce un cluster Cassandra per i dati di comportamento dei clienti. Vogliono portarlo su AWS senza riscrivere le loro pipeline."

Tre progetti. Tre requisiti di dati molto diversi. Nessuno di essi era un candidato ovvio per DynamoDB.

"Questi richiedono tutti database diversi," disse Priya.

"Abbiamo DynamoDB," disse Leo.

"Abbiamo il diritto di scegliere lo strumento giusto," disse Priya.

**Amazon DocumentDB: Quando il Tuo Carico di Lavoro Parla MongoDB**

Il secondo progetto — documenti di menu JSON ricchi con schemi flessibili per ristorante — descriveva un database a documenti. Nimbus stava già usando lo schema flessibile di DynamoDB per il menu, ma man mano che il team costruiva funzionalità di menu più sofisticate (modificatori annidati, prezzi in base all'orario, strutture di combo complesse), il modello di query di DynamoDB mostrava i suoi limiti. Il team voleva query su documenti più ricche: trovare tutte le voci del menu in cui un modificatore annidato contiene un'opzione specifica, filtrare per campi arbitrari all'interno della struttura JSON.

"Questo è un pattern di database a documenti," disse Priya. "MongoDB."

"Potremmo eseguire MongoDB su EC2," propose Leo.

"O potremmo usare DocumentDB," disse Priya.

**Amazon DocumentDB** è un database a documenti gestito compatibile con MongoDB. Memorizza i dati come documenti simili a JSON con schemi flessibili — documenti diversi nella stessa collezione possono avere campi diversi. DocumentDB supporta il linguaggio di query, le API e i driver di MongoDB. Se il tuo carico di lavoro attualmente gira su MongoDB, DocumentDB parla la stessa lingua. Il percorso di migrazione è cambiare una stringa di connessione, non riscrivere un'applicazione.

DocumentDB è completamente gestito: nessuna patch, backup automatici, alta disponibilità Multi-AZ, repliche di lettura e storage che cresce automaticamente man mano che i tuoi dati crescono.

"Quindi migrare il menu a DocumentDB," disse Leo. "E le query che abbiamo già in sintassi MongoDB funzionano?"

"Con test di compatibilità minori, sì," confermò Priya. "DocumentDB supporta la maggior parte dell'API di query di MongoDB. Controlla la matrice di compatibilità prima di assumere la copertura completa, ma per le query su documenti e le aggregazioni è semplice."

Il segnale dell'esame per DocumentDB è semplice: **"compatibile con MongoDB"** o **"document store"**. Se uno scenario menziona MongoDB o dati orientati ai documenti, DocumentDB è la risposta gestita di AWS.

**Amazon Neptune: Quando le Relazioni Sono i Dati**

Il motore di raccomandazioni era un problema più difficile.

La domanda non era "cosa ha ordinato questo cliente?" — era una semplice ricerca su DynamoDB. La domanda era: "quali clienti hanno profili di gusto simili a questo cliente, e quali piatti hanno apprezzato quei clienti che questo cliente non ha ancora provato?"

Questo è un problema di grafi. Il modello di dati non è una tabella di righe né una collezione di documenti. È una rete di relazioni: clienti connessi a piatti (ordinato, valutato, visualizzato), piatti connessi a ristoranti e tipi di cucina, ristoranti connessi a quartieri e città. La raccomandazione non è nei punti dati — è nei percorsi tra di essi.

"Abbiamo bisogno di un database a grafi," disse Priya.

**Amazon Neptune** è un database a grafi completamente gestito. Supporta due modelli di grafi: **property graph** (interrogato con il linguaggio di traversal Gremlin o openCypher) e **RDF** (interrogato con SPARQL). Scegli in base al tuo stack di grafi esistente o alla preferenza del team; entrambi girano sulla stessa infrastruttura Neptune.

I database a grafi sono costruiti appositamente per i carichi di lavoro in cui le relazioni tra i punti dati sono importanti quanto i dati stessi: reti sociali (chi è connesso a chi), motori di raccomandazioni (cosa hanno apprezzato utenti simili), rilevamento di frodi (quali transazioni condividono pattern sospetti tra account) e knowledge graph (come sono correlati i concetti).

Per il motore di raccomandazioni di Nimbus: clienti e piatti diventarono nodi in Neptune. Gli eventi degli ordini diventarono archi. Una traversal Gremlin poteva trovare, in una singola query, tutti i piatti che clienti con cronologie di ordini simili avevano valutato positivamente, ordinati per la forza della connessione — senza le catene di JOIN complesse che sarebbero richieste in un database relazionale o le multiple query di andata e ritorno che sarebbero necessarie in DynamoDB.

Il segnale dell'esame per Neptune: **"rete sociale," "motore di raccomandazioni," "knowledge graph," "rilevamento di frodi,"** o **"traversal di grafo"**. Se uno scenario descrive dati in cui le connessioni contano tanto quanto i dati stessi, Neptune è la risposta.

**Amazon Keyspaces: Cassandra Senza le Operazioni**

L'acquisizione di Barato portò un cluster Cassandra nel quadro. Cassandra è un database NoSQL wide-column — progettato per throughput di scrittura molto elevato e scalabilità orizzontale, comunemente utilizzato per dati di serie temporali, log di attività degli utenti e telemetria IoT. Il team di dati di Barato lo usava per tracciare il comportamento dei clienti: quali articoli venivano visualizzati, quali venivano aggiunti al carrello, quali venivano abbandonati.

Migrare Cassandra su AWS aveva due opzioni: eseguirlo su EC2 (overhead operativo di gestire il cluster, aggiornamenti, scalabilità) o usare l'opzione gestita.

"Amazon Keyspaces," disse Priya.

**Amazon Keyspaces** è un database gestito serverless compatibile con Cassandra. Supporta il Cassandra Query Language (CQL) — lo stesso linguaggio di query già utilizzato dalle pipeline di Barato. Come DocumentDB per MongoDB, Keyspaces è il percorso gestito: mantieni il codice applicativo com'è, puntalo a un endpoint Keyspaces invece del cluster autogestito, e lascia che AWS gestisca l'infrastruttura.

Keyspaces scala automaticamente con il traffico, non richiede pianificazione della capacità ed è serverless — paghi per le letture e le scritture che effettivi realmente. Per i dati di tracciamento del comportamento di Barato, questo era il modello giusto: volume estremamente variabile (ora di punta della cena vs le 3 di notte), schema wide-column, alto throughput di scrittura.

Il segnale dell'esame: **"compatibile con Cassandra," "wide-column," "CQL,"** o **"carico di lavoro Cassandra"**.

**Scegliere il Database Giusto: Una Tabella di Riferimento**

A questo punto della storia, il panorama dei database di Nimbus non assomigliava per niente a quello del capitolo sette. Lo strumento giusto per ogni carico di lavoro:

| Frase chiave | Database |
|---|---|
| "Compatibile con MongoDB" o "document store" | DocumentDB |
| "Relazioni tra grafi," "rete sociale," "motore di raccomandazioni" | Neptune |
| "Compatibile con Cassandra" o "wide-column" | Keyspaces |
| "Chiave-valore a qualsiasi scala," "latenza a singola cifra di millisecondi" | DynamoDB |
| "Relazionale + serverless," "SQL con auto-scaling" | Aurora Serverless |
| "Dati strutturati, query complesse, reporting" | RDS (PostgreSQL, MySQL) |

"Continuerà a crescere?" chiese Leo, guardando l'elenco.

"Sì," disse Maya. "Perché problemi diversi hanno forme diverse. E usare la forma sbagliata ti costa o prestazioni, o tempo degli sviluppatori, o entrambi."

"La domanda giusta non è 'quale database dovremmo usare,'" aggiunse Priya. "È 'che forma hanno i nostri dati, e come li accederemo?' Il database deriva dalla risposta."

Era la cosa più importante che avesse detto sui database in due anni.

## Punti di Forza e Limitazioni

**Perché DynamoDB è potente**:

- Latenza a singola cifra di millisecondi a qualsiasi scala
- Completamente gestito — nessuna patch, nessuna configurazione di replica, nessuna finestra di manutenzione
- Replica multi-AZ automatica (durabilità integrata)
- La scalabilità on-demand significa zero pianificazione della capacità
- Integrazione nativa con Lambda, API Gateway, Streams
- Ripristino point-in-time (simile ai backup automatici di RDS)
- DynamoDB Streams — cattura ogni modifica come un evento (utile per l'elaborazione in tempo reale)

**Dove DynamoDB diventa complicato**:

- Il design dei pattern di accesso è non negoziabile — gli errori sono costosi da correggere
- Le query complesse richiedono indici secondari (aggiunge costo e complessità)
- Le scan sono costose — evitale in produzione
- Il "limite di dimensione dell'elemento" è 400KB — gli elementi di grandi dimensioni richiedono uno storage diverso
- I prezzi possono sorprenderti se non capisci i costi delle unità di lettura/scrittura
- Le partizioni calde sono killer silenziosi — nessun errore finché non inizia il throttling

## Riepilogo

La riprogettazione dello schema aveva richiesto due giorni e molto spazio sulla lavagna. Scegliere un database NoSQL non è solo una decisione tecnica — cambia completamente il modo in cui pensi ai dati. Ma il risultato fu una tabella del menu che poteva crescere a qualsiasi dimensione senza rallentare. Altrettanto importante: il team imparò dove si trovano i limiti di DynamoDB e quali database specializzati scegliere quando il problema cambia forma.

- DynamoDB è il servizio di database NoSQL gestito di AWS. Gli elementi sono documenti flessibili — nessuno schema fisso. Ogni elemento deve avere una **chiave primaria**: una chiave di partizione da sola, o una chiave di partizione + chiave di ordinamento. Scegli la chiave di partizione per una distribuzione uniforme — le partizioni calde causano throttling.
- La capacità **on-demand** scala automaticamente; la capacità **provisioned** è più economica per il traffico prevedibile. Le letture **eventualmente coerenti** sono più economiche; le letture **fortemente coerenti** sono sempre aggiornate ma non disponibili sui GSI.
- **DynamoDB Streams** cattura le modifiche a livello di elemento in tempo reale — usali per gestire l'invalidazione della cache, gli aggiornamenti dell'indice di ricerca e le pipeline di analisi.
- DynamoDB è la scelta sbagliata per il reporting, i join complessi e le query ad hoc — usa RDS per quelli.
- **DocumentDB** (compatibile con MongoDB), **Neptune** (database a grafi) e **Keyspaces** (compatibile con Cassandra) sono alternative gestite AWS per i carichi di lavoro che non si adattano al modello chiave-valore di DynamoDB.

## Suggerimenti per l'Esame

*Dominio SAA-C03: Progettazione di Architetture ad Alte Prestazioni (Dominio 3, Task 3.3)*

- Conosci le regole della chiave di partizione: **alta cardinalità, distribuzione uniforme**. Le partizioni calde sono una trappola comune nell'esame.
- **On-demand vs provisioned**: on-demand per traffico imprevedibile; provisioned (con Auto Scaling) per carichi di lavoro prevedibili.
- **DynamoDB Streams**: cattura le modifiche a livello di elemento in tempo reale. Scenario comune nell'esame: "attivare una funzione Lambda quando un record cambia."
- **Global Tables**: replica multi-Regione e multi-attiva per applicazioni distribuite globalmente e scenari di disaster recovery. Nell'esame, è un segnale forte quando il carico di lavoro richiede letture e scritture locali in più di una Region.
- **DynamoDB TTL (Time to Live)**: imposta un attributo di timestamp di scadenza sugli elementi e DynamoDB li elimina automaticamente dopo la scadenza — **a costo zero**, senza consumare capacità di scrittura. Trigger nell'esame: "i dati di sessione/elementi temporanei devono essere rimossi automaticamente dopo N ore al costo più basso" → TTL, mai una Lambda pianificata di scan. Gli elementi scaduti possono anche confluire in DynamoDB Streams per l'archiviazione.
- **DAX (DynamoDB Accelerator)**: livello di caching in memoria per DynamoDB. Riduce la latenza di lettura da millisecondi a microsecondi. L'esame lo usa quando le repliche di lettura RDS non aiutano (perché è una cache specifica per DynamoDB).
- **Chiave primaria composta**: chiave di partizione + chiave di ordinamento consente query flessibili all'interno di una partizione. Esempio: recuperare tutti gli ordini per un cliente tra due date — `customerId` è la chiave di partizione, `orderDate` è la chiave di ordinamento.
- **GSI vs LSI**: il GSI può essere aggiunto dopo la creazione della tabella; il LSI no. Il LSI supporta le letture fortemente coerenti; il GSI no. Il LSI condivide la capacità della tabella; il GSI ha la propria.
- Sapere quando NON usare DynamoDB: join complessi, reporting ad hoc, transazioni multi-entità → RDS è solitamente la risposta.
- **Selezione del database specializzato** — l'esame presenta frequentemente uno scenario e chiede quale database si adatta. Usa questo come riferimento rapido: "compatibile con MongoDB" → DocumentDB. "Grafo/rete sociale/motore di raccomandazioni/knowledge graph" → Neptune. "Compatibile con Cassandra/wide-column" → Keyspaces. "Chiave-valore a qualsiasi scala/latenza a millisecondi" → DynamoDB. "Relazionale/query complesse/reporting" → RDS o Aurora.

## Esercizi

**Esercizio 1 — Ricordo**

Spiega la differenza tra una chiave di partizione e una chiave di ordinamento. Quando useresti entrambe?

*(Suggerimento: Pensa all'analogia postale — la chiave di partizione è il codice postale che instrada una busta all'ufficio postale giusto, e la chiave di ordinamento è l'indirizzo stradale che ordina le consegne al suo interno.)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: Un'azienda di gaming globale memorizza i profili dei giocatori in DynamoDB. Ogni profilo include campi come username, livello, achievement e inventario. Alcuni giocatori hanno 10 oggetti nell'inventario; altri ne hanno qualche centinaio — i profili variano nella forma ma rimangono comodamente entro il limite di dimensione degli elementi DynamoDB di 400KB. L'azienda ha bisogno di una latenza di lettura a singola cifra di millisecondi per le ricerche di profilo durante il gameplay attivo.

Quale approccio di design supporta MEGLIO questo requisito?

A) Usare DynamoDB con `playerId` come chiave di partizione e memorizzare l'intero profilo come un singolo elemento
B) Migrare a RDS Aurora con repliche di lettura in ogni regione
C) Usare DynamoDB con `level` come chiave di partizione per raggruppare i giocatori di abilità simile
D) Usare ElastiCache davanti a RDS per ottenere una latenza inferiore al millisecondo

**Suggerimento 1**: Il pattern di accesso è "cerca un giocatore specifico per ID." Quale chiave rende questo efficiente?

**Suggerimento 2**: Un'opzione crea una partizione terribilmente calda. Quale attributo ha cardinalità molto bassa?

**Suggerimento 3**: DynamoDB eroga già nativamente una latenza a singola cifra di millisecondi.

**Risposta**: A

**Spiegazione**: Usare `playerId` come chiave di partizione distribuisce i dati uniformemente tra le partizioni e consente ricerche istantanee per ID giocatore — esattamente il pattern di accesso descritto. Il modello a documento flessibile di DynamoDB gestisce le dimensioni variabili dell'inventario senza modifiche allo schema.

**Perché non B?** RDS Aurora con repliche di lettura aggiunge complessità e non è comunque la prima scelta naturale per questo tipo di ricerca basata su chiave del profilo alla scala del gaming.

**Perché non C?** Usare `level` come chiave di partizione crea partizioni gravemente calde — la maggior parte del traffico va al livello 1 (nuovi giocatori) o al livello massimo (veterani attivi), lasciando le altre partizioni inattive.

**Perché non D?** La domanda descrive DynamoDB, non RDS. Aggiungere ElastiCache davanti a RDS introduce due nuovi servizi quando DynamoDB da solo risolve il problema.

*Dominio SAA-C03: Progettazione di Architetture ad Alte Prestazioni — Task 3.3*

**Esercizio 3 — Sfida di Architettura**

Nimbus sta aggiungendo una funzionalità "preferiti": i clienti possono salvare le loro voci del menu preferite e riordinarle con un solo tocco.

Progetta la tabella DynamoDB per questa funzionalità. Quale sarebbe la chiave di partizione? Useresti una chiave di ordinamento? Come sarebbe la struttura dell'elemento?

Poi considera: cosa succede se hai bisogno di mostrare i "100 articoli più aggiunti ai preferiti in tutti i clienti"? DynamoDB può rispondere in modo efficiente? In caso contrario, cosa aggiungeresti all'architettura?

*(Non esiste una risposta corretta univoca. L'obiettivo è esercitarsi nella progettazione per i pattern di accesso.)*

## Scena Post-Crediti

"L'ho già deployato — oh." Leo aveva eseguito la migrazione del menu a DynamoDB il giovedì sera senza dirlo a nessuno. Aveva funzionato. Le letture erano veloci. Lo schema era flessibile. I partner dei ristoranti potevano aggiungere qualsiasi campo di modificatori volessero. Ma si era dimenticato di aggiornare i dashboard di monitoraggio, e Priya aveva trascorso venti minuti il venerdì mattina a chiedersi perché le metriche del database fossero piatte.

Si sentiva bene lo stesso.

Poi Priya, con i dashboard ripristinati, guardò le metriche.

"Leo," disse, "ogni caricamento di pagina sta effettuando quarantasette richieste DynamoDB."

"Una per ristorante mostrato," confermò Leo. "La pagina di navigazione carica i quarantasette ristoranti più vicini per la posizione del cliente."

"E ognuna di quelle richieste impiega circa quattro millisecondi."

Leo fece i calcoli. Quarantasette per quattro. "Questo è... centottantotto millisecondi solo per il menu. Prima del rendering."

"Ad ogni caricamento di pagina."

"Per ogni cliente."

Fissò lo schermo.

"Abbiamo bisogno di una cache," disse.

Nel prossimo capitolo: lo strato tra l'applicazione di Nimbus e il suo database che rende veloci le query lente.
