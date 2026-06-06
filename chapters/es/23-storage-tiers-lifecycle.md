# Capítulo 23: El Sistema de Archivos que Se Organiza Solo

Un bufete de abogados mantiene los expedientes activos en el escritorio. Los casos cerrados van a un archivador. Los casos de hace tres años van a cajas de almacenamiento en el sótano. Los casos de hace diez años van a una instalación de archivo externa que cuesta céntimos por caja, pero tarda dos días en recuperar cualquier cosa.

La misma información, almacenada a costos diferentes según la frecuencia con que se accede a ella.

---

Con la automatización del flujo de trabajo implementada y el flujo de pedidos finalmente estable, Tom había vuelto a su revisión de costos. La factura de S3 le había estado rondando la cabeza desde el trimestre anterior, una de esas líneas de gasto que seguía creciendo sin que nadie la mirara directamente. Por fin tuvo tiempo de mirarla.

Llamó a Leo.

"Tenemos 4,2 terabytes en S3", dijo Leo después de comprobarlo.

"¿De qué?"

"Fotos de restaurantes. Recibos de pedidos. Exportaciones de análisis. Instantáneas de copias de seguridad de hace 18 meses."

"¿Cuándo fue la última vez que alguien accedió a una copia de seguridad de hace 18 meses?"

Leo revisó los registros de acceso.

"El octubre pasado", dijo. "Una vez. Para verificar el formato de la copia de seguridad."

"Así que estamos pagando 18 meses de copias de seguridad al precio completo de S3 Standard."

"Sí."

"¿Cuánto cuesta eso al mes, Glacier vs Standard?", preguntó Tom, abriendo ya la página de precios.

S3 Standard: $0,023 por GB al mes. S3 Glacier Instant Retrieval: $0,004 por GB al mes.

Tom hizo las cuentas.

"Podríamos reducir esta factura significativamente", dijo, "solo moviendo los datos antiguos a un almacenamiento más barato."

"Tendríamos que saber qué es antiguo", dijo Leo.

"S3 lo sabe. Rastrea la hora del último acceso."

**Clases de Almacenamiento de S3: El Espectro Completo**

El capítulo 5 presentó S3 Standard como la clase de almacenamiento principal. S3 en realidad tiene ocho clases de almacenamiento, cada una diseñada para diferentes patrones de acceso (la octava, **S3 Express One Zone**, es una clase especializada de una sola AZ para cargas de trabajo críticas en latencia y rara vez aparece fuera de los escenarios de alto rendimiento):

**S3 Standard**: Para datos a los que se accede con frecuencia. Baja latencia (milisegundos). Costo más alto. Sin duración mínima de almacenamiento. Úsala para datos activos: las fotos de menú actuales, los pedidos de hoy, los registros recientes.

**S3 Standard-Infrequent Access (S3 Standard-IA)**: Para datos a los que se accede menos de una vez al mes. La misma recuperación en milisegundos que Standard, pero menor costo de almacenamiento + tarifa de recuperación por GB. Duración mínima de almacenamiento de 30 días. Úsala para datos que necesitas de inmediato cuando accedes a ellos, pero rara vez lo haces: recibos de pedidos más antiguos, exportaciones de análisis de hace 6 meses.

**S3 One Zone-Infrequent Access (S3 One Zone-IA)**: Igual que S3 Standard-IA (incluido el mínimo de 30 días) pero almacenada en una sola Zona de Disponibilidad (en lugar de tres). Menos durable (si esa AZ tiene un desastre, los datos pueden perderse), pero un 20% más barata. Úsala para datos que pueden recrearse si se pierden: caché de miniaturas, salidas de procesamiento temporales.

**S3 Glacier Instant Retrieval**: Datos archivados que necesitas ocasionalmente. Recuperación en milisegundos. Costo de almacenamiento muy bajo, mayor costo de recuperación por GB. Mínimo de almacenamiento de 90 días. Úsala para datos a los que se accede una vez por trimestre o menos: reportes de cumplimiento trimestrales, instantáneas de copias de seguridad de hace 12 meses.

**S3 Glacier Flexible Retrieval**: Archivo profundo, recuperado en minutos a horas. Costo más bajo que Glacier Instant Retrieval. Úsala para datos de archivo con menos urgencia.

**S3 Glacier Deep Archive**: La opción de menor costo. Recuperado en 12 horas. Mínimo de almacenamiento de 180 días. Úsala para datos que deben conservarse por cumplimiento regulatorio pero que nunca se espera que se accedan: registros fiscales de 7 años, registros de auditoría de 10 años.

El patrón: a medida que la frecuencia de acceso disminuye, el costo disminuye pero el tiempo de recuperación aumenta (y el costo por recuperación aumenta). Elige la clase que coincida con tu patrón de acceso.

**Políticas de Ciclo de Vida de S3: El Sistema de Archivos Automatizado**

