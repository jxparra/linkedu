"use client";

import { CalendarDays, Check, ChevronDown, Globe, Lock, LogOut, MapPin, Pencil, Tag, Trash2, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Avatar, RoleTag } from "@/components/Avatar";
import { Button, ButtonLink } from "@/components/Button";
import { Composer } from "@/components/feed/Composer";
import { PostCard } from "@/components/feed/PostCard";
import { GroupCover } from "@/components/social/GroupCover";
import { GROUP_TABS, GroupHeader, type GroupTab } from "@/components/social/GroupHeader";
import { PeoplePicker } from "@/components/social/PeoplePicker";
import { SocialShell } from "@/components/social/SocialNav";
import { UnfollowDialog } from "@/components/UnfollowDialog";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError, mediaUrl, refreshGroups, type Author, type Group, type GroupMember, type Post, type User } from "@/lib/api";
import { coverTopic, FORUM_LABEL, groupNoun, groupStats, ONLINE, PRIVACY } from "@/lib/groups";

const dateFmt = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" });

function PersonRow({ person, extra }: { person: Author; extra?: string }) {
  return (
    <Link href={`/perfil/${person.id}`} className="-mx-2 flex items-center gap-3 rounded-card px-2 py-2 hover:bg-page">
      <Avatar name={person.name} src={person.avatar_url ? mediaUrl(person.avatar_url) : null} size="md" role={person.role} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-semibold">{person.name}</span>
          <RoleTag role={person.role} />
          {extra && <span className="shrink-0 rounded-[6px] bg-brand-50 px-2 py-0.5 text-[12px] font-semibold text-brand-700">{extra}</span>}
        </span>
        {person.headline && <span className="block truncate text-[13px] text-ink-muted">{person.headline}</span>}
      </span>
    </Link>
  );
}

/** Tarjeta "Información" (columna derecha y pestaña Información). */
function About({ group, full = false }: { group: Group; full?: boolean }) {
  const PrivacyIcon = group.privacy === "private" ? Lock : Globe;
  const row = "flex gap-3";
  return (
    <section className="rounded-card border border-line bg-card p-5">
      <h2 className="text-lg font-bold">Información</h2>
      {group.description && <p className={`mt-2 whitespace-pre-line break-words text-[15px] ${full ? "" : "line-clamp-6"}`}>{group.description}</p>}
      <ul className="mt-4 space-y-4 text-[15px]">
        <li className={row}>
          <PrivacyIcon className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" aria-hidden />
          <span>
            <span className="block font-semibold">{PRIVACY[group.privacy].short}</span>
            <span className="text-[13px] text-ink-muted">{PRIVACY[group.privacy].text}</span>
          </span>
        </li>
        {/* La temática, el lugar y los miembros ya están en la cabecera: en la columna derecha no se repiten */}
        {full && group.topic_label && (
          <li className={row}>
            <Tag className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" aria-hidden />
            <span>
              <span className="block font-semibold">{group.topic_label}</span>
              <span className="text-[13px] text-ink-muted">Temática del grupo</span>
            </span>
          </li>
        )}
        {full && (
          <>
            <li className={row}>
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" aria-hidden />
              <span className="font-semibold">{group.province ?? ONLINE}</span>
            </li>
            <li className={row}>
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" aria-hidden />
              <span>{groupStats(group.members, group.posts_week)}</span>
            </li>
          </>
        )}
        {group.created_at && (
          <li className={row}>
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" aria-hidden />
            <span>Creado el {dateFmt.format(new Date(group.created_at))}</span>
          </li>
        )}
      </ul>
      {full && group.admins.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <h3 className="mb-1 font-semibold">{group.admins.length === 1 ? "Administrador" : "Administradores"}</h3>
          {group.admins.map((a) => (
            <PersonRow key={a.id} person={a} />
          ))}
        </div>
      )}
    </section>
  );
}

function Members({ group }: { group: Group }) {
  const [members, setMembers] = useState<GroupMember[] | null>(null);
  useEffect(() => {
    api<GroupMember[]>(`/groups/${group.id}/members`)
      .then(setMembers)
      .catch(() => setMembers([]));
  }, [group.id, group.members]);

  if (!group.can_see_content) return <Locked group={group} what="quién está en el grupo" />;
  return (
    <section className="rounded-card border border-line bg-card p-5">
      <h2 className="text-lg font-bold">
        Miembros <span className="font-normal text-ink-muted">· {group.members}</span>
      </h2>
      {group.following_in_group.length > 0 && (
        <p className="mt-1 text-[15px] text-ink-muted">
          {group.following_in_group.map((p) => p.name.split(" ")[0]).join(", ")} {group.following_in_group.length === 1 ? "está" : "están"} en este grupo.
        </p>
      )}
      <div className="mt-3">
        {members === null
          ? [0, 1, 2].map((i) => <div key={i} className="my-2 h-12 animate-pulse rounded-btn bg-page" />)
          : members.map((m) => <PersonRow key={m.user.id} person={m.user} extra={m.role === "admin" ? "Administrador" : undefined} />)}
      </div>
    </section>
  );
}

