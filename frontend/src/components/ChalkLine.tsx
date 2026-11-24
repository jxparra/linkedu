import type { ReactNode } from "react";

/**
 * Trazo de tiza bajo un título, que se dibuja una vez al entrar (`.chalk-line` en globals.css).
 * `mark` (fosforito) solo sobre la pizarra de las cabeceras de sección; `ink` en las pantallas
 * sin cabecera (Mensajes, Notificaciones, Ajustes, Estadísticas), para no añadir otro color llamativo.
 */
export function ChalkLine({ tone = "mark" }: { tone?: "mark" | "ink" }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      className={`chalk-line absolute -bottom-2.5 left-0 h-3 w-full ${tone === "ink" ? "chalk-line-ink" : ""}`}
    >
      <path d="M2 8 C 40 3, 90 10, 130 5 S 185 4, 198 7" />
    </svg>
  );
}

/** El texto de un título con el trazo de tiza debajo (se pone dentro del h1). */
export function ChalkText({ children, tone = "ink" }: { children: ReactNode; tone?: "mark" | "ink" }) {
  return (
    <span className="relative inline-block">
      {children}
      <ChalkLine tone={tone} />
    </span>
  );
}
