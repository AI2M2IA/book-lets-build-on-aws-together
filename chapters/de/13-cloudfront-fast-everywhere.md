# Kapitel 13: Überall schnell

Ein Foto, das von einem Server in Oregon zu einem Telefon in Boston reist, überquert ungefähr 4.100 Kilometer Glasfaserkabel. Bei zwei Dritteln der Lichtgeschwindigkeit sind das etwa 25 Millisekunden reiner Physik – unvermeidlich, nicht verhandelbar, in die Gesetze des Universums eingebrannt.

Dann kommt die Hin- und Rückreise hinzu. Dann kommt die Verarbeitungszeit hinzu. Der Browser hat noch nicht angefangen zu rendern, und 80 Millisekunden sind bereits weg.

---

*`eatnimbus.com` war live und der Domainname war echt. Benutzer konnten die App finden. Aber sie zu finden war nicht dasselbe wie sie zu genießen. Tom hatte Latenzmessungen aus verschiedenen Städten durchgeführt, und die Zahlen von der Ostküste und aus Südamerika waren nicht gut. Das Domainnamen-Problem war gelöst. Das Physikproblem nicht.*

---

`eatnimbus.com` war live. Leo hatte die Latenzmetriken von East-Coast-Benutzern geprüft: 80–100 Millisekunden pro Anfrage. Das mag klein klingen, aber es summiert sich.

Das Menü laden: 90 ms. Die Restaurantliste laden: 80 ms. Die Fotos des Restaurants laden: 200 ms (Bilder sind groß). Gesamtzeit, bevor ein Benutzer eine Bestellung aufgeben konnte: über eine halbe Sekunde bei guter Verbindung.

„Die Physik ist das Problem“, sagte Leo. „Die Server sind in Oregon. Das Wachstum ist an der Ostküste – und in São Paulo.“

„Dann verschieb die Server an die Ostküste“, sagte Tom.

„Das kostet Geld.“

„Wie viel kostet das pro Monat?“, fragte Tom.

„Ein vollständiges Duplikat unserer Infrastruktur in us-east-1 betreiben? Wahrscheinlich das Dreifache unserer aktuellen Kosten. Und es schafft ein ganz neues Problem: die West-Coast-Datenbank und die East-Coast-Datenbank synchron zu halten.“

Priya blickte von ihrem Laptop auf. „Oder wir verschieben die Server nicht. Wir verschieben den *Inhalt*.“

Maya blickte auf. „Was ist der Unterschied? Wenn der Inhalt auf einem Server ist und der Server in Oregon ist, dann ist der Inhalt in Oregon.“

„Das meiste, was eine Seite ausliefert, ist statisch“, sagte Priya. „Bilder, Stylesheets, JavaScript-Dateien, Schriftarten. Die sind für jeden Benutzer gleich. Sie kommen nicht aus der Datenbank. Sie liegen in S3. Und S3-Objekte können von überall ausgeliefert werden.“

„Wir kopieren sie also auf Server näher an den Benutzern?“

„Wir lassen einen Dienst das für uns verwalten. Eine Source of Truth. Kopien überall dort, wo sie gebraucht werden.“

Tom hatte bereits die Preisseite geöffnet. Er rechnete, bevor Priya die Erklärung beendet hatte.

**Die Analogie des vorbestückten Lagerhauses**

Stellen Sie sich Amazon als den Einzelhändler vor, nicht als das Cloud-Unternehmen. Sie haben ein riesiges Lagerhaus an einem Standort mit jedem Produkt. Wenn sie jede Bestellung aus diesem einen Lagerhaus verschicken würden, würden Kunden in fernen Städten Tage warten.

Stattdessen hat Amazon Fulfillment-Center in der Nähe großer Bevölkerungszentren. Wenn ein Produkt beliebt ist, bestücken sie diese lokalen Lagerhäuser vor. Wenn ein Kunde in Seattle ein Buch bestellt, wird es aus dem lokalen Fulfillment-Center verschickt – nicht von der anderen Seite des Landes.

Das ist ein **Content Delivery Network (CDN)**: ein Netzwerk geografisch verteilter Server, die Kopien Ihrer Inhalte in der Nähe Ihrer Benutzer cachen.

Wenn ein Benutzer in Boston Ihre Startseite anfordert, liefert das CDN sie von einem Server in Boston aus. Nicht aus Oregon. Die Anfrage überquert nie das Land.

**Lernen Sie CloudFront kennen**

Amazon CloudFront ist das CDN von AWS. Es arbeitet über ein globales Netzwerk von **Edge Locations** – Caching-Servern, die in Städten auf der ganzen Welt positioniert sind. Zum Zeitpunkt der Niederschrift gibt es über 750 Points of Presence in mehr als 100 Städten.

Wenn Sie CloudFront konfigurieren, geben Sie einen **Origin** an: die Quelle Ihres tatsächlichen Inhalts. Ihr Origin könnte sein:

- Ein S3-Bucket (statische Dateien: Bilder, CSS, JavaScript, PDFs)
- Ein Application Load Balancer (dynamischer Inhalt aus Ihrer Anwendung)
- Eine EC2-Instanz
- Ein HTTP-Server irgendwo im Internet

CloudFront sitzt vor Ihrem Origin. Anfragen kommen an der nächstgelegenen Edge Location an. Wenn die Edge den Inhalt gecacht hat, gibt sie ihn sofort zurück. Wenn nicht (ein *Cache Miss*), holt sie ihn von Ihrem Origin, cacht ihn und gibt ihn zurück.

**Wie CloudFront-Caching funktioniert**

Die erste Anfrage für ein beliebiges Inhaltsstück ist immer ein Cache Miss – sie geht zum Origin. Jede nachfolgende Anfrage trifft den Cache an der Edge Location.

Für Nimbus sind die Menüfotos perfekte CloudFront-Kandidaten. Restaurantfotos ändern sich selten (vielleicht, wenn das Restaurant sein Profil aktualisiert). Mit CloudFront:

1. Benutzer in Boston fordert `images.eatnimbus.com/restaurant-047/photo.jpg` an
2. CloudFront prüft die Edge Location in Boston – noch nicht gecacht (Cache Miss)
3. CloudFront holt aus S3 in us-west-2 (~80 ms)
4. CloudFront speichert das Foto in der Edge Location Boston
5. Nächster Benutzer in Boston fordert dasselbe Foto an
6. CloudFront liefert aus dem lokalen Edge-Cache (~5 ms)

Dieselbe 80-ms-Strafe für die erste Anfrage. Aber die tausendste Anfrage aus derselben Stadt ist 5 Millisekunden.

