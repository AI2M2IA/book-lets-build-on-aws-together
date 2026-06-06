# Capítulo 2: ¿Dónde Está Tu Servidor en el Mundo?

Levántate. Acércate a una ventana si hay una cerca.

Mira afuera. Lo que sea que veas — edificios, árboles, un aparcamiento, el jardín de alguien —
nada de eso es donde viven tus datos. Tus datos viven en otro lugar completamente distinto. Probablemente
en algún lugar donde nunca hayas estado.

Eso no es un problema. Pero entender *dónde* hace que un número sorprendente de cosas
encajen.

Después de la sesión de pizarra, la decisión estaba tomada: Nimbus usaría AWS. La nube era la respuesta. Pero «la nube» resultó ser una cosa específica en una ubicación específica — y Leo había elegido esa ubicación sin querer.

A la mañana siguiente, Maya se dio cuenta de que el servidor estaba en Singapur.

«¿Por qué Singapur?» preguntó.

«Era el valor predeterminado», dijo Leo.

Tom levantó la vista de su café. «¿Cuánto cuesta ejecutar un servidor en Singapur cuando
todos nuestros clientes están en la Costa Oeste?»

Leo no tenía respuesta.

Priya ya tenía una preocupación diferente. «¿Y quién sabe por qué jurisdicciones está pasando esos datos?»

Este capítulo trata sobre cómo corregir esa decisión — y entender por qué importa.

**El Problema con «Algún Lugar»**

Cuando usas AWS, no estás usando un centro de datos. Estás usando una red global de
ellos. AWS tiene infraestructura en decenas de países.

Eso es una característica, no solo un hecho. Pero significa que tienes que tomar una decisión: *¿dónde*
quieres que se ejecute tu infraestructura?

La decisión importa por tres razones:

**Rendimiento.** Cuanto más cerca estén tus servidores de tus usuarios, más rápida es la respuesta.
La física no negocia. Los datos viajan a aproximadamente dos tercios de la velocidad de la luz
a través de cables de fibra óptica. Una ida y vuelta de Seattle a Singapur tarda unos 170
milisegundos solo en tránsito — antes de que tu aplicación haga nada. Esa misma
solicitud de Seattle a Oregón (`us-west-2`) tarda unos 20 milisegundos. La
diferencia no es un error de redondeo. Para una app de pedidos de restaurante donde los clientes
esperan que las páginas se sientan instantáneas — y donde una sola página desencadena varias idas
y vueltas — 170 ms de latencia base por ida y vuelta es la diferencia entre un producto rápido
y uno lento.

Tom sacó su teléfono, abrió la app de Nimbus y cargó la página de un restaurante. La cronometró con una app de cronómetro.

«Casi tres segundos», dijo.

Leo revisó el desglose de latencia en los registros del servidor. Solo la ida y vuelta a Singapur — nada que ver con consultas a la base de datos — añadía unos 170 milisegundos por solicitud, y la app hacía múltiples idas y vueltas por página.

«¿Y si movemos el servidor a Oregón?» preguntó Tom.

«Veinte milisegundos», dijo Leo. «Quizás menos.»

«¿Cuánto cuesta eso al mes?»

La diferencia de precio era de unos pocos puntos porcentuales. No cero, pero no la variable principal. Movieron el servidor a `us-west-2` esa tarde.

«Ya desplegué el agente de monitorización en la instancia de Singapur», dijo Leo, medio para sí mismo. «Oh.» Hizo una pausa. «Lo configuraré en Oregón en su lugar.»

**Cumplimiento.** Algunas industrias tienen leyes sobre dónde pueden almacenarse los datos. Los datos sanitarios estadounidenses pueden
necesitar permanecer dentro del país. Los datos financieros pueden necesitar permanecer dentro de una región específica.
Elegir la Región incorrecta puede crear problemas legales.

Priya había investigado esto antes de que nadie se lo pidiera.

«GDPR», dijo, levantando la vista de sus notas en el standup de la mañana siguiente. «Si Nimbus alguna vez atiende a clientes en la Unión Europea — aunque sea un solo cliente — los datos personales sobre ellos pueden necesitar permanecer dentro de la UE o en un país con protecciones equivalentes. Eso no es opcional. Es la ley.»

«Somos una app de pedidos de restaurante», dijo Leo. «En California.»

«Por ahora», dijo Priya. «¿Hemos pensado en qué pasa si nos expandimos a Europa en dieciocho meses y nos damos cuenta de que hemos estado almacenando datos de clientes europeos en Oregón durante un año y medio?»

Una pausa.

«Lo arreglaríamos entonces», dijo Leo.

«No puedes arreglar violaciones retroactivas de residencia de datos», dijo Priya. «La violación ya ocurrió.»

No estaba siendo dramática. Las multas del GDPR llegan hasta el 4% de los ingresos globales anuales. Las violaciones de HIPAA en la sanidad estadounidense pueden alcanzar más de 2 millones de dólares por categoría de violación al año. Estos no son hipotéticos — son la razón por la que las grandes decisiones de nube empresarial empiezan con el mapeo de cumplimiento, no con la configuración de la infraestructura.

Para Nimbus, la exposición regulatoria inmediata era baja: clientes estadounidenses, sin datos sanitarios, sin servicios financieros. Pero elegir una Región para un negocio que pretende crecer significa elegir teniendo el crecimiento en mente.

