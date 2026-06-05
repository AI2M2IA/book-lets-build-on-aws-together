# Capítulo 21: Contenedores de Envío para el Código

"Funciona en mi máquina."

Leo había aprendido a no decir esto en voz alta. No era una defensa, era un diagnóstico. Y el diagnóstico esta vez era la instancia EC2 de producción número tres, que había recibido un parche de librería seis semanas atrás que nadie había documentado, que las otras dos instancias no habían recibido, y que ahora estaba causando un error que solo existía allí, en esa instancia, invisible en cualquier otro lugar.

Había pasado tres horas la noche anterior rastreándolo.

"Cada vez que desplegamos," dijo a la mañana siguiente, "coordinamos entre múltiples instancias. Nueva versión, dependencias diferentes. Funciona en staging, se rompe en producción porque los entornos han divergido."

"Porque alguien actualizó un paquete en la instancia tres sin actualizar las otras," dijo Priya. Sin crueldad.

"Necesitaba una versión específica de—"

"Lo sé," dijo ella. "Y ahora la instancia tres tiene un historial diferente al de la instancia uno y dos. Eso es deriva de configuración. Es silenciosa hasta que deja de serlo."

Lambda había resuelto el problema del servidor inactivo para los servicios más pequeños de Nimbus. Pero la API central, la que llevaba todo el tráfico de pedidos, seguía en EC2. Y las instancias EC2, a diferencia de las funciones, acumulaban historial.

"¿Cuál es la solución real?" preguntó Maya.

"Deja de tratar los servidores como cosas permanentes que configuras," dijo Priya. "Empieza a tratarlos como unidades desechables que reemplazas."

Hay una analogía que explica esto con tanta precisión que aparece en casi todas las explicaciones de los contenedores de software. Viene de 1956, y no tiene nada que ver con el software. La respuesta, cuando alguien finalmente preguntó "¿cuál es la solución para enviar mercancías de forma fiable entre diferentes transportistas?", fue: estandarizar el contenedor. Envía la caja, no solo el contenido.

**¿Qué Es un Contenedor?**

Un **contenedor** es una unidad ligera y portable que empaqueta tu aplicación junto con todo lo que necesita para ejecutarse: el runtime (Python 3.11, Node.js 20, Java 17), las librerías y dependencias, los archivos de configuración y el propio código de la aplicación.

A diferencia de una máquina virtual (que emula un computador completo, incluido el núcleo del sistema operativo), un contenedor comparte el núcleo del SO del host mientras mantiene todo lo demás aislado. Esto hace que los contenedores sean rápidos de arrancar (segundos, a veces milisegundos) y pequeños (megabytes, no gigabytes).

La tecnología de contenedores más popular es **Docker**. Una imagen Docker es el plano: una instantánea de la aplicación y su entorno. Un contenedor Docker es una instancia en ejecución de esa imagen.

La propiedad clave: la **inmutabilidad**. Una imagen construida hoy se ejecutará de forma idéntica en cualquier host que soporte Docker: un portátil, una instancia EC2, un servidor en un centro de datos diferente. El entorno está integrado. La deriva de configuración es imposible.

"Entonces, en lugar de preocuparnos por lo que está instalado en la instancia EC2," dijo Leo, "construimos una imagen que tiene todo. La imagen funciona igual en todas partes."

"Y si necesitas probarla localmente, ejecutas la misma imagen," añadió Priya. "Nada más de 'funciona en mi máquina'."

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

Para Nimbus: Fargate para el servicio de API. No querían gestionar instancias EC2 para contenedores.

**Amazon EKS: Cuando Necesitas Kubernetes**

**Kubernetes** es un sistema de orquestación de contenedores de código abierto, esencialmente el estándar de la industria para gestionar contenedores a escala. Es potente, extensible y complejo.

**Amazon EKS (Elastic Kubernetes Service)** es el servicio gestionado de Kubernetes de AWS. Ejecuta el plano de control de Kubernetes (la capa de gestión) por ti, mientras gestionas los nodos de trabajo (o usas Fargate para ellos también).

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

