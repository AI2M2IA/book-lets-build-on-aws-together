# Capítulo 23: El Sistema de Archivos que Se Organiza Solo

Un bufete de abogados mantiene los expedientes activos en el escritorio. Los casos cerrados van a un archivador. Los casos de hace tres años van a cajas de almacenamiento en el sótano. Los casos de hace diez años van a una instalación de archivo externa que cuesta céntimos por caja, pero tarda dos días en recuperar cualquier cosa.

La misma información, almacenada a diferentes costes en función de la frecuencia con que se accede a ella.

S3 hace esto automáticamente.

Tom estaba revisando la factura de AWS de Nimbus. Línea: almacenamiento S3. 847 USD/mes.

Llamó a Leo.

"Tenemos 4,2 terabytes en S3," dijo Leo tras comprobarlo.

"¿De qué?"

"Fotos de restaurantes. Recibos de pedidos. Exportaciones de analítica. Instantáneas de respaldo de hace 18 meses."

"¿Cuándo fue la última vez que alguien accedió a un respaldo de hace 18 meses?"

Leo comprobó los registros de acceso.

"El octubre pasado," dijo. "Una vez. Para verificar el formato del respaldo."

"Entonces estamos pagando por 18 meses de respaldos a precios completos de S3 Standard."

"Sí."

Tom miró la página de precios de S3. S3 Standard: 0,023 USD por GB al mes. S3 Glacier Instant Retrieval: 0,004 USD por GB al mes.

Hizo los cálculos. Algunos cálculos rápidos.

"Podríamos reducir esta factura significativamente," dijo, "simplemente moviendo los datos antiguos a almacenamiento más barato."

"Necesitaríamos saber qué es antiguo," dijo Leo.

"S3 lo sabe. Rastrea el tiempo del último acceso."

**Clases de Almacenamiento de S3: El Espectro Completo**

El capítulo 5 presentó S3 Standard como la clase de almacenamiento principal. S3 en realidad tiene siete clases de almacenamiento, cada una diseñada para diferentes patrones de acceso:

**S3 Standard**: Para datos a los que se accede con frecuencia. Baja latencia (milisegundos). Mayor coste. Sin duración mínima de almacenamiento. Úsalo para datos activos: las fotos del menú actual, los pedidos de hoy, los registros recientes.

**S3 Standard-Infrequent Access (S3 Standard-IA)**: Para datos a los que se accede menos de una vez al mes. Misma recuperación en milisegundos que Standard, pero menor coste de almacenamiento + tarifa de recuperación por GB. Úsalo para datos que necesitas de inmediato cuando accedes a ellos, pero raramente: recibos de pedidos más antiguos, exportaciones de analítica de hace 6 meses.

**S3 One Zone-Infrequent Access (S3 One Zone-IA)**: Igual que S3 Standard-IA, pero almacenado en una sola Zona de Disponibilidad (en lugar de tres). Menos durable (si esa AZ sufre un desastre, los datos pueden perderse), pero un 20% más barato. Úsalo para datos que pueden recrearse si se pierden: caché de miniaturas, resultados de procesamiento temporal.

**S3 Glacier Instant Retrieval**: Datos archivados a los que accedes ocasionalmente. Recuperación en milisegundos. Coste de almacenamiento muy bajo, mayor coste de recuperación por GB. Duración mínima de almacenamiento de 90 días. Úsalo para datos a los que se accede una vez por trimestre o menos: informes de cumplimiento trimestrales, instantáneas de respaldo de hace 12 meses.

**S3 Glacier Flexible Retrieval**: Archivo profundo, recuperado en minutos u horas. Menor coste que Glacier Instant Retrieval. Úsalo para datos de archivo con menos urgencia.

**S3 Glacier Deep Archive**: Opción de menor coste. Recuperado en 12 horas. Duración mínima de almacenamiento de 180 días. Úsalo para datos que deben conservarse por cumplimiento normativo pero cuyo acceso nunca se espera: registros fiscales de 7 años, registros de auditoría de 10 años.

El patrón: a medida que disminuye la frecuencia de acceso, disminuye el coste, pero aumenta el tiempo de recuperación (y el coste de recuperación por acceso). Elige la clase que coincida con tu patrón de acceso.

**Políticas de Ciclo de Vida de S3: El Sistema de Archivos Automatizado**

Mover archivos manualmente entre clases de almacenamiento es propenso a errores y consume tiempo. Las **políticas de ciclo de vida** de S3 automatizan esto basándose en las reglas que defines.

Una regla de ciclo de vida tiene dos componentes:

**Filtro**: A qué objetos aplica la regla (todos los objetos, objetos con un prefijo específico, objetos con etiquetas específicas).

**Acciones**: Qué hacer, después de cuántos días.

Ejemplo de política de ciclo de vida para los recibos de pedidos de Nimbus:

```
Transición a S3 Standard-IA después de 90 días
Transición a S3 Glacier Instant Retrieval después de 365 días
Transición a S3 Glacier Deep Archive después de 2555 días (7 años)
Eliminar después de 2920 días (8 años)
```

Esta única política garantiza:

- Recibos activos (< 90 días): S3 Standard, acceso rápido
- Recibos recientes (90-365 días): Standard-IA, barato pero disponible al instante
- Recibos históricos (1-7 años): Glacier, muy barato, raramente necesario
- Recibos caducados (> 8 años): Eliminados automáticamente

Tom revisó los ahorros proyectados: de 847 USD/mes a unos 220 USD/mes.

"¿Solo... definiendo qué es antiguo y adónde debe ir?" dijo.

"Y S3 lo mueve automáticamente," confirmó Leo. "Sin cron job. Sin migración manual. Sin olvidos."

**S3 Intelligent-Tiering: La Clase de Autoorganización**

¿Y si no sabes con qué frecuencia accederás a tus datos?

**S3 Intelligent-Tiering** monitoriza los patrones de acceso de cada objeto y lo mueve automáticamente entre los niveles de acceso:

- **Nivel de acceso frecuente**: Para objetos a los que se ha accedido recientemente
- **Nivel de acceso infrecuente**: Objetos a los que no se ha accedido en 30 días
- **Nivel de acceso a archivo instantáneo**: Objetos a los que no se ha accedido en 90 días
- **Nivel de acceso a archivo**: Objetos a los que no se ha accedido en 90-730 días (opcional)
- **Nivel de acceso a archivo profundo**: Objetos a los que no se ha accedido en 180-730+ días (opcional)

S3 Intelligent-Tiering cobra una pequeña tarifa de monitorización por objeto al mes (0,0025 USD por cada 1.000 objetos), pero sin tarifa de recuperación para los niveles frecuente e infrecuente.

Usa Intelligent-Tiering cuando:

- Los patrones de acceso son impredecibles o cambian con el tiempo
- Tienes una mezcla de datos activos e inactivos que no puedes clasificar fácilmente
- Tienes objetos mayores de 128 KB (los objetos pequeños cuestan más en tarifas de monitorización que lo que ahorran)

Usa clases de almacenamiento explícitas (con políticas de ciclo de vida) cuando:

- Los patrones de acceso son predecibles
- Quieres minimizar las tarifas de monitorización por objeto
- Los objetos son pequeños (< 128 KB)

**Carga Multiparte: Para Objetos Grandes**

S3 tiene un límite de carga única de 5 GB. Para objetos más grandes, debes usar la **carga multiparte**: divide el objeto en partes, carga cada una en paralelo y S3 las ensambla.

Ventajas:

- Cargas más rápidas (en paralelo)
- Puede reanudar cargas fallidas (solo vuelve a cargar las partes fallidas)
- Requerido para objetos > 5 GB

Consejo sobre regla de ciclo de vida: establece una regla de ciclo de vida para eliminar las cargas multiparte incompletas después de 7 días. Si una carga falla a mitad y no se limpia, esas partes parciales se almacenan y se cobran, sin que haya un objeto ensamblado que mostrar.

Tom apreció enormemente este consejo.

**Replicación de S3: Copiar Datos Entre Buckets**

S3 puede replicar automáticamente los objetos de un bucket a otro:

**Replicación en la Misma Región (SRR)**: Copia objetos dentro de la misma región. Úsala para cumplimiento (mantener una copia separada en una cuenta diferente), agregar registros de múltiples buckets o crear entornos de prueba a partir de datos de producción.

**Replicación entre Regiones (CRR)**: Copia objetos a una región diferente. Úsala para recuperación ante desastres (redundancia de datos entre regiones), cumplimiento (los datos deben estar en una geografía específica) y menor latencia para usuarios globales.

La replicación no es una solución de respaldo: si eliminas un objeto en el bucket de origen, se elimina en la réplica (a menos que la replicación de marcadores de eliminación esté desactivada). Usa AWS Backup o versionado con bloqueo de objetos para respaldo.

**Bloqueo de Objetos de S3: Inmutabilidad para Cumplimiento**

Algunas regulaciones requieren que los datos sean **inmutables**: una vez escritos, no pueden modificarse ni eliminarse durante un período especificado.

