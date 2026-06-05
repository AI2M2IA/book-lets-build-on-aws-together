# Capítulo 2: ¿Dónde Está Tu Servidor en el Mundo?

Levántate. Acércate a una ventana si hay una cerca.

Mira afuera. Lo que sea que veas — edificios, árboles, un aparcamiento, el jardín de alguien —
nada de eso es donde viven tus datos. Tus datos viven en otro lugar completamente distinto. Probablemente
en algún lugar donde nunca hayas estado.

Eso no es un problema. Pero entender *dónde* hace que un número sorprendente de cosas
encajen.

En el capítulo anterior, Leo creó una cuenta de AWS a las 11 de la noche y lanzó un servidor en algún lugar.
Algún lugar siendo la palabra clave — no estaba seguro de qué parte del mundo había
elegido, porque no la había elegido intencionalmente.

A la mañana siguiente, Maya se dio cuenta de que el servidor estaba en Singapur.

«¿Por qué Singapur?» preguntó.

«Era el valor predeterminado», dijo Leo.

Tom levantó la vista de su café. «¿Cuánto cuesta ejecutar un servidor en Singapur cuando
todos nuestros clientes están en la Costa Oeste?»

Leo no tenía respuesta.

Priya ya la tenía: «También es más lento. Cada solicitud tiene que viajar a medio mundo de distancia.»

Este capítulo trata sobre cómo corregir esa decisión — y entender por qué importa.

**El Problema con «Algún Lugar»**

Cuando usas AWS, no estás usando un centro de datos. Estás usando una red global de
ellos. AWS tiene infraestructura en decenas de países.

Eso es una característica, no solo un hecho. Pero significa que tienes que tomar una decisión: *¿dónde*
quieres que se ejecute tu infraestructura?

La decisión importa por tres razones:

**Rendimiento.** Cuanto más cerca estén tus servidores de tus usuarios, más rápida es la respuesta.
La física no negocia. Los datos viajan a aproximadamente dos tercios de la velocidad de la luz
a través de cables de fibra óptica. Una solicitud de Seattle a Singapur tarda unos 300
milisegundos solo en tránsito — antes de que tu aplicación haga nada.

**Cumplimiento.** Algunas industrias tienen leyes sobre dónde pueden almacenarse los datos. Los datos sanitarios estadounidenses pueden
necesitar permanecer dentro del país. Los datos financieros pueden necesitar permanecer dentro de una región específica.
Elegir la Región incorrecta puede crear problemas legales.

**Resiliencia ante desastres.** Si una ubicación sufre un corte de electricidad, un terremoto o un fallo de red,
quieres que tu sistema sobreviva. Distribuir la infraestructura en múltiples
ubicaciones es la forma de protegerse contra desastres locales.

**Cómo AWS Organiza su Infraestructura**

AWS divide su infraestructura global en tres conceptos anidados. Piensa en ellos como
muñecas rusas, de mayor a menor.

**Regiones → Zonas de Disponibilidad → Ubicaciones de Borde**

Abramos cada una.

**Regiones: Las Cajas Grandes**

Una **Región** es un área geográfica donde AWS tiene un clúster de centros de datos. Cada Región
se nombra según su ubicación: `us-west-2` es Oregón, `us-east-1` es Virginia del Norte,
`eu-west-1` es Irlanda, `ap-southeast-1` es Singapur — donde se escondía el servidor de Leo.

Hay más de 30 Regiones en todo el mundo y AWS añade más regularmente.

Cada Región es completamente independiente. Los datos en `us-west-2` permanecen en `us-west-2` a menos que
los muevas explícitamente. Esto es fundamental para el cumplimiento y la resiliencia — una gran
interrupción en una Región no afecta automáticamente a las otras.

«¿Entonces deberíamos elegir `us-west-2` para Nimbus?» preguntó Tom.

Sí. Para una empresa estadounidense que atiende a clientes de la Costa Oeste, sí. Menor latencia y tus usuarios
obtienen respuestas más rápidas.

«¿Cuánto más cara es que Singapur?» añadió Tom.

El precio varía según la Región — generalmente en unos pocos puntos porcentuales. El beneficio de rendimiento y cumplimiento
de la Región correcta vale la pequeña diferencia de precio.

