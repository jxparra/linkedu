"use client";

import { useMemo, type CSSProperties } from "react";

const COLORS = ["#1F6F8B", "#FFD23F", "#1F9D57", "#A78BFA", "#5FB3D0", "#FFD23F"]; // colores de las secciones
const PIECES = 14;

/** Pequeña explosión de confeti alrededor del icono de "me gusta". Se monta de nuevo en cada like (cambia `key`). */
export function LikeBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECES }, (_, i) => {
        const angle = (i / PIECES) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const dist = 22 + Math.random() * 18;
        return {
          dx: `${Math.cos(angle) * dist}px`,
          dy: `${Math.sin(angle) * dist - 6}px`,
          rot: `${(Math.random() - 0.5) * 540}deg`,
          color: COLORS[i % COLORS.length],
          round: i % 3 === 0,
          size: 4 + Math.random() * 3,
          delay: Math.random() * 60,
        };
      }),
    [],
  );

  return (
    <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
      <span
        className="like-burst absolute left-0 top-0 h-8 w-8 rounded-full border-2 border-brand-600"
        style={{ animation: "like-ring 500ms ease-out forwards" }}
      />
      {pieces.map((p, i) => (
        <span
          key={i}
          className={`like-burst absolute left-0 top-0 ${p.round ? "rounded-full" : "rounded-[1px]"}`}
          style={
            {
              width: p.size,
              height: p.round ? p.size : p.size * 1.8,
              background: p.color,
              "--dx": p.dx,
              "--dy": p.dy,
              "--rot": p.rot,
              animation: `like-confetti 700ms cubic-bezier(0.15, 0.7, 0.35, 1) ${p.delay}ms forwards`,
              opacity: 0,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
