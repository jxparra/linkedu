# Social: grupos

Referencia: `Escritorio/Tfc interfaz/Social` (Grupos de Facebook, copia en `assets/referencias/social/`), adaptada a los colores y componentes de StudyHub → [[sistema-diseno]].
Cómo se eligen las sugerencias → [[decisiones/ADR-008-sugerencias-grupos]]

## Pantallas
| Ruta | Pantalla | Captura |
|---|---|---|
| `/social` | **Sugerencias**: Para ti · Cerca de ti · Más sugerencias | `assets/pantallas-v4/social-sugerencias.png` |
| `/social?ver=para-ti` (`cerca`, `mas`) | "Ver todo" de un apartado, en cuadrícula | — |
| `/social/feed` | **Tu feed**: publicaciones de tus grupos | `social-feed.png` |
| `/social/grupos` | **Tus grupos**, con "Ordenar" (actividad, nombre, fecha de unión) y "Salir del grupo" | `social-grupos.png` |
| `/social/crear` | **Crear grupo** con vista previa para ordenador o móvil | `social-crear.png` |
| `/social/grupo/{id}` | **Página del grupo**: Publicaciones · Información · Miembros | `social-grupo.png` |
| `/social/grupo/{id}/editar` | Editar (solo administradores) | — |
| `/social/buscar?q=` | Buscar grupos por nombre, descripción o temática | `social-buscar.png` |

## Menú izquierdo (como la referencia)
Título "Grupos" · buscador "Buscar grupos" · **Tu feed / Sugerencias / Tus grupos**. El icono de la opción activa va en un círculo azul. Después, el botón **+ Crear nuevo grupo** (azul claro, para no competir con el botón principal) y la lista **Grupos a los que te has unido** con "Ver todo" y la última actividad. En móvil no hay columna: arriba salen el buscador y unas pestañas.

## Tarjeta de grupo
- Portada 16:9. Si el grupo no tiene foto, se pinta un **degradado con el icono de su temática** (`GroupCover`), así no queda ningún hueco gris.
- La **«X»** de la esquina quita el grupo de tus sugerencias. En su lugar queda «Has quitado X · Deshacer».
- Nombre, «N miembros · N publicaciones a la semana» y un candado si es privado.
- **Motivo** en una pastilla azul claro con icono: 🎓 «Porque estudias DAW», 📍 «16 personas de Granada», ✨ «Algo nuevo: Música», ✓ «Relacionado con Idiomas».
- Botón gris **Unirte al grupo**. Al unirte cambia a **✓ Ver grupo** (azul claro).
- «Para ti» y «Cerca de ti» son **carruseles** con flechas, que solo aparecen si hay más tarjetas a ese lado (3 por fila en ordenador, 2 en tableta, 1 y un trozo de la siguiente en móvil). «Más sugerencias» es una cuadrícula, como en la referencia.

## Página del grupo
- Portada 3:1, nombre, 🌐/🔒 privacidad · miembros, temática y ubicación.
- Avatares de los últimos miembros y «Marta, a quien sigues, está aquí».
- Si no eres miembro: botón azul **Unirte al grupo**. Si eres miembro: **✓ Te has unido ▾** (Salir; si administras: Editar y Eliminar) y el botón azul **Invitar**, que avisa con una notificación.
- Publicaciones con la caja «Escribe algo en el grupo…», que publica directamente en el grupo. A la derecha, la tarjeta **Información**.
- Grupo privado y no eres miembro: candado y «Únete para ver sus publicaciones».

## Crear grupo
Campos: nombre*, privacidad*, temática* (agrupadas en «De estudios y trabajo» y «Para todo el mundo»), ubicación (online o provincia), descripción, foto de portada e **invitar a personas**. El botón «Crear» se activa cuando están los tres campos obligatorios. La vista previa se actualiza mientras escribes, en gris mientras está vacía, como en la referencia.

## Notificaciones nuevas
- `group_invite`: «X te ha invitado a unirte a un grupo» (abre el grupo).
- `group_join`: «X se ha unido a tu grupo» (a los administradores).

## Referencia → resultado
| Referencia (Grupos de Facebook) | StudyHub |
|---|---|
| ![[assets/referencias/social/Sugerencias.png]] | ![[assets/pantallas-v4/social-sugerencias.png]] |
| ![[assets/referencias/social/Tusgrupos.png]] | ![[assets/pantallas-v4/social-grupos.png]] |
| ![[assets/referencias/social/Crear grupo.png]] | ![[assets/pantallas-v4/social-crear.png]] |

### Más capturas
![[assets/pantallas-v4/social-grupo.png]]
![[assets/pantallas-v4/social-feed.png]]
![[assets/pantallas-v4/social-buscar.png]]
![[assets/pantallas-v4/social-movil.png|300]]

Referencias originales (`Escritorio/Tfc interfaz/Social`): `assets/referencias/social/` (`Sugerencias.png`, `Sugerencias-1.png`, `Sugerencias-2.png`, `Tusgrupos.png`, `Crear grupo.png`).
