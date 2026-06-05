# Kapitel 31: Der Bauinspektor für Cloud-Architekturen

Stehen Sie auf. Dehnen Sie sich aus. Nehmen Sie sich, wenn Sie es brauchen, eine echte Pause.

Dieses Kapitel ist anders als die vorherigen. Wir haben 30 Kapitel damit verbracht, Wissen über spezifische Dienste und Muster aufzubauen. Jetzt treten wir zurück und betrachten das große Ganze.

Wie sieht eine *gute* Cloud-Architektur eigentlich aus? Gibt es eine systematische Möglichkeit, zu bewerten, ob das, was Sie gebaut haben, tatsächlich gut gestaltet ist – oder nur funktionsfähig?

Es gibt sie. AWS nennt sie den Well-Architected Framework.

Nimbus hatte bereits seit zwei Jahren betrieben. Das Team hatte hunderte architektonische Entscheidungen getroffen – einige bewusst, einige unbeabsichtigt, einige unter Druck. Das System funktionierte. Aber Maya hatte eine Frage.

„Ist unsere Architektur tatsächlich *gut*? Nicht nur funktionsfähig. Gut.“

Niemand antwortete sofort.

„Weil ich von einer Well-Architected Review gehört habe,“ fuhr sie fort. „AWS bietet sie Kunden an. Einige unserer Investoren haben davon gesprochen. Ich denke, wir sollten eine durchführen.“

„Was ist das?“, fragte Leo.

„Das AWS-Framework zur Bewertung von Cloud-Architekturen,“ sagte Priya. „Sechs Säulen. Ein Satz von Fragen und Best Practices für jede. Sie bewerten Ihre Architektur anhand aller dieser Säulen und identifizieren, was fehlt.“

„Es ist wie eine Bauinspektion,“ sagte Tom. „Man weiß, dass das Gebäude funktioniert. Die Inspektion sagt Ihnen, ob es den Bauvorschriften entspricht und was bei einem Erdbeben fehlschlagen könnte.“

**Die Sechs Säulen**

Der AWS Well-Architected Framework ist auf sechs Säulen organisiert. Jede Säule hat einen Satz von Designprinzipien, Best Practices und Fragen, um Ihre Architektur zu bewerten.

**1. Betriebliche Exzellenz**

*Fokus*: Das Betreiben und Überwachen von Systemen, um Geschäftswert zu liefern, und die kontinuierliche Verbesserung von Prozessen und Verfahren.

Wichtige Bereiche:

- Wie werden Änderungen bereitgestellt? (CI/CD, Infrastruktur als Code, automatisierte Bereitstellungen)
- Wie wird das System überwacht und festgestellt, wenn etwas schief geht?
- Wie lernt man aus Fehlern? (Post-Mortems, Runbooks, blamellen Kultur)
- Wie werden Änderungen im großen Maßstab gehandhabt?

Nimbus-Bewertung:

- Vorhanden: CI/CD-Pipeline mit automatisierten Bereitstellungen
- Vorhanden: CloudWatch-Alarmen und GuardDuty
- Vorhanden: Vierteljährliche Chaos-Engineering-Tests
- Warnung: Post-Mortem-Prozess nicht formalisiert – Vorfälle wurden untersucht, aber Erkenntnisse wurden nicht systematisch dokumentiert

**2. Sicherheit**

*Fokus*: Schutz von Informationen, Systemen und Vermögenswerten durch Risikobewertung und -minderungsstrategien.

Wichtige Bereiche:

- Wer hat Zugriff auf was und mit der geringstmöglichen Privilegien?
- Wie wird Daten ruhend und während der Übertragung verschlüsselt?
- Wie werden Bedrohungen erkannt und darauf reagiert?
- Gibt es automatisierte Sicherheitskontrollen?

Nimbus-Bewertung:

- Vorhanden: IAM mit geringer Privilegien (nach der Bereinigung in Kapitel 14)
- Vorhanden: KMS für Datenverschlüsselung, Secrets Manager für Anmeldeinformationen
- Vorhanden: GuardDuty, WAF, Shield Standard
- Vorhanden: VPC mit privaten Subnetzen, Sicherheitsgruppen
- Warnung: Sicherheitsupdates für EC2-Instanzen nicht vollständig automatisiert (Priya hat dies bereits vor Monaten hervorgehoben, wurde aber noch nicht behoben)

