# Capitolo 8: L'Amministratore di Database che Non Fa Mai Ferie

Era alle 3 del mattino quando arrivò l'allarme.

Il server di database necessitava di una patch di sicurezza – il tipo che richiedeva un riavvio. La vulnerabilità era reale, la patch era disponibile e la finestra per applicarla senza interrompere i clienti era proprio adesso, nel bel mezzo della notte, quando il traffico era basso.

Priya era l'unica sveglia. Applicò la patch, riavviò il server, monitorò i log fino a quando l'applicazione tornò online e andò a letto alle 4:15 del mattino.

La mattina, raccontò al team quello che era successo. Ci fu un silenzio.

"Questo succederà di nuovo," disse Tom.

"Succederà ogni volta che c'è una patch," disse Priya. "E ci sono sempre patch. Deve esserci un modo migliore per farlo."

C'era. Serviva rinunciare all'idea che avessero bisogno di gestire il database da soli.

**Il Problema Tradizionale del Database**

Quando si esegue un database da soli su un'istanza EC2, si è responsabili di tutto.

Installare il software del database. Configurare in modo sicuro. Patcharlo quando vengono scoperte vulnerabilità di sicurezza. Eseguire backup. Verificare che i backup funzionino effettivamente (un passo che la maggior parte dei team salta fino a quando non è troppo tardi). Monitorare lo spazio su disco. Configurare la replicazione per la ridondanza. Configurare il failover quando il server primario va giù. Ottimizzare le prestazioni delle query. Gestire le connessioni sotto carico.

Nessuno di questo è l'applicazione. Nessuno di questo aggiunge funzionalità. Tutto questo richiede esperienza.

La maggior parte dei team di sviluppo non sono amministratori di database. Questo crea un modello prevedibile: il database viene installato, configurato minimamente e poi in gran parte dimenticato fino a quando qualcosa non va catastroficamente storto.

"È questo quello che abbiamo fatto?" chiese Maya.

La risposta di Leo fu un silenzio, che era lo stesso di sì.

**Amazon RDS: Il Servizio di Database Gestito**

**Amazon RDS** – Relational Database Service – gestisce l'onere operativo dell'esecuzione di un database relazionale in modo da non doverlo fare voi.

Con RDS, AWS gestisce:

- Installare e patchare il motore di database
- Backup automatici (memorizzati su S3, conservati per un massimo di 35 giorni)
- Failover automatico (quando il primario va giù, un standby prende il sopravvento automaticamente)
- Monitoraggio e metriche
- Crittografia a riposo e in transito
- Scalabilità automatica dello storage (se abilitato, il disco cresce quando è pieno)

Voi gestite:

- Lo schema del database (la struttura delle tabelle)
- Le vostre query e la logica dell'applicazione
- Chi ha accesso al database
- Che tipo di istanza gira il database
- Tuning dei parametri (sebbene RDS fornisca valori predefiniti ragionevoli)

L'analogia: assumere un amministratore di database che non prende mai ferie, non commette mai errori di configurazione, esegue automaticamente backup giornalieri e si ripara da solo se qualcosa si rompe – ma che non scrive la logica della vostra applicazione.

**Motori Supportati**

RDS supporta diversi motori di database popolari:

- **MySQL** – il database relazionale open-source più utilizzato
- **PostgreSQL** – potente, estendibile, sempre più popolare per carichi di lavoro complessi
- **MariaDB** – fork open-source di MySQL, completamente compatibile
- **Oracle** – di livello enterprise, utilizzato in grandi organizzazioni con requisiti legacy
- **Microsoft SQL Server** – per ambienti Windows-heavy
- **Amazon Aurora** – il motore proprietario di AWS, compatibile con MySQL/PostgreSQL, costruito per il cloud (lo copriamo in dettaglio nel Capitolo 24)

Per Nimbus, la scelta fu PostgreSQL. Era quello che Leo conosceva e gestiva bene i dati relazionali. La scelta del motore è meno importante di quanto si pensi per la maggior parte delle applicazioni – i vantaggi operativi di RDS si applicano comunque indipendentemente.

**Multi-AZ: Lo Standby che Prende il Sorpasso**

Questa è la funzionalità che cambia completamente il calcolo della affidabilità.

