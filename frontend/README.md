# StudyHub — Frontend

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4.

```bash
npm install
copy .env.example .env.local
npm run dev
```

- `src/app/` — páginas (`/`, `/login`, `/registro/...`, `/inicio`)
- `src/components/` — componentes del sistema de diseño (Button, Field, Checkbox, Autocomplete, OnboardingShell…)
- `src/lib/api.ts` — cliente de la API y gestión del token
- `src/app/globals.css` — tokens de diseño (colores, radios, tipografía) en `@theme`
