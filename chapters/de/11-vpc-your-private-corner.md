# Kapitel 11: Euer Privater Winkel in der Cloud

Priya hatte ein Blatt Papier mit einer Zeichnung darauf.

Es war keine komplizierte Zeichnung. Ein Rechteck, beschriftet "AWS". Innerhalb des Rechtecks eine Ansammlung von Kisten: EC2-Instanzen, eine RDS-Datenbank, ein ElastiCache-Cluster. Linien, die alles mit allem anderen verbanden. Und außerhalb des Rechtecks eine einzelne Beschriftung: "Internet".

Sie stellte es in die Mitte des Tisches.

"Das ist, was wir haben", sagte sie. "Unsere Datenbank hat eine öffentliche IP-Adresse. Unsere Cache-Schicht kann von dem Internet aus erreichbar sein. Unsere EC2-Instanzen befinden sich alle auf demselben flachen Netzwerk."

"Das scheint in Ordnung", sagte Leo. "Wir haben Sicherheitsgruppen."

"Sicherheitsgruppen, die du konfiguriert hast", sagte Priya. "Über Nacht. Während der anfänglichen Einrichtung."

Leo sagte nichts.

"Ich kritisiere die Konfiguration nicht", sagte sie. "Ich sage nur, dass, wenn alles auf einem flachen öffentlichen Netzwerk lebt, eine einzige Fehlkonfiguration der Unterschied zwischen einem funktionierenden System und einem ist, das von jedem auf dem Internet zugänglich ist."

Sie nahm einen roten Marker und zeichnete einen Kreis um die Datenbank.

"Das sollte nicht von dem Internet aus erreichbar sein. Unter keinen Umständen. Nicht über eine Sicherheitsgruppenregel, nicht über eine gehärtete Konfiguration. Es sollte strukturell unerreichbar sein."

"Wir müssen über Netzwerkarchitektur sprechen", sagte Maya.

"Wir mussten darüber sprechen, vor drei Monaten", sagte Priya. "Aber jetzt ist es in Ordnung."

Das Team versammelte sich zum ersten Mal in Wochen um eine Whiteboard.

**Das Problem mit der Offenen Parkfläche**

Stellen Sie sich eine riesige öffentliche Parkgarage vor. Zehntausende Autos. Jeder kann irgendwo parken. Es gibt keine Barrieren zwischen den Zonen, keine Tore, keine reservierten Abschnitte.

Dies ist ein offenes Netzwerk. Jeder Dienst kann mit jedem anderen Dienst kommunizieren. Ihr Webserver kann mit Ihrer Datenbank kommunizieren. Ihre Datenbank kann mit dem Internet kommunizieren. Ihre Caching-Schicht kann Verbindungen von überall empfangen.

Wenn alles miteinander kommunizieren kann, hat ein einziger Kompromiss Auswirkungen auf alles.

"Also, wenn jemand in die Parkgarage einbricht", sagte Tom, "kann er in jedes Auto gehen."

"Und von jedem Auto aus kann er irgendwohin fahren", bestätigte Priya. "Wir brauchen Zäune. Wir brauchen gesperrte Tore. Wir brauchen Zonen."

Die VPC ist, wie Sie diese Zonen in AWS aufbauen.

**Was ist eine VPC?**

Eine **Virtual Private Cloud (VPC)** ist ein logisch isolierter Abschnitt der AWS Cloud – ein privates Netzwerk, das Sie definieren, das standardmäßig nur von Ihren Ressourcen erreichbar ist.

Denken Sie daran wie einen eingezäunten privaten Hof innerhalb der riesigen öffentlichen Parkgarage. Ihr Hof hat seine eigenen Regeln: Wer darf eintreten, wer darf auslaufen, welche Routen zwischen den Abschnitten bestehen.

Wenn Sie eine VPC erstellen, definieren Sie:

**Einen CIDR-Block:** Der Bereich der verfügbaren IP-Adressen innerhalb Ihres Netzwerks. Beispielsweise gibt `10.0.0.0/16` Ihnen 65.536 mögliche IP-Adressen (10.0.0.0 bis 10.0.255.255).

**Subnetze:** Unterteilungen Ihres VPC, die jeweils einen Teil Ihres IP-Adressbereichs zugewiesen und mit einer bestimmten Availability Zone verknüpft sind.

