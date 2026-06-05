# Kapitel 30: Die Verborgene Kosten

Speicherkosten zeigen sich als eine Zeile: „S3: 198 $“. Rechenkosten zeigen sich als eine Zeile: „EC2: 2.340 $“. Netzwerkkosten verteilen sich auf eine Dutzend Zeilen mit Namen wie „Datenübertragung nach außen“, „NAT Gateway Verarbeitung“, „VPC Peering Datenübertragung“ und „CloudFront Datenübertragung“. Die meisten Ingenieure addieren sie einmal, blinzeln und addieren sie dann wieder.

Tom hatte gesagt: „Die Netzwerkkosten. Das ist als nächstes.“

Er öffnete die Rechnung. Suchte den Abschnitt zur Datenübertragung. Addierte alle Zeilen auf.

Netzwerkkosten in AWS sind wie das Vergnügen eines Stadtsteuersystems: Das Einfahren in die Stadt ist kostenlos, aber jeder Tunnel, den Sie nach außen nehmen, kostet Geld, und das Fahren zwischen Stadtvierteln ist auch etwas teuer. Die meisten Leute denken nicht über die Mautgebühren nach, bis sie am Ende des Monats eine Rechnung erhalten und feststellen, dass sie den Tunnel jeden Tag genommen haben, obwohl es eine freie Straße die ganze Zeit gab. Das Ziel dieses Kapitels ist es, jede Mautstation zu verstehen – und zu entscheiden, welche es sich zu bezahlen lohnt.

847 $/Monat.

„Wir geben 847 $ pro Monat für Datenübertragung aus“, sagte er.

„Ist das viel?“ fragte Leo.

„Es ist mehr als unser S3-Rechnungsbetrag war, bevor wir ihn optimiert haben. Und ich wusste gar nicht, dass wir eine so große Datenübertragungsrechnung haben.“

Maya sah darüber hinweg. „Was genau ist Datenübertragung?“

„Das ist, was AWS für den Umzug von Bytes berechnet. Bytes in AWS: normalerweise kostenlos. Bytes aus AWS ins Internet: berechnet. Bytes zwischen Diensten in verschiedenen Regionen: berechnet. Bytes, die über einen NAT Gateway laufen: berechnet.“

„Kannst du es aufschlüsseln?“

Tom konnte es. Und was er fand, veränderte die Art und Weise, wie das Team über ihre Architektur dachte.

**Wie AWS Datenübertragung berechnet**

Die Datenübertragungsberechnung von AWS ist asymmetrisch:

**In AWS (inbound)**: Kostenlos. Sie können so viele Daten hochladen, wie Sie möchten.

**Aus AWS ins Internet (outbound)**: Berechnet. Die ersten 100 GB/Monat sind kostenlos. Danach:

- 0,09 $/GB für die ersten 10 TB/Monat (US-Regionen)
- 0,085 $/GB für die nächsten 40 TB
- Günstiger bei höheren Volumina

**Innerhalb derselben Availability Zone**: Kostenlos. EC2-Instanzen, die miteinander in derselben AZ kommunizieren, zahlen nichts.

**Zwischen Availability Zones (gleiche Region)**: 0,01 $/GB in jede Richtung. Eine kleine, aber reale Kosten.

**Zwischen Regionen**: 0,02 – 0,08 $/GB, je nach Region. Cross-Region-Verkehr ist deutlich teurer.

**NAT Gateway**: 0,045 $/GB verarbeitet. Jeder Byte, den Ihre private EC2-Instanz an das Internet sendet – und jeder Byte, der zurückkommt – wird berechnet.

**CloudFront**: Geringere Datenübertragungsraten als direkte AWS-zu-Internet-Übertragung. 0,085 $/GB für die ersten 10 TB (etwas weniger als direkte Datenübertragung nach außen). CloudFront reduziert oft die Gesamtdatenübertragungskosten, da seine Edge-Caching bedeutet, dass der Ursprung weniger oft Daten bereitstellt.

**Tom's Aufschlüsselung**

