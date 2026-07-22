# Capitolo 28: La Sorpresa della Bolletta di Archiviazione

Il foglio di calcolo aveva ormai sedici schede. Tom lo teneva aperto in una seconda finestra, come chi tiene una lista della spesa sempre visibile, sempre in crescita. Aggiunse una nuova riga per il compute (fatto, confermato) e spostò il cursore sulla riga successiva.

Archiviazione.

Il lavoro sul prezzo del compute nel Capitolo 27 aveva definito la strategia EC2: un Compute Savings Plan da $0,45/ora su un triennio, più Spot per il batch notturno — un risparmio stimato di $42.500 nel periodo. Quel lavoro era fatto, e fatto bene. Ma era una sola riga della bolletta. Tom aveva imparato, da sei mesi di analisi dei costi con Athena, che la bolletta aveva molte righe — e che ciascuna meritava la stessa attenzione. S3 era la prossima: $198/mese, già migliorata da $847 dopo le modifiche alle policy di lifecycle del Capitolo 23. Il numero che gli aveva attirato l'occhio, però, era più in basso nella pagina. EBS: $440/mese.

"Sembra alto," disse.

Leo aprì l'elenco dei volumi EBS. C'erano 47 volumi EBS collegati alle istanze. E poi c'erano altri 23 volumi non collegati ad alcuna istanza.

"Questi 23 volumi," disse Tom. "Di cosa si tratta?"

**L'Audit dei Volumi Orfani**

Leo cominciò a esaminarli uno per uno. Non fu un processo rapido — i volumi non avevano etichette uniformi, i tag erano inconsistenti, e alcuni erano stati creati così tanto tempo prima che nessuno ricordava più il contesto. Tom avvicinò una sedia e osservò.

Volume ebs-021a4c. Creato 16 mesi fa. Tag: "debug-prod-db-snapshot-restore." Dimensione: 200GB. Ultima connessione: mai, o la cronologia degli allegati era stata eliminata.

"Quello me lo ricordo," disse Leo. "Avevamo un problema con una query del database e avevo ripristinato uno snapshot per controllare i dati. Li controllai, non trovai il problema lì, e mi dimenticai di eliminare il volume."

Volume ebs-07f38b. Creato 11 mesi fa. Tag: "load-test-temp." Dimensione: 400GB.

Leo rimase in silenzio per un momento. "Penso che fosse il load test che facemmo prima del pitch per il Series Seed. Avevamo provisioned delle istanze extra con storage extra per simulare il picco di carico e poi... credo di non aver eliminato niente di quello che era rimasto."

"L'avevo già deployed — oh," disse. "Il load test era temporaneo. I volumi non lo erano."

Volume ebs-0ab12c fino a ebs-0ab134. Otto volumi consecutivi, creati 9 mesi fa. Tag: "k8s-experiment." Dimensione: 100GB ciascuno, 800GB in totale.

"Era la valutazione di Kubernetes," disse Priya, guardando oltre la spalla di Leo. "Passammo tre settimane a valutare se migrare a ECS o EKS. EKS era arrivato secondo. Abbiamo smontato il cluster sperimentale ma apparentemente abbiamo lasciato i persistent volume."

Tom stava sommando su una scheda separata. Volume per volume, i numeri si accumulavano:

- Volumi di debug restore: 4 volumi × 200GB = 800GB
- Volumi di load test: sei volumi tra 200 e 400GB — circa 1.200GB in totale
- Volumi dell'esperimento Kubernetes: 8 volumi × 100GB = 800GB
- Varie senza tag: 5 volumi × varie dimensioni = ~700GB

Totale: circa 3.500GB distribuiti su 23 volumi non collegati.

"Quanto ci costa al mese?" chiese Tom. La risposta: gp3 a $0,08/GB/mese. 3.500GB × $0,08 = $280/mese.

Controllò la data di creazione più vecchia. Sedici mesi. Tirò fuori la calcolatrice.

"Stiamo pagando per alcuni di questi da sedici mesi," disse. "Alcuni da nove. La media è probabilmente dieci mesi su tutti." 23 volumi, media $12/mese ciascuno, media 10 mesi. Erano circa $2.760. Aggiungendo i volumi più grandi, il conto arrivava a circa $3.200 in sprechi totali.

"Tremila duecento dollari," disse Tom. "Da volumi che nessuno stava usando."

"E nessuno se ne è accorto perché la spesa è distribuita su decine di voci," disse Leo. "Non è un unico addebito da $3.200. Sono 23 addebiti da $12 o $50 o $80 al mese, ognuno individualmente troppo piccolo per far scattare un allarme."

Tom eliminò tutti i 23 volumi non collegati. Confermò con Leo e Priya che nessuno di essi conteneva dati necessari — il volume di debug conteneva dati obsoleti da un database nel frattempo migrato, i dati del load test erano irrilevanti, i volumi dell'esperimento Kubernetes erano vuoti. L'eliminazione impiegò quindici minuti. Il mese successivo, la bolletta EBS scese da $440 a $160.

"Aspetta — ma *perché* funziona così?" chiese Maya, quando Tom le illustrò la scoperta. "Perché eliminare il volume non è il comportamento predefinito quando termini un'istanza?"

