# Epilog: Was Architekt bedeutet

*Dieses Kapitel ist ein Epilog. Es gibt keine Übungen, keine Prüfungstipps und keine Post-Credits-Szene – weil es kein nächstes Kapitel gibt.*

Der Ecktisch hatte das beste Licht im Café. Durch das Fenster tat der Nachmittag etwas Langsames und Gemächliches mit der Straße draußen.

Maya hatte Tee bestellt. Tom hatte Espresso bestellt. Priya hatte etwas bestellt, das sie nur als „das, was sie gerade machten, als ich reinkam“ beschrieb. Leo war zwanzig Minuten zu spät, was beständig war.

Es waren vierzehn Monate seit der Series A vergangen.

Das Engineering-Team bestand jetzt aus neunzehn Personen. Es gab zwei Zeitzonen. Es gab ein Plattform-Team, ein Produkt-Team, ein Daten-Team. Es gab einen wöchentlichen Architektur-Review, der neunzig Minuten dauerte und normalerweise mehr brauchte. Die Finanzierung hatte getan, was Finanzierung tut: Aus den 947 Restaurantpartnern, denen Maya vor den Investoren präsentiert hatte, waren 3.000 geworden, die beiden Städte, die „im Start“ gewesen waren, waren live, zusammen mit drei weiteren, und die Plattform, die einst ein einziges Familienrestaurant bedient hatte, betrieb jetzt einen Freitagabend-Andrang von Küste zu Küste.

Leo kam mit einer Laptop-Tasche und dem Gesichtsausdruck von jemandem an, der vor 9 Uhr morgens auf drei Calls gewesen war. Er setzte sich. Er bestellte Kaffee. Er sagte: „Okay. Was machen wir?“

„Nachdenken“, sagte Maya.

„Worüber?“

Sie hatte auf der Zugfahrt herunter über etwas nachgedacht, das ein neuer Mitarbeiter in seiner ersten Woche gesagt hatte. Er war ein guter Ingenieur – sorgfältig, präzise, stellte gute Fragen. Am Freitag, am Ende seines ersten Architektur-Reviews, hatte er gesagt: „Ich möchte eines Tages Architekt werden.“

Sie hatte gesagt: „Du triffst bereits architektonische Entscheidungen.“

Er hatte unsicher ausgesehen. „Aber ich bin doch nur ein Junior.“

„Das war ich auch mal“, sagte sie. „Das war jeder in diesem Raum, einmal.“

Sie erzählte diese Geschichte am Tisch. Als sie fertig war, sagte Tom: „Was meintest du damit?“

„Ich bin nicht sicher, ob ich es gut erklärt habe“, sagte Maya. „Deshalb sind wir hier.“

Und weil die Frage sie das ganze Wochenende über begleitet hatte.

Nicht, weil es schmeichelhaft war, gefragt zu werden.

Weil es die Art von Frage war, die die Art und Weise verändert, wie jemand seine eigene Zukunft sieht, wenn man sie gut beantwortet.

**Die Frage**

Was ist ein Architekt?

Nicht der Titel. Nicht das Organigramm. Nicht die Jahre an Erfahrung, die in einer Stellenbeschreibung aufgeführt sind. Das eigentliche Ding.

In den vierzehn Monaten seit der Finanzierungsrunde waren alle vier von ihnen, formell oder informell, für architektonische Entscheidungen bei Nimbus verantwortlich geworden. Maya war offiziell die CTO. Tom war Head of Infrastructure. Priya leitete das Plattform-Team. Leo war Principal Engineer, was bedeutete, dass er bei allem konsultiert wurde und nichts Spezifisches besaß, was er sowohl befreiend als auch gelegentlich zum Wahnsinn treibend fand.

Keiner von ihnen hatte erwartet, hier anzukommen. Maya hatte Betriebswirtschaft studiert und das Restaurant ihrer Familie geführt – sie hatte nie Produktionscode geschrieben, als das hier begann. Tom hatte acht Jahre als Systemadministrator verbracht, der dachte, er würde einer bleiben. Priya hatte einen Informatik-Abschluss und ein Praktikum bei einer Sicherheitsfirma. Leo hatte sich selbst das Programmieren beigebracht und mit sechzehn seine erste App ausgeliefert.

Nichts davon war die Stellenbeschreibung für „Architekt“.

„Hier ist, was ich denke, dass es ist“, sagte Priya. „Ein Architekt ist jemand, der akzeptiert hat, dass er für die Konsequenzen seiner Entscheidungen verantwortlich ist – nicht nur für die Entscheidung selbst.“

„Erzähl mehr“, sagte Leo.

„Wenn man früh in der Karriere ist, trifft man eine Entscheidung und macht weiter. Man implementiert sie oder nicht. Jemand anderes überprüft sie, genehmigt sie, deployt sie. Die Konsequenz, falsch zu liegen, ist, dass jemand weiter oben den Fehler abfängt.“

„Und später?“

„Später ist niemand mehr weiter oben. Die Entscheidung wird ausgeliefert. Die Konsequenz ist die Produktion.“

