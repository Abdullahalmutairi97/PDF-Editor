"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useFileProcessor } from "@/lib/useFileProcessor";
import { FileUpload } from "@/components/tools/FileUpload";
import { ProcessingStatus } from "@/components/tools/ProcessingStatus";
import { DownloadResult } from "@/components/tools/DownloadResult";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import type { ToolDefinition } from "@/types/tools";

const PIXEL_PRESETS = [
  { label: "1920×1080", width: 1920, height: 1080 },
  { label: "1280×720", width: 1280, height: 720 },
  { label: "800×600", width: 800, height: 600 },
];

const PERCENT_PRESETS = [50, 25];

export function ResizeImage({ tool }: { tool: ToolDefinition }) {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [percentageMode, setPercentageMode] = useState(false);
  const [percentage, setPercentage] = useState(100);
  const [format, setFormat] = useState<"original" | "jpeg" | "png" | "webp">("original");
  const [sourceDims, setSourceDims] = useState<{ width: number; height: number } | null>(null);
  const { stage, uploadProgress, error, resultFiles, run, reset } = useFileProcessor(tool.id);

  useEffect(() => {
    if (files.length === 0) {
      setSourceDims(null);
      return;
    }
    const url = URL.createObjectURL(files[0]);
    const img = new Image();
    img.onload = () => setSourceDims({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [files]);

  const options = percentageMode
    ? { percentage, format }
    : {
        width: width ? Number(width) : undefined,
        height: height ? Number(height) : undefined,
        maintainAspect,
        format,
      };

  const handleReset = () => {
    reset();
    setFiles([]);
  };

  if (stage === "processing") return <ProcessingStatus stage="processing" />;
  if (stage === "error")
    return <ProcessingStatus stage="error" errorMessage={error ?? undefined} onRetry={() => run(files, options)} />;
  if (stage === "done") return <DownloadResult files={resultFiles} onReset={handleReset} />;

  const uploading = stage === "uploading";
  const canSubmit =
    files.length > 0 && (percentageMode ? percentage > 0 : width.trim().length > 0 || height.trim().length > 0);

  let estimated: { width: number; height: number } | null = null;
  if (sourceDims) {
    if (percentageMode) {
      estimated = {
        width: Math.round((sourceDims.width * percentage) / 100),
        height: Math.round((sourceDims.height * percentage) / 100),
      };
    } else {
      const w = width ? Number(width) : undefined;
      const h = height ? Number(height) : undefined;
      if (w && h && !maintainAspect) {
        estimated = { width: w, height: h };
      } else if (w) {
        estimated = { width: w, height: Math.round((w * sourceDims.height) / sourceDims.width) };
      } else if (h) {
        estimated = { width: Math.round((h * sourceDims.width) / sourceDims.height), height: h };
      }
    }
  }

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

      <div className="flex flex-wrap gap-2">
        {PIXEL_PRESETS.map((preset) => (
          <Button
            key={preset.label}
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setPercentageMode(false);
              setWidth(String(preset.width));
              setHeight(String(preset.height));
            }}
          >
            {preset.label}
          </Button>
        ))}
        {PERCENT_PRESETS.map((value) => (
          <Button
            key={value}
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setPercentageMode(true);
              setPercentage(value);
            }}
          >
            {value}%
          </Button>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            setPercentageMode(true);
            setPercentage(100);
          }}
        >
          {t.toolLabels.original}
        </Button>
      </div>

      <Switch checked={percentageMode} onChange={setPercentageMode} label={t.toolLabels.percentageMode} />

      {percentageMode ? (
        <Input
          label={t.toolLabels.percentage}
          type="number"
          min={1}
          max={500}
          value={percentage}
          onChange={(e) => setPercentage(Number(e.target.value))}
          className="max-w-[10rem]"
        />
      ) : (
        <>
          <div className="grid max-w-sm grid-cols-2 gap-4">
            <Input
              label={t.toolLabels.width}
              type="number"
              min={1}
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
            <Input
              label={t.toolLabels.height}
              type="number"
              min={1}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
          <Switch checked={maintainAspect} onChange={setMaintainAspect} label={t.toolLabels.maintainAspectRatio} />
        </>
      )}

      {estimated && (
        <p className="text-sm text-[var(--color-muted)]">
          {t.toolLabels.estimatedDimensions}: {estimated.width}×{estimated.height}
        </p>
      )}

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
        className="max-w-xs"
      />

      <Button disabled={uploading || !canSubmit} onClick={() => run(files, options)} className="self-start">
        {uploading ? <Spinner className="h-4 w-4" /> : t.actions.submit}
      </Button>
    </div>
  );
}
