# Capítulo 17: Los Vigilantes

El incidente con la IP rumana había quedado contenido. Los secretos estaban en Secrets Manager. Las credenciales habían sido rotadas. Los controles de red habían sido reforzados.

Pero Priya había hecho la pregunta que cerró el Capítulo 16: «Si apareciera algo inusual en CloudTrail, ¿cómo lo sabríamos?»

La respuesta honesta era: probablemente no lo sabrían.

---

*Todo lo que podía cerrarse había sido cerrado. Los secretos estaban en Secrets Manager. Las claves de cifrado estaban en KMS. El tráfico de red estaba controlado por grupos de seguridad y NACLs. Las defensas perimetrales eran sólidas. Pero las defensas perimetrales asumen que sabes cómo se ve un ataque antes de que llegue. La pregunta que Priya hacía era diferente: ¿qué hay de los ataques que no ves venir?*

---

CloudTrail registra miles de eventos por día. Ningún humano los lee todos. Priya los revisaba manualmente cada semana, pero eso significaba que algo podría ocurrir un martes y no ser detectado hasta el lunes siguiente.

«Necesitamos algo que vigile los registros por nosotros», dijo.

Maya levantó la vista. «¿Automáticamente?»

«Automáticamente.»

«¿Y qué pasa si alguien intenta entrar a la fuerza?» continuó Priya. «No solo una credencial comprometida — ¿qué pasa si alguien lanza un DDoS? ¿Qué pasa si empiezan a sondear nuestros endpoints de API en busca de vulnerabilidades de inyección? ¿Qué pasa si ya están dentro y no lo sabemos?»

«Esos son tres problemas diferentes», dijo Leo.

«Sí», dijo Priya. «Y AWS tiene tres servicios diferentes para abordarlos.»

**Tres Categorías de Amenazas**

Las amenazas de seguridad contra una aplicación en la nube generalmente se dividen en tres categorías:

**Ataques de volumen (DDoS)**: Un atacante envía tanto tráfico que tu aplicación no puede responder a los usuarios legítimos. El ataque puede ser millones de solicitudes HTTP, o una avalancha de paquetes TCP SYN diseñados para agotar la tabla de conexiones de tu servidor.

**Ataques a aplicaciones (Exploits)**: Un atacante envía solicitudes específicamente elaboradas para explotar debilidades en tu aplicación — inyección SQL, secuencias de comandos entre sitios, entradas malformadas que hacen colapsar un analizador.

**Anomalías de comportamiento (Reconocimiento y compromiso)**: Llamadas a la API que no deberían estar ocurriendo (alguien consultando toda tu base de datos de usuarios a las 3 AM), actividad inusual de IAM (credenciales usadas desde un nuevo país) o tráfico de red hacia destinos inesperados.

AWS tiene un servicio dedicado para cada uno:

- **AWS Shield**: Protección contra DDoS
- **AWS WAF**: Protección a nivel de aplicación
- **Amazon GuardDuty**: Detección de amenazas de comportamiento

**AWS Shield: El Absorbedor de DDoS**

**AWS Shield Standard** está habilitado automáticamente para todos los clientes de AWS sin cargo adicional. Protege contra los ataques DDoS más comunes de capa 3 (red) y capa 4 (transporte) — inundaciones SYN, inundaciones UDP, ataques de amplificación de DNS.

CloudFront, Route 53 y Elastic Load Balancing se sitúan en el borde de la red de AWS. Cuando un ataque DDoS apunta a tu aplicación, primero llega a estos servicios gestionados. La infraestructura de red de AWS absorbe el ataque antes de que llegue a tus instancias de EC2.

**AWS Shield Advanced** es el nivel premium ($3.000/mes por organización, con un compromiso de un año). Es una suscripción separada — *no* está incluida en ningún plan de Soporte de AWS. Agrega:

- Protección para EC2, ELB, CloudFront, Global Accelerator y Route 53
- Notificaciones de ataques casi en tiempo real
- Acceso al Equipo de Respuesta de AWS Shield (SRT) — ingenieros de seguridad que pueden ayudarte a responder a los ataques (involucrar al SRT requiere adicionalmente un plan de Soporte Business o Enterprise)
- Protección de costes: si un ataque hace que tu factura se dispare, AWS acredita los costes del pico
- Detección y mitigación mejorada de DDoS en la capa 7 (capa de aplicación)

«¿Cuánto cuesta eso al mes?» preguntó Tom.

«Tres mil dólares», dijo Priya. «Por organización.»

Tom guardó silencio por un momento.

«Para empresas que manejan millones en ingresos, un DDoS que las deja fuera de servicio durante dos horas cuesta más de tres mil dólares», dijo Priya.

Tom hizo el cálculo en silencio.

«Empecemos con Standard», dijo finalmente.

---

**El Incidente DDoS: Cómo se Ve Shield en Acción**

Ocho meses después del lanzamiento, Nimbus recibió su primer ataque DDoS real.

Empezó a las 11:43 AM un martes. El panel de CloudWatch del balanceador de carga mostraba que las solicitudes de conexión entrantes se disparaban de las 3.000 normales por minuto a 180.000 por minuto en menos de noventa segundos. Las IPs de origen estaban distribuidas en cuarenta países, y el volumen entrante alcanzó un pico de alrededor de cincuenta gigabits por segundo. El patrón era inconfundible: una botnet lanzando una inundación SYN.

Leo vio primero las métricas de CloudFront. «La tasa de solicitudes ha subido sesenta veces. El tiempo de respuesta se está disparando.»

Priya abrió las métricas de CloudWatch una al lado de la otra: los intentos de conexión en el borde subiendo verticalmente, las solicitudes que realmente llegaban al origen — planas. «Shield Standard se lo está comiendo», dijo. No hubo alerta, ni evento de panel, ni notificación. Shield Standard funciona silenciosamente: siempre está activo, es gratis y te da **cero visibilidad del ataque** — sin consola de eventos, sin notificaciones, sin equipo de respuesta a DDoS. (Esa visibilidad — paneles y alertas de ataques casi en tiempo real — es precisamente lo que vende Shield *Advanced*.) La única forma en que Priya podía ver el ataque era a través de sus propias métricas de CloudWatch.

Shield Standard había detectado automáticamente la inundación SYN e iniciado la mitigación en los primeros dos minutos. El tráfico del ataque estaba siendo absorbido en los nodos de borde de CloudFront a nivel mundial — los mismos más de 750 puntos de presencia que servían contenido legítimo también absorbían el volumen del ataque.

