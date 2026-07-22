# Capitolo 3: Chi Sei, Esattamente?

Erano appena passate le nove di mattina. Leo era alla sua scrivania dalle sette, il caffè ormai freddo accanto alla tastiera. L'ufficio era silenzioso — Maya non era ancora arrivata, Tom era al telefono. Fuori, qualcuno stava tagliando il prato.

Leo digitò il comando un'altra volta.

Il terminale restituì due parole: Access Denied.

La crisi di Singapore era alle spalle. La Region era sistemata, il server girava in us-west-2, e il team si sentiva brevemente competente. Quella sensazione era durata circa quarantotto ore prima che emergesse il nuovo problema: Leo non riusciva a fare il deploy in produzione. Nessuno aveva configurato i suoi permessi. Nessuno aveva configurato i permessi di nessuno. L'account AWS era completamente aperto a livello di root e chiuso a chiave ovunque, e nessuno se n'era accorto perché nessuno aveva mai provato.

"L'ho già deployato — ah," mormorò Leo, scorrendo indietro nel terminale. Per una settimana aveva deployato in quello che pensava fosse la produzione. Era staging. L'ambiente di produzione reale non era mai stato toccato.

Maya guardò oltre la sua spalla il messaggio di errore. "Chi ti ha dato quel permesso?"

Leo si girò. "Quale permesso?"

"Il permesso di fare il deploy in produzione. Chi lo ha configurato?"

Leo aprì la console AWS e iniziò a fare clic sui menu. Nessuno lo aveva fatto. Non c'era
nessuna policy, nessun ruolo, nessuna concessione esplicita. Non c'era nemmeno un rifiuto
esplicito — solo un'assenza. Nessuno a Nimbus si era mai seduto a pensare a chi poteva fare cosa.

Questo era il problema.

**Il Problema con le Password**

Le password sono un modello sbagliato per i sistemi informatici.

Non perché siano sempre deboli. Perché sono binarie: o hai la password
o non la hai. Se la hai, puoi fare qualsiasi cosa l'account è autorizzato a fare.

Va bene per un singolo utente sul proprio laptop personale. È catastrofico per
l'infrastruttura cloud di un'azienda.

Considera cosa Nimbus deve gestire: il server web, il database, l'archiviazione dei file,
il networking, gli avvisi di fatturazione, gli account utente. Se tutto è protetto da una
password — o anche da un insieme di credenziali — allora chiunque ottenga quella password
ottiene tutto.

E "tutto" su AWS significa la capacità di eliminare database. Avviare server che generano
una fattura da 50.000 dollari. Esfiltrare ogni record cliente. Distruggere i dati di backup.

C'è un altro problema oltre alla natura binaria delle password: le password sono statiche.
Non scadono automaticamente. Vengono spesso riutilizzate tra servizi. Vengono scritte.
Vengono conservate in fogli di calcolo etichettati "password NON CONDIVIDERE." Vengono
condivise lo stesso, perché la comodità batte la sicurezza quando il meccanismo di
sicurezza è frizione.

Il problema delle "credenziali condivise" non è un difetto caratteriale. È un problema di
sistema. Quando l'unico modo per dare a qualcuno un accesso temporaneo a un sistema è
dargli la password permanente, le persone condividono le password. La soluzione è
costruire un sistema in cui l'accesso temporaneo e limitato sia l'impostazione predefinita
— non una soluzione alternativa che richiede uno sforzo eroico.

Quello che serve non è solo "password migliori," ma un modello fondamentalmente diverso —
uno in cui l'accesso sia definito da identità e policy piuttosto che da chi conosce una
stringa di caratteri.

Priya non descrisse questo in termini calmi e astratti. Lo descrisse come una storia.

**La Violazione Che Andava Avanti da Settimane**

Uno sviluppatore di una startup aveva caricato uno script di deployment per GitHub Actions nel proprio repository pubblico. Lo script conteneva credenziali AWS inserite come variabili d'ambiente — un errore abbastanza comune da avere una propria categoria nei post-mortem sulla sicurezza cloud. Le credenziali avevano accesso admin completo all'account AWS dell'azienda, perché qualcuno le aveva configurate in quel modo sei mesi prima per evitare di occuparsi delle policy IAM.

Le credenziali erano nel file per circa sei minuti prima che uno scanner automatizzato — gestito da un attaccante, non da un ricercatore di sicurezza — le trovasse.

Lo scanner indicizzò le credenziali, valutò i permessi dell'account e iniziò ad avviare istanze GPU in più Region. Le istanze GPU sono costose. Sono anche utili per il mining di criptovalute. Entro la prima ora, quarantasette istanze `p3.8xlarge` erano in esecuzione su `us-east-1`, `eu-west-1` e `ap-southeast-1`.