**Routen-Tabellen:** Regeln, die bestimmen, wohin Netzwerkverkehr geleitet wird.

**Internet Gateway:** Die Verbindung zwischen Ihrer VPC und dem öffentlichen Internet.

**Subnetze: Öffentlich vs. Privat**

Nicht alle Ressourcen sollten öffentlich zugänglich sein.

Ihr Webserver muss Traffic vom Internet akzeptieren – Browser der Benutzer müssen darauf zugreifen.

Ihre Datenbank sollte *niemals* Traffic vom Internet akzeptieren – nur Ihr Webserver sollte mit ihr kommunizieren können.

Dies ist der Punkt, an dem Subnetze ins Spiel kommen.

Ein **öffentliches Subnetz** ist mit einem Internet Gateway verbunden und kann Ressourcen mit öffentlichen IP-Adressen haben. Traffic kann zu und von dem Internet fließen.

Ein **privates Subnetz** hat keine direkte Internetverbindung. Ressourcen in einem privaten Subnetz können nur mit anderen Ressourcen in Ihrer VPC kommunizieren (es sei denn, Sie richten spezifische ausgehende Routen ein). Sie haben keine öffentlichen IP-Adressen.

Für Nimbus wurde das Design klar:

```
Internet
    |
Internet Gateway
    |
Public Subnet (AZ-a)     Public Subnet (AZ-b)
  [Load Balancer]          [Load Balancer]
    |                          |
Private Subnet (AZ-a)    Private Subnet (AZ-b)
  [EC2 Instances]           [EC2 Instances]
    |                          |
Private Subnet (AZ-a)    Private Subnet (AZ-b)
  [RDS Primary]             [RDS Standby]
  [ElastiCache]             [ElastiCache]
```

