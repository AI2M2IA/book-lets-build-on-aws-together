# Capítulo 33: Depende

Toma un último respiro antes de este capítulo.

El cursor parpadeaba en la diapositiva en blanco de Maya. Título: "Arquitectura en Nimbus." Lo borró y escribió: "La Pregunta." Luego miró la sala y se dio cuenta de que no necesitaba la diapositiva en absoluto.

**Recapitulación: De la Revisión a la Presentación**

La revisión de arquitectura con Carlos —seis meses y varios cientos de lanzamientos de restaurantes atrás ahora— había dejado al equipo con una pila de ADRs y una forma más limpia de pensar sobre las decisiones antes de lanzarlas. Maya había estado preparándose para la presentación a inversores cuando se dio cuenta de que todo lo que Carlos había preguntado —y todo lo que ella había respondido con confianza— se reducía a la misma lógica subyacente. Los inversores preguntarían por qué. Había aprendido, a lo largo de dos años construyendo Nimbus, que la respuesta nunca era el nombre del servicio. La respuesta era siempre el conjunto de condiciones que hacían que un servicio fuera correcto y otro incorrecto. Estaba a punto de entrar en una sala de gente que le pediría que defendiera cada elección arquitectónica. Estaba lista.

**La Pregunta**

Al final de casi cada discusión de arquitectura, alguien eventualmente pregunta: "¿Cuál es la respuesta correcta?"

Y la respuesta más útil, frustrante, honesta y mal entendida en toda la ingeniería de software es:

**Depende.**

No porque la pregunta sea irresoluble. No porque el experto esté evadiendo. Sino porque la respuesta correcta genuina y estructuralmente depende de un contexto que no estaba en la pregunta.

Este capítulo trata sobre aprender a decir "depende" correctamente, lo que significa ser capaz de completar la oración.

Piensa en un médico al que le preguntan: "¿Es la cirugía el tratamiento correcto?" Un mal médico dice sí o no sin examinar al paciente. Un buen médico dice: "Depende: del diagnóstico, la edad del paciente, sus otras condiciones y qué ocurre si esperamos." La respuesta no es evasión. Es precisión. "Depende" seguido de una oración completa es lo más útil que un médico, o un arquitecto, puede decir.

**El Final de Nimbus**

Dos años y medio después del comienzo. Maya estaba de pie en una sala de conferencias en Seattle, presentando a una sala de inversores de capital de riesgo.

Nimbus había crecido: 947 socios restaurantes. 18.000 pedidos diarios. $18 millones en GMV mensual. Tres ciudades en marcha, dos más en lanzamiento. Un equipo de catorce ingenieros en dos zonas horarias.

Los inversores tenían preguntas. Uno de ellos, un socio técnico del fondo, se inclinó hacia adelante.

"¿Qué base de datos usan?", preguntó.

Maya no dudó.

"Para pedidos y datos de clientes: Aurora PostgreSQL. Para el catálogo de menú: DynamoDB. Para la gestión de sesiones y el caché: ElastiCache Redis. Para análisis: Athena sobre archivos Parquet en S3, con Redshift para las consultas del panel de alta frecuencia."

Asintió. "¿Por qué Aurora para los pedidos y no DynamoDB?"

"Porque los pedidos tienen una estructura relacional compleja: hacen referencia a elementos del menú, cuentas de clientes, direcciones de restaurantes y métodos de pago. Necesitamos consistencia transaccional en múltiples entidades. Una base de datos relacional es la herramienta correcta para eso. La fortaleza de DynamoDB es el acceso de alto rendimiento basado en clave con esquema flexible, que es exactamente el patrón de acceso del catálogo de menú."

Escribió algo. "¿Y el escalado? Dijiste 18.000 pedidos diarios. Eso son unos 12 por minuto en promedio. ¿Cómo diseñaron para el pico?"

"La hora de la cena del viernes es aproximadamente 25 veces el promedio. Escalamos horizontalmente con ECS y Aurora Serverless v2, que maneja las ráfagas automáticamente. CloudFront absorbe la carga de contenido estático. La API no tiene estado, por lo que el escalado horizontal es limpio."

"¿Y si Aurora Serverless v2 no puede escalar lo suficientemente rápido?"

"Tenemos resultados de pruebas de carga. El tiempo para escalar de Aurora Serverless v2 es inferior a 10 segundos. Nuestra rampa de pico de los viernes tarda 8 minutos desde la línea base. Estamos cómodos con el margen."

El socio técnico miró al resto de los inversores. "Ella conoce su sistema."

Tenía más preguntas.

"¿Cómo manejan la seguridad del despliegue? Con 947 restaurantes, un mal despliegue significa que 947 restaurantes no pueden tomar pedidos."

