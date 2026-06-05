# Capitolo 28: La Sorpresa della Bolletta di Archiviazione

Tom aveva presentato il Piano di Risparmio per EC2. La riga successiva sulla bolletta era S3: $198/mese (in diminuzione da $847 dopo le modifiche della policy di ciclo di vita del Capitolo 23).

Poi guardò EBS: $440/mese.

"Sembra alto," disse.

Leo aprì l'elenco dei volumi EBS. C'erano 47 volumi EBS collegati alle istanze. E poi c'erano altri 23 volumi non collegati a nessuna istanza.

"Questi 23 volumi," disse Tom. "Di cosa si tratta?"

Leo li cercò. Erano tutti disconnessi: nessuna istanza li stava attualmente utilizzando. La maggior parte era stata creata da snapshot per scopi di debug. Alcuni provenivano da istanze terminate ma i cui volumi non erano stati eliminati.

"Stiamo pagando $0,10 al GB al mese per l'archiviazione che nessuno legge," disse Leo.

Tom guardò il totale: 2,3 TB di volumi non collegati.

"Centoventitré dollari al mese per l'archiviazione che non utilizziamo," disse Tom. "Da quanto tempo succede?"

Leo controllò le date di creazione. Il volume più vecchio risale a 16 mesi fa.

"Sei mila ottocento e ottantotto dollari," disse Tom, a bassa voce. "Abbiamo speso sei mila ottocentottantotto dollari per l'archiviazione a cui nessuno accede."

Eliminò i volumi non collegati. Il mese successivo, la bolletta EBS scese a $210.

**L'Audit dei Costi di Archiviazione**

La scoperta di EBS di Tom era un sintomo di un modello più ampio: i costi di archiviazione si accumulano in modo invisibile. A differenza del calcolo (noti quando 47 server sono in esecuzione), l'archiviazione aggiunge silenziosamente.

Pensateci come a un affitto di un deposito. Affittare un'unità è ovvio sulla dichiarazione del conto in corso di pagamento. Ma se affitti una seconda unità per un progetto, poi una terza per dei vecchi mobili, e non torni mai a controllare cosa c'è dentro – le tariffe continuano ad apparire ogni mese, silenziosamente, molto dopo che ti sei dimenticato di cosa stai anche memorizzando. L'archiviazione nel cloud funziona allo stesso modo: i byte rimangono lì, arriva la fattura e nessuno la mette in discussione finché qualcuno non apre la porta e la trova piena di cose di cui nessuno ha più bisogno.

Un audit completo dei costi di archiviazione guarda a:

**S3:**

- Sono in vigore le policy di ciclo di vita per tutti i bucket?
- Ci sono snapshot vecchi (RDS, EBS) che si trovano in S3?
- L'Intelligent-Tiering è appropriato per qualsiasi bucket con modelli di accesso incerti?
- Ci sono oggetti versionati che creano copie multiple che non vengono mai accessi?

**EBS:**

- Ci sono volumi non collegati (senza istanze in esecuzione che li utilizzano)?
- I volumi gp3 sono configurati correttamente? (I volumi gp3 predefiniti possono avere un throughput/IOPS in eccesso che non è necessario)
- Gli snapshot più vecchi del necessario vengono conservati?

**RDS:**

- I periodi di conservazione automatizzati dei backup sono impostati correttamente? (Più lunghi = costi di archiviazione più elevati)
- Gli snapshot manuali di vecchie istanze sono ancora in giro?
- I read replica da migrazioni di database sono ancora in esecuzione?

**EFS:**

- Il volume EFS è nella classe di archiviazione giusta? (Standard vs Accesso Infrequente)

**Versioning di S3: Il Costo Nascosto**

Nel Capitolo 5, abbiamo menzionato che il versioning di S3 mantiene ogni versione precedente di un oggetto. Questo è ottimo per la sicurezza. È terribile per i costi se non si hanno anche policy di ciclo di vita per le versioni.

Quando il versioning è abilitato su un bucket, ogni volta che sovrascrivi un oggetto, la vecchia versione viene mantenuta. Nel tempo:

- Giorno 1: Immagine caricata (v1)
- Giorno 30: Immagine aggiornata (v1 è ora una versione "non corrente", v2 è corrente)
- Giorno 60: Immagine aggiornata di nuovo (v1 e v2 sono non correnti, v3 è corrente)
- Giorno 365: v1, v2... v12 sono tutti memorizzati. Stai pagando per 12 copie di un'immagine.

La soluzione: policy di ciclo di vita per le versioni non correnti.

```
Expire noncurrent versions after 30 days
Delete failed multipart uploads after 7 days
```

Tom ha applicato queste regole a tutti i bucket versionati. Il mese successivo, lo storage S3 è diminuito del 18%.

