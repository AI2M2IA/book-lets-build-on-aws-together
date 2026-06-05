# Kapitel 7: Das Restaurant, das sich mit Hochbetrieb Erweitert

Es war 20:43 Uhr an einem Freitagnachmittag, als die Fehlerrate 12 % überschritt.

Tom bemerkte es zuerst, weil Tom immer zuerst bemerkte. Er hatte einen Tab geöffnet zum CloudWatch-Dashboard, den er so aktualisierte, wie es andere Leute bei sozialen Medien taten – reflexartig, ständig, ohne wirklich darüber nachzudenken.

„Leo“, sagte er.

Leo war bereits dabei, es zu beobachten. Antwortzeiten: stiegen. Anstehende Anfragen: stiegen. Die einzelne EC2-Instanz – sogar die größere, die sie letzten Monat aufgestockt hatten – war bei 94 % CPU.

„Wir lenken Kunden ab“, sagte Tom.

„Wir lenken sie nicht ab“, sagte Leo. „Es ist der Server.“

„Das ist dasselbe.“

Es war. Und es war seit drei Wochen jeden Freitag das gleiche passiert. Nimbus hatte die Speicherkrise überstanden – die Datenbank hatte ihre eigene Festplatte, die Fotos lebten in S3 – aber stabile und skalierbare sind völlig andere Probleme. Das System funktionierte. Es wuchs einfach nicht mit.

Das Team brauchte, dass ihr System die variable Last automatisch bewältigen konnte. Nicht, um genug Server für den schlimmsten Fall zu kaufen und in ruhigen Zeiten Geld zu verschwenden. Und nicht, um den Verkehrsschub manuell zu korrigieren, wenn er auftrat.

Für diesen Fall gibt es ein Muster. AWS bietet zwei Dienste, die es implementieren.

**Das Konzept: Horizontale Skalierung**

Es gibt zwei Möglichkeiten, wie ein System mehr Last bewältigen kann.

**Vertikale Skalierung** bedeutet, dass der einzelne Server größer wird. Mehr CPU. Mehr RAM.
Wir haben das in Kapitel 4 getan, als wir von `t3.micro` auf `t3.large` aufgestockt haben. Das hilft.
Aber es hat Grenzen: man kann nur so weit gehen, die Instanz muss neu starten, um sie zu vergrößern, und man hat immer noch einen einzelnen Ausfallpunkt.

**Horizontale Skalierung** bedeutet, dass man mehr Server hinzufügt. Anstatt einen großen Server zu haben, laufen fünf mittelgroße Server. Wenn die Last sinkt, laufen zwei. Wenn sie steigt, laufen zehn.

Horizontale Skalierung hat Vorteile, die vertikale nicht hat:

- Kein einzelner Ausfallpunkt. Wenn ein Server ausfällt, halten die anderen weiter.
- Keine Neustart erforderlich, um Kapazität hinzuzufügen.
- Nur für das bezahlt, was man benutzt – Server hinzufügen, wenn man sie braucht, entfernen, wenn man sie nicht braucht.
- Lineare Skalierung: Verdoppeln Sie die Anzahl der Server, erhöhen Sie die Durchsatzleistung ungefähr verdoppelt.

Der Knackpunkt: Wenn man mehrere Server hat, wie wissen Benutzer, an welchen sie sich wenden sollen?

**Der Anwendungslasten-Load Balancer: Eine Tür zu Vielen Räumen**

Ein **Anwendungslasten-Load Balancer** (ALB) ist die Eingangstür Ihrer Anwendung.

Nutzer verbinden sich mit dem Load Balancer. Der Load Balancer verteilt eingehende Anfragen auf Ihre Flotte von EC2-Instanzen. Jeder Nutzer sieht eine einzige Adresse (die URL des Load Balancers). Hinter dieser Adresse werden Anfragen auf so viele Server verteilt, wie gerade laufen.

Denken Sie daran wie ein großes Restaurant mit einem Schalter an der Tür. Gäste kommen an und der Schalter leitet sie an einen freien Tisch weiter. Der Schalter weiß, welche Tische voll sind und welche frei sind. Gäste müssen nicht wissen, wie viele Tische es gibt – sie kommen einfach herein und der Schalter kümmert sich um die Verteilung.

Ein ALB macht das mit Webanfragen. Es empfängt jede eingehende HTTP-Anfrage und entscheidet, welche EC2-Instanz (genannt ein **Ziel**) sie verarbeiten soll, basierend auf Faktoren wie:

- Round-robin (jeder Server bekommt abwechselnd einen Dreh)
- Wenigste ausstehende Anfragen (der Server mit den wenigsten in-Flight-Anfragen erhält die nächste Anfrage)
- Gesundheit – nur gesunde Ziele erhalten Traffic