Tom nickte langsam. „Das ist der Moment, in dem man anfängt, anders zu denken. Nicht weil man mehr weiß – obwohl man das tut –, sondern weil sich der Blast Radius des Falschliegens verändert hat.“

**Vom Junior zum Architekten: Die echte Entwicklung**

Die Entwicklung vom Junior-Ingenieur zum Architekten ist keine gerade Linie angesammelten Wissens. Es ist eine Reihe von Verschiebungen darin, wie man seine Arbeit versteht.

*Junior-Ingenieure* fragen: Wie bringe ich das zum Laufen? Ihre primäre Frage ist die Implementierung. Gegeben eine Anforderung, wie erzeuge ich ein funktionierendes System? Das ist die wesentliche erste Fähigkeit. Alles andere ruht darauf.

*Mid-Level-Ingenieure* fragen: Wie bringe ich das korrekt zum Laufen? Die Frage erweitert sich, um Korrektheit einzuschließen – nicht nur „läuft es“, sondern „behandelt es die Randfälle, die Fehlerbedingungen, die unerwarteten Eingaben“. Sie beginnen, über Tests nachzudenken. Sie beginnen, über Wartung nachzudenken.

*Senior-Ingenieure* fragen: Wie bringe ich das korrekt *und* nachhaltig zum Laufen? Der Zeithorizont erweitert sich. Sie denken an den Ingenieur, der diesen Code in einem Jahr lesen wird. Sie denken an das System, das die zehnfache aktuelle Last tragen wird. Sie denken daran, was passiert, wenn sich eine Abhängigkeit ändert.

*Staff- und Principal-Ingenieure* fragen: Warum bauen wir das überhaupt? Sie treten von der Implementierung zurück und hinterfragen die Prämisse. Ist das das richtige Problem zu lösen? Ist das der richtige Zeitpunkt, es zu lösen? Gibt es einen einfacheren Ansatz, der Raffinesse im Austausch für Überlebensfähigkeit aufgibt?

*Architekten* fragen: Was bricht zuerst, wie wissen wir es, und was tut jemand um 3 Uhr morgens, wenn es passiert?

„Die 3-Uhr-morgens-Frage“, sagte Leo. „Carlos hat die verwendet.“

„Weil sie stimmt“, sagte Priya. „Das ist der Test. Kannst du das Runbook schreiben? Verstehst du die Ausfallmodi gut genug, um die Schritte für jemanden zu schreiben, der halb verschlafen und unter Druck ist?“

**Was sich nicht ändert**

Es gibt Dinge, die Architekten wissen und Junior-Ingenieure nicht. Dienstspezifisches Verhalten. Ausfallcharakteristika im großen Maßstab. Die organisatorische Dynamik, Entscheidungen genehmigt zu bekommen. Die Geschichte von Entscheidungen, die in ähnlichen Kontexten getroffen wurden und nicht funktionierten.

Aber das Wissen ist nicht das Entscheidende.

Das Entscheidende ist der Standard-Fragensatz. Das mentale Modell, das aktiviert wird, wenn jemand ein Problem beschreibt.

Junior-Ingenieure hören ein Problem und denken über Lösungen nach. Architekten hören ein Problem und denken über Einschränkungen, Ausfallmodi und die Lücke zwischen dem, was das Geschäft sagt, dass es braucht, und dem, was es tatsächlich braucht.

Nicht, weil sie kälter sind.

Weil sie versuchen, die Menschen zu schützen, die innerhalb der Konsequenzen leben müssen.

„Es ist nicht so, dass wir mehr wissen“, sagte Tom. „Wir stellen zuerst andere Fragen.“

Maya war eine Weile still gewesen. Sie sagte: „Als ich mit diesem neuen Ingenieur sprach, wurde mir klar, was ich eigentlich sagen wollte. Er fragte, wie man Architekt wird. Und ich wollte sagen: Fang damit an, zu bemerken, was kaputtgeht. Nicht nur, wenn etwas kaputt ist – sondern davor. Während des Designs. Während des Reviews. Frag: Was bricht zuerst? Wie werden wir es wissen? Wen rufen wir an?“

„Das ist kein Titel“, sagte Leo. „Das ist eine Gewohnheit.“

„Ja.“

**Ownership**

Das andere, darin waren sie sich einig, war Ownership.

Nicht Ownership im rechtlichen Sinne. Ownership im psychologischen Sinne: das Gefühl, dass, wenn dieses System sich verschlechtert, du derjenige sein wirst, dem es am meisten am Herzen liegt.

Früh in einer Karriere ist das nicht die erwartete Haltung. Man ist für seine Tickets, seine PRs, seine zugewiesenen Stories verantwortlich. Das System gehört jemand anderem.

Später löst sich die Grenze auf. Das System ist deines. Nicht deines allein – geteilt, immer geteilt –, aber deines in dem Sinne, dass du seine Ausfälle persönlich fühlst. Ein Produktionsvorfall um 2 Uhr morgens ist keine Unterbrechung deines Lebens. Es ist ein Teil deiner Arbeit.

