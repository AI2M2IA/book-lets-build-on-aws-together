# Capitolo 17: Gli Osservatori

Priya era di nuovo la prima ad arrivare in ufficio. Le sei e quaranta del mattino, la macchina dell'espresso ancora in fase di riscaldamento, il suo laptop aperto su un muro di righe di log che scorrevano più velocemente di quanto chiunque potesse leggerle.

Le lasciò scorrere. Migliaia di voci al giorno — login, richieste, chiacchiericcio automatizzato — e da qualche parte lì dentro, forse, l'unica riga che contava.

Il suo caffè si raffreddò mentre guardava. Se qualcosa di insolito fosse apparso in quei log, la risposta onesta era che nessuno lo avrebbe saputo.

---

*Tutto ciò che poteva essere chiuso a chiave era stato chiuso a chiave. I segreti erano in Secrets Manager. Le chiavi di crittografia erano in KMS. Il traffico di rete era controllato da security group e NACL. Le difese perimetrali erano solide. Ma le difese perimetrali assumono che tu sappia che aspetto ha un attacco prima che arrivi. La domanda che Priya si stava ponendo era diversa: e gli attacchi che non vedi arrivare?*

---

CloudTrail registra migliaia di eventi al giorno. Nessun essere umano li legge tutti. Priya controllava manualmente ogni settimana, ma questo significava che qualcosa poteva accadere un martedì e non essere notato fino al lunedì successivo.

"Ci serve qualcosa che osservi i log per noi," disse.

Maya alzò lo sguardo. "Automaticamente?"

"Automaticamente."

"E se qualcuno prova a entrare?" continuò Priya. "Non solo una credenziale compromessa — e se qualcuno lancia un DDoS? E se cominciano a sondare i nostri endpoint API alla ricerca di vulnerabilità di injection? E se sono già dentro e non lo sappiamo?"

"Sono tre problemi diversi," disse Leo.

"Sì," disse Priya. "E AWS ha tre servizi diversi per affrontarli."

**Tre Categorie di Minacce**

Le minacce alla sicurezza contro un'applicazione cloud rientrano generalmente in tre categorie:

**Attacchi di volume (DDoS)**: Un attaccante invia così tanto traffico che la tua applicazione non riesce a rispondere agli utenti legittimi. L'attacco potrebbe essere milioni di richieste HTTP, o un flusso di pacchetti TCP SYN progettato per esaurire la tabella delle connessioni del tuo server.

**Attacchi applicativi (Exploit)**: Un attaccante invia richieste appositamente costruite, progettate per sfruttare le debolezze della tua applicazione — SQL injection, cross-site scripting, input malformato che fa andare in crash un parser.

**Anomalie comportamentali (Ricognizione e compromissione)**: Chiamate API che non dovrebbero verificarsi (qualcuno che interroga l'intero database degli utenti alle 3 di notte), attività IAM insolite (credenziali usate da un nuovo paese), o traffico di rete verso destinazioni inaspettate.

AWS ha un servizio dedicato per ciascuna:

- **AWS Shield**: Protezione DDoS
- **AWS WAF**: Protezione a livello applicativo
- **Amazon GuardDuty**: Rilevamento comportamentale delle minacce

**AWS Shield: L'Assorbitore di DDoS**

**AWS Shield Standard** è abilitato automaticamente per tutti i clienti AWS senza costi aggiuntivi. Protegge contro gli attacchi DDoS più comuni a livello 3 (rete) e a livello 4 (trasporto) — SYN flood, UDP flood, attacchi di amplificazione DNS.

CloudFront, Route 53 ed Elastic Load Balancing si trovano al bordo della rete di AWS. Quando un attacco DDoS prende di mira la tua applicazione, colpisce per primi questi servizi gestiti. L'infrastruttura di rete di AWS assorbe l'attacco prima che raggiunga le tue istanze EC2.

**AWS Shield Advanced** è il livello premium ($3,000/mese per organizzazione, con un impegno di un anno). È un abbonamento separato — *non* è incluso in alcun piano di Supporto AWS. Aggiunge:

- Protezione per EC2, ELB, CloudFront, Global Accelerator e Route 53
- Notifiche di attacco quasi in tempo reale
- Accesso all'AWS Shield Response Team (SRT) — ingegneri di sicurezza che possono aiutarti a rispondere agli attacchi (coinvolgere l'SRT richiede in aggiunta un piano di Supporto Business o Enterprise)
- Protezione dei costi: se un attacco fa schizzare la tua bolletta, AWS accredita i costi del picco
- Rilevamento e mitigazione DDoS potenziati a livello 7 (livello applicativo)

"Quanto costa al mese?" chiese Tom.

"Tremila dollari," disse Priya. "Per organizzazione."

Tom rimase in silenzio per un momento.

"Per le imprese che gestiscono milioni di fatturato, un DDoS che le butta giù per due ore costa più di tremila dollari," disse Priya.

Tom fece i conti in silenzio.

"Cominceremo con Standard," disse infine.

---

**L'Incidente DDoS: Che Aspetto Ha Shield in Azione**

Otto mesi dopo il lancio, Nimbus subì il suo primo vero attacco DDoS.

Cominciò alle 11:43 di un martedì mattina. La dashboard CloudWatch del load balancer mostrava le richieste di connessione in arrivo schizzare dalle normali 3.000 al minuto a 180.000 al minuto in meno di novanta secondi. Gli IP sorgente erano distribuiti su quaranta paesi, e il volume in entrata raggiunse un picco di circa cinquanta gigabit al secondo. Il pattern era inconfondibile: una botnet che lanciava un SYN flood.

Leo vide per primo le metriche di CloudFront. "Il tasso di richieste è salito di sessanta volte. Il tempo di risposta sta schizzando."

Priya aprì le metriche CloudWatch fianco a fianco: i tentativi di connessione al bordo salivano in verticale, le richieste che raggiungevano effettivamente l'origine — piatte. "Shield Standard se lo sta mangiando," disse. Non c'era nessun avviso, nessun evento sulla dashboard, nessuna notifica. Shield Standard lavora in silenzio: è sempre attivo, è gratuito, e non ti dà **alcuna visibilità sull'attacco** — nessuna console degli eventi, nessuna notifica, nessun team di risposta DDoS. (Quella visibilità — dashboard di attacco quasi in tempo reale e avvisi — è precisamente ciò che Shield *Advanced* vende.) L'unico modo in cui Priya poteva vedere l'attacco era attraverso le proprie metriche CloudWatch.

