# Capítulo 28: La Sorpresa de la Factura de Almacenamiento

La hoja de cálculo ya tenía dieciséis pestañas. Tom la mantenía abierta en una segunda ventana, de la forma en que algunas personas mantienen una lista de la compra: siempre visible, siempre acumulándose. Añadió una nueva fila para EC2 (hecho, Savings Plan comprometido) y movió el cursor a la siguiente línea.

Almacenamiento.

**Recapitulación: EC2 Resuelto, Falta una Partida**

El trabajo de precios de cómputo del capítulo 27 había fijado la estrategia de EC2: un Compute Savings Plan de 0,45 USD/hora a un período de tres años, más Spot para el lote nocturno, un ahorro estimado de 42.500 USD a lo largo del período. Ese trabajo estaba hecho, y bien hecho. Pero era una línea de la factura. Tom había aprendido, de seis meses de análisis de costes con Athena, que la factura tenía muchas líneas, y que cada una merecía el mismo escrutinio. S3 era el siguiente: 198 USD/mes, ya mejorado desde los 847 USD tras los cambios en las políticas de ciclo de vida del capítulo 23. El número que le llamó la atención, sin embargo, estaba más abajo en la página. EBS: 440 USD/mes.

"Eso parece alto," dijo.

Leo abrió la lista de volúmenes EBS. Había 47 volúmenes EBS adjuntos a instancias. Y luego había otros 23 volúmenes no adjuntos a ninguna instancia.

"Estos 23 volúmenes," dijo Tom. "¿Qué son?"

**La Auditoría de Volúmenes Huérfanos**

Leo empezó a revisarlos uno por uno. No fue un proceso rápido: los volúmenes no estaban etiquetados de forma uniforme, las etiquetas eran inconsistentes, y algunos habían sido creados hacía tanto tiempo que nadie recordaba el contexto. Tom acercó una silla y observó.

Volumen ebs-021a4c. Creado hace 16 meses. Etiqueta: "debug-prod-db-snapshot-restore." Tamaño: 200GB. Última conexión: nunca, o el historial de conexión se había purgado.

"Ese lo recuerdo," dijo Leo. "Tuvimos un problema con una consulta de base de datos y restauré una instantánea para comprobar los datos. La comprobé, no encontré el problema ahí, y olvidé eliminar el volumen."

Volumen ebs-07f38b. Creado hace 11 meses. Etiqueta: "load-test-temp." Tamaño: 400GB.

Leo se quedó callado un momento. "Creo que esa fue la prueba de carga que hicimos antes de la presentación de la ronda semilla. Aprovisionamos instancias extra con almacenamiento extra para simular la carga máxima y luego... no creo que eliminara ninguna de ellas después."

"Ya lo había desplegado... ah," dijo. "La prueba de carga era temporal. Los volúmenes no."

Volúmenes ebs-0ab12c a ebs-0ab134. Ocho volúmenes consecutivos, creados hace 9 meses. Etiqueta: "k8s-experiment." Tamaño: 100GB cada uno, 800GB en total.

"Esa fue la evaluación de Kubernetes," dijo Priya, mirando por encima del hombro de Leo. "Pasamos tres semanas evaluando si migrar a ECS o EKS. EKS quedó en segundo lugar. Desmontamos el clúster del experimento, pero al parecer dejamos los volúmenes persistentes."

Tom lo iba sumando en una pestaña aparte. Volumen a volumen, los números se acumulaban:

- Volúmenes de restauración para depuración: 4 volúmenes × 200GB = 800GB
- Volúmenes de prueba de carga: seis volúmenes entre 200 y 400GB, aproximadamente 1.200GB en total
- Volúmenes del experimento de Kubernetes: 8 volúmenes × 100GB = 800GB
- Varios sin etiquetar: 5 volúmenes × tamaños variados = ~700GB

Total: aproximadamente 3.500GB en 23 volúmenes no adjuntos.

"¿Cuánto cuesta eso por mes?" preguntó Tom. La respuesta: gp3 a 0,08 USD/GB/mes. 3.500GB × 0,08 USD = 280 USD/mes.

Comprobó la fecha de creación más antigua. Dieciséis meses. Sacó la calculadora.

"Llevamos pagando algunos de estos durante dieciséis meses," dijo. "Algunos durante nueve. La media probablemente sea de diez meses para todos." 23 volúmenes, una media de 12 USD/mes cada uno, una media de 10 meses. Eso eran aproximadamente 2.760 USD. Añade los volúmenes más grandes y las cuentas daban aproximadamente 3.200 USD de desperdicio total.

"Tres mil doscientos dólares," dijo Tom. "De volúmenes que nadie estaba usando."

"Y nadie se dio cuenta porque el cargo está repartido entre docenas de partidas," dijo Leo. "No es un cargo de 3.200 USD. Son 23 cargos de 12, 50 u 80 USD al mes, cada uno individualmente lo bastante pequeño como para no disparar ninguna alarma."

Tom eliminó los 23 volúmenes no adjuntos. Confirmó con Leo y Priya que ninguno tenía datos que necesitaran: el volumen de depuración eran datos obsoletos de una base de datos que ya había sido migrada, los datos de la prueba de carga eran irrelevantes, los volúmenes del experimento de Kubernetes estaban vacíos. La eliminación tomó quince minutos. El mes siguiente, la factura de EBS bajó de 440 USD a 160 USD.

