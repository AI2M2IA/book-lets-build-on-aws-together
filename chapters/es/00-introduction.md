# Capítulo 0: Antes de Empezar

Maya estaba detrás del mostrador del restaurante de su familia un viernes por la noche cuando
le vino el pensamiento.

Llevaban cuatro años abiertos. La comida era buena — la gente cruzaba la ciudad
por la arepa. Pero cada vez que alguien llamaba para hacer un pedido, la línea estaba ocupada. Cada
vez que alguien se acercaba a recoger una comida que en realidad nunca había pedido, era porque
había llamado y se había rendido.

Se perdían pedidos. El dinero salía por la puerta antes siquiera de entrar.

Y lo peor era que nadie podía señalar un único fallo dramático.

Nada había explotado. Nada se había caído. No había villano, no había banner de avería, no había
una pantalla rota obvia.

Era simplemente fricción. Pequeña, silenciosa y costosa fricción.

«Perdemos pedidos cada viernes», dijo Maya a nadie en particular. «No porque la comida sea mala. Porque nadie puede contactarnos. Necesitamos un sitio web.»

Su primo Tom levantó la vista de la hoja de cálculo que actualizaba a mano. Tom — un antiguo
administrador de sistemas que había cambiado las salas de servidores por el negocio familiar — llevaba
gestionando los «sistemas» del restaurante — una palabra generosa para una hoja de cálculo compartida de Google y una
pizarra blanca — durante los últimos dos años.

«Un sitio web», repitió. «¿Y dónde vive exactamente un sitio web?»

Maya abrió la boca. La cerró.

No tenía ni idea.

**Una Pregunta que Parece Sencilla**

¿Dónde vive un sitio web?

Probablemente nunca hayas pensado en esto. La mayoría de la gente no. Escribes una dirección en
un navegador, aparece una página y en algún punto entre esos dos eventos, ocurre la magia.

Hasta el día en que eres tú quien paga por la magia.

Pero no es magia. Son ordenadores.

En algún lugar del mundo, ahora mismo, hay un ordenador físico — un servidor — que
almacena los archivos que componen ese sitio web. Cuando le pides a tu navegador la página,
tu solicitud viaja por internet, llega a ese ordenador y el ordenador te envía
los archivos de vuelta.

Eso es todo. Eso es un sitio web.

Así que la pregunta real es: el ordenador, ¿de *quién*?

Esa pregunta llevó a Maya a la pizarra. Y la pizarra llevó a todo lo demás.

**Tres Opciones, un Problema**

De vuelta en el restaurante, Maya y Tom esbozaron las opciones en la pizarra.

**Opción uno**: Comprar un ordenador, instalarlo en el restaurante y ejecutar el sitio web desde
allí. A esto se le llama funcionar «en las instalaciones propias» (on-premises) — tu propio edificio,
tus propias máquinas. Verás este término a lo largo de todo el libro.

Tom escribió «factura de electricidad» y «qué pasa si se rompe» junto a esta opción. Luego se detuvo y empezó a investigar de verdad los precios en su teléfono. Un servidor capaz de manejar una aplicación web modesta costaba entre ochocientos y dos mil dólares por adelantado. Añade un SAI (batería de respaldo), un switch gestionado y un cortafuegos físico, y te acercabas a los cuatro mil dólares antes de haber pagado una sola hora de funcionamiento. Luego venían la factura eléctrica, los requisitos de refrigeración y el hecho de que tenías que reemplazar el hardware cada tres a cinco años.

«¿Cuánto cuesta eso al mes si tienes en cuenta todo?», preguntó Tom, más para sí mismo que para Maya.

Hizo las cuentas. Un servidor de 2.000 dólares amortizado en cuatro años: unos 42 dólares al mes. Consumo eléctrico funcionando 24/7 a entre 300 y 500 vatios: aproximadamente 25 a 40 dólares al mes. Una conexión a internet de nivel empresarial capaz de manejar tráfico real: 100 a 300 dólares al mes. Además, cada tres a cinco años, había que hacer todo esto de nuevo. El hardware no dura para siempre.

«Así que entre 170 y 400 dólares al mes», dijo Tom, «antes de pagarle a nadie por arreglarlo cuando se rompa. Y se romperá.»

«¿Qué pasa si se rompe a las 11 de la noche de un viernes?», preguntó Maya.