function Locked({ group, what }: { group: Group; what: string }) {
  return (
    <div className="rounded-card border border-line bg-card p-10 text-center">
      <Lock className="mx-auto h-10 w-10 text-ink-subtle" aria-hidden />
      <h2 className="mt-3 text-lg font-bold">Este grupo es privado</h2>
      <p className="mx-auto mt-1 max-w-sm text-ink-muted">Únete para ver {what}.</p>
      {group.description && <p className="mx-auto mt-3 max-w-md text-[15px]">{group.description}</p>}
    </div>
  );
}

function Posts({ group, user }: { group: Group; user: User }) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  useEffect(() => {
    if (!group.can_see_content) return;
    api<Post[]>(`/groups/${group.id}/posts`)
      .then(setPosts)
      .catch(() => setPosts([]));
  }, [group.id, group.can_see_content]);

  if (!group.can_see_content) return <Locked group={group} what="sus publicaciones" />;
  const replace = (p: Post) => setPosts((ps) => ps?.map((x) => (x.id === p.id ? p : x)) ?? ps);
  const remove = (id: number) => setPosts((ps) => ps?.filter((x) => x.id !== id) ?? ps);

  return (
    <div className="space-y-4">
      {group.is_member && <Composer user={user} community={{ id: group.id, name: group.name }} onPublished={(p) => setPosts((ps) => [p, ...(ps ?? [])])} />}
      {posts === null && [0, 1].map((i) => <div key={i} className="h-48 animate-pulse rounded-card border border-line bg-card" />)}
      {posts?.length === 0 && (
        <div className="rounded-card border border-line bg-card p-8 text-center">
          <h2 className="text-lg font-bold">Todavía no hay publicaciones</h2>
          <p className="mt-1 text-ink-muted">{group.is_member ? "Rompe el hielo: preséntate o propón un plan." : "Únete y sé quien publique primero."}</p>
        </div>
      )}
      {posts?.map((p) => (
        <PostCard
          key={p.id}
          post={p}
          inGroup
          onUpdate={replace}
          onHide={remove}
          onDelete={remove}
          onFollowChange={(authorId, following) =>
            setPosts((ps) => ps?.map((x) => (x.author.id === authorId ? { ...x, following_author: following } : x)) ?? ps)
          }
        />
      ))}
    </div>
  );
}

