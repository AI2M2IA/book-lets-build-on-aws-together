# Kapitel 13: Fast Everywhere

Ein Foto, das von einem Server in Virginia zu einem Telefon in Seattle reist, legt schätzungsweise 4.400 Kilometer optischen Kabels. Bei zwei Dritteln der Lichtgeschwindigkeit sind das etwa 25 Millisekunden reiner Physik – unvermeidlich, unhandelbar, in die Gesetze des Universums eingebrannt.

Dann kommt noch die Hin- und Rückfahrt hinzu. Dann kommt die Verarbeitungszeit hinzu. Der Browser hat noch nicht mit dem Rendern begonnen und 80 Millisekunden sind bereits vergangen.

`eatnimbus.com` war online. Leo hatte die Latenzmetriken von Benutzern an der Westküste überprüft: 80 bis 100 Millisekunden pro Anfrage. Das mag gering erscheinen, aber es kumuliert sich.

Lade das Menü: 90 ms. Lade die Restaurantliste: 80 ms. Lade die Fotos des Restaurants: 200 ms (Bilder sind groß). Die Gesamtzeit, bis ein Benutzer eine Bestellung aufgeben kann: über eine halbe Sekunde bei einer guten Verbindung.

„Die Physik ist das Problem“, sagte Leo. „Die Server befinden sich in Virginia. Die Benutzer befinden sich an der Westküste.“

„Also verschiebe die Server an die Westküste“, sagte Tom.

„Das kostet Geld.“

„Wie viel?“

„Eine Menge. Und es erzeugt ein völlig neues Problem: Das Synchronisieren der Datenbank im Osten mit der Datenbank auf der Westküste.“

Priya blickte von ihrem Laptop auf. „Oder wir verschieben die Server nicht. Wir verschieben den *Inhalt*.“

**Die Analogie des Vorräths**

Stellen Sie sich Amazon als Händler vor, nicht als Cloud-Unternehmen. Sie haben einen riesigen Lagerraum an einem Ort mit jedem Produkt. Wenn sie jede Bestellung aus diesem einen Lagerhaus versenden würden, würden Kunden in fernen Städten Tage brauchen, um ihre Bestellung zu erhalten.

Stattdessen hat Amazon Fulfillment-Zentren in der Nähe von Großstädten. Wenn ein Produkt beliebt ist, lagern sie Kopien vor Ort ein. Wenn ein Kunde in Seattle ein Buch bestellt, wird es aus dem lokalen Fulfillment-Zentrum versandt – nicht aus Virginia.

Dies ist ein **Content Delivery Network (CDN)**: ein Netzwerk von geografisch verteilten Servern, das Kopien Ihres Inhalts in der Nähe Ihrer Benutzer speichert.

Wenn ein Benutzer in Seattle Ihre Homepage anfordert, bedient das CDN sie von einem Server in Seattle. Nicht aus Virginia. Die Anfrage kreuzt das Land nicht.

**Meet CloudFront**

Amazon CloudFront ist AWS's CDN. Es arbeitet über ein globales Netzwerk von **Edge-Standorten** – Caching-Servern, die in Städten auf der ganzen Welt positioniert sind. Stand der Dinge gibt es über 500 Edge-Standorte in mehr als 90 Städten.

Wenn Sie CloudFront konfigurieren, geben Sie eine **Origin** an: die Quelle Ihres tatsächlichen Inhalts. Ihre Origin könnte sein:

- Ein S3-Bucket (statische Dateien: Bilder, CSS, JavaScript, PDFs)
- Ein Application Load Balancer (dynamischer Inhalt von Ihrer Anwendung)
- Eine EC2-Instanz
- Ein HTTP-Server irgendwo im Internet

CloudFront befindet sich vor Ihrer Origin. Anfragen kommen an den nächstgelegenen Edge-Standort. Wenn der Edge-Standort den Inhalt zwischengespeichert hat, gibt er ihn sofort zurück. Wenn nicht (ein *Cache-Miss*), ruft er ihn von der Origin ab, speichert ihn zwischen und gibt ihn zurück.

