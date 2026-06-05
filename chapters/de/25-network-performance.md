# Kapitel 25: Die Private Autobahn

Stehen Sie einen Moment auf. Schütteln Sie Ihre Hände.

Wir werden über das Verschieben von Daten sprechen. Nicht zwischen Diensten in AWS, sondern zwischen der realen Welt und AWS – zwischen Ihrem Büro und Ihrer Cloud-Infrastruktur, zwischen Kontinenten.

Die Infrastrukturabteilung von Nimbus (jetzt vier Ingenieure) hatte ihren Hauptsitz in einem gemeinsamen Büro in Seattle. Sie benötigten Zugriff auf die AWS-Infrastruktur, die sie verwalteten. Einige Operationen erforderten die Verbindung zu Ressourcen im VPC.

Derzeit verwendeten sie ein VPN auf ihren Laptops, um den Bastion-Host im öffentlichen Subnetz zu erreichen und von dort aus auf Ressourcen zuzugreifen.

Es funktionierte. Es war langsam. Die VPN-Verbindung wurde über das öffentliche Internet geroutet: Seattle → überlandischer Glasfaser → mehrere Carrier-Hops → us-east-1. Jede Hin- und Rückfahrt dauerte 80+ Millisekunden.

„Für den täglichen SSH-Zugriff ist das akzeptabel“, sagte Leo. „Aber wir werden bald unsere Analytik-Datenbank verschieben. 4 Terabyte historische Bestelldaten. Über diese Verbindung dauert die Migration Wochen.“

„Wir brauchen eine bessere Verbindung“, sagte Maya.

„Eine private Verbindung“, fügte Priya hinzu. „Nicht über das öffentliche Internet.“

Denken Sie daran wie beim Pendeln zur Arbeit. Ein Site-to-Site VPN ist wie das Fahren auf öffentlichen Straßen: Sie sichern Ihr Auto ab (Verschlüsselung), teilen aber dennoch Spuren mit jedem anderen und werden durch unvorhersehbare Staus verlangsamt. Direct Connect ist wie das Mieten einer dedizierten privaten Fahrspur auf der Autobahn – ohne teilten Verkehr, konstante Geschwindigkeit und eine höhere monatliche Gebühr. Die öffentliche Straße ist an manchen Tagen in Ordnung. Wenn Sie einen LKW mit wertvollen Gütern zu einem engen Zeitplan transportieren, zahlen Sie für die private Spur.

**AWS Site-to-Site VPN: Die Schnelle Option**

**AWS Site-to-Site VPN** erstellt einen verschlüsselten Tunnel zwischen Ihrem On-Premises-Netzwerk und Ihrem VPC, der über das öffentliche Internet läuft.

Einrichtung:

1. Erstellen Sie eine Virtual Private Gateway (VGW), die an Ihren VPC angeschlossen ist
2. Erstellen Sie einen Customer Gateway, der Ihren On-Premises-Router repräsentiert
3. Richten Sie zwei VPN-Tunnel (für Redundanz) zwischen ihnen ein

Der Datenverkehr wird verschlüsselt (AES-256). Er läuft über das öffentliche Internet, was bedeutet, dass die Latenz von den Internetbedingungen abhängt. AWS stellt zwei Tunnel automatisch für Redundanz bereit – wenn ein Tunnel Probleme hat, wird der Datenverkehr auf den anderen umgeschaltet.

**Wann Sie Site-to-Site VPN verwenden sollten:**

- Schnelle Einrichtung (Minuten bis Stunden)
- Kostengünstig ($0,05/Stunde pro VPN-Verbindung)
- Bandbreite: bis zu 1,25 Gbps pro Tunnel
- Akzeptable Internetlatenz für den Anwendungsfall

Für die 4 TB-Migration von Nimbus würde eine internetbasierte VPN mit maximal 1,25 Gbps mindestens 7 Stunden dauern, mit realen Overhead-Werten von 12-20 Stunden. Akzeptabel, aber die Staus auf dem öffentlichen Internetpfad machen es unvorhersehbar.

„Was ist die andere Option?“, fragte Tom.

**AWS Direct Connect: Die Dedizierte Leitung**

**AWS Direct Connect** stellt eine dedizierte, private Netzwerkverbindung zwischen Ihrem Standort (oder Ihrer Colocation-Anlage) und AWS her. Der Datenverkehr berührt niemals das öffentliche Internet.

