"use client";

import { Briefcase, MessagesSquare, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type ForumsList, type GroupSuggestions, type User } from "@/lib/api";
import type { JobList } from "@/lib/jobs";

type Tile = { href: string; icon: LucideIcon; n: number | null; label: string; tone: string };

/**
 * Franja «Hoy» de Inicio: un saludo y tres accesos directos con su cifra, cada uno en el color suave de su sección.
 * Es el único bloque con color de la pantalla: responde a «¿qué hago ahora?» antes de empezar a leer el feed.
 */
export function TodayBand({ user }: { user: User }) {
  const company = user.role === "company";
  const first = company ? (user.company?.name ?? "") : (user.student_profile?.name ?? user.username ?? "");
  const [jobs, setJobs] = useState<number | null>(null);
  const [forums, setForums] = useState<number | null>(null);
  const [groups, setGroups] = useState<number | null>(null);

  useEffect(() => {
    if (!company)
      api<JobList>("/jobs?for_me=true&page=1")
        .then((d) => setJobs(d.total))
        .catch(() => setJobs(0));
    api<ForumsList>("/groups/forums")
      .then((d) => setForums(d.mine.length))
      .catch(() => setForums(0));
    api<GroupSuggestions>("/groups/suggestions")
      .then((d) => setGroups(d.for_you.length))
      .catch(() => setGroups(0));
  }, [company]);

  const tiles: Tile[] = [
    company
      ? { href: "/empleo/mias", icon: Briefcase, n: null, label: "Tus ofertas y candidatos", tone: "bg-empleo-50 text-empleo-ink" }
      : user.role === "teacher"
        ? // Docente: las ofertas de los estudios en los que da clase, para pasárselas a su alumnado
          { href: "/empleo?para_mi=1", icon: Briefcase, n: jobs, label: jobs === 1 ? "oferta para tu alumnado" : "ofertas para tu alumnado", tone: "bg-empleo-50 text-empleo-ink" }
        : { href: "/empleo?para_mi=1", icon: Briefcase, n: jobs, label: jobs === 1 ? "oferta para tus estudios" : "ofertas para tus estudios", tone: "bg-empleo-50 text-empleo-ink" },
    { href: "/social/foros", icon: MessagesSquare, n: forums, label: forums === 1 ? "foro tuyo con actividad" : "foros tuyos con actividad", tone: "bg-foros-50 text-foros-ink" },
    { href: "/social", icon: Users, n: groups, label: groups === 1 ? "grupo que encaja contigo" : "grupos que encajan contigo", tone: "bg-social-50 text-social-ink" },
  ];

  const date = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  const today = date.charAt(0).toUpperCase() + date.slice(1); // «Jueves, 19 de noviembre»

  return (
    <section aria-labelledby="hoy-title" className="mb-6">
      <p className="text-sm font-medium text-ink-muted">{today}</p>
      <h1 id="hoy-title" className="mt-0.5 text-[30px] font-extrabold leading-tight tracking-[-0.025em]">
        Hola{first ? `, ${first.split(" ")[0]}` : ""}
      </h1>
      <ul className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        {tiles.map(({ href, icon: Icon, n, label, tone }) => (
          <li key={href}>
            <Link
              href={href}
              className={`group flex h-full min-h-[88px] flex-col items-start gap-2 rounded-card p-3 transition-transform duration-150 ease-[var(--ease-enter)] hover:-translate-y-0.5 sm:flex-row sm:gap-3 sm:p-4 ${tone}`}
            >
              <Icon className="h-5 w-5 shrink-0 sm:mt-1" aria-hidden />
              <span className="min-w-0">
                {n !== null && <span className="block font-display text-[28px] font-extrabold leading-none tracking-tight tabular-nums">{n}</span>}
                <span className={`block text-[12px] font-semibold leading-snug sm:text-[14px] ${n !== null ? "mt-1" : ""}`}>{label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
