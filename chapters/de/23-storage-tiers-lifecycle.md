# Kapitel 23: Das Ablagesystem, das sich selbst sortiert

Eine Anwaltskanzlei hält aktive Fallakten auf dem Schreibtisch. Abgeschlossene Fälle kommen in einen Aktenschrank. Fälle aus vor drei Jahren kommen in Aufbewahrungsboxen im Keller. Fälle aus vor zehn Jahren kommen in eine externe Archivierungsanlage, die Cents pro Box kostet, aber zwei Tage braucht, um etwas daraus abzurufen.

Dieselben Informationen, zu unterschiedlichen Kosten gespeichert, basierend darauf, wie oft darauf zugegriffen wird.

S3 macht das automatisch.

Tom überprüfte die Nimbus AWS-Rechnung. Position: S3-Speicher. 847 $/Monat.

Er rief Leo herbei.

„Wir haben 4,2 Terabyte in S3", sagte Leo nach der Überprüfung.

„Wovon?"

„Restaurantfotos. Bestellbelege. Analytics-Exporte. Backup-Snapshots aus vor 18 Monaten."

„Wann hat zuletzt jemand auf ein Backup von vor 18 Monaten zugegriffen?"

Leo überprüfte die Zugriffsprotokolle.

„Letzten Oktober", sagte er. „Einmal. Um das Backup-Format zu verifizieren."

„Wir bezahlen also für 18 Monate Backups zum vollen S3 Standard-Preis."

„Ja."

Tom sah sich die S3-Preisseite an. S3 Standard: 0,023 $ pro GB pro Monat. S3 Glacier Instant Retrieval: 0,004 $ pro GB pro Monat.

Er rechnete. Einige schnelle Berechnungen.

„Wir könnten diese Rechnung erheblich reduzieren", sagte er, „einfach indem wir alte Daten in günstigeren Speicher verschieben."

„Wir müssten wissen, was alt ist", sagte Leo.

„S3 weiß das. Es verfolgt die Zeit des letzten Zugriffs."

**S3-Speicherklassen: Das vollständige Spektrum**

Kapitel 5 stellte S3 Standard als die primäre Speicherklasse vor. S3 hat tatsächlich sieben Speicherklassen, jede für unterschiedliche Zugriffsmuster ausgelegt:

**S3 Standard**: Für häufig aufgerufene Daten. Niedrige Latenz (Millisekunden). Höchste Kosten. Keine Mindestspeicherdauer. Für aktive Daten verwenden: die aktuellen Menüfotos, die heutigen Bestellungen, neuere Logs.

**S3 Standard-Infrequent Access (S3 Standard-IA)**: Für Daten, auf die weniger als einmal im Monat zugegriffen wird. Gleicher Millisekunden-Abruf wie Standard, aber niedrigere Speicherkosten + Abrufgebühr pro GB. Für Daten verwenden, die man sofort benötigt, wenn man darauf zugreift, aber selten tut: ältere Bestellbelege, 6 Monate alte Analytics-Exporte.

**S3 One Zone-Infrequent Access (S3 One Zone-IA)**: Wie S3 Standard-IA, aber nur in einer Availability Zone (anstatt drei) gespeichert. Weniger langlebig (wenn diese AZ eine Katastrophe hat, können Daten verloren gehen), aber 20 % günstiger. Für Daten verwenden, die neu erstellt werden können, wenn sie verloren gehen: Thumbnail-Cache, temporäre Verarbeitungsausgaben.

**S3 Glacier Instant Retrieval**: Archivierte Daten, die man gelegentlich benötigt. Millisekunden-Abruf. Sehr niedrige Speicherkosten, höhere Abrufkosten pro GB. 90 Tage Mindestspeicherung. Für Daten verwenden, auf die einmal pro Quartal oder seltener zugegriffen wird: vierteljährliche Compliance-Berichte, 12 Monate alte Backup-Snapshots.

**S3 Glacier Flexible Retrieval**: Tiefarchiv, abgerufen in Minuten bis Stunden. Niedrigere Kosten als Glacier Instant Retrieval. Für Archivdaten mit weniger Dringlichkeit verwenden.

