# Capítulo 31: El Inspector de Obra para la Arquitectura en la Nube

Levántate. Estírate. Tómate un descanso de verdad si lo necesitas.

Este capítulo es diferente a los anteriores. Hemos pasado 30 capítulos acumulando conocimiento sobre servicios y patrones específicos. Ahora damos un paso atrás y miramos el cuadro completo.

¿Cómo se ve realmente una *buena* arquitectura en la nube? ¿Existe una forma sistemática de evaluar si lo que has construido está genuinamente bien diseñado, o simplemente funciona?

Existe. AWS lo llama el Well-Architected Framework.

**Recapitulación: La Pregunta que Sigue a los Números**

Tres meses de optimización de costes habían producido un número que los sorprendió a todos: 35.904 USD en ahorros anuales, identificados y en su mayoría implementados. Los Savings Plans de EC2, las políticas de ciclo de vida de S3, la limpieza de almacenamiento, las réplicas de base de datos no utilizadas, los endpoints del NAT Gateway: cada uno había sido un descubrimiento separado, una corrección separada. Pero en algún punto de ese proceso, Maya había empezado a hacer una pregunta diferente. No "¿dónde está el desperdicio?" sino "¿cómo se acumuló en primer lugar?" Los problemas de costes eran síntomas de algo. El Well-Architected Framework era el vocabulario para nombrar qué era ese algo.

Nimbus llevaba dos años en marcha. El equipo había tomado cientos de decisiones arquitectónicas: algunas conscientemente, algunas por accidente, algunas bajo presión. El sistema funcionaba. Pero Maya tenía una pregunta.

"¿Es nuestra arquitectura realmente *buena*?" preguntó. "No solo funcional. Buena."

Nadie respondió de inmediato.

"Porque he estado escuchando hablar de una Well-Architected Review," continuó. "AWS la ofrece a los clientes. Algunos de nuestros inversores la mencionaron. Creo que deberíamos hacer una."

"¿Qué es?" preguntó Leo.

"El marco de AWS para evaluar arquitecturas en la nube," dijo Priya. "Seis pilares. Un conjunto de preguntas y mejores prácticas para cada uno. Evalúas tu arquitectura contra todos ellos e identificas lo que falta."

"Es como una inspección de obra," dijo Tom. "Sabes que el edificio funciona. La inspección te dice si cumple el código y qué podría fallar en un terremoto."

**Los Seis Pilares**

El AWS Well-Architected Framework está organizado en torno a seis pilares. Cada pilar tiene un conjunto de principios de diseño, mejores prácticas y preguntas para evaluar tu arquitectura.

**1. Excelencia Operativa**

*Enfoque*: Ejecutar y monitorizar sistemas para entregar valor de negocio, y mejorar continuamente los procesos y procedimientos.

Áreas clave:

- ¿Cómo despliegas los cambios? (CI/CD, infraestructura como código, despliegues automatizados)
- ¿Cómo monitorizas el sistema y sabes cuándo algo va mal?
- ¿Cómo aprendes de los fallos? (postmortems, runbooks, cultura sin reproches)
- ¿Cómo gestionas los cambios a escala?

Evaluación de Nimbus:

- Presente: Pipeline de CI/CD con despliegues automatizados
- Presente: Alarmas de CloudWatch y GuardDuty
- Presente: Pruebas trimestrales de ingeniería del caos
- Advertencia: Proceso de postmortem no formalizado: los incidentes se investigaban, pero los aprendizajes no se documentaban sistemáticamente

**2. Seguridad**

*Enfoque*: Proteger la información, los sistemas y los activos mediante la evaluación y mitigación de riesgos.

Áreas clave:

- ¿Quién puede acceder a qué, y con el menor privilegio posible?
- ¿Cómo se cifran los datos en reposo y en tránsito?
- ¿Cómo detectas y respondes a las amenazas?
- ¿Hay controles de seguridad automatizados?

Evaluación de Nimbus:

- Presente: IAM con privilegio mínimo (tras la limpieza del capítulo 14)
- Presente: KMS para cifrado de datos, Secrets Manager para credenciales
- Presente: GuardDuty, WAF, Shield Standard
- Presente: VPC con subredes privadas, grupos de seguridad
- Advertencia: El parcheo de seguridad en las instancias EC2 no estaba completamente automatizado (Priya lo señaló meses atrás, todavía no resuelto)

"Espera, ¿pero *por qué* lo haríamos así?" preguntó Maya, cuando surgió la brecha del parcheo de seguridad. "Automatizamos los despliegues. Automatizamos los respaldos. ¿Por qué dejamos el parcheo manual?"

"Porque el parcheo se sentía diferente de desplegar código," dijo Priya. "Nos preocupaba que el parcheo rompiera algo. Así que lo mantuvimos manual para conservar el control."

"Y al mantenerlo manual, lo hicimos inconsistente," dijo Maya. "Lo cual es peor."

"Sí," dijo Priya. "AWS Systems Manager Patch Manager resuelve esto. Deberíamos haberlo hecho hace seis meses."

**3. Fiabilidad**

*Enfoque*: Garantizar que un sistema realice su función prevista de forma correcta y consistente, y sea capaz de recuperarse de los fallos.

Áreas clave:

- ¿Cómo gestiona el sistema los fallos a nivel de componente?
- ¿Cómo se recupera de los fallos regionales?
- ¿Cómo se gestiona la demanda?
- ¿Cómo se prueba el sistema ante fallos?

Evaluación de Nimbus:

- Presente: Multi-AZ para todos los componentes críticos
- Presente: Aurora Serverless con failover automático
- Presente: Auto Scaling para EC2 y ECS
- Presente: Pruebas de ingeniería del caos (trimestrales)
- Advertencia: Sin despliegue multi-región (warm standby todavía no implementado: previsto para el próximo trimestre)

**4. Eficiencia de Rendimiento**

*Enfoque*: Usar los recursos de TI y cómputo de forma eficiente.

Áreas clave:

- ¿Se está usando el tipo de instancia y el tipo de base de datos correctos para la carga de trabajo?
- ¿Está el escalado configurado correctamente?
- ¿Se entregan los datos a los usuarios desde la ubicación óptima?

