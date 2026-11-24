"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { Button } from "./Button";
import { Logo } from "./Logo";

type Props = {
  progress: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSubmit: () => void;
  submitLabel?: string;
  loading?: boolean;
  back?: boolean;
  skip?: () => void;
};

export function OnboardingShell({
  progress,
  title,
  subtitle,
  children,
  onSubmit,
  submitLabel = "Continuar",
  loading,
  back = true,
  skip,
}: Props) {
  const router = useRouter();
  const handle = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <main className="min-h-screen bg-card px-4 py-6">
      <div className="mx-auto w-full max-w-[480px]">
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso del registro"
        >
          <div className="h-full rounded-full bg-brand-600 transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Logo className="text-base" />
          {skip && (
            <button type="button" onClick={skip} className="min-h-11 px-2 text-sm font-medium text-ink-muted hover:text-ink">
              Omitir por ahora
            </button>
          )}
        </div>

        <form onSubmit={handle} className="mt-10" noValidate>
          <h1 className="text-[28px] font-semibold leading-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-[15px] text-ink-muted">{subtitle}</p>}
          <div className="mt-8 space-y-5">{children}</div>
          <div className="mt-10 flex items-center justify-between gap-4">
            {back ? (
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" aria-hidden /> Atrás
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" loading={loading}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
