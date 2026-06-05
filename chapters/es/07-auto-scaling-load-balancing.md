# Capítulo 7: El Restaurante que Crece Cuando Está Lleno

Eran las 7:43 de un viernes por la noche cuando la tasa de errores superó el 12%.

Tom lo notó primero porque Tom siempre lo notaba primero. Tenía una pestaña abierta en el panel de CloudWatch que actualizaba como otras personas revisan las redes sociales — de forma refleja, constantemente, sin llegar a querer hacerlo.

«Leo», dijo.

Leo ya estaba mirando. Tiempos de respuesta: subiendo. Solicitudes en cola: subiendo. La única instancia EC2 — incluso la más grande a la que habían actualizado el mes pasado — estaba al 94% de CPU.

«Estamos rechazando clientes», dijo Tom.

«No los estamos rechazando nosotros», dijo Leo. «El servidor sí.»

«Es lo mismo.»

Lo era. Y había estado ocurriendo cada viernes durante tres semanas. Nimbus había sobrevivido la crisis de almacenamiento — la base de datos tenía su propio disco, las fotos vivían en S3 — pero estable y escalable son problemas completamente diferentes. El sistema funcionaba. Solo que no crecía.

El equipo necesitaba que su sistema manejara carga variable automáticamente. No comprar suficiente servidor para el peor caso y desperdiciar dinero durante los tiempos tranquilos. Y no tener que correr manualmente cuando llegaban los picos de tráfico.

Hay un patrón para esto. AWS tiene dos servicios que lo implementan.

**El Concepto: Escalado Horizontal**

Hay dos formas de hacer que un sistema maneje más carga.

El **escalado vertical** significa hacer el servidor único más grande. Más CPU. Más RAM.
Hicimos esto en el Capítulo 4 cuando actualizamos de `t3.micro` a `t3.large`. Ayuda.
Pero tiene límites: solo puedes llegar hasta cierto punto, la instancia tiene que reiniciarse para redimensionarse
y sigues teniendo un único punto de fallo.

El **escalado horizontal** significa añadir más servidores. En lugar de un servidor grande, ejecutar
cinco servidores medianos. Cuando el tráfico baja, ejecutar dos. Cuando sube, ejecutar diez.

El escalado horizontal tiene ventajas que el vertical no tiene:

- Sin punto único de fallo. Si un servidor muere, los otros siguen sirviendo.
- No se requiere reinicio para añadir capacidad.
- Paga solo por lo que estás usando — añade servidores cuando los necesitas, elimínalos cuando no.
- Escalado lineal: el doble de servidores, aproximadamente el doble de rendimiento.

El inconveniente: si tienes múltiples servidores, ¿cómo saben los usuarios con cuál hablar?

**El Application Load Balancer: Una Puerta, Muchas Habitaciones**

Un **Application Load Balancer** (ALB) es la puerta principal de tu aplicación.

Los usuarios se conectan al balanceador de carga. El balanceador de carga distribuye las solicitudes entrantes
en tu flota de instancias EC2. Cada usuario ve una dirección (la URL del balanceador de carga).
Detrás de esa dirección, las solicitudes se distribuyen en tantos servidores como estén en ejecución.

Piénsalo como un gran restaurante con un puesto de anfitrión en la puerta. Los clientes llegan y
el anfitrión los dirige a una mesa disponible. El anfitrión sabe qué mesas están ocupadas y
cuáles están libres. Los clientes no necesitan saber cuántas mesas hay — simplemente
entran y el anfitrión se encarga de la distribución.

Un ALB hace esto con las solicitudes web. Recibe cada solicitud HTTP entrante y decide
qué instancia EC2 (llamada **objetivo**) debería manejarla, basándose en factores como:

- Round-robin (cada servidor tiene turnos en rotación)
- Menos solicitudes pendientes (el servidor con menos solicitudes en vuelo recibe la siguiente solicitud)
- Salud — solo los objetivos sanos reciben tráfico

