"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Idioma de la interfaz. Se guarda en este navegador (localStorage) y se cambia en Ajustes → Idioma.
 * Las cadenas se escriben en español en el código y aquí está su traducción. De momento están traducidos
 * la barra superior, los menús laterales, el menú de tu foto, Ajustes y Estadísticas.
 */
export type Lang = "es" | "en";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
];

const KEY = "studyhub_lang";
const EVENT = "studyhub:lang";

export function getLang(): Lang {
  try {
    return localStorage.getItem(KEY) === "en" ? "en" : "es";
  } catch {
    return "es";
  }
}

export function setLang(lang: Lang) {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    /* almacenamiento no disponible */
  }
  document.documentElement.lang = lang;
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang, () => "es");
}

const EN: Record<string, string> = {
  // Navegación
  Inicio: "Home",
  Social: "Network",
  Empleo: "Jobs",
  Mensajes: "Messages",
  Notificaciones: "Notifications",
  Buscar: "Search",
  Reels: "Reels",
  Foros: "Forums",
  Eventos: "Events",
  Guardados: "Saved",
  "Lo tuyo": "Yours",
  Perfil: "Profile",
  Yo: "Me",
  // Grupos (Social)
  Grupos: "Groups",
  "Tu feed": "Your feed",
  Sugerencias: "Discover",
  Descubrir: "Discover",
  "Crear grupo": "Create group",
  "Tus grupos": "Your groups",
  "Crear nuevo grupo": "Create new group",
  "Grupos a los que te has unido": "Groups you've joined",
  "Ver todo": "See all",
  "Buscar grupos": "Search groups",
  // Menú de la foto
  "Ver tu perfil": "View your profile",
  Estadísticas: "Analytics",
  "Publicaciones guardadas": "Saved posts",
  "Mis ofertas de empleo": "My job posts",
  "Mis candidaturas": "My applications",
  "Ajustes y privacidad": "Settings & privacy",
  Idioma: "Language",
  "Cerrar sesión": "Sign out",
  // Estadísticas
  Rendimiento: "Performance",
  Contenido: "Content",
  "Crear publicación": "Create post",
  "Análisis de público": "Audience analytics",
  "Análisis de contenido": "Content analytics",
  "Últimos 7 días": "Past 7 days",
  "Últimos 28 días": "Past 28 days",
  "Últimos 90 días": "Past 90 days",
  "Te siguen": "Following you",
  "Han abierto tu perfil": "Opened your profile",
  "Te han encontrado buscando": "Found you searching",
  "Han visto lo que publicas": "Saw what you post",
  "Personas distintas que han entrado en tu perfil": "Different people who visited your profile",
  "Veces que has salido cuando alguien buscaba en Linkedu": "Times you showed up when someone searched Linkedu",
  Vistas: "Views",
  "sin cambios": "no change",
  "en comparación con": "compared to",
  nuevo: "new",
  "respecto a": "compared to",
  Periodo: "Period",
  "Seguidores nuevos en el periodo": "New followers in this period",
  "Veces que tus publicaciones han salido en el inicio de otras personas": "Times your posts appeared in other people's feeds",
  "Tus publicaciones": "Your posts",
  Publicación: "Post",
  Impresiones: "Impressions",
  "Me gusta": "Likes",
  Comentarios: "Comments",
  Compartidos: "Reposts",
  "Todavía no has publicado nada": "You haven't posted anything yet",
  "Cuando publiques, aquí verás cuánta gente lo ve y cómo reacciona.": "When you post, you'll see here how many people see it and how they react.",
  "en el periodo": "in this period",
  "No hemos podido cargar las estadísticas.": "We couldn't load your analytics.",
  Reintentar: "Try again",
  // Ajustes
  Ajustes: "Settings",
  "Tu cuenta": "Your account",
  "Contraseña y sesiones": "Password & sessions",
  "Quién te ve": "Who sees you",
  "Tus datos": "Your data",
  "Información del perfil": "Profile information",
  "Nombre, ubicación y estudios": "Name, location and studies",
  "Nombre, ubicación y sector": "Name, location and industry",
  Verificaciones: "Verifications",
  "Email verificado": "Email verified",
  Visualización: "Display",
  "Modo oscuro": "Dark mode",
  Tema: "Theme",
  Claro: "Light",
  Oscuro: "Dark",
  "Como el sistema": "Same as system",
  "Preferencias generales": "General preferences",
  Cuenta: "Account",
  Email: "Email",
  "Cambiar contraseña": "Change password",
  "Tipo de cuenta": "Account type",
  Estudiante: "Student",
  Empresa: "Company",
  "Quién puede ver tu perfil": "Who can see your profile",
  "Quién puede enviarte mensajes": "Who can message you",
  "Descargar tus datos": "Download your data",
  "Eliminar la cuenta": "Delete account",
  "Avisos por email": "Email notifications",
  "Avisos en la app": "In-app notifications",
  Próximamente: "Coming soon",
  Volver: "Back",
  "Selecciona el idioma que utilizas en Linkedu": "Select the language you use on Linkedu",
  "Dinos en qué idioma prefieres usar Linkedu. Puedes cambiarlo en cualquier momento.":
    "Tell us which language you prefer to use Linkedu in. You can change it at any time.",
  "Se guarda en este navegador.": "It's saved in this browser.",
  "Idioma guardado": "Language saved",
};

/** Devuelve la función de traducir. Uso: const t = useT(); t("Inicio") */
export function useT() {
  const lang = useLang();
  return useCallback((s: string) => (lang === "en" ? (EN[s] ?? s) : s), [lang]);
}
