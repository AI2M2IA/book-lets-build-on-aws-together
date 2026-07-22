# Capitolo 27: Pagare per Ciò di Cui Hai Bisogno

Tom si preparò un caffè prima di aprire la scheda della fatturazione. Lo faceva sempre — certi report si affrontavano meglio con qualcosa di caldo. Si sistemò sulla sedia vicino alla finestra, tazza in mano, il silenzio del sabato mattina ancora intatto fuori. Niente ping, niente standup. Solo il foglio di calcolo e i numeri.

Aprì la scheda.

Le analisi Athena del capitolo precedente avevano fatto qualcosa di inaspettato: interrogando i report di costo e utilizzo direttamente da S3, Tom riusciva finalmente a vedere non solo la bolletta AWS totale, ma una suddivisione di quanto costava effettivamente ogni servizio, settimana per settimana, nell'arco di sei mesi. Il quadro che emergeva era abbastanza chiaro da essere allarmante. EC2 era la voce più grande, e il pattern era inequivocabile — il team stava pagando i prezzi da walk-in per un hotel in cui abitava a tempo pieno. Quella realizzazione portò Tom alla pagina dei prezzi EC2 in un sabato mattina con una tazza di caffè fresco e la determinazione di capire ogni opzione prima del prossimo bollettino mensile.

Tom aveva rivisto la bolletta AWS ogni mese da quando Nimbus era iniziata. Per il primo anno capiva circa il 60% di quello che vedeva. Ormai capiva quasi tutto — eccetto perché la sezione EC2 lo facesse sempre sentire come se stessero pagando troppo. La sezione EC2 era un mix di "istanze On-Demand" a vari tipi di istanza, tutte con prezzo orario, tutte che sommavano $2.340/mese.

Prima di chiamare qualcuno, passò un'ora a rivedere da solo l'elenco delle istanze — non per trarre conclusioni, ma per formulare ipotesi da testare.

Vide quattro istanze r6g.large con tag "api-prod". Vide due istanze c6g.medium che facevano girare i processori di job in background. Vide un t3.medium etichettato "vpn-server" che girava da quando l'azienda aveva tre mesi di vita. Vide una coppia di istanze con tag "analytics-batch" che comparivano alle 3 del mattino e sparivano prima delle 7 ogni notte.

Scrisse una colonna di ipotesi:

- Server API: prevedibili, sempre attivi.
- Processori in background: probabilmente prevedibili.
- Server VPN: sempre attivo, non cambia mai.
- Batch analytics: forse eleggibili per Spot?

Poi scrisse a margine: *verifica ciascuno prima di decidere qualsiasi cosa.*

Quella disciplina — separare "ciò che assumo" da "ciò che so" — era ciò che rendeva utili le revisioni dei costi di Tom. Chiamò gli altri.

"Potremmo semplicemente continuare a pagare il prezzo da walk-in," disse Tom, quando gli altri si unirono alla chiamata. "Ma non lo faremo."

"Il prezzo da walk-in?" chiese Leo.

"Il pricing On-Demand," disse Tom. "È come prenotare una camera d'albergo la mattina in cui ne hai bisogno. Massima flessibilità. Massimo prezzo."

"Qual è l'alternativa?"

**L'Analogia dell'Albergo**

Tom ci pensò un momento. "Sai come alcune persone prenotano una camera d'albergo la mattina in cui arrivano? Siamo noi, in questo momento. Esistono strategie migliori — prenotare sei mesi in anticipo e ottenere uno sconto, prendere una camera invenduta all'ultimo minuto a un prezzo conveniente, o affittare l'intero piano se hai bisogno dell'intero piano. Stesso albergo, quattro prezzi diversi."

Leo lo guardò. "E le versioni AWS di queste sono?"

Tom aprì la pagina dei prezzi EC2. "Ci sono quattro modelli di pricing. E ne stiamo usando solo uno."

Il pricing EC2 si mappa sorprendentemente bene alle strategie di prenotazione delle camere d'albergo:

**On-Demand**: Ti presenti alla reception senza prenotazione. Paghi la tariffa intera al bancone, ma puoi fare il check-out quando vuoi. Perfetto per soggiorni imprevedibili.

**Reserved Instances/Savings Plans**: Prenoti una camera per l'intero anno in anticipo. Ottieni uno sconto significativo — dal 30 al 72% — in cambio dell'impegno a utilizzarla.

**Spot Instances**: Prendi una camera invenduta allo sconto netto corrente dell'albergo — nessun contrattare, l'albergo fissa il prezzo in base a quanto è vuoto. Fino al 90% in meno. Ma l'albergo può chiederti di andarsene con due minuti di preavviso se ha bisogno della camera per un cliente a prezzo pieno. (Anni fa bisognava fare un'*offerta* per la capacità Spot; AWS ha eliminato le offerte nel 2017 — si paga semplicemente il prezzo Spot corrente.)

**Dedicated Host**: Affitti l'intero piano dell'albergo esclusivamente per te. Nessuna condivisione con altri ospiti. Significativamente più costoso. Richiesto quando le licenze software o le regole di conformità proibiscono la condivisione di un host fisico.

Ogni modello ha un caso d'uso. L'errore che stava commettendo Nimbus: usare On-Demand per tutto, compresi i carichi di lavoro che giravano 24/7 e erano del tutto prevedibili.

**Istanze On-Demand: Massima Flessibilità, Massimo Costo**

**Quando usarle**:

- Carichi di lavoro imprevedibili (picchi di traffico che non riesci a prevedere)
- Sviluppo e test (avvio e arresto frequenti)
- Carichi di lavoro a breve termine (eseguire un esperimento per una settimana)
- Prima implementazione (prima di capire i tuoi pattern di utilizzo)