**Il deployment Multi-AZ** significa che RDS mantiene un'istanza standby sincrona in una zona di disponibilità diversa dall'istanza primaria. Ogni transazione commessa sull'istanza primaria viene replicata in modo sincrono allo standby prima che la transazione venga confermata.

Quando l'istanza primaria fallisce – guasto hardware, interruzione della zona di disponibilità, crash del software – RDS passa automaticamente allo standby. Il record DNS per l'endpoint del database viene aggiornato. La vostra applicazione si riconnette all'istanza primaria nuova.

Il failover richiede 60-120 secondi. Durante quel periodo, la vostra applicazione sperimenterà errori di connessione. Le applicazioni scritte correttamente dovrebbero gestirle con successo (tentativi di connessione con backoff).

Lo standby non è un replica di lettura. Non serve traffico di lettura. Il suo unico scopo è essere pronto a prendere il sopravvento.

Tom: "Quanto costa Multi-AZ?"

Circa il doppio del costo di un'istanza singola – perché state letteralmente eseguendo due istanze di database. Lo standby costa quanto l'istanza primaria.

Tom: "E quanto costa un'interruzione non pianificata?"

Rispose alla sua stessa domanda aprendo la cronologia degli ordini e stimando il ricavo all'ora durante il loro picco del venerdì.

Multi-AZ è stato abilitato quel pomeriggio.

**Backup Automatici e Ripristino al Punto nel Tempo**

RDS offre backup automatici ogni giorno. AWS memorizza questi backup su S3 (gestito da RDS – non li vedi direttamente nel tuo console S3). Puoi ripristinare il database a qualsiasi punto all'interno del periodo di conservazione dei backup.

I backup avvengono durante una finestra di manutenzione configurabile – un periodo di basso traffico, tipicamente nelle prime ore del mattino. Per la maggior parte dei tipi di motore, i backup non causano interruzioni.

Il **ripristino a un istante specifico** è una delle funzionalità più preziose: puoi ripristinare a qualsiasi secondo all'interno del periodo di conservazione. Non solo snapshot giornalieri – *qualsiasi secondo*. Questo è possibile perché RDS archivia continuamente i log delle transazioni in aggiunta ai backup giornalieri.

Se qualcuno esegue accidentalmente `DELETE FROM orders WHERE 1=1` alle 14:37, puoi ripristinare alle 14:36.

Leo si rilassò visibilmente quando capì questo.

"Potremmo esserci ripresi da ciò che ho cancellato la scorsa estate?" chiese.

"Prima di RDS? No," disse Priya. "Dopo RDS? Sì."

**Replica di lettura: Scalare il traffico di lettura**

Multi-AZ riguarda la disponibilità. **Replica di lettura** riguarda le prestazioni.

Una replica di lettura è una copia asincrona del tuo database primario che può servire query di lettura. Puoi avere fino a cinque replica di lettura per la maggior parte dei motori RDS (più per Aurora).

L'applicazione viene modificata per inviare query di lettura alla replica e query di scrittura al primario. Questo distribuisce il carico: il primario gestisce le scritture e le transazioni complesse; le replica gestiscono le letture.

Caratteristiche principali:

- La replicazione è **asincrona** – può esserci un piccolo ritardo (lagg) tra il primario e la replica. Se scrivi un record e lo leggi immediatamente dalla replica, potresti non vederlo ancora.
- Le replica di lettura possono essere nella stessa Regione o in una Regione diversa (repliche cross-Region aggiungono latenza ma consentono la distribuzione geografica).
- Le replica di lettura possono essere promosse a database autonomi in uno scenario di disaster recovery.

Per Nimbus: i lookup del menu sono letture. La cronologia degli ordini è letture. La stragrande maggioranza del traffico è traffico di lettura. Aggiungendo una replica di lettura e indirizzando le letture ad essa, si riduce significativamente il carico del database primario.

Ne discutiamo più approfonditamente le replica di lettura nel Capitolo 24 quando discutiamo di Aurora.

**RDS Parameter Groups e Option Groups**

Due meccanismi di configurazione che emergono nell'esame:

**Gruppi di parametri** controllano le impostazioni del motore di database – come il numero massimo di connessioni, la dimensione della cache delle query, i valori di timeout. RDS crea un gruppo di parametri predefinito che funziona per la maggior parte dei casi. Crei gruppi di parametri personalizzati quando hai bisogno di ottimizzare impostazioni specifiche.