"Dipende dal volume," disse Tom. "Il volume **root** viene eliminato per default — `DeleteOnTermination` è impostato a true per lui. Ma qualsiasi **volume dati aggiuntivo** che colleghi ha come predefinito il mantenimento. Il presupposto è che potresti aver bisogno dei dati che vi erano sopra. Questi 23 orfani erano tutti volumi dati — collegati per una sessione di debug o un load test, poi abbandonati quando l'istanza è stata terminata."

"Quindi il comportamento predefinito ti protegge dalla perdita accidentale di dati sui volumi dati."

"E ti costa denaro se non ci stai attento. D'ora in poi: qualsiasi volume dati aggiuntivo viene eliminato esplicitamente quando l'istanza termina — o `DeleteOnTermination` viene impostato al momento del collegamento — a meno che qualcuno non documenti esplicitamente perché ha bisogno di conservarlo."

"Abbiamo considerato cosa succede se qualcuno dimentica di documentare quel caso?" chiese Priya. "Potremmo eliminare qualcosa di importante."

"È il compromesso," disse Tom. "In questo momento il compromesso è nell'altra direzione — partiamo dal presupposto che tutto debba essere conservato e lo paghiamo quando non è così. La disciplina di documentare 'mantieni questo volume' è meno rischiosa del default attuale di 'mantieni tutto in silenzio.'"

**L'Audit dei Costi di Archiviazione**

La scoperta EBS di Tom era il sintomo di un pattern più ampio: i costi di archiviazione si accumulano in modo invisibile. A differenza del compute (ti accorgi quando girano 47 server), lo storage si somma in silenzio.

Pensaci come all'affitto di un deposito. Affittare una singola unità è ovvio sull'estratto conto. Ma se affitti una seconda unità per un progetto, poi una terza per dei vecchi mobili, e non torni mai a controllare cosa c'è dentro — le spese continuano ad apparire ogni mese, silenziosamente, molto dopo che ti sei dimenticato di cosa stai conservando. Lo storage cloud funziona allo stesso modo: i byte rimangono lì, la fattura arriva, e nessuno la mette in discussione finché qualcuno non apre finalmente la porta e la trova piena di cose di cui nessuno ha più bisogno.

Un audit completo dei costi di archiviazione considera:

**S3**:

- Sono in vigore policy di lifecycle per tutti i bucket?
- Ci sono snapshot vecchi (RDS, EBS) che giacciono in S3?
- L'Intelligent-Tiering è appropriato per qualche bucket con pattern di accesso incerti?
- Ci sono oggetti versionati che creano copie multiple mai accedute?
- Ci sono upload multipart incompleti che si accumulano silenziosamente?

**EBS**:

- Ci sono volumi non collegati (nessuna istanza in esecuzione li sta usando)?
- I volumi gp3 sono configurati correttamente? (I volumi gp3 di default possono avere throughput/IOPS provisioned in eccesso non necessari)
- Si conservano snapshot più vecchi del necessario?

**RDS**:

- I periodi di conservazione dei backup automatici sono impostati in modo appropriato? (Più lungo = maggiori costi di storage)
- Ci sono ancora snapshot manuali di vecchie istanze in giro?
- Ci sono ancora read replica da migrazioni di database in esecuzione?

**EFS**:

- Il volume EFS è nella classe di storage giusta? (Standard vs Infrequent Access)

**S3 Versioning: Il Costo Nascosto**

Nel Capitolo 5, abbiamo menzionato che il versioning di S3 conserva ogni versione precedente di un oggetto. Questo è eccellente per la sicurezza. È pessimo per i costi se non si hanno anche regole di lifecycle per le versioni.

Quando il versioning è abilitato su un bucket, ogni volta che sovrascrivi un oggetto, la vecchia versione viene conservata. Nel tempo:

- Giorno 1: Immagine caricata (v1)
- Giorno 30: Immagine aggiornata (v1 è ora una versione "non corrente", v2 è corrente)
- Giorno 60: Immagine aggiornata di nuovo (v1 e v2 sono non correnti, v3 è corrente)
- Giorno 365: v1, v2... v12 sono tutti conservati. Stai pagando per 12 copie di un'immagine.

Potresti chiederti perché il versioning non pulisce automaticamente le versioni vecchie. La risposta è intenzionale — AWS non vuole eliminare automaticamente i tuoi dati. Ma la conseguenza è che ogni versione si accumula finché non dici esplicitamente a S3 per quanto tempo conservarle. La soluzione: regole di lifecycle per le versioni non correnti.

```
Expire noncurrent versions after 30 days
Delete failed multipart uploads after 7 days
```

Tom applicò queste regole a tutti i bucket versionati. Il mese successivo, lo storage S3 diminuì del 18%.

**Upload Multipart Incompleti: L'Accumulo Invisibile**

C'è un costo S3 più sottile che la maggior parte degli ingegneri si perde completamente: gli upload multipart incompleti.

