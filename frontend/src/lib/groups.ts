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
  programacion: { icon: Code2, from: "#14213D", to: "#005CC6" },
  tecnologia: { icon: Cpu, from: "#0B2552", to: "#1C5FB8" },
  diseno: { icon: Palette, from: "#5B3D8F", to: "#8E6BC9" },
  salud: { icon: HeartPulse, from: "#0B6B6B", to: "#1F9A93" },
  psicologia: { icon: Brain, from: "#3C2A78", to: "#7E62B8" },
  derecho: { icon: Scale, from: "#334155", to: "#64748B" },
  empresa: { icon: TrendingUp, from: "#7A3A00", to: "#C26A12" },
  ciencia: { icon: FlaskConical, from: "#0E7490", to: "#199CB0" },
  quedadas: { icon: PartyPopper, from: "#B85A00", to: "#D9770F" },
  deportes: { icon: Dumbbell, from: "#0B5C5E", to: "#2A9D8F" },
  musica: { icon: Music, from: "#3C2A78", to: "#6E5BC4" },
  videojuegos: { icon: Gamepad2, from: "#14213D", to: "#4F5D75" },
  cine: { icon: Clapperboard, from: "#0B2552", to: "#4F5D75" },
  viajes: { icon: Plane, from: "#0050AD", to: "#2D8BE0" },
  pisos: { icon: House, from: "#8A4300", to: "#C76A0E" },
  idiomas: { icon: Languages, from: "#0F766E", to: "#229F8F" },
  estudio: { icon: Library, from: "#0F766E", to: "#259F93" },
  empleo: { icon: Briefcase, from: "#7A3A00", to: "#B85A00" },
  voluntariado: { icon: HandHeart, from: "#9A4A00", to: "#C97B1A" },
  fotografia: { icon: Camera, from: "#374151", to: "#898F9A" },
  cocina: { icon: ChefHat, from: "#8A4300", to: "#C97B1A" },
  lectura: { icon: BookOpen, from: "#0B6B6B", to: "#229F8F" },
  arte: { icon: Brush, from: "#5B3D8F", to: "#9B6BC9" },
  // Foros (comunidades de estudios, de centros y generales): no tienen temática
  "foro-degree": { icon: GraduationCap, from: "#0B5C5E", to: "#0E8A86" },
  "foro-school": { icon: School, from: "#0B2552", to: "#1C5FB8" },
  "foro-general": { icon: MessagesSquare, from: "#14213D", to: "#0E7778" },
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

export const DEFAULT_TOPIC_STYLE = { icon: Users, from: "#0B2552", to: "#1C5FB8" };

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
