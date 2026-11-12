"use client";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  Globe,
  ImagePlus,
  Loader2,
  MapPin,
  MoreHorizontal,
  Search,
  Smile,
  Square,
  UserPlus,
  Users,
  Video,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { api, ApiError, uploadFile, type Author, type Post, type SearchResult, type User } from "@/lib/api";
import { FEELINGS, feelingPhrase } from "@/lib/feelings";
import { Avatar } from "../Avatar";
import { displayName } from "../app/TopBar";

export type ComposerPanel = "main" | "more" | "photo" | "tag" | "feeling" | "location" | "gif" | "camera" | "audience";

type Media = { url: string; preview: string; type: "image" | "video" | "gif" };
const MAX_MEDIA = 10;
type Community = { id: number; name: string };

function GifIcon({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`inline-flex items-center justify-center rounded-md bg-[#12A889] px-1 text-[10px] font-extrabold leading-4 text-white ${className}`}>
      GIF
    </span>
  );
}

/** Opciones de "Añadir a tu publicación". Sin "Recaudar dinero" ni "Acontecimiento importante". */
const OPTIONS: { panel: ComposerPanel; label: string; icon: ReactNode }[] = [
  { panel: "photo", label: "Foto/vídeo", icon: <ImagePlus className="h-6 w-6 text-success" aria-hidden /> },
  { panel: "tag", label: "Etiquetar personas", icon: <UserPlus className="h-6 w-6 text-brand-700" aria-hidden /> },
  { panel: "feeling", label: "Sentimiento/actividad", icon: <Smile className="h-6 w-6 text-accent-400" aria-hidden /> },
  { panel: "location", label: "Registrar visita", icon: <MapPin className="h-6 w-6 text-danger" aria-hidden /> },
  { panel: "gif", label: "GIF", icon: <GifIcon className="h-6 w-7" /> },
  { panel: "camera", label: "Grabar vídeo", icon: <Video className="h-6 w-6 text-[#E4405F]" aria-hidden /> },
];

type Props = {
  user: User;
  initialPanel?: ComposerPanel;
  /** Grupo en el que se publica (desde la página de un grupo) */
  initialCommunity?: Community;
  onClose: () => void;
  onPublished: (p: Post) => void;
};

