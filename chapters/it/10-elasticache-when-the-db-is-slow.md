# Capitolo 10: Quando il Database È Troppo Lento

Le metriche di caricamento della pagina erano aperte sullo schermo. Leo le stava guardando da venti minuti senza dire nulla.

Quarantasette richieste al database per ogni caricamento di pagina. Centottantotto millisecondi solo per recuperare i dati — prima che il browser disegnasse un singolo pixel.

Aveva fatto i calcoli. Diecimila utenti concorrenti un venerdì sera, ognuno che caricava la pagina di navigazione circa una volta al minuto: quattrocentosettantamila letture al database al minuto. Il costo era reale. Ma la latenza era il problema vero. Un utente che apriva la pagina di navigazione di Nimbus attendeva quasi duecento millisecondi prima che apparisse qualcosa — e questo era su una connessione veloce.

---

*La settimana precedente, la riprogettazione dello schema DynamoDB aveva funzionato. La tabella del menu era ora flessibile — qualsiasi ristorante poteva aggiungere qualsiasi modificatore, qualsiasi struttura di combo, qualsiasi variazione stagionale. Le prestazioni sulle singole ricerche erano eccellenti. Ma eccellenti singole ricerche, moltiplicate per quarantasette per pagina, portavano comunque a pagine lente. Il problema di DynamoDB era risolto. Un nuovo problema aveva preso il suo posto.*

---

"Il database risponde in quattro millisecondi per richiesta," disse Leo. "È effettivamente veloce. DynamoDB sta facendo il suo lavoro."

"Allora perché la pagina è lenta?" chiese Maya.

"Perché lo stiamo chiamando quarantasette volte per caricamento di pagina," disse Priya. "Il problema non è il database. Il problema è che gli parliamo troppo."

Tom si sporse in avanti. Aveva lo sguardo che assumeva quando un problema stava per diventare una conversazione sui costi. "Quindi la soluzione è parlargli meno?"

"Parlargli meno. Ricordare di più."

---

**Il Primo Tentativo Sbagliato**

Il primo istinto di Leo fu di mettere in cache i dati per utente. Ogni utente aveva una sessione, e la sessione caricava il suo profilo: indirizzi salvati, metodi di pagamento, riepilogo della cronologia degli ordini. Forse mettere quello in cache avrebbe velocizzato le cose.

Lo implementò. Formato della chiave Redis: `user:{userId}:profile`. TTL: dieci minuti.

Eseguì il test di carico. Il caricamento della pagina scese di sei millisecondi.

"Non è molto," osservò Tom.

"No," disse Leo.

"Perché no?"

Leo fissò il grafico per un momento. "Perché il profilo utente è solo una richiesta. Ci sono ancora quarantasei chiamate DynamoDB per pagina. E quelle sono le chiamate al menu — una per ristorante nella pagina di navigazione. Ho messo in cache la cosa sbagliata."

Questo è un errore comune nel caching: ottimizzare la cosa che non è il collo di bottiglia. Il profilo utente si caricava in due millisecondi. Mettere in cache qualcosa di così veloce non cambiava quasi nulla. I dati del menu — recuperati quarantasette volte, quattro millisecondi ciascuno — erano il vero problema.

"Devi mettere in cache per menu, non per utente," disse Priya. "Il menu del Ristorante 047 è lo stesso per ogni utente che lo naviga. Questi sono i dati che vale la pena mettere in cache — sono identici in migliaia di richieste."

Le cache per utente sono utili quando gli utenti hanno uno stato personalizzato costoso. Le cache per entità (menu, cataloghi prodotti, configurazioni) sono utili quando gli stessi dati vengono serviti a migliaia di utenti. Sappi qual è il tuo problema prima di scrivere il codice.

Leo ridisegnò le chiavi della cache: `menu:{restaurantId}`. Una voce di cache per ristorante, condivisa da ogni utente che naviga quel ristorante.

Rieseguì il test di carico. Il caricamento della pagina scese da 188 millisecondi a 12 millisecondi. Era il miglioramento che cercavano.

---

**L'Analogia del Ristorante**

Immagina la cucina di un ristorante. Ogni volta che un cameriere ha bisogno di sapere gli speciali del giorno, va in cucina, chiede allo chef e torna al tavolo.

Funziona bene se hai due camerieri e tre tavoli.

Ora immagina duecento camerieri e mille tavoli. Ognuno di loro che va in cucina per la stessa domanda. La cucina diventa il collo di bottiglia. Lo chef risponde alla stessa domanda quattrocento volte all'ora.

La soluzione ovvia: scrivere gli speciali su una lavagna all'ingresso del ristorante. Ogni cameriere legge dalla lavagna. La cucina ha un momento di pausa. La lavagna viene aggiornata quando gli speciali cambiano.

Quella lavagna è una cache.

Una cache è un deposito veloce e locale di dati recuperati di recente. Invece di recuperare ripetutamente la stessa cosa da una fonte lenta, la recuperi una volta e la tieni vicina.

C'è un'altra analogia che gli ingegneri trovano utile: lo scaffale delle riserve in biblioteca. Quando un libro molto richiesto viene riconsegnato, il bibliotecario sa che verrà richiesto di nuovo presto, quindi lo mette sullo scaffale delle riserve vicino alla reception invece di ricollocarlo negli scaffali. Il prossimo lettore non deve percorrere tutta la biblioteca — lo trova subito alla reception. Lo scaffale delle riserve ha spazio limitato. Se si riempie, i libri più vecchi vengono rimessi negli scaffali per fare posto a quelli più nuovi. Una cache funziona in modo identico: i dati acceduti frequentemente rimangono in primo piano, quelli raramente acceduti vengono espulsi per fare spazio.

