# Capitolo 18: Quando le Cose Si Rompono

Questo capitolo parla di guasti – pianificati per, progettati contro e, in definitiva, accettati come inevitabili. Potrebbe essere il capitolo più importante del libro.

Nimbus stava funzionando bene. Gli strati di sicurezza erano in atto. Il monitoraggio era attivo. Il traffico stava crescendo.

Poi Leo ricevette una notifica Slack alle 23:23 di giovedì.

"us-east-1 Zona di Disponibilità us-east-1b — guasto hardware — servizio degradato."

Aprì la console AWS. Le istanze EC2 in us-east-1b stavano mostrando che i controlli di stato non erano attivi. Il suo Gruppo di Scalatura Automatica aveva rilevato istanze non sane e stava avviando sostituzioni – in us-east-1b.

Nella zona di disponibilità che stava fallendo.

Le nuove istanze non riuscivano nemmeno a partire. Erano nella stessa zona di guasto hardware.

"Il bilanciatore di carico sta indirizzando il traffico a entrambe le zone di disponibilità," disse Leo a nessuno. "Metà del nostro traffico sta andando a istanze che non funzionano."

Venti minuti di servizio degradato prima che se ne accorgesse e spostasse manualmente l'ASG per utilizzare solo us-east-1a.

"Questo è successo perché tutto era in una sola zona di disponibilità," disse Priya la mattina seguente.

"No," disse Leo. "Avevo istanze in due zone di disponibilità. Il problema era che le istanze di sostituzione stavano generando nella zona di guasto."

"E il database?"

Leo si fermò.

"L'istanza RDS è Multi-AZ," disse. "Lo standby è in us-east-1b. Che stava fallendo. E RDS ha tentato di eseguire il failover allo standby, che ha anche fallito."

Venti minuti di servizio degradato erano diventati trentotto.

**L'Analogie della Rete Elettrica**

Pensa a come la tua casa ottiene l'elettricità. La potenza non proviene da un singolo cavo che corre da un singolo generatore. Proviene da una rete – una rete di generatori, sottostazioni e linee di trasmissione che si supportano a vicenda. Se una sottostazione prende fuoco, gli altri deviano la potenza intorno ad essa. Non te ne accorgi. Le luci rimangono accese.

Le Zone di Disponibilità AWS funzionano allo stesso modo. Invece di un enorme data center su cui tutto dipende, AWS distribuisce le tue risorse in più strutture fisicamente separate. Se una struttura perde energia o ha un guasto hardware, gli altri continuano a funzionare. Il traffico viene reindirizzato automaticamente. La tua applicazione rimane attiva – perché non c'era un singolo cavo da tagliare.

La Multi-Regione è il livello successivo: immagina di avere generatori di backup in una città completamente diversa. Se l'intera rete elettrica locale va in tilt, la città remota prende il sopravvento. Più complesso da configurare, ma più resiliente ai guasti catastrofici.

**Il Vocabolario del Guasto**

Prima di progettare per la resilienza, è necessario avere parole per ciò contro cui si sta progettando.

**Disponibilità**: la percentuale di tempo in cui un sistema è operativo. "Nove su dieci" (99,99%) significa meno di 52 minuti di downtime all'anno. "Dieci su dieci" (99,999%) significa circa 5 minuti all'anno.

**RTO (Recovery Time Objective)**: quanto a lungo può essere inattivo il sistema prima che diventi un problema aziendale? Se il tuo RTO è di 4 ore, hai 4 ore per ripristinare il servizio prima che vengano violate le SLA.

**RPO (Recovery Point Objective)**: quanti dati puoi permetterti di perdere? Se il tuo RPO è di 1 ora, puoi tollerare fino a un'ora di perdita di dati in un guasto catastrofico. Tutto ciò scritto nelle ultime un'ora prima del guasto è andato perso.

**Tolleranza ai guasti**: la capacità di continuare a funzionare (a un certo livello) quando un componente fallisce.

**Recupero da disastri (DR)**: il processo di recupero da un guasto catastrofico – incendio di un data center, interruzione regionale, cancellazione accidentale di massa.

