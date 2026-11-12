"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Field } from "@/components/Field";
import { OnboardingShell } from "@/components/OnboardingShell";
import { api, ApiError } from "@/lib/api";
import { useUser } from "@/lib/useUser";

export default function EstudianteDatos() {
  const router = useRouter();
  const { user } = useUser();
  const [form, setForm] = useState({ name: "", surname: "", username: "", location: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const p = user?.student_profile;
    if (p) setForm({ name: p.name, surname: p.surname, username: user.username ?? "", location: p.location ?? "" });
  }, [user]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: k === "username" ? e.target.value.toLowerCase().replace(/\s/g, "") : e.target.value }));

  const submit = async () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "Escribe tu nombre.";
    if (!form.surname.trim()) e.surname = "Escribe tus apellidos.";
    if (!/^[a-z0-9_.]{3,30}$/.test(form.username)) e.username = "Entre 3 y 30 caracteres: letras, números, punto o guion bajo.";
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setError(null);
    try {
      await api("/onboarding/student/identity", {
        method: "PUT",
        body: { ...form, location: form.location || null },
      });
      router.push("/registro/estudiante/estudios");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Algo ha fallado. Inténtalo de nuevo.";
      if (err instanceof ApiError && err.status === 409) setErrors({ username: msg });
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingShell progress={50} title="¿Cómo te llamas?" subtitle="Así te verán los demás en StudyHub." onSubmit={submit} loading={loading}>
      <ErrorBanner message={error} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre" autoComplete="given-name" placeholder="Lucía" value={form.name} onChange={set("name")} error={errors.name} />
        <Field label="Apellidos" autoComplete="family-name" placeholder="García López" value={form.surname} onChange={set("surname")} error={errors.surname} />
      </div>
      <Field
        label="Nombre de usuario"
        placeholder="lucia_garcia"
        autoComplete="username"
        value={form.username}
        onChange={set("username")}
        error={errors.username}
        hint="Tu @ en StudyHub. Podrás cambiarlo más adelante."
      />
      <Field
        label="Ubicación (opcional)"
        placeholder="Granada"
        autoComplete="address-level2"
        value={form.location}
        onChange={set("location")}
        hint="Nos ayuda a mostrarte trabajos y gente de tu zona."
      />
    </OnboardingShell>
  );
}
