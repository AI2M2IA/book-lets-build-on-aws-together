# Capítulo 1: ¿Por Qué Alquilar si Puedes Poseer?

El cuaderno estaba abierto sobre la mesa, y Tom había tachado la misma línea tres veces.

Había trasnochado. La pregunta no lo soltaba. Alrededor de medianoche la había escrito por completo, luego la había subrayado, luego le había dibujado un recuadro alrededor, y luego la había tachado porque escribirla no la había hecho más clara. La había escrito de nuevo en el margen.

Cuando Leo y Priya llegaron a la mañana siguiente — café en mano, discutiendo sobre algo sin relación — Tom ya estaba en la pizarra. La tercera opción seguía allí, intacta. Una forma de nube, dibujada por alguien que había admitido no saber qué significaba.

El problema de pedidos del restaurante había cristalizado algo real. Maya había declarado la nube como el camino a seguir. Esa decisión estaba tomada. Lo que quedaba era la pregunta que Tom no podía quitarse de encima, sentada en el margen de su cuaderno: si alquilar era la respuesta, ¿por qué era más barato que poseer?

«Necesito que alguien me explique algo», dijo Tom, sin darse la vuelta. «Si alquilamos ordenadores a Amazon en lugar de comprar los nuestros — ¿por qué sería eso *más barato*?»

La sala quedó en silencio. Era el tipo de pregunta que suena sencilla y no lo es.

«Porque», empezó Leo.

«No», dijo Tom. «Quiero entenderlo. No solo escuchar la respuesta. ¿Por qué es más barato alquilar que poseer?»

Leo se sentó. Dejó su café sobre la mesa. Realmente lo pensó.

«Porque», dijo de nuevo, con más cuidado esta vez, «estaríamos comprando para el peor de los casos. El viernes por la noche más grande, el momento viral, el evento de lanzamiento. Pero la mayor parte del tiempo no hay tanto movimiento.»

«Correcto», dijo Tom. «Sigue.»

«Así que estaríamos pagando por una capacidad que no usamos. Cada martes tranquilo. Cada lunes por la mañana. Tendríamos un servidor ahí parado, consumiendo electricidad, haciendo casi nada.»

«¿Y si alquilamos en su lugar?»

«Pagamos por lo que usamos», dijo Leo. «Cuando hay calma, pagamos casi nada. Cuando hay movimiento, pagamos más. Pero nunca pagamos por una capacidad que está ahí parada.»

Tom pareció satisfecho. No porque la respuesta fuera nueva para él — la había resuelto la noche anterior. Sino porque decirla en voz alta la hacía real. Cogió su cuaderno y tachó la pregunta una última vez.

Ese era el fundamento. Todo lo demás en este capítulo se construye sobre él.

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

**El Coste Real del Hardware: La Hoja de Cálculo de Tom**

Tom había construido un modelo de costes en condiciones para cuando el equipo se reunió. Se lo explicó paso a paso.

Había puesto precio de verdad a hardware real. Un Dell PowerEdge R550 — un servidor de gama media capaz de manejar varios cientos de usuarios concurrentes — costaba unos 8.000 dólares configurado con suficiente RAM y almacenamiento para una aplicación web de producción. Eso es un servidor. Para tener redundancia (de modo que un fallo no tirara abajo todo el sistema), necesitarías al menos dos. Dieciséis mil dólares antes de empezar.

La estimación de 2.000 dólares de la pizarra era optimista. El hardware de producción costaba más. Necesitabas suficiente memoria para que la aplicación y la base de datos se ejecutaran simultáneamente. Necesitabas RAID para la redundancia del almacenamiento. Necesitabas una tarjeta de interfaz de red lo suficientemente rápida para manejar tráfico real. Para cuando configurabas un servidor de producción real, el número de 8.000 dólares no era una exageración.

«Dos servidores: 16.000 dólares», dijo Tom, anotándolo.

Luego los costes continuos. Energía: un servidor funcionando 24/7 a 400 vatios consumía unos 3.500 kilovatios-hora al año. A 0,12 dólares por kWh, eso eran aproximadamente 420 dólares al año, por servidor. Por dos: 840 dólares al año solo en electricidad.

