"use client";

import { BarChart3, Bookmark, Briefcase, ChevronDown, ChevronRight, Globe, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, logout, mediaUrl, type Profile, type User } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { Avatar } from "../Avatar";

/** Menú que se abre al pulsar tu foto (arriba a la derecha), como el menú "Yo" de LinkedIn. */
export function UserMenu({ user, name }: { user: User | null; name: string }) {
  const t = useT();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const company = user?.role === "company";

  // Se cierra al cambiar de página, al pulsar fuera o con Esc
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !boxRef.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open && user && !profile) api<Profile>(`/users/${user.id}`).then(setProfile).catch(() => {});
  }, [open, user, profile]);

  const avatar = profile?.user.avatar_url ? mediaUrl(profile.user.avatar_url) : null;
  const card = "flex min-h-14 items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 transition-colors hover:bg-page";
  const row = "flex min-h-11 items-center gap-3 rounded-lg px-1 text-[15px] text-ink transition-colors hover:bg-page";

  return (
    <div ref={boxRef} className="relative ml-1 hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t("Yo")}: ${name}`}
        className="flex flex-col items-center gap-0.5 rounded-xl px-1 py-0.5 hover:bg-page"
      >
        <Avatar name={name || "?"} src={avatar} size="sm" square={company} />
        <span className="flex items-center text-[12px] font-semibold text-ink-muted">
          {t("Yo")} <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </span>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-[340px] rounded-card border border-line bg-white p-4 shadow-xl">
          <Link role="menuitem" href="/perfil" className={`${card} items-start`}>
            <span className="flex min-w-0 gap-3">
              <Avatar name={name || "?"} src={avatar} size="md" square={company} />
              <span className="min-w-0">
                <span className="block truncate text-[17px] font-semibold">{name}</span>
                {profile?.user.headline && <span className="line-clamp-2 text-[13px] text-ink-muted">{profile.user.headline}</span>}
                <span className="mt-0.5 block text-[13px] font-semibold text-brand-700">{t("Ver tu perfil")}</span>
              </span>
            </span>
            <ChevronRight className="mt-3 h-5 w-5 shrink-0 text-ink-muted" aria-hidden />
          </Link>

          <Link role="menuitem" href="/estadisticas" className={`${card} mt-3`}>
            <span className="flex items-center gap-3 text-[15px]">
              <BarChart3 className="h-5 w-5 text-ink-muted" aria-hidden />
              {t("Estadísticas")}
            </span>
            <ChevronRight className="h-5 w-5 text-ink-muted" aria-hidden />
          </Link>

          <Link role="menuitem" href="/guardados" className={`${card} mt-3`}>
            <span className="flex items-center gap-3 text-[15px]">
              <Bookmark className="h-5 w-5 text-ink-muted" aria-hidden />
              {t("Publicaciones guardadas")}
            </span>
            <ChevronRight className="h-5 w-5 text-ink-muted" aria-hidden />
          </Link>

          <div className="mt-3 space-y-0.5">
            <Link role="menuitem" href="/empleo/mias" className={row}>
              <Briefcase className="h-5 w-5" aria-hidden />
              {company ? t("Mis ofertas de empleo") : t("Mis candidaturas")}
            </Link>
            <Link role="menuitem" href="/ajustes" className={row}>
              <Settings className="h-5 w-5" aria-hidden />
              {t("Ajustes y privacidad")}
            </Link>
            <Link role="menuitem" href="/ajustes/idioma" className={row}>
              <Globe className="h-5 w-5" aria-hidden />
              {t("Idioma")}
            </Link>
          </div>

          <div className="mt-2 border-t border-line pt-2">
            <button role="menuitem" type="button" onClick={logout} className={`${row} w-full text-left`}>
              <LogOut className="h-5 w-5" aria-hidden />
              {t("Cerrar sesión")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
