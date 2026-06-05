# Capítulo 18: Cuando las Cosas Se Rompen

Este capítulo trata sobre los fallos: planificados, diseñados para resistirlos y, en última instancia, aceptados como inevitables. Puede ser el capítulo más importante del libro.

Nimbus funcionaba bien. Las capas de seguridad estaban en su lugar. El monitoreo estaba activo. El tráfico crecía.

Entonces Leo recibió una notificación de Slack a las 11:23 PM un jueves.

"us-east-1, Zona de Disponibilidad us-east-1b — fallo de hardware — servicio degradado."

Abrió la consola de AWS. Las instancias de EC2 en us-east-1b mostraban fallos en las verificaciones de estado. Su Auto Scaling Group había detectado instancias no saludables y estaba lanzando reemplazos, en us-east-1b.

En la zona con el fallo de hardware.

Las nuevas instancias tampoco podían iniciarse. Estaban en la misma zona con el fallo de hardware.

"El balanceador de carga está enrutando el tráfico a ambas AZs", dijo Leo para nadie. "La mitad de nuestro tráfico va a instancias que no funcionan."

Veintidós minutos de servicio degradado antes de que notara y desplazara manualmente el ASG para que solo usara us-east-1a.

"Esto ocurrió porque todo estaba en una sola AZ", dijo Priya a la mañana siguiente.

"No", dijo Leo. "Tenía instancias en dos AZs. El problema fue que las instancias de reemplazo se estaban lanzando en la AZ con fallos."

"¿Y la base de datos?"

Leo se detuvo.

"La instancia de RDS está en Multi-AZ", dijo. "El standby está en us-east-1b. Que estaba fallando. Y RDS intentó hacer el failover al standby, que también falló."

Veintidós minutos de servicio degradado se convirtieron en treinta y ocho.

**La Analogía de la Red Eléctrica**

Piensa en cómo tu hogar recibe electricidad. La energía no llega de un solo cable que viene de un solo generador. Viene de una red: una malla de generadores, subestaciones y líneas de transmisión que se respaldan mutuamente. Si una subestación se incendia, las demás reencaminan la energía alrededor de ella. No lo notas. Las luces siguen encendidas.

Las Zonas de Disponibilidad de AWS funcionan de la misma manera. En lugar de un único centro de datos gigante del que todo depende, AWS distribuye tus recursos en múltiples instalaciones físicamente separadas. Si una instalación pierde energía o tiene un fallo de hardware, las demás siguen funcionando. El tráfico se reencamina automáticamente. Tu aplicación sigue activa, porque nunca hubo un único cable que cortar.

Multi-Región es el siguiente nivel: imagina tener generadores de respaldo en una ciudad completamente diferente. Si toda la red eléctrica local cae, la ciudad remota toma el control. Más complejo de configurar, pero más resiliente frente a fallos catastróficos.

**El Vocabulario del Fallo**

Antes de diseñar para la resiliencia, necesitas palabras para lo que estás diseñando contra.

**Disponibilidad**: El porcentaje de tiempo que un sistema está operativo. "Cuatro nueves" (99.99%) significa menos de 52 minutos de tiempo de inactividad al año. "Cinco nueves" (99.999%) significa aproximadamente 5 minutos al año.

**RTO (Recovery Time Objective)**: ¿Cuánto tiempo puede estar caído el sistema antes de que se convierta en un problema empresarial? Si tu RTO es de 4 horas, tienes 4 horas para restaurar el servicio antes de que se violen los SLAs.

**RPO (Recovery Point Objective)**: ¿Cuántos datos puedes permitirte perder? Si tu RPO es de 1 hora, puedes tolerar perder hasta una hora de datos en un fallo catastrófico. Todo lo escrito en la última hora antes del fallo se pierde.

**Tolerancia a fallos**: La capacidad de continuar operando (en algún nivel) cuando un componente falla.

