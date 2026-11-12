"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Field } from "@/components/Field";
import { OnboardingShell } from "@/components/OnboardingShell";
import { api, ApiError } from "@/lib/api";
import { useUser } from "@/lib/useUser";

const SECTORS = ["Tecnología", "Hostelería", "Comercio", "Educación", "Eventos", "Marketing", "Salud", "Otro"];

export default function EmpresaDatos() {
  const router = useRouter();
  const { user } = useUser();
  const [form, setForm] = useState({ name: "", sector: "", location: "", website: "", contact_name: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const c = user?.company;
    if (c) setForm((f) => ({ ...f, name: c.name, sector: c.sector ?? "", location: c.location ?? "" }));
  }, [user]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "Escribe el nombre de la empresa.";
    if (!form.contact_name.trim()) e.contact_name = "Indica quién gestionará las ofertas.";
    let website = form.website.trim();
    if (website && !/^https?:\/\//.test(website)) website = `https://${website}`;
    if (website && !/^https?:\/\/[^\s.]+\.[^\s]+$/.test(website)) e.website = "Escribe una web válida, por ejemplo miempresa.es.";
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setError(null);
    try {
      await api("/onboarding/company", {
        method: "PUT",
        body: {
          name: form.name,
          sector: form.sector || null,
          location: form.location || null,
          website: website || null,
          contact_name: form.contact_name,
        },
      });
      router.push("/registro/empresa/logo");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Algo ha fallado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingShell progress={55} title="Háblanos de tu empresa" subtitle="Los estudiantes verán estos datos en tus ofertas." onSubmit={submit} loading={loading}>
      <ErrorBanner message={error} />
      <Field label="Nombre de la empresa" autoComplete="organization" placeholder="Acme Eventos S.L." value={form.name} onChange={set("name")} error={errors.name} />
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Sector (opcional)</legend>
        <div className="flex flex-wrap gap-2">
          {SECTORS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={form.sector === s}
              onClick={() => setForm((f) => ({ ...f, sector: f.sector === s ? "" : s }))}
              className={`min-h-11 rounded-full border px-4 text-sm font-medium transition-colors ${
                form.sector === s ? "border-brand-600 bg-brand-600 text-on-brand" : "border-line hover:border-ink-subtle"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </fieldset>
      <Field label="Ubicación (opcional)" placeholder="Granada" value={form.location} onChange={set("location")} />
      <Field label="Web (opcional)" inputMode="url" placeholder="miempresa.es" value={form.website} onChange={set("website")} error={errors.website} />
      <Field
        label="Persona de contacto"
        autoComplete="name"
        placeholder="Luis Martín"
        value={form.contact_name}
        onChange={set("contact_name")}
        error={errors.contact_name}
        hint="Quien recibirá las candidaturas. No se muestra a los estudiantes."
      />
    </OnboardingShell>
  );
}
