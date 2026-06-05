# Capitolo 1: Perché Affittare Quando Potresti Comprare?

Tom aveva la domanda in mente dalla sera prima. L'aveva scritta nel suo taccuino, poi cancellata, poi scritta di nuovo.

Quando Leo e Priya arrivarono la mattina dopo — caffè in mano, a discutere di qualcosa di non correlato — Tom era già alla lavagna. La terza opzione era ancora lì, intatta. Una forma di nuvola, disegnata da qualcuno che aveva ammesso di non sapere cosa significasse.

"Ho bisogno che qualcuno mi spieghi una cosa," disse Tom, senza girarsi. "Se affittiamo computer da Amazon invece di comprare i nostri — perché sarebbe *più economico*?"

La stanza tacque. Era il tipo di domanda che sembra semplice e non lo è.

"Perché," iniziò Leo.

"No," disse Tom. "Voglio capirlo. Non solo sentire la risposta. Perché affittare è più economico che possedere?"

**Il Problema Ovvio con i Server di Proprietà**

Immagina di decidere di aprire un ristorante. Non il tipo Nimbus — un ristorante normale.

Prima che il primo cliente entri, hai bisogno di tavoli. Sedie. Una cucina. Un piano cottura. Piatti. Personale. Hai bisogno di tutto questo il giorno uno, anche se la tua prima settimana è lenta, anche se passi tre mesi con sei clienti al giorno prima che la voce si sparga.

I server fisici funzionano allo stesso modo.

Se Nimbus compra i propri server, deve comprarli per il picco previsto. Il venerdì sera più affollato che riescono a immaginare. Il momento virale in cui un food blogger pubblica sull'arepa e diecimila persone cercano di ordinare contemporaneamente.

Ma la maggior parte delle volte non è così affollato. La maggior parte delle volte quei server restano lì, consumando elettricità, facendo quasi nulla.

"Pagheremmo per una capacità che non stiamo usando," disse Maya.

"Esattamente," disse Tom, il che sorprese tutti perché era lui ad aver fatto la domanda.

**Il Modello di Affitto**

Ecco cosa rende diverso il cloud computing.

Quando usi AWS, non compri server. Affitti potenza di calcolo e paghi solo per quello che usi. È più simile all'affitto di una location che al possedere un edificio per un ristorante.

Pensa in questo modo.

Se hai bisogno di ospitare una festa di compleanno per cinquanta persone, potresti comprare una casa grande abbastanza per cinquanta persone con i loro tavoli e le loro sedie. Oppure potresti affittare una location per quattro ore di sabato, pagare esattamente lo spazio e il tempo di cui hai bisogno, e restituire le chiavi quando la festa è finita.

La location c'è ancora quando ne hai bisogno. È disponibile di nuovo quando si presenta qualcos'altro. Non hai dovuto assumere un amministratore dell'edificio. Non hai pagato le tasse sulla proprietà per tutto l'anno.

Questo è il modello cloud. AWS ha le "location." Tu arrivi quando ne hai bisogno.

**Ma Aspetta — C'è Di Più**

"Ok," disse Leo, "ma cosa succede se la mia location brucia?"

Buon istinto. Cupo, ma buono.

Uno dei presupposti silenziosi quando possiedi i tuoi server è che *tu* sei responsabile del loro funzionamento. Se il server nel tuo ufficio viene rovesciato da uno stagista goffo, il tuo sito web è giù. Se l'edificio perde corrente, il tuo sito web è giù. Se il disco rigido si guasta — e i dischi rigidi alla fine si guastano sempre — il tuo sito web è giù.

AWS gestisce data center. Strutture enormi e gestite professionalmente con alimentazione di riserva, connessioni di rete ridondanti, sicurezza fisica e team di ingegneri il cui unico lavoro è mantenere quelle macchine in funzione.

Non stai solo affittando potenza di calcolo. Stai affittando affidabilità.

"Quanto costa?" chiese Tom.

Ci arriveremo. Molti capitoli più avanti, quando gli occhi di Tom non si annebbiranno.

**Tre Cose che il Cloud Fa Diversamente**

Rendiamolo concreto. Ecco le tre differenze fondamentali tra gestire i propri server e usare un provider cloud.

**1. Paghi per quello che usi.**

Nessun server inattivo. Nessun acquisto anticipato. Se Nimbus riceve zero ordini di lunedì mattina, paga quasi nulla. Se vengono travolti la notte di Capodanno, AWS ha automaticamente la capacità pronta.

**2. Qualcun altro gestisce l'hardware.**

AWS mantiene le macchine fisiche. I cavi di rete. Gli alimentatori. I sistemi di raffreddamento. Nimbus non assume nessuno per farlo. Si concentrano sulla loro applicazione, non sull'infrastruttura sottostante.

**3. Puoi scalare su — e giù — istantaneamente.**

