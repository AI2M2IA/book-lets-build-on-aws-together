# Kapitel 19: Die Kassenmaschine

Die Kassenmaschine war eine stille Revolution. Nehmen Sie eine Nummer, warten Sie, bis Sie aufgerufen werden. Die Schlange wurde zu einer Warteschlange. Die Leute konnten Platz nehmen. Der Service-Schalter arbeitete in seinem eigenen Tempo. Niemand blockierte jemanden.

Nimbus hatte ein Problem, das sich nicht wie ein Problem anfühlte, bis Bestellungen populär wurden.

Jedes Mal, wenn eine Bestellung aufgegeben wurde, musste der API-Server:

1.  Die Bestellung in der Datenbank speichern
2.  Eine Benachrichtigung an die Tablet-Oberfläche des Restaurants senden
3.  Eine Bestätigungs-E-Mail an den Kunden senden
4.  Das Analysetabellen-Dashboard des Restaurants aktualisieren
5.  Das Ereignis für die Abrechnung protokollieren

All dies musste synchron erfolgen, bevor der API auf den Kunden antworten konnte. Wenn der E-Mail-Dienst langsam war (was manchmal der Fall war), wartete der Kunde. Wenn das Analysetabellen-Dashboard ausfiel (was manchmal der Fall war), schlug die Bestellung fehl.

„Wir sind eng gekoppelt“, sagte Priya. „Wenn ein nachgelagerter Schritt fehlschlägt, schlägt die gesamte Bestellung fehl.“

„Was wäre, wenn wir die Bestellung speichern und den Kunden sofort bestätigen könnten, und dann den Rest im Hintergrund verarbeiten würden?“, sagte Leo.

„Das ist eine Warteschlange“, sagte Priya.

**Das Deli-Counter-Modell**

An einem belebten Deli-Stand hat die Person an der Kasse nicht darauf gewartet, dass der Schneideblock fertig geschnitten hat, bevor sie den nächsten Kunden bedient hat. Sie nahm die Bestellung entgegen, gab sie an die Küche weiter und bediente die nächste Person. Die Küche arbeitete die Bestellungen in ihrem eigenen Tempo durch.

Der Kunde erhielt einen schnelleren Service. Die Küche wurde nicht durch plötzliche Ausbrüche überlastet. Wenn die Küche einen langsamen Moment hatte, stapelten sich die Bestellungen in der Warteschlange, anstatt Fehler an der Kasse zu verursachen.

Dies ist **Entkopplung**: Das Trennen der Komponente, die Arbeit annimmt, von den Komponenten, die sie verarbeiten.

In Software-Systemen ist die Warteschlange oft ein Message Broker – ein Dienst, der Nachrichten von Produzenten entgegennimmt und sie an Konsumenten ausliefert.

**Amazon SQS: Die Warteschlange**

**Amazon SQS (Simple Queue Service)** ist der verwaltete Message-Queue-Dienst von AWS. Er speichert Nachrichten dauerhaft, bis sie von einem Konsumenten verarbeitet werden.

Der grundlegende Ablauf:

1.  **Produzent** (der API-Server) platziert eine Nachricht in der Warteschlange: `{ "orderId": "ORD-5532", "restaurantId": "47", "items": [...] }`
2.  Der API antwortet sofort dem Kunden: „Bestellung bestätigt!“
3.  **Konsumenten** (separate Arbeitsdienste) lesen Nachrichten aus der Warteschlange und verarbeiten sie: senden die Restaurantbenachrichtigung, senden die Bestätigungs-E-Mail, aktualisieren Analysen

Die Kundenerfahrung: Sofortige Bestätigung. Die nachgelagerte Verarbeitung: findet asynchron statt, im Tempo der Arbeitsdienste.

**SQS-Schlüsselkonzepte**

**Message-Visibility-Timeout**: Wenn ein Konsument eine Nachricht aus SQS liest, wird die Nachricht für einen Zeitraum (Standard: 30 Sekunden) für andere Konsumenten *unsichtbar*. Dies gibt dem Konsumenten Zeit, sie zu verarbeiten. Wenn der Konsument erfolgreich abschließt, löscht er die Nachricht. Wenn der Konsument abstürzt, verfällt die Visibility-Timeout-Periode und die Nachricht wird für einen anderen Konsumenten erneut versucht.

Dies gewährleistet eine Zustellung mit mindestens einmal: Jede Nachricht wird mindestens einmal verarbeitet, auch wenn ein Konsument während der Verarbeitung ausfällt.

