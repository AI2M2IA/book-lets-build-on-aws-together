# Kapitel 27: Bezahlen für das, was Sie brauchen

Tom kochte sich einen Kaffee, bevor er den Abrechnungs-Tab öffnete. Das tat er immer – manche Berichte ließen sich besser warm angehen. Er setzte sich in den Sessel am Fenster, die Tasse in der Hand, der Samstagmorgen draußen noch ruhig. Keine Pings, keine Standups. Nur die Tabelle und die Zahlen.

Er öffnete den Tab.

**Rückblick: Von Athenas Erkenntnis zur Rechnung**

Die Athena-Analysen des vorigen Kapitels hatten etwas Unerwartetes bewirkt: Indem Tom die Kosten- und Nutzungsberichte direkt aus S3 abfragte, konnte er endlich nicht nur eine AWS-Gesamtrechnung sehen, sondern eine Aufschlüsselung dessen, was jeder Dienst tatsächlich kostete – Woche für Woche, über sechs Monate hinweg. Das Bild, das sich abzeichnete, war klar genug, um beunruhigend zu sein. EC2 war der größte Einzelposten, und das Muster war unverkennbar – das Team hatte Laufkundschaftspreise für ein Hotel gezahlt, in dem es rund um die Uhr wohnte. Diese Erkenntnis brachte Tom an einem Samstagmorgen mit einer frischen Tasse Kaffee auf die EC2-Preisseite, fest entschlossen, jede Option zu verstehen, bevor die nächste Monatsrechnung eintraf.

Tom hatte die AWS-Rechnung seit der Gründung von Nimbus jeden Monat überprüft. Im ersten Jahr verstand er grob 60 % dessen, was er sah. Inzwischen verstand er fast alles – außer warum ihm der EC2-Abschnitt jedes Mal das Gefühl gab, dass sie zu viel bezahlten. Der EC2-Abschnitt war eine Mischung aus „On-Demand-Instanzen“ in verschiedenen Instanztypen, alle pro Stunde abgerechnet, die zusammen 2.340 $/Monat ausmachten.

Bevor er jemanden anrief, ging er eine Stunde lang die Instanzliste selbst durch – nicht um etwas zu schließen, sondern um Annahmen zu bilden, die er prüfen konnte.

Er sah vier r6g.large-Instanzen mit dem Tag „api-prod“. Er sah zwei c6g.medium-Instanzen, die die Hintergrund-Job-Prozessoren betrieben. Er sah eine t3.medium mit der Bezeichnung „vpn-server“, die seit dem dritten Monat des Bestehens des Unternehmens lief. Er sah ein Paar Instanzen mit dem Tag „analytics-batch“, die jede Nacht um 3 Uhr morgens auftauchten und vor 7 Uhr wieder verschwanden.

Er notierte eine Spalte mit Annahmen:

- API-Server: vorhersehbar, immer in Betrieb.
- Hintergrundprozessoren: vermutlich vorhersehbar.
- VPN-Server: immer in Betrieb, ändert sich nie.
- Batch-Analysen: vielleicht Spot-tauglich?

Dann schrieb er an den Rand: *jede einzelne prüfen, bevor irgendetwas entschieden wird.*

Diese Disziplin – „was ich annehme“ von „was ich weiß“ zu trennen – war es, die Toms Kostenüberprüfungen nützlich machte. Er rief die anderen an.

„Wir könnten einfach weiter die Laufkundschaftsrate zahlen“, sagte Tom, als die anderen der Telefonkonferenz beitraten. „Aber das werden wir nicht.“

„Die Laufkundschaftsrate?“, fragte Leo.

„On-Demand-Preise“, sagte Tom. „Es ist, als würde man ein Hotelzimmer am Morgen buchen, an dem man es braucht. Maximale Flexibilität. Maximaler Preis.“

„Was ist die Alternative?“

**Die Hotel-Analogie**

Tom überlegte einen Moment. „Du kennst das, manche Leute buchen ein Hotelzimmer am Morgen ihrer Ankunft. Das sind wir gerade. Es gibt bessere Strategien – sechs Monate im Voraus buchen und einen Rabatt bekommen, in letzter Minute ein unverkauftes Zimmer zu einem Schnäppchenpreis nehmen oder die ganze Etage mieten, wenn man die ganze Etage braucht. Dasselbe Hotel, vier verschiedene Preise.“

Leo sah ihn an. „Und die AWS-Versionen davon sind?“

Tom rief die EC2-Preisseite auf. „Es gibt vier Preismodelle. Und wir nutzen nur eines.“

Die EC2-Preise lassen sich überraschend gut auf Hotelzimmer-Buchungsstrategien abbilden:

**On-Demand**: Man geht ohne Reservierung zur Rezeption. Man zahlt den vollen Listenpreis, kann aber jederzeit auschecken. Perfekt für unvorhersehbare Aufenthalte.

**Reserved Instances/Savings Plans**: Man bucht ein Zimmer für das ganze Jahr im Voraus. Man erhält einen erheblichen Rabatt – 30–72 % – im Austausch für die Verpflichtung, es zu nutzen.

**Spot Instances**: Man nimmt ein unverkauftes Zimmer zum stark reduzierten Tagespreis des Hotels – kein Feilschen, das Hotel legt den Preis danach fest, wie leer es ist. Bis zu 90 % Rabatt. Aber das Hotel kann Sie mit zwei Minuten Vorlauf bitten zu gehen, wenn es das Zimmer für einen zahlenden Vollpreis-Gast braucht. (Vor Jahren musste man auf Spot-Kapazität *bieten*; AWS hat das Bieten 2017 abgeschafft – man zahlt einfach den aktuellen Spot-Preis.)

**Dedicated Hosts**: Man mietet die gesamte Etage des Hotels exklusiv für sich. Keine gemeinsame Nutzung mit anderen Gästen. Deutlich teurer. Erforderlich, wenn Softwarelizenzierung oder Compliance-Regeln die gemeinsame Nutzung eines physischen Hosts verbieten.

Jedes Modell hat einen Anwendungsfall. Der Fehler, den Nimbus machte: On-Demand für alles zu verwenden, einschließlich Arbeitslasten, die rund um die Uhr liefen und völlig vorhersehbar waren.

**On-Demand-Instanzen: Maximale Flexibilität, maximale Kosten**

**Wann zu verwenden**:

- Unvorhersehbare Arbeitslasten (Traffic-Spitzen, die Sie nicht prognostizieren können)
- Entwicklung und Tests (häufiges Starten und Stoppen)
- Kurzfristige Arbeitslasten (ein Experiment eine Woche lang laufen lassen)
- Erste Bereitstellung (bevor Sie Ihre Nutzungsmuster verstehen)

**Wann nicht zu verwenden**:

- Steady-State-Produktionslasten, von denen Sie wissen, dass sie länger als ein Jahr laufen werden
- Alles mit einer vorhersehbaren Basislast

**EC2-Hibernation: Pausieren ohne Statusverlust**

Eine Kostenoptimierungstechnik, die zu wenig Aufmerksamkeit bekommt, ist die **EC2-Hibernation**. Wenn Sie eine normale Instanz stoppen, ist der Inhalt des Arbeitsspeichers weg – der nächste Start ist ein Kaltstart. Das Betriebssystem bootet, die Anwendung initialisiert sich, Datenbankverbindungen werden neu aufgebaut. Für die meisten Produktions-Webserver ist das in Ordnung. Für bestimmte Arbeitslasten ist es teuer.

Wenn Sie eine Instanz in den Ruhezustand versetzen, wird der RAM-Inhalt vor dem Herunterfahren auf dem EBS-Root-Volume gespeichert. Beim nächsten Start setzt die Instanz genau dort fort, wo sie aufgehört hat – Prozesse laufen, Verbindungen sind aufgebaut, der Anwendungszustand ist intakt – in einem Bruchteil der Zeit, die ein Kaltstart benötigen würde. Das ist besonders nützlich für lang laufende Analysejobs, die Sie über Nacht pausieren möchten, ohne den Zustand zu verlieren, oder für Entwicklungsinstanzen, die mehrere Minuten brauchen, um zu booten und ihre Umgebung zu konfigurieren.

„Ich habe eine Data-Science-Instanz“, sagte Leo und blickte auf den Ausdruck. „Sie braucht neun Minuten zum Hochfahren. Maßgeschneiderte Umgebung, ein Dutzend Python-Pakete, einige vorgeladene Modellgewichte. Ich stoppe sie jeden Abend und starte sie jeden Morgen neu.“

„Du verbringst also jeden Tag neun Minuten damit, ihr beim Booten zuzusehen“, sagte Tom.

„Ja.“

„Das sind 45 Minuten Engineering-Zeit pro Woche, in denen man auf eine EC2-Instanz wartet.“

„Ja.“

„Versetz sie in den Ruhezustand.“

Mit der Hibernation pausierte Leos Instanz am Ende des Tages, speicherte ihren RAM auf dem EBS-Root-Volume und nahm am nächsten Morgen in unter 90 Sekunden den Betrieb wieder auf. Die Analysesitzungen liefen genau dort weiter, wo er aufgehört hatte.

Anforderungen an die Hibernation: Die Hibernation muss **beim Start aktiviert** werden – Sie können sie nicht für eine bereits laufende Instanz einschalten (Leo musste seine Data-Science-Box von einem AMI neu starten, um sie zu bekommen). Instanzen dürfen RAM bis zu 150 GB haben (der RAM-Inhalt muss auf das EBS-Root-Volume passen), das Root-Volume muss groß genug sein, um sowohl das Betriebssystem als auch den RAM-Dump aufzunehmen, und das Root-Volume muss verschlüsselt sein (die Hibernation speichert sensible Daten aus dem Arbeitsspeicher auf der Festplatte). Bare-Metal-Instanzen und Instanzen mit mehr als 150 GB RAM unterstützen keine Hibernation. Eine weitere Einschränkung: Eine Instanz kann höchstens **60 Tage** im Ruhezustand bleiben – danach muss sie gestartet, gestoppt oder beendet werden; sie kann nicht unbegrenzt schlafen.

Tom identifizierte die On-Demand-Instanzen von Nimbus:

- Web-API-Server: 4 EC2-Instanzen, seit 18 Monaten rund um die Uhr in Betrieb. *Vorhersehbare Basislast.*
- VPN-Server: Immer in Betrieb. *Vorhersehbare Basislast.*
- Zusätzliche API-Server für Traffic-Spitzen: Unvorhersehbar. *On-Demand ist hier korrekt.*

„Moment – aber *warum* würden die Spitzenlast-Server On-Demand bleiben?“, fragte Maya. „Wenn wir jeden Freitag Spitzen haben, ist das nicht vorhersehbar genug, um uns zu verpflichten?“

Tom überlegte. „Die Basislast ist vorhersehbar. Die Spitze ist im Timing vorhersehbar, aber nicht in der Höhe. An manchen Freitagabenden liegen wir 30 % über dem Normalwert, an anderen 150 %. Wenn ich Reserved-Kapazität für sechs Instanzen kaufe und eine Spitze nur zwei zusätzliche braucht, habe ich mich übermäßig verpflichtet. Wenn ich für zwei kaufe und die Spitze acht braucht, fehlt mir Kapazität, und der Überlauf läuft ohnehin On-Demand. Speziell für die Burst-Kapazität ist On-Demand oder Spot korrekt – man kann keine Reserved Instance in Echtzeit kaufen, wenn der Traffic zu steigen beginnt.“

Es gibt einen Grund, warum die „Wann nicht zu verwenden“-Liste wichtig ist: Wenn Sie dieselben Instanzen seit sechs Monaten betreiben und vorhersagen können, dass sie weiterlaufen werden, ist jeder Monat auf On-Demand ein Monat, in dem Sie die Laufkundschaftsrate für ein Zimmer zahlen, das Sie dauerhaft belegen.

**Reserved Instances: Die einjährige Verpflichtung**

**Reserved Instances (RIs)** sind eine Abrechnungsverpflichtung – Sie vereinbaren, einen bestimmten Instanztyp in einer bestimmten Region für 1 oder 3 Jahre zu nutzen. Im Gegenzug berechnet AWS einen niedrigeren Stundensatz.

**Rabattstufen**:

- 1 Jahr, keine Vorauszahlung: ~30–40 % Rabatt gegenüber On-Demand
- 1 Jahr, teilweise Vorauszahlung: ~35–45 % Rabatt (etwas jetzt zahlen, weniger pro Stunde)
- 1 Jahr, vollständige Vorauszahlung: ~40–50 % Rabatt (das ganze Jahr jetzt zahlen)
- 3 Jahre, vollständige Vorauszahlung: ~55–72 % Rabatt (maximaler Rabatt, maximale Verpflichtung)

**Standard vs. Convertible RIs**:

- **Standard**: Festgelegt auf den exakten Instanztyp und die Region. Kann auf dem Reserved Instance Marketplace verkauft werden, wenn Sie ihn nicht mehr benötigen.
- **Convertible**: Kann während des Verpflichtungszeitraums Instanztyp, Betriebssystem und Mandantenmodell ändern. Weniger Rabatt als Standard (bis zu ~66 % gegenüber 72 %).

Tom rechnete für die 4 API-Server (r6g.large, etwa 0,101 $/Stunde On-Demand):