Una `p3.8xlarge` costa circa 12 dollari all'ora. Quarantasette di esse costano 564 dollari all'ora.

Quando l'avviso di fatturazione della startup scattò — configurato a 1.000 dollari al giorno, una soglia che nessuno aveva pensato di abbassare — erano passate quattro ore. Il conto si avvicinava a 2.200 dollari e stava salendo.

Nel momento in cui qualcuno capì cosa stava succedendo e revocò le credenziali, il conto aveva raggiunto 3.400 dollari per quelle poche ore. Ma il costo reale arrivò dopo: l'audit rivelò che l'attaccante stava facendo mining da settimane, silenziosamente, di notte, usando un secondo set di credenziali trapelate che nessuno aveva notato. Il danno totale al termine dell'audit: oltre 80.000 dollari.

"E hanno chiuso?" chiese Tom.

"Tre mesi dopo," disse Priya. "Gli investitori si ritirarono. La violazione venne divulgata. La copertura stampa rese impossibile raccogliere fondi."

La stanza fu silenziosa.

"Quindi qual è l'alternativa?" chiese Tom.

**Il Concetto: Identity and Access Management**

L'alternativa è un sistema in cui non dai a tutti la stessa chiave.

Immagina un palazzo per uffici dove ogni piano ha aree diverse, e ogni dipendente
ha un badge che apre solo le porte di cui ha bisogno per il suo lavoro. Il badge
del tirocinante funziona al terzo piano. Quello del contabile apre l'ufficio finanziario
ma non la sala server. Nessuno passa da una porta che non ha motivo di attraversare.

Questo è il modello che usa AWS.

AWS chiama questo sistema **IAM**: Identity and Access Management.

IAM è il sistema di badge per l'intero account cloud. Definisci chi esiste
(identità), cosa è autorizzato a fare (permessi), e applichi quei permessi
attraverso le policy. Il palazzo ha decine di piani. IAM fa in modo che ogni persona
possa raggiungere solo i piani di cui ha bisogno.

L'analogia del badge si estende ulteriormente. In un palazzo ben gestito, sai in qualsiasi momento chi ha accesso a cosa. Puoi stampare un report: ecco i diritti di accesso di ogni badge. Ecco chi è stato nella sala server negli ultimi 30 giorni. Ecco le card non utilizzate negli ultimi 90 giorni (un possibile indicatore di una card di un dipendente licenziato che non è stata disattivata).

IAM fornisce la stessa visibilità. Ogni azione effettuata tramite IAM — ogni chiamata API, ogni accesso alla console, ogni concessione di permesso — è registrata in **AWS CloudTrail**. Se hai bisogno di sapere chi ha cancellato un database alle 2 di notte di un martedì, CloudTrail ha la risposta. Se devi dimostrare a un auditor che solo gli utenti autorizzati avevano accesso ai sistemi di produzione, CloudTrail fornisce le prove.

AWS CloudTrail conserva automaticamente uno storico di 90 giorni degli eventi di gestione, leggibile dalla console. Ma 90 giorni hanno un modo di non essere abbastanza quando il team di sicurezza deve fare l'audit di qualcosa del trimestre precedente. Per una registrazione persistente a lungo termine — e per gli avvisi — devi creare un **Trail**, che scrive tutti gli eventi in un bucket S3 e può inviare in streaming a CloudWatch Logs. Il Trail non è automatico; è qualcosa che configuri una volta e poi dimentichi. Finché non ne hai bisogno.

La combinazione dei controlli di accesso di IAM e della registrazione degli audit di CloudTrail è ciò che permette alle grandi organizzazioni di gestire account AWS su larga scala con fiducia: l'accesso è definito e applicato da IAM; ogni utilizzo di quell'accesso è registrato da CloudTrail.

**L'Analogia dell'Ospedale**

Ecco un secondo modo per pensarci — uno che rende la gerarchia degli accessi più intuitiva.

Immagina un ospedale. Non solo l'edificio fisico, ma la struttura organizzativa completa di persone, ruoli e dati.

La **receptionist** può vedere i programmi degli appuntamenti dei pazienti e le informazioni assicurative. Può fare il check-in e il check-out dei pazienti. Non può accedere alle cartelle cliniche, non può modificare le prescrizioni, non può vedere le storie chirurgiche.

L'**infermiera** può accedere alle cartelle cliniche dei pazienti nel suo reparto. Può somministrare farmaci secondo gli ordini del medico. Non può prescrivere farmaci. Non può autorizzare interventi chirurgici.