„Das ist die Verschiebung, die ich niemandem hätte beibringen können“, sagte Tom. „Man muss ein paar Ausfälle fühlen. Man muss derjenige sein, der den Ausfallmodus nicht abgefangen hat, bevor er die Produktion traf. Dann ändert sich die Frage.“


Das andere, was sie an der Verschiebung bemerkten, war, dass sie nicht zu einem bestimmten Moment passierte, sondern über eine Reihe von Vorfällen hinweg.

Für Tom war es das erste Mal gewesen, dass ein ungetaggtes EBS-Volume auf der Rechnung auftauchte und niemand wusste, wofür es war. Er hatte zwei Stunden damit verbracht, es zurückzuverfolgen. Er hatte es gefunden. Er hatte es gelöscht. Und dann – statt weiterzumachen – hatte er eine Richtlinie über Tagging geschrieben und einen weiteren Nachmittag damit verbracht, sicherzustellen, dass der Rest der Infrastruktur ihr folgte. Niemand hatte ihn gebeten, das zu tun. Er hatte es getan, weil ihn der Gedanke, es nicht zu tun, gestört hatte.

Für Priya war es das erste Mal gewesen, dass sie um 2 Uhr morgens für einen GuardDuty-Befund alarmiert worden war. Zuerst war sie verärgert gewesen. Dann hatte sie den Befund gelesen. Ein IAM-Benutzer hatte 47 fehlgeschlagene API-Aufrufe an einen Endpunkt getätigt, auf den er normalerweise nicht zugriff. Es stellte sich als ein fehlkonfiguriertes Automatisierungsskript heraus. Aber die 20 Minuten, die sie damit verbrachte, den Befund zurückzuverfolgen, endeten damit, dass sie sich fragte: Wenn das eine tatsächliche Kompromittierung gewesen wäre, was hätten wir sehen können? Die Antwort war: sehr wenig. Sie hatte den nächsten Sprint damit verbracht, die Logging- und Alarmierungsinfrastruktur aufzubauen, die diese Frage beantwortet hätte.

Für Leo war es das Benachrichtigungssystem gewesen. Nicht während des Vorfalls – während der zwei Wochen danach. Die Art, wie er nachts über die Architektur nachgedacht hatte, nicht weil jemand zusah, sondern weil etwas in ihm nicht loslassen konnte, bis er verstand, was er falsch gebaut hatte und warum.

Keinem von ihnen war gesagt worden, sich so sehr zu kümmern. Es war auf die Weise gekommen, auf die die meisten wichtigen Dinge kommen: allmählich, ohne Ankündigung, mitten in gewöhnlicher Arbeit.


„Manche Leute machen diese Verschiebung nicht“, sagte Priya. „Gute Ingenieure. Exzellente Ingenieure. Sie leisten exzellente Arbeit innerhalb eines definierten Rahmens und sind innerhalb dessen sorgfältig und zuverlässig. Sie fühlen die Ownership nicht. Das ist kein moralisches Versagen – es ist nur eine andere Beziehung zur Arbeit.“

„Und Architekten müssen sie fühlen“, sagte Maya.

„Architekten fühlen sie standardmäßig“, sagte Priya. „Selbst wenn sie nicht im Dienst sind. Besonders dann.“

**Technische Breite vs. Tiefe**

Es gibt eine Frage, die in jedem Architektur-Interview gestellt wird: Bist du ein Generalist oder ein Spezialist?

Die ehrliche Antwort ist: Keines von beiden allein ist ausreichend.

Architekten brauchen genug Tiefe, um zu wissen, was sie nicht wissen – um zu erkennen, wenn ein Problem am Rand ihres Wissens liegt, wann sie jemanden mit spezifischerer Expertise hinzuziehen müssen. Man kann nicht wissen, wann man einen Datenbankexperten rufen muss, wenn man Datenbanken nicht gut genug versteht, um zu wissen, was einem fehlt.

Und Architekten brauchen genug Breite, um Dinge zu verbinden. Die Systeme, die sie entwerfen, erstrecken sich über Domänen: Speicher und Compute und Netzwerk und Sicherheit und Beobachtbarkeit und Kosten. Entscheidungen in einem Bereich haben Konsequenzen in einem anderen. Man kann Netzwerkkosten nicht optimieren, ohne das Anwendungsverhalten zu verstehen. Man kann kein Datenmodell entwerfen, ohne Zugriffsmuster zu verstehen. Man kann kein Bereitstellungsmodell wählen, ohne Ausfallmodi zu verstehen.

„Es ist nicht Tiefe oder Breite“, sagte Leo. „Es ist Tiefe in ein paar Dingen und Bewusstsein für alles.“

„T-förmig“, sagte Priya.

„Ich habe diese Metapher immer gehasst“, sagte er. „Aber ja.“

**Kompromiss-Denken**

Das Häufigste, was Architekten sagen, ist: es kommt darauf an.

