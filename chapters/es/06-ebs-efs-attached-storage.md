# Capítulo 6: El Disco que Te Sigue a Todas Partes

Tom tenía un bolígrafo rojo y un hábito que ponía nervioso a Leo.

Cada sábado por la mañana, se sentaba con un café e imprimía algo. No correo electrónico. No informes. Imprimía la lista de lo que Nimbus estaba ejecutando y la leía como un libro mayor, línea por línea, bolígrafo en mano. Lo hacía desde la segunda semana. El sonido de la impresora calentándose se había convertido en parte del fin de semana.

Leo lo llamaba «la cosa que hace Tom que hace que Leo sienta que ha hecho algo mal».

Ese sábado, Tom marcó algo con un círculo y dejó la impresión en el escritorio de Maya sin decir una palabra.

Ella la encontró el lunes por la mañana. Un círculo. Una nota al margen, tres palabras:

*Todo. Una máquina.*

Las fotos estaban ahora a salvo en S3 — ese problema estaba resuelto. Pero la base de datos seguía en la misma instancia EC2 que el servidor web. Historial de pedidos, registros de clientes, dos meses de transacciones. La aplicación y todo lo que había debajo, compartiendo un único disco virtual.

«¿Qué pasa con la base de datos si la instancia se cae?» preguntó Maya, con la impresión en la mano.

«Se cae también», dijo Leo.

«¿Y los datos?»

«Depende de cómo almacene los datos la base de datos.»

Ese «depende» era el problema.

**Cómo las Instancias EC2 Almacenan los Datos**

Cuando una instancia EC2 se ejecuta, su sistema operativo vive en algún lugar de un disco. Ese disco
se llama el **volumen raíz**. Por defecto, es un **volumen de EBS** — incluso cuando no lo piensas.

Pero hay algo más: las instancias EC2 también tienen almacenamiento de **instance store**.

El almacenamiento de instance store es almacenamiento temporal adjunto físicamente al hardware subyacente que
ejecuta tu máquina virtual. Es extremadamente rápido — más rápido que casi cualquier otra opción de almacenamiento
en AWS. Pero viene con una advertencia.

El almacenamiento de instance store es **efímero**.

Cuando la instancia se detiene o se termina, los datos del instance store desaparecen. Permanentemente.
No recuperable. AWS no te advierte muy claramente de esto, que es como los equipos
lo descubren: perdiendo datos.

El almacenamiento de instance store es apropiado para cachés, archivos de procesamiento temporales y espacio
de trabajo. Nunca para datos que te importen.

**EBS: El Disco Persistente**

Imagina un disco duro externo que puedes conectar a tu instancia EC2 — uno que
no desaparece cuando lo desconectas, y que puedes mover a una máquina diferente
si lo necesitas. AWS lo llama **EBS**: Elastic Block Store.

EBS es almacenamiento en bloque persistente para instancias EC2.

El almacenamiento en bloque significa que se comporta como un disco duro real: tu sistema operativo puede crear
sistemas de archivos en él, leer y escribir bytes arbitrarios en posiciones arbitrarias, ejecutar bases de datos
en él y tratarlo exactamente como un disco adjunto.

Las propiedades clave:

**Persistente.** A diferencia del almacenamiento de instance store, los volúmenes de EBS sobreviven a paradas, arranques e
incluso a la terminación de la instancia (dependiendo de la configuración). Los datos permanecen en el volumen
incluso cuando ninguna instancia lo está usando.

Hay un matiz de configuración aquí: cuando creas una instancia EC2, el volumen raíz
tiene una configuración llamada «Eliminar al Terminar» (Delete on Termination). Por defecto, está establecida en true — el
volumen raíz se elimina cuando la instancia se termina. Para los volúmenes de datos adicionales
que adjuntas, el valor predeterminado es false — persisten después de que la instancia se termina.
Puedes cambiar ambas configuraciones. Si quieres que el volumen raíz sobreviva a la terminación de la instancia
(para análisis forense o recuperación de datos), deshabilita «Eliminar al Terminar». Si quieres
que los volúmenes de datos se limpien automáticamente, habilítalo.

**Adjuntable y desadjuntable.** Un volumen de EBS se puede desadjuntar de una instancia y
adjuntar a otra. Si necesitas migrar datos o recuperarte de una instancia fallida,
puedes desadjuntar el volumen y volverlo a adjuntar en otro lugar.

El flujo de desadjuntar-y-readjuntar es más lento que una restauración de instantánea pero preserva
el estado exacto del volumen — todas las escrituras no confirmadas, todos los datos en caché, el estado exacto
del sistema de archivos. Esto lo hace útil para el análisis forense (adjuntar el volumen a
una instancia de análisis sin arrancar el sistema original) y para la migración de datos
(mover un volumen de base de datos a una instancia más grande sin tomar una instantánea).

**Adjunción única (principalmente).** Por defecto, un volumen de EBS está adjunto a exactamente una
instancia EC2 a la vez. Una única instancia puede tener múltiples volúmenes de EBS, pero un único
volumen de EBS no puede ser montado por múltiples instancias simultáneamente (con una excepción:
EBS Multi-Attach, que tiene casos de uso limitados y restricciones importantes).

EBS Multi-Attach permite que los volúmenes io1/io2 (IOPS aprovisionadas) se adjunten a múltiples instancias simultáneamente
en la misma AZ. Esto suena como si resolviera el problema del «almacenamiento compartido», pero viene
con serias restricciones: las aplicaciones en las instancias adjuntas deben ser capaces de
coordinar el acceso concurrente — la semántica del sistema de archivos compartido (gestión de bloqueos, ordenación
de escrituras) no la proporciona EBS. En la práctica, EBS Multi-Attach se usa para aplicaciones
de base de datos en clúster que manejan la coordinación ellas mismas. Para el acceso general a archivos
compartidos, EFS es más simple y más apropiado.

La analogía de EBS: un disco duro externo conectado a un portátil. El portátil
(instancia EC2) puede leer y escribir en él. Cuando terminas, puedes desconectarlo y
conectarlo a un portátil diferente.

**Tipos de Volúmenes EBS**

No todos los volúmenes EBS son iguales. AWS ofrece varios tipos con diferentes perfiles de rendimiento
y coste.

**gp3 (SSD de propósito general)**: La elección predeterminada para la mayoría de las cargas de trabajo. Buen equilibrio entre
rendimiento y precio. Adecuado para volúmenes de arranque, bases de datos pequeñas y entornos de desarrollo.

Antes de que gp3 se convirtiera en el valor predeterminado, existía **gp2** — y todavía te lo encontrarás por ahí. Los volúmenes gp2 vinculan su rendimiento de IOPS directamente al tamaño del volumen: obtienes 3 IOPS por gigabyte, hasta un máximo de 16.000 IOPS (que requiere un volumen de 5.334 GB). El rendimiento está limitado a 250 MB/s. Este acoplamiento significa que en gp2, la única forma de obtener más IOPS es hacer el volumen más grande — incluso si no necesitas el espacio extra. gp3 rompió esa dependencia: empieza con 3.000 IOPS y 125 MB/s independientemente del tamaño, y te permite configurar IOPS y rendimiento de forma independiente, a un coste menor. AWS recomienda gp3 para los volúmenes nuevos, pero como muchas cargas de trabajo existentes todavía funcionan con gp2, necesitas conocer ambos.