Shield Standard aveva rilevato automaticamente il SYN flood e attivato la mitigazione entro i primi due minuti. Il traffico dell'attacco veniva assorbito dai nodi edge di CloudFront a livello globale — gli stessi oltre 700 punti di presenza che servivano i contenuti legittimi assorbivano anche il volume dell'attacco.

Alle 11:52 — nove minuti dopo l'inizio dell'attacco — la mitigazione di Shield aveva riportato il tasso di richieste all'origine alla normalità. L'attacco era ancora in corso a livello di rete, ma la mitigazione lo stava gestendo. L'applicazione Nimbus continuò a servire gli utenti per tutto il tempo.

"Gli utenti non se ne sono accorti?" chiese Leo, guardando la metrica del tasso di errori.

"Il tasso di errori è salito di circa il due percento per circa quattro minuti," disse Priya. "Alcuni utenti hanno avuto una risposta leggermente più lenta. Nessuna interruzione. L'applicazione è rimasta su."

"Perché Shield ha assorbito il flood al bordo."

"Prima che raggiungesse il nostro load balancer. Il SYN flood da cinquanta gigabit ha colpito CloudFront. Quando il pattern di traffico è stato riconosciuto e mitigato, la nostra origine aveva visto solo il volume di richieste normale."

L'attacco durò quarantasette minuti. Alle 12:30 le metriche al bordo erano tornate alla linea di base — l'unico segnale di "risolto" che Shield Standard ti dà.

"E questo è Shield Standard," disse Tom. "La versione gratuita."

"Attacchi di livello 3 e 4. Standard protegge contro quelli automaticamente. Se l'attacco fosse stato più sofisticato — un HTTP flood di livello 7, per esempio, dove ogni richiesta sembra legittima — Standard non sarebbe stato sufficiente. Quello richiede Shield Advanced più WAF."

Tom annotò "Monitorare pattern DDoS di livello 7" nella sua roadmap di sicurezza.

---

**AWS WAF: Il Filtro Applicativo**

**AWS WAF (Web Application Firewall)** opera a livello HTTP — ispeziona il contenuto delle richieste web prima che raggiungano la tua applicazione.

WAF si configura con le **Web ACL (Access Control List)** — insiemi di regole che definiscono cosa consentire, bloccare o contare.

WAF può essere collegato a:

- Distribuzioni CloudFront (ispeziona le richieste al bordo, globalmente)
- Application Load Balancer (ispeziona le richieste a livello regionale)
- API Gateway
- AWS AppSync

**Regole Gestite WAF**: AWS e fornitori di terze parti pubblicano insiemi di regole predefiniti:

- **AWS Managed Rules - Core Rule Set**: Insieme ai gruppi di regole complementari (SQL database, Known Bad Inputs), copre le vulnerabilità OWASP Top 10 (SQL injection, XSS, command injection, path traversal, ecc.)
- **AWS Managed Rules - Known Bad Inputs**: Blocca le richieste che corrispondono a pattern di attacco noti
- **AWS Managed Rules - Amazon IP Reputation List**: Blocca gli IP noti per essere associati a botnet e scanner
- **AWS Managed Rules - Bot Control**: Identifica e gestisce il traffico dei bot

Puoi anche creare regole personalizzate:

- "Blocca qualsiasi richiesta con un header User-Agent contenente 'sqlmap'" (un comune scanner di SQL injection)
- "Limite di frequenza: consenti non più di 1000 richieste per IP ogni 5 minuti"
- "Blocca le richieste che contengono `<script>` in qualsiasi valore di parametro"

Per Nimbus, la configurazione pratica: WAF sulla distribuzione CloudFront con il Core Rule Set abilitato. Questo blocca i pattern di attacco più comuni prima che le richieste raggiungano mai le istanze EC2.

Forse ti starai chiedendo: se WAF blocca i pattern di attacco noti, cosa succede quando appare un nuovo pattern di attacco che WAF non conosce? Gli insiemi di regole gestite di WAF vengono aggiornati da AWS e dai fornitori di terze parti man mano che emergono nuove minacce — non devi aggiornare le regole manualmente. Ma hai ragione sul fatto che WAF è fondamentalmente reattivo rispetto ai pattern noti. Le tecniche di attacco nuove e inedite non verranno bloccate da una regola che ancora non esiste. Ecco perché GuardDuty esiste accanto a WAF: WAF filtra la porta d'ingresso, GuardDuty osserva i comportamenti insoliti dentro casa. Un nuovo tipo di attacco potrebbe passare attraverso WAF, ma GuardDuty può comunque segnalare l'attività anomala che provoca — chiamate API insolite, destinazioni di rete inattese, pattern di accesso che non corrispondono alla linea di base.

"Abbiamo pensato a cosa succede se WAF causa falsi positivi?" chiese Priya. "La richiesta di un utente legittimo che viene bloccata dal Core Rule Set?"

"WAF ha una modalità 'Count'," disse Leo. "Invece di bloccare, si limita a contare le richieste corrispondenti. Lo esegui prima in modalità Count, esamini cosa avrebbe bloccato, verifichi che non ci siano falsi positivi, poi passi a Block."

"Bene," disse Priya. "Partiamo in modalità Count."

---

**Creare una Regola WAF: La Storia del Rate Limit**

Due settimane dopo aver abilitato WAF in modalità Count, Priya esaminò i log. I risultati del Core Rule Set erano puliti — nessun falso positivo sul traffico legittimo, una manciata di tentativi di SQL injection bloccati provenienti da scanner automatici.

Ma notò un pattern che il Core Rule Set non stava segnalando: un indirizzo IP aveva fatto 847 richieste a `/api/search` in cinque minuti. Ogni richiesta era strutturalmente valida. Ma 847 ricerche in cinque minuti non erano un essere umano.

"Uno scraper di prezzi," disse. "Qualcuno sta interrogando automaticamente la nostra ricerca di ristoranti per costruire un database di prezzi della concorrenza."

"Ci interessa?" chiese Leo.

"Usa le nostre risorse di calcolo ed è contro i nostri termini di servizio," disse Tom.

"Ci interessa," confermò Priya.

Creò una regola WAF personalizzata basata sulla frequenza:

```
Nome regola: RateLimitSearchAPI
Tipo di regola: Regola basata sulla frequenza (rate-based)
Limite di frequenza: 100 richieste per indirizzo IP
Finestra di valutazione: 5 minuti (configurabile: 1, 2, 5 o 10 minuti)
Scope-down statement: il percorso URI inizia con /api/search
Azione: Block
```