**EBS: Ottimizzazione delle Dimensioni e Aggiornamento a gp3**

Il prezzo delle volumi EBS è composto da due elementi:

1.  Storage (per GB al mese)
2.  IOPS e throughput provisionati (se si utilizzano io1/io2 o si paga per le prestazioni extra di gp3)

**L'opportunità gp3**: Nel Capitolo 6, abbiamo notato che gp3 è il volume predefinito attuale ed è più economico di gp2. Se Nimbus avesse volumi creati prima che gp3 fosse disponibile (ha debuttato nel dicembre 2020), questi potrebbero ancora essere gp2.

Tom ha trovato 12 volumi gp2 che totalizzavano 1.200 GB. Migrare a gp3 ha risparmiato il 20% su questi volumi immediatamente, senza alcuna perdita di prestazioni.

**IOPS e throughput**: Le volumi gp3 includono 3.000 IOPS e 125 MB/s di throughput di default, senza costi aggiuntivi. È possibile aumentare la capacità se il carico di lavoro lo richiede. Verificare se le prestazioni provisionate vengono effettivamente utilizzate.

Tom ha trovato due volumi gp3 con 10.000 IOPS provisionati. Ha controllato le metriche di CloudWatch: il valore medio effettivo di IOPS era 1.200. Ha ridotto gli IOPS provisionati a 4.000 (un margine di sicurezza superiore al picco effettivo).

Risparmio mensile: $68.

