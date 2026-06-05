# Kapitel 33: Es hängt

Atmet einen letzten Atemzug, bevor du dieses Kapitel liest.

Du hast das Ende des Buches erreicht. Dies ist sowohl eine Schlussfolgerung als auch ein Anfang – das letzte Kapitel und der erste Tag, an dem du architektonische Entscheidungen auf eigene Faust treffen wirst.

Dieses Kapitel hat nur eine Aufgabe: Dir ehrlich zu sagen, was niemand dir klar genug mitteilt.

**Die Frage**

Am Ende fast jeder Architekturdiskussion stellt jemand schließlich die Frage: "Was ist die richtige Antwort?"

Und die nützlichste, frustrierendste, ehrlichste und am wenigsten verstandene Antwort in der gesamten Softwareentwicklung ist:

**Es hängt.**

Nicht, weil die Frage unbeantwortbar ist. Nicht, weil der Experte ausweichend ist. Aber weil die richtige Antwort tatsächlich von Kontext abhängt, der nicht in der Frage enthalten ist.

Dieses Kapitel ist darum da, um zu lernen, wie man "Es hängt" richtig sagt – was bedeutet, dass du in der Lage sein musst, den Satz zu vervollständigen.

Denke an einen Arzt, der nach der Frage gefragt wird: "Ist eine Operation die richtige Behandlung?" Ein schlechter Arzt sagt Ja oder Nein, ohne den Patienten zu untersuchen. Ein guter Arzt sagt: "Es hängt – von der Diagnose, dem Alter des Patienten, seinen anderen Erkrankungen und dem, was passieren würde, wenn wir warten." Die Antwort ist keine Ausweichmanöver. Es ist Präzision. "Es hängt" gefolgt von einem vollständigen Satz ist das Nützlichste, was ein Arzt – oder ein Architekt – sagen kann.

**Das Ende von Nimbus**

Zwei Jahre nach Beginn. Maya stand in einem Konferenzraum in Seattle und präsentierte sich einer Gruppe von Venture-Capital-Investoren.

Nimbus hatte sich entwickelt: 947 Restaurantpartner, 18.000 Bestellungen täglich, 2,1 Millionen US-Dollar monatliches GMV, drei Städte live, zwei weitere in der Einführung. Ein Team von vierzehn Ingenieuren über zwei Zeitzonen.

Die Investoren hatten Fragen. Einer von ihnen – ein technischer Partner des Fonds – trat vor.

"Welke Datenbank verwenden Sie?" fragte er.

Maya zögerte nicht.

"Für Bestellungen und Kundendaten: Aurora PostgreSQL. Für den Menükatalog: DynamoDB. Für Session Management und Caching: ElastiCache Redis. Für Analysen: Athena auf Basis von S3 Parquet-Dateien, mit Redshift für Abfragen mit hoher Frequenz."

Er nickte. "Warum Aurora für Bestellungen und nicht DynamoDB?"

"Da Bestellungen eine komplexe relationale Struktur haben – sie verweisen auf Menüpunkte, Kundenkonten, Restaurantadressen, Zahlungsmethoden. Wir benötigen Transaktionskonsistenz über mehrere Entitäten hinweg. Eine relationale Datenbank ist das richtige Werkzeug dafür. DynamoDBs Stärke ist der Hochdurchsatz-Key-Value-Zugriff mit flexibler Schema, was genau das Muster des Menükatalogs ist."

Er schrieb etwas auf. "Was ist mit der Skalierung? Sie sagten 18.000 Bestellungen täglich. Das sind etwa 12 pro Minute durchschnittlich. Wie haben Sie für Spitzenzeiten geplant?"

"Der Freitagabend-Rush beträgt etwa 25-mal der Durchschnitt. Wir skalieren horizontal mit ECS und Aurora Serverless v2, die Spitzenlasten automatisch verarbeitet. CloudFront absorbiert die Last von statischen Inhalten. Die API ist zustandslos, sodass die horizontale Skalierung sauber ist."

"Und wenn Aurora Serverless v2 nicht schnell genug skaliert?"

"Wir haben Lasttest-Ergebnisse. Die Zeit bis zur Skalierung für Aurora Serverless v2 beträgt weniger als 10 Sekunden. Unser durchschnittlicher Freitag-Spike-Ramp dauert 8 Minuten von der Basislinie aus. Wir sind mit dem Spielraum zufrieden."

Der technische Partner blickte die anderen Investoren an. "Sie kennt ihr System."

**Die Vier Fragen unter "Es hängt"**