Quando S3 carica un file di grandi dimensioni, lo suddivide in parti e le carica separatamente. Questo è il meccanismo di upload multipart — più affidabile di un singolo grande PUT per file superiori a qualche centinaio di megabyte. Ma se un upload inizia e poi fallisce a metà — un'interruzione di rete, un crash del client, un bug dell'applicazione — le parti già caricate rimangono in S3. Non sono visibili come oggetti nel bucket. Non compaiono in alcun elenco. Ma sono conservate, e vengono addebitate alle tariffe S3 standard.

Tom lo scoprì attivando S3 Storage Lens e ordinando per "upload multipart incompleti." Nimbus aveva 340GB di dati di upload multipart incompleti che giacevano silenziosamente in bucket distribuiti su quattro account AWS, alcuni da oltre un anno.

"Quanto ci costa al mese?" chiese Tom. $0,023/GB/mese × 340GB = $7,82/mese. Poco individualmente. Ma si stava accumulando da un anno senza che nessuno se ne accorgesse.

La soluzione: aggiungere una regola di lifecycle a ogni bucket.

```
AbortIncompleteMultipartUpload:
  DaysAfterInitiation: 7
```

Dopo sette giorni, qualsiasi upload multipart incompleto viene eliminato automaticamente. Funziona indefinitamente senza alcuna attenzione continuativa.

"Se tutto questo fosse rimasto lì per un anno intero — diciamo $94 spesi in upload falliti," disse Leo.

"In upload falliti," confermò Tom. "Nemmeno per storage riuscito. Questa è la definizione di spreco infrastrutturale."

**EBS: Right-Sizing e la Migrazione a gp3**

Il prezzo dei volumi EBS ha due componenti:

1. Storage (per GB al mese)
2. IOPS e throughput provisioned (se sei su io1/io2 o stai pagando per performance extra di gp3)

**L'opportunità gp3**: Nel Capitolo 6, abbiamo notato che gp3 è il default attuale ed è più economico di gp2. Se Nimbus aveva volumi creati prima che gp3 fosse disponibile (fu lanciato nel dicembre 2020), potrebbero essere ancora gp2.

La migrazione è semplice: modifica il tipo di volume da gp2 a gp3 nella console AWS o tramite CLI. Non è richiesto alcun downtime. Il volume rimane disponibile durante la conversione. Le caratteristiche di performance sono uguali o superiori — gp3 fornisce 3.000 IOPS e 125 MB/s di throughput baseline, rispetto al modello burstable di gp2 che poteva essere inconsistente per i volumi più piccoli.

"Aspetta — ma se gp3 è più economico e almeno altrettanto buono di gp2," chiese Maya, "*perché* AWS non ha migrato tutti automaticamente?"

"Perché AWS non apporta modifiche unilaterali all'infrastruttura dei clienti," disse Tom. "Nemmeno quelle vantaggiose. La modifica potrebbe teoricamente avere effetti collaterali per qualche workload. È il cliente che deve avviarla. Ecco perché migliaia di team stanno ancora pagando prezzi gp2 anni dopo il lancio di gp3, semplicemente perché nessuno è andato a controllare."

Tom decise di fare la migrazione a gp3 un sabato mattina — la stessa disciplina del sabato mattina applicata all'analisi del prezzo EC2. Tempo tranquillo. Niente standup. Solo la console AWS e un piano.

Aveva identificato 8 volumi nell'ambiente di produzione che erano ancora gp2: i quattro volumi root dei server API, due volumi collegati ai processori in background, e due volumi dati legacy creati prima che la migrazione a gp3 fosse diventata pratica standard per i nuovi deployment. In totale ammontavano a 960 GB.

La migrazione stessa era una singola chiamata API modify-volume per volume, richiedendo gp3 ai suoi default baseline: 3.000 IOPS e 125 MB/s di throughput. Tom aveva prima controllato le metriche di CloudWatch: gli IOPS medi effettivi su ogni volume erano tra 200 e 800. Nessuno di essi necessitava di più dei 3.000 IOPS baseline che gp3 fornisce gratuitamente. Il throughput era ugualmente confortante — ben all'interno dei 125 MB/s di default.

"Cosa succede se un volume ha bisogno di più IOPS dopo il passaggio?" chiese Maya, quando Tom le spiegò il piano di migrazione.

"Possiamo aumentare gli IOPS provisioned su un volume gp3 in qualsiasi momento," disse Tom. "La migrazione non blocca nulla. Se passiamo a gp3 a 3.000 IOPS e scopriamo che non è sufficiente, modifichiamo di nuovo il volume per aggiungerne altri. La modifica è live — nessun downtime, nessun smontaggio."

"E gp2 non può essere modificato in place?"

"gp2 può essere modificato in gp3 in place. Puoi anche tornare a gp2, sebbene non ci sia motivo — gp3 è più economico a qualsiasi dimensione."

La migrazione effettiva impiegò 73 minuti dal primo comando al completamento su tutti gli 8 volumi. AWS modificò ogni volume mentre era montato e in uso. I server API continuarono a ricevere traffico per tutto il tempo. CloudWatch non mostrò picchi di latenza I/O durante la conversione — la transizione fu completamente trasparente per l'applicazione in esecuzione.