**Wie CloudFront-Caching funktioniert**

Die erste Anfrage für jeden Inhalt ist immer ein Cache-Miss – sie geht zur Origin. Jeder nachfolgende Request trifft den Cache am Edge-Standort.

Für Nimbus sind die Menüfotos perfekte CloudFront-Kandidaten. Restaurantfotos ändern sich selten (vielleicht wenn das Restaurant sein Profil aktualisiert). Mit CloudFront:

1. Benutzer in Seattle fordert `images.eatnimbus.com/restaurant-047/photo.jpg` an
2. CloudFront prüft den Edge-Standort in Seattle – noch nicht zwischengespeichert (Cache-Miss)
3. CloudFront ruft von S3 in us-east-1 ab (~80 ms)
4. CloudFront speichert das Foto im Seattle Edge-Standort
5. Nächster Benutzer in Seattle fordert dasselbe Foto an
6. CloudFront bedient es von der lokalen Edge-Cache (~5 ms)

Gleiche 80 ms Strafe für den ersten Request. Aber der tausendste Request von derselben Stadt ist 5 Millisekunden.

**Cache-Control-Header** und **TTL-Einstellungen** in CloudFront bestimmen, wie lange Inhalte am Edge-Standort zwischengespeichert werden. Bilddateien können stunden- oder tagelang zwischengespeichert werden. HTML-Seiten (die sich häufiger ändern) können möglicherweise nur für Minuten oder Sekunden zwischengespeichert werden.

**Dynamischer Inhalt: CloudFront für mehr als Caching**

„Aber was ist mit unseren API-Antworten?“, fragte Leo. „Diese sind dynamisch – sie ändern sich pro Benutzer, pro Anfrage. Sie können keine Bestellhistorie-Seite zwischenspeichern.“

Das stimmt. Aber CloudFront hilft auch bei dynamischem Inhalt.

Selbst wenn Inhalte nicht zwischengespeichert werden können, leitet CloudFront die Anfrage über den Edge-Standort zur Origin über das AWS-Private-Backbone-Netzwerk – das Hochgeschwindigkeits-Faser, das AWS-Infrastruktur global verbindet. Dies ist schneller und zuverlässiger als die Übertragung über das öffentliche Internet, wo der Datenverkehr durch mehrere Carrier geleitet werden kann.

Das Ergebnis: Dynamische Anfragen sind über CloudFront immer noch 20-40 % schneller als die direkte Übertragung zur Origin über das öffentliche Internet. Nicht wegen des Caching, sondern wegen des Netzwerkpfads.

Darüber hinaus bietet CloudFront:

**SSL/TLS-Termination**: CloudFront übernimmt HTTPS am Edge. Die Verbindung zwischen dem Benutzer und CloudFront ist verschlüsselt. CloudFront kann eine Verbindung zur Origin über HTTP intern (reduziert die Origin-Last) oder HTTPS (für End-to-End-Verschlüsselung) herstellen.

**DDoS-Schutz**: CloudFront ist in AWS Shield Standard integriert. Verteilt der Datenverkehr über Hunderte von Edge-Standorten werden Angriffe am Edge absorbiert, anstatt Ihre Origin zu überlasten.

**Geo-Restriction**: Blockieren Sie den Zugriff von bestimmten Ländern. Wenn Nimbus nur für den Betrieb in bestimmten Märkten lizenziert ist, kann CloudFront dies an der Edge erzwingen, ohne dass die Anfrage jemals Ihre Server erreicht.

**CloudFront-Verhaltensweisen: Fein abgestimmte Caching-Regeln**

Eine CloudFront-Distribution kann mehrere **Verhaltensweisen** haben – Routing-Regeln basierend auf URL-Mustern.

