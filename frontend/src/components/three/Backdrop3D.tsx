"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import type { SceneKind } from "./Scene3D";

/**
 * Carga Three.js solo en el navegador y en un trozo aparte del paquete,
 * para que la primera pintura de la página no espere a la escena 3D.
 */
const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

/** Con «reducir movimiento» no se monta la escena: ni se mueve ni se descarga Three.js. */
const REDUCE = "(prefers-reduced-motion: reduce)";
function subscribe(cb: () => void) {
  const m = window.matchMedia(REDUCE);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}
function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCE).matches,
    () => true, // en el servidor no se pinta (la escena es solo de navegador)
  );
}

export function Backdrop3D({
  kind,
  dense,
  onDark,
  ambient,
  fill,
  className,
}: {
  kind: SceneKind;
  dense?: boolean;
  onDark?: boolean;
  ambient?: boolean;
  fill?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return <Scene3D kind={kind} dense={dense} onDark={onDark} ambient={ambient} fill={fill} className={className} />;
}
