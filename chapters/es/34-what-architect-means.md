# Epílogo: Qué Significa Ser Arquitecto

*Este capítulo es un epílogo. No hay ejercicios, ni consejos para el examen, ni escena poscréditos, porque no hay siguiente capítulo.*

La mesa de la esquina tenía la mejor luz del café. A través de la ventana, la tarde hacía algo lento y sin prisa en la calle de afuera.

Maya había pedido té. Tom había pedido un espresso. Priya había pedido algo que describió solo como "lo que estaban preparando cuando entré." Leo llegó con veinte minutos de retraso, lo cual era consistente.

Habían pasado catorce meses desde la Serie A.

El equipo de ingeniería era ahora de diecinueve personas. Había dos zonas horarias. Había un equipo de plataforma, un equipo de producto, un equipo de datos. Había una revisión semanal de arquitectura que duraba noventa minutos y generalmente necesitaba más. La financiación había hecho lo que hace la financiación: los 947 socios restaurantes a los que Maya había presentado ante los inversores se habían convertido en 3.000, las dos ciudades que habían estado "en lanzamiento" estaban en marcha junto con tres más, y la plataforma que una vez había servido a un único restaurante familiar ahora gestionaba una hora pico de cena del viernes de costa a costa.

Leo llegó con una bolsa para portátil y la expresión de alguien que había tenido tres llamadas antes de las 9 AM. Se sentó. Pidió café. Dijo: "Bien. ¿Qué estamos haciendo?"

"Pensando", dijo Maya.

"¿Sobre qué?"

Había estado pensando, en el tren de bajada, sobre algo que un nuevo empleado había dicho en su primera semana. Era un buen ingeniero: cuidadoso, preciso, hacía buenas preguntas. El viernes, al final de su primera revisión de arquitectura, había dicho: "Algún día quiero ser arquitecto."

Ella había dicho: "Ya estás tomando decisiones arquitectónicas."

Él había parecido inseguro. "Pero solo soy un junior."

"Yo también lo era", dijo. "Todos en esta sala lo éramos, una vez."

Contó esta historia en la mesa. Cuando terminó, Tom dijo: "¿Qué quisiste decir con eso?"

"No estoy segura de haberlo explicado bien", dijo Maya. "Por eso estamos aquí."

Y porque la pregunta se había quedado con ella todo el fin de semana.

No porque fuera halagador que se la hicieran.

Porque era el tipo de pregunta que cambia la forma en que alguien ve su propio futuro si la respondes bien.

**La Pregunta**

¿Qué es un arquitecto?

No el título. No el organigrama. No los años de experiencia enumerados en una descripción de trabajo. La cosa real.

En los catorce meses desde la ronda de financiación, los cuatro se habían convertido, formal o informalmente, en responsables de las decisiones arquitectónicas en Nimbus. Maya era oficialmente la CTO. Tom era el Director de Infraestructura. Priya dirigía el equipo de plataforma. Leo era el Ingeniero Principal, lo que significaba que era consultado para todo y no tenía nada específico, algo que encontraba a la vez liberador y ocasionalmente enloquecedor.

Ninguno de ellos había esperado llegar aquí. Maya había estudiado administración de empresas y dirigido el restaurante de su familia: nunca había escrito código de producción cuando esto empezó. Tom había pasado ocho años como administrador de sistemas que pensaba que se quedaría así. Priya tenía un título en informática y unas prácticas en una empresa de seguridad. Leo se había enseñado a programar él mismo, lanzando su primera app a los dieciséis.

Ninguna de esas trayectorias era la descripción del trabajo de "arquitecto."

"Esto es lo que creo que es", dijo Priya. "Un arquitecto es alguien que ha aceptado que es responsable de las consecuencias de sus decisiones, no solo de la decisión en sí."

"Dime más", dijo Leo.

"Cuando estás al principio de tu carrera, tomas una decisión y sigues adelante. La implementas o no. Alguien más la revisa, la aprueba, la despliega. La consecuencia de equivocarte es que alguien más arriba detecte el error."

"¿Y más tarde?"

