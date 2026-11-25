"use client";

import { Check, Heart, Loader2, MessageCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { announceRelation, api, onRelation, refreshGroups, type Discover, type GroupCard } from "@/lib/api";
import { coverTopic, groupNoun, membersText } from "@/lib/groups";
import { useFeedIds } from "@/lib/feedIds";
import { timeAgo } from "@/lib/time";
import { Avatar, RoleTag } from "../Avatar";
import { UnfollowDialog } from "../UnfollowDialog";
import { GroupCover } from "../social/GroupCover";

/**
 * Columna derecha: publicaciones, personas y foros/grupos recomendados según tu perfil
 * (tus estudios, tu centro, tus temas y la gente que sigues). Datos: GET /discover.
 * Todo en una misma tarjeta, en tres apartados seguidos (sin pestañas), con pocos elementos en cada uno (LIMITS).
 */
/** Última respuesta: al cambiar de página el panel sale ya relleno (y se refresca detrás), sin saltos. */
let lastDiscover: Discover | null = null;

/** Máximo por apartado: publicaciones 3, personas 4, foros y grupos 3 */
const LIMITS = { posts: 3, people: 4, communities: 3 };

export function InterestPanel() {
  const [data, setData] = useState<Discover | null>(lastDiscover);
  const inFeed = useFeedIds();
  const posts = (data?.posts.filter((p) => !inFeed.has(p.id)) ?? []).slice(0, LIMITS.posts);
  const people = (data?.people ?? []).slice(0, LIMITS.people);
  const communities = (data?.communities ?? []).slice(0, LIMITS.communities);

  useEffect(() => {
    api<Discover>("/discover")
      .then((d) => {
        lastDiscover = d;
        setData(d);
      })
      .catch(() => setData({ posts: [], people: [], communities: [] }));
  }, []);

  const empty = data !== null && posts.length === 0 && people.length === 0 && communities.length === 0;

  return (
    <section aria-labelledby="interes-title" className="rounded-card border border-line bg-card p-3">
      <h2 id="interes-title" className="px-1 pt-1 text-lg font-bold">
        Para ti
      </h2>
      {data === null ? (
        <Skeleton rows={6} />
      ) : empty ? (
        <Empty>Ya has visto todo lo de tus estudios. Únete a algún grupo o sigue a alguien y aquí saldrá lo nuevo.</Empty>
      ) : (
        <div className="divide-y divide-line">
          {posts.length > 0 && (
            <PanelSection id="interes-posts" title="Publicaciones" note="Según tus estudios">
              <ul>
                {posts.map((p) => (
                  <li key={p.id}>
                    <Link href={`/inicio?post=${p.id}`} className="-mx-1 block rounded-btn px-2 py-2 hover:bg-page">
                      <span className="block text-[12px] font-semibold text-brand-700">{p.reason}</span>
                      <span className="mt-0.5 line-clamp-2 block text-[14px] leading-snug text-ink">{p.excerpt}</span>
                      <span className="mt-1 flex items-center gap-2 text-[12px] text-ink-muted">
                        <span className="truncate">
                          {p.author} · {timeAgo(p.created_at)}
                        </span>
                        {p.likes > 0 && (
                          <span className="inline-flex shrink-0 items-center gap-0.5">
                            <Heart className="h-3 w-3" aria-hidden /> {p.likes}
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
            </PanelSection>
          )}
          {people.length > 0 && (
            <PanelSection id="interes-people" title="Personas" note="Quizá las conozcas">
              <ul className="space-y-1">
                {people.map((p) => (
                  <PersonRow key={p.user.id} person={p} />
                ))}
              </ul>
            </PanelSection>
          )}
          {communities.length > 0 && (
            <PanelSection id="interes-groups" title="Foros y grupos" note="Encajan contigo" more="/social">
              <ul className="space-y-1">
                {communities.map((c) => (
                  <CommunityRow key={c.id} group={c} />
                ))}
              </ul>
            </PanelSection>
          )}
        </div>
      )}
    </section>
  );
}

/** Un apartado del panel: título, una nota corta y, si hay, «Ver más». */
function PanelSection({ id, title, note, more, children }: { id: string; title: string; note: string; more?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="py-3 first:pt-2 last:pb-1">
      <div className="mb-1.5 flex items-baseline justify-between gap-2 px-1">
        <h3 id={id} className="text-[15px] font-semibold">
          {title} <span className="font-normal text-ink-subtle">· {note}</span>
        </h3>
        {more && (
          <Link href={more} className="shrink-0 text-[13px] font-semibold text-brand-700 hover:underline">
            Ver más
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-1 py-4 text-[14px] text-ink-muted">{children}</p>;
}

function Skeleton({ rows }: { rows: number }) {
  return (
    <div className="mt-3 space-y-2">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-btn bg-page" />
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
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : done ? (
        <Check className="h-4 w-4" aria-hidden />
      ) : (
        <Plus className="h-5 w-5" aria-hidden />
      )}
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
    <li className="flex items-center gap-3 rounded-btn px-1 py-1.5">
      <Link href={`/perfil/${user.id}`} aria-hidden tabIndex={-1} className="shrink-0">
        <Avatar name={user.name} src={user.avatar_url} size="sm" role={user.role} />
      </Link>
      <div className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <Link href={`/perfil/${user.id}`} className="truncate text-[14px] font-semibold text-ink hover:underline">
            {user.name}
          </Link>
          <RoleTag role={user.role} />
        </span>
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
          role={user.role}
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
    <li className="flex items-center gap-3 rounded-btn px-1 py-1.5">
      <Link href={`/social/grupo/${group.id}`} aria-hidden tabIndex={-1} className="shrink-0">
        <GroupCover src={group.cover_url} topic={coverTopic(group)} iconSize="sm" className="h-9 w-9 rounded-btn" />
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
          picture={<GroupCover src={group.cover_url} topic={coverTopic(group)} iconSize="sm" className="h-16 w-16 rounded-card" />}
          onConfirm={() => toggle(false)}
          onCancel={() => setConfirm(false)}
        />
      )}
    </li>
  );
}
