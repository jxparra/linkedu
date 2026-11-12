# Pantalla de inicio

## Diseño (Figma)
![[assets/pantallas-v2/inicio.png]]

## Estructura
| Zona | Contenido |
|---|---|
| Barra superior | Logo, buscador · Inicio / Social / Empleo · Mensajes, Notificaciones, Perfil |
| Izquierda | Usuario, Reels, Foros, Eventos, Guardados |
| Centro | Caja para publicar + feed de publicaciones |
| Derecha | Panel de tendencias |
| Móvil | Sin columnas laterales; barra inferior con Inicio, Social, Empleo, Foros, Perfil |

## Publicación
- Autor, etiqueta de curso (1º, 2º…), "Máster" o "Empresa"
- Estudios, centro y ciudad
- Tiempo, "Editado" y comunidad en la que se publicó
- Seguir · menú (Guardar, No me interesa, Eliminar si es tuya) · ocultar
- Texto recortado a 3 líneas con "…ver más"
- Me gusta · Comentar · Compartir · Enviar

## Cambios respecto al diseño
- **"Noticias" → "Publicaciones de interés"** (antes "Tendencias en StudyHub"). No hay una fuente real de noticias, y poner titulares inventados en la demo confundiría al tribunal. El panel usa publicaciones reales de StudyHub y se calcula para cada usuario (`GET /discover`):
  - **Publicaciones de interés** (3): de tu foro de estudios o de tu centro, de grupos de tus temas, de gente de tu carrera… Pesa más que estén relacionadas con tu perfil que lo populares que sean, y como mucho sale una por comunidad. Cada una dice por qué sale («De tu foro de DAW», «En Comunidad de IA»).
  - **Personas que quizá conozcas** (3): foto, nombre, el motivo (misma carrera, mismo centro, la siguen personas que sigues, grupos en común) y un botón «+» para seguir.
  - **Foros y grupos para ti** (3): alterna grupos de «Para ti» y foros de tus estudios o tu centro, con un botón «+» para unirte.

### Cabecera de las publicaciones (2026-11-12)
- **De una persona:** foto, **nombre en negro y más grande** (16 px, negrita), su etiqueta, sus estudios y la hora. Botón «+ Seguir».
- **De un grupo o foro:** la portada del grupo con la foto del autor pequeña en la esquina. Arriba, **el nombre del grupo**; debajo, más pequeño y más claro, quién lo publicó. En vez de «Seguir» sale **«+ Unirme»** si no eres miembro.
- Se quitó la «X» de ocultar, porque ya está «No me interesa» en el menú de los tres puntos.
- Tarjeta: borde fino que se oscurece al pasar el ratón, sombra muy suave y la línea de las acciones de lado a lado.
- **Caja para publicar** arriba del feed, que no estaba en el diseño.
- **Botón de mensajes**: icono de bocadillo en lugar del teléfono.
- **Rango de 768 a 1279 px:** el panel derecho se oculta para que el feed no quede estrecho.
- En móvil, "Seguir" se queda solo con el icono y la X pasa al menú "…".

## Crear publicación
Inspirado en el panel de Facebook. Se abre en el centro con el fondo oscurecido.

- **Dónde se publica:** "Público" o una de tus comunidades (sustituye al "Amigos" de Facebook)
- **Añadir a tu publicación:** 5 iconos + "…", que abre el panel con todas las opciones y botón de volver
- Opciones: Foto/vídeo · Etiquetar personas · Sentimiento/actividad · Registrar visita · GIF · Grabar vídeo
- **Quitadas a propósito:** "Recaudar dinero" y "Actualización de acontecimiento importante"
- **"Vídeo en directo" → "Grabar vídeo":** emitir en directo necesita un servidor de streaming, así que se graba con la cámara y se adjunta
- **GIF:** se sube un GIF propio; buscar en un catálogo (Giphy/Tenor) necesita una clave de API

## Buscador
Al pulsarlo se oscurece el resto de la pantalla y aparecen resultados de personas, empresas y comunidades.

## Avisos
Mensajes y notificaciones muestran un contador rojo **solo cuando hay algo sin leer**. Al abrir la página de notificaciones o una conversación se marcan como leídas.

## Panel de la publicación y comentarios
Inspirado en "Publicación de…" de Facebook. Se abre al pulsar **Comentar**, el número de comentarios o una foto de la galería.

- Cabecera "Publicación de {nombre}" + cerrar (también con Esc o pulsando fuera)
- La publicación completa: texto sin recortar y fotos/vídeos a tamaño grande
- Contadores de colores (me gusta · comentar · compartir) sincronizados con el feed
- **Ordenar:** Más pertinentes (más me gusta y respuestas) · Más recientes · Todos los comentarios
- **Cada comentario:** burbuja con nombre (etiqueta "Autor" si es quien publicó), hace cuánto, Me gusta, Responder, Compartir (copia un enlace) y contador de me gusta
- **Menú "…"** (aparece al pasar el ratón): Ocultar comentario · Denunciar comentario · Eliminar (si es tuyo o la publicación es tuya)
- **Respuestas:** un solo nivel, como Facebook; "Ver N respuestas" / "Ocultar respuestas"; al responder a otra persona se añade "@Nombre"
- **Caja de comentar** fija abajo: emojis, foto o GIF; Intro envía, Mayús+Intro hace salto de línea
- Enlace compartido: `/inicio?post=ID` abre directamente la publicación

## Galería multimedia
Hasta 10 fotos/vídeos por publicación. 1 → completo · 2 → dos columnas · 3 → una grande y dos pequeñas · 4 o más → cuadrícula con "+N". Los vídeos llevan botón de reproducir.