Direct Connect ist eine physische Verbindung – eine Glasfaserleitung von Ihrem Netzwerk zu einem AWS Direct Connect-Standort. Sie arbeiten mit einem Telekommunikationsanbieter zusammen, um den Schaltkreis zu installieren. AWS stellt den Port auf ihrer Seite bereit.

**Vorteile:**

- Konstante, vorhersagbare Latenz (keine Schwankungen durch das öffentliche Internet)
- Geschwindigkeiten von 50 Mbps bis 100 Gbps
- Geringere Datenübertragungskosten als bei AWS Data Transfer Out (Direct Connect Datenübertragungsraten sind günstiger als Standard-AWS-Datenübertragungsraten)
- Höhere Sicherheit (privater Schaltkreis, nicht das öffentliche Internet)

**Nachteile:**

- Die Einrichtung dauert Wochen bis Monate (physische Infrastruktur-Provisionierung)
- Deutlich höhere Kosten als VPN ($0,025-0,30/Stunde pro Port, plus Telekom-Circuit-Kosten – oft $500-1000+/Monat Mindestpreis)
- Keine integrierte Redundanz (Sie müssen Redundanzschaltungen selbst einrichten)
- Nicht für geografisch verteilte Büros ohne mehrere Schaltungen geeignet

Für Nimbus war Direct Connect für ihre aktuelle Größe überdimensioniert. Aber für Unternehmen mit erheblichen Datenübertragungsvolumen oder Compliance-Anforderungen für private Netzwerkverbindungen zahlt sich Direct Connect aus.

**Hosted Connections: Der Mittelweg**

Nicht jede Organisation kann sich eine 100-Gbps-Dedizierte-Faser-Schaltung leisten. **Direct Connect Hosted Connections** ermöglichen es AWS Direct Connect Partners (zugelassenen Telekommunikationsanbietern), Sub-1-Gbps-Verbindungen bereitzustellen, die Sie mit anderen Kunden teilen.

Die Einrichtung ist schneller (Tage bis Wochen, nicht Monate) und die Kosten sind geringer als bei einer dedizierten Verbindung. Der Nachteil ist: geteilte Kapazität bedeutet weniger konstante Durchsatzleistung.

Für Nimbus (da sie wächst): Eine Hosted-Verbindung mit 500 Mbps über einen Partner würde eine private Konnektivität zu einem angemessenen Preis bieten.

**AWS Transit Gateway: Hub-and-Spoke für VPCs**

Als Nimbus wuchs, würden sie mehrere VPCs sammeln: die Produktions-VPC, die Staging-VPC, die Analytik-VPC und die Sicherheits-Tooling-VPC.

Ohne sorgfältige Planung erfordert die Verbindung dieser VPCs eine vollständige Mesh-Verbindung von VPC-Peering-Verbindungen. Für 4 VPCs: 6 Peering-Verbindungen. Für 10 VPCs: 45 Peering-Verbindungen. Für 20 VPCs: 190 Verbindungen. Das skaliert nicht.

**AWS Transit Gateway** ist ein Netzwerk-Hub, der mehrere VPCs und On-Premises-Netzwerke miteinander verbindet. Anstatt eines Meshs von Peering-Verbindungen verbindet jede VPC sich direkt mit dem Transit Gateway. Der Transit Gateway leitet den Datenverkehr zwischen diesen VPCs.

```
On-premises ──── Direct Connect ──┐
                                  │
Production VPC ───────────────── Transit Gateway
Staging VPC ──────────────────── Transit Gateway
Analytics VPC ────────────────── Transit Gateway
Security VPC ─────────────────── Transit Gateway
```

**Transitive Routing**: Wenn VPC A und VPC B beide mit einem Transit Gateway verbunden sind, können sie miteinander kommunizieren – ohne eine direkte Peer-Verbindung. Der Transit Gateway übernimmt die Routing-Funktionen. Im Gegensatz zum VPC-Peering (das nicht transitiv ist), ermöglicht der Transit Gateway eine Hub-and-Spoke-Topologie.

**Transit Gateway Kosten**: Werden pro Anhang (VPC oder VPN/Direct Connect-Verbindung) sowie pro verarbeiteten GB Daten berechnet. Bei großem Maßstab ist dies aufgrund der Einfachheit lohnend.