**Quando non usarle**:

- Carichi di lavoro di produzione in stato stabile che sai gireranno per più di un anno
- Qualsiasi cosa con un carico di base prevedibile

**EC2 Hibernation: Mettere in Pausa Senza Perdere lo Stato**

Una tecnica di ottimizzazione dei costi che non riceve abbastanza attenzione è l'**EC2 Hibernation**. Quando fermi una normale istanza, il contenuto della RAM scompare — il prossimo avvio è un cold start. Il sistema operativo si avvia, l'applicazione si inizializza, le connessioni al database vengono ristabilite. Per la maggior parte dei server web in produzione va bene. Per certi carichi di lavoro è costoso.

Quando iberni un'istanza, il contenuto della RAM viene salvato nel volume EBS root prima dello spegnimento. Al successivo avvio, l'istanza riprende esattamente da dove era rimasta — processi in esecuzione, connessioni stabilite, stato dell'applicazione intatto — in una frazione del tempo necessario per un cold start. È particolarmente utile per job di analisi a lunga esecuzione che vuoi mettere in pausa durante la notte senza perdere lo stato, o per istanze di sviluppo che impiegano diversi minuti ad avviarsi e configurare il proprio ambiente.

"Ho un'istanza di data science," disse Leo, guardando il foglio stampato. "Ci vogliono nove minuti per avviarsi. Ambiente personalizzato, una dozzina di pacchetti Python, alcuni pesi di modello precaricati. La fermo ogni sera e la riavvio ogni mattina."

"Quindi passi nove minuti a guardarla avviarsi ogni giorno," disse Tom.

"Sì."

"Sono 45 minuti a settimana di tempo ingegneristico in attesa di un'istanza EC2."

"Sì."

"Ibernala."

Con l'ibernazione, l'istanza di Leo si metteva in pausa alla fine della giornata, salvava la sua RAM nel volume EBS root, e riprendeva in meno di 90 secondi la mattina seguente. Le sessioni di analisi continuavano esattamente da dove le aveva lasciate.

Requisiti dell'ibernazione: l'ibernazione deve essere **abilitata al momento del lancio** — non puoi attivarla per un'istanza già in esecuzione (Leo ha dovuto rilanciare il suo box di data science da un AMI per averla). Le istanze devono avere RAM fino a 150 GB (il contenuto della RAM deve entrare nel volume EBS root), il volume root deve essere abbastanza grande da contenere sia il SO che il dump della RAM, e il volume root deve essere crittografato (l'ibernazione salva dati sensibili in-memory su disco). Le istanze bare-metal e le istanze con più di 150 GB di RAM non supportano l'ibernazione. Un altro limite: un'istanza può restare ibernata al massimo **60 giorni** — dopo di che deve essere avviata, fermata o terminata; non può dormire a tempo indeterminato.

Tom identificò le istanze On-Demand di Nimbus:

- Server API web: 4 istanze EC2, in esecuzione 24/7 per 18 mesi. *Carico di base prevedibile.*
- Server VPN: sempre in esecuzione. *Carico di base prevedibile.*
- Server API aggiuntivi per picchi di traffico: imprevedibili. *On-Demand è corretto qui.*

"Aspetta — ma *perché* i server per i picchi dovrebbero restare On-Demand?" chiese Maya. "Se i picchi avvengono ogni venerdì, non è abbastanza prevedibile per fare un impegno?"

Tom ci rifletté. "Il carico di base è prevedibile. Il picco è prevedibile nei tempi, ma non nell'entità. Alcuni venerdì sera sono il 30% sopra il normale; altri sono il 150% sopra. Se acquisto capacità Reserved per sei istanze e un picco ne richiede solo due in più, mi sono over-committed. Se ne acquisto per due e il picco ne richiede otto, sono a corto e l'overflow gira On-Demand comunque. Per la capacità burst specificatamente, On-Demand o Spot è corretto — non puoi acquistare una Reserved Instance in tempo reale quando il traffico inizia a salire."

C'è una ragione per cui la lista "quando non usarle" è importante: se hai fatto girare le stesse istanze per sei mesi e puoi prevedere che continueranno a girare, ogni mese On-Demand è un mese in cui stai pagando il prezzo da walk-in per una camera che occupi stabilmente.

**Reserved Instance: L'Impegno Annuale**

**Le Reserved Instance (RI)** sono un impegno di fatturazione — accetti di usare un tipo di istanza specifico in una regione specifica per 1 o 3 anni. In cambio, AWS addebita un costo orario inferiore.

**Livelli di sconto**:

- 1 anno, No Upfront: ~30-40% di sconto rispetto a On-Demand
- 1 anno, Partial Upfront: ~35-45% di sconto (paghi una parte ora, meno all'ora)
- 1 anno, All Upfront: ~40-50% di sconto (paghi l'intero anno ora)
- 3 anni, All Upfront: ~55-72% di sconto (massimo sconto, massimo impegno)

**Standard vs Convertible RI**:

- **Standard**: Bloccata all'esatto tipo di istanza e regione. Può essere venduta sul Reserved Instance Marketplace se non ne hai più bisogno.
- **Convertible**: Può cambiare tipo di istanza, OS e tenancy durante il periodo di impegno. Sconto inferiore rispetto alla Standard (fino a ~66% vs 72%).

Tom fece i conti per i 4 server API (r6g.large, circa $0.101/ora On-Demand):

- Costo annuale On-Demand: $0.101 × 24 × 365 × 4 ≈ $3.540
- RI 1 anno All Upfront (1 istanza): ~$520 upfront (≈41% off)
- 4 istanze: ~$2.080 upfront = **circa $1.460 risparmiati nel primo anno**

"Potremmo risparmiare quasi millecinquecento dollari nel primo anno solo impegnandoci," disse Tom. "Quanto costa al mese esattamente — ogni reserved instance confrontata a quello che stiamo pagando ora?"

"È front-loaded," disse Maya. "Paghi l'intero anno in anticipo."

"Aspetta — ma *perché* dovremmo impegnarci sulla Standard RI se i tipi di istanza sono ancora in evoluzione?" chiese Maya. "E se r6g diventasse obsoleto il prossimo anno?"

"Prendiamo le Convertible RI se pensiamo di dover cambiare. Sconto inferiore — fino a ~66% invece di 72% — ma la flessibilità di cambiare famiglia di istanze durante il periodo di impegno."

"E se AWS rilascia un tipo di istanza migliore dopo che ci siamo impegnati?"

"Controlliamo quando scade la RI. Se il nuovo tipo è migliore, acquistiamo una nuova RI per il termine successivo. La RI attuale continua il suo corso al prezzo impegnato."

Tom portò il confronto del break-even sullo schermo condiviso in modo che tutti potessero seguire:

**Confronto a tre vie: r6g.large, 4 istanze, 12 mesi**

| Opzione | Costo Annuale | Equivalente Mensile | Flessibilità |
|---|---|---|---|
| On-Demand ($0.101/ora × 4) | $3.540 | $295 | Completa |
| Compute Savings Plan (~34% off 1 anno, $0.27/ora impegnato) | $2.365 | $197 | Alta |
| Standard RI, 1 anno All Upfront (4 × $520) | $2.080 | $173 | Bassa |

"Aspetta," disse Leo. "La RI è più economica del Savings Plan?"

"Allo stesso termine, sì — questo è il prezzo della flessibilità," disse Tom. "Un Compute Savings Plan si applica a *qualsiasi* tipo di istanza, dimensione, regione, persino Fargate e Lambda, quindi il suo sconto massimo è inferiore — fino al 66% al livello triennale. Una Standard RI, o un EC2 Instance Savings Plan, ti vincola a una famiglia di istanze e ti ricompensa per quel vincolo con sconti fino al 72%. Più libertà mantieni, meno AWS sconteggia."

"Qual è il break-even per la RI a 3 anni?"

"3 anni All Upfront: circa $1.060 per istanza, quindi $4.240 in totale per tutte e quattro — quello copre 36 mesi. Equivalente mensile: $118, contro $295 On-Demand. L'upfront si ripaga intorno al quattordicesimo mese; dopo di ciò sei in territorio di risparmio per quasi altri due anni."

"Quindi se al mese quattro decidiamo che abbiamo bisogno di una diversa famiglia di istanze," disse Priya, "stiamo ancora pagando per l'impegno originale."

"Corretto. Puoi vendere le Standard RI sul RI Marketplace, ma non sempre al valore pieno. Le Convertible RI possono essere scambiate ma non vendute. Per questo il Savings Plan è spesso la scelta più sicura — stesso principio, meno lock-in."

**Savings Plan: L'Impegno Flessibile**

I **Savings Plan** sono un'alternativa più recente e più flessibile alle Reserved Instance. Invece di impegnarsi per un tipo di istanza specifico, ti impegni per un *importo specifico di spesa oraria* (in dollari).

**Compute Savings Plan**: Si applica a qualsiasi istanza EC2, indipendentemente da tipo, dimensione, regione o OS. Il più flessibile. Fino al 66% di sconto.

**EC2 Instance Savings Plan**: Si applica a una famiglia di istanze specifica in una regione (es. "istanze c6g in us-west-2"). Più restrittivo del Compute, ma fino al 72% di sconto (stesso del massimo RI).

**SageMaker Savings Plan**: Specifico per training e inference di SageMaker ML.

Per Nimbus: Compute Savings Plan per i loro server API. Si sono impegnati a $0.45/ora di spesa compute. Qualsiasi tipo di istanza, qualsiasi dimensione — e l'impegno copre anche Fargate e Lambda, che avrebbe avuto importanza per ciò che seguì. Quando scalano la flotta o cambiano tipi di istanza, il Savings Plan si applica ancora.

"Questo è meglio delle Reserved Instance per noi," disse Leo. "Stiamo ancora sperimentando con i tipi di istanza. Il Compute Savings Plan ci dà lo sconto senza vincolarci specificamente alle r6g."

"Cosa succede quando ci impegniamo a $0.45/ora e alcuni mesi ne usiamo solo $0.36?" chiese Maya.

"Paghi $0.45 comunque," disse Tom. "L'impegno è incondizionato. Il Savings Plan si applica a qualsiasi utilizzo tu abbia fino all'importo impegnato. Qualsiasi cosa al di sopra gira ai prezzi On-Demand. La disciplina è impostare l'impegno a un livello che sei sicuro di raggiungere sempre."

"E non dovremmo impegnarci sulla nostra media — dovremmo impegnarci sul nostro minimo," disse Priya.

"Esatto. Guarda gli ultimi sei mesi. Trova la settimana più bassa. Impegnati al 90% di quel numero. Poi rivedilo ogni trimestre man mano che cresciamo."

"Hai pensato a cosa succede se ci over-committiamo?" continuò Priya. "Compriamo un piano da $2/ora, poi il prossimo trimestre ottimizziamo e il nostro utilizzo compute scende a $1.50?"

"Il gap da $0.50/ora diventa uno spreco," disse Tom. "Stiamo pagando per capacità che non esiste più. Questo è il rischio di impostare l'impegno troppo alto. La revisione trimestrale serve esattamente per questo — se il nostro utilizzo è sceso sotto l'impegno, sappiamo che il prossimo acquisto dovrebbe essere più piccolo. Una sfumatura importante: un *Compute* Savings Plan ti segue su Fargate e Lambda — migrare carichi di lavoro EC2 ai container non lo affosserebbe. Ciò che affossa l'impegno è genuinamente usare meno compute, o tenere un *EC2 Instance* Savings Plan o RI per una famiglia di istanze che hai smesso di usare."

Potresti chiederti: perché non acquistare sempre Savings Plan al massimo importo conveniente e lasciare che AWS lo gestisca? La risposta è che l'impegno è un pavimento, non un soffitto. Se ti impegni a $5/ora ma ne usi solo $3/ora, paghi $5/ora. Ogni dollaro di spesa impegnata che non corrisponde all'utilizzo effettivo è un dollaro sprecato. La revisione trimestrale non è opzionale — è ciò che mantiene il Savings Plan un'ottimizzazione anziché un over-commitment.

**Spot Instance: Lo Sconto del 90%**

Le **Spot Instance** usano la capacità EC2 inutilizzata di AWS. Quando AWS ha server inutilizzati, puoi noleggiarli a un prezzo dal 60 al 90% inferiore a quello On-Demand. Quando AWS ha nuovamente bisogno di quella capacità (per clienti On-Demand o Reserved), ti dà un preavviso di 2 minuti e termina la tua istanza.

Potresti chiederti: chi progetterebbe un sistema intorno a istanze che possono sparire con due minuti di preavviso? La risposta è: chiunque il cui lavoro possa essere riavviato da zero. Job batch, analisi, pipeline di rendering — nessuno di questi richiede che l'istanza specifica che ha iniziato il lavoro sia quella che lo finisce. Il preavviso di 2 minuti è sufficiente per salvare un checkpoint, drenare le connessioni e uscire in modo pulito.

Il rischio di interruzione è la caratteristica distintiva. Le Spot Instance sono appropriate solo per:

- **Carichi di lavoro fault-tolerant**: Se un'istanza viene terminata a metà del task, il task può riavviarsi senza corrompere nulla
- **Elaborazione stateless**: Ridimensionamento di immagini, encoding video, analisi batch, training ML
- **Job batch di breve durata**: Il preavviso di 2 minuti è sufficiente per salvare lo stato e fare il checkpoint
- **Flotte miste di Auto Scaling**: Usa Spot per la maggior parte del tuo ASG con On-Demand come baseline

Per Nimbus: le Spot Instance avevano senso per i job di analisi batch che giravano ogni notte (elaborando i dati degli ordini giornalieri in report aggregati). Se una Spot Instance viene interrotta a metà job, il job fallisce, ma riparte dall'inizio su una nuova istanza. I dati in S3 sono al sicuro.

Ma Leo lo scoprì a sue spese prima che il team capisse pienamente il pattern.

Tre mesi prima, aveva spostato il job batch notturno su Spot senza costruire la logica di checkpoint. La prima notte, la Spot Instance girò senza problemi. La seconda notte fu interrotta alle 4:47 del mattino — quarantasette minuti dopo l'avvio di un job che richiedeva un'ora e venti minuti per completarsi. Il job fallì. Il report finale degli ordini del giorno precedente era mancante quando i partner ristorante si loggarono quella mattina.

"L'ho già deployato — ah," aveva detto Leo, guardando la notifica di job fallito. "Avevo dato per scontato che andasse bene. La prima notte è andata."

"Cosa è successo?" aveva chiesto Maya.

"Interruzione Spot. AWS aveva bisogno della capacità indietro, ci ha dato due minuti, istanza terminata. Il job non aveva checkpoint. Quando una nuova Spot Instance si è avviata alle 5 per riprovare, è ripartita da zero. Ha finito alle 6:40. I report erano in ritardo di due ore."

La correzione era semplice: scrivere i risultati intermedi in S3 ogni quindici minuti. Ogni checkpoint era uno stato parziale completo — abbastanza perché una nuova istanza leggesse l'ultimo checkpoint e continuasse da quel punto invece di ripartire dall'inizio.

"Usare Spot per il job notturno ha ridotto il suo costo da $12/notte a $2/notte," riportò Leo, dopo che la correzione era in opera. "Anche con la notte andata male, il costo totale di eseguirlo per tre mesi era inferiore a due settimane di pricing On-Demand."

"Andrà bene," aggiunse Leo, "anche se viene interrotto a metà run — vero?"

"Con il checkpointing in opera, sì," disse Tom. "Senza, no. La tolleranza all'interruzione deve essere costruita nel job, non data per scontata."

"E se qualcuno tentasse di intromettersi?" chiese Priya. "La Spot Instance è su hardware condiviso. Se viene interrotta e ne parte una nuova, c'è qualche esposizione di dati tra le istanze?"

"No," disse Tom. "AWS azzera lo storage dell'istanza alla terminazione. Il prossimo cliente che ottiene quell'hardware vede una lavagna pulita. Ma è un buon istinto — ogni volta che si usa capacità condivisa, vale la pena verificare il modello di isolamento."

**Spot Fleet Diversification**

Leo aveva imparato un'altra cosa dal job batch interrotto: quando richiedi un singolo tipo di Spot Instance, stai scommettendo sulla disponibilità di quel tipo specifico in quell'AZ. Se la capacità Spot per c5.2xlarge in us-west-2a è esaurita, il tuo job aspetta — o fallisce.

**Spot Fleet** risolve questo problema permettendoti di specificare più tipi di istanza e AZ in un'unica richiesta. AWS soddisfa la flotta da quei pool secondo la strategia di allocazione che scegli.

```
Spot Fleet request:
  Target capacity: 4 units
  Fleet diversification:
    - c5.2xlarge, us-west-2a
    - c5.2xlarge, us-west-2b
    - c5a.2xlarge, us-west-2a
    - m5.2xlarge, us-west-2a
    - c5d.2xlarge, us-west-2b
  Allocation strategy: diversified
```

Con una flotta diversificata, un'interruzione in un tipo di istanza o AZ colpisce solo una parte della flotta. Il resto continua a girare. Per il job batch di Nimbus, eseguire una Spot Fleet a quattro istanze invece di una singola istanza grande significava che anche un'interruzione parziale permetteva al job di finire — più lentamente, ma senza il riavvio completo.

"Per essere precisi su cosa fa `diversified`," disse Tom, "distribuisce le istanze uniformemente tra i pool — non va a cercare quello più economico. Questa è una strategia diversa, `lowest-price`, che fa risparmiare di più ma concentra il rischio di interruzione. Oggi AWS raccomanda `price-capacity-optimized`, che pesa il prezzo rispetto ai pool meno propensi a essere interrotti."

"Quanto costa al mese rispetto all'usare un singolo tipo di istanza?" si chiese Tom ad alta voce — l'abitudine era diventata del tutto riflessa ormai. Fece il conto. Spot Fleet a prezzi misti in media $1.80/notte contro $2.00/notte con una richiesta a tipo singolo. Piccola differenza in termini assoluti, ma il solo miglioramento dell'affidabilità giustificava il cambiamento.

"E se qualcuno tentasse di intromettersi nello Spot Fleet?" chiese Priya.

"Stessa risposta di sempre," disse Tom. "Ogni istanza è isolata dalle altre. La Fleet non le mette automaticamente in un segmento privato condiviso. I tuoi security group si applicano ancora a ogni istanza individualmente."

Il checkpointing aveva reso le interruzioni gestibili, non eliminate. Il job ripartiva ancora dall'ultimo checkpoint, e se il riavvio coincideva con un periodo di picco dei prezzi Spot, l'istanza sostitutiva potrebbe impiegare da 10 a 20 minuti per diventare disponibile. Il lavoro già coperto dall'ultimo checkpoint veniva saltato al riavvio; il lavoro successivo veniva rifatto. Overhead totale di rilavorazione: piccolo, ma reale.

Lo Spot Fleet risolse il problema di disponibilità in modo pulito. Specificando cinque tipi di istanza in tre AZ, Leo ridusse la probabilità di un gap di capacità completo a quasi zero. La strategia di allocazione di AWS — diversified — distribuiva la flotta a quattro istanze sui pool, in modo che l'interruzione di nessun singolo pool potesse fermare il job. Quando un'istanza veniva interrotta, le rimanenti tre continuavano l'elaborazione, e il checkpoint significava che l'istanza sostitutiva riprendeva solo il lavoro che l'istanza interrotta stava elaborando a metà. Da inizio a fine, il job non mancò mai più la deadline del report delle 7 del mattino.

"Cosa ha costato la diversificazione in complessità?" chiese Maya, quando Leo documentò tutto questo.

"Tre righe extra nella richiesta Spot Fleet," disse Leo. "Il codice di elaborazione non sa né gli importa su quale tipo di istanza sta girando. La complessità vive interamente nella configurazione della flotta, non nell'applicazione."

Questo era il vantaggio di progettare l'applicazione per essere stateless dall'inizio: le decisioni di scaling e fault-tolerance diventavano decisioni di infrastruttura, non decisioni di codice.

**Dedicated Host: L'Opzione di Conformità**

Alcune licenze software (Oracle, Windows Server in alcune configurazioni) sono prezzate per socket fisico o core. Quando esegui questo software su un host condiviso (il default per EC2), potresti stare pagando per capacità che non stai usando.

I **Dedicated Host** ti danno accesso a un server fisico interamente per il tuo utilizzo. Puoi portare le tue licenze esistenti per socket. Nessuna istanza di altri clienti AWS gira sullo stesso hardware.

I Dedicated Host sono significativamente più costosi delle istanze EC2 standard. Sono uno strumento di conformità e licensing, non uno strumento di ottimizzazione dei costi.

Nimbus non aveva requisiti di licensing che necessitassero dei Dedicated Host. La maggior parte delle applicazioni cloud-native non ne ha.

**Variazione: Quando l'Impegno si Ritorce Contro**

Se il tuo carico di lavoro è prevedibile e stabile per 12 mesi, le Reserved Instance offrono lo sconto massimo — ma se le tue esigenze di tipo di istanza potrebbero cambiare significativamente durante quel periodo, quel lock-in ti costerà una flessibilità che vale più della differenza di prezzo. Le Convertible RI risolvono parte di questo, ma a sconto ridotto. I Compute Savings Plan risolvono la maggior parte, a uno sconto massimo leggermente inferiore rispetto alle Standard RI.

Se usi le Spot Instance per job batch fault-tolerant, puoi ottenere risparmi dal 60 al 90% — ma se le stesse istanze servono richieste live degli utenti, un'interruzione a metà richiesta significa transazioni fallite e clienti insoddisfatti. La tolleranza del carico di lavoro all'interruzione è la variabile decisiva.

Esiste un caso di scelta sbagliata più sottile: l'over-commit di un Savings Plan. Se acquisti un Compute Savings Plan da $3.00/ora perché il tuo utilizzo compute ha fatto una media di $3.00/ora il trimestre scorso, poi ottimizzi i tuoi servizi questo trimestre (portando l'utilizzo totale a $1.80/ora), paghi comunque i $3.00/ora impegnati. Il gap da $1.20/ora è spreco. (Nota che spostare carichi di lavoro EC2 su Fargate o Lambda *non* affosserebbe un Compute Savings Plan — copre tutti e tre. I rischi di perdita dell'impegno sono la riduzione reale dell'utilizzo, o il lock-in alla famiglia con EC2 Instance Savings Plan e RI.) Per questo la strategia del pavimento è importante: impegnati al tuo minimo, non alla tua media. E rivedi ogni trimestre.

La regola: impegnati su ciò di cui sei certo. Usa On-Demand per quello di cui non sei sicuro. Usa Spot solo per quello che può sopravvivere a uno stop improvviso.

**Costruire una Flotta Mista**

L'approccio maturo: usare più modelli di pricing insieme.

Per la flotta API di Nimbus:

- **Carico di base (4 istanze, sempre in esecuzione)**: Coperto dall'impegno del Savings Plan
- **Picco prevedibile (2 istanze aggiuntive durante l'orario lavorativo)**: Coperto dal Savings Plan se l'impegno le copre, altrimenti On-Demand
- **Overflow del traffico spike**: Spot Instance (accettabile perché i server API sono stateless — le richieste si redistribuiscono se un'istanza viene terminata)

Il risultato: una flotta che ottimizza il costo a ogni livello — pricing impegnato per la parte prevedibile, On-Demand per la crescita imprevedibile, Spot per la capacità burst.

**Monitorare l'Utilizzo del Savings Plan**

Acquistare un Savings Plan non è la fine del lavoro. È l'inizio di un obbligo ricorrente: sapere se l'impegno viene guadagnato.

Tom impostò un promemoria in calendario per il primo lunedì di ogni trimestre: revisione dell'utilizzo del Savings Plan. Lo strumento era AWS Cost Explorer — specificamente la sua vista Savings Plans, che mostrava tre numeri a cui teneva:

- **Utilization rate**: Quale percentuale della spesa impegnata era effettivamente abbinata all'utilizzo idoneo? Un numero sotto il 100% significava che stava pagando per un impegno che non veniva usato.
- **Coverage rate**: Quale percentuale dell'utilizzo EC2 idoneo era coperta dal Savings Plan, rispetto a girare ai prezzi On-Demand? Un numero sotto l'80% significava che c'era utilizzo non coperto che un impegno maggiore avrebbe catturato.
- **On-Demand spend**: La porzione della spesa EC2 non coperta da alcun Savings Plan. Se questa stava crescendo, o il Savings Plan era sottodimensionato o erano stati aggiunti nuovi carichi di lavoro al di fuori del perimetro dell'impegno.

Alla prima revisione trimestrale, i numeri erano i seguenti:

- Utilization: 97%. Il tre percento della spesa impegnata stava andando non abbinata — $9.90 al mese su un impegno da $330/mese. Era accettabile; significava che l'impegno era impostato leggermente sopra l'utilizzo effettivo del pavimento, il che era intenzionale.
- Coverage: 84%. Il sedici percento dell'utilizzo EC2 idoneo stava girando On-Demand. Era la capacità burst — le istanze di overflow che si avviavano durante i picchi di traffico e non erano coperte dall'impegno.
- On-Demand EC2 spend: $147/mese. Le Spot Instance (non coperte dai Savings Plan, prezzate separatamente) rappresentavano la maggior parte del resto.

"Il 97% di utilizzo è sano," disse Tom. "Significa che non siamo over-committed. Se fosse l'80%, saprei che abbiamo acquistato troppo."

"E l'84% di coverage?" chiese Maya.

"Va bene anche quello. Il 16% che è On-Demand è la capacità burst — istanze che girano per ore durante i picchi, non tutto il giorno. Dovremmo acquistare significativamente più impegno di Savings Plan per coprirle, e potrebbe non giustificarlo." Fece il conto: le istanze On-Demand non coperte giravano forse 40 ore al mese a $0.101/ora per istanza. Coprirle con un Savings Plan richiederebbe un impegno che saremmo sotto-utilizza il 90% del tempo. Meglio lasciarle On-Demand.

Alla seconda revisione trimestrale, sei mesi dopo, una metrica era cambiata: la spesa On-Demand EC2 era cresciuta a $290/mese. Diversi nuovi servizi in background erano andati live, e le loro istanze erano state aggiunte senza che Tom se ne accorgesse.

"Queste tre istanze," disse Tom, indicando la suddivisione di Cost Explorer. "Hanno girato On-Demand per tre mesi. Se continueranno a girare, dovremmo aggiungerle all'impegno del Savings Plan."

La revisione trimestrale l'aveva catturato. Senza la revisione, quelle tre istanze avrebbero continuato ai prezzi da walk-in a tempo indeterminato.

"Come si aggiusta l'impegno?" chiese Priya.

"Acquisti un nuovo Savings Plan aggiuntivo sopra quello esistente," disse Tom. "I Savings Plan si sommano. Aggiungerei un Compute Savings Plan da $0.10/ora per la nuova baseline. Il piano esistente da $0.45/ora continua fino alla fine del suo termine triennale. Il nuovo piano inizia il proprio termine triennale."

"Quindi avremmo due Savings Plan sovrapposti."

"Sì. Si applicano in modo indipendente a qualsiasi utilizzo idoneo esista. AWS li abbina in ordine da più vantaggioso a meno vantaggioso."

"Hai pensato a cosa succede se vendiamo uno di quei servizi in background il prossimo anno?" chiese Priya. "Ci siamo impegnati a $0.55/ora per tre anni."

"Questo è il rischio del termine triennale," disse Tom. "Per cui il nuovo impegno è più piccolo — mi impegno sul pavimento dei nuovi carichi di lavoro, non sulla media. Se dismettessimo un servizio e l'utilizzo scendesse, i servizi rimanenti dovrebbero comunque consumare l'importo impegnato completo."

La disciplina della revisione trimestrale non era glamour. Era quindici minuti in Cost Explorer, tre numeri controllati, una decisione presa o rinviata. Ma nel corso di tre anni, quella disciplina era la differenza tra un Savings Plan che forniva un utilizzo superiore al 90% — risparmio genuino — e uno che scivolava in uno spreco parziale man mano che l'infrastruttura evolveva intorno a esso.

## Punti di Forza e Limitazioni

**On-Demand**: Nessun impegno. Prezzo pieno. Usa per carichi di lavoro imprevedibili o a breve termine.

**Reserved Instance**: Fino al 72% di sconto. Vincolata a tipo di istanza/regione/OS specifico. Vendi la capacità inutilizzata sul RI Marketplace.

**Savings Plan**: Fino al 66-72% di sconto. Più flessibile delle RI (i Compute Savings Plan si applicano a qualsiasi tipo di istanza). Applicazione automatica all'utilizzo corrispondente.

**Spot Instance**: Fino al 90% di sconto. Rischio di interruzione di 2 minuti. Solo per carichi di lavoro fault-tolerant, stateless e interrompibili.

**Dedicated Host**: Server fisico completo. Il più costoso. Richiesto per certi scenari di licensing o conformità.

## Riepilogo

Tom trascorse il resto del sabato mappando ogni carico di lavoro di Nimbus al proprio modello di pricing ideale — la baseline ai Savings Plan, i job batch notturni a Spot, l'overflow imprevedibile a On-Demand. L'esercizio trasformò tre mesi di pagamento del prezzo da walk-in in una strategia deliberata. I numeri, una volta calcolati, erano difficili da ignorare.

- Il pricing EC2 ha quattro modelli: **On-Demand** (prezzo pieno, nessun impegno), **Reserved Instance/Savings Plan** (spesa impegnata per uno sconto significativo), **Spot** (capacità inutilizzata al 60-90% di sconto, interrompibile), **Dedicated Host** (esclusività del server fisico).
- I **Savings Plan** sono generalmente preferiti alle Reserved Instance per la flessibilità.
- Le **Spot Instance** richiedono carichi di lavoro fault-tolerant e stateless — solo per job batch, training ML ed elaborazione interrompibile.
- Il **checkpointing su storage durevole** (S3) è obbligatorio per i job batch basati su Spot — i job interrotti devono riprendere dall'ultimo checkpoint, non ripartire da zero.
- La **diversificazione dello Spot Fleet** su più tipi di istanza e AZ riduce il rischio di interruzione e spesso porta a un pricing migliore.
- La strategia ottimale è una **flotta mista**: Savings Plan per la baseline, On-Demand per la crescita imprevedibile, Spot per il lavoro batch interrompibile.
- Rivedi i modelli di pricing quando i carichi di lavoro girano in modo stabile per 3+ mesi — è da quel momento che On-Demand inizia a essere uno spreco.
- **Rivedi gli impegni dei Savings Plan ogni trimestre** — impegnati sul tuo pavimento, non sulla tua media, e adatta man mano che i pattern di utilizzo cambiano.

## Suggerimenti per l'Esame

*Dominio SAA-C03: Design Cost-Optimized Architectures (Domain 4, Task 4.2)*

- **Savings Plan vs Reserved Instance**: I Savings Plan sono più flessibili (si applicano a qualsiasi istanza EC2 per i Compute Savings Plan). Le Reserved Instance si vincolano a un tipo di istanza specifico. Scenari d'esame: "necessità di massima flessibilità ottenendo comunque sconti" → Savings Plan. "Conosco il tipo di istanza esatto per 3 anni" → Standard RI per il massimo sconto.
- **Segnali Spot**: "sensibile ai costi," "fault-tolerant," "batch processing," "può gestire le interruzioni," "carichi di lavoro stateless," "training ML" → Spot.
- **Gestione delle interruzioni Spot**: Le istanze Spot ricevono un preavviso di 2 minuti prima della terminazione. La tua applicazione deve gestirlo in modo elegante (salvare lo stato, drenare le connessioni, uscire in modo pulito).
- **On-Demand vs Spot per server web**: I server web che servono traffico live degli utenti NON devono usare Spot (l'interruzione causa richieste fallite). Usa On-Demand o Savings Plan per il web tier.
- **EC2 Savings Plan vs Compute Savings Plan**: Gli EC2 Savings Plan si applicano a una famiglia di istanze e regione specifiche (sconto più alto). I Compute Savings Plan si applicano a qualsiasi istanza EC2, Lambda e Fargate (sconto massimo inferiore, più flessibili).
- **RI Marketplace**: Le Standard Reserved Instance inutilizzate possono essere vendute ad altri clienti AWS. Le Convertible RI non possono essere vendute.
- **Hibernation:** Salva il contenuto della RAM nel volume EBS root allo spegnimento; lo ripristina all'avvio. L'istanza riprende più velocemente di un cold start con tutti i processi e lo stato intatti. Usala quando lo stato dell'istanza deve essere preservato tra le sessioni. Requisiti: abilitata al lancio (non può essere aggiunta a un'istanza esistente), RAM ≤ 150 GB, volume EBS root crittografato, non disponibile per le istanze bare-metal; massimo 60 giorni ibernata. Segnale dell'esame: "riprendere l'istanza rapidamente con lo stato in-memory preservato" o "l'istanza di sviluppo impiega troppo tempo ad inizializzarsi" → Hibernation.

## Esercizi

**Esercizio 1 — Ricordo**

Spiega quando le Spot Instance sono appropriate e quando non lo sono. Quale caratteristica rende un carico di lavoro adatto per Spot?

*(Suggerimento: Ricorda l'albergo — Spot è la camera invenduta a uno sconto netto standby, ma l'albergo può chiederti di andartene con due minuti di preavviso; quali ospiti riescono a fare le valigie così in fretta?)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: Un'azienda di media gestisce un pipeline di transcodifica video che converte i video caricati in più formati. I job di transcodifica girano in modo continuativo ogni volta che vengono caricati video (operazione 24/7, volume variabile). Ogni job richiede da 5 a 30 minuti. Se un job di transcodifica viene interrotto, può essere riavviato dall'inizio senza perdita di dati. L'azienda vuole minimizzare i costi.

Quale modello di pricing EC2 soddisfa MEGLIO questi requisiti?

A) Istanze On-Demand in un Auto Scaling Group
B) Reserved Instance (1 anno, All Upfront)
C) Spot Instance con Spot Fleet per la diversificazione automatica delle istanze
D) Dedicated Host con le licenze software esistenti dell'azienda