Lo scope-down statement è importante — il limite di frequenza si applica solo a `/api/search`. Il traffico API legittimo verso gli altri endpoint non viene toccato. E nota come funziona il blocco: non c'è un periodo fisso di "punizione" — WAF rivaluta continuamente il tasso di richieste di ciascun IP, lo blocca finché il tasso resta sopra il limite, e lo sblocca (tipicamente entro pochi secondi) una volta che il tasso scende di nuovo sotto.

Lo impostò prima in modalità Count. Lo fece girare per 24 ore. L'unico IP che fece scattare la regola fu lo scraper. Nessun utente legittimo aveva mai inviato più di 12 richieste all'endpoint di ricerca in cinque minuti.

Passò alla modalità Block. La richiesta successiva dello scraper ricevette un 403. Passò a un IP diverso. Il rate limit catturò anche quello.

"Prima o poi lo aggireranno," disse Leo. "Si distribuiranno su più IP."

"E a quel punto staranno usando più infrastruttura, pagando di più e ottenendo meno dati," disse Priya. "Non dobbiamo fermarli completamente. Dobbiamo rendere la cosa abbastanza costosa da non valerne la pena."

"Quanto costa al mese?" chiese Tom.

Il prezzo di WAF è per Web ACL al mese, per regola al mese e per milione di richieste. Per la configurazione di Nimbus — una Web ACL, cinque regole su CloudFront — circa $15 al mese più i costi delle richieste.

Tom lo approvò immediatamente.

---

**Amazon GuardDuty: L'Analista Comportamentale**

"Aspetta — ma *perché* dovremmo farlo in questo modo?" chiese Maya. "Se WAF blocca gli attacchi e Shield assorbe i flood, perché ci serve un terzo servizio? Cosa sta osservando davvero GuardDuty?"

WAF e Shield sono filtri — intercettano il traffico cattivo prima che raggiunga la tua applicazione. GuardDuty osserva cosa succede dopo che il traffico è arrivato. Guarda cosa sta facendo la tua infrastruttura: quali credenziali IAM vengono usate, quali domini stanno contattando le tue istanze, quali chiamate API avvengono alle 3 di notte. Un attaccante che passa dalla porta d'ingresso con una richiesta dall'aspetto legittimo non verrà fermato da WAF — ma GuardDuty noterà che la stessa credenziale sta improvvisamente facendo chiamate API dalla Romania.

GuardDuty è fondamentalmente diverso da Shield e WAF. Non blocca gli attacchi — **rileva comportamenti insoliti**.

GuardDuty analizza continuamente diversi flussi di attività per rilevare minacce: **eventi di gestione e di dati di CloudTrail** (chiamate API e azioni), **VPC Flow Logs** (pattern di traffico di rete) e **log delle query DNS** (risoluzioni di domini). Queste sono le tre fonti fondamentali su cui GuardDuty si è sempre basato:

- **Log di AWS CloudTrail**: modifiche IAM, chiamate API, login alla console
- **VPC Flow Logs**: pattern di traffico di rete all'interno del tuo VPC
- **Log delle query DNS**: cosa stanno risolvendo le tue istanze (i malware noti spesso risolvono specifici domini C2)

Ma GuardDuty si è espanso significativamente oltre queste tre. AWS chiama i componenti aggiuntivi opzionali **protection plan** (piani di protezione) — S3 Protection, EKS Protection, RDS Protection, Lambda Protection, Runtime Monitoring e Malware Protection — ciascuno abilitabile individualmente. A seconda di quali abiliti, GuardDuty può anche analizzare gli **eventi di dati S3** (pattern di accesso insoliti ai tuoi bucket), i **log di audit e l'attività runtime di EKS** (comportamento malevolo dentro i container in esecuzione), gli **eventi di login RDS** (tentativi anomali di login al database), il **traffico di rete di Lambda** (funzioni che chiamano destinazioni esterne inattese), il **comportamento runtime di ECS/EC2** e i **volumi EBS scansionati alla ricerca di malware**. Per l'esame, conosci a memoria le tre fonti principali; i protection plan compaiono in scenari su contesti di rilevamento di minacce specifici — "rilevare tentativi di login anomali a RDS" o "identificare comportamento malevolo dentro un container in esecuzione" sono segnali per pensare ai protection plan opzionali di GuardDuty.

I modelli di machine learning identificano pattern che deviano dalla tua linea di base. GuardDuty genera **finding** — avvisi categorizzati — quando rileva anomalie.

Esempi di ciò che GuardDuty può rilevare:

- Un utente IAM che effettua il login da un indirizzo IP non riconosciuto (in un paese che non ha mai usato prima)
- Chiamate API effettuate da un nodo di uscita Tor
- Un'istanza EC2 che comunica con un mining pool di criptovalute noto
- Volume di chiamate API insolitamente alto (abuso di credenziali o scansione)
- Un bucket S3 a cui accede un indirizzo IP segnalato per attività malevole
- Traffico in uscita verso un dominio noto per essere associato a infrastrutture di command-and-control di malware

"Questo è ciò che avrebbe catturato l'IP rumeno," disse Leo a bassa voce.

"Se avessimo avuto GuardDuty abilitato, avrebbe segnalato l'istanza EC2 che effettuava connessioni in uscita verso un IP esterno non riconosciuto alle 2 di notte," confermò Priya.

---

**Cinque Tipi di Finding di GuardDuty e Cosa Fare**

Priya creò un runbook per i cinque finding di GuardDuty più comuni. Quando un finding scatta, il team sa immediatamente cosa significa e cosa fare.

**1. UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B**

Un utente IAM ha effettuato con successo il login alla Console AWS da un indirizzo IP mai visto prima per questo account, o da una posizione geografica incoerente con i login precedenti.

Risposta: Verifica con l'utente che sia stato lui ad avviare il login. Se non è stato lui — o non è raggiungibile — immediatamente: disabilita la chiave di accesso e la password della console dell'utente, revoca le sessioni attive e avvia un audit di CloudTrail su tutto ciò che quell'utente ha fatto nelle ultime 24 ore. Questo finding spesso precede l'abuso di credenziali.

**2. CryptoCurrency:EC2/BitcoinTool.B**

