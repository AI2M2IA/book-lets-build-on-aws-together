# Capítulo 16: Claves, Cerraduras y Secretos

Leo estaba revisando el historial de git cuando lo encontró. Una contraseña de base de datos. Confirmada hace seis meses, en texto plano, por alguien que ya no trabajaba en Nimbus. El commit era público. La contraseña había cambiado desde entonces, pero no lo sabían con certeza. Revisaron cada sistema que esa credencial había tocado. Llevó cuatro horas. Ese fue el día en que Nimbus decidió dejar de poner secretos en el código.

**Los Dos Problemas: Almacenar Secretos y Cifrar Datos**

La seguridad alrededor de la información sensible tiene dos problemas distintos:

**Almacenar credenciales** (contraseñas de bases de datos, claves de API, cadenas de conexión): ¿Dónde viven? ¿Quién puede acceder a ellas? ¿Cómo las rotas sin volver a desplegar tu aplicación?

**Cifrar datos** (información de clientes, registros de pagos, PII): ¿Cómo garantizas que, aunque alguien obtenga acceso no autorizado a tu base de datos o bucket de S3, no pueda leer los datos?

AWS tiene un servicio dedicado para cada problema:

- **AWS Secrets Manager**: Almacena y gestiona credenciales de forma segura
- **AWS KMS (Key Management Service)**: Gestiona claves de cifrado para cifrar y descifrar datos

**AWS Secrets Manager: No Más Credenciales Codificadas**

Secrets Manager es un almacén seguro para secretos: credenciales de bases de datos, claves de API, tokens OAuth, claves SSH o cualquier cosa sensible.

En lugar de que tu aplicación lea una contraseña de una variable de entorno o un archivo de configuración, llama a la API de Secrets Manager al inicio (o cuando sea necesario) y recupera el secreto. El secreto nunca toca el disco. Nunca aparece en tu código. No está en tus variables de entorno.

Así es como se ve el flujo:

**Manera antigua**:
```
DB_PASSWORD=supersecretpassword123  # en el archivo .env o variable de entorno
```

**Manera con Secrets Manager**:
```python
import boto3
client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='nimbus/production/db-password')
password = json.loads(secret['SecretString'])['password']
```

La instancia de EC2 necesita un rol de IAM con permiso para llamar a `secretsmanager:GetSecretValue` para ese secreto específico. Ningún otro servicio puede leerlo. El secreto nunca está en el código.

**Rotación Automática: El Poder Real**

La mayor característica de Secrets Manager no es almacenar secretos: es rotarlos automáticamente.

El escenario: cada 30 días, Secrets Manager genera una nueva contraseña de base de datos, la actualiza en RDS, actualiza el secreto almacenado, y tu aplicación recupera la nueva contraseña la próxima vez que la necesita. Sin intervención manual. Sin despliegue. Sin "tengo que recordar rotar esto."

La rotación se implementa como una función de Lambda. AWS proporciona plantillas para bases de datos de RDS (MySQL, PostgreSQL, Aurora). Puedes personalizar la función para cualquier tipo de credencial.

Tom tenía una pregunta sobre el costo. (Por supuesto que sí.)

Secrets Manager cobra por secreto por mes más por llamada a la API. Para un pequeño número de contraseñas de bases de datos y claves de API, el costo es de dólares al mes: insignificante comparado con el costo de un incidente.

"El compromiso de la semana pasada", dijo Priya, "¿cuánto habría costado investigar y remediar?"

Tom guardó silencio por un momento. "Incluyendo mi tiempo, tu tiempo, el fin de semana de Leo... un par de miles de dólares."

"Secrets Manager habría detectado la clave estática antes de que fuera explotada. Y la habría rotado automáticamente."

Tom abrió la página de precios.

**AWS KMS: La Fábrica de Cerraduras**

AWS KMS (Key Management Service) gestiona **claves criptográficas**: los valores secretos usados para cifrar y descifrar datos.

La analogía: KMS es como una empresa de cajas fuertes que guarda la llave maestra. Tus datos (el contenido de la caja) están cifrados. Solo alguien con permiso para usar la clave de KMS puede descifrarlos. KMS registra cada uso de cada clave en CloudTrail.