**Gesundheitsprüfungen** sind unerlässlich. Der ALB sendet regelmäßig Testanfragen an jedes Ziel.
Wenn ein Ziel nicht korrekt antwortet, markiert der ALB es als nicht gesund und stoppt den Verkehr zu ihm. Wenn das Ziel sich erholt, wird der Verkehr wieder aufgenommen.

Dies geschieht automatisch. Sie konfigurieren die Gesundheitsprüfparameter; der ALB erzwingt sie.

**Auto Scaling: Das Restaurant, das Mehr Tische Öffnet**

Ein ALB verteilt den Traffic auf Ihre bestehenden Server. Aber es fügt Server hinzu, wenn Sie mehr benötigen.

**Auto Scaling** tut das.

Eine **Auto Scaling Group** (ASG) ist eine Konfiguration, die AWS sagt:

- Die minimale Anzahl von Instanzen, die immer laufen sollen
- Die maximale Anzahl von Instanzen, die erlaubt sind
- Unter welchen Bedingungen Aus-Skalierungen (Hinzufügen von Instanzen) oder Ein-Skalierungen (Entfernen von Instanzen) durchgeführt werden sollen

Die Skalierungsbedingungen werden als **Richtlinien** bezeichnet. Der häufigste Typ:

**Zielverfolgung**: „Halten Sie den durchschnittlichen CPU-Auslastung bei 70 %.“ Wenn die durchschnittliche CPU 70 % überschreitet, startet AWS neue Instanzen. Wenn sie unter 70 % fällt, werden Instanzen beendet.

Dies geschieht automatisch. Niemand muss die Metriken überwachen. Niemand muss Instanzen manuell starten. Das System reagiert in Echtzeit auf die Last.

Priya sah das zum ersten Mal live passieren, als ein Freitags-Rush. Die Serveranzahl ging von 2 auf 5 innerhalb von fünfzehn Minuten und kehrte dann nach dem Rush auf 2 zurück.

„Das“, sagte sie, „ist wirklich beeindruckend.“

Tom beobachtete stattdessen den Kosten-Graph. Die Rechnung stieg während des Rush und sank danach. „Wir haben nur für das bezahlt, was wir benutzt“, sagte er, ebenso beeindruckt.

**Wie ALB und ASG zusammenarbeiten**

Die beiden Dienste sind so konzipiert, dass sie zusammen verwendet werden.

Sie legen den ALB vor. Der ALB zeigt auf eine **Zielgruppe** – eine Sammlung von Instanzen, die Traffic empfangen sollen. Die Auto Scaling Group verwaltet diese Instanzen: Sie fügt sie der Zielgruppe hinzu, wenn sie aus-Skaliert, und entfernt sie, wenn sie ein-Skaliert.

Der Ablauf:

1.  Der Verkehr gelangt zum ALB
2.  Das ALB verteilt Anfragen an gesunde Targets
3.  Die CPU/Last steigt auf diesen Targets
4.  Die ASG erkennt die Lastzunahme, startet neue Instanzen
5.  Neue Instanzen bestehen Health Checks, werden mit dem ALB registriert
6.  Das ALB beginnt, Traffic an sie zu senden
7.  Die Last sinkt ab, die ASG beendet überflüssige Instanzen
8.  Das ALB stoppt das Senden von Traffic zu beendeten Instanzen

Dies geschieht ohne menschliches Eingreifen.

**Launch Templates: Der Bauplan für neue Instanzen**

Wenn die ASG eine neue Instanz startet, muss sie wissen, was sie starten soll. Dies wird in einem **Launch Template** definiert – eine AMI, ein Instanztyp, die anzuwendenden Sicherheitsgruppen und jegliche Benutzerdaten (Start-Skripte, die beim Starten der Instanz ausgeführt werden).

Ein gängiges Muster: Sie bauen Ihre Anwendung in eine benutzerdefinierte AMI ein (siehe Kapitel 4). Wenn die ASG eine neue Instanz benötigt, startet sie diese AMI. Die neue Instanz startet mit Ihrer Anwendung, die bereits installiert ist. Keine manuelle Einrichtung erforderlich.

Für dynamischere Umgebungen können Sie auch **Benutzerscripts** verwenden, die die neueste Version Ihres Codes beim Start abrufen und installieren. Dies ist flexibler, dauert aber länger zum Starten.

Die richtige Wahl hängt davon ab, wie lange Ihre Instanzen zum Booten benötigen und wie oft sich Ihre Anwendung ändert.

