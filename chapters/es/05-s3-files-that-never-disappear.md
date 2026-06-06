# Capítulo 5: El Archivador que Vive en la Nube

Leo estaba limpiando la instancia EC2 a las nueve de la mañana cuando encontró la carpeta.

La oficina estaba en silencio. Maya aún no había llegado. El café todavía se estaba preparando. Al otro lado de la ventana, los primeros viajeros pasaban a cuentagotas. Leo tenía los auriculares puestos y estaba desplazándose por directorios cuando se detuvo.

Ochocientos archivos. Todos fotos de menú. Todos en una única máquina sin respaldo.

La instancia EC2 donde se ejecutaba la app de Nimbus se había actualizado una vez desde la interrupción de doce minutos, pero el almacenamiento de fotos nunca se había movido. Cada arepa crujiente, cada plato de salmón a la parrilla, cada tazón de ensalada perfectamente presentado — sentado en una única máquina virtual que ya habían demostrado que podía caer sin previo aviso.

¿Y si esa máquina alguna vez fuera reiniciada, redimensionada o reemplazada?

Desaparecida.

«¿Cuántas fotos han subido los clientes hasta ahora?» preguntó Maya, cuando llegó.

Leo se dio la vuelta. «Unas ochocientas.»

«¿Y qué pasa con esas ochocientas fotos si reiniciamos el servidor?»

Otra de las pausas significativas de Leo.

Este capítulo trata sobre dónde pertenecen realmente los archivos en la nube.

**El Problema de Almacenar Archivos «En el Servidor»**

Cuando almacenas archivos directamente en una instancia EC2 — dentro de su sistema de archivos —
estás vinculando esos archivos al ciclo de vida de esa máquina específica.

Esto crea varios problemas:

**Efímero por naturaleza.** Las instancias EC2 pueden ser detenidas, terminadas, reemplazadas. Su
disco local no está pensado para ser permanente. Es espacio temporal de trabajo.

**Único punto de fallo.** Si la instancia falla, los archivos se van con ella. Sin
redundancia. Sin respaldo. Una mañana difícil y ochocientas fotos de menú desaparecen.

**No se puede compartir entre instancias.** Cuando añades un segundo servidor (lo harás en
el Capítulo 7), no verá los archivos almacenados en el disco del primer servidor. Los dos servidores
están aislados. Un usuario que sube una foto podría verla; otro usuario que llega a un servidor diferente
podría no verla.

**Sin escala.** El espacio en disco de EC2 es finito. Si lo llenas, o dejas de aceptar
subidas o te apresuras a ampliar el almacenamiento bajo presión.

Leo no había considerado qué pasaba con múltiples servidores. Se lo mencionó casualmente a Priya.

«Espera — ¿cómo funcionaría el problema de las fotos con dos servidores?» preguntó Priya.

«¿Qué quieres decir?»

«Si tenemos el Servidor A y el Servidor B detrás de un balanceador de carga», dijo Priya, «y un cliente sube una foto — su solicitud va al Servidor A, ¿verdad? Así que la foto se guarda en el disco del Servidor A. Ahora su siguiente solicitud va al Servidor B. El Servidor B no tiene la foto. ¿Qué ve el cliente?»

Leo abrió la boca. Luego la cerró.

«Una imagen rota», dijo finalmente.

«O un error 404», dijo Priya. «O, si la aplicación intenta cargarla y se cuelga, una página de error.»

Esbozó el plan del balanceador de carga en la pizarra — añadir un segundo servidor ya estaba en la hoja de ruta. En el momento en que ocurriera, cada subida de foto se convertiría en cara o cruz: subir al Servidor A, posiblemente servida desde el Servidor B, foto faltante, cliente confundido.

«Habríamos estado depurándolo una semana antes de averiguar qué estaba mal», dijo Leo.

«¿Hemos pensado en qué pasa cuando activemos Auto Scaling y de repente tengamos tres o cuatro servidores?» preguntó Priya. «Estaríamos perdiendo fotos constantemente.»

Esta es una clase de error que no aparece en las pruebas unitarias. Solo aparece en producción, bajo carga, cuando el tráfico real se distribuye entre múltiples servidores. La solución es dejar de almacenar archivos en los servidores por completo.

Hay un modelo mejor. AWS lo construyó en 2006, y sigue siendo uno de los servicios cloud
más utilizados del mundo.

**El Disco Duro que Vive en Línea**

Imagina un disco duro que vive en internet — uno que escala para contener tanto como
necesites, y te cobra solo por lo que realmente usas. Nunca lo aprovisionas.
Nunca te preocupas por quedarte sin espacio. Si pones ochocientas fotos hoy
y ocho millones el año que viene, nada cambia por tu parte excepto la partida de la factura.

Eso es lo que ofrece AWS. Lo llaman **Amazon S3** — Simple Storage Service.

S3 es el servicio de almacenamiento de objetos de AWS. No es exactamente como un sistema de archivos, ni exactamente
como una base de datos. Almacena archivos — llamados objetos — en contenedores con nombre llamados buckets.
El modelo es sencillo, y esa sencillez es el punto.

El concepto clave en S3 es el **objeto**.

