# Capítulo 15: Los Guardias en la Puerta

La antigua clave de despliegue de la primera versión de Nimbus seguía activa. Había realizado tres llamadas a la API la semana pasada. Leo no sabía qué las había hecho.

Priya abrió los registros de VPC Flow Logs: los registros de tráfico de red que muestran cada conexión que entra y sale de la VPC.

"El martes a las 2:17 AM", dijo, "hubo una conexión saliente desde la instancia de EC2 que ejecutaba la antigua API hacia una dirección IP en Rumania."

"Esa no es nuestra infraestructura", dijo Leo.

"No."

"Entonces alguien estaba en nuestra instancia de EC2."

"O algo."

Rastrearon el origen: la antigua clave de despliegue había sido usada para cargar un pequeño script a la instancia de EC2. El script había intentado escanear puertos en servidores adyacentes. La mayoría de los escaneos habían fallado.

"Los grupos de seguridad los bloquearon", dijo Priya. "El atacante entró en una instancia de EC2. No pudo llegar a las demás porque los grupos de seguridad solo permitían tráfico desde el balanceador de carga."

"Entonces el daño quedó contenido."

"Porque teníamos grupos de seguridad correctamente configurados. Imagina si hubiéramos dejado el puerto 5432 abierto a cualquier instancia de EC2 en la cuenta."

Leo no necesitaba imaginarlo. Había visto esa configuración en la configuración original.

**Dos Capas de Seguridad de Red**

En una VPC, tienes dos herramientas distintas para controlar el tráfico de red:

**Grupos de Seguridad**: Cortafuegos virtuales adjuntos a recursos individuales (instancias de EC2, bases de datos de RDS, balanceadores de carga, funciones de Lambda en una VPC). Operan a nivel de recurso.

**ACL de Red (NACLs)**: Reglas de cortafuegos adjuntas a subredes. Operan en el límite de la subred, antes de que el tráfico llegue a cualquier recurso de esa subred.

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

Nota: no hay regla de salida explícita para el puerto 8080. La regla de entrada es stateful: el tráfico de respuesta (la respuesta de la API al balanceador de carga) se permite automáticamente.

También nota: las reglas del grupo de seguridad hacen referencia a *otros grupos de seguridad*, no a direcciones IP. "Permitir tráfico entrante del grupo de seguridad del balanceador de carga" significa "permitir tráfico de cualquier recurso que tenga este grupo de seguridad adjunto." Esto es más flexible y mantenible que rastrear direcciones IP.

**Comportamiento predeterminado:**

- Por defecto, todo el tráfico entrante está denegado
- Por defecto, todo el tráfico saliente está permitido
- Todas las reglas se evalúan (los grupos de seguridad no tienen reglas ordenadas: todas las reglas coincidentes se aplican)
- Los grupos de seguridad solo pueden **permitir** tráfico: no puedes crear reglas de denegación explícita

**Stateless: ACLs de Red**

Una NACL es **stateless** (sin estado).

Cuando permites tráfico entrante en el puerto 8080, eso solo cubre el tráfico entrante. La respuesta (tráfico saliente en puertos efímeros) debe permitirse explícitamente con una regla de salida.

Piensa en un detector de metales. Lo atraviesas al entrar. El detector de metales no sabe que ya lo has pasado: tienes que pasarlo de nuevo al salir.

**Las reglas de NACL están numeradas y se evalúan en orden.** La primera regla que coincide gana. La regla 100 se evalúa antes que la 200. Si la regla 100 deniega el tráfico y la regla 200 lo permite, el tráfico se deniega.

Las NACLs pueden **denegar** explícitamente el tráfico, a diferencia de los grupos de seguridad, que solo pueden permitir. Esto las hace útiles para bloquear rangos de IP específicos.

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

La Regla 120 (puertos 1024-65535) permite los puertos efímeros: los puertos temporales de numeración alta usados para el tráfico de respuesta TCP. Como las NACLs son stateless, debes permitir explícitamente estos en la salida, o las respuestas de tu servidor no pasarán.

**Cuándo Usar Cuál**

Usa **grupos de seguridad** para la capa principal de control de acceso. Son más fáciles de gestionar, stateful (menor riesgo de bloqueos accidentales por olvidar los puertos efímeros) y admiten referencias a otros grupos de seguridad.

Usa **NACLs** para controles a nivel de subred, especialmente:

- **Reglas de denegación explícita**: Bloquear una dirección IP o rango específico para que no llegue a toda una subred
- **Bloqueo de emergencia**: Una IP está atacando activamente: agrega una regla de denegación en la NACL para bloquear toda la subred antes de que llegue a cualquier recurso

"Entonces el grupo de seguridad es el control detallado", dijo Maya, "y la NACL es el trazo amplio."

