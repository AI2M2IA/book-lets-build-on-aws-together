# Capítulo 3: ¿Quién Eres Exactamente?

Eran poco más de las nueve de la mañana. Leo llevaba en su escritorio desde las siete, el café ya frío junto al teclado. La oficina estaba en silencio — Maya aún no había llegado, Tom estaba en una llamada. Afuera, alguien cortaba el césped.

Leo escribió el comando una vez más.

El terminal devolvió dos palabras: Acceso Denegado.

La crisis de Singapur había quedado atrás. La región estaba arreglada, el servidor funcionaba en us-west-2, y el equipo se sentía brevemente competente. Esa sensación había durado unas cuarenta y ocho horas antes de que surgiera el nuevo problema: Leo no podía desplegar en producción. Nadie había configurado sus permisos. Nadie había configurado los permisos de nadie. La cuenta de AWS estaba completamente abierta a nivel raíz y cerrada a cal y canto en todo lo demás, y nadie se había dado cuenta porque nadie lo había intentado.

«Ya lo desplegué — oh», murmuró Leo, desplazándose hacia atrás por su terminal. Había estado desplegando en lo que creía que era producción durante una semana. Era staging. El entorno de producción real nunca había sido tocado.

Maya miró por encima de su hombro el mensaje de error. «¿Quién te dio ese permiso?»

Leo se dio la vuelta. «¿Qué permiso?»

«El permiso para desplegar en producción. ¿Quién lo configuró?»

Leo abrió la consola de AWS y empezó a navegar por los menús. Nadie lo había hecho. No había
ninguna política, ningún rol, ninguna concesión explícita. Tampoco había una denegación explícita — solo una
ausencia. Nadie en Nimbus se había sentado nunca a pensar quién podía hacer qué.

Ese era el problema.

**El Problema con las Contraseñas**

Las contraseñas son un mal modelo para los sistemas informáticos.

No porque siempre sean débiles. Porque son binarias: o tienes la contraseña
o no la tienes. Si la tienes, puedes hacer todo lo que la cuenta tiene permitido hacer.

Eso está bien para un único usuario en su portátil personal. Es catastrófico para
la infraestructura cloud de una empresa.

Considera lo que Nimbus necesita gestionar: el servidor web, la base de datos, el almacenamiento de archivos,
la red, las alertas de facturación, las cuentas de usuario. Si todo está protegido por una contraseña —
o incluso un conjunto de credenciales — entonces cualquiera que obtenga esa contraseña lo obtiene todo.

Y «todo» en AWS significa la capacidad de eliminar bases de datos. Arrancar servidores que acumulen
una factura de 50.000 dólares. Exfiltrar todos los registros de clientes. Destruir los datos de respaldo.

Hay otro problema más allá de la naturaleza binaria de las contraseñas: las contraseñas son estáticas.
No expiran automáticamente. A menudo se reutilizan entre servicios. Se anotan.
Se almacenan en hojas de cálculo etiquetadas «contraseñas NO COMPARTIR». Se comparten
de todos modos, porque la conveniencia vence a la seguridad cuando el mecanismo de seguridad es fricción.

El problema de las «credenciales compartidas» no es un defecto de carácter. Es un problema de sistemas. Cuando
la única forma de otorgar a alguien acceso temporal a un sistema es darle la contraseña
permanente, la gente comparte contraseñas. La solución es construir un sistema donde el acceso
temporal y acotado sea el valor predeterminado — no una solución improvisada que requiere un esfuerzo heroico.

Eso es lo que hace IAM. No solo «mejores contraseñas», sino un modelo fundamentalmente diferente
donde el acceso se define por identidad y política en lugar de por quién conoce una cadena de
caracteres.

Priya no describió esto en términos calmados y abstractos. Lo describió como una historia.

**La Brecha que Costó 80.000 Dólares en Cuatro Horas**

Un desarrollador en una startup subió un script de despliegue de GitHub Actions a su repositorio público. El script contenía credenciales de AWS codificadas directamente como variables de entorno — un error lo suficientemente común como para tener su propia categoría en los post-mortems de seguridad de la nube. Las credenciales tenían acceso de administrador completo a la cuenta de AWS de la empresa, porque alguien las había configurado así seis meses antes para evitar lidiar con las políticas de IAM.

Las credenciales estuvieron en el archivo durante aproximadamente seis minutos antes de que un escáner automatizado — ejecutado por un atacante, no por un investigador de seguridad — las encontrara.

