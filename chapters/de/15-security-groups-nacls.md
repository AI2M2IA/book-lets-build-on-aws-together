# Kapitel 15: Die Wächter am Tor

Das Büro war an einem Dienstagmorgen still, als Priya die VPC Flow Logs öffnete und zu lesen begann. Draußen vor dem Fenster erwachte die Stadt. Drinnen zeigte der Bildschirm etwas, das nicht da sein sollte: eine ausgehende Verbindung von einer EC2-Instanz um 2:17 Uhr morgens zu einer IP-Adresse in Rumänien.

Der alte Deploy-Key aus der ersten Version von Nimbus war immer noch aktiv. Er hatte letzte Woche drei API-Aufrufe gemacht. Leo wusste nicht, was sie ausgelöst hatte.

---

*Die IAM-Überholung hatte Access Keys durch Rollen ersetzt. Jeder Dienst hatte jetzt genau die Berechtigungen, die er brauchte. Aber während diese Arbeit lief, war ein älteres Problem still schlimmer geworden: Ein aktives Credential aus einer stillgelegten Deployment-Pipeline lebte noch, und etwas hatte es verwendet. Die IAM-Schicht war gestärkt worden. Die Netzwerkkontrollen, die den Schaden hätten eindämmen können, brauchten dieselbe Aufmerksamkeit.*

---

Priya zog die VPC Flow Logs heran – Netzwerk-Traffic-Aufzeichnungen, die jede Verbindung in die VPC hinein und aus ihr heraus zeigen.

„Am Dienstag um 2:17 Uhr morgens“, sagte sie, „gab es eine ausgehende Verbindung von der EC2-Instanz, die die alte API betreibt, zu einer IP-Adresse in Rumänien.“

„Das ist nicht unsere Infrastruktur“, sagte Leo.

„Nein.“

„Also war jemand auf unserer EC2-Instanz.“

„Oder etwas.“

Sie verfolgten es zurück: Der alte Deploy-Key war verwendet worden, um ein kleines Skript auf die EC2-Instanz hochzuladen. Das Skript hatte versucht, Ports auf benachbarten Servern zu scannen. Die meisten Scans waren fehlgeschlagen.

„Ich habe es schon deployt – oh.“ Leo hatte eine Korrektur an der Security-Group-Regel deployt, bevor die Untersuchung abgeschlossen war. Die Korrektur war korrekt, aber er hatte sie gemacht, bevor Priya das Lesen der Flow Logs beendet hatte. Sie hatte innehalten und verifizieren müssen, dass die Änderung nichts Unerwartetes beeinflusst hatte.

„Nächstes Mal warte, bis die Untersuchung abgeschlossen ist, bevor du Änderungen pushst“, sagte sie.

„Die Security Groups haben sie blockiert“, sagte Priya. „Der Angreifer ist auf eine EC2-Instanz gekommen. Sie konnten die anderen nicht erreichen, weil die Security Groups nur Traffic vom Load Balancer erlaubten.“

„Der Schaden wurde also eingedämmt.“

„Weil wir korrekt konfigurierte Security Groups hatten. Stell dir vor, wir hätten Port 5432 für jede EC2-Instanz im Account offen gelassen.“

Leo musste sich das nicht vorstellen. Er hatte diese Konfiguration im ursprünglichen Setup gesehen.

„Haben wir darüber nachgedacht, was das bedeuten würde?“, fuhr Priya fort. „Jede EC2-Instanz im Account – einschließlich der mit dem kompromittierten Schlüssel – hätte sich direkt mit der Datenbank verbinden können. Beliebiges SQL ausführen. Die Bestellhistorie jedes Kunden herunterladen. Tabellen löschen.“

„Stattdessen wurden sie jedes Mal abgewiesen, wenn sie es versuchten“, sagte Leo.

„Ja. Weil die Datenbank-Security-Group nur Verbindungen von der API-Security-Group akzeptiert. Nicht von jeder EC2 im Account. Nicht von jeder IP. Speziell von der API-Security-Group.“

„Diese eine Designentscheidung“, sagte Maya, „war der Unterschied zwischen einem eingedämmten Vorfall und einem vollständigen Datenleck.“

„Security-Group-Design ist kein Häkchen“, sagte Priya. „Es ist die tatsächliche Sicherheit des Systems.“

Rafael hatte zugehört. „Wie lernt man, was die richtige Konfiguration ist? Die Regeln scheinen anfangs willkürlich.“

„Du beginnst, indem du auflistest, was jede Komponente tun muss“, sagte Priya. „Der Load Balancer muss HTTPS von überall annehmen. Der API-Server muss HTTP nur vom Load Balancer annehmen. Die Datenbank muss PostgreSQL nur vom API-Server annehmen. Redis muss Port 6379 nur vom API-Server annehmen. Diese Anforderungen bilden sich direkt auf eingehende Regeln ab. Alles andere wird standardmäßig verweigert.“

„Und ausgehend?“

„Ausgehend ist, wo die Leute faul werden. Die meisten Teams lassen ausgehend als Allow-all. Das bedeutet, eine kompromittierte Instanz kann alles anrufen. Das werden wir verschärfen.“

**Zwei Schichten der Netzwerksicherheit**

In einer VPC haben Sie zwei verschiedene Werkzeuge zur Steuerung des Netzwerk-Traffics:

**Security Groups**: Virtuelle Firewalls, die an einzelne Ressourcen angehängt sind (EC2-Instanzen, RDS-Datenbanken, Load Balancer, Lambda-Funktionen in einer VPC). Sie arbeiten auf Ressourcenebene.

**Network ACLs (NACLs)**: Firewall-Regeln, die an Subnetze angehängt sind. Sie arbeiten an der Subnetzgrenze – bevor der Traffic eine Ressource in diesem Subnetz erreicht.

