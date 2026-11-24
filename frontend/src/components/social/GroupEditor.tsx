"use client";

import { ChevronRight, ImagePlus, Loader2, Monitor, Smartphone, Smile, Trash2, Video } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Field } from "@/components/Field";
import { Select, type SelectItem } from "@/components/Select";
import { displayName } from "@/components/app/TopBar";
import { api, ApiError, refreshGroups, uploadFile, type Author, type Group, type GroupPrivacy, type Topic, type User } from "@/lib/api";
import { ONLINE, PRIVACY } from "@/lib/groups";
import { COMMON_PROVINCES, PROVINCES } from "@/lib/jobs";
import { GroupCover } from "./GroupCover";
import { GroupHeader } from "./GroupHeader";
import { PeoplePicker } from "./PeoplePicker";


function SelectField({ label, hint, value, onChange, options, placeholder }: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  options: SelectItem[];
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div>
      <label id={`${id}-label`} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <Select labelledBy={`${id}-label`} value={value} onChange={onChange} options={options} placeholder={placeholder} />
      {hint && <p className="mt-1.5 text-[13px] text-ink-muted">{hint}</p>}
    </div>
  );
}

/**
 * Crear (o editar) un grupo. A la izquierda el formulario y a la derecha una vista previa que cambia
 * mientras escribes, en versión ordenador o móvil (como en la referencia de Social/Crear grupo).
 */