Luego internet. Una conexión empresarial lo suficientemente rápida para manejar tráfico real — no el wifi residencial que el restaurante usaba actualmente, sino una conexión de fibra simétrica de nivel empresarial con un acuerdo de nivel de servicio — costaba de 200 a 400 dólares al mes. Eso eran de 2.400 a 4.800 dólares al año.

Luego el ciclo de vida del hardware. Los servidores duraban de tres a cinco años antes de volverse demasiado lentos o demasiado poco fiables para ejecutar una carga de trabajo de producción. Después del cuarto año, estabas funcionando con hardware que no podía parchearse contra ciertas vulnerabilidades y que tu proveedor de servidores ya no soportaba. Así que amortizabas el coste inicial: 16.000 dólares a lo largo de cuatro años eran 4.000 dólares al año en depreciación de capital.

Luego los costes que nadie anotaba: un SAI (sistema de alimentación ininterrumpida) para sobrevivir a breves cortes de energía, aproximadamente 400 dólares. Un switch de red gestionado, 300 dólares. Un cortafuegos físico con funciones de seguridad adecuadas, de 500 a 2.000 dólares. Discos duros de repuesto en el estante para el fallo inevitable, 200 dólares. Refrigeración — si los servidores vivían en la trastienda del restaurante, alguien tenía que contabilizar el calor que generaban, lo que significaba o un circuito de aire acondicionado dedicado o una sorpresa en la factura eléctrica.

Súmalo todo: entre 8.000 y 12.000 dólares al año en depreciación de capital y costes continuos, antes de pagarle a nadie por mantener, configurar o arreglar el hardware. Y «mantenimiento» no era solo una partida — era un requisito de experiencia. O contratabas a alguien que supiera operar servidores, o eras tú la persona operándolos a las 2 de la madrugada cuando algo salía mal.

«Y cuando se rompe», dijo Tom, «no sabemos cómo arreglarlo. Le pagaríamos a alguien tarifas de emergencia. Y mientras lo esperamos, el restaurante está a oscuras.»

«Compáralo con AWS», dijo Tom. Abrió la página de precios de EC2. Una instancia `t3.medium` — suficiente cómputo para la carga de trabajo inicial de Nimbus — costaba unos 30 dólares al mes. Dos de ellas, para redundancia, eran 60 dólares al mes, o 720 dólares al año.

Cuatro mil dólares al año en depreciación frente a 720. La diferencia no era reñida. Incluso si añadías redes, transferencia de datos y un servicio de base de datos gestionada en AWS, la factura de la nube para una carga de trabajo a escala de startup era una fracción del coste del hardware físico.

«Pero», dijo Tom, porque Tom siempre tenía un pero, «deberíamos ser honestos sobre cuándo deja de ser tan claro.»

Tenía razón. A escala enorme — miles de servidores, utilización constante — la economía cambia. Una empresa que opera 5.000 servidores al 90% de utilización las 24 horas podría descubrir que poseer hardware es más barato por unidad que alquilar a esos volúmenes. Las grandes empresas a veces llegan a este punto. Las startups casi nunca. Para una startup con crecimiento impredecible, sin experiencia en hardware y escala incierta, las cuentas de la nube eran obvias.

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

Pero aquí está la parte que la analogía no captura del todo: con AWS, el «local» puede crecer o encogerse para ajustarse a tu fiesta. Si aparecían cincuenta personas y luego llegaban inesperadamente doscientas más, el local se expandiría para acomodarlas. Si la fiesta terminaba antes, el local se contraería y dejarías de pagar por el espacio extra de inmediato.

Ningún alquiler de local funciona así. La computación en la nube sí.

Ese es el modelo de la nube. AWS tiene los «locales». Tú apareces cuando los necesitas.

Hay una segunda analogía que llega a una parte diferente del panorama.

