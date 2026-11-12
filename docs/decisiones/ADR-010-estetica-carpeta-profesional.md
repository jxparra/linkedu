# ADR-010 — Estética «Carpeta profesional» y modo oscuro

- **Fecha:** 2026-11-12
- **Estado:** en prueba (rama `estetica-carpeta`)

## Contexto
Con el azul cobalto ([[decisiones/ADR-002-paleta-cobalto]]), StudyHub se confundía con LinkedIn e InfoJobs. Se pedía una estética llamativa y única, pero profesional (también tiene que convencer a las empresas), con contraste coherente y modo oscuro.

## Decisión
- **Seguir con Next.js + Tailwind.** El aspecto lo dan los tokens, las fuentes y los componentes, no el framework. Pasar a Angular obligaría a rehacer todo el frontend sin ninguna mejora visible.
- **Coral como color de marca** (nadie lo usa en empleo), con texto blanco (contraste 4,96:1), y **fondo cálido**.
- **Un color por sección:** coral (Social), turquesa (Empleo) y violeta (Foros), solo como fondo suave en la navegación y las etiquetas.
- **Ruido controlado:** borde fino, sombras suaves y barra superior blanca. Títulos en Plus Jakarta Sans y texto en DM Sans.
- **Modo oscuro con tokens:** cada color tiene su valor oscuro en `globals.css`. Se elige en Ajustes (Claro / Oscuro / Como el sistema).
- Las reglas quedan en la skill del proyecto `.claude/skills/studyhub-ui`, para aplicarlas en cada pantalla nueva.

## Alternativas
| Opción | Por qué no |
|---|---|
| Pasar a Angular | No cambia el aspecto. Habría que rehacer 78 archivos con la entrega a 2 semanas |
| «Subrayado» (cuaderno, amarillo de subrayador, verde petróleo) | Buena opción, pero menos distinta de una red profesional |
| «Ciruela» (morado y mandarina) | Demasiado sobria para lo que se buscaba |
| «Carpeta» original (bordes negros de 2 px, sombras desplazadas, barra amarilla, Unbounded) | Llamativa pero infantil: perdía profesionalidad. Capturas en `assets/pantallas-v6-carpeta/primera-version/` |

## Consecuencias
- Unos 200 colores fijos (`bg-white`, `text-white` sobre botones) pasan a tokens. Lo que se haga nuevo tiene que usar tokens, o se rompe el modo oscuro.
- Todas las parejas de texto y fondo cumplen WCAG AA en los dos temas.
- Capturas en `assets/pantallas-v6-carpeta/`.
