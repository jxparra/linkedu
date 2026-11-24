"use client";

import { useSyncExternalStore } from "react";

/**
 * Publicaciones que ya se ven en el feed de Inicio. El panel «Publicaciones de interés»
 * las salta para no repetir lo que tienes justo al lado.
 */
let ids: ReadonlySet<number> = new Set();
const listeners = new Set<() => void>();

export function setFeedIds(next: number[]) {
  ids = new Set(next);
  listeners.forEach((l) => l());
}

export function useFeedIds(): ReadonlySet<number> {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => ids,
    () => ids,
  );
}
