"use client";

import { CheckCircle2, Download } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { formatBytes } from "@/lib/format";
import type { ProcessResultFile } from "@/types/tools";

export interface DownloadResultProps {
  files: ProcessResultFile[];
  onReset: () => void;
}

const linkButtonClass =
  "inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm shadow-indigo-500/25 hover:brightness-105 active:brightness-95 transition-all";

export function DownloadResult({ files, onReset }: DownloadResultProps) {
  const { t } = useLanguage();

  const downloadAll = () => {
    files.forEach((file, index) => {
      window.setTimeout(() => {
        const link = document.createElement("a");
        link.href = file.downloadUrl;
        link.download = file.filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }, index * 300);
    });
  };

  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-500">
        <CheckCircle2 className="h-7 w-7" />
      </span>
      <div>
        <h3 className="font-semibold text-[var(--color-foreground)]">{t.result.title}</h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{t.result.subtitle}</p>
      </div>

      {files.length === 1 ? (
        <a href={files[0].downloadUrl} download={files[0].filename} className={linkButtonClass}>
          <Download className="h-4 w-4" />
          {t.result.download}
        </a>
      ) : (
        <div className="flex w-full max-w-sm flex-col gap-2">
          <button type="button" onClick={downloadAll} className={linkButtonClass}>
            <Download className="h-4 w-4" />
            {t.result.downloadAll}
          </button>
          {files.map((file) => (
            <a
              key={file.fileId}
              href={file.downloadUrl}
              download={file.filename}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-start hover:border-indigo-400/60 transition-colors"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-[var(--color-foreground)]">
                  {file.filename}
                </span>
                <span className="block text-xs text-[var(--color-muted)]">{formatBytes(file.size)}</span>
              </span>
              <Download className="h-4 w-4 shrink-0 text-indigo-500" />
            </a>
          ))}
        </div>
      )}

      <p className="text-xs text-[var(--color-muted)]">{t.result.expiryNotice}</p>

      <Button variant="secondary" onClick={onReset}>
        {t.result.processAnother}
      </Button>
    </div>
  );
}
