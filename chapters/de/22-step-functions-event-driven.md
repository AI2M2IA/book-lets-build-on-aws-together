# Kapitel 22: Das Flussdiagramm, das sich selbst ausführt

Eine Bestellbestätigung bei Nimbus erforderte, dass fünf Dinge der Reihe nach geschahen: die Karte belasten, die Bestätigungs-E-Mail senden, das Restaurant benachrichtigen, den Bestand aktualisieren und die Transaktion für die Buchhaltung protokollieren. Wenn Schritt drei fehlschlug – wenn die Restaurantbenachrichtigung einen Timeout hatte – waren Schritte eins und zwei bereits abgeschlossen. Der Kunde wurde belastet. Die E-Mail wurde gesendet. Aber das Restaurant wusste nicht, dass die Bestellung existierte.

Leo hatte einen Namen für diese Kategorie von Fehler: den Teilerfolg. „Alles hat funktioniert", sagte er, „außer dem Teil, auf den es ankam."

„Wie oft ist das schon passiert?", fragte Maya.

„Elf Mal in den letzten zwei Wochen. Die meisten haben wir durch wütende Anrufe beim Restaurant bemerkt. Zwei haben wir in den Logs gefunden, nachträglich."

„Also haben wir keine Koordination", sagte Priya. „Fünf Schritte, die als Skript laufen, ohne Garantie, dass sie alle abschließen."

„Oder dass sie in der richtigen Reihenfolge abschließen."

„Oder dass wir wissen, welcher fehlgeschlagen ist."

Leo rief den Code auf dem Projektor auf. Es war eine Python-Funktion: fünfzig Zeilen, fünf sequenzielle API-Aufrufe, ein einzelner try/except-Block um das Ganze. „Wenn irgendetwas hier eine Ausnahme auslöst, bekommen wir einen 500 und der Kunde sieht einen Fehler. Aber Belastungen und E-Mails werden nicht zurückgerollt."

„Wir brauchen einen Workflow", sagte Maya. „Etwas, das jeden Schritt verfolgt."

**AWS Step Functions: Workflows orchestrieren**

**AWS Step Functions** ist ein serverloser Orchestrierungsdienst, der die Schritte einer Anwendung als visuellen Workflow koordiniert. Jeder Schritt ist ein **Zustand** in einer **Zustandsmaschine**.

Anstatt einem Python-Skript, das von oben nach unten läuft und abstürzt, definiert man den Workflow als JSON/YAML-Zustandsmaschine:

```json
{
  "StartAt": "ValidateLicense",
  "States": {
    "ValidateLicense": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:validate-license",
      "Next": "ImportMenu",
      "Catch": [{"ErrorEquals": ["*"], "Next": "OnboardingFailed"}]
    },
    "ImportMenu": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:import-menu",
      "Next": "SetupPayments",
      "Retry": [{"ErrorEquals": ["*"], "MaxAttempts": 3, "IntervalSeconds": 5}]
    },
    ...
  }
}
```

Jeder Zustand kann:

- **Eine Lambda-Funktion ausführen** (das häufigste Muster)
- **Eine ECS-Aufgabe ausführen** (für länger laufende Arbeit)
- **Auf eine bestimmte Zeit** oder ein **Ereignis warten** (den Workflow pausieren, bis etwas Externes passiert)
- **Einen Pfad wählen** basierend auf Bedingungen (if/else-Logik)
- **Parallele Zweige gleichzeitig ausführen**
- **Bei Fehler wiederholen** mit konfigurierbarem Backoff
- **Fehler abfangen** und zu Fehlerbehandlungszuständen weiterleiten

Step Functions verwaltet den Ausführungszustand dauerhaft. Wenn Schritt 3 fehlschlägt, pausiert die Ausführung bei Schritt 3. Man kann die fehlgeschlagene Ausführung in der Konsole inspizieren, das Problem beheben und von Schritt 3 aus neu starten – ohne Schritte 1 und 2 zu wiederholen.

