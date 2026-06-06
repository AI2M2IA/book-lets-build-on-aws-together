# Apéndice D: Examen de Práctica Completo (65 Preguntas)

Este es un examen de práctica SAA-C03 de extensión completa: 65 preguntas, que reflejan los pesos de dominio del examen real — Diseñar Arquitecturas Seguras (Preguntas 1–20, ~30%), Diseñar Arquitecturas Resilientes (21–37, ~26%), Diseñar Arquitecturas de Alto Rendimiento (38–53, ~24%) y Diseñar Arquitecturas Optimizadas en Costos (54–65, ~20%).

**Cómo realizarlo:**

- Pon un temporizador en **130 minutos** — la duración del examen real. Practica el ritmo: eso son dos minutos por pregunta.
- Siete preguntas dicen **"(Elija DOS.)"** — tienen cinco opciones y exactamente dos respuestas correctas, igual que los ítems de respuesta múltiple del examen real. Ambas deben ser correctas para puntuar la pregunta.
- No mires la clave de respuestas hasta que hayas terminado las 65. En el examen real no hay retroalimentación a mitad de camino, y entrenar tu tolerancia a la incertidumbre es parte de la preparación.
- El examen real incluye 15 preguntas experimentales no puntuadas que no puedes identificar. Las 65 aquí están todas "puntuadas". Un punto de referencia para aprobar: **47 o más correctas (~72%)** te sitúa en el rango del puntaje escalado de aprobación de 720/1000. Por debajo de 47, vuelve a revisar los capítulos mapeados en el Apéndice B para tus dominios débiles antes de reservar el examen.
- Por cada pregunta que falles — y cada pregunta que aciertes pero en la que hayas dudado — lee el análisis de los distractores. El examen evalúa las *diferencias* entre opciones plausibles, y ahí es donde está el aprendizaje.

---

## Parte 1 — Diseñar Arquitecturas Seguras (Preguntas 1–20)

**Pregunta 1** *(Dominio 1 — Tarea 1.1)*
Una empresa de servicios financieros usa AWS Organizations con todas las características habilitadas. El equipo de seguridad adjuntó una service control policy (SCP) a la raíz de la organización que deniega el uso de todas las Regiones de AWS excepto eu-west-1. Durante una auditoría, el equipo descubre que un administrador en una cuenta todavía pudo lanzar instancias EC2 en us-east-2 a pesar de la SCP. ¿Qué cuenta es la que más probablemente permitió esta acción?

A) Una cuenta miembro en una unidad organizativa (OU) anidada, porque las SCP no se propagan a las OU anidadas
B) La cuenta de gestión, porque las SCP no se aplican a la cuenta de gestión
C) Una cuenta miembro cuya política de administrador de IAM incluye un Allow explícito, que anula las SCP
D) Una cuenta miembro creada después de que se adjuntó la SCP, porque las SCP solo se aplican a las cuentas que existían en el momento de la asociación

**Pregunta 2** *(Dominio 1 — Tarea 1.1)*
Una startup quiere permitir que sus desarrolladores creen roles de IAM para sus aplicaciones, pero el equipo de seguridad teme que los desarrolladores puedan crear roles con más permisos de los que ellos mismos tienen, lo que llevaría a una escalada de privilegios. El equipo de seguridad quiere que los desarrolladores conserven la creación de roles de autoservicio. ¿Cuál es la solución MÁS apropiada?

A) Exigir que los desarrolladores envíen solicitudes de creación de roles a través de un sistema de tickets revisado por el equipo de seguridad
B) Adjuntar una SCP a las cuentas de los desarrolladores que deniegue por completo la acción iam:CreateRole
C) Exigir que todos los roles creados por los desarrolladores incluyan una permissions boundary específica, aplicada con una condición de IAM en iam:CreateRole e iam:AttachRolePolicy
D) Habilitar AWS CloudTrail y configurar alertas cada vez que un desarrollador cree un nuevo rol de IAM

**Pregunta 3** *(Dominio 1 — Tarea 1.1)*
Un proveedor de SaaS necesita acceder a recursos en las cuentas de AWS de sus clientes para realizar análisis de costos automatizados. Los clientes crean un rol de IAM que la cuenta del proveedor de SaaS puede asumir. Un consultor de seguridad advierte que un tercero que conozca el ARN del rol de un cliente podría engañar al proveedor de SaaS para que acceda a la cuenta de ese cliente en nombre del tercero. ¿Qué mecanismo mitiga este riesgo de "diputado confundido" (confused deputy)?

A) Exigir autenticación multifactor (MFA) en la política de confianza del rol entre cuentas
B) Exigir que el proveedor de SaaS pase un ExternalId único, definido por el cliente, en la llamada sts:AssumeRole y validado por una condición en la política de confianza del rol
C) Cifrar el ARN del rol con AWS KMS antes de compartirlo con el proveedor de SaaS
D) Reemplazar el rol entre cuentas con un usuario de IAM cuyas claves de acceso se roten cada 90 días

**Pregunta 4** *(Dominio 1 — Tarea 1.1)*
Una empresa con 40 cuentas de AWS en AWS Organizations quiere que sus empleados inicien sesión una vez con sus credenciales existentes de Microsoft Entra ID (Azure AD) y accedan a todas las cuentas de AWS a través de un único portal, con permisos asignados de forma centralizada por cuenta. ¿Qué solución cumple estos requisitos con la MENOR sobrecarga operativa?

A) Crear usuarios de IAM en cada una de las 40 cuentas y sincronizar las contraseñas con Entra ID
B) Configurar AWS IAM Identity Center con Entra ID como proveedor de identidad externo y asignar permission sets a usuarios y grupos por cuenta
C) Desplegar Amazon Cognito user pools en cada cuenta y federarlos con Entra ID
D) Crear un proveedor de identidad SAML en cada cuenta y escribir manualmente roles de IAM y políticas de confianza por cuenta

**Pregunta 5** *(Dominio 1 — Tarea 1.1)*
Una empresa de juegos móviles está construyendo una app donde los jugadores se registran con una dirección de correo electrónico o inicio de sesión social, y tras la autenticación la app debe cargar capturas de pantalla de los jugadores directamente en un bucket de Amazon S3 usando credenciales temporales de AWS. ¿Qué combinación de servicios debería recomendar el arquitecto de soluciones?

A) Un Amazon Cognito user pool para el registro/inicio de sesión, y un Amazon Cognito identity pool para intercambiar el token autenticado por credenciales temporales de AWS
B) Un Amazon Cognito identity pool para el registro/inicio de sesión, y un Amazon Cognito user pool para emitir credenciales temporales de AWS
C) AWS IAM Identity Center para el registro/inicio de sesión, y AWS STS GetSessionToken para las credenciales
D) Un Amazon Cognito user pool por sí solo, porque los tokens del user pool otorgan acceso directo a S3

**Pregunta 6** *(Dominio 1 — Tarea 1.3)*
Una empresa de atención médica debe cifrar datos en Amazon S3 con una clave que admita rotación anual automática gestionada por AWS, sin dejar de permitir que la empresa defina la política de clave, habilite el registro de uso de la clave en CloudTrail y deshabilite la clave si es necesario. ¿Qué tipo de clave de KMS cumple estos requisitos?

A) Una AWS managed key (aws/s3)
B) Una customer managed key con rotación automática habilitada
C) Una AWS owned key
D) Una customer managed key con material de clave importado (BYOK) y rotación automática habilitada

**Pregunta 7** *(Dominio 1 — Tarea 1.3)*
Un arquitecto de soluciones está explicando cómo AWS KMS cifra un archivo de 4 GB almacenado por una aplicación, dado que KMS solo puede cifrar directamente hasta 4 KB de datos. ¿Qué afirmación describe con precisión el cifrado de sobre (envelope encryption)?

A) KMS divide el archivo en fragmentos de 4 KB y cifra cada fragmento con la clave de KMS
B) La aplicación solicita una clave de datos a KMS, cifra el archivo localmente con la clave de datos en texto plano, luego almacena la clave de datos cifrada junto a los datos y descarta la clave de datos en texto plano
C) KMS transmite el archivo a través de la API de KMS, que lo cifra del lado del servidor con la clave de KMS
D) La aplicación cifra el archivo con una clave simétrica codificada en el código, y KMS firma el resultado para garantizar la integridad

**Pregunta 8** *(Dominio 1 — Tarea 1.3)*
Una empresa almacena una contraseña maestra de Amazon RDS for PostgreSQL y necesita que se rote automáticamente cada 30 días sin tiempo de inactividad de la aplicación. La aplicación mantiene conexiones de base de datos de larga duración, por lo que el equipo quiere una estrategia de rotación en la que la credencial anterior siga siendo válida mientras se activa la nueva. ¿Qué solución cumple estos requisitos?

A) Parámetros SecureString de AWS Systems Manager Parameter Store con una función Lambda activada mensualmente
B) AWS Secrets Manager con la estrategia de rotación de usuario único
C) AWS Secrets Manager con la estrategia de rotación de usuarios alternados, que cambia entre dos usuarios de base de datos para que una credencial siempre permanezca válida
D) Rotación automática de claves de AWS KMS aplicada a la contraseña de la base de datos

**Pregunta 9** *(Dominio 1 — Tarea 1.3)*
Una empresa de medios almacena video sin procesar en Amazon S3. El cumplimiento requiere que la empresa gestione y proporcione sus propias claves de cifrado, que AWS nunca almacene esas claves y que las claves se proporcionen con cada solicitud. ¿Qué opción de cifrado cumple estos requisitos?

A) SSE-S3
B) SSE-KMS con una customer managed key
C) SSE-C
D) Cifrado del lado del cliente usando la AWS managed key aws/s3

**Pregunta 10** *(Dominio 1 — Tarea 1.3)*
Un agente de bolsa (broker-dealer) debe conservar los registros de operaciones en Amazon S3 durante siete años de una manera que impida que cualquier persona — incluido el usuario root de la cuenta de AWS — elimine o sobrescriba los objetos durante el período de retención, para satisfacer la Regla 17a-4 de la SEC. ¿Qué configuración cumple este requisito?

A) S3 Object Lock en modo governance con un período de retención de 7 años
B) S3 Object Lock en modo compliance con un período de retención de 7 años en un bucket con versionado habilitado
C) Una política de bucket de S3 que deniegue s3:DeleteObject para todos los principales
D) S3 Glacier Deep Archive con una regla de ciclo de vida que expire los objetos después de 7 años

