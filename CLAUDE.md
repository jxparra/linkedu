# Linkedu (antes StudyHub) — TFC

Red social para estudiantes y empresas: empleo (trabajos puntuales y prácticas), grupos, foros por estudios y opiniones. Toda la interfaz y la documentación, en español.

## Estructura
- `frontend/`: Next.js 15 + React 19 + TypeScript + Tailwind 4. Three.js para las escenas 3D.
- `backend/`: FastAPI + SQLAlchemy 2. En local usa SQLite (`backend/.env`); el `docker-compose.yml` (PostgreSQL) es para la entrega.
- `docs/`: vault de Obsidian. `diario/` (qué se hizo cada día), `decisiones/` (ADR-001…015), `diseno/sistema-diseno.md`, `pendientes.md`.

## Arrancar (dos terminales)
- Backend: `cd backend && .venv\Scripts\activate && fastapi dev app/main.py` → http://localhost:8000 (`/docs`)
- Frontend: `cd frontend && npm run dev` → http://localhost:3000
- Cuentas de prueba (contraseña `Demo1234`): `irene@demo.studyhub` (estudiante), `technova@demo.studyhub` (empresa).

## Reglas que ya nos han costado un disgusto
- **Nunca `next build` / `npm run build` con `npm run dev` en marcha**: sobrescribe `.next` y el servidor se queda sin estilos (arreglo: parar, borrar `frontend/.next`, `npm run dev`).
- No pasar Prettier por archivos enteros (el código usa líneas largas, ~150; reformatea lo que no se ha tocado).
- No usar `git checkout/reset/restore` sobre archivos con trabajo sin guardar.
- Nada `fixed` dentro de un contenedor con `transform` (la animación `.page-enter` usa `backwards` por eso); paneles a pantalla completa, con portal a `<body>`.
- Rejillas en móvil con `grid-cols-[minmax(0,1fr)]`, o se salen por la derecha.

## Diseño
- Antes de cualquier cambio visual, la skill del proyecto **`studyhub-ui`** (`.claude/skills/studyhub-ui/SKILL.md`): sistema «Pizarra y fosforito», tokens en `frontend/src/app/globals.css` (claro y oscuro), nada que recuerde a LinkedIn/Facebook/InfoJobs.
- Decisiones clave: ADR-011 (estética), 012 (3D y movimiento), 013 (nombre Linkedu), 014 (carpeta de grupo, confirmaciones), 015 (color por sección y menos columnas).
- Nombre visible: **Linkedu**. Nombres internos (`studyhub_*` en localStorage, carpetas, la skill, la BD) se quedan.

## Comprobar un cambio (desde `frontend/`)
- `npx tsc --noEmit -p .` y `npx eslint src`
- `python ../.claude/skills/studyhub-ui/scripts/audit_colors.py src` y `contrast.py "<texto>" "<fondo>"`
- Capturas claro/oscuro, ordenador/móvil: `MSYS_NO_PATHCONV=1 node scripts/capturas.mjs <carpeta> /inicio /empleo …`

## Agentes del proyecto (`.claude/agents/`)
- `revisor-web`: revisa la web y devuelve hallazgos priorizados; no toca código.
- `disenador-ui`: mejora la interfaz con las skills de diseño y la comprueba con capturas.

## Al terminar el día
Añadir lo hecho a `docs/diario/AAAA-MM-DD.md`, un ADR si hay decisión de diseño, y actualizar `docs/pendientes.md`.