Las **comprobaciones de salud** son esenciales. El ALB envía regularmente solicitudes de prueba a cada objetivo.
Si un objetivo no responde correctamente, el ALB lo marca como no saludable y deja de enviar
tráfico a él. Cuando el objetivo se recupera, el tráfico se reanuda.

Esto es automático. Configuras los parámetros de la comprobación de salud; el ALB los hace cumplir.

**Auto Scaling: El Restaurante que Abre Más Mesas**

Un ALB distribuye el tráfico entre tus servidores existentes. Pero no añade servidores
cuando necesitas más.

**Auto Scaling** lo hace.

Un **Auto Scaling Group** (ASG) es una configuración que le dice a AWS:

- El número mínimo de instancias que siempre deben estar en ejecución
- El número máximo de instancias permitidas
- Las condiciones bajo las cuales escalar hacia afuera (añadir instancias) o hacia adentro (eliminarlas)

Las condiciones de escalado se llaman **políticas**. El tipo más común:

**Seguimiento de objetivo**: «Mantén la utilización media de CPU al 70%.» Cuando la CPU media supera el
70%, AWS lanza nuevas instancias. Cuando baja, las instancias se terminan.

Esto es automático. Nadie tiene que observar las métricas. Nadie tiene que lanzar manualmente
servidores. El sistema reacciona a la carga en tiempo real.

Priya vio esto suceder en vivo durante una hora punta del viernes por primera vez. El recuento de servidores pasó de 2 a 5
en quince minutos, y luego volvió a 2 después de la hora punta.

«Eso», dijo, «es genuinamente impresionante.»

Tom estaba mirando el gráfico de costes en cambio. La factura aumentó durante la hora punta y bajó
después. «Solo pagamos por lo que usamos», dijo, igualmente impresionado.

**Cómo ALB y ASG Trabajan Juntos**

Los dos servicios están diseñados para usarse juntos.

Pones el ALB al frente. El ALB apunta a un **grupo de objetivos** — una colección de
instancias que deben recibir tráfico. El Auto Scaling Group gestiona esas instancias:
las añade al grupo de objetivos al escalar hacia afuera, las elimina al escalar hacia adentro.

El flujo:

1. El tráfico llega al ALB
2. El ALB distribuye solicitudes a los objetivos sanos
3. La CPU/carga sube en esos objetivos
4. El ASG detecta el aumento de carga, lanza nuevas instancias
5. Las nuevas instancias pasan las comprobaciones de salud, se registran en el ALB
6. El ALB empieza a enviarles tráfico
7. La carga disminuye, el ASG termina las instancias extra
8. El ALB deja de enviar tráfico a las instancias terminadas

Esto ocurre sin ninguna intervención humana.

**Plantillas de Lanzamiento: El Plano para Nuevas Instancias**

Cuando el ASG lanza una nueva instancia, necesita saber qué lanzar. Esto se define
en una **Plantilla de Lanzamiento** — una AMI, un tipo de instancia, los grupos de seguridad a aplicar
y cualquier dato de usuario (scripts de inicio que se ejecutan cuando la instancia arranca).

Un patrón común: construyes tu aplicación en una AMI personalizada (ver Capítulo 4).
Cuando el ASG necesita una nueva instancia, lanza esa AMI. La nueva instancia arranca con
tu aplicación ya instalada. No se requiere configuración manual.

Para entornos más dinámicos, también puedes usar **scripts de datos de usuario** que extraen e
instalan la última versión de tu código al arrancar. Esto es más flexible pero tarda
más en arrancar.

La elección correcta depende de cuánto tiempo necesitan tus instancias para arrancar y con qué frecuencia cambia tu
aplicación.

**Sesiones Pegajosas: Un Problema Sutil**

Aquí hay algo que tropieza a muchos equipos cuando implementan el balanceo de carga por primera vez.

