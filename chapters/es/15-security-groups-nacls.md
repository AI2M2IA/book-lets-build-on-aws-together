# Capítulo 15: Los Guardias en la Puerta

La oficina estaba tranquila un martes por la mañana cuando Priya abrió los VPC flow logs y empezó a leer. Fuera de la ventana, la ciudad se despertaba. Dentro, la pantalla mostraba algo que no debería estar ahí: una conexión saliente desde una instancia de EC2 a las 2:17 AM hacia una dirección IP en Rumania.

La antigua clave de despliegue de la primera versión de Nimbus seguía activa. Había realizado tres llamadas a la API la semana pasada. Leo no sabía qué las había hecho.

---

*La revisión de IAM había reemplazado las claves de acceso por roles. Cada servicio ahora tenía exactamente los permisos que necesitaba. Pero mientras ese trabajo ocurría, un problema más antiguo había estado empeorando silenciosamente: una credencial activa de un pipeline de despliegue descomisionado seguía viva, y algo la había usado. La capa de IAM había sido reforzada. Los controles de red que podrían haber contenido el daño necesitaban la misma atención.*

---

Priya abrió los VPC flow logs — los registros de tráfico de red que muestran cada conexión que entra y sale de la VPC.

«El martes a las 2:17 AM», dijo, «hubo una conexión saliente desde la instancia de EC2 que ejecutaba la antigua API hacia una dirección IP en Rumania.»

«Esa no es nuestra infraestructura», dijo Leo.

«No.»

«Entonces alguien estaba en nuestra instancia de EC2.»

«O algo.»

Rastrearon el origen: la antigua clave de despliegue había sido usada para cargar un pequeño script a la instancia de EC2. El script había intentado escanear puertos en servidores adyacentes. La mayoría de los escaneos habían fallado.

«Ya lo desplegué — oh.» Leo había desplegado una corrección de la regla del grupo de seguridad antes de que la investigación estuviera completa. La corrección era correcta, pero la había hecho antes de que Priya terminara de leer los flow logs. Ella había tenido que pausar y verificar que el cambio no había afectado nada inesperado.

«La próxima vez, espera hasta que la investigación esté cerrada antes de subir cambios», dijo.

«Los grupos de seguridad los bloquearon», dijo Priya. «El atacante entró en una instancia de EC2. No pudo llegar a las demás porque los grupos de seguridad solo permitían tráfico desde el balanceador de carga.»

«Entonces el daño quedó contenido.»

«Porque teníamos grupos de seguridad correctamente configurados. Imagina si hubiéramos dejado el puerto 5432 abierto a cualquier instancia de EC2 en la cuenta.»

Leo no necesitaba imaginarlo. Había visto esa configuración en la configuración original.

«¿Hemos pensado en lo que eso significaría?» continuó Priya. «Cualquier instancia de EC2 en la cuenta — incluida la de la clave comprometida — podría haberse conectado directamente a la base de datos. Ejecutar SQL arbitrario. Descargar el historial de pedidos de cada cliente. Eliminar tablas.»

«En cambio, fueron rechazados cada vez que lo intentaron», dijo Leo.

«Sí. Porque el grupo de seguridad de la base de datos solo acepta conexiones del grupo de seguridad de la API. No de cualquier EC2 en la cuenta. No de cualquier IP. Específicamente del grupo de seguridad de la API.»

«Esa única decisión de diseño», dijo Maya, «fue la diferencia entre un incidente contenido y una brecha de datos total.»

«El diseño de grupos de seguridad no es una casilla de verificación», dijo Priya. «Es la seguridad real del sistema.»

Rafael había estado escuchando. «¿Cómo aprendes cuál es la configuración correcta? Las reglas parecen arbitrarias al principio.»

«Empiezas listando lo que cada componente necesita hacer», dijo Priya. «El balanceador de carga necesita aceptar HTTPS de cualquier lugar. El servidor de la API necesita aceptar HTTP solo del balanceador de carga. La base de datos necesita aceptar PostgreSQL solo del servidor de la API. Redis necesita aceptar el puerto 6379 solo del servidor de la API. Esos requisitos se mapean directamente a las reglas de entrada. Todo lo demás se deniega por defecto.»

«¿Y la salida?»

«La salida es donde la gente se vuelve perezosa. La mayoría de los equipos dejan la salida como permitir-todo. Eso significa que una instancia comprometida puede llamar a cualquier cosa. Vamos a apretar eso.»

**Dos Capas de Seguridad de Red**

En una VPC, tienes dos herramientas distintas para controlar el tráfico de red:

**Grupos de Seguridad**: Cortafuegos virtuales adjuntos a recursos individuales (instancias de EC2, bases de datos de RDS, balanceadores de carga, funciones de Lambda en una VPC). Operan a nivel de recurso.

**ACL de Red (NACLs)**: Reglas de cortafuegos adjuntas a subredes. Operan en el límite de la subred — antes de que el tráfico llegue a cualquier recurso de esa subred.

Entender ambos requiere entender una diferencia crítica: **stateful vs stateless**.

