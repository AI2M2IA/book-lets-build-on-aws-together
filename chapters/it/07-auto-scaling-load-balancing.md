# Capitolo 7: Il Ristorante Che Cresce Quando È Affollato

Era l'8:43 di una sera di venerdì quando il tasso di errore superò il 12%.

Tom notò per primo, perché Tom notava sempre per primo. Aveva un tab aperto sul pannello di controllo di CloudWatch che aggiornava nel modo in cui altre persone controllavano i social media — in modo riflessivo, costantemente, senza proprio volerlo.

"Leo," disse.

Leo stava già guardando. Tempi di risposta: in aumento. Richieste in coda: in aumento. L'unica istanza EC2 — anche la più grande che avevano aggiornato il mese scorso — era al 94% di utilizzo della CPU.

"Stiamo rifiutando clienti," disse Tom.

"Non li stiamo rifiutando," disse Leo. "Il server lo sta facendo."

"È la stessa cosa."

Lo era. E lo era successo ogni venerdì per tre settimane. Nimbus era sopravvissuto alla crisi di archiviazione — il database aveva il suo disco, le foto vivevano in S3 — ma stabile e scalabile sono problemi completamente diversi. Il sistema funzionava. Semplicemente non cresceva.

Il team aveva bisogno che il loro sistema gestisse il carico variabile automaticamente. Non per acquistare un server sufficiente per il caso peggiore e sprecare denaro durante i periodi di calma. E non per dover scervellarsi manualmente quando i picchi di traffico colpivano.

Esiste un modello per questo. AWS offre due servizi che lo implementano.

**Il Concetto: Scalabilità Orizzontale**

Ci sono due modi per far gestire a un sistema un carico maggiore.

**Scalabilità verticale** significa rendere più grande il singolo server. Più CPU. Più RAM.
L'abbiamo fatto nel Capitolo 4 quando abbiamo aggiornato da `t3.micro` a `t3.large`. Aiuta.
Ma ha dei limiti: puoi andare solo così in grande, l'istanza deve riavviarsi per ridimensionarsi,
e hai comunque un singolo punto di errore.

**Scalabilità orizzontale** significa aggiungere più server. Invece di un singolo server grande, esegui
cinque server di medie dimensioni. Quando il traffico diminuisce, esegui due. Quando sale, esegui dieci.

La scalabilità orizzontale ha vantaggi che la vertical scaling non ha:

- Nessun singolo punto di errore. Se un server muore, gli altri continuano a servire.
- Nessun riavvio richiesto per aggiungere capacità.
- Paga solo per ciò che stai utilizzando — aggiungi server quando ne hai bisogno, rimuovili quando non ne hai.
- Scalabilità lineare: il doppio dei server, circa il doppio della capacità.

Il colpo di scena: se hai più server, come fanno gli utenti a sapere a quale parlare?

**Il Load Balancer di Applicazioni: Una Porta, Molte Stanze**

Un **Load Balancer di Applicazioni** (ALB) è la porta d'ingresso della tua applicazione.