- Jährliche On-Demand-Kosten: 0,101 $ × 24 × 365 × 4 ≈ 3.540 $
- 1-Jahres-RI mit vollständiger Vorauszahlung (1 Instanz): ~520 $ im Voraus (≈41 % Rabatt)
- 4 Instanzen: ~2.080 $ im Voraus = **etwa 1.460 $ Ersparnis im ersten Jahr**

„Wir könnten allein durch die Verpflichtung im ersten Jahr fast eintausendfünfhundert Dollar sparen“, sagte Tom. „Wie viel kostet das genau pro Monat – jede reservierte Instanz im Vergleich zu dem, was wir jetzt zahlen?“

„Es ist vorab belastet“, sagte Maya. „Man zahlt das ganze Jahr im Voraus.“

„Moment – aber *warum* würden wir uns auf die Standard-RI festlegen, wenn sich die Instanztypen noch weiterentwickeln?“, fragte Maya. „Was, wenn r6g nächstes Jahr veraltet ist?“

„Wir nehmen Convertible RIs, wenn wir glauben, dass wir etwas ändern müssen. Weniger Rabatt – bis zu ~66 % statt 72 % –, aber die Flexibilität, während des Verpflichtungszeitraums die Instanzfamilie zu wechseln.“

„Und wenn AWS einen besseren Instanztyp herausbringt, nachdem wir uns verpflichtet haben?“

„Wir prüfen das, wenn die RI abläuft. Wenn der neue Typ besser ist, kaufen wir eine neue RI für den nächsten Zeitraum. Die aktuelle RI läuft zum vereinbarten Preis weiter bis zum Ende.“

Tom holte den Break-Even-Vergleich auf den geteilten Bildschirm, damit alle mitverfolgen konnten:

**Dreifachvergleich: r6g.large, 4 Instanzen, 12 Monate**

| Option | Jahreskosten | Monatsäquivalent | Flexibilität |
|---|---|---|---|
| On-Demand (0,101 $/Std. × 4) | 3.540 $ | 295 $ | Voll |
| Compute Savings Plan (~34 % Rabatt 1 Jahr, 0,27 $/Std. verpflichtet) | 2.365 $ | 197 $ | Hoch |
| Standard RI, 1 Jahr vollständige Vorauszahlung (4 × 520 $) | 2.080 $ | 173 $ | Gering |

„Moment“, sagte Leo. „Die RI ist günstiger als der Savings Plan?“

„Bei gleicher Laufzeit, ja – das ist der Preis der Flexibilität“, sagte Tom. „Ein Compute Savings Plan gilt für *jeden* Instanztyp, jede Größe, jede Region, sogar für Fargate und Lambda, also ist sein maximaler Rabatt niedriger – bis zu 66 % bei der 3-Jahres-Stufe. Eine Standard-RI oder ein EC2 Instance Savings Plan bindet Sie an eine Instanzfamilie und zahlt Ihnen diese Bindung mit Rabatten von bis zu 72 % zurück. Je mehr Freiheit Sie behalten, desto weniger Rabatt gibt AWS.“

„Was ist der Break-Even für die 3-Jahres-RI?“

„3 Jahre, vollständige Vorauszahlung: etwa 1.060 $ pro Instanz, also 4.240 $ insgesamt für alle vier – das kauft 36 Monate. Monatsäquivalent: 118 $ gegenüber 295 $ On-Demand. Die Vorauszahlung amortisiert sich etwa im vierzehnten Monat; danach sind Sie für fast zwei weitere Jahre im Sparbereich.“

„Wenn wir also in Monat vier entscheiden, dass wir eine andere Instanzfamilie brauchen“, sagte Priya, „zahlen wir trotzdem für die ursprüngliche Verpflichtung.“

„Richtig. Sie können Standard RIs auf dem RI Marketplace verkaufen, aber nicht immer zum vollen Wert. Convertible RIs können getauscht, aber nicht verkauft werden. Deshalb ist der Savings Plan oft die sicherere Wahl – dasselbe Prinzip, weniger Bindung.“

**Savings Plans: Die flexible Verpflichtung**

**Savings Plans** sind eine neuere, flexiblere Alternative zu Reserved Instances. Anstatt sich auf einen bestimmten Instanztyp festzulegen, verpflichten Sie sich zu einer bestimmten *stündlichen Ausgabensumme* (in Dollar).

**Compute Savings Plans**: Gelten für jede EC2-Instanz, unabhängig von Typ, Größe, Region oder Betriebssystem. Am flexibelsten. Bis zu 66 % Rabatt.

**EC2 Instance Savings Plans**: Gelten für eine bestimmte Instanzfamilie in einer Region (z. B. „c6g-Instanzen in us-west-2“). Restriktiver als Compute, aber bis zu 72 % Rabatt (gleich dem RI-Maximum).

**SageMaker Savings Plans**: Spezifisch für SageMaker-ML-Training und -Inferenz.

Für Nimbus: Compute Savings Plans für ihre API-Server. Sie verpflichteten sich zu 0,45 $/Stunde an Compute-Ausgaben. Jeder Instanztyp, jede Größe – und die Verpflichtung deckt auch Fargate und Lambda ab, was für das, was als Nächstes kam, von Bedeutung war. Wenn sie die Flotte hochskalieren oder Instanztypen ändern, gilt der Savings Plan weiterhin.

„Das ist für uns besser als Reserved Instances“, sagte Leo. „Wir experimentieren noch mit Instanztypen. Der Compute Savings Plan gibt uns den Rabatt, ohne uns speziell an r6g zu binden.“

„Was passiert, wenn wir uns auf 0,45 $/Stunde verpflichten und manche Monate nur 0,36 $ nutzen?“, fragte Maya.

„Du zahlst unabhängig davon 0,45 $“, sagte Tom. „Die Verpflichtung ist bedingungslos. Der Savings Plan gilt für die gesamte Nutzung bis zum verpflichteten Betrag. Alles darüber läuft zu On-Demand-Sätzen. Die Disziplin besteht darin, die Verpflichtung auf einem Niveau festzulegen, das man zuversichtlich immer erreicht.“

„Und wir sollten uns nicht auf unseren Durchschnitt verpflichten – wir sollten uns auf unsere Untergrenze verpflichten“, sagte Priya.

„Genau. Schaut euch die letzten sechs Monate an. Findet die niedrigste Woche. Verpflichtet euch auf 90 % dieser Zahl. Dann überprüft es vierteljährlich, während wir wachsen.“

„Haben wir bedacht, was passiert, wenn wir uns übermäßig verpflichten?“, fuhr Priya fort. „Wir kaufen einen 2-$/Stunde-Plan, dann optimieren wir im nächsten Quartal und unsere Compute-Nutzung sinkt auf 1,50 $?“

