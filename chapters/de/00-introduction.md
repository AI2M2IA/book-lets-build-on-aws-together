# Kapitel 0: Bevor wir beginnen

Maya stand an einem Freitagabend hinter der Theke des Familienrestaurants, als ihr der
Gedanke kam.

Sie waren seit vier Jahren geöffnet. Das Essen war gut — die Leute fuhren quer durch die
Stadt für die Arepa. Aber jedes Mal, wenn jemand anrief, um eine Bestellung aufzugeben,
war die Leitung besetzt. Jedes Mal, wenn jemand vorbeikam, um Essen abzuholen, das er nie
wirklich bestellt hatte, lag das daran, dass er angerufen und aufgegeben hatte.

Bestellungen gingen verloren. Geld lief zur Tür hinaus, bevor es überhaupt hereinkam.

Und das Schlimmste war, dass niemand auf einen einzigen dramatischen Fehler zeigen konnte.

Nichts war explodiert. Nichts war abgestürzt. Es gab keinen Bösewicht, kein Ausfallbanner,
keinen offensichtlich kaputten Bildschirm.

Es war nur Reibung. Kleine, stille, teure Reibung.

"Wir verlieren jeden Freitag Bestellungen", sagte Maya zu niemandem im Besonderen. "Nicht weil das Essen schlecht ist. Sondern weil uns niemand erreichen kann. Wir brauchen eine Website."

Ihr Cousin Tom blickte von der Tabelle auf, die er von Hand aktualisierte. Tom — ein
ehemaliger Systemadministrator, der Serverräume gegen das Familienunternehmen eingetauscht
hatte — verwaltete seit zwei Jahren die "Systeme" des Restaurants — ein großzügiges Wort
für eine gemeinsam genutzte Google-Tabelle und ein Whiteboard.

"Eine Website", wiederholte er. "Und wo genau lebt eine Website?"

Maya öffnete den Mund. Schloss ihn.

Sie hatte keine Ahnung.

**Eine Frage, die einfach klingt**

Wo lebt eine Website?

Sie haben darüber wahrscheinlich noch nie nachgedacht. Die meisten Menschen nicht. Sie
tippen eine Adresse in einen Browser, eine Seite erscheint, und irgendwo zwischen diesen
beiden Ereignissen geschieht Magie.

Bis zu dem Tag, an dem Sie derjenige sind, der für die Magie zahlt.

Aber es ist keine Magie. Es sind Computer.

Irgendwo auf der Welt gibt es gerade jetzt einen physischen Computer — einen Server —, der
die Dateien speichert, aus denen diese Website besteht. Wenn Sie Ihren Browser nach der
Seite fragen, reist Ihre Anfrage über das Internet, erreicht diesen Computer, und der
Computer sendet die Dateien zurück zu Ihnen.

Das ist alles. Das ist eine Website.

Die eigentliche Frage lautet also: *wessen* Computer?

Diese Frage führte Maya zum Whiteboard. Und das Whiteboard führte zu allem anderen.

**Drei Optionen, ein Problem**

Zurück im Restaurant skizzierten Maya und Tom die Optionen auf dem Whiteboard.

**Option eins**: Einen Computer kaufen, ihn im Restaurant aufstellen und die Website von
dort aus betreiben. Das nennt man "On-Premises" — Ihr eigenes Gebäude, Ihre eigenen
Maschinen. Diesen Begriff werden Sie im ganzen Buch sehen.

Tom schrieb "Stromrechnung" und "was passiert, wenn er kaputt geht" neben diese Option. Dann hielt er inne und begann, auf seinem Handy tatsächlich Preise zu recherchieren. Ein Server, der eine bescheidene Webanwendung bewältigen konnte, kostete im Voraus zwischen achthundert und zweitausend Dollar. Rechnete man eine USV-Batteriepufferung, einen verwalteten Switch und eine Firewall-Appliance hinzu, war man näher an viertausend Dollar, bevor man auch nur eine einzige Betriebsstunde bezahlt hatte. Dann kamen die Stromrechnung, die Kühlungsanforderungen und die Tatsache, dass man die Hardware alle drei bis fünf Jahre ersetzen musste.

"Wie viel kostet das pro Monat, wenn man alles einrechnet?" fragte Tom, mehr sich selbst als Maya.

Er rechnete nach. Ein Server für 2.000 Dollar, über vier Jahre abgeschrieben: etwa 42 Dollar im Monat. Stromverbrauch im Dauerbetrieb 24/7 bei 300 bis 500 Watt: ungefähr 25 bis 40 Dollar im Monat. Eine geschäftstaugliche Internetverbindung, die echten Traffic bewältigen konnte: 100 bis 300 Dollar im Monat. Hinzu kam, dass man das Ganze alle drei bis fünf Jahre wiederholen musste. Hardware hält nicht ewig.

"Also irgendwo zwischen 170 und 400 Dollar im Monat", sagte Tom, "bevor wir jemanden dafür bezahlen, ihn zu reparieren, wenn er kaputtgeht. Und er wird kaputtgehen."

"Was passiert, wenn er um 23 Uhr an einem Freitag kaputtgeht?" fragte Maya.

