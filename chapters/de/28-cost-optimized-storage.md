# Kapitel 28: Die Überraschung bei der Speicherrechnung

Die Tabelle hatte inzwischen sechzehn Tabs. Tom hielt sie in einem zweiten Fenster offen, so wie manche Leute eine Einkaufsliste führen – immer sichtbar, immer wachsend. Er fügte eine neue Zeile für EC2 hinzu (erledigt, Savings Plan verpflichtet) und bewegte den Cursor zur nächsten Zeile.

Speicher.

**Rückblick: EC2 erledigt, ein Posten bleibt**

Die Arbeit an der Compute-Preisgestaltung aus Kapitel 27 hatte die EC2-Strategie festgezurrt: ein Compute Savings Plan mit 0,45 $/Stunde auf drei Jahre Laufzeit, plus Spot für den nächtlichen Batch – geschätzte 42.500 $ Einsparung über die Laufzeit. Diese Arbeit war erledigt, und gut erledigt. Aber sie war eine Zeile auf der Rechnung. Tom hatte aus sechs Monaten Athena-Kostenanalyse gelernt, dass die Rechnung viele Zeilen hatte – und dass jede davon dieselbe Prüfung verdiente. S3 war als Nächstes dran: 198 $/Monat, bereits verbessert von 847 $ nach den Lebenszyklus-Richtlinienänderungen aus Kapitel 23. Die Zahl, die ihm jedoch ins Auge fiel, stand weiter unten auf der Seite. EBS: 440 $/Monat.

„Das scheint hoch“, sagte er.

Leo rief die EBS-Volume-Liste auf. Es gab 47 EBS-Volumes, die an Instanzen angeschlossen waren. Und dann gab es weitere 23 Volumes, die an keine Instanz angeschlossen waren.

„Diese 23 Volumes“, sagte Tom. „Was sind das?“

**Die Prüfung der verwaisten Volumes**

Leo begann, sie eines nach dem anderen durchzugehen. Das war kein schneller Prozess – die Volumes waren nicht einheitlich beschriftet, die Tags waren inkonsistent, und einige waren vor so langer Zeit erstellt worden, dass sich niemand mehr an den Kontext erinnerte. Tom zog einen Stuhl heran und schaute zu.

Volume ebs-021a4c. Vor 16 Monaten erstellt. Tag: „debug-prod-db-snapshot-restore.“ Größe: 200 GB. Zuletzt angeschlossen: nie, oder die Anschlusshistorie war gelöscht.

„An das erinnere ich mich“, sagte Leo. „Wir hatten ein Problem mit einer Datenbankabfrage und ich stellte einen Snapshot wieder her, um die Daten zu prüfen. Ich habe sie geprüft, das Problem dort nicht gefunden und vergessen, das Volume zu löschen.“

Volume ebs-07f38b. Vor 11 Monaten erstellt. Tag: „load-test-temp.“ Größe: 400 GB.

Leo war einen Moment lang still. „Ich glaube, das war der Lasttest, den wir vor dem Series-Seed-Pitch gemacht haben. Wir haben zusätzliche Instanzen mit zusätzlichem Speicher bereitgestellt, um die Spitzenlast zu simulieren, und dann… ich glaube, ich habe danach keine davon gelöscht.“

„Ich hatte ihn schon deployt – oh“, sagte er. „Der Lasttest war temporär. Die Volumes waren es nicht.“

Volume ebs-0ab12c bis ebs-0ab134. Acht aufeinanderfolgende Volumes, vor 9 Monaten erstellt. Tag: „k8s-experiment.“ Größe: jeweils 100 GB, 800 GB insgesamt.

„Das war die Kubernetes-Evaluierung“, sagte Priya und blickte Leo über die Schulter. „Wir haben drei Wochen damit verbracht zu evaluieren, ob wir zu ECS oder EKS migrieren sollten. EKS war der Zweitplatzierte. Wir haben den Experiment-Cluster abgebaut, aber offenbar die persistenten Volumes übrig gelassen.“

Tom rechnete es auf einem separaten Tab zusammen. Volume für Volume sammelten sich die Zahlen:

- Debug-Wiederherstellungs-Volumes: 4 Volumes × 200 GB = 800 GB
- Lasttest-Volumes: sechs Volumes zwischen 200 und 400 GB – grob 1.200 GB insgesamt
- Kubernetes-Experiment-Volumes: 8 Volumes × 100 GB = 800 GB
- Verschiedene ungetaggte: 5 Volumes × verschiedene Größen = ~700 GB

Gesamt: ungefähr 3.500 GB über 23 nicht angeschlossene Volumes.

„Wie viel kostet das pro Monat?“, fragte Tom. Die Antwort: gp3 zu 0,08 $/GB/Monat. 3.500 GB × 0,08 $ = 280 $/Monat.

Er prüfte das älteste Erstellungsdatum. Sechzehn Monate. Er holte den Taschenrechner heraus.

„Für einige davon zahlen wir seit sechzehn Monaten“, sagte er. „Für einige seit neun. Durchschnittlich wahrscheinlich zehn Monate über alle hinweg.“ 23 Volumes, durchschnittlich 12 $/Monat pro Stück, durchschnittlich 10 Monate. Das waren ungefähr 2.760 $. Rechnet man die größeren Volumes hinzu, kam die Rechnung auf grob 3.200 $ an Gesamtverschwendung.

„Dreitausendzweihundert Dollar“, sagte Tom. „Von Volumes, die niemand nutzte.“

„Und niemand bemerkte es, weil die Kosten über Dutzende von Posten verteilt sind“, sagte Leo. „Es ist nicht eine Belastung von 3.200 $. Es sind 23 Belastungen von 12 $ oder 50 $ oder 80 $ pro Monat, jede einzeln klein genug, um keinen Alarm auszulösen.“

Tom löschte alle 23 nicht angeschlossenen Volumes. Er bestätigte mit Leo und Priya, dass keines davon Daten enthielt, die sie benötigten – das Debug-Volume waren veraltete Daten aus einer Datenbank, die seitdem migriert worden war, die Lasttestdaten waren irrelevant, die Kubernetes-Experiment-Volumes waren leer. Die Löschung dauerte fünfzehn Minuten. Im folgenden Monat sank die EBS-Rechnung von 440 $ auf 160 $.

