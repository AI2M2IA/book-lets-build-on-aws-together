# Appendice D: Esame di Pratica Completo (65 Domande)

Questo è un esame di pratica completo per la certificazione SAA-C03: 65 domande, che rispecchia i pesi dei domini del vero esame — Progettare Architetture Sicure (Domande 1–20, ~30%), Progettare Architetture Resilienti (21–37, ~26%), Progettare Architetture ad Alte Prestazioni (38–53, ~24%) e Progettare Architetture Ottimizzate per i Costi (54–65, ~20%).

**Come affrontarlo:**

- Imposta un timer per **130 minuti** — la durata del vero esame. Allenati sul ritmo: hai due minuti per domanda.
- Sette domande riportano **(Scegline DUE.)** — hanno cinque opzioni e esattamente due risposte corrette, proprio come gli elementi a risposta multipla del vero esame. Entrambe devono essere corrette per ottenere il punto.
- Non guardare la chiave delle risposte finché non hai completato tutte le 65 domande. Nel vero esame non ricevi feedback durante lo svolgimento, e allenare la tolleranza all'incertezza è parte della preparazione.
- Il vero esame include 15 domande sperimentali non valutate che non puoi identificare. Qui tutte e 65 sono "valutate." Un benchmark di superamento: **47 o più corrette (~72%)** ti colloca nell'intervallo del punteggio scalato di superamento 720/1000. Sotto 47, rivedi i capitoli mappati nell'Appendice B per i tuoi domini deboli prima di prenotare l'esame.
- Per ogni domanda che sbagli — e per ogni domanda che indovini ma su cui hai esitato — leggi l'analisi dei distrattori. L'esame verifica le *differenze* tra opzioni plausibili, ed è lì che vive l'apprendimento.

---

## Parte 1 — Progettare Architetture Sicure (Domande 1–20)

**Domanda 1** *(Dominio 1 — Attività 1.1)*
Un'azienda di servizi finanziari usa AWS Organizations con tutte le funzionalità abilitate. Il team di sicurezza ha allegato una service control policy (SCP) alla root dell'organizzazione che nega l'uso di tutte le Region AWS tranne eu-west-1. Durante un audit, il team scopre che un amministratore in un account è stato comunque in grado di avviare istanze EC2 in us-east-2 nonostante la SCP. Quale account ha più probabilmente consentito questa azione?

A) Un account membro in un'unità organizzativa (OU) annidata, perché le SCP non si propagano alle OU annidate
B) L'account di gestione, perché le SCP non si applicano all'account di gestione
C) Un account membro la cui policy IAM di amministratore include un Allow esplicito, che sovrascrive le SCP
D) Un account membro creato dopo che la SCP è stata allegata, perché le SCP si applicano solo agli account esistenti al momento dell'allegazione

**Domanda 2** *(Dominio 1 — Attività 1.1)*
Una startup vuole consentire ai suoi sviluppatori di creare ruoli IAM per le loro applicazioni, ma il team di sicurezza è preoccupato che gli sviluppatori possano creare ruoli con più autorizzazioni di quelle che essi stessi hanno, portando a un'escalation dei privilegi. Il team di sicurezza vuole che gli sviluppatori mantengano la creazione in autonomia dei ruoli. Qual è la soluzione PIÙ appropriata?

A) Richiedere agli sviluppatori di inviare richieste di creazione di ruoli tramite un sistema di ticketing revisionato dal team di sicurezza
B) Allegare una SCP agli account degli sviluppatori che nega completamente l'azione iam:CreateRole
C) Richiedere che tutti i ruoli creati dagli sviluppatori includano uno specifico permissions boundary, applicato con una condizione IAM su iam:CreateRole e iam:AttachRolePolicy
D) Abilitare AWS CloudTrail e configurare avvisi ogni volta che uno sviluppatore crea un nuovo ruolo IAM

**Domanda 3** *(Dominio 1 — Attività 1.1)*
Un provider SaaS deve accedere alle risorse negli account AWS dei propri clienti per eseguire analisi automatizzate dei costi. I clienti creano un ruolo IAM che l'account del provider SaaS può assumere. Un consulente di sicurezza avverte che una terza parte che viene a conoscenza dell'ARN del ruolo di un cliente potrebbe ingannare il provider SaaS affinché acceda all'account di quel cliente per conto della terza parte. Quale meccanismo mitiga questo rischio di "confused deputy"?

A) Richiedere l'autenticazione a più fattori (MFA) nella trust policy del ruolo cross-account
B) Richiedere al provider SaaS di passare un ExternalId univoco, definito dal cliente, nella chiamata sts:AssumeRole e validato da una condizione nella trust policy del ruolo
C) Cifrare l'ARN del ruolo con AWS KMS prima di condividerlo con il provider SaaS
D) Sostituire il ruolo cross-account con un utente IAM le cui chiavi di accesso vengono ruotate ogni 90 giorni

**Domanda 4** *(Dominio 1 — Attività 1.1)*
Un'azienda con 40 account AWS in AWS Organizations vuole che i propri dipendenti accedano una sola volta con le credenziali esistenti di Microsoft Entra ID (Azure AD) e accedano a tutti gli account AWS tramite un unico portale, con le autorizzazioni assegnate centralmente per account. Quale soluzione soddisfa questi requisiti con il MINORE overhead operativo?

A) Creare utenti IAM in ognuno dei 40 account e sincronizzare le password con Entra ID
B) Configurare AWS IAM Identity Center con Entra ID come provider di identità esterno e assegnare permission set a utenti e gruppi per account
C) Distribuire Amazon Cognito user pool in ogni account e federarli a Entra ID
D) Creare un provider di identità SAML in ogni account e scrivere manualmente ruoli IAM e trust policy per account

**Domanda 5** *(Dominio 1 — Attività 1.1)*
Un'azienda di giochi mobile sta costruendo un'app in cui i giocatori si registrano con un indirizzo e-mail o un login social, e dopo l'autenticazione l'app deve caricare screenshot dei giocatori direttamente in un bucket Amazon S3 usando credenziali AWS temporanee. Quale combinazione di servizi dovrebbe raccomandare il solutions architect?

A) Un Amazon Cognito user pool per la registrazione/accesso, e un Amazon Cognito identity pool per scambiare il token autenticato con credenziali AWS temporanee
B) Un Amazon Cognito identity pool per la registrazione/accesso, e un Amazon Cognito user pool per emettere credenziali AWS temporanee
C) AWS IAM Identity Center per la registrazione/accesso, e AWS STS GetSessionToken per le credenziali
D) Un Amazon Cognito user pool da solo, perché i token del user pool garantiscono accesso diretto a S3

**Domanda 6** *(Dominio 1 — Attività 1.3)*
Un'azienda sanitaria deve cifrare i dati in Amazon S3 con una chiave che supporti la rotazione annuale automatica gestita da AWS, pur consentendo all'azienda di definire la key policy, abilitare il logging CloudTrail dell'utilizzo della chiave e disabilitare la chiave se necessario. Quale tipo di chiave KMS soddisfa questi requisiti?

A) Una chiave gestita da AWS (aws/s3)
B) Una chiave gestita dal cliente con rotazione automatica abilitata
C) Una chiave di proprietà di AWS
D) Una chiave gestita dal cliente con materiale chiave importato (BYOK) con rotazione automatica abilitata

**Domanda 7** *(Dominio 1 — Attività 1.3)*
Un solutions architect sta spiegando come AWS KMS cifra un file da 4 GB memorizzato da un'applicazione, dato che KMS può cifrare direttamente solo fino a 4 KB di dati. Quale affermazione descrive accuratamente la cifratura a busta?

A) KMS divide il file in blocchi da 4 KB e cifra ogni blocco con la chiave KMS
B) L'applicazione richiede una data key a KMS, cifra il file localmente con la data key in chiaro, poi memorizza la data key cifrata insieme ai dati e scarta la data key in chiaro
C) KMS trasmette il file in streaming attraverso l'API KMS, che lo cifra lato server con la chiave KMS
D) L'applicazione cifra il file con una chiave simmetrica hardcoded, e KMS firma il risultato per l'integrità

**Domanda 8** *(Dominio 1 — Attività 1.3)*
Un'azienda memorizza la password master di Amazon RDS for PostgreSQL e ha bisogno che venga ruotata automaticamente ogni 30 giorni senza interruzione del servizio applicativo. L'applicazione mantiene connessioni al database di lunga durata, quindi il team vuole una strategia di rotazione in cui la credenziale precedente rimanga valida mentre quella nuova viene attivata. Quale soluzione soddisfa questi requisiti?

A) Parametri SecureString di AWS Systems Manager Parameter Store con una funzione Lambda attivata mensilmente
B) AWS Secrets Manager con la strategia di rotazione a utente singolo
C) AWS Secrets Manager con la strategia di rotazione ad alternanza di utenti, che passa tra due utenti del database in modo che una credenziale sia sempre valida
D) Rotazione automatica della chiave AWS KMS applicata alla password del database

**Domanda 9** *(Dominio 1 — Attività 1.3)*
Un'azienda media memorizza video grezzi in Amazon S3. La normativa richiede che l'azienda gestisca e fornisca le proprie chiavi di cifratura, che AWS non memorizzi mai quelle chiavi, e che le chiavi vengano fornite con ogni richiesta. Quale opzione di cifratura soddisfa questi requisiti?

A) SSE-S3
B) SSE-KMS con una chiave gestita dal cliente
C) SSE-C
D) Cifratura lato client usando la chiave gestita da AWS aws/s3

**Domanda 10** *(Dominio 1 — Attività 1.3)*
Un broker-dealer deve conservare i registri delle transazioni in Amazon S3 per sette anni in modo che nessuno — incluso l'utente root dell'account AWS — possa eliminare o sovrascrivere gli oggetti durante il periodo di conservazione, per soddisfare la SEC Rule 17a-4. Quale configurazione soddisfa questo requisito?

A) S3 Object Lock in modalità governance con un periodo di conservazione di 7 anni
B) S3 Object Lock in modalità compliance con un periodo di conservazione di 7 anni su un bucket con versioning abilitato
C) Una bucket policy S3 che nega s3:DeleteObject per tutti i principal
D) S3 Glacier Deep Archive con una lifecycle rule che scade gli oggetti dopo 7 anni

