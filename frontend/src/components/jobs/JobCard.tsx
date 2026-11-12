import { BadgeCheck, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { mediaUrl } from "@/lib/api";
import { APPLICATION_STATUS, formatPay, formatPlace, isNew, JOB_TYPES, SCHEDULES, type JobCard as Job } from "@/lib/jobs";
import { timeAgo } from "@/lib/time";

export function Chip({ children, className = "bg-page text-ink-muted" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[13px] font-semibold ${className}`}>{children}</span>;
}

/** Tarjeta de una oferta en la lista de resultados (como las de InfoJobs). */
export function JobCard({ job, showStatus = true }: { job: Job; showStatus?: boolean }) {
  const pay = formatPay(job.pay, job.pay_period);
  const closed = job.status === "cerrada";

  return (
    <article className="relative rounded-card border border-line bg-card p-4 transition-colors hover:border-ink-subtle sm:p-5">
      <div className="flex gap-4">
        <Avatar name={job.company.name} src={job.company.logo_url ? mediaUrl(job.company.logo_url) : null} size="md" square />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {isNew(job.created_at) && !closed && <Chip className="bg-accent-50 text-accent-800">Nueva</Chip>}
            {job.matches_studies && <Chip className="bg-brand-50 text-brand-700">Para tus estudios</Chip>}
            {closed && <Chip>Cerrada</Chip>}
            {showStatus && job.my_status && <Chip className={APPLICATION_STATUS[job.my_status].cls}>{APPLICATION_STATUS[job.my_status].label}</Chip>}
          </div>

          <h2 className="mt-1 text-lg font-semibold leading-snug">
            {/* El enlace cubre toda la tarjeta */}
            <Link href={`/empleo/${job.id}`} className="text-brand-700 after:absolute after:inset-0 after:rounded-card hover:underline">
              {job.title}
            </Link>
          </h2>
          <p className="mt-0.5 flex items-center gap-1 text-[15px] text-ink">
            {job.company.name}
            {job.company.verified && <BadgeCheck className="h-4 w-4 text-brand-700" aria-label="Empresa verificada" />}
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

          <div className="mt-3 flex flex-wrap gap-2">
            <Chip>{JOB_TYPES[job.type] ?? job.type}</Chip>
            {job.schedule && <Chip>{SCHEDULES[job.schedule] ?? job.schedule}</Chip>}
            {pay ? <Chip className="bg-page text-ink">{pay}</Chip> : <Chip>Salario no indicado</Chip>}
          </div>
        </div>
      </div>
    </article>
  );
}

export function JobCardSkeleton() {
  return <div className="h-40 animate-pulse rounded-card border border-line bg-card" />;
}