El escáner indexó las credenciales, evaluó los permisos de la cuenta y empezó a arrancar instancias con GPU en múltiples regiones. Las instancias con GPU son caras. También son útiles para minar criptomonedas. Dentro de la primera hora, cuarenta y siete instancias `p3.8xlarge` estaban ejecutándose en `us-east-1`, `eu-west-1` y `ap-southeast-1`.

Una `p3.8xlarge` cuesta unos 12 dólares por hora. Cuarenta y siete de ellas costaban 564 dólares por hora.

Para cuando se disparó la alerta de facturación de la startup — configurada en 1.000 dólares al día, que nadie había pensado en ajustar — habían pasado cuatro horas. La factura se acercaba a los 2.200 dólares y seguía subiendo.

Para cuando alguien entendió lo que estaba pasando y revocó las credenciales, la factura había alcanzado los 3.400 dólares por esas pocas horas. Pero el coste real llegó después: la auditoría reveló que el atacante había estado minando durante semanas ya, silenciosamente, por la noche, usando un segundo conjunto de credenciales filtradas que nadie había notado. Daño total para cuando la auditoría estuvo completa: más de 80.000 dólares.

«¿Y cerraron?» preguntó Tom.

«Tres meses después», dijo Priya. «Los inversores se retiraron. La brecha se reveló. La cobertura de prensa hizo imposible la recaudación de fondos.»

La sala quedó en silencio.

«¿Entonces cuál es la alternativa?» preguntó Tom.

**El Concepto: Identity and Access Management**

La alternativa es un sistema donde no das a todo el mundo la misma llave.

Imagina un edificio de oficinas donde cada planta tiene áreas diferentes, y cada empleado
tiene una tarjeta de acceso que solo abre las puertas que necesita para su trabajo. La tarjeta del becario
funciona en la tercera planta. La tarjeta del contable abre la oficina de finanzas pero no
la sala de servidores. Nadie pasa por una puerta por la que no tiene motivo para pasar.

Ese es el modelo que usa AWS.

AWS llama a este sistema **IAM**: Identity and Access Management (Gestión de Identidades y Accesos).

IAM es el sistema de tarjetas de acceso para toda tu cuenta de la nube. Defines quién existe
(identidades), qué tienen permitido hacer (permisos) y aplicas esos permisos
a través de políticas. El edificio tiene docenas de plantas. IAM se asegura de que cada persona pueda
llegar solo a las plantas que necesita.

La analogía de la tarjeta de acceso se extiende más allá. En un edificio bien gestionado, sabes en cualquier momento quién tiene acceso a qué. Puedes imprimir un informe: aquí están los derechos de acceso de cada tarjeta. Aquí está quién ha estado en la sala de servidores en los últimos 30 días. Aquí están las tarjetas que no se han usado en 90 días (un posible indicador de la tarjeta de un empleado despedido que no se desactivó).

IAM proporciona la misma visibilidad. Cada acción tomada a través de IAM — cada llamada a la API, cada inicio de sesión en la consola, cada concesión de permiso — se registra en **AWS CloudTrail**. Si necesitas saber quién eliminó una base de datos a las 2 de la madrugada de un martes, CloudTrail tiene la respuesta. Si necesitas demostrar a un auditor que solo los usuarios autorizados tenían acceso a los sistemas de producción, CloudTrail proporciona la evidencia.

AWS CloudTrail mantiene automáticamente un historial de 90 días de eventos de gestión, legible desde la consola. Pero 90 días tienen la costumbre de no ser del todo suficientes cuando tu equipo de seguridad necesita auditar algo del trimestre pasado. Para un registro persistente a largo plazo — y para alertas — necesitas crear un **Trail**, que escribe todos los eventos en un bucket de S3 y puede transmitir a CloudWatch Logs. El Trail no es automático; es algo que configuras una vez y luego te olvidas. Hasta que lo necesitas.

La combinación de los controles de acceso de IAM y el registro de auditoría de CloudTrail es lo que permite a las grandes organizaciones operar cuentas de AWS a escala con confianza: el acceso se define y se aplica mediante IAM; cada ejercicio de ese acceso lo registra CloudTrail.

**La Analogía del Hospital**

Aquí hay una segunda manera de pensar en ello — una que hace que la jerarquía de acceso sea más intuitiva.

Imagina un hospital. No solo el edificio físico, sino la estructura organizativa completa de personas, roles y datos.

El **recepcionista** puede ver los horarios de citas de los pacientes y la información del seguro. Puede registrar la entrada y salida de los pacientes. No puede acceder a los registros médicos, no puede modificar recetas, no puede ver historiales quirúrgicos.

El **enfermero** puede acceder a los registros médicos de los pacientes de su planta. Puede administrar medicamentos según las órdenes del médico. No puede recetar medicamentos. No puede autorizar cirugías.

