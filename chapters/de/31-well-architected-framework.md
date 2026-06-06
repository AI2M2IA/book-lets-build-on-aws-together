# Kapitel 31: Der Bauinspektor für Cloud-Architektur

Stehen Sie auf. Strecken Sie sich. Machen Sie eine richtige Pause, wenn Sie eine brauchen.

Dieses Kapitel ist anders als die vorherigen. Wir haben 30 Kapitel damit verbracht, Wissen über bestimmte Dienste und Muster aufzubauen. Jetzt treten wir zurück und betrachten das ganze Bild.

Wie sieht *gute* Cloud-Architektur eigentlich aus? Gibt es einen systematischen Weg zu bewerten, ob das, was Sie gebaut haben, wirklich gut entworfen ist – oder nur funktional?

Den gibt es. AWS nennt es das Well-Architected Framework.

**Rückblick: Die Frage, die den Zahlen folgt**

Drei Monate Kostenoptimierung hatten eine Zahl hervorgebracht, die sie alle überraschte: 35.904 $ an jährlichen Einsparungen, identifiziert und größtenteils umgesetzt. Die EC2 Savings Plans, die S3-Lebenszyklusrichtlinien, die Speicherbereinigung, die ungenutzten Datenbank-Replicas, die NAT-Gateway-Endpoints – jedes war eine separate Entdeckung gewesen, ein separater Fix. Aber irgendwann während dieses Prozesses hatte Maya begonnen, eine andere Frage zu stellen. Nicht „Wo ist die Verschwendung?“, sondern „Wie hat sie sich überhaupt angesammelt?“ Die Kostenprobleme waren Symptome von etwas. Das Well-Architected Framework war das Vokabular, um zu benennen, was dieses Etwas war.

Nimbus lief seit zwei Jahren. Das Team hatte Hunderte architektonischer Entscheidungen getroffen – einige bewusst, einige aus Versehen, einige unter Druck. Das System funktionierte. Aber Maya hatte eine Frage.

„Ist unsere Architektur tatsächlich *gut*?“, fragte sie. „Nicht nur funktional. Gut.“

Niemand antwortete sofort.

„Weil ich von einem Well-Architected Review gehört habe“, fuhr sie fort. „AWS bietet es Kunden an. Einige unserer Investoren haben es erwähnt. Ich denke, wir sollten eins durchführen.“

„Was ist das?“, fragte Leo.

„Das Framework von AWS zur Bewertung von Cloud-Architekturen“, sagte Priya. „Sechs Säulen. Ein Satz von Fragen und Best Practices für jede. Du bewertest deine Architektur anhand aller davon und identifizierst, was fehlt.“

„Es ist wie eine Bauinspektion“, sagte Tom. „Man weiß, dass das Gebäude funktioniert. Die Inspektion sagt einem, ob es den Vorschriften entspricht und was bei einem Erdbeben versagen könnte.“

**Die sechs Säulen**

Das AWS Well-Architected Framework ist um sechs Säulen herum organisiert. Jede Säule hat einen Satz von Designprinzipien, Best Practices und Fragen, um Ihre Architektur zu bewerten.

**1. Operational Excellence (Betriebliche Exzellenz)**

*Fokus*: Systeme betreiben und überwachen, um Geschäftswert zu liefern, und kontinuierlich Prozesse und Verfahren verbessern.

Schlüsselbereiche:

- Wie stellen Sie Änderungen bereit? (CI/CD, Infrastructure as Code, automatisierte Bereitstellungen)
- Wie überwachen Sie das System und wissen, wann etwas nicht stimmt?
- Wie lernen Sie aus Fehlern? (Post-Mortems, Runbooks, schuldlose Kultur)
- Wie handhaben Sie Änderungen im großen Maßstab?

Nimbus-Bewertung:

- Vorhanden: CI/CD-Pipeline mit automatisierten Bereitstellungen
- Vorhanden: CloudWatch-Alarme und GuardDuty
- Vorhanden: Vierteljährliche Chaos-Engineering-Tests
- Warnung: Post-Mortem-Prozess nicht formalisiert – Vorfälle wurden untersucht, aber Erkenntnisse wurden nicht systematisch dokumentiert

**2. Security (Sicherheit)**

*Fokus*: Schutz von Informationen, Systemen und Vermögenswerten durch Risikobewertung und Minderungsstrategien.

Schlüsselbereiche:

- Wer kann worauf zugreifen, und mit den geringstmöglichen Privilegien?
- Wie werden Daten im Ruhezustand und während der Übertragung verschlüsselt?
- Wie erkennen Sie Bedrohungen und reagieren darauf?
- Gibt es automatisierte Sicherheitskontrollen?

Nimbus-Bewertung:

- Vorhanden: IAM mit geringsten Privilegien (nach der Bereinigung in Kapitel 14)
- Vorhanden: KMS für Datenverschlüsselung, Secrets Manager für Anmeldedaten
- Vorhanden: GuardDuty, WAF, Shield Standard
- Vorhanden: VPC mit privaten Subnetzen, Security Groups
- Warnung: Sicherheits-Patching auf EC2-Instanzen nicht vollständig automatisiert (Priya hat dies vor Monaten markiert, noch nicht behoben)

„Moment – aber *warum* würden wir es so machen?“, fragte Maya, als die Lücke beim Sicherheits-Patching zur Sprache kam. „Wir haben Bereitstellungen automatisiert. Wir haben Backups automatisiert. Warum haben wir das Patching manuell gelassen?“

„Weil sich Patching anders anfühlte als das Bereitstellen von Code“, sagte Priya. „Wir hatten Sorge, dass Patching etwas kaputt macht. Also haben wir es manuell gehalten, um die Kontrolle zu behalten.“

„Und indem wir es manuell gehalten haben, haben wir es inkonsistent gemacht“, sagte Maya. „Was schlimmer ist.“

„Ja“, sagte Priya. „AWS Systems Manager Patch Manager löst das. Wir hätten es vor sechs Monaten tun sollen.“

**3. Reliability (Zuverlässigkeit)**

*Fokus*: Sicherstellen, dass ein System seine beabsichtigte Funktion korrekt und konsistent erfüllt und sich von Ausfällen erholen kann.

Schlüsselbereiche:

- Wie handhabt das System Ausfälle auf Komponentenebene?
- Wie erholt es sich von regionalen Ausfällen?
- Wie wird die Nachfrage verwaltet?
- Wie wird das System auf Ausfälle getestet?

Nimbus-Bewertung:

- Vorhanden: Multi-AZ für alle kritischen Komponenten
- Vorhanden: Aurora Serverless mit automatischem Failover
- Vorhanden: Auto Scaling für EC2 und ECS
- Vorhanden: Chaos-Engineering-Tests (vierteljährlich)
- Warnung: Keine Multi-Region-Bereitstellung (Warm Standby noch nicht implementiert – für das nächste Quartal geplant)

**4. Performance Efficiency (Leistungseffizienz)**

*Fokus*: Effiziente Nutzung von IT- und Rechenressourcen.

Schlüsselbereiche:

- Werden der richtige Instanztyp und der richtige Datenbanktyp für die Arbeitslast verwendet?
- Ist die Skalierung korrekt konfiguriert?
- Werden Daten Benutzern vom optimalen Standort aus geliefert?

