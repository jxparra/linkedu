"use client";

import { Camera, Loader2, SendHorizontal, Smile, X } from "lucide-react";
import Link from "next/link";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { api, ApiError, mediaUrl, uploadFile, type Comment, type User } from "@/lib/api";
import { Avatar } from "../Avatar";
import { displayName } from "../app/TopBar";

const EMOJIS = ["😀", "😂", "🥹", "😍", "😎", "🤔", "😅", "😭", "🙏", "👏", "💪", "🔥", "🎉", "❤️", "👍", "👀", "✨", "📚", "💻", "☕", "🚀", "✅", "😴", "🤯"];

type Props = {
  postId: number;
  me: User | null;
  parentId?: number;
  initialText?: string;
  placeholder?: string;
  autoFocus?: boolean;
  compact?: boolean;
  onSent: (c: Comment) => void;
  onCancel?: () => void;
};

/** Caja para escribir un comentario o una respuesta: texto, emojis, foto o GIF. Intro envía, Mayús+Intro hace salto de línea. */
export const CommentComposer = forwardRef<HTMLTextAreaElement | null, Props>(function CommentComposer(
  { postId, me, parentId, initialText = "", placeholder = "Escribe un comentario…", autoFocus, compact, onSent, onCancel },
  ref,
) {
  const [text, setText] = useState(initialText);
  const [image, setImage] = useState<{ url: string; preview: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => area.current as HTMLTextAreaElement);

  useEffect(() => {
    if (autoFocus && area.current) {
      area.current.focus();
      area.current.setSelectionRange(area.current.value.length, area.current.value.length);
    }
  }, [autoFocus]);

  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [text]);

  useEffect(() => {
    if (!emojiOpen) return;
    const close = (e: MouseEvent) => {
      if (!emojiRef.current?.contains(e.target as Node)) setEmojiOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [emojiOpen]);

  const insert = (emoji: string) => {
    const el = area.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    const next = text.slice(0, start) + emoji + text.slice(end);
    setText(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  const attach = async (f: File) => {
    setError(null);
    setUploading(true);
    const preview = URL.createObjectURL(f);
    setImage({ url: "", preview });
    try {
      const res = await uploadFile(f);
      setImage({ url: res.url, preview });
    } catch (e) {
      setImage(null);
      setError(e instanceof ApiError ? e.message : "No se ha podido subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  const canSend = !sending && !uploading && (text.trim().length > 0 || !!image?.url);

  const send = async () => {
    if (!canSend) return;
    setSending(true);
    setError(null);
    try {
      const c = await api<Comment>(`/posts/${postId}/comments`, {
        method: "POST",
        body: { content: text, parent_id: parentId ?? null, image_url: image?.url || null },
      });
      onSent(c);
      setText("");
      setImage(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se ha podido enviar el comentario.");
    } finally {
      setSending(false);
    }
  };

  const name = displayName(me);
  const iconBtn = "flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-line hover:text-ink";

  return (
    <div className="flex items-start gap-2">
      {me ? (
        <Link href="/perfil" aria-label="Ir a tu perfil" className="shrink-0">
          <Avatar name={name} size="sm" square={me.role === "company"} />
        </Link>
      ) : (
        <span className="h-9 w-9 shrink-0 rounded-full bg-page" />
      )}
      <div className="min-w-0 flex-1">
        <div className="rounded-card bg-page px-3 py-2 focus-within:ring-2 focus-within:ring-brand-600/30">
          <label className="block">
            <span className="sr-only">{parentId ? "Escribe una respuesta" : "Escribe un comentario"}</span>
            <textarea
              ref={area}
              rows={1}
              value={text}
              maxLength={2000}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                } else if (e.key === "Escape" && onCancel) {
                  e.stopPropagation();
                  onCancel();
                }
              }}
              placeholder={placeholder}
              className={`block w-full resize-none bg-transparent leading-snug placeholder:text-ink-subtle focus:outline-none ${compact ? "text-sm" : "text-[15px]"}`}
            />
          </label>
          {image && (
            <div className="relative mt-2 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url ? mediaUrl(image.url) : image.preview} alt="Imagen adjunta" className="max-h-32 rounded-card" />
              {uploading && (
                <span className="absolute inset-0 flex items-center justify-center rounded-card bg-card/60">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                </span>
              )}
              <button
                type="button"
                onClick={() => setImage(null)}
                aria-label="Quitar imagen"
                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-inverse"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}
          <div className="mt-1 flex items-center justify-between">
            <div className="flex items-center">
              <div ref={emojiRef} className="relative">
                <button type="button" onClick={() => setEmojiOpen((o) => !o)} aria-label="Añadir emoji" aria-expanded={emojiOpen} className={iconBtn}>
                  <Smile className="h-[18px] w-[18px]" aria-hidden />
                </button>
                {emojiOpen && (
                  <div className="absolute bottom-10 left-0 z-30 grid w-64 grid-cols-8 gap-0.5 rounded-card border border-line bg-card p-2 shadow-xl">
                    {EMOJIS.map((e) => (
                      <button key={e} type="button" onClick={() => insert(e)} className="flex h-7 w-7 items-center justify-center rounded-md text-lg hover:bg-page" aria-label={`Emoji ${e}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" onClick={() => file.current?.click()} aria-label="Añadir foto o GIF" className={iconBtn}>
                <Camera className="h-[18px] w-[18px]" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => file.current?.click()}
                aria-label="Añadir GIF"
                className="flex h-8 items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold text-ink-muted hover:bg-line hover:text-ink"
              >
                <span className="rounded border-[1.5px] border-current px-0.5 leading-[14px]">GIF</span>
              </button>
              <input
                ref={file}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) attach(f);
                  e.target.value = "";
                }}
              />
              {onCancel && (
                <button type="button" onClick={onCancel} className="ml-1 rounded-full px-2 text-xs font-semibold text-ink-muted hover:text-ink">
                  Cancelar
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={send}
              disabled={!canSend}
              aria-label={parentId ? "Enviar respuesta" : "Enviar comentario"}
              className="flex h-8 w-8 items-center justify-center rounded-full text-brand-700 hover:bg-brand-50 disabled:text-ink-subtle disabled:hover:bg-transparent"
            >
              {sending ? <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden /> : <SendHorizontal className="h-[18px] w-[18px]" aria-hidden />}
            </button>
          </div>
        </div>
        {error && <p className="mt-1 px-3 text-[13px] text-danger">{error}</p>}
      </div>
    </div>
  );
});
