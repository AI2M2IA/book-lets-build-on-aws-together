# Capítulo 29: La Factura de la Base de Datos

Tom imprimió los gráficos de uso. Catorce páginas. Las extendió sobre su escritorio antes de confiar en sí mismo para leer los números. Mejor verlo todo de una vez que encontrar sorpresas a mitad de página.

La auditoría de almacenamiento había encontrado $6.700 en residuos acumulados — no por malas decisiones, sino por falta de atención. Volúmenes no conectados, instantáneas antiguas, historiales de versiones que nadie había dicho a S3 que limpiara, cargas multiparte incompletas que habían estado acumulándose silenciosamente durante meses. Tom lo había arreglado todo, había implementado reglas de limpieza automática y había pasado a la siguiente pestaña de la hoja de cálculo. El nivel de datos era el mayor desconocido restante: bases de datos relacionales, tablas NoSQL, nodos de caché, almacenamiento de copia de seguridad y una línea de coste que lo había estado molestando durante semanas.

Las partidas del nivel de datos en revisión:

Clúster Aurora: 647 USD/mes.
Réplicas de lectura de RDS PostgreSQL heredadas: 340 USD/mes.
Tablas DynamoDB: 340 USD/mes.
ElastiCache: 185 USD/mes.
Instantáneas manuales de Aurora: 87 USD/mes.

Total del nivel de datos en revisión: 1.599 USD/mes.

«Déjame entender cada uno antes de decidir nada», dijo. «Porque la base de datos no es el lugar para ahorrar dinero recortando gastos.»

Era sabio. Una mala configuración de la base de datos que provoque pérdida de datos o degradación del rendimiento cuesta mucho más que el ahorro.

Piensa en una base de datos como el motor de un coche. Puedes ahorrar dinero en un coche cambiando a combustible más barato, ajustando la presión de los neumáticos y eliminando peso innecesario del maletero. Pero si intentas ahorrar dinero saltándote un cambio de aceite, arriesgas que el motor se agarrote — y un motor agarrotado cuesta mucho más que cualquier ahorro de combustible. La auditoría que Tom está a punto de realizar sigue la misma lógica: encuentra el residuo en el maletero y el depósito de combustible, y deja el motor en paz hasta que sepas exactamente lo que estás haciendo.

**Comprender primero tu carga de trabajo de base de datos**

La optimización de costes en bases de datos requiere comprender la carga de trabajo antes de tocar nada. Tom había aprendido esto de un casi-accidente seis meses antes: había empezado a reducir el tamaño de la instancia de base de datos basándose en la utilización media de CPU — 18% — sin mirar primero los números p95. Un compañero le pidió que revisara las métricas de CloudWatch con más cuidado. El p95 de CPU era del 61%, y durante un viernes de cena especialmente concurrido, había llegado al 84%.

«La media no te dice lo que pasa en el pico», dijo Tom, cuando se lo contó a Priya. «Si hubiera ajustado el tamaño a la media, habríamos estado limitados los viernes por la noche.»

«Por eso miras p95, no la media», dijo Priya. «Siempre.»

Ese principio se extendía más allá de la CPU. Tom tenía ahora una lista de verificación estándar previa a la auditoría:

- CPU: p95, no la media
- Memoria: FreeableMemory (en bytes absolutos, no en porcentaje) — ¿qué tan cerca estamos del límite?
- Conexiones: máximo de DatabaseConnections durante los últimos 30 días — ¿qué tan cerca hemos llegado al límite de conexiones?
- Ratio lectura/escritura: determina si las réplicas de lectura están justificando su coste
- Tasa de crecimiento del almacenamiento: ¿cuántos GB al mes estamos añadiendo?
- Retraso de replicación (para réplicas): ¿está la réplica al día?

Preguntas clave:

- ¿Cuál es la utilización media y pico de CPU?
- ¿Cuál es el ratio lectura/escritura?
- ¿El almacenamiento está creciendo, estable o disminuyendo?
- ¿Se están utilizando las réplicas de lectura?
- ¿La instancia está infraaprovisionada (causando ralentizaciones) o sobreaprovisionada (pagando por capacidad inactiva)?

Tom extrajo las métricas de CloudWatch para los tres servicios de bases de datos durante los 30 días anteriores:

**Clúster Aurora**:

- CPU media: 18% (p95: 61%; pico: 84% los viernes por la noche)
- FreeableMemory: consistentemente por encima de 4 GB de los 8 GB disponibles. No es una preocupación.
- Ratio lectura/escritura: 14:1 (intensivo en lecturas)
- Almacenamiento: 180 GB (creciendo ~5 GB/mes)
- Máximo de DatabaseConnections: 312 de 1.000 disponibles. Cómodo.

**Réplicas de lectura (RDS PostgreSQL, separadas de Aurora)**:

- Eran dos réplicas de lectura de RDS heredadas creadas antes de la migración a Aurora, todavía en ejecución.
- Conexiones medias a cada una: 2 al día. CPU media: 3%.
- FreeableMemory: 7,2 GB de 8 GB disponibles. Las instancias estaban casi inactivas.

«¿Por qué siguen ejecutándose?» preguntó Tom.

«Ya las había desplegado — ah», dijo Leo. Miró las fechas de creación de la instancia. «Eran de respaldo durante la migración a Aurora. Nunca las eliminé.»

Ese momento — cuando algo caro ha estado ejecutándose durante meses sin ser utilizado — es familiar en los entornos en la nube. Leo había creado las réplicas como red de seguridad. La red de seguridad nunca había sido necesaria. Pero nadie había hecho la pregunta hasta ahora.

