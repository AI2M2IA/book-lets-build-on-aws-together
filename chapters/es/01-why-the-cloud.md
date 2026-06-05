# Capítulo 1: ¿Por Qué Alquilar si Puedes Poseer?

Tom llevaba sentado con la pregunta desde la noche anterior. La había escrito en su cuaderno, la había tachado y la había escrito de nuevo.

Cuando Leo y Priya llegaron a la mañana siguiente — café en mano, discutiendo sobre algo sin relación — Tom ya estaba en la pizarra. La tercera opción seguía allí, intacta. Una forma de nube, dibujada por alguien que había admitido no saber qué significaba.

«Necesito que alguien me explique algo», dijo Tom, sin darse la vuelta. «Si alquilamos ordenadores a Amazon en lugar de comprar los nuestros — ¿por qué sería eso *más barato*?»

La sala quedó en silencio. Era el tipo de pregunta que suena sencilla y no lo es.

«Porque», empezó Leo.

«No», dijo Tom. «Quiero entenderlo. No solo escuchar la respuesta. ¿Por qué es más barato alquilar que poseer?»

**El Problema Obvio de Poseer Servidores**

Imagina que decides abrir un restaurante. No del tipo Nimbus — un restaurante normal.

Antes de que entre tu primer cliente, necesitas mesas. Sillas. Una cocina. Un fogón.
Platos. Personal. Necesitas todo esto el primer día, incluso si tu primera semana es tranquila, incluso
si pasas tres meses con seis clientes al día antes de que corra la voz.

Los servidores físicos funcionan igual.

Si Nimbus compra sus propios servidores, tiene que comprarlos para el pico que espera.
El viernes por la noche más ajetreado que pueda imaginar. El momento viral en que una blogger de comida
habla de la arepa y diez mil personas intentan pedir a la vez.

Pero la mayor parte del tiempo no hay tanto movimiento. La mayor parte del tiempo, esos servidores están ahí,
consumiendo electricidad, haciendo casi nada.

«Estaríamos pagando por una capacidad que no usamos», dijo Maya.

«Exactamente», dijo Tom, lo que sorprendió a todos porque era él quien había hecho
la pregunta.

**El Modelo de Alquiler**

Esto es lo que hace diferente a la computación en la nube.

Cuando usas AWS, no compras servidores. Alquilas potencia informática y pagas solo
por lo que usas. Es más parecido a alquilar un local que a poseer el edificio de un restaurante.

Piénsalo de esta manera.

Si necesitas organizar una fiesta de cumpleaños para cincuenta personas, podrías comprar una casa
lo suficientemente grande para cincuenta personas con sus mesas y sillas. O podrías alquilar un local
durante cuatro horas el sábado, pagar exactamente el espacio y el tiempo que necesitas y devolver
las llaves cuando termine la fiesta.

El local sigue ahí cuando lo necesitas. Vuelve a estar disponible cuando surja otra cosa. No
tuviste que contratar a un administrador de edificio. No pagaste impuestos sobre la propiedad
durante todo el año.

Ese es el modelo de la nube. AWS tiene los «locales». Tú apareces cuando los necesitas.

**Pero Espera — Hay Más**

«Bien», dijo Leo, «¿y si mi local se incendia?»

Buena intuición. Oscura, pero buena.

Una de las suposiciones silenciosas cuando posees tus propios servidores es que *tú* eres
responsable de mantenerlos en funcionamiento. Si el servidor en tu oficina es derribado
por un becario torpe, tu sitio web cae. Si el edificio pierde electricidad, tu sitio web
cae. Si el disco duro falla — y los discos duros siempre fallan eventualmente — tu
sitio web cae.

AWS opera centros de datos. Instalaciones enormes y gestionadas profesionalmente con energía de respaldo,
conexiones de red redundantes, seguridad física y equipos de ingenieros cuyo único
trabajo es mantener esas máquinas en funcionamiento.

No solo estás alquilando potencia informática. Estás alquilando fiabilidad.

«¿Cuánto cuesta eso?» preguntó Tom.

Ya llegaremos a eso. Muchos capítulos más adelante, cuando los ojos de Tom no se velen.

**Tres Cosas que la Nube Hace de Manera Diferente**

Seamos concretos. Aquí están las tres diferencias principales entre gestionar tus
propios servidores y usar un proveedor de nube.

**1. Pagas por lo que usas.**

Sin servidor en reposo. Sin compra inicial. Si Nimbus no recibe pedidos un
lunes por la mañana, no paga casi nada. Si se desbordan en Nochevieja, AWS
tiene la capacidad lista automáticamente.

**2. Alguien más se encarga del hardware.**

AWS mantiene las máquinas físicas. Los cables de red. Las fuentes de alimentación.
Los sistemas de refrigeración. Nimbus no contrata a nadie para esto. Se centran en su
aplicación, no en la infraestructura que hay por debajo.