Questi cinque concetti guidano ogni decisione architettonica in questo capitolo.

**Multi-AZ: Sopravvivenza alle Zone di Disponibilità**

Una Zona di Disponibilità (AZ) è un data center fisicamente separato all'interno di una Regione. Le AZ sono progettate per essere indipendenti: alimentazione separata, raffreddamento separato, infrastruttura di rete separata. Ma sono abbastanza vicine da garantire che la latenza di rete tra di loro sia di 1-2 millisecondi.

**I deployment Multi-AZ** distribuiscono le tue risorse su due o più AZ all'interno di una Regione. Se una AZ fallisce:

- Il bilanciatore di carico smette di indirizzare il traffico alle istanze non sane nella AZ fallita
- Il Gruppo di Scalatura Automatica sostituisce le istanze – ma nelle *AZ sane*
- RDS esegue il failover allo standby nella AZ sana

L'errore di Leo: il suo Gruppo di Scalatura Automatica non era configurato per limitare le istanze di sostituzione alle AZ sane. Era configurato per mantenere l'equilibrio tra le AZ. Quando us-east-1b è fallito, l'ASG ha cercato di bilanciare il numero di istanze avviando sostituzioni in us-east-1b – la AZ fallita.

La soluzione: configurare l'ASG per lanciare solo nelle AZ sane, con un minimo di due AZ sempre attive.

La lezione più profonda: testare i tuoi scenari di guasto prima che accadano in produzione.

**Simulare i Guasti: Ingegneria del Caos**

"Come sappiamo che la nostra configurazione Multi-AZ funziona davvero?" chiese Maya.

"Li rompiamo appositamente," disse Leo.

Suona folle. È in realtà la cosa più responsabile che un team può fare.

**Ingegneria del caos** è la pratica di iniettare intenzionalmente guasti nel tuo sistema per verificare come gestisce tali guasti. Termini deliberatamente un'istanza EC2. Fallovi manualmente l'istanza RDS. Bloccate una subnet dal load balancer.

Se il sistema si riprende automaticamente entro il tuo RTO, il tuo design funziona.

Se non lo fa, hai imparato che in un ambiente controllato — non durante un incidente di produzione alle 2 del mattino.

Per Nimbus: Leo ha scritto un runbook (una procedura documentata) per testare ogni scenario di guasto. Una volta ogni trimestre, intenzionalmente causavano un guasto a un componente e misuravano il tempo di recupero. Se il recupero richiedeva più del RTO, lo correggevano nel design.

**Multi-Regione: Sopravvivenza alle Guasti Regionali**

La maggior parte dei guasti AWS colpisce le Zone di Disponibilità, non intere Regioni. I guasti regionali sono rari — ma accadono.

In un guasto regionale (o per applicazioni globali che necessitano di una latenza molto bassa ovunque), **Multi-Regione** è la risposta: distribuisci la tua applicazione in due o più AWS Regioni.

Multi-Regione introduce complessità fondamentali:

**Replicazione dei dati**: i tuoi database devono essere sincronizzati tra le regioni. Qualsiasi dato scritto in us-east-1 deve alla fine raggiungere eu-west-1. "Alla fine" è il problema — durante il ritardo di tempo, le regioni hanno una visione leggermente diversa del mondo.

**Attivo-passivo vs attivo-attivo**:

- **Attivo-passivo**: una regione serve tutto il traffico. L'altra è un standby caldo. In caso di guasto, DNS passa il traffico allo standby. Più semplice, ma lo standby è inattivo e costoso.
- **Attivo-attivo**: entrambe le regioni servono il traffico simultaneamente. Più complesso da costruire (richiede la risoluzione dei conflitti per le scritture concorrenti), ma latenza globale inferiore e nessuna risorsa inattiva.

**Tempo di failover**: i cambiamenti DNS richiedono tempo per propagarsi (a seconda del TTL). Durante la finestra di propagazione, alcuni utenti raggiungono ancora la regione fallita. Progettare per un RTO molto basso richiede il riscaldamento dello standby e la minimizzazione del TTL in previsione degli interruttamenti pianificati.

