# Kapitel 22: Das Flussdiagramm, das sich selbst ausführt

Leo hatte eine Stunde lang dieselbe Logdatei angestarrt. Die Stacktraces waren einzeln klar genug, aber das Muster über sie hinweg – die Art, wie ein Schritt still fehlschlug und der nächste Schritt trotzdem lief – hatte er erst nach einer Weile erkannt. Schließlich lehnte er sich zurück, stellte seinen Kaffee ab und schrieb ein einziges Wort auf seinen Notizblock: *Koordination*.

Stellen Sie sich vor, ein Dirigent verlässt mitten in der Aufführung das Podium. Das Orchester spielt weiter – aber niemand ist da, um die Blechbläser bei Takt 47 einzusetzen, niemand, um die Stille vor dem Finale anzuzeigen. Einzelne Musiker spielen ihre Stimmen korrekt. Die Aufführung fällt trotzdem auseinander, weil die Stimmen von einer Koordination abhängen, die niemand managt.

Das ist das Problem, das Leo im Bestellbestätigungscode gefunden hatte. Kein Fehler in irgendeinem einzelnen Schritt. Ein Koordinationsversagen.

---

Die Container liefen korrekt und deployten sauber. Die ECS-Deployment-Pipeline war solide. Aber innerhalb des Anwendungscodes hatte sich seit Wochen eine andere Art von Fehler angesammelt. Mit den Containern war alles in Ordnung. Mit der Logik in einem von ihnen nicht.

Leo hatte das Muster in den Logs verfolgt, es aber erst verstanden, als er die Vorkommen zählte.

Elf Mal. In zwei Wochen.

---

Eine Bestellbestätigung bei Nimbus erforderte, dass fünf Dinge der Reihe nach geschahen: die Karte belasten, die Bestätigungs-E-Mail senden, das Restaurant benachrichtigen, den Bestand aktualisieren und die Transaktion für die Buchhaltung protokollieren.

Als Leo die ursprüngliche Bestellbestätigungsfunktion geschrieben hatte, hatte er das Ganze in einen `try/except`-Block gewickelt und gesagt: „Das passt schon – wir fangen Fehler in den Logs ab.“ Das war vor acht Monaten.

Es passte nicht.

Wenn Schritt drei fehlschlug – wenn die Restaurantbenachrichtigung einen Timeout hatte – waren Schritte eins und zwei bereits geschehen. Der Kunde wurde belastet. Die E-Mail wurde gesendet. Aber das Restaurant wusste nicht, dass die Bestellung existierte.

Leo hatte einen Namen für diese Kategorie von Fehler: den Teilerfolg. „Alles hat funktioniert“, sagte er, „außer dem Teil, auf den es ankam.“

„Wie oft ist das passiert?“ fragte Maya.

„Elf Mal in den letzten zwei Wochen. Die meisten haben wir durch wütende Anrufe beim Restaurant mitbekommen. Zwei haben wir in den Logs gefunden, im Nachhinein.“

„Wir haben also keine Koordination“, sagte Priya. „Fünf Schritte, die als Skript laufen, ohne Garantie, dass sie alle abschließen. Und was, wenn jemand während Schritt zwei einzubrechen versucht – nachdem die Belastung durchgegangen ist, aber bevor das Restaurant benachrichtigt wurde? Wir haben dem Kunden bereits eine Bestellung in Rechnung gestellt, die das Restaurant nicht hat.“

„Oder dass sie in der richtigen Reihenfolge abschließen.“

„Oder dass wir wissen, welcher fehlgeschlagen ist.“

Leo rief den Code auf dem Projektor auf. Es war eine Python-Funktion: fünfzig Zeilen, fünf sequentielle API-Aufrufe, ein einziger try/except-Block um das Ganze.

„Wir brauchen einen Workflow“, sagte Maya. „Etwas, das jeden Schritt verfolgt. Moment – aber *warum* können wir nicht einfach bessere Fehlerbehandlung zur bestehenden Python-Funktion hinzufügen? Warum brauchen wir einen ganz neuen Dienst?“

„Weil bessere Fehlerbehandlung immer noch in einem einzigen Prozess läuft, der an jedem Punkt ausfallen kann“, sagte Leo. „Wenn der Server mitten in der Ausführung neu startet, startet die Fehlerbehandlung mit ihm neu. Step Functions persistiert den Zustand extern.“

Stellen Sie sich eine Fertigungs-Checkliste vor – eine, bei der jede Station den Abschluss bestätigt, bevor sie an die nächste übergibt, und bei der die gesamte Linie ihre Position hält, wenn etwas fehlschlägt. Die Linie startet nicht von vorne. Sie nimmt von genau der Station wieder auf, die fehlschlug. Der Zustand jener Station ist aufgezeichnet. Die Schritte davor sind erledigt und werden nicht wiederholt. Die Schritte danach warten, bis das Problem gelöst ist.

Das war es, was der Bestellbestätigungsfluss brauchte. Nicht mehr Code um das Problem herum. Ein System, das darauf ausgelegt ist, das Problem zu managen.

**AWS Step Functions: Workflows orchestrieren**

**AWS Step Functions** ist ein serverloser Orchestrierungsdienst, der die Schritte einer Anwendung als visuellen Workflow koordiniert. Jeder Schritt ist ein **State (Zustand)** in einer **State Machine (Zustandsmaschine)**.

Statt eines Python-Skripts, das von oben nach unten läuft und abstürzt, definieren Sie den Workflow als JSON/YAML-Zustandsmaschine:

```json
{
  "StartAt": "ValidateLicense",
  "States": {
    "ValidateLicense": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:validate-license",
      "Next": "ImportMenu",
      "Catch": [{"ErrorEquals": ["States.ALL"], "Next": "OnboardingFailed"}]
    },
    "ImportMenu": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:import-menu",
      "Next": "SetupPayments",
      "Retry": [{"ErrorEquals": ["States.ALL"], "MaxAttempts": 3, "IntervalSeconds": 5}]
    },
    ...
  }
}
```

Jeder Zustand kann:

- **Eine Lambda-Funktion ausführen** (das häufigste Muster)
- **Einen ECS-Task ausführen** (für länger laufende Arbeit)
- **Auf eine bestimmte Zeit** oder ein **Ereignis warten** (den Workflow pausieren, bis etwas Externes geschieht)
- **Einen Pfad wählen** basierend auf Bedingungen (if/else-Logik)
- **Parallele Zweige gleichzeitig ausführen**
- **Bei Fehler wiederholen** mit konfigurierbarem Backoff
- **Fehler abfangen** und zu Fehlerbehandlungszuständen routen

Step Functions verwaltet den Ausführungszustand dauerhaft. Wenn Schritt 3 fehlschlägt, pausiert die Ausführung bei Schritt 3. Sie können die fehlgeschlagene Ausführung in der Konsole inspizieren, das Problem beheben und von Schritt 3 aus neu starten – ohne Schritte 1 und 2 zu wiederholen.

Sie fragen sich vielleicht: Kann man Wiederholungslogik nicht einfach in seine Lambda-Funktion schreiben? Ja – aber dann schreiben Sie auch Fehlerverfolgung, Zustandspersistenz und Audit-Logging im Code. Und wenn Schritt 3 von 7 fehlschlägt, müssen Sie wissen, welches Restaurant gerade verarbeitet wurde, was vorher geschah und wo wieder aufgenommen werden soll. Step Functions erledigt all das.

**Der Nimbus-Bestellfluss: Annotierte Zustandsmaschine**

Hier ist eine vereinfachte Version der tatsächlichen Step-Functions-Zustandsmaschine, die Nimbus für die Bestellbestätigung baute – annotiert, damit Sie sehen können, was jedes Teil tut:

```json
{
  "Comment": "Nimbus order confirmation workflow",
  "StartAt": "ChargeCard",
  "States": {
    "ChargeCard": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:charge-card",
      "Next": "SendConfirmationEmail",
      "Retry": [
        {
          "ErrorEquals": ["PaymentRetryableError"],
          "MaxAttempts": 2,
          "IntervalSeconds": 3,
          "BackoffRate": 2.0
        }
      ],
      "Catch": [
        {
          "ErrorEquals": ["PaymentDeclinedError"],
          "Next": "NotifyCustomerOfDecline"
        },
        {
          "ErrorEquals": ["States.ALL"],
          "Next": "ChargeCardFailed"
        }
      ]
    },
    "SendConfirmationEmail": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:send-confirmation-email",
      "Next": "NotifyRestaurant",
      "Retry": [
        {
          "ErrorEquals": ["States.ALL"],
          "MaxAttempts": 3,
          "IntervalSeconds": 5
        }
      ]
    },
    "NotifyRestaurant": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:notify-restaurant",
      "Next": "UpdateInventory",
      "Retry": [
        {
          "ErrorEquals": ["States.ALL"],
          "MaxAttempts": 3,
          "IntervalSeconds": 10,
          "BackoffRate": 2.0
        }
      ],
      "Catch": [
        {
          "ErrorEquals": ["States.ALL"],
          "Next": "RestaurantNotificationFailed"
        }
      ]
    },
    "UpdateInventory": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:update-inventory",
      "Next": "LogTransaction",
      "Retry": [{"ErrorEquals": ["States.ALL"], "MaxAttempts": 2}]
    },
    "LogTransaction": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:log-transaction",
      "End": true
    },
    "NotifyCustomerOfDecline": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:notify-decline",
      "End": true
    },
    "ChargeCardFailed": {
      "Type": "Fail",
      "Error": "ChargeCardFailed",
      "Cause": "Card charge failed after retries"
    },
    "RestaurantNotificationFailed": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:alert-support",
      "Comment": "Alert support team — order charged but restaurant not notified",
      "End": true
    }
  }
}
```

Ein paar Dinge, die auffallen:

**`ChargeCard` hat zwei Catch-Klauseln.** Eine für `PaymentDeclinedError` (ein bekannter, erwarteter Fehlschlag – die Karte wurde abgelehnt, kein Systemfehler) und eine für `States.ALL` (alles andere – ein Systemausfall, ein Timeout, eine unerwartete Ausnahme). Sie routen zu unterschiedlichen Zuständen, weil sie unterschiedliche Dinge bedeuten.

**`NotifyRestaurant` hat ein Catch, das zu `RestaurantNotificationFailed` routet.** Das ist der Fehler, der die elf Vorfälle verursachte. Im alten Python-Skript gab es kein Äquivalent – wenn die Benachrichtigung fehlschlug, stürzte die Funktion entweder still ab oder loggte einen Fehler und machte weiter. Step Functions macht den Fehlerpfad explizit: Er geht irgendwohin Bestimmtes, und dieses Irgendwo alarmiert das Support-Team, bevor jemand anrufen muss.

**Jeder Task hat Retry.** Wenn der E-Mail-Dienst einen vorübergehenden Timeout hat, wird er automatisch wiederholt, dreimal, mit zunehmendem Backoff. Der Kunde sieht das nie. Die Bestellung geht nicht verloren.

**Der Fluss ist ein Graph, kein Skript.** Wenn `NotifyRestaurant` dauerhaft fehlschlägt (nach Wiederholungen), fährt die Ausführung nicht mit `UpdateInventory` fort. Der Workflow stoppt bei `RestaurantNotificationFailed`. Der Bestand wird nicht für ein Restaurant aktualisiert, das nichts von der Bestellung weiß. Das ist korrektes Verhalten.

„Moment – aber *warum* brauchen wir separate Fehlerpfade für ‚Zahlung abgelehnt‘ vs. ‚Systemfehler‘?“ fragte Maya.

„Weil sie völlig unterschiedliche Reaktionen erfordern“, sagte Leo. „Eine abgelehnte Karte bedeutet, wir mailen dem Kunden und bitten ihn, es erneut zu versuchen. Ein Systemfehler in der Belastungsfunktion bedeutet, wir brauchen einen Ingenieur, der untersucht, warum die Lambda-Funktion fehlschlägt. Gleiches beobachtbares Ergebnis – die Bestellung ging nicht durch –, aber völlig unterschiedliche Abhilfe.“

**Zustandstypen: Die Bausteine**

**Task**: Eine Aktion ausführen – eine Lambda-Funktion aufrufen, einen ECS-Task starten, eine API aufrufen. Hier geschieht echte Arbeit.

**Choice**: Basierend auf Bedingungen in den Eingabedaten verzweigen. Wie ein if/else im Code.