**Resiliencia ante desastres.** Si una ubicación sufre un corte de electricidad, un terremoto o un fallo de red,
quieres que tu sistema sobreviva. Distribuir la infraestructura en múltiples
ubicaciones es la forma de protegerse contra desastres locales.

**Cómo AWS Organiza su Infraestructura**

AWS divide su infraestructura global en tres conceptos anidados. Piensa en ellos como
muñecas rusas, de mayor a menor: una muñeca grande que se abre para revelar una
muñeca mediana, que se abre para revelar una pequeña. Cada capa anidada dentro de la siguiente.

La muñeca más externa es lo que AWS llama una **Región**. Dentro de una Región se sitúa un clúster de
**Zonas de Disponibilidad**. Y dispersas por todo el globo, independientes de ambas,
están las **Ubicaciones de Borde**.

Abramos cada una.

**Regiones: Las Cajas Grandes**

Una **Región** es un área geográfica donde AWS tiene un clúster de centros de datos. Cada Región
se nombra según su ubicación: `us-west-2` es Oregón, `us-east-1` es Virginia del Norte,
`eu-west-1` es Irlanda, `ap-southeast-1` es Singapur — donde se escondía el servidor de Leo.

Hay casi 40 Regiones en todo el mundo, y AWS añade más regularmente. La lista sigue creciendo
a medida que AWS se expande: hay Regiones en Norteamérica, Sudamérica, Europa, Oriente Medio,
Asia Pacífico y África. Cada nueva Región normalmente se anuncia meses antes de abrir,
incluye al menos tres Zonas de Disponibilidad en su lanzamiento, y tarda unos años antes de que todos los servicios
de AWS estén disponibles en ella.

Cada Región es completamente independiente. Los datos en `us-west-2` permanecen en `us-west-2` a menos que
los muevas explícitamente. Esto es fundamental para el cumplimiento y la resiliencia — una gran
interrupción en una Región no afecta automáticamente a las otras. Un evento que interrumpe la red
eléctrica en Virginia del Norte no afecta a Oregón. Un desastre natural en Irlanda no
afecta a Singapur. Las Regiones están genuinamente aisladas entre sí a nivel de infraestructura
física.

La independencia es tan completa que si una Región está experimentando una gran interrupción, incluso la
consola de gestión de AWS podría cargarse lentamente — porque la propia consola se ejecuta en infraestructura
de AWS. Esto vale la pena saberlo: durante un incidente real de AWS, puede que te resulte difícil
acceder a las herramientas de monitorización que necesitas precisamente cuando más las necesitas. Esto es parte de por qué
los equipos experimentados monitorizan sus propios servicios de forma independiente de la consola de AWS.

«¿Entonces deberíamos elegir `us-west-2` para Nimbus?» preguntó Tom.

Sí. Para una empresa estadounidense que atiende a clientes de la Costa Oeste, sí. Menor latencia y tus usuarios
obtienen respuestas más rápidas.

«¿Cuánto más cara es que Singapur?» añadió Tom.

El precio varía según la Región — generalmente en unos pocos puntos porcentuales. El beneficio de rendimiento y cumplimiento
de la Región correcta vale la pequeña diferencia de precio.

**El Debate de Selección de Región que Nimbus Casi Falla**

Antes de que el equipo se decidiera por `us-west-2`, hubo una breve discusión sobre si `us-east-1` (Virginia del Norte) tenía más sentido. Es la Región más antigua, la más grande, donde AWS lanza nuevos servicios primero. También es la Región más barata en la mayoría de las páginas de precios. A Tom le gustaba esto.

«Pero nuestros usuarios están en California, Oregón y Washington», dijo Maya. «¿Por qué ejecutaríamos nuestros servidores al otro lado del país?»

«Más barato», dijo Tom. «Y más servicios disponibles.»

«Espera — pero ¿*por qué* lo haríamos de esa manera?» dijo Maya. «Nuestros usuarios están en la Costa Oeste. Nuestros servidores deberían estar en la Costa Oeste. La diferencia de precio es de cuánto, ¿seis por ciento? ¿Siete? Gastaríamos más en la latencia extra en clientes perdidos de lo que ahorraríamos en facturas de cómputo.»

Tenía razón. La Región correcta para una carga de trabajo es la Región más cercana a los usuarios que más importan — a menos que el cumplimiento, la disponibilidad de servicios o el diferencial de coste justifiquen la concesión. Para Nimbus, ninguno lo hacía.

Esta es una decisión que parece pequeña y no lo es. Los equipos que eligen `us-east-1` porque «es el valor predeterminado» y luego atienden a usuarios de la Costa Oeste desde la Costa Este están dejando rendimiento real sobre la mesa. La consola de AWS tiene `us-east-1` por defecto por razones históricas. No es una recomendación.

**Zonas de Disponibilidad: La Redundancia Real**

Aquí es donde se pone interesante.

Cada Región no es un único centro de datos. Es un clúster de múltiples centros de datos físicamente separados
llamados **Zonas de Disponibilidad** (o AZs, por sus siglas en inglés).

Oregón (`us-west-2`) tiene cuatro Zonas de Disponibilidad: `us-west-2a`, `us-west-2b`,
`us-west-2c`, `us-west-2d`. Son edificios reales, separados a distancias significativas — lo suficientemente
lejos como para que un incendio, una inundación o un corte de electricidad en uno no afecte a los demás, pero lo suficientemente
cerca como para que la red entre ellos sea extremadamente rápida (latencia de un solo dígito en milisegundos).

