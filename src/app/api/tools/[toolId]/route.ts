import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { randomUUID } from "crypto";
import { readFile, rm } from "fs/promises";
import { getToolById } from "@/tools/registry";
import { createWorkDir, downloadUrlFor, getStoredFile, saveBuffer, type StoredFile } from "@/lib/storage";
import { ProcessingError } from "@/lib/processing/exec";
import { createZip } from "@/lib/zip";
import {
  compressPdf,
  mergePdfs,
  organizePdf,
  overlayStamp,
  pdfToJpg,
  pdfToImages,
  rotatePdf,
  splitPdfByRanges,
  splitPdfEveryN,
  watermarkPdf,
  type CompressionQuality,
  type OrganizePageSpec,
  type PageRange,
  type RotationAngle,
  type WatermarkPosition,
} from "@/lib/processing/pdf";
import { generateAnnotationOverlay, type Annotation } from "@/lib/processing/edit";
import {
  compressImage,
  imagesToPdf,
  resizeImage,
  type ImageFit,
  type ImageFormat,
  type MarginSize,
  type Orientation,
  type PageSize,
} from "@/lib/processing/image";
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

const ANNOTATION_TYPES = new Set(["text", "pen", "highlight", "rectangle", "line", "arrow", "signature"]);

function parseAnnotations(input: unknown): Annotation[] {
  if (!Array.isArray(input)) return [];
  const result: Annotation[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const a = raw as Record<string, unknown>;
    if (typeof a.type !== "string" || !ANNOTATION_TYPES.has(a.type)) continue;
    const page = Number(a.page);
    if (!Number.isFinite(page) || page < 1) continue;
    const points = Array.isArray(a.points)
      ? (a.points as unknown[])
          .map((p) => {
            const point = p as Record<string, unknown>;
            return { x: Number(point?.x), y: Number(point?.y) };
          })
          .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
      : undefined;
    result.push({
      id: typeof a.id === "string" ? a.id : randomUUID(),
      type: a.type as Annotation["type"],
      page,
      x: Number(a.x) || 0,
      y: Number(a.y) || 0,
      width: Number(a.width) || 0,
      height: Number(a.height) || 0,
      color: typeof a.color === "string" && a.color ? a.color : "#000000",
      opacity: Math.min(1, Math.max(0, Number(a.opacity ?? 1))),
      strokeWidth: a.strokeWidth !== undefined ? Number(a.strokeWidth) : undefined,
      text: typeof a.text === "string" ? a.text : undefined,
      fontSize: a.fontSize !== undefined ? Number(a.fontSize) : undefined,
      points,
      dataUrl: typeof a.dataUrl === "string" ? a.dataUrl : undefined,
    });
  }
  return result;
}

const IMAGE_FORMAT_EXTENSION: Record<ImageFormat, string> = {
  jpeg: ".jpg",
  png: ".png",
  webp: ".webp",
};

