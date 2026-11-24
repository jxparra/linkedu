"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api, ApiError, getToken, setToken, type User } from "./api";

/**
 * Usuario de la última carga, guardado mientras la pestaña esté abierta. Cada página monta su propio AppShell:
 * sin esta copia, al cambiar de sección la página se quedaba en blanco y tu foto pasaba a «?» hasta que llegaba /auth/me.
 * Va unido al token: si cambia la sesión, no se usa.
 */
let cached: { token: string; user: User } | null = null;

function cachedUser(): User | null {
  if (typeof window === "undefined" || !cached) return null;
  return cached.token === getToken() ? cached.user : null;
}

/** Carga el usuario actual (al instante si ya se cargó en otra página, y se refresca detrás). Si no hay sesión, vuelve a /registro. */
export function useUser() {
  const router = useRouter();
  const [user, setUserState] = useState<User | null>(cachedUser);

  const setUser = useCallback((u: User | null | ((prev: User | null) => User | null)) => {
    setUserState((prev) => {
      const next = typeof u === "function" ? u(prev) : u;
      const token = getToken();
      cached = next && token ? { token, user: next } : null;
      return next;
    });
  }, []);

  useEffect(() => {
    if (!getToken()) {
      cached = null;
      router.replace("/registro");
      return;
    }
    api<User>("/auth/me")
      .then(setUser)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) {
          cached = null;
          setToken(null);
          router.replace("/login");
        }
      });
  }, [router, setUser]);

  return { user, setUser };
}
