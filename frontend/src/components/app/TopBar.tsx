"use client";

import { Bell, Briefcase, Home, MessageCircle, Search, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@/lib/api";
import { useLang, useT } from "@/lib/i18n";
import { useUnread } from "@/lib/useUnread";
import { SearchBox } from "./SearchBox";
import { UserMenu } from "./UserMenu";

/** `on`: color de la pastilla cuando la sección está abierta (cada sección tiene el suyo). */
export const mainNav = [
  { href: "/inicio", label: "Inicio", icon: Home, on: "bg-field text-ink" },
  { href: "/social", label: "Social", icon: Users, on: "bg-social-50 text-social-ink" },
  { href: "/empleo", label: "Empleo", icon: Briefcase, on: "bg-empleo-50 text-empleo-ink" },
];

export function displayName(user: User | null): string {
  if (!user) return "";
  if (user.company) return user.company.name;
  if (user.student_profile) return `${user.student_profile.name} ${user.student_profile.surname}`;
  return user.username ?? user.email;
}

function IconButton({ href, label, icon: Icon, count, active }: { href: string; label: string; icon: typeof Bell; count: number; active: boolean }) {
  const a11y = count > 0 ? `${label}: ${count} sin leer` : label;
  return (
    <Link
      href={href}
      aria-label={a11y}
      aria-current={active ? "page" : undefined}
      className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
        active ? "bg-brand-50 text-brand-700" : "bg-field text-ink hover:bg-field-hover"
      }`}
    >
      <Icon className="h-5 w-5" aria-hidden />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-card bg-danger px-1 text-[11px] font-bold leading-none text-on-danger">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

export function TopBar({ user }: { user: User | null }) {
  const path = usePathname();
  const name = displayName(user);
  const unread = useUnread(!!user);
  const [searching, setSearching] = useState(false);
  const t = useT();
  const lang = useLang();
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-topbar">
      <div className="relative mx-auto grid h-16 max-w-[1280px] grid-cols-[auto_1fr_auto] items-center gap-3 px-4 lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center gap-3">
          <Link
            href="/inicio"
            aria-label="StudyHub, ir al inicio"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-display text-lg font-extrabold text-on-brand"
          >
            S
          </Link>
          <SearchBox open={searching} onOpenChange={setSearching} />
        </div>

        <nav aria-label="Principal" className="hidden h-full items-stretch gap-1 sm:flex">
          {mainNav.map(({ href, label, icon: Icon, on }) => {
            const active = path === href || path.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex w-24 flex-col items-center justify-center gap-0.5 text-[13px] font-semibold transition-colors ${
                  active ? "text-ink" : "text-ink-muted hover:text-ink"
                }`}
              >
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors ${active ? on : ""}`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                {t(label)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setSearching(true)}
            aria-label={t("Buscar")}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-field text-ink hover:bg-field-hover md:hidden"
          >
            <Search className="h-5 w-5" aria-hidden />
          </button>
          <IconButton href="/mensajes" label={t("Mensajes")} icon={MessageCircle} count={unread.messages} active={path === "/mensajes"} />
          <IconButton href="/notificaciones" label={t("Notificaciones")} icon={Bell} count={unread.notifications} active={path === "/notificaciones"} />
          <UserMenu user={user} name={name} />
        </div>
      </div>
    </header>
  );
}
