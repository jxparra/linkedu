# ADR-014 — Cabecera de grupo tipo carpeta, tiza en tinta y empresas en ocre

- **Fecha:** 2026-11-19
- **Estado:** aceptada (2026-11-19). Ampliada con las propuestas pendientes del informe: ver «Ampliación» al final.

## Contexto
Después de [[decisiones/ADR-011-estetica-pizarra-fosforito]] quedaban tres cosas que no encajaban con el sistema:
- La **página de un grupo** seguía el patrón de Facebook Grupos: portada a lo ancho, una fila de avatares redondos y pestañas subrayadas.
- **Mensajes, Notificaciones, Ajustes y Estadísticas** no tenían cabecera de sección y parecían pantallas genéricas. En el móvil, Ajustes ni siquiera tenía título ni forma de cambiar de apartado.
- El **avatar de empresa** sin foto era un bloque `bg-ink`: negro en claro y casi blanco en oscuro, donde deslumbraba.

## Decisión
- **Cabecera de grupo como una carpeta** (`components/social/GroupHeader.tsx`): una pestaña arriba a la izquierda con la temática, la portada en un **cuadrado** a la izquierda (la foto o el icono de la temática sobre su degradado, `GroupCover iconSize="tile"`), el nombre en Bricolage y las secciones del grupo en `nav-mark`. Los botones van a la derecha del nombre en pantallas anchas y debajo en el móvil. Sin portada a lo ancho, sin fila de avatares (se dice con texto: «Marta, a quien sigues, está aquí») y sin pestañas subrayadas.
- **Tiza en tinta** en las pantallas sin cabecera de sección: el mismo trazo `.chalk-line` de las cabeceras, pero en `ink` y más fino (`.chalk-line-ink`, componente `ChalkText` de `components/ChalkLine.tsx`). En la pizarra sigue en fosforito. No se añade otro elemento llamativo: el fosforito ya está en el lomo.
- **Estadísticas como un boletín de notas**: una sola cifra protagonista (seguidores) sobre `bg-board` en `font-display` grande y el resto en filas tranquilas, con la explicación de cada cifra a la vista en lugar de en un `title`. Un solo selector de periodo.
- **Empresas en ocre**: el avatar cuadrado sin foto usa `bg-empleo-50 text-empleo-ink` (6,04:1 en claro y 8,75:1 en oscuro). La forma cuadrada sigue siendo lo que distingue a una empresa; el ocre la relaciona con Empleo.

## Consecuencias
- La vista previa de «Crear grupo» enseña la cabecera nueva (usa el mismo componente) y su caja de publicar ya no imita la barra de Facebook («Foto/vídeo · Etiquetar personas · Sentimiento»).
- La columna «Información» del grupo ya no repite la temática, el lugar ni los miembros (están en la cabecera); siguen en la pestaña Información.

## Ampliación (2026-11-19): propuestas pendientes aplicadas
- **Portadas de temas:** el extremo claro de 14 degradados de `lib/groups.ts` se ha oscurecido hasta 3,2:1 con el icono blanco (mínimo 3:1 para iconos), sin cambiar el tono.
- **Confirmaciones:** nuevo `components/ConfirmDialog.tsx` (`useConfirm()`) para acciones que no se pueden deshacer: eliminar grupo, eliminar oferta y retirar candidatura. Ya no queda ningún `window.confirm`.
- **Pestañas del grupo:** la abierta va en la URL (`?pestana=informacion|miembros`) y siguen el patrón de lista de pestañas: `aria-controls`, solo la activa entra con Tab, y las flechas, Inicio y Fin cambian de pestaña.
- **Título del grupo:** 28 px en el móvil y 40 px en ordenador, la misma escala que las cabeceras de sección.
- **Etiqueta «Administrador»:** `rounded-[6px] bg-brand-50 text-brand-700`. El fosforito queda solo para lo activo y lo nuevo.
