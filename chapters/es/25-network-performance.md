# Capítulo 25: La Autopista Privada

Ponte de pie un momento. Sacude las manos.

Siente la distancia entre las puntas de tus dedos y algo al otro lado del país. Imagina enviar un mensaje que tiene que recorrer esa distancia, abrirse camino a través de una docena de traspasos entre operadores y volver antes de que puedas continuar trabajando. Ahora imagina hacer eso miles de veces por segundo.

Eso es lo que realmente es la transferencia de datos: distancia física, infraestructura física, restricciones físicas.

Vamos a hablar de mover datos. No entre servicios dentro de AWS, sino entre el mundo real y AWS: entre tu oficina y tu infraestructura en la nube, entre continentes.

---

Con la base de datos escalada y los costos de almacenamiento reducidos, Tom había pasado a la factura de redes. Pero Leo tenía un problema más inmediato: mover 4 terabytes de datos históricos de pedidos a AWS estaba exponiendo los límites de su conexión actual.

---

El equipo de infraestructura de Nimbus (ahora cuatro ingenieros) trabajaba desde una oficina compartida en Seattle. Necesitaban acceso a la infraestructura de AWS que gestionaban. Algunas operaciones requerían conectarse a recursos en la VPC.

Actualmente, usaban una VPN en sus portátiles para acceder al host bastión en la subred pública, y luego hacían SSH a los recursos desde allí.

Funcionaba. Era lento. La conexión VPN se enrutaba a través de la internet pública: Seattle → múltiples saltos entre operadores → us-west-2. Los viajes de ida y vuelta eran inconsistentes —de 30 a 80 milisegundos según la hora— y el rendimiento estaba limitado por el enlace ascendente de la oficina y la ruta pública.

"Para el SSH del día a día, eso es aceptable", dijo Leo. "Pero estamos a punto de empezar a mover nuestra base de datos de análisis. 4 terabytes de datos históricos de pedidos. Sobre esta conexión, la migración tomará semanas."

"Necesitamos una mejor conexión", dijo Maya.

"Una conexión privada", agregó Priya. "No a través de la internet pública. ¿Y qué pasa si alguien intenta entrar por la fuerza durante la transferencia de datos? 4TB de historial de pedidos sobre la internet pública —incluso cifrados— se siente como un objetivo."

Piénsalo como ir al trabajo. Una Site-to-Site VPN es como conducir por vías públicas: cierras las puertas de tu coche (cifrado), pero aún compartes carriles con todos los demás, y los atascos te ralentizan de forma impredecible. Direct Connect es como alquilar un carril privado dedicado en la autopista: sin tráfico compartido, velocidad consistente y un peaje mensual más alto. La mayoría de los días la vía pública está bien. Cuando estás moviendo un camión lleno de carga valiosa con un horario ajustado, pagas por el carril privado.

Snow Family es la opción que la mayoría de la gente no considera: fletar un avión de carga real. No siempre está disponible. No es lo correcto para cargas pequeñas. Pero para un camión completo, llega más rápido que conduciendo y no depende en absoluto de las condiciones de la autopista. La física no ha cambiado —sigues moviendo los mismos bits— pero el mecanismo es fundamentalmente diferente.

**AWS Site-to-Site VPN: La Opción Rápida**

**AWS Site-to-Site VPN** crea un túnel cifrado entre tu red on-premises y tu VPC, atravesando la internet pública.

Configuración:

1. Crea un Virtual Private Gateway (VGW) adjunto a tu VPC
2. Crea un Customer Gateway que represente tu router on-premises
3. Establece dos túneles VPN (para redundancia) entre ellos

El tráfico está cifrado (AES-256). Viaja sobre la internet pública, lo que significa que la latencia depende de las condiciones de internet. AWS proporciona dos túneles automáticamente para redundancia: si un túnel tiene problemas, el tráfico se desplaza al otro.

**Cuándo usar Site-to-Site VPN**:

- Configuración rápida (minutos a horas)
- Rentable ($0,05/hora por conexión VPN)
- Ancho de banda: hasta 1,25 Gbps por túnel
- Latencia de internet aceptable para el caso de uso

La **Site-to-Site VPN Acelerada** enruta el tráfico VPN sobre la red global de AWS en lugar de la internet pública: la misma optimización que proporciona Global Accelerator, aplicada a los túneles VPN. La latencia es más baja y más consistente que la VPN estándar. El costo es ligeramente mayor (se aplican los cargos de transferencia de datos de Global Accelerator). Para los equipos que quieren la configuración rápida y el menor costo de la VPN pero necesitan mejor latencia, la VPN Acelerada es el camino intermedio práctico entre la VPN estándar y Direct Connect.

Para la migración de 4TB de Nimbus, la VPN basada en internet a 1,25 Gbps máximo tomaría: 4TB / 1,25 Gbps ≈ 7 horas mínimo, con una sobrecarga del mundo real más cercana a 12-20 horas. Aceptable, pero la congestión en la ruta de la internet pública la hace impredecible.

Leo hizo las cuentas con más cuidado, porque el cálculo teórico y el tiempo de transferencia real nunca habían coincidido ni una sola vez en su experiencia.

**Teórico**: 4 TB = 4.096 GB = 32.768 Gb. A 1 Gbps: 32.768 segundos ≈ 9,1 horas. Redondeado a 9 horas.

**Real**: Leo había hecho una transferencia de prueba la semana anterior: 50 GB de la oficina de Seattle a S3. Tiempo teórico a su velocidad de subida medida (875 Mbps): 457 segundos. Tiempo real: 724 segundos. Factor de sobrecarga: 1,58.

Aplicado a la transferencia de 4TB a 875 Mbps de subida: 32.768 Gb / 0,875 Gbps × 1,58 de sobrecarga ≈ **59.200 segundos ≈ 16,4 horas**.

La sobrecarga venía de varias fuentes: el TCP slow-start al establecer la conexión, la pérdida de paquetes que requería retransmisión (la ruta pública de Seattle a us-west-2 promediaba un 0,2% de pérdida de paquetes —pequeña, pero multiplicativa sobre millones de paquetes—), la sobrecarga del handshake HTTPS para cada segmento de subida multiparte, y el tiempo de procesamiento para que S3 ensamblara las subidas multiparte.