Evaluación de Nimbus:

- Presente: CloudFront para entrega de contenido global
- Presente: ElastiCache para acelerar las lecturas de la base de datos
- Presente: Réplicas de lectura de Aurora
- Presente: Lambda para las cargas de trabajo apropiadas
- Advertencia: Algunas instancias EC2 nunca dimensionadas correctamente desde el despliegue inicial

**5. Optimización de Costes**

*Enfoque*: Evitar costes innecesarios.

Áreas clave:

- ¿Están los recursos apropiadamente dimensionados?
- ¿Se dan de baja los recursos no utilizados?
- ¿Se están usando los modelos de precios apropiados?
- ¿Se detectan las anomalías de gasto?

Evaluación de Nimbus:

- Presente: Savings Plans implementados (capítulo 27)
- Presente: Políticas de ciclo de vida de S3 (capítulo 23)
- Presente: DynamoDB Auto Scaling
- Presente: AWS Budgets con alertas
- Presente: Revisiones trimestrales de costes

"¿Cuánto cuesta eso por mes, exactamente, todas las cosas que todavía no hemos dimensionado correctamente?" preguntó Tom. "Las instancias EC2 que nunca se han evaluado. Las que siguen al tamaño que aprovisionamos en el primer año."

"No lo sé," dijo Leo. "Ese es el punto."

"Esa es la brecha de Eficiencia de Rendimiento," dijo Priya. "Optimizamos las cosas que conocíamos. No tenemos un número para las cosas que todavía no hemos mirado."

**6. Sostenibilidad**

*Enfoque*: Minimizar los impactos ambientales de ejecutar cargas de trabajo en la nube.

Áreas clave:

- ¿Se maximiza la utilización (evitando recursos inactivos)?
- ¿Se eligen los tipos de instancia por su eficiencia energética?
- ¿Se almacenan los datos solo el tiempo necesario?

Evaluación de Nimbus:

- Presente: Lambda y Fargate para cargas de trabajo sin servidor/contenedorizadas (mejor eficiencia de recursos que EC2 dedicado)
- Presente: Políticas de ciclo de vida de S3 (eliminar datos cuando ya no son necesarios)
- Advertencia: Algunas instancias basadas en Graviton todavía no adoptadas (AWS Graviton es más eficiente energéticamente y más barato)

**El Proceso de Well-Architected Review**

La revisión no es una prueba que se pasa o se suspende. Es una conversación estructurada sobre tu arquitectura, guiada por más de 60 preguntas en los seis pilares.

Cada pregunta identifica una práctica recomendada. Si tu arquitectura la sigue, es una fortaleza. Si no, es un "problema": categorizado por nivel de riesgo (alto, medio, bajo).

El resultado: una lista priorizada de recomendaciones de mejora. No todo necesita corregirse de inmediato. El marco te ayuda a entender las compensaciones de cada brecha y a decidir qué abordar primero.

La AWS Well-Architected Tool (disponible en la consola de AWS, gratuita) proporciona el marco de preguntas y genera un informe con recomendaciones.

Para Nimbus, Maya programó una sesión de revisión de medio día que cubría los seis pilares, y decidió no ejecutarla sola. La propia sesión, y la lista de hallazgos que produjo, es hacia donde se dirige este capítulo.

**El Lens: Especializando la Revisión**

El Well-Architected Framework principal es agnóstico en cuanto a tecnología. AWS también publica **Lenses**: extensiones del marco para casos de uso o industrias específicas:

- **Serverless Lens**: Preguntas adicionales para arquitecturas intensivas en Lambda
- **SaaS Lens**: Para aplicaciones SaaS multi-inquilino
- **Machine Learning Lens**: Para cargas de trabajo de entrenamiento e inferencia de ML
- **Financial Services Lens**: Preguntas normativas y de cumplimiento para FinTech
- **Healthcare Lens**: Consideraciones de HIPAA

Quizás te preguntes: ¿necesitas ejecutar la Well-Architected Review completa contra los seis pilares antes de lanzar? No. El valor está en las preguntas, no en la puntuación. Si estás antes del lanzamiento, elige los dos pilares más relevantes para tu situación —Seguridad y Fiabilidad son casi siempre el punto de partida correcto— y trabaja solo esas preguntas. Una revisión parcial que realmente se hace es más valiosa que una revisión completa que se pospone hasta que la arquitectura esté "lista".

Para Nimbus, el SaaS Lens era relevante. Añadía preguntas sobre el aislamiento de inquilinos, la automatización de la incorporación y la asignación de costes por inquilino, todas áreas que Nimbus estaba desarrollando activamente.

**La Sesión de Well-Architected Review: Carlos Facilita**

Maya había invitado a Carlos —un arquitecto senior que había conocido en un evento de la comunidad de AWS, que facilitaba revisiones Well-Architected para equipos como el suyo— a dirigir la sesión. Llegó con la Well-Architected Tool abierta en su portátil y un solo bloc de notas. Sin agenda. Solo preguntas.

"Yo pregunto, ustedes responden con honestidad," dijo. "Si la respuesta honesta es 'no lo sabemos', dilo. Eso es un hallazgo."

Empezó con Excelencia Operativa.

"¿Tienen runbooks para sus cinco principales incidentes?"

Tom miró a Leo. Leo miró al techo.

"Tenemos runbooks para dos incidentes," dijo Priya. "Infracción del límite de conexiones de la base de datos y timeout del origen de CloudFront. Los otros tres —fallo de instancia EC2 durante el pico, limitación de DynamoDB y fallo del webhook de Stripe— los gestionamos ad hoc."

Carlos escribió: *OPS-1: Runbooks para los 5 principales incidentes. Actual: 2/5. Brecha: 3.*

"¿Cuándo fue la última vez que repasaron los runbooks existentes en un simulacro?"

Silencio.

"No lo hemos hecho," dijo Priya. "Los escribimos después de los incidentes. Nunca hemos comprobado si siguen siendo precisos."

*OPS-2: Validación de runbooks. Última prueba: nunca.*

Carlos siguió. Seguridad.

"¿Quién tiene acceso a la cuenta raíz ahora mismo?"

