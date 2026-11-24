"use client";

import { useEffect, useState } from "react";
import { api } from "./api";

/** Cuenta notificaciones y mensajes sin leer. Se actualiza cada 30 s, al volver a la pestaña y cuando se lee algo. */
/** Últimos contadores: al cambiar de página se enseñan al momento en vez de desaparecer hasta la siguiente carga. */
let lastCounts = { notifications: 0, messages: 0 };

export function useUnread(enabled: boolean) {
  const [counts, setCountsState] = useState(lastCounts);
  const setCounts = (c: typeof lastCounts) => {
    lastCounts = c;
    setCountsState(c);
  };

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const load = () =>
      Promise.all([
        api<{ unread: number }>("/notifications/unread-count"),
        api<{ unread: number }>("/messages/unread-count"),
      ])
        .then(([n, m]) => alive && setCounts({ notifications: n.unread, messages: m.unread }))
        .catch(() => {});
    load();
    const timer = setInterval(load, 30_000);
    window.addEventListener("focus", load);
    window.addEventListener("studyhub:unread", load);
    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener("focus", load);
      window.removeEventListener("studyhub:unread", load);
    };
  }, [enabled]);

  return counts;
}