**Stateful: Grupos de Seguridad**

Un grupo de seguridad es **stateful** (con estado).

Cuando permites tráfico entrante en un puerto específico, el tráfico de respuesta se permite automáticamente salir, aunque no haya una regla de salida explícita para ello.

Cuando permites tráfico saliente hacia un destino, la respuesta que regresa se permite automáticamente.

Piensa en un guardia de seguridad stateful en un edificio de oficinas. Muestras tu credencial para entrar. Más tarde sales. El guardia no necesita revisarte de nuevo al salir: el sistema sabe que te dejaron entrar y se te permite salir.

**Reglas del Grupo de Seguridad para la instancia de EC2 de la API de Nimbus:**

- **Entrante — TCP 8080 — desde el SG del Balanceador de Carga** → Aceptar tráfico de API del ALB
- **Entrante — TCP 22 — desde el SG del Bastion Host** → SSH solo desde el bastion
- **Saliente — TCP 5432 — hacia el SG de RDS** → Conectar a PostgreSQL
- **Saliente — TCP 6379 — hacia el SG de ElastiCache** → Conectar a Redis
- **Saliente — TCP 443 — hacia 0.0.0.0/0** → HTTPS hacia APIs externas

Nota: no hay regla de salida explícita para el puerto 8080. La regla de entrada es stateful — el tráfico de respuesta (la respuesta de la API al balanceador de carga) se permite automáticamente.

También nota: las reglas del grupo de seguridad hacen referencia a *otros grupos de seguridad*, no a direcciones IP. «Permitir tráfico entrante del grupo de seguridad del balanceador de carga» significa «permitir tráfico de cualquier recurso que tenga este grupo de seguridad adjunto». Esto es más flexible y mantenible que rastrear direcciones IP.

**Comportamiento predeterminado:**

- Por defecto, todo el tráfico entrante está denegado
- Por defecto, todo el tráfico saliente está permitido
- Todas las reglas se evalúan (los grupos de seguridad no tienen reglas ordenadas — todas las reglas coincidentes se aplican)
- Los grupos de seguridad solo pueden **permitir** tráfico — no puedes crear reglas de denegación explícita

**Stateless: ACLs de Red**

Una NACL es **stateless** (sin estado).

Cuando permites tráfico entrante en el puerto 8080, eso solo cubre el tráfico entrante. La respuesta (tráfico saliente en puertos efímeros) debe permitirse explícitamente con una regla de salida.

Piensa en un detector de metales. Lo atraviesas al entrar. El detector de metales no sabe que ya lo has pasado — tienes que pasarlo de nuevo al salir.

**Las reglas de NACL están numeradas y se evalúan en orden.** La primera regla que coincide gana. La regla 100 se evalúa antes que la 200. Si la regla 100 deniega el tráfico y la regla 200 lo permite, el tráfico se deniega.

Las NACLs pueden **denegar** explícitamente el tráfico — a diferencia de los grupos de seguridad, que solo pueden permitir. Esto las hace útiles para bloquear rangos de IP específicos.

**Comportamiento predeterminado de NACL:**

- La NACL predeterminada (creada con tu VPC) permite todo el tráfico entrante y saliente
- Una NACL personalizada deniega todo el tráfico por defecto (debes permitir explícitamente lo que quieras)

**NACL para la subred pública (simplificada):**

*Reglas de entrada (evaluadas en orden — la primera coincidencia gana):*

- Regla 100: TCP 443, de 0.0.0.0/0 → **Permitir** (HTTPS)
- Regla 110: TCP 80, de 0.0.0.0/0 → **Permitir** (HTTP)
- Regla 120: TCP 1024–65535, de 0.0.0.0/0 → **Permitir** (puertos de retorno efímeros)
- Regla \*: Todo el tráfico → **Denegar**

*Reglas de salida:*

- Regla 100: TCP 443, hacia 0.0.0.0/0 → **Permitir** (HTTPS)
- Regla 110: TCP 80, hacia 0.0.0.0/0 → **Permitir** (HTTP)
- Regla 120: TCP 1024–65535, hacia 0.0.0.0/0 → **Permitir** (puertos de retorno efímeros)
- Regla \*: Todo el tráfico → **Denegar**

La Regla 120 (puertos 1024-65535) permite los puertos efímeros — los puertos temporales de numeración alta usados para el tráfico de respuesta TCP. Como las NACLs son stateless, debes permitir explícitamente estos en la salida, o las respuestas de tu servidor no pasarán.

**Cuándo Usar Cuál**

«Espera — pero ¿*por qué* lo haríamos de esa manera?» preguntó Maya. «¿Por qué tener dos herramientas separadas — grupos de seguridad *y* NACLs — si los grupos de seguridad ya funcionan? ¿Cuál es el sentido de la complejidad extra?»

La respuesta es que operan a diferentes niveles y tienen diferentes capacidades. Los grupos de seguridad protegen recursos individuales y solo pueden permitir tráfico. Las NACLs protegen subredes enteras y pueden denegar explícitamente. Tener ambos significa que puedes aplicar reglas de permiso detalladas a nivel de recurso y reglas de denegación amplias a nivel de subred — sin que una interfiera con la otra.

