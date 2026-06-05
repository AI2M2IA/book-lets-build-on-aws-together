# Capitolo 17: Gli Osservatori

L'incidente con l'indirizzo IP rumeno era stato contenuto. I segreti erano in Secrets Manager. Le credenziali erano state ruotate. I controlli di rete erano stati rafforzati.

Ma Priya aveva posto la domanda che aveva concluso il Capitolo 16: "Se qualcosa di insolito apparisse in CloudTrail, come lo sapremmo?".

La risposta onesta era: probabilmente non lo saprebbero.

CloudTrail registra migliaia di eventi al giorno. Nessuno legge tutti questi log. Priya controllava manualmente ogni settimana, ma questo significava che qualcosa poteva accadere di martedì e non essere notato fino al lunedì successivo.

"Abbiamo bisogno di qualcosa che osservi i log per noi", disse.

Maya alzò lo sguardo. "Automaticamente?"

"Automaticamente."

La seconda domanda di Tom del giorno: "Quanto costa?".

**Tre Categorie di Minacce**

Le minacce alla sicurezza a un'applicazione cloud generalmente rientrano in tre categorie:

**Attacchi di volume (DDoS)**: Un attaccante invia così tanta traffico che la tua applicazione non riesce a rispondere agli utenti legittimi. L'attacco potrebbe essere milioni di richieste HTTP, o un'ondata di pacchetti TCP SYN progettati per esaurire la tabella di connessione del server.

**Attacchi alle applicazioni (Exploit)**: Un attaccante invia richieste appositamente create progettate per sfruttare le vulnerabilità della tua applicazione – SQL injection, cross-site scripting, input malformato che fa crashare un parser.

