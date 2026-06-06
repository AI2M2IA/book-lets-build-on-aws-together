# Kapitel 23: Das Ablagesystem, das sich selbst sortiert

Eine Anwaltskanzlei bewahrt aktive Fallakten auf dem Schreibtisch auf. Abgeschlossene Fälle wandern in einen Aktenschrank. Fälle von vor drei Jahren wandern in Aufbewahrungsboxen im Keller. Fälle von vor zehn Jahren wandern in eine externe Archivierungsanlage, die Cents pro Box kostet, aber zwei Tage braucht, um irgendetwas daraus abzurufen.

Dieselben Informationen, zu unterschiedlichen Kosten gespeichert, basierend darauf, wie oft darauf zugegriffen wird.

---

Mit der Workflow-Automatisierung an ihrem Platz und dem endlich stabilen Bestellfluss war Tom zu seiner Kostenüberprüfung zurückgekehrt. Die S3-Rechnung hatte ihm seit dem vorherigen Quartal im Hinterkopf gesteckt – einer jener Posten, die immer weiter wuchsen, ohne dass jemand direkt hinsah. Endlich hatte er Zeit hinzusehen.

Er rief Leo herbei.

„Wir haben 4,2 Terabyte in S3“, sagte Leo nach der Überprüfung.

„Wovon?“

„Restaurantfotos. Bestellbelege. Analyse-Exporte. Backup-Snapshots von vor 18 Monaten.“

„Wann hat zuletzt jemand auf ein Backup von vor 18 Monaten zugegriffen?“

Leo überprüfte die Zugriffsprotokolle.

„Letzten Oktober“, sagte er. „Einmal. Um das Backup-Format zu verifizieren.“

„Wir bezahlen also für 18 Monate Backups zum vollen S3-Standard-Preis.“

„Ja.“

„Wie viel kostet das pro Monat – Glacier vs. Standard?“ fragte Tom und rief bereits die Preisseite auf.

S3 Standard: 0,023 $ pro GB pro Monat. S3 Glacier Instant Retrieval: 0,004 $ pro GB pro Monat.

Tom rechnete.

„Wir könnten diese Rechnung erheblich reduzieren“, sagte er, „einfach indem wir alte Daten in günstigeren Speicher verschieben.“

„Wir müssten wissen, was alt ist“, sagte Leo.

„S3 weiß es. Es verfolgt die Zeit des letzten Zugriffs.“

**S3-Speicherklassen: Das vollständige Spektrum**

Kapitel 5 stellte S3 Standard als die primäre Speicherklasse vor. S3 hat tatsächlich acht Speicherklassen, jede für unterschiedliche Zugriffsmuster ausgelegt (die achte, **S3 Express One Zone**, ist eine spezialisierte Single-AZ-Klasse für latenzkritische Workloads und erscheint selten außerhalb von Hochleistungsszenarien):

**S3 Standard**: Für häufig aufgerufene Daten. Niedrige Latenz (Millisekunden). Höchste Kosten. Keine Mindestspeicherdauer. Für aktive Daten verwenden: die aktuellen Menüfotos, die heutigen Bestellungen, neuere Logs.

**S3 Standard-Infrequent Access (S3 Standard-IA)**: Für Daten, auf die seltener als einmal im Monat zugegriffen wird. Gleicher Millisekunden-Abruf wie Standard, aber niedrigere Speicherkosten + Abrufgebühr pro GB. 30 Tage Mindestspeicherdauer. Für Daten verwenden, die man sofort braucht, wenn man darauf zugreift, was aber selten passiert: ältere Bestellbelege, 6 Monate alte Analyse-Exporte.

**S3 One Zone-Infrequent Access (S3 One Zone-IA)**: Wie S3 Standard-IA (einschließlich des 30-Tage-Minimums), aber nur in einer Availability Zone gespeichert (statt drei). Weniger langlebig (wenn diese AZ eine Katastrophe hat, können Daten verloren gehen), aber 20 % günstiger. Für Daten verwenden, die bei Verlust neu erstellt werden können: Thumbnail-Cache, temporäre Verarbeitungsausgaben.

**S3 Glacier Instant Retrieval**: Archivierte Daten, die man gelegentlich braucht. Millisekunden-Abruf. Sehr niedrige Speicherkosten, höhere Abrufkosten pro GB. 90 Tage Mindestspeicherdauer. Für Daten verwenden, auf die einmal pro Quartal oder seltener zugegriffen wird: vierteljährliche Compliance-Berichte, 12 Monate alte Backup-Snapshots.

**S3 Glacier Flexible Retrieval**: Tiefarchiv, abgerufen in Minuten bis Stunden. Niedrigere Kosten als Glacier Instant Retrieval. Für Archivdaten mit weniger Dringlichkeit verwenden.

**S3 Glacier Deep Archive**: Günstigste Option. Abruf in 12 Stunden. 180 Tage Mindestspeicherdauer. Für Daten verwenden, die aus regulatorischen Compliance-Gründen aufbewahrt werden müssen, von denen aber nie erwartet wird, dass darauf zugegriffen wird: 7-jährige Steuerunterlagen, 10-jährige Audit-Logs.

Das Muster: Mit abnehmender Zugriffsfrequenz sinken die Kosten, aber die Abrufzeit steigt (und die Kosten pro Abruf steigen). Wählen Sie die Klasse, die zu Ihrem Zugriffsmuster passt.

**S3-Lifecycle-Richtlinien: Das automatisierte Ablagesystem**

Dateien manuell zwischen Speicherklassen zu verschieben, ist fehleranfällig und zeitaufwändig. S3-**Lifecycle-Richtlinien** automatisieren dies basierend auf Regeln, die Sie definieren.

Eine Lifecycle-Regel hat zwei Komponenten:

