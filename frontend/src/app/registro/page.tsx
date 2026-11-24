"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard } from "@/components/AuthCard";
import { Button } from "@/components/Button";
import { Divider } from "@/components/Divider";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Field } from "@/components/Field";
import { LegalNote } from "@/components/LegalNote";
import { SocialButtons } from "@/components/SocialButtons";
import { api, ApiError, setToken } from "@/lib/api";

export default function Registro() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Escribe un email válido, por ejemplo nombre@gmail.com.";
    if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password))
      e.password = "Usa al menos 8 caracteres, con una mayúscula y un número.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api<{ access_token: string; dev_code?: string }>("/auth/register", {
        method: "POST",
        body: { email, password },
      });
      setToken(res.access_token);
      try {
        sessionStorage.setItem("studyhub_email", email);
        if (res.dev_code) sessionStorage.setItem("studyhub_dev_code", res.dev_code);
      } catch {}
      router.push("/registro/verificar");
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Algo ha fallado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Crea tu cuenta de Linkedu"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-brand-700 underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <ErrorBanner message={formError} />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="nombre@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <Field
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint="Al menos 8 caracteres, con una mayúscula y un número."
        />
        <LegalNote />
        <Button type="submit" full loading={loading}>
          Crear cuenta
        </Button>
      </form>
      <div className="my-6">
        <Divider />
      </div>
      <SocialButtons />
    </AuthCard>
  );
}