**VPC Endpoints: Privater Zugriff auf AWS-Dienste**

Ein subtiles Kosten- und Sicherheitsrisiko: Wenn Ihre EC2-Instanz (in einem privaten Subnetz) die S3-API aufruft, wird dieser Traffic über den NAT Gateway (um das Internet zu erreichen, wo der öffentliche S3-Endpunkt liegt) geleitet. Sie zahlen für die NAT Gateway-Verarbeitung.

**VPC Endpoints** ermöglichen es Ressourcen in Ihrem VPC, privat mit AWS-Diensten zu kommunizieren, ohne das öffentliche Internet zu durchlaufen – und ohne NAT Gateway.

Es gibt zwei Typen:

**Gateway Endpoints** (preiswert): Für S3 und DynamoDB. Sie fügen eine Route in Ihrer Routing-Tabelle hinzu, die S3- oder DynamoDB-Traffic an den Endpoint anstelle des NAT Gateway leitet. Kostenlos zu erstellen und zu nutzen.

**Interface Endpoints** (preisgebunden): Für andere AWS-Dienste (SQS, SNS, Secrets Manager, SSM usw.). Erstellt eine ENI (Elastic Network Interface) in Ihrem Subnetz mit einer privaten IP-Adresse. Der Traffic zu dem Dienst verwendet diese private IP-Adresse. Die Kosten betragen ca. 0,01 USD/Stunde pro AZ plus Datenverarbeitung.

Tom hat sofort Gateway Endpoints für S3 und DynamoDB erstellt, nachdem er herausfand, dass sie kostenlos sind. Die NAT Gateway-Verarbeitungskosten sanken um 30 %.

**AWS Global Accelerator: Routing an der Edge**

Als Nimbus Westküstenbenutzer über us-east-1 (Virginia) bedient wurde, betrug die Latenz 80 ms. Nicht, weil der Server übermäßig weit entfernt war, sondern weil die öffentliche Internet-Routing zwischen Seattle und Virginia suboptimal war und über mehrere Carrier-Netzwerke abgebogen wurde.

**AWS Global Accelerator** nutzt das private Backbone-Netzwerk von AWS (die gleiche Infrastruktur, die CloudFront antreibt), um den Traffic zwischen Benutzern und AWS-Anwendungen zu routen. Anstatt öffentliches Internet-Routing zu verwenden, betritt der Traffic das Netzwerk von AWS an der nächstgelegenen Edge-Location und reist über den optimierten privaten Pfad zu Ihrer Anwendung.

Für einen Benutzer in Seattle würde es so aussehen:

- **Ohne Global Accelerator**: Routing über öffentliche Internet-Carrier → ~80 ms
- **Mit Global Accelerator**: Erreichen der nächstgelegenen AWS Edge-Location in Seattle → Reisen über das AWS Backbone → Erreichen von us-east-1 → ~45 ms

Global Accelerator speichert keinen Inhalt (CloudFront tut dies). Es optimiert den Netzwerkpfad für dynamische Anfragen.

**Wann Global Accelerator vs CloudFront verwenden?**

- CloudFront: Statischer und zwischengespeicherter Inhalt, CDN-Anwendungsfall
- Global Accelerator: Dynamischer Inhalt, Nicht-HTTP-Protokolle (UDP, Gaming, IoT) oder wenn Sie eine statische Anycast-IP-Adresse benötigen

## Stärken und Schwächen

**Site-to-Site VPN**:

- Schnelle Einrichtung, geringe Kosten
- Öffentlicher Internetpfad bedeutet variable Latenz
- Begrenzter Bandbreiten-Decker

**Direct Connect**:

- Konsistente, private, hochbandbreitige Verbindung
- Langsame Einrichtung, erhebliche wiederkehrende Kosten
- Ein physischer Schaltkreis stellt einen einzelnen Ausfallpunkt dar (fügen Sie Redundanz hinzu)

**Transit Gateway**:

- Vereinfacht die VPC-Verbindungen dramatisch
- Transitives Routing (im Gegensatz zum VPC-Peering)
- Die Kosten können sich bei vielen Anhängen summieren

**VPC Endpoints**:

- Sicherheits- und Kostenvorteile für S3/DynamoDB (kostenlose Gateway-Endpoints)
- Eliminiert NAT Gateway-Kosten für AWS-Diensterverkehr

**Global Accelerator**:

- Verbessert die dynamische Anwendlungs-Latenz für globale Benutzer
- Feste Anycast-IP-Adressen (im Gegensatz zu CloudFronts dynamischen IP-Adressen)
- Zusätzliche Kosten (0,025 USD/Stunde pro Accelerator + Datenübertragung)

## Zusammenfassung

- **Site-to-Site VPN**: Verschlüsselte Tunnel über das öffentliche Internet zwischen On-Premises und VPC. Schnelle Einrichtung, geringere Kosten, variable Latenz.
- **Direct Connect**: Private, dedizierte Glasfaserverbindung zu AWS. Vorhersagbare Latenz, höhere Bandbreite, Wochen für die Einrichtung, erhebliche Kosten.
- **Transit Gateway**: Hub für VPC- und On-Premises-Verbindungen. Ermöglicht transitives Routing. Skaliert auf Hunderte von Verbindungen.
- **VPC Endpoints**: Privater Zugriff auf AWS-Dienste ohne NAT Gateway. Gateway-Endpoints (S3, DynamoDB) sind kostenlos.
- **Global Accelerator**: Routet dynamischen Traffic über das AWS Backbone für geringere, konsistentere Latenz global.

## Examenstipps

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.4)*

- **VPN vs. Direct Connect Signale:** VPN = „verschlüsselt den Datenverkehr zu einem VPC“, „schnelle Einrichtung“, „kostenbewusst“. Direct Connect = „konsistente niedrige Latenz“, „große Datenübertragungen“, „privater Verbindungslink“, „Compliance-Anforderungen für ein privates Netzwerk“.
- **Transit Gateway vs. VPC Peering:** Peering ist nicht transitiv (A→B→C erlaubt keine A→C). Transit Gateway ist transitiv. „Viele VPCs, die miteinander kommunizieren müssen“ → Transit Gateway.
- **VPC Gateway Endpoints:** Kostenlos. Nur S3 und DynamoDB. Route-Tabelle Änderung. Keine zusätzlichen Kosten. Prüfungs-Szenario: „Reduzierung der Datenübertragungskosten für den Zugriff auf S3 aus einem privaten Subnetz“ → Gateway Endpoint.
- **Global Accelerator vs. CloudFront:** Accelerator = dynamischer Inhalt, nicht-HTTP, statische IP-Adresse, Netzwerkoptimierung. CloudFront = Caching, HTTP-Inhalt, CDN.
- **Direct Connect + VPN:** Sie können ein VPN als Backup für eine Direct Connect-Verbindung verwenden. Wenn die Direct Connect-Schleife ausfällt, wird der Datenverkehr zum VPN umgeleitet. Teurer als ein VPN allein, zuverlässiger als eine Direct Connect-Verbindung allein.
- **Direct Connect Gateway:** Verbinden Sie eine Direct Connect-Schleife mit mehreren VPCs in mehreren Regionen oder Konten. Ohne dies verbindet sich eine Direct Connect-Schleife mit einem VGW in einer Region.

## Übungen

**Übung 1 — Erinnerung**

Erklären Sie den Unterschied zwischen AWS Site-to-Site VPN und AWS Direct Connect. In welchem Szenario würden Sie sich für jeden entscheiden?

*(Hinweis: Denken Sie über Aufbauzeit, Kosten, Latenzkonsistenz und Bandbreitenanforderungen nach.)*

**Übung 2 — Prüfungsübung**

*Szenario*: Ein Finanzdienstleistungsunternehmen benötigt eine private, verschlüsselte, dedizierte Netzwerkverbindung von seinem On-Premise-Datenzentrum zu AWS. Es werden täglich 500 GB sensible Finanzdaten übertragen. Die Verbindung muss eine konsistente, vorhersagbare Latenz aufweisen und darf nicht über das öffentliche Internet laufen. Außerdem benötigen sie eine Backup-Verbindung, falls die primäre ausfällt.

Welche Architektur erfüllt diese Anforderungen BEST?