Der Fehler ist, es zu sagen, ohne den Satz zu beenden.

*Es kommt auf das Zugriffsmuster an.* Es kommt auf den Maßstab an. Es kommt auf die Ausfallkonsequenz an. Es kommt auf die operative Kapazität des Teams an. Es kommt auf die Kostenbeschränkung an. Es kommt darauf an, wie lange man erwartet, dass das System in seiner aktuellen Form bleibt.

Den Satz zu vervollständigen ist die Arbeit. Jeder vervollständigte Satz offenbart eine Dimension des Problems, die zuvor unsichtbar war. Jede sichtbar gemachte Dimension ist eine Entscheidung, die bewusst statt zufällig getroffen werden kann.

Priya hatte vor einigen Monaten eine Liste der Entscheidungen geschrieben, die Nimbus zufällig getroffen hatte – nicht böswillig, nicht fahrlässig, sondern ohne vollständig zu verstehen, dass die Entscheidung getroffen wurde. Sie sah sie sich manchmal an. Es war ein nützliches Dokument.

„Die besten architektonischen Entscheidungen, die ich gesehen habe“, sagte sie, „sind die, bei denen jemand sagte: Hier sind die vier Optionen, hier sind die Kompromisse, hier ist, was ich empfehle, hier ist, was mich dazu bringen würde, die Empfehlung zu ändern.“

„Ein ADR“, sagte Leo.

„Ein ADR“, stimmte sie zu. „Oder einfach ein Satz in einer Slack-Nachricht. Das Format spielt keine Rolle. Die Begründung schon.“

„Weil die Begründung überlebt, selbst wenn die Entscheidung erneut betrachtet wird“, sagte Tom.

„Weil die Begründung das Wissen ist“, sagte Maya. „Die Entscheidung ist nur die Ausgabe.“

**Was Seniorität nicht ist**

Es ist nicht die Betriebszugehörigkeit. Man kann zehn Jahre irgendwo arbeiten und kein architektonisches Urteilsvermögen entwickeln. Man kann drei Jahre dabei sein und wie ein Architekt denken. Die Zeit korreliert schwach mit dem Ding.

Es ist nicht, alles zu wissen. Es gibt Dienste im AWS-Katalog, die keiner von ihnen je verwendet hatte – spezialisierte Angebote für bestimmte Branchen, Features angekündigt und noch nicht gebraucht. Das ist in Ordnung. Der Katalog ist riesig. Die Aufgabe ist nicht enzyklopädisches Wissen; es ist prinzipielles Denken aus dem, was man weiß.

Es ist nicht die Abwesenheit von Zweifel. Architekten zweifeln ständig. Sie halten ihre Entscheidungen lockerer als Junior-Ingenieure, weil sie genug gute Entscheidungen in unerwarteten Umständen scheitern gesehen haben, um zu wissen, dass Selbstvertrauen situationsabhängig ist. „Ich bin zuversichtlich in dieser Sache gegeben die aktuellen Einschränkungen“ ist die korrekte Haltung. Nicht „Ich habe recht“.

Es ist nicht die Unfähigkeit, falsch zu liegen. Carlos hatte ihnen in diesem ersten Architektur-Review von einem System erzählt, das er entworfen hatte und das katastrophal versagt hatte, weil er die Ausfallmodus-Analyse falsch gemacht hatte. Er beschrieb es schlicht, ohne Abwehrhaltung. „Ich habe es übersehen“, sagte er. „Wir haben daraus gelernt. Das nächste System hatte diesen Ausfallmodus nicht.“

Es ist nicht die Gewissheit über die Zukunft. Die erfahrensten Architekten sind am bequemsten damit zu sagen: Ich weiß nicht, wie sich das bei 10-fachem Traffic verhalten wird. Lass es uns testen. Die Bereitschaft, Unsicherheit zuzugeben – und Systeme zu entwerfen, die das Falschliegen überleben können –, ist ein Zeichen von Reife, nicht von Schwäche.

„Das hat ihn vertrauenswürdig gemacht“, sagte Maya, als sie die Geschichte dem neuen Mitarbeiter erzählte. „Nicht, dass er nie falsch gelegen hätte. Dass er falsch gelegen hatte, verstanden hatte, warum, und es weitergetragen hatte.“

**Der Übergang zum Senior**

Für jeden, der dies liest und noch Junior oder Mid-Level ist, der auf dem Weg zu dieser Art des Denkens ist:

Der Übergang ist kein Test, den man besteht. Es ist eine Haltung, die man allmählich annimmt und dann nicht aufgibt.

Fang an, die Ausfallfrage zu stellen. In jedem Design, in jedem Review, für jedes System, das du berührst: *Was bricht zuerst?* Nicht hypothetisch – geh es durch. Folge der Kette. Der Load Balancer bekommt eine Anfrage. Der Anwendungsserver verarbeitet sie. Die Datenbank empfängt die Abfrage. Was bricht zuerst unter Last? Was bricht zuerst, wenn eine Abhängigkeit langsam ist? Was bricht zuerst bei 10-fachem aktuellem Traffic?

