"use client";

import { Building2, Check, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorBanner } from "@/components/ErrorBanner";
import { OnboardingShell } from "@/components/OnboardingShell";
import { api, ApiError } from "@/lib/api";
import { useUser } from "@/lib/useUser";

const options = [
  {
    value: "student",
    icon: GraduationCap,
    title: "Soy estudiante",
    text: "Busco trabajos puntuales, comunidades y opiniones sobre mis estudios.",
  },
  {
    value: "company",
    icon: Building2,
    title: "Soy una empresa",
    text: "Quiero publicar encargos y encontrar estudiantes.",
  },
] as const;

export default function Tipo() {
  const router = useRouter();
  useUser();
  const [role, setRole] = useState<"student" | "company" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!role) {
      setError("Elige una opción para continuar.");
      return;
    }
    setLoading(true);
    try {
      await api("/onboarding/account-type", { method: "POST", body: { role } });
      router.push(role === "student" ? "/registro/estudiante/datos" : "/registro/empresa/datos");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Algo ha fallado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingShell
      progress={35}
      title="¿Cómo vas a usar StudyHub?"
      subtitle="Así te mostramos lo que te interesa."
      onSubmit={submit}
      loading={loading}
      back={false}
    >
      <ErrorBanner message={error} />
      <div role="radiogroup" aria-label="Tipo de cuenta" className="space-y-3">
        {options.map(({ value, icon: Icon, title, text }) => {
          const selected = role === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setRole(value);
                setError(null);
              }}
              className={`flex w-full items-start gap-4 rounded-card border-2 p-5 text-left transition-colors ${
                selected ? "border-brand-600 bg-brand-50" : "border-line hover:border-ink-subtle"
              }`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  selected ? "bg-brand-600 text-white" : "bg-page text-ink"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="block font-semibold">{title}</span>
                <span className="mt-0.5 block text-sm text-ink-muted">{text}</span>
              </span>
              {selected && <Check className="h-5 w-5 text-brand-600" aria-hidden />}
            </button>
          );
        })}
      </div>
    </OnboardingShell>
  );
}
