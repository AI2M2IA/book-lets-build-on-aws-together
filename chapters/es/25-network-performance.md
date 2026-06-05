# Capítulo 25: La Autopista Privada

Levántate un momento. Sacude las manos.

Vamos a hablar de mover datos. No entre servicios de AWS, sino entre el mundo real y AWS: entre tu oficina y tu infraestructura en la nube, entre continentes.

El equipo de infraestructura de Nimbus (ahora cuatro ingenieros) trabajaba desde una oficina compartida en Seattle. Necesitaban acceso a la infraestructura de AWS que gestionaban. Algunas operaciones requerían conectarse a recursos en la VPC.

Actualmente usaban una VPN en sus portátiles para acceder al host bastión en la subred pública y luego accedían a los recursos por SSH desde allí.

Funcionaba. Era lento. La conexión VPN enrutaba a través de la internet pública: Seattle → fibra transcontinental → múltiples saltos de operador → us-east-1. Cada ida y vuelta era de más de 80 milisegundos.

"Para SSH del día a día, eso es aceptable," dijo Leo. "Pero estamos a punto de empezar a mover nuestra base de datos de analítica. 4 terabytes de datos históricos de pedidos. Con esta conexión, la migración tardará semanas."

"Necesitamos una conexión mejor," dijo Maya.

"Una conexión privada," añadió Priya. "No a través de la internet pública."

Piensa en ello como el trayecto al trabajo. Una VPN de sitio a sitio es como conducir por carreteras públicas: cierras las puertas del coche (cifrado), pero sigues compartiendo los carriles con todos los demás, y los atascos te ralentizan de forma impredecible. Direct Connect es como alquilar un carril privado dedicado en la autopista: sin tráfico compartido, velocidad constante y un peaje mensual más alto. La mayoría de los días la carretera pública está bien. Cuando estás moviendo un camión lleno de carga valiosa con un horario ajustado, pagas por el carril privado.

**AWS Site-to-Site VPN: La Opción Rápida**

**AWS Site-to-Site VPN** crea un túnel cifrado entre tu red local y tu VPC, atravesando la internet pública.

Configuración:

1. Crear un Virtual Private Gateway (VGW) adjunto a tu VPC
2. Crear un Customer Gateway que represente tu enrutador local
3. Establecer dos túneles VPN (por redundancia) entre ellos

El tráfico está cifrado (AES-256). Viaja por la internet pública, lo que significa que la latencia depende de las condiciones de internet. AWS proporciona dos túneles automáticamente para redundancia: si un túnel tiene problemas, el tráfico se traslada al otro.

**Cuándo usar Site-to-Site VPN**:

- Configuración rápida (minutos a horas)
- Rentable (0,05 USD/hora por conexión VPN)
- Ancho de banda: hasta 1,25 Gbps por túnel
- Latencia de internet aceptable para el caso de uso

Para la migración de 4 TB de Nimbus, la VPN basada en internet a un máximo de 1,25 Gbps tardaría: 4 TB / 1,25 Gbps ≈ 7 horas como mínimo, con una sobrecarga del mundo real más cercana a 12-20 horas. Aceptable, pero la congestión en la ruta de internet pública la hace impredecible.

"¿Cuál es la otra opción?" preguntó Tom.

**AWS Direct Connect: La Línea Dedicada**

**AWS Direct Connect** establece una conexión de red dedicada y privada entre tu ubicación (o tu instalación de colocación) y AWS. El tráfico nunca toca la internet pública.

Direct Connect es una conexión física: una línea de fibra desde tu red hasta una ubicación de AWS Direct Connect. Trabajas con un proveedor de telecomunicaciones para establecer el circuito físico. AWS proporciona el puerto en su lado.

**Ventajas**:

- Latencia consistente y predecible (sin varianza de internet pública)
- Velocidades de 50 Mbps a 100 Gbps
- Costes de transferencia de datos más bajos que internet (las tasas de transferencia de datos de Direct Connect son más baratas que las tasas estándar de transferencia de datos de salida de AWS)
- Más seguro (circuito privado, no internet pública)

**Contrapartidas**:

- La configuración tarda semanas o meses (aprovisionamiento de infraestructura física)
- Coste significativamente mayor que VPN (0,025-0,30 USD/hora por puerto, más costes del circuito de telecomunicaciones: a menudo 500-1000+ USD/mes como mínimo)
- Sin redundancia integrada (estableces circuitos redundantes tú mismo)
- No adecuado para oficinas geográficamente distribuidas sin múltiples circuitos

