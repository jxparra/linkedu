---
name: studyhub-ui
description: Estética y usabilidad del frontend de StudyHub (Next.js 15 + Tailwind 4) con el sistema «Carpeta profesional» (azul petróleo) — llamativo pero profesional, distinto de LinkedIn e InfoJobs, contraste WCAG AA y modo claro/oscuro mediante tokens de globals.css. Úsala SIEMPRE que se cree, rediseñe o retoque cualquier pantalla, componente, color, tipografía, botón, tarjeta, menú o estado vacío de StudyHub, cuando se pida «mejorar la interfaz», «que quede más bonito», «modo oscuro», «más profesional» o «más llamativo», y antes de dar por terminado cualquier cambio visual en frontend/src, aunque el usuario no mencione la estética.
---

# StudyHub UI

StudyHub es una red social para estudiantes y empresas (TFC). La interfaz tiene que hacer dos cosas a la vez: **llamar la atención** de un estudiante y **dar confianza** a una empresa que va a publicar una oferta. Por eso el sistema se llama «Carpeta profesional»: tiene personalidad (azul petróleo, un color por sección, ámbar para destacar), pero el ruido está controlado (fondo gris claro con tarjetas blancas, bordes finos, sombras suaves, títulos sobrios).

Toda la interfaz está en español. La documentación del diseño está en `docs/diseno/sistema-diseno.md` y las decisiones en `docs/decisiones/` (vault de Obsidian).

## Lo que ya se probó y no funcionó