**Filter**: Auf welche Objekte die Regel zutrifft (alle Objekte, Objekte mit einem bestimmten Präfix, Objekte mit bestimmten Tags).

**Aktionen**: Was nach wie vielen Tagen zu tun ist.

Beispiel-Lifecycle-Richtlinie für Nimbus' Bestellbelege:

```
Übergang zu S3 Standard-IA nach 90 Tagen
Übergang zu S3 Glacier Instant Retrieval nach 365 Tagen
Übergang zu S3 Glacier Flexible Retrieval nach 540 Tagen (18 Monate)
Übergang zu S3 Glacier Deep Archive nach 2555 Tagen (7 Jahre)
Löschen nach 2920 Tagen (8 Jahre)
```

Diese einzige Richtlinie stellt sicher:

- Aktive Belege (< 90 Tage): S3 Standard, schneller Zugriff
- Neuere Belege (90–365 Tage): Standard-IA, günstig, aber sofort verfügbar
- Ältere Belege (1 Jahr bis 18 Monate): Glacier Instant, sehr günstig, Millisekunden bei Bedarf
- Historische Belege (18 Monate bis 7 Jahre): Glacier Flexible, noch günstiger – der Abruf dauert Stunden, nicht Millisekunden
- Abgelaufene Belege (> 8 Jahre): automatisch gelöscht

Ein Haken hätte den Plan beinahe zum Scheitern gebracht. Seit Ende 2024 **transitionieren Lifecycle-Regeln Objekte, die kleiner als 128 KB sind, standardmäßig nicht** – und Nimbus' Belege waren im Schnitt 18 KB groß. Damit die Richtlinie sie tatsächlich verschiebt, musste Leo die standardmäßige Mindestobjektgröße auf der Regel überschreiben (Lifecycle-Filter können auch nach Größe mit `ObjectSizeGreaterThan`/`ObjectSizeLessThan` auswählen). Der Standard existiert aus gutem Grund: Archivklassen berechnen pro Objekt ~40 KB Metadaten-Overhead und jeder Übergang kostet eine Request-Gebühr, sodass der Übergang für Millionen winziger Objekte mehr kosten kann, als er spart. Leo rechnete für die Belege durch – bei sieben Jahren Aufbewahrung lohnte es sich trotzdem.

Tom überprüfte die prognostizierten Einsparungen: von 847 $/Monat auf etwa 220 $/Monat.

„Nur indem man... definiert, was alt ist und wohin es soll?“ sagte er.

„Und S3 verschiebt es automatisch“, bestätigte Leo. „Kein Cron-Job. Keine manuelle Migration. Kein Vergessen.“

„Moment – aber *warum* macht S3 das nicht einfach standardmäßig?“ fragte Maya quer durch den Raum. „Warum muss man überhaupt eine Richtlinie definieren?“

„Weil ‚alt‘ für jeden Bucket anders ist“, sagte Leo. „Ein Compliance-Archiv und ein Foto-Upload brauchen völlig unterschiedliche Aufbewahrungsregeln. S3 kann nicht erraten, was was ist.“

Sie fragen sich vielleicht: Was passiert, wenn die falschen Daten nach Glacier verschoben werden und Sie sie dringend brauchen? Sie würden eine Abrufgebühr zahlen und warten – weshalb Sie Ihre Lifecycle-Regeln zuerst an einem kleinen, unkritischen Bucket testen und die Zugriffsprotokolle verifizieren sollten, bevor Sie sie auf Produktionsdaten ausrollen. Ein Abruffehler bei 18 Monaten Backups würde weit weniger kosten als ein kundenseitiger Vorfall, aber es lohnt sich trotzdem, zuerst zu testen.

Wenn das Zugriffsmuster Ihrer Daten vorhersehbar ist (Logs sind nach 30 Tagen immer kalt), verwenden Sie explizite Lifecycle-Regeln – sie sind kosteneffizienter als die Überwachungsgebühr pro Objekt von Intelligent-Tiering. Wenn sich Ihre Zugriffsmuster im Lauf der Zeit ändern oder schwer vorherzusagen sind, verwenden Sie Intelligent-Tiering – aber seien Sie sich bewusst, dass es Objekte unter 128 KB einfach ignoriert: Sie werden nicht überwacht, es wird keine Überwachungsgebühr berechnet, und sie verlassen die Frequent-Access-Ebene nie.

**S3 Intelligent-Tiering: Die selbstorganisierende Klasse**

Was, wenn Sie nicht wissen, wie oft Sie auf Ihre Daten zugreifen werden?

**S3 Intelligent-Tiering** überwacht die Zugriffsmuster für jedes Objekt und verschiebt es automatisch zwischen Zugriffsebenen:

- **Frequent-Access-Ebene**: Für kürzlich aufgerufene Objekte
- **Infrequent-Access-Ebene**: Objekte, auf die seit 30 Tagen nicht zugegriffen wurde
- **Archive-Instant-Access-Ebene**: Objekte, auf die seit 90 Tagen nicht zugegriffen wurde
- **Archive-Access-Ebene**: Objekte, auf die seit 90–730 Tagen nicht zugegriffen wurde (optional)
- **Deep-Archive-Access-Ebene**: Objekte, auf die seit 180–730+ Tagen nicht zugegriffen wurde (optional)

S3 Intelligent-Tiering berechnet eine kleine Überwachungsgebühr pro Objekt pro Monat (0,0025 $ pro 1.000 Objekte), aber keine Abrufgebühr für die Frequent- und Infrequent-Ebenen.

Intelligent-Tiering verwenden, wenn:

- Zugriffsmuster unvorhersehbar sind oder sich im Lauf der Zeit ändern
- Sie eine Mischung aus heißen und kalten Daten haben, die Sie nicht leicht klassifizieren können
- Sie Objekte größer als 128 KB haben (kleinere Objekte werden überhaupt nicht überwacht oder automatisch getiered)