**Cache-Control-Header** und **TTL-Einstellungen** in CloudFront bestimmen, wie lange Inhalt an der Edge gecacht bleibt. Bilddateien können stunden- oder tagelang gecacht werden. HTML-Seiten (die sich häufiger ändern) könnten minuten- oder sekundenlang gecacht werden.

Sie fragen sich vielleicht: Warum nicht einfach die gesamte Anwendung in mehreren Regionen hosten, statt ein CDN zu verwenden? Wenn die Daten in Oregon sind, warum nicht eine vollständige Kopie in New York, Tokio und São Paulo ablegen? Sie könnten. Aber das bedeutet, mehrere Datenbanken synchron zu halten, Deployments über Regionen gleichzeitig zu verwalten, Split-Brain-Szenarien zu behandeln, in denen die Regionen sich uneinig sind. Ein CDN ist eine viel einfachere Antwort für statischen und halbstatischen Inhalt: ein Origin, viele gecachte Kopien an der Edge. Sie fügen Multi-Region-Komplexität nur hinzu, wenn Sie wirklich Compute- oder Datenbankoperationen in der Nähe des Benutzers brauchen – für den meisten Inhalt reicht Edge-Caching.

„Moment – aber *warum* würden wir das so machen?“, fragte Maya. „Warum den Cache an der Edge platzieren, statt einfach einen größeren ElastiCache-Cluster in Oregon hinzuzufügen?“

„Weil die Physik immer noch das Problem ist“, sagte Priya. „Selbst wenn Oregon in einer Millisekunde antwortet, muss diese Antwort immer noch nach Boston reisen. Die Round-Trip-Zeit ist mindestens 70 Millisekunden – die Lichtgeschwindigkeit kümmert sich nicht darum, wie schnell unsere Server sind. Edge-Caching bringt die Antwort näher an die Frage.“

**Dynamischer Inhalt: CloudFront für mehr als Caching**

„Aber was ist mit unseren API-Antworten?“, fragte Leo. „Die sind dynamisch – sie ändern sich pro Benutzer, pro Anfrage. Man kann keine Bestellhistorie-Seite cachen.“

Stimmt. Aber CloudFront hilft trotzdem bei dynamischem Inhalt.

Selbst wenn Inhalt nicht gecacht werden kann, routet CloudFront die Anfrage von der Edge Location zum Origin über AWS' privates Backbone-Netzwerk – die Hochgeschwindigkeits-Glasfaser, die AWS-Infrastruktur global verbindet. Das ist schneller und zuverlässiger als das Routing über das öffentliche Internet, wo Traffic durch mehrere Carrier hüpfen kann.

Das Ergebnis: Dynamische Anfragen sind über CloudFront immer noch 20–40 % schneller, als direkt über das öffentliche Internet zum Origin zu gehen. Nicht wegen des Cachings, sondern wegen des Netzwerkpfads.

„Das ergibt keinen Sinn“, sagte Maya. „Wenn die API-Antwort immer noch von Oregon zur Edge und dann nach Boston reisen muss, wie ist das schneller, als direkt von Oregon nach Boston zu gehen?“

„Zwei Gründe“, sagte Priya. „Erstens ist AWS' privates Backbone schneller und zuverlässiger als das öffentliche Internet. Traffic im öffentlichen Internet wird durch mehrere Carrier geroutet, von denen jeder seine eigene Latenz und Variabilität hinzufügt. Das Backbone ist direkte, latenzarme Glasfaser. Zweitens findet die SSL-Terminierung an der Edge statt. Der Benutzer baut eine TLS-Verbindung zur nächstgelegenen CloudFront-Edge-Location auf – der Handshake ist schnell. CloudFront hält dann eine persistente, vorab etablierte Verbindung zum Origin. Zwei Kurzstreckenverbindungen statt einer Langstreckenverbindung.“

„Selbst für nicht gecachten Inhalt schneidet CloudFront also Zeit vom Verbindungs-Overhead ab“, sagte Leo.

„Normalerweise zehn bis vierzig Prozent. Nicht so dramatisch wie Caching. Aber real.“

Zusätzlich bietet CloudFront:

**SSL/TLS-Terminierung**: CloudFront handhabt HTTPS an der Edge. Die Verbindung zwischen dem Benutzer und CloudFront ist verschlüsselt. CloudFront kann sich intern über HTTP mit Ihrem Origin verbinden (was die Origin-Last reduziert) oder über HTTPS (für Ende-zu-Ende-Verschlüsselung).

**DDoS-Schutz**: CloudFront ist mit AWS Shield Standard integriert. Über Hunderte von Edge Locations verteilter Traffic bedeutet, dass Angriffe an der Edge absorbiert werden, statt Ihren Origin zu hämmern.

**Geo-Restriction**: Den Zugriff aus bestimmten Ländern blockieren. Wenn Nimbus nur in bestimmten Märkten lizenziert ist, kann CloudFront das an der Edge durchsetzen, ohne dass die Anfrage jemals Ihre Server erreicht.

**Und was ist, wenn jemand versucht, durch das CDN einzubrechen?**, fragte Priya. „Cache Poisoning – was, wenn es jemandem gelingt, schlechten Inhalt in den Edge-Cache einzuschleusen?“

„CloudFront hat Cache-Key-Kontrollen“, sagte Leo. „Du definierst genau, welche Attribute bestimmen, ob zwei Anfragen dieselbe gecachte Antwort bekommen. Header, Query-Strings, Cookies. Ein Angreifer kann keine andere gecachte Antwort einschleusen, ohne den exakten Cache-Key zu treffen.“

„Und Origin Access Control bedeutet, dass der S3-Bucket nichts ausliefert, das nicht durch CloudFront kommt“, sagte Priya. „Eine Angriffsfläche statt zwei.“

**CloudFront-Behaviors: Feingranulare Caching-Regeln**

Eine CloudFront-Distribution kann mehrere **Behaviors** haben – Routing-Regeln basierend auf URL-Mustern.

Für Nimbus:

- `/images/*` → an der Edge 7 Tage cachen (Fotos ändern sich nicht oft)
- `/static/*` → an der Edge 30 Tage cachen (CSS und JavaScript mit versionierten Dateinamen)
- `/api/*` → nicht cachen; direkt an den Load Balancer weiterleiten
- `/*` → 5 Minuten cachen (HTML-Seiten)

Das lässt CloudFront intelligent sein: aggressiv cachen, was stabil ist, durchreichen, was dynamisch ist.

Behaviors werden vom spezifischsten zum am wenigsten spezifischen abgeglichen. `/images/hero.jpg` passt auf `/images/*`, bevor es auf `/*` passt. Das Catch-all `/*` ganz unten ist der Standard – es gilt für alles, das nicht auf ein spezifischeres Muster passt.