¿Qué tan lejos es «distancia significativa»? AWS no publica coordenadas exactas, pero investigadores independientes estiman que las AZs dentro de una Región están normalmente separadas por decenas de kilómetros — lo suficientemente lejos como para estar en redes eléctricas diferentes y rutas de fibra diferentes, no tan lejos como para que la velocidad de la luz se convierta en un factor limitante para la replicación síncrona.

Esta separación es deliberada e importante. Si dos AZs compartieran la misma subestación eléctrica, un fallo de la subestación tiraría abajo ambas AZs simultáneamente — eliminando la redundancia. La separación física asegura que los fallos de modo común (del tipo que afecta a toda un área geográfica) sean eventos genuinamente raros en lugar de riesgos previsibles.

Esta es la arquitectura que hace que AWS sea fiable a un nivel que ningún centro de datos individual puede igualar.

Priya se inclinó hacia adelante. «Entonces si ejecutamos nuestra aplicación en dos Zonas de Disponibilidad y
una cae...»

«La otra sigue funcionando», terminó Maya.

«Exactamente.»

Leo, que había estado escuchando en silencio: «Lo desplegué todo en una AZ.»

«Sí», dijo Priya. «Lo notamos.»

El concepto de distribuir tu aplicación en múltiples AZs — llamado **despliegue Multi-AZ**
— es uno de los patrones de resiliencia más importantes en AWS. Profundizamos en
ello en el Capítulo 18. Por ahora, entiende que las AZs existen específicamente para hacer esto posible.

Un matiz que vale la pena conocer: los nombres de las AZs (`us-west-2a`, `us-west-2b`, etc.) no son consistentes entre cuentas de AWS. Lo que aparece como `us-west-2a` en tu cuenta puede ser un centro de datos físico diferente del que aparece como `us-west-2a` en la cuenta de un colega. AWS aleatoriza el mapeo para evitar que todos los clientes desplieguen en la misma AZ física cuando usan «a» por defecto. Si necesitas coordinar en qué AZ física estás con otra cuenta (para comunicación de baja latencia entre cuentas, por ejemplo), AWS proporciona IDs de AZ — identificadores estables que mapean a la misma ubicación física entre cuentas. Las AZs con nombre (`2a`, `2b`) son relativas a la cuenta. Los IDs de AZ (`usw2-az1`, `usw2-az2`) son físicos. El examen evalúa esta distinción ocasionalmente.

**Cómo Se Ve Realmente un Fallo de AZ**

Esto no es abstracto. Veamos una cronología real.

Son las 2:47 p. m. de un martes. Un fallo eléctrico en uno de los transformadores que suministra energía a `us-west-2b` causa una interrupción en ese centro de datos. El evento no está previsto.

Si Nimbus se ejecuta enteramente en `us-west-2b`:
- 2:47 p. m.: la instancia EC2 pierde energía. El servidor de base de datos pierde energía.
- 2:47 p. m.: las solicitudes entrantes a la app de Nimbus empiezan a fallar con tiempos de espera de conexión agotados.
- 2:47 p. m.: las alertas de monitorización de Tom se disparan.
- 2:50 p. m.: Leo comienza el proceso de recuperación. Lanza una nueva instancia EC2 en `us-west-2a`.
- 3:05 p. m.: la base de datos vuelve a estar en línea desde una restauración de snapshot.
- 3:12 p. m.: la aplicación se reconfigura para apuntar al nuevo endpoint de la base de datos.
- 3:20 p. m.: Nimbus vuelve a servir tráfico.

Eso son 33 minutos de tiempo de inactividad. Durante el servicio de cena del viernes, 33 minutos podrían costar miles en pedidos perdidos y el tipo de daño reputacional que no aparece en el informe del incidente.

Si Nimbus se ejecuta a través de `us-west-2a` y `us-west-2b` con un despliegue Multi-AZ adecuado:
- 2:47 p. m.: la instancia EC2 en `us-west-2b` pierde energía.
- 2:47 p. m.: el Application Load Balancer detecta la instancia no saludable mediante comprobaciones de estado.
- 2:47 p. m.: el ALB deja de enrutar tráfico a la instancia fallida, automáticamente.
- 2:47 p. m.: el tráfico sigue fluyendo hacia la instancia en `us-west-2a`.
- 2:48 p. m.: el Auto Scaling Group lanza una instancia de reemplazo.
- 2:55 p. m.: el reemplazo pasa las comprobaciones de estado y se reincorpora a la flota.

Tiempo de inactividad: cero. Impacto en el cliente: casi cero. La monitorización de Tom se dispara, pero la acción de Leo es «observar y confirmar que la recuperación se completó», no «reconstruir todo manualmente».

Esta es la diferencia entre Multi-AZ y una sola AZ. El límite de la AZ es donde el diseño de redundancia de AWS se convierte en la resiliencia de tu aplicación.

**Matemáticas de Fiabilidad Multi-AZ**

AWS diseña cada AZ para que sea independiente — no solo físicamente, sino con energía, refrigeración y redes separadas. La probabilidad de que dos AZs en la misma Región fallen simultáneamente está diseñada para ser extremadamente baja.