Tom wusste, wie man einen Server repariert — er hatte jahrelang genau das getan, in einem früheren Leben als Systemadministrator. Das war das Problem. Er wusste genau, was es bedeutete, der einzige Mensch zu sein, der die Maschine reparieren konnte: die Anrufe um 2 Uhr nachts, die an ausgefallene Festplatten verlorenen Wochenenden, der wegen eines defekten Netzteils abgebrochene Urlaub. Maya konnte es nicht, und Tom wollte nicht der einzelne Ausfallpunkt für den einzelnen Ausfallpunkt sein. Das Restaurant würde dunkel werden. Bestellungen würden stoppen. Und es gab keine Redundanz — eine Maschine, kein Notfallplan.

"Und was, wenn wir schnell wachsen?" fügte Maya hinzu. "Wir würden den Server für das heutige Volumen kaufen, und was, wenn wir in sechs Monaten die dreifache Kapazität brauchen? Wir müssten mehr Hardware kaufen, auf die Lieferung warten, sie einrichten..."

Tom fügte "kann nicht skalieren", "Ersatzkosten" und "wer repariert ihn um 2 Uhr nachts" zu Option eins hinzu. Die Spalte wurde lang.

**Option zwei**: Ein Hosting-Unternehmen bezahlen, das einen kleinen Server für sie
betreibt. Günstig, einfach. Hat für persönliche Blogs im Jahr 2008 funktioniert.
Wahrscheinlich nicht flexibel genug für ein wachsendes Unternehmen.

"Was, wenn wir plötzlich tausend Bestellungen auf einmal bekommen?" fragte Maya.

Tom fügte "kann nicht skalieren" zu Option zwei hinzu.

Er hatte sich bei seiner Recherche ein paar Shared-Hosting-Tarife angesehen. Acht Dollar im Monat, zwölf Dollar im Monat. Aber jeder Tarif hatte harte Grenzen: Speicherplatz, Bandbreite, gleichzeitige Verbindungen. Ein beliebter Tarif prahlte in der Überschrift mit "unbegrenzter Bandbreite" und versteckte dann die Drosselungsrichtlinie vier Absätze tief in den Nutzungsbedingungen. Hundert gleichzeitige Besucher, und der Dienst verschlechterte sich. Zweihundert, und die Seite ging offline.

"Das ist nicht unbegrenzt", sagte Tom. "Das ist 'unbegrenzt, bis es darauf ankommt.'"

Ein dedizierter Server bei einem Hosting-Unternehmen war vielversprechender — 80 bis 200 Dollar im Monat für etwas Echtes —, aber das Team müsste ihn trotzdem selbst konfigurieren und warten. Und es würde immer noch eine feste Obergrenze kaufen, ohne elastische Reaktion auf die Nachfrage.

"Jeden Tag, an dem wir unter der Kapazität liegen, verschwenden wir Geld", sagte Maya. "Jeden Tag, an dem wir über der Kapazität liegen, verlieren wir Kunden. Es gibt keine Möglichkeit, genau richtig zu liegen."

"Es sei denn, die Obergrenze bewegt sich mit uns", sagte Tom.

Er hatte es nicht als Überleitung gemeint, aber es war die richtige.

**Option drei**: Etwas anderes. Etwas, von dem sie gehört hatten. Etwas, das "die Cloud"
genannt wurde.

Tom zeichnete eine Wolke auf das Whiteboard. Eine buchstäbliche Wolkenform, wie die
Zeichnung eines Kindes.

"Ich weiß eigentlich nicht, was das bedeutet", gab er zu.

"Ich auch nicht", sagte Maya.

Das war der Anfang von allem.

**Was "die Cloud" wirklich ist**

Klären wir das sofort, denn das Wort "Cloud" ist einer der am meisten überbenutzten und am
wenigsten erklärten Begriffe in der Technologie.

Die Cloud ist kein magischer Ort, an dem Ihre Daten schweben.

Die Cloud sind die Computer von jemand anderem.

Das ist alles. Wenn Sie ein Foto in iCloud oder Google Drive speichern, wird Ihr Foto auf
einem physischen Computer von Apple oder Google gespeichert, der irgendwo in einem Gebäude
steht. Wenn Sie Netflix nutzen, wird das Video, das Sie gerade ansehen, von physischen
Servern in Rechenzentren auf der ganzen Welt gesendet.

"Die Cloud" bedeutet einfach: Computer, auf die Sie über das Internet zugreifen und die
Sie weder besitzen noch selbst warten müssen.

Und Amazon — ja, das Unternehmen, das Pakete liefert — hat eine der größten Sammlungen
dieser Computer der Welt aufgebaut. Sie nennen es Amazon Web Services, oder AWS.

**Die Analogie zum Stromnetz**

Stellen Sie es sich wie das Stromnetz vor.

Vor hundert Jahren, wenn Sie eine Fabrik betreiben wollten, bauten Sie Ihr eigenes Kraftwerk. Sie stellten Ingenieure ein, um es zu betreiben. Sie zahlten für Brennstoff, für Wartung, für das Fachwissen, das nötig war, um die Lichter am Brennen zu halten. Wenn der Generator kaputtging, stand Ihre Fabrik still. Wenn die Nachfrage stieg, mussten Sie einen größeren Generator bauen — ein teurer, langsamer Prozess, der erforderte, die zukünftige Nachfrage Jahre im Voraus vorherzusagen und Kapital zu binden, bevor Sie wussten, ob Sie es brauchten.

Dann kam das Stromnetz, und das Spiel änderte sich vollständig.