Un objeto es cualquier archivo: una foto, un vídeo, un PDF, un CSV, un respaldo, un archivo de registro. S3
no se preocupa por el tipo o la estructura. Almacena bytes y los devuelve cuando
los pides.

Los objetos viven dentro de **buckets** (cubos). Un bucket es como una carpeta de nivel superior — un contenedor
con nombre dentro de S3 que contiene tus objetos. Cada bucket tiene un nombre único a nivel global
(no puede haber dos buckets con el mismo nombre en todas las cuentas de AWS) y existe en una Región
específica.

**Cómo Funciona S3**

**Subes** un objeto a un bucket. S3 le da una **clave** — esencialmente un nombre de ruta
como `menus/restaurante-001/foto-arepa.jpg`. Esa clave identifica de forma única el objeto
dentro del bucket.

**Descargas** (o recuperas) el objeto usando el nombre del bucket y la clave.

También puedes hacer objetos accesibles públicamente — lo que significa que cualquiera con la URL puede descargarlos.
Así es como la mayoría de los sitios web sirven imágenes: almacena la imagen en S3, hazla pública,
incrusta la URL en tu HTML.

O mantienes los objetos privados — accesibles solo para solicitudes autenticadas. Este es el
modelo correcto para los datos de los clientes, los respaldos y cualquier cosa sensible.

S3 no es un sistema de archivos. No hay carpetas reales. El `/` en el nombre de una clave es solo
una convención — S3 trata toda la clave como una cadena plana. Pero se ve como carpetas
y la mayoría de las herramientas lo presentan como carpetas, así que no te preocupes por esta distinción en
la práctica.

Hay algunas características operativas de S3 que importan en la práctica pero que no son
obvias a partir de la descripción:

**Inmutabilidad de objetos**: Los objetos de S3 no se editan en su lugar. Si actualizas un archivo,
subes una nueva versión del objeto con la misma clave. S3 reemplaza el objeto antiguo por
el nuevo (o, con el versionado habilitado, conserva ambos). A diferencia de una base de datos donde
haces `UPDATE` a una fila, los objetos de S3 son de escritura única, lectura múltiple. Para archivos de texto y documentos
que editas con frecuencia, esto está bien — simplemente sube la nueva versión. Para archivos muy grandes
donde solo quieres actualizar parte del contenido, el modelo de objetos de S3 significa que
vuelves a subir el archivo completo cada vez.

**Consistencia fuerte de lectura tras escritura**: Desde diciembre de 2020, S3 proporciona consistencia
fuerte para todos los objetos — las nuevas escrituras son inmediatamente visibles para las lecturas posteriores.
Antes de 2020, S3 tenía consistencia eventual para algunas operaciones, lo que causaba errores sutiles
en aplicaciones que escribían un objeto e inmediatamente intentaban leerlo. La mejora del modelo
de consistencia eliminó esta clase de errores.

**URLs de objetos**: Cada objeto de S3 tiene una URL. Para un objeto público, se ve así:
`https://nombre-del-bucket.s3.region.amazonaws.com/clave/ruta`. Para objetos privados, puedes
generar URLs pre-firmadas que incluyen información de autenticación y expiran después
de un tiempo configurado. Ambos formatos de URL son cómo las aplicaciones y los navegadores realmente recuperan
objetos — no hay ningún protocolo propietario involucrado.

**No hay directorios que crear**: Como S3 no tiene carpetas reales, no hay operaciones de creación
de directorios. Simplemente subes un objeto con una clave que incluye el prefijo de ruta.
La «carpeta» aparece automáticamente en la consola cuando existen objetos con ese prefijo,
y desaparece automáticamente cuando se eliminan todos los objetos con ese prefijo.

**Por Qué S3 Es Diferente de un Disco Duro Normal**

Tres cosas hacen que S3 sea fundamentalmente diferente del almacenamiento de archivos en una instancia EC2:

**Durabilidad.** AWS diseña S3 para una durabilidad del 99,999999999% (once nueves). Eso significa
que si almacenas diez millones de objetos, podrías esperar perder un objeto cada diez
mil años debido a un fallo de hardware. Logran esto almacenando múltiples copias
de cada objeto en al menos tres Zonas de Disponibilidad automáticamente.

Pero la durabilidad protege contra el fallo de hardware — no contra que tú elimines algo accidentalmente. Para eso está el versionado.

Hay una distinción importante entre **durabilidad** y **disponibilidad**. La durabilidad trata sobre si tus datos todavía existen. La disponibilidad trata sobre si puedes acceder a ellos ahora mismo. S3 Standard ofrece una durabilidad del 99,999999999% y una disponibilidad del 99,99%. El número de durabilidad es casi incomprensiblemente alto; la cifra de disponibilidad del 99,99% es un *objetivo de diseño* — unos 52 minutos de indisponibilidad al año. El *SLA* contractual es en realidad más bajo (99,9% por mes), e incumplirlo te da créditos de servicio, no tiempo de actividad. En la práctica, la disponibilidad de S3 es mucho más alta que cualquiera de los dos números — pero vale la pena entender que la durabilidad y la disponibilidad son garantías separadas, y que los objetivos de diseño y los SLAs son promesas separadas.

