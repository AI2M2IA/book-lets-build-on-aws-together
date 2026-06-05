# Capítulo 5: El Archivador que Vive en la Nube

Leo se dio cuenta de que Nimbus estaba almacenando las fotos de menú subidas directamente en la instancia EC2.
Cada foto que suben los clientes — la arepa crujiente, el salmón a la parrilla, el tazón de ensalada perfectamente presentado —
estaba sentada en una única máquina virtual.

¿Y si esa máquina fuera reiniciada, redimensionada o reemplazada?

Desaparecida.

«¿Cuántas fotos han subido los clientes hasta ahora?» preguntó Maya.

Leo abrió la consola. «Unas ochocientas.»

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

Hay un modelo mejor. AWS lo construyó en 2006, y sigue siendo uno de los servicios cloud
más utilizados del mundo.

**Amazon S3: El Disco Duro que Vive en Línea**

**Amazon S3** — Simple Storage Service (Servicio de Almacenamiento Simple) — es el servicio de almacenamiento de objetos de AWS.

Piensa en él como un disco duro que vive en internet. Un disco duro infinito.
Uno que se respalda automáticamente en múltiples Zonas de Disponibilidad para que si se pierde
un único centro de datos, no pierdas tus archivos.

El concepto clave en S3 es el **objeto**.

Un objeto es cualquier archivo: una foto, un vídeo, un PDF, un CSV, un respaldo, un archivo de registro. S3
no se preocupa por el tipo o la estructura. Almacena bytes y los devuelve cuando
los pides.

Los objetos viven dentro de **buckets** (cubos). Un bucket es como una carpeta de nivel superior — un contenedor
con nombre dentro de S3 que contiene tus objetos. Cada bucket tiene un nombre único a nivel global
(no puede haber dos buckets con el mismo nombre en todas las cuentas de AWS) y existe en una Región
específica.

**Cómo Funciona S3**

El modelo es sencillo, y esa sencillez es el punto.

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

**Por Qué S3 Es Diferente de un Disco Duro Normal**

Tres cosas hacen que S3 sea fundamentalmente diferente del almacenamiento de archivos en una instancia EC2:

**Durabilidad.** AWS diseña S3 para una durabilidad del 99,999999999% (once nueves). Eso significa
que si almacenas diez millones de objetos, podrías esperar perder un objeto cada diez
mil años debido a un fallo de hardware. Logran esto almacenando múltiples copias
de cada objeto en al menos tres Zonas de Disponibilidad automáticamente.

**Disponibilidad.** S3 está diseñado para ser accesible incluso cuando fallan componentes individuales.
No te estás conectando a un servidor — te estás conectando a un sistema distribuido
que enruta alrededor de los fallos.

**Escala.** S3 contiene una cantidad esencialmente ilimitada de datos. Un único bucket puede contener
billones de objetos. Amazon en sí usa S3 para almacenar datos a una escala difícil de
comprender.

**Versionado: El Botón de Deshacer**

Aquí hay algo que Maya encontró cuando exploraba la consola de S3.

S3 admite el **versionado**. Cuando habilitas el versionado en un bucket, S3 guarda cada
versión de cada objeto — incluidas las versiones anteriores y las versiones eliminadas.

Este es el botón de deshacer para tus archivos.

¿Subiste una nueva foto de menú que sobrescribió accidentalmente la antigua? La versión antigua sigue
ahí. ¿Eliminaste un archivo por error? Es recuperable. ¿Te infectaron con ransomware que
sobrescribió todos tus archivos con basura cifrada? Con el versionado, restauras desde
antes del ataque.

«¿Cuánto cuesta mantener todas esas versiones?» preguntó Tom.

Pagas por el almacenamiento de cada versión. Si tienes muchas versiones de archivos grandes, se
acumula. AWS tiene **políticas de ciclo de vida** que eliminan automáticamente las versiones antiguas después de
un cierto tiempo — las cubrimos en el Capítulo 23 cuando profundizamos en la optimización de costes.

**Control de Acceso: Público vs Privado**

De forma predeterminada, todo en S3 es privado. Solo tu cuenta de AWS puede acceder a él.

Puedes hacer objetos individuales públicos — lo que es cómo servirías imágenes de menú a
los visitantes del sitio web. O puedes mantener todo privado y generar **URLs pre-firmadas**:
enlaces con tiempo limitado que permiten a alguien descargar un objeto específico sin necesitar credenciales de AWS.
Perfecto para permitir que un cliente descargue su factura durante 24 horas.

Priya tenía opiniones muy fuertes sobre esto.

«Nunca hagas un bucket completamente público a menos que hayas decidido conscientemente hacer que cada
objeto en él sea accesible para toda internet», dijo. «El error de seguridad más común de S3
es exponer accidentalmente un bucket que contiene datos sensibles.»

AWS ahora tiene una configuración «Bloquear Acceso Público» que puedes aplicar a nivel de cuenta,
forzando que todos los buckets sean privados a menos que lo anules explícitamente por bucket.

Actívala. Siempre.

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

## Fortalezas y Limitaciones

**Por qué S3 es excelente**:

- Durabilidad de once nueves. Tus datos están más seguros en S3 que en casi cualquier otro sistema.
- Escala ilimitada. Nunca necesitas aprovisionar almacenamiento — simplemente crece.
- Extremadamente barato por lo que proporciona (fracciones de céntimo por GB por mes).
- Integración nativa con casi todos los demás servicios de AWS.
- Admite el alojamiento de sitios web estáticos — puedes servir un sitio web estático completo
  directamente desde S3, sin necesitar servidor.

