# Capítulo 29: La Factura de la Base de Datos

Tom imprimió las métricas de CloudWatch. Catorce páginas. Las extendió sobre su escritorio antes de confiar en sí mismo para leer los números. Mejor verlo todo de una vez que encontrar sorpresas a mitad de página.

**Recapitulación: Almacenamiento Hecho, Bases de Datos a Continuación**

La auditoría de almacenamiento había sacado a la luz 6.700 USD en desperdicio acumulado, no por malas decisiones, sino por falta de atención. Volúmenes no adjuntos, instantáneas antiguas, historiales de versiones que nadie le había dicho a S3 que limpiara, cargas multiparte incompletas que llevaban meses acumulándose en silencio. Tom lo había arreglado todo, había implementado reglas de limpieza automática y había pasado a la siguiente pestaña de la hoja de cálculo. El nivel de datos era la mayor incógnita restante: bases de datos relacionales, tablas NoSQL, nodos de caché, almacenamiento de respaldos, y una partida que llevaba semanas incomodándolo.

Las partidas del nivel de datos en revisión:

Clúster de Aurora: 647 USD/mes.
Réplicas de lectura de RDS PostgreSQL heredadas: 340 USD/mes.
Tablas de DynamoDB: 340 USD/mes.
ElastiCache: 185 USD/mes.
Instantáneas manuales de Aurora: 87 USD/mes.

Total del nivel de datos en revisión: 1.599 USD/mes.

"Déjame entender cada uno antes de decidir nada," dijo. "Porque la base de datos no es el lugar donde ahorrar dinero recortando esquinas."

Esto era sabio. La mala configuración de la base de datos que causa pérdida de datos o degradación del rendimiento cuesta mucho más que los ahorros.

Piensa en una base de datos como el motor de un coche. Puedes ahorrar dinero en un coche cambiando a combustible más barato, ajustando la presión de los neumáticos y eliminando peso innecesario del maletero. Pero si intentas ahorrar dinero saltándote un cambio de aceite, arriesgas a agarrotar el motor, y un motor agarrotado cuesta mucho más que cualquier ahorro en combustible. La auditoría que Tom está a punto de realizar sigue la misma lógica: encuentra el desperdicio en el maletero y en el depósito de combustible, y deja el motor solo hasta que sepas exactamente lo que estás haciendo.

**Entender Primero tu Carga de Trabajo de Base de Datos**

La optimización de costes en las bases de datos requiere entender la carga de trabajo antes de tocar nada. Tom había aprendido esto de un casi-accidente seis meses antes: había empezado a reducir el tamaño de la instancia de base de datos basándose en la utilización promedio de CPU —18%— sin mirar primero los números de p95. Un colega le había pedido que comprobara las métricas de CloudWatch con más cuidado. La CPU en p95 era del 61%, y durante una noche de viernes con una afluencia de cenas particularmente fuerte, había llegado al 84%.

"El promedio no te dice qué pasa en el pico," dijo Tom, cuando se lo contó a Priya. "Si hubiera dimensionado al promedio, nos habrían limitado los viernes por la noche."

"Por eso miras el p95, no el promedio," dijo Priya. "Siempre."

Ese principio se extendía más allá de la CPU. Tom tenía ahora una lista de comprobación previa a la auditoría estándar:

- CPU: p95, no promedio
- Memoria: FreeableMemory (en bytes absolutos, no en porcentaje): ¿qué tan cerca estamos del límite?
- Conexiones: máximo de DatabaseConnections en los últimos 30 días: ¿qué tan cerca hemos llegado al límite de conexiones?
- Proporción de lectura/escritura: Determina si las réplicas de lectura se ganan su coste
- Tasa de crecimiento del almacenamiento: ¿Cuántos GB por mes estamos añadiendo?
- Retraso de replicación (para réplicas): ¿La réplica va al día?

Preguntas clave:

- ¿Cuál es la utilización promedio y pico de la CPU?
- ¿Cuál es la proporción de lectura/escritura?
- ¿El almacenamiento está creciendo, estable o decreciendo?
- ¿Se están utilizando las réplicas de lectura?
- ¿La instancia está infraaprovisionada (causando ralentizaciones) o sobreaprovisionada (pagando por capacidad inactiva)?

Tom consultó las métricas de CloudWatch de los tres servicios de base de datos durante los 30 días anteriores:

**Clúster de Aurora**:

- CPU promedio: 18% (p95: 61%; pico: 84% los viernes por la noche)
- FreeableMemory: consistentemente por encima de 4GB de 8GB disponibles. No es una preocupación.
- Proporción de lectura/escritura: 14:1 (intensivo en lecturas)
- Almacenamiento: 180GB (creciendo ~5GB/mes)
- Máximo de DatabaseConnections: 312 de 1.000 disponibles. Holgado.

**Réplicas de lectura (RDS PostgreSQL, separado de Aurora)**:

- Estas eran dos réplicas de lectura de RDS heredadas creadas antes de la migración a Aurora, todavía en ejecución.
- Conexiones promedio a cada una: 2 al día. CPU promedio: 3%.
- FreeableMemory: 7,2GB de 8GB disponibles. Las instancias estaban casi inactivas.

"¿Por qué siguen estas en ejecución?" preguntó Tom.

"Ya las había desplegado... ah," dijo Leo. Miró las fechas de creación de las instancias. "Eran para el repliegue durante la migración a Aurora. Nunca las eliminé."