"Dieciséis horas está bien para una migración única", dijo Leo. "El verdadero problema es si la transferencia se interrumpe en la hora 14."

La subida multiparte de S3 resuelve el problema de la interrupción: si la transferencia falla en la hora 14, solo la parte actual necesita volver a subirse. Las partes anteriores se almacenan en S3 y la transferencia puede reanudarse. Pero la sobrecarga de gestionar las subidas multiparte agregaba aproximadamente un 3% al tiempo total de transferencia.

La estimación final del mundo real: **unas 9 horas teóricas sobre internet de 1 Gbps, unas 17 horas reales**, teniendo en cuenta la velocidad de subida medida de 875 Mbps de su oficina, la sobrecarga por pérdida de paquetes y el procesamiento de subidas multiparte.

Leo consideró esto un momento. Luego miró la página de precios de Snow Family.

"¿Cuál es la otra opción?", preguntó Tom.

"Espera, pero *¿por qué* necesitaríamos algo más que una VPN?", preguntó Maya. "La migración de 4TB es un evento único."

"No lo es", dijo Priya. "Una vez que los datos están en AWS, el equipo todavía necesita acceder a ellos diariamente. Y la latencia de la VPN se acumula."

**AWS Direct Connect: La Línea Dedicada**

**AWS Direct Connect** establece una conexión de red privada y dedicada entre tu ubicación (o tu instalación de colocación) y AWS. El tráfico nunca toca la internet pública.

Direct Connect es una conexión física: una línea de fibra desde tu red hasta una ubicación de AWS Direct Connect. Trabajas con un proveedor de telecomunicaciones para establecer el circuito físico. AWS proporciona el puerto en su lado.

**Beneficios**:

- Latencia consistente y predecible (sin la variación de la internet pública)
- Velocidades de 50 Mbps a 100 Gbps (con puertos dedicados nativos de 400 Gbps en ubicaciones selectas desde 2024)
- Costos de transferencia de datos más bajos que internet (las tarifas de transferencia de datos de Direct Connect son más baratas que las tarifas estándar de salida de datos de AWS)
- Más seguro (circuito privado, no internet pública)

**Contrapartidas**:

- La configuración toma semanas a meses (aprovisionamiento de infraestructura física)
- Costo significativamente más alto que la VPN
- Sin redundancia integrada (tú estableces los circuitos redundantes)
- No es adecuado para oficinas geográficamente distribuidas sin múltiples circuitos

Quizás te preguntes: si Direct Connect es un cable de fibra física, ¿qué pasa si alguien lo corta accidentalmente? Ese es el problema del punto único de fallo con un solo circuito, por lo cual las configuraciones de Direct Connect de producción usan circuitos redundantes en rutas geográficamente separadas, o mantienen una VPN como respaldo. El cable puede cortarse; el negocio continúa.

"¿Cuánto cuesta eso al mes?", preguntó Tom. Ya lo había buscado. "Un puerto dedicado de 1Gbps son $216/mes", dijo. "Más el circuito desde nuestra oficina, que un operador cotizó en $800/mes."

"Así que unos mil al mes en total."

Para Nimbus: Direct Connect era excesivo para su tamaño actual. Pero para las empresas con volúmenes significativos de transferencia de datos o requisitos de cumplimiento para conexiones de red privadas, Direct Connect se paga solo.

**Conexiones Alojadas: El Punto Intermedio**

No toda organización puede comprometerse con un circuito de fibra dedicado de 100 Gbps. Las **Conexiones Alojadas de Direct Connect** permiten que los Socios de AWS Direct Connect (operadores de telecomunicaciones aprobados) aprovisionen conexiones de menos de 1Gbps que compartes con otros clientes.

La configuración es más rápida (días a semanas, no meses) y cuesta menos que una conexión dedicada. La contrapartida: la capacidad compartida significa un rendimiento menos consistente.

Para Nimbus (a medida que crece): una conexión alojada de 500 Mbps a través de un socio proporcionaría conectividad privada a un punto de precio razonable.

La diferencia práctica que importa en el examen: las Conexiones Alojadas están disponibles en velocidades de 50 Mbps a 10 Gbps (algunos socios ofrecen hasta 25 Gbps), aprovisionadas por un Socio de AWS. Las Conexiones Dedicadas van directamente a AWS y están disponibles a 1 Gbps, 10 Gbps y 100 Gbps (más 400 Gbps en ubicaciones selectas). Para velocidades inferiores a 1 Gbps, una Conexión Alojada es la única opción de Direct Connect: las Conexiones Dedicadas empiezan en un mínimo de 1 Gbps.

**AWS Transit Gateway: Hub-and-Spoke para VPCs**

A medida que Nimbus crecía, acumularía múltiples VPCs: la VPC de producción, la VPC de staging, la VPC de análisis, la VPC de herramientas de seguridad.

Sin una planificación cuidadosa, conectar estas VPCs requiere una malla completa de conexiones de VPC peering. Para 4 VPCs: 6 conexiones de peering. Para 10 VPCs: 45 conexiones de peering. Para 20 VPCs: 190 conexiones. Esto no escala.

**AWS Transit Gateway** es un hub de red que conecta múltiples VPCs y redes on-premises. En lugar de una malla de conexiones de peering, cada VPC se conecta al Transit Gateway. Transit Gateway enruta el tráfico entre ellas.

```
On-premises ──── Direct Connect ──┐
                                  │
VPC de Producción ─────────────── Transit Gateway
VPC de Staging ────────────────── Transit Gateway
VPC de Análisis ───────────────── Transit Gateway
VPC de Seguridad ──────────────── Transit Gateway
```

**Enrutamiento transitivo**: Si la VPC A y la VPC B se conectan ambas al Transit Gateway, pueden comunicarse, sin un peer directo. Transit Gateway maneja el enrutamiento. A diferencia del VPC peering (que no es transitivo), Transit Gateway habilita la topología hub-and-spoke.

**Costos de Transit Gateway**: se cobra por adjunto (VPC o conexión VPN/Direct Connect) más por GB de datos procesados. A escala, esto vale la simplicidad.

