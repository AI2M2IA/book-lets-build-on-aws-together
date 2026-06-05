# Capítulo 27: Pagando por lo que Necesitas

Tom había revisado la factura de AWS cada mes desde que comenzó Nimbus. Durante el primer año, entendía aproximadamente el 60% de lo que veía. A estas alturas, entendía casi todo, excepto la sección de EC2.

La sección de EC2 era una mezcla de "instancias bajo demanda" de varios tipos de instancia, todas con precio por hora, todas sumando 2.340 USD/mes.

"Sé que necesitamos estas instancias," dijo Tom. "Pero no entiendo por qué estamos pagando la tarifa de mostrador por todas ellas."

"¿La tarifa de mostrador?" preguntó Leo.

"Los precios bajo demanda," dijo Tom. "Es como reservar una habitación de hotel la mañana que la necesitas. Máxima flexibilidad. Máximo precio."

"¿Entonces cuál es la alternativa?"

Tom abrió la página de precios de EC2.

"Hay cuatro modelos de precios," dijo. "Y solo estamos usando uno."

**La Analogía del Hotel**

Los precios de EC2 se corresponden sorprendentemente bien con las estrategias de reserva de habitaciones de hotel:

**Bajo demanda**: Te acercas a la recepción sin reserva. Pagas la tarifa completa, pero puedes marcharte cuando quieras. Perfecto para estancias impredecibles.

**Instancias Reservadas/Savings Plans**: Reservas una habitación para todo el año con antelación. Obtienes un descuento significativo, del 30 al 72%, a cambio de comprometerte a usarla.

**Instancias Spot**: Pujas por las habitaciones no vendidas a lo que el hotel esté dispuesto a aceptar en ese momento. Hasta un 90% de descuento. Pero el hotel puede pedirte que te vayas con dos minutos de aviso si necesita la habitación para un cliente de tarifa completa.

**Hosts Dedicados**: Alquilas todo el piso del hotel exclusivamente para ti. Sin compartir con otros huéspedes. Significativamente más caro. Requerido cuando las normas de licencias de software o cumplimiento prohíben compartir un host físico.

Cada modelo tiene un caso de uso. El error que cometía Nimbus: usar bajo demanda para todo, incluidas las cargas de trabajo que funcionaban 24/7 y eran completamente predecibles.

**Instancias Bajo Demanda: Máxima Flexibilidad, Máximo Coste**

**Cuándo usar**:

- Cargas de trabajo impredecibles (picos de tráfico que no puedes prever)
- Desarrollo y pruebas (arrancar y detener con frecuencia)
- Cargas de trabajo a corto plazo (ejecutar un experimento durante una semana)
- Primer despliegue (antes de entender tus patrones de uso)

**Cuándo no usar**:

- Cargas de trabajo de producción en estado estable que sabes que se ejecutarán durante más de un año
- Cualquier cosa con una carga base predecible

Tom identificó las instancias bajo demanda de Nimbus:

- Servidores de API web: 4 instancias EC2, funcionando 24/7 durante 18 meses. *Línea base predecible.*
- Proxy de base de datos (RDS Proxy): Siempre en ejecución. *Línea base predecible.*
- Servidor VPN: Siempre en ejecución. *Línea base predecible.*
- Servidores de API adicionales para picos de tráfico: Impredecibles. *Bajo demanda es correcto aquí.*

**Instancias Reservadas: El Compromiso de un Año**

Las **Instancias Reservadas (IR)** son un compromiso de facturación: aceptas usar un tipo de instancia específico en una región específica durante 1 o 3 años. A cambio, AWS cobra una tarifa horaria más baja.

**Niveles de descuento**:

- 1 año, sin pago inicial: ~30-40% de descuento frente a bajo demanda
- 1 año, pago parcial inicial: ~35-45% de descuento (paga algo ahora, menos por hora)
- 1 año, todo el pago inicial: ~40-50% de descuento (paga el año completo ahora)
- 3 años, todo el pago inicial: ~55-72% de descuento (descuento máximo, compromiso máximo)

**IR Estándar vs Convertible**:

- **Estándar**: Bloqueado al tipo de instancia y región exactos. Se puede vender en el Marketplace de Instancias Reservadas si ya no la necesitas.
- **Convertible**: Puede cambiar el tipo de instancia, el SO y la tenencia durante el período de compromiso. Menor descuento que Estándar (~50% máx. frente al 72%).

Tom hizo los cálculos para los 4 servidores de API (r6g.large, 0,252 USD/hora bajo demanda):