"¿Raíz?" dijo Leo. "Solo Maya. Y creo que Tom todavía tiene las credenciales raíz de cuando configuramos la cuenta, pero las rotamos después del capítulo 14." Hizo una pausa. "Tom, ¿rotamos la raíz después de la limpieza de IAM?"

Tom abrió una entrada de 1Password. "Cambiamos la contraseña y añadimos MFA. Pero las credenciales raíz siguen en la bóveda compartida de 1Password. Tres personas tienen acceso a esa bóveda: yo, Maya y Leo."

"Así que tres personas tienen acceso raíz," dijo Carlos. "La recomendación de AWS es que la raíz solo se use para una breve lista documentada de tareas —unas diez operaciones a nivel de cuenta, todas raras y la mayoría solo para emergencias—. Después de esas operaciones, la sesión raíz debería terminarse. ¿Se registra el acceso raíz por separado?"

"CloudTrail lo registra," dijo Priya.

"¿Hay una alerta cuando se usa la raíz?"

Otra pausa.

"No," dijo Tom.

Carlos escribió: *SEC-1: Control de acceso a la cuenta raíz. Actual: 3 usuarios en bóveda compartida, sin alerta de uso. Brecha: El uso de la raíz debería disparar una alerta SNS inmediata. Objetivo: 0 sesiones raíz no de emergencia.*

"Siguiente: ¿quién revisa los cambios de permisos de IAM? ¿Hay un proceso de revisión por pares para nuevos roles de IAM o expansiones de políticas?"

"Priya los revisa," dijo Leo. "Es la revisora de seguridad de facto."

"¿Qué pasa cuando Priya está de vacaciones?"

Nadie respondió.

"Eso es una brecha de proceso," dijo Carlos, sin juzgar. "No una brecha en la capacidad de Priya, una brecha en el diseño del proceso. Una revisión de seguridad que depende de la disponibilidad de una persona es un único punto de fallo en tu postura de seguridad."

*SEC-2: Proceso de revisión de IAM. Actual: revisor único, sin respaldo. Brecha: Definir un revisor de respaldo y documentar los criterios de revisión.*

Carlos pasó a Fiabilidad.

"¿Han probado el failover Multi-AZ de Aurora bajo carga?"

"Lo probamos en reposo," dijo Tom. "Ejecutamos el comando de failover cuando el sistema estaba tranquilo y confirmamos que la réplica se promovió en 45 segundos."

"¿Cuál era la carga en ese momento?"

"Quizás el 5% del pico."

"¿Qué le pasa al pool de conexiones durante el failover al 80% de la carga pico?"

Tom lo pensó. "El endpoint de DNS se actualiza. Las aplicaciones que usan el endpoint escritor verán errores de conexión durante la ventana de cambio, típicamente de 20 a 45 segundos. Al 5% de carga, teníamos diez conexiones activas. En el pico, tendríamos 300. Con RDS Proxy delante, el proxy gestiona la reconexión."

"¿RDS Proxy realmente se reconecta de forma transparente durante el failover Multi-AZ?"

Tom miró a Priya. "Creo que sí. Pero no lo he probado."

"Esa es una respuesta diferente de 'sí'," dijo Carlos. "Una suposición no probada en tu diseño de alta disponibilidad es un hallazgo."

*REL-1: Failover Multi-AZ de Aurora bajo carga. Probado: solo en reposo. Brecha: Probar al 70% de la carga pico con RDS Proxy implementado. Validar el comportamiento del pool de conexiones durante la ventana de failover.*

"¿Han pensado en qué pasa si el failover tarda 90 segundos en lugar de 45?" preguntó Priya, dirigiéndose a Tom en lugar de a Carlos. Ya estaba haciendo el trabajo.

"A los 90 segundos, tendríamos timeouts de aplicación para cualquier solicitud que no se pueda reintentar," dijo Tom. "El flujo de colocación de pedidos tiene lógica de reintento. El flujo de confirmación, menos. Un failover de 90 segundos durante la afluencia de cenas significaría que un subconjunto de confirmaciones falla, los restaurantes no reciben el pedido, el cliente recibe un reembolso."

"Ese es el radio de impacto," dijo Carlos. "Bien. Ahora sabes contra qué estás protegiéndote y cómo medirlo. La prueba debería validar tanto la duración del failover como el comportamiento de la aplicación durante la ventana de cambio."

Pasó a Eficiencia de Rendimiento.

"¿Están dimensionando correctamente sus instancias EC2?"

"Las dimensionamos durante la revisión de costes," dijo Tom. "Los Savings Plans se comprometieron a los tipos de instancia actuales."

"¿Cuándo fue la última vez que miraron las recomendaciones de Compute Optimizer?"

Tom lo abrió. AWS Compute Optimizer había señalado tres instancias como potencialmente sobreaprovisionadas: dos procesadores en segundo plano c6g.medium y un servidor VPN t3.medium. La recomendación para el servidor VPN era reducir a una t3.small. Los procesadores estaban señalados como "sobreaprovisionados" con un 82% de confianza.

"No hemos mirado esto desde que lo configuramos," admitió Tom.

"¿Desde hace cuánto tiempo Compute Optimizer ha estado generando recomendaciones?"

Tom comprobó. "Seis semanas."

Carlos escribió: *PERF-1: Dimensionamiento correcto de EC2 vía Compute Optimizer. Actual: recomendaciones disponibles, sin revisar. Brecha: Revisión mensual de la salida de Compute Optimizer; aplicar recomendaciones tras validación en staging.*

"Una más," dijo Carlos. "Esta atraviesa todos los pilares." Escribió en la pizarra:

*Estar libre de incidentes no es lo mismo que estar bien diseñado.*

La dejó ahí un momento.

"Su sistema lleva dos años funcionando sin una interrupción importante de cara al cliente," dijo. "Eso es genuinamente bueno. Pero quiero que noten lo que eso les dice, y lo que no."

"¿Que hemos tenido suerte?" ofreció Leo.

"Les dice que los modos de fallo que han encontrado han estado dentro de su capacidad de gestión, dada la arquitectura que tienen hoy. No les dice que la arquitectura sea sólida. Un sistema que no ha fallado todavía no está demostrado que sea resiliente. Está demostrado que no ha encontrado las condiciones específicas que expondrían sus debilidades."

