"use client";

import { User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";
import { isActive, mainNav } from "./Spine";

const items = [...mainNav, { href: "/perfil", label: "Perfil", icon: UserIcon }];

/** Barra inferior del móvil: las mismas secciones que el lomo, más tu perfil. */
export function MobileNav() {
  const path = usePathname();
  const t = useT();
  return (
    <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] sm:hidden">
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(path, href, items);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${active ? "text-ink" : "text-ink-muted"}`}
              >
                <span className={`flex h-7 w-11 items-center justify-center ${active ? "nav-mark" : ""}`}>
                  <Icon className="h-5 w-5" aria-hidden strokeWidth={active ? 2.25 : 1.75} />
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