Ese momento —cuando algo caro ha estado funcionando durante meses sin usarse— es familiar en los entornos de nube. Leo había creado las réplicas como una red de seguridad. La red de seguridad nunca había sido necesaria. Pero nadie había hecho la pregunta hasta ahora.

"¿Cómo está la situación del pool de conexiones?" preguntó Priya, inclinándose. "Antes de eliminarlas, ¿hay algún componente de la aplicación que todavía dirija lecturas allí?"

Tom comprobó los logs de conexión. Las dos conexiones por día venían de un script de monitorización que Priya había escrito hacía catorce meses: sondeaba todos los endpoints de base de datos conocidos para verificar que respondían. Las réplicas solo eran consultadas por el verificador de salud, no por ningún tráfico real de la aplicación.

"Elimínalas," dijo Maya.

Las réplicas fueron terminadas. Ahorro mensual: 340 USD.

**Casi-Accidente del Pool de Conexiones**

Mientras tenía abiertas las métricas de conexión, Tom realizó una comprobación más amplia en todos los endpoints de base de datos. Lo que encontró le hizo detenerse.

El endpoint escritor de Aurora mostraba un máximo de DatabaseConnections de 312. Holgado. Pero el endpoint lector contaba una historia diferente.

"El endpoint lector llegó a 847 conexiones tres viernes por la noche consecutivos," dijo Tom.

"¿Cuál es el límite?" preguntó Priya.

"El límite para nuestra clase de instancia actual es de 1.000. Llegamos a 847. Eso es el 85% del límite."

"¿Y no nos dimos cuenta porque no teníamos alarma hasta el 90%?" preguntó Maya.

"No teníamos ninguna alarma," dijo Tom. "No hay ninguna alarma de CloudWatch sobre las conexiones del endpoint lector. Solo encontré esto porque estaba mirando las métricas en bruto."

A las 1.000 conexiones, la base de datos rechaza nuevas conexiones. Cualquier hilo de la aplicación que intente adquirir una conexión a la base de datos en ese momento lanza una excepción. Si esa excepción no se gestiona de forma elegante, el usuario ve un error 500.

"Estuvimos a treinta segundos de un incidente de viernes por la noche," dijo Leo. "Tres veces seguidas."

"¿Hemos pensado en qué pasa cuando se cruza ese umbral?" preguntó Priya.

"Los socios de restaurantes ven pedidos fallidos durante la afluencia de cenas," dijo Maya. "Eso no es una preocupación teórica."

Tom configuró una alarma de CloudWatch de inmediato: alerta a 750 conexiones (75% del límite), aviso urgente a 900 (90%). También implementó RDS Proxy para el endpoint lector: RDS Proxy agrupa y gestiona las conexiones a la base de datos desde la capa de aplicación, lo que significa que cincuenta hilos de aplicación pueden compartir diez conexiones a la base de datos. El proxy gestiona la multiplexación. La base de datos ve muchas menos conexiones incluso cuando la aplicación está bajo una carga pesada.

"Para Aurora Serverless v2, RDS Proxy tiene un precio de 0,015 USD por ACU por hora, con un cargo mínimo de 8 ACUs por proxy," dijo Tom. "Pero si una infracción del límite de conexiones causa aunque sea una interrupción parcial un viernes por la noche, el coste reputacional para Nimbus es órdenes de magnitud mayor."

"¿Cuánto cuesta eso por mes?" se preguntó Tom, sacando el número. Su lector funciona con Serverless v2, así que el proxy se factura contra el mínimo de 8 ACUs: 0,015 USD × 8 × 730 = 87,60 USD/mes. Ese era un coste que estaba contento de pagar.

Quizás te preguntes: si ya estamos ahorrando dinero con el autoescalado de Serverless v2, ¿por qué molestarse con Instancias Reservadas para el nivel aprovisionado? La respuesta es que el escalado de Serverless v2 tiene un coste: pagas por ACU-hora lo hayas planeado o no. Para los equipos que ejecutan configuraciones de Aurora fijas, el compromiso de IR convierte el coste variable en coste predecible. Para los equipos que ejecutan instancias aprovisionadas (no Serverless v2), esa distinción importa significativamente.

**Instancias Reservadas de RDS: Para Niveles de Base de Datos Aprovisionados**

Al igual que EC2, RDS ofrece Instancias Reservadas para el uso comprometido.

Para los equipos que usan configuraciones de instancia Aurora fijas (no Serverless v2), las Instancias Reservadas pueden ahorrar entre un 30 y un 60%. Así funciona el enfoque de IR aprovisionadas: te comprometes con un tipo de instancia específico durante 1 o 3 años a cambio de un descuento significativo en la tarifa horaria.

Como ilustración: una instancia escritora db.r6g.large a 0,26 USD/hora bajo demanda cuesta 190 USD/mes. Una Instancia Reservada de 1 año para la misma reduce eso a aproximadamente 108 USD/mes, ahorrando 82 USD/mes por instancia, o casi 1.000 USD al año por instancia de base de datos.

**Aurora Serverless v2 vs IR Estándar — El Punto de Equilibrio**

Tom sacó los números para su configuración específica de Aurora. La pregunta: ¿estaba el autoescalado de Aurora Serverless v2 proporcionando suficiente beneficio, o sería más barata una instancia aprovisionada fija con un compromiso de Instancia Reservada?

Precios de Serverless v2: 0,12 USD por ACU-hora. Su clúster escalaba entre 0,5 ACU (inactivo) y 16 ACU (carga pico). En los últimos 30 días, el promedio fue de 4,2 ACU.

