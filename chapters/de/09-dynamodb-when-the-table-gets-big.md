# Kapitel 9: Wenn die Tabelle Groß Wird

Die Menütabelle hatte 50.000 Artikel.

Das betraf 287 Restaurants, von denen jedes tägliche Sonderangebote, saisonale Artikel und regionale Variationen hatte. Einige Artikel hatten Modifikatoren – Größe, Schärfegrad, Proteinauswahl. Einige hatten Kombiangebote, die auf andere Artikel verwiesen. Einige erschienen nur an Wochentagen auf der Speisekarte, nur während der Mittagszeit oder nur in bestimmten Städten.

Die SQL-Abfrage, die das vollständige Menü eines Restaurants abrufen ließ, benötigte früher 200 Millisekunden.

Jetzt dauerte es vier Sekunden.

Vier Sekunden ist der Unterschied zwischen dem, wenn jemand eine Bestellung aufgibt, und dem, wenn jemand die App schließt. Leo hatte den Abfrageplan ausgeführt. Tom hatte sich die Indexkonfiguration angesehen. Priya hatte die Anzahl der Read-Replikate erhöht. Nichts davon hatte einen spürbaren Unterschied gemacht.

Und das änderte die Stimmung im Raum.

Wenn ein Problem das Indizieren, die Caching-Versuche und eine zusätzliche Replik übersteht, gehen die Leute davon aus, dass die Lösung clever sein wird.

Manchmal ist die Lösung, dass die Form des Systems falsch ist.

„Das Problem“, sagte Leo, „ist die Form der Daten. SQL möchte alles in Zeilen und Spalten. Unsere Menüs haben keine feste Form.“

Das war der Beginn eines längeren Gesprächs.

**Das Problem mit dem Einfügen Alles in eine Tabelle**

Hier ist die Kernspannung von relationalen Datenbanken: Sie sind so konzipiert, dass *strukturierte* Daten in *festen* Formen gespeichert werden.

Wenn jeder Menüpunkt die gleichen Felder hätte – Name, Preis, Beschreibung, Kategorie – wäre SQL perfekt. Sie hätten eine saubere `menu_items`-Tabelle, Zeilen für jeden Artikel und Abfragen, die Sinn machen.

Aber echte Menüs funktionieren nicht so.

Ein Artikel könnte einen „Schärfegrad“-Modifikator haben. Ein anderer könnte eine „Proteinauswahl“ haben. Ein dritter könnte verschachtelte Kombis haben – „Bestellen Sie die Familienmahlzeit und Sie erhalten zwei Hauptgerichte, zwei Beilagen und ein Getränk“. Die Struktur der Daten variiert *pro Artikel*.

In SQL haben Sie zwei Optionen:

**Option 1**: Erstellen Sie eine Spalte für jeden möglichen Modifikator. Dies erzeugt eine sehr breite Tabelle, bei der die meisten Spalten die meisten Zeit leer sind.

**Option 2**: Erstellen Sie eine separate Modifikatortabelle und verknüpfen Sie diese mit der Menütabelle. Das funktioniert, aber komplexe Menüs erfordern mehrere Verknüpfungen, und bei 50.000 Artikeln mit hohem Leseaufkommen werden diese Verknüpfungen teuer.

„Es gibt eine dritte Option“, sagte Priya, die in der Ecke leise die Dokumentation las.

Sie öffnete einen neuen Tab. „Was passiert, wenn die Daten nicht in eine Tabelle passen müssen?“

**Eine Andere Art, Daten zu Betrachten**

Relationale Datenbanken speichern Daten als Zeilen in Tabellen. Jede Zeile muss dem Tabellenlayout entsprechen. Das Layout wird im Voraus vereinbart.

NoSQL-Datenbanken speichern Daten anders. Ein gängiger Ansatz ist das *Dokumentenmodell*: Jedes Datenelement wird als eigenständiges Dokument (normalerweise JSON) gespeichert, und Dokumente in derselben Sammlung müssen nicht die gleichen Felder haben.

Ein Menüpunkt im Dokumentenmodell könnte wie folgt aussehen:

```json
{
  "itemId": "ITEM-001",
  "restaurantId": "NIMBUS-047",
  "name": "Shrimp Arepa",
  "price": 3200,
  "modifiers": [
    { "name": "Spice Level", "options": ["mild", "medium", "hot"] },
    { "name": "Protein", "options": ["shrimp", "fish", "mixed"] }
  ],
  "available": true,
  "seasonalUntil": "2024-03-31"
}
```

Another item might look completely different:

```json
{
  "itemId": "ITEM-002",
  "restaurantId": "NIMBUS-047",
  "name": "Family Feast",
  "price": 9800,
  "includes": ["ITEM-010", "ITEM-011", "ITEM-015", "ITEM-020"],
  "servings": 4,
  "available": true
}
```

Verschiedene Formen. Dieselbe Sammlung. Kein Problem.

„Also ist die Datenbank eher wie ein Ablagesystem als eine Tabelle“, sagte Maya.

„Genau“, sagte Priya. „Du kannst jedes Dokument in jeden Ordner legen. Du musst das Dokument nicht zuschneiden, um es an eine feste Größe anzupassen.“

**Meet DynamoDB**

Amazon DynamoDB ist der verwaltete NoSQL-Datenbankdienst von AWS. Es speichert Daten als Elemente (nicht als Zeilen), und Elemente werden in Tabellen gesammelt (die Benennung ist ähnlich wie bei SQL, aber das Verhalten ist anders).

Jedes Element in einer DynamoDB-Tabelle muss einen **Primärschlüssel** haben, der es eindeutig identifiziert. Alles andere ist flexibel.

Der Primärschlüssel kann eine von zwei Formen haben:

**Nur Partitionsschlüssel:** Ein einzelnes Attribut, das über alle Elemente hinweg eindeutig sein muss.

**Partitionsschlüssel + Sortierschlüssel (zusammengesetzter Primärschlüssel):** Zwei Attribute, die *zusammen* eine eindeutige Kombination bilden. Dadurch können Sie mehrere Elemente mit demselben Partitionsschlüssel haben, die sich durch ihren Sortierschlüssel unterscheiden.

Für das Menü von Nimbus:

- Partitionsschlüssel: `restaurantId`
- Sortierschlüssel: `itemId`

Das bedeutet, dass Sie alle Elemente für ein bestimmtes Restaurant effizient abrufen können – DynamoDB weiß genau, in welche Partition es suchen muss.

„Warum heißt es Partitionsschlüssel?“, fragte Tom.

**Wie DynamoDB Daten Intern Speichert**

DynamoDB ist so konzipiert, dass es horizontal skaliert, um riesige Größen zu erreichen. Dies wird durch *Partitionierung* erreicht – Daten werden auf der Grundlage des Partitionsschlüssels auf viele physische Maschinen aufgeteilt.

Wenn ein Element geschrieben wird, hasht DynamoDB den Wert des Partitionsschlüssels und verwendet diesen Hash, um zu bestimmen, welche physische Partition (und somit welcher Server) das Element speichert. Wenn ein Element gelesen wird, führt DynamoDB die gleiche Berechnung durch, um es sofort zu finden.

Man kann es sich wie ein Postsystem vorstellen. Wenn jedes Umschlag ein Postleitzahl hat, sortiert der Postdienst die Umschläge nicht nach jeder Postleitzahl, um herauszufinden, wohin sie gehören – er sortiert nach Postleitzahl. DynamoDB sortiert nach dem Hash des Partitionsschlüssels.

Deshalb ist es wichtig, einen guten Partitionsschlüssel auszuwählen:

- **Gut:** Hohe Kardinalität, gleichmäßig verteilte Werte (`restaurantId` mit vielen Restaurants)
- **Schlecht:** Geringe Kardinalität (`true/false`, `category`) – die meisten Daten landen auf einigen Partitionen, was zu "heißen Hotspots" führt.

Ein heißer Punkt bedeutet, dass eine Partition den Großteil des Traffics erhält. Diese Partition wird zum Engpass. DynamoDB beginnt, Anfragen zu drosseln. Benutzer erhalten Fehlermeldungen.

