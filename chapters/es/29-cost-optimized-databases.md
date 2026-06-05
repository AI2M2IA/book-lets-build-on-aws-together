# Capítulo 29: La Factura de la Base de Datos

La auditoría de almacenamiento de Tom había identificado 8.800 USD en desperdicio. Pasó a las líneas de facturación de la base de datos.

RDS Aurora: 647 USD/mes.
RDS PostgreSQL (réplicas de lectura): 340 USD/mes.
ElastiCache: 183 USD/mes.

Total del nivel de base de datos: 1.170 USD/mes.

"Déjame entender cada uno antes de decidir nada," dijo. "Porque la base de datos no es el lugar donde ahorrar dinero recortando esquinas."

Esto era sabio. La mala configuración de la base de datos que causa pérdida de datos o degradación del rendimiento cuesta mucho más que los ahorros.

Piensa en una base de datos como el motor de un coche. Puedes ahorrar dinero en un coche cambiando a combustible más barato, ajustando la presión de los neumáticos y eliminando peso innecesario del maletero. Pero si intentas ahorrar dinero saltándote un cambio de aceite, arriesgas a agarrotar el motor, y un motor agarrotado cuesta mucho más que cualquier ahorro en combustible. La auditoría que Tom está a punto de realizar sigue la misma lógica: encuentra el desperdicio en el maletero y en el depósito de combustible, y deja el motor solo hasta que sepas exactamente lo que estás haciendo.

**Entender Primero tu Carga de Trabajo de Base de Datos**

La optimización de costes en las bases de datos requiere entender la carga de trabajo antes de tocar nada.

Preguntas clave:

- ¿Cuál es la utilización promedio y pico de la CPU?
- ¿Cuál es la proporción de lectura/escritura?
- ¿El almacenamiento está creciendo, estable o decreciendo?
- ¿Se están utilizando las réplicas de lectura?
- ¿La instancia está infraaprovisionada (causando ralentizaciones) o sobreaprovisionada (pagando por capacidad inactiva)?

Tom consultó las métricas de CloudWatch de los tres servicios de base de datos durante los 30 días anteriores:

**Clúster de Aurora**:

- CPU promedio: 18% (pico: 67% los viernes por la noche)
- Proporción de lectura/escritura: 14:1 (intensivo en lecturas)
- Almacenamiento: 180 GB (creciendo ~5 GB/mes)

**Réplicas de lectura (RDS PostgreSQL, separado de Aurora)**:

- Estas eran dos réplicas de lectura de RDS heredadas creadas antes de la migración a Aurora, todavía en ejecución.
- Conexiones promedio a cada una: 2 al día. CPU promedio: 3%.

"¿Por qué siguen estas en ejecución?" preguntó Tom.

Leo comprobó las fechas de creación de las instancias. "Se crearon durante la migración a Aurora como alternativa de retroceso. Las olvidamos borrar."

Ese momento, cuando algo caro ha estado funcionando durante meses sin usarse, es familiar en los entornos de nube.

Las réplicas fueron terminadas. Ahorro mensual: 340 USD.

**Instancias Reservadas de RDS: La Versión de Base de Datos**

Al igual que EC2, RDS ofrece Instancias Reservadas para el uso comprometido.

Para Aurora con Serverless v2, las Instancias Reservadas no se aplican directamente: Serverless v2 escala dinámicamente y pagas por ACU-hora. Sin embargo, si usas una configuración de instancia Aurora fija (no Serverless), las Instancias Reservadas pueden ahorrar entre un 30 y un 60%.

Tom revisó las instancias aprovisionadas de Aurora (el escritor y un lector):

- Instancia escritora: db.r6g.large, bajo demanda = 0,26 USD/hora = 190 USD/mes
- Instancia lectora: db.r6g.large, bajo demanda = 0,26 USD/hora = 190 USD/mes

Instancias Reservadas de 1 año para ambas: ~108 USD/mes cada una. Ahorro anual: 984 USD.

"Espera," dijo Leo. "Migramos a Aurora Serverless v2 en el capítulo 24. ¿Por qué está mirando Tom el precio bajo demanda para instancias aprovisionadas?"

Buena observación. Seamos precisos: el escritor principal de Aurora de Nimbus usa Serverless v2. El lector (para réplicas de lectura) también usa Serverless v2. Serverless v2 no tiene Instancias Reservadas tradicionales: pagas por ACU-hora.

