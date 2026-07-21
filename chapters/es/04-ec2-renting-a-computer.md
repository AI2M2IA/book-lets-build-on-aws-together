# Capítulo 4: Un Ordenador en el Edificio de Otra Persona

El gráfico de CPU se había convertido en música de fondo.

El portátil de Tom estaba abierto en la esquina de su escritorio, CloudWatch refrescándose cada minuto, la línea de utilización subiendo con una pendiente que significaba que algo estaba trabajando duro. Maya lo había notado hace tres días y no se lo había mencionado a nadie. Había estado vigilando la cola de pedidos en su lugar.

IAM estaba en su sitio. Las credenciales estaban en orden. Priya tenía MFA en todo. El equipo se sentía, por primera vez, como si estuvieran siendo ligeramente responsables. Pero ser responsable no resolvía el problema que Maya estaba observando: los números en el panel de pedidos subiendo mientras la línea de CPU subía con ellos.

La app de Nimbus se ejecutaba en la instancia que Leo había lanzado sin pensarlo — la que «desplegó en algún lugar» antes de que nadie supiera qué era una Región.

Eso estaba bien para mostrar una demo a los inversores. No estaba bien cuando Maya pulsó «lanzar» y doscientos registros llegaron en la primera semana — cuarenta y siete restaurantes tomando pedidos activamente cada día. La instancia improvisada de Leo ahora manejaba pedidos reales, menús reales y clientes reales — una máquina elegida por accidente, dimensionada por defecto, configurada por una persona que había estado aprendiendo AWS mientras tecleaba.

«Necesitamos un servidor», dijo Maya. «Uno real. Uno que alguien haya elegido a propósito de verdad.»

Tom miró el gráfico de CPU. La línea era visible desde el otro lado de la sala.

Fue entonces cuando empezaron a buscar qué significa realmente alquilar un ordenador.

**La Abstracción que Nadie Explica**

Cuando la gente dice que su aplicación «se ejecuta en la nube», generalmente quiere decir que se ejecuta en una
máquina virtual — un ordenador que no existe físicamente como hardware dedicado,
pero que se comporta en todo como si lo hiciera.

Aquí está el mecanismo.

Un servidor físico en un centro de datos de AWS tiene muchos recursos: núcleos de CPU, memoria, disco
y ancho de banda de red. AWS toma ese servidor físico y lo divide usando un software
llamado **hipervisor** — software que actúa como el conserje de un edificio, dividiendo
los recursos del servidor físico entre múltiples inquilinos virtuales. El hipervisor crea
múltiples máquinas virtuales, cada una aparentemente con su propia CPU, memoria y
disco dedicados — pero en realidad compartiendo el hardware físico subyacente.

Piénsalo como alquilar un apartamento en un edificio grande, en lugar de comprar una casa.

El propietario del edificio (AWS) mantiene la estructura física — la fontanería, la electricidad,
la seguridad. Tú obtienes una unidad. La amueblas como quieras. Pagas mensualmente (o
por horas). Cuando necesitas más espacio, te mudas a una unidad más grande. Cuando te mudas,
dejas de pagar.

Cada uno de esos alquileres de máquina virtual es lo que AWS llama una **instancia EC2** — Elastic
Compute Cloud.

EC2 son las siglas de Elastic Compute Cloud. La parte «elástica» es importante, y llegaremos
a ella. Por ahora: una instancia EC2 es un ordenador que alquilas por horas. Tiene un sistema
operativo, una conexión de red y potencia informática. Ejecuta tu aplicación igual que
lo haría un servidor físico.

**Elegir Tu Instancia: El Tamaño Importa**

No todas las instancias EC2 son iguales. AWS ofrece cientos de tipos de instancia, organizados
en familias según para qué están optimizadas.

**Uso general** (p. ej., `t3`, `m6i`): CPU y memoria equilibradas. Buena elección predeterminada
para la mayoría de las aplicaciones web. La familia `t3` es ampliable (burstable) — acumula créditos de CPU
durante los períodos de baja utilización y los gasta durante los picos. Excelente para entornos de
desarrollo y cargas de trabajo con demanda de CPU variable. La familia `m6i` proporciona
un rendimiento consistente y no ampliable — mejor para cargas de trabajo de producción con necesidades de CPU sostenidas.

**Optimizado para cómputo** (p. ej., `c7g`): Más CPU en relación con la memoria. Bueno para la codificación
de vídeo, el modelado científico, el procesamiento por lotes. El sufijo «g» en `c7g` significa que la
instancia usa procesadores AWS Graviton — chips basados en ARM que AWS diseñó internamente,
ofreciendo mejor relación precio-rendimiento para muchas cargas de trabajo que las instancias x86 equivalentes.

**Optimizado para memoria** (p. ej., `r7i`): Más memoria en relación con la CPU. Bueno para bases de datos,
almacenamiento en caché, análisis en memoria. Si estás ejecutando una base de datos donde el rendimiento mejora
drásticamente manteniendo más datos en RAM, la familia R es el punto de partida correcto.

**Optimizado para almacenamiento** (p. ej., `i3`): Almacenamiento local de alta velocidad. Bueno para cargas de trabajo
intensivas en datos que necesitan E/S de disco muy rápida. El almacenamiento NVMe local en estas instancias es
significativamente más rápido que EBS — pero también es efímero. Úsalo para datos temporales,
no para nada que no puedas permitirte perder.