"Más tarde, nadie está más arriba. La decisión se despliega. La consecuencia es producción."

Tom asintió lentamente. "Ahí es cuando empiezas a pensar diferente. No porque sepas más, aunque lo sabes, sino porque el radio de explosión de equivocarse ha cambiado."

**De Junior a Arquitecto: La Progresión Real**

La progresión de ingeniero junior a arquitecto no es una línea recta de conocimiento acumulado. Es una serie de cambios en cómo entiendes tu trabajo.

Los *ingenieros junior* preguntan: ¿Cómo hago que esto funcione? Su pregunta principal es la implementación. Dado un requisito, ¿cómo produzco un sistema funcional? Esta es la primera habilidad esencial. Todo lo demás descansa sobre ella.

Los *ingenieros de nivel medio* preguntan: ¿Cómo hago que esto funcione correctamente? La pregunta se expande para incluir la corrección: no solo "¿funciona?" sino "¿maneja los casos límite, las condiciones de error, las entradas inesperadas?" Empiezan a pensar en las pruebas. Empiezan a pensar en el mantenimiento.

Los *ingenieros senior* preguntan: ¿Cómo hago que esto funcione correctamente *y* de manera sostenible? El horizonte temporal se extiende. Piensan en el ingeniero que leerá este código en un año. Piensan en el sistema que llevará diez veces la carga actual. Piensan en qué ocurre cuando cambia una dependencia.

Los *ingenieros staff y principal* preguntan: ¿Por qué estamos construyendo esto en absoluto? Dan un paso atrás respecto a la implementación y cuestionan la premisa. ¿Es este el problema correcto que hay que resolver? ¿Es este el momento correcto para resolverlo? ¿Hay un enfoque más simple que renuncie a la sofisticación a cambio de la supervivencia?

Los *arquitectos* preguntan: ¿Qué falla primero, cómo lo sabemos y qué hace alguien a las 3 AM cuando ocurre?

"La pregunta de las 3 AM", dijo Leo. "Carlos usó esa."

"Porque es verdad", dijo Priya. "Esa es la prueba. ¿Puedes escribir el runbook? ¿Entiendes los modos de fallo lo suficientemente bien como para escribir los pasos para alguien que está a medio dormir y bajo presión?"

**Lo que No Cambia**

Hay cosas que los arquitectos saben que los ingenieros junior no saben. El comportamiento específico de los servicios. Las características de los fallos a escala. La dinámica organizacional de conseguir que se aprueben las decisiones. La historia de decisiones tomadas en contextos similares que no funcionaron.

Pero el conocimiento no es la cosa.

La cosa es el conjunto de preguntas predeterminadas. El modelo mental que se activa cuando alguien describe un problema.

Los ingenieros junior escuchan un problema y piensan en soluciones. Los arquitectos escuchan un problema y piensan en restricciones, modos de fallo y la brecha entre lo que el negocio dice que necesita y lo que realmente necesita.

No porque sean más fríos.

Porque están tratando de proteger a las personas que tendrán que vivir dentro de las consecuencias.

"No es que sepamos más", dijo Tom. "Hacemos preguntas diferentes primero."

Maya había estado callada por un momento. Dijo: "Cuando hablé con ese nuevo ingeniero, me di cuenta de lo que realmente intentaba decir. Preguntó cómo convertirse en arquitecto. Y quería decir: empieza por notar qué se rompe. No solo cuando algo está roto, sino antes. Durante el diseño. Durante la revisión. Pregunta: ¿qué falla primero? ¿Cómo lo sabremos? ¿A quién llamamos?"

"Eso no es un título", dijo Leo. "Eso es un hábito."

"Sí."

**La Propiedad**

Lo otro, coincidieron, era la propiedad.

No la propiedad en el sentido legal. La propiedad en el sentido psicológico: la sensación de que si este sistema se degrada, tú serás el que más se preocupe.

Al principio de una carrera, esta no es la postura esperada. Eres responsable de tus tickets, tus PRs, tus historias asignadas. El sistema pertenece a otra persona.

