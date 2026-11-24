"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getToken } from "@/lib/api";

/** En la portada: si ya has iniciado sesión, te lleva a Inicio en vez de enseñarte «Crear cuenta». */
export function RedirectIfLoggedIn() {
  const router = useRouter();
  useEffect(() => {
    if (getToken()) router.replace("/inicio");
  }, [router]);
  return null;
}