**3. Zuverlässigkeit**

*Fokus*: Sicherstellung, dass ein System seine beabsichtigte Funktion korrekt und konsistent ausführt und in der Lage ist, Ausfälle zu bewältigen.

Wichtige Bereiche:

- Wie geht das System mit Komponentenfehlern um?
- Wie wird es sich von regionalen Ausfällen erholen?
- Wie wird die Nachfrage gemanagt?
- Wie wird das System auf Ausfälle getestet?

Nimbus-Bewertung:

- Vorhanden: Multi-AZ für alle kritischen Komponenten
- Vorhanden: Aurora Serverless mit automatischer Failover
- Vorhanden: Auto Scaling für EC2 und ECS
- Vorhanden: Chaos-Engineering-Tests (vierteljährlich)
- Warnung: Keine Multi-Region-Bereitstellung (Warm-Standby noch nicht implementiert – für nächsten Quartal geplant – geplant)

**4. Leistungs-Effizienz**

*Fokus*: Effiziente Nutzung von IT- und Rechenressourcen.

Wichtige Bereiche:

- Wird der richtige Instanztyp und die richtige Datenbankart für die Arbeitslast verwendet?
- Ist die Skalierung korrekt konfiguriert?
- Wird Daten an Benutzer von dem optimalen Standort geliefert?

Nimbus-Bewertung:

- Vorhanden: CloudFront für globale Content Delivery
- Vorhanden: ElastiCache für Datenbank-Lesebeschleunigung
- Vorhanden: Aurora Read Replicas
- Vorhanden: Lambda für geeignete Arbeitslasten
- Warnung: Einige EC2-Instanzen wurden seit der ursprünglichen Bereitstellung nie richtig dimensioniert

**5. Kostenoptimierung**

*Fokus*: Vermeidung unnötiger Kosten.

Wichtige Bereiche:

- Werden Ressourcen angemessen dimensioniert?
- Werden ungenutzte Ressourcen stillgelegt?
- Werden geeignete Preismodelle verwendet?
- Werden Ausgabensabweichungen erkannt?

Nimbus-Bewertung:

- Vorhanden: Savings Plans implementiert (Kapitel 27)
- Vorhanden: S3-Lebenszyklusrichtlinien (Kapitel 23)
- Vorhanden: DynamoDB Auto Scaling
- Vorhanden: AWS Budgets mit Benachrichtigungen
- Vorhanden: Vierteljährliche Kostenüberprüfungen

**6. Nachhaltigkeit**

*Fokus*: Minimierung der Umweltauswirkungen des Betriebs von Cloud-Workloads.

Wichtige Bereiche:

- Wird die Auslastung maximiert (Vermeidung von Leerlaufressourcen)?
- Werden Instanztypen für Energieeffizienz ausgewählt?
- Wird Daten nur so lange gespeichert, wie sie benötigt werden?

Nimbus-Bewertung:

- Präsent: Lambda und Fargate für serverlose/Container-Workloads (bessere Ressourceneffizienz als dedizierte EC2)
- Präsent: S3 Lifecycle-Richtlinien (Daten löschen, wenn sie nicht mehr benötigt werden)
- Warnung: Einige graviton-basierte Instanzen sind noch nicht übernommen (AWS Graviton ist energieeffizienter und günstiger)

**Der Well-Architektur-Überprüfungsprozess**

Die Überprüfung ist kein Test, den man besteht oder nicht besteht. Es ist eine strukturierte Diskussion über die Architektur, die von mehr als 60 Fragen über die sechs Säulen geleitet wird.

Jede Frage identifiziert eine Best Practice. Wenn die Architektur dieser folgt, ist das ein Stärke. Wenn nicht, ist es ein "Problem" – kategorisiert nach Risikostufe (hoch, mittel, niedrig).