Para Nimbus: Direct Connect era excesivo para su tamaño actual. Pero para empresas con volúmenes significativos de transferencia de datos o requisitos de cumplimiento para conexiones de red privadas, Direct Connect se amortiza.

**Conexiones Hospedadas: El Término Medio**

No todas las organizaciones pueden comprometerse con un circuito de fibra dedicada de 100 Gbps. Las **conexiones hospedadas de Direct Connect** permiten a los socios de AWS Direct Connect (telecomunicaciones aprobadas) aprovisionar conexiones de sub-1 Gbps que compartes con otros clientes.

La configuración es más rápida (días a semanas, no meses) y cuesta menos que una conexión dedicada. La contrapartida: la capacidad compartida significa un rendimiento menos consistente.

Para Nimbus (cuando crezca): una conexión hospedada de 500 Mbps a través de un socio proporcionaría conectividad privada a un precio razonable.

**AWS Transit Gateway: Hub y Radio para VPC**

A medida que Nimbus crecía, acumularía múltiples VPC: la VPC de producción, la VPC de staging, la VPC de analítica, la VPC de herramientas de seguridad.

Sin una planificación cuidadosa, conectar estas VPC requiere una malla completa de conexiones de peering de VPC. Para 4 VPC: 6 conexiones de peering. Para 10 VPC: 45 conexiones de peering. Para 20 VPC: 190 conexiones. Esto no escala.

**AWS Transit Gateway** es un hub de red que conecta múltiples VPC y redes locales. En lugar de una malla de conexiones de peering, cada VPC se conecta al Transit Gateway. El Transit Gateway enruta el tráfico entre ellas.

```
Local ──── Direct Connect ──┐
                             │
VPC Producción ───────────── Transit Gateway
VPC Staging ─────────────── Transit Gateway
VPC Analítica ───────────── Transit Gateway
VPC Seguridad ───────────── Transit Gateway
```

**Enrutamiento transitivo**: Si la VPC A y la VPC B se conectan al Transit Gateway, pueden comunicarse sin un peering directo. El Transit Gateway gestiona el enrutamiento. A diferencia del peering de VPC (que no es transitivo), el Transit Gateway habilita la topología hub y radio.

**Costes del Transit Gateway**: se cobran por adjunto (conexión VPC o VPN/Direct Connect) más por GB de datos procesados. A escala, esto merece la pena por la simplicidad.

**Endpoints de VPC: Acceso Privado a los Servicios de AWS**

Un problema sutil de coste y seguridad: cuando tu instancia EC2 (en una subred privada) llama a la API de S3, ese tráfico pasa por el NAT Gateway (para llegar a internet, donde está el endpoint público de S3). Pagas por el procesamiento del NAT Gateway.

Los **endpoints de VPC** permiten que los recursos de tu VPC se comuniquen con los servicios de AWS de forma privada, sin pasar por la internet pública, y sin NAT Gateway.

Dos tipos:

**Endpoints de gateway** (gratuitos): Para S3 y DynamoDB. Añades una ruta en tu tabla de rutas que dirige el tráfico de S3 o DynamoDB al endpoint en lugar del NAT Gateway. Gratuito para crear; gratuito para usar.

**Endpoints de interfaz** (con precio): Para otros servicios de AWS (SQS, SNS, Secrets Manager, SSM, etc.). Crea una ENI (Elastic Network Interface) en tu subred con una IP privada. El tráfico al servicio usa esta IP privada. Cuesta ~0,01 USD/hora por AZ más procesamiento de datos.

Tom creó inmediatamente endpoints de gateway para S3 y DynamoDB al saber que eran gratuitos. La tarifa de procesamiento de datos del NAT Gateway bajó un 30%.

**AWS Global Accelerator: Enrutamiento en el Edge**

Cuando Nimbus servía a usuarios de la Costa Oeste desde us-east-1 (Virginia), la latencia era de 80 ms. No porque el servidor estuviera prohibitivamente lejos, sino porque el enrutamiento de la internet pública entre Seattle y Virginia era subóptimo, rebotando a través de múltiples redes de operadores.

