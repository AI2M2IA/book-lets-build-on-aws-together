# Capitolo 9: Quando la Tabella Diventa Enorme

Il menu aveva 50.000 articoli.

Questo riguardava 287 ristoranti, ognuno con offerte speciali giornaliere, articoli stagionali e variazioni regionali. Alcuni articoli avevano modificatori – dimensione, livello di piccantezza, scelta del proteina. Alcuni avevano offerte combinate che facevano riferimento ad altri articoli. Alcuni apparivano nel menu solo nei giorni feriali, o solo a pranzo, o solo in determinate città.

La query SQL che recuperava il menu completo di un ristorante prima impiegava 200 millisecondi.

Ora impiegava quattro secondi.

Quattro secondi è la differenza tra qualcuno che effettua un ordine e qualcuno che chiude l'app. Leo aveva esaminato il piano di query. Tom aveva esaminato la configurazione degli indici. Priya aveva aumentato il numero di replica di lettura. Nessuno di questi aveva fatto una differenza significativa.

E questo ha cambiato l'atmosfera nella stanza.

Quando un problema sopravvive all'indicizzazione, ai tentativi di caching e a una replica extra, le persone smettono di presumere che la soluzione sia ingegnosa.

A volte la soluzione è che la forma del sistema è sbagliata.

"Il problema," disse Leo, "è la forma dei dati. SQL vuole tutto in righe e colonne. I nostri menu non hanno una forma fissa."

Questo è stato l'inizio di una conversazione più lunga.

**Il Problema di Inserire Tutto in una Tabella**

Ecco la tensione centrale dei database relazionali: sono progettati per archiviare *dati strutturati* in *forme fisse*.

Se ogni articolo del menu avesse gli stessi campi – nome, prezzo, descrizione, categoria – SQL sarebbe perfetto. Avresti una tabella pulita `menu_items`, righe per ogni articolo e query che hanno senso.

Ma i menu reali non funzionano così.

Un articolo potrebbe avere un modificatore di "livello di piccantezza". Un altro potrebbe avere una "scelta di proteina". Un terzo potrebbe avere combo annidate – "ordina il pasto per famiglia e ottieni due piatti principali, due contorni e una bevanda." La struttura dei dati varia *per articolo*.

In SQL, hai due opzioni:

**Opzione 1**: Crea una colonna per ogni possibile modificatore. Questo produce una tabella molto larga dove la maggior parte delle colonne è vuota la maggior parte del tempo.

**Opzione 2**: Crea una tabella separata per i modificatori e uniscila alla tabella `menu_items`. Questo funziona, ma i menu complessi richiedono più join e, a cinquanta mila articoli con un alto volume di lettura, questi join diventano costosi.

"C'è una terza opzione," disse Priya, che aveva letto la documentazione tranquillamente nell'angolo.

Ha aperto una nuova scheda. "E se i dati non dovessero adattarsi in una tabella?"

**Un Modo Diverso di Pensare ai Dati**

I database relazionali archiviano i dati come righe in tabelle. Ogni riga deve conformarsi allo schema della tabella. Lo schema è concordato in anticipo.

I database NoSQL archiviano i dati in modo diverso. Un approccio comune è il *modello di documento*: ogni record è memorizzato come un documento autonomo (solitamente JSON) e i documenti nella stessa collezione non devono avere gli stessi campi.

Un articolo del menu in un modello di documento potrebbe apparire così:

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

Another item might look completely different:

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

Diverse forme. Stessa collezione. Nessun problema.

"Quindi il database è più simile a un sistema di archiviazione che a una tabella," disse Maya.

"Esattamente," disse Priya. "Puoi mettere qualsiasi documento in qualsiasi raccoglitore. Non devi tagliare il documento per adattarlo a una dimensione fissa."

**Incontra DynamoDB**

Amazon DynamoDB è il servizio di database NoSQL gestito da AWS. Memorizza i dati come elementi (non righe), e gli elementi sono raccolti in tabelle (la denominazione è simile a SQL, ma il comportamento è diverso).