**3. Puedes escalar hacia arriba — y hacia abajo — al instante.**

Este es el que tarda un tiempo en apreciarse plenamente. Con servidores físicos, escalar
hacia arriba significa pedir nuevo hardware, esperar semanas para la entrega, configurarlo. Con AWS,
escalar hacia arriba significa hacer clic en un botón (o que el sistema lo haga automáticamente). Y cuando
ya no necesitas la capacidad adicional, reduces la escala. Dejas de pagar.

Priya había estado callada durante esta explicación. Tenía una pregunta.

«¿Y la seguridad? ¿Quién es responsable de mantener los datos seguros?»

Y aquí es donde se pone interesante.

**El Modelo de Responsabilidad Compartida**

Este es uno de los conceptos más importantes de todo AWS. Es sencillo una vez que
lo entiendes, pero confunde a mucha gente — incluido en el examen.

AWS y tú compartís la responsabilidad de la seguridad. Pero cada parte es responsable de
cosas diferentes.

**AWS es responsable de la seguridad *de* la nube.**

Los centros de datos físicos. El hardware. La infraestructura de red. Los hipervisores
que ejecutan las máquinas virtuales. Si alguien entra en un centro de datos de AWS, ese es
el problema de Amazon.

**Tú eres responsable de la seguridad *en* la nube.**

Tus datos. Tu aplicación. Tus cuentas de usuario y quién tiene acceso a qué. Las
configuraciones que eliges. Si alguien roba tu contraseña e inicia sesión en tu cuenta de AWS,
ese es tu problema.

Priya asintió lentamente. «Ellos protegen el edificio. Nosotros protegemos lo que hay dentro.»

«Exactamente», dijo Maya.

«¿Entonces si Leo abre un puerto que no debería...»

«Sigue siendo nuestro problema», confirmó Maya, mirando a Leo.

Leo ya estaba escribiendo algo en su portátil y fingía no escuchar.

## Fortalezas y Limitaciones

Ninguna herramienta es perfecta. Seamos honestos sobre ambas partes.

**Por qué la nube es excelente**:

- Sin costes de hardware iniciales
- Paga solo por lo que usas
- Escala al instante en ambas direcciones
- Fiabilidad profesional y seguridad física
- Acceso a cientos de servicios gestionados (bases de datos, colas, aprendizaje automático y más)
  sin tener que construirlos o mantenerlos tú mismo

**Donde se complica**:

- Los costes pueden ser impredecibles si no estás prestando atención (la futura pesadilla de Tom)
- Dependes de un tercero para tu infraestructura — si AWS tiene una interrupción en tu
  región, tu servicio también se ve afectado
- Hay una curva de aprendizaje. AWS tiene cientos de servicios. Saber cuál usar
  requiere experiencia, o un libro como este.
- Los datos que salen de la nube pueden ser caros. Mover grandes cantidades de datos fuera de AWS
  cuesta dinero. (Revisaremos esto en el Capítulo 30.)

«Entonces estamos intercambiando control por comodidad», dijo Tom.

«E intercambiando coste inicial por coste continuo», añadió Maya.

«E intercambiando el problema de otra persona por nuestro propio problema, en el lado de la seguridad», dijo Priya.

«Pero también estamos intercambiando el servidor roto de Leo por el servidor-muy-sin-romper de Amazon», dijo Leo,
que al parecer había estado escuchando todo el tiempo.

No estaba del todo equivocado.

## Resumen

- La nube es potencia informática que alquilas en lugar de poseer.
- AWS es el mayor proveedor de nube del mundo.
- El beneficio principal es el escalado de pago por uso: pagas solo por lo que usas, y puedes
  escalar hacia arriba o hacia abajo según sea necesario.
- AWS gestiona la infraestructura física. Tú gestionas tu aplicación, tus datos
  y tus configuraciones. Esta división se llama el **Modelo de Responsabilidad Compartida**.
- La nube no siempre es más barata o más simple — pero elimina barreras para empezar
  y hace posible el escalado de maneras que los servidores físicos no pueden igualar.

## Consejos para el Examen

*Dominio SAA-C03: Transversal — Fundamentos de conceptos de nube*

- El **Modelo de Responsabilidad Compartida** aparece en el examen con regularidad. Recuerda: AWS
  es responsable de la seguridad *de* la nube (hardware, centros de datos, red global).
  Tú eres responsable de la seguridad *en* la nube (datos, identidades, configuración de la aplicación).
- **Matiz crítico**: la división cambia según el tipo de servicio. Para EC2
  (una máquina virtual que tú controlas), *tú* parcheas el sistema operativo. Para RDS (una
  base de datos gestionada), AWS parchea el motor de la base de datos. Cuanto más «gestionado» es un servicio,
  más responsabilidad se traslada a AWS. Los escenarios del examen describirán un incidente
  y preguntarán quién es responsable — pregúntate siempre «¿cómo de gestionado es este servicio?»