«¿Cuál es la situación del pool de conexiones?» preguntó Priya, inclinándose. «Antes de eliminarlas, ¿algún componente de la aplicación sigue enrutando lecturas allí?»

Tom comprobó los registros de conexiones. Las dos conexiones al día provenían de un script de monitorización que Priya había escrito hacía catorce meses — sondeaba todos los endpoints de bases de datos conocidos para verificar que estaban respondiendo. Las réplicas solo estaban siendo consultadas por el verificador de salud, no por ningún tráfico real de la aplicación.

«Elimínalas», dijo Maya.

Las réplicas fueron terminadas. Ahorro mensual: 340 USD.

**El casi-incidente del pool de conexiones**

Mientras tenía abiertas las métricas de conexiones, Tom realizó una comprobación más amplia en todos los endpoints de bases de datos. Lo que encontró le hizo detenerse.

El endpoint escritor de Aurora mostraba un máximo de DatabaseConnections de 312. Cómodo. Pero el endpoint lector contaba una historia diferente.

«El endpoint lector alcanzó 847 conexiones en tres viernes consecutivos por la noche», dijo Tom.

«¿Cuántas es el límite?» preguntó Priya.

«El límite para nuestra clase de instancia actual es 1.000. Llegamos a 847. Eso es el 85% del límite.»

«¿Y no lo notamos porque no teníamos alarma hasta el 90%?» preguntó Maya.

«No teníamos alarma en absoluto», dijo Tom. «No hay ninguna alarma de CloudWatch en las conexiones del endpoint lector. Solo lo encontré porque estaba mirando las métricas en bruto.»

Con 1.000 conexiones, la base de datos rechaza nuevas conexiones. Cualquier hilo de aplicación que intente adquirir una conexión de base de datos en ese momento lanza una excepción. Si esa excepción no se maneja con elegancia, el usuario ve un error 500.

«Estuvimos a treinta segundos de un incidente de un viernes por la noche», dijo Leo. «Tres veces seguidas.»

«¿Hemos pensado en lo que pasa cuando se supera ese umbral?» preguntó Priya.

«Los socios restauradores ven pedidos fallidos durante la afluencia de la cena», dijo Maya. «No es una preocupación teórica.»

Tom configuró inmediatamente una alarma de CloudWatch: alerta a 750 conexiones (75% del límite), página a 900 (90%). También implementó RDS Proxy para el endpoint lector — RDS Proxy agrupa y gestiona las conexiones de base de datos desde la capa de aplicación, lo que significa que cincuenta hilos de aplicación pueden compartir diez conexiones de base de datos. El proxy gestiona la multiplexación. La base de datos ve muchas menos conexiones incluso cuando la aplicación está bajo carga pesada.

«Para Aurora Serverless v2, RDS Proxy tiene un precio de 0,015 USD por ACU por hora, con un cargo mínimo de 8 ACU por proxy», dijo Tom. «Pero si una infracción del límite de conexiones causa aunque sea una interrupción parcial un viernes por la noche, el coste de reputación para Nimbus es órdenes de magnitud mayor.»

«¿Cuánto cuesta eso al mes?» se preguntó Tom a sí mismo, calculando el número. Su lector funciona con Serverless v2, así que el proxy factura contra el mínimo de 8 ACU: 0,015 × 8 × 730 = 87,60 USD/mes. Era un coste que estaba encantado de pagar.

Quizás te estés preguntando: si ya estamos ahorrando dinero con el escalado automático de Serverless v2, ¿por qué molestarse con las Instancias Reservadas para el nivel aprovisionado? La respuesta es que el escalado de Serverless v2 tiene un coste — pagas por ACU-hora tanto si lo planeaste como si no. Para los equipos que ejecutan configuraciones fijas de Aurora, el compromiso de RI convierte el coste variable en coste predecible. Para los equipos que ejecutan instancias aprovisionadas (no Serverless v2), esa distinción importa significativamente.

**Instancias Reservadas de RDS: Para los Niveles de Base de Datos Aprovisionados**

Al igual que EC2, RDS ofrece Instancias Reservadas para el uso comprometido.

Para los equipos que utilizan configuraciones de instancias fijas de Aurora (no Serverless v2), las Instancias Reservadas pueden ahorrar entre un 30 y un 60%. Así es como funciona el enfoque de RI aprovisionado: te comprometes a un tipo de instancia específico durante 1 o 3 años a cambio de un descuento significativo en la tarifa por hora.

A modo de ilustración: una instancia escritora db.r6g.large a 0,26 USD/hora bajo demanda cuesta 190 USD/mes. Una Instancia Reservada de 1 año para la misma la reduce a aproximadamente 108 USD/mes — ahorrando 82 USD/mes por instancia, o casi 1.000 USD al año por instancia de base de datos.

**Aurora Serverless v2 vs RI Estándar — El Punto de Equilibrio**

Tom calculó los números para su configuración específica de Aurora. La pregunta: ¿estaba proporcionando suficiente beneficio el escalado automático de Aurora Serverless v2, o sería más barata una instancia aprovisionada fija con un compromiso de Instancia Reservada?

Precios de Serverless v2: 0,12 USD por ACU-hora. Su clúster escalaba entre 0,5 ACU (inactivo) y 16 ACU (carga pico). Durante los 30 días anteriores, la media era de 4,2 ACU.

Coste mensual de Serverless v2: 4,2 ACU × 0,12 USD × 730 horas = 368 USD/mes para el escritor.

