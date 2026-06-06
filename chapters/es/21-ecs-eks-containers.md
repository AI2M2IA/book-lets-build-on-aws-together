# Capítulo 21: Contenedores de Envío para el Código

Antes de 1956, cargar mercancía en un barco era una negociación especializada y de oficio. Cada barco tenía bodegas diferentes. Cada puerto tenía grúas diferentes. Cada transportista tenía sistemas diferentes para rastrear qué iba a dónde. Una caja de mercancías pasaba del camión al muelle, al barco, al muelle, al camión, a través de una cadena de personas que la manipulaban de maneras distintas. La mercancía se perdía. La mercancía se dañaba. Las mismas mercancías, enviadas dos veces, llegaban en condiciones diferentes porque la manipulación había sido diferente ambas veces.

La respuesta, cuando alguien finalmente la planteó con claridad, fue: estandarizar el contenedor. No resuelvas el problema en cada puerto. Resuélvelo una vez, a nivel del contenedor. Envía la caja, no solo el contenido.

El contenedor de transporte estandarizado no solo hizo el envío más rápido. Hizo el envío *predecible*. El contenido de un contenedor en Shanghái estaba exactamente en la misma condición cuando llegaba a Róterdam, porque el contenedor lo protegía de la variabilidad en cada punto de transferencia.

Ese es exactamente el mismo problema que tenía Leo. La API de Nimbus se estaba "cargando" de forma diferente en cada "puerto": staging se desplegaba de forma diferente a producción, la instancia uno se desplegaba de forma diferente a la instancia tres, y seis semanas de cambios no documentados habían hecho que la flota fuera impredecible.

El contenedor no haría a Leo un desarrollador más rápido. Haría que los despliegues fueran predecibles.

---

La migración a Lambda había reducido la factura de EC2 para los servicios más pequeños. Pero la API central era diferente: corría continuamente, transportaba todo el tráfico de pedidos y había estado acumulando historial de configuración durante ocho meses. Lambda resolvía la inactividad. Los contenedores resolverían la inconsistencia.

La API central no estaba inactiva; no podía moverse a Lambda. Pero tenía un problema diferente: las instancias de EC2 que la ejecutaban habían divergido entre sí.

---

Leo había aprendido a no decir "funciona en mi máquina" en voz alta. No era una defensa: era un diagnóstico. Y el diagnóstico esta vez era la instancia de EC2 de producción número tres, que había recibido un parche de biblioteca hacía seis semanas que nadie había documentado, que las otras dos instancias no habían recibido, y que ahora causaba un error que existía solo allí, en esa única instancia, invisible en cualquier otro lugar.

Había pasado tres horas la noche anterior rastreándolo.

"Cada vez que desplegamos", dijo a la mañana siguiente, "coordinamos entre múltiples instancias. Nueva versión, dependencias diferentes. Funciona en staging, se rompe en producción porque los entornos han divergido."

"Porque alguien actualizó un paquete en la instancia tres sin actualizar las otras", dijo Priya. Sin crueldad.

"Necesitaba una versión específica de—"

"Lo sé", dijo ella. "Y ahora la instancia tres tiene un historial diferente al de las instancias uno y dos. Eso es deriva de configuración. Es silenciosa hasta que deja de serlo."

"¿Cuál es la solución real?", preguntó Maya.

"Deja de tratar los servidores como cosas permanentes que configuras", dijo Priya. "Empieza a tratarlos como unidades desechables que reemplazas."

**¿Qué Es un Contenedor?**

"Piénsalo como un contenedor de transporte", dijo Leo, tomando un marcador. "Al contenedor no le importa en qué barco está. Al barco no le importa qué hay en el contenedor. Acordaron las dimensiones y el mecanismo de cierre. Todo lo demás está dentro de la caja."

Un **contenedor** es una unidad ligera y portable que empaqueta tu aplicación junto con todo lo que necesita para ejecutarse: el runtime (Python 3.11, Node.js 20, Java 17), las bibliotecas y dependencias, los archivos de configuración y el propio código de la aplicación.

A diferencia de una máquina virtual (que emula un computador completo, incluido el núcleo del sistema operativo), un contenedor comparte el núcleo del SO del host mientras mantiene todo lo demás aislado. Esto hace que los contenedores sean rápidos de arrancar (segundos, a veces milisegundos) y pequeños (megabytes, no gigabytes).

La tecnología de contenedores más popular es **Docker**. Una imagen Docker es el plano: una instantánea de la aplicación y su entorno. Un contenedor Docker es una instancia en ejecución de esa imagen.

La propiedad clave: la **inmutabilidad**. Una imagen construida hoy se ejecutará de forma idéntica en cualquier host que soporte Docker: un portátil, una instancia EC2, un servidor en un centro de datos diferente. El entorno está integrado. La deriva de configuración es imposible.

"Entonces, en lugar de preocuparnos por lo que está instalado en la instancia EC2", dijo Leo, "construimos una imagen que tiene todo. La imagen funciona igual en todas partes."

"Y si necesitas probarla localmente, ejecutas la misma imagen", añadió Priya. "Nada más de 'funciona en mi máquina'."

**Construir la Imagen Docker y Subirla a ECR**

Antes de que cualquier orquestador pudiera gestionar el contenedor, Leo tenía que construirlo y almacenarlo en algún lugar del que ECS pudiera extraerlo.

Escribió el Dockerfile:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

La línea clave: `FROM python:3.11-slim`. No Python 3.9. No Python 3.10. 3.11, la versión específica que el equipo había acordado, integrada en la imagen. Cada instancia que ejecutara esta imagen usaría exactamente Python 3.11. El comportamiento de redondeo del módulo decimal sería idéntico en todas partes.

Construyó la imagen localmente: `docker build -t nimbus-api:1.0.0 .`

