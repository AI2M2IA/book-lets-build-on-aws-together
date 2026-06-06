# Kapitel 33: Es kommt darauf an

Atmen Sie ein letztes Mal durch, bevor Sie dieses Kapitel lesen.

Der Cursor blinkte auf Mayas leerer Folie. Titel: „Architektur bei Nimbus.“ Sie löschte ihn und tippte: „Die Frage.“ Dann sah sie in den Raum und merkte, dass sie die Folie überhaupt nicht brauchte.

**Rückblick: Vom Review zur Präsentation**

Der Architektur-Review mit Carlos – sechs Monate und mehrere hundert Restaurant-Starts lagen jetzt hinter ihnen – hatte dem Team einen Stapel ADRs und eine klarere Art hinterlassen, über Entscheidungen nachzudenken, bevor sie ausgeliefert wurden. Maya hatte sich auf die Investorenpräsentation vorbereitet, als ihr klar wurde, dass alles, was Carlos gefragt hatte – und alles, was sie selbstbewusst beantwortet hatte –, auf dieselbe zugrunde liegende Logik hinauslief. Die Investoren würden nach dem Warum fragen. Sie hatte in zwei Jahren des Aufbaus von Nimbus gelernt, dass die Antwort nie der Dienstname war. Die Antwort waren immer die Bedingungen, die einen Dienst richtig und einen anderen falsch machten. Sie würde gleich einen Raum voller Menschen betreten, die sie bitten würden, jede architektonische Entscheidung zu verteidigen. Sie war bereit.

**Die Frage**

Am Ende fast jeder Architekturdiskussion fragt schließlich jemand: „Was ist die richtige Antwort?“

Und die nützlichste, frustrierendste, ehrlichste und missverstandenste Antwort in der gesamten Softwareentwicklung ist:

**Es kommt darauf an.**

Nicht, weil die Frage unbeantwortbar ist. Nicht, weil der Experte ausweichend ist. Sondern weil die richtige Antwort tatsächlich, strukturell, von Kontext abhängt, der nicht in der Frage enthalten war.

In diesem Kapitel geht es darum zu lernen, „es kommt darauf an“ richtig zu sagen – was bedeutet, in der Lage zu sein, den Satz zu vervollständigen.

Stellen Sie sich einen Arzt vor, der gefragt wird: „Ist eine Operation die richtige Behandlung?“ Ein schlechter Arzt sagt ja oder nein, ohne den Patienten zu untersuchen. Ein guter Arzt sagt: „Es kommt darauf an – auf die Diagnose, das Alter des Patienten, seine anderen Erkrankungen und darauf, was passiert, wenn wir warten.“ Die Antwort ist keine Ausflucht. Es ist Präzision. „Es kommt darauf an“, gefolgt von einem vollständigen Satz, ist das Nützlichste, was ein Arzt – oder ein Architekt – sagen kann.

**Das Ende von Nimbus**

Zweieinhalb Jahre nach dem Anfang. Maya stand in einem Konferenzraum in Seattle und präsentierte vor einem Raum voller Venture-Capital-Investoren.

Nimbus war gewachsen: 947 Restaurantpartner. 18.000 tägliche Bestellungen. 18 Millionen $ monatliches GMV. Drei Städte live, zwei weitere im Start. Ein Team von vierzehn Ingenieuren über zwei Zeitzonen.

Die Investoren hatten Fragen. Einer von ihnen – ein technischer Partner des Fonds – beugte sich vor.

„Welche Datenbank verwendet ihr?“, fragte er.

Maya zögerte nicht.

„Für Bestellungen und Kundendaten: Aurora PostgreSQL. Für den Menükatalog: DynamoDB. Für Session-Management und Caching: ElastiCache Redis. Für Analysen: Athena auf S3-Parquet-Dateien, mit Redshift für die hochfrequenten Dashboard-Abfragen.“

Er nickte. „Warum Aurora für Bestellungen und nicht DynamoDB?“

„Weil Bestellungen eine komplexe relationale Struktur haben – sie referenzieren Menüpunkte, Kundenkonten, Restaurantadressen, Zahlungsmethoden. Wir brauchen Transaktionskonsistenz über mehrere Entitäten hinweg. Eine relationale Datenbank ist das richtige Werkzeug dafür. Die Stärke von DynamoDB ist hochdurchsatzfähiger Key-Value-Zugriff mit flexiblem Schema, was genau das Zugriffsmuster des Menükatalogs ist.“

Er notierte etwas. „Was ist mit der Skalierung? Ihr sagtet 18.000 tägliche Bestellungen. Das sind durchschnittlich etwa 12 pro Minute. Wie habt ihr für die Spitze entworfen?“

„Der Freitagabend-Andrang ist etwa das 25-Fache des Durchschnitts. Wir skalieren horizontal mit ECS und Aurora Serverless v2, das Burst automatisch bewältigt. CloudFront absorbiert die Last der statischen Inhalte. Die API ist zustandslos, also ist die horizontale Skalierung sauber.“

„Und wenn Aurora Serverless v2 nicht schnell genug skalieren kann?“

„Wir haben Lasttest-Ergebnisse. Die Zeit bis zur Skalierung für Aurora Serverless v2 beträgt unter 10 Sekunden. Unser durchschnittlicher Freitags-Spitzenanstieg dauert 8 Minuten von der Basislast aus. Wir sind mit der Reserve zufrieden.“

Der technische Partner sah die übrigen Investoren an. „Sie kennt ihr System.“

Er hatte mehr Fragen.

„Wie handhabt ihr die Bereitstellungssicherheit? Bei 947 Restaurants bedeutet eine schlechte Bereitstellung, dass 947 Restaurants keine Bestellungen annehmen können.“

