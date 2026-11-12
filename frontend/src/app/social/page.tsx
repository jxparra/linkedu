"use client";

import { ArrowLeft, Compass, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { GroupCard, GroupCardSkeleton } from "@/components/social/GroupCard";
import { GroupRow, SectionHeader } from "@/components/social/GroupRow";
import { SocialShell } from "@/components/social/SocialNav";
import { api, type GroupSuggestions } from "@/lib/api";

type Section = "for_you" | "nearby" | "more";

/** Textos de cada apartado. → docs/diseno/social.md */
function sectionText(section: Section, province: string | null) {
  if (section === "for_you") return { title: "Sugerencias para ti", subtitle: "Grupos que encajan con tus estudios y con lo que te interesa." };
  if (section === "nearby")
    return province
      ? { title: "Populares cerca de ti", subtitle: `Los grupos con más gente de ${province}, para cualquiera.` }
      : { title: "Populares en StudyHub", subtitle: "Los grupos con más gente, de temas que interesan a cualquiera." };
  return { title: "Más sugerencias", subtitle: "Algunos relacionados contigo y otros para descubrir cosas nuevas." };
}

const SLUGS: Record<string, Section> = { "para-ti": "for_you", cerca: "nearby", mas: "more" };

function Retry({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-card border border-line bg-white p-6 text-center">
      <p className="text-ink-muted">No hemos podido cargar las sugerencias.</p>
      <button type="button" onClick={onRetry} className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-brand-700">
        <RotateCcw className="h-4 w-4" aria-hidden /> Reintentar
      </button>
    </div>
  );
}

/** "Ver todo" de un apartado: todas sus tarjetas en cuadrícula. */
function FullSection({ section }: { section: Section }) {
  const [data, setData] = useState<GroupSuggestions | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    api<GroupSuggestions>(`/groups/suggestions?section=${section}&limit=60`)
      .then(setData)
      .catch(() => setError(true));
  }, [section]);
  useEffect(load, [load]);

  const groups = data ? data[section] : null;
  const text = sectionText(section, data?.province ?? null);

  return (
    <div>
      <Link href="/social" className="mb-3 inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Sugerencias
      </Link>
      <SectionHeader id="full-title" title={text.title} subtitle={text.subtitle} />
      {error && <Retry onRetry={load} />}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {groups === null && !error && [0, 1, 2, 3, 4, 5].map((i) => <GroupCardSkeleton key={i} />)}
        {groups?.map((g) => <GroupCard key={g.id} group={g} dismissible />)}
      </div>
      {groups?.length === 0 && <p className="rounded-card border border-line bg-white p-8 text-center text-ink-muted">No hay más grupos en este apartado.</p>}
    </div>
  );
}

function Suggestions() {
  const params = useSearchParams();
  const full = SLUGS[params.get("ver") ?? ""];
  const [data, setData] = useState<GroupSuggestions | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    api<GroupSuggestions>("/groups/suggestions")
      .then(setData)
      .catch(() => setError(true));
  }, []);
  useEffect(() => {
    if (!full) load();
  }, [full, load]);

  if (full) return <FullSection key={full} section={full} />;
  if (error) return <Retry onRetry={load} />;

  const province = data?.province ?? null;
  const forYou = sectionText("for_you", province);
  const nearby = sectionText("nearby", province);
  const more = sectionText("more", province);
  const divider = <hr className="my-8 border-line" />;

  return (
    <div>
      <GroupRow
        id="for-you"
        title={forYou.title}
        subtitle={forYou.subtitle}
        href="/social?ver=para-ti"
        groups={data?.for_you ?? null}
        empty={
          <div className="flex items-center gap-4 rounded-card border border-line bg-white p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <Compass className="h-6 w-6" aria-hidden />
            </span>
            <p className="text-[15px] text-ink-muted">
              Ya estás en todos los grupos que encajan contigo. Únete a alguno de abajo y te sugeriremos más de esos temas.
            </p>
          </div>
        }
      />
      {divider}
      <GroupRow id="nearby" title={nearby.title} subtitle={nearby.subtitle} href="/social?ver=cerca" groups={data?.nearby ?? null} />
      {divider}
      <section aria-labelledby="more">
        <SectionHeader id="more" title={more.title} subtitle={more.subtitle} href={data && data.more.length > 0 ? "/social?ver=mas" : undefined} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data === null ? [0, 1, 2].map((i) => <GroupCardSkeleton key={i} />) : data.more.map((g) => <GroupCard key={g.id} group={g} dismissible />)}
        </div>
        {data?.more.length === 0 && (
          <p className="rounded-card border border-line bg-white p-6 text-center text-ink-muted">Ya has visto todos los grupos. ¿Por qué no creas uno?</p>
        )}
      </section>
    </div>
  );
}

export default function Social() {
  return (
    <SocialShell>
      {() => (
        <Suspense>
          <Suggestions />
        </Suspense>
      )}
    </SocialShell>
  );
}
