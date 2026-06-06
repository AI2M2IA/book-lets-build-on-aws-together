# Kapitel 21: Versandcontainer für Code

Vor 1956 war das Verladen von Fracht auf ein Schiff eine fachkundige und spezialisierte Verhandlung. Jedes Schiff hatte andere Laderäume. Jeder Hafen hatte andere Kräne. Jeder Spediteur hatte andere Systeme, um nachzuverfolgen, was wohin ging. Eine Kiste Waren bewegte sich vom Lkw zum Kai zum Schiff zum Kai zum Lkw durch eine Kette von Menschen, die sie alle unterschiedlich handhabten. Fracht ging verloren. Fracht wurde beschädigt. Dieselben Waren, zweimal versendet, kamen in unterschiedlichem Zustand an, weil die Handhabung beide Male unterschiedlich gewesen war.

Die Antwort, als jemand sie schließlich klar stellte, lautete: Standardisiere den Container. Löse das Problem nicht in jedem Hafen. Löse es einmal, auf Containerebene. Versende die Box, nicht nur den Inhalt.

Der standardisierte Versandcontainer machte das Verschiffen nicht nur schneller. Er machte das Verschiffen *vorhersehbar*. Der Inhalt eines Containers in Shanghai war in genau demselben Zustand, als er in Rotterdam ankam – weil der Container ihn an jedem Umschlagspunkt vor Variabilität schützte.

Das ist genau dasselbe Problem, das Leo hatte. Die Nimbus-API wurde an jedem „Hafen“ anders „verladen“: Staging wurde anders deployed als Production, Instanz eins anders als Instanz drei, und sechs Wochen undokumentierter Änderungen hatten die Flotte unvorhersehbar gemacht.

Der Container würde Leo nicht zu einem schnelleren Entwickler machen. Er würde Deployments vorhersehbar machen.

---

Die Lambda-Migration hatte die EC2-Rechnung für kleinere Dienste reduziert. Aber die Kern-API war anders – sie lief ununterbrochen, trug den gesamten Bestelltraffic und hatte acht Monate lang Konfigurationsgeschichte angesammelt. Lambda löste das Leerlaufproblem. Container würden die Inkonsistenz lösen.

Die Kern-API war nicht im Leerlauf; sie konnte nicht zu Lambda wechseln. Aber sie hatte ein anderes Problem: Die EC2-Instanzen, die sie betrieben, waren voneinander abgewichen.

---

Leo hatte gelernt, „Es funktioniert auf meinem Rechner“ nicht laut zu sagen. Es war keine Verteidigung – es war eine Diagnose. Und die Diagnose lautete diesmal: Produktions-EC2-Instanz Nummer drei, die vor sechs Wochen einen Bibliotheks-Patch erhalten hatte, den niemand dokumentiert hatte, den die anderen beiden Instanzen nicht erhalten hatten und der nun einen Fehler verursachte, der nur dort existierte, in jener einen Instanz, überall sonst unsichtbar.

Er hatte am Abend zuvor drei Stunden damit verbracht, ihn aufzuspüren.

„Jedes Mal, wenn wir deployen“, sagte er am nächsten Morgen, „koordinieren wir über mehrere Instanzen hinweg. Neue Version, andere Abhängigkeiten. Funktioniert in Staging, bricht in Production, weil die Umgebungen auseinandergedriftet sind.“

„Weil jemand ein Paket auf Instanz drei aktualisiert hat, ohne die anderen zu aktualisieren“, sagte Priya. Nicht unfreundlich.

„Ich brauchte eine bestimmte Version von—“

„Ich weiß“, sagte sie. „Und jetzt hat Instanz drei eine andere Geschichte als Instanz eins und zwei. Das ist Konfigurationsdrift. Sie ist still, bis sie es nicht mehr ist.“

„Was ist die eigentliche Lösung?“ fragte Maya.

„Hört auf, Server wie dauerhafte Dinge zu behandeln, die man konfiguriert“, sagte Priya. „Fangt an, sie wie Wegwerfeinheiten zu behandeln, die man ersetzt.“

**Was ist ein Container?**

„Stellt es euch wie einen Versandcontainer vor“, sagte Leo und griff zu einem Marker. „Dem Container ist es egal, auf welchem Schiff er ist. Dem Schiff ist es egal, was im Container ist. Sie haben sich auf die Abmessungen und den Verriegelungsmechanismus geeinigt. Alles andere ist in der Box.“

Ein **Container** ist eine leichtgewichtige, portable Einheit, die Ihre Anwendung zusammen mit allem verpackt, was sie zum Laufen braucht: die Laufzeit (Python 3.11, Node.js 20, Java 17), die Bibliotheken und Abhängigkeiten, Konfigurationsdateien und den Anwendungscode selbst.

Anders als eine virtuelle Maschine (die einen ganzen Computer emuliert, einschließlich des Betriebssystem-Kernels) teilt sich ein Container den Host-OS-Kernel, während alles andere isoliert bleibt. Das macht Container schnell im Start (Sekunden, manchmal Millisekunden) und klein (Megabyte, nicht Gigabyte).

Die populärste Container-Technologie ist **Docker**. Ein Docker-Image ist der Bauplan – ein Snapshot der Anwendung und ihrer Umgebung. Ein Docker-Container ist eine laufende Instanz dieses Images.

Die zentrale Eigenschaft: **Unveränderlichkeit**. Ein heute gebautes Image läuft identisch auf jedem Host, der Docker unterstützt – einem Laptop, einer EC2-Instanz, einem Server in einem anderen Rechenzentrum. Die Umgebung ist eingebacken. Konfigurationsdrift ist unmöglich.

„Statt uns also Sorgen zu machen, was auf der EC2-Instanz installiert ist“, sagte Leo, „bauen wir ein Image, das alles hat. Das Image läuft überall gleich.“

„Und wenn du es lokal testen musst, führst du dasselbe Image aus“, fügte Priya hinzu. „Kein ‚Es funktioniert auf meinem Rechner‘ mehr.“

**Das Docker-Image bauen und nach ECR pushen**

Bevor ein Orchestrator den Container verwalten konnte, musste Leo ihn bauen und irgendwo speichern, von wo ECS ziehen konnte.

Er schrieb das Dockerfile:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Die entscheidende Zeile: `FROM python:3.11-slim`. Nicht Python 3.9. Nicht Python 3.10. 3.11 – die spezifische Version, auf die sich das Team geeinigt hatte, eingebacken ins Image. Jede Instanz, die dieses Image ausführt, würde exakt Python 3.11 verwenden. Das Rundungsverhalten des Decimal-Moduls würde überall identisch sein.