"¿Cuál deberíamos usar?" preguntó Maya.

"ECS," dijo Priya de inmediato. "No tenemos experiencia con Kubernetes. ECS hace todo lo que necesitamos. Agregar Kubernetes ahora sería añadir complejidad operativa sin ningún beneficio práctico."

"Siempre podemos migrar a EKS más adelante si superamos ECS," añadió Leo.

Esta es una respuesta correcta de ingeniería senior: elige la herramienta más simple que se adapte a tus necesidades actuales.

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

## Ventajas y Limitaciones

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

- Los **contenedores** empaquetan el código de la aplicación, el runtime y las dependencias juntos: se ejecutan de forma idéntica en cualquier lugar.
- **Docker** es la tecnología de contenedores estándar. Las imágenes son planos; los contenedores son instancias en ejecución.
- **ECR (Elastic Container Registry)** es el registro de Docker gestionado de AWS: almacena y versiona tus imágenes aquí.
- **ECS (Elastic Container Service)** orquesta los contenedores. Defines tareas y servicios; ECS gestiona la ubicación y el ciclo de vida.
- **Fargate** es el cómputo sin servidor para contenedores: sin instancias EC2 que gestionar.
- **EKS (Elastic Kubernetes Service)** es Kubernetes gestionado: para equipos que necesitan las características de Kubernetes o compatibilidad.
- Elige ECS por su simplicidad en AWS; elige EKS para compatibilidad con el ecosistema Kubernetes.

## Consejos para el Examen

*Dominio SAA-C03: Diseño de Arquitecturas Resilientes (Dominio 2, Tarea 2.1)*

- **Señales ECS vs EKS**: Los escenarios del examen que mencionan "Kubernetes," "Helm," "experiencia existente en Kubernetes" o "orquestación de contenedores multi-nube" → EKS. Todo lo demás → ECS.
- **Fargate vs tipo de lanzamiento EC2**: "No quiero gestionar instancias EC2 para contenedores," "contenedores sin servidor," "sin gestión de infraestructura" → Fargate. "Necesito tipos de instancias específicos," "cargas de trabajo con GPU," "control detallado de la instancia" → tipo de lanzamiento EC2.
- **Roles de tarea ECS**: Al igual que los roles de instancia EC2, las tareas ECS tienen roles IAM. Cada tarea puede tener diferentes permisos. Escenario del examen: "el contenedor necesita leer de S3" → adjunta un rol IAM a la definición de tarea.
- **Análisis de imágenes ECR**: ECR puede analizar imágenes de contenedores en busca de vulnerabilidades conocidas (CVE). Señal del examen: "analizar contenedores en busca de vulnerabilidades de seguridad" → análisis de imágenes ECR.
- **Despliegues azul/verde**: ECS soporta despliegues azul/verde mediante integración con CodeDeploy. Despliegue sin tiempo de inactividad con reversión automática. Patrón del examen: "desplegar sin tiempo de inactividad con reversión automática" → ECS + CodeDeploy azul/verde.
- **Autoescalado del servicio ECS**: Escala el número de tareas según CPU, memoria o métricas personalizadas de CloudWatch. Trabaja con ALB para enrutar el tráfico al número correcto de tareas en ejecución.

## Ejercicios

**Ejercicio 1 — Recordatorio**

Explica la diferencia entre una imagen Docker y un contenedor Docker. Explica la diferencia entre ECS y ECR.

*(Pista: La imagen es al contenedor lo que una receta es a un plato cocinado. ECR almacena imágenes; ECS las ejecuta.)*

**Ejercicio 2 — Práctica de Examen**

*Escenario*: Una empresa tiene una aplicación de microservicios que actualmente se ejecuta en instancias EC2 gestionadas manualmente. El equipo tiene problemas con despliegues inconsistentes: diferentes instancias EC2 tienen diferentes versiones de librerías, lo que causa errores difíciles de reproducir. Quieren estandarizar los despliegues minimizando la sobrecarga operativa de gestionar los servidores subyacentes. El equipo no tiene experiencia con Kubernetes.

¿Qué solución cumple MEJOR con estos requisitos?