Tom sabía cómo arreglar un servidor — había pasado años haciendo exactamente eso, en una vida anterior como administrador de sistemas. Ese era el problema. Sabía con precisión lo que significaba ser la única persona que podía arreglar la máquina: las llamadas a las 2 de la madrugada, los fines de semana perdidos por discos averiados, las vacaciones interrumpidas porque murió una fuente de alimentación. Maya no podía hacerlo, y Tom no quería ser el único punto de fallo del único punto de fallo. El restaurante se quedaría a oscuras. Los pedidos se detendrían. Y no había redundancia — una máquina, ningún plan de respaldo.

«¿Y si crecemos rápido?», añadió Maya. «Compraríamos el servidor para el volumen de hoy, ¿y qué pasa si necesitamos tres veces la capacidad en seis meses? Tendríamos que comprar más hardware, esperar a que lo enviaran, configurarlo...»

Tom añadió «no escala», «coste de reemplazo» y «quién lo arregla a las 2 de la madrugada» a la opción uno. La columna se estaba alargando.

**Opción dos**: Pagar a una empresa de alojamiento para que gestione un pequeño servidor por ellos. Barato, sencillo.
Funcionaba para blogs personales en 2008. Probablemente no sea lo suficientemente flexible para un negocio en crecimiento.

«¿Y si de repente recibimos mil pedidos a la vez?», preguntó Maya.

Tom añadió «no escala» a la opción dos.

Había mirado algunos planes de alojamiento compartido mientras investigaba. Ocho dólares al mes, doce dólares al mes. Pero cada plan tenía límites estrictos: espacio en disco, ancho de banda, conexiones simultáneas. Un plan popular presumía de «ancho de banda ilimitado» en el titular y luego enterraba la política de limitación cuatro párrafos dentro de los términos de servicio. Cien visitantes simultáneos y el servicio se degradaba. Doscientos y el sitio se caía.

«Eso no es ilimitado», dijo Tom. «Eso es "ilimitado hasta que importa".»

Un servidor dedicado en una empresa de alojamiento era más prometedor — 80 a 200 dólares al mes por algo real — pero el equipo todavía tendría que configurarlo y mantenerlo por su cuenta. Y todavía estarían comprando un techo fijo, sin respuesta elástica a la demanda.

«Cada día que estamos por debajo de la capacidad, estamos malgastando dinero», dijo Maya. «Cada día que estamos por encima de la capacidad, estamos perdiendo clientes. No hay manera de acertar exactamente.»

«A menos que el techo se mueva con nosotros», dijo Tom.

No lo había dicho como una transición, pero era la adecuada.

**Opción tres**: Algo más. Algo que habían estado escuchando. Algo llamado
«la nube».

Tom dibujó una nube en la pizarra. Una forma de nube literal, como el dibujo de un niño.

«En realidad no sé qué significa eso», admitió.

«Yo tampoco», dijo Maya.

Ese fue el comienzo de todo.

**Qué Es «La Nube» Realmente**

Aclaremos esto de inmediato, porque la palabra «nube» es uno de los términos más usados en exceso
y menos explicados de la tecnología.

La nube no es un lugar mágico donde tus datos flotan.

La nube son los ordenadores de otra persona.

Eso es todo. Cuando guardas una foto en iCloud o Google Drive, tu foto se almacena en
un ordenador físico propiedad de Apple o Google, situado en un edificio en algún lugar. Cuando
usas Netflix, el vídeo que estás viendo se envía desde servidores físicos en centros de
datos de todo el mundo.

La «nube» simplemente significa: ordenadores a los que accedes por internet, que no
tienes que poseer ni mantener tú mismo.

Y Amazon — sí, la empresa que reparte paquetes — construyó una de las mayores
colecciones de estos ordenadores del mundo. La llaman Amazon Web Services, o AWS.

**La Analogía de la Red Eléctrica**

Piénsalo como la red eléctrica.

Hace cien años, si querías hacer funcionar una fábrica, construías tu propia central eléctrica. Contratabas ingenieros para operarla. Pagabas por el combustible, por el mantenimiento, por la experiencia necesaria para mantener las luces encendidas. Si el generador se rompía, tu fábrica se detenía. Si la demanda crecía, tenías que construir un generador más grande — un proceso caro y lento que requería predecir la demanda futura con años de antelación y comprometer capital antes de saber si lo necesitabas.

