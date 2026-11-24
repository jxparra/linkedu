"use client";
import { ChalkText } from "@/components/ChalkLine";

import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Select } from "@/components/Select";
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
    <section className="max-w-3xl rounded-card border border-line bg-card p-6 sm:p-8">
      <Link href="/ajustes" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t("Volver")}
      </Link>
      <h1 className="mt-2 text-[28px] font-bold leading-tight">
        <ChalkText>{t("Idioma")}</ChalkText>
      </h1>
      <p id="idioma-desc" className="text-[15px]">
        {t("Selecciona el idioma que utilizas en Linkedu")}
      </p>

      <Select
        id="idioma"
        ariaLabel={t("Idioma")}
        value={lang}
        onChange={(v) => change(v as Lang)}
        options={LANGS.map((l) => ({ value: l.code, label: l.label }))}
        className="mt-5 max-w-md"
        buttonClassName="h-14 text-[17px]"
      />

      <p role="status" className="mt-2 h-6 text-sm font-semibold text-success">
        {saved && (
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4" aria-hidden /> {t("Idioma guardado")}
          </span>
        )}
      </p>
      <p id="idioma-help" className="mt-2 text-[13px] text-ink-muted">
        {t("Dinos en qué idioma prefieres usar Linkedu. Puedes cambiarlo en cualquier momento.")} {t("Se guarda en este navegador.")}
      </p>
    </section>
  );
}

export default function IdiomaPage() {
  return <AppShell wide left={(user) => <SettingsNav user={user} />}>{() => <Idioma />}</AppShell>;
}