Un'istanza EC2 sta interrogando indirizzi IP o nomi di dominio associati a mining pool di criptovalute. Questo è quasi sempre il risultato di un'istanza EC2 compromessa e usata come bot di mining.

Risposta: Isola l'istanza immediatamente — modifica il suo security group per bloccare tutto il traffico in entrata e in uscita tranne quello verso il tuo bastion host. Fai uno snapshot forense del volume EBS. Poi termina l'istanza e lanciane una sostitutiva da una AMI pulita.

**3. Recon:EC2/PortProbeUnprotectedPort**

Un'istanza EC2 ha una porta aperta verso internet che viene sondata da scanner noti o da un nodo di uscita Tor. GuardDuty segnala le porte che appaiono nei flow log come accessibili da sorgenti esterne.

Risposta: Esamina le regole del security group. Se la porta è aperta intenzionalmente, contrassegna il finding come risolto con una nota. Se non è intenzionale, chiudi la porta immediatamente. Controlla CloudTrail per eventuali accessi che potrebbero essere avvenuti attraverso quella porta.

**4. Trojan:EC2/BlackholeTraffic**

Un'istanza EC2 sta tentando di comunicare con un indirizzo IP identificato come "black hole" — una destinazione associata a infrastrutture di command-and-control di malware. Il traffico verso questi IP suggerisce che l'istanza è stata infettata e sta tentando di chiamare casa.

Risposta: La stessa dei finding CryptoCurrency — isola, fai lo snapshot, sostituisci. Questo finding indica malware attivo sull'istanza. Non tentare di ripulire l'istanza sul posto; costruiscine una nuova da una AMI pulita.

**5. Policy:S3/BucketBlockPublicAccessDisabled**

Qualcuno ha disabilitato l'impostazione Block Public Access su un bucket S3. Questo non significa che il bucket sia pubblico — significa che il meccanismo di sicurezza che previene l'esposizione pubblica accidentale è stato disattivato per quel bucket. Spesso viene fatto per sbaglio o come parte di un deployment mal configurato.

Risposta: Indaga su chi ha fatto la modifica (CloudTrail avrà la chiamata API). Riabilita Block Public Access a meno che non ci sia una ragione documentata per cui debba restare disabilitato. Valuta di abilitare l'impostazione Block Public Access a livello di account per evitare che questo finding si ripresenti in futuro.

"La cosa più importante dei finding di GuardDuty," disse Priya, "è che non sono avvisi — sono ipotesi. Ogni finding dice 'questo pattern sembra anomalo.' Tu verifichi, indaghi, rispondi. Alcuni saranno falsi positivi. La maggior parte no."

"Come stabiliamo le priorità?" chiese Rafael.

"GuardDuty assegna livelli di gravità: Low, Medium, High. I finding di gravità High richiedono una risposta in giornata. I finding di Trojan e di compromissione di credenziali sono sempre High. I finding di port probe potrebbero essere Medium o Low. Comincia dagli High, scendi."

---

"Quanto costa?" chiese Tom.

Il prezzo di GuardDuty si basa sul volume di log analizzati — eventi CloudTrail, dati di flusso VPC, query DNS. Per un'applicazione piccola o media, tipicamente $50-150/mese. Su larga scala, è comunque una piccola frazione dei costi di infrastruttura.

Tom aprì la console per esaminare la dashboard dei finding.

"Andrà tutto bene," disse Leo. "È solo monitoraggio. Non è che possa rompere qualcosa."

"L'ho già deployato," aggiunse Leo — e poi controllò la dashboard di GuardDuty. "Oh. Solo finding di esempio. Quelli veri richiedono un po' di tempo."

"GuardDuty ha bisogno di tempo per costruire una linea di base di che aspetto ha la normalità," disse Priya. "Dagli un paio di giorni. Il primo finding vero arriverà — arrivano sempre."

Su quello, si rivelò avere ragione. Ma il primo finding è una storia per la fine di questo capitolo.

**Collegare i Tre Servizi**

Shield, WAF e GuardDuty lavorano a livelli diversi e si completano a vicenda:

| Servizio    | Livello                     | Protegge contro                            | Azione                             |
|------------|---------------------------|---------------------------------------------|------------------------------------|
| AWS Shield | Rete/Trasporto (L3/L4) | Flood DDoS                                 | Assorbe/mitiga gli attacchi          |
| AWS WAF    | Applicazione (L7)          | OWASP Top 10, bot, scraper                | Consente, blocca o conta le richieste |
| GuardDuty  | Comportamentale (tutti i log)     | Anomalie, credenziali compromesse, malware | Rileva e avvisa                 |

Shield ferma l'inondazione. WAF filtra l'acqua. GuardDuty osserva le tubature alla ricerca di flussi insoliti. Macie verifica cosa è conservato nei serbatoi. Security Hub è la sala di controllo dove tutte le dashboard sono visibili contemporaneamente.

La modalità di fallimento di ciascuno spiega perché ti servono tutti:

- Un SYN flood da 50 Gbps non è una richiesta web. WAF non può ispezionarlo. GuardDuty potrebbe notare il traffico anomalo nei VPC Flow Logs. Shield lo ferma.
- Una singola richiesta di SQL injection non è un flood. Shield la ignora. GuardDuty non conosce il contenuto delle richieste HTTP. WAF la cattura.
- Un utente AWS legittimo che usa le proprie credenziali per esfiltrare dati lentamente — nessun DDoS, nessuna injection, HTTP valido — Shield e WAF non vedono nulla di insolito. GuardDuty nota che le credenziali vengono usate da un nuovo paese alle 3 di notte.
- Uno sviluppatore che carica accidentalmente dati dei clienti su un bucket accessibile pubblicamente non genera alcun comportamento anomalo. GuardDuty non ha nulla da segnalare. Macie scansiona il bucket e trova le PII.

Ogni servizio ha un punto cieco. La combinazione copre quei punti ciechi.

**CloudTrail: Le Fondamenta**

Tutti e tre i servizi si basano sui log. **AWS CloudTrail** è il servizio di logging che cattura ogni chiamata API nel tuo account AWS — chi ha chiamato cosa, quando, da dove, con quale risultato.

CloudTrail è abilitato per impostazione predefinita con una cronologia di 90 giorni nella console. Per conservare i log a lungo termine:

1. Crea un trail che scriva su un bucket S3
2. Opzionalmente, invia a CloudWatch Logs per gli avvisi in tempo reale
3. Abilita la validazione dei file di log (per rilevare se i log sono stati manomessi)