Imagina que eres una startup que necesita fotografía profesional. Podrías contratar a un fotógrafo a tiempo completo — salario, equipo, beneficios, espacio de oficina, el paquete completo. O podrías contratar a un fotógrafo por hora cuando lo necesites, pagar por el trabajo hecho y dejarlo ir cuando termine la sesión.

El fotógrafo bajo demanda cuesta más por hora que uno asalariado. Pero a menos que necesites fotografía cada hora de cada día, el modelo bajo demanda es dramáticamente más barato en total. Y puedes contratar a un especialista diferente para trabajos diferentes — un fotógrafo de retratos para fotos de cabeza, un fotógrafo de producto para fotos de catálogo — sin mantener personal para ambos.

La computación en la nube tiene esta misma economía de la especialización. AWS mantiene equipos de especialistas para cada capa de la infraestructura: ingenieros de redes, administradores de bases de datos, investigadores de seguridad, expertos en adquisición de hardware. Accedes al resultado de su experiencia — una base de datos fiable, una red segura, un servidor bien configurado — por hora, sin contratar a ninguno de esos especialistas tú mismo.

Puede que te estés preguntando: si alquilar por hora es más caro que comprar directamente por unidad, ¿cómo funciona la economía? La respuesta es la utilización. Un servidor físico que posees está al 9% de CPU los martes tranquilos. Un servidor en la nube que alquilas por las horas que realmente necesitas funciona a la utilización que la carga de trabajo demande, y dejas de pagar cuando la carga de trabajo se detiene. El total que pagas por las horas que realmente usas es menor que el total que pagarías por el servidor parado en la esquina.

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
trabajo es mantener esas máquinas en funcionamiento. Tienen fuentes de alimentación redundantes. Tienen
generadores de respaldo. Tienen conexiones de red redundantes de múltiples proveedores.
Tienen una seguridad física que la mayoría de los edificios de oficinas no podrían acercarse a igualar.

No solo estás alquilando potencia informática. Estás alquilando fiabilidad.

«¿Cuánto cuesta eso?» preguntó Tom.

Ya llegaremos a eso. Los precios son un capítulo en sí mismos, y se lo merece.

**Tres Cosas que la Nube Hace de Manera Diferente**

Seamos concretos. Aquí están las tres diferencias principales entre gestionar tus
propios servidores y usar un proveedor de nube.

**1. Pagas por lo que usas.**

Sin servidor en reposo. Sin compra inicial. Si Nimbus no recibe ningún pedido un
lunes por la mañana, no paga casi nada. Si se desbordan en Nochevieja, AWS
tiene la capacidad lista automáticamente.

Este modelo ajusta el coste al valor de una manera que la infraestructura fija no puede. Cuando tus
costes siguen tus ingresos, la planificación financiera se vuelve más simple.

Hay un término para esto en contabilidad: pasar de gasto de capital a gasto operativo. CapEx es una compra inicial que amortizas a lo largo del tiempo — como comprar el Dell PowerEdge. OpEx es un gasto continuo que pagas a medida que avanzas — como la factura de AWS. Para una startup con capital limitado e ingresos inciertos, OpEx es dramáticamente preferible. No estás apostando 16.000 dólares a una previsión de demanda de la que no puedes estar seguro.

«Cada dólar que no gastamos en hardware», dijo Tom, «es un dólar que podemos gastar en realmente construir el producto.»

Ese no es un punto trivial. El coste inicial del hardware que Tom había calculado — 16.000 dólares por dos servidores de grado de producción — representaba el tipo de desembolso de capital que hace que los inversores hagan preguntas incómodas y obliga a los fundadores a tomar decisiones difíciles sobre la pista de despegue financiera.

**2. Alguien más se encarga del hardware.**

AWS mantiene las máquinas físicas. Los cables de red. Las fuentes de alimentación.
Los sistemas de refrigeración. Nimbus no contrata a nadie para esto. Se centran en su
aplicación, no en la infraestructura que hay por debajo.

Vale la pena detenerse en esto. La experiencia requerida para operar infraestructura física de
centros de datos es real. Sistemas de refrigeración, gestión de energía, calendarios de reemplazo de
hardware, redundancia de red — estas son disciplinas distintas. Al usar AWS, Nimbus
obtiene acceso a esa experiencia sin contratarla.