Er baute das Image lokal: `docker build -t nimbus-api:1.0.0 .`

Der Build dauerte 4 Minuten. Docker zog das Basis-Image, installierte Abhängigkeiten, kopierte den Anwendungscode und erzeugte ein Image mit dem Tag `nimbus-api:1.0.0`.

Er führte es lokal aus: `docker run -p 8000:8000 nimbus-api:1.0.0`

Die API startete. Gleicher Port, gleiches Verhalten wie der Produktionsserver – weil die Umgebung identisch war.

Dann pushte er es nach ECR:

```bash
# Docker bei ECR authentifizieren
aws ecr get-login-password --region us-west-2 |   docker login --username AWS --password-stdin   123456789012.dkr.ecr.us-west-2.amazonaws.com

# Das Image für ECR taggen
docker tag nimbus-api:1.0.0   123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0

# Push
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0
```

Der Push dauerte 2 Minuten. ECR speicherte das Image, löste sofort einen Image-Scan aus und meldete die Ergebnisse innerhalb von 5 Minuten.

**Amazon ECS: Der Orchestrator**

Einen Container zu betreiben ist einfach. Dutzende Container über mehrere Hosts hinweg zu betreiben, Traffic zwischen ihnen zu routen, ausgefallene Container neu zu starten, neue Versionen ohne Ausfallzeit zu deployen – das erfordert einen **Orchestrator**.

**Amazon ECS (Elastic Container Service)** ist der verwaltete Container-Orchestrierungsdienst von AWS. Sie definieren:

- **Task-Definition**: Welches Container-Image laufen soll, wie viel CPU und Speicher, welche Umgebungsvariablen, welche Ports freigegeben werden
- **Service**: Wie viele Kopien des Tasks laufen sollen, wie Fehler und Deployments gehandhabt werden
- **Cluster**: Die zugrunde liegende Compute-Infrastruktur

ECS erledigt den Rest: Tasks auf verfügbarer Kapazität platzieren, ausgefallene Tasks neu starten, Verbindungen während Deployments abbauen, gesunde Tasks beim Load Balancer registrieren.

Für Nimbus wechselte die API von EC2-Instanzen mit manuell verwalteten Deployments zu ECS. Jedes neue Deployment pushte ein neues Docker-Image nach **Amazon ECR (Elastic Container Registry)** – AWS' verwaltete Container-Registry – und ECS rollte es ohne Ausfallzeit über alle Tasks aus.

**Fargate vs. EC2-Launch-Typ**

ECS kann Container in zwei Modi betreiben:

**EC2-Launch-Typ**: Sie verwalten die zugrunde liegenden EC2-Instanzen. Sie sind für das Patchen der Instanzen verantwortlich, für deren richtige Dimensionierung und für ausreichende Kapazität für Ihre Container. Mehr Kontrolle, mehr Verantwortung.

**Fargate (serverloses Compute für Container)**: AWS verwaltet die zugrunde liegende Infrastruktur vollständig. Sie geben CPU und Speicher pro Task an; Fargate stellt automatisch die richtige Kapazität bereit. Keine EC2-Instanzen zu verwalten. Sie zahlen pro vCPU-Sekunde und GB-Sekunde Speicher.

Fargate ist das „Serverless-Container“-Modell – Sie erhalten die Umgebungsisolierung von Containern, ohne Server zu verwalten. Der Kompromiss: weniger Kontrolle über die Konfiguration der zugrunde liegenden Instanz und etwas höhere Kosten pro Einheit.

„Wie viel kostet das pro Monat?“ fragte Tom und rief den Preisrechner auf. „Fargate gegenüber EC2-Launch-Typ – ich will die tatsächlichen Zahlen sehen.“

Leos Bauchgefühl – das, das jeder mit sich herumträgt – war, dass Fargate mehr kosten würde. Serverlose Bequemlichkeit, Premium-Preis. Er schätzte vielleicht zwanzig oder dreißig Prozent über EC2.

„Rechne die tatsächlichen Zahlen aus“, sagte Tom, denn das war Tom.

Der Nimbus-API-Service betrieb 3 Tasks, jeder mit 0,5 vCPU und 1 GB Speicher, rund um die Uhr:

**Fargate**: 0,04048 $/vCPU-Stunde × 0,5 × 3 × 720 Stunden = 43,72 $/Monat für CPU. 0,004445 $/GB-Stunde × 1 × 3 × 720 = 9,60 $/Monat für Speicher. Gesamt: 53,32 $/Monat.

**EC2-Launch-Typ** (3 × t3.medium zu 0,0416 $/Stunde): 0,0416 $ × 3 × 720 = 89,86 $/Monat.

„Moment“, sagte Tom. „Fargate ist günstiger?“

„In dieser Größe, ja“, sagte Leo. „Fargate berechnet exakt für das, was du zuteilst. EC2-Instanzen haben Overhead – das OS und der ECS-Agent verbrauchen etwas CPU und Speicher, bevor deine Container überhaupt starten. Eine t3.medium gibt 2 vCPU und 4 GB, aber du nutzt 0,5 vCPU und 1 GB pro Container. Der Rest ist verschwendet.“

„Aber der EC2-Launch-Typ lässt dich mehrere Tasks auf eine Instanz packen.“

„Ja. Bei größeren Maßstäben, mit sorgfältigem Bin-Packing, wird der EC2-Launch-Typ günstiger. In unserer Größenordnung – drei Tasks – gewinnt Fargate.“

Tom schrieb das auf.

Für Nimbus: Fargate für den API-Service. Sie wollten keine EC2-Instanzen für Container verwalten.

Wenn Sie mit Fargate containerisieren, eliminieren Sie den gesamten EC2-Verwaltungsaufwand – aber Sie geben die Möglichkeit auf, Instanztypen anzupassen, was für GPU-Workloads oder spezialisierte Netzwerke wichtig ist. Wenn Sie ECS für AWS-native Einfachheit wählen, gewinnen Sie enge IAM- und ALB-Integration – aber Sie sind vom Kubernetes-Ökosystem ausgeschlossen, was eine Neuarchitektur erfordert, falls Sie später Multi-Cloud-Portabilität brauchen.

**Amazon EKS: Wenn Sie Kubernetes brauchen**

**Kubernetes** ist ein quelloffenes Container-Orchestrierungssystem – im Wesentlichen der Industriestandard für die Verwaltung von Containern in großem Maßstab. Es ist leistungsstark, erweiterbar und komplex.