„Die Lücke von 0,50 $/Stunde wird zu Verschwendung“, sagte Tom. „Wir zahlen für Kapazität, die nicht mehr existiert. Das ist das Risiko, die Verpflichtung zu hoch anzusetzen. Die vierteljährliche Überprüfung ist genau dafür da, das zu erkennen – wenn unsere Nutzung unter die Verpflichtung gefallen ist, wissen wir, dass der nächste Kauf kleiner ausfallen sollte. Eine wichtige Feinheit: Ein *Compute* Savings Plan folgt Ihnen zu Fargate und Lambda – das Migrieren von EC2-Arbeitslasten zu Containern würde ihn nicht stranden lassen. Was die Verpflichtung stranden lässt, ist tatsächlich weniger Compute zu nutzen oder einen *EC2 Instance* Savings Plan oder eine RI für eine Instanzfamilie zu halten, die man nicht mehr verwendet.“

Sie fragen sich vielleicht: Warum nicht einfach immer Savings Plans bis zum maximal leistbaren Betrag kaufen und AWS das regeln lassen? Die Antwort ist, dass die Verpflichtung eine Untergrenze ist, keine Obergrenze. Wenn Sie sich auf 5 $/Stunde verpflichten, aber nur 3 $/Stunde nutzen, zahlen Sie 5 $/Stunde. Jeder Dollar verpflichteter Ausgaben, der nicht der tatsächlichen Nutzung entspricht, ist ein verschwendeter Dollar. Die vierteljährliche Überprüfung ist nicht optional – sie ist es, die den Savings Plan zu einer Optimierung und nicht zu einer Überverpflichtung macht.

**Spot Instances: Der 90-%-Rabatt**

**Spot Instances** nutzen die freie EC2-Kapazität von AWS. Wenn AWS ungenutzte Server hat, können Sie diese zu 60–90 % unter dem On-Demand-Preis mieten. Wenn AWS die Kapazität zurückbenötigt (für On-Demand- oder Reserved-Kunden), gibt es Ihnen eine 2-minütige Warnung und beendet Ihre Instanz.

Sie fragen sich vielleicht: Wer würde ein System um Instanzen herum entwerfen, die mit zwei Minuten Vorlauf verschwinden können? Die Antwort lautet: jeder, dessen Arbeit von Grund auf neu gestartet werden kann. Batch-Jobs, Analysen, Rendering-Pipelines – keine davon erfordert, dass die bestimmte Instanz, die die Arbeit begonnen hat, auch diejenige ist, die sie beendet. Die 2-minütige Warnung reicht aus, um einen Checkpoint zu speichern, Verbindungen zu leeren und sauber zu beenden.

Das Unterbrechungsrisiko ist das bestimmende Merkmal. Spot Instances sind nur geeignet für:

- **Fehlertolerante Arbeitslasten**: Wenn eine Instanz mitten in einer Aufgabe beendet wird, kann die Aufgabe neu gestartet werden, ohne dass etwas beschädigt wird
- **Zustandslose Verarbeitung**: Bildgrößenanpassung, Videokodierung, Batch-Analysen, ML-Training
- **Kurzlebige Batch-Jobs**: Die 2-minütige Warnung reicht aus, um den Zustand zu speichern und einen Checkpoint zu setzen
- **Auto-Scaling-Mischflotten**: Verwenden Sie Spot für die Mehrheit Ihrer ASG mit On-Demand als Basislinie

Für Nimbus: Spot Instances waren sinnvoll für die Batch-Analysejobs, die jede Nacht liefen (die Verarbeitung der Bestelldaten des Tages zu aggregierten Berichten). Wenn eine Spot Instance mitten im Job beendet wird, schlägt der Job fehl, aber er startet auf einer neuen Instanz von Beginn an neu. Die Daten in S3 sind sicher.

Aber Leo erfuhr das auf die harte Tour, bevor das Team das Muster vollständig verstand.

Drei Monate zuvor hatte er den nächtlichen Batch-Job auf Spot verlegt, ohne eine Checkpoint-Logik einzubauen. In der ersten Nacht lief die Spot Instance einwandfrei. In der zweiten Nacht wurde sie um 4:47 Uhr unterbrochen – siebenundvierzig Minuten in einen Job hinein, der eine Stunde und zwanzig Minuten dauerte. Der Job schlug fehl. Der finale Bericht für die Bestellungen des Vortages fehlte, als die Restaurantpartner an diesem Morgen sich anmeldeten.

„Ich hatte ihn schon deployt – oh“, hatte Leo gesagt und auf die Benachrichtigung über den fehlgeschlagenen Job geblickt. „Ich nahm an, es würde schon klappen. In der ersten Nacht hat es ja geklappt.“

„Was ist passiert?“, hatte Maya gefragt.

„Spot-Unterbrechung. AWS brauchte die Kapazität zurück, gab uns zwei Minuten, Instanz beendet. Der Job hatte keinen Checkpoint. Als um 5 Uhr eine neue Spot Instance für den Wiederholungsversuch startete, begann sie bei null. Fertig um 6:40 Uhr. Die Berichte waren zwei Stunden zu spät.“

Die Lösung war unkompliziert: alle fünfzehn Minuten Zwischenergebnisse nach S3 schreiben. Jeder Checkpoint war ein vollständiger Teilzustand – genug, damit eine neue Instanz den letzten Checkpoint lesen und von diesem Punkt aus fortfahren konnte, anstatt von Beginn an neu zu starten.

„Die Nutzung von Spot für den nächtlichen Job senkte seine Kosten von 12 $/Nacht auf 2 $/Nacht“, berichtete Leo, nachdem die Lösung implementiert war. „Selbst mit der einen schlechten Nacht waren die Gesamtkosten für den dreimonatigen Betrieb geringer als zwei Wochen On-Demand-Preise.“

„Es wird schon klappen“, fügte Leo hinzu, „auch wenn es mitten im Lauf unterbrochen wird – oder?“

„Mit dem Checkpointing, ja“, sagte Tom. „Ohne, nein. Die Unterbrechungstoleranz muss in den Job eingebaut sein, nicht angenommen werden.“

„Und was, wenn jemand versucht einzubrechen?“, fragte Priya. „Die Spot Instance läuft auf gemeinsam genutzter Hardware. Wenn sie unterbrochen wird und eine neue startet, gibt es da eine Datenexposition zwischen Instanzen?“

„Nein“, sagte Tom. „AWS löscht den Instanzspeicher bei der Beendigung. Der nächste Kunde, der diese Hardware bekommt, sieht ein sauberes Blatt. Aber es ist ein guter Instinkt – immer wenn man gemeinsam genutzte Kapazität verwendet, lohnt es sich, das Isolationsmodell zu überprüfen.“

**Spot-Fleet-Diversifizierung**