A Maya le habían hecho esto antes, internamente. "Feature flags para todos los cambios de comportamiento. Desplegamos código continuamente, pero el nuevo comportamiento está restringido detrás de flags que habilitamos gradualmente. Un despliegue que cambia el flujo de confirmación de pedidos se despliega al 1% de los restaurantes durante 24 horas, luego al 10%, luego al 50%, luego al 100%, con rollback automático si las tasas de error superan el umbral en cualquier etapa."

"¿Cuánto tarda un despliegue completo?"

"Tres días para un cambio de alto riesgo. Un día para los de bajo riesgo. Los rollbacks de emergencia se completan en menos de cuatro minutos."

"¿Cuál es tu latencia p99 de Stripe?"

Tom respondió antes de que Maya pudiera. "214 milisegundos."

"Eso es alto", dijo el inversor.

"Nuestro SLA con los restaurantes es de la realización del pedido a la confirmación en menos de 5 segundos", dijo Tom. "214ms para la llamada a Stripe es el 4,3% de ese presupuesto. El tiempo restante es la escritura en Aurora, la entrega del mensaje de SQS, la notificación push a la tablet del restaurante. Tenemos margen."

"¿Y si Stripe tiene un incidente?"

"Usamos la captura de pagos asíncrona de Stripe. El pedido se acepta y el restaurante es notificado de inmediato. La captura del pago ocurre de forma asíncrona. Si Stripe está lento, el pedido sigue adelante: la captura se reintenta. Si Stripe está totalmente caído, encolamos el intento de captura con retroceso exponencial y alertamos a nuestro equipo de guardia. No hemos retenido un pedido por Stripe en 14 meses."

El inversor escribió algo. "¿Tienen algún único punto de fallo?"

Priya respondió. "Aurora en una sola región es una dependencia de una sola región. Tenemos Multi-AZ para los fallos a nivel de AZ, y un lector de Aurora Global Database ya en ejecución en us-east-1. Un fallo regional completo significaría hacer failover a ese lector, y el failover regional automatizado a su alrededor es lo que estamos construyendo este trimestre. Hasta entonces, sí: un fallo regional de us-west-2 dejaría a Nimbus caído."

"¿Por qué no han construido todavía el failover multi-región?"

"Porque hasta hace seis meses, el coste de ingeniería de construirlo correctamente superaba el riesgo de negocio de la interrupción", dijo Priya. "Nunca hemos tenido un fallo regional de AWS que durara más de 30 minutos en nuestra región de operación. Con 287 restaurantes —unos 4.200 pedidos al día a un valor promedio de pedido de $34—, una interrupción regional de 2 horas nos cuesta aproximadamente $12.000 en GMV. El coste de ingeniería de un warm standby implementado correctamente son 3 meses de tiempo de un ingeniero senior. A nuestros ingresos actuales, las cuentas favorecían aplazarlo."

"¿Y ahora?"

"Con 947 restaurantes y 18.000 pedidos diarios, la misma interrupción de 2 horas cuesta aproximadamente $51.000 en GMV y genera un daño reputacional significativo con los socios restaurantes que dependen de nosotros para su servicio de cenas. Las cuentas han cambiado. El proyecto de failover empieza el próximo sprint."

El inversor miró a los demás inversores de la sala. "Ella también conoce su perfil de riesgo."


**Las Cuatro Preguntas Detrás de "Depende"**

Había hecho alguna versión de cada una de estas preguntas durante dos años sin saber que estaba haciendo la misma pregunta de cuatro formas diferentes. La sesión con los inversores lo había dejado claro. Cada elección que había explicado con confianza se reducía a los mismos cuatro ejes.

**1. ¿Cuál es el patrón de acceso?**

¿Cómo se escriben y leen los datos? ¿Con qué frecuencia? ¿Por cuántos usuarios concurrentes? ¿En qué orden? ¿Por qué claves?

Esta pregunta determina la selección de tecnología en el nivel más fundamental. DynamoDB vs Aurora vs Redshift vs Athena: la respuesta correcta depende casi enteramente del patrón de acceso.

**2. ¿Cuál es la escala?**

No solo ahora: en 12 meses, en 5 años. La escala cambia la respuesta correcta. Lo que funciona a 100 solicitudes por día falla a 100 millones. Lo que es excesivo con 10 usuarios es necesario con 10.000.

Y la escala no es solo tráfico. Es el tamaño del equipo (la arquitectura debe ser mantenible por el equipo que tienes). Es el volumen de datos. Es el alcance geográfico.

**3. ¿Cuál es la consecuencia del fallo?**

Si esto se rompe, ¿qué ocurre? ¿Ve un usuario una página lenta? ¿Falla un pedido? ¿Se mueve el dinero incorrectamente? ¿El registro médico de alguien se vuelve inaccesible?

