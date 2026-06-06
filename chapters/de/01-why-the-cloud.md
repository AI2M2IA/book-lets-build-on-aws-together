# Kapitel 1: Warum mieten, wenn man kaufen könnte?

Das Notizbuch lag aufgeschlagen auf dem Tisch, und Tom hatte dieselbe Zeile dreimal durchgestrichen.

Er war bis spät auf gewesen. Die Frage ließ ihn nicht los. Gegen Mitternacht hatte er sie vollständig aufgeschrieben, dann unterstrichen, dann einen Kasten darum gezeichnet und sie dann durchgestrichen, weil das Aufschreiben sie nicht klarer gemacht hatte. Er hatte sie erneut an den Rand geschrieben.

Als Leo und Priya am nächsten Morgen ankamen — Kaffee in der Hand, über etwas Unzusammenhängendes streitend —, stand Tom bereits am Whiteboard. Die dritte Option war noch da, unberührt. Eine Wolkenform, gezeichnet von jemandem, der zugegeben hatte, nicht zu wissen, was sie bedeutete.

Das Bestellproblem des Restaurants hatte etwas Reales kristallisiert. Maya hatte die Cloud zum Weg nach vorn erklärt. Diese Entscheidung war gefallen. Was blieb, war die Frage, die Tom nicht losließ und am Rand seines Notizbuchs saß: Wenn Mieten die Antwort war, warum war es günstiger als Besitzen?

"Ich brauche jemanden, der mir etwas erklärt", sagte Tom, ohne sich umzudrehen. "Wenn wir Computer von Amazon mieten statt eigene zu kaufen — warum wäre das *günstiger*?"

Der Raum verstummte. Es war die Art von Frage, die einfach klingt und es nicht ist.

"Weil", begann Leo.

"Nein", sagte Tom. "Ich möchte es verstehen. Nicht einfach die Antwort hören. Warum ist Mieten günstiger als Besitzen?"

Leo setzte sich. Er stellte seinen Kaffee auf den Tisch. Er dachte tatsächlich darüber nach.

"Weil", sagte er erneut, diesmal vorsichtiger, "wir für den schlimmsten Fall kaufen würden. Den größten Freitagabend, den viralen Moment, das Launch-Event. Aber die meiste Zeit ist es nicht so beschäftigt."

"Richtig", sagte Tom. "Mach weiter."

"Wir würden also für Kapazität zahlen, die wir nicht nutzen. Jeden ruhigen Dienstag. Jeden Montagmorgen. Wir hätten einen Server, der dasteht, Strom verbraucht und fast nichts tut."

"Und wenn wir stattdessen mieten?"

"Wir zahlen für das, was wir nutzen", sagte Leo. "Wenn es ruhig ist, zahlen wir fast nichts. Wenn es beschäftigt ist, zahlen wir mehr. Aber wir zahlen nie für Kapazität, die nur herumsteht."

Tom sah zufrieden aus. Nicht weil die Antwort neu für ihn war — er hatte sie am Abend zuvor herausgearbeitet. Sondern weil das laute Aussprechen sie real machte. Er nahm sein Notizbuch und strich die Frage ein letztes Mal durch.

Das war das Fundament. Alles andere in diesem Kapitel baut darauf auf.

**Das offensichtliche Problem mit dem Besitz von Servern**

Stellen Sie sich vor, Sie beschließen, ein Restaurant zu eröffnen. Nicht das Nimbus-Restaurant — ein normales Restaurant.

Bevor Ihr erster Gast hereinkommt, brauchen Sie Tische. Stühle. Eine Küche. Einen Herd. Teller. Personal. All das brauchen Sie am ersten Tag, auch wenn Ihre erste Woche langsam ist, auch wenn Sie drei Monate lang sechs Gäste pro Tag haben, bevor sich das Wort verbreitet.

Physische Server funktionieren genauso.

Wenn Nimbus eigene Server kauft, müssen sie diese für den Peak kaufen, den sie erwarten. Den geschäftigsten Freitagabend, den sie sich vorstellen können. Den viralen Moment, in dem ein Food-Blogger über die Arepa schreibt und zehntausend Menschen gleichzeitig bestellen wollen.

Aber die meiste Zeit ist es nicht so beschäftigt. Die meiste Zeit stehen diese Server da, verbrauchen Strom und tun fast nichts.

"Wir würden für Kapazität zahlen, die wir nicht nutzen", sagte Maya.

"Genau", sagte Tom, was alle überraschte, weil er derjenige war, der die Frage gestellt hatte.

**Die wahren Kosten von Hardware: Toms Tabelle**

Tom hatte ein ordentliches Kostenmodell aufgebaut, als sich das Team traf. Er führte sie durch.

Er hatte tatsächlich echte Hardware bepreist. Ein Dell PowerEdge R550 — ein Server der Mittelklasse, der mehrere hundert gleichzeitige Nutzer bewältigen kann — kostete etwa 8.000 Dollar, konfiguriert mit genügend RAM und Speicher für eine produktive Webanwendung. Das ist ein Server. Für Redundanz (damit ein Ausfall nicht das ganze System lahmlegt) bräuchte man mindestens zwei. Sechzehntausend Dollar, bevor man begonnen hat.

Die 2.000-Dollar-Schätzung vom Whiteboard war optimistisch. Produktionshardware kostete mehr. Man brauchte genügend Speicher, damit die Anwendung und die Datenbank gleichzeitig laufen konnten. Man brauchte RAID für Speicherredundanz. Man brauchte eine Netzwerkkarte, die schnell genug war, um echten Traffic zu bewältigen. Wenn man einen echten Produktionsserver konfiguriert hatte, war die 8.000-Dollar-Zahl keine Übertreibung.