Más tarde, el límite se disuelve. El sistema es tuyo. No solo tuyo, siempre compartido, pero tuyo en el sentido de que sientes sus fallos personalmente. Un incidente de producción a las 2 AM no es una interrupción de tu vida. Es una parte de tu trabajo.

"Ese es el cambio que no podría haber enseñado a nadie", dijo Tom. "Tienes que sentir algunos apagones. Tienes que ser el que no detectó el modo de fallo antes de que llegara a producción. Ahí es cuando cambia la pregunta."


Lo otro que notaron sobre el cambio fue que ocurría no en un momento específico, sino a lo largo de una serie de incidentes.

Para Tom, había sido la primera vez que un volumen EBS sin etiquetar apareció en la factura y nadie sabía para qué era. Había pasado dos horas rastreándolo. Lo había encontrado. Lo había eliminado. Y luego —en lugar de seguir adelante— había escrito una política sobre el etiquetado y pasó otra tarde asegurándose de que el resto de la infraestructura la siguiera. Nadie le había pedido que hiciera eso. Lo había hecho porque la idea de no hacerlo le molestaba.

Para Priya, había sido la primera vez que la habían avisado a las 2 AM por un hallazgo de GuardDuty. Al principio se había molestado. Luego había leído el hallazgo. Un usuario de IAM había hecho 47 llamadas fallidas a la API a un endpoint al que normalmente no accedía. Resultó ser un script de automatización mal configurado. Pero los 20 minutos que pasó rastreando el hallazgo terminaron con ella preguntándose: si esto hubiera sido un compromiso real, ¿qué habríamos podido ver? La respuesta era: muy poco. Había pasado el siguiente sprint construyendo la infraestructura de logging y alertas que habría respondido esa pregunta.

Para Leo, había sido el sistema de notificaciones. No durante el incidente, sino durante las dos semanas posteriores. La forma en que había pensado en la arquitectura por la noche, no porque nadie estuviera mirando, sino porque algo en él no podía dejarlo ir hasta que entendiera qué había construido mal y por qué.

A ninguno de ellos le habían dicho que se preocupara tanto. Había llegado de la forma en que llegan la mayoría de las cosas importantes: gradualmente, sin anuncio, en medio del trabajo ordinario.



"Algunas personas no hacen ese cambio", dijo Priya. "Buenos ingenieros. Excelentes ingenieros. Hacen un trabajo excelente dentro de un ámbito definido y son cuidadosos y fiables dentro de él. No sienten la propiedad. Eso no es un fallo moral: es simplemente una relación diferente con el trabajo."

"Y los arquitectos necesitan sentirla", dijo Maya.

"Los arquitectos la sienten por defecto", dijo Priya. "Incluso cuando están fuera de servicio. Especialmente entonces."

**Amplitud Técnica vs Profundidad**

Hay una pregunta que se hace en cada entrevista de arquitectura: ¿eres generalista o especialista?

La respuesta honesta es: ninguno por sí solo es suficiente.

Los arquitectos necesitan suficiente profundidad para saber lo que no saben: para reconocer cuándo un problema está en el límite de su conocimiento, cuándo traer a alguien con más experiencia específica. No puedes saber cuándo llamar a un experto en bases de datos si no entiendes las bases de datos lo suficientemente bien como para saber qué te falta.

Y los arquitectos necesitan suficiente amplitud para conectar cosas. Los sistemas que diseñan abarcan dominios: almacenamiento y cómputo y red y seguridad y observabilidad y coste. Las decisiones en un área tienen consecuencias en otra. No puedes optimizar los costes de red sin entender el comportamiento de la aplicación. No puedes diseñar un modelo de datos sin entender los patrones de acceso. No puedes elegir un modelo de despliegue sin entender los modos de fallo.

"No es profundidad o amplitud", dijo Leo. "Es profundidad en unas pocas cosas y conciencia de todo."

"En forma de T", dijo Priya.

"Siempre he odiado esa metáfora", dijo él. "Pero sí."

**Razonamiento sobre Compensaciones**

Lo más común que dicen los arquitectos es: depende.

