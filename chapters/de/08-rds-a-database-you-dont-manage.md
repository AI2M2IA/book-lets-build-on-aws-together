# Kapitel 8: Der Datenbankadministrator, der nie Krankenschicht macht

Es war 3 Uhr morgens, als die Warnmeldung eintraf.

Der Datenbankserver benötigte einen Sicherheitspatch – die Art, die einen Neustart erforderte. Die Schwachstelle war real, der Patch war verfügbar und das Fenster zur Anwendung ohne Beeinträchtigung der Kunden war gerade jetzt, mitten in der Nacht, wenn der Verkehr gering war.

Priya war die Einzige, die wach war. Sie installierte den Patch, startete den Server neu, beobachtete die Protokolle, bis die Anwendung wieder online war, und ging um 4:15 Uhr morgens ins Bett.

Am Morgen erzählte sie dem Team, was passiert war. Es herrschte Schweigen.

„Das wird wieder passieren“, sagte Tom.

„Es wird jedes Mal passieren, wenn ein Patch veröffentlicht wird“, sagte Priya. „Und es gibt immer Patches. Da muss es einen besseren Weg geben.“

Es gab einen. Es erforderte, die Idee aufzugeben, dass sie die Datenbank selbst verwalten mussten.

**Das Traditionelle Datenbankproblem**

Wenn Sie eine Datenbank selbst auf einer EC2-Instanz betreiben, sind Sie für alles verantwortlich.

Die Installation der Datenbanksoftware. Die sichere Konfiguration. Die Patchen, wenn Sicherheitsschwachstellen entdeckt werden. Die Erstellung von Backups. Das Testen, ob die Backups tatsächlich funktionieren (ein Schritt, den die meisten Teams bis sie es zu spät wissen, überspringen). Die Überwachung der Festplattenkapazität. Die Einrichtung der Replikation für Redundanz. Die Konfiguration des Failover, wenn der primäre Server ausfällt. Die Optimierung der Abfrageleistung. Die Verwaltung der Verbindungen unter Last.

Keines davon ist die Anwendung. Nichts davon fügt Funktionen hinzu. Alles davon erfordert Expertise.

Die meisten Entwicklungsteams sind keine Datenbankadministratoren. Dies führt zu einem vorhersehbaren Muster: Die Datenbank wird installiert, minimal konfiguriert und dann größtenteils vergessen, bis etwas katastrophal schief geht.

„Ist das, was wir getan haben?“, fragte Maya.

Leos Antwort war Schweigen, was ja auch eine Zustimmung war.

**Amazon RDS: Der Verwaltete Datenbankdienst**

**Amazon RDS** – Relational Database Service – übernimmt die operative Belastung des Betriebs einer relationalen Datenbank, sodass Sie dies nicht müssen.

Mit RDS verwaltet AWS:

- Die Installation und Patchen des Datenbank-Engines
- Automatisierte Backups (gespeichert in S3, aufbewahrt für bis zu 35 Tage)
- Automatisierter Failover (wenn der primäre Server ausfällt, übernimmt eine Standby-Instanz automatisch)
- Überwachung und Metriken
- Verschlüsselung im Ruhezustand und während der Übertragung
- Automatisches Skalieren der Speicherung (falls Sie es aktivieren, wächst die Festplatte, wenn sie voll ist)

Sie verwalten:

- Das Datenbank-Schema (die Struktur Ihrer Tabellen)
- Ihre Abfragen und Anwendungslogik
- Wer Zugriff auf die Datenbank hat
- Welche Instanztyp die Datenbank ausführt
- Parameter-Tuning (obwohl RDS sinnvolle Standardwerte bereitstellt)

Das Analogie: die Einstellung eines Datenbankadministrators, der nie Krankenschichten nimmt, nie Konfigurationsfehler macht, täglich automatische Backups erstellt und sich selbst repariert, wenn etwas kaputt geht – aber der nicht Ihre Anwendungslogik schreibt.

**Unterstützte Engines**

RDS unterstützt mehrere beliebte Datenbank-Engines:

- **MySQL** – die am weitesten verbreitete Open-Source-relationale Datenbank
- **PostgreSQL** – leistungsstark, erweiterbar, zunehmend beliebt für komplexe Arbeitslasten
- **MariaDB** – Open-Source-MySQL-Fork, vollständig kompatibel
- **Oracle** – Enterprise-Grade, wird in großen Organisationen mit Legacy-Anforderungen verwendet
- **Microsoft SQL Server** – für Windows-lastige Umgebungen
- **Amazon Aurora** – AWS’s eigener MySQL/PostgreSQL-kompatibler Engine, für die Cloud gebaut (wir behandeln Aurora ausführlich im Kapitel 24)

Für Nimbus war die Wahl PostgreSQL. Es war das, was Leo kannte, und es handelte sich um relationale Daten. Die Engine-Auswahl ist weniger wichtig als man denkt, für die meisten Anwendungen – die betrieblichen Vorteile von RDS gelten unabhängig davon.

**Multi-AZ: Die Standby, die übernimmt**

Dies ist die Funktion, die das Zuverlässigkeitsrechnung komplett verändert.

**Multi-AZ-Bereitstellung** bedeutet, dass RDS eine synchrone Standby-Instanz in einer anderen Availability Zone vom primären Instanz betreibt. Jeder Commit, der an der primären Instanz erfolgt, wird synchron zur Standby Instanz repliziert, bevor der Commit bestätigt wird.

Wenn der primäre Instanz ausfällt – Hardwarefehler, AZ-Ausfall, Softwareabsturz – übernimmt RDS automatisch die Standby Instanz. Der DNS-Eintrag für den Datenbank-Endpunkt wird aktualisiert. Ihre Anwendung stellt sich mit der neuen primären Instanz wieder her.

Der Failover dauert 60–120 Sekunden. Während dieser Zeit wird Ihre Anwendung Verbindungsprobleme haben. Gut geschriebene Anwendungen sollten dies jedoch elegant behandeln (Verbindungs-Retries mit Backoff).

Die Standby Instanz ist keine Read Replica. Sie dient nicht zum Lesen von Traffic. Ihr einziger Zweck ist, bereit zu sein, die primäre Instanz zu übernehmen.

Tom: „Wie viel kostet Multi-AZ?“

Ungefähr das Doppelte der Kosten einer einzelnen Instanz – weil Sie buchstäblich zwei Datenbank Instanzen betreiben. Die Standby Instanz kostet das gleiche wie die primäre Instanz.

Tom: „Und wie viel kostet ein ungeplanter Ausfall?“

Er beantwortete seine eigene Frage, indem er den Umsatz pro Stunde während ihres Freitag-Peak-Zeiten schätzte.

Multi-AZ wurde am Nachmittag aktiviert.

**Automatisierte Backups und Point-in-Time Recovery**

RDS nimmt täglich automatisierte Backups. AWS speichert diese Backups in S3 (verwaltet von RDS – Sie sehen sie nicht direkt in Ihrem S3-Konsol) . Sie können die Datenbank zu jedem Zeitpunkt innerhalb Ihres Backup-Retention-Periode wiederherstellen.

Backups finden während eines konfigurierbaren **Wartungsfensters** statt – einem Zeitraum mit geringem Datenverkehr, typischerweise am frühen Morgen. Für die meisten Engine-Typen verursachen Backups keine Ausfallzeiten.

**Point-in-Time-Wiederherstellung** ist eines der wertvollsten Features: Sie können in jeden zweiten innerhalb Ihres Aufbewahrungszeitraums wiederherstellen. Nicht nur tägliche Snapshots – *jeder zweite*. Dies ist möglich, weil RDS kontinuierlich Transaktionsprotokolle zusätzlich zu täglichen Backups archiviert.

Wenn jemand versehentlich `DELETE FROM orders WHERE 1=1` um 14:37 Uhr ausführt, können Sie zu 14:36 Uhr wiederherstellen.

Leo entspannte sich deutlich, als er das verstand.

„Könnten wir aus dem von mir gelöschteten zurückstellen, von dem ich letzten Monat gesprochen habe, wiederhergestellt haben?“, fragte er.

„Vor RDS? Nein“, sagte Priya. „Nach RDS? Ja.“

