import { Check } from "lucide-react";
import type { ReactNode } from "react";

export function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600/40 ${
          checked ? "border-brand-600 bg-brand-600 text-on-brand" : "border-ink-subtle bg-card"
        }`}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />}
      </span>
      {children}
    </label>
  );
}
