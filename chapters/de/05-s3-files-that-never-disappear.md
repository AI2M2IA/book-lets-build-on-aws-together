# Kapitel 5: Der Aktenschrank, der in der Cloud lebt

Leo bemerkte, dass Nimbus hochgeladene Menüfotos direkt auf der EC2-Instance speicherte. Jedes Foto, das Kunden hochluden — die knusprige Arepa, der gegrillte Lachsteller, die perfekt angerichtete Salatschüssel — lag auf einer einzigen virtuellen Maschine.

Und wenn diese Maschine jemals neu gestartet, vergrößert oder ersetzt würde?

Weg.

"Wie viele Fotos haben Kunden bisher hochgeladen?" fragte Maya.

Leo öffnete die Konsole. "Ungefähr achthundert."

"Und was passiert mit diesen achthundert Fotos, wenn wir den Server neu starten?"

Noch eine von Leos bedeutungsvollen Pausen.

Dieses Kapitel handelt davon, wo Dateien in der Cloud eigentlich hingehören.

**Das Problem damit, Dateien "auf dem Server" zu speichern**

Wenn Sie Dateien direkt auf einer EC2-Instance speichern — in ihrem Dateisystem — binden Sie diese Dateien an den Lifecycle genau dieser Maschine.

Das erzeugt mehrere Probleme:

**Von Natur aus vergänglich.** EC2-Instances können gestoppt, terminiert, ersetzt werden. Ihre lokale Festplatte ist nicht als dauerhafter Speicher gedacht. Sie ist temporärer Arbeitsbereich.

**Single Point of Failure.** Wenn die Instance ausfällt, gehen die Dateien mit ihr. Keine Redundanz. Kein Backup. Ein schlechter Morgen und achthundert Menüfotos verschwinden.

**Nicht über Instances teilbar.** Wenn Sie einen zweiten Server hinzufügen (was Sie in Kapitel 7 tun werden), sieht er die Dateien nicht, die auf der Festplatte des ersten Servers gespeichert sind. Die beiden Server sind isoliert. Ein Nutzer, der ein Foto hochlädt, sieht es vielleicht; ein anderer Nutzer, der auf einem anderen Server landet, vielleicht nicht.

**Keine Skalierung.** EC2-Festplattenspeicher ist endlich. Wenn er voll ist, akzeptieren Sie entweder keine Uploads mehr oder versuchen unter Druck hektisch, den Speicher zu erweitern.

Es gibt ein besseres Modell. AWS hat es 2006 gebaut, und es ist immer noch einer der meistgenutzten Cloud-Services der Welt.

**Amazon S3: Die Festplatte, die online lebt**

**Amazon S3** — Simple Storage Service — ist AWS' Object-Storage-Service.

Stellen Sie es sich als Festplatte vor, die im Internet lebt. Eine unendliche Festplatte. Eine, die automatisch über mehrere Availability Zones hinweg gesichert wird, sodass der Verlust eines einzelnen Rechenzentrums Ihre Dateien nicht verliert.

Das Schlüsselkonzept in S3 ist das **Objekt**.

Ein Objekt ist jede Datei: ein Foto, ein Video, ein PDF, eine CSV, ein Backup, eine Logdatei. S3 kümmert sich nicht um Typ oder Struktur. Es speichert Bytes und gibt sie zurück, wenn Sie danach fragen.

Objekte leben in **Buckets**. Ein Bucket ist wie ein Ordner auf oberster Ebene — ein benannter Container in S3, der Ihre Objekte enthält. Jeder Bucket hat einen global eindeutigen Namen (keine zwei Buckets über alle AWS-Konten hinweg können denselben Namen teilen) und existiert in einer bestimmten Region.

**Wie S3 funktioniert**

Das Modell ist einfach, und genau diese Einfachheit ist der Punkt.

Sie **laden** ein Objekt in einen Bucket hoch. S3 gibt ihm einen **Key** — im Grunde einen Pfadnamen wie `menus/restaurant-001/photo-arepa.jpg`. Dieser Key identifiziert das Objekt eindeutig innerhalb des Buckets.