Luego llegó la red eléctrica, y el juego cambió por completo.

Te conectabas a la red y pagabas exactamente por la electricidad que consumías. Sin central eléctrica. Sin personal de mantenimiento. Sin contratos de combustible. La capacidad estaba ahí cuando la necesitabas. No pagabas por ella cuando no. Podías empezar un pequeño taller y crecer hasta una gran fábrica sin hacer una apuesta de capital sobre una escala futura incierta.

La computación en la nube es la misma idea aplicada a la informática. AWS construyó la central eléctrica — en realidad, miles de centrales eléctricas en docenas de países, operadas por equipos de ingenieros cuyo propósito profesional íntegro es mantener esas máquinas en funcionamiento. Las empresas se conectan y pagan por lo que usan. La infraestructura es compartida, mantenida profesionalmente y disponible bajo demanda. Dejas de preocuparte por la capa física y te concentras en lo que realmente estás construyendo.

Hay una diferencia con la analogía eléctrica que vale la pena nombrar: la electricidad es una sola cosa. La computación en la nube viene en muchas variedades. Almacenamiento, cómputo, bases de datos, redes, aprendizaje automático, seguridad — cada tipo de recurso tiene su propio precio, sus propias concesiones y sus propios casos de uso apropiados. La red eléctrica entrega una sola cosa de manera uniforme. AWS entrega un catálogo de cientos de servicios. Este libro es tu guía a ese catálogo, empezando por los servicios que más importan.

**¿Por Qué Amazon?**

Es una pregunta legítima. Amazon empezó como una librería.

Esto es lo que ocurrió: Amazon creció tan rápido que necesitaron una enorme cantidad de
potencia informática para gestionar sus propios sistemas. Construyeron centros de datos. Contrataron ingenieros
para gestionarlos. Se volvieron muy, muy buenos en operar ordenadores a escala.

Luego alguien en Amazon tuvo una idea: ¿y si vendemos acceso a toda esta potencia informática
a otras personas?

En 2006 se lanzó Amazon Web Services. Hoy, AWS gestiona una parte significativa de
internet. El sitio web que usas para reservar vuelos, la app que rastrea tu entrega, el
servicio de streaming que viste anoche — hay muchas probabilidades de que al menos parte de todo eso
se ejecute en AWS.

No es un monopolio. Google Cloud y Microsoft Azure son competidores serios. Pero AWS
fue primero, es grande y es de lo que trata este libro.

**Conoce al Equipo**

Maya no construyó Nimbus sola.

Llamó a Tom primero — lógicamente. Tom tenía las hojas de cálculo, los contactos con proveedores y
la obstinación necesaria para ejecutar realmente una idea.

Tom era el tipo de persona que leía los Términos de Servicio. No porque tuviera miedo,
sino porque creía que entender lo que algo cuesta realmente — en dinero, en
riesgo, en tiempo — era la única manera de tomar una buena decisión. Las columnas de la pizarra con
sus listas crecientes de objeciones no eran pesimismo. Eran Tom haciendo lo que Tom
siempre hacía: poner precio al mundo real antes de comprometerse a nada. Preguntaba «¿cuánto
cuesta eso al mes?» en momentos en que todos los demás todavía estaban entusiasmados con lo que una
cosa podía hacer. Le ahorraba dinero a la empresa, con regularidad, y ocasionalmente evitaba
catástrofes antes de que pudieran categorizarse como tales.

Tom conocía a un desarrollador. Leo. Veinticuatro años, autodidacta, el tipo de persona que
ya ha construido un prototipo antes de que termines de explicar el problema. Llegó
a su primera reunión con un portátil y una app a medio terminar.

«Ya la desplegué — oh», dijo, abriendo la pantalla. La expresión de su cara dejó claro que había encontrado algo inesperado. «Creo que la desplegué en algún lugar.»

Lo había hecho. En un servidor que no entendía del todo, en una región que no había elegido
intencionalmente, ejecutando código que definitivamente se rompería bajo carga.

Lo quisieron de inmediato.