"Zwei Server: 16.000 Dollar", sagte Tom und schrieb es auf.

Dann die laufenden Kosten. Strom: Ein Server, der rund um die Uhr bei 400 Watt läuft, verbrauchte etwa 3.500 Kilowattstunden pro Jahr. Bei 0,12 Dollar pro kWh waren das ungefähr 420 Dollar pro Jahr, pro Server. Mal zwei: 840 Dollar pro Jahr allein für Strom.

Dann das Internet. Eine Geschäftsverbindung, die schnell genug war, um echten Traffic zu bewältigen — nicht das private WLAN, das das Restaurant derzeit nutzte, sondern eine geschäftstaugliche symmetrische Glasfaserverbindung mit einem Service Level Agreement —, kostete 200 bis 400 Dollar im Monat. Das waren 2.400 bis 4.800 Dollar pro Jahr.

Dann der Hardware-Lebenszyklus. Server hielten drei bis fünf Jahre, bevor sie zu langsam oder zu unzuverlässig wurden, um eine produktive Last zu betreiben. Nach Jahr vier liefen Sie auf Hardware, die nicht mehr gegen bestimmte Sicherheitslücken gepatcht werden konnte und die Ihr Server-Anbieter nicht mehr unterstützte. Also schrieben Sie die Vorabkosten ab: 16.000 Dollar über vier Jahre waren 4.000 Dollar pro Jahr an Kapitalabschreibung.

Dann die Kosten, die niemand aufschrieb: eine USV (unterbrechungsfreie Stromversorgung) als Batteriepufferung, um kurze Stromausfälle zu überstehen, etwa 400 Dollar. Ein verwalteter Netzwerk-Switch, 300 Dollar. Eine Firewall-Appliance mit ordentlichen Sicherheitsfunktionen, 500 bis 2.000 Dollar. Ersatzfestplatten im Regal für den unvermeidlichen Ausfall, 200 Dollar. Kühlung — wenn die Server im Hinterbüro des Restaurants standen, musste jemand die von ihnen erzeugte Wärme berücksichtigen, was entweder einen eigenen Klimaanlagenkreislauf oder eine überraschende Stromrechnung bedeutete.

Rechnen Sie alles zusammen: irgendwo zwischen 8.000 und 12.000 Dollar pro Jahr an Kapitalabschreibung und laufenden Kosten, bevor Sie jemanden dafür bezahlten, die Hardware zu warten, zu konfigurieren oder zu reparieren. Und "Wartung" war nicht nur ein Posten — es war eine Voraussetzung an Fachwissen. Sie stellten entweder jemanden ein, der wusste, wie man Server betreibt, oder Sie waren die Person, die sie um 2 Uhr nachts betrieb, wenn etwas schiefging.

"Und wenn er kaputtgeht", sagte Tom, "wissen wir nicht, wie wir ihn reparieren. Wir würden jemanden zu Notfallpreisen bezahlen. Und während wir auf ihn warten, ist das Restaurant dunkel."

"Vergleicht das mit AWS", sagte Tom. Er rief die EC2-Preisseite auf. Eine `t3.medium`-Instanz — genug Rechenleistung für die Anfangslast von Nimbus — kostete etwa 30 Dollar pro Monat. Zwei davon, für Redundanz, waren 60 Dollar im Monat oder 720 Dollar pro Jahr.

Viertausend Dollar pro Jahr an Abschreibung gegenüber 720 Dollar. Der Unterschied war nicht knapp. Selbst wenn man Netzwerke, Datenübertragung und einen verwalteten Datenbankdienst auf AWS hinzufügte, war die Cloud-Rechnung für eine Startup-Last ein Bruchteil der Kosten physischer Hardware.

"Aber", sagte Tom, denn Tom hatte immer ein Aber, "wir sollten ehrlich sein, ab wann es aufhört, so eindeutig zu sein."

Er hatte recht. Bei enormem Maßstab — Tausende von Servern, konstante Auslastung — verschieben sich die wirtschaftlichen Verhältnisse. Ein Unternehmen, das 5.000 Server bei 90 % Auslastung rund um die Uhr betreibt, könnte feststellen, dass das Besitzen von Hardware bei diesen Volumen pro Einheit günstiger ist als das Mieten. Große Unternehmen erreichen diesen Punkt manchmal. Startups fast nie. Für ein Startup mit unvorhersehbarem Wachstum, ohne Hardware-Know-how und mit ungewissem Maßstab war die Cloud-Rechnung offensichtlich.

**Das Mietmodell**

Hier liegt der Unterschied von Cloud-Computing.

Wenn Sie AWS nutzen, kaufen Sie keine Server. Sie mieten Rechenleistung und zahlen nur für das, was Sie nutzen. Es ähnelt eher dem Mieten eines Veranstaltungsortes als dem Besitz eines Restaurantgebäudes.

Stellen Sie es sich so vor.

Wenn Sie eine Geburtstagsparty für fünfzig Personen veranstalten möchten, könnten Sie ein Haus kaufen, das groß genug für fünfzig Personen mit Tischen und Stühlen ist. Oder Sie mieten einen Veranstaltungsort für vier Stunden an einem Samstag, zahlen genau für den Raum und die Zeit, die Sie brauchen, und geben den Schlüssel zurück, wenn die Party vorbei ist.

Der Veranstaltungsort ist immer noch da, wenn Sie ihn brauchen. Er ist wieder verfügbar, wenn etwas anderes aufkommt. Sie mussten keinen Gebäudeverwalter einstellen. Sie haben das ganze Jahr keine Grundsteuer dafür gezahlt.