**S3 Object Lock** implementa el almacenamiento WORM (Write Once, Read Many, escribe una vez, lee muchas veces):

**Período de retención**: Los objetos no pueden eliminarse ni sobrescribirse durante una duración especificada.

**Retención legal**: Los objetos no pueden eliminarse, independientemente del período de retención, hasta que se retire explícitamente la retención legal.

Usa S3 Object Lock para industrias reguladas: registros financieros (Regla SEC 17a-4), registros de salud (HIPAA), archivos de cumplimiento.

## Ventajas y Limitaciones

**Por qué importan los niveles de almacenamiento de S3**:

- Reducción significativa de costes sin sacrificar la durabilidad ni la disponibilidad de lo que realmente se accede
- Las políticas de ciclo de vida automatizan todo el proceso: sin carga operativa
- S3 Intelligent-Tiering elimina la necesidad de predecir los patrones de acceso

**Dónde se complica**:

- Se aplican cargos de duración mínima de almacenamiento a las clases Glacier (90 días para Glacier Instant, 180 días para Deep Archive): eliminar antes del plazo sigue incurriendo en el cargo mínimo
- Las tarifas de recuperación pueden sorprenderte si accedes con frecuencia a datos archivados
- Las transiciones de ciclo de vida llevan tiempo: los objetos no se mueven instantáneamente después de que se activa la regla
- Las tarifas de monitorización de Intelligent-Tiering se acumulan para buckets con millones de objetos pequeños

## Resumen

- S3 tiene siete clases de almacenamiento: Standard, Standard-IA, Intelligent-Tiering, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval y Glacier Deep Archive.
- Las **políticas de ciclo de vida** automatizan las transiciones entre clases de almacenamiento basándose en la antigüedad: defínelas una vez, S3 lo gestiona para siempre.
- **S3 Intelligent-Tiering** mueve automáticamente los objetos entre niveles basándose en los patrones de acceso reales: úsalo para cargas de trabajo impredecibles.
- La **carga multiparte** es obligatoria para objetos > 5 GB y recomendable para cualquier cosa > 100 MB.
- La **replicación de S3** (SRR y CRR) copia objetos entre buckets y regiones: para recuperación ante desastres, cumplimiento o agregación.
- **S3 Object Lock** proporciona almacenamiento WORM para escenarios de cumplimiento.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas Optimizadas en Coste (Dominio 4, Tarea 4.1)*

- **Señales de selección de clase de almacenamiento**:
  - "Acceso frecuente" → Standard
  - "Acceso una vez al mes, recuperación instantánea" → Standard-IA
  - "Puede tolerar horas de tiempo de recuperación, raramente accedido" → Glacier Flexible Retrieval
  - "Cumplimiento normativo, retención de 7+ años, nunca accedido" → Glacier Deep Archive
  - "Patrones de acceso desconocidos o cambiantes" → Intelligent-Tiering
- **Patrones del examen de políticas de ciclo de vida**: "reducir automáticamente los costes de almacenamiento a medida que los datos envejecen," "transición a archivo después de 90 días" → políticas de ciclo de vida.
- **Tarifa de monitorización de Intelligent-Tiering**: Pequeña tarifa por objeto. Para grandes cantidades de objetos pequeños, puede superar los ahorros. El examen puede evaluar esto.
- **Requisitos de CRR**: El versionado debe estar habilitado en los buckets de origen y destino. El origen y el destino deben estar en regiones diferentes.
- **S3 Object Lock**: "WORM," "inmutable," "SEC 17a-4," "no puede eliminarse ni modificarse" → Object Lock. Modo de gobernanza (puede ser anulado por administradores). Modo de cumplimiento (no puede ser anulado por nadie, incluido root).
- **Restauración de Glacier**: Los objetos en Glacier no están disponibles de inmediato. Debes "restaurar" una copia a S3 Standard para acceder. La copia restaurada es temporal (estableces la duración). El original permanece en Glacier.

## Ejercicios

**Ejercicio 1 — Recordatorio**

Explica la diferencia entre S3 Standard-IA y S3 Glacier Instant Retrieval. ¿Qué patrón de acceso hace que cada uno sea apropiado?

*(Pista: Piensa en la frecuencia con que accederías a los datos y en la rapidez con que los necesitas cuando accedes a ellos.)*

**Ejercicio 2 — Práctica de Examen**

