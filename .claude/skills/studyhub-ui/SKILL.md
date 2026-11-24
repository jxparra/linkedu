---
name: studyhub-ui
description: Estética y usabilidad del frontend de StudyHub (Next.js 15 + Tailwind 4) con el sistema «Pizarra y fosforito» (verde pizarra, amarillo fosforito, lomo lateral) — único, nada parecido a LinkedIn, Facebook ni InfoJobs, contraste WCAG AA y modo claro/oscuro mediante tokens de globals.css. Úsala SIEMPRE que se cree, rediseñe o retoque cualquier pantalla, componente, color, tipografía, botón, tarjeta, menú o estado vacío de StudyHub, cuando se pida «mejorar la interfaz», «que quede más bonito», «modo oscuro», «más profesional» o «más llamativo», y antes de dar por terminado cualquier cambio visual en frontend/src, aunque el usuario no mencione la estética.
---

# StudyHub UI

> La app se llama ahora **Linkedu** (ADR-013): úsalo en todo texto visible. Los nombres internos (`studyhub_*` en el navegador, esta skill, las carpetas) no cambian.

StudyHub es una red social para estudiantes y empresas (TFC). La interfaz tiene que hacer dos cosas a la vez: **llamar la atención** de un estudiante y **dar confianza** a una empresa que va a publicar una oferta. El sistema se llama «Pizarra y fosforito» y sale del mundo del estudiante: la pizarra del aula (verde muy oscuro) es la marca y el fosforito con el que se subrayan los apuntes marca lo activo. El resto es «papel»: fondo gris verdoso con fichas blancas de borde fino, sin sombras. La personalidad está en tres sitios (el lomo, el fosforito y los títulos en Bricolage Grotesque); todo lo demás es tranquilo.

Toda la interfaz está en español. La documentación del diseño está en `docs/diseno/sistema-diseno.md` y las decisiones en `docs/decisiones/` (vault de Obsidian).

## Lo que ya se probó y no funcionó

Esto da contexto a las reglas de abajo:
- **Azul cobalto** (primera versión) y **azul petróleo** («Carpeta profesional», ADR-010): se seguían confundiendo con LinkedIn. **No vuelvas a un azul como color de marca.**
- **Lo que de verdad hacía parecerse a LinkedIn/Facebook era la estructura**, no solo el color: secciones centradas arriba con icono y texto debajo, botones píldora, la barra «Me gusta / Comentar / Compartir / Enviar» a todo el ancho, el perfil con portada y la foto redonda encima, los iconos de colores de la caja de publicar y el buscador de Empleo calcado de InfoJobs (MAYÚSCULAS, «V» como flecha). No reintroduzcas ninguno.
- **Carpeta original** (bordes negros de 2 px, sombras desplazadas, Unbounded): parecía una app infantil.
- **Fondo crema + titulares con remates + terracota** o **negro + verde ácido**: son las estéticas genéricas «hechas por IA». Evítalas.

Si una propuesta acerca la web a alguno de esos extremos, avísalo antes de aplicarla.

## Dónde vive el sistema

- `frontend/src/app/globals.css`: todos los tokens en `@theme` (modo claro) y su versión oscura en `:root[data-theme="dark"]`. Las utilidades de Tailwind leen esas variables, así que **cambiar el tema solo cambia valores**: los componentes no necesitan `dark:`.
- Las reglas de componentes globales (tarjetas, botones) van **fuera de `@layer`**. Dentro de `@layer base`, cualquier utilidad de Tailwind (`border-line`, `shadow-…`) las pisa.
- `frontend/src/lib/theme-script.ts` aplica el tema antes de pintar (sin parpadeo) y `frontend/src/lib/theme.ts` (`useTheme`) lo cambia desde Ajustes → Visualización.
- Fuentes en `app/layout.tsx`: **Bricolage Grotesque** para los títulos (h1, h2 y `font-display`) e **Instrument Sans** para los subtítulos (h3, h4, en seminegrita) y el texto. Los títulos y subtítulos se distinguen por la letra, no solo por el tamaño.
- Estructura en `components/app/`: `Spine.tsx` (el lomo: Inicio, Social, Foros, Empleo; también exporta `mainNav`, `isActive` y `BrandMark`), `TopBar.tsx` (buscador y lo personal, sin secciones), `SideNav.tsx` (tu ficha tipo carné y «Lo tuyo»), `MobileNav.tsx` (barra inferior).

