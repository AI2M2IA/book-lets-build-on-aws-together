# Kapitel 3: Wer sind Sie eigentlich?

Leo drückte auf Deploy.

Das Terminal antwortete mit zwei Wörtern: Access Denied.

Er versuchte es erneut. Gleiches Ergebnis. Er arbeitete seit drei Wochen bei Nimbus, hatte am ersten Tag Zugang zum AWS-Konto erhalten und hatte ohne Probleme in die Staging-Umgebung deployt. Aber das hier war Produktion. Und Produktion war anscheinend anders.

Maya schaute über seine Schulter auf die Fehlermeldung. "Wer hat Ihnen diese Berechtigung gegeben?"

Leo drehte sich um. "Welche Berechtigung?"

"Die Berechtigung, in Produktion zu deployen. Wer hat das eingerichtet?"

Leo öffnete die AWS-Konsole und klickte sich durch die Menüs. Niemand hatte das getan. Es gab keine Policy, keine Rolle, keine explizite Genehmigung. Es gab auch keine explizite Ablehnung — nur eine Abwesenheit. Niemand bei Nimbus hatte sich jemals hingesetzt und darüber nachgedacht, wer was tun konnte.

Das war das Problem.

**Das Problem mit Passwörtern**

Passwörter sind ein schlechtes Modell für Computersysteme.

Nicht weil sie immer schwach sind. Weil sie binär sind: Entweder haben Sie das Passwort oder nicht. Wenn Sie es haben, können Sie alles tun, was das Konto tun darf.

Das ist in Ordnung für einen einzelnen Nutzer auf seinem persönlichen Laptop. Es ist katastrophal für die Cloud-Infrastruktur eines Unternehmens.

Bedenken Sie, was Nimbus verwalten muss: den Webserver, die Datenbank, den Dateispeicher, die Netzwerke, Abrechnungswarnungen, Benutzerkonten. Wenn alles durch ein Passwort — oder auch nur einen Satz von Anmeldedaten — geschützt ist, dann bekommt jeder, der dieses Passwort erhält, alles.

Und "alles" in AWS bedeutet die Fähigkeit, Datenbanken zu löschen. Server zu starten, die eine Rechnung von 50.000 Dollar erzeugen. Jeden Kundendatensatz zu stehlen. Backup-Daten zu vernichten.

Priya beschrieb das nicht in ruhigen, abstrakten Begriffen. Sie erzählte es als Geschichte über ein Startup, das einen Sicherheitsvorfall hatte, in 24 Stunden eine AWS-Rechnung von 80.000 Dollar von Angreifern erhielt, die Kryptowährungen auf seinem Konto schürften, und drei Monate später schloss.

Der Raum war still.

"Was ist die Alternative?" fragte Tom.

**Das Konzept: Identity and Access Management**

Die Alternative ist ein System, bei dem Sie nicht jedem denselben Schlüssel geben. Sie geben jeder Person — und jedem Dienst — genau den Zugang, den sie für ihre Arbeit benötigen. Nicht mehr, nicht weniger.

In AWS heißt dieses System **IAM**: Identity and Access Management.

Stellen Sie sich IAM wie das Kartensystem in einem großen Bürogebäude vor.

Das Gebäude hat Dutzende von Etagen. Der Serverraum ist in Etage 12. Das Finanzbüro ist in Etage 8. Die Chefetage ist in Etage 20. Jeder Mitarbeiter hat eine Zugangskarte, aber jede Karte öffnet nur die Türen, die der Mitarbeiter für seine Arbeit braucht. Der Praktikant kann nicht in den Serverraum schlüpfen. Die Buchhalterin kann nach Feierabend nicht auf die Führungsetage zugreifen.

IAM funktioniert genauso. Sie definieren, wer existiert (Identitäten), was sie tun dürfen (Berechtigungen) und wenden diese Berechtigungen über Policies an.

**Die Bausteine von IAM**

IAM hat vier Kernkonzepte. Sie bauen aufeinander auf.

**Users** sind individuelle Identitäten. Maya hat einen IAM-User. Tom hat einen IAM-User.
Jeder User hat eigene Anmeldedaten — und sollte nur die Berechtigungen haben, die er
spezifisch benötigt.

**Groups** sind Sammlungen von Users. Anstatt Berechtigungen für Maya, Tom, Priya und Leo
einzeln festzulegen, erstellen Sie eine "Developers"-Gruppe mit Entwicklerberechtigungen
und fügen sie hinzu. Wenn eine fünfte Person beitritt, fügen Sie sie zur Gruppe hinzu und
sie erbt sofort die richtigen Berechtigungen.