**Cómputo acelerado** (p. ej., `p4`): GPUs adjuntas. Bueno para el entrenamiento de aprendizaje
automático y el renderizado gráfico. Estas instancias son caras — una `p3.8xlarge` cuesta
más de 12 dólares por hora — pero para cargas de trabajo que se benefician del paralelismo de GPU, no hay
sustituto.

Cada familia tiene tamaños. Un `t3.micro` tiene 2 CPU virtuales y 1 GB de memoria. Un
`t3.xlarge` tiene 4 CPU virtuales y 16 GB. Un `t3.2xlarge` vuelve a duplicarse. El patrón
de nomenclatura es consistente: el sufijo va `nano`, `micro`, `small`, `medium`, `large`,
`xlarge`, `2xlarge`, `4xlarge`, `8xlarge` y más allá.

Leo había elegido un `t3.micro`.

«¿Cuántos usuarios puede manejar un `t3.micro`?» preguntó Tom. «¿Y cuánto más cuesta uno más grande?»

«Depende de la aplicación», dijo Leo. «Pero probablemente no cien usuarios simultáneos
ejecutando subidas de imágenes y consultas a la base de datos.»

«¿Cuánto cuesta eso al mes?» preguntó Tom, mirando la página de comparación de tipos de instancia.

Leo abrió la página de precios de AWS. El t3.micro costaba unos 8 dólares al mes. El t3.small eran 17. El t3.medium eran 33. El t3.large rondaba los 60. La brecha se ampliaba rápido a medida que subías — no linealmente, sino aproximadamente duplicándose con cada paso de tamaño. Tom anotó los números, notando que cada paso de tamaño duplicaba la memoria — pero, curiosamente, no el número de CPU. Cada t3 de micro a large tenía las mismas 2 vCPUs; el número no aumentaba hasta xlarge. La **línea base de créditos de CPU** — la parte de esas vCPUs que la instancia podía usar continuamente sin agotar sus créditos de pico — también creció, aunque no en cada paso.

Tom escribió «t3.micro» en la pizarra y dibujó una cara triste al lado.

**La Conversación sobre el Dimensionamiento Correcto**

El t3.micro duró aproximadamente un mes antes de que el tráfico del viernes por la noche lo aplastara. Leo lo actualizó con prisas — directamente a un t3.large, razonando que demasiado grande era más seguro que demasiado pequeño. Dos semanas después de la mudanza al t3.large, Tom señaló algo.

«La CPU está al 9%», dijo. «De media. Durante los últimos siete días.»

Leo miró el gráfico de CloudWatch. 9% de CPU de media. Picos de quizás 35% durante la cena del viernes. El resto del tiempo: apenas moviéndose.

«Estamos ejecutando un servidor de 60 dólares al mes», dijo Tom, «al 9% de su capacidad.»

«¿Pero qué pasa con los picos del viernes?» dijo Leo. «Necesitamos margen.»

«Los picos del viernes llegan al 35%», dijo Tom. «Un t3.small tiene las mismas dos vCPUs — lo que es más pequeño es la línea base de créditos, alrededor del 20% sostenido. Nosotros promediamos el 9%. Eso significa que estaríamos acumulando créditos de CPU todo el día, todos los días, y gastando algunos durante unas pocas horas los viernes por la noche. Comprobé las cuentas del `CPUCreditBalance` — el saldo nunca se acerca a quedarse vacío. Son 17 dólares al mes. Tenemos margen.»

Leo miró los números. Miró el gráfico. Sintió la incomodidad de un ingeniero que ha sobreaprovisionado y lo sabe.

«¿Pero qué pasa si tenemos un pico?» dijo.

«Entonces las métricas nos lo dirán antes de que duela», dijo Priya. «Y eventualmente configuraremos Auto Scaling — eso es literalmente para lo que sirve. No necesitarás aprovisionar para el pico manualmente una vez que el sistema pueda añadir instancias automáticamente.»

Redujeron a un t3.small. La factura mensual bajó 40 dólares. A lo largo de un año, eso eran 480 dólares — nada despreciable, especialmente para una startup. Tom lo anotó en su hoja de cálculo con la tranquila satisfacción de alguien que ha estado esperando dos semanas para hacer este comentario.

Este patrón tiene un nombre: **dimensionamiento correcto** (right-sizing). Significa ajustar el tamaño de la instancia a la carga de trabajo real, no al peor caso imaginado. Herramientas de AWS como AWS Compute Optimizer y las métricas de CloudWatch convierten el dimensionamiento correcto en una decisión basada en datos en lugar de una conjetura.

**La AMI: El Estado Inicial de Tu Máquina**

Antes de lanzar una instancia EC2, eliges su sistema operativo y la configuración
inicial. En AWS, esto se llama una **Amazon Machine Image** (AMI, o Imagen de Máquina de Amazon).

Una AMI es una plantilla. Define:

- El sistema operativo (Amazon Linux, Ubuntu, Windows Server, etc.)
- Software preinstalado
- El estado inicial del disco

Cuando lanzas una instancia desde una AMI, AWS crea una copia nueva de esa plantilla
justo para ti. También puedes crear tus propias AMIs — si configuras un servidor exactamente
como quieres, puedes «guardar» ese estado como una AMI personalizada y usarla para lanzar
servidores idénticos rápidamente. Así es como se despliegan entornos consistentes a escala.

