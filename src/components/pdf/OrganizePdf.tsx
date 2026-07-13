"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { generateUUID } from "@/lib/uuid";
import { uploadFiles, useProcessOnly } from "@/lib/useFileProcessor";
import { FileUpload } from "@/components/tools/FileUpload";
import { ProcessingStatus } from "@/components/tools/ProcessingStatus";
import { DownloadResult } from "@/components/tools/DownloadResult";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Select } from "@/components/ui/Select";
import {
  PdfPagePreview,
  createBlankItem,
  type PageRotation,
  type PdfPreviewItem,
} from "@/components/pdf/PdfPagePreview";
import type { ToolDefinition } from "@/types/tools";

export function OrganizePdf({ tool }: { tool: ToolDefinition }) {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [fileId, setFileId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [items, setItems] = useState<PdfPreviewItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [rotateAllAngle, setRotateAllAngle] = useState<90 | 180 | 270>(90);
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

  const rotateSelected = () => {
    setItems((prev) =>
      prev.map((it) =>
        selectedIds.has(it.id) ? { ...it, rotation: (((it.rotation + 90) % 360) as PageRotation) } : it
      )
    );
  };

  const deleteSelected = () => {
    setItems((prev) => prev.filter((it) => !selectedIds.has(it.id)));
    setSelectedIds(new Set());
  };

  const duplicateSelected = () => {
    setItems((prev) => {
      const next: PdfPreviewItem[] = [];
      for (const it of prev) {
        next.push(it);
        if (selectedIds.has(it.id)) {
          next.push({ id: generateUUID(), pageNum: it.pageNum, rotation: it.rotation });
        }
      }
      return next;
    });
  };

  const addBlankPage = () => {
    setItems((prev) => {
      const blank = createBlankItem();
      if (selectedIds.size === 1) {
        const [onlyId] = selectedIds;
        const idx = prev.findIndex((it) => it.id === onlyId);
        if (idx !== -1) {
          const next = [...prev];
          next.splice(idx + 1, 0, blank);
          return next;
        }
      }
      return [...prev, blank];
    });
  };

  const reverseOrder = () => setItems((prev) => [...prev].reverse());

  const applyRotationToAll = () => {
    setItems((prev) =>
      prev.map((it) => ({ ...it, rotation: (((it.rotation + rotateAllAngle) % 360) as PageRotation) }))
    );
  };

  const handleApply = () => {
    if (!fileId || items.length === 0) return;
    run([fileId], {
      pages: items.map((it) => ({ pageNum: it.pageNum, rotation: it.rotation })),
    });
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={rotateSelected} disabled={selectedIds.size === 0}>
          {t.pdf.organize.rotateSelected}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={deleteSelected} disabled={selectedIds.size === 0}>
          {t.pdf.organize.deleteSelected}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={duplicateSelected}
          disabled={selectedIds.size === 0}
        >
          {t.pdf.organize.duplicateSelected}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={addBlankPage}>
          {t.pdf.organize.addBlankPage}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={reverseOrder}>
          {t.pdf.organize.reverseOrder}
        </Button>
        <div className="flex items-center gap-1.5">
          <Select
            value={String(rotateAllAngle)}
            onChange={(e) => setRotateAllAngle(Number(e.target.value) as 90 | 180 | 270)}
            options={[
              { value: "90", label: "90°" },
              { value: "180", label: "180°" },
              { value: "270", label: "270°" },
            ]}
            className="h-9 w-24"
          />
          <Button type="button" variant="outline" size="sm" onClick={applyRotationToAll}>
            {t.pdf.rotate.rotateAll}
          </Button>
        </div>
      </div>

      <PdfPagePreview
        fileId={fileId}
        items={items}
        onItemsChange={setItems}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
      />

      <p className="text-xs text-[var(--color-muted)]">
        {items.length === 0 ? t.pdf.organize.noPagesLeft : `${items.length} ${t.pdf.organize.pagesRemaining}`}
      </p>

      <Button disabled={items.length === 0} onClick={handleApply} className="self-start">
        {t.pdf.organize.applyChanges}
      </Button>
    </div>
  );
}
