# Kapitel 18: Wenn Dinge kaputtgehen

Dieses Kapitel behandelt Ausfälle – geplant, gegen Ausfälle geschützt und letztendlich als unvermeidlich akzeptiert. Es ist vielleicht das wichtigste Kapitel in diesem Buch.

Nimbus lief gut. Die Sicherheitsabstraktionen waren vorhanden. Die Überwachung war aktiv. Der Traffic wuchs.

Dann erhielt Leo eine Slack-Benachrichtigung um 23:23 Uhr am Donnerstagabend.

"us-east-1 Availability Zone us-east-1b — Hardwarefehler — reduzierter Dienst."

Er öffnete die AWS-Konsole. Die EC2-Instanzen in us-east-1b zeigten fehlgeschlagene Statusprüfungen. Seine Auto Scaling Group hatte ungesunde Instanzen erkannt und Ersatzinstanzen gestartet – in us-east-1b.

In der Availability Zone, die ausfiel.

Die neuen Instanzen starteten auch nicht. Sie befanden sich in derselben Hardwarefehlerzone.

„Der Load Balancer leitet den Traffic an beide AZs weiter“, sagte Leo niemandem. „Die Hälfte unseres Traffics geht an Instanzen, die nicht funktionieren.“

Zwanzig Minuten reduzierter Service, bevor er es bemerkte und die ASG manuell nur für us-east-1a nutzte.

„Das ist passiert, weil alles in einer AZ war“, sagte Priya am nächsten Morgen.

„Nein“, sagte Leo. „Ich hatte Instanzen in zwei AZs. Das Problem war, dass die Ersatzinstanzen in der ausfallenden AZ gestartet wurden.“

„Und die Datenbank?“

Leo hörte auf.

„Die RDS-Instanz ist Multi-AZ“, sagte er. „Der Standby befindet sich in us-east-1b. Was fehlgeschlagen war. Und RDS versuchte, auf den Standby umzuschalten, was ebenfalls fehlgeschlagen war.“

Zwanzig Minuten reduzierter Service waren zu dreißiebehninunten geworden.

**Die Analogie zum Stromnetz**

Denken Sie darüber nach, wie Ihr Zuhause Strom bekommt. Die Energie stammt nicht von einem einzelnen Draht, der von einem einzelnen Generator führt. Sie kommt von einem Netz – einem Netzwerk von Generatoren, Unterstationen und Übertragungslinien, die sich gegenseitig unterstützen. Wenn eine Unterstation Feuer fängt, runden die anderen die Stromversorgung um. Sie bemerken es nicht. Die Lichter bleiben eingeschaltet.

AWS Availability Zones funktionieren auf die gleiche Weise. Anstatt eines riesigen Rechenzentrums, auf das alles angewiesen ist, verbreitet AWS Ihre Ressourcen über mehrere physisch getrennte Einrichtungen. Wenn eine Einrichtung Strom verliert oder einen Hardwarefehler hat, laufen die anderen weiter. Der Traffic wird automatisch umgeleitet. Ihre Anwendung bleibt online – weil es nie einen Draht gab, der durchtrennt werden konnte.

Multi-Region ist das nächste Level: Stellen Sie sich vor, Sie hätten Backup-Generatoren in einer völlig anderen Stadt. Wenn das gesamte lokale Stromnetz ausfällt, übernimmt die ferne Stadt. Komplexer einzurichten, aber widerstandsfähiger gegen katastrophale Ausfälle.

**Der Wortschatz des Ausfalls**

Bevor Sie für Widerstandsfähigkeit entworfen werden, benötigen Sie Wörter für das, was Sie entwerfen.

**Verfügbarkeit**: Der Prozentsatz der Zeit, in dem ein System betriebsbereit ist. „Vier Nines“ (99,99 %) bedeutet weniger als 52 Minuten Ausfallzeit pro Jahr. „Fünf Nines“ (99,999 %) bedeutet etwa 5 Minuten pro Jahr.