Mover archivos manualmente entre clases de almacenamiento es propenso a errores y consume tiempo. Las **políticas de ciclo de vida** de S3 automatizan esto según reglas que defines.

Una regla de ciclo de vida tiene dos componentes:

**Filtro**: A qué objetos se aplica la regla (todos los objetos, objetos con un prefijo específico, objetos con etiquetas específicas).

**Acciones**: Qué hacer, después de cuántos días.

Ejemplo de política de ciclo de vida para los recibos de pedidos de Nimbus:

```
Transición a S3 Standard-IA después de 90 días
Transición a S3 Glacier Instant Retrieval después de 365 días
Transición a S3 Glacier Flexible Retrieval después de 540 días (18 meses)
Transición a S3 Glacier Deep Archive después de 2555 días (7 años)
Eliminar después de 2920 días (8 años)
```

Esta única política garantiza:

- Recibos activos (< 90 días): S3 Standard, acceso rápido
- Recibos recientes (90-365 días): Standard-IA, barato pero instantáneamente disponible
- Recibos más antiguos (1 año a 18 meses): Glacier Instant, muy barato, milisegundos cuando se necesita
- Recibos históricos (18 meses a 7 años): Glacier Flexible, aún más barato; la recuperación tarda horas, no milisegundos
- Recibos vencidos (> 8 años): Eliminados automáticamente

Una trampa casi descarriló el plan. Desde finales de 2024, las reglas de ciclo de vida **no transicionan objetos menores de 128 KB de forma predeterminada**, y los recibos de Nimbus promediaban 18 KB cada uno. Para hacer que la política realmente los moviera, Leo tuvo que anular el tamaño mínimo de objeto predeterminado en la regla (los filtros de ciclo de vida también pueden seleccionar por tamaño con `ObjectSizeGreaterThan`/`ObjectSizeLessThan`). El valor predeterminado existe por una buena razón: las clases de archivo facturan ~40 KB de sobrecarga de metadatos por objeto y cada transición cuesta una tarifa de solicitud, así que para millones de objetos diminutos la transición puede costar más de lo que ahorra. Leo hizo las cuentas para los recibos: a una retención de siete años, aún valía la pena.

Tom revisó el ahorro proyectado: de $847/mes a unos $220/mes.

"¿Solo por... definir qué es antiguo y a dónde debería ir?", dijo.

"Y S3 lo mueve automáticamente", confirmó Leo. "Sin trabajo cron. Sin migración manual. Sin olvidos."

"Espera, pero *¿por qué* S3 no hace esto de forma predeterminada?", preguntó Maya desde el otro lado de la sala. "¿Por qué tienes que definir una política siquiera?"

"Porque 'antiguo' es diferente para cada bucket", dijo Leo. "Un archivo de cumplimiento y una subida de fotos necesitan reglas de retención completamente diferentes. S3 no puede adivinar cuál es cuál."

Quizás te preguntes: ¿qué pasa si los datos equivocados se mueven a Glacier y los necesitas urgentemente? Pagarías una tarifa de recuperación y esperarías, por lo cual deberías probar tus reglas de ciclo de vida en un bucket pequeño y no crítico primero, y verificar los registros de acceso antes de implementarlas en datos de producción. Un error de recuperación en 18 meses de copias de seguridad costaría mucho menos que un incidente de cara al cliente, pero aun así vale la pena probarlo primero.

Si el patrón de acceso de tus datos es predecible (los registros siempre están fríos después de 30 días), usa reglas de ciclo de vida explícitas: son más rentables que la tarifa de monitoreo por objeto de Intelligent-Tiering. Si tus patrones de acceso cambian con el tiempo o son difíciles de predecir, usa Intelligent-Tiering, pero ten en cuenta que simplemente ignora los objetos menores de 128 KB: no se monitorean, no se les cobra la tarifa de monitoreo y nunca abandonan el nivel de Acceso Frecuente.

**S3 Intelligent-Tiering: La Clase Auto-Organizada**

¿Qué pasa si no sabes con qué frecuencia accederás a tus datos?

**S3 Intelligent-Tiering** monitorea los patrones de acceso de cada objeto y lo mueve automáticamente entre niveles de acceso:

- **Nivel de Acceso Frecuente**: Para objetos a los que se accedió recientemente
- **Nivel de Acceso Infrecuente**: Objetos a los que no se accedió durante 30 días
- **Nivel de Acceso Instantáneo de Archivo**: Objetos a los que no se accedió durante 90 días
- **Nivel de Acceso de Archivo**: Objetos a los que no se accedió durante 90-730 días (opcional)
- **Nivel de Acceso de Archivo Profundo**: Objetos a los que no se accedió durante 180-730+ días (opcional)

S3 Intelligent-Tiering cobra una pequeña tarifa de monitoreo por objeto por mes ($0,0025 por 1.000 objetos), pero sin tarifa de recuperación para los niveles Frecuente e Infrecuente.

Usa Intelligent-Tiering cuando:

- Los patrones de acceso son impredecibles o cambian con el tiempo
- Tienes una mezcla de datos calientes y fríos que no puedes clasificar fácilmente
- Tienes objetos mayores de 128KB (los objetos más pequeños no se monitorean ni se distribuyen automáticamente en absoluto)

Usa clases de almacenamiento explícitas (con políticas de ciclo de vida) cuando:

- Los patrones de acceso son predecibles
- Quieres que cada objeto —incluidos los pequeños— realmente se mueva a clases más baratas
- Los objetos son pequeños (< 128KB)

La salvedad de los archivos pequeños merece énfasis. Nimbus tenía 2,3 millones de objetos de recibos de pedidos en S3, cada uno era un pequeño archivo JSON, con un promedio de unos 18KB. Tom había considerado inicialmente Intelligent-Tiering para el bucket de recibos, hasta que leyó la letra pequeña.

Los objetos menores de 128KB **no se monitorean ni se distribuyen automáticamente** en Intelligent-Tiering. No pagan la tarifa de monitoreo ($0,0025 por 1.000 objetos al mes), pero tampoco se mueven nunca: se quedan en el nivel de Acceso Frecuente, a precios equivalentes a Standard, para siempre.

Así que para los recibos de 18KB, Intelligent-Tiering no le habría costado nada extra a Nimbus, simplemente no habría *hecho* nada. 2,3 millones de recibos fríos habrían seguido pagando precios de almacenamiento caliente ($0,023/GB) indefinidamente, mientras que los niveles de Archivo ($0,00099/GB) quedaban fuera de alcance.

"Así que Intelligent-Tiering está diseñado para objetos grandes", dijo Maya.

"O para cargas de trabajo donde genuinamente no conoces el patrón de acceso", dijo Tom. "Para un bucket de archivos diminutos donde sabemos que los recibos están calientes durante 90 días y fríos después de eso, una regla de ciclo de vida explícita —con la anulación de objetos pequeños de antes— es lo único que realmente los mueve."

Intelligent-Tiering es un servicio excelente. Simplemente no es la herramienta correcta para cada bucket: por debajo del umbral de 128KB es inofensivo pero inútil, y solo las reglas de ciclo de vida explícitas (con una anulación de tamaño) distribuirán por niveles los objetos pequeños.

**Cuando Realmente Necesitas los Datos de Vuelta: Una Historia de Recuperación de Glacier**

Tres meses después de que se desplegaran las políticas de ciclo de vida, Nimbus recibió una notificación legal. Un antiguo socio restaurante estaba disputando un término del contrato, y los abogados de Nimbus necesitaban 18 meses de registros de pedidos de ese socio: todo desde la apertura hasta la terminación del contrato.

"¿Y qué pasa si alguien intenta entrar por la fuerza a través del proceso de descubrimiento legal?", dijo Priya. No bromeaba. "Que los abogados soliciten exportaciones masivas de datos es un vector común de ingeniería social. Verifica que la solicitud sea legítima antes de abrir cualquier almacén de datos."

La solicitud era legítima. Los registros estaban en S3, a través de tres clases de almacenamiento: los 90 días más recientes en Standard-IA, el año anterior en Glacier Instant Retrieval, el resto en Glacier Flexible Retrieval (la política de ciclo de vida había usado Flexible para los datos de más de 18 meses de antigüedad).

Los registros de Glacier Instant estaban inmediatamente disponibles. Leo filtró por ID de restaurante, ejecutó una consulta de Athena para identificar los registros de pedidos coincidentes y los exportó a una ubicación segura de S3. Cinco minutos de trabajo.

Los registros de Glacier Flexible requerían una solicitud de restauración:

```bash
aws s3api restore-object \
    --bucket nimbus-order-receipts \
    --key "2022/06/restaurant-47/" \
    --restore-request '{"Days":7,"GlacierJobParameters":{"Tier":"Standard"}}'
```

Glacier Flexible Retrieval **nivel Standard**: 3-5 horas. Los registros estarían disponibles como una copia temporal en S3 Standard durante 7 días, luego se eliminarían automáticamente. La copia archivada original permanece en Glacier.

Costo de toda la recuperación: $0,01 por GB recuperado en el nivel Standard, para 4,2 GB de registros archivados. Unos cuatro centavos. (El nivel Expedited —de 1 a 5 minutos— cuesta $0,03 por GB, pero su disponibilidad no está garantizada de la manera en que lo está la de Standard.)

"Cuatro centavos", dijo Maya, cuando Leo informó de vuelta. "Por 18 meses de registros."

"Almacenamos 4,2GB a $0,0036 por GB al mes durante un año y medio", dijo Leo. "El costo de almacenamiento fue de unos veintisiete centavos en total. El costo de recuperación fue de cuatro. Frente a un dólar setenta y cuatro si lo hubiéramos mantenido en S3 Standard durante 18 meses."

