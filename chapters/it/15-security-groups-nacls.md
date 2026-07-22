# Capitolo 15: I Guardiani alla Porta

L'ufficio era tranquillo, un martedì mattina, quando Priya aprì i log del traffico di rete e cominciò a leggere. Fuori dalla finestra, la città si stava svegliando. Dentro, lo schermo mostrava qualcosa che non avrebbe dovuto esserci: una connessione in uscita dal server alle 2:17 di notte verso un indirizzo IP in Romania.

La vecchia chiave di deploy della prima versione di Nimbus era ancora attiva. Aveva effettuato tre richieste la settimana precedente. Leo non sapeva cosa le avesse generate.

---

*La revisione IAM di Leo aveva sostituito le chiavi di accesso con i ruoli. Ogni servizio ora aveva esattamente i permessi di cui aveva bisogno. Ma mentre quel lavoro era in corso, un problema più vecchio era silenziosamente peggiorato: una credenziale attiva proveniente da una pipeline di deployment dismessa era ancora viva, e qualcosa l'aveva usata. Il livello IAM era stato rafforzato. I controlli di rete che avrebbero potuto contenere il danno avevano bisogno della stessa attenzione.*

---

Priya caricò i flow log del VPC — registrazioni del traffico di rete che mostrano ogni connessione in entrata e in uscita dal VPC.

"Martedì alle 2:17 di notte," disse, "c'è stata una connessione in uscita dall'istanza EC2 che esegue la vecchia API verso un indirizzo IP in Romania."

"Non è la nostra infrastruttura," disse Leo.

"No."

"Quindi qualcuno era sulla nostra istanza EC2."

"O qualcosa."

Risalirono all'origine: la vecchia chiave di deploy era stata usata per caricare un piccolo script sull'istanza EC2. Lo script aveva tentato di scansionare le porte dei server adiacenti. La maggior parte delle scansioni era fallita.

"I security group li hanno bloccati," disse Priya. "L'attaccante è entrato in un'istanza EC2. Non ha potuto raggiungere le altre perché i security group permettevano il traffico solo dal load balancer."

"L'ho già deployato — oh." Leo aveva deployato una correzione alla regola del security group prima che l'indagine fosse completa. La correzione era giusta, ma l'aveva fatta prima che Priya finisse di leggere i flow log. Lei aveva dovuto fermarsi e verificare che la modifica non avesse influenzato nulla di inaspettato.

"La prossima volta, aspetta che l'indagine sia chiusa prima di pubblicare modifiche," disse lei.

"Quindi il danno è stato contenuto."

"Perché avevamo configurato correttamente i security group. Immagina se avessimo lasciato la porta 5432 aperta a qualsiasi istanza EC2 nell'account."

Leo non aveva bisogno di immaginarlo. Aveva visto quella configurazione nel setup originale.

"Abbiamo pensato a cosa avrebbe significato?" continuò Priya. "Qualsiasi istanza EC2 nell'account — inclusa quella con la chiave compromessa — avrebbe potuto connettersi direttamente al database. Eseguire SQL arbitrario. Scaricare lo storico degli ordini di ogni cliente. Cancellare tabelle."

"Invece sono stati respinti ogni volta che ci hanno provato," disse Leo.

"Sì. Perché il security group del database accetta connessioni solo dal security group dell'API. Non da qualsiasi EC2 nell'account. Non da qualsiasi IP. Specificamente dal security group dell'API."

"Quella singola decisione di design," disse Maya, "è stata la differenza tra un incidente contenuto e una violazione completa dei dati."

"Il design dei security group non è una casella da spuntare," disse Priya. "È la sicurezza effettiva del sistema."

Rafael era rimasto ad ascoltare. "Come si impara qual è la configurazione giusta? Le regole sembrano arbitrarie all'inizio."

"Si comincia elencando cosa deve fare ogni componente," disse Priya. "Il load balancer deve accettare HTTPS da ovunque. Il server API deve accettare HTTP solo dal load balancer. Il database deve accettare PostgreSQL solo dal server API. Redis deve accettare la porta 6379 solo dal server API. Quei requisiti si traducono direttamente in regole inbound. Tutto il resto è negato per impostazione predefinita."

"E l'outbound?"

"L'outbound è dove la gente diventa pigra. La maggior parte dei team lascia l'outbound su allow-all. Ciò significa che un'istanza compromessa può chiamare qualsiasi cosa. Lo restringeremo."

**Due Livelli di Sicurezza di Rete**

In un VPC, hai due strumenti distinti per controllare il traffico di rete:

**Security Group**: Firewall virtuali collegati a singole risorse (istanze EC2, database RDS, load balancer, funzioni Lambda in un VPC). Operano a livello di risorsa.

**Network ACL (NACL)**: Regole firewall collegate alle subnet. Operano al confine della subnet — prima che il traffico raggiunga qualsiasi risorsa in quella subnet.

Capire entrambi richiede la comprensione di una differenza fondamentale: **stateful vs stateless**.

