# Capitolo 15: I Guardiani alla Porta

La vecchia chiave di deploy dal primo rilascio di Nimbus era ancora attiva. Aveva effettuato tre chiamate API la scorsa settimana. Leo non sapeva cosa le avesse causate.

Priya caricò i log del flusso VPC — registrazioni del traffico di rete che mostrano ogni connessione in entrata e in uscita dal VPC.

"Il martedì alle 2:17 AM," disse, "c'era una connessione in uscita dall'istanza EC2 che eseguiva l'API vecchia a un indirizzo IP in Romania."

"Non è la nostra infrastruttura," disse Leo.

"No."

"Quindi qualcuno era sulla nostra istanza EC2."

"O qualcosa."

Ci hanno rintracciato: la vecchia chiave di deploy era stata utilizzata per caricare uno script piccolo sull'istanza EC2. Lo script aveva tentato di scansionare porte su server adiacenti. La maggior parte delle scansioni era fallita.

"I gruppi di sicurezza li hanno bloccati," disse Priya. "L'attaccante è entrato in un'istanza EC2. Non ha potuto raggiungere gli altri perché i gruppi di sicurezza permettevano il traffico solo dal bilanciatore di carico."

"Quindi il danno è stato contenuto."

"Perché avevamo configurato correttamente i gruppi di sicurezza. Immaginate se avessimo lasciato aperta la porta 5432 a qualsiasi istanza EC2 nel conto."

Leo non aveva bisogno di immaginare. Aveva visto quella configurazione nella configurazione originale.

**Due Livelli di Sicurezza di Rete**

In un VPC, hai due strumenti distinti per controllare il traffico di rete:

**Gruppi di Sicurezza (Security Groups):** Firewall virtuali allegati a singoli risorse (istanze EC2, database RDS, bilanciatori di carico, funzioni Lambda in un VPC). Operano a livello di risorsa.

**Network ACL (NACL):** Regole firewall allegate a subnet. Operano a livello di confine della subnet — prima che il traffico raggiunga qualsiasi risorsa in quella subnet.

Capire entrambi richiede la comprensione di una differenza fondamentale: **stateless vs stateful**.

**Stateful: Gruppi di Sicurezza**

Un gruppo di sicurezza è **stateful**.

Quando permetti il traffico in entrata su una specifica porta, il traffico di risposta è automaticamente permesso in uscita, anche se non c'è una regola di uscita esplicita per esso.

Quando permetti il traffico in uscita a una destinazione, il traffico di ritorno è automaticamente permesso.

Pensa a un guardiano dello stato in un edificio. Mostri la tua tessera per entrare. Esci più tardi. Il guardiano non deve controllare di nuovo la tua tessera quando esci — il sistema sa che sei stato lasciato entrare e sei autorizzato a uscire.

**Regole del Gruppo di Sicurezza per l'istanza EC2 dell'API Nimbus:**

- **In entrata — TCP 8080 — dal SG del Bilanciatore di Carico** → Accetta il traffico API dall'ALB
- **In entrata — TCP 22 — dal SG dell'Host Bastione** → SSH dall'host bastion solo
- **In uscita — TCP 5432 — al SG del RDS** → Connettiti a PostgreSQL
- **In uscita — TCP 6379 — al SG di ElastiCache** → Connettiti a Redis
- **In uscita — TCP 443 — a 0.0.0.0/0** → HTTPS a API esterne

Nota: nessuna regola di uscita esplicita per la porta 8080. La regola di entrata è stateful — il traffico di risposta (la risposta API al bilanciatore di carico) è automaticamente permesso.

Nota anche: le regole del gruppo di sicurezza fanno riferimento ad *altri gruppi di sicurezza*, non agli indirizzi IP. "Permetti il traffico in entrata dal gruppo di sicurezza del bilanciatore di carico" significa "permetti il traffico da qualsiasi risorsa che ha questo gruppo di sicurezza allegato." Questo è più flessibile e manutenibile rispetto al tracciare gli indirizzi IP.

**Comportamento predefinito:**

- Per impostazione predefinita, tutto il traffico in entrata è negato
- Per impostazione predefinita, tutto il traffico in uscita è consentito
- Tutte le regole vengono valutate (i gruppi di sicurezza non hanno regole ordinate — tutte le regole corrispondenti vengono applicate)
- I gruppi di sicurezza possono solo **permettere** il traffico — non è possibile creare regole esplicite di negazione

