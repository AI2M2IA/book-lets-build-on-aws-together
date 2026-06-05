# Capítulo 17: Los Vigilantes

El incidente con la IP rumana había quedado contenido. Los secretos estaban en Secrets Manager. Las credenciales habían sido rotadas. Los controles de red habían sido reforzados.

Pero Priya había hecho la pregunta que cerró el Capítulo 16: "Si apareciera algo inusual en CloudTrail, ¿cómo lo sabríamos?"

La respuesta honesta era: probablemente no lo sabrían.

CloudTrail registra miles de eventos por día. Ningún humano los lee todos. Priya los revisaba manualmente cada semana, pero eso significaba que algo podría ocurrir un martes y no ser detectado hasta el lunes siguiente.

"Necesitamos algo que vigile los registros por nosotros", dijo.

Maya levantó la vista. "¿Automáticamente?"

"Automáticamente."

La segunda pregunta de Tom del día: "¿Cuánto cuesta eso?"

**Tres Categorías de Amenazas**

Las amenazas de seguridad contra una aplicación en la nube generalmente se dividen en tres categorías:

**Ataques de volumen (DDoS)**: Un atacante envía tanto tráfico que tu aplicación no puede responder a los usuarios legítimos. El ataque puede ser millones de solicitudes HTTP, o una avalancha de paquetes TCP SYN diseñados para agotar la tabla de conexiones de tu servidor.

**Ataques a aplicaciones (Exploits)**: Un atacante envía solicitudes específicamente elaboradas para explotar debilidades en tu aplicación: inyección SQL, secuencias de comandos entre sitios, entradas malformadas que hacen colapsar un analizador.

**Anomalías de comportamiento (Reconocimiento y compromiso)**: Llamadas a la API que no deberían estar ocurriendo (alguien consultando toda tu base de datos de usuarios a las 3 AM), actividad inusual de IAM (credenciales usadas desde un nuevo país) o tráfico de red hacia destinos inesperados.

AWS tiene un servicio dedicado para cada uno:

- **AWS Shield**: Protección contra DDoS
- **AWS WAF**: Protección a nivel de aplicación
- **Amazon GuardDuty**: Detección de amenazas de comportamiento

**AWS Shield: El Absorbedor de DDoS**

**AWS Shield Standard** está habilitado automáticamente para todos los clientes de AWS sin cargo adicional. Protege contra los ataques DDoS más comunes de capa 3 (red) y capa 4 (transporte): inundaciones SYN, inundaciones UDP, ataques de amplificación de DNS.

CloudFront, Route 53 y Elastic Load Balancing se sitúan en el borde de la red de AWS. Cuando un ataque DDoS apunta a tu aplicación, primero llega a estos servicios gestionados. La infraestructura de red de AWS absorbe el ataque antes de que llegue a tus instancias de EC2.

**AWS Shield Advanced** es el nivel premium ($3.000/mes por organización). Agrega:

- Protección para EC2, ELB, CloudFront, Global Accelerator y Route 53
- Notificaciones de ataques casi en tiempo real
- Acceso al Equipo de Respuesta de AWS Shield (SRT): ingenieros de seguridad que pueden ayudarte a responder a los ataques
- Protección de costos: si un ataque hace que tu factura se dispare, AWS acredita los costos del pico
- Detección y mitigación mejorada de DDoS en la capa 7 (capa de aplicación)

"¿Tres mil dólares al mes?", dijo Tom.

"Para empresas que manejan millones en ingresos, un DDoS que las deja fuera de servicio durante dos horas cuesta más de tres mil dólares", dijo Priya.

Tom hizo el cálculo en silencio.

"Empecemos con Standard", dijo finalmente.

**AWS WAF: El Filtro de Aplicaciones**

**AWS WAF (Web Application Firewall)** opera a nivel HTTP: inspecciona el contenido de las solicitudes web antes de que lleguen a tu aplicación.

WAF se configura con **ACL Web (Listas de Control de Acceso)**: conjuntos de reglas que definen qué permitir, bloquear o contar.

WAF puede adjuntarse a:

- Distribuciones de CloudFront (inspecciona las solicitudes en el borde, globalmente)
- Application Load Balancers (inspecciona las solicitudes a nivel regional)
- API Gateway
- AWS AppSync

**Reglas Administradas de WAF**: AWS y proveedores de terceros publican conjuntos de reglas preconstruidas:

