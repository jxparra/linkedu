"use client";

import { ArrowUpDown, Check, LogOut, MoreHorizontal, Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { GroupCover } from "@/components/social/GroupCover";
import { SocialShell } from "@/components/social/SocialNav";
import { UnfollowDialog } from "@/components/UnfollowDialog";
import { api, refreshGroups, type MyGroup } from "@/lib/api";
import { membersText } from "@/lib/groups";
import { timeAgo } from "@/lib/time";

const SORTS = { activity: "Actividad reciente", name: "Nombre (A-Z)", joined: "Fecha en que te uniste" } as const;
type Sort = keyof typeof SORTS;

/** Menú desplegable pequeño que se cierra al pulsar fuera o con Escape. */
function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
}

function GroupItem({ group, onLeave }: { group: MyGroup; onLeave: (g: MyGroup) => void }) {
  const menu = useDropdown();
  const href = `/social/grupo/${group.id}`;
  const when = group.last_activity ?? group.joined_at;
  return (
    <li className="rounded-card border border-line bg-card p-4">
      <div className="flex items-center gap-3">
        <Link href={href} tabIndex={-1} aria-hidden className="shrink-0">
          <GroupCover src={group.cover_url} topic={group.topic} iconSize="sm" className="h-20 w-20 rounded-card" />
        </Link>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-snug">
            <Link href={href} className="line-clamp-2 hover:underline">
              {group.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-[13px] text-ink-muted">{membersText(group.members)}</p>
          {when && (
            <p className="text-[13px] text-ink-muted">
              {group.last_activity ? "Última actividad" : "Te uniste"} {timeAgo(when)}
            </p>
          )}
          {group.role === "admin" && (
            <span className="mt-1 inline-block rounded-[6px] bg-brand-50 px-2 py-0.5 text-[12px] font-semibold text-brand-700">Administrador</span>
          )}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Link
          href={href}
          className="flex min-h-11 flex-1 items-center justify-center rounded-btn bg-brand-50 text-[15px] font-semibold text-brand-700 transition-colors hover:bg-brand-50/60"
        >
          Ver grupo
        </Link>
        <div ref={menu.ref} className="relative">
          <button
            type="button"
            onClick={() => menu.setOpen((o) => !o)}
            aria-label={`Más opciones de ${group.name}`}
            aria-expanded={menu.open}
            className="flex h-11 w-11 items-center justify-center rounded-btn bg-field hover:bg-field-hover"
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden />
          </button>
          {menu.open && (
            <div role="menu" className="absolute right-0 z-10 mt-1 w-52 rounded-card border border-line bg-card p-1 shadow-lg">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  menu.setOpen(false);
                  onLeave(group);
                }}
                className="flex min-h-11 w-full items-center gap-3 rounded-btn px-3 text-left text-[15px] font-semibold text-danger hover:bg-page"
              >
                <LogOut className="h-5 w-5" aria-hidden /> Salir del grupo
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function YourGroups() {
  const [sort, setSort] = useState<Sort>("activity");
  const [groups, setGroups] = useState<MyGroup[] | null>(null);
  const menu = useDropdown();

  const load = useCallback(() => {
    api<MyGroup[]>(`/groups/mine?sort=${sort}`)
      .then(setGroups)
      .catch(() => setGroups([]));
  }, [sort]);
  useEffect(load, [load]);

  const [leaving, setLeaving] = useState<MyGroup | null>(null);

  const leave = async (g: MyGroup) => {
    setLeaving(null);
    setGroups((gs) => gs?.filter((x) => x.id !== g.id) ?? gs);
    await api(`/groups/${g.id}/join`, { method: "DELETE" }).catch(load);
    refreshGroups();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4 border-b border-line pb-4">
        <h2 className="text-lg font-bold">
          Todos los grupos a los que te has unido{groups && groups.length > 0 ? ` (${groups.length})` : ""}
        </h2>
        <div ref={menu.ref} className="relative shrink-0">
          <button
            type="button"
            onClick={() => menu.setOpen((o) => !o)}
            aria-expanded={menu.open}
            className="flex min-h-11 items-center gap-1.5 rounded-btn px-2 text-[15px] font-semibold text-brand-700 hover:bg-brand-50"
          >
            <ArrowUpDown className="h-4 w-4" aria-hidden /> Ordenar
          </button>
          {menu.open && (
            <div role="menu" className="absolute right-0 z-10 mt-1 w-60 rounded-card border border-line bg-card p-1 shadow-lg">
              {(Object.keys(SORTS) as Sort[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="menuitemradio"
                  aria-checked={sort === key}
                  onClick={() => {
                    setSort(key);
                    menu.setOpen(false);
                  }}
                  className="flex min-h-11 w-full items-center justify-between rounded-btn px-3 text-left text-[15px] hover:bg-page"
                >
                  {SORTS[key]}
                  {sort === key && <Check className="h-4 w-4 text-brand-700" aria-hidden />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {leaving && (
        <UnfollowDialog
          kind="group"
          name={leaving.name}
          picture={<GroupCover src={leaving.cover_url} topic={leaving.topic} iconSize="sm" className="h-16 w-16 rounded-card" />}
          note={leaving.role === "admin" ? "Eres administrador: lo será quien lleve más tiempo en el grupo." : undefined}
          onConfirm={() => leave(leaving)}
          onCancel={() => setLeaving(null)}
        />
      )}
      {groups === null && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-card border border-line bg-card" />
          ))}
        </div>
      )}

      {groups?.length === 0 && (
        <div className="rounded-card border border-line bg-card p-10 text-center">
          <Users className="mx-auto h-10 w-10 text-ink-subtle" aria-hidden />
          <h3 className="mt-3 text-lg font-semibold">Aún no te has unido a ningún grupo</h3>
          <p className="mx-auto mt-1 max-w-sm text-ink-muted">Busca grupos de tus estudios, de tu ciudad o de lo que te guste.</p>
          <Link href="/social" className="mt-4 inline-flex min-h-11 items-center rounded-btn border border-line px-5 font-semibold hover:border-ink-subtle">
            Ver sugerencias
          </Link>
        </div>
      )}

      {groups && groups.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {groups.map((g) => (
            <GroupItem key={g.id} group={g} onLeave={setLeaving} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default function TusGrupos() {
  return <SocialShell>{() => <YourGroups />}</SocialShell>;
}
