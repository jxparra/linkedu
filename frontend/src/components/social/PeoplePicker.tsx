"use client";

import { Check, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { api, mediaUrl, type Author, type SearchResult } from "@/lib/api";
import { Avatar } from "../Avatar";

/** Buscar personas y elegir varias (invitar a un grupo). */
export function PeoplePicker({
  value,
  onChange,
  exclude = [],
  label = "Invita a personas (opcional)",
}: {
  value: Author[];
  onChange: (people: Author[]) => void;
  exclude?: number[];
  label?: string;
}) {
  const id = useId();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Author[]>([]);
  const excludeKey = exclude.join(","); // una lista nueva en cada render no debe repetir la búsqueda

  useEffect(() => {
    const text = q.trim();
    if (text.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      api<SearchResult>(`/search?q=${encodeURIComponent(text)}`)
        .then((r) => setResults(r.users.filter((u) => !excludeKey.split(",").includes(String(u.id)))))
        .catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(t);
  }, [q, excludeKey]);

  const picked = new Set(value.map((p) => p.id));
  const toggle = (p: Author) => onChange(picked.has(p.id) ? value.filter((x) => x.id !== p.id) : [...value, p]);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {value.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {value.map((p) => (
            <li key={p.id} className="flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1 text-sm font-semibold text-brand-700">
              {p.name}
              <button type="button" onClick={() => toggle(p)} aria-label={`Quitar a ${p.name}`} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-card">
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id={id}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Escribe un nombre o @usuario"
        autoComplete="off"
        className="h-12 w-full rounded-input border border-line bg-card px-3.5 text-[15px] placeholder:text-ink-subtle hover:border-ink-subtle focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
      />
      {results.length > 0 && (
        <ul className="mt-1 max-h-60 overflow-y-auto rounded-card border border-line bg-card p-1">
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => toggle(p)}
                aria-pressed={picked.has(p.id)}
                className="flex min-h-12 w-full items-center gap-3 rounded-btn px-2 text-left hover:bg-page"
              >
                <Avatar name={p.name} src={p.avatar_url ? mediaUrl(p.avatar_url) : null} size="sm" square={p.role === "company"} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{p.name}</span>
                  {p.headline && <span className="block truncate text-[13px] text-ink-muted">{p.headline}</span>}
                </span>
                {picked.has(p.id) && <Check className="h-5 w-5 text-brand-700" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