**Amazon EKS (Elastic Kubernetes Service)** ist AWS' verwalteter Kubernetes-Dienst. Er betreibt die Kubernetes-Control-Plane (die Verwaltungsschicht) für Sie, während Sie die Worker-Nodes verwalten (oder auch dafür Fargate verwenden).

Sie fragen sich vielleicht: Wenn Kubernetes der Industriestandard ist und jede Stellenanzeige es erwähnt, warum sollten wir es nicht einfach verwenden? Weil „Industriestandard“ beschreibt, was große Unternehmen mit dedizierten Plattformteams verwenden. Für ein sechsköpfiges Team, das eine Essensbestell-App baut, fügt Kubernetes operative Komplexität ohne praktischen Nutzen im Moment hinzu. Die Komplexität ist real; der Nutzen ist in dieser Größenordnung theoretisch.

Kubernetes liefert Wert auf einem Komplexitätsniveau, das die meisten Teams nicht brauchen: Custom Resource Definitions zum Bauen interner Plattformen, fortgeschrittene Scheduling-Beschränkungen, Pod Disruption Budgets für feinkörnige Deployment-Steuerung und Service-Mesh-Integration für Traffic-Management zwischen Hunderten von Microservices. Das sind echte Fähigkeiten. Es sind auch Fähigkeiten, die ein Startup von Nimbus' Größe nie ausüben wird.

Das hier zugrunde liegende Engineering-Prinzip wird manchmal YAGNI genannt: You Aren't Gonna Need It (Du wirst es nicht brauchen). ECS gibt Nimbus alles, was sie derzeit brauchen. EKS gibt ihnen mehr, als sie brauchen, plus eine erhebliche Lernkurve und operativen Overhead. „Es wird später nützlich sein“ ist kein guter Grund, jetzt Komplexität hinzuzufügen.

Wann sollten Sie EKS vs. ECS verwenden?

**ECS verwenden**, wenn:

- Sie primär auf AWS sind und das einfachere, AWS-nativere Erlebnis wollen
- Ihr Team keine bestehende Kubernetes-Expertise hat
- Sie weniger operativen Overhead wollen

**EKS verwenden**, wenn:

- Sie Kubernetes-spezifische Funktionen brauchen (Custom Resource Definitions, Helm-Charts, das Kubernetes-Ökosystem)
- Ihr Team Kubernetes bereits kennt
- Sie eine hybride Umgebung betreiben (teils On-Premises, teils in AWS) und eine einheitliche Orchestrierungsschicht wollen
- Ihre Workload Anforderungen hat, die zu Kubernetes' Erweiterbarkeit passen

**Container-Networking: Ephemere IPs und Service Discovery**

Eine Sache, die Teams beim Wechsel zu Containern überrascht: Die IP-Adresse eines Containers ändert sich bei jedem Neustart.

In der EC2-Welt hatten Instanzen relativ stabile private IPs. Sie konnten sie (obwohl Sie es nicht sollten) in Konfigurationsdateien hartkodieren. Dienste kannten einander per IP.

In der Container-Welt erhält jeder Task in ECS beim Start eine IP aus dem VPC-Subnetz. Wenn er stoppt und ein neuer Task startet (als Teil eines Deployments oder eines Neustarts), erhält dieser neue Task eine andere IP.

„Was passiert, wenn ein Dienst hartkodiert ist, `10.0.1.45` aufzurufen, und dieser Container durch `10.0.1.82` ersetzt wird?“ fragte Priya. „Der aufrufende Dienst trifft auf nichts.“

Deshalb ist Service Discovery in Container-Umgebungen wichtig. ECS + Application Load Balancer handhabt das automatisch: Der DNS-Name des ALB ist stabil; ECS registriert gesunde Tasks bei der Zielgruppe; der ALB routet zu den Tasks, die gerade gesund sind. Der aufrufende Dienst spricht mit dem ALB-DNS-Namen, nicht mit einzelnen Container-IPs.

Für interne Dienst-zu-Dienst-Kommunikation (nicht nutzerseitig) bietet **AWS Cloud Map** Service Discovery: Jeder ECS-Service registriert sich bei Cloud Map, das einen stabilen DNS-Namen bereitstellt. Der Bestelldienst ruft `http://notification.nimbus.local:8080` auf, und Cloud Map löst das zu den Tasks im Benachrichtigungsdienst auf, die gerade gesund sind.

„Container sprechen also über DNS-Namen miteinander, nicht über IPs?“ bestätigte Leo.

„Korrekt. Die IP ist ephemer. Der DNS-Name ist der Vertrag.“

**Secrets-Injektion: Keine Geheimnisse in Umgebungsvariablen**

Das ursprüngliche EC2-Deployment hatte ein Problem, das Priya seit Monaten markiert hatte: Geheimnisse (Datenbankpasswort, API-Schlüssel, SES-Anmeldedaten) wurden in Umgebungsvariablen auf der EC2-Instanz gespeichert, gesetzt über ein Deployment-Skript.

Umgebungsvariablen sind für jeden Prozess zugänglich, der auf der Instanz läuft. Sie tauchen in Debugging-Tools auf, in manchen Crash-Reports und in Prozesslisten. Sie sind auch in CloudWatch sichtbar, wenn Sie sie protokollieren (was manche Entwicklungstools standardmäßig tun).

Container lösen das nicht automatisch – Sie könnten Geheimnisse immer noch als Umgebungsvariablen in der ECS-Task-Definition übergeben. Und ECS-Task-Definitionen sind in der AWS-Konsole gespeichert, sichtbar für jeden mit ECS-Zugriff.

Das korrekte Muster: **AWS Secrets Manager + ECS-Task-Definition-Integration**.

Statt das Datenbankpasswort in der Task-Definition zu speichern:

```json
"secrets": [
  {
    "name": "DB_PASSWORD",
    "valueFrom": "arn:aws:secretsmanager:us-west-2:123456789012:secret:nimbus/prod/db-password"
  }
]
```

ECS ruft das Geheimnis beim Task-Start aus dem Secrets Manager ab und injiziert es als Umgebungsvariable in den Container. Der Geheimniswert wird nie in der Task-Definition gespeichert – nur der ARN des Secrets-Manager-Geheimnisses. Der Container erhält den Wert zur Laufzeit. Secrets Manager kann den Wert rotieren, ohne die Task-Definition zu ändern.

„Und wenn jemand die Task-Definition liest?“ fragte Priya. „Er würde den Secrets-Manager-ARN sehen, aber nicht den Wert.“

„Und ohne die richtigen IAM-Berechtigungen“, bestätigte Leo, „kann er den Wert auch nicht aus Secrets Manager abrufen.“