- **Reglas Administradas de AWS - Conjunto de Reglas Core**: Protege contra las vulnerabilidades del OWASP Top 10 (inyección SQL, XSS, inyección de comandos, traversal de rutas, etc.)
- **Reglas Administradas de AWS - Entradas Maliciosas Conocidas**: Bloquea solicitudes que coinciden con patrones de ataque conocidos
- **Reglas Administradas de AWS - Lista de Reputación de IP de Amazon**: Bloquea IPs conocidas por estar asociadas con botnets y escáneres
- **Reglas Administradas de AWS - Control de Bots**: Identifica y gestiona el tráfico de bots

También puedes crear reglas personalizadas:

- "Bloquear cualquier solicitud con un encabezado User-Agent que contenga 'sqlmap'" (un escáner de inyección SQL común)
- "Limitación de velocidad: permitir no más de 1.000 solicitudes por IP por 5 minutos"
- "Bloquear solicitudes que contengan `<script>` en cualquier valor de parámetro"

Para Nimbus, la configuración práctica: WAF en la distribución de CloudFront con el Conjunto de Reglas Core habilitado. Esto bloquea los patrones de ataque más comunes antes de que las solicitudes lleguen jamás a las instancias de EC2.

**Amazon GuardDuty: El Analista de Comportamiento**

GuardDuty es fundamentalmente diferente de Shield y WAF. No bloquea ataques: **detecta comportamiento inusual**.

GuardDuty analiza continuamente:

- **Registros de AWS CloudTrail**: cambios de IAM, llamadas a la API, inicios de sesión en la consola
- **Registros de VPC Flow Logs**: patrones de tráfico de red dentro de tu VPC
- **Registros de consultas DNS**: qué están resolviendo tus instancias (el malware conocido a menudo resuelve dominios C2 específicos)

Los modelos de aprendizaje automático identifican patrones que se desvían de tu línea base. GuardDuty genera **hallazgos**: alertas categorizadas cuando detecta anomalías.

Ejemplos de lo que GuardDuty puede detectar:

- Un usuario de IAM que inicia sesión desde una dirección IP no reconocida (en un país que nunca ha usado antes)
- Llamadas a la API realizadas desde un nodo de salida de Tor
- Una instancia de EC2 comunicándose con un pool de minería de criptomonedas conocido
- Volumen de llamadas a la API inusualmente alto (abuso de credenciales o escaneo)
- Un bucket de S3 al que accede una dirección IP marcada por actividad maliciosa
- Tráfico saliente hacia un dominio conocido por estar asociado con comando y control de malware

"Esto es lo que habría detectado la IP rumana", dijo Leo en voz baja.

"Si hubiéramos tenido GuardDuty habilitado, habría marcado la instancia de EC2 haciendo conexiones salientes hacia una IP externa no reconocida a las 2 AM", confirmó Priya.

"¿Cuánto cuesta?"

El precio de GuardDuty se basa en el volumen de registros analizados: eventos de CloudTrail, datos de flujo de VPC, consultas DNS. Para una aplicación pequeña a mediana, típicamente $50-150/mes. A escala, sigue siendo una pequeña fracción de los costos de infraestructura.

Tom abrió la consola y lo habilitó.

**Conectando los Tres Servicios**

Shield, WAF y GuardDuty trabajan en diferentes capas y se complementan entre sí:

| Servicio   | Capa                              | Protege Contra                              | Acción                                        |
|------------|-----------------------------------|---------------------------------------------|-----------------------------------------------|
| AWS Shield | Red/Transporte (L3/L4)            | Inundaciones DDoS                           | Absorbe/mitiga los ataques                    |
| AWS WAF    | Aplicación (L7)                   | OWASP Top 10, bots, scrapers                | Permite, bloquea o cuenta las solicitudes     |
| GuardDuty  | Comportamental (todos los logs)   | Anomalías, credenciales comprometidas, malware | Detecta y alerta                           |

Shield detiene la inundación. WAF filtra el agua. GuardDuty vigila la fontanería para detectar patrones de flujo inusuales.

**CloudTrail: La Fundación**

Los tres servicios dependen de los registros. **AWS CloudTrail** es el servicio de registro que captura cada llamada a la API en tu cuenta de AWS: quién llamó qué, cuándo, desde dónde y con qué resultado.