Un administrador de sistemas con las habilidades para mantener correctamente servidores de producción gana de 80.000 a 130.000 dólares al año. Un equipo capaz de manejar fallos de hardware, seguridad a nivel de sistema operativo, configuración de red y gestión de almacenamiento cuesta más. Los servicios de AWS cuestan una fracción de eso — y la experiencia operativa viene incluida en el servicio.

Este es el argumento de las economías de escala que AWS expone explícitamente. Como AWS opera infraestructura para miles de clientes simultáneamente, el coste por unidad de mantener esa experiencia se comparte entre todos ellos. Cada cliente individual obtiene acceso a operaciones de infraestructura de clase mundial por una factura que es una pequeña fracción de lo que esas operaciones costarían si las construyeran solos.

**3. Puedes escalar hacia arriba — y hacia abajo — al instante.**

Este es el que tarda un tiempo en apreciarse plenamente. Con servidores físicos, escalar
hacia arriba significa pedir nuevo hardware, esperar semanas para la entrega, configurarlo. Con AWS,
escalar hacia arriba significa hacer clic en un botón (o que el sistema lo haga automáticamente). Y cuando
ya no necesitas la capacidad adicional, reduces la escala. Dejas de pagar.

La parte de «y hacia abajo» está infravalorada. Reducir la escala en hardware físico significa que
sigues poseyendo el hardware, sigues pagando la electricidad, sigues manteniendo el sistema. Solo
tienes más de lo que necesitas. Con la nube, reducir la escala es real — los recursos desaparecen, y
el coste desaparece con ellos.

Leo describió esto como «la parte que se siente como hacer trampa». Había pasado años trabajando alrededor de sistemas de capacidad fija — estimando cuidadosamente cuánto servidor necesitaría, aprovisionando de manera conservadora, mirando el medidor de capacidad, y a veces equivocándose en ambas direcciones. La idea de que podía añadir un servidor, usarlo durante cuatro horas un viernes por la noche, y quitarlo — pagando solo por esas cuatro horas — se sentía mal de la manera en que las cosas demasiado buenas para ser verdad se sienten mal.

No era demasiado bueno para ser verdad. Era el modelo de negocio. AWS gana dinero cuando usas su infraestructura. Tienen todos los incentivos para hacer ese uso lo más libre de fricción posible.

Priya había estado callada durante esta explicación. Tenía una pregunta.

«¿Y si alguien intenta entrar por la fuerza? ¿De quién es ese problema?»

Y aquí es donde se pone interesante.

**El Modelo de Responsabilidad Compartida**

Este es uno de los conceptos más importantes de todo AWS. Es sencillo una vez que
lo entiendes, pero confunde a mucha gente — incluido en el examen.

AWS y tú compartís la responsabilidad de la seguridad. Pero cada parte es responsable de
cosas diferentes.

**AWS es responsable de la seguridad *de* la nube.**

Los centros de datos físicos. El hardware. La infraestructura de red. Los hipervisores
que ejecutan las máquinas virtuales. Si alguien entra en un centro de datos de AWS, ese es
el problema de Amazon. Si un disco físico falla y corrompe datos, ese es el problema de Amazon.
Si la infraestructura de red entre zonas de disponibilidad se ve comprometida, ese es
el problema de Amazon.

**Tú eres responsable de la seguridad *en* la nube.**

Tus datos. Tu aplicación. Tus cuentas de usuario y quién tiene acceso a qué. Las
configuraciones que eliges. Si alguien roba tu contraseña e inicia sesión en tu cuenta de AWS,
ese es tu problema. Si configuras mal una base de datos para que sea accesible públicamente,
ese es tu problema. Si tu aplicación tiene una vulnerabilidad que permite inyección SQL,
ese es tu problema.

Priya asintió lentamente. «Así que ellos protegen el edificio. Nosotros protegemos lo que hay dentro.»

«Exactamente», dijo Maya.