Ogni elemento in una tabella DynamoDB deve avere una **chiave primaria**, che lo identifica in modo univoco. Tutto il resto è flessibile.

La chiave primaria può essere di due forme:

**Chiave di partizione sola**: Un singolo attributo che deve essere univoco per tutti gli elementi.

**Chiave di partizione + chiave di ordinamento (chiave primaria composta)**: Due attributi che *insieme* formano una combinazione univoca. Questo ti consente di avere più elementi con la stessa chiave di partizione, differenziati dalla loro chiave di ordinamento.

Per il menu di Nimbus:

- Chiave di partizione: `restaurantId`
- Chiave di ordinamento: `itemId`

Questo significa che puoi recuperare tutti gli elementi per un ristorante specifico in modo efficiente — DynamoDB sa esattamente in quale partizione cercare.

"Perché si chiama chiave di partizione?" chiese Tom.

**Come DynamoDB Memorizza i Dati Internamente**

DynamoDB è progettato per scalare orizzontalmente a dimensioni enormi. Lo ottiene attraverso la *partizionamento* — i dati sono suddivisi su molte macchine fisiche in base alla chiave di partizione.

Quando scrivi un elemento, DynamoDB hash il valore della chiave di partizione e lo utilizza per determinare quale partizione fisica (e quindi quale server) memorizza l’elemento. Quando leggi un elemento, DynamoDB esegue lo stesso calcolo per trovarlo istantaneamente.

Immaginalo come un sistema postale. Se ogni busta ha un codice postale, il servizio postale non legge ogni busta per capire a dove appartiene — la ordina per codice postale. DynamoDB ordina per hash della chiave di partizione.

Questo è il motivo per cui è importante scegliere una buona chiave di partizione:

- **Buono**: Alta cardinalità, valori distribuiti in modo uniforme (`restaurantId` con molti ristoranti)
- **Cattivo**: Bassa cardinalità (`true/false`, `category`) — la maggior parte dei dati finisce su poche partizioni, creando "hot spot"

Un hot spot significa che una partizione riceve la maggior parte del traffico. Questa partizione diventa il collo di bottiglia. DynamoDB inizia a limitare le richieste. Gli utenti iniziano a vedere errori.

"Quindi se avessi usato `available: true` come chiave di partizione," disse Leo lentamente, "tutti gli elementi disponibili si ammasserebbero sulla stessa partizione."

"E il tuo database si scioglierebbe durante l'ora di punta," confermò Priya.

Leo chiuse il suo laptop lentamente.

**Lettura e Scrittura su Scala**

DynamoDB può gestire milioni di richieste al secondo. Ma deve sapere quanta capacità allocare.

Ci sono due modalità di capacità:

**Capacità prevista**: Specifica quante unità di lettura e scrittura desideri. DynamoDB riserva questa capacità per te e limita il traffico che la supera. Costo prevedibile, prezzo inferiore per richiesta.

**Capacità on-demand**: DynamoDB scala automaticamente con il tuo traffico effettivo. Non è necessario pianificare la capacità in modo regolare. Costo più elevato per richiesta e molto più semplice dal punto di vista operativo, anche se picchi improvvisi ben oltre il modello di traffico recente di una tabella possono causare il throttling se aumentano troppo rapidamente.

Per Nimbus, il menu viene letto molto più spesso di quanto venga scritto. Un cliente apre l'app, sfoglia il menu — questo sono molte letture. Un partner del ristorante aggiorna il loro menu due volte a settimana — questo sono occasionali scritture.

"La capacità on-demand ha senso per ora," disse Tom. "Non conosciamo i nostri modelli di traffico. È meglio pagare più per richiesta che sottoutilizzare e essere limitati."

Saggierezza infrastrutturale riluttante. Da Tom. Il team era ufficialmente cresciuto.

**Consistenza: Quanto Freschi Sono i Tuoi Dati?**

DynamoDB replica i dati su più Availability Zone automaticamente. Questo è ottimo per la durabilità, ma significa anche che devi pensare chiaramente alla consistenza di lettura.

