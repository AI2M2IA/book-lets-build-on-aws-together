# Kapitel 15: Die Wächter an der Schleuse

Der alte Deploy-Key aus der ersten Version von Nimbus war noch aktiv. Er hatte letzte Woche drei API-Aufrufe getätigt. Leo wusste nicht, was diese ausgelöst hatte.

Priya holte die VPC-Flow-Logs hoch – Netzwerkverkehrsaufzeichnungen, die jede Verbindung in und aus der VPC zeigten.

„Am Dienstag um 2:17 Uhr“, sagte sie, „gab es eine ausgehende Verbindung von der EC2-Instanz, die den alten API ausführte, zu einer IP-Adresse in Rumänien.“

„Das gehört nicht zu unserer Infrastruktur“, sagte Leo.

„Nein.“

„Also war jemand auf unserer EC2-Instanz.“

„Oder etwas.“

Sie verfolgten es zurück: Der alte Deploy-Key wurde verwendet, um ein kleines Skript auf die EC2-Instanz hochzuladen. Das Skript hatte Ports auf benachbarten Servern gescannt. Die meisten Scans waren fehlgeschlagen.

„Die Sicherheitsgruppen haben sie blockiert“, sagte Priya. „Der Angreifer gelangte auf eine EC2-Instanz. Er konnte nicht auf die anderen zugreifen, da die Sicherheitsgruppen nur den Verkehr von dem Load Balancer zuließen.“

„Also war der Schaden begrenzt.“

„Weil wir Sicherheitsgruppen korrekt konfiguriert hatten. Stellen Sie sich vor, wir hätten Port 5432 für jede EC2-Instanz im Konto offen gelassen.“

Leo musste sich das nicht vorstellen. Er hatte diese Konfiguration in der ursprünglichen Einrichtung gesehen.

**Zwei Ebenen der Netzwerksicherheit**

In einer VPC haben Sie zwei verschiedene Werkzeuge zur Steuerung des Netzwerkverkehrs:

**Sicherheitsgruppen**: Virtuelle Firewalls, die an einzelne Ressourcen (EC2-Instanzen, RDS-Datenbanken, Load Balancer, Lambda-Funktionen in einer VPC) angehängt sind. Sie operieren auf Ressourcenebene.

**Netzwerk-ACLs (NACLs)**: Firewall-Regeln, die an Subnetze angehängt sind. Sie operieren auf der Subnetzgrenze – bevor der Verkehr eine Ressource in diesem Subnetz erreicht.

Das Verständnis beider erfordert das Verständnis einer kritischen Unterscheidung: **zustandsbehaftet vs. zustandslos**.

**Zustandsbehaftet: Sicherheitsgruppen**

Eine Sicherheitsgruppe ist **zustandsbehaftet**.

Wenn Sie eingehenden Verkehr auf einer bestimmten Port zulassen, wird der Antwortverkehr automatisch zugelassen, auch wenn es keine explizite Regel dafür gibt.

Wenn Sie ausgehenden Verkehr an ein Ziel zulassen, wird der zurückkommende Verkehr automatisch zugelassen.

Denken Sie sich einen zustandsbehafteten Wächter in einem Bürogebäude. Sie zeigen Ihr Ausweis, um einzutreten. Sie gehen später hinaus. Der Wächter muss Sie nicht erneut überprüfen, wenn Sie ausgehen – das System weiß, dass Sie herein dürfen und Sie dürfen gehen.

**Sicherheitsgruppen-Regeln für die Nimbus API EC2-Instanz:**

- **Eingehend – TCP 8080 – von Load Balancer SG** → API-Verkehr vom ALB akzeptieren
- **Eingehend – TCP 22 – von Bastion Host SG** → SSH von Bastion nur
- **Ausgehend – TCP 5432 – zu RDS SG** → Verbindung zu PostgreSQL
- **Ausgehend – TCP 6379 – zu ElastiCache SG** → Verbindung zu Redis
- **Ausgehend – TCP 443 – zu 0.0.0.0/0** → HTTPS zu externen APIs

Beachten Sie: Es gibt keine explizite Regel für den ausgehenden Verkehr über Port 8080. Die eingehende Regel ist zustandsbehaftet – der Antwortverkehr (der API-Antwort an den Load Balancer) wird automatisch zugelassen.