El **médico** puede ver y modificar registros médicos, escribir recetas y solicitar pruebas. No puede acceder al sistema de nóminas. No puede modificar las recetas de otros médicos sin una anulación específica.

El **cirujano** puede acceder a los sistemas del quirófano. Tiene permisos específicos para registros quirúrgicos que la mayoría de los médicos no necesitan.

El **personal de limpieza** puede acceder a los planos de planta y los horarios de las salas. No puede acceder a ningún dato de los pacientes.

Cada persona en el hospital tiene el acceso que necesita para su trabajo — y solo ese. El recepcionista no tiene acceso quirúrgico. El personal de limpieza no ve los registros de los pacientes. Y crucialmente: si se roba la tarjeta de acceso de un miembro del personal de limpieza, el atacante obtiene los horarios de limpieza. No obtiene los registros de los pacientes. El radio de impacto de la brecha está limitado a lo que esa tarjeta podía acceder.

Así es como funciona IAM. Cada identidad — cada usuario, cada servicio, cada proceso automatizado — obtiene exactamente los permisos que necesita. Nada más.

Tom se reclinó. «Así que Leo es el enfermero, y yo soy el contable.»

«Algo así», dijo Priya. «Y ninguno de los dos es el cirujano.»

«¿Quién es el cirujano?»

«Nadie, en el día a día», dijo Priya. «La cuenta raíz es el cirujano. Solo sale para procedimientos específicos y documentados.»

**Los Elementos Básicos de IAM**

IAM tiene cuatro conceptos centrales. Se construyen unos sobre otros.

Los **Usuarios** son identidades individuales. Maya tiene un usuario de IAM. Tom tiene un usuario de IAM.
Cada usuario tiene sus propias credenciales — y solo debe tener los permisos que
específicamente necesita.

Un usuario de IAM tiene dos tipos de credenciales: una **contraseña** para el acceso a la consola (iniciar sesión en la interfaz web de AWS) y **claves de acceso** (un ID de clave y una clave secreta) para el acceso programático a través de la CLI o los SDKs. No siempre necesitas ambas. Un desarrollador que solo usa la CLI no necesita una contraseña de consola. Un usuario no técnico que solo necesita la consola no necesita claves de acceso. Otorga solo lo que se necesita.

Los **Grupos** son colecciones de usuarios. En lugar de establecer permisos para Maya, Tom,
Priya y Leo individualmente, creas un grupo «Desarrolladores» con permisos de desarrollador
y los añades a él. Cuando se une una quinta persona, la añades al grupo y ella
hereda instantáneamente los permisos correctos.

El beneficio práctico de los grupos es la mantenibilidad. Si el grupo «Desarrolladores» necesita un nuevo permiso — digamos, acceso a un nuevo bucket de S3 — lo añades al grupo una vez y todos los desarrolladores lo tienen inmediatamente. Sin grupos, actualizarías a cada usuario individualmente, lo que crea oportunidades de inconsistencia y se olvida de gente.

Los **Roles** son identidades temporales que pueden ser *asumidas* por algo — una persona, un
servicio u otra cuenta de AWS. Profundizaremos en los roles en el Capítulo 14. Por ahora: si
un Usuario es un empleado permanente, un Rol es un pase de visitante. Otorga acceso específico
durante un tiempo o propósito específico.

El uso más importante de los Roles para este capítulo: los Roles de IAM para instancias EC2. Cuando adjuntas un Rol a una instancia EC2, la aplicación que se ejecuta en esa instancia puede hacer llamadas a la API de AWS usando los permisos del Rol — sin ninguna credencial estática almacenada en ningún lugar. Las credenciales son temporales, rotadas automáticamente por AWS, y acotadas a las políticas del Rol. Esto elimina el problema de las «credenciales en archivos de configuración» por completo.

Las **Políticas** son las reglas de permiso reales. Una política es un documento (escrito en JSON
internamente, pero no necesitas memorizar el formato) que dice: «El titular de esta
política tiene PERMITIDO realizar la acción X en el recurso Y». O «DENEGADO la acción Z».

AWS proporciona cientos de **políticas gestionadas** — políticas preescritas para casos de uso comunes. `AmazonS3ReadOnlyAccess` otorga acceso de lectura a todos los buckets de S3. `AmazonEC2FullAccess` otorga control completo de EC2. Para uso en producción, a menudo quieres **políticas gestionadas por el cliente** — políticas que escribes tú mismo, acotadas con precisión a los recursos y acciones que tu aplicación realmente necesita.