Para las 11:52 AM — nueve minutos después de que empezara el ataque — la mitigación de Shield había devuelto la tasa de solicitudes en el origen a la normalidad. El ataque seguía ejecutándose a nivel de red, pero la mitigación lo estaba manejando. La aplicación de Nimbus siguió sirviendo a los usuarios todo el tiempo.

«¿Los usuarios no se dieron cuenta?» preguntó Leo, mirando la métrica de la tasa de error.

«La tasa de error subió alrededor de un dos por ciento durante unos cuatro minutos», dijo Priya. «Algunos usuarios obtuvieron una respuesta ligeramente más lenta. Sin interrupciones. La aplicación se mantuvo activa.»

«Porque Shield absorbió la inundación en el borde.»

«Antes de que llegara a nuestro balanceador de carga. La inundación SYN de cincuenta gigabits golpeó CloudFront. Para cuando el patrón de tráfico fue reconocido y mitigado, nuestro origen solo había visto el volumen de solicitudes normal.»

El ataque duró cuarenta y siete minutos. Para las 12:30 PM las métricas del borde habían vuelto a la línea base — la única señal de «resuelto» que te da Shield Standard.

«Y esto es Shield Standard», dijo Tom. «La versión gratuita.»

«Ataques de capa 3 y 4. Standard protege contra esos automáticamente. Si el ataque hubiera sido más sofisticado — una inundación HTTP de capa 7, por ejemplo, donde cada solicitud parecía legítima — Standard no habría sido suficiente. Eso requiere Shield Advanced más WAF.»

Tom anotó «Monitorear patrones de DDoS de capa 7» en su hoja de ruta de seguridad.

---

**AWS WAF: El Filtro de Aplicaciones**

**AWS WAF (Web Application Firewall)** opera a nivel HTTP — inspecciona el contenido de las solicitudes web antes de que lleguen a tu aplicación.

WAF se configura con **ACL Web (Listas de Control de Acceso)** — conjuntos de reglas que definen qué permitir, bloquear o contar.

WAF puede adjuntarse a:

- Distribuciones de CloudFront (inspecciona las solicitudes en el borde, globalmente)
- Application Load Balancers (inspecciona las solicitudes a nivel regional)
- API Gateway
- AWS AppSync

**Reglas Administradas de WAF**: AWS y proveedores de terceros publican conjuntos de reglas preconstruidas:

- **Reglas Administradas de AWS - Conjunto de Reglas Core**: Junto con grupos de reglas complementarios (base de datos SQL, Entradas Maliciosas Conocidas), cubre las vulnerabilidades del OWASP Top 10 (inyección SQL, XSS, inyección de comandos, traversal de rutas, etc.)
- **Reglas Administradas de AWS - Entradas Maliciosas Conocidas**: Bloquea solicitudes que coinciden con patrones de ataque conocidos
- **Reglas Administradas de AWS - Lista de Reputación de IP de Amazon**: Bloquea IPs conocidas por estar asociadas con botnets y escáneres
- **Reglas Administradas de AWS - Control de Bots**: Identifica y gestiona el tráfico de bots

También puedes crear reglas personalizadas:

- «Bloquear cualquier solicitud con un encabezado User-Agent que contenga 'sqlmap'» (un escáner de inyección SQL común)
- «Limitación de velocidad: permitir no más de 1.000 solicitudes por IP por 5 minutos»
- «Bloquear solicitudes que contengan `<script>` en cualquier valor de parámetro»

Para Nimbus, la configuración práctica: WAF en la distribución de CloudFront con el Conjunto de Reglas Core habilitado. Esto bloquea los patrones de ataque más comunes antes de que las solicitudes lleguen jamás a las instancias de EC2.

Quizás te estés preguntando: si WAF bloquea patrones de ataque conocidos, ¿qué pasa cuando aparece un nuevo patrón de ataque que WAF no conoce? Los conjuntos de reglas administradas de WAF son actualizados por AWS y proveedores de terceros a medida que surgen nuevas amenazas — no tienes que actualizar las reglas manualmente. Pero tienes razón en que WAF es fundamentalmente reactivo a patrones conocidos. Las técnicas de ataque nuevas y novedosas no serán bloqueadas por una regla que aún no existe. Por esto GuardDuty existe junto a WAF: WAF filtra la puerta de entrada, GuardDuty vigila el comportamiento inusual dentro de la casa. Un nuevo tipo de ataque podría atravesar WAF, pero GuardDuty todavía puede marcar la actividad anómala que causa — llamadas a la API inusuales, destinos de red inesperados, patrones de acceso que no coinciden con la línea base.

**¿Hemos pensado en lo que pasa si WAF causa falsos positivos?** preguntó Priya. «¿La solicitud de un usuario legítimo que es bloqueada por el Conjunto de Reglas Core?»

«WAF tiene un modo "Count"», dijo Leo. «En lugar de bloquear, solo cuenta las solicitudes que coinciden. Lo ejecutas primero en modo Count, revisas lo que habría bloqueado, verificas que no hay falsos positivos, y luego cambias a Block.»

«Bien», dijo Priya. «Empezamos en modo Count.»

---

**Crear una Regla de WAF: La Historia del Límite de Velocidad**

Dos semanas después de habilitar WAF en modo Count, Priya revisó los registros. Los hallazgos del Conjunto de Reglas Core estaban limpios — sin falsos positivos en el tráfico legítimo, un puñado de intentos de inyección SQL bloqueados de escáneres automatizados.

Pero notó un patrón que el Conjunto de Reglas Core no estaba marcando: una dirección IP había hecho 847 solicitudes a `/api/search` en cinco minutos. Cada solicitud era estructuralmente válida. Pero 847 búsquedas en cinco minutos no era un humano.

«Raspador de precios», dijo. «Alguien está consultando automáticamente nuestra búsqueda de restaurantes para construir una base de datos de precios competitivos.»

«¿Nos importa?» preguntó Leo.

«Usa nuestros recursos de cómputo y va en contra de nuestros términos de servicio», dijo Tom.

«Nos importa», confirmó Priya.

Creó una regla de WAF personalizada basada en velocidad:

```
Nombre de la regla: RateLimitSearchAPI
Tipo de regla: Regla basada en velocidad
Límite de velocidad: 100 solicitudes por dirección IP
Ventana de evaluación: 5 minutos (configurable: 1, 2, 5 o 10 minutos)
Declaración de reducción de alcance: la ruta URI empieza con /api/search
Acción: Bloquear
```