La construcción tardó 4 minutos. Docker extrajo la imagen base, instaló las dependencias, copió el código de la aplicación y produjo una imagen etiquetada `nimbus-api:1.0.0`.

La ejecutó localmente: `docker run -p 8000:8000 nimbus-api:1.0.0`

La API arrancó. Mismo puerto, mismo comportamiento que el servidor de producción, porque el entorno era idéntico.

Luego la subió a ECR:

```bash
# Autenticar Docker en ECR
aws ecr get-login-password --region us-west-2 |   docker login --username AWS --password-stdin   123456789012.dkr.ecr.us-west-2.amazonaws.com

# Etiquetar la imagen para ECR
docker tag nimbus-api:1.0.0   123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0

# Subir
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0
```

La subida tardó 2 minutos. ECR almacenó la imagen, inmediatamente activó un escaneo de imagen e informó los resultados en 5 minutos.

**Amazon ECS: El Orquestador**

Ejecutar un contenedor es sencillo. Ejecutar docenas de contenedores en múltiples hosts, enrutar el tráfico entre ellos, reiniciar contenedores fallidos, desplegar nuevas versiones sin tiempo de inactividad: eso requiere un **orquestador**.

**Amazon ECS (Elastic Container Service)** es el servicio gestionado de orquestación de contenedores de AWS. Defines:

- **Definición de tarea**: Qué imagen de contenedor ejecutar, cuánta CPU y memoria, qué variables de entorno, qué puertos exponer
- **Servicio**: Cuántas copias de la tarea ejecutar, cómo gestionar los fallos y los despliegues
- **Clúster**: La infraestructura de cómputo subyacente

ECS se encarga del resto: colocar las tareas en la capacidad disponible, reiniciar las tareas fallidas, drenar las conexiones durante los despliegues, registrar las tareas saludables con el balanceador de carga.

Para Nimbus, la API pasó de instancias EC2 con despliegues gestionados manualmente a ECS. Cada nuevo despliegue enviaba una nueva imagen Docker a **Amazon ECR (Elastic Container Registry)**, el registro de contenedores gestionado de AWS, y ECS lo desplegaba en todas las tareas sin tiempo de inactividad.

**Fargate vs Tipo de Lanzamiento EC2**

ECS puede ejecutar contenedores en dos modos:

**Tipo de lanzamiento EC2**: Gestionas las instancias EC2 subyacentes. Eres responsable de parchear las instancias, dimensionarlas correctamente y asegurarte de que haya suficiente capacidad para tus contenedores. Más control, más responsabilidad.

**Fargate (cómputo sin servidor para contenedores)**: AWS gestiona la infraestructura subyacente por completo. Especificas CPU y memoria por tarea; Fargate aprovisiona la capacidad correcta automáticamente. Sin instancias EC2 que gestionar. Pagas por vCPU-segundo y GB-segundo de memoria.

Fargate es el modelo de "contenedores sin servidor": obtienes el aislamiento de entorno de los contenedores sin gestionar servidores. La contrapartida: menos control sobre la configuración de la instancia subyacente y un coste por unidad ligeramente mayor.

"¿Cuánto cuesta eso al mes?", preguntó Tom, abriendo la calculadora de precios. "Fargate frente al tipo de lanzamiento EC2: quiero ver los números reales."

La estimación instintiva de Leo —la que todos llevan consigo— era que Fargate costaría más. Conveniencia sin servidor, precio premium. Supuso quizás un veinte o treinta por ciento por encima de EC2.

"Saca los números reales", dijo Tom, porque eso era Tom.

El servicio de la API de Nimbus ejecutaba 3 tareas, cada una necesitando 0,5 vCPU y 1GB de memoria, 24/7:

**Fargate**: $0,04048/vCPU-hora × 0,5 × 3 × 720 horas = $43,72/mes por CPU. $0,004445/GB-hora × 1 × 3 × 720 = $9,60/mes por memoria. Total: $53,32/mes.

**Tipo de lanzamiento EC2** (3 × t3.medium a $0,0416/hora): $0,0416 × 3 × 720 = $89,86/mes.

"Espera", dijo Tom. "¿Fargate es más barato?"

"A este tamaño, sí", dijo Leo. "Fargate cobra exactamente por lo que asignas. Las instancias EC2 tienen sobrecarga: el SO y el agente de ECS consumen algo de CPU y memoria antes de que tus contenedores siquiera arranquen. Una t3.medium da 2 vCPU y 4GB, pero estás usando 0,5 vCPU y 1GB por contenedor. El resto se desperdicia."

"Pero el tipo de lanzamiento EC2 te permite empaquetar múltiples tareas en una instancia."

"Sí. A escalas más grandes, con un bin-packing cuidadoso, el tipo de lanzamiento EC2 se vuelve más barato. A nuestra escala —tres tareas— gana Fargate."

Tom anotó esto.

Para Nimbus: Fargate para el servicio de API. No querían gestionar instancias EC2 para contenedores.

Si contenerizas con Fargate, eliminas toda la sobrecarga de gestión de EC2, pero renuncias a la capacidad de personalizar los tipos de instancia, lo que importa para las cargas de trabajo con GPU o redes especializadas. Si eliges ECS por la simplicidad nativa de AWS, ganas una integración estrecha con IAM y ALB, pero quedas excluido del ecosistema de Kubernetes, lo que requiere rearquitectura si más tarde necesitas portabilidad multi-nube.

**Amazon EKS: Cuando Necesitas Kubernetes**

**Kubernetes** es un sistema de orquestación de contenedores de código abierto, esencialmente el estándar de la industria para gestionar contenedores a escala. Es potente, extensible y complejo.