El error es decirlo sin terminar la oración.

*Depende del patrón de acceso.* Depende de la escala. Depende de la consecuencia del fallo. Depende de la capacidad operativa del equipo. Depende de la restricción de coste. Depende de cuánto tiempo esperas que el sistema permanezca en su forma actual.

Completar la oración es el trabajo. Cada oración completada revela una dimensión del problema que anteriormente era invisible. Cada dimensión hecha visible es una decisión que puede tomarse deliberadamente en lugar de accidentalmente.

Priya había escrito una lista, hacía unos meses, de las decisiones que Nimbus había tomado accidentalmente: no maliciosamente, no negligentemente, sino sin entender completamente que se estaba tomando la decisión. La revisaba a veces. Era un documento útil.

"Las mejores decisiones arquitectónicas que he visto", dijo, "son las que alguien dijo: aquí están las cuatro opciones, aquí están las compensaciones, esto es lo que recomiendo, esto es lo que me haría cambiar la recomendación."

"Un ADR", dijo Leo.

"Un ADR", coincidió. "O solo una frase en un mensaje de Slack. El formato no importa. El razonamiento sí."

"Porque el razonamiento sobrevive incluso cuando la decisión se revisa", dijo Tom.

"Porque el razonamiento es el conocimiento", dijo Maya. "La decisión es solo el resultado."

**Lo que la Antigüedad No Es**

No es la permanencia. Puedes trabajar en algún lugar durante diez años y no desarrollar el juicio arquitectónico. Puedes llevar tres años y pensar como un arquitecto. El tiempo se correlaciona débilmente con la cosa.

No es saberlo todo. Hay servicios en el catálogo de AWS que ninguno de ellos había usado jamás: ofertas especializadas para industrias específicas, funcionalidades anunciadas y todavía no necesarias. Eso está bien. El catálogo es vasto. El trabajo no es el conocimiento enciclopédico; es el razonamiento fundamentado en lo que sabes.

No es la ausencia de duda. Los arquitectos dudan constantemente. Mantienen sus decisiones con más ligereza que los ingenieros junior, porque han visto suficientes buenas decisiones fallar en circunstancias inesperadas como para saber que la confianza es situacional. "Estoy seguro de esto dados los límites actuales" es la postura correcta. No "tengo razón."

No es la incapacidad de equivocarse. Carlos les había contado, en esa primera revisión de arquitectura, sobre un sistema que había diseñado y que había fallado catastróficamente porque había hecho mal el análisis del modo de fallo. Lo describió con llaneza, sin defensas. "No lo vi", dijo. "Aprendimos de ello. El siguiente sistema no tuvo ese modo de fallo."

No es la certeza sobre el futuro. Los arquitectos más experimentados son los más cómodos diciendo: no sé cómo se comportará esto a 10 veces el tráfico. Probémoslo. La disposición a admitir la incertidumbre —y a diseñar sistemas que puedan sobrevivir a estar equivocados— es un marcador de madurez, no de debilidad.

"Eso es lo que lo hizo digno de confianza", dijo Maya, cuando contó la historia al nuevo empleado. "No que nunca se hubiera equivocado. Que se había equivocado, entendió por qué y lo llevó adelante."

**La Transición a Senior**

Para cualquiera que lea esto que todavía sea junior o de nivel medio, que esté en el camino hacia este tipo de pensamiento:

La transición no es un examen que apruebas. Es una postura que adoptas, gradualmente, y que luego no abandonas.

Empieza a hacer la pregunta del fallo. En cada diseño, en cada revisión, para cada sistema que tocas: *¿qué falla primero?* No hipotéticamente: recórrelo. Sigue la cadena. El balanceador de carga recibe una solicitud. El servidor de la aplicación la procesa. La base de datos recibe la consulta. ¿Qué falla primero bajo carga? ¿Qué falla primero si una dependencia es lenta? ¿Qué falla primero a 10 veces el tráfico actual?