La declaración de reducción de alcance es importante — el límite de velocidad aplica solo a `/api/search`. El tráfico de API legítimo a otros endpoints no se ve afectado. Y observa cómo funciona el bloqueo: no hay un período de «castigo» fijo — WAF reevalúa la tasa de solicitudes de cada IP de forma continua, la bloquea mientras la tasa se mantiene por encima del límite, y la desbloquea (típicamente en segundos) una vez que la tasa vuelve a bajar.

La configuró primero en modo Count. La ejecutó durante 24 horas. La única IP que activó la regla fue el raspador. Ningún usuario legítimo había enviado jamás más de 12 solicitudes al endpoint de búsqueda en cinco minutos.

Cambió al modo Block. La siguiente solicitud del raspador recibió un 403. Se cambió a una IP diferente. El límite de velocidad también atrapó esa.

«Eventualmente lo sortearán», dijo Leo. «Se distribuirán entre más IPs.»

«Momento en el cual están usando más infraestructura, pagando más y obteniendo menos datos», dijo Priya. «No necesitamos detenerlos por completo. Necesitamos hacerlo lo suficientemente caro como para que no valga la pena.»

«¿Cuánto cuesta eso al mes?» preguntó Tom.

El precio de WAF es por ACL Web por mes, por regla por mes, y por millón de solicitudes. Para la configuración de Nimbus — un ACL Web, cinco reglas en CloudFront — aproximadamente $15 al mes más los cargos por solicitudes.

Tom lo aprobó inmediatamente.

---

**Amazon GuardDuty: El Analista de Comportamiento**

«Espera — pero ¿*por qué* lo haríamos de esa manera?» preguntó Maya. «Si WAF está bloqueando ataques y Shield está absorbiendo inundaciones, ¿por qué necesitamos un tercer servicio? ¿Qué está vigilando GuardDuty realmente?»

WAF y Shield son filtros — interceptan el tráfico malo antes de que llegue a tu aplicación. GuardDuty vigila lo que pasa después de que el tráfico llega. Mira lo que tu infraestructura está haciendo: qué credenciales de IAM se están usando, qué dominios están contactando tus instancias, qué llamadas a la API están ocurriendo a las 3 AM. Un atacante que atraviesa la puerta de entrada mediante una solicitud de apariencia legítima no será detenido por WAF — pero GuardDuty notará que la misma credencial de repente está haciendo llamadas a la API desde Rumania.

GuardDuty es fundamentalmente diferente de Shield y WAF. No bloquea ataques — **detecta comportamiento inusual**.

GuardDuty analiza continuamente varios flujos de actividad para detectar amenazas: **eventos de gestión y de datos de CloudTrail** (llamadas a la API y acciones), **VPC Flow Logs** (patrones de tráfico de red) y **registros de consultas DNS** (búsquedas de dominios). Estas son las tres fuentes fundamentales en las que GuardDuty siempre se ha basado:

- **Registros de AWS CloudTrail**: cambios de IAM, llamadas a la API, inicios de sesión en la consola
- **VPC Flow Logs**: patrones de tráfico de red dentro de tu VPC
- **Registros de consultas DNS**: qué están resolviendo tus instancias (el malware conocido a menudo resuelve dominios C2 específicos)

Pero GuardDuty se ha expandido significativamente más allá de estas tres. AWS llama a los complementos opcionales **planes de protección** — Protección de S3, Protección de EKS, Protección de RDS, Protección de Lambda, Monitoreo en Tiempo de Ejecución (Runtime Monitoring) y Protección contra Malware — cada uno habilitado individualmente. Dependiendo de cuáles habilites, GuardDuty también puede analizar **eventos de datos de S3** (patrones de acceso inusuales a tus buckets), **registros de auditoría y actividad en tiempo de ejecución de EKS** (comportamiento malicioso dentro de contenedores en ejecución), **eventos de inicio de sesión de RDS** (intentos de inicio de sesión anómalos en la base de datos), **tráfico de red de Lambda** (funciones que llaman a destinos externos inesperados), **comportamiento en tiempo de ejecución de ECS/EC2** y **volúmenes de EBS escaneados en busca de malware**. Para el examen, conoce de memoria las tres fuentes principales; los planes de protección aparecen en escenarios sobre contextos específicos de detección de amenazas — «detectar intentos de inicio de sesión anómalos en RDS» o «identificar comportamiento malicioso dentro de un contenedor en ejecución» son señales para pensar en los planes de protección opcionales de GuardDuty.

Los modelos de aprendizaje automático identifican patrones que se desvían de tu línea base. GuardDuty genera **hallazgos** — alertas categorizadas — cuando detecta anomalías.

Ejemplos de lo que GuardDuty puede detectar:

- Un usuario de IAM que inicia sesión desde una dirección IP no reconocida (en un país que nunca ha usado antes)
- Llamadas a la API realizadas desde un nodo de salida de Tor
- Una instancia de EC2 comunicándose con un pool de minería de criptomonedas conocido
- Volumen de llamadas a la API inusualmente alto (abuso de credenciales o escaneo)
- Un bucket de S3 al que accede una dirección IP marcada por actividad maliciosa
- Tráfico saliente hacia un dominio conocido por estar asociado con comando y control de malware

«Esto es lo que habría detectado la IP rumana», dijo Leo en voz baja.

«Si hubiéramos tenido GuardDuty habilitado, habría marcado la instancia de EC2 haciendo conexiones salientes hacia una IP externa no reconocida a las 2 AM», confirmó Priya.

---

**Cinco Tipos de Hallazgos de GuardDuty y Qué Hacer**

Priya creó un runbook para los cinco hallazgos más comunes de GuardDuty. Cuando se dispara un hallazgo, el equipo sabe inmediatamente qué significa y qué hacer.

**1. UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B**

Un usuario de IAM inició sesión correctamente en la Consola de AWS desde una dirección IP que no se ha visto antes para esta cuenta, o desde una ubicación geográfica inconsistente con inicios de sesión anteriores.

Respuesta: Verifica con el usuario que él inició el acceso. Si no lo hizo — o no se le puede contactar — inmediatamente: deshabilita la clave de acceso y la contraseña de consola del usuario, revoca las sesiones activas, y comienza una auditoría de CloudTrail de todo lo que ese usuario ha hecho en las últimas 24 horas. Este hallazgo a menudo precede al abuso de credenciales.

**2. CryptoCurrency:EC2/BitcoinTool.B**

Una instancia de EC2 está consultando direcciones IP o nombres de dominio asociados con pools de minería de criptomonedas. Esto casi siempre es el resultado de que una instancia de EC2 ha sido comprometida y usada como un bot de minería.