Comparación: una db.r6g.xlarge fija (su equivalente aprovisionado estimado, dimensionado para manejar la carga p95 entre semana) con una RI de 1 año: 0,52 USD/hora × 0,60 (descuento RI) × 730 = 228 USD/mes.

«La RI es más barata», dijo Leo.

«Para una carga fija, sí», dijo Tom. «Pero mira la diferencia. Nuestro período de poco tráfico — de 2 AM a 7 AM, de lunes a jueves — promedia 0,8 ACU. Con una instancia aprovisionada fija, estaríamos pagando muchas veces lo que usamos durante esas horas, simplemente sentada inactiva.»

«¿Y Serverless v2 se reduce para adaptarse?»

«A 0,5 ACU. El coste inactivo es una fracción de lo que pagaríamos por una instancia aprovisionada dimensionada para el pico.»

El cálculo del punto de equilibrio: Serverless v2 es más barato cuando tu ratio pico/base es superior a aproximadamente 4:1. Para Nimbus, con picos del viernes a 16 ACU y mínimos del lunes por la mañana a 0,8 ACU — una ratio de 20:1 — Serverless v2 era la elección correcta. Si su tráfico hubiera sido más consistente (digamos, 8 ACU ± 20%), una RI aprovisionada habría sido más barata.

«No se trata solo de qué número es menor este mes», dijo Tom. «Se trata de qué modelo maneja correctamente nuestro crecimiento. Si crecemos un 50% el próximo trimestre, Serverless v2 simplemente escala. Una RI aprovisionada necesitaría redimensionarse, y estaríamos pagando por capacidad de sobra no utilizada durante la transición.»

Tom trazó la comparación anual explícitamente para que el equipo pudiera seguir el razonamiento, no solo la conclusión.

**Coste mensual de Aurora: Serverless v2 vs RI aprovisionada**

La opción aprovisionada: una db.r6g.xlarge con una Instancia Reservada de 1 año. Coste: 0,52 USD/hora bajo demanda × 0,60 (descuento RI) × 730 horas = 228 USD/mes. Fijo, independientemente de la carga.

La opción Serverless v2: pagar por ACU-hora a 0,12 USD. Variable, siguiendo la carga real.

Tom extrajo 30 días de métricas ACU de Aurora Serverless v2 de CloudWatch y construyó una distribución:

- De 2 AM a 7 AM, lunes a jueves (poco tráfico): media de 0,8 ACU → 0,096 USD/hora
- De 7 AM a 11 AM, días laborables (moderado): media de 3,2 ACU → 0,384 USD/hora
- De 11 AM a 9 PM, días laborables (horas pico de negocio): media de 5,8 ACU → 0,696 USD/hora
- Viernes de 6 PM a 10 PM (afluencia de la cena): media de 14,1 ACU → 1,692 USD/hora
- Sábado de 12 PM a 8 PM (fin de semana ocupado): media de 9,3 ACU → 1,116 USD/hora
- Domingo (el día más ligero): media de 2,1 ACU → 0,252 USD/hora

Media ponderada durante el mes completo: 4,2 ACU → 0,504 USD/hora → 368 USD/mes.

Con una RI aprovisionada: 228 USD/mes. Serverless: 368 USD/mes. La opción aprovisionada ahorraba 140 USD/mes.

«Eso parece obvio», dijo Leo. «¿Por qué estamos en Serverless?»

«Porque 368 USD es la media», dijo Tom. «Mira los viernes por la noche.»

Viernes de 6 PM a 10 PM: media de 14,1 ACU. Para esa ventana de cuatro horas, Serverless cuesta 1,692 USD/hora. Una db.r6g.xlarge a 228 USD/mes tiene un techo de 32 GiB de memoria — el equivalente a aproximadamente 16 ACU. El clúster Serverless promediaba 14,1 ACU durante esa ventana, rozando el techo del xlarge sin margen para los picos.

«Una instancia aprovisionada dimensionada para nuestro pico del viernes con margen real sería una db.r6g.2xlarge», dijo Tom. «A la tasa RI, eso son 1,04 USD/hora × 0,60 = 0,624 USD/hora. Mensual: 456 USD.»

«Eso es más que la media de Serverless de 368 USD», dijo Maya.

«Correcto. Y si dimensionamos la instancia aprovisionada para la base del día laborable — la db.r6g.xlarge — los viernes por la noche serían un problema. Con carga pico, estaríamos empujando 14 ACU contra prácticamente toda la capacidad del xlarge. Eso es saturación.»

«Así que tendrías que predimensionar para el pico», dijo Priya.

«Al coste de pagar por capacidad inactiva las otras 160 horas de la semana», dijo Tom. «Las matemáticas de la RI aprovisionada que resultan más baratas solo funcionan cuando tu ratio pico/base es bajo. El nuestro es 20:1. Ese es exactamente el escenario para el que se diseñó Serverless v2.»

Mostró los números uno al lado del otro:

| Opción | Mes medio | Noche tranquila (2 AM) | Afluencia del viernes (8 PM) |
|---|---|---|---|
| Serverless v2 | 368 USD | 0,096 USD/hora | 1,692 USD/hora |
| RI aprovisionada (r6g.xl) | 228 USD | 228 USD/730h = 0,312 USD/hora | limitada — riesgo de saturación |
| RI aprovisionada (r6g.2xl) | 456 USD | 0,624 USD/hora | margen cómodo |

«La opción Serverless es 368 USD», dijo Tom. «La opción aprovisionada correctamente dimensionada es 456 USD — y eso es antes de tener en cuenta el coste operativo de monitorizar y escalar manualmente la instancia aprovisionada cuando nuestros patrones de tráfico cambien el próximo trimestre.»