Für Nimbus:

- `/images/*` → Caching an der Edge für 7 Tage (Fotos ändern sich nicht oft)
- `/static/*` → Caching an der Edge für 30 Tage (CSS und JavaScript mit versionierten Dateinamen)
- `/api/*` → Nicht caching; direkte Weiterleitung zum Load Balancer
- `/*` → Caching für 5 Minuten (HTML-Seiten)

Dies ermöglicht es CloudFront, intelligent zu sein: Aggressiv caching, was stabil ist, Durchleiten, was dynamisch ist.

**Origin Access Control: Sicherung von S3 mit CloudFront**

Wenn Ihr S3-Bucket privaten Inhalt enthält, der nur über CloudFront bereitgestellt werden soll (nicht direkt), können Sie **Origin Access Control (OAC)** verwenden, um S3 zu erzwingen, dass Anfragen, die nicht von CloudFront stammen, abgelehnt werden.

So funktioniert es:

- `d1234abcd.cloudfront.net/image.jpg` Wird bedient (CloudFront hat Berechtigungen)
- `nimbus-assets.s3.amazonaws.com/image.jpg` Wird blockiert (direkter S3-Zugriff verweigert)

Ihr Inhalt ist nur über Ihre Distribution erreichbar, mit Ihren Cache-Regeln und Sicherheitsrichtlinien angewendet.

## Stärken und Grenzen

**Warum CloudFront leistungsstark ist**:

- Edge-Standorte in über 90 Städten – die meisten Benutzer erhalten Inhalte in weniger als 20 ms Entfernung
- Statischer Inhalt wird in Millisekunden nach dem ersten Cache bereitgestellt
- Reduziert die Last des Ursprungs deutlich (Wiederholungsverkehr trifft nie Ihre Server)
- Integriert mit AWS Shield, WAF und Certificate Manager
- Keine Kapazitätsplanung erforderlich – CloudFront skaliert automatisch

**Wo es kompliziert wird**:

- Gecachedte Inhalte können veraltet sein – das Invalidieren des Caches verursacht Kosten (0,005 USD pro 1.000 Pfade)
- Cache-Control-Header müssen am Ursprung korrekt gesetzt werden – Fehler verursachen veralteten Inhalt
- Dynamischer Inhalt profitiert von der Routing-Optimierung, aber nicht vom Caching
- Die Fehlersuche im Cache-Verhalten (was gecached wird, wo und für wie lange) erfordert das Verständnis mehrerer Schichten: Ursprung-Header, CloudFront TTL-Einstellungen, Verhaltensregeln
- Datenübertragung nach außen über CloudFront verursacht Kosten, obwohl sie geringer sind als die Standarddatenübertragung

## Zusammenfassung

- Ein **CDN** speichert Kopien Ihres Inhalts an Edge-Standorten in der Nähe Ihrer Benutzer – wodurch Latenz und Last des Ursprungs reduziert werden.
- **CloudFront** ist die CDN von AWS mit über 500 Edge-Standorten weltweit.
- Cache-Fehlschläge holen von dem **Ursprung** (S3, ALB, EC2) ab. Cache-Treffer werden an der Edge bereitgestellt – Millisekunden, nicht Hunderte von Millisekunden.
- **Verhaltensweisen** ermöglichen es Ihnen, unterschiedliche Caching-Regeln für unterschiedliche URL-Muster festzulegen.
- Dynamischer Inhalt wird nicht gecached, CloudFront verbessert aber dennoch die Leistung über das private Backbone-Netzwerk von AWS.
- **Origin Access Control** schränkt direkten S3-Zugriff ein – Inhalt wird nur über CloudFront bereitgestellt.
- Integriert mit Shield (DDoS), WAF (Anwendungsbrandwand) und ACM (SSL-Zertifikate).

## Prüftipps

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.4)*

