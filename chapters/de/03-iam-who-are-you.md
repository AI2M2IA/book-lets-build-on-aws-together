# Kapitel 3: Wer sind Sie eigentlich?

Es war kurz nach neun Uhr morgens. Leo saß seit sieben Uhr an seinem Schreibtisch, der Kaffee neben der Tastatur war kalt geworden. Das Büro war ruhig — Maya war noch nicht angekommen, Tom war in einem Telefonat. Draußen mähte jemand einen Rasen.

Leo tippte den Befehl noch einmal ein.

Das Terminal gab zwei Wörter zurück: Access Denied.

Die Singapur-Krise lag hinter ihnen. Die Region war korrigiert, der Server lief in us-west-2, und das Team fühlte sich kurzzeitig kompetent. Dieses Gefühl hatte ungefähr achtundvierzig Stunden gehalten, bevor das neue Problem auftauchte: Leo konnte nicht in die Produktion deployen. Niemand hatte seine Berechtigungen eingerichtet. Niemand hatte irgendjemandes Berechtigungen eingerichtet. Das AWS-Konto war auf Root-Ebene weit offen und überall sonst fest verschlossen, und niemand hatte es bemerkt, weil es niemand versucht hatte.

"Ich habe es schon deployed — oh", murmelte Leo und scrollte in seinem Terminal zurück. Er hatte eine Woche lang in das deployed, was er für Produktion hielt. Es war Staging. Die echte Produktionsumgebung war nie berührt worden.

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

Und "alles" in AWS bedeutet die Fähigkeit, Datenbanken zu löschen. Server zu starten, die eine Rechnung von 50.000 Dollar erzeugen. Jeden Kundendatensatz zu exfiltrieren. Backup-Daten zu vernichten.

Es gibt ein weiteres Problem über die binäre Natur von Passwörtern hinaus: Passwörter sind statisch. Sie laufen nicht automatisch ab. Sie werden oft über Dienste hinweg wiederverwendet. Sie werden aufgeschrieben. Sie werden in Tabellen gespeichert, die mit "Passwörter NICHT TEILEN" beschriftet sind. Sie werden trotzdem geteilt, weil Bequemlichkeit über Sicherheit siegt, wenn der Sicherheitsmechanismus Reibung ist.

Das Problem der "geteilten Anmeldedaten" ist kein Charakterfehler. Es ist ein Systemproblem. Wenn die einzige Möglichkeit, jemandem temporären Zugang zu einem System zu gewähren, darin besteht, ihm das permanente Passwort zu geben, teilen Menschen Passwörter. Die Lösung besteht darin, ein System zu bauen, in dem temporärer, eingegrenzter Zugang die Voreinstellung ist — kein Behelf, der heroischen Aufwand erfordert.

Das ist es, was IAM tut. Nicht nur "bessere Passwörter", sondern ein grundlegend anderes Modell, in dem Zugang durch Identität und Policy definiert wird statt dadurch, wer eine Zeichenkette kennt.

Priya beschrieb das nicht in ruhigen, abstrakten Begriffen. Sie beschrieb es als Geschichte.

**Der Verstoß, der in vier Stunden 80.000 Dollar kostete**

Ein Entwickler bei einem Startup pushte ein GitHub-Actions-Deployment-Skript in sein öffentliches Repository. Das Skript enthielt fest codierte AWS-Anmeldedaten als Umgebungsvariablen — ein Fehler, der häufig genug ist, um eine eigene Kategorie in Post-Mortems zur Cloud-Sicherheit zu haben. Die Anmeldedaten hatten vollständigen Admin-Zugang zum AWS-Konto des Unternehmens, weil jemand sie sechs Monate zuvor so konfiguriert hatte, um sich nicht mit IAM-Policies befassen zu müssen.

Die Anmeldedaten waren ungefähr sechs Minuten lang in der Datei, bevor ein automatisierter Scanner — betrieben von einem Angreifer, nicht von einem Sicherheitsforscher — sie fand.

Der Scanner indexierte die Anmeldedaten, bewertete die Kontoberechtigungen und begann, GPU-Instanzen in mehreren Regionen zu starten. GPU-Instanzen sind teuer. Sie sind auch nützlich für das Schürfen von Kryptowährungen. Innerhalb der ersten Stunde liefen siebenundvierzig `p3.8xlarge`-Instanzen über `us-east-1`, `eu-west-1` und `ap-southeast-1`.

Eine `p3.8xlarge` kostet etwa 12 Dollar pro Stunde. Siebenundvierzig davon kosteten 564 Dollar pro Stunde.

Als der Abrechnungsalarm des Startups ausgelöst wurde — konfiguriert auf 1.000 Dollar pro Tag, was niemand für nötig gehalten hatte, enger einzustellen —, waren vier Stunden vergangen. Die Rechnung näherte sich 2.200 Dollar und stieg weiter.

