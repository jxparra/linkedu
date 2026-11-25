"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@/lib/api";

/**
 * Pestañas de la sección Empleo. Las empresas además tienen el acceso a "Publicar oferta".
 * Con `onDark` van dentro de la cabecera de color: texto claro y fondo translúcido al pasar el ratón.
 */
export function EmpleoTabs({ user, onDark = false }: { user: User; onDark?: boolean }) {
  const path = usePathname();
  const company = user.role === "company";
  // Los docentes solo consultan ofertas (no publican ni se inscriben)
  const tabs = [
    { href: "/empleo", label: "Ofertas" },
    ...(user.role === "teacher" ? [] : [{ href: "/empleo/mias", label: company ? "Mis ofertas" : "Mis candidaturas" }]),
  ];

  return (
    <div className={`flex flex-wrap items-center gap-3 ${onDark ? "" : "justify-between"}`}>
      <nav aria-label="Empleo" className="flex gap-1">
        {tabs.map((t) => {
          const active = path === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center rounded-btn px-4 text-[15px] font-semibold transition-colors ${
                active ? "nav-mark" : onDark ? "text-hero-ink hover:bg-white/10 hover:text-spine-strong" : "text-ink-muted hover:bg-field-hover hover:text-ink"
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
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-btn border px-4 text-[15px] font-semibold transition-colors ${
            onDark ? "border-white/25 bg-white/10 text-spine-strong hover:bg-white/15" : "border-line bg-card text-ink hover:border-ink-subtle"
          }`}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Publicar oferta
        </Link>
      )}
    </div>
  );
}
