# Capítulo 8: El Administrador de Base de Datos que Nunca Coge la Baja por Enfermedad

Eran las 3 de la madrugada cuando llegó la alerta.

El servidor de la base de datos necesitaba un parche de seguridad — del tipo que requería un reinicio. La
vulnerabilidad era real, el parche estaba disponible y la ventana para aplicarlo
sin interrumpir a los clientes era ahora mismo, en medio de la noche, cuando el tráfico
era bajo.

Priya era la única que estaba despierta. Aplicó el parche, reinició el servidor, observó
los registros hasta que la aplicación volvió a estar en línea y se fue a la cama a las 4:15 de la madrugada.

Por la mañana le contó al equipo lo que había pasado. Hubo un silencio.

«Eso va a volver a ocurrir», dijo Tom.

«Va a ocurrir cada vez que haya un parche», dijo Priya. «Y siempre hay parches. Tiene que haber una forma mejor de hacer esto.»

La había. Solo requería abandonar la idea de que necesitaban gestionar la base de datos
ellos mismos.

**El Problema Tradicional de las Bases de Datos**

Cuando ejecutas una base de datos tú mismo en una instancia EC2, eres responsable de todo.

Instalar el software de la base de datos. Configurarlo de forma segura. Parchearlo cuando se descubren vulnerabilidades de seguridad. Hacer respaldos. Comprobar que los respaldos realmente funcionan
(un paso que la mayoría de los equipos se salta hasta que es demasiado tarde). Monitorear el espacio en disco. Configurar
la replicación para la redundancia. Configurar el failover para cuando el servidor principal se cae.
Ajustar el rendimiento de las consultas. Gestionar las conexiones bajo carga.

Nada de esto es la aplicación. Nada de esto añade características. Todo requiere experiencia.

La mayoría de los equipos de desarrollo no son administradores de bases de datos. Esto crea un patrón predecible:
la base de datos se instala, se configura mínimamente y luego se olvida en gran medida hasta que algo
va catastróficamente mal.

«¿Es eso lo que hicimos nosotros?» preguntó Maya.

La respuesta de Leo fue el silencio, que equivalía a sí.

**Amazon RDS: La Base de Datos Gestionada**

**Amazon RDS** — Relational Database Service (Servicio de Base de Datos Relacional) — maneja la carga operativa de ejecutar
una base de datos relacional para que no tengas que hacerlo.

Con RDS, AWS gestiona:

- Instalar y parchear el motor de la base de datos
- Respaldos automatizados (almacenados en S3, retenidos hasta 35 días)
- Failover automatizado (cuando el principal cae, un standby toma el relevo automáticamente)
- Monitorización y métricas
- Cifrado en reposo y en tránsito
- Autoescalado del almacenamiento (si lo habilitas, el disco crece cuando se llena)

Tú gestionas:

- El esquema de la base de datos (la estructura de tus tablas)
- Tus consultas y lógica de aplicación
- Quién tiene acceso a la base de datos
- Qué tipo de instancia ejecuta la base de datos
- El ajuste de parámetros (aunque RDS proporciona valores predeterminados razonables)

La analogía: contratar a un administrador de base de datos que nunca coge la baja por enfermedad, nunca comete
errores de configuración, hace respaldos diarios automáticamente y se repara a sí mismo si
algo se rompe — pero que no escribe la lógica de tu aplicación.

**Motores Admitidos**

RDS admite varios motores de bases de datos populares:

- **MySQL** — la base de datos relacional de código abierto más utilizada
- **PostgreSQL** — potente, extensible, cada vez más popular para cargas de trabajo complejas
- **MariaDB** — bifurcación de MySQL de código abierto, totalmente compatible
- **Oracle** — de nivel empresarial, utilizado en grandes organizaciones con requisitos heredados
- **Microsoft SQL Server** — para entornos con mucho Windows
- **Amazon Aurora** — el propio motor de AWS compatible con MySQL/PostgreSQL, construido para la nube
  (cubrimos Aurora en profundidad en el Capítulo 24)

Para Nimbus, la elección fue PostgreSQL. Era lo que Leo conocía y manejaba bien los datos relacionales. La elección del motor importa menos de lo que podrías pensar para la mayoría de las aplicaciones —
los beneficios operativos de RDS se aplican independientemente.

**Multi-AZ: El Standby que Toma el Relevo**

Esta es la característica que cambia completamente el cálculo de fiabilidad.