Si una sola AZ tiene un 99,9% de disponibilidad (unas 8,7 horas de tiempo de inactividad al año), entonces una arquitectura de dos AZs que trata los fallos como eventos independientes tiene aproximadamente un 99,9999% de disponibilidad para el mismo modo de fallo — unos 31 segundos de tiempo de inactividad al año por fallos de AZ.

En la práctica, el factor limitante para la mayoría de las aplicaciones no es la disponibilidad de la AZ. Es el código de la aplicación, el proceso de despliegue y la base de datos. Pero las matemáticas ilustran por qué Multi-AZ es la base estándar: el coste de ejecutar en dos AZs es modesto; la mejora de disponibilidad es grande.

**Ubicaciones de Borde: Velocidad en Todas Partes**

Las AZs resuelven la resiliencia. No resuelven el problema de servir contenido rápidamente a los usuarios en
ciudades lejos de tu Región principal.

Entran en juego las **Ubicaciones de Borde**.

Las Ubicaciones de Borde son puntos de infraestructura pequeños y ligeros — más de 750 puntos de
presencia distribuidos por más de 100 ciudades de todo el mundo. No son centros de datos completos — no pueden
ejecutar tu aplicación.
Lo que *sí* pueden hacer es almacenar en caché contenido cerca de tus usuarios.

Imagina una imagen de menú almacenada en un servidor en Virginia. Cada vez que alguien en Tokio quiere
verla, la solicitud viaja a través del Pacífico y vuelve. Con las Ubicaciones de Borde, AWS puede almacenar una
copia de ese archivo en Tokio y servirlo localmente — milisegundos en lugar de cientos de
milisegundos.

Esta es la columna vertebral de CloudFront, la red de entrega de contenido de AWS. Profundizamos en
CloudFront en el Capítulo 13. Por ahora: las Ubicaciones de Borde son sobre velocidad para el contenido estático.

Puede que te estés preguntando: si las Ubicaciones de Borde almacenan contenido en caché, ¿también almacenan tus datos permanentemente? No. Las Ubicaciones de Borde guardan copias temporales del contenido para servirlo más rápido — el original siempre vive en tu Región. Si la caché expira o el contenido cambia, la Ubicación de Borde obtiene una copia fresca de la fuente.

La red de Ubicaciones de Borde es independiente de la estructura de Región y AZ. Cuando piensas en dónde se *ejecuta* tu aplicación, piensas en Regiones y AZs. Cuando piensas en cómo llega el contenido a tus usuarios *rápidamente*, piensas en Ubicaciones de Borde y CloudFront. Resuelven problemas diferentes y operan en capas diferentes.

AWS también tiene un concepto relacionado llamado **Cachés de Borde Regionales** — nodos de caché más grandes que se sitúan entre tu Región y las Ubicaciones de Borde. Si una Ubicación de Borde en una ciudad no tiene una copia en caché de un archivo, la obtiene de la Caché de Borde Regional en lugar de ir todo el camino de vuelta a tu Región. Esto reduce la carga sobre tu origen y mejora las tasas de aciertos de caché para contenido menos popular. No configuras las Cachés de Borde Regionales directamente — son parte de la infraestructura de CloudFront que opera automáticamente.

La conclusión práctica para Nimbus: cuando el equipo añada CloudFront en el Capítulo 13, las imágenes de menú que solían viajar desde Oregón al navegador de un cliente en cada solicitud se servirán en su lugar desde la Ubicación de Borde más cercana — Dallas para clientes de Texas, Atlanta para clientes de Georgia, Chicago para clientes de Illinois. El usuario en Chicago obtiene su imagen de menú de un servidor a 480 kilómetros de distancia en lugar de a 3.200 kilómetros. La diferencia es medible y significativa.

**Una Advertencia Sobre las Copias en Caché**

Hay un detalle sobre las Ubicaciones de Borde que vale la pena señalar ahora, aunque la historia completa pertenece al Capítulo 13: una copia en caché es una *copia*, y las copias pueden quedar obsoletas. Si el original cambia en tu Región, la Ubicación de Borde puede seguir sirviendo la versión antigua durante un tiempo. Cuánto tiempo, y qué puedes hacer al respecto, son exactamente el tipo de controles que te da un CDN — y exactamente lo que el equipo abordará cuando Nimbus despliegue CloudFront de verdad. Por ahora, llévate solo esto: el contenido puede vivir cerca del usuario, y «cerca» a veces significa «ligeramente desactualizado».

**Elegir una Región: La Lista de Verificación del Ingeniero Senior**

Si Nimbus algún día se expande para atender a usuarios en México y Colombia — un escenario que
practicaremos en los ejercicios de este capítulo — la decisión de la Región no es arbitraria. El razonamiento es el siguiente:

**1. ¿Dónde están tus usuarios?**

Empieza aquí. Elige la Región más cercana a la mayoría de tus usuarios. La latencia es el impacto
más directo y medible de la elección de Región.

La distancia física entre un usuario y un servidor importa de una manera que es fácil de
subestimar. Una ida y vuelta de 170 ms a Singapur frente a una de 20 ms a Oregón no es
una métrica de rendimiento abstracta — es la diferencia entre una página que se siente
instantánea y una página que se siente lenta. En un dispositivo móvil con latencia de radio
adicional, la penalización de Singapur se agrava aún más. Para un usuario en San José, `us-west-2`
(Oregón) es la Región correcta antes de que siquiera consideres cualquier otro factor.