**Pregunta 11** *(Dominio 1 — Tarea 1.2)*
Una aplicación web se ejecuta en instancias EC2 detrás de un Application Load Balancer. Un ingeniero de red agrega una regla de network ACL a la subred que permite el puerto TCP 443 entrante desde 0.0.0.0/0, pero los clientes todavía no pueden completar las solicitudes HTTPS. Los grupos de seguridad están configurados correctamente. ¿Cuál es la causa MÁS probable?

A) La network ACL tiene estado y requiere una regla de seguimiento de conexiones
B) La network ACL no tiene una regla de salida que permita los puertos efímeros (1024–65535), por lo que el tráfico de retorno se bloquea porque las NACL no tienen estado
C) El grupo de seguridad también debe permitir el puerto 443 saliente, porque los grupos de seguridad no tienen estado
D) Las network ACL no pueden permitir tráfico desde 0.0.0.0/0; se requiere un CIDR específico

**Pregunta 12** *(Dominio 1 — Tarea 1.2)*
¿Cuáles DOS afirmaciones sobre los grupos de seguridad y las network ACL en una VPC son precisas? (Elija DOS.)

A) Los grupos de seguridad tienen estado, por lo que el tráfico de retorno se permite automáticamente sin importar las reglas de salida
B) Las network ACL evalúan las reglas en orden numérico y admiten reglas de Deny explícitas
C) Los grupos de seguridad admiten reglas tanto de Allow como de Deny
D) Las network ACL se adjuntan a interfaces de red elásticas individuales
E) Las reglas de los grupos de seguridad se evalúan en orden numérico, deteniéndose en la primera coincidencia

**Pregunta 13** *(Dominio 1 — Tarea 1.2)*
Una empresa de comercio electrónico que ejecuta una aplicación de cara al público en CloudFront y ALB está preocupada por ataques DDoS grandes y sofisticados. La empresa quiere acceso 24/7 al AWS Shield Response Team, protección de costos contra los cargos de escalado causados por ataques, y diagnósticos de ataques. ¿Qué servicio debería usar?

A) AWS Shield Standard, que se habilita automáticamente sin costo
B) AWS Shield Advanced
C) AWS WAF con reglas basadas en tasa
D) Amazon GuardDuty con el plan de protección de EC2

**Pregunta 14** *(Dominio 1 — Tarea 1.2)*
Una API REST detrás de un Application Load Balancer está siendo atacada con intentos de inyección SQL y solicitudes excesivas desde un pequeño conjunto de direcciones IP. ¿Qué solución bloquea los patrones de solicitudes maliciosas en el borde de la aplicación con el MENOR esfuerzo de desarrollo?

A) Agregar código de validación de entrada a cada manejador de la API
B) Asociar AWS WAF con el ALB, usando el grupo de reglas gestionado de inyección SQL y una regla basada en tasa
C) Habilitar AWS Shield Standard en el ALB
D) Configurar el grupo de seguridad del ALB para denegar las solicitudes que contengan palabras clave de SQL

**Pregunta 15** *(Dominio 1 — Tarea 1.2)*
Una empresa quiere abordar tres necesidades de seguridad: (1) detectar continuamente instancias EC2 comprometidas y actividad anómala de la API usando inteligencia de amenazas, (2) descubrir y clasificar información de identificación personal (PII) almacenada en buckets de S3, y (3) escanear instancias EC2 e imágenes de contenedores en busca de vulnerabilidades de software (CVEs). ¿Qué mapeo de servicios de AWS a necesidades es correcto?

A) 1: Amazon Inspector, 2: Amazon GuardDuty, 3: Amazon Macie
B) 1: Amazon GuardDuty, 2: Amazon Macie, 3: Amazon Inspector
C) 1: Amazon Macie, 2: Amazon Inspector, 3: Amazon GuardDuty
D) 1: Amazon GuardDuty, 2: Amazon Inspector, 3: Amazon Macie

**Pregunta 16** *(Dominio 1 — Tarea 1.2)*
Una aplicación que se ejecuta en instancias EC2 en subredes privadas debe cargar objetos en Amazon S3 y llamar a Amazon DynamoDB. La política corporativa prohíbe que el tráfico atraviese la internet pública, y el equipo quiere la opción de menor costo para ambos servicios. ¿Qué solución cumple estos requisitos?

A) Un NAT gateway en una subred pública
B) Gateway VPC endpoints para S3 y DynamoDB, referenciados en las tablas de enrutamiento de las subredes
C) Interface VPC endpoints (AWS PrivateLink) para S3 y DynamoDB
D) Un internet gateway con reglas de grupo de seguridad restrictivas

**Pregunta 17** *(Dominio 1 — Tarea 1.3)*
Después de un incidente de server-side request forgery (SSRF) en el que un atacante recuperó credenciales de rol de IAM del servicio de metadatos de una instancia EC2 a través de una aplicación web vulnerable, un equipo de seguridad quiere fortalecer todas las instancias contra esta clase de ataque. ¿Qué debería hacer el equipo?

A) Aplicar IMDSv2 exigiendo tokens de sesión (HttpTokens=required), de modo que las solicitudes de metadatos necesiten un token obtenido mediante PUT que las solicitudes SSRF simples no pueden adquirir
B) Deshabilitar el servicio de metadatos de instancia en todas las instancias, ya que las aplicaciones nunca lo necesitan
C) Bloquear 169.254.169.254 en la network ACL de la subred
D) Mover las credenciales del rol de la instancia a un archivo de configuración en la instancia

**Pregunta 18** *(Dominio 1 — Tarea 1.3)*
Un arquitecto de soluciones debe almacenar alrededor de 200 valores de configuración de aplicación en texto plano (feature flags, nombres de entorno, URLs de endpoints) y 5 contraseñas de bases de datos. Las contraseñas requieren rotación automática; los valores de configuración no, y el equipo quiere minimizar el costo. ¿Qué combinación es la MÁS rentable?

A) Almacenar todo en AWS Secrets Manager
B) Almacenar todo en parámetros estándar de AWS Systems Manager Parameter Store
C) Almacenar los valores de configuración en parámetros estándar de Parameter Store (sin cargo) y las contraseñas en AWS Secrets Manager con rotación habilitada
D) Almacenar los valores de configuración en S3 y las contraseñas en parámetros SecureString de Parameter Store con rotación automática integrada

**Pregunta 19** *(Dominio 1 — Tarea 1.3)*
Una empresa cifra objetos de S3 con SSE-KMS usando una customer managed key. Una aplicación en la misma cuenta lee estos objetos miles de veces por segundo, y el equipo observa throttling y preocupaciones de costo por las llamadas a la API de KMS. ¿Qué cambio reduce el tráfico de solicitudes a KMS mientras mantiene el cifrado SSE-KMS?

A) Cambiar el bucket a SSE-S3, que no usa claves
B) Habilitar S3 Bucket Keys, para que S3 use una clave de nivel de bucket de corta duración para reducir las llamadas a KMS
C) Deshabilitar la rotación automática de claves en la customer managed key
D) Reemplazar la customer managed key con material de clave importado

**Pregunta 20** *(Dominio 1 — Tarea 1.1)*
¿Cuáles DOS afirmaciones sobre la evaluación de políticas de IAM y AWS Organizations son precisas? (Elija DOS.)

A) Las SCP otorgan permisos a los usuarios y roles de IAM en las cuentas miembro
B) Un Deny explícito en cualquier política aplicable siempre anula cualquier Allow
C) Las políticas basadas en recursos no pueden otorgar acceso entre cuentas sin una SCP
D) Una permissions boundary establece los permisos máximos que una política basada en identidad puede otorgar a un usuario o rol, pero no otorga nada por sí misma
E) Si ninguna política menciona una acción, la acción se permite por defecto para los usuarios de IAM

---

## Parte 2 — Diseñar Arquitecturas Resilientes (Preguntas 21–37)

**Pregunta 21** *(Dominio 2 — Tarea 2.2)*
Un minorista en línea ejecuta Amazon RDS for MySQL. La base de datos experimenta un tráfico de lectura intenso desde dashboards de informes, y la empresa también necesita que la base de datos sobreviva a un fallo de Zona de Disponibilidad con failover automático y sin intervención manual. ¿Qué combinación aborda AMBOS requisitos?

A) Habilitar solo el despliegue Multi-AZ; la instancia en espera puede servir las lecturas de informes
B) Crear solo réplicas de lectura; una réplica se promueve automáticamente cuando falla la AZ del primario
C) Habilitar el despliegue Multi-AZ para el failover automático, y agregar réplicas de lectura para descargar las lecturas de informes
D) Migrar a una clase de instancia de una sola AZ más grande para manejar ambas cargas de trabajo

**Pregunta 22** *(Dominio 2 — Tarea 2.2)*
Una empresa quiere alta disponibilidad de RDS entre Zonas de Disponibilidad, pero objeta pagar por una instancia en espera Multi-AZ tradicional que no sirve tráfico. ¿Qué opción de despliegue de RDS proporciona failover automático Y permite que la capacidad en espera sirva tráfico de lectura?

A) Despliegue de instancia de BD Multi-AZ de RDS (una en espera)
B) Despliegue de clúster de BD Multi-AZ de RDS, que tiene dos instancias en espera de lectura con un reader endpoint
C) Réplicas de lectura de RDS en tres AZs con un Application Load Balancer
D) RDS de una sola AZ con copias de seguridad automatizadas

**Pregunta 23** *(Dominio 2 — Tarea 2.2)*
Una plataforma global de pagos en Amazon Aurora debe hacer failover a una segunda Región de AWS si la Región primaria deja de estar disponible. El equipo de cumplimiento pregunta si Aurora Global Database puede garantizar cero pérdida de datos (RPO = 0) entre Regiones. ¿Qué debería decirles el arquitecto de soluciones?

A) Sí — Aurora Global Database replica de forma sincrónica entre Regiones, por lo que el RPO es exactamente 0
B) No — Aurora Global Database usa replicación asincrónica basada en almacenamiento con un retraso típico inferior a 1 segundo, por lo que el RPO entre Regiones es casi cero pero nunca se garantiza que sea exactamente 0
C) Sí — pero solo si el reenvío de escrituras está habilitado en la Región secundaria
D) No — Aurora Global Database replica en una programación de 5 minutos, dando un RPO de 5 minutos

**Pregunta 24** *(Dominio 2 — Tarea 2.2)*
El plan de recuperación ante desastres de una empresa establece: "Después de una interrupción Regional, el sistema de pedidos debe estar funcionando de nuevo dentro de 4 horas, y no se pueden perder más de 15 minutos de transacciones." ¿Qué afirmación mapea correctamente estos números a las métricas de DR?

A) RTO = 15 minutos; RPO = 4 horas
B) RTO = 4 horas; RPO = 15 minutos
C) MTBF = 4 horas; MTTR = 15 minutos
D) RPO = 4 horas; SLA = 15 minutos