Jede architektonische Abweichung reduziert sich auf vier grundlegende Fragen. Nicht jede Frage ist für jede Entscheidung gleich wichtig, aber alle vier sind immer im Spiel.

**1. Was ist das Zugriffs-Muster?**

Wie wird die Daten geschrieben und gelesen? Mit welcher Häufigkeit? Von wie vielen gleichzeitigen Benutzern? In welcher Reihenfolge? Nach welchen Schlüsseln?

Diese Frage bestimmt die Technologieauswahl auf der grundlegendsten Ebene. DynamoDB vs Aurora vs Redshift vs Athena – die richtige Antwort hängt fast ausschließlich vom Zugriffs-Muster ab.

**2. Was ist die Skalierung?**

Nicht nur jetzt – in 12 Monaten, in 5 Jahren. Skalierung ändert die richtige Antwort. Was funktioniert bei 100 Anfragen pro Tag, bricht bei 100 Millionen. Was ist Overkill bei 10 Benutzern, ist notwendig bei 10.000.

Und Skalierung ist nicht nur Traffic. Es ist Teamgröße (Architektur muss von dem Team gewartet werden, das Sie haben). Es ist Datenvolumen. Es ist geografischer Umfang.

**3. Was ist die Ausfallfolge?**

Was passiert, wenn das fehlschlägt? Sehen Benutzer eine langsame Seite? Schlägt eine Bestellung fehl? Werden Gelder falsch bewegt? Werden medizinische Aufzeichnungen unzugänglich gemacht?

Die Folge bestimmt, wie viel wir in Zuverlässigkeit investieren. Eine langsame Menüseite rechtfertigt eventuale Konsistenz. Ein fehlgeschlagener Zahlungsvorgang rechtfertigt synchrone Schreibvorgänge und explizite Bestätigungen.

**4. Was ist die Kostenbeschränkung?**

Nicht nur Geld – auch betriebliche Komplexität (die wiederum eine Form der Kosten ist). Eine Lösung, die drei zusätzliche Dienste erfordert, ist technisch gesehen besser als eine einfachere, aber zu teuer, um sie von einem Vier-Personen-Team gewartet zu werden.

**"Es hängt": Wie man den Satz vervollständigt**

Die richtige Art, "Es hängt" zu sagen, ist, ihn sofort zu vervollständigen:

*"Sollten wir DynamoDB oder Aurora verwenden?"*

"Es hängt vom Zugriffs-Muster ab. Wenn Sie einen Hochdurchsatz-Key-Value-Lookup mit flexibler Schema benötigen, DynamoDB. Wenn Sie eine transaktionale Konsistenz über verwandte Entitäten mit komplexen Abfragen benötigen, Aurora."

"Es hängt von den Arbeitslastmerkmalen ab. Lambda für ereignisgesteuerte, kurze Dauer, variable Arbeitslasten, wo keine Leerlaufkosten anfallen. EC2 oder ECS für persistente, zustandsbehaftete oder langlaufende Prozesse, wo eine vorhersehbare Leistung wichtiger ist als Leerlaufkosten."

*"Sollten wir Multi-AZ oder Multi-Region verwenden?"*

"Es hängt von Ihren RTO/RPO-Anforderungen und Ihrem Bedrohungsmodell ab. Multi-AZ schützt vor AZ-Ausfällen (dem häufigsten AWS-Ausfallmodus) und bietet eine RPO von ~0 und eine RTO von ~60 Sekunden für RDS. Multi-Region schützt vor regionalen Ausfällen (selten) und bedient global verteilte Benutzer. Wenn Sie eine Ausfallwiederherstellung innerhalb von Unterminuten aus einem regionalen Katastrophenfall benötigen, Multi-Region. Wenn AZ-Resilienz ausreichend ist, ist Multi-AZ viel einfacher und günstiger."

"Es hängt" ist nicht das Ende der Antwort. Es ist der Beginn der eigentlichen Antwort.

**Die Muster, die sich nicht ändern**

Während sich spezifische Technologieentscheidungen weiterentwickeln – neue Dienste werden eingeführt, die Preisgestaltung ändert sich, bessere Alternativen entstehen – haben sich einige zugrunde liegende Muster über Jahrzehnte hinweg stabil gehalten:

**Trennung der Verantwortlichkeiten**: Komponenten, die unterschiedliche Dinge tun, sollten unabhängig voneinander sein. Eine Änderung in einer sollte keine Änderung in einer anderen erfordern. Deshalb entkoppeln wir mit SQS, nicht durch direkte Aufrufe. Warum wir S3 für Objekte verwenden, nicht Datenbanken. Warum die Web-Tier und die Datenbank-Tier getrennt sind.