Leo hatte aus dem unterbrochenen Batch-Job noch etwas gelernt: Wenn man einen einzelnen Spot-Instanztyp anfordert, wettet man auf die Verfügbarkeit genau dieses Typs in dieser AZ. Wenn die Spot-Kapazität für c5.2xlarge in us-west-2a erschöpft ist, wartet Ihr Job – oder schlägt fehl.

**Spot Fleet** löst dies, indem es Ihnen ermöglicht, mehrere Instanztypen und AZs in einer einzigen Anforderung anzugeben. AWS erfüllt die Flotte aus der Kombination, die zum niedrigsten Preis verfügbare Kapazität hat.

```
Spot Fleet request:
  Target capacity: 4 units
  Fleet diversification:
    - c5.2xlarge, us-west-2a
    - c5.2xlarge, us-west-2b
    - c5a.2xlarge, us-west-2a
    - m5.2xlarge, us-west-2a
    - c5d.2xlarge, us-west-2b
  Allocation strategy: diversified
```

Mit einer diversifizierten Flotte betrifft eine Unterbrechung in einem Instanztyp oder einer AZ nur einen Teil der Flotte. Der Rest läuft weiter. Für den Nimbus-Batch-Job bedeutete der Betrieb einer Vier-Instanzen-Spot-Fleet anstelle einer einzelnen großen Instanz, dass selbst eine teilweise Unterbrechung es dem Job erlaubte, fertig zu werden – langsamer, aber ohne den vollständigen Neustart.

„Die diversifizierte Flotte erhält tendenziell auch bessere Preise“, sagte Tom. „AWS gibt Ihnen den niedrigsten Preis über alle Typen in Ihrer Flotte. In manchen Nächten bekommt man c5a zu einem niedrigeren Preis als c5, weil zufällig Kapazität da war.“

„Wie viel kostet das pro Monat im Vergleich zur Verwendung eines einzigen Instanztyps?“, fragte sich Tom laut – die Angewohnheit war inzwischen völlig reflexartig. Er rechnete die Zahl aus. Spot Fleet bei gemischten Preisen lag im Schnitt bei 1,80 $/Nacht gegenüber 2,00 $/Nacht mit einer Anforderung eines einzelnen Typs. Geringer Unterschied in absoluten Zahlen, aber allein die Verbesserung der Zuverlässigkeit rechtfertigte die Änderung.

„Und was, wenn jemand versucht, in die Spot Fleet einzubrechen?“, fragte Priya.

„Dieselbe Antwort wie immer“, sagte Tom. „Jede Instanz ist von den anderen isoliert. Die Fleet setzt sie nicht automatisch in ein gemeinsam genutztes privates Segment. Ihre Security Groups gelten weiterhin für jede Instanz einzeln.“

Das Checkpointing hatte Unterbrechungen handhabbar gemacht, nicht beseitigt. Der Job startete immer noch vom letzten Checkpoint neu, und wenn der Neustart mit einer Phase von Spot-Preisspitzen zusammenfiel, konnte die Ersatzinstanz 10 bis 20 Minuten brauchen, um verfügbar zu werden. Bereits durch den letzten Checkpoint abgedeckte Arbeit wurde beim Neustart übersprungen; Arbeit seitdem wurde wiederholt. Der gesamte Mehraufwand durch Nacharbeit: gering, aber real.

Die Spot Fleet löste das Verfügbarkeitsproblem sauber. Durch die Angabe von fünf Instanztypen über drei AZs reduzierte Leo die Wahrscheinlichkeit einer vollständigen Kapazitätslücke auf nahe null. Die Zuweisungsstrategie von AWS – diversified – verteilte die Vier-Instanzen-Flotte über die Pools, sodass die Unterbrechung eines einzelnen Pools den Job nicht stoppen konnte. Wenn eine Instanz unterbrochen wurde, verarbeiteten die verbleibenden drei weiter, und der Checkpoint bedeutete, dass die Ersatzinstanz nur die Arbeit aufnahm, die die unterbrochene gerade in Bearbeitung hatte. Insgesamt verpasste der Job seinen 7-Uhr-Berichtstermin nie wieder.

„Was hat die Diversifizierung an Komplexität gekostet?“, fragte Maya, als Leo dies dokumentierte.

„Drei zusätzliche Zeilen in der Spot-Fleet-Anforderung“, sagte Leo. „Der Verarbeitungscode weiß nicht und kümmert sich nicht darum, auf welchem Instanztyp er läuft. Die Komplexität lebt vollständig in der Flottenkonfiguration, nicht in der Anwendung.“

Das war der Vorteil davon, die Anwendung von Anfang an zustandslos zu entwerfen: Skalierungs- und Fehlertoleranzentscheidungen wurden zu Infrastrukturentscheidungen, nicht zu Code-Entscheidungen.


**Dedicated Hosts: Die Compliance-Option**

Einige Softwarelizenzen (Oracle, Windows Server in manchen Konfigurationen) werden pro physischem Sockel oder Kern berechnet. Wenn Sie diese Software auf einem gemeinsam genutzten Host (dem Standard für EC2) ausführen, zahlen Sie möglicherweise für Kapazität, die Sie nicht nutzen.

**Dedicated Hosts** geben Ihnen Zugriff auf einen physischen Server, der ausschließlich Ihrer Nutzung dient. Sie können Ihre bestehenden Lizenzen pro Sockel mitbringen. Keine Instanzen eines anderen AWS-Kunden laufen auf derselben Hardware.

Dedicated Hosts sind deutlich teurer als Standard-EC2. Sie sind ein Compliance- und Lizenzierungswerkzeug, kein Kostenoptimierungswerkzeug.

Nimbus hatte keine Lizenzierungsanforderungen, die Dedicated Hosts erforderten. Die meisten Cloud-nativen Anwendungen haben das nicht.

**Variante: Wenn die Verpflichtung nach hinten losgeht**

Wenn Ihre Arbeitslast über 12 Monate vorhersehbar und stabil ist, liefern Reserved Instances den maximalen Rabatt – aber wenn sich Ihr Bedarf an Instanztypen in diesem Zeitraum erheblich ändern könnte, kostet Sie diese Bindung Flexibilität, die mehr wert ist als die Preisdifferenz. Convertible RIs lösen einen Teil davon, aber zu einem reduzierten Rabatt. Compute Savings Plans lösen das meiste davon, zu einem etwas niedrigeren maximalen Rabatt als Standard RIs.

Wenn Sie Spot Instances für fehlertolerante Batch-Jobs verwenden, können Sie 60–90 % Einsparungen erzielen – aber wenn dieselben Instanzen Live-Benutzeranfragen bedienen, bedeutet eine Unterbrechung mitten in einer Anfrage fehlgeschlagene Transaktionen und unzufriedene Kunden. Die Unterbrechungstoleranz der Arbeitslast ist die entscheidende Variable.