**Pregunta 25** *(Dominio 2 — Tarea 2.2)*
Una compañía de seguros necesita una estrategia de DR para una aplicación crítica. Requisitos: los datos deben replicarse continuamente a la Región de DR; la infraestructura central (base de datos, AMIs, stack mínimo) ya debe existir en la Región de DR pero el cómputo debe permanecer apagado hasta un desastre, para controlar el costo; un RTO de decenas de minutos es aceptable. ¿Qué estrategia de DR coincide?

A) Backup y restore
B) Pilot light — elementos centrales aprovisionados en la Región de DR con datos replicados en vivo, pero el cómputo apagado hasta el failover
C) Warm standby — una copia completa de la carga de trabajo, reducida pero siempre en ejecución
D) Multi-sitio activo/activo

**Pregunta 26** *(Dominio 2 — Tarea 2.2)*
¿Cuáles DOS afirmaciones sobre las estrategias de recuperación ante desastres de AWS son precisas? (Elija DOS.)

A) Backup y restore requiere que los recursos estén preaprovisionados y en ejecución en la Región de recuperación
B) Backup y restore ofrece el RTO más bajo de las cuatro estrategias
C) Multi-sitio activo/activo sirve tráfico desde múltiples Regiones simultáneamente y ofrece un RTO cercano a cero al mayor costo
D) Pilot light mantiene una copia de capacidad completa de la aplicación sirviendo tráfico de producción en la Región de recuperación
E) Warm standby mantiene una copia reducida pero completamente funcional de la carga de trabajo siempre en ejecución en la Región de recuperación

**Pregunta 27** *(Dominio 2 — Tarea 2.1)*
Una aplicación de procesamiento de imágenes lee mensajes de una cola estándar de Amazon SQS. Procesar una imagen toma hasta 3 minutos, pero el tiempo de espera de visibilidad de la cola está configurado en 30 segundos. Los usuarios informan que algunas imágenes se procesan dos o tres veces. ¿Cuál es la causa MÁS probable y la solución?

A) La cola es FIFO; cambia a una cola estándar
B) El tiempo de espera de visibilidad expira antes de que termine el procesamiento, haciendo que el mensaje vuelva a ser visible para otros consumidores; aumenta el tiempo de espera de visibilidad más allá del tiempo de procesamiento
C) El sondeo largo está deshabilitado; habilita un ReceiveMessageWaitTime de 20 segundos
D) El período de retención de mensajes es demasiado corto; auméntalo a 14 días

**Pregunta 28** *(Dominio 2 — Tarea 2.1)*
Una aplicación de facturación consume mensajes de una cola SQS. Ocasionalmente un mensaje malformado hace que el consumidor falle repetidamente, y el mensaje circula por la cola para siempre, desperdiciando cómputo. ¿Qué debería configurar el arquitecto?

A) Una dead-letter queue con una política de redrive con maxReceiveCount, de modo que los mensajes que fallan repetidamente se aparten para su análisis
B) Un tiempo de espera de visibilidad más corto para que el mensaje defectuoso se reintente más rápidamente
C) Ordenamiento FIFO, que descarta automáticamente los mensajes malformados
D) Un período de retención de mensajes de 1 minuto para que los mensajes defectuosos expiren rápido

**Pregunta 29** *(Dominio 2 — Tarea 2.1)*
Una correduría procesa eventos de operaciones por cuenta de cliente. Los eventos de la misma cuenta deben procesarse estrictamente en orden y exactamente una vez, pero los eventos de diferentes cuentas pueden procesarse en paralelo para mayor rendimiento. ¿Qué solución cumple estos requisitos?

A) Una cola estándar de SQS con un solo hilo de consumidor
B) Una cola FIFO de SQS usando el ID de cuenta de cliente como MessageGroupId, que preserva el orden dentro de cada grupo mientras permite el paralelismo entre grupos
C) Un tema estándar de SNS con filtrado de mensajes por ID de cuenta
D) Una cola FIFO de SQS con un único MessageGroupId para todos los clientes

**Pregunta 30** *(Dominio 2 — Tarea 2.1)*
Cuando se realiza un pedido, una plataforma de comercio electrónico debe activar simultáneamente tres procesos independientes: generación de facturas, cumplimiento en almacén e ingesta de analítica. Cada proceso debe recibir cada evento de pedido, almacenarlo en búfer de forma durable y procesarlo a su propio ritmo. ¿Qué arquitectura cumple estos requisitos?

A) Una cola SQS con tres consumidores sondeando la misma cola
B) Un tema SNS que hace fan-out a tres colas SQS, una suscrita por proceso
C) Tres funciones Lambda invocadas secuencialmente por Step Functions
D) Un tema SNS con tres suscripciones de correo electrónico

**Pregunta 31** *(Dominio 2 — Tarea 2.1)*
Durante una venta flash, una función Lambda activada por API Gateway comienza a devolver errores de throttling 429 mientras otras funciones Lambda críticas en la misma cuenta también empiezan a ser limitadas. La cuenta está en su cuota de concurrencia predeterminada. ¿Qué acción protege a las funciones críticas de quedarse sin recursos por la función de la venta?

A) Aumentar el tiempo de espera de la función de la venta de 3 segundos al máximo de 15 minutos
B) Configurar concurrencia reservada en las funciones críticas (y opcionalmente limitar la función de la venta), garantizándoles concurrencia dedicada del pool de la cuenta
C) Habilitar concurrencia aprovisionada en la función de la venta, lo que eleva la cuota de toda la cuenta
D) Mover las funciones críticas a una configuración de memoria de 10 GB

**Pregunta 32** *(Dominio 2 — Tarea 2.1)*
Una empresa de medios tiene un flujo de trabajo de publicación de video con un paso que espera hasta 2 días a que un moderador humano apruebe el contenido a través de una herramienta externa antes de continuar. El flujo de trabajo debe ser auditable, ejecutarse durante días y reanudarse exactamente donde se pausó una vez que el moderador responde. ¿Qué solución encaja MEJOR?

A) Un flujo de trabajo Express de Step Functions con un estado Wait
B) Un flujo de trabajo Standard de Step Functions usando el patrón de callback: se envía un token de tarea (waitForTaskToken) al sistema de moderación, y el flujo de trabajo se reanuda cuando se llama a SendTaskSuccess
C) Una función Lambda que duerme hasta que el moderador apruebe
D) Una regla de EventBridge con un retraso programado de 2 días

**Pregunta 33** *(Dominio 2 — Tarea 2.1)*
Una empresa ejecuta un pipeline de ingesta de IoT de alto volumen que ejecuta alrededor de 90.000 ejecuciones de flujo de trabajo cortas por segundo, cada una completándose en menos de 5 segundos. No se requiere semántica de ejecución exactamente una vez, pero el costo debe minimizarse. Por separado, un flujo de trabajo mensual de conciliación financiera se ejecuta durante 12 horas y requiere ejecución exactamente una vez con historial de ejecución completo. ¿Qué tipos de flujo de trabajo de Step Functions deberían usarse?

A) Flujos de trabajo Express para el pipeline de IoT; flujos de trabajo Standard para la conciliación
B) Flujos de trabajo Standard para ambos
C) Flujos de trabajo Express para ambos, ya que Express admite hasta un año de ejecución
D) Flujos de trabajo Standard para el pipeline de IoT; flujos de trabajo Express para la conciliación

**Pregunta 34** *(Dominio 2 — Tarea 2.2)*
Una empresa aloja su aplicación web principal en un ALB en us-east-1 y una copia de recuperación pasiva en us-west-2. La empresa quiere que Route 53 envíe todo el tráfico a us-east-1 y redirija automáticamente a los usuarios a us-west-2 solo cuando el endpoint primario deje de estar en buen estado. ¿Qué configuración de Route 53 cumple este requisito?

A) Enrutamiento ponderado con pesos 50/50
B) Enrutamiento de failover con una verificación de estado en el registro primario y el registro de us-west-2 configurado como secundario
C) Enrutamiento basado en latencia entre las dos Regiones
D) Enrutamiento de geolocalización con un registro predeterminado apuntando a us-west-2

**Pregunta 35** *(Dominio 2 — Tarea 2.2)*
Un Auto Scaling group ejecuta servidores web EC2 detrás de un Application Load Balancer en tres Zonas de Disponibilidad. El ALB marca algunas instancias como en mal estado porque el proceso del servidor web se bloquea, pero el Auto Scaling group nunca las reemplaza porque las instancias EC2 en sí mismas siguen pasando las verificaciones de estado. ¿Qué debería cambiar el arquitecto de soluciones?

A) Habilitar el monitoreo detallado de CloudWatch en las instancias
B) Configurar el Auto Scaling group para usar verificaciones de estado de ELB además de las verificaciones de estado de EC2, de modo que las instancias que fallen el estado de destino del ALB se terminen y reemplacen
C) Aumentar el período de gracia de la verificación de estado del ASG
D) Cambiar el ALB por un Network Load Balancer

**Pregunta 36** *(Dominio 2 — Tarea 2.1)*
Una firma de trading necesita un balanceador de carga para un protocolo TCP personalizado que debe manejar millones de solicitudes por segundo con latencia ultrabaja y exponer una dirección IP estática por Zona de Disponibilidad. ¿Qué balanceador de carga debería elegir la firma?

A) Application Load Balancer
B) Network Load Balancer
C) Gateway Load Balancer
D) Classic Load Balancer

**Pregunta 37** *(Dominio 2 — Tarea 2.2)*
¿Cuáles DOS afirmaciones sobre la construcción de almacenamiento resiliente en AWS son precisas? (Elija DOS.)

A) S3 Cross-Region Replication copia retroactivamente todos los objetos que existían antes de configurar la replicación, sin ninguna acción adicional
B) Las clases de almacenamiento Amazon EFS Standard almacenan los datos de forma redundante en múltiples Zonas de Disponibilidad y pueden montarse de forma concurrente por instancias en diferentes AZs
C) S3 Cross-Region Replication requiere que el versionado esté habilitado tanto en el bucket de origen como en el de destino
D) Los volúmenes de Amazon EFS solo pueden adjuntarse a una instancia EC2 a la vez, como EBS
E) Habilitar el versionado de S3 replica automáticamente los objetos a otra Región

---

## Parte 3 — Diseñar Arquitecturas de Alto Rendimiento (Preguntas 38–53)

