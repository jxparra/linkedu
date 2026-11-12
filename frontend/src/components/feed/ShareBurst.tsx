"use client";

import type { CSSProperties } from "react";

const RAYS = 8;

/**
 * Animación al compartir: las flechas del icono giran (ver `animate-share-spin`), sale un anillo ámbar
 * y 8 rayos cortos salen disparados en círculo, alternando ámbar y azul. Se monta de nuevo en cada
 * "compartir" (cambia `key`).
 */
export function ShareBurst() {
  return (
    <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
      <span
        className="share-burst absolute left-0 top-0 h-8 w-8 rounded-full border-2 border-accent-400"
        style={{ animation: "like-ring 550ms ease-out forwards" }}
      />
      {Array.from({ length: RAYS }, (_, i) => (
        <span
          key={i}
          className="share-burst absolute left-0 top-0 h-2.5 w-[3px] rounded-full"
          style={
            {
              background: i % 2 ? "#2EC4B6" : "#FFD23F",
              "--a": `${(360 / RAYS) * i + 22.5}deg`,
              animation: `share-ray 520ms cubic-bezier(0.2, 0.8, 0.3, 1) ${i % 2 ? 60 : 0}ms forwards`,
              opacity: 0,
            } as CSSProperties
          }
        />
      ))}
      <span
        className="share-burst absolute left-0 top-0 text-xs font-bold text-accent-800"
        style={{ animation: "share-plus 700ms ease-out forwards", opacity: 0 }}
      >
        +1
      </span>
    </span>
  );
}
