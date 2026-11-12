"use client";

import { Play } from "lucide-react";
import { mediaUrl, type MediaItem } from "@/lib/api";

/**
 * Fotos, vídeos y GIF de una publicación.
 * 1 → completo · 2 → dos columnas · 3 → uno grande y dos pequeños · 4+ → cuadrícula 2×2 con "+N".
 * En el feed, pulsar una miniatura abre la publicación (`onOpen`); en el panel se ven todos a tamaño completo.
 */
export function MediaGallery({ media, onOpen, full = false }: { media: MediaItem[]; onOpen?: () => void; full?: boolean }) {
  if (!media.length) return null;

  if (full) {
    return (
      <div className="space-y-1 bg-black/95">
        {media.map((m, i) => (
          <MediaView key={i} item={m} className="max-h-[70vh] w-full object-contain" controls />
        ))}
      </div>
    );
  }

  if (media.length === 1) {
    return <MediaView item={media[0]} className="max-h-[520px] w-full bg-page object-cover" controls />;
  }

  const shown = media.slice(0, 4);
  const extra = media.length - shown.length;
  const layout =
    media.length === 2
      ? "grid-cols-2 [&>*]:aspect-square"
      : media.length === 3
        ? "grid-cols-2 grid-rows-2 [&>*:first-child]:row-span-2 aspect-[4/3]"
        : "grid-cols-2 [&>*]:aspect-square";

  return (
    <div className={`grid gap-0.5 bg-line ${layout}`}>
      {shown.map((m, i) => (
        <button
          key={i}
          type="button"
          onClick={onOpen}
          aria-label={m.type === "video" ? "Ver vídeo" : "Ver imagen"}
          className="relative block min-h-0 overflow-hidden bg-page"
        >
          <MediaView item={m} className="h-full w-full object-cover" />
          {m.type === "video" && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/20">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-card/90 text-ink shadow-lg">
                <Play className="ml-1 h-6 w-6 fill-current" aria-hidden />
              </span>
            </span>
          )}
          {extra > 0 && i === shown.length - 1 && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-3xl font-bold text-white">+{extra}</span>
          )}
        </button>
      ))}
    </div>
  );
}

function MediaView({ item, className, controls = false }: { item: MediaItem; className: string; controls?: boolean }) {
  if (item.type === "video") {
    return (
      <video
        src={mediaUrl(item.url)}
        className={`${className} bg-ink`}
        controls={controls}
        muted={!controls}
        playsInline
        preload="metadata"
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={mediaUrl(item.url)} alt="" loading="lazy" className={className} />;
}