Beide zu verstehen erfordert das Verständnis eines kritischen Unterschieds: **zustandsbehaftet vs. zustandslos**.

**Zustandsbehaftet: Security Groups**

Eine Security Group ist **zustandsbehaftet**.

Wenn Sie eingehenden Traffic auf einem bestimmten Port erlauben, wird der Antwort-Traffic automatisch hinausgelassen, selbst wenn es keine explizite ausgehende Regel dafür gibt.

Wenn Sie ausgehenden Traffic zu einem Ziel erlauben, wird die zurückkommende Antwort automatisch hineingelassen.

Stellen Sie sich einen zustandsbehafteten Wachmann an einem Bürogebäude vor. Sie zeigen Ihren Ausweis, um einzutreten. Sie gehen später hinaus. Der Wachmann muss Sie auf dem Weg hinaus nicht erneut prüfen – das System weiß, dass Sie hereingelassen wurden, und Sie dürfen gehen.

**Security-Group-Regeln für die Nimbus-API-EC2-Instanz:**

- **Eingehend — TCP 8080 — von Load-Balancer-SG** → API-Traffic vom ALB annehmen
- **Eingehend — TCP 22 — von Bastion-Host-SG** → SSH nur vom Bastion
- **Ausgehend — TCP 5432 — zu RDS-SG** → Mit PostgreSQL verbinden
- **Ausgehend — TCP 6379 — zu ElastiCache-SG** → Mit Redis verbinden
- **Ausgehend — TCP 443 — zu 0.0.0.0/0** → HTTPS zu externen APIs

Beachten Sie: keine explizite ausgehende Regel für Port 8080. Die eingehende Regel ist zustandsbehaftet – Antwort-Traffic (die Antwort der API an den Load Balancer) wird automatisch erlaubt.

Beachten Sie auch: Security-Group-Regeln referenzieren *andere Security Groups*, keine IP-Adressen. „Eingehend von der Load-Balancer-Security-Group erlauben“ bedeutet „Traffic von jeder Ressource erlauben, an die diese Security Group angehängt ist.“ Das ist flexibler und wartbarer als das Verfolgen von IP-Adressen.

**Standardverhalten:**

- Standardmäßig wird aller eingehende Traffic verweigert
- Standardmäßig wird aller ausgehende Traffic erlaubt
- Alle Regeln werden evaluiert (Security Groups haben keine geordneten Regeln – alle passenden Regeln gelten)
- Security Groups können Traffic nur **erlauben** – Sie können keine expliziten Deny-Regeln erstellen

**Zustandslos: Network ACLs**

Eine NACL ist **zustandslos**.

Wenn Sie eingehenden Traffic auf Port 8080 erlauben, deckt das nur eingehend ab. Die Antwort (ausgehender Traffic auf Ephemeral Ports) muss explizit mit einer ausgehenden Regel erlaubt werden.

Stellen Sie sich einen Metalldetektor vor. Sie gehen auf dem Weg hinein durch ihn hindurch. Der Metalldetektor weiß nicht, dass Sie bereits durchgegangen sind – Sie müssen auf dem Weg hinaus erneut hindurch.

**NACL-Regeln sind nummeriert und werden der Reihe nach evaluiert.** Die erste Regel, die passt, gewinnt. Regel 100 wird vor Regel 200 evaluiert. Wenn Regel 100 Traffic verweigert und Regel 200 ihn erlaubt, wird der Traffic verweigert.

NACLs können Traffic explizit **verweigern** – anders als Security Groups, die nur erlauben können. Das macht sie nützlich, um bestimmte IP-Bereiche zu blockieren.

**Standard-NACL-Verhalten:**

- Die Standard-NACL (mit Ihrer VPC erstellt) erlaubt allen eingehenden und ausgehenden Traffic
- Eine benutzerdefinierte NACL verweigert standardmäßig allen Traffic (Sie müssen explizit erlauben, was Sie wollen)

**NACL für das öffentliche Subnetz (vereinfacht):**

*Eingehende Regeln (der Reihe nach evaluiert – erste Übereinstimmung gewinnt):*

- Regel 100: TCP 443, von 0.0.0.0/0 → **Allow** (HTTPS)
- Regel 110: TCP 80, von 0.0.0.0/0 → **Allow** (HTTP)
- Regel 120: TCP 1024–65535, von 0.0.0.0/0 → **Allow** (Ephemeral-Return-Ports)
- Regel \*: Aller Traffic → **Deny**

*Ausgehende Regeln:*

- Regel 100: TCP 443, zu 0.0.0.0/0 → **Allow** (HTTPS)
- Regel 110: TCP 80, zu 0.0.0.0/0 → **Allow** (HTTP)
- Regel 120: TCP 1024–65535, zu 0.0.0.0/0 → **Allow** (Ephemeral-Return-Ports)
- Regel \*: Aller Traffic → **Deny**

Regel 120 (Ports 1024–65535) erlaubt Ephemeral Ports – die temporären hochnummerierten Ports, die für TCP-Antwort-Traffic verwendet werden. Weil NACLs zustandslos sind, müssen Sie diese explizit ausgehend erlauben, sonst kommen die Antworten Ihres Servers nicht durch.

**Wann was verwenden**

„Moment – aber *warum* würden wir das so machen?“, fragte Maya. „Warum zwei separate Werkzeuge – Security Groups *und* NACLs –, wenn Security Groups bereits funktionieren? Was ist der Sinn der zusätzlichen Komplexität?“

Die Antwort ist, dass sie auf unterschiedlichen Ebenen arbeiten und unterschiedliche Fähigkeiten haben. Security Groups schützen einzelne Ressourcen und können nur Traffic erlauben. NACLs schützen ganze Subnetze und können explizit verweigern. Beide zu haben bedeutet, dass Sie feingranulare Allow-Regeln auf Ressourcenebene und breite Deny-Regeln auf Subnetzebene anwenden können – ohne dass eine die andere stört.