**Read Replicas: Skalierung von Lesezugriffen**

Multi-AZ dient der Verfügbarkeit. **Read Replicas** dienen der Performance.

Eine Read Replica ist eine asynchrone Kopie Ihrer primären Datenbank, die Leseanfragen bedienen kann. Sie können für die meisten RDS-Engines bis zu fünf Read Replicas haben (mehr für Aurora).

Die Anwendung wird so modifiziert, dass Leseanfragen an die Replica und Schreibanfragen an die primäre Datenbank gesendet werden. Dies verteilt die Last: die primäre Datenbank bearbeitet Schreib- und komplexe Transaktionen; die Replicas bearbeiten Leseanfragen.

Wichtige Merkmale:

- Die Replikation ist **asynchron** – es kann eine kleine Verzögerung (Lag) zwischen der primären und der Replik-Datenbank geben. Wenn Sie einen Datensatz schreiben und sofort von der Replik lesen, sehen Sie ihn möglicherweise nicht sofort.
- Read Replicas können sich im selben Region oder in einer anderen Region befinden (Cross-Region Replicas erhöhen die Latenz, ermöglichen aber die geografische Verteilung).
- Read Replicas können in einem Disaster-Szenario zu eigenständigen Datenbanken gepromotioniert werden.

Für Nimbus: Menü-Lookups sind Reads. Bestellhistorien sind Reads. Der Großteil des Traffics ist Lese-Traffic. Das Hinzufügen einer Read Replica und das Routen von Reads darauf reduziert die Last der primären Datenbank erheblich.

Wir behandeln Read Replicas ausführlicher im Kapitel 24, wenn wir Aurora besprechen.

**RDS Parameter Gruppen und Option Gruppen**

Zwei Konfigurationsmechanismen, die im Examen häufig auftauchen:

**Parameter Gruppen** steuern Datenbank-Engine-Einstellungen – wie maximale Verbindungen, Query-Cache-Größe, Timeout-Werte. RDS erstellt eine Standard-Parameter Gruppe, die für die meisten Fälle funktioniert. Sie erstellen benutzerdefinierte Parameter Gruppen, wenn Sie spezifische Einstellungen optimieren müssen.

**Option Gruppen** ermöglichen zusätzliche Funktionen für einige Engines – wie die native Netzwerkverschlüsselung von Oracle oder die transparente Datenverschlüsselung von SQL Server. Die meisten Open-Source-Engine-Bereitstellungen benötigen keine benutzerdefinierten Option Gruppen.

Sie müssen sich diese nicht merken. Wissen Sie, dass sie existieren, um das Verhalten der Datenbank-Engine anzupassen.

## Stärken und Limitationen

**Warum RDS hervorragend ist**:

- Eliminiert die operative Belastung durch das Verwalten von Datenbanksoftware
- Automatisierte Backups und Point-in-Time-Wiederherstellung
- Multi-AZ für automatischen Failover mit minimaler RTO
- Read Replicas für die Skalierung von Lesezugriffen
- Integrierte Verschlüsselung im Ruhezustand und während der Übertragung
- Unterstützung aller großen relationalen Datenbank-Engines

**Wo RDS Grenzen hat**:

- Sie können keinen Zugriff auf das zugrunde liegende Betriebssystem erhalten. Sie können keine benutzerdefinierten OS-Level-Software installieren oder Betriebssystemeinstellungen ändern. Wenn Ihre Datenbank OS-Level-Zugriff erfordert, benötigen Sie möglicherweise eine eigene EC2-basierte Datenbank.
- RDS ist nicht serverless (mit Ausnahmen – Aurora Serverless existiert, wird in Kapitel 24 behandelt). Sie zahlen für eine laufende Instanz, auch wenn sie inaktiv ist.
- RDS ist nicht für horizontal shardierte Datenbanken konzipiert. Für massive Skalierung von Schreib-lasten relationaler Workloads benötigen Sie möglicherweise eine andere Architektur.
- Für NoSQL-Datenmuster ist DynamoDB (Kapitel 9) geeigneter.

## Zusammenfassung