La consecuencia determina cuánto inviertes en fiabilidad. Una página de menú lenta justifica la consistencia eventual. Un pago fallido justifica escrituras sincrónicas y confirmación explícita.

**4. ¿Cuál es la restricción de coste?**

No solo dinero, también la complejidad operativa (que en sí misma es una forma de coste). Una solución que requiere tres servicios adicionales puede ser técnicamente superior a una más simple pero demasiado costosa de mantener con un equipo de cuatro personas.

"Espera, ¿pero *por qué* importa tanto el patrón de acceso?" había preguntado Maya, dos años antes, cuando Tom propuso por primera vez separar el catálogo de menú de la base de datos de pedidos. "¿No podemos simplemente optimizar más tarde?"

Esa pregunta, resultó, fue el comienzo de la respuesta. No puedes optimizar un esquema relacional para patrones de acceso clave-valor sin reconstruirlo. El patrón de acceso tenía que conocerse en el momento del diseño, no adaptarse después. Cada decisión de arquitectura que había tomado desde entonces había comenzado con la misma pregunta.

Quizás te preguntes: si "depende" es siempre la respuesta correcta, ¿cómo tomas alguna vez una decisión? La respuesta es que completar la oración te obliga a nombrar las condiciones, y una vez que las has nombrado, sabes qué información necesitas. "Depende del patrón de acceso" se convierte en "ve a averiguar cuál es realmente el patrón de acceso". Las cuatro preguntas no son una forma de evitar las decisiones, son una forma de tomarlas con la información correcta.

**"Depende": Cómo Completar la Oración**

La manera correcta de decir "depende" es completarlo inmediatamente:

*"¿Deberíamos usar DynamoDB o Aurora?"*

"Depende del patrón de acceso. Si necesitas búsquedas de alto rendimiento basadas en clave con esquema flexible, DynamoDB. Si necesitas consistencia transaccional en entidades relacionadas con consultas complejas, Aurora."

*"¿Deberíamos usar Lambda o EC2?"*

"Depende de las características de la carga de trabajo. Lambda para cargas de trabajo basadas en eventos, de corta duración y variables donde el coste de inactividad cero importa. EC2 o ECS para procesos persistentes, con estado o de larga duración donde el rendimiento predecible es más importante que el coste de inactividad."

*"¿Deberíamos usar Multi-AZ o Multi-Región?"*

"Depende de tus requisitos de RTO/RPO y tu modelo de amenazas. Multi-AZ protege contra fallos de AZ (el modo de fallo de AWS más común) y proporciona RPO ~0 y RTO ~60 segundos para RDS. Multi-Región protege contra fallos regionales (raros) y sirve a usuarios globalmente distribuidos. Si necesitas failover en menos de un minuto desde un desastre regional, Multi-Región. Si la resiliencia de AZ es suficiente, Multi-AZ es mucho más simple y económico."

"Depende" no es el fin de la respuesta. Es el comienzo de la respuesta real.


*"¿Deberíamos usar EKS o ECS para la orquestación de contenedores?"*

El inversor había hecho esta antes de que Maya pasara a la siguiente diapositiva. Ella hizo una pausa.

"Depende del tamaño del equipo, la experiencia existente en Kubernetes y de si necesitas funciones específicas de Kubernetes."

"Amplía eso", dijo.

"Kubernetes es una plataforma de orquestación poderosa", dijo Maya. "Tiene un ecosistema rico: charts de Helm, definiciones de recursos personalizados, federación multi-clúster, políticas de programación avanzadas. Si tienes un equipo que conoce Kubernetes, tiene herramientas construidas a su alrededor y necesita esas capacidades, EKS es la elección correcta. Obtienes un plano de control gestionado, pero sigues gestionando la complejidad de Kubernetes de las políticas de red, la seguridad de pods, las cuotas de recursos y lo demás."

"¿Y ECS?"

"ECS es más simple. Sin API de Kubernetes. Sin etcd. Sin complejidad de redes de pods. Defines tareas, servicios y clústeres. IAM se integra de forma nativa sin requerir plugins adicionales. El modelo mental es significativamente más pequeño. Para un equipo que no conoce ya Kubernetes, ECS elimina meses de curva de aprendizaje."

"¿Cuál usa Nimbus?"

"ECS", dijo. "Evaluamos EKS hace dieciocho meses. Teníamos un ingeniero con experiencia en Kubernetes. Los demás habrían necesitado de 3 a 4 meses para volverse productivos en un entorno de Kubernetes de producción. Las funciones que EKS nos habría dado —gestión multi-clúster, programación personalizada— no las necesitábamos. ECS con Fargate ejecuta nuestros contenedores. El equipo fue productivo en dos semanas."

