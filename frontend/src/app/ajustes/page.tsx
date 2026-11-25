"use client";

import { AppShell } from "@/components/app/AppShell";
import { SettingsCard, SettingsMobileNav, SettingsNav, SettingsRow } from "@/components/settings/Settings";
import { logout, type User } from "@/lib/api";
import { LANGS, useLang, useT } from "@/lib/i18n";
import { useTheme, type ThemePref } from "@/lib/theme";

const THEMES: { value: ThemePref; label: string }[] = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
  { value: "system", label: "Como el sistema" },
];

/** Tema: claro, oscuro o el del sistema. Radios de verdad (se manejan con las flechas); el elegido, en naranja. */
function ThemePicker() {
  const t = useT();
  const { pref, change } = useTheme();
  return (
    <li className="px-6 py-3">
      <fieldset className="flex flex-wrap items-center justify-between gap-3">
        <legend className="float-left text-[15px]">{t("Tema")}</legend>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((o) => (
            <label
              key={o.value}
              className={`flex min-h-11 items-center rounded-btn border px-4 text-sm font-semibold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-600 ${
                pref === o.value ? "nav-mark border-transparent" : "border-line text-ink hover:border-edge"
              }`}
            >
              <input type="radio" name="tema" value={o.value} checked={pref === o.value} onChange={() => change(o.value)} className="sr-only" />
              {t(o.label)}
            </label>
          ))}
        </div>
      </fieldset>
    </li>
  );
}

/** Ajustes → Tu cuenta */
function Cuenta({ user }: { user: User }) {
  const t = useT();
  const lang = useLang();
  const company = user.role === "company";

  return (
    <div className="max-w-3xl space-y-4">
      <SettingsCard title={t("Información del perfil")}>
        <SettingsRow
          label={company ? t("Nombre, ubicación y sector") : user.role === "teacher" ? t("Nombre, ubicación y lo que impartes") : t("Nombre, ubicación y estudios")}
          href="/perfil/editar"
        />
        <SettingsRow label={t("Verificaciones")} value={user.email_verified ? `✓ ${t("Email verificado")}` : undefined} />
      </SettingsCard>

      <SettingsCard title={t("Visualización")}>
        <ThemePicker />
      </SettingsCard>

      <SettingsCard title={t("Preferencias generales")}>
        <SettingsRow label={t("Idioma")} value={LANGS.find((l) => l.code === lang)?.label} href="/ajustes/idioma" />
      </SettingsCard>

      <SettingsCard title={t("Cuenta")}>
        <SettingsRow label={t("Tipo de cuenta")} value={company ? t("Empresa") : user.role === "teacher" ? t("Docente") : t("Estudiante")} />
        <SettingsRow label={t("Email")} value={user.email} />
        <SettingsRow label={t("Cerrar sesión")} onClick={logout} />
      </SettingsCard>
    </div>
  );
}

export default function Ajustes() {
  return (
    <AppShell wide left={(user) => <SettingsNav user={user} />}>
      {(user) => (
        <>
          <SettingsMobileNav />
          <Cuenta user={user} />
        </>
      )}
    </AppShell>
  );
}
