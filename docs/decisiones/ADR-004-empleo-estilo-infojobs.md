# ADR-004 — Empleo al estilo InfoJobs

- **Fecha:** 2026-11-09
- **Estado:** aceptada

## Contexto
Empleo es lo que diferencia StudyHub. Hacía falta decidir cómo se busca, cómo se filtra y cómo sigue el estudiante su candidatura, y que fuera familiar para quien ya busca trabajo.

## Decisión
Copiar el funcionamiento de **InfoJobs**, adaptado a estudiantes:
- Buscador "Busco oferta de..." + provincia + BUSCAR (boceto propio).
- Filtros con contador de ofertas por opción: fecha de publicación, tipo de contrato, modalidad, jornada, categoría y "para mis estudios".
- Las **21 categorías de InfoJobs** (Administración de empresas, Atención a clientes, Compras, logística y almacén, Legal, Sector Farmacéutico…).
- Estados de la candidatura con los nombres de InfoJobs: **Inscrito → CV leído → En proceso → Seleccionado / Descartado**. Al abrir la empresa los candidatos, los nuevos pasan solos a "CV leído".
- Tipos de contrato pensados para estudiantes: trabajo puntual, prácticas, temporal, indefinido y freelance.
- Las ofertas en remoto también salen al buscar en una provincia.
- La búsqueda se guarda en la URL (se puede compartir y funciona "atrás").

## Alternativas
| Opción | Por qué no |
|---|---|
| Estilo LinkedIn Empleos | Más centrado en perfiles profesionales con experiencia; InfoJobs es más conocido en España para primeros empleos |
| Solo una lista de ofertas sin filtros | Con decenas de ofertas no se encuentra nada |
| Copiar todos los filtros de InfoJobs (experiencia mínima, estudios mínimos, salario…) | Para estudiantes casi siempre es "sin experiencia"; se puede añadir en la fase 2 |

## Consecuencias
- Tabla `jobs` ampliada (categoría, jornada, modalidad, provincia, periodo del sueldo, vacantes, estudios recomendados, requisitos) → [[04-base-datos]].
- Hay que mantener la lista de categorías igual en frontend (`lib/jobs.ts`) y en los datos de prueba.
