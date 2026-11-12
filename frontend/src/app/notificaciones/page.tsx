"use client";

import { Bell, Briefcase, Heart, MessageCircle, Sparkles, Tag, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Avatar } from "@/components/Avatar";
import { api, refreshUnread, type NotificationItem } from "@/lib/api";
import { timeAgo } from "@/lib/time";

const ICONS: Record<string, { icon: typeof Bell; cls: string }> = {
  like: { icon: Heart, cls: "bg-red-50 text-danger" },
  follow: { icon: UserPlus, cls: "bg-brand-50 text-brand-600" },
  comment: { icon: MessageCircle, cls: "bg-brand-50 text-brand-600" },
  tag: { icon: Tag, cls: "bg-accent-50 text-accent-800" },
  job: { icon: Briefcase, cls: "bg-accent-50 text-accent-800" },
  job_application: { icon: Briefcase, cls: "bg-brand-50 text-brand-600" },
  application_status: { icon: Briefcase, cls: "bg-accent-50 text-accent-800" },
  group_invite: { icon: Users, cls: "bg-brand-50 text-brand-600" },
  group_join: { icon: Users, cls: "bg-brand-50 text-brand-600" },
  welcome: { icon: Sparkles, cls: "bg-accent-50 text-accent-800" },
};

function List() {
  const [items, setItems] = useState<NotificationItem[] | null>(null);

  useEffect(() => {
    api<NotificationItem[]>("/notifications")
      .then((n) => {
        setItems(n);
        if (n.some((x) => !x.read)) api("/notifications/read-all", { method: "POST" }).then(refreshUnread).catch(() => {});
      })
      .catch(() => setItems([]));
  }, []);

  return (
    <section className="rounded-card border border-line bg-white">
      <h1 className="border-b border-line px-5 py-4 text-xl font-bold">Notificaciones</h1>
      {items === null ? (
        <div className="space-y-2 p-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-page" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-10 text-center">
          <Bell className="mx-auto h-8 w-8 text-ink-subtle" aria-hidden />
          <p className="mt-3 font-semibold">Todo al día</p>
          <p className="text-ink-muted">Te avisaremos cuando alguien te siga o reaccione a lo que publicas.</p>
        </div>
      ) : (
        <ul>
          {items.map((n) => {
            const { icon: Icon, cls } = ICONS[n.type] ?? ICONS.welcome;
            const body = (
              <>
                <span className="relative shrink-0">
                  {n.actor ? (
                    <Avatar name={n.actor.name} src={n.actor.avatar_url} size="md" square={n.actor.role === "company"} />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-lg font-extrabold text-white">S</span>
                  )}
                  <span className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white ${cls}`}>
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] leading-snug">
                    {n.actor && <span className="font-semibold">{n.actor.name} </span>}
                    {n.text}
                  </span>
                  {n.post_excerpt && <span className="mt-0.5 block truncate text-sm text-ink-muted">«{n.post_excerpt}»</span>}
                  {n.job_title && <span className="mt-0.5 block truncate text-sm font-semibold text-ink-muted">{n.job_title}</span>}
                  {n.group_name && <span className="mt-0.5 block truncate text-sm font-semibold text-ink-muted">{n.group_name}</span>}
                  <span className={`mt-0.5 block text-[13px] ${n.read ? "text-ink-subtle" : "font-semibold text-brand-700"}`}>{timeAgo(n.created_at)}</span>
                </span>
                {!n.read && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" aria-label="Sin leer" />}
              </>
            );
            const cls2 = `flex items-center gap-4 border-b border-line px-5 py-3.5 last:border-0 ${n.read ? "" : "bg-brand-50/50"}`;
            return (
              <li key={n.id}>
                {n.group_id ? (
                  <Link href={`/social/grupo/${n.group_id}`} className={`${cls2} hover:bg-page`}>
                    {body}
                  </Link>
                ) : n.job_id ? (
                  <Link href={`/empleo/${n.job_id}`} className={`${cls2} hover:bg-page`}>
                    {body}
                  </Link>
                ) : n.actor ? (
                  <Link href={`/perfil/${n.actor.id}`} className={`${cls2} hover:bg-page`}>
                    {body}
                  </Link>
                ) : (
                  <div className={cls2}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default function Notificaciones() {
  return <AppShell>{() => <List />}</AppShell>;
}