**Pregunta 38** *(Dominio 3 — Tarea 3.1)*
Una empresa de analítica de medios ejecuta una base de datos PostgreSQL en Amazon RDS usando un volumen EBS gp3. Una nueva carga de trabajo de informes requiere 50.000 IOPS sostenidos con latencia de submilisegundos y una garantía de durabilidad del 99,999%. El volumen debe soportar esto de forma consistente sin ráfagas. ¿Qué tipo de volumen EBS debería recomendar un arquitecto de soluciones?

A) gp3 aprovisionado con el máximo de IOPS
B) io2 Block Express
C) st1 Throughput Optimized HDD
D) gp2 con un tamaño de volumen de 16 TiB

**Pregunta 39** *(Dominio 3 — Tarea 3.1)*
Una firma de investigación genómica necesita almacenamiento de archivos compartido para un clúster de computación de alto rendimiento (HPC) basado en Linux de 500 instancias EC2. La carga de trabajo requiere latencias de submilisegundos y cientos de GB/s de rendimiento agregado, y los conjuntos de datos de entrada se preparan en Amazon S3. ¿Qué servicio de almacenamiento cumple mejor estos requisitos?

A) Amazon EFS con el modo de rendimiento Max I/O
B) Amazon FSx for Windows File Server con almacenamiento SSD
C) Amazon FSx for Lustre vinculado al bucket de S3
D) Amazon S3 accedido a través de Mountpoint en cada instancia

**Pregunta 40** *(Dominio 3 — Tarea 3.1)*
Una empresa está migrando una aplicación local de Windows que depende de recursos compartidos de archivos SMB y listas de control de acceso integradas con Active Directory. La aplicación se ejecutará en instancias EC2 Windows en dos Zonas de Disponibilidad y debe conservar sus permisos NTFS existentes. ¿Qué servicio de almacenamiento de AWS debería elegir el arquitecto de soluciones?

A) Amazon EFS con permisos POSIX
B) Amazon FSx for Windows File Server en modo de despliegue Multi-AZ
C) Amazon S3 con políticas de bucket mapeadas a grupos de AD
D) Amazon FSx for Lustre con almacenamiento persistente

**Pregunta 41** *(Dominio 3 — Tarea 3.1)*
Una empresa de producción de video en Singapur carga archivos de metraje sin procesar de 40 GB a un bucket de S3 en us-east-1 desde oficinas de todo el mundo. Las cargas frecuentemente fallan a mitad de camino a través de la internet pública, forzando reinicios completos, y los tiempos de transferencia generales son lentos. ¿Qué combinación de acciones debería recomendar un arquitecto de soluciones? (Elija DOS.)

A) Convertir el bucket a S3 One Zone-IA para mejorar el rendimiento de escritura
B) Poner un Application Load Balancer frente al bucket en cada región
C) Habilitar S3 Cross-Region Replication a un bucket en ap-southeast-1
D) Habilitar S3 Transfer Acceleration en el bucket y cargar a través del endpoint acelerado
E) Usar carga multiparte para los archivos grandes

**Pregunta 42** *(Dominio 3 — Tarea 3.1)*
Una plataforma de pujas en tiempo real ejecuta una carga de trabajo NoSQL en EC2 que necesita la latencia de almacenamiento absolutamente más baja para datos temporales de trabajo (scratch). Los datos se regeneran al inicio y no necesitan sobrevivir a la detención o terminación de la instancia. ¿Qué opción de almacenamiento proporciona el mayor rendimiento para este caso de uso?

A) Volumen EBS io2 con 64.000 IOPS aprovisionados
B) Volúmenes de almacenamiento de instancia (instance store) (NVMe SSD) en una instancia optimizada para almacenamiento
C) Amazon EFS en modo General Purpose
D) Volumen EBS gp3 con el máximo rendimiento aprovisionado

**Pregunta 43** *(Dominio 3 — Tarea 3.3)*
Una empresa de juegos almacena datos de sesión de jugadores en una tabla de DynamoDB con la clave de partición `game_id`. Solo hay 12 juegos populares, y la tabla experimenta throttling en algunas particiones mientras que la capacidad consumida general está muy por debajo de la capacidad aprovisionada. ¿Qué debería recomendar un arquitecto de soluciones?

A) Cambiar la tabla a capacidad aprovisionada con auto scaling
B) Usar una clave de partición de alta cardinalidad, como una compuesta de game_id y player_id
C) Crear un local secondary index en player_id
D) Habilitar DynamoDB Streams para distribuir las escrituras entre particiones

**Pregunta 44** *(Dominio 3 — Tarea 3.3)*
Un sitio de comercio electrónico almacena datos del catálogo de productos en DynamoDB. El tráfico de lectura es extremadamente intensivo en lecturas, con los mismos elementos solicitados millones de veces al día, y el equipo necesita latencia de lectura de microsegundos sin reescribir las llamadas a la API de DynamoDB de la aplicación. ¿Qué debería recomendar el arquitecto de soluciones?

A) Desplegar Amazon ElastiCache for Redis y modificar la aplicación para que verifique primero el caché
B) Agregar DynamoDB Accelerator (DAX) frente a la tabla
C) Crear un global secondary index para distribuir las lecturas
D) Habilitar DynamoDB Global Tables en una segunda región

**Pregunta 45** *(Dominio 3 — Tarea 3.3)*
Una empresa de logística tiene una tabla de DynamoDB en producción que necesita un nuevo patrón de consulta: consultar envíos por `carrier_id` y ordenar por `delivery_date`, con su propio rendimiento aprovisionado para que las nuevas consultas de analítica no afecten a la aplicación principal. La tabla ya existe y tiene tráfico en vivo. ¿Qué solución cumple estos requisitos?

A) Crear un local secondary index con carrier_id como clave de ordenamiento
B) Crear un global secondary index con carrier_id como clave de partición y delivery_date como clave de ordenamiento
C) Recrear la tabla con una clave primaria compuesta de carrier_id y delivery_date
D) Habilitar un DynamoDB Stream y consultar el stream por carrier_id

**Pregunta 46** *(Dominio 3 — Tarea 3.3)*
Un servicio de gestión de sesiones almacena las sesiones de usuario en DynamoDB. Las sesiones se vuelven inútiles después de 24 horas, y el equipo quiere que los elementos expirados se eliminen automáticamente sin costo adicional. ¿Qué debería implementar el arquitecto de soluciones?

A) Una función Lambda programada que escanee la tabla cada hora y elimine los elementos antiguos
B) DynamoDB Time to Live (TTL) con un atributo de marca de tiempo de expiración en cada elemento
C) Una política de ciclo de vida en la tabla de DynamoDB
D) DynamoDB Streams con un filtro para descartar los elementos de más de 24 horas

**Pregunta 47** *(Dominio 3 — Tarea 3.3)*
Una aplicación sin servidor usa funciones Lambda que se conectan a una base de datos Amazon RDS for MySQL. Durante los picos de tráfico, cientos de invocaciones concurrentes de Lambda agotan el límite de conexiones de la base de datos, causando errores. ¿Qué solución aborda esto con el menor cambio en la aplicación?

A) Aumentar el tamaño de la instancia de RDS para elevar max_connections
B) Colocar Amazon RDS Proxy entre las funciones Lambda y la base de datos
C) Migrar la base de datos a DynamoDB
D) Configurar una concurrencia reservada de Lambda de 10

**Pregunta 48** *(Dominio 3 — Tarea 3.3)*
Un sitio de noticias financieras usa Amazon Aurora MySQL. El tráfico de lectura se dispara 20x durante el horario de mercado y la instancia primaria está limitada por CPU sirviendo consultas SELECT. Las escrituras son modestas. ¿Cuál es la forma MÁS eficiente operativamente de escalar las lecturas?

A) Agregar Aurora Replicas y dirigir el tráfico de lectura al reader endpoint del clúster con auto scaling
B) Crear una instancia en espera Multi-AZ y enviar las lecturas a la instancia en espera
C) Fragmentar (shard) la base de datos en múltiples clústeres de Aurora
D) Habilitar Aurora Backtrack para descargar las lecturas

**Pregunta 49** *(Dominio 3 — Tarea 3.4)*
Una empresa de juegos multijugador ejecuta una aplicación sensible a la latencia usando el protocolo UDP en Network Load Balancers en dos Regiones de AWS. Los jugadores de todo el mundo necesitan direcciones IP estáticas para la inclusión en listas de permitidos (allow-listing) y un failover regional rápido. ¿Qué servicio debería elegir el arquitecto de soluciones?

A) Amazon CloudFront con dos orígenes personalizados
B) AWS Global Accelerator con grupos de endpoints en ambas regiones
C) Amazon Route 53 con enrutamiento basado en latencia
D) Un Application Load Balancer con balanceo de carga entre zonas

**Pregunta 50** *(Dominio 3 — Tarea 3.4)*
Una empresa de streaming debe cumplir con las reglas de licencia de contenido: los usuarios en Alemania siempre deben ser servidos desde el despliegue de eu-central-1, y los usuarios en Francia desde el despliegue de eu-west-3, independientemente de qué endpoint ofrezca menor latencia. ¿Qué política de enrutamiento de Route 53 debería usarse?

A) Enrutamiento basado en latencia
B) Enrutamiento de geolocalización
C) Enrutamiento de geoproximidad con un sesgo positivo en eu-central-1
D) Enrutamiento ponderado con pesos 50/50

**Pregunta 51** *(Dominio 3 — Tarea 3.2)*
Un arquitecto de soluciones está desplegando una carga de trabajo HPC fuertemente acoplada que usa MPI y requiere la menor latencia de red posible y el mayor rendimiento de paquetes por segundo entre 32 instancias EC2. ¿Qué estrategia de colocación debería usarse?

A) Spread placement group entre tres Zonas de Disponibilidad
B) Partition placement group con 7 particiones
C) Cluster placement group en una sola Zona de Disponibilidad
D) Lanzar instancias en subredes separadas con redes mejoradas

**Pregunta 52** *(Dominio 3 — Tarea 3.5)*
Una empresa de IoT ingiere datos de clickstream que deben entregarse a Amazon S3 casi en tiempo real para analítica. El equipo quiere una solución completamente gestionada sin aplicaciones de consumidor que escribir, sin gestión de shards, y con búfer de registros y conversión de formato a Parquet integrados. ¿Qué servicio debería usar?

A) Amazon Kinesis Data Streams con un consumidor Lambda
B) Amazon Data Firehose (anteriormente Kinesis Data Firehose) con un destino S3
C) Amazon SQS con una flota de sondeadores EC2
D) Amazon MSK con un sink personalizado de Kafka Connect

**Pregunta 53** *(Dominio 3 — Tarea 3.5)*
Una empresa almacena registros de aplicación como archivos JSON comprimidos en Amazon S3 y quiere que los analistas ejecuten consultas SQL ad hoc contra ellos sin aprovisionar servidores ni cargar datos en una base de datos. El esquema debe descubrirse y catalogarse automáticamente. ¿Qué combinación debería recomendar el arquitecto de soluciones?