Usa **grupos de seguridad** para la capa principal de control de acceso. Son más fáciles de gestionar, stateful (menor riesgo de bloqueos accidentales por olvidar los puertos efímeros) y admiten referencias a otros grupos de seguridad.

Usa **NACLs** para controles a nivel de subred, especialmente:

- **Reglas de denegación explícita**: Bloquear una dirección IP o rango específico para que no llegue a toda una subred
- **Bloqueo de emergencia**: Una IP está atacando activamente — agrega una regla de denegación en la NACL para bloquear toda la subred antes de que llegue a cualquier recurso

Quizás te estés preguntando: si los grupos de seguridad son stateful y bloquean toda la entrada por defecto, ¿cuándo necesitarías realmente las NACLs? Los grupos de seguridad manejan bien la mayoría de los casos. Pero hay una cosa que no pueden hacer: denegar explícitamente. Un grupo de seguridad solo puede permitir tráfico — si una regla no coincide, el tráfico se deniega por defecto. No puedes añadir una regla que diga «bloquea esta IP específica». Para eso, necesitas una NACL: una regla de denegación numerada que detiene un rango de direcciones específico antes de que llegue a cualquier recurso en la subred. Las NACLs son más útiles para la respuesta de emergencia (bloquear a un atacante activo) y para imponer límites a nivel de subred que no deberían depender de la configuración de recursos individuales.

«Entonces el grupo de seguridad es el control detallado», dijo Maya, «¿y la NACL es el trazo amplio?»

«Los grupos de seguridad protegen recursos individuales», confirmó Priya. «Las NACLs protegen subredes enteras. Cuando quieres bloquear una IP para que no llegue a nada en tu red, NACL. Cuando quieres permitir solo que el balanceador de carga llegue al servidor de la API, grupo de seguridad.»

«¿Hemos pensado en lo que pasa si el atacante vuelve con una IP diferente?» dijo Priya. «La NACL bloquea un rango. Se cambian a otro.»

«Para eso está GuardDuty», dijo Leo. «Detección de comportamiento. Si el mismo script se ejecuta desde una nueva IP, el patrón de tráfico se ve igual.»

«Llegaremos a eso», dijo Priya. «Lo primero es lo primero.»

«¿Cuánto cuesta todo esto al mes?» preguntó Tom.

Los grupos de seguridad y las NACLs en sí son gratis. AWS no cobra por el número de grupos de seguridad, el número de reglas ni el número de entradas de NACL. La consideración de coste es indirecta: las reglas de salida más estrictas de los grupos de seguridad pueden enrutar menos tráfico a través del NAT Gateway, reduciendo los cargos de procesamiento de datos.

«Así que los controles de seguridad son gratis», dijo Rafael. «El coste es la infraestructura que los soporta.»

«Correcto. Los NAT Gateways para alta disponibilidad. Los Interface VPC Endpoints para servicios que de otro modo pasarían por NAT. Esos tienen costes. Las reglas del grupo de seguridad en sí no.»

**Juntándolo Todo: La Defensa por Capas**

Después del incidente, Priya dibujó las capas de defensa de Nimbus en la pizarra:

```
Internet
  ↓
CloudFront + Shield (absorción de DDoS)
  ↓
WAF (filtrado a nivel de aplicación)
  ↓
Internet Gateway
  ↓
NACL en la subred pública (reglas a nivel de subred, bloqueo de emergencia)
  ↓
Grupo de Seguridad del ALB (HTTPS de cualquier lugar)
  ↓
NACL en la subred privada de la app
  ↓
Grupo de Seguridad de la API en EC2 (puerto 8080 solo del SG del ALB)
  ↓
NACL en la subred privada de datos
  ↓
Grupo de Seguridad de RDS (puerto 5432 solo del SG de la API)
```

«Cada capa asume que la anterior podría fallar», dijo. «La base de datos no confía en que la capa de red detuvo al atacante. La instancia de EC2 no confía en que el ALB detuvo al atacante. Cada capa impone sus propias reglas de forma independiente.»

«Defensa en profundidad», dijo Maya.

«Defensa en profundidad. Un atacante que atraviesa una capa todavía se enfrenta a la siguiente. Ninguna mala configuración por sí sola es catastrófica. Significa que una capa falla, y las demás resisten.»

Leo miró el diagrama. El atacante había comprometido una instancia de EC2. Había atravesado la capa de credenciales. Pero cada capa subsiguiente había resistido.

Eso era cómo se veía la defensa en profundidad en la práctica.

**El Incidente: Lo que Capturaron las Capas**

Volviendo al ataque de la IP rumana:

**Qué ocurrió**: El atacante usó la clave de despliegue comprometida para cargar un script de escaneo en una instancia de EC2. El script intentó conectarse a otros servicios.

**Qué lo detuvo**:

- El grupo de seguridad de RDS solo permitía la entrada en el puerto 5432 desde el grupo de seguridad de la instancia de EC2 de la API. El script no pudo llegar a la base de datos desde una herramienta de escaneo — no tenía adjunto el grupo de seguridad correcto.
- El grupo de seguridad de ElastiCache solo permitía la entrada en el puerto 6379 desde el grupo de seguridad de la instancia de EC2 de la API.
- Otras instancias de EC2 solo permitían SSH desde el grupo de seguridad del bastion host.

**Lo que no lo detuvo**: 

- Las reglas de salida de la instancia de EC2 permitían HTTPS hacia 0.0.0.0/0 (necesario para la descarga de paquetes). El script usó esto para hacer conexiones salientes hacia el servidor del atacante.

Después del incidente, Priya agregó:

- Una regla de NACL que bloquea el rango de IP rumano
- Una regla de salida más restrictiva en las instancias de EC2 (solo se permitían destinos específicos conocidos como buenos)
- Una verificación de que **IMDSv2 estaba impuesto** (`HttpTokens=required`) en cada instancia — el script se había ejecutado *en* la instancia, lo que significaba que podría haber consultado el servicio de metadatos para obtener las credenciales temporales del rol de la instancia. IMDSv2 se había habilitado allá en el Capítulo 4; Priya verificó que seguía siendo requerido en todas partes, porque un atacante con ejecución de código más IMDSv1 equivale a credenciales de AWS robadas.

---

**Leer los Flow Logs: Lo que Vio Priya**

La investigación empezó con los VPC flow logs. Priya abrió CloudWatch Logs Insights y ejecutó una consulta contra el grupo de flow logs de las últimas 48 horas:

```
fields @timestamp, srcAddr, dstAddr, srcPort, dstPort, action
| filter srcAddr = "10.0.10.7"
| filter action = "REJECT"
| sort @timestamp asc
```

`10.0.10.7` era la instancia de EC2 comprometida. El filtro REJECT mostraba los intentos de conexión que habían sido bloqueados.

Los resultados:

```
10.0.10.7 → 10.0.10.8  port 22    REJECT   # Otra instancia de EC2 — SSH bloqueado
10.0.10.7 → 10.0.10.9  port 22    REJECT   # Otra EC2 — SSH bloqueado
10.0.10.7 → 10.0.20.8  port 5432  REJECT   # RDS — bloqueado por el grupo de seguridad
10.0.10.7 → 10.0.20.9  port 5432  REJECT   # Réplica de RDS — bloqueado
10.0.10.7 → 10.0.20.11 port 6379  REJECT   # Redis — bloqueado
```

El escaneo había golpeado cada servicio interno. Cada intento había sido rechazado. El diseño del grupo de seguridad había resistido.

Pero también había una entrada saliente ACCEPT:

```
10.0.10.7 → 185.220.101.55  port 443  ACCEPT   2847 bytes
```

Ese era el intento de exfiltración de datos — 2,8 kilobytes enviados a la IP rumana por HTTPS. El grupo de seguridad permitía HTTPS de salida para descargas legítimas de paquetes. El atacante había usado esa regla.

«Los grupos de seguridad detuvieron el movimiento lateral», dijo Priya, guiando al equipo a través de los registros. «Pero la regla de salida era demasiado permisiva. Permitimos HTTPS hacia cualquier destino. Deberíamos permitir HTTPS solo hacia endpoints conocidos de AWS — CloudWatch, Secrets Manager, S3 — y hacia las CDNs de los repositorios de paquetes.»

Mostró las reglas de salida del grupo de seguridad actualizadas:

```
TCP 443 → pl-63a5400a (lista de prefijos del gateway endpoint de S3 de AWS)
TCP 443 → pl-02cd2c6b (CloudWatch Logs de AWS)
TCP 443 → 54.239.0.0/18 (repos de paquetes de AWS — se reduce con el tiempo)
```

«Eso elimina la regla general de HTTPS de salida. El HTTPS de salida ahora solo va a destinos conocidos como buenos.»

«¿Y las funciones de Lambda que llaman a APIs de terceros?» preguntó Leo.

«Esas pasan por el NAT Gateway, que tiene su propia regla de salida dedicada», dijo Priya. «Lambda no usa el grupo de seguridad de EC2. Interfaz de red diferente, conjunto de reglas diferente.»

---

**La Historia de Depuración Stateless**

Dos semanas después del incidente, Rafael — todavía en su primer mes — estaba ayudando a configurar un nuevo pipeline de datos. Implicaba una función de Lambda en una VPC que necesitaba llamar a una API interna que se ejecutaba en EC2.

La función de Lambda se agotaba (timeout). Cada llamada se agotaba.

Rafael revisó los grupos de seguridad. El grupo de seguridad de Lambda tenía una regla de salida para TCP 8080 hacia el grupo de seguridad de EC2. El grupo de seguridad de EC2 tenía una regla de entrada para TCP 8080 desde el grupo de seguridad de Lambda. Las reglas parecían correctas.

Se volvió hacia Leo. «Los grupos de seguridad se ven bien. ¿Por qué se está agotando?»

