# Capitolo 14: Chi Ha il Diritto di Fare Cosa

Tom aveva le chiavi di accesso aperte in un file di testo, pronto per incollarle.

"Cosa stai facendo?" chiese Priya.

"L'istanza EC2 deve leggere i file di configurazione da S3. Sto inserendo le credenziali nella configurazione del server."

Guardò lo schermo per un momento. "Chiudi quel file."

"Stavo giusto—"

"Se qualcuno riesce ad accedere a quel server," disse, "otterrà quelle chiavi. E quelle chiavi toccheranno qualsiasi risorsa a cui è consentito accedere all'utente IAM. Il che probabilmente è più di S3."

Tom chiuse il file.

"C'è un modo migliore," disse. "Il server stesso può avere un ruolo. Pensalo come un titolo di lavoro: l'istanza non ha bisogno di credenziali perché il sistema già sa cosa è e cosa gli è permesso fare."

Tom sembrava scettico. "Quindi il server si autentica da solo?"

"Sì. Senza password. Senza chiavi in un file di configurazione. Senza nulla che possa essere accidentalmente commesso in git."

Quella frase ebbe un impatto. Tom aveva trovato una password di database nella cronologia di git due settimane prima. Aprì una nuova scheda del browser.

**Riconsiderando IAM: Il Quadro Completo**

Il Capitolo 3 introdusse IAM: utenti, gruppi, ruoli e policy. Ora è il momento di approfondire.