**Domanda 11** *(Dominio 1 — Attività 1.2)*
Un'applicazione web gira su istanze EC2 dietro un Application Load Balancer. Un network engineer aggiunge una regola di network ACL alla subnet che consente il traffico TCP in entrata sulla porta 443 da 0.0.0.0/0, ma i client non riescono ancora a completare le richieste HTTPS. I security group sono configurati correttamente. Qual è la causa PIÙ probabile?

A) La network ACL è stateful e richiede una regola di connection tracking
B) La network ACL non ha nessuna regola in uscita che consenta le porte efimere (1024–65535), quindi il traffico di ritorno è bloccato perché le NACL sono stateless
C) Il security group deve anche consentire la porta 443 in uscita, perché i security group sono stateless
D) Le network ACL non possono consentire il traffico da 0.0.0.0/0; è richiesto un CIDR specifico

**Domanda 12** *(Dominio 1 — Attività 1.2)*
Quali DUE affermazioni sui security group e le network ACL in un VPC sono accurate? (Scegline DUE.)

A) I security group sono stateful, quindi il traffico di ritorno è automaticamente consentito indipendentemente dalle regole in uscita
B) Le network ACL valutano le regole in ordine numerico e supportano regole di Deny esplicite
C) I security group supportano sia regole Allow che Deny
D) Le network ACL sono collegate alle singole elastic network interface
E) Le regole dei security group vengono valutate in ordine numerico, fermandosi alla prima corrispondenza

**Domanda 13** *(Dominio 1 — Attività 1.2)*
Un'azienda di e-commerce che gestisce un'applicazione pubblica su CloudFront e ALB è preoccupata per attacchi DDoS di grandi dimensioni e sofisticati. L'azienda vuole accesso 24/7 all'AWS Shield Response Team, protezione dei costi contro gli addebiti di scalabilità causati dagli attacchi e diagnostica degli attacchi. Quale servizio dovrebbe usare?

A) AWS Shield Standard, abilitato automaticamente senza costi
B) AWS Shield Advanced
C) AWS WAF con regole basate sulla frequenza
D) Amazon GuardDuty con il piano di protezione EC2

**Domanda 14** *(Dominio 1 — Attività 1.2)*
Una REST API dietro un Application Load Balancer viene attaccata con tentativi di SQL injection e richieste eccessive da un piccolo insieme di indirizzi IP. Quale soluzione blocca i pattern di richieste dannose all'edge dell'applicazione con il MINORE sforzo di sviluppo?

A) Aggiungere codice di validazione degli input a ogni handler API
B) Associare AWS WAF all'ALB, usando il gruppo di regole gestite per SQL injection e una regola basata sulla frequenza
C) Abilitare AWS Shield Standard sull'ALB
D) Configurare il security group dell'ALB per rifiutare le richieste contenenti parole chiave SQL

**Domanda 15** *(Dominio 1 — Attività 1.2)*
Un'azienda vuole soddisfare tre esigenze di sicurezza: (1) rilevare continuamente istanze EC2 compromesse e attività API anomale usando l'intelligence sulle minacce, (2) scoprire e classificare le informazioni di identificazione personale (PII) memorizzate nei bucket S3, e (3) scansionare istanze EC2 e immagini container alla ricerca di vulnerabilità software (CVE). Quale mappatura dei servizi AWS alle esigenze è corretta?

A) 1: Amazon Inspector, 2: Amazon GuardDuty, 3: Amazon Macie
B) 1: Amazon GuardDuty, 2: Amazon Macie, 3: Amazon Inspector
C) 1: Amazon Macie, 2: Amazon Inspector, 3: Amazon GuardDuty
D) 1: Amazon GuardDuty, 2: Amazon Inspector, 3: Amazon Macie

**Domanda 16** *(Dominio 1 — Attività 1.2)*
Un'applicazione in esecuzione su istanze EC2 in subnet private deve caricare oggetti su Amazon S3 e chiamare Amazon DynamoDB. La policy aziendale vieta che il traffico attraversi la rete internet pubblica, e il team vuole l'opzione a minor costo per entrambi i servizi. Quale soluzione soddisfa questi requisiti?

A) Un NAT gateway in una subnet pubblica
B) Gateway VPC endpoint per S3 e DynamoDB, referenziati nelle route table delle subnet
C) Interface VPC endpoint (AWS PrivateLink) per S3 e DynamoDB
D) Un internet gateway con regole di security group restrittive

**Domanda 17** *(Dominio 1 — Attività 1.3)*
Dopo un incidente di server-side request forgery (SSRF) in cui un attaccante ha recuperato le credenziali del ruolo IAM dal servizio di metadati di un'istanza EC2 attraverso un'applicazione web vulnerabile, un team di sicurezza vuole rafforzare tutte le istanze contro questa classe di attacchi. Cosa dovrebbe fare il team?

A) Applicare IMDSv2 richiedendo token di sessione (HttpTokens=required), in modo che le richieste ai metadati richiedano un token ottenuto via PUT che le semplici richieste SSRF non possono acquisire
B) Disabilitare il servizio di metadati dell'istanza su tutte le istanze, poiché le applicazioni non ne hanno mai bisogno
C) Bloccare 169.254.169.254 nella network ACL della subnet
D) Spostare le credenziali del ruolo dell'istanza in un file di configurazione sull'istanza

**Domanda 18** *(Dominio 1 — Attività 1.3)*
Un solutions architect deve memorizzare circa 200 valori di configurazione applicativa in chiaro (feature flag, nomi di ambiente, URL degli endpoint) e 5 password di database. Le password richiedono rotazione automatica; i valori di configurazione no, e il team vuole minimizzare i costi. Quale combinazione è PIÙ conveniente?

A) Memorizzare tutto in AWS Secrets Manager
B) Memorizzare tutto in parametri standard di AWS Systems Manager Parameter Store
C) Memorizzare i valori di configurazione in parametri standard di Parameter Store (gratuiti) e le password in AWS Secrets Manager con la rotazione abilitata
D) Memorizzare i valori di configurazione in S3 e le password in parametri SecureString di Parameter Store con rotazione automatica integrata

**Domanda 19** *(Dominio 1 — Attività 1.3)*
Un'azienda cifra gli oggetti S3 con SSE-KMS usando una chiave gestita dal cliente. Un'applicazione nello stesso account legge questi oggetti migliaia di volte al secondo, e il team sta rilevando problemi di throttling e costi elevati dalle chiamate API KMS. Quale modifica riduce il traffico di richieste KMS mantenendo la cifratura SSE-KMS?

A) Passare il bucket a SSE-S3, che non usa chiavi
B) Abilitare S3 Bucket Keys, in modo che S3 usi una chiave di livello bucket a breve durata per ridurre le chiamate a KMS
C) Disabilitare la rotazione automatica della chiave sulla chiave gestita dal cliente
D) Sostituire la chiave gestita dal cliente con materiale chiave importato

**Domanda 20** *(Dominio 1 — Attività 1.1)*
Quali DUE affermazioni sulla valutazione delle policy IAM e AWS Organizations sono accurate? (Scegline DUE.)

A) Le SCP concedono autorizzazioni agli utenti e ai ruoli IAM negli account membro
B) Un Deny esplicito in qualsiasi policy applicabile sovrascrive sempre qualsiasi Allow
C) Le policy basate su risorse non possono concedere accesso cross-account senza una SCP
D) Un permissions boundary imposta le autorizzazioni massime che una policy basata su identità può concedere a un utente o ruolo, ma non concede nulla di per sé
E) Se nessuna policy menziona un'azione, l'azione è consentita per impostazione predefinita per gli utenti IAM

---

## Parte 2 — Progettare Architetture Resilienti (Domande 21–37)

**Domanda 21** *(Dominio 2 — Attività 2.2)*
Un rivenditore online gestisce Amazon RDS for MySQL. Il database subisce un traffico di lettura intenso dai cruscotti di reportistica, e l'azienda ha anche bisogno che il database sopravviva a un guasto di una Availability Zone con failover automatico senza intervento manuale. Quale combinazione soddisfa ENTRAMBI i requisiti?

A) Abilitare solo la distribuzione Multi-AZ; l'istanza standby può servire le letture di reportistica
B) Creare solo read replica; una replica viene promossa automaticamente quando la AZ del primario si guasta
C) Abilitare la distribuzione Multi-AZ per il failover automatico, e aggiungere read replica per scaricare le letture di reportistica
D) Migrare a una classe di istanza più grande a singola AZ per gestire entrambi i carichi di lavoro

**Domanda 22** *(Dominio 2 — Attività 2.2)*
Un'azienda vuole alta disponibilità RDS su più Availability Zone, ma si oppone a pagare per un'istanza standby Multi-AZ tradizionale che non serve traffico. Quale opzione di distribuzione RDS fornisce failover automatico E consente alla capacità standby di servire il traffico di lettura?

A) Distribuzione RDS Multi-AZ DB instance (uno standby)
B) Distribuzione RDS Multi-AZ DB cluster, che dispone di due istanze standby leggibili con un reader endpoint
C) Read replica RDS in tre AZ con un Application Load Balancer
D) RDS Single-AZ con backup automatizzati

**Domanda 23** *(Dominio 2 — Attività 2.2)*
Una piattaforma di pagamenti globale su Amazon Aurora deve effettuare il failover in una seconda Region AWS se la Region primaria diventa non disponibile. Il team di compliance chiede se Aurora Global Database può garantire zero perdita di dati (RPO = 0) tra le Region. Cosa dovrebbe rispondere il solutions architect?

A) Sì — Aurora Global Database replica in modo sincrono tra le Region, quindi l'RPO è esattamente 0
B) No — Aurora Global Database usa la replica asincrona basata sullo storage con un ritardo tipico inferiore a 1 secondo, quindi l'RPO cross-Region è vicino a zero ma non può mai essere garantito esattamente 0
C) Sì — ma solo se il write forwarding è abilitato sulla Region secondaria
D) No — Aurora Global Database replica secondo una pianificazione di 5 minuti, dando un RPO di 5 minuti

**Domanda 24** *(Dominio 2 — Attività 2.2)*
Il piano di disaster recovery di un'azienda afferma: "Dopo un'interruzione regionale, il sistema degli ordini deve essere operativo entro 4 ore, e non più di 15 minuti di transazioni possono andare persi." Quale affermazione mappa correttamente questi numeri alle metriche DR?

A) RTO = 15 minuti; RPO = 4 ore
B) RTO = 4 ore; RPO = 15 minuti
C) MTBF = 4 ore; MTTR = 15 minuti
D) RPO = 4 ore; SLA = 15 minuti