**Parallel**: Mehrere Zweige gleichzeitig ausführen und warten, bis alle abgeschlossen sind.

**Map**: Eine Reihe von Zuständen auf jedes Element in einer Liste anwenden. 50 Restaurant-Menüelemente parallel verarbeiten.

Als Nimbus die Speisekarte eines Restaurants importierte, konnte die Speisekarte zwischen 8 und 200 Elemente enthalten. Für jedes Element musste der Importprozess: das Format validieren, auf Allergendaten prüfen, das Foto verkleinern und den Datensatz in DynamoDB schreiben.

Ohne den Map-State wäre dies eine einzelne Lambda, die Elemente sequentiell verarbeitet – 200 Elemente × 200 ms pro Element = 40 Sekunden Verarbeitungszeit. Mit dem Map-State startet Step Functions gleichzeitige Ausführungen der Verarbeitungszustände – bis zum konfigurierten Parallelitätslimit – und wartet, bis alle abgeschlossen sind. Dieselben 200 Elemente können in unter 5 Sekunden fertig sein.

**Wait**: Für eine bestimmte Zeit oder bis zu einem Zeitstempel pausieren. Nützlich für geplante Verzögerungen.

**Pass**: Eingabe an Ausgabe weitergeben, ohne Arbeit zu tun. Wird für Datentransformation und Tests verwendet.

**Succeed/Fail**: Terminale Zustände, die die Ausführung beenden.

Für das Restaurant-Onboarding entwarf Leo einen Workflow:

1. ValidateLicense (Task → Lambda)
2. ImportMenu (Task → Lambda, mit 3 Wiederholungen)
3. Paralleler Zweig:
   a. SetupPayments (Task → Lambda)
   b. CreateIAMRole (Task → Lambda)
4. SendWelcomeEmail (Task → Lambda, wartet auf Abschluss des parallelen Zweigs)
5. NotifySalesTeam (Task → Lambda)

Die Schritte 3a und 3b laufen parallel – sie hängen nicht voneinander ab, und sie gleichzeitig auszuführen spart Zeit.

Nachdem die erste Restaurant-Kohorte das Onboarding abgeschlossen hatte, kam eine Compliance-Anforderung auf: Bevor ein Restaurantpartner live gehen konnte, musste ein Nimbus-Account-Manager die Lizenzdokumentation manuell prüfen und genehmigen. Das konnte ein bis drei Werktage dauern.

„Und was, wenn jemand während dieses Fensters einzubrechen versucht?“ fragte Priya. „Wenn das Restaurant teilweise konfiguriert ist – Zahlungskonto erstellt, aber noch nicht genehmigt – und jemand den ausstehenden Zustand entdeckt, könnte er versuchen, die halboffene Konfiguration auszunutzen.“

Praktischer gesehen: Wie pausiert man einen Step-Functions-Workflow drei Tage lang, während man auf einen Menschen wartet?

Die Antwort ist das **Callback-Muster mit einem Task-Token**.

Wenn `ValidateLicense` läuft, ruft es, statt automatisch abzuschließen, eine Lambda auf, die drei Dinge tut:

1. Sendet eine E-Mail an den Account-Manager mit den Dokumenten des Restaurants
2. Zeichnet ein **Task-Token** (einen eindeutigen Bezeichner, den Step Functions für diese spezifische Ausführung und diesen Zustand generiert) in einer Datenbank auf, verknüpft mit dieser ausstehenden Prüfung
3. Kehrt mit `.waitForTaskToken` zu Step Functions zurück – was Step Functions anweist, die Ausführung bei diesem Zustand unbegrenzt zu pausieren

Step Functions parkt die Ausführung. Nichts anderes ist blockiert – kein Server wartet. Die Zustandsmaschine wartet einfach und verbraucht keine Compute-Ressourcen.

Drei Tage später klickt der Account-Manager im internen Admin-Tool auf „Genehmigen“. Das Admin-Tool schlägt das Task-Token aus der Datenbank nach und ruft auf:

```python
stepfunctions.send_task_success(
    taskToken=token,
    output=json.dumps({"approved": True, "reviewedBy": "dana.cole@eatnimbus.com"})
)
```

Step Functions nimmt wieder auf. Die Ausführung fährt von Schritt 2 (`ImportMenu`) fort, wobei die Informationen des Prüfers im Workflow-Zustand verfügbar sind.

„Die Ausführung war drei Tage lang pausiert“, sagte Leo, „und das Einzige, was passierte, als ich sie genehmigte, war ein einziger API-Aufruf.“

„Und wenn der Account-Manager sie ablehnt?“ fragte Maya.

„Dann rufen wir stattdessen `send_task_failure` auf. Die Zustandsmaschine fängt das ab und routet zu einem `NotifyRejection`-Zustand, der den Restaurantpartner anmailt.“

Step Functions pollt nicht. Es wiederholt nicht. Es läuft nicht in einen Timeout (es sei denn, Sie setzen einen Heartbeat-Timeout). Es wartet einfach, bis der Callback eintrifft, und fährt dann fort. Das unterscheidet sich grundlegend vom Pollen einer Datenbank oder einer Warteschlange – und deshalb eignet sich Step Functions gut für Workflows, die automatisierte und manuelle Schritte mischen.

**Die Ausführungskonsole lesen: Wie ein Fehlschlag aussieht**

Als die Restaurant-Benachrichtigungs-Lambda während Nimbus' erster Woche mit Step Functions in einen Timeout lief, öffnete Leo die Step-Functions-Konsole und klickte auf die fehlgeschlagene Ausführung.

Die **Execution Event History** zeigte eine Zeitleiste genau dessen, was passiert war:

```
14:23:01.442  ExecutionStarted       {"orderId": "ORD-8812", "restaurantId": "94"}
14:23:01.698  TaskStateEntered       ChargeCard
14:23:02.104  TaskStateExited        ChargeCard — success
14:23:02.201  TaskStateEntered       SendConfirmationEmail
14:23:02.884  TaskStateExited        SendConfirmationEmail — success
14:23:02.901  TaskStateEntered       NotifyRestaurant
14:23:12.901  TaskTimedOut           NotifyRestaurant — attempt 1/3 (Lambda timeout: 10s)
14:23:23.001  TaskTimedOut           NotifyRestaurant — attempt 2/3
14:23:43.001  TaskTimedOut           NotifyRestaurant — attempt 3/3
14:23:43.022  CatchStateEntered      RestaurantNotificationFailed
14:23:43.155  TaskStateEntered       RestaurantNotificationFailed (alert-support Lambda)
14:23:43.640  TaskStateExited        RestaurantNotificationFailed — success
14:23:43.642  ExecutionFailed
```