**io2 (SSD de IOPS aprovisionadas)**: Opción de alto rendimiento para cargas de trabajo intensivas en E/S.
Especificas cuántas operaciones de E/S por segundo (IOPS) necesitas y AWS garantiza
ese rendimiento. Apropiado para grandes bases de datos de producción.

**st1 (HDD optimizado para rendimiento)**: Almacenamiento magnético optimizado para lecturas y escrituras secuenciales grandes. Menor coste que SSD, pero más lento para E/S aleatorio. Bueno para almacenamiento de datos y procesamiento de registros.

**sc1 (HDD frío)**: La opción más barata de EBS. Para datos a los que se accede con poca frecuencia. No
apropiado para nada urgente.

«¿Cuánto más cuesta io2 comparado con gp3?» preguntó Tom, levantando la vista de su cuaderno.

Leo abrió la página de precios. io2 costaba aproximadamente un 50–60% más por GB que gp3,
más un cargo separado por IOPS aprovisionada — y en un volumen de alto rendimiento, esos cargos por IOPS son los que dominan la factura. Tom anotó la brecha. «Así que usamos gp3 hasta
que la base de datos realmente necesite la garantía de rendimiento.»

El examen no requiere que memorices todos los tipos. Sí evalúa tu capacidad para
hacer corresponder los requisitos con el tipo correcto: requisitos de IOPS → io2. Cargas de trabajo secuenciales
sensibles al coste → st1. Aplicaciones web generales → gp3.

**IOPS vs Rendimiento: Por Qué Importa la Distinción**

Tom volvió a la cuestión del volumen de EBS el martes siguiente, después de revisar CloudWatch.

«Veo dos métricas en el panel de EBS», dijo. «IOPS y rendimiento. ¿Son cosas diferentes?»

Lo son.

**IOPS** (Operaciones de Entrada/Salida Por Segundo) mide cuántas operaciones de lectura o escritura puede manejar el disco por segundo. Cada operación es típicamente pequeña — de 4 KB a 256 KB. Las IOPS altas importan para las bases de datos que hacen muchas lecturas y escrituras pequeñas y aleatorias: obtener filas individuales, actualizar registros, manejar consultas concurrentes.

**Rendimiento** (medido en MB/s) mide cuántos datos se mueven por segundo. El alto rendimiento importa para las cargas de trabajo secuenciales: leer archivos de registro grandes, analítica de streaming, cargar grandes conjuntos de datos.

Una base de datos típicamente necesita IOPS altas y rendimiento de bajo a moderado. Un almacén de datos que escanea tablas grandes necesita un alto rendimiento y puede vivir con IOPS moderadas.

Tom había estado vigilando las métricas de CloudWatch de la base de datos de Nimbus. Las IOPS se disparaban durante la hora punta de la cena — lecturas cortas y aleatorias a medida que la aplicación obtenía elementos del menú y datos de pedidos. El rendimiento era bajo. El patrón coincidía con una carga de trabajo de base de datos que necesitaba mejores IOPS, no mejor rendimiento.

«Así que si la base de datos se vuelve lenta», dijo Tom, «¿comprobamos si está limitada por IOPS o por rendimiento antes de actualizar el volumen?»

«Correcto», dijo Priya. «Actualizar de gp3 a io2 añade IOPS a un coste. Si el problema es el rendimiento, esa actualización no ayudará. Comprueba la métrica primero.»

Así es exactamente como evitas actualizaciones de almacenamiento caras que resuelven el problema equivocado.

**Instantáneas de EBS: El Respaldo**

Aquí hay algo que salva a las empresas regularmente.

Una **instantánea de EBS** es una copia de seguridad puntual de un volumen de EBS, almacenada en S3 (aunque
accedes a ella a través de la interfaz de EBS, no directamente a través de S3). Las instantáneas son
incrementales: la primera instantánea captura el volumen completo; las posteriores solo
almacenan lo que cambió desde la última.

Puedes crear un nuevo volumen de EBS desde una instantánea — restaurando a un punto en el tiempo anterior
a una corrupción de la base de datos, un despliegue defectuoso o una eliminación accidental.

Deberías automatizar las instantáneas. AWS proporciona **Amazon Data Lifecycle Manager** para este
propósito: define una política (tomar una instantánea cada 6 horas, conservar los últimos 7 días) y
se ejecuta automáticamente.

Priya lo tenía configurado antes de que la base de datos siquiera entrara en producción.

Leo no lo había pensado.

«¿Hemos pensado en qué pasa si el trabajo de instantáneas falla silenciosamente?» preguntó Priya. «¿Si la política se ejecuta pero las instantáneas no son realmente válidas?»

Probaron el proceso de restauración esa tarde.

La política completa de respaldo por instantáneas de Priya para la base de datos de producción de Nimbus, una vez que tuvo tiempo de documentarla correctamente:

- **Instantáneas diarias**, conservadas durante 7 días. Estas cubren el escenario de recuperación normal: un despliegue defectuoso, una eliminación accidental, un evento de corrupción descubierto en una semana.
- **Instantáneas semanales** (tomadas cada domingo a las 2 de la madrugada), conservadas durante 30 días. Estas cubren el escenario donde un problema no se detecta inmediatamente — una corrupción de datos sutil que solo se nota semanas después.
- Copia de instantánea entre regiones a `us-east-1`, una vez por semana, conservada durante 30 días. Estas cubren el escenario donde toda la Región `us-west-2` no está disponible y Nimbus necesita reconstruir la base de datos en otro lugar.

«Eso parece muchas instantáneas», dijo Leo.

«Cada instantánea incremental después de la primera es pequeña», dijo Priya. «Solo estás almacenando lo que cambió. El coste total de almacenamiento es modesto.»

Tom ya había buscado el precio. Instantáneas diarias de una base de datos de 50 GB, conservadas durante 7 días, más instantáneas semanales conservadas durante 30 días — aproximadamente de 3 a 5 dólares al mes. El coste de no tenerlas, si la base de datos alguna vez se corrompía, era inconmensurablemente mayor.

«¿Y Fast Snapshot Restore?» preguntó Leo. «Vi esa opción cuando estaba mirando la configuración.»

**Fast Snapshot Restore** (FSR) es una función de EBS que elimina la penalización de rendimiento de E/S que normalmente ocurre cuando usas por primera vez una instantánea restaurada. Sin FSR, un volumen de EBS recién restaurado tiene un rendimiento pobre durante los primeros minutos u horas a medida que los datos se cargan de forma diferida desde S3 — las lecturas llegan a S3 buscando datos que aún no se han traído al volumen. Con FSR habilitado en una instantánea en una AZ específica, el volumen restaurado está inmediatamente listo para el rendimiento completo.

FSR cuesta extra — pagas por instantánea por AZ por hora que FSR está habilitado. Para las instantáneas de recuperación ante desastres de Nimbus, el uso ocasional no justificaba el coste continuo de FSR. Para una instantánea de base de datos de producción que necesitaba ser restaurada y operativa en cuestión de minutos en una emergencia, FSR valía la pena.