„Das ist das Design“, sagte Priya. „Die Ausführungsrolle des Tasks hat die Berechtigung, dieses spezifische Geheimnis zu lesen. Nichts sonst. Das Kompromittieren der Task-Definition gibt dir einen ARN, kein Passwort.“

„Welches sollten wir verwenden?“ fragte Maya. „Und warum nicht Kubernetes? Es steht in jeder Stellenbeschreibung. In jedem Konferenzvortrag.“

„ECS“, sagte Priya sofort. „Wir haben keine Kubernetes-Expertise. ECS tut alles, was wir brauchen. Kubernetes jetzt hinzuzufügen würde operative Komplexität ohne praktischen Nutzen hinzufügen.“

Soo-Jin, die in ihrer letzten Firma Kubernetes-Cluster betrieben hatte, nickte. „Ich habe diesen Pager getragen. Den willst du nicht, bis du ihn brauchst.“

„Wir können später immer zu EKS migrieren, wenn wir aus ECS herauswachsen“, fügte Leo hinzu.

Das ist eine korrekte Senior-Antwort: Wählen Sie das einfachere Werkzeug, das zu Ihren aktuellen Bedürfnissen passt.

**ECR: Ihre Images absichern**

„Und was, wenn jemand versucht, über ein verwundbares Basis-Image einzubrechen?“ fragte Priya. „Jemand schnappt sich ein altes Image mit einem bekannten CVE und nutzt es, um Fuß im Anwendungscontainer zu fassen?“

Es war die richtige Frage, bevor man irgendeinen Container in Produktion deployt.

**Amazon ECR (Elastic Container Registry)** speichert Ihre Docker-Images und kann sie vor dem Deployment auf bekannte Schwachstellen scannen. ECR-Image-Scanning prüft das Image gegen eine Datenbank bekannter CVEs (Common Vulnerabilities and Exposures) und markiert Probleme nach Schweregrad.

Die Richtlinie, die Priya schrieb: Kein Image mit einem CVE des Schweregrads CRITICAL würde in Produktion deployed. Die CI/CD-Pipeline würde die Scan-Ergebnisse prüfen, bevor sie den ECS-Service aktualisierte. Wenn eine kritische Schwachstelle gefunden wurde, würde die Pipeline fehlschlagen und das Team alarmieren.

„Das ist keine Paranoia“, sagte Priya. „Das ist einfach eine Prüfung, bevor man deployt.“

**Wie Container Deployments verändern**

Vor Containern bedeutete das Deployen einer neuen Version der Nimbus-API:

1. Per SSH in jede EC2-Instanz einloggen
2. Den neuesten Code aus Git ziehen
3. Abhängigkeiten installieren/aktualisieren
4. Den Anwendungsprozess neu starten
5. Gesundheit verifizieren
6. Zur nächsten Instanz weitergehen

Das war fehleranfällig und langsam. Es erforderte Koordination. Wenn Schritt 3 auf Instanz 4 fehlschlug, hatten Sie ein gemischtes Deployment, bei dem einige Instanzen die alte Version liefen und andere die neue Version nicht ausführen konnten.

Mit ECS und Containern:

1. Ein neues Docker-Image bauen (automatisiert in der CI/CD-Pipeline)
2. Nach ECR pushen
3. Den ECS-Service aktualisieren, um die neue Image-Version zu verwenden

ECS handhabt das Rolling Deployment: startet neue Tasks mit dem neuen Image, wartet, bis sie gesund sind, und stoppt dann alte Tasks. Deployment ohne Ausfallzeit, automatisiert.

Wenn die neue Version die Gesundheitsprüfungen nicht besteht, stoppt ECS das Deployment und die alte Version bedient weiter Traffic.

**Die Deployment-Mindestkonfiguration: Gesundheitsprüfungen**

Die gesamte Sicherheit von Container-Deployments hängt davon ab, dass die Gesundheitsprüfungen tatsächlich funktionieren.

ECS verwendet zwei Arten von Gesundheitsprüfungen:

**Gesundheitsprüfung auf Containerebene**: Definiert im Dockerfile oder in der Task-Definition. Läuft innerhalb des Containers, um zu verifizieren, dass die Anwendung antwortet.

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3   CMD curl -f http://localhost:8000/health || exit 1
```

**Gesundheitsprüfung der ALB-Zielgruppe**: Der Load Balancer sendet regelmäßig HTTP-Anfragen an einen Gesundheitsendpunkt. Tasks, die die Gesundheitsprüfung nicht bestehen, werden aus der Zielgruppe entfernt.

Wenn keine der Gesundheitsprüfungen richtig konfiguriert ist, betrachtet ECS jeden Task als gesund – und wird ein kaputtes Image deployen, ohne zu stoppen. Das ist der häufigste Fehler bei Container-Deployments.

„Könnte der Gesundheitsprüfungsendpunkt interne Informationen preisgeben?“ fragte Priya.

Der Gesundheitsprüfungsendpunkt unter `/health` gab nur zurück: `{"status": "ok"}`. Keine Versionsnummern, keine Abhängigkeitszustände, keine interne Konfiguration. Jede Information in der Gesundheitsantwort könnte für jemanden nützlich sein, der die Anwendung kartiert. Halten Sie Gesundheitsendpunkte minimal.

Für detaillierten internen Gesundheitsstatus (Datenbankkonnektivität, Abhängigkeitsprüfungen) verwenden Sie einen separaten authentifizierten `/health/detail`-Endpunkt – nur innerhalb der VPC zugänglich.

**Strukturierte Protokollierung: Das einzige Fenster in einen laufenden Container**

Auf EC2 ging etwas schief und Sie loggten sich per SSH ein. Sie verfolgten die Logdatei mit tail. Sie sahen sich die Prozesstabelle an. Sie prüften die Plattennutzung. Sie stocherten herum.

In einem Container gibt es kein SSH. Der Container ist ephemer – er kann auf jedem Host im Cluster laufen, und ECS wird ihn ohne Vorwarnung ersetzen, wenn er die Gesundheitsprüfungen nicht besteht. Wenn Sie daran denken, sich per SSH einzuloggen, existiert der Container, den Sie untersuchen wollten, vielleicht nicht mehr.

Logs sind in containerisierten Umgebungen keine Debugging-Annehmlichkeit. Sie sind der einzige Beweis, dass etwas passiert ist.

„Und was, wenn ein Container still ausfällt und wir keine Logs haben?“ fragte Priya während des Architektur-Reviews für Container. „Wir könnten einen Task mit Exit-Code 1 beenden lassen und nie die Ursache erfahren, wenn die Logs nicht vor seiner Beendigung erfasst wurden.“

Das ist nicht hypothetisch. Es passiert bei ersten Container-Deployments, durchgängig.

Das korrekte Muster: Konfigurieren Sie jeden Container so, dass er strukturierte Logs an **Amazon CloudWatch Logs** sendet, mithilfe des `awslogs`-Log-Treibers. ECS übernimmt den Versand automatisch – kein Log-Agent zu installieren, kein Sidecar-Container nötig.

In der Task-Definition:

```json
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/nimbus-api",
    "awslogs-region": "us-west-2",
    "awslogs-stream-prefix": "ecs"
  }
}
```

Jede Zeile, die innerhalb des Containers nach stdout oder stderr geschrieben wird, wird erfasst und an die Log-Gruppe `/ecs/nimbus-api` gesendet, organisiert nach Task-ID. ECS erstellt für jeden Task einen neuen Log-Stream, sodass Sie die Logs für den spezifischen Container finden können, der ausgefallen ist – selbst nachdem er ersetzt wurde.

Die Task-Ausführungsrolle braucht die Berechtigung, in CloudWatch Logs zu schreiben. Ohne sie schlägt der Log-Treiber still fehl und alle Log-Ausgaben gehen verloren.

**Strukturierte Logs vs. Klartext**: Klartext-Logs („Bestellung 7741 aufgegeben“) erfordern grep. Strukturierte JSON-Logs (`{"event": "order_placed", "order_id": "7741", "restaurant_id": "47", "amount": 3200}`) können mit CloudWatch Logs Insights über eine Syntax abgefragt werden, die SQL ähnelt:

```
fields @timestamp, event, order_id, restaurant_id
| filter event = "order_placed"
| stats count(*) by restaurant_id
| sort count desc
| limit 10
```

Diese Abfrage läuft direkt gegen die Log-Gruppe. Keine Datenbank. Keine Datenpipeline. Kein ETL-Job. Die Antwort ist in Sekunden da.

Das ersetzt nicht den Analyse-Data-Lake, den wir in Kapitel 26 bauen werden. Es beantwortet operative Fragen – „wie viele Bestellungen von Restaurant 47 in den letzten 30 Minuten?“ – mitten in einem Vorfall, wenn Sie keine Zeit haben, eine Athena-Abfrage auszuführen.

**CloudWatch Container Insights**

**Container Insights** ist eine CloudWatch-Funktion, die Metriken auf Containerebene sammelt und aggregiert – CPU, Speicher, Netzwerk-I/O, Speicher-I/O – pro ECS-Cluster, -Service und -Task. Statt Metriken auf EC2-Ebene (wie geht es dem Host?) sehen Sie Metriken auf Task-Ebene (wie geht es diesem spezifischen ECS-Service?).

Aktivieren Sie es mit einer Einstellung am ECS-Cluster:

```bash
aws ecs update-cluster-settings \
  --cluster nimbus-production \
  --settings name=containerInsights,value=enabled