**Domanda 25** *(Dominio 2 — Attività 2.2)*
Una compagnia assicurativa ha bisogno di una strategia DR per un'applicazione critica. Requisiti: i dati devono essere continuamente replicati nella Region DR; l'infrastruttura core (database, AMI, stack minimale) deve già esistere nella Region DR ma il compute deve rimanere spento fino a un disastro, per contenere i costi; un RTO di decine di minuti è accettabile. Quale strategia DR corrisponde?

A) Backup and restore
B) Pilot light — elementi core predisposti nella Region DR con i dati replicati live, ma il compute spento fino al failover
C) Warm standby — una copia ridotta ma sempre in esecuzione dell'intero carico di lavoro
D) Multi-site active/active

**Domanda 26** *(Dominio 2 — Attività 2.2)*
Quali DUE affermazioni sulle strategie di disaster recovery AWS sono accurate? (Scegline DUE.)

A) Backup and restore richiede che le risorse siano pre-predisposte e in esecuzione nella Region di recovery
B) Backup and restore offre il minore RTO delle quattro strategie
C) Multi-site active/active serve il traffico da più Region simultaneamente e offre un RTO vicino a zero al costo più elevato
D) Pilot light mantiene una copia a piena capacità dell'applicazione che serve il traffico di produzione nella Region di recovery
E) Warm standby mantiene una copia ridotta ma completamente funzionale del carico di lavoro sempre in esecuzione nella Region di recovery

**Domanda 27** *(Dominio 2 — Attività 2.1)*
Un'applicazione di elaborazione immagini legge messaggi da una coda standard Amazon SQS. L'elaborazione di un'immagine richiede fino a 3 minuti, ma il visibility timeout della coda è impostato a 30 secondi. Gli utenti segnalano che alcune immagini vengono elaborate due o tre volte. Qual è la causa PIÙ probabile e la correzione?

A) La coda è FIFO; passa a una coda standard
B) Il visibility timeout scade prima che l'elaborazione finisca, rendendo il messaggio di nuovo visibile ad altri consumer; aumenta il visibility timeout oltre il tempo di elaborazione
C) Il long polling è disabilitato; abilita un ReceiveMessageWaitTime di 20 secondi
D) Il periodo di conservazione dei messaggi è troppo breve; aumentalo a 14 giorni

**Domanda 28** *(Dominio 2 — Attività 2.1)*
Un'applicazione di fatturazione consuma messaggi da una coda SQS. Occasionalmente un messaggio malformato fa sì che il consumer fallisca ripetutamente, e il messaggio cicla nella coda all'infinito, sprecando compute. Cosa dovrebbe configurare l'architetto?

A) Una dead-letter queue con una redrive policy maxReceiveCount, in modo che i messaggi che falliscono ripetutamente vengano spostati per l'analisi
B) Un visibility timeout più breve in modo che il messaggio errato venga ritentato più rapidamente
C) Ordinamento FIFO, che scarta automaticamente i messaggi malformati
D) Un periodo di conservazione dei messaggi di 1 minuto in modo che i messaggi errati scadano rapidamente

**Domanda 29** *(Dominio 2 — Attività 2.1)*
Un broker elabora eventi di negoziazione per account cliente. Gli eventi per lo stesso account devono essere elaborati in ordine stretto ed esattamente una volta, ma gli eventi per account diversi possono essere elaborati in parallelo per il throughput. Quale soluzione soddisfa questi requisiti?

A) Una coda standard SQS con un unico thread consumer
B) Una coda FIFO SQS usando l'ID dell'account cliente come MessageGroupId, che preserva l'ordine all'interno di ogni gruppo consentendo il parallelismo tra i gruppi
C) Un topic SNS standard con filtro dei messaggi per ID account
D) Una coda FIFO SQS con un unico MessageGroupId per tutti i clienti

**Domanda 30** *(Dominio 2 — Attività 2.1)*
Quando viene effettuato un ordine, una piattaforma di e-commerce deve attivare simultaneamente tre processi indipendenti: generazione delle fatture, evasione dal magazzino e acquisizione analytics. Ogni processo deve ricevere ogni evento ordine, conservarlo in modo durevole e elaborarlo al proprio ritmo. Quale architettura soddisfa questi requisiti?

A) Una coda SQS con tre consumer che effettuano il polling sulla stessa coda
B) Un topic SNS che distribuisce a tre code SQS, una iscritta per processo
C) Tre funzioni Lambda invocate sequenzialmente da Step Functions
D) Un topic SNS con tre sottoscrizioni e-mail

**Domanda 31** *(Dominio 2 — Attività 2.1)*
Durante una flash sale, una funzione Lambda attivata da API Gateway inizia a restituire errori di throttling 429 mentre altre funzioni Lambda critiche nello stesso account iniziano anch'esse ad essere sottoposte a throttling. L'account ha raggiunto la sua quota di concorrenza predefinita. Quale azione protegge le funzioni critiche dall'essere penalizzate dalla funzione della vendita?

A) Aumentare il timeout della funzione della vendita da 3 secondi al massimo di 15 minuti
B) Configurare la concorrenza riservata sulle funzioni critiche (e opzionalmente limitare la funzione della vendita), garantendo loro concorrenza dedicata dal pool dell'account
C) Abilitare la concorrenza provisionata sulla funzione della vendita, che aumenta la quota a livello di account
D) Spostare le funzioni critiche a una configurazione di memoria da 10 GB

**Domanda 32** *(Dominio 2 — Attività 2.1)*
Un'azienda media ha un flusso di lavoro di pubblicazione video con un passaggio che attende fino a 2 giorni affinché un moderatore umano approvi il contenuto tramite uno strumento esterno prima di continuare. Il flusso di lavoro deve essere verificabile, durare giorni e riprendere esattamente dove si era fermato una volta che il moderatore risponde. Quale soluzione è la più adatta?

A) Un flusso di lavoro Express Step Functions con uno stato Wait
B) Un flusso di lavoro Standard Step Functions usando il pattern callback: un task token (waitForTaskToken) viene inviato al sistema di moderazione, e il flusso di lavoro riprende quando viene chiamato SendTaskSuccess
C) Una funzione Lambda che rimane in attesa fino all'approvazione del moderatore
D) Una regola EventBridge con un ritardo programmato di 2 giorni

**Domanda 33** *(Dominio 2 — Attività 2.1)*
Un'azienda gestisce una pipeline di acquisizione IoT ad alto volume che esegue circa 90.000 esecuzioni brevi di flussi di lavoro al secondo, ciascuna completata in meno di 5 secondi. La semantica di esecuzione esattamente-una-volta non è richiesta, ma i costi devono essere minimizzati. Separatamente, un flusso di lavoro mensile di riconciliazione finanziaria viene eseguito per 12 ore e richiede un'esecuzione esattamente-una-volta con la cronologia completa delle esecuzioni. Quali tipi di flusso di lavoro Step Functions dovrebbero essere usati?

A) Flussi di lavoro Express per la pipeline IoT; flussi di lavoro Standard per la riconciliazione
B) Flussi di lavoro Standard per entrambi
C) Flussi di lavoro Express per entrambi, poiché Express supporta fino a un anno di esecuzione
D) Flussi di lavoro Standard per la pipeline IoT; flussi di lavoro Express per la riconciliazione

**Domanda 34** *(Dominio 2 — Attività 2.2)*
Un'azienda ospita la sua applicazione web principale su un ALB in us-east-1 e una copia di recovery passiva in us-west-2. L'azienda vuole che Route 53 invii tutto il traffico a us-east-1 e reindirizzi automaticamente gli utenti a us-west-2 solo quando l'endpoint principale diventa non integro. Quale configurazione Route 53 soddisfa questo requisito?

A) Routing pesato con pesi 50/50
B) Routing di failover con un health check sul record primario e il record set us-west-2 come secondario
C) Routing basato sulla latenza tra le due Region
D) Routing per geolocalizzazione con un record predefinito che punta a us-west-2

**Domanda 35** *(Dominio 2 — Attività 2.2)*
Un Auto Scaling group esegue server web EC2 dietro un Application Load Balancer su tre Availability Zone. L'ALB segna alcune istanze come non integre perché il processo del server web si blocca, ma l'Auto Scaling group non le sostituisce mai perché le istanze EC2 stesse superano ancora i controlli di stato. Cosa dovrebbe cambiare il solutions architect?

A) Abilitare il monitoraggio CloudWatch dettagliato sulle istanze
B) Configurare l'Auto Scaling group per usare gli health check ELB in aggiunta ai controlli di stato EC2, in modo che le istanze che falliscono gli health check del target ALB vengano terminate e sostituite
C) Aumentare il grace period degli health check dell'ASG
D) Passare dall'ALB a un Network Load Balancer

**Domanda 36** *(Dominio 2 — Attività 2.1)*
Una società di trading ha bisogno di un load balancer per un protocollo TCP personalizzato che deve gestire milioni di richieste al secondo con latenza ultra-bassa ed esporre un indirizzo IP statico per Availability Zone. Quale load balancer dovrebbe scegliere la società?

A) Application Load Balancer
B) Network Load Balancer
C) Gateway Load Balancer
D) Classic Load Balancer

**Domanda 37** *(Dominio 2 — Attività 2.2)*
Quali DUE affermazioni sulla creazione di storage resiliente su AWS sono accurate? (Scegline DUE.)

A) S3 Cross-Region Replication copia retroattivamente tutti gli oggetti esistenti prima della configurazione della replica, senza azioni aggiuntive
B) Le classi di storage Amazon EFS Standard memorizzano i dati in modo ridondante su più Availability Zone e possono essere montate contemporaneamente da istanze in AZ diverse
C) S3 Cross-Region Replication richiede che il versioning sia abilitato sia sul bucket di origine che su quello di destinazione
D) I volumi Amazon EFS possono essere collegati a una sola istanza EC2 alla volta, come EBS
E) Abilitare il versioning S3 replica automaticamente gli oggetti in un'altra Region

---

## Parte 3 — Progettare Architetture ad Alte Prestazioni (Domande 38–53)

**Domanda 38** *(Dominio 3 — Attività 3.1)*
Un'azienda di analytics media gestisce un database PostgreSQL su Amazon RDS usando un volume EBS gp3. Un nuovo carico di lavoro di reportistica richiede 50.000 IOPS sostenute con latenza sub-millisecondo e una garanzia di durabilità del 99,999%. Il volume deve supportare questo in modo costante senza bursting. Quale tipo di volume EBS dovrebbe raccomandare un solutions architect?