Sie schlossen sich an das Netz an und zahlten für genau den Strom, den Sie verbrauchten. Kein Kraftwerk. Kein Wartungspersonal. Keine Brennstoffverträge. Die Kapazität war da, wenn Sie sie brauchten. Sie zahlten nicht dafür, wenn Sie sie nicht brauchten. Sie konnten eine kleine Werkstatt eröffnen und zu einer großen Fabrik wachsen, ohne eine Kapitalwette auf einen ungewissen zukünftigen Maßstab abzuschließen.

Cloud-Computing ist dieselbe Idee, angewandt auf das Rechnen. AWS hat das Kraftwerk gebaut — eigentlich Tausende von Kraftwerken in Dutzenden von Ländern, betrieben von Teams aus Ingenieuren, deren gesamter beruflicher Zweck darin besteht, diese Maschinen am Laufen zu halten. Unternehmen schließen sich an und zahlen für das, was sie nutzen. Die Infrastruktur ist gemeinsam genutzt, professionell gewartet und auf Abruf verfügbar. Sie hören auf, sich um die physische Ebene zu sorgen, und konzentrieren sich auf das, was Sie tatsächlich bauen.

Es gibt einen Unterschied zur Stromanalogie, der erwähnenswert ist: Strom ist eine einzige Sache. Cloud-Computing kommt in vielen Varianten. Speicher, Rechenleistung, Datenbanken, Netzwerke, maschinelles Lernen, Sicherheit — jede Art von Ressource hat ihre eigene Preisgestaltung, ihre eigenen Kompromisse und ihre eigenen passenden Anwendungsfälle. Das Netz liefert eine Sache einheitlich. AWS liefert einen Katalog von Hunderten von Diensten. Dieses Buch ist Ihr Wegweiser durch diesen Katalog, beginnend mit den Diensten, die am wichtigsten sind.

**Warum Amazon?**

Eine berechtigte Frage. Amazon begann als Buchhandlung.

Folgendes geschah: Amazon wuchs so schnell, dass sie enorme Rechenleistung für ihre
eigenen Systeme benötigten. Sie bauten Rechenzentren. Sie stellten Ingenieure ein, um
diese zu verwalten. Sie wurden sehr, sehr gut darin, Computer in großem Maßstab zu
betreiben.

Dann hatte jemand bei Amazon eine Idee: Was, wenn wir anderen Menschen Zugang zu dieser
gesamten Rechenleistung verkaufen?

Im Jahr 2006 wurde Amazon Web Services gestartet. Heute betreibt AWS einen bedeutenden
Teil des Internets. Die Website, die Sie zum Buchen von Flügen nutzen, die App, die Ihre
Lieferung verfolgt, der Streaming-Dienst, den Sie gestern Abend angeschaut haben — es ist
gut möglich, dass zumindest ein Teil davon auf AWS läuft.

Es ist kein Monopol. Google Cloud und Microsoft Azure sind ernstzunehmende Wettbewerber.
Aber AWS war zuerst da, ist groß, und darum geht es in diesem Buch.

**Das Team**

Maya baute Nimbus nicht alleine auf.

Sie rief zuerst Tom an — natürlich. Tom hatte die Tabellen, die Lieferantenkontakte und
die Beharrlichkeit, die nötig war, um eine Idee tatsächlich umzusetzen.

Tom war die Art von Mensch, die die Nutzungsbedingungen las. Nicht weil er Angst hatte, sondern weil er glaubte, dass das Verständnis dessen, was etwas tatsächlich kostet — an Geld, an Risiko, an Zeit —, der einzige Weg sei, eine gute Entscheidung zu treffen. Die Whiteboard-Spalten mit ihren wachsenden Listen von Einwänden waren kein Pessimismus. Es war Tom, der tat, was Tom immer tat: die reale Welt einpreisen, bevor er sich auf irgendetwas festlegte. Er fragte "wie viel kostet das pro Monat?" in Momenten, in denen alle anderen noch davon begeistert waren, was eine Sache leisten könnte. Es sparte dem Unternehmen regelmäßig Geld und verhinderte gelegentlich Katastrophen, bevor sie als solche kategorisiert werden konnten.

Tom kannte einen Entwickler. Leo. Vierundzwanzig Jahre alt, autodidaktisch, die Art von
Person, die schon einen Prototyp gebaut hat, bevor Sie fertig sind, das Problem zu
erklären. Er kam zu ihrem ersten Treffen mit einem Laptop und einer halbfertigen App.

"Ich habe es schon deployed — oh", sagte er und öffnete den Bildschirm. Der Ausdruck auf seinem Gesicht machte deutlich, dass er etwas Unerwartetes gefunden hatte. "Ich glaube, ich habe es irgendwo deployed."

Das hatte er. Auf einem Server, den er nicht vollständig verstand, in einer Region, die er
nicht absichtlich gewählt hatte, mit Code, der definitiv unter Last brechen würde.

Sie liebten ihn sofort.

Leo bewegte sich schnell. Manchmal zu schnell. Er hatte die Gabe des Entwicklers, Dinge zu bauen, die funktionierten, und den blinden Fleck des Entwicklers für Dinge, die *gerade jetzt* funktionierten, aber leise technische Schulden aufbauten. Er behandelte Fehlermeldungen so, wie manche Menschen Warnhinweise behandeln — informativ, aber nicht unbedingt verbindlich. Seine Standardreaktion auf ein mögliches Problem war "das wird schon passen", und er hatte oft genug recht, dass es eine Weile dauerte, bis das Team lernte, besorgt zu sein, wenn er es mit jenem bestimmten Ton beiläufiger Gewissheit sagte, der bedeutete, dass er es eigentlich nicht überprüft hatte.