Nachdem er jeden Zeilenpunkt kategorisiert hatte:

**Ausgehende Daten zum Internet**: 214 $/Monat

- API-Antworten an Kunden weltweit
- CloudFront-Cache-Füllungen (wenn Edge-Standorte Daten vom Ursprung abrufen)

**NAT Gateway-Verarbeitung**: 289 $/Monat

- Anwendungsserver, die externe APIs aufrufen (Zahlungsabwickler, E-Mail-Dienste, Karten-Daten)
- DynamoDB-Aufrufe über den NAT Gateway (bevor VPC-Endpunkte für einige Tabellen eingerichtet wurden)

**Cross-AZ-Datenübertragung**: 178 $/Monat

- Load Balancer zu EC2-Instanzen (der Load Balancer befindet sich in einer AZ, einige Instanzen in einer anderen)
- Anwendungsserver zu RDS-Read-Replica (in einer anderen AZ)

**Cross-Region-Datenübertragung**: 166 $/Monat

- Aurora Global Database-Replikation (Primär in us-east-1, Reader in us-west-2)
- S3 Cross-Region-Replikation für Backups

**NAT Gateway: Die größte Überraschung**

289 $/Monat in NAT Gateway-Verarbeitungsgebühren war der größte Posten. Und es war teilweise unnötig.

In Kapitel 11 hatte Tom VPC Gateway Endpoints für S3 und DynamoDB eingerichtet. Diese waren kostenlos. Aber er hatte vergessen, Interface Endpoints für mehrere andere Dienste einzurichten:

- Systems Manager (SSM) für Patch-Management
- Secrets Manager für Anmeldeinformationen
- CloudWatch für Metrik- und Protokollversand
- SQS für Nachrichten-Polling

Jeder Aufruf zu diesen Diensten von privaten EC2-Instanzen ging über den NAT Gateway. Jeder Aufruf verursachte 0,045 $/GB.

**Interface Endpoints** für diese Dienste: 0,01 $/Stunde pro AZ + 0,01 $/GB Datenverarbeitung.

Bei Nimbuss Volumen würde der SSM Interface Endpoint etwa 15 $/Monat kosten und etwa 43 $/Monat an NAT Gateway-Gebühren sparen (da SSM ein erhevolles Datenvolumen für Patch-Management und Parameterstore-Aufrufe generiert).

Endpoint-Kosten und Einsparungen variierten je nach Dienst und Volumen. Tom berechnete, dass die Einrichtung von Interface Endpoints für die vier am stärksten frequentierten Dienste 62 $/Monat kosten und etwa 140 $/Monat an NAT Gateway-Verarbeitung sparen würde.

Netto-Einsparung: 78 $/Monat durch die Einrichtung von Endpunkten allein.

**Cross-AZ-Verkehr: Eine architektonische Frage**

Die 178 $/Monat in Cross-AZ-Datenübertragung waren komplizierter.

Ein Teil davon war unvermeidlich: Der Load Balancer verteilt den Verkehr über AZs, sodass einige Anfragen in einer AZ initiiert und der Load Balancer sie an eine Instanz in einer anderen AZ weiterleitet.

Ein Teil davon war optimierbar: Die Anwendung war so konfiguriert, dass sie in us-east-1a schrieb und von der Read-Replica in us-east-1b las. Jede Leseabfrage kreuzte AZ-Grenzen.

Für die Leser gibt es eine Lösung: Konfigurieren Sie die Anwendung so, dass sie eine Read-Replika in derselben Availability Zone (AZ) wie die anfragende Instanz bevorzugt. Jede AZ erhält ihre eigene Read-Replika. Der Datenverkehr bleibt lokal.

Handelsabgleich: Mehr Read-Replikate = Mehr Kosten. Wenn die Kosten für den Datenverkehr über AZs 50 $/Monat betragen und eine zusätzliche Read-Replika 190 $/Monat kostet, zahlt die AZ-lokale Optimierung sich nicht aus.

