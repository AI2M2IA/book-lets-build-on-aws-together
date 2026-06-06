# Kapitel 30: Die versteckten Kosten

Tom hatte im Besprechungsraum ein Whiteboard mit drei Spalten: Compute, Speicher, Netzwerk. Die ersten beiden waren ausgefüllt – Zahlen, Daten, Namen abgeschlossener Optimierungen. Er stand einen Moment vor dem Whiteboard, bevor er etwas in die dritte Spalte schrieb. Die Netzwerkzeilen auf der AWS-Rechnung waren über die Seite verstreut, wie es die anderen nicht waren. Jede hatte einen anderen Namen, eine andere Einheit, eine andere Begründung dafür, warum Geld abfloss.

Er nahm die Kappe vom Marker.

**Rückblick: Die letzte Unbekannte auf der Rechnung**

Das Datenbank-Audit hatte den letzten großen Posten geschlossen, an dem Tom aktiv gearbeitet hatte – 491 $/Monat zurückgewonnen, 5.892 $ pro Jahr. Rechnet man die EC2 Savings Plans, die S3-Lebenszyklusrichtlinien und die Speicherbereinigung hinzu, betrug die laufende Summe 34.092 $ an jährlichen Einsparungen über drei Monate Arbeit. Aber Tom hatte während des tiefen Eintauchens in die Datenbanken bemerkt, dass eine Kategorie kaum untersucht worden war. Speicherkosten erschienen als eine Zeile: „S3: 198 $“. Compute-Kosten erschienen als eine Zeile: „EC2: 2.340 $“ – bevor die Savings-Plan-Rabatte aus Kapitel 27 eintrafen. Netzwerkkosten verteilten sich über ein Dutzend Einträge mit Namen wie „Data Transfer Out“, „NAT Gateway Processing“, „VPC Peering Data Transfer“ und „CloudFront Data Transfer“. Er hatte sie nie addiert und sich die Summe angesehen. Das war die heutige Arbeit.

Tom rief die Rechnung auf. Fand den Abschnitt zur Datenübertragung. Addierte alle Posten.

Netzwerkkosten in AWS sind wie das Mautsystem einer Stadt: In die Stadt hineinzufahren ist kostenlos, aber jeder Tunnel, den man nach draußen nimmt, kostet Geld, und das Fahren zwischen den Vierteln kostet auch ein wenig. Die meisten Leute denken nicht über die Mautgebühren nach, bis sie am Monatsende eine Rechnung bekommen und merken, dass sie jeden einzelnen Tag den Tunnel genommen haben, obwohl es die ganze Zeit eine kostenlose Straße an der Oberfläche gab. Das Ziel dieses Kapitels ist es, jede Mautstation zu verstehen – und zu entscheiden, welche es sich zu zahlen lohnt.

847 $/Monat.

„Wir geben 847 $ im Monat für Datenübertragung aus“, sagte er.

„Ist das viel?“, fragte Leo.

„Es ist genau so viel, wie unsere S3-Rechnung war, bevor wir sie optimiert haben. Und ich wusste nicht einmal, dass wir eine Datenübertragungsrechnung in dieser Größe haben.“

Maya sah herüber. „Was genau ist Datenübertragung?“

„Es ist das, was AWS für das Bewegen von Bytes berechnet. Bytes in AWS hinein: normalerweise kostenlos. Bytes aus AWS heraus ins Internet: berechnet. Bytes zwischen Diensten in verschiedenen Regionen: berechnet. Bytes, die durch ein NAT Gateway gehen: berechnet.“

„Kannst du es aufschlüsseln?“

Tom konnte. Aber diesmal blieb er nicht bei der Abrechnungskonsole stehen. Er aktivierte VPC Flow Logs über alle ihre VPCs hinweg und speiste sie in CloudWatch Logs Insights ein. So konnte er die tatsächlichen Verkehrsflüsse abfragen – nicht nur Dollarbeträge, sondern welche Quellen Daten wohin sendeten und wie viel.

Die Abfrage brauchte zwei Minuten. Kombiniert mit einer weiteren Protokollquelle, die er gleich hinzuziehen würde, war die Ausgabe spezifisch genug, um danach zu handeln.

**Verkehrsanalyse: Was tatsächlich die Rechnung erzeugt**

Die fünf größten Verkehrsflüsse nach Volumen, in der Reihenfolge:

1. EC2-Anwendungsserver → NAT Gateway → AWS-Dienste (SSM, Secrets Manager, CloudWatch, SQS): 3,9 TB/Monat
2. EC2-Anwendungsserver → NAT Gateway → externe APIs: 1,3 TB/Monat
3. Aurora-Reader-Endpunkt → EC2-Anwendungsserver (cross-AZ): 0,4 TB/Monat
4. Analyse-Pipeline → S3-Bucket in us-east-1 (cross-region): 0,3 TB/Monat
5. CloudFront → S3-Origin (Cache-Misses): 0,2 TB/Monat

Die ersten vier kamen direkt aus den Flow Logs. Der fünfte konnte das nicht: VPC Flow Logs sehen nur Traffic, der Netzwerkschnittstellen innerhalb Ihrer VPCs durchquert, und ein CloudFront-Cache-Miss, der von S3 abruft, berührt die VPC überhaupt nicht – es ist CloudFront, das direkt mit S3 spricht. Für diesen Fluss zog Tom die Standard-Zugriffsprotokolle von CloudFront und filterte auf das Feld `x-edge-result-type`: Jeder mit `Miss` markierte Eintrag ist eine Anfrage, die CloudFront vom Origin abrufen musste, und die Summierung der Bytes ergab die 0,2 TB. Eine Rechnung, zwei Instrumente – jedes blind für das, was das andere sieht.

„Fluss Nummer vier“, sagte Priya. „Warum spricht unsere Analyse-Pipeline mit einem Bucket in us-east-1?“

Leo hatte einen Gesichtsausdruck, den Tom kannte.

„Ich hatte es schon deployt – oh“, sagte Leo. „Vor sechs Monaten habe ich getestet, ob unsere Analyse-Pipeline parallel auf mehrere Regionen ausfächern könnte. Ich habe einen Test-Bucket in us-east-1 hochgefahren, die Pipeline darauf gerichtet und sie eine Woche lang laufen lassen. Der Test endete, aber ich vergaß, das us-east-1-Ziel aus der Pipeline-Konfiguration zu entfernen.“

„Also schreiben wir seit fünf Monaten“, sagte Tom, „eine Kopie jedes Analyseergebnisses in einen Bucket in Virginia.“

„Wie viel kostet das pro Monat?“, fragte Tom.

Cross-Region-Übertragung von us-west-2 nach us-east-1: 0,02 $/GB. 300 GB/Monat = 6 $/Monat für die Übertragung. Plus S3-Speicher für die duplizierten Daten in us-east-1: 300 GB × 5 Monate × 0,023 $/GB = 34,50 $ an gespeicherten Daten.