„Moment – aber *warum* würden wir es so machen?“, fragte Maya, als Tom sie durch den Befund führte. „Warum ist das Löschen des Volumes nicht der Standard, wenn man eine Instanz beendet?“

„Es hängt vom Volume ab“, sagte Tom. „Das **Root**-Volume wird standardmäßig gelöscht – `DeleteOnTermination` ist dafür auf true. Aber alle **zusätzlichen** Daten-Volumes, die man anhängt, werden standardmäßig beibehalten. Die Annahme ist, dass man die Daten, die darauf waren, vielleicht noch braucht. Diese 23 Waisen waren alle Daten-Volumes – angehängt für eine Debug-Sitzung oder einen Lasttest und dann zurückgelassen, als die Instanz beendet wurde.“

„Der Standard schützt einen also vor versehentlichem Datenverlust bei Daten-Volumes.“

„Und kostet einen Geld, wenn man nicht aufpasst. Ab jetzt: Alle zusätzlichen Daten-Volumes werden explizit gelöscht, wenn die Instanz beendet wird – oder erhalten beim Anhängen `DeleteOnTermination` gesetzt –, es sei denn, jemand legt dokumentiert dar, warum sie behalten werden müssen.“

„Haben wir bedacht, was passiert, wenn jemand vergisst, diesen Fall zu dokumentieren?“, fragte Priya. „Wir könnten etwas Wichtiges löschen.“

„Das ist der Kompromiss“, sagte Tom. „Im Moment geht der Kompromiss in die andere Richtung – wir nehmen an, dass alles behalten werden sollte, und zahlen dafür, wenn es nicht so ist. Die Disziplin, ‚dieses Volume behalten‘ zu dokumentieren, ist weniger riskant als der aktuelle Standard von ‚alles stillschweigend behalten‘.“

**Das Audit der Speicherkosten**

Toms EBS-Entdeckung war ein Symptom eines breiteren Musters: Speicherkosten sammeln sich unsichtbar an. Anders als bei der Rechenleistung (man bemerkt, wenn 47 Server laufen) summiert sich Speicher leise.

Stellen Sie es sich wie die Miete eines Lagerraums vor. Eine Einheit zu mieten ist auf der Kreditkartenabrechnung offensichtlich. Aber wenn man eine zweite Einheit für ein Projekt mietet, dann eine dritte für alte Möbel, und nie zurückgeht, um zu prüfen, was drin ist – erscheinen die Gebühren weiter jeden Monat, leise, lange nachdem man vergessen hat, was man überhaupt lagert. Cloud-Speicher funktioniert genauso: Die Bytes liegen da, die Rechnung kommt, und niemand hinterfragt sie, bis endlich jemand die Tür öffnet und sie voller Dinge findet, die niemand mehr braucht.

Ein gründliches Speicherkosten-Audit betrachtet:

**S3**:

- Sind für alle Buckets Lebenszyklusrichtlinien vorhanden?
- Liegen alte Snapshots (RDS, EBS) in S3?
- Ist Intelligent-Tiering für Buckets mit unsicheren Zugriffsmustern geeignet?
- Gibt es versionierte Objekte, die mehrere Kopien erzeugen, die nie abgerufen werden?
- Gibt es unvollständige Multipart-Uploads, die sich still ansammeln?

**EBS**:

- Sind Volumes nicht angeschlossen (keine laufende Instanz nutzt sie)?
- Sind gp3-Volumes richtig konfiguriert? (Standard-gp3-Volumes können überdimensionierten provisionierten Durchsatz/IOPS haben, der nicht benötigt wird)
- Werden Snapshots länger als nötig aufbewahrt?

**RDS**:

- Sind die Aufbewahrungszeiträume für automatische Backups angemessen eingestellt? (Länger = höhere Speicherkosten)
- Liegen manuelle Snapshots von alten Instanzen noch herum?
- Laufen Read Replicas von Datenbankmigrationen noch?

**EFS**:

- Ist das EFS-Volume in der richtigen Speicherklasse? (Standard vs. Infrequent Access)

**S3-Versionierung: Die versteckten Kosten**

In Kapitel 5 haben wir erwähnt, dass die S3-Versionierung jede vorherige Version eines Objekts aufbewahrt. Das ist hervorragend für die Sicherheit. Es ist schrecklich für die Kosten, wenn man nicht auch Lebenszyklusregeln für die Versionen hat.

Wenn die Versionierung auf einem Bucket aktiviert ist, wird jedes Mal, wenn man ein Objekt überschreibt, die alte Version aufbewahrt. Im Laufe der Zeit:

- Tag 1: Bild hochgeladen (v1)
- Tag 30: Bild aktualisiert (v1 ist jetzt eine „nicht aktuelle“ Version, v2 ist aktuell)
- Tag 60: Bild erneut aktualisiert (v1 und v2 sind nicht aktuell, v3 ist aktuell)
- Tag 365: v1, v2… v12 sind alle gespeichert. Man zahlt für 12 Kopien eines Bildes.

Sie fragen sich vielleicht, warum die Versionierung alte Versionen nicht automatisch aufräumt. Die Antwort ist beabsichtigt – AWS möchte Ihre Daten nicht automatisch löschen. Aber die Konsequenz ist, dass sich jede Version ansammelt, bis Sie S3 explizit mitteilen, wie lange sie aufbewahrt werden sollen. Die Lösung: Lebenszyklusregeln für nicht aktuelle Versionen.

```
Expire noncurrent versions after 30 days
Delete failed multipart uploads after 7 days
```

Tom wandte diese Regeln auf alle versionierten Buckets an. Im folgenden Monat sank der S3-Speicher um 18 %.

**Unvollständige Multipart-Uploads: Die unsichtbare Ansammlung**

Es gibt eine subtilere S3-Kostenfalle, die die meisten Ingenieure völlig übersehen: unvollständige Multipart-Uploads.