Verwenden Sie **Security Groups** für die primäre Schicht der Zugriffskontrolle. Sie sind einfacher zu verwalten, zustandsbehaftet (weniger Chance auf versehentliche Blockierungen durch Vergessen von Ephemeral Ports) und unterstützen das Referenzieren anderer Security Groups.

Verwenden Sie **NACLs** für Kontrollen auf Subnetzebene, besonders:

- **Explizite Deny-Regeln**: Eine bestimmte IP-Adresse oder einen Bereich daran hindern, ein ganzes Subnetz zu erreichen
- **Notfall-Blockierung**: Eine IP greift aktiv an – eine NACL-Deny-Regel hinzufügen, um das ganze Subnetz zu blockieren, bevor sie eine Ressource erreicht

Sie fragen sich vielleicht: Wenn Security Groups zustandsbehaftet sind und standardmäßig allen eingehenden Traffic blockieren, wann würden Sie tatsächlich NACLs brauchen? Security Groups handhaben die meisten Fälle gut. Aber es gibt eine Sache, die sie nicht können: explizit verweigern. Eine Security Group kann Traffic nur erlauben – wenn eine Regel nicht passt, wird Traffic standardmäßig verweigert. Sie können keine Regel hinzufügen, die sagt „blockiere diese spezifische IP.“ Dafür brauchen Sie eine NACL: eine nummerierte Deny-Regel, die einen bestimmten Adressbereich stoppt, bevor er eine Ressource im Subnetz erreicht. NACLs sind am nützlichsten für Notfallreaktion (Blockieren eines aktiven Angreifers) und zum Durchsetzen von Subnetzgrenzen, die nicht von der individuellen Ressourcenkonfiguration abhängen sollten.

„Die Security Group ist also die feingranulare Kontrolle“, sagte Maya, „und die NACL der grobe Strich?“

„Security Groups schützen einzelne Ressourcen“, bestätigte Priya. „NACLs schützen ganze Subnetze. Wenn du eine IP daran hindern willst, irgendetwas in deinem Netzwerk zu erreichen, NACL. Wenn du nur dem Load Balancer erlauben willst, den API-Server zu erreichen, Security Group.“

„Haben wir darüber nachgedacht, was passiert, wenn der Angreifer mit einer anderen IP zurückkommt?“, sagte Priya. „Die NACL blockiert einen Bereich. Sie wechseln zu einem anderen.“

„Dafür ist GuardDuty da“, sagte Leo. „Verhaltensbasierte Erkennung. Wenn dasselbe Skript von einer neuen IP läuft, sieht das Traffic-Muster gleich aus.“

„Wir kommen dahin“, sagte Priya. „Eins nach dem anderen.“

„Wie viel kostet das alles pro Monat?“, fragte Tom.

Security Groups und NACLs selbst sind kostenlos. AWS berechnet nichts für die Anzahl der Security Groups, die Anzahl der Regeln oder die Anzahl der NACL-Einträge. Die Kostenbetrachtung ist indirekt: Strengere ausgehende Security-Group-Regeln könnten weniger Traffic durch das NAT Gateway leiten und so Datenverarbeitungsgebühren reduzieren.

„Die Sicherheitskontrollen sind also kostenlos“, sagte Rafael. „Die Kosten sind die Infrastruktur, die sie unterstützt.“

„Korrekt. NAT Gateways für Hochverfügbarkeit. Interface-VPC-Endpunkte für Dienste, die sonst durch NAT gehen würden. Die haben Kosten. Die Security-Group-Regeln selbst nicht.“

**Alles zusammenfügen: Die geschichtete Verteidigung**

Nach dem Vorfall zeichnete Priya die Verteidigungsschichten von Nimbus auf das Whiteboard:

```
Internet
  ↓
CloudFront + Shield (DDoS-Absorption)
  ↓
WAF (Filterung auf Anwendungsebene)
  ↓
Internet Gateway
  ↓
NACL auf öffentlichem Subnetz (Regeln auf Subnetzebene, Notfall-Blockierung)
  ↓
ALB-Security-Group (HTTPS von überall)
  ↓
NACL auf privatem App-Subnetz
  ↓
EC2-API-Security-Group (Port 8080 nur von ALB-SG)
  ↓
NACL auf privatem Daten-Subnetz
  ↓
RDS-Security-Group (Port 5432 nur von API-SG)
```

„Jede Schicht nimmt an, dass die vorherige versagen könnte“, sagte sie. „Die Datenbank vertraut nicht darauf, dass die Netzwerkschicht den Angreifer gestoppt hat. Die EC2-Instanz vertraut nicht darauf, dass der ALB den Angreifer gestoppt hat. Jede Schicht setzt ihre eigenen Regeln unabhängig durch.“

„Defense in Depth“, sagte Maya.

„Defense in Depth. Ein Angreifer, der durch eine Schicht kommt, steht immer noch vor der nächsten. Keine einzelne Fehlkonfiguration ist katastrophal. Es bedeutet, eine Schicht versagt, und die anderen halten.“

Leo sah sich das Diagramm an. Der Angreifer hatte eine EC2-Instanz kompromittiert. Sie waren durch die Credentials-Schicht gekommen. Aber jede nachfolgende Schicht hatte gehalten.

So sah Defense in Depth in der Praxis aus.

**Der Vorfall: Was die Schichten abgefangen haben**

Zurück zum Angriff der rumänischen IP:

**Was passierte**: Der Angreifer verwendete den kompromittierten Deploy-Key, um ein Scan-Skript auf eine EC2-Instanz hochzuladen. Das Skript versuchte, sich mit anderen Diensten zu verbinden.