Maya war das schon einmal gefragt worden, intern. „Feature Flags für alle Verhaltensänderungen. Wir deployen Code kontinuierlich, aber neues Verhalten wird hinter Flags geschützt, die wir schrittweise aktivieren. Eine Bereitstellung, die den Bestellbestätigungsfluss ändert, wird 24 Stunden lang an 1 % der Restaurants ausgerollt, dann 10 %, dann 50 %, dann 100 % – mit automatischem Rollback, wenn die Fehlerraten in irgendeiner Phase einen Schwellenwert überschreiten.“

„Wie lange dauert ein vollständiger Rollout?“

„Drei Tage für eine risikoreiche Änderung. Ein Tag für risikoarme. Notfall-Rollbacks sind in unter vier Minuten abgeschlossen.“

„Wie hoch ist eure p99-Stripe-Latenz?“

Tom antwortete, bevor Maya konnte. „214 Millisekunden.“

„Das ist hoch“, sagte der Investor.

„Unsere SLA gegenüber Restaurants ist Bestellaufgabe bis Bestätigung in unter 5 Sekunden“, sagte Tom. „214 ms für den Stripe-Aufruf sind 4,3 % dieses Budgets. Die übrige Zeit ist Aurora-Schreibvorgang, SQS-Nachrichtenzustellung, Push-Benachrichtigung an das Restaurant-Tablet. Wir haben Reserve.“

„Was, wenn Stripe einen Vorfall hat?“

„Wir verwenden Stripes asynchrone Zahlungserfassung. Die Bestellung wird angenommen und das Restaurant sofort benachrichtigt. Die Zahlungserfassung erfolgt asynchron. Wenn Stripe langsam ist, geht die Bestellung trotzdem durch – die Erfassung wird wiederholt. Wenn Stripe vollständig ausgefallen ist, stellen wir den Erfassungsversuch mit exponentiellem Backoff in eine Queue und alarmieren unseren Bereitschaftsdienst. Wir haben seit 14 Monaten keine Bestellung wegen Stripe zurückgehalten.“

Der Investor notierte etwas. „Habt ihr irgendwelche Single Points of Failure?“

Priya antwortete. „Aurora in einer einzigen Region ist eine Single-Region-Abhängigkeit. Wir haben Multi-AZ für AZ-Ausfälle und einen Aurora-Global-Database-Reader, der bereits in us-east-1 läuft. Ein vollständiger regionaler Ausfall würde ein Failover auf diesen Reader bedeuten – und das automatisierte regionale Failover darum herum ist das, was wir dieses Quartal bauen. Bis dahin, ja – ein regionaler Ausfall in us-west-2 würde Nimbus lahmlegen.“

„Warum habt ihr das Multi-Region-Failover noch nicht gebaut?“

„Weil bis vor sechs Monaten die Engineering-Kosten, es korrekt zu bauen, das geschäftliche Risiko des Ausfalls überstiegen“, sagte Priya. „Wir hatten in unserer Betriebsregion nie einen regionalen AWS-Ausfall, der länger als 30 Minuten dauerte. Bei 287 Restaurants – etwa 4.200 Bestellungen pro Tag bei einem durchschnittlichen Bestellwert von 34 $ – kostet uns ein 2-stündiger regionaler Ausfall ungefähr 12.000 $ an GMV. Die Engineering-Kosten eines korrekt implementierten Warm Standby sind 3 Monate Senior-Engineer-Zeit. Bei unserem aktuellen Umsatz sprach die Rechnung für ein Aufschieben.“

„Und jetzt?“

„Bei 947 Restaurants und 18.000 täglichen Bestellungen kostet derselbe 2-stündige Ausfall grob 51.000 $ an GMV und erzeugt erheblichen Reputationsschaden bei Restaurantpartnern, die für ihr Abendgeschäft auf uns angewiesen sind. Die Rechnung hat sich geändert. Das Failover-Projekt startet im nächsten Sprint.“

Der Investor sah die anderen Investoren im Raum an. „Sie kennt auch ihr Risikoprofil.“


**Die vier Fragen unter „Es kommt darauf an“**

Sie hatte zwei Jahre lang eine Version jeder dieser Fragen gestellt, ohne zu wissen, dass sie dieselbe Frage auf vier verschiedene Arten stellte. Die Investorensitzung hatte es deutlich gemacht. Jede Entscheidung, die sie selbstbewusst erklärt hatte, lief auf dieselben vier Achsen zurück.

**1. Was ist das Zugriffsmuster?**

Wie werden die Daten geschrieben und gelesen? Mit welcher Häufigkeit? Von wie vielen gleichzeitigen Benutzern? In welcher Reihenfolge? Nach welchen Schlüsseln?

Diese Frage bestimmt die Technologieauswahl auf der grundlegendsten Ebene. DynamoDB vs. Aurora vs. Redshift vs. Athena – die richtige Antwort hängt fast vollständig vom Zugriffsmuster ab.

**2. Was ist der Maßstab?**

Nicht nur jetzt – in 12 Monaten, in 5 Jahren. Der Maßstab ändert die richtige Antwort. Was bei 100 Anfragen pro Tag funktioniert, bricht bei 100 Millionen. Was bei 10 Benutzern Overkill ist, ist bei 10.000 notwendig.

Und Maßstab ist nicht nur Traffic. Es ist Teamgröße (die Architektur muss von dem Team wartbar sein, das man hat). Es ist Datenvolumen. Es ist geografische Reichweite.

**3. Was ist die Ausfallkonsequenz?**

Wenn das kaputtgeht, was passiert? Sieht ein Benutzer eine langsame Seite? Schlägt eine Bestellung fehl? Wird Geld falsch bewegt? Wird die Krankenakte von jemandem unzugänglich?

Die Konsequenz bestimmt, wie viel man in Zuverlässigkeit investiert. Eine langsame Menüseite rechtfertigt Eventual Consistency. Eine fehlgeschlagene Zahlung rechtfertigt synchrone Schreibvorgänge und explizite Bestätigung.