Para Nimbus, el evento desencadenante para Transit Gateway fue la adición de una cuarta VPC. Tenían: producción, staging, análisis y ahora herramientas de seguridad (una VPC para escaneo de vulnerabilidades y monitoreo de cumplimiento SOC2 que no debería estar en el mismo segmento de red que producción).

Sin Transit Gateway, conectar cuatro VPCs requiere seis conexiones de peering:
- Producción ↔ Staging
- Producción ↔ Análisis
- Producción ↔ Seguridad
- Staging ↔ Análisis
- Staging ↔ Seguridad
- Análisis ↔ Seguridad

Seis conexiones de peering, seis entradas de tabla de rutas por VPC, seis reglas de grupo de seguridad que revisar. Y el VPC peering no es transitivo: si Producción y Análisis están emparejados, y Análisis y Seguridad están emparejados, Producción no puede llegar a Seguridad a través de la VPC de Análisis. Necesitas el peering Producción ↔ Seguridad explícitamente.

Con Transit Gateway:

```
VPC de Producción  ──┐
VPC de Staging     ──┤──── Transit Gateway ────── On-premises (Direct Connect)
VPC de Análisis    ──┤
VPC de Seguridad   ──┘
```

Cuatro adjuntos. Una tabla de rutas que gestionar. Enrutamiento transitivo: Producción puede llegar a Seguridad a través de Transit Gateway sin un peer directo.

"¿Y qué pasa si alguien intenta entrar por la fuerza a través del Transit Gateway?", preguntó Priya. "Si las cuatro VPCs comparten un Transit Gateway, un recurso comprometido en la VPC de Staging podría llegar a Producción."

Transit Gateway admite **tablas de rutas con aislamiento**: puedes definir qué VPCs tienen permitido comunicarse a través del Transit Gateway y cuáles están aisladas. La VPC de herramientas de seguridad puede llegar a todas las demás (necesita escanearlas). Staging no puede llegar a Producción. Producción no puede llegar a Análisis directamente (Análisis consulta los datos a través de un endpoint específico de solo lectura).

"Un Transit Gateway", dijo Priya, "con políticas de enrutamiento que expresan el modelo de acceso real. Frente a seis conexiones de peering sin una manera centralizada de auditar qué llega a qué."

**VPC Endpoints: Acceso Privado a los Servicios de AWS**

Un problema sutil de costo y seguridad: cuando tu instancia de EC2 (en una subred privada) llama a la API de S3, ese tráfico se enruta a través del NAT Gateway (para llegar a internet, donde está el endpoint público de S3). Pagas por el procesamiento del NAT Gateway.

Los **VPC Endpoints** permiten que los recursos en tu VPC se comuniquen con los servicios de AWS de forma privada, sin pasar por la internet pública, y sin NAT Gateway.

Dos tipos:

**Endpoints de gateway** (gratuitos): Para S3 y DynamoDB. Agregas una ruta en tu tabla de rutas que dirige el tráfico de S3 o DynamoDB al endpoint en lugar del NAT Gateway. Gratis de crear; gratis de usar.

**Endpoints de interfaz** (con precio): Para otros servicios de AWS (SQS, SNS, Secrets Manager, SSM, etc.). Crea una ENI (Elastic Network Interface) en tu subred con una IP privada. El tráfico al servicio usa esta IP privada. Cuesta ~$0,01/hora por AZ más procesamiento de datos.

Leo ya había creado los endpoints de gateway la semana anterior sin actualizar las tablas de rutas. "Ya lo desplegué... ah", dijo, comprobando la configuración. "Las rutas no se actualizaron. Déjame arreglar eso."

Tom creó inmediatamente endpoints de gateway para S3 y DynamoDB después de enterarse de que eran gratuitos. La tarifa de procesamiento de datos del NAT Gateway bajó un 65%.

Las cuentas del porqué: las funciones de Lambda y las tareas de ECS de Nimbus en subredes privadas hacían solicitudes constantes a S3 (leyendo archivos de configuración, escribiendo exportaciones de registros) y a DynamoDB (leyendo datos de restaurantes, escribiendo registros de pedidos). Cada solicitud se enrutaba a través del NAT Gateway, que cobraba $0,045 por GB de datos procesados.

El procesamiento mensual de datos del NAT Gateway de Nimbus: 533 GB. Costo: $24/mes. Después de agregar los Endpoints de Gateway de S3 y DynamoDB y actualizar las tablas de rutas: el tráfico de S3 y DynamoDB evitó el NAT Gateway por completo. El procesamiento mensual del NAT Gateway bajó a 187 GB: el tráfico restante eran llamadas a la API de otros servicios (Secrets Manager, SES, webhooks externos). Costo: $8,40/mes.

Ahorro: $15,60/mes, $187/año, por dos configuraciones de Endpoint de Gateway gratuitas que tomaron 10 minutos en configurar.

"Gratis", dijo Tom, por tercera vez.

"Los endpoints de gateway son gratis de crear y gratis de usar", confirmó Leo. "No son solo una mejora de seguridad: enrutar el tráfico de S3 y DynamoDB a través de un endpoint privado en lugar del NAT Gateway lo elimina de la internet pública por completo."

"¿Y qué pasa si alguien intenta entrar por la fuerza a través del tráfico del NAT Gateway?", preguntó Priya. "Si el tráfico a S3 va a través de NAT, es direccionable desde internet. Vía Endpoint de Gateway, es privado."

Este es el beneficio secundario de los Endpoints de Gateway que la discusión de costos a veces eclipsa. El tráfico a S3 y DynamoDB a través de un Endpoint de Gateway de VPC nunca abandona la red de AWS, nunca atraviesa una dirección IP pública, y está gobernado por la política del endpoint (una política basada en recursos que puede restringir a qué buckets de S3 o tablas de DynamoDB puede acceder el endpoint). Un Endpoint de Gateway en un bucket que almacena datos de clientes agrega una capa extra: incluso con una política de bucket mal configurada, la política del endpoint puede restringir el acceso al tráfico que se origina desde dentro de la VPC específica.

**AWS Global Accelerator: Enrutamiento en el Edge**

Cuando Nimbus servía a los usuarios de la Costa Este desde us-west-2 (Oregón), la latencia era de 80ms. No porque el servidor estuviera prohibitivamente lejos, sino porque el enrutamiento de la internet pública entre Boston y Oregón era subóptimo, rebotando a través de múltiples redes de operadores.

