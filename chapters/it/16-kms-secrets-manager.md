# Capitolo 16: Chiavi, Blocchi e Segreti

Leo stava rivedendo la cronologia di Git quando l'ha trovato. Una password di database. Committata sei mesi prima, in testo semplice, da qualcuno che non lavorava più in Nimbus. Il commit era pubblico. La password era stata cambiata da tempo – ma non lo sapevano con certezza. Controllavano ogni sistema a cui quel credential aveva mai toccato. Ci sono volute quattro ore. Quel giorno Nimbus ha deciso di smettere di mettere segreti nel codice.

**I Due Problemi: Memorizzazione dei Segreti e Crittografia dei Dati**

La sicurezza delle informazioni sensibili presenta due problemi distinti:

**Memorizzazione dei credenziali** (password di database, chiavi API, stringhe di connessione): Dove vivono? Chi può accedervi? Come si ruotano senza ridistribuire la tua applicazione?

**Crittografia dei dati** (informazioni sui clienti, registri di pagamento, dati PII): Come si assicura che anche se qualcuno ottiene un accesso non autorizzato al database o al bucket S3, non possa leggere i dati?

AWS offre un servizio dedicato per ciascun problema:

- **AWS Secrets Manager**: Memorizza e gestisce i credenziali in modo sicuro
- **AWS KMS (Key Management Service)**: Gestisce le chiavi di crittografia per crittare e decrittare i dati

**AWS Secrets Manager: Basta Credenziali Hardcoded**

Secrets Manager è un archivio sicuro per i segreti: credenziali di database, chiavi API, token OAuth, chiavi SSH o qualsiasi altra cosa sensibile.

Invece che la tua applicazione legga una password da una variabile d'ambiente o da un file di configurazione, chiama l'API di Secrets Manager all'avvio (o quando necessario) e recupera il segreto. Il segreto non tocca il disco. Non compare nel tuo codice. Non è presente nelle tue variabili d'ambiente.

Ecco come appare il flusso:

**Metodo vecchio**:

```
DB_PASSWORD=supersecretpassword123  # in .env file or environment variable
```

**Secrets Manager percorso**:
```

```python
import boto3
client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='nimbus/production/db-password')
password = json.loads(secret['SecretString'])['password']

The EC2 instance needs an IAM role with permission to call `secretsmanager:GetSecretValue` for that specific secret. No other service can read it. The secret is never in the code.

**Automatic Rotation: La Vera Potenza**

La caratteristica più importante di Secrets Manager non è l'archiviazione dei segreti — è la loro rotazione automatica.

Ecco lo scenario: ogni 30 giorni, Secrets Manager genera una nuova password per il database, la aggiorna in RDS, aggiorna il segreto memorizzato e la tua applicazione recupera la nuova password la prossima volta che ne ha bisogno. Nessuna intervento manuale. Nessuna distribuzione. Nessuno che deve ricordare di ruotare questo.

La rotazione è implementata come una funzione Lambda. AWS fornisce modelli per i database RDS (MySQL, PostgreSQL, Aurora). Puoi personalizzare la funzione per qualsiasi tipo di credenziale.