```markdown
Der Loadbalancer ist öffentlich zugänglich – er muss Traffic von Internet empfangen. Die EC2-Instanzen sind privat – sie empfangen Traffic nur vom Loadbalancer. Die Datenbanken sind privat – sie empfangen Traffic nur von den EC2-Instanzen.

„Also, um zur Datenbank zu gelangen“, sagte Tom, „müsste jemand durch den Loadbalancer, dann durch die EC2-Instanz und dann durch die Datenbank-Sicherheitsgruppe?“

„Drei Schichten“, bestätigte Priya. „Tiefe Verteidigung.“

**Der NAT Gateway: Private Subnetze, die trotzdem Dinge herunterladen können**

Private Subnetze können nicht direkt mit dem Internet kommunizieren. Aber manchmal brauchen sie das. Ihre EC2-Instanz muss ein Software-Update herunterladen. Ihre Anwendung muss eine externe API aufrufen.

Hier kommt der **NAT Gateway** (Network Address Translation) ins Spiel.

Ein NAT Gateway befindet sich in einem öffentlichen Subnetz. Ressourcen in privaten Subnetzen können Outbound-Traffic an den NAT Gateway senden, der es an das Internet weiterleitet – aber das Internet kann keine Verbindungen zurück initiieren.

Es ist wie eine Einbahnstraße. Du kannst rausgehen. Niemand von außen kann hinein.

„Wie viel kostet ein NAT Gateway?“, fragte Tom.

Die Frage überraschte niemanden.

Die NAT Gateway-Preise bestehen aus einer stündlichen Gebühr für jedes NAT Gateway sowie einer Gebühr pro GB an Datenverarbeitung. Das kann unerwartet hoch werden (Kapitel 30 behandelt dies im Detail). Für den Moment: Verwenden Sie nicht mehr NAT Gateways, als Sie benötigen, und seien Sie sich bewusst, dass große Mengen an Outbound-Daten auf Ihrer Rechnung erscheinen werden.

**Route-Tabellen: Wie Traffic seinen Weg findet**

Jedes Subnetz hat eine **Route-Tabelle**, die Traffic dorthin leitet, wo er hin muss.

Eine typische Route-Tabelle für ein öffentliches Subnetz sieht so aus:

| Ziel | Ziel                               |
|-------|------------------------------------|
| 10.0.0.0/16 | local                             |
| 0.0.0.0/0   | igw-xxxx (Internet Gateway)       |

Die erste Regel: Traffic zu jeder IP-Adresse in Ihrem VPC-Bereich bleibt lokal. Die zweite Regel: Alle anderen Traffic (`0.0.0.0/0` bedeutet „alles“) geht an den Internet Gateway.

Eine Route-Tabelle für ein privates Subnetz:

| Ziel | Ziel                 |
|-------|------------------------|
| 10.0.0.0/16 | local                  |
| 0.0.0.0/0   | nat-xxxx (NAT Gateway) |

Privates Subnet-Traffic bleibt lokal oder verlässt das Netzwerk über den NAT Gateway. Keine direkte Route zum Internet Gateway.

**Sicherheitsgruppen vs. NACLs (Vorschau)**

Innerhalb des VPC haben Sie zwei Werkzeuge zur Steuerung des Traffics auf Ressourcenebene:

**Sicherheitsgruppen** (Kapitel 15 behandelt dies ausführlich) wirken als virtuelle Firewalls für einzelne Ressourcen – eine EC2-Instanz, eine RDS-Instanz, ein Loadbalancer. Sie sind *zustandsbehaftet*: Wenn Traffic hineingelassen wird, wird der Antwort-Traffic automatisch herausgelassen.

**Netzwerk-ACLs (NACLs)** operieren auf Subnetzebene und sind *zustandslos*: Sie müssen sowohl den eingehenden als auch den ausgehenden Traffic separat zulassen.

Für die meisten Anwendungsfälle sind Sicherheitsgruppen ausreichend. NACLs bieten eine zusätzliche Schicht, wenn Sie Subnetzebene-Kontrollen benötigen – beispielsweise, um einen bestimmten IP-Adressbereich niemals von der Annäherung an ein Subnetz abzuhalten.

„Sicherheitsgruppen auf Instansechen-Ebene“, schrieb Leo auf das Whiteboard. „NACLs auf Subnetzebene.“

„Und niemals Port 22 für 0.0.0.0/0 offen lassen“, fügte Priya hinzu, als sie Leo ansah.

„Das war einmal“, sagte Leo.

„Es ist immer genau einmal“, sagte Priya, „bis es nicht mehr ist.“

**VPC Peering: Verbinden privater Netzwerke**

Was passiert, wenn Nimbus zu mehreren VPCs wächst? (Das passiert. Teams werden groß. Dienste werden in separate Konten isoliert.)

**VPC Peering** ermöglicht es zwei VPCs, privat miteinander zu kommunizieren, als wären sie sich im selben Netzwerk. Der Traffic verlässt das AWS-Private-Network nicht.

Wichtige Einschränkungen:

- VPC Peering ist nicht transitiv. Wenn VPC A mit VPC B und VPC B mit VPC C verbunden ist, können A und C nicht miteinander kommunizieren – es sei denn, Sie fügen eine direkte A-C-Verbindung hinzu.
- CIDR-Blöcke dürfen sich zwischen verbundenen VPCs nicht überschneiden.

Für größere Architekturen mit vielen VPCs wird **AWS Transit Gateway** (Kapitel 25) verwendet, um transitive Routing ohne ein vollständiges Mesh von Peering-Verbindungen zu handhaben.

## Stärken und Schwächen

**Warum VPC-Design wichtig ist**:

- Netzwerkisolation ist eine Tiefe Verteidigung – ein Durchbruch in einer Schicht bedeutet nicht, dass alles kompromittiert wird
- Private Subnetze reduzieren die Angriffsfläche erheblich
- Route-Tabellen und Sicherheitsgruppen ermöglichen eine präzise Steuerung der Traffic-Flüsse
- VPCs integrieren sich mit allen AWS-Netzwerkdiensten (Direct Connect, VPN, Transit Gateway)

**Wo es kompliziert wird**:

- VPC-Design erfordert eine Vorabplanung – CIDR-Blöcke sind später schwer zu ändern
- Zu viele kleine VPCs erzeugen Peering-Komplexität (n-squared-Problem)
- Die Fehlersuche bei Netzwerkproblemen in VPCs erfordert das Verständnis von Route-Tabellen, Sicherheitsgruppen, NACLs und Subnet-Zuordnungen gleichzeitig
- NAT Gateway-Kosten können bei großem Maßstab überraschend hoch sein (Gebühren pro GB an Datenverarbeitung)

## Zusammenfassung
```

