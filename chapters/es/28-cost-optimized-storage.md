# Capítulo 28: La Sorpresa de la Factura de Almacenamiento

Tom había enviado el Savings Plan para EC2. La siguiente línea de la factura era S3: 198 USD/mes (bajado de 847 USD después de los cambios en las políticas de ciclo de vida del capítulo 23).

Luego miró EBS: 440 USD/mes.

"Eso parece alto," dijo.

Leo abrió la lista de volúmenes EBS. Había 47 volúmenes EBS adjuntos a instancias. Y luego había otros 23 volúmenes no adjuntos a ninguna instancia.

"Estos 23 volúmenes," dijo Tom. "¿Qué son?"

Leo los buscó. Todos estaban desconectados: ninguna instancia los usaba actualmente. La mayoría habían sido creados a partir de instantáneas para fines de depuración. Algunos provenían de instancias que habían sido terminadas pero cuyos volúmenes no habían sido eliminados.

"Estamos pagando 0,10 USD por GB al mes por almacenamiento que nadie está leyendo," dijo Leo.

Tom miró el total: 2,3 TB de volúmenes no adjuntos.

"Doscientos treinta dólares al mes por almacenamiento que no estamos usando," dijo Tom. "¿Cuánto tiempo lleva esto ocurriendo?"

Leo comprobó las fechas de creación. El volumen más antiguo era de hace 16 meses.

"Tres mil seiscientos ochenta dólares," dijo Tom en voz baja. "Hemos gastado tres mil seiscientos dólares en almacenamiento al que nadie accede."

Eliminó los volúmenes no adjuntos. El mes siguiente, la factura de EBS bajó a 210 USD.

**La Auditoría de Costes de Almacenamiento**

El descubrimiento de EBS de Tom era un síntoma de un patrón más amplio: los costes de almacenamiento se acumulan de forma invisible. A diferencia del cómputo (te das cuenta cuando hay 47 servidores en ejecución), el almacenamiento se suma silenciosamente.

Piensa en ello como el alquiler de una unidad de almacenamiento. Alquilar una unidad es obvio en el extracto de la tarjeta de crédito. Pero si alquilas una segunda unidad para un proyecto, luego una tercera para unos muebles viejos, y nunca vuelves a comprobar qué hay dentro, los cargos siguen apareciendo cada mes, en silencio, mucho después de que hayas olvidado qué estás almacenando. El almacenamiento en la nube funciona igual: los bytes están ahí, la factura llega, y nadie lo cuestiona hasta que alguien finalmente abre la puerta y encuentra que está llena de cosas que nadie necesita.

Una auditoría exhaustiva de costes de almacenamiento examina:

**S3**:

- ¿Hay políticas de ciclo de vida en vigor para todos los buckets?
- ¿Hay instantáneas antiguas (RDS, EBS) en S3?
- ¿Es apropiado Intelligent-Tiering para algún bucket con patrones de acceso inciertos?
- ¿Hay objetos versionados que crean múltiples copias a las que nunca se accede?

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

La solución: reglas de ciclo de vida para las versiones no actuales.

```
Caducar versiones no actuales después de 30 días
Eliminar cargas multiparte fallidas después de 7 días
```

Tom aplicó estas reglas a todos los buckets versionados. El mes siguiente, el almacenamiento de S3 disminuyó un 18%.

**EBS: Dimensionamiento Correcto y la Actualización a gp3**

Los precios de los volúmenes EBS tienen dos componentes:

1. Almacenamiento (por GB al mes)
2. IOPS y rendimiento aprovisionados (si estás en io1/io2 o pagando por rendimiento gp3 adicional)

**La oportunidad gp3**: En el capítulo 6, señalamos que gp3 es el predeterminado actual y es más barato que gp2. Si Nimbus tenía volúmenes creados antes de que gp3 estuviera disponible (se lanzó en diciembre de 2020), podrían seguir siendo gp2.

Tom encontró 12 volúmenes gp2 que totalizaban 1.200 GB. Migrar a gp3 ahorró un 20% en esos volúmenes de inmediato, sin degradación del rendimiento.

**IOPS y rendimiento**: Los volúmenes gp3 vienen con 3.000 IOPS y 125 MB/s de rendimiento de forma predeterminada, sin cargo adicional. Puedes aprovisionar más si tu carga de trabajo lo necesita. Revisa si el rendimiento aprovisionado está siendo realmente utilizado.

Tom encontró dos volúmenes gp3 con 10.000 IOPS aprovisionados. Comprobó las métricas de CloudWatch: las IOPS promedio reales eran 1.200. Redujo las IOPS aprovisionados a 4.000 (un margen de seguridad sobre el pico real).

Ahorro mensual: 68 USD.

**Ciclo de vida de instantáneas**: Las instantáneas de EBS son incrementales (cada instantánea solo almacena los cambios desde la anterior), pero se acumulan. Todavía existían instantáneas antiguas de los primeros días de Nimbus. Tom conservó 30 días de instantáneas diarias y eliminó el resto.

**EFS: Clases de Almacenamiento**

Amazon EFS tiene sus propias clases de almacenamiento:

- **EFS Standard**: Para archivos a los que se accede frecuentemente. Mayor coste.
- **EFS Infrequent Access (IA)**: Para archivos a los que no se ha accedido en 30 días. Un 92% más barato que Standard.
- **EFS Archive**: Para archivos a los que no se ha accedido en 90 días. Incluso más barato que IA.

**EFS Intelligent-Tiering**: Mueve automáticamente los archivos entre clases de almacenamiento basándose en los patrones de acceso.

