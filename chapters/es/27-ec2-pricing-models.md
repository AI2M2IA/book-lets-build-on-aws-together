# Capítulo 27: Pagando por lo que Necesitas

Tom preparó café antes de abrir la pestaña de facturación. Siempre lo hacía: algunos informes se afrontaban mejor en caliente. Se acomodó en la silla junto a la ventana, taza en mano, con la mañana de sábado todavía tranquila afuera. Sin notificaciones, sin reuniones de seguimiento. Solo la hoja de cálculo y los números.

Abrió la pestaña.

**Recapitulación: De la Información de Athena a la Factura**

La analítica con Athena del capítulo anterior había logrado algo inesperado: al consultar los informes de costes y uso directamente desde S3, Tom por fin podía ver no solo una factura total de AWS, sino un desglose de lo que cada servicio costaba en realidad, semana a semana, a lo largo de seis meses. La imagen que emergió fue lo bastante clara como para resultar alarmante. EC2 era la partida más grande con diferencia, y el patrón era inconfundible: el equipo había estado pagando tarifas de mostrador por un hotel en el que vivían a tiempo completo. Esa constatación llevó a Tom a la página de precios de EC2 un sábado por la mañana con una taza de café recién hecho y la determinación de entender cada opción antes de que llegara la siguiente factura mensual.

Tom había revisado la factura de AWS cada mes desde que comenzó Nimbus. Durante el primer año, entendía aproximadamente el 60% de lo que veía. A estas alturas, entendía casi todo, excepto por qué la sección de EC2 siempre le hacía sentir que estaban pagando de más. La sección de EC2 era una mezcla de "instancias bajo demanda" de varios tipos de instancia, todas con precio por hora, todas sumando 2.340 USD/mes.

Antes de llamar a nadie, dedicó una hora a revisar él mismo la lista de instancias, no para concluir nada, sino para formar suposiciones que pudiera comprobar.

Vio cuatro instancias r6g.large etiquetadas como "api-prod". Vio dos instancias c6g.medium ejecutando los procesadores de tareas en segundo plano. Vio una t3.medium etiquetada como "vpn-server" que llevaba funcionando desde el tercer mes de existencia de la empresa. Vio un par de instancias etiquetadas como "analytics-batch" que aparecían a las 3 AM y desaparecían antes de las 7 AM cada noche.

Escribió una columna de suposiciones:

- Servidores de API: predecibles, siempre en ejecución.
- Procesadores en segundo plano: probablemente predecibles.
- Servidor VPN: siempre en ejecución, nunca cambia.
- Analítica por lotes: ¿quizás elegible para Spot?

Luego escribió en el margen: *verificar cada una antes de decidir nada.*

Esa disciplina —separar "lo que supongo" de "lo que sé"— era lo que hacía útiles las revisiones de costes de Tom. Llamó a los demás.

"Podríamos simplemente seguir pagando la tarifa de mostrador," dijo Tom, cuando los demás se unieron a la llamada. "Pero no lo haremos."

"¿La tarifa de mostrador?" preguntó Leo.

"Los precios bajo demanda," dijo Tom. "Es como reservar una habitación de hotel la mañana que la necesitas. Máxima flexibilidad. Máximo precio."

"¿Cuál es la alternativa?"

**La Analogía del Hotel**

Tom lo pensó un momento. "¿Sabes cómo algunas personas reservan una habitación de hotel la mañana que llegan? Esos somos nosotros ahora mismo. Hay mejores estrategias: reservar con seis meses de antelación y obtener un descuento, tomar una habitación no vendida a último minuto por una ganga, o alquilar todo el piso si necesitas todo el piso. Mismo hotel, cuatro precios diferentes."

Leo lo miró. "¿Y las versiones de AWS de esas son?"

Tom abrió la página de precios de EC2. "Hay cuatro modelos de precios. Y solo estamos usando uno."

Los precios de EC2 se corresponden sorprendentemente bien con las estrategias de reserva de habitaciones de hotel:

**Bajo demanda**: Te acercas a la recepción sin reserva. Pagas la tarifa completa, pero puedes marcharte cuando quieras. Perfecto para estancias impredecibles.

**Instancias Reservadas/Savings Plans**: Reservas una habitación para todo el año con antelación. Obtienes un descuento significativo —del 30 al 72%— a cambio de comprometerte a usarla.

**Instancias Spot**: Tomas una habitación no vendida a la tarifa rebajada del hotel —sin regatear, el hotel fija el precio según lo vacío que esté—. Hasta un 90% de descuento. Pero el hotel puede pedirte que te vayas con dos minutos de aviso si necesita la habitación para un cliente de tarifa completa. (Hace años tenías que *pujar* por la capacidad Spot; AWS retiró las pujas en 2017: simplemente pagas el precio Spot actual.)

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

**Hibernación de EC2: Pausar sin Perder el Estado**

Una técnica de optimización de costes que no recibe suficiente atención es la **Hibernación de EC2**. Cuando detienes una instancia normal, el contenido de la RAM se pierde: el siguiente arranque es un arranque en frío. El sistema operativo arranca, la aplicación se inicializa, las conexiones a la base de datos se restablecen. Para la mayoría de los servidores web de producción, esto está bien. Para ciertas cargas de trabajo, es costoso.