"Ecco cosa significa davvero 'nessun downtime richiesto'," disse Leo, guardando le metriche prima e dopo che Tom aveva catturato. "Pensavo che 'nessun downtime' significasse 'breve riavvio.' Significa letteralmente che nulla cambia dalla prospettiva dell'applicazione."

Il risparmio: gp2 era $0,10/GB/mese; gp3 era $0,08/GB/mese. Su 960 GB: $96/mese vs $76,80/mese. Risparmio mensile: $19,20. Non trasformativo di per sé, ma lo era la disciplina che rappresentava. Qualsiasi nuovo volume creato da quel momento in poi usava gp3 di default. La regola organizzativa che Tom scrisse quella mattina: nessun volume gp2. Qualsiasi ingegnere che crei un volume EBS deve usare gp3 a meno che non ci sia una ragione specifica e documentata per fare diversamente.

**IOPS e throughput**: i volumi gp3 vengono forniti con 3.000 IOPS e 125 MB/s di throughput di default, senza costi aggiuntivi. Puoi provisioning di più se il tuo workload lo richiede. Verifica se le performance provisioned vengono effettivamente utilizzate.

Nello stesso audit, Tom trovò due volumi con 10.000 IOPS provisioned — un'impostazione legacy da prima che si unisse al team, dimensionata per un database che nel frattempo era migrato ad Aurora. Controllò le metriche di CloudWatch: gli IOPS medi effettivi erano 1.200. Ridusse gli IOPS provisioned a 4.000 (un margine di sicurezza sopra il picco effettivo).

Risparmio mensile: $68 in costi di IOPS provisioned che stavano pagando per headroom di performance che nessuno stava usando.

**Snapshot lifecycle**: le snapshot EBS sono incrementali (ogni snapshot memorizza solo le modifiche rispetto alla precedente), ma si accumulano. Snapshot vecchie dei primi giorni di Nimbus esistevano ancora. Tom conservò 30 giorni di snapshot giornaliere ed eliminò le restanti.

**EFS: Storage Class e la Decisione sull'Intelligent-Tiering**

Amazon EFS ha le proprie storage class:

- **EFS Standard**: Per file acceduti frequentemente. Costo più elevato.
- **EFS Infrequent Access (IA)**: Per file non acceduti da 30 giorni. Il 92% più economico di Standard.
- **EFS Archive**: Per file non acceduti da 90 giorni. Ancora più economico di IA.

**EFS Intelligent-Tiering**: Sposta automaticamente i file tra storage class in base ai pattern di accesso.

Tom abilitò Intelligent-Tiering sul volume EFS. Sei settimane dopo, il 68% dei file si era spostato in Infrequent Access. Il costo mensile di EFS scese da $89 a $31.

Ma la scelta tra Intelligent-Tiering e una regola di lifecycle manuale non era banale. Tom l'aveva valutata.

"Aspetta — ma *perché* dovremmo fare Intelligent-Tiering invece di impostare semplicemente una regola di lifecycle manuale?" chiese Maya. "Se sappiamo che i file più vecchi di 30 giorni non vengono acceduti, perché non impostare la regola e chiuderla lì?"

"Intelligent-Tiering gestisce i file che tornano ad essere acceduti," disse Tom. "Se imposto una regola di lifecycle per spostare i file in IA dopo 30 giorni, e poi qualcuno accede a un file che è stato in IA per sei mesi, rimane in IA. Con Intelligent-Tiering, se l'accesso riprende, il file torna automaticamente a Standard. È bidirezionale."

"Quando preferiresti allora la regola di lifecycle?"

"Quando sei certo che il pattern di accesso è unidirezionale. I log di archivio — vengono scritti, invecchiano, vengono acceduti una volta per un audit di conformità e poi mai più. Per quel pattern, una regola di lifecycle che sposta in Archive dopo 90 giorni è più economica di Intelligent-Tiering perché non stai pagando il costo di monitoraggio."

"C'è un costo di monitoraggio?"

"Per S3 Intelligent-Tiering, sì, ed è per questo che abbiamo trattato l'economia degli oggetti piccoli nel capitolo sul lifecycle di S3. Per EFS, la decisione riguarda principalmente il pattern di accesso: se i file potrebbero tornare a essere hot, Intelligent-Tiering è più sicuro. Se invecchiano solo in una direzione, una regola di lifecycle verso Archive è più economica e semplice."

**Tag di Allocazione dei Costi S3: Trovare Chi Spende Cosa**

Con la crescita di Nimbus, più team conservavano dati in S3. Il team di analytics aveva i propri bucket. Il team di engineering aveva i propri bucket. Il team dei dati ristoranti aveva i propri bucket.

La bolletta mostrava solo "S3: $198." Non c'era alcuna ripartizione per team.

I **tag di allocazione dei costi** ti permettono di taggare le risorse AWS con metadati aziendali (team, progetto, ambiente) e poi vedere i costi suddivisi per quei tag in AWS Cost Explorer.

Tom aggiunse tag a tutti i bucket S3:
```
Team: analytics
Environment: production
Project: nimbus-core
```