**Was sie gestoppt hat**:

- Die RDS-Security-Group erlaubte eingehend auf Port 5432 nur von der API-EC2-Security-Group. Das Skript konnte die Datenbank von einem Scan-Tool aus nicht erreichen – es hängte nicht die richtige Security Group an.
- Die ElastiCache-Security-Group erlaubte eingehend auf Port 6379 nur von der API-EC2-Security-Group.
- Andere EC2-Instanzen erlaubten SSH nur von der Bastion-Host-Security-Group.

**Was sie nicht gestoppt hat**:

- Die ausgehenden Regeln der EC2-Instanz erlaubten HTTPS zu 0.0.0.0/0 (nötig für Paket-Downloads). Das Skript verwendete das, um ausgehende Verbindungen zum Server des Angreifers herzustellen.

Nach dem Vorfall fügte Priya hinzu:

- Eine NACL-Regel, die den rumänischen IP-Bereich blockierte
- Eine restriktivere ausgehende Regel auf den EC2-Instanzen (erlaubte nur bestimmte bekannte-gute Ziele)
- Eine Prüfung, dass **IMDSv2 erzwungen war** (`HttpTokens=required`) auf jeder Instanz – das Skript war *auf* der Instanz gelaufen, was bedeutete, dass es den Metadata Service nach den temporären Anmeldedaten der Instanzrolle hätte abfragen können. IMDSv2 war in Kapitel 4 aktiviert worden; Priya verifizierte, dass es überall noch erforderlich war, denn ein Angreifer mit Codeausführung plus IMDSv1 ergibt gestohlene AWS-Anmeldedaten.

---

**Die Flow Logs lesen: Was Priya sah**

Die Untersuchung begann mit den VPC Flow Logs. Priya öffnete CloudWatch Logs Insights und führte eine Abfrage gegen die Flow-Log-Gruppe für die letzten 48 Stunden aus:

```
fields @timestamp, srcAddr, dstAddr, srcPort, dstPort, action
| filter srcAddr = "10.0.10.7"
| filter action = "REJECT"
| sort @timestamp asc
```

`10.0.10.7` war die kompromittierte EC2-Instanz. Der REJECT-Filter zeigte Verbindungsversuche, die blockiert worden waren.

Die Ergebnisse:

```
10.0.10.7 → 10.0.10.8  port 22    REJECT   # Andere EC2-Instanz — SSH blockiert
10.0.10.7 → 10.0.10.9  port 22    REJECT   # Eine weitere EC2 — SSH blockiert
10.0.10.7 → 10.0.20.8  port 5432  REJECT   # RDS — von Security Group blockiert
10.0.10.7 → 10.0.20.9  port 5432  REJECT   # RDS-Replik — blockiert
10.0.10.7 → 10.0.20.11 port 6379  REJECT   # Redis — blockiert
```

Der Scan hatte jeden internen Dienst getroffen. Jeder Versuch war abgewiesen worden. Das Security-Group-Design hatte gehalten.

Aber es gab auch einen ausgehenden ACCEPT-Eintrag:

```
10.0.10.7 → 185.220.101.55  port 443  ACCEPT   2847 bytes
```

Das war der Datenexfiltrationsversuch – 2,8 Kilobyte über HTTPS an die rumänische IP gesendet. Die Security Group erlaubte HTTPS ausgehend für legitime Paket-Downloads. Der Angreifer hatte diese Regel verwendet.

„Die Security Groups haben die laterale Bewegung gestoppt“, sagte Priya und führte das Team durch die Logs. „Aber die ausgehende Regel war zu permissiv. Wir haben HTTPS zu jedem Ziel erlaubt. Wir sollten HTTPS nur zu bekannten AWS-Endpunkten erlauben – CloudWatch, Secrets Manager, S3 – und zu den Paket-Repository-CDNs.“

Sie zeigte die aktualisierten ausgehenden Security-Group-Regeln:

```
TCP 443 → pl-63a5400a (AWS-S3-Gateway-Endpoint-Prefix-List)
TCP 443 → pl-02cd2c6b (AWS CloudWatch Logs)
TCP 443 → 54.239.0.0/18 (AWS-Paket-Repos — verengt sich mit der Zeit)
```

„Das eliminiert die allgemeine ausgehende HTTPS-Regel. Ausgehendes HTTPS geht jetzt nur zu bekannten-guten Zielen.“

„Was ist mit Lambda-Funktionen, die Drittanbieter-APIs aufrufen?“, fragte Leo.

„Die gehen durch das NAT Gateway, das seine eigene dedizierte ausgehende Regel hat“, sagte Priya. „Lambda verwendet nicht die EC2-Security-Group. Andere Netzwerkschnittstelle, anderer Regelsatz.“

---

**Die Geschichte des zustandslosen Debuggings**

Zwei Wochen nach dem Vorfall half Rafael – noch in seinem ersten Monat – beim Einrichten einer neuen Datenpipeline. Sie umfasste eine Lambda-Funktion in einer VPC, die eine interne API aufrufen musste, die auf EC2 lief.

Die Lambda-Funktion lief in einen Timeout. Jeder Aufruf lief in einen Timeout.

Rafael prüfte die Security Groups. Die Lambda-Security-Group hatte eine ausgehende Regel für TCP 8080 zur EC2-Security-Group. Die EC2-Security-Group hatte eine eingehende Regel für TCP 8080 von der Lambda-Security-Group. Die Regeln sahen korrekt aus.

Er wandte sich an Leo. „Die Security Groups sehen in Ordnung aus. Warum läuft es in einen Timeout?“

Leo sah sich die Subnetzkonfiguration an. Die Lambda-Funktion war in einem privaten Subnetz. Das Subnetz hatte eine benutzerdefinierte NACL, die Priya während der Sicherheitshärtung angewendet hatte.

