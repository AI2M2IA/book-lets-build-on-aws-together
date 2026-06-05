# Capitolo 23: Il Sistema di Archiviazione che Si Ordina da Solo

Uno studio legale conserva i fascicoli di casi attivi sul suo banco da lavoro. I casi conclusi vanno in un archivio. I casi di tre anni fa vanno in scatole di stoccaggio nel seminterrato. I casi di dieci anni fa vanno in un centro di archiviazione fuori sede che costa pochi centesimi per scatola ma richiede due giorni per recuperare qualsiasi cosa.

La stessa informazione, memorizzata a costi diversi in base alla frequenza con cui viene acceduta.

S3 lo fa automaticamente.

Tom stava rivedendo la fattura AWS di Nimbus. Riga: Archiviazione S3. 847 dollari al mese.

Chiamò Leo.

"Abbiamo 4,2 terabyte in S3," disse Leo dopo aver controllato.

"Di cosa?"

"Foto dei ristoranti. Ricevute d'ordine. Esportazioni di analisi. Snapshot di backup di 18 mesi fa."

"Quando è stata l'ultima volta che qualcuno ha acceduto a un backup di 18 mesi fa?"

Leo controllò i log di accesso.

"L'ottobre scorso," disse. "Una volta. Per verificare il formato del backup."

"Quindi stiamo pagando per 18 mesi di backup a prezzi standard di S3 completi."

"Sì."

Tom guardò la pagina dei prezzi di S3. S3 Standard: 0,023 dollari al GB al mese. S3 Glacier Instant Retrieval: 0,004 dollari al GB al mese.

Fez i calcoli. Alcili calcoli rapidi.

"Potremmo ridurre significativamente questa bolletta, semplicemente spostando i dati vecchi in un archivio più economico," disse.

"Dovremmo sapere cosa è vecchio," disse Leo.

"S3 lo sa. Traccia l'ultimo accesso."

**Classi di Archiviazione S3: Lo Spettro Completo**

Nel capitolo 5 è stata introdotta S3 Standard come classe di archiviazione primaria. S3 in realtà ha sette classi di archiviazione, ognuna progettata per modelli di accesso diversi:

**S3 Standard**: Per i dati accessibili frequentemente. Bassa latenza (millisecondi). Costo più alto. Nessuna durata minima dello storage. Usare per i dati attivi: le foto dei menu correnti, gli ordini di oggi, i log recenti.

**S3 Standard-Infrequent Access (S3 Standard-IA)**: Per i dati accessibili meno di una volta al mese. La stessa latenza di millisecondi di Standard, ma costo di storage inferiore + costo per GB di recupero. Usare per i dati di cui hai bisogno immediatamente quando li accedi, ma che raramente fai: ricevute d'ordine più vecchie, esportazioni di analisi di 6 mesi.

**S3 One Zone-Infrequent Access (S3 One Zone-IA)**: Come S3 Standard-IA ma memorizzato in una sola Zona di Disponibilità (invece di tre). Meno durevole (se quella zona ha una disastro, i dati possono andare persi), ma 20% più economico. Usare per i dati che possono essere ricreati se persi: cache delle miniature, output di elaborazione temporanei.

**S3 Glacier Instant Retrieval**: Dati archiviati di cui hai bisogno occasionalmente. Latenza di millisecondi. Costo di storage molto basso, costo per GB di recupero più alto. Durata minima di 90 giorni. Usare per i dati accessibili una volta ogni trimestre o meno: rapporti di conformità trimestrali, snapshot di backup di 12 mesi.

**S3 Glacier Flexible Retrieval**: Archiviazione profonda, recuperata in minuti o ore. Costo inferiore a Glacier Instant Retrieval. Usare per i dati di archiviazione con meno urgenza.

**S3 Glacier Deep Archive**: Costo più basso. Recuperato in 12 ore. Durata minima di 180 giorni. Usare per i dati che devono essere conservati per la conformità normativa ma che non si prevede mai che vengano accessi: registri fiscali di 7 anni, registri di audit di 10 anni.

Il modello: man mano che la frequenza di accesso diminuisce, il costo diminuisce ma il tempo di recupero aumenta (e il costo di recupero aumenta). Scegli la classe che corrisponde al tuo modello di accesso.

**Politiche di Vita Ciclica S3: Il Sistema di Archiviazione Automatizzato**

Spostare manualmente i file tra le classi di archiviazione è soggetto a errori e richiede molto tempo. S3 **politiche di vita** automatizza questo in base alle regole che definisci.

Una regola di vita ciclica ha due componenti:

**Filtro**: Quali oggetti la regola si applica (tutti gli oggetti, oggetti con un prefisso specifico, oggetti con tag specifici).

**Azioni**: Cosa fare, dopo quanti giorni.