Als jemand verstand, was vor sich ging, und die Anmeldedaten widerrief, hatte die Rechnung für diese wenigen Stunden 3.400 Dollar erreicht. Aber die wahren Kosten kamen später: Das Audit ergab, dass der Angreifer bereits seit Wochen geschürft hatte, leise, nachts, mit einem zweiten Satz geleakter Anmeldedaten, den niemand bemerkt hatte. Gesamtschaden, als das Audit abgeschlossen war: über 80.000 Dollar.

"Und sie haben dichtgemacht?" fragte Tom.

"Drei Monate später", sagte Priya. "Die Investoren stiegen aus. Der Verstoß wurde offengelegt. Die Pressberichterstattung machte das Fundraising unmöglich."

Der Raum war still.

"Was ist also die Alternative?" fragte Tom.

**Das Konzept: Identity and Access Management**

Die Alternative ist ein System, bei dem Sie nicht jedem denselben Schlüssel geben.

Stellen Sie sich ein Bürogebäude vor, in dem jede Etage verschiedene Bereiche hat und jeder Mitarbeiter eine Zugangskarte hat, die nur die Türen öffnet, die er für seine Arbeit braucht. Die Zugangskarte des Praktikanten funktioniert in der dritten Etage. Die Zugangskarte der Buchhalterin öffnet das Finanzbüro, aber nicht den Serverraum. Niemand geht durch eine Tür, durch die er keinen Grund hat zu gehen.

Das ist das Modell, das AWS verwendet.

AWS nennt dieses System **IAM**: Identity and Access Management.

IAM ist das Kartensystem für Ihr gesamtes Cloud-Konto. Sie definieren, wer existiert (Identitäten), was sie tun dürfen (Berechtigungen), und wenden diese Berechtigungen über Policies an. Das Gebäude hat Dutzende von Etagen. IAM stellt sicher, dass jede Person nur die Etagen erreichen kann, die sie braucht.

Die Kartenanalogie reicht weiter. In einem gut geführten Gebäude wissen Sie zu jedem Zeitpunkt, wer Zugang zu was hat. Sie können einen Bericht drucken: Hier sind die Zugangsrechte jeder Zugangskarte. Hier ist, wer in den letzten 30 Tagen im Serverraum war. Hier sind die Karten, die seit 90 Tagen nicht benutzt wurden (ein möglicher Hinweis auf die Karte eines ausgeschiedenen Mitarbeiters, die nicht deaktiviert wurde).

IAM bietet dieselbe Sichtbarkeit. Jede über IAM ausgeführte Aktion — jeder API-Aufruf, jede Konsolenanmeldung, jede Berechtigungserteilung — wird in **AWS CloudTrail** protokolliert. Wenn Sie wissen müssen, wer um 2 Uhr nachts an einem Dienstag eine Datenbank gelöscht hat, hat CloudTrail die Antwort. Wenn Sie einem Prüfer nachweisen müssen, dass nur autorisierte Nutzer Zugang zu Produktionssystemen hatten, liefert CloudTrail die Beweise.

AWS CloudTrail führt automatisch einen 90-Tage-Verlauf von Verwaltungsereignissen, lesbar von der Konsole. Aber 90 Tage erweisen sich oft als nicht ganz ausreichend, wenn Ihr Sicherheitsteam etwas aus dem letzten Quartal prüfen muss. Für persistente, langfristige Protokollierung — und für Alarme — müssen Sie einen **Trail** erstellen, der alle Ereignisse in einen S3-Bucket schreibt und an CloudWatch Logs streamen kann. Der Trail ist nicht automatisch; er ist etwas, das Sie einmal konfigurieren und dann vergessen. Bis Sie ihn brauchen.

Die Kombination aus den Zugangskontrollen von IAM und der Audit-Protokollierung von CloudTrail ist das, was großen Organisationen erlaubt, AWS-Konten in großem Maßstab mit Zuversicht zu betreiben: Zugang wird von IAM definiert und durchgesetzt; jede Ausübung dieses Zugangs wird von CloudTrail aufgezeichnet.

**Die Krankenhaus-Analogie**

Hier ist eine zweite Möglichkeit, darüber nachzudenken — eine, die die Zugangshierarchie intuitiver macht.

Stellen Sie sich ein Krankenhaus vor. Nicht nur das physische Gebäude, sondern die vollständige organisatorische Struktur aus Menschen, Rollen und Daten.

Die **Empfangskraft** kann Patiententerminpläne und Versicherungsinformationen sehen. Sie kann Patienten ein- und auschecken. Sie kann nicht auf Krankenakten zugreifen, kann keine Verordnungen ändern, kann keine Operationshistorien einsehen.

Die **Krankenpflegekraft** kann auf Krankenakten von Patienten ihrer Station zugreifen. Sie kann Medikamente nach ärztlicher Anordnung verabreichen. Sie kann keine Medikamente verschreiben. Sie kann keine Operationen autorisieren.

