"use client";

import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Field } from "@/components/Field";
import { OnboardingShell } from "@/components/OnboardingShell";
import { api, ApiError } from "@/lib/api";
import { useUser } from "@/lib/useUser";

const RESEND_SECONDS = 30;

export default function Verificar() {
  const router = useRouter();
  const { user } = useUser();
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [wait, setWait] = useState(RESEND_SECONDS);

  useEffect(() => {
    try {
      setDevCode(sessionStorage.getItem("studyhub_dev_code"));
    } catch {}
  }, []);

  useEffect(() => {
    if (user?.email_verified) router.replace("/registro/tipo");
  }, [user, router]);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const submit = async () => {
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError("El código tiene 6 números.");
      return;
    }
    setLoading(true);
    try {
      await api("/auth/verify", { method: "POST", body: { code } });
      try {
        sessionStorage.removeItem("studyhub_dev_code");
      } catch {}
      router.push("/registro/tipo");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Algo ha fallado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError(null);
    try {
      const res = await api<{ message: string; dev_code?: string }>("/auth/resend", { method: "POST" });
      setInfo(res.message);
      if (res.dev_code) setDevCode(res.dev_code);
      setWait(RESEND_SECONDS);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No hemos podido reenviar el código.");
    }
  };

  return (
    <OnboardingShell
      progress={20}
      title="Verifica tu email"
      subtitle={`Te hemos enviado un código de 6 números a ${user?.email ?? "tu email"}.`}
      onSubmit={submit}
      loading={loading}
      back={false}
    >
      <ErrorBanner message={error} />
      {devCode && (
        <p className="rounded-input bg-accent-50 px-3.5 py-3 text-sm text-accent-800">
          Modo desarrollo: tu código es <strong className="tracking-widest">{devCode}</strong>
        </p>
      )}
      <Field
        label="Código de verificación"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="123456"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        className="[&_input]:text-lg [&_input]:tracking-[0.3em]"
      />
      <div className="text-sm text-ink-muted">
        {wait > 0 ? (
          <span>Puedes pedir otro código en 0:{String(wait).padStart(2, "0")}</span>
        ) : (
          <button type="button" onClick={resend} className="min-h-11 font-semibold text-brand-700 underline">
            Reenviar código
          </button>
        )}
        {info && wait > 0 && <span className="ml-2 text-success">· {info}</span>}
      </div>
      <details className="rounded-input border border-line px-4 py-3 text-sm">
        <summary className="flex cursor-pointer items-center gap-2 font-medium">
          <ShieldCheck className="h-4 w-4 text-brand-600" aria-hidden /> Cómo usamos tus datos
        </summary>
        <p className="mt-2 text-ink-muted">
          Solo usamos tu email para que puedas entrar en tu cuenta y para avisarte de lo que te interesa. Nunca lo
          compartimos con empresas sin tu permiso.
        </p>
      </details>
    </OnboardingShell>
  );
}
