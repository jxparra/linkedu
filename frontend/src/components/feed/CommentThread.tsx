"use client";

import { ChevronDown, CornerDownRight, EyeOff, Flag, MoreHorizontal, ThumbsUp, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api, mediaUrl, type Comment, type User } from "@/lib/api";
import { timeAgo } from "@/lib/time";
import { Avatar } from "../Avatar";
import { CommentComposer } from "./CommentComposer";

type Shared = {
  me: User | null;
  onAdded: (c: Comment) => void;
  onRemoved: (c: Comment) => void;
  onToast: (msg: string) => void;
};

/** Un comentario con sus respuestas (un solo nivel, como en Facebook). */
export function CommentThread({ comment, replies, ...shared }: Shared & { comment: Comment; replies: Comment[] }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const startReply = (name: string) => {
    setShowReplies(true);
    setReplyTo(name);
  };

  return (
    <li>
      <CommentItem comment={comment} onReply={startReply} {...shared} />
      {(replies.length > 0 || replyTo !== null) && (
        <div className="ml-11 mt-1">
          {replies.length > 0 && !showReplies && (
            <button
              type="button"
              onClick={() => setShowReplies(true)}
              className="flex min-h-9 items-center gap-1.5 rounded-btn px-1 text-sm font-semibold text-ink-muted hover:text-ink"
            >
              <CornerDownRight className="h-4 w-4" aria-hidden />
              Ver {replies.length} {replies.length === 1 ? "respuesta" : "respuestas"}
            </button>
          )}
          {showReplies && (
            <ul className="space-y-2">
              {replies.map((r) => (
                <li key={r.id}>
                  <CommentItem comment={r} onReply={startReply} small {...shared} />
                </li>
              ))}
            </ul>
          )}
          {showReplies && replies.length > 1 && (
            <button type="button" onClick={() => setShowReplies(false)} className="mt-1 flex min-h-8 items-center gap-1 px-1 text-[13px] font-semibold text-ink-muted hover:text-ink">
              <ChevronDown className="h-4 w-4 rotate-180" aria-hidden /> Ocultar respuestas
            </button>
          )}
          {replyTo !== null && (
            <div className="mt-2">
              <CommentComposer
                key={replyTo}
                postId={comment.post_id}
                parentId={comment.id}
                me={shared.me}
                initialText={replyTo ? `@${replyTo} ` : ""}
                placeholder={`Responder a ${comment.author.name}…`}
                autoFocus
                compact
                onSent={(c) => {
                  shared.onAdded(c);
                  setReplyTo(null);
                }}
                onCancel={() => setReplyTo(null)}
              />
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function CommentItem({
  comment,
  small = false,
  onReply,
  onRemoved,
  onToast,
}: Shared & { comment: Comment; small?: boolean; onReply: (name: string) => void }) {
  const [liked, setLiked] = useState(comment.liked_by_me);
  const [likes, setLikes] = useState(comment.likes);
  const [pop, setPop] = useState(0);
  const [menu, setMenu] = useState(false);
  const [hidden, setHidden] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { author } = comment;
  const firstName = author.role === "company" ? author.name : author.name.split(" ")[0];

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menu]);

  const toggleLike = async () => {
    const next = !liked;
    if (next) setPop((p) => p + 1);
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));
    try {
      const res = await api<{ liked: boolean; likes: number }>(`/comments/${comment.id}/like`, { method: next ? "POST" : "DELETE" });
      setLiked(res.liked);
      setLikes(res.likes);
    } catch {
      setLiked(!next);
      setLikes((n) => n + (next ? -1 : 1));
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/inicio?post=${comment.post_id}#comentario-${comment.id}`;
    try {
      await navigator.clipboard.writeText(url);
      onToast("Enlace al comentario copiado");
    } catch {
      onToast("No se ha podido copiar el enlace");
    }
  };

  const report = async () => {
    setMenu(false);
    await api("/reports", { method: "POST", body: { target_type: "comment", target_id: comment.id } }).catch(() => {});
    setHidden(true);
    onToast("Gracias por avisar. Lo revisaremos lo antes posible.");
  };

  const remove = async () => {
    setMenu(false);
    try {
      await api(`/comments/${comment.id}`, { method: "DELETE" });
      onRemoved(comment);
      onToast("Comentario eliminado");
    } catch {
      onToast("No se ha podido eliminar el comentario");
    }
  };

  if (hidden) {
    return (
      <div className="flex items-center gap-3 rounded-card bg-page px-3 py-2 text-sm text-ink-muted">
        <EyeOff className="h-4 w-4" aria-hidden /> Comentario oculto
        <button type="button" onClick={() => setHidden(false)} className="ml-auto font-semibold text-brand-700 hover:underline">
          Deshacer
        </button>
      </div>
    );
  }

  const link = "rounded px-0.5 font-semibold hover:underline";

  return (
    <div id={`comentario-${comment.id}`} className="group flex items-start gap-2">
      <Link href={`/perfil/${author.id}`} aria-hidden tabIndex={-1} className="shrink-0">
        <Avatar name={author.name} src={author.avatar_url} size="sm" square={author.role === "company"} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <div className={`min-w-0 rounded-card bg-page px-3 py-2 ${small ? "text-sm" : "text-[15px]"}`}>
            <p className="flex flex-wrap items-center gap-x-1.5 text-sm">
              <Link href={`/perfil/${author.id}`} className="font-semibold hover:underline">
                {author.name}
              </Link>
              {comment.by_post_author && (
                <span className="rounded-full bg-brand-50 px-1.5 py-px text-[11px] font-semibold text-brand-700">Autor</span>
              )}
            </p>
            {comment.content && <p className="whitespace-pre-line break-words leading-snug">{renderMentions(comment.content)}</p>}
          </div>
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenu((m) => !m)}
              aria-label="Opciones del comentario"
              aria-expanded={menu}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-page hover:text-ink focus:opacity-100 ${
                menu ? "opacity-100" : "sm:opacity-0 sm:group-hover:opacity-100"
              }`}
            >
              <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden />
            </button>
            {menu && (
              <div role="menu" className="absolute right-0 top-9 z-20 w-60 overflow-hidden rounded-card border border-line bg-card py-1 shadow-xl sm:left-0 sm:right-auto">
                <button role="menuitem" type="button" onClick={() => { setMenu(false); setHidden(true); }} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm hover:bg-page">
                  <EyeOff className="h-4 w-4" aria-hidden /> Ocultar comentario
                </button>
                {!comment.is_mine && (
                  <button role="menuitem" type="button" onClick={report} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm hover:bg-page">
                    <Flag className="h-4 w-4" aria-hidden /> Denunciar comentario
                  </button>
                )}
                {comment.can_delete && (
                  <button role="menuitem" type="button" onClick={remove} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-danger hover:bg-red-50">
                    <Trash2 className="h-4 w-4" aria-hidden /> Eliminar comentario
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {comment.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(comment.image_url)} alt="" loading="lazy" className="mt-1.5 max-h-52 rounded-card border border-line" />
        )}
        <div className="mt-1 flex max-w-[520px] flex-wrap items-center gap-x-3 px-2 text-[13px] text-ink-muted">
          <time dateTime={comment.created_at}>{timeAgo(comment.created_at)}</time>
          <button
            type="button"
            onClick={toggleLike}
            aria-pressed={liked}
            className={`${link} inline-flex items-center gap-1 ${liked ? "text-brand-700" : "hover:text-ink"}`}
          >
            <ThumbsUp key={pop} className={`h-3.5 w-3.5 ${liked ? "fill-brand-600 text-brand-700" : ""} ${pop && liked ? "animate-like-pop" : ""}`} aria-hidden />
            Me gusta
          </button>
          <button type="button" onClick={() => onReply(comment.is_mine ? "" : firstName)} className={`${link} hover:text-ink`}>
            Responder
          </button>
          <button type="button" onClick={share} className={`${link} hover:text-ink`}>
            Compartir
          </button>
          {likes > 0 && (
            <span className="inline-flex items-center gap-1 font-semibold text-brand-700" aria-label={`${likes} me gusta`}>
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-brand-600">
                <ThumbsUp className="h-2.5 w-2.5 fill-on-brand text-on-brand" aria-hidden />
              </span>
              {likes}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Resalta las menciones "@Nombre" al principio de una respuesta. */
function renderMentions(text: string) {
  const m = text.match(/^@(\S+)\s/);
  if (!m) return text;
  return (
    <>
      <span className="font-semibold text-brand-700">@{m[1]}</span>
      {text.slice(m[0].length - 1)}
    </>
  );
}