**AWS Global Accelerator** usa la red troncal global privada de AWS: una red distribuida de ubicaciones edge que enruta el tráfico a tu aplicación a través de rutas controladas por AWS en lugar de saltos entre operadores de la internet pública. En lugar del enrutamiento de la internet pública, el tráfico entra a la red de AWS en la ubicación edge más cercana y viaja por la ruta privada optimizada hasta tu aplicación.

Para Nimbus, un usuario en Boston:

- **Sin Global Accelerator**: Se enruta a través de operadores de la internet pública → ~80ms
- **Con Global Accelerator**: Llega al edge de AWS más cercano en Boston → viaja por la red troncal de AWS → llega a us-west-2 → ~60ms

Global Accelerator no cachea contenido (eso es CloudFront). Optimiza la ruta de red para las solicitudes dinámicas.

Leo hizo una comparación de latencia entre varias ciudades después de habilitar Global Accelerator para la API de Nimbus:

| Ciudad | Antes | Después | Mejora |
|------|--------|-------|-------------|
| Seattle, WA | 12ms | 11ms | 8% |
| Los Ángeles, CA | 28ms | 22ms | 21% |
| Chicago, IL | 55ms | 40ms | 27% |
| Nueva York, NY | 82ms | 61ms | 26% |
| Londres, RU | 145ms | 112ms | 23% |
| Tokio, Japón | 180ms | 95ms | 47% |
| Sídney, Australia | 210ms | 118ms | 44% |

La mejora fue más dramática para los usuarios geográficamente distantes: Tokio de 180ms a 95ms, Sídney de 210ms a 118ms. Para Seattle (cerca de los centros de datos de us-west-2 en Oregón), la mejora fue menor: había menos saltos de la internet pública que optimizar.

"Espera, pero *¿por qué* Tokio obtiene una mejora del 47%?", preguntó Maya. "Si el centro de datos sigue estando en us-west-2, ¿no es la velocidad de la luz la restricción real?"

"La velocidad de la luz es el piso", dijo Leo. "La restricción real es el enrutamiento de la internet pública. El tráfico de Tokio a us-west-2 cruza docenas de sistemas autónomos: diferentes operadores, diferentes routers, diferentes acuerdos de peering. Cada salto agrega latencia. Global Accelerator enruta el tráfico desde la ubicación edge de Tokio hasta us-west-2 sobre la fibra privada de AWS, que tiene rutas más cortas y un enrutamiento mejor afinado."

El mínimo teórico de Tokio a us-west-2 (basado en la velocidad de la luz sobre fibra, aproximadamente 15.500 km de ida y vuelta): ~77ms. Los 95ms con Global Accelerator se acercan a ese mínimo teórico. Los 180ms sin él reflejan la ineficiencia del enrutamiento de la internet pública, no las leyes de la física.

Global Accelerator proporciona dos **direcciones IP anycast** estáticas que enrutan a la ubicación edge más cercana. A diferencia de CloudFront (que usa direcciones IP dinámicas que cambian), estas IPs son estables: útiles para las listas de permitidos de firewall y para las aplicaciones que requieren una IP fija a la que los clientes se conecten.

**Cuándo usar Global Accelerator vs CloudFront**:

- CloudFront: contenido estático y cacheable, caso de uso de CDN
- Global Accelerator: contenido dinámico, protocolos no HTTP (UDP, juegos, IoT), o cuando necesitas una dirección IP Anycast estática

## Mover Datos, No Solo Tráfico: DataSync y Transfer Family

Mientras la arquitectura de redes tomaba forma, a Maya le cayeron simultáneamente tres nuevos proyectos de incorporación de cadenas de restaurantes. Cada uno tenía un requisito de migración de datos, y cada requisito era diferente.

La primera cadena, Pacific Table, necesitaba mover 40 TB de recursos compartidos de archivos NFS a S3. Su almacenamiento de archivos actual estaba on-premises, repartido entre cuatro servidores de archivos en su sede de Seattle. Leo empezó a escribir un plan de migración.

La segunda cadena, Marisol Group, tenía un equipo de contabilidad que subía facturas diariamente a un servidor SFTP local. El flujo de trabajo de SFTP había estado funcionando desde 2015. El personal de contabilidad sabía una cosa: abrían su cliente SFTP cada mañana a las 9 AM, dejaban sus facturas y lo cerraban. Nadie quería cambiar esto. "Sus contadores usan WinSCP", dijo Maya. "Eso no es negociable."

"Esas son dos herramientas diferentes", dijo Priya.

"Sí", dijo Leo. "Pero ambas existen."

**AWS DataSync: rsync con Esteroides, Con una Consola de AWS**

Para la migración de 40 TB de Pacific Table, el desafío no era el ancho de banda: la oficina de Seattle tenía una conexión ascendente sólida. El desafío era la orquestación: descubrir qué archivos existían, transferirlos de forma fiable, verificar los checksums, programar la transferencia para evitar saturar la red de la oficina durante el horario laboral y monitorear el progreso a lo largo de lo que serían varios días de operación continua.

**AWS DataSync** es un servicio de migración y replicación de datos basado en un agente. Instalas un agente ligero de DataSync en tu entorno on-premises: una máquina virtual que corre en VMware o como una instancia de EC2. El agente se conecta a tus servidores de archivos sobre NFS o SMB, descubre tus recursos compartidos y los sincroniza con un destino en AWS: un bucket de S3, un sistema de archivos EFS o un sistema de archivos FSx.

Piénsalo como rsync con esteroides, con una consola de AWS. DataSync maneja:

- **Descubrimiento**: el agente inventaría tus recursos compartidos de origen automáticamente
- **Programación**: las transferencias pueden ejecutarse en un horario definido (fuera del horario laboral) o de forma continua
- **Verificación**: DataSync computa checksums en ambos extremos y te alerta de cualquier inconsistencia
- **Monitoreo**: el progreso de la transferencia, los recuentos de archivos, los reportes de errores y la utilización del ancho de banda son todos visibles en la consola
- **Cifrado en tránsito**: todos los datos se cifran usando TLS durante la transferencia

