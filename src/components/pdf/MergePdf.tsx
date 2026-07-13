"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { uploadFiles, useProcessOnly } from "@/lib/useFileProcessor";
import { FileUpload } from "@/components/tools/FileUpload";
import { ProcessingStatus } from "@/components/tools/ProcessingStatus";
import { DownloadResult } from "@/components/tools/DownloadResult";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { PdfPagePreview, type PdfPreviewItem } from "@/components/pdf/PdfPagePreview";
import type { ToolDefinition } from "@/types/tools";

const EMPTY_SELECTION = new Set<string>();

export function MergePdf({ tool }: { tool: ToolDefinition }) {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [fileIds, setFileIds] = useState<string[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [itemsByFileId, setItemsByFileId] = useState<Record<string, PdfPreviewItem[]>>({});
  const { stage, error, resultFiles, run, reset } = useProcessOnly(tool.id);

  const handleContinue = async () => {
    setUploading(true);
    setUploadError(null);
    try {
      const ids = await uploadFiles(files);
      setFileIds(ids);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    reset();
    setFiles([]);
    setFileIds(null);
    setItemsByFileId({});
  };

  const handleSubmit = () => {
    if (!fileIds) return;
    run(fileIds);
  };

  if (stage === "processing") return <ProcessingStatus stage="processing" />;
  if (stage === "error")
    return <ProcessingStatus stage="error" errorMessage={error ?? undefined} onRetry={handleSubmit} />;
  if (stage === "done") return <DownloadResult files={resultFiles} onReset={handleReset} />;

  if (!fileIds) {
    return (
      <div className="flex flex-col gap-6">
        <FileUpload
          accept={tool.acceptedMimeTypes}
          multiple={tool.multiple}
          maxFiles={tool.maxFiles}
          files={files}
          onFilesChange={setFiles}
          uploading={uploading}
        />
        {files.length === 1 && <p className="text-sm text-red-500">{t.errors.minFilesRequired}</p>}
        {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
        <Button disabled={uploading || files.length < 2} onClick={handleContinue} className="self-start">
          {uploading ? <Spinner className="h-4 w-4" /> : t.actions.submit}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {files.map((file, index) => {
        const fileId = fileIds[index];
        return (
          <div key={fileId} className="flex flex-col gap-2">
            <p className="text-sm font-medium text-[var(--color-foreground)]">{file.name}</p>
            <PdfPagePreview
              fileId={fileId}
              items={itemsByFileId[fileId] ?? []}
              onItemsChange={(next) => setItemsByFileId((prev) => ({ ...prev, [fileId]: next }))}
              selectedIds={EMPTY_SELECTION}
              onSelectedIdsChange={() => {}}
              enableReorder={false}
              enableRotate={false}
              enableDelete={false}
              enableSelection={false}
            />
          </div>
        );
      })}

      <Button onClick={handleSubmit} className="self-start">
        {t.actions.submit}
      </Button>
    </div>
  );
}