Priya kam später — durch einen gemeinsamen Freund empfohlen. Informatikstudium,
Sicherheitsschwerpunkt, die Art von Person, die an Wochenendabenden Post-Mortems berühmter
Technikausfälle liest. Sie hatte bei ihrem ersten Treffen eine Frage.

"Hat sich jemand Gedanken gemacht, was passiert, wenn jemand versucht einzubrechen?"

Stille.

"Willkommen im Team", sagte Maya.

Priyas Version von Begeisterung war ein detailliertes Bedrohungsmodell. Sie genoss den Architektur-Review-Prozess wirklich. Sie war diejenige, die die AWS-Sicherheits-Whitepapers las und die relevanten Abschnitte markierte, bevor irgendjemand sie darum gebeten hatte. Sie hatte außerdem, wie das Team feststellen würde, zuverlässig recht bei den Dingen, an die sie noch nicht gedacht hatten. Sie stellte Fragen so, wie ein guter Statiker tragende Wände prüft — nicht weil sie erwartete, dass sie versagen, sondern weil der einzige Weg, ihre Tragfähigkeit zu kennen, darin besteht, genau hinzusehen und zu dokumentieren, was man findet.

"Haben wir bedacht, was passiert, wenn..." war, wie Priya die meisten ihrer Beiträge begann. Mit der Zeit verstand das Team, dass diese Frage, mehr als jede andere, der Weg war, auf dem Katastrophen verhindert wurden, bevor sie zu Vorfällen werden konnten.

Zusammen schufen die vier etwas, das funktionierte. Maya sah das Produkt. Tom überwachte die Kosten. Leo baute es. Priya sicherte es. Das Buch, das Sie lesen, ist die Aufzeichnung dessen, was sie lernten.

**Was dieses Buch ist**

Dies ist die Geschichte von Nimbus.

Nimbus begann als Restaurant-Bestellsystem und wurde zu etwas viel Größerem. Während es
wuchs, stieß es auf jedes Problem, das wachsende Software hat: Systeme, die den Traffic
nicht bewältigen konnten, Daten, die verloren gingen, Server, die im schlimmsten Moment
ausfielen, Kosten, die schneller wuchsen als der Umsatz.

Und jedes Mal, wenn sie auf ein Problem stießen, fanden sie einen AWS-Dienst, der genau
für diese Art von Problem entwickelt worden war.

Dieses Buch lehrt Sie AWS, indem es dieser Reise folgt.

Sie werden nicht nur lernen, *was* jeder Dienst tut, sondern *warum* er existiert, *wann*
man ihn einsetzt und — ebenso wichtig — *wann man ihn nicht einsetzt*. Jedes Werkzeug hat
Kompromisse. Jede Entscheidung hat Kosten. Das ist es, was Senior-Ingenieure verstehen und
was Junior-Ingenieure noch lernen.

Wenn Sie dieses Buch abgeschlossen haben, sind Sie bereit, die AWS Solutions Architect
Associate-Prüfung (SAA-C03) abzulegen. Mehr noch: Sie werden bereit sein, in ein echtes
technisches Gespräch zu gehen und sich zu behaupten.

Das ist das Versprechen.

So sieht das in der Praxis aus, Abschnitt für Abschnitt.

**Kapitel 1–5: Die Grundlagen**. Wenn Sie das Ende von Kapitel 5 erreichen, werden Sie
verstehen, was Cloud-Computing tatsächlich ist und warum es existiert, wie man kontrolliert,
wer Zugriff auf Ihr AWS-Konto hat und warum das Root-Konto Sicherheitsingenieuren Angst
einjagt, wo Ihre Server leben und warum Geografie wichtig ist, was EC2-Instanzen sind und
wie man sie dimensioniert, und wie man Dateien in der Cloud speichert, ohne sie an eine
einzelne Maschine zu binden. Diese Kapitel behandeln die Konzepte, die jeder AWS-Architekt
als selbstverständlich ansieht — die aber niemand beim ersten Mal klar genug erklärt.

**Kapitel 6–10: Daten und Skalierung**. In diesem Abschnitt geht es darum, was passiert,
wenn Ihre Anwendung wächst. Sie werden sehen, wie Nimbus an die Skalierungswand stößt — ein
Server, zu viele Nutzer, kein Raum zum Wachsen — und beobachten, wie sie es mit Load
Balancern, Auto Scaling, verwalteten Datenbanken und Caching lösen. Am Ende dieses
Abschnitts werden Sie verstehen, wie echte Produktionssysteme mit variabler Last umgehen
und warum die Datenbank fast immer der erste Engpass ist.

**Kapitel 11–17: Netzwerke und Sicherheit**. Die Konzepte hier fühlen sich abstrakt an, bis
Sie sie brauchen. VPCs, Security Groups, DNS, Zertifikatsverwaltung, Schlüsselverwaltung. Am
Ende dieses Abschnitts werden Sie verstehen, wie sich Traffic durch eine Cloud-Anwendung
bewegt und wie man ihn davon abhält, sich an Orte zu bewegen, an die er nicht sollte.