Cuando hibernas una instancia, el contenido de la RAM se guarda en el volumen raíz de EBS antes del apagado. En el siguiente arranque, la instancia reanuda exactamente donde se quedó —procesos en ejecución, conexiones establecidas, estado de la aplicación intacto— en una fracción del tiempo que tardaría un arranque en frío. Es particularmente útil para trabajos de análisis de larga duración que quieres pausar durante la noche sin perder el estado, o para instancias de desarrollo que tardan varios minutos en arrancar y configurar su entorno.

"Tengo una instancia de ciencia de datos," dijo Leo, mirando la impresión. "Tarda nueve minutos en arrancar. Entorno personalizado, una docena de paquetes de Python, algunos pesos de modelo precargados. La detengo cada noche y la reinicio cada mañana."

"Así que pasas nueve minutos viéndola arrancar cada día," dijo Tom.

"Sí."

"Eso son 45 minutos a la semana de tiempo de ingeniería esperando a una instancia EC2."

"Sí."

"Hiberna esa."

Con la hibernación, la instancia de Leo se pausaba al final del día, guardaba su RAM en el volumen raíz de EBS y reanudaba en menos de 90 segundos a la mañana siguiente. Las sesiones de análisis continuaban exactamente donde las había dejado.

Requisitos de hibernación: la hibernación debe estar **habilitada en el lanzamiento**; no puedes activarla en una instancia que ya está en ejecución (Leo tuvo que relanzar su instancia de ciencia de datos desde una AMI para conseguirlo). Las instancias deben tener hasta 150 GB de RAM (el contenido de la RAM tiene que caber en el volumen raíz de EBS), el volumen raíz debe ser lo bastante grande para almacenar tanto el SO como el volcado de RAM, y el volumen raíz debe estar cifrado (la hibernación guarda en disco datos sensibles que están en memoria). Las instancias bare-metal y las instancias con más de 150 GB de RAM no admiten la hibernación. Un límite más: una instancia puede permanecer hibernada como máximo **60 días**; después de eso debe ser arrancada, detenida o terminada; no puede dormir indefinidamente.

Tom identificó las instancias bajo demanda de Nimbus:

- Servidores de API web: 4 instancias EC2, funcionando 24/7 durante 18 meses. *Línea base predecible.*
- Servidor VPN: Siempre en ejecución. *Línea base predecible.*
- Servidores de API adicionales para picos de tráfico: Impredecibles. *Bajo demanda es correcto aquí.*

"Espera, ¿pero *por qué* los servidores de los picos se quedarían en bajo demanda?" preguntó Maya. "Si tenemos picos cada viernes, ¿no es eso lo bastante predecible para comprometernos?"

Tom lo consideró. "La línea base es predecible. El pico es predecible en cuanto al momento, pero no en cuanto a la magnitud. Algunos viernes por la noche están un 30% por encima de lo normal; otros un 150% por encima. Si compro capacidad Reservada para seis instancias y un pico solo necesita dos extra, me he comprometido de más. Si compro para dos y el pico necesita ocho, me quedo corto y el excedente se ejecuta en bajo demanda de todos modos. Para la capacidad de ráfaga en concreto, bajo demanda o Spot es lo correcto: no puedes comprar una Instancia Reservada en tiempo real cuando el tráfico empieza a subir."

Hay una razón por la que la lista de "cuándo no usar" importa: si llevas seis meses ejecutando las mismas instancias y puedes predecir que seguirán funcionando, cada mes en bajo demanda es un mes en el que pagas la tarifa de mostrador por una habitación que ocupas permanentemente.

**Instancias Reservadas: El Compromiso de un Año**

Las **Instancias Reservadas (IR)** son un compromiso de facturación: aceptas usar un tipo de instancia específico en una región específica durante 1 o 3 años. A cambio, AWS cobra una tarifa horaria más baja.

**Niveles de descuento**:

- 1 año, sin pago inicial: ~30-40% de descuento frente a bajo demanda
- 1 año, pago parcial inicial: ~35-45% de descuento (paga algo ahora, menos por hora)
- 1 año, todo el pago inicial: ~40-50% de descuento (paga el año completo ahora)
- 3 años, todo el pago inicial: ~55-72% de descuento (descuento máximo, compromiso máximo)

**IR Estándar vs Convertible**:

- **Estándar**: Bloqueada al tipo de instancia y región exactos. Se puede vender en el Marketplace de Instancias Reservadas si ya no la necesitas.
- **Convertible**: Puede cambiar el tipo de instancia, el SO y la tenencia durante el período de compromiso. Menor descuento que Estándar (hasta ~66% frente al 72%).

Tom hizo los cálculos para los 4 servidores de API (r6g.large, unos 0,101 USD/hora bajo demanda):

