# Kapitel 2: Wo auf der Welt ist Ihr Server?

Stehen Sie auf. Gehen Sie zu einem Fenster, wenn eines in der Nähe ist.

Schauen Sie nach draußen. Was auch immer Sie sehen — Gebäude, Bäume, einen Parkplatz, jemandes Hinterhof — nichts davon ist der Ort, an dem Ihre Daten leben. Ihre Daten leben irgendwo ganz anderes. Wahrscheinlich irgendwo, wo Sie noch nie waren.

Das ist kein Problem. Aber zu verstehen *wo* lässt überraschend viele Dinge einrasten.

Im letzten Kapitel erstellte Leo um 23 Uhr ein AWS-Konto und startete irgendwo einen Server. "Irgendwo" war das entscheidende Wort — er war sich nicht sicher, welchen Teil der Welt er gewählt hatte, weil er es nicht absichtlich gewählt hatte.

Am nächsten Morgen bemerkte Maya, dass der Server in Singapur war.

"Warum Singapur?" fragte sie.

"Es war die Voreinstellung", sagte Leo.

Tom blickte von seinem Kaffee auf. "Wie viel kostet es, einen Server in Singapur zu betreiben, wenn alle unsere Kunden an der Westküste sind?"

Leo hatte keine Antwort.

Priya hatte bereits eine: "Es ist auch langsamer. Jede Anfrage muss um die halbe Welt reisen."

Dieses Kapitel handelt davon, diese Entscheidung zu korrigieren — und zu verstehen, warum es wichtig ist.

**Das Problem mit "Irgendwo"**

Wenn Sie AWS nutzen, nutzen Sie nicht ein einziges Rechenzentrum. Sie nutzen ein globales Netzwerk von ihnen. AWS hat Infrastruktur in Dutzenden von Ländern.

Das ist ein Feature, nicht nur eine Tatsache. Aber es bedeutet, dass Sie eine Wahl treffen müssen: *Wo* soll Ihre Infrastruktur laufen?

Die Wahl ist aus drei Gründen wichtig:

**Performance.** Je näher Ihre Server Ihren Nutzern sind, desto schneller ist die Antwort.
Physik ist nicht verhandelbar. Daten reisen mit ungefähr zwei Dritteln der Lichtgeschwindigkeit
durch Glasfaserkabel. Eine Anfrage von Seattle nach Singapur dauert allein für den Transit
etwa 300 Millisekunden — bevor Ihre Anwendung etwas tut.

**Compliance.** Einige Branchen haben Gesetze darüber, wo Daten gespeichert werden dürfen. US-amerikanische
Gesundheitsdaten müssen möglicherweise im Land bleiben. Finanzdaten müssen möglicherweise in einer bestimmten
Region bleiben. Die Wahl der falschen Region kann rechtliche Probleme verursachen.

**Katastrophenresilienz.** Wenn an einem Standort Stromausfall, Erdbeben oder Netzwerkausfall auftreten,
soll Ihr System überleben. Die Verteilung der Infrastruktur auf mehrere Standorte schützt vor lokalen
Katastrophen.

**Wie AWS seine Infrastruktur organisiert**

AWS gliedert seine globale Infrastruktur in drei verschachtelte Konzepte. Stellen Sie sie sich wie
russische Schachtelpuppen vor, von größter zu kleinster.

**Regionen → Availability Zones → Edge Locations**

Öffnen wir jede einzeln.

**Regionen: Die großen Boxen**

Eine **Region** ist ein geografisches Gebiet, in dem AWS eine Gruppe von Rechenzentren hat. Jede Region
ist nach ihrem Standort benannt: `us-west-2` ist Oregon, `us-east-1` ist Northern Virginia,
`eu-west-1` ist Irland, `ap-southeast-1` ist Singapur — wo Leos Server sich versteckte.

Es gibt weltweit über 30 Regionen, und AWS fügt regelmäßig weitere hinzu.

Jede Region ist vollständig unabhängig. Daten in `us-west-2` bleiben in `us-west-2`, es sei denn,
Sie verschieben sie explizit. Dies ist für Compliance und Resilienz entscheidend — ein größerer Ausfall
in einer Region betrifft andere nicht automatisch.

"Also sollten wir `us-west-2` für Nimbus wählen?" fragte Tom.

Ja. Für ein US-amerikanisches Unternehmen, das sich an Westküstenkunden richtet, ja. Geringere Latenz
und Ihre Nutzer erhalten schnellere Antworten.

"Wie viel teurer ist das als Singapur?" ergänzte Tom.

Die Preise variieren je nach Region — üblicherweise um einige Prozent. Der Performance- und
Compliance-Vorteil der richtigen Region ist den geringen Preisunterschied wert.

**Availability Zones: Die echte Redundanz**

Hier wird es interessant.