Wenn S3 eine große Datei hochlädt, zerlegt es sie in Teile und lädt jeden separat hoch. Das ist der Multipart-Upload-Mechanismus – zuverlässiger als ein einzelnes großes PUT für Dateien über ein paar hundert Megabyte. Aber wenn ein Upload startet und dann auf halbem Weg fehlschlägt – eine Netzwerkunterbrechung, ein Client-Absturz, ein Anwendungsfehler –, verbleiben die bereits hochgeladenen Teile in S3. Sie sind nicht als Objekte in Ihrem Bucket sichtbar. Sie erscheinen in keiner Liste. Aber sie werden gespeichert, und Ihnen werden sie zu Standard-S3-Sätzen berechnet.

Tom fand dies, indem er das S3-Storage-Lens-Dashboard in der S3-Konsole aktivierte und nach „incomplete multipart uploads“ sortierte. Nimbus hatte 340 GB an unvollständigen Multipart-Upload-Daten, die still in Buckets über vier AWS-Konten verteilt lagen, einige davon über ein Jahr alt.

„Wie viel kostet das pro Monat?“, fragte Tom. 0,023 $/GB/Monat × 340 GB = 7,82 $/Monat. Einzeln gering. Aber es hatte sich ein Jahr lang angesammelt, ohne dass es jemand bemerkte.

Die Lösung: jeder Bucket eine Lebenszyklusregel hinzufügen.

```
AbortIncompleteMultipartUpload:
  DaysAfterInitiation: 7
```

Nach sieben Tagen wird jeder unvollständige Multipart-Upload automatisch aufgeräumt. Das läuft unbegrenzt ohne weitere Aufmerksamkeit.

„Wenn all das ein ganzes Jahr lang dort gelegen hätte – sagen wir 94 $, die wir für fehlgeschlagene Uploads ausgegeben haben“, sagte Leo.

„Für fehlgeschlagene Uploads“, bestätigte Tom. „Nicht einmal für erfolgreichen Speicher. Das ist die Definition von Infrastrukturverschwendung.“

**EBS: Right-Sizing und das gp3-Upgrade**

Die Preisgestaltung von EBS-Volumes hat zwei Komponenten:

1. Speicher (pro GB pro Monat)
2. Provisionierte IOPS und Durchsatz (wenn Sie io1/io2 nutzen oder für zusätzliche gp3-Leistung zahlen)

**Die gp3-Chance**: In Kapitel 6 haben wir festgestellt, dass gp3 der aktuelle Standard und günstiger als gp2 ist. Wenn Nimbus Volumes hatte, die vor der Verfügbarkeit von gp3 erstellt wurden (es startete im Dezember 2020), könnten diese noch gp2 sein.

Die Migration ist unkompliziert: den Volume-Typ in der AWS-Konsole oder per CLI von gp2 auf gp3 ändern. Keine Ausfallzeit erforderlich. Das Volume bleibt während der Umstellung verfügbar. Die Leistungsmerkmale sind gleich oder besser – gp3 bietet 3.000 IOPS und 125 MB/s Basis-Durchsatz, verglichen mit gp2s berstbarem Modell, das bei kleineren Volumes inkonsistent sein konnte.

„Moment – aber *warum* würden wir es so machen?“, fragte Maya. „Wenn gp3 günstiger und mindestens so gut wie gp2 ist, warum hat AWS nicht einfach alle automatisch migriert?“

„Weil AWS keine einseitigen Änderungen an der Infrastruktur von Kunden vornimmt“, sagte Tom. „Auch keine vorteilhaften. Die Änderung könnte theoretisch Nebenwirkungen für irgendeine Arbeitslast haben. Der Kunde muss sie initiieren. Deshalb zahlen Tausende von Teams Jahre nach dem Start von gp3 immer noch gp2-Preise, einfach weil niemand nachgeschaut hat.“

Tom beschloss, die gp3-Migration an einem Samstagmorgen durchzuführen – dieselbe Morgendisziplin, die er auf die EC2-Preisanalyse angewandt hatte. Ruhige Zeit. Keine Standups. Nur die AWS-Konsole und ein Plan.

Er hatte 8 Volumes in der Produktionsumgebung identifiziert, die noch gp2 waren: die vier Root-Volumes der API-Server, zwei Volumes, die an Hintergrundprozessoren angeschlossen waren, und zwei Legacy-Daten-Volumes, die erstellt worden waren, bevor die gp3-Migration zur Standardpraxis für neue Bereitstellungen geworden war. Zusammen umfassten sie 960 GB.

Der Migrationsprozess war ein einziger API-Aufruf pro Volume:

```bash
aws ec2 modify-volume \
  --volume-id vol-0a1b2c3d4e5f67890 \
  --volume-type gp3 \
  --iops 3000 \
  --throughput 125
```

Die Parameter `--iops 3000` und `--throughput 125` entsprachen den Basis-Standardwerten von gp3. Für gp2 hatte Tom zuerst die CloudWatch-Metriken geprüft: Die durchschnittlichen IOPS auf jedem Volume lagen zwischen 200 und 800. Keines davon brauchte mehr als die 3.000-IOPS-Basis, die gp3 kostenlos bereitstellte. Der Durchsatz war ähnlich komfortabel – deutlich innerhalb des 125-MB/s-Standards.

„Was, wenn ein Volume nach dem Wechsel mehr IOPS braucht?“, fragte Maya, als Tom den Migrationsplan erklärte.

„Wir können die provisionierten IOPS auf einem gp3-Volume jederzeit erhöhen“, sagte Tom. „Die Migration legt nichts fest. Wenn wir mit 3.000 IOPS auf gp3 gehen und feststellen, dass das nicht ausreicht, modifizieren wir das Volume erneut, um mehr hinzuzufügen. Die Modifikation ist live – keine Ausfallzeit, kein Aushängen.“

„Und gp2 kann nicht direkt modifiziert werden?“

„gp2 kann direkt auf gp3 modifiziert werden. Was man nicht kann, ist von gp3 zurück auf gp2 zu gehen – zumindest nicht einfach, und es gibt keinen Grund dafür.“

Die tatsächliche Migration dauerte 73 Minuten vom ersten Befehl bis zur Fertigstellung über alle 8 Volumes hinweg. AWS modifizierte jedes Volume, während es eingehängt und in Benutzung war. Die API-Server empfingen die ganze Zeit über weiter Traffic. CloudWatch zeigte während der Umstellung keine Spitzen in der I/O-Latenz – der Übergang war für die laufende Anwendung völlig transparent.