Tom aveva una domanda sui costi. (Certo che ce l'aveva.)

Secrets Manager addebita per segreto al mese più per chiamata API. Per un piccolo numero di password e chiavi di accesso al database, il costo è dollari al mese — trascurabile rispetto al costo di un incidente.

"La compromissione della scorsa settimana", disse Priya, "quanto sarebbe costato investigare e risolvere?"

Tom rimase in silenzio per un momento. "Includendo il mio tempo, il tuo tempo, quello di Leo nel weekend... qualche migliaio di dollari."

"Secrets Manager avrebbe potuto individuare la chiave statica prima che fosse sfruttata. E l'avrebbe ruotata automaticamente."

Tom aprì la pagina dei prezzi.

**AWS KMS: La Fabbrica di Chiavi**

AWS KMS (Key Management Service) gestisce le **chiavi crittografiche** — i valori segreti utilizzati per crittografare e decrittare i dati.

L'analogia: KMS è come un'azienda di cassetti blindati che custodisce la chiave principale. I tuoi dati (il contenuto del cassetto) sono crittografati. Solo qualcuno con l'autorizzazione per utilizzare la chiave KMS può decrittografarli. KMS registra ogni utilizzo di ogni chiave in CloudTrail.

**Chiavi Master Clienti (CMKs)** — ora chiamate chiavi KMS — sono disponibili in due tipi:

**Chiavi gestite da AWS**: AWS crea e gestisce la chiave automaticamente per servizi come S3, EBS, RDS. Non hai il controllo diretto della chiave, ma puoi vedere che viene utilizzata. Gratuito.

**Chiavi gestite dal cliente**: crei la chiave in KMS e controlli ogni aspetto di essa: chi può usarla, quando ruota, chi può amministrarla. Puoi abilitare la rotazione annuale automatica. Costo: 1 $/mese per chiave più tariffe per chiamata API.

**Crittografia in AWS Services: Integrazione KMS**

La maggior parte dei servizi AWS integra KMS per la crittografia:

**S3**: abilita "crittografia lato server con KMS" su un bucket. Ogni oggetto è crittografato a riposo con una chiave KMS. La lettura di un oggetto richiede l'autorizzazione sia per il bucket S3 che per la chiave KMS.

**RDS**: abilita la crittografia alla creazione. L'archiviazione del database, i backup e i snapshot sono tutti crittografati con una chiave KMS. Nota: la crittografia non può essere abilitata su un'istanza RDS non crittografata all'inizio — devi creare uno snapshot, copiare lo snapshot con la crittografia abilitata e ripristinarlo.

**EBS**: crittografa i volumi con KMS. I nuovi volumi creati da snapshot crittografati sono automaticamente crittografati.

**DynamoDB**: la crittografia a riposo con KMS è abilitata per impostazione predefinita per tutti i tabelloni.

**ElastiCache Redis**: crittografia a riposo con KMS per dati sensibili memorizzati nella cache.

Il principio: i dati devono essere crittografati a riposo (memorizzati su disco) e in transito (in movimento attraverso una rete). KMS gestisce la crittografia a riposo. TLS/SSL (fornito automaticamente dai servizi AWS) gestisce la crittografia in transito.

**Crittografia a involucro: Come Funziona KMS in Realtà**

Ecco un dettaglio che ti aiuta a capire il comportamento di KMS e le domande d'esame.

KMS non crittografa direttamente i tuoi dati nella maggior parte dei casi. Utilizza la **crittografia a involucro**:

1. KMS genera una **chiave dati** (una chiave simmetrica univoca)
2. Il servizio utilizza la chiave dati per crittografare i tuoi dati localmente (veloce — crittografia simmetrica)
3. Il servizio chiede a KMS di crittografare la chiave dati stessa (utilizzando la tua chiave KMS)
4. Sia la chiave dati crittografata che la chiave dati crittografata sono memorizzate
5. I tuoi dati effettivi non lasciano il servizio — solo la chiave dati va a KMS per la crittografia/decrittazione

Quando leggi i dati:

1. Il servizio chiede a KMS di decrittare la chiave dati
2. KMS verifica le autorizzazioni, decritta la chiave dati, la restituisce
3. Il servizio utilizza la chiave dati decrittata per decrittare i tuoi dati localmente

Questo significa che KMS può gestire grandi quantità di dati senza inviarli tutti tramite l'API KMS. Solo piccole chiavi vanno a KMS per la crittografia/decrittazione. CloudTrail registra ogni chiamata API KMS — ogni operazione di crittografia e decrittazione.

**Secrets Manager vs Parameter Store**

AWS ha anche **Systems Manager Parameter Store**, che memorizza i valori di configurazione (non solo segreti). Parameter Store è più economico — gratuito per i parametri standard. Può anche memorizzare i parametri crittografati utilizzando KMS.

Per i segreti che necessitano di rotazione: Secrets Manager.

Per i valori di configurazione e i parametri non sensibili: Parameter Store (la fascia gratuita è molto generosa).

Per la configurazione dell'applicazione (numeri di porta, funzionalità, impostazioni specifiche dell'ambiente): Parameter Store.

## Punti di Forza e Limitazioni

**AWS Secrets Manager**:

- Rotazione automatica dei segreti senza modifiche al codice
- Controllo degli accessi granulare basato su IAM per ogni segreto
- Versionamento (accesso alla versione precedente durante la rotazione)
- Audit tramite CloudTrail
- Costo: ~$0.40/segreto/mese + chiamate API

**AWS KMS**:

- Gestione centralizzata delle chiavi con traccia di audit completa
- Rotazione automatica annuale delle chiavi per chiavi gestite dal cliente
- Controllo granulare basato su IAM per ogni chiave (politiche della chiave + politiche IAM)
- Modulo di Sicurezza Hardware (HSM) supportato – le chiavi non lasciano mai l'HSM
- Costo: $1/mese per chiave + $0.03 per 10.000 chiamate API