A) Amazon Redshift con comandos COPY y actualizaciones programadas
B) Crawlers de AWS Glue para poblar el Data Catalog y Amazon Athena para las consultas SQL
C) Amazon EMR con un clúster Presto de larga duración
D) Amazon RDS for PostgreSQL con la extensión aws_s3

---

## Parte 4 — Diseñar Arquitecturas Optimizadas en Costos (Preguntas 54–65)

**Pregunta 54** *(Dominio 4 — Tarea 4.2)*
Un instituto de investigación ejecuta simulaciones por lotes nocturnas en EC2 que tardan aproximadamente 90 minutos, registran el progreso en checkpoints en Amazon S3 cada 5 minutos, y pueden reiniciarse desde el último checkpoint en cualquier momento. El instituto quiere el menor costo de cómputo posible. ¿Qué opción de compra debería recomendar el arquitecto de soluciones?

A) Instancias bajo demanda en una sola AZ
B) Instancias Reservadas Standard con un plazo de 3 años
C) Instancias Spot usando un Spot Fleet diversificado entre múltiples tipos de instancia y AZs
D) Un Compute Savings Plan dimensionado para el pico de la carga de trabajo por lotes

**Pregunta 55** *(Dominio 4 — Tarea 4.2)*
Una empresa de SaaS tiene un gasto de cómputo de línea base estable pero espera migrar cargas de trabajo entre EC2, AWS Fargate y AWS Lambda durante los próximos tres años a medida que se moderniza. Quiere un descuento basado en compromiso que se aplique automáticamente a los tres servicios de cómputo y a todas las regiones. ¿Qué opción debería recomendar el arquitecto de soluciones?

A) EC2 Instance Savings Plan
B) Instancias Reservadas Standard
C) Compute Savings Plan
D) Instancias Reservadas Convertibles

**Pregunta 56** *(Dominio 4 — Tarea 4.2)*
Una empresa compró Instancias Reservadas Standard de 3 años para Amazon RDS y para Amazon EC2. Después de una rearquitectura, ya no necesita ninguna de las dos reservas. El equipo de finanzas pregunta qué reservas pueden venderse para recuperar costos. ¿Qué debería decirles el arquitecto de soluciones?

A) Tanto las Instancias Reservadas de EC2 como las de RDS pueden venderse en el Reserved Instance Marketplace
B) Solo las Instancias Reservadas de EC2 pueden venderse en el Reserved Instance Marketplace; las RI de RDS no pueden revenderse
C) Solo las Instancias Reservadas de RDS pueden venderse, porque las reservas de bases de datos son transferibles
D) Ninguna puede venderse; las Instancias Reservadas no son reembolsables ni transferibles en ningún caso

**Pregunta 57** *(Dominio 4 — Tarea 4.2)*
Un equipo de desarrollo ejecuta procesamiento de datos tolerante a fallos en contenedores en Amazon ECS con capacidad EC2 Spot. Necesitan que los workers se drenen y hagan checkpoint de forma controlada antes de la recuperación. ¿Cuánta advertencia anticipada proporciona AWS antes de que una Instancia Spot sea interrumpida?

A) No se proporciona ninguna advertencia
B) Un aviso de interrupción de 2 minutos
C) Un aviso de interrupción de 15 minutos
D) Una ventana de reequilibrio de 24 horas

**Pregunta 58** *(Dominio 4 — Tarea 4.1)*
Un archivo de atención médica almacena registros de cumplimiento en Amazon S3 a los que rara vez se accede pero que, cuando son requeridos por citación judicial, deben poder recuperarse en un plazo de 5 minutos. Los registros se conservan durante 7 años y el costo de almacenamiento debe minimizarse. ¿Qué clase de almacenamiento cumple estos requisitos?

A) S3 Glacier Deep Archive con recuperación Standard
B) S3 Glacier Flexible Retrieval con recuperaciones Expedited cuando se necesite
C) S3 Glacier Flexible Retrieval con recuperaciones Bulk
D) S3 Standard-IA

**Pregunta 59** *(Dominio 4 — Tarea 4.1)*
Una startup de compartición de fotos almacena imágenes en miniatura fácilmente reproducibles a las que se accede con poca frecuencia. El equipo quiere la opción de acceso infrecuente de menor costo y acepta que la pérdida de una sola Zona de Disponibilidad podría requerir regenerar las miniaturas a partir de los originales. ¿Qué clase de almacenamiento debería usarse?

A) S3 Standard-IA
B) S3 One Zone-IA
C) S3 Intelligent-Tiering
D) S3 Glacier Instant Retrieval

**Pregunta 60** *(Dominio 4 — Tarea 4.1)*
Una empresa tiene un bucket de S3 con millones de objetos cuyos patrones de acceso son desconocidos y cambian de forma impredecible. Un arquitecto de soluciones está evaluando S3 Intelligent-Tiering. ¿Cuáles DOS afirmaciones sobre Intelligent-Tiering son precisas? (Elija DOS.)

A) Cobra una pequeña tarifa de monitoreo y automatización por objeto para los objetos que monitorea
B) Cobra tarifas de recuperación cada vez que un objeto vuelve al nivel Frequent Access
C) Los objetos de menos de 128 KB no se monitorean ni se mueven automáticamente entre niveles y se facturan a la tarifa del nivel Frequent Access
D) Replica los objetos a una segunda región automáticamente
E) Requiere una duración mínima de almacenamiento de 90 días para cada objeto

**Pregunta 61** *(Dominio 4 — Tarea 4.1)*
Un equipo de analítica frecuentemente aborta cargas multiparte grandes a un bucket de lago de datos de S3, y AWS Cost Explorer muestra que los cargos de almacenamiento crecen aunque el recuento de objetos visibles del bucket es plano. ¿Cuál es la solución MÁS rentable?

A) Habilitar S3 Versioning para rastrear las partes huérfanas
B) Agregar una regla de ciclo de vida que aborte las cargas multiparte incompletas después de un número determinado de días
C) Migrar el bucket a S3 One Zone-IA
D) Activar S3 Transfer Acceleration para terminar las cargas más rápido

**Pregunta 62** *(Dominio 4 — Tarea 4.1)*
La flota de EC2 de una empresa usa cientos de volúmenes EBS gp2 dimensionados grandes puramente para obtener IOPS de línea base. Las revisiones de utilización muestran que se necesitan los IOPS pero gran parte de la capacidad no. ¿Qué debería hacer el arquitecto de soluciones para reducir el costo de almacenamiento sin perder rendimiento?

A) Migrar los volúmenes a io2 y aprovisionar los mismos IOPS
B) Migrar los volúmenes a gp3, dimensionar correctamente la capacidad y aprovisionar los IOPS de forma independiente
C) Convertir los volúmenes a st1 HDD optimizado para rendimiento
D) Tomar instantáneas de los volúmenes diariamente y eliminar los originales

**Pregunta 63** *(Dominio 4 — Tarea 4.4)*
Un pipeline de datos en subredes privadas transfiere 60 TB por mes desde instancias EC2 a Amazon S3 en la misma región a través de un NAT gateway, generando grandes cargos de procesamiento de datos. ¿Cuál es el cambio MÁS rentable?

A) Reemplazar el NAT gateway con una instancia NAT en una instancia EC2 grande
B) Crear un gateway VPC endpoint para S3 y enrutar el tráfico a través de él
C) Crear un interface VPC endpoint (PrivateLink) para S3
D) Mover las instancias EC2 a subredes públicas con direcciones IPv4 públicas

**Pregunta 64** *(Dominio 4 — Tarea 4.4)*
La factura mensual de una startup muestra cargos inesperados por direcciones IPv4 públicas en uso en docenas de instancias EC2 que solo llaman a otros servicios de AWS dentro de la VPC. El equipo de finanzas también quiere alertas antes de que el gasto general del próximo mes supere un umbral. ¿Qué combinación de acciones debería tomar el arquitecto de soluciones? (Elija DOS.)

A) Reemplazar las IPv4 públicas con Elastic IPs en cada instancia, que son siempre gratuitas mientras estén adjuntas
B) Eliminar las direcciones IPv4 públicas y usar conectividad privada (VPC endpoints/NAT según sea necesario), ya que AWS cobra por las direcciones IPv4 públicas en uso
C) Usar AWS Compute Optimizer para bloquear el gasto por encima del umbral
D) Habilitar AWS Shield Advanced para limitar el gasto mensual
E) Crear un presupuesto de costos de AWS Budgets con un umbral de alerta y notificación por correo electrónico

**Pregunta 65** *(Dominio 4 — Tarea 4.3)*
Un entorno de desarrollo usa un clúster de Amazon Aurora PostgreSQL que está inactivo por las noches y los fines de semana pero debe despertarse automáticamente cuando los desarrolladores se conectan, sin intervención manual ni redimensionamiento de instancias. El costo debe caer a casi cero para el cómputo mientras está inactivo. ¿Qué solución cumple estos requisitos?

A) Aurora Serverless v2 configurado con una capacidad mínima de 0 ACUs para que se pause automáticamente cuando esté inactivo
B) Un clúster de Aurora aprovisionado detenido por una función Lambda programada cada noche
C) Una global database de Aurora con un clúster secundario sin instancias (headless)
D) Aurora aprovisionado con dos instancias de lectura reducidas (scaled in) por la noche

---

## Clave de Respuestas

### Parte 1 — Preguntas 1–20

**1. Respuesta: B** — Las SCP nunca se aplican a la cuenta de gestión de la organización, por lo que sus principales no se ven afectados por las restricciones de Región. *Por qué no las otras:* A — las SCP sí se heredan a través de las OU anidadas; C — los Allow de IAM no pueden anular un Deny de SCP en las cuentas miembro; D — las SCP se aplican de inmediato a todas las cuentas actuales y futuras bajo el punto de asociación.

**2. Respuesta: C** — Una permissions boundary aplicada como condición en las acciones de creación de roles limita los permisos máximos de cualquier rol que creen los desarrolladores, evitando la escalada de privilegios mientras se preserva el autoservicio. *Por qué no las otras:* A — la revisión manual añade sobrecarga operativa y elimina el autoservicio; B — denegar iam:CreateRole bloquea el flujo de trabajo legítimo; D — las alertas de CloudTrail son detectivas, no preventivas.

