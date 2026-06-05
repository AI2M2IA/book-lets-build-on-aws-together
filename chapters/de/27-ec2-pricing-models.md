# Kapitel 27: Bezahlung, was Sie brauchen

Tom hatte die AWS-Rechnung seit der Gründung von Nimbus jeden Monat überprüft. Für das erste Jahr verstand er grob 60 % dessen, was er sah. Jetzt verstand er fast alles – außer dem Abschnitt zu EC2.

Der EC2-Abschnitt war eine Mischung aus „On-Demand-Instanzen“ in verschiedenen Instanztypen, die alle pro Stunde abgerechnet wurden und zusammen 2.340 $/Monat ausmachten.

„Wir brauchen diese Instanzen“, sagte Tom. „Aber ich verstehe nicht, warum wir für sie die Pauschalrate zahlen.“

„Die Pauschalrate?“, fragte Leo.

„On-Demand-Preise“, sagte Tom. „Es ist wie ein Hotelzimmer am Morgen zu buchen, wenn Sie es brauchen. Maximale Flexibilität. Maximaler Preis.“

„Also, was ist die Alternative?“

Tom öffnete die EC2-Preis-Seite.

„Es gibt vier Preismodelle“, sagte er. „Und wir nutzen nur eines.“

**Das Hotel-Analogie**

Die EC2-Preise passen überraschend gut zu Hotelbuchungsstrategien:

**On-Demand**: Man geht ohne Reservierung zum Schalter und bezahlt den regulären Stundensatz. Man kann jederzeit auschecken. Perfekt für unvorhersehbare Aufenthalte.

**Reservierte Instanzen/Sparpläne**: Man bucht ein Zimmer für das ganze Jahr im Voraus. Man erhält einen erheblichen Rabatt von 30-72 % in Austausch für die Verpflichtung, es zu nutzen.

**Spot Instanzen**: Man bietet auf ungenutzte Zimmer zu dem Preis, den das Hotel gerade annehmen möchte. Bis zu 90 % Rabatt. Aber das Hotel kann Sie mit zwei Minuten Vorlaufzeit auffordern, das Zimmer mit dem regulären Preis zu verlassen, wenn es einen Kunden mit regulärem Preis gibt.

**Dedizierte Hosts**: Man mietet die gesamte Etage des Hotels ausschließlich für sich. Keine gemeinsame Nutzung mit anderen Gästen. Deutlich teurer. Erforderlich, wenn Softwarelizenzen oder Compliance-Regeln die gemeinsame Nutzung eines Hosts verbieten.

Jedes Modell hat einen Anwendungsfall. Der Fehler, den Nimbus gemacht hatte: die Verwendung von On-Demand für alles, einschließlich Arbeitslasten, die 24/7 liefen und völlig vorhersehbar waren.

**On-Demand-Instanzen: Maximale Flexibilität, Maximaler Kosten**

**Wann zu verwenden:**

- Unvorhersehbare Arbeitslasten (Traffic-Spikes, die Sie nicht prognostizieren können)
- Entwicklung und Testen (Starten und Stoppen häufig)
- Kurzfristige Arbeitslasten (Ausführen eines Experiments für eine Woche)
- Erste Bereitstellung (bevor Sie Ihre Nutzungsmuster verstehen)

**Wann nicht zu verwenden:**

- Steady-State-Produktionslasten, die Sie wissen, dass sie länger als ein Jahr laufen werden
- Alles mit einer vorhersehbaren Basislast

Tom identifizierte Nimbuss's On-Demand-Instanzen:

- Web-API-Server: 4 EC2-Instanzen, die 24/7 für 18 Monate liefen. *Vorhersehbare Basislast.*
- Datenbank-Proxy (RDS Proxy): Immer aktiv. *Vorhersehbare Basislast.*
- VPN-Server: Immer aktiv. *Vorhersehbare Basislast.*
- Zusätzliche API-Server für Traffic-Spikes: Unvorhersehbar. *On-Demand ist hier korrekt.*

**Reservierte Instanzen: Das Jahresversprechen**

**Reservierte Instanzen (RIs)** sind eine Rechnungsgarantie – Sie verpflichten sich, einen bestimmten Instanztyp in einer bestimmten Region für 1 oder 3 Jahre zu nutzen. Im Gegenzug wird von AWS ein niedrigerer Stundensatz erhoben.