Sie **laden** das Objekt herunter (oder rufen es ab), indem Sie Bucket-Namen und Key verwenden.

Sie können Objekte auch öffentlich zugänglich machen — das heißt, jeder mit der URL kann sie herunterladen. So liefern die meisten Websites Bilder aus: Bild in S3 speichern, öffentlich machen, URL in Ihr HTML einbetten.

Oder Sie halten Objekte privat — nur zugänglich für authentifizierte Requests. Das ist das richtige Modell für Kundendaten, Backups und alles Sensible.

S3 ist kein Dateisystem. Es gibt keine echten Ordner. Das `/` in einem Key-Namen ist nur eine Konvention — S3 behandelt den gesamten Key als flachen String. Aber es sieht wie Ordner aus, und die meisten Tools präsentieren es als Ordner, also müssen Sie sich in der Praxis nicht zu sehr um diese Unterscheidung sorgen.

**Warum S3 anders ist als eine normale Festplatte**

Drei Dinge machen S3 grundlegend anders als Dateispeicher auf einer EC2-Instance:

**Durability.** AWS entwirft S3 für 99,999999999 % (eleven nines) Durability. Das bedeutet: Wenn Sie zehn Millionen Objekte speichern, könnten Sie erwarten, aufgrund von Hardwarefehlern etwa ein Objekt alle zehntausend Jahre zu verlieren. AWS erreicht das, indem automatisch mehrere Kopien jedes Objekts über mindestens drei Availability Zones gespeichert werden.

**Availability.** S3 ist so entworfen, dass es erreichbar bleibt, selbst wenn einzelne Komponenten ausfallen. Sie verbinden sich nicht mit einem einzelnen Server — Sie verbinden sich mit einem verteilten System, das Ausfälle umgeht.

**Scale.** S3 hält im Grunde unbegrenzt viele Daten. Ein einzelner Bucket kann Billionen von Objekten enthalten. Amazon selbst nutzt S3, um Daten in einem Maßstab zu speichern, der schwer vorstellbar ist.

**Versioning: Der Undo-Button**

Das fand Maya, als sie die S3-Konsole erkundete.

S3 unterstützt **Versioning**. Wenn Sie Versioning auf einem Bucket aktivieren, behält S3 jede Version jedes Objekts — einschließlich früherer Versionen und gelöschter Versionen.

Das ist der Undo-Button für Ihre Dateien.

Ein neues Menüfoto hochgeladen, das versehentlich das alte überschreibt? Die alte Version ist noch da. Eine Datei aus Versehen gelöscht? Sie ist wiederherstellbar. Von Ransomware getroffen, die alle Dateien mit verschlüsseltem Müll überschreibt? Mit Versioning stellen Sie den Zustand vor dem Angriff wieder her.

"Wie viel kostet es, all diese Versionen zu behalten?" fragte Tom.

Sie zahlen für den Speicher jeder Version. Wenn Sie viele Versionen großer Dateien haben, summiert sich das. AWS hat **Lifecycle Policies**, die alte Versionen nach einer bestimmten Zeit automatisch löschen — wir behandeln sie in Kapitel 23, wenn wir tief in Kostenoptimierung einsteigen.

**Access Control: Public vs. Private**

Standardmäßig ist alles in S3 privat. Nur Ihr AWS-Konto kann darauf zugreifen.

Sie können einzelne Objekte öffentlich machen — so würden Sie Menübilder an Website-Besucher ausliefern. Oder Sie halten alles privat und erzeugen **pre-signed URLs**: zeitlich begrenzte Links, mit denen jemand ein bestimmtes Objekt herunterladen kann, ohne AWS-Credentials zu benötigen. Perfekt, damit ein Kunde seine Rechnung 24 Stunden lang herunterladen kann.

Priya hatte dazu sehr starke Meinungen.