Esempio di politica di vita ciclica per le ricevute d'ordine di Nimbus:

```
Transition to S3 Standard-IA after 90 days
Transition to S3 Glacier Instant Retrieval after 365 days
Transition to S3 Glacier Deep Archive after 2555 days (7 years)
Delete after 2920 days (8 years)
```

Questa singola policy garantisce:

- Ricevute attive (< 90 giorni): S3 Standard, accesso rapido
- Ricevute recenti (90-365 giorni): Standard-IA, economico ma disponibile istantaneamente
- Ricevute storiche (1-7 anni): Glacier, molto economico, raramente necessario
- Ricevute scadute (> 8 anni): Eliminato automaticamente

Tom ha rivisto i risparmi previsti: da 847 dollari al mese a circa 220 dollari al mese.

"Semplicemente... definendo cosa è vecchio e dove metterlo?" ha detto.

"E S3 lo sposta automaticamente," ha confermato Leo. "Nessun cron job. Nessuna migrazione manuale. Nessuno che lo dimentichi."

**S3 Intelligent-Tiering: La Classe Auto-Organizzata**

E se non si sa quanto spesso si accede ai propri dati?

**S3 Intelligent-Tiering** monitora i modelli di accesso per ogni oggetto e lo sposta automaticamente tra i livelli di accesso:

- **Livello di Accesso Frequente**: Per oggetti accessi di recente
- **Livello di Accesso Non Frequente**: Oggetti non accessi per 30 giorni
- **Livello di Accesso Istantaneo Archivio**: Oggetti non accessi per 90 giorni
- **Livello di Accesso Archivio (Opzionale)**: Oggetti non accessi per 90-730 giorni
- **Livello di Accesso Profondo Archivio**: Oggetti non accessi per 180-730+ giorni (Opzionale)

S3 Intelligent-Tiering addebita una piccola tariffa di monitoraggio per oggetto al mese ($0.0025 per 1.000 oggetti), ma non addebita alcuna tariffa di recupero per i livelli Frequente e Non Frequente.

Utilizza Intelligent-Tiering quando:

- I modelli di accesso sono imprevedibili o cambiano nel tempo
- Hai un mix di dati caldi e freddi che non puoi facilmente classificare
- Hai oggetti più grandi di 128 KB (gli oggetti piccoli costano di più nelle tariffe di monitoraggio rispetto a quanto risparmi)

Utilizza classi di storage esplicite (con policy di lifecycle) quando:

- I modelli di accesso sono prevedibili
- Vuoi minimizzare le tariffe di monitoraggio per oggetto
- Gli oggetti sono piccoli (< 128 KB)

**Caricamento Multipartito: Per Oggetti Grandi**

S3 ha un limite di caricamento singolo di 5 GB. Per oggetti più grandi, devi utilizzare il **caricamento multipartito**: dividi l'oggetto in parti, carica ciascuno in parallelo e S3 li assembla.

Vantaggi:

- Caricamenti più veloci (paralleli)
- Può riprendere i caricamenti falliti (solo ricaricare le parti fallite)
- Richiesto per oggetti > 5 GB

Suggerimento sulla regola di lifecycle: imposta una regola di lifecycle per eliminare i caricamenti multipartiti incompleti dopo 7 giorni. Se un caricamento fallisce a metà strada e non viene ripulito, queste parti parziali vengono memorizzate e addebitate — senza un oggetto assemblato per mostrarlo.

Tom ha apprezzato molto questo suggerimento.

**S3 Replication: Copia di Dati tra Bucket**

S3 può replicare automaticamente oggetti da un bucket a un altro:

**Replicazione nella Stessa Regione (SRR)**: Copia oggetti all'interno della stessa regione. Utilizza per la conformità (mantenere una copia separata in un altro account), aggregare i log da più bucket o creare ambienti di test dai dati di produzione.

**Replicazione tra Regioni (CRR)**: Copia oggetti in un'altra regione. Utilizza per il disaster recovery (ridondanza dei dati tra regioni), la conformità (i dati devono essere in una specifica geografia) e la latenza inferiore per gli utenti globali.

La replicazione non è una soluzione di backup — se elimini un oggetto nel bucket di origine, viene eliminato anche nel replica (a meno che la disabilitazione della replicazione del segnaposto di eliminazione non sia stata abilitata). Utilizza AWS Backup o il versionamento con il blocco degli oggetti per il backup.

**S3 Object Lock: Immutabilità per la Conformità**

Alcune normative richiedono che i dati siano **immutabili** — una volta scritti, non possono essere modificati o eliminati per un periodo di tempo specificato.

**S3 Object Lock** implementa lo storage WORM (Write Once, Read Many):

**Periodo di conservazione**: gli oggetti non possono essere eliminati o sovrascritti per una durata specificata.