**Zustandstypen: Die Bausteine**

**Task**: Eine Aktion ausführen – eine Lambda-Funktion aufrufen, eine ECS-Aufgabe starten, eine API aufrufen. Hier geschieht die eigentliche Arbeit.

**Choice**: Basierend auf Bedingungen in den Eingabedaten verzweigen. Wie ein if/else im Code.

**Parallel**: Mehrere Zweige gleichzeitig ausführen und warten, bis alle abgeschlossen sind.

**Map**: Eine Reihe von Zuständen auf jedes Element in einer Liste anwenden. 50 Restaurantmenüelemente parallel verarbeiten.

**Wait**: Für eine bestimmte Zeit oder bis zu einem Zeitstempel pausieren. Nützlich für geplante Verzögerungen.

**Pass**: Eingabe ohne Arbeit an Ausgabe weitergeben. Wird für Datentransformation und Tests verwendet.

**Succeed/Fail**: Terminale Zustände, die die Ausführung beenden.

Für das Restaurant-Onboarding entwarf Leo einen Workflow:

1. ValidateLicense (Task → Lambda)
2. ImportMenu (Task → Lambda, mit 3 Wiederholungen)
3. Paralleler Zweig:
   a. SetupPayments (Task → Lambda)
   b. CreateIAMRole (Task → Lambda)
4. SendWelcomeEmail (Task → Lambda, wartet auf Abschluss des parallelen Zweigs)
5. NotifySalesTeam (Task → Lambda)

Schritte 3a und 3b laufen parallel – sie hängen nicht voneinander ab, und das gleichzeitige Ausführen spart Zeit.

**Standard- vs. Express-Workflows**

Step Functions bietet zwei Workflow-Typen:

**Standard-Workflows**:

- Maximale Dauer: 1 Jahr
- Ausführungen sind dauerhaft – der Zustand wird gespeichert, kann inspiziert und geprüft werden
- Mindestens-einmal-Ausführung (jede Aufgabe wird mindestens einmal ausgeführt)
- Pro Zustandsübergang berechnet
- Am besten für lang laufende, wichtige Workflows (Bestellverarbeitung, Onboarding, Zahlungsflüsse)

**Express-Workflows**:

- Maximale Dauer: 5 Minuten
- Höherer Durchsatz – bis zu 100.000 pro Sekunde
- Mindestens-einmal oder höchstens-einmal (konfigurierbar)
- Pro Dauer berechnet (wie Lambda)
- Am besten für hochvolumige, kurzlaufende Workflows (Echtzeit-Ereignisverarbeitung, IoT-Datenerfassung)

Für Nimbus' Restaurant-Onboarding: Standard (es ist wichtig, dauerhaft, kann Stunden dauern, wenn manuelle Schritte beteiligt sind).

Für Nimbus' Echtzeit-Bestellstatusaktualisierungen: Express (hohes Volumen, kurze Dauer, weniger kritisch).

**Ereignisgesteuerte Architektur: Das große Bild**

Step Functions ist ein Teil eines größeren Musters: **ereignisgesteuerte Architektur**. Anstatt dass Dienste sich direkt gegenseitig aufrufen (enge Kopplung), senden Dienste Ereignisse aus, und andere Dienste reagieren auf diese Ereignisse.

Wir haben das im gesamten Buch gesehen:

- Bestellungen aufgegeben → SNS veröffentlicht Ereignis → SQS-Warteschlangen liefern an Verbraucher
- S3-Datei hochgeladen → Lambda ausgelöst, um sie zu verarbeiten
- DynamoDB-Datensatz geändert → DynamoDB Streams → Lambda aktualisiert einen Cache

**Amazon EventBridge** (früher CloudWatch Events) ist der erweiterte Ereignisbus für dieses Muster. Er leitet Ereignisse von AWS-Diensten und eigenen Anwendungen an Ziele (Lambda, SQS, Step Functions usw.) basierend auf Regeln weiter.