**4. Was ist die Kostenbeschränkung?**

Nicht nur Geld – auch operative Komplexität (die selbst eine Form von Kosten ist). Eine Lösung, die drei zusätzliche Dienste erfordert, kann technisch überlegen sein, aber zu teuer, um sie mit einem Vier-Personen-Team zu warten.

„Moment – aber *warum* spielt das Zugriffsmuster so eine große Rolle?“, hatte Maya zwei Jahre zuvor gefragt, als Tom zum ersten Mal vorschlug, den Menükatalog von der Bestelldatenbank zu trennen. „Können wir nicht einfach später optimieren?“

Diese Frage, stellte sich heraus, war der Anfang der Antwort. Man kann ein relationales Schema nicht für Key-Value-Zugriffsmuster optimieren, ohne es neu zu bauen. Das Zugriffsmuster musste zur Entwurfszeit bekannt sein, nicht nachträglich angepasst. Jede Architekturentscheidung, die sie seitdem getroffen hatte, hatte mit derselben Frage begonnen.

Sie fragen sich vielleicht: Wenn „es kommt darauf an“ immer die richtige Antwort ist, wie trifft man je eine Entscheidung? Die Antwort ist, dass das Vervollständigen des Satzes Sie zwingt, die Bedingungen zu benennen, und sobald Sie sie benannt haben, wissen Sie, welche Information Sie brauchen. „Es kommt auf das Zugriffsmuster an“ wird zu „geh herausfinden, was das Zugriffsmuster tatsächlich ist“. Die vier Fragen sind kein Weg, Entscheidungen zu vermeiden – sie sind ein Weg, sie mit der richtigen Information zu treffen.

**„Es kommt darauf an“: Wie man den Satz vervollständigt**

Die richtige Art, „es kommt darauf an“ zu sagen, ist, es sofort zu vervollständigen:

*„Sollten wir DynamoDB oder Aurora verwenden?“*

„Es kommt auf das Zugriffsmuster an. Wenn Sie hochdurchsatzfähige schlüsselbasierte Lookups mit flexiblem Schema brauchen, DynamoDB. Wenn Sie Transaktionskonsistenz über verwandte Entitäten mit komplexen Abfragen brauchen, Aurora.“

*„Sollten wir Lambda oder EC2 verwenden?“*

„Es kommt auf die Arbeitslastmerkmale an. Lambda für ereignisgesteuerte, kurzlebige, variable Arbeitslasten, bei denen Null-Leerlaufkosten wichtig sind. EC2 oder ECS für persistente, zustandsbehaftete oder langlaufende Prozesse, bei denen vorhersehbare Leistung wichtiger ist als Leerlaufkosten.“

*„Sollten wir Multi-AZ oder Multi-Region verwenden?“*

„Es kommt auf Ihre RTO/RPO-Anforderungen und Ihr Bedrohungsmodell an. Multi-AZ schützt vor AZ-Ausfällen (dem häufigsten AWS-Ausfallmodus) und bietet RPO ~0 und RTO ~60 Sekunden für RDS. Multi-Region schützt vor regionalen Ausfällen (selten) und bedient global verteilte Benutzer. Wenn Sie ein Failover im Subminutenbereich aus einer regionalen Katastrophe brauchen, Multi-Region. Wenn AZ-Resilienz ausreichend ist, ist Multi-AZ viel einfacher und günstiger.“

„Es kommt darauf an“ ist nicht das Ende der Antwort. Es ist der Anfang der eigentlichen Antwort.


*„Sollten wir EKS oder ECS für die Container-Orchestrierung verwenden?“*

Der Investor hatte diese gestellt, bevor Maya zur nächsten Folie überging. Sie hielt inne.

„Es kommt auf die Teamgröße, vorhandene Kubernetes-Expertise und darauf an, ob Sie Kubernetes-spezifische Features brauchen.“

„Führ das aus“, sagte er.

„Kubernetes ist eine leistungsstarke Orchestrierungsplattform“, sagte Maya. „Es hat ein reiches Ökosystem – Helm Charts, Custom Resource Definitions, Multi-Cluster-Federation, fortgeschrittene Scheduling-Richtlinien. Wenn Sie ein Team haben, das Kubernetes kennt, Tooling darum herum aufgebaut hat und diese Fähigkeiten braucht, ist EKS die richtige Wahl. Sie bekommen eine verwaltete Control Plane, aber Sie verwalten weiterhin die Kubernetes-Komplexität von Netzwerkrichtlinien, Pod-Sicherheit, Ressourcenquoten und dem Rest.“

„Und ECS?“

„ECS ist einfacher. Keine Kubernetes-API. Kein etcd. Keine Pod-Networking-Komplexität. Man definiert Tasks, Services und Cluster. IAM integriert sich nativ, ohne zusätzliche Plugins zu erfordern. Das mentale Modell ist deutlich kleiner. Für ein Team, das Kubernetes noch nicht kennt, eliminiert ECS Monate an Lernkurve.“

„Welches verwendet Nimbus?“

„ECS“, sagte sie. „Wir haben EKS vor achtzehn Monaten evaluiert. Wir hatten einen Ingenieur mit Kubernetes-Erfahrung. Die anderen hätten 3 bis 4 Monate gebraucht, um in einer Produktions-Kubernetes-Umgebung produktiv zu werden. Die Features, die EKS uns gegeben hätte – Multi-Cluster-Management, Custom Scheduling –, brauchten wir nicht. ECS mit Fargate betreibt unsere Container. Das Team war in zwei Wochen produktiv.“

„Ist das bei 50 Ingenieuren die richtige Wahl?“, fragte er.