A) Desplegar en EC2 con AWS Systems Manager Patch Manager para mantener las instancias consistentes  
B) Contenerizar la aplicación con Docker; usar Amazon ECS con el tipo de lanzamiento Fargate  
C) Contenerizar la aplicación con Docker; usar Amazon EKS con grupos de nodos autogestionados  
D) Usar AWS Elastic Beanstalk para gestionar despliegues y la configuración de instancias automáticamente

**Pista 1**: Los contenedores resuelven el problema del "entorno inconsistente" directamente. ¿Qué opciones usan contenedores?

**Pista 2**: "Minimizar la sobrecarga operativa de gestionar servidores" → Fargate (sin gestión de EC2) frente a nodos autogestionados (todavía gestionas EC2).

**Pista 3**: "Sin experiencia en Kubernetes" → EKS es más complejidad operativa que ECS.

**Respuesta**: B

**Explicación**: Contenerizar con Docker garantiza que cada despliegue use la misma imagen con las mismas dependencias, eliminando la deriva de configuración. ECS con Fargate significa que no hay instancias EC2 que gestionar. El equipo se centra en el código de la aplicación y las definiciones de contenedores, no en el mantenimiento de servidores. ECS (no EKS) es apropiado para equipos sin experiencia en Kubernetes.

**¿Por qué no A?** Patch Manager mantiene las instancias EC2 actualizadas, pero no resuelve la inconsistencia de versiones de librerías entre aplicaciones. El problema fundamental (diferentes entornos de código en diferentes instancias) persiste.

**¿Por qué no C?** EKS con grupos de nodos autogestionados requiere gestionar instancias EC2 *y* aprender Kubernetes. Ninguno de los dos se alinea con los requisitos.

**¿Por qué no D?** Elastic Beanstalk gestiona el despliegue de aplicaciones en EC2, pero no resuelve la inconsistencia fundamental del entorno a menos que se usen contenedores. Beanstalk no usa imágenes Docker por defecto (aunque puede configurarse para hacerlo).

*Dominio SAA-C03: Diseño de Arquitecturas Resilientes — Tarea 2.1*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus está dividiendo la API monolítica en tres microservicios: el servicio de pedidos, el servicio de menú y el servicio de notificaciones. Cada servicio tiene diferentes requisitos de escalado (el servicio de pedidos escala con el tráfico; el servicio de menú es principalmente de solo lectura y estable; el servicio de notificaciones tiene ráfagas puntuales).

Diseña la arquitectura ECS para estos tres servicios. ¿Cómo gestionarías la comunicación entre servicios? ¿Usarías un clúster ECS o tres? ¿Cómo configurarías el Autoescalado de forma diferente para cada servicio?

*(No hay una única respuesta correcta. El objetivo es practicar la arquitectura de microservicios en ECS.)*

## Escena Poscreditos

El primer despliegue de contenedores fue impecable.

Nueva versión de la API: cero tiempo de inactividad. ECS lo desplegó, las comprobaciones de estado pasaron, las tareas antiguas drenaron, las nuevas tareas tomaron el relevo. Leo observó el estado de las tareas en la consola con algo parecido a la incredulidad.

"Simplemente funcionó," dijo.

"Ese es el punto," dijo Priya.

"Sin SSH. Sin tiempo de inactividad. Sin 'espera a que se reinicie'."

"La imagen es el artefacto de despliegue," dijo ella. "El entorno es inmutable. El proceso de despliegue es declarativo. Así es como debería enviarse el software."

Leo se quedó mirando la consola otro momento.

"Pasé tres años coordinando despliegues de EC2," dijo. "Coordinando scripts SSH. Escribiendo manuales de despliegue."

"Estabas resolviendo un problema," dijo Priya, "que los contenedores resuelven por diseño."

No dijo nada después de eso. Pero a la mañana siguiente, empezó a escribir documentación sobre el proceso de construcción de contenedores, para que nadie más tuviera que pasar tres años descubriéndolo.

En el siguiente capítulo: el diagrama de flujo que se ejecuta solo, y recuerda dónde se detuvo.
