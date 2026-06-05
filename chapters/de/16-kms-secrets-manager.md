# Kapitel 16: Schlüssel, Sperren und Geheimnisse

Leo überprüfte die Git-Historie, als er es fand: ein Datenbankpasswort. Vor sechs Monaten in Klartext von jemandem gepackt, der nicht mehr bei Nimbus arbeitete. Der Commit war öffentlich. Das Passwort wurde inzwischen geändert – aber sie wussten das nicht mit Sicherheit. Sie prüften jedes System, das dieses Credential jemals berührt hatte. Es dauerte vier Stunden. An diesem Tag beschloss Nimbus, keine Geheimnisse mehr im Code zu speichern.

**Die Zwei Probleme: Speicherung von Geheimnissen und Verschlüsselung von Daten**

Die Sicherheit von sensiblen Informationen hat zwei distincte Probleme:

**Speicherung von Anmeldeinformationen** (Datenbankpasswörter, API-Schlüssel, Verbindungszeichenfolgen): Wo werden diese gespeichert? Wer kann darauf zugreifen? Wie drehen Sie sie um, ohne Ihre Anwendung neu bereitstellen zu müssen?

**Verschlüsselung von Daten** (Kundendaten, Zahlungsprotokolle, PII): Wie stellen Sie sicher, dass selbst wenn jemand unbefugten Zugriff auf Ihre Datenbank oder Ihren S3-Bucket erhält, er die Daten nicht lesen kann?

AWS bietet für jedes Problem einen dedizierten Service:

- **AWS Secrets Manager**: Speichert und verwaltet Anmeldeinformationen sicher
- **AWS KMS (Key Management Service)**: Verwaltet Verschlüsselungsschlüssel zum Verschlüsseln und Entschlüsseln von Daten

**AWS Secrets Manager: Keine Hardcodierten Anmeldeinformationen mehr**

Secrets Manager ist ein sicherer Speicher für Geheimnisse: Datenbankanmeldeinformationen, API-Schlüssel, OAuth-Token, SSH-Schlüssel oder alles andere, was sensibel ist.

Anstatt Ihre Anwendung ein Passwort aus einer Umgebungsvariablen oder einer Konfigurationsdatei liest, ruft sie beim Start (oder bei Bedarf) die Secrets Manager API auf und ruft das Geheimnis ab. Das Geheimnis berührt nie die Festplatte. Es erscheint nie in Ihrem Code. Es ist nicht in Ihren Umgebungsvariablen.

So sieht der Ablauf aus:

**Alte Methode**:

```
DB_PASSWORD=supersecretpassword123  # in .env file or environment variable
```

**Secrets Manager Weg**:

```python
import boto3
client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='nimbus/production/db-password')
password = json.loads(secret['SecretString'])['password']
```

Die EC2-Instanz benötigt eine IAM-Rolle mit Berechtigungen, um `secretsmanager:GetSecretValue` für dieses spezielle Geheimnis aufzurufen. Kein anderer Dienst darf es lesen. Das Geheimnis befindet sich niemals im Code.

**Automatische Rotation: Die wahre Macht**

Das größte Merkmal von Secrets Manager ist nicht das Speichern von Geheimnissen – es ist das automatische Rotieren dieser.

Hier ist das Szenario: Secrets Manager generiert alle 30 Tage ein neues Datenbankpasswort, aktualisiert es in RDS, aktualisiert das gespeicherte Geheimnis und Ihre Anwendung ruft das neue Passwort beim nächsten Mal ab, wenn es benötigt wird. Keine manuelle Intervention. Keine Bereitstellung. Kein „Ich muss daran denken, dieses zu rotieren.“

Die Rotation wird als Lambda-Funktion implementiert. AWS stellt Vorlagen für RDS-Datenbanken (MySQL, PostgreSQL, Aurora) bereit. Sie können die Funktion für jeden Credential-Typ anpassen.

Tom hatte eine Frage zu den Kosten. (Selbstverständlich hatte er das.)

Secrets Manager berechnet Kosten pro Geheimnis pro Monat plus pro API-Aufruf. Für eine kleine Anzahl von Datenbankpasswörtern und API-Schlüsseln betragen die Kosten Dollar pro Monat – vernachlässigbar im Vergleich zu den Kosten eines Vorfalls.

„Der Kompromiss letzte Woche“, sagte Priya, „was hätte es gekostet, um ihn zu untersuchen und zu beheben?“

Tom schwieg einen Moment. „Einschließlich meiner Zeit, Ihrer Zeit, Leos Wochenende… ein paar tausend Dollar.“