Explizite Speicherklassen (mit Lifecycle-Richtlinien) verwenden, wenn:

- Zugriffsmuster vorhersehbar sind
- Sie wollen, dass jedes Objekt – auch kleine – tatsächlich in günstigere Klassen verschoben wird
- Objekte klein sind (< 128 KB)

Der Kleindatei-Vorbehalt verdient Betonung. Nimbus hatte 2,3 Millionen Bestellbeleg-Objekte in S3 – jedes war eine kleine JSON-Datei, im Schnitt etwa 18 KB. Tom hatte zunächst Intelligent-Tiering für den Belege-Bucket in Betracht gezogen, bis er das Kleingedruckte las.

Objekte kleiner als 128 KB werden in Intelligent-Tiering **nicht überwacht und nicht automatisch getiered**. Sie zahlen keine Überwachungsgebühr (0,0025 $ pro 1.000 Objekte pro Monat) – aber sie bewegen sich auch nie: Sie sitzen für immer in der Frequent-Access-Ebene, zu Standard-äquivalenten Preisen.

Für die 18-KB-Belege hätte Intelligent-Tiering Nimbus also nichts zusätzlich gekostet – es hätte einfach nichts *getan*. 2,3 Millionen kalte Belege hätten unbegrenzt weiter Hot-Storage-Preise gezahlt (0,023 $/GB), während die Archive-Ebenen (0,00099 $/GB) außer Reichweite blieben.

„Intelligent-Tiering ist also für große Objekte ausgelegt“, sagte Maya.

„Oder für Workloads, bei denen man das Zugriffsmuster wirklich nicht kennt“, sagte Tom. „Für einen Bucket mit winzigen Dateien, bei dem wir wissen, dass die Belege 90 Tage heiß und danach kalt sind, ist eine explizite Lifecycle-Regel – mit der Kleinobjekt-Überschreibung von vorhin – das Einzige, was sie tatsächlich verschiebt.“

Intelligent-Tiering ist ein ausgezeichneter Dienst. Es ist nur nicht das richtige Werkzeug für jeden Bucket: unterhalb der 128-KB-Schwelle ist es harmlos, aber nutzlos, und nur explizite Lifecycle-Regeln (mit einer Größenüberschreibung) tieren kleine Objekte.

**Wenn Sie die Daten tatsächlich zurückbrauchen: Eine Glacier-Abrufgeschichte**

Drei Monate nachdem die Lifecycle-Richtlinien deployed waren, erhielt Nimbus eine rechtliche Mitteilung. Ein ehemaliger Restaurantpartner bestritt eine Vertragsklausel, und Nimbus' Anwälte brauchten 18 Monate Bestelldatensätze für diesen Partner – alles von der Eröffnung bis zur Vertragskündigung.

„Und was, wenn jemand über den Rechts-Discovery-Prozess einzubrechen versucht?“ sagte Priya. Sie scherzte nicht. „Anwälte, die Massendatenexporte anfordern, sind ein häufiger Social-Engineering-Vektor. Verifizieren Sie, dass die Anfrage legitim ist, bevor Sie irgendeinen Datenspeicher öffnen.“

Die Anfrage war legitim. Die Datensätze lagen in S3, über drei Speicherklassen verteilt: die jüngsten 90 Tage in Standard-IA, das vorhergehende Jahr in Glacier Instant Retrieval, der Rest in Glacier Flexible Retrieval (die Lifecycle-Richtlinie hatte Flexible für Daten verwendet, die älter als 18 Monate waren).

Die Glacier-Instant-Datensätze waren sofort verfügbar. Leo filterte nach Restaurant-ID, führte eine Athena-Abfrage aus, um die passenden Bestelldatensätze zu identifizieren, und exportierte sie an einen sicheren S3-Speicherort. Fünf Minuten Arbeit.

Die Glacier-Flexible-Datensätze erforderten eine Restore-Anfrage:

```bash
aws s3api restore-object \
    --bucket nimbus-order-receipts \
    --key "2022/06/restaurant-47/" \
    --restore-request '{"Days":7,"GlacierJobParameters":{"Tier":"Standard"}}'
```

Glacier Flexible Retrieval **Standard-Tier**: 3–5 Stunden. Die Datensätze würden 7 Tage lang als temporäre Kopie in S3 Standard verfügbar sein, dann automatisch entfernt. Die ursprüngliche archivierte Kopie bleibt in Glacier.

Kosten des gesamten Abrufs: 0,01 $ pro abgerufenem GB im Standard-Tier, für 4,2 GB archivierter Datensätze. Etwa vier Cent. (Das Expedited-Tier – 1 bis 5 Minuten – kostet 0,03 $ pro GB, aber seine Verfügbarkeit ist nicht so garantiert wie die von Standard.)

„Vier Cent“, sagte Maya, als Leo Bericht erstattete. „Für 18 Monate Datensätze.“

„Wir haben 4,2 GB zu 0,0036 $ pro GB pro Monat anderthalb Jahre lang gespeichert“, sagte Leo. „Die Speicherkosten betrugen insgesamt etwa siebenundzwanzig Cent. Die Abrufkosten waren vier. Gegenüber einem Dollar vierundsiebzig, wenn wir es 18 Monate lang in S3 Standard behalten hätten.“

„Und das Einzige, was zählte“, sagte Priya, „war, dass wir uns daran erinnerten, dass es in Flexible Retrieval lag, und die 3–5-Stunden-Wartezeit eingeplant hatten. Wenn die Anwälte das in 30 Minuten gebraucht hätten, hätten wir ein Problem gehabt.“

