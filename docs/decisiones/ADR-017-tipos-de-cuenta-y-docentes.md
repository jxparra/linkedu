# ADR-017 — Tipos de cuenta visibles y cuenta de docente

- **Fecha:** 2026-11-25
- **Estado:** aceptada
- **Amplía:** [[decisiones/ADR-015-color-por-seccion-y-menos-columnas]]

## Contexto
Se pidió que la app se viera distinta según quién eres, estudiante, empresa o docente, «para que visualmente se note la diferencia de quién es quién cuando interactúan». Hasta ahora solo existían estudiante y empresa, y la diferencia se limitaba a un avatar cuadrado para las empresas y, en las publicaciones, una etiqueta «Empresa» en gris.

## Decisión

### Cuenta de docente (rol `teacher`)
- Es un tipo de cuenta completo: «Soy docente» en `/registro/tipo`.
- Sigue los mismos pasos que el estudiante (nombre, «¿Dónde das clase?», foto y comunidades), con sus propios textos. Las rutas internas (`/registro/estudiante/...`) no cambian.
- Usa la misma ficha personal que el estudiante (`StudentProfile`): nombre, foto, centro y estudios en los que da clase. Se añade el campo `teaches`, «Qué impartes». Así no hay que duplicar los perfiles ni las búsquedas, y el docente entra en los foros de sus estudios como cualquiera.
- No tiene curso ni casilla de edad.
- Su titular es «qué imparte, centro, ciudad».
- No se inscribe en ofertas (lo bloquea el backend) ni publica ofertas. En Empleo ve las ofertas de sus estudios como «ofertas para tu alumnado».
- Datos de prueba: `elena.profe@demo.studyhub` y `andres.profe@demo.studyhub` (contraseña `Demo1234`), con publicaciones y un comentario en la pregunta de Irene. Se crean con `seed_teachers`.

### Quién es quién: forma, color y etiqueta
| Tipo | Avatar | Color | Etiqueta junto al nombre |
|---|---|---|---|
| Estudiante | redondo | pizarra (`brand`) | «Estudiante» (en publicaciones y perfil, con su curso: «Estudiante · 2º curso») |
| Empresa | cuadrado | ocre (`empleo`) | «Empresa» |
| Docente | hexágono (`.avatar-hex`) | violeta tinta (`docente`, token nuevo) | «Docente» |

- **La forma se mantiene también con foto.** Así se distingue sin depender del color, que es importante para el daltonismo.
- **Todos llevan su etiqueta**, también los estudiantes (al principio no la llevaban, pero se pidió que se viera qué es cada perfil). Sale en todos los sitios donde se interactúa: publicaciones, comentarios, mensajes, notificaciones, miembros de un grupo, buscador y sugerencias de personas. El cartel «Autor» de los comentarios pasa a gris con borde para no confundirse con «Estudiante».
- **En el perfil, la franja del carné toma el color del tipo de cuenta.**
- **Componentes:** `Avatar` recibe `role` (sustituye a `square={x.role === "company"}`; `square` se queda para los logos de las ofertas) y `RoleTag` pinta la etiqueta.
- **Token `docente`:** claro `#6E4BAB` / `-50 #EFE8F7` / `-ink #5B3D8F`; oscuro `#C3A6EE` / `#2A2238` / `#D2BDF2`. Etiqueta: 7,0:1 en claro y 8,9:1 en oscuro.
- **«Docente» en lugar de «Profesor/a»:** es neutro y no obliga a adivinar el género por el nombre.

## Alternativas descartadas
- **Solo una etiqueta, sin cambiar los avatares:** se pierde la lectura de un vistazo en listas largas (miembros, comentarios).
- **Teñir la app entera según tu tipo de cuenta:** competía con el color por sección (ADR-015) y saturaba. El color del rol queda en el avatar, la etiqueta y la franja del perfil.
- **Violeta o azul para el docente:** se descarta el azul por LinkedIn (ADR-011). El violeta tinta es una sola tinta, sin degradados.

## Consecuencias
- En PostgreSQL el tipo `user_role` necesita el valor `teacher`. La base de datos de la entrega se crea de cero, así que no hace falta migrarla.
- Un docente podría querer varios centros o estudios: de momento es uno, como el estudiante.