"Espera, ¿pero *por qué* lo haríamos así?" preguntó Maya, cuando Tom le explicó el hallazgo. "¿Por qué eliminar el volumen no es lo predeterminado cuando terminas una instancia?"

"Depende del volumen," dijo Tom. "El volumen **raíz** sí se elimina de forma predeterminada: `DeleteOnTermination` es verdadero para él. Pero cualquier volumen de datos **adicional** que adjuntes se conserva de forma predeterminada. La suposición es que podrías necesitar los datos que tenían. Estos 23 huérfanos eran todos volúmenes de datos: adjuntados para una sesión de depuración o una prueba de carga, y luego abandonados cuando la instancia fue terminada."

"Así que el comportamiento predeterminado te protege de la pérdida accidental de datos en los volúmenes de datos."

"Y te cuesta dinero si no prestas atención. De ahora en adelante: cualquier volumen de datos adicional se elimina explícitamente cuando la instancia termina, o se le pone `DeleteOnTermination` en el momento de adjuntarlo, a menos que alguien presente un caso documentado de por qué necesita conservarlo."

"¿Hemos pensado en qué pasa si alguien olvida documentar ese caso?" preguntó Priya. "Podríamos eliminar algo importante."

"Esa es la compensación," dijo Tom. "Ahora mismo la compensación va en la otra dirección: estamos asumiendo que todo debe conservarse y pagando por ello cuando no es así. La disciplina de documentar 'conservar este volumen' es menos arriesgada que el comportamiento predeterminado actual de 'conservar todo en silencio'."

**La Auditoría de Costes de Almacenamiento**

El descubrimiento de EBS de Tom era un síntoma de un patrón más amplio: los costes de almacenamiento se acumulan de forma invisible. A diferencia del cómputo (te das cuenta cuando hay 47 servidores en ejecución), el almacenamiento se suma silenciosamente.

Piensa en ello como el alquiler de una unidad de almacenamiento. Alquilar una unidad es obvio en el extracto de la tarjeta de crédito. Pero si alquilas una segunda unidad para un proyecto, luego una tercera para unos muebles viejos, y nunca vuelves a comprobar qué hay dentro, los cargos siguen apareciendo cada mes, en silencio, mucho después de que hayas olvidado qué estás almacenando. El almacenamiento en la nube funciona igual: los bytes están ahí, la factura llega, y nadie lo cuestiona hasta que alguien finalmente abre la puerta y encuentra que está llena de cosas que nadie necesita.

Una auditoría exhaustiva de costes de almacenamiento examina:

**S3**:

- ¿Hay políticas de ciclo de vida en vigor para todos los buckets?
- ¿Hay instantáneas antiguas (RDS, EBS) en S3?
- ¿Es apropiado Intelligent-Tiering para algún bucket con patrones de acceso inciertos?
- ¿Hay objetos versionados que crean múltiples copias a las que nunca se accede?
- ¿Hay cargas multiparte incompletas acumulándose en silencio?

**EBS**:

- ¿Hay volúmenes no adjuntos (ninguna instancia EC2 en ejecución los usa)?
- ¿Están los volúmenes gp3 configurados correctamente? (Los volúmenes gp3 predeterminados pueden tener rendimiento/IOPS aprovisionados en exceso que no son necesarios)
- ¿Se conservan instantáneas más antiguas de lo necesario?

**RDS**:

- ¿Están los períodos de retención de respaldo automatizado configurados adecuadamente? (Más largo = mayor coste de almacenamiento)
- ¿Hay instantáneas manuales de instancias antiguas todavía almacenadas?
- ¿Hay réplicas de lectura de migraciones de bases de datos todavía en ejecución?

**EFS**:

- ¿Está el volumen EFS en la clase de almacenamiento correcta? (Estándar vs Acceso Infrecuente)

**Versionado de S3: El Coste Oculto**

En el capítulo 5, mencionamos que el versionado de S3 conserva todas las versiones anteriores de un objeto. Esto es excelente para la seguridad. Es terrible para los costes si no tienes también reglas de ciclo de vida para las versiones.

Cuando el versionado está habilitado en un bucket, cada vez que sobrescribes un objeto, se conserva la versión antigua. Con el tiempo:

- Día 1: Imagen cargada (v1)
- Día 30: Imagen actualizada (v1 ahora es una versión "no actual", v2 es la actual)
- Día 60: Imagen actualizada de nuevo (v1 y v2 no son actuales, v3 es la actual)
- Día 365: v1, v2... v12 están todas almacenadas. Estás pagando por 12 copias de una imagen.

Quizás te preguntes por qué el versionado no limpia automáticamente las versiones antiguas. La respuesta es intencional: AWS no quiere eliminar automáticamente tus datos. Pero la consecuencia es que cada versión se acumula hasta que le dices a S3 explícitamente cuánto tiempo conservarlas. La solución: reglas de ciclo de vida para las versiones no actuales.

```
Caducar versiones no actuales después de 30 días
Eliminar cargas multiparte fallidas después de 7 días
```

Tom aplicó estas reglas a todos los buckets versionados. El mes siguiente, el almacenamiento de S3 disminuyó un 18%.

**Cargas Multiparte Incompletas: La Acumulación Invisible**