Il **medico** può visualizzare e modificare le cartelle cliniche, scrivere ricette e ordinare esami. Non può accedere al sistema di gestione stipendi. Non può modificare le ricette di altri medici senza un'autorizzazione specifica.

Il **chirurgo** può accedere ai sistemi della sala operatoria. Ha permessi specifici per le cartelle chirurgiche che la maggior parte dei medici non necessita.

Il **personale delle pulizie** può accedere alle planimetrie e agli orari delle stanze. Non può accedere a nessun dato dei pazienti.

Ogni persona nell'ospedale ha l'accesso di cui ha bisogno per il proprio lavoro — e solo quello. La receptionist non ha accesso chirurgico. Il personale delle pulizie non vede le cartelle dei pazienti. E, fondamentalmente: se il badge di un membro del personale delle pulizie viene rubato, l'attaccante ottiene gli orari delle pulizie. Non ottiene le cartelle dei pazienti. Il raggio d'impatto della violazione è limitato a ciò a cui quel badge poteva accedere.

Così funziona IAM. Ogni identità — ogni utente, ogni servizio, ogni processo automatizzato — ottiene esattamente i permessi di cui ha bisogno. Niente di più.

Tom si appoggiò allo schienale. "Quindi Leo è l'infermiera e io sono il contabile."

"Qualcosa del genere," disse Priya. "E nessuno dei due è il chirurgo."

"Chi è il chirurgo?"

"Nessuno, nel lavoro quotidiano," disse Priya. "L'account root è il chirurgo. Viene tirato fuori solo per procedure specifiche e documentate."

**I Mattoni di IAM**

IAM ha quattro concetti fondamentali. Si basano l'uno sull'altro.

**Gli Utenti** sono identità individuali. Maya ha un utente IAM. Tom ha un utente IAM.
Ogni utente ha le proprie credenziali — e dovrebbe avere solo i permessi di cui ha
specificamente bisogno.

Un utente IAM ha due tipi di credenziali: una **password** per l'accesso alla console (il login all'interfaccia web AWS) e le **chiavi di accesso** (un ID chiave e una chiave segreta) per l'accesso programmatico tramite CLI o SDK. Non hai sempre bisogno di entrambe. Uno sviluppatore che usa solo la CLI non ha bisogno di una password per la console. Un utente non tecnico che ha bisogno solo della console non ha bisogno di chiavi di accesso. Concedi solo ciò che è necessario.

**I Gruppi** sono raccolte di utenti. Invece di impostare i permessi per Maya, Tom,
Priya e Leo individualmente, crei un gruppo "Sviluppatori" con i permessi da sviluppatore
e li aggiungi. Quando si unisce una quinta persona, la aggiungi al gruppo e questa
eredita immediatamente i permessi corretti.

Il vantaggio pratico dei gruppi è la manutenibilità. Se il gruppo "Sviluppatori" ha bisogno di un nuovo permesso — diciamo, l'accesso a un nuovo bucket S3 — lo aggiungi al gruppo una volta e tutti gli sviluppatori lo ottengono immediatamente. Senza i gruppi, dovresti aggiornare ogni utente individualmente, il che crea opportunità di incoerenza e persone dimenticate.

**I Ruoli** sono identità temporanee che possono essere *assunte* da qualcosa — una persona, un
servizio, o un altro account AWS. Approfondiamo i Ruoli nel Capitolo 14. Per ora: se
un Utente è un dipendente permanente, un Ruolo è un badge per visitatori. Concede accesso
specifico per un tempo o scopo specifico.

L'utilizzo più importante dei Ruoli in questo capitolo: i IAM Role per le istanze EC2. Quando alleghi un Ruolo a un'istanza EC2, l'applicazione in esecuzione su quell'istanza può effettuare chiamate API AWS usando i permessi del Ruolo — senza credenziali statiche memorizzate da nessuna parte. Le credenziali sono temporanee, ruotate automaticamente da AWS, e limitate alle policy del Ruolo. Questo elimina completamente il problema delle "credenziali nei file di configurazione".

**Le Policy** sono le regole effettive di permesso. Una policy è un documento (scritto in
JSON internamente, ma non hai bisogno di memorizzare il formato) che dice: "Il titolare
di questa policy è AUTORIZZATO a eseguire l'azione X sulla risorsa Y." O "NEGATO
l'azione Z."

AWS fornisce centinaia di **policy gestite** — policy preconfigurate per casi d'uso comuni. `AmazonS3ReadOnlyAccess` concede accesso in lettura a tutti i bucket S3. `AmazonEC2FullAccess` concede il controllo completo di EC2. Per l'uso in produzione, spesso si vogliono **policy gestite dal cliente** — policy che scrivi tu stesso, limitate con precisione alle risorse e alle azioni di cui la tua applicazione ha effettivamente bisogno.

