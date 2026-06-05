# Capitolo 3: Chi Sei, Esattamente?

Leo premette deploy.

Il terminale restituì due parole: Accesso Negato.

Riprovò. Stesso risultato. Lavorava per Nimbus da tre settimane, aveva ricevuto l'accesso all'account AWS il primo giorno e stava distribuendo nell'ambiente di staging senza problemi. Ma questa era la produzione. E la produzione, apparentemente, era diversa.

Maya guardò oltre la sua spalla il messaggio di errore. "Chi ti ha dato quel permesso?"

Leo si girò. "Quale permesso?"

"Il permesso di distribuire in produzione. Chi lo ha configurato?"

Leo aprì la console AWS e iniziò a fare clic sui menu. Nessuno lo aveva fatto. Non c'era nessuna policy, nessun ruolo, nessuna concessione esplicita. Non c'era nemmeno un rifiuto esplicito — solo un'assenza. Nessuno a Nimbus si era mai seduto a pensare a chi poteva fare cosa.

Questo era il problema.

**Il Problema con le Password**

Le password sono un modello sbagliato per i sistemi informatici.

Non perché siano sempre deboli. Perché sono binarie: o hai la password o non la hai. Se la hai, puoi fare qualsiasi cosa l'account è autorizzato a fare.

Va bene per un singolo utente sul proprio laptop personale. È catastrofico per l'infrastruttura cloud di un'azienda.

Considera cosa Nimbus deve gestire: il server web, il database, l'archiviazione dei file, il networking, gli avvisi di fatturazione, gli account utente. Se tutto è protetto da una password — o anche da un insieme di credenziali — allora chiunque ottenga quella password ottiene tutto.

E "tutto" su AWS significa la capacità di eliminare database. Avviare server che generano una fattura di 50.000 dollari. Esfiltrare ogni record cliente. Distruggere i dati di backup.

Priya non descrisse questo in termini calmi e astratti. Lo descrisse come la storia di una startup che aveva subito una violazione, ricevuto una fattura AWS di 80.000 dollari in 24 ore da attaccanti che minassero criptovaluta sul loro account, e chiuso tre mesi dopo.

La stanza fu silenziosa.

"Quindi qual è l'alternativa?" chiese Tom.

**Il Concetto: Identity and Access Management**

L'alternativa è un sistema in cui non dai a tutti la stessa chiave. Dai a ogni persona — e a ogni servizio — esattamente l'accesso di cui ha bisogno. Non di più, non di meno.

In AWS, questo sistema si chiama **IAM**: Identity and Access Management.

Pensa a IAM come al sistema di badge in un grande edificio per uffici.

L'edificio ha decine di piani. La sala server è al piano 12. L'ufficio finanziario è all'8. La suite del CEO è al piano 20. Ogni dipendente ha un badge, ma ogni badge apre solo le porte che quel dipendente deve aprire per il suo lavoro. Il tirocinante non può accedere alla sala server. Il contabile non può accedere al piano esecutivo fuori orario.

IAM funziona allo stesso modo. Definisci chi esiste (identità), cosa è autorizzato a fare (permessi), e applichi quei permessi attraverso le policy.

**I Mattoni di IAM**

IAM ha quattro concetti fondamentali. Si basano l'uno sull'altro.

**Gli Utenti** sono identità individuali. Maya ha un utente IAM. Tom ha un utente IAM. Ogni utente ha le proprie credenziali — e dovrebbe avere solo i permessi di cui ha specificamente bisogno.

**I Gruppi** sono raccolte di utenti. Invece di impostare i permessi per Maya, Tom, Priya e Leo individualmente, crei un gruppo "Sviluppatori" con permessi da sviluppatore e li aggiungi. Quando si unisce una quinta persona, la aggiungi al gruppo ed essa eredita immediatamente i permessi corretti.