Hay un coste de S3 más sutil que la mayoría de los ingenieros pasan por alto por completo: las cargas multiparte incompletas.

Cuando S3 carga un archivo grande, lo divide en partes y carga cada una por separado. Este es el mecanismo de carga multiparte: más fiable que un único PUT grande para archivos de más de unos pocos cientos de megabytes. Pero si una carga comienza y luego falla a mitad de camino —una interrupción de red, un fallo del cliente, un error de la aplicación—, las partes ya cargadas permanecen en S3. No son visibles como objetos en tu bucket. No aparecen en ninguna lista. Pero están almacenadas, y se te cobra por ellas a las tarifas estándar de S3.

Tom encontró esto habilitando el panel de S3 Storage Lens en la consola de S3 y ordenando por "cargas multiparte incompletas." Nimbus tenía 340GB de datos de cargas multiparte incompletas almacenados en silencio en buckets de cuatro cuentas de AWS, algunos de más de un año de antigüedad.

"¿Cuánto cuesta eso por mes?" preguntó Tom. 0,023 USD/GB/mes × 340GB = 7,82 USD/mes. Pequeño individualmente. Pero llevaba un año acumulándose sin que nadie se diera cuenta.

La solución: añadir una regla de ciclo de vida a cada bucket.

```
AbortIncompleteMultipartUpload:
  DaysAfterInitiation: 7
```

Después de siete días, cualquier carga multiparte incompleta se limpia automáticamente. Esto se ejecuta indefinidamente sin ninguna atención continua.

"Si todo eso hubiera estado ahí un año entero, digamos unos 94 USD que hemos gastado en cargas fallidas," dijo Leo.

"En cargas fallidas," confirmó Tom. "Ni siquiera en almacenamiento exitoso. Esta es la definición de desperdicio de infraestructura."

**EBS: Dimensionamiento Correcto y la Actualización a gp3**

Los precios de los volúmenes EBS tienen dos componentes:

1. Almacenamiento (por GB al mes)
2. IOPS y rendimiento aprovisionados (si estás en io1/io2 o pagando por rendimiento gp3 adicional)

**La oportunidad gp3**: En el capítulo 6, señalamos que gp3 es el predeterminado actual y es más barato que gp2. Si Nimbus tenía volúmenes creados antes de que gp3 estuviera disponible (se lanzó en diciembre de 2020), podrían seguir siendo gp2.

La migración es sencilla: modifica el tipo de volumen de gp2 a gp3 en la consola de AWS o vía CLI. No se requiere tiempo de inactividad. El volumen permanece disponible durante la conversión. Las características de rendimiento son iguales o mejores: gp3 proporciona 3.000 IOPS y 125 MB/s de rendimiento base, en comparación con el modelo de ráfaga de gp2 que podía ser inconsistente para volúmenes más pequeños.

"Espera, ¿pero *por qué* lo haríamos así?" preguntó Maya. "Si gp3 es más barato y al menos tan bueno como gp2, ¿por qué AWS no migró a todo el mundo automáticamente?"

"Porque AWS no hace cambios unilaterales en la infraestructura del cliente," dijo Tom. "Ni siquiera los beneficiosos. La modificación podría teóricamente tener efectos secundarios para alguna carga de trabajo. El cliente tiene que iniciarla. Por eso miles de equipos siguen pagando precios de gp2 años después del lanzamiento de gp3, simplemente porque nadie se puso a buscar."

Tom decidió hacer la migración a gp3 un sábado por la mañana: la misma disciplina matutina que había aplicado al análisis de precios de EC2. Tiempo tranquilo. Sin reuniones de seguimiento. Solo la consola de AWS y un plan.

Había identificado 8 volúmenes en el entorno de producción que todavía eran gp2: los cuatro volúmenes raíz de los servidores de API, dos volúmenes adjuntos a procesadores en segundo plano, y dos volúmenes de datos heredados que habían sido creados antes de que la migración a gp3 se convirtiera en práctica estándar para los nuevos despliegues. Juntos totalizaban 960 GB.

El proceso de migración era una sola llamada a la API por volumen:

```bash
aws ec2 modify-volume \
  --volume-id vol-0a1b2c3d4e5f67890 \
  --volume-type gp3 \
  --iops 3000 \
  --throughput 125
```

Los parámetros `--iops 3000` y `--throughput 125` coincidían con los valores base predeterminados de gp3. Para gp2, Tom había comprobado primero las métricas de CloudWatch: las IOPS promedio en cada volumen estaban entre 200 y 800. Ninguno necesitaba más que la base de 3.000 IOPS que gp3 proporcionaba gratis. El rendimiento estaba igualmente holgado, muy por debajo del predeterminado de 125 MB/s.

"¿Y si un volumen necesita más IOPS después de cambiar?" preguntó Maya, cuando Tom explicó el plan de migración.

"Podemos aumentar las IOPS aprovisionadas en un volumen gp3 en cualquier momento," dijo Tom. "La migración no bloquea nada. Si vamos a gp3 con 3.000 IOPS y descubrimos que es insuficiente, modificamos el volumen de nuevo para añadir más. La modificación es en vivo: sin tiempo de inactividad, sin desmontar."

"¿Y gp2 no se puede modificar en el sitio?"

