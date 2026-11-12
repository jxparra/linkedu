"use client";

import { AppShell } from "@/components/app/AppShell";
import { SettingsCard, SettingsNav, SettingsRow } from "@/components/settings/Settings";
import { logout, type User } from "@/lib/api";
import { LANGS, useLang, useT } from "@/lib/i18n";

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
        <SettingsRow label={t("Modo oscuro")} soon />
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
