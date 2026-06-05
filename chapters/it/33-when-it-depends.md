# Capitolo 33: Dipende

Fai un ultimo respiro prima che questo capitolo.

Sei arrivato alla fine del libro. Questo è sia una conclusione che un inizio — l'ultimo capitolo, e il primo giorno in cui prenderai decisioni architetturali da solo.

Questo capitolo ha un solo compito: essere onesto con te riguardo alla cosa che nessuno ti dice abbastanza chiaramente.

**La Domanda**

Alla fine di quasi ogni discussione sull'architettura, qualcuno alla fine chiede: "Qual è la risposta giusta?".

E la risposta più utile, frustrante, onesta e fraintesa in tutta l'ingegneria del software è:

**Dipende.**

Non perché la domanda sia irrisolvibile. Non perché l'esperto stia essendo evasivo. Ma perché la risposta giusta dipende genuinamente, strutturalmente, dal contesto che non era presente nella domanda.

Questo capitolo è dedicato ad imparare a dire "dipende" correttamente — il che significa essere in grado di completare la frase.

Pensa a un medico che viene chiesto: "L'intervento chirurgico è il trattamento giusto?". Un dottore cattivo dice sì o no senza esaminare il paziente. Un buon dottore dice: "Dipende — sulla diagnosi, sull'età del paziente, sulle sue altre condizioni, e su cosa succede se aspettiamo." La risposta non è evasiva. È precisione. "Dipende" seguita da una frase completa è la cosa più utile che un medico — o un architetto — può dire.

**La Fine di Nimbus**

Due anni dopo l'inizio. Maya era in piedi in una sala conferenze a Seattle, presentando a una stanza di investitori venture capital.

Nimbus era cresciuto: 947 partner ristoranti. 18.000 ordini giornalieri. 2,1 milioni di dollari di GMV mensile. Tre città attive, due in lancio. Un team di quattordici ingegneri su due fusi orari.

Gli investitori avevano domande. Uno di loro — un partner tecnico nel fondo — si sporse in avanti.

"Quale database state utilizzando?" chiese.

Maya non esitò.

"Per gli ordini e i dati dei clienti: Aurora PostgreSQL. Per il catalogo dei menu: DynamoDB. Per la gestione delle sessioni e la cache: ElastiCache Redis. Per l'analisi: Athena su file Parquet di S3, con Redshift per le query del pannello di controllo ad alta frequenza."

Annuii. "Perché Aurora per gli ordini e non DynamoDB?"

"Gli ordini hanno una struttura relazionale complessa — fanno riferimento a menu, account clienti, indirizzi dei ristoranti, metodi di pagamento. Abbiamo bisogno di coerenza transazionale su più entità. Un database relazionale è lo strumento giusto per questo. La forza di DynamoDB è l'accesso chiave-valore ad alto throughput con schema flessibile, che è esattamente il modello di accesso del catalogo dei menu."

Scrisse qualcosa. "Cosa ne fa per la scalabilità? Dici 18.000 ordini giornalieri. Questo equivale a circa 12 al minuto in media. Come ha progettato per il picco?"

"Il picco del venerdì sera è di circa 25 volte la media. Scaliamo orizzontalmente con ECS e Aurora Serverless v2, che gestisce automaticamente gli scatti. CloudFront assorbe il carico dei contenuti statici. L'API è stateless, quindi la scalabilità orizzontale è pulita."

"E se Aurora Serverless v2 non riesce a scalare abbastanza velocemente?"

"Abbiamo i risultati dei test di carico. Il tempo di scalabilità per Aurora Serverless v2 è inferiore ai 10 secondi. Il nostro picco del venerdì dura 8 minuti dal baseline. Siamo a nostro agio con il margine."

Il partner tecnico guardò gli altri investitori. "Sa il suo sistema."

**Le Quattro Domande Sotto "Dipende"**

Ogni compromesso architetturale riduce a quattro domande fondamentali. Non tutte le domande sono ugualmente importanti per ogni decisione, ma tutte e quattro sono sempre in gioco.

**1. Qual è il modello di accesso?**

Come vengono scritti e letti i dati? A quale frequenza? Da quanti utenti concorrenti? In che ordine? Per quali chiavi?

Questa domanda determina la selezione della tecnologia al livello più fondamentale. DynamoDB vs Aurora vs Redshift vs Athena — la risposta giusta dipende quasi interamente dal modello di accesso.

**2. Qual è la scala?**

Non solo ora — in 12 mesi, in 5 anni. La scala cambia la risposta corretta. Ciò che funziona a 100 richieste al giorno si rompe a 100 milioni. Ciò che è eccessivo a 10 utenti è necessario a 10.000.