Die **Ärztin** kann Krankenakten einsehen und ändern, Verordnungen ausstellen und Tests anordnen. Sie kann nicht auf das Gehaltsabrechnungssystem zugreifen. Sie kann die Verordnungen anderer Ärzte nicht ohne eine spezifische Übersteuerung ändern.

Die **Chirurgin** kann auf die Systeme des Operationssaals zugreifen. Sie hat spezifische Berechtigungen für chirurgische Aufzeichnungen, die die meisten Ärzte nicht brauchen.

Das **Reinigungspersonal** kann auf Grundrisse und Raumpläne zugreifen. Es kann auf keine Patientendaten zugreifen.

Jede Person im Krankenhaus hat den Zugang, den sie für ihre Arbeit braucht — und nur diesen. Die Empfangskraft hat keinen chirurgischen Zugang. Das Reinigungspersonal sieht keine Patientenakten. Und entscheidend: Wenn die Zugangskarte eines Mitglieds des Reinigungspersonals gestohlen wird, bekommt der Angreifer Reinigungspläne. Er bekommt keine Patientenakten. Der Schadensradius des Verstoßes ist auf das beschränkt, worauf diese Zugangskarte zugreifen konnte.

So funktioniert IAM. Jede Identität — jeder Nutzer, jeder Dienst, jeder automatisierte Prozess — bekommt genau die Berechtigungen, die sie braucht. Nicht mehr.

Tom lehnte sich zurück. "Leo ist also die Pflegekraft, und ich bin der Buchhalter."

"So in der Art", sagte Priya. "Und keiner von Ihnen ist der Chirurg."

"Wer ist der Chirurg?"

"Niemand, im Tagesgeschäft", sagte Priya. "Das Root-Konto ist der Chirurg. Es kommt nur für spezifische, dokumentierte Verfahren heraus."

**Die Bausteine von IAM**

IAM hat vier Kernkonzepte. Sie bauen aufeinander auf.

**Users** sind individuelle Identitäten. Maya hat einen IAM-User. Tom hat einen IAM-User. Jeder User hat eigene Anmeldedaten — und sollte nur die Berechtigungen haben, die er spezifisch benötigt.

Ein IAM-User hat zwei Arten von Anmeldedaten: ein **Passwort** für den Konsolenzugang (das Einloggen in die AWS-Weboberfläche) und **Access Keys** (eine Key-ID und ein Secret Key) für programmatischen Zugang über die CLI oder SDKs. Sie brauchen nicht immer beide. Ein Entwickler, der nur die CLI nutzt, braucht kein Konsolenpasswort. Ein nicht-technischer Nutzer, der nur die Konsole braucht, braucht keine Access Keys. Gewähren Sie nur, was nötig ist.

**Groups** sind Sammlungen von Users. Anstatt Berechtigungen für Maya, Tom, Priya und Leo einzeln festzulegen, erstellen Sie eine "Developers"-Gruppe mit Entwicklerberechtigungen und fügen sie hinzu. Wenn eine fünfte Person beitritt, fügen Sie sie zur Gruppe hinzu und sie erbt sofort die richtigen Berechtigungen.

Der praktische Vorteil von Groups ist Wartbarkeit. Wenn die "Developers"-Gruppe eine neue Berechtigung braucht — etwa Zugang zu einem neuen S3-Bucket —, fügen Sie sie der Gruppe einmal hinzu, und alle Entwickler haben sie sofort. Ohne Groups würden Sie jeden User einzeln aktualisieren, was Gelegenheiten für Inkonsistenz schafft und Personen übersieht.

**Roles** sind temporäre Identitäten, die von etwas *übernommen* werden können — einer Person, einem Dienst oder einem anderen AWS-Konto. Wir gehen in Kapitel 14 ausführlich auf Rollen ein. Vorerst gilt: Wenn ein User ein dauerhafter Mitarbeiter ist, ist eine Role ein Besucherausweis. Sie gewährt bestimmten Zugang für eine bestimmte Zeit oder einen bestimmten Zweck.

Die wichtigste Verwendung von Roles für dieses Kapitel: IAM-Roles für EC2-Instanzen. Wenn Sie eine Role an eine EC2-Instanz anhängen, kann die auf dieser Instanz laufende Anwendung AWS-API-Aufrufe mit den Berechtigungen der Role machen — ohne dass irgendwo statische Anmeldedaten gespeichert sind. Die Anmeldedaten sind temporär, werden automatisch von AWS rotiert und sind auf die Policies der Role eingegrenzt. Das beseitigt das Problem der "Anmeldedaten in Konfigurationsdateien" vollständig.

**Policies** sind die eigentlichen Berechtigungsregeln. Eine Policy ist ein Dokument (intern in JSON geschrieben, aber Sie müssen das Format nicht auswendig lernen), das besagt: "Der Inhaber dieser Policy DARF Aktion X auf Ressource Y ausführen." Oder "Aktion Z ist VERBOTEN."