**Kapitel 18–22: Ausfallsicherheit und moderne Architektur**. Multi-Region-Design,
entkoppelte Systeme, Serverless-Computing, Container. Diese Kapitel behandeln die
Architekturmuster, die Produktionssysteme von Spielzeugprojekten unterscheiden. Sie werden
diesen Abschnitt mit dem Verständnis abschließen, warum erfahrene Architekten an Ausfälle
denken, bevor sie an Funktionen denken.

**Kapitel 23–26: Leistung und Daten**. Speicherklassen, Lifecycle-Richtlinien, Aurora und
Read Replicas, Netzwerkleistung und die Analytics-Dienste, die Rohdaten in Antworten
verwandeln. Am Ende dieses Abschnitts werden Sie verstehen, wie man ein System schneller
macht — und wie man weiß, welcher Teil davon tatsächlich langsam ist.

**Kapitel 27–30: Kostenoptimierung**. Die AWS-Preisgestaltung ist kompliziert, aber sie
folgt Prinzipien. Am Ende dieses Abschnitts werden Sie verstehen, wie man eine
AWS-Rechnung liest, wie man Kosten vorhersagt, bevor man sich auf eine Architektur
festlegt, und wie man die Optimierungen findet, die wichtig sind, im Gegensatz zu denen,
die es nicht sind.

**Kapitel 31–34: Denken wie ein Architekt**. Der letzte Abschnitt tritt von konkreten
Diensten zurück und befasst sich mit dem Denkprozess. Wann fügt man Komplexität hinzu?
Wann hält man es einfach? Wie verteidigt man eine Entscheidung, wenn es vernünftige
Alternativen gibt? Das ist der schwierigste und wertvollste Teil.


**Ein paar Dinge, bevor wir beginnen**

**Dieses Buch setzt voraus, dass Sie fast nichts über Cloud-Computing wissen.** Wenn Sie
von AWS gehört haben, es aber noch nie benutzt haben, sind Sie hier richtig. Wenn Sie noch
nie von AWS gehört haben, sind Sie ebenfalls hier richtig.

**Dieses Buch setzt nicht voraus, dass Sie Entwickler sind.** Maya ist keiner. Tom kaum.
Sie müssen keinen Code schreiben, um Architektur zu verstehen. Sie müssen Probleme und
Lösungen verstehen.

**Dieses Buch wird manchmal absichtlich falsch liegen.** Das Team wird Fehler machen. Es
wird den falschen Dienst wählen. Es wird einen Sicherheitsschritt überspringen, den es
bereuen wird. Es wird over-provisionen und under-provisionen. So werden sie lernen, und so
werden auch Sie es tun.

**Die Prüfungstipps sind echt.** Die SAA-C03 ist eine echte Prüfung. Die szenariobasierten
Fragen am Ende jedes Kapitels sind so gestaltet, dass sie wie die eigentliche Prüfung
wirken. Wenn Sie sie beantworten können, sind Sie auf dem richtigen Weg.

Und noch eine Sache.

Lesen Sie dieses Buch mit einem Bleistift, einer Notiz-App oder einer laufenden Liste von
"Ich denke, die Antwort ist..."-Momenten.

Halten Sie inne, bevor das Team eine Entscheidung trifft. Treffen Sie die Entscheidung
selbst. Lesen Sie dann weiter und sehen Sie, ob Sie denselben Kompromiss getroffen hätten.

Sie fragen sich vielleicht: Warum einem Restaurant-Startup durch ein AWS-Zertifizierungsbuch folgen? Die Antwort ist, dass abstrakte Konzepte hängen bleiben, wenn man das Problem bereits gespürt hat. Wenn Sie jedem AWS-Dienst begegnen, wird Nimbus ihn zuerst gebraucht haben.

**Wie man dieses Buch liest**

Jedes Kapitel folgt derselben Struktur. Sie werden sehen, wie das Team auf ein Problem stößt — etwas geht kaputt, etwas ist langsam, etwas skaliert nicht. Dann werden Sie beobachten, wie sie herausfinden, was tatsächlich vor sich geht. Dann erscheint der relevante AWS-Dienst, benannt und erklärt. Dann gibt es einen tieferen Einblick in die technischen Details. Dann Kompromisse, Übungen und eine Szene, die das nächste Kapitel vorbereitet.

Die Übungen am Ende jedes Kapitels kommen in drei Typen. Wiederholungsübungen prüfen, ob Sie verstanden haben, was Sie gerade gelesen haben. SAA-C03-Szenariofragen sehen aus und fühlen sich an wie echte Prüfungsfragen — lesen Sie die Hinweise, bevor Sie raten, denn die Begründung zählt genauso viel wie die Antwort. Architekturherausforderungen haben keine einzige richtige Antwort; sie existieren, um Sie das Denken üben zu lassen, nicht um das Ergebnis auswendig zu lernen.

Wenn Sie dies in erster Linie lesen, um die SAA-C03 zu bestehen, achten Sie genau auf die Abschnitte mit Prüfungstipps. Sie markieren, was die Prüfung tatsächlich testet, einschließlich häufiger Fallen und des spezifischen Vokabulars, das die Prüfung verwendet. Wenn Sie dies lesen, um praktisches Verständnis aufzubauen, sind die Architekturherausforderungen der Ort, an dem das tiefste Lernen stattfindet.