CloudTrail está habilitado por defecto para un historial de 90 días en la consola. Para retener los registros a largo plazo:

1. Crea un trail que escriba en un bucket de S3
2. Opcionalmente, envía a CloudWatch Logs para alertas en tiempo real
3. Habilita la validación de archivos de registro (para detectar si los registros son manipulados)

GuardDuty, AWS Config y Security Hub leen todos de CloudTrail. Sin registros de CloudTrail, estos servicios no tienen nada que analizar.

**AWS Security Hub: El Panel de Control**

Si estás ejecutando múltiples cuentas de AWS o necesitas una vista consolidada de los hallazgos de seguridad, **AWS Security Hub** agrega los hallazgos de GuardDuty, Inspector (evaluación de vulnerabilidades), Macie (privacidad de datos), Config y Firewall Manager en un único panel de control.

También verifica tu configuración según las mejores prácticas de seguridad (el estándar de Mejores Prácticas de Seguridad Fundamentales de AWS) y el CIS AWS Foundations Benchmark.

Para Nimbus: Security Hub todavía no era necesario. Cuando crecieran a tres cuentas (desarrollo, staging, producción), se volvería útil.

## Fortalezas y Limitaciones

**AWS Shield**:

- Standard: gratuito y automático: no hay razón para no usarlo
- Advanced: excelente para objetivos de alto perfil; costoso para equipos pequeños

**AWS WAF**:

- Los grupos de reglas administradas simplifican significativamente la configuración
- Las reglas personalizadas requieren comprensión de los patrones de ataque HTTP
- La limitación de velocidad es una característica poderosa que a menudo se pasa por alto
- WAF no es un sustituto del código de aplicación seguro: es una capa de defensa en profundidad

**GuardDuty**:

- Extremadamente fácil de habilitar (pocos clics)
- Los hallazgos requieren revisión y respuesta humana: GuardDuty detecta, no corrige
- Ocurren falsos positivos: algunas actividades legítimas parecen anómalas para los modelos de ML
- Prueba gratuita de 30 días: vale la pena habilitarlo de inmediato

## Resumen

- **AWS Shield Standard**: Protección DDoS gratuita y automática en la capa 3/4. Siempre activo.
- **AWS Shield Advanced**: Protección DDoS premium con acceso al SRT y protección de costos. Caso de uso empresarial.
- **AWS WAF**: Cortafuegos de capa de aplicación. Inspecciona y filtra solicitudes HTTP. Se adjunta a CloudFront, ALB o API Gateway. Usa los Grupos de Reglas Administradas para la protección del OWASP Top 10.
- **Amazon GuardDuty**: Detección de amenazas de comportamiento. Analiza CloudTrail, VPC Flow Logs y registros DNS. Genera hallazgos para actividades anómalas.
- **CloudTrail**: La base de todo el registro de seguridad de AWS. Habilita un trail que escriba en S3 para la retención a largo plazo.
- Estos servicios se complementan entre sí: Shield en la capa de red, WAF en la capa de aplicación, GuardDuty en la capa de comportamiento.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas Seguras (Dominio 1, Tarea 1.2)*

- **Shield Standard vs Advanced**: Standard es gratuito y automático. Advanced cuesta dinero y agrega el SRT, protección de costos y mejor detección. Señales del examen para Advanced: "DDoS a gran escala", "garantía de SLA durante ataques", "protección financiera contra picos de costos relacionados con DDoS".
- **Señales de caso de uso de WAF**: "bloquear inyección SQL", "bloquear secuencias de comandos entre sitios", "limitar velocidad de llamadas a la API", "bloquear agentes de usuario específicos", "protección del OWASP Top 10" → WAF.
- **Señales de GuardDuty**: "detectar actividad inusual de API", "identificar credenciales comprometidas", "marcar conexiones de red anómalas de EC2", "inteligencia de amenazas" → GuardDuty.
- **Adjunto de WAF**: Puede adjuntarse a CloudFront (global), ALB (regional), API Gateway (regional), AppSync.
- **Fuentes de datos de GuardDuty**: Eventos de administración de CloudTrail, eventos de datos de S3 de CloudTrail, VPC Flow Logs, registros DNS. El examen puede preguntar qué fuente de datos es relevante para un escenario de detección específico.
- **Macie**: A menudo se confunde con GuardDuty. **Macie** usa ML para detectar datos sensibles en S3 (PII, credenciales, datos financieros). **GuardDuty** detecta amenazas y anomalías en el comportamiento. Diferentes casos de uso.