"¿Es esa la elección correcta con 50 ingenieros?", preguntó.

"Podría no serlo", dijo Maya. "Con 50 ingenieros y múltiples equipos de producto que necesitan espacios de nombres aislados, políticas de red personalizadas y cuotas de recursos por equipo, el modelo de espacios de nombres de Kubernetes se vuelve genuinamente valioso. ECS no tiene un aislamiento de espacios de nombres equivalente. A esa escala, la curva de aprendizaje de Kubernetes se amortiza entre un equipo mucho más grande. La respuesta de 'depende' cambia."

"¿A qué tamaño de equipo ocurre el cambio?", preguntó.

Lo había pensado. "La regla que uso: cuando la sobrecarga operativa de Kubernetes se vuelve menor que la sobrecarga organizativa de sortear las limitaciones de ECS, cambia. Para un equipo de 14 personas, ECS. Para un equipo de 50 personas con múltiples verticales de producto, probablemente EKS. El número no es fijo: depende de qué estés construyendo y quién lo esté construyendo."

"Espera, ¿pero *por qué* lo haríamos así?" se preguntó Maya, repitiendo la pregunta que había aprendido de dos años de construcción. "¿Por qué no elegir uno y quedarse con él?"

Porque la respuesta correcta cambia a medida que la organización cambia. Una decisión de arquitectura tomada para un equipo de 4 personas no es necesariamente correcta para un equipo de 40 personas. Las condiciones cambian. La respuesta cambia con ellas.

"Ese es el punto", le dijo al inversor. "La respuesta correcta hoy es ECS. La respuesta correcta en tres años podría ser EKS. La reconsideraremos cuando las condiciones lo justifiquen. Tenemos un ADR que documenta por qué elegimos ECS, y enumera explícitamente qué desencadenaría una reconsideración."

El inversor escribió una nota más. "Esa es una forma madura de sostener una decisión técnica."


**Variación: Cuando "Depende" te Mete en Problemas**

Si el patrón de acceso favorece las búsquedas clave-valor y eliges DynamoDB, superarás a Aurora a escala, pero si añades una función que requiere consultas JOIN entre tres entidades, has construido la base equivocada y tendrás que migrar bajo presión. La respuesta de "depende" es tan buena como tu comprensión de las condiciones de las que dependes.

Si optimizas para la escala actual y el patrón de acceso actual, tomarás la decisión correcta para hoy, pero si el tráfico crece 50 veces en un año sin que tu arquitectura se adapte, la decisión correcta del día uno se convierte en el cuello de botella del día 365. Las cuatro preguntas deben hacerse no solo en el momento del diseño, sino revisarse a medida que el sistema crece.

**Los Patrones que No Cambian**

Aunque las elecciones tecnológicas específicas evolucionan —se lanzan nuevos servicios, los precios cambian, emergen mejores alternativas—, algunos patrones subyacentes han permanecido estables durante décadas:

**Separación de preocupaciones**: Los componentes que hacen cosas diferentes deben ser independientes. Un cambio en uno no debería requerir un cambio en otro. Por eso desacoplas con SQS, no con llamadas directas. Por eso usas S3 para objetos, no bases de datos. Por eso el nivel web y el nivel de base de datos son separados.

**Defensa en profundidad**: Ningún control de seguridad único es suficiente. Tienes IAM, grupos de seguridad, NACLs, WAF, GuardDuty, Secrets Manager, KMS. Si una capa falla, la siguiente la captura.

**Paga por lo que usas, cuando lo usas**: El principio económico fundamental de la nube. Lambda escala a cero. Las instancias Spot usan capacidad de reserva. Las políticas de ciclo de vida de S3 mueven los datos fríos a almacenamiento más barato. DynamoDB bajo demanda cobra por solicitud. Tom había preguntado "¿Cuánto cuesta eso por mes?" diez mil veces a lo largo de dos años. Esa pregunta —hecha consistentemente, respondida rigurosamente— se había convertido en casi $36.000 en ahorros anuales. Los patrones son diferentes; el principio es el mismo.

**Optimiza para el fallo más probable**: Multi-AZ primero (los fallos de AZ ocurren). DR multi-región después (los fallos regionales son más raros). Redundancia dentro de la AZ (múltiples instancias) antes que la complejidad multi-región. Construye para el fallo realista, no el catastrófico pero improbable.

**Mide antes de optimizar**: El enfoque de Tom —extraer las métricas de CloudWatch, entender el patrón real, luego tomar decisiones— es más valioso que la optimización prematura basada en suposiciones. El instinto de Leo sobre los jobs por lotes nocturnos —"Irá bien"— era lo más importante de lo que entrenarte para deshacerte. Normalmente sí va bien, hasta la única vez que no, y no has medido nada.