**Disponibilidad.** S3 está diseñado para ser accesible incluso cuando fallan componentes
individuales. No te estás conectando a un servidor — te estás conectando a un sistema distribuido
que enruta alrededor de los fallos.

**Escala.** S3 contiene una cantidad esencialmente ilimitada de datos. Un único bucket puede contener
billones de objetos. Amazon en sí usa S3 para almacenar datos a una escala difícil de
comprender. Los buckets de S3 más grandes del mundo contienen exabytes de datos — millones de
terabytes. No gestionas esta escala; simplemente subes objetos y S3 se encarga de
todo por debajo.

**Coste.** S3 Standard cuesta aproximadamente 0,023 dólares por GB al mes en el momento de escribir esto.
Para las ochocientas fotos de menú de Nimbus a una media de 2 MB cada una, eso son 1,6 GB de
almacenamiento — unos 0,04 dólares al mes. Incluso con 800.000 fotos, estás hablando de 37 dólares al
mes en almacenamiento. El coste del mismo almacenamiento en un volumen de EBS sería de aproximadamente
128 dólares al mes, con un techo fijo que requería ampliación antes de poder añadir más.
S3 crece automáticamente y cobra proporcionalmente. EBS tiene un tamaño fijo y un coste fijo.

**Versionado: El Botón de Deshacer**

Aquí hay algo que Maya encontró cuando exploraba la consola de S3.

S3 admite el **versionado**. Cuando habilitas el versionado en un bucket, S3 guarda cada
versión de cada objeto — incluidas las versiones anteriores y las versiones eliminadas.

Este es el botón de deshacer para tus archivos.

Priya quería probarlo antes de confiar en él. Subió una foto de menú al bucket, luego subió una nueva versión con el archivo equivocado — una imagen completamente negra que creó en treinta segundos.

Abrió la consola de S3, hizo clic en «Mostrar versiones» y encontró ambas: la versión mala (actual) y la original (anterior). Restauró la versión anterior copiándola de vuelta como la nueva versión actual.

«Funciona», dijo.

«¿Cuánto cuesta mantener todas esas versiones?» preguntó Tom.

Pagas por el almacenamiento de cada versión. Si tienes muchas versiones de archivos grandes, se
acumula. AWS tiene **políticas de ciclo de vida** que eliminan automáticamente las versiones antiguas después de
un cierto tiempo — las cubrimos en el Capítulo 23 cuando profundizamos en la optimización de costes.

«Así que habilitamos el versionado pero establecemos una regla de ciclo de vida para eliminar las versiones antiguas después de treinta días», dijo Priya. «De esa manera tenemos una ventana de recuperación sin pagar por almacenar cada versión para siempre.»

Tom anotó el número. El coste de almacenamiento de treinta días de versiones era aceptable.

**Notificaciones de Eventos de S3: Archivos que Hacen Cosas**

Leo estaba mirando las fotos de menú desde un ángulo diferente.

«Ahora mismo», dijo, «cuando un restaurante sube una foto, almacenamos el original a resolución completa. Algunas de ellas son de cuatro mil por tres mil píxeles. Cada vez que un cliente carga la página del menú en un teléfono, estamos sirviendo una imagen de cuatro megabytes.»

«¿Cuánto cuesta eso en ancho de banda?» preguntó Tom.

Leo abrió los números de transferencia de datos en la factura. La respuesta fue «más de lo que debería».

S3 tiene una función llamada **Notificaciones de Eventos**. Cuando un objeto se sube a un bucket, S3 puede activar automáticamente otro servicio — como Lambda, el servicio de computación serverless que cubrimos en el Capítulo 20. Ese disparador puede ejecutar código en respuesta a la subida sin ninguna intervención manual.

La solución de Nimbus: cada vez que se sube una foto al bucket de fotos en bruto, una Notificación de Evento de S3 activa una función Lambda. La función Lambda lee la foto original, genera una miniatura de 400 píxeles de ancho y la guarda en un bucket de fotos procesadas. La app de cara al cliente sirve la miniatura en lugar del original.

El pipeline:

1. El restaurante sube la foto original de 4 MB a `nimbus-photos-raw/restaurant-001/arepa.jpg`
2. S3 dispara la Notificación de Evento
3. La función Lambda lee el original, genera una miniatura de 400x300
4. Lambda guarda la miniatura en `nimbus-photos-processed/restaurant-001/arepa.jpg`
5. El cliente carga el menú, la app sirve la miniatura de 40 KB en lugar del original de 4 MB

El resultado: 99% de reducción en el ancho de banda de imágenes. Cargas de página más rápidas. Una partida de transferencia de datos más pequeña en la factura. Los originales se preservan en el bucket en bruto, así que si Nimbus alguna vez quiere generar versiones de mayor resolución, el material fuente está ahí.

«¿Eso se ejecuta automáticamente?» preguntó Maya.

«Cada vez que alguien sube una foto», dijo Leo. «Nunca lo tocamos.»

Este patrón — procesamiento basado en eventos activado por eventos de almacenamiento — es uno de los patrones más comunes y potentes en la arquitectura cloud moderna. Lo revisitamos a fondo en el Capítulo 20.

**Replicación entre Regiones: Cuando Una Copia No Es Suficiente**