"Machen Sie niemals einen ganzen Bucket öffentlich, es sei denn, Sie haben bewusst entschieden, dass jedes Objekt darin für das gesamte Internet zugänglich sein soll", sagte sie. "Der häufigste S3-Sicherheitsfehler ist, versehentlich einen Bucket offenzulegen, der sensible Daten enthält."

AWS hat inzwischen eine Einstellung "Block Public Access", die Sie auf Account-Ebene anwenden können und die alle Buckets privat erzwingt, sofern Sie sie nicht explizit pro Bucket überschreiben.

Aktivieren. Immer.

**S3 Storage Classes: Nicht alle Daten sind gleich**

Nicht alle Daten werden gleich häufig abgerufen.

Ihre beliebtesten Menüfotos werden Dutzende Male pro Sekunde abgerufen. Ihre Logs von vor drei Jahren werden vielleicht einmal pro Jahr gelesen, wenn überhaupt. S3 erkennt das und bietet verschiedene **Storage Classes** mit unterschiedlichen Performance- und Kostentrade-offs.

| Storage Class           | Use Case                                      | Retrieval        | Cost                        |
|-------------------------|-----------------------------------------------|------------------|-----------------------------|
| S3 Standard             | Häufig abgerufene Daten                       | Immediate        | Höher pro GB                |
| S3 Standard-IA          | Selten abgerufen, aber schnelle Retrieval nötig | Immediate      | Niedriger pro GB, Retrieval Fee |
| S3 Glacier Instant      | Archive, die gelegentlich abgerufen werden    | Immediate        | Deutlich niedriger          |
| S3 Glacier Flexible     | Archive, die selten abgerufen werden          | Minuten bis Stunden | Sehr niedrig              |
| S3 Glacier Deep Archive | Compliance-Archive, fast nie abgerufen        | Bis zu 12 Stunden | Am niedrigsten             |

Wir gehen in Kapitel 23 tiefer darauf ein. Für jetzt: Das Konzept ist, dass Sie Objekte automatisch zwischen Storage Classes bewegen können, basierend auf Alter und Zugriffsmustern, und dadurch bei Daten, die Sie selten anfassen, deutlich Geld sparen.

## Strengths and Limitations

**Warum S3 hervorragend ist**:

- Eleven-nines Durability. Ihre Daten sind in S3 sicherer als auf fast jedem anderen System.
- Unbegrenzte Skalierung. Sie müssen Speicher nie provisionieren — er wächst einfach.
- Extrem günstig für das, was es bietet (Bruchteile eines Cents pro GB pro Monat).
- Native Integration mit fast jedem anderen AWS-Service.
- Unterstützt static website hosting — Sie können eine komplette statische Website direkt aus S3 ausliefern, ohne Server.

**Wo S3 nicht die richtige Wahl ist**:

- S3 ist kein Dateisystem. Wenn Ihre Anwendung ein Laufwerk mounten und wie eine lokale Festplatte verwenden muss (Dateien in place lesen, schreiben, verändern), ist S3 das falsche Tool. Verwenden Sie EFS (Elastic File System, Kapitel 6) oder EBS.
- S3 hat eine Latenz, die spürbar höher ist als bei einer lokalen Festplatte. Für Datenbanken oder Anwendungen, die schnellen Random-Access-I/O benötigen, ist Block Storage (EBS, Kapitel 6) passend.
- Große Datentransfers in S3 hinein sind kostenlos. Große Datentransfers *aus* S3 heraus kosten Geld. Das ist eine häufige Billing-Überraschung — wir behandeln sie in Kapitel 30.

## Summary

- **Amazon S3** ist Object Storage — ein Ort, um Dateien (Objekte genannt) in benannten Containern (Buckets genannt) zu speichern.
- S3 ist für eleven-nines Durability entworfen, indem automatisch Kopien jedes Objekts über mindestens drei Availability Zones gespeichert werden.
- Dateien, die auf EC2-Instances gespeichert werden, sind an den Lifecycle dieser Instance gebunden. Wichtige Dateien gehören in S3, nicht auf den Server.
- **Versioning** bewahrt frühere Versionen von Objekten — Ihr Undo-Button.
- Standardmäßig ist S3 privat. Aktivieren Sie "Block Public Access" auf Account-Ebene.
- S3 hat mehrere **Storage Classes** für unterschiedliche Zugriffsmuster und Kosten. Infrequent-access-Klassen sind viel günstiger, berechnen aber Retrieval Fees.

