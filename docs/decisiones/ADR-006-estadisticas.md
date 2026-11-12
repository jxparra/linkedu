# ADR-006 — Estadísticas del usuario

- **Fecha:** 2026-11-09
- **Estado:** aceptada

## Contexto
Se quería una página de **Estadísticas** como el panel "Rendimiento" de LinkedIn: seguidores, visualizaciones del perfil, apariciones en búsquedas e impresiones de las publicaciones, comparadas con el periodo anterior.

## Decisión
- Una tabla genérica **`stat_events`** (dueño, tipo, quién lo provocó, publicación, fecha) en vez de una tabla por cada dato.
- Tipos: `profile_view` (abrir un perfil), `search_appearance` (salir en el buscador), `post_impression` (tu publicación sale en el inicio de otra persona).
- Se apunta **una vez al día por persona** para que recargar no infle los números. Lo tuyo no cuenta.
- Seguidores: se añade la fecha a `follows` (`created_at`) para saber cuántos son nuevos.
- Comparación con el periodo anterior del mismo tamaño (7, 28 o 90 días). Si antes era 0 y ahora no, se muestra "nuevo" en vez de un porcentaje imposible.
- Datos de prueba de dos semanas para que no salga todo a 0 en la demo.

## Alternativas
| Opción | Por qué no |
|---|---|
| Contadores en la tabla `users` | No se puede comparar con la semana anterior |
| Una tabla por tipo de dato | Más tablas y código repetido |
| Herramienta externa (Google Analytics) | Mide la web, no a cada usuario; y datos personales a terceros (RGPD) |

## Consecuencias
- Cada carga del inicio escribe en la base de datos (impresiones). Con muchos usuarios habría que agrupar por día o usar Redis (fase 2).
- La primera vez se cargan datos de prueba también en las cuentas reales del entorno de desarrollo.
