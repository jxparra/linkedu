const sizes = { xs: "h-6 w-6 text-[9px]", sm: "h-9 w-9 text-xs", md: "h-12 w-12 text-sm", lg: "h-16 w-16 text-lg", xl: "h-24 w-24 text-2xl" };

export function Avatar({
  name,
  src,
  size = "md",
  square = false,
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof sizes;
  square?: boolean;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  const shape = square ? "rounded-[10px]" : "rounded-full";
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={`${sizes[size]} ${shape} shrink-0 object-cover`} />;
  }
  return (
    <span
      aria-hidden
      className={`${sizes[size]} ${shape} flex shrink-0 items-center justify-center font-semibold ${
        square ? "bg-ink text-inverse" : "bg-brand-50 text-brand-700"
      }`}
    >
      {initials || "?"}
    </span>
  );
}