**Roles** sind temporäre Identitäten, die von etwas *übernommen* werden können — einer Person,
einem Dienst oder einem anderen AWS-Konto. Wir gehen in Kapitel 14 ausführlich auf Rollen ein.
Vorerst gilt: Wenn ein User ein dauerhafter Mitarbeiter ist, ist eine Role ein Besucherausweis.
Sie gewährt bestimmten Zugang für eine bestimmte Zeit oder einen bestimmten Zweck.

**Policies** sind die eigentlichen Berechtigungsregeln. Eine Policy ist ein Dokument (intern in JSON
geschrieben, aber Sie müssen das Format nicht auswendig lernen), das besagt: "Der Inhaber dieser
Policy darf Aktion X auf Ressource Y ausführen." Oder "Aktion Z ist VERBOTEN."

Das IAM-Auswertungsmodell lautet: Standardmäßig ist alles abgelehnt. Berechtigungen müssen
explizit gewährt werden. Wenn eine Policy nicht besagt, dass Sie etwas tun können, können Sie es nicht.

**Das Prinzip der geringsten Rechte**

Dies ist das wichtigste Konzept in der gesamten Sicherheit, nicht nur in IAM.

**Geben Sie Personen und Systemen nur den Zugang, den sie für ihre Arbeit benötigen. Nicht mehr.**

Priya nannte das "das Prinzip der geringsten Rechte". Es klingt offensichtlich. In der Praxis
verletzt es die meisten Teams ständig — nicht böswillig, sondern aus Bequemlichkeit.

"Können wir Leo einfach Admin-Zugang geben, damit er Dinge schneller deployen kann?"

Nein.

"Können wir einfach das Root-Konto für alles verwenden?"

Auf keinen Fall.

Das Root-Konto ist der Hauptschlüssel zu Ihrem gesamten AWS-Konto. Es kann alles tun,
einschließlich des Schließens des Kontos selbst. Sie sollten es einmal erstellen, Multi-Faktor-
Authentifizierung einrichten und es dann nie wieder für die tägliche Arbeit verwenden.

Priya erstellte an diesem Nachmittag separate IAM-User für alle. Sie gab Leo Berechtigungen,
in die Entwicklungsumgebung zu deployen. Nicht Produktion. Nicht Abrechnung. Nicht Netzwerke.
Nur das Deployment.

"Das fühlt sich einschränkend an", sagte Leo.

"Daran erkennt man, dass es richtig ist", antwortete Priya.

**Was passiert, wenn man das falsch macht**

Drei Szenarien, in zunehmender Schwere:

**Szenario 1**: Ein Mitarbeiter mit Admin-Zugang verlässt das Unternehmen. Niemand deaktiviert
sein Konto. Drei Monate später hat er immer noch Zugang. Das passiert ständig.
IAM löst es: Sie deaktivieren den User. Sofort, überall.

**Szenario 2**: Der Laptop eines Entwicklers wird kompromittiert. Der Angreifer findet AWS-Anmeldedaten
in einer Konfigurationsdatei mit vollständigen Admin-Berechtigungen. Weil die Anmeldedaten breiten
Zugang haben, kann der Angreifer alles tun: Kryptowährungen schürfen, Daten stehlen, Backups löschen.
Mit geringsten Rechten: Die Anmeldedaten funktionieren nur für ihren begrenzten Bereich. Der
Schadensradius ist begrenzt.

**Szenario 3**: Eine schlecht geschriebene Anwendung legt versehentlich AWS-Anmeldedaten in ihren
Logs offen. Wenn diese Anmeldedaten breiten Zugang haben, haben Sie einen katastrophalen Verstoß.
Wenn sie engen Zugang haben — nur zu dem spezifischen S3-Bucket, den die Anwendung benötigt —
ist die Offenlegung begrenzt und eingedämmt.

Das Muster: Zugang sollte immer auf das Minimum beschränkt sein. Immer. Nicht weil Sie Ihren
Leuten misstrauen, sondern weil Sie nicht kontrollieren können, was mit kompromittierten Anmeldedaten passiert.

**Multi-Faktor-Authentifizierung: Das zweite Schloss**

Noch ein Konzept, bevor wir das Kapitel schließen.

Selbst mit geringsten Rechten können Anmeldedaten gestohlen werden. Passwörter können geraten,
durch Phishing abgefangen oder geleakt werden. IAM adressiert dies mit **Multi-Faktor-Authentifizierung (MFA)**.

MFA erfordert etwas, das Sie *wissen* (Passwort) plus etwas, das Sie *haben* (ein Telefon, ein
Hardware-Schlüssel). Selbst wenn ein Angreifer Ihr Passwort stiehlt, kann er sich nicht ohne
Ihr Telefon einloggen.