Las **Claves Maestras de Cliente (CMKs)**, ahora llamadas simplemente claves de KMS, vienen en dos tipos:

**Claves administradas por AWS**: AWS crea y gestiona la clave automáticamente para servicios como S3, EBS, RDS. No controlas la clave directamente, pero puedes ver que se está usando. Gratuitas.

**Claves administradas por el cliente**: Tú creas la clave en KMS y controlas cada aspecto de ella: quién puede usarla, cuándo rota, quién puede administrarla. Puedes habilitar la rotación anual automática. Costo: $1/mes por clave más cargos por llamada a la API.

**Cifrado en Servicios de AWS: Integración con KMS**

La mayoría de los servicios de AWS se integran con KMS para el cifrado:

**S3**: Habilita el "cifrado del lado del servidor con KMS" en un bucket. Cada objeto se cifra en reposo con una clave de KMS. Leer un objeto requiere permiso tanto en el bucket de S3 *como* en la clave de KMS.

**RDS**: Habilita el cifrado en el momento de la creación. El almacenamiento de la base de datos, las copias de seguridad y las instantáneas se cifran con una clave de KMS. Nota: el cifrado no puede habilitarse en una instancia de RDS no cifrada existente: debes tomar una instantánea, copiarla con el cifrado habilitado y restaurar desde ella.

**EBS**: Cifra los volúmenes con KMS. Los nuevos volúmenes creados a partir de instantáneas cifradas se cifran automáticamente.

**DynamoDB**: El cifrado en reposo con KMS está habilitado por defecto en todas las tablas.

**ElastiCache Redis**: Cifrado en reposo con KMS para datos en caché sensibles.

El principio: los datos deben cifrarse en reposo (almacenados en disco) y en tránsito (moviéndose a través de una red). KMS gestiona el cifrado en reposo. TLS/SSL (proporcionado automáticamente por los servicios de AWS) gestiona el cifrado en tránsito.

**Cifrado de Sobre: Cómo Funciona Realmente KMS**

Aquí hay un detalle que te ayuda a entender el comportamiento de KMS y las preguntas del examen.

KMS no cifra tus datos directamente en la mayoría de los casos. Usa el **cifrado de sobre**:

1. KMS genera una **clave de datos** (una clave simétrica única)
2. El servicio usa la clave de datos para cifrar tus datos localmente (rápido: cifrado simétrico)
3. El servicio le pide a KMS que cifre la propia clave de datos (usando tu clave de KMS)
4. Tanto los datos cifrados como la clave de datos cifrada se almacenan
5. Tus datos reales nunca salen del servicio: solo la clave de datos va a KMS para su cifrado/descifrado

Cuando lees los datos:

1. El servicio le pide a KMS que descifre la clave de datos
2. KMS verifica los permisos, descifra la clave de datos y la devuelve
3. El servicio usa la clave de datos descifrada para descifrar tus datos localmente

Esto significa que KMS puede manejar datos muy grandes sin enviarlos todos a través de la API de KMS. Solo las claves pequeñas van a KMS. CloudTrail registra cada llamada a la API de KMS: cada operación de cifrado y descifrado.

**Secrets Manager vs Parameter Store**

AWS también tiene **Systems Manager Parameter Store**, que almacena valores de configuración (no solo secretos). Parameter Store es más económico: gratuito para los parámetros estándar. También puede almacenar parámetros cifrados con KMS.

Para secretos que necesitan rotación: Secrets Manager.

Para valores de configuración y parámetros no sensibles: Parameter Store (el nivel gratuito es muy generoso).

Para la configuración de la aplicación (números de puerto, indicadores de características, configuraciones específicas del entorno): Parameter Store.

## Fortalezas y Limitaciones

**AWS Secrets Manager**:

- Rotación automática de secretos sin cambios en el código
- Control de acceso de IAM detallado por secreto
- Versionado (acceso a la versión anterior durante la rotación)
- Auditoría a través de CloudTrail
- Costo: ~$0.40/secreto/mes + llamadas a la API

**AWS KMS**:

- Gestión centralizada de claves con pista de auditoría completa
- Rotación anual automática de claves para claves administradas por el cliente
- Permisos de IAM detallados por clave (políticas de clave + políticas de IAM)
- Respaldado por Módulo de Seguridad de Hardware (HSM): las claves nunca salen del HSM
- Costo: $1/mes por clave + $0.03 por 10.000 llamadas a la API

