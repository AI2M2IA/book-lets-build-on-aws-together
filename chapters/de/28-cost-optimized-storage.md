# Kapitel 28: Die Überraschung bei den Speicherkosten

Tom hatte den Savings Plan für EC2 eingereicht. Die nächste Zeile auf der Rechnung war S3: 198 $/Monat (von 847 $ nach den Änderungen der Lebenszyklusrichtlinie aus Kapitel 23).

Dann sah er EBS: 440 $/Monat.

„Das scheint hoch“, sagte er.

Leo öffnete die Liste der EBS-Volumes. Es gab 47 EBS-Volumes, die an Instanzen angeschlossen waren. Und dann waren es noch 23 Volumes, die nicht an einer Instanz angeschlossen waren.

„Diese 23 Volumes“, sagte Tom. „Was sind das?“

Leo recherchierte sie. Sie waren alle getrennt – derzeit verwendete Instanzen nutzten sie nicht. Die meisten wurden aus Snapshots für Debugging-Zwecke erstellt. Einige stammten von Instanzen, die beendet worden waren, aber deren Volumes nicht gelöscht worden waren.

„Wir zahlen 0,10 $ pro GB pro Monat für Speicher, den niemand liest“, sagte Leo.

Tom sah sich die Gesamtsumme an: 2,3 TB an unverbundenen Volumes.

„Zehnundzwanzig Dollar pro Monat für Speicher, den wir nicht nutzen“, sagte Tom. „Wie lange dauert das schon?“

Leo überprüfte die Erstellungsdaten. Das älteste Volume war 16 Monate alt.

„Drei tausend sechs hundert achtzig Dollar“, sagte Tom leise. „Wir haben drei tausend sechs hundert Dollar für Speicher ausgegeben, den niemand zugänglich hat.“

Er löschte die unverbundenen Volumes. Der folgende Monat sank die EBS-Rechnung auf 210 $.

**Die Speicherkostenprüfung**

Toms EBS-Entdeckung war ein Symptom eines breiteren Musters: Speicherkosten stapeln sich unbemerkt. Anders als bei der Rechenleistung (man bemerkt, wenn 47 Server laufen), stapeln sich Speicher diskret.

Man kann es sich wie einen Lagerraum mieten vorstellen. Die Miete für eine Einheit ist auf dem Kreditkartenabrechnung offensichtlich. Wenn man aber eine zweite Einheit für ein Projekt mietet, dann eine dritte für alte Möbel und man geht nie zurück, um zu sehen, was darin ist – bleiben die Gebühren jeden Monat erscheinen, still und leise, lange nachdem man vergessen hat, was man überhaupt speichert. Cloud-Speicher funktioniert genauso: Die Bytes sitzen dort, die Rechnung kommt, und niemand hinterfragt sie, bis jemand die Tür öffnet und findet, dass sie voll mit Dingen sind, die niemand mehr braucht.

Eine gründliche Speicherkostenprüfung beinhaltet:

**S3**:

- Sind Lebenszyklusrichtlinien für alle Buckets vorhanden?
- Liegen alte Snapshots (RDS, EBS) in S3?
- Ist Intelligent-Tiering für Buckets mit unsicheren Zugriffsmustern geeignet?
- Werden versionierte Objekte erstellt, die mehrere Kopien erzeugen, die nie abgerufen werden?

**EBS**:

- Werden Volumes unverbunden (von keiner laufenden Instanz verwendet) belassen?
- Sind gp3-Volumes richtig konfiguriert? (Standard gp3-Volumes können überprovisionierte Durchsatz-/IOPS-Werte haben, die nicht benötigt werden)
- Werden Snapshots, die älter sind als nötig, beibehalten?

**RDS**:

- Sind die automatischen Backup-Behaltenszeiten angemessen eingestellt? (Längere = höhere Speicherkosten)
- Liegen manuelle Snapshots von alten Instanzen noch herum?
- Werden Read Replicas von Datenbankmigrationen noch ausgeführt?

**EFS**:

- Ist das EFS-Volume im richtigen Speicherklasse? (Standard vs. Infrequent Access)

**S3 Versionierung: Die verborgene Kosten**

In Kapitel 5 haben wir erwähnt, dass S3-Versionierung jede vorherige Version eines Objekts speichert. Das ist gut für die Sicherheit. Das ist schlecht für die Kosten, wenn man keine Lebenszyklusrichtlinien für die Versionen hat.