GuardDuty, AWS Config, Security Hub e IAM Access Analyzer leggono tutti da CloudTrail. Senza i log di CloudTrail, questi servizi non hanno nulla da analizzare.

"E se qualcuno prova a disabilitare CloudTrail?" chiese Priya. "Se un attaccante ottiene l'accesso da amministratore, la sua prima azione potrebbe essere disabilitare il logging — coprire le proprie tracce."

"È quello che impedisce la SCP del Capitolo 14," disse Leo. "Nessuno in questo account può disabilitare CloudTrail, nemmeno gli amministratori."

"E se in qualche modo ci riuscissero?"

"Security Hub genererebbe un finding. CloudTrail invia una notifica a SNS sulle modifiche di configurazione. Riceviamo un avviso entro due minuti da qualsiasi modifica a CloudTrail."

"E GuardDuty segnalerebbe la chiamata API," aggiunse Rafael, "come un'azione IAM insolita — disabilitare il logging non è una normale attività operativa."

Più strati di rilevamento per una delle azioni di sicurezza più critiche: la manomissione dei log. Non era un caso. Priya l'aveva progettato deliberatamente.

"La difesa in profondità si applica anche al livello di monitoraggio," disse. "Non solo al livello applicativo."

**Amazon Macie: Dati Sensibili in S3**

"Abbiamo pensato a cosa succede se qualcuno carica accidentalmente su S3 un file con i numeri di carta di credito dei clienti?" chiese Priya. "Non con cattiveria — solo uno sviluppatore che esporta dati per il debug e carica il file sbagliato?"

"Non lo sapremmo mai," disse Leo.

"Esatto. A meno che non abbiamo Macie."

**Amazon Macie** è un servizio di sicurezza dei dati che usa il machine learning per scoprire e proteggere automaticamente i dati sensibili in S3. Scansiona continuamente i bucket S3 e identifica:

- PII (Informazioni di Identificazione Personale): nomi, indirizzi email, numeri di telefono, date di nascita
- Dati finanziari: numeri di carte di credito, numeri di conti bancari
- Credenziali: password, chiavi di accesso, chiavi private incorporate nei file
- Informazioni sanitarie: cartelle cliniche, diagnosi

Macie genera finding quando rileva dati sensibili in posti dove non dovrebbero essere — o quando i bucket S3 hanno configurazioni di accesso troppo permissive.

"È la stessa cosa di GuardDuty?" chiese Maya.

"Scopo diverso," disse Priya. "GuardDuty osserva il comportamento — quali azioni vengono intraprese, se quelle azioni sembrano anomale. Macie osserva i dati — quale contenuto è memorizzato, se quel contenuto è sensibile. GuardDuty segnalerebbe un'istanza EC2 che fa chiamate API insolite. Macie segnalerebbe un bucket S3 contenente numeri di carte di credito."

"Quindi GuardDuty è l'analista comportamentale," disse Leo, "e Macie è il revisore dei dati."

"Esatto. Servono entrambi. Un attaccante che esfiltra dati attraverso una chiamata API dall'aspetto legittimo potrebbe essere segnalato da GuardDuty per il pattern API insolito. Ma se un dipendente carica un file con 10.000 record di clienti su un bucket di sviluppo, non c'è alcun comportamento anomalo da rilevare — solo dati sensibili nel posto sbagliato. Macie cattura quello."

Per Nimbus, il valore più immediato di Macie fu sul bucket `nimbus-debug-exports` — un bucket che gli sviluppatori usavano per scaricare dati per il debug. Macie trovò tre file contenenti cronologie di ordini con nomi dei clienti e indirizzi di consegna. Non dati di pagamento, ma dati personali che non avrebbero dovuto trovarsi in un bucket di sviluppo non crittografato.

I file furono rimossi. Fu aggiunta una policy: il bucket di debug fu limitato ai soli dati di test sintetici. I dati reali dei clienti richiedevano l'approvazione di Priya per essere esportati in qualsiasi ambiente al di fuori della produzione.

"Quanto costa al mese?" chiese Tom.

Macie addebita in base al numero di bucket S3 valutati al mese e al volume di dati scansionati. Per una startup con un numero moderato di bucket, circa $10-50 al mese. Gratuito per i primi 30 giorni.

Tom lo abilitò prima di pranzo.

---

**AWS Security Hub: La Dashboard**

Se gestisci più account AWS o ti serve una vista consolidata dei finding di sicurezza, **AWS Security Hub** aggrega i finding da GuardDuty, Inspector (valutazione delle vulnerabilità), Macie (privacy dei dati), Config e Firewall Manager in un'unica dashboard.

Controlla anche la tua configurazione rispetto alle best practice di sicurezza (lo standard AWS Foundational Security Best Practices) e al CIS AWS Foundations Benchmark.

Security Hub è la risposta a "come faccio a vedere tutti i miei finding di sicurezza in un unico posto senza passare tra cinque console diverse?" Quando GuardDuty genera un finding, questo appare in GuardDuty e in Security Hub. Quando Macie trova dati sensibili in un bucket S3, il finding appare in Macie e in Security Hub. Quando una regola di Config rileva una configurazione errata, appare in Config e in Security Hub.

Per un team con un solo account, Security Hub aggiunge un valore marginale — è un'altra console da controllare. Il suo potere emerge su larga scala: tre account, dieci account, cinquanta account. Tutti i finding di tutti gli account si aggregano nel Security Hub di un account di gestione. Un team monitora una dashboard. Un solo set di avvisi. Nessun controllo dei log account per account.

Per Nimbus: Security Hub non era ancora necessario. Quando fossero cresciuti a tre account (dev, staging, produzione), sarebbe diventato essenziale.

"Configuratelo adesso," disse Soo-Jin, alla sua terza settimana. "Ci vogliono quindici minuti per abilitarlo. Ci vogliono tre mesi per rimpiangere di non averlo fatto prima."

Lo abilitarono.

**Amazon Inspector: Valutazione delle Vulnerabilità**

Una settimana dopo aver abilitato Macie, fu pubblicata una CVE per la versione di OpenSSL in esecuzione su tutta la flotta di produzione di Nimbus. Priya lesse l'advisory davanti al caffè.

"Dobbiamo sapere quali delle nostre istanze sono interessate," disse.

"Posso eseguire una scansione manuale," disse Leo.

"Per nove istanze, certo. Per novanta? Per i container?" Priya aprì la console di Inspector. "È a questo che serve Inspector."