**Ciclo di Vita delle Snapshot**: Le snapshot EBS sono incrementali (ogni snapshot memorizza solo le modifiche rispetto all'ultimo), ma si accumulano. Vecchie snapshot degli inizi di Nimbus esistevano ancora. Tom ha conservato 30 giorni di snapshot giornalieri e ne ha cancellate le restanti.

**EFS: Classi di Storage**

Amazon EFS ha le sue classi di storage:

-   **EFS Standard**: Per file accessibili frequentemente. Costo più elevato.
-   **EFS Infrequent Access (IA)**: Per file non accessibili da 30 giorni. Il 92% più economico dello Standard.
-   **EFS Archive**: Per file non accessibili da 90 giorni. Ancora più economico dell'IA.

**EFS Intelligent-Tiering**: Sposta automaticamente i file tra le classi di storage in base ai modelli di accesso.

Tom ha abilitato Intelligent-Tiering sul volume EFS. Sei settimane dopo, il 68% dei file si era spostato nella classe Infrequent Access. Il costo mensile di EFS è diminuito da $89 a $31.

**Allocazione dei Costi S3: Chi Spende Cosa**

Mentre Nimbus cresceva, diversi team memorizzavano dati in S3. Il team di analisi aveva i propri bucket. Il team di ingegneria aveva i propri bucket. Il team dei dati del ristorante aveva i propri bucket.

La fattura mostrava solo "S3: $198". Non c'era una ripartizione per team.

**L'allocazione dei costi tramite tag** consente di taggare le risorse AWS con metadati aziendali (team, progetto, ambiente) e quindi visualizzare i costi suddivisi per questi tag in AWS Cost Explorer.

Tom ha aggiunto tag a tutti i bucket S3:
```

```
Team: analytics
Environment: production
Project: nimbus-core

Dopo un ciclo di fatturazione con il tagging, lui poteva vedere: "Il data lake del team di analisi costa 74€ al mese. I backup di ingegneria costano 43€ al mese. I dati dei ristoranti costano 81€ al mese."

Ora poteva avere conversazioni sul budget con ciascun team invece di limitarsi a vedere un numero aggregato.

**AWS Cost Explorer e AWS Budgets**

**AWS Cost Explorer**: Visualizza i costi storici e previsti per servizio, regione, tag e tipo di utilizzo. Essenziale per capire dove vanno i soldi.

**AWS Budgets**: Imposta avvisi quando i costi superano (o sono destinati a superare) una soglia. Puoi definire il budget per servizio, regione, tag o account.

Tom ha configurato tre budget:

1.  Spesa mensile totale: avviso al 90% dell'importo del budget previsto
2.  EC2 On-Demand: avviso se la spesa On-Demand supera i 500€ al mese (segnala una lacuna nel Piano di Convalida)
3.  Trasferimento dati in uscita: avviso a 200€ al mese (i costi di trasferimento dati possono aumentare in modo inaspettato)

I Budget hanno inviato avvisi a un canale Slack. Il team ha visto quando si stava avvicinando ai limiti, invece di scoprirlo sulla fattura mensile.

**Il Costo della Negligenza**

Tom ha creato un foglio di calcolo. Ha calcolato quanto Nimbus aveva speso per:

-   Volumi EBS non associati (16 mesi): 3.680€
-   Snapshot S3 obsoleti (scoperti e cancellati): 890€
-   IOPS provisionati non necessari: 816€
-   Migrazione da gp2 a gp3 (salvataggio stimato, se eseguita in precedenza): 2.160€ su 18 mesi
-   Versioni S3 non correnti che si accumulano: 1.340€

Rifiuto totale identificato: circa 8.800€ su 18 mesi.

"Otto mila ottanta euro," disse Maya.

"Dalla negligenza," disse Tom. "Non a causa di decisioni architetturali sbagliate. A causa della mancata pulizia."

"Qual è la soluzione sistematica?"

"Revisioni regolari," disse Priya. "Revisioni mensili di Cost Explorer. AWS Trusted Advisor segnala automaticamente i volumi non associati e le risorse inutilizzate. Automatizza la pulizia dei modelli di spreco noti: elimina gli snapshot più vecchi di N giorni, avvisa sui volumi EBS non associati, elimina le versioni S3 obsolete."

"E," aggiunse Tom, "rendi l'igiene dei costi parte del processo di distribuzione. Quando un ingegnere termina un'istanza EC2, il volume EBS viene eliminato automaticamente a meno che non venga esplicitamente disattivato."

## Punti di Forza e Limitazioni

**Disciplina di ottimizzazione dei costi**:

-   Le revisioni regolari individuano gli sprechi che si accumulano prima che diventino significativi
-   Il tagging abilita la responsabilità - i team vedono i propri costi
-   Gli avvisi automatizzati prevengono sorprese sulla fattura
-   Le politiche di ciclo di vita e il ridimensionamento sono spesso risparmi "impostali e dimenticali"

**Dove diventa complicato**:

-   Identificare gli sprechi in un ampio account con molti team richiede strumenti centralizzati
-   Alcuni sprechi sono intenzionali (mantenere snapshot extra "solo per sicurezza") - il compromesso costo/rischio è una decisione valutativa
-   La migrazione da gp3 richiede una convalida accurata (gli impostazioni di IOPS e throughput possono differire dal comportamento di gp2 in alcuni casi limite)
-   I tag di allocazione dei costi richiedono disciplina in tutti i team - un tagging incoerente rende i dati incompleti

## Riepilogo

-   **I costi di archiviazione si accumulano in modo invisibile** - le revisioni regolari sono essenziali.
-   **I volumi EBS non associati** sono una fonte comune di spreco. Eliminali (o automatizzate l'eliminazione quando le istanze terminano).
-   **Ridimensionamento EBS**: migrare da gp2 a gp3 (tipicamente risparmio del 20%) Rimuovere IOPS in eccesso provisionati.
-   **Versioning S3**: abilitare le regole di ciclo di vita per le versioni non correnti per evitare di pagare per la cronologia di versioni illimitata.
-   **EFS Intelligent-Tiering**: sposta automaticamente i file in livelli di costo inferiori in base alla frequenza di accesso.
-   **Tag di allocazione dei costi**: tagga le risorse con metadati di team/progetto/ambiente per la visibilità e la responsabilità dei costi.
-   **AWS Budgets**: avvisi proattivi quando i costi si avvicinano alle soglie. Non essere mai sorpreso dalla fattura mensile.

## Suggerimenti per l'esame

*SAA-C03 Dominio: Progettazione di architetture ottimizzate per i costi (Dominio 4, Task 4.1)*

-   **Tag di allocazione dei costi**: abilita i Tag Utente Definiti per l'allocazione dei costi nel pannello di controllo delle fatture; quindi tagga le risorse. Cost Explorer mostra le suddivisioni per tag. Scenario d'esame: "identifica quale dipartimento genera la maggior parte dei costi S3" → tag di allocazione dei costi.
-   **AWS Trusted Advisor**: identifica istanze EC2 sottoutilizzate, volumi EBS non associati, load balancer inattivi e altri sprechi. I controlli di base sono gratuiti; i controlli completi richiedono Business/Enterprise Support.
-   **Componenti dei costi EBS**: archiviazione (per GB), IOPS provisionati (se io1/io2 o extra gp3), throughput (se extra gp3). Conosci quali componenti possono essere ridimensionati.
-   **Costi di versioning S3**: le versioni non correnti sono archiviate e addebitate allo stesso costo delle versioni correnti. Le regole di ciclo di vita che eliminano le versioni non correnti sono fondamentali per il controllo dei costi in bucket versionati.
-   **AWS Compute Optimizer**: analizza l'utilizzo di EC2 e raccomanda tipi di istanza dimensionati correttamente. Segnale d'esame: "riduci i costi EC2 selezionando il tipo di istanza corretto" → Compute Optimizer.
-   **AWS Cost Anomaly Detection**: utilizza l'ML per rilevare modelli di spesa insoliti. Segnale d'esame: "rilevare automaticamente aumenti di costi imprevisti" → Cost Anomaly Detection.

## Esercizi

**Esercizio 1 — Ricordo**

Spiega perché i volumi EBS non associati generano costi anche se non vengono utilizzati da alcuna istanza EC2. Quale processo dovrebbero seguire gli ingegneri quando terminano un'istanza EC2 per evitare questo spreco?

*(Suggerimento: i volumi EBS memorizzano i dati su disco fisico e quel disco costa denaro indipendentemente dal fatto che venga letto o meno.)*

**Esercizio 2 — Esercitazione d'Esame**

*Scenario*: La bolletta AWS di un'azienda è passata da $5.000 a $9.000/mese in sei mesi, ma non sono stati aggiunti nuovi servizi. Il team di ingegneria sospetta che i costi di archiviazione siano la causa. Quale combinazione di strumenti AWS identificherebbe e spiegherebbe al meglio l'aumento dei costi?

A) AWS CloudTrail per rivedere le chiamate API e identificare chi ha creato nuove risorse
B) AWS Cost Explorer per l'analisi dei costi a livello di servizio, e AWS Trusted Advisor per il rilevamento di risorse inutilizzate e inattive
C) Amazon CloudWatch per il monitoraggio dell'utilizzo delle risorse e la creazione di allarmi sui costi
D) AWS Config per l'identificazione di tutte le risorse e del loro stato di conformità