Jede Region ist kein einzelnes Rechenzentrum. Es ist eine Gruppe mehrerer, physisch getrennter
Rechenzentren, sogenannter **Availability Zones** (oder AZs).

Oregon (`us-west-2`) hat vier Availability Zones: `us-west-2a`, `us-west-2b`,
`us-west-2c`, `us-west-2d`. Das sind echte Gebäude, durch bedeutende Entfernungen getrennt —
weit genug auseinander, dass ein Feuer, eine Überschwemmung oder ein Stromausfall in einem die anderen
nicht beeinträchtigt, aber nah genug, dass das Netzwerk zwischen ihnen extrem schnell ist
(einstellige Millisekunden-Latenz).

Das ist die Architektur, die AWS auf einem Niveau zuverlässig macht, das kein einzelnes Rechenzentrum
erreichen kann.

Priya lehnte sich vor. "Wenn wir unsere Anwendung über zwei Availability Zones betreiben und
eine ausfällt—"

"Läuft die andere weiter", beendete Maya den Satz.

"Genau."

Leo, der still zugehört hatte: "Ich habe alles in einer AZ deployed."

"Ja", sagte Priya. "Das haben wir bemerkt."

Das Konzept, die Anwendung über mehrere AZs zu verteilen — **Multi-AZ-Deployment** genannt —
ist eines der wichtigsten Resilienzmuster in AWS. Wir gehen in Kapitel 18 ausführlich darauf ein.
Verstehen Sie vorerst, dass AZs genau dafür existieren.

**Edge Locations: Geschwindigkeit überall**

AZs lösen Resilienz. Sie lösen nicht das Problem, Inhalte schnell an Nutzer in Städten
zu liefern, die weit von Ihrer Hauptregion entfernt sind.

Hier kommen **Edge Locations** ins Spiel.

Edge Locations sind kleine, leichtgewichtige Infrastrukturpunkte, die über mehr als 400 Städte
weltweit verteilt sind. Es sind keine vollständigen Rechenzentren — sie können Ihre Anwendung
nicht ausführen. Was sie *können*, ist das Zwischenspeichern von Inhalten nahe Ihren Nutzern.

Stellen Sie sich ein Menübild vor, das auf einem Server in Virginia gespeichert ist. Jedes Mal,
wenn jemand in Tokio es sehen möchte, reist die Anfrage über den Pazifik und zurück. Mit Edge Locations
kann AWS eine Kopie dieser Datei in Tokio speichern und sie lokal bereitstellen —
Millisekunden statt Hunderte von Millisekunden.

Das ist das Rückgrat von CloudFront, dem Content-Delivery-Netzwerk von AWS. Wir tauchen in
Kapitel 13 tief in CloudFront ein. Vorerst gilt: Edge Locations sind für Geschwindigkeit bei
statischen Inhalten.

**Eine Region auswählen: Die Checkliste des Senior-Ingenieurs**

Wenn Nimbus expandiert, um Nutzer in Mexiko und Kolumbien zu bedienen (was in Kapitel 12 passiert),
ist die Regionsentscheidung nicht willkürlich. Hier ist das Denken dahinter:

**1. Wo sind Ihre Nutzer?**

Beginnen Sie hier. Wählen Sie die Region, die den meisten Ihrer Nutzer am nächsten ist.
Latenz ist die direkteste, messbare Auswirkung der Regionenwahl.

**2. Gibt es Compliance-Anforderungen?**

Gesundheits-, Finanz- und Behördenarbeitslasten haben oft strenge Datenhaltungsregeln.
Kennen Sie Ihr regulatorisches Umfeld, bevor Sie wählen.

**3. Welche Dienste benötigen Sie?**

Nicht jeder AWS-Dienst ist in jeder Region verfügbar. Neue Dienste starten zuerst in `us-east-1`.
Wenn Sie einen bestimmten Dienst benötigen, prüfen Sie, ob Ihre Zielregion ihn unterstützt.

**4. Wie sind die Preise?**

Regionen variieren im Preis. `us-east-1` (Northern Virginia) ist aufgrund seines Maßstabs und Alters
tendenziell am günstigsten. Südamerika ist etwas teurer. Überprüfen Sie die AWS-Preisseite
vor der endgültigen Entscheidung.

**5. Benötigen Sie Multi-Region?**

Für die meisten Anwendungen reichen mehrere AZs innerhalb einer Region für ausreichende Resilienz.
Für kritische Anwendungen, bei denen sogar ein regionaler Ausfall nicht akzeptabel ist,
wird Multi-Region-Design angewendet — aber das ist ein erhebliches architektonisches Engagement.
Tun Sie es nicht spekulativ.

**Die Einschränkung, über die niemand spricht**

Regionen sind mächtig, aber sie erzeugen eine wichtige Spannung.

In mehreren Regionen zu betreiben ist wirklich schwierig.

