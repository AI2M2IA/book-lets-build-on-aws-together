# Capítulo 0: Antes de Empezar

Maya estaba detrás del mostrador del restaurante de su familia un viernes por la noche cuando
le vino el pensamiento.

Llevaban cuatro años abiertos. La comida era buena — la gente cruzaba la ciudad
por la arepa. Pero cada vez que alguien llamaba para hacer un pedido, la línea estaba ocupada. Cada
vez que alguien se acercaba a recoger la comida que nunca había pedido realmente, era porque
había llamado y se había rendido.

Se perdían pedidos. El dinero salía por la puerta antes de entrar.

Y lo peor era que nadie podía señalar un único fallo dramático.

Nada había explotado. Nada se había caído. No había villano, no había banner de avería, no había
una pantalla rota obvia.

Era simplemente fricción. Pequeña, silenciosa y costosa fricción.

«Necesitamos un sitio web», dijo Maya a nadie en particular.

Su primo Tom levantó la vista de la hoja de cálculo que actualizaba a mano. Tom llevaba
gestionando los «sistemas» del restaurante — una palabra generosa para una hoja de cálculo compartida de Google y una
pizarra blanca — durante los últimos dos años.

«Un sitio web», repitió. «¿Y dónde vive exactamente un sitio web?»

Maya abrió la boca. La cerró.

No tenía ni idea.

**Una Pregunta que Parece Sencilla**

¿Dónde vive un sitio web?

Probablemente nunca hayas pensado en esto. La mayoría de la gente no. Escribes una dirección en
un navegador, aparece una página y en algún punto entre esos dos eventos, la magia ocurre.

Hasta el día en que eres tú quien paga por la magia.

Pero no es magia. Son ordenadores.

En algún lugar del mundo, ahora mismo, hay un ordenador físico — un servidor — que
almacena los archivos que componen ese sitio web. Cuando le pides a tu navegador la página,
tu solicitud viaja por internet, llega a ese ordenador y el ordenador te envía
los archivos de vuelta.

Eso es todo. Eso es un sitio web.

Así que la pregunta real es: el ordenador, ¿de *quién*?

**Tres Opciones, un Problema**

De vuelta en el restaurante, Maya y Tom esbozaron las opciones en la pizarra.

**Opción uno**: Comprar un ordenador, instalarlo en el restaurante y ejecutar el sitio web desde
allí. (En la industria, a esto se le llama funcionar «en las instalaciones propias» — tu propio edificio,
tus propias máquinas. Verás este término constantemente.)

Tom escribió «factura de electricidad» y «qué pasa si se rompe» junto a esta opción.

**Opción dos**: Pagar a una empresa de alojamiento para que gestione un pequeño servidor. Barato, sencillo.
Funcionaba para blogs personales en 2008. Probablemente no sea lo suficientemente flexible para un negocio en crecimiento.

«¿Y si de repente recibimos mil pedidos a la vez?» preguntó Maya.

Tom añadió «no escala» a la opción dos.

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
un ordenador físico propiedad de Apple o Google, sentado en un edificio en algún lugar. Cuando
usas Netflix, el vídeo que estás viendo se envía desde servidores físicos en centros de
datos de todo el mundo.

La «nube» simplemente significa: ordenadores a los que accedes por internet, que no
tienes que poseer ni mantener tú mismo.

Y Amazon — sí, la empresa que reparte paquetes — construyó una de las mayores
colecciones de estos ordenadores del mundo. La llaman Amazon Web Services, o AWS.

**¿Por Qué Amazon?**

Es una pregunta legítima. Amazon empezó como una librería.

Esto es lo que ocurrió: Amazon creció tan rápido que necesitaron una enorme cantidad de
potencia informática para gestionar sus propios sistemas. Construyeron centros de datos. Contrataron ingenieros
para gestionarlos. Se volvieron muy, muy buenos en ejecutar ordenadores a escala.