**Verteidigung in der Tiefe**: Keine einzelne Sicherheitskontrolle ist ausreichend. Sie haben IAM, Sicherheitsgruppen, NACLs, WAF, GuardDuty, Secrets Manager, KMS. Wenn eine Schicht ausfällt, fängt die nächste sie ab.

**Zahlen Sie nur für das, was Sie verwenden, wenn Sie es verwenden**: Das grundlegende wirtschaftliche Prinzip der Cloud. Lambda skaliert auf Null. Spot-Instanzen nutzen ungenutzte Kapazität. S3-Lebenszyklusrichtlinien verschieben kalte Daten in kostengünstigere Speicher. DynamoDB on-demand berechnet pro Anfrage. Die Muster sind anders; das Prinzip ist dasselbe.

**Optimieren Sie für den wahrscheinlichsten Ausfall**: Multi-AZ zuerst (AZ-Ausfälle passieren). Transregionale DR zweitens (regionale Ausfälle sind seltener). Redundanz innerhalb der AZ (mehrere Instanzen) vor der Komplexität der Transregionen. Bauen Sie für den realistischen Ausfall, nicht für den katastrophalen, aber unwahrscheinlichen.

**Messen Sie, bevor Sie optimieren**: Tom's Ansatz – ziehen Sie die CloudWatch-Metriken ab, verstehen Sie das tatsächliche Muster und treffen Sie dann Entscheidungen – ist wertvoller als eine vorzeitige Optimierung auf der Grundlage von Annahmen.

**Was dieses Buch Ihnen nicht beibringen kann**

Seien wir direkt ehrlich über die Grenzen.

Dieses Buch hat Ihnen beigebracht:

- Was jeder wichtige AWS-Dienst tut
- Die Analogien, die sie intuitiv machen
- Die Kompromisse zwischen Alternativen
- Das Wissen, das Sie für die SAA-C03-Prüfung benötigen
- Einen Rahmen für das Denken über architektonische Entscheidungen

Dieses Buch kann Ihnen nicht beibringen:

- **Produktionsinstinkt**: Das Bauchgefühl, dass "das wird unter Last verrückt werden", bevor Sie es sehen. Das kommt aus dem Betrieb von echten Systemen.
- **Technische Urteilsfähigkeit unter Druck**: Entscheiden Sie, was Sie um 3 Uhr morgens tun sollen, wenn das System ausgefallen ist und Sie unvollständige Informationen haben. Das kommt aus Vorfällen.
- **Stakeholder-Intuition**: Zu wissen, wann Sie sich gegen eine Geschäftsanforderung wehren sollten, weil die technische Kosten zu hoch sind. Das kommt aus Erfahrungen auf beiden Seiten – der technischen und der Geschäftsseite.
- **Die richtige Frage für den jeweiligen Kontext**: Carlos konnte die richtigen Fragen stellen, weil er ähnliche Probleme dutzende Male gesehen hatte. Dieses Wissen wird erarbeitet, nicht gelesen.

Sie sind noch nicht fertig, zu lernen. Sie haben gerade erst angefangen.

**Die Prüfung ist nicht das Ziel**

Sie haben dieses Buch, um sich auf die AWS Solutions Architect Associate-Prüfung vorzubereiten. Das ist in Ordnung. Die SAA-C03-Zertifizierung ist echt, wird geschätzt und öffnet Türen.

Aber die Prüfung testet Wissen und Mustererkennung. Sie testet keine Urteilsfähigkeit. Sie testet keine betriebliche Erfahrung. Sie testet nicht, was Sie tun, wenn die Architektur, die Sie entworfen haben, um 11 Uhr am Freitagabend stillsteht.

Die Zertifizierung ist ein Anfangsqualifikationsnachweis. Wenn Sie die Prüfung bestehen, wissen Sie, wie AWS-Dienste funktionieren und wie sie kombiniert werden. Sie haben keinen Rahmen dafür, aber Sie werden ihn haben.

Der nächste Schritt nach der Prüfung: Bauen Sie etwas Echtes. Stellen Sie es bereit. Betreiben Sie es. Lassen Sie es versagen. Beheben Sie es. Verbrauchen Sie das Geld in einem Dienst und verschieben Sie die Kosten an einen anderen Ort. Lassen Sie Sie mitten in der Nacht von einem Kollegen anrufen und eine Entscheidung mit unzureichenden Informationen treffen.

Das ist, wie sich das Wissen in diesem Buch zu Urteilsvermögen entwickelt.