„Was, wenn wir unterschiedliches Caching für authentifizierte vs. nicht authentifizierte Benutzer wollen?“, fragte Priya. „Dieselbe URL könnte je nachdem, ob ein Benutzer eingeloggt ist, anderen Inhalt zurückgeben.“

„Dann nimmst du das Session-Cookie in den Cache-Key auf“, sagte Leo. „Aber das bedeutet, dass jeder eingeloggte Benutzer seinen eigenen Cache-Eintrag bekommt. Deine Hit-Rate bricht für authentifizierten Inhalt zusammen.“

„Deshalb trennt man authentifizierten Inhalt von öffentlichem Inhalt auf URL-Ebene“, sagte Priya. „Alles, was Authentifizierung erfordert, geht zu `/app/*` und wird nicht gecacht. Öffentlicher Inhalt geht zu `/browse/*` und wird aggressiv gecacht. Eine klare Grenze.“

Die Lektion: CloudFront funktioniert am besten, wenn Ihre URL-Struktur die Caching-Absicht widerspiegelt. URLs, die auf vollständig öffentliche, statische Daten zeigen, sollten anders aussehen als URLs, die personalisierte, dynamische Daten zurückgeben. Wenn sie für CloudFront gleich aussehen, ist entweder der Cache kaputt oder es wird der falsche Inhalt ausgeliefert.

Leo strukturierte das Nimbus-URL-Schema an einem Wochenende um. Stöber-Endpunkte zogen nach `/browse/`. API-Endpunkte zogen nach `/api/`. Die authentifizierte App-UI zog nach `/app/`. Drei Behaviors, drei klare Caching-Policies, null Mehrdeutigkeit.

„Es ist ein bisschen ein Refactor“, sagte er.

„Es ist die richtige Struktur“, sagte Priya. „Du hättest sie irgendwann gebraucht.“

**Origin Access Control: S3 mit CloudFront absichern**

Wenn Ihr S3-Bucket privaten Inhalt enthält, der nur über CloudFront ausgeliefert werden soll (nicht direkt), können Sie **Origin Access Control (OAC)** verwenden, um sicherzustellen, dass S3 Anfragen ablehnt, die nicht von CloudFront kommen.

So:

- `d1234abcd.cloudfront.net/image.jpg` → Ausgeliefert (CloudFront hat die Berechtigung)
- `nimbus-assets.s3.amazonaws.com/image.jpg` → Blockiert (direkter S3-Zugriff verweigert)

Ihr Inhalt ist nur über Ihre Distribution erreichbar, mit Ihren Cache-Regeln und Sicherheitseinstellungen.

---

**Der Vorfall mit dem veralteten Foto**

Restaurant 112 – der kolumbianische Laden in der Eastside – schrieb an einem Donnerstagmorgen eine E-Mail an den Support. Ein Kunde hatte sich beschwert, dass das Hero-Foto des Restaurants immer noch die alte Ladenfront zeigte, obwohl der Inhaber vor zwei Tagen ein neues hochgeladen hatte.

Leo öffnete die CloudFront-Distributionseinstellungen.

Das Behavior für `/images/*` hatte eine TTL von sieben Tagen. Das Restaurantpartner-Portal hatte vor zwei Tagen ein neues Foto hochgeladen und die Datei am selben S3-Schlüsselpfad ersetzt: `restaurant-112/hero.jpg`. Die alte Datei war aus S3 verschwunden. Aber CloudFront lieferte sie immer noch aus dem Cache an jeder Edge Location aus, die sie in den letzten sieben Tagen geholt hatte.

„Wir haben den Inhalt am Origin geändert“, sagte Leo. „Aber CloudFront weiß das nicht. Es hat eine gecachte Kopie und wird sieben Tage lang nicht prüfen.“

„Ich habe es schon deployt – oh.“ Er hatte angenommen, dass das Ersetzen der S3-Datei den CloudFront-Cache automatisch aktualisieren würde. Tut es nicht. CloudFront hat keinen Mechanismus, um zu erkennen, dass sich der Inhalt an einem S3-Schlüssel geändert hat – es liefert einfach aus, was es gecacht hat, bis die TTL abläuft.

Zwei Optionen:

**Option eins: Invalidierung.** Senden Sie CloudFront eine Invalidierungsanfrage für `/images/restaurant-112/hero.jpg`. CloudFront markiert diesen Pfad an allen Edge Locations als veraltet. Die nächste Anfrage für diesen Pfad holt frischen Inhalt aus S3. Kosten: Die ersten 1.000 Invalidierungspfade pro Monat sind kostenlos; darüber hinaus 0,005 $ *pro Pfad*. Für eine Datei kostenlos. Für das Invalidieren Tausender Dateien während eines Massen-Updates summieren sich die Kosten.

**Option zwei: Versionierte Dateinamen.** Statt `hero.jpg` die Datei `hero-v2.jpg` nennen. Die Referenz in der Datenbank aktualisieren. CloudFront hat keinen gecachten Eintrag für `hero-v2.jpg` – die erste Anfrage holt sie aus S3, und Benutzer sehen sie sofort. Das alte `hero.jpg` bleibt gecacht, wird aber nirgendwo mehr referenziert. Es läuft nach sieben Tagen natürlich ab.

„Für von Benutzern hochgeladenen Inhalt“, sagte Priya, „sind versionierte Namen das richtige Muster. Füge dem Dateinamen einen Hash oder Zeitstempel hinzu. Jeder neue Upload ist ein neuer Cache-Eintrag. Keine Invalidierungskosten, kein veralteter Inhalt.“

Leo aktualisierte das Partner-Portal. Neue Uploads würden nun als `hero-{timestamp}.jpg` gespeichert. Der Datenbankeintrag wurde mit dem neuen Pfad aktualisiert. Der alte gecachte Pfad war irrelevant.

„Was ist mit dem Deployment-Fall?“, fragte Maya. „Wenn wir eine neue Version der App pushen und sich das JavaScript ändert?“

„Dasselbe Prinzip“, sagte Priya. „Build-Tools wie Webpack geben gehashte Dateinamen aus: `app.a3b9c2d4.js`. Deploye eine neue Version, und der Hash ändert sich: `app.f7e1b3c5.js`. CloudFront liefert beide aus dem Cache – alte Benutzer bekommen die alte Datei, neue Benutzer die neue Datei. Keine Invalidierung, kein Koordinationsproblem.“

„Die HTML-Seite referenziert den aktuellen Hash“, sagte Leo. „Also bekommen neue Benutzer das neue HTML mit dem neuen JS-Hash, und das CDN liefert die richtige Datei.“

„Standardpraxis“, bestätigte Priya.

---

**Latenz mit echten Zahlen**

Tom hatte Latenzmessungen aus drei Städten durchgeführt.

