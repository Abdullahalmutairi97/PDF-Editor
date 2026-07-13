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
import type { ToolDefinition } from "@/types/tools";

export function ImageToPdf({ tool }: { tool: ToolDefinition }) {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "auto">("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape" | "auto">("portrait");
  const [margin, setMargin] = useState<"none" | "small" | "large">("small");
  const [fit, setFit] = useState<"contain" | "cover" | "stretch">("contain");
  const [bgColor, setBgColor] = useState("#ffffff");
  const { stage, uploadProgress, error, resultFiles, run, reset } = useFileProcessor(tool.id);

  const options = { pageSize, orientation, margin, fit, bgColor };

  const handleReset = () => {
    reset();
    setFiles([]);
  };

  if (stage === "processing") return <ProcessingStatus stage="processing" />;
  if (stage === "error")
    return <ProcessingStatus stage="error" errorMessage={error ?? undefined} onRetry={() => run(files, options)} />;
  if (stage === "done") return <DownloadResult files={resultFiles} onReset={handleReset} />;

  const uploading = stage === "uploading";

  return (
    <div className="flex flex-col gap-6">
      <FileUpload
        accept={tool.acceptedMimeTypes}
        multiple={tool.multiple}
        maxFiles={tool.maxFiles}
        files={files}
        onFilesChange={setFiles}
        uploading={uploading}
        uploadProgress={uploadProgress}
      />

      <div className="grid max-w-xl gap-4 sm:grid-cols-2">
        <Select
          label={t.toolLabels.pageSize}
          value={pageSize}
          onChange={(e) => setPageSize(e.target.value as typeof pageSize)}
          options={[
            { value: "a4", label: "A4" },
            { value: "letter", label: t.toolLabels.letter },
            { value: "auto", label: t.toolLabels.autoFit },
          ]}
        />
        <Select
          label={t.toolLabels.orientation}
          value={orientation}
          onChange={(e) => setOrientation(e.target.value as typeof orientation)}
          options={[
            { value: "portrait", label: t.toolLabels.portrait },
            { value: "landscape", label: t.toolLabels.landscape },
            { value: "auto", label: t.toolLabels.auto },
          ]}
        />
        <Select
          label={t.toolLabels.margin}
          value={margin}
          onChange={(e) => setMargin(e.target.value as typeof margin)}
          options={[
            { value: "none", label: t.toolLabels.none },
            { value: "small", label: t.toolLabels.small },
            { value: "large", label: t.toolLabels.large },
          ]}
        />
        <Select
          label={t.toolLabels.imageFit}
          value={fit}
          onChange={(e) => setFit(e.target.value as typeof fit)}
          options={[
            { value: "contain", label: t.toolLabels.contain },
            { value: "cover", label: t.toolLabels.cover },
            { value: "stretch", label: t.toolLabels.stretch },
          ]}
        />
      </div>

      <Input
        type="color"
        label={t.toolLabels.backgroundColor}
        value={bgColor}
        onChange={(e) => setBgColor(e.target.value)}
        className="h-11 w-24 cursor-pointer p-1"
      />

      <Button disabled={uploading || files.length === 0} onClick={() => run(files, options)} className="self-start">
        {uploading ? <Spinner className="h-4 w-4" /> : t.actions.submit}
      </Button>
    </div>
  );
}