«Habilita FSR en la instantánea semanal que realmente usaríamos para la recuperación ante desastres», dijo Priya. «No lo habilites en cada instantánea diaria dentro de la ventana de retención.»

Tom añadió el cálculo de coste a su hoja de cálculo.

**Copia de Instantánea entre Regiones para la Recuperación ante Desastres**

Las instantáneas de EBS viven en la Región donde se crearon. Si toda la Región `us-west-2` cae, tus instantáneas en `us-west-2` son inaccesibles.

La solución: **copia de instantánea entre regiones**. Puedes copiar una instantánea de EBS a otra Región, dándote un respaldo utilizable incluso si tu Región principal no está disponible.

AWS Data Lifecycle Manager admite la copia automatizada entre regiones como parte de una política de instantáneas: toma una instantánea diaria en `us-west-2`, cópiala automáticamente a `us-east-1` una vez por semana. Si ocurre un desastre, lanza una nueva instancia EC2 en `us-east-1`, restaura desde la instantánea entre regiones, actualiza el endpoint de DNS y continúa operando.

«Este es nuestro plan de recuperación ante desastres para la base de datos», dijo Priya, presentando la documentación de la política al equipo. «No una arquitectura multirregión completa — eso es más complejidad de la que necesitamos ahora mismo. Pero si `us-west-2` cae por completo, podemos restaurar en `us-east-1` en dos horas.»

«Dos horas de tiempo de inactividad», dijo Tom.

«Frente a un tiempo de inactividad infinito», dijo Priya.

Tom reconoció la distinción.

**Cifrado de EBS: La Historia de Por Qué No Puedes Cifrar En el Lugar**

La base de datos de producción de Nimbus llevaba seis semanas funcionando cuando Priya señaló algo.

«El volumen de EBS no está cifrado», dijo.

«¿Podemos cifrarlo?» preguntó Leo.

«Sí. Pero no en el lugar.»

Aquí está la cosa sobre el cifrado de EBS: no puedes cifrar un volumen de EBS existente y no cifrado directamente. Los datos ya están escritos en texto plano. Para cifrarlos, tienes que:

1. Crear una instantánea del volumen no cifrado
2. Copiar la instantánea, habilitando el cifrado en la copia
3. Crear un nuevo volumen de EBS cifrado desde la instantánea cifrada
4. Detener la instancia
5. Desadjuntar el volumen antiguo no cifrado
6. Adjuntar el nuevo volumen cifrado
7. Iniciar la instancia y verificar que todo funciona

Este proceso tiene una ventana de tiempo de inactividad — la secuencia de parar, desadjuntar, adjuntar, iniciar. Para Nimbus, con una base de datos pequeña, la ventana fue de unos quince minutos. Para una base de datos de producción grande con cientos de GB, el proceso de instantánea y copia puede tardar más, aunque el tiempo de inactividad real de la instancia sigue siendo solo el ciclo de parada/inicio.

«¿Por qué no podemos simplemente accionar un interruptor?» preguntó Leo.

«Porque los datos existentes en el disco son bytes no cifrados», dijo Priya. «AWS no puede recifrarlos sin leer y reescribir cada bloque — que es exactamente lo que hace el proceso de copia de instantánea. Lee cada bloque de la instantánea de origen, cifra cada uno y lo escribe en la nueva instantánea.»

Leo recorrió el proceso. El nuevo volumen cifrado fue adjuntado. La instancia volvió a estar en línea. La base de datos estaba ejecutándose en un volumen cifrado.

«Los nuevos volúmenes de EBS pueden crearse cifrados de forma predeterminada», dijo Priya. «Hay una configuración a nivel de cuenta. Cada nuevo volumen se cifra automáticamente. Deberíamos haber habilitado esto el primer día.»

Lo habilitó. A partir de ese momento, cada volumen de EBS creado en la cuenta de AWS de Nimbus se cifraba de forma predeterminada — sin pasos extra requeridos.

**EFS: El Archivador Compartido**

EBS es un disco adjunto a una instancia. ¿Y si múltiples instancias necesitan acceder a los
mismos archivos simultáneamente?

Lo que necesitas es algo como el archivador en el centro de una oficina — cualquiera
puede acercarse, sacar un archivo, devolverlo, y la siguiente persona ve el cambio inmediatamente.
Múltiples personas, simultáneamente, accediendo al mismo almacenamiento.

AWS lo llama **EFS**: Elastic File System.

EFS es un sistema de archivos de red gestionado. Múltiples instancias EC2 pueden montar el mismo sistema de archivos
de EFS al mismo tiempo y leer/escribir en archivos compartidos. Esta es la capacidad clave
que EBS no proporciona.

Para decirlo claramente:

EBS es un disco duro externo conectado a un portátil. Solo ese portátil puede usarlo a
la vez.

EFS es el archivador en el centro de la oficina. Cualquier miembro del equipo puede acercarse, abrir
un cajón, leer un archivo, devolver algo.

**¿Cuándo necesitas EFS?**

- Cuando múltiples instancias EC2 necesitan compartir archivos — sistemas de gestión de contenido, archivos de
  configuración compartida, bibliotecas de medios compartidas
- Cuando tienes una aplicación escalada horizontalmente donde todas las instancias necesitan acceso a
  los mismos datos
- Cuando necesitas un sistema de archivos persistente que sobreviva a los fallos de las instancias

Se accede a EFS por la red usando el protocolo NFS (específicamente NFSv4). Cualquier instancia EC2
que tenga conectividad de red al destino de montaje (mount target) de EFS puede montarlo — incluyendo
instancias en diferentes AZs dentro de la misma Región. Configuras destinos de montaje en cada
AZ, y las instancias se conectan al destino de montaje más cercano para un rendimiento óptimo.

La implicación práctica: EFS funciona entre AZs desde el primer momento. Si tienes servidores web
en `us-west-2a` y `us-west-2b` ambos montando el mismo sistema de archivos de EFS, un archivo escrito
por un servidor en `2a` es inmediatamente visible para un servidor en `2b`. Este es el comportamiento del sistema de archivos
compartido que EBS no puede proporcionar.

**Modos de Rendimiento de EFS**

EFS tiene dos modos de rendimiento de throughput que importan para el dimensionamiento:

**Throughput Elástico** (el valor predeterminado para la mayoría de los sistemas de archivos nuevos): EFS escala automáticamente el throughput hacia arriba y hacia abajo según el uso real. No aprovisionas un nivel de throughput. Pagas por lo que usas. Este es el modo correcto para cargas de trabajo variables donde las necesidades de throughput fluctúan — como Nimbus, donde el tráfico del lunes por la mañana es diferente del de la tarde del viernes.

**Throughput Aprovisionado**: Especificas el nivel de throughput independientemente de los datos almacenados. Útil cuando tu carga de trabajo necesita un throughput consistentemente alto que excede lo que el volumen de datos almacenados proporcionaría en modo Elástico. Si estás ejecutando un sistema de compilación que lee decenas de gigabytes por minuto independientemente de cuánto se almacena, el Throughput Aprovisionado es apropiado.