Es gibt einen subtileren Fall einer falschen Wahl: die Überverpflichtung eines Savings Plans. Wenn Sie einen Compute Savings Plan mit 3,00 $/Stunde kaufen, weil Ihre Compute-Nutzung im letzten Quartal durchschnittlich 3,00 $/Stunde betrug, und dann in diesem Quartal Ihre Dienste optimieren (die Gesamtnutzung auf 1,80 $/Stunde senken), zahlen Sie unabhängig davon die verpflichteten 3,00 $/Stunde. Die Lücke von 1,20 $/Stunde ist Verschwendung. (Beachten Sie, dass das Verschieben von EC2-Arbeitslasten zu Fargate oder Lambda einen Compute Savings Plan *nicht* stranden lässt – er deckt alle drei ab. Die Strandungsrisiken sind echte Nutzungsreduktion oder Familienbindung mit EC2 Instance Savings Plans und RIs.) Deshalb ist die Untergrenzen-Strategie wichtig: Verpflichten Sie sich auf Ihr Minimum, nicht auf Ihren Durchschnitt. Und überprüfen Sie vierteljährlich.

Die Regel: Verpflichten Sie sich auf das, worüber Sie sicher sind. Verwenden Sie On-Demand für das, worüber Sie es nicht sind. Verwenden Sie Spot nur für das, was einen harten Stopp überleben kann.

**Aufbau einer gemischten Flotte**

Der ausgereifte Ansatz: mehrere Preismodelle gemeinsam verwenden.

Für die API-Flotte von Nimbus:

- **Basislast (4 Instanzen, immer in Betrieb)**: Abgedeckt durch die Savings-Plan-Verpflichtung
- **Vorhersehbare Spitze (2 zusätzliche Instanzen während der Geschäftszeiten)**: Abgedeckt durch den Savings Plan, wenn die Verpflichtung sie abdeckt, andernfalls On-Demand
- **Traffic-Spitzen-Überlauf**: Spot Instances (akzeptabel, da die API-Server zustandslos sind – Anfragen verteilen sich neu, wenn eine Instanz beendet wird)

Das Ergebnis: eine Flotte, die die Kosten auf jeder Ebene optimiert – verpflichtete Preisgestaltung für den vorhersehbaren Teil, On-Demand für unvorhersehbares Wachstum, Spot für Burst-Kapazität.

**Überwachung der Savings-Plan-Auslastung**

Den Kauf eines Savings Plans abzuschließen ist nicht das Ende der Arbeit. Es ist der Beginn einer wiederkehrenden Verpflichtung: zu wissen, ob die Verpflichtung verdient wird.

Tom stellte sich eine Kalendererinnerung für den ersten Montag jedes Quartals ein: Überprüfung der Savings-Plan-Auslastung. Das Werkzeug war AWS Cost Explorer. Genauer gesagt der Tab „Savings Plans“ unter „Reservations and Savings Plans“, der drei Zahlen anzeigte, die ihm wichtig waren:

- **Auslastungsrate (Utilization rate)**: Welcher Prozentsatz der verpflichteten Ausgaben wurde tatsächlich durch berechtigte Nutzung gedeckt? Eine Zahl unter 100 % bedeutete, dass er für eine Verpflichtung zahlte, die nicht genutzt wurde.
- **Abdeckungsrate (Coverage rate)**: Welcher Prozentsatz der berechtigten EC2-Nutzung wurde durch den Savings Plan abgedeckt, gegenüber dem Betrieb zu On-Demand-Sätzen? Eine Zahl unter 80 % bedeutete, dass es nicht abgedeckte Nutzung gab, die eine größere Verpflichtung erfassen würde.
- **On-Demand-Ausgaben**: Der Teil der EC2-Ausgaben, der von keinem Savings Plan abgedeckt wird. Wenn dieser wuchs, war entweder der Savings Plan zu klein dimensioniert oder es waren neue Arbeitslasten außerhalb des Umfangs der Verpflichtung hinzugekommen.

Bei der ersten vierteljährlichen Überprüfung sahen die Zahlen so aus:

- Auslastung: 97 %. Drei Prozent der verpflichteten Ausgaben blieben ungedeckt – 9,90 $ pro Monat bei einer Verpflichtung von 330 $/Monat. Das war akzeptabel; es bedeutete, dass die Verpflichtung leicht über der tatsächlichen Untergrenze der Nutzung lag, was beabsichtigt war.
- Abdeckung: 84 %. Sechzehn Prozent der berechtigten EC2-Nutzung lief On-Demand. Das war die Burst-Kapazität – die Überlauf-Instanzen, die während Traffic-Spitzen hochgefahren wurden und nicht von der Verpflichtung abgedeckt waren.
- On-Demand-EC2-Ausgaben: 147 $/Monat. Spot Instances (nicht von Savings Plans abgedeckt, separat berechnet) machten den größten Teil des Rests aus.

„Die 97 % Auslastung sind gesund“, sagte Tom. „Es bedeutet, dass wir uns nicht überverpflichtet haben. Wenn das 80 % wären, wüsste ich, dass wir zu viel gekauft haben.“

„Und 84 % Abdeckung?“, fragte Maya.

„Das ist auch in Ordnung. Die 16 %, die On-Demand sind, sind die Burst-Kapazität – Instanzen, die während der Spitze stundenweise laufen, nicht den ganzen Tag. Wir müssten deutlich mehr Savings-Plan-Verpflichtung kaufen, um sie abzudecken, und das würde sich vielleicht nicht rechtfertigen.“ Er rechnete: Die nicht abgedeckten On-Demand-Instanzen liefen vielleicht 40 Stunden pro Monat zu 0,101 $/Stunde pro Instanz. Sie mit einem Savings Plan abzudecken würde eine Verpflichtung erfordern, die wir 90 % der Zeit unterauslasten würden. Besser, sie On-Demand zu lassen.

Bei der zweiten vierteljährlichen Überprüfung, sechs Monate später, hatte sich eine Kennzahl geändert: Die On-Demand-EC2-Ausgaben waren auf 290 $/Monat gestiegen. Das Feature Nimbus Instant war gestartet, und mehrere neue Hintergrunddienst-Instanzen waren hinzugefügt worden, ohne dass Tom es bemerkt hatte.

„Diese drei Instanzen“, sagte Tom und zeigte auf die Cost-Explorer-Aufschlüsselung. „Sie laufen seit drei Monaten On-Demand. Wenn sie weiterlaufen sollen, sollten wir sie zur Savings-Plan-Verpflichtung hinzufügen.“

Die vierteljährliche Überprüfung hatte es erkannt. Ohne die Überprüfung wären diese drei Instanzen unbegrenzt zu Laufkundschaftsraten weitergelaufen.

„Wie passt man die Verpflichtung an?“, fragte Priya.