Aber hier ist der Teil, den die Analogie nicht vollständig erfasst: Bei AWS kann der "Veranstaltungsort" wachsen oder schrumpfen, um zu Ihrer Party zu passen. Wenn fünfzig Personen erschienen und dann unerwartet zweihundert weitere ankamen, würde sich der Veranstaltungsort erweitern, um sie aufzunehmen. Wenn die Party früh endete, würde sich der Veranstaltungsort zusammenziehen, und Sie würden sofort aufhören, für den zusätzlichen Raum zu zahlen.

Keine Veranstaltungsortvermietung funktioniert so. Cloud-Computing schon.

Das ist das Cloud-Modell. AWS hat die "Veranstaltungsorte". Sie tauchen auf, wenn Sie sie brauchen.

Es gibt eine zweite Analogie, die einen anderen Teil des Bildes erfasst.

Stellen Sie sich vor, Sie sind ein Startup, das professionelle Fotografie braucht. Sie könnten einen Vollzeitfotografen einstellen — Gehalt, Ausrüstung, Sozialleistungen, Büroraum, das ganze Paket. Oder Sie könnten einen Fotografen stundenweise einstellen, wenn Sie einen brauchen, für die geleistete Arbeit zahlen und ihn gehen lassen, wenn das Shooting vorbei ist.

Der On-Demand-Fotograf kostet pro Stunde mehr als ein angestellter. Aber wenn Sie nicht jede Stunde jedes Tages Fotografie brauchen, ist das On-Demand-Modell insgesamt dramatisch günstiger. Und Sie können für verschiedene Aufgaben einen anderen Spezialisten einstellen — einen Porträtfotografen für Bewerbungsfotos, einen Produktfotografen für Katalogaufnahmen —, ohne für beide Personal vorhalten zu müssen.

Cloud-Computing hat dieselbe Ökonomie der Spezialisierung. AWS unterhält Teams von Spezialisten für jede Ebene der Infrastruktur: Netzwerkingenieure, Datenbankadministratoren, Sicherheitsforscher, Hardware-Beschaffungsexperten. Sie greifen stundenweise auf das Ergebnis ihres Fachwissens zu — eine zuverlässige Datenbank, ein sicheres Netzwerk, einen gut konfigurierten Server —, ohne einen dieser Spezialisten selbst einzustellen.

Sie fragen sich vielleicht: Wenn das stundenweise Mieten pro Einheit teurer ist als der direkte Kauf, wie funktioniert dann die Wirtschaftlichkeit? Die Antwort ist Auslastung. Ein physischer Server, den Sie besitzen, liegt an ruhigen Dienstagen bei 9 % CPU. Ein Cloud-Server, den Sie für die Stunden mieten, die Sie tatsächlich brauchen, läuft mit der Auslastung, die die Last verlangt, und Sie hören auf zu zahlen, wenn die Last aufhört. Die Summe, die Sie für die tatsächlich genutzten Stunden zahlen, ist geringer als die Summe, die Sie für den Server zahlen würden, der untätig in der Ecke steht.

**Aber warten Sie — da steckt noch mehr dahinter**

"Okay", sagte Leo, "aber was, wenn mein Veranstaltungsort abbrennt?"

Guter Instinkt. Dunkel, aber gut.

Eine der stillen Annahmen beim Besitz eigener Server ist, dass *Sie* dafür verantwortlich sind, diese am Laufen zu halten. Wenn der Server in Ihrem Büro von einem unbeholfenen Praktikanten umgestoßen wird, ist Ihre Website down. Wenn das Gebäude den Strom verliert, ist Ihre Website down. Wenn die Festplatte ausfällt — und Festplatten fallen irgendwann immer aus —, ist Ihre Website down.

AWS betreibt Rechenzentren. Riesige, professionell verwaltete Einrichtungen mit Notstromversorgung, redundanten Netzwerkverbindungen, physischer Sicherheit und Teams von Ingenieuren, deren einzige Aufgabe es ist, diese Maschinen am Laufen zu halten. Sie haben redundante Netzteile. Sie haben Notstromgeneratoren. Sie haben redundante Netzwerkverbindungen von mehreren Anbietern. Sie haben physische Sicherheit, an die die meisten Bürogebäude nicht herankommen könnten.

Sie mieten nicht nur Rechenleistung. Sie mieten Zuverlässigkeit.

"Wie viel kostet das?" fragte Tom.

Dazu kommen wir. Die Preisgestaltung ist ein eigenes Kapitel, und sie verdient es.

**Drei Dinge, die die Cloud anders macht**

Machen wir das konkret. Hier sind die drei wesentlichen Unterschiede zwischen dem Betrieb eigener Server und der Nutzung eines Cloud-Anbieters.

**1. Sie zahlen für das, was Sie nutzen.**

Kein Server, der ungenutzt steht. Kein Vorabkauf. Wenn Nimbus an einem Montagmorgen null Bestellungen erhält, zahlen sie fast nichts. Wenn sie am Silvesterabend überwältigt werden, hat AWS automatisch die nötige Kapazität bereit.

Dieses Modell gleicht die Kosten dem Wert auf eine Weise an, die feste Infrastruktur nicht kann. Wenn Ihre Kosten Ihrem Umsatz folgen, wird die Finanzplanung einfacher.

