import Link from "next/link";

export function LegalNote() {
  return (
    <p className="text-center text-[13px] leading-relaxed text-ink-muted">
      Al continuar, aceptas las{" "}
      <Link href="#" className="underline hover:text-ink">Condiciones de uso</Link>, la{" "}
      <Link href="#" className="underline hover:text-ink">Política de privacidad</Link> y la{" "}
      <Link href="#" className="underline hover:text-ink">Política de cookies</Link> de Linkedu.
    </p>
  );
}
