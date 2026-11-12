# Sistema de diseño

## Estética: «Carpeta profesional»
Decisión → [[decisiones/ADR-010-estetica-carpeta-profesional]] (sustituye a [[decisiones/ADR-002-paleta-cobalto]])

Llamativa para los estudiantes y seria para las empresas: coral como color de marca, fondo cálido, un color por sección y modo oscuro. El ruido está controlado: bordes finos, sombras suaves y títulos sobrios. Las reglas de uso, con la tabla de qué token va en cada caso, están en la skill del proyecto `.claude/skills/studyhub-ui/SKILL.md`.

Todos los colores son tokens de `frontend/src/app/globals.css` y tienen versión clara y oscura. El modo se elige en Ajustes → Visualización (Claro / Oscuro / Como el sistema).

## Paleta

### Marca
| Token | Claro | Oscuro | Uso | Contraste |
|---|---|---|---|---|
| `brand-600` | `#C9401C` | `#FF8466` | Botón principal, logo | texto encima (`on-brand`) 4,96:1 / 7,62:1 ✅ |
| `brand-hover` | `#B23A1E` | `#FF9C84` | Hover del botón principal | — |
| `brand-700` | `#A8361A` | `#FF9C84` | Enlaces y texto en coral | 6,55:1 sobre blanco ✅ |
| `brand-50` | `#FFE9E2` | `#3A221C` | Fondos suaves, elementos activos | — |
| `on-brand` | `#FFFFFF` | `#15141A` | Texto sobre `brand-600` | — |
| `accent-400` / `-50` / `-800` | `#F5B70A` / `#FFF4D1` / `#6E5200` | `#F5C542` / `#3A3216` / `#F5C542` | Estrellas, «Nuevo», Compartir | — |

### Un color por sección (en pequeñas dosis: navegación activa, etiquetas, iconos)
| Sección | Fondo suave (`-50`) | Icono y texto (`-ink`) | Contraste claro / oscuro |
|---|---|---|---|
| Social (`social`) | `#FFE9E2` / `#3B231D` | `#B23A1E` / `#FF9C84` | 5,12:1 / 7,16:1 ✅ |
| Empleo (`empleo`) | `#DDF5F2` / `#12302D` | `#0B6E66` / `#5EE0D3` | 5,36:1 / 8,8:1 ✅ |
| Foros (`foros`) | `#EEE8FE` / `#2A2340` | `#5B3CC4` / `#C4B1FF` | 6,1:1 / 7,84:1 ✅ |

### Neutros
| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `ink` | `#16151A` | `#F2F0EC` | Texto principal |
| `ink-muted` | `#57545E` | `#ADAAB6` | Texto secundario |
| `ink-subtle` | `#7A7682` | `#8A8796` | Placeholders y datos poco importantes |
| `inverse` | `#FFFFFF` | `#15141A` | Texto sobre `bg-ink` |
| `line` | `#E7E3DC` | `#2E2C36` | Bordes y separadores |
| `edge` | `#D6D2CA` | `#3D3A46` | Borde de los botones secundarios |
| `page` | `#F7F6F3` | `#131217` | Fondo de la app (cálido, no gris azulado) |
| `card` / `topbar` | `#FFFFFF` | `#1C1B22` | Tarjetas y barra superior |
| `field` / `field-hover` | negro al 5 % / 9 % | blanco al 7 % / 12 % | Buscadores, caja de publicar, iconos redondos |
| `banner-from` → `banner-to` | `#B23A1E` → `#E0892B` | `#4A2A21` → `#3D3418` | Cabecera del perfil y de Estadísticas |

### Estados
| Token | Claro | Oscuro |
|---|---|---|
| `success` | `#15803D` | `#4ADE80` |
| `warning` | `#C2410C` | `#FB923C` |
| `danger` | `#DC2626` | `#F87171` |

### Acciones de las publicaciones
Cada acción tiene su color, en el icono y en el número que lleva al lado.