**Strategie di Disaster Recovery: Uno Spettro**

Ci sono quattro strategie DR comuni, disposte dalla più economica (e più lenta da recuperare) alla più costosa (e più veloce da recuperare):

**Backup e Ripristino** (ore RPO/RTO):

- Effettua il backup di tutto su S3 in un'altra regione
- In caso di disastro: provisiona l'infrastruttura da zero, ripristina dal backup
- Costo: molto basso (stai pagando solo per l'archiviazione)
- Tempo di recupero: ore

**Pilot Light** (minuti a 1 ora RPO/RTO):

- Mantieni una versione minima dell'applicazione in esecuzione nella regione DR (il "pilot light" che può essere rapidamente portato su)
- I dati principali sono replicati (replica di lettura RDS nella regione DR)
- In caso di disastro: scala l'applicazione nella regione DR, promuovi la replica di lettura a primaria, passa il DNS
- Costo: moderato (stai pagando per un piccolo footprint in esecuzione)
- Tempo di recupero: minuti

**Standby Caldo** (secondi a minuti RPO/RTO):

- Esegui una versione ridotta della full application nella regione DR
- Operativo completo ma a capacità ridotta
- In caso di disastro: scala, passa il DNS
- Costo: più alto (esecuzione sempre del full stack a capacità ridotta)
- Tempo di recupero: minuti

**Attivo-Attivo / Multi-Sito** (quasi-zero RPO/RTO):

- Capacità completa in due o più regioni, che servono il traffico simultaneamente
- Nessuna necessità di recupero — se una regione fallisce, il traffico viene instradato automaticamente all'altra
- Costo: più alto (due implementazioni complete a piena scala)
- Tempo di recupero: secondi (solo propagazione DNS)

Per Nimbus a questo punto: standby caldo. Non potevano permettersi l'attivo-attivo, ma il backup e il ripristino era troppo lento per i loro requisiti aziendali.

**Amazon RDS: Multi-AZ vs Read Replicas vs Multi-Regione**

Questi tre sono distinti e comunemente confusi:

| Caratteristica       | Multi-AZ                     | Read Replica     | Read Replica Multi-Regione |
|---------------|------------------------------|------------------|---------------------------|
| Scopo       | Alta disponibilità (failover) | Scalabilità di lettura     | Scalabilità di lettura + DR         |
| Sincronizzazione dati     | Sincrona                  | Asincrona     | Asincrona              |
| Failover      | Automatic                    | Promozione manuale | Promozione manuale          |
| Leggibile?     | No (standby è passivo)      | Sì              | Sì                       |
| Cross-region? | No (stessa regione)             | Sì (opzionale)   | Sì                       |
| Per       | HA, RPO~0                    | Carico di lettura        | Disaster recovery         |

Insight chiave: lo standby Multi-AZ è **sincrono** — ogni scrittura al primario è confermata sullo standby prima che la scrittura venga riconosciuta. Ciò significa che se il primario fallisce, non si perde alcun dato. RPO = 0.

Le read replica sono **asincrone** — c'è un ritardo di replicazione. Se il primario fallisce e promuovi una read replica, potresti perdere secondi o minuti di scritture recenti. RPO > 0.

## Punti di forza e limitazioni

**Multi-AZ**:

- Essenziale per i carichi di lavoro di produzione — un singolo AZ è un singolo punto di errore
- Ben supportato dai servizi AWS (RDS, ElastiCache, EKS, ALB supportano tutti Multi-AZ)
- Costo overhead relativamente basso rispetto alla protezione che fornisce

**Multi-Regione**:

- Complesso da implementare correttamente, soprattutto per i database
- I requisiti di residenza dei dati/sovranità possono effettivamente richiedere la sua implementazione (i dati degli utenti UE devono rimanere nell'UE)
- I vantaggi di latenza per gli utenti globali derivano dal routing, non dalla multi-regione in sé (utilizza CloudFront per i contenuti statici)
- La maggior parte delle organizzazioni non ha bisogno di active-active; investe sottovalutando lo standby a caldo

## Riepilogo

- **RTO** (Obiettivo di Tempo di Ripristino): quanto a lungo puoi essere fuori servizio. **RPO** (Obiettivo di Punto di Ripristino): quanti dati puoi perdere.
- **Multi-AZ** distribuisce le risorse su Availability Zones all'interno di una Regione. Protegge dai guasti delle AZ.
- **Multi-Regione** implementa in più AWS Regioni. Protegge dai guasti regionali e serve gli utenti globali con una latenza inferiore.
- Le strategie di DR (dal più economico al più costoso): Backup & Restore → Standby a Caldo → Standby a Caldo → Active-Active.
- RDS Multi-AZ standby: sincrono, failover automatico, RPO = 0. Replica di lettura: asincrono, promozione manuale, RPO > 0.
- Testare i guasti intenzionalmente (ingegneria del caos) prima che accadano in produzione.

## Suggerimenti per l'Esame

*SAA-C03 Dominio: Progettare Architetture Resilienti (Dominio 2, Task 2.2)*

- **RTO vs RPO**: Ci si aspetta che l'esame ti fornisca requisiti ("l'organizzazione può tollerare un'interruzione di non più di 1 ora e nessuna perdita di dati") e ti chieda di scegliere la strategia di DR corretta. Mappa: nessuna perdita di dati = replicazione sincrona = Multi-AZ o active-active. 1 ora di interruzione = backup-and-restore è troppo lento; lo standby a caldo potrebbe funzionare.
- **Multi-AZ RDS vs Replica di Lettura**: L'esame chiederà HA (Multi-AZ) vs scalabilità in lettura (replica di lettura). Lo standby Multi-AZ non è leggibile. Le replica di lettura possono essere promosse alla primaria (manualmente) per DR.
- **Standby a Caldo vs Standby a Caldo**: Lo standby a caldo ha una infrastruttura in esecuzione con un minimo di attività (solo la replicazione dei dati). Lo standby a caldo ha un'applicazione in esecuzione ridotta in scala ma funzionante. La differenza è quanto velocemente puoi scalare.
- **Aurora Database Globale**: Caratteristica specifica di Aurora per la multi-regione active-passive. La regione primaria serve le scritture; le regioni secondarie servono le letture con un ritardo di replica inferiore a 1 secondo. In caso di failover, la secondaria può essere promossa in meno di 1 minuto. Segnale dell'esame: "Aurora, multi-regione, RTO < 1 minuto."
- **AWS Backup**: Servizio di backup centralizzato per EBS, RDS, DynamoDB, EFS, Storage Gateway. L'esame lo utilizza per scenari backup-and-restore.
- **Route 53 failover**: Livello DNS di DR. Controllo di salute primario fallisce → Route 53 instrada a secondario. Il tempo di propagazione significa che questo non è istantaneo.

## Esercizi

**Esercizio 1 — Ricordo**

Spiega la differenza tra RTO e RPO. Perché un'organizzazione potrebbe avere un RTO basso (non può essere fuori servizio a lungo) ma un RPO alto (può tollerare la perdita di dati recenti)?

*(Suggerimento: pensa a un'azienda in cui è più importante servire i clienti rapidamente piuttosto che preservare ogni transazione.)*

**Esercizio 2 — Esercitazione per l'Esame**

*Scenario*: Un'azienda sanitaria esegue un sistema di cartelle cliniche su RDS PostgreSQL in `us-east-1`. I requisiti normativi impongono che i dati dei pazienti non possano essere persi (RPO = 0). Il sistema può tollerare fino a 30 minuti di interruzione (RTO = 30 minuti) in caso di disastro. Il costo è una preoccupazione.

Quale architettura soddisfa meglio questi requisiti?

A) RDS Multi-AZ in `us-east-1` con backup giornalieri automatizzati a S3 in `us-west-2`
B) RDS Multi-AZ in `us-east-1` con una replica di lettura in `us-west-2` configurata per la promozione manuale
C) RDS in `us-east-1` con uno standby a caldo in `us-west-2` e replicazione active-active
D) Aurora Global Database con primaria in `us-east-1` e secondaria in `us-west-2`