**RTO (Recovery Time Objective)**: Wie lange kann das System heruntergefahren werden, bevor es ein Geschäftsproblem darstellt? Wenn Ihr RTO 4 Stunden beträgt, haben Sie 4 Stunden, um den Service wiederherzustellen, bevor SLAs verletzt werden.

**RPO (Recovery Point Objective)**: Wie viele Daten können Sie sich leisten, zu verlieren? Wenn Ihr RPO 1 Stunde beträgt, können Sie zulassen, dass bis zu einer Stunde an Daten bei einem katastrophalen Ausfall verloren geht. Alles, was in der letzten Stunde vor dem Ausfall geschrieben wurde, ist verloren.

**Fehlertoleranz**: Die Fähigkeit, zu funktionieren (auf einigen Ebenen), wenn ein Baustein ausfällt.

**Disaster Recovery (DR)**: Der Prozess der Wiederherstellung von einem katastrophalen Ausfall – einem Datenzentrumbrand, einem regionalen Ausfall, einem versehentlichen Massenlöschvorgang.

Diese fünf Konzepte treiben jede architektonische Entscheidung in diesem Kapitel an.

**Multi-AZ: Überleben von Availability Zone-Ausfällen**

Eine Availability Zone (AZ) ist ein physisch getrennter Rechenzentrum innerhalb einer Region. AZs sind so konzipiert, dass sie unabhängig voneinander sind: separate Stromversorgungen, separate Kühlung, separate Netzwerkinfrastruktur. Aber sie sind eng genug, dass die Netzwerk-Latenz zwischen ihnen 1-2 Millisekunden beträgt.

**Multi-AZ-Bereitstellungen** verteilen Ihre Ressourcen über zwei oder mehr AZs innerhalb einer Region. Wenn eine AZ ausfällt:

- Der Load Balancer stoppt das Weiterleiten des Traffics zu ungesunden Instanzen in der ausgefallenen AZ
- Die Auto Scaling Group startet Ersatzinstanzen – aber in der *gesunden* AZ
- RDS schaltet auf den Standby in der gesunden AZ um

Leos Fehler: Seine Auto Scaling Group war nicht so konfiguriert, dass sie Ersatzinstanzen nur in gesunden AZs starten würde. Sie war so konfiguriert, dass sie das Gleichgewicht zwischen den AZs aufrechterhält. Als us-east-1b ausfiel, versuchte die ASG, die Instanzanzahl auszugleichen, indem sie Ersatzinstanzen in us-east-1b – der ausgefallenen AZ – startete.

Die Lösung: Konfigurieren Sie die ASG so, dass sie nur in gesunden AZs startet, wobei mindestens zwei AZs immer aktiv sind.

Die tiefere Lektion: Testen Sie Ihre Ausfallscenarios, bevor sie in der Produktion auftreten.

**Simulieren von Ausfällen: Chaos Engineering**

„Wie wissen wir, dass unsere Multi-AZ-Konfiguration tatsächlich funktioniert?“ fragte Maya.

„Wir machen Dinge kaputt“, sagte Leo.

Das klingt verrückt. Es ist eigentlich das verantwortungsvollste, was ein Team tun kann.

**Chaos Engineering** ist die Praxis, Fehler absichtlich in Ihr System zu injizieren, um zu überprüfen, ob es diese korrekt behandelt. Wir beenden absichtlich eine EC2-Instanz. Wir schalten die RDS-Instanz manuell in den Ausfall. Wir blockieren ein Subnetz vom Load Balancer.

Wenn das System innerhalb Ihres RTO automatisch wiederhergestellt wird, funktioniert Ihr Design.

Wenn das nicht der Fall ist, haben Sie gelernt, dass dies in einer kontrollierten Umgebung geschieht – nicht während eines 2-Uhr-Nacht-Produktionsvorfalls.