Leo se movía rápido. A veces demasiado rápido. Tenía el don del desarrollador para construir cosas que funcionaban y el punto ciego del desarrollador para las cosas que funcionaban *ahora mismo* pero estaban acumulando silenciosamente deuda técnica. Trataba los mensajes de error como algunas personas tratan las etiquetas de advertencia — informativas pero no necesariamente vinculantes. Su respuesta por defecto ante un problema potencial era «estará bien», y acertaba lo suficientemente a menudo como para que pasara un tiempo antes de que el equipo aprendiera a preocuparse cuando lo decía con ese tono particular de certeza casual que significaba que en realidad no lo había comprobado.

Priya llegó después — la recomendó un amigo en común. Titulación en informática, especialidad en seguridad,
el tipo de persona que lee post-mortems de fallos tecnológicos famosos las tardes de fin de semana.
Tuvo una sola pregunta en su primera reunión.

«¿Alguien ha pensado en qué pasa si alguien intenta entrar por la fuerza?»

Silencio.

«Bienvenida al equipo», dijo Maya.

La versión del entusiasmo de Priya era un modelo de amenazas detallado. Disfrutaba genuinamente del proceso de revisión de arquitectura. Era la que leía los informes técnicos de seguridad de AWS y resaltaba las secciones relevantes antes de que nadie se lo pidiera. También era, como descubriría el equipo, fiablemente acertada en las cosas en las que aún no habían pensado. Hacía preguntas de la manera en que un buen ingeniero estructural revisa los muros de carga — no porque esperara que fallaran, sino porque la única forma de saber que son sólidos es mirar con cuidado y documentar lo que encuentras.

«¿Hemos pensado en qué pasa si...?» era como Priya empezaba la mayoría de sus contribuciones. Con el tiempo, el equipo llegó a entender que esta pregunta, más que ninguna otra, era como se prevenían los desastres antes de que pudieran convertirse en incidentes.

Juntos, los cuatro hicieron algo que funcionaba. Maya veía el producto. Tom vigilaba los costes. Leo lo construía. Priya lo aseguraba. El libro que estás leyendo es el registro de lo que aprendieron.

**Qué Es Este Libro**

Esta es la historia de Nimbus.

Nimbus empezó como un sistema de pedidos para restaurantes y se convirtió en algo mucho más grande. A medida que
creció, se encontró con todos los problemas con los que se topa el software en crecimiento: sistemas que no podían
manejar el tráfico, datos que se perdieron, servidores que se cayeron en los peores momentos posibles,
costes que crecieron más rápido que los ingresos.

Y cada vez que se topaban con un problema, encontraban un servicio de AWS diseñado para resolver exactamente
ese tipo de problema.

Este libro te enseña AWS siguiendo ese viaje.

Aprenderás no solo *qué* hace cada servicio, sino *por qué* existe, *cuándo* usarlo
y — igual de importante — *cuándo no usarlo*. Cada herramienta tiene concesiones. Cada
decisión tiene costes. Eso es lo que los ingenieros senior entienden y los junior todavía
están aprendiendo.

Cuando termines este libro, estarás listo para presentarte al examen AWS Solutions Architect
Associate (SAA-C03). Más aún: estarás listo para entrar en una conversación técnica real
y sostenerte.

Esa es la promesa.

Así es como se ve eso en la práctica, sección por sección.

**Capítulos 1–5: Los Fundamentos**. Cuando llegues al final del Capítulo 5, entenderás
qué es realmente la computación en la nube y por qué existe, cómo controlar quién tiene
acceso a tu cuenta de AWS y por qué la cuenta raíz aterroriza a los ingenieros de seguridad, dónde
viven tus servidores y por qué importa la geografía, qué son las instancias EC2 y cómo dimensionarlas,
y cómo almacenar archivos en la nube sin atarlos a una única máquina. Estos capítulos
cubren los conceptos que todo arquitecto de AWS da por sentados — pero que nadie explica
con suficiente claridad la primera vez.

**Capítulos 6–10: Datos y Escala**. Esta sección trata de lo que ocurre cuando tu
aplicación crece. Verás a Nimbus chocar contra el muro del escalado — un servidor, demasiados usuarios,
sin espacio para crecer — y los verás resolverlo con balanceadores de carga, auto escalado, bases de datos
gestionadas y caché. Al final de esta sección, entenderás cómo los sistemas reales de
producción manejan la carga variable y por qué la base de datos es casi siempre el primer
cuello de botella.