**Suggerimento 1**: RPO = 0 significa nessuna perdita di dati, il che richiede la replicazione sincrona o quasi sincrona.

**Suggerimento 2**: RTO = 30 minuti significa che hai tempo per l'intervento manuale. Non hai bisogno di failover automatico millisecondo.

**Suggerimento 3**: Quale opzione fornisce la protezione Multi-AZ (RPO = 0 all'interno della regione) più la capacità di DR cross-region?

**Risposta**: A

**Spiegazione**: RDS Multi-AZ in us-east-1 fornisce la replicazione sincrona allo standby nella stessa regione — RPO = 0 per i guasti delle AZ. I backup giornalieri automatizzati a S3 in us-west-2 forniscono la DR cross-region. In caso di guasto regionale completo, si ripristina dal backup S3 in us-west-2 — entro 30 minuti per un piccolo database. Questo è conveniente e soddisfa entrambi i requisiti.

**Perché non B?** Le replica di lettura sono asincrone — può esserci un ritardo di replicazione. Se la primaria fallisce, i dati scritti dal momento dell'ultimo sincronizzazione della replica sono persi. RPO > 0, il che viola il requisito.

**Perché non C?** La replicazione active-active per PostgreSQL su più regioni è complessa da implementare e non è una funzionalità RDS standard. Questa opzione è tecnicamente difficile e costosa.

**Perché non D?** Aurora Global Database funzionerebbe, ma sarebbe significativamente più costosa di RDS Multi-AZ. Lo scenario indica che il costo è una preoccupazione e Aurora ha prezzi premium.

*SAA-C03 Domain: Progettare Architetture Resilienti — Task 2.2*

**Esercizio 3 — Sfida Architetturale** *(Opzionale)*

Nimbus è stato selezionato per fornire servizi di ordinazione per un importante festival gastronomico a Seattle. Per 72 ore, si prevede un traffico 50 volte superiore al normale, con zero tolleranza per i tempi di inattività (l'organizzatore del festival specifica sanzioni finanziarie per qualsiasi interruzione durante l'evento).

Progetta una strategia di Disaster Recovery specifica per la finestra del festival. Passare a active-active sarebbe la soluzione giusta per queste 72 ore? Come pre-testeresti il failover? Qual sarebbe il tuo RTO e come lo convalideresti prima dell'evento?

*(Non esiste una risposta univoca corretta. L'obiettivo è esercitarsi nella progettazione di DR per requisiti SLA specifici.)*

## Scena Post-Crediti

Leo ha creato il runbook per il chaos engineering.

Ogni trimestre, durante una finestra di manutenzione programmata, il team avrebbe:

1. Terminato una istanza EC2 in us-east-1a e osservato l'ASG sostituirla correttamente
2. Forzato manualmente un failover RDS Multi-AZ e verificato che l'applicazione si riconnettesse entro 60 secondi
3. Simulare un guasto completo di us-east-1b regolando le zone di disponibilità dell'ASG
4. Ripristinato un backup di una settimana di età a una nuova istanza RDS e verificato che i dati fossero corretti

La prima volta che l'hanno eseguito, il passaggio 2 ha richiesto 4 minuti e 17 secondi.

"Il nostro impegno RTO per i partner ristorativi è di 5 minuti," ha detto Tom.

"Quindi abbiamo superato il limite. Di poco."

"Cosa succederebbe se il failover richiedesse più di 5 minuti in un incidente reale?"

Maya ha risposto: "Saremmo in violazione dell'SLA. C'è una penale finanziaria nei contratti."

Leo ha fissato i 4:17 sullo schermo.

"Allora dobbiamo renderlo più veloce," ha detto. E ha iniziato a leggere la documentazione per Aurora.

Nel prossimo capitolo: la biglietteria che permette a ogni parte di Nimbus di lavorare al proprio ritmo.
