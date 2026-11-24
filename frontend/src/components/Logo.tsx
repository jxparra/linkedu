import Link from "next/link";
import { BrandMark } from "./app/Spine";

/** Logotipo: «lu» subrayado con fosforito y el nombre en minúsculas, en la letra de los títulos. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Linkedu, página principal" className={`inline-flex items-center gap-0.5 text-ink ${className}`}>
      <BrandMark />
      <span className="font-display text-[22px] font-bold tracking-tight">linkedu</span>
    </Link>
  );
}
