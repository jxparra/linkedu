# Sistema de diseño

## Estética: «Pizarra y fosforito»
Decisión → [[decisiones/ADR-011-estetica-pizarra-fosforito]] (sustituye a [[decisiones/ADR-010-estetica-carpeta-profesional]])

Sale del mundo del estudiante: la **pizarra** del aula (verde muy oscuro) como color de marca y el **fosforito** con el que se subrayan los apuntes para marcar lo que está activo. El resto es «papel»: fondo gris verdoso claro con fichas blancas de borde fino, sin sombras. Nada de azul (LinkedIn, Facebook, InfoJobs) ni de botones en forma de píldora.

La personalidad está en tres sitios: el **lomo** (columna de pizarra a la izquierda con las secciones), el **fosforito** de la opción activa y los **títulos** en Bricolage Grotesque. Todo lo demás es tranquilo.

Las reglas de uso, con la tabla de qué token va en cada caso, están en la skill del proyecto `.claude/skills/studyhub-ui/SKILL.md`. Todos los colores son tokens de `frontend/src/app/globals.css` y tienen versión clara y oscura.

## Paleta

### Marca
| Token | Claro | Oscuro | Uso | Contraste |
|---|---|---|---|---|
| `brand-600` | `#2B5B4B` | `#8FD1B5` | Botón principal | texto encima (`on-brand`) 7,78:1 / 10,47:1 ✅ |
| `brand-hover` | `#234B3E` | `#A8DDC6` | Hover del botón principal | — |
| `brand-700` | `#21483B` | `#A8DDC6` | Enlaces y texto de color | 10,2:1 sobre blanco / 11,1:1 sobre tarjeta oscura ✅ |
| `brand-50` | `#E4EFE9` | `#1C2E27` | Fondos suaves | `brand-700` encima 8,67:1 / 9,41:1 ✅ |
| `on-brand` | `#FFFFFF` | `#121513` | Texto sobre `brand-600` | — |
| `mark` | `#FFE24A` | `#E7C93A` | **Fosforito**: opción activa de la navegación, «Nuevo», selección de texto | `on-mark` encima 13:1 / 11,2:1 ✅ |
| `mark-soft` | fosforito al 55 % | al 32 % | Subrayado `.marker` | — |
| `spine` | `#1F4236` | `#1A1E1B` | El lomo (navegación lateral) | `spine-ink` 5,96:1, `spine-strong` 8,9:1 ✅ |
| `board` | `#1F4236` | `#22392F` | La pizarra de la portada | — |
| `accent-400` / `-50` / `-800` | `#D9A900` / `#FFF6C7` / `#6B5400` | `#E7C93A` / `#332C12` / `#E7C93A` | Estrellas de las reseñas | — |

### Un color por sección (en pequeñas dosis: etiquetas, iconos)
| Sección | Fondo suave (`-50`) | Icono y texto (`-ink`) | Contraste claro / oscuro |
|---|---|---|---|
| Social (`social`) | `#E4EFE9` / `#1C2E27` | `#21483B` / `#A8DDC6` | 8,67:1 / 9,41:1 ✅ |
| Empleo (`empleo`, ocre) | `#FBF0D2` / `#33291A` | `#7A5300` / `#EBC678` | 6,04:1 / 8,75:1 ✅ |
| Foros (`foros`, lacre) | `#FBE6ED` / `#3A1F29` | `#9C2F52` / `#F5A3BB` | 6,00:1 / 7,70:1 ✅ |

La navegación activa **no** usa el color de la sección: siempre va en fosforito, para que «dónde estoy» se lea igual en toda la app.

### Neutros
| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `ink` | `#1B1E1C` | `#ECEEEA` | Texto principal |
| `ink-muted` | `#5C625E` | `#A3AAA5` | Texto secundario |
| `ink-subtle` | `#6A706B` | `#868D88` | Hora, placeholders (5,07:1 sobre blanco / 4,96:1 sobre tarjeta oscura) |
| `inverse` | `#FFFFFF` | `#121513` | Texto sobre `bg-ink` |
| `line` | `#E1E4DE` | `#2A302C` | Bordes y separadores |
| `edge` | `#C8CCC6` | `#3A413C` | Borde de campos, botones secundarios y tarjetas al pasar el ratón |
| `page` / `topbar` | `#F1F2EE` | `#121513` | Fondo de la app («papel») y barra superior |
| `card` | `#FFFFFF` | `#1A1E1B` | Tarjetas |
| `field` / `field-hover` | negro al 5 % / 9 % | blanco al 7 % / 12 % | Buscadores, caja de publicar, iconos |
| `banner-from` → `banner-to` | `#1F4236` → `#3D7A64` | `#1C2E27` → `#24392F` | Cabecera de Estadísticas |

