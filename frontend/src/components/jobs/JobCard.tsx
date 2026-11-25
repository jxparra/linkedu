"use client";

import { BadgeCheck, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { mediaUrl } from "@/lib/api";
import { APPLICATION_STATUS, formatPay, formatPlace, isNew, JOB_TYPES, SCHEDULES, type JobCard as Job } from "@/lib/jobs";
import { timeAgo } from "@/lib/time";
import { useTilt } from "@/lib/useTilt";

export function Chip({ children, className = "bg-page text-ink-muted" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-tag px-2.5 py-1 text-[13px] font-semibold ${className}`}>{children}</span>;
}

/**
 * Tarjeta de una oferta, como un resguardo: quién y dónde a la izquierda, de qué va en el centro
 * (resumen, tipo, jornada y categoría) y, tras una línea troquelada, el sueldo en grande. Se inclina un poco hacia el ratón.
 */
export function JobCard({ job, showStatus = true }: { job: Job; showStatus?: boolean }) {
  const pay = formatPay(job.pay, job.pay_period);
  const closed = job.status === "cerrada";
  const tilt = useTilt<HTMLElement>(3);
  const [amount, period] = payParts(job);
  const deadline = job.deadline ? new Date(job.deadline).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : null;

  return (
    <article
      {...tilt}
      className={`tilt group relative flex rounded-card border border-line bg-card hover:border-edge ${job.matches_studies && !closed ? "match-ring match-empleo" : ""}`}
    >
      <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-3 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Quién y dónde */}
        <div className="flex min-w-0 gap-4">
          <Avatar name={job.company.name} src={job.company.logo_url ? mediaUrl(job.company.logo_url) : null} size="md" square />
          <div className="min-w-0 flex-1">
            {(isNew(job.created_at) && !closed) || job.matches_studies || closed || (showStatus && job.my_status) ? (
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                {isNew(job.created_at) && !closed && <Chip className="bg-accent-50 text-accent-800">Nueva</Chip>}
                {job.matches_studies && <Chip className="bg-empleo-50 text-empleo-ink">Para tus estudios</Chip>}
                {closed && <Chip>Cerrada</Chip>}
                {showStatus && job.my_status && <Chip className={APPLICATION_STATUS[job.my_status].cls}>{APPLICATION_STATUS[job.my_status].label}</Chip>}
              </div>
            ) : null}

            <h2 className="text-[19px] font-bold leading-snug">
              {/* El enlace cubre toda la tarjeta */}
              <Link
                href={`/empleo/${job.id}`}
                className="text-ink decoration-mark decoration-[3px] underline-offset-4 after:absolute after:inset-0 after:z-10 after:rounded-card group-hover:underline"
              >
                {job.title}
              </Link>
            </h2>
            <p className="mt-0.5 flex items-center gap-1 text-[15px] text-ink">
              <span className="truncate">{job.company.name}</span>
              {job.company.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-brand-700" aria-label="Empresa verificada" />}
            </p>

            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" aria-hidden />
                {formatPlace(job)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" aria-hidden />
                Publicada {timeAgo(job.created_at)}
              </span>
              {job.applicants > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Users className="h-4 w-4" aria-hidden />
                  {job.applicants} {job.applicants === 1 ? "inscrito" : "inscritos"}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* De qué va: ocupa el hueco central en pantallas anchas; en el móvil va debajo */}
        <div className="flex min-w-0 flex-col gap-3 lg:border-l lg:border-line lg:pl-6">
          {job.summary && <p className="line-clamp-3 text-[14px] leading-relaxed text-ink-muted">{job.summary}</p>}
          <div className="mt-auto flex flex-wrap gap-2">
            <Chip>{JOB_TYPES[job.type] ?? job.type}</Chip>
            {job.schedule && <Chip>{SCHEDULES[job.schedule] ?? job.schedule}</Chip>}
            {job.category && <Chip className="bg-page text-ink-subtle">{job.category}</Chip>}
            {deadline && !closed && <Chip className="bg-red-50 text-danger">Hasta el {deadline}</Chip>}
            {/* En móvil el sueldo va como etiqueta; en pantallas grandes, en el resguardo de la derecha */}
            <span className="sm:hidden">{pay ? <Chip className="bg-empleo-50 text-empleo-ink">{pay}</Chip> : <Chip>Salario no indicado</Chip>}</span>
          </div>
        </div>
      </div>

      {/* Resguardo con el sueldo. Las muescas son medias lunas que no salen de la tarjeta, para que no se pisen con la de al lado.
          Con el reborde de «Para tus estudios», las muescas tapan su tramo recto y lo continúan por la curva (globals.css, .ticket-notch) */}
      <div className="relative hidden w-40 shrink-0 flex-col items-center justify-center border-l-2 border-dashed border-line px-3 text-center sm:flex">
        <span aria-hidden className="ticket-notch ticket-notch-top absolute -left-[10px] -top-px h-[9px] w-[18px] rounded-b-full border border-t-0 border-line bg-page" />
        <span aria-hidden className="ticket-notch ticket-notch-bottom absolute -bottom-px -left-[10px] h-[9px] w-[18px] rounded-t-full border border-b-0 border-line bg-page" />
        {amount ? (
          <>
            <span className="font-display text-[26px] font-extrabold leading-none tracking-tight text-empleo-ink">{amount}</span>
            {period && <span className="mt-1 text-[13px] text-ink-muted">{period}</span>}
          </>
        ) : (
          <span className="text-sm text-ink-subtle">Salario no indicado</span>
        )}
      </div>
    </article>
  );
}

/** Sueldo para el resguardo: la cantidad en grande y el periodo debajo. */
function payParts(job: Job): [string | null, string | null] {
  const amount = formatPay(job.pay, null);
  if (!amount) return [null, null];
  const per: Record<string, string> = { hora: "la hora", mes: "al mes", total: "en total" };
  return [amount, job.pay_period ? (per[job.pay_period] ?? null) : null];
}

export function JobCardSkeleton() {
  return <div className="h-40 animate-pulse rounded-card border border-line bg-card" />;
}