**Amazon EKS (Elastic Kubernetes Service)** es el servicio gestionado de Kubernetes de AWS. Ejecuta el plano de control de Kubernetes (la capa de gestión) por ti, mientras gestionas los nodos de trabajo (o usas Fargate para ellos también).

Quizás te preguntes: si Kubernetes es el estándar de la industria y cada oferta de trabajo lo menciona, ¿por qué no usarlo simplemente? Porque "estándar de la industria" describe lo que usan las grandes empresas con equipos de plataforma dedicados. Para un equipo de seis personas construyendo una app de pedidos de comida, Kubernetes añade complejidad operativa sin beneficio práctico en este momento. La complejidad es real; el beneficio es teórico a esta escala.

Kubernetes proporciona valor a un nivel de complejidad que la mayoría de los equipos no necesitan: definiciones de recursos personalizados para construir plataformas internas, restricciones de programación avanzadas, presupuestos de interrupción de pods para un control de despliegue de grano fino e integración de service mesh para la gestión de tráfico entre cientos de microservicios. Estas son capacidades genuinas. También son capacidades que una startup del tamaño de Nimbus nunca ejercerá.

El principio de ingeniería aquí a veces se llama YAGNI: You Aren't Gonna Need It (No lo vas a necesitar). ECS le da a Nimbus todo lo que necesita actualmente. EKS le da más de lo que necesita, además de una curva de aprendizaje significativa y sobrecarga operativa. "Será útil más adelante" no es una buena razón para añadir complejidad ahora.

¿Cuándo deberías usar EKS frente a ECS?

**Usa ECS** si:

- Estás principalmente en AWS y quieres la experiencia más simple y nativa de AWS
- Tu equipo no tiene experiencia previa con Kubernetes
- Quieres menos sobrecarga operativa

**Usa EKS** si:

- Necesitas características específicas de Kubernetes (Custom Resource Definitions, charts de Helm, el ecosistema de Kubernetes)
- Tu equipo ya conoce Kubernetes
- Estás ejecutando un entorno híbrido (parte en las instalaciones, parte en AWS) y quieres una capa de orquestación consistente
- Tu carga de trabajo tiene requisitos que coinciden con la extensibilidad de Kubernetes

**Redes de Contenedores: IPs Efímeras y Descubrimiento de Servicios**

Algo que toma desprevenidos a los equipos al pasar a contenedores: la dirección IP de un contenedor cambia cada vez que se reinicia.

En el mundo de EC2, las instancias tenían IPs privadas relativamente estables. Podías (aunque no deberías) codificarlas de forma fija en los archivos de configuración. Los servicios se conocían entre sí por IP.

En el mundo de los contenedores, cada tarea en ECS obtiene una IP de la subred de la VPC cuando arranca. Cuando se detiene y arranca una nueva tarea (como parte de un despliegue o un reinicio), esa nueva tarea obtiene una IP diferente.

"¿Qué pasa cuando un servicio está codificado de forma fija para llamar a `10.0.1.45` y ese contenedor se reemplaza por `10.0.1.82`?", preguntó Priya. "El servicio que llama empieza a impactar en nada."

Por eso el descubrimiento de servicios importa en los entornos de contenedores. ECS + Application Load Balancer maneja esto automáticamente: el nombre DNS del ALB es estable; ECS registra las tareas saludables con el grupo de destino; el ALB enruta hacia las tareas que estén saludables en ese momento. El servicio que llama habla con el nombre DNS del ALB, no con las IPs de los contenedores individuales.

Para la comunicación interna de servicio a servicio (no de cara al usuario), **AWS Cloud Map** proporciona descubrimiento de servicios: cada servicio de ECS se registra con Cloud Map, que proporciona un nombre DNS estable. El servicio de pedidos llama a `http://notification.nimbus.local:8080`, y Cloud Map lo resuelve a cualquiera de las tareas del servicio de notificaciones que estén saludables en ese momento.

"Entonces, ¿los contenedores se comunican entre sí a través de nombres DNS, no de IPs?", confirmó Leo.

"Correcto. La IP es efímera. El nombre DNS es el contrato."

**Inyección de Secretos: Sin Secretos en Variables de Entorno**

El despliegue original de EC2 tenía un problema que Priya había señalado durante meses: los secretos (contraseña de la base de datos, claves de API, credenciales de SES) se almacenaban en variables de entorno en la instancia EC2, establecidas mediante un script de despliegue.

Las variables de entorno son accesibles para cualquier proceso que se ejecute en la instancia. Aparecen en las herramientas de depuración, en algunos reportes de fallos y en las listas de procesos. También son visibles en CloudWatch si las registras (lo que algunas herramientas de desarrollo hacen de forma predeterminada).

Los contenedores no resuelven esto automáticamente: todavía podrías pasar secretos como variables de entorno en la definición de tarea de ECS. Y las definiciones de tarea de ECS se almacenan en la consola de AWS, visibles para cualquiera con acceso a ECS.

El patrón correcto: **integración de AWS Secrets Manager + definición de tarea de ECS**.

En lugar de almacenar la contraseña de la base de datos en la definición de tarea:

```json
"secrets": [
  {
    "name": "DB_PASSWORD",
    "valueFrom": "arn:aws:secretsmanager:us-west-2:123456789012:secret:nimbus/prod/db-password"
  }
]
```

ECS recupera el secreto de Secrets Manager en el momento del lanzamiento de la tarea y lo inyecta en el contenedor como una variable de entorno. El valor del secreto nunca se almacena en la definición de tarea, solo el ARN del secreto de Secrets Manager. El contenedor recibe el valor en tiempo de ejecución. Secrets Manager puede rotar el valor sin cambiar la definición de tarea.

"¿Y si alguien lee la definición de tarea?", preguntó Priya. "Verían el ARN de Secrets Manager, pero no el valor."