"Y lo único que importó", dijo Priya, "fue que recordamos que estaba en Flexible Retrieval y planificamos para la espera de 3-5 horas. Si los abogados necesitaran esto en 30 minutos, habríamos tenido un problema."

Esta es la lección operativa importante sobre Glacier: no es solo una decisión de costo, es una decisión de SLA de recuperación. Antes de archivar datos en Glacier Flexible o Deep Archive, documenta el tiempo de recuperación para cualquiera que pueda necesitarlos. "Los datos existen" y "podemos obtenerlos en 30 minutos" son dos garantías diferentes.

**Subida Multiparte: Para Objetos Grandes**

S3 tiene un límite de subida única de 5GB. Para objetos más grandes, debes usar la **subida multiparte**: divide el objeto en partes, sube cada una en paralelo, y S3 las ensambla.

Beneficios:

- Subidas más rápidas (en paralelo)
- Puede reanudar subidas fallidas (solo vuelve a subir las partes fallidas)
- Requerida para objetos > 5GB

Consejo de regla de ciclo de vida: Establece una regla de ciclo de vida para eliminar las subidas multiparte incompletas después de 7 días. Si una subida falla a mitad de camino y no se limpia, esas partes parciales se almacenan y se cobran, sin un objeto ensamblado que lo justifique.

Tom apreció enormemente este consejo.

Ejecutó el comando de la AWS CLI para listar las subidas multiparte incompletas en todos los buckets de Nimbus:

```bash
aws s3api list-multipart-uploads --bucket nimbus-restaurant-photos
```

La salida era más larga de lo que esperaba. La canalizó a un contador.

340 subidas incompletas. La más antigua era de hace 8 meses: la prueba de carga de Leo del flujo de subida de fotos de restaurantes. La prueba de carga había generado cientos de subidas parciales, ninguna de las cuales se había completado (la prueba no había sido diseñada para completarlas, solo para probar el endpoint de inicio). 340 subidas incompletas, sentadas en S3, cada una representando datos parciales que AWS estaba almacenando y cobrando.

"¿Cuánto cuesta eso al mes?", dijo Tom. No estaba pidiendo información. Estaba calculando en voz alta.

El tamaño combinado de las partes incompletas: 48 GB. A $0,023/GB: $1,10/mes. Durante ocho meses: $8,80 ya gastados.

A la tasa de crecimiento actual, si no se limpia: continuando indefinidamente.

"Leo", dijo Tom.

"Ya lo desplegué... ah", dijo Leo, acercándose. "La prueba de carga. Olvidé limpiar las subidas parciales."

"Hace ocho meses."

"No sabía que S3 almacena las partes aunque la subida nunca se complete."

"Las almacena. Las cobra. Y no hay ningún panel que te avise al respecto. Simplemente se acumulan."

La corrección: una regla de ciclo de vida para eliminar las partes de subida multiparte incompletas después de 7 días.

```
Regla: Eliminar partes de subida multiparte incompletas
Prefijo: (todos los objetos)
Acción: Eliminar subidas multiparte incompletas después de 7 días
```

Las 340 subidas existentes se limpiaron manualmente. La regla de ciclo de vida garantiza que ninguna prueba de carga o subida fallida futura se acumule de la misma manera. Los $1,10/mes que se habían estado acumulando silenciosamente durante ocho meses se detuvieron: pequeño en dólares, pero el patrón (invisible, creciente, sin tope) era la parte que valía la pena eliminar.

"La regla son tres líneas", dijo Tom. "Debería haberla establecido en cada bucket al crearlo." Actualizó la lista de verificación de creación de buckets: cada nuevo bucket de S3 obtiene una regla de limpieza de subidas multiparte de forma predeterminada.

**Tres Capas de Seguridad: Un Repaso Rápido Antes del Desvío**

"¿Y qué pasa si alguien intenta entrar por la fuerza y eliminar los registros de auditoría?", preguntó Priya de nuevo, esta vez en el contexto de un modelo de amenaza específico. "No solo una regla de ciclo de vida mal configurada. Un insider malicioso. Una clave de IAM comprometida con acceso de escritura."

El equipo ya tenía las respuestas, simplemente no las había aplicado a este bucket. Tres capas, cada una cubierta antes en el libro, cada una abordando un vector de amenaza diferente:

El **versionado** (capítulo 5) hace que las eliminaciones sean reversibles: un DELETE se convierte en un marcador de eliminación, y las versiones anteriores permanecen restaurables. Para datos de escritura única como los recibos de pedidos, la sobrecarga de almacenamiento es mínima: solo hay una versión por objeto.

**S3 Object Lock** (capítulo 5) hace que los objetos sean verdaderamente inmutables: almacenamiento WORM que ni siquiera una clave de administrador puede eliminar durante el período de retención. Para los recibos, con su requisito de retención fiscal de 7 años, el equipo eligió el modo Compliance: ninguna mala configuración de ciclo de vida, ningún error de IAM, ninguna credencial comprometida puede eliminarlos antes de que el auditor lo pida. Y Object Lock coexiste con las transiciones de ciclo de vida: una regla que mueve los recibos a Glacier Deep Archive sigue funcionando; los datos se vuelven más baratos y permanecen inmutables.

