# Capítulo 11: Tu Rincón Privado en la Nube

Priya tenía un papel con un dibujo.

No era un dibujo complicado. Un rectángulo, etiquetado «AWS». Dentro del rectángulo, un grupo de cajas: instancias EC2, una base de datos RDS, un clúster de ElastiCache. Líneas conectando todo con todo. Y fuera del rectángulo, una única etiqueta: «Internet».

Lo puso en el centro de la mesa.

«Esto es lo que tenemos», dijo. «Nuestra base de datos tiene una dirección IP pública. Nuestra capa de caché es accesible desde internet. Nuestras instancias EC2 están todas en la misma red plana.»

«Eso parece estar bien», dijo Leo. «Tenemos grupos de seguridad.»

«Grupos de seguridad que tú configuraste», dijo Priya. «Por la noche. Durante la configuración inicial.»

Leo no dijo nada.

«No critico la configuración», dijo. «Digo que cuando todo vive en una red pública plana, una única mala configuración es la diferencia entre un sistema que funciona y uno que es accesible para todo el mundo en internet.»

Cogió un marcador rojo y dibujó un círculo alrededor de la base de datos.

«Esto no debería ser alcanzable desde internet. En absoluto. No a través de una regla de grupo de seguridad, no a través de una configuración reforzada. Debe ser estructuralmente inalcanzable.»

«Necesitamos hablar de arquitectura de red», dijo Maya.

«Necesitábamos hablar de ello hace tres meses», dijo Priya. «Pero ahora está bien.»

El equipo se reunió alrededor de una pizarra por primera vez en semanas.

**El Problema del Aparcamiento Público Abierto**

Imagina un enorme aparcamiento público. Diez mil coches. Cualquier coche puede aparcar en cualquier lugar. No hay barreras entre zonas, no hay puertas, no hay secciones reservadas.

Esta es una red abierta. Cada servicio puede llegar a cada otro servicio. Tu servidor web puede hablar con tu base de datos. Tu base de datos puede llegar a internet. Tu capa de caché puede recibir conexiones de cualquier lugar.

Cuando todo puede hablar con todo, un compromiso afecta a todo.

«Entonces si alguien entra al aparcamiento», dijo Tom, «puede entrar a cualquier coche.»

«Y desde cualquier coche, ir a cualquier lugar», confirmó Priya. «Queremos vallas. Queremos puertas cerradas. Queremos zonas.»

La VPC es como construyes esas zonas en AWS.

**¿Qué Es una VPC?**

Una **Virtual Private Cloud (VPC)** es una sección lógicamente aislada de la nube de AWS — una red privada que defines, a la que solo tus recursos pueden acceder de forma predeterminada.

Piénsalo como un lote privado vallado dentro del enorme aparcamiento público. Tu lote tiene sus propias reglas: quién puede entrar, quién puede salir, qué rutas existen entre secciones.

Cuando creas una VPC, defines:

**Un bloque CIDR**: El rango de direcciones IP disponibles dentro de tu red. Por ejemplo, `10.0.0.0/16` te da 65.536 posibles direcciones IP (de 10.0.0.0 a 10.0.255.255).

**Subredes**: Subdivisiones de tu VPC, cada una asignada a una porción de tu rango de direcciones IP y asociada con una Zona de Disponibilidad específica.

**Tablas de rutas**: Reglas que determinan hacia dónde va el tráfico de red.

**Internet Gateway**: La conexión entre tu VPC y el internet público.

**Subredes: Pública vs Privada**

No todos los recursos deben ser accesibles públicamente.

Tu servidor web necesita aceptar tráfico de internet — los navegadores de los usuarios necesitan llegar a él.

Tu base de datos nunca debería aceptar tráfico de internet — solo tu servidor web debería poder hablar con ella.

Aquí es donde entran las subredes.

Una **subred pública** está conectada a un Internet Gateway y puede tener recursos con direcciones IP públicas. El tráfico puede fluir hacia y desde internet.

Una **subred privada** no tiene conexión directa a internet. Los recursos en una subred privada solo pueden comunicarse con otros recursos en tu VPC (a menos que configures rutas de salida específicas). No tienen direcciones IP públicas.

Para Nimbus, el diseño quedó claro:

```
Internet
    |
Internet Gateway
    |
Subred Pública (AZ-a)     Subred Pública (AZ-b)
  [Balanceador de Carga]   [Balanceador de Carga]
    |                          |
Subred Privada (AZ-a)    Subred Privada (AZ-b)
  [Instancias EC2]          [Instancias EC2]
    |                          |
Subred Privada (AZ-a)    Subred Privada (AZ-b)
  [RDS Principal]            [RDS Standby]
  [ElastiCache]              [ElastiCache]
```

El balanceador de carga está orientado al público — necesita recibir tráfico de internet. Las instancias EC2 son privadas — solo reciben tráfico del balanceador de carga. Las bases de datos son privadas — solo reciben tráfico de las instancias EC2.

«Entonces para llegar a la base de datos», dijo Tom, «alguien tendría que atravesar el balanceador de carga, luego la instancia EC2, luego el grupo de seguridad de la base de datos?»

«Tres capas», confirmó Priya. «Defensa en profundidad.»

**El NAT Gateway: Subredes Privadas que Todavía Pueden Descargar Cosas**

Las subredes privadas no pueden llegar a internet. Pero a veces lo necesitan. Tu instancia EC2 necesita descargar una actualización de software. Tu aplicación necesita llamar a una API externa.

Aquí es donde entra el **NAT Gateway** (Traducción de Direcciones de Red).

Un NAT Gateway se sienta en una subred pública. Los recursos en subredes privadas pueden enviar tráfico de salida al NAT Gateway, que lo retransmite a internet — pero internet no puede iniciar conexiones de vuelta.

Es como una puerta giratoria de sentido único. Puedes salir. Nadie de fuera puede entrar.

«¿Cuánto cuesta un NAT Gateway?» preguntó Tom.

La pregunta no sorprendió a nadie.

Los precios del NAT Gateway tienen dos componentes: un cargo por hora para cada NAT Gateway, más una tarifa de procesamiento de datos por GB. Esto puede acumularse inesperadamente (el Capítulo 30 cubre esto en detalle). Por ahora: no uses más NAT Gateways de los que necesitas y ten en cuenta que grandes cantidades de datos de salida aparecerán en tu factura.

**Tablas de Rutas: Cómo el Tráfico Encuentra su Camino**

Cada subred tiene una **tabla de rutas** que indica al tráfico hacia dónde ir.

Una tabla de rutas de subred pública típica se ve así:

| Destino    | Objetivo                      |
|------------|-------------------------------|
| 10.0.0.0/16 | local                        |
| 0.0.0.0/0   | igw-xxxx (Internet Gateway)  |

La primera regla: el tráfico a cualquier IP en tu rango de VPC permanece local. La segunda regla: todo el demás tráfico (`0.0.0.0/0` significa «todo») va al Internet Gateway.

Una tabla de rutas de subred privada:

| Destino    | Objetivo               |
|------------|------------------------|
| 10.0.0.0/16 | local                 |
| 0.0.0.0/0   | nat-xxxx (NAT Gateway)|

El tráfico de la subred privada permanece local o sale a través del NAT Gateway. No hay ruta directa al Internet Gateway.

**Grupos de Seguridad vs NACLs (Vista Previa)**

Dentro de la VPC, tienes dos herramientas para controlar el tráfico a nivel de recurso:

Los **Grupos de Seguridad** (el Capítulo 15 lo cubre en profundidad) actúan como cortafuegos virtuales para recursos individuales — una instancia EC2, una instancia RDS, un balanceador de carga. Son *stateful* (con estado): si se permite el tráfico de entrada, el tráfico de respuesta se permite automáticamente de salida.

Las **ACLs de Red (NACLs)** operan a nivel de subred y son *stateless* (sin estado): debes permitir explícitamente tanto el tráfico de entrada como el de salida por separado.

Para la mayoría de los casos de uso, los Grupos de Seguridad son suficientes. Las NACLs añaden una capa extra cuando necesitas controles a nivel de subred — por ejemplo, bloquear un rango de IP específico para que nunca llegue a una subred.

«Grupos de seguridad a nivel de instancia», escribió Leo en la pizarra. «NACLs a nivel de subred.»

«Y nunca dejes el puerto 22 abierto a 0.0.0.0/0», añadió Priya, mirando a Leo.

«Eso fue una vez», dijo Leo.

«Siempre es exactamente una vez», dijo Priya, «hasta que deja de serlo.»

**Peering de VPC: Conectar Redes Privadas**

¿Y si Nimbus crece hasta tener múltiples VPCs? (Esto pasa. Los equipos crecen. Los servicios se aíslan en cuentas separadas.)

