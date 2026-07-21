\newpage

*Copyright © 2026 AI(2)M(2)IA*

*Dieses Buch ist kostenlos. Es steht Ihnen frei, es zu lesen, zu kopieren, zu übersetzen, anzupassen und zu teilen — in jeder Sprache und in jedem Format — kostenlos, unter der Lizenz Creative Commons Namensnennung-Nicht kommerziell-Weitergabe unter gleichen Bedingungen 4.0 International (CC BY-NC-SA 4.0).*

*Klar gesagt: Sie dürfen dieses Buch oder etwas daraus Erstelltes nicht verkaufen und nicht hinter eine Bezahlschranke stellen — der Zugang muss stets kostenlos bleiben. Sie dürfen um freiwillige Unterstützung für Ihre Arbeit bitten, aber diese Unterstützung darf niemals Bedingung für das Lesen sein.*

*Beispiel: Wenn Sie dieses Buch ins Esperanto übersetzen und Ihre Version veröffentlichen, dürfen Sie die Leser um einen Beitrag bitten — aber jeder muss Ihre Übersetzung lesen können, ohne zu zahlen. Wenn Sie ein neues Repository anlegen und darauf einen neuen Lernleitfaden aufbauen, gilt dieselbe Regel: Spenden ja; ein Preis für den Zugang nein.*

*Der Autor behält das Recht, eigene Ausgaben zu verkaufen — zum Beispiel die Kindle-Ausgabe bei Amazon, deren Kauf das nächste Buch finanziert.*

*Dieses Buch hat kostenlose Begleiter. Lesen, übersetzen oder verbessern Sie die Quelle im Repository: https://github.com/AI2M2IA/book-lets-build-on-aws-together. Lernen Sie kostenlos mit der Begleit-App (einem Spiel): https://ai2m2ia.github.io/book-lets-build-on-aws-together. Sehen Sie die Videos: https://www.youtube.com/playlist?list=PL9jytbqPPUEgTdZvVIdHxtXahX8922oYN. Vollständige Bedingungen: LICENSE-CONTENT (der Buchtext, CC BY-NC-SA 4.0) und LICENSE (der Code, AGPL-3.0).*

*Die Geschichte von Nimbus und seinen Figuren ist fiktiv. Jede Ähnlichkeit mit tatsächlichen Personen, lebend oder verstorben, oder tatsächlichen Ereignissen ist rein zufällig.*

*Die in diesem Buch beschriebenen AWS-Dienste, Preismodelle, bewährten Methoden und Prüfungsinhalte basieren auf öffentlich zugänglicher Dokumentation zum Zeitpunkt der Veröffentlichung. Amazon Web Services, AWS und verwandte Kennzeichnungen sind Marken von Amazon.com, Inc. oder seinen Tochtergesellschaften. Dieses Buch ist eine unabhängige Bildungsressource und steht in keiner Verbindung zu Amazon Web Services, wird von Amazon Web Services weder befürwortet noch gesponsert.*

*AWS-Preise und Dienstfunktionen ändern sich häufig. Überprüfen Sie stets aktuelle Informationen auf aws.amazon.com, bevor Sie architektonische oder finanzielle Entscheidungen treffen.*

*Die AWS Solutions Architect Associate (SAA-C03) Prüfung ist eine echte Zertifizierungsprüfung. Besuchen Sie aws.amazon.com/certification zur Anmeldung.*

*Erste Ausgabe, 2026*

*Gedruckt und vertrieben über Amazon KDP*

---

\newpage

# Eine Anmerkung zur Methode

Dieses Buch wurde mit KI-Unterstützung verfasst und unter dem Pseudonym AI(2)M(2)IA veröffentlicht — entsprechend der Praxis aller Bände in dieser Reihe.

Der Lehrplan, dem Sie folgen werden — sein Ansatz, seine Figuren, die Gestalt von Nimbus' Infrastruktur vom Restauranttelefon bis zur produktionsreifen AWS-Architektur, die Kompromisse, die das Team unter Druck eingeht, und jene, die sie zunächst falsch treffen — all das wurde von einem menschlichen Autor gewählt und, Dienst für Dienst, in einer langen Zusammenarbeit mit einem großen Sprachmodell ausgearbeitet. Das Cover wurde mit Hilfe eines Bildgenerierungsmodells unter derselben Leitung gestaltet. Das E-Book selbst wurde durch automatisierte Werkzeuge erstellt.

Was Sie lesen, ist das, was behalten wurde.