Für Nimbus: Leo schrieb einen Runbook (eine dokumentierte Verfahrensanweisung) zum Testen jeder Ausfallsituation. Einmal alle drei Monate würden sie absichtlich eine Komponente lahmlegen und die Wiederherstellungszeit messen. Wenn die Wiederherstellung länger dauerte als die RTO, würden sie das Design korrigieren.

**Multi-Region: Überleben regionaler Ausfälle**

Die meisten AWS-Ausfälle betreffen Availability Zones, nicht ganze Regionen. Regionale Ausfälle sind selten – aber sie passieren.

Bei einem regionalen Ausfall (oder für globale Anwendungen, die eine sehr geringe Latenz überall benötigen) ist **Multi-Region** die Lösung: Stellen Sie Ihre Anwendung in zwei oder mehr AWS-Regionen bereit.

Multi-Region führt zu grundlegender Komplexität:

**Datensynchronisation**: Ihre Datenbanken müssen über die Regionen synchronisiert sein. Jeder in us-east-1 geschriebene Daten muss letztendlich in eu-west-1 ankommen. „Letztendlich“ ist das Problem – während der Zeitverzögerung haben die Regionen leicht unterschiedliche Bilder der Welt.

**Active-passive vs. active-active**:

- **Active-passive**: Eine Region bedient gesamten Traffic. Die andere ist ein warmer Standby. Bei einem Ausfall schaltet sich der DNS-Verkehr auf den Standby um. Einfacher, aber der Standby ist inaktiv und teuer.
- **Active-active**: Beide Regionen bedienen den Traffic gleichzeitig. Komplexer zu bauen (erfordert Konfliktlösung für gleichzeitige Schreibvorgänge), aber weltweit niedrigere Latenz und keine ungenutzten Ressourcen.

**Fehlzeitenzeit**: DNS-Änderungen benötigen Zeit zum Propagieren (abhängig von TTL). Während des Propagationsfensters erreichen immer noch einige Benutzer die fehlerhafte Region. Das Design für eine sehr geringe RTO erfordert das Vorwärmen des Standby und die Minimierung der TTL vor geplanten Schaltungen.

**Notfallwiederherstellungsstrategien: Ein Spektrum**

Es gibt vier gängige DR-Strategien, die von der billigsten (und langsamsten Wiederherstellung) bis zur teuersten (und schnellsten Wiederherstellung) geordnet sind:

**Backup und Wiederherstellung** (Stunden RPO/RTO):

- Sichern Sie alles in S3 in einer anderen Region
- Bei einem Notfall: Provisionieren Sie die Infrastruktur von Grund auf neu, stellen Sie aus der Sicherung wieder her
- Kosten: sehr gering (Sie zahlen nur für die Speicherung)
- Wiederherstellungszeit: Stunden

**Pilot Light** (Minuten bis 1 Stunde RPO/RTO):

- Führen Sie eine minimale Version der Anwendung in der DR-Region aus (die „Pilot Light“, die schnell hochgefahren werden kann)
- Kern-Daten werden repliziert (RDS Read Replica in DR-Region)
- Bei einem Notfall: skalieren Sie die DR-Region hoch, befördern Sie die Read Replica zum Primär, schalten Sie den DNS um
- Kosten: moderat (Sie zahlen für einen kleinen laufenden Fußabdruck)
- Wiederherstellungszeit: Zehntel von Minuten

**Warm Standby** (Sekunden bis Minuten RPO/RTO):

- Führen Sie eine reduzierte Version der vollständigen Anwendung in der DR-Region aus
- Voll funktionsfähig, aber mit reduzierter Kapazität
- Bei einem Notfall: skalieren Sie hoch, schalten Sie den DNS um
- Kosten: höher (immer die vollständige Stacksatz mit reduzierter Skalierung laufen)
- Wiederherstellungszeit: Minuten

**Active-Active / Multi-Site** (nahe-Null RPO/RTO):