## Exam Tips

*SAA-C03 Domain 3 — Task 3.1 (high-performing storage solutions)*

- **S3 ist Object Storage, nicht Block Storage.** Wenn ein Exam-Szenario ein Dateisystem braucht, das mehrere Server mounten können, ist das EFS. Wenn es eine Festplatte für eine einzelne EC2-Instance braucht, ist das EBS. Wenn es Dateien, Backups, Bilder oder Daten speichern muss, die via HTTP abgerufen werden — das ist S3.
- **Eleven-nines Durability** bedeutet, dass S3 Daten automatisch über mehrere AZs repliziert. Sie konfigurieren das nicht — es ist der Default.
- **S3 ist regional**, aber global erreichbar. Buckets existieren in einer bestimmten Region, aber Sie können von überall darauf zugreifen.
- **Pre-signed URLs** erlauben zeitlich begrenzten Zugriff auf private Objekte. Häufiges Pattern: Ihre Anwendung erzeugt eine pre-signed URL, die 15 Minuten gültig ist, gibt sie dem Nutzer, und der Nutzer lädt die Datei direkt aus S3 herunter.
- **S3 Standard-IA** hat eine Mindest-Speicherdauergebühr (30 Tage). Nutzen Sie es nicht für Daten, die Sie schnell löschen werden. Das Exam testet, ob Sie die Trade-offs zwischen Storage Classes kennen.
- **Storage-class decision tree**: *häufig abgerufen* → S3 Standard; *selten abgerufen, aber schnelle Retrieval nötig* → S3 Standard-IA; *Archiv gelegentlich abgerufen* → S3 Glacier Instant Retrieval; *Archiv selten abgerufen* → S3 Glacier Flexible Retrieval; *Compliance-Archiv, fast nie abgerufen* → S3 Glacier Deep Archive. Wenn ein Szenario "cost optimization" und "infrequent access" erwähnt, ist Standard-IA fast immer die Antwort. Wenn es "compliance" oder "seven-year retention" erwähnt, denken Sie an Glacier Deep Archive.

## Exercises

**Exercise 1 — Recall**

In Ihren eigenen Worten: Was ist ein S3 object? Was ist ein S3 bucket? Warum ist das Speichern von Dateien in S3 besser, als sie auf der lokalen Festplatte einer EC2-Instance zu speichern?

*(Hint: Denken Sie daran, was mit Dateien auf einer EC2-Instance passiert, wenn die Instance terminiert wird. Was macht S3 anders?)*

**Exercise 2 — Exam Practice**

*Scenario*: Ein Medienunternehmen produziert Dokumentarvideos. Es muss originales 4K-Footage speichern (während der Produktion häufig abgerufen), bearbeitete Final Cuts (monatlich für Distribution abgerufen) und Archive Masters (unbegrenzt aufbewahrt, aber höchstens einmal pro Jahr aus Compliance-Gründen abgerufen). Es möchte Speicherkosten minimieren und gleichzeitig die Zugriffserfordernisse jeder Ebene erfüllen.

Welche Storage-Strategie erfüllt diese Anforderungen am BESTEN?

A) Alle Inhalte in S3 Standard speichern, für konsistente Performance und Einfachheit  
B) Original-Footage in S3 Standard speichern, Final Cuts in S3 Standard-IA und Archive in S3 Glacier Deep Archive  
C) Alle Inhalte auf EC2 Instance Storage speichern, für schnellsten Zugriff  
D) Alle Inhalte in S3 Glacier Deep Archive speichern, um Kosten zu minimieren

