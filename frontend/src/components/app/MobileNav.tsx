"use client";

import { MessagesSquare, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";
import { mainNav } from "./TopBar";

const items = [...mainNav, { href: "/foros", label: "Foros", icon: MessagesSquare }, { href: "/perfil", label: "Perfil", icon: UserIcon }];

export function MobileNav() {
  const path = usePathname();
  const t = useT();
  return (
    <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] sm:hidden">
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${active ? "text-brand-700" : "text-ink-muted"}`}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {t(label)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
