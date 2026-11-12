"use client";

import { Compass, MessagesSquare, Newspaper, Plus, Search, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";
import { api, type MyGroup, type User } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { timeAgo } from "@/lib/time";
import { GroupCover } from "./GroupCover";

export const SOCIAL_NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/social/feed", label: "Tu feed", icon: Newspaper },
  { href: "/social", label: "Sugerencias", icon: Compass },
  { href: "/social/grupos", label: "Tus grupos", icon: Users },
  { href: "/social/foros", label: "Foros", icon: MessagesSquare },
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
    <Suspense fallback={<div className="h-11 rounded-full bg-field" />}>
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
        className="h-11 w-full rounded-full bg-field pl-10 pr-4 text-[15px] text-ink placeholder:text-field-text focus:outline-none focus:ring-2 focus:ring-brand-600/30"
      />
    </form>
  );
}

/** Columna izquierda de Social: buscar, Tu feed / Sugerencias / Tus grupos, crear grupo y tus grupos. */
export function SocialNav() {
  const path = usePathname();
  const groups = useMyGroups();
  const t = useT();

  return (
    <nav aria-label={t("Grupos")} className="rounded-card border border-line bg-white p-3">
      <h1 className="px-2 pb-3 pt-1 text-2xl font-bold">{t("Grupos")}</h1>
      <GroupSearch />

      <ul className="mt-3 space-y-0.5">
        {SOCIAL_NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 items-center gap-3 rounded-xl px-2 text-[15px] font-semibold transition-colors ${
                  active ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-page"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${active ? "bg-brand-600 text-white" : "bg-field text-ink"}`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                {t(label)}
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href="/social/crear"
        className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-50 text-[15px] font-semibold text-brand-700 transition-colors hover:bg-brand-50/60"
      >
        <Plus className="h-5 w-5" aria-hidden /> {t("Crear nuevo grupo")}
      </Link>

      <div className="mt-4 border-t border-line pt-4">
        <div className="flex items-baseline justify-between gap-2 px-2">
          <h2 className="text-[15px] font-bold">{t("Grupos a los que te has unido")}</h2>
          <Link href="/social/grupos" className="shrink-0 text-sm font-semibold text-brand-700 hover:underline">
            {t("Ver todo")}
          </Link>
        </div>
        {groups === null ? (
          <div className="mt-3 space-y-2 px-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-page" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <p className="px-2 pt-2 text-sm text-ink-muted">Aún no estás en ningún grupo. Mira las sugerencias para encontrar uno.</p>
        ) : (
          <ul className="mt-2">
            {groups.slice(0, 8).map((g) => {
              const active = path === `/social/grupo/${g.id}`;
              const when = g.last_activity ?? g.joined_at;
              return (
                <li key={g.id}>
                  <Link
                    href={`/social/grupo/${g.id}`}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-2 py-2 transition-colors ${active ? "bg-brand-50" : "hover:bg-page"}`}
                  >
                    <GroupCover src={g.cover_url} topic={g.topic} iconSize="sm" className="h-11 w-11 shrink-0 rounded-lg" />
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-semibold leading-snug">{g.name}</span>
                      {when && (
                        <span className="block truncate text-[12px] text-ink-muted">
                          {g.last_activity ? "Última actividad" : "Te uniste"} {timeAgo(when)}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </nav>
  );
}

/** En móvil no hay columna izquierda: pestañas arriba con lo mismo. */
export function SocialMobileTabs() {
  const path = usePathname();
  const t = useT();
  const chip = "flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors";
  return (
    <div className="mb-4 space-y-3 md:hidden">
      <GroupSearch />
      <nav aria-label={t("Grupos")} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {SOCIAL_NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`${chip} ${active ? "bg-brand-600 text-white" : "bg-white text-ink ring-1 ring-line"}`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {t(label)}
            </Link>
          );
        })}
        <Link href="/social/crear" className={`${chip} bg-brand-50 text-brand-700`}>
          <Plus className="h-4 w-4" aria-hidden />
          {t("Crear nuevo grupo")}
        </Link>
      </nav>
    </div>
  );
}

/** Estructura de todas las pantallas de Social: menú de Grupos a la izquierda (o pestañas en móvil) y el contenido. */
export function SocialShell({ children }: { children: (user: User) => ReactNode }) {
  return (
    <AppShell wide wideLeft left={() => <SocialNav />}>
      {(user) => (
        <>
          <SocialMobileTabs />
          {children(user)}
        </>
      )}
    </AppShell>
  );
}