«¿Entonces si Leo abre un puerto que no debería...»

«Sigue siendo nuestro problema», confirmó Maya, mirando a Leo.

Leo ya estaba escribiendo algo en su portátil y fingía no escuchar.

Puede que te estés preguntando: ¿significa esto que AWS es responsable alguna vez de una brecha de datos? Solo si la brecha ocurre a nivel físico o de infraestructura — un centro de datos comprometido, un fallo de hardware, una vulnerabilidad en el propio hipervisor. Las brechas causadas por aplicaciones mal configuradas, contraseñas débiles o controles de acceso mal establecidos son siempre responsabilidad del cliente, sin importar cuán grande o reputado sea el proveedor de la nube.

**La Analogía del Aeropuerto**

Aquí hay una segunda manera de pensar en el Modelo de Responsabilidad Compartida, porque sale lo suficiente en el examen como para que valga la pena verlo desde dos ángulos.

Imagina un aeropuerto.

El operador del aeropuerto protege las instalaciones — las pistas, las terminales, las vallas, los controles de seguridad, lo que ocurre cuando se encuentra a alguien no autorizado cerca del depósito de combustible.

Pero una vez dentro, cada aerolínea es responsable de sus propias operaciones: su propio mantenimiento de aeronaves, sus propios procedimientos de tripulación, sus propios manifiestos de pasajeros. Si una aerolínea pierde el equipaje de un pasajero o un piloto se salta una lista de verificación, eso no es culpa del aeropuerto. Las instalaciones estaban protegidas. La aerolínea que operaba dentro de ellas tomó una mala decisión.

AWS es el aeropuerto. Tú eres la aerolínea que opera dentro de él. AWS protege la estructura física y la infraestructura central. Tú proteges tus datos, tus controles de acceso y tus decisiones de aplicación.

Esta analogía importa porque aclara dónde está la línea cuando las cosas salen mal. «Estamos en AWS, así que es su problema» es siempre la respuesta equivocada en el examen, y casi siempre la respuesta equivocada en el mundo real.

**El Tipo de Servicio Importa**

Hay un matiz más que vale la pena conocer ahora, aunque lo revisitaremos a lo largo del libro.

La división de la responsabilidad cambia según cuán gestionado sea un servicio.

Para EC2 — las máquinas virtuales que controlas — eres responsable de parchear el sistema operativo. AWS proporciona la máquina física y el hipervisor. Todo lo que está por encima del SO es tuyo.

Para RDS — el servicio de base de datos gestionada que cubrimos en el Capítulo 8 — AWS parchea el propio motor de la base de datos. Tú no gestionas el SO. Tu responsabilidad se reduce a la configuración de la base de datos, los datos que hay dentro y quién tiene acceso.

Para S3 — el servicio de almacenamiento de archivos — AWS gestiona la infraestructura por completo. Tu responsabilidad es el control de acceso (quién puede leer y escribir en tus buckets) y los datos en sí.

Cuanto más gestionado el servicio, más responsabilidad se traslada a AWS. Este es un patrón clave del examen: cuando una pregunta pregunta quién es responsable de algo, pregúntate «¿cómo de gestionado es este servicio?» primero.

**Si la Nube, Entonces Comodidad Pero No Control**

El modelo de la nube ofrece ventajas reales: sin hardware que gestionar, coste elástico, escala instantánea. Pero significa renunciar a algo también.

Si trasladas tu infraestructura a la nube, entonces ganas flexibilidad y reduces los costes de capital iniciales — pero renuncias al control total sobre las máquinas subyacentes. No puedes inspeccionarlas físicamente. No puedes garantizar dónde se sitúan dentro de un centro de datos. Dependes del tiempo de actividad de AWS, de las ventanas de mantenimiento de AWS y de la respuesta a incidentes de AWS cuando algo sale mal a nivel de infraestructura. Para la mayoría de los equipos, ese es un trato excelente. Para algunas industrias reguladas, requiere documentación cuidadosa y las certificaciones de cumplimiento de AWS. Conoce a qué estás renunciando antes de renunciar a ello.

