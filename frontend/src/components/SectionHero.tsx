import type { ReactNode } from "react";
import { ChalkText } from "./ChalkLine";
import { Backdrop3D } from "./three/Backdrop3D";
import type { SceneKind } from "./three/Scene3D";

/**
 * Cabecera de sección (Social, Foros, Empleo): un fondo oscuro con la escena 3D de la sección
 * a la derecha y el título subrayado con tiza, que se dibuja al entrar.
 */
export function SectionHero({
  kind,
  title,
  subtitle,
  children,
  fullScene = false,
  bleed = false,
  aside,
}: {
  kind: Exclude<SceneKind, "estudio">;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  /** La escena 3D llena toda la cabecera (también en el móvil) en lugar de solo la mitad derecha */
  fullScene?: boolean;
  /** Banda de lado a lado de la pantalla (del lomo al borde derecho), sin esquinas; el contenido sigue alineado con la página */
  bleed?: boolean;
  /** Algo a la derecha del título y a su misma altura (las pestañas de Empleo); en el móvil va debajo */
  aside?: ReactNode;
}) {
  const round = bleed ? "" : "rounded-card";
  return (
    // Sin overflow-hidden en la cabecera: las listas que se abren dentro (provincia, sugerencias del buscador)
    // tienen que poder salir por debajo. Solo se recorta la capa de la escena 3D. z-10: por encima de lo que viene después.
    <section className={`section-hero relative isolate z-10 bg-hero text-spine-strong ${round} ${bleed ? "hero-bleed -mt-6" : ""}`}>
      <div aria-hidden className={`absolute inset-0 -z-10 overflow-hidden ${round}`}>
        {fullScene ? (
          // Toda la cabecera, con los objetos repartidos en proporción
          <Backdrop3D kind={kind} onDark fill className="section-hero-scene-full absolute inset-0" />
        ) : (
          // La mitad derecha (en el móvil no se muestra: el texto ocupa todo el ancho)
          <Backdrop3D kind={kind} onDark className="section-hero-scene absolute inset-y-0 right-0 hidden w-3/5 sm:block" />
        )}
      </div>
      {/* En la banda, el contenido va alineado con la página (mismo ancho máximo que el resto) */}
      <div className={bleed ? "relative mx-auto max-w-[1120px] px-4 pb-6 pt-6 sm:pb-20 sm:pt-16" : "relative px-5 py-6 sm:px-7 sm:py-7"}>
        {/* Veladura del color de la cabecera detrás del título y el subtítulo, para que se lean sobre la escena */}
        {fullScene && <div aria-hidden className="hero-text-veil absolute inset-0 -z-[1]" />}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-[34rem]">
          <h1 className="text-balance text-[32px] font-extrabold leading-none tracking-[-0.03em] sm:text-[40px]">
            <ChalkText tone="mark">{title}</ChalkText>
          </h1>
          {subtitle && <p className={`mt-4 max-w-[46ch] text-pretty text-[15px] leading-relaxed text-hero-ink ${bleed ? "hidden sm:block" : ""}`}>{subtitle}</p>}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
        </div>
        {children && <div className={bleed ? "mt-5 sm:mt-8" : "mt-5"}>{children}</div>}
      </div>
    </section>
  );
}
