import Link from "next/link";
import { Briefcase, Building2, Check, GraduationCap, MapPin, MessagesSquare, Presentation, Star, Users } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { BrandMark } from "@/components/app/Spine";
import { Backdrop3D } from "@/components/three/Backdrop3D";
import { RedirectIfLoggedIn } from "@/components/RedirectIfLoggedIn";

/** Las tres secciones de la app, cada una con su color y un ejemplo de lo que se ve dentro. */
const sections = [
  {
    icon: Users,
    title: "Social",
    text: "Grupos de clase, de tu centro o de lo que te guste. Publica, comenta y comparte con tu gente.",
    example: "«Proyecto final de DAW: buscamos a alguien de diseño»",
    tone: "bg-social-50 text-social-ink",
  },
  {
    icon: MessagesSquare,
    title: "Foros",
    text: "Un foro por titulación. Dudas, apuntes y opiniones reales de quien ya ha cursado la asignatura.",
    example: "«¿Ejercicios resueltos de normalización?», 12 respuestas",
    tone: "bg-foros-50 text-foros-ink",
  },
  {
    icon: Briefcase,
    title: "Empleo",
    text: "Encargos de pocos días y prácticas que caben en tu horario, filtrados por lo que estudias.",
    example: "«Cartelería para un evento», 2 días, 150 €",
    tone: "bg-empleo-50 text-empleo-ink",
  },
];

const steps = [
  { title: "Crea tu perfil con tus estudios", text: "Ciclo o carrera, centro y curso. Con eso ya sabemos qué te puede interesar." },
  { title: "Entra en tu foro y en tus grupos", text: "Te proponemos los de tu titulación y los de tu clase. Te unes con un botón." },
  { title: "Te enseñamos lo que encaja", text: "Ofertas de tus estudios y debates de tus foros, marcados para que no se te escapen." },
];

const audiences = [
  {
    icon: GraduationCap,
    title: "Si estudias",
    tone: "bg-social-50 text-social-ink",
    points: ["Experiencia real sin dejar las clases", "Resuelve dudas con gente de tu misma titulación", "Lee opiniones antes de elegir centro"],
    cta: "Crear cuenta de estudiante",
  },
  {
    icon: Building2,
    title: "Si tienes una empresa",
    tone: "bg-empleo-50 text-empleo-ink",
    points: ["Publica un encargo o unas prácticas en minutos", "Filtra por estudios, centro y zona", "Habla con los candidatos desde Linkedu"],
    cta: "Crear cuenta de empresa",
  },
  {
    icon: Presentation,
    title: "Si das clase",
    tone: "bg-docente-50 text-docente-ink",
    points: ["Crea el grupo de tu asignatura", "Responde en el foro de tu titulación", "Recomienda ofertas a tu alumnado"],
    cta: "Crear cuenta de docente",
  },
];

