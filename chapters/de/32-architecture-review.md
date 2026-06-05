# Kapitel 32: Verteidigung des Plans

Mayas Frage am Ende von Kapitel 31: „Was ist der Unterschied zwischen der Treffen von architektonischen Entscheidungen und dem Denken wie ein Architekt?“

Sie hatte einen Gast eingeladen, um sie dabei zu unterstützen.

Sein Name war Carlos. Er war 20 Jahre lang Ingenieur, 7 Jahre Engineering Manager und 3 Jahre Startup-Berater. Er war die Art von Mensch, der genug Systeme gesehen hatte, die erfolgreich und gescheitert waren, um instinktive Einschätzungen sowohl für das eine als auch für das andere zu entwickeln.

Er erschien mit nichts: keine Folien, keine Agenda. Nur ein Whiteboard-Marker und eine Frage.

„Erzählen Sie mir etwas über Nimbus“, sagte er.

Eine gute Architekturprüfung ist wie eine Vorflugkontrolle für einen Piloten. Das Flugzeug mag perfekt bereit sein zu fliegen – Motoren laufen, Treibstoff voll, Passagiere an Bord. Aber die Kontrollliste existiert, weil erfahrene Piloten wissen, dass die Dinge, die am wahrscheinlichsten Probleme verursachen, genau die Dinge sind, die sich gerade dann noch gut anfühlen, bis sie es nicht tun. Die Kontrollliste bedeutet nicht, dass der Pilot nicht weiß, was er tut. Sie bedeutet, dass er gelernt hat, dass selbst Experten Dinge übersehen, wenn sie den strukturierten Prozess überspringen.

**Die Erste Bewegung des Architekten**

Was als nächstes geschah, überraschte das Team.

Maya begann, das System zu beschreiben – EC2-Instanzen, Aurora, CloudFront, ElastiCache, DynamoDB für das Menü, VPC mit privaten Subnetzen…

Carlos unterbrach sie sanft.

„Beginnen Sie mit dem Geschäft“, sagte er. „Nicht mit der Technologie.“

Sie zögerte. Dann: „Nimbus ist eine Restaurant-Bestellplattform. Wir haben 287 Restaurantpartner. Wir verarbeiten etwa 4.200 Bestellungen pro Tag. Der durchschnittliche Bestellwert beträgt 34 Dollar. Wir wachsen um 18 % pro Quartal.“

„Gut. Was ist das wichtigste, was Nimbus tun muss?“

„Bestellungen aufnehmen“, sagte Leo.

„Genauer gesagt“, drängte Carlos.

„Eine Bestellung muss innerhalb von fünf Sekunden nach der Bestellung beim Restaurant ankommen, andernfalls verpasst das Küchenteam den Zeitrahmen“, sagte Priya, „und der Kunde beschwert sich. Wir verlieren einen Restaurantpartner.“

„Also die 5-Sekunden-SLA“, sagte Carlos, „ist nicht ein technischer Zielwert. Es ist eine geschäftliche Überlebensanforderung.“

Stille.

„Das“, sagte er, „ist der Grund, warum Architekturgespräche mit geschäftlichen Anforderungen beginnen müssen. Die Technologie steht nach der Einschränkung.“

**Die Architekturprüfungsstruktur**

Eine echte Architekturprüfung – die Art, die Sie durchführen, bevor Sie etwas Wichtiges bauen oder wenn Sie bewerten, ob Sie skaliert werden sollen – hat eine Struktur.

Carlos schrieb sie auf das Whiteboard:

**1. Verstehen Sie die Einschränkungen**

Was muss wahr sein? Was darf nicht passieren? (Nicht „was wollen wir“. Was sind die nicht verhandelbaren Dinge?)

**2. Verstehen Sie die Unbekannten**

Was wissen wir nicht? Wo treffen wir Annahmen? Was passiert, wenn diese Annahmen falsch sind?

**3. Bewerten Sie die Optionen**