**Perché Non Usare Semplicemente la Memoria?**

"Non possiamo semplicemente memorizzare il menu nella memoria dell'applicazione?" chiese Leo.

Domanda legittima.

Puoi farlo. Per un'applicazione a server singolo, il caching in memoria funziona bene. Ma Nimbus gira dietro a un load balancer, su più istanze EC2. Se un'istanza memorizza il menu nella sua memoria, le altre istanze non hanno quei dati. Ognuna mantiene cache separate. Quando il menu si aggiorna, dovresti invalidare tutte.

Questo è il *problema di coerenza della cache* — mantenere più cache coerenti.

ElastiCache risolve questo fornendo una cache *centralizzata* che tutte le tue istanze condividono. Invece che ogni server abbia la propria memoria, ogni server legge e scrive nella stessa cache. Un aggiornamento si propaga a tutti.

**Alla Scoperta di ElastiCache**

"Aspetta — ma *perché* dovremmo farlo in questo modo?" chiese Maya. "Perché un servizio completamente nuovo? Perché non aggiungere semplicemente più capacità al database?"

Buona domanda. La risposta è che aggiungere più capacità al database — istanze più grandi, più repliche di lettura — non risolve il problema fondamentale. Ognuna di quelle quarantasette richieste per caricamento di pagina costa ancora tempo e denaro, anche su un database più veloce. Una cache non rende il database più veloce; significa che al database viene posta la stessa domanda molto meno spesso. Per i dati che vengono letti ripetutamente e cambiano di rado — come il menu di un ristorante — una cache significa che il database potrebbe rispondere a quella domanda una volta ogni cinque minuti invece di quarantasette volte per caricamento di pagina.

Amazon ElastiCache è un servizio di caching gestito. Esegue motori di caching popolari — Valkey, Redis e Memcached — senza che tu debba gestire i server.

**Valkey** è il fork open-source di Redis, creato nel 2024 dopo che Redis cambiò la sua licenza, e ora gestito dalla Linux Foundation. Usa gli stessi comandi e supporta le stesse strutture di dati di Redis, quindi ai fini di questo capitolo i due si comportano in modo identico. AWS ha aggiunto ElastiCache per Valkey nell'ottobre 2024 e ora lo posiziona come scelta predefinita per i nuovi cluster: è API-compatibile con Redis ma ha un prezzo più basso (circa il 20% più economico per i cluster basati su nodi e il 33% più economico per l'opzione Serverless). Il motore precedentemente chiamato "Redis" è ora etichettato **Redis OSS** nella console.

**Redis (Redis OSS)** è il più potente dei due motori originali. Supporta strutture di dati complesse (stringhe, liste, set, hash, set ordinati), persistenza (i dati sopravvivono ai riavvii), replica e messaggistica pub/sub. Redis può fare più che caching — può funzionare come un archivio di dati leggero. Tutto ciò che viene detto su Redis in questo capitolo vale ugualmente per Valkey.

**Memcached** è più semplice. Caching puro chiave-valore, scalabile orizzontalmente, nessuna persistenza. Più veloce per casi d'uso semplici ma con meno funzionalità.

Per Nimbus: un motore compatibile con Redis. Avevano bisogno di mettere in cache i dati del menu (strutturati), i token di sessione (chiave-valore) e in seguito avrebbero voluto i set ordinati per i ranking dei "ristoranti di tendenza". Su un cluster creato oggi avrebbero scelto Valkey per il prezzo più basso e il set di funzionalità identico; il design e il codice sono comunque gli stessi.

*Nota per l'esame*: il banco domande SAA-C03 è precedente al lancio di Valkey e formula ancora ElastiCache come "Redis e Memcached." Quando una domanda contrappone "strutture di dati complesse / persistenza" a "semplice chiave-valore", la risposta intesa è ancora il lato Redis — che Valkey soddisfa ora altrettanto.

**Come Funziona il Caching nella Pratica**

Il pattern di caching di base si chiama **cache-aside** (detto anche lazy loading):

1. L'applicazione ha bisogno di dati
2. Controlla prima la cache
3. Se trovato (*cache hit*): restituisci immediatamente i dati
4. Se non trovato (*cache miss*): vai al database, ottieni i dati, memorizzali nella cache, restituiscili

In pseudocodice:

```
menuData = cache.get("menu:restaurant-047")
if menuData is null:
    menuData = dynamodb.query(TableName="menu", KeyConditionExpression="restaurantId = '047'")
    cache.set("menu:restaurant-047", menuData, ttl=300)  # Cache for 5 minutes
return menuData
```

La prima richiesta colpisce sempre il database. Ogni richiesta successiva colpisce la cache. Con una cache, le quarantasette letture DynamoDB di Nimbus per caricamento di pagina diventano una o due ricerche nella cache. Veloce, economico e scalabile.

**Il TTL: Per Quanto Tempo Ricordi?**

Ogni voce della cache ha un **Time-To-Live (TTL)**: la durata dopo la quale la voce scade e la richiesta successiva torna al database per dati freschi.

Questa è la tensione fondamentale del caching: freschezza contro prestazioni.

- **TTL breve (secondi)**: Dati molto freschi, ma molti cache miss. La cache aiuta a malapena.
- **TTL lungo (ore o giorni)**: Molto veloce, ma i dati possono diventare obsoleti. Il cliente vede il menu di ieri.