**Sticky Sessions: Ein subtiles Problem**

Hier ist etwas, das viele Teams verwirrt, wenn sie zum ersten Mal Load Balancing implementieren.

Einige Webanwendungen speichern Session-Daten – Anmeldezustand, Warenkorb-Inhalte – auf dem Server selbst (im Speicher oder auf lokaler Festplatte). Dies funktioniert gut mit einem Server. Mit mehreren Servern bricht es.

Ein Benutzer meldet sich an. Die Anfrage geht zu Server A. Server A speichert die Session. Die nächste Anfrage geht zu Server B. Server B hat keine Session. Der Benutzer erscheint abgemeldet.

Dies kann auf zwei Arten behoben werden:

**Sticky Sessions** (oder Session-Affinität): Konfigurieren Sie das ALB so, dass Anfragen vom selben Benutzer immer an denselben Server gesendet werden. Dies ist eine kurzfristige Lösung. Sie untergräbt das Load Balancing (einige Server erhalten mehr "sticky" Benutzer als andere) und verursacht Probleme, wenn eine Instanz beendet wird.

**Stateless Anwendungsdesign**: Speichern Sie Session-Daten extern – in einer Datenbank oder einem Cache wie ElastiCache (Kapitel 10). Jeder Server kann die Session eines Benutzers aus dem externen Speicher rekonstruieren. Server werden austauschbar. Dies ist der richtige Ansatz für horizontal skalierbare Anwendungen.

Priya nannte dies "die wichtigste architektonische Entscheidung, die Sie treffen, wenn Sie zu mehreren Servern wechseln." Sie hat Recht. Wir begegnen uns dem erneut in Kapitel 10.

**Arten von Load Balancern**

AWS bietet drei Arten von Load Balancern, die jeweils für unterschiedlichen Traffic geeignet sind:

**Application Load Balancer (ALB)**: HTTP- und HTTPS-Traffic. Schicht 7 (versteht HTTP). Kann basierend auf dem URL-Pfad (`/api` zu einer Gruppe, `/static` zu einer anderen), Host-Headern und Abfrageparametern routen. Dies wird von den meisten Webanwendungen verwendet.

**Network Load Balancer (NLB)**: TCP-, UDP- und TLS-Traffic. Schicht 4 (versteht HTTP nicht). Extrem hohe Leistung, Millionen von Anfragen pro Sekunde, sehr geringe Latenz. Verwenden Sie sie, wenn Sie Rohgeschwindigkeit benötigen oder wenn Sie nicht mit HTTP zu tun haben.

**Gateway Load Balancer (GWLB)**: Für das Routing von Traffic durch Drittanbieter-virtuelle Netzwerkgeräte (Firewalls, Intrusion Detection). Sie benötigen dies im Junior-Level selten.

Für Nimbus (und für die meisten Webanwendungen) ist der ALB die richtige Wahl.

## Stärken und Grenzen

**Warum ALB + Auto Scaling leistungsstark ist**:

-   Einfache Skalierung ohne Ausfallzeiten (Instanzen werden hinzugefügt/entfernt, ohne bestehende Verbindungen zu unterbrechen)
-   Automatische Failover (unhealthy Instanzen werden automatisch aus dem Traffic entfernt)
-   Kosteneffizienz (Sie zahlen nur für die laufenden Instanzen)
-   Kein Single Point of Failure – mehrere Instanzen über mehrere AZs verteilt

**Wo es kompliziert wird**:

-   Stateful Anwendungen erfordern besondere Behandlung (sticky Sessions oder externe Zustände)
-   Das Auslagern dauert – wenn ein Traffic-Spike plötzlich auftritt, gibt es eine Verzögerung, bis neue Instanzen bereit sind. Sie können dies mit geplantem Skalieren (Vor-Skalieren vor bekannten Ereignissen) oder einer größeren Mindestanzahl von Instanzen mildern
-   Mehr bewegliche Teile bedeuten mehr zu überwachen und zu debuggen
-   Einige Anwendungen lassen sich nicht einfach horizontal skalieren (Datenbanken, bestimmte Legacy-Systeme). Horizontale Skalierung funktioniert am besten für stateless Tier.

## Zusammenfassung