A) gp3 provisionato con IOPS massime
B) io2 Block Express
C) st1 Throughput Optimized HDD
D) gp2 con una dimensione del volume di 16 TiB

**Domanda 39** *(Dominio 3 — Attività 3.1)*
Una società di ricerca genomica ha bisogno di storage condiviso per un cluster di high-performance computing (HPC) Linux con 500 istanze EC2. Il carico di lavoro richiede latenze sub-millisecondo e centinaia di GB/s di throughput aggregato, e i dataset di input vengono staged in Amazon S3. Quale servizio di storage soddisfa al meglio questi requisiti?

A) Amazon EFS con modalità di performance Max I/O
B) Amazon FSx for Windows File Server con storage SSD
C) Amazon FSx for Lustre collegato al bucket S3
D) Amazon S3 accessibile tramite Mountpoint su ogni istanza

**Domanda 40** *(Dominio 3 — Attività 3.1)*
Un'azienda sta migrando un'applicazione Windows on-premises che si basa su condivisioni di file SMB e liste di controllo degli accessi integrate con Active Directory. L'applicazione girerà su istanze EC2 Windows in due Availability Zone e deve mantenere le sue autorizzazioni NTFS esistenti. Quale servizio di storage AWS dovrebbe scegliere il solutions architect?

A) Amazon EFS con permessi POSIX
B) Amazon FSx for Windows File Server in modalità di distribuzione Multi-AZ
C) Amazon S3 con bucket policy mappate ai gruppi AD
D) Amazon FSx for Lustre con storage persistente

**Domanda 41** *(Dominio 3 — Attività 3.1)*
Un'azienda di produzione video a Singapore carica file di riprese grezze da 40 GB in un bucket S3 in us-east-1 da uffici in tutto il mondo. I caricamenti spesso falliscono a metà strada su internet pubblico, costringendo a riavvii completi, e i tempi di trasferimento complessivi sono lenti. Quale combinazione di azioni dovrebbe raccomandare un solutions architect? (Scegline DUE.)

A) Convertire il bucket in S3 One Zone-IA per migliorare il throughput di scrittura
B) Mettere un Application Load Balancer davanti al bucket in ogni region
C) Abilitare S3 Cross-Region Replication su un bucket in ap-southeast-1
D) Abilitare S3 Transfer Acceleration sul bucket e caricare tramite l'endpoint accelerato
E) Usare il caricamento multipart per i file di grandi dimensioni

**Domanda 42** *(Dominio 3 — Attività 3.1)*
Una piattaforma di bidding in tempo reale esegue un carico di lavoro NoSQL su EC2 che necessita della latenza di storage assolutamente più bassa per dati temporanei. I dati vengono rigenerati all'avvio e non devono sopravvivere allo stop o alla terminazione dell'istanza. Quale opzione di storage offre le prestazioni più elevate per questo caso d'uso?

A) Volume EBS io2 con 64.000 IOPS provisionate
B) Volumi instance store (NVMe SSD) su un'istanza ottimizzata per lo storage
C) Amazon EFS in modalità General Purpose
D) Volume EBS gp3 con throughput provisionato massimo

**Domanda 43** *(Dominio 3 — Attività 3.3)*
Un'azienda di gaming memorizza i dati delle sessioni dei giocatori in una tabella DynamoDB con la partition key `game_id`. Ci sono solo 12 giochi popolari, e la tabella sta sperimentando throttling su alcune partizioni mentre la capacità complessiva consumata è ben al di sotto di quella provisionata. Cosa dovrebbe raccomandare un solutions architect?

A) Passare la tabella alla capacità provisionata con auto scaling
B) Usare una partition key ad alta cardinalità, come una composita di game_id e player_id
C) Creare un indice secondario locale su player_id
D) Abilitare DynamoDB Streams per distribuire le scritture tra le partizioni

**Domanda 44** *(Dominio 3 — Attività 3.3)*
Un sito di e-commerce memorizza i dati del catalogo prodotti in DynamoDB. Il traffico di lettura è estremamente intenso con gli stessi articoli richiesti milioni di volte al giorno, e il team ha bisogno di latenza di lettura in microsecondi senza riscrivere le chiamate API DynamoDB dell'applicazione. Cosa dovrebbe raccomandare il solutions architect?

A) Distribuire Amazon ElastiCache for Redis e modificare l'applicazione per verificare prima la cache
B) Aggiungere DynamoDB Accelerator (DAX) davanti alla tabella
C) Creare un indice secondario globale per distribuire le letture
D) Abilitare DynamoDB Global Tables in una seconda region

**Domanda 45** *(Dominio 3 — Attività 3.3)*
Un'azienda logistica ha una tabella DynamoDB in produzione che necessita di un nuovo pattern di query: interrogare le spedizioni per `carrier_id` e ordinarle per `delivery_date`, con il proprio throughput provisionato in modo che le nuove query analytics non influenzino l'applicazione principale. La tabella esiste già e ha traffico live. Quale soluzione soddisfa questi requisiti?

A) Creare un indice secondario locale con carrier_id come sort key
B) Creare un indice secondario globale con carrier_id come partition key e delivery_date come sort key
C) Ricreare la tabella con una chiave primaria composita di carrier_id e delivery_date
D) Abilitare un DynamoDB Stream e interrogare il flusso per carrier_id

**Domanda 46** *(Dominio 3 — Attività 3.3)*
Un servizio di gestione delle sessioni memorizza le sessioni utente in DynamoDB. Le sessioni diventano inutili dopo 24 ore, e il team vuole che gli elementi scaduti vengano rimossi automaticamente senza costi aggiuntivi. Cosa dovrebbe implementare il solutions architect?

A) Una funzione Lambda pianificata che scansiona la tabella ogni ora ed elimina gli elementi vecchi
B) DynamoDB Time to Live (TTL) con un attributo timestamp di scadenza su ogni elemento
C) Una lifecycle policy sulla tabella DynamoDB
D) DynamoDB Streams con un filtro per scartare gli elementi più vecchi di 24 ore

**Domanda 47** *(Dominio 3 — Attività 3.3)*
Un'applicazione serverless usa funzioni Lambda che si connettono a un database Amazon RDS for MySQL. Durante i picchi di traffico, centinaia di invocazioni Lambda concorrenti esauriscono il limite di connessioni del database, causando errori. Quale soluzione affronta questo problema con la minima modifica all'applicazione?

A) Aumentare la dimensione dell'istanza RDS per alzare max_connections
B) Inserire Amazon RDS Proxy tra le funzioni Lambda e il database
C) Migrare il database a DynamoDB
D) Configurare la concorrenza riservata Lambda a 10

**Domanda 48** *(Dominio 3 — Attività 3.3)*
Un sito di notizie finanziarie usa Amazon Aurora MySQL. Il traffico di lettura aumenta di 20 volte durante gli orari di mercato e l'istanza primaria è limitata dalla CPU nel servire le query SELECT. Le scritture sono modeste. Qual è il modo PIÙ efficiente operativamente per scalare le letture?

A) Aggiungere Aurora Replica e indirizzare il traffico di lettura al reader endpoint del cluster con auto scaling
B) Creare uno standby Multi-AZ e inviare le letture allo standby
C) Suddividere il database su più cluster Aurora
D) Abilitare Aurora Backtrack per scaricare le letture

**Domanda 49** *(Dominio 3 — Attività 3.4)*
Un'azienda di giochi multiplayer gestisce un'applicazione sensibile alla latenza che usa il protocollo UDP su Network Load Balancer in due Region AWS. I giocatori in tutto il mondo hanno bisogno di indirizzi IP statici per l'allow-listing e un failover regionale rapido. Quale servizio dovrebbe scegliere il solutions architect?

A) Amazon CloudFront con due origin personalizzate
B) AWS Global Accelerator con endpoint group in entrambe le region
C) Amazon Route 53 con routing basato sulla latenza
D) Un Application Load Balancer con cross-zone load balancing

**Domanda 50** *(Dominio 3 — Attività 3.4)*
Un'azienda di streaming deve rispettare le regole di licenza dei contenuti: gli utenti in Germania devono essere sempre serviti dalla distribuzione eu-central-1, e gli utenti in Francia dalla distribuzione eu-west-3, indipendentemente da quale endpoint offra una latenza inferiore. Quale policy di routing Route 53 dovrebbe essere usata?

A) Routing basato sulla latenza
B) Routing per geolocalizzazione
C) Routing per geoproximity con un bias positivo su eu-central-1
D) Routing pesato con pesi 50/50

**Domanda 51** *(Dominio 3 — Attività 3.2)*
Un solutions architect sta distribuendo un carico di lavoro HPC strettamente accoppiato che usa MPI e richiede la latenza di rete più bassa possibile e le prestazioni più elevate in termini di pacchetti al secondo tra 32 istanze EC2. Quale strategia di placement dovrebbe essere usata?

A) Spread placement group su tre Availability Zone
B) Partition placement group con 7 partizioni
C) Cluster placement group in una singola Availability Zone
D) Avviare istanze in subnet separate con enhanced networking

**Domanda 52** *(Dominio 3 — Attività 3.5)*
Un'azienda IoT acquisisce dati di clickstream che devono essere consegnati ad Amazon S3 in tempo quasi reale per analytics. Il team vuole una soluzione completamente gestita senza applicazioni consumer da scrivere, nessuna gestione degli shard e buffering dei record integrato e conversione di formato in Parquet. Quale servizio dovrebbe usare?

A) Amazon Kinesis Data Streams con un consumer Lambda
B) Amazon Data Firehose (in precedenza Kinesis Data Firehose) con una destinazione S3
C) Amazon SQS con una flotta di poller EC2
D) Amazon MSK con un sink Kafka Connect personalizzato

**Domanda 53** *(Dominio 3 — Attività 3.5)*
Un'azienda memorizza i log applicativi come file JSON compressi in Amazon S3 e vuole che gli analisti eseguano query SQL ad hoc su di essi senza provisioning di server o caricamento dei dati in un database. Lo schema dovrebbe essere scoperto e catalogato automaticamente. Quale combinazione dovrebbe raccomandare il solutions architect?

