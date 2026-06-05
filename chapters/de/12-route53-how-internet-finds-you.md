# Kapitel 12: Wie das Internet Sie Findet

Nimbus lief. Der Load Balancer hatte eine öffentliche IP-Adresse. Die EC2-Instanzen hatten eine private IP-Adresse. Die Datenbanken waren in privaten Subnetzen untergebracht. Priya nickte zustimmend zur Netzwerkdiagramm.

Tom betrachtete die Load Balancer URL: `nimbus-alb-123456789.us-east-1.elb.amazonaws.com`.

„Ist das, was Kunden in ihrem Browser eintippen?“ fragte er.

„Das ist, was AWS automatisch zuweist“, sagte Maya.

„Ich werde das nicht auf eine Visitenkarte drucken.“

„Ebenso nicht.“

Sie brauchten einen Domainnamen. Sie kauften `eatnimbus.com` von einem Domain-Registrar. Jetzt mussten sie diesen Namen mit ihrer AWS-Infrastruktur verbinden.

„Wie findet das Internet heraus, dass `eatnimbus.com` auf den Load Balancer in us-east-1 verweist?“, fragte Leo.

Gute Frage, Leo.

**Die Telefonbuch-Analogie**

Vor Smartphones hatte jede Stadt ein Telefonbuch. Wenn Sie „Mario’s Pizza“ erreichen wollten, haben Sie nicht ihre Telefonnummer auswendig gelernt – Sie haben den Namen nachgeschlagen, die Nummer bekommen und angerufen.

Das Internet hat sein eigenes Telefonbuch: das **Domain Name System (DNS)**.

DNS übersetzt menschenlesbare Namen (wie `eatnimbus.com`) in maschinenlesbare IP-Adressen (wie `203.0.113.42`). Jedes Mal, wenn Sie eine Website besuchen, sucht Ihr Computer geräuschlos den Domainnamen in DNS ab und erhält die IP-Adresse, um sich zu verbinden.

Wenn Sie die IP-Adresse Ihres Servers ändern, würden Sie den DNS-Eintrag aktualisieren – wie Sie Ihre Nummer im Telefonbuch ändern – und das Internet findet Sie an Ihrem neuen Standort.

**Meet Route 53**

Amazon Route 53 ist der verwaltete DNS-Dienst von AWS. Es heißt Route 53, weil Port 53 der Standard-DNS-Port ist. (Manchmal benennen AWS Dinge einfach und verständlich.)

Route 53 erledigt Folgendes:

**Domain-Registrierung:** Sie können Domainnamen direkt über Route 53 kaufen.

**DNS-Hosting (gehostete Zonen):** Sie erstellen eine *gehostete Zone* für Ihre Domain und Route 53 verwaltet die DNS-Einträge, die der Welt sagen, wo sie Sie finden können.

**Health Checking:** Route 53 kann Ihren Endpunkten folgen und den Datenverkehr von ungesunden Endpunkten ablenken.

**Verkehrsrichtlinien:** Route 53 unterstützt mehrere Routingstrategien über DNS hinaus – gewichtet, Latenzbasierend, Standortbasiert, Failover.

**DNS-Einträge: Die Telefonbuch-Einträge**

Ein DNS-Eintrag ordnet einen Namen einem Ziel zu. Die häufigsten Typen sind:

**A-Eintrag:** Ordnet einen Namen einer IPv4-Adresse zu.
`eatnimbus.com → 203.0.113.42`

**AAAA-Eintrag:** Ordnet einen Namen einer IPv6-Adresse zu.

**CNAME-Eintrag:** Ordnet einen Namen einem anderen Namen (einem Alias) zu.
`www.eatnimbus.com → eatnimbus.com`

**MX-Eintrag:** Gibt an, welche Server E-Mails für die Domain bearbeiten.

**TXT-Eintrag:** Speichert Text. Wird häufig für die Domain-Verifizierung (beweisen Sie, dass Sie den Domainnamen besitzen) und die E-Mail-Authentifizierung (SPF, DKIM) verwendet.

Für Nimbus die Hauptkonfiguration:

- `eatnimbus.com → A-Eintrag, der auf die IP-Adresse des Load Balancers zeigt`
- `www.eatnimbus.com → CNAME-Eintrag, der auf eatnimbus.com zeigt`
- `api.eatnimbus.com → A-Eintrag, der auf den API Load Balancer zeigt`

„Wartet mal“, sagte Tom. „Die IP-Adresse des Load Balancers kann sich ändern. AWS hat das in der Dokumentation erwähnt.“

Guter Hinweis, Tom.

**Alias-Einträge: AWS’ Lösung für dynamische IPs**

Load Balancer, CloudFront-Distributionen und S3-Websites haben DNS-Namen, keine statischen IP-Adressen. Die zugrunde liegenden IPs können sich ändern.

Wenn Sie einen CNAME erstellen, der auf den DNS-Namen eines Load Balancers verweist, funktioniert es – aber Sie können CNAMEs nicht für Root-Domains (`eatnimbus.com` ohne die `www`) verwenden, da dies gegen DNS-Standards verstößt.

Route 53 löst dies mit **Alias-Einträgen** – einer von AWS entwickelten Erweiterung für DNS. Ein Alias-Eintrag ordnet einen Namen direkt einer AWS-Ressource (Load Balancer, CloudFront-Distribution, S3-Website) zu, und Route 53 verwaltet die dynamische IP-Auflösung automatisch. Alias-Einträge können auf Root-Domains verwendet werden. Und im Gegensatz zu DNS-Abfragen an externe Dienste sind Alias-Eintrag-Abfragen an AWS-Ressourcen kostenlos.

„Also verwenden wir einen Alias-Eintrag für `eatnimbus.com`, der auf den Load Balancer zeigt“, bestätigte Leo.

„Und Route 53 kümmert sich um jede IP, die der Load Balancer zu einem bestimmten Zeitpunkt verwendet“, fügte Priya hinzu.

„Kostenlos“, sagte Tom, plötzlich sehr interessiert.

**Routing-Richtlinien: Mehr als nur „Wo Ist Es?“**

Hier wird Route 53 interessant. DNS ist nicht nur ein Lookup-Service – es kann auch ein Traffic-Management-Tool sein.

**Einfaches Routing:** Ein Eintrag, ein Ziel. Standard-DNS.

**Gewichtetes Routing:** Teilen Sie den Datenverkehr zwischen mehreren Zielen anhand des Gewichts auf. Senden Sie 90 % an den neuen Server und 10 % an den alten Server während einer Migration, bis Sie sich sicher sind, dass der neue Server funktioniert, und wechseln Sie dann auf 100 %.

**Latenzbasierte Routing:** Richten Sie Benutzer dem AWS-Rechteck mit der geringsten Latenz für sie zu. Ein Benutzer in Seattle wird zu `us-west-2` geroutet. Ein Benutzer in Tokio wird zu `ap-northeast-1` geroutet. Derselbe Domainname, unterschiedliche Ziele.

**Standortbasiertes Routing:** Richten Sie anhand der geografischen Position des Benutzers ein. Alle europäischen Benutzer werden zu `eu-west-1` weitergeleitet. Alle nordamerikanischen Benutzer werden zu `us-east-1` weitergeleitet. Nützlich für die Datensovereignheit (Bewahrung von EU-Benutzerdaten in EU-Regionen) oder für die Inhaltsanpassung (Sprache, Währung).

**Failover-Routing:** Weisen Sie einen primären und einen sekundären Endpunkt zu. Wenn der primäre fehlschlägt, leitet Route 53 die Gesundheitsprüfung ab und leitet den Datenverkehr an den sekundären weiter. Dies ist die DNS-Ebene der Disaster Recovery.

**Mehrere Antwortrouten**: Geben Sie für eine Anfrage bis zu acht gesunde IP-Adressen an, sodass der Client wählen kann. Eine einfache Alternative zu einem Load Balancer zur Verteilung des Traffics auf mehrere Server.

„So Route 53 ist nicht nur ein Telefonbuch“, sagte Maya. „Es ist ein intelligentes Telefonbuch, das Anrufe basierend darauf weiterleiten kann, von wo aus Sie anrufen.“

„Und es trennt Sie, wenn die Nummer ungesund ist“, fügte Priya hinzu.

**Gesundheitsprüfungen: Umleitung bei Ausfall**

