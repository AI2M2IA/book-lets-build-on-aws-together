# Capitolo 10: Quando il Database È Troppo Lento

Le metriche di caricamento della pagina erano aperte sullo schermo. Leo le stava studiando da venti minuti senza dire una parola.

47 richieste DynamoDB per ogni caricamento di pagina. Centoventotto millisecondi solo per recuperare i dati — prima che il browser disegnasse un singolo pixel.

Aveva fatto i conti. Diecimila utenti concorrenti di venerdì sera: quattrocentosettanta mila letture DynamoDB al minuto. Il costo era reale. Ma la latenza era il vero problema. Un utente che apriva la pagina di navigazione Nimbus attendeva quasi duecento millisecondi prima che apparisse qualcosa — e questo era su una connessione veloce.

"Il database risponde in quattro millisecondi per richiesta," disse Leo. "Questo è effettivamente veloce. DynamoDB sta facendo il suo lavoro."

"Allora perché la pagina è lenta?" chiese Maya.

"Perché la stiamo chiamando quarantaquattro volte per caricamento di pagina," disse Priya. "Il problema non è il database. Il problema è che ne parliamo troppo."

Tom si sporse in avanti. Aveva lo sguardo che si fa quando un problema sta per diventare una conversazione sui costi. "Quindi la soluzione è parlare con esso meno?"

"Parlare con esso meno. Ricordare di più."

**L'Analogie del Ristorante**

Immagina la cucina di un ristorante. Ogni volta che un cameriere ha bisogno di sapere gli speciali del giorno, va indietro, chiede allo chef e torna al tavolo.

Funziona bene se hai due camerieri e tre tavoli.

Ora immagina duecento camerieri e mille tavoli. Uno di loro deve andare indietro per la stessa domanda. La cucina diventa il collo di bottiglia. Lo chef risponde alla stessa domanda quattrocento volte all'ora.

La soluzione ovvia: scrivere gli speciali su una lavagna di fronte al ristorante. Ogni cameriere legge dalla lavagna. La cucina fa una pausa. La lavagna viene aggiornata quando gli speciali cambiano.

Quella lavagna è un cache.

Un cache è un deposito veloce e locale di dati recentemente recuperati. Invece di recuperare ripetutamente la stessa cosa da una fonte lenta, la recuperi una volta e la tieni vicina.

**Perché Non Usare Solo La Memoria?**

"Non possiamo semplicemente memorizzare il menu nella memoria dell'applicazione?" chiese Leo.

Domanda valida.

Si può. Per un'applicazione a un singolo server, la memorizzazione nella cache in memoria funziona bene. Ma Nimbus gira dietro a un bilanciatore di carico, su più istanze EC2. Se un'istanza memorizza il menu nella sua memoria, le altre istanze non hanno quei dati. Ognuna mantiene cache separate. Quando il menu viene aggiornato, dovresti invalidare tutte.

Questo è il *problema di coerenza della cache* — mantenere più cache coerenti.

ElastiCache risolve questo fornendo una *cache centralizzata* che tutti i tuoi istanze condividono. Invece che ogni server abbia la sua memoria, ogni server legge e scrive nella stessa cache. Un aggiornamento si propaga a tutti.

**Incontra ElastiCache**

Amazon ElastiCache è un servizio di caching gestito. Esegue motori di caching popolari — Redis e Memcached — senza che tu debba gestire i server.

**Redis** è il più potente dei due. Supporta strutture di dati complesse (stringhe, liste, insiemi, hash, insiemi ordinati), persistenza (i dati sopravvivono ai riavvii), replica e messaggistica pub/sub. Redis può fare di più che caching — può funzionare come un archivio di dati leggero.

**Memcached** è più semplice. Cache chiave-valore pura, scalabile orizzontalmente, nessuna persistenza. Più veloce per casi d'uso semplici ma con meno funzionalità.

Per Nimbus: Redis. Avevano bisogno di memorizzare i dati del menu (strutturati), i token di sessione (chiave-valore) e in seguito avrebbero voluto gli insiemi ordinati per i ranghi di "ristoranti più popolari".

**Come Funziona il Caching Nella Pratica**

Il modello di caching di base si chiama **cache-aside** (anche chiamato lazy loading):