Er sah sich die ausgehenden NACL-Regeln an:

```
Regel 100: TCP 443  → 0.0.0.0/0  ALLOW
Regel 110: TCP 5432 → 10.0.20.0/24 ALLOW
Regel *:   Alle      → 0.0.0.0/0  DENY
```

„Die NACL erlaubt HTTPS ausgehend und PostgreSQL ausgehend“, sagte Leo. „Sie erlaubt nicht TCP 8080 ausgehend.“

„Die Security Group erlaubt es“, sagte Rafael.

„Die NACL nicht. Und die NACL ist zustandslos. Selbst wenn die Security Group der Lambda-Funktion die ausgehende Verbindung erlaubt, evaluiert die NACL an der Subnetzgrenze trotzdem den ausgehenden Traffic. Die NACL blockiert den Aufruf der Lambda, bevor er das Subnetz verlässt.“

„Aber wenn ich ALLOW für TCP 8080 ausgehend zur NACL hinzufüge—“

„Musst du auch ALLOW für Ephemeral Ports eingehend hinzufügen“, sagte Leo. „Die Antwort von der EC2-Instanz kommt auf einem zufälligen Port zwischen 1024 und 65535 zurück. Wenn die eingehenden Regeln der NACL diese nicht erlauben, wird die Antwort auf dem Rückweg blockiert.“

Rafael aktualisierte die NACL:

```
Regel 100:  TCP 443       → 0.0.0.0/0      ALLOW  (ausgehend)
Regel 105:  TCP 8080      → 10.0.10.0/24   ALLOW  (ausgehend zum EC2-Subnetz)
Regel 110:  TCP 5432      → 10.0.20.0/24   ALLOW  (ausgehend zum DB-Subnetz)
Regel *:    Alle           → 0.0.0.0/0      DENY
```

Und auf der eingehenden Seite:

```
Regel 100:  TCP 1024-65535 von 10.0.10.0/24  ALLOW  (Return-Traffic von EC2)
Regel *:    Alle                              DENY
```

Die Lambda-Funktion verband sich sofort.

„Deshalb hassen die Leute NACLs“, sagte Rafael.

„Deshalb musst du sie verstehen“, sagte Priya. „Die Bugs, die sie erzeugen, sind genau die Bugs, die zu verhindern sie konzipiert sind – unerwartete Traffic-Flüsse. Das zustandslose Modell zu verstehen sagt dir genau, wo du schauen musst, wenn eine Verbindung mysteriös fehlschlägt.“

„Security Group zustandsbehaftet – Return-Traffic automatisch. NACL zustandslos – Return-Traffic braucht explizite Regeln“, wiederholte Rafael.

„Sag es, bis es Teil davon ist, wie du denkst“, sagte Priya.

---

**NACL-Notfall-Blockierung: Die /24-Regel**

Nachdem sie den Quell-IP-Bereich des Angreifers identifiziert hatte, war Priyas Reaktion sofortig: eine NACL-Deny-Regel hinzufügen.

Aber sie blockierte nicht nur die einzelne IP. Sie blockierte das gesamte `/24` – das 256-Adressen-Subnetz, von dem aus der Angreifer operierte.

„Warum das ganze /24?“, fragte Leo.

„Weil das Blockieren einzelner IPs ein aussichtsloses Spiel ist. Angreifer verwenden mehrere IPs innerhalb eines Bereichs und rotieren durch sie, wenn eine blockiert wird. Das /24 zu blockieren macht es schwerer – sie müssten zu einem anderen Adressblock wechseln, was sie Zeit und Aufwand kostet.“

Die NACL-Regel:

```
Regel 90:  ALLE von 185.220.101.0/24 → DENY
```

Regel 90 wird vor allen Allow-Regeln evaluiert (die bei Regel 100 beginnen). Der gesamte Bereich wird blockiert, bevor eine Allow-Regel in Betracht gezogen wird.

„Und das gilt für jede Ressource im Subnetz?“, fragte Leo.

„Jede Ressource. Das ist der Sinn einer NACL – sie gilt, bevor der Traffic die Security Group irgendeiner einzelnen Ressource erreicht. Ein NACL-Deny bei Regel 90 bedeutet, das Paket kommt nie zur Security-Group-Evaluierung.“

„Könnten wir das stattdessen mit einer Security Group machen?“

„Nein. Security Groups können Traffic nur erlauben. Es gibt keine Deny-Regel. Wenn du eine bestimmte IP daran hindern willst, irgendeine Ressource in einem Subnetz zu erreichen, ist die NACL die einzige Option.“

Das ist der primäre Anwendungsfall für NACL-Deny-Regeln: Notfallreaktion auf aktive Angriffe. Die Security Group ist der primäre Kontrollmechanismus. Die NACL ist die Notbremse.

---

**Security-Group-Designmuster: Referenz per ID**

„Haben wir darüber nachgedacht, was passiert, wenn unsere EC2-Instanzen ersetzt werden?“, fragte Priya. „Auto Scaling terminiert alte Instanzen und startet neue. Neue Instanzen bekommen neue private IP-Adressen.“

„Wenn Security-Group-Regeln IP-Adressen referenzieren“, sagte Leo langsam, „müssten wir die Regeln jedes Mal aktualisieren, wenn eine Instanz ersetzt wird.“

„Genau. Deshalb referenziert man keine IP-Adressen in Security-Group-Regeln für Intra-VPC-Traffic.“

Security Groups können andere Security Groups statt IP-Adressen referenzieren. Wenn eine Regel sagt „eingehend von der Load-Balancer-Security-Group erlauben“, bedeutet das „Traffic von jeder Ressource erlauben, an die die Load-Balancer-Security-Group angehängt ist.“ Auto Scaling kann tausend neue Instanzen mit jeweils einer neuen IP starten, und die Regel bleibt gültig.