Beides ist gleichzeitig wahr: Dies ist ein Prüfungsvorbereitungsbuch und ein praktischer Leitfaden. Jedes Konzept, das in der Geschichte auftaucht, taucht auch in den Domänenzielen der Prüfung auf. Die Nimbus-Reise ist keine Dekoration. Sie ist der Lehrplan.

Eine letzte Anmerkung zu den Charakteren. Maya fragt oft "Moment — aber *warum* würden wir es so machen?". Das ist beabsichtigt. Sie ist der Stellvertreter des Lesers. Jedes Mal, wenn sie es fragt, liegt es daran, dass ein echter Lernender dasselbe fragen würde. Folgen Sie ihren Fragen aufmerksam — sie markieren die Momente, in denen die Begründung am wichtigsten ist.

Tom fragt auch oft "wie viel kostet das pro Monat?". Ebenfalls beabsichtigt. Kosten sind eine reale Einschränkung bei jeder Architekturentscheidung. Eine Antwort, die die Kosten ignoriert, ist keine vollständige Antwort. Tom sorgt dafür, dass das Team das nie vergisst.

**Eine praktische Anmerkung zum aktiven Lesen.** Dies ist kein Buch, das man passiv liest. Die Kapitel bauen aufeinander auf — Architekturentscheidungen, die in Kapitel 4 getroffen werden, schaffen Probleme, die Kapitel 7 behebt, und Kompromisse, die in Kapitel 7 akzeptiert werden, schaffen Kosten, die Kapitel 27 löst. Wenn Sie zu den Diensten vorspringen, die Sie interessieren, wird der Kontext fehlen, und die Begründung wird nicht auf dieselbe Weise ankommen.

Lesen Sie mit etwas zum Schreiben. Wenn das Team kurz davor ist, eine Entscheidung zu treffen, schließen Sie das Buch für einen Moment und treffen Sie zuerst Ihre eigene Entscheidung. Welchen Dienst würden Sie wählen? Welchen Kompromiss würden Sie akzeptieren? Lesen Sie dann weiter. Ihre Intuition mit der Entscheidung des Teams zu vergleichen — und zu verstehen, wo sie voneinander abweichen — ist der Ort, an dem das echte Lernen stattfindet.

Wenn Sie auf eine Szenariofrage am Ende eines Kapitels stoßen, lesen Sie die Hinweise erst, nachdem Sie eine Wahl getroffen haben. Die Hinweise sind darauf ausgelegt, die häufigsten falschen Antworten zu korrigieren, was bedeutet, dass sie am nützlichsten sind, nachdem Sie sich bereits auf eine Richtung festgelegt haben.

Wenn Sie dieses Buch als Teil der SAA-C03-Prüfungsvorbereitung lesen, setzen Sie sich ein Tempo, das Ihnen erlaubt, zwischen den Kapiteln zu reflektieren. Ein oder zwei Kapitel pro Tag sind effektiver als ein Wochenend-Marathon. Die Konzepte verstärken sich gegenseitig — die Prüfung testet das Denken über Dienste hinweg, nicht nur das Wissen über einzelne Dienste, und dieses Denken braucht Zeit, um sich zu festigen.

Und wenn etwas nicht klar ist: Das Team wird die Frage stellen, bevor Sie es müssen. Maya fragt genau aus diesem Grund "Moment — aber *warum* würden wir es so machen?". Wenn Sie sich von einer Entscheidung verwirrt finden, die das Team trifft, warten Sie zwei Absätze. Maya ist wahrscheinlich kurz davor, dasselbe zu fragen.

Noch eine Sache, bevor wir beginnen. Tom wird in diesem Buch durchgehend Preise nennen, weil Tom über alles Preise nennt. Diese Zahlen — zusammen mit Dienstlimits und Funktionsdetails — entsprechen der AWS-Dokumentation mit Stand Mitte 2026. AWS ändert sie häufig, und beim Preis fast immer nach unten. Die Begründung hinter jeder Entscheidung wird Bestand haben; die genauen Dollarbeträge und Limits möglicherweise nicht. Wenn es Ihr Geld ist, prüfen Sie die aktuelle AWS-Dokumentation so, wie Tom es tun würde.

**Und ein ehrlicher Vorbehalt**: Die Cloud ist nicht immer die richtige Antwort.
Für die meisten Startups und Unternehmen in der Wachstumsphase ist sie es eindeutig — die Rechnung, die Tom am Whiteboard machte, belegt das —, aber es gibt reale Situationen, von vertraulichen Daten bis hin zu massiven stabilen Workloads, in denen es gewinnt, die eigene Hardware zu besitzen. Das Team arbeitet sich im nächsten Kapitel durch diese Ausnahmen, wenn Tom darauf besteht, die Argumente gegen die Cloud zu hören, bevor er sich darauf festlegt.

## Stärken und Einschränkungen

**Stärken dieses Ansatzes**: Lernen durch eine durchgehende Erzählung gibt Konzepten einen Kontext, bevor sie Namen bekommen. Wenn Sie IAM oder RDS erreichen, haben Sie das Problem, das diese Dienste lösen, bereits gespürt — weil Nimbus es zuerst gespürt hat. Dies macht das Behalten leichter und das Denken in Kompromissen natürlicher als das Auswendiglernen von Funktionslisten.