**Capítulos 11–17: Redes y Seguridad**. Los conceptos aquí parecen abstractos hasta que los
necesitas. VPCs, grupos de seguridad, DNS, gestión de certificados, gestión de claves. Al
final de esta sección, entenderás cómo se mueve el tráfico a través de una aplicación en la nube
y cómo evitar que se mueva a lugares a los que no debería.

**Capítulos 18–22: Resiliencia y Arquitectura Moderna**. Diseño multirregión, sistemas
desacoplados, computación serverless, contenedores. Estos capítulos cubren los patrones
arquitectónicos que separan los sistemas de producción de los proyectos de juguete. Terminarás esta sección
entendiendo por qué los arquitectos experimentados piensan en el fallo antes de pensar en las
funcionalidades.

**Capítulos 23–26: Rendimiento y Datos**. Niveles de almacenamiento, políticas de ciclo de vida, Aurora y
réplicas de lectura, rendimiento de red, y los servicios de analítica que convierten los datos en
bruto en respuestas. Al final de esta sección, entenderás cómo hacer un sistema más rápido — y
cómo saber qué parte de él es realmente lenta.

**Capítulos 27–30: Optimización de Costes**. Los precios de AWS son complicados, pero siguen
principios. Al final de esta sección, entenderás cómo leer una factura de AWS, cómo
predecir costes antes de comprometerte con una arquitectura, y cómo encontrar las optimizaciones
que importan frente a las que no.

**Capítulos 31–34: Pensar Como un Arquitecto**. La sección final se aleja de los
servicios específicos y aborda el proceso de razonamiento. ¿Cuándo añades complejidad?
¿Cuándo lo mantienes simple? ¿Cómo defiendes una decisión cuando hay alternativas
razonables? Esta es la parte más difícil y más valiosa.


**Algunas Cosas Antes de Empezar**

**Este libro asume que sabes casi nada sobre computación en la nube.** Si has oído
hablar de AWS pero nunca lo has usado, estás en el lugar correcto. Si nunca has oído hablar de AWS en
absoluto, también estás en el lugar correcto.

**Este libro no asume que eres desarrollador.** Maya no lo es. Tom apenas lo es. No
necesitas escribir código para entender la arquitectura. Necesitas entender problemas
y soluciones.

**Este libro a veces se equivocará a propósito.** El equipo cometerá errores. Elegirán
el servicio equivocado. Se saltarán un paso de seguridad del que se arrepentirán. Aprovisionarán
de más y de menos. Así es como aprenderán, y así es como aprenderás tú también.

**Los consejos para el examen son reales.** El SAA-C03 es un examen real. Las preguntas de escenario
al final de cada capítulo están diseñadas para parecerse al examen real. Si puedes responderlas,
vas por buen camino.

Y una cosa más.

Lee este libro con un lápiz, o una app de notas, o una lista de «creo que la respuesta
es...» que vayas anotando.

Detente antes de que el equipo decida algo. Toma la decisión tú mismo. Luego sigue leyendo y
comprueba si habrías tomado la misma concesión.

Puede que te estés preguntando: ¿por qué seguir a una startup de restaurante a lo largo de un libro de certificación de AWS? La respuesta es que los conceptos abstractos se fijan cuando ya has sentido el problema. Para cuando conozcas cada servicio de AWS, Nimbus lo habrá necesitado primero.

**Cómo Leer Este Libro**

Cada capítulo sigue la misma estructura. Verás al equipo toparse con un problema —
algo que se rompe, algo lento, algo que no escala. Luego los verás descubrir
qué está pasando realmente. Luego aparece el servicio de AWS relevante, nombrado
y explicado. Luego hay una inmersión más profunda en los detalles técnicos. Luego concesiones,
ejercicios y una escena que prepara el siguiente capítulo.

Los ejercicios al final de cada capítulo vienen en tres tipos. Los ejercicios de recordar comprueban
que entendiste lo que acabas de leer. Las preguntas de escenario SAA-C03 se ven y se sienten como
preguntas reales de examen — lee las pistas antes de adivinar, porque el razonamiento importa
tanto como la respuesta. Los desafíos de arquitectura no tienen una única respuesta correcta; existen
para hacerte practicar el pensamiento, no para memorizar el resultado.

Si estás leyendo esto principalmente para aprobar el SAA-C03, presta mucha atención a las secciones de
Consejos para el Examen. Señalan lo que el examen realmente evalúa, incluyendo las trampas comunes y el
vocabulario específico que usa el examen. Si estás leyendo esto para construir comprensión
práctica, los Desafíos de Arquitectura son donde ocurre el aprendizaje más profundo.