**2. ¿Hay requisitos de cumplimiento?**

Las cargas de trabajo sanitarias, financieras y gubernamentales suelen tener reglas estrictas de residencia de datos.
Conoce tu entorno regulatorio antes de elegir. El GDPR requiere que los datos personales de los residentes de la UE se almacenen en jurisdicciones con protección de datos adecuada — ya sea la propia UE o un país con una decisión de adecuación. HIPAA requiere salvaguardas documentadas para los datos sanitarios estadounidenses. Estas no son consideraciones opcionales para revisar más tarde.

En la práctica: habla con tu equipo legal antes de elegir una Región para cualquier carga de trabajo regulada. AWS mantiene una documentación de cumplimiento extensa para cada Región, incluyendo certificaciones como SOC 2, ISO 27001, PCI DSS y elegibilidad para HIPAA. Pero las certificaciones te dicen lo que AWS ha hecho; tu equipo legal te dice si eso es suficiente para tu contexto regulatorio específico.

**3. ¿Qué servicios necesitas?**

No todos los servicios de AWS están disponibles en todas las Regiones. Los nuevos servicios se lanzan primero en `us-east-1`.
Si necesitas un servicio específico, verifica que tu Región objetivo lo admita.

Esto es menos preocupante para los servicios de este libro — todos los servicios principales están
ampliamente disponibles — pero importa para los servicios más nuevos, el hardware especializado (algunos tipos
de instancia con GPU solo existen en ciertas Regiones) y AWS GovCloud (una Región separada
diseñada para cargas de trabajo del gobierno de EE. UU. con requisitos regulatorios específicos).

**4. ¿Cuál es el precio?**

Las Regiones varían en precio. `us-east-1` (Virginia del Norte) tiende a ser la más barata debido a
su escala y antigüedad. Sudamérica es ligeramente más cara. Comprueba la página de precios de AWS
antes de decidir.

El diferencial de precio suele ser pequeño — de unos pocos a un diez por ciento entre las Regiones populares. Rara vez es el factor decisivo. Pero para una carga de trabajo sensible al coste que ejecuta miles de instancias, incluso una diferencia de precio del 5% se acumula con el tiempo. Tom comprobaría el número y lo tendría en cuenta, como Tom comprobaba todos los números y los tenía en cuenta.

**5. ¿Necesitas múltiples Regiones?**

Para la mayoría de las aplicaciones, múltiples AZs dentro de una Región son suficientes para la resiliencia. Para
aplicaciones críticas donde incluso una interrupción regional es inaceptable, diseñas para
múltiples Regiones — pero eso es un compromiso arquitectónico significativo. No lo hagas
de forma especulativa.

«¿Cuál es la regla para cuándo añadimos una segunda Región?» preguntó Leo.

«Cuando tengamos un requisito documentado que diga "debe permanecer operativo si toda una Región de AWS no está disponible"», dijo Priya. «No "sería bonito". Un requisito específico, con una justificación de negocio específica, que hayamos sopesado contra la complejidad y el coste.»

«¿Cómo se ve eso en la práctica?»

«Un contrato con un cliente con un SLA que requiera un 99,99% de tiempo de actividad. Un mandato regulatorio de redundancia geográfica. Un escenario de pérdida de región que podamos cuantificar de verdad en términos de ingresos. No solo "qué pasa si us-west-2 cae".»

Leo miró la arquitectura actual de Nimbus. Seguían en una sola AZ.

«Multi-AZ primero», dijo.

«Multi-AZ primero», confirmó Priya.

**La Limitación de la que Nadie Habla**

Las Regiones son poderosas, pero crean una tensión importante.

Ejecutarse en múltiples Regiones es genuinamente difícil.

La replicación de datos entre Regiones tiene latencia. Mantener dos Regiones sincronizadas — para que una
transacción en la Región A sea instantáneamente visible en la Región B — es uno de los problemas más difíciles
de los sistemas distribuidos. AWS proporciona herramientas para ello, pero cuesta dinero y añade
complejidad operativa.

La mayoría de las aplicaciones deberían empezar con una Región, múltiples AZs y expandirse a múltiples Regiones
solo cuando tengan un requisito claro: mandatos regulatorios, SLAs contractuales que requieren
un tiempo de inactividad regional casi nulo, o una base de usuarios genuinamente distribuida entre continentes.

Replicar datos entre regiones añade coste — la transferencia de datos entre regiones es una de las partidas más subestimadas en una factura de AWS. También añade complejidad operativa: cada escritura que debe ser consistente entre regiones añade latencia.

La mayoría de los fallos que afectan a las aplicaciones reales no son catástrofes entre regiones. Son problemas dentro de la región como un grupo de seguridad mal configurado o un despliegue fallido. El dramático escenario de «toda la región cae» aparece en los titulares precisamente porque es raro. Invierte en Multi-AZ antes que en múltiples regiones. Añade múltiples regiones cuando el caso de negocio sea claro.