**Stateful: Security Group**

Un security group è **stateful**.

Quando permetti il traffico in entrata su una specifica porta, il traffico di risposta è automaticamente permesso in uscita, anche se non c'è una regola di uscita esplicita per esso.

Quando permetti il traffico in uscita verso una destinazione, la risposta che torna indietro è automaticamente permessa.

Pensa a una guardia di sicurezza stateful all'ingresso di un edificio per uffici. Mostri il tuo badge per entrare. Esci più tardi. La guardia non deve controllarti di nuovo all'uscita — il sistema sa che sei stato fatto entrare, e sei autorizzato a uscire.

**Regole del Security Group per l'istanza EC2 dell'API Nimbus:**

- **In entrata — TCP 8080 — dal SG del Load Balancer** → Accetta il traffico API dall'ALB
- **In entrata — TCP 22 — dal SG del Bastion Host** → SSH solo dal bastion
- **In uscita — TCP 5432 — verso il SG dell'RDS** → Connessione a PostgreSQL
- **In uscita — TCP 6379 — verso il SG di ElastiCache** → Connessione a Redis
- **In uscita — TCP 443 — verso 0.0.0.0/0** → HTTPS verso API esterne

Nota: nessuna regola di uscita esplicita per la porta 8080. La regola di entrata è stateful — il traffico di risposta (la risposta dell'API al load balancer) è automaticamente permesso.

Nota anche: le regole del security group fanno riferimento ad *altri security group*, non a indirizzi IP. "Permetti il traffico in entrata dal security group del load balancer" significa "permetti il traffico da qualsiasi risorsa che ha questo security group collegato." Questo è più flessibile e manutenibile rispetto al tracciare gli indirizzi IP.

**Comportamento predefinito:**

- Per impostazione predefinita, tutto il traffico in entrata è negato
- Per impostazione predefinita, tutto il traffico in uscita è consentito
- Tutte le regole vengono valutate (i security group non hanno regole ordinate — tutte le regole corrispondenti si applicano)
- I security group possono solo **permettere** il traffico — non è possibile creare regole esplicite di negazione

**Stateless: Network ACL**

Una NACL è **stateless**.

Quando permetti il traffico in entrata sulla porta 8080, ciò copre solo l'entrata. La risposta (il traffico in uscita su porte effimere) deve essere permessa esplicitamente con una regola di uscita.

Pensa a un metal detector. Lo attraversi all'entrata. Il metal detector non sa che sei già passato — devi attraversarlo di nuovo all'uscita.

**Le regole NACL sono numerate e valutate in ordine.** La prima regola che corrisponde vince. La regola 100 viene valutata prima della regola 200. Se la regola 100 nega il traffico e la regola 200 lo consente, il traffico viene negato.

Le NACL possono esplicitamente **negare** il traffico — a differenza dei security group, che possono solo consentire. Questo le rende utili per bloccare intervalli di IP specifici.

**Comportamento predefinito delle NACL:**

- La NACL predefinita (creata con il tuo VPC) consente tutto il traffico in entrata e in uscita
- Una NACL personalizzata nega tutto il traffico per impostazione predefinita (devi consentire esplicitamente ciò che vuoi)

**NACL per la subnet pubblica (semplificata):**

*Regole in entrata (valutate in ordine — la prima corrispondenza vince):*

- Regola 100: TCP 443, da 0.0.0.0/0 → **Consenti** (HTTPS)
- Regola 110: TCP 80, da 0.0.0.0/0 → **Consenti** (HTTP)
- Regola 120: TCP 1024–65535, da 0.0.0.0/0 → **Consenti** (porte di ritorno effimere)
- Regola \*: Tutto il traffico → **Nega**

*Regole in uscita:*

- Regola 100: TCP 443, verso 0.0.0.0/0 → **Consenti** (HTTPS)
- Regola 110: TCP 80, verso 0.0.0.0/0 → **Consenti** (HTTP)
- Regola 120: TCP 1024–65535, verso 0.0.0.0/0 → **Consenti** (porte di ritorno effimere)
- Regola \*: Tutto il traffico → **Nega**

La regola 120 (porte 1024-65535) consente le porte effimere — le porte temporanee ad alto numero usate per il traffico di risposta TCP. Poiché le NACL sono stateless, devi consentirle esplicitamente in uscita, altrimenti le risposte del tuo server non passeranno.

**Quando Usare Cosa**

"Aspetta — ma *perché* dovremmo farlo in questo modo?" chiese Maya. "Perché avere due strumenti separati — security group *e* NACL — se i security group funzionano già? Qual è il senso della complessità in più?"

La risposta è che operano a livelli diversi e hanno capacità diverse. I security group proteggono singole risorse e possono solo consentire il traffico. Le NACL proteggono intere subnet e possono negare esplicitamente. Avere entrambi significa poter applicare regole di permesso a grana fine a livello di risorsa e regole di negazione ampie a livello di subnet — senza che l'uno interferisca con l'altro.

Usa i **security group** come livello primario di controllo degli accessi. Sono più facili da gestire, stateful (meno probabilità di blocchi accidentali per aver dimenticato le porte effimere) e supportano il riferimento ad altri security group.

Usa le **NACL** per i controlli a livello di subnet, in particolare:

- **Regole di negazione esplicite**: Blocca un indirizzo IP o un intervallo specifico dal raggiungere un'intera subnet
- **Blocco di emergenza**: Un IP sta attivamente attaccando — aggiungi una regola di negazione NACL per bloccare l'intera subnet prima che raggiunga qualsiasi risorsa

Forse ti starai chiedendo: se i security group sono stateful e bloccano tutto il traffico in entrata per impostazione predefinita, quando servirebbero davvero le NACL? I security group gestiscono bene la maggior parte dei casi. Ma c'è una cosa che non possono fare: negare esplicitamente. Un security group può solo consentire il traffico — se una regola non corrisponde, il traffico è negato per impostazione predefinita. Non puoi aggiungere una regola che dica "blocca questo IP specifico." Per quello, ti serve una NACL: una regola di negazione numerata che ferma uno specifico intervallo di indirizzi prima che raggiunga qualsiasi risorsa nella subnet. Le NACL sono utili soprattutto per la risposta di emergenza (bloccare un attaccante attivo) e per far rispettare confini a livello di subnet che non dovrebbero dipendere dalla configurazione delle singole risorse.

"Quindi il security group è il controllo a grana fine," disse Maya, "e la NACL è la pennellata ampia?"

"I security group proteggono le singole risorse," confermò Priya. "Le NACL proteggono intere subnet. Quando vuoi bloccare un IP dal raggiungere qualsiasi cosa nella tua rete, NACL. Quando vuoi consentire solo al load balancer di raggiungere il server API, security group."

"Abbiamo pensato a cosa succede se l'attaccante torna con un IP diverso?" disse Priya. "La NACL blocca un intervallo. Loro si spostano su un altro."

"È a questo che serve GuardDuty," disse Leo. "Rilevamento comportamentale. Se lo stesso script viene eseguito da un nuovo IP, il pattern di traffico è lo stesso."

"Ci arriveremo," disse Priya. "Prima le cose più importanti."

"Quanto costa tutto questo al mese?" chiese Tom.

I security group e le NACL in sé sono gratuiti. AWS non fa pagare per il numero di security group, il numero di regole o il numero di voci NACL. La considerazione sui costi è indiretta: regole outbound dei security group più strette possono far passare meno traffico attraverso il NAT Gateway, riducendo i costi di elaborazione dei dati.

"Quindi i controlli di sicurezza sono gratuiti," disse Rafael. "Il costo è l'infrastruttura che li supporta."

"Corretto. I NAT Gateway per l'alta disponibilità. Gli Interface VPC Endpoint per i servizi che altrimenti passerebbero dal NAT. Quelli hanno dei costi. Le regole dei security group in sé no."

**Mettere Tutto Insieme: La Difesa a Strati**

Dopo l'incidente, Priya disegnò gli strati di difesa di Nimbus sulla lavagna:

```
Internet
  ↓
CloudFront + Shield (assorbimento DDoS)
  ↓
WAF (filtraggio a livello applicativo)
  ↓
Internet Gateway
  ↓
NACL sulla subnet pubblica (regole a livello di subnet, blocco di emergenza)
  ↓
Security Group dell'ALB (HTTPS da ovunque)
  ↓
NACL sulla subnet privata delle applicazioni
  ↓
Security Group dell'API EC2 (porta 8080 solo dal SG dell'ALB)
  ↓
NACL sulla subnet privata dei dati
  ↓
Security Group dell'RDS (porta 5432 solo dal SG dell'API)
```

"Ogni strato assume che quello precedente possa fallire," disse. "Il database non si fida del fatto che il livello di rete abbia fermato l'attaccante. L'istanza EC2 non si fida del fatto che l'ALB abbia fermato l'attaccante. Ogni strato applica le proprie regole in modo indipendente."

"Difesa in profondità," disse Maya.

"Difesa in profondità. Un attaccante che supera uno strato si trova comunque davanti il successivo. Nessuna singola configurazione errata è catastrofica. Significa che uno strato fallisce, e gli altri reggono."

Leo guardò il diagramma. L'attaccante aveva compromesso una istanza EC2. Aveva superato il livello delle credenziali. Ma ogni strato successivo aveva retto.

Ecco com'era la difesa in profondità nella pratica.

**L'Incidente: Cosa Hanno Catturato gli Strati**

Tornando all'attacco dell'IP rumeno:

**Cosa è successo**: L'attaccante ha usato la chiave di deploy compromessa per caricare uno script di scansione su un'istanza EC2. Lo script ha tentato di connettersi ad altri servizi.

**Cosa li ha fermati**:

- Il security group dell'RDS consentiva l'ingresso solo sulla porta 5432 dal security group dell'API EC2. Lo script non poteva raggiungere il database da uno strumento di scansione — non aveva il security group giusto collegato.
- Il security group di ElastiCache consentiva l'ingresso solo sulla porta 6379 dal security group dell'API EC2.
- Le altre istanze EC2 consentivano SSH solo dal security group del bastion host.

**Cosa non li ha fermati**:

- Le regole di uscita dell'istanza EC2 consentivano HTTPS verso 0.0.0.0/0 (necessario per il download dei pacchetti). Lo script ha usato questo per effettuare connessioni in uscita verso il server dell'attaccante.

Dopo l'incidente, Priya aggiunse:

- Una regola NACL che bloccava l'intervallo IP rumeno
- Una regola di uscita più restrittiva sulle istanze EC2 (consentiva solo destinazioni specifiche note e affidabili)
- Una verifica che **IMDSv2 fosse imposto** (`HttpTokens=required`) su ogni istanza — lo script era stato eseguito *sull'istanza*, il che significava che avrebbe potuto interrogare il servizio di metadati per le credenziali temporanee del ruolo dell'istanza. Leo aveva imposto IMDSv2 nel capitolo precedente; Priya verificò che fosse ancora obbligatorio ovunque, perché un attaccante con esecuzione di codice più IMDSv1 equivale a credenziali AWS rubate.

---

**Leggere i Flow Log: Cosa Vide Priya**

L'indagine cominciò dai flow log del VPC. Priya aprì CloudWatch Logs Insights ed eseguì una query sul log group dei flow log delle ultime 48 ore:

```
fields @timestamp, srcAddr, dstAddr, srcPort, dstPort, action
| filter srcAddr = "10.0.10.7"
| filter action = "REJECT"
| sort @timestamp asc
```

`10.0.10.7` era l'istanza EC2 compromessa. Il filtro REJECT mostrava i tentativi di connessione che erano stati bloccati.

I risultati:

```
10.0.10.7 → 10.0.10.8  porta 22    REJECT   # Altra istanza EC2 — SSH bloccato
10.0.10.7 → 10.0.10.9  porta 22    REJECT   # Un'altra EC2 — SSH bloccato
10.0.10.7 → 10.0.20.8  porta 5432  REJECT   # RDS — bloccato dal security group
10.0.10.7 → 10.0.20.9  porta 5432  REJECT   # Replica RDS — bloccata
10.0.10.7 → 10.0.20.11 porta 6379  REJECT   # Redis — bloccato
```

La scansione aveva colpito ogni servizio interno. Ogni tentativo era stato respinto. Il design dei security group aveva retto.

Ma c'era anche una voce ACCEPT in uscita:

```
10.0.10.7 → 185.220.101.55  porta 443  ACCEPT   2847 byte
```

Quello era il tentativo di esfiltrazione dei dati — 2,8 kilobyte inviati all'IP rumeno via HTTPS. Il security group consentiva HTTPS in uscita per il download legittimo dei pacchetti. L'attaccante aveva usato quella regola.

"I security group hanno fermato il movimento laterale," disse Priya, guidando il team attraverso i log. "Ma la regola di uscita era troppo permissiva. Consentivamo HTTPS verso qualsiasi destinazione. Dovremmo consentire HTTPS solo verso endpoint AWS noti — CloudWatch, Secrets Manager, S3 — e verso le CDN dei repository di pacchetti."

Mostrò le regole di uscita aggiornate del security group:

```
TCP 443 → pl-68a54001 (prefix list dell'endpoint gateway S3 di AWS)
TCP 443 → pl-02cd2c6b (AWS CloudWatch Logs)
TCP 443 → 54.239.0.0/18 (repository di pacchetti AWS — si restringe nel tempo)
```

"Questo elimina la regola generica di HTTPS in uscita. L'HTTPS in uscita ora va solo verso destinazioni note e affidabili."

"E le funzioni Lambda che chiamano API di terze parti?" chiese Leo.

"Quelle passano attraverso il NAT Gateway, che ha la sua regola di uscita dedicata," disse Priya. "Lambda non usa il security group dell'EC2. Interfaccia di rete diversa, set di regole diverso."

---

**La Storia del Debug Stateless**

Due settimane dopo l'incidente, Rafael — ancora nel suo primo mese — stava aiutando a configurare una nuova pipeline dati. Coinvolgeva una funzione Lambda in un VPC che doveva chiamare un'API interna in esecuzione su EC2.

La funzione Lambda andava in timeout. Ogni chiamata andava in timeout.

Rafael controllò i security group. Il security group della Lambda aveva una regola di uscita per TCP 8080 verso il security group dell'EC2. Il security group dell'EC2 aveva una regola di entrata per TCP 8080 dal security group della Lambda. Le regole sembravano corrette.

Si rivolse a Leo. "I security group sembrano a posto. Perché va in timeout?"

Leo guardò la configurazione della subnet. La funzione Lambda era in una subnet privata. La subnet aveva una NACL personalizzata che Priya aveva applicato durante l'hardening di sicurezza.

Guardò le regole di uscita della NACL:

```
Regola 100: TCP 443  → 0.0.0.0/0  ALLOW
Regola 110: TCP 5432 → 10.0.20.0/24 ALLOW
Regola *:   Tutto    → 0.0.0.0/0  DENY
```

"La NACL consente HTTPS in uscita e PostgreSQL in uscita," disse Leo. "Non consente TCP 8080 in uscita."

"Il security group lo consente," disse Rafael.

"La NACL no. E la NACL è stateless. Anche se il security group della funzione Lambda consente la connessione in uscita, la NACL al confine della subnet valuta comunque il traffico in uscita. La NACL sta bloccando la chiamata della Lambda prima che lasci la subnet."

"Ma se aggiungo ALLOW per TCP 8080 in uscita alla NACL—"

"Devi anche aggiungere ALLOW per le porte effimere in entrata," disse Leo. "La risposta dall'istanza EC2 torna indietro su una porta casuale tra 1024 e 65535. Se le regole di entrata della NACL non le consentono, la risposta viene bloccata nel viaggio di ritorno."

Rafael aggiornò la NACL:

```
Regola 100:  TCP 443       → 0.0.0.0/0      ALLOW  (in uscita)
Regola 105:  TCP 8080      → 10.0.10.0/24   ALLOW  (in uscita verso la subnet EC2)
Regola 110:  TCP 5432      → 10.0.20.0/24   ALLOW  (in uscita verso la subnet DB)
Regola *:    Tutto         → 0.0.0.0/0      DENY
```

E sul lato in entrata:

```
Regola 100:  TCP 1024-65535 da 10.0.10.0/24  ALLOW  (traffico di ritorno dall'EC2)
Regola *:    Tutto                           DENY
```

La funzione Lambda si connesse immediatamente.

"Ecco perché la gente odia le NACL," disse Rafael.

"Ecco perché devi capirle," disse Priya. "I bug che creano sono precisamente i bug che sono progettate per prevenire — flussi di traffico inattesi. Capire il modello stateless ti dice esattamente dove guardare quando una connessione fallisce misteriosamente."

"Security group stateful — traffico di ritorno automatico. NACL stateless — il traffico di ritorno richiede regole esplicite," ripeté Rafael.

"Ripetilo finché non diventa parte del tuo modo di pensare," disse Priya.

---

**Blocco di Emergenza con NACL: La Regola del /24**

Dopo aver identificato l'intervallo IP di origine dell'attaccante, la risposta di Priya fu immediata: aggiungere una regola di negazione NACL.

Ma non bloccò solo il singolo IP. Bloccò l'intero `/24` — la subnet di 256 indirizzi da cui operava l'attaccante.

"Perché tutto il /24?" chiese Leo.

"Perché bloccare i singoli IP è un gioco perso in partenza. Gli attaccanti usano più IP all'interno di un intervallo, ruotandoli quando uno viene bloccato. Bloccare il /24 rende le cose più difficili — dovrebbero spostarsi su un blocco di indirizzi diverso, il che gli costa tempo e fatica."

La regola NACL:

```
Regola 90:  TUTTO da 185.220.101.0/24 → DENY
```

La regola 90 viene valutata prima di qualsiasi regola di permesso (che iniziano dalla regola 100). L'intero intervallo viene bloccato prima che qualsiasi regola di permesso venga considerata.

"E questo si applica a ogni risorsa nella subnet?" chiese Leo.

"A ogni risorsa. È questo il punto di una NACL — si applica prima che il traffico raggiunga il security group di qualsiasi singola risorsa. Una negazione NACL alla regola 90 significa che il pacchetto non arriva mai alla valutazione del security group."

"Potremmo farlo con un security group invece?"

"No. I security group possono solo consentire il traffico. Non esiste una regola di negazione. Se vuoi bloccare un IP specifico dal raggiungere qualsiasi risorsa in una subnet, la NACL è l'unica opzione."

Questo è il caso d'uso primario delle regole di negazione NACL: la risposta di emergenza ad attacchi attivi. Il security group è il meccanismo di controllo primario. La NACL è il freno di emergenza.

---

**Pattern di Design dei Security Group: Riferimento per ID**

"Abbiamo pensato a cosa succede quando le nostre istanze EC2 vengono sostituite?" chiese Priya. "L'Auto Scaling termina le vecchie istanze e ne lancia di nuove. Le nuove istanze ricevono nuovi indirizzi IP privati."

"Se le regole dei security group facessero riferimento a indirizzi IP," disse Leo lentamente, "dovremmo aggiornare le regole ogni volta che un'istanza viene sostituita."

"Esatto. Ed è per questo che non si fanno riferimenti a indirizzi IP nelle regole dei security group per il traffico intra-VPC."

I security group possono fare riferimento ad altri security group invece che a indirizzi IP. Quando una regola dice "consenti l'ingresso dal security group del load balancer," significa "consenti il traffico da qualsiasi risorsa che ha il security group del load balancer collegato." L'Auto Scaling può lanciare mille nuove istanze, ciascuna con un nuovo IP, e la regola rimane valida.

La struttura dei security group di Nimbus:

```
nimbus-alb-sg (Load Balancer)
  - In entrata: TCP 443 da 0.0.0.0/0
  - In entrata: TCP 80 da 0.0.0.0/0

nimbus-api-sg (istanze EC2 dell'API)
  - In entrata: TCP 8080 da nimbus-alb-sg
  - In entrata: TCP 22 da nimbus-bastion-sg
  - In uscita: TCP 5432 verso nimbus-rds-sg
  - In uscita: TCP 6379 verso nimbus-redis-sg

nimbus-rds-sg (RDS)
  - In entrata: TCP 5432 da nimbus-api-sg

nimbus-redis-sg (ElastiCache)
  - In entrata: TCP 6379 da nimbus-api-sg

nimbus-bastion-sg (Bastion Host)
  - In entrata: TCP 22 da <IP della VPN dell'ufficio>
```

Nessun indirizzo IP per il traffico interno. Solo ID di security group. Quando un'istanza viene sostituita, l'appartenenza al security group si trasferisce automaticamente alla nuova istanza.

"E per i microservizi che stiamo pianificando?" chiese Rafael. "Prima o poi avremo una dozzina di servizi. Ognuno deve parlare con alcuni degli altri, ma non con tutti."

"Ogni servizio riceve il proprio security group," disse Priya. "Il security group del Servizio A viene referenziato nelle regole di entrata di ogni servizio che il Servizio A è autorizzato a chiamare. I servizi che non dovrebbero comunicare semplicemente non si riferiscono ai security group l'uno dell'altro."

Questo è il **pattern hub-and-spoke dei security group** per i microservizi. Un security group condiviso del database ha regole di entrata da cinque diversi security group di servizi. Se un sesto servizio ha bisogno di accedere al database, aggiungi il suo security group alla regola di entrata del database. Se l'accesso va rimosso, rimuovi il riferimento. Nessuna gestione di IP. Nessuna regola obsoleta che punta a server dismessi.

"Il security group è l'identità," disse Priya. "L'indirizzo IP è un accidente dello scheduling."

---

**Firewall a Privilegio Minimo: La Disciplina**

"Abbiamo pensato a qual è la postura corretta per le regole di uscita?" chiese Priya durante la revisione post-incidente.

La maggior parte dei team lascia le regole di uscita dei security group EC2 al valore predefinito: consenti tutto in uscita. È comodo — l'applicazione può chiamare qualsiasi cosa — ma non è privilegio minimo.

Il principio di Priya: le regole di uscita devono essere specifiche quanto le regole di entrata.

Le regole di uscita del security group dell'API Nimbus, dopo l'hardening:

```
TCP 5432 → nimbus-rds-sg       (PostgreSQL verso RDS)
TCP 6379 → nimbus-redis-sg     (Redis verso ElastiCache)
TCP 443  → prefix list di s3.amazonaws.com    (endpoint gateway S3)
TCP 443  → endpoint secretsmanager            (Secrets Manager)
TCP 443  → endpoint logs                      (CloudWatch Logs)
```

Nessun "consenti tutto in uscita." Ogni destinazione è nominata.

"È molta manutenzione," disse Leo.

"È più manutenzione dell'allow-all," riconobbe Priya. "È meno bonifica di una violazione dei dati. L'attaccante che ha compromesso l'istanza EC2 avrebbe potuto esfiltrare più dati se le regole di uscita fossero state aperte. Ha usato la regola HTTPS-verso-ovunque perché c'era."

"E con regole di uscita specifiche, anche un'istanza compromessa può inviare dati solo verso destinazioni approvate."

"Esatto. Il security group diventa l'ultima linea di contenimento, non solo la prima linea di difesa."

---

## Punti di Forza e Limitazioni

**Security Group**:

- Stateful (nessun grattacapo con le porte effimere)
- Possono fare riferimento ad altri security group (più flessibili degli IP)
- Solo regole di permesso — nessuna negazione esplicita
- Operano a livello di risorsa — granulari
- Le regole si applicano immediatamente — nessun ordinamento, nessuna priorità
- Più security group possono essere collegati a una risorsa — le regole di tutti vengono combinate

**NACL**:

- Stateless (richiedono regole esplicite per entrambe le direzioni, incluse le porte effimere)
- Possono negare esplicitamente — utili per bloccare IP noti come dannosi
- Operano a livello di subnet — pennellata più ampia
- Regole numerate valutate in ordine — prevedibili ma richiedono una gestione attenta
- Si applicano prima che il traffico raggiunga qualsiasi risorsa nella subnet — prima linea di difesa
- Efficaci per il blocco di emergenza di IP su un'intera subnet

**Dove si colloca ogni strumento**:

Usa i security group per tutto, per impostazione predefinita. Aggiungi le NACL quando ti servono regole di negazione esplicite — bloccare un intervallo IP, bloccare una porta a livello di subnet indipendentemente dalla configurazione delle singole risorse, o garantire che una subnet dati non possa mai ricevere traffico da una sorgente specifica. Le NACL non sostituiscono i security group; sono un complemento per le situazioni in cui il design solo-permessi dei security group non è sufficiente.

## Riepilogo

L'incidente dell'IP rumeno era stato contenuto da controlli di sicurezza già in atto — non per fortuna, ma per design. I security group avevano impedito il movimento laterale all'interno del VPC. Dopo l'incidente, le NACL aggiunsero la capacità di bloccare esplicitamente l'intervallo IP dell'attaccante al confine della subnet. I flow log del VPC resero visibile l'attacco. Due strumenti, due strati, due lavori diversi — con i log a dimostrare cosa era successo.

- I **Security Group** sono firewall virtuali stateful per le singole risorse. Solo regole di permesso. Tutte le regole vengono valutate simultaneamente.
- Le **NACL** sono firewall stateless per intere subnet. Regole di permesso e negazione. Le regole vengono valutate in ordine numerico — la prima corrispondenza vince.
- **Stateful** significa che il traffico di risposta è automaticamente permesso. **Stateless** significa che devi consentire esplicitamente il traffico in entrambe le direzioni, incluse le porte effimere di ritorno.
- I security group sono il tuo livello primario di controllo degli accessi. Le NACL sono l'override a livello di subnet — soprattutto per il blocco di emergenza.
- Quando una NACL consente il traffico in entrata, devi anche consentire le porte effimere in uscita (1024-65535) perché la risposta TCP possa passare.
- **Fai riferimento ai security group per ID**, non per indirizzo IP, per il traffico intra-VPC. L'Auto Scaling sostituisce le istanze; l'appartenenza al security group si trasferisce automaticamente.
- **Regole di uscita specifiche** sulle istanze EC2 limitano ciò che un'istanza compromessa può fare — firewall a privilegio minimo.
- Usa i flow log per vedere cosa stanno facendo davvero i security group e le NACL. Le regole sono teoria. I log sono evidenza.

## Suggerimenti per l'Esame

*SAA-C03 Dominio: Progettazione di Architetture Sicure (Dominio 1, Task 1.2)*

- **Stateful vs stateless**: Questa distinzione è il concetto più testato di questo capitolo. Security group = stateful = risposta consentita automaticamente. NACL = stateless = devi consentire esplicitamente il traffico di risposta.
- **Regole dei security group**: Nessuna negazione esplicita. Quando più security group sono collegati a un'istanza, si applica l'unione di tutte le regole. Tutte le regole corrispondenti vengono valutate simultaneamente.
- **Ordine delle regole NACL**: Le regole vengono valutate dal numero più basso al più alto. Regola 100 prima della 200. La prima corrispondenza vince. La regola `*` (asterisco) in fondo è la negazione implicita. Aggiungere una regola di negazione alla regola 90 blocca prima di qualsiasi regola di permesso alla 100.
- **Porte effimere**: L'errore NACL classico è dimenticare di consentire l'uscita sulle porte 1024-65535. Se la tua NACL consente l'ingresso HTTP (porta 80) ma non consente le porte effimere in uscita, gli utenti possono inviare richieste ma non ricevere mai risposte. Questo è lo scenario NACL più comune all'esame.
- **Riferimento ai security group**: Puoi consentire il traffico da un altro security group (non solo da un IP). Questo è il pattern raccomandato per il traffico intra-VPC. L'esame usa frequentemente "consenti l'ingresso dal security group dell'ALB" come risposta corretta per restringere l'accesso a EC2.
- **NACL predefinita vs NACL personalizzata**: La NACL predefinita consente tutto il traffico. Una NACL personalizzata (una che crei tu) nega tutto il traffico per impostazione predefinita. Scenario d'esame: "ho creato una nuova NACL e ora il traffico è bloccato" → controlla le regole di permesso mancanti.
- **Bloccare l'IP di un attaccante**: I security group non possono bloccare IP specifici (solo permessi). Le NACL possono negare esplicitamente un IP o un CIDR specifico. Scenario d'esame: "blocca un IP specifico dal raggiungere qualsiasi risorsa nella subnet" → regola di negazione NACL.
- **Debug dei fallimenti di connessione**: Controlla nell'ordine: security group sulla sorgente (in uscita) → security group sulla destinazione (in entrata) → NACL sulla subnet sorgente (in uscita + porte effimere) → NACL sulla subnet di destinazione (in entrata). La maggior parte dei fallimenti di connessione all'esame è causata da una regola NACL di uscita mancante o da un permesso mancante per le porte effimere.
- **Più subnet e NACL**: Una NACL si applica a tutte le subnet a essa associate. Una subnet può essere associata a una sola NACL. L'esame può chiedere quale NACL aggiornare quando il traffico di una specifica subnet è interessato.

## Esercizi

**Esercizio 1 — Richiamo**

Una sviluppatrice aggiunge una regola di entrata a un security group che consente il traffico sulla porta 443. Deve anche aggiungere una regola di uscita per consentire la risposta del server? Perché sì o perché no?

Se invece aggiunge una regola di entrata a una NACL che consente il traffico sulla porta 443, deve aggiungere una regola di uscita? Perché sì o perché no?

**Suggerimento**: Ripensa alle analogie del capitolo — ciascuno è la guardia di sicurezza che si ricorda di averti fatto entrare, o il metal detector che devi attraversare di nuovo all'uscita?

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: Un'azienda ha un'applicazione web in esecuzione su istanze EC2 in una subnet pubblica. L'applicazione accetta traffico HTTPS (porta 443) da internet. Gli utenti segnalano di riuscire a connettersi all'applicazione ma di non ricevere risposte — le richieste si bloccano e vanno in timeout.

Il security group dell'EC2 ha una regola di entrata che consente TCP 443 da 0.0.0.0/0. La NACL della subnet ha una regola di entrata (regola 100) che consente TCP 443 da 0.0.0.0/0 e una regola di uscita (regola 100) che consente TCP 443 verso 0.0.0.0/0.

Qual è la causa PIÙ probabile del problema?

A) Al security group manca una regola di uscita per TCP 443  
B) Le istanze EC2 non hanno indirizzi Elastic IP  
C) Al security group manca una regola di entrata per le porte effimere  
D) Alla NACL manca una regola di uscita che consenta le porte effimere (1024-65535)

