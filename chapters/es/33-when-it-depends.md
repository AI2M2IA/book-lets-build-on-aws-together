# Capítulo 33: Depende

Toma un último respiro antes de este capítulo.

Has llegado al final del libro. Esto es a la vez una conclusión y un comienzo: el último capítulo, y el primer día en que tomarás decisiones arquitectónicas por tu cuenta.

Este capítulo tiene un solo trabajo: ser honesto contigo sobre lo que nadie te dice con suficiente claridad.

**La Pregunta**

Al final de casi cada discusión de arquitectura, alguien eventualmente pregunta: "¿Cuál es la respuesta correcta?"

Y la respuesta más útil, frustrante, honesta y mal entendida en toda la ingeniería de software es:

**Depende.**

No porque la pregunta sea irresoluble. No porque el experto esté evadiendo. Sino porque la respuesta correcta genuina y estructuralmente depende de un contexto que no estaba en la pregunta.

Este capítulo trata sobre aprender a decir "depende" correctamente, lo que significa ser capaz de completar la oración.

Piensa en un médico al que le preguntan: "¿Es la cirugía el tratamiento correcto?" Un mal médico dice sí o no sin examinar al paciente. Un buen médico dice: "Depende: del diagnóstico, la edad del paciente, sus otras condiciones y qué ocurre si esperamos." La respuesta no es evasión. Es precisión. "Depende" seguido de una oración completa es lo más útil que un médico, o un arquitecto, puede decir.

**El Final de Nimbus**

Dos años después del comienzo. Maya estaba de pie en una sala de conferencias en Seattle, presentando a una sala de inversores de capital de riesgo.

Nimbus había crecido: 947 socios restaurantes. 18.000 pedidos diarios. $2,1 millones en GMV mensual. Tres ciudades en marcha, dos más en lanzamiento. Un equipo de catorce ingenieros en dos zonas horarias.

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

**Las Cuatro Preguntas Detrás de "Depende"**

Cada compensación de arquitectura se reduce a cuatro preguntas fundamentales. No todas las preguntas importan igualmente para cada decisión, pero las cuatro siempre están en juego:

**1. ¿Cuál es el patrón de acceso?**

¿Cómo se escriben y leen los datos? ¿Con qué frecuencia? ¿Por cuántos usuarios concurrentes? ¿En qué orden? ¿Por qué claves?

Esta pregunta determina la selección de tecnología en el nivel más fundamental. DynamoDB vs Aurora vs Redshift vs Athena: la respuesta correcta depende casi enteramente del patrón de acceso.

**2. ¿Cuál es la escala?**

No solo ahora: en 12 meses, en 5 años. La escala cambia la respuesta correcta. Lo que funciona a 100 solicitudes por día falla a 100 millones. Lo que es excesivo con 10 usuarios es necesario con 10.000.

Y la escala no es solo tráfico. Es el tamaño del equipo (la arquitectura debe ser mantenible por el equipo que tienes). Es el volumen de datos. Es el alcance geográfico.

**3. ¿Cuál es la consecuencia del fallo?**

Si esto se rompe, ¿qué ocurre? ¿Ve un usuario una página lenta? ¿Falla un pedido? ¿Se mueve el dinero incorrectamente? ¿El registro médico de alguien se vuelve inaccesible?

La consecuencia determina cuánto inviertes en fiabilidad. Una página de menú lenta justifica la consistencia eventual. Un pago fallido justifica escrituras sincrónicas y confirmación explícita.

**4. ¿Cuál es la restricción de costo?**

No solo dinero, también la complejidad operativa (que en sí misma es una forma de costo). Una solución que requiere tres servicios adicionales puede ser técnicamente superior a una más simple pero demasiado costosa de mantener con un equipo de cuatro personas.

**"Depende": Cómo Completar la Oración**

La manera correcta de decir "depende" es completarlo inmediatamente:

*"¿Deberíamos usar DynamoDB o Aurora?"*

"Depende del patrón de acceso. Si necesitas búsquedas de alto rendimiento basadas en clave con esquema flexible, DynamoDB. Si necesitas consistencia transaccional en entidades relacionadas con consultas complejas, Aurora."

*"¿Deberíamos usar Lambda o EC2?"*

"Depende de las características de la carga de trabajo. Lambda para cargas de trabajo basadas en eventos, de corta duración y variables donde el costo de inactividad cero importa. EC2 o ECS para procesos persistentes, con estado o de larga duración donde el rendimiento predecible es más importante que el costo de inactividad."

*"¿Deberíamos usar Multi-AZ o Multi-Región?"*

"Depende de tus requisitos de RTO/RPO y tu modelo de amenazas. Multi-AZ protege contra fallos de AZ (el modo de fallo de AWS más común) y proporciona RPO ~0 y RTO ~60 segundos para RDS. Multi-Región protege contra fallos regionales (raros) y sirve a usuarios globalmente distribuidos. Si necesitas failover en menos de un minuto desde un desastre regional, Multi-Región. Si la resiliencia de AZ es suficiente, Multi-AZ es mucho más simple y económico."

"Depende" no es el fin de la respuesta. Es el comienzo de la respuesta real.

**Los Patrones que No Cambian**

Aunque las elecciones tecnológicas específicas evolucionan: se lanzan nuevos servicios, los precios cambian, emergen mejores alternativas; algunos patrones subyacentes han permanecido estables durante décadas:

**Separación de preocupaciones**: Los componentes que hacen cosas diferentes deben ser independientes. Un cambio en uno no debería requerir un cambio en otro. Por eso desacoplas con SQS, no con llamadas directas. Por eso usas S3 para objetos, no bases de datos. Por eso el nivel web y el nivel de base de datos son separados.