"Y sin los permisos de IAM correctos", confirmó Leo, "tampoco pueden recuperar el valor de Secrets Manager."

"Ese es el diseño", dijo Priya. "El rol de ejecución de la tarea tiene permiso para leer ese secreto específico. Nada más. Comprometer la definición de tarea te da un ARN, no una contraseña."

"¿Cuál deberíamos usar?", preguntó Maya. "¿Y por qué no Kubernetes? Está en cada descripción de trabajo. En cada charla de conferencia."

"ECS", dijo Priya de inmediato. "No tenemos experiencia con Kubernetes. ECS hace todo lo que necesitamos. Agregar Kubernetes ahora sería añadir complejidad operativa sin ningún beneficio práctico."

Soo-Jin, que había ejecutado clústeres de Kubernetes en su última empresa, asintió. "He llevado ese busca. No lo quieres hasta que lo necesitas."

"Siempre podemos migrar a EKS más adelante si superamos ECS", añadió Leo.

Esta es una respuesta correcta de ingeniería senior: elige la herramienta más simple que se adapte a tus necesidades actuales.

**ECR: Asegurar Tus Imágenes**

"¿Y qué pasa si alguien intenta entrar por la fuerza a través de una imagen base vulnerable?", preguntó Priya. "¿Alguien toma una imagen antigua con un CVE conocido y la usa para obtener un punto de apoyo en el contenedor de la aplicación?"

Era la pregunta correcta que hacer antes de desplegar cualquier contenedor en producción.

**Amazon ECR (Elastic Container Registry)** almacena tus imágenes Docker y puede escanearlas en busca de vulnerabilidades conocidas antes del despliegue. El escaneo de imágenes de ECR comprueba la imagen contra una base de datos de CVEs conocidos (Common Vulnerabilities and Exposures) y marca los problemas por severidad.

La política que Priya escribió: ninguna imagen con un CVE de severidad CRITICAL se desplegaría en producción. El pipeline de CI/CD comprobaría los resultados del escaneo antes de actualizar el servicio de ECS. Si se encontraba una vulnerabilidad crítica, el pipeline fallaría y alertaría al equipo.

"Eso no es paranoia", dijo Priya. "Es simplemente tener una comprobación antes de desplegar."

**Cómo los Contenedores Cambian los Despliegues**

Antes de los contenedores, desplegar una nueva versión de la API de Nimbus requería:

1. Acceder por SSH a cada instancia EC2
2. Obtener el código más reciente de Git
3. Instalar/actualizar dependencias
4. Reiniciar el proceso de la aplicación
5. Verificar el estado de salud
6. Pasar a la siguiente instancia

Esto era propenso a errores y lento. Requería coordinación. Si el paso 3 fallaba en la instancia 4, tenías un despliegue mixto con algunas instancias ejecutando la versión antigua y otras fallando al ejecutar la nueva.

Con ECS y contenedores:

1. Construir una nueva imagen Docker (automatizado en el pipeline de CI/CD)
2. Enviar a ECR
3. Actualizar el servicio de ECS para usar la nueva versión de la imagen

ECS gestiona el despliegue progresivo: inicia nuevas tareas con la nueva imagen, espera a que estén saludables y luego detiene las tareas antiguas. Despliegue sin tiempo de inactividad, automatizado.

Si la nueva versión falla las comprobaciones de estado, ECS detiene el despliegue y la versión antigua continúa sirviendo tráfico.

**La Configuración Mínima de Despliegue: Verificaciones de Salud**

Toda la seguridad de los despliegues de contenedores depende de que las verificaciones de salud realmente funcionen.

ECS usa dos tipos de verificaciones de salud:

**Verificación de salud a nivel de contenedor**: Definida en el Dockerfile o la definición de tarea. Se ejecuta dentro del contenedor para verificar que la aplicación está respondiendo.

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3   CMD curl -f http://localhost:8000/health || exit 1
```

**Verificación de salud del grupo de destino del ALB**: El balanceador de carga envía periódicamente solicitudes HTTP a un endpoint de salud. Las tareas que fallan la verificación de salud se eliminan del grupo de destino.

Si ninguna de las verificaciones de salud está configurada correctamente, ECS considera saludable a cada tarea, y desplegará una imagen rota sin detenerse. Este es el error de despliegue de contenedores más común.

"¿Podría el endpoint de verificación de salud filtrar información interna?", preguntó Priya.

El endpoint de verificación de salud en `/health` devolvía solo: `{"status": "ok"}`. Sin números de versión, sin estados de dependencias, sin configuración interna. Cualquier información en la respuesta de salud podría ser útil para alguien que mapeara la aplicación. Mantén los endpoints de salud mínimos.

Para el estado de salud interno detallado (conectividad de la base de datos, comprobaciones de dependencias), usa un endpoint `/health/detail` autenticado separado, accesible solo desde dentro de la VPC.

**Registro Estructurado: La Única Ventana a un Contenedor en Ejecución**

En EC2, algo salía mal y hacías SSH. Seguías el archivo de registro con tail. Mirabas la tabla de procesos. Comprobabas el uso del disco. Hurgabas.

En un contenedor, no hay SSH. El contenedor es efímero: puede estar ejecutándose en cualquier host del clúster, y ECS lo reemplazará sin previo aviso si falla las verificaciones de salud. Para cuando pienses en hacer SSH, el contenedor que querías examinar puede que ya no exista.

Los registros no son una conveniencia de depuración en los entornos contenerizados. Son la única evidencia de que algo ocurrió.

"¿Y qué pasa si un contenedor falla silenciosamente y no tenemos registros?", preguntó Priya durante la revisión de la arquitectura de contenedores. "Podríamos tener una tarea que sale con código 1 y nunca saber la causa si los registros no se capturaron antes de que terminara."

Esto no es hipotético. Ocurre en los primeros despliegues de contenedores, de forma consistente.

El patrón correcto: configurar cada contenedor para que envíe registros estructurados a **Amazon CloudWatch Logs** usando el controlador de registro `awslogs`. ECS maneja el envío automáticamente: sin agente de registro que instalar, sin contenedor sidecar necesario.

En la definición de tarea:

```json
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/nimbus-api",
    "awslogs-region": "us-west-2",
    "awslogs-stream-prefix": "ecs"
  }
}
```

Cada línea escrita en stdout o stderr dentro del contenedor se captura y se envía al grupo de registros `/ecs/nimbus-api`, organizada por ID de tarea. ECS crea un nuevo flujo de registro para cada tarea, de modo que puedes encontrar los registros del contenedor específico que falló, incluso después de que haya sido reemplazado.

El rol de ejecución de la tarea necesita permiso para escribir en CloudWatch Logs. Sin él, el controlador de registro falla silenciosamente y toda la salida de registro se pierde.

**Registros estructurados vs texto plano**: Los registros de texto plano ("Pedido 7741 realizado") requieren grep. Los registros JSON estructurados (`{"event": "order_placed", "order_id": "7741", "restaurant_id": "47", "amount": 3200}`) pueden consultarse con CloudWatch Logs Insights usando una sintaxis que se parece a SQL:

```
fields @timestamp, event, order_id, restaurant_id
| filter event = "order_placed"
| stats count(*) by restaurant_id
| sort count desc
| limit 10
```

Esa consulta se ejecuta directamente contra el grupo de registros. Sin base de datos. Sin pipeline de datos. Sin trabajo de ETL. La respuesta está ahí en segundos.

Esto no reemplaza el data lake de análisis que construiremos en el capítulo 26. Responde preguntas operativas —"¿cuántos pedidos del restaurante 47 en los últimos 30 minutos?"— en medio de un incidente, cuando no tienes tiempo de ejecutar una consulta de Athena.

**CloudWatch Container Insights**

**Container Insights** es una función de CloudWatch que recopila y agrega métricas a nivel de contenedor —CPU, memoria, I/O de red, I/O de almacenamiento— por clúster, servicio y tarea de ECS. En lugar de métricas a nivel de EC2 (¿cómo está el host?), ves métricas a nivel de tarea (¿cómo está este servicio específico de ECS?).

Actívalo con una sola configuración en el clúster de ECS:

```bash
aws ecs update-cluster-settings \
  --cluster nimbus-production \
  --settings name=containerInsights,value=enabled