**Stateless: Network ACL**

Un NACL è **stateless**.

Quando permetti il traffico in entrata sulla porta 8080, ciò copre solo il traffico in entrata. Il traffico di risposta (il traffico in uscita su porte effimere) deve essere permesso esplicitamente con una regola di uscita.

Pensa a un rilevatore di metallo. Passi attraverso di esso quando entri. Il rilevatore di metallo non sa che sei già passato — devi passare di nuovo attraverso quando esci.

**Le regole NACL sono numerate e valutate in ordine.** La prima regola che corrisponde vince. La regola 100 viene valutata prima della regola 200. Se la regola 100 nega il traffico e la regola 200 lo consente, il traffico viene negato.

I NACL possono esplicitamente **negare** il traffico — a differenza dei gruppi di sicurezza, che possono solo consentire. Questo li rende utili per bloccare intervalli di indirizzi IP specifici.

**Comportamento predefinito del NACL:**

- Il NACL predefinito (creato con il tuo VPC) consente tutto il traffico in entrata e in uscita
- Un NACL personalizzato nega tutto il traffico per impostazione predefinita (devi consentire esplicitamente ciò che vuoi)

**NACL per il subnet pubblico (semplificato):**

*Regole in entrata (valutate in ordine — prima corrispondenza vince):*

- Regola 100: TCP 443, da 0.0.0.0/0 → **Consenti** (HTTPS)
- Regola 110: TCP 80, da 0.0.0.0/0 → **Consenti** (HTTP)
- Regola 120: TCP 1024–65535, da 0.0.0.0/0 → **Consenti** (porte di ritorno effimere)
- Regola \*: Tutto il traffico → **Nega**

*Regole in uscita:*

- Regola 100: TCP 443, a 0.0.0.0/0 → **Consenti** (HTTPS)
- Regola 110: TCP 80, a 0.0.0.0/0 → **Consenti** (HTTP)
- Regola 120: TCP 1024–65535, a 0.0.0.0/0 → **Consenti** (porte di ritorno effimere)
- Regola \*: Tutto il traffico → **Nega**

Rule 120 (ports 1024-65535) permette porte temporanee — le porte ad alto numero utilizzate per il traffico di risposta TCP. Poiché i NACL sono stateless, devi consentire esplicitamente queste uscite, altrimenti le risposte del tuo server non passeranno.

**Quando Usare Cosa**