**Suggerimento 1**: "Può essere riavviato dall'inizio senza perdita di dati" — questa è la frase chiave che abilita un modello di pricing specifico.

**Suggerimento 2**: "Minimizzare i costi" con un carico di lavoro interrompibile punta all'opzione con lo sconto massimo.

**Suggerimento 3**: Le richieste Spot Fleet richiedono istanze da più tipi di istanza e AZ, riducendo la probabilità di interruzione di massa.

**Risposta**: C

**Spiegazione**: I job di transcodifica sono fault-tolerant — possono essere riavviati se interrotti. Questo li rende ideali per le Spot Instance, che offrono uno sconto del 60-90% rispetto a On-Demand. Spot Fleet diversifica su tipi di istanza e Availability Zone, riducendo la probabilità di interruzione di massa.

**Perché non A?** On-Demand è l'opzione più costosa. Per un carico di lavoro continuativo e fault-tolerant, questo è uno spreco.

**Perché non B?** Le Reserved Instance forniscono uno sconto del 50-72% ma non offrono il potenziale sconto del 90% delle Spot per carichi di lavoro fault-tolerant. Inoltre, le RI sono per carichi di lavoro prevedibili e in stato stabile — Spot è specificamente per l'elaborazione batch interrompibile.

**Perché non D?** I Dedicated Host sono per la conformità al licensing, non per l'ottimizzazione dei costi. Sono l'opzione più costosa.