„Vielleicht nicht“, sagte Maya. „Bei 50 Ingenieuren mit mehreren Produktteams, die isolierte Namespaces, Custom-Networking-Richtlinien und teamspezifische Ressourcenquoten brauchen – wird das Namespace-Modell von Kubernetes wirklich wertvoll. ECS hat keine vergleichbare Namespace-Isolation. Bei diesem Maßstab ist die Kubernetes-Lernkurve über ein viel größeres Team amortisiert. Die ‚es kommt darauf an‘-Antwort verschiebt sich.“

„Bei welcher Teamgröße passiert die Verschiebung?“, fragte er.

Sie hatte darüber nachgedacht. „Die Regel, die ich verwende: Wenn der operative Overhead von Kubernetes geringer wird als der organisatorische Overhead, die Einschränkungen von ECS zu umgehen, wechselt man. Für ein 14-Personen-Team, ECS. Für ein 50-Personen-Team mit mehreren Produktvertikalen, wahrscheinlich EKS. Die Zahl ist nicht fest – es kommt darauf an, was man baut und wer es baut.“

„Moment – aber *warum* würden wir es so machen?“, fragte Maya sich selbst und wiederholte die Frage, die sie aus zwei Jahren des Bauens gelernt hatte. „Warum nicht einfach eines wählen und dabei bleiben?“

Weil sich die richtige Antwort ändert, während sich die Organisation ändert. Eine Architekturentscheidung, die für ein 4-Personen-Team getroffen wurde, ist nicht notwendigerweise für ein 40-Personen-Team korrekt. Die Bedingungen ändern sich. Die Antwort ändert sich mit ihnen.

„Das ist der Punkt“, sagte sie zum Investor. „Die korrekte Antwort heute ist ECS. Die korrekte Antwort in drei Jahren könnte EKS sein. Wir betrachten es erneut, wenn die Bedingungen es rechtfertigen. Wir haben ein ADR, das dokumentiert, warum wir ECS gewählt haben, und es listet explizit auf, was eine erneute Betrachtung auslösen würde.“

Der Investor machte eine weitere Notiz. „Das ist eine reife Art, eine technische Entscheidung zu halten.“


**Variante: Wenn „es kommt darauf an“ Sie in Schwierigkeiten bringt**

Wenn das Zugriffsmuster Key-Value-Lookups bevorzugt und Sie DynamoDB wählen, werden Sie Aurora im großen Maßstab übertreffen – aber wenn Sie ein Feature hinzufügen, das JOIN-Abfragen über drei Entitäten erfordert, haben Sie das falsche Fundament gebaut und müssen unter Druck migrieren. Die „es kommt darauf an“-Antwort ist nur so gut wie Ihr Verständnis der Bedingungen, von denen Sie abhängen.

Wenn Sie für den aktuellen Maßstab und das aktuelle Zugriffsmuster optimieren, treffen Sie die richtige Entscheidung für heute – aber wenn der Traffic in einem Jahr um das 50-Fache wächst, ohne dass sich Ihre Architektur anpasst, wird die korrekte Entscheidung von Tag eins zum Engpass für Tag 365. Die vier Fragen müssen nicht nur zur Entwurfszeit gestellt, sondern erneut betrachtet werden, während das System wächst.

**Die Muster, die sich nicht ändern**

Während sich spezifische Technologieentscheidungen weiterentwickeln – neue Dienste werden gestartet, Preise ändern sich, bessere Alternativen entstehen –, sind einige zugrunde liegende Muster über Jahrzehnte stabil geblieben:

**Trennung der Belange**: Komponenten, die unterschiedliche Dinge tun, sollten unabhängig sein. Eine Änderung in einer sollte keine Änderung in einer anderen erfordern. Deshalb entkoppelt man mit SQS, nicht mit direkten Aufrufen. Warum man S3 für Objekte verwendet, nicht Datenbanken. Warum die Web-Ebene und die Datenbankebene getrennt sind.

**Defense in Depth**: Keine einzelne Sicherheitskontrolle ist ausreichend. Man hat IAM, Security Groups, NACLs, WAF, GuardDuty, Secrets Manager, KMS. Wenn eine Ebene versagt, fängt die nächste es ab.

**Zahle für das, was du nutzt, wenn du es nutzt**: Das grundlegende wirtschaftliche Prinzip der Cloud. Lambda skaliert auf null. Spot-Instanzen nutzen freie Kapazität. S3-Lebenszyklusrichtlinien verschieben kalte Daten in günstigeren Speicher. DynamoDB On-Demand berechnet pro Anfrage. Tom hatte „Wie viel kostet das pro Monat?“ zehntausend Mal über zwei Jahre gefragt. Diese Frage – konsequent gestellt, rigoros beantwortet – hatte sich in fast 36.000 $ an jährlichen Einsparungen verwandelt. Die Muster sind unterschiedlich; das Prinzip ist dasselbe.

**Optimiere für den wahrscheinlichsten Ausfall**: Multi-AZ zuerst (AZ-Ausfälle passieren). Cross-Region-DR als Zweites (regionale Ausfälle sind seltener). Redundanz innerhalb der AZ (mehrere Instanzen) vor Cross-Region-Komplexität. Bauen Sie für den realistischen Ausfall, nicht für den katastrophalen, aber unwahrscheinlichen.

**Messen vor dem Optimieren**: Toms Ansatz – die CloudWatch-Metriken ziehen, das tatsächliche Muster verstehen, dann Entscheidungen treffen – ist wertvoller als vorzeitige Optimierung auf Basis von Annahmen. Leos Instinkt bei den nächtlichen Batch-Jobs – „Es wird schon klappen“ – war das Wichtigste, das man sich abtrainieren musste. Es klappt meistens, bis zu dem einen Mal, an dem es nicht klappt, und man nichts gemessen hat.


**Die sich aufsummierenden Kosten falscher Standards.**