También existe un tercer modo, **Throughput de Ráfaga (Bursting)**, que es el comportamiento original de EFS y todavía el valor predeterminado para los sistemas de archivos creados antes de que Elastic estuviera disponible. En modo Bursting, el throughput escala con cuántos datos almacenas: obtienes una línea base de 50 KB/s por GB, más créditos de ráfaga que se acumulan cuando estás por debajo de la línea base y pueden gastarse cuando necesitas más throughput (hasta 100 MB/s para sistemas de archivos más pequeños, o hasta un múltiplo de la línea base para los más grandes). Es la elección correcta para cargas de trabajo con patrones de acceso impredecibles o irregulares donde el sistema de archivos es lo suficientemente grande como para ganar créditos de ráfaga significativos. Si tu sistema de archivos es pequeño y tu patrón de acceso es irregular, puedes agotar tus créditos rápidamente — vigila la métrica de CloudWatch `BurstCreditBalance` para saber dónde estás.

La pregunta de Tom fue inmediata: «¿Es Elastic más caro?»

«Depende del patrón de uso», dijo Leo. «Con Elastic, pagas por el throughput que realmente consumes. Con Provisioned, pagas por el throughput que has especificado aunque no lo estés usando.»

«Así que para cargas de trabajo variables, Elastic suele ser más barato», dijo Tom.

«Normalmente», dijo Priya. «Comprueba tus patrones reales de throughput en CloudWatch antes de decidir.»

EFS también tiene dos modos de rendimiento: **General Purpose** (baja latencia, adecuado para la mayoría de las cargas de trabajo, el valor predeterminado) y **Max I/O** (mayor throughput para cargas de trabajo altamente paralelizadas a costa de una latencia ligeramente mayor). General Purpose maneja la gran mayoría de los casos de uso. Max I/O fue diseñado para aplicaciones que necesitan hacer miles de operaciones simultáneas del sistema de archivos — pipelines de procesamiento de medios a gran escala, flujos de trabajo de computación científica con muchos lectores paralelos.

**EFS vs S3:** EFS es un sistema de archivos (carpetas, archivos, permisos, bloqueo). S3 es
almacenamiento de objetos (subir, descargar, sin semántica de sistema de archivos). EFS es mucho más caro
que S3 — aproximadamente 0,30 dólares por GB al mes para EFS Standard frente a 0,023 dólares por GB al mes
para S3 Standard. Usa S3 para archivos que se almacenan y recuperan completos. Usa EFS para archivos
que las aplicaciones leen y escriben activamente a través de operaciones estándar del sistema de archivos.

**Si EBS, Entonces Una Instancia, Pero Si EFS, Entonces Muchas**

La decisión EBS/EFS se reduce a una pregunta: ¿cuántas instancias necesitan acceder a este almacenamiento al mismo tiempo?

Si construyes una aplicación escalada horizontalmente sobre EBS, entonces cada instancia tiene su propio disco — pero cuando un usuario sube un archivo a la instancia A, la instancia B no puede verlo. Eso está bien para las bases de datos (cada BD tiene su propio disco), pero está roto para el contenido compartido. Si necesitas acceso compartido, EFS es la respuesta — pero EFS cuesta más por GB que S3, y tiene mayor latencia que EBS para E/S aleatorio. La elección correcta depende enteramente de lo que tu aplicación hace con los datos.

**Elegir el Almacenamiento Correcto**

Ahora has visto tres tipos de almacenamiento en AWS. Hagamos la decisión clara.

| Necesidad                                               | Tipo de Almacenamiento    |
|---------------------------------------------------------|---------------------------|
| La base de datos necesita disco persistente y rápido    | EBS (gp3 o io2)           |
| Múltiples servidores necesitan archivos compartidos     | EFS                       |
| Archivos, respaldos, imágenes, objetos grandes          | S3                        |
| Espacio de trabajo temporal de cómputo                  | Instance Store            |
| Archivos a largo plazo con el coste mínimo              | S3 Glacier                |

Puede que te estés preguntando: si EFS permite que múltiples instancias compartan archivos, ¿por qué no usarlo para todo? Porque EFS cuesta significativamente más por GB que S3, y tiene mayor latencia que EBS local para E/S aleatorio. Es la herramienta correcta para el acceso compartido al sistema de archivos — no para el almacenamiento general de archivos o el almacenamiento de base de datos.

Acertar en esta decisión importa. Usar S3 donde necesitas EFS añade complejidad operativa.
Usar EBS donde necesitas EFS causa fallos cuando escalas. Usar instance store donde
necesitas persistencia pierde datos.

Priya imprimió esta tabla y la pegó en la pared.

«Cada vez que añadamos un requisito de almacenamiento», dijo, «empezamos aquí.»

Recorramos algunos escenarios reales para hacer la decisión concreta:

**Escenario A**: Un trabajo de entrenamiento de aprendizaje automático se ejecuta en una instancia EC2 con GPU y necesita
leer un conjunto de datos de 200 GB. El trabajo se ejecuta una vez al día y tarda dos horas. El conjunto de datos
es compartido por múltiples equipos de investigación.

Decisión: S3. El conjunto de datos es grande, se lee una vez por trabajo y es compartido. S3 es barato, duradero
y accesible desde cualquier instancia EC2 o cuenta de cualquier equipo. La instancia con GPU lo lee
a través de la API de S3. No hay necesidad de un sistema de archivos aquí.

**Escenario B**: Un sitio de WordPress se ejecuta en cuatro instancias EC2 detrás de un balanceador de carga.
WordPress almacena archivos de plugins, archivos de temas y subidas de usuarios en un directorio en el
servidor. Las cuatro instancias necesitan leer y escribir los mismos archivos.

Decisión: EFS. WordPress usa semántica de sistema de archivos — crea directorios, escribe
archivos, lee archivos por ruta. S3 requeriría reescribir el ecosistema de plugins de WordPress.
EFS se monta como un sistema de archivos NFS estándar, con el que WordPress funciona de forma nativa.

**Escenario C**: Una base de datos PostgreSQL se ejecuta en una instancia EC2. Necesita E/S aleatorio rápido
para la ejecución de consultas y las búsquedas en índices.

Decisión: EBS (gp3 o io2). Las bases de datos necesitan almacenamiento en bloque con baja latencia para lecturas y
escrituras pequeñas y aleatorias. S3 es demasiado lento y no admite semántica de sistema de archivos.
EFS tiene mayor latencia que EBS para E/S aleatorio.

El patrón: el valor predeterminado para los archivos es S3. Añade EBS cuando necesitas almacenamiento en bloque para una
instancia específica. Añade EFS cuando múltiples instancias necesitan compartir un sistema de archivos.
Instance store solo para espacio de trabajo temporal.

## Cuando EFS No Es Suficiente: Amazon FSx

La siguiente lección de almacenamiento no llegó como una interrupción ni como un debate de pizarra. Llegó como un contrato de ventas — del tipo que Maya había estado persiguiendo desde que se lanzó el portal, del tipo que requería un trimestre completo de demos y llamadas de seguimiento para cerrar. Tres meses después de que se lanzara el portal de operadores de restaurantes, Nimbus firmó su primer cliente multilocal: Copper Kettle, un grupo familiar de una docena de locales por todo el medio oeste. Maya había dirigido el acuerdo. Tom había construido el modelo financiero. Leo había empezado a planificar la integración técnica antes de que la tinta se secara.

