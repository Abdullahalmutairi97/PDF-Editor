"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  valueLabel?: string;
}

export function Slider({ label, valueLabel, className, id, ...props }: SliderProps) {
  return (
    <div className="w-full">
      {(label || valueLabel) && (
        <div className="mb-2 flex items-center justify-between text-sm">
          {label && (
            <label htmlFor={id} className="font-medium text-[var(--color-foreground)]">
              {label}
            </label>
          )}
          {valueLabel && <span className="text-[var(--color-muted)]">{valueLabel}</span>}
        </div>
      )}
      <input
        id={id}
        type="range"
        className={cn(
          "w-full h-2 rounded-full appearance-none cursor-pointer bg-[var(--color-border)] accent-indigo-500",
          className
        )}
        {...props}
      />
    </div>
  );
}
