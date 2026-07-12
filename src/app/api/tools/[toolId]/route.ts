import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { readFile, rm } from "fs/promises";
import { getToolById } from "@/tools/registry";
import { createWorkDir, downloadUrlFor, getStoredFile, saveBuffer, type StoredFile } from "@/lib/storage";
import { ProcessingError } from "@/lib/processing/exec";
import { createZip } from "@/lib/zip";
import {
  compressPdf,
  mergePdfs,
  pdfToJpg,
  rotatePdf,
  splitPdfByRanges,
  splitPdfEveryN,
  type CompressionQuality,
  type PageRange,
  type RotationAngle,
} from "@/lib/processing/pdf";
import { compressImage, imagesToPdf, resizeImage } from "@/lib/processing/image";
import type { ProcessResultFile } from "@/types/tools";

async function finalizeOutput(filePath: string, filename: string): Promise<ProcessResultFile> {
  const buffer = await readFile(filePath);
  const stored = await saveBuffer(buffer, filename);
  return {
    fileId: stored.fileId,
    filename: stored.filename,
    size: stored.size,
    downloadUrl: downloadUrlFor(stored.fileId),
  };
}

async function finalizeOutputs(filePaths: string[], zipName: string): Promise<ProcessResultFile> {
  if (filePaths.length === 1) {
    return finalizeOutput(filePaths[0], path.basename(filePaths[0]));
  }
  const entries = await Promise.all(
    filePaths.map(async (filePath) => ({ name: path.basename(filePath), data: await readFile(filePath) }))
  );
  const zipBuffer = createZip(entries);
  const stored = await saveBuffer(zipBuffer, zipName);
  return {
    fileId: stored.fileId,
    filename: stored.filename,
    size: stored.size,
    downloadUrl: downloadUrlFor(stored.fileId),
  };
}

async function resolveInput(fileId: string): Promise<StoredFile> {
  const file = await getStoredFile(fileId);
  if (!file) {
    throw new ProcessingError(`File not found: ${fileId}`);
  }
  return file;
}

function parsePageRanges(input: string): PageRange[] {
  return input
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [startStr, endStr] = part.split("-").map((n) => n.trim());
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : start;
      if (Number.isNaN(start) || Number.isNaN(end)) {
        throw new ProcessingError(`Invalid page range: ${part}`);
      }
      return { start, end };
    });
}

function parsePageNumbers(input: string): number[] {
  return input
    .split(",")
    .map((n) => parseInt(n.trim(), 10))
    .filter((n) => !Number.isNaN(n));
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ toolId: string }> }) {
  const { toolId } = await params;
  const tool = getToolById(toolId);

  if (!tool || tool.mode !== "server") {
    return NextResponse.json({ success: false, error: "Unknown tool" }, { status: 404 });
  }

  let body: { fileIds?: string[]; options?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const fileIds = body.fileIds ?? [];
  const options = body.options ?? {};

  if (fileIds.length === 0) {
    return NextResponse.json({ success: false, error: "No files provided" }, { status: 400 });
  }

  const workDir = await createWorkDir();

  try {
    let result: ProcessResultFile;

    switch (toolId) {
      case "merge-pdf": {
        const inputs = await Promise.all(fileIds.map(resolveInput));
        const outputPath = path.join(workDir, "merged.pdf");
        await mergePdfs(
          inputs.map((f) => f.filePath),
          outputPath
        );
        result = await finalizeOutput(outputPath, "merged.pdf");
        break;
      }
      case "split-pdf": {
        const input = await resolveInput(fileIds[0]);
        const mode = options.mode === "everyN" ? "everyN" : "ranges";
        let outputs: string[];
        if (mode === "everyN") {
          const n = Math.max(1, Number(options.n) || 1);
          outputs = await splitPdfEveryN(input.filePath, n, workDir);
        } else {
          const ranges = parsePageRanges(String(options.ranges ?? ""));
          if (ranges.length === 0) throw new ProcessingError("No valid page ranges provided");
          outputs = await splitPdfByRanges(input.filePath, ranges, workDir);
        }
        result = await finalizeOutputs(outputs, "split-pages.zip");
        break;
      }
      case "compress-pdf": {
        const input = await resolveInput(fileIds[0]);
        const requestedQuality = String(options.quality ?? "medium");
        const quality = (["low", "medium", "high"].includes(requestedQuality)
          ? requestedQuality
          : "medium") as CompressionQuality;
        const outputPath = path.join(workDir, `compressed-${input.filename}`);
        await compressPdf(input.filePath, outputPath, quality);
        result = await finalizeOutput(outputPath, `compressed-${input.filename}`);
        break;
      }
      case "rotate-pdf": {
        const input = await resolveInput(fileIds[0]);
        const requestedAngle = Number(options.angle);
        const angle = ([90, 180, 270].includes(requestedAngle) ? requestedAngle : 90) as RotationAngle;
        const pages = !options.pages || options.pages === "all" ? "all" : parsePageNumbers(String(options.pages));
        const outputPath = path.join(workDir, `rotated-${input.filename}`);
        await rotatePdf(input.filePath, outputPath, angle, pages);
        result = await finalizeOutput(outputPath, `rotated-${input.filename}`);
        break;
      }
      case "pdf-to-jpg": {
        const input = await resolveInput(fileIds[0]);
        const outputs = await pdfToJpg(input.filePath, workDir);
        result = await finalizeOutputs(outputs, "pages.zip");
        break;
      }
      case "compress-image": {
        const input = await resolveInput(fileIds[0]);
        const quality = Number(options.quality) || 80;
        const outputPath = path.join(workDir, `compressed-${input.filename}`);
        await compressImage(input.filePath, outputPath, quality);
        result = await finalizeOutput(outputPath, `compressed-${input.filename}`);
        break;
      }
      case "image-to-pdf": {
        const inputs = await Promise.all(fileIds.map(resolveInput));
        const outputPath = path.join(workDir, "images.pdf");
        await imagesToPdf(
          inputs.map((f) => f.filePath),
          outputPath
        );
        result = await finalizeOutput(outputPath, "images.pdf");
        break;
      }
      case "resize-image": {
        const input = await resolveInput(fileIds[0]);
        const width = options.width ? Number(options.width) : undefined;
        const height = options.height ? Number(options.height) : undefined;
        const maintainAspect = options.maintainAspect !== false;
        const outputPath = path.join(workDir, `resized-${input.filename}`);
        await resizeImage(input.filePath, outputPath, { width, height, maintainAspect });
        result = await finalizeOutput(outputPath, `resized-${input.filename}`);
        break;
      }
      default:
        return NextResponse.json({ success: false, error: "Unsupported tool" }, { status: 400 });
    }

    return NextResponse.json({ success: true, files: [result] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Processing failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