**Dead-Letter-Queues (DLQ)**: Wenn eine Nachricht das zu viele Wiederholungen (konfigurierbar – z. B. 5 Versuche) überschreitet, verschiebt SQS sie in eine Dead-Letter-Queue. Sie können die DLQ untersuchen, um zu verstehen, warum Nachrichten fehlschlagen, ohne sie zu verlieren.

**Warteschlangentypen**:

**Standard-Warteschlangen**: Maximale Durchsatz (unbegrenzte Nachrichten pro Sekunde). Die Zustellung in der Reihenfolge ist best-effort (nicht garantiert). Zustellung mit mindestens einmal (sehr selten kann eine Nachricht zweimal geliefert werden).

**FIFO-Warteschlangen**: Strikte First-In, First-Out-Reihenfolge. Genau einmal Zustellung. Begrenzt auf 3.000 Nachrichten pro Sekunde mit Batching, 300 ohne. Verwenden Sie sie, wenn die Reihenfolge wichtig ist (finanzielle Transaktionen, sequentielle Statusänderungen).

Für Nimbus wurden die meisten Warteschlangen Standard-Warteschlangen verwendet. Die Abrechnungs-Warteschlange verwendete FIFO, um sicherzustellen, dass Gebühren in der Reihenfolge verarbeitet wurden.

**Amazon SNS: Der Sender**

**Amazon SNS (Simple Notification Service)** ist ein Publish/Subscribe (Veröffentlichen/Abonnieren)-Messaging-Dienst. Anstatt eines einzelnen Produzenten, eines einzelnen Konsumenten (Warteschlange) unterstützt SNS, dass eine Nachricht an *viele* Abonnenten gleichzeitig zugestellt wird.

Das Modell:

1.  Ein **Verleger** sendet eine Nachricht an ein SNS **Thema**
2.  Alle **Abonnenten** dieses Themas erhalten die Nachricht gleichzeitig (Fan-Out)

Abonnenten können sein:

-   SQS-Warteschlangen (schieben die Nachricht in eine Warteschlange für die asynchrone Verarbeitung)
-   Lambda-Funktionen (lösen die Funktion direkt aus)
-   HTTP/HTTPS-Endpunkte (Webhook-Lieferung)
-   E-Mail-Adressen
-   SMS (Telefonnummern)

Für Nimbus wurde das Ereignis „gegebene Bestellung“ an ein SNS-Thema namens `order-events` veröffentlicht:

-   Der Restaurant-Benachrichtigungsdienst meldet sich an (empfängt in seiner SQS-Warteschlange)
-   Der E-Mail-Dienst meldet sich an (empfängt in seiner SQS-Warteschlange)
-   Der Analysedienst meldet sich an (empfängt in seiner SQS-Warteschlange)
-   Der Abrechnungsdienst meldet sich an (empfängt in seiner FIFO-SQS-Warteschlange)

Eine einzige Auftragsveranstaltung. Vier Abonnenten. Alle benachrichtigt gleichzeitig. Jeder verarbeitet in seinem eigenen Tempo.

„Also ist SNS die Ankündigung, und SQS ist das Postfach, in dem jedes Team die Ankündigung in seinem eigenen Tempo verarbeitet“, sagte Maya.

„Genau“, sagte Leo. „Das SNS/SQS-Fan-Out-Muster ist das Standardmuster.“

**Das SNS/SQS-Fan-Out-Muster**

Dieses Zusammenspiel – SNS-Thema, das mehrere SQS-Warteschlangen versorgt – ist eines der wichtigsten architektonischen Muster in AWS.

```
API Server
    |
    | publishes to
    ↓
SNS Topic: "order-placed"
    |
    |—————————————————|—————————————————|
    ↓                 ↓                 ↓
SQS Queue         SQS Queue         SQS Queue
(notifications)  (email service)   (analytics)
    |                 |                 |
    ↓                 ↓                 ↓
Worker             Worker            Worker
Lambda/EC2        Lambda/EC2        Lambda/EC2
```