- Volle Kapazität in zwei oder mehr Regionen, die den Traffic gleichzeitig bedienen
- Keine Notwendigkeit zur Wiederherstellung – wenn eine Region ausfällt, wird der Traffic automatisch zur anderen geroutet
- Kosten: am höchsten (zwei vollständige Bereitstellungen in voller Skalierung)
- Wiederherstellungszeit: Sekunden (DNS-Propagierung nur)

Für Nimbus in dieser Phase: Warm Standby. Sie konnten sich Active-Active nicht leisten, aber Backup und Restore war für ihre Geschäftsanforderungen zu langsam.

**Amazon RDS: Multi-AZ vs. Read Replicas vs. Multi-Region**

Diese drei sind unterschiedlich und werden oft verwechselt:

| Merkmal        | Multi-AZ                     | Read Replica     | Multi-Region Read Replica |
|---------------|------------------------------|------------------|---------------------------|
| Zweck         | Hochverfügbarkeit (Failover) | Leseskalierung     | Leseskalierung + DR         |
| Datensynchron. | Synchron                      | Asynchron        | Asynchron              |
| Failover      | Automatisch                    | Manuelle Förderung | Manuelle Förderung          |
| Lesbar?       | Nein (Standby ist passiv)      | Ja              | Ja                       |
| Überregion?   | Nein (gleiche Region)             | Ja (optional)   | Ja                       |
| Für          | HA, RPO~0                    | Leselast        | Notfallwiederherstellung   |

Wichtige Erkenntnis: Multi-AZ-Standby ist **synchron** – jeder Schreibvorgang in die Primär wird bestätigt auf dem Standby, bevor der Schreibvorgang bestätigt wird. Das bedeutet, dass bei einem Ausfall keine Daten verloren gehen. RPO = 0.

Read Replicas sind **asynchron** – es gibt eine Replikationsverzögerung. Wenn die Primär ausfällt und Sie eine Read Replica befördern, können Sie Sekunden oder Minuten von den letzten Schreibvorgängen verlieren. RPO > 0.

## Stärken und Grenzen

**Multi-AZ**:

- Für Produktionslasten unerlässlich – ein Single-AZ ist ein Single Point of Failure
- Gut von AWS-Diensten unterstützt (RDS, ElastiCache, EKS alle unterstützen Multi-AZ)
- Relativ geringer Kostenaufwand im Vergleich zum Schutz, den es bietet

**Multi-Region**:

- Komplex zu implementieren, insbesondere für Datenbanken
- Datenresidenz-/Souveränitätsanforderungen können es tatsächlich erfordern (EU-Benutzerdaten müssen in der EU verbleiben)
- Latenzvorteile für globale Benutzer entstehen durch Routing, nicht durch Multi-Region per se (verwenden Sie CloudFront für statische Inhalte)
- Die meisten Organisationen benötigen kein Active-Active; sie investieren unterinvestieren in Warm Standby

## Zusammenfassung

- **RTO** (Recovery Time Objective): Wie lange Sie ausfallen können. **RPO** (Recovery Point Objective): Wie viel Daten Sie verlieren können.
- **Multi-AZ** verteilt Ressourcen über Availability Zones innerhalb einer Region. Schützt vor AZ-Ausfällen.
- **Multi-Region** wird in mehreren AWS-Regionen bereitgestellt. Schützt vor regionalen Ausfällen und dient globalen Nutzern mit geringer Latenz.
- DR-Strategien (am günstigsten bis am teuersten): Backup & Restore → Pilot Light → Warm Standby → Active-Active.
- RDS Multi-AZ Standby: Synchron, automatischer Failover, RPO = 0. Read Replicas: Asynchron, manuelle Promotion, RPO > 0.
- Testen Sie Ausfälle absichtlich (Chaos Engineering) bevor sie in der Produktion auftreten.

## Examenstipps

