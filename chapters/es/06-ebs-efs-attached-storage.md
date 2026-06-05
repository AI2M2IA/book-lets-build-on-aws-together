# Capítulo 6: El Disco que Te Sigue a Todas Partes

Tom tenía un bolígrafo rojo y un hábito que ponía nervioso a Leo.

Cada sábado por la mañana, Tom imprimía el resumen de la consola de AWS — instancias en ejecución, volúmenes de almacenamiento, discos adjuntos — y lo repasaba línea por línea. Lo hacía desde la segunda semana. Lo llamaba «el libro mayor». Leo lo llamaba «la cosa que hace Tom que hace que Leo sienta que ha hecho algo mal».

Ese sábado, Tom marcó algo con un círculo y dejó la impresión en el escritorio de Maya sin decir una palabra.

Ella la encontró el lunes por la mañana. Un círculo. Una nota al margen, tres palabras:

*Todo. Una máquina.*

El servidor web. La base de datos. Todos los registros de los clientes. Dos meses de historial de pedidos. Todo ejecutándose en una única instancia EC2.

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

**Amazon EBS** — Elastic Block Store (Almacenamiento en Bloque Elástico) — es almacenamiento en bloque persistente para instancias EC2.

El almacenamiento en bloque significa que se comporta como un disco duro real: tu sistema operativo puede crear
sistemas de archivos en él, leer y escribir bytes arbitrarios en posiciones arbitrarias, ejecutar bases de datos
en él y tratarlo exactamente como un disco adjunto.

Las propiedades clave:

**Persistente.** A diferencia del almacenamiento de instance store, los volúmenes de EBS sobreviven a paradas, arranques e incluso
a la terminación de la instancia (dependiendo de la configuración). Los datos permanecen en el volumen
incluso cuando ninguna instancia lo está usando.

**Adjuntable y desadjuntable.** Un volumen de EBS se puede desadjuntar de una instancia y
adjuntar a otra. Si necesitas migrar datos o recuperarte de una instancia fallida,
puedes desadjuntar el volumen y volverlo a adjuntar en otro lugar.

**Adjunción única (principalmente).** Por defecto, un volumen de EBS está adjunto a exactamente una
instancia EC2 a la vez. Una única instancia puede tener múltiples volúmenes de EBS, pero un único
volumen de EBS no puede ser montado por múltiples instancias simultáneamente (con una excepción:
EBS Multi-Attach, que tiene casos de uso limitados y restricciones importantes).

La analogía: EBS es un disco duro externo que conectas a un portátil. El portátil
(instancia EC2) puede leer y escribir en él. Cuando terminas, puedes desconectarlo y
conectarlo a un portátil diferente.

**Tipos de Volúmenes EBS**

No todos los volúmenes EBS son iguales. AWS ofrece varios tipos con diferentes perfiles de rendimiento
y coste.

**gp3 (SSD de propósito general)**: La elección predeterminada para la mayoría de las cargas de trabajo. Buen equilibrio entre
rendimiento y precio. Adecuado para volúmenes de arranque, bases de datos pequeñas y entornos de desarrollo.

**io2 (SSD de IOPS aprovisionadas)**: Opción de alto rendimiento para cargas de trabajo intensivas en E/S.
Especificas cuántas operaciones de E/S por segundo (IOPS) necesitas y AWS garantiza
ese rendimiento. Apropiado para grandes bases de datos de producción.

**st1 (HDD optimizado para rendimiento)**: Almacenamiento magnético optimizado para lecturas y escrituras secuenciales grandes. Menor coste que SSD, pero más lento para E/S aleatorio. Bueno para almacenamiento de datos y procesamiento de registros.

**sc1 (HDD frío)**: La opción más barata de EBS. Para datos a los que se accede con poca frecuencia. No
apropiado para nada urgente.

El examen no requiere que memorices todos los tipos. Sí evalúa tu capacidad para
hacer corresponder los requisitos con el tipo correcto: requisitos de IOPS → io2. Cargas de trabajo secuenciales
sensibles al coste → st1. Aplicaciones web generales → gp3.

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

Priya lo tenía configurado antes de que la base de datos entrara en producción.

Leo no lo había pensado.

**EFS: El Archivador Compartido**

EBS es un disco adjunto a una instancia. ¿Y si múltiples instancias necesitan acceder a los
mismos archivos simultáneamente?

Entra en escena **Amazon EFS** — Elastic File System (Sistema de Archivos Elástico).

EFS es un sistema de archivos de red gestionado. Múltiples instancias EC2 pueden montar el mismo sistema de archivos
de EFS al mismo tiempo y leer/escribir en archivos compartidos. Esta es la capacidad clave
que EBS no proporciona.

Piénsalo así:

EBS es un disco duro externo conectado a un portátil. Solo ese portátil puede usarlo a la vez.

EFS es un archivador en el centro de una oficina. Cualquier miembro del equipo puede acercarse, abrir
un cajón, leer un archivo, devolver algo. Múltiples personas, simultáneamente, accediendo
al mismo almacenamiento.