A) Eine Site-to-Site VPN mit BGP-Routing und einer zweiten VPN für Redundanz
B) Eine Direct Connect-Verbindung mit einer Site-to-Site VPN als Backup
C) Zwei Site-to-Site VPN-Verbindungen über verschiedene Internetanbieter
D) Eine Direct Connect Hosted Connection mit Direct Connect Gateway

*(Hinweis: „Darf nicht über das öffentliche Internet laufen“ – VPN-Datenverkehr läuft über das öffentliche Internet (verschlüsselt). Nur Direct Connect ist privat.*

*(Hinweis 2: „Konsistente, vorhersagbare Latenz“ – VPN-Leistung über das öffentliche Internet variiert. Direct Connect ist konsistent.*

*(Hinweis 3: „Backup-Verbindung“ – Was ist der empfohlene Ansatz, wenn Direct Connect die primäre ist?*

**Antwort:** B

**Erklärung:** Direct Connect bietet eine private, dedizierte Verbindung, die nicht über das öffentliche Internet läuft – erfüllt die Datenschutz- und Latenzanforderungen. Eine Site-to-Site VPN als Backup bietet Redundanz: Wenn die Direct Connect-Schleife ausfällt, wird der Datenverkehr zum verschlüsselten VPN umgeleitet. Dies ist das Standard-HA-Muster für Direct Connect.

**Warum nicht A?** VPN-Datenverkehr läuft über das öffentliche Internet, was die Anforderung „darf nicht über das öffentliche Internet laufen“ verletzt.

**Warum nicht C?** Zwei VPN-Verbindungen über verschiedene ISPs laufen immer noch über das öffentliche Internet, auch wenn sie verschlüsselt sind. Erfüllt nicht die Anforderung eines privaten Netzwerks.

**Warum nicht D?** Eine Hosted Connection bietet eine Direct Connect-Verbindung, aber Option D enthält kein Backup. Eine einzelne Direct Connect-Verbindung ohne Backup ist ein Single Point of Failure – die Glasfaser kann durchtrennt werden.

*SAA-C03 Domain: Design High-Performing Architectures — Task 3.4*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nimbus plant, regionale Engineering-Teams in Seattle, Berlin und Singapur zu haben. Jedes regionale Team benötigt Zugriff auf:

- Den Produktions-VPC (nur lesbar für Debugging)
- Den Staging-VPC (voller Zugriff zum Testen)
- Den Analytik-VPC (nur lesbar für Berichte)

Entwerfen Sie die Netzwerkverbindung. Würden Sie ein Transit Gateway verwenden? Direct Connect in jeder Region oder Site-to-Site VPN? Wie können Sie den schreibgeschützten Zugriff für die Produktion erzwingen? (Hinweis: Dies ist sowohl eine Netzwerk- als auch eine IAM-Frage.)

*(Es gibt keine eindeutige richtige Antwort. Das Ziel ist es, das Netzwerkdesign für mehrere Regionen und Teams zu üben.)*

## Post-Credits-Szene

Die Datensynchronisation dauerte 14 Stunden.

Nicht über den langsamen öffentlichen Internetpfad – Leo hatte AWS Snow Family (physische Speichergeräte, die an und von AWS versandt) für den Großteil der Daten verwendet und dann die verbleibende Delta-Synchronisation über das VPN durchgeführt.

„Nächstes Mal“, sagte er, „sollten wir ein Direct Connect einrichten.“

Tom schaute die Preise an.

„Ein dedizierter 1-Gbps-Port kostet 216 USD pro Monat“, sagte er. „Plus der Anschluss von unserem Büro, der von einem Telekommunikationsanbieter mit 800 USD pro Monat angeboten wird.“

„Also etwa 1000 USD pro Monat insgesamt.“

„Für das, was wir jetzt tun, wahrscheinlich nicht lohnenswert. Aber wenn wir mehr als 10 TB pro Monat zwischen unserem Büro und AWS verschieben, würden die Datenübertragungskosten von Direct Connect die Kosten kompensieren.“

„Also überwachen wir das Datenübertragungsvolumen und prüfen es, wenn es den Schwellenwert überschreitet.“

„Das ist Cost-Aware Architecture“, sagte Tom.

„Das war immer der Punkt“, sagte Maya.

In der nächsten Episode: Was passiert, wenn Sie mehr Daten haben, als jede Datenbank vernünftig speichern kann, und Sie diese alle verstehen müssen.