Tom berechnete: Bei ihrem aktuellen Abfragevolumen betrug der Datenverkehr über AZs nur 31 $/Monat von den 178 $. Das macht es nicht den Anschein, zusätzliche Replikate hinzuzufügen.

Die anderen Kosten für den Datenverkehr über AZs waren das Routing des Load Balancers und die Kommunikation zwischen Diensten – weitgehend unvermeidlich auf diesem aktuellen Architekturlevel.

„Dies ist einer dieser Fälle, in dem das Verständnis der Kosten nicht bedeutet, dass man es beheben muss“, sagte Tom.

„Wie hoch wären die Kosten, um den Datenverkehr über AZs vollständig zu eliminieren?“, fragte Maya.

„Alles in einer AZ widerspricht dem Zweck von Multi-AZ. Das wäre eine Ersparnis von 31 $/Monat zu Lasten des Verlusts der Hochverfügbarkeit.“

„Also lassen wir es bleiben“, sagte sie.

„Wir lassen es bleiben.“

Dies ist das reife Gespräch über die Kosten: Manchmal zahlt man für etwas, weil die Alternative teurer ist.

**CloudFront: Der Datenübertragungsrabatt**

Hier ist eine unerwartete Tatsache: Das Bereitstellen von Daten über CloudFront ist im Allgemeinen günstiger als das Bereitstellen von Daten direkt von EC2 oder S3.

**Direkte EC2-Verbindung zum Internet:** 0,09 $/GB
**CloudFront-Verbindung zum Internet:** 0,085 $/GB (leicht günstiger)

Aber die wahre Ersparnis ist nicht die Rate pro GB – es ist, dass CloudFront Daten an Randstandorten cacht. Wenn 1.000 Benutzer dasselbe Menüfoto anfordern:

- **Ohne CloudFront:** 1.000 Anfragen treffen die S3-Quelle × Foto-Größe × 0,09 $/GB
- **Mit CloudFront:** 1 Anfrage trifft die S3-Quelle (Cache-Fehlschlag) + 999 Anfragen werden von der CloudFront-Cache-Schicht zu den Randraten bedient

Für Nimbus mit einer Cache-Trefferquote von 83 % (aus Kapitel 13) wurden 83 % der Anfragen von der Cache-Schicht an der Grenze bedient. Die tatsächliche Datenübertragung der Quelle betrug 17 % des gesamten Traffics – 83 % ihres „ausgesandten“ Traffics wurden an der Grenze zwischengespeichert.

„CloudFront ist nicht nur ein CDN für die Leistung“, sagte Tom. „Es ist auch eine Kostenoptimierung für die Datenübertragung.“

Leo sah nachdenklich. „Wir sollten alle statischen Inhaltsbereitstellungen über CloudFront durchführen, auch für Assets, die nicht zeitkritisch sind.“

„Richtig. Wenn Benutzer es von AWS herunterladen, sollte es über CloudFront erfolgen.“

**S3 Select: Reduzierung der Datenübertragung in Abfragen**

Eine subtile Optimierung: **S3 Select** ermöglicht es, nur die Zeilen und Spalten abzurufen, die Sie aus einem S3-Objekt (CSV, JSON, Parquet) benötigen, anstatt die gesamte Datei herunterzuladen, um sie in Ihrer Anwendung zu filtern.

Ohne S3 Select:

```python
# Download 500MB file, process in memory
data = s3.get_object(Bucket='analytics', Key='orders-2024.csv')
df = pd.read_csv(data['Body'])
result = df[df['restaurant_id'] == '47'][['order_id', 'total']]
```

With S3 Select:

```python
# Let S3 filter first, transfer only matching rows (~2MB instead of 500MB)
response = s3.select_object_content(
    Bucket='analytics',
    Key='orders-2024.csv',
    Expression="SELECT order_id, total FROM S3Object WHERE restaurant_id = '47'"
)
```