„Nicht riesig“, sagte Leo.

„Nicht riesig pro Monat“, sagte Tom. „Aber es läuft seit fünf Monaten und niemand wusste es. Es sind unbeabsichtigte Kosten. Die Frage ist nicht, ob 6 $ eine Rolle spielen – es ist, ob wir wissen, warum jeder Dollar ausgegeben wird.“

Leo löschte den us-east-1-Test-Bucket und entfernte das Ziel aus der Pipeline-Konfiguration.

Der umsetzbarste Befund in der Flow-Log-Ausgabe war Fluss Nummer eins: EC2-Anwendungsserver, die AWS-Dienste über das NAT Gateway aufrufen.

Tom zog die spezifischen Protokolleinträge für die CloudWatch-Logs-Insights-Abfrage, gefiltert, um nur Traffic anzuzeigen, der für AWS-Dienst-IP-Bereiche bestimmt war:

```
fields @timestamp, srcAddr, dstAddr, bytes, protocol
| filter dstAddr like "52.94." or dstAddr like "54.239." or dstAddr like "52.46."
| stats sum(bytes) as totalBytes by srcAddr, dstAddr
| sort totalBytes desc
| limit 20
```

Die Ausgabe zeigte etwas, das er nicht erwartet hatte: grob 300 GB pro Monat an Same-Region-S3-Traffic – getrennt vom Cross-Region-Fluss zu Leos us-east-1-Bucket – ging durch das NAT Gateway. Aber Tom hatte vor Monaten bereits S3 Gateway Endpoints konfiguriert.

„Wir haben einen S3 Gateway Endpoint“, sagte Leo. „Warum geht S3-Traffic immer noch durch NAT?“

Tom sah sich die Routing-Tabelle an. Der Gateway Endpoint war konfiguriert – aber nur für die Anwendungs-VPC. Die Analyse-Pipeline lief in einer separaten VPC, die vor neun Monaten zur Datenisolierung erstellt worden war. Diese VPC hatte keinen S3 Gateway Endpoint. Jeder S3-Aufruf von den EC2-Instanzen der Analyse-Pipeline wurde über das NAT Gateway dieser VPC geleitet.

„0,3 TB Analyse-Pipeline-Traffic × 0,045 $/GB = 13,50 $/Monat“, sagte Tom. „Allein durch den fehlenden Endpoint in der zweiten VPC.“

„Wie viel würde es kosten, den Endpoint hinzuzufügen?“, fragte Leo.

„Null“, sagte Tom. „S3 Gateway Endpoints sind kostenlos. Es ist ein Routing-Tabellen-Eintrag.“

Den Gateway Endpoint zur Analyse-VPC hinzuzufügen würde vier Minuten dauern und 13,50 $ von der monatlichen NAT-Gateway-Gebühr abschneiden – eine kleine absolute Zahl, aber der Befund war das Prinzip. Sie hatten eine Kostenkontrolle in einer VPC hinzugefügt und vergessen, sie zu replizieren, als sie die zweite erstellten. Konsistenz erforderte einen Prozess, nicht nur Wissen.

Tom fügte der Bereitstellungs-Checkliste hinzu: Beim Erstellen einer neuen VPC S3- und DynamoDB-Gateway-Endpoints hinzufügen, bevor irgendwelche Arbeitslasten angehängt werden.

Der zweite spezifische Befund aus den Flow Logs war teurer. Traffic von den Lambda-Funktionen, die das Bestellbenachrichtigungssystem betrieben – S3-Zugriff zum Lesen von Restaurant-Konfigurationsdateien –, ging durch das NAT Gateway statt durch den S3-Endpoint. Die Lambda-Funktionen liefen innerhalb der VPC (für RDS-Zugriff), und der S3-Endpoint der VPC war nur für EC2-Instanzen im Anwendungs-Subnetz konfiguriert. Lambda-Funktionen im Lambda-Subnetz wurden über NAT geleitet.

„Moment – aber *warum* würden wir es so machen?“, fragte Maya. „Wir haben den Endpoint. Warum nutzt Lambda ihn nicht?“

„VPC Gateway Endpoints gelten pro Subnetz auf Basis von Routing-Tabellen“, sagte Tom. „Die Lambda-Funktionen sind in ihrem eigenen Subnetz mit ihrer eigenen Routing-Tabelle. Diese Routing-Tabelle hatte keine Endpoint-Route. Ich habe sie für das Anwendungs-Subnetz hinzugefügt. Ich habe das Lambda-Subnetz übersehen.“

Die S3-Endpoint-Route zur Routing-Tabelle des Lambda-Subnetzes hinzuzufügen würde weitere 41 $/Monat an NAT-Gateway-Verarbeitungsgebühren sparen, die für S3-Aufrufe berechnet worden waren, die kostenlos hätten sein sollen.

Die Flow-Log-Analyse hatte sich amortisiert. Drei Stunden Abfragezeit, drei konkrete Befunde: der vergessene Analyse-VPC-Endpoint (13,50 $/Monat), die Routing-Lücke im Lambda-Subnetz (41 $/Monat) und der ursprüngliche große Befund, der zur Grundlage der Interface-Endpoint-Entscheidungen wurde. Gesamte zusätzliche monatliche Einsparung, die durch die Flow-Log-Analyse identifiziert wurde: 54,50 $, zusätzlich zu den 78 $ aus Interface Endpoints, die die Analyse bereits zutage gefördert hatte. Diese beiden kleineren Fixes kamen ins Backlog für den nächsten Sprint; die Einsparungstabelle am Ende dieses Kapitels zählt nur, was tatsächlich ausgeliefert wurde.

„Die Lektion ist, dass VPC-Endpoints keine einmalige Konfiguration sind“, sagte Tom. „Jede neue VPC, jedes neue Subnetz, jeder neue Arbeitslasttyp erfordert dieselbe Prüfung. Der Standard für alles in einem privaten Subnetz ist, über NAT zu routen. Die Prüfung lautet: Ruft diese Arbeitslast S3, DynamoDB oder einen der traffic-starken AWS-Dienste auf? Wenn ja, hat sie eine Endpoint-Route?“

„Haben wir bedacht, diese Prüfung zu automatisieren?“, fragte Priya. „Eine AWS-Config-Regel, die alarmiert, wenn ein privates Subnetz ohne S3-Endpoint-Route erstellt wird?“

„Es steht auf der Liste“, sagte Tom. „Gleich nach dem Alarm für verwaiste Volumes.“


Und damit hatte Tom seine Antwort auf die Frage, die die Analyse begonnen hatte. Netzwerkkosten waren nicht ein einzelnes Problem. Sie waren fünf verschiedene Probleme, jedes mit einer anderen Lösung.

**Wie AWS Datenübertragung berechnet**

Die Datenübertragungs-Preisgestaltung von AWS ist asymmetrisch:

**In AWS hinein (inbound)**: Kostenlos. Sie können so viele Daten hochladen, wie Sie möchten.

