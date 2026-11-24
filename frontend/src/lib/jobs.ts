import type { Author } from "./api";

export type JobCompany = {
  id: number;
  name: string;
  logo_url: string | null;
  verified: boolean;
  sector: string | null;
  location: string | null;
  website: string | null;
};

export type ApplicationStatus = "enviada" | "vista" | "en_proceso" | "aceptada" | "rechazada";

export type JobCard = {
  id: number;
  title: string;
  company: JobCompany;
  type: string;
  category: string | null;
  schedule: string | null;
  modality: string | null;
  location: string | null;
  province: string | null;
  pay: number | null;
  pay_period: string | null;
  deadline: string | null;
  status: "abierta" | "cerrada";
  created_at: string;
  applicants: number;
  my_status: ApplicationStatus | null;
  matches_studies: boolean;
  /** Resumen de la descripción para la tarjeta de la lista (unos 150 caracteres) */
  summary?: string | null;
};

export type Job = JobCard & {
  description: string;
  requirements: string | null;
  vacancies: number;
  degree: { id: number; name: string } | null;
  is_mine: boolean;
  my_message: string | null;
  applied_at: string | null;
};

export type JobList = {
  items: JobCard[];
  total: number;
  page: number;
  pages: number;
  facets: Record<string, Record<string, number>>;
};

export type Applicant = { id: number; student: Author; message: string | null; status: ApplicationStatus; created_at: string };
export type MyApplication = { id: number; job: JobCard; status: ApplicationStatus; created_at: string; updated_at: string };

export const ALL_SPAIN = "Toda España";
export const ABROAD = "Extranjero";

/** Las que salen arriba del desplegable, como en el boceto. */
export const COMMON_PROVINCES = ["Madrid", "Granada", "Sevilla", "Almería", "Valencia"];

export const PROVINCES = [
  "A Coruña", "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", "Baleares", "Barcelona",
  "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ceuta", "Ciudad Real", "Córdoba", "Cuenca", "Girona",
  "Granada", "Guadalajara", "Gipuzkoa", "Huelva", "Huesca", "Jaén", "La Rioja", "Las Palmas", "León", "Lleida",
  "Lugo", "Madrid", "Málaga", "Melilla", "Murcia", "Navarra", "Ourense", "Palencia", "Pontevedra", "Salamanca",
  "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid",
  "Bizkaia", "Zamora", "Zaragoza",
].sort((a, b) => a.localeCompare(b, "es"));

export const JOB_TYPES: Record<string, string> = {
  puntual: "Trabajo puntual",
  practicas: "Prácticas",
  temporal: "Temporal",
  indefinido: "Indefinido",
  freelance: "Freelance",
};

export const SCHEDULES: Record<string, string> = {
  completa: "Jornada completa",
  parcial: "Media jornada",
  flexible: "Horario flexible",
  fines_semana: "Fines de semana",
};

export const MODALITIES: Record<string, string> = {
  presencial: "Presencial",
  hibrido: "Híbrido",
  remoto: "En remoto",
};

/** Las categorías de InfoJobs, en el mismo orden. */
export const CATEGORIES = [
  "Administración de empresas",
  "Administración Pública",
  "Atención a clientes",
  "Calidad, producción e I+D",
  "Comercial y ventas",
  "Compras, logística y almacén",
  "Diseño y artes gráficas",
  "Educación y formación",
  "Finanzas y banca",
  "Informática y telecomunicaciones",
  "Ingenieros y técnicos",
  "Inmobiliario y construcción",
  "Legal",
  "Marketing y comunicación",
  "Otros",
  "Profesiones, artes y oficios",
  "Recursos humanos",
  "Sanidad y salud",
  "Sector Farmacéutico",
  "Turismo y restauración",
  "Venta al detalle",
];

export const POSTED: Record<string, string> = {
  "1": "Últimas 24 horas",
  "7": "Últimos 7 días",
  "15": "Últimos 15 días",
};

export const SORTS: Record<string, string> = {
  relevance: "Relevancia",
  recent: "Más recientes",
  pay: "Mejor pagadas",
};

/** Estados de una candidatura, con los nombres que usa InfoJobs. */
export const APPLICATION_STATUS: Record<ApplicationStatus, { label: string; cls: string }> = {
  enviada: { label: "Inscrito", cls: "bg-brand-50 text-brand-700" },
  vista: { label: "CV leído", cls: "bg-brand-50 text-brand-700" },
  en_proceso: { label: "En proceso", cls: "bg-accent-50 text-accent-800" },
  aceptada: { label: "Seleccionado", cls: "bg-green-50 text-success" },
  rechazada: { label: "Descartado", cls: "bg-page text-ink-muted" },
};

/** Pasos que se muestran al estudiante para seguir su candidatura. */
export const APPLICATION_STEPS: ApplicationStatus[] = ["enviada", "vista", "en_proceso", "aceptada"];

const euros = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 });

export function formatPay(pay: number | null, period: string | null): string | null {
  if (pay === null) return null;
  const amount = `${euros.format(pay)} €`;
  if (period === "hora") return `${amount}/hora`;
  if (period === "mes") return `${amount}/mes`;
  if (period === "total") return `${amount} en total`;
  return amount;
}

export function formatPlace(job: Pick<JobCard, "location" | "province" | "modality">): string {
  if (job.modality === "remoto") return job.province && job.province !== ABROAD ? `En remoto · ${job.province}` : "En remoto";
  if (job.province === ABROAD) return job.location ? `${job.location} (extranjero)` : "Extranjero";
  if (job.location && job.location !== job.province) return `${job.location}, ${job.province}`;
  return job.location ?? job.province ?? "España";
}

/** Publicada hace menos de 24 horas. */
export function isNew(iso: string): boolean {
  const date = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
  return Date.now() - date.getTime() < 24 * 3600 * 1000;
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long" });
}