Para ponerle números específicos: AWS ha tenido un pequeño número de eventos significativos de una sola región a lo largo de su historia. Las interrupciones regionales completas son genuinamente poco comunes. Los eventos a nivel de AZ — interrupciones breves que afectan a un centro de datos dentro de una región — son menos raros y son exactamente lo que el despliegue Multi-AZ está diseñado para absorber. La frecuencia de eventos de AZ comparada con los eventos regionales es aproximadamente un orden de magnitud mayor. Dedicar el esfuerzo arquitectónico al modo de fallo más común primero es la elección racional.

La arquitectura multi-Región prematura es uno de los errores más comunes y costosos
que cometen los ingenieros junior cuando empiezan a sentirse seguros.

Tom asintió. «Entonces no hacemos múltiples Regiones solo porque podemos.»

«No hasta que lo necesitemos», dijo Maya. «Y sabremos cuándo lo necesitamos.»

«¿Cómo lo sabremos?» preguntó Leo.

«Cuando tu documento de revisión de arquitectura tenga un requisito que diga "debe sobrevivir a una interrupción
regional"», dijo Priya. «¿Hemos pensado en qué pasa si toda una AZ cae antes de que siquiera hayamos configurado Multi-AZ? Deberíamos arreglar eso primero. Hasta entonces: Multi-AZ.»

Puede que te estés preguntando: ¿cómo verificas que tu despliegue Multi-AZ realmente funciona antes de necesitarlo? Lo pruebas. AWS proporciona una herramienta llamada **AWS Fault Injection Service (FIS)** — anteriormente Fault Injection Simulator — que puede simular fallos de AZ, terminaciones de instancias y otras condiciones de fallo contra tu arquitectura en funcionamiento — para que puedas observar cómo se comporta tu sistema bajo condiciones de fallo de manera controlada, en lugar de descubrir el comportamiento durante un incidente real. Probar tu arquitectura de resiliencia es tan importante como construirla. Priya puso «prueba de inyección de fallos» en el calendario de revisión de arquitectura trimestral inmediatamente después de leer sobre ello.

## Cuando AWS Viene a Ti: Outposts y Wavelength

Las Regiones y las Zonas de Disponibilidad cubren el mundo — pero no todos los problemas se resuelven moviendo datos a AWS. Algunas cargas de trabajo deben permanecer en las instalaciones propias: sistemas de planta de fabricación que necesitan latencia de submilisegundos, aplicaciones sanitarias con requisitos de residencia de datos, sistemas de punto de venta minorista en tiendas sin internet fiable. Para estos, AWS extiende su infraestructura a la ubicación del cliente.

«Espera — ¿y si eventualmente trabajamos con un sistema hospitalario?» preguntó Priya. «Su software de monitorización de pacientes literalmente no puede tolerar una ida y vuelta a la nube. Y puede que legalmente no se le permita salir del edificio.»

Maya abrió la documentación de AWS. Dos servicios seguían apareciendo.

**AWS Outposts**

Un rack totalmente gestionado de hardware de AWS instalado en tu propio centro de datos o instalación de colocación. Outposts ejecuta la misma infraestructura, servicios, APIs y herramientas de AWS que la nube de AWS — EC2, EBS, RDS, EKS, S3 en Outposts — pero físicamente en tu edificio.

Casos de uso: cargas de trabajo de fabricación sensibles a la latencia, requisitos de residencia de datos donde los datos deben permanecer físicamente en una ubicación específica, aplicaciones que necesitan las APIs de AWS pero no pueden tolerar brechas de conectividad con la nube pública.

Punto clave: Outposts sigue siendo gestionado por AWS. AWS lo instala, lo parchea y lo monitoriza. Tú posees el espacio del rack y la energía. Las APIs y las herramientas son idénticas a la nube pública — las mismas plantillas de CloudFormation, las mismas políticas de IAM, los mismos comandos de la CLI. La distinción en el examen es la ubicación física, no el modelo operativo.

«Así que es AWS, pero en el edificio de nuestro cliente», dijo Leo.

«Exactamente», dijo Maya. «Mismas APIs. Código postal diferente.»

**AWS Wavelength**

Infraestructura de AWS desplegada dentro de las redes 5G de los proveedores de telecomunicaciones. Las Zonas Wavelength se sitúan en el borde de las redes 5G, físicamente cerca de los usuarios móviles, permitiendo latencia de un solo dígito en milisegundos para aplicaciones móviles.

Casos de uso: juegos en tiempo real, RA/RV, telemetría de vehículos autónomos, procesamiento de vídeo en vivo en el borde 5G.

«Ese no es para un hospital», dijo Tom. «Ese es para alguien que construye la próxima generación de juegos móviles multijugador.»

«O telemetría de coches autónomos», dijo Priya. «Cualquier cosa donde un dispositivo móvil necesita hablar con un servidor y 50 milisegundos es demasiado lento.»

**La diferencia:** Outposts lleva AWS a tu centro de datos — tu edificio, tu rack, tu energía. Wavelength lleva AWS al borde de la red de telecomunicaciones — físicamente colocado junto a la infraestructura de radio 5G, cerca de los usuarios móviles que nunca tocan tu red privada.

**AWS Local Zones**

Hay un tercer hermano en esta familia — y en el examen, es el más frecuentemente evaluado de los tres. Las **Local Zones** son infraestructura de AWS desplegada en grandes áreas metropolitanas que no tienen una Región completa — Los Ángeles, Houston, Miami, Lagos y docenas más. Una Local Zone es una extensión de una Región matriz: ejecutas EC2, EBS y un subconjunto de otros servicios *en la propia metrópoli*, obteniendo latencia de un solo dígito en milisegundos para los usuarios de esa ciudad, mientras que todo lo demás (y toda la gestión) permanece en la Región matriz.