Tom hatte ein weiteres Muster für die Liste, eines, das er erst nach drei Monaten Kostenüberprüfung identifiziert hatte: die Kosten, den Standard nicht zu ändern.

AWS-Dienste sind so konzipiert, dass sie ab Werk sicher und funktional sind. Die Standardeinstellungen sind nicht dafür konzipiert, für jede Arbeitslast optimal zu sein. gp2 war der Standard-EBS-Volume-Typ, bis gp3 im Dezember 2020 startete. Danach wurde gp3 der Standard für neue Volumes – aber bestehende gp2-Volumes wurden nie konvertiert, weil AWS bestehende Kundenressourcen nicht ohne explizite Aktion ändert.

Die Kostenimplikation: Jedes Team, das EBS-Volumes vor gp3 erstellt und nie ein Migrations-Audit durchgeführt hat, zahlte jahrelang 25 % mehr pro GB, nicht weil es die falsche Entscheidung getroffen hat, sondern weil es keine Entscheidung getroffen hat. Der Standard blieb bestehen, und die Kosten summierten sich still und leise.

Deshalb war die Frage „Moment, aber warum würden wir es so machen?“ das Wertvollste geworden, das das Team fragte. Es ging nicht immer darum, eine getroffene Entscheidung zu hinterfragen. Manchmal ging es darum, eine Nicht-Entscheidung zu hinterfragen: einen Standard, der ohne Prüfung akzeptiert wurde.

Das Muster verallgemeinert sich: Standards erneut betrachten, wenn AWS eine neue Option startet. gp2 zu gp3. On-Demand-DynamoDB zu provisioniert mit Auto Scaling, wenn sich der Traffic stabilisiert. Standard-S3 zu Intelligent-Tiering, wenn Zugriffsmuster unsicher werden. Die erneute Betrachtung muss nicht teuer sein – ein Nachmittag Analyse pro Kategorie, vierteljährlich. Aber sie kann nicht übersprungen werden. Die Standards summieren sich.

„Jeder Dollar, den wir für etwas ausgeben, das wir gewählt haben, ist eine beabsichtigte Kosten“, sagte Tom bei der monatlichen Überprüfung. „Jeder Dollar, den wir für etwas ausgeben, das wir uns seit der Bereitstellung nicht angesehen haben, ist ein potenzieller Standard, der hinterfragt werden sollte.“

„Wie viele davon haben wir?“, fragte Maya.

„Weniger als vor sechs Monaten“, sagte er. „Mehr als null.“

Das war die ehrliche Antwort. Es war immer die ehrliche Antwort.


**Was dieses Buch Ihnen nicht beibringen kann**

Seien wir direkt mit den Grenzen.

Dieses Buch hat Ihnen beigebracht:

- Was jeder große AWS-Dienst tut
- Die Analogien, die sie intuitiv machen
- Die Kompromisse zwischen Alternativen
- Das Prüfungswissen, das Sie für SAA-C03 brauchen
- Ein Framework, um über architektonische Entscheidungen nachzudenken

Dieses Buch kann Ihnen nicht beibringen:

- **Produktionsinstinkt**: Das Bauchgefühl, das sagt „das wird unter Last seltsam werden“, bevor man es passieren sieht. Das kommt vom Betreiben echter Systeme.
- **Technisches Urteilsvermögen unter Druck**: Zu entscheiden, was man um 3 Uhr morgens tut, wenn das System ausgefallen ist und man unvollständige Informationen hat. Das kommt von Vorfällen.
- **Stakeholder-Intuition**: Zu wissen, wann man sich gegen eine Geschäftsanforderung wehren sollte, weil die technischen Kosten zu hoch sind. Das kommt aus Erfahrung mit sowohl der technischen als auch der geschäftlichen Seite.
- **Die richtige Frage für den spezifischen Kontext**: Carlos konnte die richtigen Fragen stellen, weil er ähnliche Probleme dutzende Male gesehen hatte. Dieses Wissen wird erworben, nicht gelesen.

Sie sind nicht fertig mit dem Lernen. Sie haben kaum angefangen.

**Die Prüfung ist nicht das Ziel**

Sie haben dieses Buch in die Hand genommen, um sich auf die AWS-Solutions-Architect-Associate-Prüfung vorzubereiten. Das ist legitim. Die SAA-C03-Zertifizierung ist real, wird geschätzt und wird Türen öffnen.

Aber die Prüfung testet Wissen und Mustererkennung. Sie testet kein Urteilsvermögen. Sie testet keine operative Erfahrung. Sie testet nicht, was Sie tun, wenn die Architektur, die Sie gebaut haben, um 23 Uhr an einem Freitag aufhört zu funktionieren.

Die Zertifizierung ist ein Anfangs-Qualifikationsnachweis. Wenn Sie die Prüfung bestehen, werden Sie wissen, wie AWS-Dienste funktionieren und wie sie sich kombinieren. Sie werden ein Framework haben, um über Architektur nachzudenken. Sie werden es noch nicht getan haben.

Der nächste Schritt nach der Prüfung: Bauen Sie etwas Echtes. Stellen Sie es bereit. Betreiben Sie es. Sehen Sie zu, wie es versagt. Beheben Sie es. Gehen Sie bei einem Dienst das Geld aus und verschieben Sie die Kosten woanders hin. Werden Sie mitten in der Nacht alarmiert und treffen Sie eine Entscheidung mit unzureichenden Informationen.

So wird das Wissen in diesem Buch zu Urteilsvermögen.

**Mayas letzte Antwort**

Am Ende des Investorentreffens hatte der technische Partner noch eine Frage.

„Wenn Sie heute von vorne anfangen würden, mit dem Wissen, das Sie jetzt haben, was würden Sie anders machen?“

Maya nahm sich einen Moment.