Luego leyó las notas de infraestructura del equipo de TI de Copper Kettle.

«Sus servidores de archivos son Windows», dijo. «Todo es Windows. Su software de gestión de cocina, su sistema de RR. HH., su herramienta de programación de horarios — todo escribe en unidades compartidas en servidores de archivos Windows. Protocolo SMB. Autenticación de Active Directory.»

«¿Podemos pasarlos a EFS?» preguntó Maya.

Leo negó con la cabeza. «EFS usa NFS. Sus aplicaciones hablan SMB. Esos son protocolos diferentes. El software de Copper Kettle no sabe qué es NFS. No puedes simplemente apuntarlo a un montaje de EFS.»

«Así que no podemos usar EFS.»

«No para esto. Hay un servicio diferente.»

**FSx for Windows File Server: EFS, Pero para Windows**

**Amazon FSx for Windows File Server** es un sistema de archivos compartido totalmente gestionado y nativo de Windows. Admite el protocolo SMB (Server Message Block) — el mismo protocolo que los servidores Windows, las aplicaciones Windows y los recursos compartidos de archivos Windows en las instalaciones propias han usado durante décadas. Se integra con Active Directory, admite ACLs de Windows (permisos a nivel de archivo) y admite las funciones específicas de Windows de las que las aplicaciones Windows realmente dependen.

Piénsalo como EFS, pero para Windows — con todas las funciones específicas de Windows que tu entorno de Active Directory ya espera. El software de gestión de cocina de Copper Kettle se conectaría a él exactamente como se había conectado a los servidores de archivos en las instalaciones propias. La aplicación no cambia. El protocolo no cambia. Los datos simplemente viven en un servicio gestionado de AWS en lugar de un servidor en un sótano en algún lugar de Chicago.

Para la migración de Copper Kettle: Leo aprovisionó un sistema de archivos de FSx for Windows File Server, lo conectó al Active Directory de Copper Kettle (extendido a AWS mediante AWS Managed Microsoft AD) y mapeó las letras de unidad existentes. El software de cocina encontró sus recursos compartidos de archivos exactamente donde los esperaba.

«¿Cuánto cuesta eso al mes?» preguntó Tom.

Leo ya lo había mirado. FSx for Windows tiene un precio por GB de almacenamiento al mes — más caro que EFS, significativamente más que S3, pero mucho más barato que mantener servidores de archivos Windows en una docena de locales. Tom anotó el número sin objeción.

**FSx for Lustre: Cuando Tu Trabajo de ML Necesita Alimentar a Cientos de GPUs**

Mientras tanto, Leo había empezado a prototipar un motor de recomendación por su cuenta — prediciendo qué platos era probable que un cliente pidiera en función del comportamiento pasado y de lo que pedían clientes similares. Los datos de entrenamiento todavía eran pequeños, pero el experimento lo llevó por un agujero de conejo sobre cómo los equipos serios de ML alimentan sus modelos: trabajos de entrenamiento que leen cientos de gigabytes de S3 en cada ejecución.

«El patrón que sigue apareciendo en los casos de estudio», informó en el siguiente almuerzo del equipo, «son trabajos de entrenamiento cuello de botella en E/S. GPUs caras inactivas el 40% del tiempo, esperando el siguiente lote de datos.»

Este es un problema diferente del almacenamiento de archivos compartidos. Es un problema de computación de alto rendimiento (HPC): cuando tienes cientos de unidades de procesamiento que todas necesitan leer datos simultáneamente, a muy alto throughput, del mismo conjunto de datos.

**Amazon FSx for Lustre** es una implementación totalmente gestionada del sistema de archivos paralelo Lustre. Lustre está construido a propósito para exactamente este escenario — lecturas paralelas a un throughput extremadamente alto, a través de muchos clientes simultáneos. Se integra de forma nativa con S3: apuntas FSx for Lustre a un bucket de S3, y automáticamente hace que esos datos estén disponibles a través del sistema de archivos Lustre. El trabajo de entrenamiento lee de un punto de montaje local; FSx transmite los datos desde S3 entre bastidores.

Cuando tu trabajo de entrenamiento de ML necesita alimentar datos a cientos de GPUs simultáneamente, FSx for Lustre es la herramienta. Lo mismo aplica al modelado financiero, las cargas de trabajo de genómica y el renderizado de vídeo — cualquier carga de trabajo donde el cuello de botella es el throughput de E/S paralelo en lugar de la capacidad de almacenamiento.

El caso de estudio que Leo había marcado contaba la historia en dos números: después de migrar el trabajo de entrenamiento a FSx for Lustre, la utilización de la GPU subió del 60% al 94%, y la ejecución de entrenamiento que había tardado seis horas se completó en tres y media. Nimbus no necesitaría ese tipo de potencia durante mucho tiempo — pero Leo archivó el patrón para el día en que el motor de recomendación creciera.

**Las Otras Opciones de FSx**

AWS también ofrece **FSx for NetApp ONTAP** — para empresas que ya ejecutan almacenamiento NetApp en las instalaciones propias y quieren acceso multiprotocolo (NFS, SMB e iSCSI desde el mismo sistema de archivos) — y **FSx for OpenZFS**, para cargas de trabajo que necesitan funciones específicas de ZFS como instantáneas y clones a nivel del sistema de archivos. Ambas son herramientas especializadas para organizaciones con infraestructura o requisitos existentes específicos.

Para la mayoría de los equipos, la decisión es entre las cuatro variantes de FSx y EFS. La pregunta es siempre la misma: ¿qué protocolo habla la carga de trabajo, y qué características de rendimiento necesita?

---

> **Consejo para el Examen — Amazon FSx**
>
> *Dominio SAA-C03: Diseñar Arquitecturas de Alto Rendimiento (Dominio 3, Tarea 3.1)*
>
> - **FSx for Windows = SMB + Active Directory + cargas de trabajo Windows**. Las señales del examen: «servidor de archivos Windows», «protocolo SMB», «integración con Active Directory», «migrar aplicaciones Windows (lift-and-shift)». Cuando veas cualquiera de esas frases, FSx for Windows es la respuesta.
> - **FSx for Lustre = HPC + entrenamiento de ML + E/S paralelo + integración con S3**. Las señales del examen: «entrenamiento de aprendizaje automático», «computación de alto rendimiento», «HPC», «sistema de archivos paralelo», «cargas de trabajo intensivas en E/S», «clúster de GPU», «integrar el sistema de archivos con S3». Cuando veas esas frases, FSx for Lustre es la respuesta.
> - **EFS no es un sustituto de ninguno de los dos.** EFS es NFS para cargas de trabajo Linux. No habla SMB. No es un sistema de archivos paralelo de alto rendimiento. Usar EFS donde se necesita FSx significa que la aplicación no funciona (Windows) o tiene cuello de botella de E/S (HPC).
> - **FSx for NetApp ONTAP y FSx for OpenZFS** aparecen con menos frecuencia, pero las señales son distintivas. «Migrar almacenamiento NetApp/ONTAP existente», «acceso multiprotocolo (NFS + SMB + iSCSI)» o «SnapMirror» → FSx for NetApp ONTAP. «ZFS», «NFS con instantáneas/clones instantáneos» o «migrar un servidor de archivos ZFS en las instalaciones propias» → FSx for OpenZFS.
> - Referencia rápida: «SMB o servidor de archivos Windows» → FSx for Windows. «Entrenamiento de aprendizaje automático o computación de alto rendimiento» → FSx for Lustre. «NetApp/multiprotocolo» → FSx for ONTAP. «ZFS» → FSx for OpenZFS.