**Suggerimento 1**: I security group sono stateful — consentono automaticamente le risposte. Le NACL sono stateless — non lo fanno.

**Suggerimento 2**: Quando un browser si connette a un server web sulla porta 443, la risposta del server torna indietro su una porta effimera casuale (1024-65535), non sulla porta 443.

**Suggerimento 3**: La NACL ha una regola di uscita per la 443, ma la risposta non va alla porta 443.

**Risposta**: D

**Spiegazione**: La NACL è stateless. Quando gli utenti si connettono al server sulla porta 443, la risposta TCP del server torna indietro su una porta effimera (scelta a caso tra 1024-65535). La regola di uscita della NACL consente solo la porta 443, quindi la risposta viene bloccata dalla regola di negazione predefinita. Aggiungere una regola NACL di uscita che consenta TCP 1024-65535 risolverebbe il problema.

**Perché non A?** I security group sono stateful — il traffico di risposta è automaticamente permesso indipendentemente dalle regole di uscita. Non serve alcuna regola di uscita nel security group.

**Perché non B?** Gli Elastic IP influenzano il fatto che le istanze abbiano IP pubblici, non il fatto che le connessioni stabilite possano ricevere risposte.

**Perché non C?** Le porte effimere servono per il traffico di risposta in uscita, non per quello in entrata. La connessione in entrata dagli utenti arriva sulla porta 443, che è già consentita.