**Messa in sicurezza legale**: gli oggetti non possono essere eliminati, indipendentemente dal periodo di conservazione, fino a quando la messa in sicurezza legale non viene esplicitamente rimossa.

Utilizza S3 Object Lock per le industrie regolate: registri finanziari (SEC Rule 17a-4), cartelle cliniche (HIPAA), archivi di conformità.

## Punti di Forza e Limitazioni

**Perché i livelli di storage S3 sono importanti**:

- Significativi risparmi sui costi senza sacrificare la durabilità o la disponibilità per ciò che viene effettivamente utilizzato
- Le policy di lifecycle automatizzano l'intero processo — nessuna onere operativa
- S3 Intelligent-Tiering elimina la necessità di prevedere i modelli di accesso

**Dove diventa complicato**:

- Si applicano addebiti per la durata minima dello storage per le classi Glacier (90 giorni per Glacier Instant, 180 giorni per Deep Archive) — eliminare in anticipo comporta comunque l'addebito minimo
- Le tariffe di recupero possono sorprenderti se accedi frequentemente ai dati archiviati
- Le transizioni di lifecycle richiedono tempo — gli oggetti non vengono spostati istantaneamente dopo che la regola viene attivata
- Le tariffe di monitoraggio di Intelligent-Tiering si accumulano per i bucket con milioni di piccoli oggetti

## Riepilogo

- S3 ha sette classi di storage: Standard, Standard-IA, Intelligent-Tiering, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval e Glacier Deep Archive.
- **Policy di ciclo di vita** automatizzano le transizioni tra le classi di storage in base all'età — definisci una volta, S3 se ne occupa per sempre.
- **S3 Intelligent-Tiering** sposta automaticamente gli oggetti tra i livelli in base ai modelli di accesso effettivi — ideale per carichi di lavoro imprevedibili.
- **Caricamento multipartito** è richiesto per gli oggetti > 5 GB e consigliato per tutto ciò che > 100 MB.
- **Replicazione S3** (SRR e CRR) copia gli oggetti tra i bucket e le regioni — per DR, conformità o aggregazione.
- **Blocco Oggetto S3** fornisce storage WORM per scenari di conformità.

## Consigli per l'Esame

*Dominio SAA-C03: Progettazione di Architetture Ottimizzate per il Costo (Dominio 4, Task 4.1)*

- **Segnali di selezione della classe di storage**:
  - "Frequentemente accessato" → Standard
  - "Accesso una volta al mese, necessità di recupero istantaneo" → Standard-IA
  - "Può tollerare ore di tempo di recupero, accesso raro" → Glacier Flexible Retrieval
  - "Conformità normativa, conservazione di 7+ anni, mai accessato" → Glacier Deep Archive
  - "Modelli di accesso sconosciuti o in evoluzione" → Intelligent-Tiering
- **Modelli di esame per le policy di ciclo di vita**: "riduce automaticamente i costi di archiviazione man mano che i dati invecchiano", "passa all'archiviazione dopo 90 giorni" → policy di ciclo di vita.
- **Costo della tariffa Intelligent-Tiering**: piccolo costo per oggetto. Per un gran numero di piccoli oggetti, può superare i risparmi. L'esame potrebbe testare questo.
- **Requisiti CRR**: la versione deve essere abilitata sia nel bucket di origine che in quello di destinazione. Origine e destinazione devono trovarsi in regioni diverse.
- **Blocco Oggetto S3**: "WORM", "immutabile", "SEC 17a-4", "non può essere eliminato o modificato" → Blocco Oggetto. Modalità di governance (può essere sovrascritta dagli amministratori). Modalità di conformità (non può essere sovrascritta da nessuno, compreso root).
- **Ripristino di Glacier**: gli oggetti in Glacier non sono immediatamente disponibili. È necessario "ripristinare" una copia in S3 Standard per l'accesso. La copia ripristinata è temporanea (imposti la durata). L'originale rimane in Glacier.

## Esercizi

**Esercizio 1 — Ricordo**

Spiega la differenza tra S3 Standard-IA e S3 Glacier Instant Retrieval. Qual è il modello di accesso che rende ciascuno appropriato?

*(Suggerimento: Pensa a quanto spesso accederesti ai dati e quanto velocemente hai bisogno di accedervi quando li accedi.)*

**Esercizio 2 — Esercizi per l'Esame**

*Scenario*: Un'azienda genera 500 GB di log di applicazioni quotidianamente. I log vengono interrogati pesantemente nei primi 7 giorni (debug e monitoraggio). Dopo 7 giorni, i log vengono raramente accessibili ma devono essere disponibili entro 30 minuti se necessario. Dopo 1 anno, i log devono essere conservati per la conformità ma non vengono mai accessibili. L'azienda deve ridurre al minimo i costi di archiviazione pur soddisfacendo questi requisiti.

