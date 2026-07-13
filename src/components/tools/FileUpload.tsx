"use client";

import { useCallback, useRef, useState } from "react";
import type { DragEvent } from "react";
import { ChevronDown, ChevronUp, FileIcon, UploadCloud, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/cn";

export interface FileUploadProps {
  accept?: string[];
  multiple?: boolean;
  maxFiles?: number;
  files: File[];
  onFilesChange: (files: File[]) => void;
  uploading?: boolean;
  uploadProgress?: number;
}

export function FileUpload({
  accept,
  multiple = false,
  maxFiles,
  files,
  onFilesChange,
  uploading = false,
  uploadProgress = 0,
}: FileUploadProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limit = maxFiles ?? (multiple ? Infinity : 1);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const incomingArray = Array.from(incoming);
      const valid = incomingArray.filter((file) => {
        if (!accept || accept.length === 0) return true;
        return accept.includes(file.type);
      });

      setError(valid.length < incomingArray.length ? t.errors.invalidFileType : null);

      const combined = multiple ? [...files, ...valid] : valid.slice(0, 1);
      onFilesChange(combined.slice(0, limit));
    },
    [accept, files, limit, multiple, onFilesChange, t.errors.invalidFileType]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      if (uploading) return;
      if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
    },
    [addFiles, uploading]
  );

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= files.length) return;
    const next = [...files];
    [next[index], next[target]] = [next[target], next[index]];
    onFilesChange(next);
  };

  const canAddMore = multiple && files.length < limit;

  return (
    <div className="flex flex-col gap-4">
      {(files.length === 0 || canAddMore) && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!uploading) setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors",
            dragActive
              ? "border-indigo-500 bg-indigo-500/5"
              : "border-[var(--color-border)] hover:border-indigo-400/60 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          <UploadCloud className="h-8 w-8 text-indigo-500" />
          <p className="text-sm font-medium text-[var(--color-foreground)]">{t.upload.dragDrop}</p>
          <p className="text-xs text-[var(--color-muted)]">{t.upload.orClick}</p>
          <input
            ref={inputRef}
            type="file"
            multiple={multiple}
            accept={accept?.join(",")}
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            {t.upload.selectedFiles}
          </p>
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5"
            >
              <FileIcon className="h-4 w-4 shrink-0 text-indigo-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--color-foreground)]">{file.name}</p>
                <p className="text-xs text-[var(--color-muted)]">{formatBytes(file.size)}</p>
              </div>
              {!uploading && multiple && files.length > 1 && (
                <div className="flex shrink-0 flex-col">
                  <button
                    type="button"
                    onClick={() => moveFile(index, -1)}
                    disabled={index === 0}
                    aria-label="up"
                    className="rounded p-0.5 text-[var(--color-muted)] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFile(index, 1)}
                    disabled={index === files.length - 1}
                    aria-label="down"
                    className="rounded p-0.5 text-[var(--color-muted)] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {!uploading && (
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  aria-label={t.upload.removeFile}
                  className="shrink-0 rounded-lg p-1.5 text-[var(--color-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="flex flex-col gap-1.5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-[var(--color-muted)]">{t.upload.uploading}</p>
        </div>
      )}
    </div>
  );
}