In 42 Sekunden hatte Step Functions die Karte belastet, die E-Mail gesendet, die Restaurantbenachrichtigung dreimal versucht, den Fehlschlag abgefangen, das Support-Team alarmiert und die vollständige Historie aufgezeichnet. Vor Step Functions wäre dieser Fehlschlag unsichtbar gewesen – die Python-Funktion hätte „notification failed“ geloggt und 200 an den Aufrufer zurückgegeben, als wäre nichts verkehrt.

„Die Zeitleiste zeigt genau, wo und wann etwas schiefging“, sagte Leo. „Und jeder Wiederholungsversuch hat einen Zeitstempel. Man kann die Backoff-Intervalle sehen.“

Priya sah sich die Konsole an. „Und wie lange wird diese Historie gespeichert?“

Die Ausführungshistorie von Standard-Workflows wird 90 Tage lang gespeichert. Für Compliance oder langfristige Prüfung können die Ausführungsereignisse auch nach CloudWatch Logs exportiert und unbegrenzt aufbewahrt werden.

**Standard- vs. Express-Workflows**

Step Functions bietet zwei Workflow-Typen:

**Standard-Workflows**:

- Maximale Dauer: 1 Jahr
- Ausführungen sind dauerhaft – der Zustand wird persistiert, kann inspiziert und geprüft werden
- Exactly-once-Ausführung (ein Task wird nie mehr als einmal ausgeführt, es sei denn, Sie konfigurieren ein Retry)
- Preis pro Zustandsübergang
- Am besten für lang laufende, wichtige Workflows (Bestellverarbeitung, Onboarding, Zahlungsflüsse)

**Express-Workflows**:

- Maximale Dauer: 5 Minuten
- Höherer Durchsatz – bis zu 100.000 pro Sekunde
- At-least-once-Ausführung (asynchron) oder At-most-once (synchron) – Tasks idempotent gestalten
- Preis pro Dauer (wie Lambda)
- Am besten für hochvolumige, kurzlaufende Workflows (Echtzeit-Ereignisverarbeitung, IoT-Datenaufnahme)

„Wie viel kostet das pro Monat?“ fragte Tom und rief die Preisseite auf. „Pro Zustandsübergang bei Standard – das summiert sich, wenn man viele Schritte hat.“

Leo ging die Rechnung durch. Für den Restaurant-Onboarding-Workflow (sechs Task-Zustände pro Ausführung, etwa 12–15 neue Restaurants pro Monat): weniger als hundert Zustandsübergänge – weniger als ein Cent, und vollständig innerhalb der monatlichen kostenlosen Stufe von 4.000 Übergängen, also effektiv 0 $. Für den Bestellbestätigungs-Workflow bei vollem Nimbus-Traffic: bedeutsamer, aber immer noch weit unter den Kosten, elf Teilerfolge pro Monat manuell zu debuggen.

„Die Debugging-Zeit ist der versteckte Kostenfaktor“, sagte Leo.

„Das ist immer der versteckte Kostenfaktor“, sagte Tom.

Tom rechnete die Zahlen sorgfältiger durch, denn das war Tom.

**Standard-Workflow-Kosten für Nimbus' Bestellbestätigungsfluss**: fünf Zustände pro Bestellung auf dem Happy Path, zu 0,000025 $ pro Zustandsübergang. Fünf Zustandsübergänge × 0,000025 $ × 15.000 Bestellungen pro Monat = **1,88 $/Monat**. Beim Zehnfachen des Bestellvolumens: etwa 19 $/Monat. Die Debugging-Kosten für einen einzigen Teilerfolg-Vorfall (24 Minuten Zeit eines Support-Ingenieurs) überstiegen die monatliche Step-Functions-Rechnung um ein Vielfaches.

Der Vergleich wird wichtig, wenn jemand vorschlägt, Standard-Workflows für hochfrequente Analyseereignisse zu verwenden. Angenommen, Nimbus wollte Step Functions verwenden, um jedes rohe Clickstream-Ereignis zu verarbeiten – jeden Menüseitenaufruf, jedes Scrollen, jede Suche. Das sind in ihrer aktuellen Größenordnung etwa 800.000 Ereignisse pro Tag. Ein Standard-Workflow mit fünf Zuständen für jedes Ereignis: 800.000 × 5 × 0,000025 $ × 30 Tage = **3.000 $/Monat**. Das ist echtes Geld für eine Analyse-Pipeline.

Express-Workflows für dasselbe Volumen: Preis pro Anfrage plus Dauer, nicht pro Zustandsübergang. Die 24 Millionen monatlichen Ausführungen kosten 1,00 $ pro Million Anfragen = 24 $. Dauer: 24 Mio. × 500 ms beim 64-MB-Abrechnungsminimum ≈ 208 GB-Stunden × 0,06 $ = 12,50 $. Gesamt ≈ **36,50 $/Monat** – fast zwei Größenordnungen günstiger als Standards 3.000 $.

„Der Typ des Workflows ist also nicht nur eine architektonische Entscheidung“, sagte Tom. „Es ist eine Kostenentscheidung. Dieselbe Anzahl von Zuständen kann fast hundertmal mehr kosten, je nachdem, welchen Workflow-Typ man verwendet.“

„Und welcher besser ist, hängt vollständig davon ab, was der Workflow tut“, sagte Leo. „Bestellbestätigung: Standard. Sie ist wichtig, sie hat bedeutsame Fehlerpfade, wir wollen den Audit-Trail. Analyseereignis-Verarbeitung: Express. Sie ist hochvolumig, kurz und wir brauchen keine 90-tägige Ausführungshistorie für jeden Seitenaufruf.“

Wenn Ihr Prozess zwei Schritte hat und keinen Audit-Trail braucht, ist eine einfache Lambda-Funktion günstiger und erfordert keine JSON-Zustandsmaschinen-Syntax – aber wenn irgendein Schritt unabhängig fehlschlagen kann und wiederholt oder neu gestartet werden muss, ohne frühere Schritte zu wiederholen, amortisiert sich Step Functions durch reduziertes Debugging und manuelle Behebung.