1. L'applicazione ha bisogno di dati
2. Controlla la cache per prima
3. Se trovato (*cache hit*): restituisci i dati immediatamente
4. Se non trovato (*cache miss*): vai al database, ottieni i dati, memorizzali nella cache, restituisci

In pseudocodice:

```
menuData = cache.get("menu:restaurant-047")
if menuData is null:
    menuData = dynamodb.query(TableName="menu", KeyConditionExpression="restaurantId = '047'")
    cache.set("menu:restaurant-047", menuData, ttl=300)  # Cache for 5 minutes
return menuData
```

La prima richiesta colpisce sempre il database. Ogni richiesta successiva colpisce la cache. Con una cache, i quarantasette letture DynamoDB di Nimbus per pagina di caricamento diventano una o due ricerche nella cache. Veloce, economico e scalabile.

**Il TTL: Quanto a lungo ricordi?**

Ogni voce di cache ha un **Tempo di Vita (TTL)**: la durata dopo la quale l'entrata scade e la richiesta successiva torna al database per dati freschi.

Questa è la tensione fondamentale della caching: freschezza contro prestazioni.

- **TTL breve (secondi)**: Dati molto freschi, ma molte mancate ricerche nella cache. La cache non aiuta molto.
- **TTL lungo (ore o giorni)**: Molto veloce, ma i dati possono diventare obsoleti. Il cliente vede il menu di ieri.

Per i dati del menu, cinque minuti sono ragionevoli. Il menu non cambia ogni secondo. Se un ristorante aggiorna il suo menu, i clienti potrebbero vedere la versione precedente per un massimo di cinque minuti - accettabile.

Per i token di sessione (questo utente è loggato?), un TTL più breve ha senso, oppure aggiorni la cache immediatamente quando la sessione cambia.

Per i dati finanziari (totali degli ordini, registri di pagamento), non memorizzarli nella cache - o se lo fai, invalidali immediatamente alla scrittura.

"Ci sono solo due problemi difficili nell'informatica", ha citato Leo, con la consegna esperta di qualcuno che l'aveva detto prima. "Invalidazione della cache e dare nomi alle cose."

"Perché l'invalidazione della cache è difficile?", ha chiesto Maya.

"Perché quando i dati cambiano *effettivamente*? Il menu è cambiato perché un partner del ristorante lo ha aggiornato? O perché è stato eseguito un cron job? O perché un amministratore l'ha modificato manualmente? Ogni luogo che può modificare i dati deve sapere di dover dire alla cache."

Questo è il motivo per cui gli ingegneri senior iniziano una conversazione sulla caching con "quali sono i percorsi di scrittura?" invece di "dobbiamo aggiungere Redis."

**Evizione della Cache: Quando la bacheca si riempie**

La bacheca dei premi ha uno spazio limitato. Quando si riempie, devi cancellare qualcosa per fare spazio.

Redis (e le cache in generale) hanno *politiche di eviction* che determinano cosa viene rimosso quando la memoria è piena:

- **LRU (Least Recently Used)**: Rimuovi gli elementi che non sono stati accessi nel periodo di tempo più lungo.
- **LFU (Least Frequently Used)**: Rimuovi gli elementi che vengono accessi meno frequentemente.
- **allkeys-random**: Evizione casuale. Semplice, non ottimale.
- **noeviction**: Restituisci un errore quando la memoria è piena (l'applicazione deve gestire questo).

Per la maggior parte delle applicazioni web: LRU. Le cose che non hai guardato di recente probabilmente non ti servono.

**ElastiCache per Redis: Ciò che ottieni gestito**

Come RDS, ElastiCache prende uno strumento open-source e gestisce il lavoro operativo:

- **Backup automatici**: snapshot Redis su base programmata
- **Replicazione multi-AZ**: nodo primario + repliche di lettura in diverse AZ
- **Failover automatico**: se il nodo Redis primario fallisce, una replica viene promossa automaticamente
- **Modalità cluster**: partizionamento orizzontale su più nodi per cache molto grandi
- **Crittografia**: crittografia in transito e a riposo per la conformità
- **Integrazione VPC**: la cache viene eseguita nella tua rete privata, non accessibile pubblicamente

Tom ha guardato l'elenco delle funzionalità. "Quanto costa?"

"Meno di quanto leggiamo da DynamoDB che stiamo sostituendo", ha detto Leo. "Ho fatto i calcoli."

L'espressione di Tom è passata dallo scetticismo all'interesse. Questo era progresso.

## Punti di forza e limitazioni

**Perché la caching è potente:**

- Riduce drasticamente il carico del database (meno query, costi inferiori)
- Tempi di risposta al millisecondo per i colpi nella cache
- Protegge il tuo database da picchi di traffico
- Redis supporta strutture di dati più ricche rispetto a un semplice chiave-valore

**Dove la caching diventa complicata:**

- L'invalidazione della cache è veramente difficile - i dati obsoleti causano bug
- Aggiunge complessità operativa (un altro servizio da monitorare, un altro punto di errore)
- Problema di "collo di bottiglia freddo": quando distribuisci nuovi, la cache è vuota - il database prende il carico completo
- Cache stampede: se molte voci scadono contemporaneamente, tutte le richieste colpiscono il database simultaneamente
- I nodi ElastiCache non sono gratuiti - li paghi anche quando sono inattivi

**ElastiCache vs DynamoDB DAX:**

Se stai memorizzando nella cache i dati DynamoDB specificamente, AWS offre **DAX (DynamoDB Accelerator)** - una cache in memoria dedicata per DynamoDB. DAX è trasparente per il tuo codice dell'applicazione (stesso API), riduce la latenza di lettura di DynamoDB a microsecondi e gestisce l'invalidazione della cache automaticamente.

Usa DAX quando il tuo collo di bottiglia è DynamoDB read. Usa ElastiCache quando hai bisogno di una cache generica per qualsiasi fonte di dati.

## Riepilogo

- Una cache è un archivio veloce di dati recentemente recuperati: la chiedi una volta, ricordi la risposta.
- ElastiCache è il servizio di caching gestito da AWS, supportando Redis e Memcached.
- **Redis** è più ricco (strutture di dati complesse, persistenza, pub/sub). **Memcached** è più semplice (chiave-valore puro, scalabilità orizzontale).
- Il **pattern cache-aside** (caricamento pigro): controlla la cache prima, torna al database in caso di mancata corrispondenza.
- **TTL** controlla per quanto tempo i dati rimangono nella cache. Un TTL breve = fresco, molti mancati. Un TTL lungo = veloce, potenzialmente obsoleto.
- L'invalidazione della cache è difficile. Conosci tutti i percorsi di scrittura prima di aggiungere una cache.
- ElastiCache gestisce la replicazione, il failover, i backup e la crittografia: tu ti concentri sulla progettazione della cache.
- **DAX** è la cache specifica per DynamoDB. ElastiCache è a uso generale.

## Consigli per l'Esame

*Dominio SAA-C03: Progettazione di Architetture ad Alte Prestazioni (Dominio 3, Task 3.3)*

- **Redis vs Memcached all'esame**: Redis = persistenza, replicazione, strutture complesse, pub/sub. Memcached = semplice chiave-valore, scalabilità orizzontale pura. Quando lo scenario menziona "non puoi perdere i dati in cache", la risposta è Redis (perché persiste su disco).
- **Segnali di utilizzo di ElastiCache**: "il database è un collo di bottiglia", "carico di lettura", "riduci la latenza", "store di sessione" — tutti indicano ElastiCache.
- **Segnale DAX**: "riduci la latenza di lettura di DynamoDB" o "le letture di DynamoDB sono troppo lente" → DAX, non ElastiCache.
- **Gestione delle sessioni**: Redis è la risposta canonica per l'archiviazione dei dati delle sessioni utente. Un'applicazione senza stato + store di sessioni Redis = scalabilità orizzontale con sessioni coerenti.
- **Write-through vs cache-aside**: Cache-aside (caricamento pigro) è il più comune. Write-through aggiorna la cache su ogni scrittura — mai obsoleto, ma più operazioni di scrittura. L'esame potrebbe distinguerli.
- **Politiche di eviction della cache**: LRU (meno recentemente utilizzato) è la risposta più comune per carichi di lavoro web generali.

## Esercizi

**Esercizio 1 — Ricordo**

Nelle tue parole: cos'è l'invalidazione della cache e perché è difficile?

*(Suggerimento: pensa a tutti i posti in Nimbus dove i dati del menu potrebbero essere aggiornati — il portale del partner ristorante, uno strumento di amministrazione, un cron job. Ogni uno di questi percorsi deve conoscere la cache.)*

**Esercizio 2 — Esercitazione per l'Esame**

*Scenario*: Una piattaforma di streaming video serve milioni di utenti. Il catalogo di film disponibili cambia raramente (aggiornato notturnamente). L'applicazione sta riscontrando un elevato utilizzo della CPU del database perché ogni richiesta utente interroga il catalogo. Il team vuole ridurre il carico del database mantenendo accurati i dati del catalogo entro un'ora dagli aggiornamenti.

Quale soluzione soddisfa meglio questi requisiti?

A) Aggiungere replica di lettura al database RDS per distribuire il carico
B) Migrare il catalogo a DynamoDB con capacità on-demand
C) Utilizzare ElastiCache per Redis con un TTL di 1 ora per i dati del catalogo
D) Aumentare la dimensione dell'istanza RDS per gestire più query concorrenti