Piensa en una AMI como una receta. La receta describe el plato. Cada vez que sigues la
receta, obtienes el mismo plato. Si quieres cambiar el plato permanentemente, actualizas
la receta.

AWS proporciona un mercado de AMIs — algunas son mantenidas por AWS (Amazon Linux 2, Amazon
Linux 2023), algunas son mantenidas por las principales distribuciones de Linux (Ubuntu, Red Hat, SUSE),
y algunas vienen de proveedores externos (servidores de base de datos preconfigurados, dispositivos
de seguridad, software comercial). Para la mayoría de las aplicaciones web, una AMI de Amazon
Linux mantenida por AWS o una AMI de Ubuntu LTS es el punto de partida correcto.

Para Nimbus, Leo construyó una AMI personalizada que partía de la última base de Amazon Linux 2023
y añadía el entorno de ejecución de Node.js, las dependencias de sistema de la aplicación y un archivo
de servicio precreado para el proceso de la aplicación. Las nuevas instancias lanzadas desde esta AMI empezaban
a servir tráfico en menos de 90 segundos — significativamente más rápido que el tiempo de arranque de cuatro
minutos cuando se usaban scripts de UserData para instalar todo desde cero.

Hay una concesión: las AMIs personalizadas necesitan mantenerse. Cada vez que actualizas una dependencia
de sistema o la versión del entorno de ejecución, necesitas reconstruir la AMI. Los equipos que dejan que sus
AMIs queden obsoletas se encuentran ejecutando instancias con software desactualizado — un riesgo
de seguridad. Priya puso «reconstruir AMI con los últimos paquetes» en la lista de verificación mensual de ingeniería.

«¿Cuánto cuesta almacenar AMIs?» preguntó Tom.

Las AMIs se almacenan como snapshots de EBS — pagas la tarifa de snapshot de EBS (aproximadamente 0,05
dólares por GB al mes) por el tamaño de la AMI. Una AMI típica de Amazon Linux con la pila de la
aplicación de Nimbus rondaba los 4 GB. A 0,05 $/GB: 0,20 dólares al mes por AMI. Mantener cinco
AMIs históricas para fines de reversión: 1 $/mes. No es un coste significativo.

**UserData: El Script de Arranque**

Hay una opción de configuración más en EC2 que Leo descubrió cuando intentaba evitar construir una nueva AMI cada vez que cambiaba el código de la aplicación.

Cuando lanzas una instancia EC2, puedes proporcionar un **script de UserData** — un script de shell que se ejecuta automáticamente cuando la instancia se inicia por primera vez. Se ejecuta como root, antes de que la instancia se considere «lista».

Para Nimbus, el script de UserData se parecía a algo como esto:

```bash
#!/bin/bash
yum update -y
yum install -y nodejs npm git
git clone https://github.com/nimbus-app/server.git /opt/nimbus
cd /opt/nimbus
npm install
systemctl enable nimbus
systemctl start nimbus
```

Ese script instala Node.js, descarga el código más reciente de la aplicación, instala las dependencias e inicia el servicio de la aplicación. Cada nueva instancia que se lanza desde la AMI base ejecuta este script y arranca con la versión actual de la aplicación instalada — automáticamente.

Este enfoque significa que la AMI se mantiene simple (solo un SO base), y el UserData se encarga de la configuración de la aplicación. La concesión: los scripts de UserData tardan en ejecutarse. Una instancia podría tardar de tres a cinco minutos en arrancar y estar lista. Para aplicaciones donde el tiempo de arranque importa — para Auto Scaling, donde necesitas que las nuevas instancias estén listas rápidamente — precocinar la aplicación en una AMI personalizada reduce el tiempo de arranque significativamente.

«Estará bien», dijo Leo, cuando Priya preguntó por el tiempo de arranque.

«¿Cuál es el tiempo de arranque?» preguntó.

«Cuatro minutos.»

«¿Y durante esos cuatro minutos, la instancia está ejecutándose pero no sirviendo tráfico?»

«Sí.»

«¿Así que durante un pico de tráfico repentino, podríamos tener cuatro minutos donde las nuevas instancias todavía no están ayudando?»

Leo miró su script de UserData. Empezó a mirar cómo construir una AMI personalizada.

**Pares de Claves: La Forma Correcta de Acceder a un Servidor**

¿Recuerdas el desastre de «Admin123» del capítulo anterior?

La forma correcta de iniciar sesión en una instancia EC2 es con un **par de claves**.

Un par de claves es un par criptográfico: una clave pública (almacenada por AWS en el servidor) y una
clave privada (un archivo que descargas y mantienes en secreto). Para iniciar sesión, usas SSH — un protocolo seguro
— con tu clave privada. No hay contraseña. Si pierdes la clave privada,
pierdes el acceso. No hay «olvidé mi contraseña» para SSH.

Esto importa porque los pares de claves son:

- Únicos para ti
- Criptográficamente imposibles de adivinar
- No almacenados por AWS (tú guardas la clave privada)
- Fáciles de revocar (elimina la clave del servidor, genera un nuevo par)

Priya ya había configurado el acceso basado en claves en el servidor de Nimbus. El servidor Admin123
fue dado de baja. Nadie lo lamentó.

«¿Y qué pasa si alguien intenta entrar por la fuerza e intercepta un par de claves en tránsito?» preguntó Priya. Ya había resuelto la respuesta: la clave privada nunca viaja por la red. La descargas una vez. La guardas localmente. Nunca sale de tu máquina.