Ambas cosas son ciertas a la vez: este es un libro de preparación para el examen y una guía
práctica. Cada concepto que aparece en la historia también aparece en los objetivos del dominio del examen. El viaje de Nimbus
no es decoración. Es el plan de estudios.

Una última nota sobre los personajes. Maya pregunta «espera — pero ¿*por qué* lo haríamos de esa manera?» a menudo. Es intencional. Ella es el sustituto del lector. Cada vez que lo pregunta, es porque un aprendiz real estaría preguntando lo mismo. Sigue sus preguntas con atención — marcan los momentos donde el razonamiento más importa.

Tom pregunta «¿cuánto cuesta eso al mes?» a menudo también. También es intencional. El coste es una restricción real en cada decisión de arquitectura. Una respuesta que ignora el coste no es una respuesta completa. Tom se asegura de que el equipo nunca lo olvide.

**Una nota práctica sobre la lectura activa.** Este no es un libro para leer pasivamente. Los
capítulos se construyen unos sobre otros — las decisiones de arquitectura tomadas en el Capítulo 4 crean
problemas que el Capítulo 7 arregla, y las concesiones aceptadas en el Capítulo 7 crean costes que
el Capítulo 27 resuelve. Si te saltas a los servicios que te interesan, el contexto
faltará y el razonamiento no calará de la misma manera.

Lee con algo con qué escribir. Cuando el equipo esté a punto de tomar una decisión, cierra el
libro un momento y toma tu propia decisión primero. ¿Qué servicio elegirías? ¿Qué
concesión aceptarías? Luego sigue leyendo. Comparar tu instinto con la decisión del equipo
— y entender dónde divergen — es donde ocurre el aprendizaje real.

Cuando te encuentres con una pregunta de escenario al final de un capítulo, lee las pistas solo
después de haber tomado una decisión. Las pistas están diseñadas para corregir las respuestas incorrectas más
comunes, lo que significa que son más útiles después de que ya te hayas comprometido con una dirección.

Si estás leyendo este libro como parte de la preparación para el examen SAA-C03, establece un ritmo que te permita
reflexionar entre capítulos. Uno o dos capítulos al día es más efectivo que una
maratón de fin de semana. Los conceptos se acumulan — el examen evalúa el razonamiento entre servicios,
no solo el conocimiento de servicios individuales, y ese razonamiento toma tiempo en solidificarse.

Y si algo no está claro: el equipo hará la pregunta antes de que tengas que hacerla tú. Maya
pregunta «espera — pero ¿*por qué* lo haríamos de esa manera?» exactamente por esta razón. Si te
encuentras confundido por una decisión que toma el equipo, espera dos párrafos. Maya probablemente
está a punto de preguntar lo mismo.

Una cosa más antes de empezar. Tom citará precios a lo largo de este libro, porque
Tom cita precios sobre todo. Esos números — junto con los límites de servicios y
detalles de funcionalidades — reflejan la documentación de AWS a mediados de 2026. AWS los cambia a menudo,
y casi siempre a la baja en precio. El razonamiento detrás de cada decisión se mantendrá;
los dólares y límites exactos puede que no. Cuando sea tu dinero, consulta la documentación actual de AWS
de la manera en que lo haría Tom.

**Y una advertencia honesta**: la nube no siempre es la respuesta correcta.
Para la mayoría de las startups y empresas en fase de crecimiento claramente lo es — las cuentas que hizo Tom en la
pizarra lo demuestran — pero hay situaciones reales, desde datos clasificados hasta cargas de trabajo
masivas y estables, donde poseer tu propio hardware gana. El equipo trabaja a través de
esas excepciones en el siguiente capítulo, cuando Tom insiste en escuchar el argumento en contra de la
nube antes de comprometerse con ella.

## Fortalezas y Limitaciones

**Fortalezas de este enfoque**: Aprender a través de una narrativa continua da contexto a los conceptos antes de que reciban un nombre. Cuando llegues a IAM o RDS, ya habrás sentido el problema que resuelven — porque Nimbus lo sintió primero. Esto hace que la retención sea mayor y el razonamiento sobre las concesiones más natural que memorizar listas de características.