---

## El Puente a la Nube: AWS Storage Gateway

El prospecto más grande de Nimbus hasta el momento — una cadena regional llamada Meridian Kitchen, veinte locales en tres estados — vino con un problema que no podía resolverse con `aws s3 cp`.

Meridian tenía años de datos operativos viviendo en servidores de archivos en las instalaciones propias. Recetas, facturas, grabaciones de vídeo de cocina, contratos con proveedores. No unos pocos gigabytes. Terabytes. Y el software que generaba y consumía estos datos — su sistema de gestión de cocina, su plataforma de facturación, sus herramientas de RR. HH. — todo escribía en recursos compartidos de archivos locales usando NFS o SMB. Reescribir esas aplicaciones no era factible. Mover todos los datos de la noche a la mañana tampoco era factible.

«Entonces, ¿cómo empezamos a meter sus datos en AWS», preguntó Maya, «sin pedirles que cambien una sola aplicación?»

«Hay un servicio para exactamente esto», dijo Priya. «Se ejecuta en su centro de datos como una VM, parece un servidor de archivos o dispositivo de almacenamiento normal para su software existente, y almacena todo silenciosamente en AWS entre bastidores.»

Ese servicio es **AWS Storage Gateway**: un servicio de almacenamiento híbrido que conecta los entornos en las instalaciones propias con el almacenamiento de AWS. Presenta el almacenamiento a tus aplicaciones usando los protocolos que ya entienden, mientras que en realidad persiste los datos en S3, S3 Glacier o como instantáneas de EBS.

Hay tres tipos de gateway, cada uno resolviendo un problema diferente de las instalaciones propias.

**File Gateway** presenta una interfaz NFS o SMB a las aplicaciones en las instalaciones propias. Los archivos escritos en el gateway se almacenan como objetos en S3 — pero la aplicación no lo sabe. Ve un sistema de archivos. Los archivos a los que se accede con frecuencia se almacenan en caché localmente para lecturas de baja latencia; el resto vive en S3. Esto es lo que Meridian necesitaba: el software de gestión de cocina escribe en lo que parece un recurso compartido de archivos, y los datos acaban en S3 donde Nimbus puede analizarlos, respaldarlos y buscarlos.

«Espera — pero ¿*por qué* lo haríamos de esa manera?» preguntó Maya. «¿Por qué no apuntar el software a S3 directamente?»

Porque NFS y SMB no son S3. El software de cocina no habla la API de S3. Abre rutas de archivo. Escribe bytes en un directorio. File Gateway traduce eso en operaciones de objetos de S3 sin que la aplicación sepa que algo cambió.

**Volume Gateway** presenta volúmenes de almacenamiento en bloque iSCSI a los servidores en las instalaciones propias — la misma interfaz que presentaría un disco duro físico o un dispositivo SAN. Tiene dos modos: los *volúmenes almacenados* (stored) mantienen los datos primarios en las instalaciones propias con respaldos asíncronos a S3 como instantáneas de EBS (para cargas de trabajo que priorizan las instalaciones propias pero que también quieren respaldo en la nube), y los *volúmenes en caché* (cached) mantienen los datos primarios en S3 con los datos de acceso frecuente almacenados en caché en las instalaciones propias (para organizaciones listas para tratar S3 como almacenamiento primario).

**Tape Gateway** presenta una biblioteca de cintas virtuales (VTL) al software de respaldo como Veeam, Veritas o NetBackup. El software de respaldo escribe en lo que parecen cartuchos de cinta físicos. Esas cintas virtuales se almacenan en S3 y pueden archivarse en S3 Glacier. El software de respaldo no cambia. Los robots y estantes de cintas físicas desaparecen.

«El equipo de respaldo de Meridian ejecuta Veeam», dijo Leo. «Tienen cintas físicas reales. Almacenamiento fuera del sitio, calendarios de rotación, todo el rollo.»

«Tape Gateway reemplaza las cintas físicas», dijo Priya. «Misma configuración de Veeam. Mismos trabajos de respaldo. Las cintas simplemente viven en S3 en lugar de en un rack.»

Tom buscó el coste del almacenamiento de cintas fuera del sitio. Cerró esa pestaña sin comentarios y aprobó el plan de migración.

---

> **Consejo para el Examen — AWS Storage Gateway**
>
> *Dominio SAA-C03: Diseñar Arquitecturas de Alto Rendimiento (Dominio 3)*
>
> - **File Gateway = NFS/SMB → S3.** Los archivos escritos por aplicaciones en las instalaciones propias se convierten en objetos de S3. Los archivos de acceso frecuente se almacenan en caché localmente. Disparador del examen: «una aplicación en las instalaciones propias necesita almacenar archivos en S3 sin cambios de código».
> - **Volume Gateway = almacenamiento en bloque iSCSI → instantáneas de S3.** Modo almacenado: datos primarios en las instalaciones propias, respaldados en S3 como instantáneas de EBS. Modo en caché: datos primarios en S3, bloques de acceso frecuente almacenados en caché localmente. Disparador del examen: «un servidor en las instalaciones propias necesita almacenamiento en bloque respaldado por la nube».
> - **Tape Gateway = VTL → S3/Glacier.** El software de respaldo escribe en cintas virtuales; las cintas se almacenan en S3 o se archivan en Glacier. Disparador del examen: «reemplazar la infraestructura de respaldo en cinta física sin cambiar el software de respaldo».
> - **Patrón clave del examen:** «una aplicación en las instalaciones propias necesita almacenamiento en la nube sin cambios de código» → Storage Gateway. «Reemplazar el respaldo en cinta» → Tape Gateway específicamente.

---

## Fortalezas y Limitaciones

**Fortalezas de EBS**:

- Almacenamiento en bloque persistente y rápido para EC2
- Instantáneas para respaldo y recuperación puntual
- Múltiples niveles de rendimiento para diferentes cargas de trabajo
- Cifrado en reposo admitido de forma nativa — habilita el cifrado a nivel de cuenta de forma predeterminada

**Limitaciones de EBS**:

- Adjunto a una instancia a la vez (con excepciones menores)
- En la misma AZ que la instancia EC2 (copiar a otra AZ requiere una instantánea)
- Pagas por el almacenamiento aprovisionado, no solo por lo que usas
- Cifrar un volumen existente no cifrado requiere un ciclo de instantánea-copia-restauración con una ventana de mantenimiento

**Fortalezas de EFS**:

- Sistema de archivos compartido para múltiples instancias — protocolo NFS nativo
- Escala automáticamente, no necesitas aprovisionar capacidad
- Accesible en AZs dentro de una Región
- El modo de Throughput Elástico se ajusta automáticamente a la carga de trabajo

