"use client";

import { Info, PenSquare, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { displayName } from "@/components/app/TopBar";
import { Avatar } from "@/components/Avatar";
import { api, mediaUrl, type Metric, type Performance, type PostStats, type Profile, type User } from "@/lib/api";
import { useLang, useT } from "@/lib/i18n";

type Tab = "rendimiento" | "contenido";
const DAYS = [7, 28, 90];

/* ---------------------------------------------------------------- Columna izquierda */
function Sidebar({ user }: { user: User | null }) {
  const t = useT();
  const params = useSearchParams();
  const tab = (params.get("vista") as Tab) ?? "rendimiento";
  const [profile, setProfile] = useState<Profile | null>(null);
  const name = displayName(user);

  useEffect(() => {
    if (user) api<Profile>(`/users/${user.id}`).then(setProfile).catch(() => {});
  }, [user]);

  const item = (key: Tab, label: string) => (
    <Link
      href={key === "rendimiento" ? "/estadisticas" : `/estadisticas?vista=${key}`}
      aria-current={tab === key ? "page" : undefined}
      className={`flex min-h-12 items-center border-l-[3px] px-4 text-[17px] font-semibold transition-colors ${
        tab === key ? "border-ink text-ink" : "border-transparent text-ink-muted hover:bg-page hover:text-ink"
      }`}
    >
      {t(label)}
    </Link>
  );

  return (
    <div className="space-y-3">
      <section className="overflow-hidden rounded-card border border-line bg-card">
        <div className="h-16 bg-gradient-to-br from-banner-from to-banner-to" />
        <div className="px-4 pb-4">
          <span className={`-mt-9 block w-fit border-4 border-card bg-card ${user?.role === "company" ? "rounded-[14px]" : "rounded-full"}`}>
            <Avatar name={name || "?"} src={profile?.user.avatar_url ? mediaUrl(profile.user.avatar_url) : null} size="lg" square={user?.role === "company"} />
          </span>
          <Link href="/perfil" className="mt-2 block truncate text-lg font-semibold hover:underline">
            {name}
          </Link>
          {profile?.user.headline && <p className="line-clamp-2 text-[13px] text-ink-muted">{profile.user.headline}</p>}
        </div>
      </section>
      <nav aria-label={t("Estadísticas")} className="rounded-card border border-line bg-card py-3">
        {item("rendimiento", "Rendimiento")}
        {item("contenido", "Contenido")}
        <div className="px-4 pt-4">
          <Link
            href="/inicio"
            className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand-600 px-4 font-semibold text-on-brand transition-colors hover:bg-brand-hover"
          >
            <PenSquare className="h-4 w-4" aria-hidden />
            {t("Crear publicación")}
          </Link>
        </div>
      </nav>
    </div>
  );
}

/* ---------------------------------------------------------------- Rendimiento */
function Change({ pct }: { pct: number | null }) {
  const t = useT();
  if (pct === null) return <span className="text-[13px] font-semibold text-success">▲ {t("nuevo")}</span>;
  if (pct > 0) return <span className="text-[13px] font-semibold text-success">▲ {pct.toLocaleString("es-ES")} %</span>;
  if (pct < 0) return <span className="text-[13px] font-semibold text-danger">▼ {Math.abs(pct).toLocaleString("es-ES")} %</span>;
  return (
    <span className="text-[13px] font-semibold text-ink-muted">
      <span aria-hidden>● </span>0 %
    </span>
  );
}

function Row({ label, sub, value, pct, help }: { label: string; sub?: string; value: number; pct?: number | null; help: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-card border border-line px-5 py-5" title={help}>
      <div>
        <p className="text-[17px]">{label}</p>
        {sub && <p className="text-[13px] text-ink-muted">{sub}</p>}
      </div>
      <div className="text-right">
        <p className="text-[36px] leading-none tabular-nums">{value.toLocaleString("es-ES")}</p>
        {pct !== undefined && <Change pct={pct} />}
      </div>
    </div>
  );
}

function Section({ title, help, children, days, onDays }: { title: string; help: string; children: React.ReactNode; days: number; onDays: (d: number) => void }) {
  const t = useT();
  return (
    <section className="rounded-card border border-line bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            {title}
            <span title={help} className="text-ink-muted">
              <Info className="h-4 w-4" aria-label={help} />
            </span>
          </h2>
          <label className="mt-0.5 block text-[13px] text-ink-muted">
            <span className="sr-only">Periodo</span>
            <select value={days} onChange={(e) => onDays(Number(e.target.value))} className="-ml-1 rounded bg-transparent px-1 py-0.5 hover:bg-page">
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {t(`Últimos ${d} días`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Rendimiento() {
  const t = useT();
  const lang = useLang();
  const [days, setDays] = useState(7);
  const [data, setData] = useState<Performance | null>(null);
  const [error, setError] = useState(false);

  const load = (d: number) => {
    setError(false);
    setData(null);
    api<Performance>(`/stats/me?days=${d}`).then(setData).catch(() => setError(true));
  };
  useEffect(() => load(days), [days]);

  const fmt = (iso: string) => new Date(iso).toLocaleDateString(lang === "en" ? "en-GB" : "es-ES", { day: "numeric", month: "short" });
  const range = (a: string, b: string) => `${fmt(a)} – ${fmt(b)}`;

  if (error) {
    return (
      <div className="rounded-card border border-line bg-card p-6 text-center">
        <p className="text-ink-muted">{t("No hemos podido cargar las estadísticas.")}</p>
        <button type="button" onClick={() => load(days)} className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-brand-700">
          <RotateCcw className="h-4 w-4" aria-hidden /> {t("Reintentar")}
        </button>
      </div>
    );
  }
  if (!data) return <div className="h-96 animate-pulse rounded-card bg-card" />;

  const m = (x: Metric) => ({ value: x.value, pct: x.change_pct });
  const compare = `${t("en comparación con")} ${range(data.previous_start, data.start)}`;

  return (
    <>
      <Section title={t("Análisis de público")} help={t("Seguidores nuevos en el periodo")} days={days} onDays={setDays}>
        <Row label={t("Total de seguidores")} value={data.followers.total} pct={data.followers.change_pct} help={t("Seguidores nuevos en el periodo")} />
        <Row label={t("Visualizaciones del perfil")} {...m(data.profile_views)} sub={compare} help={t("Personas que han abierto tu perfil")} />
        <Row
          label={`${t("Apariciones en búsquedas")}: ${range(data.start, data.end)}`}
          sub={compare}
          {...m(data.search_appearances)}
          help={t("Veces que has salido en el buscador de otras personas")}
        />
      </Section>
      <Section title={t("Análisis de contenido")} help={t("Veces que tus publicaciones han salido en el inicio de otras personas")} days={days} onDays={setDays}>
        <Row
          label={t("Impresiones de las publicaciones")}
          sub={compare}
          {...m(data.post_impressions)}
          help={t("Veces que tus publicaciones han salido en el inicio de otras personas")}
        />
      </Section>
    </>
  );
}

/* ---------------------------------------------------------------- Contenido */
function Contenido() {
  const t = useT();
  const lang = useLang();
  const [posts, setPosts] = useState<PostStats[] | null>(null);

  useEffect(() => {
    api<PostStats[]>("/stats/me/posts?days=7").then(setPosts).catch(() => setPosts([]));
  }, []);

  if (!posts) return <div className="h-64 animate-pulse rounded-card bg-card" />;
  if (posts.length === 0) {
    return (
      <section className="rounded-card border border-line bg-card p-10 text-center">
        <h2 className="text-lg font-semibold">{t("Todavía no has publicado nada")}</h2>
        <p className="mt-1 text-ink-muted">{t("Cuando publiques, aquí verás cuánta gente lo ve y cómo reacciona.")}</p>
      </section>
    );
  }

  return (
    <section className="rounded-card border border-line bg-card">
      <h2 className="border-b border-line px-6 py-4 text-xl font-semibold">{t("Tus publicaciones")}</h2>
      <ul>
        {posts.map((p) => (
          <li key={p.id} className="border-b border-line px-6 py-4 last:border-0">
            <Link href={`/inicio?post=${p.id}`} className="line-clamp-2 text-[15px] hover:underline">
              {p.excerpt}
            </Link>
            <p className="text-[13px] text-ink-subtle">
              {new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(p.created_at) ? p.created_at : `${p.created_at}Z`).toLocaleDateString(lang === "en" ? "en-GB" : "es-ES", {
                day: "numeric",
                month: "long",
              })}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                [t("Impresiones"), p.impressions, `+${p.impressions_period} ${t("en el periodo")}`],
                [t("Me gusta"), p.likes],
                [t("Comentarios"), p.comments],
                [t("Compartidos"), p.shares],
              ].map(([label, value, extra]) => (
                <div key={String(label)} className="rounded-xl bg-page px-3 py-2">
                  <dt className="text-[13px] text-ink-muted">{label}</dt>
                  <dd className="text-xl font-semibold tabular-nums">
                    {Number(value).toLocaleString("es-ES")}
                    {extra && <span className="ml-1.5 text-[12px] font-normal text-success">{extra}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------------------------------------------------------- Página */
function Content() {
  const t = useT();
  const params = useSearchParams();
  const router = useRouter();
  const tab = (params.get("vista") as Tab) ?? "rendimiento";

  return (
    <div className="space-y-3">
      <section className="flex items-center justify-between rounded-card border border-line bg-card px-6 py-5">
        <h1 className="text-[28px] font-semibold">{tab === "contenido" ? t("Contenido") : t("Rendimiento")}</h1>
        {/* En móvil no hay columna izquierda: se cambia de vista aquí */}
        <select
          aria-label={t("Estadísticas")}
          value={tab}
          onChange={(e) => router.replace(e.target.value === "rendimiento" ? "/estadisticas" : `/estadisticas?vista=${e.target.value}`)}
          className="h-11 rounded-input border border-line px-3 text-sm font-semibold md:hidden"
        >
          <option value="rendimiento">{t("Rendimiento")}</option>
          <option value="contenido">{t("Contenido")}</option>
        </select>
      </section>
      {tab === "contenido" ? <Contenido /> : <Rendimiento />}
    </div>
  );
}

export default function Estadisticas() {
  return (
    <AppShell
      wide
      left={(user) => (
        <Suspense>
          <Sidebar user={user} />
        </Suspense>
      )}
    >
      {() => (
        <Suspense>
          <Content />
        </Suspense>
      )}
    </AppShell>
  );
}