„So sieht ‚keine Ausfallzeit erforderlich‘ tatsächlich aus“, sagte Leo und betrachtete die Vorher-Nachher-Metriken, die Tom erfasst hatte. „Ich nahm an, ‚keine Ausfallzeit‘ bedeute ‚kurzer Neustart‘. Es bedeutet, dass sich aus Sicht der Anwendung buchstäblich nichts ändert.“

Die Einsparung: gp2 kostete 0,10 $/GB/Monat; gp3 kostete 0,08 $/GB/Monat. Auf 960 GB: 96 $/Monat gegenüber 76,80 $/Monat. Monatliche Einsparung: 19,20 $. Für sich genommen nicht transformativ, aber die Disziplin, die es darstellte, war es. Jedes neue Volume, das von diesem Zeitpunkt an erstellt wurde, verwendete standardmäßig gp3. Die organisatorische Regel, die Tom an diesem Morgen schrieb: keine gp2-Volumes. Jeder Ingenieur, der ein EBS-Volume erstellt, sollte gp3 verwenden, es sei denn, es gibt einen bestimmten, dokumentierten Grund dagegen.

**IOPS und Durchsatz**: gp3-Volumes kommen standardmäßig mit 3.000 IOPS und 125 MB/s Durchsatz, ohne Aufpreis. Sie können mehr provisionieren, wenn Ihre Arbeitslast es braucht. Prüfen Sie, ob die provisionierte Leistung tatsächlich genutzt wird.

Im selben Audit fand Tom zwei Volumes mit 10.000 provisionierten IOPS – eine Legacy-Einstellung aus der Zeit vor seinem Eintritt, dimensioniert für eine Datenbank, die seitdem zu Aurora migriert war. Er prüfte die CloudWatch-Metriken: Die tatsächlichen durchschnittlichen IOPS waren 1.200. Er reduzierte die provisionierten IOPS auf 4.000 (ein Sicherheitsabstand über dem tatsächlichen Spitzenwert).

Monatliche Einsparung: 68 $ an provisionierten IOPS-Kosten, die für Leistungsreserve gezahlt worden waren, die niemand nutzte.

**Snapshot-Lebenszyklus**: EBS-Snapshots sind inkrementell (jeder Snapshot speichert nur Änderungen seit dem vorherigen), aber sie sammeln sich an. Alte Snapshots aus den Anfangstagen von Nimbus existierten noch. Tom behielt 30 Tage tägliche Snapshots und löschte den Rest.

**EFS: Speicherklassen und die Intelligent-Tiering-Entscheidung**

Amazon EFS hat seine eigenen Speicherklassen:

- **EFS Standard**: Für Dateien, die häufig abgerufen werden. Höhere Kosten.
- **EFS Infrequent Access (IA)**: Für Dateien, die seit 30 Tagen nicht abgerufen wurden. 92 % günstiger als Standard.
- **EFS Archive**: Für Dateien, die seit 90 Tagen nicht abgerufen wurden. Noch günstiger als IA.

**EFS Intelligent-Tiering**: Verschiebt Dateien automatisch zwischen Speicherklassen basierend auf Zugriffsmustern.

Tom aktivierte Intelligent-Tiering auf dem EFS-Volume. Sechs Wochen später hatten sich 68 % der Dateien zu Infrequent Access verschoben. Die monatlichen EFS-Kosten sanken von 89 $ auf 31 $.

Aber die Wahl zwischen Intelligent-Tiering und einer manuellen Lebenszyklusregel war nicht trivial. Tom hatte es bedacht.

„Moment – aber *warum* würden wir Intelligent-Tiering machen, statt einfach eine manuelle Lebenszyklusregel zu setzen?“, fragte Maya. „Wenn wir wissen, dass auf Dateien, die älter als 30 Tage sind, nicht zugegriffen wird, warum nicht einfach die Regel setzen und fertig?“

„Intelligent-Tiering handhabt Dateien, die zurückkommen“, sagte Tom. „Wenn ich eine Lebenszyklusregel setze, um Dateien nach 30 Tagen in IA zu verschieben, und dann jemand auf eine Datei zugreift, die seit sechs Monaten in IA ist, bleibt sie in IA. Mit Intelligent-Tiering wird die Datei, wenn der Zugriff wieder aufgenommen wird, automatisch zurück nach Standard verschoben. Es ist bidirektional.“

„Wann würdest du dann die Lebenszyklusregel bevorzugen?“

„Wenn du sicher bist, dass das Zugriffsmuster einseitig ist. Archivprotokolle – sie werden geschrieben, sie altern, sie werden einmal für ein Compliance-Audit abgerufen und dann nie wieder. Für dieses Muster ist eine Lebenszyklusregel, die nach 90 Tagen nach Archive verschiebt, günstiger als Intelligent-Tiering, weil du den Überwachungsaufwand nicht zahlst.“

„Es gibt eine Überwachungsgebühr?“

„Bei S3 Intelligent-Tiering, ja, weshalb wir die Ökonomie kleiner Objekte damals im S3-Lebenszyklus-Kapitel behandelt haben. Bei EFS geht es bei der Entscheidung hauptsächlich um das Zugriffsmuster: Wenn Dateien wieder heiß werden könnten, ist Intelligent-Tiering sicherer. Wenn sie nur in eine Richtung altern, ist eine Lebenszyklusregel nach Archive günstiger und einfacher.“

**S3-Kostenzuordnungs-Tags: Herausfinden, wer was ausgibt**

Während Nimbus wuchs, speicherten mehrere Teams Daten in S3. Das Analytics-Team hatte seine eigenen Buckets. Das Engineering-Team hatte seine Buckets. Das Restaurant-Daten-Team hatte seine Buckets.

Die Rechnung zeigte nur „S3: 198 $“. Es gab keine Aufschlüsselung nach Team.

**Kostenzuordnungs-Tags** ermöglichen es Ihnen, AWS-Ressourcen mit Geschäftsmetadaten (Team, Projekt, Umgebung) zu taggen und dann die Kosten nach diesen Tags aufgeschlüsselt im AWS Cost Explorer zu sehen.

Tom fügte allen S3-Buckets Tags hinzu:
```
Team: analytics
Environment: production
Project: nimbus-core
```