„Also, wenn ich `available: true` als Partitionsschlüssel verwende“, sagte Leo langsam, „würden alle verfügbaren Elemente auf derselben Partition zusammengeklumpt.“

„Und Ihre Datenbank würde bei der Mittagsrush schmelzen“, bestätigte Priya.

Leo schloss seinen Laptop langsam.

**Lesen und Schreiben im Massstab**

DynamoDB kann Millionen von Anfragen pro Sekunde verarbeiten. Aber es muss wissen, welche Kapazität es provisionieren muss.

Es gibt zwei Kapazitätsmodi:

**Provisionierte Kapazität:** Sie geben an, wie viele Lese- und Schreibvorkenntnisse Sie möchten. DynamoDB reserviert diese Kapazität für Sie und drosselt den Verkehr, der sie überschreitet. Vorhersagbarer Preis, geringerer Preis pro Anfrage.

**On-Demand-Kapazität:** DynamoDB skaliert automatisch mit Ihrem tatsächlichen Verkehr. Keine Routine-Kapazitätsplanung erforderlich. Höhere Kosten pro Anfrage und viel einfacher im Betrieb, obwohl plötzliche Spitzen über dem Verkehrsmuster der letzten Zeit bei zu schnellem Ansteigen immer noch zu Drosselung führen können.

Für Nimbus wird das Menü viel öfter gelesen als es geschrieben wird. Ein Kunde öffnet die App, stöbert im Menü – das sind viele Lesevorgänge. Ein Restaurantpartner aktualisiert sein Menü zweimal pro Woche – das sind gelegentliche Schreibvorgänge.

„On-Demand ist jetzt sinnvoll“, sagte Tom. „Wir wissen noch nicht, welche Verkehrsmuster wir haben. Es ist besser, mehr zu bezahlen pro Anfrage, als unterzubereiten und gedrosselt zu werden.“

Zögerliche Infrastrukturweisheit. Von Tom. Das Team war offiziell gewachsen.

**Konsistenz: Wie Frisch Sind Ihre Daten?**

DynamoDB repliziert Daten automatisch über mehrere Availability Zones hinweg. Das ist gut für die Ausfallsicherheit, bedeutet aber auch, dass Sie über die Lesekonsistenz nachdenken müssen.

Wenn Sie von DynamoDB lesen, haben Sie eine Wahl:

**Eventuell konsistente Lesezugriff:** Dies ist der Standard. Es ist günstiger und das Ergebnis kann kurz hinter einem kürzlich abgeschlossenen Schreibvorgang zurückbleiben.

**Stark konsistente Lesezugriff:** Für Lesezugriffe auf eine Tabelle oder einen lokalen sekundären Index kann DynamoDB den neuesten bestätigten Wert aus erfolgreichen vorherigen Schreibvorgängen zurückgeben. Dies kostet mehr Lese-Kapazität und ist nicht für globale sekundäre Indizes verfügbar.

Für Menudaten ist eine eventuell konsistente Lesezugriff ausreichend. Ein Menüpunkt, der eine Millisekunde veraltet ist, spielt keine Rolle.

Für Bestellbestätigungsdaten – „Wurde diese Bestellung aufgegeben?“ – möchten Sie einen starken konsistenten Lesezugriff. Der Kunde sollte keine „Versuchen Sie es erneut“-Nachricht sehen, wenn seine Bestellung gerade gespeichert wurde.

„Es ist wie der Unterschied zwischen dem Überprüfen Ihres Bankguthabens in der App und dem Anrufen der Bank“, sagte Maya. „Die App kann 30 Sekunden hinterherhinken. Der Telefonanruf ist immer aktuell.“

**Das Trade-Off: Was DynamoDB Nicht Können**

NoSQL ist nicht streng besser als SQL. Es ist ein anderes Werkzeug für eine andere Aufgabe.

Was DynamoDB aufgibt:

**Flexible Abfragen:** In SQL können Sie filtern und sortieren nach jeder Spalte. In DynamoDB können Sie effizient nur nach Primärschlüssel abfragen. Abfragen nach beliebigem Feld erfordert einen *Scan* (das Lesen jedes Elements in der Tabelle), was bei großen Mengen teuer und langsam ist.