«Y el coste operativo», dijo Priya, «no es nada.»

«No. Con Serverless, no tenemos que pensar en el dimensionamiento de instancias. Aurora lo gestiona. Con aprovisionado, cada trimestre necesitaría reevaluar si la clase de instancia actual todavía encaja con nuestro tráfico. Eso no es caro en tiempo, pero es algo que puede salir mal si dejamos de prestar atención.»

«Estará bien siempre que no olvidemos redimensionarlo», dijo Leo, y luego se dio cuenta. «Que es exactamente cuando no estará bien.»

«Exacto», dijo Tom.

La conclusión se mantuvo: Serverless v2 a 368 USD/mes era la elección correcta para la ratio pico/base de 20:1 de Nimbus y la preferencia de su equipo por la simplicidad operativa. La RI aprovisionada solo era atractiva para los equipos con tráfico que no variaba significativamente — una ratio de 2:1 o 3:1 donde la instancia aprovisionada rara vez estaba inactiva.

«¿Qué nos haría cambiar a aprovisionado?» preguntó Maya.

«Si nuestro patrón de tráfico se aplanara», dijo Tom. «Si Nimbus creciera hasta el punto en que la base de poco tráfico también fuera alta — digamos, 8 ACU a las 2 AM en lugar de 0,8 — la ratio caería a 2:1 y aprovisionado tendría sentido económico. Ese es un problema empresarial diferente. Uno que nos gustaría tener.»

Para Aurora con Serverless v2, las Instancias Reservadas no se aplican directamente — Serverless v2 escala dinámicamente y pagas por ACU-hora. Esta es la configuración actual de Nimbus: el escritor y el lector principales de Aurora utilizan ambos Serverless v2. Los ahorros para Nimbus provienen de la naturaleza de escalado automático de Serverless v2 en sí — no pagas por capacidad no utilizada cuando el tráfico es bajo.

Los equipos que aún ejecutan instancias fijas de Aurora deben evaluar el compromiso de RI una vez que el tipo de instancia ha sido estable durante tres o más meses.

**DynamoDB: Bajo Demanda vs Aprovisionado**

En el Capítulo 9, presentamos los dos modos de capacidad de DynamoDB: bajo demanda y aprovisionado.

Nimbus había estado ejecutando DynamoDB en modo bajo demanda desde el principio. Con poco tráfico, esto era correcto — bajo demanda es más caro por solicitud pero no tiene cargo mínimo.

Ahora, con 18 meses de datos de tráfico en CloudWatch, Tom podía ver patrones.

Solicitudes de lectura medias: 225 por segundo (aproximadamente 19,4 millones por día)
Solicitudes de escritura medias: 60 por segundo (aproximadamente 5,2 millones por día)
Día pico (viernes): 180% de las solicitudes medias de DynamoDB (ElastiCache absorbe ~95% de las lecturas, por lo que DynamoDB solo ve una fracción del pico general de 25x en el volumen de pedidos)

**Precios bajo demanda**: 1,25 USD por millón de solicitudes de escritura, 0,25 USD por millón de solicitudes de lectura.
**Precios aprovisionados**: 0,00065 USD por unidad de capacidad de escritura por hora, 0,00013 USD por unidad de capacidad de lectura por hora.

Tom calculó el punto de equilibrio: la capacidad aprovisionada se vuelve más barata cuando la usas de forma suficientemente consistente como para no pagar la prima de bajo demanda durante los períodos inactivos.

(Una nota sobre los números de esta sección: reflejan la factura del equipo en ese momento, y son ilustrativos. A finales de 2024, AWS redujo los precios bajo demanda de DynamoDB en un 50%, lo que movió el punto de equilibrio sustancialmente — hoy, la capacidad aprovisionada solo gana cuando la utilización es consistentemente alta. Siempre rehaz estas matemáticas con los precios actuales.)

Con 18 meses de datos que muestran patrones diarios consistentes, la capacidad aprovisionada con **DynamoDB Auto Scaling** era la elección correcta:

- Establecer la capacidad mínima en el 60% de la carga media
- Establecer el máximo en el 250% de la media (maneja los picos del viernes)
- Auto Scaling ajusta la capacidad aprovisionada entre estos límites

Coste mensual de DynamoDB: bajó de 340 USD (bajo demanda) a 230 USD (aprovisionado con escalado automático). Reducción del 32%.

«Espera — pero *¿por qué* lo haríamos de esa manera?» preguntó Maya. «Hemos estado en bajo demanda desde el principio porque no confiábamos en nuestros propios patrones de tráfico. ¿Qué cambió?»

«Dieciocho meses de datos», dijo Tom. «Ahora sabemos cómo son nuestros patrones — base de días laborables consistente, picos del viernes, períodos tranquilos del domingo. Bajo demanda era la decisión correcta cuando no sabíamos. Aprovisionado con Auto Scaling es la decisión correcta ahora que sí sabemos.»

«Pero si sobreaprovisionamos», preguntó Leo, «pagamos por capacidad no utilizada.»

«Ese es el riesgo», dijo Tom. «Con Auto Scaling, establecemos el mínimo lo suficientemente alto para evitar la limitación, y dejamos que AWS gestione dentro de nuestro rango.»

«¿Y si nuestro patrón de tráfico cambia significativamente?»

«Entonces ajustamos los límites. Revisamos esto trimestralmente.»

**ElastiCache: Dimensionamiento Correcto y la Historia con Moraleja**