- Eine **VPC** ist ein logisch isoliertes privates Netzwerk in AWS – Ihr abgesperrter Bereich innerhalb der öffentlichen Cloud.
- **Subnetze** teilen Ihre VPC in Availability Zones. Öffentliche Subnetze verbinden sich mit dem Internet Gateway; private Subnetze tun dies nicht.
- Platzieren Sie internet-orientierte Ressourcen (Load Balancer) in öffentlichen Subnetzen. Legen Sie alles andere (EC2, Datenbanken, Caches) in privaten Subnetzen ab.
- **Routing-Tabellen** steuern den Datenverkehrsfluss. Jedes Subnetz hat eine.
- **NAT Gateway** (in einem öffentlichen Subnetz) ermöglicht es privaten Ressourcen, ohne eingehenden Datenverkehr zu akzeptieren, Internet-Verbindungen zu initiieren.
- **VPC Peering** verbindet zwei VPCs privat. Nicht transitiv – für eine groß angelegte Konnektivität verwenden Sie Transit Gateway.
- **Sicherheitsgruppen** schützen einzelne Ressourcen (zustandsbehaftet). **NACLs** schützen ganze Subnetze (zustandslos).

## Examenstipps

*SAA-C03 Domäne: Gestaltung sicherer Architekturen (Domäne 1, Aufgabe 1.2)*

- **Öffentlich vs. privates Subnetz**: Der Unterschied liegt in der Routing-Tabelle. Ein öffentliches Subnetz hat eine Route zum Internet Gateway. Ein privates Subnetz hat dies nicht.
- **NAT Gateway-Platzierung**: Immer im *öffentlichen* Subnetz. Private Subnetz-Ressourcen leiten den ausgehenden Datenverkehr über es.
- **Hohe Verfügbarkeit für NAT**: Erstellen Sie einen NAT Gateway pro AZ. Wenn Sie einen NAT Gateway in AZ-a und AZ-b Instanzen über es routen, führt ein Ausfall von AZ-a auch den Internetzugang von AZ-b zum Absturz.
- **VPC Peering ist nicht transitiv**: Die Prüfung beschreibt drei VPCs und fragt, ob sie über die mittlere kommunizieren können – die Antwort ist nein, ohne direkte Peering oder Transit Gateway.
- **CIDR-Überlappung**: Peer-VPCs dürfen keine überlappenden CIDR-Blöcke haben. Klassischer Prüfungsfalle.
- **Bastion Host (Jump Box)**: Um eine private EC2-Instanz über SSH zu erreichen, benötigen Sie einen Bastion Host im öffentlichen Subnetz. Der Bastion ist die einzige Maschine mit einer öffentlichen IP-Adresse; private Instanzen akzeptieren SSH nur vom Sicherheitssatz des Bastion Hosts.
- **VPC Endpunkte**: Ermöglichen Sie privaten Ressourcen, auf AWS-Dienste (S3, DynamoDB) zuzugreifen, ohne über einen NAT Gateway zu gehen. Es gibt zwei Typen: **Gateway-Endpunkte** (S3, DynamoDB – kostenlos) und **Schnittstellen-Endpunkte** (andere Dienste – pro Stunde plus Daten).

## Übungen

**Übung 1 – Erinnerung**

Warum sollte eine Datenbank in einem privaten Subnetz liegen? Welbe Gefährdung mindert dies?

*(Hinweis: Was kann jemand mit einer Datenbank tun, die sich im öffentlichen Internet befindet, was er nicht tun kann, wenn sie nur innerhalb des VPC zugänglich ist?)*

**Übung 2 – Examen-Übung**

*Szenario*: Ein Unternehmen entwirft eine Webanwendung mit drei Schichten in AWS. Die Web-Schicht (ALB + EC2) muss Internetverkehr akzeptieren. Die Anwendungsschicht (EC2) muss nur Traffic von der Web-Schicht empfangen. Die Datenbank-Schicht (RDS) muss nur Traffic von der Anwendungsschicht empfangen. Die Anwendungsschicht EC2-Instanzen müssen Softwarepakete von Internet herunterladen. Die Lösung muss hochverfügbar sein.

Welche Architektur erfüllt diese Anforderungen BEST?

A) Alle Schichten in öffentlichen Subnetzen; Sicherheitssätze regeln den Datenverkehr zwischen den Schichten
B) Die Web-Schicht in öffentlichen Subnetzen; die App- und Datenbank-Schichten in privaten Subnetzen; ein NAT Gateway in einem öffentlichen Subnetz
C) Die Web-Schicht in öffentlichen Subnetzen; die App- und Datenbank-Schichten in privaten Subnetzen; ein NAT Gateway pro AZ
D) Alle Schichten in privaten Subnetzen; ein Internet Gateway stellt bidirektionalen Internetzugriff für alle Schichten bereit

