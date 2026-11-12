"use client";

import { Check, Loader2, MessageCircle, Plus, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { announceRelation, api, onRelation, refreshGroups, type Discover, type GroupCard } from "@/lib/api";
import { coverTopic, groupNoun, membersText } from "@/lib/groups";
import { timeAgo } from "@/lib/time";
import { Avatar } from "../Avatar";
import { UnfollowDialog } from "../UnfollowDialog";
import { GroupCover } from "../social/GroupCover";

/**
 * Columna derecha: publicaciones, personas y foros/grupos recomendados según tu perfil
 * (tus estudios, tu centro, tus temas y la gente que sigues). Datos: GET /discover.
 */
export function InterestPanel() {
  const [data, setData] = useState<Discover | null>(null);

  useEffect(() => {
    api<Discover>("/discover")
      .then(setData)
      .catch(() => setData({ posts: [], people: [], communities: [] }));
  }, []);

  return (
    <div className="space-y-4">
      <section aria-labelledby="interes-title" className="rounded-card border border-line bg-card p-4">
        <h2 id="interes-title" className="px-1 text-lg font-bold">
          Publicaciones de interés
        </h2>
        <p className="px-1 text-[13px] text-ink-muted">Según tus estudios y lo que sigues</p>
        {data === null ? (
          <Skeleton rows={3} />
        ) : data.posts.length === 0 ? (
          <p className="px-1 pt-3 text-sm text-ink-muted">Aún no hay publicaciones de tus temas. Únete a algún foro para empezar.</p>
        ) : (
          <ul className="mt-2">
            {data.posts.map((p) => (
              <li key={p.id} className="border-t border-line first:border-t-0">
                <Link href={`/inicio?post=${p.id}`} className="-mx-1 block rounded-lg px-2 py-2.5 hover:bg-page">
                  <span className="block text-[12px] font-semibold text-brand-700">{p.reason}</span>
                  <span className="mt-0.5 line-clamp-2 block text-[14px] leading-snug text-ink">{p.excerpt}</span>
                  <span className="mt-1 flex items-center gap-2 text-[12px] text-ink-muted">
                    <span className="truncate">
                      {p.author} · {timeAgo(p.created_at)}
                    </span>
                    {p.likes > 0 && (
                      <span className="inline-flex shrink-0 items-center gap-0.5">
                        <ThumbsUp className="h-3 w-3" aria-hidden /> {p.likes}
                      </span>
                    )}
                    {p.comments > 0 && (
                      <span className="inline-flex shrink-0 items-center gap-0.5">
                        <MessageCircle className="h-3 w-3" aria-hidden /> {p.comments}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(data === null || data.people.length > 0) && (
        <section aria-labelledby="personas-title" className="rounded-card border border-line bg-card p-4">
          <h2 id="personas-title" className="px-1 text-base font-bold">
            Personas que quizá conozcas
          </h2>
          {data === null ? (
            <Skeleton rows={3} />
          ) : (
            <ul className="mt-2 space-y-1">
              {data.people.map((p) => (
                <PersonRow key={p.user.id} person={p} />
              ))}
            </ul>
          )}
        </section>
      )}

      {(data === null || data.communities.length > 0) && (
        <section aria-labelledby="comunidades-title" className="rounded-card border border-line bg-card p-4">
          <div className="flex items-baseline justify-between gap-2 px-1">
            <h2 id="comunidades-title" className="text-base font-bold">
              Foros y grupos para ti
            </h2>
            <Link href="/social" className="shrink-0 text-[13px] font-semibold text-brand-700 hover:underline">
              Ver más
            </Link>
          </div>
          {data === null ? (
            <Skeleton rows={3} />
          ) : (
            <ul className="mt-2 space-y-1">
              {data.communities.map((c) => (
                <CommunityRow key={c.id} group={c} />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function Skeleton({ rows }: { rows: number }) {
  return (
    <div className="mt-3 space-y-2">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-page" />
      ))}
    </div>
  );
}

/** Botón redondo: «+» para seguir o unirse; cuando ya lo has hecho, «✓», que al pulsarlo deja deshacerlo. */
function AddButton({ done, busy, label, onClick }: { done: boolean; busy: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={done}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
        done ? "bg-field text-ink-muted hover:bg-field-hover hover:text-ink" : "bg-brand-50 text-brand-700 hover:bg-brand-100"
      }`}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : done ? <Check className="h-4 w-4" aria-hidden /> : <Plus className="h-5 w-5" aria-hidden />}
    </button>
  );
}

function PersonRow({ person }: { person: Discover["people"][number] }) {
  const { user, reason } = person;
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => onRelation(({ kind, id, on }) => kind === "user" && id === user.id && setDone(on)), [user.id]);
  const toggle = async (follow: boolean) => {
    setConfirm(false);
    setBusy(true);
    try {
      await api(`/users/${user.id}/follow`, { method: follow ? "POST" : "DELETE" });
      setDone(follow);
      announceRelation({ kind: "user", id: user.id, on: follow });
    } catch {
      /* se queda como estaba */
    } finally {
      setBusy(false);
    }
  };
  return (
    <li className="flex items-center gap-3 rounded-lg px-1 py-1.5">
      <Link href={`/perfil/${user.id}`} aria-hidden tabIndex={-1} className="shrink-0">
        <Avatar name={user.name} src={user.avatar_url} size="sm" square={user.role === "company"} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/perfil/${user.id}`} className="block truncate text-[14px] font-semibold text-ink hover:underline">
          {user.name}
        </Link>
        <span className="block truncate text-[12px] text-ink-muted">{reason}</span>
      </div>
      <AddButton
        done={done}
        busy={busy}
        label={done ? `Dejar de seguir a ${user.name}` : `Seguir a ${user.name}`}
        onClick={() => (done ? setConfirm(true) : toggle(true))}
      />
      {confirm && (
        <UnfollowDialog
          name={user.name}
          avatarUrl={user.avatar_url}
          square={user.role === "company"}
          onConfirm={() => toggle(false)}
          onCancel={() => setConfirm(false)}
        />
      )}
    </li>
  );
}

function CommunityRow({ group }: { group: GroupCard }) {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const noun = groupNoun(group.type);
  useEffect(() => onRelation(({ kind, id, on }) => kind === "group" && id === group.id && setDone(on)), [group.id]);
  const toggle = async (join: boolean) => {
    setConfirm(false);
    setBusy(true);
    try {
      await api(`/groups/${group.id}/join`, { method: join ? "POST" : "DELETE" });
      setDone(join);
      announceRelation({ kind: "group", id: group.id, on: join });
      refreshGroups();
    } catch {
      /* se queda como estaba */
    } finally {
      setBusy(false);
    }
  };
  return (
    <li className="flex items-center gap-3 rounded-lg px-1 py-1.5">
      <Link href={`/social/grupo/${group.id}`} aria-hidden tabIndex={-1} className="shrink-0">
        <GroupCover src={group.cover_url} topic={coverTopic(group)} iconSize="sm" className="h-9 w-9 rounded-lg" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/social/grupo/${group.id}`} className="block truncate text-[14px] font-semibold text-ink hover:underline">
          {group.name}
        </Link>
        <span className="block truncate text-[12px] text-ink-muted">
          {noun === "foro" ? "Foro" : "Grupo"} · {membersText(group.members)}
        </span>
      </div>
      <AddButton
        done={done}
        busy={busy}
        label={done ? `Salir de ${group.name}` : `Unirme a ${group.name}`}
        onClick={() => (done ? setConfirm(true) : toggle(true))}
      />
      {confirm && (
        <UnfollowDialog
          kind={noun === "foro" ? "forum" : "group"}
          name={group.name}
          picture={<GroupCover src={group.cover_url} topic={coverTopic(group)} iconSize="sm" className="h-16 w-16 rounded-2xl" />}
          onConfirm={() => toggle(false)}
          onCancel={() => setConfirm(false)}
        />
      )}
    </li>
  );
}