**Limitaciones a tener en cuenta**: Este libro cubre el programa AWS SAA-C03 de Solutions Architect Associate. Eso es un alcance sustancial, pero no es cada servicio de AWS — y las arquitecturas de producción siempre implican servicios y restricciones específicos de tu industria y escala. La historia de Nimbus es ficticia; las startups reales toman decisiones más caóticas por razones más caóticas. Usa este libro para construir el razonamiento, no para copiar la arquitectura.

## Resumen

Nimbus empezó con un problema que cualquier pequeña empresa podría tener: clientes que no podían contactar, y nadie podía señalar un único fallo dramático. Era simplemente fricción — pequeña, silenciosa y costosa. La sesión de pizarra no produjo una solución. Produjo una pregunta que valía la pena hacer: ¿qué es, exactamente, la nube? La respuesta resultó importar más de lo que nadie esperaba.

- **La nube** es acceso bajo demanda a recursos informáticos por internet — los ordenadores de otra persona que no tienes que poseer ni mantener.
- Las tres opciones de alojamiento: en las instalaciones propias (tu hardware, tus costes, requiere tu experiencia), alojamiento de pequeño servidor de terceros (limitado, no escala), nube (pago por uso, escala con la demanda).
- Los costes en las instalaciones propias son reales y a menudo subestimados: la depreciación del hardware, la energía, la conectividad a internet y la experiencia de mantenimiento suman significativamente antes de que escribas una sola línea de código de aplicación.
- **AWS** se lanzó en 2006 cuando Amazon abrió su infraestructura de centros de datos a clientes externos. Sigue siendo el mayor proveedor de nube, seguido de Microsoft Azure y Google Cloud.
- La nube no siempre es la respuesta correcta — pero para la mayoría de las startups y empresas en fase de crecimiento con demanda impredecible y equipos pequeños, claramente lo es.

## Consejos para el Examen

*Dominio SAA-C03: Transversal — Fundamentos de conceptos de nube*

- **La nube en el examen** significa computación bajo demanda y de pago por uso a través de internet. Es un modelo de entrega, no una tecnología.
- **CapEx vs. OpEx**: La infraestructura en las instalaciones propias es gasto de capital (CapEx — compra de hardware por adelantado). La nube es gasto operativo (OpEx — tarifas de uso recurrentes). Los escenarios del examen que pregunten sobre «eliminar costes iniciales» o «pasar de CapEx a OpEx» apuntan hacia la adopción de la nube.
- **Beneficios de la nube**: Sin hardware inicial, escalado elástico, paga solo por lo que usas, sin gestión de infraestructura física. Los escenarios con «tráfico impredecible» o «equipo pequeño, sin experiencia en hardware» son señales claras para la nube.
- **En las instalaciones propias** significa operar tu propio hardware en tu propia instalación. El examen contrasta las arquitecturas en las instalaciones propias con las alternativas en la nube con frecuencia.
- **AWS no es el único proveedor de nube** — Azure y GCP son competidores reales — pero el examen SAA-C03 es específico de AWS. No te pedirán que compares proveedores.
- **Economías de escala**: AWS logra costes por unidad más bajos porque agrega la demanda de miles de clientes. Esta es una de las ventajas declaradas de la nube sobre las instalaciones propias en el marco del examen de AWS. Cuando veas «beneficio de la nube» en el examen, las economías de escala son siempre una respuesta válida.
- **Seis ventajas de la computación en la nube** según la documentación de AWS: cambiar gasto fijo por gasto variable, beneficiarse de economías de escala masivas, dejar de adivinar la capacidad, aumentar la velocidad y la agilidad, dejar de gastar dinero en operar centros de datos, expandirse globalmente en minutos. Estas aparecen textualmente en las preguntas del examen sobre por qué las organizaciones se mudan a la nube.
- **La agilidad en el examen** significa la capacidad de experimentar y desplegar rápidamente con bajo coste por intento — no la velocidad bruta. Cuando un escenario menciona reducir el tiempo de salida al mercado o habilitar la iteración rápida, la agilidad es el beneficio de la nube que se está evaluando.

## Ejercicios

**Ejercicio 1 — Recordar**

Con tus propias palabras: ¿qué es «la nube» y por qué elegiría una pequeña empresa la nube en lugar de
comprar sus propios servidores?

