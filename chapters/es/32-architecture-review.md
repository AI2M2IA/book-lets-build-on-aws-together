# Capítulo 32: Defendiendo el Plan

La pregunta de Maya al final del Capítulo 31: "¿Cuál es la diferencia entre tomar decisiones arquitectónicas y pensar como un arquitecto?"

Había invitado a un invitado para ayudar a responderla.

Se llamaba Carlos. Había sido ingeniero durante 20 años, gerente de ingeniería durante siete y asesor de startups durante tres. Era el tipo de persona que había visto suficientes sistemas tener éxito y fracasar como para tener intuiciones calibradas sobre ambos.

Llegó sin nada: sin diapositivas, sin agenda. Solo un marcador para la pizarra y una pregunta.

"Cuéntenme sobre Nimbus", dijo.

Una buena revisión de arquitectura es como una lista de verificación previa al vuelo para un piloto. El avión puede parecer perfectamente listo para volar: motores en marcha, combustible lleno, pasajeros a bordo. Pero la lista de verificación existe porque los pilotos experimentados saben que las cosas más propensas a causar problemas son precisamente las que parecen estar bien hasta que no lo están. La lista de verificación no significa que el piloto no sepa lo que está haciendo. Significa que ha interiorizado que incluso los expertos pasan cosas por alto cuando omiten el proceso estructurado.

**El Primer Movimiento del Arquitecto**

Lo que ocurrió después sorprendió al equipo.

Maya empezó a describir el sistema: instancias de EC2, Aurora, CloudFront, ElastiCache, DynamoDB para el menú, VPC con subredes privadas...

Carlos la detuvo suavemente.

"Empieza por el negocio", dijo. "No por la tecnología."

Ella hizo una pausa. Luego: "Nimbus es una plataforma de pedidos de restaurantes. Tenemos 287 socios restaurantes. Procesamos unos 4.200 pedidos al día. El valor promedio de un pedido es de $34. Estamos creciendo un 18% trimestre a trimestre."

"Bien. ¿Cuál es la cosa más importante que Nimbus debe hacer?"

"Procesar pedidos", dijo Leo.

"Concretamente", presionó Carlos.

"Un pedido debe llegar al restaurante en los cinco segundos posteriores a su realización", dijo Priya, "o la cocina pierde la ventana de tiempo."

"¿Qué ocurre si no lo hace?"

"El restaurante comete un error. El cliente recibe la comida equivocada o espera demasiado. Se quejan. Perdemos un socio restaurante."

"Entonces el SLA de cinco segundos", dijo Carlos, "no es un objetivo técnico. Es un requisito de supervivencia empresarial."

Silencio.

"Eso", dijo, "es por qué las conversaciones de arquitectura deben comenzar con los requisitos empresariales. La tecnología está corriente abajo de la restricción."

**La Estructura de la Revisión de Arquitectura**

Una revisión de arquitectura real, del tipo que ocurre antes de construir algo importante, o cuando se evalúa si se debe escalar, tiene una estructura.

Carlos la escribió en la pizarra:

**1. Entender las restricciones**

¿Qué debe ser verdad? ¿Qué no puede ocurrir? (No "qué queremos." Cuáles son los elementos no negociables.)

**2. Entender las incógnitas**

¿Qué no sabemos? ¿Dónde estamos haciendo suposiciones? ¿Qué ocurre si esas suposiciones son incorrectas?

**3. Evaluar las opciones**

¿Cuáles son las alternativas realistas? ¿Cuáles son las compensaciones de cada una?

**4. Identificar los modos de fallo**

¿Cómo se rompe esto? ¿Cuál es la secuencia de eventos cuando se activa cada modo de fallo?

**5. Validar el monitoreo**

¿Cómo sabrás cuando algo va mal? ¿Antes de que te lo digan los usuarios?

**6. Definir el runbook**

¿Qué hace alguien a las 3 AM cuando esto se rompe?