- Coste anual bajo demanda: 0,101 × 24 × 365 × 4 ≈ 3.540 USD
- IR de 1 año con todo el pago inicial (1 instancia): ~520 USD de pago inicial (≈41% de descuento)
- 4 instancias: ~2.080 USD de pago inicial = **unos 1.460 USD ahorrados en el primer año**

"Podríamos ahorrar casi mil quinientos dólares en el primer año simplemente comprometiéndonos," dijo Tom. "¿Cuánto cuesta eso por mes, exactamente, cada instancia reservada comparada con lo que pagamos ahora?"

"Está concentrado al inicio," dijo Maya. "Pagas el año completo por adelantado."

"Espera, ¿pero *por qué* nos comprometeríamos a la IR Estándar si los tipos de instancia todavía están evolucionando?" preguntó Maya. "¿Y si r6g se vuelve obsoleto el año que viene?"

"Conseguimos IR Convertibles si creemos que podríamos necesitar cambiar. Menor descuento —hasta ~66% en lugar de 72%— pero la flexibilidad de cambiar de familia de instancias durante el período de compromiso."

"¿Y si AWS lanza un tipo de instancia mejor después de que nos comprometamos?"

"Comprobamos cuándo caduca la IR. Si el nuevo tipo es mejor, compramos una nueva IR para el siguiente período. La IR actual sigue su curso al precio comprometido."

Tom mostró la comparación del punto de equilibrio en la pantalla compartida para que todos pudieran seguirlo:

**Comparación de tres opciones: r6g.large, 4 instancias, 12 meses**

| Opción | Coste anual | Equivalente mensual | Flexibilidad |
|---|---|---|---|
| Bajo demanda (0,101 USD/h × 4) | 3.540 USD | 295 USD | Total |
| Compute Savings Plan (~34% de descuento a 1 año, 0,27 USD/h comprometidos) | 2.365 USD | 197 USD | Alta |
| IR Estándar, 1 año todo el pago inicial (4 × 520 USD) | 2.080 USD | 173 USD | Baja |

"Espera," dijo Leo. "¿La IR es más barata que el Savings Plan?"

"Al mismo plazo, sí: ese es el precio de la flexibilidad," dijo Tom. "Un Compute Savings Plan se aplica a *cualquier* tipo de instancia, tamaño, región, incluso Fargate y Lambda, así que su descuento máximo es menor: hasta un 66% en el nivel de 3 años. Una IR Estándar, o un EC2 Instance Savings Plan, te bloquea a una familia de instancias y te paga por ese bloqueo con descuentos de hasta el 72%. Cuanta más libertad conserves, menos te descuenta AWS."

"¿Cuál es el punto de equilibrio de la IR de 3 años?"

"3 años con todo el pago inicial: unos 1.060 USD por instancia, así que 4.240 USD en total para las cuatro, lo que compra 36 meses. Equivalente mensual: 118 USD, frente a 295 USD bajo demanda. El pago inicial se amortiza hacia el mes catorce; después de eso, estás en territorio de ahorro durante casi dos años más."

"Así que si decidimos en el mes cuatro que necesitamos una familia de instancias diferente," dijo Priya, "seguimos pagando por el compromiso original."

"Correcto. Puedes vender IR Estándar en el Marketplace de IR, pero no siempre a su valor completo. Las IR Convertibles se pueden intercambiar pero no vender. Por eso el Savings Plan suele ser la opción más segura: mismo principio, menos bloqueo."

**Savings Plans: El Compromiso Flexible**

Los **Savings Plans** son una alternativa más nueva y flexible a las Instancias Reservadas. En lugar de comprometerte con un tipo de instancia específico, te comprometes con una *cantidad específica de gasto horario* (en dólares).

**Compute Savings Plans**: Se aplican a cualquier instancia EC2, independientemente del tipo, tamaño, región o SO. Los más flexibles. Hasta un 66% de descuento.

**EC2 Instance Savings Plans**: Se aplican a una familia de instancias específica en una región (por ejemplo, "instancias c6g en us-west-2"). Más restrictivos que Compute, pero hasta un 72% de descuento (igual que el máximo de IR).

**SageMaker Savings Plans**: Específicos para entrenamiento e inferencia de ML con SageMaker.

Para Nimbus: Compute Savings Plans para sus servidores de API. Se comprometieron a 0,45 USD/hora de gasto en cómputo. Cualquier tipo de instancia, cualquier tamaño, y el compromiso también cubre Fargate y Lambda, lo que importó para lo que vino después. Cuando escalan la flota o cambian los tipos de instancia, el Savings Plan sigue aplicándose.

"Esto es mejor que las Instancias Reservadas para nosotros," dijo Leo. "Todavía estamos experimentando con tipos de instancia. El Compute Savings Plan nos da el descuento sin bloquearnos específicamente en r6g."

"¿Qué pasa cuando nos comprometemos a 0,45 USD/hora y algunos meses solo usamos 0,36?" preguntó Maya.

"Pagas 0,45 USD de todos modos," dijo Tom. "El compromiso es incondicional. El Savings Plan se aplica a cualquier uso que tengas hasta la cantidad comprometida. Cualquier cosa por encima se ejecuta a tarifas bajo demanda. La disciplina está en fijar el compromiso en un nivel que tengas la certeza de que siempre alcanzarás."

