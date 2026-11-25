# Pendientes

> Actualizado: 2026-11-25. Marca lo que vayas haciendo. Último día → [[diario/2026-11-25]]

## 🔴 Primero (antes de seguir programando)
- [ ] **Confirmar con el tutor qué se entrega en ~2 semanas** y en qué formato (¿demo, memoria, presentación?)
- [ ] Conseguir la **estructura oficial de la memoria** y sustituir [[memoria/00-indice]]
- [ ] Decidir edad mínima y reseñas de docentes → [[decisiones/ADR-003-resenas-docentes]]
- [x] **Guardar el trabajo en Git** → https://github.com/jxparra/StudyHub (2026-11-12)

## 🎨 Estética «Pizarra y fosforito» (rama `estetica-pizarra`) → [[decisiones/ADR-011-estetica-pizarra-fosforito]]
- [x] Rediseño completo para no parecerse a LinkedIn, Facebook ni InfoJobs (2026-11-19)
- [ ] **Decidir si se queda** «Pizarra y fosforito» y unir la rama a `main`
- [x] Mirar en claro y oscuro las pantallas que no se han revisado a mano (revisión externa del 2026-11-24, todas las rutas en claro/oscuro y ordenador/móvil)

### Anterior: «Carpeta profesional» (rama `estetica-carpeta`) → [[decisiones/ADR-010-estetica-carpeta-profesional]]
- [x] Elegir estética entre 3 propuestas → «Carpeta», luego versión profesional
- [x] Modo oscuro (Ajustes → Visualización)
- [x] Color principal azul petróleo (antes coral), Empleo en verde
- [x] Fondo gris con tarjetas blancas, cabecera de publicaciones de grupo/foro, panel «Publicaciones de interés»
- [x] Dejar de seguir y salir de grupos/foros desde tarjetas y panel
- [ ] **Decidir si la estética se queda** y unir la rama a `main` → https://github.com/jxparra/StudyHub/pull/new/estetica-carpeta
- [ ] Revisar con la estética nueva las pantallas de **Empresa** (publicar oferta, Mis ofertas, candidatos) con `technova@demo.studyhub`
- [ ] Revisar el resto de pasos del **registro** (estudios, comunidades, foto, logo) en claro y oscuro
- [ ] Panel «Publicaciones de interés»: ¿excluir publicaciones de grupos en los que ya estás? (ahora pueden repetirse con el feed)
- [ ] Panel de interés en **móvil** (ahora solo sale en pantallas anchas)
- [ ] Traducir al inglés los textos nuevos (panel de interés, diálogos de salir, Foros)

## ▶️ Próximo día (por este orden)
1. **Revisar la estética «Enlace» (logo nuevo, ADR-018)** en todas las pantallas y unir la rama `estetica-pizarra` a `main`.
2. **Editar perfil completo:** estudios, foto y descripción (ahora `/perfil/editar` solo cambia nombre, @usuario y ubicación, o los datos de la empresa).
3. **Repasar los estudios recomendados de las ofertas de prueba** (`backend/app/seed.py`): la de auxiliar de enfermería estaba unida a Medicina; puede haber más así.
4. **Registro:** valorar elegir estudiante o empresa antes del email (propuesta del revisor externo).
5. **Estadísticas:** métricas propias de estudiante (ofertas vistas, candidaturas en proceso, respuestas en foros). Necesita backend.
6. Siguiente bloque grande: **Reseñas** (tabla `reviews` ya creada).

## 👩‍🏫 Docentes y tipos de cuenta (2026-11-25) → [[decisiones/ADR-017-tipos-de-cuenta-y-docentes]]
- [x] Cuenta de docente, avatares por tipo y etiquetas en todas partes
- [ ] Revisar en claro y oscuro el registro de docente completo
- [ ] PostgreSQL de la entrega: el tipo `user_role` necesita el valor `teacher`
- [ ] ¿Varios centros o estudios por docente? (ahora uno)

