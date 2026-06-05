# Kapitel 14: Wer Dürft Was Tun

Tom hatte die Zugriffsschlüssel in einer Textdatei offen, bereit zum Einfügen.

"Was machst du da?", fragte Priya.

"Die EC2-Instanz muss Konfigurationsdateien aus S3 lesen. Ich speichere die Anmeldeinformationen in der Serverkonfiguration."

Sie sah kurz auf den Bildschirm. "Schließe diese Datei."

"Ich war gerade dabei—"

"Wenn jemand Zugriff auf diesen Server erhält", sagte sie, "erhält er diese Schlüssel. Und diese Schlüssel greifen auf alles zu, was der IAM-Benutzer autorisiert hat, zu erreichen. Was wahrscheinlich mehr ist als nur S3."

Tom schloss die Datei.

"Es gibt einen besseren Weg", sagte sie. "Der Server selbst kann eine Rolle haben. Stell es dir wie einen Jobtitel vor – die Instanz benötigt keine Anmeldeinformationen, da das System bereits weiß, wer sie ist und was sie darf."

Tom sah skeptisch. "Also authentifiziert sich der Server?"

"Ja. Ohne Passwort. Ohne Schlüssel in einer Konfigurationsdatei. Ohne etwas, das versehentlich in Git committet werden kann."

Dieser letzte Punkt traf Tom. Er hatte vor zwei Wochen eine Datenbankpasswort in der Git-Historie gefunden. Er öffnete einen neuen Browser-Tab.

**IAM-Überprüfung: Das Ganze im Überblick**

Kapitel 3 stellte IAM vor: Benutzer, Gruppen, Rollen und Richtlinien. Jetzt ist es Zeit, tiefer einzutauchen.

