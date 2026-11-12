"use client";

import { Bookmark, Check, EyeOff, Flag, MessageCircle, MoreHorizontal, Plus, Repeat2, Send, ThumbsUp, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { announceRelation, api, onRelation, refreshGroups, type Post } from "@/lib/api";
import { coverTopic, groupNoun } from "@/lib/groups";
import { feelingPhrase } from "@/lib/feelings";
import { timeAgo } from "@/lib/time";
import { Avatar } from "../Avatar";
import { GroupCover } from "../social/GroupCover";
import { UnfollowDialog } from "../UnfollowDialog";
import { LikeBurst } from "./LikeBurst";
import { MediaGallery } from "./MediaGallery";
import { PostModal } from "./PostModal";
import { ShareBurst } from "./ShareBurst";

const TYPE_LABEL: Record<Post["type"], string | null> = {
  general: null,
  pregunta: "Pregunta",
  recurso: "Recurso",
  debate: "Debate",
};

type Props = {
  post: Post;
  /** "feed": tarjeta normal · "modal": dentro del panel de la publicación */
  variant?: "feed" | "modal";
  onHide?: (id: number) => void;
  onDelete?: (id: number) => void;
  onFollowChange?: (authorId: number, following: boolean) => void;
  /** Avisa de cambios (me gusta, compartidos, comentarios) para mantener sincronizados feed y panel */
  onUpdate?: (post: Post) => void;
  /** Solo en el panel: qué hacer al pulsar "Comentar" */
  onCommentClick?: () => void;
};

export function PostCard({ post, variant = "feed", onHide, onDelete, onFollowChange, onUpdate, onCommentClick }: Props) {
  const [liked, setLiked] = useState(post.liked_by_me);
  const [likes, setLikes] = useState(post.likes);
  const [shared, setShared] = useState(post.shared_by_me);
  const [shares, setShares] = useState(post.shares);
  const [comments, setComments] = useState(post.comments);
  const [saved, setSaved] = useState(post.saved_by_me);
  const [burst, setBurst] = useState(0);
  const [shareBurst, setShareBurst] = useState(0);
  const [following, setFollowing] = useState(post.following_author);
  const community = post.community;
  const groupHref = community ? `/social/grupo/${community.id}` : "";
  const [joined, setJoined] = useState(community?.is_member ?? false);
  const [joining, setJoining] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  // Si sigues a esta persona o entras en este grupo desde otra tarjeta o desde el panel, esta se actualiza también
  useEffect(
    () =>
      onRelation(({ kind, id, on }) => {
        if (kind === "user" && id === post.author.id) setFollowing(on);
        if (kind === "group" && id === post.community?.id) setJoined(on);
      }),
    [post.author.id, post.community?.id],
  );
  const [confirmUnfollow, setConfirmUnfollow] = useState(false);
  const [expanded, setExpanded] = useState(variant === "modal");
  const [clamped, setClamped] = useState(false);
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { author } = post;
  const isCompany = author.role === "company";
  const inModal = variant === "modal";
  const extras = [
    post.feeling && feelingPhrase(post.feeling),
    post.tagged.length > 0 && `con ${post.tagged.map((t) => t.name).join(", ")}`,
    post.location && `en ${post.location}`,
  ].filter(Boolean) as string[];

  // Si la misma publicación cambia en otro sitio (por ejemplo en el panel), se actualiza aquí
  useEffect(() => {
    setLiked(post.liked_by_me);
    setLikes(post.likes);
    setShared(post.shared_by_me);
    setShares(post.shares);
    setComments(post.comments);
    setSaved(post.saved_by_me);
  }, [post.liked_by_me, post.likes, post.shared_by_me, post.shares, post.comments, post.saved_by_me]);

  useEffect(() => setFollowing(post.following_author), [post.following_author]);

  useEffect(() => {
    const el = textRef.current;
    if (el) setClamped(el.scrollHeight > el.clientHeight + 1);
  }, [post.content]);

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
    if (next) setBurst((b) => b + 1);
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));
    try {
      const res = await api<{ liked: boolean; likes: number }>(`/posts/${post.id}/like`, { method: next ? "POST" : "DELETE" });
      setLiked(res.liked);
      setLikes(res.likes);
      onUpdate?.({ ...post, liked_by_me: res.liked, likes: res.likes, shared_by_me: shared, shares, saved_by_me: saved });
    } catch {
      setLiked(!next);
      setLikes((n) => n + (next ? -1 : 1));
    }
  };

  const toggleShare = async () => {
    const next = !shared;
    if (next) setShareBurst((b) => b + 1);
    setShared(next);
    setShares((n) => n + (next ? 1 : -1));
    try {
      const res = await api<{ shared: boolean; shares: number }>(`/posts/${post.id}/share`, { method: next ? "POST" : "DELETE" });
      setShared(res.shared);
      setShares(res.shares);
      onUpdate?.({ ...post, shared_by_me: res.shared, shares: res.shares, liked_by_me: liked, likes, saved_by_me: saved });
    } catch {
      setShared(!next);
      setShares((n) => n + (next ? -1 : 1));
    }
  };

  const setFollow = async (next: boolean) => {
    setConfirmUnfollow(false);
    setFollowing(next);
    onFollowChange?.(author.id, next);
    onUpdate?.({ ...post, following_author: next });
    try {
      await api(`/users/${author.id}/follow`, { method: next ? "POST" : "DELETE" });
      announceRelation({ kind: "user", id: author.id, on: next });
    } catch {
      setFollowing(!next);
      onFollowChange?.(author.id, !next);
    }
  };

  const toggleSave = async () => {
    setMenu(false);
    const next = !saved;
    setSaved(next);
    try {
      const res = await api<{ saved: boolean }>(`/posts/${post.id}/save`, { method: next ? "POST" : "DELETE" });
      setSaved(res.saved);
      onUpdate?.({ ...post, saved_by_me: res.saved, liked_by_me: liked, likes, shared_by_me: shared, shares });
    } catch {
      setSaved(!next);
    }
  };

  const join = async () => {
    if (!community) return;
    setJoining(true);
    try {
      await api(`/groups/${community.id}/join`, { method: "POST" });
      setJoined(true);
      announceRelation({ kind: "group", id: community.id, on: true });
      refreshGroups();
    } catch {
      /* se queda el botón */
    } finally {
      setJoining(false);
    }
  };

  const leave = async () => {
    if (!community) return;
    setConfirmLeave(false);
    setJoined(false);
    try {
      await api(`/groups/${community.id}/join`, { method: "DELETE" });
      announceRelation({ kind: "group", id: community.id, on: false });
      refreshGroups();
    } catch {
      setJoined(true);
    }
  };

  const remove = async () => {
    setMenu(false);
    try {
      await api(`/posts/${post.id}`, { method: "DELETE" });
      onDelete?.(post.id);
    } catch {
      /* se queda visible si falla */
    }
  };

  const report = async () => {
    setMenu(false);
    await api("/reports", { method: "POST", body: { target_type: "post", target_id: post.id } }).catch(() => {});
    onHide?.(post.id);
  };

  const openPost = () => (inModal ? onCommentClick?.() : setOpen(true));
  const action = "flex min-h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-sm font-semibold transition-colors";
  const menuItem = "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm hover:bg-page";

  return (
    <article
      className={inModal ? "" : "rounded-card border border-line bg-card transition-[border-color,box-shadow] hover:border-edge"}
      aria-labelledby={`post-${post.id}-${variant}-author`}
    >
      <header className="flex items-start gap-3 p-4 pb-2">
        {community ? (
          // Publicación de un grupo o foro: manda el grupo, y quien la publicó va debajo, más pequeño
          <Link href={groupHref} aria-hidden tabIndex={-1} className="relative shrink-0">
            <GroupCover src={community.cover_url} topic={coverTopic(community)} iconSize="sm" className="h-12 w-12 rounded-xl" />
            <span className="absolute -bottom-1.5 -right-1.5 rounded-full ring-2 ring-card">
              <Avatar name={author.name} src={author.avatar_url} size="xs" square={isCompany} />
            </span>
          </Link>
        ) : (
          <Link href={`/perfil/${author.id}`} aria-hidden tabIndex={-1} className="shrink-0">
            <Avatar name={author.name} src={author.avatar_url} size="md" square={isCompany} />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          {community ? (
            <>
              <p className="leading-snug">
                <Link href={groupHref} className="text-base font-bold text-ink hover:underline">
                  {community.name}
                </Link>
              </p>
              <p className="truncate text-[13px] text-ink-muted">
                <Link href={`/perfil/${author.id}`} id={`post-${post.id}-${variant}-author`} className="font-medium hover:underline">
                  {author.name}
                </Link>
                {extras.length > 0 && ` ${extras.join(" · ")}`}
              </p>
            </>
          ) : (
            <>
              <p className="leading-snug">
                <Link href={`/perfil/${author.id}`} id={`post-${post.id}-${variant}-author`} className="text-base font-bold text-ink hover:underline">
                  {author.name}
                </Link>
                {author.badge && (
                  <span
                    className={`ml-2 inline-block rounded-full px-2 py-0.5 align-[2px] text-[11px] font-semibold ${
                      isCompany ? "bg-page text-ink-muted" : "bg-brand-50 text-brand-700"
                    }`}
                  >
                    {author.badge}
                  </span>
                )}
                {extras.length > 0 && <span className="text-[15px] text-ink-muted"> {extras.join(" · ")}</span>}
              </p>
              {author.headline && <p className="truncate text-[13px] text-ink-muted">{author.headline}</p>}
            </>
          )}
          <p className="truncate text-[13px] text-ink-subtle">
            <time dateTime={post.created_at}>{timeAgo(post.created_at)}</time>
            {post.edited && " · Editado"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {community && !post.is_mine && !joined && (
            <button
              type="button"
              onClick={join}
              disabled={joining}
              aria-label={`Unirme a ${community.name}`}
              className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full text-sm font-semibold text-brand-700 hover:bg-brand-50 sm:mr-1 sm:px-3"
            >
              <Plus className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden /> <span className="hidden sm:inline">Unirme</span>
            </button>
          )}
          {community && !post.is_mine && joined && (
            <button
              type="button"
              onClick={() => setConfirmLeave(true)}
              aria-label={`Estás en ${community.name}. Pulsa para salir`}
              className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full text-sm font-semibold text-ink-muted hover:bg-page hover:text-ink sm:mr-1 sm:px-3"
            >
              <Check className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden /> <span className="hidden sm:inline">Unido</span>
            </button>
          )}
          {!community && !post.is_mine && !following && (
            <button
              type="button"
              onClick={() => setFollow(true)}
              aria-label={`Seguir a ${author.name}`}
              className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full text-sm font-semibold text-brand-700 hover:bg-brand-50 sm:mr-1 sm:px-3"
            >
              <Plus className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden /> <span className="hidden sm:inline">Seguir</span>
            </button>
          )}
          {!community && !post.is_mine && following && (
            <button
              type="button"
              onClick={() => setConfirmUnfollow(true)}
              aria-label={`Siguiendo a ${author.name}. Pulsa para dejar de seguir`}
              className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full text-sm font-semibold text-ink-muted hover:bg-page hover:text-ink sm:mr-1 sm:px-3"
            >
              <Check className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden /> <span className="hidden sm:inline">Siguiendo</span>
            </button>
          )}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-label="Más opciones"
              aria-expanded={menu}
              onClick={() => setMenu((m) => !m)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-page hover:text-ink"
            >
              <MoreHorizontal className="h-5 w-5" aria-hidden />
            </button>
            {menu && (
              <div role="menu" className="absolute right-0 z-10 mt-1 w-52 overflow-hidden rounded-xl border border-line bg-card py-1 shadow-lg">
                <button role="menuitemcheckbox" aria-checked={saved} type="button" className={`${menuItem} ${saved ? "font-semibold" : ""}`} onClick={toggleSave}>
                  <Bookmark className={`h-4 w-4 ${saved ? "fill-ink text-ink" : ""}`} aria-hidden /> {saved ? "Guardado" : "Guardar"}
                </button>
                {!inModal && (
                  <button role="menuitem" type="button" className={menuItem} onClick={() => onHide?.(post.id)}>
                    <EyeOff className="h-4 w-4" aria-hidden /> No me interesa
                  </button>
                )}
                {!post.is_mine && (
                  <button role="menuitem" type="button" className={menuItem} onClick={report}>
                    <Flag className="h-4 w-4" aria-hidden /> Denunciar publicación
                  </button>
                )}
                {post.is_mine && (
                  <button role="menuitem" type="button" className={`${menuItem} text-danger hover:bg-red-50`} onClick={remove}>
                    <Trash2 className="h-4 w-4" aria-hidden /> Eliminar publicación
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 pb-3">
        {TYPE_LABEL[post.type] && (
          <span className="mb-1.5 inline-block rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-semibold text-accent-800">
            {TYPE_LABEL[post.type]}
          </span>
        )}
        <p
          ref={textRef}
          hidden={!post.content}
          className={`whitespace-pre-line leading-relaxed ${inModal && post.content.length < 90 && !post.media.length ? "text-xl" : "text-[15px]"} ${
            expanded ? "" : "line-clamp-3"
          }`}
        >
          {post.content}
        </p>
        {clamped && !expanded && (
          <button type="button" onClick={() => setExpanded(true)} className="mt-0.5 text-[15px] font-semibold text-ink-muted hover:text-ink hover:underline">
            …ver más
          </button>
        )}
      </div>

      <MediaGallery media={post.media} onOpen={openPost} full={inModal} />

      <footer className={`flex gap-1 px-2 py-1.5 ${inModal ? "" : "mt-1 border-t border-line"}`}>
        <button
          type="button"
          aria-pressed={liked}
          aria-label={`Me gusta${likes ? `: ${likes}` : ""}`}
          onClick={toggleLike}
          className={`${action} text-brand-700 hover:bg-brand-50 ${liked ? "bg-brand-50" : ""}`}
        >
          <span className="relative flex">
            <ThumbsUp
              key={`icon-${burst}`}
              className={`h-5 w-5 text-brand-700 ${liked ? "fill-brand-600" : ""} ${burst && liked ? "animate-like-pop" : ""}`}
              aria-hidden
            />
            {burst > 0 && liked && <LikeBurst key={`burst-${burst}`} />}
          </span>
          <span className="hidden sm:inline">Me gusta</span>
          {likes > 0 && <span className="tabular-nums">{likes}</span>}
        </button>
        <button
          type="button"
          onClick={openPost}
          aria-label={`Comentar${comments ? `: ${comments} comentarios` : ""}`}
          className={`${action} text-green-700 hover:bg-green-50`}
        >
          <MessageCircle className="h-5 w-5 text-green-600" aria-hidden />
          <span className="hidden sm:inline">Comentar</span>
          {comments > 0 && <span className="tabular-nums">{comments}</span>}
        </button>
        <button
          type="button"
          aria-pressed={shared}
          aria-label={`Compartir${shares ? `: ${shares} veces compartida` : ""}`}
          onClick={toggleShare}
          className={`${action} text-accent-800 hover:bg-accent-50 ${shared ? "bg-accent-50" : ""}`}
        >
          <span className="relative flex">
            <Repeat2
              key={`share-${shareBurst}`}
              className={`h-5 w-5 text-accent-800 ${shareBurst && shared ? "animate-share-spin" : ""}`}
              strokeWidth={shared ? 2.75 : 2}
              aria-hidden
            />
            {shareBurst > 0 && shared && <ShareBurst key={`sburst-${shareBurst}`} />}
          </span>
          <span className="hidden sm:inline">{shared ? "Compartido" : "Compartir"}</span>
          {shares > 0 && <span className="tabular-nums">{shares}</span>}
        </button>
        <button type="button" aria-label="Enviar" className={`${action} text-ink-muted hover:bg-page hover:text-ink`}>
          <Send className="h-5 w-5" aria-hidden />
          <span className="hidden sm:inline">Enviar</span>
        </button>
      </footer>

      {confirmLeave && community && (
        <UnfollowDialog
          kind={groupNoun(community.type) === "foro" ? "forum" : "group"}
          name={community.name}
          picture={<GroupCover src={community.cover_url} topic={coverTopic(community)} iconSize="sm" className="h-16 w-16 rounded-2xl" />}
          onConfirm={leave}
          onCancel={() => setConfirmLeave(false)}
        />
      )}

      {confirmUnfollow && (
        <UnfollowDialog
          name={author.name}
          avatarUrl={author.avatar_url}
          square={isCompany}
          onConfirm={() => setFollow(false)}
          onCancel={() => setConfirmUnfollow(false)}
        />
      )}

      {open && (
        <PostModal
          post={{ ...post, liked_by_me: liked, likes, shared_by_me: shared, shares, comments, saved_by_me: saved }}
          onClose={() => setOpen(false)}
          onUpdate={(p) => {
            setLiked(p.liked_by_me);
            setLikes(p.likes);
            setShared(p.shared_by_me);
            setShares(p.shares);
            setComments(p.comments);
            setSaved(p.saved_by_me);
            onUpdate?.(p);
          }}
          onDelete={(id) => {
            setOpen(false);
            onDelete?.(id);
          }}
        />
      )}
    </article>
  );
}