**Aus AWS heraus ins Internet (outbound)**: Berechnet. Die ersten 100 GB/Monat sind kostenlos. Danach:

- 0,09 $/GB für die ersten 10 TB/Monat (US-Regionen)
- 0,085 $/GB für die nächsten 40 TB
- Niedriger bei höheren Volumina

**Innerhalb derselben Availability Zone**: Kostenlos. EC2-Instanzen, die in derselben AZ miteinander sprechen, zahlen nichts.

**Zwischen Availability Zones (gleiche Region)**: 0,01 $/GB in jede Richtung. Eine kleine, aber reale Kosten.

**Zwischen Regionen**: 0,02–0,08 $/GB je nach Regionen. Cross-Region-Traffic ist erheblich teurer.

**NAT Gateway**: 0,045 $/GB verarbeitet. Jedes Byte, das Ihre private EC2-Instanz durch das NAT Gateway sendet, um das Internet zu erreichen – und jedes Byte, das zurückkommt –, wird berechnet.

**CloudFront**: Niedrigere Datenübertragungsraten als die direkte AWS-zu-Internet-Übertragung. 0,085 $/GB für die ersten 10 TB (etwas weniger als die direkte Datenübertragung nach außen). CloudFront reduziert oft die gesamten Übertragungskosten, weil sein Edge-Caching bedeutet, dass das Origin seltener Daten ausliefert.

**Toms Aufschlüsselung**

„Wie viel kostet das pro Monat?“, fragte Tom für jeden Posten der Reihe nach. Er fügte sie einem separaten Tab in der Tabelle hinzu – nicht die Monatssumme, sondern jede Kategorie aufgeschlüsselt. Die Summe war weniger nützlich als zu verstehen, welcher Teil der Rechnung welche Art von Kosten war.

Nach der Kategorisierung jedes Postens:

**Ausgehende Daten ins Internet**: 214 $/Monat

- API-Antworten an Kunden weltweit
- Assets, die noch direkt von S3 und dem ALB an Clients ausgeliefert werden, unter Umgehung von CloudFront (Cache-Füllungen selbst – CloudFront, das von einem AWS-Origin abruft – sind kostenlos: AWS verzichtet auf die Origin-zu-CloudFront-Übertragung)

**NAT-Gateway-Verarbeitung**: 289 $/Monat

- Anwendungsserver, die externe APIs aufrufen (Zahlungsabwickler, E-Mail-Dienst, Kartendaten)
- DynamoDB-Aufrufe, die durch das NAT Gateway gehen (bevor für einige Tabellen VPC-Endpoints eingerichtet wurden)

**Cross-AZ-Datenübertragung**: 178 $/Monat

- Load Balancer zu EC2-Instanzen (der Load Balancer ist in einer AZ, einige Instanzen in einer anderen)
- Anwendungsserver zu RDS-Read-Replica (in einer anderen AZ)

**Cross-Region-Datenübertragung**: 166 $/Monat

- Aurora-Global-Database-Replikation (Primär in us-west-2, Reader in us-east-1)
- S3 Cross-Region Replication für Backups
- Leos vergessene Test-Pipeline (6 $/Monat dieser Summe)

**NAT Gateway: Die größte Überraschung**

289 $/Monat an NAT-Gateway-Verarbeitungsgebühren waren der größte Posten. Und die VPC-Flow-Log-Analyse hatte es spezifisch gemacht: Der größte Verbraucher waren Anwendungsserver, die AWS-Dienst-APIs (SSM, Secrets Manager, CloudWatch Logs) durch das NAT Gateway aufriefen.

In Kapitel 11 hatte Tom VPC Gateway Endpoints für S3 und DynamoDB eingerichtet. Diese waren kostenlos. Aber er hatte es versäumt, Interface Endpoints für mehrere andere Dienste einzurichten:

- Systems Manager (SSM) für Patch-Management
- Secrets Manager für den Abruf von Anmeldedaten
- CloudWatch für den Versand von Metriken und Protokollen
- SQS für Message-Polling

Jeder Aufruf dieser Dienste von privaten EC2-Instanzen ging durch das NAT Gateway. Jeder Aufruf kostete 0,045 $/GB.

Sie fragen sich vielleicht, warum AWS für Traffic berechnet, der durch das NAT Gateway geht, wenn Sie sich bereits im Netzwerk von AWS befinden. Die Antwort ist, dass das NAT Gateway selbst ein verwalteter Dienst ist – sein Betrieb kostet Geld, und AWS gibt diese Kosten pro Gigabyte weiter. VPC-Endpoints eliminieren den Mittelsmann, weshalb sie die Rechnung reduzieren.

„Moment – aber *warum* würden wir es so machen?“, fragte Maya, als Tom die Zahlen zeigte. „Wir haben Gateway Endpoints für S3 und DynamoDB eingerichtet. Warum haben wir das nicht auch für SSM und CloudWatch gemacht?“

„Gateway Endpoints sind nur für S3 und DynamoDB verfügbar“, sagte Tom. „Für alles andere – SSM, Secrets Manager, SQS – braucht man Interface Endpoints. Sie sind nicht kostenlos, aber sie sind günstiger als das Routing durch das NAT bei dem Volumen, das wir erzeugen.“

**Interface Endpoints** für diese Dienste: 0,01 $/Stunde pro AZ + 0,01 $/GB verarbeiteter Daten.

Bei dem Volumen von Nimbus würde der SSM Interface Endpoint etwa 25 $/Monat kosten (Stundengebühren plus Verarbeitung pro GB) und etwa 45 $/Monat an NAT-Gateway-Gebühren sparen (weil SSM für Patch-Management und Parameter-Store-Aufrufe erhebliches Datenvolumen erzeugt).

Endpoint-Kosten und Einsparungen variierten je nach Dienst und Volumen. Tom berechnete, dass die Einrichtung von Interface Endpoints für die vier traffic-starken Dienste – jeweils zwei AZs, plus die 0,01 $/GB Verarbeitung auf den 3,9 TB, die sie tragen würden – insgesamt etwa 97 $/Monat kosten und ungefähr 176 $/Monat an NAT-Gateway-Verarbeitung sparen würde.

Netto-Einsparung: 78 $/Monat allein durch die Endpoint-Einrichtung.

„Und was, wenn jemand versucht einzubrechen?“, sagte Priya, als das Gespräch über VPC-Endpoints sich der Umsetzung zuwandte. „Der VPC-Endpoint bedeutet, dass der Traffic das öffentliche Internet nie berührt – das ist nicht nur Kosten, das ist Reduzierung der Angriffsfläche. Wir hätten das allein wegen des Sicherheitsvorteils tun sollen.“

„Einverstanden“, sagte Tom. „Die Kosteneinsparungen sind ein Bonus.“

Leo sah sich die Liste der Dienste an, die über NAT geroutet worden waren. „Ich habe vielleicht die CloudWatch-Logging-Endpoints eingerichtet, ohne zu prüfen, ob es einen VPC-Endpoint dafür gab“, sagte er. „Es wird vorerst schon klappen – aber ja, das geht seit sechs Monaten durch NAT.“

