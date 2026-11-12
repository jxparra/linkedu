# ADR-007 — Idioma de la interfaz

- **Fecha:** 2026-11-09
- **Estado:** aceptada (traducción parcial)

## Contexto
En Ajustes se quería una sección **Idioma** (como LinkedIn), con acceso rápido desde el menú de la foto.

## Decisión
- Idiomas: **español e inglés**.
- Sistema propio y sencillo (`frontend/src/lib/i18n.ts`): los textos se escriben en español y hay un diccionario con su traducción. `useT()` devuelve la función para traducir.
- La elección se guarda en el **navegador** (localStorage) y cambia la interfaz al momento, sin recargar.
- Traducido por ahora: barra superior, menús, menú de la foto, Ajustes y Estadísticas.

## Alternativas
| Opción | Por qué no |
|---|---|
| next-intl / i18next | Más configuración (rutas por idioma) para el tiempo que queda |
| Guardar el idioma en la cuenta (backend) | Más trabajo; se puede añadir después |
| Ofrecer catalán, gallego, euskera… | Sin traducciones reales sería engañoso |

## Consecuencias
- El resto de pantallas (inicio, empleo, registro…) siguen en español hasta que se añadan al diccionario.
- Para traducir una pantalla: envolver los textos con `t("...")` y añadirlos al diccionario `EN`.
