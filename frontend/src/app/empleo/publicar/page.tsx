"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Autocomplete } from "@/components/Autocomplete";
import { Button } from "@/components/Button";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Field } from "@/components/Field";
import { ProvinceSelect } from "@/components/jobs/ProvinceSelect";
import { api, ApiError, type Option, type User } from "@/lib/api";
import { CATEGORIES, JOB_TYPES, MODALITIES, SCHEDULES, type Job } from "@/lib/jobs";

type Form = {
  title: string;
  category: string;
  type: string;
  schedule: string;
  modality: string;
  province: string;
  location: string;
  pay: string;
  pay_period: string;
  vacancies: string;
  degree: Option | null;
  deadline: string;
  description: string;
  requirements: string;
};

const EMPTY: Form = {
  title: "",
  category: "",
  type: "puntual",
  schedule: "parcial",
  modality: "presencial",
  province: "",
  location: "",
  pay: "",
  pay_period: "hora",
  vacancies: "1",
  degree: null,
  deadline: "",
  description: "",
  requirements: "",
};

const inputCls =
  "w-full rounded-input border border-line bg-white px-3.5 text-[15px] text-ink placeholder:text-ink-subtle transition-colors hover:border-ink-subtle focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20";

function Label({ htmlFor, children, optional }: { htmlFor?: string; children: ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
      {children} {optional && <span className="font-normal text-ink-muted">(opcional)</span>}
    </label>
  );
}