function InviteDialog({ group, onClose }: { group: Group; onClose: () => void }) {
  const [people, setPeople] = useState<Author[]>([]);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const send = async () => {
    setSending(true);
    const r = await api<{ sent: number }>(`/groups/${group.id}/invite`, { method: "POST", body: { user_ids: people.map((p) => p.id) } }).catch(() => ({ sent: 0 }));
    setDone(r.sent);
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="invite-title" className="w-full max-w-md rounded-t-card bg-card p-5 shadow-xl sm:rounded-card">
        <h2 id="invite-title" className="text-xl font-bold">
          Invitar a «{group.name}»
        </h2>
        {done === null ? (
          <>
            <p className="mb-4 mt-1 text-[15px] text-ink-muted">Les llegará una notificación con el enlace al grupo.</p>
            <PeoplePicker value={people} onChange={setPeople} label="¿A quién quieres invitar?" />
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={send} loading={sending} disabled={people.length === 0}>
                Enviar invitaciones
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-[15px]">
              {done > 0 ? `Invitación enviada a ${done} ${done === 1 ? "persona" : "personas"}.` : "Esas personas ya estaban en el grupo."}
            </p>
            <div className="mt-5 flex justify-end">
              <Button variant="secondary" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GroupPage({ user }: { user: User }) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [group, setGroup] = useState<Group | null>(null);
  const [error, setError] = useState<string | null>(null);
  // La pestaña abierta va en la URL (?pestana=miembros): se puede compartir, recargar y volver atrás
  const params = useSearchParams();
  const fromUrl = params.get("pestana");
  const tab: GroupTab = GROUP_TABS.some((t) => t.key === fromUrl) ? (fromUrl as GroupTab) : "publicaciones";
  const setTab = (t: GroupTab) => router.replace(t === "publicaciones" ? `/social/grupo/${id}` : `/social/grupo/${id}?pestana=${t}`, { scroll: false });
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    api<Group>(`/groups/${id}`)
      .then(setGroup)
      .catch((e) => setError(e instanceof ApiError ? e.message : "No hemos podido cargar el grupo."));
  }, [id]);
  useEffect(load, [load]);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  if (error)
    return (
      <div className="rounded-card border border-line bg-card p-10 text-center">
        <h1 className="text-xl font-semibold">{error}</h1>
        <ButtonLink href="/social" variant="secondary" className="mt-4">
          Ver sugerencias
        </ButtonLink>
      </div>
    );
  if (!group) return <div className="h-[420px] animate-pulse rounded-card border border-line bg-card" />;

  const noun = groupNoun(group.type);

  const join = async () => {
    setBusy(true);
    await api(`/groups/${group.id}/join`, { method: "POST" }).catch(() => {});
    refreshGroups();
    load();
    setBusy(false);
  };

  const leave = async () => {
    setConfirmLeave(false);
    await api(`/groups/${group.id}/join`, { method: "DELETE" }).catch(() => {});
    refreshGroups();
    load();
  };

  const remove = async () => {
    setMenu(false);
    const ok = await confirm({
      title: `¿Eliminar «${group.name}»?`,
      text: "Se borrarán también todas sus publicaciones y sus miembros dejarán de verlo. No se puede deshacer.",
      action: `Eliminar ${groupNoun(group.type)}`,
    });
    if (!ok) return;
    await api(`/groups/${group.id}`, { method: "DELETE" }).catch(() => {});
    refreshGroups();
    router.push("/social/grupos");
  };

  const item = "flex min-h-11 w-full items-center gap-3 rounded-btn px-3 text-left text-[15px] font-semibold hover:bg-page";
  const following = group.following_in_group;
  const note =
    following.length === 0
      ? null
      : following.length === 1
        ? `${following[0].name.split(" ")[0]}, a quien sigues, está aquí`
        : `${following.map((p) => p.name.split(" ")[0]).join(", ")}, a quienes sigues, están aquí`;
  const actions = (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex gap-2">
        {group.is_member ? (
          <>
            <div ref={menuRef} className="relative">
              <Button variant="secondary" onClick={() => setMenu((m) => !m)} aria-expanded={menu} className="px-4">
                <Check className="h-4 w-4" aria-hidden /> {group.role === "admin" ? "Administras" : "Unido"}
                <ChevronDown className="h-4 w-4" aria-hidden />
              </Button>
              {menu && (
                <div role="menu" className="absolute right-0 z-10 mt-1 w-56 rounded-card border border-line bg-card p-1 shadow-lg">
                  {group.role === "admin" && (
                    <Link role="menuitem" href={`/social/grupo/${group.id}/editar`} className={item}>
                      <Pencil className="h-5 w-5" aria-hidden /> Editar grupo
                    </Link>
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenu(false);
                      setConfirmLeave(true);
                    }}
                    className={item}
                  >
                    <LogOut className="h-5 w-5" aria-hidden /> Salir del {noun}
                  </button>
                  {group.role === "admin" && (
                    <button type="button" role="menuitem" onClick={remove} className={`${item} text-danger`}>
                      <Trash2 className="h-5 w-5" aria-hidden /> Eliminar grupo
                    </button>
                  )}
                </div>
              )}
            </div>
            <Button onClick={() => setInviting(true)} className="px-4">
              <UserPlus className="h-4 w-4" aria-hidden /> Invitar
            </Button>
          </>
        ) : (
          <Button onClick={join} loading={busy}>
            <Users className="h-4 w-4" aria-hidden /> Unirme
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {dialog}
      <GroupHeader
        name={group.name}
        privacy={group.privacy}
        members={group.members}
        cover={group.cover_url}
        topic={coverTopic(group)}
        topicLabel={group.topic_label ?? FORUM_LABEL[group.type] ?? null}
        province={group.type === "group" ? group.province : undefined}
        note={note}
        actions={actions}
        tab={tab}
        onTab={setTab}
      />
      <div role="tabpanel" id="grupo-panel" aria-labelledby={`grupo-tab-${tab}`}>
      {tab === "publicaciones" && (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Posts group={group} user={user} />
          <div className="hidden lg:block">
            <About group={group} />
          </div>
        </div>
      )}
      {tab === "informacion" && (
        <div className="mx-auto max-w-[680px]">
          <About group={group} full />
        </div>
      )}
      {tab === "miembros" && (
        <div className="mx-auto max-w-[680px]">
          <Members group={group} />
        </div>
      )}
      </div>
      {inviting && <InviteDialog group={group} onClose={() => setInviting(false)} />}
      {confirmLeave && (
        <UnfollowDialog
          kind={noun === "foro" ? "forum" : "group"}
          name={group.name}
          picture={<GroupCover src={group.cover_url} topic={coverTopic(group)} iconSize="sm" className="h-16 w-16 rounded-card" />}
          note={group.role === "admin" ? `Eres administrador: lo será quien lleve más tiempo en el ${noun}.` : undefined}
          onConfirm={leave}
          onCancel={() => setConfirmLeave(false)}
        />
      )}
    </div>
  );
}

export default function Grupo() {
  return (
    <SocialShell>
      {(user) => (
        <Suspense>
          <GroupPage user={user} />
        </Suspense>
      )}
    </SocialShell>
  );
}