Dopo un ciclo di fatturazione con il tagging, riusciva a vedere: "Il data lake del team di analytics costa $74/mese. I backup di engineering costano $43/mese. I dati dei ristoranti costano $81/mese."

Ora poteva avere conversazioni sul budget con ciascun team invece di guardare semplicemente un numero aggregato.

**AWS Cost Explorer e AWS Budgets**

**AWS Cost Explorer**: Visualizza i costi storici e previsti per servizio, regione, tag e tipo di utilizzo. Essenziale per capire dove vanno i soldi.

**AWS Budgets**: Imposta avvisi quando i costi superano (o si prevede che superino) una soglia. Puoi definire budget per servizio, regione, tag o account.

Tom configurò tre budget:

1. Bolletta mensile totale: Avviso al 90% dell'importo nel budget
2. EC2 On-Demand: Avviso se la spesa On-Demand supera $500/mese (segnala un gap nel Savings Plan)
3. Trasferimento dati in uscita: Avviso a $200/mese (i costi di trasferimento dati possono aumentare inaspettatamente)

I Budget inviavano avvisi a un canale Slack. Il team vedeva quando si stava avvicinando ai limiti, invece di scoprirlo sulla fattura mensile.

**La Ricevuta con Ogni Voce: Cost and Usage Report**

Cost Explorer rispondeva alla maggior parte delle domande di Tom. Poi ne incontrò una a cui non riusciva a rispondere: "esattamente quali bucket S3, ora per ora, hanno generato il picco di martedì scorso — e sotto quali tag?"

Per domande di tipo forense, AWS fornisce il **Cost and Usage Report (CUR)** — ora erogato attraverso **Data Exports** — i dati di fatturazione più dettagliati che AWS produce: ogni voce, **per risorsa, per ora**, con tag, consegnato in un bucket S3 di tua proprietà. Non è una dashboard; è il registro grezzo. Il pattern standard è interrogarlo con Athena (arriva in formato colonnare) o alimentare QuickSight per le dashboard.

La divisione del lavoro all'esame: **Cost Explorer** = visualizzazione interattiva e previsioni nella console. **Budgets** = avvisi sulle soglie. **CUR/Data Exports** = i dati più granulari, consegnati in S3, per la tua analisi personalizzata. Quando una domanda dice "dati di costo a livello di risorsa, orari, per analisi personalizzata" — è il CUR, non Cost Explorer.

"Abbiamo considerato cosa succede se semplicemente non guardiamo mai tutto questo?" chiese Priya. "Abbiamo trovato $6.700 in due giorni. Cosa si nasconde ancora?"

"Audit regolari," continuò. "Revisioni mensili di Cost Explorer. AWS Trusted Advisor segnala automaticamente volumi non collegati e risorse inattive. Automatizza la pulizia dei pattern di spreco noti: elimina snapshot più vecchie di N giorni, avvisa sui volumi EBS non collegati, elimina le vecchie versioni S3."

**S3 Requester-Pays: Spostare il Costo del Trasferimento**

Durante l'audit dello storage, Tom trovò una situazione che non aveva anticipato.

I partner ristoratori di Nimbus avevano bisogno di scaricare le proprie immagini di menu — le immagini elaborate e ridimensionate che la piattaforma di ordinazione serviva ai clienti. Per un ristorante che aggiornava il menu, questo significava scaricare da 50 MB (un piccolo aggiornamento) a 800 MB (un aggiornamento stagionale completo) di file immagine. Attualmente, Nimbus stava pagando il costo di trasferimento dati in uscita per ogni download: $0,09/GB da S3 alla sede del partner.

Con 287 partner ristoratori, con una media di un aggiornamento menu al mese e un download medio di 200 MB, il calcolo era: 287 × 0,2GB × $0,09 = $5,17/mese. Non significativo alla scala attuale.

"Cosa succede a 2.000 ristoranti?" chiese Tom.

"Stessa matematica," disse Maya. "Circa $36/mese."

"E a 10.000 ristoranti, con i partner che scaricano grandi pacchetti di asset stagionali — diciamo, 2 GB per gli aggiornamenti del menu delle festività?"

Fece il calcolo. 10.000 × 2GB × $0,09 = $1.800/mese di trasferimento dati, solo per i partner che scaricano gli asset di cui hanno bisogno.

"È un numero reale," disse Priya.

"Abbiamo considerato cosa succede se quella bolletta arriva nello stesso mese in cui stiamo cercando di chiudere un Series B?" continuò Priya.

"S3 Requester-Pays," disse Tom.

S3 ha una funzionalità chiamata Requester-Pays: quando è abilitata su un bucket, l'entità che effettua la richiesta — non il proprietario del bucket — paga i costi di trasferimento dati e di richiesta. Il proprietario del bucket continua a pagare per lo storage. Ma ogni download dal bucket viene addebitato all'account AWS del richiedente.

Il compromesso è l'accesso. Requester-Pays richiede che i richiedenti siano clienti AWS con un account valido — l'accesso non autenticato o anonimo a un bucket Requester-Pays restituisce un errore. Per i partner ristoratori di Nimbus, che erano aziende con livelli variabili di sofisticazione tecnica, richiedere loro di avere un account AWS per scaricare i propri asset di menu non era un modello praticabile.