**Amazon Inspector** è un servizio automatizzato di valutazione delle vulnerabilità. Dove GuardDuty osserva il comportamento — cosa sta facendo la tua infrastruttura in questo momento — Inspector guarda cosa è presente che potrebbe essere sfruttato.

- **Istanze EC2:** Inspector scansiona il sistema operativo e i pacchetti installati confrontandoli con l'NVD (National Vulnerability Database) — il catalogo autorevole delle CVE note. Se stai eseguendo OpenSSL 1.1.1 e una CVE prende di mira quella versione, Inspector la segnala.
- **Immagini container ECR:** Inspector scansiona le immagini container in Elastic Container Registry prima che vengano deployate. Un pacchetto vulnerabile in un'immagine di base appare come finding prima ancora che il container giri in produzione.
- **Pacchetti delle funzioni Lambda:** Inspector analizza le dipendenze incluse nelle tue funzioni Lambda — pacchetti Python, moduli Node, dipendenze Java — alla ricerca di vulnerabilità note.

La differenza critica rispetto a una scansione una tantum: Inspector funziona **in modo continuo**. Non si limita a controllare le tue istanze una volta quando lo abiliti e dichiararle pulite. Quando viene pubblicata una nuova CVE, Inspector rivaluta automaticamente le tue risorse esistenti rispetto alla nuova vulnerabilità. Quando un'istanza EC2 cambia — nuovo pacchetto installato, AMI aggiornata — Inspector la riscansiona. La flotta EC2 di Priya fu segnalata per la CVE di OpenSSL entro pochi minuti dall'abilitazione di Inspector, non perché lei gli avesse chiesto di scansionare, ma perché è ciò che fa.

I finding sono classificati per gravità: Critical, High, Medium, Low, Informational. Confluiscono in Security Hub insieme ai finding di GuardDuty e Macie. Una dashboard. Tutte e tre le lenti.

"Tre istanze interessate," disse Leo, leggendo i finding di Inspector. "Le altre sei sono su una versione patchata."

"Patcha quelle tre questa settimana," disse Priya.

"E le immagini container?"

Priya guardò i finding ECR di Inspector. Due immagini di base nel loro container registry avevano vulnerabilità note — versioni più vecchie di pacchetti che erano state nel frattempo corrette. Le contrassegnò per il rebuild.

"La cosa importante," disse Priya, "è che l'abbiamo scoperto prima che venisse sfruttato. Non dopo."

**Il Modello a Tre Lenti**

GuardDuty, Inspector e Macie osservano ciascuno una cosa diversa:

- **GuardDuty** è comportamentale. Si chiede: *cosa sta succedendo proprio ora che sembra sbagliato?* Chiamate API da posizioni inattese, istanze EC2 che contattano server di command-and-control, credenziali usate a orari insoliti. Cattura minacce attive e anomalie.
- **Inspector** è strutturale. Si chiede: *cosa è presente nel nostro ambiente che potrebbe essere sfruttato?* Pacchetti non patchati, dipendenze vulnerabili, runtime obsoleti. Cattura le condizioni che rendono possibili gli attacchi.
- **Macie** riguarda i dati. Si chiede: *quali informazioni sensibili si trovano nei nostri bucket S3 che non dovrebbero esserci?* PII, registri finanziari, credenziali lasciate nei file. Cattura le esposizioni che non generano alcun comportamento anomalo — solo dati nel posto sbagliato.

Una compromissione che coinvolge una CVE nota potrebbe apparire in tutti e tre: Inspector avrebbe segnalato la vulnerabilità prima dell'attacco. GuardDuty avrebbe segnalato il comportamento anomalo durante l'attacco. Macie avrebbe segnalato i dati esfiltrati dopo che sono atterrati in S3.

Tre lenti diverse, tre orizzonti temporali diversi, nessuna sostituibile con le altre.

**AWS Network Firewall: L'Ispettore del Traffico**