Es gibt einen Begriff dafür in der Buchhaltung: der Wechsel von Investitionsausgaben zu Betriebsausgaben. CapEx ist ein Vorabkauf, den Sie über die Zeit abschreiben — wie der Kauf des Dell PowerEdge. OpEx ist eine laufende Ausgabe, die Sie nach Verbrauch zahlen — wie die AWS-Rechnung. Für ein Startup mit begrenztem Kapital und ungewissem Umsatz ist OpEx dramatisch vorzuziehen. Sie setzen nicht 16.000 Dollar auf eine Nachfrageprognose, deren Sie sich nicht sicher sein können.

"Jeder Dollar, den wir nicht für Hardware ausgeben", sagte Tom, "ist ein Dollar, den wir tatsächlich für den Aufbau des Produkts ausgeben können."

Das ist kein triviales Argument. Die Vorab-Hardwarekosten, die Tom berechnet hatte — 16.000 Dollar für zwei produktionstaugliche Server —, stellten die Art von Kapitalaufwand dar, die Investoren unangenehme Fragen stellen lässt und Gründer zwingt, harte Entscheidungen über die Liquiditätsreichweite zu treffen.

**2. Jemand anderes kümmert sich um die Hardware.**

AWS wartet die physischen Maschinen. Die Netzwerkkabel. Die Netzteile. Die Kühlsysteme. Nimbus stellt niemanden ein, der das erledigt. Sie konzentrieren sich auf ihre Anwendung, nicht auf die darunter liegende Infrastruktur.

Das ist es wert, innezuhalten. Das Fachwissen, das nötig ist, um die physische Rechenzentrumsinfrastruktur zu betreiben, ist real. Kühlsysteme, Energiemanagement, Hardware-Austauschpläne, Netzwerkredundanz — das sind eigenständige Disziplinen. Durch die Nutzung von AWS erhält Nimbus Zugang zu diesem Fachwissen, ohne dafür Personal einzustellen.

Ein Systemadministrator mit den Fähigkeiten, Produktionsserver ordnungsgemäß zu warten, verdient 80.000 bis 130.000 Dollar pro Jahr. Ein Team, das Hardware-Ausfälle, Sicherheit auf Betriebssystemebene, Netzwerkkonfiguration und Speicherverwaltung bewältigen kann, kostet mehr. Die Dienste von AWS kosten einen Bruchteil davon — und das operative Fachwissen ist im Dienst inbegriffen.

Das ist das Argument der Skaleneffekte, das AWS ausdrücklich macht. Weil AWS Infrastruktur für Tausende von Kunden gleichzeitig betreibt, werden die Stückkosten für die Aufrechterhaltung dieses Fachwissens auf alle verteilt. Jeder einzelne Kunde erhält Zugang zu erstklassigem Infrastrukturbetrieb für eine Rechnung, die einen kleinen Bruchteil dessen ausmacht, was dieser Betrieb kosten würde, wenn er ihn allein aufbauen würde.

**3. Sie können sofort hoch- und herunterskalieren.**

Das ist das, dessen Wert eine Weile braucht, um vollständig erfasst zu werden. Bei physischen Servern bedeutet Hochskalieren das Bestellen neuer Hardware, wochenlange Wartezeiten auf die Lieferung und das Aufstellen. Mit AWS bedeutet Hochskalieren das Klicken auf eine Schaltfläche (oder das automatische Erledigen durch das System). Und wenn Sie die zusätzliche Kapazität nicht mehr benötigen, skalieren Sie wieder herunter. Sie hören auf zu zahlen.

Der Teil mit dem "und herunter" wird unterschätzt. Herunterskalieren bei physischer Hardware bedeutet, dass Sie die Hardware immer noch besitzen, immer noch den Strom zahlen, das System immer noch warten. Sie haben nur mehr, als Sie brauchen. Mit der Cloud ist Herunterskalieren real — die Ressourcen verschwinden, und die Kosten verschwinden mit ihnen.

Leo beschrieb dies als "den Teil, der sich wie Schummeln anfühlt". Er hatte jahrelang an Systemen mit fester Kapazität herumgearbeitet — sorgfältig geschätzt, wie viel Server er brauchen würde, konservativ bereitgestellt, das Kapazitätsmessgerät beobachtet und manchmal in beide Richtungen falschgelegen. Die Vorstellung, dass er einen Server hinzufügen, ihn vier Stunden lang an einem Freitagabend nutzen und entfernen konnte — und nur für diese vier Stunden zahlen —, fühlte sich falsch an, so wie sich Dinge falsch anfühlen, die zu gut sind, um wahr zu sein.

Es war nicht zu gut, um wahr zu sein. Es war das Geschäftsmodell. AWS verdient Geld, wenn Sie ihre Infrastruktur nutzen. Sie haben jeden Anreiz, diese Nutzung so reibungslos wie möglich zu gestalten.

Priya war während dieser Erklärung still gewesen. Sie hatte eine Frage.

"Und was, wenn jemand versucht einzubrechen? Wessen Problem ist das?"

Und hier wird es interessant.

**Das Modell der geteilten Verantwortung**

Dies ist eines der wichtigsten Konzepte in ganz AWS. Es ist einfach, wenn man es versteht, aber es bringt viele Menschen ins Stolpern — auch in der Prüfung.

AWS und Sie teilen die Verantwortung für die Sicherheit. Aber jede Partei ist für verschiedene Dinge verantwortlich.

**AWS ist verantwortlich für die Sicherheit *der* Cloud.**

Die physischen Rechenzentren. Die Hardware. Die Netzwerkinfrastruktur. Die Hypervisoren, die die virtuellen Maschinen betreiben. Wenn jemand in ein AWS-Rechenzentrum einbricht, ist das Amazons Problem. Wenn eine physische Festplatte ausfällt und Daten beschädigt, ist das Amazons Problem. Wenn die Netzwerkinfrastruktur zwischen Availability Zones kompromittiert wird, ist das Amazons Problem.

