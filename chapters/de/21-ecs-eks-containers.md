# Kapitel 21: Versandcontainer für Code

„Es funktioniert auf meinem Rechner."

Leo hatte gelernt, das nicht laut zu sagen. Es war keine Verteidigung – es war eine Diagnose. Und die Diagnose lautete diesmal: Produktions-EC2-Instanz Nummer drei, die vor sechs Wochen einen Bibliotheks-Patch erhalten hatte, den niemand dokumentiert hatte, den die anderen beiden Instanzen nicht erhalten hatten und der nun einen Fehler verursachte, der nur dort existierte, in jener einen Instanz, überall sonst unsichtbar.

Er hatte die vergangene Nacht drei Stunden damit verbracht, ihn aufzuspüren.

„Jedes Mal, wenn wir deployen", sagte er am nächsten Morgen, „koordinieren wir über mehrere Instanzen hinweg. Neue Version, unterschiedliche Abhängigkeiten. Funktioniert in der Staging-Umgebung, bricht in der Produktion zusammen, weil die Umgebungen auseinanderdriftet sind."

„Weil jemand ein Paket auf Instanz drei aktualisiert hat, ohne die anderen zu aktualisieren", sagte Priya. Nicht unfreundlich.

„Ich brauchte eine bestimmte Version von—"

„Ich weiß", sagte sie. „Und jetzt hat Instanz drei eine andere Geschichte als Instanz eins und zwei. Das ist Konfigurationsdrift. Es ist still, bis es das nicht mehr ist."

Lambda hatte das Leerlauf-Server-Problem für Nimbus' kleinere Dienste gelöst. Aber die Kern-API – diejenige, die den gesamten Bestelltraffic trägt – lief noch auf EC2. Und EC2-Instanzen akkumulierten, im Gegensatz zu Funktionen, Geschichte.

„Was ist die eigentliche Lösung?", fragte Maya.

„Hör auf, Server wie dauerhafte Dinge zu behandeln, die man konfiguriert", sagte Priya. „Fang an, sie wie Wegwerfeinheiten zu behandeln, die man ersetzt."

Es gibt eine Analogie, die das so präzise erklärt, dass sie in fast jeder Erklärung von Software-Containern vorkommt. Sie stammt aus dem Jahr 1956 und hat nichts mit Software zu tun. Die Antwort, als jemand schließlich fragte „Was ist die Lösung, um Waren zuverlässig über verschiedene Träger zu transportieren?", lautete: Standardisiere den Container. Versende die Box, nicht nur den Inhalt.

**Was ist ein Container?**

Ein **Container** ist eine leichtgewichtige, portable Einheit, die deine Anwendung zusammen mit allem verpackt, was sie zum Ausführen benötigt: die Laufzeit (Python 3.11, Node.js 20, Java 17), die Bibliotheken und Abhängigkeiten, Konfigurationsdateien und den Anwendungscode selbst.

Im Gegensatz zu einer virtuellen Maschine (die einen gesamten Computer einschließlich des Betriebssystem-Kernels emuliert) teilt ein Container den Host-OS-Kernel, während alles andere isoliert bleibt. Das macht Container schnell zu starten (Sekunden, manchmal Millisekunden) und klein (Megabyte, nicht Gigabyte).

Die populärste Container-Technologie ist **Docker**. Ein Docker-Image ist der Bauplan – ein Snapshot der Anwendung und ihrer Umgebung. Ein Docker-Container ist eine laufende Instanz dieses Images.

Die entscheidende Eigenschaft: **Unveränderlichkeit**. Ein heute erstelltes Image läuft identisch auf jedem Host, der Docker unterstützt – einem Laptop, einer EC2-Instanz, einem Server in einem anderen Rechenzentrum. Die Umgebung ist eingebaut. Konfigurationsdrift ist unmöglich.

„Also anstatt uns Sorgen zu machen, was auf der EC2-Instanz installiert ist", sagte Leo, „erstellen wir ein Image, das alles hat. Das Image läuft überall gleich."