Coste mensual de Serverless v2: 4,2 ACU × 0,12 USD × 730 horas = 368 USD/mes para el escritor.

Compara: una db.r6g.2xlarge fija (su equivalente aprovisionado estimado, dimensionado para gestionar la carga en p95) con una IR de 1 año: 0,48 USD/hora × 0,60 (descuento de IR) × 730 = 210 USD/mes.

"La IR es más barata," dijo Leo.

"Para una carga fija, sí," dijo Tom. "Pero mira la dispersión. Nuestro período de bajo tráfico —de 2 AM a 7 AM, de lunes a jueves— promedia 0,8 ACU. En una instancia aprovisionada fija, estaríamos pagando 8 veces lo que usamos durante esas horas, simplemente inactivas."

"¿Y Serverless v2 escala hacia abajo para igualar?"

"A 0,5 ACU. El coste de inactividad es una fracción de lo que pagaríamos por una instancia aprovisionada dimensionada para el pico."

El cálculo del punto de equilibrio: Serverless v2 es más barato cuando tu proporción pico/línea base está por encima de aproximadamente 4:1. Para Nimbus, con picos de viernes a 16 ACU y mínimos de lunes por la mañana a 0,8 ACU —una proporción de 20:1—, Serverless v2 era la elección correcta. Si su tráfico hubiera sido más consistente (digamos, 8 ACU ± 20%), una IR aprovisionada habría sido más barata.

"No se trata solo de qué número es más pequeño este mes," dijo Tom. "Se trata de qué modelo gestiona nuestro crecimiento correctamente. Si crecemos un 50% el próximo trimestre, Serverless v2 simplemente escala hacia arriba. Una IR aprovisionada necesitaría redimensionarse, y estaríamos pagando por un margen no utilizado durante la transición."

Tom trazó la comparación a lo largo del año de forma explícita para que el equipo pudiera seguir el razonamiento, no solo la conclusión.

**Coste mensual de Aurora: Serverless v2 vs IR aprovisionada**

La opción aprovisionada: una db.r6g.2xlarge con una Instancia Reservada de 1 año. Coste: 0,48 USD/hora bajo demanda × 0,60 (descuento de IR) × 730 horas = 210 USD/mes. Fijo, independientemente de la carga.

La opción Serverless v2: pago por ACU-hora a 0,12 USD. Variable, siguiendo la carga real.

Tom extrajo 30 días de métricas de ACU de Aurora Serverless v2 de CloudWatch y construyó una distribución:

- 2 AM–7 AM, lunes–jueves (bajo tráfico): promedio 0,8 ACU → 0,096 USD/hora
- 7 AM–11 AM, días de semana (moderado): promedio 3,2 ACU → 0,384 USD/hora  
- 11 AM–9 PM, días de semana (horas pico de negocio): promedio 5,8 ACU → 0,696 USD/hora
- Viernes 6 PM–10 PM (afluencia de cenas): promedio 14,1 ACU → 1,692 USD/hora
- Sábado 12 PM–8 PM (fin de semana con actividad): promedio 9,3 ACU → 1,116 USD/hora
- Domingo (el día más ligero): promedio 2,1 ACU → 0,252 USD/hora

Promedio ponderado de todo el mes: 4,2 ACU → 0,504 USD/hora → 368 USD/mes.

En una IR aprovisionada: 210 USD/mes. Serverless: 368 USD/mes. La opción aprovisionada ahorraba 158 USD/mes.

"Eso parece obvio," dijo Leo. "¿Por qué estamos en Serverless?"

"Porque 368 USD es el promedio," dijo Tom. "Mira los viernes por la noche."

Viernes 6–10 PM: 14,1 ACU promedio. Para esa ventana de cuatro horas, Serverless cuesta 1,692 USD/hora. Una db.r6g.2xlarge aprovisionada a 210 USD/mes —su capacidad máxima— eran 8 vCPUs. El clúster Serverless ejecutaba el equivalente de aproximadamente 16 vCPUs durante esa ventana.

"Una instancia aprovisionada dimensionada para nuestro pico del viernes sería una db.r6g.4xlarge," dijo Tom. "A la tarifa de IR, eso es 0,96 USD/hora × 0,60 = 0,576 USD/hora. Mensual: 420 USD/mes."

"Eso es más que el promedio de Serverless de 368 USD," dijo Maya.

"Correcto. Y si dimensionáramos la instancia aprovisionada para la línea base de los días de semana —la db.r6g.2xlarge—, los viernes por la noche serían un problema. En carga pico, estaríamos forzando el equivalente de 14 ACU en una instancia de 8 vCPUs. Eso es saturación de CPU."

"Así que tendrías que predimensionar para el pico," dijo Priya.

"Al coste de pagar por capacidad inactiva las otras 160 horas de la semana," dijo Tom. "Las cuentas de la IR aprovisionada que salen más baratas solo funcionan cuando tu proporción pico/línea base es baja. La nuestra es 20:1. Ese es exactamente el escenario para el que Serverless v2 fue diseñado."

Mostró los números uno al lado del otro:

| Opción | Mes promedio | Noche tranquila (2 AM) | Afluencia del viernes (8 PM) |
|---|---|---|---|
| Serverless v2 | 368 USD | 0,096 USD/h | 1,692 USD/h |
| IR aprovisionada (r6g.2xl) | 210 USD | 210 USD/730h = 0,288 USD/h | tope alcanzado — riesgo de saturación |
| IR aprovisionada (r6g.4xl) | 420 USD | 0,576 USD/h | margen cómodo |

