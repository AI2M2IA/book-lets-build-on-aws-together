# Kapitel 1: Warum mieten, wenn man kaufen könnte?

Tom hatte die Frage seit dem Vorabend mit sich herumgetragen. Er hatte sie in sein Notizbuch geschrieben, dann durchgestrichen, dann wieder geschrieben.

Als Leo und Priya am nächsten Morgen ankamen — Kaffee in der Hand, über etwas Unzusammenhängendes streitend — stand Tom bereits am Whiteboard. Die dritte Option war noch da, unberührt. Eine Wolkenform, gezeichnet von jemandem, der zugegeben hatte, nicht zu wissen, was sie bedeutete.

"Ich brauche jemanden, der mir etwas erklärt", sagte Tom, ohne sich umzudrehen. "Wenn wir Computer von Amazon mieten statt eigene zu kaufen — warum wäre das *günstiger*?"

Der Raum verstummte. Es war die Art von Frage, die einfach klingt und es nicht ist.

"Weil", begann Leo.

"Nein", sagte Tom. "Ich möchte es verstehen. Nicht einfach die Antwort hören. Warum ist Mieten günstiger als Besitzen?"

**Das offensichtliche Problem mit dem Besitz von Servern**

Stellen Sie sich vor, Sie beschließen, ein Restaurant zu eröffnen. Nicht das Nimbus-Restaurant — ein normales Restaurant.

Bevor Ihr erster Gast hereinkommt, brauchen Sie Tische. Stühle. Eine Küche. Einen Herd. Teller. Personal. All das brauchen Sie am ersten Tag, auch wenn Ihre erste Woche langsam ist, auch wenn Sie drei Monate lang sechs Gäste pro Tag haben, bevor sich das Wort verbreitet.

Physische Server funktionieren genauso.

Wenn Nimbus eigene Server kauft, müssen sie diese für den Peak kaufen, den sie erwarten. Den geschäftigsten Freitagabend, den sie sich vorstellen können. Den viralen Moment, in dem ein Food-Blogger über die Arepa schreibt und zehntausend Menschen gleichzeitig bestellen wollen.

Aber die meiste Zeit ist es nicht so beschäftigt. Die meiste Zeit stehen diese Server da, verbrauchen Strom und tun fast nichts.

"Wir würden für Kapazität zahlen, die wir nicht nutzen", sagte Maya.

"Genau", sagte Tom, was alle überraschte, weil er derjenige war, der die Frage gestellt hatte.

**Das Mietmodell**

Hier liegt der Unterschied von Cloud-Computing.

Wenn Sie AWS nutzen, kaufen Sie keine Server. Sie mieten Rechenleistung und zahlen nur für das, was Sie nutzen. Es ähnelt eher dem Mieten eines Veranstaltungsortes als dem Besitz eines Restaurantgebäudes.

Stellen Sie es sich so vor.

Wenn Sie eine Geburtstagsparty für fünfzig Personen veranstalten möchten, könnten Sie ein Haus kaufen, das groß genug für fünfzig Personen mit Tischen und Stühlen ist. Oder Sie mieten einen Veranstaltungsort für vier Stunden an einem Samstag, zahlen genau für den Raum und die Zeit, die Sie brauchen, und geben den Schlüssel zurück, wenn die Party vorbei ist.

Der Veranstaltungsort ist immer noch da, wenn Sie ihn brauchen. Er ist wieder verfügbar, wenn etwas anderes aufkommt. Sie mussten keinen Gebäudeverwalter einstellen. Sie haben das ganze Jahr keine Grundsteuer dafür gezahlt.

Das ist das Cloud-Modell. AWS hat die "Veranstaltungsorte". Sie tauchen auf, wenn Sie sie brauchen.

**Aber warten Sie — da steckt noch mehr dahinter**

"Gut", sagte Leo, "aber was, wenn mein Veranstaltungsort abbrennt?"

Guter Instinkt. Dunkel, aber gut.

Eine der stillen Annahmen beim Besitz eigener Server ist, dass *Sie* dafür verantwortlich sind, diese am Laufen zu halten. Wenn der Server in Ihrem Büro von einem unbeholfenen Praktikanten umgestoßen wird, ist Ihre Website down. Wenn das Gebäude den Strom verliert, ist Ihre Website down. Wenn die Festplatte ausfällt — und Festplatten fallen irgendwann immer aus —, ist Ihre Website down.