El **Peering de VPC** permite que dos VPCs se comuniquen de forma privada como si estuvieran en la misma red. El tráfico no sale de la red privada de AWS.

Límites importantes:

- El peering de VPC no es transitivo. Si la VPC A hace peering con la VPC B y la VPC B hace peering con la VPC C, A y C no pueden comunicarse — a menos que añadas un par directo A-C.
- Los bloques CIDR no pueden superponerse entre VPCs con peering.

Para arquitecturas más grandes con muchas VPCs, **AWS Transit Gateway** (Capítulo 25) maneja el enrutamiento transitivo sin requerir una malla completa de conexiones de peering.

## Fortalezas y Limitaciones

**Por qué importa el diseño de VPC**:

- El aislamiento de red es defensa en profundidad — vulnerar una capa no significa comprometer todo
- Las subredes privadas reducen significativamente la superficie de ataque
- Las tablas de rutas y los grupos de seguridad dan un control preciso sobre los flujos de tráfico
- Las VPCs se integran con todos los servicios de red de AWS (Direct Connect, VPN, Transit Gateway)

**Donde se complica**:

- El diseño de VPC requiere planificación anticipada — los bloques CIDR son difíciles de cambiar después
- Demasiadas VPCs pequeñas crean complejidad de peering (problema de n al cuadrado)
- La depuración de problemas de red en VPCs requiere entender simultáneamente tablas de rutas, grupos de seguridad, NACLs y asociaciones de subred
- Los costes del NAT Gateway pueden sorprenderte a escala (tarifas de procesamiento por GB)

## Resumen

- Una **VPC** es una red privada lógicamente aislada en AWS — tu lote vallado dentro de la nube pública.
- Las **subredes** dividen tu VPC por Zona de Disponibilidad. Las subredes públicas se conectan al Internet Gateway; las privadas no.
- Pon los recursos orientados a internet (balanceadores de carga) en subredes públicas. Pon todo lo demás (EC2, bases de datos, cachés) en subredes privadas.
- Las **tablas de rutas** controlan hacia dónde fluye el tráfico. Cada subred tiene una.
- El **NAT Gateway** (en una subred pública) permite a los recursos privados iniciar conexiones de internet de salida sin aceptar conexiones de entrada.
- El **Peering de VPC** conecta dos VPCs de forma privada. No es transitivo — para conectividad a gran escala, usa Transit Gateway.
- Los **grupos de seguridad** protegen recursos individuales (con estado). Las **NACLs** protegen subredes enteras (sin estado).

## Consejos para el Examen

*Dominio SAA-C03: Diseñar Arquitecturas Seguras (Dominio 1, Tarea 1.2)*

- **Subred pública vs privada**: la diferencia está en la tabla de rutas. La subred pública tiene una ruta a un Internet Gateway. La privada no.
- **Colocación del NAT Gateway**: siempre en la subred *pública*. Los recursos de la subred privada enrutan el tráfico de salida hacia él.
- **Alta disponibilidad para NAT**: crea un NAT Gateway por AZ. Si tienes un NAT Gateway en AZ-a y las instancias AZ-b enrutan a través de él, el fallo de AZ-a también elimina el acceso a internet de AZ-b.
- **El Peering de VPC no es transitivo**: el examen describirá tres VPCs y preguntará si pueden comunicarse a través de la del medio — la respuesta es no sin peering directo o Transit Gateway.
- **Superposición de CIDR**: Las VPCs con peering no pueden tener bloques CIDR superpuestos. Trampa clásica del examen.
- **Bastion host (jump box)**: para hacer SSH en una instancia EC2 privada, necesitas un bastion host en la subred pública. El bastion es la única máquina con IP pública; las instancias privadas solo aceptan SSH del grupo de seguridad del bastion.
- **Endpoints de VPC**: permiten a los recursos privados llegar a los servicios de AWS (S3, DynamoDB) sin pasar por el NAT Gateway. Dos tipos: **endpoints de puerta de enlace** (S3, DynamoDB — gratis) y **endpoints de interfaz** (otros servicios — precio por hora más datos).

## Ejercicios

**Ejercicio 1 — Recordar**

Explica por qué una base de datos debería estar en una subred privada. ¿Qué amenaza específica mitiga esto?

*(Pista: ¿Qué puede hacer alguien a una base de datos que está en internet público que no puede hacer a una que solo es accesible desde dentro de la VPC?)*