```

Después de activarlo:

- Ves un panel por servicio: recuento de tareas, utilización de CPU, utilización de memoria
- Puedes alarmar sobre la CPU a nivel de tarea (en lugar de la CPU del host de EC2, que es una señal mucho más burda)
- Puedes correlacionar los picos de memoria con los eventos de registro: la memoria de la tarea subió al 95% a las 14:22; los registros muestran un pico de solicitudes entrantes de la importación de menú del restaurante 47 exactamente a las 14:21

"¿Cuánto cuesta eso al mes?", preguntó Tom.

Container Insights cobra por las métricas personalizadas y el almacenamiento de registros que genera. A la escala de Nimbus (tres servicios, 3-6 tareas cada uno), esto era aproximadamente $12/mes, un intercambio razonable por la visibilidad operativa a nivel de tarea.

Leo lo tenía activado en el mismo día.

La primera vez que una tarea falló una verificación de salud y fue reemplazada por ECS, el panel de Container Insights capturó el evento automáticamente: ID de tarea, hora de inicio, hora de fallo, código de salida. El flujo de registro de CloudWatch de esa tarea preservó las últimas 40 líneas de salida antes de la terminación, que mostraron una excepción no capturada provocada por un JSON de menú malformado de un nuevo socio restaurante.

Sin Container Insights y registro estructurado: un misterioso pico en las tasas de error, la investigación requería hacer SSH a un host que ya no ejecuta la tarea fallida, 45 minutos de conjeturas.

Con ellos: un enlace al flujo de registro en el panel de CloudWatch, la excepción exacta, el ID del restaurante, el campo infractor, en menos de cinco minutos.

"Sin SSH", dijo Leo, revisando el post-mortem. "Sin tiempo de inactividad para investigar. Los registros hicieron el trabajo."

"Los registros solo hacen el trabajo", dijo Priya, "si los configuraste para que se capturaran."


**Cuándo los Contenedores Son la Elección Equivocada**

"Espera, pero *¿por qué* no contenerizaríamos todo?", preguntó Maya. "Me acabas de convencer de que los contenedores resuelven todos los problemas de deriva de configuración. ¿Por qué no ejecutar cada servicio como un contenedor?"

Era la misma pregunta que había hecho sobre Lambda. La respuesta era similar.

Los contenedores añaden requisitos operativos: necesitas un registro de contenedores (ECR), un pipeline de CI/CD que construya y suba imágenes, un orquestador (ECS), monitoreo configurado para la visibilidad a nivel de tarea en lugar de a nivel de instancia, y un equipo que entienda Docker y el versionado de imágenes.

Para un servicio que ya funciona bien en EC2, estable, y que no sufre de deriva de configuración, el costo de contenerizarlo puede exceder el beneficio.

Casos específicos donde los contenedores son la elección equivocada:

**Servicios con estado que no están construidos para la movilidad de contenedores**: Las bases de datos en contenedores requieren una gestión cuidadosa de volúmenes persistentes. La mayoría de los equipos que ejecutan bases de datos en contenedores eventualmente las mueven de vuelta a servicios gestionados (RDS, ElastiCache) después de encontrar esta complejidad.

**Servicios con requisitos de hardware especializado**: Las cargas de trabajo con GPU, configuraciones de interfaz de red específicas o procesamiento basado en FPGA requieren instancias EC2 con hardware específico. Los contenedores no cambian esto: aún usarías el tipo de lanzamiento EC2, solo que con contenedores encima, y la abstracción del contenedor añade complejidad sin beneficio.

**Scripts y trabajos muy simples**: Un script de Python de 40 líneas que se ejecuta una vez por semana y no tiene problemas de deriva de dependencias. Agregar Docker, ECR, definiciones de tarea de ECS y un pipeline de CI/CD para esto es desproporcionado. Lambda es más simple. Un simple trabajo cron de EC2 podría ser aún más simple.

"El principio", dijo Leo, "es el mismo de siempre: ajusta la herramienta al problema. Los contenedores resuelven la deriva de configuración y la consistencia de despliegue. Si no tienes ese problema, no necesitas contenedores."

## AWS Batch: Contenedores para Trabajos a Gran Escala

ECS y EKS están diseñados para servicios de larga duración: aplicaciones que se ejecutan continuamente, aceptan solicitudes y escalan con el tráfico. Pero algunas cargas de trabajo son diferentes: se ejecutan durante una duración fija, procesan un conjunto de datos definido, luego se detienen. Generar facturas de fin de mes para cientos de restaurantes. Ejecutar un trabajo de entrenamiento de aprendizaje automático. Procesar una exportación de análisis nocturna.

Para estas cargas de trabajo, no quieres un servicio: quieres un trabajo.

**AWS Batch** es un servicio totalmente gestionado que ejecuta trabajos de cómputo por lotes a cualquier escala. Defines tu trabajo como un contenedor Docker (el mismo formato de contenedor que usa ECS), y Batch maneja el resto: aprovisionar cómputo de EC2 o Fargate, programar los trabajos en colas, escalar la capacidad hacia arriba cuando llegan los trabajos y de vuelta a cero cuando terminan.

Conceptos clave:

- **Definición de trabajo:** el contenedor Docker, los requisitos de recursos (vCPU, memoria) y el comando a ejecutar
- **Cola de trabajos:** donde esperan los trabajos enviados antes de ejecutarse; cada cola está asociada a uno o más entornos de cómputo
- **Entorno de cómputo:** la capacidad subyacente de EC2 o Fargate. Puede usar Spot Instances para hasta un 90% de ahorro de costos; Batch maneja las interrupciones y los reintentos automáticamente

"Espera, pero *¿por qué* usaríamos Batch en lugar de simplemente ejecutar una tarea de ECS?", preguntó Maya.

"Porque un servicio de ECS está siempre encendido", dijo Leo. "Espera solicitudes. Un trabajo de Batch se ejecuta, termina, y Batch reduce el cómputo de vuelta a cero. No pagas nada entre ejecuciones."

Tom levantó la vista de la página de precios. "¿Y las Spot Instances?"

"Batch puede ejecutarse en Spot. Si una Spot Instance se reclama a mitad del trabajo, Batch reintenta automáticamente. Para un trabajo de facturación de 45 minutos, eso está bien."

**vs. ECS/EKS:** ECS/EKS ejecutan servicios, siempre encendidos, impulsados por solicitudes. Batch ejecuta trabajos, de duración finita, impulsados por datos, escalan a cero cuando están inactivos.

**vs. Lambda:** Lambda tiene un timeout de 15 minutos. Los trabajos de Batch pueden ejecutarse durante horas o días.

Contexto de Nimbus: el trabajo de generación de facturas nocturno tarda 45 minutos para cientos de socios restaurantes. Lambda agota el tiempo a los 15 minutos. Un servicio de ECS siempre encendido desperdicia dinero 23 horas al día. Batch ejecuta el trabajo en Spot Instances, termina en 38 minutos, cuesta $1,20 y se apaga.

"Eso es más barato que el café que compré mientras esperaba a que el viejo script terminara", dijo Leo.

"Y sin EC2 que gestionar", añadió Priya. "Batch lo aprovisiona, lo ejecuta, lo termina."

## Fortalezas y Limitaciones

**Contenedores**:

- Eliminan la inconsistencia del entorno ("funciona en mi máquina")
- Permiten despliegues rápidos y fiables
- Inmutables: la misma imagen se ejecuta de forma idéntica en todas partes
- Eficientes: más ligeros que las VM, arranque más rápido

**ECS**:

- Más simple que Kubernetes para cargas de trabajo centradas en AWS
- Integración estrecha con AWS (IAM, ALB, CloudWatch, Secrets Manager)
- La opción Fargate elimina por completo la gestión de EC2

**EKS**:

- Compatibilidad total con Kubernetes: usa todo el ecosistema
- Mejor para entornos híbridos o equipos con experiencia en Kubernetes
- Más complejo de configurar y operar que ECS

**Dónde se complica**:

- Las imágenes de contenedores deben construirse y versionarse: requiere un pipeline de CI/CD
- La depuración de contenedores requiere herramientas diferentes a la depuración de procesos tradicionales
- Los contenedores con estado (bases de datos en contenedores) requieren una configuración cuidadosa del almacenamiento persistente
- La red entre contenedores (comunicación entre servicios) requiere entender los conceptos de red de contenedores

## Resumen

Lambda hizo que el cómputo inactivo fuera gratis. Los contenedores hicieron que el despliegue fuera determinista. Juntos, resolvieron dos de las causas más comunes de dolor operativo para los equipos de ingeniería en crecimiento.

- Los **contenedores** empaquetan el código de la aplicación, el runtime y las dependencias juntos: se ejecutan de forma idéntica en cualquier lugar.
- **Docker** es la tecnología de contenedores estándar. Las imágenes son planos; los contenedores son instancias en ejecución.
- **ECR (Elastic Container Registry)** es el registro de Docker gestionado de AWS: almacena, versiona y escanea tus imágenes aquí. Habilita el escaneo de imágenes para detectar CVEs antes del despliegue.
- **ECS (Elastic Container Service)** orquesta los contenedores. Defines tareas y servicios; ECS gestiona la ubicación y el ciclo de vida.
- **Fargate** es el cómputo sin servidor para contenedores: sin instancias EC2 que gestionar. A menudo más barato que el tipo de lanzamiento EC2 a pequeñas escalas debido a la eliminación de la sobrecarga de EC2. A escalas más grandes con un bin-packing cuidadoso de tareas, el tipo de lanzamiento EC2 puede volverse más rentable.
- **EKS (Elastic Kubernetes Service)** es Kubernetes gestionado: para equipos que necesitan las características de Kubernetes o compatibilidad.
- **Integración con Secrets Manager**: inyecta secretos en los contenedores en el momento del lanzamiento a través de la definición de tarea; no almacenes los valores de los secretos en variables de entorno o definiciones de tarea directamente.
- **Descubrimiento de servicios**: las IPs de los contenedores son efímeras. Usa nombres DNS del ALB o Cloud Map para el direccionamiento estable de servicios.
- Elige ECS por su simplicidad en AWS; elige EKS para compatibilidad con el ecosistema Kubernetes.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas Resilientes (Dominio 2, Tarea 2.1)*

- **Señales ECS vs EKS**: Los escenarios del examen que mencionan "Kubernetes," "Helm," "experiencia existente en Kubernetes" o "orquestación de contenedores multi-nube" → EKS. Todo lo demás → ECS.
- **Fargate vs tipo de lanzamiento EC2**: "No quiero gestionar instancias EC2 para contenedores," "contenedores sin servidor," "sin gestión de infraestructura" → Fargate. "Necesito tipos de instancias específicos," "cargas de trabajo con GPU," "control detallado de la instancia" → tipo de lanzamiento EC2.
- **Rol de tarea vs. rol de ejecución de tarea** — un discriminador real del examen. El **rol de ejecución de tarea** lo usa el *agente* de ECS en nombre de la tarea, antes y alrededor de tu código: extraer la imagen de ECR, obtener secretos de Secrets Manager, escribir registros en CloudWatch. El **rol de tarea** es lo que usa *el código de tu aplicación dentro del contenedor* para llamar a los servicios de AWS: leer de S3, escribir en DynamoDB, como los roles de instancia EC2, pero por tarea, de modo que cada tarea puede tener permisos diferentes. "El contenedor necesita leer de S3" → **rol de tarea** (adjunto en la definición de tarea). "La tarea falla al extraer su imagen / no puede obtener su secreto" → al **rol de ejecución** le faltan permisos.
- **Fargate Spot**: ejecuta contenedores tolerantes a fallos en capacidad sobrante por hasta ~70% de descuento, con una advertencia de interrupción de dos minutos, el equivalente de Fargate al EC2 Spot, configurado a través de proveedores de capacidad. Disparador del examen: "ejecutar contenedores tolerantes a interrupciones al menor costo sin gestionar instancias" → Fargate Spot.
- **Análisis de imágenes ECR**: ECR puede analizar imágenes de contenedores en busca de vulnerabilidades conocidas (CVE). Señal del examen: "analizar contenedores en busca de vulnerabilidades de seguridad" → análisis de imágenes ECR.
- **Despliegues azul/verde**: ECS soporta despliegues azul/verde mediante integración con CodeDeploy. Despliegue sin tiempo de inactividad con reversión automática. Patrón del examen: "desplegar sin tiempo de inactividad con reversión automática" → ECS + CodeDeploy azul/verde.
- **Integración con Secrets Manager**: Señal del examen: "inyectar secretos en los contenedores sin almacenar los valores en las definiciones de tarea" → usa el campo `secrets` en la definición de tarea referenciando un ARN de Secrets Manager. El rol de ejecución de la tarea necesita el permiso `secretsmanager:GetSecretValue`.
- **Autoescalado del servicio ECS**: Escala el número de tareas según CPU, memoria o métricas personalizadas de CloudWatch. Trabaja con ALB para enrutar el tráfico al número correcto de tareas en ejecución.
- **AWS Batch:** Cómputo por lotes gestionado para contenedores Docker. Cola de trabajos → entorno de cómputo (EC2 o Fargate, admite Spot). Úsalo cuando: el timeout de Lambda es demasiado corto, un servicio de ECS es un desperdicio para trabajos finitos. Disparador del examen: "procesamiento por lotes a gran escala" o "trabajo que se ejecuta durante horas" → AWS Batch.

## Ejercicios

**Ejercicio 1 — Recordatorio**

Explica la diferencia entre una imagen Docker y un contenedor Docker. Explica la diferencia entre ECS y ECR.

*(Pista: La imagen es al contenedor lo que una receta es a un plato cocinado. ECR almacena imágenes; ECS las ejecuta.)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: Una empresa tiene una aplicación de microservicios que actualmente se ejecuta en instancias EC2 gestionadas manualmente. El equipo tiene problemas con despliegues inconsistentes: diferentes instancias EC2 tienen diferentes versiones de bibliotecas, lo que causa errores difíciles de reproducir. Quieren estandarizar los despliegues minimizando la sobrecarga operativa de gestionar los servidores subyacentes. El equipo no tiene experiencia con Kubernetes.

¿Qué solución cumple MEJOR con estos requisitos?

A) Contenerizar la aplicación con Docker; usar Amazon ECS con el tipo de lanzamiento Fargate  
B) Desplegar en EC2 con AWS Systems Manager Patch Manager para mantener las instancias consistentes  
C) Contenerizar la aplicación con Docker; usar Amazon EKS con grupos de nodos autogestionados  
D) Usar AWS Elastic Beanstalk para gestionar despliegues y la configuración de instancias automáticamente

**Pista 1**: Los contenedores resuelven el problema del "entorno inconsistente" directamente. ¿Qué opciones usan contenedores?

**Pista 2**: "Minimizar la sobrecarga operativa de gestionar servidores" → Fargate (sin gestión de EC2) frente a nodos autogestionados (todavía gestionas EC2).

**Pista 3**: "Sin experiencia en Kubernetes" → EKS es más complejidad operativa que ECS.

**Respuesta**: A

**Explicación**: Contenerizar con Docker garantiza que cada despliegue use la misma imagen con las mismas dependencias, eliminando la deriva de configuración. ECS con Fargate significa que no hay instancias EC2 que gestionar. El equipo se centra en el código de la aplicación y las definiciones de contenedores, no en el mantenimiento de servidores. ECS (no EKS) es apropiado para equipos sin experiencia en Kubernetes.

**¿Por qué no B?** Patch Manager mantiene las instancias EC2 actualizadas, pero no resuelve la inconsistencia de versiones de bibliotecas entre aplicaciones. El problema fundamental (diferentes entornos de código en diferentes instancias) persiste.

**¿Por qué no C?** EKS con grupos de nodos autogestionados requiere gestionar instancias EC2 *y* aprender Kubernetes. Ninguno de los dos se alinea con los requisitos.

**¿Por qué no D?** Elastic Beanstalk gestiona el despliegue de aplicaciones en EC2, pero no resuelve la inconsistencia fundamental del entorno a menos que se usen contenedores. Beanstalk no usa imágenes Docker por defecto (aunque puede configurarse para hacerlo).

*Dominio SAA-C03: Diseño de Arquitecturas Resilientes — Tarea 2.1*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus está dividiendo la API monolítica en tres microservicios: el servicio de pedidos, el servicio de menú y el servicio de notificaciones. Cada servicio tiene diferentes requisitos de escalado (el servicio de pedidos escala con el tráfico; el servicio de menú es principalmente de solo lectura y estable; el servicio de notificaciones tiene ráfagas puntuales).

Diseña la arquitectura ECS para estos tres servicios. ¿Cómo gestionarías la comunicación entre servicios? ¿Usarías un clúster ECS o tres? ¿Cómo configurarías el Autoescalado de forma diferente para cada servicio?

Considera: el servicio de menú es de lectura intensiva y podría servir datos obsoletos durante 60 segundos, ¿agregarías caché delante de él? El servicio de notificaciones escala fuertemente en ráfagas los viernes por la noche, ¿establecerías la capacidad mínima de Fargate en 1 y la máxima en 20? ¿Qué pasa con las notificaciones en vuelo durante un evento de reducción de escala?

*(No hay una única respuesta correcta. El objetivo es practicar la arquitectura de microservicios en ECS.)*

## Escena Post-Créditos

El primer despliegue de contenedores fue impecable.

Nueva versión de la API: cero tiempo de inactividad. ECS lo desplegó, las comprobaciones de estado pasaron, las tareas antiguas drenaron, las nuevas tareas tomaron el relevo. Leo observó el estado de las tareas en la consola con algo parecido a la incredulidad.

"Simplemente funcionó", dijo.

"La semana pasada dijiste lo mismo del despliegue manual por SSH antes de que fallara en la instancia tres", dijo Priya.

"Ya lo desplegué... ah." Leo hizo una pausa. "Desplegué sin etiquetar la versión de la imagen. Déjame arreglar eso."

"Ese es el punto", dijo Priya. "El versionado de imágenes es cómo rastreas lo que está en ejecución."

"¿Cómo sabes qué versión está en producción ahora mismo?", preguntó Maya.

Leo abrió la consola de ECS. Bajo la tarea en ejecución, la imagen estaba listada: `123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.3`. Versión 1.0.3. Construida a las 14:22 UTC. Desplegada a las 14:31 UTC.

"En la antigua configuración de EC2", dijo Leo, "habría tenido que hacer SSH a una instancia y ejecutar `pip show` para ver qué versión de cada dependencia estaba instalada. Y podría haber sido diferente en las otras instancias."

"¿Y ahora?"

"La etiqueta en la imagen me dice exactamente qué está en ejecución. El historial de escaneos de ECR me dice si fue escaneada. El historial de despliegues de ECS me dice cuándo fue desplegada y cuál era la versión anterior."

"Sin SSH. Sin tiempo de inactividad. Sin 'espera a que se reinicie'."

"La imagen es el artefacto de despliegue", dijo Priya. "El entorno es inmutable. El proceso de despliegue es declarativo. Así es como debería enviarse el software."

Leo se quedó mirando la consola otro momento.

"Pasé tres años coordinando despliegues de EC2", dijo. "Coordinando scripts SSH. Escribiendo manuales de despliegue."

"Estabas resolviendo un problema", dijo Priya, "que los contenedores resuelven por diseño."

No dijo nada después de eso. Pero a la mañana siguiente, empezó a escribir documentación sobre el proceso de construcción de contenedores, para que nadie más tuviera que pasar tres años descubriéndolo.

El bug de la instancia tres, las seis semanas de deriva no documentada y los problemas como ese que aún no habían detectado: todo tenía una única causa raíz. No un actor malicioso. No un fallo de hardware. Solo un servidor que había sido tratado como una instalación permanente en lugar de una unidad desechable.

El contenedor era la respuesta a eso. No porque fuera nuevo e interesante. Porque hacía que la pregunta fuera imposible de plantear.

En el siguiente capítulo: el diagrama de flujo que se ejecuta solo, y recuerda dónde se detuvo.