**El coste acumulado de los valores predeterminados incorrectos**.

Tom tenía otro patrón que añadir a la lista, uno que había identificado solo después de tres meses de revisión de costes: el coste de no cambiar el valor predeterminado.

Los servicios de AWS están diseñados para ser seguros y funcionales nada más sacarlos de la caja. Los valores predeterminados no están diseñados para ser óptimos para cada carga de trabajo. gp2 era el tipo de volumen EBS predeterminado hasta que se lanzó gp3 en diciembre de 2020. Después de eso, gp3 se convirtió en el predeterminado para los nuevos volúmenes, pero los volúmenes gp2 existentes nunca se convirtieron, porque AWS no modifica los recursos existentes del cliente sin una acción explícita.

La implicación de coste: cada equipo que creó volúmenes EBS antes de gp3 y nunca ejecutó una auditoría de migración pagó un 25% más por GB durante años, no porque tomaran la decisión equivocada, sino porque no tomaron ninguna decisión. El valor predeterminado persistió, y el coste se acumuló en silencio.

Por eso la pregunta "espera, ¿pero por qué lo haríamos así?" se había convertido en lo más valioso que preguntaba el equipo. No siempre se trataba de cuestionar una decisión que se había tomado. A veces se trataba de cuestionar una no-decisión: un valor predeterminado que se aceptó sin examen.

El patrón se generaliza: revisa los valores predeterminados cuando AWS lanza una nueva opción. gp2 a gp3. DynamoDB bajo demanda a aprovisionado con Auto Scaling cuando el tráfico se estabiliza. S3 Standard a Intelligent-Tiering cuando los patrones de acceso se vuelven inciertos. La revisión no tiene que ser cara: una tarde de análisis por categoría, trimestralmente. Pero no se puede saltar. Los valores predeterminados se acumulan.

"Cada dólar que estamos gastando en algo que elegimos es un coste intencional", dijo Tom, en la revisión mensual. "Cada dólar que estamos gastando en algo que no hemos mirado desde que lo aprovisionamos es un potencial valor predeterminado que debería cuestionarse."

"¿Cuántos de esos tenemos?", preguntó Maya.

"Menos que hace seis meses", dijo. "Más que cero."

Esa era la respuesta honesta. Siempre era la respuesta honesta.


**Lo que Este Libro No Puede Enseñarte**

Seamos directos sobre los límites.

Este libro te ha enseñado:

- Qué hace cada servicio principal de AWS
- Las analogías que los hacen intuitivos
- Las compensaciones entre alternativas
- El conocimiento del examen que necesitas para el SAA-C03
- Un marco para pensar sobre las decisiones arquitectónicas

Este libro no puede enseñarte:

- **El instinto de producción**: La sensación visceral que dice "esto se va a poner extraño bajo carga" antes de haberlo visto ocurrir. Esto viene de operar sistemas reales.
- **El juicio técnico bajo presión**: Decidir qué hacer a las 3 AM cuando el sistema está caído y tienes información incompleta. Esto viene de los incidentes.
- **La intuición de las partes interesadas**: Saber cuándo rechazar un requisito empresarial porque el coste técnico es demasiado alto. Esto viene de la experiencia tanto en el lado técnico como en el empresarial.
- **La pregunta correcta para el contexto específico**: Carlos podía hacer las preguntas correctas porque había visto problemas similares docenas de veces. Este conocimiento se gana, no se lee.

No has terminado de aprender. Apenas has empezado.

**El Examen No Es el Destino**

Tomaste este libro para prepararte para el examen de AWS Solutions Architect Associate. Eso es válido. La certificación SAA-C03 es real, valorada y abrirá puertas.

Pero el examen prueba conocimiento y reconocimiento de patrones. No prueba el juicio. No prueba la experiencia operacional. No prueba qué haces cuando la arquitectura que construiste deja de funcionar a las 11 PM de un viernes.

La certificación es una credencial de inicio. Cuando apruebes el examen, sabrás cómo funcionan los servicios de AWS y cómo se combinan. Tendrás un marco para pensar sobre la arquitectura. Todavía no lo habrás hecho.

El siguiente paso después del examen: construye algo real. Despliégalo. Opéralo. Obsérvalo fallar. Corrígelo. Quédate sin dinero en un servicio y mueve el coste a otra parte. Recibe una alerta en mitad de la noche y toma una decisión con información insuficiente.

Así es como el conocimiento de este libro se convierte en juicio.

**La Respuesta Final de Maya**

Al final de la reunión con los inversores, el socio técnico tenía una pregunta más.

"Si empezaras de nuevo hoy, sabiendo lo que sabes ahora, ¿qué harías diferente?"