**Gruppi di opzioni** abilitano funzionalità aggiuntive per alcuni motori – come la crittografia nativa di rete di Oracle o la crittografia trasparente dei dati di SQL Server. La maggior parte dei deployment di motori open-source non ha bisogno di gruppi di opzioni personalizzati.

Non è necessario memorizzare questi. Sappi che esistono per personalizzare il comportamento del motore di database.

## Punti di forza e limitazioni

**Perché RDS è eccellente:**

- Elimina l'onere operativo di gestire il software di database
- Backup automatici e ripristino a un istante specifico
- Multi-AZ per il failover automatico con un tempo di ripristino (RTO) minimo
- Replica di lettura per scalare il traffico di lettura
- Crittografia a riposo e in transito integrata
- Tutti i principali motori di database relazionali supportati

**Dove RDS ha limiti:**

- Non puoi accedere al sistema operativo sottostante. Non puoi installare software a livello di sistema operativo o modificare le impostazioni del sistema operativo. Se il tuo database ha requisiti che richiedono l'accesso a livello di sistema operativo, potresti aver bisogno di eseguire il tuo database EC2.
- RDS non è serverless (con eccezioni – Aurora Serverless esiste, coperta nel Capitolo 24). Paghi per un'istanza in esecuzione anche se è inattiva.
- RDS non è progettato per database shardati orizzontalmente. Per una scalabilità massiva delle carichi di lavoro relazionali orientate alla scrittura, potresti aver bisogno di un'architettura diversa alla fine.
- Per i modelli di dati non relazionali (NoSQL), DynamoDB (Capitolo 9) è più appropriato.

## Riepilogo

- **Amazon RDS** è un servizio di database relazionale gestito. AWS gestisce patching, backup, failover e gestione dello storage. Tu gestisci schema, query e logica dell'applicazione.
- Il deployment **Multi-AZ** mantiene una standby sincrona in un altro AZ. Il failover automatico avviene in 60-120 secondi se il primario fallisce.
- **Backup automatici** con **ripristino a un istante specifico** ti permettono di ripristinare a qualsiasi secondo nel periodo di conservazione.
- **Replica di lettura** sono copie asincrone che servono il traffico di lettura, riducendo il carico sul primario. Il ritardo di replicazione significa che potrebbero essere leggermente indietro.
- Scegli RDS quando hai bisogno di un database relazionale con operazioni gestite. Usa Aurora (Capitolo 24) quando hai bisogno di prestazioni più elevate o opzioni serverless.

## Suggerimenti per l'esame

*SAA-C03 Domain 3 — Task 3.3 (soluzioni di database)*

- **Multi-AZ è progettato per l'alta disponibilità, non per le prestazioni.** La standby non serve il traffico di lettura. I replica di lettura sono per le prestazioni. Questa distinzione viene testata frequentemente.
- **Il failover Multi-AZ è automatico.** Non devi configurare quando o come avviene. RDS monitora il primario e innesca il failover automaticamente.
- **Il ritardo di replica è importante.** I replica di lettura possono essere leggermente indietro rispetto al primario. Se la tua applicazione richiede di leggere dati appena scritti, deve leggere dal primario, non dal replica. Questo si chiama "coerenza delle tue scritture".
- **I backup automatici sono conservati per 0-35 giorni.** Impostare la conservazione a 0 disabilita i backup automatici. Gli snapshot manuali sono conservati indefinitamente fino a quando non li elimini.
- **Lo storage RDS auto-scaling** previene le interruzioni dovute a disco pieno. Attivalo. Scala solo in su, mai in giù. L'esame potrebbe testare se conosci questa asimmetria.

## Esercizi

**Esercizio 1 — Ricordo**

Nelle tue parole: qual è la differenza tra Multi-AZ e i replica di lettura in RDS?
Quale problema risolve ciascuno?