Für Nimbus' Restaurant-Onboarding: Standard (es ist wichtig, dauerhaft, kann Stunden dauern, wenn manuelle Schritte beteiligt sind).

Für Nimbus' Echtzeit-Bestellstatus-Updates: Express (hohes Volumen, kurze Dauer, weniger kritisch).

**Ereignisgesteuerte Architektur: Das größere Bild**

Step Functions ist ein Teil eines größeren Musters: **ereignisgesteuerte Architektur**. Statt dass Dienste sich direkt gegenseitig aufrufen (enge Kopplung), senden Dienste Ereignisse aus, und andere Dienste reagieren auf diese Ereignisse.

Wir haben das im ganzen Buch gesehen:

- Bestellungen aufgegeben → SNS veröffentlicht Ereignis → SQS-Warteschlangen liefern an Konsumenten
- S3-Datei hochgeladen → Lambda ausgelöst, um sie zu verarbeiten
- DynamoDB-Datensatz geändert → DynamoDB Streams → Lambda aktualisiert einen Cache

**Amazon EventBridge** (früher CloudWatch Events) ist der fortgeschrittene Ereignisbus für dieses Muster. Er routet Ereignisse von AWS-Diensten und Ihren eigenen Anwendungen basierend auf Regeln an Ziele (Lambda, SQS, Step Functions usw.).

EventBridge ermöglicht lose Kopplung auf architektonischer Ebene: Der Bestelldienst veröffentlicht `order.placed`-Ereignisse, ohne zu wissen, wer zuhört. Der Analysedienst, der Benachrichtigungsdienst und der Treuepunkte-Dienst hören alle unabhängig zu. Das Hinzufügen eines neuen Zuhörers erfordert keine Änderung des Bestelldienstes.

EventBridge integriert sich auch nativ mit Dutzenden von AWS-Diensten als **Ereignisquellen**. Wenn ein CloudTrail-API-Aufruf einem Muster entspricht, kann EventBridge eine Regel auslösen. Wenn eine EC2-Instanz ihren Zustand ändert, kann EventBridge eine Lambda auslösen. Wenn eine RDS-Instanz ein Failover durchführt, kann EventBridge den Bereitschaftsingenieur alarmieren. Sie können die gesamte AWS-Control-Plane als Ereignisstrom behandeln.

Für Nimbus eine besonders nützliche EventBridge-Regel: eine Lambda auslösen, wann immer ein neues Image nach ECR gepusht wird. Die Lambda prüft das Image-Scan-Ergebnis und postet in den Engineering-Slack-Kanal, wenn HIGH- oder CRITICAL-CVEs gefunden werden – bevor jemand das Image deployt. Das kombiniert ECRs Sicherheits-Scanning (aus Kapitel 21) mit EventBridges Ereignis-Routing zu einem automatisierten Sicherheits-Gate.

Das Prinzip der ereignisgesteuerten Architektur ist dasselbe wie die Wiederholungslogik von Step Functions: Mache Fehler explizit und geroutet, nicht still und verschluckt. Dienste, die über Ereignisse kommunizieren, scheitern elegant – wenn die Treuepunkte-Lambda ausgefallen ist, wenn ein `OrderConfirmed`-Ereignis auslöst, kann EventBridge die Zustellung wiederholen oder an eine Dead-Letter-Queue senden. Die Bestellbestätigung selbst ist unbeeinträchtigt. Die Entkopplung ist die Widerstandsfähigkeit.

**EventBridge: Nebeneffekte vom Hauptfluss entkoppeln**

Nachdem die Bestellbestätigungs-Zustandsmaschine sauber lief, warf Maya beim nächsten Architektur-Review eine Frage auf.

„Wir wollen Treuepunkte hinzufügen, wenn eine Bestellung bestätigt wird. Der Kunde bekommt einen Punkt pro ausgegebenem Dollar. Wo gehört das in die Zustandsmaschine?“

Leos erster Instinkt: einen `GrantLoyaltyPoints`-Zustand nach `LogTransaction` hinzufügen.

Priyas Antwort: „Und wenn wir dann Empfehlungsboni hinzufügen? Und Umfragen nach der Bestellung? Und Anfragen für Restaurantbewertungen? Jede einzelne fügt dem kritischen Pfad einen Zustand hinzu. Wenn die Treuepunkte-Lambda fehlschlägt, schlägt die gesamte Bestellbestätigung fehl.“

„Der Bestellbestätigungsfluss sollte eine Sache tun“, sagte sie. „Die Bestellung bestätigen. Alles andere ist ein Nebeneffekt.“

Das ist das architektonische Argument für **Amazon EventBridge** als Mechanismus zur losen Kopplung von Nebeneffekten vom Hauptworkflow.

Der überarbeitete Ansatz: Wenn der `LogTransaction`-Zustand erfolgreich abschließt, veröffentlicht die Lambda ein Ereignis in EventBridge:

```json
{
  "source": "nimbus.orders",
  "detail-type": "OrderConfirmed",
  "detail": {
    "orderId": "ORD-8812",
    "customerId": "CUST-441",
    "restaurantId": "94",
    "total": 3200,
    "timestamp": "2024-03-15T14:23:43Z"
  }
}
```

Dann routen EventBridge-Regeln dieses Ereignis an unabhängige Ziele:

- **Regel 1**: `OrderConfirmed` → Treuepunkte-Lambda (gewährt 32 Punkte für eine 32-$-Bestellung)
- **Regel 2**: `OrderConfirmed` → Umfrage-nach-Bestellung-Lambda (reiht eine Umfrage für 2 Stunden nach der Lieferung ein)
- **Regel 3**: `OrderConfirmed` → Analyse-Kinesis-Stream (speist das Echtzeit-Dashboard)

Jede Regel ist unabhängig. Die Treuepunkte-Lambda kann fehlschlagen, ohne die Umfrage-Warteschlange zu beeinträchtigen. Die Analyse-Pipeline kann zurückfallen, ohne das Treuesystem zu blockieren. Das Hinzufügen eines neuen Nebeneffekts (eine Restaurantbewertungsanfrage, eine Cashback-Benachrichtigung) erfordert das Erstellen einer neuen EventBridge-Regel – nicht das Ändern der Zustandsmaschine.