"gp2 se puede modificar a gp3 en el sitio. Lo que no puedes hacer es volver de gp3 a gp2, al menos no fácilmente, y no hay razón para ello."

La migración real tomó 73 minutos desde el primer comando hasta la finalización en los 8 volúmenes. AWS modificó cada volumen mientras estaba montado y en uso. Los servidores de API siguieron recibiendo tráfico durante todo el proceso. CloudWatch no mostró picos en la latencia de E/S durante la conversión: la transición fue completamente transparente para la aplicación en ejecución.

"Eso es lo que 'no se requiere tiempo de inactividad' significa en realidad," dijo Leo, mirando las métricas de antes y después que Tom había capturado. "Asumí que 'sin tiempo de inactividad' significaba 'reinicio breve'. Significa que literalmente nada cambia desde la perspectiva de la aplicación."

El ahorro: gp2 costaba 0,10 USD/GB/mes; gp3 costaba 0,08 USD/GB/mes. En 960 GB: 96 USD/mes frente a 76,80 USD/mes. Ahorro mensual: 19,20 USD. No transformador por sí solo, pero la disciplina que representaba sí lo era. Cualquier volumen nuevo creado a partir de ese momento usaba gp3 de forma predeterminada. La regla organizativa que Tom escribió esa mañana: nada de volúmenes gp2. Cualquier ingeniero que cree un volumen EBS debe usar gp3 a menos que haya una razón específica y documentada para lo contrario.

**IOPS y rendimiento**: Los volúmenes gp3 vienen con 3.000 IOPS y 125 MB/s de rendimiento de forma predeterminada, sin cargo adicional. Puedes aprovisionar más si tu carga de trabajo lo necesita. Revisa si el rendimiento aprovisionado está siendo realmente utilizado.

En la misma auditoría, Tom encontró dos volúmenes con 10.000 IOPS aprovisionados: una configuración heredada de antes de que se uniera, dimensionada para una base de datos que ya había migrado a Aurora. Comprobó las métricas de CloudWatch: las IOPS promedio reales eran 1.200. Redujo las IOPS aprovisionadas a 4.000 (un margen de seguridad sobre el pico real).

Ahorro mensual: 68 USD en costes de IOPS aprovisionadas que habían estado pagando por un margen de rendimiento que nadie usaba.

**Ciclo de vida de instantáneas**: Las instantáneas de EBS son incrementales (cada instantánea solo almacena los cambios desde la anterior), pero se acumulan. Todavía existían instantáneas antiguas de los primeros días de Nimbus. Tom conservó 30 días de instantáneas diarias y eliminó el resto.

**EFS: Clases de Almacenamiento y la Decisión de Intelligent-Tiering**

Amazon EFS tiene sus propias clases de almacenamiento:

- **EFS Standard**: Para archivos a los que se accede frecuentemente. Mayor coste.
- **EFS Infrequent Access (IA)**: Para archivos a los que no se ha accedido en 30 días. Un 92% más barato que Standard.
- **EFS Archive**: Para archivos a los que no se ha accedido en 90 días. Incluso más barato que IA.

**EFS Intelligent-Tiering**: Mueve automáticamente los archivos entre clases de almacenamiento basándose en los patrones de acceso.

Tom habilitó Intelligent-Tiering en el volumen EFS. Seis semanas después, el 68% de los archivos se había movido a Acceso Infrecuente. El coste mensual de EFS bajó de 89 USD a 31 USD.

Pero la elección entre Intelligent-Tiering y una regla de ciclo de vida manual no era trivial. Tom lo había considerado.

"Espera, ¿pero *por qué* haríamos Intelligent-Tiering en lugar de simplemente establecer una regla de ciclo de vida manual?" preguntó Maya. "Si sabemos que a los archivos de más de 30 días no se accede, ¿por qué no establecer la regla y terminar?"

"Intelligent-Tiering gestiona los archivos que vuelven," dijo Tom. "Si establezco una regla de ciclo de vida para mover archivos a IA después de 30 días, y luego alguien accede a un archivo que ha estado en IA durante seis meses, se queda en IA. Con Intelligent-Tiering, si el acceso se reanuda, el archivo se mueve automáticamente de vuelta a Standard. Es bidireccional."

"¿Cuándo preferirías entonces la regla de ciclo de vida?"

"Cuando tienes la certeza de que el patrón de acceso es unidireccional. Logs de archivo: se escriben, envejecen, se acceden una vez para una auditoría de cumplimiento y luego nunca más. Para ese patrón, una regla de ciclo de vida que mueva a Archive después de 90 días es más barata que Intelligent-Tiering porque no pagas la sobrecarga de monitorización."

"¿Hay una tarifa de monitorización?"

"Para S3 Intelligent-Tiering, sí, por eso cubrimos la economía de los objetos pequeños en el capítulo del ciclo de vida de S3. Para EFS, la decisión es sobre todo cuestión del patrón de acceso: si los archivos pueden volver a ser populares, Intelligent-Tiering es más seguro. Si solo envejecen en una dirección, una regla de ciclo de vida a Archive es más barata y más simple."

**Etiquetas de Asignación de Costes de S3: Encontrando Quién Gasta Qué**