Wenn die Versionierung auf einem Bucket aktiviert ist, wird jede Zeit, wenn ein Objekt überschrieben wird, die alte Version beibehalten. Im Laufe der Zeit:

- Tag 1: Bild hochgeladen (v1)
- Tag 30: Bild aktualisiert (v1 ist jetzt eine "nicht aktuelle" Version, v2 ist aktuell)
- Tag 60: Bild erneut aktualisiert (v1 und v2 sind nicht aktuell, v3 ist aktuell)
- Tag 365: v1, v2... v12 sind alle gespeichert. Man zahlt für 12 Kopien eines Bildes.

Die Lösung: Lebenszyklusrichtlinien für nicht aktuelle Versionen.

```
Expire noncurrent versions after 30 days
Delete failed multipart uploads after 7 days
```

Tom wendete diese Regeln auf alle versionierten Buckets an. Im Folgenden Monat sank der S3-Speicher um 18%.

**EBS: Optimierung der Größe und Upgrade auf gp3**

Der Preis für EBS-Volumes setzt sich aus zwei Komponenten zusammen:

1.  Speicher (pro GB pro Monat)
2.  Provisionierte IOPS und Durchsatz (falls Sie io1/io2 verwenden oder für zusätzlichen gp3-Leistung bezahlen)

**Die gp3-Chance**: Wie in Kapitel 6 erwähnt, ist gp3 der aktuelle Standard und günstiger als gp2. Wenn Nimbus Volumes vor der Verfügbarkeit von gp3 erstellt wurden (es wurde im Dezember 2020 gestartet), könnten diese immer noch gp2 sein.

Tom fand 12 gp2-Volumes, die insgesamt 1.200 GB umfassten. Die Migration zu gp3 führte sofort zu einer Einsparung von 20 % auf diesen Volumes, ohne Leistungseinbußen.

**IOPS und Durchsatz**: gp3-Volumes werden mit 3.000 IOPS und 125 MB/s Durchsatz standardmäßig mit keiner zusätzlichen Kosten geliefert. Sie können mehr provisionieren, wenn Ihre Arbeitslast dies benötigt. Überprüfen Sie, ob die provisionierte Leistung tatsächlich genutzt wird.

Tom fand zwei gp3-Volumes mit 10.000 provisionierten IOPS. Er überprüfte die CloudWatch-Metriken: der tatsächliche durchschnittliche IOPS betrug 1.200. Er reduzierte die provisionierten IOPS auf 4.000 (ein Sicherheitsabstand über dem tatsächlichen Spitzenwert).

Monatliche Ersparnis: 68 $.

**Snapshot-Lebenszyklus**: EBS-Snapshots sind inkrementell (jedes Snapshot speichert nur Änderungen seit dem vorherigen), aber sie stapeln sich. Alte Snapshots aus den frühen Tagen von Nimbus existierten immer noch. Tom behielt 30 Tage täglicher Snapshots und löschte den Rest.

**EFS: Speicherklassen**

Amazon EFS verfügt über eigene Speicherklassen:

-   **EFS Standard**: Für Dateien, die häufig aufgerufen werden. Höhere Kosten.
-   **EFS Infrequent Access (IA)**: Für Dateien, die nicht seit 30 Tagen aufgerufen wurden. 92 % günstiger als Standard.
-   **EFS Archive**: Für Dateien, die nicht seit 90 Tagen aufgerufen wurden. Noch günstiger als IA.

**EFS Intelligent-Tiering**: Bewegt Dateien automatisch zwischen Speicherklassen basierend auf Zugriffsmustern.

Tom aktivierte Intelligent-Tiering auf dem EFS-Volume. Sechs Wochen später hatten 68 % der Dateien sich zu Infrequent Access bewegt. Die monatlichen EFS-Kosten sanken von 89 $ auf 31 $.

**S3-Kostenaufteilung: Wer gibt was aus?**

Während sich Nimbus entwickelte, speicherten mehrere Teams Daten in S3. Das Analytics-Team hatte seine eigenen Buckets. Das Engineering-Team hatte seine Buckets. Das Restaurant-Daten-Team hatte seine Buckets.

Die Rechnung zeigte nur "S3: 198 $". Es gab keine Aufschlüsselung nach Team.

**Kostenaufteilung-Tags** ermöglichen es Ihnen, AWS-Ressourcen mit Geschäftsmetadaten (Team, Projekt, Umgebung) zu kennzeichnen und dann die Kosten anhand dieser Tags in AWS Cost Explorer aufzuschlüsseln.