### Estados
| Token | Claro | Oscuro |
|---|---|---|
| `success` | `#2E7D32` | `#81C784` |
| `warning` | `#B45309` | `#F0A35A` |
| `danger` | `#C62828` (texto blanco 5,62:1) | `#FF8A80` (texto oscuro 8,05:1) |

### Acciones de las publicaciones
Compactas y alineadas a la izquierda (no ocupan todo el ancho como en Facebook o LinkedIn). En reposo van en `ink-muted`; solo se colorean al activarlas.

| Acción | Activo |
|---|---|
| Me gusta (corazón) | relleno, fondo `foros-50`, texto `foros-ink` |
| Comentar | — |
| Compartir | fondo `brand-50`, texto `brand-700` |
| Enviar y Guardar | a la derecha, solo icono. Guardado: marcador relleno de fosforito |

El número solo aparece si es mayor que 0. En móvil se ocultan las palabras.

**Animaciones** de «me gusta» y «compartir»: igual que antes, con confeti y rayos en los colores de las secciones y el fosforito (`LikeBurst.tsx`, `ShareBurst.tsx`). Respetan «reducir movimiento».

## Estructura de la app
```
┌────────┬────────────────────────────────────────────────┐
│   s    │ [Buscar…]                    ✉   🔔  | IC Irene ▾│
│        ├───────────┬─────────────────────┬──────────────┤
│[Inicio]│ Hola, Irene · [ofertas] [foros] [grupos]   │ Para ti ·    │
│ Social │ publicar                                   │ Personas ·   │
│ Foros  │ publicación                                │ Grupos       │
│ Empleo │ publicación                                │ (pestañas)   │
└────────┴────────────────────────────────────────────┴──────────────┘
  lomo     contenido (máx. 1120 px)                     panel derecho
```
- **Lomo** (`components/app/Spine.tsx`): Inicio, Social, Foros y Empleo. Fijo a la izquierda desde 640 px. La opción activa lleva una pastilla de fosforito con las esquinas un poco irregulares (`.nav-mark`).
- **Barra superior**: buscador a la izquierda; mensajes, notificaciones y tu menú a la derecha. Sin secciones en el centro.
- **Columna izquierda**: tu ficha (como un carné, con franja de pizarra) y «Lo tuyo» (Guardados, Eventos, Reels).
- **Móvil**: barra inferior con Inicio, Social, Foros, Empleo y Perfil; la activa en fosforito.
- **Perfil**: cabecera tipo carné, sin foto de portada: franja de pizarra, foto a la izquierda, nombre y estudios al lado, y las cifras grandes en Bricolage.

## Color por sección y distribución
Decisión → [[decisiones/ADR-015-color-por-seccion-y-menos-columnas]]

- Marca: `brand-600` `#236B55` (antes `#2B5B4B`).
- Cabeceras y fondos por sección (Social verde, Foros granate, Empleo ocre) con `<AppShell section=…>`; tabla de valores y contrastes en el ADR.
- Sin columna izquierda por defecto; Inicio con la franja «Hoy»; panel derecho con pestañas; Social con menú horizontal; Foros a dos columnas; Empleo con filtros rápidos y «Más filtros».

## Movimiento y 3D
Decisión → [[decisiones/ADR-012-movimiento-y-3d]]

| Curva | Valor | Uso |
|---|---|---|
| `--ease-enter` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entradas, pulsación |
| `--ease-move` | `cubic-bezier(0.25, 1, 0.5, 1)` | Fosforito del lomo |
| `--ease-expo` | `cubic-bezier(0.19, 1, 0.22, 1)` | Subrayado de tiza, portada |

- Escenas 3D: `components/three/Scene3D.tsx` (`estudio`, `social`, `foros`, `empleo`), cargadas con `Backdrop3D`. Fondo de Inicio con `<AppShell ambient>`; cabeceras con `<SectionHero kind=…>`.
- Clases: `.page-enter`, `.tilt` (+ `useTilt`), `.spine-mark`, `.chalk-line`, `.hero-in`, `.board-3d`.
- Trazo de tiza: en fosforito sobre la pizarra de las cabeceras de sección; en tinta (`.chalk-line-ink`, componente `ChalkText`) bajo el h1 de las pantallas sin cabecera (Mensajes, Notificaciones, Ajustes, Estadísticas) → [[decisiones/ADR-014-carpeta-de-grupo-y-tiza-en-tinta]].
- Solo se animan `transform` y `opacity`. Todo tiene versión para «reducir movimiento».

