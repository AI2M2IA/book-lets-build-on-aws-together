# Kapitel 0: Bevor wir beginnen

Maya stand an einem Freitagabend hinter der Theke des Familienrestaurants, als ihr der Gedanke kam.

Sie waren seit vier Jahren geöffnet. Das Essen war gut — die Leute fuhren quer durch die Stadt für die Arepa. Aber jedes Mal, wenn jemand anrief, um eine Bestellung aufzugeben, war die Leitung besetzt. Jedes Mal, wenn jemand vorbeikam, um Essen abzuholen, das er nie wirklich bestellt hatte, lag das daran, dass er angerufen und aufgegeben hatte.

Bestellungen gingen verloren. Geld lief zur Tür hinaus, bevor es überhaupt hereinkam.

Und das Schlimmste war, dass niemand auf einen einzigen dramatischen Fehler zeigen konnte.

Nichts war explodiert. Nichts war abgestürzt. Es gab keinen Bösewicht, kein Ausfallbanner, keinen offensichtlich kaputten Bildschirm.

Es war nur Reibung. Kleine, stille, teure Reibung.

"Wir brauchen eine Website", sagte Maya zu niemandem im Besonderen.

Ihr Cousin Tom blickte von der Tabelle auf, die er von Hand aktualisierte. Tom verwaltete die "Systeme" des Restaurants — ein großzügiges Wort für eine gemeinsam genutzte Google-Tabelle und ein Whiteboard — seit zwei Jahren.

"Eine Website", wiederholte er. "Und wo genau lebt eine Website?"

Maya öffnete den Mund. Schloss ihn.

Sie hatte keine Ahnung.

**Eine Frage, die einfach klingt**

Wo lebt eine Website?

Sie haben darüber wahrscheinlich noch nie nachgedacht. Die meisten Menschen nicht. Sie tippen eine Adresse in einen Browser, eine Seite erscheint, und irgendwo zwischen diesen beiden Ereignissen geschieht Magie.

Bis zu dem Tag, an dem Sie derjenige sind, der für die Magie zahlt.

Aber es ist keine Magie. Es sind Computer.

Irgendwo auf der Welt gibt es gerade jetzt einen physischen Computer — einen Server —, der die Dateien speichert, aus denen diese Website besteht. Wenn Sie Ihren Browser nach der Seite fragen, reist Ihre Anfrage über das Internet, erreicht diesen Computer, und der Computer sendet die Dateien zurück zu Ihnen.

Das ist alles. Das ist eine Website.

Die eigentliche Frage lautet also: *wessen* Computer?

**Drei Optionen, ein Problem**

Zurück im Restaurant skizzierten Maya und Tom die Optionen auf dem Whiteboard.

**Option eins**: Einen Computer kaufen, ihn im Restaurant aufstellen und die Website von dort aus betreiben. (In der Branche nennt man das "On-Premises" — Ihr eigenes Gebäude, Ihre eigenen Maschinen. Diesen Begriff werden Sie ständig sehen.)

Tom schrieb "Stromrechnung" und "was passiert, wenn er kaputt geht" neben diese Option.

**Option zwei**: Ein Hosting-Unternehmen bezahlen, das einen kleinen Server für sie betreibt. Günstig, einfach. Hat für persönliche Blogs im Jahr 2008 funktioniert. Wahrscheinlich nicht flexibel genug für ein wachsendes Unternehmen.

"Was, wenn wir plötzlich tausend Bestellungen auf einmal bekommen?" fragte Maya.

Tom fügte "kann nicht skalieren" zu Option zwei hinzu.

**Option drei**: Etwas anderes. Etwas, von dem sie gehört hatten. Etwas, das "die Cloud" genannt wurde.

Tom zeichnete eine Wolke auf das Whiteboard. Eine buchstäbliche Wolkenform, wie die Zeichnung eines Kindes.

"Ich weiß eigentlich nicht, was das bedeutet", gab er zu.

"Ich auch nicht", sagte Maya.

Das war der Anfang von allem.

**Was "die Cloud" wirklich ist**

Klären wir das sofort, denn das Wort "Cloud" ist einer der am meisten überbenutzten und am wenigsten erklärten Begriffe in der Technologie.

Die Cloud ist kein magischer Ort, an dem Ihre Daten schweben.

Die Cloud sind die Computer von jemand anderem.

Das ist alles. Wenn Sie ein Foto in iCloud oder Google Drive speichern, wird Ihr Foto auf einem physischen Computer von Apple oder Google gespeichert, der irgendwo in einem Gebäude steht. Wenn Sie Netflix nutzen, wird das Video, das Sie gerade ansehen, von physischen Servern in Rechenzentren auf der ganzen Welt gesendet.

