import { runCommand } from "./exec";

export async function compressImage(inputPath: string, outputPath: string, quality: number): Promise<void> {
  const clampedQuality = Math.min(100, Math.max(1, Math.round(quality)));
  await runCommand("convert", [
    inputPath,
    "-auto-orient",
    "-strip",
    "-quality",
    String(clampedQuality),
    outputPath,
  ]);
}

export async function imagesToPdf(inputPaths: string[], outputPath: string): Promise<void> {
  await runCommand("convert", ["-auto-orient", ...inputPaths, outputPath]);
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  maintainAspect: boolean;
}

export async function resizeImage(
  inputPath: string,
  outputPath: string,
  { width, height, maintainAspect }: ResizeOptions
): Promise<void> {
  if (!width && !height) {
    throw new Error("At least one of width or height must be provided");
  }

  let geometry: string;
  if (width && height) {
    geometry = maintainAspect ? `${width}x${height}` : `${width}x${height}!`;
  } else if (width) {
    geometry = `${width}x`;
  } else {
    geometry = `x${height}`;
  }

  await runCommand("convert", [inputPath, "-auto-orient", "-resize", geometry, outputPath]);
}