Il modello di valutazione IAM è: per impostazione predefinita, tutto è negato. I permessi
devono essere concessi esplicitamente. Se una policy non dice che puoi fare qualcosa, non puoi.

**Il Principio del Minimo Privilegio**

Dai alle persone e ai sistemi solo l'accesso di cui hanno bisogno per fare il loro lavoro. Niente di più.

Priya chiamò questo "il principio del minimo privilegio." Sembra ovvio. In pratica,
la maggior parte dei team lo viola continuamente — non per malizia, ma per comodità.

"Possiamo semplicemente dare a Leo l'accesso admin così può distribuire le cose più velocemente?"

No.

"Possiamo semplicemente usare l'account root per tutto?"

Assolutamente no.

L'account root è la chiave master dell'intero account AWS. Può fare qualsiasi cosa,
incluso chiudere l'account stesso. Dovresti crearlo una volta, impostare
l'autenticazione multi-fattore, e poi non usarlo mai più per il lavoro quotidiano.

Esiste una manciata precisa di operazioni che richiedono l'account root: cambiare l'indirizzo email dell'account, visualizzare le informazioni di fatturazione che non sono altrimenti delegate, chiudere l'account, e alcune altre operazioni amministrative che AWS limita esplicitamente a root. Per tutto il resto — creare utenti, fare il deploy dell'infrastruttura, accedere ai database — si usano utenti e ruoli IAM. L'account root è per il gestore dell'edificio. Tutti gli altri hanno i badge appropriati.

Priya quel pomeriggio creò utenti IAM separati per tutti. Diede a Leo i permessi
per fare il deploy nell'ambiente di sviluppo. Non in produzione. Non nella fatturazione. Non nel
networking. Solo nel deployment.

"Sembra restrittivo," disse Leo.

"Così sai che è giusto," rispose Priya.

Il confine tra sviluppo e produzione fu la prima e più importante linea del minimo privilegio che Priya tracciò. Gli sviluppatori dovevano muoversi velocemente in sviluppo: creare risorse, testare configurazioni, commettere errori. Ma la produzione era diversa. Le modifiche alla produzione dovevano essere deliberate, revisionate ed eseguite attraverso un processo controllato. Dare a uno sviluppatore accesso diretto alla produzione significava dargli la possibilità di commettere errori di produzione alla velocità dello sviluppo.

Nel tempo, Priya costruì un sistema in cui l'accesso alla produzione veniva concesso temporaneamente attraverso un processo di assunzione del ruolo: uno sviluppatore che aveva bisogno di apportare una modifica alla produzione richiedeva l'accesso, lo otteneva per una finestra di 4 ore, faceva la modifica e l'accesso scadeva automaticamente. La finestra era registrata in CloudTrail. L'accesso non poteva essere utilizzato dopo la scadenza. La produzione era protetta non negando l'accesso in modo permanente, ma rendendo l'accesso limitato nel tempo e verificabile.

Ti starai chiedendo: se tutto è negato per impostazione predefinita, perché l'account root ha accesso completo? L'account root è speciale — bypassa del tutto IAM. Ecco precisamente perché lo si conserva al sicuro. Ogni altra azione in AWS passa attraverso la catena di valutazione di IAM, dove un Allow mancante equivale a un Deny.

**Raggio d'Impatto: Perché il Minimo Privilegio Salva le Aziende**

C'è un concetto che gli ingegneri della sicurezza usano per valutare la compromissione delle credenziali: il **raggio d'impatto**.

Il raggio d'impatto è il danno massimo che un attaccante può fare se ottiene una determinata credenziale.

Un attaccante con le credenziali root di un account AWS ha un raggio d'impatto illimitato. Può eliminare ogni risorsa, esfiltrare ogni byte di dati, avviare istanze GPU in ogni Region e chiudere l'account. La credenziale stessa non contiene limiti.

Un attaccante con le credenziali IAM di Leo — limitate al deploy nell'ambiente di sviluppo e alla lettura da un bucket S3 — ha un raggio d'impatto minuscolo. Può fare il deploy in dev. Può leggere alcuni file. Non può toccare la produzione. Non può accedere al database. Non può vedere la fatturazione. Non può avviare istanze GPU.

La storia della violazione raccontata in precedenza aveva un grande raggio d'impatto perché le credenziali dello sviluppatore erano admin. Se quelle stesse credenziali fossero state limitate al loro lavoro effettivo — il deploy in un ambiente specifico — il danno sarebbe stato molto minore. L'attacco sarebbe potuto avvenire comunque. Il risultato sarebbe stato diverso.

Ecco perché il minimo privilegio non è solo una policy. È architettura. Ogni permesso che non concedi è raggio d'impatto che non hai.

