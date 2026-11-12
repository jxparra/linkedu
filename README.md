# StudyHub

Red social para estudiantes y empresas: trabajos puntuales, comunidades y foros por estudios, y reseñas de carreras, universidades y docencia.

Trabajo de Fin de Ciclo (TFC) de Joaquín Parra.

## Estructura

| Carpeta | Contenido |
|---|---|
| `frontend/` | Next.js 15 + React 19 + TypeScript + Tailwind 4 |
| `backend/` | Python + FastAPI + SQLAlchemy 2 |
| `database/` | Scripts SQL, migraciones y datos de prueba |
| `docs/` | Documentación del proyecto (vault de Obsidian) |

## Qué funciona ya

- Landing
- Registro con email y contraseña (Google y Microsoft: solo el botón, pendiente)
- Verificación del email con código de 6 dígitos (en desarrollo el código se muestra en pantalla y en la consola del backend)
- Elección del tipo de cuenta: estudiante o empresa
- Onboarding de estudiante: nombre y @usuario → centro, estudios y curso → foto → comunidades sugeridas
- Onboarding de empresa: datos y persona de contacto → logo
- Login y cierre de sesión
- **Inicio**: feed de publicaciones, me gusta, compartir (con contadores de colores), seguir, ocultar y eliminar publicaciones, tendencias de comunidades. Versión móvil con barra inferior
- **Crear publicación** (panel central): elegir dónde se publica (público o una comunidad), foto/vídeo, GIF, grabar vídeo con la cámara, etiquetar personas, sentimiento/actividad y ubicación
- **Buscador** de personas, empresas y comunidades, con el resto de la pantalla oscurecida
- **Mensajes** privados y **notificaciones** (me gusta, seguidores, etiquetas…), con contador rojo solo cuando hay algo sin leer
- **Comentarios**: al pulsar "Comentar" se abre el panel de la publicación con los comentarios. Respuestas, "me gusta" en comentarios, ordenar (más pertinentes, más recientes, todos), ocultar, denunciar, eliminar, compartir enlace, emojis y fotos/GIF en comentarios
- **Varias fotos y vídeos por publicación** (hasta 10), con galería en el feed
- **Perfil** propio y de otros usuarios: publicaciones, seguidores, seguir y enviar mensaje. Muestra las 5 comunidades más recientes, con «Ver todas»
- **Empleo** (al estilo InfoJobs): el campo "Busco oferta de..." va sugiriendo puestos conforme escribes (desde 2 letras), sacados de ESCO, la clasificación europea de ocupaciones (con una lista local si no hay internet), y las categorías de InfoJobs que coinciden; buscador por puesto/empresa y provincia (Toda España, el extranjero, más comunes y todas), filtros con contador (fecha, tipo de contrato, modalidad, jornada, categoría, "para mis estudios"), orden por relevancia, fecha o sueldo, y paginación. La búsqueda se guarda en la URL
- **Oferta**: detalle con descripción, requisitos y datos de la empresa. El estudiante se inscribe con carta de presentación opcional y sigue su candidatura (Inscrito → CV leído → En proceso → Seleccionado/Descartado). La empresa ve los candidatos, les cambia el estado y puede editar, cerrar o eliminar la oferta
- **Publicar oferta** (empresas), **Mis ofertas** y **Mis candidaturas**, con notificaciones de inscripción y de cambios de estado
- **Guardados**: guardar y quitar publicaciones desde el menú (···). Guardada, la opción pasa a «Guardado» con el icono relleno en negro. La sección Guardados las lista (con "Deshacer" al quitar una) y avisa si no tienes nada guardado
- **Menú de tu foto** (arriba a la derecha, como el "Yo" de LinkedIn): tu perfil, Estadísticas, Publicaciones guardadas, Mis ofertas / Mis candidaturas, Ajustes y privacidad, Idioma y Cerrar sesión
- **Estadísticas**: Rendimiento (total de seguidores, visualizaciones del perfil, apariciones en búsquedas e impresiones de tus publicaciones, comparadas con el periodo anterior; 7, 28 o 90 días) y Contenido (cada publicación con impresiones, me gusta, comentarios y compartidos). Los datos se registran solos al abrir perfiles, buscar y ver el inicio (una vez al día por persona)
- **Ajustes**: preferencias de la cuenta, inicio de sesión y seguridad, visibilidad, privacidad y notificaciones (lo que aún no está hecho sale como "Próximamente")
- **Idioma**: español o inglés, se guarda en el navegador. Por ahora están traducidos la barra superior, los menús, el menú de tu foto, Ajustes y Estadísticas
- **Social (grupos)**, al estilo de Grupos de Facebook: **Sugerencias** en tres apartados. «Para ti» sale de tus estudios, tus grupos y la gente que sigues; «Populares cerca de ti», de temas para cualquiera en tu provincia; «Más sugerencias» mezcla grupos relacionados contigo con temas nuevos. Cada tarjeta dice por qué se sugiere y se puede quitar con la «X». Además: **Tu feed**, **Tus grupos**, **buscar**, **crear grupo** con vista previa (ordenador/móvil), página del grupo con publicaciones, información y miembros, grupos públicos y privados, invitar, editar y eliminar. Ver `docs/decisiones/ADR-008-sugerencias-grupos.md`
- **Foros**, dentro de Social (`/social/foros`): las comunidades de tus estudios, de tu centro y generales. Primero salen las tuyas, con buscador, y cada foro se abre como la página de un grupo. Ver `docs/decisiones/ADR-009-foros-dentro-de-social.md`
- Secciones Eventos y Reels con página de "Próximamente"
- Todas las tablas del modelo de datos creadas (trabajos, comunidades, publicaciones, reseñas, notificaciones…)