**Donde se complica**:

- Las políticas de clave de KMS son independientes de (y se evalúan junto con) las políticas de IAM: puede ser confuso depurarlas
- El cifrado en reposo debe planificarse: no puedes cifrar una instancia de RDS no cifrada existente directamente
- La eliminación de claves en KMS tiene un período de espera de 7 a 30 días (un mecanismo de seguridad: las claves perdidas significan datos perdidos)
- Los costos de Secrets Manager escalan con el número de secretos y las llamadas a la API a escala

## Resumen

- Nunca almacenes credenciales en código, variables de entorno o archivos de configuración confirmados en el control de versiones.
- **Secrets Manager** almacena las credenciales de forma segura y las rota automáticamente. Las aplicaciones obtienen los secretos a través de la API.
- **KMS** gestiona las claves de cifrado. La mayoría de los servicios de AWS se integran con KMS para el cifrado en reposo.
- El **cifrado en reposo** (datos almacenados en disco) usa claves de KMS administradas por AWS o por ti. El **cifrado en tránsito** usa TLS.
- **Cifrado de sobre**: KMS cifra la clave, no los datos directamente. El servicio cifra los datos con una clave de datos local.
- **Claves de KMS administradas por el cliente**: control total sobre la rotación, el acceso y la auditoría. **Claves administradas por AWS**: automáticas, sin necesidad de configuración.
- **Parameter Store** es una alternativa más ligera a Secrets Manager para valores de configuración no sensibles.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas Seguras (Dominio 1, Tarea 1.3)*

- **Secrets Manager vs SSM Parameter Store**: Secrets Manager para credenciales que necesitan rotación automática; Parameter Store para la configuración general. El examen los distingue por el requisito de rotación y la sensibilidad al costo.
- **Políticas de clave de KMS**: Una clave de KMS tiene su propia política de clave (una política basada en recursos). Las políticas de IAM por sí solas no otorgan acceso a una clave de KMS: la política de clave debe permitirlo explícitamente.
- **Cifrado de RDS**: No se puede habilitar el cifrado en una instancia de RDS no cifrada existente. El proceso: crear una instantánea → copiar la instantánea con el cifrado habilitado → restaurar desde la instantánea cifrada → migrar el tráfico a la nueva instancia.
- **Cifrado de EBS**: Los nuevos volúmenes pueden cifrarse. Las instantáneas de volúmenes cifrados siempre están cifradas. Los volúmenes no cifrados no pueden cifrarse directamente: instantánea + copia + restauración.
- **CloudTrail + KMS**: Cada llamada a la API de KMS se registra en CloudTrail. Esta es una característica clave de cumplimiento normativo.
- **Claves de KMS multi-región**: Replican el material de clave en múltiples regiones para que el descifrado pueda ocurrir sin llamadas a la API entre regiones. El examen las usa para la recuperación de desastres multi-región con datos cifrados.
- **KMS vs CloudHSM**: KMS es multi-inquilino (administrado por AWS). CloudHSM es un módulo de seguridad de hardware dedicado que solo tú controlas. Señales del examen: "FIPS 140-2 Nivel 3", "HSM dedicado", "operaciones criptográficas gestionadas por el cliente" → CloudHSM.

## Ejercicios

**Ejercicio 1 — Recuerdo**

Explica el concepto de cifrado de sobre. ¿Por qué KMS cifra una pequeña clave de datos en lugar de cifrar directamente los datos de tu aplicación?

*(Pista: Piensa en qué ocurre si tienes 1 GB de datos para cifrar y cuáles serían las implicaciones de rendimiento de enviar 1 GB a un servicio KMS remoto.)*

**Ejercicio 2 — Práctica para el Examen**

*Escenario*: Una empresa de servicios financieros almacena datos sensibles de clientes en una base de datos de RDS MySQL. Un nuevo requisito de cumplimiento exige que:

1. Todos los datos deben estar cifrados en reposo
2. Todo el uso de claves de cifrado debe ser auditable
3. Las claves de cifrado deben ser controladas por el cliente (no administradas por AWS)
4. La contraseña de la base de datos debe rotarse automáticamente cada 90 días