**Zonas de Disponibilidad: La Redundancia Real**

Aquí es donde se pone interesante.

Cada Región no es un único centro de datos. Es un clúster de múltiples centros de datos físicamente separados
llamados **Zonas de Disponibilidad** (o AZs, por sus siglas en inglés).

Oregón (`us-west-2`) tiene cuatro Zonas de Disponibilidad: `us-west-2a`, `us-west-2b`,
`us-west-2c`, `us-west-2d`. Son edificios reales, separados a distancias significativas — lo suficientemente
lejos como para que un incendio, una inundación o un corte de electricidad en uno no afecte a los demás, pero lo suficientemente
cerca como para que la red entre ellos sea extremadamente rápida (latencia de un solo dígito en milisegundos).

Esta es la arquitectura que hace que AWS sea fiable a un nivel que ningún centro de datos individual puede igualar.

Priya se inclinó hacia adelante. «Entonces si ejecutamos nuestra aplicación en dos Zonas de Disponibilidad y
una cae...»

«La otra sigue funcionando», terminó Maya.

«Exactamente.»

Leo, que había estado escuchando en silencio: «Lo desplegué todo en una AZ.»

«Sí», dijo Priya. «Lo notamos.»

El concepto de distribuir tu aplicación en múltiples AZs — llamado **despliegue Multi-AZ**
— es uno de los patrones de resiliencia más importantes en AWS. Profundizamos en
ello en el Capítulo 18. Por ahora, entiende que las AZs existen específicamente para hacer esto posible.

**Ubicaciones de Borde: Velocidad en Todas Partes**

Las AZs resuelven la resiliencia. No resuelven el problema de servir contenido rápidamente a los usuarios en
ciudades lejos de tu Región principal.

Entran en juego las **Ubicaciones de Borde**.

Las Ubicaciones de Borde son puntos de infraestructura pequeños y ligeros dispersos por más de 400
ciudades de todo el mundo. No son centros de datos completos — no pueden ejecutar tu aplicación.
Lo que *sí* pueden hacer es almacenar en caché contenido cerca de tus usuarios.

Imagina una imagen de menú almacenada en un servidor en Virginia. Cada vez que alguien en Tokio quiere
verla, la solicitud viaja a través del Pacífico y vuelve. Con las Ubicaciones de Borde, AWS puede almacenar una
copia de ese archivo en Tokio y servirlo localmente — milisegundos en lugar de cientos de
milisegundos.

Esta es la columna vertebral de CloudFront, la red de entrega de contenido de AWS. Profundizamos en
CloudFront en el Capítulo 13. Por ahora: las Ubicaciones de Borde son sobre velocidad para el contenido estático.

**Elegir una Región: La Lista de Verificación del Ingeniero Senior**

Cuando Nimbus se expanda para atender a usuarios en México y Colombia (lo cual ocurre en el Capítulo 12),
la decisión de la Región no es arbitraria. El razonamiento es el siguiente:

**1. ¿Dónde están tus usuarios?**

Empieza aquí. Elige la Región más cercana a la mayoría de tus usuarios. La latencia es el impacto
más directo y medible de la elección de Región.

**2. ¿Hay requisitos de cumplimiento?**

Las cargas de trabajo sanitarias, financieras y gubernamentales suelen tener reglas estrictas de residencia de datos.
Conoce tu entorno regulatorio antes de elegir.

**3. ¿Qué servicios necesitas?**

No todos los servicios de AWS están disponibles en todas las Regiones. Los nuevos servicios se lanzan primero en `us-east-1`.
Si necesitas un servicio específico, verifica que tu Región objetivo lo admita.

**4. ¿Cuál es el precio?**

Las Regiones varían en precio. `us-east-1` (Virginia del Norte) tiende a ser la más barata debido a
su escala y antigüedad. Sudamérica es ligeramente más cara. Comprueba la página de precios de AWS
antes de decidir.

**5. ¿Necesitas múltiples Regiones?**

Para la mayoría de las aplicaciones, múltiples AZs dentro de una Región son suficientes para la resiliencia. Para
aplicaciones críticas donde incluso una interrupción regional es inaceptable, diseñas para
múltiples Regiones — pero eso es un compromiso arquitectónico significativo. No lo hagas
de forma especulativa.