"La opción Serverless es 368 USD," dijo Tom. "La opción aprovisionada correctamente dimensionada es 420 USD, y eso es antes de contabilizar el coste operativo de monitorizar y escalar manualmente la instancia aprovisionada cuando nuestros patrones de tráfico cambien el próximo trimestre."

"Y el coste operativo," dijo Priya, "no es nada despreciable."

"No. Con Serverless, no tenemos que pensar en el dimensionamiento de instancias. Aurora se encarga. Con aprovisionado, cada trimestre tendría que reevaluar si la clase de instancia actual todavía se ajusta a nuestro tráfico. Eso no es caro en tiempo, pero es algo que puede salir mal si dejamos de prestar atención."

"Irá bien siempre que no olvidemos redimensionarla," dijo Leo, y luego se contuvo. "Que es exactamente cuando no irá bien."

"Exacto," dijo Tom.

La conclusión se mantuvo: Serverless v2 a 368 USD/mes era la elección correcta para la proporción pico/línea base de 20:1 de Nimbus y la preferencia de su equipo por la simplicidad operativa. La IR aprovisionada solo era convincente para equipos con tráfico que no variaba significativamente: una proporción de 2:1 o 3:1 donde la instancia aprovisionada rara vez estaba inactiva.

"¿Qué nos haría cambiar a aprovisionado?" preguntó Maya.

"Si nuestro patrón de tráfico se aplanara," dijo Tom. "Si Nimbus creciera hasta el punto en que la línea base de bajo tráfico también fuera alta —digamos, 8 ACU a las 2 AM en lugar de 0,8—, la proporción bajaría a 2:1 y aprovisionado tendría sentido económico. Ese es un problema de negocio diferente. Uno que nos gustaría tener."


Para Aurora con Serverless v2, las Instancias Reservadas no se aplican directamente: Serverless v2 escala dinámicamente y pagas por ACU-hora. Esta es la configuración actual de Nimbus: el escritor principal de Aurora y el lector usan ambos Serverless v2. Los ahorros para Nimbus vienen de la naturaleza de autoescalado del propio Serverless v2: no pagas por capacidad no utilizada cuando el tráfico es bajo.

Los equipos que todavía ejecutan instancias Aurora fijas deberían evaluar el compromiso de IR una vez que el tipo de instancia haya sido estable durante tres o más meses.

**DynamoDB: Bajo Demanda vs Aprovisionado**

En el capítulo 9, presentamos los dos modos de capacidad de DynamoDB: bajo demanda y aprovisionado.

Nimbus había estado ejecutando DynamoDB en modo bajo demanda desde el principio. Con poco tráfico, esto era correcto: el modo bajo demanda es más caro por solicitud, pero no tiene cargo mínimo.

Ahora, con 18 meses de datos de tráfico en CloudWatch, Tom podía ver patrones.

Solicitudes de lectura promedio: 225 por segundo (aproximadamente 19,4 millones al día)
Solicitudes de escritura promedio: 60 por segundo (aproximadamente 5,2 millones al día)
Día pico (viernes): 180% del promedio de solicitudes de DynamoDB (ElastiCache absorbe ~95% de las lecturas, por lo que DynamoDB solo ve una fracción del pico general de 25x del volumen de pedidos)

**Precios bajo demanda**: 1,25 USD por millón de solicitudes de escritura, 0,25 USD por millón de solicitudes de lectura.
**Precios aprovisionados**: 0,00065 USD por unidad de capacidad de escritura por hora, 0,00013 USD por unidad de capacidad de lectura por hora.

Tom calculó el punto de equilibrio: la capacidad aprovisionada se vuelve más barata cuando la usas de forma suficientemente consistente como para que no estés pagando la prima bajo demanda durante los períodos inactivos.

(Una nota sobre los números de esta sección: reflejan la factura del equipo en aquel momento, y son ilustrativos. A finales de 2024, AWS recortó los precios bajo demanda de DynamoDB en un 50%, lo que movió sustancialmente el punto de equilibrio: hoy, la capacidad aprovisionada solo gana cuando la utilización es consistentemente alta. Rehaz siempre estas cuentas con los precios actuales.)

Con 18 meses de datos que muestran patrones diarios consistentes, la capacidad aprovisionada con **DynamoDB Auto Scaling** era la elección correcta:

- Establecer la capacidad mínima al 60% de la carga promedio
- Establecer el máximo al 250% del promedio (gestiona los picos del viernes)
- Auto Scaling ajusta la capacidad aprovisionada entre estos límites

Coste mensual de DynamoDB: bajó de 340 USD (bajo demanda) a 230 USD (aprovisionado con autoescalado). Reducción del 32%.

"Espera, ¿pero *por qué* lo haríamos así?" preguntó Maya. "Hemos estado en bajo demanda desde el principio porque no confiábamos en nuestros propios patrones de tráfico. ¿Qué cambió?"

"Dieciocho meses de datos," dijo Tom. "Ahora sabemos cómo son nuestros patrones: línea base consistente entre semana, picos los viernes, períodos tranquilos los domingos. Bajo demanda fue la decisión correcta cuando no lo sabíamos. Aprovisionado con Auto Scaling es la decisión correcta ahora que sí."