"Así que no fallar no significa no ser vulnerable," dijo Maya.

"Correcto. La Well-Architected Review no busca evidencia de fallos pasados. Busca exposición futura. El failover no probado. Los runbooks que no existen. El rol de IAM que es demasiado amplio. Ninguno de estos ha causado un incidente todavía. Todos podrían."

"Por eso importa la brecha del parcheo," dijo Priya. "No nos han vulnerado a través de una instancia EC2 sin parchear. Eso no significa que no nos vayan a vulnerar."

"Exacto," dijo Carlos. "La ausencia de daño no es evidencia de seguridad. La presencia de una vulnerabilidad sin abordar es evidencia de riesgo, independientemente de si el riesgo se ha materializado."

Tapó su rotulador.

"Esa es la diferencia entre un sistema bien diseñado y uno con suerte."


**El Hallazgo de Sobre-Permiso de IAM**

Carlos señaló un segundo hallazgo durante la revisión del pilar de seguridad que requería una mirada más profunda.

"Su función Lambda que gestiona las notificaciones de pedidos, ¿qué permisos de IAM tiene?"

Leo abrió el rol de ejecución. Tardó treinta segundos más de lo que debería en encontrarlo: el rol había sido creado al principio de la vida de Nimbus y tenía un nombre genérico.

"Acceso completo a S3," dijo, cuando lo encontró.

Carlos esperó.

"¿Qué bucket?" preguntó.

"Todos los buckets," dijo Leo. Leyó la política. "`arn:aws:s3:::*`. Le dimos acceso completo a S3."

"¿Qué hace realmente la función con S3?"

"Lee la configuración de restaurantes de un bucket," dijo Leo. "El bucket `nimbus-restaurant-config`. Específicamente los objetos `restaurants/{restaurant_id}/config.json`. Los lee. Eso es todo."

"Así que la función necesita `s3:GetObject` en `arn:aws:s3:::nimbus-restaurant-config/restaurants/*/config.json`," dijo Carlos. "Lo que tiene son permisos completos de S3 en cada bucket de la cuenta."

"Incluyendo," dijo Priya, "el bucket de instantáneas de Aurora. El bucket de logs de CloudTrail. El bucket de historial de pedidos de clientes."

"Si esta función Lambda se ve comprometida," dijo Carlos, "un atacante tiene acceso completo a cada bucket de S3 de la cuenta. Puede leer, escribir o eliminar cualquier dato."

"Ya la había desplegado... ah," dijo Leo. Estaba leyendo la política. "Escribí esto hace dos años. Tenía prisa por poner en marcha el sistema de notificaciones. Le di acceso amplio porque no estaba seguro de qué necesitaba todavía. Y nunca volví a restringirlo."

"Esa es la fuente más común de sobre-permiso en los sistemas de producción," dijo Carlos, sin acusación. "No negligencia intencional: un atajo tomado bajo presión de tiempo, que nunca se revisó."

Tom ya estaba mirando la lista completa de roles de ejecución de Lambda.

"¿Cuántas de nuestras funciones Lambda tienen permisos demasiado amplios?" preguntó Maya.

La respuesta, después de veinte minutos de revisión: 7 de las 23 funciones Lambda tenían permisos más amplios de lo que requería su propósito documentado. La más preocupante: la Lambda de confirmación de pagos tenía `dynamodb:*` en todas las tablas. Solo necesitaba `dynamodb:GetItem` y `dynamodb:PutItem` en la tabla de pedidos.

"Tres horas de trabajo para arreglar las siete," estimó Priya. "Escribir las políticas de privilegio mínimo, adjuntarlas, eliminar las amplias."

"¿Es este el hallazgo de mayor riesgo hasta ahora?" preguntó Maya a Carlos.

"Empatado con la brecha de runbooks," dijo. "El problema de IAM es un problema de radio de impacto: si cualquiera de estas funciones se ve comprometida, el acceso del atacante es mucho mayor de lo que debería ser. El problema de los runbooks es un problema de tiempo de recuperación: cuando algo va mal, estás improvisando en lugar de seguir un procedimiento probado. Ambos son genuinamente de alto riesgo."

Maya los marcó ambos como P1 en el documento de seguimiento.

"¿Y qué pasa si alguien intenta entrar?" dijo Priya. "Nos hemos estado preocupando por atacantes externos. Pero una Lambda con exceso de permisos significa que un fallo interno —una mala configuración, una vulnerabilidad de dependencia, un ataque a la cadena de suministro— puede tener el mismo radio de impacto."

"La defensa en profundidad asume que cada capa tiene el mínimo acceso necesario," dijo Carlos. "Cuando una capa tiene más acceso del que necesita, la defensa en profundidad deja de funcionar como se diseñó. Tienes una capa que se ve comprometida, pero tiene las llaves de otras tres capas."

Priya marcó el hallazgo de sobre-permiso de IAM como P1, primera columna, con una fecha límite de una semana.


**Clasificando los Hallazgos: P1, P2, P3**

Al final de la sesión, el equipo tenía 14 hallazgos en la pizarra. Carlos les pidió que los clasificaran antes de irse.

"Cada hallazgo de esta lista necesita una prioridad," dijo. "No todo es igualmente importante. Prioricen por: ¿cuál es el radio de impacto si esto falla? ¿Qué probabilidad hay de que falle? ¿Qué tan difícil es de arreglar?"

Los 14 hallazgos:

1. Sin runbooks para 3 de los 5 principales incidentes (OPS)
2. Runbooks nunca probados (OPS)
3. Sin proceso formal de respuesta a incidentes más allá de los runbooks (OPS)
4. Acceso raíz en bóveda compartida, sin alerta de uso (SEC)
5. El proceso de revisión de IAM no tiene revisor de respaldo (SEC)
6. 7 funciones Lambda con exceso de permisos (SEC) ← La Lambda de notificaciones de Leo
7. Algunas reglas de grupo de seguridad más amplias de lo necesario (SEC)
8. Failover de Aurora no probado bajo carga (REL)
9. Plan de recuperación ante desastres multi-región no implementado (REL)
10. Parcheo de seguridad no automatizado (SEC)
11. Dimensionamiento correcto de EC2 no revisado desde el lanzamiento (PERF)
12. Instancias Graviton no adoptadas (SUST)
13. Los TTL de caché de CloudFront no ajustados (PERF)
14. El 40% de la infraestructura no está en IaC (OPS)