```markdown
Jede Warteschlange ist unabhängig. Der Analysedienst kann langsam sein – seine Warteschlange füllt sich, aber die Benachrichtigungs- und E-Mail-Dienste laufen weiterhin unverändert. Wenn der Analysedienst ausfällt, warten seine Nachrichten in der Warteschlange, bis er wieder hochfährt. Nichts geht verloren.

Dies ist die Schlüssel-Eigenschaft: **unabhängiger Ausfall**. Probleme in einem Konsument beeinflussen andere nicht.

**Nachrichtenfilterung: Nicht jede Nachricht für jeden Abonnenten**

Wenn Systeme wachsen, möchten Sie nicht, dass jeder Abonnent jede Nachricht verarbeitet. Ein Restaurant-Benachrichtigungsdienst sollte keine Nachrichten über fehlgeschlagene Zahlungen erhalten, wenn er nur an den Abschluss von Bestellungen interessiert ist.

**SNS-Nachrichtenfilterung** ermöglicht es Abonnenten, Filterrichtlinien anzugeben – nur Nachrichten, die bestimmte Attribute erfüllen, werden ausgeliefert.

Der Restaurant-Benachrichtigungsdienst abonniert mit einer Filterrichtlinie: nur Nachrichten, bei denen `status = "bestätigt"`.

Der Fehler-Alarmdienst abonniert mit einer Filterrichtlinie: nur Nachrichten, bei denen `status = "fehlgeschlagen"`.

Jeder Abonnent erhält nur das, was er benötigt.

**Wann sollte man SQS anstelle von SNS verwenden**

**SQS allein**: Ein Produzent, ein Konsument (oder mehrere konkurrierende Konsumenten auf derselben Warteschlange). Nachrichten müssen einmal verarbeitet werden, in der Reihenfolge (FIFO) oder nicht (Standard). Worker-Warteschlangenmuster – eine Warteschlange, mehrere Arbeiter, die daraus konsumieren.

**SNS allein**: "Fire and forget"-Benachrichtigungen. Senden Sie E-Mails, SMS oder HTTP-Endpunkte. Es ist nicht erforderlich, die Nachricht in einer Warteschlange zu speichern – benachrichtigen Sie einfach und fahren Sie fort.

**SNS + SQS (Fan-Out)**: Ein Ereignis, mehrere unabhängige Konsumenten. Jeder Konsument hat seine eigene Warteschlange, verarbeitet unabhängig und kann unabhängig fehlschlagen.

## Stärken und Grenzen

**Warum SQS und SNS leistungsstark sind**:

- SQS bietet zuverlässige, dauerhafte Nachrichtenübertragung – Nachrichten werden über mehrere AZs gespeichert
- Die Entkopplung ermöglicht unabhängiges Skalieren und Bereitstellen von Produzenten- und Konsumentendiensten
- Dead-Letter-Warteschlangen stellen sicher, dass keine Nachricht bei einem Ausfall stillschweigend verloren geht
- Das Fan-Out-Muster von SNS ermöglicht das Hinzufügen neuer Konsumenten, ohne den Produzenten zu ändern

**Wo es kompliziert wird**:

- Die Zustellung "mindestens einmal" bedeutet, dass Konsumenten idempotent sein müssen – das doppelte Verarbeiten derselben Nachricht sollte keine Probleme verursachen (doppelte Bestellungen, doppelte Abbuchungen)
- FIFO-Warteschlangen sind teurer und haben Durchsatzbeschränkungen
- Die Fehlersuche bei fehlgeschlagenen Nachrichten über mehrere Warteschlangen und Dienste erfordert eine gute Protokollierung und Überwachung
- Nachrichten-Ordering-Garantien sind begrenzt – wenn ein striktes Ordering über mehrere Dienste erforderlich ist, wird das Design komplex

## Zusammenfassung

- **Entkopplung** trennt Komponenten, die Arbeit erzeugen, von Komponenten, die sie verarbeiten.
- **SQS** ist eine verwaltete Warteschlange. Produzenten senden Nachrichten; Konsumenten lesen und verarbeiten sie asynchron.
- **SQS Standard**: Hoher Durchsatz, best-effort-Ordering, Zustellung "mindestens einmal".
- **SQS FIFO**: Strikter Ordering, exakte Zustellung, geringerer Durchsatz.
- **SNS** ist ein Pub/Sub-Dienst. Eine Nachricht, viele gleichzeitige Abonnenten.
- **SNS + SQS Fan-Out**: Das Standardmuster für ein Ereignis, das mehrere unabhängige Verarbeitungspipelines auslöst.
- **Dead-Letter-Warteschlangen**: Fangen Nachrichten ab, die das Verarbeiten nach zu vielen Wiederholungsversuchen fehlschlagen.
- **Idempotenz**: Entwerfen Sie Konsumenten, um doppelte Nachrichten sicher zu verarbeiten.

## Examenstipps

*SAA-C03 Domain: Design Resilient Architectures (Domain 2, Task 2.1)*

- **SQS Standard vs FIFO**: Der Examen unterscheidet sich anhand des Orderings und der Zustellgarantien. "Muss in der Reihenfolge verarbeitet werden" → FIFO. "Maximale Durchsatz" → Standard.
- **Visibility Timeout**: Schlüsselkonzept für die Zustellung "mindestens einmal". Wenn ein Konsument ausfällt, wird die Nachricht nach dem Timeout erneut sichtbar. Examensszenario: "Nachrichten werden zweimal verarbeitet" → der Visibility Timeout ist zu kurz (der Konsument benötigt länger als der Timeout, um die Nachricht zu verarbeiten).
- **Dead-Letter-Warteschlange**: Nachrichten, die nach zu vielen Wiederholungsversuchen das Verarbeiten fehlschlagen, werden hier platziert. Examensszenario: "Stellen Sie sicher, dass keine Nachrichten verloren gehen, auch wenn das Verarbeiten wiederholt fehlschlägt" → DLQ.
- **SNS Fan-Out**: Klassisches Examenmuster für ein Ereignis, das mehrere Konsumenten auslöst. "Benachrichtigung über eine Bestellung muss E-Mail, SMS und Inventaraktualisierung gleichzeitig auslösen" → SNS-Thema mit SQS-Abonnements.
- **SQS + Lambda**: Lambda kann so konfiguriert werden, dass es eine SQS-Warteschlange abfragt und bei jeder Batches von Nachrichten ausgelöst wird. Der Examen verwendet dies für die ereignisgesteuerte Verarbeitung in großem Maßstab.
- **SQS Long Polling**: Anstatt dass Konsumenten alle paar Sekunden (kurzes Polling, verschwendet API-Aufrufe) pollen, wartet Long Polling bis zu 20 Sekunden auf eine Nachricht. Reduziert Kosten und falsche leere Antworten.

## Übungen

**Übung 1 – Erinnerung**

Erklären Sie das SNS/SQS-Fan-Out-Muster. Warum verwendet das Muster SQS-Warteschlangen anstelle der direkten Abonnements des SNS-Themas mit HTTP-Endpunkten?

*(Hinweis: Denken Sie darüber nach, was passiert, wenn einer der HTTP-Endpunkte ausfällt, wenn SNS eine Nachricht veröffentlicht.)*

**Übung 2 – Examenspraxis**

*Szenario*: Eine E-Commerce-Plattform verarbeitet 10.000 Bestellungen pro Stunde. Wenn eine Bestellung aufgegeben wird, müssen die folgenden Schritte durchgeführt werden: (1) Speichern Sie die Bestellung in der Datenbank, (2) reduzieren Sie den Lagerbestand, (3) senden Sie eine Bestätigungs-E-Mail und (4) aktualisieren Sie das Analysedashboard. Alle vier Schritte erfolgen synchron – wenn der Analysedienst langsam ist, warten die Kunden. Das Team möchte die Antwortzeit für den Kunden verbessern, während sichergestellt wird, dass keine Bestellungen verloren gehen.

Welche Architektur LÖST diese Anforderung BEST?
```