"Die Cloud" bedeutet einfach: Computer, auf die Sie über das Internet zugreifen und die Sie weder besitzen noch selbst warten müssen.

Und Amazon — ja, das Unternehmen, das Pakete liefert — hat eine der größten Sammlungen dieser Computer der Welt aufgebaut. Sie nennen es Amazon Web Services, oder AWS.

**Warum Amazon?**

Eine berechtigte Frage. Amazon begann als Buchhandlung.

Folgendes geschah: Amazon wuchs so schnell, dass sie enorme Rechenleistung für ihre eigenen Systeme benötigten. Sie bauten Rechenzentren. Sie stellten Ingenieure ein, um diese zu verwalten. Sie wurden sehr, sehr gut darin, Computer in großem Maßstab zu betreiben.

Dann hatte jemand bei Amazon eine Idee: Was, wenn wir anderen Menschen Zugang zu dieser gesamten Rechenleistung verkaufen?

Im Jahr 2006 wurde Amazon Web Services gestartet. Heute betreibt AWS einen bedeutenden Teil des Internets. Die Website, die Sie zum Buchen von Flügen nutzen, die App, die Ihre Lieferung verfolgt, der Streaming-Dienst, den Sie gestern Abend angeschaut haben — es ist gut möglich, dass zumindest ein Teil davon auf AWS läuft.

Es ist kein Monopol. Google Cloud und Microsoft Azure sind ernstzunehmende Wettbewerber. Aber AWS war zuerst da, ist groß, und darum geht es in diesem Buch.

**Das Team**

Maya baute Nimbus nicht alleine auf.

Sie rief zuerst Tom an — natürlich. Tom hatte die Tabellen, die Lieferantenkontakte und die Beharrlichkeit, die nötig war, um eine Idee tatsächlich umzusetzen.

Tom kannte einen Entwickler. Leo. Vierundzwanzig Jahre alt, autodidaktisch, die Art von Person, die schon einen Prototyp gebaut hat, bevor Sie fertig sind, das Problem zu erklären. Er kam zu ihrem ersten Treffen mit einem Laptop und einer halbfertigen App.

"Ich habe schon angefangen", sagte er und öffnete den Bildschirm. "Ich glaube, ich habe es irgendwo deployed."

Das hatte er. Auf einem Server, den er nicht vollständig verstand, in einer Region, die er nicht absichtlich gewählt hatte, mit Code, der definitiv unter Last brechen würde.

Sie liebten ihn sofort.

Priya kam später — durch einen gemeinsamen Freund empfohlen. Ingenieurstudium, Sicherheitsschwerpunkt, die Art von Person, die an Wochenendabenden Post-Mortems berühmter Technikausfälle liest. Sie hatte bei ihrem ersten Treffen eine Frage.

"Hat sich jemand Gedanken gemacht, was passiert, wenn jemand versucht einzubrechen?"

Stille.

"Willkommen im Team", sagte Maya.

**Was dieses Buch ist**

Dies ist die Geschichte von Nimbus.

Nimbus begann als Restaurant-Bestellsystem und wurde zu etwas viel Größerem. Während es wuchs, stieß es auf jedes Problem, das wachsende Software hat: Systeme, die den Traffic nicht bewältigen konnten, Daten, die verloren gingen, Server, die im schlimmsten Moment ausfielen, Kosten, die schneller wuchsen als der Umsatz.

Und jedes Mal, wenn sie auf ein Problem stießen, fanden sie einen AWS-Dienst, der genau für diese Art von Problem entwickelt worden war.

Dieses Buch lehrt Sie AWS, indem es dieser Reise folgt.

Sie werden nicht nur lernen, *was* jeder Dienst tut, sondern *warum* er existiert, *wann* man ihn einsetzt und — ebenso wichtig — *wann man ihn nicht einsetzt*. Jedes Werkzeug hat Kompromisse. Jede Entscheidung hat Kosten. Das ist es, was Senior-Ingenieure verstehen, was Junior-Ingenieure noch lernen.

Wenn Sie dieses Buch abgeschlossen haben, sind Sie bereit, die AWS Solutions Architect Associate-Prüfung (SAA-C03) abzulegen. Mehr noch: Sie werden bereit sein, in ein echtes technisches Gespräch zu gehen und sich zu behaupten.

Das ist das Versprechen.

**Ein paar Dinge, bevor wir beginnen**