La factura de ElastiCache: 185 USD/mes. Una instancia cache.r6g.large de Redis en cada AZ (dos nodos, primario + réplica).

Las métricas de CloudWatch mostraban:

- Utilización media de memoria: 34%
- Pico: 44%

La instancia estaba sobreaprovisionada. Un cache.m6g.large — la mitad de la memoria del r6g.large — probablemente manejaría la carga con algo de margen.

Pero aquí Tom hizo una pausa. Recordó lo que había pasado en una empresa anterior cuando había dimensionado agresivamente una caché — y le contó al equipo la historia completa, porque era el tipo de historia que había que contar antes de encontrarte en medio de ella.

En su empresa anterior — una plataforma SaaS para informes financieros — el clúster de ElastiCache era un cache.r6g.large. Dos nodos, primario y réplica. Utilización media de memoria: 26%. Pico observado: 37%. El ingeniero de guardia que lo señaló había hecho las cuentas: un cache.m6g.large manejaría la carga con aproximadamente un 25% de margen por encima del pico observado. Ahorro: 60 USD/mes — precios en la región de esa empresa y generación de nodos de la época, menor que la brecha equivalente en Nimbus hoy. El cambio fue aprobado un martes.

El mes siguiente, un jueves por la noche a las 11:47 PM, comenzó el lote de liquidación de fin de mes.

El lote de liquidación se ejecutaba trimestralmente. Extraía los registros de transacciones de los tres meses anteriores de cada cuenta activa, los agregaba, calculaba los impuestos y escribía los registros de liquidación. La caché se usaba para almacenar el estado de agregación intermedio — el total acumulado de cada cuenta a medida que el lote avanzaba. El cache.r6g.large siempre lo había manejado. Nadie había mirado las métricas del lote de liquidación específicamente al tomar la decisión de dimensionamiento correcto, porque el lote era trimestral y la ventana de observación había sido de cuatro semanas.

En la instancia más pequeña, maxMemoryPolicy estaba configurada en `allkeys-lru` — cuando la memoria se llenaba, Redis desalojaría la clave usada menos recientemente para hacer espacio. Esa es la política correcta para una caché general. Pero para el lote de liquidación, cada clave en la caché era necesaria activamente. Cuando la memoria se llenó al 84% de los 6,38 GB del m6g.large, Redis comenzó a desalojar claves. Cada desalojo era un fallo de caché. Cada fallo de caché enviaba una consulta a la base de datos PostgreSQL subyacente para recomputar el valor desalojado a partir de los registros de transacciones sin procesar.

El pool de conexiones de base de datos estaba configurado para tráfico en estado estacionario, no para carga de lote de liquidación. Cuatro minutos después de que comenzaran los desalojos, la base de datos tenía 847 conexiones activas. El límite de conexiones era 1.000. A los 9 minutos, los primeros hilos de aplicación empezaron a ver errores de «demasiadas conexiones». A los 12 minutos, tres servicios que compartían el pool de conexiones de base de datos — el lote de liquidación, el servicio de informes en tiempo real y la API de cara al cliente — estaban todos afectados.

El ingeniero de guardia escaló a las 11:59 PM. La revisión del incidente comenzó a las 12:08 AM.

Primera respuesta: aumentar el tiempo de espera de Lambda para la función del lote de liquidación (el lote de liquidación era en parte basado en Lambda). Esto estaba mal. El tiempo de espera no era el problema.

Segunda respuesta: añadir una segunda función Lambda para paralelizar el lote de liquidación. También estaba mal. Más paralelismo significaba más acceso simultáneo a la caché, lo que significaba desalojos más rápidos, lo que empeoró la situación.

Tercera respuesta: reducir la escala del lote de liquidación para disminuir la presión sobre la base de datos. Esto ayudó ligeramente pero no abordó la causa raíz.

Cuarta respuesta, a las 2:31 AM: restaurar el cache.r6g.large. La presión de memoria bajó de inmediato. Los desalojos se detuvieron. El pool de conexiones de la base de datos se despejó. El lote de liquidación se completó a las 4:17 AM, retrasado más de cuatro horas.

Total del incidente: cuatro horas de rendimiento degradado de la API para los clientes que intentaban acceder a los informes. Un lote de liquidación completo retrasado. Tiempo de ingeniería: aproximadamente 22 horas entre cinco ingenieros. Coste directo estimado: 40.000 USD.

El ahorro de 60 USD/mes había costado 40.000 USD en un solo incidente.

«El error no fue la decisión de dimensionamiento correcto», dijo Tom. «La decisión era defendible basándose en los datos disponibles. El error fue la ventana de observación. Medimos cuatro semanas de métricas. El lote de liquidación era trimestral. Estábamos mirando el período de tiempo equivocado.»

«¿Cómo lo evitas?» preguntó Maya.

«Preguntas: ¿cuál es la operación de mayor riesgo que esta caché soporta? Y encuentras las métricas específicas de esa operación. No la semana media. La semana específica — o el mes — o el trimestre — cuando la carga es mayor. Y dimensionas para eso.»

«¿Y si no puedes encontrar las métricas porque la operación es poco frecuente?»

«Esa es la respuesta», dijo Tom. «Si no puedes encontrar las métricas para un escenario específico de alta carga, la respuesta correcta es no hacer el dimensionamiento correcto todavía. Espera a la siguiente ocurrencia, instrumétala intensamente, luego dimensiona basándote en lo que observaste.»