Leo miró la configuración de la subred. La función de Lambda estaba en una subred privada. La subred tenía una NACL personalizada que Priya había aplicado durante el endurecimiento de seguridad.

Miró las reglas de salida de la NACL:

```
Regla 100: TCP 443  → 0.0.0.0/0  ALLOW
Regla 110: TCP 5432 → 10.0.20.0/24 ALLOW
Regla *:   Todo     → 0.0.0.0/0  DENY
```

«La NACL permite HTTPS de salida y PostgreSQL de salida», dijo Leo. «No permite TCP 8080 de salida.»

«El grupo de seguridad lo permite», dijo Rafael.

«La NACL no. Y la NACL es stateless. Aunque el grupo de seguridad de la función de Lambda permita la conexión saliente, la NACL en el límite de la subred todavía evalúa el tráfico saliente. La NACL está bloqueando la llamada de Lambda antes de que salga de la subred.»

«Pero si agrego ALLOW para TCP 8080 de salida a la NACL—»

«También necesitas agregar ALLOW para los puertos efímeros de entrada», dijo Leo. «La respuesta de la instancia de EC2 regresa en un puerto aleatorio entre 1024 y 65535. Si las reglas de entrada de la NACL no permiten esos, la respuesta se bloquea en el viaje de regreso.»

Rafael actualizó la NACL:

```
Regla 100:  TCP 443       → 0.0.0.0/0      ALLOW  (salida)
Regla 105:  TCP 8080      → 10.0.10.0/24   ALLOW  (salida hacia la subred de EC2)
Regla 110:  TCP 5432      → 10.0.20.0/24   ALLOW  (salida hacia la subred de BD)
Regla *:    Todo          → 0.0.0.0/0      DENY
```

Y en el lado de entrada:

```
Regla 100:  TCP 1024-65535 desde 10.0.10.0/24  ALLOW  (tráfico de retorno de EC2)
Regla *:    Todo                               DENY
```

La función de Lambda se conectó inmediatamente.

«Por esto la gente odia las NACLs», dijo Rafael.

«Por esto necesitas entenderlas», dijo Priya. «Los errores que crean son precisamente los errores que están diseñadas para prevenir — flujos de tráfico inesperados. Entender el modelo stateless te dice exactamente dónde buscar cuando una conexión falla misteriosamente.»

«Grupo de seguridad stateful — tráfico de retorno automático. NACL stateless — el tráfico de retorno necesita reglas explícitas», repitió Rafael.

«Dilo hasta que sea parte de cómo piensas», dijo Priya.

---

**Bloqueo de Emergencia con NACL: La Regla del /24**

Después de identificar el rango de IP de origen del atacante, la respuesta de Priya fue inmediata: agregar una regla de denegación en la NACL.

Pero no bloqueó solo la IP individual. Bloqueó todo el `/24` — la subred de 256 direcciones desde la que el atacante operaba.

«¿Por qué todo el /24?» preguntó Leo.

«Porque el bloqueo de IP individual es un juego perdido. Los atacantes usan múltiples IPs dentro de un rango, rotando entre ellas cuando una se bloquea. Bloquear el /24 lo hace más difícil — necesitarían cambiarse a un bloque de direcciones diferente, lo que les cuesta tiempo y esfuerzo.»

La regla de NACL:

```
Regla 90:  TODO desde 185.220.101.0/24 → DENY
```

La regla 90 se evalúa antes de cualquier regla de permiso (que empiezan en la regla 100). Todo el rango se bloquea antes de que se considere cualquier regla de permiso.

«¿Y esto aplica a cada recurso en la subred?» preguntó Leo.

«A cada recurso. Ese es el sentido de una NACL — se aplica antes de que el tráfico llegue al grupo de seguridad de cualquier recurso individual. Una denegación de NACL en la regla 90 significa que el paquete nunca llega a la evaluación del grupo de seguridad.»

«¿Podríamos hacer esto con un grupo de seguridad en su lugar?»

«No. Los grupos de seguridad solo pueden permitir tráfico. No hay regla de denegación. Si quieres bloquear una IP específica para que no llegue a ningún recurso en una subred, la NACL es la única opción.»

Este es el caso de uso principal de las reglas de denegación de NACL: respuesta de emergencia a ataques activos. El grupo de seguridad es el mecanismo de control principal. La NACL es el freno de emergencia.

---

**Patrones de Diseño de Grupos de Seguridad: Referencia por ID**

«¿Hemos pensado en lo que pasa cuando nuestras instancias de EC2 son reemplazadas?» preguntó Priya. «Auto Scaling termina las instancias antiguas y lanza nuevas. Las nuevas instancias obtienen nuevas direcciones IP privadas.»

«Si las reglas del grupo de seguridad hacen referencia a direcciones IP», dijo Leo lentamente, «tendríamos que actualizar las reglas cada vez que se reemplaza una instancia.»

«Exactamente. Por eso no haces referencia a direcciones IP en las reglas del grupo de seguridad para el tráfico intra-VPC.»