**Recuperación ante desastres (DR)**: El proceso de recuperarse de un fallo catastrófico: incendio en un centro de datos, apagón a nivel de región, eliminación masiva accidental.

Estos cinco conceptos impulsan cada decisión arquitectónica de este capítulo.

**Multi-AZ: Sobrevivir Fallos de Zona de Disponibilidad**

Una Zona de Disponibilidad (AZ) es un centro de datos físicamente separado dentro de una Región. Las AZs están diseñadas para ser independientes: suministros de energía separados, refrigeración separada, infraestructura de red separada. Pero están lo suficientemente cerca como para que la latencia de red entre ellas sea de 1-2 milisegundos.

Los **despliegues Multi-AZ** distribuyen tus recursos en dos o más AZs dentro de una Región. Si una AZ falla:

- El balanceador de carga deja de enrutar a instancias no saludables en la AZ con fallos
- El Auto Scaling Group reemplaza las instancias, pero en la AZ *saludable*
- RDS hace el failover al standby en la AZ saludable

El error de Leo: su Auto Scaling Group no estaba configurado para limitar las instancias de reemplazo a las AZs saludables. Estaba configurado para mantener el equilibrio entre AZs. Cuando us-east-1b falló, el ASG intentó equilibrar el recuento de instancias lanzando reemplazos en us-east-1b, la AZ con fallos.

La corrección: configurar el ASG para lanzar solo en AZs saludables, con un mínimo de dos AZs siempre activas.

La lección más profunda: probar tus escenarios de fallo antes de que ocurran en producción.

**Simulando Fallos: Ingeniería del Caos**

"¿Cómo sabemos que nuestra configuración Multi-AZ realmente funciona?", preguntó Maya.

"Rompemos cosas a propósito", dijo Leo.

Esto suena temerario. En realidad es lo más responsable que puede hacer un equipo.

La **ingeniería del caos** es la práctica de inyectar intencionalmente fallos en tu sistema para verificar que los maneja correctamente. Terminas deliberadamente una instancia de EC2. Fuerzas manualmente el failover de la instancia de RDS. Bloqueas una subred del balanceador de carga.

Si el sistema se recupera automáticamente dentro de tu RTO, tu diseño funciona.

Si no, has aprendido eso en un entorno controlado, no durante un incidente de producción a las 2 AM.

Para Nimbus: Leo escribió un runbook (un procedimiento documentado) para probar cada escenario de fallo. Una vez por trimestre, harían fallar intencionalmente un componente y medirían el tiempo de recuperación. Si la recuperación tardaba más que el RTO, corregirían el diseño.

**Multi-Región: Sobrevivir Fallos Regionales**

La mayoría de los fallos de AWS afectan a Zonas de Disponibilidad, no a Regiones enteras. Los fallos regionales son raros, pero ocurren.

En un fallo regional (o para aplicaciones globales que necesitan muy baja latencia en todas partes), **Multi-Región** es la respuesta: despliega tu aplicación en dos o más Regiones de AWS.

Multi-Región introduce complejidad fundamental:

**Replicación de datos**: Tus bases de datos necesitan estar sincronizadas entre regiones. Cualquier dato escrito en us-east-1 debe eventualmente llegar a eu-west-1. "Eventualmente" es el problema: durante el retraso, las regiones tienen vistas ligeramente diferentes del mundo.

**Activo-pasivo vs activo-activo**:

- **Activo-pasivo**: Una región sirve todo el tráfico. La otra es un standby en caliente. Ante un fallo, DNS cambia el tráfico al standby. Más simple, pero el standby está inactivo y es costoso.
- **Activo-activo**: Ambas regiones sirven tráfico simultáneamente. Más complejo de construir (requiere resolución de conflictos para escrituras concurrentes), pero menor latencia globalmente y sin recursos inactivos.

**Tiempo de failover**: Los cambios de DNS tardan tiempo en propagarse (dependiendo del TTL). Durante la ventana de propagación, algunos usuarios todavía llegan a la región con fallos. Diseñar para un RTO muy bajo requiere pre-calentar el standby y minimizar el TTL antes de los cambios planificados.