**I Ruoli** sono identità temporanee che possono essere *assunte* da qualcosa — una persona, un servizio, o un altro account AWS. Approfondiamo i Ruoli nel Capitolo 14. Per ora: se un Utente è un dipendente permanente, un Ruolo è un badge per visitatori. Concede accesso specifico per un tempo o scopo specifico.

**Le Policy** sono le regole effettive di permesso. Una policy è un documento (scritto in JSON internamente, ma non hai bisogno di memorizzare il formato) che dice: "Il titolare di questa policy è AUTORIZZATO a eseguire l'azione X sulla risorsa Y." O "NEGATO l'azione Z."

Il modello di valutazione IAM è: per impostazione predefinita, tutto è negato. I permessi devono essere concessi esplicitamente. Se una policy non dice che puoi fare qualcosa, non puoi.

**Il Principio del Minimo Privilegio**

Questo è il concetto più importante in tutta la sicurezza, non solo IAM.

**Dai alle persone e ai sistemi solo l'accesso di cui hanno bisogno per fare il loro lavoro. Niente di più.**

Priya chiamò questo "il principio del minimo privilegio." Sembra ovvio. In pratica, la maggior parte dei team lo viola continuamente — non per malizia, ma per comodità.

"Possiamo semplicemente dare a Leo l'accesso admin così può distribuire le cose più velocemente?"

No.

"Possiamo semplicemente usare l'account root per tutto?"

Assolutamente no.

L'account root è la chiave master dell'intero tuo account AWS. Può fare qualsiasi cosa, incluso chiudere l'account stesso. Dovresti crearlo una volta, impostare l'autenticazione multi-fattore, e poi non usarlo mai più per il lavoro quotidiano.

Priya quel pomeriggio creò utenti IAM separati per tutti. Diede a Leo i permessi per distribuire nell'ambiente di sviluppo. Non in produzione. Non nella fatturazione. Non nel networking. Solo nella distribuzione.

"Sembra restrittivo," disse Leo.

"Così sai che è giusto," rispose Priya.

**Cosa Succede Quando Sbagli**

Tre scenari, in ordine crescente di gravità:

**Scenario 1**: Un dipendente con accesso admin lascia l'azienda. Nessuno disattiva il suo account. Tre mesi dopo, ha ancora accesso. Questo accade continuamente. IAM lo risolve: disabiliti l'utente. Istantaneamente, ovunque.

**Scenario 2**: Il laptop di uno sviluppatore viene compromesso. L'attaccante trova le credenziali AWS archiviate in un file di configurazione con permessi admin completi. Poiché le credenziali hanno accesso ampio, l'attaccante può fare qualsiasi cosa: minare criptovaluta, rubare dati, eliminare i backup. Con il minimo privilegio: le credenziali funzionano solo per il loro scope limitato. Il raggio d'impatto è contenuto.

**Scenario 3**: Un'applicazione mal scritta espone accidentalmente le credenziali AWS nei suoi log. Se quelle credenziali hanno accesso ampio, hai una violazione catastrofica. Se hanno accesso ristretto — solo al bucket S3 specifico di cui l'applicazione ha bisogno — l'esposizione è limitata e contenuta.

Il pattern: l'accesso dovrebbe essere limitato al minimo. Sempre. Non perché non ti fidi delle tue persone, ma perché non puoi controllare cosa succede alle credenziali compromesse.

**Autenticazione Multi-Fattore: Il Secondo Lucchetto**

Un altro concetto prima di chiudere il capitolo.

Anche con il minimo privilegio, le credenziali possono essere rubate. Le password possono essere indovinate, phishate o trapelate. IAM affronta questo con l'**Autenticazione Multi-Fattore (MFA)**.

L'MFA richiede qualcosa che *conosci* (password) più qualcosa che *hai* (un telefono, una chiave hardware). Anche se un attaccante ruba la tua password, non può accedere senza avere anche il tuo telefono.