**Anomalie comportamentali (Ricognizione e compromissione)**: Chiamate API che non dovrebbero verificarsi (qualcuno che interroga l'intero database degli utenti a mezzanotte), attività IAM insolite (credenziali utilizzate da un nuovo paese), o traffico di rete verso destinazioni inaspettate.

AWS ha un servizio dedicato per ciascuno:

- **AWS Shield**: Protezione DDoS
- **AWS WAF**: Protezione a livello di applicazione
- **Amazon GuardDuty**: Rilevamento di minacce comportamentali

**AWS Shield: L'Assorbitore DDoS**

**AWS Shield Standard** è abilitato automaticamente per tutti i clienti AWS a nessun costo aggiuntivo. Protegge contro gli attacchi DDoS più comuni a livello 3 (rete) e 4 (trasporto) – SYN flood, UDP flood, attacchi di amplificazione DNS.

CloudFront, Route 53 ed Elastic Load Balancing si trovano al bordo della rete AWS. Quando un attacco DDoS mira alla tua applicazione, colpisce per primo questi servizi gestiti. L'infrastruttura di rete AWS assorbe l'attacco prima che raggiunga le istanze EC2.

**AWS Shield Advanced** è il livello premium ($3.000 al mese per organizzazione). Aggiunge:

- Protezione per EC2, ELB, CloudFront, Global Accelerator e Route 53
- Notifiche di attacco quasi in tempo reale
- Accesso al Team di Risposta AWS Shield (SRT) – ingegneri di sicurezza che possono aiutarti a rispondere agli attacchi
- Protezione dei costi: se un attacco fa aumentare la tua bolletta, AWS accredita gli aumenti di costo
- Rilevamento e mitigazione avanzati delle DDoS a livello 7 (livello applicazione)

"Tre mila dollari al mese?", disse Tom.

"Per le aziende che gestiscono milioni di dollari di entrate, un DDoS che li fa rimanere giù per due ore costa più di tre mila dollari", disse Priya.

Tom fece il calcolo silenziosamente.

"Inizieremo con Standard", disse alla fine.

**AWS WAF: Il Filtro Applicazione**

**AWS WAF (Web Application Firewall)** opera a livello HTTP – ispeziona il contenuto delle richieste web prima che raggiungano la tua applicazione.

WAF è configurato con **Web ACL (Access Control Lists)** – insiemi di regole che definiscono cosa consentire, bloccare o contare.

WAF può essere allegato a:

- Distribuzioni CloudFront (ispeziona le richieste al limite, globalmente)
- Load Balancer di Applicazione (ispeziona le richieste a livello regionale)
- API Gateway
- AWS AppSync

**Regole Gestite WAF**: AWS e fornitori di terze parti pubblicano insiemi di regole predefinite:

- **Regole Gestite WAF - Core Rule Set**: Protegge contro le vulnerabilità OWASP Top 10 (SQL injection, XSS, command injection, path traversal, ecc.)
- **Regole Gestite WAF - Input Dannosi Noti**: Blocca le richieste che corrispondono a modelli di attacco noti
- **Regole Gestite WAF - Lista di Reputazione IP Amazon**: Blocca gli indirizzi IP noti per essere associati a botnet e scanner
- **Regole Gestite WAF - Controllo Bot**: Identifica e gestisce il traffico dei bot

Puoi anche creare regole personalizzate:

- "Blocca qualsiasi richiesta con l'intestazione User-Agent contenente 'sqlmap'" (uno scanner SQL injection comune)
- "Limita il tasso: consente non più di 1000 richieste per IP ogni 5 minuti"
- "Blocca le richieste che contengono `<script>` in qualsiasi valore di parametro"

Per Nimbus, la configurazione pratica: WAF sulla distribuzione CloudFront con il Core Rule Set abilitato. Questo blocca i modelli di attacco più comuni prima che le richieste raggiungano le istanze EC2.

Ecco la traduzione in italiano:

I modelli di machine learning identificano schemi che deviano dalla tua baseline. GuardDuty genera **findings** – avvisi categorizzati – quando rileva anomalie.

Esempi di ciò che GuardDuty può rilevare:

- Un utente IAM che accede da un indirizzo IP non riconosciuto (in un paese in cui non ha mai utilizzato)
- Chiamate API effettuate da un nodo di uscita di Tor
- Un'istanza EC2 che comunica con un pool di mining di criptovalute noto
- Volume di chiamate API insolitamente elevato (abuso di credenziali o scansione)
- Un bucket S3 accessibile da un indirizzo IP che è stato contrassegnato per attività malevole
- Traffico in uscita verso un dominio noto per essere associato a comandi e controllo malware

"Questo avrebbe intercettato l'IP rumeno," disse Leo con calma.

"Se avessimo attivato GuardDuty, avrebbe segnalato l'istanza EC2 che effettua connessioni in uscita a un indirizzo IP esterno non riconosciuto alle 2 del mattino," confermò Priya.

"Quanto costa?"

Il prezzo di GuardDuty si basa sul volume di log analizzati – eventi CloudTrail, dati di flusso VPC, query DNS. Per un'applicazione piccola o media, tipicamente 50-150 dollari al mese. A livello di scala, è comunque una piccola frazione dei costi di infrastruttura.

Tom aprì il pannello di controllo e lo attivò.

**Connessione dei Tre Servizi**

Shield, WAF e GuardDuty operano a diversi livelli e si completano a vicenda:

| Servizio    | Livello                     | Protegge contro                            | Azione                             |
|------------|---------------------------|---------------------------------------------|------------------------------------|
| AWS Shield | Rete/Trasporto (L3/L4) | Inondazioni DDoS                         | Assorbe/mitiga gli attacchi          |
| AWS WAF    | Applicazione (L7)          | OWASP Top 10, bot, scraper                | Consente, blocca o conta le richieste |
| GuardDuty  | Comportamentale (tutti i log) | Anomalie, credenziali compromesse, malware | Rileva e avvisa                    |

Shield ferma l'inondazione. WAF filtra l'acqua. GuardDuty osserva il flusso idraulico per schemi insoliti.

**CloudTrail: La Fondamenta**

Tutti e tre i servizi si basano sui log. **AWS CloudTrail** è il servizio di logging che cattura ogni chiamata API nel tuo account AWS – chi ha chiamato cosa, quando, da dove, con quale risultato.

CloudTrail è abilitato per impostazione predefinita per una cronologia di 90 giorni nel pannello di controllo. Per mantenere i log a lungo termine:

1. Crea un percorso che scriva in un bucket S3
2. Opzionalmente, invia a CloudWatch Logs per avvisi in tempo reale
3. Abilita la convalida dei file di log (per rilevare se i log sono stati alterati)

GuardDuty, AWS Config e Security Hub leggono tutti da CloudTrail. Senza i log di CloudTrail, questi servizi non hanno nulla su cui analizzare.

**AWS Security Hub: Il Pannello di Controllo**

Se stai eseguendo più account AWS o hai bisogno di una visione consolidata dei risultati dei rilevamenti sulla sicurezza, **AWS Security Hub** aggrega i rilevamenti da GuardDuty, Inspector (valutazione della vulnerabilità), Macie (privacy dei dati), Config e Firewall Manager in un unico pannello di controllo.

Controlla anche la tua configurazione rispetto alle migliori pratiche di sicurezza (lo standard AWS Foundational Security Best Practices) e il benchmark CIS AWS Foundations.

Per Nimbus: Security Hub non era necessario ancora. Quando sarebbero cresciuti a tre account (sviluppo, staging, produzione), sarebbe diventato utile.

## Punti di Forza e Limitazioni

**AWS Shield**:

- Standard: gratuito e automatico – non c'è motivo di non usarlo
- Avanzato: eccellente per bersagli di alto profilo; costoso per piccoli team

**AWS WAF**:

- I gruppi di regole gestite semplificano notevolmente la configurazione
- Le regole personalizzate richiedono la comprensione dei modelli di attacco HTTP
- Il limitazione del tasso è una funzionalità potente spesso trascurata
- WAF non è un sostituto del codice di applicazione sicuro – è un livello di difesa a profondità

**GuardDuty**:

- Estremamente facile da abilitare (pochi clic)
- I rilevamenti richiedono una revisione e una risposta umana – GuardDuty rileva, non corregge
- Si verificano falsi positivi – alcune attività legittime appaiono anomale ai modelli di machine learning
- Periodo di prova di 30 giorni – vale la pena abilitarlo immediatamente

## Riepilogo

- **AWS Shield Standard**: Gratuito, protezione DDoS automatica a livello 3/4. Sempre attivo.
- **AWS Shield Advanced**: Protezione DDoS premium con accesso SRT e protezione dei costi. Caso d'uso enterprise.
- **AWS WAF**: Firewall a livello di applicazione. Ispeziona e filtra le richieste HTTP. Attacca a CloudFront, ALB o API Gateway. Usa i gruppi di regole gestite per la protezione OWASP Top 10.
- **Amazon GuardDuty**: Rilevamento delle minacce comportamentale. Analizza CloudTrail, VPC Flow Logs e log DNS. Genera rilevamenti per attività anomale.
- **CloudTrail**: La base di tutti i logging AWS sulla sicurezza. Abilita un percorso che scriva in S3 per la conservazione a lungo termine.
- Questi servizi si completano a vicenda: Shield a livello di rete, WAF a livello di applicazione, GuardDuty a livello comportamentale.

## Suggerimenti per l'Esame

*SAA-C03 Domain: Design Secure Architectures (Domain 1, Task 1.2)*

- **Shield Standard vs Advanced**: Standard è gratuito e automatico. Advanced ha un costo e aggiunge SRT, protezione dai costi, e rilevamento più avanzato. Segnali di allarme per Advanced: "attacchi DDoS su larga scala", "garanzia di SLA durante gli attacchi", "protezione finanziaria contro picchi di costi dovuti a DDoS".
- **Uso del WAF**: "blocca SQL injection", "blocca scripting cross-site", "limita il tasso di chiamate API", "blocca user-agent specifici", "protezione OWASP Top 10" → WAF.
- **Segnali di GuardDuty**: "rileva attività API insolite", "identifica credenziali compromesse", "segnala connessioni di rete EC2 anomale", "intelligence sulle minacce" → GuardDuty.
- **Attacco del WAF**: Può essere collegato a CloudFront (globale), ALB (regionale), API Gateway (regionale), AppSync.
- **Fonti di dati per GuardDuty**: Eventi di gestione di CloudTrail, eventi di dati S3 di CloudTrail, VPC Flow Logs, log DNS. Potrebbe esserci un esame che chiede quale fonte di dati è rilevante per uno scenario di rilevamento specifico.
- **Macie**: Spesso confuso con GuardDuty. **Macie** utilizza l'ML per rilevare dati sensibili in S3 (DPI, credenziali, dati finanziari). **GuardDuty** rileva minacce e anomalie nel comportamento. Usi diversi.

## Esercizi

**Esercizio 1 — Ricordo**

Spiega la differenza tra AWS WAF e Amazon GuardDuty. Cosa protegge ciascun servizio e a quale livello opera ciascuno?

*(Suggerimento: pensa al WAF come a un filtro sulle richieste in entrata e a GuardDuty come a un analista comportamentale che osserva i tuoi log.)*

**Esercizio 2 — Esercitazione per l'Esame**

*Scenario*: Un'azienda di vendita al dettaglio ha il suo sito web preso di mira da un botnet che invia milioni di richieste all'ora alla sua API di ricerca di prodotti. Le richieste appaiono legittime (stringhe User-Agent valide, cookie di sessione validi) ma non portano a acquisti: sono solo scraping dei prezzi di prodotti. L'attacco sta causando a clienti legittimi tempi di risposta lenti.

Quale combinazione di servizi affronta al meglio questa minaccia?

A) AWS Shield Advanced e CloudFront
B) AWS WAF con regole di limitazione del tasso e CloudFront
C) Amazon GuardDuty e AWS Shield Standard
D) Network ACLs che bloccano gli intervalli IP del botnet

