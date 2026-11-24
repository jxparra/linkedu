"use client";

import { Check, GraduationCap, Loader2, Lock, MapPin, School, Sparkles, Users, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { api, refreshGroups, type GroupCard as Group } from "@/lib/api";
import { coverTopic, groupNoun, groupStats } from "@/lib/groups";
import { useTilt } from "@/lib/useTilt";
import { GroupCover } from "./GroupCover";

/** Icono según el motivo de la sugerencia */
function ReasonIcon({ reason }: { reason: string }) {
  const cls = "h-3.5 w-3.5 shrink-0";
  if (reason.startsWith("Algo nuevo")) return <Sparkles className={cls} aria-hidden />;
  if (reason.startsWith("Porque estudias")) return <GraduationCap className={cls} aria-hidden />;
  if (/personas? de |Popular en/.test(reason)) return <MapPin className={cls} aria-hidden />;
  if (reason.includes("que sigues") || reason.startsWith("Para todos")) return <Users className={cls} aria-hidden />;
  if (reason.startsWith("Tu centro")) return <School className={cls} aria-hidden />;
  return <Check className={cls} aria-hidden />;
}

/**
 * Tarjeta de un grupo: portada, nombre, miembros, por qué se sugiere y "Unirte al grupo".
 * Con `dismissible`, la "X" lo quita de tus sugerencias (con "Deshacer").
 */
/**
 * Con `featured`, la tarjeta es horizontal y más grande (portada a la izquierda y la descripción visible):
 * se usa para el primer grupo de «Para ti», el único protagonista de la pantalla.
 */
export function GroupCard({
  group,
  dismissible = false,
  featured = false,
  match = false,
}: {
  group: Group;
  dismissible?: boolean;
  featured?: boolean;
  /** Encaja contigo (apartado «Para ti»): lleva el reborde de la sección */
  match?: boolean;
}) {
  const [joined, setJoined] = useState(group.is_member);
  const [members, setMembers] = useState(group.members);
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const href = `/social/grupo/${group.id}`;
  const noun = groupNoun(group.type);
  const tilt = useTilt<HTMLElement>(4);

  const join = async () => {
    setBusy(true);
    try {
      const r = await api<{ is_member: boolean; members: number }>(`/groups/${group.id}/join`, { method: "POST" });
      setJoined(r.is_member);
      setMembers(r.members);
      refreshGroups();
    } catch {
      /* se queda como estaba */
    } finally {
      setBusy(false);
    }
  };

  const dismiss = async (undo = false) => {
    setDismissed(!undo);
    await api(`/groups/${group.id}/dismiss`, { method: undo ? "DELETE" : "POST" }).catch(() => setDismissed(undo));
  };

  if (dismissed) {
    return (
      <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-1 rounded-card border border-dashed border-line bg-card p-6 text-center">
        <p className="font-semibold">Has quitado «{group.name}»</p>
        <p className="text-sm text-ink-muted">No volverá a salir en tus sugerencias.</p>
        <button type="button" onClick={() => dismiss(true)} className="mt-1 min-h-11 px-3 font-semibold text-brand-700">
          Deshacer
        </button>
      </div>
    );
  }

  return (
    <article
      {...tilt}
      className={`tilt relative flex h-full overflow-hidden rounded-card border border-line bg-card hover:border-edge ${match ? "match-ring match-social" : ""} ${featured ? "flex-col sm:h-[260px] sm:flex-row" : "flex-col"}`}
    >
      <Link href={href} tabIndex={-1} aria-hidden className={featured ? "block sm:w-[38%] sm:shrink-0" : "block"}>
        <GroupCover src={group.cover_url} topic={coverTopic(group)} className={featured ? "aspect-[2/1] w-full sm:aspect-auto sm:h-full" : "aspect-[2/1] w-full"} />
      </Link>
      {dismissible && !joined && (
        <button
          type="button"
          onClick={() => dismiss()}
          aria-label={`Quitar ${group.name} de las sugerencias`}
          title="No me interesa"
          className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      )}
      <div className={`flex flex-1 flex-col ${featured ? "p-5 sm:p-6" : "p-4"}`}>
        <h3 className={featured ? "font-display text-[26px] font-bold leading-tight tracking-tight" : "text-[17px] font-semibold leading-snug"}>
          <Link href={href} className="line-clamp-2 hover:underline">
            {group.name}
          </Link>
        </h3>
        <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-ink-muted">
          {group.privacy === "private" && <Lock className="h-3.5 w-3.5 shrink-0" aria-label="Grupo privado" />}
          {groupStats(members, group.posts_week)}
        </p>
        {featured && group.description && <p className="mt-3 line-clamp-3 max-w-[52ch] text-[15px] leading-relaxed text-ink-muted">{group.description}</p>}
        {group.reason && (
          <p className="mt-2 inline-flex max-w-full items-center gap-1.5 self-start rounded-[6px] bg-brand-50 px-2 py-1 text-[12px] font-semibold text-brand-700">
            <ReasonIcon reason={group.reason} />
            <span className="truncate">{group.reason}</span>
          </p>
        )}
        <div className={`mt-auto pt-4 ${featured ? "sm:max-w-[240px]" : ""}`}>
          {joined ? (
            <Link
              href={href}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-btn bg-brand-50 text-[15px] font-semibold text-brand-700 transition-colors hover:bg-brand-50/70"
            >
              <Check className="h-4 w-4" aria-hidden /> Unido · ver {noun}
            </Link>
          ) : (
            <button
              type="button"
              onClick={join}
              disabled={busy}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-btn bg-field text-[15px] font-semibold text-ink transition-colors hover:bg-field-hover"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Unirme
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function GroupCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-card">
      <div className="aspect-[2/1] w-full animate-pulse bg-page" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-page" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-page" />
        <div className="mt-4 h-11 animate-pulse rounded-btn bg-page" />
      </div>
    </div>
  );
}