A) Verwenden Sie SQS-FIFO-Warteschlangen, um alle vier Schritte nacheinander zu verarbeiten.
B) Lassen Sie die API die Reihenfolge speichern und dem Kunden sofort bestätigen; veröffentlichen Sie ein Ereignis in einem SNS-Thema; lassen Sie Inventar-, E-Mail- und Analysedienste über SQS-Warteschlangen abonnieren.
C) Verwenden Sie parallele EC2-Instanzen, um jeden Schritt gleichzeitig, synchron zu verarbeiten.
D) Verwenden Sie einen API Gateway mit Anforderungsvalidierung, um die Bestellabwicklung zu beschleunigen.

**Hinweis 1**: Die Kundenbestätigung sollte unmittelbar erfolgen. Welche Schritte müssen vor der Antwort erfolgen und welche können danach erfolgen?

**Hinweis 2**: Eine langsame Analysedienstleistung darf die Leistung der E-Mail- und Inventardienste nicht beeinträchtigen.

**Hinweis 3**: SNS-Fan-Out ermöglicht es allen drei nachgelagerten Diensten, das Ereignis gleichzeitig zu empfangen.

**Antwort**: B

**Erläuterung**: Die API speichert die Bestellung in der Datenbank (synchron – muss vor der Bestätigung erfolgen) und gibt sofort eine Bestätigung zurück. Sie veröffentlicht dann ein `order-placed`-Ereignis in einem SNS-Thema. Inventar-, E-Mail- und Analysedienste abonnieren jeweils über unabhängige SQS-Warteschlangen. Sie verarbeiten in ihrem eigenen Tempo – wenn der Analysedienst langsam ist, wächst seine Warteschlange, aber die anderen Dienste sind davon nicht betroffen. Wenn ein Dienst fehlschlägt, bleiben seine Nachrichten in der SQS-Warteschlange und werden erneut versucht; nach der konfigurierten Anzahl fehlgeschlagener Wiederholungen werden sie in die DLQ (Dead Letter Queue) verschoben.