Das Ergebnis: eine priorisierte Liste von Verbesserungsempfehlungen. Nicht alles muss sofort behoben werden. Der Rahmen hilft Ihnen, die Kompromisse jeder Lücke zu verstehen und zu entscheiden, was zuerst angegangen werden soll.

Das AWS Well-Architected Tool (verfügbar in der AWS-Konsole, kostenlos) bietet den Fragenrahmen und generiert einen Bericht mit Empfehlungen.

Für Nimbus planten Maya einen halben Tag Workshop. Alle vier Teammitglieder überprüften gemeinsam jede Säule. Am Ende hatten sie eine Liste von 12 "Problemen" – drei mit hohem Risiko, fünf mit mittlerem Risiko und vier mit niedrigem Risiko.

**Hohes Risiko Probleme:**

1. Kein Multi-Region Disaster Recovery Plan (Zuverlässigkeit)
2. EC2-Sicherheitsupdates nicht automatisiert (Sicherheit)
3. Kein formeller Incident-Response-Prozess (betriebliche Exzellenz)

**Mittleres Risiko Probleme:**

5 Elemente einschließlich: keine Graviton-Adoption, einige EC2-Instanzen nicht richtig dimensioniert, kein formeller Runbook für Datenbank-Failover

**Niedriges Risiko Probleme:**

4 Elemente einschließlich: CloudFront Cache-Hit-Rate könnte durch abgestimmte TTLs höher sein, einige Sicherheitsgruppenregeln breiter als nötig

**Das Prisma: Spezialisierung der Überprüfung**

Der Kern des Well-Architektur-Frameworks ist technologieagnostisch. AWS veröffentlicht auch **Prismen** – Erweiterungen des Frameworks für spezifische Anwendungsfälle oder Branchen:

- **Serverless Prisma**: Zusätzliche Fragen für Lambda-basierte Architekturen
- **SaaS Prisma**: Für Multi-Tenant-SaaS-Anwendungen
- **Machine Learning Prisma**: Für ML-Training und -Inferenz-Workloads
- **Finanzdienstleistungen Prisma**: Regulatorische und Compliance-Fragen für FinTech
- **Gesundheitswesen Prisma**: HIPAA-Überlegungen

Für Nimbus war das SaaS Prisma relevant. Es beinhaltete Fragen zu Tenant-Isolation, Onboarding-Automatisierung und pro-Tenant-Kostenallokation – alle Bereiche, die Nimbus aktiv weiterentwickelte.

**Der Unterschied zwischen gut gestaltet und einfach nur funktionieren**

„Unser System funktioniert“, sagte Leo nach der Überprüfung. „Aber ich hatte nicht realisiert, wie viele Dinge wir ‘gut genug’ gemacht und weitergemacht hatten.“

„Das ist normal“, sagte Priya. „Das Bauen unter Zeitdruck bedeutet, dass man pragmatische Entscheidungen trifft. Die Well-Architektur-Überprüfung ist die geplante Zeit, um sie zu überdenken.“

„Einige dieser Lücken scheinen im Nachhinein offensichtlich“, fuhr er fort. „Das Sicherheitsupdate – ich wusste, dass wir es nicht automatisiert hatten. Ich habe es einfach nie priorisiert, es zu beheben.“

„Weil ‘es funktioniert’ und ‘es ist gut architektonisch’ sich im Tagesgeschäft gleich anfühlen“, sagte Maya. „Der Unterschied wird erst dann sichtbar, wenn etwas schief geht.“

Dies ist eines der wichtigsten Dinge, die ein Senior Engineer versteht: Das Fehlen von Vorfällen bedeutet nicht das Fehlen von Risiko. Es bedeutet, dass das Risiko noch nicht ausgelöst wurde.

**Infrastruktur als Code: Der Enabler für betriebliche Exzellenz**

Ein Thema, das sich über mehrere Säulen erstreckt: **Infrastruktur als Code (IaC)**.

Wenn Ihre Infrastruktur manuell über die Konsole konfiguriert wird, dann:

- Das Neudefinieren davon in einem DR-Szenario ist langsam und fehleranfällig
- Audits von Änderungen sind unmöglich (wer hat was geändert und wann?)
- Das Rückgängigmachen einer schlechten Änderung erfordert manuelle Rückgängigmachung
- Konsistenz zwischen Umgebungen (Dev/Staging/Production) erfordert Disziplin

**AWS CloudFormation** ermöglicht es Ihnen, Infrastruktur in YAML/JSON-Vorlagen zu definieren. **AWS CDK (Cloud Development Kit)** ermöglicht es Ihnen, Infrastruktur mit Programmiersprachen (Python, TypeScript, Java) zu definieren. **Terraform** ist eine beliebte Drittanbieter-Alternative.

Nimbus hatte sich allmählich mit IaC mit Terraform bewegt. Zu der Zeit der Well-Architektur-Überprüfung war etwa 60 % ihrer Infrastruktur in Code definiert. Die Überprüfung empfahl, auf 100 % zu kommen.

„Warum der verbleibende 40%?“, fragte Leo.

„Der verbleibende 40% ist, wo unser kritische Infrastruktur lebt“, sagte Priya. „Wenn wir es nicht aus Code neu erstellen können, können wir uns zuverlässig von einer regionalen Katastrophe erholen.“

## Stärken und Grenzen

**Was das Well-Architektur-Framework gut macht**: Es gibt Teams einen gemeinsamen Wortschatz für die Diskussion von architektonischen Kompromissen – eine Sprache, die Bestand hat, wenn Personalwechsel oder Vendor-Gespräche stattfinden. Die Durchführung einer Well-Architektur-Überprüfung zwingt zu einer expliziten Anerkennung von Risiken, die andernfalls unsichtbar wären: „Ja, wir wissen, dass wir hier einen Single Point of Failure haben; wir haben diesen Trade-off akzeptiert, weil die Kosten für seine Eliminierung höher sind als die erwarteten Kosten des Ausfalls.“ Dieser dokumentierte, bewusste Trade-off ist das Ergebnis einer guten Überprüfung.

**Was es nicht tut**: Der Rahmen ist deskriptiv, nicht präskriptiv. Er beschreibt Eigenschaften von gut konzipierten Systemen – er sagt Ihnen nicht, wie man sie baut. Das Durchprüfen jedes Kästchens in einer Well-Architected-Überprüfung garantiert keine gute Architektur. Ein System kann hochverfügbar, betrieblich exzellent, kosteneffizient und dennoch das falsche Problem lösen. Der Rahmen ist eine Linse, nicht eine Blaupause. Verwenden Sie ihn, um die richtigen Fragen aufzuzeigen, nicht um sie zu beantworten.

## Zusammenfassung

- Der **AWS Well-Architected Framework** hat sechs Säulen: Betriebliche Exzellenz, Sicherheit, Zuverlässigkeit, Leistungsfähigkeit, Kostenoptimierung und Nachhaltigkeit.
- Jede Säule hat Designprinzipien und Best Practices, die durch einen strukturierten Fragenkatalog bewertet werden.
- Das **Well-Architected Tool** (kostenlos im AWS-Konsolen) leitet die Überprüfung und generiert einen Bericht.
- Die Ausgabe ist eine priorisierte Liste von architektonischen Verbesserungen, kategorisiert nach Risiko.
- **Linsen** spezialisieren den Rahmen für bestimmte Bereiche (Serverless, SaaS, Gesundheitswesen, ML).
- **Infrastructure as Code** ist ein Querschnitts-Enabler – wird von den Säulen Betriebliche Exzellenz, Sicherheit und Zuverlässigkeit empfohlen.
- Eine Well-Architected-Überprüfung ist kein Pass/Fail-Test. Es ist ein strukturierter Verbesserungsgespräch.

## Prüfungstipps

*SAA-C03 Domain: Querschnitt – alle Bereiche*