**S3 Glacier Deep Archive**: Günstigste Option. Abruf in 12 Stunden. 180 Tage Mindestspeicherung. Für Daten verwenden, die aus regulatorischen Gründen aufbewahrt werden müssen, aber von denen erwartet wird, dass nie darauf zugegriffen wird: 7-jährige Steuerunterlagen, 10-jährige Prüfprotokolle.

Das Muster: Je niedriger die Zugriffsfrequenz, desto niedriger die Kosten, aber desto länger die Abrufzeit (und desto höher die Kosten pro Abruf). Die Klasse wählen, die dem Zugriffsmuster entspricht.

**S3-Lebenszyklus-Richtlinien: Das automatisierte Ablagesystem**

Dateien manuell zwischen Speicherklassen zu verschieben ist fehleranfällig und zeitaufwändig. S3-**Lebenszyklus-Richtlinien** automatisieren dies basierend auf definierten Regeln.

Eine Lebenszyklusregel hat zwei Komponenten:

**Filter**: Auf welche Objekte die Regel zutrifft (alle Objekte, Objekte mit einem bestimmten Präfix, Objekte mit bestimmten Tags).

**Aktionen**: Was nach wie vielen Tagen zu tun ist.

Beispiel-Lebenszyklus-Richtlinie für Nimbus' Bestellbelege:

```
Übergang zu S3 Standard-IA nach 90 Tagen
Übergang zu S3 Glacier Instant Retrieval nach 365 Tagen
Übergang zu S3 Glacier Deep Archive nach 2555 Tagen (7 Jahre)
Löschen nach 2920 Tagen (8 Jahre)
```

Diese einzelne Richtlinie stellt sicher:

- Aktive Belege (< 90 Tage): S3 Standard, schneller Zugriff
- Neuere Belege (90-365 Tage): Standard-IA, günstig, aber sofort verfügbar
- Historische Belege (1-7 Jahre): Glacier, sehr günstig, selten benötigt
- Abgelaufene Belege (> 8 Jahre): Automatisch gelöscht

Tom überprüfte die prognostizierten Einsparungen: von 847 $/Monat auf etwa 220 $/Monat.

„Nur indem man... definiert, was alt ist und wohin es gehen soll?", sagte er.

„Und S3 verschiebt es automatisch", bestätigte Leo. „Kein Cron-Job. Keine manuelle Migration. Kein Vergessen."

**S3 Intelligent-Tiering: Die selbst organisierende Klasse**

Was ist, wenn man nicht weiß, wie oft man auf seine Daten zugreifen wird?

**S3 Intelligent-Tiering** überwacht die Zugriffsmuster für jedes Objekt und verschiebt es automatisch zwischen Zugriffsebenen:

- **Frequent Access-Ebene**: Für kürzlich zugegriffene Objekte
- **Infrequent Access-Ebene**: Objekte, auf die seit 30 Tagen nicht zugegriffen wurde
- **Archive Instant Access-Ebene**: Objekte, auf die seit 90 Tagen nicht zugegriffen wurde
- **Archive Access-Ebene**: Objekte, auf die seit 90-730 Tagen nicht zugegriffen wurde (optional)
- **Deep Archive Access-Ebene**: Objekte, auf die seit 180-730+ Tagen nicht zugegriffen wurde (optional)

S3 Intelligent-Tiering berechnet eine kleine Überwachungsgebühr pro Objekt pro Monat (0,0025 $ pro 1.000 Objekte), aber keine Abrufgebühr für die Frequent- und Infrequent-Ebenen.

Intelligent-Tiering verwenden, wenn:

- Zugriffsmuster unvorhersehbar sind oder sich im Laufe der Zeit ändern
- Man eine Mischung aus heißen und kalten Daten hat, die man nicht leicht klassifizieren kann
- Man Objekte mit mehr als 128 KB hat (kleine Objekte kosten mehr an Überwachungsgebühren als sie sparen)

Explizite Speicherklassen (mit Lebenszyklus-Richtlinien) verwenden, wenn:

- Zugriffsmuster vorhersehbar sind
- Man Überwachungsgebühren pro Objekt minimieren möchte
- Objekte klein sind (< 128 KB)

**Mehrteiliger Upload: Für große Objekte**

