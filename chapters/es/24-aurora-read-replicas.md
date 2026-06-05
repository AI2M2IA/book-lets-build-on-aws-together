# Capítulo 24: La Base de Datos que Crece Contigo

La revisión de costes de Tom había encontrado algo inesperado en el nivel de base de datos.

Nimbus ejecutaba RDS PostgreSQL: Multi-AZ, instancia db.r6g.large. 340 USD/mes.

"Eso parece alto," dijo Tom. "Pero no sé con qué compararlo."

Leo mostró las métricas de rendimiento. La CPU de la base de datos llegaba al 85% durante la hora punta de la cena del viernes. Las consultas de lectura se acumulaban. La latencia P95 de las consultas se había duplicado en seis meses.

"La base de datos es el cuello de botella," dijo. "El tráfico ha crecido. La base de datos no ha escalado con él."

"¿Podemos simplemente hacer la instancia más grande?" preguntó Maya.

"Sí," dijo Leo. "Eso es escalado vertical. Pasamos de r6g.large a r6g.xlarge. Más CPU, más memoria. Costará más y nos dará tiempo."

"Pero no resuelve el problema subyacente," dijo Priya. "En algún momento llegaremos a la instancia más grande y necesitaremos un enfoque diferente."

"Hay dos enfoques," dijo Leo. "Réplicas de lectura o Aurora."

"¿Cuál es la diferencia?"

Una buena pregunta. El resto de este capítulo es la respuesta.

Imagina una biblioteca concurrida con un solo bibliotecario que tanto registra devoluciones de libros como responde preguntas de los usuarios. Cuando la biblioteca se vuelve popular, se forma una cola. La solución: contratar más bibliotecarios, pero solo para responder preguntas. El registro sigue pasando por el mostrador original. Eso es una réplica de lectura: capacidad adicional que gestiona las lecturas, mientras todas las escrituras siguen pasando por la única fuente autorizada. Aurora va un paso más allá, rediseñando el propio sistema de estanterías para que cada bibliotecario comparta las mismas estanterías y siempre vea los mismos libros, sin demora.

**Réplicas de Lectura: Distribuyendo el Tráfico de Lectura**

La mayoría de las aplicaciones web leen datos con mucha más frecuencia de la que los escriben. Un cliente que navega por el menú realiza docenas de consultas SELECT. Hacer un pedido realiza unas pocas consultas INSERT/UPDATE. La proporción es típicamente 10:1 o mayor.

Una **réplica de lectura** es una instancia RDS adicional que recibe una copia de todas las escrituras de la primaria y pone esas escrituras a disposición para consultas SELECT.

Cómo funciona:

1. Las escrituras de la aplicación (INSERT, UPDATE, DELETE) van a la base de datos primaria
2. La primaria replica esos cambios de forma asíncrona a las réplicas de lectura
3. Las lecturas de la aplicación (SELECT) se distribuyen entre las réplicas de lectura
4. Las réplicas de lectura comparten la carga: cada una gestiona una fracción del tráfico total de lectura

El resultado: la base de datos primaria solo gestiona escrituras (y opcionalmente algunas lecturas). Las réplicas de lectura gestionan la carga de lectura. Para una proporción de lectura/escritura de 10:1, añadir una réplica de lectura reduce aproximadamente a la mitad la carga total de la primaria.

**Limitación importante**: La replicación es **asíncrona**. Hay un retraso de replicación, típicamente milisegundos, pero pueden ser segundos bajo carga. Una lectura de una réplica puede mostrar datos ligeramente desactualizados respecto a la primaria. Para la mayoría de las lecturas (navegar por el menú, ver el historial de pedidos), esto es aceptable. Para "¿acaba de procesarse mi pedido?", leer de la primaria.

**Réplicas de Lectura: Los Detalles**

- Puedes tener hasta 5 réplicas de lectura por instancia RDS primaria
- Las réplicas de lectura pueden estar en la misma región o en una región diferente (réplicas entre regiones)
- Las réplicas de lectura pueden tener a su vez réplicas de lectura (encadenamiento)
- Las réplicas de lectura son endpoints separados: tu aplicación debe dirigir las lecturas al endpoint de la réplica
- Las réplicas de lectura pueden promoverse a bases de datos independientes (útil para recuperación ante desastres)

Para Nimbus, Leo añadió una réplica de lectura. Actualizó la aplicación para:

- Operaciones de escritura → endpoint primario
- Navegación por el menú, historial de pedidos → endpoint de la réplica

La CPU en la primaria bajó del 85% al 41% en el pico.

Tom miró el coste: una réplica de lectura del mismo tipo de instancia cuesta lo mismo que la primaria. De 340 USD/mes a 680 USD/mes.

"Hemos duplicado el coste para aproximadamente reducir a la mitad la carga," dijo Tom.