El clúster de ElastiCache de Nimbus tenía su propia operación de alto riesgo: la afluencia de la cena del viernes. Tom tenía esos datos — tres viernes consecutivos habían llegado al 44% de utilización de memoria en el r6g.large, aproximadamente 5,7 GB de datos activos. En los 6,38 GB del m6g.large, ese mismo conjunto de trabajo ya estaría cerca del 90% — y si algo en el pipeline de procesamiento de pedidos cambiara para usar más espacio de caché — una nueva función, una estrategia de almacenamiento en caché diferente — el 90% se convierte en territorio de desalojo.

Calculó los números de todos modos. Pasar de r6g.large a m6g.large: dos nodos a 0,127 USD/hora frente a dos nodos a 0,090 USD/hora, funcionando 730 horas al mes. Large: 185 USD/mes. El par m6g: 131 USD/mes. Ahorro potencial: 54 USD/mes. Probó el m6g.large en staging durante dos semanas bajo carga. La memoria llegó al 71% — lo suficientemente cerca del límite como para que le incomodara.

Luego puso precio a la alternativa: mantener el cache.r6g.large, pero comprar Nodos Reservados (compromiso de 1 año). De bajo demanda 185 USD a Reservado 120 USD/mes. Ahorro: 65 USD/mes sin cambiar el tipo de instancia.

«Los 65 USD/mes que ahorraría con Nodos Reservados al mismo tamaño de instancia son un ahorro real», dijo Tom. «Los 54 USD/mes que ahorraría pasando al m6g.large son una economía falsa si arriesgan la afluencia de cenas del viernes — y ni siquiera ahorran tanto. A veces dimensionar correctamente a una instancia más pequeña arriesga un incidente de rendimiento — los Nodos Reservados nos dan más ahorros sin ninguno del riesgo.»

Compró los Nodos Reservados para el r6g.large.

«Cuando la opción más segura también ahorra más», dijo Tom, «ni siquiera es una concesión.»

**Retención de Copias de Seguridad de RDS: La Concesión de Almacenamiento**

Las copias de seguridad automatizadas de RDS se almacenan en S3 (sin cargo adicional por almacenamiento hasta el 100% del tamaño de tu base de datos). La retención predeterminada es de 7 días.

Para la base de datos Aurora de 180 GB de Nimbus, 7 días de copias de seguridad era apropiado — habían podido restaurar desde la copia de seguridad dentro de esa ventana en las pruebas.

Pero Tom notó: también tenían instantáneas manuales de cada despliegue significativo, conservadas indefinidamente.

23 instantáneas manuales, con un total de 4,1 TB de almacenamiento de instantáneas.
Coste: 0,021 USD/GB/mes para almacenamiento de copia de seguridad de Aurora = aproximadamente 87 USD/mes en almacenamiento de instantáneas manuales.

Conservaron las últimas 3 instantáneas manuales por entorno (producción, staging). Eliminaron el resto — se conservaron aproximadamente 1,1 TB.
Ahorro: 64 USD/mes.

«Estábamos pagando 64 USD al mes por un seguro que nunca usamos», dijo Leo.

«Estábamos pagando por tranquilidad», corrigió Tom. «La pregunta es: ¿cuánta tranquilidad vale 64 USD al mes?»

«Con un plan de recuperación ante desastres adecuado», dijo Priya, «puedes obtener la misma tranquilidad de 7 días de copias de seguridad automatizadas y 3 instantáneas manuales.»

«De acuerdo. Ahora.»

**Variación: Cuándo lo Aprovisionado Falla**

Si tu patrón de tráfico es consistente y predecible, la capacidad aprovisionada con Auto Scaling ahorra un 30% sobre bajo demanda. Pero si se lanza una nueva función y tu volumen de escritura aumenta 5x de la noche a la mañana, serás limitado antes de que Auto Scaling se ponga al día — Auto Scaling reacciona al tráfico observado, lo que significa que hay un retraso. Mantener el modo bajo demanda durante las semanas que rodean un lanzamiento de función importante es una concesión razonable: un coste ligeramente más alto, sin riesgo de limitación durante un período en el que estás viendo cómo cambian los patrones de tráfico en tiempo real.

Si eliminas réplicas de lectura no utilizadas (como las réplicas de PostgreSQL heredadas de Nimbus), el ahorro es inmediato e inequívoco — no hay concesión, porque las réplicas no estaban proporcionando ningún valor. Pero si te sientes tentado a eliminar una réplica de lectura que solo maneja el 2% del tráfico, comprueba qué pasa con la principal cuando ese 2% no tiene adónde ir durante un pico. Algunas réplicas de lectura existen para el margen, no para la carga actual.

En el examen, se aplica la misma lógica: una carga de trabajo de base de línea estable apunta a capacidad reservada; alta con muchos picos e inactiva apunta a bajo demanda o Serverless.

**Resumen de la Optimización de Bases de Datos**

| Servicio | Antes | Después | Ahorro mensual |
|---|---|---|---|
| Aurora (Serverless v2 retenido tras el análisis) | 647 USD | 647 USD | 0 USD (modelo correcto) |
| Réplicas de lectura de RDS (no utilizadas) | 340 USD | 0 USD | 340 USD |
| DynamoDB (Bajo Demanda → Aprovisionado + Auto Scaling) | 340 USD | 230 USD | 110 USD |
| ElastiCache (Nodos Reservados) | 185 USD | 120 USD | 65 USD |
| Instantáneas manuales de Aurora | 87 USD | 23 USD | 64 USD |
| RDS Proxy (seguridad de conexiones) | 0 USD | 88 USD | -88 USD |
| **Total** | **1.599 USD** | **1.108 USD** | **491 USD/mes** |