*(Suggerimento 1: Le richieste sono a livello HTTP (applicazione layer). Quale servizio opera a questo livello?)*

*(Suggerimento 2: I botnet usano molti indirizzi IP diversi: bloccare intervalli IP specifici a livello di NACL contro botnet di grandi dimensioni è inefficace.)*

*(Suggerimento 3: Limitare il tasso di richieste a un indirizzo IP può rallentare lo scraping anche se non si riesce a bloccarlo completamente.)*

**Risposta**: B

**Spiegazione**: AWS WAF può limitare il tasso di richieste per indirizzo IP, riducendo l'impatto di un elevato volume di scraping da una singola fonte. CloudFront distribuisce il traffico in entrata sulla rete edge di AWS, assorbendo il volume e proteggendo l'origine. Le regole WAF possono anche corrispondere a modelli di richiesta (richieste sequenziali rapide allo stesso endpoint API) per identificare il comportamento di scraping.

**Perché non A?** Shield Advanced protegge da inondazioni DDoS (livello 3/4). Lo scenario descrive lo scraping a livello di applicazione (livello 7 HTTP richieste), che Shield non ispeziona.

**Perché non C?** GuardDuty rileva anomalie nel comportamento del tuo account AWS: non blocca le richieste HTTP in entrata. Shield Standard non gestisce gli attacchi a livello di applicazione.