*SAA-C03 Domain: Entwurf widerstandsfähiger Architekturen (Domäne 2, Aufgabe 2.2)*

- **RTO vs RPO**: Erwarten Sie, dass die Prüfung Ihnen Anforderungen gibt ("die Organisation darf keine Ausfallzeit von mehr als 1 Stunde und keinen Datenverlust tolerieren") und Sie auffordert, die richtige DR-Strategie auszuwählen. Zuordnung: Kein Datenverlust = Synchrones Replikation = Multi-AZ oder Active-Active. 1 Stunde Ausfallzeit = Backup-und-Restore ist zu langsam; Warm Standby könnte funktionieren.
- **Multi-AZ RDS vs Read Replicas**: Die Prüfung wird Sie nach HA (Multi-AZ) vs. Read-Scaling (Read Replicas) fragen. Ein Multi-AZ-Standby ist nicht lesbar. Read Replicas können manuell zum Primär für DR hochgefahren werden.
- **Pilot Light vs Warm Standby**: Pilot Light hat eine minimale Infrastruktur, die läuft (nur die Datensynchronisation). Warm Standby läuft eine stark reduzierte, aber funktionierende Anwendung. Der Unterschied besteht darin, wie schnell Sie die Skalierung erhöhen können.
- **Aurora Global Database**: Eine Aurora-spezifische Funktion für Multi-Region Active-Passive. Die Primärregion schreibt; die Sekundärregionen lesen mit einer Latenz von <1 Sekunde. Bei einem Failover kann die Sekundärregion in <1 Minute hochgefahren werden. Examen-Signal: "Aurora, Multi-Region, RTO < 1 Minute."
- **AWS Backup**: Ein zentralisierter Backup-Dienst für EBS, RDS, DynamoDB, EFS, Storage Gateway. Die Prüfung nutzt ihn für Backup-und-Restore-Szenarien.
- **Route 53 Failover**: Die DNS-Schicht der DR. Primäre Gesundheitsprüfung schlägt fehl → Route 53 leitet an die Sekundär weiter. Die Propagationszeit bedeutet, dass dies nicht instant ist.

## Übungen

**Übung 1 — Erinnerung**

Erklären Sie den Unterschied zwischen RTO und RPO. Warum könnte eine Organisation ein niedriges RTO (nicht lange ausfallen) aber ein hohes RPO (kann kürzlich verlorenes Daten akzeptieren) haben?

*(Hinweis: Denken Sie an ein Unternehmen, bei dem es wichtiger ist, Kunden schnell zu bedienen, als jede Transaktion zu speichern.)*

**Übung 2 — Examen-Übung**

*Szenario*: Ein Gesundheitsunternehmen betreibt ein Patientenverzeichnissystem auf RDS PostgreSQL in `us-east-1`. Regulierungsbestimmungen schreiben vor, dass Patientendaten niemals verloren gehen dürfen (RPO = 0). Das System kann eine Ausfallzeit von bis zu 30 Minuten (RTO = 30 Minuten) in einer Katastrophe tolerieren. Kosten sind ein Problem.

Welche Architektur erfüllt diese Anforderungen BESTE?

A) RDS Multi-AZ in `us-east-1` mit täglichen automatisierten Backups zu S3 in `us-west-2`
B) RDS Multi-AZ in `us-east-1` mit einer Read-Replica in `us-west-2` konfiguriert für manuelle Promotion
C) RDS in `us-east-1` mit einem Warm Standby in `us-west-2` und Active-Active-Replikation
D) Aurora Global Database mit Primär in `us-east-1` und Sekundär in `us-west-2`

**Hinweis 1**: RPO = 0 bedeutet keinen Datenverlust, was synchrones Replikation oder nahezu-synchrones Replikation erfordert.

**Hinweis 2**: RTO = 30 Minuten bedeutet, dass Sie Zeit für manuelle Intervention haben. Sie benötigen keine vollständig automatische Failover mit Millisekunden.