**Limitaciones de EFS**:

- Más caro que S3 por GB
- Mayor latencia que EBS para E/S aleatorio
- No disponible en todas las Regiones

## Mover Datos en Bloque: DataSync y la Familia Snow

Storage Gateway mantiene las aplicaciones en las instalaciones propias *continuamente conectadas* al almacenamiento en la nube. Pero otros dos escenarios de migración aparecen constantemente en el examen — y eventualmente en proyectos reales:

**AWS DataSync** es para *transferencia masiva en línea*: mover grandes conjuntos de datos por la red entre servidores de archivos NFS/SMB en las instalaciones propias (u otras nubes) y S3, EFS o FSx — una vez, o según un calendario. Maneja la paralelización, la verificación de integridad, los reintentos y la limitación de ancho de banda, y es aproximadamente 10 veces más rápido que los scripts caseros estilo rsync. Disparador del examen: «migrar/transferir millones de archivos de un servidor NFS en las instalaciones propias a Amazon EFS/S3» → DataSync. (No lo confundas con Storage Gateway, que es para el *acceso híbrido continuo*, ni con DMS, que migra *bases de datos*.)

**La Familia AWS Snow** es para cuando la red es el cuello de botella. Mover 100 TB por una línea de 100 Mbps tarda más de tres meses; un camión es más rápido. **Snowball Edge** es un dispositivo robusto que AWS te envía — carga hasta ~80 TB localmente, devuélvelo, AWS lo importa a S3. **Snowcone** era la versión pequeña y portátil (~8-14 TB) para ubicaciones de borde — descontinuada a finales de 2024, aunque todavía puede aparecer en preguntas de examen más antiguas (consulta la verificación de la realidad en el Capítulo 25). Disparador de cálculo del examen: cuando el enunciado te da un tamaño de conjunto de datos y un enlace delgado o poco fiable y pide la migración más rápida/práctica, calcula el tiempo de transferencia — si son semanas o meses, la respuesta es la Familia Snow.

> **Consejo para el Examen — AWS Backup**
>
> Un servicio más que une este capítulo: **AWS Backup** centraliza y automatiza los respaldos a través de EBS, EFS, RDS, DynamoDB, FSx y Storage Gateway con un único plan de respaldo — calendarios, retención, copias entre regiones y entre cuentas, y Backup Vault Lock para la inmutabilidad. Disparador del examen: «gestionar centralmente los respaldos a través de múltiples servicios/cuentas de AWS» → AWS Backup, no scripts por servicio.


## Resumen

El bolígrafo rojo de Tom rodeó el problema real: demasiado en una máquina. Mover el almacenamiento fuera de la instancia EC2 no es solo cuestión de capacidad — es cuestión de separar las responsabilidades para que cada capa pueda gestionarse, escalarse y asegurarse de forma independiente. La elección de almacenamiento correcta depende de cuatro preguntas: qué necesita el almacenamiento, cuántas cosas lo necesitan a la vez, cuánto tiempo vive, y cómo se accede a él. Esas cuatro preguntas conducen consistentemente a la respuesta correcta.

- **EBS** (Elastic Block Store) es almacenamiento en bloque persistente para una única instancia EC2. Sobrevive a las paradas de la instancia y puede ser objeto de instantáneas para respaldo. Usa gp3 para cargas de trabajo generales, io2 para requisitos de IOPS altas. El instance store es temporal y rápido pero se pierde cuando la instancia termina.
- **EFS** (Elastic File System) es un sistema de archivos de red compartido que múltiples instancias pueden montar simultáneamente. EFS abarca AZs dentro de una Región; EBS está restringido a una única AZ.
- Haz corresponder el tipo de almacenamiento con el requisito: base de datos en una única EC2 → EBS; archivos compartidos entre servidores → EFS; objetos, medios, respaldos → S3; archivos → S3 Glacier.
- Cifrar un volumen de EBS existente requiere: instantánea → copia cifrada → nuevo volumen → intercambio. Habilita el cifrado a nivel de cuenta de forma predeterminada para evitar esto en los volúmenes nuevos.
- **«Eliminar al Terminar» de EBS**: los volúmenes raíz por defecto se eliminan al terminar la instancia; los volúmenes de datos por defecto persisten. Revisa ambas configuraciones al diseñar las políticas de ciclo de vida de las instancias.

## Consejos para el Examen

*Dominio SAA-C03 3 — Tarea 3.1 (soluciones de almacenamiento)*

- **Los volúmenes EBS viven en una AZ.** Solo se pueden adjuntar a una instancia en la
  misma AZ. Para usar un volumen EBS en una AZ diferente, creas una instantánea y la restauras
  en la AZ objetivo.
- **Las instantáneas de EBS son incrementales y se almacenan en S3.** La primera instantánea es completa;
  las posteriores solo almacenan los cambios. Puedes copiar instantáneas a otras Regiones para
  la recuperación ante desastres.
- **EFS es entre AZs.** Múltiples instancias en diferentes AZs dentro de la misma Región
  pueden montar el mismo sistema de archivos de EFS. Este es un diferenciador clave de EBS.
- **Cuando un escenario del examen dice «aplicación web con contenido compartido» o «múltiples
  instancias accediendo a los mismos archivos», piensa en EFS.** Cuando dice «almacenamiento de base de datos»
  o «disco persistente para un servidor», piensa en EBS.
- **Los datos del instance store sobreviven a un reinicio pero no a una parada o terminación.** Una pregunta
  podría describir datos que «desaparecen después de que la instancia se detiene» — eso es
  instance store en juego.
- **gp3 vs io2**: gp3 es el valor predeterminado para uso general; io2 es para cargas de trabajo que
  necesitan IOPS garantizadas (grandes bases de datos, sistemas de misión crítica). Los escenarios del examen
  que describen «requisitos de IOPS» o «rendimiento de base de datos consistente de baja latencia»
  apuntan hacia io2.
- **gp2 vs gp3:** las IOPS de gp2 están acopladas al tamaño (3 IOPS/GB, máx 16.000 IOPS a 5.334 GB); las IOPS de gp3 son independientes del tamaño (3.000 de base, configurables hasta 80.000 desde septiembre de 2025 — el material más antiguo, y posiblemente el banco de preguntas del examen, todavía asume el límite anterior de 16.000). Patrón de pregunta de examen: una carga de trabajo necesita más IOPS sin aumentar el almacenamiento — la respuesta es gp3 o io2, no gp2.
- **Cifrado en reposo para EBS**: No puedes cifrar un volumen existente no cifrado
  en el lugar — debes hacer una instantánea, copiar cifrada, restaurar. Habilita los valores predeterminados de cifrado
  a nivel de cuenta para evitar crear volúmenes no cifrados accidentalmente. El cifrado es AES-256
  usando claves de KMS.
- **Fast Snapshot Restore** elimina la penalización de rendimiento en los volúmenes recién restaurados
  pero cuesta dinero por instantánea por AZ. Las preguntas del examen sobre restaurar volúmenes
  «inmediatamente a pleno rendimiento» apuntan a FSR.