Para Pacific Table, Leo instaló el agente de DataSync en una VM en su red de Seattle, lo apuntó a los cuatro recursos compartidos NFS y configuró un horario de transferencia: de 8 PM a 6 AM los días de semana, continuo los fines de semana. Después de seis días, los 40 TB completos habían aterrizado en S3. Verificó la transferencia con el reporte de checksum integrado de DataSync. Cero discrepancias.

"¿Y para la replicación continua?", preguntó Maya. "Pacific Table seguirá agregando archivos después de la migración."

"DataSync admite transferencias incrementales", dijo Leo. "Después de la sincronización inicial, solo copia lo que ha cambiado. Podemos ejecutarlo cada noche como un trabajo de replicación."

**AWS Transfer Family: Tu Flujo de Trabajo SFTP, Respaldado por S3**

Para el equipo de contabilidad de Marisol Group, el requisito era diferente. Nadie se estaba alejando de SFTP. Los contadores iban a seguir usando WinSCP. La pregunta era: ¿dónde aterrizan esas subidas de SFTP?

Actualmente, aterrizaban en un servidor Linux local en la oficina trasera de Marisol. Los archivos luego se movían manualmente a su sistema de contabilidad. El servidor local requería mantenimiento, copias de seguridad y alguien con acceso SSH para gestionarlo.

**AWS Transfer Family** es un servidor SFTP, FTPS y FTP totalmente gestionado, respaldado por S3 o EFS como destino de almacenamiento. Aprovisionas un endpoint de Transfer Family (obtiene un nombre de host y, opcionalmente, una dirección IP estática). Tus clientes se conectan a él usando su software SFTP existente. Cuando suben archivos, esos archivos aterrizan directamente en un bucket de S3.

El equipo de contabilidad no cambia nada. Siguen abriendo WinSCP cada mañana a las 9 AM. Siguen conectándose a un servidor SFTP con sus credenciales existentes. Siguen dejando sus facturas en la misma carpeta. La diferencia es invisible para ellos: en el lado del servidor, los archivos ahora van directamente a S3 en lugar de a un servidor Linux local.

"Y desde S3, podemos activar el resto del flujo de trabajo automáticamente", dijo Priya. "Un evento de S3 activa una función de Lambda que procesa la factura y la inserta en el sistema de contabilidad. Sin paso manual."

"Así que el flujo de trabajo de los contadores no cambia", dijo Maya, "pero de nuestro lado, todo está automatizado."

"Sí. Y el servidor SFTP en sí está totalmente gestionado: sin parcheo, sin copias de seguridad, sin servidor que mantener."

Tom ya había buscado los precios. Transfer Family cobra por hora de disponibilidad del endpoint más por GB transferido. Para el volumen de facturas de Marisol Group, el costo mensual estaba muy por debajo de $30. El costo de mantener el servidor local que reemplazaba —depreciación de hardware, tiempo de ingeniería para mantenimiento, gestión de copias de seguridad— era considerablemente mayor.

---

> **Consejo para el Examen — DataSync y Transfer Family**
>
> *Dominio SAA-C03: Diseño de Arquitecturas de Alto Rendimiento (Dominio 3, Tarea 3.1)*
>
> - **DataSync** = mover datos en masa de on-premises a AWS (recursos compartidos de archivos NFS o SMB → S3, EFS o FSx). Las señales del examen: "migrar recursos compartidos de archivos", "replicar datos NFS a S3", "transferencia de datos de on-premises a AWS", "replicación continua de datos de archivos". DataSync usa un agente instalado on-premises; el agente maneja el descubrimiento, la programación y la verificación.
> - **Transfer Family** = transferencia de archivos continua usando los protocolos SFTP, FTPS o FTP, sin cambiar las herramientas del cliente. Las señales del examen: "flujo de trabajo SFTP existente", "los socios suben archivos vía SFTP", "servidor SFTP respaldado por S3", "lift-and-shift de SFTP", "no se puede cambiar el proceso de transferencia de archivos". Transfer Family es la respuesta cuando el requisito es la compatibilidad con SFTP, no el volumen de datos.
> - **La distinción importa**: DataSync es para la migración masiva y la replicación (basado en agente, impulsado por programación, optimizado para red). Transfer Family es para servicios de transferencia de archivos compatibles con protocolos (basado en endpoint, siempre encendido, transparente para el cliente). Resuelven problemas diferentes.
> - DataSync admite S3, EFS y FSx como destinos. Transfer Family admite S3 y EFS como backends de almacenamiento.

---

**Migrar Servidores, No Solo Archivos: Las 7 Rs y MGN**

La tercera cadena en el pipeline de Maya no solo tenía archivos: tenía servidores enteros. Una aplicación de reservas personalizada corriendo en dos máquinas on-premises que nadie quería reescribir antes de la mudanza. Mover *aplicaciones* es su propia disciplina, y AWS describe **siete maneras de migrar** (las "7 Rs") que en su mayoría solo necesitas reconocer:

- **Rehost** ("lift and shift"): mover los servidores tal como están. Lo más rápido, el menor cambio.
- **Replatform** ("lift, tinker, and shift"): pequeñas mejoras en el camino, como mover una base de datos autogestionada a RDS.
- **Repurchase**: abandonar el sistema antiguo, comprar SaaS en su lugar.
- **Refactor**: rediseñar nativo de la nube. Más esfuerzo, mayor recompensa.
- **Retire**: resulta que nadie lo usaba. Elimínalo.
- **Retain**: déjalo donde está, por ahora.
- **Relocate**: mover a nivel del hipervisor sin cambiar nada.

Para el caso de rehost, la herramienta es **AWS Application Migration Service (MGN)**: un agente replica los discos de los servidores de origen, bloque por bloque, en un área de staging de bajo costo en AWS; lanzas copias de prueba cuando quieras; en el momento del cutover, MGN convierte los servidores replicados en instancias nativas de EC2. Lift, shift, listo: la refactorización puede venir después, en tiempo de la nube. (Sus compañeros para la planificación de portafolios, Application Discovery Service y Migration Hub, cerraron a nuevos clientes a finales de 2025: conoce sus nombres como "descubrimiento de inventario" y "seguimiento centralizado de migración" si el examen los menciona.)