„Ich würde von Tag eins an mit Infrastructure as Code beginnen“, sagte sie. „Leo hat die erste EC2-Instanz manuell bereitgestellt. Wir haben sechs Monate damit verbracht, alles zu Terraform zu migrieren. Das waren sechs Monate technische Schulden, die uns echte Zeit gekostet haben.“

„Was noch?“

„Ich wäre am Anfang konservativer mit Managed Services. Wir haben DynamoDB verwendet, als eine einfache RDS-Datenbank für Monate ausgereicht hätte. Das DynamoDB-Zugriffsmuster-Design erforderte erfahrenes Denken, das wir noch nicht hatten. Wir haben das Schema zweimal neu entworfen.“

„Also ist einfacher am Anfang besser?“

„Einfacher ist *immer* besser. Die Frage ist immer: Was ist das Einfachste, das das tatsächliche Problem löst, nicht das erwartete zukünftige Problem? Wir haben Komplexität hinzugefügt, um Probleme zu lösen, die wir noch nicht hatten. Ein Teil dieser Komplexität verursachte seine eigenen Probleme.“

Der technische Partner notierte das.

„Letzte Frage“, sagte er. „Was ist das Wichtigste, das Sie über das Bauen auf AWS wissen, das Sie nicht wussten, als Sie anfingen?“

Maya dachte über die zwei Jahre nach. Die Vorfälle. Die Kostenüberprüfungen. Den Well-Architected-Review. Die unter Druck getroffenen Architekturentscheidungen und die sorgfältig getroffenen. Die, die sie richtig hinbekamen, und die, die sie neu machen mussten.

„Dass die Cloud Architekturprobleme nicht löst“, sagte sie. „Sie verstärkt sie. Eine schlechte Entscheidung On-Premises kostet einen vielleicht eine Woche. Eine schlechte Entscheidung in der Cloud kann einen jeden Monat Geld kosten, im großen Maßstab, bis jemand es bemerkt.“

Sie hielt inne.

„Die Cloud lässt gute Entscheidungen skalieren. Und schlechte auch.“

An diesem Abend erzählte Maya Tom, Priya und Leo von der Investorensitzung.

„Er fragte nach den Datenbankentscheidungen“, sagte sie. „Allen.“

„Wie viel kostet das pro Monat?“, fragte Tom sofort, was genau die falsche Frage war und auch die richtige. „Hat er nach dem Kostenmodell gefragt?“

„Hat er. Ich habe die Savings Plans erklärt, den DynamoDB-Wechsel zu provisioniert. Er nickte.“

„Und was, wenn jemand versucht einzubrechen?“, fragte Priya. „Kamen die Sicherheitsfragen auf?“

„IAM, Verschlüsselung, GuardDuty. Ja. Er schien zufrieden.“

Leo war still gewesen. „Hat er nach den Teilen gefragt, die nicht gut liefen?“

„Er fragte, was ich anders machen würde. Ich erzählte ihm davon, mit Infrastructure as Code zu beginnen und am Anfang konservativer mit Managed Services zu sein.“

„Das DynamoDB-Schema, das wir zweimal neu entworfen haben“, sagte Leo. „Ich hatte immer das Gefühl, das ginge auf mich.“

„Es ging auf uns alle“, sagte Maya. „Das ist der Punkt.“

**Abschluss**

Sie haben sehr viel gelernt. Die AWS-Dienste. Die Kompromisse. Die Muster.

Machen Sie jetzt etwas damit.

Bauen Sie etwas. Machen Sie absichtlich Fehler. Lesen Sie Post-Mortems (sie sind öffentlich – AWS, Cloudflare, GitHub, Stripe veröffentlichen sie alle). Arbeiten Sie mit Teams zusammen, die besser sind als Sie in den Dingen, in denen Sie am schwächsten sind.

Die SAA-C03-Prüfung wird testen, ob Sie den Stoff kennen. Ihre Karriere wird testen, ob Sie ihn anwenden können.

Beide sind es wert, getan zu werden. Keine davon ist das endgültige Ziel.

Es gibt kein endgültiges Ziel in diesem Feld. Es gibt nur das nächste Problem, die nächste Entscheidung und die Gewohnheit, die richtige nächste Frage zu stellen.

**Die Lektionen, die es nicht in das Foliendeck geschafft haben**

Im Zug zurück von Seattle erzählte Maya Leo und Priya von zwei Dingen, über die sie froh war, dass der Investor nicht direkt danach gefragt hatte – weil die ehrlichen Antworten jeweils zwanzig Minuten gedauert hätten.

**Der Vorfall mit der Analyse-Pipeline.**

Acht Monate zuvor war die Analyse-Pipeline an den Hauptdienst für die Bestellverarbeitung gekoppelt gewesen. Bestellereignisse wurden in dieselbe SQS-Queue geschrieben, die die Analyse-Pipeline konsumierte. Die Kopplung hatte vernünftig erschienen: Die Analyse brauchte Bestelldaten, die Bestellverarbeitung produzierte Bestelldaten.

An einem Mittwochabend führte ein Bug in der Analyse-Aggregations-Lambda dazu, dass sie aufhörte, aus der Queue zu konsumieren. Die Queue-Tiefe wuchs. Weil der Bestellverarbeitungsdienst dieselbe SQS-Queue für seine Bestätigungsnachrichten teilte, stauten sich sowohl die Analyse-Pipeline als auch der Bestellbestätigungspfad gleichzeitig. Restaurantpartner begannen, Bestätigungsverzögerungen zu sehen. Die SQS-Queue näherte sich ihrem Nachrichtenaufbewahrungslimit.