**Qué Pasa Si Pierdes el Par de Claves**

Leo hizo esta pregunta en la tercera semana, con la energía específica de alguien que no ha perdido su par de claves todavía pero está pensando en ello.

«Si pierdo el archivo de la clave privada, ¿qué pasa?»

«Pierdes el acceso SSH a la instancia», dijo Priya.

«¿Permanentemente?»

«No necesariamente. Pero el proceso de recuperación es desagradable.»

El proceso de recuperación: detener la instancia, desadjuntar su volumen raíz de EBS, adjuntarlo a una instancia diferente a la que *sí* tienes acceso, montar el volumen, añadir una nueva clave pública al archivo `authorized_keys` en el volumen montado, desadjuntarlo y readjuntarlo a la instancia original, reiniciar.

Esto funciona. Tarda de treinta a sesenta minutos y requiere una ejecución cuidadosa. Un paso en falso y puedes empeorar las cosas.

La alternativa, si tu aplicación no almacena nada crítico en el volumen raíz (porque has estado siguiendo los consejos de este libro y almacenando datos en S3 y EBS): terminar la instancia y lanzar una nueva desde la AMI. Genera un nuevo par de claves cuando lo hagas.

«Almacena la clave privada en algún lugar seguro», dijo Priya. «Y nunca en una instancia EC2.»

Leo miró la carpeta de su escritorio etiquetada `AWS_keys`. Luego a Priya. Luego movió la carpeta a su gestor de contraseñas cifrado.

**Grupos de Seguridad: El Cortafuegos de Tu Instancia**

Cuando una instancia EC2 se lanza, necesita un **grupo de seguridad** — un cortafuegos virtual que controla qué tráfico de red puede alcanzarla y qué tráfico puede enviar hacia afuera.

Un grupo de seguridad tiene dos conjuntos de reglas: **entrante** (tráfico que entra) y **saliente** (tráfico que sale).

De forma predeterminada, un nuevo grupo de seguridad bloquea todo el tráfico entrante y permite todo el tráfico saliente. Añades reglas de entrada para abrir puertos específicos a fuentes específicas.

Para el servidor web de Nimbus, Priya configuró:

- Permitir el puerto TCP 443 (HTTPS) desde `0.0.0.0/0` (todo internet)
- Permitir el puerto TCP 80 (HTTP) desde `0.0.0.0/0` (redirigido a 443 en la aplicación)
- Permitir el puerto TCP 22 (SSH) solo desde la dirección IP de la oficina — no desde internet

«Espera — pero ¿*por qué* restringiríamos SSH solo a la IP de la oficina?» preguntó Maya.

«Porque si SSH está abierto a todo internet», dijo Priya, «los bots automatizados golpearán el puerto 22 probando combinaciones de credenciales las veinticuatro horas del día. Nuestros registros se llenarán de intentos fallidos. Y si alguna vez hay una vulnerabilidad en el propio demonio SSH, todos los atacantes del mundo pueden intentar explotarla.»

«¿Pero qué pasa si Leo necesita iniciar sesión desde casa?»

«VPN», dijo Priya.

Leo ya tenía una VPN configurada. Tenía la expresión de alguien a quien ya le habían hecho esta pregunta antes.

La base de datos todavía vivía en la misma máquina que la aplicación — pero Priya preparó un grupo de seguridad separado para el día en que no lo hiciera: el puerto de la base de datos abierto solo al tráfico del grupo de seguridad del servidor web — no desde internet, no desde SSH (para el acceso directo a la BD), no desde ningún otro lugar. Mientras tanto, se aseguró de que el grupo de seguridad de la instancia compartida no expusiera en absoluto el puerto de la base de datos a internet. La base de datos sería invisible para todo excepto para la aplicación que la necesitaba.

Para llegar a la base de datos directamente, un atacante necesitaría comprometer primero el servidor web. Esa era la primera capa de defensa.

«¿Y la segunda capa?» preguntó Tom.

«Autenticación IAM para la base de datos. Y cifrado en tránsito.»

Añadió ambas a la lista de verificación de configuración.

**Metadatos de Instancia EC2 e IMDSv2**

Hay una pieza más de la seguridad de EC2 que importa en la práctica, aunque rara vez se explica en el contenido introductorio.

Cuando una aplicación se ejecuta en una instancia EC2, puede consultar un endpoint interno especial en `http://169.254.169.254/latest/meta-data/` para recuperar información sobre la instancia: su ID de instancia, su Región, su zona de disponibilidad y — crucialmente — las credenciales IAM temporales asociadas con cualquier Rol de IAM adjunto.

Así es como la aplicación en la instancia EC2 llama a los servicios de AWS sin tener credenciales codificadas directamente. Le pregunta al servicio de metadatos: «¿Qué credenciales debería usar ahora mismo?» El servicio de metadatos devuelve credenciales temporales que expiran y rotan automáticamente.

El problema de seguridad: las versiones más antiguas de este servicio de metadatos (IMDSv1) respondían a cualquier solicitud de cualquier proceso en la instancia. Si una aplicación tenía una vulnerabilidad de falsificación de solicitudes del lado del servidor (SSRF) — un fallo donde un atacante podía hacer que el servidor obtuviera una URL de la elección del atacante — el atacante podía usar esa vulnerabilidad para obtener `http://169.254.169.254/latest/meta-data/iam/security-credentials/` y recuperar las credenciales IAM de la instancia.