El patrón a memorizar — tres hermanos de «cómputo de borde», tres disparadores:

- «Latencia de un solo dígito en milisegundos para usuarios finales **en una ciudad/área metropolitana específica**» → **Local Zones**
- «Latencia ultrabaja para **dispositivos móviles 5G**» → **Wavelength**
- «Servicios de AWS ejecutándose **en nuestro propio centro de datos** / los datos deben permanecer en las instalaciones propias» → **Outposts**

Ninguno de los tres es la respuesta para una aplicación web típica. Todos ellos aparecen en el examen SAA-C03 como trampas de coincidencia de patrones: la frase disparadora importa.

## Fortalezas y Limitaciones

**Usa diseño multi-Región y multi-AZ cuando**: tu aplicación tiene usuarios en múltiples geografías y la latencia importa; tu SLA requiere 99,99% o mayor disponibilidad; los requisitos regulatorios exigen residencia de datos en regiones específicas; necesitas recuperación ante desastres con un RTO inferior a una hora.

**Las concesiones son reales**: Ejecutar en múltiples Regiones te da redundancia contra interrupciones regionales — pero a un coste y complejidad significativos.

Recuerda la advertencia de coste de antes en este capítulo: cada byte que se mueve entre regiones cuesta dinero. En una configuración multi-región activo-activo donde las escrituras deben ser consistentes, estás pagando ese coste constantemente.

La complejidad operativa también escala. Depurar un incidente en una región es difícil. Depurar un incidente distribuido entre regiones — donde la misma solicitud tocó infraestructura en dos continentes — es un tipo de dificultad completamente diferente.

**La progresión correcta para la mayoría de las aplicaciones**: Empieza con una sola Región y múltiples AZs. Eso te da resiliencia contra los fallos que realmente ocurren — interrupciones a nivel de AZ, fallos de hardware, eventos de energía — a una fracción de la complejidad de una arquitectura multi-región. Añade múltiples regiones cuando un requisito específico y documentado lo haga necesario. No antes.

El patrón común para los equipos que saltan a múltiples regiones demasiado pronto: la complejidad de gestionar dos regiones introduce sus propios modos de fallo — errores de sincronización de datos, escenarios de cerebro dividido, despliegues inconsistentes. La propia arquitectura de resiliencia diseñada para prevenir fallos a veces introduce nuevas categorías de fallo que no habrían existido en un diseño más simple.

Priya tenía un documento que llamaba «el presupuesto de complejidad». La idea: cada decisión arquitectónica que añade complejidad operativa tiene un coste, y la organización tiene una capacidad finita para gestionar esa complejidad. Gastar el presupuesto de complejidad en arquitectura multi-región antes de haber dominado la fiabilidad de una sola región es una mala inversión. La complejidad debería ir hacia los modos de fallo que realmente enfrentas, no hacia los que dan buenas historias de recuperación ante desastres.

«Tenemos una región, una AZ, y un proceso de despliegue que pone nervioso a Leo cada vez que lo ejecuta», dijo Priya. «El siguiente paso correcto es Multi-AZ, no múltiples regiones.»

Tom escribió «presupuesto de complejidad» en su cuaderno. Usaría esa frase con regularidad durante los próximos dos años.

## Resumen

El accidente de Singapur de Leo resultó ser una lección útil — no porque causara daños duraderos, sino porque obligó al equipo a entender algo que normalmente se omite: dónde se ejecuta tu infraestructura no es una decisión cosmética. La física no negocia. Ciento setenta milisegundos de latencia base por ida y vuelta son la diferencia entre un producto rápido y uno lento, y a las reglas de cumplimiento sobre dónde viven los datos no les importa lo rápido que te moviste.

- AWS organiza su infraestructura global en **Regiones**, **Zonas de Disponibilidad** y **Ubicaciones de Borde**.
- Una **Región** es un clúster geográfico de centros de datos. Cada Región está aislada — los datos permanecen en la Región a menos que los muevas explícitamente.
- Las **Zonas de Disponibilidad** son centros de datos físicamente separados dentro de una Región, conectados por redes de baja latencia. Desplegar en múltiples AZs es la forma estándar de sobrevivir a fallos locales.
- Elige tu Región según la ubicación de los usuarios, los requisitos de cumplimiento, la disponibilidad de servicios y el precio — en ese orden.
- Multi-AZ es la base de resiliencia estándar. Multi-Región es para cargas de trabajo críticas con requisitos específicos documentados — no un punto de partida predeterminado.

## Consejos para el Examen

*Dominio SAA-C03 1 — Tarea 1.1 / Dominio 2 — Tarea 2.2*

- **Las Regiones están aisladas de forma predeterminada.** Los datos no se replican entre Regiones a menos que
  lo configures. Esto es importante para los escenarios de soberanía de datos y cumplimiento.
- **Las AZs son la unidad de resiliencia para la mayoría de las preguntas.** Cuando el examen pregunta cómo sobrevivir
  a un fallo de un centro de datos, la respuesta implica múltiples AZs dentro de una Región.