- **Amazon RDS** ist ein verwalteter relationaler Datenbankdienst. AWS übernimmt das Patchen, Backups, Failover und die Speicherverwaltung. Sie verwalten Schema, Abfragen und Anwendungslogik.
- **Multi-AZ** Deployment unterhält eine synchrone Standby in einer anderen AZ. Automatisches Failover erfolgt in 60–120 Sekunden, wenn die primäre Datenbank ausfällt.
- **Automatisierte Backups** mit **Point-in-Time-Wiederherstellung** ermöglichen es Ihnen, in jeden zweiten innerhalb des Aufbewahrungszeitraums wiederherzustellen.
- **Read Replicas** sind asynchrone Kopien, die Lese-Traffic bedienen und die Last der primären Datenbank reduzieren. Replication Lag bedeutet, dass sie möglicherweise leicht hinterherhinken.
- Wählen Sie RDS, wenn Sie eine relationale Datenbank mit verwalteten Operationen benötigen. Verwenden Sie Aurora (Kapitel 24), wenn Sie eine höhere Performance oder serverless Optionen benötigen.

## Examenstipps

*SAA-C03 Domain 3 — Task 3.3 (database solutions)*

- **Multi-AZ ist für Hochverfügbarkeit, nicht für Leistung.** Der Standby-Server bedient keinen Lesedatei-Verkehr. Lesereplikate sind für die Leistung. Diese Unterscheidung wird häufig getestet.
- **Multi-AZ-Failover ist automatisch.** Sie konfigurieren nicht, wann oder wie es geschieht. RDS überwacht den Primärserver und löst den Failover automatisch aus.
- **Replikationsverzögerung ist wichtig.** Lesereplikate können leicht hinter dem Primärserver zurückliegen. Wenn Ihre Anwendung Daten lesen muss, die gerade geschrieben wurden, muss sie von dem Primärserver, nicht von der Replik lesen. Dies wird als "Lesen-Ihre-Schreibungen"-Konsistenz bezeichnet.
- **Automatisierte Backups werden für 0–35 Tage aufbewahrt.** Das Festlegen der Aufbewahrungsdauer auf 0 deaktiviert automatisierte Backups. Manuelle Snapshots werden bis Sie sie löschen, unbegrenzt aufbewahrt.
- **RDS-Speicher-Auto-Skalierung** verhindert Festplatten-Volumen-Ausfälle. Aktivieren Sie es. Es skaliert nur nach oben, niemals nach unten. Die Prüfung kann prüfen, ob Sie dies wissen.

## Übungen

**Übung 1 — Erinnerung**

In Ihren eigenen Worten: Was ist der Unterschied zwischen Multi-AZ und Lesereplikaten in RDS?
Welches Problem löst jede einzelne Lösung?

*(Hinweis: Einer schützt vor Ausfallzeiten; das andere verbessert die Leistung unter Read-last-Last. Sie lösen unterschiedliche Probleme und können zusammen verwendet werden.)*

**Übung 2 — Examen-Übung**

*Szenario*: Ein Unternehmen betreibt eine Produktions-PostgreSQL-Datenbank auf RDS. Die Datenbank erlebt aufgrund von Berichtsabfragen, die den ganzen Tag ablaufen, einen hohen Leseverkehr. Das Team ist auch besorgt über die Datenbankverfügbarkeit – sie können nicht mehr als ein paar Minuten Ausfallzeit in einem Ausfallfall akzeptieren. Sie möchten die Auswirkungen der Berichtsaufgaben auf die Primärdatenbank minimieren.

Welche Kombination von RDS-Funktionen löst BESTENS beide Probleme?

A) Aktivieren Sie Multi-AZ und führen Sie alle Abfragen gegen die Standby-Instanz aus
B) Aktivieren Sie Multi-AZ für Failover-Schutz und erstellen Sie eine Lesereplik für Berichtsabfragen
C) Erstellen Sie mehrere Lesereplikate und deaktivieren Sie Multi-AZ, um Kosten zu senken
D) Nehmen Sie häufigere manuelle Snapshots und stellen Sie von diesen wieder her, wenn der Primär ausfällt

*(Hinweis: Die beiden Anforderungen sind: (1) Verfügbarkeit während eines Ausfalls; (2) Verlagerung von Lesevorgängen. Welche Funktionen adressieren diese Anforderungen?)*