„Und was, wenn jemand über eine EventBridge-Regel einzubrechen versucht?“ fragte Priya. „Wenn das Ereignis Kunden-PII enthält, ist jede Lambda, die es empfängt, jetzt ein PII-Zugriffspunkt.“

Das Ereignis war sorgfältig gestaltet: nur die IDs, nicht die Namen, Adressen oder Zahlungsdetails. Jede Lambda, die Kundendaten brauchte, würde sie aus der Datenbank über die Kunden-ID nachschlagen – mit ihren eigenen IAM-Berechtigungen, die steuern, worauf sie zugreifen konnte.

„Das Ereignis ist ein Signal“, sagte Priya. „Kein Daten-Dump.“

**Wann Step Functions das richtige Werkzeug ist**

Step Functions glänzt, wenn Sie haben:

**Mehrstufige Workflows**, die den Fortschritt über Schritte hinweg verfolgen müssen

**Prozesse mit menschlicher Beteiligung** – Step Functions kann unbegrenzt auf ein externes Ereignis warten (wie einen Menschen, der etwas genehmigt) und dann fortfahren

**Fehlerbehandlung in großem Maßstab** – integrierte Retry-, Catch- und Fallback-Logik über viele Schritte hinweg

**Prüfbare Prozesse** – jede Ausführung zeichnet jeden Zustandsübergang auf. Sie können genau sehen, was wann passiert ist.

**Komplexe parallele oder sequentielle Logik** – der visuelle Workflow macht es leichter, darüber nachzudenken, als über äquivalenten Code

Step Functions ist überdimensioniert für einfache Zwei-Schritt-Prozesse. Verwenden Sie es, wenn die Koordination selbst wertvoll ist und die Fehlerszenarien wichtig sind.

**Wann Step Functions das falsche Werkzeug ist**

„Moment – aber *warum* sollten wir Step Functions nicht für alles verwenden?“ fragte Maya am Ende der Design-Sitzung. „Wir haben den Restaurant-Onboarding-Workflow gebaut. Wir haben den Bestellbestätigungsfluss. Warum nicht alles in Zustandsmaschinen umwandeln?“

Die ehrliche Antwort: weil Step Functions Overhead hinzufügt, den nicht jeder Workflow rechtfertigt.

**Einfache Zwei-Schritt-Prozesse**: Wenn Sie eine Lambda haben, die eine hochgeladene Datei verarbeitet, indem sie eine zweite Lambda aufruft, ist der Koordinations-Overhead einer Zustandsmaschine den operativen Nutzen nicht wert. Zwei Lambdas, die innerhalb einer einzigen Funktion sequentiell aufgerufen werden, sind einfacher, leichter zu testen und haben keine Kosten pro Zustandsübergang.

**Ultrahochfrequente, sub-sekündliche Workflows**: Standard-Workflows haben nicht-triviale Kosten pro Zustandsübergang, die sich bei hohem Volumen akkumulieren (wie das Analysebeispiel oben zeigte). Express-Workflows lösen das Kostenproblem, bieten aber keine dauerhafte Zustandshistorie. Bei sehr hoher Frequenz mit sehr kurzer Dauer ist SQS plus Lambda (das Muster aus Kapitel 19) einfacher und günstiger als beide Step-Functions-Typen.

**Reines Fan-out ohne Koordination**: Wenn Sie dasselbe Ereignis an zwanzig Konsumenten senden müssen und sich nicht um das Ergebnis jedes einzelnen kümmern, ist SNS das Werkzeug. Step Functions fügt Zustandsverfolgung hinzu, die Sie nicht brauchen und für die Sie unnötig zahlen würden.

**Echtzeit-synchrone Nutzerinteraktionen**: Step-Functions-Ausführungen sind asynchron. Wenn ein Nutzer an einem Checkout-Bildschirm auf eine synchrone Antwort in unter 500 ms wartet, ist ein Step-Functions-Standard-Workflow dafür nicht ausgelegt (Express-Workflows können synchron aufgerufen werden, aber der Latenz-Overhead ist immer noch höher als ein direkter Lambda-Aufruf). Für synchrone, nutzerseitige Flüsse ist Lambda + API Gateway mit gut gestalteter Fehlerbehandlung oft angemessener.

Das Prinzip: Verwenden Sie Step Functions, wenn die *Koordination* der Schritte selbst komplex ist – wenn Schritte unabhängig fehlschlagen können, wenn Sie einzelne Schritte wiederholen müssen, ohne frühere zu wiederholen, wenn die Ausführungshistorie Compliance- oder Debugging-Wert hat oder wenn der Workflow menschliche Genehmigungsschritte beinhaltet, die Tage dauern könnten. Verwenden Sie es nicht, um einfacher sequentieller Logik, die als einzelne Funktion gut funktioniert, Orchestrierungs-Overhead hinzuzufügen.

## Stärken und Grenzen

**Warum Step Functions leistungsstark ist**:

- Visuelle Ausführungshistorie – genau sehen, wo ein Workflow ist (oder fehlgeschlagen ist)
- Integrierte Retry- und Fehlerbehandlung – kein benutzerdefinierter Retry-Code
- Dauerhafter Zustand – Ausführungen überleben Dienst-Neustarts und Ausfälle
- Direkte Integrationen mit über 200 AWS-Diensten (nicht nur Lambda)
- Der visuelle Workflow ist selbstdokumentierend
- Das Callback-Muster ermöglicht unbegrenztes Warten auf menschliche Aktionen, ohne Compute zu verbrauchen

**Wo es kompliziert wird**:

- Standard-Workflows werden pro Zustandsübergang berechnet – komplexe Workflows mit vielen Zuständen können bei Skalierung teuer werden
- Das ASL-Format (Amazon States Language) im JSON hat eine Lernkurve
- Die maximale Nutzlastgröße beträgt 256 KB – große Daten müssen über S3-Referenzen übergeben werden, nicht direkt durch den Workflow
- Lang laufende Workflows mit vielen manuellen Schritten erfordern sorgfältige Timeout-Konfiguration
- Das Debuggen von ASL-Fehlern erfordert laufende Ausführungen; es gibt keinen lokalen Emulator, der so leistungsfähig ist wie der echte Dienst
- IAM-Berechtigungen müssen für jede Ressource, die die Zustandsmaschine aufruft, separat gewährt werden – eine vergessene Berechtigung verursacht einen verwirrenden Fehler zur Laufzeit