**Estrategias de Recuperación ante Desastres: Un Espectro**

Hay cuatro estrategias de DR comunes, ordenadas de la más económica (y más lenta de recuperar) a la más costosa (y más rápida de recuperar):

**Respaldo y Restauración** (RPO/RTO de horas):

- Haz una copia de seguridad de todo en S3 en una región diferente
- Ante un desastre: aprovisiona la infraestructura desde cero, restaura desde la copia de seguridad
- Costo: muy bajo (solo pagas por el almacenamiento)
- Tiempo de recuperación: horas

**Luz Piloto** (RPO/RTO de minutos a 1 hora):

- Mantén una versión mínima de la aplicación en funcionamiento en la región de DR (la "luz piloto" que puede aumentarse rápidamente)
- Los datos centrales se replican (réplica de lectura de RDS en la región de DR)
- Ante un desastre: escala la región de DR, promueve la réplica de lectura a primaria, cambia DNS
- Costo: moderado (pagas por un pequeño footprint en funcionamiento)
- Tiempo de recuperación: decenas de minutos

**Standby en Caliente** (RPO/RTO de segundos a minutos):

- Ejecuta una versión reducida de la aplicación completa en la región de DR
- Totalmente operativo pero con capacidad reducida
- Ante un desastre: escala, cambia DNS
- Costo: mayor (siempre ejecutando el stack completo a escala reducida)
- Tiempo de recuperación: minutos

**Activo-Activo / Multi-Sitio** (RPO/RTO casi cero):

- Capacidad completa en dos o más regiones, sirviendo tráfico simultáneamente
- No se necesita recuperación: si una región falla, el tráfico se enruta automáticamente a la otra
- Costo: el más alto (dos despliegues completos a escala completa)
- Tiempo de recuperación: segundos (solo propagación de DNS)

Para Nimbus en esta etapa: standby en caliente. No podían permitirse el activo-activo, pero el respaldo y restauración era demasiado lento para sus requisitos empresariales.

**Amazon RDS: Multi-AZ vs Réplicas de Lectura vs Multi-Región**

Estos tres son distintos y frecuentemente confundidos:

| Característica | Multi-AZ                       | Réplica de Lectura | Réplica de Lectura Multi-Región |
|----------------|--------------------------------|--------------------|---------------------------------|
| Propósito      | Alta disponibilidad (failover) | Escalado de lectura | Escalado de lectura + DR        |
| Sincronización | Sincrónica                     | Asincrónica        | Asincrónica                     |
| Failover       | Automático                     | Promoción manual   | Promoción manual                |
| ¿Legible?      | No (el standby es pasivo)      | Sí                 | Sí                              |
| ¿Multi-región? | No (misma región)              | Sí (opcional)      | Sí                              |
| Usar para      | HA, RPO~0                      | Carga de lectura   | Recuperación ante desastres     |

Concepto clave: el standby de Multi-AZ es **sincrónico**: cada escritura en el primario se confirma en el standby antes de que se reconozca la escritura. Esto significa que si el primario falla, no se pierden datos. RPO = 0.

Las réplicas de lectura son **asincrónicas**: hay retraso en la replicación. Si el primario falla y promueves una réplica de lectura, puedes perder segundos o minutos de escrituras recientes. RPO > 0.

## Fortalezas y Limitaciones

**Multi-AZ**:

- Esencial para cargas de trabajo en producción: AZ única es un punto único de fallo
- Bien soportado por los servicios de AWS (RDS, ElastiCache, EKS, ALB todos admiten Multi-AZ)
- Sobrecosto relativamente bajo en comparación con la protección que proporciona

**Multi-Región**:

- Complejo de implementar correctamente, especialmente para las bases de datos
- Los requisitos de residencia/soberanía de datos pueden requerirlo realmente (los datos de usuarios de la UE deben permanecer en la UE)
- Los beneficios de latencia para los usuarios globales provienen del enrutamiento, no de multi-región per se (usa CloudFront para el contenido estático)
- La mayoría de las organizaciones no necesitan activo-activo; la mayoría invierte poco en el standby en caliente

## Resumen

- **RTO** (Recovery Time Objective): cuánto tiempo puedes estar caído. **RPO** (Recovery Point Objective): cuántos datos puedes perder.
- **Multi-AZ** distribuye los recursos en Zonas de Disponibilidad dentro de una Región. Protege contra fallos de AZ.
- **Multi-Región** despliega en múltiples Regiones de AWS. Protege contra fallos regionales y sirve a los usuarios globales con menor latencia.
- Estrategias de DR (de más económica a más costosa): Respaldo y Restauración → Luz Piloto → Standby en Caliente → Activo-Activo.
- Standby de RDS Multi-AZ: sincrónico, failover automático, RPO = 0. Réplicas de lectura: asincrónicas, promoción manual, RPO > 0.
- Prueba tus fallos intencionalmente (ingeniería del caos) antes de que ocurran en producción.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas Resilientes (Dominio 2, Tarea 2.2)*

- **RTO vs RPO**: Espera que el examen dé requisitos ("la organización no puede tolerar más de 1 hora de tiempo de inactividad y no puede perder datos") y te pida elegir la estrategia de DR correcta. Mapeo: sin pérdida de datos = replicación sincrónica = Multi-AZ o activo-activo. 1 hora de inactividad = respaldo y restauración puede ser demasiado lento; el standby en caliente podría funcionar.
- **RDS Multi-AZ vs Réplicas de Lectura**: El examen preguntará por HA (Multi-AZ) vs escalado de lectura (réplicas de lectura). El standby de Multi-AZ no es legible. Las réplicas de lectura pueden promoverse a primaria (manualmente) para DR.
- **Luz Piloto vs Standby en Caliente**: La Luz Piloto tiene infraestructura mínima en funcionamiento (solo la replicación de datos). El Standby en Caliente tiene una aplicación funcional pero reducida en funcionamiento. La diferencia es qué tan rápido puedes escalar.
- **Aurora Global Database**: Característica específica de Aurora para activo-pasivo multi-región. La región primaria sirve escrituras; las regiones secundarias sirven lecturas con menos de 1 segundo de retraso de replicación. En caso de failover, la secundaria puede promovirse en menos de 1 minuto. Señal del examen: "Aurora, multi-región, RTO < 1 minuto."
- **AWS Backup**: Servicio de respaldo centralizado para EBS, RDS, DynamoDB, EFS, Storage Gateway. El examen lo usa para escenarios de respaldo y restauración.
- **Route 53 failover**: Capa DNS de DR. La verificación de salud primaria falla → Route 53 enruta a la secundaria. El tiempo de propagación significa que no es instantáneo.

## Ejercicios

**Ejercicio 1 — Recuerdo**

Explica la diferencia entre RTO y RPO. ¿Por qué podría una organización tener un RTO bajo (no puede estar caída mucho tiempo) pero un RPO alto (puede tolerar perder datos recientes)?

*(Pista: Piensa en un negocio donde es más importante atender a los clientes rápidamente que preservar cada transacción.)*

**Ejercicio 2 — Práctica para el Examen**

*Escenario*: Una empresa de atención médica ejecuta un sistema de registros de pacientes en RDS PostgreSQL en `us-east-1`. Los requisitos regulatorios exigen que los datos de los pacientes nunca se pierdan (RPO = 0). El sistema puede tolerar hasta 30 minutos de tiempo de inactividad (RTO = 30 minutos) ante un desastre. El costo es una preocupación.

¿Qué arquitectura cumple MEJOR con estos requisitos?