Para equipos que ejecutan instancias Aurora fijas (no Serverless), las Instancias Reservadas son ahorros significativos. Para las cargas de trabajo de Serverless v2, los ahorros vienen de la naturaleza de autoescalado del servicio en sí: no pagas por capacidad no utilizada.

**DynamoDB: Bajo Demanda vs Aprovisionado**

En el capítulo 9, presentamos los dos modos de capacidad de DynamoDB: bajo demanda y aprovisionado.

Nimbus había estado ejecutando DynamoDB en modo bajo demanda desde el principio. Con poco tráfico, esto era correcto: el modo bajo demanda es más caro por solicitud, pero no tiene cargo mínimo.

Ahora, con 18 meses de datos de tráfico en CloudWatch, Tom podía ver patrones.

Unidades de capacidad de lectura promedio por día: 45.000
Unidades de capacidad de escritura promedio por día: 12.000
Día pico (viernes): 180% del promedio de solicitudes de DynamoDB (ElastiCache absorbe ~95% de las lecturas, por lo que DynamoDB solo ve una fracción del pico general de 25x del volumen de pedidos)

**Precios bajo demanda**: 1,25 USD por millón de solicitudes de escritura, 0,25 USD por millón de solicitudes de lectura.
**Precios aprovisionados**: 0,00065 USD por unidad de capacidad de escritura por hora, 0,00013 USD por unidad de capacidad de lectura por hora.

Tom calculó el punto de equilibrio: la capacidad aprovisionada se vuelve más barata cuando la usas de forma suficientemente consistente como para que no estés pagando la prima bajo demanda durante los períodos inactivos.

Con 18 meses de datos que muestran patrones diarios consistentes, la capacidad aprovisionada con **DynamoDB Auto Scaling** era la elección correcta:

- Establecer la capacidad mínima al 60% de la carga promedio
- Establecer el máximo al 250% del promedio (gestiona los picos del viernes)
- Auto Scaling ajusta la capacidad aprovisionada entre estos límites

Coste mensual de DynamoDB: bajó de 340 USD (bajo demanda) a 230 USD (aprovisionado con autoescalado). Reducción del 32%.

"Pero si sobreaprovisionamos," preguntó Leo, "pagamos por capacidad no utilizada."

"Ese es el riesgo," dijo Tom. "Con Auto Scaling, establecemos el mínimo lo suficientemente alto para evitar la limitación, y dejamos que AWS gestione dentro de nuestro rango."

"¿Y si nuestro patrón de tráfico cambia significativamente?"

"Entonces ajustamos los límites. Revisamos esto trimestralmente."

**ElastiCache: Dimensionamiento Correcto y Nodos Reservados**

La factura de ElastiCache: 183 USD/mes. Una instancia cache.r6g.large de Redis en cada AZ (dos nodos, primario + réplica).

Las métricas de CloudWatch mostraban:

- Utilización promedio de memoria: 34%
- Pico: 58%

La instancia estaba sobreaprovisionada. Un cache.r6g.medium probablemente manejaría la carga con margen.

Pasar de r6g.large (2 nodos × 0,127 USD/hora) a r6g.medium (2 nodos × 0,065 USD/hora):

- Ahorro mensual: 113 USD → espera.

En realidad, los cálculos: large = 2 × 0,127 × 730 horas = 185 USD/mes. Medium = 2 × 0,065 × 730 = 95 USD/mes. Ahorro: 90 USD/mes.

Tom probó la instancia medium en staging durante dos semanas bajo carga. La memoria llegó al 71%. Tan cerca del límite que le incomodaba.

Probó cache.r6g.large pero con Nodos Reservados (compromiso de 1 año): de bajo demanda 185 USD a Reservado 120 USD/mes. Ahorro: 65 USD/mes sin cambiar el tipo de instancia.

"A veces dimensionar correctamente a una instancia más pequeña arriesga un incidente de rendimiento," dijo. "Los Nodos Reservados nos dan el mismo ahorro con menos riesgo."

**Retención de Respaldo de RDS: La Compensación de Almacenamiento**

Los respaldos automatizados de RDS se almacenan en S3 (sin cargo adicional por el almacenamiento hasta el 100% del tamaño de tu base de datos). La retención predeterminada es de 7 días.