Nimbus-Bewertung:

- Vorhanden: CloudFront für globale Content-Auslieferung
- Vorhanden: ElastiCache für Datenbank-Lesebeschleunigung
- Vorhanden: Aurora Read Replicas
- Vorhanden: Lambda für geeignete Arbeitslasten
- Warnung: Einige EC2-Instanzen wurden seit der ersten Bereitstellung nie right-sized

**5. Cost Optimization (Kostenoptimierung)**

*Fokus*: Vermeidung unnötiger Kosten.

Schlüsselbereiche:

- Sind Ressourcen angemessen dimensioniert?
- Werden ungenutzte Ressourcen stillgelegt?
- Werden geeignete Preismodelle verwendet?
- Werden Ausgabenanomalien erkannt?

Nimbus-Bewertung:

- Vorhanden: Savings Plans implementiert (Kapitel 27)
- Vorhanden: S3-Lebenszyklusrichtlinien (Kapitel 23)
- Vorhanden: DynamoDB Auto Scaling
- Vorhanden: AWS Budgets mit Benachrichtigungen
- Vorhanden: Vierteljährliche Kostenüberprüfungen

„Wie viel kostet das pro Monat, genau – all die Dinge, die wir noch nicht right-sized haben?“, fragte Tom. „Die EC2-Instanzen, die nie bewertet wurden. Die, die noch in der Größe sind, die wir im ersten Jahr bereitgestellt haben.“

„Ich weiß es nicht“, sagte Leo. „Das ist der Punkt.“

„Das ist die Performance-Efficiency-Lücke“, sagte Priya. „Wir haben die Dinge optimiert, von denen wir wussten. Wir haben keine Zahl für die Dinge, die wir uns noch nicht angesehen haben.“

**6. Sustainability (Nachhaltigkeit)**

*Fokus*: Minimierung der Umweltauswirkungen des Betriebs von Cloud-Arbeitslasten.

Schlüsselbereiche:

- Wird die Auslastung maximiert (Vermeidung von Leerlaufressourcen)?
- Werden Instanztypen für Energieeffizienz gewählt?
- Werden Daten nur so lange gespeichert, wie sie benötigt werden?

Nimbus-Bewertung:

- Vorhanden: Lambda und Fargate für serverlose/containerisierte Arbeitslasten (bessere Ressourceneffizienz als dediziertes EC2)
- Vorhanden: S3-Lebenszyklusrichtlinien (Daten löschen, wenn sie nicht mehr benötigt werden)
- Warnung: Einige Graviton-basierte Instanzen noch nicht übernommen (AWS Graviton ist energieeffizienter und günstiger)

**Der Well-Architected-Review-Prozess**

Der Review ist kein Test, den man besteht oder nicht besteht. Es ist ein strukturiertes Gespräch über Ihre Architektur, geleitet von über 60 Fragen über die sechs Säulen hinweg.

Jede Frage identifiziert eine Best Practice. Wenn Ihre Architektur ihr folgt, ist das eine Stärke. Wenn nicht, ist es ein „Issue“ – kategorisiert nach Risikostufe (hoch, mittel, niedrig).

Das Ergebnis: eine priorisierte Liste von Verbesserungsempfehlungen. Nicht alles muss sofort behoben werden. Das Framework hilft Ihnen, die Kompromisse jeder Lücke zu verstehen und zu entscheiden, was zuerst angegangen wird.

Das Well-Architected Tool von AWS (in der AWS-Konsole verfügbar, kostenlos) bietet das Fragen-Framework und generiert einen Bericht mit Empfehlungen.

Für Nimbus plante Maya eine halbtägige Review-Sitzung, die alle sechs Säulen abdeckte – und sie beschloss, sie nicht allein durchzuführen. Die Sitzung selbst und die Liste der Befunde, die sie hervorbrachte, sind das Ziel dieses Kapitels.

**Die Lens: Den Review spezialisieren**

Das Kern-Well-Architected-Framework ist technologieagnostisch. AWS veröffentlicht auch **Lenses** – Erweiterungen des Frameworks für bestimmte Anwendungsfälle oder Branchen:

- **Serverless Lens**: Zusätzliche Fragen für Lambda-lastige Architekturen
- **SaaS Lens**: Für mandantenfähige SaaS-Anwendungen
- **Machine Learning Lens**: Für ML-Trainings- und Inferenz-Arbeitslasten
- **Financial Services Lens**: Regulatorische und Compliance-Fragen für FinTech
- **Healthcare Lens**: HIPAA-Überlegungen

Sie fragen sich vielleicht: Müssen Sie den vollständigen Well-Architected-Review gegen alle sechs Säulen durchführen, bevor Sie starten? Nein. Der Wert liegt in den Fragen, nicht in der Bewertung. Wenn Sie vor dem Start sind, wählen Sie die beiden Säulen, die für Ihre Situation am relevantesten sind – Security und Reliability sind fast immer der richtige Ausgangspunkt – und arbeiten Sie nur diese Fragen durch. Ein partieller Review, der tatsächlich durchgeführt wird, ist wertvoller als ein vollständiger Review, der verschoben wird, bis die Architektur „bereit“ ist.

Für Nimbus war die SaaS Lens relevant. Sie fügte Fragen zu Mandantenisolation, Onboarding-Automatisierung und mandantenbezogener Kostenzuordnung hinzu – allesamt Bereiche, die Nimbus aktiv entwickelte.

**Die Well-Architected-Review-Sitzung: Carlos moderiert**

Maya hatte Carlos eingeladen – einen Senior Architect, den sie bei einer AWS-Community-Veranstaltung kennengelernt hatte und der Well-Architected-Reviews für Teams wie ihres moderierte –, um die Sitzung zu leiten. Er kam mit dem Well-Architected Tool offen auf seinem Laptop und einem einzigen Notizblock an. Keine Agenda. Nur Fragen.

„Ich frage, ihr antwortet ehrlich“, sagte er. „Wenn die ehrliche Antwort ‚wir wissen es nicht‘ ist, sagt das. Das ist ein Befund.“

Er begann mit Operational Excellence.

„Habt ihr Runbooks für eure fünf häufigsten Vorfälle?“

Tom sah Leo an. Leo sah an die Decke.

„Wir haben Runbooks für zwei Vorfälle“, sagte Priya. „Überschreitung des Datenbankverbindungslimits und CloudFront-Origin-Timeout. Die anderen drei – EC2-Instanzausfall während der Spitze, DynamoDB-Drosselung und Stripe-Webhook-Fehler – handhaben wir ad hoc.“

Carlos schrieb: *OPS-1: Runbooks für die Top 5 Vorfälle. Aktuell: 2/5. Lücke: 3.*

„Wann seid ihr das letzte Mal die bestehenden Runbooks in einer Übung durchgegangen?“

Schweigen.

„Haben wir nicht“, sagte Priya. „Wir haben sie nach Vorfällen geschrieben. Wir haben nie getestet, ob sie noch korrekt sind.“

*OPS-2: Runbook-Validierung. Letzter Test: nie.*

Carlos machte weiter. Security.

„Wer hat gerade Zugriff auf das Root-Konto?“

„Root?“, sagte Leo. „Nur Maya. Und ich glaube, Tom hat noch die Root-Anmeldedaten von damals, als wir das Konto eingerichtet haben – aber wir haben sie nach Kapitel 14 rotiert.“ Er hielt inne. „Tom, haben wir Root nach der IAM-Bereinigung rotiert?“