**3. Respuesta: B** — Un ExternalId definido por el cliente y validado en la condición de la política de confianza garantiza que el proveedor de SaaS solo asuma el rol en nombre del cliente correcto, mitigando el problema del diputado confundido. *Por qué no las otras:* A — el MFA es poco práctico para la asunción automatizada de servicio a servicio y no aborda la confusión del diputado; C — cifrar un ARN (que no es secreto) no resuelve nada; D — las claves de usuario de IAM de larga duración son menos seguras que los roles.

**4. Respuesta: B** — IAM Identity Center federa una vez con Entra ID y asigna de forma centralizada permission sets en todas las cuentas de la organización a través de un único portal de acceso. *Por qué no las otras:* A — los usuarios de IAM por cuenta son exactamente la sobrecarga que se debe evitar; C — Cognito es para identidades de aplicación (clientes), no para el acceso de la fuerza laboral a las cuentas de AWS; D — la configuración manual de SAML por cuenta funciona pero tiene una sobrecarga operativa mucho mayor.

**5. Respuesta: A** — Los user pools manejan la autenticación (inicio de sesión por correo electrónico/social); los identity pools intercambian los tokens resultantes por credenciales temporales de AWS, limitadas por roles de IAM para acceder a S3. *Por qué no las otras:* B — invierte los propósitos de los dos servicios; C — IAM Identity Center es para usuarios de la fuerza laboral, no para clientes de la app; D — los tokens del user pool (JWTs) no otorgan acceso a servicios de AWS por sí mismos.

**6. Respuesta: B** — Una customer managed key da control total de la política de clave, el registro de uso y la deshabilitación, y admite rotación automática (anual por defecto). *Por qué no las otras:* A — las AWS managed keys no permiten editar la política de clave ni deshabilitar la clave; C — las AWS owned keys son completamente invisibles para el cliente; D — el material de clave importado (BYOK) no admite rotación automática.

**7. Respuesta: B** — Cifrado de sobre: KMS genera una clave de datos; los datos se cifran localmente con la clave de datos en texto plano, que se descarta, mientras que la copia cifrada por KMS de la clave de datos se almacena con el texto cifrado. *Por qué no las otras:* A y C — KMS nunca cifra grandes cargas directamente ni mediante streaming; D — las claves codificadas en el código son un antipatrón y no son cifrado de sobre.

**8. Respuesta: C** — La estrategia de usuarios alternados de Secrets Manager mantiene dos credenciales y las rota por turnos, de modo que las conexiones existentes que usan la credencial anterior siguen funcionando durante la rotación. *Por qué no las otras:* A — Parameter Store no tiene rotación integrada; tendrías que construirla por completo; B — la rotación de usuario único invalida la contraseña antigua de inmediato, arriesgando fallos de conexión; D — la rotación de KMS rota el material de clave de cifrado, no las contraseñas de bases de datos.

**9. Respuesta: C** — SSE-C permite que el cliente proporcione la clave de cifrado con cada solicitud; AWS la usa en memoria para la operación y nunca la almacena. *Por qué no las otras:* A — las claves SSE-S3 son completamente gestionadas por AWS; B — las claves SSE-KMS se almacenan en AWS KMS; D — aws/s3 es una AWS managed key de KMS y no es del lado del cliente en absoluto.

**10. Respuesta: B** — El modo compliance de Object Lock impide la eliminación o sobrescritura por parte de cualquier usuario, incluido root, hasta que expire la retención, y Object Lock requiere versionado. *Por qué no las otras:* A — el modo governance puede ser eludido por usuarios con s3:BypassGovernanceRetention; C — una política de bucket puede ser modificada o eliminada por el usuario root; D — la expiración de ciclo de vida no impide la eliminación durante el período.

**11. Respuesta: B** — Las NACL no tienen estado, por lo que el tráfico de respuesta a los puertos de origen efímeros de los clientes debe permitirse explícitamente como saliente. *Por qué no las otras:* A — las NACL no tienen estado, no tienen estado; C — los grupos de seguridad tienen estado, por lo que el tráfico de retorno es automático; D — 0.0.0.0/0 es perfectamente válido en las reglas de NACL.

**12. Respuesta: A, B** — Los grupos de seguridad tienen estado (el tráfico de retorno se permite automáticamente), y las NACL procesan las reglas numeradas en orden y admiten Deny. *Por qué no las otras:* C — los grupos de seguridad solo admiten reglas de Allow; D — las NACL se adjuntan a subredes, no a ENIs (los grupos de seguridad se adjuntan a ENIs); E — las reglas de los grupos de seguridad se evalúan todas juntas sin ningún orden.

**13. Respuesta: B** — Shield Advanced proporciona el Shield Response Team, protección de costos contra DDoS y visibilidad/diagnósticos de ataques para recursos protegidos como CloudFront y ALB. *Por qué no las otras:* A — Shield Standard es automático pero no incluye acceso al SRT ni protección de costos; C — WAF aborda los patrones de solicitud de la capa 7, no el conjunto completo de requisitos; D — GuardDuty es detección de amenazas, no protección contra DDoS.

**14. Respuesta: B** — AWS WAF en el ALB con el grupo de reglas gestionado de SQLi más una regla basada en tasa bloquea ambos patrones de ataque sin cambios en el código de la aplicación. *Por qué no las otras:* A — alto esfuerzo de desarrollo; C — Shield Standard cubre inundaciones de L3/L4, no inyección SQL; D — los grupos de seguridad no pueden inspeccionar el contenido de las solicitudes.

**15. Respuesta: B** — GuardDuty = detección de amenazas a partir de registros e inteligencia de amenazas; Macie = descubrimiento de datos sensibles (PII) en S3; Inspector = escaneo de vulnerabilidades (CVE) de EC2, imágenes de ECR y Lambda. *Por qué no las otras:* A, C, D — cada una mezcla al menos dos de los mapeos de servicio a propósito.

**16. Respuesta: B** — Los gateway endpoints existen exactamente para S3 y DynamoDB, mantienen el tráfico en la red de AWS y no tienen cargo por hora ni por procesamiento de datos. *Por qué no las otras:* A — el NAT gateway enruta a través de espacio de IP público y cuesta por hora/por GB; C — los interface endpoints incurren en cargos por hora y por datos, así que no son el menor costo; D — un internet gateway envía el tráfico por la internet pública.

**17. Respuesta: A** — IMDSv2 requiere un token de sesión obtenido mediante una solicitud PUT, que los vectores SSRF típicos no pueden realizar; aplicar HttpTokens=required bloquea el robo de credenciales de IMDSv1. *Por qué no las otras:* B — muchos agentes y SDKs legítimamente necesitan IMDS; C — las NACL no afectan el tráfico link-local entre una instancia y su propio endpoint de metadatos; D — las credenciales estáticas en archivos son mucho peores que las credenciales de rol.

**18. Respuesta: C** — Los parámetros estándar de Parameter Store son gratuitos y adecuados para la configuración en texto plano; Secrets Manager añade rotación integrada solo para las 5 contraseñas, minimizando el costo. *Por qué no las otras:* A — pagar el precio por secreto de Secrets Manager por 200 valores de configuración en texto plano es un derroche; B — Parameter Store por sí solo no tiene rotación nativa para las contraseñas; D — Parameter Store no tiene rotación automática integrada, así que esta opción afirma una capacidad que no existe.

**19. Respuesta: B** — S3 Bucket Keys permite que S3 genere una clave de datos de nivel de bucket con tiempo limitado a partir de la clave de KMS, reduciendo drásticamente las solicitudes a KMS por objeto (y el costo) mientras se mantiene SSE-KMS. *Por qué no las otras:* A — SSE-S3 abandona el requisito de KMS; C — la frecuencia de rotación no afecta el volumen de la API por solicitud; D — el material de clave importado no cambia el recuento de solicitudes.

**20. Respuesta: B, D** — Un Deny explícito siempre prevalece sobre cualquier Allow en la evaluación de políticas, y las permissions boundaries solo limitan (nunca otorgan) permisos. *Por qué no las otras:* A — las SCP son barreras (guardrails) que limitan los permisos disponibles; no otorgan nada; C — las políticas basadas en recursos rutinariamente otorgan acceso entre cuentas por sí mismas; E — IAM tiene por defecto una denegación implícita cuando nada permite una acción.

### Parte 2 — Preguntas 21–37

**21. Respuesta: C** — Multi-AZ proporciona failover automático ante un fallo de AZ; las réplicas de lectura absorben el tráfico de lectura de informes — dos características para dos problemas distintos. *Por qué no las otras:* A — una instancia en espera Multi-AZ tradicional no puede servir lecturas; B — la promoción de réplica es manual (o por script) y las réplicas por sí solas no dan failover de HA automático; D — una instancia de una sola AZ más grande falla ambos requisitos en cuanto a la resiliencia de AZ.

**22. Respuesta: B** — Un despliegue de clúster de BD Multi-AZ ejecuta un escritor y dos instancias en espera de lectura entre tres AZs, con un reader endpoint, de modo que la capacidad en espera sirve lecturas mientras sigue admitiendo failover automático rápido. *Por qué no las otras:* A — la única instancia en espera en un despliegue de instancia no sirve tráfico; C — las réplicas de lectura no proporcionan failover automático gestionado y las bases de datos RDS no se balancean vía ALB; D — Single-AZ no tiene failover en absoluto.

**23. Respuesta: B** — La replicación de Aurora Global Database es asincrónica a nivel de almacenamiento con un retraso típico inferior al segundo, por lo que el RPO entre Regiones es casi cero pero nunca puede garantizarse exactamente 0. *Por qué no las otras:* A — la replicación no es sincrónica entre Regiones; C — el reenvío de escrituras enruta las escrituras al primario; no cambia la semántica de replicación; D — el retraso de replicación es típicamente inferior a un segundo, no una programación de 5 minutos.

**24. Respuesta: B** — El Recovery Time Objective es el tiempo de inactividad máximo tolerable (4 horas); el Recovery Point Objective es la ventana máxima tolerable de pérdida de datos (15 minutos). *Por qué no las otras:* A — invierte las definiciones; C — MTBF/MTTR son estadísticas de fiabilidad, no objetivos de DR; D — el SLA es un compromiso contractual, no una métrica de pérdida de datos.

**25. Respuesta: B** — Pilot light mantiene los datos replicados continuamente y los recursos centrales aprovisionados pero apagados, produciendo un RTO de decenas de minutos a bajo costo — una coincidencia exacta. *Por qué no las otras:* A — backup y restore no tiene replicación en vivo y un RTO mucho más largo; C — warm standby mantiene el stack en ejecución, costando más de lo requerido; D — activo/activo es lo más caro y excede ampliamente el requisito.