Gli utenti si connettono al load balancer. Il load balancer distribuisce le richieste in entrata
tra il tuo parco di istanze EC2. Ogni utente vede un singolo indirizzo (l'URL del load balancer). Dietro questo indirizzo, le richieste sono distribuite su quanti server sono in esecuzione.

Immagina un grande ristorante con una postazione di servizio al bancone all'ingresso. I clienti arrivano e l'host li dirige a un tavolo disponibile. L'host sa quali tavoli sono occupati e quali sono liberi. I clienti non hanno bisogno di sapere quanti tavoli ci sono — semplicemente entrano e l'host gestisce la distribuzione.

Un ALB fa questo con le richieste web. Riceve ogni richiesta HTTP in entrata e decide
quale istanza EC2 (chiamata **target**) dovrebbe gestirla, in base a fattori come:

- Round-robin (ogni server riceve a turno)
- Meno richieste in sospeso (il server con meno in sospeso riceve la prossima richiesta)
- Salute — solo i target sani ricevono traffico

**Health check** sono essenziali. L'ALB invia regolarmente richieste di test a ciascun target.
Se un target non risponde correttamente, l'ALB lo contrassegna come non sano e smette di inviare
traffico ad esso. Quando il target si riprende, il traffico riprende.

Questo è automatico. Configuri i parametri di controllo della salute; l'ALB li applica.

**Auto Scaling: Il Ristorante Che Apre Più Tavoli**

Un ALB distribuisce il traffico tra i tuoi server esistenti. Ma non aggiunge server
quando ne hai bisogno.

**Auto Scaling** lo fa.

Un **Gruppo di Scalabilità Automatica** (ASG) è una configurazione che dice ad AWS:

- Il numero minimo di istanze da sempre in esecuzione
- Il numero massimo di istanze consentito
- Le condizioni in base alle quali scalare in uscita (aggiungere istanze) o scalare in entrata (rimuoverle)

Le condizioni di scalatura sono chiamate **policy**. Il tipo più comune:

**Target tracking**: "Mantieni l'utilizzo medio della CPU al 70%". Quando l'utilizzo medio supera
70%, AWS lancia nuove istanze. Quando scende al di sotto, le istanze vengono terminate.

Questo è automatico. Nessuno deve monitorare le metriche. Nessuno deve lanciare manualmente
server. Il sistema reagisce al carico in tempo reale.

Maya osservò questo accadere in diretta durante un picco di venerdì per il primo tempo. Il numero di server passò da 2 a 5 in quindici minuti, per poi tornare a 2 dopo il picco.

"Questo," disse, "è veramente impressionante."

Tom stava osservando il grafico dei costi invece. Il costo aumentò durante il picco e diminuì dopo. "Abbiamo pagato solo per ciò che abbiamo usato," disse, altrettanto impressionato.

**Come ALB e ASG Lavorano Insieme**

Metti l'ALB davanti. L'ALB punta a un **target group** – una raccolta di
istanze che dovrebbero ricevere il traffico. Il Gruppo di Scalatura Automatica gestisce queste istanze:
le aggiunge al target group quando si scala in su, le rimuove quando si scala in giù.

Il flusso:

1. Il traffico arriva all'ALB
2. L'ALB distribuisce le richieste alle istanze sane
3. CPU/carico aumenta su queste istanze
4. L'ASG rileva l'aumento del carico, lancia nuove istanze
5. Le nuove istanze superano i controlli di salute, vengono registrate con l'ALB
6. L'ALB inizia a inviare il traffico a loro
7. Il carico diminuisce, l'ASG termina le istanze in eccesso
8. L'ALB smette di inviare traffico alle istanze terminate

Questo accade senza alcuna intervento umano.

**Launch Templates: Il Blueprint per le Nuove Istanze**

Quando l'ASG lancia una nuova istanza, deve sapere cosa lanciare. Questo è definito
in un **Launch Template** – un AMI, un tipo di istanza, i gruppi di sicurezza da applicare,
e qualsiasi dato utente (script di avvio che vengono eseguiti quando l'istanza si avvia).

Un pattern comune: costruisci la tua applicazione in un AMI personalizzato (vedi Capitolo 4).
Quando l'ASG ha bisogno di una nuova istanza, lancia quell'AMI. La nuova istanza si avvia con
la tua applicazione già installata. Nessuna configurazione manuale necessaria.

Per ambienti più dinamici, puoi anche utilizzare **script di dati utente** che recuperano e
installano l'ultima versione del tuo codice all'avvio. Questo è più flessibile ma richiede
più tempo per l'avvio.

La scelta giusta dipende da quanto tempo devono avviare le tue istanze e con quale frequenza
cambia la tua applicazione.

**Sessioni "Sticky": Un Problema Sottile**

Ecco qualcosa che inganna molti team quando implementano per la prima volta il bilanciamento del carico.

Alcune applicazioni web memorizzano i dati di sessione – stato di accesso, contenuto del carrello –
sul server stesso (in memoria o su disco locale). Questo funziona bene con un solo server.
Con più server, si rompe.

Un utente effettua l'accesso. La richiesta va a Server A. Server A memorizza la sessione. La
prossima richiesta va a Server B. Server B non ha la sessione. L'utente appare disconnesso.

Questo può essere affrontato in due modi:

**Sessioni "sticky"** (o affinity di sessione): Configura l'ALB per inviare sempre le richieste
dallo stesso utente allo stesso server. Questo è un fix a breve termine. Undermina il bilanciamento del carico (alcuni server ottengono più "sticky" utenti rispetto ad altri) e crea problemi quando un'istanza viene terminata.

**Progettazione di applicazioni stateless**: Memorizza i dati di sessione esternamente – in un database o
in un cache come ElastiCache (Capitolo 10). Ogni server può ricostruire la sessione di qualsiasi utente dal negozio esterno. I server diventano intercambiabili. Questo è l'approccio giusto per le applicazioni scalabili orizzontalmente.

Maya disse che questo era "la decisione architetturale più importante che fai quando vai su più server". Ha ragione. La incontriamo di nuovo nel Capitolo 10.

**Tipi di Bilanciatori di Carico**

AWS offre tre tipi di bilanciatori di carico, ciascuno adatto a diversi traffici:

**Application Load Balancer (ALB)**: Traffico HTTP e HTTPS. Livello 7 (comprende
HTTP). Può instradare in base al percorso URL (`/api` a un gruppo, `/static` a un altro),
header host, e parametri di query. Questo è ciò che la maggior parte delle applicazioni web utilizza.

**Network Load Balancer (NLB)**: Traffico TCP, UDP e TLS. Livello 4 (non comprende HTTP). Prestazioni estremamente elevate, milioni di richieste al secondo, latenza molto bassa. Utilizza quando hai bisogno di velocità pura o quando non stai gestendo HTTP.

**Gateway Load Balancer (GWLB)**: Per instradare il traffico attraverso dispositivi di rete virtuali di terze parti (firewall, rilevamento delle intrusioni). Avrai raramente bisogno di questo al livello base.

Per Nimbus (e per la maggior parte delle applicazioni web), ALB è la scelta giusta.

## Punti di Forza e Limitazioni

**Perché ALB + Auto Scaling è potente**:

- Scalabilità senza interruzioni (le istanze vengono aggiunte/rimosse senza interrompere le connessioni esistenti)
- Failover automatico (le istanze non funzionanti vengono rimosse dal traffico automaticamente)
- Efficienza dei costi (paghi solo per le istanze in esecuzione)
- Nessun punto di errore – più istanze su più AZ

**Dove si complica**:

- Le applicazioni stateful hanno bisogno di una gestione speciale (sessioni "sticky" o stato esterno)
- La scalabilità in su richiede tempo – se un picco di traffico arriva istantaneamente, c'è un ritardo prima che le nuove istanze siano pronte. Puoi mitigare questo con la **scalabilità programmata** (pre-scala prima di eventi noti) o un numero minimo di istanze più grande
- Più parti in movimento significano più da monitorare e debug
- Alcune applicazioni non possono essere facilmente scalate orizzontalmente (database, alcuni sistemi legacy). La scalabilità orizzontale funziona meglio per i livelli stateless.

## Riepilogo

- **Scalabilità orizzontale** (aggiunta di più server) è preferibile rispetto alla scalabilità verticale
  (rendere un server più grande) perché elimina i singoli punti di errore e
  consente un costo elastico.
- Un **Application Load Balancer (ALB)** distribuisce il traffico HTTP/HTTPS in entrata
  su più target EC2. Esegue controlli di salute e indirizza solo alle istanze operative.
- Un **Auto Scaling Group (ASG)** regola automaticamente il numero di istanze EC2
  in base a politiche di scalabilità definite (ad esempio, l'utilizzo target della CPU).
- ALB e ASG lavorano insieme: ASG gestisce la flotta, ALB distribuisce il traffico su di essa.
- Le applicazioni stateful devono utilizzare o sessioni "sticky" (soluzione a breve termine) o esternare lo stato (progettazione a lungo termine corretta).
- Per il traffico HTTP, utilizzare ALB. Per le prestazioni TCP/UDP grezze, utilizzare NLB.

## Consigli per l'esame

*SAA-C03 Dominio 2 — Attività 2.1 (architetture scalabili) / Dominio 3 — Attività 3.2*

- **I controlli di salute degli ASG possono provenire da EC2 o dall'ALB.** I controlli di salute di EC2 rilevano solo se l'istanza è in esecuzione. I controlli di salute dell'ALB rilevano se l'applicazione risponde correttamente. I controlli di salute dell'ALB sono più completi e dovrebbero essere preferiti per le applicazioni web.
- **Il tracciamento del target di scalabilità è la risposta più comune all'esame** per le politiche di scalabilità. La semplice scalabilità (aggiungere N istanze quando si attiva l'allarme) è più vecchia e meno adattiva.
- **La scalabilità orizzontale è veloce; la scalabilità verso il basso è lenta.** AWS termina le istanze gradualmente durante la scalabilità verso il basso per evitare di interrompere le connessioni attive — un comportamento controllato dall'impostazione di **ritardo di disconnessione** dell'ALB.
- **Il numero minimo di istanze è il tuo livello di resilienza.** Se imposti minimo = 1 e quell'istanza fallisce, la tua applicazione è inattiva prima che ASG possa reagire. Imposta minimo ≥ 2 e distribuiscili su AZ per una vera resilienza.
- **L'ALB può distribuire il traffico su AZ automaticamente.** Con il bilanciamento del carico cross-zone abilitato, ogni nodo ALB distribuisce le richieste in modo uniforme a tutti i target registrati, indipendentemente dall'AZ. Questo è importante per il carico bilanciato quando i numeri di istanze di istanza dell'AZ differiscono.

## Esercizi

**Esercizio 1 — Richiamo**

Nelle tue parole: qual è la differenza tra un Application Load Balancer e un Auto Scaling Group? Quale problema risolve ciascuno e perché li utilizzi tipicamente insieme?

*(Suggerimento: uno distribuisce il traffico che esiste già; l'altro regola la capacità disponibile.)*

**Esercizio 2 — Esercitazione per l'esame**

*Scenario*: Un'azienda di vendita al dettaglio ha un sito web di e-commerce che sperimenta traffico variabile: traffico basso durante i giorni feriali, picchi massicci nei fine settimana e durante gli eventi di flash sale. Vogliono che la loro applicazione gestisca i carichi di lavoro di punta senza mantenere inutilizzati i carichi di lavoro durante i periodi di calma. L'applicazione memorizza attualmente i dati delle sessioni in memoria.

Quale cambiamento di architettura risolverebbe al meglio i loro requisiti di scalabilità?

A) Aggiorna a una singola istanza EC2 molto grande che può gestire il traffico di punta
B) Distribuisci più istanze EC2 dietro un ALB con un Auto Scaling Group e memorizza esternamente lo stato in ElastiCache
C) Distribuisci più istanze EC2 dietro un ALB con sessioni "sticky" abilitate
D) Aggiungi manualmente istanze EC2 prima di ogni picco di traffico previsto e terminandole dopo
Hint 1: "Senza mantenere inutilizzati i carichi di lavoro" significa che hai bisogno di scalabilità automatica, non di un'istanza grande e fissa o di gestione manuale.