Priya planteó una pregunta de cumplimiento al final de la semana.

«Si Nimbus se expande para atender a restaurantes en la UE», dijo, «y esos restaurantes suben fotos — ¿esas fotos se almacenan en nuestro bucket de `us-west-2`?»

«Sí», dijo Leo.

«¿Y el GDPR tiene algo que decir sobre dónde se almacenan esos datos?»

Lo tiene. Las disposiciones de transferencia de datos del GDPR significan que los datos personales sobre los residentes de la UE pueden requerir almacenamiento dentro de la UE o en una jurisdicción con protección de datos adecuada.

La respuesta de S3 a esto es la **Replicación entre Regiones** (CRR, Cross-Region Replication). Cuando habilitas CRR en un bucket, cada nuevo objeto subido se replica automáticamente a un bucket en otra Región. Configuras el bucket de origen, el bucket de destino y el rol de IAM que da a S3 permiso para realizar la replicación.

Cuando ocurra la expansión a la UE, el plan es este: las fotos subidas por los restaurantes de la UE irán a un bucket de `eu-west-1`, y CRR las replicará a un bucket de respaldo en `eu-central-1` (Fráncfort) para recuperación ante desastres. Los datos de la UE permanecen en Regiones de la UE.

«¿Cuánto costaría eso?» preguntó Tom.

Se aplican costes de transferencia de datos y almacenamiento entre regiones — aproximadamente la tarifa de transferencia por GB de la Región de origen al destino, más el almacenamiento de las copias replicadas. Tom hizo las cuentas sobre el volumen proyectado de fotos de la UE de Nimbus y determinó que sería aceptable.

«¿Y qué pasa si alguien intenta entrar por la fuerza en el pipeline de replicación?» preguntó Priya. «El rol de IAM que realiza la replicación debería estar acotado estrechamente — solo acciones de replicación de S3, solo en los buckets específicos.»

Escribió ese requisito en el plan de expansión.

**Subida Multiparte y el Problema de la Subida Incompleta**

Tom encontró una partida inesperada en la factura de AWS.

«Estamos pagando por almacenamiento en S3», dijo, «pero la cantidad es mayor de lo que esperaría por el número de fotos que tenemos.»

Leo investigó. Encontró una categoría en el informe de S3 Storage Lens: **subidas multiparte incompletas**.

Cuando S3 sube un archivo más grande que un cierto tamaño, usa **subida multiparte**: el archivo se divide en partes, cada parte se sube por separado, y luego las partes se ensamblan en el objeto final. Esto hace que las subidas grandes sean más fiables — si una parte falla, solo esa parte necesita reintentarse, no el archivo completo.

Pero si una subida multiparte se inicia y luego se abandona — el usuario cerró el navegador, la red se cayó, la aplicación se colgó — las partes parciales permanecen en S3, acumulando cargos de almacenamiento. No son visibles como objetos completados, pero se facturan como almacenamiento.

«¿Cuánto?» preguntó Tom.

«Unos 12 dólares al mes», dijo Leo. «De subidas parciales que nunca se completaron.»

La solución: una **regla de ciclo de vida** de S3 que elimina automáticamente las subidas multiparte incompletas después de siete días. Cualquier subida que no se haya completado en una semana se abandona, y las partes parciales se limpian.

Tom añadió la regla de ciclo de vida esa tarde. El cargo de 12 $/mes desapareció en cuestión de días.

«Eso son 144 dólares al año», dijo Tom, mirando su hoja de cálculo. «Por nada.»

«Ya configuré una prueba de carga que usaba subidas multiparte», dijo Leo. «Oh.» Una pausa. «Esas son probablemente la mayoría. Olvidé limpiarlas cuando la prueba terminó.»

Tom lo anotó de todos modos.

**Control de Acceso: Público vs Privado**

De forma predeterminada, todo en S3 es privado. Solo tu cuenta de AWS puede acceder a él.

Puedes hacer objetos individuales públicos — lo que es cómo servirías imágenes de menú a
los visitantes del sitio web. O puedes mantener todo privado y generar **URLs pre-firmadas**:
enlaces con tiempo limitado que permiten a alguien descargar un objeto específico sin necesitar credenciales de AWS.
Perfecto para permitir que un cliente descargue su factura durante 24 horas.

Priya tenía opiniones muy fuertes sobre esto.

«¿Y qué pasa si alguien intenta entrar por la fuerza a través de un bucket mal configurado?» dijo. «Nunca hagas un bucket completamente público a menos que hayas decidido conscientemente hacer que cada
objeto en él sea accesible para toda internet. El error de seguridad más común de S3
es exponer accidentalmente un bucket que contiene datos sensibles.»

AWS ahora tiene una configuración «Bloquear Acceso Público» que puedes aplicar a nivel de cuenta,
forzando que todos los buckets sean privados a menos que lo anules explícitamente por bucket.

Actívala. Siempre.

La historia detrás de esto: antes de que AWS añadiera el Bloqueo de Acceso Público a nivel de cuenta, el incidente
de seguridad de S3 más común era hacer un bucket público accidentalmente. Un desarrollador creaba
un bucket para pruebas, marcaba la casilla «público» por conveniencia, añadía algunos archivos incluyendo
unos pocos de otras carpetas en las que no había pensado, y luego se olvidaba de él. El bucket
se quedaba ahí, accesible públicamente, durante meses. En unos pocos casos de alto perfil, el «bucket
de prueba olvidado» contenía datos de clientes, documentos internos o credenciales.