---

**AWS Snow Family: La Opción Física**

Todavía quedaba el asunto del conjunto de datos histórico de 4TB y la estimación de 17 horas por internet. Después de calcularlo, Leo había mirado la página de precios de Snow Family y tomó la decisión de inmediato.

Para migraciones por encima de unos pocos terabytes donde el tiempo importa más que la simplicidad, AWS envía dispositivos físicos de almacenamiento a tu ubicación. Los llenas con datos. Los envías de vuelta. AWS ingiere los datos directamente en S3.

**Snowball Edge Storage Optimized**: 80 TB de capacidad utilizable, carcasa reforzada. Se envía a tu ubicación en 2-5 días hábiles. Cargas los datos usando la interfaz local (NFS, interfaz de S3). Lo envías de vuelta. AWS ingiere los datos en aproximadamente 1-3 días hábiles después de la recepción.

Para la migración de 4TB de Nimbus, el proceso:

1. **Pide** un Snowball Edge a través de la consola de AWS (toma 2 minutos, se envía en 3 días)
2. **Conecta** el dispositivo a la red de la oficina de Seattle; se presenta como un punto de montaje NFS
3. **Copia** los 4TB de datos históricos de pedidos usando la interfaz compatible con S3 del dispositivo: `aws s3 cp /data/orders s3://nimbus-data/ --endpoint-url http://192.168.1.100:8080 --profile snowballEdge`
4. **La copia se completa** en unas 2 horas (red local, sin internet)
5. **Envía** el dispositivo de vuelta a AWS (etiqueta prepagada incluida)
6. AWS **ingiere** los datos a S3 dentro de las 72 horas de la recepción
7. **Verifica**: S3 proporciona un reporte de finalización del trabajo que muestra cada archivo transferido y su checksum

Tiempo total transcurrido: 3 días para la entrega + 2 horas para copiar + 1 día de envío + 2 días de ingestión = aproximadamente 7 días naturales. Frente a unas 17 horas continuas, que habrían requerido una conexión a internet estable e ininterrumpida, saturando el enlace ascendente de la oficina durante la noche y gran parte de un día hábil.

Costo: el alquiler del dispositivo Snowball Edge es de $300 por 10 días. Envío (de ida y vuelta): aproximadamente $80. La transferencia de datos de entrada a S3 es gratis. Costo total de la migración: **$380**.

Compáralo con unas 17 horas de uso sostenido de internet a 875 Mbps: el túnel VPN era gratis ($0,05/hora pero el túnel ya estaba corriendo); la transferencia de entrada a S3 era gratis. La ruta de internet "gratis" tenía un costo real en tiempo de ingeniería (monitorear una transferencia de 17 horas), riesgo (cualquier interrupción que requiriera reiniciar) y costo de oportunidad (su conexión a internet estaba saturada durante la ventana de transferencia). Leo hizo el pedido. Cómo resultó está en la escena post-créditos de este capítulo.

---

## Fortalezas y Limitaciones

**Site-to-Site VPN**:

- Configuración rápida, bajo costo
- La ruta de la internet pública significa latencia variable
- Techo limitado de ancho de banda (1,25 Gbps por túnel)
- La opción de VPN Acelerada mejora la latencia a un costo ligeramente mayor

**Direct Connect**:

- Consistente, privado, de alto ancho de banda
- Lento de configurar, costo recurrente significativo
- El circuito físico es un punto único de fallo (agrega redundancia o mantén un respaldo VPN)
- Punto de equilibrio con los ahorros de costos de egreso a aproximadamente 10-15 TB/mes dependiendo del escenario de precios

**AWS Snow Family**:

- Para migraciones únicas por encima de 1-2 TB, a menudo más rápido y más barato que la transferencia por red
- Sin consumo de ancho de banda de internet durante la migración
- Ventana de alquiler del dispositivo de 10 días; envío prepagado

**Transit Gateway**:

- Simplifica drásticamente la conectividad multi-VPC
- Enrutamiento transitivo (a diferencia del VPC peering)
- Las tablas de rutas de aislamiento permiten la segmentación sin conexiones de peering separadas
- El costo se acumula para muchos adjuntos

**VPC Endpoints**:

- Beneficio de seguridad y costo para S3/DynamoDB (endpoints de gateway gratuitos)
- Elimina los costos del NAT Gateway para el tráfico de los servicios de AWS
- Las políticas de endpoint agregan una capa de control de acceso extra más allá de IAM y las políticas de bucket
- Los endpoints de interfaz para otros servicios (Secrets Manager, SSM, SES) mantienen el tráfico privado pero cuestan ~$0,01/hora por AZ

**Global Accelerator**:

- Mejora la latencia de las aplicaciones dinámicas para los usuarios globales: mejora del 33-47% en la práctica para usuarios distantes
- IPs Anycast fijas (a diferencia de las IPs dinámicas de CloudFront): útil para las listas de permitidos de firewall
- Protocolos no HTTP (UDP, TCP): CloudFront es solo HTTP/HTTPS
- Costo adicional ($0,025/hora por acelerador + transferencia de datos)

## Resumen

El trabajo de Aurora del capítulo 24 optimizó cómo Nimbus sirve datos a su propia aplicación. Este capítulo trata de cómo se mueven los datos entre el mundo exterior y AWS, y de cómo hacer que ese movimiento sea más fiable, más rápido y menos costoso.