La base de datos fue creada hace seis meses sin el cifrado habilitado. ¿Qué conjunto de acciones cumple MEJOR con los cuatro requisitos?

A) Habilitar el cifrado de RDS en la base de datos existente; crear una clave de KMS administrada por el cliente; configurar Secrets Manager con rotación de 90 días  
B) Crear una instantánea de la base de datos existente; copiar la instantánea con cifrado usando una clave de KMS administrada por el cliente; restaurar desde la instantánea cifrada; configurar Secrets Manager con rotación de 90 días  
C) Crear una nueva instancia de RDS cifrada con una clave administrada por AWS; migrar los datos de la instancia antigua; configurar Secrets Manager con rotación de 90 días  
D) Habilitar el cifrado en reposo de RDS en la base de datos existente usando una clave administrada por AWS; configurar Secrets Manager con rotación de 90 días

**Pista 1**: No puedes habilitar el cifrado en una instancia de RDS no cifrada existente directamente.

**Pista 2**: Las claves "controladas por el cliente" significa claves de KMS administradas por el cliente, no claves administradas por AWS.

**Pista 3**: El proceso de copia de instantánea es la ruta de migración estándar para RDS cifrado.

**Respuesta**: B

**Explicación**: El cifrado de RDS no puede habilitarse en una instancia existente. El enfoque estándar es: crear una instantánea de la instancia existente → copiar la instantánea con el cifrado habilitado usando una clave de KMS administrada por el cliente (cumple los requisitos 1, 2 y 3) → restaurar desde la instantánea cifrada. Las claves de KMS administradas por el cliente registran automáticamente todos los usos en CloudTrail (auditoría) y mantienen las claves de cifrado bajo tu control. Secrets Manager gestiona la rotación automática de la contraseña cada 90 días (cumple el requisito 4).

**¿Por qué no A?** No puedes habilitar el cifrado en una instancia de RDS no cifrada existente directamente.

**¿Por qué no C?** Las claves administradas por AWS no satisfacen el requisito de "controladas por el cliente" (requisito 3).

**¿Por qué no D?** Mismo problema que A (no se puede habilitar directamente) más que la clave administrada por AWS no satisface el requisito 3.

*Dominio SAA-C03: Diseño de Arquitecturas Seguras — Tarea 1.3*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus necesita almacenar los siguientes datos sensibles:

- Contraseña de base de datos para la instancia de RDS de producción
- Clave secreta de la API de Stripe (usada para el procesamiento de pagos)
- Una clave de cifrado simétrica para cifrar el historial de pedidos de clientes en DynamoDB
- Valores de configuración por restaurante (endpoints de API, indicadores de características: no sensibles)

¿Qué servicio o enfoque de AWS usarías para cada uno? ¿Qué estrategia de rotación aplicarías a cada uno?

*(No existe una única respuesta correcta. El objetivo es practicar la coincidencia de herramientas de seguridad con casos de uso.)*

## Escena Post-Créditos

Los secretos fueron migrados.

Contraseñas de bases de datos: Secrets Manager, rotando cada 30 días.

Claves de API: Secrets Manager, con una Lambda de rotación que llamaba a la API del proveedor de pagos para generar una nueva clave.

Datos de pedidos de clientes: cifrados con una clave de KMS administrada por el cliente.

Credenciales antiguas: desactivadas. Archivos de configuración antiguos: eliminados. Secretos antiguos de GitHub Actions: borrados.

"Ahora estamos listos para una auditoría", dijo Priya.

"Define listos para una auditoría", dijo Maya.

"Si un auditor de cumplimiento nos pidiera demostrar que no hay credenciales codificadas en nuestro código ni expuestas en nuestra infraestructura, podríamos mostrarles: cada secreto está en Secrets Manager, cada clave de cifrado está en KMS, cada acceso está registrado en CloudTrail."

"¿Cuándo fue la última vez que alguien revisó los registros de CloudTrail?"

Una pausa.

"Yo los reviso cada semana", dijo Priya.

"¿Y si apareciera algo inusual, cómo lo sabríamos?"

"Eso", dijo Priya cerrando su portátil, "es la próxima conversación."

En el próximo capítulo: las tres capas de defensa que se interponen entre Nimbus e internet.