"Sí. Pero la alternativa era pasar a un tipo de instancia más grande, que también costaría más y no distribuiría la carga de lectura."

Tom hizo los cálculos. Asintió, a regañadientes.

"¿Qué es Aurora?" preguntó.

**Amazon Aurora: Repensar el Motor de Base de Datos**

Aurora es el motor de base de datos relacional propio de AWS, compatible con MySQL y PostgreSQL. Fue diseñado desde cero para cargas de trabajo en la nube, reimaginando cómo funciona la capa de almacenamiento de una base de datos relacional.

En una configuración RDS tradicional (MySQL, PostgreSQL), el almacenamiento y el cómputo están estrechamente acoplados. El motor de base de datos gestiona los archivos de datos. La replicación copia los datos de la primaria a la réplica. La réplica debe rehacer cada operación de escritura.

Aurora separa el almacenamiento del cómputo. Utiliza una capa de almacenamiento distribuida y tolerante a fallos que replica los datos automáticamente en tres Zonas de Disponibilidad en seis copias. La capa de cómputo (las instancias de base de datos) se asienta sobre esta capa de almacenamiento.

**Lo que esto cambia**:

**Réplicas de lectura**: Las réplicas de Aurora no necesitan replicar datos, ya comparten la misma capa de almacenamiento. Esto significa:

- Hasta 15 réplicas de lectura (frente a 5 para RDS estándar)
- El retraso de replicación es típicamente inferior a 100 milisegundos (frente a segundos para RDS bajo carga)
- Las réplicas pueden promoverse a primaria en menos de 30 segundos (frente a minutos)

**Conmutación por error**: Como las réplicas comparten el almacenamiento, la conmutación por error es mucho más rápida: la promoción no implica transferencia de datos, solo redirigir las escrituras.

**Almacenamiento**: Aurora escala automáticamente el almacenamiento en incrementos de 10 GB, hasta 128 TB. Nunca aprovisionas almacenamiento con antelación.

**Rendimiento**: Aurora afirma 5 veces el rendimiento de MySQL estándar y 3 veces el de PostgreSQL estándar para tipos de instancia equivalentes.

**Precios de Aurora: La Pregunta de Tom**

"¿Cuánto cuesta?" preguntó Tom.

Los precios de Aurora son diferentes a los de RDS:

**Precios de instancia**: Similar a los precios de instancia de RDS por tipo.

**Precios de almacenamiento**: 0,10 USD por GB al mes (pagas por lo que almacenas, escalado automáticamente).

**Precios de E/S**: Aurora cobra por solicitud de E/S (lectura/escritura en el almacenamiento). Esto puede ser significativo para cargas de trabajo con muchas escrituras.

"Espera," dijo Tom. "¿Pagamos por E/S por separado?"

"Aurora Serverless v2 y Aurora I/O-Optimized cambian este modelo de precios," dijo Leo. "Aurora I/O-Optimized no cobra tarifa de E/S, pero tiene un precio de almacenamiento e instancia más alto. Mejor para cargas de trabajo con muchas E/S."

Tom analizó la contrapartida. Para Nimbus, que tenía muchas lecturas (muchas consultas de menú, pocas escrituras), Aurora I/O-Optimized podría costar más. Los precios estándar de Aurora podrían ser apropiados.

Esta es una decisión de coste real que toman los ingenieros senior: necesitas conocer los patrones de E/S de tu carga de trabajo para elegir correctamente.

**Aurora Serverless: Escalado Sin Pensar en Instancias**

**Aurora Serverless v2** es una configuración que escala automáticamente la capacidad de cómputo basándose en la carga real de la base de datos. En lugar de elegir un tamaño de instancia fijo (db.r6g.large), estableces una capacidad mínima y máxima en Aurora Capacity Units (ACU).

Aurora Serverless v2:

- Escala en segundos cuando aumenta la carga
- Escala hacia abajo casi a cero durante los períodos de inactividad
- Coste: 0,12 USD por ACU-hora (más almacenamiento y E/S)

Para cargas de trabajo con tráfico variable, como los picos del viernes de Nimbus frente a la tranquilidad del lunes por la mañana, Serverless v2 reduce los costes durante los períodos fuera de pico y gestiona los picos sin aprovisionamiento previo.

"Así que durante el pico del viernes," dijo Leo, "Aurora escala automáticamente. El domingo por la mañana, cuando casi no tenemos tráfico, escala de vuelta al mínimo."

"Y solo pagamos por la capacidad que estamos usando," dijo Tom.

"Correcto."

Tom tenía la expresión de alguien que había encontrado exactamente lo que buscaba.

**Aurora Global Database: Lecturas Multi-Región**

**Aurora Global Database** extiende Aurora a múltiples regiones de AWS:

- **Una región primaria** gestiona todas las escrituras
- **Hasta cinco regiones secundarias** sirven lecturas con un retraso de replicación típico de <1 segundo
- Las regiones secundarias pueden promoverse a primaria en menos de 1 minuto (para escenarios de recuperación ante desastres)

Para la expansión global de Nimbus, Aurora Global Database permitiría a un socio restaurador en Londres consultar su menú local desde la réplica de lectura de la UE, mientras todos los pedidos (escrituras) siguen pasando por la primaria de EE. UU.

**RDS vs Aurora: Cuándo Elegir Cada Uno**

| Factor              | RDS (PostgreSQL/MySQL)          | Aurora                                                          |
|---------------------|---------------------------------|-----------------------------------------------------------------|
| Coste               | Menor para cargas pequeñas      | Mayor base, pero escala mejor                                   |
| Compatibilidad      | Total                           | Compatible con MySQL/PostgreSQL (con diferencias menores)       |
| Máx. réplicas       | 5                               | 15                                                              |
| Retraso de réplica  | Puede ser segundos              | Generalmente <100 ms                                            |
| Almacenamiento      | Aprovisionamiento fijo          | Autoescalado hasta 128 TB                                       |
| Tiempo de failover  | 60-120 segundos                 | <30 segundos                                                    |
| Opción sin servidor | Limitada                        | Aurora Serverless v2                                            |
| Mejor para          | Cargas estables y predecibles   | Tráfico variable, alto volumen de lectura, failover rápido      |

## Ventajas y Limitaciones

**Ventajas de Aurora**:

- Failover significativamente más rápido que RDS estándar
- Hasta 15 réplicas de lectura con retraso mínimo
- Almacenamiento de autoescalado
- Serverless v2 para cargas de trabajo variables
- Global Database para despliegue multi-región

**Limitaciones de Aurora**:

- Mayor coste para cargas pequeñas y estables
- Los precios de E/S pueden ser significativos para cargas con muchas escrituras (usa I/O-Optimized para esto)
- Las pequeñas diferencias de compatibilidad con MySQL/PostgreSQL pueden requerir cambios en el código
- Los arranques en frío de Serverless v2 (desde casi cero) pueden causar picos de latencia

## Resumen

- Las **réplicas de lectura** distribuyen el tráfico de lectura de la primaria. Replicación asíncrona: el ligero retraso es aceptable para la mayoría de las lecturas.
- **Aurora** reimagina la capa de almacenamiento: distribuida, compartida entre réplicas, de autoescalado.
- Aurora ofrece: 15 réplicas de lectura, retraso de réplica <100 ms, failover <30 s, almacenamiento de autoescalado hasta 128 TB.
- **Aurora Serverless v2**: escala automáticamente la capacidad de cómputo según la carga. Bueno para tráfico variable.
- **Aurora Global Database**: primaria en una región, réplicas de lectura en hasta cinco regiones.
- Elige RDS para cargas más pequeñas, estables y predecibles. Elige Aurora cuando necesites escala, failover rápido o gestión de tráfico variable.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas de Alto Rendimiento (Dominio 3, Tarea 3.3)*

- **Réplica de Aurora vs réplica de lectura de RDS**: Las réplicas de Aurora comparten almacenamiento (retraso casi nulo, failover <30 s). Las réplicas de lectura de RDS replican datos (retraso posible, minutos para failover).
- **Aurora Serverless v2**: "escalar automáticamente la capacidad de la base de datos," "tráfico de base de datos impredecible o puntual," "escalar a cero" → Aurora Serverless v2.
- **Aurora Global Database**: "base de datos multi-región," "lectura desde la UE con baja latencia desde la primaria de EE. UU.," "RTO < 1 minuto para failover regional" → Aurora Global Database.
- **Tiempos de failover**: Aurora < 30 segundos. RDS Multi-AZ 60-120 segundos. Conoce ambos.
- **Aurora I/O-Optimized**: Mayor coste de almacenamiento e instancia, sin cargo de E/S por unidad. Úsalo cuando los costes de E/S dominan (muchas escrituras). Aurora estándar: menor coste de almacenamiento, paga por E/S. Úsalo para lecturas intensivas.
- **Aurora Backtrack**: Rebobina la base de datos a un punto específico en el tiempo sin restaurar desde una instantánea de respaldo. Disponible solo para Aurora compatible con MySQL. Señal del examen: "se eliminaron datos accidentalmente, se necesita recuperar rápidamente sin restaurar un respaldo completo."

## Ejercicios

**Ejercicio 1 — Recordatorio**

Explica la diferencia entre Aurora y las réplicas de lectura estándar de RDS. ¿Por qué el retraso de replicación de Aurora es típicamente menor?

