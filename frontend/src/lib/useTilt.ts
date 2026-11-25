"use client";

import { useCallback, useRef } from "react";

/**
 * Inclina una tarjeta hacia el puntero (máx. 5°) y mueve un brillo naranja suave bajo él.
 * Solo con ratón: en pantallas táctiles y con «reducir movimiento» no hace nada.
 * Escribe variables CSS directamente en el elemento (sin re-renderizar React); la clase `tilt` hace el resto.
 */
export function useTilt<T extends HTMLElement>(max = 5) {
  const frame = useRef(0);

  const enabled = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onPointerMove = useCallback(
    (e: React.PointerEvent<T>) => {
      if (!enabled()) return;
      const el = e.currentTarget;
      const { clientX, clientY } = e;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = (clientX - r.left) / r.width;
        const py = (clientY - r.top) / r.height;
        el.style.setProperty("--ry", `${(px - 0.5) * max * 2}deg`);
        el.style.setProperty("--rx", `${(0.5 - py) * max * 2}deg`);
        el.style.setProperty("--gx", `${px * 100}%`);
        el.style.setProperty("--gy", `${py * 100}%`);
        el.style.setProperty("--lift", "-3px");
        el.setAttribute("data-tilting", "");
      });
    },
    [max],
  );

  const onPointerLeave = useCallback((e: React.PointerEvent<T>) => {
    cancelAnimationFrame(frame.current);
    const el = e.currentTarget;
    el.removeAttribute("data-tilting");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--lift", "0px");
  }, []);

  return { onPointerMove, onPointerLeave };
}
