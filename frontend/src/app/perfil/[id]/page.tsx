"use client";

import { Check, MessageCircle, Plus, Users, Pencil } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Avatar } from "@/components/Avatar";
import { Composer } from "@/components/feed/Composer";
import { UnfollowDialog } from "@/components/UnfollowDialog";
import { PostCard } from "@/components/feed/PostCard";
import { api, type Post, type Profile, type User } from "@/lib/api";

const COMMUNITIES_PREVIEW = 5;

/** Comunidades del perfil: solo las 5 más recientes y "Ver todas" para desplegar el resto. */
function ProfileCommunities({ communities, isMe }: { communities: Profile["communities"]; isMe: boolean }) {
  const [all, setAll] = useState(false);
  const shown = all ? communities : communities.slice(0, COMMUNITIES_PREVIEW);
  const hidden = communities.length - COMMUNITIES_PREVIEW;
  return (
    <div className="mt-4">
      <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
        <Users className="h-4 w-4" aria-hidden /> Comunidades
        <span className="font-normal">· {communities.length}</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {shown.map((c) => (
          <Link key={c.id} href={`/social/grupo/${c.id}`} className="rounded-full bg-page px-3 py-1 text-sm transition-colors hover:bg-field-hover">
            {c.name}
          </Link>
        ))}
        {hidden > 0 && (
          <button
            type="button"
            onClick={() => setAll((v) => !v)}
            aria-expanded={all}
            className="inline-flex min-h-8 items-center rounded-full px-2 text-sm font-semibold text-brand-700 hover:underline"
          >
            {all ? "Ver menos" : `Ver todas (+${hidden})`}
          </button>
        )}
        {isMe && (
          <Link href="/social/foros" className="inline-flex min-h-8 items-center px-2 text-sm font-semibold text-ink-muted hover:underline">
            Gestionar
          </Link>
        )}
      </div>
    </div>
  );
}

function ProfileView({ id, me }: { id: number; me: User }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [missing, setMissing] = useState(false);
  const [confirmUnfollow, setConfirmUnfollow] = useState(false);

  useEffect(() => {
    setProfile(null);
    setPosts(null);
    api<Profile>(`/users/${id}`).then(setProfile).catch(() => setMissing(true));
    api<Post[]>(`/feed?author_id=${id}`).then(setPosts).catch(() => setPosts([]));
  }, [id]);

  const toggleFollow = async () => {
    if (!profile) return;
    setConfirmUnfollow(false);
    const next = !profile.followed_by_me;
    setProfile({ ...profile, followed_by_me: next, followers: profile.followers + (next ? 1 : -1) });
    await api(`/users/${id}/follow`, { method: next ? "POST" : "DELETE" }).catch(() => setProfile(profile));
  };

  if (missing) return <div className="rounded-card border border-line bg-card p-10 text-center text-ink-muted">No encontramos este perfil.</div>;
  if (!profile) return <div className="h-64 animate-pulse rounded-card bg-card" />;

  const { user } = profile;
  const isCompany = user.role === "company";
  const stats = [
    { n: profile.posts, label: profile.posts === 1 ? "publicación" : "publicaciones" },
    { n: profile.followers, label: profile.followers === 1 ? "seguidor" : "seguidores" },
    { n: profile.following, label: "siguiendo" },
  ];

  return (
    <div className="space-y-4">
      {confirmUnfollow && (
        <UnfollowDialog
          name={user.name}
          avatarUrl={user.avatar_url}
          square={isCompany}
          onConfirm={toggleFollow}
          onCancel={() => setConfirmUnfollow(false)}
        />
      )}
      {/* Cabecera tipo carné: franja de pizarra, foto a la izquierda y los datos al lado (sin foto de portada) */}
      <section className="overflow-hidden rounded-card border border-line bg-card">
        <div className="h-2 bg-brand-600" aria-hidden />
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <Avatar name={user.name} src={user.avatar_url} size="xl" square={isCompany} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-[28px] font-bold leading-tight">
                    {user.name}
                    {user.badge && (
                      <span
                        className={`ml-2 inline-block rounded-[6px] px-2 py-0.5 align-middle font-sans text-xs font-semibold tracking-normal ${
                          isCompany ? "bg-page text-ink-muted" : "bg-brand-50 text-brand-700"
                        }`}
                      >
                        {user.badge}
                      </span>
                    )}
                  </h1>
                  {user.headline && <p className="mt-1 text-base text-ink-muted">{user.headline}</p>}
                </div>
                {profile.is_me && (
                  <Link
                    href="/perfil/editar"
                    className="inline-flex min-h-11 items-center gap-2 rounded-btn border border-edge px-4 font-semibold hover:border-ink-subtle"
                  >
                    <Pencil className="h-4 w-4" aria-hidden /> Editar perfil
                  </Link>
                )}
                {!profile.is_me && (
                  <div className="flex gap-2">
                    <Link href={`/mensajes?con=${user.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-btn border border-edge px-4 font-semibold hover:border-ink-subtle">
                      <MessageCircle className="h-4 w-4" aria-hidden /> Mensaje
                    </Link>
                    <button
                      type="button"
                      onClick={() => (profile.followed_by_me ? setConfirmUnfollow(true) : toggleFollow())}
                      className={`inline-flex min-h-11 items-center gap-1.5 rounded-btn px-5 font-semibold ${
                        profile.followed_by_me ? "border border-edge hover:border-ink-subtle" : "bg-brand-600 text-on-brand hover:bg-brand-hover"
                      }`}
                    >
                      {profile.followed_by_me ? <Check className="h-4 w-4" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
                      {profile.followed_by_me ? "Siguiendo" : "Seguir"}
                    </button>
                  </div>
                )}
              </div>
              <dl className="mt-5 flex divide-x divide-line">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col-reverse px-5 first:pl-0">
                    <dt className="text-sm text-ink-muted">{s.label}</dt>
                    <dd className="font-display text-[26px] font-bold leading-none tracking-tight">{s.n}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          {profile.communities.length > 0 && <ProfileCommunities communities={profile.communities} isMe={profile.is_me} />}
        </div>
      </section>

      {profile.is_me && <Composer user={me} onPublished={(p) => setPosts((ps) => [p, ...(ps ?? [])])} />}

      <h2 className="px-1 pt-2 text-lg font-bold">Publicaciones</h2>
      {posts === null && <div className="h-40 animate-pulse rounded-card bg-card" />}
      {posts?.length === 0 && (
        <p className="rounded-card border border-line bg-card p-8 text-center text-ink-muted">
          {profile.is_me ? "Aún no has publicado nada. ¡Cuéntale algo a tu comunidad!" : "Todavía no ha publicado nada."}
        </p>
      )}
      {posts?.map((p) => (
        <PostCard
          key={p.id}
          post={p}
          onHide={(pid) => setPosts((ps) => ps?.filter((x) => x.id !== pid) ?? ps)}
          onDelete={(pid) => setPosts((ps) => ps?.filter((x) => x.id !== pid) ?? ps)}
          onFollowChange={(_, following) => setProfile((pr) => (pr ? { ...pr, followed_by_me: following } : pr))}
          onUpdate={(np) => setPosts((ps) => ps?.map((x) => (x.id === np.id ? np : x)) ?? ps)}
        />
      ))}
    </div>
  );
}

export default function Perfil() {
  const { id } = useParams<{ id: string }>();
  return <AppShell>{(me) => <ProfileView id={Number(id)} me={me} />}</AppShell>;
}
