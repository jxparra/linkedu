# Empleo

> Por qué funciona así → [[decisiones/ADR-004-empleo-estilo-infojobs]] · Puestos → [[decisiones/ADR-005-puestos-esco]]

## Pantallas
| Ruta | Qué es |
|---|---|
| `/empleo` | Buscador + filtros + resultados |
| `/empleo/[id]` | Detalle de una oferta |
| `/empleo/mias` | Mis candidaturas (estudiante) · Mis ofertas (empresa) |
| `/empleo/publicar` | Publicar oferta (empresa). Con `?editar=ID`, editarla |

## Buscador (boceto propio)
Todo en una fila y sin tarjeta alrededor: **"Busco oferta de..."** · **"En..."** · **BUSCAR**. Campos con borde gris, esquinas casi rectas y texto en negrita; el desplegable de provincia lleva una "V".

![[assets/pantallas-v3/empleo-provincias.png]]

- **Provincias:** Toda España, El extranjero, "Más comunes" (Madrid, Granada, Sevilla, Almería, Valencia) y todas por orden alfabético. Se puede usar con el teclado (flechas, Enter, Esc y saltar por letra).
- **"Busco oferta de...":** no enseña nada al entrar. Desde 2 letras salen "Buscar «texto»", **Puestos** (ESCO) y las **Categorías** que coinciden. Al elegir una categoría se filtra por ella.

![[assets/pantallas-v3/empleo-sugerencias.png]]

## Resultados
- Título: "N ofertas de trabajo de «puesto» en provincia".
- Filtros a la izquierda con el número de ofertas de cada opción (en móvil, botón "Filtros" a pantalla completa).
- Ordenar por relevancia (primero las de tu búsqueda y tus estudios), más recientes o mejor pagadas.
- Tarjeta de oferta: logo, etiquetas (**Nueva** si tiene menos de 24 h, **Para tus estudios**, estado de tu candidatura), puesto, empresa, lugar, fecha, inscritos, tipo, jornada y sueldo.

![[assets/pantallas-v3/empleo-busqueda.png]]

## Oferta
- Estudiante: botón **Inscribirme en esta oferta** → panel con carta de presentación opcional. Después, seguimiento: **Inscrito → CV leído → En proceso → Seleccionado** (o Descartado). Puede retirar la candidatura mientras esté en Inscrito o CV leído.
- Empresa: Editar, Cerrar / Reabrir, Eliminar y la lista de **Candidatos** con su carta, botón de mensaje y selector de estado.

![[assets/pantallas-v3/oferta-estudiante.png]]
![[assets/pantallas-v3/oferta-empresa.png]]
![[assets/pantallas-v3/mis-ofertas.png]]
![[assets/pantallas-v3/publicar-oferta.png]]

## Notificaciones
- A la empresa: "X se ha inscrito en tu oferta".
- Al estudiante: "ha leído tu candidatura", "ha pasado tu candidatura a «En proceso»", "te ha seleccionado", "ha descartado tu candidatura".
- Al pulsarlas se abre la oferta.

## Datos de prueba
62 ofertas de las 21 categorías, en varias provincias y en el extranjero (Lisboa, Dublín), publicadas por 21 empresas inventadas (todas con "(demo)"). Se cargan con `python -m app.seed` o solas al arrancar el backend si no hay ninguna oferta.
