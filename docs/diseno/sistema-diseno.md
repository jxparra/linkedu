# Sistema de diseño

## Estética: «Carpeta profesional»
Decisión → [[decisiones/ADR-010-estetica-carpeta-profesional]] (sustituye a [[decisiones/ADR-002-paleta-cobalto]])

Llamativa para los estudiantes y seria para las empresas: azul petróleo como color de marca, fondo gris claro con tarjetas blancas, un color por sección y modo oscuro. El ruido está controlado: bordes finos, sombras suaves y títulos sobrios. Las reglas de uso, con la tabla de qué token va en cada caso, están en la skill del proyecto `.claude/skills/studyhub-ui/SKILL.md`.

Todos los colores son tokens de `frontend/src/app/globals.css` y tienen versión clara y oscura. El modo se elige en Ajustes → Visualización (Claro / Oscuro / Como el sistema).

## Paleta

### Marca
| Token | Claro | Oscuro | Uso | Contraste |
|---|---|---|---|---|
| `brand-600` | `#1F6F8B` | `#5FB3D0` | Botón principal, logo | texto encima (`on-brand`) 5,67:1 / 7,45:1 ✅ |
| `brand-hover` | `#195D75` | `#7EC4DC` | Hover del botón principal | — |
| `brand-700` | `#175A72` | `#7EC4DC` | Enlaces y texto de color | 7,66:1 sobre blanco / 8,8:1 sobre tarjeta oscura ✅ |
| `brand-50` | `#E3F1F6` | `#16303A` | Fondos suaves, elementos activos | — |
| `on-brand` | `#FFFFFF` | `#15141A` | Texto sobre `brand-600` | — |
| `on-danger` | `#FFFFFF` | `#15141A` | Texto sobre `danger` (borrar, salir, no leídos) | 4,83:1 / 6,62:1 ✅ |
| `accent-400` / `-50` / `-800` | `#F5B70A` / `#FFF4D1` / `#6E5200` | `#F5C542` / `#3A3216` / `#F5C542` | Estrellas, «Nuevo», Compartir | — |

### Un color por sección (en pequeñas dosis: navegación activa, etiquetas, iconos)
| Sección | Fondo suave (`-50`) | Icono y texto (`-ink`) | Contraste claro / oscuro |
|---|---|---|---|
| Social (`social`) | `#E3F1F6` / `#16303A` | `#175A72` / `#7EC4DC` | 6,63:1 / 7,13:1 ✅ |
| Empleo (`empleo`) | `#E2F5EA` / `#14301F` | `#17703F` / `#6EDC9A` | 5,40:1 / 8,40:1 ✅ |
| Foros (`foros`) | `#EEE8FE` / `#2A2340` | `#5B3CC4` / `#C4B1FF` | 6,1:1 / 7,84:1 ✅ |

### Neutros
| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `ink` | `#16151A` | `#F2F0EC` | Texto principal |
| `ink-muted` | `#57545E` | `#ADAAB6` | Texto secundario |
| `ink-subtle` | `#6B6773` | `#8A8796` | Hora de las publicaciones, placeholders (5,51:1 sobre blanco) |
| `inverse` | `#FFFFFF` | `#15141A` | Texto sobre `bg-ink` |
| `line` | `#E2E4E9` | `#2E2C36` | Bordes y separadores |
| `edge` | `#C9CCD3` | `#3D3A46` | Borde de los botones secundarios y de las tarjetas al pasar el ratón |
| `page` | `#EEF0F3` | `#131217` | Fondo de la app: gris claro, para que las tarjetas blancas destaquen |
| `card` / `topbar` | `#FFFFFF` | `#1C1B22` | Tarjetas y barra superior |
| `field` / `field-hover` | negro al 5 % / 9 % | blanco al 7 % / 12 % | Buscadores, caja de publicar, iconos redondos |
| `banner-from` → `banner-to` | `#175A72` → `#3A9BB5` | `#16303A` → `#1D2A3D` | Cabecera del perfil y de Estadísticas |

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

**Animación de "me gusta":** el pulgar da un pequeño salto, sale un anillo azul y 14 trozos de confeti con los colores de las secciones (azul, amarillo, verde y violeta) (≈0,7 s). Solo al dar "me gusta", no al quitarlo. Si el sistema tiene activado "reducir movimiento", no se anima. Código: `frontend/src/components/feed/LikeBurst.tsx`.

**Animación de "compartir":** las flechas del icono dan una vuelta con un pequeño rebote, sale un anillo ámbar, 8 rayos cortos (ámbar y azul claro alternos) y un "+1" que sube (≈0,55 s). Solo al compartir, no al dejar de compartir, y también respeta "reducir movimiento". Código: `frontend/src/components/feed/ShareBurst.tsx`.

**Seguir:** el botón "+ Seguir" pasa a "✓ Siguiendo" en gris. Al pulsarlo sale un panel de advertencia "¿Dejar de seguir a X?" con el botón rojo "Dejar de seguir" (es una acción de quitar) y "Cancelar", que tiene el foco por defecto. Código: `frontend/src/components/UnfollowDialog.tsx`.

## Reglas
1. Un solo botón principal (azul) por pantalla. El resto, botón secundario (borde fino) o enlace.
2. El ámbar nunca como texto sobre blanco (2:1). Solo como fondo con texto oscuro.
3. El rojo solo para errores y acciones de borrar.
4. El progreso va en azul. El verde se usa para éxito y como color de Empleo.
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
- Tarjetas: borde fino `border-line` y sombra suave (la sombra se pone sola desde `globals.css` con `rounded-card border`; el color del borde lo pone la clase, así funciona `hover:border-edge`)
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