Los **eventos de datos de S3 de CloudTrail** (capítulos 16-17) te dicen qué le ocurrió a los datos: cada GET, PUT, DELETE y COPY registrado con quién, desde dónde y cuándo, la materia prima que GuardDuty (capítulo 17) usa para alertar sobre anomalías.

"Versionado para la recuperación ante accidentes. Object Lock para la inmutabilidad de cumplimiento. CloudTrail para el análisis forense", resumió Priya. "Cubrimos cada uno de estos por separado. La nueva decisión de hoy es activar los tres para este bucket."

**Replicación Entre Regiones: Registros de Pedidos como Recuperación ante Desastres**

El bucket de recibos de pedidos de Nimbus estaba en us-west-2. Eso era intencional: us-west-2 es donde corría la aplicación. Pero "la aplicación está en us-west-2" y "todos los registros de pedidos están solo en us-west-2" son perfiles de riesgo diferentes.

Si Nimbus necesitara activar un sitio de recuperación ante desastres en us-east-1, los registros de pedidos tendrían que estar allí también. Esperar para copiarlos en medio de un fallo regional no es un plan de recuperación.

Priya recomendó la **Replicación Entre Regiones (CRR)** para el bucket de recibos de pedidos. La regla:

```
Origen: nimbus-order-receipts (us-west-2)
Destino: nimbus-order-receipts-dr (us-east-1)
Replicación: Todos los objetos
Clase de almacenamiento en el destino: S3 Standard-IA (más barato — esta es la copia de DR, a la que rara vez se accede)
```

La mecánica era familiar del capítulo 5: replicación asincrónica de las nuevas escrituras (la mayoría de los objetos en 15 minutos; un SLA garantizado requiere pagar por **S3 Replication Time Control**), versionado requerido en ambos buckets, un rol de IAM con permiso de lectura-origen/escritura-destino. El detalle que vale la pena notar en la regla anterior: el destino usa una *clase de almacenamiento diferente* a la del origen, Standard-IA para la copia de DR, en lugar de pagar por una segunda copia Standard que rara vez se lee. Y el prerrequisito del versionado no costó nada extra: ya estaban habilitando el versionado para la recuperación ante accidentes. (El hermano de CRR, la **Replicación en la Misma Región (SRR)**, copia objetos entre buckets en la *misma* región: útil para una copia de cumplimiento en una cuenta separada, agregación de registros o entornos de prueba sembrados con datos de producción.)

Una trampa que Priya señaló antes de que alguien la encontrara: la replicación **no es retroactiva**. Los objetos que ya existen en el bucket cuando habilitas la regla no se replican, solo las nuevas escrituras. Los equipos habilitan CRR esperando que todos sus datos existentes aparezcan en el destino, luego descubren que el bucket de DR está casi vacío. Para los objetos preexistentes, ejecutas la **Replicación por Lotes de S3**, una operación separada que aplica las reglas de replicación a los objetos que ya estaban ahí. Nimbus la ejecutó una vez para sembrar el bucket de DR con los 0,8 TB de recibos existentes.

"¿Y los marcadores de eliminación?", preguntó Priya. "Si alguien elimina un recibo en us-west-2, ¿se replica la eliminación a us-east-1?"

De forma predeterminada, no: en las configuraciones de replicación actuales (el esquema V2 que crea la consola), **los marcadores de eliminación no se replican**. Alguien elimina un recibo en us-west-2, y la copia de us-east-1 sigue sirviéndolo como si nada hubiera pasado. Si *quieres* que el bucket de DR refleje las eliminaciones, habilitas la replicación de marcadores de eliminación explícitamente en la regla (no compatible con reglas que tienen filtros de etiquetas): ese era el valor predeterminado en el esquema heredado V1, que el material más antiguo todavía describe. De cualquier manera, las expiraciones de ciclo de vida nunca replican sus marcadores de eliminación.

La replicación sigue *sin* ser una solución de copia de seguridad, sin embargo, por las razones opuestas: no protegerá contra eliminaciones permanentes de versiones o sobrescrituras maliciosas que se replican al espejo, y no tiene semántica de retención. Para una verdadera copia de seguridad, combina el versionado con Object Lock, o usa AWS Backup.

"¿Cuánto cuesta eso al mes?", preguntó Tom.

Almacenamiento para 0,8 TB en S3 Standard-IA en us-east-1: $10,00/mes. Más la transferencia de datos de replicación (cobrada por GB transferido entre regiones): mínima a su volumen de escritura actual. Costo adicional total: aproximadamente $10-11/mes para una copia completa entre regiones de todos los registros de pedidos.

Tom anotó esto sin quejarse.