Luego alguien en Amazon tuvo una idea: ¿y si vendemos acceso a toda esta potencia informática
a otras personas?

En 2006 se lanzó Amazon Web Services. Hoy, AWS gestiona una parte significativa de
internet. El sitio web que usas para reservar vuelos, la app que rastrea tu entrega, el
servicio de streaming que viste anoche — hay muchas posibilidades de que al menos parte de todo eso
se ejecute en AWS.

No es un monopolio. Google Cloud y Microsoft Azure son competidores serios. Pero AWS
fue primero, es grande y es de lo que trata este libro.

**Conoce al Equipo**

Maya no construyó Nimbus sola.

Llamó a Tom primero — lógicamente. Tom tenía las hojas de cálculo, los contactos con proveedores y
la obstinación necesaria para ejecutar realmente una idea.

Tom conocía a un desarrollador. Leo. Veinticuatro años, autodidacta, el tipo de persona que
ya ha construido un prototipo antes de que termines de explicar el problema. Llegó
a su primera reunión con un portátil y una app a medias.

«Ya empecé», dijo, abriendo la pantalla. «Creo que la he desplegado en algún lugar.»

Lo había hecho. En un servidor que no entendía del todo, en una región que no había elegido
intencionalmente, ejecutando código que definitivamente se rompería bajo carga.

Lo quisieron de inmediato.

Priya llegó después — la recomendó un amigo en común. Titulación en ingeniería, especialidad en seguridad,
el tipo de persona que lee post-mortems de fallos tecnológicos famosos las tardes de fin de semana.
Tuvo una pregunta en su primera reunión.

«¿Alguien ha pensado en qué pasa si alguien intenta entrar por la fuerza?»

Silencio.

«Bienvenida al equipo», dijo Maya.

**Qué Es Este Libro**

Esta es la historia de Nimbus.

Nimbus empezó como un sistema de pedidos para restaurantes y se convirtió en algo mucho más grande. A medida que
creció, se encontró con todos los problemas con los que se encuentra el software en crecimiento: sistemas que no podían
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

**Algunas Cosas Antes de Empezar**

**Este libro asume que sabes casi nada sobre computación en la nube.** Si has oído
hablar de AWS pero nunca lo has usado, estás en el lugar correcto. Si nunca has oído hablar de AWS para
nada, también estás en el lugar correcto.

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
comprueba si habrías tomado la misma decisión.

## Resumen

- **La nube** es acceso bajo demanda a recursos informáticos por internet — los ordenadores de otra persona que no tienes que poseer ni mantener.
- Las tres opciones de alojamiento: en las instalaciones propias (tu hardware, tus costes), alojamiento compartido (limitado, no escala), nube (pago por uso, escala con la demanda).
- **AWS** se lanzó en 2006 cuando Amazon abrió su infraestructura de centros de datos a clientes externos. Sigue siendo el mayor proveedor de nube, seguido de Microsoft Azure y Google Cloud.
- Nimbus — la historia que sigue este libro — empieza como un sistema de pedidos para restaurantes y crece hasta convertirse en una arquitectura cloud lista para producción.
- Este libro enseña no solo *qué* hace cada servicio de AWS, sino *por qué* existe, *cuándo* usarlo y *cuándo no*.

## Consejos para el Examen

*Dominio SAA-C03: Transversal — Fundamentos de conceptos de nube*

- **La nube en el examen** significa computación bajo demanda y de pago por uso a través de internet. Es un modelo de entrega, no una tecnología.
- **CapEx vs. OpEx**: La infraestructura en las instalaciones propias es gasto de capital (CapEx — compra de hardware por adelantado). La nube es gasto operativo (OpEx — tarifas de uso recurrentes). Los escenarios del examen que pregunten sobre «eliminar costes iniciales» o «pasar de CapEx a OpEx» apuntan hacia la adopción de la nube.
- **Beneficios de la nube**: Sin hardware inicial, escalado elástico, paga solo por lo que usas, sin gestión de infraestructura física. Los escenarios con «tráfico impredecible» o «equipo pequeño, sin experiencia en hardware» son señales claras para la nube.
- **AWS no es el único proveedor de nube** — Azure y GCP son competidores reales — pero el examen SAA-C03 es específico de AWS. No te pedirán que compares proveedores.