| Acción | Icono | Texto y número | Activo |
|---|---|---|---|
| Me gusta | `brand-700` | `brand-700` | icono relleno + fondo `brand-50` |
| Comentar | `green-600` #16A34A | `green-700` #15803D | — |
| Compartir | `accent-800` | `accent-800` | icono más grueso + fondo `accent-50` |
| Enviar | `ink-muted` | `ink-muted` | — |

El número solo aparece si es mayor que 0. En móvil se ocultan las palabras y quedan icono y número.

**Animación de "me gusta":** el pulgar da un pequeño salto, sale un anillo azul y 14 trozos de confeti con los colores de las secciones (coral, amarillo, turquesa y violeta) (≈0,7 s). Solo al dar "me gusta", no al quitarlo. Si el sistema tiene activado "reducir movimiento", no se anima. Código: `frontend/src/components/feed/LikeBurst.tsx`.

**Animación de "compartir":** las flechas del icono dan una vuelta con un pequeño rebote, sale un anillo ámbar, 8 rayos cortos (ámbar y turquesa alternos) y un "+1" que sube (≈0,55 s). Solo al compartir, no al dejar de compartir, y también respeta "reducir movimiento". Código: `frontend/src/components/feed/ShareBurst.tsx`.

**Seguir:** el botón "+ Seguir" pasa a "✓ Siguiendo" en gris. Al pulsarlo sale un panel de advertencia "¿Dejar de seguir a X?" con el botón rojo "Dejar de seguir" (es una acción de quitar) y "Cancelar", que tiene el foco por defecto. Código: `frontend/src/components/UnfollowDialog.tsx`.

## Reglas
1. Un solo botón coral por pantalla. El resto, botón secundario (borde fino) o enlace.
2. El ámbar nunca como texto sobre blanco (2:1). Solo como fondo con texto oscuro.
3. El rojo solo para errores y acciones de borrar.
4. El verde solo para éxito. El progreso va en coral.
5. El gris claro solo para placeholders.
6. Estudiante y empresa comparten paleta. La empresa se distingue por avatar cuadrado y etiqueta "Empresa".
7. Errores siempre con icono + texto, nunca solo color.
8. Todo lo que se puede pulsar lleva el cursor de mano (regla global en `globals.css`); lo desactivado, el cursor de prohibido.

## Tipografía
- **DM Sans** para el texto y **Plus Jakarta Sans** para los títulos (h1–h3 la usan solos; en otros sitios, `font-display`)
- Pesos: 400, 600 y 700 (800 solo en el logo)
- Escala: 12 / 14 / 16 / 20 / 28 / 40 px
- Logo: STUDYHUB en mayúsculas. En el texto, siempre **StudyHub**.

## Forma y espaciado
- Espaciado: escala de 4 px (4, 8, 12, 16, 24, 32, 48)
- Radios: inputs 10 px · tarjetas 14 px · botones píldora
- Tarjetas: borde fino `line` y sombra suave (se ponen solos desde `globals.css` con `rounded-card border`)
- Botones de color: sombra mínima y bajan 1 px al pulsarlos
- Área táctil mínima: 44 × 44 px
- Ancho de tarjetas de registro: 440 px

## Tailwind y modo oscuro
El proyecto usa **Tailwind 4**: los tokens están en `frontend/src/app/globals.css`, dentro de `@theme` (modo claro). Su versión oscura está en `:root[data-theme="dark"]`. Las utilidades (`bg-card`, `text-ink-muted`…) leen las variables, así que los componentes **no** usan `dark:`.

- `lib/theme-script.ts` pone `data-theme` en `<html>` antes de pintar, para que no haya parpadeo.
- `lib/theme.ts` (`useTheme`) guarda la elección en `localStorage` (`studyhub_theme`) y sigue al sistema si se elige «Como el sistema».
- Las reglas globales de tarjetas y botones van fuera de `@layer`, porque dentro de `@layer base` las pisaría cualquier utilidad.
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
| Avatar | usuario (círculo), empresa (cuadrado) | sin foto → iniciales |
| Rating | estrellas por criterio | lectura / edición |
| JobCard | puntual, prácticas | abierta, cerrada, postulado |