Empieza a poseer las cosas más allá de su entrega. Cuando despliegas algo, no lo entregues y sigas adelante. Obsérvalo durante una semana. Mira las métricas. Mira los registros de errores. Mira el coste. Pregunta: ¿está este sistema comportándose de la manera que esperaba? Si no, ¿por qué no?

Empieza a hacer explícitas las compensaciones. Cuando eliges un enfoque, articula por qué rechazaste las alternativas. Escríbelo, aunque sea brevemente. "Elegí X sobre Y porque Z." Esa articulación es el comienzo del razonamiento arquitectónico.

Empieza a tratar los post-mortems como educación, no como enjuiciamiento. Cada incidente es un estudio de caso. Lee los públicos: AWS, Cloudflare, Stripe, GitHub todos los publican. Lee los internos. Pregunta: ¿cuál fue el modo de fallo? ¿Qué suposición resultó ser incorrecta? ¿Qué habría hecho diferente?

La progresión de junior a arquitecto no trata principalmente de lo que sabes. Trata de lo que notas.

**La Vista desde la Mesa de la Esquina**

El café estaba terminado. La luz de la tarde a través de la ventana había cambiado mientras hablaban, de la manera que lo hace cuando dejas de notarla.

Leo dijo: "Pienso en ese primer incidente. El que ocurrió cuando la base de datos se cayó durante la hora pico de la cena y no teníamos runbook ni monitoreo y pasamos cuarenta minutos sin saber qué estaba mal."

"Pensamos que era la aplicación", dijo Priya.

"Pensamos que era la CDN", dijo Tom.

"Era el pool de conexiones de la base de datos", dijo Maya. "Y ninguno de nosotros sabía dónde mirar primero."

"Eso es lo que pienso", dijo Leo. "No porque fuera vergonzoso. Sino porque todavía puedo sentir la brecha entre lo que sabía entonces y lo que sé ahora. Y soy consciente de que en cinco años sentiré la misma brecha entre ahora y entonces."

"Ese es el sentimiento correcto que tener", dijo Priya.

"¿Hay un nombre para eso?"

"Humildad calibrada", dijo. "Saber lo que no sabes. Lo que requiere primero saber lo que sabes."


Entonces Leo dijo algo que llevaba un tiempo en su pecho.

"¿Puedo contarles el que más pienso?"

Nadie le dijo que no.

"El sistema de notificaciones", dijo. "La cola de SQS. El que construí cuando teníamos 40 restaurantes."

Priya lo miró. Conocía esta historia. Había sido ella la que la arregló.

"Cuéntanoslo", dijo Maya.

Leo había construido el sistema de notificaciones de restaurantes en un largo fin de semana durante el impulso de la ronda semilla. El requisito era simple: cuando se realizaba un pedido, notificar al restaurante de inmediato. El mecanismo que eligió fue SQS: una cola Standard, una función Lambda como consumidor, ajustes de concurrencia predeterminados. Había funcionado de inmediato, de forma fiable y sin problemas, durante más de dos años, mientras 40 restaurantes se convertían discretamente en cientos, y los cientos en miles.

Hasta que tuvieron 3.000 restaurantes.

"La hora pico del viernes con 3.000 restaurantes", dijo Leo. "Para entonces, cada pedido producía un puñado de mensajes: la notificación de nuevo pedido, la confirmación, la actualización de listo-para-recoger. A las 6 PM la cola recibía unos 2.000 mensajes por minuto. Normalmente eso no era nada: cada invocación terminaba en menos de dos segundos, así que nunca teníamos más de sesenta o setenta Lambdas ejecutándose a la vez. Pero ese viernes, el proveedor de push a las tablets se degradó. Las llamadas que tomaban dos segundos empezaron a colgarse hasta alcanzar el timeout de 30 segundos de la función."

"Y la Lambda empezó a limitarse", dijo Priya.