- **Modos de rendimiento de EFS**: General Purpose (baja latencia, adecuado para la mayoría de las cargas de trabajo)
  vs Max I/O (mayor throughput para cargas de trabajo altamente paralelizadas).
- **Modos de throughput de EFS — tres opciones:** Bursting (el throughput escala con el tamaño de almacenamiento, usa créditos de ráfaga — bueno para cargas de trabajo irregulares), Elastic (escala automáticamente, pago por uso — bueno para cargas de trabajo impredecibles), Provisioned (throughput fijo independientemente del almacenamiento — bueno para necesidades de alto throughput consistente). El examen evalúa si sabes cuándo aprovisionar throughput frente a dejarlo escalar elásticamente o depender de los créditos de ráfaga.
- **Copia de instantánea entre regiones**: Las instantáneas de EBS se pueden copiar a otras Regiones para
  la recuperación ante desastres. La instantánea copiada es independiente y no añade costes de transferencia
  de datos durante la restauración — solo durante la operación de copia en sí.
- **Tipos de Storage Gateway:** File Gateway = NFS/SMB → S3 (los archivos se convierten en objetos). Volume Gateway = almacenamiento en bloque iSCSI → instantáneas de S3 (almacenado: primario en las instalaciones propias; en caché: primario en S3). Tape Gateway = VTL → S3/Glacier (reemplaza las cintas físicas). Disparador del examen: «una aplicación en las instalaciones propias necesita almacenamiento en la nube sin cambios de código» → Storage Gateway. «Reemplazar el respaldo en cinta» → Tape Gateway.

## Ejercicios

**Ejercicio 1 — Recordar**

Con tus propias palabras: ¿cuál es la diferencia entre EBS y EFS? ¿Cuándo elegirías
uno frente al otro?

*(Pista: Piensa en si una instancia o múltiples instancias necesitan acceder al
almacenamiento al mismo tiempo.)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: Una empresa ejecuta una aplicación web en cuatro instancias EC2 detrás de un balanceador
de carga. Los usuarios pueden subir fotos de perfil. Cualquier foto debe ser visible por los usuarios
inmediatamente después de subirla, independientemente de qué instancia la manejó. Las fotos se
sirven a los navegadores a través de HTTP, nunca se modifican en su lugar, y el equipo quiere la
solución MÁS rentable y escalable con la menor sobrecarga operativa.

¿Qué solución de almacenamiento satisface MEJOR sus requisitos?

A) Adjuntar un volumen EBS gp3 a cada instancia EC2 y sincronizar archivos entre ellas usando
   un cron job  
B) Almacenar fotos directamente en el almacenamiento de instance store de la instancia EC2  
C) Usar Amazon EFS, montado en las cuatro instancias EC2 simultáneamente  
D) Almacenar fotos en S3 y acceder a ellas directamente desde el código de la aplicación

**Pista 1**: El requisito es «las cuatro instancias deben servir cualquier foto». ¿Qué opciones
hacen que un archivo sea inmediatamente visible para todas las instancias?

**Pista 2**: El almacenamiento de instance store es efímero. EBS no se puede montar en múltiples instancias
simultáneamente. Eso lo reduce.

**Pista 3**: Tanto C como D podrían teóricamente funcionar. ¿Cuál es más apropiado para
el caso en que la aplicación necesita acceder a las fotos a través de operaciones del sistema de archivos frente a
solicitudes HTTP?

**Respuesta**: D

**Explicación**: Almacenar fotos en S3 y servirlas a través de URL es la elección arquitectónicamente
correcta para una aplicación web. Las fotos subidas son inmediatamente accesibles desde
cualquier servidor (y desde cualquier navegador) a través de la URL de S3. S3 está diseñado exactamente para este
caso de uso: almacenar archivos subidos por usuarios a escala con alta disponibilidad y cero
sobrecarga de gestión.

Nota: C (EFS) funcionaría técnicamente, pero S3 es el patrón preferido para archivos binarios subidos por usuarios en aplicaciones web porque es más barato, más escalable y sirve archivos
a través de HTTP directamente sin que la aplicación actúe como proxy.

**¿Por qué no A?** Sincronizar archivos mediante cron job crea condiciones de carrera y problemas de consistencia.
Entre las subidas y la siguiente sincronización, los archivos faltarían en otras instancias.

**¿Por qué no B?** Los datos del almacenamiento de instance store se pierden cuando la instancia se detiene o termina.
Las fotos desaparecerían.

**¿Por qué no C?** EFS es la respuesta correcta cuando la pregunta exige semántica del sistema de archivos
(p. ej., un CMS que modifica archivos en su lugar). Para fotos subidas por usuarios servidas a través de la
web, S3 es más sencillo, más barato y más apropiado.

**Advertencia de palabra clave del examen**: en el examen real, lee el enunciado literalmente. Si dice
«almacenamiento de **archivos** compartidos», «sistema de archivos», «NFS» o «POSIX», la respuesta clave es
**EFS** — no anules el requisito declarado con gusto arquitectónico. Este
escenario tiene como clave S3 porque pide la entrega rentable de objetos a través de HTTP,
no un sistema de archivos.

*Dominio SAA-C03 3 — Tarea 3.1*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus está añadiendo una nueva función: los propietarios de restaurantes pueden subir menús en PDF que luego
se analizan para poblar la base de datos de Nimbus. El trabajo de procesamiento de PDF se ejecuta
en una flota de instancias EC2 que necesitan: (a) leer el PDF subido, (b) escribir
archivos de procesamiento temporales, (c) escribir la salida analizada.

¿Qué servicios de almacenamiento usarías para cada uno de estos tres pasos y por qué?

*(No hay una única respuesta correcta. Céntrate en hacer corresponder el tipo de almacenamiento con las
características de cada paso.)*

## Escena Post-Créditos

Esa tarde, Nimbus separó correctamente su almacenamiento. La base de datos obtuvo su propio
volumen EBS con instantáneas automatizadas y el cifrado habilitado. Las fotos de menú se trasladaron a S3. La instancia EC2
finalmente tuvo espacio para respirar.

Leo ejecutó una prueba de carga. El sitio manejó doscientos usuarios simultáneos sin pestañear.

«Estará bien de aquí en adelante», dijo, viendo los gráficos estabilizarse suavemente.

Tom miró la factura. El volumen EBS añadía 8 dólares al mes. Lo anotó.

«Sigo añadiendo cosas a esta factura», dijo. «¿Cuándo se equilibra?»

«Cuando dejemos de tener averías», dijo Maya. «Cada avería cuesta más que la prevención.»

Tom no parecía convencido. Lo estaría, eventualmente.

Tres días después, el propietario de un restaurante en la plataforma intentó hacer un pedido y obtuvo
un error. Maya revisó los registros.

La base de datos estaba ahí. La aplicación estaba en funcionamiento. Pero veinte usuarios simultáneos
estaban intentando leer el menú a la vez, y cada uno estaba llegando a la base de datos.

«Cada carga de página es una consulta a la base de datos», dijo Leo. «Cada una.»

Priya ya estaba buscando algo en Google.

En el próximo capítulo: qué pasa cuando llegan más clientes de los que el servidor puede manejar.