export function CreatePostModal({ user, initialPanel = "main", initialCommunity, onClose, onPublished }: Props) {
  const name = displayName(user);
  const firstName = user.student_profile?.name ?? name;
  const [panel, setPanel] = useState<ComposerPanel>(initialPanel === "photo" ? "main" : initialPanel);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(0);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [tagged, setTagged] = useState<Author[]>([]);
  const [community, setCommunity] = useState<Community | null>(initialCommunity ?? null);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const gifInput = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const openedPhoto = useRef(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    if (panel === "main") textRef.current?.focus();
  }, [panel]);

  const pickFile = useCallback(() => fileInput.current?.click(), []);

  useEffect(() => {
    if (initialPanel === "photo" && !openedPhoto.current) {
      openedPhoto.current = true;
      pickFile();
    }
  }, [initialPanel, pickFile]);

  const go = (p: ComposerPanel) => {
    setError(null);
    if (p === "photo") {
      setPanel("main");
      pickFile();
    } else if (p === "gif") {
      setPanel("gif");
    } else setPanel(p);
  };

  const attach = async (file: Blob, filename?: string) => {
    if (media.length >= MAX_MEDIA) {
      setError(`Puedes añadir hasta ${MAX_MEDIA} fotos o vídeos.`);
      return;
    }
    setError(null);
    setUploading((n) => n + 1);
    const preview = URL.createObjectURL(file);
    const guess = file.type === "image/gif" ? "gif" : file.type.startsWith("video") ? "video" : "image";
    setMedia((m) => [...m, { url: "", preview, type: guess }]);
    try {
      const res = await uploadFile(file, filename);
      setMedia((m) => m.map((x) => (x.preview === preview ? { ...x, url: res.url, type: res.media_type } : x)));
    } catch (e) {
      setMedia((m) => m.filter((x) => x.preview !== preview));
      setError(e instanceof ApiError ? e.message : "No se ha podido subir el archivo.");
    } finally {
      setUploading((n) => n - 1);
    }
  };

  const ready = media.filter((m) => m.url);
  const canPublish = uploading === 0 && (text.trim().length > 0 || ready.length > 0);

  const publish = async () => {
    if (!canPublish) return;
    setPublishing(true);
    setError(null);
    try {
      const post = await api<Post>("/posts", {
        method: "POST",
        body: {
          content: text,
          community_id: community?.id ?? null,
          media: ready.map((m) => ({ url: m.url, type: m.type })),
          feeling,
          location,
          tagged_user_ids: tagged.map((t) => t.id),
        },
      });
      onPublished(post);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se ha podido publicar. Inténtalo de nuevo.");
    } finally {
      setPublishing(false);
    }
  };

  const extras = [
    feeling && feelingPhrase(feeling),
    tagged.length > 0 && `con ${tagged.map((t) => t.name).join(", ")}`,
    location && `en ${location}`,
  ].filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      data-testid="create-post-backdrop"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-title"
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[20px] bg-card shadow-2xl sm:max-w-[540px] sm:rounded-card"
      >
        <input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          multiple
          className="sr-only"
          onChange={(e) => {
            Array.from(e.target.files ?? []).forEach((f) => attach(f));
            e.target.value = "";
          }}
        />
        <input
          ref={gifInput}
          type="file"
          accept="image/gif"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              attach(f);
              setPanel("main");
            }
            e.target.value = "";
          }}
        />

        {panel === "main" ? (
          <>
            <PanelHeader title="Crear publicación" id="create-post-title" onClose={onClose} />
            <div className="overflow-y-auto px-4 pb-4 pt-3">
              <div className="flex items-center gap-3">
                <Avatar name={name} size="md" square={user.role === "company"} />
                <div className="min-w-0">
                  <p className="text-[15px] leading-snug">
                    <span className="font-semibold">{name}</span>
                    {extras.length > 0 && <span className="text-ink-muted"> {extras.join(" · ")}</span>}
                  </p>
                  <button
                    type="button"
                    onClick={() => setPanel("audience")}
                    className="mt-1 inline-flex min-h-8 items-center gap-1.5 rounded-md bg-page px-2.5 text-[13px] font-semibold hover:bg-line"
                  >
                    {community ? <Users className="h-3.5 w-3.5" aria-hidden /> : <Globe className="h-3.5 w-3.5" aria-hidden />}
                    <span className="max-w-[220px] truncate">{community ? community.name : "Público"}</span>
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </div>

              <label className="mt-3 block">
                <span className="sr-only">Texto de la publicación</span>
                <textarea
                  ref={textRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={3000}
                  rows={media.length ? 3 : 5}
                  placeholder={`¿Qué quieres compartir, ${firstName}?`}
                  className={`w-full resize-none bg-transparent placeholder:text-ink-subtle focus:outline-none focus-visible:outline-none ${
                    text.length > 120 || media.length ? "text-[16px]" : "text-[22px]"
                  }`}
                />
              </label>

              {media.length > 0 && (
                <div className={`grid gap-1.5 ${media.length === 1 ? "grid-cols-1" : media.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                  {media.map((m) => (
                    <div key={m.preview} className="relative overflow-hidden rounded-xl border border-line bg-page">
                      {m.type === "video" ? (
                        <video src={m.preview} controls={media.length === 1} muted playsInline className={`w-full bg-ink object-cover ${media.length === 1 ? "max-h-72" : "aspect-square"}`} />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.preview} alt="Vista previa" className={`w-full object-cover ${media.length === 1 ? "max-h-72" : "aspect-square"}`} />
                      )}
                      {!m.url && (
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-card/70 text-sm font-semibold">
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Subiendo…
                        </div>
                      )}
                      {m.type === "video" && media.length > 1 && (
                        <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white">Vídeo</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setMedia((all) => all.filter((x) => x.preview !== m.preview))}
                        aria-label="Quitar archivo"
                        className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 text-ink shadow hover:bg-card"
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  ))}
                  {media.length < MAX_MEDIA && (
                    <button
                      type="button"
                      onClick={pickFile}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-sm font-semibold text-ink-muted hover:border-ink-subtle hover:text-ink ${
                        media.length === 1 ? "min-h-20" : "aspect-square"
                      }`}
                    >
                      <ImagePlus className="h-5 w-5" aria-hidden /> Añadir más
                    </button>
                  )}
                </div>
              )}

              {error && (
                <p role="alert" className="mt-3 rounded-input bg-red-50 px-3 py-2 text-sm text-danger">
                  {error}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between rounded-xl border border-line px-4 py-2.5">
                <span className="text-[15px] font-semibold">
                  <span className="hidden sm:inline">Añadir a tu publicación</span>
                  <span className="sm:hidden">Añadir</span>
                </span>
                <div className="flex items-center">
                  {OPTIONS.slice(0, 5).map((o) => (
                    <button
                      key={o.panel}
                      type="button"
                      onClick={() => go(o.panel)}
                      aria-label={o.label}
                      title={o.label}
                      className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-page"
                    >
                      {o.icon}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPanel("more")}
                    aria-label="Ver todas las opciones"
                    title="Más"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-ink-muted hover:bg-page"
                  >
                    <MoreHorizontal className="h-6 w-6" aria-hidden />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={publish}
                disabled={!canPublish || publishing}
                className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-page disabled:text-ink-subtle"
              >
                {publishing && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                Publicar
              </button>
            </div>
          </>
        ) : panel === "more" ? (
          <>
            <PanelHeader title="Añadir a tu publicación" id="create-post-title" onBack={() => setPanel("main")} />
            <ul className="grid gap-1 p-3 sm:grid-cols-2">
              {OPTIONS.map((o) => (
                <li key={o.panel}>
                  <button
                    type="button"
                    onClick={() => go(o.panel)}
                    className="flex min-h-14 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] font-semibold hover:bg-page"
                  >
                    {o.icon}
                    {o.label}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : panel === "feeling" ? (
          <FeelingPanel
            value={feeling}
            onBack={() => setPanel("main")}
            onPick={(f) => {
              setFeeling(f);
              setPanel("main");
            }}
          />
        ) : panel === "tag" ? (
          <TagPanel value={tagged} onBack={() => setPanel("main")} onDone={(t) => { setTagged(t); setPanel("main"); }} />
        ) : panel === "location" ? (
          <LocationPanel
            value={location}
            onBack={() => setPanel("main")}
            onPick={(l) => {
              setLocation(l);
              setPanel("main");
            }}
          />
        ) : panel === "gif" ? (
          <>
            <PanelHeader title="Añadir un GIF" id="create-post-title" onBack={() => setPanel("main")} />
            <div className="p-6 text-center">
              <GifIcon className="h-10 w-14 text-base" />
              <p className="mt-4 text-[15px]">Sube un GIF animado desde tu ordenador o tu móvil.</p>
              <p className="mt-1 text-[13px] text-ink-muted">Máximo 25 MB.</p>
              <button
                type="button"
                onClick={() => gifInput.current?.click()}
                className="mt-5 min-h-11 rounded-full bg-brand-600 px-6 font-semibold text-on-brand hover:bg-brand-hover"
              >
                Elegir GIF
              </button>
            </div>
          </>
        ) : panel === "camera" ? (
          <CameraPanel
            onBack={() => setPanel("main")}
            onRecorded={(blob) => {
              attach(blob, "video.webm");
              setPanel("main");
            }}
          />
        ) : (
          <AudiencePanel
            value={community}
            onBack={() => setPanel("main")}
            onPick={(c) => {
              setCommunity(c);
              setPanel("main");
            }}
          />
        )}
      </div>
    </div>
  );
}

function PanelHeader({ title, id, onClose, onBack }: { title: string; id: string; onClose?: () => void; onBack?: () => void }) {
  return (
    <div className="relative flex h-16 shrink-0 items-center justify-center border-b border-line px-14">
      {onBack && (
        <button type="button" onClick={onBack} aria-label="Volver" className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-page hover:bg-line">
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </button>
      )}
      <h2 id={id} className="truncate text-xl font-bold">
        {title}
      </h2>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Cerrar" className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full bg-page hover:bg-line">
          <X className="h-5 w-5" aria-hidden />
        </button>
      )}
    </div>
  );
}

function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative block">
      <span className="sr-only">{placeholder}</span>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden />
      <input
        autoFocus
        type="text"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-full bg-page pl-10 pr-4 text-[15px] placeholder:text-ink-subtle focus:bg-card focus:outline-none focus:ring-2 focus:ring-brand-600/30"
      />
    </label>
  );
}

function FeelingPanel({ value, onBack, onPick }: { value: string | null; onBack: () => void; onPick: (f: string | null) => void }) {
  const [q, setQ] = useState("");
  const list = FEELINGS.filter((f) => f.label.includes(q.toLowerCase().trim()));
  return (
    <>
      <PanelHeader title="¿Cómo te sientes?" id="create-post-title" onBack={onBack} />
      <div className="overflow-y-auto p-3">
        <SearchField value={q} onChange={setQ} placeholder="Buscar sentimiento o actividad" />
        <ul className="mt-3 grid grid-cols-2 gap-1">
          {list.map((f) => (
            <li key={f.label}>
              <button
                type="button"
                onClick={() => onPick(f.label)}
                aria-pressed={value === f.label}
                className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] ${
                  value === f.label ? "bg-brand-50 font-semibold text-brand-700" : "hover:bg-page"
                }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-page text-xl">{f.emoji}</span>
                {f.label}
              </button>
            </li>
          ))}
          {q.trim() && !list.length && (
            <li className="col-span-2">
              <button type="button" onClick={() => onPick(q.trim())} className="min-h-12 w-full rounded-xl px-3 text-left text-[15px] hover:bg-page">
                Usar «{q.trim()}»
              </button>
            </li>
          )}
        </ul>
        {value && (
          <button type="button" onClick={() => onPick(null)} className="mt-2 min-h-11 w-full rounded-xl text-sm font-semibold text-danger hover:bg-red-50">
            Quitar sentimiento
          </button>
        )}
      </div>
    </>
  );
}

function TagPanel({ value, onBack, onDone }: { value: Author[]; onBack: () => void; onDone: (t: Author[]) => void }) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Author[]>(value);
  const [results, setResults] = useState<Author[]>([]);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      api<SearchResult>(`/search?q=${encodeURIComponent(term)}`)
        .then((r) => setResults(r.users))
        .catch(() => setResults([]));
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const toggle = (a: Author) =>
    setSelected((s) => (s.some((x) => x.id === a.id) ? s.filter((x) => x.id !== a.id) : [...s, a]));

  return (
    <>
      <PanelHeader title="Etiquetar personas" id="create-post-title" onBack={onBack} />
      <div className="flex min-h-[320px] flex-col overflow-y-auto p-3">
        <SearchField value={q} onChange={setQ} placeholder="Buscar por nombre" />
        {selected.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selected.map((a) => (
              <button key={a.id} type="button" onClick={() => toggle(a)} className="inline-flex min-h-8 items-center gap-1 rounded-full bg-brand-50 pl-3 pr-2 text-sm font-semibold text-brand-700">
                {a.name} <X className="h-3.5 w-3.5" aria-label="Quitar" />
              </button>
            ))}
          </div>
        )}
        <ul className="mt-2 flex-1">
          {!q.trim() && <li className="px-3 py-4 text-sm text-ink-muted">Escribe el nombre de alguien de StudyHub.</li>}
          {q.trim() && results.length === 0 && <li className="px-3 py-4 text-sm text-ink-muted">No encontramos a nadie con ese nombre.</li>}
          {results.map((a) => {
            const on = selected.some((x) => x.id === a.id);
            return (
              <li key={a.id}>
                <button type="button" onClick={() => toggle(a)} aria-pressed={on} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-page">
                  <Avatar name={a.name} src={a.avatar_url} size="sm" square={a.role === "company"} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{a.name}</span>
                    {a.headline && <span className="block truncate text-[13px] text-ink-muted">{a.headline}</span>}
                  </span>
                  {on && <Check className="h-5 w-5 text-brand-700" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
        <button type="button" onClick={() => onDone(selected)} className="mt-3 min-h-11 rounded-xl bg-brand-600 font-semibold text-on-brand hover:bg-brand-hover">
          Listo
        </button>
      </div>
    </>
  );
}

function LocationPanel({ value, onBack, onPick }: { value: string | null; onBack: () => void; onPick: (l: string | null) => void }) {
  const [q, setQ] = useState("");
  const [places, setPlaces] = useState<{ id: number; name: string; city: string | null }[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      api<{ id: number; name: string; city: string | null }[]>(`/catalog/schools?q=${encodeURIComponent(q.trim())}`)
        .then(setPlaces)
        .catch(() => setPlaces([]));
    }, 150);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <>
      <PanelHeader title="Registrar visita" id="create-post-title" onBack={onBack} />
      <div className="min-h-[320px] overflow-y-auto p-3">
        <SearchField value={q} onChange={setQ} placeholder="¿Dónde estás?" />
        <ul className="mt-2">
          {q.trim() && (
            <li>
              <button type="button" onClick={() => onPick(q.trim())} className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left hover:bg-page">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-danger">
                  <MapPin className="h-4 w-4" aria-hidden />
                </span>
                <span className="font-semibold">Usar «{q.trim()}»</span>
              </button>
            </li>
          )}
          {places.map((p) => {
            const label = p.city ? `${p.name}, ${p.city}` : p.name;
            return (
              <li key={p.id}>
                <button type="button" onClick={() => onPick(label)} className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left hover:bg-page">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-page">
                    <MapPin className="h-4 w-4 text-ink-muted" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{p.name}</span>
                    {p.city && <span className="block text-[13px] text-ink-muted">{p.city}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {value && (
          <button type="button" onClick={() => onPick(null)} className="mt-2 min-h-11 w-full rounded-xl text-sm font-semibold text-danger hover:bg-red-50">
            Quitar ubicación
          </button>
        )}
      </div>
    </>
  );
}

function AudiencePanel({ value, onBack, onPick }: { value: Community | null; onBack: () => void; onPick: (c: Community | null) => void }) {
  const [mine, setMine] = useState<Community[] | null>(null);

  useEffect(() => {
    api<User>("/auth/me")
      .then((me) => api<{ communities: Community[] }>(`/users/${me.id}`))
      .then((p) => setMine(p.communities))
      .catch(() => setMine([]));
  }, []);

  const option = (c: Community | null, label: string, sub: string, icon: ReactNode) => {
    const on = (value?.id ?? null) === (c?.id ?? null);
    return (
      <button type="button" onClick={() => onPick(c)} aria-pressed={on} className="flex min-h-14 w-full items-center gap-3 rounded-xl px-3 text-left hover:bg-page">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-page">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{label}</span>
          <span className="block text-[13px] text-ink-muted">{sub}</span>
        </span>
        <span className={`h-5 w-5 rounded-full border-2 ${on ? "border-[6px] border-brand-600" : "border-ink-subtle"}`} aria-hidden />
      </button>
    );
  };

  return (
    <>
      <PanelHeader title="¿Dónde lo publicas?" id="create-post-title" onBack={onBack} />
      <div className="max-h-[60vh] overflow-y-auto p-3">
        {option(null, "Público", "Cualquier persona de StudyHub", <Globe className="h-5 w-5" aria-hidden />)}
        <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">En una de tus comunidades</p>
        {mine === null && <p className="px-3 py-3 text-sm text-ink-muted">Cargando…</p>}
        {mine?.length === 0 && <p className="px-3 py-3 text-sm text-ink-muted">Aún no estás en ninguna comunidad.</p>}
        {mine?.map((c) => (
          <div key={c.id}>{option(c, c.name, "Lo verán sobre todo sus miembros", <Users className="h-5 w-5" aria-hidden />)}</div>
        ))}
      </div>
    </>
  );
}

function CameraPanel({ onBack, onRecorded }: { onBack: () => void; onRecorded: (b: Blob) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Tu navegador no permite usar la cámara.");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setError("No hemos podido acceder a la cámara. Revisa los permisos del navegador."));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const start = () => {
    if (!streamRef.current) return;
    chunks.current = [];
    const rec = new MediaRecorder(streamRef.current);
    rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    rec.onstop = () => onRecorded(new Blob(chunks.current, { type: "video/webm" }));
    rec.start();
    recorderRef.current = rec;
    setSeconds(0);
    setRecording(true);
  };

  const stop = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <>
      <PanelHeader title="Grabar vídeo" id="create-post-title" onBack={onBack} />
      <div className="p-4">
        {error ? (
          <p role="alert" className="rounded-input bg-red-50 px-4 py-6 text-center text-sm text-danger">
            {error}
          </p>
        ) : (
          <div className="relative overflow-hidden rounded-xl bg-ink">
            <video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full object-cover" />
            {recording && (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-danger px-2.5 py-1 text-xs font-bold text-white">
                <span className="h-2 w-2 animate-pulse rounded-full bg-card" /> REC 0:{String(seconds).padStart(2, "0")}
              </span>
            )}
          </div>
        )}
        <div className="mt-4 flex justify-center">
          {recording ? (
            <button type="button" onClick={stop} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-6 font-semibold text-inverse">
              <Square className="h-4 w-4 fill-current" aria-hidden /> Detener y añadir
            </button>
          ) : (
            <button type="button" onClick={start} disabled={!!error} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-danger px-6 font-semibold text-white disabled:opacity-50">
              <span className="h-3 w-3 rounded-full bg-card" aria-hidden /> Empezar a grabar
            </button>
          )}
        </div>
      </div>
    </>
  );
}

