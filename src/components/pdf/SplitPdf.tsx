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
import { Select } from "@/components/ui/Select";
import type { ToolDefinition } from "@/types/tools";

export function SplitPdf({ tool }: { tool: ToolDefinition }) {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<"ranges" | "everyN">("ranges");
  const [ranges, setRanges] = useState("");
  const [n, setN] = useState(1);
  const { stage, uploadProgress, error, resultFiles, run, reset } = useFileProcessor(tool.id);

  const options = mode === "ranges" ? { mode, ranges } : { mode, n };

  const handleReset = () => {
    reset();
    setFiles([]);
  };

  if (stage === "processing") return <ProcessingStatus stage="processing" />;
  if (stage === "error")
    return <ProcessingStatus stage="error" errorMessage={error ?? undefined} onRetry={() => run(files, options)} />;
  if (stage === "done") return <DownloadResult files={resultFiles} onReset={handleReset} />;

  const uploading = stage === "uploading";
  const canSubmit = files.length === 1 && (mode === "everyN" || ranges.trim().length > 0);

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
        <Input
          label={t.toolLabels.pageRanges}
          value={ranges}
          onChange={(e) => setRanges(e.target.value)}
          placeholder={t.toolLabels.pageRangesPlaceholder}
          dir="ltr"
          className="max-w-xs"
        />
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

      <Button disabled={uploading || !canSubmit} onClick={() => run(files, options)} className="self-start">
        {uploading ? <Spinner className="h-4 w-4" /> : t.actions.submit}
      </Button>
    </div>
  );
}