Este no es una lista de verificación que seguir mecánicamente. Es un marco de pensamiento. El objetivo es garantizar que las preguntas importantes se hagan *antes* de estar en producción.

**Ejecutando la Revisión: La Nueva Funcionalidad de Nimbus**

Carlos había sido invitado específicamente porque Nimbus estaba a punto de construir algo nuevo.

**La funcionalidad**: "Nimbus Instant", una garantía de entrega en 15 minutos. Si un restaurante socio no cumple la ventana de 15 minutos más de una vez por semana, Nimbus reembolsaría automáticamente al cliente.

"Guíenme por los requisitos técnicos", dijo Carlos.

Priya empezó. "Necesitamos seguimiento en tiempo real desde la realización del pedido hasta la entrega. Necesitamos comparar el tiempo real de entrega con el SLA de 15 minutos. Necesitamos activar los reembolsos automáticamente."

"¿Cuál es el requisito de latencia para los datos de seguimiento?"

"Casi en tiempo real. Los clientes ven actualizaciones de estado en sus teléfonos."

"¿En cuánto tiempo?"

"Cinco segundos probablemente."

"¿Probablemente?"

"En cinco segundos. Ese es el requisito del producto."

"Bien. Kinesis para el flujo de eventos entonces. ¿Cuál es el modo de fallo si Kinesis tiene retraso?"

"Las actualizaciones de estado llegan tarde al cliente."

"¿Es eso aceptable?"

"¿Por 10 segundos? Probablemente. ¿Por 60 segundos? No."

"¿Entonces cuál es el SLA para el sistema de seguimiento?"

Priya miró a Leo. "Todavía no tenemos uno."

Carlos escribió en la pizarra: *Incógnita: SLA del sistema de seguimiento.*

"Esto importa", dijo. "Porque el SLA determina el diseño de infraestructura. Si tu SLA es de 5 segundos, necesitas una solución diferente a la que necesitarías si fuera de 60 segundos."

**Las Preguntas que Hacen los Arquitectos**

Durante las siguientes dos horas, Carlos guió al equipo a través de la revisión. Una selección de sus preguntas:

**Sobre el almacenamiento de datos**:

"¿Dónde se almacena el estado del pedido durante el cumplimiento? Si la aplicación se cae a mitad de una entrega, ¿cuál es el proceso de recuperación? ¿Se puede reconstruir el estado solo a partir de los eventos?"

**Sobre el mecanismo de reembolso**:

"El reembolso se activa automáticamente. ¿Qué impide que se emita un reembolso dos veces? ¿Qué pasa si el procesador de pagos agota el tiempo de espera y no estás seguro de si el reembolso fue aceptado?"

**Sobre el seguimiento de la entrega**:

"Dependes de los datos GPS del mensajero. ¿Qué ocurre si la señal GPS se pierde durante 90 segundos? ¿Cómo distingues entre 'GPS perdido', 'entrega en progreso' y 'problema de entrega'?"

**Sobre el manejo de fallos**:

"Si el servicio de reembolsos está caído, ¿el pedido sigue adelante? ¿El cliente sigue recibiendo su comida? ¿Cuál es la experiencia del usuario durante un fallo parcial del sistema?"

**Sobre la observabilidad**:

"¿Cómo sabes ahora mismo cuántos pedidos están actualmente a 5 minutos del SLA de 15 minutos? Si ese número se dispara, ¿quién es notificado?"

Cada pregunta reveló una suposición que el equipo había estado haciendo sin darse cuenta.

"No habíamos pensado en el problema del doble reembolso", dijo Leo después. "Solo íbamos a llamar a la API de pago."

"Eso no está mal", dijo Priya. "Pero necesitas idempotencia. La operación de reembolso debe ser segura para llamar dos veces."

"Una clave de idempotencia: un ID único por intento de reembolso, almacenado en una base de datos antes de llamar a la API de pago. Si llamamos dos veces con la misma clave, la API de pago ignora la segunda llamada."

"Lo que significa", añadió Carlos, "que necesitas un almacén de estado persistente para las operaciones de reembolso, no solo un evento en una cola."