Die Nimbus-Security-Group-Struktur:

```
nimbus-alb-sg (Load Balancer)
  - Eingehend: TCP 443 von 0.0.0.0/0
  - Eingehend: TCP 80 von 0.0.0.0/0

nimbus-api-sg (EC2-API-Instanzen)
  - Eingehend: TCP 8080 von nimbus-alb-sg
  - Eingehend: TCP 22 von nimbus-bastion-sg
  - Ausgehend: TCP 5432 zu nimbus-rds-sg
  - Ausgehend: TCP 6379 zu nimbus-redis-sg

nimbus-rds-sg (RDS)
  - Eingehend: TCP 5432 von nimbus-api-sg

nimbus-redis-sg (ElastiCache)
  - Eingehend: TCP 6379 von nimbus-api-sg

nimbus-bastion-sg (Bastion Host)
  - Eingehend: TCP 22 von <Büro-VPN-IP>
```

Keine IP-Adressen für internen Traffic. Nur Security-Group-IDs. Wenn eine Instanz ersetzt wird, überträgt sich die Security-Group-Mitgliedschaft automatisch auf die neue Instanz.

„Und für die Microservices, die wir planen?“, fragte Rafael. „Wir werden irgendwann ein Dutzend Dienste haben. Jeder muss mit einigen anderen reden, aber nicht mit allen.“

„Jeder Dienst bekommt seine eigene Security Group“, sagte Priya. „Die Security Group von Dienst A wird in den eingehenden Regeln jedes Dienstes referenziert, den Dienst A aufrufen darf. Dienste, die nicht kommunizieren sollen, referenzieren einfach nicht die Security Groups des jeweils anderen.“

Das ist das **Hub-and-Spoke-Security-Group-Muster** für Microservices. Eine gemeinsame Datenbank-Security-Group hat eingehende Regeln von fünf verschiedenen Dienst-Security-Groups. Wenn ein sechster Dienst Datenbankzugriff braucht, fügen Sie seine Security Group zur eingehenden Regel der Datenbank hinzu. Wenn der Zugriff entfernt werden soll, entfernen Sie die Referenz. Keine IP-Verwaltung. Keine veralteten Regeln, die auf stillgelegte Server zeigen.

„Die Security Group ist die Identität“, sagte Priya. „Die IP-Adresse ist ein Zufall der Zuteilung.“

---

**Least-Privilege-Firewall: Die Disziplin**

„Haben wir darüber nachgedacht, was die korrekte Haltung für ausgehende Regeln ist?“, fragte Priya während des Post-Incident-Reviews.

Die meisten Teams lassen die ausgehenden EC2-Security-Group-Regeln auf dem Standard: alles ausgehend erlauben. Das ist bequem – die Anwendung kann alles aufrufen –, aber es ist nicht Least Privilege.

Priyas Prinzip: Ausgehende Regeln sollten so spezifisch sein wie eingehende Regeln.

Ausgehende Regeln der Nimbus-API-Security-Group nach der Härtung:

```
TCP 5432 → nimbus-rds-sg       (PostgreSQL zu RDS)
TCP 6379 → nimbus-redis-sg     (Redis zu ElastiCache)
TCP 443  → s3.amazonaws.com Prefix List    (S3-Gateway-Endpoint)
TCP 443  → secretsmanager-Endpoint         (Secrets Manager)
TCP 443  → logs-Endpoint                   (CloudWatch Logs)
```

Kein „alles ausgehend erlauben“. Jedes Ziel benannt.

„Das ist viel Wartung“, sagte Leo.

„Es ist mehr Wartung als Allow-all“, räumte Priya ein. „Es ist weniger Aufräumen als ein Datenleck. Der Angreifer, der die EC2-Instanz kompromittiert hat, hätte mehr Daten exfiltrieren können, wenn die ausgehenden Regeln offen gewesen wären. Sie haben die HTTPS-zu-überall-Regel verwendet, weil sie da war.“

„Und mit spezifischen ausgehenden Regeln kann selbst eine kompromittierte Instanz nur Daten an genehmigte Ziele senden.“

„Genau. Die Security Group wird zur letzten Verteidigungslinie der Eindämmung, nicht nur zur ersten Verteidigungslinie.“

---

## Stärken und Grenzen

**Security Groups**:

- Zustandsbehaftet (keine Ephemeral-Port-Kopfschmerzen)
- Können andere Security Groups referenzieren (flexibler als IPs)
- Nur Allow-Regeln – kein explizites Deny
- Arbeiten auf Ressourcenebene – granular
- Regeln gelten sofort – keine Reihenfolge, keine Priorität
- Mehrere Security Groups können an eine Ressource angehängt werden – Regeln aus allen werden kombiniert

**NACLs**:

- Zustandslos (erfordert explizite Regeln für beide Richtungen einschließlich Ephemeral Ports)
- Können explizit verweigern – nützlich zum Blockieren bekannter-schlechter IPs
- Arbeiten auf Subnetzebene – grober Strich
- Nummerierte Regeln werden der Reihe nach evaluiert – vorhersehbar, aber erfordert sorgfältige Verwaltung
- Gelten, bevor der Traffic eine Ressource im Subnetz erreicht – erste Verteidigungslinie
- Effektiv für Notfall-IP-Blockierung über ein ganzes Subnetz

**Wo jedes Werkzeug passt**:

Verwenden Sie standardmäßig Security Groups für alles. Fügen Sie NACLs hinzu, wenn Sie explizite Deny-Regeln brauchen – einen IP-Bereich blockieren, einen Port auf Subnetzebene unabhängig von der individuellen Ressourcenkonfiguration blockieren oder durchsetzen, dass ein Daten-Subnetz niemals Traffic von einer bestimmten Quelle empfangen kann. NACLs sind kein Ersatz für Security Groups; sie sind eine Ergänzung für Situationen, in denen das Allow-only-Design der Security Groups unzureichend ist.

