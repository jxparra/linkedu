"use client";

import { Hammer } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { ButtonLink } from "@/components/Button";

const SECTIONS: Record<string, { title: string; text: string }> = {
  reels: { title: "Reels", text: "Vídeos cortos de estudiantes: consejos, experiencias y cómo es por dentro cada carrera." },
  eventos: { title: "Eventos", text: "Jornadas, ferias de empleo y quedadas de estudio cerca de ti." },
};

export default function Seccion() {
  const { seccion } = useParams<{ seccion: string }>();
  const section = SECTIONS[seccion];
  if (!section) notFound();

  return (
    <AppShell>
      {() => (
        <div className="rounded-card border border-line bg-card p-8 text-center sm:p-12">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-50 text-accent-800">
            <Hammer className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-4 text-[28px] font-semibold">{section.title}</h1>
          <p className="mx-auto mt-2 max-w-md text-ink-muted">{section.text}</p>
          <p className="mt-1 text-sm font-semibold text-accent-800">Próximamente</p>
          <ButtonLink href="/inicio" variant="secondary" className="mt-6">
            Volver al inicio
          </ButtonLink>
        </div>
      )}
    </AppShell>
  );
}