L'MFA dovrebbe essere abilitata per ogni utente IAM. È non negoziabile per l'account root.

Priya trascorse il pomeriggio a configurarla per tutti.

Tom chiese se fosse troppa frizione. Priya tirò fuori di nuovo la storia della violazione.

Tom configurò subito l'MFA.

## Punti di Forza e Limitazioni

**IAM è lo strumento giusto per**: controllare chi e cosa può accedere a ogni risorsa AWS; implementare il minimo privilegio su utenti, servizi e confini cross-account; generare un audit trail di ogni chiamata API attraverso l'integrazione con CloudTrail; eliminare la necessità di condividere credenziali a lungo termine tra sistemi.

**Dove IAM diventa difficile**: Le policy IAM possono crescere fino a centinaia di statement su decine di ruoli, e fare il debug di un errore "Access Denied" richiede di capire quale di quelle policy è quella effettiva — un compito più difficile di quanto sembri. L'errore IAM più comune non è avere troppo poco accesso — è avere troppo. Le policy eccessivamente permissive create per "farlo semplicemente funzionare" diventano responsabilità di sicurezza dolorose da ripristinare dopo il fatto. Scrivi il permesso minimo per primo. Espandi solo quando qualcosa fallisce.

## Riepilogo

- **IAM** (Identity and Access Management) è il modo in cui controlli chi può fare cosa in AWS.
- I mattoni fondamentali sono: **Utenti** (individui), **Gruppi** (raccolte di utenti), **Ruoli** (identità temporanee) e **Policy** (regole di permesso).
- Per impostazione predefinita, tutto in AWS è **negato**. I permessi devono essere concessi esplicitamente.
- Il **Principio del Minimo Privilegio** significa dare a ogni identità solo l'accesso di cui ha bisogno. Niente di più.
- L'**account root** può fare qualsiasi cosa, incluse cose catastrofiche. Bloccalo dietro l'MFA e usalo il meno possibile.
- Abilita l'**MFA** per ogni utente IAM. Non negoziabile.

## Consigli per l'Esame

*Dominio SAA-C03 1 — Task 1.1 (accesso sicuro alle risorse AWS)*

- **Tutto è negato per impostazione predefinita.** È richiesta un'esplicita "Allow". Se una policy non menziona un'azione, l'azione è negata.
- **Il Deny esplicito vince sempre.** Se qualsiasi policy nella catena nega un'azione, quel deny non può essere sovrascritto da un Allow in nessun altro posto nella catena. Questo coglie di sorpresa molti candidati.
- **Account root ≠ admin IAM.** L'account root è una credenziale separata dall'IAM. Non puoi eliminare l'account root. *Puoi* (e dovresti) limitare quando viene usato.
- **IAM è globale**, non regionale. Gli utenti, i gruppi, i ruoli e le policy IAM esistono nell'intero account AWS, non per Regione.
- **I Ruoli sono il modo preferito per concedere accesso ai servizi AWS.** Se un'istanza EC2 ha bisogno di accedere a S3, alleghi un IAM Role all'istanza — non archivi le credenziali sulla macchina. Questo pattern appare continuamente nell'esame.

## Esercizi

**Esercizio 1 — Ricorda**

Con parole tue: qual è la differenza tra un IAM User, un Gruppo e un Ruolo? Quando useresti ciascuno?

*(Suggerimento: Pensa all'analogia dell'edificio con i badge — quale è un badge permanente, quale è un raggruppamento dipartimentale, e quale è un badge per visitatori?)*

**Esercizio 2 — Pratica per l'Esame**

*Scenario*: Un'azienda gestisce un'applicazione web su istanze EC2 che devono leggere file da un bucket S3. Un junior developer suggerisce di archiviare le chiavi di accesso AWS direttamente nel codice dell'applicazione sulle istanze EC2. Il team di sicurezza si oppone.

Qual è la soluzione PIÙ sicura e operativamente appropriata?

