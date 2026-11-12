# ADR-005 — Sugerencias de puestos con ESCO

- **Fecha:** 2026-11-09
- **Estado:** aceptada (pendiente de probar la API en local)

## Contexto
En "Busco oferta de..." InfoJobs sugiere puestos muy concretos mientras escribes, y no enseña una lista con todos. Hacía falta una fuente de puestos con mucha variedad y en español.

## Decisión
Usar la API de **ESCO** (European Skills, Competences, Qualifications and Occupations), la clasificación europea de ocupaciones de la Comisión Europea:
- Es gratuita, sin clave y tiene unas 3.000 ocupaciones en español con muchas variantes ("camarero de barra", "camarero de pisos", "sumiller"…).
- La usa, por ejemplo, el buscador de Monster España.
- El backend hace de intermediario: `GET /catalog/occupations?q=` → `https://ec.europa.eu/esco/api/search?language=es&type=occupation`.
- Las respuestas se guardan 24 h en memoria.
- Si no hay internet o ESCO falla, se usa una **lista local** de ~100 puestos habituales (útil en la defensa si falla la wifi).
- Las etiquetas de ESCO ("camarero/camarera") se convierten al estilo InfoJobs ("Camarero/a"). Al buscar, se prueban las variantes (camarero, camarera, camarero/a).
- Las sugerencias salen desde 2 letras; sin escribir no se ve ninguna lista.

## Alternativas
| Opción | Por qué no |
|---|---|
| Lista de puestos escrita a mano | Poca variedad y poco específica |
| CNO-11 (INE) | Unas 500 ocupaciones, menos detalladas y sin API |
| API de InfoJobs | Requiere registrarse como desarrollador y está pensada para sus propias ofertas |
| Llamar a ESCO desde el navegador | Depende de que ESCO permita CORS y no se podría poner la lista de reserva |

## Consecuencias
- El backend necesita salida a internet (usa `httpx`, que ya viene con FastAPI).
- Código: `backend/app/services/occupations.py`.
- En la memoria hay que citar ESCO como fuente de datos.