Maya se tomó un momento.

"Empezaría con la infraestructura como código desde el primer día", dijo. "Leo desplegó la primera instancia de EC2 manualmente. Pasamos seis meses migrando todo a Terraform. Eso fueron seis meses de deuda técnica que nos costó tiempo real."

"¿Qué más?"

"Sería más conservadora con los servicios gestionados al principio. Usamos DynamoDB cuando una base de datos simple de RDS habría sido suficiente durante meses. El diseño del patrón de acceso de DynamoDB requería pensamiento experimentado que todavía no teníamos. Rediseñamos el esquema dos veces."

"¿Entonces lo más simple es mejor al principio?"

"Lo más simple es mejor *siempre*. La pregunta siempre es: ¿cuál es la cosa más simple que resuelve el problema real, no el problema futuro anticipado? Agregamos complejidad para resolver problemas que todavía no teníamos. Parte de esa complejidad causó sus propios problemas."

El socio técnico anotó eso.

"Última pregunta", dijo. "¿Cuál es la cosa más importante que sabes sobre construir en AWS que no sabías cuando empezaste?"

Maya pensó en los dos años. Los incidentes. Las revisiones de coste. La revisión Well-Architected. Las decisiones arquitectónicas tomadas bajo presión y las tomadas cuidadosamente. Las que acertaron y las que tuvieron que rehacer.

"Que la nube no resuelve los problemas de arquitectura", dijo. "Los amplifica. Una mala decisión en las instalaciones propias podría costarte una semana. Una mala decisión en la nube puede costarte dinero cada mes, a escala, hasta que alguien lo note."

Hizo una pausa.

"La nube hace escalar las buenas decisiones. Y también las malas."

Esa tarde, Maya les contó a Tom, Priya y Leo sobre la sesión con los inversores.

"Preguntó sobre las elecciones de base de datos", dijo. "Todas ellas."

"¿Cuánto cuesta eso por mes?" preguntó Tom de inmediato, lo cual era exactamente la pregunta equivocada y también la correcta. "¿Preguntó sobre el modelo de costes?"

"Lo hizo. Le expliqué los Savings Plans, el cambio de DynamoDB a aprovisionado. Asintió."

"¿Y qué pasa si alguien intenta entrar?" preguntó Priya. "¿Surgieron las preguntas de seguridad?"

"IAM, cifrado, GuardDuty. Sí. Pareció satisfecho."

Leo había estado callado. "¿Preguntó sobre las partes que no fueron bien?"

"Preguntó qué haría diferente. Le conté sobre empezar con la infraestructura como código, y ser más conservadora con los servicios gestionados al principio."

"El esquema de DynamoDB que rediseñamos dos veces", dijo Leo. "Siempre sentí que eso fue culpa mía."

"Fue culpa de todos nosotros", dijo Maya. "Ese es el punto."

**Cierre**

Has aprendido mucho. Los servicios de AWS. Las compensaciones. Los patrones.

Ahora haz algo con ello.

Construye algo. Comete errores a propósito. Lee post-mortems (son públicos: AWS, Cloudflare, GitHub, Stripe todos los publican). Trabaja con equipos que son mejores que tú en las cosas en las que eres más débil.

El examen SAA-C03 probará si conoces el material. Tu carrera probará si puedes aplicarlo.

Ambos valen la pena hacer. Ninguno es el destino final.

No hay destino final en este campo. Solo hay el siguiente problema, la siguiente decisión y el hábito de hacer la siguiente pregunta correcta.

**Las Lecciones que No Llegaron a la Presentación**

En el tren de vuelta de Seattle, Maya les contó a Leo y Priya sobre dos cosas de las que se alegraba de que el inversor no hubiera preguntado directamente, porque las respuestas honestas habrían tomado veinte minutos cada una.

**El incidente del pipeline de analítica**.

Ocho meses antes, el pipeline de analítica había estado acoplado al servicio principal de procesamiento de pedidos. Los eventos de pedidos se escribían en la misma cola de SQS que consumía el pipeline de analítica. El acoplamiento había parecido razonable: la analítica necesitaba datos de pedidos, el procesamiento de pedidos producía datos de pedidos.

Un miércoles por la noche, un error en la Lambda de agregación de analítica hizo que dejara de consumir de la cola. La profundidad de la cola creció. Como el servicio de procesamiento de pedidos compartía la misma cola de SQS para sus mensajes de confirmación, tanto el pipeline de analítica como la ruta de confirmación de pedidos se estaban atascando simultáneamente. Los socios restaurantes empezaron a ver retrasos en las confirmaciones. La cola de SQS se acercaba a su límite de retención de mensajes.