Utilizza i **gruppi di sicurezza** come livello primario di controllo degli accessi. Sono più facili da gestire, sono state (riduce la probabilità di blocchi accidentali dovuti all'oblio delle porte effimere) e supportano il riferimento ad altri gruppi di sicurezza.

Utilizza i **NACL** per i controlli a livello di subnet, in particolare:

- **Regole di negazione esplicite**: Blocca un indirizzo IP o un intervallo specifico che tenta di raggiungere un'intera subnet
- **Blocco di emergenza**: Un IP sta attivamente attaccando — aggiungi una regola di negazione NACL per bloccare l'intera subnet prima che raggiunga qualsiasi risorsa

"Quindi il gruppo di sicurezza è il controllo a grana fine", disse Maya, "e il NACL è la pennellata ampia?"

"I gruppi di sicurezza proteggono le singole risorse", confermò Priya. "I NACL proteggono intere subnet. Quando vuoi bloccare un IP che raggiunge qualsiasi cosa nella tua rete, NACL. Quando vuoi consentire solo al load balancer di raggiungere il server API, gruppo di sicurezza."

**L'Incidente: Cosa hanno Catturato gli Strati**

Tornando all'attacco dell'IP rumeno:

**Cosa è successo**: L'attaccante ha utilizzato la chiave di distribuzione compromessa per caricare uno script di scansione su una singola istanza EC2. Lo script ha tentato di connettersi ad altri servizi.

**Cosa l'ha fermato**:

- Il gruppo di sicurezza RDS ha consentito l'ingresso solo su porta 5432 dal gruppo di sicurezza EC2 API. Lo script non poteva raggiungere il database da uno strumento di scansione — non stava allegando il gruppo di sicurezza corretto.
- Il gruppo di sicurezza ElastiCache ha consentito l'ingresso solo su porta 6379 dal gruppo di sicurezza EC2 API.
- Altre istanze EC2 hanno consentito l'accesso SSH dal gruppo di sicurezza del bastion host.

**Cosa non ha fermato**:

- Le regole di uscita dell'istanza EC2 hanno consentito HTTPS a 0.0.0.0/0 (necessario per i download di pacchetti). Lo script ha utilizzato questo per effettuare connessioni in uscita al server dell'attaccante.

Dopo l'incidente, Priya ha aggiunto:

- Una regola NACL che bloccava l'intervallo IP rumeno
- Una regola di uscita più restrittiva sulle istanze EC2 (consentiva solo destinazioni note e buone)

## Punti di Forza e Limitazioni

**Gruppi di Sicurezza**:

- Stateful (nessun problema con le porte effimere)
- Può fare riferimento ad altri gruppi di sicurezza (più flessibile rispetto agli IP)
- Consente solo regole — nessuna negazione esplicita
- Opera a livello di risorsa — granulare

**NACL**:

- Stateless (richiede regole esplicite per entrambe le direzioni, inclusi i porti effimeri)
- Può negare esplicitamente — utile per bloccare IP noti dannosi
- Opera a livello di subnet — pennellata ampia
- Le regole numerate vengono valutate in ordine — prevedibile ma richiede una gestione attenta

## Riepilogo

- **Gruppi di Sicurezza** sono firewall virtuali stateful per le singole risorse. Consentono solo regole. Tutte le regole vengono valutate.
- **NACL** sono firewall stateless per intere subnet. Consentono e negano regole. Le regole vengono valutate in ordine numerico.
- **Stateful** significa che il traffico di risposta è automaticamente consentito. **Stateless** significa che devi consentire esplicitamente il traffico in entrambe le direzioni.
- I gruppi di sicurezza sono il tuo livello di controllo degli accessi primario. I NACL sono un livello aggiuntivo per i controlli a livello di subnet e il blocco esplicito.
- Quando un NACL consente il traffico in entrata, devi anche consentire il traffico in uscita effimero (1024-65535) per far passare il traffico di risposta TCP.
- I gruppi di sicurezza possono fare riferimento ad altri gruppi di sicurezza — consentire il traffico dal gruppo di sicurezza del load balancer è più gestibile rispetto al tracciare gli indirizzi IP.

## Suggerimenti per l'Esame

*SAA-C03 Dominio: Progettazione di Architetture Sicure (Dominio 1, Task 1.2)*

- **Stateful vs stateless**: Questo concetto è il più testato in questo capitolo. Gruppi di sicurezza = stateful = risposta consentita automaticamente. NACL = stateless = devi consentire esplicitamente il traffico di risposta.
- **Regole del gruppo di sicurezza**: Nessuna negazione esplicita. Quando sono allegati più gruppi di sicurezza a un'istanza, si applica l'unione di tutte le regole. Tutte le regole corrispondenti vengono valutate.
- **Ordine delle regole NACL**: Le regole vengono valutate dal numero più basso a quello più alto. Regola 100 prima di 200. La prima corrispondenza vince. La regola "*" (asterisco) nella parte inferiore è la negazione implicita.
- **Porte effimere**: L'errore NACL più comune è dimenticare di consentire l'uscita su porte 1024-65535. Se il tuo NACL consente l'ingresso HTTP (porta 80) ma non consente le porte effimere in uscita, gli utenti possono inviare richieste ma non ricevere risposte.
- **Riferimento del gruppo di sicurezza**: Puoi consentire il traffico da un altro gruppo di sicurezza (non solo un IP). Questo è il modello raccomandato per il traffico intra-VPC.
- **NACL predefinito vs custom NACL**: Il NACL predefinito consente tutto il traffico. Un NACL personalizzato (uno che crei) nega tutto il traffico per impostazione predefinita. Scenario d'esame: "ho creato un nuovo NACL e ora il traffico è bloccato" → controlla le regole di permesso mancanti.

## Esercizi

**Esercizio 1 — Richiamo**

Un sviluppatore aggiunge una regola di ingresso a un gruppo di sicurezza che consente il traffico su porta 443. Ha anche bisogno di aggiungere una regola di uscita per consentire la risposta del server? Perché o perché no?

If invece aggiunge una regola di ingresso (inbound) a una NACL che permette il traffico sulla porta 443, ha bisogno di aggiungere una regola di uscita (outbound)? Perché o perché no?

**Esercizio 2 — Esercitazione d'Esame**

*Scenario*: Un'azienda ha un'applicazione web in esecuzione su istanze EC2 in un subnet pubblico. L'applicazione accetta traffico HTTPS (porta 443) da Internet. Gli utenti segnalano di poter connettersi all'applicazione ma non ricevono risposte — le richieste si bloccano e scadono.

Il gruppo di sicurezza EC2 ha una regola di ingresso che permette TCP 443 da 0.0.0.0/0. Il NACL del subnet ha una regola di ingresso (regola 100) che permette TCP 443 da 0.0.0.0/0 e una regola di uscita (regola 100) che permette TCP 443 a 0.0.0.0/0.

Qual è la CAUSA PIÙ PROBABILE del problema?

A) Il gruppo di sicurezza manca di una regola di uscita per TCP 443
B) Il NACL manca di una regola di uscita che permette le porte effimere (1024-65535)
C) Il gruppo di sicurezza manca di una regola di ingresso per le porte effimere
D) Le istanze EC2 non hanno indirizzi IP elastici