Quando leggi da DynamoDB, hai una scelta:

**Lettura eventualmente coerente**: Questo è il valore predefinito. È più economico e il risultato potrebbe essere temporaneamente in ritardo rispetto a una scrittura di recente completata.

**Lettura fortemente coerente**: Per le letture su una tabella o un indice secondario locale, DynamoDB può restituire l'ultimo valore impegnato da scritture precedenti di successo. Questo costa più capacità di lettura e non è disponibile per gli indici secondari globali.

Per i dati del menu, la consistenza eventuale è sufficiente. Un elemento del menu che è a millisecondi fuori data non importa.

Per i dati di conferma dell'ordine — "è stato effettuato questo ordine?" — vorresti una forte consistenza. Il cliente non dovrebbe vedere un messaggio "riprova" quando il loro ordine è stato appena salvato.

"È come la differenza tra il controllo del saldo sul tuo app e la chiamata diretta alla banca. L'app potrebbe essere a trenta secondi di distanza. La telefonata è sempre aggiornata," disse Maya.

**Il Compromesso: Ciò che DynamoDB Non Può Fare**
NoSQL non è strettamente migliore di SQL. È uno strumento diverso per un lavoro diverso.

Ciò che DynamoDB rinuncia:

**Query Complesse Flessibili**: In SQL, puoi filtrare e ordinare per qualsiasi colonna. In DynamoDB, puoi interrogare efficientemente solo tramite la chiave primaria. Interrogare per campi arbitrari richiede uno *scan* (lettura di ogni elemento nella tabella), che è costoso e lento su larga scala.

**Join**: DynamoDB non supporta i join. Se hai bisogno di dati da due tabelle, devi eseguire due letture separate nel tuo codice di applicazione.

**Transazioni**: DynamoDB supporta le transazioni, ma i database relazionali sono ancora più adatti per molte workflow multi-entità, sistemi ad alta intensità di reporting e design ad alta intensità di join.

**Familiarità**: Decenni di strumenti SQL, competenze e modelli mentali non si trasferiscono direttamente.

Cosa eccelle DynamoDB:

- Pattern di accesso chiave-valore e documenti
- Scala massiva (latenza a singolo-cifra di millisecondi a qualsiasi dimensione)
- Serverless, nessuna gestione dell'infrastruttura
- Scalabilità automatica, replica multi-AZ, backup
- Prestazioni prevedibili indipendentemente dal volume dei dati

"Quindi la regola è," disse Maya, "usa DynamoDB quando *sai esattamente* come accederai ai dati. Usa SQL quando non lo sai ancora."

Priya annuì. "Progetta i tuoi pattern di accesso per primi. Poi scegli il tuo database."

Questo è uno dei risultati più saggi che una conversazione su un database può produrre.

**Quando Usare Ciascuno**

| Situazione                                             | Raggiungi               |
|-------------------------------------------------------|-------------------------|
| Dati strutturati, query complesse, reporting           | RDS (PostgreSQL, MySQL) |
| Forme di dati flessibili, accesso basato su chiave, scala massiva | DynamoDB                |
| Scritture intensive con relazioni complesse            | RDS                     |
| Letture intensive con pattern di accesso prevedibili   | DynamoDB                |
| Hai bisogno di join e aggregazioni                    | RDS                     |
| Hai bisogno di latenza a millisecondi a milioni di req/sec | DynamoDB                |
| Transazioni tra più entità                          | RDS (solitamente)           |
| Traffico imprevedibile e picchi                   | DynamoDB on-demand      |

La risposta sbagliata è sempre "usare sempre uno o l'altro". Nimbus ha finito per usare entrambi: RDS per la cronologia degli ordini e i registri finanziari (strutturati, relazionali, necessita di reporting), DynamoDB per il menu (schema flessibile, elevato volume di lettura, accesso tramite ID ristorante).

## Punti di Forza e Limitazioni

**Perché DynamoDB è potente**:

- Latenza a singolo-cifra di millisecondi a qualsiasi scala
- Completamente gestito — nessuna patch, nessuna configurazione di replica, nessuna finestra di manutenzione
- Replica multi-AZ automatica (durabilità integrata)
- La scalabilità on-demand significa zero pianificazione della capacità
- Integrazione nativa con Lambda, API Gateway, Streams
- Ripristino a un punto nel tempo (simile ai backup automatizzati di RDS)
- DynamoDB Streams — cattura ogni modifica come un evento (utile per l'elaborazione in tempo reale)

**Dove DynamoDB diventa complicato**:

- Il design dei pattern di accesso è non negoziabile — gli errori sono costosi da annullare
- Le query complesse richiedono indici secondari (aggiunge costo e complessità)
- Gli scan sono costosi — evitali in produzione
- Il "limite di dimensione dell'elemento" è di 400KB — gli elementi di grandi dimensioni richiedono un diverso storage
- I prezzi possono sorprenderti se non capisci i costi delle unità di lettura/scrittura

## Riepilogo

- DynamoDB è il servizio di database NoSQL gestito di AWS.
- Gli elementi sono memorizzati come documenti flessibili — non è richiesto uno schema fisso.
- Ogni elemento deve avere una **chiave primaria**: una chiave di partizione da sola, o una chiave di partizione + chiave di ordinamento.
- La chiave di partizione determina la partizione fisica in cui è memorizzato l'elemento. Sceglila per una distribuzione uniforme.
- **On-demand** la capacità si scala automaticamente; la capacità **predefinita** è più economica se il tuo traffico è prevedibile.
- I letture **eventualmente coerenti** sono più economiche e veloci. Le letture **coerenti in modo forte** sono sempre aggiornate.
- DynamoDB eccelle nell'accesso basato su chiave su larga scala. Ha difficoltà con query ad hoc e join.
- Usa RDS per i dati relazionali. Usa DynamoDB per i dati documento/chiave-valore. Usa entrambi quando la situazione lo richiede.

## Suggerimenti per l'Esame

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.3)*

- Conoscete le regole della chiave di partizione: **alta cardinalità, distribuzione uniforme**. Le partizioni calde sono una trappola comune negli esami.
- **On-demand vs provisioned**: on-demand per traffico imprevedibile; provisioned (con Auto Scaling) per carichi di lavoro prevedibili.
- **DynamoDB Streams**: cattura le modifiche a livello di elemento in tempo reale. Scenario comune d'esame: "attivare una funzione Lambda quando un record cambia".
- **Tabelle Globali**: multi-Regione, multi-replicazione attiva per applicazioni distribuite globalmente e scenari di disaster recovery. Durante l'esame, questo è un forte segnale quando il carico di lavoro richiede letture e scritture locali in più Regioni.
- **DAX (DynamoDB Accelerator)**: livello di caching in memoria per DynamoDB. Riduce la latenza di lettura da millisecondi a microsecondi. L'esame utilizza questo quando RDS read replicas non aiutano (perché è una cache specifica per DynamoDB).
- **Chiave primaria composta**: chiave di partizione + chiave di ordinamento consente query flessibili all'interno di una partizione. Esempio: recuperare tutti gli ordini per un cliente tra due date — `customerId` è la chiave di partizione, `orderDate` è la chiave di ordinamento.
- Conoscete quando NON utilizzare DynamoDB: join complessi, reporting ad hoc, transazioni multi-entità → RDS è di solito la risposta.

## Esercizi

**Esercizio 1 — Ricordo**

Spiegate la differenza tra una chiave di partizione e una chiave di ordinamento. Quando l'utilizzerebbe entrambi?

*(Suggerimento: pensate al menu di Nimbus — perché avere restaurantId come chiave di partizione e itemId come chiave di ordinamento rende efficiente il recupero del menu completo di un ristorante?)*

**Esercizio 2 — Esercitazione d'Esame**