"Non possiamo fare Requester-Pays per l'accesso diretto dei partner," disse Maya. "La maggior parte dei nostri partner non si configurerà un account AWS per scaricare le foto."

"Esatto," disse Tom. "Ma possiamo usarlo per le integrazioni B2B — le catene più grandi che hanno team tecnici e account AWS. Non il piccolo ristorante all'angolo, ma la catena di hamburger con 50 sedi che ha un team di engineering e si integra direttamente con la nostra API. Per quel segmento, Requester-Pays ha senso."

"E per gli altri?"

"Gli offriamo un portale di download che utilizza URL S3 pre-firmati. Il trasferimento passa ancora attraverso AWS, il costo è ancora nostro — ma è già incluso nel prezzo del partner. L'opzione Requester-Pays è qualcosa che inseriremmo nelle trattative contrattuali con i partner più grandi, non qualcosa che deploy oggi."

Tom lo aggiunse al foglio di calcolo sotto "ottimizzazioni future": S3 Requester-Pays per i partner enterprise con account AWS. A 2.000 ristoranti con il 20% di clienti enterprise, con 2 GB di download mensili: $72/mese potenzialmente spostati ai partner. Piccolo a quella scala, ma lo stesso pattern diventa significativo con la crescita dei pacchetti di asset. Rivedere quando il numero di partner supera 1.000 o quando i partner enterprise iniziano a scaricare pacchetti stagionali più grandi.

"La lezione è sempre la stessa," disse Tom. "Sapere quale sarà il costo alla scala prima di raggiungere quella scala. Il problema da $5 oggi è il problema da $1.800 tra tre anni. Progettarlo ora non costa nulla."

**Governance: Auto-Eliminazione vs Solo-Avviso**

La domanda sull'automazione fu quella che generò più disaccordo.

"Dovremmo auto-eliminare i volumi EBS non collegati dopo 14 giorni?" chiese Tom. "Le regole di AWS Config possono segnalarli. Lambda può eliminarli automaticamente."

"No," disse Priya immediatamente.

"Perché no?"

"Perché l'auto-eliminazione significa che prima o poi elimineremo qualcosa che era scollegato per una ragione. Magari qualcuno ha scollegato un volume per spostarlo su un'istanza diversa, ed è rimasto lì per 12 giorni mentre una modifica è in revisione. L'auto-eliminazione al giorno 14 distrugge quei dati."

"Quindi solo avviso?" disse Tom. "Riceviamo una notifica ma non eliminiamo automaticamente."

"Prima l'avviso," disse Priya. "Forza un essere umano a prendere la decisione. L'avviso è: 'Questo volume è scollegato da 14 giorni. Taggalo come `keep: true` se ne hai bisogno, altrimenti verrà segnalato per l'eliminazione nella prossima revisione.' La decisione umana è documentata dalla presenza o assenza del tag."

"È più lento," disse Leo.

"È più lento e meno probabile che distrugga dati," disse Priya. "Abbiamo già perso $3.200 per negligenza. Non abbiamo perso dati per l'automazione. So cosa preferisco mantenere."

Tom optò per un approccio ibrido: avviso automatico a 7 giorni, necessità di un tag `keep: true` per sopprimere gli avvisi futuri, e un report settimanale di tutti i volumi non taggati e non collegati per la revisione del team. Nessuna auto-eliminazione.

**Variante: Quando la Pulizia Costa Più di Quanto Risparmia**

Se hai bisogno della sicurezza di snapshot extra, conservale — ma ogni snapshot più vecchia di 90 giorni senza accesso deve guadagnarsi il suo posto. Il compromesso è asimmetrico: eliminare una snapshot di cui avevi bisogno costa un incidente; conservare una snapshot di cui non avevi bisogno costa solo una piccola quota mensile. Per i dati sensibili alla conformità, il costo di conservare snapshot vecchie è reale ma di solito inferiore al costo di non averle quando un revisore le chiede. Per le snapshot di sviluppo da un test eseguito 14 mesi fa, il calcolo va nell'altra direzione.

Se abiliti EFS Intelligent-Tiering per file con pattern di accesso incerti, il tiering automatico fa risparmiare denaro e non richiede interventi continuativi. Se i file invecchiano in modo prevedibile verso l'accesso di archivio, una regola di lifecycle diretta è più semplice. Misura prima di abilitare.

Connessione SAA-C03: l'esame verifica se sai scegliere tra le storage class di S3 (Standard, IA, Glacier) dato uno scenario di frequenza di accesso. La stessa logica si applica qui — la classe giusta dipende dalla frequenza di accesso ai dati.

**Il Costo della Negligenza**

Tom costruì un foglio di calcolo. Calcolò quanto Nimbus aveva speso per:

- Volumi EBS non collegati (16 mesi): $3.200
- Snapshot S3 vecchie (scoperte ed eliminate): $890
- IOPS provisioned non necessari: $816
- Risparmio dalla migrazione da gp2 a gp3 (proiettato, se fatto prima): $346 in 18 mesi
- Versioni S3 non correnti che si accumulano: $1.340
- Upload multipart incompleti: $94