**Rabattstufen:**

- 1 Jahr, Keine Vorauszahlung: ~30-40 % Rabatt im Vergleich zu On-Demand
- 1 Jahr, Teilweise Vorauszahlung: ~35-45 % Rabatt (ein Teil jetzt, weniger pro Stunde)
- 1 Jahr, Vollständige Vorauszahlung: ~40-50 % Rabatt (der gesamte Jahresbetrag jetzt)
- 3 Jahre, Vollständige Vorauszahlung: ~55-72 % Rabatt (maximaler Rabatt, maximale Verpflichtung)

**Standard vs. Konvertible RIs:**

- **Standard**: Festgeschrieben an den exakten Instanztyp und die Region. Kann auf dem Reserved Instance Marketplace verkauft werden, wenn Sie es nicht mehr benötigen.
- **Konvertibel**: Kann während der Verpflichtungszeit den Instanztyp, das Betriebssystem und die Mietart ändern. Weniger Rabatt als Standard (~50 % Max vs. 72 %).

Tom berechnete die Kosten für die 4 API-Server (r6g.large, 0,252 $/Stunde On-Demand):

- Jahreskosten On-Demand: 0,252 × 24 × 365 × 4 = 8.820 $
- 1-Jahres-All-Upfront-RI (1 Instanz): ~1.600 $ im Voraus
- 4 Instanzen: ~6.400 $ im Voraus = **2.420 $ eingespart im ersten Jahr**

„Wir könnten 2.420 $ im ersten Jahr sparen, nur indem wir uns verpflichten“, sagte Tom.

„Es ist eine Verpflichtung“, sagte Maya. „Was passiert, wenn wir Instanztypen ändern müssen?“

„Wir bekommen Convertible RIs, wenn wir es vielleicht.“

„Was passiert, wenn AWS einen besseren Instanztyp herausbringt?“

„Wir prüfen, wenn die RI abläuft. Wenn der neue Typ besser ist, kaufen wir eine neue RI.“

**Sparpläne: Das Flexible Engagement**

**Sparpläne** sind eine neuere, flexiblere Alternative zu Reservierten Instanzen. Anstatt sich für einen bestimmten Instanztyp zu verpflichten, verpflichten Sie sich zu einer bestimmten *Stundensumme* (in Dollar).

**Compute-Sparpläne**: Gilt für jede EC2-Instanz, unabhängig vom Typ, der Größe, der Region oder dem Betriebssystem. Am flexibelsten. Bis zu 66 % Rabatt.

**EC2-Instanz-Sparpläne**: Gilt für eine bestimmte Instanzfamilie in einer Region (z. B. „c6g-Instanzen in us-east-1“). Beschränkter als Compute, aber bis zu 72 % Rabatt (gleicher maximaler Wert wie RI).

**SageMaker-Sparpläne**: Spezifisch für SageMaker ML-Training und -Inferenz.

Für Nimbus: Compute-Sparpläne für ihre API-Server. Sie verpflichteten sich zu 1,50 $/Stunde EC2-Ausgabe. Jeder Instanztyp, jede Größe. Wenn sie die Flotte hochskalieren oder Instanztypen ändern, gilt der Sparplan weiterhin.

„Das ist besser als Reservierte Instanzen für uns“, sagte Leo. „Wir experimentieren immer noch mit Instanztypen. Der Compute-Sparplan gibt uns den Rabatt, ohne uns an r6g festzulegen.“

**Spot Instanzen: Der 90 % Rabatt**

**Spot Instanzen** nutzen die ungenutzte EC2-Kapazität von AWS. Wenn AWS ungenutzte Server hat, können Sie diese zu 60-90 % unter dem On-Demand-Preis mieten. Wenn AWS die Kapazität zurück benötigt (für On-Demand- oder Reservierungs-Kunden), gibt es Ihnen eine 2-minütige Warnung und beendet Ihre Instanz.

Das Risiko einer Unterbrechung ist das definierende Merkmal. Spot Instanzen sind nur für:

- **Fehlertolerante Arbeitslasten**: Wenn eine Instanz während einer Aufgabe unterbrochen wird, kann die Aufgabe ohne Datenverlust neu gestartet werden.
- **Stateless-Verarbeitung**: Bildbearbeitung, Videokodierung, Batch-Analysen, ML-Training
- **Kurzlebige Batch-Jobs**: Die 2-minütige Warnung reicht aus, um den Zustand zu speichern und zu checkpointen.
- **Auto Scaling gemischte Flotten**: Verwenden Sie Spot für die Mehrheit Ihrer ASG mit On-Demand als Basislinie.

Für Nimbus waren Spot Instanzen sinnvoll für die täglichen Batch-Analysenjobs (die täglichen Bestellungsdaten in aggregierte Berichte verarbeiteten). Wenn eine Spot Instanz während einer Aufgabe unterbrochen wird, schlägt der Job fehl, aber er startet von Beginn an auf einer neuen Instanz. Die Daten in S3 sind sicher.

„Die Verwendung von Spot für den Nachtjob senkte die Kosten von 12 $/Nacht auf 2 $/Nacht“, berichtete Leo.

**Dedizierte Hosts: Die Compliance-Option**

Einige Softwarelizenzen (Oracle, Windows Server in einigen Konfigurationen) werden pro Sockel oder Kern berechnet. Wenn Sie diese Software auf einem gemeinsam genutzten Host (der Standard für EC2) ausführen, zahlen Sie möglicherweise für Kapazität, die Sie nicht nutzen.

**Dedizierte Hosts** geben Ihnen Zugriff auf einen physischen Server, der ausschließlich für Ihre Nutzung bestimmt ist. Sie können Ihre bestehenden Lizenzen pro Sockel mitbringen. Keine anderen AWS-Kunden-Instanzen laufen auf derselben Hardware.

Dedizierte Hosts sind deutlich teurer als Standard-EC2. Sie sind ein Compliance- und Lizenzierungstool, keine Kostenoptimierung.

Nimbus hatte keine Lizenzierungsanforderungen, die Dedizierte Hosts erfordern. Die meisten Cloud-nativen Anwendungen nicht.

**Aufbau einer Gemischten Flotte**

Der ausgereifte Ansatz: Verwenden Sie mehrere Preismodelle gleichzeitig.

Für die API-Flotte von Nimbus:

- **Basislade (4 Instanzen, immer aktiv)**: Abdeckung durch einen Savings Plan-Verpflichtung
- **Vorhersagbare Spitzenlast (2 zusätzliche Instanzen während der Geschäftszeiten)**: Abdeckung durch einen Savings Plan, wenn die Verpflichtung sie abdeckt, andernfalls On-Demand
- **Verkehrsspitzen-Überlauf**: Spot Instanzen (akzeptabel, da die API-Server stateless sind – Anfragen verteilen sich, wenn eine Instanz beendet wird)

Das Ergebnis: Eine Flotte, die die Kosten auf allen Ebenen optimiert – engagierte Preisgestaltung für den vorhersehbaren Teil, On-Demand für unvorhergesehenes Wachstum, Spot für Burst-Kapazität.

## Stärken und Schwächen

**On-Demand**: Keine Verpflichtung. Voller Preis. Verwenden Sie für unvorhergesehene oder kurzfristige Arbeitslasten.

**Reservierte Instanzen**: Bis zu 72 % Rabatt. Festgeschrieben für einen bestimmten Instanztyp/Region/OS. Verkauf von ungenutzter Kapazität auf dem RI Marketplace.

**Savings Plans**: Bis zu 66-72 % Rabatt. Flexibler als Reservierte Instanzen (Compute Savings Plans gelten für jeden Instanztyp). Automatische Anwendung auf die tatsächliche Nutzung.

**Spot Instanzen**: Bis zu 90 % Rabatt. Risiko einer 2-minütigen Unterbrechung. Nur für fehlertolerante, stateless, unterbrechungsfähige Arbeitslasten.

**Dedizierte Hosts**: Voller physischer Server. Am teuersten. Erforderlich für bestimmte Lizenzierungs- oder Compliance-Szenarien.

## Zusammenfassung

