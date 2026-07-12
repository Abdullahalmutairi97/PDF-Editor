"use client";

import { cn } from "@/lib/cn";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
}

export function Switch({ checked, onChange, label, id }: SwitchProps) {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer select-none">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-indigo-500" : "bg-[var(--color-border)]"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 rtl:right-0.5 ltr:left-0.5",
            checked ? "rtl:-translate-x-5 ltr:translate-x-5" : "translate-x-0"
          )}
        />
      </button>
      {label && <span className="text-sm text-[var(--color-foreground)]">{label}</span>}
    </label>
  );
}