*(Suggerimento 1*: I dati sono di lettura e cambiano raramente. Qual è il pattern ideale per questo?

*(Suggerimento 2*: "Accurato entro un'ora" si traduce direttamente in un parametro di configurazione specifico per la cache.

*(Suggerimento 3*: L'obiettivo è ridurre il carico del database, non solo gestirlo di più.

**Risposta**: C

**Spiegazione**: ElastiCache con un TTL di 1 ora memorizza i dati del catalogo dopo la prima richiesta per chiave. Le richieste successive restituiscono i dati dalla cache senza toccare il database. Quando viene eseguito l'aggiornamento notturno, le voci scadono entro un'ora e i dati freschi vengono caricati sulla richiesta successiva.

**Perché non A?** Le replica di lettura distribuiscono il traffico di lettura su più nodi del database, ma non riducono il numero totale di query. Sono utili per scalare le letture, non per ridurre il carico del database da query ripetute.

**Perché non B?** Migrare a DynamoDB non risolve il problema di fondo — i dati del catalogo verrebbero comunque recuperati dal database (DynamoDB) su ogni richiesta utente.

**Perché non D?** Aumentare la dimensione dell'istanza gestisce più query concorrenti, ma non riduce il numero di query. L'inefficienza fondamentale rimane.

*SAA-C03 Dominio: Progettazione di Architetture ad Alte Prestazioni — Task 3.3*

**Esercizio 3 — Sfida Architetturale** *(Opzionale)*

Nimbus vuole aggiungere una funzionalità "ristoranti di tendenza": un elenco dei 10 ristoranti migliori in base al volume degli ordini nell'ultimo giorno, aggiornato ogni 15 minuti.

Come implementeresti questo con ElastiCache Redis? Quale struttura di dati Redis useresti per il ranking? Quale sarebbe il tuo TTL per la cache e quando esattamente aggiorneresti la cache?

Considera anche: cosa succede se il nodo ElastiCache va giù? Il funzionalità si interrompe? Come progetteresti per questa interruzione?

*(Non esiste una risposta corretta univoca. L'obiettivo è esercitarsi nella progettazione della cache e nel pensiero sulla gestione dei guasti.)*

## Scena Post-Crediti

Leo ha aggiunto la memorizzazione nella cache Redis per il menu. Il tempo di caricamento della pagina è diminuito da 188 millisecondi a 12 millisecondi.

Sono diventate 47 chiamate a DynamoDB, una chiamata a Redis. Il tempo di chiamata è stato di 0,8 millisecondi.

Ha annunciato questo durante la riunione di lunedì.

"Lavoro ben fatto", ha detto Priya, senza alzare lo sguardo dal suo laptop.

"Grazie," disse Leo.

"Quando hai fatto l'ultima rotazione del token di autenticazione di Redis?"

Leo guardò le sue note. "Non credo di averlo impostato."

"Quindi la cache è non autenticata."

"Si trova all'interno del VPC."

"Lo stesso vale per tutto il resto che è compromesso." Alla fine alzò lo sguardo. "Se il laptop di Leo dovesse essere infettato e qualcuno dovesse pivotare nel VPC, la tua cache non avrà alcuna password."

Leo la fissò.

"Imposterò il token di autenticazione," disse.

Nel prossimo capitolo: la rete privata che separa ciò che Nimbus possiede dal resto di Internet.