"Y no deberíamos comprometernos a nuestra media, deberíamos comprometernos a nuestro piso," dijo Priya.

"Exacto. Mira los últimos seis meses. Encuentra la semana más baja. Comprométete al 90% de esa cifra. Luego revisa cada trimestre a medida que crezcamos."

"¿Hemos pensado en qué pasa si nos comprometemos de más?" continuó Priya. "Compramos un plan de 2 USD/hora, luego el siguiente trimestre optimizamos y nuestro uso de cómputo baja a 1,50 USD."

"La brecha de 0,50 USD/hora se convierte en desperdicio," dijo Tom. "Estamos pagando por capacidad que ya no existe. Ese es el riesgo de fijar el compromiso demasiado alto. La revisión trimestral es exactamente para detectar esto: si nuestro uso ha caído por debajo del compromiso, sabemos que la siguiente compra debería ser menor. Un matiz importante: un Savings Plan *Compute* te sigue a Fargate y Lambda; migrar cargas de trabajo de EC2 a contenedores no lo dejaría varado. Lo que sí deja varado el compromiso es usar genuinamente menos cómputo, o mantener un *EC2 Instance* Savings Plan o una IR para una familia de instancias que dejaste de usar."

Quizás te preguntes: ¿por qué no comprar siempre Savings Plans por la cantidad máxima asequible y dejar que AWS lo resuelva? La respuesta es que el compromiso es un piso, no un techo. Si te comprometes a 5 USD/hora pero solo usas 3 USD/hora, pagas 5 USD/hora. Cada dólar de gasto comprometido que no coincide con el uso real es un dólar desperdiciado. La revisión trimestral no es opcional: es lo que mantiene el Savings Plan como una optimización en lugar de un compromiso excesivo.

**Instancias Spot: El 90% de Descuento**

Las **Instancias Spot** usan la capacidad sobrante de EC2 de AWS. Cuando AWS tiene servidores sin usar, puedes alquilarlos a un 60-90% por debajo del precio bajo demanda. Cuando AWS necesita recuperar la capacidad (para clientes bajo demanda o reservados), te da un aviso de 2 minutos y termina tu instancia.

Quizás te preguntes: ¿quién diseñaría un sistema en torno a instancias que pueden desvanecerse con dos minutos de aviso? La respuesta es: cualquiera cuyo trabajo pueda reiniciarse desde cero. Trabajos por lotes, analítica, pipelines de renderizado: ninguno de estos requiere que la instancia específica que comenzó el trabajo sea la que lo termine. El aviso de 2 minutos es suficiente para guardar un punto de control, drenar conexiones y salir limpiamente.

El riesgo de interrupción es la característica definitoria. Las Instancias Spot solo son apropiadas para:

- **Cargas de trabajo tolerantes a fallos**: Si una instancia termina a mitad de una tarea, la tarea puede reiniciarse sin corromper nada
- **Procesamiento sin estado**: Redimensionamiento de imágenes, codificación de vídeo, analítica por lotes, entrenamiento de ML
- **Jobs por lotes de corta duración**: El aviso de 2 minutos es suficiente para guardar el estado y crear un punto de control
- **Flotas mixtas de Auto Scaling**: Usa Spot para la mayoría de tu ASG con bajo demanda como línea base

Para Nimbus: Las Instancias Spot tenían sentido para los jobs de analítica por lotes que se ejecutaban cada noche (procesando los datos de pedidos del día en informes agregados). Si una Instancia Spot termina a mitad del job, el job falla, pero se reinicia desde el principio en una nueva instancia. Los datos en S3 están seguros.

Pero Leo descubrió esto por las malas antes de que el equipo entendiera del todo el patrón.

Tres meses antes, había movido el job por lotes nocturno a Spot sin incorporar lógica de puntos de control. La primera noche, la Instancia Spot funcionó bien. La segunda noche, fue interrumpida a las 4:47 AM —cuarenta y siete minutos después de iniciar un job que tardaba una hora y veinte minutos en completarse—. El job falló. El informe final de los pedidos del día anterior faltaba cuando los socios de restaurantes iniciaron sesión esa mañana.

"Ya lo había desplegado... ah," había dicho Leo, mirando la notificación del job fallido. "Asumí que iría bien. Fue bien la primera noche."

"¿Qué pasó?" había preguntado Maya.

"Interrupción de Spot. AWS necesitaba recuperar la capacidad, nos dio dos minutos, la instancia se terminó. El job no tenía punto de control. Cuando una nueva Instancia Spot se lanzó a las 5 AM para reintentar, empezó desde cero. Terminó a las 6:40 AM. Los informes llegaron con dos horas de retraso."

La solución fue sencilla: escribir resultados intermedios en S3 cada quince minutos. Cada punto de control era un estado parcial completo: suficiente para que una nueva instancia leyera el último punto de control y continuara desde ese punto en lugar de reiniciar desde el principio.