Respuesta: Aísla la instancia inmediatamente — modifica su grupo de seguridad para bloquear todo el tráfico entrante y saliente excepto para tu bastion host. Toma una instantánea forense del volumen de EBS. Luego termina la instancia y lanza un reemplazo desde una AMI limpia.

**3. Recon:EC2/PortProbeUnprotectedPort**

Una instancia de EC2 tiene un puerto abierto a internet que está siendo sondeado por escáneres conocidos o desde un nodo de salida de Tor. GuardDuty marca los puertos que aparecen en los flow logs como accesibles desde fuentes externas.

Respuesta: Revisa las reglas del grupo de seguridad. Si el puerto está abierto intencionalmente, marca el hallazgo como resuelto con una nota. Si no es intencional, cierra el puerto inmediatamente. Revisa CloudTrail en busca de cualquier acceso que pueda haber ocurrido a través de ese puerto.

**4. Trojan:EC2/BlackholeTraffic**

Una instancia de EC2 está intentando comunicarse con una dirección IP que ha sido identificada como un «agujero negro» (black hole) — un destino asociado con la infraestructura de comando y control de malware. El tráfico hacia estas IPs sugiere que la instancia ha sido infectada y está intentando llamar a casa.

Respuesta: Igual que los hallazgos de CryptoCurrency — aísla, toma instantánea, reemplaza. Este hallazgo indica malware activo en la instancia. No intentes limpiar la instancia en su lugar; construye una nueva desde una AMI limpia.

**5. Policy:S3/BucketBlockPublicAccessDisabled**

Alguien ha deshabilitado la configuración de Block Public Access en un bucket de S3. Esto no significa que el bucket sea público — significa que el mecanismo de seguridad que previene la exposición pública accidental ha sido desactivado para ese bucket. Esto a menudo se hace accidentalmente o como parte de un despliegue mal configurado.

Respuesta: Investiga quién hizo el cambio (CloudTrail tendrá la llamada a la API). Vuelve a habilitar Block Public Access a menos que haya una razón documentada por la que debería estar deshabilitado. Considera habilitar la configuración de Block Public Access a nivel de cuenta para prevenir que este hallazgo ocurra en el futuro.

«Lo más importante sobre los hallazgos de GuardDuty», dijo Priya, «es que no son alertas — son hipótesis. Cada hallazgo dice "este patrón parece anómalo". Verificas, investigas, respondes. Algunos serán falsos positivos. La mayoría no.»

«¿Cómo priorizamos?» preguntó Rafael.

«GuardDuty asigna niveles de severidad: Bajo, Medio, Alto. Los hallazgos de severidad Alta requieren respuesta el mismo día. Los hallazgos de Trojan y compromiso de credenciales son siempre Altos. Los hallazgos de sondeo de puertos podrían ser Medios o Bajos. Empieza con Altos, ve bajando.»

---

«¿Cuánto cuesta?» preguntó Tom.

El precio de GuardDuty se basa en el volumen de registros analizados — eventos de CloudTrail, datos de flujo de VPC, consultas DNS. Para una aplicación pequeña a mediana, típicamente $50-150/mes. A escala, sigue siendo una pequeña fracción de los costes de infraestructura.

Tom abrió la consola y lo habilitó.

«Estará bien», dijo Leo. «Es solo monitoreo. No es como si fuera a romper algo.»

«Ya lo desplegué», añadió Leo — y luego revisó el panel de GuardDuty. «Oh. Solo hallazgos de muestra. Los reales tardan un rato.»

«GuardDuty necesita tiempo para construir una línea base de cómo se ve lo normal», dijo Priya. «Dale un par de días. El primer hallazgo real llegará — siempre lo hacen.»

Resultó que tenía razón sobre eso. Pero el primer hallazgo es una historia para el final de este capítulo.

**Conectando los Tres Servicios**

Shield, WAF y GuardDuty trabajan en diferentes capas y se complementan entre sí:

| Servicio   | Capa                              | Protege Contra                              | Acción                                        |
|------------|-----------------------------------|---------------------------------------------|-----------------------------------------------|
| AWS Shield | Red/Transporte (L3/L4)            | Inundaciones DDoS                           | Absorbe/mitiga los ataques                    |
| AWS WAF    | Aplicación (L7)                   | OWASP Top 10, bots, scrapers                | Permite, bloquea o cuenta las solicitudes     |
| GuardDuty  | Comportamental (todos los logs)   | Anomalías, credenciales comprometidas, malware | Detecta y alerta                           |

Shield detiene la inundación. WAF filtra el agua. GuardDuty vigila la fontanería en busca de patrones de flujo inusuales. Macie audita lo que está almacenado en los depósitos. Security Hub es la sala de control donde todos los paneles son visibles a la vez.

El modo de fallo de cada uno explica por qué los necesitas todos:

- Una inundación SYN de 50 Gbps no es una solicitud web. WAF no puede inspeccionarla. GuardDuty podría notar los eventos de CloudTrail asociados. Shield la detiene.
- Una sola solicitud de inyección SQL no es una inundación. Shield la ignora. GuardDuty no conoce el contenido de las solicitudes HTTP. WAF la atrapa.
- Un usuario legítimo de AWS usando sus propias credenciales para exfiltrar datos lentamente — sin DDoS, sin inyección, HTTP válido — Shield y WAF no ven nada inusual. GuardDuty nota que las credenciales se están usando desde un nuevo país a las 3 AM.
- Un desarrollador que sube accidentalmente datos de clientes a un bucket de acceso público no genera ningún comportamiento anómalo en absoluto. GuardDuty no tiene nada que marcar. Macie escanea el bucket y encuentra la PII.

Cada servicio tiene un punto ciego. La combinación cubre esos puntos ciegos.

**CloudTrail: La Fundación**

Los tres servicios dependen de los registros. **AWS CloudTrail** es el servicio de registro que captura cada llamada a la API en tu cuenta de AWS — quién llamó qué, cuándo, desde dónde y con qué resultado.

CloudTrail está habilitado por defecto para un historial de 90 días en la consola. Para retener los registros a largo plazo:

1. Crea un trail que escriba en un bucket de S3
2. Opcionalmente, envía a CloudWatch Logs para alertas en tiempo real
3. Habilita la validación de archivos de registro (para detectar si los registros son manipulados)

GuardDuty, AWS Config, Security Hub e IAM Access Analyzer leen todos de CloudTrail. Sin registros de CloudTrail, estos servicios no tienen nada que analizar.