Spreco totale identificato: circa $6.700 in 18 mesi.

"Seimila settecento dollari," disse Maya.

"Di negligenza," disse Tom. "Non da decisioni architetturali sbagliate. Dal non aver pulito."

"Qual è la soluzione sistematica?"

"Automazione," disse Tom. "Regole di lifecycle per la cronologia delle versioni e gli upload multipart incompleti, un job pianificato che segnala volumi non collegati e snapshot oltre il periodo di conservazione, e una revisione mensile in modo che niente si accumuli di nuovo per diciotto mesi."

"E," aggiunse Tom, "rendere l'igiene dei costi parte del processo di deployment. Quando un ingegnere termina un'istanza EC2, il volume EBS viene eliminato automaticamente a meno che non si opti esplicitamente per il contrario."

## Punti di Forza e Limitazioni

**Disciplina di ottimizzazione dei costi**:

- Le revisioni regolari individuano gli sprechi che si accumulano prima che diventino significativi
- Il tagging abilita la responsabilità — i team vedono i propri costi
- Gli avvisi automatizzati prevengono sorprese in bolletta
- Le policy di lifecycle e il right-sizing sono spesso risparmi da impostare una volta sola

**Dove diventa complicato**:

- Identificare gli sprechi in un account grande con molti team richiede strumenti centralizzati
- Alcuni sprechi sono intenzionali (conservare snapshot extra "per sicurezza") — il compromesso costo/rischio è una valutazione soggettiva
- La migrazione a gp3 richiede una validazione attenta (i default di IOPS e throughput possono differire dal comportamento di gp2 in alcuni casi limite)
- I tag di allocazione dei costi richiedono disciplina da parte di tutti i team — un tagging inconsistente rende i dati incompleti
- L'automazione con auto-eliminazione è pericolosa per lo storage — avviso e revisione è più sicuro per volumi e snapshot

## Riepilogo

L'audit dello storage aveva richiesto due giorni. Lo spreco scoperto — $6.700 in 18 mesi di accumulo invisibile — era meno un fallimento decisionale che un fallimento di attenzione. Nulla era stato configurato male di proposito. Le snapshot, i volumi non collegati, la cronologia delle versioni che si accumulava, gli upload multipart incompleti: ciascuno aveva senso al momento e non fu mai più riesaminato. La lezione non riguardava servizi AWS specifici. Riguardava il costruire l'abitudine di guardare.

- **I costi di storage si accumulano in modo invisibile** — gli audit regolari sono essenziali.
- **I volumi EBS non collegati** sono una fonte comune di spreco. Eliminali (o automatizza l'eliminazione quando le istanze terminano).
- **Right-sizing EBS**: migra da gp2 a gp3 (tipicamente 20% di risparmio). Rimuovi gli IOPS provisioned in eccesso.
- **S3 versioning**: abilita regole di lifecycle per le versioni non correnti per evitare di pagare per una cronologia delle versioni illimitata.
- **Upload multipart incompleti**: aggiungi una regola di lifecycle `AbortIncompleteMultipartUpload` a ogni bucket. Spesso trascurata e si accumula in silenzio.
- **EFS Intelligent-Tiering**: sposta automaticamente i file su tier a costo inferiore in base alla frequenza di accesso. Per pattern di accesso prevedibili, le regole di lifecycle manuali possono essere più economiche.
- **Governance**: avvisa sui volumi non collegati dopo 7-14 giorni; richiedi tagging esplicito per sopprimere gli avvisi. Evita l'auto-eliminazione per le risorse di storage.

## Suggerimenti per l'Esame

*Dominio SAA-C03: Design Cost-Optimized Architectures (Dominio 4, Task 4.1)*

- **Tag di allocazione dei costi**: abilita i tag definiti dall'utente per l'allocazione dei costi nella console di fatturazione; poi tagga le risorse. Cost Explorer mostra le ripartizioni per tag. Scenario d'esame: "identifica quale dipartimento genera i maggiori costi S3" → tag di allocazione dei costi.
- **AWS Trusted Advisor**: identifica istanze EC2 sottoutilizzate, volumi EBS non collegati, load balancer inattivi e altri sprechi. I controlli base sono gratuiti; i controlli completi richiedono Business/Enterprise Support.
- **Componenti dei costi EBS**: storage (per GB), IOPS provisioned (se io1/io2 o extra gp3), throughput (se extra gp3). Sapere quali componenti possono essere ridimensionati.
- **Costi del versioning S3**: le versioni non correnti sono conservate e addebitate alla stessa tariffa delle versioni correnti. Le regole di lifecycle che fanno scadere le versioni non correnti sono fondamentali per il controllo dei costi nei bucket versionati.
- **AWS Compute Optimizer**: analizza l'utilizzo di EC2 e raccomanda tipi di istanza dimensionati correttamente. Segnale d'esame: "ridurre i costi EC2 scegliendo il tipo di istanza giusto" → Compute Optimizer.
- **AWS Cost Anomaly Detection**: usa il ML per rilevare pattern di spesa insoliti. Segnale d'esame: "rilevare automaticamente aumenti di costo imprevisti" → Cost Anomaly Detection.
- **Panoramica degli strumenti di costo**: grafici interattivi/previsioni → Cost Explorer. Avvisi sulle soglie → Budgets. "Dati di fatturazione più granulari, a livello di risorsa/orari, consegnati in S3 per analisi personalizzata (Athena/QuickSight)" → **Cost and Usage Report (Data Exports)**.
- **Requester Pays**: "condividere un grande dataset S3; i consumer pagano i propri costi di download" → S3 Requester Pays (il proprietario continua a pagare solo lo storage; i richiedenti devono autenticarsi con un account AWS).

## Esercizi

**Esercizio 1 — Ricordo**

Spiega perché i volumi EBS non collegati generano costi anche se nessuna istanza EC2 li sta usando. Quale processo dovrebbero seguire gli ingegneri quando terminano un'istanza EC2 per evitare questo spreco?

*(Suggerimento: pensa al deposito che hai dimenticato di stare pagando — l'affitto scade ogni mese che tu apra la porta o meno.)*

**Esercizio 2 — Scenario SAA-C03**

*Scenario*: La bolletta AWS di un'azienda è cresciuta da $5.000 a $9.000/mese nel corso di sei mesi, ma non sono stati aggiunti nuovi servizi. Il team di engineering sospetta che i costi di storage siano la causa. Quale combinazione di strumenti AWS identificherebbe e spiegherebbe MEGLIO l'aumento dei costi?

A) AWS CloudTrail per rivedere le chiamate API e identificare chi ha creato nuove risorse
B) AWS Cost Explorer per la ripartizione dei costi a livello di servizio, e AWS Trusted Advisor per il rilevamento di risorse inattive e non collegate
C) Amazon CloudWatch per il monitoraggio dell'utilizzo delle risorse e la creazione di allarmi sui costi
D) AWS Config per l'identificazione di tutte le risorse e del loro stato di conformità

