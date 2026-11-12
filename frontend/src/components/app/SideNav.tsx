"use client";

import { Bookmark, CalendarDays, Clapperboard, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@/lib/api";
import { Avatar } from "../Avatar";
import { useT } from "@/lib/i18n";
import { displayName } from "./TopBar";

export const sideNav = [
  { href: "/reels", label: "Reels", icon: Clapperboard },
  { href: "/social/foros", label: "Foros", icon: MessagesSquare },
  { href: "/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/guardados", label: "Guardados", icon: Bookmark },
];

export function SideNav({ user }: { user: User | null }) {
  const path = usePathname();
  const name = displayName(user);
  const t = useT();
  const item = "flex min-h-12 items-center gap-3.5 rounded-xl px-3 text-[15px] font-semibold transition-colors";

  return (
    <nav aria-label="Secciones" className="space-y-1">
      <Link href="/perfil" className={`${item} mb-3 hover:bg-card`}>
        <Avatar name={name || "?"} size="sm" square={user?.role === "company"} />
        <span className="min-w-0 truncate">{name}</span>
      </Link>
      {sideNav.map(({ href, label, icon: Icon }) => {
        const active = path === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`${item} ${active ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-card"}`}
          >
            <Icon className="h-6 w-6" aria-hidden />
            {t(label)}
          </Link>
        );
      })}
    </nav>
  );
}