*Scenario*: Una società di videogiochi globale memorizza i profili dei giocatori in DynamoDB. Ogni profilo include campi come username, livello, risultati e inventario. Alcuni giocatori hanno 10 oggetti nell'inventario; altri hanno 5.000 configurazioni personalizzate. L'azienda ha bisogno di una latenza di lettura di un singolo millisecondo per millisecondi per le ricerche del profilo durante il gameplay attivo.

Quale approccio di progettazione SUPPORTA al meglio questo requisito?

A) Migrare a RDS Aurora con read replicas in ogni regione
B) Utilizzare DynamoDB con `playerId` come chiave di partizione e memorizzare l'intero profilo come un singolo elemento
C) Utilizzare DynamoDB con `level` come chiave di partizione per raggruppare i giocatori di abilità simili
D) Utilizzare ElastiCache davanti a RDS per ottenere una latenza inferiore a millisecondo

*(Suggerimento 1*: Il modello di accesso è "cerca un giocatore specifico per ID". Quale chiave rende questo efficiente?

*(Suggerimento 2*: Una opzione crea una partizione molto calda. Quale attributo ha una bassa cardinalità?

*(Suggerimento 3*: DynamoDB già offre una latenza di un singolo millisecondo per millisecondi in modo nativo.

**Risposta**: B

**Spiegazione**: Utilizzare `playerId` come chiave di partizione distribuisce i dati in modo uniforme tra le partizioni e consente ricerche istantanee per ID giocatore — esattamente il modello di accesso descritto. Il modello di documento flessibile di DynamoDB gestisce le dimensioni dell'inventario variabili senza modifiche allo schema.

**Perché non A?** RDS Aurora con read replicas aggiunge complessità e non è comunque la prima scelta naturale per questo tipo di ricerca basata su chiave del profilo su larga scala di gioco.

**Perché non C?** Utilizzare `level` come chiave di partizione crea partizioni molto calde — la maggior parte del traffico va al livello 1 (nuovi giocatori) o al livello massimo (veterani attivi), lasciando le altre partizioni inattive.

**Perché non D?** La domanda riguarda DynamoDB, non RDS. L'aggiunta di ElastiCache davanti a RDS introduce due nuovi servizi quando DynamoDB da solo risolve il problema.

*SAA-C03 Domain: Design High-Performing Architectures — Task 3.3*

**Esercizio 3 — Sfida Architetturale** *(Opzionale)*

Nimbus sta aggiungendo una funzionalità "preferiti": i clienti possono salvare i loro articoli del menu preferiti e riordinarli con un solo tocco.

Progetta la tabella DynamoDB per questa funzionalità. Quale sarebbe la chiave di partizione? Utilizzerebbe una chiave di ordinamento? Quale sarebbe la struttura dell'elemento?

Quindi, considera: cosa succede se hai bisogno di mostrare "i 100 articoli più preferiti in tutti i clienti"? Può DynamoDB rispondere in modo efficiente? Se non, cosa aggiungeresti all'architettura?

*(Non esiste una risposta corretta. L'obiettivo è praticare la progettazione per i modelli di accesso.)*

## Scena Post-Crediti

Leo aveva migrato il menu a DynamoDB entro la fine della settimana. Le letture erano veloci. Lo schema era flessibile. I partner del ristorante potevano aggiungere qualsiasi campo di modifiche desiderato.

Si sentiva bene con se stesso.

Poi Priya guardava il pannello di controllo del monitoraggio.

"Leo", disse, "ogni caricamento di pagina sta facendo 47 richieste a DynamoDB".

"Uno per ristorante", confermò Leo. "Perché il cliente è sulla pagina di esplorazione di tutti".

"E ogni di queste richieste richiede circa quattro millisecondi".

Leo fece i calcoli. 47 volte 4. "Questo... è... 188 millisecondi solo per il menu. Prima di renderlo".

"Su ogni caricamento di pagina".

"Per ogni cliente".

Lui fissò lo schermo.

"Abbiamo bisogno di una cache", disse.

Nel prossimo capitolo: lo strato tra l'applicazione di Nimbus e il suo database che rende veloci le query lente.