**Donde S3 no es la elección correcta**:

- S3 no es un sistema de archivos. Si tu aplicación necesita montar una unidad y usarla como
  un disco local (leyendo, escribiendo, modificando archivos en su lugar), S3 es la herramienta equivocada.
  Usa EFS (Elastic File System, Capítulo 6) o EBS en su lugar.
- S3 tiene una latencia notablemente mayor que un disco local. Para bases de datos o
  aplicaciones que necesitan E/S rápida y de acceso aleatorio, el almacenamiento en bloque (EBS, Capítulo 6)
  es apropiado.
- Las transferencias de datos grandes hacia S3 son gratuitas. Las transferencias de datos grandes *fuera* cuestan dinero.
  Esta es una sorpresa de facturación común — lo abordamos en el Capítulo 30.

## Resumen

- **Amazon S3** es almacenamiento de objetos — un lugar para almacenar archivos (llamados objetos) en
  contenedores con nombre (llamados buckets).
- S3 está diseñado para una durabilidad de once nueves almacenando automáticamente copias de
  cada objeto en al menos tres Zonas de Disponibilidad.
- Los archivos almacenados en instancias EC2 están vinculados al ciclo de vida de esa instancia. Los archivos importantes
  pertenecen a S3, no al servidor.
- El **versionado** preserva las versiones anteriores de los objetos — tu botón de deshacer.
- De forma predeterminada, S3 es privado. Habilita «Bloquear Acceso Público» a nivel de cuenta.
- S3 tiene múltiples **clases de almacenamiento** para diferentes patrones de acceso y costes.
  Las clases de acceso poco frecuente son mucho más baratas pero cobran tarifas de recuperación.

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
- **S3 Standard-IA** tiene una duración mínima de almacenamiento de 30 días. No la uses
  para datos que eliminarás rápidamente. El examen evalúa si conoces las concesiones
  entre clases de almacenamiento.
- **Árbol de decisión de clase de almacenamiento**: *acceso frecuente* → S3 Standard; *acceso poco frecuente pero necesita recuperación rápida* → S3 Standard-IA; *archivo de acceso ocasional* → S3 Glacier Instant Retrieval; *archivo de acceso poco frecuente* → S3 Glacier Flexible Retrieval; *archivo de cumplimiento, acceso casi nunca* → S3 Glacier Deep Archive. Cuando un escenario menciona «optimización de costes» y «acceso poco frecuente», Standard-IA es casi siempre la respuesta. Cuando menciona «cumplimiento» o «retención de siete años», piensa en Glacier Deep Archive.

## Ejercicios

**Ejercicio 1 — Recordar**

Con tus propias palabras: ¿qué es un objeto de S3? ¿Qué es un bucket de S3? ¿Por qué es mejor almacenar archivos
en S3 que en el disco local de una instancia EC2?

*(Pista: Piensa en qué pasa con los archivos en una instancia EC2 si la instancia es
terminada. ¿Qué hace S3 de manera diferente?)*

**Ejercicio 2 — Práctica de Examen**

*Escenario*: Una empresa de medios produce vídeos documentales. Necesitan almacenar el metraje original
4K (al que se accede con frecuencia durante la producción), los cortes finales editados (a los que se accede mensualmente
para distribución) y los másters de archivo (conservados indefinidamente pero a los que se accede como máximo una vez
al año con fines de cumplimiento). Quieren minimizar los costes de almacenamiento mientras satisfacen
los requisitos de acceso de cada nivel.

¿Qué estrategia de almacenamiento satisface MEJOR sus necesidades?

A) Almacenar todo el contenido en S3 Standard por consistencia de rendimiento y simplicidad  
B) Almacenar el metraje original en S3 Standard, los cortes finales en S3 Standard-IA y los archivos
   en S3 Glacier Deep Archive  
C) Almacenar todo el contenido en el almacenamiento de instancia EC2 para el acceso más rápido  
D) Almacenar todo el contenido en S3 Glacier Deep Archive para minimizar costes

**Pista 1**: Diferentes archivos tienen diferentes patrones de acceso. S3 ofrece diferentes clases de almacenamiento
para diferentes frecuencias de acceso. ¿Qué clase corresponde a «acceso frecuente»?

**Pista 2**: Los archivos a los que se accede «como máximo una vez al año» no necesitan recuperación inmediata.
¿Qué clase de almacenamiento está diseñada para el archivado a largo plazo con el coste mínimo?

**Pista 3**: Haz corresponder la frecuencia de acceso de cada nivel con la clase de almacenamiento apropiada.
Acceso frecuente = Standard. Mensual = Standard-IA. Una vez al año = Glacier Deep Archive.

**Respuesta**: B

**Explicación**: Esta estrategia hace corresponder correctamente cada nivel de datos con la clase de almacenamiento
de S3 apropiada. El metraje original de acceso frecuente permanece en Standard para
acceso inmediato sin tarifas de recuperación. Los cortes finales de acceso mensual van a Standard-IA
(menor coste de almacenamiento, tarifa de recuperación asequible). Los archivos a los que se accede una vez al año van a
Glacier Deep Archive para el menor coste de almacenamiento posible.

**¿Por qué no A?** Almacenar todo en Standard es sencillo pero caro. Estás pagando
precios premium por contenido archivado al que raramente accedes.

**¿Por qué no C?** El almacenamiento de instancias EC2 es efímero y no apropiado para el almacenamiento multimedia a largo plazo. Si la instancia se termina, se pierde todo el contenido.

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