Esto da contexto a las reglas de abajo:
- **Azul cobalto y blanco** (la primera versión): se confundía con LinkedIn. El azul actual es **petróleo** (#1F6F8B), más verdoso y apagado; no lo acerques al azul puro de LinkedIn (#0A66C2).
- **Carpeta original** (bordes negros de 2 px, sombras desplazadas, barra amarilla, títulos en Unbounded): era llamativa pero parecía una app infantil. El usuario dijo que perdía profesionalidad.
- **Coral** como color principal: funcionaba, pero el usuario prefirió un tono azulado.

La versión actual está entre las dos. Si una propuesta acerca la web a alguno de esos extremos, avísalo antes de aplicarla.

## Dónde vive el sistema

- `frontend/src/app/globals.css`: todos los tokens en `@theme` (modo claro) y su versión oscura en `:root[data-theme="dark"]`. Las utilidades de Tailwind leen esas variables, así que **cambiar el tema solo cambia valores**: los componentes no necesitan `dark:`.
- Las reglas de componentes globales (tarjetas, botones) van **fuera de `@layer`**. Dentro de `@layer base`, cualquier utilidad de Tailwind (`border-line`, `shadow-…`) las pisa.
- `frontend/src/lib/theme-script.ts` aplica el tema antes de pintar (sin parpadeo) y `frontend/src/lib/theme.ts` (`useTheme`) lo cambia desde Ajustes → Visualización.
- Fuentes en `app/layout.tsx`: **DM Sans** para el texto y **Plus Jakarta Sans** para los títulos (`font-display`, que se aplica sola a h1–h3).

## Tokens: cuál usar

| Para… | Usa | Nunca |
|---|---|---|
| Fondo de la app / de tarjetas | `bg-page` / `bg-card` | `bg-white`, `bg-gray-*` |
| Texto principal / secundario / terciario | `text-ink` / `text-ink-muted` / `text-ink-subtle` | `text-black`, `text-gray-*` |
| Separadores y bordes finos | `border-line` | `border-gray-*` |
| Botón principal | `bg-brand-600 text-on-brand hover:bg-brand-hover` | `text-white` sobre `brand-600` (en oscuro el azul es claro y el texto va oscuro) |
| Enlaces y texto de color | `text-brand-700` | `text-brand-600` como texto pequeño |
| Fondos suaves de marca | `bg-brand-50` | |
| Botón secundario | `btn-pop bg-card text-ink hover:bg-page` (o `<Button variant="secondary">`) | |
| Campos, buscadores, iconos redondos | `bg-field hover:bg-field-hover`, texto `text-field-text` | |
| Fondo oscuro con texto claro (chips, avatares) | `bg-ink text-inverse` | `bg-ink text-white` |
| Capas sobre fotos | `bg-black/50 text-white` (las fotos no cambian con el tema) | `bg-ink/50` |
| Estados | `text-success`, `text-warning`, `text-danger`, `bg-red-50`, `bg-green-50` (tienen versión oscura) | |
| Botón o globo rojo (borrar, salir, no leídos) | `bg-danger text-on-danger` | `text-white` (en oscuro el rojo es claro) |

**Color por sección:** Social = azul petróleo (`social`, el de la marca), Empleo = verde (`empleo`), Foros = violeta (`foros`). Cada uno tiene `-50` (fondo suave) e `-ink` (icono y texto). Se usan **en pequeñas dosis**: la sección activa de la navegación, una etiqueta o un icono. Ejemplo: `bg-empleo-50 text-empleo-ink`. No pintes tarjetas enteras ni cabeceras con el color saturado, porque es justo lo que hizo infantil la primera versión.

Si necesitas un color nuevo, añádelo como token en los **dos** bloques de `globals.css` (claro y oscuro) y comprueba su contraste. Un color que solo existe en un tema es el fallo más típico del modo oscuro.

## Componentes

- **Tarjetas:** `rounded-card border border-line bg-card`. El borde fino y la sombra suave se añaden solos desde `globals.css`. No añadas `shadow-*` sueltas.
- **Botones:** usa `components/Button.tsx` (`primary`, `secondary`, `ghost`) siempre que puedas. Altura mínima de 44 px (`min-h-11`), porque se usa mucho en el móvil.
- **Navegación:** la opción activa lleva el fondo suave de su sección. La inactiva va en `text-ink-muted`. Si dos rutas empiezan igual (`/social` y `/social/foros`), se marca la más concreta.
- **Dejar de seguir / salir de un grupo o foro:** siempre se puede deshacer lo que se hace con un botón de «+» o «Unirme». Antes de salir se pide confirmación con `components/UnfollowDialog.tsx` (`kind="person" | "group" | "forum"`), nunca con `window.confirm`.
- **Estados vacíos:** dicen qué falta y qué hacer, con un botón de acción («Aún no estás en ningún foro. Mira los de tus estudios»).

## Llamativo, pero con criterio

Pon la personalidad en **un sitio por pantalla** y deja tranquilo el resto. Buenos sitios:
- La portada de un grupo o foro (degradado con icono de su temática, `lib/groups.ts`)
- Una microinteracción (el confeti del «me gusta», el botón que se hunde un píxel al pulsarlo)
- Un número o titular importante en `font-display`

No uses: emojis como iconos de sección, degradados morado-azul, texto centrado en todo, ni más de un color saturado por bloque.

## Antes de dar por terminado un cambio visual

1. **Busca colores fijos** en lo que has tocado:
   `python .claude/skills/studyhub-ui/scripts/audit_colors.py frontend/src`
   Lista `bg-white`, `text-white` sobre `brand-600` o `danger`, colores de Tailwind por defecto y hex sueltos. Algunos están justificados (iconos de Google o Microsoft, capas sobre fotos), pero cada uno tiene que tener su motivo.
2. **Comprueba el contraste** de cada color nuevo o cambiado, en claro **y** en oscuro:
   `python .claude/skills/studyhub-ui/scripts/contrast.py "#c9401c" "#ffffff"`
   Mínimo: 4,5:1 para el texto normal y 3:1 para el texto grande (≥ 18,66 px en negrita) y los iconos.
3. **Pasa el chequeo de tipos y el lint:** `npx tsc --noEmit -p .` y `npx eslint src` dentro de `frontend/`.
4. **Mira la pantalla en los dos temas.** Con la app en marcha, pon `localStorage.studyhub_theme` en `"light"` y luego en `"dark"` y haz una captura de cada uno (Chrome está en `C:/Program Files/Google/Chrome/Application/chrome.exe`; `playwright-core` sirve para automatizarlo). En Git Bash, usa `MSYS_NO_PATHCONV=1` o convertirá `/inicio` en una ruta de Windows. Mira también el ancho de móvil (390 px).
5. **Documenta** según las convenciones del vault: nota del día en `docs/diario/`, un ADR si has tomado una decisión de diseño y `docs/diseno/` si cambia una pantalla. Las capturas van a `docs/assets/pantallas-vN/`.

## Sobre cambiar de framework

Si alguien propone pasar a Angular (u otro framework) «por la estética», explica que el aspecto lo dan los tokens, las fuentes y los componentes, no el framework. Cambiar obligaría a rehacer todo el frontend sin ninguna ganancia visual.