**Verbindungen**: DynamoDB führt keine Joins durch. Wenn Sie Daten aus zwei Tabellen benötigen, führen Sie in Ihrem Anwendungscode zwei separate Leseoperationen durch.

**Transaktionen**: DynamoDB unterstützt Transaktionen, aber relationale Datenbanken sind für viele mehrteilige Arbeitsabläufe, Reporting-lastige Systeme und Join-lastige Designs immer noch die natürlichere Wahl.

**Vertrautheit**: Jahrzehnte der SQL-Werkzeuge, Fähigkeiten und Denkweisen lassen sich nicht direkt übertragen.

Worin DynamoDB glänzt:

- Schlüssel-Wert- und Dokumentzugriffsmuster
- Massive Skalierbarkeit (bei beliebiger Größe eine Latenz von einstelligen Millisekunden)
- Serverless, keine Infrastrukturverwaltung
- Automatisches Skalieren, Multi-AZ-Replikation, Backups
- Vorhersagbare Leistung unabhängig vom Datenvolumen

„Die Regel ist also“, sagte Maya, „verwenden Sie DynamoDB, wenn Sie *genau* wissen, wie Sie auf die Daten zugreifen. Verwenden Sie SQL, wenn Sie es noch nicht wissen.“

Priya nickte. „Gestalten Sie Ihre Zugriffsmodelle zuerst. Dann wählen Sie Ihre Datenbank.“

Dies ist eines der wichtigsten Dinge, die ein Datenbankgespräch produzieren kann.

**Wann Sie jede verwenden sollten**

| Situation                                             | Erreichen Sie                               |
|-------------------------------------------------------|-------------------------------------------|
| Strukturierte Daten, komplexe Abfragen, Berichterstellung | RDS (PostgreSQL, MySQL)                   |
| Flexible Datenformen, schlüsselbasierter Zugriff, massive Skalierbarkeit | DynamoDB                                  |
| Schreiblast mit komplexen Beziehungen                | RDS                                       |
| Leseleistung mit vorhersehbaren Zugriffsmustern           | DynamoDB                                  |
| Sie benötigen Joins und Aggregationen                 | RDS                                       |
| Sie benötigen Millisekunden-Latenz bei Millionen von Anfragen pro Sekunde | DynamoDB                                  |
| Transaktionen über mehrere Entitäten hinweg           | RDS (meistens)                            |
| Serverless / unvorhergesehene Verkehrsschwankungen     | DynamoDB on-demand                         |

Der falsche Ansatz ist immer „immer eine oder die andere verwenden“. Nimbus verwendete beide: RDS für Bestellhistorien und Finanzunterlagen (strukturiert, relational, benötigt Berichterstellung), DynamoDB für das Menü (flexibles Schema, hoher Leseumfang, Zugriff über Restaurant-ID).

## Stärken und Grenzen

**Warum DynamoDB leistungsstark ist**:

- Eine Latenz von einstelligen Millisekunden bei beliebiger Skalierung
- Vollständig verwaltet – keine Patches, keine Replikationskonfiguration, keine Wartungsfenster
- Automatisches Multi-AZ-Replikation (Durabilität ist integriert)
- On-Demand-Skalierung bedeutet keine Kapazitätsplanung
- Native Integration mit Lambda, API Gateway, Streams
- Punkt-in-Zeit-Wiederherstellung (ähnlich wie RDS automatisierte Backups)
- DynamoDB Streams – erfassen Sie jede Änderung als Ereignis (nützlich für die Echtzeitverarbeitung)

**Wo DynamoDB kompliziert wird**:

- Das Design von Zugriffsmodellen ist unverhandelbar – Fehler sind teuer zu beheben
- Komplexe Abfragen erfordern sekundäre Indizes (erhöhen die Kosten und die Komplexität)
- Scans sind teuer – vermeiden Sie sie in der Produktion
- Die „Artikelgröße“ beträgt 400 KB – große Artikel benötigen andere Speicherlösungen
- Die Preisgestaltung kann Sie überraschen, wenn Sie die Kosten für Lese- und Schreib-Einheiten nicht verstehen