**26. Respuesta: C, E** — Warm standby es una copia completa, reducida y siempre en ejecución; multi-sitio activo/activo sirve desde múltiples Regiones con un RTO cercano a cero al mayor costo. *Por qué no las otras:* A — backup y restore se define por no tener recursos preejecutándose; B — backup y restore tiene el RTO más alto (peor); D — pilot light está aprovisionado-pero-apagado, no de capacidad completa sirviendo tráfico.

**27. Respuesta: B** — Cuando el tiempo de espera de visibilidad de 30 segundos transcurre a mitad del procesamiento, el mensaje reaparece y otro consumidor lo procesa de nuevo; establece el tiempo de espera de visibilidad más largo que el tiempo máximo de procesamiento (p. ej., 6× como mejor práctica). *Por qué no las otras:* A — FIFO vs. estándar no es la causa; C — el sondeo largo afecta la eficiencia de las recepciones vacías, no los duplicados; D — el período de retención rige cuánto tiempo persisten los mensajes, no la reentrega.

**28. Respuesta: A** — Una política de redrive con maxReceiveCount mueve los mensajes que fallan repetidamente ("poison pill") a una dead-letter queue para análisis offline, deteniendo el bucle de reintentos infinito. *Por qué no las otras:* B — un tiempo de espera de visibilidad más corto hace que el bucle gire más rápido; C — FIFO no descarta los mensajes malformados; D — una retención de 1 minuto también haría expirar los mensajes válidos.

**29. Respuesta: B** — Las colas FIFO garantizan el procesamiento exactamente una vez y el ordenamiento estricto dentro de un MessageGroupId; usar el ID de cuenta como ID de grupo da ordenamiento por cuenta con paralelismo entre cuentas (y el modo FIFO de alto rendimiento puede escalar aún más). *Por qué no las otras:* A — las colas estándar no pueden garantizar el orden ni el exactamente una vez; C — SNS no proporciona garantía de ordenamiento ni de procesamiento exactamente una vez para este patrón; D — un único ID de grupo serializa todo, destruyendo el rendimiento.

**30. Respuesta: B** — El fan-out de SNS a SQS entrega cada evento a cada cola, donde cada consumidor obtiene búfer durable y un ritmo de procesamiento independiente. *Por qué no las otras:* A — tres consumidores en una cola se reparten los mensajes; cada mensaje va a un solo consumidor; C — la invocación secuencial no es procesamiento paralelo independiente con búfer; D — las suscripciones de correo electrónico entregan a humanos, no a búferes de aplicación durables.

**31. Respuesta: B** — La concurrencia reservada reserva concurrencia dedicada para las funciones críticas (y limitar la función de la venta acota su radio de impacto), evitando que una función agote el pool compartido de la cuenta. *Por qué no las otras:* A — un tiempo de espera más largo retiene las ranuras de concurrencia por más tiempo, empeorando el throttling; C — la concurrencia aprovisionada precalienta los entornos pero no eleva la cuota de concurrencia de la cuenta; D — el tamaño de memoria no afecta los límites de concurrencia.

**32. Respuesta: B** — Los flujos de trabajo Standard se ejecutan hasta un año y el patrón de callback waitForTaskToken pausa la ejecución sin costo de cómputo hasta que SendTaskSuccess/SendTaskFailure devuelve el token. *Por qué no las otras:* A — los flujos de trabajo Express tienen un máximo de 5 minutos; C — Lambda puede ejecutarse como máximo 15 minutos y dormir desperdicia dinero; D — las programaciones de EventBridge pueden activar eventos pero no pueden pausar y reanudar el estado del flujo de trabajo.

**33. Respuesta: A** — Los flujos de trabajo Express están construidos para ejecuciones de muy alta tasa, corta duración y al menos una vez a menor costo; los flujos de trabajo Standard proporcionan semántica de exactamente una vez, hasta un año de duración e historial de ejecución completo para el trabajo de conciliación. *Por qué no las otras:* B — Standard no puede sostener económicamente 90.000 inicios/segundo para este caso de uso; C — Express tiene un máximo de 5 minutos y es al menos una vez, fallando el trabajo de 12 horas exactamente una vez; D — las asignaciones invertidas fallan ambas cargas de trabajo.

**34. Respuesta: B** — El enrutamiento de failover envía todo el tráfico al primario mientras su verificación de estado pase, y luego responde automáticamente con el registro secundario cuando falla. *Por qué no las otras:* A — el ponderado 50/50 envía la mitad del tráfico a la copia pasiva todo el tiempo; C — el enrutamiento basado en latencia divide el tráfico por rendimiento, no por intención activo/pasivo; D — la geolocalización enruta por la ubicación del usuario, no relacionada con el failover basado en el estado del endpoint.

**35. Respuesta: B** — Agregar el tipo de verificación de estado de ELB hace que el ASG trate los fallos de estado de destino del ALB como en mal estado, de modo que las instancias con la app bloqueada se terminan y reemplazan aunque las verificaciones de estado de EC2 pasen. *Por qué no las otras:* A — el monitoreo detallado solo cambia la granularidad de las métricas; C — el período de gracia retrasa la evaluación del estado, lo opuesto a lo que se necesita; D — el tipo de balanceador de carga no es el problema.

**36. Respuesta: B** — El Network Load Balancer opera en la capa 4 (TCP/UDP), maneja millones de solicitudes por segundo con latencia ultrabaja y admite una IP estática (o Elastic) por AZ. *Por qué no las otras:* A — el ALB es de capa 7 (HTTP/HTTPS) y no ofrece IPs estáticas de forma nativa; C — el Gateway Load Balancer es para desplegar dispositivos virtuales en línea; D — el Classic Load Balancer es heredado y no cumple ninguno de los requisitos.

**37. Respuesta: B, C** — CRR requiere versionado habilitado en ambos buckets, y las clases EFS Standard son sistemas de archivos regionales (multi-AZ) montables de forma concurrente entre AZs. *Por qué no las otras:* A — CRR solo replica objetos nuevos tras la configuración, a menos que ejecutes S3 Batch Replication para los existentes; D — EFS admite miles de clientes NFS concurrentes, a diferencia de EBS de adjunto único; E — el versionado es un prerrequisito para la replicación pero no replica nada por sí mismo.

### Parte 3 — Preguntas 38–53

**38. Respuesta: B** — io2 Block Express ofrece hasta 256.000 IOPS, latencia de submilisegundos y durabilidad del 99,999%, cumpliendo los tres requisitos. *Por qué no las otras:* A — gp3 ahora puede alcanzar la cifra de IOPS (su tope se elevó a 80.000 a finales de 2025), pero falla los otros dos requisitos: la durabilidad es del 99,8–99,9% (la pregunta exige 99,999%) y su latencia es de un solo dígito de milisegundos, no submilisegundos garantizados; B es el único tipo que cumple los tres; C — st1 es basado en HDD e inadecuado para bases de datos intensivas en IOPS; D — gp2 tiene un máximo de 16.000 IOPS y las ráfagas no son una garantía sostenida.

**39. Respuesta: C** — FSx for Lustre está diseñado específicamente para HPC con latencia de submilisegundos, cientos de GB/s de rendimiento e integración nativa con S3 (carga diferida y exportación). *Por qué no las otras:* A — EFS no puede igualar el perfil de rendimiento/latencia de HPC de Lustre; B — FSx for Windows apunta a cargas de trabajo SMB/Windows, no HPC de Linux; D — Mountpoint for S3 no ofrece semántica de sistema de archivos POSIX compartido ni la latencia requerida.

**40. Respuesta: B** — FSx for Windows File Server admite de forma nativa SMB, integración con Active Directory y ACLs de NTFS, y el modo Multi-AZ cubre el requisito de dos AZs. *Por qué no las otras:* A — EFS es NFS/POSIX y no preserva los permisos NTFS; C — S3 es almacenamiento de objetos, no un recurso compartido de archivos SMB; D — Lustre es un sistema de archivos HPC de Linux sin soporte de SMB/AD.

**41. Respuesta: D, E** — Transfer Acceleration enruta las cargas a través de la red de borde/troncal de AWS para acelerar las transferencias de larga distancia, y la carga multiparte paraleliza las transferencias y permite reintentar las partes fallidas sin reiniciar todo el archivo de 40 GB. *Por qué no las otras:* A — One Zone-IA cambia la redundancia, no el rendimiento de carga; B — no puedes poner un ALB frente a S3 para las cargas; C — CRR replica después de la carga y no ayuda a la ingesta.

**42. Respuesta: B** — Los NVMe SSD de instance store están físicamente adjuntos al host, ofreciendo la latencia más baja para datos efímeros que pueden regenerarse. *Por qué no las otras:* A y D — EBS atraviesa la red y añade latencia; C — EFS es un sistema de archivos de red con mayor latencia que ambos.