Welche realistischen Alternativen gibt es? Was sind die Vor- und Nachteile jeder Option?

**4. Identifizieren Sie Ausfallmodi**

Wie bricht das hier? Was ist die Ereignisfolge, wenn jeder Ausfallmodus ausgelöst wird?

**5. Validieren Sie die Überwachung**

Wie wissen Sie, dass etwas schief gelaufen ist? Bevor Benutzer es Ihnen mitteilen?

**6. Definieren Sie den Runbook**

Was tut man um 3 Uhr morgens, wenn das hier kaputt geht?

Dies ist keine Kontrollliste, die man mechanisch befolgen muss. Es ist ein Denkrahmen. Das Ziel ist es sicherzustellen, dass die wichtigen Fragen gestellt werden, *bevor* Sie in der Produktion sind.

**Die Durchführung der Prüfung: Nimbus’s Neue Funktion**

Carlos wurde speziell eingeladen, weil Nimbus etwas Neues bauen sollte.

**Die Funktion**: „Nimbus Instant“ – eine 15-minütige Liefergarantie. Wenn ein Partnerrestaurant mehr als einmal pro Woche den 15-Minuten-Zeitrahmen nicht einhält, würde Nimbus den Kunden automatisch zurückerstatten.

„Erzählen Sie mir, welche technischen Anforderungen es gibt“, sagte Carlos.

Priya begann. „Wir benötigen Echtzeit-Tracking von der Bestellaufnahme bis zur Lieferung. Wir müssen die tatsächliche Lieferzeit mit der 15-Minuten-SLA vergleichen. Wir müssen automatische Rückerstattungen auslösen.“

„Was ist die Latenzanforderung für die Tracking-Daten?“

„Nahe Echtzeit. Kunden sehen Statusaktualisierungen auf ihrem Telefon.“

„Wie lange?“

„Fünf Sekunden wahrscheinlich.“

„Wahrscheinlich?“

„Innerhalb von fünf Sekunden. Das ist die Produktanforderung.“

„Gut. Verwenden Sie Kinesis für den Ereignisstrom. Was ist der Ausfallmodus, wenn Kinesis verzögert?“

„Der Kunde erhält keine Statusaktualisierungen.“

„Ist das akzeptabel?“

„Für 10 Sekunden? Wahrscheinlich. Für 60 Sekunden? Nein.“

„Also was ist die SLA für das Tracking-System?“

Priya sah zu Leo. „Wir haben noch keine.“

Carlos schrieb auf das Brett: *Unbekannt: Tracking SLA.*

„Das ist wichtig“, sagte er. „Denn die SLA bestimmt das Infrastrukturdesign. Wenn Ihre SLA 5 Sekunden beträgt, benötigen Sie eine andere Lösung als wenn sie 60 Sekunden beträgt.“

**Die Fragen, die Architekten Stellen**

In den nächsten zwei Stunden führte Carlos das Team durch die Prüfung. Eine Auswahl seiner Fragen:

**Bezüglich der Datenspeicherung:**

„Wo wird der Bestellstatus während der Ausführung gespeichert? Wenn der Anwendung während der Lieferung abstürzt, welcher ist der Wiederherstellungsprozess? Kann der Zustand aus Ereignissen allein rekonstruiert werden?“

**Bezüglich des Rückerstattungsmechanismus:**

„Die Rückerstattung wird automatisch ausgelöst. Was verhindert, dass eine Rückerstattung zweimal ausgestellt wird? Was passiert, wenn der Zahlungsabwickler ausfällt und Sie sich nicht sicher sind, ob die Rückerstattung akzeptiert wurde?“

**Bezüglich des Lieferverfolgung:**

"Sie verlassen sich auf Kurier-GPS-Daten. Was passiert, wenn das GPS-Signal für 90 Sekunden verloren geht? Wie können Sie „GPS verloren“ von „Lieferung in Bearbeitung“ von „Lieferungsproblem“ unterscheiden?"

**Bei der Fehlerbehandlung:**