Algunas aplicaciones web almacenan datos de sesión — estado de inicio de sesión, contenido del carrito de la compra —
en el propio servidor (en memoria o en el disco local). Esto funciona bien con un servidor.
Con múltiples servidores, se rompe.

Un usuario inicia sesión. La solicitud va al Servidor A. El Servidor A almacena la sesión. La siguiente
solicitud va al Servidor B. El Servidor B no tiene sesión. El usuario parece estar desconectado.

Esto se puede abordar de dos maneras:

**Sesiones pegajosas** (o afinidad de sesión): Configura el ALB para enviar siempre solicitudes
del mismo usuario al mismo servidor. Esto es una solución a corto plazo. Socava el balanceo de carga (algunos servidores reciben más usuarios «pegajosos» que otros) y crea problemas
cuando una instancia se termina.

**Diseño de aplicación sin estado**: Almacena los datos de sesión externamente — en una base de datos o
en una caché como ElastiCache (Capítulo 10). Cada servidor puede reconstruir la sesión de cualquier usuario
desde el almacén externo. Los servidores se vuelven intercambiables. Este es el enfoque correcto
para las aplicaciones escaladas horizontalmente.

Priya llamó a esto «la decisión arquitectónica más importante que tomas cuando pasas a
múltiples servidores». Tiene razón. Lo volvemos a encontrar en el Capítulo 10.

**Tipos de Balanceadores de Carga**

AWS ofrece tres tipos de balanceadores de carga, cada uno adecuado para diferente tráfico:

**Application Load Balancer (ALB)**: Tráfico HTTP y HTTPS. Capa 7 (entiende
HTTP). Puede enrutar basándose en la ruta de la URL (`/api` a un grupo, `/static` a otro),
cabeceras de host y parámetros de consulta. Esto es lo que usa la mayoría de las aplicaciones web.

**Network Load Balancer (NLB)**: Tráfico TCP, UDP y TLS. Capa 4 (no
entiende HTTP). Rendimiento extremadamente alto, millones de solicitudes por segundo, latencia muy
baja. Úsalo cuando necesitas velocidad bruta o cuando no estás tratando con HTTP.

**Gateway Load Balancer (GWLB)**: Para enrutar tráfico a través de dispositivos de red virtuales de terceros
(cortafuegos, detección de intrusiones). Raramente lo necesitarás a nivel de junior.

Para Nimbus (y para la mayoría de las aplicaciones web), ALB es la elección correcta.

## Fortalezas y Limitaciones

**Por qué ALB + Auto Scaling es potente**:

- Escalado sin tiempo de inactividad (las instancias se añaden/eliminan sin interrumpir las conexiones existentes)
- Failover automático (las instancias no saludables se eliminan del tráfico automáticamente)
- Eficiencia de costes (paga solo por las instancias en ejecución)
- Sin punto único de fallo — múltiples instancias en múltiples AZs

**Donde se complica**:

- Las aplicaciones con estado necesitan un manejo especial (sesiones pegajosas o estado externo)
- Escalar hacia afuera lleva tiempo — si el tráfico sube instantáneamente, hay un retraso antes de que las nuevas
  instancias estén listas. Puedes mitigar esto con **escalado programado** (pre-escalar
  antes de eventos conocidos) o un recuento mínimo de instancias mayor
- Más piezas móviles significa más cosas que monitorear y depurar
- Algunas aplicaciones no se pueden escalar horizontalmente fácilmente (bases de datos, ciertos sistemas heredados). El escalado horizontal funciona mejor para los niveles sin estado.

## Resumen

- El **escalado horizontal** (añadir más servidores) es preferible al escalado vertical
  (hacer un servidor más grande) porque elimina los puntos únicos de fallo y
  permite el coste elástico.
- Un **Application Load Balancer (ALB)** distribuye el tráfico HTTP/HTTPS entrante
  en múltiples objetivos EC2. Realiza comprobaciones de salud y solo enruta a las instancias sanas.