"Esa es la aritmética que nadie hace hasta que duele", dijo Leo. "La concurrencia es la tasa de llegada por la duración. Treinta y tres mensajes por segundo por dos segundos son unas setenta ejecuciones concurrentes. Treinta y tres mensajes por segundo por treinta segundos son mil: cada unidad de concurrencia que tenía la cuenta. El límite predeterminado a nivel de cuenta es de 1.000 ejecuciones concurrentes. Nunca habíamos pensado en ello porque con 40 restaurantes, estábamos lejísimos de él. Con 3.000 restaurantes un viernes a las 6 PM, con una dependencia lenta corriente abajo, lo alcanzamos en siete minutos."

Cuando una función Lambda alcanza el límite de concurrencia, no procesa mensajes adicionales. Los mensajes se quedan en la cola de SQS. Con una cola Standard, SQS sigue reintentando, pero no hay concurrencia adicional para procesarlos. Los mensajes se acumulan. Las notificaciones se atascan. Los restaurantes no reciben las notificaciones de pedidos. Los temporizadores de la cocina no se inician. Los pedidos llegan tarde o se pierden.

"¿Cuánto pasó antes de que los socios restaurantes empezaran a llamar?" preguntó Tom.

"Once minutos después de que empezara la limitación", dijo Leo. "Teníamos 430 notificaciones atascadas."

"¿Qué hiciste primero?" preguntó Maya.

Leo tuvo la gracia de parecer ligeramente avergonzado. "Subí el timeout de la Lambda de 30 segundos a 5 minutos. La idea era que si cada invocación podía ejecutarse más tiempo, quizás procesaría el atasco más rápido."

"¿Eso lo empeoró?" preguntó Tom.

"Lo empeoró. Los mensajes atascados se reintentaban mientras las invocaciones originales seguían ejecutándose con el timeout extendido. Había creado una situación donde la concurrencia, ya al límite, estaba retenida por funciones de larga duración mientras llegaban nuevos mensajes que no se procesaban."

"Lo recuerdo", dijo Priya en voz baja.

"Mi segundo intento", continuó Leo. "Añadí una segunda función Lambda. Misma cola, nuevo consumidor. Pensé que si duplicaba los consumidores, duplicaría el rendimiento."

"Pero la concurrencia es por cuenta, no por función", dijo Priya.

"Correcto. Dos funciones Lambda, ambas alcanzando el mismo techo de concurrencia a nivel de cuenta. Rendimiento total: idéntico a una función. El atasco: seguía creciendo. La segunda Lambda solo dividió la misma capacidad limitada entre dos funciones."

Tom miraba fijamente la mesa. "¿Cuál es la solución correcta?"

"Priya la encontró", dijo Leo.

"A las 2 AM", añadió Priya. Había estado leyendo la documentación de Lambda en la cama, con el brillo del teléfono bajado al mínimo.

"Concurrencia reservada", dijo. "A cada función Lambda se le puede asignar concurrencia reservada: una porción del límite total de concurrencia de la cuenta que está garantizada exclusivamente para esa función, e indisponible para cualquier otra función. Si le daba a la Lambda de notificaciones 400 unidades de concurrencia reservada, las demás Lambdas de la cuenta tenían 600 unidades para compartir, y la Lambda de notificaciones no podía ser privada de recursos por otras funciones."

"¿Eso lo arregló?" preguntó Tom.

"Arregló el problema de la inanición", dijo Priya. "Pero seguía habiendo un techo de rendimiento en la Lambda de notificaciones. 400 invocaciones concurrentes, cada una procesando un mensaje a la vez. A dos segundos por mensaje, eso es de sobra para 2.000 mensajes por minuto. Pero en el momento en que una dependencia corriente abajo se ralentiza más allá de doce segundos por llamada, la misma aritmética que nos rompió a 1.000 nos rompe a 400. Las 400 unidades tenían suficiente margen para el tráfico de esa semana. Para esa semana."

"Era una corrección temporal", dijo Leo.

"Era la tercera corrección en una serie en escalada", dijo Priya. "Cada corrección abordaba un síntoma. Ninguna de ellas abordaba la arquitectura."

La solución correcta —que construyeron a lo largo de las dos semanas siguientes— tenía tres partes.