**Zu beachtende Einschränkungen**: Dieses Buch deckt den AWS SAA-C03 Solutions Architect Associate-Lehrplan ab. Das ist ein erheblicher Umfang, aber nicht jeder AWS-Dienst — und Produktionsarchitekturen beinhalten immer Dienste und Einschränkungen, die spezifisch für Ihre Branche und Ihren Maßstab sind. Die Nimbus-Geschichte ist fiktiv; echte Startups treffen unordentlichere Entscheidungen aus unordentlicheren Gründen. Verwenden Sie dieses Buch, um das Denken aufzubauen, nicht um die Architektur zu kopieren.

## Zusammenfassung

Nimbus begann mit einem Problem, das jedes kleine Unternehmen haben könnte: Kunden, die nicht durchkamen, und niemand konnte auf einen einzigen dramatischen Fehler zeigen. Es war nur Reibung — klein, still und teuer. Die Whiteboard-Sitzung brachte keine Lösung hervor. Sie brachte eine Frage hervor, die es wert war, gestellt zu werden: Was genau ist die Cloud? Die Antwort erwies sich als wichtiger, als irgendjemand erwartet hatte.

- **Die Cloud** ist bedarfsgerechter Zugang zu Computerressourcen über das Internet — die Computer von jemand anderem, die Sie weder besitzen noch warten müssen.
- Die drei Hosting-Optionen: On-Premises (Ihre Hardware, Ihre Kosten, Ihr erforderliches Fachwissen), Hosting eines kleinen Servers durch Dritte (begrenzt, skaliert nicht), Cloud (Pay-as-you-go, skaliert mit der Nachfrage).
- On-Premises-Kosten sind real und werden oft unterschätzt: Hardware-Abschreibung, Strom, Internetkonnektivität und Wartungs-Know-how summieren sich erheblich, bevor Sie eine einzige Zeile Anwendungscode schreiben.
- **AWS** wurde 2006 gestartet, als Amazon seine Rechenzentrumsinfrastruktur für externe Kunden öffnete. Es bleibt der größte Cloud-Anbieter, gefolgt von Microsoft Azure und Google Cloud.
- Die Cloud ist nicht immer die richtige Antwort — aber für die meisten Startups und Unternehmen in der Wachstumsphase mit unvorhersehbarer Nachfrage und kleinen Teams ist sie es eindeutig.

## Prüfungstipps

*SAA-C03-Domäne: Domänenübergreifend — Grundlagen der Cloud-Konzepte*

- **Die Cloud auf der Prüfung** bedeutet bedarfsgerechtes, nutzungsbasiertes Computing über das Internet. Es ist ein Bereitstellungsmodell, keine Technologie.
- **CapEx vs. OpEx**: On-Premises-Infrastruktur ist Investitionsausgabe (CapEx — einmaliger Hardware-Kauf). Cloud ist Betriebsausgabe (OpEx — laufende Nutzungsgebühren). Prüfungsszenarien, die nach "Vermeidung von Vorabkosten" oder "Wechsel von CapEx zu OpEx" fragen, weisen auf Cloud-Adoption hin.
- **Cloud-Vorteile**: Keine Hardware-Vorabkosten, elastische Skalierung, Bezahlung nur für das, was Sie nutzen, keine physische Infrastrukturverwaltung. Szenarien mit "unvorhersehbarem Traffic" oder "kleinem Team, kein Hardware-Know-how" sind starke Signale für die Cloud.
- **On-Premises** bedeutet, eigene Hardware in der eigenen Einrichtung zu betreiben. Die Prüfung stellt On-Premises-Architekturen häufig Cloud-Alternativen gegenüber.
- **AWS ist nicht die einzige Cloud** — Azure und GCP sind echte Wettbewerber —, aber die SAA-C03-Prüfung ist AWS-spezifisch. Es wird nicht verlangt, Anbieter zu vergleichen.
- **Skaleneffekte**: AWS erzielt niedrigere Stückkosten, weil es die Nachfrage von Tausenden von Kunden bündelt. Dies ist einer der genannten Vorteile der Cloud gegenüber On-Premises im AWS-Prüfungsrahmen. Wenn Sie auf der Prüfung "Vorteil der Cloud" sehen, sind Skaleneffekte immer eine gültige Antwort.
- **Sechs Vorteile des Cloud-Computings** laut AWS-Dokumentation: feste Ausgaben gegen variable Ausgaben tauschen, von massiven Skaleneffekten profitieren, aufhören, Kapazität zu raten, Geschwindigkeit und Agilität erhöhen, aufhören, Geld für den Betrieb von Rechenzentren auszugeben, in Minuten global werden. Diese erscheinen wortwörtlich in Prüfungsfragen darüber, warum Organisationen in die Cloud wechseln.
- **Agilität auf der Prüfung** bedeutet die Fähigkeit, schnell und mit geringen Kosten pro Versuch zu experimentieren und bereitzustellen — nicht reine Geschwindigkeit. Wenn ein Szenario die Verkürzung der Markteinführungszeit oder die Ermöglichung rascher Iteration erwähnt, ist Agilität der getestete Cloud-Vorteil.

## Übungen

**Übung 1 — Wiederholung**

Erklären Sie mit eigenen Worten: Was ist "die Cloud", und warum würde ein kleines
Unternehmen sie gegenüber dem Kauf eigener Server bevorzugen?

