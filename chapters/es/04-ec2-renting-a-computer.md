# Capítulo 4: Un Ordenador en el Edificio de Otra Persona

La aplicación de Nimbus se ejecutaba en el portátil de Tom.

Eso estaba bien para mostrar una demo a los inversores. No estaba bien cuando Maya pulsó «lanzar»
y 200 restaurantes se registraron en la primera semana. El portátil de Tom estaba manejando pedidos reales,
menús reales y clientes reales — sentado debajo del escritorio de Tom, funcionando con la
Wi-Fi de la oficina, enchufado a una regleta que también alimentaba un calefactor portátil y una
cafetera.

«Necesitamos un servidor», dijo Maya. «Uno real. Funcionando en algún lugar que no sea debajo de tu escritorio.»

Tom miró su portátil. El ventilador era audible desde el otro lado de la sala.

Fue entonces cuando empezaron a buscar qué significa realmente alquilar un ordenador.

**La Abstracción que Nadie Explica**

Cuando la gente dice que su aplicación «se ejecuta en la nube», generalmente quiere decir que se ejecuta en una
máquina virtual — un ordenador que no existe físicamente como hardware dedicado,
pero que se comporta en todo como si lo hiciera.

Aquí está el mecanismo.

Un servidor físico en un centro de datos de AWS tiene muchos recursos: núcleos de CPU, memoria, disco
y ancho de banda de red. AWS toma ese servidor físico y lo divide usando un software
llamado **hipervisor**. El hipervisor crea múltiples máquinas virtuales, cada una
aparentemente con su propia CPU, memoria y disco dedicados — pero en realidad compartiendo el
hardware físico subyacente.

Cada una de esas máquinas virtuales es lo que AWS llama una **instancia EC2**.

EC2 son las siglas de Elastic Compute Cloud. La parte «elástica» es importante, y llegaremos
a ella. Por ahora: una instancia EC2 es un ordenador que alquilas por horas. Tiene un sistema
operativo, una conexión de red y potencia informática. Ejecuta tu aplicación igual que
un servidor físico.

La analogía: alquilar un apartamento en un edificio grande frente a comprar una casa.

El propietario del edificio (AWS) mantiene la estructura física, la fontanería, la electricidad,
la seguridad. Tú obtienes una unidad. La amueblas como quieras. Pagas mensualmente (o
por horas). Cuando necesitas más espacio, te mudas a una unidad más grande. Cuando te mudas,
dejas de pagar.

**Elegir Tu Instancia: El Tamaño Importa**

No todas las instancias EC2 son iguales. AWS ofrece cientos de tipos de instancia, organizados
en familias según para qué están optimizadas.

**Uso general** (p. ej., `t3`, `m6i`): CPU y memoria equilibradas. Buena elección predeterminada
para la mayoría de las aplicaciones web.

**Optimizado para cómputo** (p. ej., `c7g`): Más CPU en relación con la memoria. Bueno para la codificación de vídeo,
el modelado científico, el procesamiento por lotes.

**Optimizado para memoria** (p. ej., `r7i`): Más memoria en relación con la CPU. Bueno para bases de datos,
almacenamiento en caché, análisis en memoria.

**Optimizado para almacenamiento** (p. ej., `i3`): Almacenamiento local de alta velocidad. Bueno para cargas de trabajo intensivas en datos
que necesitan E/S de disco muy rápida.

**Cómputo acelerado** (p. ej., `p4`): GPUs adjuntas. Bueno para el entrenamiento de aprendizaje automático
y el renderizado gráfico.

Cada familia tiene tamaños. Un `t3.micro` tiene 2 CPU virtuales y 1 GB de memoria. Un
`t3.xlarge` tiene 4 CPU virtuales y 16 GB. Eliges el tamaño correcto para la carga de trabajo.

Leo había elegido un `t3.micro`.

«¿Cuántos usuarios puede manejar un `t3.micro`?» preguntó Tom.