Este ataque se ha usado en brechas reales.

**IMDSv2** (Instance Metadata Service versión 2) arregla esto requiriendo un token de sesión antes de que el servicio de metadatos responda. El token se obtiene a través de una solicitud PUT. Los ataques SSRF, que normalmente usan solicitudes GET, no pueden completar el paso PUT — así que no pueden obtener el token, y los metadatos no se devuelven.

«¿Deberíamos habilitar IMDSv2?» preguntó Leo.

«Ahora es el valor predeterminado para las nuevas instancias», dijo Priya. «Pero para las instancias existentes, tienes que activarlo.»

Lo habilitó en todas las instancias existentes de Nimbus esa tarde.

**Ciclo de Vida de la Instancia: No Para Siempre**

Esto es algo que muchos principiantes pasan por alto.

Las instancias EC2 no son permanentes de forma predeterminada. Cuando detienes una instancia, el recurso
informático se libera. Cuando la vuelves a iniciar, puede ejecutarse en hardware físico
diferente. Cualquier dato almacenado *en la propia instancia* (en su volumen raíz) sobrevive
a un ciclo de parada/inicio — pero la dirección IP pública cambia.

Cuando *terminas* una instancia, desaparece. A menos que tengas almacenamiento separado adjunto
(lo que cubrimos en el Capítulo 6), cualquier dato en la instancia desaparece.

Los cuatro estados en los que puede estar una instancia EC2:

**Pendiente (Pending)**: La instancia se está iniciando. Se le ha asignado hardware pero no ha
terminado de arrancar.

**En ejecución (Running)**: La instancia está activa y accesible. Estás pagando por ella. En el primer arranque, también es en este momento cuando se ejecuta el script de UserData.

**Deteniéndose/Detenida (Stopping/Stopped)**: La instancia está apagada. El volumen raíz de EBS se preserva.
No estás pagando por el cómputo, pero todavía pagas por el almacenamiento EBS adjunto.

**Apagándose/Terminada (Shutting-down/Terminated)**: La instancia se está eliminando. A menos que hayas configurado
los volúmenes de EBS para que persistan, sus datos desaparecen.

Esta «efemeralidad» es en realidad una característica, no un defecto. Significa que puedes arrancar
servidores, usarlos y desecharlos. Permite el escalado horizontal. Pero también
significa que nunca debes almacenar datos importantes *en* la propia instancia EC2.

¿Dónde viven los datos, entonces?

En almacenamiento separado. Llegaremos a eso en los próximos dos capítulos.

Puede que te estés preguntando: si una instancia obtiene una nueva dirección IP cada vez que se reinicia, ¿cómo mantiene tu aplicación una dirección estable? AWS tiene una solución llamada IP Elástica — una IP pública estática que posees y que permanece igual incluso después de los reinicios. Una nota sobre el coste: desde febrero de 2024, AWS cobra una pequeña tarifa por hora por cada dirección IPv4 pública — IPs Elásticas (adjuntas o no) y las IPs públicas autoasignadas en las instancias por igual. La IPv4 pública ya no es gratis, lo que es una razón más para mantener las instancias en subredes privadas detrás de un balanceador de carga.

Para aplicaciones detrás de un balanceador de carga — que es la arquitectura correcta para cualquier
aplicación web de producción — no necesitas IPs Elásticas en absoluto. Los usuarios se conectan al
nombre DNS estable del balanceador de carga. El balanceador de carga se conecta a las instancias por sus
direcciones IP privadas dentro de la VPC. Las instancias pueden ir y venir, obtener nuevas IPs, escalar
hacia adentro y hacia afuera — el balanceador de carga gestiona todo de manera transparente. Las IPs Elásticas son para
casos de uso específicos: un servidor al que los clientes se conectan directamente por IP, un host bastión
con una dirección estable, una aplicación que no está detrás de un balanceador de carga por alguna
razón específica.

Leo planeó inicialmente usar IPs Elásticas para los servidores web de Nimbus. Priya señaló
que con un balanceador de carga, las direcciones IP de los servidores web eran irrelevantes para
los clientes externos. El balanceador de carga tenía el nombre DNS estable. Las instancias detrás de él
eran desechables por diseño.

«Así que las IPs Elásticas son para la excepción, no para la regla», dijo Leo.

«Correcto», dijo Priya. «Y si te ves echando mano de una, pregúntate si la
arquitectura debería tener un balanceador de carga en su lugar.»

**Qué Significa «Elástico»**

Dijimos que EC2 son las siglas de Elastic Compute Cloud. ¿Qué tiene de elástico?

Dos cosas:

**Elasticidad vertical**: Puedes cambiar el tamaño de una instancia. Detén la instancia,
cámbiala de `t3.micro` a `t3.xlarge`, reiníciala. Más CPU y memoria, misma
aplicación, misma configuración.

**Elasticidad horizontal**: Puedes añadir más instancias. En lugar de un servidor grande,
ejecuta diez servidores medianos detrás de un balanceador de carga. Cuando el tráfico baja, elimina instancias
y deja de pagar por ellas.

Ambos enfoques resuelven el problema de «un servidor, demasiado tráfico». Tienen diferentes
concesiones, que exploramos en el Capítulo 7 cuando añadimos Auto Scaling a la historia.

La conclusión clave: con EC2, la potencia informática es algo que *ajustas* en lugar de algo que
*compras*. ¿Necesitas más? Sube el dial. ¿Necesitas menos? Bájalo. Paga en consecuencia.