Para la base de datos Aurora de 180 GB de Nimbus, 7 días de respaldos era apropiado: habían podido restaurar desde el respaldo dentro de esa ventana en las pruebas.

Pero Tom notó: también tenían instantáneas manuales de cada despliegue significativo, conservadas indefinidamente.

23 instantáneas manuales, con un total de 4,1 TB de almacenamiento de instantáneas.
Coste: 0,095 USD/GB/mes para respaldos de Aurora = 389 USD/mes en almacenamiento de instantáneas manuales.

Conservaron las últimas 3 instantáneas manuales por entorno (producción, staging). Eliminaron el resto.
Ahorro: 350 USD/mes.

"Estábamos pagando 350 dólares al mes por un seguro que nunca usamos," dijo Leo.

"Estábamos pagando por tranquilidad," corrigió Tom. "La pregunta es: ¿cuánta tranquilidad vale 350 dólares al mes?"

"Con un plan de recuperación ante desastres adecuado," dijo Priya, "puedes obtener la misma tranquilidad con 7 días de respaldos automatizados y 3 instantáneas manuales."

"De acuerdo. Ahora."

**El Resumen de Optimización de la Base de Datos**

| Servicio                                              | Antes      | Después  | Ahorro Mensual |
|-------------------------------------------------------|------------|----------|----------------|
| Réplicas de lectura de RDS (no utilizadas)            | 340 USD    | 0 USD    | 340 USD        |
| Aurora (Instancias Reservadas)                        | 190 USD    | 120 USD  | 70 USD         |
| DynamoDB (Bajo demanda → Aprovisionado + Auto Scaling)| 340 USD    | 230 USD  | 110 USD        |
| ElastiCache (Nodos Reservados)                        | 185 USD    | 120 USD  | 65 USD         |
| Instantáneas manuales de Aurora                       | 389 USD    | 39 USD   | 350 USD        |
| **Total**                                             | **1.444 USD** | **509 USD** | **935 USD/mes** |

935 USD al mes en ahorros de base de datos. 11.220 USD al año.

Tom puso este número junto a los ahorros de almacenamiento (6.200 USD/año) y los ahorros de Savings Plans (14.200 USD/año).

Impacto total de la optimización: 31.620 USD/año.

"Eso son tres ingenieros junior," dijo Maya.

"O uno senior," dijo Priya.

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
- El Marketplace de IR permite vender IR de RDS no utilizadas (a diferencia de las Convertibles, que no se pueden vender)

**El principio general**:

- Siempre entiende la utilización antes de optimizar
- Los recursos no utilizados (como las réplicas de lectura heredadas) son la optimización de mayor rendimiento
- El dimensionamiento correcto requiere validación en staging antes de aplicarlo a producción
- Los precios reservados requieren confianza en la estabilidad de la carga de trabajo

## Resumen

- **Audita primero**: Consulta las métricas de CloudWatch antes de hacer cualquier cambio en la base de datos.
- **Elimina los recursos no utilizados**: Réplicas de lectura, bases de datos inactivas e instancias de prueba que ya no son necesarias.
- **DynamoDB Bajo Demanda vs Aprovisionado**: Bajo demanda para tráfico impredecible; Aprovisionado + Auto Scaling para patrones consistentes.
- **Nodos Reservados de ElastiCache**: Como las Instancias Reservadas de EC2 para Redis/Memcached. Ahorro del 30-50% para cargas de trabajo estables.
- **Gestión de instantáneas de RDS**: Conserva solo las instantáneas que necesitas. Las instantáneas manuales se almacenan indefinidamente a menos que se eliminen.
- **Dimensiona correctamente con precaución**: El dimensionamiento correcto de la base de datos arriesga incidentes de rendimiento. Prueba en staging, valida bajo carga.

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

**Ejercicio 2 — Práctica de Examen**

*Escenario*: Una empresa ejecuta una tabla de DynamoDB para la tabla de clasificación de un juego para móviles. El tráfico aumenta considerablemente durante un evento de temporada (una semana por trimestre, 10 veces el tráfico normal), pero es de lo contrario muy consistente. Fuera del evento de temporada, la empresa quiere minimizar los costes de la base de datos manteniendo el rendimiento.

¿Qué estrategia de capacidad de DynamoDB cumple MEJOR con estos requisitos?

