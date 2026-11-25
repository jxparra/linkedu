"""Datos de prueba: centros, estudios, comunidades, usuarios y publicaciones de ejemplo.

Uso:  python -m app.seed
"""
from datetime import datetime, timedelta, timezone
import shutil
from pathlib import Path

from sqlalchemy import select

from app import models  # noqa: F401
from app.database import SessionLocal
from app.config import settings
from app.migrate import ensure_schema
from app.models import (
    Comment,
    CommentLike,
    Community,
    CommunityMember,
    Company,
    Degree,
    Follow,
    Job,
    JobApplication,
    Like,
    Message,
    Notification,
    Post,
    School,
    Share,
    StatEvent,
    SchoolDegree,
    StudentProfile,
    User,
    UserRole,
)
from app.security import hash_password

SCHOOLS = [
    ("Universidad de Granada", "universidad", "Granada", "Granada"),
    ("Universidad de Málaga", "universidad", "Málaga", "Málaga"),
    ("Universidad de Sevilla", "universidad", "Sevilla", "Sevilla"),
    ("Universidad Complutense de Madrid", "universidad", "Madrid", "Madrid"),
    ("Universitat de València", "universidad", "Valencia", "Valencia"),
    ("IES Zaidín-Vergeles", "fp", "Granada", "Granada"),
    ("IES Hermenegildo Lanz", "fp", "Granada", "Granada"),
    ("Escuela Internacional de Gerencia", "fp", "Granada", "Granada"),
]

DEGREES = [
    ("Grado en Ingeniería Informática", "grado"),
    ("Grado en Administración y Dirección de Empresas", "grado"),
    ("Grado en Psicología", "grado"),
    ("Grado en Medicina", "grado"),
    ("Grado en Derecho", "grado"),
    ("Grado en Diseño", "grado"),
    ("CFGS Desarrollo de Aplicaciones Web", "fp_superior"),
    ("CFGS Desarrollo de Aplicaciones Multiplataforma", "fp_superior"),
    ("CFGS Administración de Sistemas Informáticos en Red", "fp_superior"),
    ("CFGM Sistemas Microinformáticos y Redes", "fp_medio"),
    ("Máster en Ingeniería Informática", "master"),
]

GENERAL_COMMUNITIES = [
    ("Busco compañeros de estudio", "Encuentra gente para estudiar juntos, en persona u online."),
    ("Primer año de carrera", "Dudas y consejos para quien empieza."),
    ("Trabajos y prácticas", "Experiencias con empresas, entrevistas y primeros empleos."),
    ("Técnicas de estudio", "Métodos, apps y trucos para organizarte mejor."),
]


# ---------------------------------------------------------------------------
# Contenido ficticio para ver la app con vida. Todas las personas y empresas son
# inventadas. Contraseña de todas las cuentas: Demo1234
# ---------------------------------------------------------------------------
DEMO_PASSWORD = "Demo1234"
DEMO_DOMAIN = "@demo.studyhub"

# email, nombre, apellidos, usuario, centro, estudios, curso, ciudad
DEMO_STUDENTS = [
    ("marta", "Marta", "Ruiz Ortega", "marta.ruiz", "Universidad de Granada", "Grado en Ingeniería Informática", 1, "Granada"),
    ("pablo", "Pablo", "Navarro Gil", "pablo_ng", "Universitat de València", "Máster en Ingeniería Informática", None, "Valencia"),
    ("irene", "Irene", "Castillo Mena", "irene.cm", "IES Zaidín-Vergeles", "CFGS Desarrollo de Aplicaciones Web", 2, "Granada"),
    ("dani", "Daniel", "Prieto Sanz", "dani.prieto", "Universidad de Sevilla", "Grado en Administración y Dirección de Empresas", 3, "Sevilla"),
    ("lucia", "Lucía", "Herrera Campos", "luciahc", "Universidad de Granada", "Grado en Psicología", 2, "Granada"),
    ("hugo", "Hugo", "Molina Ríos", "hugo.dam", "IES Hermenegildo Lanz", "CFGS Desarrollo de Aplicaciones Multiplataforma", 1, "Granada"),
    ("sara", "Sara", "Domínguez León", "sara.med", "Universidad de Sevilla", "Grado en Medicina", 4, "Sevilla"),
    ("alvaro", "Álvaro", "Pérez Lozano", "alvaro.design", "Universidad Complutense de Madrid", "Grado en Diseño", 3, "Madrid"),
    ("nerea", "Nerea", "Vidal Soler", "nerea.vs", "Universitat de València", "Grado en Derecho", 2, "Valencia"),
    ("javi", "Javier", "Soto Peña", "javisoto", "Universidad Complutense de Madrid", "Grado en Ingeniería Informática", 4, "Madrid"),
    ("paula", "Paula", "Requena Díaz", "paula.rd", "Universidad Complutense de Madrid", "Grado en Diseño", 1, "Madrid"),
    ("carlos", "Carlos", "Rubio Vega", "carlos.smr", "IES Zaidín-Vergeles", "CFGM Sistemas Microinformáticos y Redes", 1, "Granada"),
    ("elena", "Elena", "Marín Ruiz", "elena.asir", "IES Hermenegildo Lanz", "CFGS Administración de Sistemas Informáticos en Red", 2, "Granada"),
    ("ana", "Ana Belén", "Gil Cano", "anabelen", "Universidad de Sevilla", "Grado en Psicología", 4, "Sevilla"),
    ("marcos", "Marcos", "Iglesias Ramos", "marcos.med", "Universidad de Granada", "Grado en Medicina", 2, "Granada"),
    ("adrian", "Adrián", "Fuentes Mora", "adrianfm", "Universitat de València", "Grado en Administración y Dirección de Empresas", 4, "Valencia"),
    ("laura", "Laura", "Benítez Sola", "laurabs", "Universidad de Granada", "Grado en Derecho", 1, "Granada"),
]

# email, nombre, sector, ciudad, contacto, usuario
DEMO_COMPANIES = [
    ("equipo", "Equipo Linkedu", "Plataforma", "Granada", "Equipo Linkedu", "studyhub"),
    ("eventos", "Alhambra Eventos (demo)", "Eventos", "Granada", "Laura Gómez", "alhambra_eventos"),
    ("technova", "TechNova Granada (demo)", "Tecnología", "Granada", "Jorge Salas", "technova"),
    ("cafecampus", "Café Campus (demo)", "Hostelería", "Granada", "Rocío Linares", "cafecampus"),
]

# Fotos y vídeos ficticios (en app/demo_media), se copian a la carpeta de subidas
DEMO_MEDIA_DIR = Path(__file__).parent / "demo_media"