AWS stellt Hunderte von **Managed Policies** bereit — vorgefertigte Policies für häufige Anwendungsfälle. `AmazonS3ReadOnlyAccess` gewährt Lesezugriff auf alle S3-Buckets. `AmazonEC2FullAccess` gewährt vollständige EC2-Kontrolle. Für den Produktionseinsatz möchten Sie oft **Customer-Managed Policies** — Policies, die Sie selbst schreiben, präzise auf die Ressourcen und Aktionen eingegrenzt, die Ihre Anwendung tatsächlich braucht.

Das IAM-Auswertungsmodell lautet: Standardmäßig ist alles abgelehnt. Berechtigungen müssen explizit gewährt werden. Wenn eine Policy nicht besagt, dass Sie etwas tun können, können Sie es nicht.

**Das Prinzip der geringsten Rechte**

Geben Sie Personen und Systemen nur den Zugang, den sie für ihre Arbeit benötigen. Nicht mehr.

Priya nannte das "das Prinzip der geringsten Rechte". Es klingt offensichtlich. In der Praxis verletzt es die meisten Teams ständig — nicht böswillig, sondern aus Bequemlichkeit.

"Können wir Leo einfach Admin-Zugang geben, damit er Dinge schneller deployen kann?"

Nein.

"Können wir einfach das Root-Konto für alles verwenden?"

Auf keinen Fall.

Das Root-Konto ist der Hauptschlüssel zu Ihrem gesamten AWS-Konto. Es kann alles tun, einschließlich des Schließens des Kontos selbst. Sie sollten es einmal erstellen, Multi-Faktor-Authentifizierung einrichten und es dann nie wieder für die tägliche Arbeit verwenden.

Es gibt genau eine Handvoll Aufgaben, die das Root-Konto erfordern: die Änderung der E-Mail-Adresse des Kontos, das Einsehen von Abrechnungsinformationen, die nicht anderweitig delegiert sind, das Schließen des Kontos und einige andere administrative Operationen, die AWS ausdrücklich auf Root beschränkt. Für alles andere — Users erstellen, Infrastruktur deployen, auf Datenbanken zugreifen — verwenden Sie IAM-Users und -Roles. Das Root-Konto ist für den Gebäudeverwalter. Alle anderen haben passende Zugangskarten.

Priya erstellte an diesem Nachmittag separate IAM-User für alle. Sie gab Leo Berechtigungen, in die Entwicklungsumgebung zu deployen. Nicht Produktion. Nicht Abrechnung. Nicht Netzwerke. Nur das Deployment.

"Das fühlt sich einschränkend an", sagte Leo.

"Daran erkennt man, dass es richtig ist", antwortete Priya.

Die Grenze zwischen Entwicklung und Produktion war die erste und wichtigste Least-Privilege-Linie, die Priya zog. Entwickler mussten sich in der Entwicklung schnell bewegen: Ressourcen erstellen, Konfigurationen testen, Fehler machen. Aber Produktion war anders. Produktionsänderungen mussten bewusst, überprüft und durch einen kontrollierten Prozess ausgeführt werden. Einem Entwickler direkten Produktionszugang zu geben bedeutete, ihm die Fähigkeit zu geben, Produktionsfehler mit Entwicklungsgeschwindigkeit zu machen.

Mit der Zeit baute Priya ein System auf, in dem Produktionszugang temporär durch einen Role-Assumption-Prozess gewährt wurde: Ein Entwickler, der eine Produktionsänderung vornehmen musste, beantragte den Zugang, bekam ihn für ein 4-Stunden-Fenster, nahm die Änderung vor, und der Zugang lief automatisch ab. Das Fenster wurde in CloudTrail protokolliert. Der Zugang konnte nach Ablauf nicht mehr verwendet werden. Produktion wurde nicht dadurch geschützt, dass Zugang dauerhaft verweigert wurde, sondern indem Zugang zeitlich begrenzt und prüfbar gemacht wurde.

Sie fragen sich vielleicht: Wenn standardmäßig alles abgelehnt wird, warum hat das Root-Konto vollständigen Zugang? Das Root-Konto ist besonders — es umgeht IAM vollständig. Genau deshalb sperrt man es weg. Jede andere Aktion in AWS durchläuft die Auswertungskette von IAM, in der ein fehlendes Allow dasselbe ist wie ein Deny.

**Schadensradius: Warum geringste Rechte Unternehmen retten**

Es gibt ein Konzept, das Sicherheitsingenieure verwenden, um über die Kompromittierung von Anmeldedaten nachzudenken: **Schadensradius** (Blast Radius).

Der Schadensradius ist der maximale Schaden, den ein Angreifer anrichten kann, wenn er ein bestimmtes Credential erhält.

Ein Angreifer mit den Root-Anmeldedaten eines AWS-Kontos hat einen unbegrenzten Schadensradius. Er kann jede Ressource löschen, jedes Byte an Daten exfiltrieren, GPU-Instanzen in jeder Region starten und das Konto schließen. Das Credential selbst enthält keine Grenzen.