Das ist die wichtige operative Lektion über Glacier: Es ist nicht nur eine Kostenentscheidung, es ist eine Abruf-SLA-Entscheidung. Bevor Sie Daten in Glacier Flexible oder Deep Archive archivieren, dokumentieren Sie die Abrufzeit für jeden, der sie brauchen könnte. „Die Daten existieren“ und „wir können sie in 30 Minuten bekommen“ sind zwei verschiedene Garantien.

**Multipart-Upload: Für große Objekte**

S3 hat ein Limit von 5 GB für einen einzelnen Upload. Für größere Objekte müssen Sie **Multipart-Upload** verwenden: das Objekt in Teile aufteilen, jeden parallel hochladen, und S3 setzt sie zusammen.

Vorteile:

- Schnellere Uploads (parallel)
- Kann fehlgeschlagene Uploads fortsetzen (nur fehlgeschlagene Teile erneut hochladen)
- Erforderlich für Objekte > 5 GB

Lifecycle-Regel-Tipp: Richten Sie eine Lifecycle-Regel ein, um unvollständige Multipart-Uploads nach 7 Tagen zu löschen. Wenn ein Upload auf halbem Weg fehlschlägt und nicht bereinigt wird, werden diese Teilstücke gespeichert und berechnet – ohne ein zusammengesetztes Objekt, das man vorzeigen könnte.

Tom schätzte diesen Tipp enorm.

Er führte den AWS-CLI-Befehl aus, um unvollständige Multipart-Uploads über alle Nimbus-Buckets aufzulisten:

```bash
aws s3api list-multipart-uploads --bucket nimbus-restaurant-photos
```

Die Ausgabe war länger als erwartet. Er leitete sie in einen Zähler.

340 unvollständige Uploads. Der älteste war von vor 8 Monaten – Leos Lasttest des Restaurant-Foto-Upload-Flows. Der Lasttest hatte Hunderte von Teil-Uploads erzeugt, von denen keiner abgeschlossen worden war (der Test war nicht darauf ausgelegt, sie abzuschließen, nur den Initiierungsendpunkt zu testen). 340 unvollständige Uploads, die in S3 saßen, jeder repräsentierte Teildaten, die AWS speicherte und berechnete.

„Wie viel kostet das pro Monat?“ sagte Tom. Er fragte nicht nach Information. Er rechnete laut.

Die kombinierte Größe der unvollständigen Teile: 48 GB. Bei 0,023 $/GB: 1,10 $/Monat. Für acht Monate: bereits 8,80 $ ausgegeben.

Bei der aktuellen Wachstumsrate, falls nicht bereinigt: unbegrenzt fortlaufend.

„Leo“, sagte Tom.

„Ich habe es schon deployed – oh“, sagte Leo und kam herüber. „Der Lasttest. Ich habe vergessen, die Teil-Uploads zu bereinigen.“

„Vor acht Monaten.“

„Ich wusste nicht, dass S3 die Teile speichert, selbst wenn der Upload nie abgeschlossen wird.“

„Es speichert sie. Es berechnet sie. Und es gibt kein Dashboard, das dich davor warnt. Sie sammeln sich einfach an.“

Die Lösung: eine Lifecycle-Regel, um unvollständige Multipart-Upload-Teile nach 7 Tagen zu löschen.

```
Regel: Unvollständige Multipart-Upload-Teile löschen
Präfix: (alle Objekte)
Aktion: Unvollständige Multipart-Uploads nach 7 Tagen löschen
```

Die bestehenden 340 Uploads wurden manuell bereinigt. Die Lifecycle-Regel stellt sicher, dass sich keine zukünftigen Lasttests oder fehlgeschlagenen Uploads auf dieselbe Weise ansammeln. Die 1,10 $/Monat, die sich acht Monate lang leise aufgebaut hatten, hörten auf – klein in Dollar, aber das Muster (unsichtbar, wachsend, ungedeckelt) war der Teil, den es zu beseitigen galt.

„Die Regel ist drei Zeilen“, sagte Tom. „Ich hätte sie bei der Erstellung auf jedem Bucket setzen sollen.“ Er aktualisierte die Checkliste zur Bucket-Erstellung: Jeder neue S3-Bucket bekommt standardmäßig eine Multipart-Upload-Bereinigungsregel.

**Drei Sicherheitsschichten: Eine kurze Wiederholung vor dem Abstecher**

„Und was, wenn jemand einzubrechen und die Audit-Logs zu löschen versucht?“ fragte Priya erneut – diesmal im Kontext eines spezifischen Bedrohungsmodells. „Nicht nur eine falsch konfigurierte Lifecycle-Regel. Ein böswilliger Insider. Ein kompromittierter IAM-Schlüssel mit Schreibzugriff.“

Das Team hatte die Antworten bereits – sie hatten sie nur noch nicht auf diesen Bucket angewendet. Drei Schichten, jede früher im Buch behandelt, jede einen anderen Bedrohungsvektor adressierend:

**Versionierung** (Kapitel 5) macht Löschungen umkehrbar – ein DELETE wird zu einer Löschmarkierung, und die vorherigen Versionen bleiben wiederherstellbar. Für Write-once-Daten wie Bestellbelege ist der Speicher-Overhead minimal: Es gibt immer nur eine Version pro Objekt.

**S3 Object Lock** (Kapitel 5) macht Objekte wirklich unveränderlich – WORM-Speicher, den selbst ein Admin-Schlüssel während des Aufbewahrungszeitraums nicht löschen kann. Für die Belege, mit ihrer 7-jährigen Steueraufbewahrungspflicht, wählte das Team den Compliance-Modus: Keine Lifecycle-Fehlkonfiguration, kein IAM-Fehler, keine kompromittierte Anmeldedaten können sie entfernen, bevor der Prüfer danach fragt. Und Object Lock koexistiert mit Lifecycle-Übergängen – eine Regel, die die Belege nach Glacier Deep Archive verschiebt, funktioniert weiterhin; die Daten werden günstiger und bleiben unveränderlich.