"Los grupos de seguridad protegen recursos individuales", confirmó Priya. "Las NACLs protegen subredes enteras. Cuando quieres bloquear una IP para que no llegue a nada en tu red, NACL. Cuando quieres permitir solo que el balanceador de carga llegue al servidor de la API, grupo de seguridad."

**El Incidente: Lo que Capturaron las Capas**

Volviendo al ataque de la IP rumana:

**Qué ocurrió**: El atacante usó la clave de despliegue comprometida para cargar un script de escaneo en una instancia de EC2. El script intentó conectarse a otros servicios.

**Qué lo detuvo**:

- El grupo de seguridad de RDS solo permitía la entrada en el puerto 5432 desde el grupo de seguridad de la instancia de EC2 de la API. El script no pudo llegar a la base de datos desde una herramienta de escaneo: no tenía adjunto el grupo de seguridad correcto.
- El grupo de seguridad de ElastiCache solo permitía la entrada en el puerto 6379 desde el grupo de seguridad de la instancia de EC2 de la API.
- Otras instancias de EC2 solo permitían SSH desde el grupo de seguridad del bastion host.

**Lo que no lo detuvo**: 

- Las reglas de salida de la instancia de EC2 permitían HTTPS hacia 0.0.0.0/0 (necesario para la descarga de paquetes). El script usó esto para hacer conexiones salientes hacia el servidor del atacante.

Después del incidente, Priya agregó:

- Una regla de NACL que bloquea el rango de IP rumano
- Una regla de salida más restrictiva en las instancias de EC2 (solo se permitían destinos específicos conocidos como buenos)

## Fortalezas y Limitaciones

**Grupos de Seguridad**:

- Stateful (sin dolores de cabeza con puertos efímeros)
- Pueden referenciar otros grupos de seguridad (más flexible que las IPs)
- Solo reglas de permitir: sin denegación explícita
- Operan a nivel de recurso: granulares

**NACLs**:

- Stateless (requiere reglas explícitas para ambas direcciones, incluidos los puertos efímeros)
- Pueden denegar explícitamente: útil para bloquear IPs conocidas como malas
- Operan a nivel de subred: trazo más amplio
- Reglas numeradas evaluadas en orden: predecibles pero requieren una gestión cuidadosa

## Resumen

- Los **Grupos de Seguridad** son cortafuegos virtuales stateful para recursos individuales. Solo reglas de permitir. Todas las reglas evaluadas.
- Las **NACLs** son cortafuegos stateless para subredes enteras. Reglas de permitir y denegar. Reglas evaluadas en orden numérico.
- **Stateful** significa que el tráfico de respuesta se permite automáticamente. **Stateless** significa que debes permitir explícitamente el tráfico en ambas direcciones.
- Los grupos de seguridad son tu capa principal de control de acceso. Las NACLs son una capa adicional para controles a nivel de subred y bloqueo explícito.
- Cuando una NACL permite el tráfico entrante, también debes permitir los puertos efímeros de salida (1024-65535) para que la respuesta TCP pase.
- Los grupos de seguridad pueden referenciarse entre sí: permitir tráfico "del grupo de seguridad del balanceador de carga" es más mantenible que rastrear direcciones IP.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas Seguras (Dominio 1, Tarea 1.2)*

- **Stateful vs stateless**: Esta distinción es el concepto más evaluado en este capítulo. Grupos de seguridad = stateful = respuesta permitida automáticamente. NACLs = stateless = debes permitir explícitamente el tráfico de respuesta.
- **Reglas de grupo de seguridad**: Sin denegación explícita. Cuando se adjuntan múltiples grupos de seguridad a una instancia, se aplica la unión de todas las reglas. Se evalúan todas las reglas coincidentes.
- **Orden de reglas de NACL**: Las reglas se evalúan del número más bajo al más alto. La regla 100 antes que la 200. La primera coincidencia gana. La regla `*` (asterisco) al final es la denegación implícita.
- **Puertos efímeros**: El error clásico de NACL es olvidar permitir la salida en los puertos 1024-65535. Si tu NACL permite HTTP entrante (puerto 80) pero no permite los puertos efímeros de salida, los usuarios pueden enviar solicitudes pero nunca recibirán respuestas.
- **Referenciación de grupos de seguridad**: Puedes permitir tráfico de otro grupo de seguridad (no solo de una IP). Este es el patrón recomendado para el tráfico intra-VPC.
- **NACL predeterminada vs NACL personalizada**: La NACL predeterminada permite todo el tráfico. Una NACL personalizada (que tú creas) deniega todo el tráfico por defecto. Escenario del examen: "creé una nueva NACL y ahora el tráfico está bloqueado" → revisa si faltan reglas de permitir.