AWS betreibt Rechenzentren. Riesige, professionell verwaltete Einrichtungen mit Notstromversorgung, redundanten Netzwerkverbindungen, physischer Sicherheit und Teams von Ingenieuren, deren einzige Aufgabe es ist, diese Maschinen am Laufen zu halten.

Sie mieten nicht nur Rechenleistung. Sie mieten Zuverlässigkeit.

"Wie viel kostet das?" fragte Tom.

Dazu kommen wir. Viele Kapitel später, wenn Toms Augen nicht mehr glasig werden.

**Drei Dinge, die die Cloud anders macht**

Machen wir das konkret. Hier sind die drei wesentlichen Unterschiede zwischen dem Betrieb eigener Server und der Nutzung eines Cloud-Anbieters.

**1. Sie zahlen für das, was Sie nutzen.**

Kein Server, der ungenutzt steht. Kein Vorabkauf. Wenn Nimbus an einem Montagmorgen null Bestellungen erhält, zahlen sie fast nichts. Wenn sie am Silvesterabend überwältigt werden, hat AWS automatisch die nötige Kapazität bereit.

**2. Jemand anderes kümmert sich um die Hardware.**

AWS wartet die physischen Maschinen. Die Netzwerkkabel. Die Netzteile. Die Kühlsysteme. Nimbus stellt niemanden ein, der das erledigt. Sie konzentrieren sich auf ihre Anwendung, nicht auf die darunter liegende Infrastruktur.

**3. Sie können sofort hoch- und herunterskalieren.**

Das ist das, dessen Wert eine Weile braucht, um vollständig zu erfassen. Bei physischen Servern bedeutet Skalierung das Bestellen neuer Hardware, wochenlange Wartezeiten auf die Lieferung und das Aufstellen. Mit AWS bedeutet Skalierung das Klicken auf eine Schaltfläche (oder das automatische Erledigen durch das System). Und wenn Sie die zusätzliche Kapazität nicht mehr benötigen, skalieren Sie wieder herunter. Sie hören auf zu zahlen.

Priya war während dieser Erklärung still. Sie hatte eine Frage.

"Was ist mit der Sicherheit? Wer ist dafür verantwortlich, die Daten zu schützen?"

Und hier wird es interessant.

**Das Modell der geteilten Verantwortung**

Dies ist eines der wichtigsten Konzepte in ganz AWS. Es ist einfach, wenn man es versteht, aber es stolpert viele Menschen — auch in der Prüfung.

AWS und Sie teilen die Verantwortung für die Sicherheit. Aber jede Partei ist für verschiedene Dinge verantwortlich.

**AWS ist verantwortlich für die Sicherheit *der* Cloud.**

Die physischen Rechenzentren. Die Hardware. Die Netzwerkinfrastruktur. Die Hypervisoren, die die virtuellen Maschinen betreiben. Wenn jemand in ein AWS-Rechenzentrum einbricht, ist das Amazons Problem.

**Sie sind verantwortlich für die Sicherheit *in* der Cloud.**

Ihre Daten. Ihre Anwendung. Ihre Benutzerkonten und wer Zugang zu was hat. Die von Ihnen gewählten Konfigurationen. Wenn jemand Ihr Passwort stiehlt und sich in Ihr AWS-Konto einloggt, ist das Ihr Problem.

Priya nickte langsam. "Sie schützen also das Gebäude. Wir schützen das, was darin ist."

"Genau", sagte Maya.

"Wenn Leo also einen Port öffnet, den er nicht sollte..."

"Immer noch unser Problem", bestätigte Maya und schaute Leo an.

Leo tippte bereits etwas auf seinem Laptop und tat so, als würde er nicht zuhören.

## Stärken und Einschränkungen

Kein Werkzeug ist perfekt. Lassen Sie uns ehrlich über beide Seiten sein.

**Warum die Cloud großartig ist**:

- Keine Hardware-Vorabkosten
- Bezahlung nur für das, was Sie nutzen
- Sofortige Skalierung in beide Richtungen
- Professionelle Zuverlässigkeit und physische Sicherheit
- Zugang zu Hunderten von verwalteten Diensten (Datenbanken, Warteschlangen, maschinelles Lernen und mehr)
  ohne diese selbst aufbauen oder warten zu müssen

**Wo es kompliziert wird**:

- Kosten können unvorhersehbar sein, wenn Sie nicht aufpassen (Toms zukünftiger Albtraum)
- Sie sind auf einen Dritten für Ihre Infrastruktur angewiesen — wenn AWS in Ihrer Region einen Ausfall hat,
  ist Ihr Dienst ebenfalls betroffen
- Es gibt eine Lernkurve. AWS hat Hunderte von Diensten. Zu wissen, welchen man verwenden soll,
  erfordert Erfahrung oder ein Buch wie dieses.
- Daten, die die Cloud verlassen, können teuer sein. Das Verschieben großer Datenmengen aus AWS
  kostet Geld. (Wir kommen in Kapitel 30 darauf zurück.)

"Wir tauschen also Kontrolle gegen Bequemlichkeit", sagte Tom.

"Und tauschen Vorabkosten gegen laufende Kosten", fügte Maya hinzu.

"Und tauschen das Problem von jemand anderem gegen unser eigenes Problem, auf der Sicherheitsseite", sagte Priya.

"Aber wir tauschen auch Leos kaputten Server gegen Amazons sehr-nicht-kaputten Server", sagte Leo,
der anscheinend die ganze Zeit zugehört hatte.

Er lag nicht ganz falsch.

## Zusammenfassung

- Die Cloud ist Rechenleistung, die Sie mieten statt besitzen.
- AWS ist der größte Cloud-Anbieter der Welt.
- Der Kernvorteil ist Pay-as-you-go-Skalierung: Sie zahlen nur für das, was Sie nutzen, und können
  nach Bedarf hoch- oder herunterskalieren.
- AWS kümmert sich um die physische Infrastruktur. Sie kümmern sich um Ihre Anwendung, Ihre Daten
  und Ihre Konfigurationen. Diese Aufteilung wird als **Modell der geteilten Verantwortung** bezeichnet.
- Die Cloud ist nicht immer günstiger oder einfacher — aber sie beseitigt Einstiegshürden
  und macht Skalierung auf eine Weise möglich, die physische Server nicht erreichen können.

## Prüfungstipps

*SAA-C03-Domäne: Domänenübergreifend — Grundlagen der Cloud-Konzepte*

- Das **Modell der geteilten Verantwortung** erscheint regelmäßig in der Prüfung. Merken Sie sich: AWS
  ist verantwortlich für die Sicherheit *der* Cloud (Hardware, Rechenzentren, globales Netzwerk).
  Sie sind verantwortlich für die Sicherheit *in* der Cloud (Daten, Identitäten, Anwendungskonfiguration).
- **Wichtige Nuance**: Die Aufteilung verschiebt sich je nach Diensttyp. Bei EC2
  (eine virtuelle Maschine, die Sie steuern) patchen *Sie* das Betriebssystem. Bei RDS (einer
  verwalteten Datenbank) patcht AWS die Datenbank-Engine. Je "verwalteter" ein Dienst ist,
  desto mehr Verantwortung geht auf AWS über. Prüfungsszenarien beschreiben einen Vorfall
  und fragen, wer verantwortlich ist — fragen Sie sich immer: "Wie verwaltet ist dieser Dienst?"
- Fragen zu Cloud-*Vorteilen* testen oft CapEx vs. OpEx. On-Premises-Hardware
  ist Investitionsausgabe (CapEx — einmal kaufen, über die Zeit abschreiben). Cloud ist
  Betriebsausgabe (OpEx — monatlich zahlen). AWS verschiebt Kosten von CapEx zu OpEx.
- "Elastizität" — die Fähigkeit, *automatisch* hoch- und herunterzuskalieren — ist ein
  wesentlicher Cloud-Vorteil. Sie kann auf der Prüfung mit "Skalierbarkeit" kombiniert erscheinen.
  Elastizität bedeutet automatische, nachfragegetriebene Skalierung in beide Richtungen.
  Skalierbarkeit bedeutet, dass das System *wachsen kann*, aber nicht notwendigerweise automatisch schrumpft.

## Übungen

**Übung 1 — Wiederholung**

Erklären Sie mit eigenen Worten: das Modell der geteilten Verantwortung. Wer ist für was verantwortlich,
und warum ist diese Unterscheidung wichtig?

*(Hinweis: Denken Sie an Priyas Analogie — wer schützt das Gebäude und wer schützt das, was darin ist.)*

**Übung 2 — Prüfungsübung**