**Dieses Buch setzt voraus, dass Sie fast nichts über Cloud-Computing wissen.** Wenn Sie von AWS gehört haben, es aber noch nie benutzt haben, sind Sie hier richtig. Wenn Sie noch nie von AWS gehört haben, sind Sie ebenfalls hier richtig.

**Dieses Buch setzt nicht voraus, dass Sie Entwickler sind.** Maya ist keiner. Tom kaum. Sie müssen keinen Code schreiben, um Architektur zu verstehen. Sie müssen Probleme und Lösungen verstehen.

**Dieses Buch wird manchmal absichtlich falsch liegen.** Das Team wird Fehler machen. Es wird den falschen Dienst wählen. Es wird einen Sicherheitsschritt überspringen, den es bereuen wird. Es wird over-provisionen und under-provisionen. So werden sie lernen, und so werden auch Sie es tun.

**Die Prüfungstipps sind echt.** Die SAA-C03 ist eine echte Prüfung. Die szenariobasierten Fragen am Ende jedes Kapitels sind so gestaltet, dass sie wie die eigentliche Prüfung wirken. Wenn Sie sie beantworten können, sind Sie auf dem richtigen Weg.

Und noch eine Sache.

Lesen Sie dieses Buch mit einem Bleistift, einer Notiz-App oder einer laufenden Liste von "Ich denke, die Antwort ist..."-Momenten.

Halten Sie inne, bevor das Team eine Entscheidung trifft. Treffen Sie die Entscheidung selbst. Lesen Sie dann weiter und sehen Sie, ob Sie denselben Kompromiss getroffen hätten.

## Zusammenfassung

- **Die Cloud** ist bedarfsgerechter Zugang zu Computerressourcen über das Internet — die Computer von jemand anderem, die Sie weder besitzen noch warten müssen.
- Die drei Hosting-Optionen: On-Premises (Ihre Hardware, Ihre Kosten), Shared Hosting (begrenzt, skaliert nicht), Cloud (Pay-as-you-go, skaliert mit der Nachfrage).
- **AWS** wurde 2006 gestartet, als Amazon seine Rechenzentrumsinfrastruktur für externe Kunden öffnete. Es bleibt der größte Cloud-Anbieter, gefolgt von Microsoft Azure und Google Cloud.
- Nimbus — die Geschichte, der dieses Buch folgt — beginnt als Restaurant-Bestellsystem und wächst zu einer produktionsreifen Cloud-Architektur.
- Dieses Buch lehrt nicht nur *was* jeder AWS-Dienst tut, sondern *warum* er existiert, *wann* man ihn einsetzt und *wann nicht*.

## Prüfungstipps

*SAA-C03-Domäne: Domänenübergreifend — Grundlagen der Cloud-Konzepte*

- **Die Cloud auf der Prüfung** bedeutet bedarfsgerechtes, nutzungsbasiertes Computing über das Internet. Es ist ein Bereitstellungsmodell, keine Technologie.
- **CapEx vs. OpEx**: On-Premises-Infrastruktur ist Investitionsausgabe (CapEx — einmaliger Hardware-Kauf). Cloud ist Betriebsausgabe (OpEx — laufende Nutzungsgebühren). Prüfungsszenarien, die nach "Vermeidung von Vorabkosten" oder "Wechsel von CapEx zu OpEx" fragen, weisen auf Cloud-Adoption hin.
- **Cloud-Vorteile**: Keine Hardware-Vorabkosten, elastische Skalierung, Bezahlung nur für das, was Sie nutzen, keine physische Infrastrukturverwaltung. Szenarien mit "unvorhersehbarem Traffic" oder "kleinem Team, kein Hardware-Know-how" sind starke Signale für die Cloud.
- **AWS ist nicht die einzige Cloud** — Azure und GCP sind echte Wettbewerber —, aber die SAA-C03-Prüfung ist AWS-spezifisch. Es wird nicht gefragt, Anbieter zu vergleichen.

## Stärken und Einschränkungen

**Stärken dieses Ansatzes**: Lernen durch eine durchgehende Erzählung gibt Konzepten einen Kontext, bevor sie Namen bekommen. Wenn Sie IAM oder RDS erreichen, haben Sie das Problem, das diese Dienste lösen, bereits gespürt — weil Nimbus es zuerst gespürt hat. Dies macht das Behalten leichter und das Denken in Kompromissen natürlicher als das Auswendiglernen von Funktionslisten.