Per i dati del menu, cinque minuti sono ragionevoli. Il menu non cambia ogni secondo. Se un ristorante aggiorna il suo menu, i clienti potrebbero vedere la versione precedente per un massimo di cinque minuti — accettabile.

Per i token di sessione (questo utente è loggato?), ha senso un TTL più breve, o aggiorni la cache immediatamente quando la sessione cambia.

Per i dati finanziari (totali degli ordini, registri di pagamento), non metterli in cache — o se lo fai, invalidali immediatamente alla scrittura.

Potresti chiederti: perché non aggiungere semplicemente più capacità al database invece di introdurre un intero nuovo livello di caching? Più repliche, un'istanza più grande — perché non quello? La risposta è che la capacità aggiuntiva del database moltiplica la tua capacità di gestire richieste simultanee, ma non riduce il numero di richieste. Se diecimila utenti stanno ognuno attivando quarantasette letture per caricamento di pagina, aggiungere una seconda replica di lettura significa solo che ogni replica gestisce ventitremila richieste invece di quarantasettemila — il lavoro totale non diminuisce. Una cache elimina il lavoro ridondante completamente: quei diecimila utenti condividono lo stesso risultato in cache.

"Ci sono solo due problemi difficili nell'informatica," citò Leo, con la consegna consumata di chi l'aveva detto prima. "L'invalidazione della cache e il dare nomi alle cose."

"Perché l'invalidazione della cache è difficile?" chiese Maya.

"Perché quando cambiano i dati *davvero*? Il menu è cambiato perché un partner del ristorante lo ha aggiornato? O perché è stato eseguito un cron job? O perché un amministratore lo ha modificato manualmente? Ogni punto che può modificare i dati deve sapere di doverlo comunicare alla cache."

Ecco perché gli ingegneri senior iniziano una conversazione sul caching con "quali sono i percorsi di scrittura?" invece di "aggiungiamo Redis."

---

**La Storia dell'Invalidazione della Cache**

Scoprirono quanto fosse difficile l'invalidazione della cache la prima volta che un partner del ristorante si lamentò.

Il Ristorante 112 — una trattoria colombiana nell'Eastside — aveva aggiornato i prezzi un giovedì pomeriggio. Avevano alzato l'arepa da $8 a $9. Chiamarono il supporto Nimbus venti minuti dopo.

"Il nostro menu mostra ancora il vecchio prezzo," disse il proprietario. "I clienti stanno effettuando ordini a $8. Ora dobbiamo onorare quel prezzo."

Tom calcolò la perdita mentre Priya rintracciava il bug. Ogni ordine effettuato in quei venti minuti aveva addebitato $8. Il ristorante voleva $9. Nimbus avrebbe dovuto assorbire la differenza.

Il TTL di cinque minuti avrebbe dovuto essere scaduto da tempo. Erano trascorsi venti minuti. Priya controllò il codice.

La chiave della cache era `menu:restaurant-112`. Era stata impostata con un TTL di 300 secondi. Verificò quando era stata scritta l'ultima volta.

"È stata impostata alle 14:03," disse. "Ventidue minuti fa."

"Ma il TTL è cinque minuti," disse Leo.

"Il TTL è cinque minuti da quando è stata messa in cache per la prima volta. Ma ogni richiesta che colpiva la cache stava aggiornando il TTL. La voce della cache veniva toccata ogni pochi secondi dalle richieste in arrivo, e il TTL veniva reimpostato."

"Quindi non è mai scaduta."

"Non in questa implementazione. Abbiamo impostato il TTL ad ogni lettura della cache. Finestra scorrevole. La voce rimaneva viva finché qualcuno la colpiva."

La correzione: usare un TTL fisso impostato solo alla scrittura, mai esteso alla lettura. La voce scade esattamente cinque minuti dopo essere stata memorizzata, indipendentemente da quante volte viene letta. Quando il ristorante ha aggiornato il suo menu, la vecchia voce è scaduta entro cinque minuti e la richiesta successiva ha recuperato dati freschi.

"E per i casi in cui un ristorante aggiorna i prezzi e ne abbiamo bisogno immediatamente?" chiese Tom.

"Invalidazione attiva," disse Priya. "Quando il portale dei partner del ristorante invia un aggiornamento, l'API chiama `cache.delete('menu:restaurant-112')` prima di restituire. La richiesta successiva recupera immediatamente dati freschi."

"Ma questo richiede che il portale sappia della cache."

"Ogni percorso di scrittura verso il database deve sapere della cache. È quello che ha detto Leo prima. Ora lo abbiamo vissuto."

"L'ho già deploiato — oh." Leo aveva implementato l'invalidazione nel portale ma si era dimenticato dell'interfaccia di modifica dell'amministratore. Due settimane dopo, un amministratore aveva aggiornato un menu attraverso il dashboard interno, e il vecchio prezzo era persistito in cache per cinque minuti. Una versione ridotta dello stesso incidente.

Aggiunsero un handler di DynamoDB Streams — dal capitolo precedente — che invalidava automaticamente la cache ogni volta che una voce del menu cambiava, indipendentemente da quale sistema avesse attivato la scrittura. Un handler, tutti i percorsi di scrittura coperti.

---

**Eviction dalla Cache: Quando la Lavagna Si Riempie**

La lavagna degli speciali ha spazio limitato. Quando si riempie, devi cancellare qualcosa per fare spazio.

Redis (e le cache in generale) hanno *policy di eviction* che determinano cosa viene rimosso quando la memoria è piena:

- **LRU (Least Recently Used)**: Rimuovi gli elementi a cui non si accede da più tempo.
- **LFU (Least Frequently Used)**: Rimuovi gli elementi a cui si accede meno frequentemente.
- **allkeys-random**: Eviction casuale. Semplice, non ottimale.
- **noeviction**: Restituisci un errore quando la memoria è piena (l'applicazione deve gestire questo).

Per la maggior parte delle applicazioni web: LRU. Le cose che non hai guardato di recente probabilmente servono meno.

---

**Il Problema della Cache Stampede**

"Abbiamo pensato a cosa succede se l'intera cache si svuota all'improvviso?" chiese Priya.

"Quando succederebbe?" disse Leo.

"Quando si fa il deploy di un nuovo cluster ElastiCache. Quando il TTL di un grande batch di voci scade simultaneamente. Quando si svuota la cache per forzare un aggiornamento dopo la correzione di un bug."

Leo ci pensò. "Se la cache è vuota, ogni richiesta va al database. Tutte in una volta. Per qualche secondo, il database gestisce il carico completo di ogni utente concorrente."

"Senza cache davanti."

"Farebbe male." Leo guardò le impostazioni di capacità del database. "Verremmo limitati di sicuro."

Questo si chiama **cache stampede** (noto anche come thundering herd). Accade quando molte voci della cache scadono allo stesso tempo — spesso perché sono state tutte create contemporaneamente durante un deploy o un avvio a freddo — e l'improvvisa ondata di cache miss colpisce il database simultaneamente.

Strategie di mitigazione:

**Jitter sul TTL**: Invece di impostare ogni voce del menu a esattamente 300 secondi, aggiungi variazione casuale: da 270 a 330 secondi. Le voci scadono in momenti leggermente diversi, distribuendo l'ondata di cache miss in un minuto invece di colpire simultaneamente.

**Scadenza anticipata probabilistica**: Prima che una voce scada, una piccola percentuale di richieste la aggiorna proattivamente. Questo mantiene le voci fresche prima che diventino obsolete, evitando che la scadenza diventi mai un miss.

**Coalescenza delle richieste (mutex/lock)**: Quando si verifica un cache miss, acquisisci un lock prima di colpire il database. Le altre richieste concorrenti per la stessa chiave attendono il completamento della prima richiesta e il ripopolamento della cache, poi leggono dalla cache. Viene effettuata una sola richiesta al database per cache miss, anche sotto alta concorrenza.

Per Nimbus, implementarono il jitter sul TTL. Semplice, efficace, nessuna complessità aggiuntiva.

```python
import random
TTL_BASE = 300
TTL_JITTER = 30
ttl = TTL_BASE + random.randint(-TTL_JITTER, TTL_JITTER)
cache.set(key, value, ttl=ttl)
```

"Due righe di codice," disse Leo. "Per prevenire un potenziale crash del database durante i deploy."

"La maggior parte dei miglioramenti di affidabilità sono così," disse Priya. "Economici da implementare, costosi da scoprire che erano necessari."

---

**Strutture Dati Redis: Più di Chiave-Valore**

Quando Nimbus aggiunse la funzionalità "ristoranti di tendenza", Leo inizialmente memorizzò il ranking come una semplice lista JSON: `trending:global → ["NIMBUS-047", "NIMBUS-112", ...]`.

Funzionava, ma aggiornarlo era scomodo. Per aggiungere un nuovo ristorante o aggiornare un punteggio, doveva leggere l'intera lista, modificarla nel codice applicativo e riscrivere tutto. Sotto scritture concorrenti dalla pipeline di analisi, le race condition causavano la sovrascrittura dei punteggi.

Priya lo indirizzò verso i set ordinati di Redis.

Un **set ordinato** in Redis memorizza membri con punteggi numerici associati. I membri sono ordinati automaticamente per punteggio. Le operazioni sono atomiche — nessuna race condition da aggiornamenti concorrenti.

```
# Aggiungi/aggiorna il punteggio di un ristorante
ZADD trending:global 9420 "NIMBUS-047"
ZADD trending:global 8831 "NIMBUS-112"

# Ottieni i top 10 ristoranti per punteggio (dal più alto)
ZREVRANGE trending:global 0 9 WITHSCORES

# Incrementa atomicamente il punteggio di un ristorante
ZINCRBY trending:global 50 "NIMBUS-047"
```

La Lambda di analisi chiamava `ZINCRBY` ogni volta che veniva effettuato un ordine, incrementando il punteggio del ristorante. La homepage chiamava `ZREVRANGE` per ottenere i primi dieci. Nessun lock, nessuna race condition, nessun ciclo leggi-modifica-scrivi.

Redis supporta diverse altre strutture di dati oltre al semplice chiave-valore:

**Liste**: Sequenze ordinate. Push all'inizio o alla fine. Usa per code, feed di attività recenti, stream di log.

**Set**: Collezioni non ordinate senza duplicati. Operazioni di unione, intersezione, differenza. Usa per "quali utenti hanno visto questa notifica?" o "quali ristoranti sono in questa categoria?"

**Hash**: Campi nominati all'interno di una chiave. Usa per oggetti strutturati in cui vuoi aggiornare singoli campi senza riscrivere l'intero oggetto.

**HyperLogLog**: Stima probabilistica della cardinalità. Conta i visitatori unici di una pagina senza memorizzare ogni ID visitatore. Compatto e veloce.

**Pub/Sub**: Pubblica messaggi su canali; i sottoscrittori li ricevono in tempo reale. Usa per notifiche leggere in tempo reale tra servizi.

"Redis non è solo una cache," disse Leo. "È un server di strutture di dati."

"È la sua descrizione ufficiale," disse Priya.

"Pensavo fosse solo un dizionario sofisticato."

"Ha iniziato così."

---

**Write-Through: L'Altro Pattern di Caching**

Cache-aside (lazy loading) è il pattern più comune. Ma ce n'è un secondo che vale la pena conoscere: **write-through**.

Nel caching write-through, ogni volta che la tua applicazione scrive sul database, scrive anche sulla cache immediatamente.

```python
def update_menu(restaurant_id, menu_data):
    dynamodb.put_item(TableName="menu", Item=menu_data)
    cache.set(f"menu:{restaurant_id}", menu_data, ttl=300)
```

Il vantaggio: la cache è sempre aggiornata. Non ci sono dati obsoleti tra una scrittura e la scadenza del TTL.

Lo svantaggio: ogni scrittura va in due posti. E si popola la cache con dati che potrebbero non essere mai letti. Se dieci ristoranti aggiornano i loro menu ma solo due di essi ricevono traffico significativo nei cinque minuti successivi, hai fatto il lavoro write-through per otto cache che non verranno usate prima di scadere.

"Aspetta — ma *perché* dovremmo farlo in questo modo?" chiese Maya. "Se scriviamo sulla cache ad ogni aggiornamento, stiamo facendo più lavoro per scrittura di prima. Come è meglio?"

"Non è sempre meglio," disse Priya. "Il write-through ha senso quando non puoi tollerare nessuna finestra di dati obsoleti dopo una scrittura. Il cache-aside accetta fino a un TTL di obsolescenza in cambio di non fare lavoro extra ad ogni scrittura."

Per Nimbus: il cache-aside era la scelta giusta. I menu venivano letti molto più spesso di quanto venissero scritti. Una finestra di obsolescenza di cinque minuti era accettabile. Per un sistema di trading finanziario in cui ogni aggiornamento di prezzo doveva essere immediatamente riflesso, il write-through sarebbe più appropriato.

La decisione si riduce a due domande: qual è il tuo rapporto scrittura-lettura, e quanto sei tollerante verso letture obsolete dopo una scrittura?


---

**ElastiCache per Redis: Cosa Ottieni in Modalità Gestita**

Come RDS, ElastiCache prende uno strumento open-source e gestisce il lavoro operativo:

- **Backup automatici**: snapshot Redis secondo un programma
- **Replica Multi-AZ**: nodo primario + repliche di lettura in diverse AZ
- **Failover automatico**: se il nodo Redis primario si guasta, una replica viene promossa automaticamente
- **Modalità cluster**: sharding orizzontale su più nodi per cache molto grandi
- **Crittografia**: crittografia in transito e a riposo per la conformità
- **Integrazione VPC**: la cache gira nella tua rete privata, non accessibile pubblicamente

"Quanto costa al mese?" chiese Tom.

"Meno delle letture DynamoDB che stiamo sostituendo," disse Leo. "Di circa duecento dollari al mese."

Leo aprì la pagina dei prezzi. Aveva già fatto i calcoli, ma guidò Tom attraverso di essi.

Un `cache.t3.micro` — il nodo più piccolo — costava circa $12 al mese. Aveva 0,5 GB di memoria. Sufficiente per una piccola applicazione con alcune centinaia di chiavi di cache.

Un `cache.r6g.large` — il livello appropriato per il traffico di Nimbus — aveva 13 GB di memoria e costava circa $140 al mese. Per confronto, Nimbus stava spendendo circa $400 al mese in letture DynamoDB prima del caching. Quando Tom aveva valutato per la prima volta la tabella, il conto on-demand era di dodici dollari al mese — ma il numero di partner si era moltiplicato da allora, ogni visualizzazione del menu colpiva la tabella, e il volume delle letture era cresciuto di oltre trenta volte. Post-caching, quelle letture erano scese di circa l'89 percento. Il calcolo dava circa $356 al mese risparmiati sulle letture DynamoDB, meno $140 spesi per ElastiCache — un risparmio netto di circa $216 al mese.

L'espressione di Tom passò dallo scettico al soddisfatto. "Fai i calcoli in modo appropriato prima di scalare, ma sembra convincente." Lo annotò.

"E se qualcuno tenta di violare il sistema?" disse Priya. "La cache potrebbe avere token di sessione. Dati utente. Abbiamo bisogno di token di autenticazione sull'istanza Redis e nessun accesso pubblico."

"Sarà nella sottorete privata," disse Leo.

"Bene. Ma 'andrà bene' non è una postura di sicurezza," disse lei. "Token di autenticazione. Crittografia in transito. Solo VPC."

Leo annuì. Aveva ragione.

---

**Monitoraggio della Cache**

"Abbiamo pensato a cosa succede quando la cache non funziona correttamente?" chiese Priya, una settimana dopo il deploy di Redis. "Non solo fallisce completamente — funziona, ma male. Alto tasso di miss. Alto tasso di eviction. Latenza che aumenta progressivamente."

"Me ne accorgerei quando i tempi di caricamento della pagina aumentano," disse Leo.

"A quel punto il database sta già soffrendo," disse lei.

ElastiCache espone metriche attraverso CloudWatch. Quelle che contano di più:

**CacheHitRate**: La percentuale di letture della cache che hanno restituito un risultato. Idealmente superiore all'80% per una cache matura. Un tasso di hit in calo segnala che i tuoi dati più acceduti non sono nella cache — o i TTL sono troppo brevi, la cache è troppo piccola, o i tuoi pattern di accesso sono cambiati.

**CacheMisses**: Conteggio assoluto dei cache miss. Un picco improvviso qui significa che la cache non sta aiutando e il database sta prendendo il carico completo.

**Evictions**: Il numero di elementi della cache espulsi per fare spazio a nuovi. Tassi di eviction elevati significano che la tua cache è troppo piccola per il tuo working set. Hai bisogno di più memoria o di una strategia di caching più selettiva.

**CurrConnections**: Connessioni client correnti a Redis. Troppe connessioni possono esaurire il limite di connessione di Redis. Le applicazioni dovrebbero usare il connection pooling per evitare di aprire una nuova connessione ad ogni richiesta.

**ReplicationLag**: Quanto è in ritardo la replica di lettura rispetto al primario. Se questo cresce, le letture dalla replica potrebbero restituire dati obsoleti.

Leo impostò due allarmi CloudWatch. Primo: allerta se il tasso di hit della cache scendeva sotto il 70% per quindici minuti consecutivi — questo avrebbe segnalato un problema da investigare prima che il database lo sentisse. Secondo: allerta se il tasso di eviction superava 100 eviction al minuto — questo avrebbe segnalato che la cache era sottodimensionata.

"Due allarmi," disse Priya, rivedendo la configurazione. "È un buon inizio."

"Ho anche aggiunto un dashboard," disse Leo. "Tasso di hit, tasso di miss, eviction, latenza. Tutto visibile in un posto."

"È meglio che aspettare che la pagina diventi lenta."

"Considerevolmente meglio," concordò Leo.


---

**ElastiCache vs DAX: Quale Cache per DynamoDB?**

"Se stiamo mettendo in cache i dati DynamoDB," chiese Maya, "perché non usare DAX invece di ElastiCache? L'ho visto nella documentazione."

Buona domanda.

**DAX (DynamoDB Accelerator)** è una cache in memoria dedicata per DynamoDB. Intercetta le chiamate API DynamoDB a livello del client — il codice della tua applicazione parla a DAX usando lo stesso SDK DynamoDB. I cache miss vengono recuperati automaticamente da DynamoDB. I cache hit restituiscono in microsecondi. L'invalidazione viene gestita automaticamente — ma solo per le scritture instradata attraverso DAX stesso (è una cache write-through); le scritture che bypassano DAX, da un'altra applicazione o dalla console, lasciano voci obsolete nella cache fino alla scadenza del TTL dell'elemento.

**ElastiCache** è una cache di uso generale. Gestisci le chiavi della cache, la logica TTL, l'invalidazione — tutto. Più controllo, più responsabilità.

Quando usare ciascuno:

| Scenario | Raccomandazione |
|---|---|
| Stai mettendo in cache letture DynamoDB e vuoi zero modifiche all'applicazione | DAX |
| Hai bisogno di latenza a microsecondi sulle letture DynamoDB | DAX |
| Stai mettendo in cache da più sorgenti (DynamoDB + RDS + API esterne) | ElastiCache |
| Hai bisogno di strutture dati Redis (set ordinati, pub/sub, HyperLogLog) | ElastiCache |
| Hai bisogno di controllo TTL granulare e logica di invalidazione personalizzata | ElastiCache |
| Hai bisogno di storage di sessione, rate limiting o lock distribuiti | ElastiCache |

Per Nimbus: scelsero ElastiCache perché stavano mettendo in cache dati da più sorgenti — DynamoDB per i menu, RDS per i riepiloghi della cronologia degli ordini, API esterne per le valutazioni dei ristoranti. DAX funziona solo con DynamoDB. E avevano bisogno dei set ordinati Redis per i ranking di tendenza.

"Se fosse puramente un problema di caching DynamoDB," disse Priya, "DAX sarebbe la risposta più semplice. Un servizio, invalidazione automatica, stessa API. Ma abbiamo più di una sorgente di dati."

"Quindi DAX è più semplice quando sei solo su DynamoDB," riassunse Maya. "ElastiCache quando hai bisogno della cassetta degli attrezzi completa."

"Questo è il compromesso."

### Quando i Dati della Cache Non Possono Andare Persi: Amazon MemoryDB

"Perché qualcuno userebbe Redis come database primario?" chiese Maya. "Non è una cache?"

Esattamente la domanda giusta.

ElastiCache per Redis è una cache — veloce, in memoria e, per design, non la fonte di verità. Se un nodo ElastiCache si guasta, la cache è vuota al riavvio. Le applicazioni la riscaldano nuovamente dal database. Questo va bene per una cache.

Ma alcuni casi d'uso trattano Redis non come una cache ma come un archivio dati primario — stato di sessione che deve sopravvivere ai riavvii, una classifica in tempo reale che non può andare persa, un carrello della spesa che deve persistere attraverso un guasto AZ. Per questi casi d'uso, la durabilità eventuale di ElastiCache è un rischio.

**Amazon MemoryDB for Redis** è un database in memoria completamente gestito, compatibile con Redis e durevole. A differenza di ElastiCache, MemoryDB usa un log delle transazioni distribuito memorizzato su più AZ che rende ogni scrittura durevole prima che venga riconosciuta. I dati sopravvivono ai guasti dei nodi — non perché vengono rielaborati da un database più lento, ma perché non sono mai stati in un solo posto.

La distinzione chiave:

| | ElastiCache per Redis | MemoryDB per Redis |
|---|---|---|
| Ruolo | Livello di cache | Database primario |
| Durabilità | Non garantita in caso di guasto | Log delle transazioni Multi-AZ |
| Latenza | Letture e scritture a microsecondi | Letture a microsecondi, scritture a singola cifra di millisecondi |

Entrambi supportano gli stessi comandi e strutture di dati Redis. L'API è la stessa. La garanzia di durabilità non lo è. (MemoryDB ha aggiunto anche il supporto Valkey nell'ottobre 2024, con un prezzo di circa il 30% inferiore rispetto all'opzione Redis OSS; come con ElastiCache, la scelta del motore non cambia il design qui.)

Per Nimbus: il team vuole memorizzare conteggi degli ordini per ristorante in tempo reale come set ordinato Redis — e deve sopravvivere a un guasto AZ senza essere rieseguito dal database. Quel requisito — compatibile con Redis *e* durevole — è esattamente il segnale per MemoryDB.

"Quindi non dobbiamo riscaldarlo nuovamente dopo un guasto?" chiese Leo.

"È il punto," disse Priya. "Se il nodo si guasta e torna su, i dati ci sono. Il log delle transazioni li ha mantenuti."

Leo fissò la pagina dei prezzi per un momento. "Costa più di ElastiCache."

"Tutto ciò che vale la pena fidarsi lo fa," disse Priya.

## Punti di Forza e Limitazioni

**Perché il caching è potente**:

- Riduce drasticamente il carico del database (meno query, costi inferiori)
- Tempi di risposta sub-millisecondo per i cache hit
- Protegge il tuo database dai picchi di traffico
- Redis supporta strutture di dati più ricche rispetto a un semplice archivio chiave-valore
- La mitigazione della cache stampede (jitter TTL, coalescenza) protegge dai picchi di avvio a freddo

**Dove il caching diventa complicato**:

- L'invalidazione della cache è genuinamente difficile — i dati obsoleti causano bug
- Aggiunge complessità operativa (un altro servizio da monitorare, un altro punto di guasto)
- Problema dell'avvio a freddo: quando fai un deploy da zero, la cache è vuota — il database prende il carico completo
- Cache stampede: se molte voci scadono contemporaneamente, tutte le richieste colpiscono il database simultaneamente
- I nodi ElastiCache non sono gratuiti — li paghi anche quando sono inattivi

**ElastiCache vs DynamoDB DAX**:

Se stai mettendo in cache i dati DynamoDB specificamente, AWS offre **DAX (DynamoDB Accelerator)** — una cache in memoria dedicata per DynamoDB. DAX è trasparente per il codice della tua applicazione (stessa API), riduce la latenza di lettura DynamoDB a microsecondi e gestisce l'invalidazione della cache automaticamente per le scritture instradata attraverso di esso.

Usa DAX quando il tuo collo di bottiglia sono le letture DynamoDB e vuoi caching senza modifiche. Usa ElastiCache quando hai bisogno di una cache di uso generale per qualsiasi sorgente di dati, o quando hai bisogno di strutture dati Redis.

## Riepilogo

Quarantasette chiamate al database sono diventate una ricerca nella cache. La pagina è passata da 188 millisecondi a 12. Aggiungere un livello di caching è uno dei cambiamenti a più alto impatto che un'applicazione in crescita può fare — ma solo quando la cache è progettata in modo ponderato, con risposte chiare alla domanda "quando cambiano questi dati?"

- Una cache è un deposito veloce di dati recuperati di recente — la chiedi una volta, ricordi la risposta. ElastiCache è il servizio di caching gestito di AWS, che supporta **Valkey** e **Redis (Redis OSS)** (persistenza, strutture di dati complesse, pub/sub) e **Memcached** (puro chiave-valore, scalabilità orizzontale). Valkey è il fork open-source di Redis a cui AWS ora fa il default e che ha un prezzo inferiore; è API-compatibile, quindi tutto ciò che viene detto qui su Redis si applica ad esso. L'esame SAA-C03 dice ancora "Redis e Memcached."
- Il **pattern cache-aside** (lazy loading): controlla prima la cache, torna al database in caso di miss. **TTL** controlla quanto a lungo i dati rimangono in cache — TTL breve significa dati più freschi e più miss; TTL lungo significa risposte più veloci e potenziale obsolescenza.
- Metti in cache la cosa giusta: i dati per entità condivisi tra molti utenti, non i dati per utente unici per ciascuna sessione. La cache stampede si verifica quando molte voci scadono simultaneamente — mitiga con il jitter TTL.
- **DAX** è la scelta giusta per il caching solo DynamoDB. **ElastiCache** è più flessibile per il caching multi-sorgente e le strutture dati Redis.
- La parte più difficile del caching è l'invalidazione: sapere quando i dati cambiano e aggiornare la cache su tutti i percorsi di codice che la scrivono. Una cache è affidabile quanto la sua strategia di invalidazione.

## Suggerimenti per l'Esame

*Dominio SAA-C03: Progettazione di Architetture ad Alte Prestazioni (Dominio 3, Task 3.3)*

- **Redis vs Memcached nell'esame**: Redis = persistenza, replica, strutture complesse, pub/sub. Memcached = semplice chiave-valore, scalabilità orizzontale pura. Quando lo scenario menziona "non puoi perdere i dati in cache", la risposta è Redis (persiste su disco).
- **Segnali di utilizzo di ElastiCache**: "il database è un collo di bottiglia," "carico di lavoro ad alto numero di letture," "riduci la latenza," "store di sessione" — tutti indicano ElastiCache.
- **Segnale DAX**: "riduci la latenza di lettura DynamoDB" o "le letture DynamoDB sono troppo lente" → DAX, non ElastiCache.
- **Gestione delle sessioni**: ElastiCache Redis è la risposta canonica per memorizzare i dati delle sessioni utente. Applicazione stateless + store di sessioni Redis = scalabilità orizzontale con sessioni coerenti.
- **Write-through vs cache-aside**: Cache-aside (lazy loading) è il più comune. Write-through aggiorna la cache ad ogni scrittura — mai obsoleto, ma più operazioni di scrittura. L'esame potrebbe distinguerli.
- **Policy di eviction della cache**: LRU (least recently used) è la risposta più comune nell'esame per carichi di lavoro web generali.
- **ElastiCache vs MemoryDB**: ElastiCache = livello di cache, veloce, perdita di dati accettabile in caso di guasto. MemoryDB = database primario in memoria durevole, compatibile con Redis, log delle transazioni Multi-AZ. Trigger nell'esame: "compatibile con Redis E durevole" o "archivio dati primario in Redis" → MemoryDB, non ElastiCache.

## Esercizi

**Esercizio 1 — Ricordo**

Con parole tue: cos'è l'invalidazione della cache e perché è difficile?

*(Suggerimento: Pensa alla lavagna degli speciali all'ingresso del ristorante — quando lo chef cambia gli speciali in cucina, chi è responsabile di uscire e aggiornare la lavagna?)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: Una piattaforma di streaming video serve milioni di utenti. Il catalogo di film disponibili cambia raramente (aggiornato di notte). L'applicazione sta riscontrando un elevato utilizzo della CPU del database perché ogni richiesta utente interroga il catalogo. Il team vuole ridurre il carico del database mantenendo i dati del catalogo accurati entro un'ora dagli aggiornamenti.

Quale soluzione soddisfa MEGLIO questi requisiti?

A) Aggiungere repliche di lettura al database RDS per distribuire il carico
B) Migrare il catalogo a DynamoDB con capacità on-demand
C) Usare ElastiCache per Redis con un TTL di 1 ora per i dati del catalogo
D) Aumentare la dimensione dell'istanza RDS per gestire più query concorrenti

