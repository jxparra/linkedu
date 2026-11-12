import type { ReactNode } from "react";
import { Logo } from "./Logo";

export function AuthCard({ title, children, footer }: { title: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <Logo />
      </div>
      <div className="mx-auto mt-10 w-full max-w-[440px]">
        <h1 className="mb-6 text-center text-[28px] font-semibold leading-tight">{title}</h1>
        <div className="rounded-card border border-line bg-white p-6 sm:p-8">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-ink-muted">{footer}</div>}
      </div>
    </main>
  );
}
