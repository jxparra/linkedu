import { Globe, Lock, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import type { GroupPrivacy } from "@/lib/api";
import { membersText, ONLINE, PRIVACY } from "@/lib/groups";
import { GroupCover } from "./GroupCover";

export type GroupTab = "publicaciones" | "informacion" | "miembros";
export const GROUP_TABS: { key: GroupTab; label: string }[] = [
  { key: "publicaciones", label: "Publicaciones" },
  { key: "informacion", label: "Información" },
  { key: "miembros", label: "Miembros" },
];

/**
 * Cabecera de un grupo: portada, nombre, privacidad · miembros y pestañas.
 * La usan la página del grupo y la vista previa de "Crear grupo" (con `placeholder`, en gris).
 */
export function GroupHeader({
  name,
  privacy,
  members,
  cover,
  topic,
  topicLabel,
  province,
  actions,
  tab,
  onTab,
  placeholder = false,
  compact = false,
}: {
  name: string;
  privacy: GroupPrivacy | null;
  members: number;
  cover: string | null;
  topic: string | null;
  topicLabel?: string | null;
  province?: string | null;
  actions?: ReactNode;
  tab?: GroupTab;
  onTab?: (t: GroupTab) => void;
  placeholder?: boolean;
  /** Vista de móvil en la vista previa */
  compact?: boolean;
}) {
  const PrivacyIcon = privacy === "private" ? Lock : Globe;
  return (
    <div className="overflow-hidden rounded-card border border-line bg-card">
      {placeholder && !cover && !topic ? (
        <div aria-hidden className={`w-full bg-gradient-to-br from-page to-line ${compact ? "aspect-[2/1]" : "aspect-[3/1]"}`} />
      ) : (
        <GroupCover src={cover} topic={topic} iconSize="lg" className={`w-full ${compact ? "aspect-[2/1]" : "aspect-[3/1] max-h-[340px]"}`} />
      )}
      <div className={compact ? "p-4" : "p-5 sm:px-6"}>
        <h1 className={`break-words font-bold leading-tight ${compact ? "text-[22px]" : "text-[28px] sm:text-[32px]"} ${placeholder && !name ? "text-ink-subtle" : ""}`}>
          {name || "Nombre del grupo"}
        </h1>
        <p className={`mt-1.5 flex flex-wrap items-center gap-x-1.5 text-[15px] ${placeholder && !privacy ? "text-ink-subtle" : "text-ink-muted"}`}>
          <PrivacyIcon className="h-4 w-4" aria-hidden />
          {privacy ? PRIVACY[privacy].label : "Privacidad del grupo"}
          <span aria-hidden>·</span>
          <span className="font-semibold text-ink">{membersText(members)}</span>
        </p>
        {(topicLabel || province !== undefined) && (
          <p className="mt-2 flex flex-wrap gap-1.5 text-[13px]">
            {topicLabel && <span className="rounded-full bg-brand-50 px-2.5 py-1 font-semibold text-brand-700">{topicLabel}</span>}
            {province !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-full bg-page px-2.5 py-1 font-semibold text-ink-muted">
                <MapPin className="h-3.5 w-3.5" aria-hidden /> {province || ONLINE}
              </span>
            )}
          </p>
        )}
        {actions && <div className="mt-4">{actions}</div>}
      </div>
      <div role="tablist" aria-label="Secciones del grupo" className="flex gap-1 overflow-x-auto border-t border-line px-3 no-scrollbar">
        {GROUP_TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={!onTab}
              onClick={() => onTab?.(t.key)}
              className={`relative min-h-12 shrink-0 px-3 text-[15px] font-semibold transition-colors disabled:cursor-default ${
                active ? "text-brand-700" : "text-ink-muted enabled:hover:text-ink"
              }`}
            >
              {t.label}
              {active && <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-t-full bg-brand-600" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
