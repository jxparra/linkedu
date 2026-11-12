"use client";

import { ArrowRight, Bell, Eye, Lock, Shield, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { displayName } from "@/components/app/TopBar";
import { Avatar } from "@/components/Avatar";
import { api, mediaUrl, type Profile, type User } from "@/lib/api";
import { useT } from "@/lib/i18n";

export const SETTINGS_SECTIONS = [
  { href: "/ajustes", label: "Preferencias de la cuenta", icon: UserIcon },
  { href: "/ajustes/seguridad", label: "Inicio de sesión y seguridad", icon: Lock },
  { href: "/ajustes/visibilidad", label: "Visibilidad", icon: Eye },
  { href: "/ajustes/privacidad", label: "Privacidad de datos", icon: Shield },
  { href: "/ajustes/notificaciones", label: "Notificaciones", icon: Bell },
];

/** Columna izquierda de Ajustes: tu foto, el título y las secciones (como los ajustes de LinkedIn). */
export function SettingsNav({ user }: { user: User | null }) {
  const t = useT();
  const path = usePathname();
  const [avatar, setAvatar] = useState<string | null>(null);
  const name = displayName(user);

  useEffect(() => {
    if (user)
      api<Profile>(`/users/${user.id}`)
        .then((p) => setAvatar(p.user.avatar_url ? mediaUrl(p.user.avatar_url) : null))
        .catch(() => {});
  }, [user]);

  // "Idioma" está dentro de Preferencias de la cuenta
  const current = path === "/ajustes/idioma" ? "/ajustes" : path;

  return (
    <nav aria-label={t("Ajustes")} className="rounded-card border border-line bg-card py-4">
      <div className="mb-3 flex items-center gap-3 px-4">
        <Avatar name={name || "?"} src={avatar} size="md" square={user?.role === "company"} />
        <h1 className="text-[28px] font-semibold">{t("Ajustes")}</h1>
      </div>
      {SETTINGS_SECTIONS.map(({ href, label, icon: Icon }) => {
        const active = current === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-14 items-center gap-3 border-l-[3px] px-4 text-[15px] font-semibold transition-colors ${
              active ? "border-brand-600 text-brand-700" : "border-transparent text-ink hover:bg-page"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            {t(label)}
          </Link>
        );
      })}
    </nav>
  );
}

/** Tarjeta con un título y filas. */
export function SettingsCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-card border border-line bg-card">
      <h2 className="px-6 pb-2 pt-5 text-xl font-semibold">{title}</h2>
      <ul>{children}</ul>
    </section>
  );
}

/** Una fila de ajustes. Con `href` es un enlace con flecha; con `soon` sale "Próximamente" y no se puede pulsar. */
export function SettingsRow({ label, value, href, soon, onClick }: { label: string; value?: string; href?: string; soon?: boolean; onClick?: () => void }) {
  const t = useT();
  const inner = (
    <>
      <span className="text-[15px]">{label}</span>
      <span className="flex items-center gap-2 text-[15px] text-ink-muted">
        {value && <span className="max-w-[220px] truncate">{value}</span>}
        {soon && <span className="rounded-full bg-page px-2.5 py-0.5 text-[12px] font-semibold">{t("Próximamente")}</span>}
        {(href || onClick) && <ArrowRight className="h-5 w-5 text-ink" aria-hidden />}
      </span>
    </>
  );
  const cls = "flex min-h-14 w-full items-center justify-between gap-3 border-t border-line px-6 py-3 text-left first:border-t-0";
  return (
    <li className="border-t border-line first:border-t-0">
      {href ? (
        <Link href={href} className={`${cls} border-0 transition-colors hover:bg-page`}>
          {inner}
        </Link>
      ) : onClick ? (
        <button type="button" onClick={onClick} className={`${cls} border-0 transition-colors hover:bg-page`}>
          {inner}
        </button>
      ) : (
        <div className={`${cls} border-0 ${soon ? "text-ink-muted" : ""}`} aria-disabled={soon || undefined}>
          {inner}
        </div>
      )}
    </li>
  );
}