El modelo de evaluación de IAM es: de forma predeterminada, todo está denegado. Los permisos deben ser
explícitamente otorgados. Si una política no dice que puedes hacer algo, no puedes.

**El Principio del Mínimo Privilegio**

Da a las personas y sistemas solo el acceso que necesitan para hacer su trabajo. Nada más.

Priya llamó a esto «el principio del mínimo privilegio». Suena obvio. En la práctica,
la mayoría de los equipos lo violan constantemente — no con malicia, sino por conveniencia.

«¿Podemos simplemente darle acceso de administrador a Leo para que pueda desplegar las cosas más rápido?»

No.

«¿Podemos simplemente usar la cuenta raíz para todo?»

Absolutamente no.

La cuenta raíz es la llave maestra de toda tu cuenta de AWS. Puede hacer cualquier cosa,
incluido cerrar la cuenta en sí. Debes crearla una vez, configurar la autenticación multifactor
y luego no usarla nunca más para el trabajo diario.

Hay exactamente un puñado de tareas que requieren la cuenta raíz: cambiar la dirección de correo electrónico de la cuenta, ver información de facturación que no esté delegada de otra manera, cerrar la cuenta y unas pocas operaciones administrativas más que AWS restringe explícitamente a la raíz. Para todo lo demás — crear usuarios, desplegar infraestructura, acceder a bases de datos — usas usuarios y roles de IAM. La cuenta raíz es para el administrador del edificio. Todos los demás tienen tarjetas de acceso apropiadas.

Priya creó usuarios de IAM separados para todos esa tarde. Le dio a Leo permisos
para desplegar en el entorno de desarrollo. No en producción. No en facturación. No en red.
Solo en despliegue.

«Esto se siente restrictivo», dijo Leo.

«Eso es cómo sabes que está bien», respondió Priya.

El límite entre desarrollo y producción fue la primera y más importante línea de mínimo privilegio que Priya trazó. Los desarrolladores necesitaban moverse rápido en desarrollo: crear recursos, probar configuraciones, cometer errores. Pero producción era diferente. Los cambios en producción debían ser deliberados, revisados y ejecutados a través de un proceso controlado. Dar a un desarrollador acceso directo a producción era darle la capacidad de cometer errores en producción a velocidad de desarrollo.

Con el tiempo, Priya construyó un sistema donde el acceso a producción se otorgaba temporalmente a través de un proceso de asunción de rol: un desarrollador que necesitaba hacer un cambio en producción solicitaba el acceso, lo obtenía durante una ventana de 4 horas, hacía el cambio, y el acceso expiraba automáticamente. La ventana quedaba registrada en CloudTrail. El acceso no podía usarse después de expirar. Producción estaba protegida no negando el acceso permanentemente, sino haciendo el acceso limitado en el tiempo y auditable.

Puede que te estés preguntando: si todo está denegado de forma predeterminada, ¿por qué la cuenta raíz tiene acceso completo? La cuenta raíz es especial — omite IAM por completo. Eso es precisamente por lo que la guardas bajo llave. Cada otra acción en AWS pasa por la cadena de evaluación de IAM, donde un Allow ausente es lo mismo que un Deny.

**Radio de Impacto: Por Qué el Mínimo Privilegio Salva Empresas**

Hay un concepto que los ingenieros de seguridad usan para pensar en el compromiso de credenciales: el **radio de impacto**.

El radio de impacto es el daño máximo que un atacante puede hacer si obtiene una credencial dada.

Un atacante con las credenciales raíz de una cuenta de AWS tiene un radio de impacto ilimitado. Puede eliminar todos los recursos, exfiltrar cada byte de datos, arrancar instancias con GPU en cada Región y cerrar la cuenta. La credencial en sí no contiene límites.

Un atacante con las credenciales de IAM de Leo — acotadas a desplegar en el entorno de desarrollo y leer de un bucket de S3 — tiene un radio de impacto diminuto. Puede desplegar en dev. Puede leer algunos archivos. No puede tocar producción. No puede acceder a la base de datos. No puede ver la facturación. No puede arrancar instancias con GPU.

La historia de la brecha de antes tenía un gran radio de impacto porque las credenciales del desarrollador eran de administrador. Si esas mismas credenciales hubieran estado acotadas a su trabajo real — desplegar en un entorno específico — el daño habría sido mucho menor. El ataque podría haber ocurrido igualmente. El resultado habría sido diferente.

Por eso el mínimo privilegio no es solo política. Es arquitectura. Cada permiso que no otorgas es radio de impacto que no tienes.

**Qué Pasa Cuando Te Equivocas en Esto**

Tres escenarios, en orden de gravedad creciente:

**Escenario 1**: Un empleado con acceso de administrador deja la empresa. Nadie desactiva
su cuenta. Tres meses después, todavía tiene acceso. Esto pasa constantemente.
IAM lo resuelve: deshabilitas al usuario. Instantáneamente, en todas partes.

Este es el modo de fallo de IAM más común, y es enteramente prevenible. La mayoría de las organizaciones
tienen un proceso para revocar el acceso físico (devolver una tarjeta, devolver un portátil) pero
pasan por alto IAM. La lista de verificación de baja que incluye «deshabilitar el usuario de IAM» y
«eliminar de todos los grupos de IAM» no es un desafío de ingeniería complejo — es disciplina
de proceso. Los equipos que lo hacen de manera consistente son los que nunca descubren qué
pasa cuando un exempleado todavía puede acceder a la base de datos de producción.

**Escenario 2**: El portátil de un desarrollador está comprometido. El atacante encuentra credenciales de AWS
almacenadas en un archivo de configuración con permisos de administrador completo. Porque las credenciales tienen un acceso amplio,
el atacante puede hacer cualquier cosa: minar criptomonedas, robar datos, eliminar respaldos.
Con el mínimo privilegio: las credenciales solo funcionan para su alcance limitado. El radio de impacto está contenido.

El patrón de credenciales-en-archivo-de-configuración es más común de lo que debería. Los desarrolladores
a menudo almacenan credenciales de AWS en `~/.aws/credentials` para el desarrollo local — lo cual está
bien. El problema es cuando esas credenciales tienen acceso a nivel de producción en lugar de
estar acotadas a un entorno de pruebas. Las credenciales de desarrollo deben estar acotadas a un
entorno de desarrollo. El acceso a producción debe requerir pasos explícitos para asumirse, no
estar presente en cada portátil todo el tiempo.

**Escenario 3**: Una aplicación mal escrita expone accidentalmente credenciales de AWS en sus
registros. Si esas credenciales tienen acceso amplio, tienes una brecha catastrófica. Si tienen
acceso estrecho — solo al bucket de S3 específico que la aplicación necesita — la exposición
es limitada y contenida.

El escenario de credenciales-de-aplicación-en-registros es sutil. A menudo ocurre cuando el código de
depuración registra el contexto completo de la solicitud — incluyendo las cabeceras de autorización — o cuando un
manejador de errores serializa todas las variables de entorno (incluyendo `AWS_ACCESS_KEY_ID`) en un archivo
de registro. La salvaguarda aquí son los Roles de IAM para EC2, que eliminan las credenciales estáticas del
entorno de la aplicación por completo. Si no hay credenciales estáticas, no pueden
aparecer en los registros.

El patrón: el acceso debe estar acotado al mínimo. Siempre. No porque desconfíes de
tu gente, sino porque no puedes controlar qué pasa con las credenciales comprometidas.

**Si Acceso Amplio, Entonces Comodidad Pero Exposición**

Siempre hay una tentación de dar a los equipos un acceso más amplio del que necesitan — hace
los despliegues más rápidos, reduce la fricción, evita los momentos de «Acceso Denegado» que rompen
el flujo. Si das a todo el mundo acceso de administrador, entonces los despliegues son fluidos y nadie se
bloquea — pero cuando las credenciales se filtran (y lo hacen), el atacante hereda los derechos completos
de administrador. Un portátil comprometido se convierte en una brecha completa de la cuenta. Escribe el permiso
mínimo primero. Amplía solo cuando algo falle. Esa regla salva empresas.

**Autenticación Multifactor: El Segundo Candado**

Incluso con el mínimo privilegio, las credenciales pueden ser robadas. Las contraseñas pueden ser adivinadas,
suplantadas o filtradas. IAM aborda esto con la **Autenticación Multifactor (MFA)**.

MFA requiere algo que *sabes* (contraseña) más algo que *tienes* (un teléfono, una
clave de hardware). Incluso si un atacante roba tu contraseña, no puede iniciar sesión sin
tener también tu teléfono.

MFA debe estar habilitada para cada usuario de IAM. Es innegociable para la cuenta raíz.

Priya pasó la tarde configurándola para todo el mundo. No fue sobre ruedas.

La app de autenticación de Leo registró la cuenta equivocada dos veces. Tuvo que escanear el código QR tres veces porque el reloj de su portátil estaba ligeramente desincronizado, lo que provocaba que los tokens basados en tiempo fallaran. En el tercer intento, funcionó.

«¿Hay una manera de hacer esto sin la app?» preguntó Leo, mirando su teléfono.

«Claves de hardware», dijo Priya. «Un dispositivo físico que se conecta por USB. Más seguro que la app. Más caro.»

