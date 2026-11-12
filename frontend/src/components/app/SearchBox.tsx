"use client";

import { ArrowLeft, MessagesSquare, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api, type SearchResult } from "@/lib/api";
import { Avatar } from "../Avatar";

/**
 * Buscador de la barra superior. Al activarlo se oscurece el resto de la pantalla
 * para que la atención quede en la búsqueda.
 */
export function SearchBox({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults(null);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      api<SearchResult>(`/search?q=${encodeURIComponent(term)}`)
        .then(setResults)
        .catch(() => setResults({ users: [], communities: [] }))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const close = () => {
    onOpenChange(false);
    setQ("");
  };
  const empty = results && results.users.length === 0 && results.communities.length === 0;

  return (
    <>
      {open && (
        <div
          aria-hidden
          onClick={close}
          className="fixed inset-0 z-30 bg-black/45 backdrop-blur-[1px] transition-opacity"
          data-testid="search-overlay"
        />
      )}
      <div
        className={`${
          open
            ? "fixed inset-x-0 top-0 z-40 bg-card p-3 md:absolute md:inset-x-auto md:left-[68px] md:top-3 md:w-[420px] md:rounded-card md:p-2 md:shadow-xl"
            : "relative hidden w-72 md:block"
        }`}
      >
        <div className="flex items-center gap-2">
          {open && (
            <button type="button" onClick={close} aria-label="Cerrar búsqueda" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-page md:hidden">
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </button>
          )}
          <label className="relative block flex-1">
            <span className="sr-only">Buscar en StudyHub</span>
            <Search className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${open ? "text-ink-muted" : "text-field-text"}`} aria-hidden />
            <input
              ref={input}
              type="text"
              inputMode="search"
              enterKeyHint="search"
              role="searchbox"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => onOpenChange(true)}
              placeholder="Buscar personas, foros, empleo…"
              className={`h-10 w-full rounded-full border pl-10 pr-10 text-[15px] placeholder:text-ink-subtle focus:outline-none ${
                open ? "border-brand-600 bg-card ring-2 ring-brand-600/20" : "border-transparent bg-field text-field-text placeholder:!text-field-text hover:bg-field-hover"
              }`}
            />
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="Borrar búsqueda" className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted hover:bg-page">
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
          </label>
        </div>

        {open && (
          <div className="mt-2 max-h-[70vh] overflow-y-auto">
            {!q.trim() && <p className="px-3 py-4 text-sm text-ink-muted">Escribe un nombre, una empresa o una comunidad.</p>}
            {loading && !results && <p className="px-3 py-4 text-sm text-ink-muted">Buscando…</p>}
            {empty && <p className="px-3 py-4 text-sm text-ink-muted">No hay resultados para «{q.trim()}».</p>}
            {results && results.users.length > 0 && (
              <>
                <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Personas y empresas</p>
                <ul>
                  {results.users.map((u) => (
                    <li key={u.id}>
                      <Link href={`/perfil/${u.id}`} onClick={close} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-page">
                        <Avatar name={u.name} src={u.avatar_url} size="sm" square={u.role === "company"} />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{u.name}</span>
                          {u.headline && <span className="block truncate text-[13px] text-ink-muted">{u.headline}</span>}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {results && results.communities.length > 0 && (
              <>
                <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Comunidades</p>
                <ul>
                  {results.communities.map((c) => (
                    <li key={c.id}>
                      <Link href={`/social/grupo/${c.id}`} onClick={close} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-page">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                          <MessagesSquare className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{c.name}</span>
                          <span className="block text-[13px] text-ink-muted">
                            {c.members} {c.members === 1 ? "miembro" : "miembros"}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