„Ich habe den Fix schon deployt“, hatte Leo um 23 Uhr an jenem Abend gesagt – und dann gestoppt. Der Fix für den Analyse-Bug würde ein Lambda-Redeployment erfordern, das die Queue leeren würde, aber er hatte nicht geprüft, ob die Bestellbestätigungsnachrichten in der Queue noch innerhalb ihres Visibility Timeout waren. Wenn das Timeout abgelaufen wäre, würde die Lambda sie erneut verarbeiten, und Restaurantpartner würden doppelte Bestellbestätigungen erhalten.

Der Vorfall hatte drei Stunden gedauert und zwei Rollbacks erfordert.

Die architektonische Lektion war einfach: Analyse und operative Verarbeitung sollten niemals dieselbe Queue teilen. Sie haben unterschiedliche Leistungsmerkmale, unterschiedliche Ausfallmodi und unterschiedliche Konsequenzen, wenn sie versagen. Sie zu koppeln bedeutete, dass ein Ausfall im Pfad mit niedrigerer Priorität den Pfad mit höherer Priorität beeinträchtigen konnte.

Nach dem Vorfall trennte Nimbus die Pipelines vollständig. Bestellereignisse gingen in eine dedizierte operative Queue. Eine separate EventBridge-Regel duplizierte Ereignisse in eine reine Analyse-Queue. Die beiden Pipelines hatten keine gemeinsame Infrastruktur außer der Ereignisquelle. Das nächste Mal, als die Analyse-Lambda einen Bug hatte – und das hatte sie, zwei Monate später –, schlug sie still fehl, die Analyse-Queue staute sich, die Morgenberichte waren zu spät, und der Bestellbestätigungspfad war völlig unberührt.

„Trennung der Belange“, hatte Priya nach dem zweiten Analyse-Lambda-Bug gesagt. „Dasselbe Prinzip auf Infrastrukturebene wie auf Codeebene. Zwei Dinge, die unterschiedlich versagen, sollten nicht dieselbe Fehlerdomäne teilen.“

**Die verfrühte Abstraktion.**

Drei Monate vor der Series A hatte Leo vorgeschlagen, einen generischen Restaurant-Konfigurationsdienst zu bauen. Nimbus hatte damals drei Arten von restaurantspezifischer Konfiguration: Menüeinstellungen, Lieferzonenparameter und Benachrichtigungspräferenzen. Ein generischer Konfigurationsdienst, hatte Leo argumentiert, würde es ihnen ermöglichen, neue Konfigurationstypen hinzuzufügen, ohne jedes Mal neue Speicher- und Abruflogik zu bauen.

Das Team hatte ihn gebaut. Zwei Wochen, um das Datenmodell zu entwerfen. Eine Woche, um den Dienst zu implementieren. Eine weitere Woche, um die drei bestehenden Konfigurationstypen darin zu migrieren. Insgesamt vier Wochen.

Als sie mit dem Bau des generischen Konfigurationsdienstes fertig waren, hatten sie… drei Konfigurationstypen. Dieselben drei, die sie vorher gehabt hatten. Der generische Dienst fügte keine neue Fähigkeit hinzu; er machte nur die bestehende Fähigkeit schwerer zu verstehen. Das Key-Value-Schema, das den Dienst „generisch“ machte, machte es auch unmöglich, Validierung oder Typbeschränkungen hinzuzufügen, ohne eine Schema-Registry darüber zu bauen.

„Wir haben ein Framework für eine Bibliothek gebaut“, sagte Tom, als er Leo die Investorengeschichte erzählte.

„Was bedeutet das?“, fragte Leo.

„Wir hatten drei Bücher. Wir haben ein Bibliotheksverwaltungssystem gebaut, um sie zu organisieren. Es wäre besser gewesen, die drei Bücher einfach in ein Regal zu stellen.“

Der Konfigurationsdienst war acht Monate später still stillgelegt worden, als das Team groß genug geworden war, dass vier Ingenieure nicht-triviale Zeit damit verbracht hatten zu lernen, wie er funktionierte, bevor sie entdeckten, dass er ein dünner Wrapper um eine DynamoDB-Tabelle war. Sie migrierten in zwei Tagen zurück zu direktem DynamoDB-Zugriff mit typisierten Schemata pro Konfigurationstyp.

„Vier Wochen, ihn zu bauen“, sagte Tom. „Zwei Tage, ihn rückgängig zu machen. Plus die laufenden Kosten, ihn jedem neuen Ingenieur zu erklären.“

„Was war die richtige Entscheidung?“, fragte Priya.

„Den Konfigurationsdienst bauen, wenn man mehr als zehn Konfigurationstypen hat und das Muster eindeutig stabil ist“, sagte Tom. „Nicht, wenn man drei hat und über zukünftige Bedürfnisse spekuliert. Die Abstraktion war verfrüht. Die Bedürfnisse, für die sie entworfen wurde, materialisierten sich nicht.“

„Haben wir bedacht, was passiert, wenn wir Abstraktionen bauen, bevor wir den Problemraum verstehen?“, fragte Priya.

„Wir haben es gerade beschrieben“, sagte Tom. „Man verbringt Zeit damit, eine Abstraktion zu warten, die mehr kostet als das Problem, das sie löste.“

Maya fügte das ihrem mentalen Modell architektonischer Anti-Muster hinzu: der generische Dienst, gebaut für drei Anwendungsfälle. Die gekoppelte Pipeline. Die Right-Sizing-Entscheidung, getroffen auf einem unzureichenden Beobachtungsfenster. Jede war eine Entscheidung, die lokal, im Moment, mit den verfügbaren Informationen Sinn ergab. Jede stellte sich auf eine Weise als falsch heraus, die erst später sichtbar wurde.

„Die, die auf dem Papier in Ordnung aussehen“, sagte sie zu Priya, „sind die, die einen am meisten kosten.“