**Hinweis 3**: Welche Option bietet Multi-AZ-Schutz (RPO = 0 innerhalb der Region) plus Cross-Region-DR-Fähigkeit?

**Antwort**: A

**Erläuterung**: RDS Multi-AZ in us-east-1 bietet synchrones Replikation zum Standby in derselben Region — RPO = 0 für AZ-Ausfälle. Tägliche automatisierte Backups zu S3 in us-west-2 bieten Cross-Region-DR. Bei einem vollständigen regionalen Ausfall wird von der S3-Backup in us-west-2 wiederhergestellt — innerhalb von 30 Minuten für eine kleine Datenbank. Dies ist kostengünstig und erfüllt beide Anforderungen.

**Warum nicht B?** Read Replicas sind asynchron — es kann einen Replikations-Latenz geben. Wenn der Primär ausfällt, werden alle seit der letzten Replikations-Sync geschriebenen Daten verloren. RPO > 0, was die Anforderung verletzt.

**Warum nicht C?** "Active-Active-Replikation" für PostgreSQL über Regionen ist komplex zu implementieren und ist keine Standard-RDS-Funktion. Diese Option ist technisch schwierig und teuer.

**Warum nicht D?** Aurora Global Database würde funktionieren, aber sie ist deutlich teurer als RDS Multi-AZ. Die Situation sagt, dass Kosten ein Problem sind, und Aurora ist Premium-Preis.

*SAA-C03 Domain: Entwurf widerstandsfähiger Architekturen — Aufgabe 2.2*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nimbus wurde beauftragt, Ordering-Services für ein großes Food Festival in Seattle bereitzustellen. Für 72 Stunden erwartet er 50-fach seinen normalen Traffic, mit keiner Toleranz für Ausfallzeiten (Der Veranstaltervertrag sieht finanzielle Strafen für Ausfallzeiten während der Veranstaltung vor).

Entwerfen Sie eine DR-Strategie für das Festivalfenster speziell. Würden Sie für diese 72 Stunden auf Active-Active umschalten? Wie würden Sie den Failover vorab testen? Was wäre Ihr RTO und wie würden Sie es vor dem Event validieren?

*(Es gibt keine einzelne korrekte Antwort. Das Ziel ist, DR für bestimmte SLA-Anforderungen zu entwerfen.)*

## Post-Credits-Szene

Leo hat das Chaos Engineering Runbook erstellt.

Alle Quartale, während eines geplanten Wartungsfensters, würde das Team Folgendes tun:

1.  Einen EC2-Instanz in us-east-1a beenden und beobachten, wie das ASG sie korrekt ersetzt
2.  Manuell einen RDS Multi-AZ-Failover erzwingen und überprüfen, dass die Anwendung innerhalb von 60 Sekunden wieder verbunden wurde
3.  Einen vollständigen Ausfall von us-east-1b simulieren, indem die Verfügbarkeitszonen des ASG angepasst wurden
4.  Ein Backup von einer Woche alt auf eine neue RDS-Instanz wiederherstellen und überprüfen, ob die Daten korrekt waren

Beim ersten Mal dauerte Schritt 2 4 Minuten und 17 Sekunden.

"Unser RTO-Versprechen an Restaurantpartner beträgt 5 Minuten", sagte Tom.

"Also sind wir durchgekommen. Gestern."

"Was würde passieren, wenn der Failover in einem realen Vorfall länger als 5 Minuten dauern würde?"

Maya antwortete: "Wir würden die SLA verletzen. Es gibt eine finanzielle Strafe in den Verträgen."

Leo starrte auf die 4:17 auf dem Bildschirm.

"Dann müssen wir es schneller machen", sagte er. Und er begann, die Dokumentation für Aurora zu lesen.

Im nächsten Kapitel: Der Ticket-Maschine, die es jeder Komponente von Nimbus ermöglicht, in ihrem eigenen Tempo zu arbeiten.