**Quando le cose si complicano**:

- Le politiche della chiave KMS sono separate da (e vengono valutate insieme) alle politiche IAM – può essere confuso il debug
- La crittografia a riposo deve essere pianificata – non è possibile crittografare un'istanza RDS non crittografata esistente sul posto
- La cancellazione delle chiavi in KMS ha un periodo di attesa di 7-30 giorni (un meccanismo di sicurezza – le chiavi perse significano dati persi)
- I costi di Secrets Manager scalano con il numero di segreti e chiamate API su larga scala

## Riepilogo

- Non archiviare le credenziali nel codice, nelle variabili d'ambiente o nei file di configurazione commessi nel controllo delle versioni.
- **Secrets Manager** memorizza le credenziali in modo sicuro e le ruota automaticamente. Le applicazioni recuperano i segreti tramite API.
- **KMS** gestisce le chiavi di crittografia. La maggior parte dei servizi AWS integra KMS per la crittografia a riposo.
- **Crittografia a riposo** (dati memorizzati su disco) utilizza le chiavi KMS gestite da AWS o da te. **Crittografia in transito** utilizza TLS.
- **Crittografia a involucro**: KMS crittografa la chiave, non i dati direttamente. Il servizio crittografa i dati utilizzando una piccola chiave di dati locale.
- **Chiavi KMS gestite dal cliente**: controllo completo sulla rotazione, l'accesso e l'audit. **Chiavi gestite da AWS**: rotazione automatica, nessuna configurazione necessaria.
- **Parameter Store** è un'alternativa più leggera a Secrets Manager per i valori di configurazione non sensibili.

## Suggerimenti per l'esame

*SAA-C03 Dominio: Progettazione di architetture sicure (Dominio 1, Task 1.3)*

- **Secrets Manager vs SSM Parameter Store**: Secrets Manager per i credenziali che necessitano di rotazione automatica; Parameter Store per le configurazioni generali. L'esame distingue tra loro in base al requisito di rotazione e alla sensibilità dei costi.
- **Politiche della chiave KMS**: una chiave KMS ha la propria politica della chiave (una politica basata sulle risorse). Le politiche IAM da sole non concedono l'accesso a una chiave KMS – la politica della chiave deve consentire esplicitamente ciò.
- **Crittografia di RDS**: non è possibile abilitare la crittografia su un'istanza RDS non crittografata esistente. Il processo: crea un'istantia di snapshot → copia l'istantia di snapshot con la crittografia abilitata → ripristina dall'istantia di snapshot crittografata → migra il traffico all'istanza nuova →
- **Crittografia EBS**: i nuovi volumi possono essere crittografati. Gli snapshot di volumi crittografati sono sempre crittografati. I volumi non crittografati non possono essere crittografati direttamente – snapshot + copia + ripristino.
- **CloudTrail + KMS**: ogni chiamata API KMS viene registrata in CloudTrail. Questa è una caratteristica di conformità chiave.
- **Chiavi KMS multi-regione**: replica il materiale della chiave in più regioni in modo che la decrittazione possa avvenire senza chiamate API cross-region. L'esame utilizza questo per il disaster recovery multi-regione con dati crittografati.
- **KMS vs CloudHSM**: KMS è multi-tenant (gestito da AWS). CloudHSM è un modulo di sicurezza hardware dedicato che solo tu controlli. L'esame indica: "FIPS 140-2 Livello 3", "modulo HSM dedicato", "operazioni crittografiche gestite dal cliente" → CloudHSM.

## Esercizi

**Esercizio 1 — Richiamo**

Spiega il concetto di crittografia a involucro. Perché KMS crittografa una piccola chiave di dati piuttosto che crittografare direttamente i tuoi dati di applicazione?