"Wenn der Rückerstattungsdienst ausfällt, geht die Bestellung trotzdem durch? Erhält der Kunde immer noch seine Lebensmittel? Wie ist die Benutzererfahrung bei einem teilweisen Systemausfall?"

**Bei der Beobachtbarkeit:**

"Wie erfahren Sie gerade, wie viele Bestellungen sich derzeit innerhalb von 5 Minuten vom 15-minütigen SLA befinden? Wenn diese Zahl ansteigt, wer wird benachrichtigt?"

Jede dieser Fragen deckte eine Annahme auf, die das Team gemacht hatte, ohne es zu merken.

"Wir hatten nicht darüber nachgedacht, das Problem mit der doppelten Rückerstattung zu lösen", sagte Leo später. "Wir wollten nur die Zahlung API aufrufen."

"Das ist nicht falsch", sagte Priya. "Aber Sie brauchen Idempotenz. Die Rückerstattungsoperation muss sicher aufzurufen sein, auch wenn sie zweimal aufgerufen wird."

"Ein Idempotenz-Schlüssel – eine eindeutige ID pro Rückerstattungsversuch, die vor dem Aufruf der Zahlung API in einer DB gespeichert wird. Wenn wir sie zweimal mit demselben Schlüssel aufrufen, ignoriert die Zahlung API den zweiten Aufruf."

"Das bedeutet", fügte Carlos hinzu, "dass Sie für Rückerstattungsoperationen einen persistenten Zustandspeicher benötigen, nicht nur ein Ereignis in einer Warteschlange."

Dies ist der Art von architektonischem Detail, das sich bei einer strukturierten Überprüfung ergibt – und oft nicht, wenn Sie nur etwas bauen.

**Die Entscheidungsaufzeichnung (Architecture Decision Record - ADR)**

Nach der Überprüfung empfahl Carlos dem Team, ihre Entscheidungen in **Architektur Entscheidungsaufzeichnungen (ADRs)** zu dokumentieren – kurze Dokumente, die:

- **Welche Entscheidung getroffen wurde**
- **Welche Alternativen in Betracht gezogen wurden**
- **Warum diese Entscheidung getroffen wurde (der Kontext und die Einschränkungen zu der Zeit)**
- **Welche Vor- und Nachteile es gibt**
- **Was dazu führen würde, dass wir diese Entscheidung überarbeiten**

"ADRs sind für Ihr zukünftiges Ich", sagte Carlos. "In 18 Monaten werden Sie sich über ein Architekturdetail wundern, warum es auf diese Weise gemacht wurde. Wenn Sie eine ADR haben, verstehen Sie den Kontext. Wenn Sie keine haben, werden Sie entweder nichts daran ändern (weil Sie Angst haben, es zu berühren) oder sie ändern (weil Sie nicht verstanden haben, warum sie auf diese Weise gemacht wurde)."

Leo schrieb am Nachmittag das erste ADR – die Entscheidung, Kinesis für die Lieferverfolgungsevents zu verwenden, mit dem Kontext, den in Betracht gezogenen Alternativen (SQS, EventBridge, Polling) und den Vor- und Nachteilen.

**Was macht einen Architekten?**

Am Ende der Sitzung fragte Maya Carlos die ursprüngliche Frage: "Was ist der Unterschied zwischen der Treffen von architektonischen Entscheidungen und dem Denken wie ein Architekt?"

Er dachte darüber nach.

"Ein Architekt weiß nicht mehr Technologie als ein Senior Engineer", sagte er. "Ein guter Architekt kennt wahrscheinlich ein bisschen weniger die neuesten Frameworks. Aber ein Architekt hat eine andere Standard-Fragenmenge."

"Was meinen Sie?"