Beachten Sie auch: Sicherheitsgruppen-Regeln verweisen auf *andere Sicherheitsgruppen*, nicht auf IP-Adressen. „Eingehenden Verkehr von der Load Balancer Sicherheitsgruppe zulassen“ bedeutet „Verkehr von jeder Ressource, die diese Sicherheitsgruppe angehängt hat, zulassen“. Dies ist flexibler und wartungsfreundlicher als das Verfolgen von IP-Adressen.

**Standardverhalten:**

- Standardmäßig wird jeglicher eingehender Verkehr abgelehnt
- Standardmäßig wird jeglicher ausgehender Verkehr zugelassen
- Alle Regeln werden ausgewertet (Sicherheitsgruppen haben keine sortierte Reihenfolge – alle übereinstimmenden Regeln werden angewendet)
- Sicherheitsgruppen können nur **zulassen** – Sie können keine expliziten Ablehnungen erstellen

**Zustandslos: Netzwerk-ACLs**

Eine NACL ist **zustandslos**.

Wenn Sie eingehenden Verkehr auf Port 8080 zulassen, deckt dies nur den eingehenden Verkehr ab. Der Antwortverkehr (der ausgehende Verkehr über temporäre Ports) muss explizit mit einer ausgehenden Regel zugelassen werden.

Denken Sie sich einen Metalldetektor. Sie gehen durch ihn, wenn Sie hineingehen. Der Metalldetektor weiß nicht, dass Sie bereits durch ihn gegangen sind – Sie müssen ihn beim Verlassen erneut passieren.

**NACL-Regeln sind nummeriert und in der Reihenfolge ausgewertet. Die erste übereinstimmende Regel gewinnt.** Regel 100 wird vor Regel 200 ausgewertet. Wenn Regel 100 den Verkehr ablehnt und Regel 200 ihn zulässt, wird der Verkehr abgelehnt.

NACLs können explizit **Ablehnungen** erstellen – im Gegensatz zu Sicherheitsgruppen, die nur zulassen können. Dies macht sie nützlich, um bestimmte IP-Adressbereiche zu blockieren.

**Standard-NACL-Verhalten:**

- Die Standard-NACL (die mit Ihrer VPC erstellt wurde) erlaubt jeglichen eingehenden und ausgehenden Verkehr
- Eine benutzerdefinierte NACL standardmäßig alle Verkehr ablehnend (Sie müssen explizit erlauben, was Sie möchten)

**NACL für das öffentliche Subnetz (vereinfacht):**

*Eingehende Regeln (ausgewertet in der Reihenfolge – erste Übereinstimmung gewinnt):*

- Regel 100: TCP 443, von 0.0.0.0/0 → **Erlauben** (HTTPS)
- Regel 110: TCP 80, von 0.0.0.0/0 → **Erlauben** (HTTP)
- Regel 120: TCP 1024–65535, von 0.0.0.0/0 → **Erlauben** (ephemerale Rückport-Ports)
- Regel \*: Alle Verkehr → **Ablehnen**

*Ausgehende Regeln:*

- Regel 100: TCP 443, zu 0.0.0.0/0 → **Erlauben** (HTTPS)
- Regel 110: TCP 80, zu 0.0.0.0/0 → **Erlauben** (HTTP)
- Regel 120: TCP 1024–65535, zu 0.0.0.0/0 → **Erlauben** (ephemerale Rückport-Ports)
- Regel \*: Alle Verkehr → **Ablehnen**

Regel 120 (Ports 1024-65535) erlaubt ephemerale Ports – die temporären, hochnummerierten Ports, die für TCP-Antwortverkehr verwendet werden. Da NACLs zustandslos sind, müssen Sie diesen ausgehenden Verkehr explizit zulassen, sonst werden die Antworten Ihres Servers nicht durchgelassen.

**Wann man welche verwendet**