A medida que Nimbus creció, múltiples equipos almacenaban datos en S3. El equipo de analítica tenía sus propios buckets. El equipo de ingeniería tenía sus buckets. El equipo de datos de restaurantes tenía sus buckets.

La factura solo mostraba "S3: 198 USD." No había desglose por equipo.

Las **etiquetas de asignación de costes** te permiten etiquetar recursos de AWS con metadatos de negocio (equipo, proyecto, entorno) y luego ver los costes desglosados por esas etiquetas en AWS Cost Explorer.

Tom añadió etiquetas a todos los buckets de S3:
```
Team: analytics
Environment: production
Project: nimbus-core
```

Después de un ciclo de facturación con etiquetado, podía ver: "El lago de datos del equipo de analítica cuesta 74 USD/mes. Los respaldos de ingeniería cuestan 43 USD/mes. Los datos de restaurantes cuestan 81 USD/mes."

Ahora podía tener conversaciones de presupuesto con cada equipo en lugar de mirar solo un número agregado.

**AWS Cost Explorer y AWS Budgets**

**AWS Cost Explorer**: Visualiza los costes históricos y proyectados por servicio, región, etiqueta y tipo de uso. Esencial para entender adónde va el dinero.

**AWS Budgets**: Establece alertas cuando los costes superan (o se prevé que superen) un umbral. Puedes presupuestar por servicio, región, etiqueta o cuenta.

Tom configuró tres presupuestos:

1. Factura mensual total: Alerta al 90% del importe presupuestado
2. EC2 bajo demanda: Alerta si el gasto bajo demanda supera los 500 USD/mes (señal de una brecha en el Savings Plan)
3. Transferencia de datos de salida: Alerta a 200 USD/mes (los costes de transferencia de datos pueden dispararse inesperadamente)

Los Budgets enviaban alertas a un canal de Slack. El equipo veía cuándo se acercaban a los límites, en lugar de descubrirlo en la factura mensual.

**El Recibo con Cada Línea: Cost and Usage Reports**

Cost Explorer respondía la mayoría de las preguntas de Tom. Luego se topó con una que no podía: "exactamente qué buckets de S3, hora por hora, impulsaron el pico del martes pasado, y bajo qué etiquetas."

Para preguntas de grado forense, AWS proporciona el **Cost and Usage Report (CUR)** —ahora entregado a través de **Data Exports**—, los datos de facturación más detallados que AWS produce: cada partida, **por recurso, por hora**, con etiquetas, entregada a un bucket de S3 de tu propiedad. No es un panel; es el libro mayor en bruto. El patrón estándar es consultarlo con Athena (llega en un formato columnar) o alimentarlo a QuickSight para paneles.

La división del trabajo en el examen: **Cost Explorer** = visualización interactiva y proyecciones en la consola. **Budgets** = alertas sobre umbrales. **CUR/Data Exports** = los datos más granulares, entregados a S3, para tu propio análisis. Cuando una pregunta dice "datos de coste a nivel de recurso, por hora, para análisis personalizado" → eso es el CUR, no Cost Explorer.

"¿Hemos pensado en qué pasa si simplemente nunca miramos esto?" preguntó Priya. "Hemos encontrado 6.700 USD en dos días. ¿Qué sigue escondido?"

"Auditorías regulares," continuó. "Revisiones mensuales de Cost Explorer. AWS Trusted Advisor señala automáticamente los volúmenes no adjuntos y los recursos inactivos. Automatiza la limpieza de los patrones de desperdicio conocidos: eliminar instantáneas más antiguas de N días, alertar sobre volúmenes EBS no adjuntos, caducar las versiones antiguas de S3."

**S3 Requester-Pays: Desplazando el Coste de Transferencia**

Durante la auditoría de almacenamiento, Tom encontró una situación que no había anticipado.

Los socios de restaurantes de Nimbus necesitaban descargar sus recursos de fotos de menú: las imágenes procesadas y redimensionadas que la plataforma de pedidos servía a los clientes. Para un restaurante que actualizaba su menú, esto significaba descargar entre 50 MB (una actualización pequeña) y 800 MB (una renovación estacional completa) de archivos de imagen. Actualmente, Nimbus estaba pagando el coste de transferencia de datos de salida en cada descarga: 0,09 USD/GB de S3 a la ubicación del socio.

Con 287 socios de restaurantes, con una media de una renovación de menú por mes y una descarga media de 200 MB, las cuentas eran: 287 × 0,2GB × 0,09 USD = 5,17 USD/mes. No significativo a la escala actual.

"¿Qué pasa con 2.000 restaurantes?" preguntó Tom.

"Las mismas cuentas," dijo Maya. "Unos 36 USD/mes."

"¿Y con 10.000 restaurantes, y socios descargando grandes paquetes de recursos estacionales, digamos 2 GB para actualizaciones de menú navideñas?"

Lo calculó. 10.000 × 2GB × 0,09 USD = 1.800 USD/mes en transferencia de datos, solo para que los socios descarguen recursos que necesitan.

"Ese es un número real," dijo Priya.

"¿Hemos pensado en qué pasa si esa factura aparece el mismo mes en que intentamos cerrar una ronda Serie B?" continuó Priya.

"S3 Requester-Pays," dijo Tom.