"Wenn Sie ein Senior Engineer sind, der eine neue Funktion betrachtet, sind Ihre ersten Fragen wahrscheinlich: 'Was bauen wir? Wie funktioniert es? Welche Bibliothek ist dafür am besten?' Wenn ein Architekt dieselbe Funktion betrachtet, sind die ersten Fragen: 'Welches Problem löst diese Funktion? Was bricht zuerst, wenn der Traffic verdoppelt wird? Wie wissen wir, wann es sich verschlechtert? Wie ist die Benutzererfahrung, wenn der Zahlungsverarbeiter langsam ist?'"

"Der Architekt fragt nach dem System unter Stress", sagte Leo.

"Und über die Geschäftsfolge jeder Fehlfunktion", fügte Priya hinzu.

"Und", sagte Tom, "was passiert mit der Rechnung, wenn das skaliert wird."

Carlos nickte. "Alle sind bereits dabei. Sie haben es schon seit Kapitel 1 getan. Der Unterschied zwischen einem Senior Engineer und einem Architekten ist keine Zertifizierung oder ein Titel. Es ist eine Gewohnheit, die nächste Frage zu stellen – die, die Ihnen noch nicht eingefallen ist."

## Stärken und Grenzen

**Architekturüberprüfungen:**

- Erkennen Fehlerzustände, bevor sie in Produktion sind
- Schaffen ein gemeinsames Verständnis zwischen Teammitgliedern, die oft fragmentierte Kenntnisse haben
- Generieren Dokumentation (ADRs), die sich über Jahre hinweg auszahlt
- Verlangsamen Entscheidungsprozesse auf förderliche Weise – „schnell bauen“ ohne Überprüfung ist „schnell bauen und in die Wand treffen, die Sie nicht gesehen haben“

**Wo es kompliziert wird:**

- Erfordert jemanden, der geschickt genug ist, um die richtigen Fragen zu stellen – die Überprüfung ist nur so gut wie der Prüfer
- Kann bürokratisch werden, wenn es als Checkbox anstelle einer Konversation behandelt wird
- Einige architektonische Entscheidungen brauchen keine vollständige Überprüfung – zu wissen, welche es sind, ist selbst eine architektonische Fähigkeit
- Die Ausgabe (ADRs, Diagramme, Entscheidungsprotokolle) muss mit der Entwicklung des Systems synchronisiert werden

Im nächsten Kapitel: die nützlichste, frustrierendste und ehrlichste Antwort in der gesamten Softwareentwicklung.

## Zusammenfassung

- Architekturüberprüfungen beginnen mit **Geschäftsanforderungen, nicht mit Technologie**.
- Die Überprüfungstruktur: Einschränkungen → Unbekannte → Optionen → Ausfallmodi → Überwachung → Bedienungsanleitungen.
- Architekten stellen Fragen: Was bricht zuerst? Wie wissen wir, dass es sich verschlechtert? Wie ist die Benutzererfahrung während eines Ausfalls? Wie hoch sind die Kosten bei Skalierung?
- **Architektur Entscheidungsprotokolle (ADRs)** erfassen, was entschieden wurde, warum und was die Wiedererwägung auslösen würde.
- Das Denken wie ein Architekt ist eine Gewohnheit: Stellen Sie die nächste Frage, insbesondere zu Ausfallmodi, Geschäftskonsequenzen und Skaleneffizienz.
- Der Unterschied zwischen Entscheidungen treffen und ein Architekt sein, ist der Standard-Fragenkatalog: Architekten gehen standardmäßig von Systemebene und Ausfallfragen aus, nicht nur von Implementierungsfragen.

## Prüfungstipps

*SAA-C03 Domäne: Interdomänen – architektonische Argumentation*

Dieses Kapitel ist weniger über spezifische Prüfungsgegenstände und mehr über die Denkweise, die die Prüfung testet.

