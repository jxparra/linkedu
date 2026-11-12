"use client";

import { notFound, useParams } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { SettingsCard, SettingsNav, SettingsRow } from "@/components/settings/Settings";
import type { User } from "@/lib/api";
import { useT } from "@/lib/i18n";

/** El resto de secciones de Ajustes. Lo que todavía no está hecho sale como "Próximamente". */
const SECTIONS: Record<string, { title: string; rows: (user: User) => { label: string; value?: string; href?: string; soon?: boolean }[] }> = {
  seguridad: {
    title: "Inicio de sesión y seguridad",
    rows: (u) => [{ label: "Email", value: u.email }, { label: "Cambiar contraseña", soon: true }],
  },
  visibilidad: {
    title: "Visibilidad",
    rows: () => [
      { label: "Quién puede ver tu perfil", soon: true },
      { label: "Quién puede enviarte mensajes", soon: true },
    ],
  },
  privacidad: {
    title: "Privacidad de datos",
    rows: () => [
      { label: "Descargar tus datos", soon: true },
      { label: "Eliminar la cuenta", soon: true },
    ],
  },
  notificaciones: {
    title: "Notificaciones",
    rows: () => [
      { label: "Avisos en la app", href: "/notificaciones" },
      { label: "Avisos por email", soon: true },
    ],
  },
};

function Section({ user }: { user: User }) {
  const t = useT();
  const { seccion } = useParams<{ seccion: string }>();
  const section = SECTIONS[seccion];
  if (!section) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <SettingsCard title={t(section.title)}>
        {section.rows(user).map((r) => (
          <SettingsRow key={r.label} label={t(r.label)} value={r.value} href={r.href} soon={r.soon} />
        ))}
      </SettingsCard>
    </div>
  );
}

export default function AjustesSeccion() {
  return <AppShell wide left={(user) => <SettingsNav user={user} />}>{(user) => <Section user={user} />}</AppShell>;
}