**AWS Global Accelerator** usa la red privada troncal de AWS (la misma infraestructura que alimenta CloudFront) para enrutar el tráfico entre los usuarios y las aplicaciones de AWS. En lugar del enrutamiento de internet pública, el tráfico entra en la red de AWS en la ubicación edge más cercana y viaja por la ruta privada optimizada hasta tu aplicación.

Para Nimbus, un usuario en Seattle:

- **Sin Global Accelerator**: Enruta a través de operadores de internet pública → ~80 ms
- **Con Global Accelerator**: Llega al edge de AWS más cercano en Seattle → viaja por el troncal de AWS → llega a us-east-1 → ~45 ms

Global Accelerator no almacena contenido en caché (eso es CloudFront). Optimiza la ruta de red para solicitudes dinámicas.

**Cuándo usar Global Accelerator frente a CloudFront**:

- CloudFront: contenido estático y almacenable en caché, caso de uso CDN
- Global Accelerator: contenido dinámico, protocolos no HTTP (UDP, juegos, IoT) o cuando necesitas una dirección IP estática Anycast

## Ventajas y Limitaciones

**Site-to-Site VPN**:

- Configuración rápida, bajo coste
- La ruta de internet pública significa latencia variable
- Techo de ancho de banda limitado

**Direct Connect**:

- Consistente, privado, alto ancho de banda
- Lento de configurar, coste recurrente significativo
- El circuito físico es un único punto de fallo (añade redundancia)

**Transit Gateway**:

- Simplifica drásticamente la conectividad multi-VPC
- Enrutamiento transitivo (a diferencia del peering de VPC)
- El coste aumenta para muchos adjuntos

**Endpoints de VPC**:

- Beneficio de seguridad y coste para S3/DynamoDB (endpoints de gateway gratuitos)
- Elimina los costes del NAT Gateway para el tráfico de servicios de AWS

**Global Accelerator**:

- Mejora la latencia de aplicaciones dinámicas para usuarios globales
- IPs Anycast fijas (a diferencia de las IPs dinámicas de CloudFront)
- Coste adicional (0,025 USD/hora por acelerador + transferencia de datos)

## Resumen

- **Site-to-Site VPN**: Túnel cifrado sobre internet pública entre local y VPC. Configuración rápida, menor coste, latencia variable.
- **Direct Connect**: Conexión de fibra dedicada y privada a AWS. Latencia predecible, mayor ancho de banda, semanas para configurar, coste significativo.
- **Transit Gateway**: Hub para conectividad de VPC y local. Habilita el enrutamiento transitivo. Escala a cientos de conexiones.
- **Endpoints de VPC**: Acceso privado a servicios de AWS sin NAT Gateway. Los endpoints de gateway (S3, DynamoDB) son gratuitos.
- **Global Accelerator**: Enruta el tráfico dinámico a través del troncal de AWS para una latencia menor y más consistente a nivel global.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas de Alto Rendimiento (Dominio 3, Tarea 3.4)*

- **Señales VPN vs Direct Connect**: VPN = "cifrar tráfico a VPC," "configuración rápida," "sensible al coste." Direct Connect = "latencia baja y consistente," "transferencias de datos grandes," "conexión privada," "cumplimiento que requiere red privada."
- **Transit Gateway vs Peering de VPC**: El peering no es transitivo (A→B→C no permite A→C). El Transit Gateway es transitivo. "Muchas VPC que necesitan comunicarse" → Transit Gateway.
- **Endpoints de gateway de VPC**: Gratuitos. Solo para S3 y DynamoDB. Cambio en la tabla de rutas. Sin coste adicional. Escenario del examen: "reducir los costes de transferencia de datos para el acceso a S3 desde una subred privada" → Endpoint de gateway.
- **Global Accelerator vs CloudFront**: Accelerator = contenido dinámico, no HTTP, IP estática, optimización de red. CloudFront = caché, contenido HTTP, CDN.
- **Direct Connect + VPN**: Puedes usar una VPN como respaldo para una conexión Direct Connect. Si el circuito Direct Connect falla, el tráfico conmuta a la VPN. Más caro que solo VPN, más fiable que solo Direct Connect.
- **Direct Connect Gateway**: Conecta un circuito Direct Connect a múltiples VPC en múltiples regiones o cuentas. Sin él, un circuito Direct Connect se conecta a un solo VGW en una región.

## Ejercicios

**Ejercicio 1 — Recordatorio**

Explica la diferencia entre AWS Site-to-Site VPN y AWS Direct Connect. ¿En qué escenario elegirías cada uno?