Tom rief einen 1Password-Eintrag auf. „Wir haben das Passwort geändert und MFA hinzugefügt. Aber die Root-Anmeldedaten sind noch im geteilten 1Password-Tresor. Drei Personen haben Zugriff auf diesen Tresor: ich, Maya und Leo.“

„Also haben drei Personen Root-Zugriff“, sagte Carlos. „Die Empfehlung von AWS ist, dass Root nur für eine kurze, dokumentierte Liste von Aufgaben verwendet werden sollte – etwa zehn Operationen auf Kontoebene, allesamt selten und die meisten davon nur für Notfälle. Nach diesen Operationen sollte die Root-Sitzung beendet werden. Wird der Root-Zugriff separat protokolliert?“

„CloudTrail protokolliert ihn“, sagte Priya.

„Gibt es eine Benachrichtigung, wenn Root verwendet wird?“

Eine weitere Pause.

„Nein“, sagte Tom.

Carlos schrieb: *SEC-1: Zugriffskontrolle für das Root-Konto. Aktuell: 3 Benutzer im geteilten Tresor, keine Nutzungsbenachrichtigung. Lücke: Root-Nutzung sollte eine sofortige SNS-Benachrichtigung auslösen. Ziel: 0 Nicht-Notfall-Root-Sitzungen.*

„Als Nächstes: Wer überprüft Änderungen an IAM-Berechtigungen? Gibt es einen Peer-Review-Prozess für neue IAM-Rollen oder Richtlinienerweiterungen?“

„Priya überprüft sie“, sagte Leo. „Sie ist die De-facto-Sicherheitsprüferin.“

„Was passiert, wenn Priya im Urlaub ist?“

Niemand antwortete.

„Das ist eine Prozesslücke“, sagte Carlos, ohne Wertung. „Keine Lücke in Priyas Fähigkeit – eine Lücke im Prozessdesign. Eine Sicherheitsüberprüfung, die von der Verfügbarkeit einer Person abhängt, ist ein Single Point of Failure in eurer Sicherheitslage.“

*SEC-2: IAM-Review-Prozess. Aktuell: einzelner Prüfer, kein Backup. Lücke: Einen Backup-Prüfer definieren und die Review-Kriterien dokumentieren.*

Carlos wandte sich Reliability zu.

„Habt ihr das Aurora-Multi-AZ-Failover unter Last getestet?“

„Wir haben es im Leerlauf getestet“, sagte Tom. „Wir haben den Failover-Befehl ausgeführt, als das System ruhig war, und bestätigt, dass das Replica innerhalb von 45 Sekunden hochgestuft wurde.“

„Wie hoch war die Last zu der Zeit?“

„Vielleicht 5 % der Spitze.“

„Was passiert mit dem Connection Pool während eines Failovers bei 80 % Spitzenlast?“

Tom dachte darüber nach. „Der DNS-Endpunkt aktualisiert sich. Anwendungen, die den Writer-Endpunkt nutzen, sehen während des Umschaltfensters Verbindungsfehler – typischerweise 20–45 Sekunden. Bei 5 % Last hatten wir zehn aktive Verbindungen. Bei der Spitze hätten wir 300. Mit RDS Proxy davor handhabt der Proxy die Wiederverbindung.“

„Verbindet sich RDS Proxy während eines Multi-AZ-Failovers tatsächlich transparent neu?“

Tom sah Priya an. „Ich glaube schon. Aber ich habe es nicht getestet.“

„Das ist eine andere Antwort als ‚ja‘“, sagte Carlos. „Eine ungetestete Annahme in eurem Hochverfügbarkeitsdesign ist ein Befund.“

*REL-1: Aurora-Multi-AZ-Failover unter Last. Getestet: nur im Leerlauf. Lücke: Bei 70 % Spitzenlast mit RDS Proxy testen. Connection-Pool-Verhalten während des Failover-Fensters validieren.*

„Habt ihr bedacht, was passiert, wenn das Failover 90 Sekunden statt 45 dauert?“, fragte Priya, an Tom statt an Carlos gerichtet. Sie machte bereits die Arbeit.

„Bei 90 Sekunden hätten wir Anwendungs-Timeouts für alle Anfragen, die nicht wiederholt werden können“, sagte Tom. „Der Bestellfluss hat Retry-Logik. Der Bestätigungsfluss – weniger. Ein 90-Sekunden-Failover während des Abend-Andrangs würde bedeuten, dass eine Teilmenge der Bestätigungen fehlschlägt, Restaurants die Bestellung nicht bekommen, der Kunde eine Rückerstattung erhält.“

„Das ist der Blast Radius“, sagte Carlos. „Gut. Jetzt wisst ihr, wogegen ihr euch schützt und wie ihr es messt. Der Test sollte sowohl die Failover-Dauer als auch das Anwendungsverhalten während des Umschaltfensters validieren.“

Er ging zu Performance Efficiency über.

„Right-sized ihr eure EC2-Instanzen?“

„Wir haben während der Kostenüberprüfung right-sized“, sagte Tom. „Savings Plans auf die aktuellen Instanztypen verpflichtet.“

„Wann habt ihr euch das letzte Mal die Empfehlungen von Compute Optimizer angesehen?“

Tom rief es auf. AWS Compute Optimizer hatte drei Instanzen als potenziell überdimensioniert markiert: zwei c6g.medium-Hintergrundprozessoren und einen t3.medium-VPN-Server. Die Empfehlung für den VPN-Server lautete, auf eine t3.small zu verkleinern. Die Prozessoren wurden mit 82 % Konfidenz als „überdimensioniert“ markiert.

„Wir haben uns das nicht angesehen, seit wir es eingerichtet haben“, gab Tom zu.

„Seit wie lange generiert Compute Optimizer Empfehlungen?“

Tom prüfte. „Sechs Wochen.“

Carlos schrieb: *PERF-1: EC2-Right-Sizing über Compute Optimizer. Aktuell: Empfehlungen verfügbar, nicht überprüft. Lücke: Monatliche Überprüfung der Compute-Optimizer-Ausgabe; Empfehlungen nach Staging-Validierung anwenden.*

„Noch eins“, sagte Carlos. „Dieses über alle Säulen hinweg.“ Er schrieb auf das Whiteboard:

*Vorfallfrei ist nicht dasselbe wie gut entworfen.*

Er ließ es einen Moment lang stehen.

„Euer System läuft seit zwei Jahren ohne einen großen kundenseitigen Ausfall“, sagte er. „Das ist wirklich gut. Aber ich möchte, dass ihr bemerkt, was euch das sagt – und was nicht.“

„Es sagt uns, dass wir Glück hatten?“, schlug Leo vor.

„Es sagt euch, dass die Ausfallmodi, denen ihr begegnet seid, innerhalb eurer Fähigkeit lagen, sie zu handhaben, gegeben die Architektur, die ihr heute habt. Es sagt euch nicht, dass die Architektur solide ist. Ein System, das noch nicht ausgefallen ist, ist nicht als resilient bewiesen. Es ist als nicht den spezifischen Bedingungen begegnet bewiesen, die seine Schwächen aufdecken würden.“