„Das steht auf der Liste“, sagte Tom. „CloudWatch ist einer der vier, die wir beheben.“

**Die PrivateLink-Rechnung: Wann es Sinn ergibt**

Es gibt eine komplexere Version dieses Gesprächs, die auftaucht, wenn Architekturen wachsen: die Verwendung von AWS PrivateLink, um private Konnektivität zu Diensten zu bieten, die von anderen AWS-Kunden gehostet werden (oder zu Ihren eigenen Diensten in anderen VPCs).

PrivateLink Interface Endpoints kosten 0,01 $/Stunde pro AZ plus 0,01 $/GB. Für einen Dienst, der 1 TB/Monat an Traffic durch den Endpoint erzeugt:

- PrivateLink-Kosten: 0,01 $ × 2 AZs × 730 Stunden + 0,01 $ × 1.000 GB = 14,60 $ + 10 $ = 24,60 $/Monat
- Stattdessen denselben Traffic durch das bestehende NAT Gateway zu routen: 0,045 $ × 1.000 GB = 45 $/Monat an inkrementellen Verarbeitungsgebühren

Der Vergleich ist *inkrementell*, weil das NAT Gateway so oder so bleibt – es bedient weiterhin den restlichen ins Internet gerichteten Traffic, sodass seine Stundenkosten (0,045 $ × 2 × 730 = 65,70 $) nicht verschwinden, wenn dieser eine Dienst auf einen Endpoint umzieht. Für dieses Verkehrsvolumen spart PrivateLink ungefähr 20 $/Monat. Der Break-Even-Punkt liegt bei grob 420 GB/Monat – darunter überwiegt die eigene Stundenkosten des Endpoints die Pro-GB-Einsparung gegenüber der NAT-Verarbeitung.

„Moment – aber *warum* würden wir PrivateLink statt einfach eines VPN oder Peerings verwenden?“, fragte Maya.

„VPC Peering ist einfacher und für Intra-Region-Übertragungen kostenlos“, sagte Tom. „Aber Peering schafft eine vollständig geroutete Verbindung zwischen VPCs – alles in VPC A kann potenziell alles in VPC B erreichen. PrivateLink ist chirurgischer. Der Endpoint legt einen bestimmten Dienst offen, nicht eine vollständige Netzwerkroute. Für sicherheitsbewusste Architekturen ist diese Spezifität wichtig.“

„Und was, wenn jemand versucht, in eine gepeerte VPC einzubrechen?“, fragte Priya. „Vollständiges Peering bedeutet, dass eine kompromittierte Instanz in einer VPC eine Route zu jeder Instanz in der gepeerten VPC hat.“

„Das ist das Argument für PrivateLink gegenüber Peering, wenn man sich mit einem Drittanbieterdienst oder einem Dienst verbindet, der einem separaten Team gehört“, sagte Tom. „Peering für vertrauenswürdige unternehmensinterne VPCs. PrivateLink für alles, bei dem man die Verbindung mit minimaler Exposition möchte.“

**Cross-AZ-Traffic: Eine architektonische Frage**

Die 178 $/Monat an Cross-AZ-Datenübertragung waren kniffliger.

Ein Teil davon war unvermeidlich: Der Load Balancer verteilt Traffic über AZs, sodass einige Anfragen in einer AZ entstehen und der Load Balancer sie an eine Instanz in einer anderen AZ weiterleitet.

Ein Teil davon war optimierbar: Die Anwendung war so konfiguriert, dass sie in die RDS-Primärdatenbank (in us-west-2a) schrieb und vom Read Replica (in us-west-2b) las. Jede Leseabfrage überquerte AZ-Grenzen.

Für die Lesevorgänge eine Lösung: die Anwendung so konfigurieren, dass sie ein Read Replica in derselben AZ wie die anfragende Instanz bevorzugt. Jede AZ erhält ihr eigenes Read Replica. Der Traffic bleibt lokal.

Kompromiss: mehr Read Replicas = mehr Kosten. Wenn die Cross-AZ-Traffic-Kosten 50 $/Monat betragen und ein zusätzliches Read Replica 190 $/Monat kostet, zahlt sich die AZ-lokale Optimierung nicht aus.

Tom rechnete: Bei ihrem aktuellen Abfragevolumen betrug der Cross-AZ-Traffic nur 31 $/Monat von den 178 $. Nicht wert, dafür Replicas hinzuzufügen.

Die anderen Cross-AZ-Kosten waren Load-Balancer-Routing und Dienst-zu-Dienst-Kommunikation – auf dem aktuellen Architekturniveau weitgehend unvermeidlich.

„Das ist einer dieser Fälle, in denen das Verstehen der Kosten nicht bedeutet, dass man sie beheben sollte“, sagte Tom.

„Wie viel würde es kosten, den Cross-AZ-Traffic vollständig zu eliminieren?“, fragte Maya.

„Alles in einer AZ untergräbt den Zweck von Multi-AZ. Das ist eine Einsparung von 31 $/Monat auf Kosten des Verlusts der Hochverfügbarkeit.“

„Also lassen wir es“, sagte sie.

„Wir lassen es.“

**S3 Select: Datenübertragung bei Abfragen reduzieren**

Während er die Analyse-Pipeline überprüfte, fand Tom eine weitere Optimierung, die spezifisch dafür war, wie das Analyse-Team große S3-Dateien abfragte.

Das Muster: Jeden Morgen lud ein Analysejob eine 500-MB-Parquet-Datei aus S3 herunter, um sie im Speicher nach restaurantspezifischen Bestelldaten zu filtern. Grob 95 % der Datei wurden nach dem Download verworfen.

**S3 Select** ermöglicht es Ihnen, nur die Zeilen und Spalten abzurufen, die Sie aus einem S3-Objekt benötigen (CSV, JSON, Parquet), anstatt die gesamte Datei herunterzuladen, um sie in Ihrer Anwendung zu filtern.

> **Wichtiges Update**: Mitte 2024 hat AWS aufgehört, S3 Select für neue Kunden anzubieten – bestehende Nutzer behalten es, aber für neue Architekturen ist es eine Sackgasse. Das Prinzip, das dieser Abschnitt lehrt (auf der Speicherebene filtern, nicht die ganze Datei verschicken), ist zeitlos; das moderne Werkzeug dafür ist **Amazon Athena** (SQL direkt über S3, einschließlich Joins und Aggregationen, die S3 Select nie hatte). **S3 Object Lambda**, einst die andere Alternative, folgte S3 Select in den Legacy-Status: Seit dem 7. November 2025 ist es ebenfalls für neue Kunden geschlossen (bestehende Arbeitslasten laufen weiter). In einer aktuellen Prüfung verweist „Daten direkt in S3 abfragen“ auf Athena. Die folgende Geschichte ist erhalten, weil die *Argumentation* – zuerst messen, den Filter zu den Daten verschieben – die Lektion ist.