Die Datenreplikation zwischen Regionen hat Latenz. Zwei Regionen synchron zu halten — sodass eine
Transaktion in Region A sofort in Region B sichtbar ist — ist eines der schwierigsten Probleme
in verteilten Systemen. AWS bietet Werkzeuge dafür, aber es kostet Geld und erhöht die betriebliche
Komplexität.

Die meisten Anwendungen sollten mit einer Region, mehreren AZs beginnen und nur dann auf Multi-Region
expandieren, wenn sie einen klaren Bedarf haben: regulatorische Mandate, vertragliche SLAs, die
nahezu null regionalen Ausfallzeiten erfordern, oder eine Nutzerbasis, die tatsächlich über Kontinente
verteilt ist.

Vorzeitige Multi-Region-Architektur ist einer der häufigsten und teuersten Fehler, die Junior-Ingenieure
machen, wenn sie anfangen, selbstbewusst zu werden.

Tom nickte. "Also machen wir kein Multi-Region, nur weil wir können."

"Nicht bis wir es müssen", sagte Maya. "Und wir werden wissen, wann wir es müssen."

"Woher werden wir das wissen?" fragte Leo.

"Wenn Ihr Architekturdokument eine Anforderung hat, die besagt 'muss einen regionalen
Ausfall überleben'", sagte Priya. "Bis dahin: Multi-AZ."

## Stärken und Einschränkungen

**Verwenden Sie Multi-Region und Multi-AZ-Design, wenn**: Ihre Anwendung Nutzer in mehreren Geografien hat und Latenz wichtig ist; Ihr SLA eine Verfügbarkeit von 99,99 % oder höher erfordert; regulatorische Anforderungen die Datenhaltung in bestimmten Regionen vorschreiben; Sie eine Notfallwiederherstellung mit einem RTO unter einer Stunde benötigen.

**Die Kompromisse sind real**: Das Replizieren von Daten über Regionen hinweg verursacht Kosten — der Datentransfer über Regionen hinweg ist einer der am häufigsten unterschätzten Posten in einer AWS-Rechnung. Es erhöht auch die betriebliche Komplexität: Jeder Schreibvorgang, der über Regionen hinweg konsistent sein muss, erhöht die Latenz. Die meisten Ausfälle, die echte Anwendungen betreffen, sind keine regionsübergreifenden Katastrophen — sie sind Probleme innerhalb einer Region wie eine falsch konfigurierte Security Group oder ein misslungenes Deployment. Investieren Sie in Multi-AZ vor Multi-Region. Fügen Sie Multi-Region hinzu, wenn der Business Case klar ist.

## Zusammenfassung

- AWS organisiert seine globale Infrastruktur in **Regionen**, **Availability Zones**
  und **Edge Locations**.
- Eine **Region** ist eine geografische Gruppe von Rechenzentren. Jede Region ist isoliert —
  Daten bleiben in der Region, es sei denn, Sie verschieben sie explizit.
- **Availability Zones** sind physisch getrennte Rechenzentren innerhalb einer Region, verbunden
  durch Netzwerke mit niedriger Latenz. Der Betrieb über mehrere AZs ist der Standardweg,
  lokale Ausfälle zu überleben.
- **Edge Locations** speichern Inhalte nahe bei Nutzern weltweit. Sie betreiben CloudFront.
- Wählen Sie Ihre Region basierend auf Nutzerstandort, Compliance-Anforderungen, Dienstverfügbarkeit
  und Preis — in dieser Reihenfolge.
- Multi-AZ ist der Standard-Resilienz-Ausgangspunkt. Multi-Region ist für kritische Arbeitslasten
  mit spezifischen, dokumentierten Anforderungen — kein Standardausgangspunkt.

## Prüfungstipps

*SAA-C03-Domäne 1 — Aufgabe 1.1 / Domäne 2 — Aufgabe 2.2*

- **Regionen sind standardmäßig isoliert.** Daten werden nicht zwischen Regionen repliziert, es sei denn,
  Sie konfigurieren es. Dies ist wichtig für Datensouveränität und Compliance-Szenarien.
- **AZs sind die Resilienzeinheit für die meisten Fragen.** Wenn die Prüfung fragt, wie man einen
  Rechenzentrumausfall überlebt, beinhaltet die Antwort mehrere AZs innerhalb einer Region.
- **Multi-Region ist für regionale Ausfall-Resilienz.** Wenn das Szenario sagt "muss auch bei einem
  vollständigen AWS-Regionsausfall betriebsbereit bleiben", beinhaltet die Antwort Multi-Region-Architektur.
- **Edge Locations ≠ AZs.** Edge Locations speichern Inhalte zwischen — sie können Ihren
  Anwendungsserver nicht ausführen. Verwechseln Sie sie nicht mit Rechenzentren.