- Un **Auto Scaling Group (ASG)** ajusta automáticamente el número de instancias EC2
  basándose en políticas de escalado definidas (p. ej., utilización de CPU objetivo).
- ALB y ASG trabajan juntos: el ASG gestiona la flota, el ALB distribuye el tráfico en ella.
- Las aplicaciones con estado deben usar sesiones pegajosas (solución a corto plazo) o
  externalizar el estado (diseño correcto a largo plazo).
- Para el tráfico HTTP, usa ALB. Para el rendimiento TCP/UDP bruto, usa NLB.

## Consejos para el Examen

*Dominio SAA-C03 2 — Tarea 2.1 (arquitecturas escalables) / Dominio 3 — Tarea 3.2*

- **Las comprobaciones de salud del ASG pueden venir de EC2 o del ALB.** Las comprobaciones de salud de EC2 solo detectan
  si la instancia está en ejecución. Las comprobaciones de salud del ALB detectan si la aplicación está
  respondiendo correctamente. Las comprobaciones de salud del ALB son más exhaustivas y deben preferirse
  para las aplicaciones web.
- **El escalado de seguimiento de objetivo es la respuesta más común del examen** para las políticas de escalado.
  El escalado simple (añadir N instancias cuando se dispara una alarma) es más antiguo y menos adaptativo.
- **Escalar hacia afuera es rápido; escalar hacia adentro es lento.** AWS termina las instancias gradualmente durante
  el escalado hacia adentro para evitar interrumpir las conexiones activas — un comportamiento controlado por el ajuste de **retraso de anulación de registro** del ALB.
- **El recuento mínimo de instancias es tu suelo de resiliencia.** Si estableces el mínimo = 1
  y esa instancia falla, tu aplicación está caída antes de que el ASG pueda reaccionar. Establece
  el mínimo ≥ 2 y distribúyelo en AZs para una resiliencia real.
- **El ALB puede distribuir el tráfico en AZs automáticamente.** Con el balanceo de carga entre zonas habilitado, cada nodo del ALB distribuye solicitudes de manera uniforme en todos los objetivos registrados independientemente de la AZ. Esto es importante para la carga equilibrada cuando los recuentos de instancias de AZ difieren.

## Ejercicios

**Ejercicio 1 — Recordar**

Con tus propias palabras: ¿cuál es la diferencia entre un Application Load Balancer y
un Auto Scaling Group? ¿Qué problema resuelve cada uno y por qué normalmente
los usas juntos?

*(Pista: Uno distribuye el tráfico que ya existe; el otro ajusta cuánta
capacidad tienes.)*

**Ejercicio 2 — Práctica de Examen**

*Escenario*: El sitio web de comercio electrónico de una empresa minorista experimenta un tráfico muy variable:
tráfico bajo durante los días de semana, picos masivos los fines de semana y durante los eventos de venta flash.
Quieren que su aplicación maneje las cargas pico sin mantener capacidad no utilizada
durante los períodos tranquilos. La aplicación actualmente almacena datos de sesión en la memoria del servidor.

¿Qué cambio de arquitectura abordaría MEJOR sus requisitos de escalabilidad?

A) Actualizar a una única instancia EC2 muy grande que pueda manejar el tráfico pico  
B) Desplegar múltiples instancias EC2 detrás de un ALB con un Auto Scaling Group y
   externalizar el almacenamiento de sesiones a ElastiCache  
C) Desplegar múltiples instancias EC2 detrás de un ALB con sesiones pegajosas habilitadas  
D) Añadir manualmente instancias EC2 antes de cada pico de tráfico esperado y terminarlas
   después

**Pista 1**: «Sin mantener capacidad no utilizada» significa que necesitas escalado automático,
no una instancia grande fija o gestión manual.

**Pista 2**: El almacenamiento de sesiones en la memoria del servidor es un problema para los despliegues de múltiples instancias. ¿Qué opciones abordan esto?

