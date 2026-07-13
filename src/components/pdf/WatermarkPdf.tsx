"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { uploadFiles, useProcessOnly } from "@/lib/useFileProcessor";
import { FileUpload } from "@/components/tools/FileUpload";
import { ProcessingStatus } from "@/components/tools/ProcessingStatus";
import { DownloadResult } from "@/components/tools/DownloadResult";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import { PdfPagePreview, type PdfPreviewItem } from "@/components/pdf/PdfPagePreview";
import type { ToolDefinition } from "@/types/tools";

type WatermarkPosition =
  | "center"
  | "diagonal"
  | "tile"
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export function WatermarkPdf({ tool }: { tool: ToolDefinition }) {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [fileId, setFileId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(36);
  const [color, setColor] = useState("#ff0000");
  const [opacity, setOpacity] = useState(50);
  const [rotation, setRotation] = useState(45);
  const [position, setPosition] = useState<WatermarkPosition>("diagonal");
  const [applyToSelected, setApplyToSelected] = useState(false);

  const [items, setItems] = useState<PdfPreviewItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { stage, error, resultFiles, run, reset } = useProcessOnly(tool.id);

  const positionOptions: { value: WatermarkPosition; label: string }[] = [
    { value: "center", label: t.pdf.watermark.positions.center },
    { value: "diagonal", label: t.pdf.watermark.positions.diagonal },
    { value: "tile", label: t.pdf.watermark.positions.tile },
    { value: "top-left", label: t.pdf.watermark.positions.topLeft },
    { value: "top-center", label: t.pdf.watermark.positions.topCenter },
    { value: "top-right", label: t.pdf.watermark.positions.topRight },
    { value: "bottom-left", label: t.pdf.watermark.positions.bottomLeft },
    { value: "bottom-center", label: t.pdf.watermark.positions.bottomCenter },
    { value: "bottom-right", label: t.pdf.watermark.positions.bottomRight },
  ];

  const handleFilesChange = async (next: File[]) => {
    setFiles(next);
    if (next.length !== 1) return;
    setUploading(true);
    setUploadError(null);
    try {
      const [id] = await uploadFiles(next);
      setFileId(id);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    reset();
    setFiles([]);
    setFileId(null);
    setItems([]);
    setSelectedIds(new Set());
  };

  const handleApply = () => {
    if (!fileId || !text.trim()) return;
    const pages =
      applyToSelected && items.length > 0
        ? items.filter((it) => selectedIds.has(it.id)).map((it) => it.pageNum)
        : "all";
    run([fileId], { text, fontSize, color, opacity, rotation, position, pages });
  };

  if (stage === "processing") return <ProcessingStatus stage="processing" />;
  if (stage === "error")
    return <ProcessingStatus stage="error" errorMessage={error ?? undefined} onRetry={handleApply} />;
  if (stage === "done") return <DownloadResult files={resultFiles} onReset={handleReset} />;

  if (!fileId) {
    return (
      <div className="flex flex-col gap-6">
        <FileUpload
          accept={tool.acceptedMimeTypes}
          multiple={false}
          files={files}
          onFilesChange={handleFilesChange}
          uploading={uploading}
        />
        {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
        {uploading && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
            <Spinner className="h-4 w-4" /> {t.processing.uploading}
          </div>
        )}
      </div>
    );
  }

  const canSubmit = text.trim().length > 0 && (!applyToSelected || selectedIds.size > 0);

  return (
    <div className="flex flex-col gap-6">
      <Input
        label={t.pdf.watermark.textContent}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.pdf.watermark.textPlaceholder}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Slider
          label={t.pdf.watermark.fontSize}
          valueLabel={String(fontSize)}
          min={8}
          max={72}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
        />
        <Slider
          label={t.pdf.watermark.opacity}
          valueLabel={`${opacity}%`}
          min={0}
          max={100}
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
        />
        <Slider
          label={t.pdf.watermark.rotation}
          valueLabel={`${rotation}°`}
          min={0}
          max={360}
          value={rotation}
          onChange={(e) => setRotation(Number(e.target.value))}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]">
            {t.pdf.watermark.color}
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-11 w-full cursor-pointer rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-2"
          />
        </div>
      </div>

      <Select
        label={t.pdf.watermark.position}
        value={position}
        onChange={(e) => setPosition(e.target.value as WatermarkPosition)}
        options={positionOptions}
        className="max-w-xs"
      />

      <Switch checked={applyToSelected} onChange={setApplyToSelected} label={t.pdf.watermark.selectedPages} />

      {applyToSelected && (
        <PdfPagePreview
          fileId={fileId}
          items={items}
          onItemsChange={setItems}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          enableReorder={false}
          enableRotate={false}
          enableDelete={false}
        />
      )}

      <Button disabled={!canSubmit} onClick={handleApply} className="self-start">
        {t.actions.submit}
      </Button>
    </div>
  );
}