**Sie sind verantwortlich für die Sicherheit *in* der Cloud.**

Ihre Daten. Ihre Anwendung. Ihre Benutzerkonten und wer Zugang zu was hat. Die von Ihnen gewählten Konfigurationen. Wenn jemand Ihr Passwort stiehlt und sich in Ihr AWS-Konto einloggt, ist das Ihr Problem. Wenn Sie eine Datenbank so falsch konfigurieren, dass sie öffentlich zugänglich ist, ist das Ihr Problem. Wenn Ihre Anwendung eine Schwachstelle hat, die SQL-Injection erlaubt, ist das Ihr Problem.

Priya nickte langsam. "Sie schützen also das Gebäude. Wir schützen das, was darin ist."

"Genau", sagte Maya.

"Wenn Leo also einen Port öffnet, den er nicht sollte..."

"Immer noch unser Problem", bestätigte Maya und schaute Leo an.

Leo tippte bereits etwas auf seinem Laptop und tat so, als würde er nicht zuhören.

Sie fragen sich vielleicht: Bedeutet das, dass AWS jemals für eine Datenpanne verantwortlich ist? Nur wenn die Panne auf der physischen oder Infrastrukturebene geschieht — ein kompromittiertes Rechenzentrum, ein Hardware-Ausfall, eine Schwachstelle im Hypervisor selbst. Pannen, die durch falsch konfigurierte Anwendungen, schwache Passwörter oder schlecht eingestellte Zugriffskontrollen verursacht werden, liegen immer in der Verantwortung des Kunden, unabhängig davon, wie groß oder renommiert der Cloud-Anbieter ist.

**Die Flughafen-Analogie**

Hier ist eine zweite Möglichkeit, über das Modell der geteilten Verantwortung nachzudenken, denn es kommt in der Prüfung oft genug vor, dass es zwei Blickwinkel wert ist.

Stellen Sie sich einen Flughafen vor.

Der Flughafenbetreiber sichert das Gelände — die Start- und Landebahnen, die Terminals, die Zäune, die Sicherheitskontrollen, was passiert, wenn jemand Unbefugtes in der Nähe des Treibstofflagers gefunden wird.

Aber im Inneren ist jede Fluggesellschaft für ihren eigenen Betrieb verantwortlich: ihre eigene Flugzeugwartung, ihre eigenen Crew-Verfahren, ihre eigenen Passagierlisten. Wenn eine Fluggesellschaft das Gepäck eines Passagiers verliert oder ein Pilot eine Checkliste überspringt, ist das nicht die Schuld des Flughafens. Das Gelände war gesichert. Die darin operierende Fluggesellschaft traf eine schlechte Entscheidung.

AWS ist der Flughafen. Sie sind die darin operierende Fluggesellschaft. AWS sichert die physische Struktur und die Kerninfrastruktur. Sie sichern Ihre Daten, Ihre Zugriffskontrollen und Ihre Anwendungsentscheidungen.

Diese Analogie ist wichtig, weil sie klärt, wo die Linie verläuft, wenn etwas schiefgeht. "Wir sind auf AWS, also ist es deren Problem" ist in der Prüfung immer die falsche Antwort und in der realen Welt fast immer die falsche Antwort.

**Der Diensttyp ist entscheidend**

Es gibt noch eine Feinheit, die es jetzt zu kennen lohnt, auch wenn wir sie im ganzen Buch wieder aufgreifen werden.

Die Aufteilung der Verantwortung verschiebt sich je nachdem, wie verwaltet ein Dienst ist.

Bei EC2 — den virtuellen Maschinen, die Sie steuern — sind Sie für das Patchen des Betriebssystems verantwortlich. AWS stellt die physische Maschine und den Hypervisor bereit. Alles oberhalb des Betriebssystems gehört Ihnen.

Bei RDS — dem verwalteten Datenbankdienst, den wir in Kapitel 8 behandeln — patcht AWS die Datenbank-Engine selbst. Sie verwalten das Betriebssystem nicht. Ihre Verantwortung schrumpft auf die Datenbankkonfiguration, die darin enthaltenen Daten und darauf, wer Zugang hat.

Bei S3 — dem Dateispeicherdienst — verwaltet AWS die Infrastruktur vollständig. Ihre Verantwortung ist die Zugriffskontrolle (wer in Ihre Buckets lesen und schreiben kann) und die Daten selbst.

Je verwalteter der Dienst, desto mehr Verantwortung geht auf AWS über. Das ist ein zentrales Prüfungsmuster: Wenn eine Frage danach fragt, wer für etwas verantwortlich ist, fragen Sie zuerst "Wie verwaltet ist dieser Dienst?".

**Wenn Cloud, dann Bequemlichkeit, aber nicht Kontrolle**

Das Cloud-Modell bietet echte Vorteile: keine zu verwaltende Hardware, elastische Kosten, sofortige Skalierung. Aber es bedeutet auch, etwas einzutauschen.

Wenn Sie Ihre Infrastruktur in die Cloud verlegen, gewinnen Sie Flexibilität und reduzieren die Vorab-Kapitalkosten — aber Sie geben die vollständige Kontrolle über die zugrunde liegenden Maschinen auf. Sie können sie nicht physisch inspizieren. Sie können nicht garantieren, wo in einem Rechenzentrum sie stehen. Sie hängen von der Betriebszeit von AWS, den Wartungsfenstern von AWS und der Reaktion von AWS auf Vorfälle ab, wenn auf der Infrastrukturebene etwas schiefgeht. Für die meisten Teams ist das ein ausgezeichneter Tausch. Für einige regulierte Branchen erfordert er sorgfältige Dokumentation und die Compliance-Zertifizierungen von AWS. Wissen Sie, was Sie eintauschen, bevor Sie es eintauschen.

