"use client";

import { AppShell } from "@/components/app/AppShell";
import { SettingsCard, SettingsNav, SettingsRow } from "@/components/settings/Settings";
import { logout, type User } from "@/lib/api";
import { LANGS, useLang, useT } from "@/lib/i18n";
import { useTheme, type ThemePref } from "@/lib/theme";

const THEMES: { value: ThemePref; label: string }[] = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
  { value: "system", label: "Como el sistema" },
];

/** Modo claro / oscuro / el del sistema, en tres botones */
function ThemePicker() {
  const t = useT();
  const { pref, change } = useTheme();
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
      <span id="tema" className="text-[15px]">
        {t("Modo oscuro")}
      </span>
      <div role="radiogroup" aria-labelledby="tema" className="flex flex-wrap gap-2">
        {THEMES.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={pref === o.value}
            onClick={() => change(o.value)}
            className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors ${
              pref === o.value ? "border-edge bg-ink text-inverse" : "border-line text-ink hover:border-edge"
            }`}
          >
            {t(o.label)}
          </button>
        ))}
      </div>
    </li>
  );
}

/** Ajustes → Preferencias de la cuenta */
function Cuenta({ user }: { user: User }) {
  const t = useT();
  const lang = useLang();
  const company = user.role === "company";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <SettingsCard title={t("Información del perfil")}>
        <SettingsRow label={company ? t("Nombre, ubicación y sector") : t("Nombre, ubicación y estudios")} href="/perfil" />
        <SettingsRow label={t("Verificaciones")} value={user.email_verified ? `✓ ${t("Email verificado")}` : undefined} />
      </SettingsCard>

      <SettingsCard title={t("Visualización")}>
        <ThemePicker />
      </SettingsCard>

      <SettingsCard title={t("Preferencias generales")}>
        <SettingsRow label={t("Idioma")} value={LANGS.find((l) => l.code === lang)?.label} href="/ajustes/idioma" />
      </SettingsCard>

      <SettingsCard title={t("Cuenta")}>
        <SettingsRow label={t("Tipo de cuenta")} value={company ? t("Empresa") : t("Estudiante")} />
        <SettingsRow label={t("Email")} value={user.email} />
        <SettingsRow label={t("Cerrar sesión")} onClick={logout} />
      </SettingsCard>
    </div>
  );
}

export default function Ajustes() {
  return (
    <AppShell wide left={(user) => <SettingsNav user={user} />}>
      {(user) => <Cuenta user={user} />}
    </AppShell>
  );
}