"Colas FIFO", dijo Priya, "por nivel de restaurante. Los restaurantes estaban segmentados en tres niveles: enterprise, growth y standard. Cada nivel tenía su propia cola FIFO de SQS. Cada cola tenía su propio consumidor Lambda con su propia asignación de concurrencia reservada."

"¿Por qué FIFO?" preguntó Tom. "Las colas Standard son más baratas."

"Porque las colas FIFO garantizan el orden por grupo de mensajes", dijo Priya. "Para las notificaciones de restaurantes, el orden de los mensajes importa. Si una actualización de pedido llega antes que la notificación del pedido original, el restaurante ve una secuencia confusa. Las colas FIFO, con un ID de grupo de mensajes por restaurante, garantizan que los mensajes de cada restaurante se procesen en el orden en que se enviaron."

"¿Y la separación por niveles?" preguntó Tom.

"Radios de impacto aislados", dijo Priya. "Si la cola del nivel enterprise tiene un problema de procesamiento, no degrada el nivel standard. Los restaurantes enterprise tienen los requisitos de SLA más altos: son aquellos donde una notificación retrasada le cuesta a Nimbus dinero real en penalizaciones contractuales. Separarlos garantiza que su cola no pueda ser llenada por el tráfico de restaurantes standard."

"Y la DLQ", añadió Leo.

"Una cola de mensajes fallidos (dead-letter queue) en cada cola FIFO", dijo Priya. "Los mensajes que fallan al procesarse después de tres intentos se mueven a la DLQ. Una alarma de CloudWatch se dispara cuando la profundidad de la DLQ supera cero. El ingeniero de guardia revisa los mensajes fallidos y determina si necesitan reprocesamiento o investigación."

"Antes de la alarma de la DLQ", dijo Leo, "nos enterábamos de las notificaciones fallidas cuando un socio restaurante llamaba. La alarma de la DLQ significa que nos enteramos antes de la llamada."

La conversación se había quedado en silencio por un momento. La luz de la tarde había continuado su lento cambio a través de la ventana del café.

"En lo que pienso", dijo Leo, "es en la brecha entre lo que construí y lo que construiría ahora. No como autocrítica. Como medición. Porque esa brecha es como sé que he aprendido algo."

"¿Qué habrías construido desde el principio?" preguntó Maya.

"Colas FIFO por niveles desde el primer día", dijo Leo. "No porque necesitara tres niveles cuando teníamos 40 restaurantes. Sino porque el diseño habría sido correcto para lo que llegamos a ser. El coste de tres colas en lugar de una era insignificante. El coste de una cola que falló a escala fueron tres horas de incidentes de viernes por la noche y dos semanas de remediación."

"No sabías que ibas a escalar a 3.000 restaurantes cuando lo construiste", dijo Priya. No era una defensa. Era una aclaración.

"No", dijo Leo. "Pero sabía que estábamos construyendo un sistema de notificaciones para una plataforma de restaurantes con ambiciones de crecimiento. La pregunta que no hice fue: ¿cómo se ve esto a 10x? ¿A 100x? ¿Qué es lo primero que se rompe cuando nos hagamos más grandes?"

"El límite de concurrencia", dijo Tom.

"El límite de concurrencia", coincidió Leo. "Que está en la documentación de Lambda. Yo había leído la documentación. Simplemente nunca había hecho la pregunta que habría hecho relevante esa sección."

"Ese es el hábito arquitectónico", dijo Priya. "La pregunta que hace relevante la documentación correcta. No puedes leer cada línea. Pero si preguntas '¿qué se rompe a escala?', acabas leyendo las líneas correctas."

Maya había estado escuchando sin hablar por un rato. Dijo: "La razón por la que quería hablar de esto hoy —la razón por la que les pedí a todos que vinieran— es que he estado intentando entender qué podemos enseñar a los nuevos ingenieros. No los servicios. Los servicios los aprenderán. ¿Cuál es la cosa que tarda más en aprenderse de lo que debería?"

Nadie respondió de inmediato.

"Esa pregunta", dijo Leo finalmente. "La de qué se rompe a escala. La hacemos por reflejo ahora. No la hacíamos por reflejo cuando empezamos. No sé cómo enseñar a alguien a hacerla reflexivamente sin dejar que primero construyan unas cuantas cosas que se rompen a escala."

