"use client";

import { Briefcase, Home, MessagesSquare, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";

/** Secciones principales. Están en el lomo (ordenador) y en la barra inferior (móvil). */
export const mainNav = [
  { href: "/inicio", label: "Inicio", icon: Home },
  { href: "/social", label: "Social", icon: Users },
  { href: "/social/foros", label: "Foros", icon: MessagesSquare },
  { href: "/empleo", label: "Empleo", icon: Briefcase },
];

/** La opción más concreta gana: en /social/foros se marca Foros y no Social. */
export function isActive(path: string, href: string, all: { href: string }[]) {
  const matches = (h: string) => path === h || path.startsWith(`${h}/`);
  return matches(href) && !all.some((o) => o.href.length > href.length && o.href.startsWith(href) && matches(o.href));
}

/** Marca de Linkedu: «lu» con una franja de fosforito debajo. */
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`relative inline-flex h-10 w-10 items-center justify-center ${className}`}>
      <span className="relative -mt-1.5 font-display text-[26px] font-extrabold leading-none tracking-[-0.06em]">lu</span>
      <span className="absolute bottom-1.5 left-2 right-2 h-[5px] -rotate-6 rounded-[2px] bg-mark" />
    </span>
  );
}

/** Sección marcada en la página anterior: el trazo de fosforito solo se pinta cuando cambias de sección, no al recargar. */
let lastActive: string | null = null;

/**
 * El lomo: columna fija a la izquierda, como el lomo de un cuaderno.
 * Es el único sitio con color de pizarra intenso; el resto de la app es papel.
 */
export function Spine() {
  const path = usePathname();
  const t = useT();
  const activeIndex = mainNav.findIndex(({ href }) => isActive(path, href, mainNav));
  const activeHref = activeIndex >= 0 ? mainNav[activeIndex].href : null;
  // Cada página monta su propio lomo: se decide una vez, al montarlo, si viene de otra sección
  const [swipe] = useState(() => lastActive !== null && activeHref !== null && lastActive !== activeHref);
  useEffect(() => {
    lastActive = activeHref;
  }, [activeHref]);

  return (
    <nav aria-label="Principal" className="fixed inset-y-0 left-0 z-30 hidden w-[84px] flex-col items-center bg-spine pb-6 text-spine-ink sm:flex">
      <Link
        href="/inicio"
        aria-label="Linkedu, ir al inicio"
        className="mt-3 mb-6 flex h-14 w-14 items-center justify-center rounded-btn text-spine-strong hover:bg-white/5"
      >
        <BrandMark />
      </Link>
      <ul className="flex w-full flex-col gap-1 px-2">
        {mainNav.map(({ href, label, icon: Icon }, i) => {
          const active = i === activeIndex;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group flex min-h-16 flex-col items-center justify-center gap-1 rounded-btn text-[12px] font-semibold transition-colors ${
                  active ? "text-spine-strong" : "hover:text-spine-strong"
                }`}
              >
                <span
                  className={`relative isolate flex h-8 w-12 items-center justify-center rounded-btn transition-colors ${
                    active ? "text-on-mark" : "group-hover:bg-white/10"
                  }`}
                >
                  {/* El fosforito va debajo del icono y se pinta de izquierda a derecha al llegar a la sección */}
                  {active && <span aria-hidden className={`nav-mark absolute inset-0 -z-10 ${swipe ? "spine-mark-swipe" : ""}`} />}
                  <Icon className={`h-[22px] w-[22px] ${active && swipe ? "spine-icon-in" : ""}`} aria-hidden strokeWidth={active ? 2.25 : 1.75} />
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