A) Archiviare le chiavi di accesso nelle variabili d'ambiente sull'istanza EC2 invece che nel codice  
B) Creare un utente IAM dedicato con permessi di lettura S3 e condividere le credenziali con il team di sviluppo  
C) Allegare un IAM Role con i permessi appropriati di lettura S3 direttamente alle istanze EC2  
D) Usare le credenziali dell'account root per dare all'applicazione accesso completo a tutte le risorse AWS

**Suggerimento 1**: Il problema con l'archiviare le credenziali ovunque sull'istanza è che le credenziali possono trapelare. C'è un modo per dare all'istanza EC2 accesso senza usare credenziali?

**Suggerimento 2**: AWS ha un meccanismo per cui ai servizi possono essere concessi permessi senza aver bisogno di credenziali statiche. Come si chiama quel meccanismo?

**Suggerimento 3**: I IAM Role possono essere allegati alle istanze EC2. Quando lo sono, l'istanza riceve automaticamente credenziali temporanee che vengono ruotate da AWS. Non sono necessarie credenziali statiche.

**Risposta**: C

**Spiegazione**: Allegare un IAM Role a un'istanza EC2 è il pattern corretto. L'istanza riceve automaticamente credenziali temporanee e rotanti attraverso il servizio di metadati EC2. Non ci sono credenziali a lungo termine da far trapelare, ruotare o accidentalmente committare in un repository.

**Perché non A?** Le variabili d'ambiente su un'istanza EC2 possono ancora trapelare — attraverso i log dell'applicazione, endpoint di debug, o se l'istanza è compromessa. Le credenziali statiche sono il problema, non la loro posizione.

**Perché non B?** Creare un utente IAM condiviso e distribuire le credenziali a un team viola il minimo privilegio e rende la rotazione delle credenziali un incubo. Se una persona lascia, non puoi facilmente revocare solo il suo accesso senza cambiare le credenziali condivise.

**Perché non D?** Usare le credenziali dell'account root per qualsiasi applicazione è una grave violazione della sicurezza. L'account root ha accesso illimitato e le sue credenziali non dovrebbero mai lasciare il controllo del proprietario dell'account.

*Dominio SAA-C03 1 — Task 1.1 (IAM roles, minimo privilegio)*

**Esercizio 3 — Sfida Architetturale** *(Facoltativo)*

Nimbus sta assumendo tre nuovi sviluppatori il mese prossimo. Ognuno avrà bisogno di diversi livelli di accesso: uno lavora sul layer del database, uno sui server applicativi, uno sui file statici del front-end. C'è anche una pipeline CI/CD che deve distribuire il codice.

Progetta una struttura IAM per questo scenario. Quali utenti, gruppi, ruoli e policy creeresti? Quale sarebbe il confine di minimo privilegio più importante da applicare?

*(Non esiste una risposta unica corretta. Pensa a minimizzare il raggio d'impatto se un'identità è compromessa.)*

## Scena Post-Crediti

Alla fine della giornata, ogni utente IAM aveva l'MFA abilitata. L'account di Leo era stato ridotto all'accesso a livello di sviluppatore: distribuire nell'ambiente dev, leggere dal bucket di configurazione condiviso, nient'altro.

Aveva provato, una volta, ad accedere al database di produzione.

Accesso negato.

"È questo che si prova a essere fidati ma non troppo?" chiese.

"È esattamente quello che si prova," disse Priya.

La mattina dopo, Tom arrivò presto e trovò qualcosa che lo fece immediatamente chiamare il team.

Nella console AWS, poteva vedere che il loro sito web stava ricevendo traffico. Più di quanto si aspettassero. E il server web — il primo di Leo — stava girando al massimo. Davvero al massimo.

"Abbiamo cento utenti simultanei," disse Tom. "E un solo server."

Nel prossimo capitolo: il primo server — noleggiare un computer nel data center di qualcun altro.
