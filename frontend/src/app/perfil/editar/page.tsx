"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/Button";
import { ChalkText } from "@/components/ChalkLine";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Field } from "@/components/Field";
import { api, ApiError, type User } from "@/lib/api";

/** Editar tu perfil: nombre, @usuario y ubicación (estudiante) o los datos de la empresa. Usa los mismos endpoints que el registro. */
function EditForm({ user }: { user: User }) {
  const router = useRouter();
  const company = user.role === "company";
  const p = user.student_profile;
  const c = user.company;
  const [form, setForm] = useState({
    name: (company ? c?.name : p?.name) ?? "",
    surname: p?.surname ?? "",
    username: user.username ?? "",
    location: (company ? c?.location : p?.location) ?? "",
    sector: c?.sector ?? "",
    website: c?.website ?? "",
    contact_name: c?.contact_name ?? "",
    teaches: p?.teaches ?? "",
  });
  const teacher = user.role === "teacher";
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: k === "username" ? e.target.value.toLowerCase().replace(/\s/g, "") : e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = company ? "Escribe el nombre de la empresa." : "Escribe tu nombre.";
    if (!company && !form.surname.trim()) errs.surname = "Escribe tus apellidos.";
    if (!company && !/^[a-z0-9_.]{3,30}$/.test(form.username)) errs.username = "Entre 3 y 30 caracteres: letras, números, punto o guion bajo.";
    if (company && form.website && !/^https?:\/\/\S+\.\S+/.test(form.website)) errs.website = "Escribe la dirección completa, con https://";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    setError(null);
    try {
      if (company) {
        await api("/onboarding/company", {
          method: "PUT",
          body: {
            name: form.name.trim(),
            sector: form.sector.trim() || null,
            location: form.location.trim() || null,
            website: form.website.trim() || null,
            contact_name: form.contact_name.trim() || null,
          },
        });
      } else {
        await api("/onboarding/student/identity", {
          method: "PUT",
          body: {
            name: form.name.trim(),
            surname: form.surname.trim(),
            username: form.username,
            location: form.location.trim() || null,
            ...(teacher ? { teaches: form.teaches.trim() } : {}),
          },
        });
      }
      router.push(`/perfil/${user.id}`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "No se han podido guardar los cambios. Inténtalo de nuevo.";
      if (err instanceof ApiError && err.status === 409) setErrors({ username: msg });
      else setError(msg);
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[640px] space-y-4">
      <Link href={`/perfil/${user.id}`} className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Tu perfil
      </Link>
      <h1 className="text-[28px] font-bold leading-tight">
        <ChalkText>Editar perfil</ChalkText>
      </h1>
      <form onSubmit={submit} noValidate className="space-y-5 rounded-card border border-line bg-card p-5 sm:p-6">
        <ErrorBanner message={error} />
        {company ? (
          <>
            <Field label="Nombre de la empresa" autoComplete="organization" value={form.name} onChange={set("name")} error={errors.name} />
            <div className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2">
              <Field label="Sector (opcional)" value={form.sector} onChange={set("sector")} />
              <Field label="Ubicación (opcional)" autoComplete="address-level2" value={form.location} onChange={set("location")} />
            </div>
            <Field label="Web (opcional)" type="url" placeholder="https://" value={form.website} onChange={set("website")} error={errors.website} />
            <Field label="Persona de contacto (opcional)" autoComplete="name" value={form.contact_name} onChange={set("contact_name")} />
          </>
        ) : (
          <>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2">
              <Field label="Nombre" autoComplete="given-name" value={form.name} onChange={set("name")} error={errors.name} />
              <Field label="Apellidos" autoComplete="family-name" value={form.surname} onChange={set("surname")} error={errors.surname} />
            </div>
            <Field label="Nombre de usuario" autoComplete="username" value={form.username} onChange={set("username")} error={errors.username} hint="Tu @ en Linkedu." />
            {teacher && (
              <Field
                label="Qué impartes (opcional)"
                placeholder="Ej.: Programación y Bases de datos"
                value={form.teaches}
                onChange={set("teaches")}
                hint="Se ve junto a tu nombre, para que tu alumnado sepa quién eres."
              />
            )}
            <Field
              label="Ubicación (opcional)"
              autoComplete="address-level2"
              value={form.location}
              onChange={set("location")}
              hint="Nos ayuda a mostrarte trabajos y gente de tu zona."
            />
          </>
        )}
        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={() => router.push(`/perfil/${user.id}`)}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving}>
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function EditarPerfil() {
  return <AppShell wide>{(user) => <EditForm user={user} />}</AppShell>;
}