"Empecemos por las obvias," dijo Carlos. "¿Cuáles tres arreglarían primero si solo tuvieran una semana?"

Maya fue directa: "Alerta de acceso raíz. Exceso de permisos de Lambda. Automatización del parcheo de seguridad."

"¿Por qué?" preguntó Carlos.

"Porque esas tres son brechas de seguridad con un radio de impacto claro. Las demás son mejoras de fiabilidad y operativas: importantes, pero hemos estado conviviendo con ellas y no han causado un incidente. Las brechas de seguridad se agravan silenciosamente cada día que no las arreglamos."

Tom no estuvo del todo de acuerdo. "El exceso de permisos de Lambda es urgente. Pero yo cambiaría el parcheo de seguridad por la prueba de failover de Aurora. Nunca hemos confirmado que nuestra configuración Multi-AZ funcione correctamente bajo carga. Si falla durante una afluencia de cenas del viernes y no tenemos un runbook probado para ello, estamos en problemas."

"Ambos pueden ser P1," dijo Priya. "Tenemos una semana. Cinco días laborables. Los permisos de Lambda son una corrección de dos horas por función. La alerta de acceso raíz es una regla de evento de CloudWatch de treinta minutos. La automatización del parcheo de seguridad son dos días de configuración y prueba de Systems Manager. La prueba de failover de Aurora es medio día programado un martes a las 2 AM."

Carlos asintió. "Esa es la forma correcta de clasificar. No solo 'qué es más importante' sino '¿qué podemos hacer realmente esta semana, y en qué orden?'"

La clasificación final:

**P1 (esta semana)**:
- Corrección de privilegio mínimo de los roles de ejecución de Lambda (7 funciones)
- Alerta de CloudWatch para la cuenta raíz
- Prueba de failover Multi-AZ de Aurora bajo carga (programada para el próximo martes, 2 AM)

**P2 (este mes)**:
- Automatización del parcheo de seguridad vía Systems Manager
- Runbooks faltantes para los 3 principales incidentes
- Proceso formal de respuesta a incidentes documentado
- Migración del 40% a IaC: identificar qué recursos, construir plan de migración

**P3 (este trimestre)**:
- Simulacro de validación de runbooks
- Revisor de respaldo del proceso de revisión de IAM documentado
- Endurecer las reglas de grupo de seguridad demasiado amplias
- Revisión del dimensionamiento correcto de EC2 vía Compute Optimizer
- Plan de adopción de Graviton
- Ajuste de los TTL de CloudFront

"Eso son catorce hallazgos con responsables, fechas límite y prioridades," dijo Maya. "Nunca habíamos estado tan organizados con la deuda técnica."

"Para eso sirve la revisión," dijo Carlos. "No para hacerlos sentir mal por las brechas. Para darles un vocabulario y una lista contra la que realmente puedan ejecutar."


**La Diferencia Entre Bien Diseñado y Solo Funcionando**

"Nuestro sistema funciona," dijo Leo tras la revisión. "Pero no me había dado cuenta de cuántas cosas habíamos hecho 'lo suficientemente bien' y seguimos adelante."

"¿Hemos pensado en qué pasa si seguimos dejando estas brechas?" preguntó Priya. "El problema del parcheo lleva meses abierto. El proceso de respuesta a incidentes no existe. Estas no son cosas menores: son las cosas que determinan si una interrupción de viernes por la noche es una corrección de 20 minutos o un desastre de cuatro horas."

"Por eso estamos haciendo la revisión," dijo Maya.

"Eso es normal," dijo Priya. "Construir bajo presión de tiempo significa que tomas decisiones pragmáticas. La Well-Architected Review es el tiempo programado para revisarlas."

"Algunas de estas brechas parecen obvias en retrospectiva," continuó. "El parcheo de seguridad: sabía que no lo habíamos automatizado. Simplemente nunca lo había priorizado para corregirlo."

"Porque 'funciona' y 'está bien arquitectado' se sienten igual día a día," dijo Maya. "La diferencia solo se hace visible cuando algo va mal."

Esto es una de las cosas más importantes que entiende un ingeniero senior: la ausencia de incidentes no significa la ausencia de riesgo. Significa que el riesgo todavía no se ha activado.

**Infraestructura como Código: El Habilitador de Excelencia Operativa**

Un tema en varios pilares: la **Infraestructura como Código (IaC)**.

Si tu infraestructura está configurada manualmente a través de la consola, entonces:

- Recrearla en un escenario de recuperación ante desastres es lento y propenso a errores
- Auditar los cambios es imposible (¿quién cambió qué y cuándo?)
- Revertir un cambio incorrecto requiere reversión manual
- La consistencia entre entornos (desarrollo/staging/producción) requiere disciplina

**AWS CloudFormation** te permite definir la infraestructura en plantillas YAML/JSON. **AWS CDK (Cloud Development Kit)** te permite definir la infraestructura usando lenguajes de programación (Python, TypeScript, Java). **Terraform** es una alternativa popular de terceros.

Nimbus había estado migrando gradualmente a IaC usando Terraform. En el momento de la Well-Architected Review, aproximadamente el 60% de su infraestructura estaba definida en código. La revisión recomendó llegar al 100%.

"¿Por qué el 40% restante?" preguntó Leo.

"El 40% restante es donde vive nuestra infraestructura crítica," dijo Priya. "Si no podemos recrearla desde código, no podemos recuperarnos de un desastre regional de forma fiable."

Leo miró la lista. "El 40% restante, sí. Irá bien, lo migraremos el próximo sprint."

Priya mantuvo la mirada en la pantalla. "Esa es la infraestructura crítica. La configuración de failover multi-región. La jerarquía de roles de IAM. Las cosas que, si tenemos que reconstruir desde cero a las 3 AM, necesitamos saber que están exactamente correctas."