Route 53 kann Ihren Endpunkten mit Gesundheitsprüfungen folgen. Wenn ein Endpunkt ausfällt, kann Route 53:

- Entfernt ihn aus DNS-Antworten (hört das Senden von Traffic dorthin)
- Löst einen Failover zu einem Backup-Endpunkt aus
- Sendet eine Benachrichtigung über CloudWatch

Gesundheitsprüfungen sind der Verbindung zwischen DNS-Routing und der tatsächlichen Anwendungsgesundheit. Bei einer Failover-Konfiguration überwacht Route 53 den primären Endpunkt alle 30 Sekunden. Wenn drei aufeinanderfolgende Prüfungen fehlschlagen, beginnt Route 53, die Adresse des sekundären Endpunkts zurückzugeben.

Dies ist nicht sofort – DNS hat eine Propagationszeit. Sobald Route 53 ein DNS-Eintrag ändert, müssen DNS-Resolver auf der ganzen Welt die Änderung aufnehmen, was je nach TTL-Einstellungen von Sekunden bis Minuten dauern kann.

**TTL: Der DNS-Cache**

DNS-Antworten werden auf verschiedenen Ebenen zwischengespeichert – bei Ihrem Router, bei Ihrem ISP, in Ihrem Browser. Die **TTL (Time-To-Live)** auf einem DNS-Eintrag sagt den Caches, wie lange er die Antwort im Gedächtnis behalten soll, bevor er sie erneut überprüft.

Hohe TTL (1 Stunde oder mehr): Weniger DNS-Abfragen, geringere Last für Route 53, aber Änderungen propagieren sich langsamer.

Niedrige TTL (60 Sekunden oder weniger): Änderungen propagieren sich schnell, aber mehr DNS-Abfragen sind erforderlich.

Bevor Sie eine geplante Migration (DNS-Aktualisierung, um auf einen neuen Server zu zeigen), senken Sie vor der Migration die TTL auf 60 Sekunden. Dann, wenn Sie die Änderung vornehmen, propagiert sie sich in etwa einer Minute. Nach der Migration erhöhen Sie sie wieder auf den Normalwert.

„Wenn wir es während der Migration nur senken und nicht vorher“, sagte Leo langsam, „dann bedeutet die alte TTL, dass einige Benutzer eine Stunde lang den alten Server sehen.“

„Genau“, sagte Priya. „DNS-Migrationen erfordern Planung vor der Migration, nicht nur während.“

## Stärken und Grenzen

**Route 53 ist die richtige Wahl für**: die Registrierung und Verwaltung von Domainnamen vollständig innerhalb von AWS; das Routen von Traffic basierend auf Latenz, Geolocation oder gewichtetem Verteilen über mehrere Endpunkte; Health-Check-basierter Failover zwischen Regionen oder zwischen einem primären und einem Disaster-Recovery-Endpunkt; die Integration von DNS mit anderen AWS-Diensten über Alias-Einträge.

**Wenn Route 53 nicht das Richtige für Sie ist**: Route 53 ist ein DNS-Dienst, kein Load Balancer. Wenn Sie Traffic zwischen mehreren Servern oder Containern innerhalb einer Region verteilen müssen, verwenden Sie einen Application Load Balancer – Route 53 kann keine gewichtete Round-Robin-Verteilung auf Verbindungsebene durchführen, wie es ein Load Balancer kann. Latenzbasierte Routing über Regionen verursacht Kosten und betriebliche Komplexität, die nur dann sinnvoll sind, wenn Ihre Benutzer tatsächlich global verteilt sind und Millisekunden für die Conversion wichtig sind. Für die meisten Single-Region-Anwendungen ist ein einzelner A-Eintrag, der auf einen ALB zeigt, alle Route 53-Konfigurationen, die Sie benötigen.

## Zusammenfassung