- **CloudFront + S3**: Klassisches Exam-Muster zum Bereitstellen statischer Websites global. S3-Bucket als Ursprung, CloudFront als CDN, Origin Access Control zur Verhinderung des direkten S3-Zugriffs.
- **Edge-Standorte vs. Regionen vs. AZs**: Edge-Standorte sind zahlreicher und existieren nur für Caching/CDN-Zwecke. Sie sind nicht die gleichen wie AZs (die Ihre Compute-Ressourcen ausführen).
- **Cache-Invalidierung**: Erstellt eine `/images/*`-Invalidierung, um CloudFront zu zwingen, frische Inhalte abzurufen. Kostenpflichtig – die Prüfung kann nach der kostengünstigsten Alternative fragen: versionierte URLs (`image-v2.jpg` anstelle von `image.jpg`), die natürlich den Cache umgehen.
- **TTL-Steuerung**: `Cache-Control: max-age=3600` am Ursprung setzt eine 1-Stunden-TTL für den Cache. CloudFront respektiert diese Header.
- **CloudFront Functions vs Lambda@Edge**: CloudFront Functions laufen an der Edge für leichte Request/Response-Manipulation (Sub-Millisekunden). Lambda@Edge läuft Ihren Lambda-Code an Edge-Standorten für eine schwerere Verarbeitung. Die Prüfung unterscheidet sie anhand der Komplexität des Anwendungsfalls.
- **Signierte URLs und Signierte Cookies**: Steuern, wer über CloudFront auf Inhalte zugreifen kann. Signierte URLs gewähren Zugriff auf bestimmte Dateien; signierte Cookies gewähren Zugriff auf mehrere Dateien. Die Prüfung verwendet diese für "Abonnenten-Inhalte".

## Übungen

**Übung 1 – Erinnerung**

Erklären Sie den Unterschied zwischen einem CloudFront-Cache-Treffer und einem Cache-Fehler. Was geschieht in jedem Fall?

*(Hinweis: Denken Sie darüber nach, wo der Inhalt herkommt und wie sich die Antwortzeit in den beiden Fällen unterscheidet.)*

**Übung 2 – Exam-Übung**

*Szenario*: Ein Softwareunternehmen verteilt große Installationsdateien (~2 GB) von einem S3-Bucket an Kunden weltweit. Download-Geschwindigkeiten sind für Kunden in Asien langsam. Das Team möchte die Leistung verbessern, ohne den S3-Bucket in mehrere Regionen zu replizieren. Außerdem muss das Team sicherstellen, dass nur zahlende Kunden auf die Installationsdateien zugreifen können.

Welche Lösung erfüllt diese Anforderungen BEST?

A) Aktivieren Sie S3 Transfer Acceleration für den Bucket und generieren Sie vorab signierte URLs für zahlende Kunden.
B) Verwenden Sie CloudFront mit dem S3 Bucket als Ursprung, aktivieren Sie Origin Access Control und verwenden Sie CloudFront Signed URLs für zahlende Kunden.
C) Erstellen Sie einen S3 Bucket in jeder AWS Region und verwenden Sie Route 53 Geolocation Routing, um Kunden zum nächstgelegenen Bucket zu leiten.
D) Verwenden Sie einen Application Load Balancer in jeder Region mit EC2 Instanzen, die die Installer-Dateien bereitstellen.

**Hinweis 1**: Die Anforderung ist es, die globale Leistung zu verbessern *ohne* das Bucket zu replizieren. Welche Option benötigt keine mehreren Buckets?

**Hinweis 2**: Welcher Dienst kontrolliert speziell, wer Zugriff auf Inhalte hat, die über CloudFront bereitgestellt werden?

**Hinweis 3**: S3 Transfer Acceleration ist für lange Distanz-Uploads *in* S3 optimiert. Für die Bereitstellung von Inhalten *aus* S3 zu globalen Endbenutzern ist CloudFront das richtige Werkzeug.

**Antwort**: B