„Also bedeutet Nicht-Ausfallen nicht Nicht-Verwundbarkeit“, sagte Maya.

„Richtig. Der Well-Architected-Review sucht nicht nach Beweisen vergangener Ausfälle. Er sucht nach zukünftiger Exposition. Das ungetestete Failover. Die Runbooks, die nicht existieren. Die IAM-Rolle, die zu breit ist. Keines davon hat bisher einen Vorfall verursacht. Alle davon könnten es.“

„Deshalb ist die Patching-Lücke wichtig“, sagte Priya. „Wir wurden noch nicht über eine ungepatchte EC2-Instanz angegriffen. Das bedeutet nicht, dass wir es nicht werden.“

„Genau“, sagte Carlos. „Das Ausbleiben von Schaden ist kein Beweis für Sicherheit. Das Vorhandensein einer nicht behobenen Schwachstelle ist ein Beweis für Risiko – unabhängig davon, ob das Risiko eingetreten ist.“

Er setzte die Kappe auf seinen Marker.

„Das ist der Unterschied zwischen einem gut entworfenen System und einem glücklichen.“


**Der Befund zur IAM-Überberechtigung**

Carlos markierte während der Überprüfung der Security-Säule einen zweiten Befund, der einen genaueren Blick erforderte.

„Eure Lambda-Funktion, die Bestellbenachrichtigungen handhabt – welche IAM-Berechtigungen hat sie?“

Leo rief die Ausführungsrolle auf. Es dauerte dreißig Sekunden länger als es sollte, sie zu finden – die Rolle war früh in Nimbus' Leben erstellt und generisch benannt worden.

„S3-Vollzugriff“, sagte er, als er sie fand.

Carlos wartete.

„Welcher Bucket?“, fragte er.

„Alle Buckets“, sagte Leo. Er las die Richtlinie. „`arn:aws:s3:::*`. Wir haben ihr S3-Vollzugriff gegeben.“

„Was macht die Funktion tatsächlich mit S3?“

„Sie liest die Restaurant-Konfiguration aus einem Bucket“, sagte Leo. „Dem `nimbus-restaurant-config`-Bucket. Konkret die `restaurants/{restaurant_id}/config.json`-Objekte. Sie liest sie. Das ist alles.“

„Die Funktion braucht also `s3:GetObject` auf `arn:aws:s3:::nimbus-restaurant-config/restaurants/*/config.json`“, sagte Carlos. „Was sie hat, sind volle S3-Berechtigungen auf jeden Bucket im Konto.“

„Einschließlich“, sagte Priya, „des Aurora-Snapshot-Buckets. Des CloudTrail-Logs-Buckets. Des Kundenbestellhistorie-Buckets.“

„Wenn diese Lambda-Funktion kompromittiert wird“, sagte Carlos, „hat ein Angreifer vollen Zugriff auf jeden S3-Bucket im Konto. Er kann beliebige Daten lesen, schreiben oder löschen.“

„Ich hatte sie schon deployt – oh“, sagte Leo. Er las die Richtlinie. „Ich habe das vor zwei Jahren geschrieben. Ich war in Eile, das Benachrichtigungssystem zum Laufen zu bringen. Ich habe ihr breiten Zugriff gegeben, weil ich noch nicht sicher war, was sie brauchte. Und ich bin nie zurückgekommen, um es einzuschränken.“

„Das ist die häufigste Quelle von Überberechtigung in Produktionssystemen“, sagte Carlos, ohne Anklage. „Keine absichtliche Nachlässigkeit – eine Abkürzung, die unter Zeitdruck genommen und nie erneut betrachtet wurde.“

Tom betrachtete bereits die vollständige Liste der Lambda-Ausführungsrollen.

„Wie viele unserer Lambda-Funktionen haben zu breite Berechtigungen?“, fragte Maya.

Die Antwort, nach zwanzig Minuten Überprüfung: 7 der 23 Lambda-Funktionen hatten breitere Berechtigungen, als ihr dokumentierter Zweck erforderte. Die besorgniserregendste: Die Lambda für die Zahlungsbestätigung hatte `dynamodb:*` auf allen Tabellen. Sie brauchte nur `dynamodb:GetItem` und `dynamodb:PutItem` auf der Bestelltabelle.

„Drei Stunden Arbeit, um alle sieben zu beheben“, schätzte Priya. „Die Least-Privilege-Richtlinien schreiben, sie anhängen, die breiten entfernen.“

„Ist das der risikoreichste Befund bisher?“, fragte Maya Carlos.

„Gleichauf mit der Runbook-Lücke“, sagte er. „Das IAM-Problem ist ein Blast-Radius-Problem – wenn eine dieser Funktionen kompromittiert wird, ist der Zugriff des Angreifers viel größer, als er sein sollte. Das Runbook-Problem ist ein Wiederherstellungszeit-Problem – wenn etwas schiefgeht, improvisiert ihr, statt einer getesteten Prozedur zu folgen. Beide sind wirklich hohes Risiko.“

Maya markierte beide als P1 im Tracking-Dokument.

„Und was, wenn jemand versucht einzubrechen?“, sagte Priya. „Wir haben uns über externe Angreifer Sorgen gemacht. Aber eine überberechtigte Lambda bedeutet, dass ein interner Fehler – eine Fehlkonfiguration, eine Abhängigkeitsschwachstelle, ein Supply-Chain-Angriff – denselben Blast Radius haben kann.“

„Defense in Depth setzt voraus, dass jede Ebene den minimal notwendigen Zugriff hat“, sagte Carlos. „Wenn eine Ebene mehr Zugriff hat, als sie braucht, hört Defense in Depth auf, wie entworfen zu funktionieren. Man bekommt eine Ebene, die kompromittiert ist, aber sie hat die Schlüssel zu drei anderen Ebenen.“

Priya markierte den Befund zur IAM-Überberechtigung als P1, Spalte eins, mit einem Fälligkeitsdatum von einer Woche.


**Die Befunde einstufen: P1, P2, P3**

Am Ende der Sitzung hatte das Team 14 Befunde auf dem Board. Carlos bat sie, vor dem Gehen zu triagieren.

„Jeder Befund auf dieser Liste braucht eine Priorität“, sagte er. „Nicht alles ist gleich wichtig. Priorisiert nach: Was ist der Blast Radius, wenn das versagt? Wie wahrscheinlich versagt es? Wie schwer ist es zu beheben?“

Die 14 Befunde:

1. Keine Runbooks für 3 der Top-5-Vorfälle (OPS)
2. Runbooks nie getestet (OPS)
3. Kein formaler Incident-Response-Prozess über die Runbooks hinaus (OPS)
4. Root-Zugriff im geteilten Tresor, keine Nutzungsbenachrichtigung (SEC)
5. IAM-Review-Prozess hat keinen Backup-Prüfer (SEC)
6. 7 Lambda-Funktionen überberechtigt (SEC) ← Leos Benachrichtigungs-Lambda
7. Ein paar Security-Group-Regeln breiter als nötig (SEC)
8. Aurora-Failover nicht unter Last getestet (REL)
9. Multi-Region-DR-Plan nicht implementiert (REL)
10. Sicherheits-Patching nicht automatisiert (SEC)
11. EC2-Right-Sizing seit dem Start nicht überprüft (PERF)
12. Graviton-Instanzen nicht übernommen (SUST)
13. CloudFront-Cache-TTLs nicht abgestimmt (PERF)
14. 40 % der Infrastruktur nicht in IaC (OPS)