```markdown
Verwenden Sie **Sicherheitsgruppen** als primäre Ebene der Zugriffskontrolle. Sie sind einfacher zu verwalten, zustandsbehaftet (geringerer Wahrscheinlichkeit von versehentlichen Blockierungen durch Vergessen von Ephemeral-Ports) und unterstützen das Verweisen auf andere Sicherheitsgruppen.

Verwenden Sie **NACLs** für Kontrollen auf Subnetzebene, insbesondere:

- **Explizite Ablehnungsregeln**: Blockieren Sie eine bestimmte IP-Adresse oder einen IP-Adressbereich, der eine gesamte Subnetz erreicht.
- **Notfallblockierung**: Eine IP-Adresse greift aktiv an – fügen Sie eine NACL-Ablehnungsregel hinzu, um das gesamte Subnetz zu blockieren, bevor es eine Ressource erreicht.

„Also sind die Sicherheitsgruppen die feingranulare Kontrolle“, sagte Maya, „und die NACL ist der breite Strich?“

„Sicherheitsgruppen schützen einzelne Ressourcen“, bestätigte Priya. „NACLs schützen ganze Subnetze. Wenn Sie einen IP-Adressenblock daran hindern möchten, etwas in Ihrem Netzwerk zu erreichen, NACL. Wenn Sie nur dem Load Balancer erlauben möchten, auf den API-Server zuzugreifen, Sicherheitsgruppe.“

**Der Vorfall: Was die Schichten erfasst hat**

Zurück zu dem Angriff mit der rumänischen IP-Adresse:

**Was ist passiert**: Der Angreifer nutzte den kompromittierten Bereitstellungsschlüssel, um ein Scan-Skript auf eine EC2-Instanz hochzuladen. Das Skript versuchte, sich mit anderen Diensten zu verbinden.

**Was hat ihn aufgehalten**:

- Die RDS-Sicherheitsgruppe erlaubte nur eingehenden Datenverkehr über Port 5432 von der API-EC2-Sicherheitsgruppe. Das Skript konnte nicht auf die Datenbank von einem Scan-Tool zugreifen – es hat die richtige Sicherheitsgruppe nicht angehängt.
- Die ElastiCache-Sicherheitsgruppe erlaubte nur eingehenden Datenverkehr über Port 6379 von der API-EC2-Sicherheitsgruppe.
- Andere EC2-Instanzen erlaubten SSH nur von der Bastion-Host-Sicherheitsgruppe.

**Was hat ihn nicht aufgehalten**:

- Die ausgehenden Regeln der EC2-Instanz erlaubten HTTPS zu 0.0.0.0/0 (notwendig für Paketdownloads). Das Skript nutzte dies, um ausgehende Verbindungen zu seinem Angreifer-Server herzustellen.

Nach dem Vorfall fügte Priya hinzu:

- Eine NACL-Regel, die den rumänischen IP-Adressbereich blockierte.
- Eine restriktivere ausgehende Regel für die EC2-Instanzen (nur bestimmte bekannte gute Ziele erlaubt).

## Stärken und Grenzen

**Sicherheitsgruppen**:

- Zustandsbehaftet (keine Probleme mit Ephemeral-Ports)
- Kann auf andere Sicherheitsgruppen verweisen (flexibler als IPs)
- Erlaubt nur Regeln – keine expliziten Ablehnungen
- Betreiben auf Ressourcenebene – granular

**NACLs**:

- Zustandslos (erfordert explizite Regeln für beide Richtungen, einschließlich Ephemeral-Ports)
- Kann explizit ablehnen – nützlich zum Blockieren bekannter böser IP-Adressen
- Betreiben auf Subnetzebene – breiter Strich
- Regeln werden in nummerischer Reihenfolge ausgewertet – vorhersehbar, aber erfordert sorgfältige Verwaltung

## Zusammenfassung

- **Sicherheitsgruppen** sind zustandsbehaftete virtuelle Firewalls für einzelne Ressourcen. Erlauben nur Regeln. Alle Regeln werden ausgewertet.
- **NACLs** sind zustandslose Firewalls für ganze Subnetze. Erlauben und ablehnen Regeln. Regeln werden in nummerischer Reihenfolge ausgewertet.
- **Zustandsbehaftet** bedeutet, dass Antwortverkehr automatisch zugelassen wird. **Zustandslos** bedeutet, dass Sie den Datenverkehr in beide Richtungen explizit zulassen müssen.
- Sicherheitsgruppen sind Ihre primäre Zugriffskontrolle. NACLs sind eine zusätzliche Schicht für Subnetz-Ebene-Kontrollen und explizites Blockieren.
- Wenn eine NACL eingehenden Datenverkehr zulässt, müssen Sie auch ausgehende Ephemeral-Ports (1024-65535) zulassen, damit die TCP-Antwort durchkommt.
- Sicherheitsgruppen können sich auf andere Sicherheitsgruppen verweisen – das Erlauben von Datenverkehr von der Load Balancer-Sicherheitsgruppe ist wartungsfreundlicher als das Verfolgen von IP-Adressen.

## Examenstipps

*SAA-C03 Domain: Design Secure Architectures (Domain 1, Task 1.2)*

- **Zustandsbehaftet vs. zustandslos**: Dieser Unterschied wird am häufigsten getestet in diesem Kapitel. Sicherheitsgruppen = zustandsbehaftet = Antwort wird automatisch zugelassen. NACLs = zustandslos = Sie müssen den Antwortverkehr explizit zulassen.
- **Sicherheitsgruppen-Regeln**: Keine expliziten Ablehnungen. Wenn mehrere Sicherheitsgruppen an eine Instanz angehängt sind, wird die Vereinigung aller Regeln angewendet. Alle übereinstimmenden Regeln werden ausgewertet.
- **NACL-Regelreihenfolge**: Regeln werden von der niedrigsten Nummer zur höchsten ausgewertet. Regel 100 vor Regel 200. Die erste Übereinstimmung gewinnt. Die „*“-Regel (Sternchen) am Ende ist die implizite Ablehnung.
- **Ephemeral-Ports**: Der klassische NACL-Fehler ist das Vergessen, ausgehend über Ports 1024-65535 zuzulassen. Wenn Ihre NACL eingehenden HTTP-Datenverkehr (Port 80) zulässt, aber ausgehende Ephemeral-Ports nicht zulässt, können Benutzer Anfragen senden, aber nie Antworten empfangen.
- **Sicherheitsgruppen-Referenzierung**: Sie können Datenverkehr von einer anderen Sicherheitsgruppe (nicht nur einer IP) zulassen. Dies ist das empfohlene Muster für Intra-VPC-Datenverkehr.
- **Standard-NACL vs. benutzerdefinierte NACL**: Die Standard-NACL erlaubt allen Datenverkehr. Eine benutzerdefinierte NACL (die Sie erstellen) verweigert standardmäßig allen Datenverkehr. Examensszenario: „Ich habe eine neue NACL erstellt und jetzt wird der Datenverkehr blockiert“ → Überprüfen Sie fehlende Erlaubnisregeln.

## Übungen

**Übung 1 – Erinnerung**

Ein Entwickler fügt einer Sicherheitsgruppe eine eingehende Regel hinzu, die Datenverkehr über Port 443 zulässt. Muss er auch eine ausgehende Regel hinzufügen, um dem Antwortserver des Servers zuzulassen? Warum oder warum nicht?

Wenn er stattdessen einer NACL eine eingehende Regel hinzufügt, die Datenverkehr über Port 443 zulässt, muss er eine ausgehende Regel hinzufügen? Warum oder warum nicht?

**Übung 2 – Examenspraxis**

*Szenario*: Ein Unternehmen betreibt eine Webanwendung auf EC2-Instanzen in einem öffentlichen Subnetz. Die Anwendung akzeptiert HTTPS-Datenverkehr (Port 443) von Internet. Benutzer melden, dass sie sich mit der Anwendung verbinden können, aber keine Antworten empfangen – Anfragen hängen und Timeout.
```