MFA sollte für jeden IAM-User aktiviert sein. Es ist nicht verhandelbar für das Root-Konto.

Priya verbrachte den Nachmittag damit, es für alle einzurichten.

Tom fragte, ob das zu viel Reibung sei. Priya zeigte die Verstoßgeschichte erneut.

Tom richtete MFA sofort ein.

## Stärken und Einschränkungen

**IAM ist das richtige Werkzeug für**: die Kontrolle, wer und was auf jede AWS-Ressource zugreifen kann; die Implementierung von geringsten Rechten über Users, Dienste und kontoübergreifende Grenzen hinweg; die Erstellung eines Prüfpfads jedes API-Aufrufs durch CloudTrail-Integration; die Eliminierung der Notwendigkeit, langlebige Anmeldedaten zwischen Systemen zu teilen.

**Wo IAM schwierig wird**: IAM-Policies können in Hunderte von Aussagen über Dutzende von Rollen anwachsen, und das Debuggen eines "Access Denied"-Fehlers erfordert das Verstehen, welche dieser Policies die effektive ist — eine Aufgabe, die schwieriger ist, als sie klingt. Der häufigste IAM-Fehler ist nicht zu wenig Zugang — es ist zu viel. Überpermissive Policies, die erstellt wurden, um "es einfach funktionieren zu lassen", werden zu Sicherheitsverbindlichkeiten, die schwer rückgängig zu machen sind. Schreiben Sie zuerst die minimale Berechtigung. Erweitern Sie nur, wenn etwas fehlschlägt.

## Zusammenfassung

- **IAM** (Identity and Access Management) ist die Art, wie Sie steuern, wer in AWS was tun kann.
- Die Kernbausteine sind: **Users** (Einzelpersonen), **Groups** (Sammlungen von Users),
  **Roles** (temporäre Identitäten) und **Policies** (Berechtigungsregeln).
- Standardmäßig ist in AWS alles **abgelehnt**. Berechtigungen müssen explizit gewährt werden.
- Das **Prinzip der geringsten Rechte** bedeutet, jeder Identität nur den Zugang zu geben, den sie
  benötigt. Nicht mehr.
- Das **Root-Konto** kann alles tun, einschließlich katastrophaler Dinge. Sichern Sie es hinter
  MFA und verwenden Sie es so wenig wie möglich.
- Aktivieren Sie **MFA** für jeden IAM-User. Nicht verhandelbar.

## Prüfungstipps

*SAA-C03-Domäne 1 — Aufgabe 1.1 (sicherer Zugang zu AWS-Ressourcen)*

- **Alles ist standardmäßig abgelehnt.** Ein explizites "Allow" ist erforderlich. Wenn eine Policy
  eine Aktion nicht erwähnt, ist die Aktion abgelehnt.
- **Explizites Deny gewinnt immer.** Wenn irgendeine Policy in der Kette eine Aktion ablehnt, kann
  dieses Deny nirgendwo anders in der Kette durch ein Allow außer Kraft gesetzt werden. Das überrascht
  viele Kandidaten.
- **Root-Konto ≠ IAM-Admin.** Das Root-Konto ist ein separates Credential von IAM.
  Sie können das Root-Konto nicht löschen. Sie *können* (und sollten) einschränken, wann es verwendet wird.
- **IAM ist global**, nicht regional. IAM-Users, Groups, Roles und Policies existieren
  über das gesamte AWS-Konto, nicht pro Region.
- **Roles sind der bevorzugte Weg, AWS-Diensten Zugang zu gewähren.** Wenn eine EC2-Instance
  auf S3 zugreifen muss, fügen Sie eine IAM-Role an die Instance an — Sie speichern keine
  Anmeldedaten auf der Maschine. Dieses Muster erscheint ständig in der Prüfung.

## Übungen

**Übung 1 — Wiederholung**

Erklären Sie mit eigenen Worten: Was ist der Unterschied zwischen einem IAM-User, einer Group und einer Role?
Wann würden Sie welche verwenden?

*(Hinweis: Denken Sie an die Gebäude-Kartenanalogie — welche ist eine permanente Karte,
welche ist eine Abteilungsgruppierung und welche ist ein Besucherausweis?)*

**Übung 2 — Prüfungsübung**

*Szenario*: Ein Unternehmen betreibt eine Webanwendung auf EC2-Instances, die Dateien aus einem
S3-Bucket lesen müssen. Ein Junior-Entwickler schlägt vor, AWS-Zugriffsschlüssel direkt im
Anwendungscode auf den EC2-Instances zu speichern. Das Sicherheitsteam widerspricht.

Was ist die SICHERSTE und betrieblich angemessenste Lösung?

