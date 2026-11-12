"use client";

import { Briefcase, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { EmpleoTabs } from "@/components/jobs/EmpleoTabs";
import { JobCard, JobCardSkeleton } from "@/components/jobs/JobCard";
import { api, type User } from "@/lib/api";
import { APPLICATION_STATUS, type ApplicationStatus, type JobCard as JobCardType, type MyApplication } from "@/lib/jobs";
import { timeAgo } from "@/lib/time";

function Empty({ title, text, href, cta }: { title: string; text: string; href: string; cta: string }) {
  return (
    <div className="rounded-card border border-line bg-card p-10 text-center">
      <Briefcase className="mx-auto h-8 w-8 text-ink-subtle" aria-hidden />
      <h2 className="mt-3 text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-ink-muted">{text}</p>
      <Link href={href} className="mt-4 inline-flex min-h-11 items-center rounded-full bg-brand-600 px-6 font-semibold text-on-brand hover:bg-brand-hover">
        {cta}
      </Link>
    </div>
  );
}

/** Estudiante: sus candidaturas, agrupadas por estado. */
function MyApplications() {
  const [items, setItems] = useState<MyApplication[] | null>(null);
  const [filter, setFilter] = useState<"todas" | ApplicationStatus>("todas");

  useEffect(() => {
    api<MyApplication[]>("/jobs/applications/mine").then(setItems).catch(() => setItems([]));
  }, []);

  if (items === null) return <>{[0, 1].map((i) => <JobCardSkeleton key={i} />)}</>;
  if (items.length === 0)
    return <Empty title="Aún no te has inscrito en ninguna oferta" text="Cuando te inscribas, aquí podrás seguir en qué punto está cada candidatura." href="/empleo" cta="Buscar ofertas" />;

  const counts = items.reduce<Record<string, number>>((acc, a) => ({ ...acc, [a.status]: (acc[a.status] ?? 0) + 1 }), {});
  const shown = filter === "todas" ? items : items.filter((a) => a.status === filter);

  return (
    <>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
        {(["todas", "enviada", "vista", "en_proceso", "aceptada", "rechazada"] as const)
          .filter((s) => s === "todas" || counts[s])
          .map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={filter === s}
              onClick={() => setFilter(s)}
              className={`min-h-10 rounded-full border px-4 text-sm font-semibold ${
                filter === s ? "border-brand-600 bg-brand-50 text-brand-700" : "border-line bg-card hover:border-ink-subtle"
              }`}
            >
              {s === "todas" ? `Todas (${items.length})` : `${APPLICATION_STATUS[s].label} (${counts[s]})`}
            </button>
          ))}
      </div>
      {shown.map((a) => (
        <div key={a.id}>
          <JobCard job={{ ...a.job, my_status: a.status }} />
          <p className="px-2 pt-1.5 text-[13px] text-ink-muted">
            Te inscribiste {timeAgo(a.created_at)}
            {a.updated_at !== a.created_at && ` · Última novedad ${timeAgo(a.updated_at)}`}
          </p>
        </div>
      ))}
    </>
  );
}

/** Empresa: sus ofertas, con cuántos candidatos tiene cada una. */
function MyJobs() {
  const [items, setItems] = useState<JobCardType[] | null>(null);

  useEffect(() => {
    api<JobCardType[]>("/jobs/mine").then(setItems).catch(() => setItems([]));
  }, []);

  if (items === null) return <>{[0, 1].map((i) => <JobCardSkeleton key={i} />)}</>;
  if (items.length === 0)
    return <Empty title="Todavía no has publicado ofertas" text="Publica un trabajo puntual o unas prácticas y los estudiantes podrán inscribirse." href="/empleo/publicar" cta="Publicar oferta" />;

  const open = items.filter((j) => j.status === "abierta").length;
  return (
    <>
      <p className="text-ink-muted">
        {open} {open === 1 ? "oferta abierta" : "ofertas abiertas"} de {items.length}
      </p>
      {items.map((j) => (
        <div key={j.id} className="relative">
          <JobCard job={j} showStatus={false} />
          <Link
            href={`/empleo/${j.id}#candidatos`}
            className="relative z-10 -mt-2 ml-auto mr-4 flex w-fit items-center gap-1.5 rounded-b-xl border border-t-0 border-line bg-card px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-page"
          >
            <Users className="h-4 w-4" aria-hidden />
            {j.applicants === 0 ? "Sin candidatos" : `Ver ${j.applicants} ${j.applicants === 1 ? "candidato" : "candidatos"}`}
          </Link>
        </div>
      ))}
    </>
  );
}

function Mias({ user }: { user: User }) {
  const company = user.role === "company";
  return (
    <div className="space-y-4">
      <EmpleoTabs user={user} />
      <h1 className="text-xl font-semibold">{company ? "Mis ofertas" : "Mis candidaturas"}</h1>
      <div className="space-y-3">{company ? <MyJobs /> : <MyApplications />}</div>
    </div>
  );
}

export default function MiasPage() {
  return <AppShell wide>{(user) => <Mias user={user} />}</AppShell>;
}
