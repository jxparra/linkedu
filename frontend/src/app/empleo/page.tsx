"use client";

import { Select } from "@/components/Select";
import { Check, ChevronLeft, Loader2, ChevronRight, RotateCcw, SearchX, SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AppShell } from "@/components/app/AppShell";
import { EmpleoTabs } from "@/components/jobs/EmpleoTabs";
import { activeFilters, JobFilters, type Filters } from "@/components/jobs/JobFilters";
import { JobCard, JobCardSkeleton } from "@/components/jobs/JobCard";
import { JobSearchBar } from "@/components/jobs/JobSearchBar";
import { api, type User } from "@/lib/api";
import { ABROAD, ALL_SPAIN, SORTS, type JobList } from "@/lib/jobs";
import { SectionHero } from "@/components/SectionHero";

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
    <h2 className="text-xl font-bold">
      <span className="count-in">{total}</span> {total === 1 ? "oferta" : "ofertas"} de trabajo
      {q && <> de «{q}»</>}
      {category && <> de {category}</>} <span className="font-normal text-ink-muted">{where}</span>
    </h2>
  );
}

function Search({ user }: { user: User }) {
  const params = useSearchParams();
  const router = useRouter();
  const state = readParams(params);
  const key = params.toString();
  const [data, setData] = useState<JobList | null>(null);
  const [error, setError] = useState(false);
  // Mientras llega una búsqueda nueva se quedan los resultados anteriores, atenuados (no parpadea la lista)
  const [pending, setPending] = useState(false);
  // Cambia con cada respuesta: vuelve a lanzar la entrada escalonada de las tarjetas
  const [generation, setGeneration] = useState(0);
  const results = useRef<HTMLElement>(null);
  const scrollToResults = useRef(false);
  // Panel de filtros: entra desde la derecha y, al cerrarse, sale antes de quitarse de la página
  const [showFilters, setShowFilters] = useState(false);
  const [closingFilters, setClosingFilters] = useState(false);
  const filtersButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const finishClose = useCallback(() => {
    setShowFilters(false);
    setClosingFilters(false);
    filtersButton.current?.focus(); // el foco vuelve a «Más filtros»
  }, []);
  const closeFilters = useCallback(() => setClosingFilters(true), []);
  useEffect(() => {
    if (!showFilters) return;
    if (!closingFilters) closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setClosingFilters(true);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showFilters, closingFilters]);
  // Por si el navegador no lanza el final de la animación (pestaña en segundo plano), se cierra igualmente
  useEffect(() => {
    if (!closingFilters) return;
    const t = setTimeout(finishClose, 400);
    return () => clearTimeout(t);
  }, [closingFilters, finishClose]);

  const load = useCallback(() => {
    let cancelled = false;
    setError(false);
    setPending(true);
    api<JobList>(toApi(readParams(new URLSearchParams(key))))
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setGeneration((g) => g + 1);
        // Tras buscar desde la cabecera, la página baja con suavidad hasta los resultados
        if (scrollToResults.current && results.current && results.current.getBoundingClientRect().top > window.innerHeight * 0.6) {
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          results.current.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        }
        scrollToResults.current = false;
      })
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setPending(false));
    return () => {
      cancelled = true;
    };
  }, [key]);

  useEffect(() => load(), [load]);

  const go = (next: Partial<State>) => {
    // Cualquier cambio de búsqueda o filtros vuelve a la página 1
    const url = toUrl({ ...state, page: 1, ...next });
    if (url === toUrl(state)) return;
    // La señal de «buscando» sale al instante, sin esperar a que cambie la URL
    setPending(true);
    router.push(url, { scroll: false });
  };

  const nFilters = activeFilters(state.filters);
  const f = state.filters;
  // Las cinco opciones que más se usan, siempre a la vista; el resto, en «Más filtros»
  const toggle = (key: "type" | "modality" | "schedule", value: string) =>
    go({ filters: { ...f, [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value] } });
  const quick: { label: string; on: boolean; onClick: () => void }[] = [
    ...(user.role === "student" ? [{ label: "Para mis estudios", on: f.for_me, onClick: () => go({ filters: { ...f, for_me: !f.for_me } }) }] : []),
    { label: "Prácticas", on: f.type.includes("practicas"), onClick: () => toggle("type", "practicas") },
    { label: "Trabajo puntual", on: f.type.includes("puntual"), onClick: () => toggle("type", "puntual") },
    { label: "En remoto", on: f.modality.includes("remoto"), onClick: () => toggle("modality", "remoto") },
    { label: "Media jornada", on: f.schedule.includes("parcial"), onClick: () => toggle("schedule", "parcial") },
  ];
  const quickOn = quick.filter((q) => q.on).length;
  const moreOn = nFilters - quickOn;
  const filters = (
    <JobFilters filters={state.filters} facets={data?.facets ?? {}} onChange={(f) => go({ filters: f })} isStudent={user.role === "student"} />
  );

  return (
    <div className="space-y-6">
      <SectionHero
        kind="empleo"
        title="Empleo"
        subtitle="Encargos, prácticas y trabajos que caben entre clase y clase."
        fullScene
        bleed
        aside={<EmpleoTabs user={user} onDark />}
      >
        <JobSearchBar
          busy={pending && data !== null}
          q={state.q}
          province={state.province}
          category={state.filters.category.length === 1 && !state.q ? state.filters.category[0] : null}
          onSearch={(q, province, category) => {
            scrollToResults.current = true;
            go({
              q,
              province,
              // Elegir una categoría en el buscador filtra por ella; escribir un puesto quita la categoría del buscador
              filters: { ...state.filters, category: category ? [category] : state.filters.category.length === 1 ? [] : state.filters.category },
            });
          }}
        />
      </SectionHero>

      {/* Filtros rápidos en fichas: se ven de un vistazo y no ocupan una columna entera */}
      <div
        className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        role="group"
        aria-label="Filtros rápidos"
      >
        {quick.map((q) => (
          <button
            key={q.label}
            type="button"
            aria-pressed={q.on}
            onClick={q.onClick}
            className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-btn border px-3.5 text-[15px] font-semibold transition-colors ${
              q.on ? "border-transparent bg-empleo-50 text-empleo-ink" : "border-line bg-card text-ink hover:border-edge"
            }`}
          >
            {q.on && <Check className="h-4 w-4" aria-hidden />}
            {q.label}
          </button>
        ))}
        <button
          type="button"
          ref={filtersButton}
          onClick={() => setShowFilters(true)}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-btn px-3.5 text-[15px] font-semibold text-ink-muted hover:bg-field-hover hover:text-ink"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Más filtros{moreOn > 0 && ` (${moreOn})`}
        </button>
      </div>

      <div>
        <section ref={results} className="min-w-0 scroll-mt-[88px] space-y-3" aria-live="polite" aria-busy={pending}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {data ? (
              pending ? (
                <h2 className="inline-flex items-center gap-2 text-xl font-bold text-ink-muted">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Buscando ofertas…
                </h2>
              ) : (
              <Heading
                key={generation}
                total={data.total}
                q={state.q}
                province={state.province}
                category={state.filters.category.length === 1 ? state.filters.category[0] : null}
              />
              )
            ) : (
              <div className="h-7 w-64 animate-pulse rounded bg-card" />
            )}
            <div className="flex items-center gap-2">
              <span id="orden-label" className="hidden text-sm text-ink-muted sm:inline">
                Ordenar por
              </span>
              <Select
                value={state.sort}
                onChange={(v) => go({ sort: v })}
                options={Object.entries(SORTS).map(([value, label]) => ({ value, label }))}
                ariaLabel="Ordenar por"
                className="w-44"
                buttonClassName="h-11 text-sm font-semibold"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-card border border-line bg-card p-6 text-center">
              <p className="text-ink-muted">No hemos podido cargar las ofertas.</p>
              <button type="button" onClick={load} className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-brand-700">
                <RotateCcw className="h-4 w-4" aria-hidden /> Reintentar
              </button>
            </div>
          )}

          {/* Barra fina mientras se busca (solo cuando ya hay resultados a la vista; la primera vez salen esqueletos) */}
          <div aria-hidden className={`search-progress ${pending && data ? "" : "invisible"}`} />

          {data === null && !error && [0, 1, 2].map((i) => <JobCardSkeleton key={i} />)}

          {data?.items.length === 0 && (
            <div className="rounded-card border border-line bg-card p-10 text-center">
              <SearchX className="mx-auto h-8 w-8 text-ink-subtle" aria-hidden />
              <h2 className="mt-3 text-lg font-bold">No hay ofertas con esta búsqueda</h2>
              <p className="mt-1 text-ink-muted">Prueba con otras palabras, otra provincia o quita algún filtro.</p>
              {(nFilters > 0 || state.q || state.province !== ALL_SPAIN) && (
                <button
                  type="button"
                  onClick={() => router.push("/empleo")}
                  className="mt-4 inline-flex min-h-11 items-center rounded-btn border border-line px-5 font-semibold hover:border-ink-subtle"
                >
                  Ver todas las ofertas
                </button>
              )}
            </div>
          )}

          {data && data.items.length > 0 && (
            <div key={generation} className={`results-in space-y-3 ${pending ? "results-pending" : "results-ready"}`}>
              {data.items.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          {data && data.pages > 1 && (
            <nav aria-label="Páginas" className="flex items-center justify-center gap-1 pt-2">
              <button
                type="button"
                disabled={state.page <= 1}
                onClick={() => go({ page: state.page - 1 })}
                aria-label="Página anterior"
                className="flex h-11 w-11 items-center justify-center rounded-btn hover:bg-card disabled:opacity-40"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => go({ page: n })}
                  aria-current={n === state.page ? "page" : undefined}
                  className={`h-11 min-w-11 rounded-btn px-2 font-semibold ${n === state.page ? "nav-mark" : "hover:bg-card"}`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                disabled={state.page >= data.pages}
                onClick={() => go({ page: state.page + 1 })}
                aria-label="Página siguiente"
                className="flex h-11 w-11 items-center justify-center rounded-btn hover:bg-card disabled:opacity-40"
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </nav>
          )}
        </section>
      </div>

      {/* Todos los filtros: panel a pantalla completa en el móvil y lateral en pantallas grandes */}
      {/* Panel y oscurecido van directamente en <body>: así ocupan siempre la pantalla entera, sea cual sea el contenedor */}
      {showFilters &&
        createPortal(
          <div data-section="empleo">{/* mismo tono que la página de Empleo */}
            <div
              aria-hidden
              className={`fixed inset-0 z-40 hidden bg-black/40 lg:block ${closingFilters ? "scrim-out" : "scrim-in"}`}
              onClick={closeFilters}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Filtros"
              onAnimationEnd={(e) => closingFilters && e.target === e.currentTarget && finishClose()}
              className={`fixed inset-0 z-50 overflow-y-auto bg-page p-4 lg:inset-y-0 lg:left-auto lg:w-[400px] lg:border-l lg:border-line lg:shadow-2xl ${
                closingFilters ? "drawer-out" : "drawer-in"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-bold">Filtros</h2>
                <button
                  ref={closeButton}
                  type="button"
                  onClick={closeFilters}
                  aria-label="Cerrar filtros"
                  className="flex h-11 w-11 items-center justify-center rounded-btn bg-card hover:bg-field-hover"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              {filters}
              <button type="button" onClick={closeFilters} className="mt-4 h-12 w-full rounded-btn bg-brand-600 font-semibold text-on-brand">
                Ver {data?.total ?? ""} ofertas
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default function Empleo() {
  return (
    <AppShell wide section="empleo">
      {(user) => (
        <Suspense>
          <Search user={user} />
        </Suspense>
      )}
    </AppShell>
  );
}