„Secrets Manager hätte den statischen Schlüssel entdeckt, bevor er ausgenutzt wurde. Und es hätte ihn automatisch rotiert.“

Tom öffnete die Preisübersicht.

**AWS KMS: Die Fabrik für Schlösser**

AWS KMS (Key Management Service) verwaltet **verschlüsselte Schlüssel** – die Geheimwerte, die zum Verschlüsseln und Entschlüsseln von Daten verwendet werden.

Das Analogie: KMS ist wie ein Unternehmen, das Schließkästen herstellt, das hält den Hauptschlüssel. Ihre Daten (der Inhalt der Kiste) ist verschlüsselt. Nur jemand mit Berechtigung, den KMS-Schlüssel zu verwenden, kann ihn entschlüsseln. KMS protokolliert jeden Gebrauch jedes Schlüssels in CloudTrail.

**Customer Master Keys (CMKs)** – jetzt auch KMS-Schlüssel – gibt es in zwei Typen:

**AWS verwaltete Schlüssel**: AWS erstellt und verwaltet den Schlüssel automatisch für Dienste wie S3, EBS, RDS. Sie haben keine direkte Kontrolle über den Schlüssel, aber Sie können sehen, dass er verwendet wird. Kostenlos.

**Kunden verwaltete Schlüssel**: Sie erstellen den Schlüssel in KMS und kontrollieren jeden Aspekt davon: Wer darf ihn verwenden, wann er rotiert wird, wer ihn verwalten kann. Sie können automatische jährliche Rotation aktivieren. Kosten: 1 $/Monat pro Schlüssel plus Kosten pro API-Aufruf.

**Verschlüsselung in AWS-Diensten: KMS-Integration**

Die meisten AWS-Dienste integrieren sich mit KMS für die Verschlüsselung:

**S3**: Aktivieren Sie „Server-Side-Verschlüsselung mit KMS“ für einen Bucket. Jedes Objekt wird abrufbar mit einem KMS-Schlüssel verschlüsselt. Das Lesen eines Objekts erfordert Berechtigungen sowohl für den S3-Bucket als auch für den KMS-Schlüssel.

**RDS**: Aktivieren Sie die Verschlüsselung bei der Erstellung. Die Datenbank-Speicherung, Backups und Snapshots werden alle mit einem KMS-Schlüssel verschlüsselt. Anmerkung: Die Verschlüsselung kann nicht auf einer nicht verschlüsselten RDS-Instanz aktiviert werden – Sie müssen ein Snapshot erstellen, den Snapshot mit verschlüsselter Verschlüsselung kopieren und wiederherstellen.

**EBS**: Verschlüsseln Sie Volumes mit KMS. Neue Volumes, die aus verschlüsselten Snapshots erstellt werden, werden automatisch verschlüsselt.

**DynamoDB**: Die Verschlüsselung abrufbar mit KMS wird standardmäßig für alle Tabellen aktiviert.

**ElastiCache Redis**: Verschlüsselung abrufbar mit KMS für sensible gecachte Daten.

Das Prinzip: Daten sollten abrufbar mit KMS verschlüsselt werden (gespeichert auf der Festplatte) und während der Übertragung (sich über ein Netzwerk bewegend). KMS verwaltet die Verschlüsselung abrufbar (gespeichert auf der Festplatte). TLS/SSL (automatisch von AWS-Diensten bereitgestellt) verwaltet die Verschlüsselung während der Übertragung.

**Umschließende Verschlüsselung: Wie KMS tatsächlich funktioniert**

Hier ist ein Detail, das Ihnen hilft, KMS-Verhaltensweisen und Prüfungsfragen zu verstehen.

KMS verschlüsselt Ihre Daten in den meisten Fällen nicht direkt. Es verwendet **umschließende Verschlüsselung**:

1. KMS generiert einen **Daten-Schlüssel** (einen eindeutigen symmetrischen Schlüssel)
2. Der Dienst verwendet den Daten-Schlüssel, um Ihre Daten lokal zu verschlüsseln (schnell – symmetrische Verschlüsselung)
3. Der Dienst bittet KMS, den Daten-Schlüssel selbst zu verschlüsseln (mit Ihrem KMS-Schlüssel)
4. Sowohl der verschlüsselte Datensatz als auch der verschlüsselte Daten-Schlüssel werden gespeichert
5. Ihre tatsächlichen Daten verlassen den Dienst nicht – nur der Daten-Schlüssel geht zu KMS zur Verschlüsselung/Entschlüsselung
6. Wenn Sie die Daten lesen:

1. Der Dienst bittet KMS, den Daten-Schlüssel zu entschlüsseln
2. KMS prüft Berechtigungen, entschlüsselt den Daten-Schlüssel, gibt ihn zurück
3. Der Dienst verwendet den entschlüsselten Daten-Schlüssel, um Ihre Daten lokal zu entschlüsseln

Dadurch kann KMS große Datenmengen verarbeiten, ohne sie alle über die KMS-API zu senden. Nur kleine Schlüssel gehen zu KMS zur Verschlüsselung/Entschlüsselung. CloudTrail protokolliert jeden KMS-API-Aufruf – jede Verschlüsselungs- und Entschlüsselungsoperation.

**Secrets Manager vs Parameter Store**

AWS hat auch **Systems Manager Parameter Store**, der Konfigurationswerte (nicht nur Geheimnisse) speichert. Parameter Store ist günstiger – kostenlos für Standardparameter. Er kann auch verschlüsselte Parameter mit KMS speichern.

Für Geheimnisse, die rotiert werden müssen: Secrets Manager.

Für Konfigurationswerte und nicht-sensible Parameter: Parameter Store (der kostenlose Tarif ist sehr großzügig).

Für Anwendungs-Konfigurationen (Portnummern, Feature-Flags, umweltbezogene Einstellungen): Parameter Store.

## Stärken und Grenzen

**AWS Secrets Manager**:

- Automatische Geheimrotierung ohne Codeänderungen
- Fein abgestufte IAM-Zugriffskontrolle pro Geheimnis
- Versionierung (Greifen Sie auf die vorherige Version während der Rotation zu)
- Audit durch CloudTrail
- Kosten: ca. 0,40 $/Geheimnis/Monat + API-Aufrufe

**AWS KMS**:

- Zentralisierte Schlüsselverwaltung mit vollständigem Nachverfolgungsablauf
- Automatisches jährliches Schlüssel-Rotationsverfahren für von Kunden verwaltete Schlüssel
- Fein abgestufte IAM-Berechtigungen pro Schlüssel (Schlüsselrichtlinien + IAM-Richtlinien)
- Hardware Security Modul (HSM)-basiert – Schlüssel verlassen das HSM niemals
- Kosten: 1 $/Monat pro Schlüssel + 0,03 $ pro 10.000 API-Aufrufen

**Wo es kompliziert wird**:

- KMS-Schlüsselrichtlinien sind von (und werden parallel zu) IAM-Richtlinien bewertet – können schwer zu debuggen sein
- Verschlüsselung im Ruhezustand muss geplant werden – Sie können eine bestehende, nicht verschlüsselte RDS-Instanz „in-place“ verschlüsseln
- Schlüsselentfernung in KMS hat eine Wartezeit von 7-30 Tagen (ein Sicherheitsmechanismus – verlorene Schlüssel bedeuten verlorenen Daten)
- Die Kosten von Secrets Manager skalieren mit der Anzahl der Geheimnisse und API-Aufrufen im Maßstab

## Zusammenfassung

- Speichern Sie niemals Anmeldeinformationen in Code, Umgebungsvariablen oder Konfigurationsdateien, die in einem Versionskontrollsystem gespeichert sind.
- **Secrets Manager** speichert Anmeldeinformationen sicher und rotiert diese automatisch. Anwendungen holen Geheimnisse über eine API ab.
- **KMS** verwaltet Verschlüsselungsschlüssel. Die meisten AWS-Dienste integrieren sich mit KMS für die Verschlüsselung im Ruhezustand.
- **Verschlüsselung im Ruhezustand** (Daten, die auf der Festplatte gespeichert sind), verwendet KMS-Schlüssel, die von AWS oder Ihnen verwaltet werden. **Verschlüsselung während der Übertragung** verwendet TLS.
- **Umschlagverschlüsselung**: KMS verschlüsselt den Schlüssel, nicht die Daten direkt. Der Dienst verschlüsselt Daten mit einem lokalen Datenschlüssel.
- **Von Kunden verwaltete KMS-Schlüssel**: Volle Kontrolle über Rotation, Zugriff und Nachverfolgung. **Von AWS verwaltete Schlüssel**: Automatisch, keine Konfiguration erforderlich.
- **Parameter Store** ist eine leichtere Alternative zu Secrets Manager für nicht-sensible Konfigurationswerte.

## Prüftipps

*SAA-C03 Domain: Design Secure Architectures (Domain 1, Task 1.3)*

