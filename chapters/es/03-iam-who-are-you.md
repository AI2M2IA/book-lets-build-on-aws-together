# Capítulo 3: ¿Quién Eres Exactamente?

Leo pulsó desplegar.

El terminal devolvió dos palabras: Acceso Denegado.

Lo intentó de nuevo. El mismo resultado. Llevaba tres semanas trabajando en Nimbus, le habían dado acceso a
la cuenta de AWS el primer día y había estado desplegando en el entorno de
staging sin ningún problema. Pero esto era producción. Y producción,
al parecer, era diferente.

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

Priya no describió esto en términos calmados y abstractos. Lo describió como una historia sobre
una startup que tuvo una brecha, obtuvo una factura de AWS de 80.000 dólares en 24 horas de atacantes que minaban
criptomonedas en su cuenta y cerró tres meses después.

La sala quedó en silencio.

«¿Cuál es la alternativa?» preguntó Tom.

**El Concepto: Identity and Access Management**

La alternativa es un sistema donde no das a todo el mundo la misma llave. Das a cada
persona — y a cada servicio — precisamente el acceso que necesita. Ni más ni menos.

En AWS, este sistema se llama **IAM**: Identity and Access Management (Gestión de Identidades y Accesos).

Piensa en IAM como el sistema de tarjetas de acceso en un gran edificio de oficinas.

El edificio tiene docenas de plantas. La sala de servidores está en la planta 12. La oficina de finanzas
está en la planta 8. La suite del CEO está en la planta 20. Cada empleado tiene una tarjeta, pero
cada tarjeta solo abre las puertas que ese empleado necesita abrir para su trabajo. El
becario no puede pasar a la sala de servidores. El contable no puede acceder al piso ejecutivo
fuera de horario.

IAM funciona igual. Defines quién existe (identidades), qué tienen permitido hacer
(permisos) y aplicas esos permisos a través de políticas.

**Los Elementos Básicos de IAM**

IAM tiene cuatro conceptos centrales. Se construyen unos sobre otros.

Los **Usuarios** son identidades individuales. Maya tiene un usuario de IAM. Tom tiene un usuario de IAM.
Cada usuario tiene sus propias credenciales — y solo debe tener los permisos que
específicamente necesita.

Los **Grupos** son colecciones de usuarios. En lugar de establecer permisos para Maya, Tom,
Priya y Leo individualmente, creas un grupo «Desarrolladores» con permisos de desarrollador
y los añades a él. Cuando se une una quinta persona, la añades al grupo y ella
hereda instantáneamente los permisos correctos.

Los **Roles** son identidades temporales que pueden ser *asumidas* por algo — una persona, un
servicio u otra cuenta de AWS. Profundizaremos en los roles en el Capítulo 14. Por ahora: si
un Usuario es un empleado permanente, un Rol es un pase de visitante. Otorga acceso específico
durante un tiempo o propósito específico.

Las **Políticas** son las reglas de permiso reales. Una política es un documento (escrito en JSON
internamente, pero no necesitas memorizar el formato) que dice: «El titular de esta
política tiene PERMITIDO realizar la acción X en el recurso Y». O «DENEGADO la acción Z».

El modelo de evaluación de IAM es: de forma predeterminada, todo está denegado. Los permisos deben ser
explícitamente otorgados. Si una política no dice que puedes hacer algo, no puedes.

**El Principio del Mínimo Privilegio**

Este es el concepto más importante de toda la seguridad, no solo de IAM.

**Da a las personas y sistemas solo el acceso que necesitan para hacer su trabajo. Nada más.**

Priya llamó a esto «el principio del mínimo privilegio». Suena obvio. En la práctica,
la mayoría de los equipos lo violan constantemente — no con malicia, sino por conveniencia.

«¿Podemos simplemente darle acceso de administrador a Leo para que pueda desplegar las cosas más rápido?»

No.

«¿Podemos simplemente usar la cuenta raíz para todo?»

Absolutamente no.

La cuenta raíz es la llave maestra de toda tu cuenta de AWS. Puede hacer cualquier cosa,
incluido cerrar la cuenta en sí. Debes crearla una vez, configurar la autenticación multifactor
y luego no usarla nunca más para el trabajo diario.

Priya creó usuarios de IAM separados para todos esa tarde. Le dio a Leo permisos
para desplegar en el entorno de desarrollo. No en producción. No en facturación. No en red.
Solo en despliegue.

«Esto se siente restrictivo», dijo Leo.

«Eso es cómo sabes que está bien», respondió Priya.

**Qué Pasa Cuando Te Equivocas en Esto**

Tres escenarios, en orden de gravedad creciente:

**Escenario 1**: Un empleado con acceso de administrador deja la empresa. Nadie desactiva
su cuenta. Tres meses después, todavía tiene acceso. Esto pasa constantemente.
IAM lo resuelve: deshabilitas al usuario. Instantáneamente, en todas partes.

