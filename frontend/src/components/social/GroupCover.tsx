import { mediaUrl } from "@/lib/api";
import { topicStyle } from "@/lib/groups";

/**
 * Portada de un grupo. Si no tiene foto, se dibuja un degradado con el icono de su temática
 * (así ningún grupo queda con un hueco gris).
 */
export function GroupCover({
  src,
  topic,
  className = "",
  iconSize = "md",
}: {
  src: string | null | undefined;
  topic: string | null | undefined;
  className?: string;
  /** `tile`: cuadrado de la cabecera del grupo (el icono solo, sin adornos ni círculo) */
  iconSize?: "sm" | "md" | "lg" | "tile";
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={mediaUrl(src)} alt="" className={`object-cover ${className}`} />;
  }
  const { icon: Icon, from, to } = topicStyle(topic);
  if (iconSize === "tile") {
    return (
      <div aria-hidden className={`flex items-center justify-center ${className}`} style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
        <Icon className="h-1/2 w-1/2 text-white" strokeWidth={1.75} />
      </div>
    );
  }
  const big = { sm: "h-5 w-5", md: "h-14 w-14", lg: "h-20 w-20" }[iconSize];
  const ring = { sm: "h-9 w-9", md: "h-24 w-24", lg: "h-32 w-32" }[iconSize];
  return (
    <div aria-hidden className={`relative overflow-hidden ${className}`} style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
      {iconSize !== "sm" && (
        <>
          <Icon className="absolute -left-4 top-3 h-24 w-24 rotate-[-14deg] text-white/10" strokeWidth={1.5} />
          <Icon className="absolute -bottom-6 right-6 h-28 w-28 rotate-[12deg] text-white/10" strokeWidth={1.5} />
          <Icon className="absolute right-[38%] top-2 h-10 w-10 rotate-[20deg] text-white/10" strokeWidth={1.5} />
        </>
      )}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className={`flex ${ring} items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur-sm`}>
          <Icon className={`${big} text-white`} strokeWidth={1.75} />
        </span>
      </span>
    </div>
  );
}
