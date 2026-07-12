"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useFileProcessor } from "@/lib/useFileProcessor";
import { FileUpload } from "@/components/tools/FileUpload";
import { ProcessingStatus } from "@/components/tools/ProcessingStatus";
import { DownloadResult } from "@/components/tools/DownloadResult";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import type { ToolDefinition } from "@/types/tools";

export function ResizeImage({ tool }: { tool: ToolDefinition }) {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [maintainAspect, setMaintainAspect] = useState(true);
  const { stage, uploadProgress, error, resultFiles, run, reset } = useFileProcessor(tool.id);

  const options = {
    width: width ? Number(width) : undefined,
    height: height ? Number(height) : undefined,
    maintainAspect,
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
  const canSubmit = files.length === 1 && (width.trim().length > 0 || height.trim().length > 0);

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

      <Button disabled={uploading || !canSubmit} onClick={() => run(files, options)} className="self-start">
        {uploading ? <Spinner className="h-4 w-4" /> : t.actions.submit}
      </Button>
    </div>
  );
}
