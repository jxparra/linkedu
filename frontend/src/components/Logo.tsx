import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`text-xl font-extrabold tracking-wide text-ink ${className}`}>
      STUDY<span className="text-brand-700">HUB</span>
    </Link>
  );
}