- Coste anual bajo demanda: 0,252 × 24 × 365 × 4 = 8.820 USD
- IR de 1 año con todo el pago inicial (1 instancia): ~1.600 USD de pago inicial
- 4 instancias: ~6.400 USD de pago inicial = **2.420 USD ahorrados en el primer año**

"Podríamos ahorrar 2.420 dólares en el primer año simplemente comprometiéndonos," dijo Tom.

"Es un compromiso," dijo Maya. "¿Y si necesitamos cambiar los tipos de instancia?"

"Conseguimos IR Convertibles si creemos que podríamos necesitarlo."

"¿Y si AWS lanza un tipo de instancia mejor?"

"Comprobamos cuándo caduca la IR. Si el nuevo tipo es mejor, compramos una nueva IR."

**Savings Plans: El Compromiso Flexible**

Los **Savings Plans** son una alternativa más nueva y flexible a las Instancias Reservadas. En lugar de comprometerse con un tipo de instancia específico, te comprometes con una *cantidad específica de gasto horario* (en dólares).

**Compute Savings Plans**: Se aplican a cualquier instancia EC2, independientemente del tipo, tamaño, región o SO. Los más flexibles. Hasta un 66% de descuento.

**EC2 Instance Savings Plans**: Se aplican a una familia de instancias específica en una región (por ejemplo, "instancias c6g en us-east-1"). Más restrictivo que Compute, pero hasta un 72% de descuento (igual que el máximo de IR).

**SageMaker Savings Plans**: Específicos para entrenamiento e inferencia de ML con SageMaker.

Para Nimbus: Compute Savings Plans para sus servidores de API. Se comprometieron a 1,50 USD/hora de gasto en EC2. Cualquier tipo de instancia, cualquier tamaño. Cuando escalan la flota o cambian los tipos de instancia, el Savings Plan sigue aplicándose.

"Esto es mejor que las Instancias Reservadas para nosotros," dijo Leo. "Todavía estamos experimentando con tipos de instancia. El Compute Savings Plan nos da el descuento sin bloquearnos específicamente en r6g."

**Instancias Spot: El 90% de Descuento**

Las **Instancias Spot** usan la capacidad sobrante de EC2 de AWS. Cuando AWS tiene servidores sin usar, puedes alquilarlos a un 60-90% por debajo del precio bajo demanda. Cuando AWS necesita recuperar la capacidad (para clientes bajo demanda o reservados), te da un aviso de 2 minutos y termina tu instancia.

El riesgo de interrupción es la característica definitoria. Las Instancias Spot solo son apropiadas para:

- **Cargas de trabajo tolerantes a fallos**: Si una instancia termina a mitad de una tarea, la tarea puede reiniciarse sin corromper nada
- **Procesamiento sin estado**: Redimensionamiento de imágenes, codificación de vídeo, analítica por lotes, entrenamiento de ML
- **Jobs por lotes de corta duración**: El aviso de 2 minutos es suficiente para guardar el estado y crear un punto de control
- **Flotas mixtas de Auto Scaling**: Usa Spot para la mayoría de tu ASG con bajo demanda como línea base

Para Nimbus: Las Instancias Spot tenían sentido para los jobs de analítica por lotes que se ejecutaban cada noche (procesando los datos de pedidos del día en informes agregados). Si una Instancia Spot termina a mitad del job, el job falla, pero se reinicia desde el principio en una nueva instancia. Los datos en S3 están seguros.

"Usar Spot para el job nocturno redujo su coste de 12 USD/noche a 2 USD/noche," informó Leo.

**Hosts Dedicados: La Opción de Cumplimiento**

Algunas licencias de software (Oracle, Windows Server en algunas configuraciones) tienen precio por socket o núcleo físico. Cuando ejecutas este software en un host compartido (el predeterminado para EC2), podrías estar pagando por capacidad que no usas.

Los **Hosts Dedicados** te dan acceso a un servidor físico exclusivamente para tu uso. Puedes llevar tus licencias existentes por socket. No hay instancias de otros clientes de AWS en el mismo hardware.

Los Hosts Dedicados son significativamente más caros que el EC2 estándar. Son una herramienta de cumplimiento y licencias, no una herramienta de optimización de costes.

Nimbus no tenía requisitos de licencias que necesitaran Hosts Dedicados. La mayoría de las aplicaciones nativas de la nube no los necesitan.

**Construyendo una Flota Mixta**

El enfoque maduro: usar múltiples modelos de precios juntos.

Para la flota de API de Nimbus:

- **Carga base (4 instancias, siempre en ejecución)**: Cubierta por el compromiso del Savings Plan
- **Pico predecible (2 instancias adicionales durante horas de oficina)**: Cubierta por el Savings Plan si el compromiso las cubre, de lo contrario bajo demanda
- **Desbordamiento de pico de tráfico**: Instancias Spot (aceptable porque los servidores de API son sin estado: las solicitudes se redistribuyen si una instancia termina)

El resultado: una flota que optimiza el coste en cada capa: precios comprometidos para la parte predecible, bajo demanda para el crecimiento impredecible, Spot para la capacidad de ráfaga.

## Ventajas y Limitaciones

**Bajo demanda**: Sin compromiso. Precio completo. Úsalo para cargas de trabajo impredecibles o a corto plazo.

**Instancias Reservadas**: Hasta un 72% de descuento. Bloqueado a tipo de instancia/región/SO específicos. Vende la capacidad no utilizada en el Marketplace de IR.

**Savings Plans**: Hasta un 66-72% de descuento. Más flexibles que las IR (los Compute Savings Plans se aplican a cualquier tipo de instancia). Aplicación automática al uso que coincida.

**Instancias Spot**: Hasta un 90% de descuento. Riesgo de interrupción de 2 minutos. Solo para cargas de trabajo tolerantes a fallos, sin estado e interrumpibles.

**Hosts Dedicados**: Servidor físico completo. Más caro. Requerido para ciertos escenarios de licencias o cumplimiento.

## Resumen

- Los precios de EC2 tienen cuatro modelos: **Bajo demanda** (precio completo, sin compromiso), **Instancias Reservadas/Savings Plans** (gasto comprometido para un descuento significativo), **Spot** (capacidad sobrante con 60-90% de descuento, interrumpible), **Hosts Dedicados** (exclusividad del servidor físico).
- Los **Savings Plans** generalmente se prefieren a las Instancias Reservadas por su flexibilidad.
- Las **Instancias Spot** requieren cargas de trabajo tolerantes a fallos y sin estado: solo para jobs por lotes, entrenamiento de ML y procesamiento interrumpible.
- La estrategia óptima es una **flota mixta**: Savings Plans para la línea base, bajo demanda para el crecimiento impredecible, Spot para el trabajo por lotes interrumpible.
- Revisa los modelos de precios cuando las cargas de trabajo llevan funcionando de forma estable 3+ meses: ese es el momento en que el bajo demanda empieza a ser un desperdicio.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas Optimizadas en Coste (Dominio 4, Tarea 4.2)*

- **Savings Plans vs Instancias Reservadas**: Los Savings Plans son más flexibles (se aplican a cualquier instancia EC2 para Compute Savings Plans). Las Instancias Reservadas se bloquean a un tipo de instancia específico. Escenarios del examen: "necesidad de máxima flexibilidad con descuentos" → Savings Plans. "Se conoce el tipo de instancia exacto durante 3 años" → IR Estándar para descuento máximo.
- **Señales de Spot**: "sensible al coste," "tolerante a fallos," "procesamiento por lotes," "puede manejar interrupciones," "cargas de trabajo sin estado," "entrenamiento de ML" → Spot.
- **Gestión de interrupción de Spot**: Las instancias Spot reciben un aviso de 2 minutos antes de la terminación. Tu aplicación debe manejar esto de forma elegante (guardar estado, drenar conexiones, salir limpiamente).
- **Bajo demanda vs Spot para servidores web**: Los servidores web que sirven tráfico de usuarios en vivo NO deben usar Spot (la interrupción causa solicitudes fallidas). Usa bajo demanda o Savings Plans para el nivel web.
- **EC2 Savings Plans vs Compute Savings Plans**: Los EC2 Savings Plans se aplican a una familia de instancias y región específicas (mayor descuento). Los Compute Savings Plans se aplican a cualquier instancia EC2, Lambda y Fargate (menor descuento máximo, más flexible).
- **Marketplace de IR**: Las Instancias Reservadas Estándar no utilizadas se pueden vender a otros clientes de AWS. Las IR Convertibles no se pueden vender.

## Ejercicios

**Ejercicio 1 — Recordatorio**

Explica cuándo son apropiadas las Instancias Spot y cuándo no. ¿Qué característica hace que una carga de trabajo sea adecuada para Spot?

*(Pista: Piensa en qué sucede cuando la instancia termina con 2 minutos de aviso. ¿Qué cargas de trabajo se recuperan limpiamente? ¿Cuáles no?)*

**Ejercicio 2 — Práctica de Examen**

