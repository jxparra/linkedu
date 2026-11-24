"use client";

import { Check, Loader2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { GroupCover } from "@/components/social/GroupCover";
import { SocialShell } from "@/components/social/SocialNav";
import { api, refreshGroups, type ForumsList, type GroupCard as Forum } from "@/lib/api";
import { coverTopic, FORUM_LABEL, membersText } from "@/lib/groups";
import { SectionHero } from "@/components/SectionHero";

/** Fila compacta de "Tus foros". */
function ForumRow({ forum }: { forum: Forum }) {
  // Con publicaciones esta semana: reborde de la sección y el número de publicaciones, para ir primero ahí
  const active = forum.posts_week > 0;
  return (
    <li>
      <Link
        href={`/social/grupo/${forum.id}`}
        className={`flex items-center gap-3 rounded-card p-2 transition-colors hover:bg-page ${active ? "match-ring match-foros my-1" : ""}`}
      >
        <GroupCover src={forum.cover_url} topic={coverTopic(forum)} iconSize="sm" className="h-12 w-12 shrink-0 rounded-btn" />
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-semibold leading-snug">{forum.name}</span>
          <span className="block truncate text-[13px] text-ink-muted">
            {active ? (
              <span className="font-semibold text-foros-ink">
                {forum.posts_week} {forum.posts_week === 1 ? "publicación" : "publicaciones"} esta semana
              </span>
            ) : (
              <>
                {FORUM_LABEL[forum.type]} · {membersText(forum.members)}
              </>
            )}
          </span>
        </span>
      </Link>
    </li>
  );
}

/**
 * Fila de «Descubrir»: portada pequeña, nombre, por qué se sugiere y «Unirme» en la misma línea.
 * Sustituye a la rejilla de portadas grandes: se leen muchos foros de un vistazo sin saturar.
 */
function DiscoverRow({ forum }: { forum: Forum }) {
  const [joined, setJoined] = useState(forum.is_member);
  const [busy, setBusy] = useState(false);
  const join = async () => {
    setBusy(true);
    try {
      const r = await api<{ is_member: boolean }>(`/groups/${forum.id}/join`, { method: "POST" });
      setJoined(r.is_member);
      refreshGroups();
    } catch {
      /* se queda como estaba */
    } finally {
      setBusy(false);
    }
  };
  return (
    <li className="flex items-center gap-3 py-3">
      <Link href={`/social/grupo/${forum.id}`} tabIndex={-1} aria-hidden className="shrink-0">
        <GroupCover src={forum.cover_url} topic={coverTopic(forum)} iconSize="sm" className="h-12 w-12 rounded-btn" />
      </Link>
      <span className="min-w-0 flex-1">
        <Link href={`/social/grupo/${forum.id}`} className="block truncate text-[15px] font-semibold leading-snug hover:underline">
          {forum.name}
        </Link>
        <span className="block truncate text-[13px] text-ink-muted">{forum.reason ?? `${FORUM_LABEL[forum.type]} · ${membersText(forum.members)}`}</span>
      </span>
      {joined ? (
        <Link
          href={`/social/grupo/${forum.id}`}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-btn px-3 text-sm font-semibold text-foros-ink hover:bg-foros-50"
        >
          <Check className="h-4 w-4" aria-hidden /> Entrar
        </Link>
      ) : (
        <button
          type="button"
          onClick={join}
          disabled={busy}
          aria-label={`Unirme a ${forum.name}`}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-btn border border-edge px-3 text-sm font-semibold hover:border-ink-subtle"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
          Unirme
        </button>
      )}
    </li>
  );
}

const MINE_PREVIEW = 6;
const SUGGESTED_STEP = 8;

function Forums() {
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [data, setData] = useState<ForumsList | null>(null);
  const [allMine, setAllMine] = useState(false);
  const [shownSuggested, setShownSuggested] = useState(SUGGESTED_STEP);

  useEffect(() => {
    setData(null);
    setShownSuggested(SUGGESTED_STEP);
    api<ForumsList>(`/groups/forums${q ? `?q=${encodeURIComponent(q)}` : ""}`)
      .then(setData)
      .catch(() => setData({ mine: [], suggested: [] }));
  }, [q]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setQ(text.trim());
  };

  // Los que tienen actividad esta semana, primero (son los que llevan reborde)
  const mine = [...(data?.mine ?? [])].sort((x, y) => Number(y.posts_week > 0) - Number(x.posts_week > 0));
  const shownMine = allMine ? mine : mine.slice(0, MINE_PREVIEW);

  return (
    <div className="space-y-4">
      <SectionHero kind="foros" title="Foros" subtitle="Las comunidades de tus estudios, de tu centro y de temas que interesan a cualquier estudiante.">
        <form role="search" onSubmit={submit} className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-spine-ink" aria-hidden />
          <input
            type="search"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (!e.target.value) setQ("");
            }}
            placeholder="Buscar foros: una carrera, un centro…"
            aria-label="Buscar foros"
            className="h-12 w-full rounded-input border border-white/15 bg-white/10 pl-10 pr-4 text-[15px] text-spine-strong placeholder:text-spine-strong/80 focus:border-mark focus:outline-none focus:ring-2 focus:ring-mark/40"
          />
        </form>
      </SectionHero>

      {data === null ? (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="h-72 animate-pulse rounded-card border border-line bg-card" />
          <div className="h-96 animate-pulse rounded-card border border-line bg-card" />
        </div>
      ) : (
        <div className={`grid grid-cols-[minmax(0,1fr)] items-start gap-6 ${mine.length > 0 ? "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : ""}`}>
          {mine.length > 0 && (
            <section className="rounded-card border border-line bg-card p-3 lg:sticky lg:top-[88px]">
              <div className="flex items-baseline justify-between gap-2 px-2 pb-1 pt-1">
                <h2 className="text-lg font-bold">{q ? "Tus foros que coinciden" : "Tus foros"}</h2>
                <span className="text-sm text-ink-muted">{mine.length}</span>
              </div>
              <ul className="stagger-in">
                {shownMine.map((f) => (
                  <ForumRow key={f.id} forum={f} />
                ))}
              </ul>
              {mine.length > MINE_PREVIEW && (
                <button
                  type="button"
                  onClick={() => setAllMine((v) => !v)}
                  className="mt-1 min-h-11 w-full rounded-btn text-[15px] font-semibold text-foros-ink hover:bg-foros-50"
                >
                  {allMine ? "Ver menos" : `Ver todos (${mine.length})`}
                </button>
              )}
            </section>
          )}

          <section className="rounded-card border border-line bg-card px-5 py-4">
            <h2 className="text-lg font-bold">{q ? `Resultados para «${q}»` : "Descubrir foros"}</h2>
            {data.suggested.length === 0 ? (
              <div className="py-8 text-center">
                {q ? (
                  <>
                    <p className="text-ink-muted">No hay foros con «{q}». Prueba con el nombre de tu carrera o de tu centro.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setText("");
                        setQ("");
                      }}
                      className="mt-3 inline-flex min-h-11 items-center rounded-btn border border-edge px-5 font-semibold hover:border-ink-subtle"
                    >
                      Borrar búsqueda
                    </button>
                  </>
                ) : (
                  <p className="text-ink-muted">Ya estás en todos los foros. Si echas en falta alguno, crea un grupo.</p>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {data.suggested.slice(0, shownSuggested).map((f) => (
                  <DiscoverRow key={f.id} forum={f} />
                ))}
              </ul>
            )}
            {data.suggested.length > shownSuggested && (
              <button
                type="button"
                onClick={() => setShownSuggested((n) => n + SUGGESTED_STEP)}
                className="mt-2 min-h-11 w-full rounded-btn text-[15px] font-semibold text-foros-ink hover:bg-foros-50"
              >
                Ver más foros
              </button>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default function ForosPage() {
  return <SocialShell>{() => <Forums />}</SocialShell>;
}