**Ejercicio 2 — Práctica de Examen**

*Escenario*: Una empresa está diseñando una aplicación web de tres niveles en AWS. El nivel web (ALB + EC2) debe aceptar tráfico de internet. El nivel de aplicación (EC2) solo debe recibir tráfico del nivel web. El nivel de base de datos (RDS) solo debe recibir tráfico del nivel de aplicación. Las instancias EC2 del nivel de aplicación necesitan descargar paquetes de software de internet. La solución debe ser altamente disponible.

¿Qué arquitectura satisface MEJOR estos requisitos?

A) Todos los niveles en subredes públicas; los grupos de seguridad restringen el tráfico entre niveles  
B) Nivel web en subredes públicas; niveles de aplicación y base de datos en subredes privadas; un NAT Gateway en una subred pública  
C) Nivel web en subredes públicas; niveles de aplicación y base de datos en subredes privadas; un NAT Gateway por AZ  
D) Todos los niveles en subredes privadas; un Internet Gateway proporciona acceso bidireccional a internet para todos los niveles

**Pista 1**: «Altamente disponible» significa sin punto único de fallo. ¿Qué opción introduce un NAT Gateway como punto único de fallo?

**Pista 2**: Si la AZ del NAT Gateway cae, ¿qué instancias pierden el acceso a internet?

**Pista 3**: Lee el requisito cuidadosamente — el nivel de aplicación necesita acceso a internet *de salida*, no de entrada.

**Respuesta**: C

**Explicación**: El nivel web en subredes públicas proporciona acceso orientado a internet a través del ALB. Los niveles de aplicación y base de datos en subredes privadas aseguran que no sean directamente accesibles desde internet. Un NAT Gateway por AZ (uno en cada subred pública) proporciona acceso a internet de salida de alta disponibilidad para las instancias de subred privada — si una AZ falla, el NAT Gateway de la otra AZ continúa sirviendo el tráfico.

**¿Por qué no A?** Las subredes públicas para todos los niveles exponen la aplicación y la base de datos directamente a internet, anulando el propósito del modelo de seguridad por niveles.

**¿Por qué no B?** Un NAT Gateway en una única AZ es un punto único de fallo. Si el NAT Gateway de esa AZ falla, todas las instancias privadas pierden el acceso a internet de salida.

**¿Por qué no D?** Un Internet Gateway proporciona conectividad bidireccional — las subredes privadas con una ruta al Internet Gateway son efectivamente subredes públicas.

*Dominio SAA-C03: Diseñar Arquitecturas Seguras — Tarea 1.2*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus está creciendo. El equipo de ingeniería quiere separar el «servicio de menú» en su propia cuenta con su propia VPC, mientras mantiene la aplicación principal de Nimbus en una cuenta y VPC separadas.

¿Cómo conectarías estas dos VPCs para que la aplicación principal pueda consultar el servicio de menú? ¿Qué restricciones necesitarías planificar? ¿Qué usarías en su lugar si Nimbus tuviera diez VPCs de microservicios separadas que todas necesitan comunicarse?

*(No hay una única respuesta correcta. El objetivo es practicar el diseño de red multi-VPC.)*

## Escena Post-Créditos

Priya rediseñó la red.

Tres días después, cada recurso estaba en el lugar correcto. Las instancias EC2 en subredes privadas. Los balanceadores de carga en subredes públicas. RDS y ElastiCache accesibles solo desde la capa de aplicación. Grupos de seguridad con los puertos mínimos necesarios.

Leo había intentado hacer SSH directamente en la base de datos para comprobar algo. No pudo. La conexión se agotó.

«Bien», dijo Priya.

«Solo necesitaba comprobar una cosa», dijo Leo.

«¿El qué?»

«Si el índice estaba configurado correctamente.»

Priya abrió su portátil. «Puedo comprobarlo desde el bastion host, a través de la instancia de aplicación, que tiene las credenciales de base de datos correctas en Secrets Manager.»

«Son cuatro saltos.»

«Es lo correcto.» Escribió algo. «El índice está configurado. De nada.»

Leo miró la pantalla por un momento.

«Voy a aprender esto», dijo.

«Ya lo estás haciendo», dijo ella. «Solo te has quejado de los controles de seguridad en lugar de quejarte de que no existen.»

En el próximo capítulo: cómo internet encuentra a Nimbus — la maquinaria invisible de los nombres de dominio.
