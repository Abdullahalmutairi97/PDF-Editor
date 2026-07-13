import { runCommand } from "./exec";

export type ImageFormat = "jpeg" | "png" | "webp";

export async function compressImage(
  inputPath: string,
  outputPath: string,
  quality: number,
  format?: ImageFormat
): Promise<void> {
  const clampedQuality = Math.min(100, Math.max(1, Math.round(quality)));
  const target = format ? `${format}:${outputPath}` : outputPath;
  await runCommand("convert", [
    inputPath,
    "-auto-orient",
    "-strip",
    "-quality",
    String(clampedQuality),
    target,
  ]);
}

export type PageSize = "a4" | "letter" | "auto";
export type Orientation = "portrait" | "landscape" | "auto";
export type MarginSize = "none" | "small" | "large";
export type ImageFit = "contain" | "cover" | "stretch";

export interface ImageToPdfOptions {
  pageSize: PageSize;
  orientation: Orientation;
  margin: MarginSize;
  fit: ImageFit;
  bgColor: string;
}

/** Page dimensions in points (72 dpi), matching common PDF paper sizes. */
const PAGE_DIMENSIONS: Record<Exclude<PageSize, "auto">, { portrait: [number, number]; landscape: [number, number] }> = {
  a4: { portrait: [595, 842], landscape: [842, 595] },
  letter: { portrait: [612, 792], landscape: [792, 612] },
};

const MARGIN_PX: Record<MarginSize, number> = {
  none: 0,
  small: 20,
  large: 50,
};

export async function imagesToPdf(
  inputPaths: string[],
  outputPath: string,
  opts?: Partial<ImageToPdfOptions>
): Promise<void> {
  const pageSize = opts?.pageSize ?? "auto";
  const orientation = opts?.orientation ?? "auto";
  const marginPx = MARGIN_PX[opts?.margin ?? "none"];
  const fit = opts?.fit ?? "contain";
  const bgColor = opts?.bgColor ?? "#ffffff";

  const args = ["-density", "72", "-units", "PixelsPerInch"];

  if (pageSize === "auto") {
    for (const inputPath of inputPaths) {
      args.push("(", inputPath, "-auto-orient");
      if (marginPx > 0) {
        args.push("-bordercolor", bgColor, "-border", String(marginPx));
      }
      args.push(")");
    }
  } else {
    const dims = PAGE_DIMENSIONS[pageSize];
    const [pageW, pageH] = orientation === "landscape" ? dims.landscape : dims.portrait;
    const boxW = Math.max(1, pageW - marginPx * 2);
    const boxH = Math.max(1, pageH - marginPx * 2);
    const resizeGeom =
      fit === "cover" ? `${boxW}x${boxH}^` : fit === "stretch" ? `${boxW}x${boxH}!` : `${boxW}x${boxH}`;
    for (const inputPath of inputPaths) {
      args.push(
        "(",
        inputPath,
        "-auto-orient",
        "-resize",
        resizeGeom,
        "-background",
        bgColor,
        "-gravity",
        "center",
        "-extent",
        `${pageW}x${pageH}`,
        ")"
      );
    }
  }

  args.push(outputPath);
  await runCommand("convert", args);
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  maintainAspect: boolean;
  /** Overrides width/height with a straight percentage scale of the source image. */
  percentage?: number;
  format?: ImageFormat;
}

export async function resizeImage(
  inputPath: string,
  outputPath: string,
  { width, height, maintainAspect, percentage, format }: ResizeOptions
): Promise<void> {
  let geometry: string;
  if (percentage) {
    geometry = `${percentage}%`;
  } else if (width && height) {
    geometry = maintainAspect ? `${width}x${height}` : `${width}x${height}!`;
  } else if (width) {
    geometry = `${width}x`;
  } else if (height) {
    geometry = `x${height}`;
  } else {
    throw new Error("At least one of width, height, or percentage must be provided");
  }

  const target = format ? `${format}:${outputPath}` : outputPath;
  await runCommand("convert", [inputPath, "-auto-orient", "-resize", geometry, target]);
}