- Die Prüfung testet häufig die Beziehung zwischen Compliance und Regionenwahl.
  Wenn ein Szenario Datenhaltungsanforderungen erwähnt, ist die Regionenwahl Teil der Antwort.

## Übungen

**Übung 1 — Wiederholung**

Erklären Sie mit eigenen Worten: Was ist der Unterschied zwischen einer Region und einer Availability Zone?
Warum ist diese Unterscheidung beim Design einer resilienten Webanwendung wichtig?

*(Hinweis: Denken Sie an die zwei verschiedenen Arten von Ausfällen, gegen die jede schützt.)*

**Übung 2 — Prüfungsübung**

*Szenario*: Ein US-amerikanisches Gesundheitsunternehmen muss alle Patientendaten innerhalb einer einzigen
AWS-Region speichern, um internen Datenhaltungsrichtlinien zu entsprechen. Es entwirft eine neue
Cloud-Anwendung an der Westküste und möchte maximale Resilienz ohne Datenverlagerung in eine andere
Region.

Welche Konfiguration erfüllt seine Anforderungen AM BESTEN?

A) In `us-east-1` deployen und CloudFront Edge Locations in Oregon nutzen, um Inhalte schneller bereitzustellen  
B) In `us-west-2` (Oregon) über mehrere Availability Zones hinweg deployen  
C) In mehreren Regionen einschließlich `us-west-2` und `us-east-1` mit regionsübergreifender
   Datenreplikation deployen  
D) In `us-west-2` in einer einzigen Availability Zone deployen, um Kosten zu minimieren

**Hinweis 1**: Die Richtlinie bedeutet, dass Daten in einer einzigen Region bleiben müssen. Welche
Optionen verschieben Daten in eine andere Region?

**Hinweis 2**: Unter den Optionen, die Daten in `us-west-2` halten, welche bietet die meiste Resilienz?

**Hinweis 3**: Mehrere AZs innerhalb einer einzigen Region bieten Resilienz, ohne Regionsgrenzen zu überschreiten.

**Antwort**: B

**Erklärung**: `us-west-2` hält alle Daten in einer einzigen Region und erfüllt die Richtlinienanforderung.
Das Deployen über mehrere AZs innerhalb dieser Region schützt vor Rechenzentrumsausfällen,
ohne Daten in eine andere Region zu verschieben. Das ist die richtige Balance aus Compliance und Resilienz.

**Warum nicht A?** CloudFront speichert Inhalte global an Edge Locations zwischen — Daten würden
physisch `us-west-2` verlassen und die Datenhaltungsrichtlinie verletzen.

**Warum nicht C?** Die Replikation nach `us-east-1` verschiebt Patientendaten an die Ostküste
und verletzt direkt die Single-Region-Anforderung.

**Warum nicht D?** Eine einzige AZ hat keine Resilienz. Wenn diese AZ einen Ausfall erlebt,
fällt die Anwendung vollständig aus.

*SAA-C03-Domäne 1 — Aufgabe 1.1 (globale Infrastruktur, Datensouveränität)*

**Übung 3 — Architekturherausforderung** *(Optional)*

Nimbus expandiert, um Kunden in Mexiko und Kolumbien zu bedienen. Derzeit läuft alles in `us-west-2`.
Das Team debattiert: Sollen sie eine zweite Region `us-east-1` hinzufügen oder bei einer einzigen
Region mit mehreren AZs bleiben?

Welche Fragen würden Sie stellen, bevor Sie entscheiden? Was sind die Hauptkosten und Risiken,
eine zweite Region hinzuzufügen? Was sind die Hauptkosten, wenn man *keine* hinzufügt?

*(Es gibt keine einzige richtige Antwort. Üben Sie das Multi-Region-Kompromissdenken.)*

## Post-Credits-Szene

Leo behob das Singapur-Problem. Nimbus wechselte zu `us-west-2`. Die Latenz sank.
Toms einzige Nachfolgefrage — "hat das unsere Rechnung verändert?" — wurde mit einer
etwas höheren Zahl beantwortet, die er mit sichtbarem Widerwillen akzeptierte.

Das hielt zwei Tage, bevor das nächste Problem auftrat.

Leo kam zum Standup mit dem Ausdruck, den Maya gelernt hatte zu erkennen: der Blick von jemandem,
der etwas getan hatte, was er nicht rückgängig machen konnte.

"Also", sagte er vorsichtig. "Ich habe den Server eingerichtet. Und ich brauchte eine Möglichkeit,
mich einzuloggen. Also habe ich einen Benutzernamen erstellt."

"Und?" fragte Priya.

"'Admin'."

Stille.

"Und das Passwort?"

Eine längere Stille.

"'Admin123'."

Priya stand auf.

Im nächsten Kapitel: Wie Nimbus kontrolliert, wer was anfassen kann — und was passiert, wenn sie es falsch machen.
