"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard } from "@/components/AuthCard";
import { Button } from "@/components/Button";
import { Divider } from "@/components/Divider";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Field } from "@/components/Field";
import { SocialButtons } from "@/components/SocialButtons";
import { api, ApiError, setToken, type User } from "@/lib/api";
import { nextStep } from "@/lib/onboarding";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Escribe tu email y tu contraseña.");
      return;
    }
    setLoading(true);
    try {
      const res = await api<{ access_token: string }>("/auth/login", { method: "POST", body: { email, password } });
      setToken(res.access_token);
      const user = await api<User>("/auth/me");
      router.push(nextStep(user));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Algo ha fallado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Inicia sesión"
      footer={
        <>
          ¿Aún no tienes cuenta?{" "}
          <Link href="/registro" className="font-semibold text-brand-700 underline">
            Crear cuenta gratis
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <ErrorBanner message={error} />
        <Field label="Email" type="email" autoComplete="email" placeholder="nombre@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Contraseña" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="text-right">
          <Link href="#" className="text-sm font-semibold text-brand-700 underline">
            ¿Has olvidado tu contraseña?
          </Link>
        </div>
        <Button type="submit" full loading={loading}>
          Iniciar sesión
        </Button>
      </form>
      <div className="my-6">
        <Divider />
      </div>
      <SocialButtons />
    </AuthCard>
  );
}