Ohne S3 Select:
```python
# Download 500MB file, process in memory
data = s3.get_object(Bucket='analytics', Key='orders-2024.csv')
df = pd.read_csv(data['Body'])
result = df[df['restaurant_id'] == '47'][['order_id', 'total']]
```

Mit S3 Select:
```python
# Let S3 filter first, transfer only matching rows (~2MB instead of 500MB)
response = s3.select_object_content(
    Bucket='analytics',
    Key='orders-2024.csv',
    Expression="SELECT order_id, total FROM S3Object WHERE restaurant_id = '47'"
)
```

S3 Select reduziert die von S3 in Ihre Anwendung bewegten Daten. Für große Dateien mit selektiven Abfragen kann dies eine 10- bis 100-fache Reduzierung des Datenvolumens sein – und da die Analyse-Instanz in derselben Region wie der Bucket läuft, ist der Gewinn keine Übertragungsrechnung (Same-Region-S3-zu-EC2-Übertragung ist kostenlos): Es sind die Rechenleistung, der Speicher und die Zeit, die für das Herunterladen und Filtern von Daten aufgewendet werden, die man sofort wieder wegwirft.

Tom sprach es beim Analyse-Team an. Sie wehrten sich zunächst.

„Wir wissen bereits, wie man pandas schreibt“, sagte ein Analyst.

„Hier geht es nicht um pandas“, sagte Tom. „Es geht um die Tatsache, dass ihr 500 MB herunterladet, um 2 MB an Daten zu bekommen. Der Download selbst ist kostenlos – gleiche Region –, aber die Instanz ist es nicht. Ihr führt das für jedes Restaurant aus: 287 Restaurants, 287 Abfragen, 140 GB jede Nacht in pandas heruntergeladen und gefiltert. Das ist es, was die Analyse-Box zwei Stunden lang beschäftigt – und deshalb ist es eine xlarge.“

„Und S3 Select?“

„S3 Select berechnet 0,002 $ pro gescanntem GB und 0,0007 $ pro zurückgegebenem GB – etwa ein Zehntel Cent pro Abfrage. Im Gegenzug empfängt die Instanz 600 MB pro Nacht statt 140 GB, der Job ist in Minuten fertig, und die Box kann eine Größe kleiner werden.“

„Das sind 450 $ im Monat“, sagte der Analyst, nachdem er die Instanz-Rechnung gemacht hatte – eine Überschlagsschätzung aus dem Stundensatz der Instanz und den Stunden, die sie sich abmühte.

„Deshalb bin ich hier“, sagte Tom. Die tatsächliche Zahl würde sich als niedriger herausstellen – als Tom später die tatsächlichen Compute-Ausgaben zog, die dem nächtlichen Job zuzuschreiben waren, kam er auf 202 $/Monat, nicht 450 $. Überschlagsrechnung findet das Problem; Messung bemisst es.

Tom sprach es zuerst mit Leo an, bevor er das Analyse-Team in das Gespräch einbezog. Er wusste, dass Leo sich wehren würde, und er wollte den Widerstand verstehen, bevor er zu einer Debatte auf Raumebene wurde.

„S3 Select würde 180 $/Monat bei den Abfragen der Analyse-Pipeline sparen“, sagte Tom.

„Das erfordert das Umschreiben jeder Abfrage“, sagte Leo.

„Es erfordert, das Datenzugriffsmuster von ‚herunterladen und filtern‘ zu ‚per S3-Select-API abfragen‘ zu ändern.“

„Was ein Umschreiben ist.“

„Es ist eine Änderung der Aufrufe der Client-Bibliothek“, sagte Tom. „Die Abfragelogik – die Filterausdrücke – bleibt dieselbe. Was sich ändert, ist, wo das Filtern stattfindet. Derzeit: EC2. Mit S3 Select: S3.“

„Ich habe die S3-Select-Doku gelesen“, sagte Leo. „Man kann keine Joins machen. Man kann keine Aggregationen machen, die komplexer als grundlegendes SUM und COUNT sind. Einige unserer Analyse-Abfragen sind anspruchsvoller als das.“

„Ich weiß“, sagte Tom. „Deshalb schlage ich S3 Select nicht für alle Abfragen vor. Ich schlage es für die restaurantspezifischen täglichen Zusammenfassungsabfragen vor. Das ist die 500-MB-Parquet-Datei, gefiltert nach restaurant_id, die zwei Spalten zieht. Diese Abfrage ist ein reines Filtern-und-Projizieren. S3 Select ist genau das richtige Werkzeug für diesen Fall.“

Leo war einen Moment lang still. Er rief die betreffende Abfrage auf.

```python
# Current: download 500MB, filter in memory
df = pd.read_parquet('s3://analytics/orders-2024.parquet')
result = df[df['restaurant_id'] == restaurant_id][['order_id', 'total', 'timestamp']]
```

„Die S3-Select-Version wäre also – der select_object_content-Aufruf?“

„Ja“, sagte Tom. „Du würdest den read_parquet-Aufruf durch einen select_object_content-Aufruf ersetzen, der die WHERE-Klausel an S3 weitergibt. Das Ergebnis kommt bereits gefiltert zurück. Du bekommst einen Stream übereinstimmender Datensätze statt der gesamten Parquet-Datei.“

„Und ich müsste die Antwort anders behandeln.“

„Das Antwortformat ist standardmäßig CSV. Du bräuchtest einen kleinen Wrapper, um es zurück in ein DataFrame zu parsen, oder du verwendest das Parquet-Ausgabeformat, wenn du die aktuelle Parsing-Logik beibehalten willst.“

Leo sah es sich an. „Wie viel Arbeit ist das?“

„Ein halber Tag“, sagte Tom. „Vielleicht ein Tag, wenn du es gründlich über alle 287 Restaurant-IDs im nächtlichen Batch testen willst.“

„Für 180 $/Monat.“

„2.160 $ pro Jahr“, sagte Tom. „Und der Ansatz skaliert. Bei 2.000 Restaurants kostet dieselbe Abfrage auf derselben Dateigröße ohne S3 Select sogar noch mehr. Du investierst heute einen Tag, um ein viel größeres Problem später zu vermeiden.“

Leo schloss das Notebook. „Die Abfragen, bei denen S3 Select nicht funktioniert – die Aggregationsabfragen, die restaurantübergreifenden Vergleiche –, die bleiben wie sie sind?“

„Die bleiben wie sie sind“, bestätigte Tom. „Ich versuche nicht, die Analyse-Pipeline umzuschreiben. Ich versuche aufzuhören, 500 MB herunterzuladen, um 2 MB davon zu nutzen.“

„Okay“, sagte Leo. „Ich mache es diese Woche.“

Das tat er. Die Implementierung dauerte sechs Stunden. Er kapselte den S3-Select-Aufruf in eine Hilfsfunktion, die dieselbe Schnittstelle wie der bestehende read_parquet-Aufruf hatte – der aufrufende Code im nächtlichen Batch brauchte überhaupt keine Änderungen. Nur die Datenzugriffsschicht änderte sich.