„Man kauft einen neuen, zusätzlichen Savings Plan zusätzlich zum bestehenden“, sagte Tom. „Savings Plans stapeln sich. Ich würde einen Compute Savings Plan mit 0,10 $/Stunde für die neue Basislast hinzufügen. Der bestehende 0,45-$/Stunde-Plan läuft weiter, bis seine Drei-Jahres-Laufzeit endet. Der neue Plan beginnt seine eigene Drei-Jahres-Laufzeit.“

„Wir hätten also zwei sich überlappende Savings Plans.“

„Ja. Sie gelten unabhängig für die jeweils vorhandene berechtigte Nutzung. AWS ordnet sie in der Reihenfolge vom vorteilhaftesten zum am wenigsten vorteilhaften zu.“

„Haben wir bedacht, was passiert, wenn wir einen dieser Hintergrunddienste nächstes Jahr verkaufen?“, fragte Priya. „Wir haben uns auf 0,55 $/Stunde für drei Jahre verpflichtet.“

„Das ist das Risiko der Drei-Jahres-Laufzeit“, sagte Tom. „Deshalb ist die neue Verpflichtung kleiner – ich verpflichte mich auf die Untergrenze der neuen Arbeitslasten, nicht auf den Durchschnitt. Wenn wir einen Dienst stilllegen und die Nutzung sinkt, sollten die verbleibenden Dienste immer noch den vollen verpflichteten Betrag verbrauchen.“

Die Disziplin der vierteljährlichen Überprüfung war nicht glamourös. Es waren fünfzehn Minuten im Cost Explorer, drei geprüfte Zahlen, eine getroffene oder aufgeschobene Entscheidung. Aber über drei Jahre hinweg war diese Disziplin der Unterschied zwischen einem Savings Plan, der über 90 % Auslastung lieferte – echte Einsparungen –, und einem, der in teilweise Verschwendung abdriftete, während sich die Infrastruktur um ihn herum entwickelte.

## Stärken und Grenzen

**On-Demand**: Keine Verpflichtung. Voller Preis. Für unvorhersehbare oder kurzfristige Arbeitslasten verwenden.

**Reserved Instances**: Bis zu 72 % Rabatt. Festgelegt auf einen bestimmten Instanztyp/Region/OS. Ungenutzte Kapazität auf dem RI Marketplace verkaufen.

**Savings Plans**: Bis zu 66–72 % Rabatt. Flexibler als RIs (Compute Savings Plans gelten für jeden Instanztyp). Automatische Anwendung auf passende Nutzung.

**Spot Instances**: Bis zu 90 % Rabatt. Risiko einer 2-minütigen Unterbrechung. Nur für fehlertolerante, zustandslose, unterbrechbare Arbeitslasten.

**Dedicated Hosts**: Vollständiger physischer Server. Am teuersten. Erforderlich für bestimmte Lizenzierungs- oder Compliance-Szenarien.

## Zusammenfassung

Tom verbrachte den Rest des Samstags damit, jede Nimbus-Arbeitslast ihrem idealen Preismodell zuzuordnen – Basislast zu Savings Plans, nächtliche Batch-Jobs zu Spot, unvorhersehbarer Überlauf zu On-Demand. Die Übung verwandelte drei Monate des Zahlens der Laufkundschaftsrate in eine bewusste Strategie. Die Zahlen, einmal berechnet, waren schwer zu ignorieren.

- Die EC2-Preisgestaltung hat vier Modelle: **On-Demand** (voller Preis, keine Verpflichtung), **Reserved Instances/Savings Plans** (verpflichtete Ausgaben für erheblichen Rabatt), **Spot** (freie Kapazität zu 60–90 % Rabatt, unterbrechbar), **Dedicated Hosts** (Exklusivität eines physischen Servers).
- **Savings Plans** werden gegenüber Reserved Instances im Allgemeinen wegen ihrer Flexibilität bevorzugt.
- **Spot Instances** erfordern fehlertolerante, zustandslose Arbeitslasten – nur für Batch-Jobs, ML-Training und unterbrechbare Verarbeitung.
- **Checkpointing in dauerhaften Speicher** (S3) ist für Spot-basierte Batch-Jobs erforderlich – unterbrochene Jobs sollten vom letzten Checkpoint fortsetzen, nicht von null neu starten.
- **Spot-Fleet-Diversifizierung** über mehrere Instanztypen und AZs reduziert das Unterbrechungsrisiko und führt oft zu besseren Preisen.
- Die optimale Strategie ist eine **gemischte Flotte**: Savings Plans für die Basislast, On-Demand für unvorhersehbares Wachstum, Spot für unterbrechbare Batch-Arbeit.
- Überprüfen Sie die Preismodelle, wenn Arbeitslasten seit mehr als 3 Monaten stabil laufen – dann beginnt On-Demand Verschwendung zu sein.
- **Überprüfen Sie Savings-Plan-Verpflichtungen vierteljährlich** – verpflichten Sie sich auf Ihre Untergrenze, nicht auf Ihren Durchschnitt, und passen Sie an, wenn sich die Nutzungsmuster ändern.

## Prüfungstipps

*SAA-C03-Domäne: Design Cost-Optimized Architectures (Domäne 4, Aufgabe 4.2)*

- **Savings Plans vs. Reserved Instances**: Savings Plans sind flexibler (gelten für jede EC2-Instanz bei Compute Savings Plans). Reserved Instances binden an einen bestimmten Instanztyp. Prüfungsszenarien: „maximale Flexibilität bei gleichzeitigem Erhalt von Rabatten benötigt“ → Savings Plans. „den genauen Instanztyp für 3 Jahre kennen“ → Standard RI für maximalen Rabatt.
- **Spot-Signale**: „kostensensibel“, „fehlertolerant“, „Batch-Verarbeitung“, „kann Unterbrechungen handhaben“, „zustandslose Arbeitslasten“, „ML-Training“ → Spot.
- **Spot-Unterbrechungsbehandlung**: Spot-Instanzen erhalten eine 2-minütige Warnung vor der Beendigung. Ihre Anwendung muss dies elegant behandeln (Zustand speichern, Verbindungen leeren, sauber beenden).
- **On-Demand vs. Spot für Webserver**: Webserver, die Live-Benutzertraffic bedienen, sollten NICHT Spot verwenden (Unterbrechungen verursachen fehlgeschlagene Anfragen). Verwenden Sie On-Demand oder Savings Plans für die Web-Ebene.
- **EC2 Savings Plans vs. Compute Savings Plans**: EC2 Savings Plans gelten für eine bestimmte Instanzfamilie und Region (höherer Rabatt). Compute Savings Plans gelten für jede EC2-Instanz, Lambda und Fargate (geringerer maximaler Rabatt, flexibler).
- **RI Marketplace**: Ungenutzte Standard Reserved Instances können an andere AWS-Kunden verkauft werden. Convertible RIs können nicht verkauft werden.
- **Hibernation:** Speichert RAM-Inhalte beim Stoppen auf dem EBS-Root-Volume; stellt sie beim Start wieder her. Die Instanz nimmt den Betrieb schneller wieder auf als ein Kaltstart, mit allen Prozessen und dem Zustand intakt. Verwenden, wenn der Instanzzustand zwischen Sitzungen erhalten bleiben muss. Erfordert: beim Start aktiviert (kann nicht zu einer bestehenden Instanz hinzugefügt werden), RAM ≤ 150 GB, verschlüsseltes EBS-Root-Volume, nicht verfügbar für Bare-Metal-Instanzen; maximal 60 Tage im Ruhezustand. Prüfungssignal: „Instanz schnell mit erhaltenem In-Memory-Zustand wieder aufnehmen“ oder „Entwicklungsinstanz braucht zu lange zum Initialisieren“ → Hibernation.