```markdown
S3 Select reduziert die Datenübertragung von S3 zu Ihrer Anwendung. Bei großen Dateien mit selektiven Abfragen kann dies eine Reduzierung des Datenvolumens um 10-100x – und somit auch der Kosten – bedeuten.

**Die Vollständige Netzwerkoptimierung**

Nach drei Wochen Analyse und Implementierung:

| Kostenpunkt                               | Vorher    | Nachher   | Monatsersparnis |
|------------------------------------------|-----------|-----------|-----------------|
| NAT Gateway (Schnittstellenendpunkte)     | 289 €     | 211 €     | 78 €            |
| CloudFront-Optimierung (mehr Assets)      | 214 €     | 147 €     | 67 €            |
| Quer-AZ-Verkehr (akzeptiert wie gehabt)   | 178 €     | 178 €     | 0 €             |
| Quer-Region-Verkehr (akzeptiert wie gehabt) | 166 €     | 166 €     | 0 €             |
| **Gesamt**                               | **847 €** | **702 €** | **145 €/Monat** |

145 €/Monat, 1.740 €/Jahr in Netzwerkkostenersparnis. Moderat im Vergleich zu Compute und Storage, aber bedeutsam.

Noch wichtiger: Tom verstand nun jede Zeile der Netzwerkkostenabrechnung. Er konnte jede Kostenstelle erklären und hatte sich bewusst entschieden, welche er optimieren und welche er akzeptieren wollte.

## Stärken und Grenzen

**NAT Gateway-Kosten:**

- Große Datenmengen über den NAT Gateway stapeln sich schnell
- VPC Endpunkte eliminieren einige NAT-Kosten vollständig
- Überprüfen Sie, welche Dienste Ihre privaten Instanzen aufrufen und ob Endpunkte verfügbar sind

**CloudFront für Kosten:**

- Die Cache-Hit-Rate bestimmt direkt die Kosteneinsparungen
- Hohe Cache-Hit-Rate = geringere Origin-Transfer + geringere Gesamttransferkosten
- Übertragen Sie alle statischen Asset-Lieferungen über CloudFront

**Quer-AZ-Abwägungen:**

- Das Eliminieren von Quer-AZ-Verkehr erfordert in der Regel architektonische Änderungen, die mehr kosten als die Einsparungen
- Berechnen Sie sorgfältig, bevor Sie optimieren

**S3 Select:**

- Deutliche Einsparungen bei selektiven Abfragen auf großen S3-Objekten
- Hilft nicht, wenn Sie die gesamte Datei benötigen

Im nächsten Kapitel: Der Sechs-Pfeiler-Rahmen, der die Fragen ist, die jede Architekturüberprüfung anfangen sollte.

## Zusammenfassung

- AWS berechnet für **ausgehende Daten** (Internet: ca. 0,09 €/GB), **Quer-AZ-Verkehr** (0,01 €/GB pro Richtung), **Quer-Region-Verkehr** (0,02-0,08 €/GB) und **NAT Gateway-Verarbeitung** (0,045 €/GB).
- **Einfließende Daten** sind kostenlos. **Same-AZ-Verkehr** ist kostenlos.
- **VPC Gateway Endpunkte** (S3, DynamoDB): Kostenlos. Eliminieren NAT Gateway-Kosten für diese Dienste.
- **VPC Interface Endpunkte**: Preis pro Stunde plus pro GB. Günstiger als NAT Gateway für hochvolumige Dienste.
- **CloudFront** bedient Daten zu niedrigeren Raten als direkte EC2-zu-Internet und reduziert das Origin-Transfer-Volumen drastisch durch Caching.
- **S3 Select** reduziert die Datenübertragung von S3, indem es am Quellpunkt filtert.
- Einige Netzwerkkosten sind architektonische Abwägungen (Quer-AZ für HA) – verstehen Sie diese, eliminieren Sie sie nicht immer.

## Prüftipps

*SAA-C03 Domain: Design Cost-Optimized Architectures (Domain 4, Task 4.4)*

- **NAT Gateway vs VPC Endpunkte**: Prüfscenario: "EC2 in privatem Subnetz ruft häufig S3/DynamoDB auf – wie kann ich NAT Gateway-Kosten reduzieren?" → VPC Gateway Endpunkte (kostenlos für S3 und DynamoDB).
- **Datenübertragungs-Preisregeln**:
  - In AWS: kostenlos
  - Same-AZ: kostenlos
  - Quer-AZ: berechnet
  - Quer-Region: berechnet (höhere Rate)
  - Internet: berechnet (signifikante Rate)
- **CloudFront als Kostenoptimierung**: "Reduzieren Sie die Datenübertragungskosten für globale Content Delivery" → CloudFront. Die Cache-Schicht reduziert Origin-Anfragen.
- **S3 Transfer Acceleration**: Beschleunigt Uploads *zu* S3 mit CloudFront Edge Locations. Höhere Kosten als Standard S3. Verwenden Sie sie für Kunden, die große Dateien von geografisch weit entfernten Standorten hochladen.
- **Quer-Region-Replikationskosten**: Das Replikieren von Daten über Regionen verursacht Datenübertragungskosten. Für S3 CRR zahlen Sie sowohl die Ausgabedatenrate als auch die S3-Anforderungskosten.
- **PrivateLink (VPC Interface Endpunkte)**: Bietet private Konnektivität zu AWS-Diensten und zu Diensten, die von anderen AWS-Kunden gehostet werden. Sicherer als das Durchlaufen des NAT, oft günstiger für hochvolumige Dienste.

## Übungen

**Übung 1 – Erinnerung**

Erklären Sie den Unterschied zwischen einem VPC Gateway Endpoint und einem VPC Interface Endpoint. Für welche AWS-Dienste steht jeweils eines zur Verfügung und was sind die Kosten dafür?

*(Hinweis: Gateway Endpunkte sind kostenlos, aber nur für S3 und DynamoDB. Interface Endpunkte kosten pro Stunde, funktionieren aber für die meisten anderen AWS-Dienste.)*

**Übung 2 – Prüfungsübung**

*Szenario*: Eine Anwendung läuft auf EC2-Instanzen in privaten Subnetzen. Die Instanzen rufen häufig API-Aufrufe an Amazon SQS und Amazon S3 ab. Der gesamte Traffic verlässt sich derzeit über einen NAT Gateway. Das Team möchte NAT Gateway-Kosten reduzieren. Die Sicherheit muss aufrechterhalten werden – kein Traffic sollte über das öffentliche Internet laufen.

Welcher Ansatz erfüllt diese Anforderungen am besten mit minimalen laufenden Kosten?

A) Erstellen Sie einen Gateway Endpoint für SQS und einen Gateway Endpoint für S3
B) Erstellen Sie einen Interface Endpoint für SQS und einen Gateway Endpoint für S3
C) Erstellen Sie Interface Endpunkte für beide SQS und S3
D) Entfernen Sie den NAT Gateway und verwenden Sie das Internetgateway direkt für API-Aufrufe

*(Hinweis: Gateway Endpunkte sind nur für S3 und DynamoDB verfügbar.)*
```