Hint 2: Il memorizzazione dei dati delle sessioni in memoria è un problema per le implementazioni multi-istanza. Quali opzioni affrontano questo?

Hint 3: L'opzione C utilizza sessioni "sticky" — questo è un workaround, non una soluzione. Quale opzione affronta correttamente sia la scalabilità che il problema di memorizzazione dei dati delle sessioni?

**Risposta**: B

**Spiegazione**: ALB con un Auto Scaling Group fornisce una scalabilità elastica e automatica — le istanze vengono aggiunte durante i picchi e rimosse durante i periodi di calma. Spostare lo storage delle sessioni in ElastiCache (un cache esterno) rende l'applicazione senza stato: qualsiasi istanza può gestire le richieste di qualsiasi utente e l'ALB può distribuire il traffico liberamente. Questa è la soluzione architettonicamente corretta.

**Perché non A?** Una singola istanza grande, per quanto grande, è comunque un singolo punto di errore. Inoltre, spreca denaro durante i periodi di calma quando la maggior parte della sua capacità è inattiva.

**Perché non C?** Le sessioni "sticky" indirizzano un utente alla stessa istanza, il che mitiga parzialmente il problema delle sessioni ma mina il bilanciamento del carico. Se quella istanza termina (durante la scalabilità verso il basso o il guasto), l'utente perde comunque la sua sessione.

