"use client";

import { CATEGORIES, JOB_TYPES, MODALITIES, POSTED, SCHEDULES } from "@/lib/jobs";

export type Filters = {
  type: string[];
  modality: string[];
  schedule: string[];
  category: string[];
  posted: string; // "" = cualquier fecha
  for_me: boolean;
};

export const EMPTY_FILTERS: Filters = { type: [], modality: [], schedule: [], category: [], posted: "", for_me: false };

export function activeFilters(f: Filters): number {
  return f.type.length + f.modality.length + f.schedule.length + f.category.length + (f.posted ? 1 : 0) + (f.for_me ? 1 : 0);
}

type ListKey = "type" | "modality" | "schedule" | "category";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-line py-4 last:border-0">
      <legend className="float-left mb-2 w-full text-[15px] font-semibold">{title}</legend>
      <div className="clear-both space-y-0.5">{children}</div>
    </fieldset>
  );
}

function Option({
  type,
  name,
  label,
  count,
  checked,
  onChange,
}: {
  type: "checkbox" | "radio";
  name: string;
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  const empty = count === 0 && !checked;
  return (
    <label className={`flex min-h-9 items-center gap-2.5 rounded-btn px-1 text-[15px] hover:bg-page ${empty ? "text-ink-subtle" : "text-ink"}`}>
      <input type={type} name={name} checked={checked} onChange={onChange} className="h-[18px] w-[18px] shrink-0 accent-brand-600" />
      <span className="min-w-0 flex-1">{label}</span>
      {count !== undefined && <span className="text-sm text-ink-muted">{count}</span>}
    </label>
  );
}

/** Filtros de la búsqueda, con el número de ofertas de cada opción (como la columna izquierda de InfoJobs). */
export function JobFilters({
  filters,
  facets,
  onChange,
  isStudent,
}: {
  filters: Filters;
  facets: Record<string, Record<string, number>>;
  onChange: (f: Filters) => void;
  isStudent: boolean;
}) {
  const toggle = (key: ListKey, value: string) => {
    const list = filters[key];
    onChange({ ...filters, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };

  const checkboxes = (key: ListKey, options: Record<string, string>) =>
    Object.entries(options).map(([value, label]) => (
      <Option
        key={value}
        type="checkbox"
        name={key}
        label={label}
        count={facets[key]?.[value] ?? 0}
        checked={filters[key].includes(value)}
        onChange={() => toggle(key, value)}
      />
    ));

  const categories = Object.fromEntries(
    CATEGORIES.filter((c) => (facets.category?.[c] ?? 0) > 0 || filters.category.includes(c)).map((c) => [c, c]),
  );

  return (
    // Va dentro del panel lateral de Empleo, que ya pone el título «Filtros»: aquí solo el marco y «Limpiar»
    <div className="rounded-card border border-line bg-card px-4">
      {activeFilters(filters) > 0 && (
        <div className="flex justify-end border-b border-line py-2">
          <button type="button" onClick={() => onChange(EMPTY_FILTERS)} className="min-h-11 px-2 text-sm font-semibold text-brand-700 hover:underline">
            Limpiar filtros
          </button>
        </div>
      )}

      {isStudent && (
        <Group title="Recomendadas">
          <Option type="checkbox" name="for_me" label="Para mis estudios" checked={filters.for_me} onChange={() => onChange({ ...filters, for_me: !filters.for_me })} />
        </Group>
      )}

      <Group title="Fecha de publicación">
        <Option type="radio" name="posted" label="Cualquier fecha" checked={!filters.posted} onChange={() => onChange({ ...filters, posted: "" })} />
        {Object.entries(POSTED).map(([value, label]) => (
          <Option
            key={value}
            type="radio"
            name="posted"
            label={label}
            count={facets.posted?.[value] ?? 0}
            checked={filters.posted === value}
            onChange={() => onChange({ ...filters, posted: value })}
          />
        ))}
      </Group>

      <Group title="Tipo de contrato">{checkboxes("type", JOB_TYPES)}</Group>
      <Group title="Modalidad">{checkboxes("modality", MODALITIES)}</Group>
      <Group title="Jornada">{checkboxes("schedule", SCHEDULES)}</Group>
      {Object.keys(categories).length > 0 && <Group title="Categoría">{checkboxes("category", categories)}</Group>}
    </div>
  );
}