"Ya desplegué la corrección", había dicho Leo, a las 11 PM de esa noche, y luego se detuvo. La corrección para el error de analítica requeriría un redespliegue de Lambda que limpiaría la cola, pero no había comprobado si los mensajes de confirmación de pedidos en la cola seguían dentro de su tiempo de espera de visibilidad. Si el tiempo de espera había expirado, la Lambda los reprocesaría, y los socios restaurantes recibirían confirmaciones de pedidos duplicadas.

El incidente había durado tres horas y requerido dos rollbacks.

La lección arquitectónica era simple: la analítica y el procesamiento operativo nunca deberían compartir la misma cola. Tienen características de rendimiento diferentes, modos de fallo diferentes y consecuencias diferentes cuando fallan. Acoplarlas significaba que un fallo en la ruta de menor prioridad podía degradar la ruta de mayor prioridad.

Después del incidente, Nimbus separó los pipelines por completo. Los eventos de pedidos iban a una cola operativa dedicada. Una regla de EventBridge separada duplicaba los eventos a una cola solo de analítica. Los dos pipelines no tenían infraestructura compartida excepto el origen del evento. La siguiente vez que la Lambda de analítica tuvo un error —y lo tuvo, dos meses después— falló en silencio, la cola de analítica se atascó, los informes de la mañana llegaron tarde, y la ruta de confirmación de pedidos no se vio afectada en absoluto.

"Separación de preocupaciones", había dicho Priya, después del segundo error de la Lambda de analítica. "El mismo principio a nivel de infraestructura que a nivel de código. Dos cosas que fallan de forma diferente no deberían compartir el mismo dominio de fallo."

**La abstracción prematura.**

Tres meses antes de la Serie A, Leo había propuesto construir un servicio genérico de configuración de restaurantes. Nimbus tenía en aquel momento tres tipos de configuración específica de restaurantes: ajustes de menú, parámetros de zona de entrega y preferencias de notificación. Un servicio de configuración genérico, había argumentado Leo, les permitiría añadir nuevos tipos de configuración sin construir nueva lógica de almacenamiento y recuperación cada vez.

El equipo lo había construido. Dos semanas para diseñar el modelo de datos. Una semana para implementar el servicio. Otra semana para migrar los tres tipos de configuración existentes a él. Cuatro semanas en total.

Para cuando terminaron de construir el servicio de configuración genérico, tenían... tres tipos de configuración. Los mismos tres que tenían antes. El servicio genérico no añadió ninguna capacidad nueva; solo hizo que la capacidad existente fuera más difícil de entender. El esquema clave-valor que hacía el servicio "genérico" también lo hacía imposible añadir validación o restricciones de tipo sin construir un registro de esquemas encima.

"Construimos un framework para una biblioteca", dijo Tom, cuando le contó a Leo la historia del inversor.

"¿Qué significa eso?", preguntó Leo.

"Teníamos tres libros. Construimos un sistema de gestión de bibliotecas para organizarlos. Habría sido mejor simplemente poner los tres libros en un estante."

El servicio de configuración había sido discretamente descontinuado ocho meses después, cuando el equipo creció lo suficiente como para que cuatro ingenieros hubieran pasado un tiempo no trivial aprendiendo cómo funcionaba antes de descubrir que era un envoltorio fino alrededor de una tabla de DynamoDB. Migraron de vuelta al acceso directo a DynamoDB con esquemas tipados por tipo de configuración en dos días.

"Cuatro semanas construyéndolo", dijo Tom. "Dos días deshaciéndolo. Más el coste continuo de explicárselo a cada nuevo ingeniero."

"¿Cuál era la decisión correcta?", preguntó Priya.

"Construir el servicio de configuración cuando tengas más de diez tipos de configuración y el patrón sea claramente estable", dijo Tom. "No cuando tienes tres y estás especulando sobre necesidades futuras. La abstracción fue prematura. Las necesidades para las que fue diseñada no se materializaron."

"¿Hemos pensado en qué pasa si construimos abstracciones antes de entender el espacio del problema?" preguntó Priya.

"Acabamos de describirlo", dijo Tom. "Pasas tiempo manteniendo una abstracción que cuesta más que el problema que estaba resolviendo."

Maya añadió esto a su modelo mental de antipatrones arquitectónicos: el servicio genérico construido para tres casos de uso. El pipeline acoplado. La decisión de dimensionamiento tomada con una ventana de observación insuficiente. Cada uno era una decisión que tenía sentido localmente, en el momento, con la información disponible. Cada uno resultó estar equivocado de maneras que solo se hicieron visibles más tarde.

"Las que se ven bien sobre el papel", le dijo a Priya, "son las que más te cuestan."