**Warum nicht A?** FIFO-Warteschlangen verarbeiten Nachrichten in der Reihenfolge – das hilft nicht bei der synchronen Verlangsamung. Eine sequentielle Verarbeitung bedeutet auch, dass eine langsame Analyse weiterhin E-Mail-Dienste blockiert.

**Warum nicht C?** "Parallele EC2-Instanzen, die synchron verarbeiten", erfordert immer noch, dass alle Schritte abgeschlossen sind, bevor auf den Kunden reagiert wird. Das Hinzufügen von Instanzen löst das synchrone Kopplungsproblem nicht.

**Warum nicht D?** Ein API Gateway beschleunigt das API-Routing und die Validierung, aber es entkoppelt die nachgelagerten Verarbeitungsschritte nicht.

*SAA-C03 Domäne: Entwurf widerstandsfähiger Architekturen – Aufgabe 2.1*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nimbus baut ein Benachrichtigungssystem für Restaurantpartner. Wenn ein Kunde eine Bestellung aufgibt, muss der Partner über:

- Seine Tablet-App (Push-Benachrichtigung)
- Ein Küchendisplay (HTTP-Webhook an seine lokale Hardware)
- Ein Backup-SMS (falls die Tablet-Benachrichtigung fehlschlägt)

Der Tablet-Benachrichtigungsdienst ist zuverlässig. Der Küchen-Webhook ist manchmal nicht verfügbar (Restaurants schalten ihre Hardware zu Schließzeiten aus). Die SMS sollte nur ausgelöst werden, wenn die Tablet-Benachrichtigung fehlschlägt.

Entwerfen Sie die Architektur mit SNS und SQS. Wie würden Sie die Anforderung "SMS nur bei Tablet-Fehlern" handhaben? Wie stellen Sie sicher, dass der Küchen-Webhook die Tablet-Benachrichtigung nicht blockiert, wenn sie offline ist?

*(Es gibt keine eindeutige Lösung. Das Ziel ist es, Fan-Out-Designs mit bedingter Routenführung zu üben.)*

## Post-Credits-Szene

Der neue Bestellablauf war live.

Kunden legten Bestellungen auf. Die API antwortete in 95 Millisekunden. Die Bestätigung erschien sofort auf ihren Handys.

Im Hintergrund verarbeiteten vier Dienste asynchron. Der Analysedienst hatte einen Fehler, der dazu führte, dass er bei Bestellungen mit bestimmten Sonderzeichen im Artikelnamen abstürzte. Seine Warteschlange füllte sich über zwei Stunden mit 3.200 Nachrichten.

Kunden bemerkten es nicht.

Als Leo den Fehler behob und der Analysedienst neu startete, verarbeitete er den Nachlauf in 18 Minuten. Es gingen keine Daten verloren. Die DLQ (Dead Letter Queue) war leer.

"Das ist, was Entkopplung bedeutet", sagte Priya.

Tom las die SQS-Preisliste. "Kosten pro Million Anfragen: 0,40 Dollar."

"Ist das schlecht?"

"Bei unserem aktuellen Volumen sind das etwa zwölf Dollar pro Monat." Er starrte auf den Bildschirm. "Ich hatte mehr erwartet."

Er entdeckte etwas Unerwartetes, das sich als günstig herausstellte und sich auch als gut anfühlte.

In der nächsten Episode: Die Funktion, die nur ausgeführt wird, wenn jemand klopft – und kostet nichts, wenn er nicht klopft.