-   Horizontale Skalierung (das Hinzufügen von mehr Servern) wird gegenüber vertikaler Skalierung (das Vergrößern eines einzelnen Servers) bevorzugt, da sie Single Points of Failure eliminiert und eine elastische Kosten ermöglicht.
-   Ein **Application Load Balancer (ALB)** verteilt eingehenden HTTP/HTTPS-Traffic auf mehrere EC2-Targets. Er führt Health Checks durch und leitet nur zu gesunden Instanzen weiter.
-   Eine **Auto Scaling Group (ASG)** passt die Anzahl der EC2-Instanzen automatisch an, basierend auf definierten Skalierungsrichtlinien (z. B. Ziel-CPU-Auslastung).
-   ALB und ASG arbeiten zusammen: ASG verwaltet die Flotte, ALB verteilt den Traffic darüber.
-   Stateful Anwendungen müssen entweder Sticky Sessions verwenden (kurzfristige Lösung) oder den Zustand externisieren (korrekter langfristiger Entwurf).
-   Für HTTP-Traffic verwenden Sie ALB. Für Roh-TCP/UDP-Leistung verwenden Sie NLB.

## Examenstipps

*SAA-C03 Domain 2 — Task 2.1 (skalierbare Architekturen) / Domain 3 — Task 3.2*

- **ASG-Gesundheitsprüfungen können von EC2 oder dem ALB stammen.** EC2-Gesundheitsprüfungen erkennen nur, ob die Instanz ausgeführt wird. ALB-Gesundheitsprüfungen erkennen, ob die Anwendung korrekt antwortet. ALB-Gesundheitsprüfungen sind umfassender und sollten für Webanwendungen bevorzugt werden.
- **Zielverfolgung-Skalierung ist die häufigste Antwort auf Prüfungen** für Skalierungsrichtlinien. Einfache Skalierung (Hinzufügen von N Instanzen bei Alarmmeldung) ist älter und weniger adaptiv.
- **Skalierung nach oben ist schnell; Skalierung nach unten ist langsam.** AWS beendet Instanzen schrittweise während der Skalierung nach unten, um aktive Verbindungen nicht zu stören – ein Verhalten, das durch die Einstellung für die „Abmeldeverzögerung“ des ALB gesteuert wird.
- **Die minimale Instanzanzahl ist Ihr Widerstandsfähigkeitsschwellenwert.** Wenn Sie minimum = 1 festlegen und diese Instanz ausfällt, ist Ihre Anwendung vor der Reaktion der ASG ausgefallen. Legen Sie minimum ≥ 2 und verteilen Sie diese auf AZs für echte Widerstandsfähigkeit fest.
- **ALB kann den Datenverkehr automatisch über AZs verteilen.** Mit dem automatisch aktivierten Cross-Zone-Load-Balancing verteilt jeder ALB-Knoten Anfragen gleichmäßig auf alle registrierten Ziele, unabhängig von der AZ. Dies ist wichtig für eine ausgewogene Last, wenn die Instanzanzahl in den AZs unterschiedlich ist.

## Übungen

**Übung 1 – Erinnerung**

In Ihren eigenen Worten: Was ist der Unterschied zwischen einem Application Load Balancer und einer Auto Scaling Group? Welches Problem löst jede davon, und warum verwenden Sie sie typischerweise zusammen?

*(Hinweis: Einer verteilt bereits bestehenden Datenverkehr; die andere passt die verfügbare Kapazität an.)*

**Übung 2 – Prüfungsübung**

*Szenario*: Ein Einzelhandelsunternehmen erlebt mit seiner E-Commerce-Website stark schwankenden Datenverkehr: geringer Datenverkehr an Wochentagen, massive Spitzen an Wochenenden und bei Flash-Verkäufen. Sie möchten, dass ihre Anwendung Spitzenlasten bewältigt, ohne Kapazitäten während ruhiger Zeiten zu verschwenden. Die Anwendung speichert derzeit Sitzungsdaten im Arbeitsspeicher.

Welche architektonische Änderung würde ihre Skalierungsanforderungen BESTEHEN?

A) Upgrade auf eine einzelne sehr große EC2-Instanz, die Spitzenlasten bewältigen kann
B) Bereitstellung mehrerer EC2-Instanzen hinter einem ALB mit einer Auto Scaling Group und externer Speicherung von Sitzungsdaten in ElastiCache
C) Bereitstellung mehrerer EC2-Instanzen hinter einem ALB mit aktivierten Sticky Sessions
D) Manuelles Hinzufügen von EC2-Instanzen vor jedem erwarteten Datenverkehrsspitzen und deren anschließendes Beenden

