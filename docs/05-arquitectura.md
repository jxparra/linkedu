# Arquitectura

```mermaid
flowchart TD
    U[Navegador] -->|HTTPS| F[Next.js<br/>React + TS + Tailwind]
    F -->|REST + JWT| B[FastAPI<br/>Python]
    B -->|SQLAlchemy| DB[(PostgreSQL)]
    B --> S[Almacenamiento de archivos<br/>fotos, logos, apuntes]
    B --> M[Servicio de email<br/>códigos de verificación]
    B -->|HTTPS| E[API de ESCO<br/>Comisión Europea<br/>sugerencias de puestos]
```

## Servicios externos
- **ESCO** (`https://ec.europa.eu/esco/api`): sugerencias de puestos para el buscador de Empleo. Caché de 24 h y lista local si no responde → [[decisiones/ADR-005-puestos-esco]].

## Organización del código
- `backend/app/routers/`: un archivo por grupo de endpoints (auth, posts, jobs, stats, catalog…)
- `backend/app/services/`: lógica compartida (people, occupations, stats)
- `frontend/src/app/`: una carpeta por pantalla (`empleo`, `guardados`, `estadisticas`, `ajustes`…)
- `frontend/src/lib/`: llamadas a la API (`api.ts`), datos de Empleo (`jobs.ts`) e idioma (`i18n.ts`)

## Más adelante (fase 2)
- **Redis**: caché y notificaciones en tiempo real
- **WebSockets**: chat
- **Servicio de IA**: recomendaciones de ofertas y comunidades

## Despliegue (por decidir)
- Frontend: Vercel
- Backend + BD: Railway / Render / VPS con Docker