## Fortalezas y Limitaciones

Ninguna herramienta es perfecta. Seamos honestos sobre ambas partes.

**Por qué la nube es excelente**:

- Sin costes de hardware iniciales
- Paga solo por lo que usas
- Escala al instante en ambas direcciones
- Fiabilidad profesional y seguridad física
- Acceso a cientos de servicios gestionados (bases de datos, colas, aprendizaje automático y más)
  sin tener que construirlos o mantenerlos tú mismo
- Alcance global: desplegar en una nueva geografía es un cambio de configuración, no un proceso
  de adquisición de hardware

**Donde se complica**:

- Los costes pueden ser impredecibles si no estás prestando atención (la futura pesadilla de Tom)
- Dependes de un tercero para tu infraestructura — si AWS tiene una interrupción en tu
  región, tu servicio también se ve afectado
- Hay una curva de aprendizaje. AWS tiene cientos de servicios. Saber cuál usar
  requiere experiencia, o un libro como este.
- Los datos que salen de la nube pueden ser caros. Mover grandes cantidades de datos fuera de AWS
  cuesta dinero. (Revisaremos esto en el Capítulo 30.)
- La dependencia del proveedor es real para los servicios de más alto nivel. Usar una base de datos gestionada de AWS es
  fácil de empezar y más difícil de abandonar. Cuantos más servicios específicos de AWS uses,
  más comprometido estás con el ecosistema y los precios de AWS.

«Entonces estamos intercambiando control por comodidad», dijo Tom.

«E intercambiando coste inicial por coste continuo», añadió Maya.

«E intercambiando el problema de otra persona por nuestro propio problema, en el lado de la seguridad», dijo Priya.

«Pero también estamos intercambiando el servidor roto de Leo por el servidor-muy-sin-romper de Amazon», dijo Leo,
que al parecer había estado escuchando todo el tiempo.

No estaba del todo equivocado.

Tom tenía una preocupación más.

«Si construimos todo en AWS y AWS sube los precios en tres años, no podemos exactamente
trasladar nuestra base de datos a la trastienda del restaurante.»

«Cierto», dijo Maya. «Pero la trayectoria de precios de Amazon ha sido generalmente a la baja — han
bajado los precios más de 100 veces desde 2006. El riesgo de dependencia es real, pero el riesgo
histórico real de aumentos de precio sorpresa es bajo.»

«Generalmente», dijo Tom. Lo anotó. Revisaría este cálculo, como
revisaba todos sus cálculos, en un futuro sábado por la mañana con un bolígrafo rojo y un café.

**Cuándo las Instalaciones Propias Son la Opción Correcta**

La nube gana la comparación de Nimbus claramente. Pero la honestidad intelectual requiere decir cuándo no gana.

**Las grandes empresas con cargas de trabajo estables y predecibles** a veces descubren que poseer hardware se vuelve competitivo en coste con alquilar una vez que la utilización es consistentemente alta. Si estás operando miles de servidores al 80% de utilización las 24 horas, la economía de la propiedad se ve diferente de como se ve para una startup con tráfico variable. El modelo de pago por uso de la nube es más ventajoso cuando la utilización es variable. Cuando la utilización es estable y alta, la economía por unidad de la propiedad puede ser competitiva. Por eso algunas grandes empresas operan arquitecturas híbridas: nube para cargas de trabajo variables, instalaciones propias para las estables.

**Los entornos de datos regulados con requisitos estrictos de localidad** pueden no tener más opción que las instalaciones propias. Los entornos de computación clasificada del gobierno — sistemas que manejan información clasificada de seguridad nacional — no pueden usar proveedores de nube comerciales. Los datos no pueden salir de una instalación físicamente controlada. Los sistemas financieros en ciertas jurisdicciones tienen requisitos similares. Las organizaciones de salud que procesan ciertas categorías de datos pueden enfrentar requisitos que las certificaciones de nube comercial no satisfacen plenamente. En estas situaciones, las instalaciones propias no son una preferencia; son un mandato.

