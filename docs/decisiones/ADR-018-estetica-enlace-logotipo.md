# ADR-018 — Estética «Enlace»: la web toma los colores del logotipo

- **Fecha:** 2026-11-25
- **Estado:** aceptada
- **Sustituye:** [[decisiones/ADR-011-estetica-pizarra-fosforito]] en el color (la estructura de ADR-014, 015, 016 y 017 se mantiene)

## Contexto
Llega el logotipo definitivo (`Logotipo.png`): dos eslabones enlazados, uno azul (`#005cc6`) y otro naranja (`#fd8b00`), y el nombre «LinkeDu» con «Linke» en azul y «Du» en naranja. Se pidió adaptar toda la web a él, con una visual clara y armoniosa que no sature, y rehacer la portada.

ADR-011 había descartado el azul como color de marca porque recordaba a LinkedIn. El logo obliga a recuperarlo, así que la diferencia tiene que venir de lo demás:
- **El naranja** como segundo color (LinkedIn no lo usa), en lo activo y en lo que hay que mirar.
- **La estructura propia que ya teníamos:** el lomo oscuro a la izquierda, nada de secciones arriba con icono, botones no píldora, cabeceras de sección con escena 3D.
- **El lomo en azul noche** (`#0b2552`), no en el azul del logo, y fondo de papel frío casi blanco.

## Decisión
- **Marca:** azul del logo (`brand-600 #005cc6`, texto blanco 6,28:1). Enlaces en `brand-700 #0050ad` (7,63:1). En oscuro, el azul se aclara (`#7db2ff`) con texto oscuro encima.
- **Lo activo:** el token `mark` (antes fosforito) pasa a naranja `#ff9f2e` con texto `#14213d` (7,8:1). Se mantiene el nombre para no tocar cada componente.
- **Neutros:** tinta azul noche (`#14213d`), papel `#f5f7fb`, bordes `#e2e7ef`. En oscuro, `#0d1320` y tarjetas `#151c2c`.
- **Color por sección:** Social = azul (el de la marca), Empleo = naranja (el del logo), Foros = verde azulado (`#0e7778`), que armoniza con los dos sin competir. Docente sigue en violeta.
- **Portadas de temas** (`lib/groups.ts`): se quitan magentas y rojos; todo dentro de la familia azul, verde azulado, naranja, violeta y gris azulado, con el icono blanco a 3:1 o más.
- **Radios algo más amables:** tarjetas 14 px, botones y campos 10 px. La pastilla activa deja de ir torcida (era un guiño al fosforito).
- **Logotipo** en `frontend/public/`: `logo.png` (claro), `logo-dark.png` (azul aclarado para el modo oscuro), `logo-mark*.png` (solo los eslabones) y `src/app/icon.png` como favicon. `<Logo>` y `<BrandMark>` eligen la versión según el tema (`.logo-light` / `.logo-dark`); en el lomo, siempre la clara (`onDark`).
- **Portada nueva:** titular «Lo que estudias, enlazado con quien lo necesita» y, al lado, un estudiante y una oferta que entran desde los lados y se unen con los eslabones del logo y la etiqueta «Encaja contigo» (una sola animación de entrada). Después: las tres secciones con un ejemplo real de cada una, «Cómo funciona» en tres pasos, una ficha por tipo de cuenta (estudiante, empresa, docente) y un cierre en azul noche con el único botón naranja de la página.

## Consecuencias
- Los componentes no cambian: todo va por tokens. Cambiaron `globals.css`, `Logo.tsx`, `BrandMark` (`Spine.tsx`), `TopBar.tsx`, el icono de las notificaciones del sistema, los colores de respaldo de `Scene3D.tsx`, `lib/groups.ts` y `app/page.tsx`.
- Riesgo a vigilar: que el azul vuelva a parecerse a LinkedIn. Regla: el azul en botones y enlaces; superficies grandes en azul noche o papel, nunca en el azul del logo.
- Capturas: `docs/assets/pantallas-v9-logo/`.

## Cambio posterior (2026-11-25)
El lomo pasa de azul noche a **azul muy claro** (`--color-spine: #e6effc`, borde `line`, texto `ink-muted` / `ink`), a petición del autor: la barra lateral oscura pesaba demasiado. El azul noche queda para las cabeceras de sección y el cierre de la portada.
Ajuste final: un término medio entre los dos, `#a3b9de` (texto en tinta 8:1; el azul del logo, 3,15:1). El punto medio exacto (`#5b82c4`) no daba contraste ni con texto claro ni con oscuro.
Ajuste definitivo: el tono claro tampoco convenció y el lomo queda en **azul medio** `#2a5292`, con texto claro (tokens nuevos `rail-ink` `#d6e2f5`, 5,9:1, y `rail-strong` blanco, 7,7:1) y el logo en su versión aclarada (3,56:1).