*Szenario*: Ein Unternehmen migriert seine Webanwendung von einem On-Premises-Rechenzentrum zu AWS. Das Sicherheitsteam ist besorgt über die Einhaltung seiner Datenschutzrichtlinien. Ein neuer Ingenieur fragt: "Jetzt, da wir bei AWS sind, kümmert sich Amazon um all unsere Sicherheitsanforderungen?"

Welches der folgenden Beschreibungen trifft am BESTEN auf die Aufteilung der Sicherheitsverantwortungen zu?

A) AWS ist vollständig für alle Sicherheit verantwortlich, sobald die Anwendung in der Cloud gehostet wird  
B) Der Kunde ist vollständig für alle Sicherheit verantwortlich, einschließlich der physischen Rechenzentrumssicherheit  
C) AWS verwaltet die Sicherheit der zugrunde liegenden Infrastruktur; der Kunde verwaltet die Sicherheit seiner Daten, Anwendungen und Konfigurationen  
D) Sicherheitsverantwortlichkeiten werden pro Konto ausgehandelt und hängen vom Service-Tier des Kunden ab

**Hinweis 1**: Denken Sie darüber nach, was AWS physisch kontrolliert versus was Sie kontrollieren.

**Hinweis 2**: AWS besitzt die Rechenzentren. Sie haben entschieden, was Sie darin ablegen und wie Sie
Ihre Anwendung konfigurieren.

**Hinweis 3**: Wir haben in diesem Kapitel einen spezifischen Namen für diese Aufteilung der Verantwortlichkeiten eingeführt.

**Antwort**: C

**Erklärung**: Das AWS-Modell der geteilten Verantwortung teilt die Sicherheit in zwei Domänen auf.
AWS sichert die physische Infrastruktur — Rechenzentren, Hardware und Netzwerke.
Der Kunde sichert alles, was er darauf deployed: seine Daten, seine Zugriffskontrollen,
seine Anwendungskonfigurationen und seine Netzwerkeinstellungen.

**Warum nicht A?** AWS übernimmt nie die vollständige Verantwortung für die Sicherheit der Kundenanwendung.
In dem Moment, in dem Sie etwas konfigurieren, liegt diese Konfiguration in Ihrer Verantwortung.

**Warum nicht B?** Kunden sind nicht für die physische Rechenzentrumssicherheit verantwortlich —
das ist genau einer der Vorteile der Nutzung von AWS.

**Warum nicht D?** Das Modell der geteilten Verantwortung ist ein festes Framework, keine ausgehandelte
Vereinbarung.

*SAA-C03-Domäne: Domänenübergreifend — Cloud-Konzepte / Geteilte Verantwortung*

**Übung 3 — Architekturherausforderung** *(Optional)*

Ein Freund startet eine neue App und fragt Sie um Ihre Meinung. Er entscheidet sich zwischen
dem Kauf von zwei physischen Servern (einer für die App, einer für die Datenbank) oder der Nutzung
eines Cloud-Anbieters. Sein prognostizierter Traffic beträgt 10–100 Nutzer pro Tag, aber er hat eine
Veranstaltung in drei Monaten, die an einem einzigen Tag 10.000 Nutzer bringen könnte.

Gehen Sie die Kompromisse durch. Welche Option würden Sie empfehlen, und was ist der Hauptgrund?
Was würden Sie mit Ihrer Wahl aufgeben?

*(Es gibt keine einzige richtige Antwort. Das Ziel ist, das Denken in Kompromissen zu üben.)*

## Post-Credits-Szene

Drei Tage später hatte Nimbus ein AWS-Konto.

Leo hatte es um 23 Uhr mit seiner persönlichen E-Mail-Adresse erstellt, einer Kreditkarte, die er von Tom leihen musste, und einer Begeisterung, die im Nachhinein betrachtet leicht alarmierend war.

"Ich habe etwas namens EC2 gefunden", sagte er am nächsten Morgen und zeigte seinen Laptop-Bildschirm. "Es ist wie ein Computer, den man mietet. Ich glaube, ich habe einen gestartet."

"Du *glaubst*?" fragte Priya.

"Ich meine, ich habe definitiv einen gestartet." Er scrollte nach unten. "Ich weiß nur nicht, wo er ist."

Maya lehnte sich vor und schaute auf den Bildschirm.

"Leo", sagte sie. "Warum steht da 'Region: ap-southeast-1'?"

"Was bedeutet das?"

Im nächsten Kapitel: die Geografie von AWS — wo die Server wirklich sind und warum das wichtig ist.