- Las preguntas sobre *beneficios* de la nube suelen evaluar CapEx vs. OpEx. El hardware en las instalaciones propias
  es gasto de capital (CapEx — compra única, amortización a lo largo del tiempo). La nube es
  gasto operativo (OpEx — pago mensual). AWS traslada los costes de CapEx a OpEx.
- «Elasticidad» — la capacidad de escalar hacia arriba *y hacia abajo* automáticamente — es un beneficio
  básico de la nube. Puede que la veas emparejada con «escalabilidad» en el examen. La elasticidad significa
  escalado automático y orientado a la demanda en ambas direcciones. La escalabilidad significa que el sistema
  *puede* crecer, pero no necesariamente se reduce automáticamente.

## Ejercicios

**Ejercicio 1 — Recordar**

Con tus propias palabras: explica el Modelo de Responsabilidad Compartida. ¿Quién es responsable de qué
y por qué importa esa distinción?

*(Pista: Piensa en la analogía de Priya — ¿quién protege el edificio y quién protege lo que hay
dentro?)*

**Ejercicio 2 — Práctica de Examen**

*Escenario*: Una empresa está migrando su aplicación web desde un centro de datos en las instalaciones propias
a AWS. El equipo de seguridad está preocupado por mantener el cumplimiento de sus políticas de protección de datos. Un
nuevo ingeniero pregunta: «Ahora que estamos en AWS, ¿Amazon se encarga de todos nuestros requisitos de seguridad?»

¿Cuál de las siguientes opciones MEJOR describe cómo se dividen las responsabilidades de seguridad?

A) AWS es totalmente responsable de toda la seguridad una vez que la aplicación está alojada en la nube  
B) El cliente es totalmente responsable de toda la seguridad, incluida la seguridad física del centro de datos  
C) AWS gestiona la seguridad de la infraestructura subyacente; el cliente gestiona la seguridad de sus datos, aplicaciones y configuraciones  
D) Las responsabilidades de seguridad se negocian por cuenta y dependen del nivel de servicio del cliente

**Pista 1**: Piensa en qué controla AWS físicamente frente a qué controlas tú.

**Pista 2**: AWS posee los centros de datos. Tú eliges qué poner en ellos y cómo configurar
tu aplicación.

**Pista 3**: Presentamos un nombre específico para esta división de responsabilidades en
este capítulo.

**Respuesta**: C

**Explicación**: El Modelo de Responsabilidad Compartida de AWS divide la seguridad en dos dominios.
AWS protege la infraestructura física — centros de datos, hardware y red.
El cliente protege todo lo que despliega encima: sus datos, sus controles de acceso,
las configuraciones de su aplicación y sus configuraciones de red.

**¿Por qué no A?** AWS nunca asume total responsabilidad por la seguridad de las aplicaciones del cliente.
En el momento en que configuras algo, esa configuración la tienes que gestionar tú.

**¿Por qué no B?** Los clientes no son responsables de la seguridad física del centro de datos —
esa es precisamente una de las ventajas de usar AWS.

**¿Por qué no D?** El Modelo de Responsabilidad Compartida es un marco fijo, no un acuerdo
negociado.

*Dominio SAA-C03: Transversal — Conceptos de nube / Responsabilidad Compartida*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Un amigo está lanzando una nueva app y te pide tu opinión. Está decidiendo entre
comprar dos servidores físicos (uno para la app, otro para la base de datos) o usar un proveedor de nube.
Su tráfico proyectado es de 10-100 usuarios al día, pero tiene un evento de lanzamiento
en tres meses que podría traer 10.000 usuarios en un solo día.

Analiza las concesiones. ¿Qué opción recomendarías y cuál es la razón principal? ¿A qué renunciarías con tu elección?

*(No hay una única respuesta correcta. El objetivo es practicar el pensamiento en concesiones.)*

## Escena Post-Créditos

Tres días después, Nimbus tenía una cuenta de AWS.

Leo la había creado a las 11 de la noche usando su dirección de correo electrónico personal, una tarjeta de crédito que había tenido que pedir prestada a Tom y un entusiasmo que, en retrospectiva, era ligeramente alarmante.

«Encontré algo que se llama EC2», dijo a la mañana siguiente, mostrando la pantalla de su portátil.
«Es como un ordenador que alquilas. Creo que inicié uno.»

«¿*Crees*?» preguntó Priya.

«Quiero decir, definitivamente inicié uno.» Hizo scroll hacia abajo. «Solo no sé dónde está.»

Maya se inclinó y miró la pantalla.

«Leo», dijo. «¿Por qué pone 'Región: ap-southeast-1'?»

«¿Qué significa eso?»

En el próximo capítulo: la geografía de AWS — dónde están los servidores realmente y por qué importa.