## Stärken und Einschränkungen

Kein Werkzeug ist perfekt. Lassen Sie uns ehrlich über beide Seiten sein.

**Warum die Cloud großartig ist**:

- Keine Hardware-Vorabkosten
- Bezahlung nur für das, was Sie nutzen
- Sofortige Skalierung in beide Richtungen
- Professionelle Zuverlässigkeit und physische Sicherheit
- Zugang zu Hunderten von verwalteten Diensten (Datenbanken, Warteschlangen, maschinelles Lernen und mehr)
  ohne diese selbst aufbauen oder warten zu müssen
- Globale Reichweite: Die Bereitstellung in einer neuen Region ist eine Konfigurationsänderung,
  kein Hardware-Beschaffungsprozess

**Wo es kompliziert wird**:

- Kosten können unvorhersehbar sein, wenn Sie nicht aufpassen (Toms zukünftiger Albtraum)
- Sie sind auf einen Dritten für Ihre Infrastruktur angewiesen — wenn AWS in Ihrer
  Region einen Ausfall hat, ist Ihr Dienst ebenfalls betroffen
- Es gibt eine Lernkurve. AWS hat Hunderte von Diensten. Zu wissen, welchen man verwenden soll,
  erfordert Erfahrung oder ein Buch wie dieses.
- Daten, die die Cloud verlassen, können teuer sein. Das Verschieben großer Datenmengen aus AWS
  kostet Geld. (Wir kommen in Kapitel 30 darauf zurück.)
- Vendor-Lock-in ist bei höherstufigen Diensten real. Eine verwaltete AWS-Datenbank zu nutzen
  ist leicht zu beginnen und schwerer wieder zu verlassen. Je mehr AWS-spezifische Dienste Sie nutzen,
  desto stärker sind Sie an das Ökosystem und die Preisgestaltung von AWS gebunden.

"Wir tauschen also Kontrolle gegen Bequemlichkeit", sagte Tom.

"Und tauschen Vorabkosten gegen laufende Kosten", fügte Maya hinzu.

"Und tauschen das Problem von jemand anderem gegen unser eigenes Problem, auf der Sicherheitsseite", sagte Priya.

"Aber wir tauschen auch Leos kaputten Server gegen Amazons sehr-nicht-kaputten Server", sagte Leo,
der anscheinend die ganze Zeit zugehört hatte.

Er lag nicht ganz falsch.

Tom hatte noch eine Sorge.

"Wenn wir alles auf AWS bauen und AWS in drei Jahren die Preise erhöht, können wir unsere
Datenbank nicht einfach in den Hinterraum des Restaurants verlegen."

"Stimmt", sagte Maya. "Aber Amazons Preisentwicklung war im Allgemeinen nach unten gerichtet — sie
haben die Preise seit 2006 über 100 Mal gesenkt. Das Risiko des Lock-in ist real, aber das tatsächliche
historische Risiko überraschender Preiserhöhungen ist gering."

"Im Allgemeinen", sagte Tom. Er schrieb es auf. Er würde diese Berechnung erneut durchgehen, wie er
alle seine Berechnungen erneut durchging, an einem zukünftigen Samstagmorgen mit einem roten Stift und einem Kaffee.

**Wann On-Premises die richtige Wahl ist**

Die Cloud gewinnt den Nimbus-Vergleich eindeutig. Aber intellektuelle Ehrlichkeit erfordert zu sagen, wann sie nicht gewinnt.

**Große Unternehmen mit stabilen, vorhersehbaren Workloads** stellen manchmal fest, dass das Besitzen von Hardware kostenmäßig mit dem Mieten konkurrenzfähig wird, sobald die Auslastung dauerhaft hoch ist. Wenn Sie Tausende von Servern bei 80 % Auslastung rund um die Uhr betreiben, sieht die Wirtschaftlichkeit des Besitzes anders aus als bei einem Startup mit variablem Traffic. Das Pay-per-Use-Modell der Cloud ist am vorteilhaftesten, wenn die Auslastung variabel ist. Wenn die Auslastung stabil und hoch ist, kann die Stückwirtschaftlichkeit des Besitzes konkurrenzfähig sein. Deshalb betreiben einige große Unternehmen hybride Architekturen: Cloud für variable Workloads, On-Premises für stabile.

**Regulierte Datenumgebungen mit strengen Lokalitätsanforderungen** haben möglicherweise keine andere Option als On-Premises. Behördliche Umgebungen für klassifiziertes Computing — Systeme, die als geheim eingestufte Informationen der nationalen Sicherheit verarbeiten — können keine kommerziellen Cloud-Anbieter nutzen. Die Daten dürfen eine physisch kontrollierte Einrichtung nicht verlassen. Finanzsysteme in bestimmten Rechtsordnungen haben ähnliche Anforderungen. Gesundheitsorganisationen, die bestimmte Datenkategorien verarbeiten, können auf Anforderungen stoßen, die kommerzielle Cloud-Zertifizierungen nicht vollständig erfüllen. In diesen Situationen ist On-Premises keine Präferenz; es ist ein Gebot.