**Cosa Succede Quando Sbagli**

Tre scenari, in ordine crescente di gravità:

**Scenario 1**: Un dipendente con accesso admin lascia l'azienda. Nessuno disattiva
il suo account. Tre mesi dopo, ha ancora accesso. Questo accade continuamente.
IAM lo risolve: disabiliti l'utente. Istantaneamente, ovunque.

Questo è il modo più comune in cui IAM fallisce, ed è completamente evitabile. La maggior parte delle organizzazioni ha un processo per revocare l'accesso fisico (restituire il badge, restituire il laptop) ma trascura IAM. La checklist di offboarding che include "disabilita l'utente IAM" e "rimuovi da tutti i gruppi IAM" non è una sfida ingegneristica complessa — è disciplina di processo. I team che lo fanno in modo coerente sono quelli che non scoprono mai cosa succede quando un ex dipendente può ancora accedere al database di produzione.

**Scenario 2**: Il laptop di uno sviluppatore viene compromesso. L'attaccante trova le
credenziali AWS memorizzate in un file di configurazione con permessi admin completi.
Poiché le credenziali hanno accesso ampio, l'attaccante può fare qualsiasi cosa: minare
criptovaluta, rubare dati, eliminare i backup. Con il minimo privilegio: le credenziali
funzionano solo per il loro scope limitato. Il raggio d'impatto è contenuto.

Il pattern delle credenziali in un file di configurazione è più comune di quanto dovrebbe essere. Gli sviluppatori spesso memorizzano le credenziali AWS in `~/.aws/credentials` per lo sviluppo locale — il che va bene. Il problema è quando quelle credenziali hanno accesso a livello di produzione invece di essere limitate a un ambiente sandbox. Le credenziali di sviluppo dovrebbero essere limitate a un ambiente di sviluppo. L'accesso alla produzione dovrebbe richiedere passi espliciti da assumere, non essere presente su ogni laptop in ogni momento.

**Scenario 3**: Un'applicazione mal scritta espone accidentalmente le credenziali AWS nei
suoi log. Se quelle credenziali hanno accesso ampio, hai una violazione catastrofica. Se
hanno accesso ristretto — solo al bucket S3 specifico di cui l'applicazione ha bisogno — l'esposizione
è limitata e contenuta.

Lo scenario delle credenziali dell'applicazione nei log è sottile. Spesso accade quando il codice di debug registra l'intero contesto della richiesta — incluse le intestazioni di autorizzazione — o quando un gestore di errori serializza tutte le variabili d'ambiente (inclusa `AWS_ACCESS_KEY_ID`) in un file di log. La salvaguardia qui è IAM Role per EC2, che elimina completamente le credenziali statiche dall'ambiente dell'applicazione. Se non ci sono credenziali statiche, non possono apparire nei log.

Il pattern: l'accesso dovrebbe essere limitato al minimo. Sempre. Non perché non ti fidi
delle tue persone, ma perché non puoi controllare cosa succede alle credenziali compromesse.

**Se Accesso Ampio Allora Comodità Ma Esposizione**

C'è sempre la tentazione di dare ai team un accesso più ampio del necessario — rende
i deployment più veloci, riduce la frizione, evita i momenti di "Access Denied" che
interrompono il flusso. Se dai a tutti l'accesso admin, allora i deployment sono fluidi
e nessuno viene bloccato — ma quando le credenziali trapelano (e lo fanno), l'attaccante
eredita i pieni diritti admin. Un laptop compromesso diventa una violazione completa
dell'account. Scrivi prima il permesso minimo. Espandi solo quando qualcosa fallisce.
Quella regola salva le aziende.

**Autenticazione Multi-Fattore: Il Secondo Lucchetto**

Anche con il minimo privilegio, le credenziali possono essere rubate. Le password possono
essere indovinate, phishate o trapelate. IAM affronta questo con l'**Autenticazione Multi-Fattore (MFA)**.

L'MFA richiede qualcosa che *conosci* (password) più qualcosa che *hai* (un telefono, una
chiave hardware). Anche se un attaccante ruba la tua password, non può accedere senza
avere anche il tuo telefono.

L'MFA dovrebbe essere abilitata per ogni utente IAM. È non negoziabile per l'account root.

Priya trascorse il pomeriggio a configurarla per tutti. Non andò senza intoppi.

L'app di autenticazione di Leo registrò l'account sbagliato due volte. Dovette scansionare il codice QR tre volte perché l'orologio del suo laptop era leggermente fuori sincronia, il che causava il fallimento dei token basati sul tempo. Al terzo tentativo funzionò.