## 🔍 Revisión externa (2026-11-24) → [[decisiones/ADR-016-movimiento-y-reborde-encaja-contigo]]
Aplicadas la prioridad alta, la media y la baja (ver diario del 2026-11-24). «(demo)» en las empresas se queda a propósito: deja claro que son inventadas.
- [x] Estadísticas (fondo de pizarra), Ajustes → Idioma, editor de grupos y estado de candidatura siguen con `select` nativo
- [ ] Editar perfil: cambiar estudios, foto y descripción (ahora solo nombre, @usuario y ubicación, o datos de la empresa)
- [x] Botón «Editar perfil» en tu propio perfil; «2°» → «2º curso»
- [x] «Buscar ofertas» sale dos veces en la cabecera de Empleo (pestaña y botón): la pestaña, «Ofertas»
- [x] Mismo ancho de contenido en todas las páginas (Ajustes y Estadísticas usan 1280 px)
- [x] Un solo estilo de «seleccionado» y un solo tratamiento de título por nivel
- [x] Textos de unirse iguales en todas partes («Unirme» / «Unido»)
- [x] Desplegables: el propio en vez del `select` nativo (Ordenar por, Categoría)
- [x] Dentro de un grupo, no repetir el nombre del grupo y «Unido» en cada publicación
- [x] 3D de fondo: menos presencia (sobre todo en oscuro y detrás de «Publicar oferta» en móvil); no montarlo con `prefers-reduced-motion`
- [x] Mensajes: lista más ancha (360–380 px) y abrir la primera conversación
- [x] Empleo en móvil: cabecera más compacta
- [x] Notificaciones: distinguir leídas y no leídas; Estadísticas: «—» si los dos periodos son 0
- [x] Enlace «Saltar al contenido»; quitar «(demo)» y «Equipo StudyHub» de los datos de prueba
- [ ] Registro: elegir estudiante o empresa antes del email (propuesta del revisor)

## 🟡 Siguiente bloque de código (elige uno)
- [x] **Empleo** (al estilo InfoJobs) → [[diseno/empleo]]
- [x] **Social: grupos** (sugerencias para ti, cerca de ti y más; crear, unirse, publicar dentro) → [[diseno/social]]
- [x] **Foros / comunidades** dentro de Social → [[decisiones/ADR-009-foros-dentro-de-social]]
- [ ] **Reseñas** de carreras, centros y asignaturas con criterios fijos (tabla `reviews` ya existe)

## 🟢 Mejoras pendientes de lo que ya hay
- [ ] Foto de perfil y logo de empresa (en el registro solo se previsualizan)
- [x] Guardar publicaciones (sección Guardados)
- [ ] Botón "Enviar" de las publicaciones (mandar por mensaje)
- [ ] Editar perfil (biografía, foto, estudios)
- [ ] Feed personalizado: primero gente que sigues y tus comunidades
- [ ] Recuperar contraseña
- [ ] Envío real del email de verificación
- [ ] Login con Google y Microsoft
- [ ] Eventos, Reels (ahora "Próximamente")
- [ ] Grupos: pedir permiso para entrar en los privados, nombrar más administradores, quitar miembros
- [x] Foros: van dentro de Social (ADR-009)
- [ ] Foros de **asignaturas** (`type = "subject"`): aún no se crean en los datos de prueba
- [ ] Perfil: ¿ocultar los grupos **privados** cuando lo ve otra persona?
- [ ] Guardar también ofertas de empleo en Guardados
- [ ] Traducir al inglés el resto de pantallas (inicio, empleo, registro…) → [[decisiones/ADR-007-idioma]]
- [x] Modo oscuro (rama `estetica-carpeta`)
- [ ] El resto de ajustes que salen como "Próximamente"
- [ ] Filtros de Empleo que faltan respecto a InfoJobs: experiencia mínima, estudios mínimos, rango de salario

## 🧪 Comprobar en local
- [ ] **ESCO:** escribir en "Busco oferta de..." y ver si abajo pone "Puestos: clasificación europea ESCO". Si no, mirar en la consola del backend el aviso "ESCO no disponible"
- [ ] Que salgan las 62 ofertas en Empleo y los números en Estadísticas (se cargan solos al arrancar)

## 🔵 Para la entrega final
- [ ] Pasar de SQLite a PostgreSQL (`docker compose up -d` + cambiar `DATABASE_URL` en `backend/.env`)
- [ ] Migraciones con Alembic
- [ ] Tests básicos del backend
- [ ] Desplegar (frontend en Vercel, backend + BD en Railway/Render)
- [ ] Capturas y vídeo de demo para la memoria y la presentación

---

## Cómo retomarlo
> ⚠️ Rama de trabajo actual: **`estetica-pizarra`** (`git switch estetica-pizarra`), que sale de `estetica-carpeta`. En `main` está Foros sin ninguna de las dos estéticas.

**Terminal 1 (backend):**
```powershell
cd $HOME\Documents\StudyHub\backend
.venv\Scripts\activate
fastapi dev app/main.py
```
**Terminal 2 (frontend):**
```powershell
cd $HOME\Documents\StudyHub\frontend
npm run dev
```
Abre http://localhost:3000 · Cuentas de prueba: `irene@demo.studyhub` (estudiante) y `technova@demo.studyhub` (empresa), contraseña `Demo1234` (más en el `README.md`).

Si faltan datos de prueba: `python -m app.seed` dentro de `backend` con el entorno activado.

## Guardar cambios en Git
Repositorio: https://github.com/jxparra/StudyHub
```powershell
cd $HOME\Documents\StudyHub
git add .
git commit -m "Qué has hecho"
git push
```