**CloudTrail-S3-Datenereignisse** (Kapitel 16–17) sagen Ihnen, was mit den Daten passiert ist: jedes GET, PUT, DELETE und COPY protokolliert mit wer, von wo und wann – das Rohmaterial, das GuardDuty (Kapitel 17) verwendet, um auf Anomalien aufmerksam zu machen.

„Versionierung für die Wiederherstellung nach Unfällen. Object Lock für Compliance-Unveränderlichkeit. CloudTrail für Forensik“, fasste Priya zusammen. „Jedes davon haben wir für sich behandelt. Die neue Entscheidung heute ist, alle drei für diesen Bucket einzuschalten.“

**Cross-Region Replication: Bestelldatensätze als Disaster Recovery**

Der Nimbus-Bestellbelege-Bucket war in us-west-2. Das war beabsichtigt – us-west-2 ist dort, wo die Anwendung lief. Aber „die Anwendung ist in us-west-2“ und „alle Bestelldatensätze sind nur in us-west-2“ sind unterschiedliche Risikoprofile.

Wenn Nimbus einen Disaster-Recovery-Standort in us-east-1 aktivieren müsste, müssten die Bestelldatensätze auch dort sein. Sie mitten in einem regionalen Ausfall kopieren zu wollen, ist kein Wiederherstellungsplan.

Priya empfahl **Cross-Region Replication (CRR)** für den Bestellbelege-Bucket. Die Regel:

```
Quelle: nimbus-order-receipts (us-west-2)
Ziel: nimbus-order-receipts-dr (us-east-1)
Replikation: Alle Objekte
Speicherklasse im Ziel: S3 Standard-IA (günstiger – das ist die DR-Kopie, selten aufgerufen)
```

Die Mechanik war aus Kapitel 5 vertraut: asynchrone Replikation neuer Schreibvorgänge (die meisten Objekte innerhalb von 15 Minuten; eine garantierte SLA erfordert, für **S3 Replication Time Control** zu zahlen), Versionierung auf beiden Buckets erforderlich, eine IAM-Rolle mit Lese-Quelle/Schreibe-Ziel-Berechtigung. Das beachtenswerte Detail in der obigen Regel: Das Ziel verwendet eine *andere Speicherklasse* als die Quelle – Standard-IA für die DR-Kopie, statt für eine zweite Standard-Kopie zu zahlen, die selten gelesen wird. Und die Versionierungs-Voraussetzung kostete nichts extra – sie aktivierten die Versionierung ohnehin bereits für die Unfallwiederherstellung. (CRRs Geschwister, **Same-Region Replication (SRR)**, kopiert Objekte zwischen Buckets in *derselben* Region – nützlich für eine Compliance-Kopie in einem separaten Konto, Log-Aggregation oder Testumgebungen, die mit Produktionsdaten befüllt werden.)

Einen Stolperstein nannte Priya, bevor jemand darüber fiel: Replikation ist **nicht rückwirkend**. Objekte, die bereits im Bucket existieren, wenn Sie die Regel aktivieren, werden nicht repliziert – nur neue Schreibvorgänge. Teams aktivieren CRR in der Erwartung, dass all ihre bestehenden Daten im Ziel erscheinen, und entdecken dann, dass der DR-Bucket fast leer ist. Für bereits vorhandene Objekte führen Sie **S3 Batch Replication** aus, eine separate Operation, die die Replikationsregeln auf bereits vorhandene Objekte anwendet. Nimbus führte sie einmal aus, um den DR-Bucket mit den bestehenden 0,8 TB Belegen zu befüllen.

„Und Löschmarkierungen?“ fragte Priya. „Wenn jemand einen Beleg in us-west-2 löscht, repliziert es die Löschung nach us-east-1?“

Standardmäßig nein – in aktuellen Replikationskonfigurationen (dem V2-Schema, das die Konsole erstellt) werden **Löschmarkierungen nicht repliziert**. Jemand löscht einen Beleg in us-west-2, und die us-east-1-Kopie bedient ihn weiter, als wäre nichts passiert. Wenn Sie *wollen*, dass der DR-Bucket Löschungen spiegelt, aktivieren Sie die Löschmarkierungs-Replikation explizit auf der Regel (nicht unterstützt bei Regeln mit Tag-Filtern) – das war der Standard im alten V1-Schema, das ältere Materialien noch beschreiben. So oder so replizieren Lifecycle-Ablaufungen ihre Löschmarkierungen nie.

Replikation ist jedoch *keine* Backup-Lösung – aus den entgegengesetzten Gründen: Sie schützt nicht vor permanenten Versionslöschungen oder böswilligen Überschreibungen, die zur Spiegelkopie replizieren, und sie hat keine Aufbewahrungssemantik. Für echtes Backup kombinieren Sie Versionierung mit Object Lock oder verwenden AWS Backup.

„Wie viel kostet das pro Monat?“ fragte Tom.

Speicher für 0,8 TB in S3 Standard-IA in us-east-1: 10,00 $/Monat. Plus Replikations-Datentransfer (pro übertragenem GB regionsübergreifend berechnet): minimal bei ihrem aktuellen Schreibvolumen. Gesamte Zusatzkosten: etwa 10–11 $/Monat für eine vollständige regionsübergreifende Kopie aller Bestelldatensätze.

Tom schrieb das ohne Klagen auf.

**S3 Storage Lens: Das vollständige Bild sehen**

Tom hatte seine Prüfung manuell durchgeführt – die AWS-Konsole Bucket für Bucket geöffnet, AWS-CLI-Befehle ausgeführt, um Objekte zu zählen, den Billing Explorer auf Speicherkosten nach Bucket geprüft. Es hatte ihn fast einen ganzen Nachmittag gekostet, diese Tabelle zu erstellen.