S3 tiene una función llamada Requester-Pays: cuando se habilita en un bucket, la entidad que hace la solicitud —no el propietario del bucket— paga los costes de transferencia de datos y de solicitud. El propietario del bucket sigue pagando por el almacenamiento. Pero cada descarga del bucket se factura a la cuenta de AWS del solicitante.

La compensación es el acceso. Requester-Pays requiere que los solicitantes sean clientes de AWS con una cuenta válida: el acceso no autenticado o anónimo a un bucket Requester-Pays devuelve un error. Para los socios de restaurantes de Nimbus, que eran negocios con niveles variables de sofisticación técnica, requerir que tuvieran una cuenta de AWS para descargar sus propios recursos de menú no era un modelo viable.

"No podemos hacer Requester-Pays para el acceso directo de los socios," dijo Maya. "La mayoría de nuestros socios no van a configurar una cuenta de AWS para descargar fotos."

"Correcto," dijo Tom. "Pero podemos usarlo para las integraciones B2B: las cadenas más grandes que tienen equipos técnicos y cuentas de AWS. No el pequeño restaurante de la esquina, sino la cadena de hamburguesas de 50 locales que tiene un equipo de ingeniería y se integra directamente con nuestra API. Para ese segmento, Requester-Pays tiene sentido."

"¿Y para el resto?"

"Les damos un portal de descarga que usa URLs prefirmadas de S3. La transferencia sigue pasando por AWS, el coste sigue siendo nuestro, pero también ya está factorizado en el precio para socios. La opción de Requester-Pays es algo que incorporaríamos en las negociaciones de contrato para socios más grandes, no algo que desplegamos hoy."

Tom lo añadió a la hoja de cálculo bajo "optimizaciones futuras": S3 Requester-Pays para socios empresariales con cuentas de AWS. A 2.000 restaurantes con un 20% de clientes empresariales, con descargas mensuales de 2 GB: 72 USD/mes potencialmente desplazados a los socios. Pequeño a esa escala, pero el mismo patrón se vuelve significativo a medida que crecen los paquetes de recursos. Revisar cuando el número de socios supere los 1.000 o cuando los socios empresariales empiecen a descargar paquetes estacionales más grandes.

"La lección es la de siempre," dijo Tom. "Saber en qué se convierte el coste a escala antes de estar a esa escala. El problema de 5 USD de hoy es el problema de 1.800 USD dentro de tres años. Diseñar para ello ahora no cuesta nada."

**Gobernanza: Eliminación Automática vs Solo Alerta**

La cuestión de la automatización fue la que generó más desacuerdo.

"¿Deberíamos eliminar automáticamente los volúmenes EBS no adjuntos después de 14 días?" preguntó Tom. "Las reglas de AWS Config pueden señalarlos. Lambda puede eliminarlos automáticamente."

"No," dijo Priya de inmediato.

"¿Por qué no?"

"Porque la eliminación automática significa que eventualmente eliminaremos algo que estaba no adjunto por una razón. Quizás alguien desconectó un volumen para moverlo a una instancia diferente, y lleva 12 días en espera mientras se revisa un cambio. La eliminación automática en el día 14 destruye esos datos."

"¿Entonces solo alerta?" dijo Tom. "Recibimos una notificación pero no eliminamos automáticamente."

"Alerta primero," dijo Priya. "Obliga a un humano a tomar la decisión. La alerta es: 'Este volumen ha estado no adjunto durante 14 días. Etiquétalo como `keep: true` si lo necesitas, o se señalará para eliminación en la próxima revisión.' La decisión humana queda entonces documentada por la presencia o ausencia de la etiqueta."

"Eso es más lento," dijo Leo.

"Es más lento y menos probable que destruya datos," dijo Priya. "Ya hemos perdido 3.200 USD por descuido. No hemos perdido ningún dato por automatización. Sé cuál preferiría mantener."

Tom aterrizó en un híbrido: alerta automática a los 7 días, requerir una etiqueta `keep: true` para suprimir alertas futuras, y ejecutar un informe semanal de todos los volúmenes sin etiquetar y no adjuntos para que el equipo lo revise junto. Sin eliminación automática.

**Variación: Cuando la Limpieza Cuesta Más de lo que Ahorra**

Si necesitas la seguridad de instantáneas extra, consérvalas, pero cada instantánea de más de 90 días sin acceso debería estar ganándose su lugar. La compensación es asimétrica: eliminar una instantánea que necesitabas cuesta un incidente; conservar una instantánea que no necesitabas cuesta solo una pequeña tarifa mensual. Para datos sensibles al cumplimiento, el coste de conservar instantáneas antiguas es real pero normalmente menor que el coste de no tenerlas cuando un auditor pregunta. Para instantáneas de desarrollo de una prueba que se ejecutó hace 14 meses, el cálculo va en la otra dirección.

Si habilitas EFS Intelligent-Tiering para archivos con patrones de acceso inciertos, la organización en niveles automática ahorra dinero y no requiere intervención continua. Si los archivos envejecen de forma predecible hacia el acceso de archivo, una regla de ciclo de vida directa es más simple. Mide antes de habilitar.

Conexión con SAA-C03: El examen evalúa si puedes elegir entre las clases de almacenamiento de S3 (Standard, IA, Glacier) dado un escenario de frecuencia de acceso. La misma lógica se aplica aquí: la clase correcta depende de con qué frecuencia se accede a los datos.

**El Coste de la Negligencia**