## Zusammenfassung

Der Vorfall mit der rumänischen IP war von Sicherheitskontrollen eingedämmt worden, die bereits vorhanden waren – nicht durch Glück, sondern durch Design. Security Groups hatten laterale Bewegung innerhalb der VPC verhindert. Nach dem Vorfall fügten NACLs die Fähigkeit hinzu, den IP-Bereich des Angreifers explizit an der Subnetzgrenze zu blockieren. VPC Flow Logs machten den Angriff sichtbar. Zwei Werkzeuge, zwei Schichten, zwei verschiedene Aufgaben – mit Logging, um zu beweisen, was passiert ist.

- **Security Groups** sind zustandsbehaftete virtuelle Firewalls für einzelne Ressourcen. Nur Allow-Regeln. Alle Regeln gleichzeitig evaluiert.
- **NACLs** sind zustandslose Firewalls für ganze Subnetze. Allow- und Deny-Regeln. Regeln in Nummernreihenfolge evaluiert – erste Übereinstimmung gewinnt.
- **Zustandsbehaftet** bedeutet, Antwort-Traffic wird automatisch erlaubt. **Zustandslos** bedeutet, Sie müssen Traffic in beide Richtungen explizit erlauben, einschließlich Ephemeral-Return-Ports.
- Security Groups sind Ihre primäre Zugriffskontrollschicht. NACLs sind das Override auf Subnetzebene – besonders für Notfall-Blockierung.
- Wenn eine NACL eingehenden Traffic erlaubt, müssen Sie auch ausgehende Ephemeral Ports (1024–65535) erlauben, damit die TCP-Antwort durchkommt.
- **Referenzieren Sie Security Groups per ID**, nicht per IP-Adresse, für Intra-VPC-Traffic. Auto Scaling ersetzt Instanzen; die Security-Group-Mitgliedschaft überträgt sich automatisch.
- **Spezifische ausgehende Regeln** auf EC2-Instanzen begrenzen, was eine kompromittierte Instanz tun kann – Least-Privilege-Firewall.
- Verwenden Sie Flow Logs, um zu sehen, was die Security Groups und NACLs tatsächlich tun. Regeln sind Theorie. Logs sind Beweise.

## Prüfungstipps

*SAA-C03 Domäne: Design Secure Architectures (Domäne 1, Aufgabe 1.2)*

- **Zustandsbehaftet vs. zustandslos**: Diese Unterscheidung ist das am häufigsten geprüfte Konzept in diesem Kapitel. Security Groups = zustandsbehaftet = Antwort automatisch erlaubt. NACLs = zustandslos = müssen Antwort-Traffic explizit erlauben.
- **Security-Group-Regeln**: Kein explizites Deny. Wenn mehrere Security Groups an eine Instanz angehängt sind, gilt die Vereinigung aller Regeln. Alle passenden Regeln werden gleichzeitig evaluiert.
- **NACL-Regelreihenfolge**: Regeln werden von der niedrigsten Nummer zur höchsten evaluiert. Regel 100 vor 200. Die erste Übereinstimmung gewinnt. Die `*`-Regel (Sternchen) ganz unten ist das implizite Deny. Eine Deny-Regel bei Regel 90 hinzuzufügen blockiert vor jeder Allow-Regel bei 100.
- **Ephemeral Ports**: Der klassische NACL-Fehler ist das Vergessen, ausgehend auf Ports 1024–65535 zu erlauben. Wenn Ihre NACL eingehend HTTP (Port 80) erlaubt, aber keine ausgehenden Ephemeral Ports, können Benutzer Anfragen senden, aber nie Antworten empfangen. Das ist das häufigste NACL-Prüfungsszenario.
- **Security-Group-Referenzierung**: Sie können Traffic von einer anderen Security Group erlauben (nicht nur einer IP). Das ist das empfohlene Muster für Intra-VPC-Traffic. Die Prüfung verwendet häufig „eingehend von der ALB-Security-Group erlauben“ als korrekte Antwort zum Beschränken des EC2-Zugriffs.
- **Standard-NACL vs. benutzerdefinierte NACL**: Die Standard-NACL erlaubt allen Traffic. Eine benutzerdefinierte NACL (die Sie erstellen) verweigert standardmäßig allen Traffic. Prüfungsszenario: „eine neue NACL erstellt und jetzt ist Traffic blockiert“ → auf fehlende Allow-Regeln prüfen.
- **Die IP eines Angreifers blockieren**: Security Groups können keine bestimmten IPs blockieren (nur Allow). NACLs können eine bestimmte IP oder ein CIDR explizit verweigern. Prüfungsszenario: „eine bestimmte IP daran hindern, irgendeine Ressource im Subnetz zu erreichen“ → NACL-Deny-Regel.
- **Verbindungsfehler debuggen**: Prüfen Sie die Reihenfolge: Security Group auf der Quelle (ausgehend) → Security Group auf dem Ziel (eingehend) → NACL auf dem Quell-Subnetz (ausgehend + Ephemeral Ports) → NACL auf dem Ziel-Subnetz (eingehend). Die meisten Verbindungsfehler in der Prüfung werden durch eine fehlende ausgehende NACL-Regel oder ein fehlendes Ephemeral-Port-Allowance verursacht.
- **Mehrere Subnetze und NACLs**: Eine NACL gilt für alle Subnetze, die mit ihr verknüpft sind. Ein Subnetz kann nur mit einer NACL verknüpft sein. Die Prüfung könnte fragen, welche NACL zu aktualisieren ist, wenn der Traffic eines bestimmten Subnetzes betroffen ist.