"Pero si sobreaprovisionamos," preguntó Leo, "pagamos por capacidad no utilizada."

"Ese es el riesgo," dijo Tom. "Con Auto Scaling, establecemos el mínimo lo suficientemente alto para evitar la limitación, y dejamos que AWS gestione dentro de nuestro rango."

"¿Y si nuestro patrón de tráfico cambia significativamente?"

"Entonces ajustamos los límites. Revisamos esto trimestralmente."

**ElastiCache: Dimensionamiento Correcto y la Historia con Moraleja**

La factura de ElastiCache: 185 USD/mes. Una instancia cache.r6g.large de Redis en cada AZ (dos nodos, primario + réplica).

Las métricas de CloudWatch mostraban:

- Utilización promedio de memoria: 34%
- Pico: 58%

La instancia estaba sobreaprovisionada. Un cache.r6g.medium probablemente manejaría la carga con margen.

Pero aquí Tom hizo una pausa. Recordó lo que había pasado en una empresa anterior cuando había dimensionado agresivamente una caché, y le contó al equipo la historia completa, porque era el tipo de historia que había que contar antes de encontrarte en medio de ella.

En su empresa anterior —una plataforma SaaS de informes financieros— el clúster de ElastiCache había sido un cache.r6g.large. Dos nodos, primario y réplica. Utilización promedio de memoria: 31%. Pico observado: 54%. El ingeniero de guardia que lo señaló había hecho las cuentas: un cache.r6g.medium manejaría la carga con un 25% de margen por encima del pico observado. Ahorro: 60 USD/mes —el precio en la región y la generación de nodos de aquella empresa en aquel momento, más pequeño que la brecha equivalente en Nimbus hoy—. El cambio se aprobó un martes.

El mes siguiente, un jueves por la noche a las 11:47 PM, comenzó el lote de liquidación de fin de mes.

El lote de liquidación se ejecutaba trimestralmente. Extraía los registros de transacciones de cada cuenta activa de los tres meses anteriores, los agregaba, calculaba impuestos y escribía registros de liquidación. La caché se usaba para almacenar el estado de agregación intermedio: el total acumulado de cada cuenta a medida que avanzaba el lote. El cache.r6g.large siempre lo había manejado. Nadie había mirado las métricas del lote de liquidación específicamente al tomar la decisión de dimensionamiento, porque el lote era trimestral y la ventana de observación había sido de cuatro semanas.

En la instancia medium, maxMemoryPolicy estaba configurada en `allkeys-lru`: cuando la memoria estaba llena, Redis desalojaba la clave menos usada recientemente para hacer espacio. Esa es la política correcta para una caché general. Pero para el lote de liquidación, cada clave de la caché se necesitaba activamente. Cuando la memoria se llenó al 84% de los 6,38 GB de la instancia medium, Redis empezó a desalojar claves. Cada desalojo era un fallo de caché. Cada fallo de caché enviaba una consulta a la base de datos PostgreSQL subyacente para recalcular el valor desalojado a partir de los registros de transacciones en bruto.

El pool de conexiones de la base de datos estaba configurado para tráfico en estado estable, no para la carga del lote de liquidación. A los cuatro minutos del inicio de los desalojos, la base de datos tenía 847 conexiones activas. El límite de conexiones era 1.000. A los 9 minutos, los primeros hilos de aplicación empezaron a ver errores de "demasiadas conexiones". A los 12 minutos, tres servicios que compartían el pool de conexiones de la base de datos —el lote de liquidación, el servicio de informes en tiempo real y la API de cara al cliente— estaban todos afectados.

El ingeniero de guardia escaló a las 11:59 PM. La revisión del incidente comenzó a las 12:08 AM.

Primera respuesta: aumentar el tiempo de espera de Lambda para la función del lote de liquidación (el lote de liquidación estaba parcialmente basado en Lambda). Esto fue un error. El tiempo de espera no era el problema.

Segunda respuesta: añadir una segunda función Lambda para paralelizar el lote de liquidación. También un error. Más paralelismo significaba más acceso simultáneo a la caché, lo que significaba desalojos más rápidos, lo que empeoraba la situación.

Tercera respuesta: reducir la escala del lote de liquidación para disminuir la presión sobre la base de datos. Esto ayudó ligeramente pero no abordó la causa raíz.

Cuarta respuesta, a las 2:31 AM: restaurar el cache.r6g.large. La presión de memoria bajó de inmediato. Los desalojos se detuvieron. El pool de conexiones de la base de datos se despejó. El lote de liquidación se completó a las 4:17 AM, retrasado más de cuatro horas.

Total del incidente: cuatro horas de rendimiento degradado de la API para los clientes que intentaban acceder a los informes. Un lote de liquidación completo retrasado. Tiempo de ingeniería: aproximadamente 22 horas entre cinco ingenieros. Coste directo estimado: 40.000 USD.

El ahorro de 60 USD/mes había costado 40.000 USD en un solo incidente.

"El error no fue la decisión de dimensionamiento," dijo Tom. "La decisión era defendible según los datos disponibles. El error fue la ventana de observación. Medimos cuatro semanas de métricas. El lote de liquidación era trimestral. Estábamos mirando el período de tiempo equivocado."

"¿Entonces cómo lo evitas?" preguntó Maya.

"Preguntas: ¿cuál es la operación de mayor riesgo que soporta esta caché? Y encuentras las métricas específicas de esa operación. No la semana promedio. La semana específica —o el mes— o el trimestre— cuando la carga es más alta. Y dimensionas para eso."

