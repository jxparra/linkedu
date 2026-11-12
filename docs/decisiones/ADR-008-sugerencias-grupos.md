# ADR-008 — Grupos de Social y cómo se sugieren

- **Fecha:** 2026-11-10
- **Estado:** aceptada

## Contexto
La sección **Social** pasa a ser de **grupos**, tomando como referencia la pantalla de Grupos de Facebook (`Tfc interfaz/Social`): Tu feed, Sugerencias, Tus grupos y Crear grupo. La pantalla de Sugerencias tiene tres apartados y cada uno tenía que seguir una regla distinta:

1. **Sugerencias para ti**: según el perfil de cada usuario.
2. **Populares cerca de ti**: los grupos más populares de temas que interesan a cualquiera, aunque no sean de su ámbito.
3. **Más sugerencias**: unos relacionados con su perfil y otros no, para que también descubra cosas nuevas.

## Decisión

### Datos
- Los grupos son filas de **`communities`** con `type = "group"`. Así reutilizan los miembros, las publicaciones (`posts.community_id`), las tendencias y el buscador que ya existían.
- Columnas nuevas en `communities`: `topic` (temática), `privacy` (`public` | `private`), `cover_url`, `province` (vacía = online), `creator_id` y `created_at`.
- `community_members.role`: `admin` | `member`. Quien crea el grupo es administrador. Si el último administrador se va, pasa a serlo quien lleve más tiempo dentro.
- Tabla nueva **`community_dismissals`**: grupos que el usuario quita con la «X». No vuelven a salirle.
- **23 temáticas fijas**. 8 son de un ámbito concreto (Programación, Salud, Derecho…) y 15 interesan a cualquiera (Deportes, Pisos, Quedadas, Idiomas…). Están en `backend/app/services/groups.py`.

### Intereses del usuario (afinidad por temática)
| De dónde sale | Peso |
|---|---|
| Sus estudios (p. ej., DAW → Programación y Tecnología) o el sector de su empresa | +3 |
| Cada grupo en el que ya está | +2 |
| "Me gusta" en publicaciones de grupos | +0,5 cada uno |
| Ser estudiante (Estudiar juntos) | +1 |

**Zona:** la provincia del centro de estudios o, si no hay, su ciudad. En las empresas, su ubicación.

**Popularidad** de un grupo = miembros + 4 × publicaciones de la última semana.

### Los tres apartados
1. **Para ti**: grupos con afinidad > 0. Puntuación = afinidad × (1 + log(popularidad)) + 2 si es de su provincia + 1,5 por cada persona que sigue y está dentro. Se muestra el 60 % más afín (mínimo 4, máximo 10) y el resto pasa a «Más sugerencias». Cada tarjeta dice por qué sale: «Porque estudias DAW», «2 personas que sigues están aquí», «Te interesa Idiomas».
2. **Cerca de ti**: solo temáticas para cualquiera, de su provincia o con 3 o más miembros de ella, ordenadas por popularidad. Si hay menos de 4, se completa con los más populares de toda la app («Popular en StudyHub»).
3. **Más sugerencias**: alterna uno **relacionado** con su perfil y uno **nuevo** (temática con afinidad 0). Los nuevos van rotando: uno de cada temática y, después, el segundo de cada una. El orden de las temáticas nuevas depende de su popularidad, con algo de azar que **cambia cada día** (semilla = usuario + fecha), para que no salga siempre lo mismo.

Nunca se sugieren grupos a los que ya pertenece, los que ha quitado ni los de **otra provincia** (unas quedadas en Sevilla no le sirven a quien vive en Madrid). Los grupos online sí.

### Privacidad
- **Público:** cualquiera ve los miembros y las publicaciones.
- **Privado:** solo los miembros. Sus publicaciones no salen en el inicio ni se pueden abrir por enlace ni ver sus comentarios si no eres miembro (`visible_to()` en `routers/posts.py`).
- Unirse es inmediato también en los privados. Pedir aprobación a un administrador queda para la fase 2.
- Al eliminar un grupo se borran también sus publicaciones. Si no, las de un grupo privado pasarían a ser públicas.

## Alternativas
| Opción | Por qué no |
|---|---|
| Tabla `groups` separada de `communities` | Duplicaría miembros, publicaciones y buscador |
| Etiquetas libres en lugar de temáticas fijas | Sin una lista cerrada no se puede relacionar «DAW» con «Programación» ni distinguir lo universal |
| Filtrado colaborativo («gente como tú se unió a…») | Con pocos usuarios da resultados pobres. Se puede añadir más adelante como un peso más |
| Orden aleatorio puro en «Más sugerencias» | Cambiaría en cada recarga y sacaría grupos sin actividad |

## Consecuencias
- Todo se calcula en Python en cada petición. Con 34 grupos es instantáneo. Con miles habría que guardar la popularidad en una tabla y recalcularla cada hora.
- La afinidad es explicable: cada tarjeta dice por qué sale, cosa útil para defender el TFC.
- Datos de prueba: 34 grupos en 5 provincias más los online, 42 estudiantes extra (`extra01…extra42@demo.studyhub`) para que haya miembros de varias ciudades, y publicaciones en 15 grupos.