**S3 Storage Lens** ist das AWS-Tool, das diesen manuellen Prozess ersetzt. Es bietet organisationsweite Sichtbarkeit in die S3-Nutzung und -Aktivität über alle Buckets, alle Konten und alle Regionen hinweg – in einem einzigen Dashboard.

Die für die Kostenoptimierung wichtigsten Metriken:

**Non-current Version Bytes**: Wie viel Speicher von älteren Versionen verbraucht wird (wenn Versionierung aktiviert ist). Versionierung ist für die Sicherheit unerlässlich, aber wenn ein Dokument häufig aktualisiert wird, sammeln sich ältere Versionen an. Eine Lifecycle-Regel, die nicht-aktuelle Versionen nach 30 Tagen ablaufen lässt, verhindert Versions-Bloat.

**Incomplete Multipart Upload Bytes**: Genau das Problem, das Leo mit dem Lasttest verursacht hatte, automatisch zutage gefördert. Ohne Storage Lens musste Tom wissen, dass er nach unvollständigen Multipart-Uploads suchen muss. Mit Storage Lens erscheinen sie als Posten im Dashboard.

**% Anfragen, die 403 zurückgeben**: Ein Anstieg von 403-Antworten (Forbidden) bei einem Bucket, der öffentlich zugänglich sein sollte, könnte auf eine falsch konfigurierte Bucket-Richtlinie hinweisen. Ein Anstieg bei einem privaten Bucket könnte auf einen Scan- oder Sondierungsversuch hinweisen. So oder so ist es ein Signal, das eine Untersuchung wert ist.

**Durchschnittliche Objektgröße**: Ein Bucket mit winzigen Objekten (Durchschnitt 2 KB) verhält sich anders als ein Bucket mit großen Objekten (Durchschnitt 50 MB) – in Bezug auf Intelligent-Tiering-Ökonomie, Request-Kosten und Abfrageleistung für Athena.

S3 Storage Lens hat eine kostenlose Stufe, die die wesentlichen Metriken abdeckt. Die erweiterten Metriken (Request-Statistiken, Lens-Gruppen zum Filtern) haben zusätzliche Kosten pro Million Objekte pro Monat – gering im Verhältnis zu den Einsparungen, die es ermöglicht.

„Warum haben wir das nicht von Anfang an verwendet?“ fragte Maya.

„Wir hatten von Anfang an nicht 4,2 Terabyte“, sagte Tom. „In kleiner Größenordnung funktioniert eine Tabelle. In dieser Größenordnung wird die Größenordnung selbst zum Argument für das Werkzeug.“

Das ist ein wiederkehrendes Thema in der Nimbus-Architektur: Das richtige Werkzeug für eine gegebene Größenordnung ist nicht immer das richtige Werkzeug für die nächste Größenordnung. S3 Storage Lens lohnt sich zu konfigurieren, sobald Ihre S3-Nutzung über das hinauswächst, was Sie an einem Nachmittag manuell prüfen können – was ungefähr der Punkt ist, an dem die Einsparungen, die es ermöglicht, beginnen, die Zeit, die es spart, bedeutsam zu übersteigen.

## Stärken und Grenzen

**Warum S3-Speicherebenen wichtig sind**:

- Erhebliche Kostenreduktion ohne Einbußen bei Langlebigkeit oder Verfügbarkeit für das, worauf tatsächlich zugegriffen wird
- Lifecycle-Richtlinien automatisieren den gesamten Prozess – kein operativer Aufwand
- S3 Intelligent-Tiering beseitigt die Notwendigkeit, Zugriffsmuster vorherzusagen

**Wo es kompliziert wird**:

- Mindestspeicherdauer-Gebühren gelten für Glacier-Klassen (90 Tage für Glacier Instant, 180 Tage für Deep Archive) – vorzeitiges Löschen verursacht trotzdem die Mindestgebühr
- Abrufgebühren können überraschen, wenn man häufig auf archivierte Daten zugreift
- Lifecycle-Übergänge brauchen Zeit – Objekte werden nicht sofort nach Auslösen der Regel verschoben
- Intelligent-Tiering ignoriert Objekte unter 128 KB – keine Gebühr, aber auch kein Tiering; und Lifecycle-Regeln überspringen sie standardmäßig, es sei denn, Sie überschreiben die Mindestobjektgröße

## Zusammenfassung

Die Workflow-Automatisierung aus Kapitel 22 optimierte, wie Nimbus Anfragen verarbeitet. Dieses Kapitel optimiert, was Nimbus für Daten zahlt, die es behält, aber auf die es nicht zugreift. Das Prinzip ist dasselbe: Hören Sie auf, für die falsche Ebene zu zahlen.