# Ilustraciones SVG que se generan en la carpeta de subidas (no hacen falta imágenes externas)
DEMO_IMAGES = {
    "demo-apuntes.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675"><rect width="1200" height="675" fill="#FEF6E7"/>
<rect x="140" y="70" width="920" height="535" rx="24" fill="#fff" stroke="#E3E5EA" stroke-width="4"/>
<g stroke="#EEF2FE" stroke-width="3">""" + "".join(f'<line x1="180" y1="{y}" x2="1020" y2="{y}"/>' for y in range(170, 580, 45)) + """</g>
<text x="190" y="145" font-family="Arial" font-size="44" font-weight="700" fill="#14161F">Normalización: 1FN → 2FN → 3FN</text>
<text x="190" y="235" font-family="Arial" font-size="30" fill="#2952E3">1FN · valores atómicos, sin grupos repetidos</text>
<text x="190" y="325" font-family="Arial" font-size="30" fill="#2952E3">2FN · sin dependencias parciales de la clave</text>
<text x="190" y="415" font-family="Arial" font-size="30" fill="#2952E3">3FN · sin dependencias transitivas</text>
<rect x="190" y="460" width="380" height="90" rx="14" fill="#F5A524"/><text x="215" y="518" font-family="Arial" font-size="30" font-weight="700" fill="#14161F">Ejercicio resuelto ✓</text></svg>""",
    "demo-portfolio.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675"><rect width="1200" height="675" fill="#14161F"/>
<g stroke="#2952E3" stroke-opacity=".35" stroke-width="2">""" + "".join(f'<line x1="{x}" y1="300" x2="{600 + (x - 600) * 3}" y2="675"/>' for x in range(0, 1201, 80)) + "".join(f'<line x1="0" y1="{y}" x2="1200" y2="{y}"/>' for y in (330, 380, 450, 550, 675)) + """</g>
<circle cx="900" cy="170" r="70" fill="#F5A524"/>
<text x="90" y="170" font-family="Arial" font-size="80" font-weight="800" fill="#fff">PABLO.DEV</text>
<text x="94" y="225" font-family="Arial" font-size="30" fill="#8A8F9C">Portfolio en 3D · Three.js · usa ← ↑ → ↓</text></svg>""",
    "demo-hackathon.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675"><rect width="1200" height="675" fill="#2952E3"/>
<circle cx="1050" cy="120" r="220" fill="#1F3FB8"/><circle cx="120" cy="620" r="180" fill="#1F3FB8"/>
<text x="110" y="250" font-family="Arial" font-size="40" font-weight="700" fill="#F5A524">24 HORAS · GRANADA</text>
<text x="105" y="360" font-family="Arial" font-size="110" font-weight="800" fill="#fff">HACKATHON</text>
<text x="110" y="440" font-family="Arial" font-size="38" fill="#EEF2FE">Equipos de 3-4 · premios para los 3 mejores</text>
<rect x="110" y="490" width="330" height="80" rx="40" fill="#fff"/><text x="160" y="543" font-family="Arial" font-size="32" font-weight="700" fill="#2952E3">Inscríbete gratis</text></svg>""",
    "demo-cartel.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675"><rect width="1200" height="675" fill="#F5A524"/>
<rect x="60" y="60" width="1080" height="555" rx="30" fill="none" stroke="#14161F" stroke-width="6"/>
<text x="120" y="230" font-family="Arial" font-size="60" font-weight="800" fill="#14161F">BUSCAMOS</text>
<text x="120" y="330" font-family="Arial" font-size="90" font-weight="800" fill="#14161F">DISEÑADORES</text>
<text x="120" y="410" font-family="Arial" font-size="36" fill="#14161F">Cartelería para un festival · 10 h · remoto · 150 €</text>
<text x="120" y="540" font-family="Arial" font-size="30" font-weight="700" fill="#8A5300">Alhambra Eventos (demo)</text></svg>""",
    "demo-biblioteca.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675"><rect width="1200" height="675" fill="#EEF2FE"/>""" + "".join(
        f'<rect x="{80 + i * 70}" y="{180 + (i % 3) * 20}" width="55" height="{300 - (i % 3) * 20}" rx="6" fill="{c}"/>'
        for i, c in enumerate(["#2952E3", "#F5A524", "#14161F", "#1F3FB8", "#8A8F9C", "#2952E3", "#F5A524", "#5B6070"] * 2)
    ) + """<rect x="60" y="480" width="1080" height="20" fill="#14161F"/>
<text x="80" y="590" font-family="Arial" font-size="44" font-weight="700" fill="#14161F">Biblioteca abierta 24 h en época de exámenes</text></svg>""",
}

# clave, autor, comunidad, tipo, texto, minutos atrás, extras
DEMO_POSTS = [
    ("pablo-portfolio", "pablo", "Máster Ingeniería Informática", "general",
     "Quería hacer el mejor portfolio de desarrollador que pudiera. Al final he acabado construyendo un pequeño mundo en 3D "
     "por el que se navega con el teclado. Tardé tres semanas, pero he aprendido más de Three.js que en todo el curso. "
     "Si alguien quiere el código, lo tengo en mi GitHub.", 2 * 24 * 60, {"image": "demo-portfolio.svg", "feeling": "orgulloso"}),
    ("irene-normalizacion", "irene", "CFGS Desarrollo de Aplicaciones Web", "pregunta",
     "¿Alguien tiene ejercicios resueltos de normalización hasta 3FN? El examen de Bases de Datos es el jueves y los del "
     "libro no traen solución.", 26 * 60, {"feeling": "de exámenes"}),
    ("eventos-cartel", "eventos", None, "general",
     "Buscamos dos estudiantes de diseño o marketing para preparar la cartelería de un festival este diciembre. Trabajo "
     "puntual, en remoto, unas 10 horas. Pronto lo publicaremos en Empleo.", 6 * 60, {"image": "demo-cartel.svg"}),
    ("dani-practicas", "dani", "Trabajos y prácticas", "debate",
     "¿Merece la pena hacer prácticas no remuneradas en segundo? Me han ofrecido unas en una consultora pequeña y no sé si "
     "compensa frente a centrarme en las asignaturas.", 3 * 60, {}),
    ("marta-deploy", "marta", "Primer año de carrera", "general",
     "🚀 ¡Primera versión desplegada! Como parte de la asignatura de Fundamentos Web he estado desarrollando una plataforma "
     "para organizar apuntes por asignatura. Todavía es muy básica, pero ya se pueden subir archivos y buscarlos. "
     "Cualquier feedback se agradece.", 12, {"feeling": "emocionada", "tag": ["hugo"]}),
    ("lucia-apuntes", "lucia", None, "recurso",
     "He pasado a limpio mis apuntes de normalización por si a alguien de informática le sirven (sí, desde Psicología, "
     "ayudando a mi compañera de piso 😅). Os dejo el resumen.", 20 * 60, {"image": "demo-apuntes.svg", "tag": ["irene"]}),
    ("technova-hackathon", "technova", None, "general",
     "Organizamos un hackathon de 24 horas en Granada para estudiantes de FP y universidad. Equipos de 3 o 4 personas, "
     "comida incluida y premios para los tres mejores proyectos. Las inscripciones abren la semana que viene.", 9 * 60,
     {"image": "demo-hackathon.svg", "location": "Parque Tecnológico de la Salud, Granada"}),
    ("hugo-kotlin", "hugo", "CFGS Desarrollo de Aplicaciones Multiplataforma", "pregunta",
     "¿Kotlin o Flutter para el proyecto final de primero? En clase damos Java, pero quiero algo que me sirva para buscar "
     "prácticas.", 4 * 60, {}),
    ("sara-guardia", "sara", "Medicina", "general",
     "Primera guardia de rotatorio hecha. Agotada pero con ganas de más. A los de primero: lo de memorizar la anatomía "
     "tiene sentido, os lo prometo.", 30 * 60, {"feeling": "cansada", "location": "Hospital Virgen del Rocío, Sevilla"}),
    ("alvaro-figma", "alvaro", "Diseño", "recurso",
     "Plantilla gratuita de Figma para hacer portfolios de diseño: 12 páginas, tipografías libres y modo oscuro. "
     "Escribidme y os la paso.", 2 * 24 * 60 + 300, {}),
    ("nerea-biblio", "nerea", None, "general",
     "Recordatorio: la biblioteca de la facultad abre 24 horas desde el lunes hasta final de exámenes. Llevad abrigo, que "
     "por la noche apagan la calefacción.", 50, {"image": "demo-biblioteca.svg", "location": "Facultad de Derecho, Valencia"}),
    ("dani-excel", "dani", "Administración y Dirección de Empresas", "pregunta",
     "¿Algún curso gratis de Excel avanzado que os haya servido de verdad? Tablas dinámicas y Power Query sobre todo.",
     3 * 24 * 60, {}),
    ("equipo-bienvenida", "equipo", None, "general",
     "👋 Bienvenidos a Linkedu. Aquí podéis encontrar trabajos puntuales compatibles con las clases, uniros a los foros "
     "de vuestros estudios y leer opiniones reales sobre carreras y centros. ¡Contadnos qué os gustaría ver!",
     4 * 24 * 60, {"feeling": "con ganas"}),
    # --- texto + imagen, vídeo, vídeo + imágenes + texto ---
    ("javi-api", "javi", "Ingeniería Informática", "general",
     "Por fin he conseguido que mi API en FastAPI pase todos los tests 🎉 Tres días peleándome con las dependencias "
     "asíncronas. Lección aprendida: leed la documentación ANTES de escribir 400 líneas.", 5 * 60,
     {"media": ["escritorio-codigo.jpg"], "feeling": "orgulloso"}),
    ("paula-bauhaus", "paula", "Diseño", "general",
     "Ejercicio final de Tipografía I: reinterpretar un cartel de la Bauhaus con solo tres formas y dos colores.",
     7 * 60, {"media": ["cartel-bauhaus.jpg"]}),
    ("carlos-texto", "carlos", None, "debate",
     "¿Soy el único al que le parece que en primero de SMR deberían enseñar Linux antes que Windows Server? "
     "Medio grupo no había abierto una terminal en su vida.", 35, {}),
    ("elena-timelapse", "elena", "CFGS Administración de Sistemas Informáticos en Red", "general",
     "6 horas de estudio para el examen de Redes, resumidas en 7 segundos 😅", 2 * 60,
     {"media": ["timelapse-estudio.mp4"], "feeling": "de exámenes", "location": "IES Hermenegildo Lanz, Granada"}),
    ("hugo-demo", "hugo", "CFGS Desarrollo de Aplicaciones Multiplataforma", "recurso",
     "Os enseño la primera demo de MisApuntes, la app que estoy haciendo para el proyecto de primero. Organiza los "
     "apuntes por asignatura y los sincroniza entre el móvil y el ordenador. Acepto ideas y críticas 🙏",
     80, {"media": ["demo-app.mp4", "app-movil.jpg"], "tag": ["irene"]}),
    ("marcos-lab", "marcos", "Medicina", "general",
     "Primera práctica de Bioquímica en el laboratorio nuevo. Os dejo un mini tour y una foto de cómo quedaron las "
     "muestras (spoiler: la roja no era la que tocaba).", 10 * 60,
     {"media": ["tour-laboratorio.mp4", "laboratorio.jpg"], "location": "Facultad de Medicina, Granada"}),
    ("ana-graduacion", "ana", "Psicología", "general",
     "Último año de carrera y no me lo creo. Hace cuatro años llegué a Sevilla sin conocer a nadie y hoy me despido de "
     "la mejor promoción. ¡Gracias por todo! 🎓", 27 * 60,
     {"media": ["graduacion.jpg", "campus-atardecer.jpg"], "feeling": "agradecido", "tag": ["sara"]}),
    ("adrian-erasmus", "adrian", None, "general",
     "Confirmado: el año que viene me voy de Erasmus a Bolonia ✈️ ¿Alguien que haya estado me recomienda barrio para vivir?",
     2 * 24 * 60 + 60, {"media": ["erasmus.jpg"], "feeling": "emocionado"}),
    ("laura-romano", "laura", "Derecho", "pregunta",
     "¿Cómo os organizáis para estudiar Derecho Romano? Llevo dos semanas y siento que cada tema es un idioma nuevo.",
     5 * 60 + 20, {}),
    ("javi-robot", "javi", "Ingeniería Informática", "general",
     "El club de robótica de la facultad lo ha conseguido: ¡nuestro robot ya camina! Llevamos desde septiembre con él. "
     "Vídeo y foto del día que por fin dio cinco pasos seguidos.", 26 * 60,
     {"media": ["robot-camina.mp4", "robot.jpg", "escritorio-codigo.jpg"], "tag": ["pablo", "alvaro"]}),
    ("cafe-descuento", "cafecampus", None, "general",
     "Desde hoy, 20 % de descuento en café y desayunos enseñando el carné de estudiante. Y enchufes en todas las mesas 🔌",
     3 * 60 + 30, {"media": ["apuntes-cafe.jpg"], "location": "Café Campus, Granada"}),
    ("marta-biblio", "marta", None, "general", "La biblio a las dos de la madrugada en época de exámenes. Somos muchos.",
     9 * 60, {"media": ["biblioteca-noche.jpg"], "feeling": "cansado"}),
]

# Conversaciones en los comentarios: (autor, texto, nº de me gusta, [respuestas (autor, texto, me gusta)])
DEMO_THREADS = {
    "hugo-demo": [
        ("irene", "¡Qué chula! ¿La estás haciendo en Kotlin al final?", 4,
         [("hugo", "Sí, Kotlin con Jetpack Compose. Me hiciste caso 😄", 3), ("pablo", "Compose es lo mejor que le ha pasado a Android", 1)]),
        ("marta", "Necesito esto para mi vida. ¿Tendrá versión web?", 6, [("hugo", "Está en la lista para después del verano", 2)]),
        ("elena", "Si necesitas a alguien para el servidor, avisa 👀", 2, []),
    ],
    "javi-robot": [
        ("pablo", "¡Enhorabuena, equipo! Cinco pasos son cinco más que el año pasado 🤣", 7,
         [("javi", "No nos lo recuerdes 😂", 4), ("alvaro", "El diseño de la carcasa también es mío, que conste", 3)]),
        ("technova", "Nos encantaría que lo presentarais en el hackathon de diciembre.", 5, [("javi", "¡Hecho! Os escribo por privado", 2)]),
        ("hugo", "¿Qué microcontrolador usáis?", 1, [("javi", "Un ESP32 con dos servos por pierna", 2)]),
    ],
    "ana-graduacion": [
        ("sara", "Te voy a echar muchísimo de menos 😭", 8, [("ana", "Y yo a ti, compi de biblio ❤️", 5)]),
        ("lucia", "¡Enhorabuena! Mucho éxito en lo que venga", 3, []),
        ("dani", "¡Qué fotos más bonitas!", 2, []),
    ],
    "marcos-lab": [
        ("sara", "Jajaja la roja siempre es la que no toca", 4, [("marcos", "Ahora lo sé 😅", 2)]),
        ("lucia", "¿Ese laboratorio es el nuevo de la facultad? ¡Qué pasada!", 1, []),
    ],
    "elena-timelapse": [
        ("carlos", "El reloj acelerado me ha dado ansiedad 😂", 5, [("elena", "Imagínate vivirlo", 3)]),
        ("hugo", "¿Cuándo es el examen? Mucha suerte", 2, [("elena", "Mañana a las 9. Gracias 🙏", 1)]),
    ],
    "javi-api": [
        ("pablo", "Los tests asíncronos con pytest-asyncio son un mundo. ¡Bien hecho!", 3, []),
        ("irene", "Pásame el repo, que yo estoy igual con el TFC", 2, [("javi", "Te lo mando por mensaje", 1)]),
    ],
    "paula-bauhaus": [
        ("alvaro", "Me encanta cómo has resuelto el equilibrio con el triángulo negro", 6, [("paula", "¡Gracias! Viniendo de ti vale doble", 2)]),
        ("lucia", "Lo pondría en mi cuarto ahora mismo", 3, []),
    ],
    "carlos-texto": [
        ("elena", "Totalmente. En ASIR igual: el primer mes fue aprender a usar la terminal", 4, [("carlos", "Menos mal que no soy el único", 1)]),
        ("javi", "Aprended a usar Linux ya, os lo agradeceréis en cualquier trabajo", 5, []),
        ("hugo", "Yo instalé Ubuntu en casa para practicar y fue la mejor decisión", 2, []),
    ],
    "adrian-erasmus": [
        ("nerea", "¡Qué envidia! Bolonia es preciosa", 2, []),
        ("dani", "Un amigo estuvo en el barrio de Santo Stefano y le encantó", 4, [("adrian", "¡Apuntado! Gracias", 1)]),
    ],
    "laura-romano": [
        ("nerea", "Esquemas, muchos esquemas. Y repasar en voz alta", 5, [("laura", "Probaré lo de en voz alta, gracias", 1)]),
        ("dani", "Fichas con las instituciones por un lado y la definición por otro", 2, []),
    ],
    "cafe-descuento": [
        ("marta", "Mi nuevo sitio para estudiar 😍", 3, []),
        ("carlos", "¿El descuento vale también para FP?", 1, [("cafecampus", "¡Claro! Para cualquier carné de estudiante", 2)]),
    ],
    "marta-biblio": [
        ("irene", "Te vi ahí a las 2:30, ¡ánimo! 💪", 4, []),
        ("marcos", "Yo estaba en la mesa del fondo jajaja", 2, [("marta", "¡Teníamos que habernos saludado!", 1)]),
    ],
    "irene-normalizacion": [
        ("hugo", "Yo también los necesito 🙋", 1, []),
    ],
    "pablo-portfolio": [
        ("alvaro", "Me ha volado la cabeza. ¿Cuánto tardaste en el modelado?", 4, [("pablo", "Unas dos semanas solo en eso", 2)]),
        ("javi", "Esto es nivel profesional, enhorabuena", 3, []),
    ],
}

# clave de publicación, autor, texto
DEMO_COMMENTS = [
    ("irene-normalizacion", "marta", "Te paso los míos por privado."),
    ("irene-normalizacion", "lucia", "Acabo de subir un resumen, mira mi última publicación 😊"),
    ("dani-practicas", "pablo", "Si te enseñan de verdad, sí. Si es para hacer fotocopias, no."),
    ("dani-practicas", "nerea", "Mira si cuentan como créditos, en mi facultad sí."),
    ("hugo-kotlin", "irene", "Kotlin. Hay muchas más ofertas de prácticas con Android nativo."),
    ("technova-hackathon", "hugo", "¿Pueden ir equipos mixtos de FP y universidad?"),
    ("technova-hackathon", "technova", "¡Sí! De hecho lo recomendamos."),
    ("marta-deploy", "pablo", "¡Enhorabuena! ¿Con qué stack lo has hecho?"),
    ("sara-guardia", "lucia", "¡Ánimo, Sara! 💪"),
]

# quién sigue a quién
DEMO_FOLLOWS = [
    ("marta", "pablo"), ("marta", "irene"), ("irene", "marta"), ("irene", "lucia"), ("hugo", "irene"),
    ("lucia", "sara"), ("dani", "nerea"), ("nerea", "dani"), ("alvaro", "pablo"), ("pablo", "alvaro"),
    ("sara", "lucia"), ("hugo", "technova"), ("irene", "technova"),
]

# Mensajes que recibe cada cuenta "objetivo" (las reales y la demo de Irene) para ver avisos sin leer
DEMO_INBOX = [
    ("lucia", [("them", "¡Hola! Vi que estudias por Granada. ¿Te apuntas al grupo de estudio del jueves en la biblioteca?"),
               ("them", "Somos cuatro, de 17:00 a 20:00 😊")]),
    ("technova", [("them", "Hola, somos TechNova. Estamos buscando estudiantes para el hackathon de diciembre."),
                  ("me", "¡Hola! Me interesa, ¿cuándo abrís inscripciones?"),
                  ("them", "La semana que viene. Te avisamos por aquí en cuanto esté el formulario.")]),
    ("pablo", [("me", "¿Me pasas el enlace a tu portfolio?"), ("them", "Claro, está en mi perfil. ¡Dime qué te parece!")]),
]
DEMO_NOTIFS = [("like", "pablo"), ("follow", "lucia"), ("follow", "hugo"), ("comment", "marta"), ("job", "technova")]


# Ofertas de empleo ficticias (sección Empleo)
# empresa, título, tipo, categoría, jornada, modalidad, ciudad, provincia, sueldo, periodo, horas desde que se publicó,
# estudios recomendados, vacantes, descripción, requisitos
DEMO_JOBS = [
    ("technova", "Prácticas de desarrollo web (React + FastAPI)", "practicas", "Informática y telecomunicaciones", "parcial",
     "hibrido", "Granada", "Granada", 400, "mes", 5, "CFGS Desarrollo de Aplicaciones Web", 2,
     "Buscamos estudiantes de DAW para incorporarse a nuestro equipo de producto durante las prácticas (FCT). "
     "Trabajarás en una aplicación web real con React en el frontend y FastAPI en el backend, con un mentor asignado.",
     "Estar cursando DAW o similar.\nConocimientos básicos de JavaScript y Git.\nGanas de aprender."),
    ("technova", "Soporte técnico para evento de lanzamiento", "puntual", "Informática y telecomunicaciones", "fines_semana",
     "presencial", "Granada", "Granada", 12, "hora", 30, "CFGM Sistemas Microinformáticos y Redes", 3,
     "Necesitamos 3 personas para montar y atender los equipos (portátiles, proyectores y red wifi) durante la "
     "presentación de un producto el sábado 21. Jornada de 9:00 a 15:00.",
     "Saber configurar portátiles y redes básicas.\nDisponibilidad el sábado 21."),
    ("technova", "Desarrollador/a de apps móviles junior", "temporal", "Informática y telecomunicaciones", "completa",
     "remoto", None, "Granada", 1350, "mes", 70, "CFGS Desarrollo de Aplicaciones Multiplataforma", 1,
     "Contrato de 6 meses con posibilidad de continuidad para desarrollar la app de reservas de un cliente con Flutter.",
     "Haber terminado o estar terminando DAM.\nAlgún proyecto propio en Flutter, Kotlin o Swift."),
    ("technova", "Prácticas de administración de sistemas", "practicas", "Informática y telecomunicaciones", "completa",
     "presencial", "Málaga", "Málaga", 300, "mes", 140, "CFGS Administración de Sistemas Informáticos en Red", 1,
     "Apoyo al equipo de sistemas en nuestra oficina del PTA: copias de seguridad, monitorización y alta de usuarios.",
     "Estudiante de ASIR.\nLinux a nivel usuario avanzado."),
    ("eventos", "Azafatos/as para congreso universitario", "puntual", "Atención a clientes", "completa",
     "presencial", "Granada", "Granada", 11, "hora", 2, None, 8,
     "Acreditaciones, información a asistentes y apoyo en salas durante un congreso de tres días en el Palacio de Congresos.",
     "Buena presencia y trato con el público.\nSe valora inglés."),
    ("eventos", "Fotógrafo/a para graduaciones", "freelance", "Diseño y artes gráficas", "fines_semana",
     "presencial", "Sevilla", "Sevilla", 150, "total", 26, "Grado en Diseño", 2,
     "Cubrir actos de graduación (unas 3 horas por acto) y entregar las fotos editadas en 48 horas.",
     "Cámara propia.\nPortfolio con fotos de eventos."),
    ("eventos", "Monitor/a de campamento urbano de Navidad", "temporal", "Educación y formación", "parcial",
     "presencial", "Madrid", "Madrid", 650, "mes", 50, None, 4,
     "Del 22 de diciembre al 7 de enero, de 9:00 a 14:00. Actividades con niños y niñas de 6 a 12 años.",
     "Título de monitor/a de ocio y tiempo libre (o estudiando Magisterio, Psicología o similar)."),
    ("eventos", "Staff para festival de música", "puntual", "Turismo y restauración", "fines_semana",
     "presencial", "Valencia", "Valencia", 90, "total", 200, None, 15,
     "Control de accesos y barras durante un festival de dos días. Incluye comida y acreditación.",
     "Mayor de 18 años.\nDisponibilidad viernes y sábado."),
    ("cafecampus", "Camarero/a fines de semana", "temporal", "Turismo y restauración", "fines_semana",
     "presencial", "Granada", "Granada", 9.5, "hora", 12, None, 2,
     "Turnos de sábado y domingo por la mañana en nuestra cafetería junto al campus de Fuentenueva. Compatible con los estudios.",
     "Experiencia valorable, no imprescindible."),
    ("cafecampus", "Diseño de carta y redes sociales", "freelance", "Marketing y comunicación", "flexible",
     "remoto", None, "Granada", 300, "total", 96, "Grado en Diseño", 1,
     "Rediseño de la carta (impresa y QR) y una plantilla de publicaciones para Instagram.",
     "Portfolio.\nManejo de Figma, Illustrator o Canva."),
    ("equipo", "Embajador/a de Linkedu en tu campus", "practicas", "Marketing y comunicación", "flexible",
     "hibrido", "Granada", "Granada", None, None, 20, None, 10,
     "Ayúdanos a dar a conocer Linkedu en tu centro: charlas, carteles y comunidad. Unas 5 horas a la semana, convalidable como prácticas.",
     "Estar estudiando en cualquier centro.\nGanas de organizar cosas."),
    ("equipo", "Clases particulares de programación (Python)", "puntual", "Educación y formación", "flexible",
     "remoto", None, "Sevilla", 15, "hora", 60, "Grado en Ingeniería Informática", 1,
     "Un alumno de bachillerato necesita 2 horas a la semana de clases online de Python hasta final de curso.",
     "Saber explicar con paciencia.\nPython a buen nivel."),
    ("equipo", "Prácticas en consultora (Lisboa)", "practicas", "Administración de empresas", "completa",
     "presencial", "Lisboa", "Extranjero", 800, "mes", 110, "Grado en Administración y Dirección de Empresas", 1,
     "Prácticas de 6 meses en el departamento de análisis de una consultora en Lisboa. Válido para Erasmus Prácticas.",
     "Inglés B2.\nExcel a nivel intermedio."),
    ("equipo", "Asistente de investigación para TFG de Psicología", "puntual", "Sanidad y salud", "flexible",
     "presencial", "Granada", "Granada", 10, "hora", 300, "Grado en Psicología", 2,
     "Pasar cuestionarios a participantes y meter los datos en una hoja de cálculo durante dos semanas.",
     "Estudiante de Psicología a partir de 2º."),
]

# Más empresas ficticias solo para Empleo (no publican en el inicio)
# email, nombre, sector, ciudad, contacto, usuario
DEMO_JOB_COMPANIES = [
    ("logisur", "LogiSur Distribución (demo)", "Logística", "Sevilla", "Antonio Vera", "logisur"),
    ("sonrie", "Clínica Dental Sonríe (demo)", "Salud", "Granada", "Marina Ortiz", "clinica_sonrie"),
    ("avanza", "Academia Avanza (demo)", "Educación", "Madrid", "Elena Navas", "academia_avanza"),
    ("albaicin", "Inmobiliaria Albaicín (demo)", "Inmobiliaria", "Granada", "Pedro Linares", "inmo_albaicin"),
    ("bufete", "Ruiz & Asociados Abogados (demo)", "Legal", "Madrid", "Carmen Ruiz", "ruiz_abogados"),
    ("farmacia", "Farmacia Plaza Nueva (demo)", "Farmacia", "Granada", "Luis Montes", "farmacia_plaza"),
    ("biolab", "BioLab Andalucía (demo)", "Biotecnología", "Granada", "Sofía Reyes", "biolab"),
    ("hotelgenil", "Hotel Mirador del Genil (demo)", "Turismo", "Granada", "Javier Peña", "hotel_genil"),
    ("modaurbana", "Moda Urbana (demo)", "Comercio", "Valencia", "Nuria Sanz", "moda_urbana"),
    ("finclara", "Finanzas Claras (demo)", "Banca", "Madrid", "Óscar Gil", "finanzas_claras"),
    ("juventud", "Servicio Municipal de Juventud (demo)", "Administración pública", "Málaga", "Rosa Pérez", "juventud_muni"),
    ("solarsur", "Solar Sur Ingeniería (demo)", "Energía", "Almería", "David Torres", "solar_sur"),
    ("genilcons", "Construcciones Genil (demo)", "Construcción", "Granada", "Manuel Rubio", "construcciones_genil"),
    ("talento", "Talento Joven RRHH (demo)", "Recursos humanos", "Barcelona", "Laia Puig", "talento_joven"),
    ("carpinteria", "Taller de Carpintería Lanjarón (demo)", "Artesanía", "Granada", "Paco Lanjarón", "carpinteria_lanjaron"),
    ("contacta", "Contacta Call Center (demo)", "Atención al cliente", "Málaga", "Irene Bravo", "contacta"),
    ("pixel", "Estudio Píxel (demo)", "Diseño", "Barcelona", "Marc Vidal", "estudio_pixel"),
]

DEMO_JOBS += [
    # Administración de empresas
    ("logisur", "Auxiliar administrativo/a (prácticas)", "practicas", "Administración de empresas", "parcial", "presencial", "Sevilla", "Sevilla", 350, "mes", 8, "Grado en Administración y Dirección de Empresas", 1,
     "Apoyo al departamento de administración: facturas, pedidos y archivo digital. Horario de mañanas compatible con clases de tarde.",
     "Estudiar ADE, Administración y Finanzas o similar.\nExcel básico."),
    ("finclara", "Gestor/a de datos de clientes", "temporal", "Administración de empresas", "parcial", "remoto", None, "Madrid", 11, "hora", 75, None, 2,
     "Actualizar fichas de clientes en el CRM y revisar documentación durante tres meses.",
     "Ordenado/a y con atención al detalle.\nOrdenador propio."),
    # Administración Pública
    ("juventud", "Informador/a juvenil (beca)", "practicas", "Administración Pública", "parcial", "presencial", "Málaga", "Málaga", 500, "mes", 30, None, 3,
     "Beca de 6 meses en el punto de información juvenil: atender consultas sobre becas, carné joven y actividades.",
     "Tener entre 18 y 30 años.\nEstar estudiando o recién titulado/a."),
    ("juventud", "Monitor/a de actividades de verano", "temporal", "Administración Pública", "completa", "presencial", "Marbella", "Málaga", 1100, "mes", 260, None, 6,
     "Campamento municipal de julio para chavales de 8 a 14 años.",
     "Título de monitor/a de ocio y tiempo libre."),
    # Atención a clientes
    ("contacta", "Teleoperador/a atención al cliente (tardes)", "temporal", "Atención a clientes", "parcial", "hibrido", "Málaga", "Málaga", 9, "hora", 3, None, 10,
     "Atención de llamadas y chat de una compañía de telefonía. Turno de 16:00 a 20:00. Formación pagada.",
     "Buena expresión oral y escrita.\nSe valora inglés."),
    ("contacta", "Agente de chat en inglés", "indefinido", "Atención a clientes", "completa", "remoto", None, "Málaga", 1300, "mes", 40, None, 4,
     "Soporte por chat y email a clientes de Reino Unido e Irlanda.",
     "Inglés C1.\nDisponibilidad de lunes a viernes."),
    ("hotelgenil", "Recepcionista de noche (fines de semana)", "temporal", "Atención a clientes", "fines_semana", "presencial", "Granada", "Granada", 10, "hora", 20, None, 1,
     "Recepción de huéspedes, check-in y check-out en turno de noche los viernes y sábados.",
     "Inglés B1.\nSe valora estudiar Turismo."),
    # Calidad, producción e I+D
    ("biolab", "Técnico/a de laboratorio en prácticas", "practicas", "Calidad, producción e I+D", "completa", "presencial", "Granada", "Granada", 600, "mes", 14, None, 2,
     "Preparación de muestras, control de calidad y registro de resultados en un laboratorio de biotecnología del PTS.",
     "Estudiar Biotecnología, Biología, Química o FP de Laboratorio."),
    ("biolab", "Auxiliar de control de calidad", "temporal", "Calidad, producción e I+D", "parcial", "presencial", "Granada", "Granada", 10.5, "hora", 120, None, 1,
     "Revisión de lotes y documentación de calidad según normas ISO.",
     "Conocimientos básicos de ISO 9001 (valorable)."),
    # Comercial y ventas
    ("finclara", "Comercial junior de productos financieros", "indefinido", "Comercial y ventas", "completa", "hibrido", "Madrid", "Madrid", 1500, "mes", 55, "Grado en Administración y Dirección de Empresas", 3,
     "Asesorar a jóvenes sobre cuentas, tarjetas y primeros ahorros. Fijo + variable.",
     "Recién titulado/a.\nGanas de trato con clientes."),
    ("modaurbana", "Promotor/a de ventas en centro comercial", "puntual", "Comercial y ventas", "fines_semana", "presencial", "Valencia", "Valencia", 10, "hora", 9, None, 4,
     "Promoción de la nueva colección durante tres fines de semana de noviembre.",
     "Don de gentes.\nDisponibilidad sábados y domingos."),
    # Compras, logística y almacén
    ("logisur", "Mozo/a de almacén campaña de Navidad", "temporal", "Compras, logística y almacén", "completa", "presencial", "Dos Hermanas", "Sevilla", 1250, "mes", 2, None, 20,
     "Preparación de pedidos, carga y descarga durante la campaña de Navidad (diciembre y enero).",
     "Carné de carretillero (valorable).\nTurnos rotativos."),
    ("logisur", "Repartidor/a en bici por el centro", "freelance", "Compras, logística y almacén", "flexible", "presencial", "Granada", "Granada", 4, "hora", 16, None, 8,
     "Reparto de pedidos de comercios del centro. Tú eliges las franjas.",
     "Bici propia (o te prestamos una eléctrica).\nMayor de 18 años."),
    ("logisur", "Preparador/a de pedidos fin de semana", "temporal", "Compras, logística y almacén", "fines_semana", "presencial", "Madrid", "Madrid", 10, "hora", 33, None, 6,
     "Picking con PDA en almacén de comercio electrónico los sábados y domingos.",
     "No hace falta experiencia."),
    # Diseño y artes gráficas
    ("pixel", "Diseñador/a gráfico en prácticas", "practicas", "Diseño y artes gráficas", "completa", "hibrido", "Barcelona", "Barcelona", 500, "mes", 18, "Grado en Diseño", 1,
     "Identidades visuales, cartelería y piezas para redes en un estudio pequeño.",
     "Portfolio.\nFigma e Illustrator."),
    ("pixel", "Ilustrador/a para libro infantil", "freelance", "Diseño y artes gráficas", "flexible", "remoto", None, "Barcelona", 900, "total", 90, "Grado en Diseño", 1,
     "12 ilustraciones a color para un cuento. Entrega en 6 semanas.",
     "Portfolio de ilustración."),
    # Educación y formación
    ("avanza", "Profesor/a de matemáticas para ESO", "temporal", "Educación y formación", "parcial", "presencial", "Madrid", "Madrid", 14, "hora", 7, None, 2,
     "Clases de refuerzo en grupos reducidos de lunes a jueves por la tarde.",
     "Estudiante de último curso de Matemáticas, Ingeniería o Magisterio."),
    ("avanza", "Profesor/a de inglés online", "freelance", "Educación y formación", "flexible", "remoto", None, "Madrid", 16, "hora", 48, None, 3,
     "Clases de conversación por videollamada a adultos. Tú pones tu horario.",
     "Inglés C1 o nativo."),
    ("avanza", "Canguro con apoyo en deberes", "puntual", "Educación y formación", "parcial", "presencial", "Granada", "Granada", 10, "hora", 22, None, 1,
     "Recoger a dos niños del cole y ayudarles con los deberes de lunes a miércoles.",
     "Experiencia con niños.\nReferencias."),
    # Finanzas y banca
    ("finclara", "Analista financiero/a en prácticas", "practicas", "Finanzas y banca", "completa", "presencial", "Madrid", "Madrid", 800, "mes", 26, "Grado en Administración y Dirección de Empresas", 2,
     "Apoyo en informes de inversión y modelos en Excel. Convenio con la universidad.",
     "Último curso de ADE, Economía o Finanzas.\nExcel avanzado."),
    # Informática y telecomunicaciones
    ("pixel", "Desarrollador/a frontend junior (React)", "indefinido", "Informática y telecomunicaciones", "completa", "remoto", None, "Barcelona", 1700, "mes", 4, "CFGS Desarrollo de Aplicaciones Web", 1,
     "Maquetación de webs para clientes del estudio con React y Tailwind.",
     "Proyectos propios en GitHub.\nHTML, CSS y JavaScript."),
    ("juventud", "Técnico/a de soporte informático (beca)", "practicas", "Informática y telecomunicaciones", "parcial", "presencial", "Málaga", "Málaga", 450, "mes", 150, "CFGM Sistemas Microinformáticos y Redes", 1,
     "Mantenimiento de los equipos de las aulas de informática municipales.",
     "Estudiar SMR o ASIR."),
    # Ingenieros y técnicos
    ("solarsur", "Ingeniero/a junior de proyectos fotovoltaicos", "indefinido", "Ingenieros y técnicos", "completa", "hibrido", "Almería", "Almería", 1800, "mes", 11, None, 2,
     "Diseño y seguimiento de instalaciones de autoconsumo para empresas.",
     "Grado en Ingeniería Industrial, Eléctrica o de la Energía."),
    ("solarsur", "Técnico/a instalador/a de placas solares", "temporal", "Ingenieros y técnicos", "completa", "presencial", "El Ejido", "Almería", 1400, "mes", 200, None, 4,
     "Montaje de instalaciones en tejados de naves y viviendas.",
     "FP de Electricidad o similar.\nCarné B."),
    # Inmobiliario y construcción
    ("albaicin", "Asesor/a inmobiliario/a junior", "indefinido", "Inmobiliario y construcción", "completa", "presencial", "Granada", "Granada", 1200, "mes", 36, None, 2,
     "Enseñar pisos, atender a clientes y gestionar el alquiler a estudiantes. Fijo + comisiones.",
     "Carné B.\nBuena comunicación."),
    ("genilcons", "Delineante / técnico/a de obra en prácticas", "practicas", "Inmobiliario y construcción", "completa", "presencial", "Granada", "Granada", 600, "mes", 100, None, 1,
     "Planos en AutoCAD y apoyo al jefe de obra en una promoción de viviendas.",
     "Estudiar Arquitectura Técnica, Edificación o FP de Proyectos de Edificación."),
    # Legal
    ("bufete", "Paralegal en prácticas", "practicas", "Legal", "completa", "presencial", "Madrid", "Madrid", 700, "mes", 12, "Grado en Derecho", 2,
     "Redacción de escritos, búsqueda de jurisprudencia y gestión de expedientes en derecho mercantil.",
     "Últimos cursos de Derecho o Máster de Acceso."),
    ("bufete", "Asistente jurídico/a a media jornada", "temporal", "Legal", "parcial", "hibrido", "Madrid", "Madrid", 12, "hora", 160, "Grado en Derecho", 1,
     "Apoyo al despacho en tareas de administración y documentación.",
     "Estudiar Derecho."),
    # Marketing y comunicación
    ("modaurbana", "Community manager (prácticas)", "practicas", "Marketing y comunicación", "parcial", "remoto", None, "Valencia", 400, "mes", 6, None, 1,
     "Gestión de Instagram y TikTok de la tienda: calendario, publicaciones y respuesta a comentarios.",
     "Te mueves bien en redes.\nCapCut o Premiere."),
    ("hotelgenil", "Creador/a de contenido para el hotel", "freelance", "Marketing y comunicación", "flexible", "presencial", "Granada", "Granada", 250, "total", 210, None, 1,
     "Fotos y vídeos de las habitaciones y la terraza para la nueva web.",
     "Portfolio.\nCámara o móvil de gama alta."),
    # Otros
    ("eventos", "Socorrista para piscina climatizada", "temporal", "Otros", "parcial", "presencial", "Granada", "Granada", 11, "hora", 28, None, 2,
     "Turnos de tarde en la piscina de un club deportivo.",
     "Título de socorrista acuático en vigor."),
    ("equipo", "Participante en estudio de usabilidad", "puntual", "Otros", "flexible", "remoto", None, "Granada", 20, "total", 1, None, 10,
     "Probar una app durante 45 minutos por videollamada y contarnos qué te parece.",
     "Ser estudiante.\nMóvil o portátil con cámara."),
    # Profesiones, artes y oficios
    ("carpinteria", "Aprendiz de carpintería", "practicas", "Profesiones, artes y oficios", "completa", "presencial", "Lanjarón", "Granada", 600, "mes", 60, None, 1,
     "Aprende el oficio en un taller artesano: muebles a medida y restauración.",
     "Ganas de aprender y trabajar con las manos."),
    ("genilcons", "Ayudante de pintor/a (verano)", "temporal", "Profesiones, artes y oficios", "completa", "presencial", "Motril", "Granada", 1250, "mes", 300, None, 3,
     "Pintura de fachadas e interiores durante julio y agosto.",
     "No hace falta experiencia."),
    # Recursos humanos
    ("talento", "Técnico/a de selección en prácticas", "practicas", "Recursos humanos", "completa", "hibrido", "Barcelona", "Barcelona", 650, "mes", 19, "Grado en Psicología", 2,
     "Cribado de candidaturas, entrevistas telefónicas y publicación de ofertas.",
     "Estudiar Psicología, RRLL o Recursos Humanos."),
    ("talento", "Entrevistador/a para encuestas universitarias", "puntual", "Recursos humanos", "flexible", "remoto", None, "Barcelona", 12, "hora", 85, "Grado en Psicología", 5,
     "Encuestas telefónicas a recién titulados sobre su inserción laboral durante dos semanas.",
     "Buena dicción.\nOrdenador y auriculares."),
    # Sanidad y salud
    ("sonrie", "Auxiliar de clínica dental", "temporal", "Sanidad y salud", "parcial", "presencial", "Granada", "Granada", 10, "hora", 5, None, 1,
     "Apoyo en gabinete, esterilización de material y recepción de pacientes por las tardes.",
     "FP de Higiene Bucodental o Cuidados Auxiliares de Enfermería."),
    ("sonrie", "Higienista dental en prácticas", "practicas", "Sanidad y salud", "completa", "presencial", "Granada", "Granada", 300, "mes", 230, None, 1,
     "Prácticas del ciclo de Higiene Bucodental con tutor/a en la clínica.",
     "Estar cursando Higiene Bucodental."),
    ("equipo", "Auxiliar de enfermería en residencia (verano)", "temporal", "Sanidad y salud", "completa", "presencial", "Sevilla", "Sevilla", 1350, "mes", 140, None, 3,
     "Cubrir vacaciones de verano en una residencia de mayores.",
     "Estudiar Enfermería o Cuidados Auxiliares de Enfermería (TCAE)."),
    # Sector Farmacéutico
    ("farmacia", "Auxiliar de farmacia fines de semana", "temporal", "Sector Farmacéutico", "fines_semana", "presencial", "Granada", "Granada", 10, "hora", 10, None, 1,
     "Atención al público y reposición en farmacia de guardia los sábados.",
     "FP de Farmacia y Parafarmacia o estudiante de Farmacia."),
    ("biolab", "Prácticas en asuntos regulatorios", "practicas", "Sector Farmacéutico", "completa", "hibrido", "Granada", "Granada", 700, "mes", 45, None, 1,
     "Preparación de documentación para registros de medicamentos y productos sanitarios.",
     "Último curso de Farmacia, Química o Biotecnología.\nInglés B2."),
    # Turismo y restauración
    ("hotelgenil", "Camarero/a de pisos (verano)", "temporal", "Turismo y restauración", "completa", "presencial", "Granada", "Granada", 1200, "mes", 180, None, 4,
     "Limpieza y preparación de habitaciones de junio a septiembre.",
     "No hace falta experiencia."),
    ("cafecampus", "Ayudante de cocina (mañanas)", "temporal", "Turismo y restauración", "parcial", "presencial", "Granada", "Granada", 9.5, "hora", 24, None, 1,
     "Preparar desayunos y bocadillos de 7:30 a 11:30.",
     "Carné de manipulador de alimentos."),
    ("eventos", "Guía turístico/a en inglés", "freelance", "Turismo y restauración", "fines_semana", "presencial", "Granada", "Granada", 60, "total", 15, None, 2,
     "Visitas guiadas de 3 horas por el Albaicín para grupos de estudiantes extranjeros.",
     "Inglés C1.\nConocer bien la historia de Granada."),
    ("equipo", "Au pair en Dublín", "temporal", "Turismo y restauración", "parcial", "presencial", "Dublín", "Extranjero", 120, "total", 70, None, 1,
     "Cuidar de dos niños 25 horas a la semana a cambio de alojamiento, comida y 120 € semanales.",
     "Mayor de 18 años.\nInglés B1."),
    # Venta al detalle
    ("modaurbana", "Dependiente/a de tienda de ropa", "temporal", "Venta al detalle", "parcial", "presencial", "Valencia", "Valencia", 9.8, "hora", 1, None, 3,
     "Atención al cliente, caja y reposición en tienda del centro. Contrato de Navidad.",
     "Disponibilidad tardes y fines de semana."),
    ("modaurbana", "Visual merchandiser junior", "indefinido", "Venta al detalle", "completa", "presencial", "Madrid", "Madrid", 1400, "mes", 125, "Grado en Diseño", 1,
     "Montaje de escaparates y colocación de producto en las tiendas de Madrid.",
     "Estudios de Diseño, Moda o Escaparatismo."),
    ("farmacia", "Dependiente/a de parafarmacia", "temporal", "Venta al detalle", "parcial", "presencial", "Almería", "Almería", 9.5, "hora", 52, None, 1,
     "Venta y asesoramiento en cosmética y parafarmacia por las mañanas.",
     "Se valora FP de Farmacia."),
]

# Candidaturas de prueba: estudiante, índice de la oferta en DEMO_JOBS, estado, mensaje
DEMO_APPLICATIONS = [
    ("irene", 0, "en_proceso", "Hola, estoy en 2º de DAW y he hecho un proyecto con React y FastAPI. ¡Me encantaría hacer las prácticas con vosotros!"),
    ("irene", 9, "vista", None),
    ("hugo", 2, "enviada", "Tengo una app en Flutter publicada en Google Play."),
    ("carlos", 1, "aceptada", None),
    ("marta", 0, "enviada", None),
    ("alvaro", 5, "rechazada", "Os dejo mi portfolio en el perfil."),
    ("lucia", 13, "enviada", None),
]


def seed_catalog(db):
    if db.scalar(select(School).limit(1)):
        return False
    schools = [School(name=n, type=t, city=c, province=p) for n, t, c, p in SCHOOLS]
    degrees = [Degree(name=n, level=l) for n, l in DEGREES]
    db.add_all(schools + degrees)
    db.flush()
    for s in schools:
        for d in degrees:
            if (s.type == "universidad") == (d.level in ("grado", "master")):
                db.add(SchoolDegree(school_id=s.id, degree_id=d.id))
    for d in degrees:
        short = d.name.replace("Grado en ", "").replace("Máster en ", "Máster ")
        db.add(Community(name=short, description=f"Comunidad de {d.name}.", type="degree", target_id=d.id))
    for s in schools:
        db.add(Community(name=s.name, description=f"Estudiantes de {s.name}.", type="school", target_id=s.id))
    for n, desc in GENERAL_COMMUNITIES:
        db.add(Community(name=n, description=desc, type="general"))
    db.commit()
    print(f"Creados {len(schools)} centros, {len(degrees)} estudios y sus comunidades.")
    return True


def _write_images():
    settings.upload_path.mkdir(parents=True, exist_ok=True)
    for name, svg in DEMO_IMAGES.items():
        path = settings.upload_path / name
        if not path.exists():
            path.write_text(svg, encoding="utf-8")
    if DEMO_MEDIA_DIR.exists():
        for f in DEMO_MEDIA_DIR.iterdir():
            dest = settings.upload_path / f"demo-{f.name}"
            if f.is_file() and not dest.exists():
                shutil.copyfile(f, dest)


def _media_list(extra: dict) -> list[dict]:
    items = []
    if extra.get("image"):
        items.append({"url": f"/uploads/{extra['image']}", "type": "image"})
    for name in extra.get("media", []):
        kind = "video" if name.endswith(".mp4") else "gif" if name.endswith(".gif") else "image"
        items.append({"url": f"/uploads/demo-{name}", "type": kind})
    return items


def _ensure_users(db) -> dict[str, User]:
    pw = hash_password(DEMO_PASSWORD)
    users: dict[str, User] = {}
    for key, name, surname, username, school_name, degree_name, course, city in DEMO_STUDENTS:
        email = key + DEMO_DOMAIN
        u = db.scalar(select(User).where(User.email == email))
        if not u:
            school = db.scalar(select(School).where(School.name == school_name))
            degree = db.scalar(select(Degree).where(Degree.name == degree_name))
            u = User(email=email, password_hash=pw, username=username, role=UserRole.student, email_verified=True, onboarding_done=True)
            db.add(u)
            db.flush()
            db.add(StudentProfile(user_id=u.id, name=name, surname=surname, location=city, school_id=school.id,
                                  degree_id=degree.id, course=course, is_over_16=True))
        users[key] = u
    for key, name, sector, city, contact, username in DEMO_COMPANIES:
        email = key + DEMO_DOMAIN
        u = db.scalar(select(User).where(User.email == email))
        if not u:
            u = User(email=email, password_hash=pw, username=username, role=UserRole.company, email_verified=True, onboarding_done=True)
            db.add(u)
            db.flush()
            db.add(Company(user_id=u.id, name=name, sector=sector, location=city, contact_name=contact))
        users[key] = u
    db.flush()
    return users


def seed_demo(db) -> int:
    """Añade el contenido ficticio que falte. Se puede ejecutar varias veces sin duplicar."""
    _write_images()
    users = _ensure_users(db)
    communities = {c.name: c for c in db.scalars(select(Community))}
    now = datetime.now(timezone.utc)
    posts: dict[str, Post] = {}
    created = 0

    for key, author_key, community_name, ptype, text, age, extra in DEMO_POSTS:
        author = users[author_key]
        existing = db.scalar(select(Post).where(Post.user_id == author.id, Post.content == text))
        media = _media_list(extra)
        if existing:
            if media and not existing.media:  # publicaciones de una versión anterior de los datos de prueba
                existing.media = media
                existing.image_url, existing.media_type = media[0]["url"], media[0]["type"]
            existing.feeling = existing.feeling or extra.get("feeling")
            existing.location = existing.location or extra.get("location")
            if extra.get("tag") and not existing.tagged_user_ids:
                existing.tagged_user_ids = [users[t].id for t in extra["tag"]]
            posts[key] = existing
            continue
        community = communities.get(community_name) if community_name else None
        if community and not db.get(CommunityMember, (community.id, author.id)):
            db.add(CommunityMember(community_id=community.id, user_id=author.id))
        when = now - timedelta(minutes=age)
        p = Post(
            user_id=author.id, community_id=community.id if community else None, type=ptype, content=text,
            image_url=media[0]["url"] if media else None, media_type=media[0]["type"] if media else None,
            media=media or None,
            feeling=extra.get("feeling"), location=extra.get("location"),
            tagged_user_ids=[users[t].id for t in extra.get("tag", [])] or None,
            created_at=when, updated_at=when,
        )
        db.add(p)
        db.flush()
        posts[key] = p
        created += 1

    everyone = list(users.values())
    for i, (key, p) in enumerate(posts.items()):
        for u in everyone[: 2 + (i * 3) % (len(everyone) - 1)]:
            if u.id != p.user_id and not db.get(Like, (u.id, p.id)):
                db.add(Like(user_id=u.id, post_id=p.id))
    for i, (key, p) in enumerate(posts.items()):
        for u in everyone[-(1 + i % 4):]:
            if u.id != p.user_id and not db.get(Share, (u.id, p.id)):
                db.add(Share(user_id=u.id, post_id=p.id))
    for post_key, author_key, text in DEMO_COMMENTS:
        p, u = posts[post_key], users[author_key]
        if not db.scalar(select(Comment).where(Comment.post_id == p.id, Comment.user_id == u.id, Comment.content == text)):
            db.add(Comment(post_id=p.id, user_id=u.id, content=text, created_at=p.created_at + timedelta(minutes=7)))
    def add_comment(p, author_key, text, likes, parent=None, minutes_after=10):
        u = users[author_key]
        c = db.scalar(select(Comment).where(Comment.post_id == p.id, Comment.user_id == u.id, Comment.content == text))
        if not c:
            c = Comment(post_id=p.id, user_id=u.id, content=text, parent_id=parent.id if parent else None,
                        created_at=p.created_at + timedelta(minutes=minutes_after))
            db.add(c)
            db.flush()
        likers = [x for x in everyone if x.id != u.id][:likes]
        for x in likers:
            if not db.get(CommentLike, (x.id, c.id)):
                db.add(CommentLike(user_id=x.id, comment_id=c.id))
        return c

    for post_key, thread in DEMO_THREADS.items():
        p = posts[post_key]
        age = max(int((now - p.created_at.replace(tzinfo=timezone.utc)).total_seconds() // 60), 3)
        for i, (author_key, text, likes, replies) in enumerate(thread):
            parent = add_comment(p, author_key, text, likes, minutes_after=min(age - 2, 4 + i * 9))
            for j, (r_author, r_text, r_likes) in enumerate(replies):
                add_comment(p, r_author, r_text, r_likes, parent=parent, minutes_after=min(age - 1, 6 + i * 9 + j * 3))
    db.flush()

    for a, b in DEMO_FOLLOWS:
        if not db.get(Follow, (users[a].id, users[b].id)):
            db.add(Follow(follower_id=users[a].id, followed_id=users[b].id))
    for key, name, *_ in DEMO_STUDENTS:
        for c in communities.values():
            if c.type == "general" and not db.get(CommunityMember, (c.id, users[key].id)):
                db.add(CommunityMember(community_id=c.id, user_id=users[key].id))
    db.flush()

    # Bandeja de entrada y avisos sin leer para las cuentas reales y para Irene (demo)
    targets = [u for u in db.scalars(select(User).where(User.onboarding_done.is_(True))) if not u.email.endswith(DEMO_DOMAIN)]
    targets.append(users["irene"])
    for target in targets:
        has_messages = db.scalar(
            select(Message.id).where((Message.recipient_id == target.id) | (Message.sender_id == target.id)).limit(1)
        )
        if not has_messages:
            minutes = 90
            for who, lines in DEMO_INBOX:
                other = users[who]
                if other.id == target.id:
                    continue
                for direction, text in lines:
                    me_sends = direction == "me"
                    db.add(Message(
                        sender_id=target.id if me_sends else other.id,
                        recipient_id=other.id if me_sends else target.id,
                        content=text,
                        created_at=now - timedelta(minutes=minutes),
                        read_at=now if (me_sends or who == "pablo") else None,
                    ))
                    minutes -= 7
        has_notifs = db.scalar(select(Notification.id).where(Notification.user_id == target.id).limit(1))
        if not has_notifs:
            own_post = db.scalar(select(Post).where(Post.user_id == target.id).order_by(Post.id.desc()))
            for j, (ntype, who) in enumerate(DEMO_NOTIFS):
                if users[who].id == target.id:
                    continue
                data = {"actor_id": users[who].id}
                if ntype in ("like", "comment") and own_post:
                    data["post_id"] = own_post.id
                elif ntype in ("like", "comment"):
                    data["post_id"] = posts["equipo-bienvenida"].id
                    data["text"] = "ha reaccionado a una publicación que sigues" if ntype == "like" else "ha comentado una publicación que sigues"
                db.add(Notification(user_id=target.id, type=ntype, data=data, read=j >= 3,
                                    created_at=now - timedelta(minutes=15 + j * 95)))
    db.commit()
    return created


def seed_jobs(db) -> int:
    """Ofertas y candidaturas de prueba. No duplica si ya existen."""
    users = _ensure_users(db)
    pw = hash_password(DEMO_PASSWORD)
    for key, name, sector, city, contact, username in DEMO_JOB_COMPANIES:
        email = key + DEMO_DOMAIN
        u = db.scalar(select(User).where(User.email == email))
        if not u:
            u = User(email=email, password_hash=pw, username=username, role=UserRole.company, email_verified=True, onboarding_done=True)
            db.add(u)
            db.flush()
            db.add(Company(user_id=u.id, name=name, sector=sector, location=city, contact_name=contact))
        users[key] = u
    db.flush()
    now = datetime.now(timezone.utc)
    degrees = {d.name: d.id for d in db.scalars(select(Degree))}
    created = 0
    jobs: list[Job] = []
    for (company, title, jtype, category, schedule, modality, city, province, pay, period, hours,
         degree, vacancies, description, requirements) in DEMO_JOBS:
        company_id = users[company].id
        job = db.scalar(select(Job).where(Job.company_id == company_id, Job.title == title))
        if not job:
            when = now - timedelta(hours=hours)
            job = Job(company_id=company_id, title=title, type=jtype, category=category, schedule=schedule,
                      modality=modality, remote=modality == "remoto", location=city, province=province, pay=pay,
                      pay_period=period, degree_id=degrees.get(degree) if degree else None, vacancies=vacancies,
                      description=description, requirements=requirements, status="abierta",
                      created_at=when, updated_at=when)
            db.add(job)
            db.flush()
            created += 1
        elif job.category != category:
            job.category = category  # ofertas de una versión anterior de los datos de prueba
        jobs.append(job)
    for student, index, app_status, message in DEMO_APPLICATIONS:
        job, student_id = jobs[index], users[student].id
        if not db.scalar(select(JobApplication).where(JobApplication.job_id == job.id, JobApplication.student_id == student_id)):
            db.add(JobApplication(job_id=job.id, student_id=student_id, status=app_status, message=message))
    db.commit()
    return created


def seed_stats(db) -> int:
    """Datos de prueba para Estadísticas: visitas al perfil, apariciones en búsquedas e impresiones de las
    publicaciones de las últimas dos semanas, y fecha a los seguidores que no la tenían."""
    import random

    users = db.scalars(select(User).where(User.onboarding_done.is_(True))).all()
    students = [u.id for u in users if u.role == UserRole.student]
    if not students:
        return 0
    now = datetime.now(timezone.utc)
    rng = random.Random(42)
    for f in db.scalars(select(Follow).where(Follow.created_at.is_(None))):
        f.created_at = now - timedelta(days=rng.randint(0, 30), hours=rng.randint(0, 23))
    created = 0
    for u in users:
        posts = db.scalars(select(Post.id).where(Post.user_id == u.id)).all()
        others = [s for s in students if s != u.id] or students
        for day in range(14):
            # Un poco más de actividad en la última semana, para que se vea la subida
            boost = 1 if day < 7 else 0
            when = lambda: now - timedelta(days=day, hours=rng.randint(0, 23), minutes=rng.randint(0, 59))  # noqa: E731
            for _ in range(rng.randint(0, 2 + boost)):
                db.add(StatEvent(owner_id=u.id, kind="profile_view", actor_id=rng.choice(others), created_at=when()))
                created += 1
            for _ in range(rng.randint(0, 3 + boost)):
                db.add(StatEvent(owner_id=u.id, kind="search_appearance", actor_id=rng.choice(others), created_at=when()))
                created += 1
            for pid in posts:
                for _ in range(rng.randint(0, 4 + 2 * boost)):
                    db.add(StatEvent(owner_id=u.id, kind="post_impression", actor_id=rng.choice(others), post_id=pid, created_at=when()))
                    created += 1
    db.commit()
    return created


# ---------------------------------------------------------------------------
# Grupos de la sección Social. Personas y grupos inventados.
# ---------------------------------------------------------------------------

# Más estudiantes ficticios, solo para que los grupos tengan miembros de varias provincias
EXTRA_FIRST = ["Alba", "Bruno", "Carla", "Diego", "Eva", "Fran", "Gema", "Héctor", "Inés", "Jorge", "Julia", "Kevin",
               "Lola", "Mario", "Noelia", "Óscar", "Patricia", "Raúl", "Silvia", "Tomás", "Úrsula", "Víctor", "Yaiza",
               "Zoe", "Andrea", "Bea", "Claudia", "David", "Elsa", "Fernando", "Gonzalo", "Isabel", "Jaime", "Lucas",
               "Miriam", "Nacho", "Olga", "Pedro", "Rocío", "Sergio", "Teresa", "Valeria"]
EXTRA_LAST = ["García", "López", "Martín", "Sánchez", "Romero", "Torres", "Ramírez", "Flores", "Moreno", "Jiménez",
              "Álvarez", "Muñoz", "Ortiz", "Delgado", "Castro", "Ortega", "Rubio", "Marín", "Serrano", "Molina", "Blanco"]

# nombre, temática, provincia (None = online / toda España), portada (demo_media), privacidad, atractivo (0-1), descripción
DEMO_GROUPS = [
    ("Quedadas Granada", "quedadas", "Granada", "campus-atardecer.jpg", "public", 0.9,
     "Tapas, planes de fin de semana y gente nueva. Si acabas de llegar a Granada, este es tu sitio."),
    ("Pisos y compañeros en Granada", "pisos", "Granada", None, "public", 0.85,
     "Habitaciones libres, busco compañero/a y consejos para no llevarte sustos con el contrato."),
    ("Running por el Genil", "deportes", "Granada", None, "public", 0.5,
     "Salimos a correr martes y jueves a las 20:00 desde el Paseo del Salón. Todos los ritmos."),
    ("Intercambio de idiomas Granada", "idiomas", "Granada", None, "public", 0.6,
     "Español, inglés, italiano, francés… Quedamos los miércoles para practicar con un café."),
    ("Erasmus en Granada", "viajes", "Granada", "erasmus.jpg", "public", 0.7,
     "Para quien viene de Erasmus y para quien se va. Papeleo, viajes y fiestas."),
    ("Montaña y Sierra Nevada", "deportes", "Granada", None, "public", 0.45,
     "Rutas, esquí y escalada. Compartimos coche para subir."),
    ("Programadores de Granada", "programacion", "Granada", "escritorio-codigo.jpg", "public", 0.65,
     "Meetups, hackathons y dudas de código entre estudiantes de informática de Granada."),
    ("Biblioteca de noche: estudiamos juntos", "estudio", "Granada", "biblioteca-noche.jpg", "public", 0.55,
     "Avisamos de qué bibliotecas abren por la noche en exámenes y quedamos para estudiar."),
    ("Fotografía callejera Granada", "fotografia", "Granada", None, "public", 0.35,
     "Paseos fotográficos por el Albaicín y el Realejo. Con móvil también vale."),
    ("Voluntariado universitario Granada", "voluntariado", "Granada", None, "public", 0.3,
     "Bancos de alimentos, clases de apoyo y actividades con mayores."),
    ("Pisos de estudiantes Sevilla", "pisos", "Sevilla", None, "public", 0.8,
     "Habitaciones cerca de Reina Mercedes, Cartuja y el centro."),
    ("Pádel universitario Sevilla", "deportes", "Sevilla", None, "public", 0.55,
     "Buscamos pareja para jugar y organizamos un torneo cada mes."),
    ("Quedadas universitarias Madrid", "quedadas", "Madrid", None, "public", 0.75,
     "Planes para conocer gente en Madrid: museos, conciertos, rutas y cañas."),
    ("Diseño y Bauhaus", "diseno", "Madrid", "cartel-bauhaus.jpg", "public", 0.45,
     "Tipografía, carteles, portfolios y críticas constructivas de diseño."),
    ("Startups y emprendimiento Madrid", "empresa", "Madrid", None, "public", 0.4,
     "Ideas de negocio, eventos de emprendimiento y gente con ganas de montar algo."),
    ("Música en directo Valencia", "musica", "Valencia", None, "public", 0.6,
     "Conciertos, jam sessions y gente para montar grupo."),
    ("Derecho práctico: casos reales", "derecho", "Valencia", None, "private", 0.35,
     "Comentamos sentencias y casos prácticos. Grupo privado para hablar con tranquilidad."),
    ("Surf y playa Málaga", "deportes", "Málaga", None, "public", 0.5,
     "Quedadas para surfear, paddle surf y voley playa."),
    ("Comunidad de IA", "tecnologia", None, "robot.jpg", "public", 0.8,
     "Inteligencia artificial para estudiantes: noticias, proyectos, papers explicados y prácticas."),
    ("Robótica y makers", "tecnologia", None, "laboratorio.jpg", "public", 0.45,
     "Arduino, impresión 3D, robots y proyectos hechos en casa."),
    ("Apps móviles: Android e iOS", "programacion", None, "app-movil.jpg", "public", 0.5,
     "Kotlin, Swift, Flutter y React Native. Enseña tu app y pide opiniones."),
    ("Gamers Linkedu", "videojuegos", None, None, "public", 0.75,
     "Partidas online por la noche, torneos entre universidades y recomendaciones."),
    ("Cine y series: recomendaciones", "cine", None, None, "public", 0.6,
     "¿Qué veo esta noche? Recomendaciones sin spoilers (o avisando)."),
    ("Club de lectura", "lectura", None, None, "public", 0.35,
     "Un libro al mes y una videollamada para comentarlo."),
    ("Cocina de estudiante", "cocina", None, None, "public", 0.55,
     "Recetas baratas, rápidas y para llevar en táper."),
    ("Psicología y bienestar estudiantil", "psicologia", None, None, "private", 0.45,
     "Ansiedad en exámenes, organización y apoyo entre estudiantes. Grupo privado y respetuoso."),
    ("Inglés B2 y C1: preparación de exámenes", "idiomas", None, None, "public", 0.6,
     "Cambridge, Aptis y TOEFL: materiales, speaking por parejas y fechas de exámenes."),
    ("Prácticas y primer empleo", "empleo", None, "graduacion.jpg", "public", 0.7,
     "Cómo conseguir prácticas, preparar entrevistas y hacer un buen CV."),
    ("Técnicas de estudio y productividad", "estudio", None, "apuntes-cafe.jpg", "public", 0.6,
     "Pomodoro, apuntes, apps y trucos para organizarte."),
    ("Ciencia y laboratorio", "ciencia", None, None, "public", 0.3,
     "Experimentos, divulgación y dudas de prácticas de laboratorio."),
    ("Salud: preparando el MIR desde primero", "salud", None, None, "public", 0.4,
     "Estudiantes de Medicina y Enfermería: recursos, rotaciones y MIR."),
    ("Viajes low cost para estudiantes", "viajes", None, None, "public", 0.65,
     "Vuelos baratos, interrail, albergues y compañeros de viaje."),
    ("Arte y dibujo", "arte", None, None, "public", 0.35,
     "Ilustración, acuarela, cómic y dibujo digital. Comparte lo que haces."),
    ("Ajedrez universitario", "quedadas", None, None, "public", 0.25,
     "Partidas online y torneos entre facultades."),
]

# grupo → [(texto, horas atrás)]
DEMO_GROUP_POSTS = {
    "Quedadas Granada": [("¿Alguien se apunta el viernes a tapas por el Realejo? Somos 5 de momento 🍻", 5),
                         ("Domingo: ruta tranquila por la Vereda de la Estrella. Salimos a las 9 desde el Paseo de los Tristes.", 30)],
    "Pisos y compañeros en Granada": [("Habitación libre en piso de 3, al lado de la Facultad de Ciencias. 280 € con gastos.", 3),
                                      ("Consejo: pedid siempre el inventario firmado antes de dar la fianza.", 50)],
    "Programadores de Granada": [("Este sábado hay hackathon en la ETSIIT. ¿Alguien de DAW o DAM se anima a hacer equipo?", 8),
                                 ("¿Qué usáis para desplegar proyectos de clase gratis? Yo estoy probando Railway.", 70)],
    "Biblioteca de noche: estudiamos juntos": [("La biblioteca de la Facultad de Derecho abre hasta las 2:00 durante exámenes.", 12)],
    "Erasmus en Granada": [("Ciao! Llegué de Bolonia hace una semana. ¿Algún plan para conocer gente? 🇮🇹", 20)],
    "Comunidad de IA": [("He resumido el paper de los transformers en una página. ¿Os lo paso?", 6),
                        ("Pregunta: ¿qué curso gratuito recomendáis para empezar con machine learning?", 40)],
    "Gamers Linkedu": [("Torneo de Mario Kart entre universidades el jueves a las 21:00. ¡Apuntaos!", 9)],
    "Prácticas y primer empleo": [("Truco para el CV: pon tus proyectos de clase con enlace a GitHub o a la demo.", 16),
                                  ("Me han cogido para las prácticas de DAW 🎉 Gracias por los consejos de las entrevistas.", 60)],
    "Cocina de estudiante": [("Receta de hoy: pasta con atún, tomate y orégano. 1,20 € por ración 🍝", 10)],
    "Inglés B2 y C1: preparación de exámenes": [("Busco pareja para practicar el speaking del C1 por videollamada.", 26)],
    "Técnicas de estudio y productividad": [("Mi método: 50 minutos de estudio, 10 de descanso y el móvil en otra habitación.", 14)],
    "Viajes low cost para estudiantes": [("Vuelos a Oporto por 25 € en noviembre. ¿Alguien se viene?", 22)],
    "Pisos de estudiantes Sevilla": [("Busco compañera de piso en Triana desde enero.", 18)],
    "Música en directo Valencia": [("Buscamos batería para un grupo de indie. Ensayamos en Benimaclet.", 33)],
    "Surf y playa Málaga": [("Este finde hay olas en la Misericordia. ¿Quién se apunta?", 28)],
}

_PLAIN = str.maketrans("áéíóúÁÉÍÓÚ", "aeiouAEIOU")


def _extra_students(db) -> list[User]:
    """42 estudiantes más (extra01@demo.studyhub…), repartidos por los centros de prueba."""
    schools = list(db.scalars(select(School).order_by(School.id)))
    degrees = list(db.scalars(select(Degree).order_by(Degree.id)))
    pw = None
    out = []
    for i, first in enumerate(EXTRA_FIRST):
        email = f"extra{i + 1:02d}{DEMO_DOMAIN}"
        u = db.scalar(select(User).where(User.email == email))
        if not u:
            pw = pw or hash_password(DEMO_PASSWORD)
            school = schools[(i * 5) % len(schools)]
            options = [d for d in degrees if (school.type == "universidad") == (d.level in ("grado", "master"))]
            degree = options[(i * 7) % len(options)]
            last = f"{EXTRA_LAST[i % len(EXTRA_LAST)]} {EXTRA_LAST[(i * 3 + 5) % len(EXTRA_LAST)]}"
            u = User(email=email, password_hash=pw, username=f"{first.lower().translate(_PLAIN)}.{i + 1:02d}",
                     role=UserRole.student, email_verified=True, onboarding_done=True)
            db.add(u)
            db.flush()
            db.add(StudentProfile(user_id=u.id, name=first, surname=last, location=school.city, school_id=school.id,
                                  degree_id=degree.id, course=None if degree.level == "master" else 1 + i % 4,
                                  is_over_16=True))
        out.append(u)
    db.flush()
    return out


def seed_groups(db) -> int:
    """Grupos de la sección Social con miembros y publicaciones. No duplica si ya existen."""
    import random

    from app.services.groups import degree_topics, is_universal

    _write_images()
    users = _ensure_users(db)
    students = [users[k] for k, *_ in DEMO_STUDENTS] + _extra_students(db)
    rng = random.Random(2026)
    now = datetime.now(timezone.utc)
    info = {}
    for u in students:
        profile = db.get(StudentProfile, u.id)
        school = db.get(School, profile.school_id) if profile and profile.school_id else None
        degree = db.get(Degree, profile.degree_id) if profile and profile.degree_id else None
        info[u.id] = (school.province if school else None, set(degree_topics(degree.name if degree else None)))

    created = 0
    for name, topic, province, cover, privacy, appeal, desc in DEMO_GROUPS:
        if db.scalar(select(Community).where(Community.type == "group", Community.name == name)):
            continue
        # Quién entra: más probable si es de su provincia, si encaja con sus estudios y si el grupo es "atractivo"
        members = []
        for u in students:
            prov, topics = info[u.id]
            p = 0.04 + 0.25 * appeal
            if topic in topics:
                p += 0.45
            if province and prov == province:
                p += 0.35 if is_universal(topic) else 0.2
            elif province:
                p *= 0.15  # un grupo de otra ciudad casi no tiene gente de fuera
            if rng.random() < min(p, 0.95):
                members.append(u)
        if users["irene"] in members:  # Irene se une solo a los grupos de abajo, para que tenga sugerencias
            members.remove(users["irene"])
        if not members:
            members = [students[1]]
        days = rng.randint(20, 400)
        g = Community(name=name, description=desc, type="group", topic=topic, privacy=privacy, province=province,
                      cover_url=f"/uploads/demo-{cover}" if cover else None, creator_id=members[0].id,
                      created_at=now - timedelta(days=days))
        db.add(g)
        db.flush()
        for j, u in enumerate(members):
            db.add(CommunityMember(community_id=g.id, user_id=u.id, role="admin" if j == 0 else "member",
                                   joined_at=now - timedelta(days=rng.randint(0, days))))
        for text, hours in DEMO_GROUP_POSTS.get(name, []):
            when = now - timedelta(hours=hours)
            db.add(Post(user_id=rng.choice(members).id, community_id=g.id, type="general", content=text,
                        created_at=when, updated_at=when))
        created += 1
    db.flush()

    # Irene (cuenta demo principal) ya está en dos grupos, para que "Tus grupos" y "Tu feed" no salgan vacíos
    for name in ("Programadores de Granada", "Quedadas Granada"):
        g = db.scalar(select(Community).where(Community.type == "group", Community.name == name))
        if g and not db.get(CommunityMember, (g.id, users["irene"].id)):
            db.add(CommunityMember(community_id=g.id, user_id=users["irene"].id, role="member"))
    db.commit()
    return created


# Docentes de prueba: email, nombre, apellidos, usuario, centro, estudios en los que da clase, qué imparte, ciudad
DEMO_TEACHERS = [
    ("elena.profe", "Elena", "Robles Gámez", "elena.robles", "IES Zaidín-Vergeles", "CFGS Desarrollo de Aplicaciones Web",
     "Programación y Bases de datos", "Granada"),
    ("andres.profe", "Andrés", "Ferrer Lucena", "andres.ferrer", "Universidad de Granada", "Grado en Ingeniería Informática",
     "Sistemas Operativos", "Granada"),
]

# Publicaciones de docentes: clave del docente, comunidad, tipo, texto, hace cuántos minutos
DEMO_TEACHER_POSTS = [
    ("elena.profe", "CFGS Desarrollo de Aplicaciones Web", "recurso",
     "He subido al aula virtual una batería de ejercicios de normalización hasta 3FN con las soluciones paso a paso. "
     "Haced primero los cinco primeros sin mirar y el jueves los corregimos en clase.", 20 * 60),
    ("andres.profe", "Técnicas de estudio", "general",
     "Un consejo de alguien que corrige muchos exámenes: explicad el razonamiento aunque no lleguéis al resultado. "
     "Un desarrollo claro con un fallo de cálculo suele valer más que un número suelto.", 9 * 60),
]

# Comentarios de docentes en publicaciones de estudiantes: clave del docente, inicio del texto de la publicación, comentario
DEMO_TEACHER_COMMENTS = [
    ("elena.profe", "¿Alguien tiene ejercicios resueltos de normalización",
     "Irene, acabo de subir una batería con soluciones al aula virtual. Si te atascas en la 3FN, pásate el miércoles por tutoría."),
]


def seed_teachers(db) -> int:
    """Docentes de prueba con alguna publicación y comentario. No duplica si ya existen."""
    users = _ensure_users(db)
    pw = hash_password(DEMO_PASSWORD)
    now = datetime.now(timezone.utc)
    teachers: dict[str, User] = {}
    created = 0
    for key, name, surname, username, school_name, degree_name, teaches, city in DEMO_TEACHERS:
        email = key + DEMO_DOMAIN
        u = db.scalar(select(User).where(User.email == email))
        if not u:
            school = db.scalar(select(School).where(School.name == school_name))
            degree = db.scalar(select(Degree).where(Degree.name == degree_name))
            u = User(email=email, password_hash=pw, username=username, role=UserRole.teacher, email_verified=True, onboarding_done=True)
            db.add(u)
            db.flush()
            db.add(StudentProfile(user_id=u.id, name=name, surname=surname, location=city, school_id=school.id,
                                  degree_id=degree.id, teaches=teaches, is_over_16=True))
            created += 1
        teachers[key] = u
    db.flush()
    communities = {c.name: c for c in db.scalars(select(Community))}
    for key, community_name, ptype, text, age in DEMO_TEACHER_POSTS:
        author = teachers[key]
        if db.scalar(select(Post.id).where(Post.user_id == author.id, Post.content == text)):
            continue
        community = communities.get(community_name)
        if community and not db.get(CommunityMember, (community.id, author.id)):
            db.add(CommunityMember(community_id=community.id, user_id=author.id))
        when = now - timedelta(minutes=age)
        post = Post(user_id=author.id, community_id=community.id if community else None, type=ptype, content=text,
                    created_at=when, updated_at=when)
        db.add(post)
        db.flush()
        # Algunos «me gusta» de estudiantes
        for student in list(users.values())[:6]:
            if not db.get(Like, (student.id, post.id)):
                db.add(Like(user_id=student.id, post_id=post.id))
    for key, starts, text in DEMO_TEACHER_COMMENTS:
        author = teachers[key]
        post = db.scalar(select(Post).where(Post.content.startswith(starts)))
        if post and not db.scalar(select(Comment.id).where(Comment.post_id == post.id, Comment.user_id == author.id)):
            db.add(Comment(post_id=post.id, user_id=author.id, content=text, created_at=post.created_at + timedelta(minutes=40)))
    db.commit()
    return created


# Publicaciones recientes de empresas, para que también salgan en Inicio (que muestra lo más reciente).
# usuario, comunidad (None = sin comunidad), tipo, texto, hace cuántos minutos
DEMO_COMPANY_POSTS = [
    ("technova", "Programadores de Granada", "general",
     "Abrimos 2 plazas de prácticas de desarrollo web para enero (React + FastAPI), con mentor y remuneradas. "
     "Si estudias DAW o DAM, mira la oferta en Empleo y escríbenos cualquier duda por aquí.", 3 * 60),
    ("academia_avanza", None, "recurso",
     "Taller gratuito de bases de datos para FP este jueves a las 18:00: normalización, consultas SQL y dudas de examen. "
     "Plazas limitadas, apúntate respondiendo a esta publicación.", 6 * 60),
    ("cafecampus", None, "general",
     "Semana de exámenes ☕ Abrimos hasta las 23:00 y el café es gratis con cualquier desayuno si nos enseñas el carné.", 11 * 60),
]

# Conversaciones con estudiantes, empresas y docentes mezclados, para ver de un vistazo quién es quién (ADR-017).
# Inicio del texto de la publicación → [(usuario, comentario, [(usuario, respuesta), …]), …]
DEMO_ROLE_THREADS = {
    "He subido al aula virtual una batería de ejercicios de normalización": [
        ("irene.cm", "¡Gracias, Elena! El ejercicio 4 me está costando: ¿la dependencia entre código postal y ciudad ya rompe la 3FN?", [
            ("elena.robles", "Exacto: es una dependencia transitiva. Sácala a su propia tabla y lo tienes."),
            ("hugo.dam", "Yo me lío siempre con eso. Me apunto la explicación 🙏"),
        ]),
        ("technova", "Buen material. En las entrevistas de prácticas preguntamos justo esto: normalizar un modelo pequeño en la pizarra.", [
            ("irene.cm", "¡Pues me viene genial saberlo antes de enviaros el CV!"),
        ]),
    ],
    "Un consejo de alguien que corrige muchos exámenes": [
        ("marta.ruiz", "¿Y en los tipo test? Ahí no hay razonamiento que valga 😅", [
            ("andres.ferrer", "En los test, leed dos veces el enunciado: la mitad de los fallos son por un «no» que se escapa."),
        ]),
        ("academia_avanza", "Lo repetimos mucho en clase de refuerzo: el desarrollo también puntúa. Muy buen consejo.", []),
        ("elena.robles", "Suscribo. Y dejad los cálculos ordenados: corregir un folio caótico cansa a cualquiera.", []),
    ],
    "Este sábado hay hackathon en la ETSIIT": [
        ("irene.cm", "¡Yo me apunto! Somos dos de DAW, nos falta alguien de diseño.", [
            ("alvaro.design", "Me ofrezco para el diseño si es en remoto 🙋‍♂️"),
        ]),
        ("technova", "Somos patrocinadores: habrá un premio a la mejor app y entrevistas para prácticas con los finalistas.", []),
        ("andres.ferrer", "Desde la ETSIIT os animamos a todos, también a primero. Se aprende muchísimo en un fin de semana.", []),
    ],
    "Truco para el CV: pon tus proyectos de clase": [
        ("talento_joven", "Totalmente. Cuando revisamos CV de estudiantes, un enlace a un proyecto vale más que tres cursos online.", [
            ("andrea.25", "¡Qué bien leerlo de alguien que selecciona!"),
        ]),
        ("estudio_pixel", "Y si es de diseño, un portfolio con 3 trabajos bien explicados mejor que 20 sin contexto.", []),
        ("elena.robles", "En el módulo de Proyecto os pido justo eso: que el repositorio tenga un README que se entienda.", []),
    ],
    "Me han cogido para las prácticas de DAW": [
        ("elena.robles", "¡Enhorabuena, Mario! Te lo has ganado. Cuéntanos qué tal la primera semana.", []),
        ("technova", "¡Bienvenido al equipo! Nos vemos el lunes a las 9:00.", [
            ("mario.14", "¡Allí estaré! Gracias por la oportunidad 🙌"),
        ]),
    ],
    "¿Qué usáis para desplegar proyectos de clase gratis?": [
        ("hugo.dam", "Vercel para el frontend y Render para el backend. Para clase sobra.", []),
        ("technova", "Ojo con dormir los servidores gratuitos: si se lo enseñáis a una empresa, despertadlo antes 😉", []),
        ("andres.ferrer", "Para Sistemas Operativos os recomiendo probar al menos una vez con un servidor propio: se aprende mucho.", []),
    ],
    "¿Merece la pena hacer prácticas no remuneradas en segundo?": [
        ("talento_joven", "Depende de lo que aprendas. Si hay tutor y un plan de formación, puede compensar; si no, mejor buscar otra.", []),
        ("andres.ferrer", "Mirad siempre que estén dentro de un convenio con la universidad. Si no, no son prácticas.", [
            ("dani.prieto", "Buen dato, no lo sabía. Lo pregunto en la oficina de prácticas."),
        ]),
    ],
    "Abrimos 2 plazas de prácticas de desarrollo web para enero": [
        ("irene.cm", "¿Se puede hacer a media jornada? Por las tardes tengo clase.", [
            ("technova", "Sí, Irene: hay horario de mañana de 9:00 a 13:00. Lo dejamos indicado en la oferta."),
        ]),
        ("elena.robles", "Se lo paso a mi grupo de segundo de DAW. Gracias por contar con el instituto.", []),
        ("hugo.dam", "¿Vale también para DAM aunque sea de primero?", []),
    ],
    "Taller gratuito de bases de datos para FP este jueves": [
        ("irene.cm", "¡Me apunto! Justo me viene genial para el examen.", []),
        ("elena.robles", "Buena iniciativa. Lo recomiendo como repaso, coincide con lo que damos en clase.", [
            ("academia_avanza", "¡Gracias, Elena! Si quieres traer a tu grupo, os guardamos sitio."),
        ]),
    ],
    "Semana de exámenes ☕ Abrimos hasta las 23:00": [
        ("marta.ruiz", "Os vais a convertir en nuestra segunda biblioteca 😂", []),
        ("andres.ferrer", "Buen plan, pero dormid también, que el cerebro estudia mientras duerme.", []),
    ],
    "¿Alguien tiene ejercicios resueltos de normalización": [
        ("hugo.dam", "Yo tengo los del año pasado, te los paso por mensaje.", []),
        ("academia_avanza", "Esta semana damos un taller gratuito de bases de datos para FP, por si os sirve.", []),
    ],
}


def seed_role_threads(db) -> int:
    """Publicaciones recientes de empresas y comentarios de estudiantes, empresas y docentes. No duplica."""
    by_username = {u.username: u for u in db.scalars(select(User).where(User.username.is_not(None)))}
    created = 0
    now = datetime.now(timezone.utc)
    communities = {c.name: c for c in db.scalars(select(Community))}
    for username, community_name, ptype, text, age in DEMO_COMPANY_POSTS:
        author = by_username.get(username)
        if not author or db.scalar(select(Post.id).where(Post.user_id == author.id, Post.content == text)):
            continue
        community = communities.get(community_name) if community_name else None
        if community and not db.get(CommunityMember, (community.id, author.id)):
            db.add(CommunityMember(community_id=community.id, user_id=author.id))
        when = now - timedelta(minutes=age)
        db.add(Post(user_id=author.id, community_id=community.id if community else None, type=ptype, content=text,
                    created_at=when, updated_at=when))
        created += 1
    db.flush()

    def add(post, username, text, minutes, parent=None):
        nonlocal created
        u = by_username.get(username)
        if not u:
            return None
        c = db.scalar(select(Comment).where(Comment.post_id == post.id, Comment.user_id == u.id, Comment.content == text))
        if not c:
            c = Comment(post_id=post.id, user_id=u.id, content=text, parent_id=parent.id if parent else None,
                        created_at=post.created_at + timedelta(minutes=minutes))
            db.add(c)
            db.flush()
            created += 1
        return c

    for starts, thread in DEMO_ROLE_THREADS.items():
        post = db.scalar(select(Post).where(Post.content.startswith(starts)))
        if not post:
            continue
        for i, (username, text, replies) in enumerate(thread):
            parent = add(post, username, text, 15 + i * 25)
            if parent is None:
                continue
            for j, (r_username, r_text) in enumerate(replies):
                add(post, r_username, r_text, 25 + i * 25 + j * 6, parent)
    db.commit()
    return created


def run():
    ensure_schema()
    db = SessionLocal()
    if seed_catalog(db):
        print("Catálogo creado: centros, estudios y comunidades.")
    created = seed_demo(db)
    jobs_created = seed_jobs(db)
    groups_created = seed_groups(db)
    if seed_teachers(db):
        print("Docentes de prueba creados.")
    if seed_role_threads(db):
        print("Conversaciones entre estudiantes, empresas y docentes creadas.")
    if groups_created:
        print(f"Grupos de prueba creados: {groups_created}.")
    if jobs_created:
        print(f"Ofertas de empleo de prueba creadas: {jobs_created}.")
    if not db.scalar(select(StatEvent.id).limit(1)):
        print(f"Estadísticas de prueba creadas: {seed_stats(db)} datos.")
    print(f"Contenido de prueba al día ({created} publicaciones nuevas). Contraseña de las cuentas demo: {DEMO_PASSWORD}")


if __name__ == "__main__":
    run()