„Und wenn du es lokal testen musst, führst du dasselbe Image aus", ergänzte Priya. „Kein ‚Es funktioniert auf meinem Rechner' mehr."

**Amazon ECS: Der Orchestrator**

Einen einzelnen Container zu betreiben ist einfach. Dutzende Container über mehrere Hosts hinweg zu betreiben, Traffic zwischen ihnen weiterzuleiten, ausgefallene Container neu zu starten, neue Versionen ohne Ausfallzeiten zu deployen – das erfordert einen **Orchestrator**.

**Amazon ECS (Elastic Container Service)** ist der verwaltete Container-Orchestrierungsdienst von AWS. Man definiert:

- **Aufgabendefinition**: Welches Container-Image ausgeführt werden soll, wie viel CPU und Speicher, welche Umgebungsvariablen, welche Ports freizugeben sind
- **Service**: Wie viele Kopien der Aufgabe ausgeführt werden sollen, wie Fehler und Deployments behandelt werden
- **Cluster**: Die zugrunde liegende Recheninfrastruktur

ECS erledigt den Rest: Aufgaben auf verfügbarer Kapazität platzieren, ausgefallene Aufgaben neu starten, Verbindungen während Deployments ablaufen lassen, gesunde Aufgaben beim Load Balancer registrieren.

Bei Nimbus wurde die API von EC2-Instanzen mit manuell verwalteten Deployments auf ECS umgestellt. Jedes neue Deployment schickte ein neues Docker-Image an **Amazon ECR (Elastic Container Registry)** – das verwaltete Container-Registry von AWS – und ECS rollte es mit null Ausfallzeiten über alle Aufgaben aus.

**Fargate vs. EC2-Launch-Typ**

ECS kann Container in zwei Modi betreiben:

**EC2-Launch-Typ**: Man verwaltet die zugrunde liegenden EC2-Instanzen. Man ist für das Patching der Instanzen, deren richtige Größe und die Sicherstellung ausreichender Kapazität für die Container verantwortlich. Mehr Kontrolle, mehr Verantwortung.

**Fargate (serverloses Computing für Container)**: AWS verwaltet die zugrunde liegende Infrastruktur vollständig. Man gibt CPU und Speicher pro Aufgabe an; Fargate stellt die richtige Kapazität automatisch bereit. Keine EC2-Instanzen zu verwalten. Man bezahlt pro vCPU-Sekunde und GB-Sekunde Speicher.

Fargate ist das „serverlose Container"-Modell – man bekommt die Umgebungsisolierung von Containern ohne Serververwaltung. Der Kompromiss: weniger Kontrolle über die Konfiguration der zugrunde liegenden Instanz und etwas höhere Kosten pro Einheit.

Bei Nimbus: Fargate für den API-Dienst. Sie wollten keine EC2-Instanzen für Container verwalten.

**Amazon EKS: Wenn man Kubernetes braucht**

**Kubernetes** ist ein quelloffenes Container-Orchestrierungssystem – im Wesentlichen der Industriestandard für die Verwaltung von Containern in großem Maßstab. Es ist leistungsstark, erweiterbar und komplex.

**Amazon EKS (Elastic Kubernetes Service)** ist der verwaltete Kubernetes-Dienst von AWS. Er betreibt die Kubernetes-Kontrollebene (die Verwaltungsschicht) für einen, während man die Worker-Knoten verwaltet (oder auch dafür Fargate verwendet).

Wann sollte man EKS vs. ECS verwenden?

**ECS verwenden**, wenn:

- Man primär auf AWS ist und das einfachere, stärker AWS-native Erlebnis möchte
- Das Team keine bestehenden Kubernetes-Kenntnisse hat
- Man weniger operativen Aufwand möchte

**EKS verwenden**, wenn:

- Man Kubernetes-spezifische Funktionen benötigt (Custom Resource Definitions, Helm-Charts, das Kubernetes-Ökosystem)
- Das Team bereits Kubernetes kennt
- Man eine hybride Umgebung betreibt (einige On-Premises, einige in AWS) und eine einheitliche Orchestrierungsschicht möchte
- Der Workload Anforderungen hat, die Kubernetes' Erweiterbarkeit entsprechen