El Bloqueo de Acceso Público a nivel de cuenta es una salvaguarda contra esto. Incluso si un desarrollador
configura accidentalmente un bucket para que sea público, la configuración a nivel de cuenta lo anula.
Tienes que deshabilitar explícitamente la configuración a nivel de cuenta antes de que cualquier bucket pueda volverse
público — lo que crea un freno deliberado que previene accidentes.

Nimbus tenía el Bloqueo de Acceso Público habilitado a nivel de cuenta. Entonces, ¿cómo se servirían las imágenes de menú
que necesitaban ser accesibles públicamente? El patrón estándar — uno que Nimbus
adoptaría más tarde, en el Capítulo 13 — es poner un CDN como CloudFront delante del
bucket con una política de Control de Acceso de Origen (Origin Access Control): el CDN puede obtener objetos de un bucket
privado de S3, pero nadie puede acceder al bucket directamente. Este patrón es más seguro que
un bucket público y permite que el caché del CDN reduzca los costes de solicitudes de S3.

«Espera — pero ¿*por qué* lo haríamos de esa manera?» preguntó Maya. «Las imágenes son públicas de todos modos,
así que ¿por qué importa si el bucket es público?»

«Porque un bucket público significa que cualquiera puede enumerar lo que hay en él», dijo Priya. «Pueden
listar todos los objetos del bucket. Con CloudFront delante, solo ven las
URLs que exponemos en la aplicación. El bucket en sí permanece privado.»

Maya añadió «enumerar» a su modelo mental de superficies de ataque.

**Clases de Almacenamiento de S3: No Todos los Datos Son Iguales**

No se accede a todos los datos por igual.

A tus fotos de menú más populares se accede docenas de veces por segundo. A tus registros de
hace tres años quizás se accede una vez al año, si acaso. S3 reconoce esto y ofrece
diferentes **clases de almacenamiento** con diferentes concesiones de rendimiento y coste.

| Clase de Almacenamiento         | Caso de Uso                                      | Recuperación         | Coste                           |
|---------------------------------|--------------------------------------------------|----------------------|---------------------------------|
| S3 Standard                     | Datos a los que se accede con frecuencia         | Inmediata            | Mayor por GB                    |
| S3 Standard-IA                  | Acceso poco frecuente, necesita recuperación rápida | Inmediata         | Menor por GB, tarifa de recuperación |
| S3 Glacier Instant              | Archivos de acceso ocasional                     | Inmediata            | Mucho menor                     |
| S3 Glacier Flexible             | Archivos de acceso poco frecuente                | Minutos a horas      | Muy baja                        |
| S3 Glacier Deep Archive         | Archivos de cumplimiento, acceso casi nunca      | Hasta 12 horas       | La más baja                     |

Profundizamos en estos en el Capítulo 23. Por ahora: el concepto es que puedes mover automáticamente
objetos entre clases de almacenamiento según su antigüedad y patrones de acceso, ahorrando
dinero significativo en los datos que raramente tocas.

También existe **S3 Intelligent-Tiering** — una clase de almacenamiento que mueve automáticamente
objetos entre niveles de acceso frecuente y poco frecuente según los patrones de acceso observados.
Pagas una pequeña tarifa de monitorización por objeto al mes, y S3 se encarga de la
distribución automáticamente. Esto es útil cuando no estás seguro de a qué objetos se accederá
con frecuencia y a cuáles no — el servicio aprende el patrón y optimiza
en consecuencia.

El enfoque de Tom era más manual: «Quiero saber a dónde va cada dólar.» Eligió
reglas de ciclo de vida explícitas en lugar de Intelligent-Tiering, porque las reglas explícitas son predecibles
y auditables. Después de seis meses operando el almacenamiento de S3 de Nimbus, tenía una imagen clara
de los patrones de acceso y podía establecer reglas de ciclo de vida que movían los objetos a Standard-IA
después de 30 días y a Glacier Flexible Retrieval después de 180 días.

El ahorro total de almacenamiento de la gestión del ciclo de vida en el primer año: aproximadamente
340 dólares. No cambia la vida, pero es real — y el patrón se repite en docenas de buckets
en cualquier cuenta de AWS seria.

«Eso es casi un vuelo de ida y vuelta», dijo Maya.

«Es una buena práctica de ingeniería», dijo Tom. Lo puso en la hoja de cálculo.

Hay una trampa en la selección de clase de almacenamiento que coge a muchos equipos: la **duración
mínima de almacenamiento**. S3 Standard-IA tiene una duración mínima de almacenamiento de 30 días — si
almacenas un objeto en Standard-IA y lo eliminas después de 15 días, todavía pagas por 30 días.
Glacier Flexible Retrieval tiene un mínimo de 90 días. Glacier Deep Archive tiene un mínimo de
180 días.