**Suggerimento 1**: "Identificare l'aumento dei costi" → visualizzare la ripartizione dei costi per servizio.

**Suggerimento 2**: "Risorse inattive e non collegate" → uno strumento specifico le identifica in modo proattivo.

**Suggerimento 3**: CloudTrail registra le chiamate API; Cost Explorer mostra le tendenze dei costi. Quale è più utile per l'analisi dei costi?

**Risposta**: B

**Spiegazione**: AWS Cost Explorer mostra le tendenze dei costi suddivise per servizio, regione e tipo di utilizzo — perfetto per identificare quale servizio ha guidato l'aumento. I controlli di ottimizzazione dei costi di AWS Trusted Advisor identificano volumi EBS non collegati, istanze EC2 inattive, load balancer sottoutilizzati e altre fonti comuni di spreco.

**Perché non A?** CloudTrail registra chi ha creato le risorse e quando, ma non mostra direttamente le tendenze dei costi né identifica gli sprechi.

**Perché non C?** CloudWatch monitora le performance delle risorse (CPU, memoria) — utile per il right-sizing ma non per identificare lo spreco di storage accumulato.

**Perché non D?** AWS Config traccia le configurazioni delle risorse e la conformità ma non è uno strumento di analisi dei costi.

*Dominio SAA-C03: Design Cost-Optimized Architectures — Task 4.1*

**Esercizio 3 — Sfida di Architettura** *(Opzionale)*

La bolletta S3 di Nimbus mostra $340/mese per un bucket etichettato "backups." Il bucket ha il versioning abilitato e contiene:

- Snapshot del database giornaliere (7 giorni sono sufficienti per la loro policy)
- Backup completi settimanali (conservati per 3 mesi)
- Archivi trimestrali (conservati per 7 anni per la conformità fiscale)

Progetta una policy di lifecycle per questo bucket che minimizzi i costi rispettando questi requisiti di conservazione. Quale storage class dovrebbe usare ciascun tipo di dati? Come gestiresti il versioning per evitare che le versioni vecchie si accumulino?

*(Non esiste una risposta univoca corretta. L'obiettivo è esercitarsi nella progettazione di policy di lifecycle.)*

## Scena Post-Crediti

Tom pubblicò i risultati dell'audit dei costi al team.

Spreco identificato: $6.700 in 18 mesi.
Risparmio annuale atteso dalle modifiche implementate: $6.200.

Poi aggiunse una riga in fondo: "Questo non include i risparmi dei Savings Plans ($14.200/anno) o delle policy di lifecycle S3 ($7.800/anno). Impatto combinato annuale dell'ottimizzazione: circa $28.200."

Maya lo lesse due volte.

"È quasi lo stipendio di un ingegnere junior," disse.

"Di spreco," confermò Tom.

"O," disse Leo, "è la prova che fare queste ottimizzazioni prima avrebbe finanziato quell'ingegnere junior."

Tom lo guardò.

"È il modo giusto di pensarci," disse. "L'ottimizzazione dei costi non riguarda i tagli. Riguarda il non pagare per cose che non creano valore."

Maya fissò il documento sulla wiki aziendale.

Nel prossimo capitolo: il tier del database riceve lo stesso trattamento, e Tom scopre il posto in cui stava effettivamente sottoinvestendo.