**Pista 3**: La opción C usa sesiones pegajosas — eso es una solución alternativa, no una corrección.
¿Qué opción aborda tanto el escalado como el problema del almacenamiento de sesiones correctamente?

**Respuesta**: B

**Explicación**: Un ALB con un Auto Scaling Group proporciona escalado automático y elástico
— se añaden instancias durante los picos y se eliminan durante los períodos tranquilos. Mover el almacenamiento de sesiones
a ElastiCache (una caché externa) hace que la aplicación sea sin estado: cualquier
instancia puede manejar la solicitud de cualquier usuario y el ALB puede distribuir el tráfico libremente.
Esta es la solución arquitectónicamente correcta.

**¿Por qué no A?** Una única instancia grande, sin importar cuán grande sea, sigue siendo un único punto
de fallo. También desperdicia dinero durante los períodos tranquilos cuando la mayor parte de su capacidad está inactiva.

**¿Por qué no C?** Las sesiones pegajosas enrutan a un usuario a la misma instancia, lo que mitiga parcialmente
el problema de sesión pero socava el balanceo de carga. Si esa instancia
se termina (durante el escalado hacia adentro o un fallo), el usuario pierde su sesión de todas formas.

**¿Por qué no D?** El escalado manual requiere que alguien prediga correctamente los picos de tráfico
y actúe con antelación. Es lento, propenso a errores y laborioso. Auto Scaling maneja
esto automáticamente.

*Dominio SAA-C03 2 — Tarea 2.1 / Dominio 3 — Tarea 3.2*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus tiene una gran promoción próxima: un 50% de descuento en todos los pedidos durante 4 horas
el próximo sábado. El año pasado, una promoción similar causó tráfico de 10 veces lo normal. El equipo
espera que el pico sea repentino y que dure exactamente 4 horas.

Auto Scaling eventualmente reaccionará, pero hay un retraso. ¿Cómo diseñarías para este
pico conocido? ¿Cuál es la diferencia entre el escalado reactivo y el proactivo y cuándo
tiene sentido cada uno?

*(No hay una única respuesta correcta. Piensa en las acciones de escalado programadas,
el precalentamiento y las implicaciones de coste de cada enfoque.)*

## Escena Post-Créditos

El primer viernes después de desplegar Auto Scaling y el ALB, el equipo observó
las métricas juntos.

7:15 pm: dos instancias en ejecución. Carga normal.
7:45 pm: la carga sube. Auto Scaling lanza dos instancias más.
8:00 pm: cuatro instancias manejando el pico. Tiempos de respuesta estables.
9:30 pm: la carga baja. Auto Scaling termina dos instancias.
9:45 pm: de vuelta a dos instancias.

El sitio nunca se cayó. Ni una sola vez.

Leo actualizó la página de métricas tres veces, como si esperara encontrar un fallo que se había perdido.

«¿Es raro que me sienta ligeramente decepcionado de que nada se haya roto?» dijo.

«Sí», dijo Priya.

Tom miraba la factura. El coste había seguido el tráfico casi perfectamente.
«Pagamos exactamente por lo que usamos», dijo. «Ni más. Ni menos.»

Sonó genuinamente sorprendido.

A la mañana siguiente, Maya encontró un nuevo problema en los registros de errores. No una avería — peor.

«Nuestra base de datos», dijo, «está devolviendo tiempos de consulta de ocho segundos de media.»

Ocho segundos. Para una app de pedidos de restaurante.

«Cada vez que alguien carga el menú, estamos consultando cada elemento en la base de datos para
construir la página», dijo Leo. «Y ahora tenemos cuarenta y siete restaurantes.»

«¿Cuántos elementos del menú en total?» preguntó Tom.

Leo ejecutó la consulta.

«Unos veintidós mil.»

Silencio.

En el próximo capítulo: la base de datos que no requiere un DBA — solo una tarjeta de crédito.