export function GroupEditor({ user, group }: { user: User; group?: Group }) {
  const router = useRouter();
  const editing = !!group;
  const [name, setName] = useState(group?.name ?? "");
  const [privacy, setPrivacy] = useState<GroupPrivacy | "">(group?.privacy ?? "");
  const [topic, setTopic] = useState(group?.topic ?? "");
  const [province, setProvince] = useState(group?.province ?? "");
  const [description, setDescription] = useState(group?.description ?? "");
  const [cover, setCover] = useState<string | null>(group?.cover_url ?? null);
  const [invited, setInvited] = useState<Author[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const fileInput = useRef<HTMLInputElement>(null);
  const descId = useId();

  useEffect(() => {
    api<Topic[]>("/groups/topics").then(setTopics).catch(() => setTopics([]));
  }, []);

  const valid = name.trim().length >= 3 && !!privacy && !!topic && !uploading;
  const topicLabel = topics.find((t) => t.key === topic)?.label ?? null;

  const pickCover = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const r = await uploadFile(file);
      if (r.media_type !== "image") throw new ApiError("La portada tiene que ser una foto (JPG, PNG o WebP).", 400);
      setCover(r.url);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se ha podido subir la foto.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    setError(null);
    try {
      const body = {
        name: name.trim(),
        privacy,
        topic,
        province: province || null,
        description: description.trim() || null,
        cover_url: cover,
        invite_ids: invited.map((p) => p.id),
      };
      const saved = await api<Group>(editing ? `/groups/${group.id}` : "/groups", { method: editing ? "PUT" : "POST", body });
      refreshGroups();
      router.push(`/social/grupo/${saved.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se ha podido guardar el grupo.");
      setSaving(false);
    }
  };

  const me = displayName(user);
  const mobile = device === "mobile";

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <form onSubmit={submit} className="flex flex-col rounded-card border border-line bg-card lg:sticky lg:top-[88px] lg:max-h-[calc(100vh-112px)]">
        <div className="space-y-4 overflow-y-auto p-5">
          <nav aria-label="Ruta" className="flex items-center gap-1 text-[13px] text-ink-muted">
            <Link href="/social" className="hover:underline">
              Grupos
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            {editing ? (
              <>
                <Link href={`/social/grupo/${group.id}`} className="max-w-[160px] truncate hover:underline">
                  {group.name}
                </Link>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                <span>Editar</span>
              </>
            ) : (
              <span>Crear grupo</span>
            )}
          </nav>
          <h1 className="text-[28px] font-bold leading-tight">{editing ? "Editar grupo" : "Crear grupo"}</h1>

          <div className="flex items-center gap-3">
            <Avatar name={me || "?"} size="md" square={user.role === "company"} />
            <div>
              <p className="font-semibold">{me}</p>
              <p className="text-[13px] text-ink-muted">Administrador</p>
            </div>
          </div>

          {error && <ErrorBanner message={error} />}

          <Field label="Nombre del grupo" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Ej.: Quedadas de DAW en Granada" required />

          <SelectField
            label="Privacidad"
            value={privacy}
            onChange={(v) => setPrivacy(v as GroupPrivacy)}
            hint={privacy ? PRIVACY[privacy].text : undefined}
            placeholder="Elige la privacidad"
            options={[
              { value: "public", label: "Público" },
              { value: "private", label: "Privado" },
            ]}
          />

          <SelectField
            label="Temática"
            value={topic}
            onChange={setTopic}
            hint="Sirve para recomendar el grupo a quien le pueda interesar."
            placeholder="Elige una temática"
            options={[
              { heading: "De estudios y trabajo" },
              ...topics.filter((t) => !t.universal).map((t) => ({ value: t.key, label: t.label })),
              { heading: "Para todo el mundo" },
              ...topics.filter((t) => t.universal).map((t) => ({ value: t.key, label: t.label })),
            ]}
          />

          <SelectField
            label="Ubicación"
            value={province}
            onChange={setProvince}
            hint="Si es de una ciudad, se recomendará sobre todo a la gente de esa provincia."
            options={[
              { value: "", label: ONLINE },
              { heading: "Más comunes" },
              ...COMMON_PROVINCES.map((p) => ({ value: p, label: p })),
              { heading: "Todas las provincias" },
              ...PROVINCES.map((p) => ({ value: p, label: p })),
            ]}
          />

          <div>
            <label htmlFor={descId} className="mb-1.5 block text-sm font-medium">
              Descripción (opcional)
            </label>
            <textarea
              id={descId}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="¿De qué va el grupo? ¿Quién debería unirse?"
              className="w-full resize-y rounded-input border border-line bg-card px-3.5 py-3 text-[15px] placeholder:text-ink-subtle hover:border-ink-subtle focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            />
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium">Foto de portada (opcional)</p>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => pickCover(e.target.files?.[0])} />
            {cover ? (
              <div className="flex items-center gap-3">
                <GroupCover src={cover} topic={topic} iconSize="sm" className="h-14 w-24 rounded-btn" />
                <button type="button" onClick={() => fileInput.current?.click()} className="min-h-11 px-2 text-sm font-semibold text-brand-700">
                  Cambiar
                </button>
                <button type="button" onClick={() => setCover(null)} className="flex min-h-11 items-center gap-1 px-2 text-sm font-semibold text-danger">
                  <Trash2 className="h-4 w-4" aria-hidden /> Quitar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-btn border border-dashed border-line text-[15px] font-semibold text-ink hover:border-ink-subtle"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ImagePlus className="h-5 w-5 text-ink-muted" aria-hidden />}
                {uploading ? "Subiendo…" : "Añadir foto"}
              </button>
            )}
            {!cover && <p className="mt-1.5 text-[13px] text-ink-muted">Si no pones ninguna, se usa una con el icono de la temática.</p>}
          </div>

          {!editing && <PeoplePicker value={invited} onChange={setInvited} exclude={[user.id]} />}
        </div>
        <div className="border-t border-line p-4">
          <Button type="submit" full loading={saving} disabled={!valid}>
            {editing ? "Guardar cambios" : "Crear"}
          </Button>
          {!valid && !saving && <p className="mt-2 text-center text-[13px] text-ink-muted">Pon un nombre y elige la privacidad y la temática.</p>}
        </div>
      </form>

      <section aria-label="Vista previa" className="rounded-card border border-line bg-card p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Vista previa para {mobile ? "móvil" : "ordenador"}</h2>
          <div className="flex gap-1" role="group" aria-label="Tamaño de la vista previa">
            {(
              [
                ["desktop", Monitor, "Ordenador"],
                ["mobile", Smartphone, "Móvil"],
              ] as const
            ).map(([key, Icon, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setDevice(key)}
                aria-pressed={device === key}
                aria-label={label}
                title={label}
                className={`flex h-11 w-11 items-center justify-center rounded-btn transition-colors ${device === key ? "nav-mark" : "text-ink-muted hover:bg-field-hover"}`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </button>
            ))}
          </div>
        </div>

        <div aria-hidden className={`pointer-events-none mx-auto select-none rounded-card bg-page p-3 ${mobile ? "max-w-[380px]" : ""}`}>
          <GroupHeader
            placeholder
            compact={mobile}
            name={name.trim()}
            privacy={privacy || null}
            members={group?.members ?? 1}
            cover={cover}
            topic={topic || null}
            topicLabel={topicLabel}
            province={topic ? province || null : undefined}
            tab="informacion"
          />
          <div className={`mt-3 grid gap-3 ${mobile ? "" : "md:grid-cols-[minmax(0,1fr)_240px]"}`}>
            <div className={`rounded-card border border-line bg-card p-4 ${mobile ? "order-2" : ""}`}>
              {/* Igual que la caja de publicar de verdad: iconos en un solo color a la derecha, sin barra de acciones */}
              <div className="flex items-center gap-3">
                <Avatar name={me || "?"} size="sm" square={user.role === "company"} />
                <span className="flex-1 truncate rounded-btn bg-field px-4 py-2.5 text-[15px] text-field-text">Escribe algo en el grupo…</span>
                <Video className="h-5 w-5 shrink-0 text-ink-muted" aria-hidden />
                <ImagePlus className="h-5 w-5 shrink-0 text-ink-muted" aria-hidden />
                {!mobile && <Smile className="h-5 w-5 shrink-0 text-ink-muted" aria-hidden />}
              </div>
            </div>
            <div className="rounded-card border border-line bg-card p-4">
              <p className="font-semibold">Información</p>
              <p className={`mt-1 whitespace-pre-line break-words text-sm ${description.trim() ? "text-ink" : "text-ink-subtle"}`}>
                {description.trim() || "Aquí saldrá la descripción del grupo."}
              </p>
              {privacy && <p className="mt-2 text-[13px] text-ink-muted">{PRIVACY[privacy].text}</p>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