- **SAA-C03 Szenarien** beschreiben fast immer zuerst eine geschäftliche Einschränkung ("das Unternehmen kann nicht mehr als 1 Stunde Ausfallzeit sich leisten") und bitten Sie, die Architektur zu wählen, die diese erfüllt. Üben Sie, geschäftliche Einschränkungen in technische Anforderungen zu übersetzen.
- **Ausfallmodusthinking**: Viele Prüfungsfragen beschreiben ein System und fragen, was passiert, wenn ein Baustein ausfällt. Üben Sie, "was bricht zuerst?" für die Ihnen begegnenden Architekturen zu fragen.
- **Trade-off-Denken**: Die Prüfung hat selten eine "perfekte" Antwort. Sie fordert Sie auf, die *beste* Antwort zu geben, gegeben einem Satz von Einschränkungen. Werden Sie mit der Gewohnheit vertraut, dass diese Option korrekt ist, wenn diese spezifischen Anforderungen erfüllt sind, auch wenn eine andere Option unter anderen Anforderungen besser wäre.
- **Idempotenz**: Das Double-Refund-Problem ist eine echte Herausforderung für verteilte Systeme. Idempotenzschlüssel (einzigartig pro Operation, vor der Ausführung geprüft) sind die Standardlösung. Machen Sie sich mit diesem Muster vertraut.
- **Architektur Entscheidungsprotokolle**: Nicht ein AWS-Dienst, sondern eine Best Practice, die den Säulenpunkt "Operational Excellence" des Well-Architected Frameworks widerspiegelt.

## Übungen

**Übung 1 – Erinnerung**

Carlos stellte sechs Arten von Fragen während der Architekturüberprüfung. Können Sie die sechs Bereiche rekonstruieren, ohne sich das Kapitel anzusehen?

*(Hinweis: Sie sind in der "Architekturüberprüfungsstruktur" Abschnitt aufgeführt. Versuchen Sie, sich die Bereiche aus dem Gedächtnis zu erinnern – die bloße Versuchsleistung, sich etwas zu merken (auch wenn Sie scheitern) stärkt die Langzeitgesinnung.)*

**Übung 2 – Prüfungsübung**

*Szenario*: Ein Unternehmen baut ein Echtzeit-Angebotssystem für Online-Werbung. Angebote müssen innerhalb von 100 Millisekunden bewertet und beantwortet werden. Das System verarbeitet 1 Million Angebote pro Sekunde während der Spitzenlast. Wenn das Angebotssystem ausfällt, verliert das Unternehmen Einnahmen aus Werbung. Das Datenbankteam des Unternehmens schlägt vor, RDS Aurora mit 10 Leserepliken zu verwenden. Der Architekt muss dieses Angebot bewerten.

Welches Problem sollte der Architekt ZUERST ansprechen?

A) Die Kosten von 10 Aurora Leserepliken sind für das Budget zu hoch.
B) Aurora Leserepliken haben eine Replikationsverzögerung, die zu Inkonsistenzen führen kann.
C) Aurora's typische Abfrage-Latenz von 1-5ms entspricht möglicherweise nicht der 100ms Antwort-SLA.
D) RDS Aurora unterstützt die Transaktionsvolumina von 1 Million Anfragen pro Sekunde bei dieser Latenzanforderung.

**Hinweis 1**: Die primäre Einschränkung ist 100ms Gesamt-Antwortzeit bei 1 Million Anfragen/Sekunde. Welches dieser Probleme bedroht direkt die Erfüllung dieser Einschränkung?

**Hinweis 2**: Aurora Abfrage-Latenz liegt typischerweise bei 1-5ms – akzeptabel für die meisten Anwendungsfälle. Inkonsistenzen sind real, aber sekundär zur Machbarkeit.

**Hinweis 3**: Aurora kann hohe IOPS verarbeiten, aber 1 Million Anfragen pro Sekunde ist ein außergewöhnliches Volumen. Was passiert mit der Architektur bei dieser Skalierung?

**Antwort**: D