"Porque no las revisas", dijo Priya. "Miras el diseño, es coherente, la lógica se sostiene, y sigues adelante. El modo de fallo es invisible hasta que el sistema está bajo una carga o un estrés que la versión sobre el papel nunca modeló."

"Por eso importa la revisión de arquitectura", dijo Maya. "No porque el revisor sepa más. Porque hará la pregunta que no se te ocurrió hacer."


## Resumen

La reunión con los inversores había ido bien. No porque Maya hubiera memorizado la estructura de precios de cada servicio, sino porque podía responder *por qué* a cada elección que Nimbus había hecho. Las respuestas de "depende" que había dado eran precisas, condicionales y fundamentadas en las mismas cuatro preguntas que había estado haciendo, de varias formas, durante dos años.

- **"Depende" es el comienzo de la respuesta**, no el fin. Siempre completa la oración con las condiciones de las que depende.
- Las cuatro preguntas detrás de cada compensación de arquitectura: patrón de acceso, escala, consecuencia del fallo, restricción de coste.
- Los patrones que perduran: separación de preocupaciones, defensa en profundidad, paga por lo que usas, optimiza para el fallo probable, mide antes de optimizar.
- **La nube amplifica las decisiones**: las buenas y las malas. Una mala decisión en las instalaciones propias cuesta una semana; una mala decisión en la nube se acumula mensualmente, a escala.
- La certificación SAA-C03 prueba conocimiento y reconocimiento de patrones. La experiencia en producción convierte ese conocimiento en juicio.

## Consejos para el Examen

*Dominio SAA-C03: Transversal — todos los dominios*

Este capítulo cierra el contenido del examen de este libro. Antes de presentarte al examen:

**Repasa los servicios en los que tienes menos confianza**:

- Para la mayoría de las personas: Kinesis vs SQS (la distinción entre stream y cola)
- Redes de VPC (tablas de rutas, subredes, NAT Gateway, Internet Gateway)
- Lógica de evaluación de políticas de IAM (denegación explícita > permiso explícito > denegación implícita)
- Selección de clase de almacenamiento (conoce las ocho clases de almacenamiento de S3 y sus compensaciones)
- RDS vs Aurora vs DynamoDB para casos de uso específicos

**Conoce la estructura típica del escenario del examen**:

El SAA-C03 presenta un requisito empresarial ("la empresa necesita disponibilidad del 99.99%") y te pide identificar la arquitectura que lo satisface. Lee siempre el requisito, identifica la restricción clave y elimina las opciones que no la cumplen.

**Practica la identificación de distractores**:

Cada respuesta incorrecta del examen está incorrecta por una razón específica. Aprender a identificar *por qué* cada respuesta incorrecta está mal es más valioso que memorizar respuestas correctas.

**El examen recompensa el reconocimiento de patrones**:

- "Desacoplar" → SQS/SNS
- "Sin servidor" → Lambda, DynamoDB, Aurora Serverless
- "Baja latencia global" → CloudFront, Global Accelerator, DynamoDB Global, Aurora Global
- "Cumplimiento/auditoría" → CloudTrail, Config, Security Hub, Macie
- "Optimización de costes" → Instancias Spot, Savings Plans, políticas de ciclo de vida, dimensionamiento correcto

**Estás preparado**. No porque este libro cubra todo: nada lo hace. Sino porque entiendes los principios lo suficientemente bien como para razonar hacia la respuesta incluso cuando no reconoces de inmediato el escenario exacto.

## Ejercicios

**Ejercicio Final**

No hay más preguntas estructuradas para el examen después de este capítulo.

En cambio: una pregunta abierta.

¿Qué sistema construirías hoy, sabiendo lo que sabes?

Escríbelo. Bosqueja la arquitectura. Identifica los servicios. Anota las compensaciones que harías y por qué. Anticipa los modos de fallo.

Luego constrúyelo.

Esa es la tarea. No hay fecha límite. No hay nota. Solo el trabajo.

## Escena Poscréditos

La inversión llegó.

Serie A. $4 millones. Suficiente para expandirse a cinco nuevas ciudades, triplicar el equipo de ingeniería y construir Nimbus Instant.

Esa tarde, Maya estaba en el restaurante de su familia. El original. El que fue donde comenzó Nimbus, cuando se dio cuenta de que estaban perdiendo pedidos porque el teléfono siempre estaba ocupado.

Pidió arepa: el mismo plato que siempre pedía.

Mientras esperaba, abrió su portátil y leyó el primer capítulo de este libro.

*"¿Dónde vive un sitio web?"*

Recordó no saber la respuesta.

Sonrió.

Cerró el portátil.

Llegó la comida.

Estaba perfecta.

En el siguiente capítulo: qué cambia cuando el trabajo ya no es construir el sistema, sino ser responsable de él.