| Standort | Ohne CloudFront | Mit CloudFront | Verbesserung |
|---|---|---|---|
| Seattle | 15 ms | 12 ms | 20 % |
| New York | 80 ms | 10 ms | 88 % |
| São Paulo | 290 ms | 35 ms | 88 % |
| Tokio | 260 ms | 28 ms | 89 % |

„Die Verbesserung ist am größten, wo das Physikproblem am schlimmsten ist“, bemerkte Tom. „São Paulo nach Oregon sind mehr als zweihundert Millisekunden. Das ist mehr als eine Viertelsekunde, nur um das Gespräch zu beginnen.“

„Und der Inhalt erreicht São Paulo das zweite Mal nie“, sagte Leo. „Der erste Benutzer in São Paulo holt aus Oregon und cacht es lokal. Jeder Benutzer danach bekommt fünfunddreißig Millisekunden.“

„Der erste Benutzer in São Paulo trägt die Kosten“, sagte Tom. „Alle anderen profitieren.“

„So funktionieren CDNs“, sagte Priya. „Die erste Anfrage befüllt den Cache. Jeder Cache Hit danach ist nahezu kostenlos.“

Die Implikation für globale Produkte ist erheblich. Ohne CloudFront wartet ein Benutzer in Tokio 260 Millisekunden auf Ihr Hero-Bild, weil der Physik wegen – Glasfaserkabel und die Lichtgeschwindigkeit. Mit CloudFront legen Sie eine Kopie dieses Bildes in Tokio ab, und das Physikproblem verschwindet im Wesentlichen.

---

**Mehrere Origins: ALB und S3 zusammen**

„Wir haben unsere Bilder auf S3 und unsere API auf dem Load Balancer“, sagte Maya. „Brauchen wir zwei CloudFront-Distributionen?“

„Nein“, sagte Leo. „Eine Distribution, mehrere Origins.“

Eine einzelne CloudFront-Distribution kann verschiedene URL-Muster zu verschiedenen Origins routen. Das ist das Multi-Origin-Muster:

```
eatnimbus.com/*         → Origin: ALB in us-west-2 (dynamischer Inhalt)
eatnimbus.com/images/*  → Origin: S3-Bucket (statische Bilder)
eatnimbus.com/static/*  → Origin: S3-Bucket (CSS, JS, Schriftarten)
```

CloudFront evaluiert Behaviors in der Reihenfolge der Spezifität. Eine Anfrage an `/images/hero.jpg` passt auf das `/images/*`-Behavior und geht zu S3. Eine Anfrage an `/api/orders` passt auf das `/*`-Catch-all und geht zum ALB.

Der Vorteil: eine Domain, ein SSL-Zertifikat, eine CloudFront-Distribution, mehrere Backends. Benutzer sehen eine einheitliche Domain. Das Routing ist für sie unsichtbar.

Ein betrieblicher Detail, das auch ein garantierter Prüfungsfakt ist: Dieses SSL-Zertifikat kommt vom AWS Certificate Manager (ACM), und **ein von CloudFront verwendetes Zertifikat muss in `us-east-1` angefordert oder importiert werden** – unabhängig davon, wo Ihre Origins leben. CloudFront ist ein globaler Dienst, dessen Control Plane in us-east-1 lebt; ein Zertifikat, das in us-west-2 sitzt, erscheint einfach nicht im Dropdown der Distribution. (Für regionale Dienste wie einen ALB lebt das Zertifikat in der eigenen Region des ALB.)

„Und der ALB ist nicht nach außen gerichtet?“, fragte Priya.

„Nur CloudFront spricht mit dem ALB“, sagte Leo. „Wir beschränken die Security Group des ALB auf die verwaltete Prefix List von CloudFront. Direkte Verbindungen zum ALB aus dem Internet werden blockiert.“

„Der einzige Weg, die Anwendung zu erreichen, ist also durch CloudFront.“

„Was bedeutet, dass WAF-Regeln, SSL-Terminierung und DDoS-Schutz auf allen Traffic angewendet werden, bevor er uns erreicht.“

---

**CloudFront Functions vs. Lambda@Edge**

„Haben wir darüber nachgedacht, was wir tun würden, wenn wir eine URL an der Edge umschreiben müssten?“, fragte Priya. „Oder jeder Antwort einen Sicherheitsheader hinzufügen müssten?“

„Können wir das nicht in der Anwendung machen?“, fragte Leo.

„Können wir. Aber wenn es an der Edge passiert – bevor CloudFront aus dem Cache ausliefert – sparen wir uns eine Hin- und Rückreise zum Origin.“

CloudFront unterstützt zwei Mechanismen zum Ausführen von Code an der Edge:

**CloudFront Functions** sind leichtgewichtige JavaScript-Funktionen, die an jeder Edge Location laufen. Sie führen in Sub-Millisekunden-Zeit aus, bewältigen Millionen von Anfragen pro Sekunde und sind für einfache Transformationen konzipiert: URL-Umschreibungen, Header-Manipulation, Query-String-Normalisierung, einfache Redirects. Sie können auf Viewer Requests und Viewer Responses laufen (vor und nach dem Cache, aus Sicht des Benutzers). Sie können keine Netzwerkaufrufe machen. Kosten: 0,10 $ pro Million Aufrufe.

**Lambda@Edge** führt echte Lambda-Funktionen an CloudFronts regionalen Edge Locations aus (nicht jedem POP, sondern Dutzenden großen weltweit). Lambda@Edge kann Netzwerkaufrufe machen, auf Datenbanken zugreifen, dynamische Antworten generieren, komplexe Authentifizierungslogik ausführen. Es läuft auf Viewer Requests, Origin Requests, Origin Responses und Viewer Responses – und gibt Ihnen vier Interventionspunkte im Anfragelebenszyklus. Kosten: höher als CloudFront Functions, abgerechnet pro Anfrage und Dauer.

Das mentale Modell:

| Anwendungsfall | Werkzeug |
|---|---|
| `/old-path` zu `/new-path` umschreiben | CloudFront Functions |
| `Strict-Transport-Security`-Header hinzufügen | CloudFront Functions |
| Query-Strings vor dem Cache-Lookup normalisieren | CloudFront Functions |
| A/B-Test: ein Test-Cookie beim Viewer Request zuweisen | CloudFront Functions |
| A/B-Test: 10 % der Benutzer zu einem anderen Origin routen | Lambda@Edge (Origin Request — CloudFront Functions können den Origin nicht ändern) |
| Ein JWT-Token authentifizieren (erfordert Krypto-Bibliothek) | Lambda@Edge |
| Personalisierten Inhalt aus einer Datenbank an der Edge holen | Lambda@Edge |
| Ein Bild-Thumbnail bei Bedarf an der Edge generieren | Lambda@Edge |