## Tokens: cuál usar

| Para… | Usa | Nunca |
|---|---|---|
| Fondo de la app / de tarjetas | `bg-page` / `bg-card` | `bg-white`, `bg-gray-*` |
| Texto principal / secundario / terciario | `text-ink` / `text-ink-muted` / `text-ink-subtle` | `text-black`, `text-gray-*` |
| Separadores y bordes finos | `border-line` | `border-gray-*` |
| Botón principal | `bg-brand-600 text-on-brand hover:bg-brand-hover` | `text-white` sobre `brand-600` (en oscuro la pizarra es clara y el texto va oscuro) |
| Enlaces y texto de color | `text-brand-700` | `text-brand-600` como texto pequeño |
| Fondos suaves de marca | `bg-brand-50` | |
| Botón secundario | `btn-pop bg-card text-ink hover:bg-page` (o `<Button variant="secondary">`) | |
| Opción activa de cualquier navegación | `nav-mark` (fosforito con texto `on-mark`) | el color de la sección, `bg-brand-50` |
| Subrayado de fosforito en un texto | `.marker` (una vez por pantalla como mucho) | `bg-mark` en bloques grandes, `text-mark` |
| Radio de botones con texto | `rounded-btn` (8 px) | `rounded-full` (píldora) |
| Campos, buscadores, iconos redondos | `bg-field hover:bg-field-hover`, texto `text-field-text` | |
| Fondo oscuro con texto claro (chips, avatares) | `bg-ink text-inverse` | `bg-ink text-white` |
| Capas sobre fotos | `bg-black/50 text-white` (las fotos no cambian con el tema) | `bg-ink/50` |
| Estados | `text-success`, `text-warning`, `text-danger`, `bg-red-50`, `bg-green-50` (tienen versión oscura) | |
| Botón o globo rojo (borrar, salir, no leídos) | `bg-danger text-on-danger` | `text-white` (en oscuro el rojo es claro) |

**Color por sección:** Social = pizarra (`social`, el de la marca), Empleo = ocre (`empleo`), Foros = lacre (`foros`). Cada uno tiene `-50` (fondo suave) e `-ink` (icono y texto). Se usan **en pequeñas dosis**: una etiqueta o un icono. Ejemplo: `bg-empleo-50 text-empleo-ink`. La navegación activa va siempre en fosforito (`nav-mark`), no en el color de la sección. No pintes tarjetas enteras ni cabeceras con el color saturado.

Si necesitas un color nuevo, añádelo como token en los **dos** bloques de `globals.css` (claro y oscuro) y comprueba su contraste. Un color que solo existe en un tema es el fallo más típico del modo oscuro.

## Componentes

- **Tarjetas:** `rounded-card border border-line bg-card`, sin sombra. Al pasar el ratón, `hover:border-edge`. No añadas `shadow-*` sueltas (solo menús y paneles flotantes llevan `shadow-lg`).
- **Botones:** usa `components/Button.tsx` (`primary`, `secondary`, `ghost`) siempre que puedas. Radio `rounded-btn`, nunca píldora. Altura mínima de 44 px (`min-h-11`). Texto en minúsculas normales («Buscar ofertas», no «BUSCAR»).
- **Navegación:** la opción activa lleva `nav-mark`. La inactiva va en `text-ink-muted` (en el lomo, `text-spine-ink`). Si dos rutas empiezan igual (`/social` y `/social/foros`), se marca la más concreta: usa `isActive` de `Spine.tsx`.
- **Acciones de una publicación:** compactas, alineadas a la izquierda y en `ink-muted`; solo se colorean al activarse. Nada de barras a todo el ancho ni de iconos de colores.
- **Etiquetas de apartado:** en minúsculas normales y `text-ink-subtle`, nunca `uppercase tracking-wide`.
- **Dejar de seguir / salir de un grupo o foro:** siempre se puede deshacer lo que se hace con un botón de «+» o «Unirme». Antes de salir se pide confirmación con `components/UnfollowDialog.tsx` (`kind="person" | "group" | "forum"`), nunca con `window.confirm`.
- **Acciones que no se pueden deshacer** (eliminar, retirar): `const { confirm, dialog } = useConfirm()` de `components/ConfirmDialog.tsx`, con un verbo concreto en el botón. Nunca `window.confirm`.
- **Portadas de temas** (`lib/groups.ts`): el icono es blanco, así que los dos extremos del degradado tienen que dar al menos 3:1 con blanco.
- **Cabecera de grupo o foro:** carpeta con pestaña (la temática), portada en un cuadrado a la izquierda y secciones en `nav-mark` (`GroupHeader.tsx`). Nunca portada a lo ancho con fila de avatares ni pestañas subrayadas (ADR-014).
- **Pantallas sin cabecera de sección** (Mensajes, Notificaciones, Ajustes, Estadísticas): el h1 lleva `<ChalkText>` (tiza en tinta). El trazo en fosforito es solo para la pizarra.
- **Avatar de empresa sin foto:** cuadrado en `bg-empleo-50 text-empleo-ink`, nunca `bg-ink` (en oscuro sale casi blanco).
- **Texto secundario dentro de `nav-mark`:** en `text-on-mark`, no en `ink-muted` (en oscuro, 1,45:1).
- **Estados vacíos:** dicen qué falta y qué hacer, con un botón de acción («Aún no estás en ningún foro. Mira los de tus estudios»).

