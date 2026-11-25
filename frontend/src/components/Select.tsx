"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

export type SelectOption = { value: string; label: string };
/** Una opción o un encabezado de grupo (como <optgroup>): los encabezados no se pueden elegir */
export type SelectItem = SelectOption | { heading: string };

/**
 * Desplegable propio (el mismo aspecto que el de provincias), en lugar del <select> del navegador.
 * Teclado: flechas, Inicio/Fin, Enter o espacio para elegir, Escape para cerrar y una letra para saltar.
 */
export function Select({
  value,
  onChange,
  options: items,
  placeholder = "Elige una opción",
  id: idProp,
  ariaLabel,
  labelledBy,
  invalid = false,
  className = "",
  buttonClassName = "h-12",
  tone = "default",
}: {
  /** default: campo normal · board: sobre la cabecera oscura (Estadísticas) · bare: sin borde, el color lo pone buttonClassName */
  tone?: "default" | "board" | "bare";
  value: string;
  onChange: (v: string) => void;
  options: SelectItem[];
  placeholder?: string;
  /** id del botón, para enlazarlo con un <label htmlFor> */
  id?: string;
  ariaLabel?: string;
  labelledBy?: string;
  invalid?: boolean;
  className?: string;
  buttonClassName?: string;
}) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const options = items.filter((i): i is SelectOption => "value" in i);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !boxRef.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const openList = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const onKey = (e: KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      setActive(e.key === "Home" ? 0 : options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (options[active]) pick(options[active].value);
    } else if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") e.preventDefault();
      setOpen(false);
    } else if (/^\p{L}$/u.test(e.key)) {
      const i = options.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (i >= 0) setActive(i);
    }
  };

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        aria-invalid={invalid || undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKey}
        className={`flex w-full items-center justify-between gap-2 rounded-input px-3.5 text-left text-[15px] transition-colors ${buttonClassName} ${
          tone === "board"
            ? `border bg-board text-spine-strong focus-visible:outline-mark ${open ? "border-spine-strong" : "border-spine-ink hover:border-spine-strong"}`
            : tone === "bare"
              ? "border-0"
              : `border bg-card ${open ? "border-brand-600 ring-2 ring-brand-600/20" : invalid ? "border-danger" : "border-edge hover:border-ink-subtle"}`
        }`}
      >
        <span className={`truncate ${tone !== "default" ? "" : current ? "text-ink" : "text-ink-subtle"}`}>{current?.label ?? placeholder}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${tone === "default" ? "text-ink-muted" : ""} ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          className="pop-in absolute inset-x-0 top-full z-30 mt-1 max-h-64 min-w-max overflow-y-auto rounded-input border border-line bg-card py-1 shadow-lg"
        >
          {(() => {
            let i = -1;
            return items.map((item, k) => {
              if (!("value" in item)) {
                return (
                  <li key={`h-${k}`} role="presentation" className="px-3.5 pb-1 pt-2.5 text-[12px] font-semibold text-ink-subtle">
                    {item.heading}
                  </li>
                );
              }
              i += 1;
              const o = item;
              const index = i;
              const selected = o.value === value && options.findIndex((x) => x.value === value) === index;
              return (
                <li
                  key={`${o.value}-${k}`}
                  id={`${id}-opt-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={selected}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(o.value)}
                  onMouseEnter={() => setActive(index)}
                  className={`flex min-h-10 cursor-pointer items-center justify-between gap-3 px-3.5 text-[15px] ${index === active ? "bg-page" : ""} ${
                    selected ? "font-semibold text-brand-700" : "text-ink"
                  }`}
                >
                  {o.label}
                  {selected && <Check className="h-4 w-4 shrink-0" aria-hidden />}
                </li>
              );
            });
          })()}
        </ul>
      )}
    </div>
  );
}