Un altro specialista merita una menzione prima che la cassetta degli attrezzi si chiuda. I security group e le NACL (Capitolo 15) filtrano il traffico per IP, porta e protocollo — possono dire *chi* può parlare con *cosa*, ma non possono guardare dentro la conversazione. **AWS Network Firewall** è un firewall stateful gestito che deployi a livello di VPC. Esegue la deep packet inspection: filtraggio per nome di dominio (consenti l'uscita solo verso `*.eatnimbus.com` e i tuoi repository di pacchetti), blocco del traffico che corrisponde a firme di intrusione (IDS/IPS, compatibile con le regole Suricata) e ispezione dei flussi che i security group lascerebbero semplicemente passare perché il numero di porta sembrava a posto.

"Quindi è un security group con un cervello," disse Leo.

"È l'appliance che compreresti da un produttore di firewall," disse Priya, "tranne che è gestito, scala automaticamente ed è deployato in una propria subnet così che tutto il traffico in entrata e in uscita dal VPC ci passi attraverso."

Segnali d'esame: "ispezionare o filtrare il traffico per nome di dominio o payload," "rilevamento/prevenzione delle intrusioni (IDS/IPS) per un VPC," o "filtraggio centralizzato dell'egress per il traffico in uscita" → Network Firewall. I security group e le NACL sono la risposta per il permetti/nega a livello di istanza e di subnet per porta e IP; Network Firewall è la risposta quando la domanda richiede l'ispezione *dentro* il traffico. E quando la domanda chiede come gestire in modo coerente le regole WAF, Shield Advanced, i security group *e* le policy di Network Firewall su molti account — quello è **AWS Firewall Manager**, il livello di amministrazione delle policy che sta sopra.

## Punti di Forza e Limitazioni

**AWS Shield**:

- Standard: gratuito e automatico — non c'è motivo per non usarlo
- Advanced: eccellente per bersagli di alto profilo; costoso per i piccoli team
- Standard assorbe automaticamente gli attacchi di livello 3/4 (SYN flood, UDP flood, amplificazione DNS)
- Advanced aggiunge la protezione di livello 7, le notifiche in tempo reale e lo Shield Response Team

**AWS WAF**:

- I gruppi di regole gestite semplificano notevolmente la configurazione — protezione OWASP Top 10 con pochi clic
- Le regole personalizzate richiedono la comprensione dei pattern di attacco HTTP
- Il rate limiting è una funzionalità potente spesso trascurata — efficace contro scraper e brute force
- WAF non è un sostituto del codice applicativo sicuro — è uno strato di difesa in profondità
- Parti in modalità Count, valida, poi passa a Block

**GuardDuty**:

- Sforzo estremamente basso per abilitarlo (pochi clic, prova gratuita di 30 giorni)
- I finding richiedono revisione e risposta umana — GuardDuty rileva, non corregge
- I falsi positivi capitano — alcune attività legittime sembrano anomale ai modelli di ML
- I livelli di gravità (Low/Medium/High) aiutano a dare priorità alla risposta
- Si integra con Security Hub, EventBridge e Lambda per flussi di risposta automatizzati

**Amazon Inspector**:

- Scansione delle vulnerabilità continua e automatizzata — non un controllo una tantum
- Riscansiona automaticamente quando vengono pubblicate nuove CVE o quando le risorse cambiano
- Copre istanze EC2 (SO e pacchetti applicativi), immagini container ECR e pacchetti delle funzioni Lambda
- I finding confluiscono in Security Hub; le classificazioni di gravità aiutano a dare priorità al patching
- Non blocca gli attacchi — fa emergere le condizioni che rendono gli attacchi possibili

**Amazon Macie**:

- Scopre automaticamente i dati sensibili (PII, credenziali, dati finanziari) in S3
- Cattura le esposizioni di dati che non hanno alcun pattern di comportamento anomalo — GuardDuty le mancherebbe
- Prova gratuita di 30 giorni; poi paghi per bucket al mese
- Più prezioso per i team con molti bucket S3 e livelli di sensibilità variabili

**AWS Security Hub**:

- Aggrega i finding da GuardDuty, Macie, Inspector, Config e Firewall Manager
- Controlla la configurazione rispetto ai benchmark di sicurezza (CIS, NIST, PCI-DSS)
- Più prezioso su scala multi-account
- Abilitalo presto, anche se hai un solo account — la cronologia dei finding è cumulativa

## Riepilogo

Cinque servizi, cinque strati. Ognuno affronta un tipo diverso di minaccia — e nessuno sostituisce gli altri. Un attacco DDoS aggira WAF e GuardDuty. Un tentativo di SQL injection aggira Shield. Una credenziale compromessa usata lentamente e con cautela potrebbe aggirare completamente Shield e WAF — ma GuardDuty vedrà l'anomalia. Uno sviluppatore che carica accidentalmente le PII dei clienti su un bucket S3 di debug li aggira tutti e tre — ma Macie lo cattura.

- **AWS Shield Standard**: Protezione DDoS gratuita e automatica a livello 3/4. Sempre attiva. Ha assorbito il SYN flood da 50 Gbps prima che raggiungesse il load balancer di Nimbus.
- **AWS Shield Advanced**: Protezione DDoS premium con accesso all'SRT e protezione dei costi. Caso d'uso enterprise.
- **AWS WAF**: Firewall a livello applicativo. Ispeziona e filtra le richieste HTTP. Si collega a CloudFront, ALB o API Gateway. Usa i Managed Rule Group per la protezione OWASP Top 10. Regole basate sulla frequenza per la difesa dagli scraper.
- **Amazon GuardDuty**: Rilevamento comportamentale delle minacce. Fonti di dati principali: eventi CloudTrail, VPC Flow Logs e log DNS. Le protezioni estese opzionali aggiungono eventi S3, monitoraggio runtime EKS/ECS, eventi di login RDS e attività di rete di Lambda. Genera finding categorizzati per le attività anomale. Cinque tipi di finding chiave: UnauthorizedAccess (login alla console), CryptoCurrency (mining), Recon (port probe), Trojan (traffico C2), Policy (configurazione errata di S3).
- **Amazon Inspector**: Valutazione automatizzata delle vulnerabilità. Scansiona istanze EC2, immagini container ECR e pacchetti delle funzioni Lambda alla ricerca di CVE note. Funziona in modo continuo e rivaluta quando vengono pubblicate nuove vulnerabilità. I finding confluiscono in Security Hub.
- **Amazon Macie**: Scoperta di dati sensibili in S3. Rileva PII, credenziali e dati finanziari. Cattura le esposizioni che non hanno alcun pattern di comportamento anomalo.
- **AWS Security Hub**: Aggrega i finding di tutti i servizi di sicurezza in un'unica dashboard. Consente il monitoraggio centralizzato su più account.
- **CloudTrail**: Le fondamenta di tutto il logging di sicurezza di AWS. Abilita un trail che scriva su S3 per la conservazione a lungo termine. Ogni servizio di sicurezza legge da lì.

## Suggerimenti per l'Esame

*SAA-C03 Dominio: Progettazione di Architetture Sicure (Dominio 1, Task 1.2)*

- **Shield Standard vs Advanced**: Standard è gratuito e automatico. Advanced costa e aggiunge l'SRT, la protezione dei costi e un rilevamento migliore. Segnali d'esame per Advanced: "DDoS su larga scala," "garanzia di SLA durante gli attacchi," "protezione finanziaria contro i picchi di costo legati ai DDoS."
- **Segnali di caso d'uso WAF**: "blocca SQL injection," "blocca cross-site scripting," "limita la frequenza delle chiamate API," "blocca user-agent specifici," "protezione OWASP Top 10" → WAF.
- **Segnali GuardDuty**: "rileva attività API insolite," "identifica credenziali compromesse," "segnala connessioni di rete EC2 anomale," "threat intelligence" → GuardDuty.
- **Collegamento di WAF**: Può essere collegato a CloudFront (globale), ALB (regionale), API Gateway (regionale), AppSync.
- **Fonti di dati di GuardDuty**: Tre fonti principali — eventi CloudTrail, VPC Flow Logs, log DNS. Le fonti estese opzionali includono eventi di dati S3, log di audit EKS, eventi di login RDS, attività di rete di Lambda e runtime ECS. L'esame può chiedere quale fonte di dati è rilevante per uno specifico scenario di rilevamento: "login anomali a RDS" → GuardDuty RDS Protection; "minacce runtime nei container" → GuardDuty EKS/ECS Runtime Monitoring.
- **Macie vs GuardDuty**: Questo è un distrattore d'esame comune. **Macie** usa l'ML per rilevare dati sensibili in S3 (PII, credenziali, dati finanziari). **GuardDuty** rileva minacce e anomalie nel comportamento. Macie riguarda il contenuto. GuardDuty riguarda il comportamento.
- **Inspector vs GuardDuty vs Macie:** Tre lenti diverse, nessuna sostituibile con le altre. **Inspector** = scansione delle vulnerabilità — CVE su istanze EC2, immagini container in ECR e pacchetti delle funzioni Lambda. Funziona in modo continuo e riscansiona quando vengono pubblicate nuove CVE. **GuardDuty** = rilevamento comportamentale delle minacce — cosa sta succedendo proprio ora che sembra anomalo. **Macie** = scoperta di dati sensibili in S3 — PII, credenziali e dati finanziari che non dovrebbero essere lì. Trigger d'esame: "identificare vulnerabilità non patchate su EC2" o "scansionare immagini container alla ricerca di CVE" → Inspector. "Rilevare chiamate API insolite o credenziali compromesse" → GuardDuty. "Trovare PII o dati sensibili in S3" → Macie.
- **Security Hub**: Aggrega i finding di sicurezza da più servizi e account. Scenario d'esame: "l'azienda ha più account AWS e vuole una vista unica di tutti i finding di sicurezza" → Security Hub.
- **Regole basate sulla frequenza in WAF**: Usate per limitare le richieste per IP entro una finestra temporale. Diverse dal Core Rule Set (che corrisponde a pattern di attacco). L'esame usa le regole basate sulla frequenza per "prevenire tentativi di login a forza bruta" o "mitigare lo scraping."
- **CloudTrail + GuardDuty + Security Hub**: Questi tre insieme formano il nucleo dell'osservabilità di sicurezza di AWS. Abilita prima CloudTrail (GuardDuty e Security Hub dipendono da esso), poi GuardDuty, poi Security Hub per aggregare i finding.

## Esercizi

**Esercizio 1 — Richiamo**

Spiega la differenza tra AWS WAF e Amazon GuardDuty. Da cosa protegge ciascun servizio, e a quale livello opera ciascuno?

*(Suggerimento: Shield ferma l'inondazione, WAF filtra l'acqua, e GuardDuty osserva le tubature alla ricerca di flussi insoliti.)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: Il sito web di un'azienda di vendita al dettaglio è preso di mira da una botnet che invia milioni di richieste all'ora alla sua API di ricerca prodotti. Le richieste appaiono legittime (stringhe User-Agent valide, cookie di sessione validi) ma non si traducono in acquisti — stanno facendo scraping dei prezzi dei prodotti. L'attacco sta causando tempi di risposta lenti per i clienti legittimi.

Quale combinazione di servizi affronta MEGLIO questa minaccia?

A) AWS WAF con regole di rate limiting e CloudFront  
B) AWS Shield Advanced e CloudFront  
C) Amazon GuardDuty e AWS Shield Standard  
D) Network ACL che bloccano gli intervalli IP della botnet

