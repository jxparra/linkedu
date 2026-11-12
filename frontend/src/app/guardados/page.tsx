"use client";

import { Bookmark, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { PostCard } from "@/components/feed/PostCard";
import { api, type Post } from "@/lib/api";

function Saved() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState(false);
  // Las que quitas de guardados se quedan en pantalla con "Deshacer" hasta que recargas
  const [removed, setRemoved] = useState<number[]>([]);

  const load = useCallback(() => {
    setError(false);
    api<Post[]>("/saved")
      .then(setPosts)
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (p: Post) => {
    setPosts((ps) => ps?.map((x) => (x.id === p.id ? p : x)) ?? ps);
    setRemoved((r) => (p.saved_by_me ? r.filter((id) => id !== p.id) : r.includes(p.id) ? r : [...r, p.id]));
  };

  const undo = async (p: Post) => {
    setRemoved((r) => r.filter((id) => id !== p.id));
    setPosts((ps) => ps?.map((x) => (x.id === p.id ? { ...x, saved_by_me: true } : x)) ?? ps);
    await api(`/posts/${p.id}/save`, { method: "POST" }).catch(() => setRemoved((r) => [...r, p.id]));
  };

  const visible = posts?.filter((p) => !removed.includes(p.id)) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white">
          <Bookmark className="h-5 w-5 fill-white" aria-hidden />
        </span>
        <div>
          <h1 className="text-xl font-semibold">Guardados</h1>
          <p className="text-sm text-ink-muted">Solo tú ves lo que guardas.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-card border border-line bg-white p-6 text-center">
          <p className="text-ink-muted">No hemos podido cargar tus guardados.</p>
          <button type="button" onClick={load} className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-brand-700">
            <RotateCcw className="h-4 w-4" aria-hidden /> Reintentar
          </button>
        </div>
      )}

      {posts === null && !error && [0, 1].map((i) => <div key={i} className="h-56 animate-pulse rounded-card border border-line bg-white" />)}

      {posts && visible.length === 0 && removed.length === 0 && (
        <div className="rounded-card border border-line bg-white p-10 text-center">
          <Bookmark className="mx-auto h-10 w-10 text-ink-subtle" aria-hidden />
          <h2 className="mt-3 text-lg font-semibold">No tienes nada guardado</h2>
          <p className="mx-auto mt-1 max-w-sm text-ink-muted">
            Pulsa los tres puntos <span aria-hidden>(···)</span> de cualquier publicación y elige «Guardar» para leerla más tarde.
          </p>
          <Link href="/inicio" className="mt-4 inline-flex min-h-11 items-center rounded-full border border-line px-5 font-semibold hover:border-ink-subtle">
            Ir al inicio
          </Link>
        </div>
      )}

      {posts?.map((p) =>
        removed.includes(p.id) ? (
          <div key={p.id} className="flex items-center justify-between rounded-card border border-line bg-white px-4 py-3 text-sm text-ink-muted">
            Quitada de guardados
            <button type="button" onClick={() => undo(p)} className="min-h-11 px-2 font-semibold text-brand-700">
              Deshacer
            </button>
          </div>
        ) : (
          <PostCard
            key={p.id}
            post={p}
            onUpdate={update}
            onHide={(id) => setPosts((ps) => ps?.filter((x) => x.id !== id) ?? ps)}
            onDelete={(id) => setPosts((ps) => ps?.filter((x) => x.id !== id) ?? ps)}
            onFollowChange={(authorId, following) =>
              setPosts((ps) => ps?.map((x) => (x.author.id === authorId ? { ...x, following_author: following } : x)) ?? ps)
            }
          />
        ),
      )}
    </div>
  );
}

export default function Guardados() {
  return <AppShell>{() => <Saved />}</AppShell>;
}
