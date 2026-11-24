# ADR-011 — Estética «Pizarra y fosforito»

- **Fecha:** 2026-11-19
- **Estado:** en prueba (rama `estetica-pizarra`, sale de `estetica-carpeta`)
- **Sustituye a:** [[decisiones/ADR-010-estetica-carpeta-profesional]]

## Contexto
Con «Carpeta profesional» la web seguía pareciéndose a LinkedIn, Facebook e InfoJobs. Lo que más se notaba no eran los colores, sino la **estructura**:
- secciones centradas en la barra superior, con icono y texto debajo (LinkedIn, Facebook);
- botones en forma de píldora en azul;
- la barra de «Me gusta / Comentar / Compartir / Enviar» a todo el ancho de la publicación;
- perfil con foto de portada y la foto redonda montada encima;
- iconos de colores en la caja de publicar (Facebook);
- buscador de Empleo copiado de InfoJobs (mayúsculas, «V» como flecha, bordes de 3 px).

Se pidió una estética completamente distinta y única, con una tipografía sencilla pero que destaque y que distinga títulos de subtítulos, con libertad para cambiar colores, letra, estética y funcionalidad.

## Decisión
- **Tema del mundo del estudiante:** pizarra (verde muy oscuro, `#2B5B4B` / `#1F4236`) y fosforito (`#FFE24A`). Fondo «papel» gris verdoso con fichas blancas de borde fino y sin sombras.
- **Lomo de cuaderno:** las secciones principales (Inicio, Social, Foros, Empleo) pasan a una columna fija de pizarra a la izquierda. La barra superior queda solo para el buscador y lo personal.
- **Fosforito = dónde estás:** la opción activa de la navegación (lomo, «Lo tuyo», barra del móvil, mensajes y avisos) lleva una pastilla amarilla con las esquinas un poco irregulares, como un trazo de rotulador.
- **Tipografía:** Bricolage Grotesque para títulos (h1, h2) y cifras; Instrument Sans para subtítulos (h3, h4) y texto. Así se distinguen por la letra y no solo por el tamaño.
- **Secciones:** Social en pizarra, Empleo en ocre y Foros en lacre. Sin azul ni violeta.
- **Formas:** botones de 8 px de radio (adiós a las píldoras), tarjetas de 10 px.
- **Cambios de funcionamiento:**
  - Acciones de las publicaciones compactas a la izquierda, neutras en reposo; «Me gusta» con corazón. **Guardar** sale como botón directo en cada publicación (antes solo estaba en el menú «···»).
  - Perfil con cabecera tipo carné (sin portada) y cifras grandes.
  - Buscador de Empleo en una ficha con «Qué buscas» / «Dónde» / «Buscar ofertas».
  - Portada nueva: titular grande y una pizarra con lo que pasa en StudyHub.
- La skill `.claude/skills/studyhub-ui` se actualiza con las reglas nuevas.

## Alternativas
| Opción | Por qué no |
|---|---|
| Quedarse con «Carpeta profesional» y cambiar solo colores | La estructura seguía siendo la de LinkedIn/Facebook; cambiar el color no basta |
| Fondo crema con titulares con remates y acento terracota | Es la estética que hoy se reconoce como «hecha por IA» |
| Negro con un único acento verde ácido | Igual de genérica, y demasiado agresiva para que confíen las empresas |
| Volver a «Carpeta» original (bordes negros, sombras desplazadas) | Ya se descartó por infantil |

## Consecuencias
- Cambian los valores de los tokens, pero no sus nombres: las pantallas que usan tokens se adaptan solas.
- Nuevos tokens: `mark`, `on-mark`, `mark-soft`, `spine`, `spine-ink`, `spine-strong`, `board` y el radio `--radius-btn`.
- Todas las parejas de texto y fondo cumplen WCAG AA en los dos temas (ver [[diseno/sistema-diseno]]).
- [[decisiones/ADR-004-empleo-estilo-infojobs]] sigue valiendo para el **funcionamiento** de Empleo (filtros, orden, paginación), pero ya no para su aspecto.
- Capturas en `assets/pantallas-v8-pizarra/`.
