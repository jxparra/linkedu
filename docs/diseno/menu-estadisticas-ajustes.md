# Menú "Yo", Estadísticas, Ajustes e Idioma

> Inspirado en LinkedIn. Decisiones → [[decisiones/ADR-006-estadisticas]] · [[decisiones/ADR-007-idioma]]

## Menú de la foto (arriba a la derecha)
Debajo de la foto pone **Yo ▾**. Al pulsar se abre el panel; se cierra al pulsar fuera, con Esc o al cambiar de página.

1. Tarjeta con foto, nombre, estudios y "Ver tu perfil" → `/perfil`
2. **Estadísticas** → `/estadisticas`
3. **Publicaciones guardadas** → `/guardados`
4. **Mis candidaturas** (estudiante) / **Mis ofertas de empleo** (empresa) → `/empleo/mias`
5. **Ajustes y privacidad** → `/ajustes`
6. **Idioma** → `/ajustes/idioma` (acceso rápido)
7. **Cerrar sesión**

![[assets/pantallas-v3/menu-yo.png]]

## Estadísticas (`/estadisticas`)
- Columna izquierda: portada, foto, nombre y estudios; pestañas **Rendimiento** y **Contenido**; botón **Crear publicación**.
- **Rendimiento:**
  - Análisis de público: total de seguidores, visualizaciones del perfil, apariciones en búsquedas.
  - Análisis de contenido: impresiones de las publicaciones.
  - Cada número con la variación frente al periodo anterior: ▲ verde si sube, ▼ rojo si baja, ● gris si igual. Periodo: 7, 28 o 90 días.
- **Contenido:** cada publicación con impresiones (totales y del periodo), me gusta, comentarios y compartidos.

![[assets/pantallas-v3/estadisticas.png]]
![[assets/pantallas-v3/estadisticas-contenido.png]]

## Ajustes (`/ajustes`)
Secciones: **Preferencias de la cuenta** · Inicio de sesión y seguridad · Visibilidad · Privacidad de datos · Notificaciones.

Preferencias de la cuenta:
- Información del perfil: nombre, ubicación y estudios (→ perfil) · verificaciones
- Visualización: modo oscuro (*Próximamente*)
- Preferencias generales: **Idioma**
- Cuenta: tipo de cuenta, email, cerrar sesión

Regla: lo que no está hecho sale con la etiqueta **Próximamente** y no se puede pulsar (nada de botones que no hacen nada).

![[assets/pantallas-v3/ajustes.png]]

## Idioma (`/ajustes/idioma`)
Desplegable Español / English con "Volver". Se aplica al momento y se guarda en el navegador.

![[assets/pantallas-v3/idioma.png]]

## Guardados (`/guardados`)
- En el menú (···) de cada publicación: **Guardar** → **Guardado** con el icono relleno en negro.
- La sección lista lo guardado (lo último primero). Al quitar una: "Quitada de guardados" + **Deshacer**.
- Si no hay nada: "No tienes nada guardado" + cómo guardar.

![[assets/pantallas-v3/menu-guardado.png]]
![[assets/pantallas-v3/guardados.png]]
![[assets/pantallas-v3/guardados-vacio.png]]

## Seguir y compartir
- "+ Seguir" → "✓ Siguiendo". Al pulsar Siguiendo: panel **"¿Dejar de seguir a X?"** con botón rojo y Cancelar (con el foco).
- Compartir: animación propia (flechas que giran, anillo ámbar, rayos y "+1") → [[diseno/sistema-diseno]].

![[assets/pantallas-v3/dejar-de-seguir.png]]
![[assets/pantallas-v3/animacion-compartir.png]]