E la scala non è solo il traffico. È la dimensione del team (l'architettura deve essere mantenibile dal team che hai). È il volume dei dati. È la portata geografica.

**3. Qual è la conseguenza del fallimento?**

Se questo si rompe, cosa succede? Un utente vede una pagina lenta? Un ordine fallisce? Il denaro si sposta in modo errato? La cartella clinica di qualcuno diventa inaccessibile?

La conseguenza determina quanto investiamo nell'affidabilità. Una pagina del menu lenta giustifica la coerenza eventuale. Un pagamento fallito giustifica le scritture sincrone e la conferma esplicita.

**4. Qual è il vincolo di costo?**

Non solo denaro — anche la complessità operativa (che è una forma di costo). Una soluzione che richiede tre servizi aggiuntivi può essere tecnicamente superiore a una soluzione più semplice ma troppo costosa da mantenere con un team di quattro persone.

**"Dipende": Come completare la frase**

Il modo corretto per dire "dipende" è completarlo immediatamente:

*"Dovremmo usare DynamoDB o Aurora?"*

"Dipende dall'andamento dell'accesso. Se hai bisogno di ricerche basate su chiave ad alto throughput con uno schema flessibile, DynamoDB. Se hai bisogno di coerenza transazionale tra entità correlate con query complesse, Aurora."

*"Dovremmo usare Lambda o EC2?"*

"Dipende dalle caratteristiche del carico di lavoro. Lambda per carichi di lavoro basati su eventi, a durata breve, variabili dove il costo di inattività zero è importante. EC2 o ECS per processi persistenti, statali o a lunga durata dove le prestazioni prevedibili sono più importanti del costo di inattività."

*"Dovremmo usare Multi-AZ o Multi-Regione?"*

"Dipende dai tuoi requisiti RTO/RPO e dal tuo modello di minaccia. Multi-AZ protegge dai guasti di AZ (il più comune errore AWS) e fornisce un RPO di circa 0 e un RTO di circa 60 secondi per RDS. Multi-Regione protegge dai guasti regionali (rari) e serve utenti distribuiti globalmente. Se hai bisogno di un failover di sotto i minuti da un disastro regionale, Multi-Regione. Se la resilienza di AZ è sufficiente, Multi-AZ è molto più semplice ed economico."

"Dipende" non è la fine della risposta. È l'inizio della vera risposta.

**I Pattern Che Non Cambiano**

Mentre le scelte tecnologiche specifiche evolvono – nuovi servizi vengono lanciati, cambiano i prezzi, emergono alternative migliori – alcuni pattern fondamentali sono rimasti stabili da decenni:

**Separazione dei compiti**: I componenti che fanno cose diverse dovrebbero essere indipendenti. Un cambiamento in uno non dovrebbe richiedere un cambiamento nell'altro. Questo è il motivo per cui si decupla con SQS, non chiamate dirette. Perché si usa S3 per gli oggetti, non i database. Perché il livello web e il livello del database sono separati.

**Difesa a strati**: Nessun singolo controllo di sicurezza è sufficiente. Hai IAM, gruppi di sicurezza, NACL, WAF, GuardDuty, Secrets Manager, KMS. Se uno fallisce, il successivo lo intercetta.

**Paga per quello che usi, quando lo usi**: Il principio economico fondamentale del cloud. Lambda scala a zero. Le istanze spot usano la capacità in eccesso. Le policy di ciclo di vita di S3 spostano i dati freddi in un archivio più economico. DynamoDB on-demand addebita per richiesta. I pattern sono diversi; il principio è lo stesso.

**Ottimizza per il guasto più probabile**: Multi-AZ per primo (i guasti di AZ accadono). DR cross-region per secondo (i guasti regionali sono più rari). Ridondanza all'interno di AZ (istanze multiple) prima della complessità cross-region. Costruisci per il guasto realistico, non per il catastrofico ma improbabile.

**Misura prima di ottimizzare**: L'approccio di Tom – estrarre le metriche di CloudWatch, comprendere il modello effettivo, quindi prendere decisioni – è più prezioso dell'ottimizzazione prematura basata su ipotesi.

**Cosa Questo Libro Non Può Insegnarti**

Siamo diretti riguardo ai limiti.

Questo libro ti ha insegnato:

- Cosa fa ogni servizio AWS principale
- Gli analogici che li rendono intuitivi
- I compromessi tra le alternative
- La conoscenza dell'esame necessaria per SAA-C03
- Un framework per pensare alle decisioni architetturali

Questo libro non può insegnarti:

- **Istinto operativo**: Il senso dell'orientamento che dice "questo diventerà strano sotto carico" prima che tu lo veda accadere. Questo deriva dall'operare sistemi reali.
- **Giudizio tecnico sotto pressione**: Decidere cosa fare a mezzanotte quando il sistema è inattivo e hai informazioni incomplete. Questo deriva da incidenti.
- **Intuizione degli stakeholder**: Sapere quando opporsi a un requisito aziendale perché il costo tecnico è troppo alto. Questo deriva dall'esperienza sia dal lato tecnico che da quello aziendale.
- **La domanda giusta per il contesto specifico**: Carlos avrebbe potuto porre le domande giuste perché aveva visto problemi simili decine di volte. Questa conoscenza è guadagnata, non letta.

Non sei ancora finito di imparare. Hai appena iniziato.

**L'Esame Non È la Destinazione**

Hai raccolto questo libro per prepararti all'esame AWS Solutions Architect Associate. Questo è valido. La certificazione SAA-C03 è reale, apprezzata e aprirà le porte.

Ma l'esame testa la conoscenza e il riconoscimento dei modelli. Non testa il giudizio. Non testa l'esperienza operativa. Non testa cosa fai quando l'architettura che hai costruito smette di funzionare alle 11:00 di venerdì sera.

La certificazione è un credenziale iniziale. Quando superi l'esame, saprai come funzionano i servizi AWS e come si combinano. Avrai un framework per pensare all'architettura. Non l'avrai ancora fatto.

Il passo successivo dopo l'esame: costruisci qualcosa di reale. Deployalo. Operalo. Osserva che fallisce. Risolvi. Riempi il budget di un servizio e sposta i costi altrove. Ti chiamano nel bel mezzo della notte e prendi una decisione con informazioni insufficienti.

Questo è il modo in cui la conoscenza in questo libro diventa giudizio.

**L'Ultima Risposta di Maya**

Alla fine della riunione con gli investitori, il partner tecnico aveva un'ultima domanda.

"Se dovessi ricominciare oggi, sapendo quello che sai ora, cosa faresti diversamente?"

Maya prese un momento.

"Inizieremmo con l'Infrastructure as Code fin dal primo giorno," disse. "Leo ha distribuito la prima istanza EC2 manualmente. Ci sono voluti sei mesi per migrare tutto in Terraform. Quelli erano sei mesi di debito tecnico che ci hanno costato tempo reale."

"Altro?"

"Sarei più cauto riguardo ai servizi gestiti all'inizio. Abbiamo usato DynamoDB quando un semplice database RDS sarebbe stato sufficiente per mesi. I modelli di accesso a DynamoDB richiedevano un'analisi più approfondita di quanto ne avevamo ancora. Abbiamo ridisegnato lo schema due volte."

"Quindi, più semplice è meglio all'inizio?"

"Più semplice è meglio *sempre*. La domanda è sempre: qual è la cosa più semplice che risolve il problema reale, e non il problema previsto? Abbiamo aggiunto complessità per risolvere problemi che non avevamo ancora. Alcune di queste complessità hanno causato i propri problemi."

Il partner tecnico ha annotato tutto.

"Ultima domanda," disse. "Qual è la cosa più importante che sai su come costruire su AWS che non sapevi quando hai iniziato?"

Maya rifletté per due anni. Gli incidenti. Le revisioni dei costi. La revisione Well-Architected. Le decisioni architetturali prese sotto pressione e quelle prese con cura. Quelle che avevano fatto bene e quelle che avevano dovuto ridifinire.

"Che il cloud non risolve i problemi di architettura," disse. "Li amplifica. Una cattiva decisione in loco potrebbe costarti una settimana. Una cattiva decisione nel cloud può costarti soldi ogni mese, su larga scala, finché qualcuno non se ne accorge."

Fece una pausa.

"Il cloud rende le buone decisioni scalabili. E le cattive decisioni, troppo."

**Conclusione**

Hai imparato molto. I servizi AWS. I compromessi. I pattern.

Ora fallo.

Costruisci qualcosa. Fai errori intenzionalmente. Leggi i post-mortem (sono pubblici — AWS, Cloudflare, GitHub, Stripe pubblicano tutti quelli lì). Lavora con team che sono migliori di te nelle cose in cui sei più debole.

La certificazione SAA-C03 testerà se conosci il materiale. La tua esperienza lavorativa testerà se riesci ad applicarlo.

Entrambi valgono la pena di farli. Nessuno è la destinazione finale.

Non c'è destinazione finale in questo campo. C'è solo il prossimo problema, la prossima decisione e l'abitudine di porre la giusta prossima domanda.

In bocca al lupo.

Nel prossimo capitolo: cosa cambia quando il lavoro non è più quello di costruire il sistema — ma quello di gestirlo.

## Riepilogo

- **"Dipende" è l'inizio della risposta**, non la fine. Completa sempre la frase con le condizioni a cui dipende.
- Le quattro domande sotto ogni compromesso architettonico: modello di accesso, scala, conseguenza del fallimento, vincolo di costo.
- I pattern che durano: separazione dei problemi, difesa a strati, paga per quello che usi, ottimizza per il guasto più probabile, misura prima di ottimizzare.
- **Il cloud amplifica le decisioni** — buone e cattive. Una cattiva decisione in loco costa una settimana; una cattiva decisione nel cloud si complica mensilmente, su larga scala, finché qualcuno non se ne accorge.
- La certificazione SAA-C03 testa la conoscenza e il riconoscimento dei pattern. L'esperienza di produzione trasforma quella conoscenza in giudizio.

## Consigli per l'Esame

*SAA-C03 Dominio: Cross-domain — tutti i domini*

Questo capitolo chiude il contenuto dell'esame di questo libro. Prima di sostenere l'esame:

**Rivedi i servizi su cui ti senti meno sicuro**:

- Per la maggior parte delle persone: Kinesis vs SQS (il flusso vs la coda)
- VPC networking (tabelle di routing, subnet, NAT Gateway, Internet Gateway)
- Valutazione della politica IAM (negazione esplicita > permesso esplicito > negazione implicita)
- Selezione della classe di storage (conosci tutte le sei classi di storage S3 e i loro compromessi)
- RDS vs Aurora vs DynamoDB per casi d'uso specifici

**Conosci la struttura tipica delle domande d'esame**:

L'SAA-C03 presenta un requisito aziendale ("l'azienda ha bisogno di una disponibilità del 99,99%") e ti chiede di identificare l'architettura che soddisfa tale requisito. Leggi sempre il requisito, identifica la vincolo chiave e elimina le opzioni che non lo soddisfano.

**Pratica l'identificazione dei distrattori**:

Ogni risposta sbagliata all'esame è sbagliata per un motivo specifico. Imparare *perché* ogni risposta sbagliata è sbagliata è più prezioso che memorizzare le risposte corrette.

**L'esame premia il riconoscimento dei pattern**:

- "Decouple" → SQS/SNS
- "Serverless" → Lambda, DynamoDB, Aurora Serverless
- "Global low latency" → CloudFront, Global Accelerator, Global DynamoDB, Aurora Global
- "Compliance/auditing" → CloudTrail, Config, Security Hub, Macie
- "Cost optimization" → Spot Instances, Savings Plans, policy di ciclo di vita, ridimensionamento

**Sei pronto**. Non perché questo libro abbia coperto tutto — niente lo fa. Ma perché capisci i principi abbastanza bene da ragionare verso la risposta anche quando non riconosci immediatamente lo scenario esatto.

## Esercizi

**Esercizio Finale**

Non ci sono più domande d'esame strutturate dopo questo capitolo.

Invece: una domanda aperta.

Quale sistema costruiresti oggi, sapendo quello che sai?

Scrivilo. Disegna l'architettura. Identifica i servizi. Nota i compromessi che faresti e perché. Anticipa i guasti.

Poi costruiscilo.

Questo è l'incarico. Non c'è scadenza. Non c'è voto. C'è solo il lavoro.

## Scena Finale

L'investimento è arrivato.

Serie A. 4 milioni di dollari. Abbastanza per espandersi in cinque nuove città, triplicare il team di ingegneria e costruire Nimbus Instant.

Quella sera, Maya era al ristorante della sua famiglia. Quello originale. Quello dove Nimbus è nato, quando si è resa conto che stavano perdendo ordini perché il telefono era sempre occupato.

Ha ordinato un arepa — lo stesso piatto che ordinava sempre.

Mentre aspettava, ha aperto il suo laptop e letto il primo capitolo di questo libro.

*"Dove vive un sito web?"*

Si ricordava di non sapere la risposta.

Ha sorriso.

Ha chiuso il laptop.

È arrivato il cibo.

Era perfetto.

*Grazie per aver letto.*

*L'esame AWS Solutions Architect Associate (SAA-C03) è disponibile presso i centri di test Pearson VUE e online tramite il loro sistema di test a distanza. Visita aws.amazon.com/certification per registrarti.*

*La storia di Nimbus è fittizia. I servizi AWS, i modelli di prezzo e le best practice descritti in questo libro sono reali. Entrambi potrebbero cambiare — AWS aggiorna frequentemente i suoi servizi. Verifica sempre i prezzi e le capacità dei servizi attuali su aws.amazon.com.*

*In bocca al lupo.*