**S3 Storage Lens: Ver el Panorama Completo**

Tom había hecho su auditoría manualmente: abriendo la consola de AWS bucket por bucket, ejecutando comandos de la AWS CLI para contar objetos, comprobando el explorador de facturación para los costos de almacenamiento por bucket. Le había llevado la mayor parte de una tarde construir esa hoja de cálculo.

**S3 Storage Lens** es la herramienta de AWS que reemplaza ese proceso manual. Proporciona visibilidad de todo el uso y la actividad de S3 a nivel de organización en todos los buckets, todas las cuentas y todas las regiones, en un único panel.

Las métricas que más importan para la optimización de costos:

**Bytes de versiones no actuales**: Cuánto almacenamiento consumen las versiones más antiguas (cuando el versionado está habilitado). El versionado es esencial para la seguridad, pero si un documento se actualiza con frecuencia, las versiones más antiguas se acumulan. Una regla de ciclo de vida para expirar las versiones no actuales después de 30 días evita la hinchazón de versiones.

**Bytes de subidas multiparte incompletas**: Exactamente el problema que Leo había causado con la prueba de carga, surgido automáticamente. Sin Storage Lens, Tom tuvo que saber que debía buscar subidas multiparte incompletas. Con Storage Lens, aparecen en el panel como una línea de gasto.

**% de solicitudes que devuelven 403**: Un pico de respuestas 403 (Prohibido) en un bucket que debería ser de acceso público podría indicar una política de bucket mal configurada. Un pico en un bucket privado podría indicar un intento de escaneo o sondeo. De cualquier manera, es una señal que vale la pena investigar.

**Tamaño medio de objeto**: Un bucket de objetos diminutos (promedio de 2KB) se comporta de forma diferente a un bucket de objetos grandes (promedio de 50MB) en términos de la economía de Intelligent-Tiering, los costos de solicitudes y el rendimiento de consultas para Athena.

S3 Storage Lens tiene una capa gratuita que cubre las métricas esenciales. Las métricas avanzadas (estadísticas de solicitudes, grupos de lentes para filtrar) tienen un costo adicional por millón de objetos al mes, pequeño en relación con el ahorro que permite.

"¿Por qué no usamos esto desde el principio?", preguntó Maya.

"No teníamos 4,2 terabytes desde el principio", dijo Tom. "A pequeña escala, una hoja de cálculo funciona. A esta escala, la escala en sí misma se convierte en un argumento a favor de la herramienta."

Este es un tema recurrente en la arquitectura de Nimbus: la herramienta correcta para una escala dada no siempre es la herramienta correcta para la siguiente escala. Vale la pena configurar S3 Storage Lens tan pronto como tu uso de S3 crezca más allá de lo que puedes auditar manualmente en una tarde, que es aproximadamente cuando el ahorro que permite empieza a superar significativamente el tiempo que ahorra.

## Fortalezas y Limitaciones

**Por qué importan los niveles de almacenamiento de S3**:

- Reducción significativa de costos sin sacrificar la durabilidad o la disponibilidad para lo que realmente se accede
- Las políticas de ciclo de vida automatizan todo el proceso: sin carga operativa
- S3 Intelligent-Tiering elimina la necesidad de predecir los patrones de acceso

**Donde se complica**:

- Los cargos por duración mínima de almacenamiento se aplican a las clases de Glacier (90 días para Glacier Instant, 180 días para Deep Archive): eliminar antes igual incurre en el cargo mínimo
- Las tarifas de recuperación pueden sorprenderte si accedes a los datos archivados con frecuencia
- Las transiciones de ciclo de vida toman tiempo: los objetos no se mueven instantáneamente después de que la regla se activa
- Intelligent-Tiering ignora los objetos menores de 128KB: sin tarifa, pero tampoco distribución por niveles; y las reglas de ciclo de vida los omiten de forma predeterminada a menos que anules el tamaño mínimo de objeto

## Resumen

La automatización del flujo de trabajo del capítulo 22 optimizó cómo Nimbus procesa las solicitudes. Este capítulo optimiza lo que Nimbus paga por los datos que conserva pero a los que no accede. El principio es el mismo: deja de pagar por el nivel equivocado.

