# Sistema de diseño

## Paleta
Decisión → [[decisiones/ADR-002-paleta-cobalto]]

### Marca (≈10% de la pantalla)
| Token | Hex | Uso | Contraste |
|---|---|---|---|
| `brand-600` | `#2952E3` | Botón principal, barra de progreso, checks | blanco 6.2:1 ✅ |
| `brand-700` | `#1F3FB8` | Hover, enlaces | blanco 8.5:1 ✅ |
| `brand-50` | `#EEF2FE` | Fondo de elementos activos | — |
| `accent-400` | `#F5A524` | Estrellas, etiquetas "Nuevo"/"Destacado" | tinta 8.3:1 ✅ |
| `accent-50` | `#FEF6E7` | Fondo de destacados | — |
| `accent-800` | `#8A5300` | Texto sobre `accent-50` | — |

### Neutros (≈90%)
| Token | Hex | Uso |
|---|---|---|
| `ink` | `#14161F` | Texto principal |
| `ink-muted` | `#5B6070` | Texto secundario (6.3:1) |
| `ink-subtle` | `#8A8F9C` | Solo placeholders |
| `line` | `#E3E5EA` | Bordes |
| `page` | `#F2F4F7` | Fondo de la app |
| `card` | `#FFFFFF` | Fondo de las tarjetas |
| `field` | `rgba(0,0,0,.05)` | Buscador, iconos de mensajes/notificaciones y caja de publicar |
| `field-hover` | `rgba(0,0,0,.09)` | Al pasar el ratón por esos elementos |
| `field-text` | `#65686C` | Texto del buscador y de la caja de publicar (contraste 5:1 ✅) |

### Estados
| Token | Hex | Uso |
|---|---|---|
| `success` | `#15803D` | Confirmaciones |
| `warning` | `#C2410C` | Avisos |
| `danger` | `#DC2626` | Errores y borrar |

### Acciones de las publicaciones
Cada acción tiene su color, en el icono y en el número que lleva al lado.

| Acción | Icono | Texto y número | Activo |
|---|---|---|---|
| Me gusta | `brand-600` #2952E3 | `brand-700` #1F3FB8 | icono relleno + fondo `brand-50` |
| Comentar | `green-600` #16A34A | `green-700` #15803D | — |
| Compartir | `accent-400` #F5A524 | `accent-800` #8A5300 | icono más grueso + fondo `accent-50` |
| Enviar | `ink-muted` | `ink-muted` | — |

El número solo aparece si es mayor que 0. En móvil se ocultan las palabras y quedan icono y número.

**Animación de "me gusta":** el pulgar da un pequeño salto, sale un anillo azul y 14 trozos de confeti con los colores de la marca (≈0,7 s). Solo al dar "me gusta", no al quitarlo. Si el sistema tiene activado "reducir movimiento", no se anima. Código: `frontend/src/components/feed/LikeBurst.tsx`.

**Animación de "compartir":** las flechas del icono dan una vuelta con un pequeño rebote, sale un anillo ámbar, 8 rayos cortos (ámbar y azul alternos) y un "+1" que sube (≈0,55 s). Solo al compartir, no al dejar de compartir, y también respeta "reducir movimiento". Código: `frontend/src/components/feed/ShareBurst.tsx`.

**Seguir:** el botón "+ Seguir" pasa a "✓ Siguiendo" en gris. Al pulsarlo sale un panel de advertencia "¿Dejar de seguir a X?" con el botón rojo "Dejar de seguir" (es una acción de quitar) y "Cancelar", que tiene el foco por defecto. Código: `frontend/src/components/UnfollowDialog.tsx`.

## Reglas
1. Un solo botón azul por pantalla. El resto, borde gris o enlace.
2. El ámbar nunca como texto sobre blanco (2:1). Solo como fondo con texto oscuro.
3. El rojo solo para errores y acciones de borrar.
4. El verde solo para éxito. El progreso va en azul.
5. El gris claro solo para placeholders.
6. Estudiante y empresa comparten paleta. La empresa se distingue por avatar cuadrado y etiqueta "Empresa".
7. Errores siempre con icono + texto, nunca solo color.
8. Todo lo que se puede pulsar lleva el cursor de mano (regla global en `globals.css`); lo desactivado, el cursor de prohibido.

## Tipografía
- Una sola familia: **Inter** (o Plus Jakarta Sans)
- Pesos: 400 y 600
- Escala: 12 / 14 / 16 / 20 / 28 / 40 px
- Logo: STUDYHUB en mayúsculas. En el texto, siempre **StudyHub**.

## Forma y espaciado
- Espaciado: escala de 4 px (4, 8, 12, 16, 24, 32, 48)
- Radios: inputs 8 px · tarjetas 16 px · botones píldora
- Área táctil mínima: 44 × 44 px
- Ancho de tarjetas de registro: 440 px

## Tailwind
> En el proyecto se usa **Tailwind 4**, así que los tokens están en `frontend/src/app/globals.css` dentro de `@theme` (no en `tailwind.config.js`). Los nombres son los mismos: `bg-brand-600`, `text-ink-muted`, `rounded-card`…

Equivalente en formato Tailwind 3:
```js
// tailwind.config.js → theme.extend
colors: {
  brand:   { 50: '#EEF2FE', 600: '#2952E3', 700: '#1F3FB8' },
  accent:  { 50: '#FEF6E7', 400: '#F5A524', 800: '#8A5300' },
  ink:     { DEFAULT: '#14161F', muted: '#5B6070', subtle: '#8A8F9C' },
  line:    '#E3E5EA',
  page:    '#F6F7F9',
  success: '#15803D',
  warning: '#C2410C',
  danger:  '#DC2626',
},
fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
borderRadius: { input: '8px', card: '16px' },
```

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