El **despliegue Multi-AZ** significa que RDS mantiene una instancia standby sincrónica en una
Zona de Disponibilidad diferente a la del primario. Cada transacción confirmada en el primario
se replica de forma sincrónica en el standby antes de que se confirme la transacción.

Cuando el primario falla — fallo de hardware, interrupción de la AZ, caída del software — RDS
hace failover automáticamente al standby. El registro DNS del punto de conexión de la base de datos
se actualiza. Tu aplicación se reconecta al nuevo primario.

El failover tarda 60-120 segundos. Durante esa ventana, tu aplicación experimentará
errores de conexión. Las aplicaciones bien escritas deben manejar esto con elegancia (reintentos
de conexión con espera progresiva).

El standby no es una réplica de lectura. No sirve tráfico de lectura. Su único propósito es
estar listo para tomar el relevo.

Tom: «¿Cuánto cuesta Multi-AZ?»

Aproximadamente el doble del coste de una única instancia — porque literalmente estás ejecutando dos
instancias de base de datos. El standby cuesta lo mismo que el primario.

Tom: «¿Y cuánto cuesta una interrupción no planificada?»

Respondió su propia pregunta abriendo el historial de pedidos y estimando los ingresos
por hora durante su pico del viernes.

Multi-AZ se habilitó esa tarde.

**Respaldos Automatizados y Recuperación a un Punto en el Tiempo**

RDS hace respaldos automatizados cada día. AWS almacena estos respaldos en S3 (gestionados por
RDS — no los ves directamente en tu consola de S3). Puedes restaurar la base de datos
a cualquier punto dentro de tu período de retención de respaldos.

Los respaldos se hacen durante una **ventana de mantenimiento** configurable — un período de tráfico bajo,
típicamente por la mañana temprano. Para la mayoría de los tipos de motor, los respaldos no causan tiempo de inactividad.

La **recuperación a un punto en el tiempo** es una de las características más valiosas: puedes restaurar a
cualquier segundo dentro de tu período de retención. No solo instantáneas diarias — *cualquier segundo*.
Esto es posible porque RDS archiva continuamente los registros de transacciones además de
los respaldos diarios.

Si alguien ejecuta accidentalmente `DELETE FROM orders WHERE 1=1` a las 2:37 del mediodía, puedes
restaurar a las 2:36.

Leo se relajó visiblemente cuando entendió esto.

«¿Podríamos habernos recuperado de lo que borré el mes pasado?» preguntó.

«¿Antes de RDS? No», dijo Priya. «¿Después de RDS? Sí.»

**Réplicas de Lectura: Escalado del Tráfico de Lectura**

Multi-AZ es sobre disponibilidad. Las **réplicas de lectura** son sobre rendimiento.

Una réplica de lectura es una copia asíncrona de tu base de datos principal que puede servir
consultas de lectura. Puedes tener hasta cinco réplicas de lectura para la mayoría de los motores de RDS (más para Aurora).

La aplicación se modifica para enviar consultas de lectura a la réplica y consultas de escritura al
primario. Esto distribuye la carga: el primario maneja las escrituras y las transacciones complejas;
las réplicas manejan las lecturas.

Características clave:

- La replicación es **asíncrona** — puede haber un pequeño retraso (lag) entre el
  primario y la réplica. Si escribes un registro y lo lees inmediatamente desde la réplica,
  puede que no lo veas todavía.
- Las réplicas de lectura pueden estar en la misma Región o en una Región diferente (las réplicas entre Regiones
  añaden latencia pero permiten la distribución geográfica).
- Las réplicas de lectura pueden ser promovidas a bases de datos independientes en un escenario de desastre.

Para Nimbus: las búsquedas de menú son lecturas. El historial de pedidos son lecturas. La gran mayoría del
tráfico es tráfico de lectura. Añadir una réplica de lectura y enrutar las lecturas a ella reduce significativamente la carga de la base de datos principal.

Cubrimos las réplicas de lectura más exhaustivamente en el Capítulo 24 cuando hablamos de Aurora.

**Grupos de Parámetros y Grupos de Opciones de RDS**

Dos mecanismos de configuración que aparecen en el examen:

Los **grupos de parámetros** controlan la configuración del motor de la base de datos — como el número máximo de conexiones,
el tamaño de la caché de consultas, los valores de tiempo de espera. RDS crea un grupo de parámetros predeterminado que funciona
para la mayoría de los casos. Creas grupos de parámetros personalizados cuando necesitas ajustar configuraciones específicas.