491 USD al mes en ahorros de base de datos. 5.892 USD al año.

Tom puso esta cifra junto al ahorro en almacenamiento (6.200 USD/año), las políticas de ciclo de vida de S3 del Capítulo 23 (7.800 USD/año) y los ahorros del Plan de Ahorro (14.200 USD/año).

Impacto total de optimización hasta la fecha: 34.092 USD/año.

«Eso es margen real», dijo Maya.

«O varios experimentos serios», dijo Priya.

«O doce meses de experimentos», dijo Leo.

Los tres tenían razón.

## Fortalezas y Limitaciones

**DynamoDB Aprovisionado con Auto Scaling**:

- Más barato que bajo demanda para cargas de trabajo predecibles y consistentes
- Auto Scaling maneja la variabilidad sin sobreaprovisionamiento permanente
- Requiere monitorización para garantizar que los límites de capacidad sigan siendo apropiados

**Instancias Reservadas de RDS / Nodos Reservados de ElastiCache**:

- Ahorros significativos para cargas de trabajo estables y de larga duración
- Compromiso bloqueado — si tus necesidades cambian, habrás pagado por capacidad no utilizada
- A diferencia de las RI Estándar de EC2, las RI de RDS **no pueden** revenderse en el Marketplace de Instancias Reservadas — el Marketplace es solo para EC2. Una RI de RDS no utilizada es un coste hundido, lo que hace que la decisión de dimensionamiento importe más

**El principio general**:

- Siempre comprende la utilización antes de optimizar — usa p95, no la media
- Los recursos no utilizados (como las réplicas de lectura heredadas) son la optimización de mayor rendimiento
- El dimensionamiento correcto requiere validación en staging antes de aplicarse a producción, y comprobar los patrones de carga de trabajo estacional que pueden no aparecer en una ventana de observación estándar
- Los precios reservados requieren confianza en la estabilidad de la carga de trabajo

## Resumen

La auditoría de bases de datos cerró una brecha de 491 USD al mes sin tocar nunca el motor — los ahorros vinieron del maletero: réplicas inactivas, instantáneas olvidadas y capacidad con precio para patrones de tráfico que Nimbus había superado. La disciplina de Tom se mantuvo en cada línea de coste: comprende la carga de trabajo primero, luego optimiza. El único nuevo gasto, RDS Proxy, era el seguro que los números de conexiones del viernes por la noche decían que necesitaban.

- **Audita primero**: extrae las métricas de CloudWatch antes de realizar cualquier cambio en la base de datos. Usa latencia p95 y CPU p95 — no medias. Comprueba FreeableMemory y los máximos de conexiones.
- **Elimina los recursos no utilizados**: réplicas de lectura, bases de datos inactivas e instancias de prueba que ya no se necesitan.
- **Vigila tu pool de conexiones**: configura alarmas en DatabaseConnections al 75% y 90% del límite. Considera RDS Proxy para la multiplexación de conexiones.
- **DynamoDB Bajo Demanda vs Aprovisionado**: Bajo Demanda para tráfico impredecible; Aprovisionado + Auto Scaling para patrones consistentes.
- **Dimensionamiento correcto de ElastiCache**: prueba en staging bajo cargas pico realistas, incluyendo los picos estacionales. Los Nodos Reservados ofrecen ahorros al mismo tamaño de instancia cuando el redimensionamiento agresivo conlleva riesgo.
- **Gestión de instantáneas de RDS**: conserva solo las instantáneas que necesitas. Las instantáneas manuales se almacenan indefinidamente a menos que se eliminen.

## Consejos para el Examen

*Dominio SAA-C03: Diseñar Arquitecturas Optimizadas en Costes (Dominio 4, Tarea 4.3)*

- **Modos de precios de DynamoDB**: Bajo Demanda = pagar por solicitud (coste por unidad más alto, sin mínimo). Aprovisionado = pagar por unidad de capacidad por hora (coste por unidad más bajo, debe asignarse capacidad). **DynamoDB Auto Scaling** ajusta la capacidad aprovisionada automáticamente.
- **Instancias Reservadas de RDS**: disponibles para todos los tipos de motor de RDS. Las implementaciones Multi-AZ pueden usar Instancias Reservadas (te comprometes a Multi-AZ). Plazo de 1 o 3 años.
- **Nodos Reservados de ElastiCache**: el mismo modelo de compromiso que las Instancias Reservadas de EC2. Aplicado por nodo, no por clúster.
- **Almacenamiento de instantáneas de RDS**: las copias de seguridad automatizadas son gratuitas hasta el 100% del tamaño de la base de datos. Las instantáneas manuales se cobran por GB al mes en S3. Escenario del examen: «reducir los costes de almacenamiento de RDS» → eliminar las instantáneas manuales antiguas.
- **Capacidad reservada de DynamoDB**: también disponible para DynamoDB (comprometido a una capacidad específica de lectura/escritura durante 1 o 3 años con descuento). Diferente del aprovisionado estándar — pagas por adelantado por capacidad en todas tus tablas de DynamoDB en una región.
- **Aurora Serverless v2 vs aprovisionado**: Serverless v2 escala automáticamente, ideal para cargas de trabajo variables. Aprovisionado con Instancias Reservadas es más barato para cargas de trabajo estables y predecibles.

## Ejercicios

**Ejercicio 1 — Recordar**

Explica cuándo deberías usar la capacidad bajo demanda de DynamoDB frente a la capacidad aprovisionada con Auto Scaling. ¿Qué información necesitas para tomar esta decisión?

