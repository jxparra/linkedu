"use client";

import { PenSquare, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Select } from "@/components/Select";
import { AppShell } from "@/components/app/AppShell";
import { displayName } from "@/components/app/TopBar";
import { Avatar } from "@/components/Avatar";
import { ChalkText } from "@/components/ChalkLine";
import { api, mediaUrl, type Performance, type PostStats, type Profile, type User } from "@/lib/api";
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
      className={`flex min-h-11 items-center rounded-btn px-3 text-[15px] font-semibold transition-colors ${
        tab === key ? "nav-mark" : "text-ink-muted hover:bg-field-hover hover:text-ink"
      }`}
    >
      {t(label)}
    </Link>
  );

  return (
    <div className="space-y-3">
      {/* Tu ficha, como el carné de la columna izquierda (sin portada) */}
      <section className="overflow-hidden rounded-card border border-line bg-card">
        <div className="h-2 bg-brand-600" aria-hidden />
        <div className="flex items-center gap-3 p-3">
          <Avatar name={name || "?"} src={profile?.user.avatar_url ? mediaUrl(profile.user.avatar_url) : null} size="md" role={user?.role} />
          <div className="min-w-0">
            <Link href="/perfil" className="block truncate font-semibold leading-tight hover:underline">
              {name}
            </Link>
            {profile?.user.headline && <p className="line-clamp-2 text-[13px] text-ink-muted">{profile.user.headline}</p>}
          </div>
        </div>
      </section>
      <nav aria-label={t("Estadísticas")} className="space-y-0.5 rounded-card border border-line bg-card p-2">
        {item("rendimiento", "Rendimiento")}
        {item("contenido", "Contenido")}
        <div className="px-1 pb-1 pt-3">
          <Link
            href="/inicio"
            className="flex min-h-11 items-center justify-center gap-2 rounded-btn bg-brand-600 px-4 font-semibold text-on-brand transition-colors hover:bg-brand-hover"
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
/** Subida o bajada respecto al periodo anterior. El rojo es para errores: una bajada va en gris, sin alarma. */
/**
 * Cambio respecto al periodo anterior. Con cifras pequeñas (menos de 10 antes) se da la diferencia en número:
 * «▼ 100 %» al pasar de 1 a 0, o «▲ 1750 %» de 2 a 37, no ayudan a nadie. Si las dos son 0, «—».
 */
function Change({ pct, value, previous, onBoard = false }: { pct: number | null; value?: number; previous?: number; onBoard?: boolean }) {
  const t = useT();
  const up = onBoard ? "text-spine-strong" : "text-success";
  const flat = onBoard ? "text-spine-ink" : "text-ink-muted";
  const cls = "whitespace-nowrap text-[13px] font-semibold tabular-nums";
  if (value !== undefined && previous !== undefined) {
    if (value === 0 && previous === 0) return <span className={`${cls} ${flat}`} aria-label={t("sin cambios")}>—</span>;
    if (previous < 10) {
      const diff = value - previous;
      if (diff > 0) return <span className={`${cls} ${up}`}>▲ +{diff.toLocaleString("es-ES")}</span>;
      if (diff < 0) return <span className={`${cls} ${flat}`}>▼ −{Math.abs(diff).toLocaleString("es-ES")}</span>;
    }
  }
  if (pct === null) return <span className={`${cls} ${up}`}>▲ {t("nuevo")}</span>;
  if (pct > 0) return <span className={`${cls} ${up}`}>▲ {pct.toLocaleString("es-ES")} %</span>;
  if (pct < 0) return <span className={`${cls} ${flat}`}>▼ {Math.abs(pct).toLocaleString("es-ES")} %</span>;
  return (
    <span className={`${cls} ${flat}`}>
      <span aria-hidden>● </span>0 %
    </span>
  );
}

/** Una fila tranquila del boletín: qué es, qué significa y la cifra con su cambio. */
function Row({ label, help, value, previous, pct }: { label: string; help: string; value: number; previous: number; pct: number | null }) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 py-4">
      <div>
        <p className="text-[15px] font-semibold">{label}</p>
        <p className="text-[13px] text-ink-muted">{help}</p>
      </div>
      <div className="text-right">
        <p className="font-display text-[26px] font-bold leading-none tabular-nums">{value.toLocaleString("es-ES")}</p>
        <Change pct={pct} value={value} previous={previous} />
      </div>
    </li>
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

  return (
    <>
      {/* La cifra protagonista, en la pizarra: lo único llamativo de la pantalla */}
      <section aria-labelledby="stats-hero" className="relative flex flex-col rounded-card bg-board px-6 py-6 text-spine-strong sm:px-8 sm:py-7">
        <h2 id="stats-hero" className="text-[17px] font-semibold text-spine-ink">
          {t("Te siguen")}
        </h2>
        {/* El periodo: arriba a la derecha en pantallas anchas; en el móvil, al final para no separar el título de la cifra */}
        <label className="order-last mt-5 self-start sm:absolute sm:right-8 sm:top-6 sm:mt-0">
          <Select
            ariaLabel={t("Periodo")}
            tone="board"
            value={String(days)}
            onChange={(v) => setDays(Number(v))}
            options={DAYS.map((d) => ({ value: String(d), label: t(`Últimos ${d} días`) }))}
            className="w-48"
            buttonClassName="h-11 text-sm font-semibold"
          />
        </label>
        <p className="mt-2 font-display text-[72px] font-extrabold leading-[0.9] tracking-[-0.04em] tabular-nums sm:text-[104px]">
          {data.followers.total.toLocaleString("es-ES")}
        </p>
        <p className="mt-3 flex flex-wrap items-baseline gap-x-2 text-[14px] text-spine-ink">
          <Change pct={data.followers.change_pct} value={data.followers.total} previous={data.followers.total - data.followers.new} onBoard />
          <span>
            {data.followers.new > 0 ? `+${data.followers.new.toLocaleString("es-ES")} · ` : ""}
            {t("respecto a")} {range(data.previous_start, data.start)}
          </span>
        </p>
      </section>

      <section className="rounded-card border border-line bg-card px-6 pt-5">
        <h2 className="text-lg font-bold">{range(data.start, data.end)}</h2>
        <p className="text-[13px] text-ink-muted">
          {t("en comparación con")} {range(data.previous_start, data.start)}
        </p>
        <ul className="mt-1 divide-y divide-line">
          <Row label={t("Han abierto tu perfil")} help={t("Personas distintas que han entrado en tu perfil")} value={data.profile_views.value} previous={data.profile_views.previous} pct={data.profile_views.change_pct} />
          <Row
            label={t("Te han encontrado buscando")}
            help={t("Veces que has salido cuando alguien buscaba en Linkedu")}
            value={data.search_appearances.value}
            previous={data.search_appearances.previous}
            pct={data.search_appearances.change_pct}
          />
          <Row
            label={t("Han visto lo que publicas")}
            help={t("Veces que tus publicaciones han salido en el inicio de otras personas")}
            value={data.post_impressions.value}
            previous={data.post_impressions.previous}
            pct={data.post_impressions.change_pct}
          />
        </ul>
      </section>
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
        <h2 className="text-lg font-bold">{t("Todavía no has publicado nada")}</h2>
        <p className="mt-1 text-ink-muted">{t("Cuando publiques, aquí verás cuánta gente lo ve y cómo reacciona.")}</p>
      </section>
    );
  }

  return (
    <section className="rounded-card border border-line bg-card">
      <h2 className="border-b border-line px-6 py-4 text-xl font-bold">{t("Tus publicaciones")}</h2>
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
                [t("Vistas"), p.impressions, `+${p.impressions_period} ${t("en el periodo")}`],
                [t("Me gusta"), p.likes],
                [t("Comentarios"), p.comments],
                [t("Compartidos"), p.shares],
              ].map(([label, value, extra]) => (
                <div key={String(label)} className="rounded-card bg-page px-3 py-2">
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
  const tab = (params.get("vista") as Tab) ?? "rendimiento";

  return (
    <div className="space-y-3">
      <section className="rounded-card border border-line bg-card px-6 pb-5 pt-5">
        <h1 className="pb-1 text-[28px] font-bold leading-tight">
          <ChalkText>{t("Estadísticas")}</ChalkText>
        </h1>
        {/* En móvil no hay columna izquierda: se cambia de vista aquí */}
        <nav aria-label={t("Estadísticas")} className="mt-4 flex gap-2 md:hidden">
          {(["rendimiento", "contenido"] as Tab[]).map((key) => (
            <Link
              key={key}
              href={key === "rendimiento" ? "/estadisticas" : `/estadisticas?vista=${key}`}
              aria-current={tab === key ? "page" : undefined}
              className={`flex min-h-11 items-center rounded-btn px-4 text-sm font-semibold transition-colors ${
                tab === key ? "nav-mark" : "bg-card text-ink ring-1 ring-line"
              }`}
            >
              {key === "rendimiento" ? t("Rendimiento") : t("Contenido")}
            </Link>
          ))}
        </nav>
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