**Escenario 2**: El portátil de un desarrollador está comprometido. El atacante encuentra credenciales de AWS
almacenadas en un archivo de configuración con permisos de administrador completo. Porque las credenciales tienen un acceso amplio,
el atacante puede hacer cualquier cosa: minar criptomonedas, robar datos, eliminar respaldos.
Con el mínimo privilegio: las credenciales solo funcionan para su alcance limitado. El radio de impacto está contenido.

**Escenario 3**: Una aplicación mal escrita expone accidentalmente credenciales de AWS en sus
registros. Si esas credenciales tienen acceso amplio, tienes una brecha catastrófica. Si tienen
acceso estrecho — solo al bucket de S3 específico que la aplicación necesita — la exposición
es limitada y contenida.

El patrón: el acceso debe estar acotado al mínimo. Siempre. No porque desconfíes de
tu gente, sino porque no puedes controlar qué pasa con las credenciales comprometidas.

**Autenticación Multifactor: El Segundo Candado**

Un concepto más antes de cerrar el capítulo.

Incluso con el mínimo privilegio, las credenciales pueden ser robadas. Las contraseñas pueden ser adivinadas,
suplantadas o filtradas. IAM aborda esto con la **Autenticación Multifactor (MFA)**.

MFA requiere algo que *sabes* (contraseña) más algo que *tienes* (un teléfono, una
clave de hardware). Incluso si un atacante roba tu contraseña, no puede iniciar sesión sin
tener también tu teléfono.

MFA debe estar habilitada para cada usuario de IAM. Es innegociable para la cuenta raíz.

Priya pasó la tarde configurándola para todo el mundo.

Tom preguntó si era demasiada fricción. Priya volvió a sacar la historia de la brecha.

Tom configuró MFA de inmediato.

## Fortalezas y Limitaciones

**IAM es la herramienta correcta para**: controlar quién y qué puede acceder a cada recurso de AWS; implementar el mínimo privilegio en usuarios, servicios y límites entre cuentas; generar un rastro de auditoría de cada llamada a la API a través de la integración con CloudTrail; eliminar la necesidad de compartir credenciales de larga duración entre sistemas.

**Donde IAM se complica**: Las políticas de IAM pueden crecer hasta cientos de declaraciones en docenas de roles, y depurar un error de «Acceso Denegado» requiere entender cuál de esas políticas es la efectiva — una tarea que es más difícil de lo que parece. El error más común de IAM no es muy poco acceso — es demasiado. Las políticas excesivamente permisivas creadas para «simplemente hacer que funcione» se convierten en riesgos de seguridad que son dolorosos de revertir después del hecho. Escribe el permiso mínimo primero. Amplía solo cuando algo falle.

## Resumen

- **IAM** (Identity and Access Management) es cómo controlas quién puede hacer qué en AWS.
- Los elementos básicos son: **Usuarios** (individuos), **Grupos** (colecciones de
  usuarios), **Roles** (identidades temporales) y **Políticas** (reglas de permiso).
- De forma predeterminada, todo en AWS está **denegado**. Los permisos deben ser explícitamente otorgados.
- El **Principio del Mínimo Privilegio** significa dar a cada identidad solo el acceso que
  necesita. Nada más.
- La **cuenta raíz** puede hacer cualquier cosa, incluidas cosas catastróficas. Protégela con
  MFA y úsala lo menos posible.
- Habilita **MFA** para cada usuario de IAM. Innegociable.

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

## Ejercicios

**Ejercicio 1 — Recordar**

Con tus propias palabras: ¿cuál es la diferencia entre un Usuario de IAM, un Grupo y un Rol?
¿Cuándo usarías cada uno?

*(Pista: Piensa en la analogía del edificio de tarjetas de acceso — ¿cuál es una tarjeta permanente,
cuál es una agrupación de departamento y cuál es un pase de visitante?)*

**Ejercicio 2 — Práctica de Examen**

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

Lo había intentado una vez, acceder a la base de datos de producción para comprobar algo.

Acceso denegado.

«¿Es esto lo que se siente cuando confían en ti pero no demasiado?» preguntó.

«Eso es exactamente lo que se siente», dijo Priya.

A la mañana siguiente, Tom llegó pronto y encontró algo que le hizo llamar inmediatamente al equipo.

En la consola de AWS, podía ver que su sitio web estaba recibiendo tráfico. Más de lo que esperaban. Y el servidor web — el original de Leo — estaba muy cargado. Muy cargado.

«Tenemos cien usuarios simultáneos», dijo Tom. «Y un servidor.»

En el próximo capítulo: el primer servidor — alquilar un ordenador en el centro de datos de otra persona.