Tom creó una hoja de cálculo. Calculó cuánto había gastado Nimbus en:

- Volúmenes EBS no adjuntos (16 meses): 3.200 USD
- Instantáneas antiguas de S3 (descubiertas y eliminadas): 890 USD
- IOPS aprovisionados innecesarios: 816 USD
- Ahorro de la migración de gp2 a gp3 (proyectado, si se hubiera hecho antes): 346 USD en 18 meses
- Versiones de S3 no actuales acumulándose: 1.340 USD
- Cargas multiparte incompletas: 94 USD

Total de desperdicios identificados: aproximadamente 6.700 USD en 18 meses.

"Seis mil setecientos dólares," dijo Maya.

"Por negligencia," dijo Tom. "No por tomar decisiones arquitectónicas incorrectas. Por no limpiar."

"¿Cuál es la solución sistemática?"

"Y," añadió Tom, "hacer de la higiene de costes parte del proceso de despliegue. Cuando un ingeniero termina una instancia EC2, el volumen EBS se elimina automáticamente a menos que opten explícitamente por no hacerlo."

## Ventajas y Limitaciones

**Disciplina de optimización de costes**:

- Las revisiones regulares detectan el desperdicio acumulado antes de que sea significativo
- El etiquetado habilita la responsabilidad: los equipos ven sus propios costes
- Las alertas automatizadas evitan sorpresas en la facturación
- Las políticas de ciclo de vida y el dimensionamiento correcto suelen ser ahorros que se configuran una vez

**Dónde se complica**:

- Identificar el desperdicio en una cuenta grande con muchos equipos requiere herramientas centralizadas
- Parte del desperdicio es intencional (conservar instantáneas extra "por si acaso"): la compensación coste/riesgo es un juicio de valor
- La migración a gp3 requiere una validación cuidadosa (las IOPS y el rendimiento predeterminados pueden diferir del comportamiento de gp2 en algunos casos extremos)
- Las etiquetas de asignación de costes requieren disciplina en todos los equipos: el etiquetado inconsistente hace que los datos estén incompletos
- La automatización de eliminación automática es peligrosa para el almacenamiento: alertar y revisar es más seguro para volúmenes e instantáneas

## Resumen

La auditoría de almacenamiento había tomado dos días. El desperdicio que descubrió —6.700 USD a lo largo de 18 meses de acumulación invisible— fue menos un fallo de toma de decisiones que un fallo de atención. Nada había sido configurado mal a propósito. Las instantáneas, los volúmenes no adjuntos, el historial de versiones acumulándose, las cargas multiparte incompletas: cada uno tenía sentido en su momento y simplemente nunca se revisó. La lección no era sobre servicios específicos de AWS. Era sobre construir el hábito de mirar.

- **Los costes de almacenamiento se acumulan de forma invisible**: las auditorías regulares son esenciales.
- Los **volúmenes EBS no adjuntos** son una fuente común de desperdicio. Elimínalos (o automatiza la eliminación cuando las instancias terminen).
- **Dimensionamiento correcto de EBS**: Migra gp2 a gp3 (típicamente un 20% de ahorro). Elimina los IOPS aprovisionados en exceso.
- **Versionado de S3**: Habilita reglas de ciclo de vida para las versiones no actuales para evitar pagar por un historial de versiones ilimitado.
- **Cargas multiparte incompletas**: Añade una regla de ciclo de vida `AbortIncompleteMultipartUpload` a cada bucket. Esto a menudo se pasa por alto y se acumula en silencio.
- **EFS Intelligent-Tiering**: Mueve automáticamente los archivos a niveles de menor coste según la frecuencia de acceso. Para patrones de acceso predecibles, las reglas de ciclo de vida manuales pueden ser más baratas.
- **Gobernanza**: Alerta sobre volúmenes no adjuntos después de 7-14 días; requiere etiquetado explícito para suprimir. Evita la eliminación automática para recursos de almacenamiento.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas Optimizadas en Coste (Dominio 4, Tarea 4.1)*

- **Etiquetas de asignación de costes**: Habilita las etiquetas definidas por el usuario para la asignación de costes en la consola de facturación; luego etiqueta los recursos. Cost Explorer muestra desgloses por etiqueta. Escenario del examen: "identificar qué departamento genera más costes de S3" → etiquetas de asignación de costes.
- **AWS Trusted Advisor**: Identifica instancias EC2 infrautilizadas, volúmenes EBS no adjuntos, balanceadores de carga inactivos y otros desperdicios. Comprobaciones básicas gratuitas; comprobaciones completas requieren soporte Business/Enterprise.
- **Componentes de costes de EBS**: Almacenamiento (por GB), IOPS aprovisionados (si io1/io2 o gp3 adicional), rendimiento (si gp3 adicional). Conoce qué componentes se pueden dimensionar correctamente.
- **Costes de versionado de S3**: Las versiones no actuales se almacenan y cobran a la misma tarifa que las versiones actuales. Las reglas de ciclo de vida que caducan las versiones no actuales son fundamentales para el control de costes en los buckets versionados.
- **AWS Compute Optimizer**: Analiza la utilización de EC2 y recomienda tipos de instancias correctamente dimensionados. Señal del examen: "reducir los costes de EC2 seleccionando el tipo de instancia correcto" → Compute Optimizer.
- **AWS Cost Anomaly Detection**: Usa ML para detectar patrones de gasto inusuales. Señal del examen: "detectar automáticamente aumentos de costes inesperados" → Cost Anomaly Detection.
- **Conjunto de herramientas de costes**: gráficos/proyecciones interactivos → Cost Explorer. Alertas de umbral → Budgets. "Datos de facturación más granulares, a nivel de recurso/hora, entregados a S3 para análisis personalizado (Athena/QuickSight)" → **Cost and Usage Report (Data Exports)**.
- **Requester Pays**: "compartir un gran conjunto de datos de S3; los consumidores pagan sus propios costes de descarga" → S3 Requester Pays (el propietario sigue pagando solo el almacenamiento; los solicitantes deben autenticarse con una cuenta de AWS).

