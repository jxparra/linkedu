# Pendientes

> Actualizado: 2026-11-12. Marca lo que vayas haciendo. Último día → [[diario/2026-11-10]]

## 🔴 Primero (antes de seguir programando)
- [ ] **Confirmar con el tutor qué se entrega en ~2 semanas** y en qué formato (¿demo, memoria, presentación?)
- [ ] Conseguir la **estructura oficial de la memoria** y sustituir [[memoria/00-indice]]
- [ ] Decidir edad mínima y reseñas de docentes → [[decisiones/ADR-003-resenas-docentes]]
- [x] **Guardar el trabajo en Git** → https://github.com/jxparra/StudyHub (2026-11-12)

## 🟡 Siguiente bloque de código (elige uno)
- [x] **Empleo** (al estilo InfoJobs) → [[diseno/empleo]]
- [x] **Social: grupos** (sugerencias para ti, cerca de ti y más; crear, unirse, publicar dentro) → [[diseno/social]]
- [ ] **Foros / comunidades:** página de cada comunidad con sus publicaciones, unirse/salir, publicar dentro
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
- [ ] Foros: decidir si las comunidades de estudios y centros son "foros" aparte o grupos de Social
- [ ] Guardar también ofertas de empleo en Guardados
- [ ] Traducir al inglés el resto de pantallas (inicio, empleo, registro…) → [[decisiones/ADR-007-idioma]]
- [ ] Modo oscuro y el resto de ajustes que salen como "Próximamente"
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
