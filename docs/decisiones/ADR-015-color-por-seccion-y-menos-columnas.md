# ADR-015 — Color por sección y menos columnas

- **Fecha:** 2026-11-19
- **Estado:** aceptada
- **Amplía:** [[decisiones/ADR-011-estetica-pizarra-fosforito]]

## Contexto
Se pidió una web más visual y con colores más llamativos, «pero en un término medio para no saturar», y otra distribución de Inicio, Social, Foros y Empleo: menos saturación visual y más intuitiva.

Al revisar las pantallas, la saturación venía de:
- **3 columnas** en casi todas las pantallas, además del lomo.
- **Navegación repetida**: el lomo y la columna «Grupos» enseñaban lo mismo.
- **Social**: tres carruseles seguidos de portadas grandes.
- **Foros**: la misma rejilla de portadas que Social.
- **Empleo**: una columna fija con ~25 filtros.

Criterio aplicado de las skills: `impeccable` (layout, colorize, quieter, craft-floor), `ui-ux-pro-max` (navegación coherente, *content-priority*, divulgación progresiva, contraste), `frontend-design`, `ui-animation` y `studyhub-ui`.

## Decisión

### Color
- **Marca un punto más viva**: `brand-600` pasa de `#2B5B4B` a `#236B55` (texto blanco 6,35:1).
- **Cada sección tiene su color** en superficies grandes y suaves, no en cada tarjeta. Lo fija `<AppShell section="social|foros|empleo">` (atributo `data-section`):

| Sección | Cabecera (`--color-hero`) | Fondo (`--color-page`) | Texto secundario de la cabecera |
|---|---|---|---|
| Social | `#1F5A47` / oscuro `#17342B` | `#EEF4F0` / `#131715` | `#C9E3D7` |
| Foros | `#7A2442` / `#3D1824` | `#F9F3F5` / `#161214` | `#F2C9D6` |
| Empleo | `#6E4A08` / `#3A2A0E` | `#F7F2E6` / `#161410` | `#F1DCAE` |

Todo medido: texto de la cabecera ≥ 5,9:1 y texto terciario sobre los fondos ≥ 4,5:1, en los dos temas.

### Distribución
- **Sin columna izquierda por defecto.** El carné y «Lo tuyo» se quitan. Tu perfil, Guardados, Eventos y Reels están en el menú de tu foto, y las secciones, en el lomo. Ancho máximo de 1120 px. Solo Ajustes y Estadísticas conservan una columna izquierda propia.
- **Inicio**: arriba, la franja **«Hoy»** (`TodayBand`) con un saludo y tres accesos con su cifra, cada uno en el color suave de su sección: ofertas para tus estudios, tus foros y grupos para ti. Debajo, el feed. A la derecha hay **un solo panel con pestañas** (Para ti · Personas · Grupos) en lugar de tres tarjetas apiladas.
- **Social**: la columna «Grupos» pasa a un **menú horizontal** (Descubrir · Tu feed · Tus grupos, buscar y «Crear grupo»). En Descubrir, **un grupo destacado** en tarjeta horizontal y apartados cortos de 3 tarjetas con «Ver todo», en lugar de carruseles. Las portadas son más bajas (2:1).
- **Foros**: ya tiene su sitio en el lomo, así que no repite el menú de Social. Tiene dos columnas tranquilas: **Tus foros** (fija al hacer scroll) y **Descubrir foros** en filas compactas con «Unirme» en la misma línea.
- **Empleo**: la columna de filtros desaparece. Arriba de los resultados van **5 filtros rápidos en fichas** (Para mis estudios, Prácticas, Trabajo puntual, En remoto, Media jornada) y **«Más filtros»**, que abre el resto en un panel lateral (a pantalla completa en el móvil; se cierra con Esc). Los resultados ocupan todo el ancho.

## Alternativas
| Opción | Por qué no |
|---|---|
| Subir la saturación de todos los colores | Más ruido, justo lo contrario de lo pedido |
| Mantener las 3 columnas y solo cambiar colores | La saturación venía sobre todo de la estructura |
| Cambiar de paleta por completo | Se perdería la identidad «Pizarra y fosforito», que ya funcionaba |

## Consecuencias
- Desaparece `components/app/SideNav.tsx`. `AppShell` ya no acepta `wideLeft` y añade `section`.
- La lista «Grupos a los que te has unido» deja de estar en una columna: está en «Tus grupos».
- Copia del estado anterior en la referencia de git `refs/backup/antes-redistribucion`.