- **Kennen Sie alle sechs Säulen und ihren Hauptfokus**. Die Prüfung wird ein Szenario beschreiben (z. B. „das Team möchte sicherstellen, dass ihr System bei AZ-Ausfällen wiederhergestellt werden kann“) und fragen, welcher Säule es angehört (Zuverlässigkeit).
- **Säulenzuordnung**:
  - „Änderungen zuverlässig bereitstellen, aus Fehlern lernen, überwachen“ → Betriebliche Exzellenz
  - „IAM, Verschlüsselung, Netzwerkkontrollen, Bedrohungserkennung“ → Sicherheit
  - „HA, Failover, Skalierung, DR“ → Zuverlässigkeit
  - „Rechtfertigen, CDN, die richtige Technologie auswählen“ → Leistungsfähigkeit
  - „Preismodelle, ungenutzte Ressourcen, Kostenüberblick“ → Kostenoptimierung
  - „Energieeffizienz, Ressourcennutzung, Datenlebenszyklus“ → Nachhaltigkeit
- **Infrastructure as Code**: Wird vom Rahmen für Wiederholbarkeit, Nachvollziehbarkeit und Wiederherstellung empfohlen. CloudFormation, CDK und SAM sind AWS-native IaC-Tools.
- **Well-Architected Tool**: Das AWS-Konsolen-Tool, das den Überprüfungsprozess leitet. Kostenlos nutzbar. Generiert Verbesserungspläne.
- **AWS Trusted Advisor**: Ähnlich dem Well-Architected-Framework, aber automatisiert – scannt Ihr Konto und gibt Empfehlungen für Kosten, Leistung, Sicherheit und Fehlertoleranz. Der Überschneidungsgrad ist real: Trusted Advisor automatisiert einige der manuellen Bewertungen, die der Rahmen durchführt.

## Übungen

**Übung 1 – Erinnerung**

Nennen Sie die sechs Säulen des AWS Well-Architected Frameworks und beschreiben Sie das Hauptanliegen jeder Säule in einem Satz.

*(Versuchen Sie, dies aus dem Gedächtnis zu tun. Wenn Sie Schwierigkeiten haben, ist dies eine nützliche Information darüber, welche Säulen mehr Aufmerksamkeit benötigen.)*

**Übung 2 – Examenspraxis**

*Szenario*: Ein Engineering-Team bereitet sich auf eine Well-Architected-Überprüfung vor. Ihre Anwendung läuft auf EC2 mit RDS Multi-AZ. Vor Kurzem haben sie festgestellt, dass:

- Der Deployment-Prozess manchmal EC2-Instanzen mit unterschiedlichen Bibliotheksversionen (Konfigurationsdrift) hinterlässt
- Sie keine automatisierten Warnmeldungen erhalten, wenn der RDS-Failover ausgelöst wird
- Ihre IAM-Benutzer alle AdministratorAccess haben
- Sie ihren Backup-Wiederherstellungsprozess in 14 Monaten nicht getestet haben

Ordnen Sie jedes Problem der relevantesten Well-Architected-Säule zu.

A) Konfigurationsdrift: Betriebliche Exzellenz; Kein RDS-Failover-Alerting: Zuverlässigkeit; AdministratorAccess: Sicherheit; Kein Backup-Wiederherstellungstest: Zuverlässigkeit

B) Konfigurationsdrift: Sicherheit; Kein RDS-Failover-Alerting: Leistungsfähigkeit; AdministratorAccess: Betriebliche Exzellenz; Kein Backup-Wiederherstellungstest: Kostenoptimierung

C) Konfigurationsdrift: Zuverlässigkeit; Kein RDS-Failover-Alerting: Leistungsfähigkeit; AdministratorAccess: Sicherheit; Kein Backup-Wiederherstellungstest: Betriebliche Exzellenz

D) Konfigurationsdrift: Sicherheit; Kein RDS-Failover-Alerting: Zuverlässigkeit; AdministratorAccess: Kostenoptimierung; Kein Backup-Wiederherstellungstest: Sicherheit

**Hinweis 1**: „Konfigurationsdrift“ im Deployment-Prozess → welche Säule deckt Deployment-Praktiken ab?

**Hinweis 2**: „AdministratorAccess“ für alle Benutzer → welche Säule deckt Zugriffskontrollen ab?

**Hinweis 3**: „Backup-Wiederherstellung nicht getestet“ → welche Säule deckt Testmechanismen für Ihre Wiederherstellung ab?