S3 hat ein 5-GB-Einzelupload-Limit. Für größere Objekte muss man **mehrteiligen Upload** verwenden: das Objekt in Teile aufteilen, jeden parallel hochladen, und S3 setzt sie zusammen.

Vorteile:

- Schnellere Uploads (parallel)
- Kann fehlgeschlagene Uploads fortsetzen (nur fehlgeschlagene Teile erneut hochladen)
- Erforderlich für Objekte > 5 GB

Lebenszyklusregel-Tipp: Eine Lebenszyklusregel einrichten, um unvollständige mehrteilige Uploads nach 7 Tagen zu löschen. Wenn ein Upload auf halbem Weg fehlschlägt und nicht bereinigt wird, werden diese partiellen Teile gespeichert und berechnet – ohne ein zusammengesetztes Objekt als Ergebnis.

Tom schätzte diesen Tipp ungemein.

**S3-Replikation: Daten zwischen Buckets kopieren**

S3 kann Objekte automatisch von einem Bucket in einen anderen replizieren:

**Same-Region Replication (SRR)**: Objekte innerhalb derselben Region kopieren. Für Compliance verwenden (separates Exemplar in einem anderen Konto aufbewahren), Logs aus mehreren Buckets aggregieren oder Testumgebungen aus Produktionsdaten erstellen.

**Cross-Region Replication (CRR)**: Objekte in eine andere Region kopieren. Für Disaster Recovery verwenden (Datenredundanz über Regionen), Compliance (Daten müssen in einer bestimmten Geografie sein) und niedrigere Latenz für globale Benutzer.

Replikation ist keine Backup-Lösung – wenn man ein Objekt im Quell-Bucket löscht, wird es im Replikat gelöscht (es sei denn, die Replikation von Löschmarkierungen ist deaktiviert). AWS Backup oder Versionierung mit Object Lock für Backups verwenden.

**S3 Object Lock: Unveränderlichkeit für Compliance**

Einige Vorschriften erfordern, dass Daten **unveränderlich** sind – einmal geschrieben, können sie für einen bestimmten Zeitraum nicht geändert oder gelöscht werden.

**S3 Object Lock** implementiert WORM-Speicher (Write Once, Read Many):

**Aufbewahrungszeitraum**: Objekte können für eine bestimmte Dauer nicht gelöscht oder überschrieben werden.

**Legal Hold**: Objekte können unabhängig vom Aufbewahrungszeitraum nicht gelöscht werden, bis der Legal Hold explizit aufgehoben wird.

S3 Object Lock für regulierte Branchen verwenden: Finanzunterlagen (SEC Rule 17a-4), Gesundheitsakten (HIPAA), Compliance-Archive.

## Stärken und Grenzen

**Warum S3-Speicherebenen wichtig sind**:

- Erhebliche Kosteneinsparung ohne Einbußen bei Langlebigkeit oder Verfügbarkeit für tatsächlich zugegriffene Daten
- Lebenszyklus-Richtlinien automatisieren den gesamten Prozess – kein operativer Aufwand
- S3 Intelligent-Tiering beseitigt die Notwendigkeit, Zugriffsmuster vorherzusagen

**Wo es kompliziert wird**:

- Mindestaufbewahrungsgebühren gelten für Glacier-Klassen (90 Tage für Glacier Instant, 180 Tage für Deep Archive) – vorzeitiges Löschen verursacht trotzdem die Mindestgebühr
- Abrufgebühren können überraschen, wenn man häufig auf archivierte Daten zugreift
- Lebenszyklustransitionen brauchen Zeit – Objekte werden nicht sofort nach Aktivierung der Regel verschoben
- Intelligent-Tiering-Überwachungsgebühren summieren sich für Buckets mit Millionen kleiner Objekte

## Zusammenfassung

- S3 hat sieben Speicherklassen: Standard, Standard-IA, Intelligent-Tiering, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval und Glacier Deep Archive.
- **Lebenszyklus-Richtlinien** automatisieren Übergänge zwischen Speicherklassen basierend auf dem Alter – einmal definiert, verwaltet S3 es für immer.
- **S3 Intelligent-Tiering** verschiebt Objekte automatisch zwischen Ebenen basierend auf tatsächlichen Zugriffsmustern – für unvorhersehbare Workloads verwenden.
- **Mehrteiliger Upload** ist für Objekte > 5 GB erforderlich und für alles > 100 MB empfohlen.
- **S3-Replikation** (SRR und CRR) kopiert Objekte über Buckets und Regionen hinweg – für DR, Compliance oder Aggregation.
- **S3 Object Lock** bietet WORM-Speicher für Compliance-Szenarien.

