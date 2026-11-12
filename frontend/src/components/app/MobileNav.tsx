"use client";

import { MessagesSquare, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";
import { mainNav } from "./TopBar";

const items = [
  ...mainNav,
  { href: "/social/foros", label: "Foros", icon: MessagesSquare, on: "bg-foros-50 text-foros-ink" },
  { href: "/perfil", label: "Perfil", icon: UserIcon, on: "bg-field text-ink" },
];

export function MobileNav() {
  const path = usePathname();
  const t = useT();
  return (
    <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] sm:hidden">
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon, on }) => {
          // La opción más concreta gana: en /social/foros se marca Foros y no Social
          const matches = (h: string) => path === h || path.startsWith(`${h}/`);
          const active = matches(href) && !items.some((o) => o.href.length > href.length && o.href.startsWith(href) && matches(o.href));
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${active ? "text-ink" : "text-ink-muted"}`}
              >
                <span className={`flex h-7 w-11 items-center justify-center rounded-full ${active ? on : ""}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                {t(label)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