"C'è un modo per farlo senza l'app?" chiese Leo, guardando il suo telefono.

"Le chiavi hardware," disse Priya. "Un dispositivo fisico che si collega via USB. Più sicuro dell'app. Più costoso."

"Quanto più costoso?"

"Circa 50 dollari a chiave. Ne vorresti due, nel caso tu ne perda una."

Tom scrisse "100 dollari per sviluppatore" sul suo taccuino.

"Le compriamo," disse Priya. "Per l'account root come minimo."

Tom chiese se fosse troppa frizione in generale. Priya tirò fuori di nuovo la storia della violazione.

Tom configurò l'MFA immediatamente.

"E se qualcuno tenta di entrare mentre siamo nel mezzo di questa transizione?" chiese Priya. "Prima che tutti abbiano l'MFA abilitata?"

Nessuno aveva una buona risposta. Lei configurò l'MFA per l'account root per prima, prima di chiunque altro.

**IAM Access Analyzer: Il Secondo Paio di Occhi**

Priya aveva un altro strumento da mostrare al team dopo che la configurazione dell'MFA era completa.

"Questo gira automaticamente," disse, aprendo una nuova scheda della console.

**IAM Access Analyzer** è un servizio che analizza continuamente le tue policy IAM e segnala tutto ciò che concede accesso a risorse al di fuori del tuo account — o al di fuori di ciò che ti aspetteresti.

Trovò qualcosa al primo avvio.

Un bucket S3 — uno che Leo aveva configurato come "temporaneo" tre settimane prima e poi dimenticato — aveva una bucket policy che consentiva l'accesso in lettura pubblico. Il bucket conteneva alcuni file di dati di test, niente di sensibile. Ma conteneva anche una cartella che Leo aveva chiamato `db-backups-staging` e popolato con alcuni file SQL esportati per testare il processo di importazione.

"Ci sono dati sensibili in quei file SQL?" chiese Priya.

Leo guardò il nome della cartella. Poi i file al suo interno. Poi il soffitto.

"Ho esportato il database di staging," disse. "Che ha copie dei dati iniziali dei clienti di produzione."

Priya chiuse lentamente il laptop.

Il bucket fu impostato come privato entro cinque minuti. Access Analyzer continuò a monitorare eventuali policy future che aprissero le risorse inaspettatamente.

"Pensalo come un allarme perimetrale," disse Priya. "Ogni volta che qualcuno lascia accidentalmente una porta aperta, ce lo dice."

Ti starai chiedendo: IAM Access Analyzer sostituisce la revisione manuale delle policy? No. È uno strumento di rilevamento, non di prevenzione. Ti dice dell'accesso che è stato concesso — non può dirti se quell'accesso era intenzionale. La revisione umana di "questa policy era corretta?" deve comunque avvenire. Access Analyzer si assicura solo che le finestre aperte non passino inosservate.

## Punti di Forza e Limitazioni

**IAM è lo strumento giusto per**:

- Controllare chi e cosa può accedere a ogni risorsa AWS
- Implementare il minimo privilegio su utenti, servizi e confini cross-account
- Eliminare la necessità di condividere credenziali a lungo termine tra sistemi
- Ogni azione IAM viene registrata automaticamente, fornendo un audit trail di chi ha fatto cosa e quando (trattato nel Capitolo 14)
- Accesso cross-account: un IAM Role nell'Account A può essere assunto da un principal nell'Account B, consentendo la condivisione controllata di risorse tra account AWS senza condivisione di credenziali

**Dove IAM diventa difficile**: Le policy IAM possono crescere fino a centinaia di statement su decine di ruoli, e fare il debug di un errore "Access Denied" richiede di capire quale di quelle policy è quella effettiva — un compito più difficile di quanto sembri. L'errore IAM più comune non è avere troppo poco accesso — è avere troppo. Le policy eccessivamente permissive create per "farlo semplicemente funzionare" diventano responsabilità di sicurezza dolorose da ridurre a posteriori. Scrivi prima il permesso minimo. Espandi solo quando qualcosa fallisce.

C'è una sfida pratica con IAM su larga scala: lo **sprawl delle policy**. Le organizzazioni che usano AWS da diversi anni spesso hanno decine o centinaia di policy personalizzate, molte delle quali si sovrappongono, alcune delle quali non vengono mai usate, e alcune che si contraddicono l'una con l'altra in modi che nessuno ha notato perché le contraddizioni contano solo per casi limite. AWS fornisce **IAM Access Analyzer** (che abbiamo introdotto in questo capitolo) e strumenti di **simulazione delle policy IAM** per aiutare ad audire e razionalizzare le policy. Ma la strategia più efficace è costruire policy pulite fin dall'inizio e fare audit regolari — piuttosto che lasciare che le policy si accumulino e cercare di districarle in seguito.