Ein Angreifer mit Leos IAM-Anmeldedaten — eingegrenzt auf das Deployen in die Entwicklungsumgebung und das Lesen aus einem S3-Bucket — hat einen winzigen Schadensradius. Er kann in dev deployen. Er kann einige Dateien lesen. Er kann Produktion nicht berühren. Er kann nicht auf die Datenbank zugreifen. Er kann die Abrechnung nicht sehen. Er kann keine GPU-Instanzen starten.

Die Verstoßgeschichte von vorhin hatte einen großen Schadensradius, weil die Anmeldedaten des Entwicklers Admin waren. Wenn dieselben Anmeldedaten auf seine tatsächliche Aufgabe eingegrenzt gewesen wären — das Deployen in eine bestimmte Umgebung —, wäre der Schaden weit kleiner gewesen. Der Angriff wäre vielleicht trotzdem passiert. Das Ergebnis wäre anders gewesen.

Deshalb sind geringste Rechte nicht nur Policy. Sie sind Architektur. Jede Berechtigung, die Sie nicht gewähren, ist Schadensradius, den Sie nicht haben.

**Was passiert, wenn man das falsch macht**

Drei Szenarien, in zunehmender Schwere:

**Szenario 1**: Ein Mitarbeiter mit Admin-Zugang verlässt das Unternehmen. Niemand deaktiviert sein Konto. Drei Monate später hat er immer noch Zugang. Das passiert ständig. IAM löst es: Sie deaktivieren den User. Sofort, überall.

Das ist der häufigste IAM-Fehlermodus, und er ist vollständig vermeidbar. Die meisten Organisationen haben einen Prozess für den Entzug physischen Zugangs (Rückgabe eines Ausweises, Rückgabe eines Laptops), übersehen aber IAM. Die Offboarding-Checkliste, die "IAM-User deaktivieren" und "aus allen IAM-Groups entfernen" enthält, ist keine komplexe technische Herausforderung — es ist Prozessdisziplin. Die Teams, die es konsequent tun, sind diejenigen, die nie herausfinden, was passiert, wenn ein Ex-Mitarbeiter noch auf die Produktionsdatenbank zugreifen kann.

**Szenario 2**: Der Laptop eines Entwicklers wird kompromittiert. Der Angreifer findet AWS-Anmeldedaten in einer Konfigurationsdatei mit vollständigen Admin-Berechtigungen. Weil die Anmeldedaten breiten Zugang haben, kann der Angreifer alles tun: Kryptowährungen schürfen, Daten stehlen, Backups löschen. Mit geringsten Rechten: Die Anmeldedaten funktionieren nur für ihren begrenzten Bereich. Der Schadensradius ist eingedämmt.

Das Muster von Anmeldedaten in einer Konfigurationsdatei ist häufiger, als es sein sollte. Entwickler speichern AWS-Anmeldedaten oft in `~/.aws/credentials` für die lokale Entwicklung — was in Ordnung ist. Das Problem ist, wenn diese Anmeldedaten Zugang auf Produktionsebene haben, statt auf eine Sandbox-Umgebung eingegrenzt zu sein. Entwicklungsanmeldedaten sollten auf eine Entwicklungsumgebung eingegrenzt sein. Produktionszugang sollte explizite Schritte zur Übernahme erfordern, nicht ständig auf jedem Laptop vorhanden sein.

**Szenario 3**: Eine schlecht geschriebene Anwendung legt versehentlich AWS-Anmeldedaten in ihren Logs offen. Wenn diese Anmeldedaten breiten Zugang haben, haben Sie einen katastrophalen Verstoß. Wenn sie engen Zugang haben — nur zu dem spezifischen S3-Bucket, den die Anwendung benötigt —, ist die Offenlegung begrenzt und eingedämmt.

Das Szenario von Anwendungsanmeldedaten in Logs ist subtil. Es passiert oft, wenn Debug-Code den vollständigen Anfragekontext protokolliert — einschließlich der Autorisierungs-Header — oder wenn ein Fehler-Handler alle Umgebungsvariablen (einschließlich `AWS_ACCESS_KEY_ID`) in eine Logdatei serialisiert. Die Schutzmaßnahme hier sind IAM-Roles für EC2, die statische Anmeldedaten vollständig aus der Anwendungsumgebung beseitigen. Wenn es keine statischen Anmeldedaten gibt, können sie nicht in Logs auftauchen.

Das Muster: Zugang sollte auf das Minimum beschränkt sein. Immer. Nicht weil Sie Ihren Leuten misstrauen, sondern weil Sie nicht kontrollieren können, was mit kompromittierten Anmeldedaten passiert.

**Wenn breiter Zugang, dann Bequemlichkeit, aber Exposition**