*(Suggerimento: pensa a cosa succede se hai 1 GB di dati da crittografare e a quali implicazioni sulle prestazioni dell'invio di 1 GB a un servizio KMS remoto.)*

**Esercizio 2 — Esercitazione per l'esame**

*Scenario*: Un'azienda di servizi finanziari memorizza dati sensibili dei clienti in un database RDS MySQL. Un nuovo requisito di conformità impone che:

1. Tutti i dati devono essere crittografati a riposo
2. Tutte le attività di utilizzo della chiave di crittografia devono essere audibili
3. Le chiavi di crittografia devono essere controllate dal cliente (non gestite da AWS)
4. La password del database deve essere ruotata automaticamente ogni 90 giorni

Il database è stato creato sei mesi fa senza crittografia abilitata. Quale insieme di azioni soddisfa al meglio i quattro requisiti?

A) Abilita la crittografia RDS sull'istanza di database esistente; crea una chiave KMS gestita dal cliente; configura Secrets Manager con rotazione di 90 giorni
B) Crea un'istantia di snapshot del database esistente; copia l'istantia di snapshot con la crittografia utilizzando una chiave KMS gestita dal cliente; ripristina dall'istantia di snapshot crittografata; configura Secrets Manager con rotazione di 90 giorni
C) Crea una nuova istanza RDS crittografata con una chiave gestita da AWS; migra i dati dall'istanza vecchia; configura Secrets Manager con rotazione di 90 giorni
D) Abilita la crittografia RDS a riposo sull'istanza di database esistente utilizzando una chiave gestita da AWS; configura Secrets Manager con rotazione di 90 giorni

**Suggerimento 1**: Non è possibile abilitare la crittografia su un'istanza RDS non crittografata esistente direttamente.

**Suggerimento 2**: "Controllato dal cliente" significa chiavi gestite dal cliente, non chiavi gestite da AWS.

**Suggerimento 3**: Il processo di copia dell'istantia di snapshot è il percorso di migrazione standard per RDS crittografato.

**Risposta**: B

**Spiegazione**: La crittografia di RDS non può essere abilitata su un'istanza esistente. L'approccio standard è: creare uno snapshot dell'istanza esistente → copiare lo snapshot con la crittografia abilitata utilizzando una chiave KMS gestita dal cliente (soddisfa i requisiti 1, 2 e 3) → ripristinare dallo snapshot crittografato. Le chiavi KMS gestite dal cliente registrano automaticamente tutti gli utilizzi in CloudTrail (audit) e mantengono il controllo sulle chiavi di crittografia. Secrets Manager gestisce la rotazione automatica delle password a 90 giorni (soddisfa il requisito 4).

**Perché non A?** Non è possibile abilitare la crittografia su un'istanza RDS non crittografata in loco.

**Perché non C?** Le chiavi gestite da AWS non soddisfano il requisito di "controllo del cliente" (requisito 3).

**Perché non D?** Stesso problema di A (non è possibile abilitare in loco) più che la chiave gestita da AWS non soddisfa il requisito 3.

*SAA-C03 Dominio: Progetta Architetture Sicure — Attività 1.3*

**Esercizio 3 — Sfida Architetturale** *(Opzionale)*

Nimbus deve archiviare i seguenti dati sensibili:

- Password del database per l'istanza RDS di produzione
- Chiave segreta API di Stripe (utilizzata per l'elaborazione dei pagamenti)
- Una chiave di crittografia simmetrica per crittografare la cronologia degli ordini dei clienti in DynamoDB
- Valori di configurazione per ristorante (endpoint API, flag di funzionalità — non sensibili)

Quale servizio o approccio AWS utilizzeresti per ciascuno? Quale strategia di rotazione applicheresti a ciascuno?

*(Non esiste una risposta corretta univoca. L'obiettivo è quello di esercitarsi nell'abbinare gli strumenti di sicurezza ai casi d'uso.)*

## Scena Post-Crediti

I segreti sono stati migrati.

Password del database: Secrets Manager, con rotazione ogni 30 giorni.

Chiavi API: Secrets Manager, con una funzione Lambda di rotazione che chiamava l'API del fornitore di pagamenti per generare una nuova chiave.

Dati sugli ordini dei clienti: crittografati con una chiave KMS gestita dal cliente.

Credenziali obsolete: disattivate. File di configurazione obsoleti: eliminati. Segreti GitHub Actions obsoleti: rimossi.

"Ora siamo pronti per l'audit," disse Priya.

"Definisci 'pronti per l'audit'," disse Maya.

"Se un revisore di conformità ci chiedesse di dimostrare che nessun credenziale è codificato nel nostro codice o esposto nella nostra infrastruttura, potremmo mostrarlo: ogni segreto è in Secrets Manager, ogni chiave di crittografia è in KMS, ogni accesso è registrato in CloudTrail."

"Quando è stata l'ultima volta che qualcuno ha controllato i log di CloudTrail?"

Una pausa.

"Li controllo ogni settimana," disse Priya.

"E se fosse apparso qualcosa di insolito, come avremmo saputo?"

"Questo," disse Priya, chiudendo il suo laptop, "è la prossima conversazione."

Nel prossimo capitolo: gli strati di difesa che separano Nimbus da Internet.