A) Amazon Redshift con comandi COPY e aggiornamenti pianificati
B) AWS Glue crawler per popolare il Data Catalog e Amazon Athena per le query SQL
C) Amazon EMR con un cluster Presto a lunga esecuzione
D) Amazon RDS for PostgreSQL con l'estensione aws_s3

---

## Parte 4 — Progettare Architetture Ottimizzate per i Costi (Domande 54–65)

**Domanda 54** *(Dominio 4 — Attività 4.2)*
Un istituto di ricerca esegue simulazioni batch notturne su EC2 che richiedono circa 90 minuti, salvano i progressi su Amazon S3 ogni 5 minuti e possono essere riavviate dall'ultimo checkpoint in qualsiasi momento. L'istituto vuole il costo di compute più basso possibile. Quale opzione di acquisto dovrebbe raccomandare il solutions architect?

A) Istanze On-Demand in una singola AZ
B) Standard Reserved Instances con un termine di 3 anni
C) Spot Instance usando un Spot Fleet diversificato su più tipi di istanza e AZ
D) Un Compute Savings Plan dimensionato al picco del carico di lavoro batch

**Domanda 55** *(Dominio 4 — Attività 4.2)*
Un'azienda SaaS ha una spesa di compute di base stabile ma prevede di migrare i carichi di lavoro tra EC2, AWS Fargate e AWS Lambda nei prossimi tre anni man mano che si modernizza. Vuole uno sconto basato sull'impegno che si applichi automaticamente su tutti e tre i servizi di compute e in tutte le region. Quale opzione dovrebbe raccomandare il solutions architect?

A) EC2 Instance Savings Plan
B) Standard Reserved Instances
C) Compute Savings Plan
D) Convertible Reserved Instances

**Domanda 56** *(Dominio 4 — Attività 4.2)*
Un'azienda ha acquistato Standard Reserved Instance di 3 anni per Amazon RDS e Amazon EC2. Dopo una re-architettura, non ha più bisogno di nessuna delle due prenotazioni. Il team finanziario chiede quali prenotazioni possono essere vendute per recuperare i costi. Cosa dovrebbe dire loro il solutions architect?

A) Sia le Reserved Instance EC2 che quelle RDS possono essere vendute sul Reserved Instance Marketplace
B) Solo le Reserved Instance EC2 possono essere vendute sul Reserved Instance Marketplace; le RI RDS non possono essere rivendute
C) Solo le Reserved Instance RDS possono essere vendute, perché le prenotazioni di database sono trasferibili
D) Nessuna può essere venduta; le Reserved Instance sono non rimborsabili e non trasferibili in tutti i casi

**Domanda 57** *(Dominio 4 — Attività 4.2)*
Un team di sviluppo esegue l'elaborazione dati fault-tolerant su container su Amazon ECS con capacità Spot EC2. Hanno bisogno che i worker si scarichino correttamente e salvino i progressi prima del recupero dell'istanza. Quanto anticipo fornisce AWS prima che un'istanza Spot venga interrotta?

A) Non viene fornito alcun avviso
B) Un avviso di interruzione di 2 minuti
C) Un avviso di interruzione di 15 minuti
D) Una finestra di ribilanciamento di 24 ore

**Domanda 58** *(Dominio 4 — Attività 4.1)*
Un archivio sanitario memorizza i record di conformità in Amazon S3 che sono raramente accessibili ma, quando richiesti in un procedimento legale, devono essere recuperabili entro 5 minuti. I record sono conservati per 7 anni e il costo di storage deve essere minimizzato. Quale classe di storage soddisfa questi requisiti?

A) S3 Glacier Deep Archive con recupero Standard
B) S3 Glacier Flexible Retrieval con recuperi Expedited quando necessario
C) S3 Glacier Flexible Retrieval con recuperi Bulk
D) S3 Standard-IA

**Domanda 59** *(Dominio 4 — Attività 4.1)*
Una startup di condivisione foto memorizza immagini in miniatura facilmente riproducibili che vengono accessate raramente. Il team vuole l'opzione a infrequent access meno costosa e accetta che la perdita di una singola Availability Zone possa richiedere la rigenerazione delle miniature dagli originali. Quale classe di storage dovrebbe essere usata?

A) S3 Standard-IA
B) S3 One Zone-IA
C) S3 Intelligent-Tiering
D) S3 Glacier Instant Retrieval

**Domanda 60** *(Dominio 4 — Attività 4.1)*
Un'azienda ha un bucket S3 con milioni di oggetti i cui pattern di accesso sono sconosciuti e cambiano in modo imprevedibile. Un solutions architect sta valutando S3 Intelligent-Tiering. Quali DUE affermazioni su Intelligent-Tiering sono accurate? (Scegline DUE.)

A) Addebita una piccola tariffa di monitoraggio e automazione per oggetto per gli oggetti che monitora
B) Addebita tariffe di recupero ogni volta che un oggetto ritorna al tier Frequent Access
C) Gli oggetti più piccoli di 128 KB non vengono monitorati o inseriti automaticamente in tier e vengono fatturati alla tariffa del tier Frequent Access
D) Replica automaticamente gli oggetti in una seconda region
E) Richiede una durata minima di storage di 90 giorni per ogni oggetto

**Domanda 61** *(Dominio 4 — Attività 4.1)*
Un team analytics interrompe frequentemente caricamenti multipart di grandi dimensioni in un bucket S3 data lake, e AWS Cost Explorer mostra addebiti di storage in crescita anche se il conteggio visibile degli oggetti nel bucket è stabile. Qual è la correzione PIÙ conveniente?

A) Abilitare S3 Versioning per tracciare le parti orfane
B) Aggiungere una lifecycle rule che interrompa i caricamenti multipart incompleti dopo un determinato numero di giorni
C) Migrare il bucket a S3 One Zone-IA
D) Attivare S3 Transfer Acceleration per completare i caricamenti più rapidamente

**Domanda 62** *(Dominio 4 — Attività 4.1)*
La flotta EC2 di un'azienda usa centinaia di volumi EBS gp2 dimensionati in modo ampio solo per ottenere IOPS di base. Le revisioni di utilizzo mostrano che le IOPS sono necessarie ma gran parte della capacità non lo è. Cosa dovrebbe fare il solutions architect per ridurre il costo dello storage senza perdere prestazioni?

A) Migrare i volumi a io2 e provisionare le stesse IOPS
B) Migrare i volumi a gp3, ridimensionare la capacità e provisionare le IOPS indipendentemente
C) Convertire i volumi in st1 throughput-optimized HDD
D) Fare uno snapshot dei volumi quotidianamente ed eliminare gli originali

**Domanda 63** *(Dominio 4 — Attività 4.4)*
Una pipeline dati in subnet private trasferisce 60 TB al mese da istanze EC2 ad Amazon S3 nella stessa region attraverso un NAT gateway, generando grandi addebiti di elaborazione dati. Qual è la modifica PIÙ conveniente?

A) Sostituire il NAT gateway con un'istanza NAT su una grande istanza EC2
B) Creare un gateway VPC endpoint per S3 e instradare il traffico attraverso di esso
C) Creare un interface VPC endpoint (PrivateLink) per S3
D) Spostare le istanze EC2 in subnet pubbliche con indirizzi IPv4 pubblici

**Domanda 64** *(Dominio 4 — Attività 4.4)*
La fattura mensile di una startup mostra addebiti inaspettati per gli indirizzi IPv4 pubblici in uso su decine di istanze EC2 che chiamano solo altri servizi AWS all'interno del VPC. Il team finanziario vuole anche avvisi prima che la spesa complessiva del mese successivo superi una soglia. Quale combinazione di azioni dovrebbe intraprendere il solutions architect? (Scegline DUE.)

A) Sostituire gli IPv4 pubblici con Elastic IP su ogni istanza, che sono sempre gratuiti quando collegati
B) Rimuovere gli indirizzi IPv4 pubblici e usare la connettività privata (VPC endpoint/NAT se necessario), poiché AWS addebita gli indirizzi IPv4 pubblici in uso
C) Usare AWS Compute Optimizer per bloccare la spesa sopra la soglia
D) Abilitare AWS Shield Advanced per limitare la spesa mensile
E) Creare un budget di costo AWS Budgets con una soglia di avviso e notifica e-mail

**Domanda 65** *(Dominio 4 — Attività 4.3)*
Un ambiente di sviluppo usa un cluster Amazon Aurora PostgreSQL che è inattivo notti e weekend ma deve riattivarsi automaticamente quando gli sviluppatori si connettono, senza intervento manuale o ridimensionamento delle istanze. Il costo dovrebbe scendere a quasi zero per il compute quando inattivo. Quale soluzione soddisfa questi requisiti?

A) Aurora Serverless v2 configurato con una capacità minima di 0 ACU in modo che si auto-metta in pausa quando inattivo
B) Un cluster Aurora provisionato fermato da una funzione Lambda pianificata ogni notte
C) Un database globale Aurora con un cluster secondario headless
D) Aurora provisionato con due istanze reader scalate in ingresso di notte

---

## Chiave delle Risposte

### Parte 1 — Domande 1–20

**1. Risposta: B** — Le SCP non si applicano mai all'account di gestione dell'organizzazione, quindi i suoi principal non sono influenzati dalle restrizioni di Region. *Perché non le altre:* A — le SCP si ereditano attraverso le OU annidate; C — gli Allow IAM non possono sovrascrivere un Deny SCP negli account membro; D — le SCP si applicano immediatamente a tutti gli account attuali e futuri sotto il punto di allegazione.

**2. Risposta: C** — Un permissions boundary applicato come condizione sulle azioni di creazione del ruolo limita le autorizzazioni massime di qualsiasi ruolo creato dagli sviluppatori, prevenendo l'escalation dei privilegi mantenendo l'autonomia. *Perché non le altre:* A — la revisione manuale aggiunge overhead operativo e rimuove l'autonomia; B — negare iam:CreateRole blocca il flusso di lavoro legittimo; D — gli avvisi CloudTrail sono di tipo detective, non preventivi.

**3. Risposta: B** — Un ExternalId definito dal cliente e validato nella condizione della trust policy garantisce che il provider SaaS assuma il ruolo solo per conto del cliente corretto, mitigando il problema del confused deputy. *Perché non le altre:* A — l'MFA è poco pratica per l'assunzione automatica servizio-a-servizio e non affronta la confusione del deputy; C — cifrare un ARN (che non è segreto) non risolve nulla; D — le chiavi utente IAM di lunga durata sono meno sicure dei ruoli.