*(Pista: piensa en el motor del coche — comprometerte a capacidad aprovisionada sin datos de tráfico es el cambio de aceite que te saltas, mientras que permanecer bajo demanda después de 18 meses de patrones predecibles es pagar por una revisión que no necesitas.)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: Una empresa ejecuta una tabla de DynamoDB para la clasificación de un juego móvil. El tráfico es muy consistente durante todo el año, excepto durante un evento estacional que está programado con meses de antelación (una semana por trimestre, llegando a 10x el tráfico normal a medida que los jugadores se unen durante el primer día). La prioridad de la empresa es minimizar los costes de base de datos durante los largos períodos predecibles en estado estacionario mientras se mantiene el rendimiento durante las semanas de eventos conocidos.

¿Qué estrategia de capacidad de DynamoDB satisface MEJOR estos requisitos?

A) Capacidad bajo demanda para manejar los picos estacionales sin limitación
B) Capacidad aprovisionada establecida en niveles de pico estacional (siempre aprovisionada para 10x el tráfico)
C) Capacidad aprovisionada con DynamoDB Auto Scaling, con una capacidad máxima establecida para el pico estacional
D) Unidades de capacidad reservada de DynamoDB de 3 años a niveles de tráfico normal

**Pista 1**: «Tráfico muy consistente excepto por un pico estacional programado y conocido» — ¿qué modo maneja ambos de manera eficiente? (La fortaleza de bajo demanda es el tráfico *impredecible*; este tráfico es predecible.)

**Pista 2**: «Minimizar costes» durante el período fuera de pico significa que no puedes sobreaprovisionarte para 10x todo el tiempo.

**Pista 3**: DynamoDB Auto Scaling puede escalar hacia arriba para el evento estacional y volver a escalar hacia abajo después.

**Respuesta**: C

**Explicación**: La capacidad aprovisionada con Auto Scaling escala la tabla basándose en el tráfico real. Durante los períodos normales, la capacidad está en niveles normales (bajo coste). Durante el evento estacional — cuyas fechas se conocen de antemano y cuyo tráfico se acumula gradualmente durante el primer día — Auto Scaling rastrea el incremento hasta el nivel máximo configurado (manejando el pico de 10x), y el equipo también puede aumentar el mínimo con anticipación al inicio programado como margen adicional. Después del evento, la capacidad vuelve a escalar. Esto es más barato que bajo demanda durante el estado estacionario que domina el año (bajo demanda cuesta más por solicitud) y más barato que aprovisionarse siempre para 10x.

**¿Por qué no A?** Bajo demanda maneja los picos sin limitación, pero su fortaleza es el tráfico *impredecible*. Aquí el tráfico es muy consistente y el pico es programado y gradual — pagar la prima por solicitud de bajo demanda durante el ~92% del año que es estado estacionario contradice la prioridad declarada de minimizar costes durante los períodos normales.

**¿Por qué no B?** Aprovisionarse de forma permanente para 10x significa que ~90% de la capacidad aprovisionada está inactiva durante ~92% del año — pagando por capacidad que nunca se usa.

**¿Por qué no D?** Las unidades de capacidad reservada te bloquean en niveles de tráfico normal. Durante el evento estacional de 10x, estarías limitado más allá de la cantidad reservada, o necesitarías añadir bajo demanda encima.

*Dominio SAA-C03: Diseñar Arquitecturas Optimizadas en Costes — Tarea 4.3*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus está evaluando una nueva función: un panel de análisis de restaurantes que muestra recuentos de pedidos en tiempo real, ingresos por hora y datos demográficos de los clientes. Estos datos consultarían una base de datos aproximadamente 200 veces por minuto (una consulta por analista por actualización de página, con 10 analistas).

Actualmente los datos de análisis están en Athena (S3). ¿Deberían construir el panel en Athena, o deberían cargar los datos en una base de datos? Si es una base de datos, ¿cuál (Aurora, DynamoDB, Redshift)?

Considera: frecuencia de consultas, requisitos de frescura de datos, complejidad de consultas (agregaciones, uniones) y coste por consulta a este volumen.

*(No hay una única respuesta correcta. El objetivo es practicar la selección de bases de datos para cargas de trabajo analíticas.)*

## Escena Post-Créditos

Tom presentó el resumen completo de optimización de costes a Maya.

Tres meses de trabajo. 34.092 USD en ahorros anuales identificados, la mayoría ya implementados.

«¿Qué queda?» preguntó Maya.

«Optimizaciones de las que todavía no estoy seguro», dijo Tom. «La configuración de Aurora podría quizás dimensionarse más, pero quiero un trimestre más de datos antes de comprometerse. Y hay una pregunta de transferencia de datos que no he analizado completamente.»

«Los costes de redes.»

«Sí. Eso es lo siguiente.»

Maya miró los números. «Tom, quiero entender algo. Esta optimización — llevas tres meses en ello. Es una parte significativa de tu tiempo.»

«Aproximadamente el 30%.»

«Y encontraste alrededor de 34.000 USD al año. Así que la optimización se paga en — ¿qué, unos pocos meses de tu salario?»

Tom la miró. «Más o menos.»

«Y cada año después, son ahorros puros.»

«O reinversión pura», dijo. «El mismo efecto.»

Maya asintió. «Esto es lo que quiero que hagas. No solo en almacenamiento y bases de datos — en todo. Haz de la optimización de costes una función continua de tu rol.»

Tom nunca había escuchado que su trabajo fuera descrito de esta manera. Le resultó tanto preciso como satisfactorio.

En el siguiente capítulo: la última categoría de costes restante — y la que sorprende a casi todo el mundo.