«Depende de la aplicación», dijo Leo. «Pero probablemente no cien usuarios simultáneos
ejecutando subidas de imágenes y consultas a la base de datos.»

Tom escribió «t3.micro» en la pizarra y dibujó una cara triste al lado.

**La AMI: El Estado Inicial de Tu Máquina**

Antes de lanzar una instancia EC2, eliges su sistema operativo y la configuración inicial.
En AWS, esto se llama una **Amazon Machine Image** (AMI, o Imagen de Máquina de Amazon).

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

**Ciclo de Vida de la Instancia: No Para Siempre**

Esto es algo que muchos principiantes pasan por alto.

Las instancias EC2 no son permanentes de forma predeterminada. Cuando detienes una instancia, el recurso
informático se libera. Cuando la vuelves a iniciar, puede ejecutarse en hardware físico diferente. Los datos almacenados
*en la propia instancia* (en su volumen raíz) sobreviven a un ciclo de parada/inicio — pero la dirección IP pública cambia.

Cuando *terminas* una instancia, desaparece. A menos que tengas almacenamiento separado adjunto
(lo que cubrimos en el Capítulo 6), cualquier dato en la instancia desaparece.

Esta «efemeralidad» es en realidad una característica, no un defecto. Significa que puedes arrancar
servidores, usarlos y desecharlos. Permite el escalado horizontal. Pero también
significa que nunca debes almacenar datos importantes *en* la propia instancia EC2.

¿Dónde viven los datos, entonces?

En almacenamiento separado. Llegaremos a eso en los próximos dos capítulos.

**Qué Significa «Elástico»**

Dijimos que EC2 son las siglas de Elastic Compute Cloud. ¿Qué tiene de elástico?

Dos cosas:

**Elasticidad vertical**: Puedes cambiar el tamaño de una instancia. Detén la instancia,
cámbiala de `t3.micro` a `t3.xlarge`, reiníciala. Más CPU y memoria, misma
aplicación, misma configuración.

**Elasticidad horizontal**: Puedes añadir más instancias. En lugar de un servidor grande,
ejecuta diez servidores medianos detrás de un balanceador de carga. Cuando el tráfico baja, elimina instancias
y deja de pagar por ellas.

Ambos enfoques resuelven el problema de «un servidor, demasiado tráfico». Tienen
diferentes concesiones, que exploramos en el Capítulo 7 cuando añadimos Auto Scaling a la historia.

La conclusión clave: con EC2, la potencia informática es algo que *ajustas* en lugar de algo que
*compras*. ¿Necesitas más? Sube el dial. ¿Necesitas menos? Bájalo. Paga en consecuencia.

## Fortalezas y Limitaciones

**Por qué EC2 es potente**:

- Control total. Tú eliges el SO, el software, la configuración. Es tu ordenador.
- Tamaño flexible. Cientos de tipos de instancia para cada caso de uso.
- Sin hardware que gestionar. AWS se encarga de la capa física.
- Facturación por segundos (para la mayoría de los tipos de instancia). Detienes la instancia, dejas de pagar.
- Funciona con todo. EC2 es la base sobre la que se construyen la mayoría de los demás servicios de AWS.

**Donde se complica**:

- Eres responsable de parchear y actualizar el sistema operativo. (Modelo de Responsabilidad Compartida
  — esta es la parte «en la nube» que te corresponde.)
- Gestionar EC2 a escala implica gestionar el estado de las instancias, las AMIs, los parches de seguridad y el
  ciclo de vida a través de potencialmente miles de máquinas. Eso es sobrecarga operativa.
- EC2 no es la respuesta correcta para todo. Para código basado en eventos que se ejecuta
  con poca frecuencia, Lambda (Capítulo 20) es más barato y más sencillo. Para cargas de trabajo en contenedores,
  ECS y EKS (Capítulo 21) ofrecen mejor eficiencia de recursos.
- Las instancias no utilizadas siguen costando dinero. Si detienes una instancia, dejas de pagar el cómputo
  — pero si tienes almacenamiento adjunto, todavía pagas por eso.