## Ejercicios

**Ejercicio 1 — Recordatorio**

Explica por qué los volúmenes EBS no adjuntos generan costes aunque ninguna instancia EC2 los esté usando. ¿Qué proceso deben seguir los ingenieros al terminar una instancia EC2 para evitar este desperdicio?

*(Pista: Los volúmenes EBS almacenan datos en disco físico, y ese disco cuesta dinero independientemente de si se está leyendo.)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: La factura de AWS de una empresa ha crecido de 5.000 a 9.000 USD/mes en seis meses, pero no han añadido nuevos servicios. El equipo de ingeniería sospecha que los costes de almacenamiento son el problema. ¿Qué combinación de herramientas de AWS identificaría y explicaría MEJOR el aumento de costes?

A) AWS CloudTrail para revisar las llamadas a la API e identificar quién creó nuevos recursos  
B) AWS Cost Explorer para el desglose de costes a nivel de servicio, y AWS Trusted Advisor para la detección de recursos inactivos y no adjuntos  
C) Amazon CloudWatch para monitorizar la utilización de recursos y crear alarmas de costes  
D) AWS Config para identificar todos los recursos y su estado de cumplimiento

**Pista 1**: "Identificar el aumento de costes" → visualizar el desglose de costes por servicio.

**Pista 2**: "Recursos inactivos y no adjuntos" → una herramienta específica los identifica de forma proactiva.

**Pista 3**: CloudTrail registra llamadas a la API; Cost Explorer muestra tendencias de costes. ¿Cuál es más útil para el análisis de costes?

**Respuesta**: B

**Explicación**: AWS Cost Explorer muestra las tendencias de costes desglosadas por servicio, región y tipo de uso, perfectas para identificar qué servicio impulsó el aumento. Las comprobaciones de optimización de costes de AWS Trusted Advisor identifican volúmenes EBS no adjuntos, instancias EC2 inactivas, balanceadores de carga infrautilizados y otras fuentes comunes de desperdicio.

**¿Por qué no A?** CloudTrail registra quién creó recursos y cuándo, pero no muestra directamente las tendencias de costes ni identifica el desperdicio.

**¿Por qué no C?** CloudWatch monitoriza el rendimiento de los recursos (CPU, memoria), útil para el dimensionamiento correcto, pero no para identificar el desperdicio de almacenamiento acumulado.

**¿Por qué no D?** AWS Config rastrea las configuraciones de recursos y el cumplimiento, pero no es una herramienta de análisis de costes.

*Dominio SAA-C03: Diseño de Arquitecturas Optimizadas en Coste — Tarea 4.1*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

La factura de S3 de Nimbus muestra 340 USD/mes para un bucket etiquetado como "backups." El bucket tiene el versionado habilitado y contiene:

- Instantáneas diarias de la base de datos (7 días son suficientes para su política)
- Respaldos completos semanales (conservados durante 3 meses)
- Archivos trimestrales (conservados durante 7 años por cumplimiento fiscal)

Diseña una política de ciclo de vida para este bucket que minimice el coste cumpliendo estos requisitos de retención. ¿Qué clase de almacenamiento debería usar cada tipo de dato? ¿Cómo gestionarías el versionado para evitar que las versiones antiguas se acumulen?

*(No hay una única respuesta correcta. El objetivo es practicar el diseño de políticas de ciclo de vida.)*

## Escena Poscréditos

Tom publicó los hallazgos de la auditoría de costes al equipo.

Desperdicio identificado: 6.700 USD en 18 meses.
Ahorro anual esperado de los cambios implementados: 6.200 USD.

Luego añadió una línea al final: "Esto no incluye los ahorros de los Savings Plans (14.200 USD/año) ni las políticas de ciclo de vida de S3 (7.800 USD/año). Impacto anual total de la optimización: aproximadamente 28.200 USD."

Maya lo leyó dos veces.

"Eso es casi el salario de un ingeniero junior," dijo.

"En desperdicio," confirmó Tom.

"O," dijo Leo, "es la prueba de que hacer estas optimizaciones antes habría financiado a ese ingeniero junior."

Tom lo miró.

"Esa es la forma correcta de pensarlo," dijo. "La optimización de costes no se trata de recortar. Se trata de no pagar por cosas que no crean valor."

Maya fijó el documento en el wiki de la empresa.

En el siguiente capítulo: el nivel de base de datos recibe el mismo tratamiento, y Tom descubre el único lugar en el que en realidad estaba invirtiendo menos de lo necesario.