*Dominio SAA-C03: Design Cost-Optimized Architectures — Task 4.2*

**Esercizio 3 — Sfida di Architettura** *(Opzionale)*

L'infrastruttura di Nimbus ha questi carichi di lavoro:

1. Server API: 6 istanze, in esecuzione 24/7, stabili da 2 anni, usano r6g.large
2. Job batch di analisi notturni: 4 istanze, girano dalle 3:00 alle 6:00 ogni notte, sempre lo stesso tipo di istanza
3. Ambiente di test: 2 istanze, usate dagli ingegneri dalle 9:00 alle 18:00 nei giorni feriali
4. Overflow dei picchi di traffico: 0-8 istanze, si avviano durante le ore di punta, completamente imprevedibili

Progetta la strategia di pricing ottimale per ogni tipo di carico di lavoro. Quale importo di impegno per Savings Plan coprirebbe i carichi di lavoro 1 e 2? Per il carico di lavoro 3, esiste una strategia più intelligente rispetto a On-Demand?

*(Non esiste una risposta corretta unica. L'obiettivo è praticare la strategia di pricing EC2.)*

## Scena Post-Crediti

Tom confermò l'acquisto del Savings Plan.

Impegno da $0.45/ora. Termine triennale. Compute Savings Plan per la flessibilità.

Combinato con lo Spot fleet per il batch notturno, il risparmio stimato: $42.500 in tre anni — poco più di $14.000 all'anno.

Maya lesse il numero. "Quarantaduemila dollari."

"Rispetto a far girare tutto On-Demand, in tre anni."

"Quanto è costato fare questo?"

"Un pomeriggio di analisi," disse Tom. "E la decisione di impegnarsi."

"Tre anni è un lungo periodo," disse Leo. "E se cambiamo tipi di istanza?"

"I Compute Savings Plan si applicano a qualsiasi tipo di istanza EC2. E in tre anni, saremo abbastanza grandi che questa conversazione avrà un aspetto diverso comunque."

Leo ci rifletté.

"Da quanto tempo conosci i Savings Plan?" chiese.

"Da quando abbiamo iniziato," disse Tom. "Stavo aspettando che il carico di lavoro fosse abbastanza stabile da potersi impegnare."

"Diciotto mesi a pagare On-Demand mentre aspettavamo."

"Sì." Tom chiuse la console. "A volte la cosa più costosa che fai è aspettare di risparmiare denaro."

Leo rimase in silenzio per un momento. "Quindi su cos'altro stiamo ancora aspettando?" Nessuno aveva ancora una risposta.

Nel prossimo capitolo: la stessa disciplina applicata ai costi di storage, con qualche sorpresa su cosa sta guidando la bolletta.
