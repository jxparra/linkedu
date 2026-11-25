"use client";

import { ArrowRight, Bell, Eye, Lock, Shield, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { displayName } from "@/components/app/TopBar";
import { Avatar } from "@/components/Avatar";
import { ChalkText } from "@/components/ChalkLine";
import { api, mediaUrl, type Profile, type User } from "@/lib/api";
import { useT } from "@/lib/i18n";

export const SETTINGS_SECTIONS = [
  { href: "/ajustes", label: "Tu cuenta", icon: UserIcon },
  { href: "/ajustes/seguridad", label: "Contraseña y sesiones", icon: Lock },
  { href: "/ajustes/visibilidad", label: "Quién te ve", icon: Eye },
  { href: "/ajustes/privacidad", label: "Tus datos", icon: Shield },
  { href: "/ajustes/notificaciones", label: "Notificaciones", icon: Bell },
];

/** Columna izquierda de Ajustes: tu foto, tu nombre y las secciones; la activa, en naranja. El h1 va sobre el contenido. */
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

  // "Idioma" está dentro de Tu cuenta
  const current = path === "/ajustes/idioma" ? "/ajustes" : path;

  return (
    <nav aria-label={t("Ajustes")} className="space-y-0.5 rounded-card border border-line bg-card p-2">
      <div className="mb-2 flex items-center gap-3 px-2 pt-2">
        <Avatar name={name || "?"} src={avatar} size="sm" role={user?.role} />
        <p className="min-w-0 truncate font-semibold">{name}</p>
      </div>
      {SETTINGS_SECTIONS.map(({ href, label, icon: Icon }) => {
        const active = current === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-btn px-3 text-[15px] font-medium transition-colors ${
              active ? "nav-mark font-semibold" : "text-ink hover:bg-field-hover"
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

/**
 * Ajustes en el móvil: la columna izquierda no se muestra, así que el título y las secciones
 * van arriba del contenido, como en Social (fichas que se desplazan y la activa en naranja).
 */
export function SettingsMobileNav() {
  const t = useT();
  const path = usePathname();
  const chip = "flex min-h-11 shrink-0 items-center gap-1.5 rounded-btn px-4 text-sm font-semibold transition-colors";
  return (
    <div className="mb-4 space-y-4">
      <h1 className="text-[28px] font-bold leading-tight">
        <ChalkText>{t("Ajustes")}</ChalkText>
      </h1>
      <nav aria-label={t("Ajustes")} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:hidden">
        {SETTINGS_SECTIONS.map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`${chip} ${active ? "nav-mark" : "bg-card text-ink ring-1 ring-line"}`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {t(label)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/** Tarjeta con un título y filas. */
export function SettingsCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-card border border-line bg-card">
      <h2 className="px-6 pb-2 pt-5 text-lg font-bold">{title}</h2>
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
        {soon && <span className="rounded-tag bg-page px-2.5 py-0.5 text-[12px] font-semibold">{t("Próximamente")}</span>}
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
