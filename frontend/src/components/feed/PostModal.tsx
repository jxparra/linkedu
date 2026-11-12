"use client";

import { ChevronDown, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, type Comment, type Post, type User } from "@/lib/api";
import { CommentComposer } from "./CommentComposer";
import { CommentThread } from "./CommentThread";
import { PostCard } from "./PostCard";

export type CommentSort = "relevant" | "recent" | "all";

const SORTS: { value: CommentSort; label: string; text: string }[] = [
  { value: "relevant", label: "Más pertinentes", text: "Primero los comentarios con más me gusta y respuestas." },
  { value: "recent", label: "Más recientes", text: "Se muestran todos los comentarios. Los más recientes aparecen en primer lugar." },
  { value: "all", label: "Todos los comentarios", text: "Se muestran todos los comentarios en el orden en que se escribieron." },
];

type Props = {
  post: Post;
  onClose: () => void;
  onUpdate?: (p: Post) => void;
  onDelete?: (id: number) => void;
};

/** Panel central con la publicación completa y sus comentarios (como "Publicación de…" en Facebook). */
export function PostModal({ post: initial, onClose, onUpdate, onDelete }: Props) {
  const [post, setPost] = useState(initial);
  const [me, setMe] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [sort, setSort] = useState<CommentSort>("relevant");
  const [sortOpen, setSortOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const firstName = post.author.role === "company" ? post.author.name : post.author.name.split(" ")[0];

  const update = useCallback(
    (p: Post) => {
      setPost(p);
      onUpdate?.(p);
    },
    [onUpdate],
  );

  useEffect(() => {
    api<User>("/auth/me").then(setMe).catch(() => {});
  }, []);

  useEffect(() => {
    setComments(null);
    api<Comment[]>(`/posts/${post.id}/comments?sort=${sort}`)
      .then(setComments)
      .catch(() => setComments([]));
  }, [post.id, sort]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (sortOpen) setSortOpen(false);
      else onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, sortOpen]);

  useEffect(() => {
    if (!sortOpen) return;
    const close = (e: MouseEvent) => {
      if (!sortRef.current?.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [sortOpen]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const added = (c: Comment) => {
    setComments((cs) => {
      const list = cs ?? [];
      if (c.parent_id) {
        return [...list.map((x) => (x.id === c.parent_id ? { ...x, replies: x.replies + 1 } : x)), c];
      }
      return [c, ...list];
    });
    update({ ...post, comments: post.comments + 1 });
  };

  const removed = (c: Comment) => {
    setComments((cs) =>
      (cs ?? [])
        .filter((x) => x.id !== c.id && x.parent_id !== c.id)
        .map((x) => (x.id === c.parent_id ? { ...x, replies: Math.max(0, x.replies - 1) } : x)),
    );
    update({ ...post, comments: Math.max(0, post.comments - 1 - (c.parent_id ? 0 : c.replies)) });
  };

  const top = comments?.filter((c) => !c.parent_id) ?? [];
  const repliesOf = (id: number) => comments?.filter((c) => c.parent_id === id) ?? [];
  const current = SORTS.find((s) => s.value === sort)!;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-ink/50 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      data-testid="post-modal-backdrop"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-modal-title"
        className="flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[94vh] sm:max-w-[720px] sm:rounded-card"
      >
        <div className="relative flex h-16 shrink-0 items-center justify-center border-b border-line px-16">
          <h2 id="post-modal-title" className="truncate text-xl font-bold">
            Publicación de {firstName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full bg-page hover:bg-line"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <PostCard
            post={post}
            variant="modal"
            onUpdate={update}
            onDelete={(id) => onDelete?.(id)}
            onCommentClick={() => composerRef.current?.focus()}
          />

          <section aria-label="Comentarios" className="border-t border-line px-4 pb-4">
            <div ref={sortRef} className="relative py-2">
              <button
                type="button"
                onClick={() => setSortOpen((o) => !o)}
                aria-expanded={sortOpen}
                aria-haspopup="listbox"
                className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-[15px] font-semibold text-ink-muted hover:bg-page hover:text-ink"
              >
                {current.label}
                <ChevronDown className={`h-4 w-4 transition-transform ${sortOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>
              {sortOpen && (
                <ul role="listbox" aria-label="Ordenar comentarios" className="absolute left-0 z-20 mt-1 w-[min(360px,90vw)] rounded-xl border border-line bg-white p-2 shadow-xl">
                  {SORTS.map((s) => (
                    <li key={s.value} role="option" aria-selected={s.value === sort}>
                      <button
                        type="button"
                        onClick={() => {
                          setSort(s.value);
                          setSortOpen(false);
                        }}
                        className={`w-full rounded-lg px-3 py-2.5 text-left hover:bg-page ${s.value === sort ? "bg-brand-50" : ""}`}
                      >
                        <span className={`block font-semibold ${s.value === sort ? "text-brand-700" : ""}`}>{s.label}</span>
                        <span className="mt-0.5 block text-[13px] leading-snug text-ink-muted">{s.text}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {comments === null ? (
              <div className="space-y-4 py-2" aria-label="Cargando comentarios">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-2">
                    <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-page" />
                    <div className="h-16 flex-1 animate-pulse rounded-2xl bg-page" />
                  </div>
                ))}
              </div>
            ) : top.length === 0 ? (
              <p className="py-8 text-center text-ink-muted">Todavía no hay comentarios. ¡Escribe el primero!</p>
            ) : (
              <ul className="space-y-3">
                {top.map((c) => (
                  <CommentThread
                    key={c.id}
                    comment={c}
                    replies={repliesOf(c.id)}
                    me={me}
                    onAdded={added}
                    onRemoved={removed}
                    onToast={setToast}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="shrink-0 border-t border-line px-4 py-3">
          <CommentComposer
            ref={composerRef}
            postId={post.id}
            me={me}
            placeholder={comments && top.length === 0 ? "Escribe el primer comentario…" : "Escribe un comentario…"}
            onSent={added}
          />
        </div>

        {toast && (
          <div role="status" className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4">
            <p className="rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-lg">{toast}</p>
          </div>
        )}
      </div>
    </div>
  );
}
