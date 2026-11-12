import {
  BookOpen,
  Brain,
  Briefcase,
  Brush,
  Camera,
  ChefHat,
  Clapperboard,
  Code2,
  Cpu,
  Dumbbell,
  FlaskConical,
  GraduationCap,
  Gamepad2,
  HandHeart,
  HeartPulse,
  House,
  Languages,
  Library,
  MessagesSquare,
  Music,
  Palette,
  PartyPopper,
  Plane,
  Scale,
  School,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Aspecto de cada temática: icono y degradado para la portada cuando el grupo no tiene foto.
 * Las claves son las de backend/app/services/groups.py (TOPICS).
 */
export const TOPIC_STYLE: Record<string, { icon: LucideIcon; from: string; to: string }> = {
  programacion: { icon: Code2, from: "#111111", to: "#FF6B4A" },
  tecnologia: { icon: Cpu, from: "#312E81", to: "#4F46E5" },
  diseno: { icon: Palette, from: "#9D174D", to: "#DB2777" },
  salud: { icon: HeartPulse, from: "#B91C1C", to: "#EF4444" },
  psicologia: { icon: Brain, from: "#6D28D9", to: "#A78BFA" },
  derecho: { icon: Scale, from: "#334155", to: "#64748B" },
  empresa: { icon: TrendingUp, from: "#065F46", to: "#10B981" },
  ciencia: { icon: FlaskConical, from: "#0E7490", to: "#22D3EE" },
  quedadas: { icon: PartyPopper, from: "#C2410C", to: "#F5A524" },
  deportes: { icon: Dumbbell, from: "#15803D", to: "#4ADE80" },
  musica: { icon: Music, from: "#7E22CE", to: "#E879F9" },
  videojuegos: { icon: Gamepad2, from: "#1E1B4B", to: "#6366F1" },
  cine: { icon: Clapperboard, from: "#14161F", to: "#5B6070" },
  viajes: { icon: Plane, from: "#0369A1", to: "#38BDF8" },
  pisos: { icon: House, from: "#92400E", to: "#F59E0B" },
  idiomas: { icon: Languages, from: "#0F766E", to: "#2DD4BF" },
  estudio: { icon: Library, from: "#0F766E", to: "#2EC4B6" },
  empleo: { icon: Briefcase, from: "#111111", to: "#2EC4B6" },
  voluntariado: { icon: HandHeart, from: "#BE123C", to: "#FB7185" },
  fotografia: { icon: Camera, from: "#374151", to: "#9CA3AF" },
  cocina: { icon: ChefHat, from: "#B45309", to: "#FBBF24" },
  lectura: { icon: BookOpen, from: "#78350F", to: "#D97706" },
  arte: { icon: Brush, from: "#A21CAF", to: "#F472B6" },
  // Foros (comunidades de estudios, de centros y generales): no tienen temática
  "foro-degree": { icon: GraduationCap, from: "#6D28D9", to: "#A78BFA" },
  "foro-school": { icon: School, from: "#0F766E", to: "#2EC4B6" },
  "foro-general": { icon: MessagesSquare, from: "#111111", to: "#8B5CF6" },
};

/** Los foros son comunidades de tipo degree | school | general. Los grupos de Social son type "group". */
export const FORUM_LABEL: Record<string, string> = { degree: "Foro de estudios", school: "Foro de centro", general: "Foro general" };

export function isForum(type: string | null | undefined): boolean {
  return !!type && type in FORUM_LABEL;
}

/** "foro" o "grupo", para los textos de los botones. */
export function groupNoun(type: string | null | undefined): "foro" | "grupo" {
  return isForum(type) ? "foro" : "grupo";
}

/** Clave de TOPIC_STYLE para la portada: la temática del grupo o el tipo de foro. */
export function coverTopic(g: { topic: string | null; type?: string | null }): string | null {
  return g.topic ?? (isForum(g.type) ? `foro-${g.type}` : null);
}

export const DEFAULT_TOPIC_STYLE = { icon: Users, from: "#E5482A", to: "#FF8466" };

export function topicStyle(topic: string | null | undefined) {
  return (topic && TOPIC_STYLE[topic]) || DEFAULT_TOPIC_STYLE;
}

const compact = new Intl.NumberFormat("es-ES", { notation: "compact", maximumFractionDigits: 1 });

/** "1 miembro", "152 miembros", "1,2 mil miembros" */
export function membersText(n: number): string {
  return `${n >= 10000 ? compact.format(n) : n.toLocaleString("es-ES")} ${n === 1 ? "miembro" : "miembros"}`;
}

/** "152 miembros · 4 publicaciones a la semana" */
export function groupStats(members: number, postsWeek: number): string {
  const parts = [membersText(members)];
  if (postsWeek > 0) parts.push(`${postsWeek} ${postsWeek === 1 ? "publicación" : "publicaciones"} a la semana`);
  return parts.join(" · ");
}

export const PRIVACY = {
  public: { label: "Grupo público", short: "Público", text: "Cualquier persona puede ver quién está en el grupo y lo que se publica." },
  private: { label: "Grupo privado", short: "Privado", text: "Solo los miembros ven quién está en el grupo y lo que se publica." },
} as const;

/** Online o provincia */
export const ONLINE = "Online · toda España";