"No puedes", dijo Tom. "Pero puedes hacer el entorno más seguro para el aprendizaje. Puedes construir sistemas donde el fallo sea visible, contenido y rastreable. Puedes asegurarte de que el post-mortem sea un documento de aprendizaje, no un documento de culpa. Puedes hacer la pregunta de la escala en la revisión de código, incluso cuando sabes la respuesta, porque la persona que escribe el código necesita oírla preguntar."

"Y puedes contar historias", dijo Priya. "Como esta."


Maya miró la calle.

"El nuevo ingeniero preguntó cómo convertirse en arquitecto", dijo. "Lo que debería haber dicho es: conviértete en alguien que se preocupa por lo que se rompe. Todo lo demás se desprende de eso."

Nadie habló por un momento.

Era uno de esos silencios que no necesita ser llenado.

Afuera, alguien cruzó la calle cargando dos bolsas de papel con comida para llevar. Tom lo notó primero y se rió.

"Círculo completo", dijo.

Maya sonrió. "Sí", dijo. "Círculo completo."

---

## La Progresión de Junior a Arquitecto

| Etapa          | Pregunta Principal                                              | Horizonte Temporal     | Propiedad        |
|----------------|-----------------------------------------------------------------|------------------------|------------------|
| Junior         | ¿Cómo hago que esto funcione?                                   | Ticket actual          | Mi PR            |
| Nivel medio    | ¿Cómo hago que esto sea correcto y mantenible?                  | Este sprint            | Mi componente    |
| Senior         | ¿Cómo aguanta esto con el tiempo y a escala?                    | Próximo trimestre      | Este servicio    |
| Staff/Principal| ¿Por qué estamos construyendo esto, y hay un camino más simple? | Próximo año            | Este sistema     |
| Arquitecto     | ¿Qué falla primero, cómo lo sabemos y qué hacemos?              | Indefinido             | El producto      |

---

## Lo que Cambia a Medida que Creces

**De implementación a consecuencia.** Los ingenieros junior preguntan "¿funciona?" Los ingenieros senior preguntan "¿sigue funcionando?" Los arquitectos preguntan "¿qué ocurre cuando deja de funcionar?"

**De funcionalidades a sistemas.** Los ingenieros junior agregan funcionalidades. Los arquitectos piensan en lo que se convierte el sistema cuando se han agregado diez funcionalidades. La forma de las decisiones futuras ya es visible en las decisiones actuales.

**De corrección a compensaciones.** Generalmente hay una implementación "más correcta" de una funcionalidad. Rara vez hay una arquitectura "más correcta". Hay compensaciones, y los mejores arquitectos las hacen explícita y conscientemente en lugar de accidentalmente.

**De confianza a calibración.** Los ingenieros junior a menudo son infra-confiados (inseguros de las decisiones correctas) o sobre-confiados (inconscientes de lo que no saben). Los arquitectos experimentados están calibrados: conocen el alcance y los límites de su conocimiento, y mantienen sus conclusiones al nivel apropiado de certeza.

**De conocimiento a juicio.** El conocimiento es saber que DynamoDB usa claves de partición. El juicio es saber que el patrón de acceso de este caso de uso específico causará particiones calientes, y que el impacto empresarial de ese modo de fallo a la escala proyectada significa que debes reconsiderar el diseño ahora.

---

*Gracias por leer.*

*El examen de AWS Solutions Architect Associate (SAA-C03) está disponible en los centros de pruebas de Pearson VUE y en línea a través de su sistema de pruebas remotas. Visita aws.amazon.com/certification para registrarte.*

*La historia de Nimbus es ficticia. Los servicios de AWS, los modelos de precios y las mejores prácticas descritas en este libro son reales. Ambos pueden cambiar: AWS actualiza sus servicios con frecuencia. Siempre verifica los precios actuales y las capacidades de los servicios en aws.amazon.com.*

*Buena suerte.*

---

*¿Misma hora el año que viene?*