Para objetos que se eliminan con frecuencia o tienen vidas cortas, estos mínimos hacen
que las clases IA y Glacier sean más caras que Standard, no más baratas. Antes de pasar a una
clase de almacenamiento más barata, verifica que los objetos realmente vivirán allí lo suficiente para
que el ahorro supere las penalizaciones de duración mínima.

## Fortalezas y Limitaciones

**Por qué S3 es excelente**:

- Durabilidad de once nueves. Tus datos están más seguros en S3 que en casi cualquier otro sistema.
- Escala ilimitada. Nunca necesitas aprovisionar almacenamiento — simplemente crece.
- Extremadamente barato por lo que proporciona (fracciones de céntimo por GB por mes).
- Integración nativa con casi todos los demás servicios de AWS.
- Admite el alojamiento de sitios web estáticos — puedes servir un sitio web estático completo
  directamente desde S3, sin necesitar servidor.
- Procesamiento basado en eventos: las Notificaciones de Eventos de S3 activan Lambda, SQS o SNS
  automáticamente cuando se crean o eliminan objetos, habilitando potentes pipelines de
  procesamiento sin sondeo ni trabajos programados.
- Replicación entre Regiones para la residencia de datos de cumplimiento y la recuperación ante desastres.

**Donde S3 no es la elección correcta**:

- S3 no es un sistema de archivos. Si tu aplicación necesita montar una unidad y usarla como
  un disco local (leyendo, escribiendo, modificando archivos en su lugar), S3 es la herramienta equivocada.
  Usa EFS (Elastic File System, Capítulo 6) o EBS en su lugar.
- S3 tiene una latencia notablemente mayor que un disco local. Para bases de datos o
  aplicaciones que necesitan E/S rápida y de acceso aleatorio, el almacenamiento en bloque (EBS, Capítulo 6)
  es apropiado.
- La transferencia de datos *hacia* S3 está libre de cargos de ancho de banda — pero no es completamente gratis:
  cada subida es una solicitud PUT, y S3 cobra por solicitud. Subir millones de
  objetos pequeños puede costar más en tarifas de solicitud que en almacenamiento. La transferencia de datos *hacia afuera*
  cuesta dinero por GB. Ambas son sorpresas de facturación comunes — las abordamos en el Capítulo 30.
- S3 no es una base de datos. Puedes almacenar y recuperar objetos por clave, pero no puedes
  consultar objetos por su contenido, ejecutar agregaciones o hacer operaciones relacionales.
  Si necesitas consultar el contenido de los datos almacenados (no solo recuperarlos por nombre),
  necesitas una base de datos o un servicio como Athena (Capítulo 26) que pueda consultar objetos de S3
  usando SQL.
- El versionado de objetos almacena costes que se acumulan. Cada versión anterior de cada
  objeto versionado se factura como almacenamiento. Las reglas de ciclo de vida que expiran las versiones antiguas
  no son opcionales — son parte de la estrategia de gestión de costes de cualquier bucket
  con el versionado habilitado.

**Cómo Se Cifran los Objetos de S3**

«¿Y qué pasa si alguien intenta entrar por la fuerza?» preguntó Priya, predeciblemente, el día que las fotos se publicaron. «¿Estos objetos están cifrados en reposo?»

Lo estaban — y eso vale la pena entenderlo, porque el cifrado de S3 es uno de los temas más evaluados en el examen. Cada objeto subido a S3 se cifra en reposo de forma predeterminada. La pregunta es *quién tiene la clave*:

**SSE-S3 (el valor predeterminado)**: S3 cifra cada objeto con claves que el propio S3 gestiona, usando AES-256. No haces nada, no configuras nada, no pagas nada. Desde enero de 2023, esto es automático en cada bucket. Para la mayoría de los datos, es suficiente.

**SSE-KMS**: S3 cifra los objetos con una clave de KMS — ya sea la clave gestionada por AWS `aws/s3` o una clave gestionada por el cliente que tú controlas (el Capítulo 16 cubre KMS en profundidad). Lo que ganas: un rastro de auditoría en CloudTrail de cada uso de clave, la capacidad de controlar exactamente quién puede descifrar mediante la política de clave, y la capacidad de revocar el acceso deshabilitando la clave. Lo que pagas: cargos de la API de KMS por solicitud. A altas tasas de solicitudes, habilita las **Bucket Keys de S3** — S3 deriva una clave de corta duración a nivel de bucket a partir de tu clave de KMS, reduciendo las llamadas a la API de KMS (y el coste) hasta en un 99%.

**SSE-C**: Tú suministras tu propia clave de cifrado *con cada solicitud*. AWS la usa en memoria y nunca la almacena. Para organizaciones cuyas reglas de cumplimiento dicen que AWS nunca debe tener la clave. Operativamente exigente — pierde la clave, pierde los datos.

El patrón del examen: «cifrado con un rastro de auditoría del uso de claves» o «controlar quién puede descifrar» → SSE-KMS. «La empresa debe gestionar sus propias claves y AWS nunca debe almacenarlas» → SSE-C. «Cifrado en reposo sin sobrecarga de gestión» → SSE-S3 (ya activado).

**S3 Object Lock: Escribir Una Vez, Leer Muchas**