Für Nimbus: Sie verwendeten eine CloudFront Function, um jeder Antwort Sicherheitsheader hinzuzufügen – `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`. Zwei Dutzend Zeilen JavaScript. Sub-Millisekunden-Ausführung. Keine Origin-Hin-und-Rückreise nötig.

„Es würde länger dauern, die Header einem Junior-Ingenieur zu erklären“, sagte Leo, „als die Funktion zu schreiben.“

---

**Price Classes: Auswählen, welche Edge Locations**

„Haben wir darüber nachgedacht, was das im großen Maßstab kostet?“, fragte Tom und scrollte durch die CloudFront-Preisseite.

„Wie viel kostet das pro Monat?“ waren hier technisch zwei Fragen. Die erste: Was berechnet CloudFront? Die zweite: Brauchen Sie jede Edge Location der Welt?

Die CloudFront-Datenübertragungspreise variieren nach Region. Traffic, der von Edge Locations in Nordamerika und Europa ausgeliefert wird, ist am günstigsten. Traffic aus Südamerika, dem asiatisch-pazifischen Raum, Australien und Indien ist teurer – weil die Infrastruktur dort mehr kostet.

AWS lässt Sie eine **Price Class** für Ihre Distribution wählen:

- **Price Class All**: Verwendet alle Edge Locations weltweit. Beste Leistung überall. Höchste Datenübertragungskosten für Regionen außerhalb Nordamerikas und Europas.
- **Price Class 200**: Verwendet die meisten Edge Locations (Nordamerika, Europa, Asien, Naher Osten, Afrika). Schließt die teuersten südamerikanischen und einige ozeanische Standorte aus.
- **Price Class 100**: Verwendet nur Edge Locations in Nordamerika und Europa. Am günstigsten. Benutzer in São Paulo, Tokio und Sydney werden immer noch bedient – aber von einer nordamerikanischen oder europäischen Edge, nicht ihrer nächstgelegenen.

„Wenn wir also Price Class 100 wählen“, sagte Tom, „wird ein Benutzer in São Paulo bedient von… Miami? New York?“

„Wo auch immer die nächstgelegene enthaltene Edge ist. Vielleicht 50 Millisekunden statt 230 Millisekunden direkt zu Oregon“, sagte Priya. „Immer noch eine bedeutsame Verbesserung. Nicht so gut wie Price Class All.“

„Und der Kostenunterschied?“

„Datenübertragung aus Südamerika kostet etwa das Doppelte von Nordamerika. Für ein Start-up, das noch Traffic aufbaut, ist Price Class 200 ein vernünftiger Kompromiss – man bekommt Asien und Europa zu niedrigeren Kosten als Price Class All, und die meisten Benutzer sind abgedeckt.“

„Beginnen mit 200“, sagte Tom. „Wenn wir echte Traffic-Daten aus jeder Region haben, entscheiden wir, ob All es wert ist.“

Die richtige Price Class hängt davon ab, wo Ihre Benutzer sind. Wenn Sie keine Benutzer in Südamerika haben, ist das Bezahlen für südamerikanische Edge Locations reine Kosten. Wenn zwanzig Prozent Ihres Umsatzes aus Brasilien kommen, amortisiert sich die Leistungsverbesserung durch Price Class All wahrscheinlich von selbst.

---

**Cache-Key-Design**

„Haben wir darüber nachgedacht, was passiert, wenn zwei verschiedene Benutzer dieselbe URL anfordern, aber anderen Inhalt bekommen?“, fragte Priya.

Leo dachte darüber nach. „Personalisierte Seiten.“

„Oder sprachspezifische Seiten. Oder Mobil- versus Desktop-Versionen. Oder Seiten, die nach Cookie variieren.“

Standardmäßig verwendet CloudFront nur den URL-Pfad als Cache-Key. Zwei Anfragen an `/browse` bekommen dieselbe gecachte Antwort, unabhängig von der Sprachpräferenz, dem Gerätetyp oder dem Session-Cookie des Benutzers.

Wenn Ihre Anwendung unterschiedlichen Inhalt basierend auf Query-Strings, Headern oder Cookies ausliefert – und Sie möchten, dass CloudFront diese Variationen separat cacht – müssen Sie diese Attribute in den **Cache-Key** aufnehmen.

Für Nimbus:

- `/browse?city=miami` sollte separat von `/browse?city=boston` gecacht werden – unterschiedliche Restaurantlisten. Query-Strings in den Cache-Key aufnehmen.
- Mobile Benutzer bekommen vielleicht ein anderes Layout. Einen normalisierten Gerätetyp (abgeleitet aus dem `User-Agent`-Header) in den Cache-Key aufnehmen.
- Der `Accept-Language`-Header bestimmt, in welcher Sprache die Seite gerendert wird. Ihn in den Cache-Key aufnehmen.

Seien Sie jedoch vorsichtig. Jedes Cache-Key-Attribut, das Sie hinzufügen, erzeugt mehr Cache-Variationen. Wenn Sie den gesamten `User-Agent`-String aufnehmen (der nach Browserversion, OS-Version und Patch-Level variiert), brechen Sie das Caching effektiv – jeder Benutzer hat einen leicht anderen User-Agent, also ist jede Anfrage ein Cache Miss.

Die Disziplin: vor dem Cachen normalisieren. „iPhone 15 Pro Safari 17.4.1“ auf „mobile“ reduzieren. Alle akzeptierten Sprachen auf die zwei oder drei reduzieren, die Sie tatsächlich unterstützen. Nur das aufnehmen, was die Antwort wirklich verändert.

„Je spezifischer dein Cache-Key“, sagte Leo, „desto schlechter deine Hit-Rate.“

„Und je generischer“, sagte Priya, „desto wahrscheinlicher lieferst du dem falschen Benutzer den falschen Inhalt.“

„Cache-Key-Design ist also derselbe Kompromiss wie alles andere beim Caching.“

„Ja“, sagte Priya. „Es ist immer derselbe Kompromiss.“

---

## Wenn CloudFront nicht die Antwort ist: Global Accelerator

Die Nimbus-Mobile-App hatte ein Feature, das Tom seit zwei Monaten still beobachtet hatte: Echtzeit-Bestellstatus. Wenn ein Kunde eine Bestellung aufgab, blieb die App über WebSocket verbunden, und der Bildschirm zur Bestellverwaltung der Küche aktualisierte sich in Echtzeit. Kein Aktualisieren-Button. Kein Polling. Eine Live-Verbindung, die Updates in dem Moment pushte, in dem eine Küche einen Artikel als fertig markierte.

„Das verwendet WebSockets“, sagte Tom und sah sich eines Morgens die Latenzmetriken an. „Bei Benutzern in São Paulo dauert der Verbindungsaufbau 340 Millisekunden. Etwas stimmt nicht.“