- **DNS** übersetzt Domainnamen in IP-Adressen – das Internet's Telefonbuch.
- **Route 53** ist der verwaltete DNS-Dienst von AWS: Domainregistrierung, DNS-Hosting, Gesundheitsprüfungen und Routing-Richtlinien.
- **A-Einträge** ordnen Namen IPv4-Adressen zu. **CNAME-Einträge** ordnen Namen anderen Namen zu. **Alias-Einträge** ordnen Namen AWS-Ressourcen (Load Balancer, CloudFront, S3) zu.
- Verwenden Sie Alias-Einträge (nicht CNAME-Einträge) für Root-Domains und für Ressourcen mit dynamischen IPs.
- Routing-Richtlinien gehen über einfaches DNS hinaus: **gewichtet** (Traffic-Aufteilung), **latenzbasierend** (Performance), **geolokalisiert** (Datensouveränität), **Failover** (Disaster Recovery).
- **Gesundheitsprüfungen** überwachen Endpunkte und entfernen automatisch ungesunde Ziele aus DNS-Antworten.
- Planen Sie TTL-Änderungen vor Migrationen – senken Sie die TTL im Voraus, damit Änderungen schnell propagieren.

## Prüftipps

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.4)*

- **Alias vs CNAME**: Alias-Einträge können an der Root-Domain verwendet werden; CNAMEs nicht. Alias-Einträge zu AWS-Ressourcen sind kostenlos; CNAME-DNS-Abfragen werden abgerechnet. Wenn die Prüfung nach einer Zuordnung einer Root-Domain zu einem Load Balancer fragt → Alias-Eintrag.
- **Verwendungsfälle für Routing-Richtlinien** (häufige Prüfungsszenarien):
  - "Schrittweise Migration des Traffics zu einer neuen Version" → Gewichtete Routen
  - "Nutzer zu der nächstgelegenen AWS-Region leiten" → Latenzbasierte Routen
  - "EU-Nutzerdaten in EU-Regionen halten" → Geolocation-Routing
  - "Automatische DNS-Fehlausfallwiederherstellung bei Ausfall der primären Instanz" → Fehlertoleranzerouting mit Health Checks
- **Route 53 Health Checks**: Können HTTP/HTTPS/TCP-Endpunkte prüfen und können CloudWatch-Alarme auslösen. Die Prüfung verwendet diese in Disaster-Recovery-Szenarien.
- **TTL und Propagation**: Wissen, dass TTL steuert, wie lange DNS-Resolver einen Eintrag zwischenspeichern. Kurze TTL = schnellere Änderungen. Prüfungsszenario: "Das Team hat DNS aktualisiert, aber Nutzer treffen immer noch auf den alten Server" → TTL zu hoch.
- **Private Hosted Zones**: Route 53 kann DNS-Einträge erstellen, die nur innerhalb eines VPC aufgelöst werden. Die Prüfung verwendet dies für die interne Service-Discovery (z. B. `database.internal`, das auf einen privaten RDS-Endpunkt verweist).
- Route 53 ist **global** – es wird nicht in einer Region bereitgestellt. Bei der Erstellung von Hosted Zones ist keine Regionenauswahl erforderlich.

## Übungen

**Übung 1 — Erinnerung**

Erklären Sie den Unterschied zwischen einem CNAME-Eintrag und einem Alias-Eintrag. Wann würden Sie jeden verwenden?

*(Hinweis: Berücksichtigen Sie die Einschränkungen von CNAMEs bei Root-Domains und das Verhalten von Alias-Einträgen mit dynamischen AWS-Ressourcen.)*

**Übung 2 — Prüfungspraxis**

*Szenario*: Ein Medienunternehmen betreibt eine Website von zwei AWS-Regionen: `us-east-1` (primär) und `eu-west-1` (sekundär). Das Team möchte den Traffic automatisch zu `eu-west-1` leiten, wenn die primäre Region nicht verfügbar ist. Das Unternehmen möchte außerdem sicherstellen, dass dieses Failover-Mechanismus korrekt funktioniert, ohne die primäre Region tatsächlich herunterzufahren.

Welbe Route 53-Konfiguration erfüllt diese Anforderungen BEST?

A) Gewichtete Routen mit 100% Gewicht auf `us-east-1` und 0% Gewicht auf `eu-west-1`
B) Latenzbasierte Routen mit Health Checks für beide Endpunkte
C) Fehlertoleranzerouting mit einem Health Check für den primären Endpunkt und ein sekundärer Eintrag, der auf `eu-west-1` zeigt
D) Geolocation-Routing mit Nordamerika, das auf `us-east-1` zeigt, und Europa, das auf `eu-west-1` zeigt