«¿Cuánto más?»

«Unos 50 dólares por clave. Querrías dos, por si pierdes una.»

Tom escribió «100 dólares por desarrollador» en su cuaderno.

«Las vamos a comprar», dijo Priya. «Para la cuenta raíz como mínimo.»

Tom preguntó si era demasiada fricción en general. Priya volvió a sacar la historia de la brecha.

Tom configuró MFA de inmediato.

«¿Y qué pasa si alguien intenta entrar por la fuerza mientras estamos en medio de esta transición?» preguntó Priya. «¿Antes de que todos tengan MFA habilitada?»

Nadie tenía una buena respuesta. Configuró MFA para la cuenta raíz primero, antes que para nadie más.

**IAM Access Analyzer: El Segundo Par de Ojos**

Priya tenía una herramienta más que mostrarle al equipo después de que la configuración de MFA estuviera completa.

«Esta se ejecuta automáticamente», dijo, abriendo una nueva pestaña de la consola.

**IAM Access Analyzer** es un servicio que analiza continuamente tus políticas de IAM y señala cualquier cosa que otorgue acceso a recursos fuera de tu cuenta — o fuera de lo que esperarías.

Encontró algo en la primera ejecución.

Un bucket de S3 — uno que Leo había configurado como «temporal» hace tres semanas y luego olvidado — tenía una política de bucket que permitía acceso de lectura público. El bucket contenía algunos archivos de datos de prueba, nada sensible. Pero también contenía una carpeta que Leo había nombrado `db-backups-staging` y poblado con unos pocos archivos SQL exportados para probar el proceso de importación.

«¿Hay algo sensible en esos archivos SQL?» preguntó Priya.

Leo miró el nombre de la carpeta. Luego los archivos dentro de ella. Luego el techo.

«Exporté la base de datos de staging», dijo. «Que tiene copias de datos tempranos de clientes de producción.»

Priya cerró su portátil lentamente.

El bucket se configuró como privado en cinco minutos. Access Analyzer continuó monitorizando cualquier política futura que abriera recursos inesperadamente.

«Piénsalo como una alarma perimetral», dijo Priya. «Cada vez que alguien deja una puerta abierta accidentalmente, nos lo dice.»

Puede que te estés preguntando: ¿IAM Access Analyzer reemplaza la revisión manual de políticas? No. Es una herramienta de detección, no de prevención. Te informa sobre el acceso que se ha otorgado — no puede decirte si ese acceso fue intencional. La revisión humana de «¿era correcta esta política?» todavía tiene que ocurrir. Access Analyzer solo se asegura de que las ventanas abiertas no pasen desapercibidas.

## Fortalezas y Limitaciones

**IAM es la herramienta correcta para**:

- Controlar quién y qué puede acceder a cada recurso de AWS
- Implementar el mínimo privilegio en usuarios, servicios y límites entre cuentas
- Eliminar la necesidad de compartir credenciales de larga duración entre sistemas
- Cada acción de IAM se registra automáticamente, dándote un rastro de auditoría de quién hizo qué y cuándo (cubierto en el Capítulo 14)
- Acceso entre cuentas: un Rol de IAM en la Cuenta A puede ser asumido por un principal en la Cuenta B, permitiendo el intercambio controlado de recursos entre cuentas de AWS sin compartir credenciales

**Donde IAM se complica**: Las políticas de IAM pueden crecer hasta cientos de declaraciones en docenas de roles, y depurar un error de «Acceso Denegado» requiere entender cuál de esas políticas es la efectiva — una tarea que es más difícil de lo que parece. El error más común de IAM no es muy poco acceso — es demasiado. Las políticas excesivamente permisivas creadas para «simplemente hacer que funcione» se convierten en riesgos de seguridad que son dolorosos de revertir después del hecho. Escribe el permiso mínimo primero. Amplía solo cuando algo falle.

Hay un desafío práctico con IAM a escala: la **proliferación de políticas**. Las organizaciones que llevan varios años ejecutando AWS a menudo tienen docenas o cientos de políticas personalizadas, muchas de las cuales se solapan, algunas de las cuales nunca se usan, y unas pocas de las cuales se contradicen entre sí de maneras que nadie ha notado porque las contradicciones solo importan para casos límite. AWS proporciona **IAM Access Analyzer** (que presentamos en este capítulo) y herramientas de **simulación de políticas de IAM** para ayudar a auditar y racionalizar las políticas. Pero la estrategia más efectiva es construir políticas limpias desde el principio y auditar regularmente — en lugar de dejar que las políticas se acumulen e intentar desenredarlas más tarde.