„CloudFront cacht keine WebSocket-Verbindungen“, sagte Leo. „Es proxyt sie – reicht sie an den Origin durch. Kein Caching-Vorteil.“

„Richtig. Warum ist es also immer noch langsam?“

„Weil der WebSocket immer noch von São Paulo zu unseren Servern in Oregon über das öffentliche Internet reist“, sagte Leo. „CloudFront hilft, weil es den TLS-Handshake an der Edge terminiert und dann AWS' Backbone zum Origin verwendet. Aber für eine persistente WebSocket-Verbindung ist das immer noch eine Langstreckenverbindung.“

„Es gibt einen Dienst genau für dieses Problem“, sagte Priya.

**AWS Global Accelerator** ist kein CDN. Es cacht nichts. Es liefert keinen Inhalt von Edge Locations. Was es tut, ist Ihnen zwei statische Anycast-IP-Adressen geben, die von allen AWS-Edge-Locations gleichzeitig global beworben werden – und dann den Traffic Ihrer Benutzer über AWS' privates Backbone statt über das öffentliche Internet routen.

Wenn ein Kunde in São Paulo die Nimbus-App öffnet, verbindet sich sein Gerät mit der nächstgelegenen AWS-Edge-Location (die in São Paulo selbst sein könnte). Von dieser Edge Location reist der Traffic über AWS' privates, überwachtes, optimiertes Glasfasernetzwerk zu Nimbus' Servern in Oregon – nicht über das öffentliche Internet, wo Pakete durch unvorhersehbare Carrier und Routing-Hops hüpfen.

Das öffentliche Internet ist nicht für Latenz ausgelegt. Es ist für Resilienz ausgelegt – Pakete können jeden verfügbaren Pfad nehmen. AWS' Backbone ist anders ausgelegt: Es ist direkt, mit niedriger Überlastung und unter AWS' betrieblicher Kontrolle.

Tom benchmarkte den Unterschied.

| Route | Latenz (São Paulo nach Oregon) |
|---|---|
| Öffentliches Internet | 340 ms |
| Über Global Accelerator | 180 ms |

Eine Reduktion um 47 %. Nicht durch Caching – durch einen besseren Netzwerkpfad.

„Warum würden wir dann nicht einfach CloudFront für alles verwenden?“, fragte Maya. „CloudFront routet bereits für dynamischen Inhalt über AWS' Backbone.“

„CloudFront ist nur HTTP und HTTPS“, sagte Priya. „WebSockets funktionieren mit CloudFront, aber nur über HTTP-Upgrade. Und einige unserer Protokolle – die IoT-Sensordaten zum Beispiel – sind reines TCP oder UDP. CloudFront handhabt die nicht. Global Accelerator ist protokollagnostisch. TCP, UDP, WebSockets, was auch immer. Es bewegt Pakete, keine HTTP-Anfragen.“

Es gab einen weiteren Unterschied, den Priya in ihrer Sicherheitsdokumentation notierte.

„Global Accelerator gibt uns zwei statische Anycast-IPs“, sagte sie. „Diese IPs ändern sich nie. Das bedeutet, wir können sie zu unserer Sicherheitsrichtlinie hinzufügen, zu Partner-Whitelists hinzufügen, zu Firewall-Regeln hinzufügen. CloudFronts IP-Adressen ändern sich im Lauf der Zeit – sie werden von AWS verwaltet und sind nicht fest.“

„Was ist mit Failover?“, fragte Leo.

„Sofortig“, sagte Priya. „Wenn unsere us-west-2-Anwendung ein Problem hat, kann Global Accelerator den Traffic in unter 30 Sekunden auf ein Backup in us-east-1 verschieben – ohne die IP-Adresse zu ändern, mit der die Benutzer sich verbinden. DNS-Failover über Route 53 dauert je nach TTL 60–300 Sekunden. Global Accelerator ist schneller.“

**CloudFront vs. Global Accelerator — das mentale Modell:**

CloudFront verbessert die Auslieferung durch Caching. Es ist für HTTP/HTTPS gebaut, und der Vorteil ist am größten, wenn Inhalt nahe an den Benutzern gecacht werden kann – statische Dateien, Bilder, JavaScript. Wenn Inhalt nicht gecacht werden kann, hilft CloudFront immer noch durch Backbone-Routing, aber die Verbesserung ist kleiner.

Global Accelerator verbessert die Auslieferung durch Routing. Es bewegt keinen Inhalt. Es cacht nichts. Der Vorteil gilt für jedes Paket – gecacht oder nicht, HTTP oder nicht, statisch oder dynamisch. Die beiden statischen IPs funktionieren global. Failover ist nahezu sofortig. Die Anwendungsfälle, in denen CloudFront nicht ausreicht – Echtzeit-WebSockets, UDP-basierte Protokolle, Nicht-HTTP-Traffic, globale Anwendungen, die feste IPs erfordern – sind die, in denen Global Accelerator das richtige Werkzeug ist.

Tom aktualisierte die Nimbus-Mobile-App, damit sie sich für das Echtzeit-Bestellstatus-Feature mit dem Global-Accelerator-Endpunkt verband. Der WebSocket-Verbindungsaufbau in São Paulo sank von 340 ms auf 180 ms. Die Küchen-Updates fühlten sich immer noch sofortig an – weil sie es jetzt, für Benutzer außerhalb Nordamerikas, tatsächlich waren.

## Stärken und Grenzen

**Warum CloudFront leistungsstark ist**:

- Über 750 Points of Presence in mehr als 100 Städten – die meisten Benutzer bekommen Inhalt aus <20 ms Entfernung
- Statischer Inhalt nach dem ersten Cache in einstelligen Millisekunden ausgeliefert
- Reduziert die Origin-Last erheblich (wiederholter Traffic trifft nie Ihre Server)
- Integriert mit AWS Shield, WAF und Certificate Manager
- Keine Kapazitätsplanung nötig – CloudFront skaliert automatisch
- Multi-Origin-Distributionen routen verschiedene Pfade von einer Domain zu verschiedenen Backends
- CloudFront Functions handhaben leichtgewichtige Edge-Logik bei Sub-Millisekunden-Latenz

**Wo es kompliziert wird**:

- Gecachter Inhalt kann veraltet sein – das Invalidieren des Caches kostet Geld (0,005 $ pro Pfad nach den ersten 1.000 kostenlosen Pfaden pro Monat). Verwenden Sie stattdessen versionierte Dateinamen.
- Cache-Control-Header müssen am Origin korrekt gesetzt sein – Fehler verursachen veralteten Inhalt
- Dynamischer Inhalt profitiert von der Routing-Optimierung, aber nicht vom Caching
- Das Debuggen des Cache-Verhaltens (was wird wo, wie lange gecacht) erfordert das Verständnis mehrerer Schichten: Origin-Header, CloudFront-TTL-Einstellungen, Behavior-Regeln
- Datenübertragung aus CloudFront heraus kostet Geld, wenn auch weniger als Standard-Datenübertragung
- Cache-Key-Design erfordert sorgfältiges Nachdenken – zu spezifisch bricht das Caching, zu generisch liefert den falschen Inhalt

## Zusammenfassung

CloudFront veränderte die Physik nicht. Licht reist immer noch mit derselben Geschwindigkeit. Aber es veränderte, wo die Antwort lebte – und für die meisten Benutzer war die Antwort jetzt ein paar Millisekunden statt ein paar hundert entfernt. Cache-Hit-Rate nach dem Deployment: 83 %. Das bedeutete, dass 830.000 von jeder Million Anfragen die Origin-Server überhaupt nicht erreichten. Benutzer in São Paulo gingen von 290 Millisekunden auf 35 Millisekunden. Benutzer in Tokio von 260 auf 28.

- Ein **CDN** cacht Kopien Ihres Inhalts an Edge Locations nahe Ihren Benutzern – was Latenz und Origin-Last reduziert.
- **CloudFront** ist das CDN von AWS, mit über 750 Points of Presence weltweit.
- Cache Misses holen vom **Origin** (S3, ALB, EC2). Cache Hits liefern von der Edge – Millisekunden, nicht Hunderte von Millisekunden.
- **Behaviors** lassen Sie unterschiedliche Caching-Regeln für unterschiedliche URL-Muster setzen. Eine Distribution kann `/images/*` von S3 und `/*` von einem ALB ausliefern.
- Dynamischer Inhalt wird nicht gecacht, aber CloudFront verbessert die Leistung trotzdem durch AWS' privates Backbone-Netzwerk.
- **Vermeiden Sie veralteten Inhalt**, indem Sie versionierte Dateinamen (z. B. `hero-v2.jpg`) statt Invalidierungen verwenden – günstiger und zuverlässiger.
- **CloudFront Functions** handhaben leichtgewichtige Edge-Logik (Header-Manipulation, URL-Umschreibungen) bei Sub-Millisekunden-Geschwindigkeit. **Lambda@Edge** handhabt schwerere Verarbeitung, die Netzwerkaufrufe erfordert.
- **Price Classes** lassen Sie kontrollieren, welche Edge Locations Ihren Traffic ausliefern – und damit Ihre Datenübertragungskosten.
- **Cache-Key-Design** bestimmt, welche Anfrageattribute separate gecachte Variationen erzeugen. Spezifischere Schlüssel = niedrigere Hit-Rate. Weniger spezifisch = Risiko, falschen Inhalt auszuliefern.

## Prüfungstipps

*SAA-C03 Domäne: Design High-Performing Architectures (Domäne 3, Aufgabe 3.4)*

- **CloudFront + S3**: Klassisches Prüfungsmuster zum globalen Ausliefern statischer Websites. S3-Bucket als Origin, CloudFront als CDN, Origin Access Control zur Verhinderung des direkten S3-Zugriffs.
- **Edge Locations vs. Regionen vs. AZs**: Edge Locations sind zahlreicher und existieren nur für Caching-/CDN-Zwecke. Sie sind nicht dasselbe wie AZs (die Ihr Compute betreiben).
- **Cache-Invalidierung**: Erstellt eine `/images/*`-Invalidierung, um CloudFront zu zwingen, frischen Inhalt zu holen. Kostet Geld – die Prüfung könnte nach der kosteneffizienten Alternative fragen: versionierte URLs (`image-v2.jpg` statt `image.jpg`), die den Cache natürlich umgehen.
- **TTL-Kontrolle**: `Cache-Control: max-age=3600` am Origin setzt eine 1-Stunden-Cache-TTL. CloudFront respektiert diese Header. Minimum-TTL, Maximum-TTL und Standard-TTL können auch im Distribution-Behavior gesetzt werden.
- **CloudFront Functions vs. Lambda@Edge**: CloudFront Functions laufen an der Edge für leichtgewichtige Request-/Response-Manipulation (Sub-Millisekunden). Lambda@Edge führt Ihren Lambda-Code an regionalen Edge Locations für schwerere Verarbeitung aus. Die Prüfung unterscheidet sie nach Anwendungsfall-Komplexität. CloudFront Functions können keine Netzwerkaufrufe machen; Lambda@Edge kann.
- **Signed URLs und Signed Cookies**: Kontrollieren, wer auf Inhalt über CloudFront zugreifen kann. Signed URLs geben Zugriff auf bestimmte Dateien; Signed Cookies geben Zugriff auf mehrere Dateien. Die Prüfung verwendet diese für „Inhalt für zahlende Abonnenten“.
- **Price Class**: Die Prüfung könnte fragen, welche Price Class für ein globales Publikum vs. ein Publikum in Nordamerika/Europa zu wählen ist. Price Class All = beste Leistung, höchste Kosten. Price Class 100 = nur Nordamerika und Europa, niedrigste Kosten.
- **Cache-Key**: Standard-Cache-Key ist die URL. Das Hinzufügen von Query-Strings, Headern oder Cookies zum Cache-Key erzeugt separate gecachte Variationen – erhöht aber die Cache-Miss-Rate. Die Prüfung könnte ein Szenario präsentieren, in dem Inhalt nach einem Query-Parameter variiert, und fragen, wie das Caching zu konfigurieren ist.
- **Origin-Failover**: CloudFront unterstützt eine Origin Group mit einem primären und sekundären Origin. Wenn der primäre Origin einen 5xx-Fehler zurückgibt, versucht CloudFront es automatisch erneut mit dem sekundären. Anders als Route-53-Failover – das ist innerhalb einer einzelnen CloudFront-Distribution.
- **Multi-Origin-Behaviors**: Eine einzelne Distribution kann `/images/*` zu S3 und `/*` zu einem ALB routen. Die Prüfung könnte das als „wie man statischen und dynamischen Inhalt von einer Domain ohne zwei Distributionen ausliefert“ präsentieren.
- **CloudFront vs. Global Accelerator**: CloudFront = HTTP/HTTPS-CDN, cacht Inhalt an Edge Locations, reduziert Origin-Last, am besten für statischen und cachebaren Inhalt. Global Accelerator = beliebiges TCP/UDP-Protokoll, cacht nichts, routet Traffic über AWS' privates Backbone, bietet 2 statische Anycast-IPs, unterstützt nahezu sofortiges regionales Failover. Prüfungsauslöser: „Latenz für Nicht-HTTP-Traffic verbessern“ oder „statische IP für eine globale Anwendung“ oder „WebSocket-Leistung für globale Benutzer“ oder „schnelleres regionales Failover als DNS“ → Global Accelerator. „Statische Dateien global mit niedriger Latenz ausliefern“ → CloudFront.