Questo è quello che richiede un po' di tempo per essere apprezzato appieno. Con i server fisici, scalare su significa ordinare nuovo hardware, aspettare settimane per la consegna, configurarlo. Con AWS, scalare su significa fare clic su un pulsante (o far fare tutto automaticamente al sistema). E quando non hai più bisogno della capacità extra, scala di nuovo. Smetti di pagare.

Priya era rimasta in silenzio durante questa spiegazione. Aveva una domanda.

"Che dire della sicurezza? Chi è responsabile della protezione dei dati?"

Ed è lì che diventa interessante.

**Il Modello di Responsabilità Condivisa**

Questo è uno dei concetti più importanti in tutto AWS. È semplice una volta che lo capisci, ma fa inciampare molte persone — anche all'esame.

AWS e tu condividete la responsabilità per la sicurezza. Ma ciascuna parte è responsabile di cose diverse.

**AWS è responsabile della sicurezza *del* cloud.**

I data center fisici. L'hardware. L'infrastruttura di rete. Gli hypervisor che eseguono le macchine virtuali. Se qualcuno entra in un data center AWS, è un problema di Amazon.

**Tu sei responsabile della sicurezza *nel* cloud.**

I tuoi dati. La tua applicazione. I tuoi account utente e chi ha accesso a cosa. Le configurazioni che scegli. Se qualcuno ruba la tua password e accede al tuo account AWS, è un tuo problema.

Priya annuì lentamente. "Quindi loro proteggono l'edificio. Noi proteggiamo quello che c'è dentro."

"Esattamente," disse Maya.

"Quindi se Leo apre una porta che non dovrebbe..."

"Rimane il nostro problema," confermò Maya, guardando Leo.

Leo stava già digitando qualcosa sul suo laptop e fingeva di non sentire.

## Punti di Forza e Limitazioni

Nessuno strumento è perfetto. Siate onesti su entrambi i lati.

**Perché il cloud è ottimo**:

- Nessun costo hardware anticipato
- Paghi solo per quello che usi
- Scala istantaneamente in entrambe le direzioni
- Affidabilità professionale e sicurezza fisica
- Accesso a centinaia di servizi gestiti (database, code, machine learning, e altro) senza doverli costruire o manutenere tu stesso

**Dove diventa complicato**:

- I costi possono essere imprevedibili se non stai prestando attenzione (il futuro incubo di Tom)
- Dipendi da terze parti per la tua infrastruttura — se AWS ha un'interruzione nella tua regione, anche il tuo servizio ne risente
- C'è una curva di apprendimento. AWS ha centinaia di servizi. Sapere quale usare richiede esperienza, o un libro come questo.
- I dati che escono dal cloud possono essere costosi. Spostare grandi quantità di dati fuori da AWS costa denaro. (Lo rivisiteremo nel Capitolo 30.)

"Quindi stiamo scambiando controllo per convenienza," disse Tom.

"E scambiamo costo anticipato per costo continuativo," aggiunse Maya.

"E scambiamo il problema di qualcun altro con il nostro problema, sul lato della sicurezza," disse Priya.

"Ma stiamo anche scambiando il server rotto di Leo con il server molto-non-rotto di Amazon," disse Leo, che apparentemente aveva ascoltato tutto il tempo.

Non aveva del tutto torto.

## Riepilogo

- Il cloud è potenza di calcolo che affitti invece di possedere.
- AWS è il più grande provider cloud al mondo.
- Il vantaggio fondamentale è la scalabilità pay-as-you-go: paghi solo per quello che usi, e puoi scalare su o giù secondo necessità.
- AWS gestisce l'infrastruttura fisica. Tu gestisci la tua applicazione, i tuoi dati e le tue configurazioni. Questa divisione è chiamata il **Modello di Responsabilità Condivisa**.
- Il cloud non è sempre più economico o più semplice — ma rimuove le barriere all'inizio e rende possibile la scalabilità in modi che i server fisici non possono eguagliare.

## Consigli per l'Esame

*Dominio SAA-C03: Cross-domain — Fondamentali del cloud computing*

- Il **Modello di Responsabilità Condivisa** appare regolarmente nell'esame. Ricorda: AWS è responsabile della sicurezza *del* cloud (hardware, data center, rete globale). Tu sei responsabile della sicurezza *nel* cloud (dati, identità, configurazione dell'applicazione).
- **Sfumatura critica**: la divisione cambia a seconda del tipo di servizio. Per EC2 (una macchina virtuale che controlli), *tu* aggiorni il sistema operativo. Per RDS (un database gestito), AWS aggiorna il motore del database. Più un servizio è "gestito", più responsabilità si sposta su AWS. Gli scenari dell'esame descriveranno un incidente e chiederanno chi è responsabile — chiedi sempre "quanto è gestito questo servizio?"
- Le domande sui *vantaggi* del cloud spesso testano CapEx vs. OpEx. L'hardware on-premises è una spesa in conto capitale (CapEx — compri una volta, ammortizzi nel tempo). Il cloud è una spesa operativa (OpEx — paghi mensilmente). AWS sposta i costi da CapEx a OpEx.
- "Elasticità" — la capacità di scalare su *e giù* automaticamente — è un vantaggio fondamentale del cloud. Potresti vederla abbinata a "scalabilità" nell'esame. L'elasticità significa scalabilità automatica e guidata dalla domanda in entrambe le direzioni. La scalabilità significa che il sistema *può* crescere, ma non necessariamente si riduce automaticamente.