"¿Y si no puedes encontrar las métricas porque la operación es rara?"

"Esa es la respuesta," dijo Tom. "Si no puedes encontrar las métricas de un escenario específico de carga alta, la respuesta correcta es no dimensionar todavía. Espera a la siguiente ocurrencia, instruméntala a fondo, y luego dimensiona basándote en lo que observaste."

El clúster de ElastiCache de Nimbus tenía su propia operación de alto riesgo: la afluencia de cenas del viernes. Tom tenía esos datos: tres viernes por la noche consecutivos habían alcanzado el 58% de utilización de memoria en la r6g.large. Si pasaba a la r6g.medium y algo en el pipeline de procesamiento de pedidos cambiaba para usar más espacio de caché —una nueva función, una estrategia de caché diferente—, ese 58% podría convertirse en 80%, y el 80% en una medium es territorio de desalojos.

Sacó los números de todos modos. Pasar de r6g.large a r6g.medium: dos nodos a 0,127 USD/hora frente a dos nodos a 0,065 USD/hora, funcionando 730 horas al mes. Large: 185 USD/mes. Medium: 95 USD/mes. Ahorro potencial: 90 USD/mes. Probó la instancia medium en staging durante dos semanas bajo carga. La memoria llegó al 71%: lo suficientemente cerca del límite como para que le incomodara.

Luego puso precio a la alternativa: mantener el cache.r6g.large, pero comprar Nodos Reservados (compromiso de 1 año). De bajo demanda 185 USD a Reservado 120 USD/mes. Ahorro: 65 USD/mes sin cambiar el tipo de instancia.

"Los 65 USD/mes que ahorraría con Nodos Reservados al mismo tamaño de instancia son un ahorro real," dijo Tom. "Los 90 USD/mes que ahorraría pasando a la medium son una economía falsa si arriesgan la afluencia de cenas del viernes. A veces dimensionar correctamente a una instancia más pequeña arriesga un incidente de rendimiento: los Nodos Reservados nos dan la mayor parte del ahorro sin nada del riesgo."

Compró los Nodos Reservados para la r6g.large.

"La diferencia de 25 USD en ahorro mensual," dijo Tom, "no vale un incidente de viernes por la noche."

**Retención de Respaldo de RDS: La Compensación de Almacenamiento**

Los respaldos automatizados de RDS se almacenan en S3 (sin cargo adicional por el almacenamiento hasta el 100% del tamaño de tu base de datos). La retención predeterminada es de 7 días.

Para la base de datos Aurora de 180GB de Nimbus, 7 días de respaldos era apropiado: habían podido restaurar desde el respaldo dentro de esa ventana en las pruebas.

Pero Tom notó: también tenían instantáneas manuales de cada despliegue significativo, conservadas indefinidamente.

23 instantáneas manuales, con un total de 4,1TB de almacenamiento de instantáneas.
Coste: 0,021 USD/GB/mes para el almacenamiento de respaldos de Aurora = aproximadamente 87 USD/mes en almacenamiento de instantáneas manuales.

Conservaron las últimas 3 instantáneas manuales por entorno (producción, staging). Eliminaron el resto: aproximadamente 1,1TB conservados.
Ahorro: 64 USD/mes.

"Estábamos pagando 64 dólares al mes por un seguro que nunca usamos," dijo Leo.

"Estábamos pagando por tranquilidad," corrigió Tom. "La pregunta es: ¿cuánta tranquilidad vale 64 dólares al mes?"

"Con un plan de recuperación ante desastres adecuado," dijo Priya, "puedes obtener la misma tranquilidad con 7 días de respaldos automatizados y 3 instantáneas manuales."

"De acuerdo. Ahora."

**Variación: Cuando Aprovisionado Sale Mal**

Si tu patrón de tráfico es consistente y predecible, la capacidad aprovisionada con Auto Scaling ahorra un 30% frente a bajo demanda. Pero si se lanza una nueva función y tu volumen de escritura se dispara 5 veces de la noche a la mañana, te limitarán antes de que Auto Scaling se ponga al día: Auto Scaling reacciona al tráfico observado, lo que significa que hay un retraso. Mantener el modo bajo demanda durante las semanas que rodean el lanzamiento de una función importante es una compensación razonable: coste ligeramente mayor, sin riesgo de limitación durante un período en el que estás observando cómo cambian los patrones de tráfico en tiempo real.

Si eliminas réplicas de lectura no utilizadas (como las réplicas heredadas de PostgreSQL de Nimbus), el ahorro es inmediato e inequívoco: no hay compensación, porque las réplicas no proporcionaban ningún valor. Pero si te tienta eliminar una réplica de lectura que solo gestiona el 2% del tráfico, comprueba qué le pasa al primario cuando ese 2% no tiene adónde ir durante un pico. Algunas réplicas de lectura existen para tener margen, no para la carga actual.

**El Resumen de Optimización de la Base de Datos**

| Servicio                                              | Antes      | Después  | Ahorro Mensual |
|-------------------------------------------------------|------------|----------|----------------|
| Aurora (Serverless v2 conservado tras el análisis)    | 647 USD    | 647 USD  | 0 USD (modelo correcto) |
| Réplicas de lectura de RDS (no utilizadas)            | 340 USD    | 0 USD    | 340 USD        |
| DynamoDB (Bajo demanda → Aprovisionado + Auto Scaling)| 340 USD    | 230 USD  | 110 USD        |
| ElastiCache (Nodos Reservados)                        | 185 USD    | 120 USD  | 65 USD         |
| Instantáneas manuales de Aurora                       | 87 USD     | 23 USD   | 64 USD         |
| RDS Proxy (seguridad de conexiones)                   | 0 USD      | 88 USD   | -88 USD        |
| **Total**                                             | **1.599 USD** | **1.108 USD** | **491 USD/mes** |