„Fangt mit den offensichtlichen an“, sagte Carlos. „Welche drei würdet ihr zuerst beheben, wenn ihr nur eine Woche hättet?“

Maya legte sofort los: „Root-Zugriffs-Benachrichtigung. Lambda-Überberechtigungen. Automatisierung des Sicherheits-Patchings.“

„Warum?“, fragte Carlos.

„Weil diese drei Sicherheitslücken mit einem klaren Blast Radius sind. Die anderen sind Zuverlässigkeits- und Betriebsverbesserungen – wichtig, aber wir leben damit und sie haben keinen Vorfall verursacht. Die Sicherheitslücken verschärfen sich still und leise jeden Tag, an dem wir sie nicht beheben.“

Tom widersprach mild. „Die Lambda-Überberechtigungen sind dringend. Aber ich würde das Sicherheits-Patching gegen den Aurora-Failover-Test tauschen. Wir haben nie bestätigt, dass unser Multi-AZ-Setup unter Last korrekt funktioniert. Wenn es während eines Freitagabend-Andrangs versagt und wir kein getestetes Runbook dafür haben, stecken wir in Schwierigkeiten.“

„Beide können P1 sein“, sagte Priya. „Wir haben eine Woche. Fünf Arbeitstage. Die Lambda-Berechtigungen sind ein Zwei-Stunden-Fix pro Funktion. Die Root-Zugriffs-Benachrichtigung ist eine Dreißig-Minuten-CloudWatch-Event-Rule. Die Automatisierung des Sicherheits-Patchings sind zwei Tage Systems-Manager-Einrichtung und -Tests. Der Aurora-Failover-Test ist ein halber Tag, geplant an einem Dienstag um 2 Uhr morgens.“

Carlos nickte. „Das ist der richtige Weg zu triagieren. Nicht nur ‚was am wichtigsten ist‘, sondern ‚was können wir diese Woche tatsächlich tun, und in welcher Reihenfolge?‘“

Die finale Triage:

**P1 (diese Woche)**:
- Least-Privilege-Fix für Lambda-Ausführungsrollen (7 Funktionen)
- CloudWatch-Benachrichtigung für das Root-Konto
- Aurora-Multi-AZ-Failover-Test unter Last (für nächsten Dienstag, 2 Uhr morgens, geplant)

**P2 (diesen Monat)**:
- Automatisierung des Sicherheits-Patchings über Systems Manager
- Fehlende Runbooks für die Top-3-Vorfälle
- Formaler Incident-Response-Prozess dokumentiert
- 40 % IaC-Migration – identifizieren, welche Ressourcen, Migrationsplan erstellen

**P3 (dieses Quartal)**:
- Runbook-Validierungsübung
- Backup-Prüfer für den IAM-Review-Prozess dokumentiert
- Zu breite Security-Group-Regeln verschärft
- EC2-Right-Sizing-Überprüfung über Compute Optimizer
- Graviton-Adoptionsplan
- CloudFront-TTL-Abstimmung

„Das sind vierzehn Befunde mit Verantwortlichen, Fälligkeitsdaten und Prioritäten“, sagte Maya. „Wir waren noch nie so organisiert in Bezug auf technische Schulden.“

„Dafür ist der Review da“, sagte Carlos. „Nicht, um euch wegen der Lücken schlecht fühlen zu lassen. Um euch ein Vokabular und eine Liste zu geben, die ihr tatsächlich abarbeiten könnt.“


**Der Unterschied zwischen gut entworfen und einfach funktionierend**

„Unser System funktioniert“, sagte Leo nach dem Review. „Aber mir war nicht klar, wie viele Dinge wir ‚gut genug‘ gemacht und dann weitergemacht hatten.“

„Haben wir bedacht, was passiert, wenn wir diese Lücken weiter offen lassen?“, fragte Priya. „Das Patching-Problem ist seit Monaten offen. Der Incident-Response-Prozess existiert nicht. Das sind keine Kleinigkeiten – das sind die Dinge, die bestimmen, ob ein Freitagabend-Ausfall ein 20-Minuten-Fix oder eine vierstündige Katastrophe ist.“

„Deshalb machen wir den Review“, sagte Maya.

„Das ist normal“, sagte Priya. „Unter Zeitdruck zu bauen bedeutet, pragmatische Entscheidungen zu treffen. Der Well-Architected-Review ist die geplante Zeit, sie erneut zu betrachten.“

„Einige dieser Lücken erscheinen im Nachhinein offensichtlich“, fuhr sie fort. „Das Sicherheits-Patching – ich wusste, dass wir es nicht automatisiert hatten. Ich habe es nur nie priorisiert.“

„Weil ‚es funktioniert‘ und ‚es ist well-architected‘ sich im Alltag gleich anfühlen“, sagte Maya. „Der Unterschied wird nur sichtbar, wenn etwas schiefgeht.“

Das ist eines der wichtigsten Dinge, die ein Senior Engineer versteht: Das Ausbleiben von Vorfällen bedeutet nicht das Ausbleiben von Risiko. Es bedeutet, dass das Risiko noch nicht ausgelöst wurde.

**Infrastructure as Code: Der Enabler für Operational Excellence**

Ein Thema über mehrere Säulen hinweg: **Infrastructure as Code (IaC)**.

Wenn Ihre Infrastruktur manuell über die Konsole konfiguriert wird, dann:

- Ist ihre Neuerstellung in einem DR-Szenario langsam und fehleranfällig
- Ist die Prüfung von Änderungen unmöglich (wer hat was wann geändert?)
- Erfordert das Rückgängigmachen einer schlechten Änderung manuelle Umkehrung
- Erfordert Konsistenz zwischen Umgebungen (Dev/Staging/Produktion) Disziplin

**AWS CloudFormation** ermöglicht es Ihnen, Infrastruktur in YAML/JSON-Templates zu definieren. **AWS CDK (Cloud Development Kit)** ermöglicht es Ihnen, Infrastruktur mit Programmiersprachen (Python, TypeScript, Java) zu definieren. **Terraform** ist eine beliebte Drittanbieter-Alternative.

Nimbus war schrittweise mit Terraform zu IaC übergegangen. Zum Zeitpunkt des Well-Architected-Reviews waren etwa 60 % ihrer Infrastruktur in Code definiert. Der Review empfahl, auf 100 % zu kommen.

„Warum die verbleibenden 40 %?“, fragte Leo.

„Die verbleibenden 40 % sind dort, wo unsere kritische Infrastruktur lebt“, sagte Priya. „Wenn wir sie nicht aus Code neu erstellen können, können wir uns nicht zuverlässig von einer regionalen Katastrophe erholen.“

Leo sah sich die Liste an. „Die verbleibenden 40 % – ja. Es wird schon klappen, wir migrieren sie nächsten Sprint.“

Priya hielt ihren Blick auf den Bildschirm gerichtet. „Das ist die kritische Infrastruktur. Die Multi-Region-Failover-Konfiguration. Die IAM-Rollenhierarchie. Die Dinge, von denen wir, wenn wir um 3 Uhr morgens von Grund auf neu bauen müssen, wissen müssen, dass sie genau richtig sind.“

