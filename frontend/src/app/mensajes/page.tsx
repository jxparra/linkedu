"use client";

import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Avatar } from "@/components/Avatar";
import { api, refreshUnread, type Author, type ChatMessage, type Conversation } from "@/lib/api";
import { timeAgo } from "@/lib/time";

function Thread({ other, onBack, onSent }: { other: Author; onBack: () => void; onSent: () => void }) {
  const [msgs, setMsgs] = useState<ChatMessage[] | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMsgs(null);
    api<ChatMessage[]>(`/messages/with/${other.id}`)
      .then((m) => {
        setMsgs(m);
        refreshUnread();
        onSent();
      })
      .catch(() => setMsgs([]));
  }, [other.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [msgs]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const m = await api<ChatMessage>(`/messages/with/${other.id}`, { method: "POST", body: { content: text } });
      setMsgs((ms) => [...(ms ?? []), m]);
      setText("");
      onSent();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <button type="button" onClick={onBack} aria-label="Volver a las conversaciones" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-page md:hidden">
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </button>
        <Link href={`/perfil/${other.id}`} className="flex min-w-0 items-center gap-3">
          <Avatar name={other.name} src={other.avatar_url} size="sm" square={other.role === "company"} />
          <span className="min-w-0">
            <span className="block truncate font-semibold">{other.name}</span>
            {other.headline && <span className="block truncate text-[13px] text-ink-muted">{other.headline}</span>}
          </span>
        </Link>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-page/60 px-4 py-4">
        {msgs === null && <p className="text-center text-sm text-ink-muted">Cargando…</p>}
        {msgs?.length === 0 && <p className="text-center text-sm text-ink-muted">Escribe el primer mensaje a {other.name}.</p>}
        {msgs?.map((m) => (
          <div key={m.id} className={`flex ${m.from_me ? "justify-end" : "justify-start"}`}>
            <p
              className={`max-w-[78%] whitespace-pre-line rounded-[18px] px-3.5 py-2 text-[15px] ${
                m.from_me ? "rounded-br-md bg-brand-600 text-white" : "rounded-bl-md border border-line bg-white"
              }`}
              title={timeAgo(m.created_at)}
            >
              {m.content}
            </p>
          </div>
        ))}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-3">
        <label className="flex-1">
          <span className="sr-only">Escribe un mensaje</span>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe un mensaje…"
            maxLength={2000}
            className="h-11 w-full rounded-full bg-page px-4 text-[15px] placeholder:text-ink-subtle focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/30"
          />
        </label>
        <button type="submit" disabled={sending || !text.trim()} aria-label="Enviar" className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white disabled:bg-page disabled:text-ink-subtle">
          <Send className="h-5 w-5" aria-hidden />
        </button>
      </form>
    </div>
  );
}

function Inbox() {
  const params = useSearchParams();
  const [convs, setConvs] = useState<Conversation[] | null>(null);
  const [active, setActive] = useState<Author | null>(null);

  const load = useCallback(() => {
    api<Conversation[]>("/messages/conversations")
      .then(setConvs)
      .catch(() => setConvs([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = Number(params.get("con"));
    if (!id || active?.id === id) return;
    const found = convs?.find((c) => c.user.id === id)?.user;
    if (found) setActive(found);
    else if (convs) api<{ user: Author }>(`/users/${id}`).then((p) => setActive(p.user)).catch(() => {});
  }, [params, convs, active?.id]);

  return (
    <section className="grid h-[calc(100vh-150px)] min-h-[480px] overflow-hidden rounded-card border border-line bg-white md:grid-cols-[300px_minmax(0,1fr)]">
      <div className={`min-h-0 flex-col border-r border-line ${active ? "hidden md:flex" : "flex"}`}>
        <h1 className="border-b border-line px-5 py-4 text-xl font-bold">Mensajes</h1>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {convs === null && <li className="p-5 text-sm text-ink-muted">Cargando…</li>}
          {convs?.length === 0 && (
            <li className="p-8 text-center text-ink-muted">
              <MessageCircle className="mx-auto mb-2 h-7 w-7 text-ink-subtle" aria-hidden />
              Aún no tienes conversaciones. Escribe a alguien desde su perfil.
            </li>
          )}
          {convs?.map((c) => (
            <li key={c.user.id}>
              <button
                type="button"
                onClick={() => setActive(c.user)}
                aria-current={active?.id === c.user.id ? "true" : undefined}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-page ${active?.id === c.user.id ? "bg-brand-50" : ""}`}
              >
                <Avatar name={c.user.name} src={c.user.avatar_url} size="md" square={c.user.role === "company"} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className={`truncate ${c.unread ? "font-bold" : "font-semibold"}`}>{c.user.name}</span>
                    <span className="shrink-0 text-xs text-ink-subtle">{timeAgo(c.last_at)}</span>
                  </span>
                  <span className={`block truncate text-sm ${c.unread ? "font-semibold text-ink" : "text-ink-muted"}`}>
                    {c.last_from_me && "Tú: "}
                    {c.last_message}
                  </span>
                </span>
                {c.unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold text-white" aria-label={`${c.unread} sin leer`}>
                    {c.unread}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className={`min-h-0 ${active ? "flex flex-col" : "hidden md:flex md:items-center md:justify-center"}`}>
        {active ? (
          <Thread other={active} onBack={() => setActive(null)} onSent={load} />
        ) : (
          <p className="text-ink-muted">Elige una conversación.</p>
        )}
      </div>
    </section>
  );
}

export default function Mensajes() {
  return (
    <AppShell>
      {() => (
        <Suspense>
          <Inbox />
        </Suspense>
      )}
    </AppShell>
  );
}