## Übungen

**Übung 1 – Erinnerung**

Eine Entwicklerin fügt einer Security Group eine eingehende Regel hinzu, die Traffic auf Port 443 erlaubt. Muss sie auch eine ausgehende Regel hinzufügen, um die Antwort des Servers zu erlauben? Warum oder warum nicht?

Wenn sie stattdessen einer NACL eine eingehende Regel hinzufügt, die Traffic auf Port 443 erlaubt, muss sie eine ausgehende Regel hinzufügen? Warum oder warum nicht?

**Hinweis**: Denken Sie an die Analogien des Kapitels – ist jede der Wachmann, der sich erinnert, Sie hereingelassen zu haben, oder der Metalldetektor, durch den Sie auf dem Weg hinaus erneut müssen?

**Übung 2 – SAA-C03-Szenario**

*Szenario*: Ein Unternehmen hat eine Webanwendung, die auf EC2-Instanzen in einem öffentlichen Subnetz läuft. Die Anwendung akzeptiert HTTPS-Traffic (Port 443) aus dem Internet. Benutzer melden, dass sie sich mit der Anwendung verbinden können, aber keine Antworten empfangen – Anfragen hängen und laufen in einen Timeout.

Die EC2-Security-Group hat eine eingehende Regel, die TCP 443 von 0.0.0.0/0 erlaubt. Die NACL des Subnetzes hat eine eingehende Regel (Regel 100), die TCP 443 von 0.0.0.0/0 erlaubt, und eine ausgehende Regel (Regel 100), die TCP 443 zu 0.0.0.0/0 erlaubt.

Was ist die WAHRSCHEINLICHSTE Ursache des Problems?

A) Der Security Group fehlt eine ausgehende Regel für TCP 443  
B) Die EC2-Instanzen haben keine Elastic-IP-Adressen  
C) Der Security Group fehlt eine eingehende Regel für Ephemeral Ports  
D) Der NACL fehlt eine ausgehende Regel, die Ephemeral Ports (1024–65535) erlaubt

**Hinweis 1**: Security Groups sind zustandsbehaftet – sie erlauben Antworten automatisch. NACLs sind zustandslos – sie tun es nicht.

**Hinweis 2**: Wenn ein Browser sich mit einem Webserver auf Port 443 verbindet, reist die Antwort des Servers auf einem zufälligen Ephemeral Port (1024–65535) zurück, nicht auf Port 443.

**Hinweis 3**: Die NACL hat eine ausgehende Regel für 443, aber die Antwort geht nicht zu Port 443.

**Antwort**: D

**Erläuterung**: Die NACL ist zustandslos. Wenn Benutzer sich mit dem Server auf Port 443 verbinden, reist die TCP-Antwort des Servers auf einem Ephemeral Port (zufällig aus 1024–65535 gewählt) zurück. Die ausgehende NACL-Regel erlaubt nur Port 443, sodass die Antwort von der Standard-Deny-Regel blockiert wird. Eine ausgehende NACL-Regel hinzuzufügen, die TCP 1024–65535 erlaubt, würde das beheben.

**Warum nicht A?** Security Groups sind zustandsbehaftet – Antwort-Traffic wird unabhängig von ausgehenden Regeln automatisch erlaubt. Es ist keine ausgehende Security-Group-Regel nötig.

**Warum nicht B?** Elastic IPs beeinflussen, ob Instanzen öffentliche IPs haben, nicht, ob etablierte Verbindungen Antworten empfangen können.

**Warum nicht C?** Ephemeral Ports sind für ausgehenden Antwort-Traffic, nicht eingehenden. Die eingehende Verbindung von Benutzern kommt auf Port 443 herein, der bereits erlaubt ist.

*SAA-C03 Domäne: Design Secure Architectures – Aufgabe 1.2*

**Übung 3 – Architektur-Herausforderung** *(Optional)*

Nach dem Angriff der rumänischen IP möchte Priya zwei zusätzliche Kontrollen implementieren:

1. Den gesamten IP-Bereich 185.0.0.0/8 daran hindern, irgendeine Ressource im öffentlichen Subnetz zu erreichen
2. Sicherstellen, dass das private Subnetz, das die Datenbank enthält, niemals mit dem Internet kommunizieren kann, selbst wenn jemand eine Security Group fehlkonfiguriert

Welche Werkzeuge würden Sie für jede Anforderung verwenden, und wie würden Sie sie konfigurieren? Könnten Sie Security Groups für beide verwenden? Könnten Sie NACLs für beide verwenden?

*(Es gibt keine einzige richtige Antwort. Das Ziel ist es zu verstehen, welches Werkzeug zu welchem Problem passt.)*

## Post-Credits-Szene

Der Vorfall war eingedämmt. Der kompromittierte Deploy-Key war deaktiviert. Der rumänische IP-Bereich war an der NACL blockiert. Das alte Skript war von der EC2-Instanz entfernt worden.

Priya schrieb einen Incident-Report. Sie teilte ihn mit dem Team.

Die letzte Zeile des Reports: „Root Cause: Ein aktives Credential aus einer stillgelegten Deployment-Pipeline wurde nie rotiert oder widerrufen. Empfehlung: automatisierte Credential-Rotation und regelmäßiges Audit aller IAM-Credentials.“

Leo las sie dreimal.

„Ich hätte diesen Schlüssel rotieren sollen“, sagte er.

„Ja“, sagte Priya.

„Wie stellen wir sicher, dass das nicht wieder passiert?“

„Automatisierung“, sagte sie. „Und etwas, das die Wächter bewacht.“

Im nächsten Kapitel: die Schließbox, in der Nimbus seine Geheimnisse aufbewahrt – und die Rotation, die gestohlene Schlüssel nutzlos macht.