Fang an, Dinge über ihre Auslieferung hinaus zu besitzen. Wenn du etwas deployst, übergib es nicht und mach weiter. Beobachte es eine Woche lang. Sieh dir die Metriken an. Sieh dir die Fehlerprotokolle an. Sieh dir die Kosten an. Frag: Verhält sich dieses System so, wie ich es erwartet habe? Wenn nicht, warum nicht?

Fang an, Kompromisse explizit zu machen. Wenn du einen Ansatz wählst, artikuliere, warum du die Alternativen abgelehnt hast. Schreib es auf, auch wenn nur kurz. „Ich habe X über Y gewählt, weil Z.“ Diese Artikulation ist der Anfang architektonischen Denkens.

Fang an, Post-Mortems als Bildung zu behandeln, nicht als Strafverfolgung. Jeder Vorfall ist eine Fallstudie. Lies die öffentlichen – AWS, Cloudflare, Stripe, GitHub veröffentlichen sie alle. Lies die internen. Frag: Was war der Ausfallmodus? Welche Annahme stellte sich als falsch heraus? Was hätte ich anders gemacht?

Die Entwicklung vom Junior zum Architekten handelt nicht in erster Linie davon, was man weiß. Sie handelt davon, was man bemerkt.

**Der Blick vom Ecktisch**

Der Kaffee war ausgetrunken. Das Nachmittagslicht durch das Fenster hatte sich verschoben, während sie redeten – so wie es das tut, wenn man aufhört, es zu bemerken.

Leo sagte: „Ich denke an diesen ersten Vorfall. Den, bei dem die Datenbank während des Abend-Andrangs ausfiel und wir kein Runbook und keine Überwachung hatten und vierzig Minuten damit verbrachten, nicht zu wissen, was los war.“

„Wir dachten, es sei die Anwendung“, sagte Priya.

„Wir dachten, es sei das CDN“, sagte Tom.

„Es war der Datenbank-Connection-Pool“, sagte Maya. „Und keiner von uns wusste, zuerst dort nachzusehen.“

„Das ist es, woran ich denke“, sagte Leo. „Nicht weil es peinlich war. Weil ich immer noch die Lücke zwischen dem, was ich damals wusste, und dem, was ich jetzt weiß, fühlen kann. Und mir ist bewusst, dass ich in fünf Jahren dieselbe Lücke zwischen jetzt und dann fühlen werde.“

„Das ist das richtige Gefühl“, sagte Priya.

„Gibt es einen Namen dafür?“

„Kalibrierte Demut“, sagte sie. „Zu wissen, was man nicht weiß. Was zuerst erfordert, zu wissen, was man weiß.“


Dann sagte Leo etwas, das ihm schon eine Weile auf der Brust gelegen hatte.

„Darf ich euch den erzählen, an den ich am meisten denke?“

Niemand sagte ihm, er solle es nicht.

„Das Benachrichtigungssystem“, sagte er. „Die SQS-Queue. Die, die ich gebaut habe, als wir 40 Restaurants hatten.“

Priya sah ihn an. Sie kannte diese Geschichte. Sie war diejenige gewesen, die sie behoben hatte.

„Führ uns durch“, sagte Maya.

Leo hatte das Restaurant-Benachrichtigungssystem an einem langen Wochenende während des Series-Seed-Pushes gebaut. Die Anforderung war einfach: Wenn eine Bestellung aufgegeben wird, das Restaurant sofort benachrichtigen. Der Mechanismus, den er wählte, war SQS – eine Standard-Queue, eine Lambda-Funktion als Consumer, Standard-Concurrency-Einstellungen. Es hatte sofort, zuverlässig und ohne Probleme funktioniert – mehr als zwei Jahre lang, während 40 Restaurants still zu Hunderten wurden, und Hunderte zu Tausenden.

Bis sie 3.000 Restaurants hatten.

„Der Freitags-Andrang bei 3.000 Restaurants“, sagte Leo. „Zu dem Zeitpunkt erzeugte jede Bestellung eine Handvoll Nachrichten – die Neue-Bestellung-Benachrichtigung, die Bestätigung, das Update zur Abholbereitschaft. Um 18 Uhr nahm die Queue etwa 2.000 Nachrichten pro Minute auf. Normalerweise war das nichts: Jede Invocation war in unter zwei Sekunden fertig, also hatten wir nie mehr als sechzig oder siebzig Lambdas gleichzeitig laufen. Aber an diesem Freitag verschlechterte sich der Tablet-Push-Provider. Aufrufe, die zwei Sekunden gedauert hatten, begannen zu hängen, bis sie das 30-Sekunden-Timeout der Funktion erreichten.“

„Und die Lambda begann zu drosseln“, sagte Priya.