Tom fügte Tags zu allen S3-Buckets hinzu:

```
Team: analytics
Environment: production
Project: nimbus-core
```

Nach einem Abrechnungszeitraum mit Tagging konnte er sehen: „Der Analytics-Team-Daten-Lake kostet 74 $/Monat. Engineering-Backups kosten 43 $/Monat. Restaurant-Daten kosten 81 $/Monat.“

Nun konnte er mit jedem Team bezüglich des Budgets sprechen, anstatt nur eine aggregierte Zahl zu betrachten.

**AWS Cost Explorer und AWS Budgets**

**AWS Cost Explorer**: Visualisiert historische und prognostizierte Kosten nach Service, Region, Tag und Nutzungsart.  Essentiell für das Verständnis, wofür das Geld ausgegeben wird.

**AWS Budgets**: Legt Benachrichtigungen fest, wenn Kosten einen Schwellenwert überschreiten (oder voraussichtlich überschreiten). Sie können nach Service, Region, Tag oder Konto budgetiert werden.

Tom richtete drei Budgets ein:

1.  Gesamtrechnungsbetrag: Alarm bei 90 % des geplanten Betrags
2.  EC2 On-Demand: Alarm, wenn der On-Demand-Verbrauch 500 $/Monat überschreitet (signalisiert eine Lücke im Savings Plan)
3.  Datenübertragung nach außen: Alarm bei 200 $/Monat (Datenübertragungskosten können unerwartet ansteigen)

Die Budgets sendeten Benachrichtigungen an einen Slack-Kanal. Das Team sah, wenn sie sich den Grenzen näherten, anstatt es auf der monatlichen Rechnung zu entdecken.

**Die Kosten der Vernachlässigung**

Tom baute eine Tabelle. Er berechnete, wie viel Nimbus an:

-   Unzugeordneten EBS-Volumes (16 Monate): 3.680 $
-   Alten S3-Snapshots (entdeckt und gelöscht): 890 $
-   Unnötigen provisionierten IOPS: 816 $
-   gp2 zu gp3 Migration Einsparungen (prognostiziert, wenn früher durchgeführt): 2.160 $ über 18 Monate
-   Nichtlaufenden S3-Versionen, die sich ansammelten: 1.340 $

Identifizierte Verschwendung: etwa 8.800 $ über 18 Monate.

„Acht tausend acht hundert Dollar“, sagte Maya.

„Durch Vernachlässigung“, sagte Tom. „Nicht aufgrund falscher architektonischer Entscheidungen. Durch das Nicht-Aufräumen.“

„Was ist die systematische Lösung?“

„Regelmäßige Audits“, sagte Priya. „Monatliche Cost Explorer-Überprüfungen. AWS Trusted Advisor markiert unzugeordnete Volumes und inaktive Ressourcen automatisch. Automatisieren Sie die Aufräumarbeit von bekannten Verschwendungsmustern: Löschen Sie Snapshots älter als N Tage, alarmieren Sie bei unzugeordneten EBS-Volumes, lösen Sie alte S3-Versionen auf.“

„Und“, fügte Tom hinzu, „machen Sie die Kostenkontrolle zum Teil des Bereitstellungsprozesses. Wenn ein Ingenieur eine EC2-Instanz beendet, wird das EBS-Volume automatisch gelöscht, es sei denn, sie lehnt es ausdrücklich ab.“

## Stärken und Schwächen

**Disziplin für die Kostenoptimierung**:

-   Regelmäßige Überprüfungen fangen sich häufende Verschwendung ein, bevor sie erheblich werden
-   Tagging ermöglicht Verantwortlichkeit – Teams sehen ihre eigenen Kosten
-   Automatisierte Benachrichtigungen verhindern unerwartete Rechnungen
-   Lebenszyklusrichtlinien und Größenoptimierung werden oft als „Set-and-Forget“-Einsparungen eingerichtet

**Wo es kompliziert wird**:

-   Die Identifizierung von Verschwendung in einem großen Konto mit vielen Teams erfordert zentrale Werkzeuge
-   Einige Verschwendung ist beabsichtigt (zusätzliche Snapshots „nur für den Fall“) – der Kosten-/Risiko-Trade-off ist eine Urteilsfrage
-   gp3-Migration erfordert eine sorgfältige Validierung (IOPS- und Durchsatz-Defaults können sich im Vergleich zum gp2-Verhalten in Randfällen unterscheiden)
-   Kostenzuordnungs-Tags erfordern Disziplin über alle Teams hinweg – inkonsistentes Tagging macht die Daten unvollständig