„Welches sollten wir verwenden?", fragte Maya.

„ECS", sagte Priya sofort. „Wir haben keine Kubernetes-Kenntnisse. ECS erledigt alles, was wir brauchen. Kubernetes jetzt hinzuzufügen würde operative Komplexität ohne praktischen Nutzen hinzufügen."

„Wir können später immer zu EKS migrieren, wenn wir ECS entwachsen sind", ergänzte Leo.

Das ist eine korrekte Senior-Antwort: Wähle das einfachere Werkzeug, das deinen aktuellen Bedürfnissen entspricht.

**Wie Container Deployments verändern**

Vor Containern bedeutete das Deployen einer neuen Version der Nimbus-API:

1. Per SSH in jede EC2-Instanz einloggen
2. Den neuesten Code aus Git holen
3. Abhängigkeiten installieren/aktualisieren
4. Den Anwendungsprozess neu starten
5. Gesundheit überprüfen
6. Zur nächsten Instanz weitergehen

Das war fehleranfällig und langsam. Es erforderte Koordination. Wenn Schritt 3 auf Instanz 4 fehlschlug, hatte man ein gemischtes Deployment, bei dem einige Instanzen die alte Version liefen und einige die neue Version nicht ausführen konnten.

Mit ECS und Containern:

1. Ein neues Docker-Image erstellen (automatisiert in der CI/CD-Pipeline)
2. Nach ECR pushen
3. Den ECS-Service aktualisieren, um die neue Image-Version zu verwenden

ECS übernimmt das Rolling Deployment: startet neue Aufgaben mit dem neuen Image, wartet darauf, dass sie gesund sind, dann stoppt alte Aufgaben. Deployment ohne Ausfallzeiten, automatisiert.

Wenn die neue Version Gesundheitsprüfungen nicht besteht, stoppt ECS das Deployment und die alte Version bedient weiterhin Traffic.

## Stärken und Grenzen

**Container**:

- Beseitigen Umgebungsinkonsistenz („funktioniert auf meinem Rechner")
- Ermöglichen schnelle, zuverlässige Deployments
- Unveränderlich – dasselbe Image läuft überall identisch
- Effizient – leichter als VMs, schnellerer Start

**ECS**:

- Einfacher als Kubernetes für AWS-zentrierte Workloads
- Enge AWS-Integration (IAM, ALB, CloudWatch, Secrets Manager)
- Fargate-Option beseitigt EC2-Verwaltung vollständig

**EKS**:

- Vollständige Kubernetes-Kompatibilität – das gesamte Ökosystem nutzen
- Besser für hybride Umgebungen oder Teams mit Kubernetes-Kenntnissen
- Komplexer einzurichten und zu betreiben als ECS

**Wo es kompliziert wird**:

- Container-Images müssen erstellt und versioniert werden – erfordert eine CI/CD-Pipeline
- Debugging von Containern erfordert andere Werkzeuge als das Debugging traditioneller Prozesse
- Zustandsbehaftete Container (Datenbanken in Containern) erfordern sorgfältige Konfiguration des dauerhaften Speichers
- Netzwerk zwischen Containern (Dienst-zu-Dienst-Kommunikation) erfordert das Verstehen von Container-Netzwerkkonzepten

## Zusammenfassung

- **Container** verpacken Anwendungscode, Laufzeit und Abhängigkeiten zusammen – laufen überall identisch.
- **Docker** ist die Standard-Container-Technologie. Images sind Baupläne; Container sind laufende Instanzen.
- **ECR (Elastic Container Registry)** ist das verwaltete Docker-Registry von AWS – Images hier speichern und versionieren.
- **ECS (Elastic Container Service)** orchestriert Container. Man definiert Aufgaben und Services; ECS verwaltet Platzierung und Lebenszyklus.
- **Fargate** ist serverloses Computing für Container – keine EC2-Instanzen zu verwalten.
- **EKS (Elastic Kubernetes Service)** ist verwaltetes Kubernetes – für Teams, die Kubernetes-Funktionen oder -Kompatibilität benötigen.
- ECS für Einfachheit auf AWS wählen; EKS für Kubernetes-Ökosystem-Kompatibilität wählen.

## Prüfungstipps

*SAA-C03-Domäne: Resiliente Architekturen entwerfen (Domäne 2, Aufgabe 2.1)*

- **ECS vs. EKS-Signale**: Prüfungsszenarien, die „Kubernetes", „Helm", „bestehende Kubernetes-Kenntnisse" oder „Multi-Cloud-Container-Orchestrierung" erwähnen → EKS. Alles andere → ECS.
- **Fargate vs. EC2-Launch-Typ**: „Keine EC2-Instanzen für Container verwalten wollen", „serverlose Container", „keine Infrastrukturverwaltung" → Fargate. „Spezifische Instanztypen benötigen", „GPU-Workloads", „feinkörnige Instanzsteuerung" → EC2-Launch-Typ.
- **ECS-Aufgabenrollen**: Wie EC2-Instanzrollen haben ECS-Aufgaben IAM-Rollen. Jede Aufgabe kann unterschiedliche Berechtigungen haben. Prüfungsszenario: „Container muss aus S3 lesen" → IAM-Rolle an die Aufgabendefinition anhängen.
- **ECR-Image-Scanning**: ECR kann Container-Images auf bekannte Schwachstellen (CVEs) scannen. Prüfungssignal: „Container auf Sicherheitslücken scannen" → ECR-Image-Scanning.
- **Blue/Green-Deployments**: ECS unterstützt Blue/Green-Deployments über CodeDeploy-Integration. Deployment ohne Ausfallzeiten mit automatischem Rollback. Prüfungsmuster: „Ohne Ausfallzeiten deployen mit automatischem Rollback" → ECS + CodeDeploy Blue/Green.
- **ECS Service Auto Scaling**: Anzahl der Aufgaben basierend auf CPU, Speicher oder benutzerdefinierten CloudWatch-Metriken skalieren. Funktioniert mit ALB, um Traffic an die richtige Anzahl laufender Aufgaben weiterzuleiten.

## Übungen

**Übung 1 – Wiederholen**

Erkläre den Unterschied zwischen einem Docker-Image und einem Docker-Container. Erkläre den Unterschied zwischen ECS und ECR.

*(Hinweis: Image verhält sich zu Container wie ein Rezept zu einem gekochten Gericht. ECR speichert Images; ECS führt sie aus.)*

**Übung 2 – Prüfungsübung**

*Szenario*: Ein Unternehmen hat eine Microservices-Anwendung, die derzeit auf manuell verwalteten EC2-Instanzen läuft. Das Team kämpft mit inkonsistenten Deployments – verschiedene EC2-Instanzen haben unterschiedliche Bibliotheksversionen, was schwer reproduzierbare Fehler verursacht. Sie wollen Deployments standardisieren und dabei den operativen Aufwand für die Verwaltung der zugrunde liegenden Server minimieren. Das Team hat keine Kubernetes-Kenntnisse.

Welche Lösung erfüllt diese Anforderungen OPTIMAL?

A) Auf EC2 deployen mit AWS Systems Manager Patch Manager, um Instanzen konsistent zu halten  
B) Die Anwendung mit Docker containerisieren; Amazon ECS mit dem Fargate-Launch-Typ verwenden  
C) Die Anwendung mit Docker containerisieren; Amazon EKS mit selbstverwalteten Knotengruppen verwenden  
D) AWS Elastic Beanstalk verwenden, um Deployments und Instanzkonfiguration automatisch zu verwalten

**Hinweis 1**: Container lösen das Problem der „inkonsistenten Umgebung" direkt. Welche Optionen verwenden Container?

**Hinweis 2**: „Operativen Aufwand für die Verwaltung von Servern minimieren" → Fargate (keine EC2-Verwaltung) vs. selbstverwaltete Knoten (EC2 noch verwalten).