Leo überlegte einen Moment.

„… Du hast recht“, sagte er leise. „Wir haben bereits manuelle Konfiguration, die von dem abgedriftet ist, was irgendjemand aufgeschrieben hat. Wenn wir sie von Grund auf neu bauen müssten, würden wir raten.“

„Deshalb hat der Review sie gefunden“, sagte Maya. „Nicht, um Schuld zuzuweisen. Um es zu beheben, bevor es darauf ankommt.“

**CloudFormation im Detail: Das AWS-native IaC-Werkzeug**

Während Nimbus Terraform übernommen hatte, brachte der Well-Architected-Review auch zutage, dass das Team AWS CloudFormation nie vollständig verstanden hatte – den nativen AWS-IaC-Dienst, der Diensten wie CDK, SAM (dem Serverless Application Model) und dem Service Catalog zugrunde liegt. Die Prüfung testet CloudFormation speziell, und mehrere AWS-Dienste erfordern, es zu verstehen.

Das Problem, das Carlos zuvor in der Sitzung benannt hatte, war konkret: Leo hatte sich manuell durch die Konsole geklickt, um Umgebungen zu erstellen. Es dauerte jedes Mal 45 Minuten, und jede Diskrepanz zwischen Staging und Produktion war unsichtbar, bis etwas kaputtging. Drei der fünf Produktionsvorfälle im vergangenen Jahr waren durch eine Konfiguration in der Produktion verursacht worden, die nicht mit Staging übereinstimmte – andere Security-Group-Regeln, andere Umgebungsvariablen, ein anderer Instanztyp.

„Die Konsole ist eine Einbahntür“, sagte Carlos. „Man kann hineingehen und Dinge ändern, aber man kann nicht einfach wieder hinausgehen und genau sehen, was geändert wurde, oder den Zustand von gestern reproduzieren.“

CloudFormation ist die Antwort darauf. So funktioniert es:

**Template**: Eine YAML- oder JSON-Datei, die die AWS-Infrastruktur deklariert, die Sie möchten. Keine Anweisungen, wie man sie erstellt – eine Deklaration dessen, wie sie aussehen sollte. „Ich möchte eine VPC mit diesen CIDR-Bereichen, zwei öffentliche Subnetze, zwei private Subnetze, ein Internet Gateway und diese Routing-Tabellen.“ CloudFormation liest das Template und findet heraus, wie die reale Infrastruktur der Deklaration entsprechen soll.

Stellen Sie sich ein Template als Rezept für eine Umgebung vor. Das Rezept ändert sich nicht. Jede daraus erstellte Umgebung ist identisch. Staging und Produktion verwenden dasselbe Template, mit unterschiedlichen Parametern (unterschiedliche Instanzgrößen, unterschiedliche Domainnamen). Die strukturellen Entscheidungen – welche Subnetze existieren, welche Security Groups, welche IAM-Rollen – sind identisch.

**Stack**: Die bereitgestellte Instanz eines Templates. Wenn Leo `aws cloudformation deploy --template-file infrastructure.yaml` ausführt, erstellt CloudFormation einen Stack – eine benannte Sammlung der tatsächlichen AWS-Ressourcen, die das Template beschreibt. Der Stack merkt sich, welche Ressourcen er erstellt hat, und verwaltet sie als Einheit. Aktualisieren Sie das Template und stellen Sie den Stack erneut bereit: CloudFormation berechnet den Unterschied zwischen dem aktuellen Zustand und dem neuen Template und wendet nur die nötigen Änderungen an. Löschen Sie den Stack: CloudFormation baut jede Ressource, die er erstellt hat, in der richtigen Reihenfolge ab, ohne dass Sie sich an sie erinnern müssen.

„Der Stack ist also die Bereitstellung, nicht das Template?“, fragte Maya.

„Das Template ist das Rezept. Der Stack ist das Gericht. Du kannst dasselbe Gericht aus demselben Rezept so oft machen, wie du willst. Jedes Mal ist es gleich.“

**Change Set**: Bevor Sie ein Update auf einen laufenden Stack anwenden, können Sie ein Change Set erstellen – eine Vorschau dessen, was CloudFormation tun wird. Eine neue Ressource hinzufügen? Das Change Set zeigt es. Eine Security Group modifizieren? Das Change Set zeigt das Vorher und Nachher. Eine RDS-Instanz ersetzen? Das Change Set markiert es als Ersatz – was Ausfallzeit bedeutet –, bevor Sie sich festlegen.

„Den Diff vor der Anwendung sehen“, sagte Priya. „Das ist es, was uns fehlt, wenn Leo Dinge in der Konsole anklickt.“

Für Nimbus wurde die Richtlinie: Alle Infrastrukturänderungen an der Produktion müssen durch eine Change-Set-Überprüfung gehen. Keine direkten Konsolen-Bearbeitungen. Das Change Set ist der Peer-Review-Prozess für die Infrastruktur.

**Drift Detection**: Mit der Zeit klicken Leute Dinge in der Konsole. Eine Security-Group-Regel, die während eines Vorfalls hinzugefügt wurde. Eine Umgebungsvariable, die mitten in einem Deploy geändert wurde. Ein Instanztyp, der manuell hochgesetzt wurde, als der geplante Fix zu lange dauerte. CloudFormation nennt das **Drift** – wenn der tatsächliche Zustand einer Ressource nicht mehr mit dem übereinstimmt, was das Template des Stacks sagt.

Die Drift-Erkennung von CloudFormation scannt die Ressourcen des Stacks und meldet alle Unterschiede zwischen dem tatsächlichen Zustand und dem im Template definierten Zustand. Als Leo die Drift-Erkennung zum ersten Mal auf den bestehenden Nimbus-Stacks ausführte, fand er elf abgedriftete Ressourcen. Sieben davon waren Security-Group-Modifikationen. Drei waren IAM-Richtlinienänderungen. Eine war ein S3-Bucket, dessen Lebenszyklusrichtlinie vor sechs Monaten direkt in der Konsole geändert und nie im Template reflektiert worden war.

„Elf Ressourcen, bei denen die reale Infrastruktur und das Template nicht übereinstimmen“, sagte Priya. „Elf potenzielle Inkonsistenzen zwischen Staging und Produktion, von denen wir nichts wissen.“

Leo sagte nichts. Einige dieser Modifikationen waren seine.

Er verbrachte die nächste Woche damit, die abgedrifteten Ressourcen mit den Templates abzugleichen. Drei der manuellen Änderungen waren Bugs – Konfiguration, die nie hätte angewendet werden sollen. Der Rest waren legitime Änderungen, die nur nie zurück in das Template übernommen worden waren.

**Warum es für das Well-Architected Framework wichtig ist**: Infrastructure as Code sitzt an der Schnittstelle von Operational Excellence (wiederholbare Bereitstellungen, versionsverwaltete Infrastruktur, Prüfbarkeit jeder Änderung), Reliability (wenn eine Region ausfällt, können Sie die Umgebung aus dem Template neu erstellen, nicht aus dem Gedächtnis) und Security (IAM-Rollen und Security-Group-Regeln werden im Code überprüft, nicht nachträglich in der Konsole entdeckt). Es ist kein Nice-to-have – es ist eine der grundlegenden Praktiken, die das Framework durchgängig empfiehlt.

