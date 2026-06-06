# Kapitel 25: Die private Autobahn

Stehen Sie einen Moment auf. Schütteln Sie Ihre Hände aus.

Spüren Sie die Distanz zwischen Ihren Fingerspitzen und etwas auf der anderen Seite des Landes. Stellen Sie sich vor, eine Nachricht zu senden, die diese Distanz zurücklegen, ihren Weg durch ein Dutzend Carrier-Übergaben finden und zurückkommen muss, bevor Sie weiterarbeiten können. Stellen Sie sich nun vor, das tausende Male pro Sekunde zu tun.

Das ist es, was Datenübertragung tatsächlich ist – physische Distanz, physische Infrastruktur, physische Beschränkungen.

Wir werden über das Verschieben von Daten sprechen. Nicht zwischen Diensten in AWS, sondern zwischen der realen Welt und AWS – zwischen Ihrem Büro und Ihrer Cloud-Infrastruktur, zwischen Kontinenten.

---

Mit der skalierten Datenbank und den reduzierten Speicherkosten hatte sich Tom der Netzwerkrechnung zugewandt. Aber Leo hatte ein dringenderes Problem – das Verschieben von 4 Terabyte historischer Bestelldaten zu AWS legte die Grenzen ihrer aktuellen Verbindung offen.

---

Nimbus' Infrastrukturteam (jetzt vier Ingenieure) arbeitete aus einem gemeinsamen Büro in Seattle. Sie brauchten Zugriff auf die AWS-Infrastruktur, die sie verwalteten. Einige Operationen erforderten die Verbindung zu Ressourcen in der VPC.

Derzeit verwendeten sie ein VPN auf ihren Laptops, um auf den Bastion-Host im öffentlichen Subnetz zuzugreifen, und dann SSH zu Ressourcen von dort aus.

Es funktionierte. Es war langsam. Die VPN-Verbindung wurde über das öffentliche Internet geroutet: Seattle → mehrere Carrier-Hops → us-west-2. Die Hin- und Rückwege waren inkonsistent – 30 bis 80 Millisekunden, je nach Uhrzeit – und der Durchsatz war durch den Büro-Uplink und den öffentlichen Pfad begrenzt.

„Für den täglichen SSH-Zugriff ist das akzeptabel“, sagte Leo. „Aber wir sind dabei, unsere Analyse-Datenbank zu verschieben. 4 Terabyte historischer Bestelldaten. Über diese Verbindung wird die Migration Wochen dauern.“

„Wir brauchen eine bessere Verbindung“, sagte Maya.

„Eine private Verbindung“, fügte Priya hinzu. „Nicht über das öffentliche Internet. Und was, wenn jemand während der Datenübertragung einzubrechen versucht? 4 TB Bestellhistorie über das öffentliche Internet – selbst verschlüsselt – fühlt sich wie ein Ziel an.“

Stellen Sie es sich wie den Arbeitsweg vor. Ein Site-to-Site VPN ist wie das Fahren auf öffentlichen Straßen: Sie verriegeln Ihre Autotüren (Verschlüsselung), teilen sich aber trotzdem die Spuren mit allen anderen, und Staus verlangsamen Sie unvorhersehbar. Direct Connect ist wie das Mieten einer dedizierten privaten Spur auf der Autobahn – kein geteilter Verkehr, konstante Geschwindigkeit und eine höhere monatliche Maut. An den meisten Tagen ist die öffentliche Straße in Ordnung. Wenn Sie einen Lkw voller wertvoller Fracht zu einem engen Zeitplan transportieren, zahlen Sie für die private Spur.

Snow Family ist die Option, die die meisten Leute nicht in Betracht ziehen: das Chartern eines echten Frachtflugs. Sie ist nicht immer verfügbar. Sie ist nicht richtig für kleine Ladungen. Aber für einen vollen Lkw kommt sie schneller an als das Fahren und hängt überhaupt nicht von den Autobahnbedingungen ab. Die Physik hat sich nicht geändert – Sie verschieben immer noch dieselben Bits –, aber der Mechanismus ist grundlegend anders.

**AWS Site-to-Site VPN: Die schnelle Option**

**AWS Site-to-Site VPN** erstellt einen verschlüsselten Tunnel zwischen Ihrem On-Premises-Netzwerk und Ihrer VPC, der das öffentliche Internet durchquert.

Einrichtung:

1. Ein Virtual Private Gateway (VGW) erstellen, das an Ihre VPC angehängt ist
2. Ein Customer Gateway erstellen, das Ihren On-Premises-Router repräsentiert
3. Zwei VPN-Tunnel (zur Redundanz) zwischen ihnen aufbauen

Der Traffic ist verschlüsselt (AES-256). Er reist über das öffentliche Internet, was bedeutet, dass die Latenz von den Internetbedingungen abhängt. AWS stellt automatisch zwei Tunnel zur Redundanz bereit – wenn ein Tunnel Probleme hat, verlagert sich der Traffic zum anderen.

**Wann man Site-to-Site VPN verwendet**:

- Schnelle Einrichtung (Minuten bis Stunden)
- Kosteneffektiv (0,05 $/Stunde pro VPN-Verbindung)
- Bandbreite: bis zu 1,25 Gbps pro Tunnel
- Akzeptable Internetlatenz für den Anwendungsfall

**Accelerated Site-to-Site VPN** routet VPN-Traffic über AWS' globales Netzwerk statt über das öffentliche Internet – dieselbe Optimierung, die Global Accelerator bietet, angewendet auf VPN-Tunnel. Die Latenz ist niedriger und konsistenter als bei Standard-VPN. Die Kosten sind etwas höher (Global-Accelerator-Datentransfergebühren fallen an). Für Teams, die VPNs schnelle Einrichtung und niedrigere Kosten wollen, aber bessere Latenz brauchen, ist Accelerated VPN der praktische Mittelweg zwischen Standard-VPN und Direct Connect.

Für Nimbus' 4-TB-Migration würde internetbasiertes VPN bei maximal 1,25 Gbps dauern: 4 TB / 1,25 Gbps ≈ 7 Stunden minimum, mit realem Overhead eher 12–20 Stunden. Akzeptabel, aber Überlastung auf dem öffentlichen Internetpfad macht es unvorhersehbar.

Leo rechnete sorgfältiger nach, denn die theoretische Berechnung und die tatsächliche Übertragungszeit hatten in seiner Erfahrung nicht ein einziges Mal übereingestimmt.

**Theoretisch**: 4 TB = 4.096 GB = 32.768 Gb. Bei 1 Gbps: 32.768 Sekunden ≈ 9,1 Stunden. Auf 9 Stunden gerundet.

**Tatsächlich**: Leo hatte in der Vorwoche eine Testübertragung durchgeführt – 50 GB vom Seattle-Büro nach S3. Theoretische Zeit bei ihrer gemessenen Upstream-Geschwindigkeit (875 Mbps): 457 Sekunden. Tatsächliche Zeit: 724 Sekunden. Overhead-Faktor: 1,58.

Angewendet auf die 4-TB-Übertragung bei 875 Mbps Upstream: 32.768 Gb / 0,875 Gbps × 1,58 Overhead ≈ **59.200 Sekunden ≈ 16,4 Stunden**.