## Übungen

**Übung 1 – Erinnerung**

Erklären Sie den Unterschied zwischen einem CloudFront Cache Hit und einem Cache Miss. Was passiert in jedem Fall?

*(Hinweis: Denken Sie daran, woher der Inhalt kommt und wie sich die Antwortzeit zwischen den beiden Fällen unterscheidet.)*

**Übung 2 – SAA-C03-Szenario**

*Szenario*: Ein Softwareunternehmen verteilt große Installer-Dateien (~2 GB pro Stück) aus einem S3-Bucket an Kunden weltweit. Die Download-Geschwindigkeiten sind für Kunden in Asien langsam. Das Team möchte die Leistung verbessern, ohne den S3-Bucket in mehrere Regionen zu replizieren. Es muss außerdem sicherstellen, dass nur zahlende Kunden die Installer herunterladen können.

Welche Lösung erfüllt diese Anforderungen am BESTEN?

A) S3 Transfer Acceleration auf dem Bucket aktivieren und pre-signed URLs für zahlende Kunden generieren  
B) CloudFront mit dem S3-Bucket als Origin verwenden, Origin Access Control aktivieren und CloudFront Signed URLs für zahlende Kunden verwenden  
C) Einen S3-Bucket in jeder AWS-Region erstellen und Route 53 Geolocation Routing verwenden, um Kunden zum nächstgelegenen Bucket zu leiten  
D) Einen Application Load Balancer in jeder Region mit EC2-Instanzen verwenden, die die Installer-Dateien ausliefern

**Hinweis 1**: Die Anforderung ist, die globale Leistung zu verbessern, *ohne* den Bucket zu replizieren. Welche Option erfordert keine mehreren Buckets?

**Hinweis 2**: Welcher Dienst kontrolliert speziell, wer auf über CloudFront ausgelieferten Inhalt zugreifen kann?

**Hinweis 3**: S3 Transfer Acceleration ist für Langstrecken-Uploads *nach* S3 optimiert. Für das Ausliefern von Inhalt *aus* S3 an Endbenutzer weltweit ist CloudFront das richtige Werkzeug.

**Antwort**: B

**Erläuterung**: CloudFront cacht die Installer-Dateien nach dem ersten Download global an Edge Locations. Nachfolgende Downloads aus derselben Region kommen von der Edge – viel schneller, als den Pazifik von S3 in us-west-2 zu überqueren. Origin Access Control stellt sicher, dass der S3-Bucket nur über CloudFront zugänglich ist. Signed URLs beschränken den Zugriff auf zahlende Kunden.

**Warum nicht A?** S3 Transfer Acceleration ist für Langstrecken-Uploads *nach* S3 optimiert – nicht für das Verteilen von Inhalt *aus* S3 an ein globales Publikum. Dafür ist CloudFront das korrekte Werkzeug. Pre-signed URLs kontrollieren den Zugriff, verbessern aber nicht die globale Leistung.

**Warum nicht C?** Einen S3-Bucket pro Region zu erstellen funktioniert für die Leistung, widerspricht aber der Anforderung, Replikation zu vermeiden. Es erfordert auch eine Datensynchronisationsstrategie über Buckets hinweg.

**Warum nicht D?** EC2-Instanzen hinter einem Load Balancer in jeder Region sind erheblich teurer als CloudFront und erfordern die Verwaltung von Servern in mehreren Regionen.

*SAA-C03 Domäne: Design High-Performing Architectures – Aufgabe 3.4*

**Übung 3 – Architektur-Herausforderung** *(Optional)*

Nimbus möchte Videoinhalte hinzufügen – kurze Koch-Tutorial-Videos von Restaurantpartnern. Videos können 50–500 MB groß sein. Sie erwarten, dass dasselbe Video von Tausenden von Benutzern in derselben Stadt innerhalb von Stunden nach der Veröffentlichung angesehen wird.

Entwerfen Sie die Speicher- und Auslieferungsarchitektur. Würden Sie S3 und CloudFront verwenden? Wie würden Sie die erste Anfrage (Cold Start) behandeln, um die Verzögerung zu minimieren, bevor das Video gecacht ist? Welche Cache-TTL würden Sie für ein Video setzen, das sich nach der Veröffentlichung nicht ändert?

*(Es gibt keine einzige richtige Antwort. Das Ziel ist es, CDN-Designentscheidungen zu üben.)*

## Post-Credits-Szene

„Ich habe es schon deployt – oh.“ Leo hatte die CloudFront-Distribution auf den falschen Origin gerichtet – den Development-S3-Bucket statt des Produktions-Buckets. Für etwa vier Minuten hatten einige West-Coast-Benutzer eine alte Version der App gesehen. Er hatte die Origin-Einstellungen korrigiert, den Cache invalidiert und das Incident-Log still aktualisiert.

Priya beobachtete die CloudFront-Metriken nach dem Deployment.

Cache-Hit-Rate: 83 %.

„Was bedeutet das?“, fragte Tom.

„Es bedeutet, dass 83 % unserer Benutzer Inhalt von einer Edge Location in ihrer Nähe bekommen, nicht aus us-west-2.“

„Und die anderen 17 %?“

„Erstmalige Anfragen. Inhalt, der an dieser Edge Location noch nicht gecacht wurde.“

Tom starrte auf die Metriken. „Wir liefern also fast eine Million Anfragen pro Tag von CloudFront-Edge-Knoten aus. Und nur 170.000 davon treffen tatsächlich unsere Server.“

„Ja.“

„Wenn wir also kein CloudFront hätten, würden unsere Server eine Million Anfragen bewältigen.“

„Bei 140–160 Millisekunden pro Stück, für globale Benutzer.“

Tom lehnte sich zurück. Er hatte einen Blick, den Maya wiedererkannte – den Blick von jemandem, der in Echtzeit Kosten neu berechnet.

„Das ist es wert“, sagte er.

Maya war bereits an ihrem Laptop. „Nächste Woche stoßen zwei neue Ingenieure zu uns. Soo-Jin aus dem Plattform-Team ihres letzten Unternehmens, und Rafael – er hat sich auf Sicherheit spezialisiert. Ich will sie vor ihrem ersten Tag in IAM eingearbeitet haben.“

„IAM advanced?“, fragte Leo.

„Rollen, Policies, Cross-Account-Zugriff. Das echte Zeug.“

Im nächsten Kapitel: die feingranularen Berechtigungen, die einem Teil des Systems erlauben, mit einem anderen zu sprechen – sicher.
