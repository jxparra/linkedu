# ADR-001 — Stack tecnológico

- **Fecha:** 2026-11-05
- **Estado:** aceptada

## Contexto
Necesito un stack moderno, que pueda defender ante el tribunal y que me permita desarrollar el MVP en el plazo del TFC.

## Decisión
Next.js + React + TypeScript en el frontend, FastAPI + SQLAlchemy en el backend, PostgreSQL como base de datos, JWT para la autenticación y Docker para el entorno.

## Alternativas
| Opción | Por qué no |
|---|---|
| Node/Express en el backend | Un solo lenguaje, pero FastAPI genera documentación automática (Swagger) y tiene validación con Pydantic |
| MySQL | PostgreSQL tiene mejor soporte de JSON y búsqueda de texto |
| Firebase | Menos control y menos que defender en la memoria |

## Consecuencias
- Dos lenguajes (TypeScript y Python): más carga, pero separación clara entre frontend y backend.