---

> **Prüfungstipp — CloudFormation**
>
> *SAA-C03-Domäne: Domänenübergreifend — Operational Excellence und Reliability*
>
> - **CloudFormation = deklaratives IaC auf AWS.** Sie deklarieren den gewünschten Zustand in einem Template; CloudFormation erstellt und verwaltet die Ressourcen. Prüfungssignal: „wiederholbare Bereitstellungen“, „Infrastructure as Code“, „konsistente Umgebungen“.
> - **Template** → **Stack**: Das Template ist die Deklaration; der Stack sind die bereitgestellten Ressourcen. Ein Stack kann als Einheit erstellt, aktualisiert oder gelöscht werden.
> - **Change Set**: Vorschau dessen, was sich ändert, bevor ein Update auf einen laufenden Stack angewendet wird. „Den Diff vor der Anwendung sehen.“ Prüfungssignal: „Infrastrukturänderungen vor der Bereitstellung überprüfen“ → Change Set.
> - **Drift Detection**: Identifiziert Ressourcen, die außerhalb von CloudFormation manuell geändert wurden. „Jemand hat etwas in der Konsole angeklickt“ → Drift Detection.
> - **DeletionPolicy-Attribut**: Steuert, was mit einer Ressource passiert, wenn ihr Stack gelöscht wird. `Retain` – die Ressource wird behalten (nützlich für S3-Buckets mit Daten, die Sie nicht verlieren möchten). `Delete` – die Ressource wird zerstört (der Standard). `Snapshot` – für RDS und einige andere Dienste erstellt CloudFormation vor dem Löschen einen finalen Snapshot. Prüfungssignal: „verhindern, dass eine RDS-Datenbank gelöscht wird, wenn der Stack gelöscht wird“ → `DeletionPolicy: Snapshot` oder `DeletionPolicy: Retain`.
> - **CloudFormation StackSets**: Denselben Stack über mehrere AWS-Konten und Regionen mit einer einzigen Operation bereitstellen. Prüfungssignal: „dieselbe Infrastruktur über alle Konten in einer Organisation bereitstellen“.

**Variante: Wenn das Framework Sie in die Irre führt**

Wenn Sie in einem Well-Architected-Review jedes Kästchen ankreuzen, aber Ihre Ausfallwiederherstellung nicht im Staging validiert haben, wird Ihre Hochverfügbarkeitsarchitektur beim ersten echten Vorfall versagen – weil die Dokumentation von Resilienz nicht dasselbe ist wie getestete Resilienz. Das Framework fragt „Habt ihr Multi-AZ?“, nicht „Habt ihr bestätigt, dass das Failover in eurer spezifischen Konfiguration tatsächlich korrekt funktioniert?“

Wenn Sie das Framework als Checkliste verwenden, um einen Prüfer zufriedenzustellen, statt als Denkwerkzeug, um das System zu verbessern, werden Sie eine korrekte Dokumentation einer Architektur erstellen, die Sie nicht vollständig verstehen. Die Fragen sind am wertvollsten, wenn sie Lücken aufdecken, die Sie nicht erwartet hatten zu finden.

## Stärken und Grenzen

**Was das Well-Architected Framework gut macht**: Es gibt Teams ein gemeinsames Vokabular zur Diskussion architektonischer Kompromisse – eine Sprache, die Personalwechsel und Anbietergespräche überdauert. Die Durchführung eines Well-Architected-Reviews erzwingt die explizite Anerkennung von Risiken, die sonst unsichtbar sind: „Ja, wir wissen, dass wir hier einen Single Point of Failure haben; wir haben diesen Kompromiss akzeptiert, weil die Kosten seiner Beseitigung die erwarteten Kosten des Ausfalls übersteigen.“ Diese Art von dokumentiertem, bewusstem Kompromiss ist das Ergebnis eines guten Reviews.

**Was es nicht kann**: Das Framework ist deskriptiv, nicht präskriptiv. Es beschreibt Eigenschaften gut entworfener Systeme – es sagt Ihnen nicht, wie man sie baut. Jedes Kästchen in einem Well-Architected-Review anzukreuzen garantiert keine gute Architektur. Ein System kann hochverfügbar, betrieblich exzellent, kostenoptimiert sein und trotzdem das falsche Problem lösen. Das Framework ist eine Linse, kein Bauplan. Verwenden Sie es, um die richtigen Fragen aufzudecken, nicht um sie zu beantworten.

## Zusammenfassung

Der Well-Architected-Review hinterließ ihnen 14 Punkte – drei, die sofortige Aufmerksamkeit brauchten, und der Rest, der einen Plan brauchte. Die risikoreichen Befunde waren nicht gerade Überraschungen; es waren Dinge, von denen das Team gewusst und die es noch nicht angegangen hatte. Der Review gab ihnen eine strukturierte Möglichkeit, diese Lücken offen anzuerkennen, sie nach Risiko zu priorisieren und sich auf einen Zeitplan festzulegen. Diese Rechenschaft, mehr als jeder einzelne Befund, war der Wert.

- Das **AWS Well-Architected Framework** hat sechs Säulen: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization und Sustainability.
- Jede Säule hat Designprinzipien und Best Practices, die durch einen strukturierten Fragensatz bewertet werden.
- Das **Well-Architected Tool** (kostenlos in der AWS-Konsole) leitet den Review und generiert einen Bericht.
- Das Ergebnis ist eine priorisierte Liste architektonischer Verbesserungen, kategorisiert nach Risiko.
- **Infrastructure as Code** ist ein säulenübergreifender Enabler – empfohlen von den Säulen Operational Excellence, Security und Reliability.

## Prüfungstipps

*SAA-C03-Domäne: Domänenübergreifend — alle Domänen*

- **Kennen Sie alle sechs Säulen und ihren Hauptfokus**. Die Prüfung beschreibt ein Szenario (z. B. „das Team möchte sicherstellen, dass sein System sich von AZ-Ausfällen erholen kann“) und fragt, welcher Säule es zugehört (Reliability).
- **Säulenzuordnung**:
  - „Änderungen zuverlässig bereitstellen, aus Fehlern lernen, überwachen“ → Operational Excellence
  - „IAM, Verschlüsselung, Netzwerkkontrollen, Bedrohungserkennung“ → Security
  - „HA, Failover, Skalierung, DR“ → Reliability
  - „Right-Sizing, CDN, richtige Technologieauswahl“ → Performance Efficiency
  - „Preismodelle, ungenutzte Ressourcen, Kostentransparenz“ → Cost Optimization
  - „Energieeffizienz, Ressourcenauslastung, Datenlebenszyklus“ → Sustainability
- **Infrastructure as Code**: Vom Framework für Wiederholbarkeit, Prüfbarkeit und Wiederherstellung empfohlen. CloudFormation, CDK und SAM sind AWS-native IaC-Werkzeuge.
- **Well-Architected Tool**: Das AWS-Konsolen-Werkzeug, das den Review-Prozess leitet. Kostenlos nutzbar. Generiert Verbesserungspläne.
- **AWS Trusted Advisor**: Ähnlich dem Well-Architected Framework, aber automatisiert – scannt Ihr Konto und liefert Empfehlungen über Kosten, Leistung, Sicherheit und Fehlertoleranz. Die Überschneidung ist real: Trusted Advisor automatisiert einen Teil dessen, was das Framework manuell bewertet.