- S3 tiene ocho clases de almacenamiento: Standard, Standard-IA, Intelligent-Tiering, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive, más Express One Zone (especializada de baja latencia, una sola AZ).
- Las **políticas de ciclo de vida** automatizan las transiciones entre clases de almacenamiento según la antigüedad: defínelas una vez, S3 lo maneja para siempre.
- **S3 Intelligent-Tiering** mueve automáticamente los objetos entre niveles según los patrones de acceso reales: úsalo para cargas de trabajo impredecibles con objetos mayores de 128KB. Los objetos más pequeños no se monitorean ni se distribuyen automáticamente (y no pagan tarifa de monitoreo): se quedan en el nivel de Acceso Frecuente.
- La **recuperación de Glacier** requiere una solicitud de restauración para los niveles Flexible y Deep Archive. Planifica el tiempo de recuperación (minutos a 12 horas) antes de archivar cualquier dato con un SLA de recuperación.
- Las **subidas multiparte incompletas** se acumulan silenciosamente e incurren en cargos de almacenamiento. Agrega una regla de ciclo de vida para eliminar las partes incompletas después de 7 días en cada bucket.
- **Tres capas de seguridad**: versionado (eliminaciones reversibles), Object Lock (inmutabilidad para cumplimiento), eventos de datos de CloudTrail (análisis forense y detección de anomalías).
- **Replicación Entre Regiones (CRR)**: replica los registros de pedidos a una región de DR automáticamente. Requiere versionado en ambos buckets. Configura si los marcadores de eliminación se replican según si la copia de DR es un espejo o una copia de seguridad.
- La **subida multiparte** es requerida para objetos > 5GB y recomendada para cualquier cosa > 100MB.
- **S3 Object Lock** proporciona almacenamiento WORM para escenarios de cumplimiento: el modo Governance puede ser anulado por los administradores; el modo Compliance no puede ser anulado por nadie.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas Optimizadas en Costos (Dominio 4, Tarea 4.1)*

- **Señales de selección de clase de almacenamiento**:
  - "Acceso frecuente" → Standard
  - "Accedido una vez al mes, necesita recuperación instantánea" → Standard-IA
  - "Puede tolerar horas de tiempo de recuperación, rara vez accedido" → Glacier Flexible Retrieval
  - "Cumplimiento regulatorio, retención de más de 7 años, nunca accedido" → Glacier Deep Archive
  - "Patrones de acceso desconocidos o cambiantes" → Intelligent-Tiering
- **Patrones de examen de políticas de ciclo de vida**: "reducir automáticamente los costos de almacenamiento a medida que los datos envejecen", "transición a archivo después de 90 días" → políticas de ciclo de vida.
- **Intelligent-Tiering y objetos pequeños**: los objetos menores de 128KB no se monitorean, no pagan tarifa de monitoreo y nunca se distribuyen automáticamente: se quedan en Acceso Frecuente. Las reglas de ciclo de vida también omiten los objetos menores de 128KB de forma predeterminada (anulable). El examen puede evaluar cualquiera de los dos hechos.
- **Requisitos de CRR**: El versionado debe estar habilitado en ambos buckets, origen y destino. El origen y el destino deben estar en regiones diferentes.
- **S3 Object Lock**: "WORM", "inmutable", "SEC 17a-4", "no puede eliminarse ni modificarse" → Object Lock. Modo Governance (puede ser anulado por los administradores). Modo Compliance (no puede ser anulado por nadie, incluido root).
- **Restauración de Glacier**: Los objetos en Glacier no están inmediatamente disponibles. Debes "restaurar" una copia a S3 Standard para acceder. La copia restaurada es temporal (tú estableces la duración). El original permanece en Glacier.

## Ejercicios

**Ejercicio 1 — Recuerdo**

Explica la diferencia entre S3 Standard-IA y S3 Glacier Instant Retrieval. ¿Qué patrón de acceso hace que cada uno sea apropiado?

*(Pista: Piensa en con qué frecuencia accederías a los datos y qué tan rápido los necesitas cuando lo haces.)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: Una empresa genera 500GB de registros de aplicación diariamente. Los registros se consultan intensamente durante los primeros 7 días (depuración y monitoreo). Después de 7 días, rara vez se accede a los registros pero deben estar disponibles en 30 minutos si se necesitan. Después de 1 año, los registros deben conservarse por cumplimiento pero nunca se accede a ellos. La empresa necesita minimizar los costos de almacenamiento mientras cumple con estos requisitos.

¿Qué política de ciclo de vida de S3 cumple MEJOR con estos requisitos?

A) Almacenar en S3 Standard durante 7 días; transición a S3 Glacier Deep Archive después de 7 días; expirar después de 365 días  
B) Almacenar en S3 Standard durante 7 días; transición a S3 Standard-IA después de 7 días; transición a S3 Glacier Flexible Retrieval después de 365 días  
C) Almacenar todos los registros en S3 Intelligent-Tiering desde el día 1  
D) Almacenar en S3 Standard durante 7 días; transición a S3 Glacier Instant Retrieval después de 7 días; transición a S3 Glacier Deep Archive después de 365 días

**Pista 1**: "Disponible en 30 minutos" descarta qué clase de almacenamiento?

**Pista 2**: Deep Archive tarda 12 horas en recuperarse: no cumple con el requisito de 30 minutos para los días 7-365.

**Pista 3**: Después de 365 días, el tiempo de recuperación no importa (nunca se accede), así que se aplica la opción más barata.

**Respuesta**: D

**Explicación**: S3 Standard durante 7 días maneja el acceso frecuente. Glacier Instant Retrieval proporciona acceso en milisegundos para los días 7-365, cumpliendo con el requisito de 30 minutos a un costo significativamente menor que Standard-IA. Después de 365 días, Glacier Deep Archive es la opción más barata para datos que nunca se acceden.