Es gibt immer die Versuchung, Teams breiteren Zugang zu geben, als sie brauchen — es macht Deployments schneller, reduziert Reibung, vermeidet die "Access Denied"-Momente, die den Flow unterbrechen. Wenn Sie jedem Admin-Zugang geben, dann verlaufen Deployments reibungslos und niemand wird blockiert — aber wenn Anmeldedaten leaken (und das tun sie), erbt der Angreifer vollständige Admin-Rechte. Ein kompromittierter Laptop wird zu einem vollständigen Kontoverstoß. Schreiben Sie zuerst die minimale Berechtigung. Erweitern Sie nur, wenn etwas fehlschlägt. Diese Regel rettet Unternehmen.

**Multi-Faktor-Authentifizierung: Das zweite Schloss**

Selbst mit geringsten Rechten können Anmeldedaten gestohlen werden. Passwörter können geraten, durch Phishing abgefangen oder geleakt werden. IAM adressiert dies mit **Multi-Faktor-Authentifizierung (MFA)**.

MFA erfordert etwas, das Sie *wissen* (Passwort) plus etwas, das Sie *haben* (ein Telefon, ein Hardware-Schlüssel). Selbst wenn ein Angreifer Ihr Passwort stiehlt, kann er sich nicht ohne Ihr Telefon einloggen.

MFA sollte für jeden IAM-User aktiviert sein. Es ist nicht verhandelbar für das Root-Konto.

Priya verbrachte den Nachmittag damit, es für alle einzurichten. Es lief nicht reibungslos.

Leos Authenticator-App registrierte zweimal das falsche Konto. Er musste den QR-Code dreimal scannen, weil die Uhr auf seinem Laptop leicht asynchron war, was die zeitbasierten Tokens fehlschlagen ließ. Beim dritten Versuch funktionierte es.

"Gibt es eine Möglichkeit, das ohne die App zu machen?" fragte Leo und schaute auf sein Telefon.

"Hardware-Schlüssel", sagte Priya. "Ein physisches Gerät, das in USB gesteckt wird. Sicherer als die App. Teurer."

"Wie viel teurer?"

"Etwa 50 Dollar pro Schlüssel. Sie würden zwei wollen, falls Sie einen verlieren."

Tom schrieb "100 Dollar pro Entwickler" in sein Notizbuch.

"Wir kaufen sie", sagte Priya. "Mindestens für das Root-Konto."

Tom fragte, ob es insgesamt zu viel Reibung sei. Priya zeigte die Verstoßgeschichte erneut.

Tom richtete MFA sofort ein.

"Und was, wenn jemand versucht einzubrechen, während wir mitten in diesem Übergang sind?" fragte Priya. "Bevor alle MFA aktiviert haben?"

Niemand hatte eine gute Antwort. Sie richtete MFA zuerst für das Root-Konto ein, vor allen anderen.

**IAM Access Analyzer: Das zweite Augenpaar**

Priya hatte dem Team noch ein Werkzeug zu zeigen, nachdem die MFA-Einrichtung abgeschlossen war.

"Dieses läuft automatisch", sagte sie und öffnete einen neuen Konsolen-Tab.

**IAM Access Analyzer** ist ein Dienst, der kontinuierlich Ihre IAM-Policies analysiert und alles markiert, was Zugang zu Ressourcen außerhalb Ihres Kontos gewährt — oder außerhalb dessen, was Sie erwarten würden.

Er fand beim ersten Durchlauf etwas.

Ein S3-Bucket — einer, den Leo vor drei Wochen als "temporär" eingerichtet und dann vergessen hatte — hatte eine Bucket-Policy, die öffentlichen Lesezugriff erlaubte. Der Bucket enthielt einige Testdatendateien, nichts Sensibles. Aber er enthielt auch einen Ordner, den Leo `db-backups-staging` genannt und mit ein paar exportierten SQL-Dateien gefüllt hatte, um den Importprozess zu testen.

"Ist irgendetwas Sensibles in diesen SQL-Dateien?" fragte Priya.

Leo schaute auf den Ordnernamen. Dann auf die Dateien darin. Dann an die Decke.

"Ich habe die Staging-Datenbank exportiert", sagte er. "Die Kopien früher Produktionskundendaten enthält."

Priya schloss ihren Laptop langsam.

Der Bucket war innerhalb von fünf Minuten auf privat gesetzt. Access Analyzer überwachte weiterhin alle künftigen Policies, die Ressourcen unerwartet öffneten.

"Stellen Sie es sich wie einen Perimeteralarm vor", sagte Priya. "Jedes Mal, wenn jemand versehentlich eine Tür offen lässt, sagt er es uns."

Sie fragen sich vielleicht: Ersetzt IAM Access Analyzer die manuelle Policy-Überprüfung? Nein. Es ist ein Erkennungswerkzeug, kein Präventionswerkzeug. Es informiert Sie über Zugang, der gewährt wurde — es kann Ihnen nicht sagen, ob dieser Zugang beabsichtigt war. Die menschliche Überprüfung von "war diese Policy korrekt?" muss weiterhin stattfinden. Access Analyzer stellt nur sicher, dass die offenen Fenster nicht unbemerkt bleiben.

