"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { uploadFiles, useProcessOnly } from "@/lib/useFileProcessor";
import { FileUpload } from "@/components/tools/FileUpload";
import { ProcessingStatus } from "@/components/tools/ProcessingStatus";
import { DownloadResult } from "@/components/tools/DownloadResult";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Switch } from "@/components/ui/Switch";
import { PdfPagePreview, type PdfPreviewItem } from "@/components/pdf/PdfPagePreview";
import type { ToolDefinition } from "@/types/tools";

export function PdfToJpg({ tool }: { tool: ToolDefinition }) {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [fileId, setFileId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedOnly, setSelectedOnly] = useState(false);
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

  const handleSubmit = () => {
    if (!fileId) return;
    const pages = selectedOnly ? items.filter((it) => selectedIds.has(it.id)).map((it) => it.pageNum) : [];
    run([fileId], pages.length > 0 ? { pages } : {});
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

  const canSubmit = !selectedOnly || selectedIds.size > 0;

  return (
    <div className="flex flex-col gap-6">
      <Switch checked={selectedOnly} onChange={setSelectedOnly} label={t.pdf.toJpg.selectedOnly} />

      <PdfPagePreview
        fileId={fileId}
        items={items}
        onItemsChange={setItems}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        enableReorder={false}
        enableRotate={false}
        enableDelete={false}
        enableSelection={selectedOnly}
      />

      <Button disabled={!canSubmit} onClick={handleSubmit} className="self-start">
        {t.actions.submit}
      </Button>
    </div>
  );
}