## Esercizi

**Esercizio 1 — Ricorda**

Con parole tue: spiega il Modello di Responsabilità Condivisa. Chi è responsabile di cosa, e perché quella distinzione è importante?

*(Suggerimento: Pensa all'analogia di Priya — chi protegge l'edificio e chi protegge ciò che c'è dentro.)*

**Esercizio 2 — Pratica per l'Esame**

*Scenario*: Un'azienda sta migrando la sua applicazione web da un data center on-premises ad AWS. Il team di sicurezza è preoccupato di mantenere la conformità con le proprie policy di protezione dei dati. Un nuovo ingegnere chiede: "Ora che siamo su AWS, Amazon gestisce tutti i nostri requisiti di sicurezza?"

Quale delle seguenti descrizioni MEGLIO descrive come sono divise le responsabilità di sicurezza?

A) AWS è pienamente responsabile di tutta la sicurezza una volta che l'applicazione è ospitata nel cloud  
B) Il cliente è pienamente responsabile di tutta la sicurezza, inclusa la sicurezza fisica del data center  
C) AWS gestisce la sicurezza dell'infrastruttura sottostante; il cliente gestisce la sicurezza dei propri dati, applicazioni e configurazioni  
D) Le responsabilità di sicurezza vengono negoziate per account e dipendono dal livello di servizio del cliente

**Suggerimento 1**: Pensa a cosa AWS controlla fisicamente versus cosa controlli tu.

**Suggerimento 2**: AWS possiede i data center. Tu hai scelto cosa mettere al loro interno e come configurare la tua applicazione.

**Suggerimento 3**: Abbiamo introdotto un nome specifico per questa divisione di responsabilità in questo capitolo.

**Risposta**: C

**Spiegazione**: Il Modello di Responsabilità Condivisa di AWS divide la sicurezza in due domini. AWS protegge l'infrastruttura fisica — data center, hardware e rete. Il cliente protegge tutto ciò che distribuisce sopra di essa: i propri dati, i propri controlli di accesso, le configurazioni dell'applicazione e le impostazioni di rete.

**Perché non A?** AWS non si assume mai la piena responsabilità per la sicurezza dell'applicazione del cliente. Dal momento in cui configuri qualcosa, quella configurazione è tua da gestire.

**Perché non B?** I clienti non sono responsabili della sicurezza fisica del data center — questo è precisamente uno dei vantaggi dell'utilizzo di AWS.

**Perché non D?** Il Modello di Responsabilità Condivisa è un framework fisso, non un accordo negoziato.

*Dominio SAA-C03: Cross-domain — Concetti cloud / Responsabilità Condivisa*

**Esercizio 3 — Sfida Architetturale** *(Facoltativo)*

Un amico sta lanciando una nuova app e chiede la tua opinione. Sta decidendo tra l'acquisto di due server fisici (uno per l'app, uno per il database) o l'utilizzo di un provider cloud. Il traffico previsto è di 10-100 utenti al giorno, ma ha un evento di lancio tra tre mesi che potrebbe portare 10.000 utenti in un solo giorno.

Analizza i compromessi. Quale opzione raccomanderesti e qual è il motivo principale? Cosa rinunceresti con la tua scelta?

*(Non esiste una risposta unica corretta. L'obiettivo è praticare il pensiero sui compromessi.)*

## Scena Post-Crediti

Tre giorni dopo, Nimbus aveva un account AWS.

Leo lo aveva creato alle 23 usando la sua email personale, una carta di credito che aveva dovuto prendere in prestito da Tom, e un entusiasmo che, retrospettivamente, era leggermente allarmante.

"Ho trovato qualcosa che si chiama EC2," disse la mattina dopo, mostrando lo schermo del suo laptop. "È come un computer che noleggi. Credo di averne avviato uno."

"*Credi*?" chiese Priya.

"Voglio dire, l'ho sicuramente avviato." Scorrò verso il basso. "Non so solo dove si trova."

Maya si avvicinò e guardò lo schermo.

"Leo," disse. "Perché dice 'Region: ap-southeast-1'?"

"Cosa significa?"

Nel prossimo capitolo: la geografia di AWS — dove si trovano effettivamente i server e perché è importante.