A) Die Zugriffsschlüssel in Umgebungsvariablen auf der EC2-Instance anstatt im Code speichern  
B) Einen dedizierten IAM-User mit S3-Leseberechtigungen erstellen und die Anmeldedaten
   mit dem Entwicklungsteam teilen  
C) Eine IAM-Role mit den entsprechenden S3-Leseberechtigungen direkt an die EC2-Instances anfügen  
D) Die Root-Konto-Anmeldedaten verwenden, um der Anwendung vollständigen Zugang zu allen AWS-Ressourcen zu geben

**Hinweis 1**: Das Problem beim Speichern von Anmeldedaten irgendwo auf der Instance ist,
dass Anmeldedaten geleakt werden können. Gibt es eine Möglichkeit, der EC2-Instance Zugang zu geben,
ohne überhaupt Anmeldedaten zu verwenden?

**Hinweis 2**: AWS hat einen Mechanismus, bei dem Diensten Berechtigungen ohne statische Anmeldedaten
gewährt werden können. Wie heißt dieser Mechanismus?

**Hinweis 3**: IAM-Roles können an EC2-Instances angehängt werden. Wenn das der Fall ist, erhält die
Instance automatisch temporäre Anmeldedaten, die von AWS rotiert werden. Keine statischen Anmeldedaten nötig.

**Antwort**: C

**Erklärung**: Eine IAM-Role an eine EC2-Instance anzuhängen ist das richtige Muster.
Die Instance erhält automatisch temporäre, rotierende Anmeldedaten über den EC2-Metadata-Dienst.
Es gibt keine langlebigen Anmeldedaten, die geleakt, rotiert oder versehentlich in ein Repository eingecheckt werden könnten.

**Warum nicht A?** Umgebungsvariablen auf einer EC2-Instance können immer noch geleakt werden —
durch Anwendungslogs, Debug-Endpunkte oder wenn die Instance kompromittiert wird.
Statische Anmeldedaten sind das Problem, nicht ihr Speicherort.

**Warum nicht B?** Das Erstellen eines gemeinsamen IAM-Users und das Verteilen von Anmeldedaten
an ein Team verletzt die geringsten Rechte und macht die Credential-Rotation zu einem Albtraum.
Wenn eine Person das Unternehmen verlässt, können Sie ihren Zugang nicht einfach widerrufen,
ohne gemeinsame Anmeldedaten zu ändern.

**Warum nicht D?** Die Verwendung von Root-Konto-Anmeldedaten für eine Anwendung ist ein schwerer
Sicherheitsverstoß. Das Root-Konto hat unbegrenzten Zugang und seine Anmeldedaten sollten
niemals die Kontrolle des Kontoinhabers verlassen.

*SAA-C03-Domäne 1 — Aufgabe 1.1 (IAM-Roles, geringste Rechte)*

**Übung 3 — Architekturherausforderung** *(Optional)*

Nimbus stellt im nächsten Monat drei neue Entwickler ein. Jeder wird verschiedene Zugangsstufen
benötigen: einer arbeitet an der Datenbankschicht, einer an den Anwendungsservern, einer an den
Front-End-Staticfiles. Es gibt auch eine CI/CD-Pipeline, die Code deployen muss.

Entwerfen Sie eine IAM-Struktur für dieses Szenario. Welche Users, Groups, Roles und Policies
würden Sie erstellen? Was wäre die wichtigste Grenze für geringste Rechte, die durchgesetzt werden sollte?

*(Es gibt keine einzige richtige Antwort. Denken Sie daran, den Schadensradius zu minimieren,
wenn eine Identität kompromittiert wird.)*

## Post-Credits-Szene

Am Ende des Tages hatte jeder IAM-User MFA aktiviert. Leos Konto war auf Entwicklerzugang
reduziert worden: in die Entwicklungsumgebung deployen, aus dem gemeinsamen Konfigurations-Bucket lesen,
nichts anderes.

Er hatte einmal versucht, auf die Produktionsdatenbank zuzugreifen.

Access Denied.

"Ist das das Gefühl, vertraut aber nicht zu sehr zu sein?" fragte er.

"Das ist genau das Gefühl", sagte Priya.

Am nächsten Morgen kam Tom früh an und fand etwas, das ihn sofort das Team einberufen ließ.

Auf der AWS-Konsole konnte er sehen, dass ihre Website Traffic erhielt. Mehr als erwartet.
Und der Webserver — Leos ursprünglicher — lief heiß. Wirklich heiß.

"Wir haben hundert gleichzeitige Nutzer", sagte Tom. "Und einen Server."

Im nächsten Kapitel: der erste Server — das Mieten eines Computers im Rechenzentrum von jemand anderem.