Algunos datos deben ser *imposibles* de eliminar — no protegidos por política, sino estructuralmente inmutables. Registros de operaciones financieras, registros de auditoría, evidencia legal. **S3 Object Lock** hace que los objetos sean imborrables e inmodificables durante un período de retención, incluso por los administradores. Requiere versionado, y viene en dos modos que al examen le encanta contrastar: **modo gobernanza** (los usuarios con un permiso especial todavía pueden omitir el bloqueo) y **modo cumplimiento** (nadie puede acortar la retención ni eliminar el objeto — ni siquiera el usuario raíz — hasta que el período expire). Frases regulatorias como «almacenamiento WORM» o «Regla 17a-4 de la SEC» son disparadores del examen para Object Lock en modo cumplimiento.

**S3 Transfer Acceleration: Subidas Rápidas desde Lejos**

Cuando los usuarios suben archivos grandes a un bucket desde el otro lado del mundo, la parte lenta es el largo camino por internet público hasta la región del bucket. **S3 Transfer Acceleration** le da al bucket un endpoint especial que enruta las subidas a la ubicación de borde de AWS más cercana, y luego las transporta por la red troncal privada de AWS hasta el bucket. Disparador del examen: «usuarios de todo el mundo suben archivos grandes a un bucket central; las subidas son lentas» → Transfer Acceleration (a menudo emparejado con subida multiparte). Nota la dirección: Transfer Acceleration trata de meter datos *hacia* S3; CloudFront trata de servir datos *hacia afuera*.

Una clase de almacenamiento más que vale la pena conocer ahora: **S3 One Zone-IA** — como Standard-IA pero almacenada en una única Zona de Disponibilidad, alrededor de un 20% más barata, para datos de acceso poco frecuente que podrías recrear si esa AZ se perdiera (miniaturas, informes regenerables). Es un distractor estándar del examen; el Capítulo 23 cubre todo el espectro de clases de almacenamiento.


## Resumen

Ochocientas fotos en una única instancia era el problema. S3 lo resolvió — pero S3 es más que un lugar para guardar archivos. Es un almacén de objetos duradero, escalable y accesible globalmente con su propio modelo de acceso, clases de almacenamiento, políticas de ciclo de vida y sistema de eventos. Entender en qué es bueno S3, y en qué deliberadamente no lo es, da forma a cada decisión de almacenamiento que el equipo tomaría de aquí en adelante.

- **Amazon S3** es almacenamiento de objetos — archivos (objetos) en contenedores con nombre (buckets). Almacena copias en al menos tres Zonas de Disponibilidad para una durabilidad de once nueves. S3 no es un sistema de archivos: usa EFS para montajes compartidos, EBS para almacenamiento en bloque de una sola instancia.
- Los archivos almacenados en instancias EC2 están vinculados al ciclo de vida de esa instancia, causando errores de fotos faltantes cuando el tráfico se distribuye entre múltiples servidores. S3 resuelve esto al ser independiente de cualquier instancia.
- El **versionado** preserva las versiones anteriores de los objetos. Las **reglas de ciclo de vida** automatizan las transiciones entre clases de almacenamiento y limpian las subidas multiparte incompletas que de otro modo acumularían cargos de facturación silenciosos.
- De forma predeterminada, S3 es privado. Habilita «Bloquear Acceso Público» a nivel de cuenta. Sirve objetos públicos a través de CloudFront con Control de Acceso de Origen en lugar de hacer los buckets directamente públicos.
- Las clases de almacenamiento de S3 te permiten ajustar el coste a la frecuencia de acceso — pero vigila los cargos de duración mínima de almacenamiento antes de pasar objetos de vida corta a los niveles de Acceso Poco Frecuente o Glacier.

## Consejos para el Examen

*Dominio SAA-C03 3 — Tarea 3.1 (soluciones de almacenamiento de alto rendimiento)*

- **S3 es almacenamiento de objetos, no almacenamiento en bloque.** Cuando un escenario del examen necesita
  un sistema de archivos que puedan montar múltiples servidores, eso es EFS. Cuando necesita un disco
  para una única instancia EC2, eso es EBS. Cuando necesita almacenar archivos, respaldos,
  imágenes o datos a los que se accede a través de HTTP — eso es S3.
- La **durabilidad de once nueves** significa que S3 replica datos en múltiples AZs
  automáticamente. No configuras esto — es el valor predeterminado.
- **S3 es regional**, pero accesible globalmente. Los buckets existen en una Región específica,
  pero puedes acceder a ellos desde cualquier lugar.
- Las **URLs pre-firmadas** permiten el acceso con tiempo limitado a objetos privados. Patrón común:
  tu aplicación genera una URL pre-firmada válida por 15 minutos, se la da al
  usuario, el usuario descarga el archivo directamente desde S3.
- **S3 Standard-IA** tiene un cargo de duración mínima de almacenamiento (30 días). No la uses
  para datos que eliminarás rápidamente. El examen evalúa si conoces las concesiones
  entre clases de almacenamiento.
- **Árbol de decisión de clase de almacenamiento**: *acceso frecuente* → S3 Standard; *acceso poco frecuente pero necesita recuperación rápida* → S3 Standard-IA; *archivo de acceso ocasional* → S3 Glacier Instant Retrieval; *archivo de acceso poco frecuente* → S3 Glacier Flexible Retrieval; *archivo de cumplimiento, acceso casi nunca* → S3 Glacier Deep Archive.
- La **Replicación entre Regiones** requiere que el versionado esté habilitado tanto en el bucket de origen como en el de destino. Las preguntas del examen sobre recuperación ante desastres o soberanía de datos a menudo involucran CRR.