Leo lo consideró un momento.

"...Tienes razón," dijo en voz baja. "Ya tenemos configuración manual que se ha desviado de lo que alguien escribió. Si tuviéramos que reconstruirla desde cero, estaríamos adivinando."

"Por eso la revisión lo encontró," dijo Maya. "No para asignar culpas. Para arreglarlo antes de que importe."

**CloudFormation en Profundidad: La Herramienta IaC Nativa de AWS**

Aunque Nimbus había adoptado Terraform, la Well-Architected Review también sacó a la luz que el equipo nunca había entendido del todo AWS CloudFormation: el servicio IaC nativo de AWS que sustenta servicios como CDK, SAM (el modelo de aplicación sin servidor) y el Service Catalog. El examen evalúa CloudFormation específicamente, y varios servicios de AWS requieren entenderlo.

El problema que Carlos había nombrado antes en la sesión era concreto: Leo había estado haciendo clic manualmente por la consola para crear entornos. Le llevaba 45 minutos cada vez, y cualquier discrepancia entre staging y producción era invisible hasta que algo se rompía. Tres de los cinco incidentes de producción del último año habían sido causados por una configuración en producción que no coincidía con staging: reglas de grupo de seguridad diferentes, variables de entorno diferentes, un tipo de instancia diferente.

"La consola es una puerta de un solo sentido," dijo Carlos. "Puedes entrar y cambiar cosas, pero no puedes salir fácilmente y ver exactamente qué se cambió, o reproducir el estado de ayer."

CloudFormation es la respuesta a eso. Así funciona:

**Plantilla (Template)**: Un archivo YAML o JSON que declara la infraestructura de AWS que quieres. No instrucciones de cómo crearla, sino una declaración de cómo debería verse. "Quiero una VPC con estos rangos CIDR, dos subredes públicas, dos subredes privadas, un Internet Gateway y estas tablas de rutas." CloudFormation lee la plantilla y descubre cómo hacer que la infraestructura real coincida con la declaración.

Piensa en una plantilla como una receta para un entorno. La receta no cambia. Cada entorno creado a partir de ella es idéntico. Staging y producción usan la misma plantilla, con diferentes parámetros (diferentes tamaños de instancia, diferentes nombres de dominio). Las decisiones estructurales —qué subredes existen, qué grupos de seguridad, qué roles de IAM— son idénticas.

**Stack**: La instancia desplegada de una plantilla. Cuando Leo ejecuta `aws cloudformation deploy --template-file infrastructure.yaml`, CloudFormation crea un Stack: una colección con nombre de los recursos reales de AWS que la plantilla describe. El Stack recuerda qué recursos creó, y los gestiona como una unidad. Actualiza la plantilla y vuelve a desplegar el Stack: CloudFormation calcula la diferencia entre el estado actual y la nueva plantilla, y aplica solo los cambios necesarios. Elimina el Stack: CloudFormation desmantela cada recurso que creó, en el orden correcto, sin que tengas que recordarlos.

"¿Así que el Stack es el despliegue, no la plantilla?" preguntó Maya.

"La plantilla es la receta. El Stack es la comida. Puedes hacer la misma comida de la misma receta tantas veces como quieras. Cada vez es igual."

**Change Set**: Antes de aplicar una actualización a un Stack en ejecución, puedes crear un Change Set: una vista previa de lo que CloudFormation hará. ¿Añadir un nuevo recurso? El Change Set lo muestra. ¿Modificar un grupo de seguridad? El Change Set muestra el antes y el después. ¿Reemplazar una instancia de RDS? El Change Set lo marca como un reemplazo —lo que significa tiempo de inactividad— antes de que lo confirmes.

"Ver el diff antes de aplicar," dijo Priya. "Esto es lo que nos falta cuando Leo hace clic en cosas en la consola."

Para Nimbus, la política se convirtió en: todos los cambios de infraestructura en producción deben pasar por una revisión de Change Set. Sin ediciones directas en la consola. El Change Set es el proceso de revisión por pares para la infraestructura.

**Detección de Deriva (Drift Detection)**: Con el tiempo, la gente hace clic en cosas en la consola. Una regla de grupo de seguridad añadida durante un incidente. Una variable de entorno cambiada en medio de un despliegue. Un tipo de instancia aumentado manualmente cuando la corrección programada tardaba demasiado. CloudFormation llama a esto **deriva (drift)**: cuando el estado real de un recurso ya no coincide con lo que la plantilla del Stack dice que debería ser.

La detección de deriva de CloudFormation escanea los recursos del Stack y reporta cualquier diferencia entre el estado real y el estado definido en la plantilla. Cuando Leo ejecutó la detección de deriva en los Stacks existentes de Nimbus por primera vez, encontró once recursos con deriva. Siete de ellos eran modificaciones de grupos de seguridad. Tres eran cambios de políticas de IAM. Uno era un bucket de S3 que había tenido su política de ciclo de vida cambiada directamente en la consola hacía seis meses y nunca reflejada en la plantilla.

"Once recursos donde la infraestructura real y la plantilla no coinciden," dijo Priya. "Once posibles inconsistencias entre staging y producción que no conocemos."

Leo no dijo nada. Algunas de esas modificaciones eran suyas.

Pasó la siguiente semana reconciliando los recursos con deriva con las plantillas. Tres de los cambios manuales eran errores: configuración que nunca debería haberse aplicado. El resto eran cambios legítimos que simplemente nunca se habían vuelto a confirmar en la plantilla.

**Por Qué Importa para el Well-Architected Framework**: La Infraestructura como Código se sitúa en la intersección de la Excelencia Operativa (despliegues repetibles, infraestructura versionada, auditabilidad de cada cambio), la Fiabilidad (si una Región falla, puedes recrear el entorno desde la plantilla, no desde la memoria) y la Seguridad (los roles de IAM y las reglas de grupo de seguridad se revisan en código, no se descubren después en la consola). No es un lujo, es una de las prácticas fundamentales que el marco recomienda consistentemente.

---