„Das ist die Rechnung, die niemand macht, bis es wehtut“, sagte Leo. „Concurrency ist Ankunftsrate mal Dauer. Dreiunddreißig Nachrichten pro Sekunde mal zwei Sekunden sind etwa siebzig gleichzeitige Ausführungen. Dreiunddreißig Nachrichten pro Sekunde mal dreißig Sekunden sind tausend – jede Einheit an Concurrency, die das Konto hatte. Das kontoweite Standardlimit liegt bei 1.000 gleichzeitigen Ausführungen. Wir hatten nie darüber nachgedacht, weil wir bei 40 Restaurants nirgendwo in der Nähe davon waren. Bei 3.000 Restaurants an einem Freitag um 18 Uhr, mit einer langsamen nachgelagerten Abhängigkeit, erreichten wir es in sieben Minuten.“

Wenn eine Lambda-Funktion das Concurrency-Limit erreicht, verarbeitet sie keine zusätzlichen Nachrichten. Die Nachrichten bleiben in der SQS-Queue. Bei einer Standard-Queue versucht SQS es weiter – aber es gibt keine zusätzliche Concurrency, um sie zu verarbeiten. Die Nachrichten stapeln sich. Die Benachrichtigungen stauen sich. Restaurants bekommen die Bestellbenachrichtigungen nicht. Die Küchentimer starten nicht. Bestellungen kommen zu spät oder werden verpasst.

„Wie lange, bevor Restaurantpartner anriefen?“, fragte Tom.

„Elf Minuten, nachdem die Drosselung begonnen hatte“, sagte Leo. „Wir hatten 430 Benachrichtigungen aufgestaut.“

„Was hast du zuerst getan?“, fragte Maya.

Leo hatte den Anstand, leicht verlegen auszusehen. „Ich habe das Lambda-Timeout von 30 Sekunden auf 5 Minuten erhöht. Die Idee war, dass, wenn jede Invocation länger laufen könnte, sie vielleicht den Rückstau schneller abarbeiten würde.“

„Das machte es schlimmer?“, fragte Tom.

„Es machte es schlimmer. Die aufgestauten Nachrichten wurden erneut versucht, während die ursprünglichen Invocations mit dem verlängerten Timeout noch liefen. Ich hatte eine Situation geschaffen, in der die bereits am Limit befindliche Concurrency von langlaufenden Funktionen gehalten wurde, während neue Nachrichten ankamen und nicht verarbeitet wurden.“

„Ich erinnere mich“, sagte Priya leise.

„Mein zweiter Versuch“, fuhr Leo fort. „Ich fügte eine zweite Lambda-Funktion hinzu. Dieselbe Queue, neuer Consumer. Dachte, wenn ich die Consumer verdopple, würde ich den Durchsatz verdoppeln.“

„Aber Concurrency ist pro Konto, nicht pro Funktion“, sagte Priya.

„Korrekt. Zwei Lambda-Funktionen, beide am selben kontoweiten Concurrency-Deckel. Gesamtdurchsatz: identisch zu einer Funktion. Rückstau: weiterhin wachsend. Die zweite Lambda teilte nur dieselbe begrenzte Kapazität zwischen zwei Funktionen auf.“

Tom starrte auf den Tisch. „Was ist die korrekte Lösung?“

„Priya hat sie gefunden“, sagte Leo.

„Um 2 Uhr morgens“, fügte Priya hinzu. Sie hatte die Lambda-Dokumentation im Bett gelesen, die Bildschirmhelligkeit ganz heruntergedreht.

„Reserved Concurrency“, sagte sie. „Jeder Lambda-Funktion kann Reserved Concurrency zugewiesen werden – ein Teil des gesamten Concurrency-Limits des Kontos, der ausschließlich für diese Funktion garantiert und für keine andere Funktion verfügbar ist. Wenn ich der Benachrichtigungs-Lambda 400 Reserved-Concurrency-Einheiten gäbe, hätten die anderen Lambdas des Kontos 600 Einheiten zu teilen, und die Benachrichtigungs-Lambda könnte nicht von anderen Funktionen ausgehungert werden.“

„Das hat es behoben?“, fragte Tom.

„Es behob das Aushungerungsproblem“, sagte Priya. „Aber es gab immer noch eine Durchsatzobergrenze für die Benachrichtigungs-Lambda. 400 gleichzeitige Invocations, jede eine Nachricht nach der anderen verarbeitend. Bei zwei Sekunden pro Nachricht ist das reichlich für 2.000 Nachrichten pro Minute. Aber in dem Moment, in dem sich eine nachgelagerte Abhängigkeit über zwölf Sekunden pro Aufruf hinaus verlangsamt, bricht uns dieselbe Rechnung, die uns bei 1.000 brach, bei 400. Die 400 Einheiten hatten genug Reserve für den Traffic jener Woche. Für jene Woche.“

„Es war ein temporärer Fix“, sagte Leo.

„Es war der dritte Fix in einer eskalierenden Reihe“, sagte Priya. „Jeder Fix adressierte ein Symptom. Keiner davon adressierte die Architektur.“

Die korrekte Lösung – die sie über die folgenden zwei Wochen bauten – hatte drei Teile.