Los grupos de seguridad pueden hacer referencia a otros grupos de seguridad en lugar de a direcciones IP. Cuando una regla dice «permitir entrada del grupo de seguridad del balanceador de carga», significa «permitir tráfico de cualquier recurso que tenga el grupo de seguridad del balanceador de carga adjunto». Auto Scaling puede lanzar mil nuevas instancias con una nueva IP cada una, y la regla sigue siendo válida.

La estructura de grupos de seguridad de Nimbus:

```
nimbus-alb-sg (Balanceador de Carga)
  - Entrada: TCP 443 de 0.0.0.0/0
  - Entrada: TCP 80 de 0.0.0.0/0

nimbus-api-sg (Instancias de la API en EC2)
  - Entrada: TCP 8080 de nimbus-alb-sg
  - Entrada: TCP 22 de nimbus-bastion-sg
  - Salida: TCP 5432 hacia nimbus-rds-sg
  - Salida: TCP 6379 hacia nimbus-redis-sg

nimbus-rds-sg (RDS)
  - Entrada: TCP 5432 de nimbus-api-sg

nimbus-redis-sg (ElastiCache)
  - Entrada: TCP 6379 de nimbus-api-sg

nimbus-bastion-sg (Bastion Host)
  - Entrada: TCP 22 de <IP de la VPN de la oficina>
```

Sin direcciones IP para el tráfico interno. Solo IDs de grupos de seguridad. Cuando una instancia se reemplaza, la membresía del grupo de seguridad se transfiere automáticamente a la nueva instancia.

«¿Y para los microservicios que estamos planeando?» preguntó Rafael. «Eventualmente tendremos una docena de servicios. Cada uno necesita hablar con algunos otros, pero no con todos.»

«Cada servicio obtiene su propio grupo de seguridad», dijo Priya. «El grupo de seguridad del Servicio A se referencia en las reglas de entrada de cada servicio al que el Servicio A tiene permiso de llamar. Los servicios que no deberían comunicarse simplemente no referencian los grupos de seguridad de los demás.»

Este es el **patrón hub-and-spoke de grupos de seguridad** para microservicios. Un grupo de seguridad de base de datos compartido tiene reglas de entrada de cinco grupos de seguridad de servicios diferentes. Si un sexto servicio necesita acceso a la base de datos, agregas su grupo de seguridad a la regla de entrada de la base de datos. Si el acceso debe eliminarse, eliminas la referencia. Sin gestión de IP. Sin reglas obsoletas que apunten a servidores descomisionados.

«El grupo de seguridad es la identidad», dijo Priya. «La dirección IP es un accidente de la programación.»

---

**Cortafuegos de Privilegio Mínimo: La Disciplina**

«¿Hemos pensado en cuál es la postura correcta para las reglas de salida?» preguntó Priya durante la revisión posterior al incidente.

La mayoría de los equipos dejan las reglas de salida del grupo de seguridad de EC2 en el valor predeterminado: permitir todo el tráfico saliente. Esto es conveniente — la aplicación puede llamar a cualquier cosa — pero no es privilegio mínimo.

El principio de Priya: las reglas de salida deberían ser tan específicas como las reglas de entrada.

Las reglas de salida del grupo de seguridad de la API de Nimbus, tras el endurecimiento:

```
TCP 5432 → nimbus-rds-sg       (PostgreSQL a RDS)
TCP 6379 → nimbus-redis-sg     (Redis a ElastiCache)
TCP 443  → lista de prefijos s3.amazonaws.com   (gateway endpoint de S3)
TCP 443  → endpoint de secretsmanager           (Secrets Manager)
TCP 443  → endpoint de logs                      (CloudWatch Logs)
```

Sin «permitir todo el tráfico saliente». Cada destino nombrado.

«Esto es mucho mantenimiento», dijo Leo.

«Es más mantenimiento que permitir-todo», reconoció Priya. «Es menos limpieza que una brecha de datos. El atacante que comprometió la instancia de EC2 podría haber exfiltrado más datos si las reglas de salida estuvieran abiertas. Usaron la regla de HTTPS-hacia-cualquier-lugar porque estaba ahí.»

«Y con reglas de salida específicas, incluso una instancia comprometida solo puede enviar datos a destinos aprobados.»

«Exactamente. El grupo de seguridad se convierte en la última línea de contención, no solo en la primera línea de defensa.»

---

## Fortalezas y Limitaciones

**Grupos de Seguridad**:

- Stateful (sin dolores de cabeza con puertos efímeros)
- Pueden referenciar otros grupos de seguridad (más flexible que las IPs)
- Solo reglas de permitir — sin denegación explícita
- Operan a nivel de recurso — granulares
- Las reglas se aplican inmediatamente — sin orden, sin prioridad
- Se pueden adjuntar múltiples grupos de seguridad a un recurso — las reglas de todos se combinan

**NACLs**:

- Stateless (requiere reglas explícitas para ambas direcciones, incluidos los puertos efímeros)
- Pueden denegar explícitamente — útil para bloquear IPs conocidas como malas
- Operan a nivel de subred — trazo más amplio
- Reglas numeradas evaluadas en orden — predecibles pero requieren una gestión cuidadosa
- Se aplican antes de que el tráfico llegue a cualquier recurso de la subred — primera línea de defensa
- Efectivas para el bloqueo de IP de emergencia en toda una subred

