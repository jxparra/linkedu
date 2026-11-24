"use client";

import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Options = {
  title: string;
  text: string;
  /** Texto del botón que confirma: un verbo concreto («Eliminar grupo», «Retirar candidatura») */
  action: string;
  icon?: ReactNode;
};

/**
 * Confirmación antes de una acción que no se puede deshacer (eliminar, retirar).
 * Sustituye a `window.confirm`: mismo aspecto que UnfollowDialog, foco en «Cancelar» y Esc para cerrar.
 *
 *   const { confirm, dialog } = useConfirm();
 *   if (!(await confirm({ title, text, action }))) return;
 *   …
 *   return <>{…}{dialog}</>;
 */
export function useConfirm() {
  const [open, setOpen] = useState<(Options & { resolve: (ok: boolean) => void }) | null>(null);

  const confirm = useCallback((o: Options) => new Promise<boolean>((resolve) => setOpen({ ...o, resolve })), []);
  const close = useCallback(
    (ok: boolean) =>
      setOpen((cur) => {
        cur?.resolve(ok);
        return null;
      }),
    [],
  );

  const dialog = open ? <ConfirmDialog {...open} onConfirm={() => close(true)} onCancel={() => close(false)} /> : null;
  return { confirm, dialog };
}

function ConfirmDialog({ title, text, action, icon, onConfirm, onCancel }: Options & { onConfirm: () => void; onCancel: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-text"
        className="w-full max-w-sm rounded-card bg-card p-6 text-center shadow-xl"
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-danger" aria-hidden>
          {icon ?? <Trash2 className="h-5 w-5" />}
        </span>
        <h2 id="confirm-title" className="mt-4 text-xl font-bold">
          {title}
        </h2>
        <p id="confirm-text" className="mt-1.5 text-[15px] text-ink-muted">
          {text}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-btn bg-danger px-6 font-semibold text-on-danger transition-opacity hover:opacity-90"
          >
            {action}
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
