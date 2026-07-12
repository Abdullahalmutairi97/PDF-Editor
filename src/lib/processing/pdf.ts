import path from "path";
import { readdir } from "fs/promises";
import { runCommand } from "./exec";

export type CompressionQuality = "low" | "medium" | "high";

const GHOSTSCRIPT_PRESET: Record<CompressionQuality, string> = {
  low: "/printer",
  medium: "/ebook",
  high: "/screen",
};

export async function getPdfPageCount(inputPath: string): Promise<number> {
  const { stdout } = await runCommand("qpdf", ["--show-npages", inputPath]);
  const count = parseInt(stdout.trim(), 10);
  if (Number.isNaN(count)) {
    throw new Error("Unable to determine PDF page count");
  }
  return count;
}

export async function mergePdfs(inputPaths: string[], outputPath: string): Promise<void> {
  await runCommand("qpdf", ["--empty", "--pages", ...inputPaths, "--", outputPath]);
}

export interface PageRange {
  start: number;
  end: number;
}

export async function splitPdfByRanges(
  inputPath: string,
  ranges: PageRange[],
  outputDir: string
): Promise<string[]> {
  const outputPaths: string[] = [];
  for (let i = 0; i < ranges.length; i++) {
    const { start, end } = ranges[i];
    const outputPath = path.join(outputDir, `split-${i + 1}-p${start}-${end}.pdf`);
    const rangeArg = start === end ? `${start}` : `${start}-${end}`;
    await runCommand("qpdf", ["--empty", "--pages", inputPath, rangeArg, "--", outputPath]);
    outputPaths.push(outputPath);
  }
  return outputPaths;
}

export async function splitPdfEveryN(inputPath: string, n: number, outputDir: string): Promise<string[]> {
  const totalPages = await getPdfPageCount(inputPath);
  const ranges: PageRange[] = [];
  for (let start = 1; start <= totalPages; start += n) {
    const end = Math.min(start + n - 1, totalPages);
    ranges.push({ start, end });
  }
  return splitPdfByRanges(inputPath, ranges, outputDir);
}

export async function compressPdf(
  inputPath: string,
  outputPath: string,
  quality: CompressionQuality
): Promise<void> {
  await runCommand("gs", [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.4",
    `-dPDFSETTINGS=${GHOSTSCRIPT_PRESET[quality]}`,
    "-dNOPAUSE",
    "-dBATCH",
    "-dQUIET",
    `-sOutputFile=${outputPath}`,
    inputPath,
  ]);
}

export type RotationAngle = 90 | 180 | 270;

export async function rotatePdf(
  inputPath: string,
  outputPath: string,
  angle: RotationAngle,
  pages: "all" | number[]
): Promise<void> {
  const rotateArg = pages === "all" ? `${angle}` : `${angle}:${pages.join(",")}`;
  await runCommand("qpdf", [inputPath, outputPath, `--rotate=${rotateArg}`]);
}

export async function pdfToJpg(inputPath: string, outputDir: string, dpi = 150): Promise<string[]> {
  const prefix = path.join(outputDir, "page");
  await runCommand("pdftoppm", ["-jpeg", "-r", String(dpi), inputPath, prefix]);
  const entries = await readdir(outputDir);
  return entries
    .filter((name) => name.startsWith("page") && name.endsWith(".jpg"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => path.join(outputDir, name));
}