```markdown
The EC2-Sicherheitsgruppe hat eine eingehende Regel, die TCP 443 von 0.0.0.0/0 zulässt. Der Subnets NACL hat eine eingehende Regel (Regel 100), die TCP 443 von 0.0.0.0/0 zulässt, und eine ausgehende Regel (Regel 100), die TCP 443 zu 0.0.0.0/0 zulässt.

Was ist der wahrscheinlichste Grund für das Problem?

A) Die Sicherheitsgruppe fehlt eine ausgehende Regel für TCP 443
B) Der NACL fehlt eine ausgehende Regel, die temporäre Ports (1024-65535) zulässt
C) Die Sicherheitsgruppe fehlt eine eingehende Regel für temporäre Ports
D) Die EC2-Instanzen haben keine Elastic IP-Adressen

**Hinweis 1**: Sicherheitsgruppen sind zustandsbehaftet – sie erlauben Antworten automatisch. NACLs sind zustandslos – sie tun dies nicht.

**Hinweis 2**: Wenn ein Browser eine Verbindung zu einem Webserver auf Port 443 herstellt, reist die Antwort des Servers zurück über einen zufälligen temporären Port (1024-65535), nicht über Port 443.

**Hinweis 3**: Die NACL hat eine ausgehende Regel für 443, aber die Antwort geht nicht zu Port 443.

**Antwort**: B

**Erläuterung**: Der NACL ist zustandslos. Wenn Benutzer eine Verbindung zum Server auf Port 443 herstellen, reist die TCP-Antwort des Servers zurück über einen temporären Port (zufällig aus dem Bereich 1024-65535). Die NACL-ausgehende Regel erlaubt nur Port 443, sodass die Antwort durch die Standard-Verdächtige blockiert wird. Das Hinzufügen einer NACL-ausgehenden Regel, die TCP 1024-65535 zulässt, würde dies beheben.

**Warum nicht A?** Sicherheitsgruppen sind zustandsbehaftet – Antwortverkehr wird automatisch zugelassen, unabhängig von ausgehenden Regeln. Keine ausgehenden Sicherheitsgruppenregeln sind erforderlich.

**Warum nicht C?** Temporäre Ports dienen für ausgehenden Antwortverkehr, nicht für eingehenden. Die eingehende Verbindung von Benutzern kommt auf Port 443 an, der bereits zugelassen ist.

**Warum nicht D?** Elastic IPs beeinflussen, ob Instanzen öffentliche IPs haben, nicht, ob etablierte Verbindungen Antworten empfangen können.

*SAA-C03 Domain: Design Secure Architectures — Task 1.2*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nach dem rumänischen IP-Angriff möchte Priya zwei zusätzliche Kontrollen implementieren:

1. Blockiere den gesamten IP-Adressbereich 185.0.0.0/8, damit er keine Ressourcen im öffentlichen Subnetz erreicht
2. Stelle sicher, dass das private Subnetz, das die Datenbank enthält, niemals mit dem Internet kommunizieren kann, selbst wenn jemand eine Sicherheitsgruppe falsch konfiguriert

Welche Tools würden Sie für jede Anforderung verwenden und wie würden Sie sie konfigurieren? Könnten Sie Sicherheitsgruppen für beide verwenden? Könnten Sie NACLs für beide verwenden?

*(Es gibt keine eindeutige richtige Antwort. Das Ziel ist, zu verstehen, welches Werkzeug für welches Problem geeignet ist.)*

## Szenario nach den Credits

Der Vorfall wurde eingedämmt. Der kompromittierte Bereitstellungsschlüssel wurde deaktiviert. Der rumänische IP-Bereich wurde auf der NACL blockiert. Das alte Skript wurde von der EC2-Instanz entfernt.

Priya schrieb einen Vorfallbericht. Sie teilte ihn mit dem Team.

Der letzte Satz des Berichts lautete: „Grundursache: Ein aktives Kredienzertifikat aus einer stillgelegten Bereitstellungs-Pipeline wurde nie rotiert oder widerrufen. Empfehlung: Automatisierte Kreditzuweisung und regelmäßige Überprüfung aller IAM-Kredite.“

Leo las ihn dreimal.

„Ich hätte diesen Schlüssel rotieren sollen“, sagte er.

„Ja“, sagte Priya.

„Wie stellen wir sicher, dass dies nicht wieder passiert?“

„Automatisierung“, sagte sie. „Und etwas, das die Beobachter beobachtet.“

Im nächsten Kapitel: Der Tresorraum, in dem Nimbus seine Geheimnisse aufbewahrt – und die Rotation, die gestohlene Schlüssel macht harmlos.
```