## Distribución y color por sección (ADR-015)

- **Sin columna izquierda por defecto.** `AppShell` muestra lomo, contenido (máx. 1120 px) y, salvo con `wide`, el panel derecho con pestañas. Una columna izquierda solo con `left` (Ajustes, Estadísticas). No vuelvas a poner el carné ni «Lo tuyo» en una columna: están en el menú de tu foto.
- **Cada pantalla de sección pasa `section`**: `<AppShell section="empleo">`, y `SocialShell` lo pone solo (`social`, o `foros` en `/social/foros`). Eso tiñe el fondo y da su color a la cabecera (`bg-hero`, `text-hero-ink`). El color de sección va en superficies grandes y suaves, nunca en cada tarjeta.
- **Navegación**: no dupliques el lomo. Social usa un menú horizontal (`SocialTabs`); Foros no lo repite porque está en el lomo.
- **Densidad**: un protagonista por pantalla (Inicio: franja «Hoy»; Social: grupo destacado; Empleo: buscador). El resto, en apartados cortos con «Ver todo» o detrás de «Más filtros».
- En el móvil, lo principal primero: fichas compactas en fila y nada de rejillas sin `grid-cols-[minmax(0,1fr)]` (si no, se salen por la derecha).

## Movimiento y 3D

- **3D:** `components/three/Scene3D.tsx` tiene cuatro escenas (`estudio`, `social`, `foros`, `empleo`). Úsalas con `Backdrop3D` (carga diferida, sin SSR) o con `<SectionHero kind=…>` para la cabecera de una sección; el fondo de Inicio es `<AppShell ambient>`. Una escena por página como mucho. Sobre la pizarra, pasa `onDark`.
- **Movimiento:** solo `transform` y `opacity`, con las curvas `--ease-enter`, `--ease-move` y `--ease-expo` de `globals.css`. Cada página entra una vez (`.page-enter` en `<main>`); no animes cada tarjeta. Tarjetas que se pueden inclinar: `className="tilt"` + `useTilt()` (solo grupos y ofertas, no el feed).
- Todo lo que se mueva tiene que tener su versión en `@media (prefers-reduced-motion: reduce)`.
- No ejecutes `next build` con `npm run dev` en marcha: sobrescribe `.next` y deja el servidor sin estilos.

## Llamativo, pero con criterio

Pon la personalidad en **un sitio por pantalla** y deja tranquilo el resto. Buenos sitios:
- El lomo y el fosforito de la opción activa (siempre presentes; no añadas otro elemento llamativo al lado)
- La portada de un grupo o foro (degradado con icono de su temática, `lib/groups.ts`)
- Una microinteracción (el confeti del «me gusta», el botón que se hunde un píxel al pulsarlo)
- Un número o titular importante en `font-display`

No uses: emojis como iconos de sección, degradados morado-azul, texto centrado en todo, MAYÚSCULAS en etiquetas o botones, ni más de un color saturado por bloque.

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