**Mayas Endgültige Antwort**

Am Ende des Investorentmeetings hatte der technische Partner noch eine Frage.

„Wenn Sie alles von Grund auf neu beginnen würden, wissend, was Sie jetzt wissen, was würden Sie anders machen?“

Maya machte eine Pause.

„Ich würde von Anfang an Infrastructure as Code verwenden“, sagte sie. „Leo hat die erste EC2-Instanz manuell bereitgestellt. Wir haben sechs Monate lang alles zu Terraform migriert. Das waren sechs Monate technische Schulden, die uns Zeit gekostet haben.“

„Was noch?“

„Ich wäre bei Managed Services am Anfang konservativer. Wir haben DynamoDB verwendet, obwohl eine einfache RDS-Datenbank für Monate hätte ausgereicht. Das DynamoDB-Zugriffsmuster erforderte eine Erfahrung, die wir noch nicht hatten. Wir haben das Schema zweimal überarbeitet.“

"Also ist es einfacher, am Anfang besser?"

"Einfacher ist immer besser." Die Frage ist immer: Was ist das einfachste, was das eigentliche Problem löst, und nicht das erwartete zukünftige Problem? Wir haben Komplexität hinzugefügt, um Probleme zu lösen, die wir noch nicht hatten. Einige dieser Komplexität verursachten ihre eigenen Probleme.

Der technische Partner hat das notiert.

"Letzte Frage", sagte er. "Was ist das Wichtigste, das Sie über den Aufbau auf AWS wissen, das Sie am Anfang nicht wussten?"

Maya dachte an die zwei Jahre. Die Vorfälle. Die Kostenüberprüfungen. Die Well-Architected-Überprüfung. Die Architekturentscheidungen unter Druck und die sorgfältig getroffenen Entscheidungen. Die, die sie richtig getroffen hatten, und die, die sie wiederholen mussten.

"Dass der Cloud-Dienst nicht Architekturprobleme löst", sagte sie. "Er verstärkt sie. Eine schlechte Entscheidung vor Ort kann dich eine Woche kosten. Eine schlechte Entscheidung in der Cloud kann dich monatlich, im großen Maßstab, kosten, bis jemand es bemerkt."

Sie machte eine Pause.

"Der Cloud-Dienst skaliert gute Entscheidungen. Und schlechte Entscheidungen auch."

**Schlussfolgerung**

Sie haben sehr viel gelernt. Die AWS-Dienste. Die Kompromisse. Die Muster.

Machen Sie jetzt etwas damit.

Bauen Sie etwas. Machen Sie Fehler absichtlich. Lesen Sie Post-Mortems (sie sind öffentlich – AWS, Cloudflare, GitHub, Stripe veröffentlichen sie alle). Arbeiten Sie mit Teams zusammen, die besser sind als Sie in den Dingen, an denen Sie schwach sind.

Die Prüfung SAA-C03 wird testen, ob Sie den Stoff beherrschen. Ihre Karriere wird testen, ob Sie ihn anwenden können.

Beide sind es wert, es zu tun. Keine davon ist das endgültige Ziel.

Es gibt kein endgültiges Ziel in diesem Bereich. Es gibt nur das nächste Problem, die nächste Entscheidung und die Gewohnheit, die richtige nächste Frage zu stellen.

Viel Glück.

Im nächsten Kapitel: Was ändert sich, wenn die Aufgabe nicht mehr darin besteht, das System zu bauen – sondern es zu verwalten.

## Zusammenfassung

- **"Es kommt darauf an" ist der Anfang der Antwort**, nicht das Ende. Ergänzen Sie den Satz immer mit den Bedingungen, auf die sich dies bezieht.
- Die vier Fragen unter jedem Architektur-Kompromiss: Zugriffsmuster, Skalierbarkeit, Ausfallfolge, Kostenbeschränkung.
- Die Muster, die Bestand haben: Trennung von Belangen, Verteidigung in der Tiefe, zahlen Sie für das, was Sie verwenden, optimieren Sie für den wahrscheinlichen Ausfall, messen Sie, bevor Sie optimieren.
- **Der Cloud-Dienst verstärkt Entscheidungen** – gute und schlechte. Eine schlechte Entscheidung vor Ort kostet eine Woche; eine schlechte Entscheidung in der Cloud verstärkt sich monatlich, im großen Maßstab.
- Die SAA-C03-Zertifizierung testet Wissen und Mustererkennung. Produktionserfahrung verwandelt dieses Wissen in Urteilskraft.

## Prüftipps