*Escenario*: Una empresa de medios ejecuta un pipeline de transcodificación de vídeo que convierte los vídeos cargados en múltiples formatos. Los trabajos de transcodificación se ejecutan continuamente siempre que se cargan vídeos (operación 24/7, volumen variable). Cada trabajo dura de 5 a 30 minutos. Si un trabajo de transcodificación se interrumpe, el trabajo puede reiniciarse desde el principio sin pérdida de datos. La empresa quiere minimizar el coste.

¿Qué modelo de precios de EC2 cumple MEJOR con estos requisitos?

A) Instancias bajo demanda en un Auto Scaling Group  
B) Instancias Reservadas (1 año, todo el pago inicial)  
C) Instancias Spot con Spot Fleet para la diversificación automática de instancias  
D) Hosts Dedicados con las licencias de software de medios existentes de la empresa

**Pista 1**: "Puede reiniciarse desde el principio sin pérdida de datos": esta es la frase clave que habilita un modelo de precios específico.

**Pista 2**: "Minimizar el coste" con una carga de trabajo interrumpible apunta a la opción de máximo descuento.

**Pista 3**: Spot Fleet solicita instancias de múltiples tipos de instancias y AZ, reduciendo la posibilidad de interrupción.

**Respuesta**: C

**Explicación**: Los trabajos de transcodificación son tolerantes a fallos: pueden reiniciarse si se interrumpen. Esto los hace ideales para las Instancias Spot, que ofrecen un 60-90% de descuento frente al precio bajo demanda. Spot Fleet diversifica entre tipos de instancias y Zonas de Disponibilidad, reduciendo la probabilidad de interrupción masiva.

**¿Por qué no A?** Bajo demanda es la opción de mayor coste. Para una carga de trabajo tolerante a fallos que se ejecuta continuamente, esto es un desperdicio.

**¿Por qué no B?** Las Instancias Reservadas proporcionan un descuento del 50-72%, pero no ofrecen el potencial de descuento del 90% de Spot para cargas de trabajo tolerantes a fallos. Además, las IR son para cargas de trabajo predecibles y en estado estable: Spot es específicamente para procesamiento por lotes interrumpible.

**¿Por qué no D?** Los Hosts Dedicados son para cumplimiento de licencias, no para optimización de costes. Son la opción más cara.

*Dominio SAA-C03: Diseño de Arquitecturas Optimizadas en Coste — Tarea 4.2*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

La infraestructura de Nimbus tiene estas cargas de trabajo:

1. Servidores de API: 6 instancias, funcionando 24/7, estables durante 2 años, usan r6g.large
2. Jobs de analítica por lotes nocturnos: 4 instancias, se ejecutan de 3 AM a 6 AM cada noche, siempre el mismo tipo de instancia
3. Entorno de pruebas: 2 instancias, usadas por ingenieros de 9 AM a 6 PM en días de semana
4. Desbordamiento de pico de tráfico: 0-8 instancias, se activan durante las horas pico, completamente impredecibles

Diseña la estrategia de precios óptima para cada tipo de carga de trabajo. ¿Qué cantidad de compromiso de Savings Plan cubriría las cargas de trabajo 1 y 2? Para la carga de trabajo 3, ¿hay una estrategia más inteligente que bajo demanda?

*(No hay una única respuesta correcta. El objetivo es practicar la estrategia de precios de EC2.)*

## Escena Poscreditos

Tom envió la compra del Savings Plan.

5,76 USD/hora de compromiso. Período de tres años. Compute Savings Plans por flexibilidad.

Los ahorros estimados: 42.500 USD en tres años.

Maya leyó el número. "Cuarenta y dos mil dólares."

"Comparado con bajo demanda para las mismas instancias, en tres años."

"¿Cuánto costó hacer esto?"

"Una tarde de análisis," dijo Tom. "Y la decisión de comprometerse."

"Tres años es mucho tiempo," dijo Leo. "¿Y si cambiamos los tipos de instancia?"

"Los Compute Savings Plans se aplican a cualquier tipo de instancia EC2. Y en tres años, somos lo suficientemente grandes como para que esta conversación luzca diferente de todas formas."

Leo pensó en eso.

"¿Cuánto tiempo llevas sabiendo sobre los Savings Plans?" preguntó.

"Desde que empezamos," dijo Tom. "Estaba esperando hasta que la carga de trabajo fuera suficientemente estable para comprometerse."

"Dieciocho meses pagando bajo demanda mientras esperaba."

"Sí." Tom cerró la consola. "A veces lo más caro que puedes hacer es esperar para ahorrar dinero."

En el siguiente capítulo: la misma disciplina aplicada a los costes de almacenamiento, con algunas sorpresas sobre lo que está impulsando la factura.
