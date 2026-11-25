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
 * Cabecera de un grupo como una carpeta: la temática en la pestaña de arriba, la portada en un
 * cuadrado a la izquierda (foto o icono de la temática), el nombre en Bricolage y las secciones
 * marcadas en naranja. Sin portada a lo ancho ni pestañas subrayadas (eso era Facebook Grupos).
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
  note,
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
  /** Una línea debajo de los datos (p. ej. «Marta, a quien sigues, está aquí») */
  note?: ReactNode;
  actions?: ReactNode;
  tab?: GroupTab;
  onTab?: (t: GroupTab) => void;
  placeholder?: boolean;
  /** Vista de móvil en la vista previa */
  compact?: boolean;
}) {
  const PrivacyIcon = privacy === "private" ? Lock : Globe;
  const tile = compact ? "h-16 w-16" : "h-[72px] w-[72px] sm:h-28 sm:w-28";
  return (
    <div>
      {/* La pestaña de la carpeta: tapa el borde de la ficha con su fondo */}
      <div
        className={`relative z-[1] -mb-px inline-flex max-w-[70%] rounded-t-card border border-b-0 border-line bg-card px-4 pb-1.5 pt-2 text-[13px] font-semibold ${
          topicLabel ? "text-brand-700" : "text-ink-subtle"
        }`}
      >
        <span className="truncate">{topicLabel || (placeholder ? "Temática" : "Grupo")}</span>
      </div>
      <div className="rounded-card rounded-tl-none border border-line bg-card">
        <div className={`grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 ${compact ? "p-4" : "p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-x-5 sm:p-6"}`}>
          {placeholder && !cover && !topic ? (
            <div aria-hidden className={`${tile} shrink-0 rounded-btn bg-gradient-to-br from-page to-line`} />
          ) : (
            <GroupCover src={cover} topic={topic} iconSize="tile" className={`${tile} shrink-0 rounded-btn`} />
          )}
          <div className="min-w-0">
            <h1
              className={`text-balance break-words font-extrabold leading-[1.05] tracking-[-0.02em] ${compact ? "text-[22px]" : "text-[28px] sm:text-[40px]"} ${
                placeholder && !name ? "text-ink-subtle" : ""
              }`}
            >
              {name || "Nombre del grupo"}
            </h1>
            <p className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] sm:text-[15px] ${placeholder && !privacy ? "text-ink-subtle" : "text-ink-muted"}`}>
              <span className="inline-flex items-center gap-1.5">
                <PrivacyIcon className="h-4 w-4" aria-hidden />
                {privacy ? PRIVACY[privacy].label : "Privacidad del grupo"}
              </span>
              {onTab ? (
                <button type="button" onClick={() => onTab("miembros")} className="font-semibold text-ink hover:underline">
                  {membersText(members)}
                </button>
              ) : (
                <span className="font-semibold text-ink">{membersText(members)}</span>
              )}
              {province !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" aria-hidden /> {province || ONLINE}
                </span>
              )}
            </p>
            {note && <p className="mt-1.5 text-[13px] text-ink-muted">{note}</p>}
          </div>
          {/* Botones: debajo en el móvil, a la derecha del nombre en pantallas anchas */}
          {actions && <div className={`col-span-2 ${compact ? "" : "sm:col-span-1 sm:self-center"}`}>{actions}</div>}
        </div>
        {/* Lista de pestañas accesible: solo la activa entra con Tab; las flechas, Inicio y Fin cambian de pestaña */}
        <div role="tablist" aria-label="Secciones del grupo" className="no-scrollbar flex gap-1 overflow-x-auto border-t border-line p-2">
          {GROUP_TABS.map((t, i) => {
            const active = tab === t.key;
            const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
              const last = GROUP_TABS.length - 1;
              const next =
                e.key === "ArrowRight" ? (i === last ? 0 : i + 1) : e.key === "ArrowLeft" ? (i === 0 ? last : i - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : -1;
              if (next < 0 || !onTab) return;
              e.preventDefault();
              onTab(GROUP_TABS[next].key);
              document.getElementById(`grupo-tab-${GROUP_TABS[next].key}`)?.focus();
            };
            return (
              <button
                key={t.key}
                id={`grupo-tab-${t.key}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="grupo-panel"
                tabIndex={active ? 0 : -1}
                disabled={!onTab}
                onClick={() => onTab?.(t.key)}
                onKeyDown={onKeyDown}
                className={`min-h-11 shrink-0 rounded-btn px-3.5 text-[15px] font-semibold transition-colors disabled:cursor-default ${
                  active ? "nav-mark" : "text-ink-muted enabled:hover:bg-field-hover enabled:hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
