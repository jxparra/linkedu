import Image from "next/image";
import Link from "next/link";

/** Logotipo completo (eslabones + «LinkeDu»). Dos versiones: azul del logo en claro y azul aclarado en oscuro. */
export function Logo({ className = "", height = 30, onDark = false }: { className?: string; height?: number; onDark?: boolean }) {
  const width = Math.round((height * 1367) / 240);
  return (
    <Link href="/" aria-label="Linkedu, página principal" className={`inline-flex items-center ${className}`}>
      {onDark ? (
        <Image src="/logo-dark.png" alt="" width={width} height={height} priority />
      ) : (
        <>
          <Image src="/logo.png" alt="" width={width} height={height} priority className="logo-light" />
          <Image src="/logo-dark.png" alt="" width={width} height={height} priority className="logo-dark" />
        </>
      )}
    </Link>
  );
}