## Cómo arrancarlo

Necesitas **Docker**, **Python 3.11+** y **Node.js 20+**.

### 1. Base de datos

```bash
docker compose up -d
```

### 2. Backend (terminal 1)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows  (en Mac/Linux: source .venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env          # Windows  (en Mac/Linux: cp .env.example .env)
python -m app.seed              # carga centros, estudios, comunidades y publicaciones de prueba
fastapi dev app/main.py
```

- API: http://localhost:8000
- Documentación interactiva (Swagger): http://localhost:8000/docs

### 3. Frontend (terminal 2)

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Abre http://localhost:3000

## Cuentas de prueba

`python -m app.seed` crea contenido ficticio: 17 estudiantes y 4 empresas inventados (más 42 estudiantes `extra01…extra42@demo.studyhub` para los grupos) (más 17 empresas que solo publican ofertas), 62 ofertas de empleo de todas las categorías, 34 grupos en varias provincias, publicaciones de solo texto, texto con fotos, vídeos y vídeo + fotos + texto, conversaciones en los comentarios con respuestas, "me gusta", seguidores, mensajes y notificaciones. Las fotos y vídeos de prueba están en `backend/app/demo_media/`. Se puede ejecutar varias veces: solo añade lo que falta. También da mensajes y notificaciones sin leer a las cuentas reales que ya existan.

Contraseña de todas las cuentas de prueba: `Demo1234`

| Email | Tipo |
|---|---|
| irene@demo.studyhub | Estudiante · DAW, IES Zaidín-Vergeles, 2º (tiene mensajes y avisos sin leer) |
| marta@demo.studyhub | Estudiante · Ing. Informática, UGR, 1º |
| pablo@demo.studyhub | Estudiante · Máster, UV |
| lucia@demo.studyhub | Estudiante · Psicología, UGR, 2º |
| hugo@demo.studyhub | Estudiante · DAM, IES Hermenegildo Lanz, 1º |
| dani@ · sara@ · alvaro@ · nerea@demo.studyhub | Estudiantes |
| technova@ · eventos@ · equipo@demo.studyhub | Empresas |

## Endpoints

| Método | Ruta | Qué hace |
|---|---|---|
| POST | `/auth/register` | Crea la cuenta y envía el código |
| POST | `/auth/verify` | Verifica el email |
| POST | `/auth/resend` | Reenvía el código |
| POST | `/auth/login` | Inicia sesión (devuelve JWT) |
| GET | `/auth/me` | Usuario actual |
| POST | `/onboarding/account-type` | Estudiante o empresa |
| PUT | `/onboarding/student/identity` | Nombre, apellidos, @usuario, ubicación |
| PUT | `/onboarding/student/studies` | Centro, estudios, curso, edad |
| PUT | `/onboarding/company` | Datos de la empresa |
| POST | `/onboarding/communities` | Unirse a comunidades |
| POST | `/onboarding/finish` | Termina el onboarding |
| GET | `/catalog/schools?q=` | Buscar centros |
| GET | `/catalog/degrees?q=` | Buscar estudios |
| GET | `/catalog/occupations?q=` | Sugerencias de puestos (ESCO o lista local) |
| GET | `/catalog/communities/suggested` | Comunidades sugeridas |
| GET | `/feed` | Publicaciones del inicio |
| POST | `/posts` | Publicar |
| DELETE | `/posts/{id}` | Eliminar una publicación propia |
| POST / DELETE | `/posts/{id}/like` | Dar o quitar me gusta |
| POST / DELETE | `/posts/{id}/share` | Compartir o dejar de compartir |
| POST / DELETE | `/users/{id}/follow` | Seguir o dejar de seguir |
| GET | `/saved` | Publicaciones guardadas |
| POST / DELETE | `/posts/{id}/save` | Guardar o quitar de guardados |
| GET | `/stats/me?days=7` | Estadísticas de rendimiento |
| GET | `/stats/me/posts?days=7` | Estadísticas de cada publicación |
| GET | `/trends` | Comunidades con más actividad |
| GET | `/posts/{id}` | Una publicación |
| GET | `/posts/{id}/comments?sort=relevant\|recent\|all` | Comentarios y respuestas |
| POST | `/posts/{id}/comments` | Comentar o responder (`parent_id`) |
| DELETE | `/comments/{id}` | Eliminar comentario (el tuyo o en tu publicación) |
| POST / DELETE | `/comments/{id}/like` | Me gusta en un comentario |
| POST | `/reports` | Denunciar publicación, comentario o usuario |
| GET | `/users/{id}` | Perfil |
| GET | `/search?q=` | Buscar personas, empresas y comunidades |
| POST | `/uploads` | Subir foto, vídeo o GIF (máx. 25 MB) |
| GET | `/notifications` · `/notifications/unread-count` | Notificaciones |
| POST | `/notifications/read-all` | Marcar todas como leídas |
| GET | `/messages/conversations` · `/messages/unread-count` | Conversaciones |
| GET / POST | `/messages/with/{id}` | Leer y enviar mensajes |
| GET | `/jobs?q=&province=&type=&modality=&schedule=&category=&posted=&for_me=&sort=&page=` | Buscar ofertas (con facetas) |
| POST | `/jobs` | Publicar oferta (empresa) |
| GET / PUT / DELETE | `/jobs/{id}` | Ver, editar o eliminar una oferta |
| PATCH | `/jobs/{id}/status` | Abrir o cerrar una oferta |
| POST / DELETE | `/jobs/{id}/apply` | Inscribirse o retirar la candidatura |
| GET | `/jobs/{id}/applications` | Candidatos de una oferta (empresa) |
| PATCH | `/jobs/applications/{id}` | Cambiar el estado de una candidatura |
| GET | `/jobs/mine` · `/jobs/applications/mine` | Mis ofertas · Mis candidaturas |
| GET | `/groups/suggestions?section=&limit=` | Sugerencias de grupos (para ti, cerca, más) |
| GET | `/groups?q=&topic=` · `/groups/topics` | Buscar grupos · Temáticas |
| GET | `/groups/mine?sort=` · `/groups/feed` | Tus grupos · Publicaciones de tus grupos |
| POST | `/groups` | Crear grupo (con invitaciones) |
| GET / PUT / DELETE | `/groups/{id}` | Ver, editar o eliminar un grupo |
| POST / DELETE | `/groups/{id}/join` | Unirse o salir |
| POST / DELETE | `/groups/{id}/dismiss` | Quitar o recuperar de las sugerencias |
| GET | `/groups/{id}/posts` · `/groups/{id}/members` | Publicaciones y miembros |
| POST | `/groups/{id}/invite` | Invitar personas |

## Pendiente

- Foto de perfil y logo de empresa (en el registro solo se previsualizan)
- Envío real del email de verificación
- Login con Google y Microsoft
- Recuperar contraseña
- Búsqueda de GIF en un catálogo (ahora se sube un GIF propio)
- Feed personalizado (ahora muestra todas las publicaciones recientes)
- Reseñas, editar perfil, foros de asignaturas
- Guardar ofertas en Guardados
- Migraciones con Alembic (ahora las tablas y columnas nuevas se crean solas al arrancar, ver `backend/app/migrate.py`)