*(Suggerimento: Uno protegge dal downtime; l'altro migliora le prestazioni sotto carichi di lettura intensivi. Risolvono problemi diversi e possono essere usati insieme.)*

**Esercizio 2 — Esercitazione d'Esame**

*Scenario*: Un'azienda gestisce un database PostgreSQL di produzione su RDS. Il database sperimenta un alto traffico di lettura dovuto a query di reporting che vengono eseguite durante tutto il giorno. Il team è anche preoccupato della disponibilità del database — non possono permettersi più di pochi minuti di downtime in un caso di guasto. Vogliono ridurre al minimo l'impatto sul database primario dai carichi di lavoro di reporting.

Quale combinazione di funzionalità RDS è la MIGLIOR per affrontare entrambe le preoccupazioni?

A) Abilita Multi-AZ e esegui tutte le query contro l'istanza standby
B) Abilita Multi-AZ per la protezione del failover e crea un replica di lettura per le query di reporting
C) Crea più replica di lettura e disabilita Multi-AZ per ridurre i costi
D) Prendi snapshot manuali più frequenti e ripristina da essi se il primario fallisce

*(Suggerimento 1*: I due requisiti sono: (1) disponibilità durante il guasto, (2) scarico delle letture. Quali funzionalità affrontano tale requisito?

*(Suggerimento 2*: Multi-AZ fornisce il failover automatico. La standby non serve il traffico di lettura. Quindi Multi-AZ da solo non aiuta con il problema di lettura.

*(Suggerimento 3*: I replica di lettura servono il traffico di lettura. Multi-AZ fornisce il failover. Hai bisogno di entrambi.

**Risposta**: B

**Spiegazione**: Multi-AZ fornisce il failover automatico a una standby in un altro AZ — questo affronta il requisito di disponibilità. Un replica di lettura consente alle query di reporting di essere eseguite senza influire sul database primario — questo affronta il requisito di prestazioni. Entrambe le funzionalità possono essere utilizzate simultaneamente.

**Perché non A?** La standby Multi-AZ non può servire il traffico di lettura. È esclusivamente per il failover. Tentare di interrogare direttamente è non supportato.

**Perché non C?** I replica di lettura aiutano con le prestazioni di lettura, ma non forniscono il failover automatico. Se il primario fallisce, dovresti promuovere manualmente un replica di lettura — il che richiede tempo e non è automatico.

**Perché non D?** Gli snapshot manuali ripristinano una copia completa del database — un processo molto più lungo (potenzialmente ore per i database di grandi dimensioni). Questo non soddisfa il requisito di "pochi minuti di downtime".

*SAA-C03 Domain 3 — Task 3.3*

**Esercizio 3 — Sfida Architetturale** *(Opzionale)*

Nimbus sta considerando di migrare il proprio database PostgreSQL self-managed esistente (in esecuzione su un'istanza EC2) a RDS PostgreSQL. La migrazione deve avvenire con un downtime minimo — idealmente inferiore ai 15 minuti. Il database è di 200 GB.

Quale approccio raccomanderesti? Quali servizi AWS potrebbero aiutare con la migrazione? Quali rischi testeresti prima di effettuare il cutover di produzione?

*(Non esiste una risposta corretta. Pensa a AWS Database Migration Service, replicazione logica e al rischio di incoerenza dei dati durante il cutover.)*

## Scena Post-Crediti

Entro la fine della giornata, Nimbus aveva migrato a RDS PostgreSQL con Multi-AZ abilitato. La migrazione stessa è durata la maggior parte del pomeriggio — Leo ha usato un approccio backup-and-restore, con una breve finestra di manutenzione.

Tom aveva monitorato attentamente la bolletta.

"L'istanza RDS", disse, "costa il doppio di quanto il database EC2."

"E i backup automatici?" chiese Maya.

"Un po' di più."

"E il failover che otterremo gratuitamente se il primario dovesse morire?"

Tom non aveva un prezzo per quello. Lo ha scritto come una domanda.

Tre giorni dopo, il database era sano. I tempi di query erano diminuiti leggermente, ma non abbastanza. Il menu era ancora lento per caricarsi. Venti mila duecento elementi. Venti mila duecento righe in una query che li restituiva tutti, ogni volta.

"Il problema", disse Priya, "non è il motore del database. È il modello dei dati."

Ha fatto una pausa.

"Alcuni di questi dati non sono affatto relazionali. Menu, profili di ristoranti, zone di consegna — questi dati hanno forme variabili. SQL sta combattendo contro di noi."

Leo era già alla ricerca di qualcosa.

"Se usassimo un tipo di database diverso per il menu?" disse.

Nel prossimo capitolo: il database che non rallenta, nemmeno quando un milione di persone effettua un ordine contemporaneamente.
