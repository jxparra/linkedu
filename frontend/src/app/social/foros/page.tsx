"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { GroupCard, GroupCardSkeleton } from "@/components/social/GroupCard";
import { GroupCover } from "@/components/social/GroupCover";
import { SocialShell } from "@/components/social/SocialNav";
import { api, type ForumsList, type GroupCard as Forum } from "@/lib/api";
import { coverTopic, FORUM_LABEL, membersText } from "@/lib/groups";

/** Fila compacta de "Tus foros". */
function ForumRow({ forum }: { forum: Forum }) {
  return (
    <li>
      <Link href={`/social/grupo/${forum.id}`} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-page">
        <GroupCover src={forum.cover_url} topic={coverTopic(forum)} iconSize="sm" className="h-12 w-12 shrink-0 rounded-lg" />
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-semibold leading-snug">{forum.name}</span>
          <span className="block truncate text-[13px] text-ink-muted">
            {FORUM_LABEL[forum.type]} · {membersText(forum.members)}
          </span>
        </span>
      </Link>
    </li>
  );
}

const MINE_PREVIEW = 6;
const SUGGESTED_STEP = 6;

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

  const mine = data?.mine ?? [];
  const shownMine = allMine ? mine : mine.slice(0, MINE_PREVIEW);

  return (
    <div className="space-y-4">
      <section className="rounded-card border border-line bg-card p-5">
        <h1 className="text-2xl font-bold">Foros</h1>
        <p className="mt-1 text-ink-muted">Las comunidades de tus estudios, de tu centro y de temas que interesan a cualquier estudiante.</p>
        <form role="search" onSubmit={submit} className="relative mt-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-field-text" aria-hidden />
          <input
            type="search"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (!e.target.value) setQ("");
            }}
            placeholder="Buscar foros: una carrera, un centro…"
            aria-label="Buscar foros"
            className="h-11 w-full rounded-full bg-field pl-10 pr-4 text-[15px] text-ink placeholder:text-field-text focus:outline-none focus:ring-2 focus:ring-brand-600/30"
          />
        </form>
      </section>

      {data === null ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <GroupCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {mine.length > 0 && (
            <section className="rounded-card border border-line bg-card p-3">
              <div className="flex items-baseline justify-between gap-2 px-2 pb-1 pt-1">
                <h2 className="text-lg font-semibold">{q ? "Tus foros que coinciden" : "Tus foros"}</h2>
                <span className="text-sm text-ink-muted">{mine.length}</span>
              </div>
              <ul className="grid gap-x-2 sm:grid-cols-2">
                {shownMine.map((f) => (
                  <ForumRow key={f.id} forum={f} />
                ))}
              </ul>
              {mine.length > MINE_PREVIEW && (
                <button
                  type="button"
                  onClick={() => setAllMine((v) => !v)}
                  className="mt-1 min-h-11 w-full rounded-lg text-[15px] font-semibold text-brand-700 hover:bg-page"
                >
                  {allMine ? "Ver menos" : `Ver todos (${mine.length})`}
                </button>
              )}
            </section>
          )}

          <section>
            <h2 className="px-1 pb-3 text-lg font-semibold">{q ? `Resultados para «${q}»` : "Foros para ti"}</h2>
            {data.suggested.length === 0 ? (
              <p className="rounded-card border border-line bg-card p-8 text-center text-ink-muted">
                {q ? "No hay más foros con ese nombre." : "Ya estás en todos los foros. ¡Bien hecho!"}
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data.suggested.slice(0, shownSuggested).map((f) => (
                  <GroupCard key={f.id} group={f} />
                ))}
              </div>
            )}
            {data.suggested.length > shownSuggested && (
              <button
                type="button"
                onClick={() => setShownSuggested((n) => n + SUGGESTED_STEP)}
                className="mt-4 min-h-11 w-full rounded-lg bg-card text-[15px] font-semibold text-brand-700 ring-1 ring-line hover:bg-page"
              >
                Ver más foros
              </button>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default function ForosPage() {
  return <SocialShell>{() => <Forums />}</SocialShell>;
}
