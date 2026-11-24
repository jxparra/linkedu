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
export function GroupSearch({ autoFocus = false }: { autoFocus?: boolean }) {
  return (
    <Suspense fallback={<div className="h-11 rounded-btn bg-field" />}>
      <GroupSearchInner autoFocus={autoFocus} />
    </Suspense>
  );
}

function GroupSearchInner({ autoFocus }: { autoFocus: boolean }) {
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
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-field-text" aria-hidden />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("Buscar grupos")}
        aria-label={t("Buscar grupos")}
        autoFocus={autoFocus}
        className="h-11 w-full rounded-btn border border-transparent bg-card pl-10 pr-4 text-[15px] text-ink ring-1 ring-line placeholder:text-field-text focus:outline-none focus:ring-2 focus:ring-brand-600/40"
      />
    </form>
  );
}

/**
 * Menú de Social: una sola fila con los apartados (el activo en fosforito), el buscador de grupos y «Crear grupo».
 * Sustituye a la antigua columna izquierda, que repetía lo que ya está en el lomo.
 */
export function SocialTabs() {
  const path = usePathname();
  const t = useT();
  const tab = "flex min-h-11 shrink-0 items-center gap-2 rounded-btn px-3.5 text-[15px] font-semibold transition-colors";
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
      <nav aria-label={t("Social")} className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0">
        {SOCIAL_NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`${tab} ${active ? "nav-mark" : "text-ink-muted hover:bg-field-hover hover:text-ink"}`}>
              <Icon className="h-[18px] w-[18px]" aria-hidden />
              {t(label)}
            </Link>
          );
        })}
      </nav>
      <div className="flex gap-2 md:ml-auto">
        <div className="min-w-0 flex-1 md:w-64 md:flex-none">
          <GroupSearch />
        </div>
        <Link href="/social/crear" className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-btn bg-brand-600 px-4 text-[15px] font-semibold text-on-brand hover:bg-brand-hover">
          <Plus className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{t("Crear grupo")}</span>
          <span className="sr-only sm:hidden">{t("Crear grupo")}</span>
        </Link>
      </div>
    </div>
  );
}

/**
 * Estructura de las pantallas de Social y Foros, a una columna y sin panel lateral.
 * En Foros (que tiene su sitio en el lomo) no salen los apartados de Social y todo toma el color de Foros.
 */
export function SocialShell({ children }: { children: (user: User) => ReactNode }) {
  const path = usePathname();
  const foros = path.startsWith("/social/foros");
  return (
    <AppShell wide section={foros ? "foros" : "social"}>
      {(user) => (
        <>
          {!foros && <SocialTabs />}
          {children(user)}
        </>
      )}
    </AppShell>
  );
}