**La Limitación de la que Nadie Habla**

Las Regiones son poderosas, pero crean una tensión importante.

Ejecutarse en múltiples Regiones es genuinamente difícil.

La replicación de datos entre Regiones tiene latencia. Mantener dos Regiones sincronizadas — para que una
transacción en la Región A sea instantáneamente visible en la Región B — es uno de los problemas más difíciles
de los sistemas distribuidos. AWS proporciona herramientas para ello, pero cuesta dinero y añade
complejidad operativa.

La mayoría de las aplicaciones deberían empezar con una Región, múltiples AZs y expandirse a múltiples Regiones
solo cuando tengan un requisito claro: mandatos regulatorios, SLAs contractuales que requieren
un tiempo de inactividad regional casi nulo, o una base de usuarios genuinamente distribuida entre continentes.

La arquitectura multi-Región prematura es uno de los errores más comunes y costosos
que cometen los ingenieros junior cuando empiezan a sentirse seguros.

Tom asintió. «Entonces no hacemos múltiples Regiones solo porque podemos.»

«No hasta que lo necesitemos», dijo Maya. «Y sabremos cuándo lo necesitamos.»

«¿Cómo lo sabremos?» preguntó Leo.

«Cuando tu documento de revisión de arquitectura tenga un requisito que diga "debe sobrevivir a una interrupción regional"»,
dijo Priya. «Hasta entonces: Multi-AZ.»

## Fortalezas y Limitaciones

**Usa diseño multi-Región y multi-AZ cuando**: tu aplicación tiene usuarios en múltiples geografías y la latencia importa; tu SLA requiere 99,99% o mayor disponibilidad; los requisitos regulatorios exigen residencia de datos en regiones específicas; necesitas recuperación ante desastres con un RTO inferior a una hora.

**Las concesiones son reales**: La replicación de datos entre regiones añade coste — la transferencia de datos entre regiones es una de las partidas más subestimadas en una factura de AWS. También añade complejidad operativa: cada escritura que debe ser consistente entre regiones añade latencia. La mayoría de los fallos que afectan a las aplicaciones reales no son catástrofes entre regiones — son problemas dentro de la región como un grupo de seguridad mal configurado o un despliegue fallido. Invierte en Multi-AZ antes que en múltiples Regiones. Añade múltiples Regiones cuando el caso de negocio sea claro.

## Resumen

- AWS organiza su infraestructura global en **Regiones**, **Zonas de Disponibilidad**
  y **Ubicaciones de Borde**.
- Una **Región** es un clúster geográfico de centros de datos. Cada Región está aislada —
  los datos permanecen en la Región a menos que los muevas explícitamente.
- Las **Zonas de Disponibilidad** son centros de datos físicamente separados dentro de una Región, conectados
  por redes de baja latencia. Desplegar en múltiples AZs es la forma estándar de
  sobrevivir a fallos locales.
- Las **Ubicaciones de Borde** almacenan en caché contenido cerca de los usuarios en todo el mundo. Impulsan CloudFront.
- Elige tu Región según la ubicación de los usuarios, los requisitos de cumplimiento, la disponibilidad de servicios
  y el precio — en ese orden.
- Multi-AZ es la base de resiliencia estándar. Multi-Región es para cargas de trabajo críticas
  con requisitos específicos documentados — no un punto de partida predeterminado.

## Consejos para el Examen

*Dominio SAA-C03 1 — Tarea 1.1 / Dominio 2 — Tarea 2.2*

- **Las Regiones están aisladas de forma predeterminada.** Los datos no se replican entre Regiones a menos que
  lo configures. Esto es importante para los escenarios de soberanía de datos y cumplimiento.
- **Las AZs son la unidad de resiliencia para la mayoría de las preguntas.** Cuando el examen pregunta cómo sobrevivir
  a un fallo de un centro de datos, la respuesta implica múltiples AZs dentro de una Región.
- **Multi-Región es para la resiliencia ante fallos regionales.** Si el escenario dice «debe permanecer
  operativo incluso si falla toda una Región de AWS», la respuesta implica arquitectura multi-Región.
- **Las Ubicaciones de Borde ≠ AZs.** Las Ubicaciones de Borde almacenan en caché contenido — no pueden ejecutar tu
  servidor de aplicaciones. No las confundas con centros de datos.