*SAA-C03 Dominio: Progettazione di Architetture Sicure — Task 1.2*

**Esercizio 3 — Sfida di Architettura**

Dopo l'attacco dell'IP rumeno, Priya vuole implementare due controlli aggiuntivi:

1. Bloccare l'intero intervallo IP 185.0.0.0/8 dal raggiungere qualsiasi risorsa nella subnet pubblica
2. Garantire che la subnet privata contenente il database non possa mai comunicare con internet, anche se qualcuno configura male un security group

Quali strumenti useresti per ciascun requisito, e come li configureresti? Potresti usare i security group per entrambi? Potresti usare le NACL per entrambi?

*(Non esiste una singola risposta corretta. L'obiettivo è capire quale strumento si adatta a quale problema.)*

## Scena Post-Crediti

L'incidente era stato contenuto. La chiave di deploy compromessa era stata disattivata. L'intervallo IP rumeno era stato bloccato nella NACL. Il vecchio script era stato rimosso dall'istanza EC2.

Priya scrisse un rapporto sull'incidente. Lo condivise con il team.

L'ultima riga del rapporto: "Causa principale: una credenziale attiva proveniente da una pipeline di deployment dismessa non è mai stata ruotata o revocata. Raccomandazione: rotazione automatica delle credenziali e audit regolare di tutte le credenziali IAM."

Leo lo lesse tre volte.

"Avrei dovuto ruotare quella chiave," disse.

"Sì," disse Priya.

"Come facciamo a essere sicuri che non succeda di nuovo?"

"Automazione," disse lei. "E qualcosa che sorvegli i sorveglianti."

Nel prossimo capitolo: la cassaforte dove Nimbus conserva i suoi segreti — e la rotazione che rende inutili le chiavi rubate.