IAM-Richtlinien sind JSON-Dokumente, die festlegen, welche Aktionen auf welchen Ressourcen erlaubt oder verboten sind. Sie sehen so aus:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::nimbus-assets/*"
    }
  ]
}
```

Diese Richtlinie erlaubt das Lesen und Schreiben von Objekten im Bucket `nimbus-assets` und nichts anderes. Keine Löschvorgänge. Keine Auflistung von Buckets. Keine andere S3-Operation. Keine andere AWS-Dienstleistung.

Dies ist der richtige Weg, Berechtigungen zu gewähren: spezifische Aktionen, spezifische Ressourcen.

**Das Problem mit „Administratorzugriff“**

AWS-verwaltete Richtlinien wie `AdministratorAccess` sind dafür gedacht, den Einstieg zu erleichtern. Sie sind nicht dafür ausgelegt, Produktionssysteme mit echten Teammitgliedern zu betreiben.

`AdministratorAccess` gewährt jede Aktion auf jeder Ressource. Wenn ein Teammitglied mit dieser Richtlinie einen Fehler macht – beispielsweise versehentlich einen S3-Bucket löscht, eine falsche EC2-Instanz beendet oder Sicherheitsgruppenregeln ändert – kann AWS nichts mehr dagegen tun. Die Berechtigung wurde erteilt.

Wenn die Anmeldedaten eines Teammitglieds kompromittiert werden (Phishing-Angriff, geleakte Zugriffsschlüssel, gestohlten Laptop), kann der Angreifer Administratorzugriff auf alles in Ihrem AWS-Konto erhalten.

„Was sollte Soo-Jin also haben?“, fragte Leo.

„Was muss Soo-Jin tun?“, antwortete Priya.

„Die API bereitstellen. Protokolle prüfen. Nichts anderes.“

„Dann erhält sie: die Möglichkeit, in den Code-Pipeline zu pushen, Lesezugriff auf CloudWatch-Protokolle und nichts anderes.“

„Das ist… sehr spezifisch.“

„Ja, das ist der Punkt.“

**IAM-Rollen: Identitäten für Dienste**

Kapitel 3 stellte Rollen als Möglichkeit für EC2-Instanzen vor, auf AWS-Dienste zuzugreifen, ohne Anmeldeinformationen zu speichern. Lassen Sie uns dies konkretisieren.

Ihre EC2-Instanzen, die die Nimbus API ausführen, müssen:

- Aus DynamoDB lesen (das Menü)
- In DynamoDB schreiben (Bestellungen)
- Objekte in S3 speichern (Quittungen, Uploads)
- Protokolle in CloudWatch schreiben
- Geheimnisse aus Secrets Manager lesen

Anstatt einen Benutzer mit einem Zugriffsschlüssel zu erstellen und diesen Schlüssel auf der EC2-Instanz zu speichern (ein Sicherheitsrisiko – Zugriffsschlüssel können von jedem mit SSH-Zugriff gelesen werden), erstellen Sie eine **IAM-Rolle** für die EC2-Instanz mit genau diesen Berechtigungen.

Die EC2-Instanz übernimmt die Rolle automatisch. AWS stellt vorübergehende Anmeldeinformationen über den Instanzmetadatedienst bereit. Die Anmeldeinformationen werden automatisch rotiert. Kein Zugriffsschlüssel, der ausgeraubt werden kann.

„Und was passiert, wenn jemand in die EC2-Instanz hackt?“, fragte Leo.

„Sie kann das tun, was die EC2-Rolle erlaubt“, sagte Priya. „Was ist die EC2-Rolle? Lesen des Menüs, Schreiben von Bestellungen und Senden von Protokollen. Sie kann keinen S3-Bucket löschen. Sie kann keine EC2-Instanzen beenden. Sie kann nichts mit IAM anfangen.“

„Weil die EC2-Rolle keine dieser Berechtigungen hat.“

„Genau.“

**Rollenübernahme: Wie Dienste andere Dienste nutzen**

Rollen können von:

- **AWS-Diensten** (EC2, Lambda, ECS-Aufgaben usw.)
- **IAM-Benutzern** in Ihrem Konto (Rollenaufgabe – Sie übernehmen eine Rolle mit mehr Berechtigungen für eine bestimmte Aufgabe)
- **IAM-Benutzern in anderen AWS-Konten** (Cross-Account-Zugriff – ein anderes Organisationskonto kann eine Rolle in Ihrem Konto übernehmen)
- **Externen Identitätsanbietern** (Google, Active Directory, Okta – federierter Zugriff für menschliche Benutzer)

Dieses letzte Muster – **Identitätsfederation** – ist, wie große Organisationen ihren Mitarbeitern den Zugriff auf AWS gewähren, ohne für jede Person individuelle IAM-Benutzer zu erstellen. Die Anmeldedaten Ihres Unternehmens befinden sich in Ihrem Active Directory. Wenn Sie sich bei AWS anmelden, authentifizieren Sie sich gegen Active Directory, und AWS gewährt Ihnen eine Rolle.

**Berechtigungsgrenzen: Begrenzung, was Rollen gewähren können**

Hier liegt ein subtiles, aber wichtiges Problem: Standardmäßig verhindert IAM nicht, dass ein Benutzer Berechtigungen gewährt, die er nicht besitzt.

Wenn Soo-Jin `iam:CreatePolicy` und `iam:AttachUserPolicy` hat, könnte sie eine Richtlinie erstellen, die S3-Schreibzugriff gewährt, und diese an sich selbst anhängen – auch wenn ihre bestehenden Richtlinien nur S3-Lesezugriff erlauben. Diese Klasse von Schwachstellen wird als „Privilegsteigerung“ bezeichnet, und das ist genau der Grund, warum Berechtigungsgrenzen existieren.

Aber was, wenn Sie es zulassen möchten, dass ein Teamleiter IAM-Richtlinien erstellen soll, während Sie sicherstellen möchten, dass er keine weiteren Berechtigungen gewähren kann?

**Berechtigungsgrenzen** legen die maximalen Berechtigungen fest, die jemals einem Identitätskonto gewährt werden können. Selbst wenn die Identität überhängende Richtlinien besitzt, sind die effektiven Berechtigungen durch die Berechtigungsgrenze begrenzt.

Beispiel: Sie geben einem Teamleiter eine Richtlinie, die es ihm erlaubt, IAM-Rollen zu erstellen. Aber Sie legen eine Berechtigungsgrenze fest, die besagt: „IAM-Rollen, die von diesem Teamleiter erstellt wurden, dürfen niemals S3-Löschzugriff haben“. Selbst wenn der Teamleiter eine Rolle mit vollem S3-Zugriff erstellt, verhindert die Grenze, dass S3-Löschzugriff wirksam wird.

Dies ist ein fortgeschrittenes Konzept, aber es kommt auf der Prüfung vor und spiegelt wider, wie Organisationen IAM-Verwaltung im großen Maßstab übertragen.

**IAM Access Analyzer: Überprüfung von Berechtigungen**

Priya verbrachte zwei Tage mit der Überprüfung der IAM-Konfiguration des Teams. Sie fand:

- Leo’s persönlicher Benutzer hatte Administratorzugriff (wie entdeckt)
- Eine alte Lambda-Funktion hatte Berechtigungen zum Lesen aller S3-Buckets (übrig von einem Test)
- Eine Dienstrolle hatte Schreibzugriff auf DynamoDB-Tabellen, die nicht mehr existierten

Dies ist normal. IAM-Konfigurationen sammeln im Laufe der Zeit Unordnung.

**IAM Access Analyzer** ist ein AWS-Dienst, der automatisch Ressourcen (S3-Buckets, IAM-Rollen, KMS-Schlüssel, Lambda-Funktionen) identifiziert, die mit externen Entitäten geteilt werden. Er identifiziert auch übermäßig permissive Richtlinien.

```markdown
Regular IAM-Audits sollten Teil Ihrer Operationen sein. Berechtigungen wachsen; sie schrumpfen selten organisch. Der Access Analyzer hilft dabei, das Unsichtbare sichtbar zu machen.

**Die Service Control Policies: Organisationsebenen-Leitpfosten**

Wenn Ihre AWS-Umgebung in mehrere Konten wächst (ein häufiger Musterfall für große Teams – Entwicklungs-, Test- und Produktionskonten), ermöglicht Ihnen **AWS Organizations**, diese zentral von einem Kontrollkonto zu verwalten.

Innerhalb von Organizations wenden **Service Control Policies (SCPs)** Leitpfosten an, die sich auf *jedes* IAM-Entität in dem Konto auswirken, einschließlich Administratoren.

Beispiel SCP: "Niemand im Entwicklungs-Konto darf EC2-Instanzen in der Region eu-west-1 erstellen."

Selbst wenn jemand Administratorrechte im Entwicklungs-Konto hat, darf er diese SCP nicht verletzen. Sie wird auf Organisationsebene durchgesetzt, über dem Kontoebene.

SCPs gewähren keine Berechtigungen – sie beschränken diese. Sie definieren die maximalen Berechtigungen, die jede IAM-Entität in einem Konto jemals haben kann.

## Stärken und Grenzen

**Warum IAM-Rollen und das Prinzip der geringsten Privilegien wichtig sind:**

- Begrenzt den Schadenradius, wenn Anmeldeinformationen kompromittiert werden
- Verlangt von Angreifern, durch mehrere Systeme zu skalieren, anstatt sofort vollen Zugriff zu erlangen
- Bietet eine Nachverfolgungsfunktion – CloudTrail protokolliert, welche Rolle was getan hat
- Erzwingt bewusste Entscheidungen über den Zugriff – „was benötigt dieser Dienst tatsächlich?“

**Wo es kompliziert wird:**

- Das Schreiben präziser IAM-Richtlinien erfordert das Verständnis des AWS-Modells für Aktionen und Ressourcen für jeden Dienst (und jeder Dienst hat Dutzende von Aktionen)
- Übermäßig restriktive Richtlinien unterbrechen Anwendungen – das Debuggen von „Zugriff verweigert“-Fehlern über mehrere Dienste hinweg ist zeitaufwändig
- IAM propagiert Änderungen mit einer leichten Verzögerung (normalerweise Sekunden, manchmal länger) – kann zu verwirrenden Zeitungsfehlern führen
- Cross-Account-Rollen erfordern eine sorgfältige Konfiguration der Vertrauensrichtlinie

## Zusammenfassung

- Vermeiden Sie **Administratorzugriff** in der Produktion – er dient der Einrichtung, nicht dem Betrieb.
- IAM-Richtlinien spezifizieren **Effekt**, **Aktion** und **Ressource** – seien Sie dabei auf allen drei Punkten spezifisch.
- Befestigen Sie Richtlinien an **Gruppen** (für Menschen) und **Rollen** (für Dienste).
- EC2-Instanzen, Lambda-Funktionen und andere AWS-Dienste sollten **IAM-Rollen** verwenden, nicht Zugriffsschlüssel.
- **Berechtigungsgrenzen** begrenzen die maximalen Berechtigungen, die jede Identität unabhängig von angehängten Richtlinien haben kann.
- **SCPs** (Service Control Policies) wenden organisationseinrichtungen an, die selbst Administratoren nicht überschreiben können.
- **IAM Access Analyzer** identifiziert übermäßig permissive Richtlinien und externen Zugriff auf Ressourcen.

## Prüftipps

*SAA-C03 Domain: Design Secure Architectures (Domain 1, Task 1.1)*

- **IAM-Rollen für EC2**: Die kanonische Antwort, wenn EC2 auf S3, DynamoDB, Secrets Manager oder andere AWS-Dienste zugreifen muss. Speichern Sie niemals Zugriffsschlüssel auf einer Instanz.
- **Richtlinienbewertungslogik**: Wenn IAM eine Anfrage bewertet, verwendet es eine explizite Allow/Deny-Hierarchie. Eine explizite **Deny** hat immer Vorrang, auch gegenüber einer expliziten Allow. Der Standard ist Deny.
- **Berechtigungsgrenzen**: Werden verwendet, wenn IAM-Administration delegiert wird. Prüfungsfall: „Erlauben Sie Entwicklern, Rollen für ihre Lambda-Funktionen zu erstellen, aber verhindern Sie, dass sie Berechtigungen gewähren, die über das hinausgehen, was sie haben.“ → Berechtigungsgrenzen.
- **SCPs gewähren keine Berechtigungen**: Sie beschränken nur. Wenn eine SCP S3 zulässt, aber eine IAM-Richtlinie dies verweigert, wird S3 verweigert. Wenn eine SCP S3 verweigert, aber eine IAM-Richtlinie dies zulässt, wird S3 verweigert.
- **Ressourcenbasierte Richtlinien**: Einige AWS-Dienste (S3, SQS, Lambda) haben ressourcenbasierte Richtlinien – Berechtigungen, die an die Ressource angehängt sind, nicht an die Identität. Diese arbeiten parallel zu IAM-Richtlinien.
- **Cross-Account-Zugriff**: IAM-Rolle in Konto A mit einer Vertrauensrichtlinie, die Konto B zum Übernehmen erlaubt. Konto B’s Benutzer/Rolle verwendet dann `sts:AssumeRole`, um vorübergehende Anmeldeinformationen in Konto A zu erhalten.
- **IAM-Benutzer vs. Federated Access**: Für große Organisationen ist Federated Access (über IAM Identity Center oder direkte Federierung mit einem IdP) gegenüber einzelnen IAM-Benutzern vorzuziehen.

## Übungen

**Übung 1 – Erinnerung**

Erklären Sie den Unterschied zwischen einer IAM-Richtlinie, die an einen Benutzer angehängt ist, und einer IAM-Rolle, die von einer EC2-Instanz angenommen wird. Wann würden Sie jede verwenden?

*(Hinweis: Denken Sie über Anmeldeinformationen nach – wo leben sie und wer verwaltet ihre Rotation?)*

**Übung 2 – Prüfungsübung**

*Szenario*: Eine Lambda-Funktion muss aus einem S3-Bucket lesen und in eine DynamoDB-Tabelle schreiben. Ein Entwickler hat der Lambda-Funktion aus Einfachheit während der Entwicklung eine Rolle mit `AdministratorAccess` zugewiesen. Bevor sie in die Produktion überführt wird, möchte das Sicherheitsteam das Prinzip der geringsten Privilegien befolgen.

Welche der folgenden Optionen ist die BESTE?

A) Erstellen Sie einen neuen IAM-Benutzer mit S3-Lese- und DynamoDB-Schreibberechtigungen; generieren Sie einen Zugriffsschlüssel; speichern Sie den Schlüssel in den Lambda-Umgebungsvariablen
B) Hängen Sie eine Inline-Richtlinie zur Ausführungsrolle der Lambda-Funktion an, die `s3:GetObject` auf dem angegebenen Bucket und `dynamodb:PutItem` auf der angegebenen Tabelle gewährt
C) Behalten Sie `AdministratorAccess` bei, aber fügen Sie eine SCP hinzu, die alle Aktionen außer S3 und DynamoDB blockiert
D) Erstellen Sie eine IAM-Gruppe mit S3-Lese- und DynamoDB-Schreibberechtigungen und fügen Sie die Lambda-Funktion zur Gruppe hinzu

**Hinweis 1**: Lambda-Funktionen verwenden Ausführungsrollen, nicht Zugriffsschlüssel. Welche Option respektiert dies?
```

**Hinweis 2**: Least privilege bedeutet spezifische Aktionen auf spezifischen Ressourcen, nicht breite Richtlinien.

**Hinweis 3**: IAM-Gruppen enthalten Benutzer, nicht Lambda-Funktionen.

**Antwort**: B

**Erläuterung**: Die Lambda-Ausführungsrolle sollte nur die spezifischen Berechtigungen haben, die die Funktion benötigt. Inline-Richtlinien, die auf spezifische Aktionen (`s3:GetObject`) und spezifische Ressourcen (die Bucket-ARN, die DynamoDB-Tabelle ARN) zugeschnitten sind, stellen die least-privilege-Implementierung dar.

**Warum nicht A?** Der Speicherung von Zugriffsschlüsseln in Lambda-Umgebungsvariablen ist ein Sicherheitsrisiko – die Schlüssel können von jedem mit Lambda-Konsole-Zugriff oder über den Ausführungskontext gelesen werden. Lambda-Funktionen verwenden Ausführungsrollen mit temporären Anmeldeinformationen von IAM.

**Warum nicht C?** SCPs (Service Control Policies) gelten auf Organisations- oder Kontobeständen und funktionieren nicht als per-Funktion-Berechtigungssteuerung. AdministratorAccess mit einem SCP ist die falsche Ebene.

**Warum nicht D?** Lambda-Funktionen können nicht zu IAM-Gruppen hinzugefügt werden. Gruppen sind nur für IAM-Benutzer bestimmt.

*SAA-C03 Domain: Gestaltung sicherer Architekturen – Aufgabe 1.1*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nimbus hat sich auf drei Teams entwickelt: das Kern-API-Team, das Restaurant-Partner-Portal-Team und das Analyse-Team. Jedes Team hat fünf Entwickler und stellt in einem gemeinsamen AWS-Konto bereit.

Gestalten Sie eine IAM-Struktur, die:

- Jedes Team Zugriff auf nur seine Dienste gewährt
- Das Analyse-Team daran hindert, in Produktionsdatenbanken zu schreiben
- Ein Teamleiter in jedem Team in der Lage ist, IAM-Rollen für seine Dienste zu erstellen, aber nicht seine eigenen Berechtigungen zu erhöhen
- Eine Admin-Gruppe für das Plattform-Team bereitstellt, die alle Dienste verwalten kann

Welche IAM-Konstrukte würden Sie verwenden? Wo würden die Berechtigungsgrenzen angewendet?

*(Es gibt keine einzelne richtige Antwort. Das Ziel ist es, die mehrteamige IAM-Design-Praxis zu üben.)*

## Szenario nach den Credits

Leo verbrachte das Wochenende damit, IAM neu zu gestalten.

Dienstagmorgen hatte jeder Dienst eine Rolle mit genau den Berechtigungen, die er benötigte. Soo-Jin und Rafael hatten Gruppenmitgliedschaften, die ihren tatsächlichen Jobfunktionen entsprachen. Leo selbst hatte Administratorzugriff aufgegeben und eine Rolle verwendet, die er entworfen hatte – mit Berechtigungen, um seine Arbeit zu erledigen, und nichts mehr.

Es hatte länger gedauert als erwartet.

Priya überprüfte seine Arbeit am Dienstagmorgen. Sie las die Richtliniendokumente sorgfältig durch.

"Das ist gut", sagte sie.

"Danke", sagte Leo, mit der Erleichterung von jemandem, der das Wochenende damit verbracht hatte, sich von JSON demütigen zu lassen.

"Du hast eine Sache vergessen."

Leo erstarrte.

"Der alte Bereitstellungsschlüssel aus der ersten Version. In einem GitHub Actions Secret."

"Dieser wurde deaktiviert."

Priya tippte etwas. "War es?"

Eine Pause.

"Ich deaktiviere ihn", sagte Leo.

"Die CloudTrail-Protokolle zeigen, dass er letzte Woche drei API-Aufrufe gemacht hat."

Eine längere Pause.

"Etwas hat ihn benutzt", sagte Leo. "Ich werde untersuchen."

Im nächsten Kapitel: Der Unterschied zwischen einem Sicherheitsbeamten, der Gesichter kennt, und einer Tür, die nur Ausweise liest.