**Antwort**: A

**Erläuterung**: Konfigurationsdrift in Deployments (inkonsistente Umgebungen) ist ein Problem der Betrieblichen Exzellenz – es geht um zuverlässige, konsistente Deployment-Praktiken. Kein Alarm bei RDS-Failover bedeutet, dass Sie nicht wissen, wann HA-Mechanismen ausgelöst werden – ein Zuverlässigkeits-Problem. AdministratorAccess für alle Benutzer verstößt gegen das Prinzip der geringsten Privilegien – ein Sicherheits-Problem. Ungetestete Backup-Wiederherstellung bedeutet, dass Ihre Zuverlässigkeitsmechanismen (DR) nicht verifiziert sind.

**Warum nicht C?** C platziert AdministratorAccess korrekt in Security, weist aber Konfigurationsdrift Zuverlässigkeit (Deployment-Konsistenz ist operative Exzellenz) und ungeprüfte Backup-Wiederherstellung operativer Exzellenz zu (Wiederherstellungstests sind ein Zuverlässigkeitsaspekt – Sie überprüfen, ob Ihr System sich erholen kann, nicht ob Ihre Prozesse konsistent sind).

**Warum nicht D?** D weist AdministratorAccess Kostenoptimierung zu (zu breite Berechtigungen haben nichts mit Kosten zu tun) und ungeprüfte Backup-Wiederherstellung Sicherheit zu (die Unfähigkeit, ein Backup wiederherzustellen, ist ein Zuverlässigkeitsfehler, keine Sicherheitslücke).

*SAA-C03 Domain: Transdomains*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Führen Sie eine Mini-Well-Architected-Überprüfung einer Anwendung durch, die Sie kennen oder entwickeln. Für jeden der sechs Säulen notieren Sie:

- Eine Sache, die die Anwendung gut macht
- Eine Sache, die die Anwendung verbessern könnte

Ordnen Sie dann Ihre Verbesserungsitems nach Risiko (was am wahrscheinlichsten zu einem Vorfall oder Verschwendung führt) und Priorität (was die größte Wirkung haben würde, wenn es behoben wäre?).

*(Diese Übung ist wertvoller als sie vielleicht erscheint. Die Praxis, die Architektur systematisch aus verschiedenen Blickwinkeln zu bewerten, ist eine Kernkompetenz eines Senior Engineers.)*

## Szene nach den Credits

Drei Wochen nach der Well-Architected-Überprüfung hatten das Team die drei hochriskanten Fehler behoben.

EC2-Patches wurden nun über AWS Systems Manager Patch Manager automatisiert. Ein Incident-Response-Prozessdokument existierte (nicht perfekt, aber geschrieben und geteilt). Der Multi-Region-Warm-Standby-Plan wurde entworfen und für die Implementierung im nächsten Quartal geplant.

Priya überprüfte den Well-Architected Tool-Bericht. Die Anzahl der hochriskanten Fälle: 0. Mittelrisiko: 3. Niedriges Risiko: 4.

"Wir sind in besserer Verfassung als zuvor", sagte sie.

"Ist das gut?" fragte Leo.

"Es ist Fortschritt", sagte sie. "Man schließt eine Well-Architected-Überprüfung nicht ab. Man macht Fortschritte und überprüft dann in sechs Monaten erneut."

Maya hatte über etwas nachgedacht.

"Wir haben 31 Kapitel damit verbracht, einzelne AWS-Dienste zu lernen. Und jetzt beginnen wir, das gesamte System zu betrachten. Was Architekten denken, nämlich systematisch."

"Wir haben schon so lange wie Architekten gedacht", sagte Leo.

"Wir haben architektonische Entscheidungen getroffen", sagte Maya. "Das ist anders. Denken wie ein Architekt bedeutet, Entscheidungen *vor* dem Treffen zu bewerten, nicht danach."

"Was ist der Unterschied?", fragte Tom.

"Im nächsten Kapitel", sagte sie, "versuchen wir, das zu beantworten."

Im nächsten Kapitel: Wie eine echte Architekturüberprüfung von Grund auf aussieht.