EventBridge ermöglicht lose Kopplung auf architektonischer Ebene: Der Bestelldienst veröffentlicht `order.placed`-Ereignisse, ohne zu wissen, wer zuhört. Der Analysedienst, der Benachrichtigungsdienst und der Treuepunkte-Dienst hören alle unabhängig voneinander zu. Das Hinzufügen eines neuen Zuhörers erfordert keine Änderung des Bestelldienstes.

**Wann Step Functions das richtige Werkzeug ist**

Step Functions glänzt, wenn man hat:

**Mehrstufige Workflows**, die den Fortschritt über Schritte hinweg verfolgen müssen

**Prozesse mit menschlicher Beteiligung** – Step Functions kann unbegrenzt auf ein externes Ereignis warten (wie ein Mensch, der etwas genehmigt) und dann fortfahren

**Fehlerbehandlung in großem Maßstab** – integrierte Wiederholungs-, Abfang- und Fallback-Logik über viele Schritte

**Prüfbare Prozesse** – jede Ausführung zeichnet jeden Zustandsübergang auf. Man kann genau sehen, was wann passiert ist.

**Komplexe parallele oder sequenzielle Logik** – der visuelle Workflow macht es einfacher, darüber nachzudenken als über äquivalenten Code

Step Functions ist überdimensioniert für einfache Zwei-Schritt-Prozesse. Verwende es, wenn die Koordination selbst wertvoll ist und die Fehlerszenarien wichtig sind.

## Stärken und Grenzen

**Warum Step Functions leistungsstark ist**:

- Visuelle Ausführungshistorie – genau sehen, wo ein Workflow ist (oder fehlgeschlagen ist)
- Integrierte Wiederholung und Fehlerbehandlung – kein benutzerdefinierter Wiederholungscode
- Dauerhafter Zustand – Ausführungen überleben Dienst-Neustarts und Ausfälle
- Direkte Integrationen mit 200+ AWS-Diensten (nicht nur Lambda)
- Der visuelle Workflow ist selbst dokumentierend

**Wo es kompliziert wird**:

- Standard-Workflows werden pro Zustandsübergang berechnet – komplexe Workflows mit vielen Zuständen können in großem Maßstab teuer werden
- Das ASL (Amazon States Language) JSON-Format hat eine Lernkurve
- Maximale Nutzlastgröße ist 256 KB – große Daten müssen über S3-Referenzen übergeben werden, nicht direkt durch den Workflow
- Lang laufende Workflows mit vielen manuellen Schritten erfordern sorgfältige Timeout-Konfiguration

## Zusammenfassung

- **Step Functions** orchestriert mehrstufige Workflows als Zustandsmaschinen.
- Jeder **Zustand** kann eine Lambda-Funktion ausführen, eine ECS-Aufgabe ausführen, warten, verzweigen oder parallele Schritte ausführen.
- **Wiederholen und Abfangen** sind in jeden Zustand eingebaut – kein benutzerdefinierter Wiederholungscode erforderlich.
- **Standard-Workflows**: Lang laufend (bis zu 1 Jahr), dauerhaft, mindestens einmal. Für kritische Geschäftsprozesse.
- **Express-Workflows**: Kurzlaufend (bis zu 5 Minuten), hoher Durchsatz. Für hochvolumige Ereignisverarbeitung.
- **Ereignisgesteuerte Architektur** verwendet Dienste wie SNS, SQS, Lambda und EventBridge, um Systeme um Ereignisse statt um direkte Aufrufe zu entkoppeln.
- Step Functions verwenden, wenn die Koordination von Schritten selbst komplex ist und wenn Prüfbarkeit wichtig ist.

## Prüfungstipps

*SAA-C03-Domäne: Resiliente Architekturen entwerfen (Domäne 2, Aufgabe 2.1)*