«¿Qué pasa si alguien intenta deshabilitar CloudTrail?» preguntó Priya. «Si un atacante obtiene acceso de administrador, su primera acción podría ser deshabilitar el registro — cubrir sus huellas.»

«Eso es lo que previene la SCP del Capítulo 14», dijo Leo. «Nadie en esta cuenta puede deshabilitar CloudTrail, ni siquiera los administradores.»

«¿Y si de alguna manera lo hicieran?»

«Security Hub generaría un hallazgo. CloudTrail envía una notificación a SNS en los cambios de configuración. Recibimos una alerta en dos minutos de cualquier modificación de CloudTrail.»

«Y GuardDuty marcaría la llamada a la API», añadió Rafael, «como una acción de IAM inusual — deshabilitar el registro no es una actividad operativa normal.»

Múltiples capas de detección para una de las acciones de seguridad más críticas: la manipulación de registros. Esto no fue un accidente. Priya lo había diseñado deliberadamente.

«La defensa en profundidad aplica también a la capa de monitoreo», dijo. «No solo a la capa de aplicación.»

**Amazon Macie: Datos Sensibles en S3**

«¿Hemos pensado en lo que pasa si alguien sube accidentalmente un archivo con números de tarjetas de crédito de clientes a S3?» preguntó Priya. «No maliciosamente — solo un desarrollador exportando datos para depuración y subiendo el archivo equivocado?»

«Nunca lo sabríamos», dijo Leo.

«Exactamente. A menos que tengamos Macie.»

**Amazon Macie** es un servicio de seguridad de datos que usa aprendizaje automático para descubrir y proteger automáticamente datos sensibles en S3. Escanea continuamente los buckets de S3 e identifica:

- PII (Información de Identificación Personal): nombres, direcciones de correo electrónico, números de teléfono, fechas de nacimiento
- Datos financieros: números de tarjetas de crédito, números de cuentas bancarias
- Credenciales: contraseñas, claves de acceso, claves privadas incrustadas en archivos
- Información de salud: registros de pacientes, diagnósticos

Macie genera hallazgos cuando detecta datos sensibles en lugares donde no deberían estar — o cuando los buckets de S3 tienen configuraciones de acceso demasiado permisivas.

«¿Esto es lo mismo que GuardDuty?» preguntó Maya.

«Propósito diferente», dijo Priya. «GuardDuty vigila el comportamiento — qué acciones se están tomando, si esas acciones parecen anómalas. Macie vigila los datos — qué contenido está almacenado, si ese contenido es sensible. GuardDuty marcaría una instancia de EC2 haciendo llamadas a la API inusuales. Macie marcaría un bucket de S3 que contiene números de tarjetas de crédito.»

«Así que GuardDuty es el analista de comportamiento», dijo Leo, «y Macie es el auditor de datos.»

«Exactamente. Necesitas ambos. Un atacante que exfiltra datos a través de una llamada a la API de apariencia legítima podría ser marcado por GuardDuty por el patrón de API inusual. Pero si un empleado sube un archivo con 10.000 registros de clientes a un bucket de desarrollo, no hay comportamiento anómalo que detectar — solo datos sensibles en el lugar equivocado. Macie atrapa eso.»

Para Nimbus, el valor más inmediato de Macie estuvo en el bucket `nimbus-debug-exports` — un bucket que los desarrolladores usaban para volcar datos para depuración. Macie encontró tres archivos que contenían historiales de pedidos con nombres de clientes y direcciones de entrega. No datos de pago, pero datos personales que no deberían haber estado en un bucket de desarrollo sin cifrar.

Los archivos fueron eliminados. Se añadió una política: el bucket de depuración se restringió solo a datos de prueba sintéticos. Los datos reales de clientes requerían la aprobación de Priya para exportarse a cualquier entorno fuera de producción.

«¿Cuánto cuesta eso al mes?» preguntó Tom.

Macie cobra según el número de buckets de S3 evaluados por mes y el volumen de datos escaneados. Para una startup con un número moderado de buckets, aproximadamente $10-50 al mes. Gratis durante los primeros 30 días.

Tom lo habilitó antes del almuerzo.

---

**AWS Security Hub: El Panel de Control**

Si estás ejecutando múltiples cuentas de AWS o necesitas una vista consolidada de los hallazgos de seguridad, **AWS Security Hub** agrega los hallazgos de GuardDuty, Inspector (evaluación de vulnerabilidades), Macie (privacidad de datos), Config y Firewall Manager en un único panel de control.

También verifica tu configuración según las mejores prácticas de seguridad (el estándar de Mejores Prácticas de Seguridad Fundamentales de AWS) y el CIS AWS Foundations Benchmark.

Security Hub es la respuesta a «¿cómo veo todos mis hallazgos de seguridad en un solo lugar sin cambiar entre cinco consolas diferentes?». Cuando GuardDuty genera un hallazgo, aparece en GuardDuty y en Security Hub. Cuando Macie encuentra datos sensibles en un bucket de S3, aparece en Macie y en Security Hub. Cuando una regla de Config detecta una mala configuración, aparece en Config y en Security Hub.

Para un equipo de una sola cuenta, Security Hub añade un valor marginal — es otra consola que revisar. Su poder emerge a escala: tres cuentas, diez cuentas, cincuenta cuentas. Todos los hallazgos de todas las cuentas se agregan en el Security Hub de una cuenta de gestión. Un equipo monitorea un panel. Un conjunto de alertas. Sin revisión de registros cuenta por cuenta.

Para Nimbus: Security Hub todavía no era necesario. Cuando crecieran a tres cuentas (dev, staging, producción), se volvería esencial.

«Configúralo ahora», dijo Soo-Jin, en su tercera semana. «Lleva quince minutos habilitarlo. Lleva tres meses desear haberlo hecho antes.»

Lo habilitaron.

**Amazon Inspector: Evaluación de Vulnerabilidades**

Una semana después de habilitar Macie, se publicó un CVE para la versión de OpenSSL que se ejecutaba en toda la flota de producción de Nimbus. Priya leyó el aviso mientras tomaba café.

«Necesitamos saber cuáles de nuestras instancias están afectadas», dijo.

«Puedo ejecutar un escaneo manual», dijo Leo.

«¿Para nueve instancias, claro. ¿Para noventa? ¿Para contenedores?» Priya abrió la consola de Inspector. «Para esto es Inspector.»