**4. Risposta: B** — IAM Identity Center si federa una volta con Entra ID e assegna centralmente i permission set su tutti gli account dell'organizzazione tramite un unico portale di accesso. *Perché non le altre:* A — gli utenti IAM per account sono esattamente l'overhead da evitare; C — Cognito è per le identità applicative (clienti), non per l'accesso della forza lavoro agli account AWS; D — la configurazione SAML manuale per account funziona ma ha un overhead operativo molto più elevato.

**5. Risposta: A** — I user pool gestiscono l'autenticazione (accesso e-mail/social); gli identity pool scambiano i token risultanti con credenziali AWS temporanee con scope di ruoli IAM per accedere a S3. *Perché non le altre:* B — inverte lo scopo dei due servizi; C — IAM Identity Center è per gli utenti della forza lavoro, non per i clienti delle app; D — i token del user pool (JWT) non concedono di per sé l'accesso ai servizi AWS.

**6. Risposta: B** — Una chiave gestita dal cliente offre il controllo completo della key policy, il logging dell'utilizzo e la disabilitazione, e supporta la rotazione automatica (annuale per impostazione predefinita). *Perché non le altre:* A — le chiavi gestite da AWS non consentono di modificare la key policy o disabilitare la chiave; C — le chiavi di proprietà di AWS sono completamente invisibili al cliente; D — il materiale chiave importato (BYOK) non supporta la rotazione automatica.

**7. Risposta: B** — Cifratura a busta: KMS genera una data key; i dati vengono cifrati localmente con la data key in chiaro, che viene scartata, mentre la copia cifrata da KMS della data key viene memorizzata insieme al ciphertext. *Perché non le altre:* A e C — KMS non cifra mai payload di grandi dimensioni direttamente o in streaming; D — le chiavi hardcoded sono un anti-pattern e non costituiscono cifratura a busta.

**8. Risposta: C** — La strategia ad alternanza di utenti di Secrets Manager mantiene due credenziali e le ruota a turno, in modo che le connessioni esistenti che usano la credenziale precedente continuino a funzionare durante la rotazione. *Perché non le altre:* A — Parameter Store non ha rotazione integrata; dovresti costruirla tutta da zero; B — la rotazione a utente singolo invalida immediatamente la vecchia password, rischiando errori di connessione; D — la rotazione delle chiavi KMS ruota il materiale della chiave crittografica, non le password del database.

**9. Risposta: C** — SSE-C consente al cliente di fornire la chiave di cifratura con ogni richiesta; AWS la usa in memoria per l'operazione e non la memorizza mai. *Perché non le altre:* A — le chiavi SSE-S3 sono completamente gestite da AWS; B — le chiavi SSE-KMS sono memorizzate in AWS KMS; D — aws/s3 è una chiave KMS gestita da AWS e non è affatto lato client.

**10. Risposta: B** — La modalità compliance di Object Lock impedisce l'eliminazione o la sovrascrittura da parte di qualsiasi utente, incluso root, fino alla scadenza della conservazione, e Object Lock richiede il versioning. *Perché non le altre:* A — la modalità governance può essere aggirata dagli utenti con s3:BypassGovernanceRetention; C — una bucket policy può essere modificata o rimossa dall'utente root; D — la scadenza del ciclo di vita non impedisce l'eliminazione durante il periodo.

**11. Risposta: B** — Le NACL sono stateless, quindi il traffico di risposta verso le porte efimere di origine dei client deve essere esplicitamente consentito in uscita. *Perché non le altre:* A — le NACL sono stateless, non stateful; C — i security group sono stateful, quindi il traffico di ritorno è automatico; D — 0.0.0.0/0 è perfettamente valido nelle regole NACL.

**12. Risposta: A, B** — I security group sono stateful (traffico di ritorno auto-consentito) e le NACL elaborano le regole numerate in ordine e supportano il Deny. *Perché non le altre:* C — i security group supportano solo regole Allow; D — le NACL sono collegate alle subnet, non alle ENI (i security group sono collegati alle ENI); E — le regole dei security group vengono tutte valutate insieme senza un ordinamento.

**13. Risposta: B** — Shield Advanced fornisce lo Shield Response Team, la protezione dei costi DDoS e la visibilità/diagnostica degli attacchi per le risorse protette come CloudFront e ALB. *Perché non le altre:* A — Shield Standard è automatico ma non include l'accesso all'SRT né la protezione dei costi; C — WAF affronta i pattern di richieste a livello 7, non l'insieme completo dei requisiti; D — GuardDuty è il rilevamento delle minacce, non la protezione DDoS.

**14. Risposta: B** — AWS WAF sull'ALB con il gruppo di regole gestite SQLi più una regola basata sulla frequenza blocca entrambi i pattern di attacco senza modifiche al codice applicativo. *Perché non le altre:* A — elevato sforzo di sviluppo; C — Shield Standard copre i flood L3/L4, non l'SQL injection; D — i security group non possono ispezionare il contenuto delle richieste.

**15. Risposta: B** — GuardDuty = rilevamento delle minacce da log e intelligence sulle minacce; Macie = scoperta di dati sensibili (PII) in S3; Inspector = scansione delle vulnerabilità (CVE) di EC2, immagini ECR e Lambda. *Perché non le altre:* A, C, D — ciascuna mescola almeno due delle mappature servizio-scopo.

**16. Risposta: B** — I gateway endpoint esistono esattamente per S3 e DynamoDB, mantengono il traffico sulla rete AWS e non hanno addebiti orari o per l'elaborazione dei dati. *Perché non le altre:* A — il NAT gateway instrada tramite spazio IP pubblico e costa per ora/per GB; C — gli interface endpoint generano addebiti orari e per i dati, quindi non sono il costo più basso; D — un internet gateway invia il traffico su internet pubblico.

**17. Risposta: A** — IMDSv2 richiede un token di sessione ottenuto tramite una richiesta PUT, che i tipici vettori SSRF non possono eseguire; l'applicazione di HttpTokens=required blocca il furto di credenziali IMDSv1. *Perché non le altre:* B — molti agenti e SDK hanno legittimamente bisogno di IMDS; C — le NACL non influenzano il traffico link-local tra un'istanza e il proprio endpoint di metadati; D — le credenziali statiche nei file sono molto peggio delle credenziali del ruolo.

**18. Risposta: C** — I parametri standard di Parameter Store sono gratuiti e adatti per la configurazione in chiaro; Secrets Manager aggiunge la rotazione integrata solo per le 5 password, minimizzando i costi. *Perché non le altre:* A — pagare il prezzo per segreto di Secrets Manager per 200 valori di configurazione semplici è uno spreco; B — Parameter Store da solo non ha rotazione nativa per le password; D — Parameter Store non ha rotazione automatica integrata, quindi questa opzione afferma una capacità che non esiste.

**19. Risposta: B** — S3 Bucket Keys consente a S3 di generare una chiave dati di livello bucket a tempo limitato dalla chiave KMS, riducendo drasticamente le richieste KMS per oggetto (e i costi) pur rimanendo SSE-KMS. *Perché non le altre:* A — SSE-S3 abbandona il requisito KMS; C — la frequenza di rotazione non influisce sul volume delle API per richiesta; D — il materiale chiave importato non cambia il conteggio delle richieste.

**20. Risposta: B, D** — Il Deny esplicito vince sempre su qualsiasi Allow nella valutazione delle policy, e i permissions boundary solo limitano (non concedono mai) le autorizzazioni. *Perché non le altre:* A — le SCP sono guardrail che limitano le autorizzazioni disponibili; non concedono nulla; C — le policy basate su risorse concedono routinariamente accesso cross-account da sole; E — IAM predefinisce al deny implicito quando nulla consente un'azione.

### Parte 2 — Domande 21–37

**21. Risposta: C** — Multi-AZ fornisce failover automatico per i guasti AZ; le read replica assorbono il traffico di lettura di reportistica — due funzionalità per due problemi distinti. *Perché non le altre:* A — uno standby Multi-AZ tradizionale non può servire letture; B — la promozione della replica è manuale (o scriptata) e le sole repliche non forniscono failover HA automatico; D — un'istanza più grande a singola AZ non soddisfa nessuno dei due requisiti di resilienza AZ.

**22. Risposta: B** — Una distribuzione Multi-AZ DB cluster esegue un writer e due standby leggibili su tre AZ, con un reader endpoint, in modo che la capacità standby serva le letture supportando comunque il failover automatico rapido. *Perché non le altre:* A — lo standby singolo in una distribuzione instance non serve traffico; C — le read replica non forniscono failover automatico gestito e i database RDS non vengono bilanciati tramite ALB; D — Single-AZ non ha failover.

**23. Risposta: B** — La replica di Aurora Global Database è asincrona a livello di storage con un ritardo tipico sub-secondo, quindi l'RPO cross-Region è vicino a zero ma non può mai essere garantito esattamente 0. *Perché non le altre:* A — la replica non è sincrona tra le Region; C — il write forwarding instrada le scritture verso il primario; non cambia la semantica della replica; D — il ritardo di replica è tipicamente inferiore a un secondo, non una pianificazione di 5 minuti.

**24. Risposta: B** — Il Recovery Time Objective è il tempo di inattività massimo tollerabile (4 ore); il Recovery Point Objective è la finestra massima tollerabile di perdita di dati (15 minuti). *Perché non le altre:* A — inverte le definizioni; C — MTBF/MTTR sono statistiche di affidabilità, non obiettivi DR; D — l'SLA è un impegno contrattuale, non una metrica di perdita di dati.

**25. Risposta: B** — Pilot light mantiene i dati replicati continuamente e le risorse core predisposte ma spente, ottenendo un RTO di decine di minuti a basso costo — una corrispondenza esatta. *Perché non le altre:* A — backup and restore non ha replica live e ha un RTO molto più lungo; C — warm standby mantiene lo stack in esecuzione, costando più del necessario; D — active/active è il più costoso e supera di gran lunga il requisito.

**26. Risposta: C, E** — Warm standby è una copia ridotta ma sempre in esecuzione dell'intero sistema; multi-site active/active serve da più Region con RTO vicino a zero al costo più elevato. *Perché non le altre:* A — backup and restore è definito dal fatto di non pre-eseguire le risorse; B — backup and restore ha il peggiore (più alto) RTO; D — pilot light è predisposto-ma-spento, non a piena capacità che serve traffico.