- **Secrets Manager vs. SSM Parameter Store**: Secrets Manager für Anmeldeinformationen, die automatisch rotiert werden müssen; Parameter Store für allgemeine Konfigurationen. Die Prüfung unterscheidet sie anhand des Rotationsanforderung und der Kostensensitivität.
- **KMS-Schlüsselrichtlinien**: Ein KMS-Schlüssel hat seine eigene Schlüsselrichtlinie (eine ressourcenbasierte Richtlinie). IAM-Richtlinien allein gewähren keinen Zugriff auf einen KMS-Schlüssel – die Schlüsselrichtlinie muss es explizit zulassen.
- **Verschlüsselung von RDS**: Es ist nicht möglich, die Verschlüsselung auf einer bestehenden, nicht verschlüsselten RDS-Instanz zu aktivieren. Der Prozess: Erstellen Sie ein Snapshot → Kopieren Sie den Snapshot mit aktivierter Verschlüsselung → Wiederherstellen aus dem verschlüsselten Snapshot → Migrieren Sie den Datenverkehr zur neuen Instanz.
- **Verschlüsselung von EBS**: Neue Volumes können verschlüsselt werden. Snapshots von verschlüsselten Volumes sind immer verschlüsselt. Unverschlüsselte Volumes können nicht direkt verschlüsselt werden – Snapshot + Kopieren + Wiederherstellen.
- **CloudTrail + KMS**: Jeder KMS-API-Aufruf wird in CloudTrail protokolliert. Dies ist eine wichtige Funktion zur Einhaltung der Vorschriften.
- **Multi-Region-KMS-Schlüssel**: Replikieren Sie Schlüsselmaterial in mehrere Regionen, damit die Entschlüsselung ohne Cross-Region-API-Aufrufe erfolgen kann. Die Prüfung verwendet dies für die Multi-Region-Katastrophenwiederherstellung mit verschlüsseltem Daten.
- **KMS vs. CloudHSM**: KMS ist mehrbenutzerbasiert (von AWS verwaltet). CloudHSM ist ein dediziertes Hardware Security Modul, das nur Sie kontrollieren. Die Prüfung signalisiert: „FIPS 140-2 Level 3“, „dediziertes HSM“, „kundenverwaltete kryptografische Operationen“ → CloudHSM.

## Übungen

**Übung 1 – Erinnerung**

Erklären Sie das Konzept der Umschlagverschlüsselung. Warum verschlüsselt KMS einen kleinen Datenschlüssel anstelle der direkten Verschlüsselung Ihrer Anwendungdaten?

*(Hinweis: Denken Sie darüber nach, was passiert, wenn Sie 1 GB Daten verschlüsseln müssen und welche Auswirkungen die Übertragung von 1 GB an einen Remote-KMS-Dienst hätte.)*

**Übung 2 – Prüfungsübung**

*Szenario*: Ein Finanzdienstleistungsunternehmen speichert sensible Kundendaten in einer RDS MySQL-Datenbank. Eine neue Compliance-Anforderung schreibt vor, dass:

1. Alle Daten verschlüsselt werden müssen, wenn sie ruhen
2. Die gesamte Schlüsselnutzung auditiert werden muss
3. Die Schlüssel von Kunden verwaltet werden müssen (nicht von AWS verwaltet)
4. Das Datenbankpasswort alle 90 Tage rotiert werden muss

Die Datenbank wurde vor sechs Monaten ohne Verschlüsselung erstellt. Welche Reihe von Aktionen erfüllt am besten die vier Anforderungen?

A) Aktivieren Sie die RDS-Verschlüsselung auf der vorhandenen Datenbank; erstellen Sie einen von Kunden verwalteten KMS-Schlüssel; konfigurieren Sie Secrets Manager mit einer 90-tägigen Rotation
B) Erstellen Sie einen Snapshot der vorhandenen Datenbank; kopieren Sie den Snapshot mit einem von Kunden verwalteten KMS-Schlüssel verschlüsselt; stellen Sie aus dem verschlüsselten Snapshot wieder her; konfigurieren Sie Secrets Manager mit einer 90-tägigen Rotation
C) Erstellen Sie eine neue verschlüsselte RDS-Instanz mit einem von AWS verwalteten Schlüssel; migrieren Sie die Daten von der alten Instanz; konfigurieren Sie Secrets Manager mit einer 90-tägigen Rotation
D) Aktivieren Sie die RDS-Verschlüsselung im Ruhezustand auf der vorhandenen Datenbank mit einem von AWS verwalteten Schlüssel; konfigurieren Sie Secrets Manager mit einer 90-tägigen Rotation