*(Pista: Piensa en lo que Maya y Tom escribieron junto a la Opción 1 en la pizarra.)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: Una pequeña startup está lanzando una aplicación de entrega de comida. Esperan un tráfico bajo
inicialmente, pero anticipan un crecimiento rápido si el producto tiene éxito. El equipo fundador
no tiene experiencia gestionando servidores físicos. Quieren minimizar los costes iniciales y
evitar la carga operativa de mantener hardware.

¿Cuál de los siguientes enfoques satisface MEJOR sus requisitos?

A) Usar un proveedor de nube para alojar la aplicación y pagar solo por lo que usen  
B) Comprar un servidor dedicado y alojar la aplicación en su oficina  
C) Asociarse con un centro de datos de colocación para instalar sus propios servidores  
D) Construir la aplicación para que funcione completamente sin conexión, sin infraestructura de internet

**Pista 1**: Piensa en lo que la startup necesita *evitar* tanto como en lo que necesita tener.

**Pista 2**: El escenario menciona específicamente «sin experiencia gestionando hardware» y
«minimizar costes iniciales». ¿Qué opción elimina esas preocupaciones?

**Pista 3**: Describimos esta opción en este capítulo como pagar por «los ordenadores de otra persona».

**Respuesta**: A

**Explicación**: Los proveedores de nube como AWS ofrecen precios de pago por uso sin costes de
hardware iniciales, y se encargan de todo el mantenimiento de la infraestructura física. Este es exactamente
el modelo que tiene sentido para una startup con tráfico incierto y sin experiencia en hardware
— igual que Nimbus.

**¿Por qué no B?** Comprar un servidor dedicado requiere capital inicial, mantenimiento continuo
y no ofrece capacidad integrada para escalar a medida que crece el tráfico.

**¿Por qué no C?** La colocación resuelve el problema del espacio pero la startup todavía tiene que comprar,
mantener y gestionar sus propios servidores.

**¿Por qué no D?** Una aplicación de entrega de comida requiere conectividad a internet por definición.

*Dominio SAA-C03: Transversal — Fundamentos de conceptos de nube*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Maya quiere convencer a su tío (el dueño del restaurante) para que la deje construir un sistema de
pedidos basado en la nube. Él es escéptico: «¿Por qué íbamos a pagar a Amazon cada mes cuando podríamos
comprar un ordenador una sola vez?»

¿Cómo explicarías las concesiones? ¿Cuáles dirías que son las mayores ventajas del
enfoque cloud para un restaurante? ¿Y cuál es el único escenario en el que comprar tu propio
ordenador podría tener más sentido?

Piénsalo en términos de la analogía de la red eléctrica: ¿cuándo tiene sentido que una
empresa opere su propio generador en lugar de conectarse a la red? La respuesta a esa
pregunta se corresponde casi directamente con cuándo tiene sentido operar tus propios servidores.

*(No hay una única respuesta correcta. El objetivo es practicar el pensamiento sobre concesiones.)*

## Escena Post-Créditos

Tarde esa noche, después de que todos los demás se habían ido a casa, Maya se quedó sola en el restaurante
con su portátil.

Había encontrado el sitio web de AWS. Había hecho clic en unas pocas páginas. Había cientos de
servicios listados. Cientos.

Siguió desplazándose hacia abajo. Y hacia abajo. Y hacia abajo.

Luego cerró el portátil.

«Vamos a necesitar un plan», dijo a la habitación vacía.

Tom le había enviado por mensaje los precios de servidores que había encontrado antes. Volvió a leer los números: costes iniciales, depreciación, electricidad, ciclos de reemplazo. Luego abrió la calculadora de precios de AWS. Tecleó un servidor virtual — el tipo más pequeño, solo para ver. El número mensual era más bajo de lo que habría sido la factura eléctrica de una sala de servidores física.

Se quedó mirando ese número un rato.

Luego le escribió a Tom: *Vamos con la nube.*

Su respuesta llegó en menos de un minuto: *Lo sé. Yo también hice las cuentas. Pero lo haremos con cuidado.*

Dejó el teléfono. Afuera, el restaurante estaba en silencio. La cocina estaba a oscuras. En algún lugar entre la cocina y la nube, había un negocio que estaba a punto de construir.

En el próximo capítulo: por qué las empresas dejaron de comprar servidores y empezaron a alquilarlos — y qué cambió eso.