*(Pista: La diferencia clave es almacenamiento compartido frente a replicación de datos. Piensa en lo que cada réplica debe hacer cuando llega una escritura.)*

**Ejercicio 2 — Práctica de Examen**

*Escenario*: La base de datos MySQL de una plataforma de redes sociales experimenta alta latencia de lectura debido al aumento del tráfico. La aplicación tiene muchas lecturas (95% lecturas, 5% escrituras). El equipo necesita que la latencia de lectura sea consistente, incluso durante los picos de tráfico. Necesitan failover automático con tiempo de inactividad mínimo (objetivo RTO < 30 segundos). El volumen de datos crece de forma impredecible.

¿Qué solución de base de datos cumple MEJOR con estos requisitos?

A) RDS MySQL Multi-AZ con cinco réplicas de lectura  
B) Aurora MySQL con réplicas de Aurora y Aurora Serverless v2  
C) RDS MySQL con un tipo de instancia más grande (escalado vertical)  
D) DynamoDB con DynamoDB DAX para caché de lectura

**Pista 1**: "RTO < 30 segundos": ¿qué servicio logra esto? Comprueba los tiempos de failover de cada opción.

**Pista 2**: "Latencia de lectura consistente durante los picos": ¿qué réplicas del servicio tienen retraso casi nulo frente a potenciales segundos de retraso?

**Pista 3**: "Volumen de datos que crece de forma impredecible": ¿qué servicio autoescala el almacenamiento?

**Respuesta**: B

**Explicación**: Aurora MySQL con réplicas de Aurora proporciona un retraso de replicación casi nulo (milisegundos, no segundos) para un rendimiento de lectura consistente bajo carga. Aurora Serverless v2 autoescala el cómputo durante los picos de tráfico sin sobre-aprovisionamiento. El almacenamiento de Aurora autoescala a medida que crecen los datos. El failover de Aurora (promoción de una réplica) se completa en menos de 30 segundos, cumpliendo el requisito de RTO.

**¿Por qué no A?** El failover de RDS Multi-AZ tarda 60-120 segundos: no cumple el RTO < 30 segundos. El retraso de la réplica de lectura estándar de RDS puede alcanzar segundos bajo carga: la latencia de lectura "consistente" es más difícil de garantizar.

**¿Por qué no C?** El escalado vertical (instancia más grande) aumenta la capacidad, pero no distribuye la carga de lectura. La base de datos sigue siendo un único punto de fallo para las lecturas.

**¿Por qué no D?** DynamoDB es NoSQL: migrar de MySQL a DynamoDB requiere rediseñar el modelo de datos y las consultas de la aplicación, lo cual va mucho más allá del alcance de esta tarea de mejora de rendimiento.

*Dominio SAA-C03: Diseño de Arquitecturas de Alto Rendimiento — Tarea 3.3*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus está diseñando una expansión global. Quiere que los socios restauradores de la Costa Oeste, en Alemania y en Australia vean rápidamente sus propios datos de pedidos, sin latencia entre regiones. Sin embargo, todas las escrituras deben pasar por una única primaria en US-East para mantener la consistencia.

Diseña la arquitectura de base de datos usando Aurora. ¿Cómo estructurarías la Global Database? ¿Qué ocurre si la primaria de US-East se cae? ¿Cómo gestionarías el proceso de promoción?

*(No hay una única respuesta correcta. El objetivo es practicar el diseño de base de datos multi-región.)*

## Escena Poscreditos

Leo migró a Aurora con Serverless v2.

Llegó el pico del viernes y pasó. La CPU nunca superó el 60%. La latencia de las consultas se mantuvo consistente. Aurora había escalado para gestionar la carga automáticamente, y luego volvió a escalar después del pico.

"¿Cuánto ha costado esto comparado con el viernes pasado?" preguntó Tom el lunes por la mañana.

Leo abrió el explorador de facturación. "El viernes el pico fue de 0,89 USD/hora. El sábado por la mañana fue de 0,11 USD/hora."

Tom no dijo nada.

"La configuración anterior era un fijo de 0,47 USD/hora independientemente de la carga," añadió Leo.

"Entonces pagamos más durante el pico que antes," dijo Tom.

"Sí. Pero significativamente menos fuera del pico. El coste neto durante la semana es menor."

Tom calculó. Luego asintió.

"Hay una lección aquí," dijo. "La pregunta correcta no es '¿es esto más barato?' Es '¿es esto más barato para nuestro patrón de uso real?'"

"Eso," dijo Priya desde el otro lado de la sala, "es el instinto de un ingeniero senior."

Tom pareció levemente alarmado al ser descrito de esa manera.

En el siguiente capítulo: cuando tu red es el cuello de botella, y por qué una autopista privada puede valer el peaje.