Priya impostò una revisione IAM trimestrale: elencare tutti i ruoli e le policy, verificare quali vengono usati attivamente tramite i log di CloudTrail, segnalare le credenziali inutilizzate o le policy eccessivamente ampie per la rimozione o la restrizione. La revisione richiedeva due ore per trimestre e individuò tre problemi di policy nel primo anno.

"Non è un lavoro eccitante," disse. "Ma le revisioni degli accessi sono il modo in cui trovi le cose che sarebbero state catastrofiche se qualcuno le avesse notate prima."

## Riepilogo

La password Admin123 era il sintomo. La malattia era che Nimbus non aveva alcuna strategia di controllo degli accessi — una credenziale root condivisa, nessun ruolo, nessuna policy, nessun audit trail. IAM non si limita a correggere il sintomo; costringe il team a rispondere a una domanda che stava evitando: chi, esattamente, è autorizzato a fare cosa? La risposta a questa domanda è la base di ogni architettura AWS sicura.

- **IAM** (Identity and Access Management) è il modo in cui controlli chi può fare cosa in AWS. I mattoni fondamentali sono: **Utenti**, **Gruppi**, **Ruoli** e **Policy**.
- Per impostazione predefinita, tutto in AWS è **negato**. I permessi devono essere concessi esplicitamente.
- Il **Principio del Minimo Privilegio** significa dare a ogni identità solo l'accesso di cui ha bisogno — minimizzando il **raggio d'impatto** se una credenziale viene mai compromessa.
- L'**account root** può fare qualsiasi cosa, incluse cose catastrofiche. Bloccalo dietro l'MFA e usalo il meno possibile.
- Abilita l'**MFA** per ogni utente IAM. Non negoziabile — nell'esame e in produzione.

## Suggerimenti per l'Esame

*Dominio SAA-C03: 1 — Task 1.1 (accesso sicuro alle risorse AWS)*

- **Tutto è negato per impostazione predefinita.** È richiesta un'esplicita "Allow". Se una
  policy non menziona un'azione, l'azione è negata.
- **Il Deny esplicito vince sempre.** Se qualsiasi policy nella catena nega un'azione, quel
  deny non può essere sovrascritto da un Allow in nessun altro punto della catena. Questo
  coglie di sorpresa molti candidati.
- **Account root ≠ admin IAM.** L'account root è una credenziale separata dall'IAM.
  Non puoi eliminare l'account root. *Puoi* (e dovresti) limitare quando viene usato.
- **IAM è globale**, non regionale. Gli utenti, i gruppi, i ruoli e le policy IAM esistono
  nell'intero account AWS, non per Regione.
- **I Ruoli sono il modo preferito per concedere accesso ai servizi AWS.** Se un'istanza
  EC2 ha bisogno di accedere a S3, alleghi un IAM Role all'istanza — non memorizzi le
  credenziali sulla macchina. Questo pattern appare continuamente nell'esame.
- **IAM Access Analyzer** genera findings quando le risorse sono accessibili dall'esterno dell'account o dall'esterno dell'organizzazione. Quando uno scenario d'esame menziona il rilevamento di accesso esterno non intenzionale a S3 o KMS, Access Analyzer è la risposta.
- **L'MFA per l'account root è obbligatoria**, non facoltativa, nel contesto delle best practice di sicurezza AWS. Le domande d'esame sulla protezione dell'account root includono sempre l'MFA come parte della risposta corretta.
- I **permission boundary** sono una funzionalità IAM avanzata (trattata nel Capitolo 14) che limita i permessi massimi che un utente o un ruolo IAM può avere, anche se le loro policy ne concedono di più. Le domande d'esame su "prevenzione dell'escalation dei privilegi" o "impostazione di un tetto massimo di permessi" puntano ai permission boundary.
- Le **Service Control Policy (SCP)** sono policy a livello organizzativo che limitano ciò che può essere fatto negli account member di un'organizzazione AWS. Operano al di sopra del livello IAM — anche un amministratore di account non può superare i limiti impostati da una SCP. Quando uno scenario d'esame riguarda la governance della sicurezza multi-account, pensa alle SCP.
- **CloudTrail** registra tutte le chiamate API IAM. Quando uno scenario d'esame chiede "come verificheresti quali utenti hanno apportato modifiche alle policy IAM," la risposta è CloudTrail. Ogni azione IAM — creare un utente, modificare una policy, assumere un ruolo — viene registrata. Lo storico degli eventi di 90 giorni è automatico e gratuito; per la conservazione a lungo termine e gli avvisi, devi creare un Trail che consegna i log a un bucket S3.