„FIFO-Queues“, sagte Priya, „nach Restaurant-Tier. Restaurants wurden in drei Tiers segmentiert: Enterprise, Growth und Standard. Jedes Tier bekam seine eigene SQS-FIFO-Queue. Jede Queue hatte ihren eigenen Lambda-Consumer mit seiner eigenen Reserved-Concurrency-Zuteilung.“

„Warum FIFO?“, fragte Tom. „Standard-Queues sind günstiger.“

„Weil FIFO-Queues die Reihenfolge innerhalb einer Message Group garantieren“, sagte Priya. „Für Restaurantbenachrichtigungen ist die Reihenfolge der Nachrichten wichtig. Wenn ein Bestell-Update vor der ursprünglichen Bestellbenachrichtigung ankommt, sieht das Restaurant eine verwirrende Abfolge. FIFO-Queues, mit einer Message Group ID pro Restaurant, garantieren, dass die Nachrichten jedes Restaurants in der Reihenfolge verarbeitet werden, in der sie gesendet wurden.“

„Und die Tier-Trennung?“, fragte Tom.

„Isolierte Blast Radii“, sagte Priya. „Wenn die Enterprise-Tier-Queue ein Verarbeitungsproblem hat, beeinträchtigt es das Standard-Tier nicht. Enterprise-Restaurants haben die höchsten SLA-Anforderungen – sie sind diejenigen, bei denen eine verzögerte Benachrichtigung Nimbus echtes Geld in Vertragsstrafen kostet. Sie zu trennen stellt sicher, dass ihre Queue nicht von Standard-Restaurant-Traffic gefüllt werden kann.“

„Und die DLQ“, fügte Leo hinzu.

„Eine Dead-Letter-Queue an jeder FIFO-Queue“, sagte Priya. „Nachrichten, die die Verarbeitung nach drei Versuchen nicht schaffen, werden in die DLQ verschoben. Ein CloudWatch-Alarm feuert, wenn die DLQ-Tiefe null überschreitet. Der diensthabende Ingenieur überprüft die fehlgeschlagenen Nachrichten und bestimmt, ob sie eine erneute Verarbeitung oder Untersuchung brauchen.“

„Vor dem DLQ-Alarm“, sagte Leo, „erfuhren wir von fehlgeschlagenen Benachrichtigungen, wenn ein Restaurantpartner anrief. Der DLQ-Alarm bedeutet, dass wir es vor dem Anruf erfahren.“

Das Gespräch war einen Moment lang still geworden. Das Nachmittagslicht hatte seine langsame Verschiebung durch das Cafés-Fenster fortgesetzt.

„Woran ich denke“, sagte Leo, „ist die Lücke zwischen dem, was ich gebaut habe, und dem, was ich jetzt bauen würde. Nicht als Selbstkritik. Als Maß. Weil diese Lücke ist, woran ich weiß, dass ich etwas gelernt habe.“

„Was hättest du von Anfang an gebaut?“, fragte Maya.

„Gestufte FIFO-Queues von Tag eins an“, sagte Leo. „Nicht, weil ich drei Tiers gebraucht hätte, als wir 40 Restaurants hatten. Sondern weil das Design für das, was wir wurden, richtig gewesen wäre. Die Kosten von drei Queues statt einer waren vernachlässigbar. Die Kosten einer Queue, die im großen Maßstab versagte, waren drei Stunden Freitagabend-Vorfälle und zwei Wochen Behebung.“

„Du wusstest nicht, dass du auf 3.000 Restaurants skalieren würdest, als du es gebaut hast“, sagte Priya. Es war keine Verteidigung. Es war eine Klarstellung.

„Nein“, sagte Leo. „Aber ich wusste, dass wir ein Benachrichtigungssystem für eine Restaurantplattform mit Wachstumsambitionen bauten. Die Frage, die ich nicht stellte, war: Wie sieht das bei 10x aus? Bei 100x? Was ist das Erste, das bricht, wenn wir größer werden?“

„Das Concurrency-Limit“, sagte Tom.

„Das Concurrency-Limit“, stimmte Leo zu. „Das in der Lambda-Dokumentation steht. Ich hatte die Dokumentation gelesen. Ich hatte nur nie die Frage gestellt, die den relevanten Abschnitt relevant gemacht hätte.“

„Das ist die architektonische Gewohnheit“, sagte Priya. „Die Frage, die die richtige Dokumentation relevant macht. Man kann nicht jede Zeile lesen. Aber wenn man fragt ‚was bricht im großen Maßstab?‘, liest man am Ende die richtigen Zeilen.“

Maya hatte eine Weile zugehört, ohne zu sprechen. Sie sagte: „Der Grund, warum ich heute darüber reden wollte – der Grund, warum ich euch alle gebeten habe zu kommen –, ist, dass ich versucht habe zu verstehen, was wir den neuen Ingenieuren beibringen können. Nicht die Dienste. Die Dienste werden sie lernen. Was ist das Ding, das länger zu lernen braucht, als es sollte?“

