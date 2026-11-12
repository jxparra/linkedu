# ADR-009 — Los foros van dentro de Social

- **Fecha:** 2026-11-12
- **Estado:** aceptada

## Contexto
Había dos cosas parecidas: los **grupos** de Social y las **comunidades** de estudios, de centros y generales (las que se eligen en el registro). En el menú, «Foros» llevaba a una página de «Próximamente». Faltaba decidir si los foros eran una sección aparte o parte de Social.

## Decisión
- Los foros son **comunidades** de tipo `degree` (estudios), `school` (centro) o `general`. Están en la misma tabla `communities` que los grupos (`type = "group"`).
- Se abren **dentro de Social**: «Foros» es una opción más del menú de Social (`/social/foros`). Cada foro usa la misma página que un grupo (`/social/grupo/{id}`), con publicaciones, información y miembros.
- `/foros` redirige a `/social/foros`. Así siguen funcionando el menú lateral y la barra de abajo en móvil.
- La pantalla Foros muestra **Tus foros** y **Foros para ti**. Primero salen los de tus estudios y tu centro, luego los generales y después el resto, ordenados por actividad.

## Alternativas
| Opción | Por qué no |
|---|---|
| Sección Foros aparte, con sus propias pantallas | Se duplicaría la página de grupo (publicar, miembros, unirse…) para hacer lo mismo |
| Convertir los foros en grupos con una temática | Se perdería el enlace con los estudios y el centro (`target_id`), que sirve para sugerirlos |

## Consecuencias
- Unirse, salir y publicar en un foro funciona igual que en un grupo (`/groups/{id}/join`).
- Los textos cambian según el tipo: «Unirte al foro» o «Unirte al grupo». La portada lleva el icono del tipo de foro (birrete, edificio o bocadillos).
- «Tus grupos» y «Tu feed» siguen mostrando solo grupos, no foros.
