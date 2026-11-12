"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type Trend } from "@/lib/api";
import { timeAgo } from "@/lib/time";

export function TrendsPanel() {
  const [trends, setTrends] = useState<Trend[] | null>(null);

  useEffect(() => {
    api<Trend[]>("/trends").then(setTrends).catch(() => setTrends([]));
  }, []);

  return (
    <section aria-labelledby="trends-title" className="rounded-card border border-line bg-white p-5">
      <h2 id="trends-title" className="text-lg font-bold">
        Tendencias en StudyHub
      </h2>
      <p className="mt-0.5 text-[13px] text-ink-muted">Las comunidades con más actividad</p>
      {trends === null ? (
        <div className="mt-4 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-page" />
          ))}
        </div>
      ) : trends.length === 0 ? (
        <p className="mt-4 text-[15px] text-ink-muted">Aún no hay actividad. Publica en una comunidad para empezar.</p>
      ) : (
        <ol className="mt-3">
          {trends.map((t) => (
            <li key={t.id}>
              <Link href="/foros" className="-mx-2 block rounded-lg px-2 py-2.5 hover:bg-page">
                <span className="block font-semibold leading-snug">{t.name}</span>
                <span className="mt-0.5 block text-[13px] text-ink-muted">
                  {t.posts} {t.posts === 1 ? "publicación" : "publicaciones"}
                  {t.last_activity && ` · ${timeAgo(t.last_activity)}`}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