## Übungen

**Übung 1 — Wiederholung**

Nennen Sie die sechs Säulen des AWS Well-Architected Frameworks und beschreiben Sie das Hauptanliegen jeder in einem Satz.

*(Versuchen Sie es aus dem Gedächtnis. Wenn es Ihnen schwerfällt, ist das eine nützliche Information darüber, welche Säulen mehr Aufmerksamkeit brauchen.)*

**Übung 2 — SAA-C03-Szenario**

*Szenario*: Ein Engineering-Team bereitet sich auf einen Well-Architected-Review vor. Ihre Anwendung läuft auf EC2 mit RDS Multi-AZ. Kürzlich haben sie entdeckt, dass:

- Ihr Bereitstellungsprozess manchmal EC2-Instanzen mit unterschiedlichen Bibliotheksversionen hinterlässt (Konfigurations-Drift)
- Sie keine automatisierte Benachrichtigung haben, wenn das RDS-Failover ausgelöst wird
- Ihre IAM-Benutzer alle AdministratorAccess haben
- Sie ihren Backup-Wiederherstellungsprozess seit 14 Monaten nicht getestet haben

Ordnen Sie jedes Problem der RELEVANTESTEN Well-Architected-Säule zu.

A) Konfigurations-Drift: Operational Excellence; Keine RDS-Failover-Benachrichtigung: Reliability; AdministratorAccess: Security; Kein Backup-Wiederherstellungstest: Reliability

B) Konfigurations-Drift: Security; Keine RDS-Failover-Benachrichtigung: Performance Efficiency; AdministratorAccess: Operational Excellence; Kein Backup-Wiederherstellungstest: Cost Optimization

C) Konfigurations-Drift: Reliability; Keine RDS-Failover-Benachrichtigung: Performance Efficiency; AdministratorAccess: Security; Kein Backup-Wiederherstellungstest: Operational Excellence

D) Konfigurations-Drift: Security; Keine RDS-Failover-Benachrichtigung: Reliability; AdministratorAccess: Cost Optimization; Kein Backup-Wiederherstellungstest: Security

**Hinweis 1**: „Konfigurations-Drift“ im Bereitstellungsprozess → welche Säule deckt Bereitstellungspraktiken ab?

**Hinweis 2**: „AdministratorAccess“ für alle Benutzer → welche Säule deckt Zugriffskontrolle ab?

**Hinweis 3**: „Backup-Wiederherstellung nicht getestet“ → welche Säule deckt das Testen Ihrer Wiederherstellungsmechanismen ab?

**Antwort**: A

**Erläuterung**: Konfigurations-Drift bei Bereitstellungen (inkonsistente Umgebungen) ist ein Operational-Excellence-Problem – es geht um zuverlässige, konsistente Bereitstellungspraktiken. Keine Benachrichtigung beim RDS-Failover bedeutet, dass Sie nicht wissen, wann HA-Mechanismen ausgelöst werden – ein Reliability-Problem (die Gesundheit Ihres Systems kennen). AdministratorAccess für alle Benutzer verstößt gegen das Least-Privilege-Prinzip – ein Security-Problem. Ungetestete Backup-Wiederherstellung bedeutet, dass Ihre Reliability-Mechanismen (DR) nicht verifiziert sind.

**Warum nicht B?** B ordnet Konfigurations-Drift fälschlich Security zu (inkonsistente Bibliotheksversionen sind ein Bereitstellungs-Betriebsproblem, keine Sicherheitsbedrohung) und AdministratorAccess Operational Excellence (Zugriffskontrolle ist ein Security-Anliegen, kein Betriebsprozess).

**Warum nicht C?** C platziert AdministratorAccess korrekt in Security, ordnet aber Konfigurations-Drift fälschlich Reliability zu (Bereitstellungskonsistenz ist Operational Excellence) und ungetestete Backup-Wiederherstellung Operational Excellence (Wiederherstellungstests sind ein Reliability-Anliegen – Sie verifizieren, dass Ihr System sich erholen kann, nicht dass Ihre Prozesse konsistent sind).

**Warum nicht D?** D ordnet AdministratorAccess Cost Optimization zu (zu breite Berechtigungen haben nichts mit Kosten zu tun) und ungetestete Backup-Wiederherstellung Security (ein Backup nicht wiederherstellen zu können ist ein Reliability-Versagen, keine Sicherheitslücke).

*SAA-C03-Domäne: Domänenübergreifend*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Führen Sie einen Mini-Well-Architected-Review einer Anwendung durch, die Sie kennen oder bauen. Notieren Sie für jede der sechs Säulen:

- Eine Sache, die die Anwendung gut macht
- Eine Sache, die die Anwendung verbessern könnte

Ordnen Sie dann Ihre Verbesserungspunkte nach Risiko (was am wahrscheinlichsten einen Vorfall oder Verschwendung verursacht?) und Priorität (was hätte die größte Wirkung, wenn es behoben würde?).

*(Diese Übung ist wertvoller, als sie scheinen mag. Die Praxis, Architektur systematisch aus mehreren Blickwinkeln zu bewerten, ist eine Kernkompetenz eines Senior Engineers.)*

## Post-Credits-Szene

Drei Wochen nach dem Well-Architected-Review hatte das Team die drei P1-Fixes implementiert – die sieben Lambda-Rollen waren Least-Privilege, die Root-Nutzung löste eine Benachrichtigung aus, und das Aurora-Failover war an einem Dienstag um 2 Uhr morgens unter Last getestet worden – und die P2-Arbeit war im Gange.

Das EC2-Patching war nun über AWS Systems Manager Patch Manager automatisiert. Ein Incident-Response-Prozessdokument existierte (nicht perfekt, aber geschrieben und geteilt). Der Multi-Region-Warm-Standby-Plan war entworfen und für die Implementierung im nächsten Quartal geplant.

Priya überprüfte den Bericht des Well-Architected Tools. Die P1-Befunde waren geschlossen oder mit Nachweis zugewiesen. Die Punkte mit mittlerem und niedrigem Risiko schrumpften, mit Verantwortlichen und Daten.

„Wir sind in besserer Verfassung als zuvor“, sagte sie.

„Ist das gut?“, fragte Leo.

„Es ist Fortschritt“, sagte sie. „Man schließt einen Well-Architected-Review nicht ab. Man macht Fortschritt, dann überprüft man in sechs Monaten erneut.“

Maya hatte über etwas nachgedacht.

„Wir haben 31 Kapitel damit verbracht, einzelne AWS-Dienste zu lernen“, sagte sie. „Und jetzt fangen wir an, das ganze System zu betrachten. Was die Art ist, wie Architekten denken.“

„Wir denken schon eine Weile wie Architekten“, sagte Leo.

„Wir haben architektonische Entscheidungen getroffen“, sagte Maya. „Das ist etwas anderes. Wie ein Architekt zu denken bedeutet, Entscheidungen zu bewerten, *bevor* man sie trifft, nicht danach.“

„Was ist der Unterschied?“, fragte Tom.

„Im nächsten Kapitel“, sagte sie, „versuchen wir, das zu beantworten.“

Im nächsten Kapitel: wie ein echter Architektur-Review aussieht, von Grund auf.