- El examen prueba con frecuencia la relación entre cumplimiento y selección de Región.
  Si un escenario menciona requisitos de residencia de datos, la elección de Región es parte de la respuesta.

## Ejercicios

**Ejercicio 1 — Recordar**

Con tus propias palabras: ¿cuál es la diferencia entre una Región y una Zona de Disponibilidad?
¿Por qué importa esa distinción al diseñar una aplicación web resiliente?

*(Pista: Piensa en los dos tipos diferentes de fallo contra los que protege cada una.)*

**Ejercicio 2 — Práctica de Examen**

*Escenario*: Una empresa sanitaria estadounidense debe almacenar todos los datos de los pacientes dentro de una única Región de AWS
para cumplir con las políticas internas de residencia de datos. Están diseñando una nueva aplicación cloud en
la Costa Oeste y quieren maximizar la resiliencia sin mover datos a otra Región.

¿Qué configuración satisface MEJOR sus requisitos?

A) Desplegar en `us-east-1` y usar las Ubicaciones de Borde de CloudFront en Oregón para servir contenido
   más rápidamente  
B) Desplegar en `us-west-2` (Oregón) en múltiples Zonas de Disponibilidad  
C) Desplegar en múltiples Regiones incluyendo `us-west-2` y `us-east-1` con replicación de datos entre Regiones  
D) Desplegar en `us-west-2` en una única Zona de Disponibilidad para minimizar costes

**Pista 1**: La política significa que los datos deben permanecer en una única Región. ¿Qué opciones
mueven los datos a otra Región?

**Pista 2**: Entre las opciones que mantienen los datos en `us-west-2`, ¿cuál ofrece más resiliencia?

**Pista 3**: Múltiples AZs dentro de una única Región proporcionan resiliencia sin cruzar
los límites de la Región.

**Respuesta**: B

**Explicación**: `us-west-2` mantiene todos los datos en una única Región, satisfaciendo el requisito de la política.
Desplegar en múltiples AZs dentro de esa Región protege contra
los fallos del centro de datos sin mover datos a otra Región. Este es el equilibrio correcto
entre cumplimiento y resiliencia.

**¿Por qué no A?** CloudFront almacena en caché contenido en Ubicaciones de Borde globalmente — los datos físicamente
saldrían de `us-west-2`, violando la política de residencia.

**¿Por qué no C?** Replicar a `us-east-1` mueve datos de los pacientes a la Costa Este,
violando directamente el requisito de una única Región.

**¿Por qué no D?** Una única AZ no tiene resiliencia. Si esa AZ experimenta una interrupción,
la aplicación falla completamente.

*Dominio SAA-C03 1 — Tarea 1.1 (infraestructura global, soberanía de datos)*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus se está expandiendo para atender clientes en México y Colombia. Actualmente todo
se ejecuta en `us-west-2`. El equipo debate: ¿deberían añadir una segunda Región `us-east-1`,
o quedarse con una única Región con múltiples AZs?

¿Qué preguntas harías antes de decidir? ¿Cuáles son los principales costes y riesgos de
añadir una segunda Región? ¿Cuál es el principal coste de *no* añadirla?

*(No hay una única respuesta correcta. Practica el razonamiento sobre las concesiones de múltiples Regiones.)*

## Escena Post-Créditos

Leo solucionó el problema de Singapur. Nimbus se trasladó a `us-west-2`. La latencia bajó.
La única pregunta de seguimiento de Tom — «¿eso cambió nuestra factura?» — se respondió con un
número ligeramente mayor, que aceptó con visible reluctancia.

Eso duró dos días antes de que surgiera el siguiente problema.

Leo llegó al standup con la expresión que Maya había aprendido a reconocer: la cara de
alguien que había hecho algo que no podía deshacer.

«Bien», dijo con cuidado. «Configuré el servidor. Y necesitaba una forma de iniciar sesión.
Así que creé un nombre de usuario.»

«¿Y?» preguntó Priya.

«'Admin'.»

Silencio.

«¿Y la contraseña?»

Un silencio más largo.

«'Admin123'.»

Priya se puso de pie.

En el próximo capítulo: cómo Nimbus controla quién puede tocar qué — y qué pasa cuando se equivocan.