*(Hinweis: Multi-AZ bietet automatischen Failover. Die Standby-Instanz bedient keinen Lesedatei-Verkehr. Daher hilft Multi-AZ allein nicht bei dem Leseproblem.)*

*(Hinweis: Lesereplikate bedienen Leseverkehr. Multi-AZ bietet Failover. Sie benötigen beide.)*

**Antwort**: B

**Erläuterung**: Multi-AZ bietet automatischen Failover zu einer Standby-Instanz in einer anderen AZ – dies löst die Verfügbarkeitsanforderung. Eine Lesereplik ermöglicht Berichtsabfragen, ohne die Primärdatenbank zu beeinträchtigen – dies löst die Leistungsanforderung. Beide Funktionen können gleichzeitig verwendet werden.

**Warum nicht A?** Die Multi-AZ-Standby-Instanz kann keinen Lesedatei-Verkehr bedienen. Sie ist ausschließlich für Failover vorgesehen. Der Versuch, direkt dort Abfragen auszuführen, wird nicht unterstützt.

**Warum nicht C?** Lesereplikate helfen bei der Lesleistung, bieten aber keinen automatischen Failover. Wenn der Primär ausfällt, müssten Sie eine Lesereplik manuell hochfahren – was Zeit in Anspruch nimmt und nicht automatisch ist.

**Warum nicht D?** Manuelle Snapshots stellen eine vollständige Kopie der Datenbank wieder her – ein viel längerer Prozess (potenziell Stunden für große Datenbanken). Dies erfüllt nicht die Anforderung von „einigen Minuten Ausfallzeit“.

*SAA-C03 Domain 3 — Aufgabe 3.3*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nimbus erwägt, ihre bestehende, selbst verwaltete PostgreSQL-Datenbank (die auf einer EC2-Instanz läuft) zu RDS PostgreSQL zu migrieren. Die Migration muss mit minimaler Ausfallzeit erfolgen – idealerweise unter 15 Minuten. Die Datenbank hat 200 GB.

Welchen Ansatz würden Sie empfehlen? Welche AWS-Dienste könnten bei der Migration helfen? Welche Risiken würden Sie testen, bevor Sie den Produktionsverkehr abschneiden?

*(Es gibt keine einzelne korrekte Antwort. Denken Sie über AWS Database Migration Service, logische Replikation und das Risiko von Dateninkonsistenzen während des Abschneidens nach.)*

## Nach-Credits-Szene

Am Ende des Tages hatte Nimbus die Datenbank mit Multi-AZ aktiviert zu RDS PostgreSQL migriert. Die Migration selbst dauerte den größten Teil des Nachmittags – Leo nutzte einen Backup-und-Restore-Ansatz mit einer kurzen Wartungsfenster.

Tom hatte die Rechnung sorgfältig überwacht.

"Die RDS-Instanz", sagte er, "kostet doppelt so viel wie die EC2-Datenbank."

"Und die automatischen Backups?" fragte Maya.

"Ein bisschen mehr."

"Und der Failover, den wir kostenlos bekommen, wenn der Primär ausfällt?"

Tom hatte keinen Preis dafür. Er schrieb es als Frage auf.

Drei Tage später war die Datenbank gesund. Abfragezeiten waren etwas gesunken, aber nicht genug. Das Menü lädt immer noch langsam. Zwanzigtausend Artikel. Zwanzigtausend Zeilen in einer Abfrage, die alle von ihnen jedes Mal zurückgibt.

"Das Problem", sagte Priya, "ist nicht der Datenbank-Engine. Es ist das Datenmodell."

Sie machte eine Pause.

"Einige dieser Daten sind überhaupt nicht relational. Menüpunkte, Restaurantprofile, Lieferzonen – diese Daten haben variable Formen. SQL kämpft gegen uns."

Leo forschte bereits.

"Was, wenn wir für das Menü eine andere Art von Datenbank verwenden?", sagte er.

In der nächsten Episode: Die Datenbank, die nicht langsamer wird, selbst wenn eine Million Leute auf einmal bestellen.