"Usar Spot para el job nocturno redujo su coste de 12 USD/noche a 2 USD/noche," informó Leo, después de implementar la solución. "Incluso con la noche mala, el coste total de ejecutarlo durante tres meses fue menor que dos semanas de precios bajo demanda."

"Irá bien," añadió Leo, "incluso si se interrumpe a mitad de ejecución, ¿verdad?"

"Con los puntos de control implementados, sí," dijo Tom. "Sin ellos, no. La tolerancia a interrupciones tiene que estar incorporada en el job, no asumida."

"¿Y qué pasa si alguien intenta entrar?" preguntó Priya. "La Instancia Spot está en hardware compartido. Si se interrumpe y se lanza una nueva, ¿hay alguna exposición de datos entre instancias?"

"No," dijo Tom. "AWS borra el almacenamiento de la instancia en la terminación. El siguiente cliente que reciba ese hardware ve una pizarra limpia. Pero es un buen instinto: siempre que uses capacidad compartida, vale la pena verificar el modelo de aislamiento."

**Diversificación de Spot Fleet**

Leo había aprendido una cosa más del job por lotes interrumpido: cuando solicitas un único tipo de Instancia Spot, estás apostando por la disponibilidad de ese tipo específico en esa AZ. Si la capacidad Spot para c5.2xlarge en us-west-2a se agota, tu job espera, o falla.

**Spot Fleet** resuelve esto permitiéndote especificar múltiples tipos de instancia y AZ en una sola solicitud. AWS cumple la flota con la combinación que tenga capacidad disponible al precio más bajo.

```
Spot Fleet request:
  Target capacity: 4 units
  Fleet diversification:
    - c5.2xlarge, us-west-2a
    - c5.2xlarge, us-west-2b
    - c5a.2xlarge, us-west-2a
    - m5.2xlarge, us-west-2a
    - c5d.2xlarge, us-west-2b
  Allocation strategy: diversified
```

Con una flota diversificada, una interrupción en un tipo de instancia o AZ afecta solo a una parte de la flota. El resto sigue funcionando. Para el job por lotes de Nimbus, ejecutar una Spot Fleet de cuatro instancias en lugar de una sola instancia grande significaba que incluso una interrupción parcial permitía que el job terminara —más lento, pero sin el reinicio completo—.

"La flota diversificada también tiende a obtener mejores precios," dijo Tom. "AWS te da el precio más bajo entre todos los tipos de tu flota. Algunas noches consigues c5a a un precio más bajo que c5 porque resultó que había capacidad allí."

"¿Cuánto cuesta eso por mes comparado con usar un solo tipo de instancia?" se preguntó Tom en voz alta: el hábito era completamente reflejo ya. Sacó el número. La Spot Fleet con precios mixtos promediaba 1,80 USD/noche frente a 2,00 USD/noche con una solicitud de un solo tipo. Pequeña diferencia en términos absolutos, pero la mejora en fiabilidad por sí sola justificaba el cambio.

"¿Y qué pasa si alguien intenta entrar en la Spot Fleet?" preguntó Priya.

"La misma respuesta de siempre," dijo Tom. "Cada instancia está aislada de las demás. La Flota no las pone automáticamente en un segmento privado compartido. Tus grupos de seguridad siguen aplicándose a cada instancia individualmente."

Los puntos de control habían hecho las interrupciones manejables, no las habían eliminado. El job seguía reiniciándose desde el último punto de control, y si el reinicio coincidía con un período de picos de precio Spot, la instancia de reemplazo podía tardar de 10 a 20 minutos en estar disponible. El trabajo ya cubierto por el último punto de control se omitía en el reinicio; el trabajo posterior se rehacía. Sobrecarga total de reproceso: pequeña, pero real.

La Spot Fleet resolvió el problema de disponibilidad de forma limpia. Al especificar cinco tipos de instancia en tres AZ, Leo redujo la probabilidad de una brecha total de capacidad a casi cero. La estrategia de asignación de AWS —diversificada— distribuyó la flota de cuatro instancias entre los pools, de modo que la interrupción de un solo pool no podía detener el job. Cuando se interrumpía una instancia, las tres restantes seguían procesando, y el punto de control significaba que la instancia de reemplazo solo retomaba el trabajo que la interrumpida había estado procesando. De principio a fin, el job nunca volvió a incumplir su plazo de informe de las 7 AM.

"¿Qué costó la diversificación en complejidad?" preguntó Maya, cuando Leo documentó esto.

"Tres líneas extra en la solicitud de Spot Fleet," dijo Leo. "El código de procesamiento no sabe ni le importa en qué tipo de instancia se está ejecutando. La complejidad vive enteramente en la configuración de la flota, no en la aplicación."

Esa era la ventaja de diseñar la aplicación para que fuera sin estado desde el principio: las decisiones de escalado y tolerancia a fallos se convertían en decisiones de infraestructura, no en decisiones de código.


**Hosts Dedicados: La Opción de Cumplimiento**

Algunas licencias de software (Oracle, Windows Server en algunas configuraciones) tienen precio por socket o núcleo físico. Cuando ejecutas este software en un host compartido (el predeterminado para EC2), podrías estar pagando por capacidad que no usas.