Le policy IAM sono documenti JSON che specificano quali azioni sono consentite o negate su quali risorse. Appaiono così:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::nimbus-assets/*"
    }
  ]
}
```

Questa policy consente la lettura e la scrittura di oggetti nel bucket `nimbus-assets`, e niente altro. Non elimina. Non elenca i bucket. Non esegue alcuna altra operazione S3. Non esegue alcuna altra operazione AWS.

Questo è il modo corretto per concedere i permessi: azioni specifiche, risorse specifiche.

**Il Problema dell'Accesso Amministrativo**

Le policy gestite da AWS come `AdministratorAccess` sono progettate per iniziare rapidamente. Non sono progettate per eseguire sistemi di produzione con veri membri del team.

`AdministratorAccess` concede ogni azione su ogni risorsa. Se un membro del team con questa policy commette un errore – ad esempio, elimina accidentalmente un bucket S3, termina un'istanza EC2 sbagliata, modifica le regole del gruppo di sicurezza – AWS non può fermarlo. Il permesso è stato concesso.

Se le credenziali di un membro del team vengono compromesse (attacco di phishing, chiave di accesso trapelata, furto del laptop), l'attaccante ha accesso amministrativo a tutto nel tuo account AWS.

"Quindi cosa avrebbe dovuto avere Soo-Jin?" chiese Leo.

"Cosa deve fare Soo-Jin?" rispose Priya.

"Distribuire l'API. Controllare i log. Niente altro."

"Allora può assegnare oggetti alla pipeline di codice, leggere i log di CloudWatch, e niente altro."

"Questo... è molto specifico."

"Sì, è il punto."

**Ruoli IAM: Identità per i Servizi**

Il Capitolo 3 ha introdotto i ruoli come modo per le istanze EC2 di accedere ai servizi AWS senza memorizzare le credenziali. Cerchiamo di renderlo più concreto.

Le istanze EC2 che eseguono l'API Nimbus devono:

- Leggere da DynamoDB (il menu)
- Scrivere in DynamoDB (ordini)
- Mettere oggetti in S3 (ricezioni, caricamenti)
- Scrivere i log in CloudWatch
- Leggere i segreti da Secrets Manager

Invece di creare un utente con una chiave di accesso e memorizzare quella chiave sull'istanza EC2 (un incubo di sicurezza – le chiavi di accesso possono essere lette da chiunque abbia accesso SSH), crei un **ruolo IAM** per l'istanza EC2 con esattamente queste autorizzazioni.

L'istanza EC2 assume il ruolo automaticamente. AWS fornisce credenziali temporanee tramite il servizio di metadati dell'istanza. Le credenziali ruotano automaticamente. Nessuna chiave di accesso da compromettere.

"E se qualcuno hackerasse l'istanza EC2?" chiese Leo.

"Può fare ciò che il ruolo EC2 consente, disse Priya. "Che è leggere il menu, scrivere ordini e inviare log. Non può eliminare il bucket S3. Non può terminare le istanze EC2. Non può toccare IAM."

"Perché il ruolo EC2 non ha queste autorizzazioni."

"Esattamente."

**Assunzione del Ruolo: Come i Servizi Diventano Altri Servizi**

I ruoli possono essere assunti da:

- **Servizi AWS** (EC2, Lambda, attività ECS, ecc.)
- **Utenti IAM** nel tuo account (elevazione del ruolo – assumi un ruolo con più permessi per un compito specifico)
- **Utenti IAM in altri account AWS** (accesso cross-account – un'altra organizzazione può assumere un ruolo nel tuo)
- **Fornitori di identità esterni** (Google, Active Directory, Okta – accesso federato per gli utenti umani)

Questo ultimo modello – **federazione dell'identità** – è come le grandi organizzazioni danno ai propri dipendenti l'accesso a AWS senza creare singoli utenti IAM per ogni persona. Il tuo Active Directory ha le tue credenziali. Quando ti logghi in AWS, ti autentichi contro Active Directory e AWS concede un ruolo.

**Confini di Permesso: Limitare Ciò che i Ruoli Possono Concedere**

Ecco un problema sottile ma importante: per impostazione predefinita, IAM non impedisce a un utente di concedere permessi che non ha attualmente.

Se Soo-Jin ha `iam:CreatePolicy` e `iam:AttachUserPolicy`, potrebbe creare una policy che concede l'accesso in scrittura a S3 e allegarla a se stessa – anche se le sue policy esistenti consentono solo la lettura di S3. Questa classe di vulnerabilità è chiamata "escalation di privilegi", ed è proprio il motivo per cui esistono i confini di permesso.

Ma cosa succede se vuoi delegare la creazione di policy IAM a un responsabile del team, assicurandoti al contempo che non possa concedere più di quanto previsto?

**Confini di Permesso** impostano i permessi massimi che possono essere concessi a un'identità. Anche se l'identità ha policy allegate più ampie, i permessi effettivi sono limitati dal confine di permesso.

Ad esempio, concedi a un responsabile del team una policy che consente loro di creare ruoli IAM. Ma attacchi un confine di permesso che dice "i ruoli creati da questo responsabile del team non possono mai avere accesso in scrittura a S3". Anche se il responsabile del team crea un ruolo con accesso completo a S3, il confine impedisce che l'accesso in scrittura abbia effetto.

Questo è un concetto avanzato, ma compare nell'esame e riflette come le organizzazioni gestiscono la gestione IAM su larga scala.

**IAM Access Analyzer: Audit dei Permessi**

Priya ha trascorso due giorni a rivedere la configurazione IAM del team. Ha trovato:

- L'utente personale di Leo aveva accesso amministrativo (come scoperto)
- Una vecchia funzione Lambda aveva permessi per leggere tutti i bucket S3 (un residuo di un test)
- Un ruolo di servizio aveva accesso in scrittura alle tabelle DynamoDB che non esistevano più

Questo è normale. Le configurazioni IAM accumulano spazzatura nel tempo.

**Analizzatore di Accesso IAM** è un servizio AWS che identifica automaticamente le risorse (bucket S3, ruoli IAM, chiavi KMS, funzioni Lambda) condivise con entità esterne. Identifica anche le politiche eccessivamente permissive.

Gli audit IAM regolari dovrebbero far parte delle tue operazioni. I permessi crescono; raramente si riducono organicamente. L'Analizzatore di Accesso aiuta a rendere visibile l'invisibile.

**Le Politiche di Controllo dei Servizi: Barriere di Sicurezza a Livello Organizzativo**

Se il tuo ambiente AWS si espande in più account (un modello comune per grandi team – account di sviluppo, account di staging, account di produzione), **AWS Organizations** ti consente di gestirli da un account centrale.

All'interno delle Organizzazioni, **Le Politiche di Controllo dei Servizi (SCP)** applicano barriere di sicurezza che influenzano *ogni* entità IAM nell'account, inclusi gli amministratori.

Esempio SCP: "Nessuno nell'account di sviluppo può creare istanze EC2 nella regione eu-west-1."

Anche se qualcuno ha accesso amministrativo nell'account di sviluppo, non può violare questa SCP. È applicata a livello di organizzazione, al di sopra del livello dell'account.

Le SCP non concedono permessi – li restringono. Definiscono i permessi massimi che qualsiasi entità IAM in un account può mai avere.

## Punti di Forza e Limitazioni

**Perché i ruoli IAM e il principio del minimo privilegio contano:**

- Limita il raggio d'azione quando le credenziali vengono compromesse
- Richiede agli attaccanti di scalare attraverso più sistemi piuttosto che ottenere un accesso completo immediatamente
- Fornisce una traccia di audit – CloudTrail registra quale ruolo ha fatto cosa
- Forza decisioni consapevoli sull'accesso – "di cosa ha realmente bisogno questo servizio?"

**Dove le cose si complicano:**

- Scrivere politiche IAM precise richiede la comprensione del modello azione/risorsa di AWS per ogni servizio (e ogni servizio ha decine di azioni)
- Politiche eccessivamente restrittive interrompono le applicazioni – il debug degli errori "accesso negato" su più servizi è dispendioso in termini di tempo
- IAM propaga le modifiche con un leggero ritardo (di solito secondi, a volte di più) – può causare problemi di tempistica confusi
- Gli accessi cross-account richiedono una configurazione accurata delle policy di fiducia

## Riepilogo

- Evita l'**accesso amministrativo** in produzione – è per la configurazione, non per le operazioni.
- Le politiche IAM specificano **Effetto**, **Azione** e **Risorsa** – sii specifico su tutti e tre.
- Allega le politiche a **gruppi** (per gli umani) e **ruoli** (per i servizi).
- Le istanze EC2, le funzioni Lambda e altri servizi AWS dovrebbero utilizzare **ruoli IAM**, non le chiavi di accesso.
- I **confini di permesso** limitano i permessi massimi che qualsiasi identità può avere, indipendentemente dalle politiche allegate.
- Le **SCP** (Politiche di Controllo dei Servizi) applicano restrizioni a livello di organizzazione che nemmeno gli amministratori possono annullare.
- **Analizzatore di Accesso IAM** identifica le politiche eccessivamente permissive e l'accesso esterno alle risorse.

## Suggerimenti per l'Esame

*SAA-C03 Dominio: Progettazione di Architetture Sicure (Dominio 1, Task 1.1)*

- **Ruoli IAM per EC2**: La risposta canonica quando EC2 ha bisogno di accedere a S3, DynamoDB, Secrets Manager o qualsiasi servizio AWS. Non memorizzare mai le chiavi di accesso su un'istanza.
- **Logica di valutazione delle policy**: Quando IAM valuta una richiesta, utilizza una gerarchia esplicita di consentire/negare. Un **Negare** esplicito ha sempre la precedenza, anche contro un Consentire esplicito. Il valore predefinito è Negare.
- **Confini di permesso**: Vengono utilizzati quando si delega l'amministrazione IAM. Scenario d'esame: "consenti agli sviluppatori di creare ruoli per le loro funzioni Lambda, ma impedisci loro di concedere permessi oltre ciò che hanno" → Confini di permesso.
- Le **SCP non concedono permessi**: Li restringono solo. Se una SCP consente S3 ma una politica IAM la nega, S3 è negata. Se una SCP nega S3 ma una politica IAM la consente, S3 è negata.
- **Politiche basate sulle risorse**: Alcuni servizi AWS (S3, SQS, Lambda) hanno politiche basate sulle risorse – permessi allegati alla risorsa, non all'identità. Queste funzionano insieme alle politiche IAM.
- **Accesso cross-account**: Ruolo IAM in Account A con una policy di fiducia che consente ad Account B di assumere il ruolo. L'utente/ruolo di Account B quindi utilizza `sts:AssumeRole` per ottenere credenziali temporanee in Account A.
- **Utenti IAM vs Accesso Federato**: Per grandi organizzazioni, l'accesso federato (tramite IAM Identity Center o federazione diretta con un IdP) è preferito rispetto agli utenti IAM individuali.

## Esercizi

**Esercizio 1 — Ricordo**

Spiega la differenza tra una politica IAM allegata a un utente e un ruolo IAM assunto da un'istanza EC2. Quando lo useresti?

*(Suggerimento: Pensa alle credenziali – dove vivono e chi le gestisce?)*

**Esercizio 2 — Esercitazione per l'Esame**

*Scenario*: Una funzione Lambda ha bisogno di leggere da un bucket S3 e scrivere in una tabella DynamoDB. Un sviluppatore ha fornito alla funzione Lambda un ruolo con `AdministratorAccess` per semplicità durante lo sviluppo. Prima di passare alla produzione, il team di sicurezza vuole seguire il principio del minimo privilegio.

Quale delle seguenti è l'approccio MIGLIORE?

A) Crea un nuovo utente IAM con permessi di lettura di S3 e scrittura di DynamoDB; genera una chiave di accesso; memorizza la chiave nelle variabili d'ambiente di Lambda.
B) Attacca una policy inline alla funzione Lambda's ruolo di esecuzione concedendo `s3:GetObject` sul bucket specifico e `dynamodb:PutItem` sulla tabella specifica.
C) Mantieni `AdministratorAccess` ma aggiungi un SCP che blocca tutte le azioni tranne S3 e DynamoDB.
D) Crea un gruppo IAM con permessi di lettura di S3 e scrittura di DynamoDB e aggiungi la funzione Lambda al gruppo

**Suggerimento 1**: Le funzioni Lambda utilizzano ruoli di esecuzione, non chiavi di accesso. Quale opzione rispetta questo?

**Suggerimento 2**: Il principio del minimo privilegio significa azioni specifiche su risorse specifiche, non politiche ampie.

**Suggerimento 3**: I gruppi IAM contengono utenti, non funzioni Lambda.

**Risposta**: B

**Spiegazione**: Il ruolo di esecuzione della Lambda dovrebbe avere solo i permessi specifici di cui il programma ha bisogno. Le policy inline scoperte per azioni specifiche (`s3:GetObject`) e risorse specifiche (l'ARN del bucket, l'ARN della tabella DynamoDB) è l'implementazione a minimo privilegio.

**Perché non A?** Memorizzare le chiavi di accesso nelle variabili d'ambiente di Lambda è un antipattern di sicurezza: le chiavi possono essere lette da chiunque abbia accesso alla console Lambda o tramite il contesto di esecuzione. Le funzioni Lambda utilizzano ruoli di esecuzione con credenziali temporanee da IAM.

**Perché non C?** Gli SCP si applicano a livello di Organizzazione/account e non funzionano come controlli di autorizzazione per funzione. AdministratorAccess con un SCP è lo strato sbagliato.

**Perché non D?** Le funzioni Lambda non possono essere aggiunte a gruppi IAM. I gruppi sono destinati solo agli utenti IAM.

*SAA-C03 Domain: Design Secure Architectures — Task 1.1*

**Esercizio 3 — Sfida Architetturale** *(Opzionale)*

Nimbus ha raggiunto tre team: il team API principale, il team del portale per i partner ristorativi e il team di analisi. Ogni team ha cinque sviluppatori e distribuisce in un account AWS condiviso.

Progetta una struttura IAM che:

- Consenta a ciascun team di accedere solo ai propri servizi
- Impedisca al team di analisi di scrivere in database di produzione
- Consenta a un responsabile di team in ogni team di creare ruoli IAM per i propri servizi, ma non di ampliare le proprie autorizzazioni
- Fornisca un gruppo amministratore per il team di piattaforma che possa gestire tutti i servizi

Quali costrutti IAM utilizzeresti? Dove si applicherebbero i confini di autorizzazione?

*(Non esiste una risposta corretta univoca. L'obiettivo è esercitarsi nella progettazione IAM multi-team.)*

## Scena Post-Crediti

Leo ha passato un weekend a rielaborare l'IAM.

Entro lunedì, ogni servizio aveva un ruolo con esattamente i permessi di cui aveva bisogno. Soo-Jin e Rafael avevano membership nei gruppi che corrispondevano alle loro vere funzioni. Leo stesso aveva abbandonato l'accesso amministrativo e utilizzava un ruolo che aveva progettato, con il permesso di fare il suo lavoro, e niente di più.

Ci aveva messo più tempo del previsto.

Priya ha rivisto il suo lavoro martedì mattina. Ha esaminato attentamente i documenti di policy.

"Questo è buono," ha detto.

"Grazie," ha detto Leo, con il sollievo di qualcuno che aveva passato un weekend a essere umiliato dal JSON.

"Hai lasciato una cosa."

Leo si è irrigidito.

"La vecchia chiave di distribuzione dalla prima versione. In un segreto di GitHub Actions."

"Era stata disattivata."

Priya ha digitato qualcosa. "Lo era?"

Una pausa.

"La disattiverò," ha detto Leo.

"I log di CloudTrail hanno mostrato che ha effettuato tre chiamate API la scorsa settimana."

Una pausa più lunga.

"Qualcuno la stava usando," ha detto Leo. "La indagherò."

Nel prossimo capitolo: la differenza tra un guardiano della sicurezza che ricorda i volti e una porta che legge solo i badge.
