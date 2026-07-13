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
import { PdfPagePreview, type PdfPreviewItem } from "@/components/pdf/PdfPagePreview";
import type { ToolDefinition } from "@/types/tools";

function toRangesString(pageNums: number[]): string {
  const sorted = [...pageNums].sort((a, b) => a - b);
  const parts: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i <= sorted.length; i++) {
    const n = sorted[i];
    if (n === prev + 1) {
      prev = n;
      continue;
    }
    parts.push(start === prev ? `${start}` : `${start}-${prev}`);
    if (n === undefined) break;
    start = n;
    prev = n;
  }
  return parts.join(",");
}

export function SplitPdf({ tool }: { tool: ToolDefinition }) {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [fileId, setFileId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mode, setMode] = useState<"ranges" | "everyN">("ranges");
  const [ranges, setRanges] = useState("");
  const [n, setN] = useState(1);
  const [items, setItems] = useState<PdfPreviewItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { stage, error, resultFiles, run, reset } = useProcessOnly(tool.id);

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

  const handleSelectedIdsChange = (ids: Set<string>) => {
    setSelectedIds(ids);
    const pageNums = items.filter((it) => ids.has(it.id)).map((it) => it.pageNum);
    setRanges(pageNums.length > 0 ? toRangesString(pageNums) : "");
  };

  const handleSubmit = () => {
    if (!fileId) return;
    run([fileId], mode === "ranges" ? { mode, ranges } : { mode, n });
  };

  if (stage === "processing") return <ProcessingStatus stage="processing" />;
  if (stage === "error")
    return <ProcessingStatus stage="error" errorMessage={error ?? undefined} onRetry={handleSubmit} />;
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

  const canSubmit = mode === "everyN" || ranges.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      <Select
        label={t.toolLabels.splitMode}
        value={mode}
        onChange={(e) => setMode(e.target.value as "ranges" | "everyN")}
        options={[
          { value: "ranges", label: t.toolLabels.byRanges },
          { value: "everyN", label: t.toolLabels.everyNPages },
        ]}
        className="max-w-xs"
      />

      {mode === "ranges" ? (
        <>
          <Input
            label={t.toolLabels.pageRanges}
            value={ranges}
            onChange={(e) => setRanges(e.target.value)}
            placeholder={t.toolLabels.pageRangesPlaceholder}
            dir="ltr"
            className="max-w-xs"
          />
          <PdfPagePreview
            fileId={fileId}
            items={items}
            onItemsChange={setItems}
            selectedIds={selectedIds}
            onSelectedIdsChange={handleSelectedIdsChange}
            enableReorder={false}
            enableRotate={false}
            enableDelete={false}
          />
        </>
      ) : (
        <Input
          label={t.toolLabels.pagesPerFile}
          type="number"
          min={1}
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
          className="max-w-xs"
        />
      )}

      <Button disabled={!canSubmit} onClick={handleSubmit} className="self-start">
        {t.actions.submit}
      </Button>
    </div>
  );
}