## Ejercicios

**Ejercicio 1 — Recordar**

Con tus propias palabras: ¿qué es un objeto de S3? ¿Qué es un bucket de S3? ¿Por qué es mejor almacenar archivos
en S3 que en el disco local de una instancia EC2?

*(Pista: Piensa en qué pasa con los archivos en una instancia EC2 si la instancia es
terminada. ¿Qué hace S3 de manera diferente?)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: Una empresa de medios produce vídeos documentales. Necesitan almacenar el metraje original
4K (al que se accede con frecuencia durante la producción), los cortes finales editados (a los que se accede mensualmente
para distribución) y los másters de archivo (conservados indefinidamente pero a los que se accede como máximo una vez
al año con fines de cumplimiento). Quieren minimizar los costes de almacenamiento mientras satisfacen
los requisitos de acceso de cada nivel.

¿Qué estrategia de almacenamiento satisface MEJOR sus necesidades?

A) Almacenar el metraje original en S3 Standard, los cortes finales en S3 Standard-IA y los archivos
   en S3 Glacier Deep Archive  
B) Almacenar todo el contenido en S3 Standard por consistencia de rendimiento y simplicidad  
C) Almacenar todo el contenido en el almacenamiento de instancia EC2 para el acceso más rápido  
D) Almacenar todo el contenido en S3 Glacier Deep Archive para minimizar costes

**Pista 1**: Diferentes archivos tienen diferentes patrones de acceso. S3 ofrece diferentes clases de almacenamiento
para diferentes frecuencias de acceso. ¿Qué clase corresponde a «acceso frecuente»?

**Pista 2**: Los archivos a los que se accede «como máximo una vez al año» no necesitan recuperación inmediata.
¿Qué clase de almacenamiento está diseñada para el archivado a largo plazo con el coste mínimo?

**Pista 3**: Haz corresponder la frecuencia de acceso de cada nivel con la clase de almacenamiento apropiada.
Acceso frecuente = Standard. Mensual = Standard-IA. Una vez al año = Glacier Deep Archive.

**Respuesta**: A

**Explicación**: Esta estrategia hace corresponder correctamente cada nivel de datos con la clase de almacenamiento
de S3 apropiada. El metraje original de acceso frecuente permanece en Standard para
acceso inmediato sin tarifas de recuperación. Los cortes finales de acceso mensual van a Standard-IA
(menor coste de almacenamiento, tarifa de recuperación asequible). Los archivos a los que se accede una vez al año van a
Glacier Deep Archive para el menor coste de almacenamiento posible.

**¿Por qué no B?** Almacenar todo en Standard es sencillo pero caro.

**¿Por qué no C?** El almacenamiento de instancias EC2 es efímero y no apropiado para el almacenamiento
multimedia a largo plazo. Si la instancia se termina, se pierde todo el contenido.

**¿Por qué no D?** Glacier Deep Archive tiene tiempos de recuperación de hasta 12 horas. Almacenar
el metraje de producción de acceso frecuente allí haría imposible el trabajo de producción.

*Dominio SAA-C03 3 — Tarea 3.1 / Dominio 4 — Tarea 4.1*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus almacena fotos de pedidos subidas por los clientes en S3. Una regulación de protección de datos
requiere que las fotos de los clientes se almacenen durante 7 años pero se puedan eliminar después de eso.
El equipo también quiere minimizar el coste de almacenar fotos antiguas de años anteriores.

Diseña una estrategia de almacenamiento de S3 para este requisito. ¿Qué clases de almacenamiento usarías
y cuándo harías la transición entre ellas? ¿Qué harías con el requisito de eliminación?

*(Pista: Piensa en las políticas de ciclo de vida. No hay una única respuesta correcta — razona
las concesiones entre coste y tiempo de recuperación.)*

## Escena Post-Créditos

Leo migró las fotos de menú a S3 esa tarde. Ochocientos objetos, almacenados de forma segura
en tres Zonas de Disponibilidad, con el versionado habilitado.

«En realidad están más seguros ahora que antes», dijo, con cierta satisfacción.

«Siempre estuvieron más seguros en S3», dijo Priya. «Solo esperamos hasta después de construir el problema para solucionarlo.»

Leo lo aceptó.

A la mañana siguiente, Tom llegó con una impresión. La factura de AWS, anotada con bolígrafo rojo.

«Tenemos un problema de base de datos», dijo. «Estamos ejecutando nuestra base de datos de pedidos en la misma
instancia EC2 que el servidor web. Y nuestra base de datos de menú. Y nuestros registros de clientes.»

Hizo una pausa.

«Todo está en la misma máquina. Una máquina. Todos nuestros datos.»

Maya miró la impresión. Luego a Tom. Luego al techo.

«¿Y si esa máquina se rompe?»

Tom señaló la anotación en rojo.

En el próximo capítulo: la diferencia entre un disco duro que alquilas y un archivador que comparte toda la oficina.