Los **grupos de opciones** habilitan características adicionales para algunos motores — como el cifrado de red nativo de Oracle o el cifrado de datos transparente de SQL Server. La mayoría de los despliegues de motores de código abierto no necesitan grupos de opciones personalizados.

No necesitas memorizar esto. Sabe que existen para personalizar el comportamiento del motor de la base de datos.

## Fortalezas y Limitaciones

**Por qué RDS es excelente**:

- Elimina la carga operativa de gestionar el software de la base de datos
- Respaldos automatizados y recuperación a un punto en el tiempo
- Multi-AZ para failover automático con RTO mínimo
- Réplicas de lectura para escalar el tráfico de lectura
- Cifrado en reposo y en tránsito incorporado
- Todos los principales motores de bases de datos relacionales admitidos

**Donde RDS tiene límites**:

- No puedes acceder al SO subyacente. No puedes instalar software personalizado a nivel de SO o
  cambiar la configuración del sistema operativo. Si tu base de datos tiene requisitos que exigen
  acceso al SO, puede que necesites ejecutar tu propia base de datos basada en EC2.
- RDS no es serverless (con excepciones — Aurora Serverless existe, cubierto en
  el Capítulo 24). Pagas por una instancia en ejecución incluso si está inactiva.
- RDS no está diseñado para bases de datos fragmentadas horizontalmente. Para un escalado masivo de
  cargas de trabajo relacionales con muchas escrituras, puede que eventualmente necesites una arquitectura diferente.
- Para patrones de datos no relacionales (NoSQL), DynamoDB (Capítulo 9) es más apropiado.

## Resumen

- **Amazon RDS** es un servicio de base de datos relacional gestionado. AWS maneja el parcheo,
  los respaldos, el failover y la gestión del almacenamiento. Tú manejas el esquema, las consultas y
  la lógica de la aplicación.
- El despliegue **Multi-AZ** mantiene un standby sincrónico en una AZ diferente.
  El failover automático ocurre en 60-120 segundos si el primario falla.
- Los **respaldos automatizados** con **recuperación a un punto en el tiempo** te permiten restaurar a cualquier
  segundo dentro del período de retención.
- Las **réplicas de lectura** son copias asíncronas que sirven tráfico de lectura, reduciendo
  la carga del primario. El lag de replicación significa que pueden estar ligeramente por detrás.
- Elige RDS cuando necesites una base de datos relacional con operaciones gestionadas. Usa Aurora
  (Capítulo 24) cuando necesites mayor rendimiento u opciones serverless.

## Consejos para el Examen

*Dominio SAA-C03 3 — Tarea 3.3 (soluciones de base de datos)*

- **Multi-AZ es para alta disponibilidad, no para rendimiento.** El standby no sirve
  tráfico de lectura. Las réplicas de lectura son para el rendimiento. Esta distinción se evalúa frecuentemente.
- **El failover Multi-AZ es automático.** No configuras cuándo ni cómo ocurre.
  RDS monitorea el primario y activa el failover automáticamente.
- **El lag de replicación importa.** Las réplicas de lectura pueden estar ligeramente por detrás del primario.
  Si tu aplicación requiere leer datos que acaba de escribir, debe leer del
  primario, no de la réplica. A esto se le llama «consistencia de lectura de lo que escribiste».
- **Los respaldos automatizados se retienen de 0 a 35 días.** Establecer la retención a 0
  deshabilita los respaldos automatizados. Las instantáneas manuales se retienen indefinidamente hasta
  que las eliminas.
- El **autoescalado del almacenamiento de RDS** previene las interrupciones por disco lleno. Actívalo. Solo escala
  hacia arriba, nunca hacia abajo. El examen puede evaluar si conoces esta asimetría.

## Ejercicios

**Ejercicio 1 — Recordar**

Con tus propias palabras: ¿cuál es la diferencia entre Multi-AZ y las réplicas de lectura en RDS?
¿Qué problema resuelve cada una?

*(Pista: Una protege contra el tiempo de inactividad; la otra mejora el rendimiento bajo carga intensa de lectura. Resuelven problemas diferentes y se pueden usar juntas.)*

**Ejercicio 2 — Práctica de Examen**