**Anforderungen an extrem niedrige Latenz und physische Nähe** schaffen eine dritte Kategorie. Einige Finanzhandelssysteme benötigen Latenzen von unter einer Millisekunde zwischen ihrer Anwendung und der Matching-Engine der Börse. Co-Location im selben physischen Rechenzentrum wie die Börse — mit direkten Glasfaserverbindungen — erreicht Latenzen, die keine Cloud-Region erreichen könnte. Einige wissenschaftliche Instrumente — Teilchenbeschleuniger, seismische Netzwerke, Radioteleskope — erzeugen Daten, die lokal verarbeitet werden müssen, bevor eine Übertragung machbar ist. Das sind reale Anwendungsfälle, die physische Nähe zur Hardware erfordern.

**Bestehende langfristige Verträge** sind die banalste, aber oft relevanteste Einschränkung. Ein Unternehmen, das 2022 einen fünfjährigen Rechenzentrumsvertrag unterzeichnet hat, hat eine vertragliche Verpflichtung. Der Wechsel in die Cloud vor Ablauf des Vertrags hat reale Kosten — die verbleibenden Vertragszahlungen —, die die Wirtschaftlichkeit erheblich verändern. Architekturentscheidungen geschehen nicht im luftleeren Raum. Sie geschehen in Organisationen mit bestehenden Verträgen, bestehenden Hardware-Abschreibungsplänen und bestehendem Personal-Know-how.

"Trifft eines davon auf uns zu?" fragte Maya.

"Nein", sagte Tom. "Wir haben keine Hardware. Keine Verträge. Keine regulatorischen Vorgaben. Und ein Team ohne Erfahrung in der Serveradministration."

"Also Cloud."

"Also Cloud. Aber zu wissen, wann sie nicht die Antwort ist, gehört dazu, zu wissen, was man tut."

Keine der On-Premises-Ausnahmen trifft auf Nimbus zu. Aber sie sind real, und ein guter Cloud-Architekt weiß, wann er sagen muss: "Die Cloud ist hier nicht die richtige Antwort." Das Ziel ist nicht, ein Cloud-Befürworter zu sein. Das Ziel ist, recht zu haben.

## Zusammenfassung

Die Frage, die Tom nicht losließ — warum ist Mieten günstiger als Besitzen? — hatte, wie sich herausstellte, eine einfache und eine komplizierte Antwort. Die einfache Antwort ist Auslastung: Sie hören auf, für Kapazität zu zahlen, die an ruhigen Dienstagen untätig herumsteht. Die komplizierte Antwort betrifft das Modell der geteilten Verantwortung, den Kompromiss zwischen CapEx und OpEx und einige ehrliche Situationen, in denen die Cloud tatsächlich die falsche Wahl ist. Tom hatte recht, die Frage zu stellen. Die Antwort veränderte, wie das Team über alles Folgende dachte.

- Der Kernvorteil ist Pay-as-you-go-Skalierung: Sie zahlen nur für das, was Sie nutzen, und können nach Bedarf hoch- oder herunterskalieren.
- Toms Kostenvergleich zeigte die Hardware-Wirtschaftlichkeit klar: 720 $/Jahr für zwei EC2-Instanzen gegenüber 8.000–12.000 $/Jahr für äquivalente physische Hardware, vor Wartungskosten.
- AWS kümmert sich um die physische Infrastruktur. Sie kümmern sich um Ihre Anwendung, Ihre Daten und Ihre Konfigurationen. Diese Aufteilung wird als **Modell der geteilten Verantwortung** bezeichnet.
- Das Modell der geteilten Verantwortung verschiebt sich je nach Diensttyp — verwaltetere Dienste bedeuten mehr AWS-Verantwortung.
- Die Cloud ist nicht immer günstiger oder einfacher — aber sie beseitigt Einstiegshürden und macht Skalierung auf eine Weise möglich, die physische Server nicht erreichen können.

## Prüfungstipps

*SAA-C03-Domäne: Domänenübergreifend — Grundlagen der Cloud-Konzepte*

- Das **Modell der geteilten Verantwortung** erscheint regelmäßig in der Prüfung. Merken Sie sich: AWS
  ist verantwortlich für die Sicherheit *der* Cloud (Hardware, Rechenzentren, globales Netzwerk).
  Sie sind verantwortlich für die Sicherheit *in* der Cloud (Daten, Identitäten, Anwendungskonfiguration).
- **Wichtige Nuance**: Die Aufteilung verschiebt sich je nach Diensttyp. Bei EC2
  (eine virtuelle Maschine, die Sie steuern) patchen *Sie* das Betriebssystem. Bei RDS (einer
  verwalteten Datenbank) patcht AWS die Datenbank-Engine. Je "verwalteter" ein Dienst
  ist, desto mehr Verantwortung geht auf AWS über. Prüfungsszenarien beschreiben einen Vorfall
  und fragen, wer verantwortlich ist — fragen Sie sich immer: "Wie verwaltet ist dieser Dienst?"
- Fragen zu Cloud-*Vorteilen* testen oft CapEx vs. OpEx. On-Premises-Hardware
  ist Investitionsausgabe (CapEx — einmal kaufen, über die Zeit abschreiben). Cloud ist
  Betriebsausgabe (OpEx — monatlich zahlen). AWS verschiebt Kosten von CapEx zu OpEx.
- "Elastizität" — die Fähigkeit, *automatisch* hoch- *und herunter*zuskalieren — ist ein
  wesentlicher Cloud-Vorteil. Sie kann auf der Prüfung mit "Skalierbarkeit" kombiniert erscheinen.
  Elastizität bedeutet automatische, nachfragegetriebene Skalierung in beide Richtungen.
  Skalierbarkeit bedeutet, dass das System *wachsen kann*, aber nicht notwendigerweise automatisch schrumpft.
