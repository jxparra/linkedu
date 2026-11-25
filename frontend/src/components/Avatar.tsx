const sizes = { xs: "h-6 w-6 text-[9px]", sm: "h-9 w-9 text-xs", md: "h-12 w-12 text-sm", lg: "h-16 w-16 text-lg", xl: "h-24 w-24 text-2xl" };

/**
 * Cada tipo de cuenta tiene su forma y su color, para saber quién es quién de un vistazo (ADR-017):
 * estudiante, redondo en azul; empresa, cuadrado en naranja; docente, hexágono en violeta tinta.
 * La forma se mantiene también con foto, así se distingue sin depender del color.
 */
const KINDS = {
  student: { shape: "rounded-full", initials: "bg-brand-50 text-brand-700" },
  company: { shape: "rounded-[10px]", initials: "bg-empleo-50 text-empleo-ink" },
  teacher: { shape: "avatar-hex", initials: "bg-docente-50 text-docente-ink" },
} as const;

export function avatarKind(role?: string | null, square = false): keyof typeof KINDS {
  if (square || role === "company") return "company";
  return role === "teacher" ? "teacher" : "student";
}

export function Avatar({
  name,
  src,
  size = "md",
  square = false,
  role,
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof sizes;
  /** Forzar la forma de empresa (logos de las ofertas, donde no llega el rol) */
  square?: boolean;
  /** Tipo de cuenta: "student" | "company" | "teacher" */
  role?: string | null;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  const kind = KINDS[avatarKind(role, square)];
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={`${sizes[size]} ${kind.shape} shrink-0 object-cover`} />;
  }
  return (
    <span aria-hidden className={`${sizes[size]} ${kind.shape} ${kind.initials} flex shrink-0 items-center justify-center font-semibold`}>
      {initials || "?"}
    </span>
  );
}

/**
 * Cartel junto al nombre con el tipo de cuenta: «Estudiante», «Empresa» o «Docente», cada uno en su color.
 * Con `detail` se añade un dato más en el mismo cartel («Estudiante · 2º curso»).
 */
export function RoleTag({ role, detail, className = "" }: { role?: string | null; detail?: string | null; className?: string }) {
  if (!role || role === "admin") return null; // cuentas sin tipo todavía (registro a medias) o internas
  const kind = avatarKind(role);
  const tag = {
    student: ["Estudiante", "bg-brand-50 text-brand-700"],
    company: ["Empresa", "bg-empleo-50 text-empleo-ink"],
    teacher: ["Docente", "bg-docente-50 text-docente-ink"],
  }[kind];
  return (
    <span className={`inline-flex shrink-0 items-center rounded-tag px-1.5 py-px text-[12px] font-semibold leading-[18px] ${tag[1]} ${className}`}>
      {tag[0]}
      {detail && <span className="ml-1 font-medium">· {detail}</span>}
    </span>
  );
}