**Suggerimento 1**: "Identificare l'aumento dei costi" → visualizzare la ripartizione dei costi per servizio.

**Suggerimento 2**: "Risorse inattive e non associate" → uno strumento specifico identifica proattivamente queste.

**Suggerimento 3**: CloudTrail registra le chiamate API; Cost Explorer mostra le tendenze dei costi. Quale è più utile per l'analisi dei costi?

**Risposta**: B

**Spiegazione**: AWS Cost Explorer mostra le tendenze dei costi suddivise per servizio, regione e tipo di utilizzo – perfetta per identificare quale servizio ha determinato l'aumento. AWS Trusted Advisor esegue controlli di ottimizzazione dei costi che identificano volumi EBS non associati, istanze EC2 inattive, bilanciatori di carico sottoutilizzati e altre fonti comuni di spreco.

**Perché non A?** CloudTrail registra chi ha creato le risorse e quando, ma non mostra direttamente le tendenze dei costi o identifica gli sprechi.

**Perché non C?** CloudWatch monitora le prestazioni delle risorse (CPU, memoria) – utile per l'ottimizzazione delle dimensioni, ma non per l'identificazione dello spreco di spazio di archiviazione accumulato.

**Perché non D?** AWS Config traccia le configurazioni delle risorse e la conformità, ma non è uno strumento di analisi dei costi.

*SAA-C03 Dominio: Progettazione di Architetture Ottimizzate per i Costi — Attività 4.1*

**Esercizio 3 — Sfida Architetturale** *(Opzionale)*

Nimbus ha una bolletta S3 di $340/mese per un bucket denominato "backups". Il bucket ha abilitato il versioning e contiene:

- Snapshot del database giornalieri (7 giorni sono sufficienti per la loro politica)
- Backup completi settimanali (conservati per 3 mesi)
- Archivi trimestrali (conservati per 7 anni per la conformità fiscale)

Progetta una policy di ciclo di vita per questo bucket che minimizzi i costi mantenendo queste esigenze di conservazione. Quale classe di storage dovrebbe essere utilizzata per ciascun tipo di dati? Come gestirebbe il versioning per evitare che vecchie versioni si accumulino?

*(Non esiste una risposta corretta univoca. L'obiettivo è quello di esercitarsi nella progettazione di policy di ciclo di vita.)*

## Scena Post-Crediti

Tom ha pubblicato i risultati dell'audit dei costi al team.

Sprechi identificati: $8.800 in 18 mesi.
Risparmi previsti derivanti dai cambiamenti implementati: $6.200.

Poi ha aggiunto una riga alla fine: "Questo non include i risparmi derivanti da Savings Plans ($14.200/anno) o dalle policy di ciclo di vita S3 ($7.800/anno). Impatto combinato annuale di ottimizzazione: circa $28.200."

Maya l'ha letto due volte.

"È quasi uno stipendio per un ingegnere junior," ha detto.

"In sprechi," ha confermato Tom.

"O," ha detto Leo, "dimostra che se avessimo fatto queste ottimizzazioni prima, avrebbe finanziato quel giovane ingegnere."

Tom lo guardò.

"È il modo giusto di pensare," ha detto. "L'ottimizzazione dei costi non è una questione di tagli. È una questione di non pagare per cose che non creano valore."

Maya ha incollato il documento sul wiki aziendale.

Nel prossimo capitolo: la tier del database riceve lo stesso trattamento e Tom scopre il posto in cui stava effettivamente sottinvestendo.