Los **Hosts Dedicados** te dan acceso a un servidor físico enteramente para tu uso. Puedes llevar tus licencias existentes por socket. No hay instancias de otros clientes de AWS en el mismo hardware.

Los Hosts Dedicados son significativamente más caros que el EC2 estándar. Son una herramienta de cumplimiento y licencias, no una herramienta de optimización de costes.

Nimbus no tenía requisitos de licencias que necesitaran Hosts Dedicados. La mayoría de las aplicaciones nativas de la nube no los necesitan.

**Variación: Cuando el Compromiso Sale Mal**

Si tu carga de trabajo es predecible y estable durante 12 meses, las Instancias Reservadas ofrecen el descuento máximo, pero si tus necesidades de tipo de instancia pueden cambiar significativamente durante ese período, ese bloqueo te costará una flexibilidad que vale más que la diferencia de precio. Las IR Convertibles resuelven parte de eso, pero a un descuento reducido. Los Compute Savings Plans resuelven la mayor parte, a un descuento máximo ligeramente menor que las IR Estándar.

Si usas Instancias Spot para jobs por lotes tolerantes a fallos, puedes lograr un 60-90% de ahorro, pero si las mismas instancias atienden solicitudes de usuarios en vivo, una interrupción a mitad de solicitud significa transacciones fallidas y clientes descontentos. La tolerancia de la carga de trabajo a la interrupción es la variable decisiva.

Hay un caso de mala elección más sutil: comprometerse de más con un Savings Plan. Si compras un Compute Savings Plan de 3,00 USD/hora porque tu uso de cómputo promedió 3,00 USD/hora el trimestre pasado, luego optimizas tus servicios este trimestre (reduciendo el uso total a 1,80 USD/hora), pagas los 3,00 USD/hora comprometidos de todos modos. La brecha de 1,20 USD/hora es desperdicio. (Ten en cuenta que mover cargas de trabajo de EC2 a Fargate o Lambda *no* dejaría varado un Compute Savings Plan: cubre los tres. Los riesgos de varamiento son la reducción real de uso, o el bloqueo de familia con EC2 Instance Savings Plans e IR.) Por eso importa la estrategia del piso: comprométete a tu mínimo, no a tu media. Y revisa cada trimestre.

La regla: comprométete a lo que tienes certeza. Usa bajo demanda para lo que no. Usa Spot solo para lo que pueda sobrevivir a una parada brusca.

**Construyendo una Flota Mixta**

El enfoque maduro: usar múltiples modelos de precios juntos.

Para la flota de API de Nimbus:

- **Carga base (4 instancias, siempre en ejecución)**: Cubierta por el compromiso del Savings Plan
- **Pico predecible (2 instancias adicionales durante horas de oficina)**: Cubierta por el Savings Plan si el compromiso las cubre, de lo contrario bajo demanda
- **Desbordamiento de pico de tráfico**: Instancias Spot (aceptable porque los servidores de API son sin estado: las solicitudes se redistribuyen si una instancia termina)

El resultado: una flota que optimiza el coste en cada capa: precios comprometidos para la parte predecible, bajo demanda para el crecimiento impredecible, Spot para la capacidad de ráfaga.

**Monitorización de la Utilización del Savings Plan**

Comprar un Savings Plan no es el final del trabajo. Es el comienzo de una obligación recurrente: saber si el compromiso se está ganando.

Tom puso un recordatorio en el calendario para el primer lunes de cada trimestre: revisión de la utilización del Savings Plan. La herramienta era AWS Cost Explorer. Específicamente, la pestaña "Savings Plans" bajo "Reservations and Savings Plans", que mostraba tres números que le importaban:

- **Tasa de utilización**: ¿Qué porcentaje del gasto comprometido fue realmente cubierto por uso elegible? Un número por debajo del 100% significaba que estaba pagando por un compromiso que no se estaba usando.
- **Tasa de cobertura**: ¿Qué porcentaje del uso elegible de EC2 estaba siendo cubierto por el Savings Plan, frente al que se ejecutaba a tarifas bajo demanda? Un número por debajo del 80% significaba que había uso no cubierto que un compromiso mayor capturaría.
- **Gasto bajo demanda**: La porción del gasto de EC2 no cubierta por ningún Savings Plan. Si esto crecía, o el Savings Plan estaba infradimensionado o se habían añadido nuevas cargas de trabajo fuera del alcance del compromiso.

En la primera revisión trimestral, los números se veían así:

- Utilización: 97%. El tres por ciento del gasto comprometido quedaba sin cubrir: 9,90 USD al mes sobre un compromiso de 330 USD/mes. Eso era aceptable; significaba que el compromiso estaba fijado ligeramente por encima del uso base real, lo cual era intencional.
- Cobertura: 84%. El dieciséis por ciento del uso elegible de EC2 se ejecutaba en bajo demanda. Esa era la capacidad de ráfaga: las instancias de desbordamiento que se activaban durante los picos de tráfico y no estaban cubiertas por el compromiso.
- Gasto de EC2 bajo demanda: 147 USD/mes. Las Instancias Spot (no cubiertas por los Savings Plans, con precio aparte) representaban la mayor parte del resto.