## Reglas
1. Un solo botón principal (pizarra) por pantalla. El resto, botón secundario (borde) o enlace.
2. El fosforito marca **dónde estás** o **lo nuevo**. No se usa como fondo de bloques grandes ni como color de texto.
3. El rojo solo para errores y acciones de borrar.
4. Sin mayúsculas en etiquetas ni botones (ni «BUSCAR» ni rótulos en versalitas).
5. Estudiante y empresa comparten paleta. La empresa se distingue por avatar cuadrado.
6. Errores siempre con icono + texto, nunca solo color.
7. Todo lo que se puede pulsar lleva el cursor de mano; lo desactivado, el de prohibido.

## Tipografía
| Papel | Fuente | Peso | Dónde |
|---|---|---|---|
| **Títulos** (h1, h2) | **Bricolage Grotesque** | 700–800, interletrado −0,025 em (−0,035 em en la portada) | Títulos de página, de tarjeta, cifras grandes, logo |
| **Subtítulos** (h3, h4) | Instrument Sans | 600 | Encabezados dentro de un bloque, apartados de filtros |
| Texto | Instrument Sans | 400 / 500 / 600 | Todo lo demás |

Los títulos y los subtítulos se distinguen por la **letra**, no solo por el tamaño: Bricolage tiene trazos con más contraste y remates de tinta; Instrument Sans es neutra. Se aplica sola desde `globals.css`; en otros elementos, `font-display`.

- Escala: 12 / 13 / 15 / 18 / 22 / 28 / 44–64 px (portada)
- Logo: **«lu»** en Bricolage con la franja de fosforito debajo y **linkedu** en minúsculas. En el texto, siempre **Linkedu** → [[decisiones/ADR-013-nombre-linkedu]].

## Forma y espaciado
- Espaciado: escala de 4 px (4, 8, 12, 16, 24, 32, 48)
- Radios: botones 8 px (`rounded-btn`) · campos 8 px (`rounded-input`) · tarjetas 10 px (`rounded-card`). Las etiquetas pequeñas pueden ser redondeadas; los botones con texto, nunca píldora.
- Tarjetas: borde fino `border-line`, **sin sombra**. Al pasar el ratón, `hover:border-edge`.
- Botones de color: bajan 1 px al pulsarlos.
- Área táctil mínima: 44 × 44 px.

## Tailwind y modo oscuro
El proyecto usa **Tailwind 4**: los tokens están en `frontend/src/app/globals.css`, dentro de `@theme` (modo claro). Su versión oscura está en `:root[data-theme="dark"]`. Las utilidades (`bg-card`, `text-ink-muted`…) leen las variables, así que los componentes **no** usan `dark:`.

- `lib/theme-script.ts` pone `data-theme` en `<html>` antes de pintar, para que no haya parpadeo.
- `lib/theme.ts` (`useTheme`) guarda la elección en `localStorage` (`studyhub_theme`).
- Las reglas globales (`.marker`, `.nav-mark`, tarjetas, botones) van fuera de `@layer`, porque dentro de `@layer base` las pisaría cualquier utilidad.
- Comprobar colores: `python .claude/skills/studyhub-ui/scripts/audit_colors.py frontend/src` y `contrast.py`.

## Componentes del MVP
| Componente | Variantes | Estados |
|---|---|---|
| Button | primary, secondary, ghost | hover, focus, disabled, loading |
| Input | text, password, search | focus, error, helper |
| SocialAuthButton | Google, Microsoft | — |
| Checkbox / Toggle | — | marcado ✓, focus |
| ProgressBar | — | — |
| Card | auth, publicación, oferta, reseña | — |
| Avatar | usuario (círculo, `brand-50`), empresa (cuadrado, ocre `empleo-50`) | sin foto → iniciales |
| GroupHeader | carpeta: pestaña con la temática, portada en cuadrado, secciones en `nav-mark` | vista previa (`placeholder`, `compact`) |
| Rating | estrellas por criterio | lectura / edición |
| JobCard | puntual, prácticas | abierta, cerrada, postulado |