- **Step Functions-Anwendungsfallsignale**: „Mehrere Lambda-Funktionen orchestrieren", „Workflow mit Wiederholungen und Fehlerbehandlung", „menschlicher Genehmigungsschritt in einem automatisierten Workflow", „Prüfprotokoll jedes Workflow-Schritts" → Step Functions.
- **Standard vs. Express**: Standard für lang laufende, prüfbare, geschäftskritische Workflows. Express für hochdurchsatzigen, kurzlaufenden Ereignisverarbeitungs.
- **SQS vs. Step Functions**: SQS für einfache Aufgabenwarteschlangen (Produzent/Verbraucher). Step Functions für mehrstufige Workflows mit komplexer Logik, Wiederholungen und Zustandsverfolgung.
- **EventBridge-Signale**: „Ereignisse von AWS-Diensten an Ziele weiterleiten", „ereignisgesteuerte Integration zwischen Diensten", „Lambda-Funktion planen" → EventBridge (früher CloudWatch Events).
- **Callback-Muster**: Step Functions kann die Ausführung pausieren und auf einen externen Callback (ein Aufgaben-Token) warten. Der Worker ruft zurück, wenn fertig. Nützlich für lang laufende ECS-Aufgaben, wo man das 15-Minuten-Limit von Lambda nicht möchte.
- **Direkte SDK-Integrationen**: Step Functions kann AWS-Dienste direkt aufrufen (DynamoDB, S3, SQS usw.) ohne über Lambda zu gehen. Reduziert Kosten und Latenz für einfache Dienstaufrufe.

## Übungen

**Übung 1 – Wiederholen**

Erkläre, warum Step Functions für mehrstufige Workflows nützlich ist. Was bietet es, was eine einfache Lambda-Funktion, die andere Lambda-Funktionen aufruft, nicht bietet?

*(Hinweis: Denke darüber nach, was passiert, wenn Schritt 3 von 5 in jedem Ansatz fehlschlägt. Wie weißt du, was passiert ist? Wie wiederholst du nur Schritt 3?)*

**Übung 2 – Prüfungsübung**

*Szenario*: Ein Finanzdienstleistungsunternehmen verarbeitet Kreditanträge in mehreren Schritten: Bonitätsprüfung, Einkommensverifizierung, Dokumentenvalidierung, Zeichnerbewertung (manuell) und Entscheidungsbenachrichtigung. Jeder Schritt kann zwischen Sekunden (Bonitätsprüfung) und Tagen (Zeichnerbewertung) dauern. Das Unternehmen benötigt ein vollständiges Prüfprotokoll jedes Schritts für die Compliance. Fehlgeschlagene automatisierte Schritte müssen automatisch wiederholt werden; manuelle Schritte müssen pausieren und auf eine menschliche Entscheidung warten.

Welcher Dienst erfüllt diese Anforderungen OPTIMAL?

A) AWS Lambda-Funktionen miteinander verkettet mit SQS-Warteschlangen zwischen jedem Schritt  
B) AWS Step Functions Standard-Workflows mit einem Warte-auf-Callback-Muster für den Zeichner-Bewertungsschritt  
C) AWS Step Functions Express-Workflows für die automatisierten Schritte und SQS FIFO für den manuellen Schritt  
D) Amazon EventBridge mit Ereignisregeln, die Lambda-Funktionen für jeden Schritt weiterleiten

**Hinweis 1**: „Bis zu Tagen" Dauer – welcher Step Functions-Typ unterstützt das?

**Hinweis 2**: „Auf eine menschliche Entscheidung warten" – welches Step Functions-Muster ist dafür ausgelegt?

**Hinweis 3**: „Vollständiges Prüfprotokoll für Compliance" – welcher Dienst bietet eine Zustandshistorie pro Ausführung?

**Antwort**: B

**Erläuterung**: Step Functions Standard-Workflows können bis zu 1 Jahr laufen und unterstützen damit den tagelangen Zeichner-Bewertungsschritt. Das Warte-auf-Callback-Muster pausiert die Ausführung beim Zeichner-Schritt mit einem Aufgaben-Token; wenn der Zeichner eine Entscheidung trifft, ruft er mit dem Token zurück, um den Workflow fortzusetzen. Standard-Workflows zeichnen jeden Zustandsübergang auf – vollständiges Prüfprotokoll für die Compliance.