Nach einem Abrechnungszyklus mit Tagging konnte er sehen: „Der Data Lake des Analytics-Teams kostet 74 $/Monat. Engineering-Backups kosten 43 $/Monat. Restaurant-Daten kosten 81 $/Monat.“

Jetzt konnte er Budgetgespräche mit jedem Team führen, statt nur auf eine aggregierte Zahl zu schauen.

**AWS Cost Explorer und AWS Budgets**

**AWS Cost Explorer**: Visualisiert historische und prognostizierte Kosten nach Service, Region, Tag und Nutzungsart. Unverzichtbar, um zu verstehen, wohin das Geld fließt.

**AWS Budgets**: Setzt Benachrichtigungen, wenn Kosten einen Schwellenwert überschreiten (oder voraussichtlich überschreiten). Sie können nach Service, Region, Tag oder Konto budgetieren.

Tom richtete drei Budgets ein:

1. Monatsgesamtrechnung: Alarm bei 90 % des budgetierten Betrags
2. EC2 On-Demand: Alarm, wenn die On-Demand-Ausgaben 500 $/Monat überschreiten (signalisiert eine Savings-Plan-Lücke)
3. Datenübertragung nach außen: Alarm bei 200 $/Monat (Datenübertragungskosten können unerwartet ansteigen)

Die Budgets sendeten Benachrichtigungen an einen Slack-Kanal. Das Team sah, wann es sich den Grenzen näherte, anstatt es auf der monatlichen Rechnung zu entdecken.

**Der Beleg mit jeder Zeile: Cost and Usage Reports**

Cost Explorer beantwortete die meisten von Toms Fragen. Dann stieß er auf eine, die es nicht konnte: „Welche S3-Buckets genau haben Stunde für Stunde die Spitze vom letzten Dienstag verursacht – und unter welchen Tags?“

Für Fragen von forensischer Genauigkeit bietet AWS den **Cost and Usage Report (CUR)** – jetzt über **Data Exports** geliefert – die detailliertesten Abrechnungsdaten, die AWS produziert: jeder Posten, **pro Ressource, pro Stunde**, mit Tags, geliefert an einen S3-Bucket, der Ihnen gehört. Es ist kein Dashboard; es ist das rohe Hauptbuch. Das Standardmuster ist, ihn mit Athena abzufragen (er landet in einem Spaltenformat) oder ihn an QuickSight für Dashboards weiterzugeben.

Die Arbeitsteilung in der Prüfung: **Cost Explorer** = interaktive Visualisierung und Prognosen in der Konsole. **Budgets** = Benachrichtigungen bei Schwellenwerten. **CUR/Data Exports** = die granularsten Daten, geliefert an S3, für Ihre eigene Analyse. Wenn eine Frage sagt „Kostendaten auf Ressourcenebene, stündlich, für benutzerdefinierte Analyse“ – das ist der CUR, nicht Cost Explorer.

„Haben wir bedacht, was passiert, wenn wir uns das einfach nie ansehen?“, fragte Priya. „Wir haben in zwei Tagen 6.700 $ gefunden. Was versteckt sich noch?“

„Regelmäßige Audits“, fuhr sie fort. „Monatliche Cost-Explorer-Überprüfungen. AWS Trusted Advisor markiert nicht angeschlossene Volumes und ungenutzte Ressourcen automatisch. Automatisiert die Bereinigung bekannter Verschwendungsmuster: Snapshots löschen, die älter als N Tage sind, bei nicht angeschlossenen EBS-Volumes alarmieren, alte S3-Versionen auslaufen lassen.“

**S3 Requester-Pays: Die Übertragungskosten verlagern**

Während des Speicher-Audits fand Tom eine Situation, die er nicht erwartet hatte.

Die Restaurantpartner von Nimbus mussten ihre Menü-Foto-Assets herunterladen – die verarbeiteten, in der Größe angepassten Bilder, die die Bestellplattform den Kunden auslieferte. Für ein Restaurant, das sein Menü aktualisierte, bedeutete dies, irgendwo zwischen 50 MB (eine kleine Aktualisierung) und 800 MB (eine vollständige saisonale Auffrischung) an Bilddateien herunterzuladen. Derzeit zahlte Nimbus die ausgehenden Datenübertragungskosten bei jedem Download: 0,09 $/GB von S3 zum Standort des Partners.

Bei 287 Restaurantpartnern, mit durchschnittlich einer Menü-Auffrischung pro Monat und einem durchschnittlichen Download von 200 MB, war die Rechnung: 287 × 0,2 GB × 0,09 $ = 5,17 $/Monat. Bei der aktuellen Größenordnung nicht erheblich.

„Was passiert bei 2.000 Restaurants?“, fragte Tom.

„Dieselbe Rechnung“, sagte Maya. „Etwa 36 $/Monat.“

„Was ist mit 10.000 Restaurants, und Partner laden große saisonale Asset-Pakete herunter – sagen wir 2 GB für Feiertags-Menüaktualisierungen?“

Er rechnete es aus. 10.000 × 2 GB × 0,09 $ = 1.800 $/Monat an Datenübertragung, nur dafür, dass Partner Assets herunterladen, die sie brauchen.

„Das ist eine echte Zahl“, sagte Priya.

„Haben wir bedacht, was passiert, wenn diese Rechnung in demselben Monat erscheint, in dem wir versuchen, eine Series B abzuschließen?“, fuhr Priya fort.

„S3 Requester-Pays“, sagte Tom.

S3 hat ein Feature namens Requester-Pays: Wenn es auf einem Bucket aktiviert ist, zahlt die anfragende Stelle – nicht der Bucket-Eigentümer – die Datenübertragungs- und Anfragekosten. Der Bucket-Eigentümer zahlt weiterhin für den Speicher. Aber jeder Download aus dem Bucket wird dem AWS-Konto des Anfragenden in Rechnung gestellt.

Der Kompromiss ist der Zugriff. Requester-Pays erfordert, dass Anfragende AWS-Kunden mit einem gültigen Konto sind – nicht authentifizierter oder anonymer Zugriff auf einen Requester-Pays-Bucket gibt einen Fehler zurück. Für die Restaurantpartner von Nimbus, die Unternehmen mit unterschiedlichem technischen Niveau waren, war es kein praktikables Modell, von ihnen ein AWS-Konto zu verlangen, um ihre eigenen Menü-Assets herunterzuladen.

