"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { nextStep } from "@/lib/onboarding";
import { useUser } from "@/lib/useUser";
import type { User } from "@/lib/api";
import { MobileNav } from "./MobileNav";
import { SideNav } from "./SideNav";
import { TopBar } from "./TopBar";
import { TrendsPanel } from "./TrendsPanel";

/**
 * Estructura de la app con sesión iniciada: barra superior, menú izquierdo, contenido y panel derecho.
 * Con `wide` no se muestra el panel de tendencias y el contenido ocupa ese hueco (Empleo, Estadísticas, Ajustes).
 * Con `wideLeft` la columna izquierda es más ancha (menú de Grupos). Con `bare` no hay columnas: solo el contenido (Crear grupo).
 */
export function AppShell({
  children,
  wide = false,
  left,
  wideLeft = false,
  bare = false,
}: {
  children: (user: User) => ReactNode;
  wide?: boolean;
  /** Sustituye al menú izquierdo (lo usan Estadísticas y Ajustes) */
  left?: (user: User | null) => ReactNode;
  wideLeft?: boolean;
  bare?: boolean;
}) {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (user && !user.onboarding_done) router.replace(nextStep(user));
  }, [user, router]);

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <TopBar user={user} />
      <div
        className={`mx-auto grid max-w-[1280px] gap-6 px-4 py-6 ${
          bare
            ? ""
            : wideLeft
              ? "md:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]"
              : `md:grid-cols-[220px_minmax(0,1fr)] ${wide ? "xl:grid-cols-[240px_minmax(0,1fr)]" : "xl:grid-cols-[240px_minmax(0,1fr)_300px]"}`
        }`}
      >
        {!bare && (
          <aside className="hidden md:block">
            <div className={`sticky top-[88px] ${wideLeft ? "no-scrollbar max-h-[calc(100vh-112px)] overflow-y-auto p-0.5" : ""}`}>
              {left ? left(user) : <SideNav user={user} />}
            </div>
          </aside>
        )}
        <main className="min-w-0">{user ? children(user) : <div className="h-64 animate-pulse rounded-card bg-white" />}</main>
        {!wide && !bare && (
          <aside className="hidden xl:block">
            <div className="sticky top-[88px]">
              <TrendsPanel />
            </div>
          </aside>
        )}
      </div>
      <MobileNav />
    </div>
  );
}
