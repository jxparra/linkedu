"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Autocomplete } from "@/components/Autocomplete";
import { Checkbox } from "@/components/Checkbox";
import { ErrorBanner } from "@/components/ErrorBanner";
import { OnboardingShell } from "@/components/OnboardingShell";
import { api, ApiError, type Option } from "@/lib/api";
import { useUser } from "@/lib/useUser";

const COURSES = [1, 2, 3, 4, 5, 6];

export default function EstudianteEstudios() {
  const router = useRouter();
  useUser();
  const [school, setSchool] = useState<Option | null>(null);
  const [degree, setDegree] = useState<Option | null>(null);
  const [course, setCourse] = useState<number | null>(null);
  const [over16, setOver16] = useState(false);
  const [errors, setErrors] = useState<{ school?: string; degree?: string; age?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e: typeof errors = {};
    if (!school) e.school = "Elige tu centro de la lista.";
    if (!degree) e.degree = "Elige tus estudios de la lista.";
    if (!over16) e.age = "Debes tener 16 años o más para usar Linkedu.";
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setError(null);
    try {
      await api("/onboarding/student/studies", {
        method: "PUT",
        body: { school_id: school!.id, degree_id: degree!.id, course, is_over_16: over16 },
      });
      try {
        sessionStorage.setItem("studyhub_study", JSON.stringify({ school: school!.id, degree: degree!.id }));
      } catch {}
      router.push("/registro/estudiante/foto");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Algo ha fallado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingShell progress={65} title="¿Dónde estudias?" subtitle="Podrás cambiarlo cuando quieras desde tu perfil." onSubmit={submit} loading={loading}>
      <ErrorBanner message={error} />
      <Autocomplete
        label="Universidad o centro"
        placeholder="Ej.: Universidad de Granada"
        endpoint="/catalog/schools"
        value={school}
        onChange={(s) => {
          setSchool(s);
          setDegree(null);
        }}
        error={errors.school}
      />
      <Autocomplete
        key={school?.id ?? "none"}
        label="Estudios"
        placeholder="Ej.: Desarrollo de Aplicaciones Web"
        endpoint={`/catalog/degrees?school_id=${school?.id ?? ""}`}
        value={degree}
        onChange={setDegree}
        error={errors.degree}
        disabledHint={school ? undefined : "Elige primero tu centro."}
      />
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Curso (opcional)</legend>
        <div className="flex flex-wrap gap-2">
          {COURSES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={course === c}
              onClick={() => setCourse(course === c ? null : c)}
              className={`h-11 min-w-11 rounded-btn border px-4 text-[15px] font-medium transition-colors ${
                course === c ? "nav-mark border-transparent" : "border-line hover:border-ink-subtle"
              }`}
            >
              {c}º
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <Checkbox checked={over16} onChange={(v) => { setOver16(v); setErrors((e) => ({ ...e, age: undefined })); }}>
          Tengo 16 años o más
        </Checkbox>
        {errors.age && <p className="text-[13px] text-danger">{errors.age}</p>}
      </div>
    </OnboardingShell>
  );
}