A) RDS Multi-AZ en `us-east-1` con copias de seguridad automatizadas diarias en S3 en `us-west-2`  
B) RDS Multi-AZ en `us-east-1` con una réplica de lectura en `us-west-2` configurada para promoción manual  
C) RDS en `us-east-1` con un standby en caliente en `us-west-2` y replicación activo-activo  
D) Aurora Global Database con primaria en `us-east-1` y secundaria en `us-west-2`

**Pista 1**: RPO = 0 significa sin pérdida de datos, lo que requiere replicación sincrónica o casi sincrónica.

**Pista 2**: RTO = 30 minutos significa que tienes tiempo para intervención manual. No necesitas un failover automático en milisegundos totalmente automático.

**Pista 3**: ¿Qué opción proporciona protección Multi-AZ (RPO = 0 dentro de la región) más capacidad de DR entre regiones?

**Respuesta**: A

**Explicación**: RDS Multi-AZ en us-east-1 proporciona replicación sincrónica al standby en la misma región: RPO = 0 para fallos de AZ. Las copias de seguridad automatizadas diarias en S3 en us-west-2 proporcionan DR entre regiones. Ante un fallo regional completo, restauras desde la copia de seguridad de S3 en us-west-2, dentro de los 30 minutos para una base de datos pequeña. Esto es rentable y cumple ambos requisitos.

**¿Por qué no B?** Las réplicas de lectura son asincrónicas: puede haber retraso de replicación. Si el primario falla, los datos escritos desde la última sincronización de réplica se pierden. RPO > 0, lo que viola el requisito.

**¿Por qué no C?** La "replicación activo-activo" para PostgreSQL entre regiones es compleja de implementar y no es una característica estándar de RDS. Esta opción es técnicamente difícil y costosa.

**¿Por qué no D?** Aurora Global Database funcionaría pero es significativamente más costosa que RDS Multi-AZ. El escenario dice que el costo es una preocupación, y Aurora tiene precios premium.

*Dominio SAA-C03: Diseño de Arquitecturas Resilientes — Tarea 2.2*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus ha sido seleccionado para proporcionar servicios de pedidos para un importante festival gastronómico en Seattle. Durante 72 horas, esperan 50 veces su tráfico normal, con cero tolerancia al tiempo de inactividad (el contrato del organizador del festival especifica penalizaciones económicas por cualquier tiempo de inactividad durante el evento).

Diseña una estrategia de DR específica para la ventana del festival. ¿Cambiarías a activo-activo durante esas 72 horas? ¿Cómo pre-probarías el failover? ¿Cuál sería tu RTO y cómo lo validarías antes del evento?

*(No existe una única respuesta correcta. El objetivo es practicar el diseño de DR para requisitos de SLA específicos.)*

## Escena Post-Créditos

Leo construyó el runbook de ingeniería del caos.

Cada trimestre, en una ventana de mantenimiento planificada, el equipo:

1. Terminaría una instancia de EC2 en us-east-1a y vería al ASG reemplazarla correctamente
2. Forzaría manualmente un failover de RDS Multi-AZ y verificaría que la aplicación se reconectara en 60 segundos
3. Simularía un fallo completo de us-east-1b ajustando las zonas de disponibilidad del ASG
4. Restauraría una copia de seguridad de una semana de antigüedad en una nueva instancia de RDS y verificaría que los datos parecieran correctos

La primera vez que lo ejecutaron, el paso 2 tardó 4 minutos y 17 segundos.

"Nuestro compromiso de RTO con los socios del restaurante es de 5 minutos", dijo Tom.

"Así que pasamos. Por poco."

"¿Qué ocurriría si el failover tardara más de 5 minutos en un incidente real?"

Maya respondió: "Estaríamos incumpliendo el SLA. Hay una penalización económica en los contratos."

Leo miró los 4:17 en la pantalla.

"Entonces necesitamos hacerlo más rápido", dijo. Y empezó a leer la documentación de Aurora.

En el próximo capítulo: la máquina de números que deja que cada parte de Nimbus trabaje a su propio ritmo.