Quale policy di ciclo di vita S3 soddisfa meglio questi requisiti?

A) Memorizza in S3 Standard per 7 giorni; passa a S3 Glacier Deep Archive dopo 7 giorni; elimina dopo 365 giorni
B) Memorizza in S3 Standard per 7 giorni; passa a S3 Standard-IA dopo 7 giorni; passa a S3 Glacier Flexible Retrieval dopo 365 giorni
C) Memorizza tutti i log in S3 Intelligent-Tiering dal giorno 1
D) Memorizza in S3 Standard per 7 giorni; passa a S3 Glacier Instant Retrieval dopo 7 giorni; passa a S3 Glacier Deep Archive dopo 365 giorni

**Suggerimento 1**: Quale classe di storage esclude il requisito di "disponibilità entro 30 minuti"?

**Suggerimento 2**: Deep Archive richiede 12 ore per il recupero — non soddisfa il requisito di 30 minuti per i giorni 7-365.

**Suggerimento 3**: Dopo 365 giorni, il tempo di recupero non è importante (mai accessato), quindi l'opzione più economica si applica.

**Risposta**: D

**Spiegazione**: S3 Standard per 7 giorni gestisce l'accesso frequente. Glacier Instant Retrieval fornisce un accesso millisecondo per i giorni 7-365 — soddisfacendo il requisito di 30 minuti a un costo significativamente inferiore rispetto a Standard-IA. Dopo 365 giorni, Glacier Deep Archive è l'opzione più economica per i dati che non vengono mai accessi.

**Perché D non è corretto?** Glacier Deep Archive richiede 12 ore per il recupero — non soddisfa il requisito di "disponibilità entro 30 minuti" per i giorni 7-365.

**Perché D non è corretto?** Standard-IA dopo 7 giorni funziona, ma Glacier Instant Retrieval è significativamente più economico. Standard-IA è più appropriato quando hai bisogno di un recupero istantaneo ma l'accesso è infrequente — qui, i dati sono raramente accessibili dopo il giorno 7, rendendo Glacier più conveniente.

**Perché D non è corretto?** Intelligent-Tiering ha una tariffa per oggetto di monitoraggio e potrebbe non spostare i log nelle tier di archiviazione tanto aggressivamente quanto le policy di ciclo di vita esplicite. Per un grande volume di log con un modello di accesso prevedibile, le policy di ciclo di vita esplicite sono più convenienti.

*Dominio SAA-C03: Progettazione di Architetture Ottimizzate per il Costo — Task 4.1*

**Esercizio 3 — Sfida Architetturale** *(Opzionale)*

Nimbus ha tre tipi di dati S3 con caratteristiche diverse:

- Foto di ristoranti: caricate una volta, accessibili molte volte dai clienti, mai eliminate
- Ricevute d'ordine: accessibili dai clienti nei primi 30 giorni, conservate per 7 anni per scopi fiscali
- Esportazioni di analisi: generate quotidianamente, analizzate nella settimana successiva, conservate per 2 anni

Progetta una policy di ciclo di vita per ciascuno. Per le foto del ristorante, avrebbe senso l'Intelligent-Tiering? Per le ricevute d'ordine, quale classe di storage copre il periodo da 1 mese a 7 anni? Per le esportazioni di analisi, come struttureresti il bucket per applicare diverse policy a diversi prefissi?

*(Non esiste una risposta univocamente corretta. L'obiettivo è esercitarsi nella selezione dei livelli di archiviazione per i dati reali.)*

## Scena Post-Crediti

Tom ha implementato le policy di ciclo di vita.

La bolletta di S3 è diminuita da 847 dollari a 198 dollari il mese successivo.

Ha stampato il confronto e lo ha messo sul tavolo di Maya senza dire nulla.

Maya lo ha guardato. Poi ha guardato la data. Poi ha guardato Tom.

"Tre settimane," ha detto lei.

"Un pomeriggio per progettare le policy," ha detto lui. "Un'ora per implementarle. Tre settimane per vedere il primo ciclo di fatturazione completo."

"Riduzione del 66% dei costi di S3."

"Per i dati che non accediamo."

Maya ha guardato i numeri di nuovo.

"Tom," ha detto lei, "Voglio che tu faccia questa revisione per ogni servizio AWS che utilizziamo. Archiviazione, calcolo, networking. Trova gli sprechi."

Era già tornato alla sua scrivania.

"L'ho iniziato la settimana scorsa," ha detto lui.

Nel prossimo capitolo: il livello del database ha la sua stessa versione di questa conversazione, e Aurora è la risposta che Tom non si aspettava di apprezzare.
