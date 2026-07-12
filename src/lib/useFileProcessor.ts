"use client";

import { useCallback, useState } from "react";
import type { ProcessResultFile } from "@/types/tools";

export type ProcessStage = "idle" | "uploading" | "processing" | "done" | "error";

interface UseFileProcessorResult {
  stage: ProcessStage;
  uploadProgress: number;
  error: string | null;
  resultFiles: ProcessResultFile[];
  run: (files: File[], options?: Record<string, unknown>) => Promise<void>;
  reset: () => void;
}

function uploadFiles(files: File[], onProgress: (percent: number) => void): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.success) {
          resolve((data.files as { fileId: string }[]).map((f) => f.fileId));
        } else {
          reject(new Error(data.error || "Upload failed"));
        }
      } catch {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(formData);
  });
}

export function useFileProcessor(toolId: string): UseFileProcessorResult {
  const [stage, setStage] = useState<ProcessStage>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultFiles, setResultFiles] = useState<ProcessResultFile[]>([]);

  const reset = useCallback(() => {
    setStage("idle");
    setUploadProgress(0);
    setError(null);
    setResultFiles([]);
  }, []);

  const run = useCallback(
    async (files: File[], options: Record<string, unknown> = {}) => {
      setError(null);
      setStage("uploading");
      setUploadProgress(0);

      try {
        const fileIds = await uploadFiles(files, setUploadProgress);
        setStage("processing");

        const response = await fetch(`/api/tools/${toolId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileIds, options }),
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Processing failed");
        }

        setResultFiles(data.files ?? []);
        setStage("done");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setStage("error");
      }
    },
    [toolId]
  );

  return { stage, uploadProgress, error, resultFiles, run, reset };
}
