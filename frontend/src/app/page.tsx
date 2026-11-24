import Link from "next/link";
import { Briefcase, Building2, GraduationCap, MapPin, MessageCircle, Star } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { Backdrop3D } from "@/components/three/Backdrop3D";
import { RedirectIfLoggedIn } from "@/components/RedirectIfLoggedIn";

const pillars = [
  {
    icon: Briefcase,
    title: "Trabajos puntuales",
    text: "Encargos y prácticas que encajan con tu horario de clase.",
    tone: "bg-empleo-50 text-empleo-ink",
  },
  {
    icon: MessageCircle,
    title: "Foros por estudios",
    text: "Pregunta, comparte apuntes y debate con gente que estudia lo mismo que tú.",
    tone: "bg-foros-50 text-foros-ink",
  },
  {
    icon: Star,
    title: "Opiniones reales",
    text: "Cómo son de verdad las carreras, los centros y las asignaturas, contado por quien las cursa.",
    tone: "bg-brand-50 text-brand-700",
  },
];

/** La pizarra de la portada: tres cosas que pasan a diario en Linkedu. */
function Chalkboard() {
  return (
    <div className="board-3d rounded-card bg-board p-5 text-spine-ink shadow-2xl shadow-black/20 sm:p-7" aria-hidden>
      <p className="font-display text-lg font-semibold text-spine-strong">Hoy en Linkedu</p>
      <div className="mt-5 space-y-3">
        <div className="board-card rounded-card bg-card p-4 text-ink">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-ink text-sm font-bold text-inverse">AC</div>
              <div>
                <p className="font-semibold">Diseño de cartelería para un evento</p>
                <p className="text-sm text-ink-muted">Acme Eventos, Granada</p>
              </div>
            </div>
            <span className="nav-mark shrink-0 px-2 py-0.5 text-xs font-semibold">Nuevo</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span className="rounded-[6px] bg-empleo-50 px-2.5 py-1 text-empleo-ink">Puntual, 2 días</span>
            <span className="rounded-[6px] bg-page px-2.5 py-1 text-ink-muted">150 €</span>
            <span className="flex items-center gap-1 rounded-[6px] bg-page px-2.5 py-1 text-ink-muted">
              <MapPin className="h-3.5 w-3.5" /> Remoto
            </span>
          </div>
        </div>

        <div className="board-card rounded-card bg-card p-4 text-ink sm:ml-10">
          <p className="text-sm font-semibold text-foros-ink">Foro de DAW, Bases de datos</p>
          <p className="mt-1 font-semibold">¿Alguien tiene ejercicios resueltos de normalización?</p>
          <p className="mt-1.5 text-sm text-ink-muted">12 respuestas, 34 me gusta</p>
        </div>

        <div className="board-card rounded-card bg-card p-4 text-ink">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold">Ingeniería Informática, UGR</p>
            <div className="flex items-center gap-0.5 text-accent-400">
              {[0, 1, 2, 3].map((i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
              <Star className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-1.5 text-sm text-ink-muted">&ldquo;Exigente el primer año, pero las prácticas merecen la pena.&rdquo;</p>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-page">
      <RedirectIfLoggedIn />
      <header>
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="flex items-center gap-2">
            <Link href="/login" className="min-h-11 whitespace-nowrap rounded-btn px-4 py-2.5 text-[15px] font-semibold text-ink hover:bg-field-hover">
              Iniciar sesión
            </Link>
            <span className="hidden sm:block">
              <ButtonLink href="/registro">Crear cuenta</ButtonLink>
            </span>
          </nav>
        </div>
      </header>

      <main>
        {/* Portada: fichas, lápices y libros flotando en 3D detrás de la pizarra */}
        <div className="relative isolate overflow-hidden">
          <Backdrop3D kind="estudio" dense className="hero-scene absolute inset-0 -z-10" />
        <section className="hero-in mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-8 md:grid-cols-[1.1fr_1fr] md:pb-24 md:pt-14">
          <div>
            <h1 className="max-w-[14ch] text-[44px] font-extrabold leading-[1.04] tracking-[-0.02em] sm:text-[64px]">
              Tu carrera, tus apuntes y tu primer trabajo, en el mismo sitio.
            </h1>
            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-muted">
              Linkedu junta a estudiantes y empresas: encargos que caben entre clase y clase, foros de tu titulación y opiniones de quien ya
              ha pasado por ahí.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <ButtonLink href="/registro" className="min-h-12 px-8 text-base">
                Crear cuenta gratis
              </ButtonLink>
              <p className="text-sm text-ink-muted">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="font-semibold text-brand-700 underline underline-offset-2">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
          <Chalkboard />
        </section>
        </div>

        <section className="border-y border-line bg-card">
          <div className="mx-auto grid max-w-6xl px-4 sm:grid-cols-3 sm:divide-x sm:divide-line">
            {pillars.map(({ icon: Icon, title, text, tone }) => (
              <div key={title} className="py-10 sm:px-8 sm:first:pl-0 sm:last:pr-0">
                <span className={`flex h-10 w-10 items-center justify-center rounded-[8px] ${tone}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-4 text-[22px] font-bold">{title}</h2>
                <p className="mt-2 max-w-[38ch] text-[15px] leading-relaxed text-ink-muted">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:grid-cols-2">
          <div>
            <GraduationCap className="h-7 w-7 text-brand-700" aria-hidden />
            <h2 className="mt-3 text-[30px] font-bold">Si estudias</h2>
            <h3 className="mt-1 text-lg text-ink-muted">Gana experiencia sin dejar las clases</h3>
            <p className="mt-3 max-w-[44ch] leading-relaxed text-ink-muted">
              Apúntate a encargos cortos, resuelve dudas en el foro de tu ciclo o carrera y lee qué opinan otros antes de elegir centro.
            </p>
            <Link href="/registro" className="mt-4 inline-flex min-h-11 items-center font-semibold text-brand-700 underline underline-offset-2">
              Crear cuenta de estudiante
            </Link>
          </div>
          <div>
            <Building2 className="h-7 w-7 text-empleo-ink" aria-hidden />
            <h2 className="mt-3 text-[30px] font-bold">Si tienes una empresa</h2>
            <h3 className="mt-1 text-lg text-ink-muted">Encuentra a quien sabe hacerlo</h3>
            <p className="mt-3 max-w-[44ch] leading-relaxed text-ink-muted">
              Publica un encargo o unas prácticas y filtra a los candidatos por estudios, centro y zona.
            </p>
            <Link href="/registro" className="mt-4 inline-flex min-h-11 items-center font-semibold text-brand-700 underline underline-offset-2">
              Crear cuenta de empresa
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <span>Trabajo de Fin de Ciclo</span>
        </div>
      </footer>
    </div>
  );
}
