"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useFileProcessor } from "@/lib/useFileProcessor";
import { FileUpload } from "@/components/tools/FileUpload";
import { ProcessingStatus } from "@/components/tools/ProcessingStatus";
import { DownloadResult } from "@/components/tools/DownloadResult";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Slider } from "@/components/ui/Slider";
import { Select } from "@/components/ui/Select";
import { formatBytes } from "@/lib/format";
import type { ToolDefinition } from "@/types/tools";

export function CompressImage({ tool }: { tool: ToolDefinition }) {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<"original" | "jpeg" | "png" | "webp">("original");
  const { stage, uploadProgress, error, resultFiles, run, reset } = useFileProcessor(tool.id);

  const options = { quality, format };
  const originalTotalSize = files.reduce((sum, file) => sum + file.size, 0);

  const handleReset = () => {
    reset();
    setFiles([]);
  };

  if (stage === "processing") return <ProcessingStatus stage="processing" />;
  if (stage === "error")
    return (
      <ProcessingStatus stage="error" errorMessage={error ?? undefined} onRetry={() => run(files, options)} />
    );
  if (stage === "done") {
    const newTotalSize = resultFiles.reduce((sum, file) => sum + file.size, 0);
    return (
      <div className="flex flex-col gap-4">
        <div className="mx-auto flex w-full max-w-sm items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm">
          <span className="text-[var(--color-muted)]">
            {t.toolLabels.originalSize}: {formatBytes(originalTotalSize)}
          </span>
          <span className="font-medium text-[var(--color-foreground)]">
            {t.toolLabels.newSize}: {formatBytes(newTotalSize)}
          </span>
        </div>
        <DownloadResult files={resultFiles} onReset={handleReset} />
      </div>
    );
  }

  const uploading = stage === "uploading";

  return (
    <div className="flex flex-col gap-6">
      <FileUpload
        accept={tool.acceptedMimeTypes}
        multiple={true}
        files={files}
        onFilesChange={setFiles}
        uploading={uploading}
        uploadProgress={uploadProgress}
      />

      <div className="grid max-w-xl gap-4 sm:grid-cols-2">
        <Slider
          label={t.toolLabels.quality}
          valueLabel={`${quality}%`}
          min={1}
          max={100}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
        />
        <Select
          label={t.toolLabels.outputFormat}
          value={format}
          onChange={(e) => setFormat(e.target.value as typeof format)}
          options={[
            { value: "original", label: t.toolLabels.keepOriginal },
            { value: "jpeg", label: "JPEG" },
            { value: "png", label: "PNG" },
            { value: "webp", label: "WebP" },
          ]}
        />
      </div>

      {files.length > 0 && (
        <p className="text-sm text-[var(--color-muted)]">
          {t.toolLabels.estimatedSize}: ~{formatBytes(originalTotalSize * (quality / 100))}
        </p>
      )}

      <Button
        disabled={uploading || files.length === 0}
        onClick={() => run(files, options)}
        className="self-start"
      >
        {uploading ? <Spinner className="h-4 w-4" /> : t.actions.submit}
      </Button>
    </div>
  );
}
