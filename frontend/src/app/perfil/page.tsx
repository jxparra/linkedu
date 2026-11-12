"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/lib/useUser";

/** /perfil → tu propio perfil */
export default function MiPerfil() {
  const router = useRouter();
  const { user } = useUser();
  useEffect(() => {
    if (user) router.replace(`/perfil/${user.id}`);
  }, [user, router]);
  return <main className="min-h-screen" />;
}