**Defensa en profundidad**: Ningún control de seguridad único es suficiente. Tienes IAM, grupos de seguridad, NACLs, WAF, GuardDuty, Secrets Manager, KMS. Si una capa falla, la siguiente la captura.

**Paga por lo que usas, cuando lo usas**: El principio económico fundamental de la nube. Lambda escala a cero. Las instancias Spot usan capacidad de reserva. Las políticas de ciclo de vida de S3 mueven los datos fríos a almacenamiento más barato. DynamoDB bajo demanda cobra por solicitud. Los patrones son diferentes; el principio es el mismo.

**Optimiza para el fallo más probable**: Multi-AZ primero (los fallos de AZ ocurren). DR multi-región después (los fallos regionales son más raros). Redundancia dentro de la AZ (múltiples instancias) antes que la complejidad multi-región. Construye para el fallo realista, no el catastrófico pero improbable.

**Mide antes de optimizar**: El enfoque de Tom: extraer las métricas de CloudWatch, entender el patrón real, luego tomar decisiones, es más valioso que la optimización prematura basada en suposiciones.

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
- **La intuición de las partes interesadas**: Saber cuándo rechazar un requisito empresarial porque el costo técnico es demasiado alto. Esto viene de la experiencia tanto en el lado técnico como en el empresarial.
- **La pregunta correcta para el contexto específico**: Carlos podía hacer las preguntas correctas porque había visto problemas similares docenas de veces. Este conocimiento se gana, no se lee.

No has terminado de aprender. Apenas has empezado.

**El Examen No Es el Destino**

Tomaste este libro para prepararte para el examen de AWS Solutions Architect Associate. Eso es válido. La certificación SAA-C03 es real, valorada y abrirá puertas.

Pero el examen prueba conocimiento y reconocimiento de patrones. No prueba el juicio. No prueba la experiencia operacional. No prueba qué haces cuando la arquitectura que construiste deja de funcionar a las 11 PM de un viernes.

La certificación es una credencial de inicio. Cuando apruebes el examen, sabrás cómo funcionan los servicios de AWS y cómo se combinan. Tendrás un marco para pensar sobre la arquitectura. Todavía no lo habrás hecho.

El siguiente paso después del examen: construye algo real. Despliégalo. Opéralo. Obsérvalo fallar. Corrígelo. Quédate sin dinero en un servicio y mueve el costo a otra parte. Recibe una alerta en mitad de la noche y toma una decisión con información insuficiente.

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

Maya pensó en los dos años. Los incidentes. Las revisiones de costo. La revisión Well-Architected. Las decisiones arquitectónicas tomadas bajo presión y las tomadas cuidadosamente. Las que acertaron y las que tuvieron que rehacer.

"Que la nube no resuelve los problemas de arquitectura", dijo. "Los amplifica. Una mala decisión en las instalaciones propias podría costarte una semana. Una mala decisión en la nube puede costarte dinero cada mes, a escala, hasta que alguien lo note."

Hizo una pausa.

"La nube hace escalar las buenas decisiones. Y también las malas."

**Cierre**

Has aprendido mucho. Los servicios de AWS. Las compensaciones. Los patrones.

Ahora haz algo con ello.

Construye algo. Comete errores a propósito. Lee post-mortems (son públicos: AWS, Cloudflare, GitHub, Stripe todos los publican). Trabaja con equipos que son mejores que tú en las cosas en las que eres más débil.

El examen SAA-C03 probará si conoces el material. Tu carrera probará si puedes aplicarlo.

Ambos valen la pena hacer. Ninguno es el destino final.

No hay destino final en este campo. Solo hay el siguiente problema, la siguiente decisión y el hábito de hacer la siguiente pregunta correcta.

Buena suerte.

En el próximo capítulo: qué cambia cuando el trabajo ya no es construir el sistema, sino ser responsable de él.

## Resumen

- **"Depende" es el comienzo de la respuesta**, no el fin. Siempre completa la oración con las condiciones de las que depende.
- Las cuatro preguntas detrás de cada compensación de arquitectura: patrón de acceso, escala, consecuencia del fallo, restricción de costo.
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
- Selección de clase de almacenamiento (conoce las seis clases de almacenamiento de S3 y sus compensaciones)
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
- "Optimización de costos" → Instancias Spot, Savings Plans, políticas de ciclo de vida, ajuste de tamaño correcto

**Estás preparado**. No porque este libro cubra todo: nada lo hace. Sino porque entiendes los principios lo suficientemente bien como para razonar hacia la respuesta incluso cuando no reconoces de inmediato el escenario exacto.


## Ejercicios

**Ejercicio Final**

No hay más preguntas estructuradas para el examen después de este capítulo.

En cambio: una pregunta abierta.

¿Qué sistema construirías hoy, sabiendo lo que sabes?

Escríbelo. Bosqueja la arquitectura. Identifica los servicios. Anota las compensaciones que harías y por qué. Anticipa los modos de fallo.

Luego constrúyelo.

Esa es la tarea. No hay fecha límite. No hay nota. Solo el trabajo.

## Escena Post-Créditos

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

*Gracias por leer.*

*El examen de AWS Solutions Architect Associate (SAA-C03) está disponible en los centros de pruebas de Pearson VUE y en línea a través de su sistema de pruebas remotas. Visita aws.amazon.com/certification para registrarte.*

*La historia de Nimbus es ficticia. Los servicios de AWS, los modelos de precios y las mejores prácticas descritas en este libro son reales. Ambos pueden cambiar: AWS actualiza sus servicios con frecuencia. Siempre verifica los precios actuales y las capacidades de los servicios en aws.amazon.com.*

*Buena suerte.*