491 USD al mes en ahorros de base de datos. 5.892 USD al año.

Tom puso este número junto a la limpieza de almacenamiento (6.200 USD/año), las políticas de ciclo de vida de S3 del capítulo 23 (7.800 USD/año) y los ahorros de Savings Plans (14.200 USD/año).

Impacto total de la optimización hasta la fecha: 34.092 USD/año.

"Eso es margen de maniobra real," dijo Maya.

"O varios experimentos serios," dijo Priya.

"O doce meses de experimentos," dijo Leo.

Los tres tenían razón.

## Ventajas y Limitaciones

**DynamoDB Aprovisionado con Auto Scaling**:

- Más barato que bajo demanda para cargas de trabajo predecibles y consistentes
- Auto Scaling gestiona la variabilidad sin sobre-aprovisionar permanentemente
- Requiere monitorización para garantizar que los límites de capacidad sigan siendo apropiados

**Instancias Reservadas de RDS / Nodos Reservados de ElastiCache**:

- Ahorros significativos para cargas de trabajo estables y de larga duración
- Compromiso bloqueado: si tus necesidades cambian, has pagado por capacidad no utilizada
- A diferencia de las IR Estándar de EC2, las IR de RDS **no** se pueden revender en el Marketplace de Instancias Reservadas: el Marketplace es solo para EC2. Una IR de RDS no utilizada es coste hundido, lo que hace que la decisión de dimensionamiento importe más

**El principio general**:

- Siempre entiende la utilización antes de optimizar: usa p95, no el promedio
- Los recursos no utilizados (como las réplicas de lectura heredadas) son la optimización de mayor rendimiento
- El dimensionamiento correcto requiere validación en staging antes de aplicarlo a producción, y comprobar los patrones de carga de trabajo estacionales que pueden no aparecer en una ventana de observación estándar
- Los precios reservados requieren confianza en la estabilidad de la carga de trabajo

## Resumen

- **Audita primero**: Consulta las métricas de CloudWatch antes de hacer cualquier cambio en la base de datos. Usa la latencia en p95 y la CPU en p95, no los promedios. Comprueba FreeableMemory y los máximos de conexiones.
- **Elimina los recursos no utilizados**: Réplicas de lectura, bases de datos inactivas e instancias de prueba que ya no son necesarias.
- **Vigila tu pool de conexiones**: Establece alarmas sobre DatabaseConnections al 75% y al 90% del límite. Considera RDS Proxy para la multiplexación de conexiones.
- **DynamoDB Bajo Demanda vs Aprovisionado**: Bajo demanda para tráfico impredecible; Aprovisionado + Auto Scaling para patrones consistentes.
- **Dimensionamiento correcto de ElastiCache**: Prueba en staging bajo cargas pico realistas, incluidos los picos estacionales. Los Nodos Reservados ofrecen ahorros al mismo tamaño de instancia cuando reducir agresivamente conlleva riesgo.
- **Gestión de instantáneas de RDS**: Conserva solo las instantáneas que necesitas. Las instantáneas manuales se almacenan indefinidamente a menos que se eliminen.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas Optimizadas en Coste (Dominio 4, Tarea 4.3)*

- **Modos de precios de DynamoDB**: Bajo demanda = pago por solicitud (mayor coste por unidad, sin mínimo). Aprovisionado = pago por unidad de capacidad por hora (menor coste por unidad, debe asignar capacidad). **DynamoDB Auto Scaling** ajusta la capacidad aprovisionada automáticamente.
- **Instancias Reservadas de RDS**: Disponibles para todos los tipos de motor de RDS. Los despliegues Multi-AZ pueden usar Instancias Reservadas (te comprometes con Multi-AZ). Plazo de 1 o 3 años.
- **Nodos Reservados de ElastiCache**: Mismo modelo de compromiso que las Instancias Reservadas de EC2. Se aplican por nodo, no por clúster.
- **Almacenamiento de instantáneas de RDS**: Los respaldos automatizados son gratuitos hasta el 100% del tamaño de la base de datos. Las instantáneas manuales se cobran por GB al mes en S3. Escenario del examen: "reducir los costes de almacenamiento de RDS" → eliminar instantáneas manuales antiguas.
- **Capacidad reservada de DynamoDB**: También disponible para DynamoDB (comprometido con una capacidad específica de lectura/escritura durante 1 o 3 años con descuento). Diferente del aprovisionado estándar: pre-pagas por capacidad en todas tus tablas de DynamoDB en una región.
- **Aurora Serverless v2 vs aprovisionado**: Serverless v2 escala automáticamente, ideal para cargas de trabajo variables. Aprovisionado con Instancias Reservadas es más barato para cargas de trabajo estables y predecibles.

## Ejercicios

**Ejercicio 1 — Recordatorio**

Explica cuándo debes usar la capacidad bajo demanda de DynamoDB frente a la capacidad aprovisionada con Auto Scaling. ¿Qué información necesitas para tomar esta decisión?