Maya miró la tabla de tipos de instancia. «Si simplemente podemos hacer el servidor más grande, ¿para qué molestarse con diez medianos?»

«Porque», dijo Leo, «un servidor grande sigue siendo un servidor. Si cae, todo cae. Diez servidores medianos significan que uno puede fallar y nueve siguen funcionando.»

«Y», añadió Priya, «no puedes hacer un servidor más grande sin reiniciarlo. Diez pequeños significan que puedes añadir más sin tocar los que están funcionando.»

Tom ya había escrito «reinicio = tiempo de inactividad» en su cuaderno.

## Fortalezas y Limitaciones

**Por qué EC2 es potente**:

- Control total. Tú eliges el SO, el software, la configuración. Es tu ordenador.
- Tamaño flexible. Cientos de tipos de instancia para cada caso de uso.
- Sin hardware que gestionar. AWS se encarga de la capa física.
- Facturación por segundo, con un mínimo de 60 segundos, para las AMIs de Amazon Linux, Windows y Ubuntu. (Algunas AMIs comerciales de Linux, como RHEL y SUSE, todavía facturan por hora — comprueba los términos de facturación de la AMI.) Detienes la instancia, dejas de pagar.
- Funciona con todo. EC2 es la base sobre la que se construyen la mayoría de los demás servicios de AWS.
- Múltiples modelos de precios (Bajo Demanda, Reservado, Spot) permiten una optimización de costes significativa
  para cargas de trabajo predecibles o flexibles — cubierto en detalle en el Capítulo 27.

**Donde se complica**:

- Eres responsable de parchear y actualizar el sistema operativo. (Modelo de Responsabilidad Compartida
  — esta es la parte «en la nube» que te corresponde.)
- Parchear el SO no es opcional. Las instancias EC2 sin parchear son uno de los vectores de ataque
  más comunes en las brechas de la nube. AWS Systems Manager Patch Manager puede automatizar
  esto — pero tienes que configurarlo y monitorizarlo.
- Gestionar EC2 a escala implica gestionar el estado de las instancias, las AMIs, los parches de seguridad y el
  ciclo de vida a través de potencialmente miles de máquinas. Eso es sobrecarga operativa.
- EC2 no es la respuesta correcta para todo. Para código basado en eventos que se ejecuta
  con poca frecuencia, Lambda (Capítulo 20) es más barato y más sencillo. Para cargas de trabajo
  en contenedores, ECS y EKS (Capítulo 21) ofrecen mejor eficiencia de recursos.
- Las instancias no utilizadas siguen costando dinero. Si detienes una instancia, dejas de pagar el cómputo
  — pero si tienes almacenamiento adjunto, todavía pagas por eso.

**El juicio sobre cuándo-no-usar-EC2**: EC2 te da el máximo control — pero el control tiene un coste operativo. Cada instancia EC2 que ejecutas es algo que tienes que parchear, monitorizar y eventualmente reemplazar. Para aplicaciones que se ejecutan con poca frecuencia (Lambda es más barato), para aplicaciones que necesitan escalar horizontalmente a docenas o cientos de instancias (los contenedores son más eficientes), o para bases de datos y otras cargas de trabajo gestionadas (RDS, ElastiCache), los servicios totalmente gestionados eliminan una sobrecarga operativa significativa a un modesto sobreprecio. EC2 es la elección correcta cuando necesitas el control que proporciona — no por defecto.

Priya tenía una heurística: «Si estaríamos contentos con un servicio gestionado que hace lo que necesitamos, usa el servicio gestionado. Usa EC2 cuando la opción gestionada no exista o no encaje.»

Leo inicialmente se resistió a esto. «Pero EC2 nos da más opciones.»

«Las opciones son sobrecarga», dijo Priya. «No necesitamos cada opción. Necesitamos la configuración correcta, mantenida de manera fiable.»

**Grupos de Ubicación de EC2: Controlar Dónde Aterrizan las Instancias**

EC2 te da control sobre qué es tu instancia — su tamaño, su SO, su configuración. También te da un control limitado sobre *dónde* aterriza físicamente, a través de una función llamada **grupos de ubicación** (placement groups).

De forma predeterminada, AWS distribuye las instancias a través del hardware físico para maximizar la disponibilidad. Pero para ciertas cargas de trabajo, quieres anular ese valor predeterminado — ya sea para acercar las instancias entre sí, o para garantizar que permanezcan separadas.

Tres tipos de grupos de ubicación:

**Clúster (Cluster)**: Empaqueta las instancias cerca unas de otras dentro de una única Zona de Disponibilidad, normalmente en el mismo rack físico o en hardware adyacente. El resultado es la latencia de red más baja y el mayor rendimiento de red entre las instancias del grupo — con un rendimiento de red de 10 Gbps o más entre instancias (no confundir esto con la Red Mejorada/ENA, que es una función de red por instancia independiente de los grupos de ubicación). Esta es la elección para HPC (computación de alto rendimiento), trabajos de entrenamiento de ML a gran escala y cargas de trabajo paralelas fuertemente acopladas donde las instancias pasan mucho tiempo enviándose datos entre sí. La concesión es la disponibilidad: si el segmento de hardware subyacente falla, todas las instancias del clúster pueden verse afectadas simultáneamente.