- S3 hat acht Speicherklassen: Standard, Standard-IA, Intelligent-Tiering, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive – plus Express One Zone (spezialisiert auf niedrige Latenz, Single AZ).
- **Lifecycle-Richtlinien** automatisieren Übergänge zwischen Speicherklassen basierend auf dem Alter – einmal definieren, S3 erledigt es für immer.
- **S3 Intelligent-Tiering** verschiebt Objekte automatisch zwischen Ebenen basierend auf tatsächlichen Zugriffsmustern – für unvorhersehbare Workloads mit Objekten größer als 128 KB verwenden. Kleinere Objekte werden nicht überwacht oder automatisch getiered (und zahlen keine Überwachungsgebühr) – sie bleiben in der Frequent-Access-Ebene.
- **Glacier-Abruf** erfordert eine Restore-Anfrage für die Flexible- und Deep-Archive-Ebenen. Planen Sie die Abrufzeit (Minuten bis 12 Stunden), bevor Sie Daten mit einer Abruf-SLA archivieren.
- **Unvollständige Multipart-Uploads** sammeln sich still an und verursachen Speichergebühren. Fügen Sie auf jedem Bucket eine Lifecycle-Regel hinzu, um unvollständige Teile nach 7 Tagen zu löschen.
- **Drei Sicherheitsschichten**: Versionierung (umkehrbare Löschungen), Object Lock (Unveränderlichkeit für Compliance), CloudTrail-Datenereignisse (Forensik und Anomalieerkennung).
- **Cross-Region Replication (CRR)**: Bestelldatensätze automatisch in eine DR-Region replizieren. Erfordert Versionierung auf beiden Buckets. Konfigurieren Sie, ob Löschmarkierungen replizieren, je nachdem, ob die DR-Kopie eine Spiegelung oder ein Backup ist.
- **Multipart-Upload** ist für Objekte > 5 GB erforderlich und für alles > 100 MB empfohlen.
- **S3 Object Lock** bietet WORM-Speicher für Compliance-Szenarien – der Governance-Modus kann von Admins überschrieben werden; der Compliance-Modus kann von niemandem überschrieben werden.

## Prüfungstipps

*SAA-C03-Domäne: Entwurf kostenoptimierter Architekturen (Domäne 4, Aufgabe 4.1)*

- **Signale zur Auswahl der Speicherklasse**:
  - „Häufig aufgerufen“ → Standard
  - „Einmal im Monat aufgerufen, sofortiger Abruf nötig“ → Standard-IA
  - „Kann Stunden Abrufzeit tolerieren, selten aufgerufen“ → Glacier Flexible Retrieval
  - „Regulatorische Compliance, 7+ Jahre Aufbewahrung, nie aufgerufen“ → Glacier Deep Archive
  - „Unbekannte oder wechselnde Zugriffsmuster“ → Intelligent-Tiering
- **Lifecycle-Richtlinien-Examensmuster**: „Speicherkosten automatisch reduzieren, wenn Daten altern“, „nach 90 Tagen ins Archiv überführen“ → Lifecycle-Richtlinien.
- **Intelligent-Tiering und kleine Objekte**: Objekte unter 128 KB werden nicht überwacht, zahlen keine Überwachungsgebühr und tieren nie automatisch – sie bleiben in Frequent Access. Lifecycle-Regeln überspringen Objekte unter 128 KB ebenfalls standardmäßig (überschreibbar). Die Prüfung kann jede der beiden Tatsachen abfragen.
- **CRR-Anforderungen**: Versionierung muss auf Quell- und Ziel-Bucket aktiviert sein. Quelle und Ziel müssen in verschiedenen Regionen sein.
- **S3 Object Lock**: „WORM“, „unveränderlich“, „SEC 17a-4“, „kann nicht gelöscht oder geändert werden“ → Object Lock. Governance-Modus (kann von Admins überschrieben werden). Compliance-Modus (kann von niemandem überschrieben werden, auch nicht von Root).
- **Glacier-Restore**: Objekte in Glacier sind nicht sofort verfügbar. Sie müssen eine Kopie zu S3 Standard „restoren“, um darauf zuzugreifen. Die wiederhergestellte Kopie ist temporär (Sie legen die Dauer fest). Das Original bleibt in Glacier.

## Übungen

**Übung 1 — Erinnerung**

Erklären Sie den Unterschied zwischen S3 Standard-IA und S3 Glacier Instant Retrieval. Welches Zugriffsmuster macht jedes angemessen?

*(Hinweis: Denken Sie darüber nach, wie oft Sie auf die Daten zugreifen würden und wie schnell Sie sie brauchen, wenn Sie darauf zugreifen.)*

**Übung 2 — SAA-C03-Szenario**

*Szenario*: Ein Unternehmen generiert täglich 500 GB Anwendungslogs. Logs werden in den ersten 7 Tagen intensiv abgefragt (Debugging und Überwachung). Nach 7 Tagen wird selten auf Logs zugegriffen, aber sie müssen bei Bedarf innerhalb von 30 Minuten verfügbar sein. Nach 1 Jahr müssen Logs aus Compliance-Gründen aufbewahrt werden, aber es wird nie darauf zugegriffen. Das Unternehmen muss die Speicherkosten minimieren und gleichzeitig diese Anforderungen erfüllen.

Welche S3-Lifecycle-Richtlinie erfüllt diese Anforderungen am BESTEN?

A) In S3 Standard für 7 Tage speichern; nach 7 Tagen zu S3 Glacier Deep Archive übergehen; nach 365 Tagen ablaufen lassen  
B) In S3 Standard für 7 Tage speichern; nach 7 Tagen zu S3 Standard-IA übergehen; nach 365 Tagen zu S3 Glacier Flexible Retrieval übergehen  
C) Alle Logs ab Tag 1 in S3 Intelligent-Tiering speichern  
D) In S3 Standard für 7 Tage speichern; nach 7 Tagen zu S3 Glacier Instant Retrieval übergehen; nach 365 Tagen zu S3 Glacier Deep Archive übergehen

**Hinweis 1**: „Innerhalb von 30 Minuten verfügbar“ schließt welche Speicherklasse aus?

**Hinweis 2**: Deep Archive braucht 12 Stunden zum Abruf – erfüllt die 30-Minuten-Anforderung für die Tage 7–365 nicht.

**Hinweis 3**: Nach 365 Tagen spielt die Abrufzeit keine Rolle (nie aufgerufen), also gilt die günstigste Option.

**Antwort**: D

**Erläuterung**: S3 Standard für 7 Tage bewältigt den häufigen Zugriff. Glacier Instant Retrieval bietet Millisekunden-Zugriff für die Tage 7–365 – erfüllt die 30-Minuten-Anforderung zu erheblich niedrigeren Kosten als Standard-IA. Nach 365 Tagen ist Glacier Deep Archive die günstigste Option für Daten, auf die nie zugegriffen wird.

