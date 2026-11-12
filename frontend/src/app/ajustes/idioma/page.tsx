"use client";

import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { SettingsNav } from "@/components/settings/Settings";
import { LANGS, setLang, useLang, useT, type Lang } from "@/lib/i18n";

/** Ajustes → Idioma (también se llega desde el menú de tu foto) */
function Idioma() {
  const t = useT();
  const lang = useLang();
  const [saved, setSaved] = useState(false);

  const change = (l: Lang) => {
    setLang(l);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <section className="mx-auto max-w-3xl rounded-card border border-line bg-card p-6 sm:p-8">
      <Link href="/ajustes" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t("Volver")}
      </Link>
      <h1 className="mt-2 text-xl font-semibold">{t("Idioma")}</h1>
      <p id="idioma-desc" className="text-[15px]">
        {t("Selecciona el idioma que utilizas en StudyHub")}
      </p>

      <label htmlFor="idioma" className="sr-only">
        {t("Idioma")}
      </label>
      <select
        id="idioma"
        aria-describedby="idioma-desc idioma-help"
        value={lang}
        onChange={(e) => change(e.target.value as Lang)}
        className="mt-5 h-14 w-full max-w-md rounded-input border border-ink-subtle bg-card px-3.5 text-[17px] hover:border-ink focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>

      <p role="status" className="mt-2 h-6 text-sm font-semibold text-success">
        {saved && (
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4" aria-hidden /> {t("Idioma guardado")}
          </span>
        )}
      </p>
      <p id="idioma-help" className="mt-2 text-[13px] text-ink-muted">
        {t("Dinos en qué idioma prefieres usar StudyHub. Puedes cambiarlo en cualquier momento.")} {t("Se guarda en este navegador.")}
      </p>
    </section>
  );
}

export default function IdiomaPage() {
  return <AppShell wide left={(user) => <SettingsNav user={user} />}>{() => <Idioma />}</AppShell>;
}