/** La composición de la portada: un estudiante y una oferta, unidos por los eslabones del logotipo. */
function LinkedPair() {
  return (
    <div className="link-pair relative mx-auto w-full max-w-[460px] py-4" aria-hidden>
      {/* Ficha del estudiante */}
      <div className="link-card-a relative z-10 mr-10 rounded-card border border-line bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-social-50 font-display text-lg font-bold text-social-ink">IR</span>
          <div>
            <p className="font-semibold">Irene Ruiz</p>
            <p className="text-sm text-ink-muted">2.º de DAW, Granada</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5 text-sm">
          {["React", "Figma", "SQL"].map((s) => (
            <span key={s} className="rounded-tag bg-page px-2.5 py-1 text-ink-muted">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Los eslabones: el punto de unión. Única sombra de la portada (excepción documentada en ADR-018): el nudo flota sobre las dos fichas */}
      <div className="relative z-20 -my-3 flex items-center justify-center">
        <span className="link-knot flex h-16 w-16 items-center justify-center rounded-full border border-line bg-card shadow-lg shadow-black/5">
          <BrandMark size={40} />
        </span>
        <span className="link-badge absolute left-[calc(50%+44px)] whitespace-nowrap rounded-btn bg-accent-50 px-3 py-1.5 text-sm font-semibold text-accent-800">
          Encaja contigo
        </span>
      </div>

      {/* Ficha de la oferta */}
      <div className="link-card-b relative z-10 ml-10 rounded-card border border-line bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-empleo-50 font-display text-lg font-bold text-empleo-ink">TN</span>
            <div>
              <p className="font-semibold">Prácticas de desarrollo web</p>
              <p className="text-sm text-ink-muted">TechNova, Granada</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5 text-sm">
          <span className="rounded-tag bg-empleo-50 px-2.5 py-1 text-empleo-ink">Prácticas, 3 meses</span>
          <span className="flex items-center gap-1 rounded-tag bg-page px-2.5 py-1 text-ink-muted">
            <MapPin className="h-3.5 w-3.5" /> Híbrido
          </span>
          <span className="rounded-tag bg-page px-2.5 py-1 text-ink-muted">Piden React</span>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-page">
      <RedirectIfLoggedIn />
      <header className="sticky top-0 z-30 border-b border-line/70 bg-page/90 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4">
          <Logo height={28} />
          <nav className="flex items-center gap-1 sm:gap-2">
            <a href="#secciones" className="hidden min-h-11 items-center rounded-btn px-3 text-[15px] font-medium text-ink-muted hover:text-ink md:inline-flex">
              Qué hay dentro
            </a>
            <a href="#como-funciona" className="hidden min-h-11 items-center rounded-btn px-3 text-[15px] font-medium text-ink-muted hover:text-ink md:inline-flex">
              Cómo funciona
            </a>
            <Link href="/login" className="inline-flex min-h-11 items-center whitespace-nowrap rounded-btn px-4 text-[15px] font-semibold text-ink hover:bg-field-hover">
              Iniciar sesión
            </Link>
            <span className="hidden sm:block">
              <ButtonLink href="/registro">Crear cuenta</ButtonLink>
            </span>
          </nav>
        </div>
      </header>

      <main>
        {/* Portada: el titular y, al lado, un estudiante y una oferta unidos por los eslabones del logo */}
        <div className="relative isolate overflow-hidden">
          <Backdrop3D kind="estudio" dense className="hero-scene absolute inset-0 -z-10" />
          <section className="hero-in mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-10 md:grid-cols-[1.15fr_1fr] md:pb-24 md:pt-16">
            <div>
              <h1 className="max-w-[15ch] text-[42px] font-extrabold leading-[1.05] tracking-[-0.025em] sm:text-[60px]">
                Lo que estudias, enlazado con quien lo necesita.
              </h1>
              <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-muted">
                Linkedu une a estudiantes, docentes y empresas: encargos y prácticas que caben entre clase y clase, foros de tu titulación y
                opiniones de quien ya ha pasado por ahí.
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
            <LinkedPair />
          </section>
        </div>

        {/* Las tres secciones */}
        <section id="secciones" className="scroll-mt-20 border-y border-line bg-card">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <h2 className="max-w-[22ch] text-[32px] font-bold sm:text-[38px]">Tres sitios, una misma cuenta</h2>
            <p className="mt-3 max-w-[56ch] text-ink-muted">Todo lo que pasa en tu vida de estudiante, sin saltar de una aplicación a otra.</p>
            <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-10 md:grid-cols-3">
              {sections.map(({ icon: Icon, title, text, example, tone }) => (
                <div key={title}>
                  <span className={`flex h-11 w-11 items-center justify-center rounded-[10px] ${tone}`}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-xl">{title}</h3>
                  <p className="mt-2 max-w-[38ch] text-[15px] leading-relaxed text-ink-muted">{text}</p>
                  <p className="mt-4 border-l-2 border-line pl-3 text-sm text-ink-subtle">{example}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cómo funciona: es una secuencia de verdad, por eso va numerada */}
        <section id="como-funciona" className="scroll-mt-20 mx-auto max-w-6xl px-4 py-16 md:py-20">
          <h2 className="text-[32px] font-bold sm:text-[38px]">Cómo funciona</h2>
          <ol className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-3">
            {steps.map(({ title, text }, i) => (
              <li key={title} className="relative">
                <span className="font-display text-[44px] font-extrabold leading-none text-brand-700">{i + 1}</span>
                <h3 className="mt-3 text-lg">{title}</h3>
                <p className="mt-2 max-w-[36ch] text-[15px] leading-relaxed text-ink-muted">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Para quién */}
        <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-20">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3">
            {audiences.map(({ icon: Icon, title, tone, points, cta }) => (
              <div key={title} className="flex flex-col rounded-card border border-line bg-card p-6">
                <span className={`flex h-11 w-11 items-center justify-center rounded-[10px] ${tone}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-4 text-[24px] font-bold">{title}</h2>
                <ul className="mt-4 flex-1 space-y-2.5">
                  {points.map((p) => (
                    <li key={p} className="flex gap-2.5 text-[15px] text-ink-muted">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link href="/registro" className="mt-6 inline-flex min-h-11 items-center font-semibold text-brand-700 underline underline-offset-2">
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Cierre: el único bloque oscuro de la página, con el naranja del logo en el botón */}
        <section className="px-4 pb-16 md:pb-20">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 rounded-card bg-board px-6 py-10 text-spine-ink sm:px-10 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <BrandMark onDark size={56} className="hidden sm:inline-flex" />
              <div>
                <h2 className="text-[28px] font-bold text-spine-strong sm:text-[32px]">Tu primer enlace empieza aquí</h2>
                <p className="mt-2 max-w-[48ch]">Crear la cuenta es gratis y solo te pide tus estudios.</p>
              </div>
            </div>
            <Link
              href="/registro"
              className="inline-flex min-h-12 shrink-0 items-center rounded-btn bg-mark px-8 text-base font-semibold text-on-mark transition-transform hover:brightness-105"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <Logo height={22} />
          <span className="flex items-center gap-1.5">
            <Star className="h-4 w-4 text-empleo" aria-hidden /> Trabajo de Fin de Ciclo
          </span>
        </div>
      </footer>
    </div>
  );
}