**Warum nicht A?** Glacier Deep Archive braucht 12 Stunden zum Abruf – erfüllt die „30-Minuten-Verfügbarkeits“-Anforderung für die Tage 7–365 nicht.

**Warum nicht B?** Standard-IA kann hier nicht einmal die erste Station sein: S3 verlangt, dass Objekte 30 Tage in Standard altern, bevor eine Lifecycle-Regel sie nach Standard-IA oder One Zone-IA überführen darf – „Standard-IA nach 7 Tagen“ ist also eine ungültige Regel. (Die 30-Tage-Regel gilt nicht für Glacier-Klassen, weshalb genau D funktioniert.) Und selbst davon abgesehen ist Glacier Instant Retrieval erheblich günstiger für Daten, auf die nach Tag 7 selten zugegriffen wird.

**Warum nicht C?** Intelligent-Tiering hat eine Überwachungsgebühr pro Objekt und verschiebt die Logs möglicherweise nicht so aggressiv in Archivebenen wie explizite Lifecycle-Regeln. Für ein großes Volumen von Logs mit einem vorhersehbaren Zugriffsmuster sind explizite Lifecycle-Regeln kosteneffektiver.

*SAA-C03-Domäne: Entwurf kostenoptimierter Architekturen — Aufgabe 4.1*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nimbus hat drei Arten von S3-Daten mit unterschiedlichen Eigenschaften:

- Restaurantfotos: einmal hochgeladen, von Kunden viele Male aufgerufen, nie gelöscht
- Bestellbelege: im ersten Monat von Kunden aufgerufen, 7 Jahre für Steuerzwecke aufbewahrt
- Analyse-Exporte: täglich generiert, in der folgenden Woche analysiert, 2 Jahre aufbewahrt

Entwerfen Sie für jede eine Lifecycle-Richtlinie. Würde Intelligent-Tiering für die Restaurantfotos sinnvoll sein? Für die Bestellbelege: Welche Speicherklasse deckt das 1-Monats- bis 7-Jahres-Fenster ab? Für Analyse-Exporte: Wie würden Sie den Bucket strukturieren, um verschiedene Richtlinien auf verschiedene Präfixe anzuwenden?

*(Es gibt keine einzige richtige Antwort. Das Ziel ist, die Auswahl von Speicherebenen für reale Daten zu üben.)*

## Post-Credits-Szene

Tom implementierte die Lifecycle-Richtlinien.

Leo hatte geholfen, die erste Regel zu konfigurieren. „Das passt schon“, hatte er gesagt. „Die Mindestspeicherdauer gilt nur, wenn wir vorzeitig löschen – und wir löschen nichts.“ Auf halbem Weg überprüfte er die Mindestdaueranforderungen von Glacier. „Eigentlich lass mich das noch mal lesen.“

Bei einem anderen Bucket – den temporären Analyse-Staging-Exporten – hatte er beinahe einen 30-Tage-Übergang zu Glacier Instant Retrieval mit einer 60-Tage-Ablaufregel kombiniert. Die Mindestspeicherdauer für Glacier Instant beträgt 90 Tage: Diese Objekte wären an Tag 30 in Glacier eingetreten und an Tag 60 gelöscht worden, und S3 hätte trotzdem für jedes einzelne die vollen 90 Tage berechnet – Archivpreise für Speicher, der nicht mehr existierte. Er ließ den Glacier-Übergang für diesen Bucket ganz weg; Daten, die an Tag 60 gelöscht werden, leben nie lange genug, um ein 90-Tage-Minimum zu amortisieren. Die Belege-Richtlinie war wie entworfen sicher: Übergang zu Standard-IA an Tag 90, Glacier Instant Retrieval an Tag 365, Glacier Flexible Retrieval an Tag 540, Glacier Deep Archive an Tag 2.555.

Er setzte außerdem die Multipart-Upload-Bereinigungsregel auf jedem Bucket. Nicht, weil es mehr verlassene Uploads gab – die gab es nicht –, sondern weil es welche geben würde. Lasttests passieren. Deployments schlagen auf halbem Weg fehl. Die Regel war günstiger als die Erinnerungsleistung, die nötig ist, um daran zu denken, manuell zu bereinigen.

Die S3-Rechnung sank im folgenden Monat von 847 $ auf 198 $.

Er druckte den Vergleich aus und legte ihn auf Mayas Schreibtisch, ohne etwas zu sagen.

Maya sah ihn an. Dann das Datum. Dann Tom.

„Drei Wochen“, sagte sie.

„Einen Nachmittag, um die Richtlinien zu entwerfen“, sagte er. „Eine Stunde, um sie zu implementieren. Drei Wochen, um den ersten vollständigen Abrechnungszyklus zu sehen.“

„Drei Viertel Reduktion der S3-Kosten.“

„Für Daten, auf die wir nicht zugreifen.“

„Und die Cross-Region Replication?“ fragte Leo.

„Zehn Dollar im Monat mehr“, sagte Tom. „Für eine vollständige Kopie jedes Bestellbelegs in einer zweiten Region.“

„Das ist die günstigste Disaster-Recovery-Entscheidung, die wir getroffen haben.“

Maya betrachtete die Zahlen noch einmal.

„Tom“, sagte sie, „ich möchte, dass du dieses Review für jeden AWS-Dienst durchführst, den wir verwenden. Speicher, Compute, Netzwerk. Finde die Verschwendung.“

Er war bereits zurück an seinem Schreibtisch.

„Ich habe letzte Woche angefangen“, sagte er.

Im nächsten Kapitel: Die Datenbankebene hat ihre eigene Version dieses Gesprächs, und Aurora ist die Antwort, die Tom nicht erwartet hatte zu mögen.