## Ejercicios

**Ejercicio 1 — Recuerdo**

Una desarrolladora agrega una regla de entrada a un grupo de seguridad que permite el tráfico en el puerto 443. ¿También necesita agregar una regla de salida para permitir la respuesta del servidor? ¿Por qué o por qué no?

Si en cambio agrega una regla de entrada a una NACL que permite el tráfico en el puerto 443, ¿necesita agregar una regla de salida? ¿Por qué o por qué no?

**Ejercicio 2 — Práctica para el Examen**

*Escenario*: Una empresa tiene una aplicación web ejecutándose en instancias de EC2 en una subred pública. La aplicación acepta tráfico HTTPS (puerto 443) desde internet. Los usuarios reportan que pueden conectarse a la aplicación pero no pueden recibir respuestas: las solicitudes quedan colgadas y se agotan.

El grupo de seguridad de EC2 tiene una regla de entrada que permite TCP 443 desde 0.0.0.0/0. La NACL de la subred tiene una regla de entrada (regla 100) que permite TCP 443 desde 0.0.0.0/0 y una regla de salida (regla 100) que permite TCP 443 hacia 0.0.0.0/0.

¿Cuál es la causa MÁS probable del problema?

A) Al grupo de seguridad le falta una regla de salida para TCP 443  
B) A la NACL le falta una regla de salida que permita los puertos efímeros (1024-65535)  
C) Al grupo de seguridad le falta una regla de entrada para los puertos efímeros  
D) Las instancias de EC2 no tienen direcciones IP elásticas

**Pista 1**: Los grupos de seguridad son stateful: permiten automáticamente las respuestas. Las NACLs son stateless: no lo hacen.

**Pista 2**: Cuando un navegador se conecta a un servidor web en el puerto 443, la respuesta del servidor regresa en un puerto efímero aleatorio (1024-65535), no en el puerto 443.

**Pista 3**: La NACL tiene una regla de salida para el 443, pero la respuesta no va al puerto 443.

**Respuesta**: B

**Explicación**: La NACL es stateless. Cuando los usuarios se conectan al servidor en el puerto 443, la respuesta TCP del servidor viaja de regreso en un puerto efímero (elegido aleatoriamente entre 1024-65535). La regla de salida de la NACL solo permite el puerto 443, por lo que la respuesta queda bloqueada por la regla de denegación predeterminada. Agregar una regla de salida de NACL que permita TCP 1024-65535 resolvería esto.

**¿Por qué no A?** Los grupos de seguridad son stateful: el tráfico de respuesta se permite automáticamente independientemente de las reglas de salida. No se necesita ninguna regla de salida en el grupo de seguridad.

**¿Por qué no C?** Los puertos efímeros son para el tráfico de respuesta saliente, no para el entrante. La conexión entrante de los usuarios llega en el puerto 443, que ya está permitido.

**¿Por qué no D?** Las IPs elásticas afectan si las instancias tienen IPs públicas, no si las conexiones establecidas pueden recibir respuestas.

*Dominio SAA-C03: Diseño de Arquitecturas Seguras — Tarea 1.2*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Después del ataque de la IP rumana, Priya quiere implementar dos controles adicionales:

1. Bloquear todo el rango de IP 185.0.0.0/8 para que no llegue a ningún recurso en la subred pública
2. Asegurarse de que la subred privada que contiene la base de datos nunca pueda comunicarse con internet, incluso si alguien configura mal un grupo de seguridad

¿Qué herramientas usarías para cada requisito y cómo las configurarías? ¿Podrías usar grupos de seguridad para ambos? ¿Podrías usar NACLs para ambos?

*(No existe una única respuesta correcta. El objetivo es entender qué herramienta se adapta a qué problema.)*

## Escena Post-Créditos

El incidente quedó contenido. La clave de despliegue comprometida fue desactivada. El rango de IP rumano fue bloqueado en la NACL. El antiguo script fue eliminado de la instancia de EC2.

Priya escribió un informe del incidente. Lo compartió con el equipo.

La última línea del informe: "Causa raíz: una credencial activa de un pipeline de despliegue descomisionado nunca fue rotada ni revocada. Recomendación: rotación automatizada de credenciales y auditoría periódica de todas las credenciales de IAM."

Leo lo leyó tres veces.

"Debería haber rotado esa clave", dijo.

"Sí", dijo Priya.

"¿Cómo nos aseguramos de que esto no vuelva a pasar?"

"Automatización", dijo. "Y algo que vigile a los vigilantes."

En el próximo capítulo: la caja fuerte donde Nimbus guarda sus secretos, y la rotación que hace que las claves robadas sean inútiles.