"El 97% de utilización es saludable," dijo Tom. "Significa que no nos hemos comprometido de más. Si esto fuera el 80%, sabría que habíamos comprado en exceso."

"¿Y el 84% de cobertura?" preguntó Maya.

"Eso también está bien. El 16% que es bajo demanda es la capacidad de ráfaga: instancias que funcionan durante horas en los picos, no todo el día. Necesitaríamos comprar significativamente más compromiso de Savings Plan para cubrirlas, y podría no justificarse." Sacó las cuentas: las instancias bajo demanda no cubiertas funcionaban quizás 40 horas al mes a 0,101 USD/hora por instancia. Cubrirlas con un Savings Plan requeriría un compromiso que estaríamos infrautilizando el 90% del tiempo. Mejor dejarlas en bajo demanda.

En la segunda revisión trimestral, a los seis meses, una métrica había cambiado: el gasto de EC2 bajo demanda había crecido a 290 USD/mes. La función Nimbus Instant se había lanzado, y se habían añadido varias instancias nuevas de servicios en segundo plano sin que Tom se diera cuenta.

"Estas tres instancias," dijo Tom, señalando el desglose de Cost Explorer. "Llevan tres meses funcionando en bajo demanda. Si van a seguir funcionando, deberíamos añadirlas al compromiso del Savings Plan."

La revisión trimestral lo había detectado. Sin la revisión, esas tres instancias habrían continuado a tarifas de mostrador indefinidamente.

"¿Cómo se ajusta el compromiso?" preguntó Priya.

"Compras un nuevo Savings Plan adicional encima del existente," dijo Tom. "Los Savings Plans se acumulan. Yo añadiría un Compute Savings Plan de 0,10 USD/hora para la nueva línea base. El plan existente de 0,45 USD/hora continúa hasta que termine su período de tres años. El nuevo plan inicia su propio período de tres años."

"Así que tendríamos dos Savings Plans solapados."

"Sí. Se aplican de forma independiente a cualquier uso elegible que exista. AWS los aplica en orden del más beneficioso al menos beneficioso."

"¿Hemos pensado en qué pasa si vendemos uno de esos servicios en segundo plano el año que viene?" preguntó Priya. "Nos hemos comprometido a 0,55 USD/hora durante tres años."

"Ese es el riesgo del período de tres años," dijo Tom. "Por eso el nuevo compromiso es menor: me comprometo al piso de las nuevas cargas de trabajo, no a la media. Si desmantelamos un servicio y el uso baja, los servicios restantes deberían seguir consumiendo la cantidad comprometida completa."

La disciplina de la revisión trimestral no era glamorosa. Eran quince minutos en Cost Explorer, tres números comprobados, una decisión tomada o aplazada. Pero a lo largo de tres años, esa disciplina era la diferencia entre un Savings Plan que entregaba más del 90% de utilización —ahorro genuino— y uno que se deslizaba hacia el desperdicio parcial a medida que la infraestructura evolucionaba a su alrededor.

## Ventajas y Limitaciones

**Bajo demanda**: Sin compromiso. Precio completo. Úsalo para cargas de trabajo impredecibles o a corto plazo.

**Instancias Reservadas**: Hasta un 72% de descuento. Bloqueadas a tipo de instancia/región/SO específicos. Vende la capacidad no utilizada en el Marketplace de IR.

**Savings Plans**: Hasta un 66-72% de descuento. Más flexibles que las IR (los Compute Savings Plans se aplican a cualquier tipo de instancia). Aplicación automática al uso que coincida.

**Instancias Spot**: Hasta un 90% de descuento. Riesgo de interrupción de 2 minutos. Solo para cargas de trabajo tolerantes a fallos, sin estado e interrumpibles.

**Hosts Dedicados**: Servidor físico completo. Más caro. Requerido para ciertos escenarios de licencias o cumplimiento.

## Resumen

Tom pasó el resto del sábado mapeando cada carga de trabajo de Nimbus a su modelo de precios ideal: la línea base a los Savings Plans, los jobs por lotes nocturnos a Spot, el desbordamiento impredecible a bajo demanda. El ejercicio convirtió tres meses de pagar la tarifa de mostrador en una estrategia deliberada. Los números, una vez calculados, eran difíciles de ignorar.