**Suggerimento 1**: I gruppi di sicurezza sono stateful — consentono automaticamente le risposte. I NACL sono stateless — non lo fanno.

**Suggerimento 2**: Quando un browser si connette a un server web sulla porta 443, il traffico di risposta del server viaggia indietro su una porta effimera casuale (1024-65535), non sulla porta 443.

**Suggerimento 3**: Il NACL ha una regola di uscita per 443, ma la risposta non va alla porta 443.

**Risposta**: B

**Spiegazione**: Il NACL è stateless. Quando gli utenti si connettono al server sulla porta 443, il traffico TCP di risposta del server viaggia indietro su una porta effimera (casualmente scelta da 1024-65535). La regola di uscita del NACL permette solo la porta 443, quindi la risposta è bloccata dalla regola di rifiuto predefinita. Aggiungere una regola di uscita del NACL che permette TCP 1024-65535 risolverebbe questo problema.

**Perché non A?** I gruppi di sicurezza sono stateful — il traffico di risposta è consentito automaticamente, indipendentemente dalle regole di uscita. Non è necessaria alcuna regola di uscita del gruppo di sicurezza.

**Perché non C?** Le porte effimere sono per il traffico di risposta in uscita, non per il traffico in ingresso. La connessione in ingresso dagli utenti arriva sulla porta 443, che è già consentita.

**Perché non D?** Gli indirizzi IP elastici influenzano se le istanze hanno indirizzi IP pubblici, non se le connessioni stabilite possono ricevere risposte.

*SAA-C03 Domain: Progettazione di Architetture Sicure — Task 1.2*

**Esercizio 3 — Sfida Architetturale** *(Opzionale)*

Dopo l'attacco proveniente dal gruppo IP rumeno, Priya vuole implementare due controlli aggiuntivi:

1. Bloccare l'intero intervallo di indirizzi IP 185.0.0.0/8 dal raggiungimento di qualsiasi risorsa nel subnet pubblico
2. Assicurarsi che il subnet privato contenente il database non possa comunicare con Internet, anche se qualcuno configura in modo errato un gruppo di sicurezza

Quali strumenti utilizzerebbe per ciascuna esigenza e come li configurerebbe? Potrebbe utilizzare i gruppi di sicurezza per entrambi? Potrebbe utilizzare i NACL per entrambi?

*(Non esiste una risposta corretta univoca. L'obiettivo è capire quale strumento si adatta a quale problema.)*

## Scena Post-Crediti

L'incidente è stato contenuto. La chiave di distribuzione compromessa è stata disattivata. L'intervallo di indirizzi IP rumeno è stato bloccato nel NACL. Lo script vecchio è stato rimosso dall'istanza EC2.

Priya ha scritto un rapporto sull'incidente. Lo ha condiviso con il team.

L'ultima riga del rapporto recitava: "Causa principale: un credential attivo proveniente da un pipeline di deployment dismesso non è mai stato ruotato o revocato. Raccomandazione: rotazione automatica dei credential e audit regolare di tutti gli IAM credential."

Leo l'ha letto tre volte.

"Dovrei aver ruotato quella chiave," ha detto.

"Sì," ha detto Priya.

"Come facciamo a evitare che accada di nuovo?"

"Automazione," ha detto. "E qualcosa che osserva gli osservatori."

Nel prossimo capitolo: la cassaforte dove Nimbus conserva i suoi segreti — e la rotazione che rende inutili le chiavi rubate.