**Perché non D?** La scalabilità manuale richiede a qualcuno di prevedere correttamente i picchi di traffico e di agire in anticipo. È lenta, inaffidabile e laboriosa. Auto Scaling gestisce tutto automaticamente.

*SAA-C03 Dominio 2 — Attività 2.1 / Dominio 3 — Attività 3.2*

**Esercizio 3 — Sfida di architettura** *(Opzionale)*

Nimbus ha in arrivo una grande promozione: uno sconto del 50% su tutti gli ordini per 4 ore il sabato prossimo. L'ultimo anno, un evento simile ha causato 10 volte il traffico normale. Il team prevede che il picco sarà improvviso e durerà esattamente 4 ore.

Auto Scaling reagirà alla fine, ma c'è un ritardo. Come progetteresti per questo picco improvviso che sai che arriverà? Qual è la differenza tra lo scaling reattivo e quello proattivo, e quando ciascuno di questi approcci ha senso?

*(Non esiste una risposta giusta in assoluto. Pensa alle azioni di scaling programmate, al pre-riscaldamento e alle implicazioni sui costi di ciascun approccio.)*

## Scena Post-Crediti

La prima venerdì dopo aver distribuito Auto Scaling e l'ALB, il team osservò insieme le metriche.

19:15: due istanze in esecuzione. Carico normale.
19:45: il carico aumenta. Auto Scaling lancia altre due istanze.
20:00: quattro istanze gestiscono il picco. I tempi di risposta sono stabili.
21:30: il carico diminuisce. Auto Scaling termina due istanze.
21:45: torna a due istanze.

Il sito non è mai andato giù. Non una volta.

Leo aggiornò la pagina delle metriche tre volte, come se si aspettasse di trovare un guasto che aveva perso.

"È strano che mi senta leggermente deluso che niente sia rotto?" disse.

"Sì," disse Priya.

Tom stava guardando la bolletta. Il costo aveva seguito il traffico quasi perfettamente.
"Abbiamo pagato esattamente per quello che abbiamo usato," disse. "Non di più. Non di meno."

Sembrava sinceramente sorpreso.

La mattina seguente, Maya trovò un nuovo problema nei log degli errori. Non un'interruzione — peggio.

"Il nostro database," disse, "sta restituendo tempi di query di otto secondi in media."

Otto secondi. Per un'app di ordinazione di ristoranti.

"Ogni volta che qualcuno carica il menu, stiamo interrogando ogni elemento nel database per costruire la pagina," disse Leo. "E abbiamo ora quarantasette ristoranti."

"Quanti elementi di menu in totale?" chiese Tom.

Leo eseguì la query.

"Circa ventidue mila."

Silenzio.

Nel prossimo capitolo: il database che non richiede un DBA — solo una carta di credito.