**Suggerimento 1**: I dati sono ad alto numero di letture e cambiano raramente. Quale pattern è ideale per questo?

**Suggerimento 2**: "Accurato entro un'ora" si traduce direttamente in uno specifico parametro di configurazione della cache.

**Suggerimento 3**: L'obiettivo è ridurre il carico del database, non solo gestirne di più.

**Risposta**: C

**Spiegazione**: ElastiCache con un TTL di un'ora mette in cache i dati del catalogo dopo la prima richiesta per chiave. Le richieste successive restituiscono dalla cache senza toccare il database. Quando viene eseguito l'aggiornamento notturno, le voci scadono entro un'ora e i dati freschi vengono caricati alla richiesta successiva.

**Perché non A?** Le repliche di lettura distribuiscono il traffico di lettura su più nodi del database ma non riducono il numero totale di query. Sono utili per scalare le letture, non per ridurre il carico del database da query ripetute frequentemente.

**Perché non B?** Migrare a DynamoDB non risolve il problema sottostante — i dati del catalogo verrebbero ancora recuperati dal database (DynamoDB) ad ogni richiesta utente.

**Perché non D?** Scalare l'istanza gestisce più query concorrenti ma non riduce il numero di query. L'inefficienza fondamentale rimane.

*Dominio SAA-C03: Progettazione di Architetture ad Alte Prestazioni — Task 3.3*