*(Pista: Piensa en el tiempo de configuración, el coste, la consistencia de la latencia y los requisitos de ancho de banda.)*

**Ejercicio 2 — Práctica de Examen**

*Escenario*: Una empresa de servicios financieros requiere una conexión de red privada, cifrada y dedicada desde su centro de datos local hasta AWS. Transfieren 500 GB de datos financieros sensibles diariamente. La conexión debe tener una latencia consistente y predecible y no debe atravesar la internet pública. También necesitan una conexión de respaldo en caso de que la primaria falle.

¿Qué arquitectura cumple MEJOR con estos requisitos?

A) Una VPN de sitio a sitio con enrutamiento BGP y una segunda VPN para redundancia  
B) Una conexión Direct Connect con una VPN de sitio a sitio como respaldo  
C) Dos conexiones VPN de sitio a sitio a través de diferentes proveedores de internet  
D) Una conexión hospedada de Direct Connect con Direct Connect Gateway

**Pista 1**: "No debe atravesar la internet pública": el tráfico VPN va por la internet pública (cifrado). Solo Direct Connect es privado.

**Pista 2**: "Latencia consistente y predecible": el rendimiento de la VPN sobre internet pública varía. Direct Connect es consistente.

**Pista 3**: "Conexión de respaldo": ¿cuál es el enfoque recomendado cuando Direct Connect es el primario?

**Respuesta**: B

**Explicación**: Direct Connect proporciona una conexión dedicada y privada que no atraviesa la internet pública, cumpliendo los requisitos de privacidad y latencia. Una VPN de sitio a sitio como respaldo proporciona redundancia: si el circuito Direct Connect falla, el tráfico conmuta a la VPN cifrada. Este es el patrón estándar de alta disponibilidad para Direct Connect.

**¿Por qué no A?** El tráfico de la VPN de sitio a sitio atraviesa la internet pública, lo que viola el requisito de "no atravesar la internet pública."

**¿Por qué no C?** Dos conexiones VPN a través de diferentes ISP siguen atravesando la internet pública, aunque estén cifradas. No cumple el requisito de red privada.

**¿Por qué no D?** Una conexión hospedada proporciona una conexión Direct Connect, pero la opción D no incluye un respaldo. Direct Connect único sin respaldo es un único punto de fallo: el cable de fibra puede cortarse.

*Dominio SAA-C03: Diseño de Arquitecturas de Alto Rendimiento — Tarea 3.4*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus se está expandiendo para tener equipos de ingeniería regionales en Seattle, Berlín y Singapur. Cada equipo regional necesita acceso a:

- La VPC de producción (solo lectura para depuración)
- La VPC de staging (acceso completo para pruebas)
- La VPC de analítica (solo lectura para informes)

Diseña la conectividad de red. ¿Usarías Transit Gateway? ¿Direct Connect en cada región o VPN de sitio a sitio? ¿Cómo implementarías el acceso de solo lectura para producción? (Pista: esto es tanto una pregunta de red como de IAM.)

*(No hay una única respuesta correcta. El objetivo es practicar el diseño de red multi-región y multi-equipo.)*

## Escena Poscreditos

La migración de datos se completó en 14 horas.

No a través de la lenta ruta de internet pública: Leo había usado AWS Snow Family (dispositivos de almacenamiento físico enviados hacia y desde AWS) para la mayor parte de los datos, y luego sincronizó el delta restante por VPN.

"La próxima vez," dijo, "deberíamos configurar un Direct Connect."

Tom buscó los precios.

"Un puerto dedicado de 1 Gbps es 216 USD/mes," dijo. "Más el circuito desde nuestra oficina, que una empresa de telecomunicaciones cotizó en 800 USD/mes."

"Así que unos mil al mes en total."

"Para lo que hacemos ahora, probablemente no valga la pena. Pero si empezamos a mover más de 10 TB al mes entre nuestra oficina y AWS, los ahorros en transferencia de datos de Direct Connect compensarían el coste."

"Entonces monitorizamos el volumen de transferencia de datos," dijo Priya, "y revisamos cuando supere el umbral."

"Eso es arquitectura consciente del coste," dijo Tom.

"Siempre ha sido el punto," dijo Maya.

En el siguiente capítulo: qué ocurre cuando tienes más datos de los que cualquier base de datos puede almacenar razonablemente, y necesitas darle sentido a todo ello.