**Perché non D?** I botnet usano migliaia di indirizzi IP da fonti distribuite. Bloccare intervalli specifici è un approccio "taglia e falcia" che fallisce contro botnet sofisticate.

*SAA-C03 Domain: Design Secure Architectures — Task 1.2*

**Esercizio 3 — Sfida Architetturale** *(Opzionale)*

Nimbus sta considerando il suo modello di minacce mentre si prepara a gestire dati di carte di credito. Una revisione di conformità PCI-DSS richiede:

- Protezione da attacchi DDoS a livello di rete
- Filtro a livello di applicazione per exploit web noti
- Registrazione di tutte le chiamate API a un archivio a lungo termine e a prova di manomissione
- Rilevamento di schemi di accesso insoliti al servizio di pagamento

Mappa ogni requisito a un servizio o configurazione AWS specifico. È sufficiente Shield Standard o il contesto PCI-DSS suggerisce Advanced? Dove lo si attaccherà WAF?

*(Non esiste una risposta corretta univoca. L'obiettivo è praticare la mappatura dei requisiti di conformità ai servizi AWS.)*

## Scena Post-Crediti

GuardDuty era stato abilitato.

Quarantotto ore dopo, ha generato la sua prima scoperta: *"L'istanza EC2 i-0abc123 sta comunicando con un nodo di uscita Tor noto."*

Leo guardò l'ID dell'istanza.

"Questo è l'istanza di monitoraggio interna", disse. "Quella che ho configurato per eseguire diagnosi di rete."

"È in grado di comunicare con i nodi di uscita Tor?"

"No." Si fermò. "Perché lo farebbe?"

Tirò su l'istanza. Qualcuno aveva installato uno strumento su di essa: uno scanner di rete open-source legittimo che, si scoprì, comunicava anche con l'infrastruttura Tor per la raccolta di dati anonimi.

"Quindi lo strumento stava chiamando a casa", disse Priya.

"Senza che lo sapessi", confermò Leo.

"Questo è un rischio di supply chain: una dipendenza che fa cose che non hai autorizzato."

Leo disinstallò lo strumento. Impostò un processo per rivedere ogni strumento di terze parti prima dell'installazione.

"È a questo livello di paranoia che siamo arrivati?" chiese Maya.

"Sì," rispose Priya.

"È questo il livello che dovremmo sempre essere stati?" chiese Maya.

"Anche sì," rispose Priya.

Nel prossimo capitolo: cosa succede quando il data center in Virginia scompare – e perché Nimbus continua a funzionare.
