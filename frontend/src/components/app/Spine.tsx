"use client";

import { Briefcase, Home, MessagesSquare, Users } from "lucide-react";
import Image from "next/image";
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

/**
 * Símbolo de Linkedu: los dos eslabones del logotipo (azul y naranja).
 * `onDark` usa siempre la versión con el azul aclarado (para fondos oscuros en los dos temas, como el lomo);
 * si no, cambia sola con el tema.
 */
export function BrandMark({ className = "", onDark = false, size = 40 }: { className?: string; onDark?: boolean; size?: number }) {
  return (
    <span aria-hidden className={`relative inline-flex shrink-0 items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {onDark ? (
        <Image src="/logo-mark-dark.png" alt="" width={size} height={size} />
      ) : (
        <>
          <Image src="/logo-mark.png" alt="" width={size} height={size} className="logo-light" />
          <Image src="/logo-mark-dark.png" alt="" width={size} height={size} className="logo-dark" />
        </>
      )}
    </span>
  );
}

/** Sección marcada en la página anterior: el trazo naranja solo se pinta cuando cambias de sección, no al recargar. */
let lastActive: string | null = null;

/**
 * El lomo: columna fija a la izquierda, como el lomo de un cuaderno.
 * Cristal esmerilado: blanco translúcido y desenfocado sobre un brillo azul y naranja (los colores del logo), con borde.
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
    <>
    {/* Destellos del logo detrás del cristal (solo ordenador, como el lomo) */}
    <div aria-hidden className="spine-glow hidden sm:block" />
    <nav aria-label="Principal" className="spine-glass fixed inset-y-0 left-0 z-30 hidden w-[84px] flex-col items-center border-r border-edge pb-6 text-rail-ink sm:flex">
      <Link
        href="/inicio"
        aria-label="Linkedu, ir al inicio"
        className="mt-3 mb-6 flex h-14 w-14 items-center justify-center rounded-btn hover:bg-field-hover"
      >
        <BrandMark size={44} />
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
                  active ? "text-rail-strong" : "hover:text-rail-strong"
                }`}
              >
                <span
                  className={`relative isolate flex h-8 w-12 items-center justify-center rounded-btn transition-colors ${
                    active ? "text-on-mark" : "group-hover:bg-field-hover"
                  }`}
                >
                  {/* El naranja va debajo del icono y se pinta de izquierda a derecha al llegar a la sección */}
                  {active && <span aria-hidden className={`nav-mark absolute inset-0 -z-10 ${swipe ? "spine-mark-swipe" : ""}`} />}
                  <Icon className={`h-[22px] w-[22px] ${active && swipe ? "spine-icon-in" : ""}`} aria-hidden strokeWidth={active ? 2.25 : 2} />
                </span>
                {t(label)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
    </>
  );
}
