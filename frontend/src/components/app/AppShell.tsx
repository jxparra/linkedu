"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { nextStep } from "@/lib/onboarding";
import { useUser } from "@/lib/useUser";
import type { User } from "@/lib/api";
import { MobileNav } from "./MobileNav";
import { Spine } from "./Spine";
import { TopBar } from "./TopBar";
import { InterestPanel } from "./InterestPanel";
import { Backdrop3D } from "../three/Backdrop3D";

/**
 * Estructura de la app con sesión iniciada: lomo (secciones), barra superior, contenido y, a la derecha, el panel de interés.
 * Sin columna izquierda por defecto: tu perfil y «Lo tuyo» están en el menú de tu foto, y las secciones en el lomo.
 * Con `left` aparece una columna izquierda propia (Ajustes, Estadísticas). Con `wide` no hay panel derecho.
 * Con `bare` solo está el contenido (Crear grupo). Con `section`, el fondo y la cabecera toman el color de la sección.
 * Con `ambient`, detrás de todo flota la escena 3D de estudio (Inicio).
 */
export function AppShell({
  children,
  wide = false,
  left,
  bare = false,
  ambient = false,
  section,
}: {
  children: (user: User) => ReactNode;
  wide?: boolean;
  /** Columna izquierda propia (la usan Estadísticas y Ajustes) */
  left?: (user: User | null) => ReactNode;
  bare?: boolean;
  ambient?: boolean;
  section?: "social" | "foros" | "empleo";
}) {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (user && !user.onboarding_done) router.replace(nextStep(user));
  }, [user, router]);

  const hasLeft = !!left && !bare;
  const hasRight = !wide && !bare;
  const columns = hasLeft
    ? `md:grid-cols-[240px_minmax(0,1fr)] ${hasRight ? "xl:grid-cols-[240px_minmax(0,1fr)_300px]" : ""}`
    : hasRight
      ? "lg:grid-cols-[minmax(0,1fr)_320px]"
      : "";

  return (
    <div data-section={section} className="relative isolate min-h-screen overflow-x-clip bg-page pb-20 sm:pb-0 sm:pl-[84px]">
      {ambient && <Backdrop3D kind="estudio" ambient className="ambient-scene fixed inset-0 -z-10 hidden lg:block" />}
      {/* Primer Tab: saltar el lomo y la barra superior e ir directo al contenido */}
      <a
        href="#contenido"
        className="nav-mark sr-only z-50 px-4 py-2.5 font-semibold focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Saltar al contenido
      </a>
      <Spine />
      <TopBar user={user} />
      <div className={`mx-auto grid gap-6 px-4 py-6 max-w-[1120px] ${columns}`}>
        {hasLeft && left && (
          <aside className="hidden md:block">
            <div className="sticky top-[88px]">{left(user)}</div>
          </aside>
        )}
        <main id="contenido" tabIndex={-1} className="page-enter min-w-0 scroll-mt-[88px] focus:outline-none">{user ? children(user) : <div className="h-64 animate-pulse rounded-card bg-card" />}</main>
        {hasRight && (
          <aside className="hidden lg:block">
            <div className="no-scrollbar sticky top-[88px] -m-0.5 max-h-[calc(100vh-112px)] overflow-y-auto p-0.5">
              <InterestPanel />
            </div>
          </aside>
        )}
      </div>
      <MobileNav />
    </div>
  );
}