- **Site-to-Site VPN**: Túnel cifrado sobre la internet pública entre on-premises y la VPC. Configuración rápida, menor costo, latencia variable. Dos túneles para redundancia. Máximo 1,25 Gbps por túnel.
- **Direct Connect**: Conexión de fibra privada y dedicada a AWS. Latencia predecible, mayor ancho de banda, semanas para configurar, costo significativo. Punto de equilibrio con los ahorros de egreso de la VPN a aproximadamente 13,5 TB/mes para el escenario de precios de Nimbus.
- **AWS Snow Family**: Dispositivos físicos de almacenamiento para la migración masiva de datos. Más rápido que la transferencia por internet para migraciones de varios TB. $380 en total para la migración de 4TB de Nimbus vs. unas 17 horas de saturación de red.
- **Transit Gateway**: Hub para la conectividad de VPC y on-premises. Habilita el enrutamiento transitivo (a diferencia del VPC peering). Admite tablas de rutas de aislamiento para controlar qué VPCs pueden llegar a cuáles. Escala a cientos de conexiones.
- **VPC Endpoints**: Acceso privado a los servicios de AWS sin NAT Gateway. Los endpoints de gateway (S3, DynamoDB) son gratuitos: agrégalos a cada VPC que acceda a S3 o DynamoDB. Le ahorró a Nimbus $15,60/mes y eliminó el tráfico de S3/DynamoDB del NAT Gateway.
- **Global Accelerator**: Enruta el tráfico dinámico sobre la red troncal privada de AWS para una latencia menor y más consistente a nivel global. IPs Anycast estáticas. Mejoras de latencia del 33-47% para usuarios distantes (Tokio: 180ms → 95ms; Sídney: 210ms → 118ms). No es un CDN: no cachea.
- **AWS DataSync**: Servicio basado en agente para migrar y replicar datos de archivos NFS/SMB on-premises a S3, EFS o FSx. Maneja la programación, la verificación de checksums, el monitoreo. Se usa para migraciones únicas y replicación continua de recursos compartidos de archivos.
- **AWS Transfer Family**: Servidor SFTP, FTPS y FTP gestionado respaldado por S3 o EFS. Permite que los clientes SFTP existentes suban archivos a S3 sin cambiar su flujo de trabajo.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas de Alto Rendimiento (Dominio 3, Tarea 3.4)*

- **Señales de VPN vs Direct Connect**: VPN = "cifrar el tráfico a la VPC", "configuración rápida", "sensible al costo". Direct Connect = "latencia baja consistente", "grandes transferencias de datos", "conexión privada", "cumplimiento que requiere red privada".
- **Transit Gateway vs VPC Peering**: El peering no es transitivo (A→B→C no permite A→C). Transit Gateway es transitivo. "Muchas VPCs que necesitan comunicarse" → Transit Gateway.
- **VPC Gateway Endpoints**: Gratis. Solo S3 y DynamoDB. Cambio de tabla de rutas. Sin costo extra. Escenario del examen: "reducir los costos de transferencia de datos para el acceso a S3 desde una subred privada" → Gateway Endpoint.
- **Global Accelerator vs CloudFront**: Accelerator = contenido dinámico, no HTTP, IP estática, optimización de red. CloudFront = caché, contenido HTTP, CDN.
- **Direct Connect + VPN**: Puedes usar una VPN como respaldo para una conexión Direct Connect. Si el circuito de Direct Connect falla, el tráfico hace failover a la VPN. Más caro que la VPN sola, más fiable que Direct Connect solo.
- **Direct Connect Gateway**: Conecta un circuito de Direct Connect a múltiples VPCs en múltiples regiones o cuentas. Sin él, un circuito de Direct Connect se conecta a un VGW en una región.
- **AWS Snow Family**: "Gran migración de datos", "la velocidad de transferencia es demasiado lenta", "migración a escala de petabytes" → Snow Family. Snowball Edge = hasta 80TB. Haz las cuentas de la transferencia primero: si mover los datos sobre la red disponible tomaría aproximadamente una semana o más, la respuesta es un dispositivo físico. *Verificación de la realidad (2026)*: AWS ha estado retirando la familia: Snowmobile se retiró en 2024, Snowcone se descontinuó a finales de 2024, y a partir de noviembre de 2025 los dispositivos Snow ya no se ofrecen a nuevos clientes (AWS ahora apunta a DataSync sobre enlaces rápidos y a las **Data Transfer Terminals**, ubicaciones seguras donde llevas tus propios discos). El banco de preguntas del SAA-C03 es anterior a todo esto, así que en el examen, "semanas de transferencia por red, ancho de banda limitado" todavía apunta a Snowball.
- **Tablas de rutas de Transit Gateway**: Transit Gateway admite múltiples tablas de rutas para la segmentación de red. Señal del examen: "aislar la VPC de producción de la de staging" con conectividad compartida a través de Transit Gateway → tablas de rutas separadas.
- **IPs fijas de Global Accelerator**: A diferencia de CloudFront, Global Accelerator proporciona dos IPs Anycast estáticas. Señal del examen: "la aplicación necesita una dirección IP fija para que los clientes la pongan en lista de permitidos" o "tráfico UDP" → Global Accelerator (CloudFront es solo HTTP/HTTPS).
- **Señales de AWS DataSync**: "migrar recursos compartidos de archivos NFS/SMB a S3/EFS/FSx", "replicación continua de datos de archivos on-premises", "migración de archivos basada en agente". DataSync no es para transferencia SFTP compatible con protocolo: es para migración y replicación masiva de recursos compartidos de archivos.
- **Señales de AWS Transfer Family**: "flujo de trabajo SFTP existente", "los socios o clientes suben archivos vía SFTP", "llevar el servidor SFTP a la nube sin cambiar las herramientas del cliente", "SFTP/FTPS/FTP respaldado por S3". Transfer Family no es una herramienta de migración de datos: es un endpoint de protocolo gestionado. La distinción: DataSync mueve datos en masa según un horario; Transfer Family proporciona un endpoint SFTP/FTP siempre encendido para subidas de archivos continuas.
- **MGN (Application Migration Service)**: "migrar cientos de VMs rápidamente, sin cambios de código", "rehost / lift-and-shift de servidores a EC2" → MGN (replicación a nivel de bloque, lanzamientos de prueba, cutover a instancias nativas de EC2). DataSync mueve *archivos*; DMS mueve *bases de datos*; MGN mueve *servidores enteros*.

## Ejercicios

**Ejercicio 1 — Recuerdo**

Explica la diferencia entre AWS Site-to-Site VPN y AWS Direct Connect. ¿En qué escenario elegirías cada uno?

*(Pista: Piensa en el tiempo de configuración, el costo, la consistencia de la latencia y los requisitos de ancho de banda.)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: Una empresa de servicios financieros requiere una conexión de red privada, cifrada y dedicada desde su centro de datos on-premises a AWS. Transfieren 500GB de datos financieros sensibles diariamente. La conexión debe tener una latencia consistente y predecible y no debe atravesar la internet pública. También necesitan una conexión de respaldo en caso de que la principal falle.

