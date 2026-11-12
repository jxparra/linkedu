"use client";

import { Building2, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ErrorBanner } from "@/components/ErrorBanner";
import { OnboardingShell } from "@/components/OnboardingShell";
import { api, ApiError } from "@/lib/api";
import { useUser } from "@/lib/useUser";

export default function EmpresaLogo() {
  const router = useRouter();
  const { user } = useUser();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const finish = async () => {
    setLoading(true);
    setError(null);
    try {
      await api("/onboarding/finish", { method: "POST" });
      router.push("/inicio");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Algo ha fallado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingShell
      progress={85}
      title="Añade el logo de tu empresa"
      subtitle="Las ofertas con logo generan más confianza."
      onSubmit={finish}
      skip={finish}
      loading={loading}
      submitLabel="Entrar en StudyHub"
    >
      <ErrorBanner message={error} />
      <div className="flex flex-col items-center rounded-card border border-line px-6 py-8">
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="group relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-[20px] bg-page"
          aria-label="Elegir logo"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <Building2 className="h-12 w-12 text-ink-subtle" aria-hidden />
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-6 w-6" aria-hidden />
          </span>
        </button>
        {user?.company && (
          <>
            <p className="mt-4 text-lg font-semibold">{user.company.name}</p>
            <span className="mt-1 rounded-full bg-page px-2.5 py-0.5 text-xs font-semibold text-ink-muted">Empresa</span>
          </>
        )}
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="mt-5 min-h-11 rounded-full border border-line px-5 text-[15px] font-semibold hover:border-ink-subtle"
        >
          {preview ? "Cambiar logo" : "Subir logo"}
        </button>
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setPreview(URL.createObjectURL(f));
          }}
        />
      </div>
    </OnboardingShell>
  );
}