- Die Prüfung kann ein Szenario beschreiben, in dem ein Unternehmen vom "Kauf von Servern" zur "Cloud" wechselt. Die richtige Einordnung: Wechsel von CapEx zu OpEx, Beseitigung von Vorabkosten, Gewinn von Elastizität und Verlagerung der Infrastrukturverantwortung auf den Cloud-Anbieter.

## Übungen

**Übung 1 — Wiederholung**

Erklären Sie mit eigenen Worten: das Modell der geteilten Verantwortung. Wer ist für was verantwortlich,
und warum ist diese Unterscheidung wichtig?

*(Hinweis: Denken Sie an Priyas Analogie — wer schützt das Gebäude und wer schützt das, was darin ist.)*

**Übung 2 — SAA-C03-Szenario**

*Szenario*: Ein Unternehmen migriert seine Webanwendung von einem On-Premises-Rechenzentrum
zu AWS. Das Sicherheitsteam ist besorgt über die Einhaltung seiner Datenschutzrichtlinien.
Ein neuer Ingenieur fragt: "Jetzt, da wir bei AWS sind, kümmert sich Amazon um all unsere
Sicherheitsanforderungen?"

Welche der folgenden Beschreibungen trifft am BESTEN auf die Aufteilung der Sicherheitsverantwortungen zu?

A) AWS ist vollständig für alle Sicherheit verantwortlich, sobald die Anwendung in der Cloud gehostet wird  
B) Der Kunde ist vollständig für alle Sicherheit verantwortlich, einschließlich der physischen Rechenzentrumssicherheit  
C) AWS verwaltet die Sicherheit der zugrunde liegenden Infrastruktur; der Kunde verwaltet die Sicherheit seiner Daten, Anwendungen und Konfigurationen  
D) Sicherheitsverantwortlichkeiten werden pro Konto ausgehandelt und hängen vom Service-Tier des Kunden ab

**Hinweis 1**: Denken Sie darüber nach, was AWS physisch kontrolliert versus was Sie kontrollieren.

**Hinweis 2**: AWS besitzt die Rechenzentren. Sie haben entschieden, was Sie darin ablegen und wie Sie
Ihre Anwendung konfigurieren.

**Hinweis 3**: Wir haben in diesem Kapitel einen spezifischen Namen für diese Aufteilung der Verantwortlichkeiten eingeführt.

**Antwort**: C

**Erklärung**: Das AWS-Modell der geteilten Verantwortung teilt die Sicherheit in zwei Domänen auf.
AWS sichert die physische Infrastruktur — Rechenzentren, Hardware und Netzwerke.
Der Kunde sichert alles, was er darauf deployed: seine Daten, seine Zugriffskontrollen,
seine Anwendungskonfigurationen und seine Netzwerkeinstellungen.

**Warum nicht A?** AWS übernimmt nie die vollständige Verantwortung für die Sicherheit der Kundenanwendung.
In dem Moment, in dem Sie etwas konfigurieren, liegt diese Konfiguration in Ihrer Verantwortung.

**Warum nicht B?** Kunden sind nicht für die physische Rechenzentrumssicherheit verantwortlich —
das ist genau einer der Vorteile der Nutzung von AWS.

**Warum nicht D?** Das Modell der geteilten Verantwortung ist ein festes Framework, keine ausgehandelte
Vereinbarung.

*SAA-C03-Domäne: Domänenübergreifend — Cloud-Konzepte / Geteilte Verantwortung*

**Übung 3 — Architekturherausforderung** *(Optional)*

Ein Freund startet eine neue App und fragt Sie um Ihre Meinung. Er entscheidet sich zwischen
dem Kauf von zwei physischen Servern (einer für die App, einer für die Datenbank) oder der Nutzung
eines Cloud-Anbieters. Sein prognostizierter Traffic beträgt 10–100 Nutzer pro Tag, aber er hat eine
Veranstaltung in drei Monaten, die an einem einzigen Tag 10.000 Nutzer bringen könnte.

Gehen Sie die Kompromisse durch. Welche Option würden Sie empfehlen, und was ist der Hauptgrund?
Was würden Sie mit Ihrer Wahl aufgeben?

*(Es gibt keine einzige richtige Antwort. Das Ziel ist, das Denken in Kompromissen zu üben.)*

## Post-Credits-Szene

Drei Tage später hatte Nimbus ein AWS-Konto.

Leo hatte es um 23 Uhr mit seiner persönlichen E-Mail-Adresse erstellt, einer Kreditkarte, die er von Tom leihen musste, und einer Begeisterung, die im Nachhinein betrachtet leicht alarmierend war.

"Ich habe etwas namens EC2 gefunden", sagte er am nächsten Morgen und zeigte seinen Laptop-Bildschirm. "Es ist wie ein Computer, den man mietet. Ich glaube, ich habe einen gestartet."

"Du *glaubst*?" fragte Priya.

"Ich meine, ich habe definitiv einen gestartet." Er scrollte nach unten. "Ich weiß nur nicht, wo er ist."

Maya lehnte sich vor und schaute auf den Bildschirm.

"Leo", sagte sie. "Warum steht da 'Region: ap-southeast-1'?"

"Was bedeutet das?"

"Moment — aber *warum* wären wir in Singapur?" sagte Maya. "Alle unsere Kunden sind an der Westküste."

Im nächsten Kapitel: die Geografie von AWS — wo die Server wirklich sind und warum das wichtig ist.