*(Hinweis: Denken Sie daran, was Maya und Tom neben Option 1 auf dem Whiteboard
geschrieben haben.)*

**Übung 2 — SAA-C03-Szenario**

*Szenario*: Ein kleines Startup startet eine Essenslieferanwendung. Sie erwarten anfangs
wenig Traffic, aber bei erfolgreichem Produkt schnelles Wachstum. Das Gründungsteam hat
keine Erfahrung mit der Verwaltung physischer Server. Es möchte Vorabkosten minimieren und
den Betriebsaufwand für die Hardware-Wartung vermeiden.

Welcher der folgenden Ansätze erfüllt seine Anforderungen AM BESTEN?

A) Einen Cloud-Anbieter nutzen, um die Anwendung zu hosten und nur für das zu zahlen, was genutzt wird  
B) Einen dedizierten Server kaufen und die Anwendung im Büro hosten  
C) Mit einem Co-Location-Rechenzentrum zusammenarbeiten, um eigene Server dort einzubauen  
D) Die Anwendung so entwickeln, dass sie vollständig offline ohne Internetinfrastruktur läuft

**Hinweis 1**: Denken Sie daran, was das Startup *vermeiden* muss, genauso wie das, was es
haben muss.

**Hinweis 2**: Das Szenario erwähnt ausdrücklich "keine Erfahrung mit Hardware-Verwaltung"
und "Vorabkosten minimieren". Welche Option beseitigt diese Bedenken?

**Hinweis 3**: Wir haben diese Option in diesem Kapitel als Bezahlung für "die Computer von
jemand anderem" beschrieben.

**Antwort**: A

**Erklärung**: Cloud-Anbieter wie AWS bieten Pay-as-you-go-Preise ohne Hardware-Vorabkosten
an und kümmern sich um alle physischen Infrastrukturwartungen. Dies ist genau das Modell,
das für ein Startup mit ungewissem Traffic und ohne Hardware-Know-how sinnvoll ist — genau
wie Nimbus.

**Warum nicht B?** Der Kauf eines dedizierten Servers erfordert Vorabkapital, laufende
Wartung und bietet keine integrierte Skalierungsmöglichkeit bei wachsendem Traffic.

**Warum nicht C?** Co-Location löst das Platzproblem, aber das Startup muss trotzdem eigene
Server kaufen, warten und verwalten.

**Warum nicht D?** Eine Essenslieferanwendung erfordert per Definition Internetkonnektivität.

*SAA-C03-Domäne: Domänenübergreifend — Grundlagen der Cloud-Konzepte*

**Übung 3 — Architekturherausforderung** *(Optional)*

Maya möchte ihren Onkel (der das Restaurant besitzt) davon überzeugen, ein Cloud-basiertes
Bestellsystem aufzubauen. Er ist skeptisch: "Warum sollten wir Amazon jeden Monat bezahlen,
wenn wir einfach einmal einen Computer kaufen könnten?"

Wie würden Sie die Kompromisse erklären? Was sind Ihrer Meinung nach die größten Vorteile
des Cloud-Ansatzes für ein Restaurant? Und in welchem Szenario könnte es tatsächlich
sinnvoller sein, einen eigenen Computer zu kaufen?

Denken Sie darüber in Bezug auf die Analogie zum Stromnetz nach: Wann ist es für ein Unternehmen sinnvoll, einen eigenen Generator zu betreiben, statt sich an das Netz anzuschließen? Die Antwort auf diese Frage lässt sich fast direkt darauf übertragen, wann es sinnvoll ist, eigene Server zu betreiben.

*(Es gibt keine einzige richtige Antwort. Das Ziel ist, das Denken in Kompromissen zu
üben.)*

## Post-Credits-Szene

Spät in der Nacht, nachdem alle anderen nach Hause gegangen waren, saß Maya allein im
Restaurant mit ihrem Laptop.

Sie hatte die AWS-Website gefunden. Sie hatte sich durch einige Seiten geklickt. Es gab
Hunderte von aufgelisteten Diensten. Hunderte.

Sie scrollte nach unten. Und weiter. Und weiter.

Dann schloss sie den Laptop.

"Wir werden einen Plan brauchen", sagte sie zum leeren Raum.

Tom hatte ihr die Server-Preise geschickt, die er zuvor gefunden hatte. Sie las die Zahlen noch einmal: Vorabkosten, Abschreibung, Strom, Ersatzzyklen. Dann öffnete sie den AWS-Preisrechner. Sie tippte einen virtuellen Server ein — die kleinste Sorte, nur um zu sehen. Die monatliche Zahl war niedriger als die Stromrechnung für einen physischen Serverraum gewesen wäre.

Sie starrte eine Weile auf diese Zahl.

Dann schrieb sie Tom: *Wir machen die Cloud.*

Seine Antwort kam in weniger als einer Minute zurück: *Ich weiß. Ich habe auch nachgerechnet. Aber wir machen es vorsichtig.*

Sie legte ihr Telefon hin. Draußen war das Restaurant ruhig. Die Küche war dunkel. Irgendwo zwischen der Küche und der Cloud gab es ein Unternehmen, das sie aufzubauen im Begriff war.

Im nächsten Kapitel: Warum Unternehmen aufgehört haben, Server zu kaufen, und begonnen
haben, sie zu mieten — und was das verändert hat.