**Erläuterung**: Während Aurora leistungsstark ist, ist 1 Million Anfragen pro Sekunde bei 100ms Gesamt-Antwortzeit ein extremes Anforderungsszenario. Der Architekt sollte zuerst hinterfragen, ob Aurora (oder jede relationale Datenbank) als primäres Lookup-System bei dieser Skalierung und Latenz fungieren kann. Systeme wie dieses verwenden typischerweise In-Memory-Datenspeicher (Redis) oder spezialisierte Datenbanken mit geringer Latenz, nicht relationale Datenbanken mit vollständiger SQL-Semantik. Die 100ms SLA ist für Aurora-Abfragen allein erreichbar, aber die Kombination aus 1M RPS und 100ms Gesamt-SLA überschreitet typische Aurora-Durchsatzmerkmale.

**Warum nicht A?** Kosten sind ein valider Punkt, aber die erste Sorge sollte sein, ob die Architektur technisch machbar ist, wenn die Anforderungen erfüllt sind.

**Warum nicht B?** Replikationsverzögerung in Aurora Leserepliken liegt typischerweise unter 100ms – akzeptabel für die meisten Anwendungsfälle. Inkonsistenzen sind real, aber sekundär zur Machbarkeit.

**Warum nicht C?** Aurora Latenz von 1-5ms liegt gut innerhalb der 100ms SLA für die Datenbank-Abfrage-Komponente. Dies ist nicht die Hauptsorge.

*SAA-C03 Domäne: Interdomänen – Systemdesign*

**Übung 3 – Architektur-Herausforderung** *(Optional)*

Wenden Sie die Architekturüberprüfungsstruktur auf ein reales oder hypothetisches System an:

```markdown
Ein Startup möchte ein Echtzeit-Multiplayer-Quizspiel entwickeln. Spieler treten in Spielzimmern (bis zu 10 Spielern pro Raum) an. In jeder Runde wird eine Frage für 15 Sekunden angezeigt; alle Spieler beantworten gleichzeitig. Die Ergebnisse werden unmittelbar nach jeder Runde ausgewertet. Die Spiele dauern 10 Runden. Spitzenlast: 50.000 gleichzeitige Spiele.

Gehen Sie die sechsstufige Überprüfung durch:

1.  Was sind die nicht verhandelbaren Einschränkungen?
2.  Was sind die Unbekannten und Annahmen?
3.  Welche realistischen Technologieoptionen gibt es?
4.  Welche Ausfallmoden sind zu erwarten?
5.  Wie wissen Sie, wann es zu einer Verschlechterung kommt?
6.  Wie sieht der 3-Uhr-nachts-Runbook aus?

*(Es gibt keine einzige richtige Antwort. Das Ziel ist es, die Überprüfungsstruktur als Denkwerkzeug zu üben.)*

## Post-Credits Szene

Carlos verließ das Büro um 18:00 Uhr.

Das Team saß danach eine Weile, ohne etwas zu tun.

"Ich habe in diesen zwei Stunden mehr gelernt, als in jedem einzelnen AWS-Dienst-Kapitel", sagte Leo.

"Das liegt daran, dass diese Kapitel über Werkzeuge waren", sagte Maya. "Dies war über Urteilsvermögen."

"Ist Urteilsvermögen erlernbar?" fragte er.

"Ja", sagte Priya. "Aber nicht durch Lesen. Durch Übung. Durch das Treffen von Entscheidungen, zu sehen, was kaputt geht, darüber nachzudenken, warum."

"Durch Erfahrung", sagte Tom.

"Durch strukturierte Erfahrung", korrigierte Priya. "Erfahrung ohne Reflexion baut kein Urteilsvermögen auf. Man muss die Fragen nach dem Ablesen stellen."

Maya sah auf das Whiteboard. Die Überprüfungshinweise waren noch da – Einschränkungen, Unbekannte, Ausfallmoden, Überwachungsfragen. Es füllte zwei Whiteboards.

"Das sollte in den ADR", sagte sie.

Leo tippte bereits.

Im letzten Kapitel: die eine Sache, die kein Werkzeug oder Framework geben kann – und warum "Es hängt darauf an" die ehrlichste und mächtigste Antwort in der Softwarearchitektur ist.
```