„Wir können Requester-Pays nicht für den direkten Partnerzugriff machen“, sagte Maya. „Die meisten unserer Partner werden kein AWS-Konto einrichten, um Fotos herunterzuladen.“

„Richtig“, sagte Tom. „Aber wir können es für die B2B-Integrationen nutzen – die größeren Ketten, die technische Teams und AWS-Konten haben. Nicht das kleine Restaurant an der Ecke, sondern die 50-Standorte-Burgerkette, die ein Engineering-Team hat und direkt mit unserer API integriert. Für dieses Segment ergibt Requester-Pays Sinn.“

„Und für den Rest?“

„Wir geben ihnen ein Download-Portal, das vorsignierte S3-URLs verwendet. Die Übertragung läuft weiterhin über AWS, die Kosten sind weiterhin unsere – aber sie sind auch bereits in die Partnerpreise eingerechnet. Die Requester-Pays-Option ist etwas, das wir in Vertragsverhandlungen für größere Partner einbauen würden, nicht etwas, das wir heute einsetzen.“

Tom fügte es der Tabelle unter „zukünftige Optimierungen“ hinzu: S3 Requester-Pays für Enterprise-Partner mit AWS-Konten. Bei 2.000 Restaurants mit 20 % Enterprise-Kunden, bei 2 GB monatlichen Downloads: potenziell 72 $/Monat auf Partner verlagert. Klein bei dieser Größenordnung, aber dasselbe Muster wird bedeutsam, wenn die Asset-Pakete wachsen. Überprüfen, wenn die Partnerzahl 1.000 übersteigt oder wenn Enterprise-Partner beginnen, größere saisonale Pakete zu ziehen.

„Die Lektion ist dieselbe wie immer“, sagte Tom. „Wisse, was die Kosten in der Größenordnung werden, bevor du in der Größenordnung bist. Das 5-$-Problem von heute ist das 1.800-$-Problem in drei Jahren. Jetzt dafür zu entwerfen kostet nichts.“

**Governance: Auto-Löschen vs. nur Alarmieren**

Die Automatisierungsfrage war diejenige, die die meiste Uneinigkeit erzeugte.

„Sollten wir nicht angeschlossene EBS-Volumes nach 14 Tagen automatisch löschen?“, fragte Tom. „AWS-Config-Regeln können sie markieren. Lambda kann sie automatisch löschen.“

„Nein“, sagte Priya sofort.

„Warum nicht?“

„Weil Auto-Löschen bedeutet, dass wir irgendwann etwas löschen werden, das aus einem Grund nicht angeschlossen war. Vielleicht hat jemand ein Volume abgehängt, um es auf eine andere Instanz zu verschieben, und es liegt seit 12 Tagen da, während eine Änderung geprüft wird. Auto-Löschen an Tag 14 zerstört diese Daten.“

„Also nur Alarmieren?“, sagte Tom. „Wir bekommen eine Benachrichtigung, löschen aber nicht automatisch.“

„Erst alarmieren“, sagte Priya. „Zwinge einen Menschen, die Entscheidung zu treffen. Der Alarm lautet: ‚Dieses Volume ist seit 14 Tagen nicht angeschlossen. Tagge es als `keep: true`, wenn du es brauchst, sonst wird es bei der nächsten Überprüfung zur Löschung markiert.‘ Die menschliche Entscheidung wird dann durch das Vorhandensein oder Fehlen des Tags dokumentiert.“

„Das ist langsamer“, sagte Leo.

„Es ist langsamer und zerstört mit geringerer Wahrscheinlichkeit Daten“, sagte Priya. „Wir haben bereits 3.200 $ durch Vernachlässigung verloren. Wir haben keine Daten durch Automatisierung verloren. Ich weiß, was ich lieber pflegen würde.“

Tom landete bei einem Hybrid: Auto-Alarm nach 7 Tagen, ein `keep: true`-Tag erforderlich, um zukünftige Alarme zu unterdrücken, und ein wöchentlicher Bericht über alle nicht getaggten und nicht angeschlossenen Volumes, den das Team gemeinsam überprüft. Kein Auto-Löschen.

**Variante: Wenn die Bereinigung mehr kostet, als sie spart**

Wenn Sie die Sicherheit zusätzlicher Snapshots brauchen, behalten Sie sie – aber jeder Snapshot, der älter als 90 Tage ist und nicht abgerufen wird, sollte seinen Platz verdienen. Der Kompromiss ist asymmetrisch: Einen Snapshot zu löschen, den Sie gebraucht hätten, kostet einen Vorfall; einen Snapshot zu behalten, den Sie nicht gebraucht hätten, kostet nur eine kleine monatliche Gebühr. Für Compliance-sensible Daten sind die Kosten, alte Snapshots zu behalten, real, aber meist geringer als die Kosten, sie nicht zu haben, wenn ein Prüfer fragt. Für Entwicklungs-Snapshots aus einem Test, der vor 14 Monaten lief, geht die Rechnung in die andere Richtung.

Wenn Sie EFS Intelligent-Tiering für Dateien mit unsicheren Zugriffsmustern aktivieren, spart das automatische Tiering Geld und erfordert keinen laufenden Eingriff. Wenn die Dateien vorhersehbar in Richtung Archivzugriff altern, ist eine direkte Lebenszyklusregel einfacher. Messen Sie, bevor Sie aktivieren.

SAA-C03-Bezug: Die Prüfung testet, ob Sie zwischen S3-Speicherklassen (Standard, IA, Glacier) bei gegebenem Zugriffsfrequenz-Szenario wählen können. Dieselbe Logik gilt hier – die richtige Klasse hängt davon ab, wie oft auf die Daten zugegriffen wird.

**Die Kosten der Vernachlässigung**

Tom baute eine Tabelle. Er berechnete, wie viel Nimbus ausgegeben hatte für:

- Nicht angeschlossene EBS-Volumes (16 Monate): 3.200 $
- Alte S3-Snapshots (entdeckt und gelöscht): 890 $
- Unnötige provisionierte IOPS: 816 $
- Einsparungen durch gp2-zu-gp3-Migration (prognostiziert, wenn früher durchgeführt): 346 $ über 18 Monate
- Sich ansammelnde nicht aktuelle S3-Versionen: 1.340 $
- Unvollständige Multipart-Uploads: 94 $

Identifizierte Gesamtverschwendung: ungefähr 6.700 $ über 18 Monate.

„Sechstausendsiebenhundert Dollar“, sagte Maya.

„Durch Vernachlässigung“, sagte Tom. „Nicht durch falsche architektonische Entscheidungen. Durch das Nicht-Aufräumen.“

„Was ist die systematische Lösung?“

„Und“, fügte Tom hinzu, „mach die Kostenhygiene zum Teil des Bereitstellungsprozesses. Wenn ein Ingenieur eine EC2-Instanz beendet, wird das EBS-Volume automatisch gelöscht, es sei denn, er entscheidet sich explizit dagegen.“

## Stärken und Grenzen

**Disziplin der Kostenoptimierung**:

- Regelmäßige Überprüfungen fangen sich ansammelnde Verschwendung ab, bevor sie erheblich wird
- Tagging ermöglicht Verantwortlichkeit – Teams sehen ihre eigenen Kosten
- Automatisierte Benachrichtigungen verhindern Abrechnungsüberraschungen
- Lebenszyklusrichtlinien und Right-Sizing sind oft Set-and-Forget-Einsparungen

**Wo es kompliziert wird**:

- Verschwendung über ein großes Konto mit vielen Teams zu identifizieren erfordert zentrale Werkzeuge
- Manche Verschwendung ist beabsichtigt (zusätzliche Snapshots „für alle Fälle“ behalten) – der Kosten-/Risiko-Kompromiss ist eine Ermessensentscheidung
- Die gp3-Migration erfordert sorgfältige Validierung (IOPS- und Durchsatz-Standardwerte können sich in manchen Grenzfällen vom gp2-Verhalten unterscheiden)
- Kostenzuordnungs-Tags erfordern Disziplin über alle Teams hinweg – inkonsistentes Tagging macht die Daten unvollständig
- Auto-Löschen-Automatisierung ist für Speicher gefährlich – Alarmieren-und-Überprüfen ist sicherer für Volumes und Snapshots

## Zusammenfassung

Das Speicher-Audit hatte zwei Tage gedauert. Die Verschwendung, die es aufdeckte – 6.700 $ über 18 Monate unsichtbarer Ansammlung –, war weniger ein Versagen der Entscheidungsfindung als ein Versagen der Aufmerksamkeit. Nichts war absichtlich falsch konfiguriert worden. Die Snapshots, die nicht angeschlossenen Volumes, die sich ansammelnde Versionshistorie, die unvollständigen Multipart-Uploads: Jedes ergab zum damaligen Zeitpunkt Sinn und wurde einfach nie erneut betrachtet. Die Lektion handelte nicht von bestimmten AWS-Diensten. Sie handelte davon, die Gewohnheit des Hinschauens aufzubauen.

- **Speicherkosten sammeln sich unsichtbar an** – regelmäßige Audits sind unerlässlich.
- **Nicht angeschlossene EBS-Volumes** sind eine häufige Quelle der Verschwendung. Löschen Sie sie (oder automatisieren Sie die Löschung, wenn Instanzen beendet werden).
- **EBS-Right-Sizing**: Migrieren Sie gp2 zu gp3 (typischerweise 20 % Einsparung). Entfernen Sie überschüssige provisionierte IOPS.
- **S3-Versionierung**: Aktivieren Sie Lebenszyklusregeln für nicht aktuelle Versionen, um nicht für unbegrenzte Versionshistorie zu zahlen.
- **Unvollständige Multipart-Uploads**: Fügen Sie jedem Bucket eine `AbortIncompleteMultipartUpload`-Lebenszyklusregel hinzu. Das wird oft übersehen und sammelt sich still an.
- **EFS Intelligent-Tiering**: Verschiebt Dateien automatisch in günstigere Stufen basierend auf der Zugriffsfrequenz. Bei vorhersehbaren Zugriffsmustern können manuelle Lebenszyklusregeln günstiger sein.
- **Governance**: Bei nicht angeschlossenen Volumes nach 7–14 Tagen alarmieren; explizites Tagging erfordern, um es zu unterdrücken. Vermeiden Sie Auto-Löschen für Speicherressourcen.

## Prüfungstipps

*SAA-C03-Domäne: Design Cost-Optimized Architectures (Domäne 4, Aufgabe 4.1)*

- **Kostenzuordnungs-Tags**: Aktivieren Sie benutzerdefinierte Tags für die Kostenzuordnung in der Billing-Konsole; taggen Sie dann Ressourcen. Cost Explorer zeigt Aufschlüsselungen nach Tag. Prüfungsszenario: „identifizieren, welche Abteilung die meisten S3-Kosten verursacht“ → Kostenzuordnungs-Tags.
- **AWS Trusted Advisor**: Identifiziert unterausgelastete EC2-Instanzen, nicht angeschlossene EBS-Volumes, ungenutzte Load Balancer und andere Verschwendung. Grundlegende Prüfungen kostenlos; vollständige Prüfungen erfordern Business/Enterprise Support.
- **EBS-Kostenkomponenten**: Speicher (pro GB), provisionierte IOPS (wenn io1/io2 oder extra gp3), Durchsatz (wenn extra gp3). Wissen Sie, welche Komponenten right-sized werden können.
- **S3-Versionierungskosten**: Nicht aktuelle Versionen werden gespeichert und zum selben Satz wie aktuelle Versionen berechnet. Lebenszyklusregeln, die nicht aktuelle Versionen auslaufen lassen, sind entscheidend für die Kostenkontrolle in versionierten Buckets.
- **AWS Compute Optimizer**: Analysiert die EC2-Nutzung und empfiehlt right-sized Instanztypen. Prüfungssignal: „EC2-Kosten durch Auswahl des richtigen Instanztyps reduzieren“ → Compute Optimizer.
- **AWS Cost Anomaly Detection**: Verwendet ML, um ungewöhnliche Ausgabenmuster zu erkennen. Prüfungssignal: „unerwartete Kostenerhöhungen automatisch erkennen“ → Cost Anomaly Detection.
- **Kostentool-Aufstellung**: interaktive Diagramme/Prognosen → Cost Explorer. Schwellenwert-Benachrichtigungen → Budgets. „Granularste Abrechnungsdaten auf Ressourcen-/Stundenebene, an S3 für benutzerdefinierte Analyse geliefert (Athena/QuickSight)“ → **Cost and Usage Report (Data Exports)**.
- **Requester Pays**: „einen großen S3-Datensatz teilen; Verbraucher zahlen ihre eigenen Download-Kosten“ → S3 Requester Pays (der Eigentümer zahlt weiterhin nur den Speicher; Anfragende müssen sich mit einem AWS-Konto authentifizieren).