## Prüfungstipps

*SAA-C03-Domäne: Kostenoptimierte Architekturen entwerfen (Domäne 4, Aufgabe 4.1)*

- **Signale zur Auswahl der Speicherklasse**:
  - „Häufig aufgerufen" → Standard
  - „Einmal im Monat aufgerufen, sofortiger Abruf erforderlich" → Standard-IA
  - „Kann Stunden Abrufzeit tolerieren, selten aufgerufen" → Glacier Flexible Retrieval
  - „Regulierungs-Compliance, 7+ Jahre Aufbewahrung, nie aufgerufen" → Glacier Deep Archive
  - „Unbekannte oder wechselnde Zugriffsmuster" → Intelligent-Tiering
- **Prüfungsmuster für Lebenszyklus-Richtlinien**: „Speicherkosten automatisch reduzieren, wenn Daten altern", „nach 90 Tagen ins Archiv überführen" → Lebenszyklus-Richtlinien.
- **Intelligent-Tiering-Überwachungsgebühr**: Kleine Gebühr pro Objekt. Bei einer großen Anzahl kleiner Objekte kann dies die Einsparungen übersteigen. Die Prüfung kann dies testen.
- **CRR-Anforderungen**: Versionierung muss auf Quell- und Ziel-Buckets aktiviert sein. Quelle und Ziel müssen in verschiedenen Regionen sein.
- **S3 Object Lock**: „WORM", „unveränderlich", „SEC 17a-4", „kann nicht gelöscht oder geändert werden" → Object Lock. Governance-Modus (kann von Admins überschrieben werden). Compliance-Modus (kann von niemandem überschrieben werden, auch nicht von Root).
- **Glacier-Wiederherstellung**: Objekte in Glacier sind nicht sofort verfügbar. Man muss eine Kopie zu S3 Standard „wiederherstellen" für den Zugriff. Die wiederhergestellte Kopie ist temporär (man legt die Dauer fest). Das Original bleibt in Glacier.

## Übungen

**Übung 1 – Wiederholen**

Erkläre den Unterschied zwischen S3 Standard-IA und S3 Glacier Instant Retrieval. Welches Zugriffsmuster macht jedes angemessen?

*(Hinweis: Denke darüber nach, wie oft du auf die Daten zugreifst und wie schnell du sie brauchst, wenn du darauf zugreifst.)*

**Übung 2 – Prüfungsübung**

*Szenario*: Ein Unternehmen generiert täglich 500 GB Anwendungslogs. Logs werden für die ersten 7 Tage intensiv abgefragt (Debugging und Überwachung). Nach 7 Tagen wird selten auf Logs zugegriffen, sie müssen aber innerhalb von 30 Minuten verfügbar sein, wenn benötigt. Nach 1 Jahr müssen Logs aus Compliance-Gründen aufbewahrt werden, aber es wird nie darauf zugegriffen. Das Unternehmen muss Speicherkosten minimieren und diese Anforderungen erfüllen.

Welche S3-Lebenszyklus-Richtlinie erfüllt diese Anforderungen OPTIMAL?

A) In S3 Standard für 7 Tage speichern; nach 7 Tagen zu S3 Glacier Deep Archive übergehen; nach 365 Tagen ablaufen lassen  
B) In S3 Standard für 7 Tage speichern; nach 7 Tagen zu S3 Standard-IA übergehen; nach 365 Tagen zu S3 Glacier Flexible Retrieval übergehen  
C) Alle Logs ab Tag 1 in S3 Intelligent-Tiering speichern  
D) In S3 Standard für 7 Tage speichern; nach 7 Tagen zu S3 Glacier Instant Retrieval übergehen; nach 365 Tagen zu S3 Glacier Deep Archive übergehen

**Hinweis 1**: „Innerhalb von 30 Minuten verfügbar" schließt welche Speicherklasse aus?

