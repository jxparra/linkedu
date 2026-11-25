"use client";

import { ImagePlus, Video } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Post, User } from "@/lib/api";
import { Avatar } from "../Avatar";
import { displayName } from "../app/TopBar";
import { CreatePostModal, type ComposerPanel } from "./CreatePostModal";

/** Caja de "¿Qué quieres compartir?". Con `community` se publica directamente en ese grupo. */
export function Composer({
  user,
  onPublished,
  community,
}: {
  user: User;
  onPublished: (p: Post) => void;
  community?: { id: number; name: string };
}) {
  const [panel, setPanel] = useState<ComposerPanel | null>(null);
  const name = displayName(user);
  const firstName = user.student_profile?.name ?? name;

  return (
    <div className="rounded-card border border-line bg-card p-4">
      <div className="flex items-center gap-3">
        <Link href="/perfil" aria-label="Ir a tu perfil" className="shrink-0 rounded-full">
          <Avatar name={name} size="md" role={user.role} />
        </Link>
        <button
          type="button"
          onClick={() => setPanel("main")}
          className="min-h-12 min-w-0 flex-1 truncate rounded-btn bg-field px-4 text-left text-[15px] text-field-text transition-colors hover:bg-field-hover"
        >
          {community ? `Escribe algo en el grupo, ${firstName}…` : `¿Qué quieres compartir, ${firstName}?`}
        </button>
        <div className="hidden items-center sm:flex">
          <button type="button" onClick={() => setPanel("camera")} aria-label="Grabar vídeo" title="Grabar vídeo" className="flex h-11 w-11 items-center justify-center rounded-btn hover:bg-field-hover">
            <Video className="h-6 w-6 text-ink-muted" aria-hidden />
          </button>
          <button type="button" onClick={() => setPanel("photo")} aria-label="Foto o vídeo" title="Foto/vídeo" className="flex h-11 w-11 items-center justify-center rounded-btn hover:bg-field-hover">
            <ImagePlus className="h-6 w-6 text-ink-muted" aria-hidden />
          </button>
        </div>
      </div>
      {panel && <CreatePostModal user={user} initialPanel={panel} initialCommunity={community} onClose={() => setPanel(null)} onPublished={onPublished} />}
    </div>
  );
}
