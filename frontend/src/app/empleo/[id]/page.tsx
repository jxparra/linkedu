"use client";

import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  CalendarClock,
  Check,
  Clock,
  Globe,
  GraduationCap,
  MapPin,
  MessageCircle,
  Pencil,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Select } from "@/components/Select";
import { AppShell } from "@/components/app/AppShell";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Chip } from "@/components/jobs/JobCard";
import { api, ApiError, mediaUrl, type User } from "@/lib/api";
import {
  APPLICATION_STATUS,
  APPLICATION_STEPS,
  formatDate,
  formatPay,
  formatPlace,
  isNew,
  JOB_TYPES,
  MODALITIES,
  SCHEDULES,
  type Applicant,
  type ApplicationStatus,
  type Job,
} from "@/lib/jobs";
import { timeAgo } from "@/lib/time";
import { useConfirm } from "@/components/ConfirmDialog";

const msg = (e: unknown) => (e instanceof ApiError ? e.message : "Algo ha fallado. Inténtalo de nuevo.");

/* ---------------------------------------------------------------- Inscribirse */
function ApplyDialog({ job, onClose, onDone }: { job: Job; onClose: () => void; onDone: (j: Job) => void }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      onDone(await api<Job>(`/jobs/${job.id}/apply`, { method: "POST", body: { message } }));
    } catch (err) {
      setError(msg(err));
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-title"
        onSubmit={submit}
        className="w-full max-w-lg rounded-t-card bg-card p-5 shadow-xl sm:rounded-card sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="apply-title" className="text-xl font-bold">
              Inscribirte en la oferta
            </h2>
            <p className="mt-0.5 text-ink-muted">
              {job.title} · {job.company.name}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-page">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <p className="mt-4 rounded-input bg-page px-3.5 py-3 text-sm text-ink-muted">
          La empresa verá tu perfil de Linkedu: nombre, estudios, centro y publicaciones.
        </p>

        <label htmlFor="apply-msg" className="mb-1.5 mt-4 block text-sm font-medium">
          Carta de presentación <span className="font-normal text-ink-muted">(opcional)</span>
        </label>
        <textarea
          id="apply-msg"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          rows={5}
          autoFocus
          placeholder="Cuéntale a la empresa por qué encajas: qué estudias, experiencia, disponibilidad…"
          className="w-full resize-none rounded-input border border-line px-3.5 py-3 text-[15px] placeholder:text-ink-subtle hover:border-ink-subtle focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
        />
        <p className="mt-1 text-right text-[13px] text-ink-muted">{message.length}/2000</p>

        <ErrorBanner message={error} />

        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={sending}>
            Enviar candidatura
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------- Seguimiento de la candidatura (estudiante) */
function Tracker({ job, onWithdraw }: { job: Job; onWithdraw: () => void }) {
  const status = job.my_status as ApplicationStatus;
  const discarded = status === "rechazada";
  const reached = APPLICATION_STEPS.indexOf(status);

  return (
    <section className="rounded-card border border-line bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">Tu candidatura</h2>
        <Chip className={APPLICATION_STATUS[status].cls}>{APPLICATION_STATUS[status].label}</Chip>
      </div>
      {job.applied_at && <p className="mt-0.5 text-sm text-ink-muted">Te inscribiste {timeAgo(job.applied_at)}</p>}

      {discarded ? (
        <p className="mt-4 rounded-input bg-page px-3.5 py-3 text-[15px] text-ink-muted">
          La empresa ha seguido con otras candidaturas. ¡Ánimo! Hay más ofertas esperándote.
        </p>
      ) : (
        <ol className="mt-5 grid grid-cols-4 gap-1">
          {APPLICATION_STEPS.map((step, i) => {
            const done = i <= reached;
            return (
              <li key={step} className="flex flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <span className={`h-[3px] flex-1 ${i === 0 ? "invisible" : done ? "bg-brand-600" : "bg-line"}`} />
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      done ? "bg-brand-600 text-on-brand" : "border-2 border-line bg-card text-ink-muted"
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
                  </span>
                  <span className={`h-[3px] flex-1 ${i === APPLICATION_STEPS.length - 1 ? "invisible" : i < reached ? "bg-brand-600" : "bg-line"}`} />
                </div>
                <span className={`mt-1.5 text-[13px] ${done ? "font-semibold text-ink" : "text-ink-muted"}`}>{APPLICATION_STATUS[step].label}</span>
              </li>
            );
          })}
        </ol>
      )}

      {job.my_message && (
        <details className="mt-4 text-[15px]">
          <summary className="min-h-11 py-2 font-semibold text-brand-700">Ver tu carta de presentación</summary>
          <p className="whitespace-pre-line rounded-input bg-page px-3.5 py-3 text-ink-muted">{job.my_message}</p>
        </details>
      )}

      {(status === "enviada" || status === "vista") && (
        <button type="button" onClick={onWithdraw} className="mt-3 min-h-11 text-sm font-semibold text-ink-muted hover:text-danger">
          Retirar candidatura
        </button>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------- Candidatos (empresa) */
const COMPANY_OPTIONS: ApplicationStatus[] = ["vista", "en_proceso", "aceptada", "rechazada"];

function Applicants({ jobId }: { jobId: number }) {
  const [items, setItems] = useState<Applicant[] | null>(null);

  useEffect(() => {
    api<Applicant[]>(`/jobs/${jobId}/applications`).then(setItems).catch(() => setItems([]));
  }, [jobId]);

  const change = async (a: Applicant, status: ApplicationStatus) => {
    setItems((list) => list?.map((x) => (x.id === a.id ? { ...x, status } : x)) ?? list);
    try {
      await api(`/jobs/applications/${a.id}`, { method: "PATCH", body: { status } });
    } catch {
      setItems((list) => list?.map((x) => (x.id === a.id ? a : x)) ?? list);
    }
  };

  return (
    <section id="candidatos" className="scroll-mt-24 rounded-card border border-line bg-card">
      <h2 className="border-b border-line px-5 py-4 text-lg font-bold">
        Candidatos{items && items.length > 0 && <span className="font-normal text-ink-muted"> · {items.length}</span>}
      </h2>
      {items === null ? (
        <div className="space-y-2 p-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-card bg-page" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="p-6 text-center text-ink-muted">Todavía no se ha inscrito nadie. Te avisaremos con una notificación.</p>
      ) : (
        <ul>
          {items.map((a) => (
            <li key={a.id} className="border-b border-line px-5 py-4 last:border-0">
              <div className="flex flex-wrap items-center gap-3">
                <Link href={`/perfil/${a.student.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={a.student.name} src={a.student.avatar_url ? mediaUrl(a.student.avatar_url) : null} />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold hover:underline">{a.student.name}</span>
                    {a.student.headline && <span className="block truncate text-sm text-ink-muted">{a.student.headline}</span>}
                    <span className="block text-[13px] text-ink-subtle">Inscrito {timeAgo(a.created_at)}</span>
                  </span>
                </Link>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/mensajes?con=${a.student.id}`}
                    aria-label={`Escribir a ${a.student.name}`}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-field hover:bg-field-hover"
                  >
                    <MessageCircle className="h-5 w-5" aria-hidden />
                  </Link>
                  <Select
                    ariaLabel={`Estado de la candidatura de ${a.student.name}`}
                    tone="bare"
                    value={a.status}
                    onChange={(v) => change(a, v as ApplicationStatus)}
                    options={[
                      ...(a.status === "enviada" ? [{ value: "enviada", label: "Nueva" }] : []),
                      ...COMPANY_OPTIONS.map((st) => ({ value: st, label: APPLICATION_STATUS[st].label })),
                    ]}
                    className="w-44"
                    buttonClassName={`h-11 rounded-btn text-sm font-semibold ${APPLICATION_STATUS[a.status].cls}`}
                  />
                </div>
              </div>
              {a.message && <p className="mt-3 whitespace-pre-line rounded-input bg-page px-3.5 py-3 text-[15px] text-ink">{a.message}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------- Página */
function Detail({ id, user }: { id: number; user: User }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [job, setJob] = useState<Job | null>(null);
  const [missing, setMissing] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJob(null);
    api<Job>(`/jobs/${id}`).then(setJob).catch((e) => setMissing(msg(e)));
  }, [id]);

  if (missing) {
    return (
      <div className="rounded-card border border-line bg-card p-10 text-center">
        <p className="text-ink-muted">{missing}</p>
        <Link href="/empleo" className="mt-4 inline-flex min-h-11 items-center font-semibold text-brand-700">
          Ver otras ofertas
        </Link>
      </div>
    );
  }
  if (!job) return <div className="h-80 animate-pulse rounded-card bg-card" />;

  const pay = formatPay(job.pay, job.pay_period);
  const closed = job.status === "cerrada";
  const isStudent = user.role === "student";

  const act = async (fn: () => Promise<Job | void>) => {
    setError(null);
    try {
      const j = await fn();
      if (j) setJob(j);
    } catch (e) {
      setError(msg(e));
    }
  };
  const withdraw = async () => {
    const ok = await confirm({
      title: "¿Retirar tu candidatura?",
      text: "La empresa dejará de ver tu inscripción. Podrás volver a inscribirte mientras la oferta siga abierta.",
      action: "Retirar candidatura",
    });
    if (ok) act(() => api<Job>(`/jobs/${job.id}/apply`, { method: "DELETE" }));
  };
  const toggleStatus = () => act(() => api<Job>(`/jobs/${job.id}/status`, { method: "PATCH", body: { status: closed ? "abierta" : "cerrada" } }));
  const remove = async () => {
    const ok = await confirm({
      title: "¿Eliminar la oferta?",
      text: "Se borrarán también todas las candidaturas. No se puede deshacer.",
      action: "Eliminar oferta",
    });
    if (!ok) return;
    act(async () => {
      await api(`/jobs/${job.id}`, { method: "DELETE" });
      router.push("/empleo/mias");
    });
  };

  const details = [
    { icon: Briefcase, label: "Tipo de contrato", value: JOB_TYPES[job.type] ?? job.type },
    { icon: Clock, label: "Jornada", value: job.schedule ? SCHEDULES[job.schedule] : null },
    { icon: MapPin, label: "Modalidad", value: job.modality ? MODALITIES[job.modality] : null },
    { icon: Users, label: "Vacantes", value: String(job.vacancies) },
    { icon: GraduationCap, label: "Estudios recomendados", value: job.degree?.name ?? null },
    { icon: CalendarClock, label: "Inscripciones hasta", value: job.deadline ? formatDate(job.deadline) : null },
  ].filter((d) => d.value);

  return (
    <div className="space-y-4">
      {dialog}
      <Link href="/empleo" onClick={(e) => { if (window.history.length > 1) { e.preventDefault(); router.back(); } }} className="inline-flex min-h-11 items-center gap-2 font-semibold text-ink-muted hover:text-ink">
        <ArrowLeft className="h-5 w-5" aria-hidden />
        Volver a las ofertas
      </Link>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          {/* Cabecera */}
          <section className="rounded-card border border-line bg-card p-5 sm:p-6">
            <div className="flex gap-4">
              <Avatar name={job.company.name} src={job.company.logo_url ? mediaUrl(job.company.logo_url) : null} size="lg" square />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  {isNew(job.created_at) && !closed && <Chip className="bg-accent-50 text-accent-800">Nueva</Chip>}
                  {job.matches_studies && <Chip className="bg-brand-50 text-brand-700">Para tus estudios</Chip>}
                  {closed && <Chip>Oferta cerrada</Chip>}
                </div>
                <h1 className="mt-1 text-balance text-[28px] font-bold leading-tight">{job.title}</h1>
                <Link href={`/perfil/${job.company.id}`} className="mt-1 inline-flex items-center gap-1 text-[17px] text-brand-700 hover:underline">
                  {job.company.name}
                  {job.company.verified && <BadgeCheck className="h-4 w-4" aria-label="Empresa verificada" />}
                </Link>
                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" aria-hidden /> {formatPlace(job)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" aria-hidden /> Publicada {timeAgo(job.created_at)}
                  </span>
                  {job.applicants > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-4 w-4" aria-hidden /> {job.applicants} {job.applicants === 1 ? "inscrito" : "inscritos"}
                    </span>
                  )}
                </p>
                {/* Tipo de contrato y jornada ya están en «Detalles»: aquí solo el sueldo, en grande, como en el resguardo de la lista */}
                <p className="mt-4">
                  {pay ? (
                    <span className="font-display text-[30px] font-extrabold leading-none tracking-tight text-empleo-ink">{pay}</span>
                  ) : (
                    <span className="text-[15px] text-ink-subtle">Salario no indicado</span>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-5">
              {isStudent && !job.my_status && (
                <Button onClick={() => setApplying(true)} disabled={closed}>
                  {closed ? "Ya no admite inscripciones" : "Inscribirme en esta oferta"}
                </Button>
              )}
              {isStudent && job.my_status && (
                <span className="inline-flex min-h-11 items-center gap-2 rounded-btn bg-green-50 px-5 font-semibold text-success">
                  <Check className="h-4 w-4" aria-hidden /> Ya estás inscrito
                </span>
              )}
              {job.is_mine && (
                <>
                  <Link
                    href={`/empleo/publicar?editar=${job.id}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-btn border border-line px-5 font-semibold hover:border-ink-subtle"
                  >
                    <Pencil className="h-4 w-4" aria-hidden /> Editar
                  </Link>
                  <Button variant="secondary" onClick={toggleStatus}>
                    {closed ? "Reabrir oferta" : "Cerrar oferta"}
                  </Button>
                  <button type="button" onClick={remove} className="inline-flex min-h-11 items-center gap-2 rounded-btn px-4 font-semibold text-danger hover:bg-red-50">
                    <Trash2 className="h-4 w-4" aria-hidden /> Eliminar
                  </button>
                </>
              )}
              {!isStudent && !job.is_mine && <p className="text-sm text-ink-muted">Solo las cuentas de estudiante pueden inscribirse.</p>}
            </div>
            {error && (
              <div className="mt-3">
                <ErrorBanner message={error} />
              </div>
            )}
          </section>

          {isStudent && job.my_status && <Tracker job={job} onWithdraw={withdraw} />}
          {job.is_mine && <Applicants jobId={job.id} />}

          <section className="rounded-card border border-line bg-card p-5 sm:p-6">
            <h2 className="text-lg font-bold">Descripción de la oferta</h2>
            <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed">{job.description}</p>
            {job.requirements && (
              <>
                <h2 className="mt-6 text-lg font-bold">Requisitos</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px]">
                  {job.requirements
                    // Algunas ofertas antiguas guardaron el salto de línea como el texto «\n»
                    .split(/\r?\n|\\n/)
                    .map((r) => r.trim())
                    .filter(Boolean)
                    .map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                </ul>
              </>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-card border border-line bg-card p-5">
            <h2 className="text-lg font-bold">Detalles</h2>
            <dl className="mt-3 space-y-3">
              {details.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" aria-hidden />
                  <div>
                    <dt className="text-[13px] text-ink-muted">{label}</dt>
                    <dd className="text-[15px] font-semibold">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-card border border-line bg-card p-5">
            <h2 className="text-lg font-bold">Sobre la empresa</h2>
            <Link href={`/perfil/${job.company.id}`} className="mt-3 flex items-center gap-3">
              <Avatar name={job.company.name} src={job.company.logo_url ? mediaUrl(job.company.logo_url) : null} square />
              <span className="min-w-0">
                <span className="block truncate font-semibold hover:underline">{job.company.name}</span>
                {(job.company.sector || job.company.location) && (
                  <span className="block truncate text-sm text-ink-muted">
                    {[job.company.sector, job.company.location].filter(Boolean).join(" · ")}
                  </span>
                )}
              </span>
            </Link>
            {job.company.website && (
              <a href={job.company.website} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-700 hover:underline">
                <Globe className="h-4 w-4" aria-hidden /> Web de la empresa
              </a>
            )}
          </section>
        </aside>
      </div>

      {applying && (
        <ApplyDialog
          job={job}
          onClose={() => setApplying(false)}
          onDone={(j) => {
            setJob(j);
            setApplying(false);
          }}
        />
      )}
    </div>
  );
}

export default function OfertaPage() {
  const { id } = useParams<{ id: string }>();
  return <AppShell wide section="empleo">{(user) => <Detail id={Number(id)} user={user} />}</AppShell>;
}