**Hint 1**: Unterschiedliche Dateien haben unterschiedliche Zugriffsmuster. S3 bietet verschiedene Storage Classes für unterschiedliche Zugriffshäufigkeiten. Welche Klasse passt zu "häufig abgerufen"?

**Hint 2**: Archive, die "höchstens einmal pro Jahr" abgerufen werden, brauchen keine sofortige Retrieval. Welche Storage Class ist für langfristige Archivierung zu minimalen Kosten entworfen?

**Hint 3**: Ordnen Sie die Zugriffshäufigkeit jeder Ebene der passenden Storage Class zu. Häufig abgerufen = Standard. Monatlich = Standard-IA. Einmal pro Jahr = Glacier Deep Archive.

**Answer**: B

**Explanation**: Diese Strategie ordnet jede Datenebene der passenden S3 Storage Class zu. Häufig abgerufenes Original-Footage bleibt in Standard für sofortigen Zugriff ohne Retrieval Fees. Monatlich abgerufene Final Cuts gehen nach Standard-IA (niedrigere Speicherkosten, akzeptable Retrieval Fee). Archive, die jährlich abgerufen werden, gehen nach Glacier Deep Archive für die niedrigstmöglichen Speicherkosten.

**Why not A?** Alles in Standard zu speichern ist einfach, aber teuer. Sie zahlen Premiumpreise für Archiv-Inhalte, die Sie selten abrufen.

**Why not C?** EC2 Instance Storage ist vergänglich und nicht für langfristige Medienspeicherung geeignet. Wenn die Instance terminiert wird, gehen alle Inhalte verloren.

**Why not D?** Glacier Deep Archive hat Retrieval-Zeiten von bis zu 12 Stunden. Häufig abgerufenes Produktions-Footage dort zu speichern würde Produktionsarbeit unmöglich machen.

*SAA-C03 Domain 3 — Task 3.1 / Domain 4 — Task 4.1*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus speichert kundenseitig hochgeladene Bestellfotos in S3. Eine Datenschutzregel verlangt, dass Kundenfotos 7 Jahre lang gespeichert werden müssen, danach aber gelöscht werden können. Das Team möchte außerdem die Kosten für die Speicherung alter Fotos aus früheren Jahren minimieren.

Entwerfen Sie eine S3-Storage-Strategie für diese Anforderung. Welche Storage Classes würden Sie verwenden, und wann würden Sie zwischen ihnen transitionieren? Was würden Sie bezüglich der Löschanforderung tun?

*(Hint: Denken Sie an Lifecycle Policies. Es gibt keine einzelne richtige Antwort — reason through den Trade-off zwischen Kosten und Retrieval-Zeit.)*

## Post-Credits Scene

Leo migrierte die Menüfotos an diesem Nachmittag nach S3. Achthundert Objekte, sicher über drei Availability Zones gespeichert, mit aktiviertem Versioning.

"Sie sind jetzt tatsächlich sicherer als vorher", sagte er mit einiger Zufriedenheit.

"Sie waren in S3 immer sicherer", sagte Priya. "Wir haben nur gewartet, bis wir das Problem gebaut hatten, um es zu beheben."

Leo akzeptierte das.

Am nächsten Morgen kam Tom mit einem Ausdruck herein. Die AWS-Rechnung, mit rotem Stift annotiert.

"Wir haben ein Datenbankproblem", sagte er. "Wir betreiben unsere Bestelldatenbank auf derselben EC2-Instance wie den Webserver. Und unsere Menü-Datenbank. Und unsere Kundendaten."

Er hielt inne.

"Alles ist auf derselben Maschine. Eine Maschine. All unsere Daten."

Maya sah den Ausdruck an. Dann Tom. Dann die Decke.

"Und wenn diese Maschine kaputtgeht?"

Tom zeigte auf die rote Anmerkung.

Im nächsten Kapitel: der Unterschied zwischen einer Festplatte, die Sie mieten, und einem Aktenschrank, den das ganze Büro teilt.
