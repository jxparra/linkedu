# ADR-012 — Movimiento y escenas 3D

- **Fecha:** 2026-11-19
- **Estado:** en prueba (rama `estetica-pizarra`)
- **Amplía:** [[decisiones/ADR-011-estetica-pizarra-fosforito]]

## Contexto
Se pidió una interfaz más dinámica y espectacular: animación 3D de fondo en el inicio, movimiento en la interfaz y algo original en Social, Foros y Empleo. Tenía que seguir siendo usable a diario, rápida y accesible.

## Decisión
- **Three.js** (`three@0.170.0`) para escenas 3D hechas con figuras simples, sin modelos descargados. Cada sección tiene la suya, con objetos de su tema:

| Escena | Dónde | Qué se ve |
|---|---|---|
| `estudio` | Portada (detrás de la pizarra) e Inicio (fondo fijo, al 55 %) | Fichas con franja de pizarra, lápices de fosforito, libros y polvo de tiza |
| `social` | Cabecera de Social | Una red de personas: nodos unidos por líneas; algunos «laten» en fosforito |
| `foros` | Cabecera de Foros | Bocadillos de conversación que suben, con los puntos de «escribiendo…» |
| `empleo` | Cabecera de Empleo | Maletines y currículums flotando |

- La cámara sigue un poco al ratón (paralaje). Los colores salen de los tokens y cambian con el modo oscuro.
- **Rendimiento:** Three.js va en un trozo aparte que se carga después de pintar la página (`next/dynamic`, sin SSR). La escena se para fuera de pantalla o en otra pestaña, limita la resolución a 1,5× y, si no hay WebGL, la página se ve igual sin ella.
- **Cabecera de sección** (`components/SectionHero.tsx`): pizarra con la escena a la derecha y el título con un **subrayado de tiza que se dibuja** al entrar.
- **Movimiento de la interfaz** (CSS, solo `transform` y `opacity`):
  - El **fosforito del lomo se desliza** de una sección a otra al navegar.
  - El contenido entra con un fundido y sube 8 px al cambiar de página (una sola entrada, no tarjeta a tarjeta).
  - Las **tarjetas de grupos y ofertas se inclinan** hacia el ratón con un brillo de fosforito (`lib/useTilt.ts`). Solo con ratón.
  - Los botones se hunden al pulsar (`scale(0.97)`).
  - Portada: titular, texto, botones y pizarra entran en secuencia; la pizarra está girada en 3D y sus fichas se mecen.
- **Ofertas como resguardo:** el sueldo sale en grande a la derecha, tras una línea troquelada.
- Con «reducir movimiento», las escenas se quedan quietas (un solo fotograma), no hay inclinación ni deslizamientos, y las entradas son solo fundidos.

## Alternativas
| Opción | Por qué no |
|---|---|
| React Three Fiber | Más cómodo, pero añade dos dependencias para cuatro escenas sencillas |
| Modelos GLTF descargados | Más peso y licencias que revisar; las figuras simples encajan con el estilo plano |
| Animar cada tarjeta del feed al aparecer | Se ve en cada visita y cansa; distrae de leer |
| `framer-motion` / `motion` | Todo lo que hace falta se resuelve con CSS, sin otra librería |

## Consecuencias
- Nueva dependencia: `three` (≈ 150 kB comprimido, solo en las páginas con escena y después de pintar).
- `npx next build` compila sin errores. **No** ejecutarlo con `npm run dev` en marcha: sobrescribe `.next` y el servidor de desarrollo se queda sin estilos (hay que pararlo, borrar `.next` y volver a arrancar).
