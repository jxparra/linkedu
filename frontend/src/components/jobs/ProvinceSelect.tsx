"use client";

import { Check, ChevronDown, MapPin } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ABROAD, ALL_SPAIN, COMMON_PROVINCES, PROVINCES } from "@/lib/jobs";

type Item = { value: string; label: string } | { heading: string };

/**
 * Desplegable de provincias como el del boceto: "Toda España", "El extranjero",
 * las más comunes y después todas por orden alfabético.
 */
export function ProvinceSelect({
  value,
  onChange,
  labelledBy,
  withAll = true,
  inline = false,
  className = "",
}: {
  /** Dentro de la barra de búsqueda de Empleo: sin borde propio, con el icono de lugar delante */
  inline?: boolean;
  value: string;
  onChange: (v: string) => void;
  labelledBy?: string;
  withAll?: boolean;
  className?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const items = useMemo<Item[]>(() => {
    const list: Item[] = [];
    if (withAll) list.push({ value: ALL_SPAIN, label: "Toda España" });
    list.push({ value: ABROAD, label: "El extranjero" });
    list.push({ heading: "Más comunes" });
    COMMON_PROVINCES.forEach((p) => list.push({ value: p, label: p }));
    list.push({ heading: "Todas las provincias" });
    PROVINCES.forEach((p) => list.push({ value: p, label: p }));
    return list;
  }, [withAll]);

  const options = items.filter((i): i is { value: string; label: string } => "value" in i);
  const label = options.find((o) => o.value === value)?.label ?? (value || "Elige provincia");

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (!open) return;
    const i = Math.max(0, options.findIndex((o) => o.value === value));
    setActive(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const onKey = (e: KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(options[active].value);
    } else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
    } else if (/^\p{L}$/u.test(e.key)) {
      // Saltar a la primera provincia que empieza por esa letra
      const i = options.findIndex((o, n) => n > 2 && o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (i >= 0) setActive(i);
    }
  };

  let index = -1;
  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-labelledby={labelledBy ? `${labelledBy} ${id}-value` : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKey}
        className={
          inline
            ? `flex h-12 w-full items-center gap-2 rounded-btn px-3 text-left text-[15px] transition-colors ${open ? "bg-field-hover" : "hover:bg-field-hover"}`
            : `flex w-full items-center justify-between gap-2 border bg-card text-left transition-colors ${
                "h-12 rounded-input px-3.5 text-[15px]"
              } ${open ? "border-brand-600 ring-2 ring-brand-600/20" : "border-edge hover:border-ink-subtle"}`
        }
      >
        {inline && <MapPin className="h-5 w-5 shrink-0 text-ink-subtle" aria-hidden />}
        <span id={`${id}-value`} className={`${inline ? "flex-1 " : ""}truncate ${value ? "text-ink" : "text-ink-subtle"}`}>
          {label}
        </span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          aria-activedescendant={`${id}-opt-${active}`}
          className="pop-in absolute inset-x-0 top-full z-30 mt-0.5 max-h-60 overflow-y-auto rounded-input border border-line bg-card py-1 shadow-lg"
        >
          {items.map((item) => {
            if ("heading" in item) {
              return (
                <li
                  key={item.heading}
                  role="presentation"
                  className="px-3.5 pb-1 pt-2.5 text-[12px] font-semibold text-ink-subtle"
                >
                  {item.heading}
                </li>
              );
            }
            index += 1;
            const i = index;
            const selected = item.value === value;
            return (
              <li
                key={`${item.value}-${i}`}
                id={`${id}-opt-${i}`}
                data-index={i}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(item.value)}
                className={`flex min-h-10 items-center justify-between px-3.5 text-[15px] ${i === active ? "bg-page" : ""} ${
                  selected ? "font-semibold text-brand-700" : "text-ink"
                }`}
              >
                {item.label}
                {selected && <Check className="h-4 w-4" aria-hidden />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
