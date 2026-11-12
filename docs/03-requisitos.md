# Requisitos y MVP

## 🟢 MVP (obligatorio)

### Cuentas
- [x] Registro con email y contraseña
- [ ] Registro con Google / Microsoft
- [x] Verificación de email con código
- [x] Elegir tipo de cuenta: **estudiante** o **empresa**
- [x] Login / logout
- [ ] Recuperar contraseña

### Perfil de estudiante
- [x] Nombre, @usuario, foto, biografía, ubicación
- [x] Centro, estudios y curso

### Perfil de empresa
- [x] Nombre, sector, ubicación, logo, web
- [x] Persona de contacto

### 💼 Trabajos
- [x] La empresa publica, edita y cierra ofertas (puntual / prácticas / temporal / indefinido / freelance)
- [x] El estudiante ve, filtra y se postula a ofertas
- [x] La empresa ve las candidaturas y cambia su estado
- [x] El estudiante sigue el estado de su candidatura (Inscrito → CV leído → En proceso → Seleccionado / Descartado)

### 💬 Comunidad
- [x] Centros, estudios y asignaturas
- [ ] Comunidades (foros) por estudios / asignatura / centro
- [x] Unirse y salir de una comunidad (grupos de Social)
- [x] Publicar en una comunidad (pregunta, recurso, debate)
- [x] Comentarios y likes
- [x] Seguir / dejar de seguir usuarios
- [x] Feed con publicaciones de lo que sigues

### ⭐ Reseñas
- [ ] Valorar carreras, centros y asignaturas con criterios fijos
- [ ] Ver la media y las reseñas de cada uno

### Sistema
- [x] Búsqueda de usuarios y comunidades
- [x] Búsqueda de ofertas (puesto, provincia, filtros) → [[diseno/empleo]]
- [ ] Búsqueda de estudios
- [x] Notificaciones
- [x] Reportar contenido
- [ ] Bloquear usuarios

## ✅ Hecho aunque estaba fuera del MVP
- Mensajes privados (sin tiempo real)
- Varias fotos/vídeos, GIF, grabar vídeo en publicaciones
- Guardar publicaciones (sección Guardados)
- Dejar de seguir con confirmación y animación de compartir
- Sugerencias de puestos con ESCO → [[decisiones/ADR-005-puestos-esco]]
- Estadísticas del usuario → [[decisiones/ADR-006-estadisticas]]
- Grupos en Social con sugerencias personalizadas → [[decisiones/ADR-008-sugerencias-grupos]]
- Ajustes y cambio de idioma (español / inglés, parcial) → [[decisiones/ADR-007-idioma]]

## 🔴 Fuera del MVP (fase 2)
- Chat en tiempo real
- IA (recomendaciones, resúmenes)
- Matching estudiante ↔ oferta
- Reseñas de docentes con nombre (ver [[decisiones/ADR-003-resenas-docentes]])
- Mapa de titulaciones en España
- App móvil
- Pagos dentro de la app
- Gamificación

## Requisitos no funcionales
- Contraseñas con hash (bcrypt / argon2)
- Accesibilidad WCAG 2.1 AA en colores y formularios
- Diseño responsive (móvil primero)
- Cumplimiento RGPD / LOPDGDD: consentimiento, edad mínima, derecho de borrado