**Hinweis 3**: „Keine Kubernetes-Kenntnisse" → EKS ist mehr operative Komplexität als ECS.

**Antwort**: B

**Erläuterung**: Das Containerisieren mit Docker stellt sicher, dass jedes Deployment dasselbe Image mit denselben Abhängigkeiten verwendet – Konfigurationsdrift wird beseitigt. ECS mit Fargate bedeutet, keine EC2-Instanzen zu verwalten. Das Team konzentriert sich auf Anwendungscode und Container-Definitionen, nicht auf Serverwartung. ECS (nicht EKS) ist für Teams ohne Kubernetes-Kenntnisse geeignet.

**Warum nicht A?** Patch Manager hält EC2-Instanzen aktuell, löst aber nicht die Inkonsistenz der Bibliotheksversionen zwischen Anwendungen. Das grundlegende Problem (verschiedene Code-Umgebungen auf verschiedenen Instanzen) bleibt.

**Warum nicht C?** EKS mit selbstverwalteten Knotengruppen erfordert sowohl EC2-Instanzen zu verwalten als auch Kubernetes zu erlernen. Beides stimmt nicht mit den Anforderungen überein.

**Warum nicht D?** Elastic Beanstalk verwaltet Application-Deployment auf EC2, löst aber nicht das grundlegende Problem der Umgebungsinkonsistenz, wenn keine Container verwendet werden. Beanstalk verwendet standardmäßig keine Docker-Images (kann aber konfiguriert werden).

*SAA-C03-Domäne: Resiliente Architekturen entwerfen – Aufgabe 2.1*

**Übung 3 – Architektur-Challenge** *(Optional)*

Nimbus teilt die monolithische API in drei Microservices auf: den Bestelldienst, den Menüdienst und den Benachrichtigungsdienst. Jeder Dienst hat unterschiedliche Skalierungsanforderungen (der Bestelldienst skaliert mit dem Traffic; der Menüdienst ist größtenteils lesend und stabil; der Benachrichtigungsdienst hat unregelmäßige Spitzenlasten).

Entwirf die ECS-Architektur für diese drei Dienste. Wie würdest du die Dienst-zu-Dienst-Kommunikation handhaben? Würdest du einen ECS-Cluster oder drei verwenden? Wie würdest du Auto Scaling für jeden Dienst unterschiedlich konfigurieren?

*(Es gibt keine einzige richtige Antwort. Das Ziel ist es, Microservices-Architektur auf ECS zu üben.)*

## Post-Credits-Szene

Das erste Container-Deployment war makellos.

Neue Version der API: null Ausfallzeiten. ECS rollte es aus, Gesundheitsprüfungen bestanden, alte Aufgaben wurden abgebaut, neue Aufgaben übernahmen. Leo beobachtete den Aufgabenstatus in der Konsole mit etwas, das an Ungläubigkeit grenzte.

„Es hat einfach funktioniert", sagte er.

„Das ist der Punkt", sagte Priya.

„Kein SSH. Keine Ausfallzeiten. Kein ‚Warte, bis es neu startet.'"

„Das Image ist das Deployment-Artefakt", sagte sie. „Die Umgebung ist unveränderlich. Der Deployment-Prozess ist deklarativ. So sollte Software ausgeliefert werden."

Leo starrte noch einen Moment auf die Konsole.

„Ich habe drei Jahre damit verbracht, EC2-Deployments zu koordinieren", sagte er. „SSH-Skripte zu koordinieren. Deployment-Runbooks zu schreiben."

„Du hast ein Problem gelöst", sagte Priya, „das Container by Design lösen."

Er sagte danach nichts mehr. Aber am nächsten Morgen begann er, Dokumentation über den Container-Build-Prozess zu schreiben, damit niemand sonst drei Jahre damit verbringen müsste, das herauszufinden.

Im nächsten Kapitel: das Flussdiagramm, das sich selbst ausführt – und sich merkt, wo es aufgehört hat.