## Esercizi

**Esercizio 1 — Ricordo**

Con parole tue: qual è la differenza tra un IAM User, un Gruppo e un Ruolo?
Quando useresti ciascuno?

*(Suggerimento: Pensa all'analogia dell'edificio con i badge — quale è un badge permanente,
quale è un raggruppamento dipartimentale, e quale è un badge per visitatori?)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: Un'azienda gestisce un'applicazione web su istanze EC2 che devono leggere file
da un bucket S3. Un junior developer suggerisce di memorizzare le chiavi di accesso AWS
direttamente nel codice dell'applicazione sulle istanze EC2. Il team di sicurezza si oppone.

Qual è la soluzione PIU' sicura e operativamente appropriata?

A) Memorizzare le chiavi di accesso nelle variabili d'ambiente sull'istanza EC2 invece che
   nel codice
B) Creare un utente IAM dedicato con permessi di lettura S3 e condividere le credenziali
   con il team di sviluppo
C) Allegare un IAM Role con i permessi appropriati di lettura S3 direttamente alle istanze
   EC2
D) Usare le credenziali dell'account root per dare all'applicazione accesso completo a tutte
   le risorse AWS

**Suggerimento 1**: Il problema con il memorizzare le credenziali ovunque sull'istanza è
che le credenziali possono trapelare. C'è un modo per dare all'istanza EC2 accesso senza
usare credenziali?

**Suggerimento 2**: AWS ha un meccanismo per cui ai servizi possono essere concessi permessi
senza aver bisogno di credenziali statiche. Come si chiama quel meccanismo?

**Suggerimento 3**: I IAM Role possono essere allegati alle istanze EC2. Quando lo sono,
l'istanza riceve automaticamente credenziali temporanee che vengono ruotate da AWS. Non
sono necessarie credenziali statiche.

**Risposta**: C

**Spiegazione**: Allegare un IAM Role a un'istanza EC2 è il pattern corretto.
L'istanza riceve automaticamente credenziali temporanee e rotanti attraverso il
servizio di metadati EC2. Non ci sono credenziali a lungo termine da far trapelare,
ruotare o accidentalmente committare in un repository.

**Perché non A?** Le variabili d'ambiente su un'istanza EC2 possono ancora trapelare —
attraverso i log dell'applicazione, endpoint di debug, o se l'istanza è compromessa.
Le credenziali statiche sono il problema, non la loro posizione.

**Perché non B?** Creare un utente IAM condiviso e distribuire le credenziali a un team
viola il minimo privilegio e rende la rotazione delle credenziali un incubo. Se una persona
lascia, non puoi facilmente revocare solo il suo accesso senza cambiare le credenziali
condivise.

**Perché non D?** Usare le credenziali dell'account root per qualsiasi applicazione è una
grave violazione della sicurezza. L'account root ha accesso illimitato e le sue credenziali
non dovrebbero mai lasciare il controllo del proprietario dell'account.

*Dominio SAA-C03: 1 — Task 1.1 (IAM role, minimo privilegio)*

**Esercizio 3 — Sfida di Architettura** *(Opzionale)*

Nimbus sta assumendo tre nuovi sviluppatori il mese prossimo. Ognuno avrà bisogno di
diversi livelli di accesso: uno lavora sul layer del database, uno sui server applicativi,
uno sui file statici del front-end. C'è anche una pipeline CI/CD che deve fare il deploy
del codice.

Progetta una struttura IAM per questo scenario. Quali utenti, gruppi, ruoli e policy
creeresti? Quale sarebbe il confine del minimo privilegio più importante da applicare?

*(Non esiste una risposta unica corretta. Pensa a minimizzare il raggio d'impatto se una
qualsiasi identità viene compromessa.)*

## Scena Post-Crediti

Alla fine della giornata, ogni utente IAM aveva l'MFA abilitata. L'account di Leo era stato
ridotto all'accesso a livello di sviluppatore: fare il deploy nell'ambiente dev, leggere dal
bucket di configurazione condiviso, nient'altro.

Aveva provato, una volta, ad accedere al database di produzione.

Access denied.

"È questo che si prova a essere fidati ma non troppo?" chiese.

"È esattamente quello che si prova," disse Priya.

La mattina dopo, Tom arrivò presto e trovò qualcosa che lo fece immediatamente chiamare
il team.

Nella console AWS, poteva vedere che il loro sito web stava ricevendo traffico. Più di
quanto si aspettassero. E il server web — il primo di Leo — stava girando al massimo. Davvero al massimo.

"Abbiamo cento utenti simultanei," disse Tom. "E un solo server."

Nel prossimo capitolo: il primo server — noleggiare un computer nel data center di qualcun altro.
