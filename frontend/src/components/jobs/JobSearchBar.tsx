"use client";

import { Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { api } from "@/lib/api";
import { ALL_SPAIN, CATEGORIES } from "@/lib/jobs";
import { ProvinceSelect } from "./ProvinceSelect";

type Suggestion = { kind: "text" | "occupation" | "category"; value: string };

const MIN_CHARS = 2;

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/**
 * Buscador de Empleo copiado del boceto: todo en una fila, sin tarjeta, etiqueta encima de cada campo.
 * El campo "Busco oferta de..." no enseña ninguna lista al entrar: las sugerencias van saliendo conforme escribes
 * (desde 2 letras), como en InfoJobs. Los puestos vienen de ESCO, la clasificación europea de ocupaciones
 * (ver backend/app/services/occupations.py), y además se sugieren las categorías que coinciden.
 */
export function JobSearchBar({
  q,
  province,
  category,
  onSearch,
}: {
  q: string;
  province: string;
  category: string | null;
  onSearch: (q: string, province: string, category: string | null) => void;
}) {
  const id = useId();
  const [text, setText] = useState(category ?? q);
  const [cat, setCat] = useState<string | null>(category);
  const [place, setPlace] = useState(province || ALL_SPAIN);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [occupations, setOccupations] = useState<string[]>([]);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Si cambia la URL (atrás/adelante del navegador), se actualizan los campos
  useEffect(() => {
    setText(category ?? q);
    setCat(category);
  }, [q, category]);
  useEffect(() => setPlace(province || ALL_SPAIN), [province]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const typedEnough = text.trim().length >= MIN_CHARS && !cat;

  // Pide los puestos al backend un momento después de dejar de escribir
  useEffect(() => {
    if (!open || !typedEnough) {
      setOccupations([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      api<{ items: string[]; source: string }>(`/catalog/occupations?q=${encodeURIComponent(text.trim())}`)
        .then((r) => {
          setOccupations(r.items);
          setSource(r.source);
        })
        .catch(() => setOccupations([]))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [text, open, typedEnough]);

  const groups = useMemo(() => {
    if (!typedEnough) return { typed: [], occupations: [], categories: [] };
    const t = norm(text.trim());
    return {
      typed: [{ kind: "text", value: text.trim() } as Suggestion],
      occupations: occupations.map((value) => ({ kind: "occupation", value }) as Suggestion),
      categories: CATEGORIES.filter((c) => norm(c).includes(t))
        .slice(0, 4)
        .map((value) => ({ kind: "category", value }) as Suggestion),
    };
  }, [text, typedEnough, occupations]);
  const flat = [...groups.typed, ...groups.occupations, ...groups.categories];

  useEffect(() => {
    if (open && active >= 0) listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const pick = (s: Suggestion) => {
    setOpen(false);
    setActive(-1);
    setText(s.value);
    if (s.kind === "category") {
      setCat(s.value);
      onSearch("", place, s.value);
    } else {
      setCat(null);
      onSearch(s.value, place, null);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setOpen(false);
    if (cat && text === cat) onSearch("", place, cat);
    else onSearch(text.trim(), place, null);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === "Enter" && open && active >= 0 && flat[active]) {
      e.preventDefault();
      pick(flat[active]);
    } else if (e.key === "Escape" || e.key === "Tab") setOpen(false);
  };

  let index = -1;
  const renderGroup = (title: string | null, items: Suggestion[]) =>
    items.length > 0 && (
      <li role="presentation" key={title ?? "typed"}>
        {title && <p className="px-2.5 pt-1.5 text-[10px] text-ink-muted">{title}</p>}
        <ul role="group" aria-label={title ?? "Tu búsqueda"}>
          {items.map((s) => {
            index += 1;
            const i = index;
            return (
              <li
                key={`${s.kind}-${s.value}`}
                id={`${id}-sug-${i}`}
                data-index={i}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(s);
                }}
                className={`flex min-h-[30px] items-center gap-2 px-2.5 text-[17px] font-semibold ${i === active ? "bg-page text-ink" : "text-ink-muted"}`}
              >
                {s.kind === "text" && <Search className="h-4 w-4 shrink-0" aria-hidden />}
                <span className="truncate">{s.kind === "text" ? `Buscar «${s.value}»` : s.value}</span>
              </li>
            );
          })}
        </ul>
      </li>
    );

  return (
    <form role="search" onSubmit={submit}>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-0">
        <div ref={boxRef} className="relative md:w-[300px] md:shrink-0">
          <label htmlFor={`${id}-q`} className="mb-1.5 block text-[17px] font-semibold text-ink-muted">
            Busco oferta de...
          </label>
          <input
            id={`${id}-q`}
            type="search"
            role="combobox"
            aria-expanded={open}
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            aria-activedescendant={open && active >= 0 ? `${id}-sug-${active}` : undefined}
            autoComplete="off"
            value={text}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onChange={(e) => {
              setText(e.target.value);
              setCat(null);
              setActive(-1);
              setOpen(true);
            }}
            onKeyDown={onKey}
            placeholder="Puesto"
            maxLength={100}
            className="h-[45px] w-full rounded-[3px] border border-ink-subtle bg-white px-2.5 text-[17px] font-semibold text-ink placeholder:text-ink-muted focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
          />
          {open && typedEnough && (
            <ul
              ref={listRef}
              id={`${id}-list`}
              role="listbox"
              className="absolute inset-x-0 top-full z-30 mt-0.5 max-h-72 overflow-y-auto rounded-[3px] border border-ink-subtle bg-white py-1"
            >
              {renderGroup(null, groups.typed)}
              {renderGroup("Puestos", groups.occupations)}
              {renderGroup("Categorías", groups.categories)}
              {loading && occupations.length === 0 && (
                <li role="presentation" className="px-2.5 py-1.5 text-sm text-ink-muted">
                  Buscando puestos…
                </li>
              )}
              {source === "esco" && occupations.length > 0 && (
                <li role="presentation" className="border-t border-line px-2.5 pt-1.5 text-[10px] text-ink-muted">
                  Puestos: clasificación europea ESCO
                </li>
              )}
            </ul>
          )}
        </div>
        <div className="md:ml-14 md:w-[320px] md:shrink-0">
          <span id={`${id}-place`} className="mb-1.5 block text-[17px] font-semibold text-ink-muted">
            En...
          </span>
          <ProvinceSelect value={place} onChange={setPlace} labelledBy={`${id}-place`} flat />
        </div>
        <button
          type="submit"
          className="h-[45px] rounded-[3px] bg-brand-600 px-9 text-[17px] font-bold uppercase text-white transition-colors hover:bg-brand-700 md:mb-[3px] md:ml-10"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