**Erläuterung**: CloudFront speichert die Installer-Dateien an Randstandorten global nach dem ersten Download. Nachfolgende Downloads aus derselben Region erfolgen von einem Randstandort – viel schneller als ein Überqueren des Pazifiks von us-east-1. Origin Access Control stellt sicher, dass der S3 Bucket nur über CloudFront zugänglich ist. Signed URLs beschränken den Zugriff auf zahlende Kunden.

**Warum nicht A?** S3 Transfer Acceleration ist für lange Distanz-Uploads *in* S3 optimiert – nicht für die Verteilung von Inhalten *aus* S3 an ein globales Publikum. Für diese Aufgabe ist CloudFront das richtige Werkzeug. Signed URLs steuern den Zugriff, verbessern aber nicht die globale Leistung.

**Warum nicht C?** Das Erstellen eines S3 Buckets pro Region funktioniert zwar für die Leistung, widerspricht aber der Anforderung, die Replikation zu vermeiden. Es erfordert auch eine Daten-Synchronisationsstrategie über Buckets hinweg.

**Warum nicht D?** EC2 Instanzen hinter einem Load Balancer in jeder Region ist deutlich teurer als CloudFront und erfordert die Verwaltung von Servern in mehreren Regionen.

*SAA-C03 Domain: Design High-Performing Architectures — Task 3.4*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nimbus möchte Videoinhalte – kurze Koch-Tutorial-Videos von Restaurantpartnern – hinzufügen. Die Videos können 50-500 MB betragen. Sie gehen davon aus, dass dasselbe Video von Tausenden von Benutzern in derselben Stadt innerhalb von Stunden nach der Veröffentlichung angesehen wird.

Gestalten Sie die Speicher- und Bereitstellung-Architektur. Würden Sie S3 und CloudFront verwenden? Wie würden Sie die erste Anfrage (Cold Start) behandeln, um die Verzögerung vor dem Cache zu minimieren? Welche Cache TTL würden Sie für ein Video festlegen, das nach der Veröffentlichung nicht mehr geändert wird?

*(Es gibt keine eindeutige richtige Antwort. Das Ziel ist es, CDN-Designentscheidungen zu üben.)*

## Post-Credits Szene

Priya beobachtete die CloudFront-Metriken nach der Bereitstellung.

Cache-Hit-Rate: 83%.

"Was bedeutet das?", fragte Tom.

"Es bedeutet, dass 83 % unserer Benutzer Inhalte von einem Randstandort in der Nähe ihres Standorts erhalten, nicht von us-east-1."

"Und die anderen 17 %?"

"Erste Anfragen. Inhalte, die noch nicht an diesem Randstandort gecached wurden."

Tom starrte auf die Metriken. "Also bedienen wir täglich fast eine Million Anfragen über CloudFront-Randknoten. Und nur 170.000 davon treffen tatsächlich unsere Server."

"Ja."

"Wenn wir keine CloudFront hätten, würden unsere Server eine Million Anfragen pro Tag bearbeiten."

"Mit 140-160 Millisekunden pro globalem Benutzer."

Tom ließ sich zurück. Er hatte einen Blick, den Maya kannte – den Blick, der den Realzeit-Kostenrechnung entspricht.

"Das rentiert sich", sagte er.

Maya war bereits auf ihrem Laptop. "Zwei neue Ingenieure stoßen nächste Woche zu uns – Soo-Jin vom Plattform-Team bei ihrem letzten Unternehmen und Rafael – er hat sich auf Sicherheit spezialisiert. Ich möchte, dass sie vor ihrem ersten Tag mit IAM vertraut gemacht werden."

"IAM Advanced?", fragte Leo.

"Rollen, Richtlinien, Cross-Account-Zugriff. Das echte Zeug."

Im nächsten Kapitel: die feingranularen Berechtigungen, die es einem Teil des Systems ermöglichen, mit einem anderen – sicher zu kommunizieren.