Este es el tipo de detalle arquitectónico que emerge en una revisión estructurada y que a menudo no emerge cuando simplemente estás construyendo.

**El Registro de Decisiones de Arquitectura**

Después de la revisión, Carlos recomendó al equipo que documentara sus decisiones en **Registros de Decisiones de Arquitectura (ADRs)**: documentos cortos que capturan:

- **Qué decisión se tomó**
- **Qué alternativas se consideraron**
- **Por qué se tomó esta decisión (el contexto y las restricciones en ese momento)**
- **Cuáles son las compensaciones**
- **Qué nos haría reconsiderar esta decisión**

"Los ADRs son para tu yo futuro", dijo Carlos. "En 18 meses, mirarás una pieza de arquitectura y te preguntarás por qué se hizo de esa manera. Si tienes un ADR, entenderás el contexto. Si no, o lo dejarás así (porque tienes miedo de tocarlo) o lo cambiarás (porque no entendiste por qué se hizo de esa manera)."

Leo escribió el primer ADR esa tarde: la decisión de usar Kinesis para los eventos de seguimiento de entregas, con el contexto, las alternativas consideradas (SQS, EventBridge, sondeo) y las compensaciones.

**Qué Hace a un Arquitecto**

Al final de la sesión, Maya hizo a Carlos la pregunta original: "¿Cuál es la diferencia entre tomar decisiones arquitectónicas y pensar como un arquitecto?"

Él lo consideró.

"Un arquitecto no sabe más tecnología que un ingeniero senior", dijo. "Un buen arquitecto probablemente sabe un poco menos de los últimos frameworks. Pero un arquitecto tiene un conjunto de preguntas predeterminadas diferente."

"¿Qué quieres decir?"

"Cuando eres un ingeniero senior mirando una nueva funcionalidad, tus primeras preguntas suelen ser: '¿Qué construimos? ¿Cómo funciona? ¿Cuál es la mejor biblioteca para esto?' Cuando un arquitecto mira la misma funcionalidad, las primeras preguntas son: '¿Qué problema resuelve esto? ¿Qué falla primero cuando el tráfico se duplica? ¿Cómo sabemos cuándo está degradado? ¿Cuál es la experiencia del usuario cuando el procesador de pagos está lento?'"

"El arquitecto pregunta por el sistema bajo estrés", dijo Leo.

"Y sobre la consecuencia empresarial de cada fallo", añadió Priya.

"Y", dijo Tom, "sobre lo que le pasa a la factura cuando esto escala."

Carlos asintió. "Todos ustedes ya están haciendo esto. Lo han estado haciendo desde el Capítulo 1. La diferencia entre un ingeniero senior y un arquitecto no es una certificación o un título. Es un hábito de hacer la siguiente pregunta: la que revela lo que todavía no habías pensado."

## Fortalezas y Limitaciones

**Revisiones de arquitectura**:

- Detectan los modos de fallo antes de que estén en producción
- Crean comprensión compartida entre los miembros del equipo que a menudo tienen conocimiento compartimentado
- Generan documentación (ADRs) que paga dividendos durante años
- Ralentizan la toma de decisiones de manera beneficiosa: "moverse rápido" sin una revisión es "moverse rápido y chocar con la pared que no veías"

**Donde se complican**:

- Requieren alguien lo suficientemente hábil como para hacer las preguntas correctas: la revisión es tan buena como el revisor
- Pueden volverse burocráticas si se tratan como una casilla para marcar en lugar de una conversación
- Algunas decisiones arquitectónicas genuinamente no necesitan una revisión completa: saber cuáles sí es en sí mismo una habilidad arquitectónica
- El resultado (ADRs, diagramas, registros de decisiones) debe mantenerse a medida que el sistema evoluciona

En el próximo capítulo: la respuesta más útil, frustrante y honesta en toda la ingeniería de software.

## Resumen

