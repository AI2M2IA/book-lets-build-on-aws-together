# Capítulo 14: Quién Está Autorizado a Hacer Qué

Tom tenía las claves de acceso abiertas en un archivo de texto, listo para pegarlas.

"¿Qué estás haciendo?", preguntó Priya.

"La instancia de EC2 necesita leer archivos de configuración desde S3. Estoy poniendo las credenciales en la configuración del servidor."

Ella miró la pantalla por un momento. "Cierra ese archivo."

"Solo estaba—"

"Si alguien entra en ese servidor", dijo ella, "obtiene esas claves. Y esas claves tocan todo lo que el usuario de IAM tiene permiso de tocar. Que probablemente es mucho más que solo S3."

Tom cerró el archivo.

"Hay una manera mejor", dijo ella. "El servidor mismo puede tener un rol. Piénsalo como un cargo: la instancia no necesita credenciales porque el sistema ya sabe lo que es y lo que puede hacer."

Tom se mostró escéptico. "¿Entonces el servidor se autentica a sí mismo?"

"Sí. Sin contraseña. Sin claves en un archivo de configuración. Sin nada que pueda enviarse accidentalmente al repositorio de git."

Esa última parte le dio que pensar. Tom había encontrado una contraseña de base de datos en el historial de git dos semanas antes. Abrió una nueva pestaña del navegador.

**Revisitando IAM: El Panorama Completo**

El Capítulo 3 introdujo IAM: usuarios, grupos, roles y políticas. Ahora es momento de profundizar.