**Amazon Inspector** es un servicio automatizado de evaluación de vulnerabilidades. Donde GuardDuty vigila el comportamiento — lo que tu infraestructura está haciendo ahora mismo — Inspector mira lo que está presente que podría ser explotado.

- **Instancias de EC2:** Inspector escanea el sistema operativo y los paquetes instalados contra la NVD (Base de Datos Nacional de Vulnerabilidades) — el catálogo autoritativo de CVEs conocidos. Si estás ejecutando OpenSSL 1.1.1 y un CVE apunta a esa versión, Inspector lo marca.
- **Imágenes de contenedores de ECR:** Inspector escanea las imágenes de contenedores en Elastic Container Registry antes de que se desplieguen. Un paquete vulnerable en una imagen base aparece como un hallazgo antes de que el contenedor se ejecute jamás en producción.
- **Paquetes de funciones de Lambda:** Inspector analiza las dependencias incluidas en tus funciones de Lambda — paquetes de Python, módulos de Node, dependencias de Java — en busca de vulnerabilidades conocidas.

La diferencia crítica respecto a un escaneo único: Inspector se ejecuta **continuamente**. No solo comprueba tus instancias una vez cuando lo habilitas y las declara limpias. Cuando se publica un nuevo CVE, Inspector reevalúa automáticamente tus recursos existentes contra la nueva vulnerabilidad. Cuando una instancia de EC2 cambia — nuevo paquete instalado, AMI actualizada — Inspector la reescanea. La flota de EC2 de Priya fue marcada por el CVE de OpenSSL en minutos tras habilitar Inspector, no porque ella le pidiera que escaneara, sino porque eso es lo que hace.

Los hallazgos tienen una calificación de severidad: Crítico, Alto, Medio, Bajo, Informativo. Fluyen a Security Hub junto a los hallazgos de GuardDuty y Macie. Un panel. Las tres lentes.

«Tres instancias afectadas», dijo Leo, leyendo los hallazgos de Inspector. «Las otras seis están en una versión parcheada.»

«Parchea esas tres esta semana», dijo Priya.

«¿Y las imágenes de contenedores?»

Priya miró los hallazgos de ECR de Inspector. Dos imágenes base en su registro de contenedores tenían vulnerabilidades conocidas — versiones más antiguas de paquetes que desde entonces habían sido parcheadas. Las marcó para reconstrucción.

«Lo importante», dijo Priya, «es que encontramos esto antes de que fuera explotado. No después.»

**El Modelo de las Tres Lentes**

GuardDuty, Inspector y Macie cada uno vigila algo diferente:

- **GuardDuty** es comportamental. Pregunta: *¿qué está pasando ahora mismo que parece mal?* Llamadas a la API desde ubicaciones inesperadas, instancias de EC2 contactando servidores de comando y control, credenciales usadas a horas inusuales. Atrapa amenazas activas y anomalías.
- **Inspector** es estructural. Pregunta: *¿qué está presente en nuestro entorno que podría ser explotado?* Paquetes sin parchear, dependencias vulnerables, runtimes desactualizados. Atrapa las condiciones que hacen posibles los ataques.
- **Macie** es sobre los datos. Pregunta: *¿qué información sensible está en nuestros buckets de S3 que no debería estar ahí?* PII, registros financieros, credenciales dejadas en archivos. Atrapa la exposición que no genera ningún comportamiento anómalo — solo datos en el lugar equivocado.

Un compromiso que involucra un CVE conocido podría aparecer en los tres: Inspector habría marcado la vulnerabilidad antes del ataque. GuardDuty marcaría el comportamiento anómalo durante el ataque. Macie marcaría los datos exfiltrados después de que aterrizaran en S3.

Tres lentes diferentes, tres horizontes temporales diferentes, ninguno de ellos sustituto de los otros.

**AWS Network Firewall: El Inspector de Tráfico**

Un especialista más merece una mención antes de cerrar la caja de herramientas. Los grupos de seguridad y las NACLs (Capítulo 15) filtran el tráfico por IP, puerto y protocolo — pueden decir *quién* puede hablar con *qué*, pero no pueden mirar dentro de la conversación. **AWS Network Firewall** es un cortafuegos gestionado y stateful que despliegas a nivel de VPC. Realiza inspección profunda de paquetes: filtrado por nombre de dominio (permitir la salida solo a `*.eatnimbus.com` y a tus repositorios de paquetes), bloqueo de tráfico que coincide con firmas de intrusión (IDS/IPS, compatible con reglas de Suricata), e inspección de flujos que los grupos de seguridad simplemente dejarían pasar porque el número de puerto parecía correcto.

«Así que es un grupo de seguridad con cerebro», dijo Leo.

«Es el dispositivo que comprarías a un proveedor de cortafuegos», dijo Priya, «excepto gestionado, con autoescalado, y desplegado en su propia subred para que todo el tráfico que entra y sale de la VPC pase por él.»

Señales del examen: «inspeccionar o filtrar tráfico por nombre de dominio o carga útil», «detección/prevención de intrusiones (IDS/IPS) para una VPC», o «filtrado de salida centralizado para el tráfico saliente» → Network Firewall. Los grupos de seguridad y las NACLs son la respuesta para permitir/denegar a nivel de instancia y de subred por puerto e IP; Network Firewall es la respuesta cuando la pregunta exige inspección *dentro* del tráfico. Y cuando la pregunta es cómo gestionar las reglas de WAF, Shield Advanced, los grupos de seguridad *y* las políticas de Network Firewall de forma consistente en muchas cuentas — eso es **AWS Firewall Manager**, la capa de administración de políticas que está encima.

## Fortalezas y Limitaciones

**AWS Shield**:

- Standard: gratuito y automático — no hay razón para no usarlo
- Advanced: excelente para objetivos de alto perfil; costoso para equipos pequeños
- Standard absorbe los ataques de capa 3/4 (inundaciones SYN, inundaciones UDP, amplificación de DNS) automáticamente
- Advanced agrega protección de capa 7, notificaciones en tiempo real y el Equipo de Respuesta de Shield

**AWS WAF**:

- Los grupos de reglas administradas simplifican significativamente la configuración — protección del OWASP Top 10 con unos pocos clics
- Las reglas personalizadas requieren comprensión de los patrones de ataque HTTP
- La limitación de velocidad es una característica poderosa que a menudo se pasa por alto — efectiva contra scrapers y fuerza bruta
- WAF no es un sustituto del código de aplicación seguro — es una capa de defensa en profundidad
- Empieza en modo Count, valida, luego cambia a Block

**GuardDuty**:

- Extremadamente fácil de habilitar (pocos clics, prueba gratuita de 30 días)
- Los hallazgos requieren revisión y respuesta humana — GuardDuty detecta, no corrige
- Ocurren falsos positivos — algunas actividades legítimas parecen anómalas para los modelos de ML
- Los niveles de severidad (Bajo/Medio/Alto) ayudan a priorizar la respuesta
- Se integra con Security Hub, EventBridge y Lambda para flujos de respuesta automatizada

**Amazon Inspector**:

- Escaneo de vulnerabilidades continuo y automatizado — no una comprobación única
- Reescanea automáticamente cuando se publican nuevos CVEs o cuando los recursos cambian
- Cubre instancias de EC2 (paquetes del SO y de la aplicación), imágenes de contenedores de ECR y paquetes de funciones de Lambda
- Los hallazgos fluyen a Security Hub; las calificaciones de severidad ayudan a priorizar el parcheo
- No bloquea ataques — saca a la luz las condiciones que hacen posibles los ataques

**Amazon Macie**:

- Descubre automáticamente datos sensibles (PII, credenciales, datos financieros) en S3
- Atrapa la exposición de datos que no tiene patrón de comportamiento anómalo — GuardDuty la pasaría por alto
- Prueba gratuita de 30 días; paga por bucket por mes después de eso
- Más valioso para equipos con muchos buckets de S3 y niveles de sensibilidad variables

**AWS Security Hub**:

- Agrega los hallazgos de GuardDuty, Macie, Inspector, Config y Firewall Manager
- Verifica la configuración contra los benchmarks de seguridad (CIS, NIST, PCI-DSS)
- Más valioso a escala multicuenta
- Habilítalo temprano, aunque solo tengas una cuenta — el historial de hallazgos es acumulativo

## Resumen

Cinco servicios, cinco capas. Cada uno aborda un tipo diferente de amenaza — y ninguno de ellos reemplaza a los otros. Un ataque DDoS sortea WAF y GuardDuty. Un intento de inyección SQL sortea Shield. Una credencial comprometida usada lenta y cuidadosamente podría sortear Shield y WAF por completo — pero GuardDuty verá la anomalía. Un desarrollador que sube accidentalmente PII de clientes a un bucket de S3 de depuración sortea los tres — pero Macie la atrapa.

- **AWS Shield Standard**: Protección DDoS gratuita y automática en la capa 3/4. Siempre activo. Absorbió la inundación SYN de 50 Gbps antes de que llegara al balanceador de carga de Nimbus.
- **AWS Shield Advanced**: Protección DDoS premium con acceso al SRT y protección de costes. Caso de uso empresarial.
- **AWS WAF**: Cortafuegos de capa de aplicación. Inspecciona y filtra solicitudes HTTP. Se adjunta a CloudFront, ALB o API Gateway. Usa los Grupos de Reglas Administradas para la protección del OWASP Top 10. Reglas basadas en velocidad para la defensa contra scrapers.
- **Amazon GuardDuty**: Detección de amenazas de comportamiento. Fuentes de datos principales: eventos de CloudTrail, VPC Flow Logs y registros DNS. Las protecciones extendidas opcionales agregan eventos de S3, monitoreo en tiempo de ejecución de EKS/ECS, eventos de inicio de sesión de RDS y actividad de red de Lambda. Genera hallazgos categorizados para actividades anómalas. Cinco tipos clave de hallazgo: UnauthorizedAccess (inicio de sesión en consola), CryptoCurrency (minería), Recon (sondeo de puertos), Trojan (tráfico C2), Policy (mala configuración de S3).
- **Amazon Inspector**: Evaluación automatizada de vulnerabilidades. Escanea instancias de EC2, imágenes de contenedores de ECR y paquetes de funciones de Lambda en busca de CVEs conocidos. Se ejecuta continuamente y reevalúa cuando se publican nuevas vulnerabilidades. Los hallazgos fluyen a Security Hub.
- **Amazon Macie**: Descubrimiento de datos sensibles en S3. Detecta PII, credenciales y datos financieros. Atrapa la exposición que no tiene patrón de comportamiento anómalo.
- **AWS Security Hub**: Agrega los hallazgos de todos los servicios de seguridad en un solo panel. Permite el monitoreo centralizado a través de múltiples cuentas.
- **CloudTrail**: La base de todo el registro de seguridad de AWS. Habilita un trail que escriba en S3 para la retención a largo plazo. Cada servicio de seguridad lee de él.

## Consejos para el Examen

*Dominio SAA-C03: Diseñar Arquitecturas Seguras (Dominio 1, Tarea 1.2)*

- **Shield Standard vs Advanced**: Standard es gratuito y automático. Advanced cuesta dinero y agrega el SRT, protección de costes y mejor detección. Señales del examen para Advanced: «DDoS a gran escala», «garantía de SLA durante ataques», «protección financiera contra picos de costes relacionados con DDoS».
- **Señales de caso de uso de WAF**: «bloquear inyección SQL», «bloquear secuencias de comandos entre sitios», «limitar velocidad de llamadas a la API», «bloquear agentes de usuario específicos», «protección del OWASP Top 10» → WAF.
- **Señales de GuardDuty**: «detectar actividad inusual de API», «identificar credenciales comprometidas», «marcar conexiones de red anómalas de EC2», «inteligencia de amenazas» → GuardDuty.
- **Adjunto de WAF**: Puede adjuntarse a CloudFront (global), ALB (regional), API Gateway (regional), AppSync.
- **Fuentes de datos de GuardDuty**: Tres fuentes principales — eventos de CloudTrail, VPC Flow Logs, registros DNS. Las fuentes opcionales extendidas incluyen eventos de datos de S3, registros de auditoría de EKS, eventos de inicio de sesión de RDS, actividad de red de Lambda y runtime de ECS. El examen puede preguntar qué fuente de datos es relevante para un escenario de detección específico: «inicios de sesión anómalos en RDS» → Protección de RDS de GuardDuty; «amenazas en tiempo de ejecución de contenedores» → Monitoreo en Tiempo de Ejecución de EKS/ECS de GuardDuty.
- **Macie vs GuardDuty**: Este es un distractor común del examen. **Macie** usa ML para detectar datos sensibles en S3 (PII, credenciales, datos financieros). **GuardDuty** detecta amenazas y anomalías en el comportamiento. Macie es sobre el contenido. GuardDuty es sobre el comportamiento.
- **Inspector vs. GuardDuty vs. Macie:** Tres lentes diferentes, ninguna sustituyendo a las otras. **Inspector** = escaneo de vulnerabilidades — CVEs en instancias de EC2, imágenes de contenedores en ECR y paquetes de funciones de Lambda. Se ejecuta continuamente y reescanea cuando se publican nuevos CVEs. **GuardDuty** = detección de amenazas de comportamiento — qué está pasando ahora mismo que parece anómalo. **Macie** = descubrimiento de datos sensibles en S3 — PII, credenciales y datos financieros que no deberían estar ahí. Desencadenante del examen: «identificar vulnerabilidades sin parchear en EC2» o «escanear imágenes de contenedores en busca de CVEs» → Inspector. «Detectar llamadas a la API inusuales o credenciales comprometidas» → GuardDuty. «Encontrar PII o datos sensibles en S3» → Macie.
- **Security Hub**: Agrega los hallazgos de seguridad de múltiples servicios y cuentas. Escenario del examen: «la empresa tiene múltiples cuentas de AWS y quiere una vista única de todos los hallazgos de seguridad» → Security Hub.
- **Reglas basadas en velocidad en WAF**: Usadas para limitar las solicitudes por IP dentro de una ventana de tiempo. Diferentes del Conjunto de Reglas Core (que coincide con patrones de ataque). El examen usa las reglas basadas en velocidad para «prevenir intentos de inicio de sesión por fuerza bruta» o «mitigar el raspado».
- **CloudTrail + GuardDuty + Security Hub**: Estos tres juntos forman el núcleo de la observabilidad de seguridad de AWS. Habilita CloudTrail primero (GuardDuty y Security Hub dependen de él), luego GuardDuty, luego Security Hub para agregar los hallazgos.