```

Nach dem Aktivieren:

- Sie sehen ein Dashboard pro Service: Task-Anzahl, CPU-Auslastung, Speicherauslastung
- Sie können auf Task-Ebene-CPU alarmieren (statt EC2-Host-CPU, was ein viel grobklingeres Signal ist)
- Sie können Speicherspitzen mit Log-Ereignissen korrelieren – der Task-Speicher stieg um 14:22 auf 95 %; die Logs zeigen um genau 14:21 einen Anstieg eingehender Anfragen vom Menü-Import von Restaurant 47

„Wie viel kostet das pro Monat?“ fragte Tom.

Container Insights berechnet für die benutzerdefinierten Metriken und den Log-Speicher, die es erzeugt. In Nimbus' Größenordnung (drei Services, je 3–6 Tasks) waren das etwa 12 $/Monat – ein vernünftiger Tausch für operative Sichtbarkeit auf Task-Ebene.

Leo hatte es noch am selben Tag aktiviert.

Als zum ersten Mal ein Task eine Gesundheitsprüfung nicht bestand und von ECS ersetzt wurde, erfasste das Container-Insights-Dashboard das Ereignis automatisch: Task-ID, Startzeit, Ausfallzeit, Exit-Code. Der CloudWatch-Log-Stream für diesen Task bewahrte die letzten 40 Zeilen der Ausgabe vor der Beendigung – die eine nicht abgefangene Ausnahme zeigten, ausgelöst durch ein fehlerhaftes Menü-JSON von einem neuen Restaurantpartner.

Ohne Container Insights und strukturierte Protokollierung: ein mysteriöser Anstieg der Fehlerraten, die Untersuchung erforderte SSH auf einen Host, der den ausgefallenen Task nicht mehr betreibt, 45 Minuten Rätselraten.

Mit ihnen: ein Log-Stream-Link im CloudWatch-Dashboard, die genaue Ausnahme, die Restaurant-ID, das betreffende Feld – in unter fünf Minuten.

„Kein SSH“, sagte Leo beim Durchsehen des Post-mortems. „Keine Ausfallzeit für die Untersuchung. Die Logs haben die Arbeit gemacht.“

„Die Logs machen die Arbeit nur“, sagte Priya, „wenn man sie so konfiguriert hat, dass sie erfasst werden.“


**Wann Container die falsche Wahl sind**

„Moment – aber *warum* sollten wir nicht alles containerisieren?“ fragte Maya. „Du hast mich gerade überzeugt, dass Container alle Konfigurationsdrift-Probleme lösen. Warum nicht jeden einzelnen Dienst als Container betreiben?“

Es war dieselbe Frage, die sie über Lambda gestellt hatte. Die Antwort war ähnlich.

Container fügen operative Anforderungen hinzu: Sie brauchen eine Container-Registry (ECR), eine CI/CD-Pipeline, die Images baut und pusht, einen Orchestrator (ECS), Überwachung, die auf Task-Ebene statt Instanzebene konfiguriert ist, und ein Team, das Docker und Image-Versionierung versteht.

Für einen Dienst, der bereits gut auf EC2 läuft, stabil ist und nicht unter Konfigurationsdrift leidet, können die Kosten der Containerisierung den Nutzen übersteigen.

Spezifische Fälle, in denen Container die falsche Wahl sind:

**Zustandsbehaftete Dienste, die nicht für Container-Mobilität gebaut sind**: Datenbanken in Containern erfordern sorgfältige Verwaltung dauerhafter Volumes. Die meisten Teams, die Datenbanken in Containern betreiben, verschieben sie schließlich zurück zu verwalteten Diensten (RDS, ElastiCache), nachdem sie auf diese Komplexität gestoßen sind.

**Dienste mit speziellen Hardwareanforderungen**: GPU-Workloads, spezifische Netzwerkschnittstellenkonfigurationen oder FPGA-basierte Verarbeitung erfordern EC2-Instanzen mit spezifischer Hardware. Container ändern daran nichts – Sie würden trotzdem den EC2-Launch-Typ verwenden, nur mit Containern obendrauf, und die Container-Abstraktion fügt Komplexität ohne Nutzen hinzu.

**Sehr einfache Skripte und Jobs**: Ein 40-zeiliges Python-Skript, das einmal pro Woche läuft und keine Abhängigkeitsdrift-Probleme hat. Docker, ECR, ECS-Task-Definitionen und eine CI/CD-Pipeline dafür hinzuzufügen ist unverhältnismäßig. Lambda ist einfacher. Ein einfacher EC2-Cron-Job könnte noch einfacher sein.

„Das Prinzip“, sagte Leo, „ist wie immer dasselbe: Passe das Werkzeug an das Problem an. Container lösen Konfigurationsdrift und Deployment-Konsistenz. Wenn du dieses Problem nicht hast, brauchst du keine Container.“

## AWS Batch: Container für Jobs in großem Maßstab

ECS und EKS sind für lang laufende Dienste konzipiert – Anwendungen, die ununterbrochen laufen, Anfragen annehmen und mit dem Traffic skalieren. Aber manche Workloads sind anders: Sie laufen für eine feste Dauer, verarbeiten einen definierten Datensatz und stoppen dann. Monatsabschlussrechnungen für Hunderte von Restaurants erstellen. Einen Machine-Learning-Trainingsjob ausführen. Einen nächtlichen Analyse-Export verarbeiten.

Für diese Workloads wollen Sie keinen Dienst – Sie wollen einen Job.

**AWS Batch** ist ein vollständig verwalteter Dienst, der Batch-Computing-Jobs in jeder Größenordnung ausführt. Sie definieren Ihren Job als Docker-Container (dasselbe Container-Format, das ECS verwendet), und Batch erledigt den Rest: Bereitstellung von EC2- oder Fargate-Compute, Einplanen von Jobs in Warteschlangen, Hochskalieren der Kapazität, wenn Jobs eintreffen, und zurück auf null, wenn sie fertig sind.

Schlüsselkonzepte:

- **Job-Definition:** der Docker-Container, Ressourcenanforderungen (vCPU, Speicher) und der auszuführende Befehl
- **Job-Queue:** wo eingereichte Jobs warten, bevor sie laufen; jede Queue ist mit einer oder mehreren Compute-Umgebungen verknüpft
- **Compute-Umgebung:** die zugrunde liegende EC2- oder Fargate-Kapazität. Kann Spot-Instances für bis zu 90 % Kostenersparnis nutzen – Batch handhabt Unterbrechungen und Wiederholungen automatisch

„Moment – aber *warum* sollten wir Batch verwenden, statt einfach einen ECS-Task auszuführen?“ fragte Maya.

„Weil ein ECS-Service immer an ist“, sagte Leo. „Er wartet auf Anfragen. Ein Batch-Job läuft, beendet sich, und Batch skaliert das Compute zurück auf null. Zwischen den Läufen zahlst du nichts.“

Tom blickte von der Preisseite auf. „Und Spot-Instances?“

„Batch kann auf Spot laufen. Wenn eine Spot-Instance mitten im Job zurückgefordert wird, versucht Batch es automatisch erneut. Für einen 45-minütigen Rechnungsjob ist das in Ordnung.“

**vs. ECS/EKS:** ECS/EKS betreiben Dienste – immer an, anfragegetrieben. Batch betreibt Jobs – endliche Dauer, datengetrieben, Skalierung auf null im Leerlauf.

**vs. Lambda:** Lambda hat einen 15-Minuten-Timeout. Batch-Jobs können Stunden oder Tage laufen.

Nimbus-Kontext: Der nächtliche Rechnungserstellungsjob dauert 45 Minuten für Hunderte von Restaurantpartnern. Lambda läuft nach 15 Minuten in einen Timeout. Ein immer laufender ECS-Service verschwendet 23 Stunden am Tag Geld. Batch führt den Job auf Spot-Instances aus, beendet ihn in 38 Minuten, kostet 1,20 $ und fährt herunter.

„Das ist günstiger als der Kaffee, den ich gekauft habe, während ich auf das alte Skript gewartet habe“, sagte Leo.

„Und kein EC2 zu verwalten“, fügte Priya hinzu. „Batch stellt es bereit, führt es aus, beendet es.“

## Stärken und Grenzen

**Container**:

- Beseitigen Umgebungsinkonsistenz („funktioniert auf meinem Rechner“)
- Ermöglichen schnelle, zuverlässige Deployments
- Unveränderlich – dasselbe Image läuft überall identisch
- Effizient – leichter als VMs, schnellerer Start

**ECS**:

- Einfacher als Kubernetes für AWS-zentrierte Workloads
- Enge AWS-Integration (IAM, ALB, CloudWatch, Secrets Manager)
- Fargate-Option beseitigt die EC2-Verwaltung vollständig

**EKS**:

- Vollständige Kubernetes-Kompatibilität – das gesamte Ökosystem nutzen
- Besser für hybride Umgebungen oder Teams mit Kubernetes-Expertise
- Komplexer einzurichten und zu betreiben als ECS

**Wo es kompliziert wird**:

- Container-Images müssen gebaut und versioniert werden – erfordert eine CI/CD-Pipeline
- Das Debuggen von Containern erfordert andere Werkzeuge als das Debuggen traditioneller Prozesse
- Zustandsbehaftete Container (Datenbanken in Containern) erfordern sorgfältige Konfiguration des dauerhaften Speichers
- Networking zwischen Containern (Dienst-zu-Dienst-Kommunikation) erfordert das Verständnis von Container-Networking-Konzepten

## Zusammenfassung

Lambda machte ungenutztes Compute kostenlos. Container machten Deployment deterministisch. Zusammen lösten sie zwei der häufigsten Ursachen für operativen Schmerz bei wachsenden Engineering-Teams.

- **Container** verpacken Anwendungscode, Laufzeit und Abhängigkeiten zusammen – laufen überall identisch.
- **Docker** ist die Standard-Container-Technologie. Images sind Baupläne; Container sind laufende Instanzen.
- **ECR (Elastic Container Registry)** ist AWS' verwaltete Docker-Registry – speichern, versionieren und scannen Sie hier Ihre Images. Aktivieren Sie das Image-Scanning, um CVEs vor dem Deployment zu erkennen.
- **ECS (Elastic Container Service)** orchestriert Container. Sie definieren Tasks und Services; ECS verwaltet Platzierung und Lebenszyklus.
- **Fargate** ist serverloses Compute für Container – keine EC2-Instanzen zu verwalten. Oft günstiger als der EC2-Launch-Typ in kleinen Größenordnungen, da der EC2-Overhead entfällt. In größeren Größenordnungen mit sorgfältigem Task-Bin-Packing kann der EC2-Launch-Typ kosteneffektiver werden.
- **EKS (Elastic Kubernetes Service)** ist verwaltetes Kubernetes – für Teams, die Kubernetes-Funktionen oder -Kompatibilität brauchen.
- **Secrets-Manager-Integration**: Injizieren Sie Geheimnisse beim Start über die Task-Definition in Container – speichern Sie Geheimniswerte nicht direkt in Umgebungsvariablen oder Task-Definitionen.
- **Service Discovery**: Container-IPs sind ephemer. Verwenden Sie ALB-DNS-Namen oder Cloud Map für stabile Dienstadressierung.
- Wählen Sie ECS für Einfachheit auf AWS; wählen Sie EKS für Kubernetes-Ökosystem-Kompatibilität.

## Prüfungstipps

*SAA-C03-Domäne: Entwurf widerstandsfähiger Architekturen (Domäne 2, Aufgabe 2.1)*

- **ECS vs. EKS-Signale**: Prüfungsszenarien, die „Kubernetes“, „Helm“, „bestehende Kubernetes-Expertise“ oder „Multi-Cloud-Container-Orchestrierung“ erwähnen → EKS. Alles andere → ECS.
- **Fargate vs. EC2-Launch-Typ**: „Keine EC2-Instanzen für Container verwalten wollen“, „serverlose Container“, „keine Infrastrukturverwaltung“ → Fargate. „Spezifische Instanztypen brauchen“, „GPU-Workloads“, „feinkörnige Instanzkontrolle“ → EC2-Launch-Typ.
- **Task-Rolle vs. Task-Ausführungsrolle** – ein echter Prüfungsunterscheider. Die **Task-Ausführungsrolle** wird vom ECS-*Agenten* im Auftrag des Tasks verwendet, vor und um Ihren Code herum: das Image aus ECR ziehen, Geheimnisse aus Secrets Manager abrufen, Logs nach CloudWatch schreiben. Die **Task-Rolle** ist das, was *Ihr Anwendungscode innerhalb des Containers* verwendet, um AWS-Dienste aufzurufen: aus S3 lesen, in DynamoDB schreiben – wie EC2-Instanzrollen, aber pro Task, sodass jeder Task andere Berechtigungen haben kann. „Container muss aus S3 lesen“ → **Task-Rolle** (in der Task-Definition angehängt). „Task kann sein Image nicht ziehen / kann sein Geheimnis nicht abrufen“ → der **Ausführungsrolle** fehlen Berechtigungen.
- **Fargate Spot**: Betreiben Sie fehlertolerante Container auf freier Kapazität für bis zu ~70 % Rabatt, mit einer zweiminütigen Unterbrechungswarnung – Fargates Äquivalent zu EC2 Spot, konfiguriert über Capacity Provider. Prüfungsauslöser: „unterbrechungstolerante Container zu niedrigsten Kosten ohne Instanzverwaltung betreiben“ → Fargate Spot.
- **ECR-Image-Scanning**: ECR kann Container-Images auf bekannte Schwachstellen (CVEs) scannen. Prüfungssignal: „Container auf Sicherheitslücken scannen“ → ECR-Image-Scanning.
- **Blue/Green-Deployments**: ECS unterstützt Blue/Green-Deployments über CodeDeploy-Integration. Deployment ohne Ausfallzeit mit automatischem Rollback. Prüfungsmuster: „ohne Ausfallzeit mit automatischem Rollback deployen“ → ECS + CodeDeploy Blue/Green.
- **Secrets-Manager-Integration**: Prüfungssignal: „Geheimnisse in Container injizieren, ohne Werte in Task-Definitionen zu speichern“ → das `secrets`-Feld in der Task-Definition verwenden, das auf einen Secrets-Manager-ARN verweist. Die Task-Ausführungsrolle braucht die `secretsmanager:GetSecretValue`-Berechtigung.
- **ECS Service Auto Scaling**: Skalieren Sie die Anzahl der Tasks basierend auf CPU, Speicher oder benutzerdefinierten CloudWatch-Metriken. Funktioniert mit ALB, um Traffic an die richtige Anzahl laufender Tasks zu routen.
- **AWS Batch:** Verwaltetes Batch-Compute für Docker-Container. Job-Queue → Compute-Umgebung (EC2 oder Fargate, unterstützt Spot). Verwenden, wenn: der Lambda-Timeout zu kurz ist, ein ECS-Service für endliche Jobs verschwenderisch ist. Prüfungsauslöser: „Batch-Verarbeitung in großem Maßstab“ oder „Job, der Stunden läuft“ → AWS Batch.

## Übungen

**Übung 1 — Erinnerung**

Erklären Sie den Unterschied zwischen einem Docker-Image und einem Docker-Container. Erklären Sie den Unterschied zwischen ECS und ECR.

*(Hinweis: Image verhält sich zu Container wie ein Rezept zu einem gekochten Gericht. ECR speichert Images; ECS führt sie aus.)*

**Übung 2 — SAA-C03-Szenario**

*Szenario*: Ein Unternehmen hat eine Microservices-Anwendung, die derzeit auf manuell verwalteten EC2-Instanzen läuft. Das Team kämpft mit inkonsistenten Deployments – verschiedene EC2-Instanzen haben unterschiedliche Bibliotheksversionen, was schwer reproduzierbare Fehler verursacht. Sie wollen Deployments standardisieren und gleichzeitig den operativen Aufwand für die Verwaltung der zugrunde liegenden Server minimieren. Das Team hat keine Kubernetes-Erfahrung.

Welche Lösung erfüllt diese Anforderungen am BESTEN?

A) Die Anwendung mit Docker containerisieren; Amazon ECS mit dem Fargate-Launch-Typ verwenden  
B) Auf EC2 deployen mit AWS Systems Manager Patch Manager, um Instanzen konsistent zu halten  
C) Die Anwendung mit Docker containerisieren; Amazon EKS mit selbstverwalteten Node-Gruppen verwenden  
D) AWS Elastic Beanstalk verwenden, um Deployments und Instanzkonfiguration automatisch zu verwalten

**Hinweis 1**: Container lösen das Problem der „inkonsistenten Umgebung“ direkt. Welche Optionen verwenden Container?

**Hinweis 2**: „Operativen Aufwand für die Serververwaltung minimieren“ → Fargate (keine EC2-Verwaltung) vs. selbstverwaltete Nodes (immer noch EC2 verwalten).

**Hinweis 3**: „Keine Kubernetes-Erfahrung“ → EKS ist mehr operative Komplexität als ECS.

**Antwort**: A

**Erläuterung**: Die Containerisierung mit Docker stellt sicher, dass jedes Deployment dasselbe Image mit denselben Abhängigkeiten verwendet – was Konfigurationsdrift beseitigt. ECS mit Fargate bedeutet keine EC2-Instanzen zu verwalten. Das Team konzentriert sich auf Anwendungscode und Container-Definitionen, nicht auf Serverwartung. ECS (nicht EKS) ist für Teams ohne Kubernetes-Erfahrung geeignet.

**Warum nicht B?** Patch Manager hält EC2-Instanzen aktuell, löst aber nicht die Inkonsistenz der Bibliotheksversionen zwischen Anwendungen. Das grundlegende Problem (verschiedene Code-Umgebungen auf verschiedenen Instanzen) bleibt.

**Warum nicht C?** EKS mit selbstverwalteten Node-Gruppen erfordert sowohl die Verwaltung von EC2-Instanzen *als auch* das Erlernen von Kubernetes. Keines passt zu den Anforderungen.

**Warum nicht D?** Elastic Beanstalk verwaltet das Anwendungs-Deployment auf EC2, löst aber nicht die grundlegende Umgebungsinkonsistenz, es sei denn, es werden Container verwendet. Beanstalk verwendet standardmäßig keine Docker-Images (kann aber dafür konfiguriert werden).

*SAA-C03-Domäne: Entwurf widerstandsfähiger Architekturen — Aufgabe 2.1*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nimbus teilt die monolithische API in drei Microservices auf: den Bestelldienst, den Menüdienst und den Benachrichtigungsdienst. Jeder Dienst hat unterschiedliche Skalierungsanforderungen (der Bestelldienst skaliert mit dem Traffic; der Menüdienst ist größtenteils nur lesend und stabil; der Benachrichtigungsdienst hat sprunghafte Bursts).

Entwerfen Sie die ECS-Architektur für diese drei Dienste. Wie würden Sie die Dienst-zu-Dienst-Kommunikation handhaben? Würden Sie einen ECS-Cluster oder drei verwenden? Wie würden Sie Auto Scaling für jeden Dienst unterschiedlich konfigurieren?

Bedenken Sie: Der Menüdienst ist leselastig und könnte 60 Sekunden lang veraltete Daten ausliefern – würden Sie ihm Caching vorschalten? Der Benachrichtigungsdienst skaliert an Freitagabenden stark in Bursts – würden Sie die Fargate-Mindestkapazität auf 1 und das Maximum auf 20 setzen? Was passiert mit laufenden Benachrichtigungen während eines Scale-down-Ereignisses?

*(Es gibt keine einzige richtige Antwort. Das Ziel ist, Microservices-Architektur auf ECS zu üben.)*

## Post-Credits-Szene

Das erste Container-Deployment war makellos.

Neue Version der API: null Ausfallzeit. ECS rollte sie aus, die Gesundheitsprüfungen bestanden, alte Tasks bauten ab, neue Tasks übernahmen. Leo beobachtete den Task-Status in der Konsole mit etwas, das an Ungläubigkeit grenzte.

„Es hat einfach funktioniert“, sagte er.

„Letzte Woche hast du dasselbe über das manuelle SSH-Deployment gesagt, bevor es auf Instanz drei fehlschlug“, sagte Priya.

„Ich habe es schon deployed – oh.“ Leo hielt inne. „Ich habe deployed, ohne die Image-Version zu taggen. Lass mich das beheben.“

„Das ist der Punkt“, sagte Priya. „Image-Versionierung ist, wie du nachverfolgst, was läuft.“

„Woher weißt du, welche Version gerade in Produktion ist?“ fragte Maya.

Leo rief die ECS-Konsole auf. Unter dem laufenden Task war das Image aufgeführt: `123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.3`. Version 1.0.3. Gebaut um 14:22 UTC. Deployed um 14:31 UTC.

„Beim alten EC2-Setup“, sagte Leo, „hätte ich mich per SSH in eine Instanz einloggen und `pip show` ausführen müssen, um zu sehen, welche Version jeder Abhängigkeit installiert war. Und sie hätte auf den anderen Instanzen anders sein können.“

„Und jetzt?“

„Das Tag auf dem Image sagt mir genau, was läuft. Die ECR-Scan-Historie sagt mir, ob es gescannt wurde. Die ECS-Deployment-Historie sagt mir, wann es deployed wurde und was die vorherige Version war.“

„Kein SSH. Keine Ausfallzeit. Kein ‚warte, bis es neu startet‘.“

„Das Image ist das Deployment-Artefakt“, sagte Priya. „Die Umgebung ist unveränderlich. Der Deployment-Prozess ist deklarativ. So sollte Software ausgeliefert werden.“

Leo starrte noch einen Moment auf die Konsole.

„Ich habe drei Jahre damit verbracht, EC2-Deployments zu koordinieren“, sagte er. „SSH-Skripte zu koordinieren. Deployment-Runbooks zu schreiben.“

„Du hast ein Problem gelöst“, sagte Priya, „das Container by Design lösen.“

Er sagte danach nichts mehr. Aber am nächsten Morgen begann er, Dokumentation über den Container-Build-Prozess zu schreiben, damit niemand sonst drei Jahre damit verbringen müsste, es herauszufinden.

Der Instanz-drei-Fehler, die sechs Wochen undokumentierten Drifts und die ähnlichen Probleme, die sie noch nicht gefunden hatten – all das hatte eine einzige Grundursache. Kein böswilliger Akteur. Kein Hardwarefehler. Nur ein Server, der wie ein dauerhaftes Inventar behandelt worden war statt wie eine Wegwerfeinheit.

Der Container war die Antwort darauf. Nicht, weil er neu und interessant war. Sondern weil er die Frage unmöglich zu stellen machte.

Im nächsten Kapitel: das Flussdiagramm, das sich selbst ausführt – und sich merkt, wo es aufgehört hat.
