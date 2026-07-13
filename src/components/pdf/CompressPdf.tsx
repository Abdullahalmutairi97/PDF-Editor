"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useFileProcessor } from "@/lib/useFileProcessor";
import { FileUpload } from "@/components/tools/FileUpload";
import { ProcessingStatus } from "@/components/tools/ProcessingStatus";
import { DownloadResult } from "@/components/tools/DownloadResult";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Select } from "@/components/ui/Select";
import { Slider } from "@/components/ui/Slider";
import { formatBytes } from "@/lib/format";
import type { ToolDefinition } from "@/types/tools";

const ESTIMATED_REDUCTION_PERCENT: Record<"low" | "medium" | "high", number> = {
  low: 70,
  medium: 50,
  high: 30,
};

export function CompressPdf({ tool }: { tool: ToolDefinition }) {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");
  const [grayscale, setGrayscale] = useState(false);
  const [dpi, setDpi] = useState("150");
  const [imageQuality, setImageQuality] = useState(80);
  const { stage, uploadProgress, error, resultFiles, run, reset } = useFileProcessor(tool.id);

  const options = { quality, grayscale, dpi: Number(dpi), imageQuality };

  const handleReset = () => {
    reset();
    setFiles([]);
  };

  if (stage === "processing") return <ProcessingStatus stage="processing" />;
  if (stage === "error")
    return (
      <ProcessingStatus stage="error" errorMessage={error ?? undefined} onRetry={() => run(files, options)} />
    );
  if (stage === "done") return <DownloadResult files={resultFiles} onReset={handleReset} />;

  const uploading = stage === "uploading";

  return (
    <div className="flex flex-col gap-6">
      <FileUpload
        accept={tool.acceptedMimeTypes}
        multiple={false}
        files={files}
        onFilesChange={setFiles}
        uploading={uploading}
        uploadProgress={uploadProgress}
      />

      {files.length > 0 && (
        <div className="flex flex-col gap-1 text-sm text-[var(--color-muted)]">
          <span>
            {t.toolLabels.originalSize}: {formatBytes(files[0].size)}
          </span>
          <span>
            {t.toolLabels.estimatedReduction}: ~{ESTIMATED_REDUCTION_PERCENT[quality]}%
          </span>
        </div>
      )}

      <div className="grid max-w-xl gap-4 sm:grid-cols-2">
        <Select
          label={t.toolLabels.compressionLevel}
          value={quality}
          onChange={(e) => setQuality(e.target.value as "low" | "medium" | "high")}
          options={[
            { value: "low", label: t.toolLabels.low },
            { value: "medium", label: t.toolLabels.medium },
            { value: "high", label: t.toolLabels.high },
          ]}
        />

        <Select
          label={t.toolLabels.colorMode}
          value={grayscale ? "grayscale" : "color"}
          onChange={(e) => setGrayscale(e.target.value === "grayscale")}
          options={[
            { value: "color", label: t.toolLabels.color },
            { value: "grayscale", label: t.toolLabels.grayscale },
          ]}
        />

        <Select
          label={t.toolLabels.imageDpi}
          value={dpi}
          onChange={(e) => setDpi(e.target.value)}
          options={[
            { value: "72", label: "72" },
            { value: "150", label: "150" },
            { value: "300", label: "300" },
          ]}
        />
      </div>

      <Slider
        label={t.toolLabels.imageQuality}
        valueLabel={`${imageQuality}%`}
        min={1}
        max={100}
        value={imageQuality}
        onChange={(e) => setImageQuality(Number(e.target.value))}
        className="max-w-xl"
      />

      <Button disabled={uploading || files.length === 0} onClick={() => run(files, options)} className="self-start">
        {uploading ? <Spinner className="h-4 w-4" /> : t.actions.submit}
      </Button>
    </div>
  );
}