## Resumen

- Una **instancia EC2** es una máquina virtual que alquilas en AWS. Tiene un SO, acceso a la red
  y recursos informáticos.
- Los tipos de instancia están organizados por caso de uso: uso general, optimizado para cómputo,
  optimizado para memoria, optimizado para almacenamiento, cómputo acelerado. Elige la familia
  y el tamaño correctos para tu carga de trabajo.
- Una **AMI** (Amazon Machine Image) es la plantilla para el SO e la configuración inicial
  de tu instancia. Las AMIs personalizadas permiten despliegues consistentes y repetibles.
- Los **pares de claves** son la forma segura de acceder a las instancias EC2. Sin contraseñas.
- Las instancias EC2 no son permanentes de forma predeterminada. Las instancias terminadas pierden sus datos.
  Almacena los datos importantes en servicios de almacenamiento separados.
- «Elástico» significa que puedes escalar el cómputo hacia arriba y hacia abajo — tanto verticalmente (instancias más grandes)
  como horizontalmente (más instancias).

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
  Esto cuesta dinero si asignas una y no la usas.
- Los modelos de precios **bajo demanda, reservado y spot** se evalúan mucho en el Dominio 4.
  Los cubrimos en el Capítulo 27. Por ahora, sabe que bajo demanda significa pagar por segundo
  sin compromiso.

## Ejercicios

**Ejercicio 1 — Recordar**

Con tus propias palabras: ¿qué es una instancia EC2? ¿Qué es una AMI? ¿Cuál es la relación
entre ellas?

*(Pista: Piensa en la analogía de la receta — ¿cuál es la receta y cuál es el plato?)*

**Ejercicio 2 — Práctica de Examen**

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
por euro para las cargas de trabajo intensivas en CPU. Auto Scaling ajusta automáticamente el número
de instancias según la carga — añadiendo instancias durante los eventos de venta, eliminándolas cuando
el tráfico vuelve a la normalidad. Esta combinación optimiza tanto el rendimiento como el coste.

**¿Por qué no A?** Las instancias optimizadas para memoria están diseñadas para cargas de trabajo que necesitan grandes
cantidades de RAM (bases de datos, cachés en memoria). Esta es una carga de trabajo intensiva en CPU. Y un número fijo
de instancias significa o bien un aprovisionamiento excesivo (desperdicio) o un aprovisionamiento insuficiente (fallo).

**¿Por qué no C?** Las instancias de uso general sacrifican algo de eficiencia de CPU por el equilibrio. Para
una carga de trabajo intensiva en CPU conocida, la optimización para cómputo es más apropiada. Y una única
instancia grande es un único punto de fallo.

**¿Por qué no D?** El cuello de botella es la CPU, no la E/S de disco. Las instancias optimizadas para almacenamiento
están diseñadas para cargas de trabajo que necesitan un alto rendimiento en el almacenamiento local.

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

Leo pasó la tarde redimensionando el servidor. Pasó de un `t3.micro` a un `t3.large`.
La CPU bajó al 30%. Las páginas cargaban en menos de un segundo.

Tom observaba la factura de AWS actualizarse en tiempo real. La nueva instancia costaba cuatro veces más
por hora. Tomó nota.

Maya miraba algo más en su pantalla.

«Leo», dijo. «Mientras redimensionabas la instancia, el sitio web estuvo caído doce minutos.»

Leo levantó la vista.

«Teníamos una cola de doscientos pedidos sin completar.»

Miró la pantalla. Luego al techo. Luego de vuelta a la pantalla.

«Necesitamos algo para nuestras imágenes», dijo, cambiando ligeramente el tema. «Ahora mismo,
las fotos de menú subidas se guardan directamente en el servidor. ¿Las perdemos si redimensionamos o reiniciamos
la instancia?»

Priya ya sabía la respuesta.

En el próximo capítulo: dónde viven los archivos cuando no hay disco duro al que apuntar.
