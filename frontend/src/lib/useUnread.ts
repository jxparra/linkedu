"use client";

import { useEffect, useState } from "react";
import { api } from "./api";

/** Cuenta notificaciones y mensajes sin leer. Se actualiza cada 30 s, al volver a la pestaña y cuando se lee algo. */
export function useUnread(enabled: boolean) {
  const [counts, setCounts] = useState({ notifications: 0, messages: 0 });

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