**27. Risposta: B** — Quando il visibility timeout di 30 secondi scade a metà elaborazione, il messaggio riappare e un altro consumer lo elabora di nuovo; imposta il visibility timeout più lungo del tempo massimo di elaborazione (es. 6× come best practice). *Perché non le altre:* A — FIFO vs. standard non è la causa; C — il long polling influisce sull'efficienza delle ricezioni vuote, non i duplicati; D — il periodo di conservazione governa quanto a lungo i messaggi persistono, non la riconsegna.

**28. Risposta: A** — Una redrive policy con maxReceiveCount sposta i messaggi che falliscono ripetutamente ("poison pill") in una dead-letter queue per l'analisi offline, fermando il ciclo infinito di retry. *Perché non le altre:* B — un visibility timeout più breve fa girare il ciclo più velocemente; C — FIFO non scarta i messaggi malformati; D — una conservazione di 1 minuto farebbe scadere anche i messaggi validi.

**29. Risposta: B** — Le code FIFO garantiscono l'elaborazione esattamente-una-volta e l'ordinamento stretto all'interno di un MessageGroupId; usando l'ID account come ID di gruppo si ottiene l'ordinamento per account con parallelismo tra account (e la modalità FIFO ad alto throughput può scalare ulteriormente). *Perché non le altre:* A — le code standard non possono garantire l'ordine né l'esattamente-una-volta; C — SNS non fornisce garanzie di ordinamento né di esattamente-una-volta per questo pattern; D — un singolo ID di gruppo serializza tutto, distruggendo il throughput.

**30. Risposta: B** — Il fan-out SNS-to-SQS consegna ogni evento a ciascuna coda, dove ogni consumer ottiene un buffer durevole e un ritmo di elaborazione indipendente. *Perché non le altre:* A — tre consumer su una coda dividono i messaggi; ogni messaggio va a un solo consumer; C — l'invocazione sequenziale non è elaborazione parallela indipendente con buffer; D — le sottoscrizioni e-mail vengono consegnate agli esseri umani, non a buffer applicativi durevoli.