**Esercizio 3 — Sfida di Architettura** *(Opzionale)*

Nimbus vuole aggiungere una funzionalità "ristoranti di tendenza": un elenco classificato dei top 10 ristoranti per volume di ordini nelle ultime 24 ore, aggiornato ogni 15 minuti.

Come implementeresti questo con ElastiCache Redis? Quale struttura dati Redis useresti per il ranking? Quale sarebbe il tuo TTL per la cache, e quando esattamente aggiorneresti la cache?

Considera anche: cosa succede se il nodo ElastiCache va giù? La funzionalità si interrompe? Come progetteresti per gestire questo guasto?

*(Non esiste una risposta corretta univoca. L'obiettivo è esercitarsi nel design della cache e nel pensiero sui guasti.)*

## Scena Post-Crediti

"Andrà bene," aveva detto Leo, con quel particolare tono di sicurezza casual — e aveva mandato in produzione l'integrazione Redis prima di aggiornare le impostazioni del connection pool. Sotto carico, l'applicazione aveva aperto troppe connessioni Redis. Aveva dovuto fare il rollback e ridistribuire con la configurazione corretta.

Ora era live. Quarantasette chiamate DynamoDB erano diventate una ricerca Redis — 0,8 millisecondi.

Annunciò i numeri al daily standup del lunedì.

"Buon lavoro," disse Priya, senza alzare lo sguardo dal laptop.

"Grazie," disse Leo.

"Quando hai fatto l'ultima rotazione del token di autenticazione Redis?"

Leo guardò i suoi appunti. "Non credo di averne impostato uno."

"Quindi la cache è non autenticata."

"È dentro il VPC."

"Come tutto il resto che viene compromesso." Alla fine alzò lo sguardo. "Se il laptop di Leo venisse infettato e qualcuno facesse pivot nel VPC, la tua cache non ha password."

Leo la fissò.

"Imposterò il token di autenticazione," disse.

Nel prossimo capitolo: la rete privata che separa ciò che Nimbus possiede dal resto di Internet.