## Übungen

**Übung 1 — Wiederholung**

Erklären Sie, warum nicht angeschlossene EBS-Volumes Kosten verursachen, obwohl keine EC2-Instanz sie verwendet. Welchen Prozess sollten Ingenieure beim Beenden einer EC2-Instanz befolgen, um diese Verschwendung zu vermeiden?

*(Hinweis: EBS-Volumes speichern Daten auf physischer Festplatte, und diese Festplatte kostet Geld, unabhängig davon, ob darauf gelesen wird.)*

**Übung 2 — SAA-C03-Szenario**

*Szenario*: Die AWS-Rechnung eines Unternehmens ist innerhalb von sechs Monaten von 5.000 $ auf 9.000 $/Monat gestiegen, aber es wurden keine neuen Dienste hinzugefügt. Das Engineering-Team vermutet, dass Speicherkosten das Problem sind. Welche Kombination von AWS-Tools würde die Kostensteigerung am BESTEN identifizieren und erklären?

A) AWS CloudTrail, um API-Aufrufe zu überprüfen und zu identifizieren, wer neue Ressourcen erstellt hat  
B) AWS Cost Explorer für die Kostenaufschlüsselung auf Service-Ebene und AWS Trusted Advisor für die Erkennung ungenutzter und nicht angeschlossener Ressourcen  
C) Amazon CloudWatch zur Überwachung der Ressourcenauslastung und zur Erstellung von Kostenalarmen  
D) AWS Config zur Identifizierung aller Ressourcen und ihres Compliance-Status

**Hinweis 1**: „Die Kostensteigerung identifizieren“ → Kostenaufschlüsselung nach Service visualisieren.

**Hinweis 2**: „Ungenutzte und nicht angeschlossene Ressourcen“ → ein bestimmtes Tool identifiziert diese proaktiv.

**Hinweis 3**: CloudTrail protokolliert API-Aufrufe; Cost Explorer zeigt Kostentrends. Welches ist nützlicher für die Kostenanalyse?

**Antwort**: B

**Erläuterung**: AWS Cost Explorer zeigt Kostentrends, aufgeschlüsselt nach Service, Region und Nutzungsart – perfekt, um zu identifizieren, welcher Dienst die Erhöhung verursacht hat. Die Kostenoptimierungsprüfungen von AWS Trusted Advisor identifizieren nicht angeschlossene EBS-Volumes, ungenutzte EC2-Instanzen, unterausgelastete Load Balancer und andere häufige Verschwendungsquellen.

**Warum nicht A?** CloudTrail protokolliert, wer Ressourcen wann erstellt hat, zeigt aber nicht direkt Kostentrends oder identifiziert Verschwendung.

**Warum nicht C?** CloudWatch überwacht die Ressourcenleistung (CPU, Speicher) – nützlich für Right-Sizing, aber nicht zur Identifizierung angesammelter Speicherverschwendung.

**Warum nicht D?** AWS Config verfolgt Ressourcenkonfigurationen und Compliance, ist aber kein Kostenanalyse-Tool.

*SAA-C03-Domäne: Design Cost-Optimized Architectures — Aufgabe 4.1*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Die S3-Rechnung von Nimbus zeigt 340 $/Monat für einen Bucket mit der Bezeichnung „backups“. Der Bucket hat die Versionierung aktiviert und enthält:

- Tägliche Datenbank-Snapshots (7 Tage reichen für ihre Richtlinie)
- Wöchentliche Voll-Backups (für 3 Monate aufbewahrt)
- Vierteljährliche Archive (für 7 Jahre für die Steuerkonformität aufbewahrt)

Entwerfen Sie eine Lebenszyklusrichtlinie für diesen Bucket, die die Kosten minimiert und gleichzeitig diese Aufbewahrungsanforderungen erfüllt. Welche Speicherklasse sollte jeder Datentyp verwenden? Wie würden Sie die Versionierung handhaben, um zu verhindern, dass sich alte Versionen ansammeln?

*(Es gibt keine eindeutig korrekte Antwort. Das Ziel ist, das Design von Lebenszyklusrichtlinien zu üben.)*

## Post-Credits-Szene

Tom veröffentlichte die Ergebnisse des Kosten-Audits an das Team.

Identifizierte Verschwendung: 6.700 $ über 18 Monate.
Erwartete jährliche Einsparungen durch implementierte Änderungen: 6.200 $.

Dann fügte er am Ende eine Zeile hinzu: „Dies beinhaltet nicht die Einsparungen durch Savings Plans (14.200 $/Jahr) oder S3-Lebenszyklusrichtlinien (7.800 $/Jahr). Kombinierte jährliche Optimierungswirkung: ungefähr 28.200 $.“

Maya las es zweimal.

„Das ist fast das Gehalt eines Junior-Ingenieurs“, sagte sie.

„An Verschwendung“, bestätigte Tom.

„Oder“, sagte Leo, „es ist der Beweis, dass diese Optimierungen früher durchzuführen diesen Junior-Ingenieur finanziert hätte.“

Tom sah ihn an.

„Das ist die richtige Denkweise“, sagte er. „Bei der Kostenoptimierung geht es nicht ums Kürzen. Es geht darum, nicht für Dinge zu zahlen, die keinen Wert schaffen.“

Maya heftete das Dokument an das Unternehmens-Wiki.

Im nächsten Kapitel: Die Datenbankebene erhält dieselbe Behandlung, und Tom entdeckt den einen Ort, an dem er tatsächlich zu wenig investiert hatte.