Las políticas de IAM son documentos JSON que especifican qué acciones están permitidas o denegadas sobre qué recursos. Se ven así:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::nimbus-assets/*"
    }
  ]
}
```

Esta política permite leer y escribir objetos en el bucket `nimbus-assets`, y nada más. No eliminar. No listar buckets. No ninguna otra operación de S3. No ningún otro servicio de AWS.

Esta es la manera correcta de otorgar permisos: acciones específicas, recursos específicos.

**El Problema con el "Acceso de Administrador"**

Las políticas administradas por AWS como `AdministratorAccess` están diseñadas para comenzar rápidamente. No están diseñadas para operar sistemas en producción con miembros reales del equipo.

`AdministratorAccess` otorga todas las acciones sobre todos los recursos. Si un miembro del equipo con esta política comete un error — elimina accidentalmente un bucket de S3, termina la instancia de EC2 equivocada, cambia reglas de grupos de seguridad — no hay nada que AWS pueda hacer para detenerlo. El permiso estaba otorgado.

Si las credenciales de un miembro del equipo son comprometidas (ataque de phishing, clave de acceso filtrada, robo de portátil), el atacante tiene acceso de administrador a todo en tu cuenta de AWS.

"¿Entonces qué debería tener Soo-Jin?", preguntó Leo.

"¿Qué necesita hacer Soo-Jin?", respondió Priya.

"Desplegar la API. Revisar registros. Nada más."

"Entonces obtiene: capacidad para hacer push al pipeline de código, acceso de lectura a los registros de CloudWatch, y nada más."

"Eso es... muy específico."

"Sí. Ese es el punto."

**Roles de IAM: Identidades para Servicios**

El Capítulo 3 introdujo los roles como una forma de que las instancias de EC2 accedan a los servicios de AWS sin almacenar credenciales. Hagamos esto concreto.

Tus instancias de EC2 que ejecutan la API de Nimbus necesitan:

- Leer de DynamoDB (el menú)
- Escribir en DynamoDB (pedidos)
- Poner objetos en S3 (recibos, cargas)
- Escribir registros en CloudWatch
- Leer secretos de Secrets Manager

En lugar de crear un usuario con una clave de acceso y almacenar esa clave en la instancia de EC2 (una pesadilla de seguridad: las claves de acceso pueden ser leídas por cualquiera con acceso SSH), creas un **rol de IAM** para la instancia de EC2 con exactamente estos permisos.

La instancia de EC2 asume el rol automáticamente. AWS proporciona credenciales temporales a través del servicio de metadatos de instancia. Las credenciales rotan automáticamente. Sin clave de acceso que pueda filtrarse.

"¿Y si alguien hackea la instancia de EC2?", preguntó Leo.

"Pueden hacer lo que el rol de EC2 permite", dijo Priya. "Que es leer el menú, escribir pedidos y enviar registros. No pueden eliminar el bucket de S3. No pueden terminar instancias de EC2. No pueden tocar IAM."

"Porque el rol de EC2 no tiene esos permisos."

"Exactamente."

**Asunción de Roles: Cómo los Servicios Se Convierten en Otros Servicios**

Los roles pueden ser asumidos por:

- **Servicios de AWS** (EC2, Lambda, tareas de ECS, etc.)
- **Usuarios de IAM** en tu propia cuenta (elevación de roles: asumes un rol con más permisos para una tarea específica)
- **Usuarios de IAM en otras cuentas de AWS** (acceso entre cuentas: la cuenta de otra organización puede asumir un rol en la tuya)
- **Proveedores de identidad externos** (Google, Active Directory, Okta: acceso federado para usuarios humanos)

Este último patrón, la **federación de identidades**, es cómo las grandes organizaciones dan a sus empleados acceso a AWS sin crear usuarios de IAM individuales para cada persona. El Active Directory de tu empresa tiene tus credenciales. Cuando accedes a AWS, te autenticas contra Active Directory, y AWS te otorga un rol.

**Límites de Permisos: Limitando lo que los Roles Pueden Otorgar**

Aquí hay un problema sutil pero importante: por defecto, IAM no impide que un usuario otorgue permisos que actualmente no tiene.

Si Soo-Jin tiene `iam:CreatePolicy` e `iam:AttachUserPolicy`, podría crear una política que otorgue acceso de escritura a S3 y adjuntársela a sí misma, incluso si sus políticas existentes solo permiten lectura de S3. Esta clase de vulnerabilidad se llama **escalada de privilegios**, y es exactamente por eso que existen los límites de permisos.

¿Pero qué pasa si quieres delegar la creación de permisos de IAM a un líder de equipo, asegurándote de que no pueda otorgar más de lo que pretendías?

Los **límites de permisos** establecen los permisos máximos que pueden otorgarse a una identidad. Aunque las políticas adjuntas a la identidad sean más amplias, los permisos efectivos están acotados por el límite de permisos.

Ejemplo: Das a un líder de equipo una política que le permite crear roles de IAM. Pero adjuntas un límite de permisos que dice "los roles creados por este líder de equipo nunca pueden tener acceso de eliminación en S3." Aunque el líder de equipo cree un rol con acceso completo a S3, el límite impide que la eliminación en S3 tenga efecto.

Este es un concepto avanzado, pero aparece en el examen y refleja cómo las organizaciones delegan la administración de IAM a escala.

**IAM Access Analyzer: Auditar Permisos**

Priya dedicó dos días a revisar la configuración de IAM del equipo. Encontró:

- El usuario personal de Leo tenía acceso de administrador (como se descubrió)
- Una función antigua de Lambda tenía permisos para leer todos los buckets de S3 (sobrante de una prueba)
- Un rol de servicio tenía acceso de escritura a tablas de DynamoDB que ya no existían

Esto es normal. Las configuraciones de IAM acumulan cruft con el tiempo.

**IAM Access Analyzer** es un servicio de AWS que identifica automáticamente los recursos (buckets de S3, roles de IAM, claves de KMS, funciones de Lambda) que se comparten con entidades externas. También identifica políticas con permisos excesivos.

Las auditorías periódicas de IAM deben ser parte de tus operaciones. Los permisos crecen; rara vez se reducen orgánicamente. Access Analyzer ayuda a hacer visible lo invisible.

**Las Políticas de Control de Servicios: Barreras de Protección a Nivel Organizacional**

Si tu entorno de AWS crece hacia múltiples cuentas (un patrón común para equipos grandes: cuenta de desarrollo, cuenta de staging, cuenta de producción), **AWS Organizations** te permite gestionarlas desde una cuenta central.

Dentro de Organizations, las **Políticas de Control de Servicios (SCPs)** aplican barreras de protección que afectan a *todas* las entidades de IAM en la cuenta, incluidos los administradores.

Ejemplo de SCP: "Nadie en la cuenta de desarrollo puede crear instancias de EC2 en la región eu-west-1."

Aunque alguien tenga acceso de administrador en la cuenta de desarrollo, no puede violar este SCP. Se aplica a nivel organizacional, por encima del nivel de cuenta.

Las SCPs no otorgan permisos: los restringen. Definen los permisos máximos que cualquier entidad de IAM en una cuenta puede tener.

## Fortalezas y Limitaciones

**Por qué los roles de IAM y el privilegio mínimo importan**:

- Limita el radio de explosión cuando las credenciales se ven comprometidas
- Obliga a los atacantes a escalar a través de múltiples sistemas en lugar de obtener acceso completo de inmediato
- Proporciona una pista de auditoría: CloudTrail registra qué rol hizo qué
- Fuerza decisiones conscientes sobre el acceso: "¿qué necesita realmente este servicio?"

**Donde se complica**:

- Escribir políticas de IAM precisas requiere entender el modelo de acción/recurso de AWS para cada servicio (y cada servicio tiene docenas de acciones)
- Las políticas demasiado restrictivas rompen las aplicaciones: depurar errores de "acceso denegado" en múltiples servicios es lento
- IAM propaga los cambios con un ligero retraso (generalmente segundos, a veces más): puede causar problemas de temporización confusos
- Los roles entre cuentas requieren una configuración cuidadosa de la política de confianza

## Resumen

- Evita el **acceso de administrador** en producción: es para la configuración, no para las operaciones.
- Las políticas de IAM especifican **Efecto**, **Acción** y **Recurso**: sé específico en los tres.
- Adjunta políticas a **grupos** (para humanos) y **roles** (para servicios).
- Las instancias de EC2, las funciones de Lambda y otros servicios de AWS deben usar **roles de IAM**, no claves de acceso.
- Los **límites de permisos** limitan los permisos máximos que puede tener cualquier identidad, independientemente de las políticas adjuntas.
- Las **SCPs** (Políticas de Control de Servicios) aplican restricciones a nivel organizacional que ni siquiera los administradores pueden anular.
- **IAM Access Analyzer** identifica políticas con permisos excesivos y accesos externos a los recursos.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas Seguras (Dominio 1, Tarea 1.1)*

- **Roles de IAM para EC2**: La respuesta canónica cuando EC2 necesita acceder a S3, DynamoDB, Secrets Manager o cualquier servicio de AWS. Nunca almacenes claves de acceso en una instancia.
- **Lógica de evaluación de políticas**: Cuando IAM evalúa una solicitud, usa una jerarquía de permitir/denegar explícita. Un **Deny** explícito siempre gana, incluso contra un Allow explícito. El valor predeterminado es Deny.
- **Límites de permisos**: Se usan cuando se delega la administración de IAM. Escenario del examen: "permitir a los desarrolladores crear roles para sus funciones Lambda, pero impedir que otorguen permisos más allá de los que tienen." → Límites de permisos.
- **Las SCPs no otorgan permisos**: Solo los restringen. Si una SCP permite S3 pero una política de IAM lo deniega, S3 está denegado. Si una SCP deniega S3 pero una política de IAM lo permite, S3 está denegado.
- **Políticas basadas en recursos**: Algunos servicios de AWS (S3, SQS, Lambda) tienen políticas basadas en recursos: permisos adjuntos al recurso, no a la identidad. Funcionan junto a las políticas de IAM.
- **Acceso entre cuentas**: Rol de IAM en la Cuenta A con una política de confianza que permite a la Cuenta B asumirlo. El usuario/rol de la Cuenta B luego usa `sts:AssumeRole` para obtener credenciales temporales en la Cuenta A.
- **Usuarios de IAM vs Acceso Federado**: Para grandes organizaciones, el acceso federado (a través de IAM Identity Center o federación directa con un IdP) es preferible a los usuarios de IAM individuales.

## Ejercicios

**Ejercicio 1 — Recuerdo**

Explica la diferencia entre una política de IAM adjunta a un usuario y un rol de IAM asumido por una instancia de EC2. ¿Cuándo usarías cada uno?

*(Pista: Piensa en las credenciales: ¿dónde viven y quién gestiona su rotación?)*

**Ejercicio 2 — Práctica para el Examen**

*Escenario*: Una función de Lambda necesita leer de un bucket de S3 y escribir en una tabla de DynamoDB. Un desarrollador le ha dado a la función de Lambda un rol con `AdministratorAccess` por simplicidad durante el desarrollo. Antes de pasar a producción, el equipo de seguridad quiere seguir el principio de privilegio mínimo.

¿Cuál de los siguientes es el MEJOR enfoque?

A) Crear un nuevo usuario de IAM con permisos de lectura en S3 y escritura en DynamoDB; generar una clave de acceso; almacenar la clave en las variables de entorno de Lambda  
B) Adjuntar una política en línea al rol de ejecución de la función Lambda que otorgue `s3:GetObject` en el bucket específico y `dynamodb:PutItem` en la tabla específica  
C) Mantener `AdministratorAccess` pero agregar una SCP que bloquee todas las acciones excepto S3 y DynamoDB  
D) Crear un grupo de IAM con permisos de lectura en S3 y escritura en DynamoDB y agregar la función Lambda al grupo

**Pista 1**: Las funciones de Lambda usan roles de ejecución, no claves de acceso. ¿Qué opción respeta esto?

**Pista 2**: El privilegio mínimo significa acciones específicas en recursos específicos, no políticas amplias.

**Pista 3**: Los grupos de IAM contienen usuarios, no funciones de Lambda.

**Respuesta**: B

**Explicación**: El rol de ejecución de Lambda solo debe tener los permisos específicos que la función necesita. Las políticas en línea con alcance a acciones específicas (`s3:GetObject`) y recursos específicos (el ARN del bucket, el ARN de la tabla de DynamoDB) es la implementación de privilegio mínimo.

**¿Por qué no A?** Almacenar claves de acceso en las variables de entorno de Lambda es un antipatrón de seguridad: las claves pueden ser leídas por cualquiera con acceso a la consola de Lambda o a través del contexto de ejecución. Las funciones de Lambda usan roles de ejecución con credenciales temporales de IAM.

**¿Por qué no C?** Las SCPs se aplican a nivel de organización/cuenta y no funcionan como controles de permisos por función. AdministratorAccess con una SCP es la capa incorrecta.

**¿Por qué no D?** Las funciones de Lambda no pueden añadirse a grupos de IAM. Los grupos son solo para usuarios de IAM.

*Dominio SAA-C03: Diseño de Arquitecturas Seguras — Tarea 1.1*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus ha crecido a tres equipos: el equipo de la API principal, el equipo del portal de socios de restaurantes y el equipo de análisis. Cada equipo tiene cinco desarrolladores y despliega en una cuenta de AWS compartida.

Diseña una estructura de IAM que:

- Dé a cada equipo acceso solo a sus servicios
- Impida que el equipo de análisis escriba en bases de datos de producción
- Permita a un líder de equipo en cada equipo crear roles de IAM para sus servicios, pero sin poder escalar sus propios permisos
- Proporcione un grupo de administración para el equipo de plataforma que pueda gestionar todos los servicios

¿Qué construcciones de IAM usarías? ¿Dónde se aplicarían los límites de permisos?

*(No existe una única respuesta correcta. El objetivo es practicar el diseño de IAM para múltiples equipos.)*

## Escena Post-Créditos

Leo pasó el fin de semana reorganizando IAM.

Para el lunes, cada servicio tenía un rol con exactamente los permisos que necesitaba. Soo-Jin y Rafael tenían membresías de grupo que coincidían con sus funciones laborales reales. El propio Leo había renunciado al acceso de administrador y usaba un rol que él mismo había diseñado, con permiso para hacer su trabajo, y nada más.

Había llevado más tiempo del esperado.

Priya revisó su trabajo el martes por la mañana. Leyó los documentos de política cuidadosamente.

"Esto está bien", dijo.

"Gracias", dijo Leo, con el alivio de alguien que había pasado un fin de semana siendo humillado por JSON.

"Dejaste una cosa."

Leo se tensó.

"La antigua clave de despliegue de la primera versión. En un secreto de GitHub Actions."

"Esa estaba desactivada."

Priya escribió algo. "¿Estaba?"

Una pausa.

"La desactivaré", dijo Leo.

"Los registros de CloudTrail muestran que hizo tres llamadas a la API la semana pasada."

Una pausa más larga.

"Algo la estaba usando", dijo Leo. "Investigaré."

En el próximo capítulo: la diferencia entre un guardia de seguridad que recuerda caras y una puerta que solo lee credenciales.
