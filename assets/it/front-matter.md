\newpage

*Copyright © 2026 AI(2)M(2)IA*

*Tutti i diritti riservati. Nessuna parte di questa pubblicazione può essere riprodotta, distribuita o trasmessa in qualsiasi forma o con qualsiasi mezzo, incluse fotocopie, registrazioni o altri metodi elettronici o meccanici, senza il previo consenso scritto dell'editore, eccetto nel caso di brevi citazioni inserite in recensioni critiche e altri usi non commerciali consentiti dalla legge sul diritto d'autore.*

*La storia di Nimbus e i suoi personaggi sono fittizi. Qualsiasi somiglianza con persone reali, vive o morte, o eventi reali è puramente casuale.*

*I servizi AWS, i modelli di prezzo, le best practice e i contenuti per l'esame descritti in questo libro si basano sulla documentazione pubblicamente disponibile alla data di pubblicazione. Amazon Web Services, AWS e i marchi correlati sono marchi di Amazon.com, Inc. o delle sue affiliate. Questo libro è una risorsa educativa indipendente e non è affiliato, approvato o sponsorizzato da Amazon Web Services.*

*I prezzi e le funzionalità dei servizi AWS cambiano frequentemente. Verificare sempre le informazioni aggiornate su aws.amazon.com prima di prendere decisioni architetturali o finanziarie.*

*L'esame AWS Solutions Architect Associate (SAA-C03) è un vero esame di certificazione. Visita aws.amazon.com/certification per registrarti.*

*Prima Edizione, 2026*

*Stampato e distribuito tramite Amazon KDP*

---

\newpage

# Una nota sul metodo

Questo libro è stato scritto con l'assistenza dell'IA e pubblicato con il nome d'arte AI(2)M(2)IA, in linea con la pratica di ogni volume su questo scaffale.

Il curriculum che stai per seguire — le sue premesse, i suoi personaggi, la forma dell'infrastruttura di Nimbus da una linea telefonica di un ristorante a un'architettura AWS di livello produttivo, i compromessi che il team fa sotto pressione e quelli che sbaglia la prima volta — sono stati scelti da un autore umano e portati avanti, servizio per servizio, attraverso una lunga collaborazione con un grande modello linguistico. La copertina è stata progettata con l'aiuto di un modello di generazione di immagini sotto la stessa direzione. L'ebook stesso è stato preparato con strumenti automatizzati.

Ciò che leggi è ciò che è stato mantenuto.

In queste pagine non c'è alcuna pretesa di paternità non assistita; non c'è nemmeno la pretesa che la macchina da sola sia l'autore. L'opera, come l'infrastruttura che descrive, è sostenuta da strati che dipendono l'uno dall'altro.

---

\newpage

*A tutti coloro che hanno aperto un browser, digitato un comando e fatto funzionare qualcosa —
e a tutti coloro che hanno aperto un browser, digitato un comando e imparato da ciò
che non ha funzionato.*

---

\newpage

# Prefazione

Probabilmente hai già provato a imparare AWS.

Forse hai aperto la documentazione e, dieci minuti dopo, ti sei ritrovato a fissare la sintassi delle policy IAM prima ancora di capire a cosa servisse IAM.

Forse hai completato un corso video e hai realizzato che non riesci ancora a spiegare dove vive effettivamente un sito web.

Forse hai evidenziato una guida all'esame, memorizzato i nomi dei servizi, e poi ti sei bloccato la prima volta che uno scenario ti chiedeva cosa avresti fatto se un database fosse andato in tilt durante l'ora di punta della cena.

Non è colpa tua.

Così viene di solito insegnato il cloud computing: prima come catalogo, poi come sistema.

Questo libro funziona diversamente.

**Non studierai AWS. Lo userai.**

Iniziamo con un ristorante che sta perdendo ordini perché la linea telefonica è occupata e non c'è un sito web.

Da lì, seguirai Maya, Tom, Priya e Leo mentre costruiscono l'infrastruttura di Nimbus una decisione alla volta. Non nell'ordine preciso che preferirebbe un programma di certificazione, ma nell'ordine caotico che i sistemi reali richiedono.

Alla fine, Nimbus gestirà 18.000 ordini al giorno: operando su più Zone di Disponibilità, recuperando automaticamente dai guasti, servendo gli utenti della Costa Ovest in millisecondi tramite una rete di distribuzione dei contenuti, elaborando ogni ordine attraverso una pipeline di analisi in tempo reale, e mantenendo i costi sotto controllo mentre l'architettura cresce insieme al business.

Ogni servizio AWS in questo libro appare nel momento in cui diventa necessario. Non perché il programma lo richieda. Perché il sistema lo richiede.

**A chi è rivolto questo libro** Se impari meglio attraverso i problemi che attraverso la documentazione, questo libro è stato scritto per te. Se stai preparando la certificazione AWS Solutions Architect Associate (SAA-C03), questo libro è anche per te: ogni dominio dell'esame è coperto, e ogni capitolo termina con Consigli per l'Esame e domande pratiche in stile SAA-C03. Se lavori già in ambito ingegneristico e vuoi capire *perché* le decisioni architetturali funzionano, non solo come si chiamano i servizi, troverai quel ragionamento in ogni pagina.

**Cosa non troverai qui** Una scorciatoia. Questo non è un manuale da studiare in fretta. È più lungo di un manuale da studiare in fretta perché capire richiede più tempo che memorizzare, ed è la comprensione che si trasferisce al tuo prossimo ruolo, al tuo prossimo sistema e all'incidente in produzione che nessuno ha documentato correttamente.

**Come leggere questo libro** Leggilo come un romanzo la prima volta. Lascia che l'architettura si riveli mentre il team incontra problemi reali e fa compromessi reali. Alla fine di ogni capitolo, fermati e usa attivamente i Consigli per l'Esame e gli esercizi: copri le risposte, ragiona tu stesso sullo scenario, e solo allora controlla cosa è successo.

Quando avrai finito, Nimbus sarà in produzione. Lo sarà anche la tua comprensione di AWS.

Iniziamo.