> **Consejo para el Examen — CloudFormation**
>
> *Dominio SAA-C03: Transversal — Excelencia Operativa y Fiabilidad*
>
> - **CloudFormation = IaC declarativa en AWS.** Declaras el estado deseado en una plantilla; CloudFormation crea y gestiona los recursos. Señal de examen: "despliegues repetibles," "infraestructura como código," "entornos consistentes."
> - **Plantilla** → **Stack**: la plantilla es la declaración; el Stack son los recursos desplegados. Un Stack se puede crear, actualizar o eliminar como una unidad.
> - **Change Set**: Vista previa de lo que cambiará antes de aplicar una actualización a un Stack en ejecución. "Ver el diff antes de aplicar." Señal de examen: "revisar los cambios de infraestructura antes de desplegar" → Change Set.
> - **Detección de Deriva (Drift Detection)**: Identifica recursos que se han cambiado manualmente fuera de CloudFormation. "Alguien hizo clic en algo en la consola" → Drift Detection.
> - **Atributo DeletionPolicy**: Controla qué le pasa a un recurso cuando su Stack se elimina. `Retain`: el recurso se conserva (útil para buckets de S3 con datos que no quieres perder). `Delete`: el recurso se destruye (el predeterminado). `Snapshot`: para RDS y algunos otros servicios, CloudFormation toma una instantánea final antes de eliminar. Señal de examen: "evitar que una base de datos RDS se elimine cuando se elimina el stack" → `DeletionPolicy: Snapshot` o `DeletionPolicy: Retain`.
> - **CloudFormation StackSets**: Despliega el mismo Stack en múltiples cuentas y regiones de AWS desde una sola operación. Señal de examen: "desplegar la misma infraestructura en todas las cuentas de una organización."

**Variación: Cuando el Marco te Engaña**

Si marcas todas las casillas en una Well-Architected Review pero no has validado tu recuperación ante fallos en staging, tu arquitectura de alta disponibilidad fallará en el primer incidente real, porque la documentación de la resiliencia no es lo mismo que la resiliencia probada. El marco pregunta "¿tienes Multi-AZ?" no "¿has confirmado que el failover realmente funciona correctamente en tu configuración específica?"

Si usas el marco como una lista de comprobación para satisfacer a un auditor en lugar de como una herramienta de pensamiento para mejorar el sistema, producirás documentación precisa de una arquitectura que no entiendes del todo. Las preguntas son más valiosas cuando revelan brechas que no esperabas encontrar.

## Ventajas y Limitaciones

**Lo que el Well-Architected Framework hace bien**: Da a los equipos un vocabulario compartido para discutir las compensaciones arquitectónicas, un lenguaje que sobrevive a los cambios de personal y las conversaciones con proveedores. Ejecutar una Well-Architected Review obliga a reconocer explícitamente los riesgos que de otro modo son invisibles: "Sí, sabemos que tenemos un único punto de fallo aquí; aceptamos esa compensación porque el coste de eliminarlo supera el coste esperado del fallo." Ese tipo de compensación documentada e intencional es el resultado de una buena revisión.

**Lo que no puede hacer**: El Marco es descriptivo, no prescriptivo. Describe las propiedades de los sistemas bien arquitectados: no te dice cómo construirlos. Marcar todas las casillas en una Well-Architected Review no garantiza una buena arquitectura. Un sistema puede tener alta disponibilidad, excelencia operativa, estar optimizado en costes y aun así resolver el problema equivocado. El Marco es una lente, no un plano. Úsalo para plantear las preguntas correctas, no para responderlas.

## Resumen

La Well-Architected Review les dejó con 14 elementos: tres que necesitaban atención inmediata, el resto que necesitaba un plan. Los hallazgos de alto riesgo no fueron exactamente sorpresas; eran cosas que el equipo conocía y a las que todavía no había llegado. La revisión les dio una forma estructurada de reconocer esas brechas abiertamente, priorizarlas por riesgo y comprometerse con un cronograma. Esa responsabilidad, más que cualquier hallazgo individual, fue el valor.

- El **AWS Well-Architected Framework** tiene seis pilares: Excelencia Operativa, Seguridad, Fiabilidad, Eficiencia de Rendimiento, Optimización de Costes y Sostenibilidad.
- Cada pilar tiene principios de diseño y mejores prácticas evaluadas a través de un conjunto de preguntas estructuradas.
- La **Well-Architected Tool** (gratuita en la consola de AWS) guía la revisión y genera un informe.
- El resultado es una lista priorizada de mejoras arquitectónicas categorizadas por riesgo.
- La **Infraestructura como Código** es un habilitador transversal: recomendada por los pilares de Excelencia Operativa, Seguridad y Fiabilidad.

## Consejos para el Examen

*Dominio SAA-C03: Transversal, todos los dominios*

- **Conoce los seis pilares y su enfoque principal**. El examen describirá un escenario (por ejemplo, "el equipo quiere garantizar que su sistema pueda recuperarse de fallos de AZ") y te preguntará a qué pilar pertenece (Fiabilidad).
- **Mapeo de pilares**:
  - "Desplegar cambios de forma fiable, aprender de los fallos, monitorizar" → Excelencia Operativa
  - "IAM, cifrado, controles de red, detección de amenazas" → Seguridad
  - "Alta disponibilidad, failover, escalado, recuperación ante desastres" → Fiabilidad
  - "Dimensionamiento correcto, CDN, selección de tecnología correcta" → Eficiencia de Rendimiento
  - "Modelos de precios, recursos no utilizados, visibilidad de costes" → Optimización de Costes
  - "Eficiencia energética, utilización de recursos, ciclo de vida de datos" → Sostenibilidad
- **Infraestructura como Código**: Recomendada por el marco para repetibilidad, auditabilidad y recuperación. CloudFormation, CDK y SAM son herramientas IaC nativas de AWS.
- **Well-Architected Tool**: La herramienta de la consola de AWS que guía el proceso de revisión. Gratuita para usar. Genera planes de mejora.
- **AWS Trusted Advisor**: Similar al marco Well-Architected, pero automatizado: escanea tu cuenta y proporciona recomendaciones sobre coste, rendimiento, seguridad y tolerancia a fallos. La superposición es real: Trusted Advisor automatiza parte de lo que el marco evalúa manualmente.

