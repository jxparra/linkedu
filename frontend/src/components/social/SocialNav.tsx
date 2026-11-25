"use client";

import { Compass, Newspaper, Plus, Search, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";
import { api, type MyGroup, type User } from "@/lib/api";
import { useT } from "@/lib/i18n";

/** Apartados de Social. Foros no está aquí: tiene su propio sitio en el lomo. */
export const SOCIAL_NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/social", label: "Descubrir", icon: Compass },
  { href: "/social/feed", label: "Tu feed", icon: Newspaper },
  { href: "/social/grupos", label: "Tus grupos", icon: Users },
];

/** Lista "Grupos a los que te has unido". Se recarga cuando te unes o sales de un grupo. */
export function useMyGroups() {
  const [groups, setGroups] = useState<MyGroup[] | null>(null);
  const load = useCallback(() => {
    api<MyGroup[]>("/groups/mine")
      .then(setGroups)
      .catch(() => setGroups([]));
  }, []);
  useEffect(() => {
    load();
    window.addEventListener("studyhub:groups", load);
    return () => window.removeEventListener("studyhub:groups", load);
  }, [load]);
  return groups;
}

/** Buscador de grupos (lleva a /social/buscar?q=…). */
export function GroupSearch({ autoFocus = false, onDark = false }: { autoFocus?: boolean; onDark?: boolean }) {
  return (
    <Suspense fallback={<div className={`rounded-btn ${onDark ? "h-12 bg-white/10" : "h-11 bg-field"}`} />}>
      <GroupSearchInner autoFocus={autoFocus} onDark={onDark} />
    </Suspense>
  );
}

function GroupSearchInner({ autoFocus, onDark }: { autoFocus: boolean; onDark: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const path = usePathname();
  const t = useT();
  const [q, setQ] = useState(path === "/social/buscar" ? (params.get("q") ?? "") : "");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = q.trim();
    router.push(text ? `/social/buscar?q=${encodeURIComponent(text)}` : "/social/buscar");
  };

  return (
    <form role="search" onSubmit={submit} className="relative">
      <Search className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${onDark ? "text-spine-ink" : "text-field-text"}`} aria-hidden />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("Buscar grupos")}
        aria-label={t("Buscar grupos")}
        autoFocus={autoFocus}
        className={
          onDark
            ? "h-12 w-full rounded-input border border-white/15 bg-white/10 pl-10 pr-4 text-[15px] text-spine-strong placeholder:text-spine-strong/80 focus:border-mark focus:outline-none focus:ring-2 focus:ring-mark/40"
            : "h-11 w-full rounded-btn border border-transparent bg-card pl-10 pr-4 text-[15px] text-ink ring-1 ring-line placeholder:text-field-text focus:outline-none focus:ring-2 focus:ring-brand-600/40"
        }
      />
    </form>
  );
}

/** Apartados de Social (el activo en fosforito). Con `onDark` van dentro de la cabecera de la sección. */
export function SocialNavLinks({ onDark = false }: { onDark?: boolean }) {
  const path = usePathname();
  const t = useT();
  const tab = "flex min-h-11 shrink-0 items-center gap-2 rounded-btn px-3.5 text-[15px] font-semibold transition-colors";
  const idle = onDark ? "text-hero-ink hover:bg-white/10 hover:text-spine-strong" : "text-ink-muted hover:bg-field-hover hover:text-ink";
  return (
    <nav aria-label={t("Social")} className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0">
      {SOCIAL_NAV.map(({ href, label, icon: Icon }) => {
        const active = path === href;
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`${tab} ${active ? "nav-mark" : idle}`}>
            <Icon className="h-[18px] w-[18px]" aria-hidden />
            {t(label)}
          </Link>
        );
      })}
    </nav>
  );
}

/** Buscador de grupos y «Crear grupo». Con `onDark`, para la cabecera de Social. */
export function SocialActions({ onDark = false }: { onDark?: boolean }) {
  const t = useT();
  const create = onDark
    ? "h-12 border border-white/25 bg-white/10 text-spine-strong hover:bg-white/15"
    : "min-h-11 bg-brand-600 text-on-brand hover:bg-brand-hover";
  return (
    <div className={`flex gap-2 ${onDark ? "max-w-xl" : "md:ml-auto"}`}>
      <div className={`min-w-0 flex-1 ${onDark ? "" : "md:w-64 md:flex-none"}`}>
        <GroupSearch onDark={onDark} />
      </div>
      <Link href="/social/crear" className={`inline-flex shrink-0 items-center gap-1.5 rounded-btn px-4 text-[15px] font-semibold transition-colors ${create}`}>
        <Plus className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">{t("Crear grupo")}</span>
        <span className="sr-only sm:hidden">{t("Crear grupo")}</span>
      </Link>
    </div>
  );
}

/**
 * Menú de Social: una sola fila con los apartados (el activo en fosforito), el buscador de grupos y «Crear grupo».
 * En Descubrir no sale: va dentro de la cabecera de la sección.
 */
export function SocialTabs() {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
      <SocialNavLinks />
      <SocialActions />
    </div>
  );
}

/**
 * Estructura de las pantallas de Social y Foros, a una columna y sin panel lateral.
 * En Foros (que tiene su sitio en el lomo) no salen los apartados de Social y todo toma el color de Foros.
 */
export function SocialShell({ children, tabs = true }: { children: (user: User) => ReactNode; /** false: la página pone el menú ella misma (Descubrir, dentro de su cabecera) */ tabs?: boolean }) {
  const path = usePathname();
  const foros = path.startsWith("/social/foros");
  return (
    <AppShell wide section={foros ? "foros" : "social"}>
      {(user) => (
        <>
          {!foros && tabs && <SocialTabs />}
          {children(user)}
        </>
      )}
    </AppShell>
  );
}
