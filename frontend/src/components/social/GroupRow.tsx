"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { GroupCard as Group } from "@/lib/api";
import { GroupCard, GroupCardSkeleton } from "./GroupCard";

/** Cabecera de un apartado: título, subtítulo y "Ver todo". */
export function SectionHeader({ id, title, subtitle, href }: { id: string; title: string; subtitle?: string; href?: string }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 id={id} className="text-xl font-bold">
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-[15px] text-ink-muted">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="shrink-0 rounded-md px-1 py-1 text-[15px] font-semibold text-brand-700 hover:underline">
          Ver todo
        </Link>
      )}
    </div>
  );
}

/**
 * Carrusel horizontal de grupos con flechas (como "Sugerencias para ti" de la referencia).
 * Las flechas solo salen cuando hay más tarjetas a ese lado. En móvil se desliza con el dedo.
 */
export function GroupRow({
  id,
  title,
  subtitle,
  href,
  groups,
  empty,
}: {
  id: string;
  title: string;
  subtitle?: string;
  href?: string;
  groups: Group[] | null;
  empty?: ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update, groups]);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  const arrow = "absolute top-[28%] z-10 hidden h-12 w-12 items-center justify-center rounded-full border border-line bg-white text-ink shadow-md transition-colors hover:bg-page sm:flex";
  const card = "w-[82%] shrink-0 snap-start sm:w-[calc((100%-16px)/2)] xl:w-[calc((100%-32px)/3)]";

  return (
    <section aria-labelledby={id}>
      <SectionHeader id={id} title={title} subtitle={subtitle} href={groups && groups.length > 0 ? href : undefined} />
      {groups !== null && groups.length === 0 ? (
        empty
      ) : (
        <div className="relative">
          <div ref={track} onScroll={update} className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-1">
            {groups === null
              ? [0, 1, 2].map((i) => (
                  <div key={i} className={card}>
                    <GroupCardSkeleton />
                  </div>
                ))
              : groups.map((g) => (
                  <div key={g.id} className={card}>
                    <GroupCard group={g} dismissible />
                  </div>
                ))}
          </div>
          {edges.left && (
            <button type="button" onClick={() => scroll(-1)} aria-label="Anteriores" className={`${arrow} -left-4`}>
              <ChevronLeft className="h-6 w-6" aria-hidden />
            </button>
          )}
          {edges.right && (
            <button type="button" onClick={() => scroll(1)} aria-label="Siguientes" className={`${arrow} -right-4`}>
              <ChevronRight className="h-6 w-6" aria-hidden />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
