"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@/lib/api";

/** Pestañas de la sección Empleo. Las empresas además tienen el acceso a "Publicar oferta". */
export function EmpleoTabs({ user }: { user: User }) {
  const path = usePathname();
  const company = user.role === "company";
  const tabs = [
    { href: "/empleo", label: "Buscar ofertas" },
    { href: "/empleo/mias", label: company ? "Mis ofertas" : "Mis candidaturas" },
  ];

  return (
    <div className="flex items-center justify-between gap-3">
      <nav aria-label="Empleo" className="flex gap-1">
        {tabs.map((t) => {
          const active = path === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center rounded-full px-4 text-[15px] font-semibold transition-colors ${
                active ? "bg-brand-50 text-brand-700" : "text-ink-muted hover:bg-white hover:text-ink"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
      {company && (
        <Link
          href="/empleo/publicar"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-white px-4 text-[15px] font-semibold text-ink transition-colors hover:border-ink-subtle"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Publicar oferta
        </Link>
      )}
    </div>
  );
}
