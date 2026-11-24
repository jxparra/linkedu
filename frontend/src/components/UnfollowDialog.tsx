"use client";

import { LogOut, UserMinus } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Avatar } from "./Avatar";

/**
 * Panel de advertencia antes de dejar de seguir a alguien (kind="person", por defecto)
 * o de salir de un grupo o foro (kind="group" | "forum").
 * Para grupos y foros, `picture` es la portada que se muestra arriba y `note` un aviso extra (p. ej. si eres administrador).
 */
export function UnfollowDialog({
  name,
  avatarUrl,
  square = false,
  kind = "person",
  picture,
  note,
  onConfirm,
  onCancel,
}: {
  name: string;
  avatarUrl?: string | null;
  square?: boolean;
  kind?: "person" | "group" | "forum";
  picture?: ReactNode;
  note?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const person = kind === "person";
  const noun = kind === "forum" ? "foro" : "grupo";

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unfollow-title"
        aria-describedby="unfollow-text"
        className="w-full max-w-sm rounded-card bg-card p-6 text-center shadow-xl"
      >
        <span className="mx-auto block w-fit">{picture ?? <Avatar name={name} src={avatarUrl} size="lg" square={square} />}</span>
        <h2 id="unfollow-title" className="mt-4 text-xl font-bold">
          {person ? `¿Dejar de seguir a ${name}?` : `¿Salir de «${name}»?`}
        </h2>
        <p id="unfollow-text" className="mt-1.5 text-[15px] text-ink-muted">
          {person
            ? "Sus publicaciones dejarán de salir en tu inicio. Podrás volver a seguirle cuando quieras."
            : `Sus publicaciones dejarán de salir en tu feed. Podrás volver a unirte al ${noun} cuando quieras.`}
          {note && <span className="mt-2 block font-medium text-ink">{note}</span>}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-btn bg-danger px-6 font-semibold text-on-danger transition-opacity hover:opacity-90"
          >
            {person ? <UserMinus className="h-4 w-4" aria-hidden /> : <LogOut className="h-4 w-4" aria-hidden />}
            {person ? "Dejar de seguir" : `Salir del ${noun}`}
          </button>
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-btn border border-line px-6 font-semibold text-ink transition-colors hover:border-ink-subtle"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
