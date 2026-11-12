"use client";

import { AlertCircle, Search } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { api, type Option } from "@/lib/api";

type Props = {
  label: string;
  placeholder: string;
  endpoint: string;
  value: Option | null;
  onChange: (o: Option | null) => void;
  error?: string;
  disabledHint?: string;
};

export function Autocomplete({ label, placeholder, endpoint, value, onChange, error, disabledHint }: Props) {
  const id = useId();
  const [query, setQuery] = useState(value?.name ?? "");
  const [options, setOptions] = useState<Option[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      api<Option[]>(`${endpoint}${endpoint.includes("?") ? "&" : "?"}q=${encodeURIComponent(query)}`)
        .then((o) => {
          setOptions(o);
          setActive(0);
        })
        .catch(() => setOptions([]));
    }, 150);
    return () => clearTimeout(t);
  }, [query, open, endpoint]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const pick = (o: Option) => {
    onChange(o);
    setQuery(o.name);
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-invalid={!!error}
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          onFocus={() => !disabledHint && setOpen(true)}
          readOnly={!!disabledHint}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(null);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, options.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && open && options[active]) {
              e.preventDefault();
              pick(options[active]);
            } else if (e.key === "Escape") setOpen(false);
          }}
          className={`h-12 w-full rounded-input border bg-white pl-10 pr-3.5 text-[15px] placeholder:text-ink-subtle focus:outline-none focus:ring-2 ${
            error
              ? "border-danger focus:ring-danger/20"
              : "border-line hover:border-ink-subtle focus:border-brand-600 focus:ring-brand-600/20"
          }`}
        />
      </div>
      {open && options.length > 0 && (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-input border border-line bg-white py-1 shadow-lg"
        >
          {options.map((o, i) => (
            <li
              key={o.id}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(o);
              }}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer px-3.5 py-2.5 text-[15px] ${i === active ? "bg-brand-50 text-brand-700" : ""}`}
            >
              {o.name}
            </li>
          ))}
        </ul>
      )}
      {disabledHint && !error && <p className="mt-1.5 text-[13px] text-ink-muted">{disabledHint}</p>}
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