Der Overhead kam aus mehreren Quellen: TCP-Slow-Start beim Verbindungsaufbau, Paketverlust, der erneute Übertragung erfordert (der öffentliche Pfad von Seattle nach us-west-2 hatte durchschnittlich 0,2 % Paketverlust – klein, aber multiplikativ über Millionen von Paketen), HTTPS-Handshake-Overhead für jedes Multipart-Upload-Segment und die Verarbeitungszeit für S3, um Multipart-Uploads zusammenzusetzen.

„Sechzehn Stunden sind für eine einmalige Migration in Ordnung“, sagte Leo. „Das eigentliche Problem ist, wenn die Übertragung bei Stunde 14 unterbrochen wird.“

S3-Multipart-Upload löst das Unterbrechungsproblem: Wenn die Übertragung bei Stunde 14 fehlschlägt, muss nur der aktuelle Teil erneut hochgeladen werden. Die vorherigen Teile sind in S3 gespeichert und die Übertragung kann fortgesetzt werden. Aber der Overhead der Verwaltung von Multipart-Uploads fügte der Gesamtübertragungszeit etwa 3 % hinzu.

Die endgültige reale Schätzung: **etwa 9 Stunden theoretisch über 1-Gbps-Internet, etwa 17 Stunden tatsächlich** – unter Berücksichtigung der gemessenen 875-Mbps-Upstream-Geschwindigkeit ihres Büros, des Paketverlust-Overheads und der Multipart-Upload-Verarbeitung.

Leo überlegte einen Moment. Dann sah er sich die Snow-Family-Preisseite an.

„Was ist die andere Option?“ fragte Tom.

„Moment – aber *warum* sollten wir mehr als ein VPN brauchen?“ fragte Maya. „Die 4-TB-Migration ist ein einmaliges Ereignis.“

„Ist sie nicht“, sagte Priya. „Sobald die Daten in AWS sind, muss das Team weiterhin täglich darauf zugreifen. Und die VPN-Latenz summiert sich.“

**AWS Direct Connect: Die dedizierte Leitung**

**AWS Direct Connect** stellt eine dedizierte, private Netzwerkverbindung zwischen Ihrem Standort (oder Ihrer Colocation-Anlage) und AWS her. Der Traffic berührt nie das öffentliche Internet.

Direct Connect ist eine physische Verbindung – eine Glasfaserleitung von Ihrem Netzwerk zu einem AWS-Direct-Connect-Standort. Sie arbeiten mit einem Telekommunikationsanbieter zusammen, um den physischen Kreislauf herzustellen. AWS stellt den Port auf seiner Seite bereit.

**Vorteile**:

- Konsistente, vorhersehbare Latenz (keine Schwankungen des öffentlichen Internets)
- Geschwindigkeiten von 50 Mbps bis 100 Gbps (mit nativen 400-Gbps-dedizierten-Ports an ausgewählten Standorten seit 2024)
- Niedrigere Datentransferkosten als das Internet (Direct-Connect-Datentransferraten sind günstiger als Standard-AWS-Datentransfer-out-Raten)
- Sicherer (privater Kreislauf, nicht öffentliches Internet)

**Kompromisse**:

- Die Einrichtung dauert Wochen bis Monate (Bereitstellung physischer Infrastruktur)
- Deutlich höhere Kosten als VPN
- Keine eingebaute Redundanz (Sie richten redundante Kreisläufe selbst ein)
- Nicht geeignet für geografisch verteilte Büros ohne mehrere Kreisläufe

Sie fragen sich vielleicht: Wenn Direct Connect ein physisches Glasfaserkabel ist, was passiert, wenn jemand es versehentlich durchschneidet? Das ist das Single-Point-of-Failure-Problem bei einem einzelnen Kreislauf – weshalb Produktions-Direct-Connect-Setups redundante Kreisläufe auf geografisch getrennten Pfaden verwenden oder ein VPN als Backup aufrechterhalten. Das Kabel kann durchtrennt werden; das Geschäft läuft weiter.

„Wie viel kostet das pro Monat?“ fragte Tom. Er hatte es bereits nachgeschlagen. „Ein dedizierter 1-Gbps-Port kostet 216 $/Monat“, sagte er. „Plus den Kreislauf von unserem Büro, den eine Telekommunikationsfirma mit 800 $/Monat veranschlagt hat.“

„Also insgesamt etwa tausend im Monat.“

Für Nimbus: Direct Connect war für ihre aktuelle Größe übertrieben. Aber für Unternehmen mit erheblichen Datentransfervolumina oder Compliance-Anforderungen für private Netzwerkverbindungen amortisiert sich Direct Connect.

**Hosted Connections: Der Mittelweg**

Nicht jede Organisation kann sich auf einen dedizierten 100-Gbps-Glasfaserkreislauf festlegen. **Direct Connect Hosted Connections** erlauben es AWS-Direct-Connect-Partnern (zugelassenen Telekommunikationsanbietern), Sub-1-Gbps-Verbindungen bereitzustellen, die Sie mit anderen Kunden teilen.

Die Einrichtung ist schneller (Tage bis Wochen, nicht Monate) und kostet weniger als eine dedizierte Verbindung. Der Kompromiss: geteilte Kapazität bedeutet weniger konsistenten Durchsatz.

Für Nimbus (im Wachstum): Eine gehostete 500-Mbps-Verbindung über einen Partner würde private Konnektivität zu einem vernünftigen Preispunkt bieten.

Der praktische Unterschied, der zur Prüfungszeit zählt: Hosted Connections sind in Geschwindigkeiten von 50 Mbps bis 10 Gbps verfügbar (einige Partner bieten bis zu 25 Gbps an), bereitgestellt von einem AWS-Partner. Dedizierte Verbindungen gehen direkt zu AWS und sind mit 1 Gbps, 10 Gbps und 100 Gbps verfügbar (plus 400 Gbps an ausgewählten Standorten). Für Geschwindigkeiten unter 1 Gbps ist eine Hosted Connection die einzige Direct-Connect-Option – dedizierte Verbindungen beginnen bei mindestens 1 Gbps.

**AWS Transit Gateway: Hub-and-Spoke für VPCs**

Als Nimbus wuchs, würden sie mehrere VPCs ansammeln: die Produktions-VPC, die Staging-VPC, die Analyse-VPC, die Sicherheitstooling-VPC.

Ohne sorgfältige Planung erfordert das Verbinden dieser VPCs ein vollständiges Mesh aus VPC-Peering-Verbindungen. Für 4 VPCs: 6 Peering-Verbindungen. Für 10 VPCs: 45 Peering-Verbindungen. Für 20 VPCs: 190 Verbindungen. Das skaliert nicht.

**AWS Transit Gateway** ist ein Netzwerk-Hub, der mehrere VPCs und On-Premises-Netzwerke verbindet. Statt eines Mesh aus Peering-Verbindungen verbindet sich jede VPC mit dem Transit Gateway. Das Transit Gateway routet den Traffic zwischen ihnen.

```
On-premises ──── Direct Connect ──┐
                                  │
Production VPC ───────────────── Transit Gateway
Staging VPC ──────────────────── Transit Gateway
Analytics VPC ────────────────── Transit Gateway
Security VPC ─────────────────── Transit Gateway
```

**Transitives Routing**: Wenn VPC A und VPC B beide mit dem Transit Gateway verbunden sind, können sie kommunizieren – ohne direktes Peering. Das Transit Gateway handhabt das Routing. Anders als VPC-Peering (das nicht transitiv ist) ermöglicht das Transit Gateway eine Hub-and-Spoke-Topologie.