- Las revisiones de arquitectura comienzan con **los requisitos empresariales, no la tecnología**.
- La estructura de la revisión: restricciones → incógnitas → opciones → modos de fallo → monitoreo → runbooks.
- Los arquitectos preguntan: ¿Qué falla primero? ¿Cómo sabemos que está degradado? ¿Cuál es la experiencia del usuario durante el fallo? ¿Cuál es el costo a escala?
- Los **Registros de Decisiones de Arquitectura (ADRs)** capturan qué se decidió, por qué y qué causaría la reconsideración.
- Pensar como un arquitecto es un hábito: hacer la siguiente pregunta, especialmente sobre los modos de fallo, la consecuencia empresarial y la economía de escala.
- La diferencia entre tomar decisiones y ser un arquitecto está en el conjunto de preguntas predeterminadas: los arquitectos definen por defecto preguntas a nivel de sistema y de fallo, no solo preguntas de implementación.

## Consejos para el Examen

*Dominio SAA-C03: Transversal — razonamiento arquitectónico*

Este capítulo trata menos sobre temas específicos del examen y más sobre la mentalidad que evalúa el examen.

- Los **escenarios del SAA-C03** casi siempre describen primero una restricción empresarial ("la empresa no puede permitirse más de 1 hora de tiempo de inactividad") y te piden que selecciones la arquitectura que la satisface. Practica traducir las restricciones empresariales en requisitos técnicos.
- **Pensamiento en modos de fallo**: Muchas preguntas del examen describen un sistema y preguntan qué ocurre cuando un componente falla. Practica preguntar "¿qué falla primero?" para las arquitecturas que encuentres.
- **Pensamiento en compensaciones**: El examen rara vez tiene una respuesta "perfecta". Pregunta por la respuesta *mejor* dado un conjunto de restricciones. Acepta que "esta opción es correcta dados estos requisitos específicos, aunque otra opción sería mejor con requisitos diferentes."
- **Idempotencia**: El problema del doble reembolso es un desafío real de los sistemas distribuidos. Las claves de idempotencia (únicas por operación, verificadas antes de la ejecución) son la solución estándar. Conoce este patrón.
- **Registros de Decisiones de Arquitectura**: No es un servicio de AWS, sino una mejor práctica que refleja el pilar de Excelencia Operativa del Well-Architected Framework.

## Ejercicios

**Ejercicio 1 — Recuerdo**

Carlos hizo seis tipos de preguntas durante la revisión de arquitectura. ¿Puedes reconstruir las seis áreas sin mirar el capítulo?

*(Pista: Están enumeradas en la sección "Estructura de la Revisión de Arquitectura". Intenta recordarlas de memoria: el acto de intentar recordarlas (aunque falles) fortalece la retención a largo plazo.)*

**Ejercicio 2 — Práctica para el Examen**

*Escenario*: Una empresa está construyendo un sistema de gestión de pujas en tiempo real para publicidad en línea. Las pujas deben evaluarse y responderse en 100 milisegundos. El sistema procesa 1 millón de pujas por segundo en el pico. Si el sistema de pujas está caído, la empresa pierde ingresos publicitarios. El equipo de base de datos de la empresa propone usar RDS Aurora con 10 réplicas de lectura. El arquitecto de soluciones debe evaluar esta propuesta.

¿Qué preocupación debería plantear el arquitecto PRIMERO?

A) El costo de 10 réplicas de lectura de Aurora es demasiado alto para el presupuesto  
B) Las réplicas de lectura de Aurora tienen retraso de replicación que puede causar problemas de consistencia  
C) La latencia de consulta típica de Aurora de 1-5ms puede no cumplir el SLA de respuesta de 100ms  
D) RDS Aurora no soporta los volúmenes de transacciones de 1 millón de solicitudes por segundo con este requisito de latencia

**Pista 1**: La restricción principal es un tiempo de respuesta total de 100ms a 1 millón de solicitudes/segundo. ¿Cuál de estas preocupaciones amenaza directamente el cumplimiento de esta restricción?