**Hinweis 2**: Schnittstellen-Endpunkte sind für SQS und viele andere Dienste verfügbar (aber kosten Geld).

**Hinweis 3**: Ein Internet Gateway in der privaten Subnetz-Routing-Tabelle würde es zu einem öffentlichen Subnetz machen – was Sicherheitsanforderungen verletzt.

**Antwort**: B

**Erläuterung**: S3 verwendet einen Gateway-Endpunkt (kostenlos). SQS benötigt einen Schnittstellen-Endpunkt (preisbasiert). Diese Kombination beseitigt die Datenverarbeitungskosten für beide Dienste durch den NAT Gateway. Alle Datenverkehr bleibt innerhalb des privaten Netzwerks von AWS – ohne Internet-Traversal.

**Warum nicht A?** Gateway-Endpunkte sind für SQS nicht verfügbar. Nur S3 und DynamoDB haben Gateway-Endpunkte.

**Warum nicht C?** Obwohl dies funktioniert, verursacht die Verwendung eines Schnittstellen-Endpunkts für S3 (anstelle des kostenlosen Gateway-Endpunkts) unnötige stündliche Kosten. Verwenden Sie immer den kostenlosen Gateway-Endpunkt für S3 und DynamoDB.

**Warum nicht D?** Das Hinzufügen einer Route zum Internet Gateway aus dem privaten Subnetz macht es zu einem öffentlichen Subnetz. EC2-Instanzen in privaten Subnetzen haben in der Regel keine Elastic IPs, sodass sie ohne zusätzliche Änderungen nicht über ein Internet Gateway routen könnten – und dies würde sie der eingehenden Internetverkehr aussetzen.