- EC2-Preise haben vier Modelle: **On-Demand** (voller Preis, keine Verpflichtung), **Reservierte Instanzen/Savings Plans** (engagierte Ausgaben für einen erheblichen Rabatt), **Spot** (überschüssige Kapazität zu 60-90 % reduziert, unterbrechungsfähig), **Dedizierte Hosts** (physischer Server-Exklusivität).
- **Savings Plans** werden im Allgemeinen gegenüber Reservierten Instanzen aufgrund ihrer Flexibilität bevorzugt.
- **Spot Instanzen** erfordern fehlertolerante, stateless Arbeitslasten – nur für Batch-Jobs, ML-Training und unterbrechungsfähige Verarbeitung.
- Die optimale Strategie ist eine **gemischte Flotte**: Savings Plans für die Basislinie, On-Demand für unvorhergesehenes Wachstum, Spot für unterbrechungsfähige Batch-Arbeit.
- Überprüfen Sie die Preismodelle, wenn Arbeitslasten seit 3+ Monaten stabil laufen – das ist, wenn On-Demand verschwendet wird.

## Examenstipps

*SAA-C03 Domain: Design Cost-Optimized Architectures (Domain 4, Task 4.2)*

- **Sparpläne vs Reservierte Instanzen**: Sparpläne sind flexibler (gelten für jede EC2-Instanz für Compute Sparpläne). Reservierte Instanzen sind an einen bestimmten Instanztyp gebunden. Examen-Szenarien: „maximalen Flexibilität bei gleichzeitigem Erhalt von Rabatten“ → Sparpläne. „Genaueren Instanztyp für 3 Jahre kennen“ → Standard RI für maximalen Rabatt.
- **Spot-Signale**: „kostenbewusst“, „fehlerverträglich“, „Batch-Verarbeitung“, „kann Unterbrechungen aushalten“, „zustandslose Arbeitslasten“, „ML-Training“ → Spot.
- **Spot-Unterbrechungsbehandlung**: Spot-Instanzen erhalten eine 2-minütige Warnung vor der Beendigung. Ihre Anwendung muss dies geschickt behandeln (Zustand speichern, Verbindungen abschliessen, sauber beenden).
- **On-Demand vs Spot für Webserver**: Webserver, die Live-Benutzertraffic bedienen, sollten NICHT Spot verwenden (Unterbrechungen verursachen fehlgeschlagene Anfragen). Verwenden Sie On-Demand oder Sparpläne für die Web-Ebene.
- **EC2 Sparpläne vs Compute Sparpläne**: EC2 Sparpläne gelten für eine bestimmte Instanzfamilie und Region (höherer Rabatt). Compute Sparpläne gelten für jede EC2-Instanz, Lambda und Fargate (geringerer maximaler Rabatt, flexibler).
- **RI-Marktplatz**: Unbenutzte Standard-Reservierte Instanzen können an andere AWS-Kunden verkauft werden. Umwandelbare RIs können nicht verkauft werden.

## Übungen

**Übung 1 — Erinnerung**

Wann sind Spot Instanzen geeignet und wann nicht? Welches Merkmal macht eine Arbeitslast für Spot geeignet?

*(Hinweis: Denken Sie darüber nach, was passiert, wenn die Instanz mit 2 Minuten Vorlaufzeit beendet wird. Welche Arbeitslasten erholen sich sauber? Welche nicht?)*

**Übung 2 — Examen-Übung**

*Szenario*: Ein Medienunternehmen betreibt eine Video-Transcodierungspipeline, die hochgeladene Videos in mehrere Formate konvertiert. Transcodierungsjobs laufen kontinuierlich, wenn Videos hochgeladen werden (24/7-Betrieb, variable Volumina). Jeder Job dauert 5-30 Minuten. Wenn ein Transcodierungsjob unterbrochen wird, kann der Job vom Anfang an neu gestartet werden, ohne Datenverlust. Das Unternehmen möchte die Kosten minimieren.

Welches EC2-Preismodell erfüllt diese Anforderungen BESTE?

A) On-Demand-Instanzen in einer Auto Scaling Group
B) Reservierte Instanzen (1 Jahr, Alle Vorab)
C) Spot Instanzen mit Spot Fleet für automatische Instanzenvielfalt
D) Dedizierte Hosts mit den bestehenden Mediensoftwarelizenzen des Unternehmens