Niemand antwortete sofort.

„Diese Frage“, sagte Leo schließlich. „Die danach, was im großen Maßstab bricht. Wir stellen sie jetzt reflexartig. Wir stellten sie nicht reflexartig, als wir anfingen. Ich weiß nicht, wie man jemandem beibringt, sie reflexartig zu stellen, ohne ihn zuerst ein paar Dinge bauen zu lassen, die im großen Maßstab brechen.“

„Kann man nicht“, sagte Tom. „Aber man kann die Umgebung sicherer für das Lernen machen. Man kann Systeme bauen, in denen der Ausfall sichtbar, eingegrenzt und nachverfolgbar ist. Man kann sicherstellen, dass das Post-Mortem ein Lerndokument ist, kein Schulddokument. Man kann die Maßstabsfrage im Code Review stellen, auch wenn man die Antwort kennt, weil die Person, die den Code schreibt, sie gestellt hören muss.“

„Und man kann Geschichten erzählen“, sagte Priya. „Wie diese.“


Maya beobachtete die Straße.

„Der neue Ingenieur fragte, wie man Architekt wird“, sagte sie. „Was ich hätte sagen sollen, ist: Werde jemand, der sich darum kümmert, was kaputtgeht. Alles andere ergibt sich daraus.“

Niemand sprach einen Moment lang.

Es war eine dieser Stillen, die nicht gefüllt werden muss.

Draußen überquerte jemand die Straße und trug zwei Papiertüten mit Essen zum Mitnehmen. Tom bemerkte es zuerst und lachte.

„Der Kreis schließt sich“, sagte er.

Maya lächelte. „Ja“, sagte sie. „Der Kreis schließt sich.“

---

## Die Entwicklung vom Junior zum Architekten

| Stufe           | Primäre Frage                                       | Zeithorizont   | Ownership    |
|-----------------|--------------------------------------------------------|----------------|--------------|
| Junior          | Wie bringe ich das zum Laufen?                               | Aktuelles Ticket | Meine PR        |
| Mid-Level       | Wie mache ich das korrekt und wartbar?           | Dieser Sprint    | Meine Komponente |
| Senior          | Wie hält sich das über die Zeit und im großen Maßstab?          | Nächstes Quartal   | Dieser Dienst |
| Staff/Principal | Warum bauen wir das, und gibt es einen einfacheren Weg? | Nächstes Jahr      | Dieses System  |
| Architekt       | Was bricht zuerst, wie wissen wir es, und was tun wir?  | Unbegrenzt     | Das Produkt  |

---

## Was sich ändert, während man wächst

**Von der Implementierung zur Konsequenz.** Junior-Ingenieure fragen „funktioniert es?“ Senior-Ingenieure fragen „funktioniert es weiterhin?“ Architekten fragen „was passiert, wenn es aufhört?“

**Von Features zu Systemen.** Junior-Ingenieure fügen Features hinzu. Architekten denken darüber nach, was das System wird, wenn zehn Features hinzugefügt wurden. Die Form zukünftiger Entscheidungen ist bereits in aktuellen Entscheidungen sichtbar.

**Von Korrektheit zu Kompromissen.** Es gibt normalerweise eine „korrekteste“ Implementierung eines Features. Es gibt selten eine „korrekteste“ Architektur. Es gibt Kompromisse, und die besten Architekten treffen sie explizit und bewusst statt zufällig.

**Von Selbstvertrauen zu Kalibrierung.** Junior-Ingenieure sind oft entweder zu wenig selbstbewusst (unsicher über korrekte Entscheidungen) oder zu selbstbewusst (sich nicht bewusst, was sie nicht wissen). Erfahrene Architekten sind kalibriert: Sie kennen den Umfang und die Grenzen ihres Wissens und halten ihre Schlussfolgerungen auf dem angemessenen Maß an Gewissheit.

**Von Wissen zu Urteilsvermögen.** Wissen ist, zu wissen, dass DynamoDB Partition Keys verwendet. Urteilsvermögen ist, zu wissen, dass das Zugriffsmuster dieses spezifischen Anwendungsfalls Hot Partitions verursachen wird, und dass die geschäftlichen Auswirkungen dieses Ausfallmodus im prognostizierten Maßstab bedeuten, dass man das Design jetzt überdenken sollte.

---

*Vielen Dank fürs Lesen.*

*Die AWS-Solutions-Architect-Associate-Prüfung (SAA-C03) ist in Pearson-VUE-Testzentren und online über deren Remote-Testsystem verfügbar. Besuchen Sie aws.amazon.com/certification, um sich zu registrieren.*

*Die Geschichte von Nimbus ist fiktiv. Die in diesem Buch beschriebenen AWS-Dienste, Preismodelle und Best Practices sind real. Beide können sich ändern – AWS aktualisiert seine Dienste häufig. Überprüfen Sie immer die aktuellen Preise und Dienstfähigkeiten auf aws.amazon.com.*

*Viel Glück.*

---

*Gleiche Zeit nächstes Jahr?*