**Los requisitos de latencia extremadamente baja y proximidad física** crean una tercera categoría. Algunos sistemas de trading financiero necesitan latencia de submilisegundos entre su aplicación y el motor de emparejamiento de la bolsa. La colocación en el mismo centro de datos físico que la bolsa — con conexiones de fibra directas — logra latencias que ninguna región de la nube podría igualar. Algunos instrumentos científicos — aceleradores de partículas, redes sísmicas, radiotelescopios — generan datos que deben procesarse localmente antes de que la transmisión sea factible. Estos son casos de uso reales que requieren proximidad física al hardware.

**Los contratos existentes a largo plazo** son la restricción más mundana pero a menudo más relevante. Una empresa que firmó un contrato de arrendamiento de centro de datos a cinco años en 2022 tiene una obligación contractual. Mudarse a la nube antes de que expire el arrendamiento tiene un coste real — los pagos restantes del arrendamiento — que cambia la economía significativamente. Las decisiones de arquitectura no ocurren en el vacío. Ocurren en organizaciones con contratos existentes, calendarios de depreciación de hardware existentes y experiencia de personal existente.

«¿Somos algo de eso?» preguntó Maya.

«No», dijo Tom. «No tenemos hardware. Ni contratos. Ni mandatos regulatorios. Y un equipo sin experiencia en administración de servidores.»

«Entonces, nube.»

«Nube. Pero saber cuándo no es la respuesta es parte de saber lo que estás haciendo.»

Ninguna de las excepciones de las instalaciones propias se aplica a Nimbus. Pero son reales, y un buen arquitecto de nube sabe cuándo decir «la nube no es la respuesta correcta aquí». El objetivo no es ser un defensor de la nube. El objetivo es tener razón.

## Resumen

La pregunta que Tom no podía quitarse de encima — ¿por qué es más barato alquilar que poseer? — resultó tener una respuesta simple y una complicada. La respuesta simple es la utilización: dejas de pagar por una capacidad que está parada los martes tranquilos. La respuesta complicada involucra el Modelo de Responsabilidad Compartida, la concesión entre CapEx y OpEx, y unas cuantas situaciones honestas donde la nube es en realidad la opción equivocada. Tom hizo bien en hacer la pregunta. La respuesta cambió cómo el equipo pensaba sobre todo lo que siguió.

- El beneficio principal es el escalado de pago por uso: pagas solo por lo que usas, y puedes escalar hacia arriba o hacia abajo según sea necesario.
- La comparación de costes de Tom mostró la economía del hardware claramente: 720 $/año por dos instancias EC2 frente a 8.000-12.000 $/año por hardware físico equivalente, antes de los costes de mantenimiento.
- AWS se encarga de la infraestructura física. Tú te encargas de tu aplicación, tus datos y tus configuraciones. Esta división se llama el **Modelo de Responsabilidad Compartida**.
- El Modelo de Responsabilidad Compartida cambia según el tipo de servicio — más servicios gestionados significan más responsabilidad de AWS.
- La nube no siempre es más barata o más simple — pero elimina barreras para empezar y hace posible el escalado de maneras que los servidores físicos no pueden igualar.

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
- El examen puede describir un escenario donde una empresa pasa de «comprar servidores» a «la nube». El encuadre correcto: pasar de CapEx a OpEx, eliminar costes iniciales, ganar elasticidad y trasladar la responsabilidad de la infraestructura al proveedor de la nube.

## Ejercicios

**Ejercicio 1 — Recordar**

Con tus propias palabras: explica el Modelo de Responsabilidad Compartida. ¿Quién es responsable de qué
y por qué importa esa distinción?

*(Pista: Piensa en la analogía de Priya — ¿quién protege el edificio y quién protege lo que hay
dentro?)*

**Ejercicio 2 — Escenario SAA-C03**

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

«Espera — pero ¿*por qué* estaríamos en Singapur?» dijo Maya. «Todos nuestros clientes están en la Costa Oeste.»

En el próximo capítulo: la geografía de AWS — dónde están los servidores realmente y por qué importa.