## Ejercicios

**Ejercicio 1 — Recordatorio**

Nombra los seis pilares del AWS Well-Architected Framework y describe la preocupación principal de cada uno en una frase.

*(Intenta hacerlo de memoria. Si tienes dificultades, eso es información útil sobre qué pilares necesitan más atención.)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: Un equipo de ingeniería se está preparando para una Well-Architected Review. Su aplicación se ejecuta en EC2 con RDS Multi-AZ. Recientemente descubrieron que:

- Su proceso de despliegue a veces deja instancias EC2 con diferentes versiones de librería (deriva de configuración)
- No tienen alertas automatizadas cuando se activa el failover de RDS
- Sus usuarios de IAM tienen todos AdministratorAccess
- No han probado su proceso de restauración de respaldos en 14 meses

Mapea cada problema al pilar del Well-Architected más relevante.

A) Deriva de configuración: Excelencia Operativa; Sin alertas de failover de RDS: Fiabilidad; AdministratorAccess: Seguridad; Sin prueba de restauración de respaldos: Fiabilidad

B) Deriva de configuración: Seguridad; Sin alertas de failover de RDS: Eficiencia de Rendimiento; AdministratorAccess: Excelencia Operativa; Sin prueba de restauración de respaldos: Optimización de Costes

C) Deriva de configuración: Fiabilidad; Sin alertas de failover de RDS: Eficiencia de Rendimiento; AdministratorAccess: Seguridad; Sin prueba de restauración de respaldos: Excelencia Operativa

D) Deriva de configuración: Seguridad; Sin alertas de failover de RDS: Fiabilidad; AdministratorAccess: Optimización de Costes; Sin prueba de restauración de respaldos: Seguridad

**Pista 1**: "Deriva de configuración" en el proceso de despliegue → ¿qué pilar cubre las prácticas de despliegue?

**Pista 2**: "AdministratorAccess" para todos los usuarios → ¿qué pilar cubre el control de acceso?

**Pista 3**: "Restauración de respaldos no probada" → ¿qué pilar cubre la prueba de tus mecanismos de recuperación?

**Respuesta**: A

**Explicación**: La deriva de configuración en los despliegues (entornos inconsistentes) es un problema de Excelencia Operativa: se trata de prácticas de despliegue fiables y consistentes. Sin alertas sobre el failover de RDS significa que no sabes cuándo se activan los mecanismos de alta disponibilidad, un problema de Fiabilidad (conocer la salud de tu sistema). AdministratorAccess para todos los usuarios viola el privilegio mínimo, un problema de Seguridad. La restauración de respaldos no probada significa que tus mecanismos de Fiabilidad (recuperación ante desastres) no están verificados.

**¿Por qué no B?** B asigna incorrectamente la deriva de configuración a Seguridad (la inconsistencia de versiones de librería es un problema de operaciones de despliegue, no una amenaza de seguridad) y AdministratorAccess a Excelencia Operativa (el control de acceso es una preocupación de Seguridad, no un proceso operativo).

**¿Por qué no C?** C coloca correctamente AdministratorAccess en Seguridad, pero asigna incorrectamente la deriva de configuración a Fiabilidad (la consistencia del despliegue es Excelencia Operativa) y la restauración de respaldos no probada a Excelencia Operativa (la prueba de recuperación es una preocupación de Fiabilidad: estás verificando que tu sistema puede recuperarse, no que tus procesos sean consistentes).

**¿Por qué no D?** D asigna AdministratorAccess a Optimización de Costes (los permisos demasiado amplios no tienen nada que ver con el coste) y la restauración de respaldos no probada a Seguridad (no poder restaurar un respaldo es un fallo de Fiabilidad, no una vulnerabilidad de seguridad).

*Dominio SAA-C03: Transversal*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Realiza una mini Well-Architected Review de una aplicación que conoces o estás construyendo. Para cada uno de los seis pilares, anota:

- Una cosa que la aplicación hace bien
- Una cosa que la aplicación podría mejorar

Luego clasifica tus elementos de mejora por riesgo (¿qué es más probable que cause un incidente o un desperdicio?) y prioridad (¿qué tendría el mayor impacto si se corrigiera?).

*(Este ejercicio es más valioso de lo que podría parecer. La práctica de evaluar sistemáticamente la arquitectura desde múltiples ángulos es una habilidad fundamental del ingeniero senior.)*

## Escena Poscréditos

Tres semanas después de la Well-Architected Review, el equipo había implementado las tres correcciones P1 —los siete roles de Lambda eran de privilegio mínimo, el uso de la raíz disparaba una alerta, y el failover de Aurora había sido probado bajo carga un martes a las 2 AM— y el trabajo P2 estaba en marcha.

El parcheo de EC2 ahora estaba automatizado a través de AWS Systems Manager Patch Manager. Existía un documento de proceso de respuesta a incidentes (no perfecto, pero escrito y compartido). El plan de warm standby multi-región estaba redactado y programado para implementarse el próximo trimestre.

Priya revisó el informe de la Well-Architected Tool. Los hallazgos P1 estaban cerrados o asignados con evidencia. Los elementos de riesgo medio y bajo se reducían, con responsables y fechas.

"Estamos en mejor forma que antes," dijo.

"¿Es eso bueno?" preguntó Leo.

"Es progreso," dijo ella. "No terminas una Well-Architected Review. Avanzas, luego revisas de nuevo en seis meses."

Maya había estado pensando en algo.

"Hemos pasado 31 capítulos aprendiendo servicios individuales de AWS," dijo. "Y ahora estamos empezando a mirar el sistema completo. Así es como piensan los arquitectos."

"Llevamos un tiempo pensando como arquitectos," dijo Leo.

"Hemos estado tomando decisiones arquitectónicas," dijo Maya. "Eso es diferente. Pensar como un arquitecto significa que evalúas las decisiones *antes* de tomarlas, no después."

"¿Cuál es la diferencia?" preguntó Tom.

"En el siguiente capítulo," dijo ella, "intentamos responder eso."

En el siguiente capítulo: cómo se ve una revisión de arquitectura real, desde los primeros principios.