## Zusammenfassung

Die Container aus Kapitel 21 machten Deployments zuverlässig. Step Functions macht mehrstufige Geschäftsprozesse zuverlässig – dasselbe Prinzip „das Übergaberisiko eliminieren“, angewendet auf Anwendungslogik.

- **Step Functions** orchestriert mehrstufige Workflows als Zustandsmaschinen.
- Jeder **Zustand** kann eine Lambda-Funktion ausführen, einen ECS-Task ausführen, warten, verzweigen oder parallele Schritte ausführen.
- **Retry und Catch** sind in jeden Zustand eingebaut – kein benutzerdefinierter Retry-Code nötig.
- **Standard-Workflows**: lang laufend (bis zu 1 Jahr), dauerhaft, Exactly-once. Für kritische Geschäftsprozesse.
- **Express-Workflows**: kurzlaufend (bis zu 5 Minuten), hoher Durchsatz. Für hochvolumige Ereignisverarbeitung.
- **Callback-Muster mit Task-Token**: einen Workflow unbegrenzt pausieren, während auf ein externes Ereignis oder eine menschliche Aktion gewartet wird; mit einem einzigen API-Aufruf fortsetzen.
- **Map-State**: eine Liste von Elementen gleichzeitig verarbeiten – sequentielle Schleifen durch paralleles Fan-out ersetzen.
- **Direkte SDK-Integrationen**: DynamoDB, S3, SQS und über 200 AWS-Dienste direkt aus einem Zustand aufrufen, ohne einen Lambda-Wrapper.
- **EventBridge**: Nebeneffekte vom Hauptworkflow entkoppeln – ein einziges Ereignis veröffentlichen, unabhängige Regeln es an Treuepunkte-, Analyse- und Umfragedienste routen lassen, ohne die Kern-Zustandsmaschine zu ändern.
- **Standard- vs. Express-Kosten**: Standard zu 0,000025 $ pro Zustandsübergang funktioniert gut für kritische Workflows mit niedrigem Volumen (Bestellbestätigung für 1,88 $/Monat bei Nimbus). Express mit Preisgestaltung pro Anfrage plus Dauer ist für hochfrequente Ereignisse angemessen, bei denen Standard ein Dutzendfaches mehr kosten würde (~80-fach in Nimbus' Clickstream-Rechnung).
- **Ereignisgesteuerte Architektur** verwendet Dienste wie SNS, SQS, Lambda und EventBridge, um Systeme um Ereignisse statt direkte Aufrufe zu entkoppeln.
- Verwenden Sie Step Functions, wenn die Koordination der Schritte selbst komplex ist und wenn Prüfbarkeit wichtig ist. Verwenden Sie es nicht für einfache Zwei-Schritt-Sequenzen, ultrahochfrequente Workflows, reines Fan-out oder synchrone, nutzerseitige Flüsse.

## Prüfungstipps

*SAA-C03-Domäne: Entwurf widerstandsfähiger Architekturen (Domäne 2, Aufgabe 2.1)*

- **Step-Functions-Anwendungsfall-Signale**: „mehrere Lambda-Funktionen orchestrieren“, „Workflow mit Wiederholungen und Fehlerbehandlung“, „menschlicher Genehmigungsschritt in einem automatisierten Workflow“, „Audit-Trail jedes Workflow-Schritts“ → Step Functions.
- **Standard vs. Express**: Standard für lang laufende, prüfbare, geschäftskritische Workflows. Express für hochdurchsatzige, kurzlaufende Ereignisverarbeitung.
- **SQS vs. Step Functions**: SQS für einfache Aufgabenwarteschlangen (Produzent/Konsument). Step Functions für mehrstufige Workflows mit komplexer Logik, Wiederholungen und Zustandsverfolgung.
- **EventBridge-Signale**: „Ereignisse von AWS-Diensten an Ziele routen“, „ereignisgesteuerte Integration zwischen Diensten“, „eine Lambda-Funktion planen“ → EventBridge (früher CloudWatch Events).
- **Callback-Muster**: Step Functions kann die Ausführung pausieren und auf einen externen Callback (ein Task-Token) warten. Der Worker ruft zurück, wenn er fertig ist. Nützlich für lang laufende ECS-Tasks, bei denen man Lambdas 15-Minuten-Limit nicht will.
- **Direkte SDK-Integrationen**: Step Functions kann AWS-Dienste direkt aufrufen (DynamoDB, S3, SQS usw.), ohne über Lambda zu gehen. Reduziert Kosten und Latenz für einfache Dienstaufrufe. Zum Beispiel kann das Schreiben eines Bestelldatensatzes in DynamoDB ein direkter SDK-Aufruf aus der Zustandsmaschine sein, ohne eine Lambda-Funktion: `"Resource": "arn:aws:states:::dynamodb:putItem"`. Das eliminiert den Lambda-Kaltstart, die Lambda-Ausführungskosten und den Code, der nur `dynamodb.put_item(...)` aufruft und zurückkehrt.

## Übungen

**Übung 1 — Erinnerung**

Erklären Sie, warum Step Functions für mehrstufige Workflows nützlich ist. Was bietet es, was eine einfache Lambda-Funktion, die andere Lambda-Funktionen aufruft, nicht bietet?

*(Hinweis: Denken Sie darüber nach, was passiert, wenn Schritt 3 von 5 in jedem Ansatz fehlschlägt. Wie wissen Sie, was passiert ist? Wie wiederholen Sie nur Schritt 3?)*

**Übung 2 — SAA-C03-Szenario**

*Szenario*: Ein Finanzdienstleistungsunternehmen verarbeitet Kreditanträge in mehreren Schritten: Bonitätsprüfung, Einkommensverifizierung, Dokumentenvalidierung, Prüfung durch einen Underwriter (manuell) und Entscheidungsbenachrichtigung. Jeder Schritt kann zwischen Sekunden (Bonitätsprüfung) und Tagen (Underwriter-Prüfung) dauern. Das Unternehmen benötigt einen vollständigen Audit-Trail jedes Schritts für die Compliance. Fehlgeschlagene automatisierte Schritte müssen automatisch wiederholt werden; manuelle Schritte müssen pausieren und auf eine menschliche Entscheidung warten.

Welcher Dienst erfüllt diese Anforderungen am BESTEN?

A) AWS-Lambda-Funktionen, die mit SQS-Warteschlangen zwischen jedem Schritt verkettet sind  
B) AWS Step Functions Standard-Workflows mit einem Wait-for-Callback-Muster für den Underwriter-Prüfungsschritt  
C) AWS Step Functions Express-Workflows für die automatisierten Schritte und SQS FIFO für den manuellen Schritt  
D) Amazon EventBridge mit Ereignisregeln, die zwischen Lambda-Funktionen für jeden Schritt routen