## Zusammenfassung

- DynamoDB ist der verwaltete NoSQL-Datenbankdienst von AWS.
- Artikel werden als flexible Dokumente gespeichert – kein festes Schema erforderlich.
- Jeder Artikel muss einen **Primärschlüssel** haben: einen Partitionsschlüssel allein oder einen Partitionsschlüssel + Sortenschlüssel.
- Der Partitionsschlüssel bestimmt, welche physische Partition der Artikel gespeichert wird. Wählen Sie ihn für eine gleichmäßige Verteilung.
- **On-Demand**-Kapazität skaliert automatisch; **Provisionierte** Kapazität ist günstiger, wenn Ihr Traffic vorhersehbar ist.
- **Eventuell konsistente** Leseoperationen sind günstiger und schneller. **Stark konsistente** Leseoperationen sind immer aktuell.
- DynamoDB glänzt bei schlüsselbasierterem Zugriff in massiver Skalierung. Es hat Schwierigkeiten mit Ad-hoc-Abfragen und Joins.
- Verwenden Sie RDS für relationale Daten. Verwenden Sie DynamoDB für Dokument-/Schlüssel-Wert-Daten. Verwenden Sie beide, wenn die Situation dies erfordert.

## Examenstipps

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.3)*

- Kennen Sie die Partitionsschlüsselregeln: **hohe Kardinalität, gleichmäßige Verteilung**. Heiße Partitionen sind eine häufige Prüfungstaste.
- **On-Demand vs Provisioned**: On-Demand für unvorhersehbaren Traffic; Provisioned (mit Auto Scaling) für vorhersehbare Arbeitslasten.
- **DynamoDB Streams**: Erfasst item-level-Änderungen in Echtzeit. Häufiges Prüfungsszenario: „Legen Sie eine Lambda-Funktion aus, wenn ein Datensatz geändert wird.“
- **Globale Tabellen**: Multi-Region, Multi-Active-Replikation für global verteilte Anwendungen und Disaster-Recovery-Szenarien. Auf der Prüfung ist dies ein starkes Signal, wenn die Arbeitslast lokale Lese- und Schreibvorgänge in mehr als einer Region benötigt.
- **DAX (DynamoDB Accelerator)**: In-Memory-Caching-Layer für DynamoDB. Reduziert die Latenz von Millisekunden auf Mikrosekunden. Prüfung verwendet dies, wenn RDS-Repliken nicht helfen (weil es sich um einen DynamoDB-spezifischen Cache handelt).
- **Kompositorischer Primärschlüssel**: Partitionsschlüssel + Sortenschlüssel ermöglicht flexible Abfragen innerhalb einer Partition. Beispiel: Abrufen aller Bestellungen für einen Kunden zwischen zwei Datumsangaben – `customerId` ist der Partitionsschlüssel, `orderDate` ist der Sortenschlüssel.
- Kennen Sie, wann Sie DynamoDB nicht verwenden sollten: komplexe Joins, Ad-hoc-Berichterstellung, mehrteilige Transaktionen → RDS ist normalerweise die Antwort.

## Übungen

**Übung 1 – Erinnerung**

Erklären Sie den Unterschied zwischen einem Partitionsschlüssel und einem Sortenschlüssel. Wann würden Sie beide verwenden?

*(Hinweis: Denken Sie über das Nimbus-Menü nach – warum macht die Verwendung von restaurantId als Partition Key und itemId als Sort Key das effiziente Abrufen des vollständigen Menüs eines Restaurants möglich?)*

**Übung 2 – Klausurenübung**

*Szenario*: Ein globales Gaming-Unternehmen speichert Spielerprofile in DynamoDB. Jedes Profil enthält Felder wie Benutzernamen, Level, Errungenschaften und Inventar. Einige Spieler haben 10 Inventarpositionen; andere haben 5.000 benutzerdefinierte Konfigurationen. Das Unternehmen benötigt eine Latenz von einstelligen Millisekunden für Profilabfragen während des aktiven Spiels.

Welcher Designansatz unterstützt diese Anforderung BEST?