## Fortalezas y Limitaciones

**Fortalezas de este enfoque**: Aprender a través de una narrativa continua da contexto a los conceptos antes de que reciban un nombre. Cuando llegues a IAM o RDS, ya habrás sentido el problema que resuelven — porque Nimbus lo sintió primero. Esto hace que la retención sea mayor y el razonamiento sobre las concesiones más natural que memorizar listas de características.

**Limitaciones a tener en cuenta**: Este libro cubre el programa AWS SAA-C03 de Solutions Architect Associate. Eso es un alcance sustancial, pero no es cada servicio de AWS — y las arquitecturas de producción siempre implican servicios y restricciones específicos de tu industria y escala. La historia de Nimbus es ficticia; las startups reales toman decisiones más caóticas por razones más caóticas. Usa este libro para construir el razonamiento, no para copiar la arquitectura.

## Ejercicios

**Ejercicio 1 — Recordar**

Con tus propias palabras: ¿qué es «la nube» y por qué elegiría una pequeña empresa la nube en lugar de
comprar sus propios servidores?

*(Pista: Piensa en lo que Maya y Tom escribieron junto a la Opción 1 en la pizarra.)*

**Ejercicio 2 — Práctica de Examen**

*Escenario*: Una pequeña startup está lanzando una aplicación de entrega de comida. Esperan un tráfico bajo
inicialmente, pero anticipan un crecimiento rápido si el producto tiene éxito. El equipo fundador
no tiene experiencia gestionando servidores físicos. Quieren minimizar los costes iniciales y
evitar la carga operativa de mantener hardware.

¿Cuál de los siguientes enfoques satisface MEJOR sus requisitos?

A) Comprar un servidor dedicado y alojar la aplicación en su oficina  
B) Usar un proveedor de nube para alojar la aplicación y pagar solo por lo que usen  
C) Asociarse con un centro de datos de colocación para instalar sus propios servidores  
D) Construir la aplicación para que funcione completamente sin conexión, sin infraestructura de internet

**Pista 1**: Piensa en lo que la startup necesita *evitar* tanto como en lo que necesita tener.

**Pista 2**: El escenario menciona específicamente «sin experiencia gestionando hardware» y
«minimizar costes iniciales». ¿Qué opción elimina esas preocupaciones?

**Pista 3**: Describimos esta opción en este capítulo como pagar por «los ordenadores de otra persona».

**Respuesta**: B

**Explicación**: Los proveedores de nube como AWS ofrecen precios de pago por uso sin costes de
hardware iniciales, y se encargan de todo el mantenimiento de la infraestructura física. Este es exactamente
el modelo que tiene sentido para una startup con tráfico incierto y sin experiencia en hardware
— igual que Nimbus.

**¿Por qué no A?** Comprar un servidor dedicado requiere capital inicial, mantenimiento continuo
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
enfoque cloud para un restaurante? ¿Y cuál es el escenario en el que comprar tu propio
ordenador podría tener más sentido?

*(No hay una única respuesta correcta. El objetivo es practicar el pensamiento sobre concesiones.)*

## Escena Post-Créditos

Tarde esa noche, después de que todos se habían ido a casa, Maya se quedó sola en el restaurante
con su portátil.

Había encontrado el sitio web de AWS. Había hecho clic en unas pocas páginas. Había cientos de
servicios listados. Cientos.

Siguió desplazándose hacia abajo. Y hacia abajo. Y hacia abajo.

Luego cerró el portátil.

«Vamos a necesitar un plan», dijo a la habitación vacía.

En el próximo capítulo: por qué las empresas dejaron de comprar servidores y empezaron a alquilarlos — y qué cambió eso.