Im folgenden Monat sank die nächtliche Compute-Rechnung der Analyse-Pipeline von 202 $ auf 22 $ – der Job war in Minuten statt Stunden fertig, auf einer kleineren Instanz. Die Einsparung von 180 $/Monat hatte sechs Stunden Engineering-Zeit gekostet. Auf das Jahr hochgerechnet war das eine Rendite von 1.800 % auf die Zeitinvestition.

„Der Teil, gegen den ich mich gesträubt habe“, sagte Leo bei der monatlichen Überprüfung, „war das Umschreiben. Es stellte sich als Funktionsersatz heraus, nicht als Umschreiben. Ich löste ein eingebildetes Problem.“

„Das ist erwähnenswert“, sagte Tom. „Wenn du bewertest, ob du eine Optimierung umsetzen sollst, sei spezifisch darüber, was die Arbeit tatsächlich ist. ‚Erfordert das Umschreiben von Abfragen‘ war die eingebildete Version. ‚Erfordert das Ändern der Datenzugriffsfunktion‘ war die echte Version.“


**„Beabsichtigte vs. unbeabsichtigte Kosten“**

Am Ende der dreiwöchigen Netzwerkanalyse brachte Tom die vollständige Aufschlüsselung zurück ins Team. Er hatte eine neue Spalte in seiner Tabelle: „Beabsichtigt?“ mit einem Ja oder Nein für jeden Posten.

„Das ist der Rahmen, den ich jetzt verwende“, sagte er. „Nicht nur ‚wie viel kostet es‘, sondern ‚haben wir entschieden, das auszugeben?‘“

„Was ist eine beabsichtigte Kosten?“, fragte Maya.

„Die Aurora-Global-Database-Replikation. Wir haben entschieden, nach us-east-1 zu replizieren, weil wir Restaurantpartner an der Ostküste haben. Das sind 120 $/Monat an Cross-Region-Replikation – grob das Doppelte der Überschlagsschätzung aus den DR-Planungstagen. Wir haben diese Kosten aus einem bestimmten Grund gewählt.“

„Und unbeabsichtigt?“

„Leos Analyse-Pipeline, die fünf Monate nach Ende eines Tests nach us-east-1 schrieb. Niemand hat das gewählt. Es passierte, weil niemand hinschaute.“

„Und die NAT-Gateway-Gebühren für AWS-Dienst-Aufrufe?“

„Irgendwo dazwischen“, sagte Tom. „Wir haben nicht ausdrücklich entschieden, SSM durch das NAT Gateway zu routen – das war der Standard. Wir wussten nicht, dass es eine günstigere Option gab. Ist das beabsichtigt? Wir haben eine Wahl getroffen, wir wussten nur nicht, was wir wählten.“

„Das ist die gefährlichste Kategorie“, sagte Priya. „Die Entscheidungen, von denen man nicht weiß, dass man sie trifft.“

„Deshalb ist die VPC-Flow-Log-Analyse wichtig“, sagte Tom. „Sie macht das Unsichtbare sichtbar. Jedes Byte, das eine Grenze überquert, hat jetzt eine Geschichte, die wir nachverfolgen können.“

„Haben wir bedacht, was passiert, wenn wir das wieder treiben lassen?“, fragte Priya. „Wir haben eine einmalige Analyse gemacht. In sechs Monaten wird Leo irgendwo einen weiteren Test-Bucket erstellt haben.“

„Ich werde gleich hier sein“, sagte Leo. „Ich mache es nächstes Mal in eu-west-1, damit es zumindest pro GB mehr kostet und ihr es schneller bemerkt.“

„Monatliche VPC-Flow-Log-Überprüfung“, sagte Tom. „Ich füge sie der vierteljährlichen Kostenüberprüfung hinzu. Wenn wir einen neuen Cross-Region-Fluss oder eine NAT-Gateway-Spitze sehen, verfolgen wir sie vor der nächsten Rechnung.“

**Variante: Der Kompromiss, den man akzeptiert**

Wenn Sie Cross-AZ-Traffic eliminieren, indem Sie alles in einer einzigen Availability Zone betreiben, sparen Sie bei dem aktuellen Volumen von Nimbus ungefähr 31 $/Monat – aber Sie verlieren die Multi-AZ-Redundanz, die im Vorfallsrisiko weit mehr wert ist als das. Das reife Kostengespräch dreht sich nicht immer darum, Einsparungen zu finden; manchmal geht es darum, genau zu verstehen, wofür man zahlt, und zu entscheiden, dass es das wert ist.

Die Cross-AZ-Gebühr ist der Preis der Resilienz. Manche Netzwerkkosten sind architektonische Verpflichtungen, keine Ineffizienzen.

SAA-C03-Bezug: Die Prüfung präsentiert häufig Szenarien, in denen eine „Kostenoptimierung“ eine Redundanz eliminieren würde. Die richtige Antwort ist normalerweise, die Redundanz zu erhalten und anderswo zu optimieren – kennen Sie den Unterschied zwischen Verschwendung und den Kosten der Zuverlässigkeit.

**CloudFront: Der Datenübertragungsrabatt**

Hier ist eine kontraintuitive Tatsache: Daten über CloudFront auszuliefern ist im Allgemeinen günstiger, als sie direkt von EC2 oder S3 auszuliefern.

**Direkt EC2 ins Internet**: 0,09 $/GB
**CloudFront ins Internet**: 0,085 $/GB (etwas günstiger)

Aber die echte Einsparung ist nicht der Pro-GB-Satz – es ist, dass CloudFront Daten an Edge-Standorten cacht. Wenn 1.000 Benutzer dasselbe Menüfoto anfordern:

- **Ohne CloudFront**: 1.000 Anfragen verlassen S3 direkt ins Internet × Fotogröße × 0,09 $/GB
- **Mit CloudFront**: Clients erhalten das Foto vom Edge zum CloudFront-Satz (0,085 $/GB), und die Cache-Füllung – CloudFront, das beim 1 Miss von S3 abruft – ist **kostenlos** (AWS verzichtet auf die Origin-zu-CloudFront-Übertragung; man zahlt nur die Origin-GET-Anfragen)

Für Nimbus mit einer Cache-Trefferquote von 83 % (aus Kapitel 13) berührten 83 % der Anfragen das Origin überhaupt nicht – weniger Origin-Anfragen, weniger Origin-Last, und jedes Byte zum Edge-Satz statt zum Internet-Satz von S3 berechnet.

„CloudFront ist nicht nur ein CDN für die Leistung“, sagte Tom. „Es ist auch eine Kostenoptimierung für die Datenübertragung.“

Leo sah nachdenklich aus. „Wir sollten die gesamte Auslieferung statischer Inhalte über CloudFront leiten, auch für Assets, die nicht latenzempfindlich sind.“