## Ejercicios

**Ejercicio 1 — Recordar**

Explica la diferencia entre AWS WAF y Amazon GuardDuty. ¿Contra qué protege cada servicio y en qué capa opera cada uno?

*(Pista: Piensa en WAF como un filtro en las solicitudes entrantes y en GuardDuty como un analista de comportamiento que vigila tus registros.)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: El sitio web de una empresa minorista está siendo atacado por una botnet que envía millones de solicitudes por hora a su API de búsqueda de productos. Las solicitudes parecen legítimas (cadenas de User-Agent válidas, cookies de sesión válidas) pero no resultan en compras — están raspando precios de productos. El ataque está causando que los clientes legítimos experimenten tiempos de respuesta lentos.

¿Qué combinación de servicios aborda MEJOR esta amenaza?

A) AWS WAF con reglas de limitación de velocidad y CloudFront  
B) AWS Shield Advanced y CloudFront  
C) Amazon GuardDuty y AWS Shield Standard  
D) ACLs de red que bloquean los rangos de IP de la botnet

**Pista 1**: Las solicitudes son de nivel HTTP (capa de aplicación). ¿Qué servicio opera en la capa HTTP?

**Pista 2**: Las botnets usan muchas direcciones IP diferentes — bloquear rangos de IP específicos en la NACL es ineficaz contra botnets grandes.

**Pista 3**: La limitación de velocidad por dirección IP puede ralentizar el raspado aunque no puedas bloquearlo completamente.

**Respuesta**: A

**Explicación**: AWS WAF puede limitar la velocidad de las solicitudes por dirección IP, reduciendo el impacto del raspado de alto volumen desde cualquier fuente individual. CloudFront distribuye el tráfico entrante a través de la red de borde de AWS, absorbiendo el volumen y protegiendo el origen. Las reglas de WAF también pueden coincidir con patrones de solicitudes (solicitudes secuenciales rápidas al mismo endpoint de la API) para identificar el comportamiento de raspado.

**¿Por qué no B?** Shield Advanced protege contra inundaciones DDoS (capa 3/4). El escenario describe un raspado a nivel de aplicación (solicitudes HTTP de capa 7), que Shield no inspecciona.

**¿Por qué no C?** GuardDuty detecta anomalías en el comportamiento de tu cuenta de AWS — no bloquea las solicitudes HTTP entrantes. Shield Standard no maneja los ataques a nivel de aplicación.

**¿Por qué no D?** Las botnets grandes usan miles de direcciones IP de fuentes distribuidas. Bloquear rangos específicos es un enfoque tipo «juego del topo» que falla contra botnets sofisticadas.

*Dominio SAA-C03: Diseñar Arquitecturas Seguras — Tarea 1.2*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus está considerando su modelo de amenazas al prepararse para gestionar datos de tarjetas de crédito. Una revisión de cumplimiento PCI-DSS requiere:

- Protección contra ataques DDoS de capa de red
- Filtrado de capa de aplicación para exploits web conocidos
- Registro de todas las llamadas a la API en un almacén de evidencia a prueba de manipulación y de largo plazo
- Detección de patrones de acceso inusuales al servicio de pago

Mapea cada requisito a un servicio o configuración específica de AWS. ¿Es suficiente Shield Standard, o el contexto PCI-DSS sugiere Advanced? ¿Dónde adjuntarías WAF?

*(No existe una única respuesta correcta. El objetivo es practicar la asignación de requisitos de cumplimiento a servicios de AWS.)*

## Escena Post-Créditos

GuardDuty fue habilitado.

Cuarenta y ocho horas después, generó su primer hallazgo: *«La instancia de EC2 i-0abc123 se está comunicando con un nodo de salida de Tor conocido.»*

Leo miró el ID de la instancia.

«Esa es la instancia de monitoreo interno», dijo. «La que configuré para ejecutar diagnósticos de red.»

«¿Se supone que debe comunicarse con nodos de salida de Tor?»

«No.» Hizo una pausa. «¿Por qué lo haría?»

Abrió la instancia. Alguien había instalado una herramienta en ella — un escáner de red de código abierto legítimo que, resultó ser, también se comunicaba con la infraestructura de Tor para la recolección anónima de datos.

«Entonces la herramienta estaba llamando a casa», dijo Priya.

«Sin mi conocimiento», confirmó Leo.

«Eso es un riesgo de la cadena de suministro. Una dependencia que hace cosas que no autorizaste.»

Leo desinstaló la herramienta. Estableció un proceso para revisar cada herramienta de terceros antes de su instalación.

«¿Es este el nivel de paranoia al que hemos llegado ahora?» preguntó Maya.

«Sí», dijo Priya.

«¿Es este el nivel al que siempre deberíamos haber estado?» preguntó Maya.

«También sí», dijo Priya.

En el próximo capítulo: qué pasa cuando el centro de datos en Oregón desaparece — y por qué Nimbus sigue funcionando.
