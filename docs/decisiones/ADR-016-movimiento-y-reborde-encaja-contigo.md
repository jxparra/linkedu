# ADR-016 — Trazo de fosforito en el lomo, búsqueda sin parpadeo y reborde «encaja contigo»

- **Fecha:** 2026-11-24
- **Estado:** aceptada
- **Amplía:** [[decisiones/ADR-012-movimiento-y-3d]] y [[decisiones/ADR-015-color-por-seccion-y-menos-columnas]]

## Contexto
- **Fallo del lomo:** al cambiar de sección, el fosforito se deslizaba de la sección anterior a la nueva. Por el camino pasaba por encima de las secciones intermedias (de Inicio a Empleo tapaba «Social» y «Foros», con el texto claro sobre amarillo). Además, el icono de destino se ponía oscuro antes de que llegara el fosforito y quedaba casi invisible sobre la pizarra.
- **Empleo:** cada búsqueda vaciaba la lista y pintaba esqueletos. La lista daba un salto y no se notaba qué había cambiado.
- Se pidió destacar lo que **encaja contigo**: ofertas de tus estudios, tus foros con actividad y los grupos sugeridos «para ti».

## Decisión
1. **Lomo:** el fosforito ya no viaja. En la sección nueva se pinta de izquierda a derecha (`scaleX` desde el borde izquierdo, 360 ms, `--ease-expo`), como un trazo de rotulador, y el icono crece un poco a la vez. Solo se anima al cambiar de sección, no al recargar (`Spine.tsx` recuerda la sección anterior).
2. **Búsqueda de Empleo:**
   - Mientras llega la búsqueda nueva, los resultados anteriores se quedan atenuados (45 %) y una barra fina en ocre recorre la cabecera de los resultados.
   - Al llegar, las primeras cinco tarjetas suben escalonadas (45 ms entre cada una) y el número de ofertas da un pequeño salto.
   - Si los resultados quedan por debajo de la pantalla, la página baja con suavidad hasta ellos.
   - Se descartan las respuestas que llegan tarde (si buscas dos veces seguidas, gana la última).
3. **Reborde «encaja contigo»** (`.match-ring` + `.match-empleo` / `.match-foros` / `.match-social`): un trazo de 2 px del color saturado de la sección, que se «enciende» una vez al aparecer.
   - **Ofertas** con `matches_studies` (abiertas), en ocre.
   - **Tus foros** con publicaciones esta semana, en lacre. Salen primero y dicen «N publicaciones esta semana».
   - **Grupos de «Sugerencias para ti»**, en pizarra.
4. **Otros movimientos:**
   - Los desplegables (sugerencias de puestos, provincia, autocompletado y menú de tu foto) aparecen con una escala corta desde su origen (`.pop-in`, 180 ms).
   - Las estanterías de grupos y la lista de «Tus foros» entran escalonadas (`.stagger-in`).

Todo usa solo `transform` y `opacity` y tiene su versión con `prefers-reduced-motion` (un fundido corto, sin desplazamiento).

## Por qué
- El trazo encaja con la metáfora del fosforito y no pasa por encima de nada. Es lo que hacía que el deslizamiento pareciera un fallo.
- En la búsqueda, conservar la lista y atenuarla mantiene el contexto. La entrada escalonada enseña qué es nuevo sin animar el resto de la página.
- El reborde usa el color de la sección (≥ 3:1 sobre la tarjeta en claro y en oscuro: ocre 4,29:1, lacre 5,49:1, pizarra 6,35:1). No añade sombras ni pinta la tarjeta entera, como pide ADR-015.

## Comprobación
- `tsc` y `eslint` sin errores; `audit_colors.py` sin avisos.
- Fotogramas del lomo durante la navegación y capturas en `docs/assets/pantallas-v6/`.