„Richtig. Wenn Benutzer es von AWS herunterladen, sollte es über CloudFront gehen.“

**Die vollständige Netzwerkoptimierung**

Nach drei Wochen Analyse und Implementierung:

| Kostenpunkt                                  | Vorher   | Nachher    | Monatsersparnis |
|--------------------------------------------|----------|----------|----------------|
| NAT Gateway (Interface Endpoints)          | 289 $     | 211 $     | 78 $            |
| CloudFront-Optimierung (mehr Assets verschieben) | 214 $     | 147 $     | 67 $            |
| Cross-AZ-Traffic (wie ist akzeptiert)          | 178 $     | 178 $     | 0 $            |
| Cross-Region-Traffic (Leos Test-Bucket)   | 166 $     | 160 $     | 6 $            |
| **Gesamt**                                  | **847 $** | **696 $** | **151 $/Monat** |

151 $/Monat, 1.812 $/Jahr an Netzwerkeinsparungen. Bescheiden im Vergleich zu Compute und Speicher, aber bedeutsam.

Noch wichtiger: Tom verstand jetzt jede Zeile der Netzwerkrechnung. Er konnte jede Kosten erklären und hatte bewusst entschieden, welche er optimieren und welche er akzeptieren würde. Die Unterscheidung zwischen beabsichtigten und unbeabsichtigten Kosten war nun explizit und dokumentiert.

## Stärken und Grenzen

**NAT-Gateway-Kosten**:

- Große Datenvolumina durch das NAT Gateway sammeln sich schnell an
- VPC-Endpoints eliminieren einige NAT-Kosten vollständig
- Überprüfen Sie, welche Dienste Ihre privaten Instanzen aufrufen und ob Endpoints verfügbar sind

**CloudFront für Kosten**:

- Die Cache-Trefferquote bestimmt direkt die Kosteneinsparungen
- Hohe Cache-Trefferquote = weniger Origin-Anfragen und weniger Origin-Last, plus mehr Bytes, die zum günstigeren betrachterseitigen Satz von CloudFront berechnet werden (Origin-zu-CloudFront-Übertragung von AWS-Origins wird gar nicht berechnet)
- Leiten Sie die gesamte Auslieferung statischer Assets über CloudFront

**Cross-AZ-Kompromisse**:

- Cross-AZ-Traffic zu eliminieren erfordert normalerweise architektonische Änderungen, die mehr kosten als die Einsparungen
- Rechnen Sie sorgfältig, bevor Sie optimieren

**S3 Select** (Legacy – seit 2024 für neue Kunden nicht verfügbar; verwenden Sie stattdessen Athena. S3 Object Lambda ist jetzt ebenfalls Legacy – seit November 2025 für neue Kunden geschlossen, bestehende Arbeitslasten unberührt):

- Das Prinzip gilt: auf der Speicherebene filtern, statt große S3-Objekte herunterzuladen – die Einsparungen zeigen sich in Rechenzeit, Instanzgröße und Job-Dauer (Same-Region-S3-Übertragung ist bereits kostenlos)
- Hilft nicht, wenn Sie die gesamte Datei benötigen

## Zusammenfassung

Tom schloss die Netzwerkanalyse mit einer Zahl auf dem Whiteboard und einem klareren Verständnis dessen ab, was die letzte Unbekannte auf der Rechnung tatsächlich war. Die 847 $/Monat an Netzwerkkosten waren kein Rätsel der Inkompetenz gewesen – es waren die erwarteten Kosten eines verteilten Systems, das sich über Availability Zones erstreckte, globale Benutzer bediente und Daten über Regionen replizierte. Das meiste davon war es wert, gezahlt zu werden. Manches nicht. Der entscheidende Fortschritt war, sagen zu können, was was war.

- AWS berechnet für **ausgehende Daten** (Internet: ~0,09 $/GB), **Cross-AZ-Traffic** (0,01 $/GB pro Richtung), **Cross-Region-Traffic** (0,02–0,08 $/GB) und **NAT-Gateway-Verarbeitung** (0,045 $/GB).
- **Eingehende Daten** sind kostenlos. **Same-AZ-Traffic** ist kostenlos.
- **VPC Flow Logs** offenbaren, welche spezifischen Verkehrsflüsse innerhalb Ihrer VPCs welche Kostenkategorie erzeugen – unerlässlich für gezielte Optimierung. Flüsse, die nie eine VPC-Netzwerkschnittstelle überqueren (wie CloudFront, das von einem S3-Origin abruft), brauchen eigene Instrumente: CloudFront-Standardprotokolle oder S3-Server-Zugriffsprotokolle.
- **VPC Gateway Endpoints** (S3, DynamoDB): Kostenlos. Eliminieren NAT-Gateway-Kosten für diese Dienste.
- **VPC Interface Endpoints**: Berechnet pro Stunde plus pro GB. Günstiger als NAT Gateway für volumenstarke Dienste.
- **CloudFront** liefert Daten zu niedrigeren Sätzen als die direkte EC2-zu-Internet-Übertragung und reduziert das Origin-Übertragungsvolumen durch Caching dramatisch.
- Die entscheidende Frage ist nicht nur „wie viel“, sondern „ist diese Kosten beabsichtigt?“ Unbeabsichtigte Kosten – vergessene Test-Pipelines, Standard-Routing durch NAT – sind dort, wo sich die echten Einsparungen verstecken.

## Prüfungstipps

*SAA-C03-Domäne: Design Cost-Optimized Architectures (Domäne 4, Aufgabe 4.4)*

- **NAT Gateway vs. VPC Endpoints**: Prüfungsszenario: „EC2 im privaten Subnetz ruft häufig S3/DynamoDB auf – wie reduziert man NAT-Gateway-Kosten?“ → VPC Gateway Endpoints (kostenlos für S3 und DynamoDB).
- **Datenübertragungs-Preisregeln**:
  - In AWS hinein: kostenlos
  - Same-AZ: kostenlos
  - Cross-AZ: berechnet
  - Cross-Region: berechnet (höherer Satz)
  - Internet: berechnet (erheblicher Satz)
- **CloudFront als Kostenoptimierung**: „Datenübertragungskosten für globale Content-Auslieferung reduzieren“ → CloudFront. Die Cache-Schicht reduziert Origin-Anfragen.
- **S3 Transfer Acceleration**: Beschleunigt Uploads *zu* S3 unter Verwendung von CloudFront-Edge-Standorten. Höhere Kosten als Standard-S3. Verwenden für Kunden, die große Dateien von geografisch weit entfernten Standorten hochladen.
- **Cross-Region-Replikationskosten**: Das Replizieren von Daten über Regionen verursacht Datenübertragungsgebühren. Für S3 CRR zahlen Sie sowohl den Data-Transfer-Out-Satz als auch die S3-Anfragekosten.
- **PrivateLink (VPC Interface Endpoints)**: Bietet private Konnektivität zu AWS-Diensten und zu Diensten, die von anderen AWS-Kunden gehostet werden. Sicherer als das Durchlaufen von NAT, oft günstiger für volumenstarke Dienste. Der Break-Even gegenüber der NAT-Gateway-Verarbeitung liegt bei ungefähr 420 GB/Monat (unter Berücksichtigung der eigenen Pro-AZ-Stundenkosten des Endpoints und unter der Annahme, dass das NAT Gateway für anderen Traffic bestehen bleibt).