**Warum nicht A?** Lambda, das über SQS verkettet ist, bietet keine integrierte Zustandsverfolgung oder Prüfprotokollierung. Fehlgeschlagene Schritte erfordern benutzerdefinierte Wiederholungslogik. Das Neustartan von einem bestimmten fehlgeschlagenen Schritt erfordert benutzerdefinierte Implementierung.

**Warum nicht C?** Express-Workflows haben eine maximale Dauer von 5 Minuten – inkompatibel mit einem Schritt, der Tage dauern kann.

**Warum nicht D?** EventBridge leitet Ereignisse zwischen Diensten weiter, pflegt aber keinen Workflow-Zustand und bietet keine integrierten Wiederholungs-/Prüffunktionen. Das Aufbauen auf EventBridge allein erfordert benutzerdefinierte Zustandsverwaltung.

*SAA-C03-Domäne: Resiliente Architekturen entwerfen – Aufgabe 2.1*

**Übung 3 – Architektur-Challenge** *(Optional)*

Nimbus baut einen Prozess zur Beilegung von Lebensmittelqualitätsstreitigkeiten. Wenn ein Kunde eine schlechte Erfahrung meldet:

1. Der Bericht wird automatisch validiert (prüft, ob die Bestellung existiert, ob sie aktuell genug ist)
2. Das Restaurant wird automatisch benachrichtigt
3. Ein Nimbus-Support-Agent prüft die Beschwerde (manueller Schritt – kann 1-3 Werktage dauern)
4. Basierend auf der Entscheidung des Agenten: Rückerstattung ausstellen (Lambda → Zahlungsabwickler) ODER Entschuldigungsgutschein senden (Lambda → Gutschein-Dienst) ODER an das Management eskalieren (Step Functions-Unterworkflow)
5. Kunde wird über das Ergebnis benachrichtigt

Entwirf das als Step Functions-Workflow. Welcher Zustandstyp verarbeitet jeden Schritt? Wie würdest du die 1-3-tägige Wartezeit handhaben? Wie würdest du die Verzweigung in Schritt 4 modellieren?

*(Es gibt keine einzige richtige Antwort. Das Ziel ist es, Step Functions-Zustandsentwurf zu üben.)*

## Post-Credits-Szene

Der Restaurant-Onboarding-Workflow war live.

Im folgenden Monat onboardeten 12 neue Restaurantpartner. Zwei hatten Fehler während des Zahlungsverarbeitungsschritts (Schritt 3). In beiden Fällen erfasste Step Functions den genauen Fehler, speicherte den Zustand der Ausführung und sendete eine Benachrichtigung an das Nimbus-Team.

Leo behob die Grundursache (ein falsch konfigurierter API-Schlüssel für den Zahlungsanbieter) und wiederholte beide Ausführungen ab Schritt 3. Die Ausführungen wurden in jeweils 23 Sekunden abgeschlossen und nahmen genau dort auf, wo sie fehlgeschlagen waren.

Kein Restaurant musste erneut importiert werden. Keine IAM-Rollen wurden doppelt erstellt. Keine doppelten Willkommens-E-Mails wurden gesendet.

„Vor Step Functions", sagte Leo zu Maya, „hätte das erfordert, dass jemand manuell verfolgt, was für jedes Restaurant getan wurde und was nicht, und die fehlenden Schritte manuell erneut ausführt."

„Und jetzt?"

„Jetzt klicke ich auf Wiederholen in der Konsole. Das System weiß, was erledigt ist."

Maya dachte darüber nach.

„Das ist nicht nur eine technische Verbesserung", sagte sie. „Das ist der Unterschied zwischen einem Prozess, der skaliert, und einem, der es nicht tut."

Im nächsten Kapitel: was tun mit Daten, auf die man gerade nicht zugreift, aber definitiv für immer behalten möchte.