Priya configuró una revisión trimestral de IAM: listar todos los roles y políticas, comprobar cuáles se usan activamente mediante los registros de CloudTrail, señalar cualquier credencial no utilizada o política demasiado amplia para eliminar o restringir. La revisión tardaba dos horas por trimestre y detectó tres problemas de política en su primer año.

«No es un trabajo emocionante», dijo. «Pero las revisiones de acceso son cómo encuentras las cosas que habrían sido catastróficas si alguien las hubiera notado primero.»

## Resumen

La contraseña Admin123 era el síntoma. La enfermedad era que Nimbus no tenía ninguna estrategia de control de acceso en absoluto — una credencial raíz compartida, sin roles, sin políticas, sin rastro de auditoría. IAM no solo arregla el síntoma; obliga al equipo a responder una pregunta que habían estado evitando: ¿quién, exactamente, tiene permitido hacer qué? La respuesta a esa pregunta es el fundamento de toda arquitectura de AWS segura.

- **IAM** (Identity and Access Management) es cómo controlas quién puede hacer qué en AWS. Los elementos básicos son: **Usuarios**, **Grupos**, **Roles** y **Políticas**.
- De forma predeterminada, todo en AWS está **denegado**. Los permisos deben ser explícitamente otorgados.
- El **Principio del Mínimo Privilegio** significa dar a cada identidad solo el acceso que necesita — minimizando el **radio de impacto** si alguna vez una credencial se ve comprometida.
- La **cuenta raíz** puede hacer cualquier cosa, incluidas cosas catastróficas. Protégela con MFA y úsala lo menos posible.
- Habilita **MFA** para cada usuario de IAM. Innegociable — en el examen y en producción.

## Consejos para el Examen

*Dominio SAA-C03 1 — Tarea 1.1 (acceso seguro a los recursos de AWS)*

- **Todo está denegado de forma predeterminada.** Se requiere un «Allow» explícito. Si una política
  no menciona una acción, la acción está denegada.
- **El Deny explícito siempre gana.** Si alguna política en la cadena deniega una acción, esa
  denegación no puede ser anulada por un Allow en ningún otro lugar de la cadena. Esto coge a muchos
  candidatos desprevenidos.
- **La cuenta raíz ≠ el administrador de IAM.** La cuenta raíz es una credencial separada de IAM.
  No puedes eliminar la cuenta raíz. *Sí puedes* (y deberías) restringir cuándo se usa.
- **IAM es global**, no regional. Los usuarios, grupos, roles y políticas de IAM existen
  en toda la cuenta de AWS, no por Región.
- **Los Roles son la forma preferida de otorgar acceso a los servicios de AWS.** Si una instancia EC2
  necesita acceder a S3, adjuntas un Rol de IAM a la instancia — no almacenas
  credenciales en la máquina. Este patrón aparece constantemente en el examen.
- **IAM Access Analyzer** genera hallazgos cuando los recursos son accesibles desde fuera de la cuenta o desde fuera de la organización. Cuando un escenario del examen menciona detectar acceso externo no intencionado a S3 o KMS, Access Analyzer es la respuesta.
- **La MFA para la cuenta raíz es obligatoria**, no opcional, en el contexto de las mejores prácticas de seguridad de AWS. Las preguntas del examen sobre asegurar la cuenta raíz siempre incluyen MFA como parte de la respuesta correcta.
- **Los límites de permisos** son una función avanzada de IAM (cubierta en el Capítulo 14) que limita los permisos máximos que un usuario o rol de IAM puede tener, incluso si sus políticas otorgan más. Las preguntas del examen sobre «prevenir la escalada de privilegios» o «establecer un techo de permiso máximo» apuntan a los límites de permisos.
- **Las Políticas de Control de Servicio (SCPs)** son políticas a nivel organizacional que restringen lo que puede hacerse en las cuentas miembro de una AWS Organization. Funcionan por encima del nivel de IAM — incluso un administrador de cuenta no puede exceder los límites establecidos por una SCP. Cuando un escenario del examen involucra la gobernanza de seguridad multicuenta, piensa en SCPs.
- **CloudTrail** registra todas las llamadas a la API de IAM. Cuando un escenario del examen pregunta «cómo auditarías qué usuarios hicieron cambios en las políticas de IAM», la respuesta es CloudTrail. Cada acción de IAM — crear un usuario, modificar una política, asumir un rol — se registra. El historial de eventos de 90 días es automático y gratuito; para la retención a largo plazo y las alertas, debes crear un Trail que entregue los registros a un bucket de S3.

## Ejercicios