**43. Respuesta: B** — El throttling en particiones calientes con baja utilización general es el problema clásico de la clave de partición de baja cardinalidad; una clave de alta cardinalidad (p. ej., game_id#player_id) distribuye el tráfico de manera uniforme. *Por qué no las otras:* A — los cambios de modo de capacidad no solucionan las particiones calientes; C — un LSI comparte la misma clave de partición y las mismas particiones calientes; D — los Streams capturan cambios, no redistribuyen escrituras.

**44. Respuesta: B** — DAX es un caché en memoria compatible con DynamoDB y transparente a la API que ofrece lecturas en microsegundos con un cambio mínimo de código. *Por qué no las otras:* A — ElastiCache requiere reescrituras de la aplicación para gestionar el caché; C — un GSI no almacena en caché los elementos calientes ni da latencia de microsegundos; D — Global Tables aborda el acceso multirregión, no la latencia de lectura de un solo elemento.

**45. Respuesta: B** — Un GSI puede agregarse a una tabla existente en cualquier momento, admite una nueva combinación de clave de partición/ordenamiento y tiene su propio rendimiento aprovisionado aislado de la tabla base. *Por qué no las otras:* A — los LSI solo pueden crearse en la creación de la tabla, comparten la clave de partición de la tabla y comparten el rendimiento de la tabla; C — recrear la tabla es disruptivo e innecesario; D — los Streams son para captura de cambios, no para consultas ad hoc.

**46. Respuesta: B** — DynamoDB TTL elimina automáticamente los elementos expirados en segundo plano sin costo adicional. *Por qué no las otras:* A — los escaneos programados consumen capacidad de lectura/escritura y cuestan dinero; C — las políticas de ciclo de vida son un concepto de S3/EFS, no de DynamoDB; D — los Streams filtran eventos aguas abajo pero no eliminan elementos de la tabla.

**47. Respuesta: B** — RDS Proxy agrupa y multiplexa conexiones, permitiendo que miles de invocaciones de Lambda compartan un pequeño conjunto de conexiones de base de datos con solo un cambio en la cadena de conexión. *Por qué no las otras:* A — el aumento de tamaño es costoso y solo pospone el límite; C — una migración de base de datos es un cambio mayor en la aplicación; D — limitar Lambda a 10 paraliza el rendimiento en lugar de resolver la gestión de conexiones.

**48. Respuesta: A** — Las Aurora Replicas (hasta 15) detrás del reader endpoint con auto scaling de réplicas descargan el tráfico de lectura con un mínimo trabajo operativo. *Por qué no las otras:* B — Aurora no usa un modelo de instancia en espera pasiva; las instancias en espera en términos clásicos de RDS no sirven tráfico; C — el sharding es una sobrecarga operativa alta para un problema de escalado de lectura; D — Backtrack rebobina la base de datos en el tiempo, no sirve lecturas.

**49. Respuesta: B** — Global Accelerator proporciona dos IPs anycast estáticas, admite UDP, da fachada a NLBs en múltiples regiones y hace failover en segundos a través de la red troncal de AWS. *Por qué no las otras:* A — CloudFront sirve contenido HTTP/HTTPS, no UDP arbitrario, y no tiene IPs estáticas de cara al cliente; C — el enrutamiento por latencia de Route 53 depende de los TTLs de DNS para el failover y no proporciona IPs estáticas; D — un ALB es regional y solo HTTP.

**50. Respuesta: B** — El enrutamiento de geolocalización responde a las consultas DNS según el país del usuario, aplicando Alemania→eu-central-1 y Francia→eu-west-3 de forma determinista para el cumplimiento de las licencias. *Por qué no las otras:* A — el enrutamiento por latencia elige el endpoint más rápido, lo que puede violar la regla de licencia; C — el sesgo de geoproximidad desplaza los límites por distancia pero no garantiza un mapeo estricto por país; D — el enrutamiento ponderado distribuye aleatoriamente por peso, ignorando la ubicación.

**51. Respuesta: C** — Un cluster placement group agrupa las instancias muy cerca en una AZ para la latencia más baja y el mayor número de paquetes por segundo, ideal para cargas de trabajo MPI fuertemente acopladas. *Por qué no las otras:* A — los spread groups separan las instancias en hardware distinto, aumentando la latencia, y tienen un tope de 7 por AZ; B — los partition groups aíslan dominios de fallo para sistemas de datos distribuidos, no para MPI de baja latencia; D — las subredes separadas no hacen nada para co-ubicar las instancias.

**52. Respuesta: B** — Amazon Data Firehose es completamente gestionado, no requiere consumidores ni gestión de shards, almacena registros en búfer y puede convertir JSON a Parquet antes de entregar a S3. *Por qué no las otras:* A — Kinesis Data Streams requiere escribir/gestionar consumidores; C — SQS más sondeadores EC2 es infraestructura personalizada para construir y operar; D — MSK requiere gestionar clústeres y conectores de Kafka.

**53. Respuesta: B** — Los crawlers de Glue infieren el esquema en el Data Catalog y Athena ejecuta SQL sin servidor directamente contra los archivos de S3. *Por qué no las otras:* A — Redshift requiere aprovisionamiento de clúster y carga de datos; C — EMR significa gestionar un clúster de larga duración; D — RDS requeriría cargar los datos en un servidor de base de datos.

### Parte 4 — Preguntas 54–65

**54. Respuesta: C** — Los trabajos por lotes con checkpoint y reiniciables son la carga de trabajo Spot ideal, y un Spot Fleet diversificado entre tipos de instancia/AZs minimiza el impacto de las interrupciones con hasta ~90% de ahorro. *Por qué no las otras:* A — bajo demanda renuncia al descuento sin beneficio aquí; B y D — los compromisos dan descuentos menores que Spot y bloquean el gasto para un trabajo apto para interrupciones.

**55. Respuesta: C** — Los Compute Savings Plans se aplican automáticamente a través de EC2 (cualquier familia/región), Fargate y Lambda, ajustándose a la ruta de modernización. *Por qué no las otras:* A — los EC2 Instance Savings Plans están bloqueados a una familia de instancia en una región y excluyen Fargate/Lambda; B y D — las Instancias Reservadas cubren solo EC2 y no se aplican a Fargate ni Lambda.

**56. Respuesta: B** — Solo las Instancias Reservadas Standard de EC2 pueden listarse en el Reserved Instance Marketplace; las RI de RDS (y de otros servicios) no pueden revenderse. *Por qué no las otras:* A y C — las RI de RDS no son elegibles para el marketplace; D — las RI Standard de EC2 sí son vendibles en el marketplace.

**57. Respuesta: B** — AWS entrega un aviso de interrupción de Spot dos minutos antes de recuperar la instancia, dando tiempo para drenar y hacer checkpoint. *Por qué no las otras:* A — sí se proporciona una advertencia; C y D — 15 minutos y 24 horas no son ventanas de interrupción de Spot (las recomendaciones de reequilibrio pueden llegar antes pero no son una ventana fija garantizada).

**58. Respuesta: B** — Glacier Flexible Retrieval ofrece bajo costo de almacenamiento de archivo y recuperaciones Expedited que devuelven los datos en 1–5 minutos (alrededor de $0.03/GB), cumpliendo el requisito de 5 minutos. *Por qué no las otras:* A — la recuperación más rápida de Deep Archive es de ~12 horas; C — las recuperaciones Bulk tardan 5–12 horas; D — Standard-IA recupera al instante pero cuesta mucho más para almacenamiento de 7 años de acceso poco frecuente.

**59. Respuesta: B** — One Zone-IA cuesta ~20% menos que Standard-IA y el compromiso de durabilidad de una sola AZ es aceptable para miniaturas reproducibles. *Por qué no las otras:* A — Standard-IA cuesta más por una redundancia que los datos no necesitan; C — Intelligent-Tiering añade tarifas de monitoreo y no minimiza el costo para un acceso conocido como infrecuente; D — Glacier Instant Retrieval tiene un mínimo de 90 días y un perfil de costo de recuperación diferente para este patrón.

**60. Respuesta: A, C** — Intelligent-Tiering cobra una pequeña tarifa de monitoreo/automatización por objeto, y los objetos de menos de 128 KB se almacenan pero no se monitorean ni se mueven entre niveles (facturados a tarifas de Frequent Access). *Por qué no las otras:* B — Intelligent-Tiering no tiene tarifas de recuperación entre sus niveles automáticos; D — nunca replica entre regiones; E — no hay un mínimo de 90 días para cada objeto en la clase.

**61. Respuesta: B** — Las partes de carga multiparte incompletas se facturan como almacenamiento pero son invisibles como objetos; una regla de ciclo de vida con AbortIncompleteMultipartUpload las elimina automáticamente. *Por qué no las otras:* A — el versionado aumentaría el almacenamiento, no limpiaría las partes; C — cambiar la clase de almacenamiento no elimina las partes huérfanas; D — Transfer Acceleration acelera las transferencias pero no limpia las cargas ya abandonadas.

**62. Respuesta: B** — gp3 desacopla los IOPS/rendimiento del tamaño y cuesta ~20% menos por GB que gp2, por lo que la capacidad puede dimensionarse correctamente mientras se mantienen los IOPS necesarios; la migración es una operación ModifyVolume en línea. *Por qué no las otras:* A — io2 es más caro, no menos; C — st1 no puede ofrecer los IOPS requeridos; D — eliminar volúmenes destruye datos en vivo.

**63. Respuesta: B** — Un gateway VPC endpoint para S3 es gratuito y elimina los cargos de procesamiento de datos del NAT gateway para el tráfico de S3 de la misma región. *Por qué no las otras:* A — una instancia NAT todavía incurre en costos de EC2 y operativos; C — los interface endpoints facturan por hora y por GB, costando más que el gateway endpoint gratuito; D — las subredes públicas añaden cargos de IPv4 públicas y debilitan la seguridad.

**64. Respuesta: B, E** — AWS cobra por cada dirección IPv4 pública en uso, así que eliminar las innecesarias reduce el costo, y AWS Budgets proporciona alertas proactivas de umbral sobre el gasto previsto/real. *Por qué no las otras:* A — las Elastic IPs también se facturan bajo el cargo de IPv4 públicas incluso mientras están adjuntas; C — Compute Optimizer recomienda el dimensionamiento correcto pero no puede bloquear ni alertar sobre umbrales de gasto; D — Shield Advanced es un servicio de DDoS que añade costo.

**65. Respuesta: A** — Aurora Serverless v2 admite escalar a 0 ACUs (pausa automática, disponible desde finales de 2024) y se reanuda automáticamente al conectarse, eliminando el costo de cómputo mientras está inactivo sin pasos manuales. Matices que vale la pena conocer: la pausa automática requiere versiones de motor recientes (Aurora PostgreSQL 13.15+/14.12+/15.7+/16.3+, Aurora MySQL 3.08+); la primera conexión después de una pausa tarda ~15 segundos en reanudarse (más después de 24+ horas en pausa); el almacenamiento sigue facturándose mientras el cómputo está pausado; y cualquier cosa que mantenga conexiones abiertas — un RDS Proxy, una verificación de estado keep-alive — impide la pausa por completo. *Por qué no las otras:* B — un clúster aprovisionado detenido no se despierta automáticamente cuando los desarrolladores se conectan (y se reinicia después de 7 días); C — los secundarios sin instancias de una global database abordan la DR, no el costo de inactividad; D — las réplicas reducidas todavía dejan la instancia escritora en ejecución y facturando.

---

## Guía de Puntuación

| Puntaje | Lectura del resultado |
|---|---|
| 55–65 | Listo para el examen. Reserva el examen. Revisa solo las preguntas que fallaste. |
| 47–54 | En rango de aprobación, pero el margen es estrecho. Vuelve a leer los capítulos detrás de cada fallo (usa las etiquetas de dominio), repítelo en una semana. |
| 38–46 | La base está ahí; quedan brechas. Trabaja el mapa de dominios del Apéndice B para tus dominios débiles antes de repetirlo. |
| Por debajo de 38 | Vuelve a leer de principio a fin los capítulos de tus dos dominios más débiles, rehaz sus ejercicios de capítulo, luego repite este examen. |

Rastrea tus fallos *por dominio* (cada pregunta está etiquetada). Un puntaje bajo concentrado en un dominio es un problema de estudio focalizado; el mismo puntaje distribuido uniformemente es un problema de ritmo o de lectura de preguntas — ve más despacio y subraya lo que cada enunciado realmente requiere (HA vs. DR, costo vs. rendimiento, "MÁS rentable" vs. "MENOR sobrecarga operativa").
