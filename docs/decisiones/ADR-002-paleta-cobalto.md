# ADR-002 — Paleta: cobalto + ámbar en lugar de rojo

- **Fecha:** 2026-11-05
- **Estado:** propuesta

## Contexto
El diseño v1 usaba rojo puro (#FF0000) como color principal, con verde y azul también como colores de marca.

## Problemas
- El rojo en una interfaz significa error o peligro, y choca con los mensajes de error.
- Blanco sobre #FF0000 da 4.0:1, por debajo del mínimo WCAG AA (4.5:1).
- Transmite urgencia; las empresas buscan confianza.
- Tres colores de marca sin función clara.

## Decisión
- Principal: cobalto `#2952E3` (6.2:1 con blanco), que transmite confianza a las empresas y claridad en las acciones.
- Acento: ámbar `#F5A524`, que aporta energía para los estudiantes y es el color natural de las estrellas de las reseñas.
- El rojo queda reservado para errores.

Detalle → [[diseno/sistema-diseno]]

## Alternativa
Mantener el rojo `#C62828` solo en el logo y en detalles de marca, con los botones en tinta `#14161F`.