„Weil man sie nicht erneut betrachtet“, sagte Priya. „Man schaut sich das Design an, es ist kohärent, die Logik hält, und man macht weiter. Der Ausfallmodus ist unsichtbar, bis das System unter einer Last oder einem Stress steht, den die Papierversion nie modelliert hat.“

„Deshalb ist der Architektur-Review wichtig“, sagte Maya. „Nicht weil der Prüfer mehr weiß. Weil er die Frage stellt, die einem nicht eingefallen ist zu stellen.“


## Zusammenfassung

Das Investorentreffen war gut verlaufen. Nicht weil Maya die Preisstruktur jedes Dienstes auswendig gelernt hatte, sondern weil sie das *Warum* für jede Entscheidung beantworten konnte, die Nimbus getroffen hatte. Die „es kommt darauf an“-Antworten, die sie gegeben hatte, waren präzise, bedingt und in denselben vier Fragen verankert, die sie in verschiedenen Formen seit zwei Jahren gestellt hatte.

- **„Es kommt darauf an“ ist der Anfang der Antwort**, nicht das Ende. Vervollständigen Sie den Satz immer mit den Bedingungen, von denen es abhängt.
- Die vier Fragen unter jedem Architektur-Kompromiss: Zugriffsmuster, Maßstab, Ausfallkonsequenz, Kostenbeschränkung.
- Die Muster, die Bestand haben: Trennung der Belange, Defense in Depth, zahle für das, was du nutzt, optimiere für den wahrscheinlichen Ausfall, messen vor dem Optimieren.
- **Die Cloud verstärkt Entscheidungen** – gute und schlechte. Eine schlechte Entscheidung On-Premises kostet eine Woche; eine schlechte Entscheidung in der Cloud summiert sich monatlich, im großen Maßstab.
- Die SAA-C03-Zertifizierung testet Wissen und Mustererkennung. Produktionserfahrung verwandelt dieses Wissen in Urteilsvermögen.

## Prüfungstipps

*SAA-C03-Domäne: Domänenübergreifend — alle Domänen*

Dieses Kapitel schließt den Prüfungsinhalt dieses Buches ab. Bevor Sie die Prüfung ablegen:

**Überprüfen Sie die Dienste, bei denen Sie am unsichersten sind**:

- Für die meisten Leute: Kinesis vs. SQS (die Unterscheidung Stream vs. Queue)
- VPC-Networking (Routing-Tabellen, Subnetze, NAT Gateway, Internet Gateway)
- IAM-Richtlinienbewertungslogik (Explicit Deny > Explicit Allow > Implicit Deny)
- Speicherklassenauswahl (kennen Sie alle acht S3-Speicherklassen und ihre Kompromisse)
- RDS vs. Aurora vs. DynamoDB für bestimmte Anwendungsfälle

**Kennen Sie die typische Szenariostruktur der Prüfung**:

Die SAA-C03 präsentiert eine Geschäftsanforderung („das Unternehmen braucht 99,99 % Verfügbarkeit“) und bittet Sie, die Architektur zu identifizieren, die sie erfüllt. Lesen Sie immer die Anforderung, identifizieren Sie die zentrale Einschränkung und eliminieren Sie Optionen, die sie nicht erfüllen.

**Üben Sie die Identifizierung von Distraktoren**:

Jede falsche Antwort in der Prüfung ist aus einem bestimmten Grund falsch. Zu lernen, *warum* jede falsche Antwort falsch ist, ist wertvoller als das Auswendiglernen richtiger Antworten.

**Die Prüfung belohnt Mustererkennung**:

- „Entkoppeln“ → SQS/SNS
- „Serverless“ → Lambda, DynamoDB, Aurora Serverless
- „Globale niedrige Latenz“ → CloudFront, Global Accelerator, Global DynamoDB, Aurora Global
- „Compliance/Auditing“ → CloudTrail, Config, Security Hub, Macie
- „Kostenoptimierung“ → Spot Instances, Savings Plans, Lebenszyklusrichtlinien, Right-Sizing

**Sie sind bereit**. Nicht, weil dieses Buch alles abgedeckt hat – das tut nichts. Sondern weil Sie die Prinzipien gut genug verstehen, um sich zur Antwort durchzudenken, selbst wenn Sie das genaue Szenario nicht sofort erkennen.

## Übungen

**Abschließende Übung**

Nach diesem Kapitel gibt es keine weiteren strukturierten Prüfungsfragen.

Stattdessen: eine offene Frage.

Welches System würden Sie heute bauen, mit dem Wissen, das Sie haben?

Schreiben Sie es auf. Skizzieren Sie die Architektur. Identifizieren Sie die Dienste. Notieren Sie die Kompromisse, die Sie eingehen würden, und warum. Antizipieren Sie die Ausfallmodi.

Dann bauen Sie es.

Das ist die Aufgabe. Es gibt keine Frist. Es gibt keine Note. Es gibt nur die Arbeit.

## Post-Credits-Szene

Die Investition kam zustande.

Series A. 4 Millionen $. Genug, um in fünf neue Städte zu expandieren, das Engineering-Team zu verdreifachen und Nimbus Instant zu bauen.

An diesem Abend war Maya im Restaurant ihrer Familie. Das ursprüngliche. Das, in dem Nimbus begann, als sie merkte, dass sie Bestellungen verloren, weil das Telefon immer besetzt war.

Sie bestellte Arepa – dasselbe Gericht, das sie immer bestellte.

Während sie wartete, öffnete sie ihren Laptop und las das erste Kapitel dieses Buches.

*„Wo wohnt eine Website?“*

Sie erinnerte sich, die Antwort nicht gewusst zu haben.

Sie lächelte.

Sie schloss den Laptop.

Das Essen kam.

Es war perfekt.

Im nächsten Kapitel: was sich ändert, wenn die Aufgabe nicht mehr darin besteht, das System zu bauen – sondern dafür verantwortlich zu sein.