**Hinweis 1**: Sie können die Verschlüsselung auf einer bestehenden, nicht verschlüsselten RDS-Instanz nicht direkt aktivieren.

**Hinweis 2**: „Kundenverwaltet“ bedeutet Kundenverwaltete KMS-Schlüssel, nicht von AWS verwaltete Schlüssel.

**Hinweis 3**: Der Snapshot-Kopie-Prozess ist der Standard-Migrationspfad für verschlüsselte RDS.

**Antwort**: B

**Erläuterung**: RDS-Verschlüsselung kann nicht auf einer bestehenden Instanz aktiviert werden. Der Standardansatz ist: Snapshot der bestehenden Instanz erstellen → Snapshot mit aktivierter Verschlüsselung mithilfe eines von Ihnen verwalteten KMS-Schlüssels kopieren (erfüllt Anforderungen 1, 2 und 3) → Wiederherstellung aus dem verschlüsselten Snapshot. Von Ihnen verwaltete KMS-Schlüssel protokollieren automatisch alle Nutzung in CloudTrail (Prüfung) und halten die Verschlüsselungsschlüssel unter Ihrer Kontrolle. Secrets Manager verwaltet die automatische 90-Tage-Passwortrotation (erfüllt Anforderung 4).

**Warum nicht A?** Sie können die Verschlüsselung nicht auf einer bestehenden, nicht verschlüsselten RDS-Instanz vor Ort aktivieren.

**Warum nicht C?** Von AWS verwaltete Schlüssel erfüllen die Anforderung "Kundenkontrolle" nicht (Anforderung 3).

**Warum nicht D?** Gleiches Problem wie A (kann nicht vor Ort aktiviert werden) plus AWS-verwalteter Schlüssel erfüllt Anforderung 3 nicht.

*SAA-C03 Domäne: Sichere Architekturentwürfe – Aufgabe 1.3*

**Übung 3 – Architektur-Herausforderung** *(Optional)*

Nimbus muss die folgenden sensiblen Daten speichern:

- Datenbankpasswort für die Produktions-RDS-Instanz
- Stripe API-Geheimschlüssel (für die Zahlungsabwicklung)
- Einen symmetrischen Verschlüsselungsschlüssel zum Verschlüsseln des Kundenbestelldatensatzes in DynamoDB
- Restaurant-spezifische Konfigurationswerte (API-Endpunkte, Feature-Flags – nicht sensibel)

Welchen AWS-Dienst oder welche Methode würden Sie für jeden verwenden? Welche Rotationsstrategie würden Sie für jeden anwenden?

*(Es gibt keine eindeutige richtige Antwort. Das Ziel ist es, die Übereinstimmung von Sicherheitstools mit Anwendungsfällen zu üben.)*

## Szenario nach den Credits

Die Geheimnisse wurden migriert.

Datenbankpasswörter: Secrets Manager, Rotation alle 30 Tage.

API-Schlüssel: Secrets Manager, mit einer Rotations-Lambda, die den API-Aufruf des Zahlungsanbieters aufgerufen hat, um einen neuen Schlüssel zu generieren.

Kundenbestelldaten: Verschlüsselt mit einem von Ihnen verwalteten KMS-Schlüssel.

Alte Anmeldeinformationen: Deaktiviert. Alte Konfigurationsdateien: Gelöscht. Alte GitHub Actions Secrets: Entfernt.

"Wir sind jetzt prüfbereit", sagte Priya.

"Definieren Sie prüfbereit", sagte Maya.

"Wenn uns ein Compliance-Prüfer bitten würde, zu beweisen, dass keine Anmeldeinformationen in unserem Code oder in unserer Infrastruktur hartcodiert oder in unserer Infrastruktur offengelegt sind, könnten wir ihm zeigen: Jeder Geheimnis ist in Secrets Manager, jeder Verschlüsselungsschlüssel in KMS, jeder Zugriff in CloudTrail protokolliert."

"Wann wurde das letzte Mal CloudTrail-Protokolle überprüft?"

Eine Pause.

"Ich überprüfe sie jede Woche", sagte Priya.

"Und wenn etwas Ungewöhnliches auftauchte, wie würden wir es wissen?"

"Das", sagte Priya, schloss ihren Laptop, "ist das nächste Gespräch."

Im nächsten Kapitel: Die drei Verteidigungsebenen, die Nimbus dem Internet abwehren.
