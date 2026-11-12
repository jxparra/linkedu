"use client";

import { UserMinus } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Avatar } from "./Avatar";

/** Panel de advertencia antes de dejar de seguir a alguien. */
export function UnfollowDialog({
  name,
  avatarUrl,
  square = false,
  onConfirm,
  onCancel,
}: {
  name: string;
  avatarUrl?: string | null;
  square?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

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
        className="w-full max-w-sm rounded-card bg-white p-6 text-center shadow-xl"
      >
        <span className="mx-auto block w-fit">
          <Avatar name={name} src={avatarUrl} size="lg" square={square} />
        </span>
        <h2 id="unfollow-title" className="mt-4 text-xl font-semibold">
          ¿Dejar de seguir a {name}?
        </h2>
        <p id="unfollow-text" className="mt-1.5 text-[15px] text-ink-muted">
          Sus publicaciones dejarán de salir en tu inicio. Podrás volver a seguirle cuando quieras.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-danger px-6 font-semibold text-white transition-colors hover:bg-red-700"
          >
            <UserMinus className="h-4 w-4" aria-hidden />
            Dejar de seguir
          </button>
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-full border border-line px-6 font-semibold text-ink transition-colors hover:border-ink-subtle"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