**Hinweis 1**: "Hochverfügbar" bedeutet kein einzelner Ausfallpunkt. Welche Option führt einen NAT Gateway als einzelnen Ausfallpunkt ein?

**Hinweis 2**: Wenn der AZ des NAT Gateways ausfällt, welche Instanzen verlieren den Internetzugang?

**Hinweis 3**: Lesen Sie die Anforderung sorgfältig – die Anwendungsschicht benötigt *ausgehenden* Internetzugriff, nicht eingehenden.

**Antwort**: C

**Erläuterung**: Die Web-Schicht in öffentlichen Subnetzen stellt Internetzugang über das ALB bereit. Die App- und Datenbank-Schichten in privaten Subnetzen stellen sicher, dass sie nicht direkt vom Internet erreichbar sind. Ein NAT Gateway pro AZ (eines in jeder öffentlichen Subnetz) bietet einen hochverfügbaren ausgehenden Internetzugriff für private-Subnetz-Instanzen – wenn eine AZ ausfällt, setzt das andere AZs NAT Gateway den Datenverkehr fort.

**Warum nicht A?** Öffentliche Subnetze für alle Schichten stellen die Anwendung und die Datenbank direkt dem Internet zur Verfügung, was den Zweck des gestuften Sicherheitsmodells zunichte macht.

**Warum nicht B?** Ein NAT Gateway in einem einzelnen AZ ist ein einzelner Ausfallpunkt. Wenn die AZs NAT Gateway ausfällt, verlieren alle privaten Instanzen den ausgehenden Internetzugriff.

**Warum nicht D?** Ein Internet Gateway stellt bidirektionalen Zugriff bereit – private Subnetze mit einer Route zum Internet Gateway sind effektiv öffentliche Subnetze.

*SAA-C03 Domäne: Gestaltung sicherer Architekturen – Aufgabe 1.2*

**Übung 3 – Architektur-Herausforderung** *(Optional)*

Nimbus wächst. Das Engineering-Team möchte den "Menü-Dienst" in ein eigenes Konto mit seinem eigenen VPC verlagern, während die Haupt-Nimbus-Anwendung in einem separaten Konto und VPC verbleibt.

Wie würden Sie diese beiden VPCs so verbinden, dass die Hauptanwendung den Menü-Dienst abfragen kann? Welche Einschränkungen müssten Sie berücksichtigen? Was würden Sie verwenden, wenn Nimbus zehn separate Microservice-VPCs hätte, die alle miteinander kommunizieren müssten?

*(Es gibt keine einzelne korrekte Antwort. Das Ziel ist es, die Netzwerkarchitektur für mehrere VPCs zu üben.)*

## Post-Credits-Szene

Priya hat das Netzwerk neu gestaltet.

Drei Tage später befand sich jede Ressource an ihrem vorgesehenen Ort. EC2-Instanzen in privaten Subnetzen. Load Balancer in öffentlichen Subnetzen. RDS und ElastiCache waren nur von der Anwendungsschicht zugänglich. Sicherheitsgruppen mit den minimal erforderlichen Ports.

Leo hatte versucht, direkt in die Datenbank einzuschalten, um etwas zu überprüfen. Das ging nicht. Die Verbindung war zeitweise.

"Gut", sagte Priya.

"Ich musste nur eine Sache überprüfen", sagte Leo.

"Was?"

"Ob der Index korrekt eingerichtet war."

Priya öffnete ihren Laptop. "Ich kann dies vom Bastion Host über die Anwendungsinstance überprüfen, welche die korrekten Datenbank-Anmeldeinformationen in Secrets Manager hat."

"Das sind vier Hops."

"Das ist richtig." Sie tippte etwas. "Index ist eingerichtet. Gern geschehen."

Leo betrachtete den Bildschirm einen Moment lang.

"Ich werde das lernen", sagte er.

"Du lernst es schon", sagte sie. "Du hast sich stattdessen über Sicherheitskontrollen beschwert, anstatt zu beschweren, dass sie nicht existieren."

Im nächsten Kapitel: Wie das Internet Nimbus findet – die unsichtbare Maschinerie von Domainnamen.
