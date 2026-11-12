"use client";

import { ChevronLeft, ChevronRight, RotateCcw, SearchX, SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { EmpleoTabs } from "@/components/jobs/EmpleoTabs";
import { activeFilters, JobFilters, type Filters } from "@/components/jobs/JobFilters";
import { JobCard, JobCardSkeleton } from "@/components/jobs/JobCard";
import { JobSearchBar } from "@/components/jobs/JobSearchBar";
import { api, type User } from "@/lib/api";
import { ABROAD, ALL_SPAIN, SORTS, type JobList } from "@/lib/jobs";

/* La búsqueda vive en la URL (/empleo?q=camarero&provincia=Granada&tipo=puntual…)
   para poder compartirla y para que funcione el botón "atrás" del navegador. */
const URL_KEYS = { type: "tipo", modality: "modalidad", schedule: "jornada", category: "categoria" } as const;

function readParams(params: URLSearchParams) {
  const filters: Filters = {
    type: params.getAll(URL_KEYS.type),
    modality: params.getAll(URL_KEYS.modality),
    schedule: params.getAll(URL_KEYS.schedule),
    category: params.getAll(URL_KEYS.category),
    posted: params.get("fecha") ?? "",
    for_me: params.get("para_mi") === "1",
  };
  return {
    q: params.get("q") ?? "",
    province: params.get("provincia") ?? ALL_SPAIN,
    filters,
    sort: params.get("orden") ?? "relevance",
    page: Math.max(1, Number(params.get("pagina")) || 1),
  };
}

type State = ReturnType<typeof readParams>;

function toUrl(s: State): string {
  const p = new URLSearchParams();
  if (s.q) p.set("q", s.q);
  if (s.province && s.province !== ALL_SPAIN) p.set("provincia", s.province);
  (Object.keys(URL_KEYS) as (keyof typeof URL_KEYS)[]).forEach((k) => s.filters[k].forEach((v) => p.append(URL_KEYS[k], v)));
  if (s.filters.posted) p.set("fecha", s.filters.posted);
  if (s.filters.for_me) p.set("para_mi", "1");
  if (s.sort !== "relevance") p.set("orden", s.sort);
  if (s.page > 1) p.set("pagina", String(s.page));
  const qs = p.toString();
  return qs ? `/empleo?${qs}` : "/empleo";
}

function toApi(s: State): string {
  const p = new URLSearchParams();
  if (s.q) p.set("q", s.q);
  if (s.province !== ALL_SPAIN) p.set("province", s.province);
  (Object.keys(URL_KEYS) as (keyof typeof URL_KEYS)[]).forEach((k) => s.filters[k].forEach((v) => p.append(k, v)));
  if (s.filters.posted) p.set("posted", s.filters.posted);
  if (s.filters.for_me) p.set("for_me", "true");
  p.set("sort", s.sort);
  p.set("page", String(s.page));
  return `/jobs?${p}`;
}

function Heading({ total, q, province, category }: { total: number; q: string; province: string; category: string | null }) {
  const where = province === ALL_SPAIN ? "en toda España" : province === ABROAD ? "en el extranjero" : `en ${province}`;
  return (
    <h1 className="text-xl font-semibold">
      {total} {total === 1 ? "oferta" : "ofertas"} de trabajo
      {q && <> de «{q}»</>}
      {category && <> de {category}</>} <span className="font-normal text-ink-muted">{where}</span>
    </h1>
  );
}

function Search({ user }: { user: User }) {
  const params = useSearchParams();
  const router = useRouter();
  const state = readParams(params);
  const key = params.toString();
  const [data, setData] = useState<JobList | null>(null);
  const [error, setError] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(() => {
    setError(false);
    setData(null);
    api<JobList>(toApi(readParams(new URLSearchParams(key))))
      .then(setData)
      .catch(() => setError(true));
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  const go = (next: Partial<State>) => {
    // Cualquier cambio de búsqueda o filtros vuelve a la página 1
    router.push(toUrl({ ...state, page: 1, ...next }), { scroll: false });
  };

  const nFilters = activeFilters(state.filters);
  const filters = (
    <JobFilters filters={state.filters} facets={data?.facets ?? {}} onChange={(f) => go({ filters: f })} isStudent={user.role === "student"} />
  );

  return (
    <div className="space-y-4">
      <EmpleoTabs user={user} />
      <JobSearchBar
        q={state.q}
        province={state.province}
        category={state.filters.category.length === 1 && !state.q ? state.filters.category[0] : null}
        onSearch={(q, province, category) =>
          go({
            q,
            province,
            // Elegir una categoría en el buscador filtra por ella; escribir un puesto quita la categoría del buscador
            filters: { ...state.filters, category: category ? [category] : state.filters.category.length === 1 ? [] : state.filters.category },
          })
        }
      />

      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">{filters}</aside>

        <section className="min-w-0 space-y-3" aria-live="polite" aria-busy={data === null && !error}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {data ? <Heading total={data.total} q={state.q} province={state.province} category={state.filters.category.length === 1 ? state.filters.category[0] : null} /> : <div className="h-7 w-64 animate-pulse rounded bg-white" />}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(true)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                Filtros{nFilters > 0 && ` (${nFilters})`}
              </button>
              <label className="flex items-center gap-2 text-sm text-ink-muted">
                <span className="hidden sm:inline">Ordenar por</span>
                <select
                  value={state.sort}
                  onChange={(e) => go({ sort: e.target.value })}
                  className="h-11 rounded-input border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-ink-subtle"
                >
                  {Object.entries(SORTS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {error && (
            <div className="rounded-card border border-line bg-white p-6 text-center">
              <p className="text-ink-muted">No hemos podido cargar las ofertas.</p>
              <button type="button" onClick={load} className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-brand-700">
                <RotateCcw className="h-4 w-4" aria-hidden /> Reintentar
              </button>
            </div>
          )}

          {data === null && !error && [0, 1, 2].map((i) => <JobCardSkeleton key={i} />)}

          {data?.items.length === 0 && (
            <div className="rounded-card border border-line bg-white p-10 text-center">
              <SearchX className="mx-auto h-8 w-8 text-ink-subtle" aria-hidden />
              <h2 className="mt-3 text-lg font-semibold">No hay ofertas con esta búsqueda</h2>
              <p className="mt-1 text-ink-muted">Prueba con otras palabras, otra provincia o quita algún filtro.</p>
              {(nFilters > 0 || state.q || state.province !== ALL_SPAIN) && (
                <button
                  type="button"
                  onClick={() => router.push("/empleo")}
                  className="mt-4 inline-flex min-h-11 items-center rounded-full border border-line px-5 font-semibold hover:border-ink-subtle"
                >
                  Ver todas las ofertas
                </button>
              )}
            </div>
          )}

          {data?.items.map((job) => <JobCard key={job.id} job={job} />)}

          {data && data.pages > 1 && (
            <nav aria-label="Páginas" className="flex items-center justify-center gap-1 pt-2">
              <button
                type="button"
                disabled={state.page <= 1}
                onClick={() => go({ page: state.page - 1 })}
                aria-label="Página anterior"
                className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white disabled:opacity-40"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => go({ page: n })}
                  aria-current={n === state.page ? "page" : undefined}
                  className={`h-11 min-w-11 rounded-full px-2 font-semibold ${n === state.page ? "bg-brand-50 text-brand-700" : "hover:bg-white"}`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                disabled={state.page >= data.pages}
                onClick={() => go({ page: state.page + 1 })}
                aria-label="Página siguiente"
                className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white disabled:opacity-40"
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </nav>
          )}
        </section>
      </div>

      {/* Filtros en móvil: panel a pantalla completa */}
      {showFilters && (
        <div role="dialog" aria-modal="true" aria-label="Filtros" className="fixed inset-0 z-40 overflow-y-auto bg-page p-4 lg:hidden">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Filtros</h2>
            <button type="button" onClick={() => setShowFilters(false)} aria-label="Cerrar filtros" className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          {filters}
          <button
            type="button"
            onClick={() => setShowFilters(false)}
            className="mt-4 h-12 w-full rounded-full bg-brand-600 font-semibold text-white"
          >
            Ver {data?.total ?? ""} ofertas
          </button>
        </div>
      )}
    </div>
  );
}

export default function Empleo() {
  return (
    <AppShell wide>
      {(user) => (
        <Suspense>
          <Search user={user} />
        </Suspense>
      )}
    </AppShell>
  );
}