## Zusammenfassung

-   **Speicherkosten stapeln sich unbemerkt** – regelmäßige Audits sind unerlässlich.
-   **Unzugeordnete EBS-Volumes** sind eine häufige Quelle der Verschwendung. Löschen Sie diese (oder automatisieren Sie die Löschung, wenn Instanzen beendet werden).
-   **EBS-Größenoptimierung**: Migrieren Sie gp2 zu gp3 (typischerweise 20 % Einsparungen). Entfernen Sie übermäßige provisionierte IOPS.
-   **S3-Versionskosten**: Nichtlaufende Versionen werden gespeichert und mit den aktuellen Versionen in Bezug auf die Kosten abgerechnet. Lebenszyklusregeln, die nichtlaufende Versionen aufheben, sind entscheidend für die Kostenkontrolle in versionierten Buckets.
-   **EFS Intelligent-Tiering**: Bewegt Dateien automatisch in kostengünstigere Stufen basierend auf der Zugriffsfrequenz.
-   **Kostenzuordnungs-Tags**: Kennzeichnen Sie Ressourcen mit Team-/Projekt-/Umgebungsmetadaten für die Kostenbachtrachtbarkeit und Verantwortlichkeit.
-   **AWS Budgets**: Proaktive Benachrichtigungen, wenn Kosten Schwellenwerte erreichen. Lassen Sie sich nie von der monatlichen Rechnung überraschen.

## Examenstipps

*SAA-C03 Domain: Design Cost-Optimized Architectures (Domain 4, Task 4.1)*

-   **Kostenzuordnungs-Tags**: Aktivieren Sie User-Defined Tags für die Kostenzuordnung im Billing-Konsolen; taggen Sie dann Ressourcen. Cost Explorer zeigt Aufschlüsselungen nach Tag. Examen-Szenario: „Identifizieren Sie, welche Abteilung die meisten S3-Kosten verursacht“ → Kostenzuordnungs-Tags.
-   **AWS Trusted Advisor**: Erkennt unterausgenutzte EC2-Instanzen, unzugeordnete EBS-Volumes, inaktive Load Balancer und andere Verschwendung. Grundlegende Prüfungen sind kostenlos; vollständige Prüfungen erfordern Business/Enterprise Support.
-   **EBS-Kostenkomponenten**: Speicher (pro GB), provisionierte IOPS (wenn io1/io2 oder extra gp3), Durchsatz (wenn extra gp3). Wissen Sie, welche Komponenten optimiert werden können.
-   **S3-Versionskosten**: Nichtlaufende Versionen werden gespeichert und mit den aktuellen Versionen in Bezug auf die Kosten abgerechnet. Lebenszyklusregeln, die nichtlaufende Versionen aufheben, sind entscheidend für die Kostenkontrolle in versionierten Buckets.
-   **AWS Compute Optimizer**: Analysiert EC2-Nutzung und empfiehlt die richtigen Instanztypen. Examen-Signal: „Reduzieren Sie EC2-Kosten durch die Auswahl des richtigen Instanztyps“ → Compute Optimizer.
-   **AWS Cost Anomaly Detection**: Verwendet ML, um ungewöhnliche Ausgabemuster zu erkennen. Examen-Signal: „Erkennen Sie automatisch unerwartete Kostenerhöhungen“ → Cost Anomaly Detection.

## Übungen

**Übung 1 – Erinnerung**

Erklären Sie, warum unzugeordnete EBS-Volumes Kosten verursachen, auch wenn keine EC2-Instanz sie verwendet. Welchen Prozess sollten Ingenieure befolgen, wenn sie eine EC2-Instanz beenden, um diese Verschwendung zu vermeiden?

*(Hinweis: EBS-Volumes speichern Daten auf physischen Festplatten, und diese Festplatten kosten Geld, unabhängig davon, ob sie gelesen werden oder nicht.)*

**Übung 2 — Klausurenübung**

*Szenario*: Die AWS-Rechnung eines Unternehmens ist von 5.000 USD auf 9.000 USD pro Monat innerhalb von sechs Monaten gestiegen, obwohl keine neuen Dienste hinzugefügt wurden. Das Engineering-Team vermutet, dass die Kosten für Speicher ein Problem sind. Welche Kombination von AWS-Tools würde die BESTE Möglichkeit bieten, diese Kostensteigerung zu identifizieren und zu erklären?