*(Pista: Piensa en qué significa "predecible" en términos de datos de tráfico, y qué riesgo elimina bajo demanda que introduce aprovisionado.)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: Una empresa ejecuta una tabla de DynamoDB para la tabla de clasificación de un juego para móviles. El tráfico es muy consistente durante todo el año, excepto durante un evento de temporada que está programado con meses de antelación (una semana por trimestre, alcanzando 10 veces el tráfico normal a medida que los jugadores se unen durante el primer día). La prioridad de la empresa es minimizar los costes de la base de datos durante los largos y predecibles períodos en estado estable, manteniendo el rendimiento durante las semanas conocidas del evento.

¿Qué estrategia de capacidad de DynamoDB cumple MEJOR con estos requisitos?

A) Capacidad bajo demanda para gestionar los picos de temporada sin limitación  
B) Capacidad aprovisionada establecida en los niveles de pico de temporada (siempre aprovisionado para 10x del tráfico)  
C) Capacidad aprovisionada con DynamoDB Auto Scaling, con una capacidad máxima establecida para el pico de temporada  
D) Unidades de capacidad reservada de DynamoDB para 3 años a los niveles de tráfico normal

**Pista 1**: "Tráfico muy consistente excepto por un pico de temporada programado y conocido": ¿qué modo gestiona ambos de manera eficiente? (La fortaleza de bajo demanda es el tráfico *impredecible*; este tráfico es predecible.)

**Pista 2**: "Minimizar costes" durante el fuera de pico significa que no puedes sobre-aprovisionar para 10x todo el tiempo.

**Pista 3**: DynamoDB Auto Scaling puede escalar para el evento de temporada y volver a escalar después.

**Respuesta**: C

**Explicación**: La capacidad aprovisionada con Auto Scaling escala la tabla según el tráfico real. Durante los períodos normales, la capacidad está a niveles normales (bajo coste). Durante el evento de temporada —cuyas fechas se conocen con antelación y cuyo tráfico crece gradualmente durante el primer día—, Auto Scaling sigue el aumento hasta el nivel máximo configurado (gestionando el pico de 10x), y el equipo también puede elevar el mínimo antes del inicio programado como margen adicional. Después del evento, la capacidad vuelve a escalar hacia abajo. Esto es más barato que bajo demanda durante el estado estable que domina el año (bajo demanda cuesta más por solicitud) y más barato que aprovisionar siempre para 10x.

**¿Por qué no A?** Bajo demanda gestiona los picos sin limitación, pero su fortaleza es el tráfico *impredecible*. Aquí el tráfico es muy consistente y el pico está programado y es gradual: pagar la prima por solicitud de bajo demanda durante el ~92% del año que está en estado estable contradice la prioridad declarada de minimizar costes durante los períodos normales.

**¿Por qué no B?** Aprovisionar al 10x de forma permanente significa que ~90% de la capacidad aprovisionada está sin usar durante el ~92% del año: pagando por capacidad que nunca se usa.

**¿Por qué no D?** Las unidades de capacidad reservada te bloquean en los niveles de tráfico normal. Durante el evento de temporada de 10x, estarías limitado más allá del importe reservado, o necesitarías añadir bajo demanda por encima.

*Dominio SAA-C03: Diseño de Arquitecturas Optimizadas en Coste — Tarea 4.3*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus está evaluando una nueva función: un panel de analítica de restaurantes que muestra el número de pedidos en tiempo real, los ingresos por hora y la demografía de los clientes. Estos datos consultarían una base de datos aproximadamente 200 veces por minuto (una consulta por analista por actualización de página, con 10 analistas).

Actualmente los datos de analítica están en Athena (S3). ¿Deberían construir el panel de control en Athena, o deberían cargar los datos en una base de datos? Si es una base de datos, ¿cuál (Aurora, DynamoDB, Redshift)?

Considera: frecuencia de consultas, requisitos de frescura de datos, complejidad de las consultas (agregaciones, uniones) y coste por consulta a este volumen.

*(No hay una única respuesta correcta. El objetivo es practicar la selección de base de datos para cargas de trabajo de analítica.)*

## Escena Poscréditos

Tom presentó el resumen completo de optimización de costes a Maya.

Tres meses de trabajo. 34.092 USD en ahorros anuales identificados, la mayoría ya implementados.

"¿Cuál es lo que queda?" preguntó Maya.

"Optimizaciones de las que no estoy seguro todavía," dijo Tom. "La configuración de Aurora quizás podría dimensionarse mejor, pero quiero un trimestre más de datos antes de comprometerme. Y hay una cuestión de transferencia de datos que todavía no he analizado completamente."

"Los costes de red."

"Sí. Ese es el siguiente."

Maya miró los números. "Tom, quiero entender algo. Esta optimización, has estado en ello durante tres meses. Es una parte significativa de tu tiempo."

"Aproximadamente el 30%."

"Y encontraste unos 34.000 USD al año. Entonces la optimización se amortiza en... ¿cuánto, unos pocos meses de tu salario?"

Tom la miró. "Aproximadamente eso."

"Y cada año después, son ahorros puros."

"O reinversión pura," dijo él. "El mismo efecto."

Maya asintió. "Esto es lo que quiero que estés haciendo. No solo en almacenamiento y bases de datos, en todo. Haz de la optimización de costes una función continua de tu rol."

Tom nunca había oído su trabajo descrito de esta manera. Le pareció tanto preciso como satisfactorio.

En el siguiente capítulo: la última categoría de costes restante, y la que sorprende a casi todo el mundo.