## Ejercicios

**Ejercicio 1 — Recuerdo**

Explica la diferencia entre AWS WAF y Amazon GuardDuty. ¿Contra qué protege cada servicio y en qué capa opera cada uno?

*(Pista: Piensa en WAF como un filtro en las solicitudes entrantes y en GuardDuty como un analista de comportamiento que vigila tus registros.)*

**Ejercicio 2 — Práctica para el Examen**

*Escenario*: El sitio web de una empresa minorista está siendo atacado por una botnet que envía millones de solicitudes por hora a su API de búsqueda de productos. Las solicitudes parecen legítimas (cadenas de User-Agent válidas, cookies de sesión válidas) pero no resultan en compras: están raspando precios de productos. El ataque está causando que los clientes legítimos experimenten tiempos de respuesta lentos.

¿Qué combinación de servicios aborda MEJOR esta amenaza?

A) AWS Shield Advanced y CloudFront  
B) AWS WAF con reglas de limitación de velocidad y CloudFront  
C) Amazon GuardDuty y AWS Shield Standard  
D) ACLs de red que bloquean los rangos de IP de la botnet

**Pista 1**: Las solicitudes son de nivel HTTP (capa de aplicación). ¿Qué servicio opera en la capa HTTP?

**Pista 2**: Las botnets usan muchas direcciones IP diferentes: bloquear rangos de IP específicos en la NACL es ineficaz contra botnets grandes.

**Pista 3**: La limitación de velocidad por dirección IP puede ralentizar el raspado aunque no puedas bloquearlo completamente.

**Respuesta**: B

**Explicación**: AWS WAF puede limitar la velocidad de las solicitudes por dirección IP, reduciendo el impacto del raspado de alto volumen desde cualquier fuente individual. CloudFront distribuye el tráfico entrante a través de la red de borde de AWS, absorbiendo el volumen y protegiendo el origen. Las reglas de WAF también pueden coincidir con patrones de solicitudes (solicitudes secuenciales rápidas al mismo endpoint de la API) para identificar el comportamiento de raspado.

**¿Por qué no A?** Shield Advanced protege contra inundaciones DDoS (capa 3/4). El escenario describe un raspado a nivel de aplicación (solicitudes HTTP de capa 7), que Shield no inspecciona.

**¿Por qué no C?** GuardDuty detecta anomalías en el comportamiento de tu cuenta de AWS: no bloquea las solicitudes HTTP entrantes. Shield Standard no maneja los ataques a nivel de aplicación.

**¿Por qué no D?** Las botnets grandes usan miles de direcciones IP de fuentes distribuidas. Bloquear rangos específicos es un enfoque tipo "juego del topo" que falla contra botnets sofisticadas.

*Dominio SAA-C03: Diseño de Arquitecturas Seguras — Tarea 1.2*

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

Cuarenta y ocho horas después, generó su primer hallazgo: *"La instancia de EC2 i-0abc123 se está comunicando con un nodo de salida de Tor conocido."*

Leo miró el ID de la instancia.

"Esa es la instancia de monitoreo interno", dijo. "La que configuré para ejecutar diagnósticos de red."

"¿Se supone que debe comunicarse con nodos de salida de Tor?"

"No." Hizo una pausa. "¿Por qué lo haría?"

Abrió la instancia. Alguien había instalado una herramienta en ella: un escáner de red de código abierto legítimo que, resultó ser, también se comunicaba con la infraestructura de Tor para la recolección anónima de datos.

"Entonces la herramienta estaba llamando a casa", dijo Priya.

"Sin mi conocimiento", confirmó Leo.

"Eso es un riesgo de la cadena de suministro. Una dependencia que hace cosas que no autorizaste."

Leo desinstalé la herramienta. Estableció un proceso para revisar cada herramienta de terceros antes de su instalación.

"¿Es este el nivel de paranoia al que hemos llegado ahora?", preguntó Maya.

"Sí", dijo Priya.

"¿Es este el nivel al que siempre deberíamos haber estado?", preguntó Maya.

"También sí", dijo Priya.

En el próximo capítulo: qué pasa cuando el centro de datos en Virginia desaparece, y por qué Nimbus sigue funcionando.