**Transit-Gateway-Kosten**: berechnet pro Attachment (VPC oder VPN-/Direct-Connect-Verbindung) plus pro verarbeitetem GB Daten. Bei Skalierung ist das die Einfachheit wert.

Für Nimbus war das auslösende Ereignis für das Transit Gateway das Hinzufügen einer vierten VPC. Sie hatten: Produktion, Staging, Analyse und nun Sicherheitstooling (eine VPC für Schwachstellenscans und SOC2-Compliance-Überwachung, die nicht im selben Netzwerksegment wie die Produktion sein sollte).

Ohne Transit Gateway erfordert das Verbinden von vier VPCs sechs Peering-Verbindungen:
- Produktion ↔ Staging
- Produktion ↔ Analyse
- Produktion ↔ Sicherheit
- Staging ↔ Analyse
- Staging ↔ Sicherheit
- Analyse ↔ Sicherheit

Sechs Peering-Verbindungen, sechs Routingtabelleneinträge pro VPC, sechs Sicherheitsgruppenregeln zu überprüfen. Und VPC-Peering ist nicht-transitiv: Wenn Produktion und Analyse gepeert sind und Analyse und Sicherheit gepeert sind, kann Produktion Sicherheit nicht über die Analyse-VPC erreichen. Sie brauchen das Peering Produktion ↔ Sicherheit explizit.

Mit Transit Gateway:

```
Production VPC  ──┐
Staging VPC     ──┤──── Transit Gateway ────── On-premises (Direct Connect)
Analytics VPC   ──┤
Security VPC    ──┘
```

Vier Attachments. Eine zu verwaltende Routingtabelle. Transitives Routing: Produktion kann Sicherheit über das Transit Gateway erreichen, ohne ein direktes Peering.

„Und was, wenn jemand über das Transit Gateway einzubrechen versucht?“ fragte Priya. „Wenn alle vier VPCs sich ein Transit Gateway teilen, könnte eine kompromittierte Ressource in der Staging-VPC die Produktion erreichen.“

Das Transit Gateway unterstützt **Routingtabellen mit Isolierung**: Sie können definieren, welche VPCs über das Transit Gateway kommunizieren dürfen und welche isoliert sind. Die Sicherheitstooling-VPC kann alle anderen erreichen (sie muss sie scannen). Staging kann die Produktion nicht erreichen. Produktion kann die Analyse nicht direkt erreichen (Analyse fragt Daten über einen bestimmten Read-only-Endpunkt ab).

„Ein Transit Gateway“, sagte Priya, „mit Routing-Richtlinien, die das tatsächliche Zugriffsmodell ausdrücken. Gegenüber sechs Peering-Verbindungen ohne zentralisierte Möglichkeit zu prüfen, was was erreicht.“

**VPC Endpoints: Privater Zugriff auf AWS-Dienste**

Ein subtiles Kosten- und Sicherheitsproblem: Wenn Ihre EC2-Instanz (in einem privaten Subnetz) die S3-API aufruft, wird dieser Traffic durch das NAT Gateway geroutet (um das Internet zu erreichen, wo sich der öffentliche Endpunkt von S3 befindet). Sie zahlen für die NAT-Gateway-Verarbeitung.

**VPC Endpoints** erlauben Ressourcen in Ihrer VPC, privat mit AWS-Diensten zu kommunizieren, ohne über das öffentliche Internet zu gehen – und ohne NAT Gateway.

Zwei Typen:

**Gateway Endpoints** (kostenlos): Für S3 und DynamoDB. Sie fügen eine Route in Ihrer Routingtabelle hinzu, die S3- oder DynamoDB-Traffic an den Endpunkt statt an das NAT Gateway leitet. Kostenlos zu erstellen; kostenlos zu nutzen.

**Interface Endpoints** (kostenpflichtig): Für andere AWS-Dienste (SQS, SNS, Secrets Manager, SSM usw.). Erstellt eine ENI (Elastic Network Interface) in Ihrem Subnetz mit einer privaten IP. Traffic zum Dienst verwendet diese private IP. Kostet ~0,01 $/Stunde pro AZ plus Datenverarbeitung.

Leo hatte die Gateway Endpoints in der Vorwoche bereits erstellt, ohne die Routingtabellen zu aktualisieren. „Ich habe es schon deployed – oh“, sagte er und überprüfte die Konfiguration. „Die Routen wurden nicht aktualisiert. Lass mich das beheben.“

Tom erstellte sofort Gateway Endpoints für S3 und DynamoDB, nachdem er erfahren hatte, dass sie kostenlos waren. Die NAT-Gateway-Datenverarbeitungsgebühr sank um 65 %.

Die Rechnung dahinter: Nimbus' Lambda-Funktionen und ECS-Tasks in privaten Subnetzen stellten ständig Anfragen an S3 (Lesen von Konfigurationsdateien, Schreiben von Log-Exporten) und an DynamoDB (Lesen von Restaurantdaten, Schreiben von Bestelldatensätzen). Jede Anfrage wurde durch das NAT Gateway geroutet, das 0,045 $ pro GB verarbeiteter Daten berechnete.

Nimbus' monatliche NAT-Gateway-Datenverarbeitung: 533 GB. Kosten: 24 $/Monat. Nach dem Hinzufügen von S3- und DynamoDB-Gateway-Endpoints und dem Aktualisieren der Routingtabellen: Der S3- und DynamoDB-Traffic umging das NAT Gateway vollständig. Die monatliche NAT-Gateway-Verarbeitung sank auf 187 GB – der verbleibende Traffic waren API-Aufrufe an andere Dienste (Secrets Manager, SES, externe Webhooks). Kosten: 8,40 $/Monat.

Einsparungen: 15,60 $/Monat, 187 $/Jahr, für zwei kostenlose Gateway-Endpoint-Konfigurationen, deren Einrichtung 10 Minuten dauerte.

„Kostenlos“, sagte Tom, zum dritten Mal.

„Gateway Endpoints sind kostenlos zu erstellen und kostenlos zu nutzen“, bestätigte Leo. „Sie sind nicht nur eine Sicherheitsverbesserung – das Routen von S3- und DynamoDB-Traffic über einen privaten Endpunkt statt über das NAT Gateway entfernt ihn vollständig aus dem öffentlichen Internet.“

„Und was, wenn jemand über den NAT-Gateway-Traffic einzubrechen versucht?“ fragte Priya. „Wenn Traffic zu S3 durch NAT geht, ist er aus dem Internet adressierbar. Über Gateway Endpoint ist er privat.“

Das ist der sekundäre Nutzen von Gateway Endpoints, den die Kostendiskussion manchmal überschattet. Traffic zu S3 und DynamoDB über einen VPC-Gateway-Endpoint verlässt nie das AWS-Netzwerk, durchquert nie eine öffentliche IP-Adresse und wird durch die Endpoint-Richtlinie geregelt (eine ressourcenbasierte Richtlinie, die einschränken kann, auf welche S3-Buckets oder DynamoDB-Tabellen der Endpunkt zugreifen kann). Ein Gateway Endpoint auf einem Bucket, der Kundendaten speichert, fügt eine zusätzliche Schicht hinzu: Selbst bei einer falsch konfigurierten Bucket-Richtlinie kann die Endpoint-Richtlinie den Zugriff auf Traffic beschränken, der aus der spezifischen VPC stammt.