A) AWS CloudTrail zur Überprüfung von API-Aufrufen und zur Identifizierung, wer neue Ressourcen erstellt hat
B) AWS Cost Explorer zur Aufschlüsselung der Kosten nach Dienst, AWS Trusted Advisor zur Erkennung von inaktiven und nicht verbundenen Ressourcen
C) Amazon CloudWatch zur Überwachung der Ressourcenauslastung und zur Erstellung von Kostenalarmen
D) AWS Config zur Identifizierung aller Ressourcen und ihres Compliance-Status

**Hinweis 1**: "Die Kostensteigerung identifizieren" → Visualisierung der Kostenaufschlüsselung nach Dienst.

**Hinweis 2**: "Inaktive und nicht verbundene Ressourcen" → ein bestimmtes Tool identifiziert diese proaktiv.

**Hinweis 3**: CloudTrail protokolliert API-Aufrufe; Cost Explorer zeigt Kostentrends. Welches ist nützlicher für die Kostenanalyse?

**Antwort**: B

**Erläuterung**: AWS Cost Explorer zeigt Kostentrends, aufgeschlüsselt nach Dienst, Region und Nutzungsart – perfekt, um zu identifizieren, welcher Dienst die Erhöhung verursacht hat. AWS Trusted Advisor’s Optimierungsprüfungen erkennen unverbundene EBS-Volumes, inaktive EC2-Instanzen, unterausgenutzte Load Balancer und andere häufige Verschwendung.

**Warum nicht A?** CloudTrail protokolliert, wer Ressourcen erstellt und wann, aber zeigt keine direkten Kostentrends oder Verschwendung an.

**Warum nicht C?** CloudWatch überwacht die Ressourcennutzung (CPU, Speicher) – nützlich für die Größenanpassung, aber nicht zur Identifizierung von aufgebauter Speicherverschwendung.

**Warum nicht D?** AWS Config verfolgt die Ressourcenzustände und die Einhaltung der Vorschriften, ist aber kein Kostenanalyse-Tool.

*SAA-C03 Domäne: Design von kosteneffizienten Architekturen – Aufgabe 4.1*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nimbus’s S3-Rechnung zeigt 340 USD pro Monat für einen Bucket mit dem Label „Backups“. Der Bucket hat Versionierung aktiviert und enthält:

- Tägliche Datenbank-Snapshots (7 Tage reichen für ihre Richtlinie)
- Wöchentliche Voll-Backups (aufbewahrt für 3 Monate)
- Quartalsweise Archive (aufbewahrt für 7 Jahre für Steuerkonformität)

Entwerfen Sie eine Lebenszyklusrichtlinie für diesen Bucket, die die Kosten minimiert und diese Aufbewahrungsanforderungen erfüllt. Welche Speicherklasse sollte jeder Datentyp verwenden? Wie würden Sie die Versionierung handhaben, um zu verhindern, dass alte Versionen sich ansammeln?

*(Es gibt keine eindeutige richtige Antwort. Das Ziel ist, Lebenszyklusrichtlinien zu üben.)*

## Nach-Credits-Szene

Tom veröffentlichte die Kostenprüfergebnisse dem Team.

Identifizierte Verschwendung: 8.800 USD über 18 Monate.
Erwartete jährliche Einsparungen durch implementierte Änderungen: 6.200 USD.

Dann fügte er am Ende eine Zeile hinzu: „Dies beinhaltet nicht die Einsparungen durch Savings Plans (14.200 USD pro Jahr) oder S3-Lebenszyklusrichtlinien (7.800 USD pro Jahr). Kombinierter jährlicher Optimierungs-Auswirkungsbereich: etwa 28.200 USD.“

Maya las es zweimal.

„Das sind fast das Gehalt eines Junior Engineers“, sagte sie.

„In Verschwendung“, bestätigte Tom.

„Oder“, sagte Leo, „es ist der Beweis, dass man diese Optimierungen früher hätte durchführen müssen, um dieses Junior Engineer zu finanzieren.“

Tom sah ihn an.

„Das ist die richtige Denkweise“, sagte er. „Kostenoptimierung geht nicht darum, zu kürzen. Es geht darum, nicht für Dinge zu bezahlen, die keinen Mehrwert schaffen.“

Maya befestigte das Dokument in der Unternehmens-Wiki.

Im nächsten Kapitel: Die Datenbankebene erhält die gleiche Behandlung, und Tom entdeckt den einen Ort, in dem er sich tatsächlich unterinvestiert hatte.
