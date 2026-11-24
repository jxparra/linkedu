"use client";

import { Bell, MessageCircle, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@/lib/api";
import { useLang, useT } from "@/lib/i18n";
import { useUnread } from "@/lib/useUnread";
import { SearchBox } from "./SearchBox";
import { BrandMark } from "./Spine";
import { UserMenu } from "./UserMenu";

export { mainNav } from "./Spine";

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
      className={`relative flex h-11 w-11 items-center justify-center rounded-btn transition-colors ${
        active ? "nav-mark" : "text-ink hover:bg-field-hover"
      }`}
    >
      <Icon className="h-5 w-5" aria-hidden />
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-topbar bg-danger px-1 text-[11px] font-bold leading-none text-on-danger">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

/** Barra superior: buscador y lo personal (mensajes, avisos, tu foto). Las secciones están en el lomo. */
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
      {/* Fondo sólido a propósito: con backdrop-blur, el oscurecido del buscador (fixed) quedaría encerrado en la barra */}
      <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-3 px-4">
        <Link href="/inicio" aria-label="Linkedu, ir al inicio" className="flex items-center gap-1 sm:hidden">
          <BrandMark />
          <span className="font-display text-xl font-bold tracking-tight">linkedu</span>
        </Link>
        <div className="relative">
          <SearchBox open={searching} onOpenChange={setSearching} />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSearching(true)}
            aria-label={t("Buscar")}
            className="flex h-11 w-11 items-center justify-center rounded-btn text-ink hover:bg-field-hover md:hidden"
          >
            <Search className="h-5 w-5" aria-hidden />
          </button>
          <IconButton href="/mensajes" label={t("Mensajes")} icon={MessageCircle} count={unread.messages} active={path === "/mensajes"} />
          <IconButton href="/notificaciones" label={t("Notificaciones")} icon={Bell} count={unread.notifications} active={path === "/notificaciones"} />
          <span className="mx-1.5 hidden h-7 w-px bg-line sm:block" aria-hidden />
          <UserMenu user={user} name={name} />
        </div>
      </div>
    </header>
  );
}