A) Capacidad bajo demanda para gestionar los picos de temporada sin limitación  
B) Capacidad aprovisionada establecida en los niveles de pico de temporada (siempre aprovisionado para 10x del tráfico)  
C) Capacidad aprovisionada con DynamoDB Auto Scaling, con una capacidad máxima establecida para el pico de temporada  
D) Unidades de capacidad reservada de DynamoDB para 3 años a los niveles de tráfico normal

**Pista 1**: "Tráfico consistente excepto por picos de temporada conocidos": ¿qué modo gestiona ambos de manera eficiente?

**Pista 2**: "Minimizar costes" durante el fuera de pico significa que no puedes sobre-aprovisionar para 10x todo el tiempo.

**Pista 3**: DynamoDB Auto Scaling puede escalar para el evento de temporada y volver a escalar después.

**Respuesta**: C

**Explicación**: La capacidad aprovisionada con Auto Scaling escala la tabla según el tráfico real. Durante los períodos normales, la capacidad está a niveles normales (bajo coste). Durante el evento de temporada, Auto Scaling detecta el aumento de tráfico y escala al nivel máximo configurado (gestionando el pico de 10x). Después del evento, vuelve a escalar. Esto es más barato que bajo demanda durante los períodos normales (bajo demanda cuesta más por solicitud) y más barato que aprovisionar siempre para 10x.

**¿Por qué no A?** Bajo demanda gestiona los picos sin limitación, pero cuesta más por solicitud que aprovisionado durante el tráfico normal y predecible.

**¿Por qué no B?** Aprovisionar al 10x de forma permanente significa que el 75% de la capacidad aprovisionada está sin usar el 75% del año: pagando por capacidad que nunca se usa.

**¿Por qué no D?** Las unidades de capacidad reservada te bloquean en los niveles de tráfico normal. Durante el evento de temporada de 10x, estarías limitado más allá del importe reservado, o necesitarías añadir bajo demanda por encima.

*Dominio SAA-C03: Diseño de Arquitecturas Optimizadas en Coste — Tarea 4.3*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus está evaluando una nueva función: un panel de analítica de restaurantes que muestra el número de pedidos en tiempo real, los ingresos por hora y la demografía de los clientes. Estos datos consultarían una base de datos aproximadamente 200 veces por minuto (una consulta por analista por actualización de página, con 10 analistas).

Actualmente los datos de analítica están en Athena (S3). ¿Deberían construir el panel de control en Athena, o deberían cargar los datos en una base de datos? Si es una base de datos, ¿cuál (Aurora, DynamoDB, Redshift)?

Considera: frecuencia de consultas, requisitos de frescura de datos, complejidad de las consultas (agregaciones, uniones) y coste por consulta a este volumen.

*(No hay una única respuesta correcta. El objetivo es practicar la selección de base de datos para cargas de trabajo de analítica.)*

## Escena Poscreditos

Tom presentó el resumen completo de optimización de costes a Maya.

Tres meses de trabajo. 31.620 USD en ahorros anuales identificados. 26.400 USD en cambios ya implementados.

"¿Cuáles son los 5.220 USD restantes?" preguntó Maya.

"Optimizaciones de las que no estoy seguro todavía," dijo Tom. "La configuración de Aurora podría dimensionarse mejor, pero quiero un trimestre más de datos antes de comprometerme. Y hay una cuestión de transferencia de datos que todavía no he analizado completamente."

"Los costes de red."

"Sí. Ese es el siguiente."

Maya miró los números. "Tom, quiero entender algo. Esta optimización, has estado en ello durante tres meses. Es una parte significativa de tu tiempo."

"Aproximadamente el 30%."

"Y ahorraste 26.400 USD por año. Entonces la optimización se amortiza en... ¿cuánto, cuatro meses de tu salario?"

Tom la miró. "Aproximadamente eso."

"Y cada año después, son ahorros puros."

"O reinversión pura," dijo él. "El mismo efecto."

Maya asintió. "Esto es lo que quiero que estés haciendo. No solo en almacenamiento y bases de datos, en todo. Haz de la optimización de costes una función continua de tu rol."

Tom nunca había oído su trabajo descrito de esta manera. Le pareció tanto preciso como satisfactorio.

En el siguiente capítulo: la última categoría de costes restante, y la que sorprende a casi todo el mundo.