**AWS Global Accelerator: Routing am Edge**

Als Nimbus Ostküstennutzer von us-west-2 (Oregon) aus bediente, betrug die Latenz 80 ms. Nicht weil der Server prohibitiv weit entfernt war, sondern weil das öffentliche Internet-Routing zwischen Boston und Oregon suboptimal war und durch mehrere Carrier-Netzwerke hüpfte.

**AWS Global Accelerator** verwendet AWS' privates globales Backbone – ein verteiltes Netzwerk von Edge-Standorten, die Traffic zu Ihrer Anwendung über AWS-kontrollierte Pfade statt über öffentliche Internet-Carrier-Hops routen. Statt öffentlichem Internet-Routing tritt der Traffic am nächstgelegenen Edge-Standort in das AWS-Netzwerk ein und reist über den optimierten privaten Pfad zu Ihrer Anwendung.

Für Nimbus würde ein Nutzer in Boston:

- **Ohne Global Accelerator**: über öffentliche Internet-Carrier routen → ~80 ms
- **Mit Global Accelerator**: den nächstgelegenen AWS-Edge in Boston treffen → über das AWS-Backbone reisen → us-west-2 erreichen → ~60 ms

Global Accelerator cached keine Inhalte (das ist CloudFront). Es optimiert den Netzwerkpfad für dynamische Anfragen.

Leo führte nach der Aktivierung von Global Accelerator für die Nimbus-API einen Latenzvergleich über mehrere Städte durch:

| Stadt | Vorher | Nachher | Verbesserung |
|------|--------|-------|-------------|
| Seattle, WA | 12 ms | 11 ms | 8 % |
| Los Angeles, CA | 28 ms | 22 ms | 21 % |
| Chicago, IL | 55 ms | 40 ms | 27 % |
| New York, NY | 82 ms | 61 ms | 26 % |
| London, UK | 145 ms | 112 ms | 23 % |
| Tokio, Japan | 180 ms | 95 ms | 47 % |
| Sydney, Australien | 210 ms | 118 ms | 44 % |

Die Verbesserung war für geografisch entfernte Nutzer am dramatischsten – Tokio von 180 ms auf 95 ms, Sydney von 210 ms auf 118 ms. Für Seattle (nahe den us-west-2-Rechenzentren in Oregon) war die Verbesserung kleiner – es gab weniger öffentliche Internet-Hops zu optimieren.

„Moment – aber *warum* bekommt Tokio eine Verbesserung von 47 %?“ fragte Maya. „Wenn das Rechenzentrum immer noch in us-west-2 ist, ist nicht die Lichtgeschwindigkeit die tatsächliche Beschränkung?“

„Die Lichtgeschwindigkeit ist die Untergrenze“, sagte Leo. „Die tatsächliche Beschränkung ist das öffentliche Internet-Routing. Traffic von Tokio nach us-west-2 durchquert Dutzende autonomer Systeme – verschiedene Carrier, verschiedene Router, verschiedene Peering-Vereinbarungen. Jeder Hop fügt Latenz hinzu. Global Accelerator routet den Traffic vom Tokio-Edge-Standort nach us-west-2 über AWS' private Glasfaser, die kürzere Pfade und besser abgestimmtes Routing hat.“

Das theoretische Minimum von Tokio nach us-west-2 (basierend auf Lichtgeschwindigkeit über Glasfaser, etwa 15.500 km Hin- und Rückweg): ~77 ms. Die 95 ms mit Global Accelerator nähern sich diesem theoretischen Minimum. Die 180 ms ohne es spiegeln die Ineffizienz des öffentlichen Internet-Routings wider, nicht die Gesetze der Physik.

Global Accelerator stellt zwei statische **Anycast-IP-Adressen** bereit, die zum nächstgelegenen Edge-Standort routen. Anders als CloudFront (das dynamische IP-Adressen verwendet, die sich ändern) sind diese IPs stabil – nützlich für Firewall-Allowlisting und für Anwendungen, die eine feste IP für Clients zum Verbinden benötigen.

**Wann man Global Accelerator vs. CloudFront verwendet**:

- CloudFront: statische und cachebare Inhalte, CDN-Anwendungsfall
- Global Accelerator: dynamische Inhalte, Nicht-HTTP-Protokolle (UDP, Gaming, IoT) oder wenn Sie eine statische Anycast-IP-Adresse brauchen

## Daten verschieben, nicht nur Traffic: DataSync und Transfer Family

Während die Netzwerkarchitektur Gestalt annahm, landeten bei Maya gleichzeitig drei neue Onboarding-Projekte für Restaurantketten. Jedes hatte eine Datenmigrationsanforderung – und jede Anforderung war anders.

Die erste Kette, Pacific Table, musste 40 TB NFS-Dateifreigaben nach S3 verschieben. Ihr aktueller Dateispeicher war On-Premises, verteilt über vier Dateiserver in ihrem Hauptsitz in Seattle. Leo begann, einen Migrationsplan zu schreiben.

Die zweite Kette, Marisol Group, hatte ein Buchhaltungsteam, das täglich Rechnungen auf einen lokalen SFTP-Server hochlud. Der SFTP-Workflow lief seit 2015. Das Buchhaltungspersonal wusste eines: Sie öffneten jeden Morgen um 9 Uhr ihren SFTP-Client, luden ihre Rechnungen ab und schlossen ihn. Niemand wollte das ändern. „Ihre Buchhalter verwenden WinSCP“, sagte Maya. „Das ist nicht verhandelbar.“

„Das sind zwei verschiedene Werkzeuge“, sagte Priya.

„Ja“, sagte Leo. „Aber beide existieren.“

**AWS DataSync: rsync auf Steroiden, mit einer AWS-Konsole**

Für Pacific Tables 40-TB-Migration war die Herausforderung nicht die Bandbreite – das Seattle-Büro hatte eine solide Upstream-Verbindung. Die Herausforderung war die Orchestrierung: herauszufinden, welche Dateien existierten, sie zuverlässig zu übertragen, Prüfsummen zu verifizieren, die Übertragung so zu planen, dass das Büronetzwerk während der Geschäftszeiten nicht gesättigt wird, und den Fortschritt über mehrere Tage kontinuierlichen Betriebs zu überwachen.

**AWS DataSync** ist ein agentenbasierter Datenmigrations- und -replikationsdienst. Sie installieren einen leichtgewichtigen DataSync-Agenten in Ihrer On-Premises-Umgebung – eine virtuelle Maschine, die auf VMware oder als EC2-Instanz läuft. Der Agent verbindet sich mit Ihren Dateiservern über NFS oder SMB, entdeckt Ihre Freigaben und synchronisiert sie zu einem Ziel in AWS: einem S3-Bucket, einem EFS-Dateisystem oder einem FSx-Dateisystem.

Stellen Sie es sich als rsync auf Steroiden mit einer AWS-Konsole vor. DataSync handhabt:

- **Discovery**: Der Agent inventarisiert Ihre Quellfreigaben automatisch
- **Scheduling**: Übertragungen können nach einem definierten Zeitplan (außerhalb der Geschäftszeiten) oder kontinuierlich laufen
- **Verifizierung**: DataSync berechnet Prüfsummen an beiden Enden und alarmiert Sie bei jeglichen Inkonsistenzen
- **Monitoring**: Übertragungsfortschritt, Dateianzahlen, Fehlerberichte und Bandbreitenauslastung sind alle in der Konsole sichtbar
- **Verschlüsselung im Transit**: Alle Daten werden während der Übertragung mit TLS verschlüsselt

Für Pacific Table installierte Leo den DataSync-Agenten auf einer VM in ihrem Seattle-Netzwerk, richtete ihn auf die vier NFS-Freigaben und konfigurierte einen Übertragungszeitplan: 20 Uhr bis 6 Uhr werktags, kontinuierlich an Wochenenden. Nach sechs Tagen waren alle 40 TB in S3 gelandet. Er verifizierte die Übertragung mit DataSyncs eingebautem Prüfsummenbericht. Null Abweichungen.

„Und für die laufende Replikation?“ fragte Maya. „Pacific Table wird auch nach der Migration weiterhin Dateien hinzufügen.“

„DataSync unterstützt inkrementelle Übertragungen“, sagte Leo. „Nach der ersten Synchronisierung kopiert es nur, was sich geändert hat. Wir können es nächtlich als Replikationsjob laufen lassen.“

**AWS Transfer Family: Ihr SFTP-Workflow, gestützt auf S3**

Für Marisol Groups Buchhaltungsteam war die Anforderung anders. Niemand wollte von SFTP weg. Die Buchhalter würden weiterhin WinSCP verwenden. Die Frage war: Wohin landen diese SFTP-Uploads?

Derzeit landeten sie auf einem lokalen Linux-Server im Marisol-Backoffice. Die Dateien wurden dann manuell in ihr Buchhaltungssystem verschoben. Der lokale Server erforderte Wartung, Backups und jemanden mit SSH-Zugriff, um ihn zu verwalten.

**AWS Transfer Family** ist ein vollständig verwalteter SFTP-, FTPS- und FTP-Server – gestützt auf S3 oder EFS als Speicherziel. Sie stellen einen Transfer-Family-Endpunkt bereit (er bekommt einen Hostnamen und optional eine statische IP-Adresse). Ihre Clients verbinden sich damit über ihre vorhandene SFTP-Software. Wenn sie Dateien hochladen, landen diese Dateien direkt in einem S3-Bucket.

Das Buchhaltungsteam ändert nichts. Es öffnet weiterhin jeden Morgen um 9 Uhr WinSCP. Es verbindet sich weiterhin mit einem SFTP-Server mit seinen vorhandenen Anmeldedaten. Es legt weiterhin seine Rechnungen im selben Ordner ab. Der Unterschied ist für sie unsichtbar: Auf der Serverseite gehen die Dateien nun direkt in S3 statt auf einen lokalen Linux-Server.

„Und von S3 aus können wir den Rest des Workflows automatisch auslösen“, sagte Priya. „Ein S3-Ereignis löst eine Lambda-Funktion aus, die die Rechnung verarbeitet und in das Buchhaltungssystem einfügt. Kein manueller Schritt.“

„Der Workflow der Buchhalter ändert sich also nicht“, sagte Maya, „aber auf unserer Seite ist das Ganze automatisiert.“

„Ja. Und der SFTP-Server selbst ist vollständig verwaltet – kein Patching, keine Backups, kein zu wartender Server.“

Tom hatte die Preisgestaltung bereits nachgeschlagen. Transfer Family berechnet pro Stunde Endpunkt-Verfügbarkeit plus pro übertragenem GB. Für Marisol Groups Rechnungsvolumen lagen die monatlichen Kosten deutlich unter 30 $. Die Kosten für die Wartung des lokalen Servers, den es ersetzte – Hardware-Abschreibung, Ingenieurszeit für die Wartung, Backup-Verwaltung – waren erheblich höher.

---

> **Examenstipp — DataSync und Transfer Family**
>
> *SAA-C03-Domäne: Entwurf leistungsstarker Architekturen (Domäne 3, Aufgabe 3.1)*
>
> - **DataSync** = Daten in großem Umfang von On-Premises zu AWS verschieben (NFS- oder SMB-Dateifreigaben → S3, EFS oder FSx). Die Examenssignale: „Dateifreigaben migrieren“, „NFS-Daten nach S3 replizieren“, „On-Premises-zu-AWS-Datentransfer“, „laufende Replikation von Dateidaten“. DataSync verwendet einen On-Premises installierten Agenten; der Agent handhabt Discovery, Scheduling und Verifizierung.
> - **Transfer Family** = laufende Dateiübertragung über SFTP-, FTPS- oder FTP-Protokolle, ohne Client-Tools zu ändern. Die Examenssignale: „bestehender SFTP-Workflow“, „Partner laden Dateien über SFTP hoch“, „SFTP-Server gestützt auf S3“, „Lift-and-shift-SFTP“, „der Dateiübertragungsprozess kann nicht geändert werden“. Transfer Family ist die Antwort, wenn die Anforderung SFTP-Kompatibilität ist, nicht das Datenvolumen.
> - **Der Unterschied ist wichtig**: DataSync ist für Massenmigration und -replikation (agentenbasiert, zeitplangesteuert, netzwerkoptimiert). Transfer Family ist für protokollkompatible Dateiübertragungsdienste (endpunktbasiert, immer an, client-transparent). Sie lösen unterschiedliche Probleme.
> - DataSync unterstützt S3, EFS und FSx als Ziele. Transfer Family unterstützt S3 und EFS als Speicher-Backends.

---

**Server migrieren, nicht nur Dateien: Die 7 Rs und MGN**

Die dritte Kette in Mayas Pipeline hatte nicht nur Dateien – sie hatte ganze Server: eine maßgeschneiderte Reservierungsanwendung, die auf zwei On-Premises-Maschinen lief, die niemand vor dem Umzug neu schreiben wollte. Das Verschieben von *Anwendungen* ist eine eigene Disziplin, und AWS beschreibt **sieben Wege zur Migration** (die „7 Rs“), die Sie meist nur erkennen müssen:

- **Rehost** („Lift and Shift“): Server so verschieben, wie sie sind. Am schnellsten, geringste Änderung.
- **Replatform** („Lift, Tinker, and Shift“): kleine Verbesserungen unterwegs – wie das Verschieben einer selbstverwalteten Datenbank zu RDS.
- **Repurchase**: das alte System fallen lassen, stattdessen SaaS kaufen.
- **Refactor**: cloud-nativ neu gestalten. Größter Aufwand, größter Nutzen.
- **Retire**: stellt sich heraus, niemand hat es benutzt. Löschen.
- **Retain**: vorerst dort lassen, wo es ist.
- **Relocate**: auf Hypervisor-Ebene verschieben, ohne etwas zu ändern.

Für den Rehost-Fall ist das Werkzeug **AWS Application Migration Service (MGN)**: Ein Agent repliziert die Festplatten der Quellserver Block für Block in einen kostengünstigen Staging-Bereich in AWS; Sie starten Testkopien, wann immer Sie wollen; beim Cutover wandelt MGN die replizierten Server in native EC2-Instanzen um. Lift, Shift, fertig – Refactoring kann später kommen, in Cloud-Zeit. (Seine Begleiter für die Portfolioplanung, Application Discovery Service und Migration Hub, schlossen sich Ende 2025 für Neukunden – kennen Sie ihre Namen als „Inventar-Discovery“ und „zentrale Migrationsverfolgung“, falls die Prüfung sie erwähnt.)