## Stärken und Einschränkungen

**IAM ist das richtige Werkzeug für**:

- Die Kontrolle, wer und was auf jede AWS-Ressource zugreifen kann
- Die Implementierung von geringsten Rechten über Users, Dienste und kontoübergreifende Grenzen hinweg
- Die Eliminierung der Notwendigkeit, langlebige Anmeldedaten zwischen Systemen zu teilen
- Jede IAM-Aktion wird automatisch protokolliert, was Ihnen einen Prüfpfad darüber gibt, wer was wann getan hat (behandelt in Kapitel 14)
- Kontoübergreifender Zugang: Eine IAM-Role in Konto A kann von einem Principal in Konto B übernommen werden, was kontrolliertes Teilen von Ressourcen zwischen AWS-Konten ohne Credential-Teilung erlaubt

**Wo IAM schwierig wird**: IAM-Policies können in Hunderte von Aussagen über Dutzende von Rollen anwachsen, und das Debuggen eines "Access Denied"-Fehlers erfordert das Verstehen, welche dieser Policies die effektive ist — eine Aufgabe, die schwieriger ist, als sie klingt. Der häufigste IAM-Fehler ist nicht zu wenig Zugang — es ist zu viel. Überpermissive Policies, die erstellt wurden, um "es einfach funktionieren zu lassen", werden zu Sicherheitsverbindlichkeiten, die im Nachhinein schmerzhaft rückgängig zu machen sind. Schreiben Sie zuerst die minimale Berechtigung. Erweitern Sie nur, wenn etwas fehlschlägt.

Es gibt eine praktische Herausforderung mit IAM im großen Maßstab: **Policy-Wildwuchs**. Organisationen, die AWS seit mehreren Jahren betreiben, haben oft Dutzende oder Hunderte von benutzerdefinierten Policies, von denen sich viele überschneiden, einige nie verwendet werden und einige sich auf Weisen widersprechen, die niemand bemerkt hat, weil die Widersprüche nur für Randfälle eine Rolle spielen. AWS stellt **IAM Access Analyzer** (den wir in diesem Kapitel eingeführt haben) und **IAM-Policy-Simulationstools** bereit, um Policies zu prüfen und zu rationalisieren. Aber die effektivste Strategie ist, von Anfang an saubere Policies zu bauen und regelmäßig zu prüfen — statt Policies anhäufen zu lassen und später zu versuchen, sie zu entwirren.

Priya richtete eine vierteljährliche IAM-Überprüfung ein: alle Roles und Policies auflisten, über CloudTrail-Logs prüfen, welche aktiv genutzt werden, ungenutzte Anmeldedaten oder zu breite Policies zur Entfernung oder Einschränkung markieren. Die Überprüfung dauerte zwei Stunden pro Quartal und entdeckte im ersten Jahr drei Policy-Probleme.

"Es ist keine aufregende Arbeit", sagte sie. "Aber Zugangsüberprüfungen sind die Art, wie man die Dinge findet, die katastrophal gewesen wären, wenn jemand sie zuerst bemerkt hätte."

## Zusammenfassung

Das Admin123-Passwort war das Symptom. Die Krankheit war, dass Nimbus überhaupt keine Zugangskontrollstrategie hatte — ein geteiltes Root-Credential, keine Roles, keine Policies, kein Prüfpfad. IAM behebt nicht nur das Symptom; es zwingt das Team, eine Frage zu beantworten, die es vermieden hatte: Wer genau darf was tun? Die Antwort auf diese Frage ist das Fundament jeder sicheren AWS-Architektur.

- **IAM** (Identity and Access Management) ist die Art, wie Sie steuern, wer in AWS was tun kann. Die Kernbausteine sind: **Users**, **Groups**, **Roles** und **Policies**.
- Standardmäßig ist in AWS alles **abgelehnt**. Berechtigungen müssen explizit gewährt werden.
- Das **Prinzip der geringsten Rechte** bedeutet, jeder Identität nur den Zugang zu geben, den sie braucht — und so den **Schadensradius** zu minimieren, falls ein Credential jemals kompromittiert wird.
- Das **Root-Konto** kann alles tun, einschließlich katastrophaler Dinge. Sichern Sie es hinter MFA und verwenden Sie es so wenig wie möglich.
- Aktivieren Sie **MFA** für jeden IAM-User. Nicht verhandelbar — in der Prüfung und in der Produktion.

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
- **Roles sind der bevorzugte Weg, AWS-Diensten Zugang zu gewähren.** Wenn eine EC2-Instanz
  auf S3 zugreifen muss, fügen Sie eine IAM-Role an die Instanz an — Sie speichern keine
  Anmeldedaten auf der Maschine. Dieses Muster erscheint ständig in der Prüfung.