**31. Risposta: B** — La concorrenza riservata assegna concorrenza dedicata alle funzioni critiche (e limitare la funzione della vendita ne limita il raggio d'azione), impedendo a una funzione di esaurire il pool condiviso dell'account. *Perché non le altre:* A — un timeout più lungo mantiene gli slot di concorrenza più a lungo, peggiorando il throttling; C — la concorrenza provisionata pre-scalda gli ambienti ma non aumenta la quota di concorrenza dell'account; D — la dimensione della memoria non influisce sui limiti di concorrenza.

**32. Risposta: B** — I flussi di lavoro Standard vengono eseguiti fino a un anno e il pattern di callback waitForTaskToken mette in pausa l'esecuzione senza costi di compute fino a quando SendTaskSuccess/SendTaskFailure non restituisce il token. *Perché non le altre:* A — i flussi di lavoro Express hanno una durata massima di 5 minuti; C — Lambda può girare al massimo 15 minuti e aspettare spreca denaro; D — le pianificazioni EventBridge possono attivare eventi ma non possono mettere in pausa e riprendere lo stato del flusso di lavoro.

**33. Risposta: A** — I flussi di lavoro Express sono costruiti per esecuzioni ad alta frequenza, breve durata, almeno-una-volta a costo inferiore; i flussi di lavoro Standard forniscono la semantica esattamente-una-volta, fino a un anno di durata e la cronologia completa delle esecuzioni per il lavoro di riconciliazione. *Perché non le altre:* B — Standard non può sostenere economicamente 90.000 avvii/secondo per questo caso d'uso; C — Express ha una durata massima di 5 minuti ed è almeno-una-volta, fallendo il lavoro di 12 ore esattamente-una-volta; D — le assegnazioni invertite falliscono entrambi i carichi di lavoro.

**34. Risposta: B** — Il routing di failover invia tutto il traffico al primario mentre il suo health check passa, poi risponde automaticamente con il record secondario quando fallisce. *Perché non le altre:* A — il routing pesato 50/50 invia metà del traffico alla copia passiva tutto il tempo; C — il routing basato sulla latenza divide il traffico per prestazioni, non per intento attivo/passivo; D — il routing per geolocalizzazione instrada in base alla posizione dell'utente, non correlato al failover basato sull'integrità degli endpoint.

**35. Risposta: B** — Aggiungere il tipo di health check ELB fa sì che l'ASG tratti i guasti agli health check del target ALB come non integri, in modo che le istanze con app bloccate vengano terminate e sostituite anche se i controlli di stato EC2 passano. *Perché non le altre:* A — il monitoraggio dettagliato cambia solo la granularità delle metriche; C — il grace period ritarda la valutazione degli health check, il contrario di ciò che serve; D — il tipo di load balancer non è il problema.

**36. Risposta: B** — Network Load Balancer opera a livello 4 (TCP/UDP), gestisce milioni di richieste al secondo con latenza ultra-bassa e supporta un IP statico (o Elastic) per AZ. *Perché non le altre:* A — ALB è a livello 7 (HTTP/HTTPS) e non offre IP statici nativamente; C — Gateway Load Balancer è per la distribuzione di appliance virtuali inline; D — Classic Load Balancer è legacy e non soddisfa nessuno dei requisiti.

**37. Risposta: B, C** — CRR richiede il versioning abilitato su entrambi i bucket, e le classi EFS Standard sono file system regionali (multi-AZ) montabili contemporaneamente tra AZ. *Perché non le altre:* A — CRR replica solo i nuovi oggetti dopo la configurazione a meno che non si esegua S3 Batch Replication per quelli esistenti; D — EFS supporta migliaia di client NFS concorrenti, a differenza di EBS a collegamento singolo; E — il versioning è un prerequisito per la replica ma non replica nulla di per sé.

### Parte 3 — Domande 38–53

**38. Risposta: B** — io2 Block Express fornisce fino a 256.000 IOPS, latenza sub-millisecondo e durabilità del 99,999%, soddisfacendo tutti e tre i requisiti. *Perché non le altre:* A — gp3 può ora raggiungere il numero di IOPS (il suo limite è stato alzato a 80.000 a fine 2025), ma non soddisfa gli altri due requisiti: la durabilità è del 99,8–99,9% (la domanda richiede il 99,999%) e la sua latenza è di pochi millisecondi, non garantita sub-millisecondo; B è l'unico tipo che soddisfa tutti e tre; C — st1 è basato su HDD e inadatto ai database IOPS-intensive; D — gp2 ha un massimo di 16.000 IOPS e il bursting non è una garanzia sostenuta.

**39. Risposta: C** — FSx for Lustre è progettato specificamente per HPC con latenza sub-millisecondo, throughput di centinaia di GB/s e integrazione nativa con S3 (lazy-loading ed esportazione). *Perché non le altre:* A — EFS non può eguagliare il profilo di throughput/latenza HPC di Lustre; B — FSx for Windows è destinato ai carichi di lavoro SMB/Windows, non all'HPC Linux; D — Mountpoint per S3 non fornisce la semantica del file system POSIX condiviso né la latenza richiesta.

**40. Risposta: B** — FSx for Windows File Server supporta nativamente SMB, l'integrazione con Active Directory e le ACL NTFS, e la modalità Multi-AZ copre il requisito delle due AZ. *Perché non le altre:* A — EFS è NFS/POSIX e non preserva le autorizzazioni NTFS; C — S3 è object storage, non una condivisione file SMB; D — Lustre è un file system HPC Linux senza supporto SMB/AD.

**41. Risposta: D, E** — Transfer Acceleration instrada i caricamenti sulla rete edge/backbone AWS per velocizzare i trasferimenti a lunga distanza, e il caricamento multipart parallelizza i trasferimenti e consente di ritentare le parti fallite senza riavviare l'intero file da 40 GB. *Perché non le altre:* A — One Zone-IA cambia la ridondanza, non le prestazioni di caricamento; B — non è possibile mettere un ALB davanti a S3 per i caricamenti; C — CRR replica dopo il caricamento e non aiuta l'acquisizione.

**42. Risposta: B** — Gli NVMe SSD instance store sono fisicamente collegati all'host, offrendo la latenza più bassa per i dati efimeri che possono essere rigenerati. *Perché non le altre:* A e D — EBS attraversa la rete e aggiunge latenza; C — EFS è un file system di rete con latenza più elevata di entrambi.

**43. Risposta: B** — Il throttling su partizioni calde con bassa utilizzo complessivo è il classico problema della partition key a bassa cardinalità; una chiave ad alta cardinalità (es. game_id#player_id) distribuisce il traffico in modo uniforme. *Perché non le altre:* A — cambiare la modalità di capacità non risolve le partizioni calde; C — un LSI condivide la stessa partition key e le stesse partizioni calde; D — Streams cattura le modifiche, non ridistribuisce le scritture.

**44. Risposta: B** — DAX è una cache in-memory compatibile con DynamoDB e trasparente all'API che fornisce letture in microsecondi con minime modifiche al codice. *Perché non le altre:* A — ElastiCache richiede riscritture dell'applicazione per gestire la cache; C — un GSI non memorizza nella cache gli elementi caldi né fornisce latenza in microsecondi; D — Global Tables affronta l'accesso multi-region, non la latenza di lettura di un singolo elemento.

**45. Risposta: B** — Un GSI può essere aggiunto a una tabella esistente in qualsiasi momento, supporta una nuova combinazione partition/sort key e ha il proprio throughput provisionato isolato dalla tabella base. *Perché non le altre:* A — gli LSI possono essere creati solo alla creazione della tabella, condividono la partition key della tabella e condividono il throughput della tabella; C — ricreare la tabella è dirompente e non necessario; D — Streams serve per la cattura delle modifiche, non per le query ad hoc.

**46. Risposta: B** — DynamoDB TTL elimina automaticamente gli elementi scaduti in background senza costi aggiuntivi. *Perché non le altre:* A — le scansioni pianificate consumano capacità di lettura/scrittura e costano denaro; C — le lifecycle policy sono un concetto S3/EFS, non DynamoDB; D — Streams filtra gli eventi a valle ma non elimina gli elementi dalla tabella.

**47. Risposta: B** — RDS Proxy raggruppa e moltiplica le connessioni, consentendo a migliaia di invocazioni Lambda di condividere un piccolo insieme di connessioni al database con solo una modifica alla stringa di connessione. *Perché non le altre:* A — l'aumento dell'istanza è costoso e posticipa solo il limite; C — la migrazione del database è una modifica applicativa importante; D — limitare Lambda a 10 penalizza il throughput invece di risolvere la gestione delle connessioni.

**48. Risposta: A** — Le Aurora Replica (fino a 15) dietro il reader endpoint con auto scaling delle repliche scaricano il traffico di lettura con il minimo sforzo operativo. *Perché non le altre:* B — Aurora non usa un modello standby passivo; gli standby nel senso classico di RDS non servono traffico; C — lo sharding ha un alto overhead operativo per un problema di scalabilità delle letture; D — Backtrack riavvolge il database nel tempo, non serve letture.

**49. Risposta: B** — Global Accelerator fornisce due IP anycast statici, supporta UDP, si pone davanti agli NLB in più region e fa il failover in secondi sulla backbone AWS. *Perché non le altre:* A — CloudFront serve contenuti HTTP/HTTPS, non UDP arbitrario, e non ha IP statici rivolti ai client; C — il routing di latenza di Route 53 dipende dai TTL DNS per il failover e non fornisce IP statici; D — un ALB è regionale e solo HTTP.

**50. Risposta: B** — Il routing per geolocalizzazione risponde alle query DNS in base al paese dell'utente, applicando in modo deterministico Germany→eu-central-1 e France→eu-west-3 per la conformità alle licenze. *Perché non le altre:* A — il routing di latenza sceglie l'endpoint più veloce, che potrebbe violare la regola di licenza; C — il bias di geoproximity sposta i confini per distanza ma non garantisce la mappatura rigorosa per paese; D — il routing pesato distribuisce casualmente in base al peso, ignorando la posizione.

**51. Risposta: C** — Un cluster placement group raggruppa le istanze vicine in una singola AZ per la latenza più bassa e il massimo numero di pacchetti al secondo, ideale per i carichi di lavoro MPI strettamente accoppiati. *Perché non le altre:* A — i gruppi spread separano le istanze su hardware distinto, aumentando la latenza, e hanno un limite di 7 per AZ; B — i gruppi partition isolano i domini di errore per i sistemi distribuiti di dati, non per MPI a bassa latenza; D — le subnet separate non fanno nulla per co-locare le istanze.

**52. Risposta: B** — Amazon Data Firehose è completamente gestito, non richiede consumer o gestione degli shard, bufferizza i record e può convertire JSON in Parquet prima di consegnarlo a S3. *Perché non le altre:* A — Kinesis Data Streams richiede la scrittura/gestione dei consumer; C — SQS più poller EC2 è un'infrastruttura personalizzata da costruire e gestire; D — MSK richiede la gestione di cluster Kafka e connettori.

**53. Risposta: B** — I Glue crawler deducono lo schema nel Data Catalog e Athena esegue SQL serverless direttamente sui file S3. *Perché non le altre:* A — Redshift richiede il provisioning del cluster e il caricamento dei dati; C — EMR significa gestire un cluster a lunga esecuzione; D — RDS richiederebbe il caricamento dei dati in un server di database.

### Parte 4 — Domande 54–65

**54. Risposta: C** — I lavori batch con checkpoint e riavviabili sono il carico di lavoro Spot ideale, e uno Spot Fleet diversificato su tipi di istanza/AZ minimizza l'impatto delle interruzioni con risparmi fino a circa il 90%. *Perché non le altre:* A — On-Demand rinuncia allo sconto senza benefici in questo caso; B e D — gli impegni danno sconti minori rispetto a Spot e bloccano la spesa per un lavoro compatibile con le interruzioni.

**55. Risposta: C** — I Compute Savings Plan si applicano automaticamente su EC2 (qualsiasi famiglia/region), Fargate e Lambda, adattandosi al percorso di modernizzazione. *Perché non le altre:* A — gli EC2 Instance Savings Plan sono bloccati a una famiglia di istanze in una region ed escludono Fargate/Lambda; B e D — le Reserved Instance coprono solo EC2 e non si applicano a Fargate o Lambda.

**56. Risposta: B** — Solo le Standard Reserved Instance EC2 possono essere elencate sul Reserved Instance Marketplace; le RI RDS (e di altri servizi) non possono essere rivendute. *Perché non le altre:* A e C — le RI RDS non sono idonee al marketplace; D — le Standard RI EC2 sono di fatto vendibili sul marketplace.

**57. Risposta: B** — AWS fornisce un avviso di interruzione Spot di due minuti prima di recuperare l'istanza, dando tempo di scaricarsi e salvare i progressi. *Perché non le altre:* A — un avviso viene fornito; C e D — 15 minuti e 24 ore non sono finestre di interruzione Spot (le raccomandazioni di ribilanciamento possono arrivare prima ma non costituiscono una finestra fissa garantita).

**58. Risposta: B** — Glacier Flexible Retrieval offre un costo di storage di archiviazione basso e recuperi Expedited che restituiscono i dati in 1–5 minuti (circa $0,03/GB), soddisfacendo il requisito dei 5 minuti. *Perché non le altre:* A — il recupero più rapido di Deep Archive è di circa 12 ore; C — i recuperi Bulk richiedono 5–12 ore; D — Standard-IA recupera istantaneamente ma costa molto di più per lo storage raramente accessibile di 7 anni.

**59. Risposta: B** — One Zone-IA costa circa il 20% in meno rispetto a Standard-IA e il compromesso sulla durabilità a singola AZ è accettabile per le miniature riproducibili. *Perché non le altre:* A — Standard-IA costa di più per la ridondanza che i dati non richiedono; C — Intelligent-Tiering aggiunge tariffe di monitoraggio e non minimizza i costi per l'accesso noto-infrequente; D — Glacier Instant Retrieval ha un minimo di 90 giorni e un profilo di costo di recupero diverso per questo pattern.

**60. Risposta: A, C** — Intelligent-Tiering addebita una piccola tariffa di monitoraggio/automazione per oggetto, e gli oggetti sotto 128 KB vengono memorizzati ma non monitorati o inseriti in tier (fatturati alle tariffe Frequent Access). *Perché non le altre:* B — Intelligent-Tiering non ha tariffe di recupero tra i suoi tier automatici; D — non replica mai cross-region; E — non esiste un minimo di 90 giorni per ogni oggetto nella classe.

**61. Risposta: B** — Le parti di caricamento multipart incompleto vengono fatturate come storage ma sono invisibili come oggetti; una lifecycle rule con AbortIncompleteMultipartUpload le elimina automaticamente. *Perché non le altre:* A — il versioning aumenterebbe lo storage, non pulirebbe le parti; C — cambiare la classe di storage non rimuove le parti orfane; D — Transfer Acceleration velocizza i trasferimenti ma non pulisce i caricamenti già abbandonati.

**62. Risposta: B** — gp3 disaccoppia IOPS/throughput dalla dimensione e costa circa il 20% in meno per GB rispetto a gp2, quindi la capacità può essere ridimensionata mantenendo le IOPS necessarie; la migrazione è un'operazione ModifyVolume online. *Perché non le altre:* A — io2 è più costoso, non meno; C — st1 non può fornire le IOPS richieste; D — eliminare i volumi distrugge i dati live.

**63. Risposta: B** — Un gateway VPC endpoint per S3 è gratuito ed elimina gli addebiti di elaborazione dati del NAT gateway per il traffico S3 nella stessa region. *Perché non le altre:* A — un'istanza NAT comporta ancora costi EC2 e operativi; C — gli interface endpoint fatturano per ora e per GB, costando di più rispetto al gateway endpoint gratuito; D — le subnet pubbliche aggiungono addebiti IPv4 pubblici e indeboliscono la sicurezza.

**64. Risposta: B, E** — AWS addebita ogni indirizzo IPv4 pubblico in uso, quindi rimuovere quelli non necessari riduce i costi, e AWS Budgets fornisce avvisi proattivi sulle soglie di spesa prevista/effettiva. *Perché non le altre:* A — gli Elastic IP vengono anch'essi fatturati nell'ambito dell'addebito IPv4 pubblico anche quando collegati; C — Compute Optimizer raccomanda il right-sizing ma non può bloccare o avvisare sulle soglie di spesa; D — Shield Advanced è un servizio DDoS che aggiunge costi.

**65. Risposta: A** — Aurora Serverless v2 supporta la scalabilità a 0 ACU (auto-pausa, disponibile dalla fine del 2024) e riprende automaticamente alla connessione, eliminando il costo di compute mentre è inattivo senza passaggi manuali. Sfumature da conoscere: l'auto-pausa richiede versioni recenti del motore (Aurora PostgreSQL 13.15+/14.12+/15.7+/16.3+, Aurora MySQL 3.08+); la prima connessione dopo una pausa richiede circa 15 secondi per riprendere (più a lungo dopo 24+ ore in pausa); lo storage continua a essere fatturato mentre il compute è in pausa; e qualsiasi cosa che tenga aperte le connessioni — un RDS Proxy, un health check keep-alive — impedisce completamente la pausa. *Perché non le altre:* B — un cluster provisionato fermato non si riattiva automaticamente quando gli sviluppatori si connettono (e si riavvia dopo 7 giorni); C — i secondari globali headless del database globale riguardano il DR, non i costi inattivi; D — le reader scalate in ingresso lasciano comunque l'istanza writer in esecuzione e fatturante.

---

## Guida al Punteggio

| Punteggio | Lettura del risultato |
|---|---|
| 55–65 | Pronto per l'esame. Prenota l'esame. Rivedi solo le domande che hai sbagliato. |
| 47–54 | Nell'intervallo di superamento, ma il margine è ridotto. Rileggi i capitoli dietro ogni errore (usa i tag di dominio), riprova tra una settimana. |
| 38–46 | Le basi ci sono; rimangono delle lacune. Lavora sulla mappa dei domini dell'Appendice B per i tuoi domini deboli prima di riprovare. |
| Sotto 38 | Rileggi i capitoli per i tuoi due domini più deboli dall'inizio alla fine, rifai gli esercizi dei capitoli, poi riprendi questo esame. |

Traccia i tuoi errori *per dominio* (ogni domanda è etichettata). Un punteggio basso concentrato in un dominio è un problema di studio mirato; lo stesso punteggio distribuito uniformemente è un problema di ritmo o di lettura delle domande — rallenta e sottolinea ciò che ogni testo richiede effettivamente (HA vs DR, costo vs prestazioni, "PIÙ conveniente" vs "MINORE overhead operativo").