*SAA-C03 Domäne: Gestaltung kosteneffizienter Architekturen – Aufgabe 4.4*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nimbuss's West Coast Benutzer generieren erhebliche Datenverkehr. Die Anwendung wird von uns-east-1 (Virginia) für sie bereitgestellt. Aktuell:

- API-Antworten gehen direkt von den EC2-Instanzen in us-east-1 zu West Coast Benutzern (~80ms, $0.09/GB)
- Menüfotos gehen von S3 us-east-1 über CloudFront Edge in Seattle (~8ms nach Caching)

Das Team erwägt, eine zweite Anwendungsregion in us-west-2 (Oregon) für West Coast Benutzer hinzuzufügen, um die API-Latenz zu reduzieren.

Analysieren Sie die Datenübertragungskosten dieser Änderung. Welche neuen Kosten für die Datenübertragung über mehrere Region entstehen durch die Dual-Region-Konfiguration? Würde Route 53-Latenzbasierte Routing die Gesamtzuführungs-Kosten reduzieren oder erhöhen? Unter welchen Bedingungen (Datenverkehrsvolumen, Latenzempfindlichkeit) würde sich die Dual-Region-Konfiguration auszahlen?

*(Es gibt keine eindeutige richtige Antwort. Das Ziel ist es, die Multi-Region-Kosten-Nutzen-Analyse zu üben.)*

## Post-Credits Szene

Tom schloss die Netzwerkanalyse.

Gesamte Drei-Monats-Optimierungs-Projekt-Auswirkung:

- EC2 Savings Plans: -$14.200/Jahr
- Speicher (S3 + EBS): -$6.200/Jahr
- Datenbank-Tier: -$11.220/Jahr
- Netzwerk: -$1.740/Jahr
- **Gesamt: -$33.360/Jahr**

Er schrieb es auf eine Whiteboard im Besprechungsraum.

Leo starrte darauf. "Dreiunddreißigtausend."

"Und Mehrwert," sagte Tom.

"Pro Jahr."

"Pro Jahr."

Priya machte die Rechnung. "Dass wir 2.780 Dollar pro Monat für Dinge ausgaben, die keinen Mehrwert schufen."

"Nicht alle," korrigierte Tom. "Manche davon waren Dinge, von denen wir einen Wert hatten, aber zu viel dafür bezahlt haben. Die Savings Plans – wir erhielten genau die gleiche EC2-Kapazität, nur zu einem besseren Preis."

Maya stand lange vor dem Whiteboard.

"Als wir Nimbuss starteten", sagte sie, "hat jeder Dollar gezählt. Wir konnten uns kaum die erste EC2-Instanz leisten."

"Ja", sagte Tom.

"Und irgendwo zwischenzeitlich hörten wir auf, die Dollar so genau zu beobachten."

"Wachstum tut das", sagte Priya. "Der Fokus verschiebt sich auf den Bau, nicht auf die Optimierung."

"Beides ist wichtig", sagte Maya. "Beides, immer. Fügen Sie dies zur Wiki hinzu. Und legen Sie eine Quartalsüberprüfung für die Kosten fest."

Tom öffnete bereits seinen Kalender.

In den nächsten Kapiteln zoomt es aus von einzelnen Diensten und wir denken wie Architekten.