---

**AWS Snow Family: Die physische Option**

Es gab immer noch die Sache mit dem 4-TB-Historiendatensatz und der 17-Stunden-Internet-Schätzung. Nach der Berechnung hatte Leo sich die Snow-Family-Preisseite angesehen und die Entscheidung sofort getroffen.

Für Migrationen über ein paar Terabyte, bei denen Zeit mehr zählt als Einfachheit, versendet AWS physische Speichergeräte an Ihren Standort. Sie füllen sie mit Daten. Sie schicken sie zurück. AWS nimmt die Daten direkt in S3 auf.

**Snowball Edge Storage Optimized**: 80 TB nutzbare Kapazität, gehärtetes Gehäuse. Versand an Ihren Standort in 2–5 Werktagen. Sie laden Daten über die lokale Schnittstelle (NFS, S3-Schnittstelle). Sie schicken es zurück. AWS nimmt die Daten etwa 1–3 Werktage nach Erhalt auf.

Für Nimbus' 4-TB-Migration der Prozess:

1. **Bestellen** Sie eine Snowball Edge über die AWS-Konsole (dauert 2 Minuten, versendet in 3 Tagen)
2. **Verbinden** Sie das Gerät mit dem Netzwerk des Seattle-Büros; es präsentiert sich als NFS-Mount-Punkt
3. **Kopieren** Sie die 4 TB historischer Bestelldaten über die S3-kompatible Schnittstelle des Geräts: `aws s3 cp /data/orders s3://nimbus-data/ --endpoint-url http://192.168.1.100:8080 --profile snowballEdge`
4. **Das Kopieren schließt** in etwa 2 Stunden ab (lokales Netzwerk, kein Internet)
5. **Versenden** Sie das Gerät zurück an AWS (frankiertes Etikett inklusive)
6. AWS **nimmt** die Daten innerhalb von 72 Stunden nach Erhalt in S3 auf
7. **Verifizieren** – S3 stellt einen Job-Abschlussbericht bereit, der jede übertragene Datei und Prüfsumme zeigt

Gesamtdauer: 3 Tage für die Lieferung + 2 Stunden zum Kopieren + 1 Tag Versand + 2 Tage Aufnahme = etwa 7 Kalendertage. Gegenüber etwa 17 Stunden kontinuierlich – was eine stabile, ununterbrochene Internetverbindung erfordert hätte, die den Büro-Uplink über Nacht und durch den Großteil eines Geschäftstages sättigt.

Kosten: Die Snowball-Edge-Gerätemiete beträgt 300 $ für 10 Tage. Versand (in beide Richtungen): etwa 80 $. Der S3-Datentransfer hinein ist kostenlos. Gesamte Migrationskosten: **380 $**.

Vergleichen Sie mit etwa 17 Stunden anhaltender 875-Mbps-Internetnutzung: Der VPN-Tunnel war kostenlos (0,05 $/Stunde, aber der Tunnel lief bereits); der S3-Transfer hinein war kostenlos. Der „kostenlose“ Internetpfad hatte echte Kosten in Ingenieurszeit (Überwachung einer 17-Stunden-Übertragung), Risiko (jede Unterbrechung erfordert Neustart) und Opportunitätskosten (ihre Internetverbindung war während des Übertragungsfensters gesättigt). Leo gab die Bestellung auf. Wie es sich entwickelte, steht in der Post-Credits-Szene dieses Kapitels.

---

## Stärken und Grenzen

**Site-to-Site VPN**:

- Schnelle Einrichtung, niedrige Kosten
- Der öffentliche Internetpfad bedeutet variable Latenz
- Begrenzte Bandbreitenobergrenze (1,25 Gbps pro Tunnel)
- Accelerated-VPN-Option verbessert die Latenz zu etwas höheren Kosten

**Direct Connect**:

- Konsistent, privat, hohe Bandbreite
- Langsam einzurichten, erhebliche wiederkehrende Kosten
- Physischer Kreislauf ist ein Single Point of Failure (Redundanz hinzufügen oder VPN-Backup aufrechterhalten)
- Break-even mit Egress-Kosteneinsparungen bei etwa 10–15 TB/Monat, je nach Preisszenario

**AWS Snow Family**:

- Für einmalige Migrationen über 1–2 TB oft schneller und günstiger als Netzwerkübertragung
- Kein Internetbandbreitenverbrauch während der Migration
- 10-Tage-Gerätemietfenster; frankierter Versand

**Transit Gateway**:

- Vereinfacht die Multi-VPC-Konnektivität dramatisch
- Transitives Routing (anders als VPC-Peering)
- Isolierungs-Routingtabellen erlauben Segmentierung ohne separate Peering-Verbindungen
- Die Kosten summieren sich bei vielen Attachments

**VPC Endpoints**:

- Sicherheits- und Kostenvorteil für S3/DynamoDB (kostenlose Gateway Endpoints)
- Beseitigt NAT-Gateway-Kosten für AWS-Dienst-Traffic
- Endpoint-Richtlinien fügen eine zusätzliche Zugriffskontrollschicht über IAM und Bucket-Richtlinien hinaus hinzu
- Interface Endpoints für andere Dienste (Secrets Manager, SSM, SES) halten den Traffic privat, kosten aber ~0,01 $/Stunde pro AZ

**Global Accelerator**:

- Verbessert die Latenz dynamischer Anwendungen für globale Nutzer: in der Praxis 33–47 % Verbesserung für entfernte Nutzer
- Feste Anycast-IPs (anders als CloudFronts dynamische IPs) – nützlich für Firewall-Allowlisting
- Nicht-HTTP-Protokolle (UDP, TCP) – CloudFront ist nur HTTP/HTTPS
- Zusätzliche Kosten (0,025 $/Stunde pro Accelerator + Datentransfer)

## Zusammenfassung

Die Aurora-Arbeit in Kapitel 24 optimierte, wie Nimbus Daten an seine eigene Anwendung liefert. In diesem Kapitel geht es darum, wie Daten zwischen der Außenwelt und AWS bewegt werden – und wie man diese Bewegung zuverlässiger, schneller und günstiger macht.