**Pista 2**: La latencia de consulta de Aurora es típicamente de 1-5ms. 1-5ms para la consulta de base de datos deja 95-99ms para la red, la lógica de la aplicación y la serialización. ¿Está en riesgo la restricción de 100ms?

**Pista 3**: Aurora puede manejar un alto IOPS, pero 1 millón de solicitudes por segundo es una tasa extraordinaria. ¿Qué le ocurre a la arquitectura a esa escala?

**Respuesta**: D

**Explicación**: Aunque Aurora tiene un alto rendimiento, 1 millón de solicitudes por segundo con un tiempo de respuesta total de 100ms es un requisito extremo. El arquitecto debe primero cuestionar si Aurora (o cualquier base de datos relacional) puede servir como sistema principal de búsqueda a esta escala y latencia. Los sistemas como este suelen usar almacenes de datos en memoria (Redis) o bases de datos especializadas de baja latencia, no bases de datos relacionales con semántica SQL completa. El SLA de 100ms es alcanzable para las consultas de Aurora por sí solas, pero la combinación de 1 millón de solicitudes por segundo y un SLA total de 100ms supera las características de rendimiento típicas de Aurora.

**¿Por qué no A?** El costo es una preocupación válida, pero la primera preocupación debe ser si la arquitectura es técnicamente factible con los requisitos declarados.

**¿Por qué no B?** El retraso de replicación en las réplicas de lectura de Aurora es típicamente inferior a 100ms, aceptable para la mayoría de los casos de uso. Los problemas de consistencia son reales pero secundarios a la pregunta de factibilidad.

**¿Por qué no C?** La latencia de Aurora de 1-5ms está bien dentro del SLA de 100ms para la parte de la consulta de base de datos. Esta no es la preocupación principal.

*Dominio SAA-C03: Transversal — diseño de sistemas*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Aplica la estructura de revisión de arquitectura a un sistema real o hipotético:

Una startup quiere construir un juego de trivia multijugador en tiempo real. Los jugadores se unen a salas de juego (hasta 10 jugadores cada una). Cada ronda muestra una pregunta durante 15 segundos; todos los jugadores responden simultáneamente. Las puntuaciones se calculan al instante después de cada pregunta. Los juegos duran 10 rondas. Uso máximo: 50.000 juegos concurrentes.

Recorre los seis pasos de la revisión:

1. ¿Cuáles son las restricciones no negociables?
2. ¿Cuáles son las incógnitas y suposiciones?
3. ¿Cuáles son las opciones tecnológicas realistas?
4. ¿Cuáles son los modos de fallo?
5. ¿Cómo sabrás cuando está degradado?
6. ¿Cómo es el runbook de las 3 AM?

*(No existe una única respuesta correcta. El objetivo es practicar la estructura de revisión como herramienta de pensamiento.)*

## Escena Post-Créditos

Carlos salió de la oficina a las 6 PM.

El equipo se quedó sentado un rato después, sin hacer nada en particular.

"Siento que aprendí más en esas dos horas que en cualquier capítulo individual de un servicio de AWS", dijo Leo.

"Eso es porque esos capítulos eran sobre herramientas", dijo Maya. "Esto fue sobre el juicio."

"¿El juicio se puede enseñar?", preguntó.

"Sí", dijo Priya. "Pero no leyendo. Mediante la práctica. Tomando decisiones, viendo qué se rompe, pensando en el por qué."

"A través de la experiencia", dijo Tom.

"A través de la experiencia estructurada", corrigió Priya. "La experiencia sin reflexión no construye juicio. Hay que hacer las preguntas después."

Maya miró la pizarra. Las notas de la revisión todavía estaban ahí: restricciones, incógnitas, modos de fallo, preguntas de monitoreo. Llenaba dos pizarras.

"Esto debería ir en el ADR", dijo.

Leo ya estaba tecleando.

En el capítulo final: lo único que ninguna herramienta o framework puede darte, y por qué "depende" es la respuesta más honesta y poderosa en la arquitectura de software.