- **IAM Access Analyzer** generiert Findings, wenn Ressourcen von außerhalb des Kontos oder von außerhalb der Organisation zugänglich sind. Wenn ein Prüfungsszenario die Erkennung unbeabsichtigten externen Zugangs zu S3 oder KMS erwähnt, ist Access Analyzer die Antwort.
- **MFA für das Root-Konto ist verpflichtend**, nicht optional, im Kontext der AWS-Sicherheits-Best-Practices. Prüfungsfragen zur Sicherung des Root-Kontos beinhalten MFA immer als Teil der richtigen Antwort.
- **Permission Boundaries** sind ein fortgeschrittenes IAM-Feature (behandelt in Kapitel 14), das die maximalen Berechtigungen begrenzt, die ein IAM-User oder eine Role haben kann, selbst wenn ihre Policies mehr gewähren. Prüfungsfragen zur "Verhinderung von Privilege Escalation" oder zum "Festlegen einer maximalen Berechtigungsobergrenze" weisen auf Permission Boundaries hin.
- **Service Control Policies (SCPs)** sind Policies auf Organisationsebene, die einschränken, was in den Mitgliedskonten einer AWS-Organisation getan werden kann. Sie wirken oberhalb der IAM-Ebene — selbst ein Kontoadministrator kann die durch eine SCP gesetzten Grenzen nicht überschreiten. Wenn ein Prüfungsszenario mehrkontenbasierte Sicherheitssteuerung betrifft, denken Sie an SCPs.
- **CloudTrail** zeichnet alle IAM-API-Aufrufe auf. Wenn ein Prüfungsszenario fragt "wie würden Sie prüfen, welche Nutzer Änderungen an IAM-Policies vorgenommen haben", ist die Antwort CloudTrail. Jede IAM-Aktion — einen User erstellen, eine Policy ändern, eine Role übernehmen — wird protokolliert. Der 90-Tage-Ereignisverlauf ist automatisch und kostenlos; für langfristige Aufbewahrung und Alarmierung müssen Sie einen Trail erstellen, der Logs an einen S3-Bucket liefert.

## Übungen

**Übung 1 — Wiederholung**

Erklären Sie mit eigenen Worten: Was ist der Unterschied zwischen einem IAM-User, einer Group und einer Role?
Wann würden Sie welche verwenden?

*(Hinweis: Denken Sie an die Gebäude-Kartenanalogie — welche ist eine permanente Karte,
welche ist eine Abteilungsgruppierung und welche ist ein Besucherausweis?)*

**Übung 2 — SAA-C03-Szenario**

*Szenario*: Ein Unternehmen betreibt eine Webanwendung auf EC2-Instanzen, die Dateien aus einem
S3-Bucket lesen müssen. Ein Junior-Entwickler schlägt vor, AWS-Zugriffsschlüssel direkt im
Anwendungscode auf den EC2-Instanzen zu speichern. Das Sicherheitsteam widerspricht.

Was ist die SICHERSTE und betrieblich angemessenste Lösung?

A) Die Zugriffsschlüssel in Umgebungsvariablen auf der EC2-Instanz anstatt im Code speichern  
B) Einen dedizierten IAM-User mit S3-Leseberechtigungen erstellen und die Anmeldedaten
   mit dem Entwicklungsteam teilen  
C) Eine IAM-Role mit den entsprechenden S3-Leseberechtigungen direkt an die EC2-Instanzen anfügen  
D) Die Root-Konto-Anmeldedaten verwenden, um der Anwendung vollständigen Zugang zu allen AWS-Ressourcen zu geben

**Hinweis 1**: Das Problem beim Speichern von Anmeldedaten irgendwo auf der Instanz ist,
dass Anmeldedaten geleakt werden können. Gibt es eine Möglichkeit, der EC2-Instanz Zugang zu geben,
ohne überhaupt Anmeldedaten zu verwenden?

**Hinweis 2**: AWS hat einen Mechanismus, bei dem Diensten Berechtigungen ohne statische Anmeldedaten
gewährt werden können. Wie heißt dieser Mechanismus?

**Hinweis 3**: IAM-Roles können an EC2-Instanzen angehängt werden. Wenn das der Fall ist, erhält die
Instanz automatisch temporäre Anmeldedaten, die von AWS rotiert werden. Keine statischen Anmeldedaten nötig.

**Antwort**: C

**Erklärung**: Eine IAM-Role an eine EC2-Instanz anzuhängen ist das richtige Muster.
Die Instanz erhält automatisch temporäre, rotierende Anmeldedaten über den EC2-Metadata-Dienst.
Es gibt keine langlebigen Anmeldedaten, die geleakt, rotiert oder versehentlich in ein Repository eingecheckt werden könnten.

**Warum nicht A?** Umgebungsvariablen auf einer EC2-Instanz können immer noch geleakt werden —
durch Anwendungslogs, Debug-Endpunkte oder wenn die Instanz kompromittiert wird.
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