**¿Cuándo necesitas EFS?**

- Cuando múltiples instancias EC2 necesitan compartir archivos — sistemas de gestión de contenido, archivos de
  configuración compartida, bibliotecas de medios compartidas
- Cuando tienes una aplicación escalada horizontalmente donde todas las instancias necesitan acceso a
  los mismos datos
- Cuando necesitas un sistema de archivos persistente que sobreviva a los fallos de las instancias

**EFS vs S3:** EFS es un sistema de archivos (carpetas, archivos, permisos, bloqueo). S3 es
almacenamiento de objetos (subir, descargar, sin semántica de sistema de archivos). EFS es mucho más caro
que S3. Usa S3 para archivos que se almacenan y recuperan completos. Usa EFS para archivos
que las aplicaciones leen y escriben activamente a través de operaciones estándar del sistema de archivos.

**Elegir el Almacenamiento Correcto**

Ahora has visto tres tipos de almacenamiento en AWS. Hagamos la decisión clara.

| Necesidad                                               | Tipo de Almacenamiento    |
|---------------------------------------------------------|---------------------------|
| La base de datos necesita disco persistente y rápido    | EBS (gp3 o io2)           |
| Múltiples servidores necesitan archivos compartidos     | EFS                       |
| Archivos, respaldos, imágenes, objetos grandes          | S3                        |
| Espacio de trabajo temporal de cómputo                  | Instance Store            |
| Archivos a largo plazo con el coste mínimo              | S3 Glacier                |

Acertar en esta decisión importa. Usar S3 donde necesitas EFS añade complejidad operativa.
Usar EBS donde necesitas EFS causa fallos cuando escalas. Usar instance store donde
necesitas persistencia pierde datos.

Priya imprimió esta tabla y la pegó en la pared.

«Cada vez que añadamos un requisito de almacenamiento», dijo, «empezamos aquí.»

## Fortalezas y Limitaciones

**Fortalezas de EBS**:

- Almacenamiento en bloque persistente y rápido para EC2
- Instantáneas para respaldo y recuperación puntual
- Múltiples niveles de rendimiento para diferentes cargas de trabajo
- Cifrado en reposo admitido de forma nativa

**Limitaciones de EBS**:

- Adjunto a una instancia a la vez (con excepciones menores)
- En la misma AZ que la instancia EC2 (copiar a otra AZ requiere una instantánea)
- Pagas por el almacenamiento aprovisionado, no solo por lo que usas

**Fortalezas de EFS**:

- Sistema de archivos compartido para múltiples instancias — protocolo NFS nativo
- Escala automáticamente, no necesitas aprovisionar capacidad
- Accesible en AZs dentro de una Región

**Limitaciones de EFS**:

- Más caro que S3 por GB
- Mayor latencia que EBS para E/S aleatorio
- No disponible en todas las Regiones

## Resumen

- El **almacenamiento de instance store** es temporal, almacenamiento rápido físicamente adjunto al host.
  Los datos se pierden cuando la instancia se detiene o termina. Solo para espacio de trabajo.
- **EBS** (Elastic Block Store) es almacenamiento en bloque persistente para una única instancia EC2.
  Sobrevive a las paradas de la instancia. Puede ser objeto de instantáneas para respaldo. Elige el
  tipo de volumen correcto (gp3 para uso general, io2 para requisitos de IOPS altas).
- **EFS** (Elastic File System) es un sistema de archivos de red compartido que múltiples instancias
  pueden montar simultáneamente. Úsalo cuando múltiples servidores necesiten acceso a los mismos archivos.
- Haz corresponder el tipo de almacenamiento con el requisito: base de datos → EBS; archivos compartidos → EFS;
  objetos/respaldos → S3; archivos → S3 Glacier.

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

## Ejercicios

**Ejercicio 1 — Recordar**

Con tus propias palabras: ¿cuál es la diferencia entre EBS y EFS? ¿Cuándo elegirías
uno frente al otro?

*(Pista: Piensa en si una instancia o múltiples instancias necesitan acceder al
almacenamiento al mismo tiempo.)*

**Ejercicio 2 — Práctica de Examen**

*Escenario*: Una empresa ejecuta una aplicación web en cuatro instancias EC2 detrás de un balanceador de carga. Los usuarios pueden subir fotos de perfil. Las cuatro instancias deben poder servir
la foto de cualquier usuario inmediatamente después de que se suba, independientemente de qué instancia manejó
la subida. El equipo necesita almacenamiento de archivos persistente y compartido.

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

**¿Por qué no C?** EFS es la respuesta correcta si la aplicación necesita semántica del sistema de archivos
(p. ej., un CMS que modifica archivos en su lugar). Para fotos subidas por usuarios servidas a través de la
web, S3 es más sencillo, más barato y más apropiado.

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
volumen EBS con instantáneas automatizadas. Las fotos de menú se trasladaron a S3. La instancia EC2 finalmente
tuvo espacio para respirar.

Leo ejecutó una prueba de carga. El sitio manejó doscientos usuarios simultáneos sin pestañear.

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
