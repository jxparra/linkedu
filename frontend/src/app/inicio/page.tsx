"use client";

import { RotateCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Composer } from "@/components/feed/Composer";
import { PostCard } from "@/components/feed/PostCard";
import { PostModal } from "@/components/feed/PostModal";
import { api, type Post, type User } from "@/lib/api";

function Feed({ user }: { user: User }) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState(false);
  const [hidden, setHidden] = useState<number[]>([]);
  const [linked, setLinked] = useState<Post | null>(null);
  const params = useSearchParams();
  const router = useRouter();

  // Enlaces compartidos: /inicio?post=12 abre esa publicación
  useEffect(() => {
    const id = Number(params.get("post"));
    if (!id) return;
    api<Post>(`/posts/${id}`).then(setLinked).catch(() => {});
  }, [params]);

  const replace = (p: Post) => setPosts((ps) => ps?.map((x) => (x.id === p.id ? p : x)) ?? ps);

  const load = useCallback(() => {
    setError(false);
    api<Post[]>("/feed")
      .then(setPosts)
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setFollowing = (authorId: number, following: boolean) =>
    setPosts((ps) => ps?.map((p) => (p.author.id === authorId ? { ...p, following_author: following } : p)) ?? ps);

  return (
    <div className="space-y-4">
      <h1 className="sr-only">Inicio</h1>
      <Composer user={user} onPublished={(p) => setPosts((ps) => [p, ...(ps ?? [])])} />

      {error && (
        <div className="rounded-card border border-line bg-white p-6 text-center">
          <p className="text-ink-muted">No hemos podido cargar las publicaciones.</p>
          <button type="button" onClick={load} className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-brand-700">
            <RotateCcw className="h-4 w-4" aria-hidden /> Reintentar
          </button>
        </div>
      )}

      {posts === null && !error &&
        [0, 1].map((i) => <div key={i} className="h-56 animate-pulse rounded-card border border-line bg-white" />)}

      {posts?.length === 0 && (
        <div className="rounded-card border border-line bg-white p-8 text-center">
          <h2 className="text-lg font-semibold">Tu inicio está vacío</h2>
          <p className="mt-1 text-ink-muted">Únete a comunidades o publica algo para empezar.</p>
        </div>
      )}

      {posts?.map((p) =>
        hidden.includes(p.id) ? (
          <div key={p.id} className="flex items-center justify-between rounded-card border border-line bg-white px-4 py-3 text-sm text-ink-muted">
            Publicación ocultada
            <button type="button" onClick={() => setHidden((h) => h.filter((x) => x !== p.id))} className="min-h-11 px-2 font-semibold text-brand-700">
              Deshacer
            </button>
          </div>
        ) : (
          <PostCard
            key={p.id}
            post={p}
            onHide={(id) => setHidden((h) => [...h, id])}
            onDelete={(id) => setPosts((ps) => ps?.filter((x) => x.id !== id) ?? ps)}
            onFollowChange={setFollowing}
            onUpdate={replace}
          />
        ),
      )}

      {linked && (
        <PostModal
          post={linked}
          onClose={() => {
            setLinked(null);
            router.replace("/inicio", { scroll: false });
          }}
          onUpdate={replace}
          onDelete={(id) => {
            setLinked(null);
            setPosts((ps) => ps?.filter((x) => x.id !== id) ?? ps);
          }}
        />
      )}
    </div>
  );
}

export default function Inicio() {
  return (
    <AppShell>
      {(user) => (
        <Suspense>
          <Feed user={user} />
        </Suspense>
      )}
    </AppShell>
  );
}
