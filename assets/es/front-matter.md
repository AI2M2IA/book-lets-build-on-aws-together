\newpage

*Copyright © 2026 AI(2)M(2)IA*

*Este libro es gratuito. Eres libre de leerlo, copiarlo, traducirlo, adaptarlo y compartirlo — en cualquier idioma y en cualquier formato — sin costo, bajo la licencia Creative Commons Atribución-NoComercial-CompartirIgual 4.0 Internacional (CC BY-NC-SA 4.0).*

*En términos sencillos: no puedes vender este libro ni nada que hagas a partir de él, y no puedes ponerlo tras un muro de pago — el acceso debe permanecer siempre gratuito. Puedes pedir apoyo voluntario por tu trabajo, pero ese apoyo nunca puede ser una condición para leerlo.*

*Por ejemplo: si traduces este libro al esperanto y publicas tu versión, puedes invitar a los lectores a contribuir — pero cualquiera debe poder leer tu traducción sin pagar. Si creas un repositorio desde cero y armas una nueva guía de estudio sobre este contenido, rige la misma regla: donaciones, sí; un precio para el acceso, no.*

*El autor conserva el derecho de vender sus propias ediciones — por ejemplo, la edición Kindle de Amazon, cuya compra ayuda a financiar el próximo libro.*

*Este libro tiene complementos gratuitos. Lee la fuente, tradúcela o ayuda a mejorarla en el repositorio: https://github.com/AI2M2IA/book-lets-build-on-aws-together. Estudia gratis con la app de práctica (un juego): https://ai2m2ia.github.io/book-lets-build-on-aws-together. Mira los videos: https://www.youtube.com/playlist?list=PL9jytbqPPUEgTdZvVIdHxtXahX8922oYN. Términos completos: LICENSE-CONTENT (el texto del libro, CC BY-NC-SA 4.0) y LICENSE (el código, AGPL-3.0).*

*La historia de Nimbus y sus personajes es ficticia. Cualquier parecido con personas
reales, vivas o fallecidas, o con eventos reales es pura coincidencia.*

*Los servicios de AWS, los modelos de precios, las mejores prácticas y el contenido del examen descritos en
este libro se basan en documentación disponible públicamente a la fecha de publicación.
Amazon Web Services, AWS y las marcas relacionadas son marcas comerciales de Amazon.com, Inc.
o sus filiales. Este libro es un recurso educativo independiente y no está
afiliado, avalado ni patrocinado por Amazon Web Services.*

*Los precios de AWS y las características de los servicios cambian con frecuencia. Siempre verifica la información
actualizada en aws.amazon.com antes de tomar decisiones arquitectónicas o financieras.*

*El examen AWS Solutions Architect Associate (SAA-C03) es un examen de certificación real.
Visita aws.amazon.com/certification para registrarte.*

*Primera edición, 2026*

*Impreso y distribuido a través de Amazon KDP*

---

\newpage

# Una Nota Sobre el Método

Este libro fue escrito con asistencia de IA y se publica bajo el seudónimo AI(2)M(2)IA, en consonancia con la práctica de todos los volúmenes de esta colección.

El programa que estás a punto de seguir — su premisa, sus personajes, la forma en que la infraestructura de Nimbus evoluciona desde la línea telefónica de un restaurante hasta una arquitectura de AWS lista para producción, las concesiones que el equipo hace bajo presión y las que primero se equivocan — todo eso fue elegido por un autor humano y desarrollado, servicio por servicio, a través de una larga colaboración con un gran modelo de lenguaje. La portada fue diseñada con la ayuda de un modelo de generación de imágenes bajo la misma dirección. El propio ebook fue preparado con herramientas automatizadas.

Lo que lees es lo que se conservó.

En estas páginas no se reclama autoría sin asistencia; tampoco se afirma que la máquina sea el autor en solitario. La obra, como la infraestructura que describe, se sostiene en capas que dependen unas de otras.

---

\newpage

*Para todos los que abrieron un navegador, escribieron un comando e hicieron funcionar algo —
y para todos los que abrieron un navegador, escribieron un comando y aprendieron de lo que
no funcionó.*

---

\newpage

# Prefacio

Probablemente ya hayas intentado aprender AWS antes.

Quizás abriste la documentación y, diez minutos después, te encontraste mirando la sintaxis de políticas de IAM antes de entender siquiera para qué servía IAM.

Quizás terminaste un videocurso y te diste cuenta de que todavía no podías explicar dónde vive realmente un sitio web.

Quizás subrayaste una guía de examen, memorizaste nombres de servicios y luego te quedaste en blanco la primera vez que un escenario preguntaba qué harías si una base de datos fallara durante la hora punta de la cena.

Eso no es culpa tuya.

Así es como se suele enseñar la computación en la nube: primero como catálogo, y como sistema después.

Este libro funciona de otra manera.

**No estudiarás AWS. Lo usarás.**

Comenzamos con un restaurante que pierde pedidos porque la línea telefónica está ocupada y no tiene sitio web.

A partir de ahí, seguirás a Maya, Tom, Priya y Leo mientras construyen la infraestructura de Nimbus una decisión a la vez. No en el orden ordenado que preferiría un programa de certificación, sino en el orden caótico que exigen los sistemas reales.

Al final, Nimbus estará gestionando 18.000 pedidos diarios: funcionando en múltiples Zonas de Disponibilidad, recuperándose automáticamente de los fallos, sirviendo a los usuarios de la Costa Oeste en milisegundos a través de una red de entrega de contenido, procesando cada pedido a través de un pipeline de análisis en tiempo real y manteniendo los costes bajo control a medida que la arquitectura crece junto con el negocio.

Cada servicio de AWS en este libro aparece en el momento en que se vuelve necesario. No porque lo exija un programa. Porque lo exige el sistema.

**Para quién es este libro** Si aprendes mejor a través de problemas que a través de documentación, este libro fue escrito para ti. Si te estás preparando para la certificación AWS Solutions Architect Associate (SAA-C03), este libro también es para ti: se cubren todos los dominios del examen y cada capítulo termina con Consejos para el Examen y preguntas de práctica al estilo SAA-C03. Si ya trabajas en ingeniería y quieres entender *por qué* funcionan las decisiones arquitectónicas, no solo cómo se llaman los servicios, encontrarás ese razonamiento en cada página.

**Lo que no encontrarás aquí** Un atajo. Este no es un resumen para memorizar. Es más largo que ese tipo de guía porque comprender lleva más tiempo que memorizar, y es la comprensión la que se transfiere a tu próximo puesto, tu próximo sistema y el incidente de producción que nadie documentó correctamente.

**Cómo leer este libro** Léelo como una novela la primera vez. Deja que la arquitectura se revele a medida que el equipo se encuentra con problemas reales y toma decisiones reales. Al final de cada capítulo, detente y usa los Consejos para el Examen y los ejercicios activamente: cubre las respuestas, razona el escenario tú mismo y solo entonces comprueba qué ocurrió.

Cuando termines, Nimbus estará en producción. También lo estará tu comprensión de AWS.

Empecemos.
