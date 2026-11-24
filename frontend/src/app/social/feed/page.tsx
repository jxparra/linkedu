"use client";

import { Newspaper, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PostCard } from "@/components/feed/PostCard";
import { SocialShell } from "@/components/social/SocialNav";
import { api, type Post } from "@/lib/api";

/** Tu feed: lo último que se ha publicado en los grupos a los que te has unido. */
function GroupsFeed() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    api<Post[]>("/groups/feed")
      .then(setPosts)
      .catch(() => setError(true));
  }, []);
  useEffect(load, [load]);

  const replace = (p: Post) => setPosts((ps) => ps?.map((x) => (x.id === p.id ? p : x)) ?? ps);
  const remove = (id: number) => setPosts((ps) => ps?.filter((x) => x.id !== id) ?? ps);

  return (
    <div className="mx-auto max-w-[680px] space-y-4">
      <div>
        <h2 className="text-xl font-bold">Actividad reciente</h2>
        <p className="text-[15px] text-ink-muted">Lo último de los grupos a los que te has unido.</p>
      </div>

      {error && (
        <div className="rounded-card border border-line bg-card p-6 text-center">
          <p className="text-ink-muted">No hemos podido cargar las publicaciones.</p>
          <button type="button" onClick={load} className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-brand-700">
            <RotateCcw className="h-4 w-4" aria-hidden /> Reintentar
          </button>
        </div>
      )}

      {posts === null && !error && [0, 1].map((i) => <div key={i} className="h-56 animate-pulse rounded-card border border-line bg-card" />)}

      {posts?.length === 0 && (
        <div className="rounded-card border border-line bg-card p-10 text-center">
          <Newspaper className="mx-auto h-10 w-10 text-ink-subtle" aria-hidden />
          <h3 className="mt-3 text-lg font-semibold">Aún no hay nada por aquí</h3>
          <p className="mx-auto mt-1 max-w-sm text-ink-muted">Cuando te unas a grupos, lo que publiquen sus miembros aparecerá aquí.</p>
          <Link href="/social" className="mt-4 inline-flex min-h-11 items-center rounded-btn border border-line px-5 font-semibold hover:border-ink-subtle">
            Ver sugerencias
          </Link>
        </div>
      )}

      {posts?.map((p) => (
        <PostCard
          key={p.id}
          post={p}
          onUpdate={replace}
          onHide={remove}
          onDelete={remove}
          onFollowChange={(authorId, following) =>
            setPosts((ps) => ps?.map((x) => (x.author.id === authorId ? { ...x, following_author: following } : x)) ?? ps)
          }
        />
      ))}
    </div>
  );
}

export default function SocialFeed() {
  return <SocialShell>{() => <GroupsFeed />}</SocialShell>;
}