**Suggerimento 1**: Le richieste sono a livello HTTP (livello applicativo). Quale servizio opera al livello HTTP?

**Suggerimento 2**: Le botnet usano molti indirizzi IP diversi — bloccare specifici intervalli IP a livello di NACL è inefficace contro le grandi botnet.

**Suggerimento 3**: Il rate limiting per indirizzo IP può rallentare lo scraping anche se non puoi bloccarlo completamente.

**Risposta**: A

**Spiegazione**: AWS WAF può limitare la frequenza delle richieste per indirizzo IP, riducendo l'impatto dello scraping ad alto volume da qualsiasi singola sorgente. CloudFront distribuisce il traffico in arrivo sulla rete edge di AWS, assorbendo il volume e proteggendo l'origine. Le regole WAF possono anche corrispondere a pattern di richiesta (richieste sequenziali rapide verso lo stesso endpoint API) per identificare il comportamento di scraping.

**Perché non B?** Shield Advanced protegge dai flood DDoS (livello 3/4). Lo scenario descrive scraping a livello applicativo (richieste HTTP di livello 7), che Shield non ispeziona.

**Perché non C?** GuardDuty rileva anomalie nel comportamento del tuo account AWS — non blocca le richieste HTTP in arrivo. Shield Standard non gestisce gli attacchi a livello applicativo.

**Perché non D?** Le grandi botnet usano migliaia di indirizzi IP da sorgenti distribuite. Bloccare intervalli specifici è un approccio "acchiappa la talpa" che fallisce contro le botnet sofisticate.

*SAA-C03 Dominio: Progettazione di Architetture Sicure — Task 1.2*

**Esercizio 3 — Sfida di Architettura**

Nimbus sta valutando il proprio modello di minacce mentre si prepara a gestire i dati delle carte di credito. Una revisione di conformità PCI-DSS richiede:

- Protezione contro gli attacchi DDoS a livello di rete
- Filtraggio a livello applicativo per gli exploit web noti
- Registrazione di tutte le chiamate API in un archivio a lungo termine e a prova di manomissione
- Rilevamento di pattern di accesso insoliti al servizio di pagamento

Mappa ogni requisito a uno specifico servizio o configurazione AWS. Shield Standard è sufficiente, o il contesto PCI-DSS suggerisce Advanced? Dove collegheresti WAF?

*(Non esiste una singola risposta corretta. L'obiettivo è esercitarsi a mappare i requisiti di conformità sui servizi AWS.)*

## Scena Post-Crediti

GuardDuty era abilitato.

Quarantotto ore dopo, generò il suo primo finding: *"L'istanza EC2 i-0abc123 sta comunicando con un nodo di uscita Tor noto."*

Leo guardò l'ID dell'istanza.

"È l'istanza di monitoraggio interna," disse. "Quella che ho configurato per eseguire le diagnostiche di rete."

"Dovrebbe comunicare con nodi di uscita Tor?"

"No." Fece una pausa. "Perché dovrebbe?"

Aprì l'istanza. Qualcuno ci aveva installato uno strumento — uno scanner di rete open-source legittimo che, si scoprì, comunicava anche con l'infrastruttura Tor per la raccolta anonimizzata di dati.

"Quindi lo strumento chiamava casa," disse Priya.

"A mia insaputa," confermò Leo.

"Questo è un rischio di supply chain. Una dipendenza che fa cose che non hai autorizzato."

Leo disinstallò lo strumento. Impostò un processo per rivedere ogni strumento di terze parti prima dell'installazione.

"È questo il livello di paranoia a cui siamo arrivati?" chiese Maya.

"Sì," disse Priya.

"È questo il livello a cui avremmo sempre dovuto essere?" chiese Maya.

"Anche sì," disse Priya.

Nel prossimo capitolo: cosa succede quando il data center in Oregon scompare — e perché Nimbus continua a funzionare.