- **Site-to-Site VPN**: Verschlüsselter Tunnel über das öffentliche Internet zwischen On-Premises und VPC. Schnelle Einrichtung, niedrigere Kosten, variable Latenz. Zwei Tunnel zur Redundanz. Maximal 1,25 Gbps pro Tunnel.
- **Direct Connect**: Private, dedizierte Glasfaserverbindung zu AWS. Vorhersehbare Latenz, höhere Bandbreite, Wochen zur Einrichtung, erhebliche Kosten. Break-even mit VPNs Egress-Einsparungen bei etwa 13,5 TB/Monat für Nimbus' Preisszenario.
- **AWS Snow Family**: Physische Speichergeräte für Massendatenmigration. Schneller als Internetübertragung für Multi-TB-Migrationen. 380 $ gesamt für Nimbus' 4-TB-Migration gegenüber etwa 17 Stunden Netzwerksättigung.
- **Transit Gateway**: Hub für VPC- und On-Premises-Konnektivität. Ermöglicht transitives Routing (anders als VPC-Peering). Unterstützt Isolierungs-Routingtabellen, um zu steuern, welche VPCs welche erreichen können. Skaliert auf Hunderte von Verbindungen.
- **VPC Endpoints**: Privater Zugriff auf AWS-Dienste ohne NAT Gateway. Gateway Endpoints (S3, DynamoDB) sind kostenlos – fügen Sie sie jeder VPC hinzu, die auf S3 oder DynamoDB zugreift. Sparten Nimbus 15,60 $/Monat und entfernten S3-/DynamoDB-Traffic vom NAT Gateway.
- **Global Accelerator**: Routet dynamischen Traffic über das private AWS-Backbone für niedrigere, konsistentere Latenz weltweit. Statische Anycast-IPs. Latenzverbesserungen von 33–47 % für entfernte Nutzer (Tokio: 180 ms → 95 ms; Sydney: 210 ms → 118 ms). Kein CDN – cached nicht.
- **AWS DataSync**: Agentenbasierter Dienst zum Migrieren und Replizieren von On-Premises-NFS-/SMB-Dateidaten zu S3, EFS oder FSx. Handhabt Scheduling, Prüfsummenverifizierung, Monitoring. Wird für einmalige Migrationen und laufende Replikation von Dateifreigaben verwendet.
- **AWS Transfer Family**: Verwalteter SFTP-, FTPS- und FTP-Server, gestützt auf S3 oder EFS. Erlaubt vorhandenen SFTP-Clients, Dateien nach S3 hochzuladen, ohne ihren Workflow zu ändern.

## Prüfungstipps

*SAA-C03-Domäne: Entwurf leistungsstarker Architekturen (Domäne 3, Aufgabe 3.4)*

- **VPN- vs. Direct-Connect-Signale**: VPN = „Traffic zur VPC verschlüsseln“, „schnelle Einrichtung“, „kostensensibel“. Direct Connect = „konsistente niedrige Latenz“, „große Datentransfers“, „private Verbindung“, „Compliance, die ein privates Netzwerk erfordert“.
- **Transit Gateway vs. VPC-Peering**: Peering ist nicht-transitiv (A→B→C erlaubt nicht A→C). Transit Gateway ist transitiv. „Viele VPCs, die kommunizieren müssen“ → Transit Gateway.
- **VPC Gateway Endpoints**: Kostenlos. Nur S3 und DynamoDB. Routingtabellen-Änderung. Keine Zusatzkosten. Examensszenario: „Datentransferkosten für S3-Zugriff aus privatem Subnetz reduzieren“ → Gateway Endpoint.
- **Global Accelerator vs. CloudFront**: Accelerator = dynamischer Inhalt, Nicht-HTTP, statische IP, Netzwerkoptimierung. CloudFront = Caching, HTTP-Inhalt, CDN.
- **Direct Connect + VPN**: Sie können ein VPN als Backup für eine Direct-Connect-Verbindung verwenden. Wenn der Direct-Connect-Kreislauf ausfällt, fällt der Traffic auf das VPN zurück. Teurer als VPN allein, zuverlässiger als Direct Connect allein.
- **Direct Connect Gateway**: Einen Direct-Connect-Kreislauf mit mehreren VPCs über mehrere Regionen oder Konten verbinden. Ohne ihn verbindet sich ein Direct-Connect-Kreislauf mit einem VGW in einer Region.
- **AWS Snow Family**: „Große Datenmigration“, „Übertragungsgeschwindigkeit ist zu langsam“, „Migration im Petabyte-Maßstab“ → Snow Family. Snowball Edge = bis zu 80 TB. Machen Sie zuerst die Übertragungsrechnung: Wenn das Verschieben der Daten über das verfügbare Netzwerk etwa eine Woche oder länger dauern würde, ist die Antwort ein physisches Gerät. *Realitätscheck (2026)*: AWS hat die Familie ausgemustert – Snowmobile wurde 2024 zurückgezogen, Snowcone wurde Ende 2024 eingestellt, und seit November 2025 werden Snow-Geräte Neukunden nicht mehr angeboten (AWS verweist jetzt auf DataSync über schnelle Verbindungen und auf **Data Transfer Terminals**, sichere Standorte, an denen Sie Ihre eigenen Laufwerke mitbringen). Der SAA-C03-Fragenkatalog ist all dem vorausgegangen, also weist auf der Prüfung „Wochen Netzwerkübertragung, begrenzte Bandbreite“ immer noch auf Snowball hin.
- **Transit-Gateway-Routingtabellen**: Transit Gateway unterstützt mehrere Routingtabellen zur Netzwerksegmentierung. Examenssignal: „Produktions-VPC von Staging isolieren“ bei geteilter Konnektivität über das Transit Gateway → separate Routingtabellen.
- **Global-Accelerator-feste-IPs**: Anders als CloudFront stellt Global Accelerator zwei statische Anycast-IPs bereit. Examenssignal: „Anwendung braucht eine feste IP-Adresse, damit Clients sie allowlisten können“ oder „UDP-Traffic“ → Global Accelerator (CloudFront ist nur HTTP/HTTPS).
- **AWS-DataSync-Signale**: „NFS-/SMB-Dateifreigaben nach S3/EFS/FSx migrieren“, „laufende Replikation von On-Premises-Dateidaten“, „agentenbasierte Dateimigration“. DataSync ist nicht für protokollkompatible SFTP-Übertragung – es ist für Massendateifreigabe-Migration und -Replikation.
- **AWS-Transfer-Family-Signale**: „bestehender SFTP-Workflow“, „Partner oder Kunden laden Dateien über SFTP hoch“, „SFTP-Server in die Cloud heben, ohne Client-Tools zu ändern“, „SFTP/FTPS/FTP gestützt auf S3“. Transfer Family ist kein Datenmigrationstool – es ist ein verwalteter Protokoll-Endpunkt. Der Unterschied: DataSync verschiebt Daten in großem Umfang nach einem Zeitplan; Transfer Family stellt einen Always-on-SFTP-/FTP-Endpunkt für laufende Datei-Uploads bereit.
- **MGN (Application Migration Service)**: „Hunderte von VMs schnell migrieren, keine Codeänderungen“, „Server rehosten / Lift-and-shift zu EC2“ → MGN (Replikation auf Blockebene, Test-Starts, Cutover zu nativen EC2-Instanzen). DataSync verschiebt *Dateien*; DMS verschiebt *Datenbanken*; MGN verschiebt *ganze Server*.

## Übungen

**Übung 1 — Erinnerung**

Erklären Sie den Unterschied zwischen AWS Site-to-Site VPN und AWS Direct Connect. In welchem Szenario würden Sie jedes wählen?

*(Hinweis: Denken Sie an Einrichtungszeit, Kosten, Latenzkonsistenz und Bandbreitenanforderungen.)*

**Übung 2 — SAA-C03-Szenario**

*Szenario*: Ein Finanzdienstleistungsunternehmen benötigt eine private, verschlüsselte, dedizierte Netzwerkverbindung von seinem On-Premises-Rechenzentrum zu AWS. Es überträgt täglich 500 GB sensibler Finanzdaten. Die Verbindung muss eine konsistente, vorhersehbare Latenz haben und darf nicht das öffentliche Internet durchqueren. Es braucht außerdem eine Backup-Verbindung für den Fall, dass die primäre ausfällt.

Welche Architektur erfüllt diese Anforderungen am BESTEN?