**Partición (Partition)**: Divide las instancias en particiones lógicas, donde cada partición se sitúa en su propio conjunto de hardware — racks separados, energía separada, switches de red separados. Las instancias dentro de una partición comparten hardware entre sí, pero las particiones nunca comparten hardware con otras particiones. Este diseño limita el radio de impacto de un fallo de hardware: un rack que cae afecta a una partición pero no a las demás. Los grupos de ubicación de partición están construidos para cargas de trabajo grandes, distribuidas y replicadas — Apache Hadoop, Apache Cassandra, Apache Kafka — donde quieres suficiente aislamiento de fallos como para que un fallo a nivel de rack no tire abajo todo tu clúster.

**Distribución (Spread)**: Coloca cada instancia en hardware subyacente completamente separado. Máximo aislamiento entre instancias. Si tienes cinco instancias de aplicación críticas que nunca deben compartir un host físico (porque un único fallo de hardware nunca debería tirar abajo más de una), Spread es la respuesta. El límite: **7 instancias por Zona de Disponibilidad por grupo de ubicación**. Spread está diseñado para pequeños números de instancias críticas que no pueden tolerar la coubicación, no para flotas grandes.

«¿Así que Cluster es para velocidad, Spread es para aislamiento, y Partition es para sistemas distribuidos que necesitan algo de agrupamiento y algo de aislamiento?» preguntó Maya.

«Lo suficientemente cerca», dijo Priya. «Cluster: baja latencia entre instancias, un gran riesgo. Spread: máximo aislamiento, límite estricto de siete por AZ. Partition: aislamiento estructurado para grandes sistemas distribuidos — tú controlas en qué partición va cada instancia.»

Para la arquitectura actual de Nimbus, ninguno de estos aplicaba todavía. Pero saber que existían significaba saber cuándo echar mano de ellos — y más inmediatamente, saber qué estaba preguntando realmente una pregunta de examen sobre «cargas de trabajo de HPC que necesitan baja latencia entre nodos».

## Resumen

Una instancia lanzada por accidente nunca iba a ser un servidor de producción. Entender EC2 correctamente no solo resolvió el problema de capacidad — introdujo un nuevo conjunto de conceptos que aparecerían en casi todos los capítulos siguientes. Los tipos de instancia, las AMIs, los pares de claves, los grupos de seguridad y el dimensionamiento correcto no son trivia de EC2; son el vocabulario sobre el que se construye el resto del libro. Apréndelos aquí y todo lo demás tendrá más sentido.

- Una **instancia EC2** es una máquina virtual que alquilas en AWS. Los tipos de instancia están organizados por caso de uso: uso general, optimizado para cómputo, optimizado para memoria, optimizado para almacenamiento. Elige la familia correcta y dimensiona según las métricas reales de la carga de trabajo — no el peor caso imaginado.
- Una **AMI** (Amazon Machine Image) es la plantilla para el SO y la configuración inicial de tu instancia. Las AMIs personalizadas permiten despliegues consistentes y repetibles.
- Los **pares de claves** son la forma segura de acceder a las instancias EC2. Los **grupos de seguridad** son el cortafuegos de tu instancia — restringe SSH a IPs conocidas y bloquea los puertos de base de datos solo al grupo de seguridad de la aplicación.
- **IMDSv2** debe estar habilitado en todas las instancias para proteger contra el robo de credenciales basado en SSRF del servicio de metadatos de la instancia.
- Las instancias EC2 no son permanentes de forma predeterminada. Las instancias terminadas pierden sus datos locales — almacena los datos importantes en S3 o EBS, no en el disco de la instancia.

## Consejos para el Examen

*Dominio SAA-C03 3 — Tarea 3.2 (soluciones de cómputo de alto rendimiento)*

- **Responsabilidad Compartida para EC2**: Eres responsable de parchear el SO.
  AWS mantiene el hardware físico y el hipervisor. Esta es una distinción que se prueba con frecuencia.
- **Las familias de instancias importan para las preguntas de escenario.** Si un escenario menciona requisitos de alta
  memoria (caché en memoria, SAP HANA), la respuesta probablemente implica una
  instancia optimizada para memoria. Si menciona procesamiento por lotes o HPC, optimizado para cómputo.
- **Detener ≠ Terminar.** Detener una instancia la preserva (puedes reiniciarla).
  Terminarla la elimina. Los escenarios del examen comprueban si conoces esta distinción.
- **La IP pública cambia al reiniciar.** Si tu aplicación necesita una dirección IP estable,
  usa una **IP Elástica** — una IP pública estática que permanece asociada a tu cuenta.
  Desde febrero de 2024, AWS factura cada dirección IPv4 pública por hora — IPs Elásticas
  (adjuntas o no) e IPs públicas autoasignadas por igual.
- Los modelos de precios **bajo demanda, reservado y spot** se evalúan mucho en el Dominio 4.
  Los cubrimos en el Capítulo 27. Por ahora, sabe que bajo demanda significa pagar por segundo
  sin compromiso.
- **Los grupos de seguridad tienen estado (stateful).** Si permites el tráfico entrante en un puerto, el
  tráfico de retorno se permite automáticamente sin una regla de salida explícita. Las NACLs
  (cubiertas en el Capítulo 15) no tienen estado — requieren reglas tanto de entrada como de salida.