## Übungen

**Übung 1 — Wiederholung**

Erklären Sie, wann Spot Instances geeignet sind und wann nicht. Welches Merkmal macht eine Arbeitslast für Spot geeignet?

*(Hinweis: Denken Sie darüber nach, was passiert, wenn die Instanz mit 2 Minuten Vorlauf beendet wird. Welche Arbeitslasten erholen sich sauber? Welche nicht?)*

**Übung 2 — SAA-C03-Szenario**

*Szenario*: Ein Medienunternehmen betreibt eine Video-Transcodierungspipeline, die hochgeladene Videos in mehrere Formate konvertiert. Transcodierungsjobs laufen kontinuierlich, sobald Videos hochgeladen werden (24/7-Betrieb, variables Volumen). Jeder Job dauert 5–30 Minuten. Wenn ein Transcodierungsjob unterbrochen wird, kann er ohne Datenverlust von Beginn an neu gestartet werden. Das Unternehmen möchte die Kosten minimieren.

Welches EC2-Preismodell erfüllt diese Anforderungen am BESTEN?

A) On-Demand-Instanzen in einer Auto Scaling Group  
B) Reserved Instances (1 Jahr, vollständige Vorauszahlung)  
C) Spot Instances mit Spot Fleet für automatische Instanzdiversifizierung  
D) Dedicated Hosts mit den bestehenden Mediensoftwarelizenzen des Unternehmens

**Hinweis 1**: „Kann ohne Datenverlust von Beginn an neu gestartet werden“ – das ist der Schlüsselbegriff, der ein bestimmtes Preismodell ermöglicht.

**Hinweis 2**: „Kosten minimieren“ bei einer unterbrechbaren Arbeitslast deutet auf die Option mit maximalem Rabatt hin.

**Hinweis 3**: Spot Fleet fordert Instanzen aus mehreren Instanztypen und AZs an und reduziert so die Wahrscheinlichkeit einer Unterbrechung.

**Antwort**: C

**Erläuterung**: Transcodierungsjobs sind fehlertolerant – sie können bei Unterbrechung neu gestartet werden. Das macht sie ideal für Spot Instances, die 60–90 % Rabatt gegenüber On-Demand bieten. Spot Fleet diversifiziert über Instanztypen und Availability Zones und reduziert so die Wahrscheinlichkeit einer Massenunterbrechung.

**Warum nicht A?** On-Demand ist die teuerste Option. Für eine kontinuierlich laufende, fehlertolerante Arbeitslast ist das verschwenderisch.

**Warum nicht B?** Reserved Instances bieten einen Rabatt von 50–72 %, aber nicht den potenziellen 90-%-Rabatt von Spot für fehlertolerante Arbeitslasten. Außerdem sind RIs für vorhersehbare, stabile Arbeitslasten gedacht – Spot ist speziell für unterbrechbare Batch-Verarbeitung.

**Warum nicht D?** Dedicated Hosts sind für Lizenz-Compliance, nicht für Kostenoptimierung. Sie sind die teuerste Option.

*SAA-C03-Domäne: Design Cost-Optimized Architectures — Aufgabe 4.2*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Die Infrastruktur von Nimbus hat diese Arbeitslasten:

1. API-Server: 6 Instanzen, rund um die Uhr in Betrieb, seit 2 Jahren stabil, verwenden r6g.large
2. Nächtliche Analyse-Batch-Jobs: 4 Instanzen, jede Nacht von 3 bis 6 Uhr, immer derselbe Instanztyp
3. Testumgebung: 2 Instanzen, von Ingenieuren werktags 9 bis 18 Uhr genutzt
4. Traffic-Spitzen-Überlauf: 0–8 Instanzen, während der Spitzenzeiten hochgefahren, völlig unvorhersehbar

Entwerfen Sie die optimale Preisstrategie für jeden Arbeitslasttyp. Welcher Savings-Plan-Verpflichtungsbetrag würde die Arbeitslasten 1 und 2 abdecken? Gibt es für Arbeitslast 3 eine klügere Strategie als On-Demand?

*(Es gibt keine eindeutig korrekte Antwort. Das Ziel ist, EC2-Preisstrategie zu üben.)*

## Post-Credits-Szene

Tom reichte den Savings-Plan-Kauf ein.

0,45 $/Stunde Verpflichtung. Drei-Jahres-Laufzeit. Compute Savings Plans für Flexibilität.

Kombiniert mit der Spot Fleet für den nächtlichen Batch betrugen die geschätzten Einsparungen: 42.500 $ über drei Jahre – etwas mehr als 14.000 $ pro Jahr.

Maya las die Zahl. „Zweiundvierzigtausend Dollar.“

„Im Vergleich zum Betrieb von allem auf On-Demand, über drei Jahre.“

„Was hat es gekostet, das zu tun?“

„Einen Nachmittag Analyse“, sagte Tom. „Und die Entscheidung, sich zu verpflichten.“

„Drei Jahre sind eine lange Zeit“, sagte Leo. „Was, wenn wir Instanztypen ändern?“

„Compute Savings Plans gelten für jeden EC2-Instanztyp. Und in drei Jahren sind wir ohnehin groß genug, dass dieses Gespräch anders aussieht.“

Leo dachte darüber nach.

„Wie lange weißt du schon von Savings Plans?“, fragte er.

„Seit wir angefangen haben“, sagte Tom. „Ich habe gewartet, bis die Arbeitslast stabil genug war, um mich zu verpflichten.“

„Achtzehn Monate On-Demand zahlen, während du gewartet hast.“

„Ja.“ Tom schloss die Konsole. „Manchmal ist das Teuerste, was man tut, zu warten, um Geld zu sparen.“

Im nächsten Kapitel: dieselbe Disziplin angewandt auf Speicherkosten, mit einigen Überraschungen darüber, was die Rechnung antreibt.
