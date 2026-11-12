"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiError, getToken, setToken, type User } from "./api";

/** Carga el usuario actual. Si no hay sesión, vuelve a /registro. */
export function useUser() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/registro");
      return;
    }
    api<User>("/auth/me")
      .then(setUser)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) {
          setToken(null);
          router.replace("/login");
        }
      });
  }, [router]);

  return { user, setUser };
}
