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
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import type { ToolDefinition } from "@/types/tools";

export function RotatePdf({ tool }: { tool: ToolDefinition }) {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [angle, setAngle] = useState<90 | 180 | 270>(90);
  const [allPages, setAllPages] = useState(true);
  const [pages, setPages] = useState("");
  const { stage, uploadProgress, error, resultFiles, run, reset } = useFileProcessor(tool.id);

  const options = { angle, pages: allPages ? "all" : pages };

  const handleReset = () => {
    reset();
    setFiles([]);
  };

  if (stage === "processing") return <ProcessingStatus stage="processing" />;
  if (stage === "error")
    return <ProcessingStatus stage="error" errorMessage={error ?? undefined} onRetry={() => run(files, options)} />;
  if (stage === "done") return <DownloadResult files={resultFiles} onReset={handleReset} />;

  const uploading = stage === "uploading";
  const canSubmit = files.length === 1 && (allPages || pages.trim().length > 0);

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

      <Select
        label={t.toolLabels.rotationAngle}
        value={String(angle)}
        onChange={(e) => setAngle(Number(e.target.value) as 90 | 180 | 270)}
        options={[
          { value: "90", label: "90°" },
          { value: "180", label: "180°" },
          { value: "270", label: "270°" },
        ]}
        className="max-w-xs"
      />

      <Switch checked={allPages} onChange={setAllPages} label={t.toolLabels.allPages} />

      {!allPages && (
        <Input
          label={t.toolLabels.pages}
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          placeholder={t.toolLabels.specificPagesPlaceholder}
          dir="ltr"
          className="max-w-xs"
        />
      )}

      <Button disabled={uploading || !canSubmit} onClick={() => run(files, options)} className="self-start">
        {uploading ? <Spinner className="h-4 w-4" /> : t.actions.submit}
      </Button>
    </div>
  );
}
