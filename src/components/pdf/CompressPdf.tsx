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
import type { ToolDefinition } from "@/types/tools";

export function CompressPdf({ tool }: { tool: ToolDefinition }) {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");
  const { stage, uploadProgress, error, resultFiles, run, reset } = useFileProcessor(tool.id);

  const handleReset = () => {
    reset();
    setFiles([]);
  };

  if (stage === "processing") return <ProcessingStatus stage="processing" />;
  if (stage === "error")
    return (
      <ProcessingStatus stage="error" errorMessage={error ?? undefined} onRetry={() => run(files, { quality })} />
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

      <Select
        label={t.toolLabels.compressionLevel}
        value={quality}
        onChange={(e) => setQuality(e.target.value as "low" | "medium" | "high")}
        options={[
          { value: "low", label: t.toolLabels.low },
          { value: "medium", label: t.toolLabels.medium },
          { value: "high", label: t.toolLabels.high },
        ]}
        className="max-w-xs"
      />

      <Button
        disabled={uploading || files.length === 0}
        onClick={() => run(files, { quality })}
        className="self-start"
      >
        {uploading ? <Spinner className="h-4 w-4" /> : t.actions.submit}
      </Button>
    </div>
  );
}