*(Hinweis: Die Anforderung ist eine automatische Ausfallwiederherstellung, wenn die primäre Instanz ausfällt. Welche Routing-Richtlinie ist dafür speziell konzipiert?)*

*(Hinweis 2: "Testen ohne Herunterfahren der primären Instanz" – Health Checks können manuell auf "ungültig" gesetzt werden.)*

*(Hinweis 3: Latenzbasierte Routen optimieren für Geschwindigkeit, nicht für Ausfallwiederherstellung.)*

**Antwort**: C

**Erläuterung**: Fehlertoleranzerouting ist dafür speziell konzipiert. Der primäre Eintrag zeigt auf `us-east-1` mit einem Health Check. Der sekundäre Eintrag zeigt auf `eu-west-1`. Wenn der Health Check fehlschlägt, wechselt Route 53 automatisch zum sekundären Eintrag. Health Checks können manuell auf "ungültig" gesetzt werden, um die primäre Region nicht tatsächlich herunterzufahren.

**Warum nicht A?** Gewichtete Routen mit 100%/0% ist im Wesentlichen statisch – es schaltet sich nicht automatisch, wenn die primäre Instanz ausfällt.

**Warum nicht B?** Latenzbasierte Routen wählt den schnellsten Endpunkt für jeden Benutzer aus. Es schließt eine Region nicht automatisch aufgrund von Gesundheitsproblemen aus – es würde immer noch etwas Traffic an eine ungesunde `us-east-1` senden, wenn die Latenz dies bevorzugt.

**Warum nicht D?** Geolocation-Routing leitet anhand der Benutzerstandorte und nicht anhand der Endpunktgesundheit. Europäische Nutzer würden auf `eu-west-1` festgelegt bleiben, auch wenn `us-east-1` gesund ist, und nordamerikanische Nutzer würden nicht zu `eu-west-1` wechseln, selbst wenn `us-east-1` ausfällt.

*SAA-C03 Domain: Design High-Performing Architectures — Task 3.4*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nimbus expandiert international. Sie möchten, dass `eatnimbus.com` für Benutzer an der Westküste, der Ostküste und in Australien schnell lädt. Sie haben außerdem eine regulatorische Anforderung: Bestellungen von europäischen Nutzern müssen von Servern in der EU verarbeitet werden.

Entwerfen Sie eine Route 53-Routing-Strategie, die beide Anforderungen erfüllt. Welche Routing-Richtlinie oder welche Kombination von Richtlinien würden Sie verwenden? Welche Infrastruktur benötigen Sie in jeder Region?

*(Es gibt keine einzelne korrekte Antwort. Das Ziel ist es, das Routing-Design über mehrere Regionen zu üben.)*

## Post-Credits-Szene

`eatnimbus.com` war live.

Maya tippte die Adresse in ihren Browser und die Seite der Bestellungen von Nimbus hatte sich geladen. Sie bestellte eine Arepa von ihrem eigenen Familienrestaurant, nur um den Ablauf zu testen. Die Bestellung ging durch. Die Küche hatte sie erhalten.

Sie ließ sich zurück.

Tom las bereits die Route 53-Health-Check-Protokolle. "Die Antwortzeit beträgt 47 Millisekunden von `us-east-1`."

"Ist das schnell?" fragte Maya.

"Für DNS? Ja."

"Aber für einen Benutzer in Seattle?"

Tom sah sich die Latenzgraph an. "Ungefähr 80 Millisekunden."

Maya dachte darüber nach. "Wenn die meisten unserer Kunden an der Westküste sind und unsere Server in Virginia sind..."

"Jeder Request kommt von Seattle nach Virginia und zurück", sagte Leo von drüben. "Die Lichtgeschwindigkeit. Man kann die Physik nicht übertreffen."

"Also brauchen wir Server, die näher an Seattle sind."

"Oder etwas, das näher an Seattle ist und Inhalte für sie bereitstellt."

Dieser Gedanke hing in der Luft.

In dem nächsten Kapitel: die Lagereinrichtungen, die Nimbuss's Inhalte nur eine Millisekunde von jedem Nutzer, überall auf der Welt, entfernt halten.