- **Multi-Región es para la resiliencia ante fallos regionales.** Si el escenario dice «debe permanecer
  operativo incluso si falla toda una Región de AWS», la respuesta implica arquitectura multi-Región.
- **Las Ubicaciones de Borde ≠ AZs.** Las Ubicaciones de Borde almacenan en caché contenido — no pueden ejecutar tu
  servidor de aplicaciones. No las confundas con centros de datos.
- El examen prueba con frecuencia la relación entre cumplimiento y selección de Región.
  Si un escenario menciona requisitos de residencia de datos, la elección de Región es parte de la respuesta.
- **Los escenarios de GDPR y residencia de datos** en el examen normalmente apuntan a mantener los datos dentro de una Región específica y asegurar que la replicación entre regiones esté deshabilitada o controlada.
- **Outposts vs Wavelength vs Local Zones:** Outposts = rack de AWS en tu centro de datos (instalaciones propias, residencia de datos, latencia local). Wavelength = AWS en el borde de la red 5G (usuarios móviles, latencia ultrabaja). Local Zones = cómputo de AWS en un área metropolitana sin una Región completa. Disparadores del examen: «ejecutar AWS en tu propia instalación» → Outposts. «Latencia ultrabaja para usuarios móviles 5G» → Wavelength. «Latencia de un solo dígito en milisegundos para usuarios en una ciudad específica» → Local Zones.

## Ejercicios

**Ejercicio 1 — Recordar**

Con tus propias palabras: ¿cuál es la diferencia entre una Región y una Zona de Disponibilidad?
¿Por qué importa esa distinción al diseñar una aplicación web resiliente?

*(Pista: Piensa en los dos tipos diferentes de fallo contra los que protege cada una.)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: Una empresa sanitaria estadounidense debe almacenar todos los datos de los pacientes dentro de una única Región de AWS
para cumplir con las políticas internas de residencia de datos. Están diseñando una nueva aplicación cloud en
la Costa Oeste y quieren maximizar la resiliencia sin mover datos a otra Región.

¿Qué configuración satisface MEJOR sus requisitos?

A) Desplegar en `us-east-1` y usar las Ubicaciones de Borde de CloudFront en Oregón para servir contenido
   más rápidamente  
B) Desplegar en `us-west-2` en una única Zona de Disponibilidad para minimizar costes  
C) Desplegar en múltiples Regiones incluyendo `us-west-2` y `us-east-1` con replicación de datos
   entre Regiones  
D) Desplegar en `us-west-2` (Oregón) en múltiples Zonas de Disponibilidad

**Pista 1**: La política significa que los datos deben permanecer en una única Región. ¿Qué opciones
mueven los datos a otra Región?

**Pista 2**: Entre las opciones que mantienen los datos en `us-west-2`, ¿cuál ofrece más resiliencia?

**Pista 3**: Múltiples AZs dentro de una única Región proporcionan resiliencia sin cruzar
los límites de la Región.

**Respuesta**: D

**Explicación**: `us-west-2` mantiene todos los datos en una única Región, satisfaciendo el requisito de la política.
Desplegar en múltiples AZs dentro de esa Región protege contra
los fallos del centro de datos sin mover datos a otra Región. Este es el equilibrio correcto
entre cumplimiento y resiliencia.

**¿Por qué no A?** La opción A se despliega en `us-east-1`, lejos de los usuarios de la Costa Oeste — y
CloudFront almacenaría en caché contenido adyacente a los pacientes en Ubicaciones de Borde fuera de la Región
elegida, violando la política de residencia.

**¿Por qué no B?** Una única AZ no tiene resiliencia. Si esa AZ experimenta una interrupción,
la aplicación falla completamente.

**¿Por qué no C?** Replicar a `us-east-1` mueve datos de los pacientes a la Costa Este,
violando directamente el requisito de una única Región.

*Dominio SAA-C03 1 — Tarea 1.1 (infraestructura global, soberanía de datos)*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus se está expandiendo para atender clientes en México y Colombia. Actualmente todo
se ejecuta en `us-west-2`. El equipo debate: ¿deberían añadir una segunda Región `us-east-1`,
o quedarse con una única Región con múltiples AZs?

¿Qué preguntas harías antes de decidir? ¿Cuáles son los principales costes y riesgos de
añadir una segunda Región? ¿Cuál es el principal coste de *no* añadirla?

*(No hay una única respuesta correcta. Practica el razonamiento sobre las concesiones de múltiples Regiones.)*

## Escena Post-Créditos

Leo solucionó el problema de Singapur. Nimbus se trasladó a `us-west-2`. La latencia bajó.
La única pregunta de seguimiento de Tom — «¿eso cambió nuestra factura?» — se respondió con un
número ligeramente mayor, que aceptó con visible reluctancia.

Eso duró dos días antes de que surgiera el siguiente problema.

Leo llegó al standup con la expresión que Maya había aprendido a reconocer: la cara de
alguien que había hecho algo que no podía deshacer.

«Bien», dijo con cuidado. «Configuré el servidor. Y necesitaba una forma de iniciar sesión.
Así que creé un nombre de usuario.»

«¿Y?» preguntó Priya.

«'Admin'.»

Silencio.

«¿Y la contraseña?»

Un silencio más largo.

«'Admin123'.»

Priya se puso de pie.

En el próximo capítulo: cómo Nimbus controla quién puede tocar qué — y qué pasa cuando se equivocan.