**Hinweis 1**: „Kann vom Anfang an ohne Datenverlust neu gestartet werden“ – dies ist der Schlüsselbegriff, der ein bestimmtes Preismodell ermöglicht.

**Hinweis 2**: „Kosten minimieren“ mit einer unterbrechbaren Arbeitslast deutet auf die maximale Rabattoption hin.

**Hinweis 3**: Spot Fleet-Anfragen Instanzen aus mehreren Instanztypen und AZs, wodurch das Risiko einer Massenunterbrechung reduziert wird.

**Antwort**: C

**Erläuterung**: Transcodierungsjobs sind fehlerverträglich – sie können bei Unterbrechungen neu gestartet werden. Dies macht sie ideal für Spot Instanzen, die 60-90% Rabatt gegenüber On-Demand bieten. Spot Fleet diversifiziert über Instanztypen und Verfügbarkeitszonen, wodurch das Risiko einer Massenunterbrechung reduziert wird.

**Warum nicht A?** On-Demand ist die teuerste Option. Für einen kontinuierlich laufenden, fehlerverträglich Arbeitslasten ist dies verschwenderisch.

**Warum nicht B?** Reservierte Instanzen bieten einen Rabatt von 50-72 % aber bieten nicht das Potenzial für 90 % Rabatt von Spot für fehlerverträglich Arbeitslasten. Außerdem sind RIs für vorhersehbare, stabile Arbeitslasten gedacht – Spot ist speziell für unterbrechbare Batch-Verarbeitung.

**Warum nicht D?** Dedizierte Hosts sind für Lizenzkonformität, nicht für Kostenoptimierung. Sie sind die teuerste Option.

*SAA-C03 Domain: Design Cost-Optimized Architectures — Task 4.2*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nimbus' Infrastruktur hat diese Arbeitslasten:

1. API-Server: 6 Instanzen, 24/7, seit 2 Jahren stabil, r6g.large
2. Nachtliche Analysen-Batch-Jobs: 4 Instanzen, 3AM-6AM jede Nacht, immer derselbe Instanztyp
3. Testumgebung: 2 Instanzen, von Ingenieuren 9 AM-6 PM an Wochentagen genutzt
4. Traffic-Spike-Überlauf: 0-8 Instanzen, bei Spitzenzeiten hochgefahren, völlig unvorhersehbar

Entwerfen Sie die optimale Preisstrategie für jeden Arbeitslasttyp. Welche Sparplan-Verpflichtungsmenge deckt Arbeitslasten 1 und 2 ab? Für Arbeitslast 3 gibt es eine intelligentere Strategie als On-Demand?

*(Es gibt keine eindeutige korrekte Antwort. Das Ziel ist, EC2-Preisstrategien zu üben.)*

## Post-Credits-Szene

Tom hat den Sparplan-Kauf eingereicht.

Verpflichtungsmenge: 5,76 €/Stunde. Drei-Jahres-Zahlung. Compute Sparpläne für Flexibilität.

Die geschätzten Einsparungen: 42.500 € über drei Jahre.

Maya liest die Zahl. „Vierzehn Tausend Fünfhundert Euro.“

„Im Vergleich zu On-Demand für die gleichen Instanzen über drei Jahre.“

„Was hat das gekostet?“

„Ein Nachmittag der Analyse“, sagte Tom. „Und die Entscheidung, sich zu verpflichten.“

„Drei Jahre sind eine lange Zeit“, sagte Leo. „Was passiert, wenn sich Instanztypen ändern?“

„Compute Sparpläne gelten für jede EC2-Instanzart. Und in drei Jahren sind wir groß genug, dass diese Diskussion anders aussieht.“

Leo dachte darüber nach.

„Wie lange kennst du Sparpläne?“ fragte Leo.

„Seit wir angefangen haben“, sagte Tom. „Ich wartete, bis die Arbeitslast stabil genug war, um mich zu verpflichten.“

„Achtzehn Monate des Bezählens von On-Demand, während ich wartete.“

„Ja.“ Tom schloss die Konsole. „Manchmal ist das Teuerste, was du tust, Geld zu sparen, während du wartest.“

In dem nächsten Kapitel: dieselbe Disziplin wird auf Lagerkosten angewendet, mit einigen Überraschungen, was die Rechnung antreibt.