¿Qué arquitectura cumple MEJOR con estos requisitos?

A) Una Site-to-Site VPN con enrutamiento BGP y una segunda VPN para redundancia  
B) Una Conexión Alojada de Direct Connect con Direct Connect Gateway  
C) Dos conexiones Site-to-Site VPN a través de diferentes proveedores de internet  
D) Una conexión Direct Connect con una Site-to-Site VPN como respaldo

**Pista 1**: "No debe atravesar la internet pública": el tráfico de la VPN va sobre la internet pública (cifrado). Solo Direct Connect es privado.

**Pista 2**: "Latencia consistente y predecible": el rendimiento de la VPN sobre la internet pública varía. Direct Connect es consistente.

**Pista 3**: "Conexión de respaldo": ¿cuál es el enfoque recomendado cuando Direct Connect es el principal?

**Respuesta**: D

**Explicación**: Direct Connect proporciona una conexión privada y dedicada que no atraviesa la internet pública, cumpliendo con los requisitos de privacidad y latencia. Una Site-to-Site VPN como respaldo proporciona redundancia: si el circuito de Direct Connect falla, el tráfico hace failover a la VPN cifrada. Este es el patrón estándar de HA para Direct Connect.

**¿Por qué no A?** El tráfico de la Site-to-Site VPN atraviesa la internet pública, lo que viola el requisito de "no debe atravesar la internet pública".

**¿Por qué no B?** Una Conexión Alojada proporciona una conexión Direct Connect pero la opción B no incluye un respaldo. Un único Direct Connect sin respaldo es un punto único de fallo: la fibra física puede cortarse.

**¿Por qué no C?** Dos conexiones VPN a través de diferentes ISPs todavía atraviesan la internet pública, aunque estén cifradas. No cumple con el requisito de red privada.

*Dominio SAA-C03: Diseño de Arquitecturas de Alto Rendimiento — Tarea 3.4*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus se está expandiendo para tener equipos de ingeniería regionales en Seattle, Berlín y Singapur. Cada equipo regional necesita acceso a:

- La VPC de producción (solo lectura para depuración)
- La VPC de staging (acceso completo para pruebas)
- La VPC de análisis (solo lectura para reportes)

Diseña la conectividad de red. ¿Usarías Transit Gateway? ¿Direct Connect en cada región o Site-to-Site VPN? ¿Cómo harías cumplir el acceso de solo lectura para producción? (Pista: esta es tanto una pregunta de red como de IAM.)

*(No existe una única respuesta correcta. El objetivo es practicar el diseño de red multi-región y multi-equipo.)*

**Extensión**: El equipo de Berlín reporta que su latencia de VPN a la VPC de producción (us-west-2) promedia 160ms. ¿A qué volumen de datos se convertiría la Site-to-Site VPN Acelerada o una Conexión Alojada de Direct Connect en la mejor opción? Investiga los precios actuales de las Conexiones Alojadas de Direct Connect de un Socio de AWS europeo. ¿Justificaría la mejora de latencia por sí sola el costo a tu volumen de datos estimado?

## Escena Post-Créditos

La migración de datos se completó en 8 días naturales: 3 días para que el Snowball Edge llegara, 94 minutos para copiar los datos, 4 días para que AWS recibiera el dispositivo e ingiriera los datos, luego una sincronización final del delta que se había acumulado mientras el Snowball estaba en tránsito. Tiempo práctico para todo el asunto: menos de cuatro horas.

Ese último paso importó. El Snowball Edge copió una instantánea de un punto en el tiempo del conjunto de datos de 4TB. Mientras estaba en tránsito, la base de datos de producción había seguido funcionando: se estaban realizando nuevos pedidos, se estaban creando nuevos registros. El delta de sincronización sobre VPN fue de 12GB, completado en 18 minutos.

"La transferencia masiva fue el Snowball", dijo Leo. "La sincronización fueron solo los datos nuevos netos de los 8 días que tomó."

"Ya lo desplegué... ah", dijo Leo, observando la copia completarse en el Snowball Edge después de 94 minutos. "Debería haber establecido el límite de ancho de banda en la copia local para evitar saturar la red de la oficina durante el horario laboral."

No había establecido el límite. El internet de la oficina estaba bien: el Snowball era una operación de red local. Pero el switch de red se convirtió brevemente en un cuello de botella a medida que la copia se acercaba a los 9 Gbps de rendimiento local.

"El punto", dijo, después de arreglar la configuración del límite, "es que el correo físico es más rápido que internet por encima de cierto volumen de datos."

"Eso es obvio o contraintuitivo", dijo Maya, "dependiendo de cómo lo pienses."

"La próxima vez", dijo Leo, "deberíamos configurar un Direct Connect."

Tom no buscó la calculadora: ya había hecho las cuentas antes, cuando Direct Connect surgió por primera vez: unos mil al mes, puerto más circuito.

"Para lo que hacemos ahora, probablemente no vale la pena. Pero si empezamos a mover más de 10TB al mes entre nuestra oficina y AWS, los ahorros de transferencia de datos en Direct Connect compensarían el costo."

"Así que monitoreamos el volumen de transferencia de datos", dijo Priya, "y lo revisamos cuando cruce el umbral."

"Eso es arquitectura consciente del costo", dijo Tom.

"Ese ha sido siempre el punto", dijo Maya.

Priya había observado la migración desde el otro lado de la sala. "La próxima vez que hagamos algo como esto", dijo, "¿podemos hacerlo antes de que los datos estén en producción y el negocio dependa de ellos? Migrar datos en vivo siempre es más arriesgado que migrar datos en reposo."

"Nunca están en reposo cuando el negocio está funcionando", dijo Leo.

"Lo sé", dijo ella. "Ese es el punto. Planifica la migración antes de necesitarla. No después."

Tom ya había calculado lo que costaría tener un segundo conjunto de infraestructura en us-east-1 listo para recibir una migración en cualquier momento. Se guardó el número para sí mismo por ahora. Había capítulos más inmediatos que cerrar.

En el próximo capítulo: qué pasa cuando tienes más datos de los que cualquier base de datos puede almacenar razonablemente, y necesitas darle sentido a todo.