**Dónde encaja cada herramienta**:

Usa los grupos de seguridad para todo por defecto. Añade NACLs cuando necesites reglas de denegación explícita — bloquear un rango de IP, bloquear un puerto a nivel de subred independientemente de la configuración de recursos individuales, o imponer que una subred de datos nunca pueda recibir tráfico de una fuente específica. Las NACLs no son un reemplazo de los grupos de seguridad; son un complemento para situaciones donde el diseño de solo-permitir de los grupos de seguridad es insuficiente.

## Resumen

El incidente de la IP rumana había sido contenido por controles de seguridad que ya estaban en su lugar — no por suerte, sino por diseño. Los grupos de seguridad habían prevenido el movimiento lateral dentro de la VPC. Después del incidente, las NACLs añadieron la capacidad de bloquear explícitamente el rango de IP del atacante en el límite de la subred. Los VPC flow logs hicieron el ataque visible. Dos herramientas, dos capas, dos trabajos diferentes — con registro para probar lo que ocurrió.

- Los **Grupos de Seguridad** son cortafuegos virtuales stateful para recursos individuales. Solo reglas de permitir. Todas las reglas evaluadas simultáneamente.
- Las **NACLs** son cortafuegos stateless para subredes enteras. Reglas de permitir y denegar. Reglas evaluadas en orden numérico — la primera coincidencia gana.
- **Stateful** significa que el tráfico de respuesta se permite automáticamente. **Stateless** significa que debes permitir explícitamente el tráfico en ambas direcciones, incluidos los puertos de retorno efímeros.
- Los grupos de seguridad son tu capa principal de control de acceso. Las NACLs son la anulación a nivel de subred — especialmente para el bloqueo de emergencia.
- Cuando una NACL permite el tráfico entrante, también debes permitir los puertos efímeros de salida (1024-65535) para que la respuesta TCP pase.
- **Referencia los grupos de seguridad por ID**, no por dirección IP, para el tráfico intra-VPC. Auto Scaling reemplaza las instancias; la membresía del grupo de seguridad se transfiere automáticamente.
- Las **reglas de salida específicas** en las instancias de EC2 limitan lo que una instancia comprometida puede hacer — cortafuegos de privilegio mínimo.
- Usa los flow logs para ver lo que los grupos de seguridad y las NACLs están haciendo realmente. Las reglas son teoría. Los registros son evidencia.

## Consejos para el Examen

*Dominio SAA-C03: Diseñar Arquitecturas Seguras (Dominio 1, Tarea 1.2)*

- **Stateful vs stateless**: Esta distinción es el concepto más evaluado en este capítulo. Grupos de seguridad = stateful = respuesta permitida automáticamente. NACLs = stateless = debes permitir explícitamente el tráfico de respuesta.
- **Reglas de grupo de seguridad**: Sin denegación explícita. Cuando se adjuntan múltiples grupos de seguridad a una instancia, se aplica la unión de todas las reglas. Todas las reglas coincidentes se evalúan simultáneamente.
- **Orden de reglas de NACL**: Las reglas se evalúan del número más bajo al más alto. La regla 100 antes que la 200. La primera coincidencia gana. La regla `*` (asterisco) al final es la denegación implícita. Agregar una regla de denegación en la regla 90 bloquea antes que cualquier regla de permiso en la 100.
- **Puertos efímeros**: El error clásico de NACL es olvidar permitir la salida en los puertos 1024-65535. Si tu NACL permite HTTP entrante (puerto 80) pero no permite los puertos efímeros de salida, los usuarios pueden enviar solicitudes pero nunca recibirán respuestas. Este es el escenario de NACL más común del examen.
- **Referenciación de grupos de seguridad**: Puedes permitir tráfico de otro grupo de seguridad (no solo de una IP). Este es el patrón recomendado para el tráfico intra-VPC. El examen usa frecuentemente «permitir entrada del grupo de seguridad del ALB» como la respuesta correcta para restringir el acceso a EC2.
- **NACL predeterminada vs NACL personalizada**: La NACL predeterminada permite todo el tráfico. Una NACL personalizada (que tú creas) deniega todo el tráfico por defecto. Escenario del examen: «creé una nueva NACL y ahora el tráfico está bloqueado» → revisa si faltan reglas de permitir.
- **Bloquear la IP de un atacante**: Los grupos de seguridad no pueden bloquear IPs específicas (solo permitir). Las NACLs pueden denegar explícitamente una IP o CIDR específico. Escenario del examen: «bloquear una IP específica para que no llegue a ningún recurso en la subred» → regla de denegación de NACL.
- **Depurar fallos de conexión**: Comprueba el orden: grupo de seguridad en el origen (salida) → grupo de seguridad en el destino (entrada) → NACL en la subred de origen (salida + puertos efímeros) → NACL en la subred de destino (entrada). La mayoría de los fallos de conexión del examen son causados por una regla de salida de NACL faltante o una permisión de puerto efímero faltante.
- **Múltiples subredes y NACLs**: Una NACL aplica a todas las subredes asociadas a ella. Una subred solo puede asociarse con una NACL. El examen puede preguntar qué NACL actualizar cuando se ve afectado el tráfico de una subred específica.