- **Grupos de Ubicación:** Cluster = latencia más baja entre instancias (HPC, entrenamiento de ML — pero riesgo de punto único de fallo para el grupo); Partition = sistemas distribuidos (Hadoop, Kafka, Cassandra) con aislamiento de fallos por partición; Spread = máximo aislamiento de instancias, máx 7 por AZ. Patrón de pregunta de examen: «carga de trabajo de HPC fuertemente acoplada necesita el máximo rendimiento de red entre nodos» → grupo de ubicación Cluster.

## Ejercicios

**Ejercicio 1 — Recordar**

Con tus propias palabras: ¿qué es una instancia EC2? ¿Qué es una AMI? ¿Cuál es la relación
entre ellas?

*(Pista: Piensa en la analogía de la receta — ¿cuál es la receta y cuál es el plato?)*

**Ejercicio 2 — Escenario SAA-C03**

*Escenario*: Una empresa está desplegando una aplicación web de alto tráfico. La aplicación
gestiona búsquedas de catálogos de productos con lógica de filtrado compleja que requiere mucha CPU.
El equipo espera picos de tráfico significativos durante los eventos de venta. Quieren asegurarse
de elegir el tipo de instancia EC2 correcto y estar preparados para las subidas de tráfico.

¿Qué combinación de elecciones satisface MEJOR sus requisitos?

A) Instancias optimizadas para memoria con un número fijo para garantizar un rendimiento consistente  
B) Instancias optimizadas para cómputo con Auto Scaling para gestionar los picos de tráfico  
C) Instancias de uso general con un único tamaño de instancia grande  
D) Instancias optimizadas para almacenamiento porque el catálogo de productos requiere acceso rápido al disco

**Pista 1**: La carga de trabajo se describe como «intensiva en CPU». ¿Qué familia de instancias está
optimizada para CPU?

**Pista 2**: El escenario menciona «picos de tráfico durante los eventos de venta». Un número fijo
de instancias no gestionará eficientemente el tráfico variable. ¿Qué característica de AWS maneja esto?

**Pista 3**: Las instancias optimizadas para cómputo manejan trabajo intensivo en CPU. Auto Scaling añade
y elimina instancias según la demanda. Juntos responden a ambos requisitos.

**Respuesta**: B

**Explicación**: Las instancias optimizadas para cómputo (como la familia `c`) proporcionan más CPU
por dólar para las cargas de trabajo intensivas en CPU. Auto Scaling ajusta automáticamente el número
de instancias según la carga — añadiendo instancias durante los eventos de venta, eliminándolas cuando
el tráfico vuelve a la normalidad. Esta combinación optimiza tanto el rendimiento como el coste.

**¿Por qué no A?** Las instancias optimizadas para memoria están diseñadas para cargas de trabajo que necesitan grandes
cantidades de RAM (bases de datos, cachés en memoria). Esta es una carga de trabajo intensiva en CPU. Y un número fijo
de instancias significa o bien un aprovisionamiento excesivo (desperdicio) o un aprovisionamiento insuficiente (fallo).

**¿Por qué no C?** Las instancias de uso general sacrifican algo de eficiencia de CPU por el equilibrio. Para
una carga de trabajo intensiva en CPU conocida, la optimización para cómputo es más apropiada. Y una única
instancia grande es un único punto de fallo.

**¿Por qué no D?** El cuello de botella es la CPU, no la E/S de disco. Las instancias optimizadas para almacenamiento
están diseñadas para cargas de trabajo que necesitan un rendimiento muy alto en el almacenamiento local.

*Dominio SAA-C03 3 — Tarea 3.2*

**Ejercicio 3 — Desafío de Arquitectura** *(Opcional)*

Nimbus actualmente ejecuta una única instancia EC2 `t3.micro` para toda la aplicación.
El equipo necesita decidir: ¿actualizar a una instancia más grande (`t3.2xlarge`) o añadir más
instancias `t3.micro` detrás de un balanceador de carga?

Analiza las concesiones. ¿Cuáles son las ventajas de cada enfoque? ¿Qué
preguntas harías para decidir? (Pista: piensa en puntos únicos de fallo,
coste, complejidad de despliegue y qué pasa durante el mantenimiento.)

*(No hay una única respuesta correcta. Se trata de razonar el escalado vertical frente al
horizontal.)*

## Escena Post-Créditos

Leo pasó la tarde ejecutando la reducción. Pasó del `t3.large` a un `t3.small`,
usando los datos de dimensionamiento correcto que Tom había recopilado de CloudWatch. La CPU se asentó en torno al
12% durante la carga normal. Las páginas cargaban en menos de un segundo.

Tom observaba la factura de AWS actualizarse en tiempo real. El t3.small todavía costaba aproximadamente el doble por hora que el micro original — pero un tercio del t3.large que habían estado sobrepagando. Tomó nota: *40 $/mes ahorrados frente al t3.large anterior. Decisión correcta.*

Maya miraba algo más en su pantalla.

«Leo», dijo. «Mientras redimensionabas la instancia, el sitio web estuvo caído
doce minutos.»

Leo levantó la vista.

«Teníamos una cola de doscientos pedidos sin completar.»

Miró la pantalla. Luego al techo. Luego de vuelta a la pantalla.

«Necesitamos algo para nuestras imágenes», dijo, cambiando ligeramente el tema. «Ahora mismo,
las fotos de menú subidas se guardan directamente en el servidor. ¿Las perdemos si redimensionamos o reiniciamos
la instancia?»

Priya ya sabía la respuesta.

En el próximo capítulo: dónde viven los archivos cuando no hay disco duro al que apuntar.
