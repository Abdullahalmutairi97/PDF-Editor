"use client";

import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";

export interface ProcessingStatusProps {
  stage: "processing" | "error";
  errorMessage?: string;
  onRetry?: () => void;
}

export function ProcessingStatus({ stage, errorMessage, onRetry }: ProcessingStatusProps) {
  const { t } = useLanguage();

  if (stage === "error") {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <AlertCircle className="h-7 w-7" />
        </span>
        <div>
          <h3 className="font-semibold text-[var(--color-foreground)]">{t.processing.error}</h3>
          {errorMessage && <p className="mt-1 text-sm text-[var(--color-muted)]">{errorMessage}</p>}
        </div>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            {t.processing.tryAgain}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center animate-fade-in-up">
      <Spinner className="h-10 w-10 text-indigo-500" />
      <div>
        <h3 className="font-semibold text-[var(--color-foreground)]">{t.processing.title}</h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{t.processing.subtitle}</p>
      </div>
    </div>
  );
}