A) Migration zu RDS Aurora mit Read Replikaten in jeder Region
B) Verwendung von DynamoDB mit `playerId` als Partition Key und Speicherung des gesamten Profils als ein einzelnes Element
C) Verwendung von DynamoDB mit `level` als Partition Key zur Gruppierung von Spielern ähnlicher Spielstärke
D) Verwendung von ElastiCache vor RDS, um eine Unter-Millisekunden-Latenz zu erreichen

**Hinweis 1**: Das Zugriffsmodell ist „Suchen Sie einen bestimmten Spieler anhand seiner ID“. Welcher Schlüssel macht dies effizient?

**Hinweis 2**: Eine Option erzeugt eine terrible heiße Partition. Welches Attribut hat eine sehr geringe Kardinalität?

**Hinweis 3**: DynamoDB liefert bereits native Latenzen von einstelligen Millisekunden.

**Antwort**: B

**Erläuterung**: Die Verwendung von `playerId` als Partition Key verteilt die Daten gleichmäßig auf Partitionen und ermöglicht sofortige Abfragen anhand der Spieler-ID – genau das Zugriffsmodell, das beschrieben wird. Das flexible Dokumentmodell von DynamoDB kann unterschiedliche Inventargrößen ohne Schemaänderungen verarbeiten.

**Warum nicht A?** RDS Aurora mit Read Replikaten erhöht die Komplexität und ist dennoch nicht die natürliche erste Wahl für solche key-basierten Profilabfragen im Gaming-Maßstab.

**Warum nicht C?** Die Verwendung von `level` als Partition Key erzeugt schwere heiße Partitionen – der Großteil des Traffics geht zu Level 1 (neue Spieler) oder Maximallevel (aktive Veteranen) und lässt andere Partitionen ungenutzt.

**Warum nicht D?** Die Frage beschreibt DynamoDB, nicht RDS. Die Hinzufügung von ElastiCache vor RDS führt zu zwei neuen Diensten, wenn DynamoDB allein das Problem löst.

*SAA-C03 Domäne: Design Hochleistungsarchitekturen – Aufgabe 3.3*

**Übung 3 – Architektur-Herausforderung *(Optional)***

Nimbus fügt eine „Favoriten“-Funktion hinzu: Kunden können ihre Lieblingsmenüpunkte speichern und mit einem einzigen Fingertipp neu anordnen.

Entwerfen Sie die DynamoDB-Tabelle für diese Funktion. Welcher wäre der Partition Key? Würden Sie einen Sort Key verwenden? Wie würde die Item-Struktur aussehen?

Betrachten Sie dann: Was passiert, wenn Sie anzeigen müssen „Die 100 meist-gefavorisierten Elemente über alle Kunden hinweg“? Kann DynamoDB dies effizient beantworten? Wenn nicht, was würden Sie zur Architektur hinzufügen?

*(Es gibt keine einzelne richtige Antwort. Das Ziel ist es, zu üben, für Zugriffsmodelle zu entwerfen.)*

## Post-Credits-Szene

Leo hatte das Menü bis zum Ende der Woche nach DynamoDB migriert. Die Reads waren schnell. Das Schema war flexibel. Die Restaurantpartner konnten beliebige Modifier-Felder hinzufügen, wie sie wollten.

Er fühlte sich gut dabei.

Dann sah Priya das Überwachungs-Dashboard.

„Leo“, sagte sie, „macht jede Seitenladung 47 DynamoDB-Anfragen.“

„Eine pro Restaurant“, bestätigte Leo. „Weil der Kunde auf der Browse-All-Seite ist.“

„Und jede dieser Anfragen dauert etwa vier Millisekunden.“

Leo machte die Rechnung. 47 mal 4. „Das ist… 188 Millisekunden nur für das Menü. Bevor es gerendert wird.“

„Auf jeder Seite.“

„Für jeden Kunden.“

Er starrte auf den Bildschirm.

„Wir brauchen einen Cache“, sagte er.

Im nächsten Kapitel: Die Schicht zwischen der Nimbus-Anwendung und ihrer Datenbank, die langsame Abfragen schnell macht.
