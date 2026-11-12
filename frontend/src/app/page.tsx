import Link from "next/link";
import { Briefcase, Building2, GraduationCap, MapPin, MessageCircle, Star } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Logo } from "@/components/Logo";

const pillars = [
  {
    icon: Briefcase,
    title: "Trabajos puntuales",
    text: "Encargos y prácticas compatibles con tus horarios de clase.",
  },
  {
    icon: MessageCircle,
    title: "Foros por estudios",
    text: "Pregunta, comparte apuntes y debate con gente que estudia lo mismo que tú.",
  },
  {
    icon: Star,
    title: "Opiniones reales",
    text: "Descubre cómo son de verdad las carreras, los centros y las asignaturas.",
  },
];

function PreviewStack() {
  return (
    <div className="relative mx-auto w-full max-w-[420px] space-y-4" aria-hidden>
      <div className="rounded-card border border-line bg-card p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-ink text-sm font-bold text-inverse">AC</div>
            <div>
              <p className="font-semibold">Diseño de cartelería para evento</p>
              <p className="text-sm text-ink-muted">Acme Eventos · Granada</p>
            </div>
          </div>
          <span className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-800">Nuevo</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">Puntual · 2 días</span>
          <span className="rounded-full bg-page px-3 py-1 text-ink-muted">150 €</span>
          <span className="flex items-center gap-1 rounded-full bg-page px-3 py-1 text-ink-muted">
            <MapPin className="h-3.5 w-3.5" /> Remoto
          </span>
        </div>
      </div>

      <div className="ml-8 rounded-card border border-line bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">DAW · Bases de datos</p>
        <p className="mt-1.5 font-semibold">¿Alguien tiene ejercicios resueltos de normalización?</p>
        <p className="mt-2 text-sm text-ink-muted">12 respuestas · 34 me gusta</p>
      </div>

      <div className="rounded-card border border-line bg-card p-5">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Ingeniería Informática · UGR</p>
          <div className="flex items-center gap-0.5 text-accent-400">
            {[0, 1, 2, 3].map((i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
            <Star className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-sm text-ink-muted">&ldquo;Exigente el primer año, pero las prácticas merecen la pena.&rdquo;</p>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-card">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="flex items-center gap-2">
            <Link href="/login" className="min-h-11 whitespace-nowrap rounded-full px-4 py-2.5 text-[15px] font-semibold text-ink hover:bg-page">
              Iniciar sesión
            </Link>
            <span className="hidden sm:block">
              <ButtonLink href="/registro">Crear cuenta</ButtonLink>
            </span>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              Donde los estudiantes y las empresas se encuentran
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-muted">
              Trabajos puntuales, foros por asignatura y opiniones reales sobre carreras y universidades.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/registro" className="min-h-12 px-8 text-base">
                Crear cuenta gratis
              </ButtonLink>
              <p className="text-sm text-ink-muted">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="font-semibold text-brand-700 underline">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
          <PreviewStack />
        </section>

        <section className="bg-page">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-14 sm:grid-cols-3">
            {pillars.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-card border border-line bg-card p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h2 className="mt-4 text-lg font-semibold">{title}</h2>
                <p className="mt-1.5 text-[15px] text-ink-muted">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-4 py-14 sm:grid-cols-2">
          <div className="rounded-card border border-line p-6">
            <GraduationCap className="h-6 w-6 text-brand-700" aria-hidden />
            <h2 className="mt-3 text-xl font-semibold">Para estudiantes</h2>
            <p className="mt-1.5 text-ink-muted">Gana experiencia sin dejar de estudiar y apóyate en tu comunidad.</p>
            <Link href="/registro" className="mt-4 inline-block font-semibold text-brand-700 underline">
              Crear cuenta de estudiante
            </Link>
          </div>
          <div className="rounded-card border border-line p-6">
            <Building2 className="h-6 w-6 text-brand-700" aria-hidden />
            <h2 className="mt-3 text-xl font-semibold">Para empresas</h2>
            <p className="mt-1.5 text-ink-muted">Publica encargos y encuentra estudiantes por estudios, centro y zona.</p>
            <Link href="/registro" className="mt-4 inline-block font-semibold text-brand-700 underline">
              Crear cuenta de empresa
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-8 text-center text-sm text-ink-muted">
        StudyHub · Trabajo de Fin de Ciclo
      </footer>
    </div>
  );
}