*Escenario*: Una empresa ejecuta una base de datos PostgreSQL de producción en RDS. La base de datos
experimenta un alto tráfico de lectura debido a consultas de informes que se ejecutan a lo largo del día.
El equipo también está preocupado por la disponibilidad de la base de datos — no pueden permitirse más de
unos pocos minutos de tiempo de inactividad en un escenario de fallo. Quieren minimizar el impacto en la
base de datos principal de las cargas de trabajo de informes.

¿Qué combinación de características de RDS aborda MEJOR ambas preocupaciones?

A) Habilitar Multi-AZ y ejecutar todas las consultas contra la instancia standby  
B) Habilitar Multi-AZ para protección contra failover y crear una réplica de lectura para las consultas de informes  
C) Crear múltiples réplicas de lectura y deshabilitar Multi-AZ para reducir costes  
D) Tomar instantáneas manuales más frecuentes y restaurar desde ellas si el primario falla

**Pista 1**: Los dos requisitos son: (1) disponibilidad durante un fallo, (2) descargar
las lecturas. ¿Qué características abordan qué requisito?

**Pista 2**: Multi-AZ proporciona failover automático. El standby NO sirve tráfico de lectura.
Por lo tanto, Multi-AZ solo no ayuda con el problema de lectura.

**Pista 3**: Las réplicas de lectura sirven tráfico de lectura. Multi-AZ proporciona failover. Necesitas ambas.

**Respuesta**: B

**Explicación**: Multi-AZ proporciona failover automático a un standby en una AZ diferente —
esto aborda el requisito de disponibilidad. Una réplica de lectura permite que las consultas de informes
se ejecuten sin afectar a la base de datos principal — esto aborda el requisito de rendimiento.
Ambas características se pueden usar simultáneamente.

**¿Por qué no A?** El standby Multi-AZ no puede servir tráfico de lectura. Es exclusivamente para
el failover. Intentar consultarlo directamente no está admitido.

**¿Por qué no C?** Las réplicas de lectura ayudan con el rendimiento de lectura pero no proporcionan failover automático.
Si el primario falla, tendrías que promover manualmente una réplica de lectura —
lo que lleva tiempo y no es automático.

**¿Por qué no D?** Las instantáneas manuales restauran una copia completa de la base de datos — un proceso mucho más largo (potencialmente horas para bases de datos grandes). Esto no cumple con el requisito de «unos pocos minutos
de tiempo de inactividad».

*Dominio SAA-C03 3 — Tarea 3.3*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus está considerando migrar su base de datos PostgreSQL autogestionada existente
(ejecutándose en una instancia EC2) a RDS PostgreSQL. La migración debe ocurrir
con un tiempo de inactividad mínimo — idealmente menos de 15 minutos. La base de datos tiene 200 GB.

¿Qué enfoque recomendarías? ¿Qué servicios de AWS podrían ayudar con la migración?
¿Qué riesgos comprobarías antes de desviar el tráfico de producción?

*(No hay una única respuesta correcta. Piensa en el AWS Database Migration Service,
la replicación lógica y el riesgo de inconsistencia de datos durante el cambio.)*

## Escena Post-Créditos

Al final del día, Nimbus había migrado a RDS PostgreSQL con Multi-AZ habilitado. La
migración en sí llevó la mayor parte de la tarde — Leo usó un enfoque de respaldo y restauración,
con una breve ventana de mantenimiento.

Tom había estado observando la factura atentamente.

«La instancia de RDS», dijo, «cuesta el doble que la base de datos EC2.»

«¿Y los respaldos automatizados?» preguntó Maya.

«Un poco más.»

«¿Y el failover que obtendremos gratis si el primario muere?»

Tom no tenía un precio para eso. Lo anotó como una pregunta.

Tres días después, la base de datos estaba sana. Los tiempos de consulta habían bajado algo, pero no
lo suficiente. El menú todavía tardaba en cargarse. Veintidós mil elementos. Veintidós mil
filas en una consulta que devolvía todas ellas, cada vez.

«El problema», dijo Priya, «no es el motor de la base de datos. Es el modelo de datos.»

Hizo una pausa.

«Algunos de estos datos no son relacionales en absoluto. Los elementos del menú, los perfiles de los restaurantes,
las zonas de entrega — estos datos tienen formas variables. SQL nos está dando problemas.»

Leo ya estaba investigando algo.

«¿Y si usáramos un tipo diferente de base de datos para el menú?» dijo.

En el próximo capítulo: la base de datos que no se ralentiza, aunque un millón de personas pidan a la vez.