*SAA-C03 Domain: Cross-domain – alle Bereiche*

Dieses Kapitel schließt den Prüfungsinhalt dieses Buches. Bevor Sie die Prüfung ablegen:

**Überprüfen Sie die Dienste, die Sie am wenigsten beherrschen**:

- Für die meisten Leute: Kinesis vs SQS (der Stream vs die Warteschlange)
- VPC-Netzwerke (Routing-Tabellen, Subnetze, NAT Gateway, Internet Gateway)
- IAM-Richtlinienbewertung (explizite Ablehnung > explizite Erlaubnis > implizite Ablehnung)
- Speicherklassenauswahl (kennen Sie alle sechs S3-Speicherklassen und deren Kompromisse)
- RDS vs Aurora vs DynamoDB für bestimmte Anwendungsfälle

**Kennen Sie die typische Struktur der Szenarien der Prüfung**:

Die SAA-C03 präsentiert eine Geschäftsanforderung ("Das Unternehmen benötigt eine Verfügbarkeit von 99,99 %") und bittet Sie, die Architektur zu identifizieren, die diese erfüllt. Lesen Sie immer die Anforderung, identifizieren Sie die wichtigsten Einschränkungen und eliminieren Sie Optionen, die diese nicht erfüllen.

**Üben Sie die Identifizierung von Ablenkungen**:

Jine falsche Antwort auf der Prüfung ist falsch aus einem bestimmten Grund. Das Erlernen, *warum* jede falsche Antwort falsch ist, ist wertvoller als das Auswendiglernen der richtigen Antworten.

**Die Prüfung belohnt Mustererkennung**:

- "Entkoppeln" → SQS/SNS
- "Serverless" → Lambda, DynamoDB, Aurora Serverless
- "Globale niedrige Latenz" → CloudFront, Global Accelerator, Global DynamoDB, Aurora Global
- "Compliance/Auditing" → CloudTrail, Config, Security Hub, Macie
- "Kostenoptimierung" → Spot Instances, Savings Plans, Lebenszyklusrichtlinien, richtige Größenanpassung

**Sie sind bereit**. Nicht, weil dieses Buch alles abgedeckt hat – nichts tut das. Aber weil Sie die Prinzipien so gut verstehen, dass Sie auch dann einen Weg zum richtigen Antwort finden können, wenn Sie die genaue Situation nicht sofort erkennen.

## Übungen

**Abschließende Übung**

Nach diesem Kapitel gibt es keine weiteren strukturierten Prüfungsfragen.

Stattdessen: eine offene Frage.

Welches System würden Sie heute bauen, wissend, was Sie wissen?

Schreiben Sie es auf. Skizzieren Sie die Architektur. Identifizieren Sie die Dienste. Notieren Sie sich die Kompromisse, die Sie treffen würden, und warum. Antizipieren Sie Ausfallmoden.

Dann bauen Sie es.

Das ist die Aufgabe. Es gibt keinen Frist. Es gibt keine Bewertung. Es gibt nur die Arbeit.

## Post-Credits-Szene

Die Investition wurde genehmigt.

Serie A. 5 Millionen Dollar. Genug, um sich auf fünf neue Städte auszuweiten, das Engineering-Team um das Dreifache zu vergrößern und Nimbus Instant aufzubauen.

Am Abend war Maya in ihrem Familienrestaurant. Das ursprüngliche Restaurant. Das, in dem Nimbus begann, als sie bemerkte, dass sie Bestellungen verpassten, weil das Telefon immer besetzt war.

Sie bestellte ein Arepa – dasselbe Gericht, das sie immer bestellte.

Während sie wartete, öffnete sie ihren Laptop und las das erste Kapitel dieses Buches.

*"Wo wohnt eine Website?"*

Sie erinnerte sich, die Antwort nicht zu kennen.

Sie lächelte.

Sie schloss den Laptop.

Das Essen kam.

Es war perfekt.

*Vielen Dank für das Lesen.*

*Die AWS Solutions Architect Associate Prüfung (SAA-C03) ist bei Pearson VUE Testzentren und online über ihr Remote-Testsystem verfügbar. Bitte registrieren Sie sich unter aws.amazon.com/certification.*

*Die Geschichte von Nimbus ist fiktiv. Die AWS-Dienste, Preismodelle und Best Practices, die in diesem Buch beschrieben werden, sind real. Diese können sich jedoch ändern – AWS aktualisiert seine Dienste häufig. Überprüfen Sie immer die aktuellen Preise und die Fähigkeiten der Dienste auf aws.amazon.com.*

*Viel Glück.*