**¿Por qué no A?** Glacier Deep Archive tarda 12 horas en recuperarse: no cumple con el requisito de "disponibilidad en 30 minutos" para los días 7-365.

**¿Por qué no B?** Standard-IA ni siquiera puede ser la primera parada aquí: S3 requiere que los objetos envejezcan 30 días en Standard antes de que una regla de ciclo de vida pueda transicionarlos a Standard-IA o One Zone-IA, así que "Standard-IA después de 7 días" es una regla inválida. (La regla de los 30 días no se aplica a las clases de Glacier, que es exactamente por lo que D funciona.) E incluso dejando eso de lado, Glacier Instant Retrieval es significativamente más barato para datos a los que rara vez se accede después del día 7.

**¿Por qué no C?** Intelligent-Tiering tiene una tarifa de monitoreo por objeto y podría no mover los registros a los niveles de archivo tan agresivamente como las reglas de ciclo de vida explícitas. Para un gran volumen de registros con un patrón de acceso predecible, las reglas de ciclo de vida explícitas son más rentables.

*Dominio SAA-C03: Diseño de Arquitecturas Optimizadas en Costos — Tarea 4.1*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus tiene tres tipos de datos en S3 con características diferentes:

- Fotos de restaurantes: subidas una vez, accedidas muchas veces por los clientes, nunca eliminadas
- Recibos de pedidos: accedidos por los clientes en el primer mes, conservados 7 años para fines fiscales
- Exportaciones de análisis: generadas diariamente, analizadas la semana siguiente, conservadas 2 años

Diseña una política de ciclo de vida para cada uno. Para las fotos de restaurantes, ¿tendría sentido Intelligent-Tiering? Para los recibos de pedidos, ¿qué clase de almacenamiento cubre la ventana de 1 mes a 7 años? Para las exportaciones de análisis, ¿cómo estructurarías el bucket para aplicar políticas diferentes a prefijos diferentes?

*(No existe una única respuesta correcta. El objetivo es practicar la selección de niveles de almacenamiento para datos del mundo real.)*

## Escena Post-Créditos

Tom implementó las políticas de ciclo de vida.

Leo había ayudado a configurar la primera regla. "Estará bien", había dicho. "La duración mínima de almacenamiento solo se aplica si eliminamos antes, y no estamos eliminando nada." Comprobó los requisitos de duración mínima de Glacier a mitad de camino. "En realidad, déjame releer esto."

En un bucket diferente —las exportaciones temporales de staging de análisis— casi había combinado una transición a Glacier Instant Retrieval a los 30 días con una regla de expiración a los 60 días. La duración mínima de almacenamiento para Glacier Instant es de 90 días: esos objetos habrían entrado a Glacier en el día 30 y habrían sido eliminados en el día 60, y S3 igual habría facturado los 90 días completos por cada uno de ellos, pagando precios de archivo por un almacenamiento que ya no existía. Eliminó la transición a Glacier para ese bucket por completo; los datos eliminados a los 60 días nunca viven lo suficiente para amortizar un mínimo de 90 días. La política de recibos era segura tal como estaba diseñada: transición a Standard-IA a los 90 días, Glacier Instant Retrieval a los 365 días, Glacier Flexible Retrieval a los 540 días, Glacier Deep Archive a los 2.555 días.

También estableció la regla de limpieza de subidas multiparte en cada bucket. No porque hubiera más subidas abandonadas —no las había— sino porque las habría. Las pruebas de carga ocurren. Los despliegues fallan a mitad de camino. La regla era más barata que la memoria requerida para recordar limpiar manualmente.

La factura de S3 bajó de $847 a $198 el mes siguiente.

Imprimió la comparación y la puso en el escritorio de Maya sin decir nada.

Maya la miró. Luego la fecha. Luego a Tom.

"Tres semanas", dijo.

"Una tarde para diseñar las políticas", dijo. "Una hora para implementarlas. Tres semanas para ver el primer ciclo de facturación completo."

"Tres cuartas partes de reducción en los costos de S3."

"Por datos a los que no accedemos."

"¿Y la replicación entre regiones?", preguntó Leo.

"Diez dólares al mes más", dijo Tom. "Por una copia completa de cada recibo de pedido en una segunda región."

"Esa es la decisión de recuperación ante desastres más barata que hemos tomado."

Maya miró los números de nuevo.

"Tom", dijo, "quiero que hagas esta revisión para cada servicio de AWS que usamos. Almacenamiento, cómputo, redes. Encuentra el desperdicio."

Él ya estaba de vuelta en su escritorio.

"Empecé la semana pasada", dijo.

En el próximo capítulo: el nivel de la base de datos tiene su propia versión de esta conversación, y Aurora es la respuesta que Tom no esperaba que le gustara.