function Select({ id, label, value, onChange, options, placeholder }: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Record<string, string>;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} h-12`}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {Object.entries(options).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}

function fromJob(j: Job): Form {
  return {
    title: j.title,
    category: j.category ?? "",
    type: j.type,
    schedule: j.schedule ?? "parcial",
    modality: j.modality ?? "presencial",
    province: j.province ?? "",
    location: j.location ?? "",
    pay: j.pay !== null ? String(j.pay) : "",
    pay_period: j.pay_period ?? "hora",
    vacancies: String(j.vacancies),
    degree: j.degree,
    deadline: j.deadline ?? "",
    description: j.description,
    requirements: j.requirements ?? "",
  };
}

function JobForm({ initial, editId }: { initial: Form; editId: number | null }) {
  const router = useRouter();
  const [f, setF] = useState<Form>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  const validate = () => {
    const e: typeof errors = {};
    if (f.title.trim().length < 3) e.title = "Escribe el puesto (mínimo 3 letras).";
    if (!f.category) e.category = "Elige una categoría.";
    if (!f.province) e.province = "Elige la provincia (o «El extranjero»).";
    if (f.description.trim().length < 20) e.description = "Describe la oferta con al menos 20 caracteres.";
    if (f.pay && Number(f.pay) < 0) e.pay = "El sueldo no puede ser negativo.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError(null);
    const body = {
      title: f.title.trim(),
      category: f.category,
      type: f.type,
      schedule: f.schedule,
      modality: f.modality,
      province: f.province,
      location: f.location.trim() || null,
      pay: f.pay ? Number(f.pay) : null,
      pay_period: f.pay ? f.pay_period : null,
      vacancies: Number(f.vacancies) || 1,
      degree_id: f.degree?.id ?? null,
      deadline: f.deadline || null,
      description: f.description.trim(),
      requirements: f.requirements.trim() || null,
    };
    try {
      const job = await api<Job>(editId ? `/jobs/${editId}` : "/jobs", { method: editId ? "PUT" : "POST", body });
      router.push(`/empleo/${job.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se ha podido guardar la oferta.");
      setSaving(false);
    }
  };

  const fieldError = (k: keyof Form) =>
    errors[k] ? (
      <p className="mt-1.5 text-[13px] text-danger" role="alert">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <section className="space-y-4 rounded-card border border-line bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold">El puesto</h2>
        <Field label="Puesto" value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Ej.: Camarero/a fines de semana" maxLength={150} error={errors.title} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Select id="cat" label="Categoría" value={f.category} onChange={(v) => set("category", v)} placeholder="Elige una categoría" options={Object.fromEntries(CATEGORIES.map((c) => [c, c]))} />
            {fieldError("category")}
          </div>
          <Select id="type" label="Tipo de contrato" value={f.type} onChange={(v) => set("type", v)} options={JOB_TYPES} />
          <Select id="schedule" label="Jornada" value={f.schedule} onChange={(v) => set("schedule", v)} options={SCHEDULES} />
          <Field label="Vacantes" type="number" min={1} max={100} value={f.vacancies} onChange={(e) => set("vacancies", e.target.value)} />
        </div>
      </section>

      <section className="space-y-4 rounded-card border border-line bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Dónde</h2>
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">Modalidad</legend>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MODALITIES).map(([v, l]) => (
              <label
                key={v}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[15px] font-semibold transition-colors ${
                  f.modality === v ? "border-brand-600 bg-brand-50 text-brand-700" : "border-line hover:border-ink-subtle"
                }`}
              >
                <input type="radio" name="modality" value={v} checked={f.modality === v} onChange={() => set("modality", v)} className="sr-only" />
                {l}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span id="prov-label" className="mb-1.5 block text-sm font-medium">
              Provincia
            </span>
            <ProvinceSelect value={f.province} onChange={(v) => set("province", v)} labelledBy="prov-label" withAll={false} />
            {fieldError("province")}
          </div>
          <Field label="Ciudad (opcional)" value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Ej.: Granada" maxLength={120} />
        </div>
      </section>

      <section className="space-y-4 rounded-card border border-line bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Condiciones</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="pay" optional>
              Sueldo (€)
            </Label>
            <div className="flex gap-2">
              <input id="pay" type="number" min={0} step="0.5" inputMode="decimal" value={f.pay} onChange={(e) => set("pay", e.target.value)} placeholder="Ej.: 10" className={`${inputCls} h-12`} />
              <select aria-label="Periodo del sueldo" value={f.pay_period} onChange={(e) => set("pay_period", e.target.value)} className={`${inputCls} h-12 w-36 shrink-0`}>
                <option value="hora">por hora</option>
                <option value="mes">al mes</option>
                <option value="total">en total</option>
              </select>
            </div>
            {fieldError("pay")}
          </div>
          <Field label="Inscripciones hasta (opcional)" type="date" value={f.deadline} onChange={(e) => set("deadline", e.target.value)} />
        </div>
        <Autocomplete
          label="Estudios recomendados (opcional)"
          placeholder="Ej.: Desarrollo de Aplicaciones Web"
          endpoint="/catalog/degrees"
          value={f.degree}
          onChange={(o) => set("degree", o)}
        />
        <p className="-mt-2 text-[13px] text-ink-muted">Se recomendará la oferta a quienes estudian esto.</p>
      </section>

      <section className="space-y-4 rounded-card border border-line bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Descripción</h2>
        <div>
          <Label htmlFor="desc">Qué hay que hacer</Label>
          <textarea
            id="desc"
            rows={6}
            maxLength={5000}
            value={f.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Tareas, horario, fechas, dónde es…"
            className={`${inputCls} resize-y py-3`}
          />
          {fieldError("description")}
        </div>
        <div>
          <Label htmlFor="req" optional>
            Requisitos
          </Label>
          <textarea
            id="req"
            rows={4}
            maxLength={3000}
            value={f.requirements}
            onChange={(e) => set("requirements", e.target.value)}
            placeholder={"Uno por línea. Ej.:\nEstar cursando DAW\nDisponibilidad los sábados"}
            className={`${inputCls} resize-y py-3`}
          />
        </div>
      </section>

      <ErrorBanner message={error} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          {editId ? "Guardar cambios" : "Publicar oferta"}
        </Button>
      </div>
    </form>
  );
}

function Publicar({ user }: { user: User }) {
  const params = useSearchParams();
  const editId = Number(params.get("editar")) || null;
  const [initial, setInitial] = useState<Form | null>(editId ? null : EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editId) return;
    api<Job>(`/jobs/${editId}`)
      .then((j) => (j.is_mine ? setInitial(fromJob(j)) : setError("Solo puedes editar tus propias ofertas.")))
      .catch(() => setError("No encontramos esa oferta."));
  }, [editId]);

  if (user.role !== "company") {
    return (
      <div className="rounded-card border border-line bg-white p-10 text-center">
        <h1 className="text-xl font-semibold">Publicar ofertas es para empresas</h1>
        <p className="mt-1 text-ink-muted">Con tu cuenta de estudiante puedes buscar ofertas e inscribirte.</p>
        <Link href="/empleo" className="mt-4 inline-flex min-h-11 items-center font-semibold text-brand-700">
          Buscar ofertas
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href={editId ? `/empleo/${editId}` : "/empleo/mias"} className="inline-flex min-h-11 items-center gap-2 font-semibold text-ink-muted hover:text-ink">
        <ArrowLeft className="h-5 w-5" aria-hidden />
        {editId ? "Volver a la oferta" : "Mis ofertas"}
      </Link>
      <h1 className="text-[28px] font-semibold">{editId ? "Editar oferta" : "Publicar una oferta"}</h1>
      {error ? <ErrorBanner message={error} /> : initial ? <JobForm initial={initial} editId={editId} /> : <div className="h-96 animate-pulse rounded-card bg-white" />}
    </div>
  );
}

export default function PublicarPage() {
  return (
    <AppShell wide>
      {(user) => (
        <Suspense>
          <Publicar user={user} />
        </Suspense>
      )}
    </AppShell>
  );
}