## Ejercicios

**Ejercicio 1 — Recordar**

Una desarrolladora agrega una regla de entrada a un grupo de seguridad que permite el tráfico en el puerto 443. ¿También necesita agregar una regla de salida para permitir la respuesta del servidor? ¿Por qué o por qué no?

Si en cambio agrega una regla de entrada a una NACL que permite el tráfico en el puerto 443, ¿necesita agregar una regla de salida? ¿Por qué o por qué no?

**Pista**: Recuerda las analogías del capítulo — ¿es cada una el guardia de seguridad que recuerda haberte dejado entrar, o el detector de metales que tienes que volver a pasar al salir?

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: Una empresa tiene una aplicación web ejecutándose en instancias de EC2 en una subred pública. La aplicación acepta tráfico HTTPS (puerto 443) desde internet. Los usuarios reportan que pueden conectarse a la aplicación pero no pueden recibir respuestas: las solicitudes quedan colgadas y se agotan.

El grupo de seguridad de EC2 tiene una regla de entrada que permite TCP 443 desde 0.0.0.0/0. La NACL de la subred tiene una regla de entrada (regla 100) que permite TCP 443 desde 0.0.0.0/0 y una regla de salida (regla 100) que permite TCP 443 hacia 0.0.0.0/0.

¿Cuál es la causa MÁS probable del problema?

A) Al grupo de seguridad le falta una regla de salida para TCP 443  
B) Las instancias de EC2 no tienen direcciones IP elásticas  
C) Al grupo de seguridad le falta una regla de entrada para los puertos efímeros  
D) A la NACL le falta una regla de salida que permita los puertos efímeros (1024-65535)

**Pista 1**: Los grupos de seguridad son stateful — permiten automáticamente las respuestas. Las NACLs son stateless — no lo hacen.

**Pista 2**: Cuando un navegador se conecta a un servidor web en el puerto 443, la respuesta del servidor regresa en un puerto efímero aleatorio (1024-65535), no en el puerto 443.

**Pista 3**: La NACL tiene una regla de salida para el 443, pero la respuesta no va al puerto 443.

**Respuesta**: D

**Explicación**: La NACL es stateless. Cuando los usuarios se conectan al servidor en el puerto 443, la respuesta TCP del servidor viaja de regreso en un puerto efímero (elegido aleatoriamente entre 1024-65535). La regla de salida de la NACL solo permite el puerto 443, por lo que la respuesta queda bloqueada por la regla de denegación predeterminada. Agregar una regla de salida de NACL que permita TCP 1024-65535 resolvería esto.

**¿Por qué no A?** Los grupos de seguridad son stateful — el tráfico de respuesta se permite automáticamente independientemente de las reglas de salida. No se necesita ninguna regla de salida en el grupo de seguridad.

**¿Por qué no B?** Las IPs elásticas afectan si las instancias tienen IPs públicas, no si las conexiones establecidas pueden recibir respuestas.

**¿Por qué no C?** Los puertos efímeros son para el tráfico de respuesta saliente, no para el entrante. La conexión entrante de los usuarios llega en el puerto 443, que ya está permitido.

*Dominio SAA-C03: Diseñar Arquitecturas Seguras — Tarea 1.2*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Después del ataque de la IP rumana, Priya quiere implementar dos controles adicionales:

1. Bloquear todo el rango de IP 185.0.0.0/8 para que no llegue a ningún recurso en la subred pública
2. Asegurarse de que la subred privada que contiene la base de datos nunca pueda comunicarse con internet, incluso si alguien configura mal un grupo de seguridad

¿Qué herramientas usarías para cada requisito y cómo las configurarías? ¿Podrías usar grupos de seguridad para ambos? ¿Podrías usar NACLs para ambos?

*(No existe una única respuesta correcta. El objetivo es entender qué herramienta se adapta a qué problema.)*

## Escena Post-Créditos

El incidente quedó contenido. La clave de despliegue comprometida fue desactivada. El rango de IP rumano fue bloqueado en la NACL. El antiguo script fue eliminado de la instancia de EC2.

Priya escribió un informe del incidente. Lo compartió con el equipo.

La última línea del informe: «Causa raíz: una credencial activa de un pipeline de despliegue descomisionado nunca fue rotada ni revocada. Recomendación: rotación automatizada de credenciales y auditoría periódica de todas las credenciales de IAM.»

Leo lo leyó tres veces.

«Debería haber rotado esa clave», dijo.

«Sí», dijo Priya.

«¿Cómo nos aseguramos de que esto no vuelva a pasar?»

«Automatización», dijo. «Y algo que vigile a los vigilantes.»

En el próximo capítulo: la caja fuerte donde Nimbus guarda sus secretos — y la rotación que hace que las claves robadas sean inútiles.