**Zu beachtende Einschränkungen**: Dieses Buch deckt den AWS SAA-C03 Solutions Architect Associate-Lehrplan ab. Das ist ein erheblicher Umfang, aber nicht jeder AWS-Dienst — und Produktionsarchitekturen beinhalten immer Dienste und Einschränkungen, die spezifisch für Ihre Branche und Ihren Maßstab sind. Die Nimbus-Geschichte ist fiktiv; echte Startups treffen unordentlichere Entscheidungen aus unordentlicheren Gründen. Verwenden Sie dieses Buch, um das Denken aufzubauen, nicht um die Architektur zu kopieren.

## Übungen

**Übung 1 — Wiederholung**

Erklären Sie mit eigenen Worten: Was ist "die Cloud", und warum würde ein kleines Unternehmen sie gegenüber dem Kauf eigener Server bevorzugen?

*(Hinweis: Denken Sie daran, was Maya und Tom neben Option 1 auf dem Whiteboard geschrieben haben.)*

**Übung 2 — Prüfungsübung**

*Szenario*: Ein kleines Startup startet eine Essenslieferanwendung. Sie erwarten anfangs wenig Traffic, aber bei erfolgreichem Produkt schnelles Wachstum. Das Gründungsteam hat keine Erfahrung mit der Verwaltung physischer Server. Es möchte Vorabkosten minimieren und den Betriebsaufwand für die Hardware-Wartung vermeiden.

Welcher der folgenden Ansätze erfüllt seine Anforderungen AM BESTEN?

A) Einen dedizierten Server kaufen und die Anwendung im Büro hosten  
B) Einen Cloud-Anbieter nutzen, um die Anwendung zu hosten und nur für das zu zahlen, was genutzt wird  
C) Mit einem Co-Location-Rechenzentrum zusammenarbeiten, um eigene Server dort einzubauen  
D) Die Anwendung so entwickeln, dass sie vollständig offline ohne Internetinfrastruktur läuft

**Hinweis 1**: Denken Sie daran, was das Startup *vermeiden* muss, genauso wie das, was es haben muss.

**Hinweis 2**: Das Szenario erwähnt ausdrücklich "keine Erfahrung mit Hardware-Verwaltung" und "Vorabkosten minimieren". Welche Option beseitigt diese Bedenken?

**Hinweis 3**: Wir haben diese Option in diesem Kapitel als Bezahlung für "die Computer von jemand anderem" beschrieben.

**Antwort**: B

**Erklärung**: Cloud-Anbieter wie AWS bieten Pay-as-you-go-Preise ohne Hardware-Vorabkosten an und kümmern sich um alle physischen Infrastrukturwartungen. Dies ist genau das Modell, das für ein Startup mit ungewissem Traffic und ohne Hardware-Know-how sinnvoll ist — genau wie Nimbus.

**Warum nicht A?** Der Kauf eines dedizierten Servers erfordert Vorabkapital, laufende Wartung und bietet keine integrierte Skalierungsmöglichkeit bei wachsendem Traffic.

**Warum nicht C?** Co-Location löst das Platzproblem, aber das Startup muss trotzdem eigene Server kaufen, warten und verwalten.

**Warum nicht D?** Eine Essenslieferanwendung erfordert per Definition Internetkonnektivität.

*SAA-C03-Domäne: Domänenübergreifend — Grundlagen der Cloud-Konzepte*

**Übung 3 — Architekturherausforderung** *(Optional)*

Maya möchte ihren Onkel (der das Restaurant besitzt) davon überzeugen, ein Cloud-basiertes Bestellsystem aufzubauen. Er ist skeptisch: "Warum sollten wir Amazon jeden Monat bezahlen, wenn wir einfach einmal einen Computer kaufen könnten?"

Wie würden Sie die Kompromisse erklären? Was sind Ihrer Meinung nach die größten Vorteile des Cloud-Ansatzes für ein Restaurant? Und in welchem Szenario könnte es tatsächlich sinnvoller sein, einen eigenen Computer zu kaufen?

*(Es gibt keine einzige richtige Antwort. Das Ziel ist, das Denken in Kompromissen zu üben.)*

## Post-Credits-Szene

Spät in der Nacht, nachdem alle anderen nach Hause gegangen waren, saß Maya allein im Restaurant mit ihrem Laptop.

Sie hatte die AWS-Website gefunden. Sie hatte sich durch einige Seiten geklickt. Es gab Hunderte von aufgelisteten Diensten. Hunderte.

Sie scrollte nach unten. Und weiter. Und weiter.

Dann schloss sie den Laptop.

"Wir werden einen Plan brauchen", sagte sie zum leeren Raum.

Im nächsten Kapitel: Warum Unternehmen aufgehört haben, Server zu kaufen, und begonnen haben, sie zu mieten — und was das verändert hat.
