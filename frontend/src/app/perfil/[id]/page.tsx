"use client";

import { Check, MessageCircle, Plus, Users } from "lucide-react";
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

  if (missing) return <div className="rounded-card border border-line bg-white p-10 text-center text-ink-muted">No encontramos este perfil.</div>;
  if (!profile) return <div className="h-64 animate-pulse rounded-card bg-white" />;

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
      <section className="overflow-hidden rounded-card border border-line bg-white">
        <div className="h-28 bg-brand-600 sm:h-36" />
        <div className="px-5 pb-5">
          <div className="-mt-12 flex items-end justify-between gap-3">
            <span className={`border-4 border-white bg-white ${isCompany ? "rounded-[14px]" : "rounded-full"}`}>
              <Avatar name={user.name} src={user.avatar_url} size="xl" square={isCompany} />
            </span>
            {!profile.is_me && (
              <div className="flex gap-2">
                <Link href={`/mensajes?con=${user.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 font-semibold hover:border-ink-subtle">
                  <MessageCircle className="h-4 w-4" aria-hidden /> Mensaje
                </Link>
                <button
                  type="button"
                  onClick={() => (profile.followed_by_me ? setConfirmUnfollow(true) : toggleFollow())}
                  className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-5 font-semibold ${
                    profile.followed_by_me ? "border border-line hover:border-ink-subtle" : "bg-brand-600 text-white hover:bg-brand-700"
                  }`}
                >
                  {profile.followed_by_me ? <Check className="h-4 w-4" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
                  {profile.followed_by_me ? "Siguiendo" : "Seguir"}
                </button>
              </div>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-bold">
            {user.name}
            {user.badge && (
              <span className={`ml-2 inline-block rounded-full px-2.5 py-0.5 align-middle text-xs font-semibold ${isCompany ? "bg-page text-ink-muted" : "bg-brand-50 text-brand-700"}`}>
                {user.badge}
              </span>
            )}
          </h1>
          {user.headline && <p className="mt-0.5 text-ink-muted">{user.headline}</p>}
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[15px]">
            {stats.map((s) => (
              <div key={s.label} className="flex gap-1">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="font-bold">{s.n}</span> <span className="text-ink-muted">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
          {profile.communities.length > 0 && <ProfileCommunities communities={profile.communities} isMe={profile.is_me} />}
        </div>
      </section>

      {profile.is_me && <Composer user={me} onPublished={(p) => setPosts((ps) => [p, ...(ps ?? [])])} />}

      <h2 className="px-1 pt-2 text-lg font-bold">Publicaciones</h2>
      {posts === null && <div className="h-40 animate-pulse rounded-card bg-white" />}
      {posts?.length === 0 && (
        <p className="rounded-card border border-line bg-white p-8 text-center text-ink-muted">
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