*Escenario*: Una empresa genera 500 GB de registros de aplicación diariamente. Los registros se consultan intensamente durante los primeros 7 días (depuración y monitorización). Después de 7 días, los registros raramente se acceden, pero deben estar disponibles en 30 minutos si se necesitan. Después de 1 año, los registros deben conservarse por cumplimiento, pero nunca se accede a ellos. La empresa necesita minimizar los costes de almacenamiento cumpliendo estos requisitos.

¿Qué política de ciclo de vida de S3 cumple MEJOR con estos requisitos?

A) Almacenar en S3 Standard durante 7 días; transición a S3 Glacier Deep Archive después de 7 días; caducar después de 365 días  
B) Almacenar en S3 Standard durante 7 días; transición a S3 Standard-IA después de 7 días; transición a S3 Glacier Flexible Retrieval después de 365 días  
C) Almacenar todos los registros en S3 Intelligent-Tiering desde el día 1  
D) Almacenar en S3 Standard durante 7 días; transición a S3 Glacier Instant Retrieval después de 7 días; transición a S3 Glacier Deep Archive después de 365 días

**Pista 1**: "Disponible en 30 minutos" descarta qué clase de almacenamiento.

**Pista 2**: Deep Archive tarda 12 horas en recuperar: no cumple el requisito de 30 minutos para los días 7-365.

**Pista 3**: Después de 365 días, el tiempo de recuperación no importa (nunca se accede), por lo que aplica la opción más barata.

**Respuesta**: D

**Explicación**: S3 Standard durante 7 días gestiona el acceso frecuente. Glacier Instant Retrieval proporciona acceso en milisegundos para los días 7-365, cumpliendo el requisito de 30 minutos a un coste significativamente menor que Standard-IA. Después de 365 días, Glacier Deep Archive es la opción más barata para datos a los que nunca se accede.

**¿Por qué no A?** Glacier Deep Archive tarda 12 horas en recuperar: no cumple el requisito de "disponibilidad en 30 minutos" para los días 7-365.

**¿Por qué no B?** Standard-IA después de 7 días funciona, pero Glacier Instant Retrieval es significativamente más barato. Standard-IA es más apropiado cuando necesitas recuperación instantánea pero el acceso es infrecuente: aquí, los datos raramente se acceden después del día 7, lo que hace que Glacier sea más rentable.

**¿Por qué no C?** Intelligent-Tiering tiene una tarifa de monitorización por objeto y podría no mover los registros a los niveles de archivo tan agresivamente como las reglas de ciclo de vida explícitas. Para un gran volumen de registros con un patrón de acceso predecible, las reglas de ciclo de vida explícitas son más rentables.

*Dominio SAA-C03: Diseño de Arquitecturas Optimizadas en Coste — Tarea 4.1*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus tiene tres tipos de datos en S3 con características diferentes:

- Fotos de restaurantes: cargadas una vez, accedidas muchas veces por los clientes, nunca eliminadas
- Recibos de pedidos: accedidos por los clientes en el primer mes, conservados 7 años por motivos fiscales
- Exportaciones de analítica: generadas diariamente, analizadas en la semana siguiente, conservadas 2 años

Diseña una política de ciclo de vida para cada uno. Para las fotos de restaurantes, ¿tendría sentido Intelligent-Tiering? Para los recibos de pedidos, ¿qué clase de almacenamiento cubre la ventana de 1 mes a 7 años? Para las exportaciones de analítica, ¿cómo estructurarías el bucket para aplicar diferentes políticas a diferentes prefijos?

*(No hay una única respuesta correcta. El objetivo es practicar la selección de niveles de almacenamiento para datos del mundo real.)*

## Escena Poscreditos

Tom implementó las políticas de ciclo de vida.

La factura de S3 bajó de 847 a 198 USD el mes siguiente.

Lo imprimió y lo dejó en el escritorio de Maya sin decir nada.

Maya lo miró. Luego miró la fecha. Luego miró a Tom.

"Tres semanas," dijo.

"Una tarde para diseñar las políticas," dijo él. "Una hora para implementarlas. Tres semanas para ver el primer ciclo de facturación completo."

"Reducción de dos tercios en los costes de S3."

"Para datos a los que no accedemos."

Maya miró los números otra vez.

"Tom," dijo, "quiero que hagas esta revisión para cada servicio de AWS que usamos. Almacenamiento, cómputo, redes. Encuentra el desperdicio."

Él ya estaba de vuelta en su escritorio.

"Empecé la semana pasada," dijo.

En el siguiente capítulo: el nivel de base de datos tiene su propia versión de esta conversación, y Aurora es la respuesta que Tom no esperaba que le gustara.