function parseImageFormat(value: unknown): ImageFormat | undefined {
  return value === "jpeg" || value === "png" || value === "webp" ? value : undefined;
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
        const grayscale = options.grayscale === true;
        const imageDpi = options.dpi ? Number(options.dpi) : undefined;
        const imageQuality = options.imageQuality ? Number(options.imageQuality) : undefined;
        const outputPath = path.join(workDir, `compressed-${input.filename}`);
        await compressPdf(input.filePath, outputPath, { quality, grayscale, imageDpi, imageQuality });
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
        const pages = Array.isArray(options.pages) ? parsePageNumbers(options.pages.join(",")) : undefined;
        const outputs =
          pages && pages.length > 0
            ? await pdfToImages(input.filePath, workDir, 150, "jpeg", pages)
            : await pdfToJpg(input.filePath, workDir);
        result = await finalizeOutputs(outputs, "pages.zip");
        break;
      }
      case "organize-pdf": {
        const input = await resolveInput(fileIds[0]);
        const pages = Array.isArray(options.pages)
          ? (options.pages as { pageNum: number; rotation: number }[]).map(
              (p): OrganizePageSpec => ({
                pageNum: Number(p.pageNum) || 0,
                rotation: ([0, 90, 180, 270].includes(Number(p.rotation)) ? Number(p.rotation) : 0) as
                  | 0
                  | 90
                  | 180
                  | 270,
              })
            )
          : [];
        if (pages.length === 0) throw new ProcessingError("No pages to organize");
        const outputPath = path.join(workDir, `organized-${input.filename}`);
        await organizePdf(input.filePath, pages, outputPath, workDir);
        result = await finalizeOutput(outputPath, `organized-${input.filename}`);
        break;
      }
      case "watermark-pdf": {
        const input = await resolveInput(fileIds[0]);
        const text = String(options.text ?? "").trim();
        if (!text) throw new ProcessingError("Watermark text is required");
        const fontSize = Number(options.fontSize) || 36;
        const color = typeof options.color === "string" && options.color ? options.color : "#ff0000";
        const opacity = Math.min(1, Math.max(0, Number(options.opacity ?? 50) / 100));
        const rotation = Number(options.rotation) || 0;
        const validPositions: WatermarkPosition[] = [
          "center",
          "diagonal",
          "tile",
          "top-left",
          "top-center",
          "top-right",
          "bottom-left",
          "bottom-center",
          "bottom-right",
        ];
        const position = (
          validPositions.includes(options.position as WatermarkPosition) ? options.position : "center"
        ) as WatermarkPosition;
        const pages = !options.pages || options.pages === "all" ? "all" : parsePageNumbers(String(options.pages));
        const outputPath = path.join(workDir, `watermarked-${input.filename}`);
        await watermarkPdf(input.filePath, outputPath, { text, fontSize, color, opacity, rotation, position, pages }, workDir);
        result = await finalizeOutput(outputPath, `watermarked-${input.filename}`);
        break;
      }
      case "edit-pdf": {
        const input = await resolveInput(fileIds[0]);
        const annotations = parseAnnotations(options.annotations);
        if (annotations.length === 0) throw new ProcessingError("No annotations to apply");
        const overlayPath = path.join(workDir, "overlay.pdf");
        await generateAnnotationOverlay(annotations, input.filePath, overlayPath, workDir);
        const outputPath = path.join(workDir, `edited-${input.filename}`);
        await overlayStamp(input.filePath, overlayPath, outputPath, "all");
        result = await finalizeOutput(outputPath, `edited-${input.filename}`);
        break;
      }
      case "compress-image": {
        const inputs = await Promise.all(fileIds.map(resolveInput));
        const quality = Number(options.quality) || 80;
        const format = parseImageFormat(options.format);
        const outputs: string[] = [];
        for (const input of inputs) {
          const ext = format ? IMAGE_FORMAT_EXTENSION[format] : path.extname(input.filename);
          const base = path.parse(input.filename).name;
          const outputPath = path.join(workDir, `compressed-${base}${ext}`);
          await compressImage(input.filePath, outputPath, quality, format);
          outputs.push(outputPath);
        }
        result = await finalizeOutputs(outputs, "compressed-images.zip");
        break;
      }
      case "image-to-pdf": {
        const inputs = await Promise.all(fileIds.map(resolveInput));
        const outputPath = path.join(workDir, "images.pdf");
        const pageSize = (["a4", "letter", "auto"].includes(String(options.pageSize))
          ? options.pageSize
          : "auto") as PageSize;
        const orientation = (["portrait", "landscape", "auto"].includes(String(options.orientation))
          ? options.orientation
          : "auto") as Orientation;
        const margin = (["none", "small", "large"].includes(String(options.margin))
          ? options.margin
          : "none") as MarginSize;
        const fit = (["contain", "cover", "stretch"].includes(String(options.fit))
          ? options.fit
          : "contain") as ImageFit;
        const bgColor = typeof options.bgColor === "string" && options.bgColor ? options.bgColor : "#ffffff";
        await imagesToPdf(
          inputs.map((f) => f.filePath),
          outputPath,
          { pageSize, orientation, margin, fit, bgColor }
        );
        result = await finalizeOutput(outputPath, "images.pdf");
        break;
      }
      case "resize-image": {
        const inputs = await Promise.all(fileIds.map(resolveInput));
        const width = options.width ? Number(options.width) : undefined;
        const height = options.height ? Number(options.height) : undefined;
        const maintainAspect = options.maintainAspect !== false;
        const percentage = options.percentage ? Number(options.percentage) : undefined;
        const format = parseImageFormat(options.format);
        const outputs: string[] = [];
        for (const input of inputs) {
          const ext = format ? IMAGE_FORMAT_EXTENSION[format] : path.extname(input.filename);
          const base = path.parse(input.filename).name;
          const outputPath = path.join(workDir, `resized-${base}${ext}`);
          await resizeImage(input.filePath, outputPath, { width, height, maintainAspect, percentage, format });
          outputs.push(outputPath);
        }
        result = await finalizeOutputs(outputs, "resized-images.zip");
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
