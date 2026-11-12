"use client";

import { SearchX } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { GroupCard, GroupCardSkeleton } from "@/components/social/GroupCard";
import { SocialShell } from "@/components/social/SocialNav";
import { api, type GroupCard as Group } from "@/lib/api";

function Results() {
  const q = useSearchParams().get("q")?.trim() ?? "";
  const [groups, setGroups] = useState<Group[] | null>(null);

  useEffect(() => {
    setGroups(null);
    api<Group[]>(`/groups?q=${encodeURIComponent(q)}`)
      .then(setGroups)
      .catch(() => setGroups([]));
  }, [q]);

  return (
    <div>
      <h2 className="text-xl font-bold">{q ? `Grupos: «${q}»` : "Todos los grupos"}</h2>
      <p className="mb-4 text-[15px] text-ink-muted">
        {groups === null ? "Buscando…" : `${groups.length} ${groups.length === 1 ? "resultado" : "resultados"}, de más a menos populares`}
      </p>
      {groups?.length === 0 ? (
        <div className="rounded-card border border-line bg-card p-10 text-center">
          <SearchX className="mx-auto h-10 w-10 text-ink-subtle" aria-hidden />
          <h3 className="mt-3 text-lg font-semibold">No hay grupos con ese nombre</h3>
          <p className="mx-auto mt-1 max-w-sm text-ink-muted">Prueba con otra palabra o con una temática, como «deportes» o «idiomas». O crea tú el grupo.</p>
          <Link href="/social/crear" className="mt-4 inline-flex min-h-11 items-center rounded-full border border-line px-5 font-semibold hover:border-ink-subtle">
            Crear grupo
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {groups === null ? [0, 1, 2].map((i) => <GroupCardSkeleton key={i} />) : groups.map((g) => <GroupCard key={g.id} group={g} />)}
        </div>
      )}
    </div>
  );
}

export default function BuscarGrupos() {
  return (
    <SocialShell>
      {() => (
        <Suspense>
          <Results />
        </Suspense>
      )}
    </SocialShell>
  );
}