Excepción a «sin sombras»: el nudo de eslabones de la portada lleva `shadow-lg shadow-black/5` porque flota sobre las dos fichas; las fichas no llevan sombra.

Ajuste final del lomo: un azul fijo no casaba con las cabeceras de Foros (verde azulado) y Empleo (naranja oscuro). El lomo usa ahora `bg-hero`, el color de la cabecera de cada sección, y lomo y cabecera forman una sola pieza. Se elimina el token `--color-spine`. Contraste: texto ≥ 5,9:1; logo y pastilla ≥ 3,5:1 en los tres colores y los dos temas.

Decisión definitiva del lomo: el autor prefiere **un único color** en toda la app. Queda en gris pizarra oscuro `#222c3c` (oscuro: `#151c2c`), casi neutro, que casa con las cabeceras azul, verde azulado y naranja. Vuelve el token `--color-spine`. Contraste: rail-ink 10,8:1, logo aclarado 6,5:1, pastilla naranja 6,9:1.

Ajuste: `#222c3c` resultó demasiado oscuro. Lomo en gris azulado medio `#465774` (rail-ink `#e4ecf8` 6,1:1; logo 3,8:1; pastilla 3,6:1) y cabeceras aclaradas un punto para acercarse a él: Social `#0a3a80`→`#134a90`, Foros `#0b5c5e`→`#0f6567`, Empleo `#7a3a00`→`#82420a`.

Decisión final del lomo (tras comparar cuatro opciones en capturas): **azul del logo liso** `#0a4fb0` en toda la app (oscuro `#173a78`). rail-ink 6,4:1; logo 3,9:1; pastilla 3,7:1. Las cabeceras vuelven a sus colores (`#0a3a80`, `#0b5c5e`, `#7a3a00`). Excepción consciente a «el azul del logo solo en botones y enlaces»: el lomo es estrecho y es la navegación; el resto de superficies grandes siguen sin ese azul.

**Cierre del lomo:** ninguna de las pruebas (azul muy claro, azul intermedio, azul medio, color de cada sección, gris pizarra, gris azulado, azul del logo) convenció. El lomo vuelve al **azul noche** original de esta estética: `#0b2552` (oscuro `#111a2e`), texto `rail-ink #b4c6e6` y `rail-strong #f4f7fc`. Se conservan los tokens `rail-*`.

**Lomo definitivo (a petición del autor):** blanco translúcido `rgba(255,255,255,.72)` con desenfoque y borde `edge`; en oscuro `rgba(24,32,58,.72)`. Iconos y textos en tinta (`rail-ink #2b3a55` 10,4:1, `rail-strong #14213d`), iconos con trazo 2 y logo en su versión normal.

Efecto de cristal: detrás del lomo solo había fondo liso y el desenfoque no se notaba. Se añaden `.spine-glow` (destello azul arriba y naranja a media altura, desenfocados) y `.spine-glass` (blanco 62→48 %, `blur(18px) saturate(160%)`, filo interior blanco) en `globals.css`, con versión oscura.

Cabeceras de Social, Foros y Empleo algo translúcidas (`.section-hero.bg-hero`): `color-mix` del color de la sección al 90 % en la zona del texto (contraste ≥ 4,9:1) y al 78 % a la derecha (pestañas ≥ 4,7:1), con un filo de luz arriba. Sin `backdrop-filter`, porque crearía un bloque contenedor para lo `fixed` de dentro. Se desactiva `.hero-text-veil`, que con el fondo translúcido dibujaba un corte. Vista previa descartada: el fondo de cristal en toda la web no gustó.

Cabeceras de cristal esmerilado **uniforme** (el degradado no gustó): `::before` con brillos blancos y naranja desenfocados en la zona de la escena 3D; `::after` con el color de la sección al 85 % en toda la superficie, grano fino (SVG feTurbulence al 7 %) y `backdrop-filter: blur(20px)` (en el pseudoelemento, no en la sección, para no romper lo `fixed`). Texto de Foros `#e2f6f5` y de Empleo `#ffe9cf` aclarados para mantener ≥ 4,9:1 sobre el 85 %.