## Übungen

**Übung 1 — Wiederholung**

Erklären Sie den Unterschied zwischen einem VPC Gateway Endpoint und einem VPC Interface Endpoint. Für welche AWS-Dienste ist jeweils welcher verfügbar, und was kostet jeder?

*(Hinweis: Gateway Endpoints sind kostenlos, aber nur für S3 und DynamoDB. Interface Endpoints kosten pro Stunde, funktionieren aber für die meisten anderen AWS-Dienste.)*

**Übung 2 — SAA-C03-Szenario**

*Szenario*: Die Anwendung eines Unternehmens läuft auf EC2-Instanzen in privaten Subnetzen. Die Instanzen tätigen häufige API-Aufrufe an Amazon SQS und Amazon S3. Derzeit verlässt der gesamte Traffic das Netzwerk über ein NAT Gateway. Das Team möchte die NAT-Gateway-Kosten reduzieren. Die Datensicherheit muss gewahrt bleiben – kein Traffic sollte das öffentliche Internet durchqueren.

Welcher Ansatz erfüllt diese Anforderungen am BESTEN mit minimalen laufenden Kosten?

A) Einen Gateway Endpoint für SQS und einen Gateway Endpoint für S3 erstellen  
B) Interface Endpoints für sowohl SQS als auch S3 erstellen  
C) Einen Interface Endpoint für SQS und einen Gateway Endpoint für S3 erstellen  
D) Das NAT Gateway entfernen und das Internet Gateway direkt für API-Aufrufe verwenden

**Hinweis 1**: Gateway Endpoints sind nur für S3 und DynamoDB verfügbar.

**Hinweis 2**: Interface Endpoints sind für SQS und viele andere Dienste verfügbar (kosten aber Geld).

**Hinweis 3**: Ein Internet Gateway in der Routing-Tabelle des privaten Subnetzes würde es zu einem öffentlichen Subnetz machen – was Sicherheitsanforderungen verletzt.

**Antwort**: C

**Erläuterung**: S3 verwendet einen Gateway Endpoint (kostenlos). SQS erfordert einen Interface Endpoint (kostenpflichtig). Diese Kombination eliminiert die NAT-Gateway-Datenverarbeitungskosten für beide Dienste. Der gesamte Traffic bleibt innerhalb des privaten Netzwerks von AWS – keine Durchquerung des öffentlichen Internets.

**Warum nicht A?** Gateway Endpoints sind für SQS nicht verfügbar. Nur S3 und DynamoDB haben Gateway Endpoints.

**Warum nicht B?** Obwohl dies funktioniert, verursacht die Verwendung eines Interface Endpoints für S3 (statt des kostenlosen Gateway Endpoints) unnötige Stundengebühren. Verwenden Sie für S3 und DynamoDB immer den kostenlosen Gateway Endpoint.

**Warum nicht D?** Eine Route zum Internet Gateway aus dem privaten Subnetz hinzuzufügen macht es zu einem öffentlichen Subnetz. EC2-Instanzen in privaten Subnetzen haben in der Regel keine Elastic IPs, sodass sie ohne zusätzliche Änderungen gar nicht über ein Internet Gateway routen könnten – und das würde sie eingehendem Internet-Traffic aussetzen.

*SAA-C03-Domäne: Design Cost-Optimized Architectures — Aufgabe 4.4*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Die Nutzer von Nimbus an der Ostküste erzeugen erheblichen Traffic. Die Anwendung bedient sie aus us-west-2 (Oregon). Derzeit:

- API-Antworten gehen direkt von us-west-2-EC2-Instanzen zu den Nutzern an der Ostküste (~80 ms, 0,09 $/GB)
- Menüfotos gehen von S3 us-west-2 über den CloudFront-Edge in Boston (~8 ms nach Caching)

Das Team erwägt, eine zweite Anwendungsregion in us-east-1 (Northern Virginia) für die Nutzer an der Ostküste hinzuzufügen, um die API-Latenz zu reduzieren.

Analysieren Sie die Datenübertragungskosten dieser Änderung. Welche neuen Cross-Region-Datenübertragungskosten würde die Dual-Region-Konfiguration verursachen? Würde Route-53-latenzbasiertes Routing die gesamten Übertragungskosten reduzieren oder erhöhen? Unter welchen Bedingungen (Verkehrsvolumen, Latenzempfindlichkeit) würde sich die Dual-Region-Konfiguration auszahlen?

*(Es gibt keine eindeutig korrekte Antwort. Das Ziel ist, eine Multi-Region-Kosten-Nutzen-Analyse zu üben.)*

## Post-Credits-Szene

Tom schloss die Netzwerkanalyse ab.

Gesamtwirkung des dreimonatigen Optimierungsprojekts:

- EC2 Savings Plans: -14.200 $/Jahr
- S3-Lebenszyklusrichtlinien: -7.800 $/Jahr
- Speicher (S3 + EBS): -6.200 $/Jahr
- Datenbankebene: -5.892 $/Jahr
- Netzwerk: -1.812 $/Jahr
- **Gesamt: -35.904 $/Jahr**

Er schrieb es auf ein Whiteboard im Besprechungsraum.

Leo starrte darauf. „Fünfunddreißigtausend.“

„Und ein bisschen mehr“, sagte Tom.

„Pro Jahr.“

„Pro Jahr.“

Priya machte die Rechnung. „Das sind 2.992 $ pro Monat, die wir für Dinge ausgegeben haben, die keinen Wert schufen.“

„Nicht alles davon“, korrigierte Tom. „Manches davon waren Dinge, aus denen wir Wert zogen, aber für die wir zu viel zahlten. Die Savings Plans – wir bekamen genau dieselbe EC2-Kapazität, nur zu einem besseren Preis.“

Maya stand lange vor dem Whiteboard.

„Als wir Nimbus gründeten“, sagte sie, „zählte jeder Dollar. Wir konnten uns kaum die erste EC2-Instanz leisten.“

„Ja“, sagte Tom.

„Und irgendwann auf dem Weg hörten wir auf, die Dollar so genau im Auge zu behalten.“

„Wachstum macht das“, sagte Priya. „Der Fokus verschiebt sich aufs Bauen, nicht aufs Optimieren.“

„Beides ist wichtig“, sagte Maya. „Beides, immer. Füge das dem Wiki hinzu. Und lege eine vierteljährliche Kostenüberprüfung fest.“

Tom öffnete bereits seinen Kalender.

In den nächsten paar Kapiteln: Wir zoomen von einzelnen Diensten heraus und beginnen, wie Architekten zu denken.