- Los precios de EC2 tienen cuatro modelos: **Bajo demanda** (precio completo, sin compromiso), **Instancias Reservadas/Savings Plans** (gasto comprometido para un descuento significativo), **Spot** (capacidad sobrante con 60-90% de descuento, interrumpible), **Hosts Dedicados** (exclusividad del servidor físico).
- Los **Savings Plans** generalmente se prefieren a las Instancias Reservadas por su flexibilidad.
- Las **Instancias Spot** requieren cargas de trabajo tolerantes a fallos y sin estado: solo para jobs por lotes, entrenamiento de ML y procesamiento interrumpible.
- Los **puntos de control en almacenamiento duradero** (S3) son necesarios para los jobs por lotes basados en Spot: los jobs interrumpidos deben reanudarse desde el último punto de control, no reiniciar desde cero.
- La **diversificación de Spot Fleet** entre múltiples tipos de instancia y AZ reduce el riesgo de interrupción y a menudo produce mejores precios.
- La estrategia óptima es una **flota mixta**: Savings Plans para la línea base, bajo demanda para el crecimiento impredecible, Spot para el trabajo por lotes interrumpible.
- Revisa los modelos de precios cuando las cargas de trabajo llevan funcionando de forma estable 3+ meses: ese es el momento en que el bajo demanda empieza a ser un desperdicio.
- **Revisa los compromisos de Savings Plan cada trimestre**: comprométete a tu piso, no a tu media, y ajusta a medida que cambien los patrones de uso.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas Optimizadas en Coste (Dominio 4, Tarea 4.2)*

- **Savings Plans vs Instancias Reservadas**: Los Savings Plans son más flexibles (se aplican a cualquier instancia EC2 para Compute Savings Plans). Las Instancias Reservadas se bloquean a un tipo de instancia específico. Escenarios del examen: "necesidad de máxima flexibilidad con descuentos" → Savings Plans. "Se conoce el tipo de instancia exacto durante 3 años" → IR Estándar para descuento máximo.
- **Señales de Spot**: "sensible al coste," "tolerante a fallos," "procesamiento por lotes," "puede manejar interrupciones," "cargas de trabajo sin estado," "entrenamiento de ML" → Spot.
- **Gestión de interrupción de Spot**: Las instancias Spot reciben un aviso de 2 minutos antes de la terminación. Tu aplicación debe manejar esto de forma elegante (guardar estado, drenar conexiones, salir limpiamente).
- **Bajo demanda vs Spot para servidores web**: Los servidores web que sirven tráfico de usuarios en vivo NO deben usar Spot (la interrupción causa solicitudes fallidas). Usa bajo demanda o Savings Plans para el nivel web.
- **EC2 Savings Plans vs Compute Savings Plans**: Los EC2 Savings Plans se aplican a una familia de instancias y región específicas (mayor descuento). Los Compute Savings Plans se aplican a cualquier instancia EC2, Lambda y Fargate (menor descuento máximo, más flexible).
- **Marketplace de IR**: Las Instancias Reservadas Estándar no utilizadas se pueden vender a otros clientes de AWS. Las IR Convertibles no se pueden vender.
- **Hibernación:** Guarda el contenido de la RAM en el volumen raíz de EBS al detener; lo restaura al arrancar. La instancia reanuda más rápido que un arranque en frío con todos los procesos y el estado intactos. Úsala cuando el estado de la instancia deba preservarse entre sesiones. Requiere: habilitada en el lanzamiento (no se puede añadir a una instancia existente), RAM ≤ 150 GB, volumen raíz de EBS cifrado, no disponible para instancias bare-metal; máximo 60 días hibernada. Señal de examen: "reanudar la instancia rápidamente con el estado en memoria preservado" o "la instancia de desarrollo tarda demasiado en inicializarse" → Hibernación.

## Ejercicios

**Ejercicio 1 — Recordatorio**

Explica cuándo son apropiadas las Instancias Spot y cuándo no. ¿Qué característica hace que una carga de trabajo sea adecuada para Spot?

*(Pista: Piensa en qué sucede cuando la instancia termina con 2 minutos de aviso. ¿Qué cargas de trabajo se recuperan limpiamente? ¿Cuáles no?)*

**Ejercicio 2 — Escenario SAA-C03**

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

## Escena Poscréditos

Tom envió la compra del Savings Plan.

0,45 USD/hora de compromiso. Período de tres años. Compute Savings Plans por flexibilidad.

Combinado con la Spot Fleet para el lote nocturno, el ahorro estimado: 42.500 USD en tres años, algo más de 14.000 USD al año.

Maya leyó el número. "Cuarenta y dos mil dólares."

"Comparado con ejecutar todo en bajo demanda, en tres años."

"¿Cuánto costó hacer esto?"

"Una tarde de análisis," dijo Tom. "Y la decisión de comprometerse."

"Tres años es mucho tiempo," dijo Leo. "¿Y si cambiamos los tipos de instancia?"

"Los Compute Savings Plans se aplican a cualquier tipo de instancia EC2. Y en tres años, somos lo suficientemente grandes como para que esta conversación luzca diferente de todas formas."

Leo pensó en eso.

"¿Cuánto tiempo llevas sabiendo sobre los Savings Plans?" preguntó.

"Desde que empezamos," dijo Tom. "Estaba esperando hasta que la carga de trabajo fuera suficientemente estable para comprometerme."

"Dieciocho meses pagando bajo demanda mientras esperabas."

"Sí." Tom cerró la consola. "A veces lo más caro que puedes hacer es esperar para ahorrar dinero."

En el siguiente capítulo: la misma disciplina aplicada a los costes de almacenamiento, con algunas sorpresas sobre lo que está impulsando la factura.