*(Hinweis: „Ohne Aufrechterhaltung ungenutzter Kapazität“ bedeutet, dass Sie eine automatische Skalierung benötigen, nicht eine feste große Instanz oder manuelle Verwaltung.*

*(Hinweis: Die Sitzungsdaten im Arbeitsspeicher stellen ein Problem für Bereitstellungen mit mehreren Instanzen dar. Welche Optionen adressieren dies?)*

*(Hinweis: Option C verwendet Sticky Sessions – das ist ein Workaround, keine Lösung. Welche Option adressiert sowohl das Skalieren als auch das Sitzungsdatenproblem angemessen?)*

**Antwort:** B

**Erläuterung:** Ein ALB mit einer Auto Scaling Group bietet eine automatische, elastische Skalierung – Instanzen werden bei Spitzen hinzugefügt und bei Ruhigstellung entfernt. Die Verlagerung von Sitzungsdaten zu ElastiCache (einem externen Cache) macht die Anwendung zustandslos: Jede Instanz kann jede Benutzeranforderung bearbeiten, und der ALB kann den Datenverkehr frei verteilen. Dies ist die architektonisch korrekte Lösung.

**Warum nicht A?** Eine einzelne große Instanz, egal wie groß, ist immer noch ein Single Point of Failure. Sie verschwendet auch Geld während ruhiger Zeiten, wenn der Großteil ihrer Kapazität ungenutzt sitzt.

**Warum nicht C?** Sticky Sessions leiten einen Benutzer an dieselbe Instanz weiter, was das Sitzungs-Problem teilweise mindert, aber die Lastverteilung untergräbt. Wenn diese Instanz ausfällt (während der Skalierung nach unten oder bei einem Fehler), verliert der Benutzer seinen Sitzungsstatus trotzdem.

**Warum nicht D?** Manuelle Skalierung erfordert jemanden, der Spitzenlasten korrekt vorhersagt und im Voraus handelt. Sie ist langsam, fehleranfällig und arbeitsintensiv. Auto Scaling erledigt dies automatisch.

*SAA-C03 Bereich 2 – Aufgabe 2.1 / Bereich 3 – Aufgabe 3.2*

**Übung 3 – Architektur-Herausforderung** *(Optional)*

Nimbus hat eine große Werbekampagne: einen Rabatt von 50 % auf alle Bestellungen für 4 Stunden am nächsten Samstag. Letztes Jahr verursachte eine ähnliche Kampagne 10-fache normale Datenverkehrsmenge. Das Team erwartet, dass der Anstieg plötzlich und genau 4 Stunden dauert.

Auto Scaling wird schließlich reagieren, aber es gibt eine Verzögerung. Wie würden Sie für diesen bekannten Anstieg planen? Was ist der Unterschied zwischen reaktiver und proaktiver Skalierung, und wann macht jeder Ansatz Sinn?

*(Es gibt keine einzelne korrekte Antwort. Denken Sie über geplante Skalierungsaktionen, Pre-Warming und die Kostenimplikationen jedes Ansatzes nach.)*

## Post-Credits-Szene

Am ersten Freitag nach der Bereitstellung von Auto Scaling und dem ALB beobachteten das Team gemeinsam die Metriken.

7:15 Uhr: Zwei Instanzen laufen. Normaler Lastzustand.
7:45 Uhr: Die Last steigt. Auto Scaling startet zwei weitere Instanzen.
8:00 Uhr: Vier Instanzen bearbeiten die Spitze. Antwortzeiten stabil.
9:30 Uhr: Die Last sinkt. Auto Scaling beendet zwei Instanzen.
9:45 Uhr: Zurück zu zwei Instanzen.

Die Seite ist nicht ausgefallen. Nicht einmal.

Leo aktualisierte die Metriken-Seite dreimal, als ob er einen Fehler finden würde, den er übersehen hätte.

"Ist es merkwürdig, dass ich mich ein wenig enttäuscht fühle, weil nichts kaputt gegangen ist?" fragte er.

"Ja", sagte Priya.

Tom sah sich die Rechnung an. Die Kosten passten sich fast perfekt an den Datenverkehr an. "Wir haben für das bezahlt, was wir genutzt haben. Nicht mehr. Nicht weniger."

Er klang wirklich überrascht.

```markdown
Am nächsten Morgen fand Maya ein neues Problem in den Fehlerprotokollen. Nicht ein Ausfall – schlimmer.

"Unsere Datenbank", sagte sie, "liefert Abfragezeiten von durchschnittlich acht Sekunden."

Acht Sekunden. Für eine Restaurant-Bestell-App.

"Jedes Mal, wenn jemand das Menü lädt, fragen wir alle Elemente in der Datenbank ab, um die Seite zu erstellen", sagte Leo. "Und wir haben jetzt vierundvierzig Restaurants."

"Wie viele Menüpunkte insgesamt?" fragte Tom.

Leo führte die Abfrage aus.

"Ungefähr zwanzigtausend."

Schweigen.

Im nächsten Kapitel: die Datenbank, die keinen DBA benötigt – nur eine Kreditkarte.
```