**Hinweis 2**: Deep Archive braucht 12 Stunden zum Abruf – erfüllt die 30-Minuten-Anforderung für Tage 7-365 nicht.

**Hinweis 3**: Nach 365 Tagen spielt die Abrufzeit keine Rolle (nie aufgerufen), daher gilt die günstigste Option.

**Antwort**: D

**Erläuterung**: S3 Standard für 7 Tage verarbeitet den häufigen Zugriff. Glacier Instant Retrieval bietet Millisekunden-Zugriff für Tage 7-365 – erfüllt die 30-Minuten-Anforderung zu erheblich niedrigeren Kosten als Standard-IA. Nach 365 Tagen ist Glacier Deep Archive die günstigste Option für Daten, auf die nie zugegriffen wird.

**Warum nicht A?** Glacier Deep Archive braucht 12 Stunden zum Abruf – erfüllt die „30-Minuten-Verfügbarkeits"-Anforderung für Tage 7-365 nicht.

**Warum nicht B?** Standard-IA nach 7 Tagen funktioniert, aber Glacier Instant Retrieval ist erheblich günstiger. Standard-IA ist angemessener, wenn man sofortigen Abruf benötigt, aber der Zugriff selten ist – hier wird nach Tag 7 überhaupt nicht auf die Daten zugegriffen, was Glacier kosteneffizienter macht.

**Warum nicht C?** Intelligent-Tiering hat eine Überwachungsgebühr pro Objekt und verschiebt Logs möglicherweise nicht so aggressiv in Archivebenen wie explizite Lebenszyklusregeln. Für ein großes Volumen von Logs mit einem vorhersehbaren Zugriffsmuster sind explizite Lebenszyklusregeln kosteneffizienter.

*SAA-C03-Domäne: Kostenoptimierte Architekturen entwerfen – Aufgabe 4.1*

**Übung 3 – Architektur-Challenge** *(Optional)*

Nimbus hat drei Arten von S3-Daten mit unterschiedlichen Eigenschaften:

- Restaurantfotos: einmal hochgeladen, von Kunden viele Male aufgerufen, nie gelöscht
- Bestellbelege: im ersten Monat von Kunden aufgerufen, 7 Jahre für Steuerzwecke aufbewahrt
- Analytics-Exporte: täglich generiert, in der folgenden Woche analysiert, 2 Jahre aufbewahrt

Entwirf eine Lebenszyklus-Richtlinie für jede. Würde Intelligent-Tiering für die Restaurantfotos sinnvoll sein? Welche Speicherklasse deckt das 1-Monats- bis 7-Jahres-Fenster für die Bestellbelege ab? Für Analytics-Exporte: wie würdest du den Bucket strukturieren, um verschiedene Richtlinien auf verschiedene Präfixe anzuwenden?

*(Es gibt keine einzige richtige Antwort. Das Ziel ist es, die Auswahl von Speicherebenen für reale Daten zu üben.)*

## Post-Credits-Szene

Tom implementierte die Lebenszyklus-Richtlinien.

Die S3-Rechnung sank im folgenden Monat von 847 $ auf 198 $.

Er druckte den Vergleich aus und legte ihn auf Mayas Schreibtisch, ohne etwas zu sagen.

Maya sah ihn an. Dann das Datum. Dann Tom.

„Drei Wochen", sagte sie.

„Einen Nachmittag, um die Richtlinien zu entwerfen", sagte er. „Eine Stunde für die Implementierung. Drei Wochen, um den ersten vollständigen Abrechnungszeitraum zu sehen."

„Zwei Drittel Reduktion der S3-Kosten."

„Für Daten, auf die wir nicht zugreifen."

Maya betrachtete die Zahlen noch einmal.

„Tom", sagte sie, „ich möchte, dass du dieses Review für jeden AWS-Dienst durchführst, den wir verwenden. Speicher, Computing, Netzwerk. Finde die Verschwendung."

Er war bereits zurück an seinem Schreibtisch.

„Ich habe letzte Woche angefangen", sagte er.

Im nächsten Kapitel: Die Datenbankebene hat ihre eigene Version dieses Gesprächs, und Aurora ist die Antwort, die Tom nicht erwartete zu mögen.