A) Ein Site-to-Site VPN mit BGP-Routing und ein zweites VPN zur Redundanz  
B) Eine Direct Connect Hosted Connection mit Direct Connect Gateway  
C) Zwei Site-to-Site-VPN-Verbindungen über verschiedene Internetanbieter  
D) Eine Direct-Connect-Verbindung mit einem Site-to-Site VPN als Backup

**Hinweis 1**: „Darf nicht das öffentliche Internet durchqueren“ – VPN-Traffic geht über das öffentliche Internet (verschlüsselt). Nur Direct Connect ist privat.

**Hinweis 2**: „Konsistente, vorhersehbare Latenz“ – die VPN-Leistung über das öffentliche Internet variiert. Direct Connect ist konsistent.

**Hinweis 3**: „Backup-Verbindung“ – was ist der empfohlene Ansatz, wenn Direct Connect die primäre ist?

**Antwort**: D

**Erläuterung**: Direct Connect bietet eine private, dedizierte Verbindung, die nicht das öffentliche Internet durchquert – erfüllt die Datenschutz- und Latenzanforderungen. Ein Site-to-Site VPN als Backup bietet Redundanz: Wenn der Direct-Connect-Kreislauf ausfällt, fällt der Traffic auf das verschlüsselte VPN zurück. Das ist das Standard-HA-Muster für Direct Connect.

**Warum nicht A?** Site-to-Site-VPN-Traffic durchquert das öffentliche Internet, was die Anforderung „darf nicht das öffentliche Internet durchqueren“ verletzt.

**Warum nicht B?** Eine Hosted Connection bietet eine Direct-Connect-Verbindung, aber Option B enthält kein Backup. Einzelnes Direct Connect ohne Backup ist ein Single Point of Failure – die physische Glasfaser kann durchtrennt werden.

**Warum nicht C?** Zwei VPN-Verbindungen über verschiedene ISPs durchqueren immer noch das öffentliche Internet, selbst wenn verschlüsselt. Erfüllt die Anforderung an ein privates Netzwerk nicht.

*SAA-C03-Domäne: Entwurf leistungsstarker Architekturen — Aufgabe 3.4*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nimbus expandiert und hat nun regionale Engineering-Teams in Seattle, Berlin und Singapur. Jedes regionale Team braucht Zugriff auf:

- Die Produktions-VPC (nur lesend zum Debuggen)
- Die Staging-VPC (Vollzugriff zum Testen)
- Die Analyse-VPC (nur lesend für Reporting)

Entwerfen Sie die Netzwerkkonnektivität. Würden Sie Transit Gateway verwenden? Direct Connect in jeder Region oder Site-to-Site VPN? Wie würden Sie den Nur-Lese-Zugriff für die Produktion durchsetzen? (Hinweis: Das ist sowohl eine Netzwerk- als auch eine IAM-Frage.)

*(Es gibt keine einzige richtige Antwort. Das Ziel ist, Multi-Region-, Multi-Team-Netzwerkdesign zu üben.)*

**Erweiterung**: Das Berlin-Team berichtet, dass seine VPN-Latenz zur Produktions-VPC (us-west-2) durchschnittlich 160 ms beträgt. Bei welchem Datenvolumen würde Accelerated Site-to-Site VPN oder eine Direct Connect Hosted Connection die bessere Option werden? Recherchieren Sie die aktuelle Direct-Connect-Hosted-Connection-Preisgestaltung eines europäischen AWS-Partners. Würde die Latenzverbesserung allein die Kosten bei Ihrem geschätzten Datenvolumen rechtfertigen?

## Post-Credits-Szene

Die Datenmigration schloss in 8 Kalendertagen ab – 3 Tage für die Ankunft der Snowball Edge, 94 Minuten zum Kopieren der Daten, 4 Tage für AWS, um das Gerät zu empfangen und die Daten aufzunehmen, dann eine letzte Synchronisierung des Deltas, das sich angesammelt hatte, während die Snowball unterwegs war. Hands-on-Zeit für das Ganze: unter vier Stunden.

Dieser letzte Schritt war wichtig. Die Snowball Edge kopierte einen Point-in-time-Snapshot des 4-TB-Datensatzes. Während sie unterwegs war, hatte die Produktionsdatenbank weitergelaufen – neue Bestellungen wurden aufgegeben, neue Datensätze wurden erstellt. Das Delta-Sync über VPN waren 12 GB, abgeschlossen in 18 Minuten.

„Die Massenübertragung war die Snowball“, sagte Leo. „Das Sync waren nur die brandneuen Daten aus den 8 Tagen, die es gedauert hat.“

„Ich habe es schon deployed – oh“, sagte Leo und beobachtete, wie das Kopieren auf der Snowball Edge nach 94 Minuten abschloss. „Ich hätte die Bandbreitendrosselung beim lokalen Kopieren setzen sollen, um das Büronetzwerk während der Geschäftszeiten nicht zu sättigen.“

Er hatte die Drosselung nicht gesetzt. Das Büro-Internet war in Ordnung – die Snowball war eine lokale Netzwerkoperation. Aber der Netzwerk-Switch wurde kurz zu einem Engpass, als das Kopieren sich 9 Gbps lokalem Durchsatz näherte.

„Der Punkt“, sagte er, nachdem er die Drosselungseinstellung behoben hatte, „ist, dass physische Post oberhalb eines bestimmten Datenvolumens schneller ist als das Internet.“

„Das ist entweder offensichtlich oder kontraintuitiv“, sagte Maya, „je nachdem, wie man darüber denkt.“

„Nächstes Mal“, sagte Leo, „sollten wir ein Direct Connect einrichten.“

Tom griff nicht zum Taschenrechner – er hatte die Rechnung bereits früher gemacht, als Direct Connect zum ersten Mal aufkam: etwa tausend im Monat, Port plus Kreislauf.

„Für das, was wir jetzt tun, wahrscheinlich nicht wert. Aber wenn wir anfangen, mehr als 10 TB im Monat zwischen unserem Büro und AWS zu verschieben, würden die Datentransfereinsparungen bei Direct Connect die Kosten ausgleichen.“

„Wir überwachen also das Datentransfervolumen“, sagte Priya, „und überprüfen es erneut, wenn es die Schwelle überschreitet.“

„Das ist kostenbewusste Architektur“, sagte Tom.

„Das war schon immer der Punkt“, sagte Maya.

Priya hatte die Migration von der anderen Seite des Raums beobachtet. „Nächstes Mal, wenn wir so etwas machen“, sagte sie, „können wir es tun, bevor die Daten in der Produktion sind und das Geschäft davon abhängt? Live-Daten zu migrieren ist immer riskanter als ruhende Daten zu migrieren.“

„Es ist nie ruhend, wenn das Geschäft läuft“, sagte Leo.

„Ich weiß“, sagte sie. „Das ist der Punkt. Plane die Migration, bevor du sie brauchst. Nicht danach.“

Tom hatte bereits berechnet, was es kosten würde, einen zweiten Satz Infrastruktur in us-east-1 bereitzuhalten, der jederzeit eine Migration empfangen könnte. Er behielt die Zahl vorerst für sich. Es gab dringendere Kapitel abzuschließen.

Im nächsten Kapitel: was passiert, wenn man mehr Daten hat, als irgendeine Datenbank vernünftigerweise speichern kann, und man aus all dem Sinn machen muss.