**Ejercicio 1 — Recordar**

Con tus propias palabras: ¿cuál es la diferencia entre un Usuario de IAM, un Grupo y un Rol?
¿Cuándo usarías cada uno?

*(Pista: Piensa en la analogía del edificio de tarjetas de acceso — ¿cuál es una tarjeta permanente,
cuál es una agrupación de departamento y cuál es un pase de visitante?)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: Una empresa ejecuta una aplicación web en instancias EC2 que necesitan leer archivos
de un bucket de S3. Un desarrollador junior sugiere almacenar las claves de acceso de AWS directamente en
el código de la aplicación en las instancias EC2. El equipo de seguridad se opone.

¿Cuál es la solución MÁS segura y operativamente apropiada?

A) Almacenar las claves de acceso en variables de entorno en la instancia EC2 en lugar de en el
   código  
B) Crear un usuario de IAM dedicado con permisos de lectura de S3 y compartir las credenciales
   con el equipo de desarrollo  
C) Adjuntar un Rol de IAM con los permisos de lectura de S3 apropiados directamente a las instancias EC2  
D) Usar las credenciales de la cuenta raíz para dar a la aplicación acceso completo a todos los recursos de AWS

**Pista 1**: El problema de almacenar credenciales en cualquier lugar de la instancia es que
las credenciales pueden filtrarse. ¿Hay una forma de dar acceso a la instancia EC2 sin
usar credenciales en absoluto?

**Pista 2**: AWS tiene un mecanismo por el que los servicios pueden recibir permisos sin
necesitar credenciales estáticas. ¿Cómo se llama ese mecanismo?

**Pista 3**: Los Roles de IAM se pueden adjuntar a las instancias EC2. Cuando lo están, la instancia
recibe automáticamente credenciales temporales que AWS rota. No se necesitan credenciales estáticas.

**Respuesta**: C

**Explicación**: Adjuntar un Rol de IAM a una instancia EC2 es el patrón correcto.
La instancia obtiene automáticamente credenciales temporales y rotativas a través del servicio de
metadatos de EC2. No hay credenciales de larga duración que filtrar, rotar o confirmar accidentalmente
en un repositorio.

**¿Por qué no A?** Las variables de entorno en una instancia EC2 todavía pueden filtrarse —
a través de registros de aplicaciones, puntos de depuración o si la instancia está comprometida.
Las credenciales estáticas son el problema, no su ubicación.

**¿Por qué no B?** Crear un usuario de IAM compartido y distribuir credenciales a un equipo
viola el mínimo privilegio y hace que la rotación de credenciales sea una pesadilla. Si una persona
se va, no puedes revocar fácilmente solo su acceso sin cambiar las credenciales compartidas.

**¿Por qué no D?** Usar credenciales de la cuenta raíz para cualquier aplicación es una grave violación de seguridad.
La cuenta raíz tiene acceso ilimitado y sus credenciales nunca deben salir del control del propietario de la cuenta.

*Dominio SAA-C03 1 — Tarea 1.1 (roles de IAM, mínimo privilegio)*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus va a incorporar tres nuevos desarrolladores el próximo mes. Cada uno necesitará niveles de acceso diferentes: uno trabaja en la capa de base de datos, uno en los servidores de aplicaciones, uno en los archivos estáticos del frontend. También hay un pipeline de CI/CD que necesita desplegar código.

Diseña una estructura de IAM para este escenario. ¿Qué usuarios, grupos, roles y políticas crearías? ¿Cuál sería el límite de mínimo privilegio más importante a aplicar?

*(No hay una única respuesta correcta. Piensa en minimizar el radio de impacto si cualquier
identidad está comprometida.)*

## Escena Post-Créditos

Al final del día, cada usuario de IAM tenía MFA habilitada. La cuenta de Leo se había reducido
a acceso de nivel de desarrollador: desplegar en el entorno de dev, leer del bucket de configuración compartido, nada más.

Lo había intentado una vez, acceder a la base de datos de producción.

Acceso denegado.

«¿Es esto lo que se siente cuando confían en ti pero no demasiado?» preguntó.

«Eso es exactamente lo que se siente», dijo Priya.

A la mañana siguiente, Tom llegó pronto y encontró algo que le hizo llamar inmediatamente al equipo.

En la consola de AWS, podía ver que su sitio web estaba recibiendo tráfico. Más de lo que esperaban. Y el servidor web — el original de Leo — estaba muy cargado. Muy cargado.

«Tenemos cien usuarios simultáneos», dijo Tom. «Y un servidor.»

En el próximo capítulo: el primer servidor — alquilar un ordenador en el centro de datos de otra persona.