Tom habilitó Intelligent-Tiering en el volumen EFS. Seis semanas después, el 68% de los archivos se había movido a Acceso Infrecuente. El coste mensual de EFS bajó de 89 USD a 31 USD.

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

**El Coste de la Negligencia**

Tom creó una hoja de cálculo. Calculó cuánto había gastado Nimbus en:

- Volúmenes EBS no adjuntos (16 meses): 3.680 USD
- Instantáneas antiguas de S3 (descubiertas y eliminadas): 890 USD
- IOPS aprovisionados innecesarios: 816 USD
- Ahorro de la migración de gp2 a gp3 (proyectado, si se hubiera hecho antes): 2.160 USD en 18 meses
- Versiones de S3 no actuales acumulándose: 1.340 USD

Total de desperdicios identificados: aproximadamente 8.800 USD en 18 meses.

"Ocho mil ochocientos dólares," dijo Maya.

"Por negligencia," dijo Tom. "No por tomar decisiones arquitectónicas incorrectas. Por no limpiar."

"¿Cuál es la solución sistemática?"

"Auditorías regulares," dijo Priya. "Revisiones mensuales de Cost Explorer. AWS Trusted Advisor señala automáticamente los volúmenes no adjuntos y los recursos inactivos. Automatiza la limpieza de los patrones de desperdicio conocidos: eliminar instantáneas más antiguas de N días, alertar sobre volúmenes EBS no adjuntos, caducar las versiones antiguas de S3."

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

## Resumen

- **Los costes de almacenamiento se acumulan de forma invisible**: las auditorías regulares son esenciales.
- Los **volúmenes EBS no adjuntos** son una fuente común de desperdicio. Elimínalos (o automatiza la eliminación cuando las instancias terminen).
- **Dimensionamiento correcto de EBS**: Migra gp2 a gp3 (típicamente un 20% de ahorro). Elimina los IOPS aprovisionados en exceso.
- **Versionado de S3**: Habilita reglas de ciclo de vida para las versiones no actuales para evitar pagar por un historial de versiones ilimitado.
- **EFS Intelligent-Tiering**: Mueve automáticamente los archivos a niveles de menor coste según la frecuencia de acceso.
- **Etiquetas de asignación de costes**: Etiqueta los recursos con metadatos de equipo/proyecto/entorno para visibilidad y responsabilidad de costes.
- **AWS Budgets**: Alertas proactivas cuando los costes se acercan a los umbrales. Nunca más ser sorprendido por la factura mensual.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas Optimizadas en Coste (Dominio 4, Tarea 4.1)*

- **Etiquetas de asignación de costes**: Habilita las etiquetas definidas por el usuario para la asignación de costes en la consola de facturación; luego etiqueta los recursos. Cost Explorer muestra desgloses por etiqueta. Escenario del examen: "identificar qué departamento genera más costes de S3" → etiquetas de asignación de costes.
- **AWS Trusted Advisor**: Identifica instancias EC2 infrautilizadas, volúmenes EBS no adjuntos, balanceadores de carga inactivos y otros desperdicios. Comprobaciones básicas gratuitas; comprobaciones completas requieren soporte Business/Enterprise.
- **Componentes de costes de EBS**: Almacenamiento (por GB), IOPS aprovisionados (si io1/io2 o gp3 adicional), rendimiento (si gp3 adicional). Conoce qué componentes se pueden dimensionar correctamente.
- **Costes de versionado de S3**: Las versiones no actuales se almacenan y cobran a la misma tarifa que las versiones actuales. Las reglas de ciclo de vida que caducan las versiones no actuales son fundamentales para el control de costes en los buckets versionados.
- **AWS Compute Optimizer**: Analiza la utilización de EC2 y recomienda tipos de instancias correctamente dimensionados. Señal del examen: "reducir los costes de EC2 seleccionando el tipo de instancia correcto" → Compute Optimizer.
- **AWS Cost Anomaly Detection**: Usa ML para detectar patrones de gasto inusuales. Señal del examen: "detectar automáticamente aumentos de costes inesperados" → Cost Anomaly Detection.

## Ejercicios

**Ejercicio 1 — Recordatorio**

Explica por qué los volúmenes EBS no adjuntos generan costes aunque ninguna instancia EC2 los esté usando. ¿Qué proceso deben seguir los ingenieros al terminar una instancia EC2 para evitar este desperdicio?

*(Pista: Los volúmenes EBS almacenan datos en disco físico, y ese disco cuesta dinero independientemente de si se está leyendo.)*

**Ejercicio 2 — Práctica de Examen**

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

## Escena Poscreditos

Tom publicó los hallazgos de la auditoría de costes al equipo.

Desperdicio identificado: 8.800 USD en 18 meses.
Ahorro anual esperado de los cambios implementados: 6.200 USD.

Luego añadió una línea al final: "Esto no incluye los ahorros de los Savings Plans (14.200 USD/año) ni las políticas de ciclo de vida de S3 (7.800 USD/año). Impacto anual total de la optimización: aproximadamente 28.200 USD."

Maya lo leyó dos veces.

"Eso es casi el salario de un ingeniero junior," dijo.

"En desperdicio," confirmó Tom.

"O," dijo Leo, "es la prueba de que hacer estas optimizaciones antes habría financiado a ese ingeniero junior."

Tom lo miró.

"Esa es la forma correcta de pensarlo," dijo. "La optimización de costes no se trata de recortar. Se trata de no pagar por cosas que no crean valor."

Maya pineó el documento en el wiki de la empresa.

En el siguiente capítulo: el nivel de base de datos recibe el mismo tratamiento, y Tom descubre el único lugar en el que en realidad estaba invirtiendo menos de lo necesario.