**Hinweis 1**: „Bis zu Tage“ Dauer – welcher Step-Functions-Typ unterstützt das?

**Hinweis 2**: „Auf eine menschliche Entscheidung warten“ – welches Step-Functions-Muster ist dafür ausgelegt?

**Hinweis 3**: „Vollständiger Audit-Trail für Compliance“ – welcher Dienst bietet eine Zustandshistorie pro Ausführung?

**Antwort**: B

**Erläuterung**: Step Functions Standard-Workflows können bis zu 1 Jahr laufen und unterstützen damit den tagelangen Underwriter-Prüfungsschritt. Das Wait-for-Callback-Muster pausiert die Ausführung beim Underwriter-Schritt mit einem Task-Token; wenn der Underwriter eine Entscheidung trifft, ruft er mit dem Token zurück, um den Workflow fortzusetzen. Standard-Workflows zeichnen jeden Zustandsübergang auf – vollständiger Audit-Trail für die Compliance.

**Warum nicht A?** Lambda, über SQS verkettet, bietet keine integrierte Zustandsverfolgung oder Audit-Trail. Fehlgeschlagene Schritte erfordern benutzerdefinierte Wiederholungslogik. Das Neustarten von einem bestimmten fehlgeschlagenen Schritt erfordert eine benutzerdefinierte Implementierung.

**Warum nicht C?** Express-Workflows haben eine maximale Dauer von 5 Minuten – inkompatibel mit einem Schritt, der Tage dauern kann.

**Warum nicht D?** EventBridge routet Ereignisse zwischen Diensten, pflegt aber keinen Workflow-Zustand und bietet kein integriertes Retry/Audit. Dies allein auf EventBridge aufzubauen erfordert benutzerdefinierte Zustandsverwaltung.

*SAA-C03-Domäne: Entwurf widerstandsfähiger Architekturen — Aufgabe 2.1*

**Übung 3 — Architektur-Herausforderung** *(Optional)*

Nimbus baut einen Prozess zur Beilegung von Streitfällen bei Lebensmittelqualität. Wenn ein Kunde eine schlechte Erfahrung meldet:

1. Der Bericht wird automatisch validiert (prüft, ob die Bestellung existiert, ob sie aktuell genug ist)
2. Das Restaurant wird automatisch benachrichtigt
3. Ein Nimbus-Support-Mitarbeiter prüft die Beschwerde (manueller Schritt – kann 1–3 Werktage dauern)
4. Basierend auf der Entscheidung des Mitarbeiters: Rückerstattung ausstellen (Lambda → Zahlungsabwickler) ODER Entschuldigungsgutschein senden (Lambda → Gutscheindienst) ODER an das Management eskalieren (Step-Functions-Subworkflow)
5. Der Kunde wird über das Ergebnis benachrichtigt

Entwerfen Sie dies als Step-Functions-Workflow. Welcher Zustandstyp behandelt jeden Schritt? Wie würden Sie die 1–3-tägige Wartezeit handhaben? Wie würden Sie die Verzweigung in Schritt 4 modellieren?

*(Es gibt keine einzige richtige Antwort. Das Ziel ist, den Entwurf von Step-Functions-Zuständen zu üben.)*

**Erweiterung**: Nachdem die Zustandsmaschine abgeschlossen ist (welcher Zweig auch immer), veröffentlicht sie ein `OrderDisputeResolved`-Ereignis in EventBridge. Welche Nebeneffekte könnten auf dieses Ereignis lauschen? Bedenken Sie: das Bewertungssystem des Restaurants, die Treuepunkte des Kunden (Rückerstattungen könnten Punkte abziehen), die Analyse-Pipeline (die Streitfallrate ist eine zentrale Qualitätsmetrik für Restaurants) und das SLA-Tracking-Dashboard des Kundensupport-Teams. Wie verhindert die Verwendung von EventBridge hier, dass die Streitfall-Zustandsmaschine zu einem Abhängigkeitsspinnennetz wird?

## Post-Credits-Szene

Der Restaurant-Onboarding-Workflow war live.

Im folgenden Monat führten 12 neue Restaurantpartner das Onboarding durch. Zwei hatten Fehler während des Zahlungsverarbeitungsschritts (Schritt 3). In beiden Fällen erfasste Step Functions den genauen Fehler, speicherte den Zustand der Ausführung und sendete eine Benachrichtigung an das Nimbus-Team.

Leo behob die Grundursache (ein falsch konfigurierter API-Schlüssel für den Zahlungsanbieter) und wiederholte beide Ausführungen ab Schritt 3. Die Ausführungen schlossen in jeweils 23 Sekunden ab und nahmen genau dort wieder auf, wo sie fehlgeschlagen waren.

Kein Restaurant musste erneut importiert werden. Keine IAM-Rollen wurden doppelt erstellt. Keine doppelten Willkommens-E-Mails wurden gesendet.

„Vor Step Functions“, sagte Leo zu Maya, „hätte das erfordert, dass jemand manuell verfolgt, was für jedes Restaurant erledigt war und was nicht, und die fehlenden Schritte manuell erneut ausführt.“

„Und jetzt?“

„Jetzt klicke ich in der Konsole auf Wiederholen. Das System weiß, was erledigt ist.“

Maya dachte darüber nach.

„Das ist nicht nur eine technische Verbesserung“, sagte sie. „Das ist der Unterschied zwischen einem Prozess, der skaliert, und einem, der es nicht tut.“

Im nächsten Kapitel: was man mit Daten tun soll, auf die man gerade nicht zugreift, die man aber definitiv für immer behalten möchte.