Auf diesen Seiten wird weder unangeleitetes Urheberschaft beansprucht, noch dass die Maschine allein der Autor sei. Das Werk — wie die Infrastruktur, die es beschreibt — wird durch Schichten getragen, die voneinander abhängen.

---

\newpage

*Für alle, die einen Browser geöffnet, einen Befehl eingegeben und etwas zum Laufen gebracht haben —
und für alle, die einen Browser geöffnet, einen Befehl eingegeben und aus dem gelernt haben,
was nicht funktionierte.*

---

\newpage

# Vorwort

Sie haben wahrscheinlich schon einmal versucht, AWS zu lernen.

Vielleicht haben Sie die Dokumentation geöffnet und sich zehn Minuten später dabei ertappt, auf die IAM-Policy-Syntax zu starren, bevor Sie überhaupt verstanden hatten, wofür IAM gut ist.

Vielleicht haben Sie einen Video-Kurs abgeschlossen und festgestellt, dass Sie immer noch nicht erklären konnten, wo eine Website eigentlich liegt.

Vielleicht haben Sie einen Prüfungsleitfaden mit Markierungen versehen, Dienstnamen auswendig gelernt und wurden dann das erste Mal von einer Szenariofrage überrumpelt, die fragte, was Sie tun würden, wenn eine Datenbank während der Abendspitze ausfällt.

Das ist nicht Ihre Schuld.

So wird Cloud-Computing normalerweise gelehrt: erst als Katalog, dann als System.

Dieses Buch funktioniert anders.

**Sie werden AWS nicht studieren. Sie werden es nutzen.**

Wir beginnen mit einem Restaurant, das Bestellungen verliert, weil die Telefonleitung besetzt ist und es keine Website gibt.

Von dort aus werden Sie Maya, Tom, Priya und Leo begleiten, wie sie die Infrastruktur von Nimbus eine Entscheidung nach der anderen aufbauen. Nicht in der ordentlichen Reihenfolge, die ein Zertifizierungslehrplan bevorzugen würde, sondern in der unordentlichen Reihenfolge, die echte Systeme erfordern.

Am Ende wird Nimbus täglich 18.000 Bestellungen abwickeln: verteilt über mehrere Availability Zones, automatisch nach Ausfällen wiederhergestellt, West-Coast-Nutzern in Millisekunden über ein Content-Delivery-Netzwerk bereitgestellt, jede Bestellung durch eine Echtzeit-Analyse-Pipeline verarbeitet und die Kosten unter Kontrolle gehalten, während die Architektur mit dem Unternehmen wächst.

Jeder AWS-Dienst in diesem Buch erscheint in dem Moment, in dem er notwendig wird. Nicht weil ein Lehrplan es fordert. Weil das System es tut.

**Für wen dieses Buch ist** Wenn Sie durch Probleme besser lernen als durch Dokumentation, wurde dieses Buch für Sie geschrieben. Wenn Sie sich auf die AWS Solutions Architect Associate-Zertifizierung (SAA-C03) vorbereiten, ist dieses Buch ebenfalls für Sie: Jede Prüfungsdomäne wird abgedeckt, und jedes Kapitel endet mit Prüfungstipps und SAA-C03-ähnlichen Übungsaufgaben. Wenn Sie bereits im Ingenieurswesen tätig sind und verstehen möchten, *warum* die architektonischen Entscheidungen funktionieren — nicht nur, wie die Dienste heißen —, finden Sie diese Begründungen auf jeder Seite.

**Was Sie hier nicht finden werden** Eine Abkürzung. Dies ist kein Lernleitfaden für die schnelle Prüfungsvorbereitung. Er ist länger als ein solcher, weil Verstehen länger dauert als Auswendiglernen — und es das Verstehen ist, das auf Ihre nächste Stelle, Ihr nächstes System und den Produktionsvorfall übergeht, der nie richtig dokumentiert wurde.

**Wie Sie dieses Buch lesen sollten** Lesen Sie es beim ersten Durchgang wie einen Roman. Lassen Sie die Architektur sich offenbaren, während das Team auf echte Probleme stößt und echte Kompromisse schließt. Halten Sie am Ende jedes Kapitels inne und nutzen Sie die Prüfungstipps und Übungen aktiv: Decken Sie die Antworten ab, denken Sie das Szenario selbst durch, und überprüfen Sie erst dann, was passiert ist.

Wenn Sie fertig sind, ist Nimbus in Produktion. Ihr Verständnis von AWS ebenfalls.

Fangen wir an.
