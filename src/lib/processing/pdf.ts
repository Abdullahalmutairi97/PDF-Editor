import path from "path";
import zlib from "zlib";
import { readdir, writeFile } from "fs/promises";
import { runCommand, runCommandBuffer } from "./exec";
import { PdfWriter, escapePdfString } from "./pdfWriter";

export type CompressionQuality = "extreme" | "high" | "medium" | "low";

const GHOSTSCRIPT_PRESET: Record<CompressionQuality, string> = {
  extreme: "/screen",
  high: "/ebook",
  medium: "/printer",
  low: "/prepress",
};

/** Rough size-reduction ratio per preset, used to show an estimated output size before processing. */
export const COMPRESSION_ESTIMATE_RATIO: Record<CompressionQuality, number> = {
  extreme: 0.25,
  high: 0.4,
  medium: 0.6,
  low: 0.8,
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

export interface CompressPdfOptions {
  quality: CompressionQuality;
  grayscale?: boolean;
  /** Overrides the preset's default downsampling DPI for embedded images. */
  imageDpi?: number;
  /** JPEG quality (0-100) used for recompressed embedded images. */
  imageQuality?: number;
}

export async function compressPdf(inputPath: string, outputPath: string, opts: CompressPdfOptions): Promise<void> {
  const args = [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.4",
    `-dPDFSETTINGS=${GHOSTSCRIPT_PRESET[opts.quality]}`,
    "-dNOPAUSE",
    "-dBATCH",
    "-dQUIET",
  ];

  if (opts.imageDpi) {
    for (const kind of ["Color", "Gray", "Mono"]) {
      args.push(`-dDownsample${kind}Images=true`, `-d${kind}ImageResolution=${opts.imageDpi}`);
    }
  }
  if (opts.imageQuality) {
    args.push(`-dJPEGQ=${Math.min(100, Math.max(1, Math.round(opts.imageQuality)))}`);
  }
  if (opts.grayscale) {
    args.push("-sColorConversionStrategy=Gray", "-dProcessColorModel=/DeviceGray");
  }

  args.push(`-sOutputFile=${outputPath}`, inputPath);
  await runCommand("gs", args);
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

export type ImageOutputFormat = "jpeg" | "png";

export async function pdfToImages(
  inputPath: string,
  outputDir: string,
  dpi = 150,
  format: ImageOutputFormat = "jpeg",
  pages?: number[]
): Promise<string[]> {
  const prefix = path.join(outputDir, "page");
  const formatFlag = format === "png" ? "-png" : "-jpeg";
  const args = [formatFlag, "-r", String(dpi)];
  if (pages && pages.length > 0) {
    const first = Math.min(...pages);
    const last = Math.max(...pages);
    args.push("-f", String(first), "-l", String(last));
  }
  args.push(inputPath, prefix);
  await runCommand("pdftoppm", args);
  const ext = format === "png" ? ".png" : ".jpg";
  const entries = await readdir(outputDir);
  const allPages = entries
    .filter((name) => name.startsWith("page") && name.endsWith(ext))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (!pages || pages.length === 0) {
    return allPages.map((name) => path.join(outputDir, name));
  }

  const pageSet = new Set(pages);
  const first = Math.min(...pages);
  return allPages
    .filter((_, index) => pageSet.has(first + index))
    .map((name) => path.join(outputDir, name));
}

export async function pdfToJpg(inputPath: string, outputDir: string, dpi = 150): Promise<string[]> {
  return pdfToImages(inputPath, outputDir, dpi, "jpeg");
}

/* ---------------------------------------------------------------------- */
/* Page-level engine: assemble, rotate, blank pages, and PDF-native stamps */
/* (page-number overlays, image/logo/text watermarks) used by the         */
/* preview/organize/watermark tooling.                                    */
/* ---------------------------------------------------------------------- */

export interface PdfInfo {
  pageCount: number;
  width: number;
  height: number;
}

export async function getPdfInfo(inputPath: string): Promise<PdfInfo> {
  const { stdout } = await runCommand("pdfinfo", [inputPath]);
  const pagesMatch = stdout.match(/^Pages:\s+(\d+)/m);
  const sizeMatch = stdout.match(/^Page size:\s+([\d.]+)\s*x\s*([\d.]+)/m);
  const pageCount = pagesMatch ? parseInt(pagesMatch[1], 10) : 0;
  if (!pageCount) {
    throw new Error("Unable to read PDF info");
  }
  return {
    pageCount,
    width: sizeMatch ? parseFloat(sizeMatch[1]) : 595,
    height: sizeMatch ? parseFloat(sizeMatch[2]) : 842,
  };
}

export interface PageSpec {
  /** Path to the source PDF this page comes from (can repeat across specs to duplicate pages). */
  source: string;
  /** 1-based page number within the source PDF. */
  page: number;
}

/** Groups consecutive same-source, consecutive-increasing pages into ranges to keep the qpdf argv short. */
function buildPagesArgs(specs: PageSpec[]): string[] {
  const args: string[] = [];
  let i = 0;
  while (i < specs.length) {
    const source = specs[i].source;
    let j = i;
    while (j + 1 < specs.length && specs[j + 1].source === source && specs[j + 1].page === specs[j].page + 1) {
      j++;
    }
    args.push(source, j > i ? `${specs[i].page}-${specs[j].page}` : `${specs[i].page}`);
    i = j + 1;
  }
  return args;
}

/**
 * Builds a new PDF from an explicit ordered list of (source, page) references.
 * Supports reordering (any order), deletion (omission), duplication (repeated
 * spec), extraction (subset), and blank-page insertion (source = a blank PDF).
 */
export async function assemblePages(specs: PageSpec[], outputPath: string): Promise<void> {
  if (specs.length === 0) {
    throw new Error("No pages to assemble");
  }
  await runCommand("qpdf", ["--empty", "--pages", ...buildPagesArgs(specs), "--", outputPath]);
}

/**
 * Sets the absolute rotation of specific output pages (1-based, referring to
 * outputPath's own page numbering after assembly). Pages not present in the
 * map keep their current rotation.
 */
export async function applyAbsoluteRotations(
  inputPath: string,
  outputPath: string,
  rotations: Map<number, 90 | 180 | 270>
): Promise<void> {
  if (rotations.size === 0) {
    await runCommand("qpdf", [inputPath, outputPath]);
    return;
  }
  const byAngle = new Map<number, number[]>();
  for (const [pageNum, angle] of rotations) {
    if (!byAngle.has(angle)) byAngle.set(angle, []);
    byAngle.get(angle)!.push(pageNum);
  }
  const args = [inputPath, outputPath];
  for (const [angle, pages] of byAngle) {
    const sorted = [...pages].sort((a, b) => a - b);
    args.push(`--rotate=${angle}:${sorted.join(",")}`);
  }
  await runCommand("qpdf", args);
}

export async function createBlankPdfPage(outputPath: string, width = 595, height = 842): Promise<void> {
  await runCommand("gs", [
    "-q",
    "-dNOPAUSE",
    "-dBATCH",
    "-sDEVICE=pdfwrite",
    `-dDEVICEWIDTHPOINTS=${Math.round(width)}`,
    `-dDEVICEHEIGHTPOINTS=${Math.round(height)}`,
    "-dFIXEDMEDIA",
    `-sOutputFile=${outputPath}`,
    "-c",
    "showpage",
  ]);
}

export interface OrganizePageInput {
  source: string;
  page: number;
  rotation: 0 | 90 | 180 | 270;
}

/** Assembles pages in the given order (reorder/delete/duplicate/blank-insert) and applies per-page absolute rotation in one call. */
export async function buildOrganizedPdf(pages: OrganizePageInput[], outputPath: string, workDir: string): Promise<void> {
  const assembledPath = path.join(workDir, "assembled.pdf");
  await assemblePages(
    pages.map((p) => ({ source: p.source, page: p.page })),
    assembledPath
  );
  const rotations = new Map<number, 90 | 180 | 270>();
  pages.forEach((p, idx) => {
    if (p.rotation !== 0) rotations.set(idx + 1, p.rotation);
  });
  await applyAbsoluteRotations(assembledPath, outputPath, rotations);
}

/** Stamps every page of stampPath onto the corresponding page of inputPath. Use `pages` to restrict the target pages. */
export async function overlayStamp(
  inputPath: string,
  stampPath: string,
  outputPath: string,
  pages: "all" | number[],
  repeatFirstPage = false
): Promise<void> {
  const args = [inputPath, "--overlay", stampPath];
  if (pages !== "all") args.push(`--to=${pages.join(",")}`);
  if (repeatFirstPage) args.push("--repeat=1");
  args.push("--", outputPath);
  await runCommand("qpdf", args);
}

/* --- Watermark image generation (text is rasterized so Unicode/RTL scripts render correctly) --- */

export async function convertToPngWithAlpha(inputPath: string, outputPngPath: string): Promise<void> {
  await runCommand("convert", [inputPath, "-alpha", "on", outputPngPath]);
}

export interface WatermarkTextRenderOptions {
  text: string;
  fontSize: number;
  color: string;
  /** Pre-rotation applied by ImageMagick so the embedded stamp needs no rotation math. */
  rotation: number;
}

export async function renderTextWatermarkPng(outputPngPath: string, opts: WatermarkTextRenderOptions): Promise<void> {
  const args = [
    "-background",
    "none",
    "-fill",
    opts.color,
    "-pointsize",
    String(Math.max(6, Math.round(opts.fontSize))),
    "-gravity",
    "center",
    `label:${opts.text}`,
  ];
  if (opts.rotation) {
    args.push("-rotate", String(((opts.rotation % 360) + 360) % 360 > 180 ? opts.rotation - 360 : opts.rotation));
  }
  args.push(outputPngPath);
  await runCommand("convert", args);
}

export async function readPngRaw(pngPath: string): Promise<{ width: number; height: number; rgb: Buffer; alpha: Buffer }> {
  const { stdout: dims } = await runCommand("identify", ["-format", "%w %h", pngPath]);
  const [width, height] = dims.trim().split(/\s+/).map(Number);
  const [rgb, alpha] = await Promise.all([
    runCommandBuffer("convert", [pngPath, "-alpha", "off", "-depth", "8", "RGB:-"]),
    runCommandBuffer("convert", [pngPath, "-alpha", "extract", "-depth", "8", "GRAY:-"]),
  ]);
  return { width, height, rgb, alpha };
}

export type WatermarkPosition =
  | "center"
  | "diagonal"
  | "tile"
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface StampPlacement {
  position: WatermarkPosition;
  /** 0-1 */
  opacity: number;
  /** Drawn width as a percentage of the page width (aspect ratio preserved). */
  scalePercent: number;
}

function computePlacements(
  position: WatermarkPosition,
  pageWidth: number,
  pageHeight: number,
  drawW: number,
  drawH: number,
  margin: number
): Array<[number, number, number, number]> {
  const rect = (cx: number, cy: number): [number, number, number, number] => [
    cx - drawW / 2,
    cy - drawH / 2,
    drawW,
    drawH,
  ];

  if (position === "tile") {
    const placements: Array<[number, number, number, number]> = [];
    const stepX = drawW * 1.6;
    const stepY = drawH * 2.2;
    let row = 0;
    for (let y = drawH / 2; y < pageHeight + drawH; y += stepY) {
      const offset = row % 2 === 0 ? 0 : stepX / 2;
      for (let x = drawW / 2 - offset; x < pageWidth + drawW; x += stepX) {
        placements.push(rect(x, y));
      }
      row++;
    }
    return placements;
  }

  const anchors: Record<Exclude<WatermarkPosition, "tile">, [number, number]> = {
    center: [pageWidth / 2, pageHeight / 2],
    diagonal: [pageWidth / 2, pageHeight / 2],
    "top-left": [margin + drawW / 2, pageHeight - margin - drawH / 2],
    "top-center": [pageWidth / 2, pageHeight - margin - drawH / 2],
    "top-right": [pageWidth - margin - drawW / 2, pageHeight - margin - drawH / 2],
    "bottom-left": [margin + drawW / 2, margin + drawH / 2],
    "bottom-center": [pageWidth / 2, margin + drawH / 2],
    "bottom-right": [pageWidth - margin - drawW / 2, margin + drawH / 2],
  };
  const [cx, cy] = anchors[position];
  return [rect(cx, cy)];
}

/** Embeds a (typically transparent) PNG as a repeatable one-page PDF stamp sized to the target page. */
export async function buildImageStampPdf(
  pngPath: string,
  pageWidth: number,
  pageHeight: number,
  placement: StampPlacement,
  outputPdfPath: string
): Promise<void> {
  const { width: pxW, height: pxH, rgb, alpha } = await readPngRaw(pngPath);
  const aspect = pxH / pxW;
  const drawW = Math.max(10, (pageWidth * placement.scalePercent) / 100);
  const drawH = drawW * aspect;
  const margin = Math.min(pageWidth, pageHeight) * 0.04;

  const writer = new PdfWriter();
  const catalogNum = writer.reserveObject();
  const pagesNum = writer.reserveObject();

  const smaskNum = writer.addStream(
    `<< /Type /XObject /Subtype /Image /Width ${pxW} /Height ${pxH} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode >>`,
    zlib.deflateSync(alpha)
  );
  const imgNum = writer.addStream(
    `<< /Type /XObject /Subtype /Image /Width ${pxW} /Height ${pxH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /SMask ${smaskNum} 0 R >>`,
    zlib.deflateSync(rgb)
  );
  const gsNum = writer.addObject(`<< /Type /ExtGState /ca ${placement.opacity} /CA ${placement.opacity} >>`);

  const placements = computePlacements(placement.position, pageWidth, pageHeight, drawW, drawH, margin);
  let content = "";
  for (const [x, y, w, h] of placements) {
    content += `q\n/GS1 gs\n${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im1 Do\nQ\n`;
  }

  const resourcesDict = `<< /XObject << /Im1 ${imgNum} 0 R >> /ExtGState << /GS1 ${gsNum} 0 R >> >>`;
  const contentNum = writer.addStream(`<< >>`, Buffer.from(content, "latin1"));
  const pageNum = writer.addObject(
    `<< /Type /Page /Parent ${pagesNum} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources ${resourcesDict} /Contents ${contentNum} 0 R >>`
  );

  writer.setObject(pagesNum, `<< /Type /Pages /Kids [${pageNum} 0 R] /Count 1 >>`);
  writer.setObject(catalogNum, `<< /Type /Catalog /Pages ${pagesNum} 0 R >>`);

  await writeFile(outputPdfPath, writer.serialize(catalogNum));
}

/* --- Page numbers: plain PDF text (native Helvetica, always crisp, no rasterization needed) --- */

export type PageNumberPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

export interface PageNumberOptions {
  format: "number" | "number-of-total";
  position: PageNumberPosition;
  fontSize: number;
  color: string;
  startAt: number;
}

function hexToRgbFractions(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return [Number.isNaN(r) ? 0 : r, Number.isNaN(g) ? 0 : g, Number.isNaN(b) ? 0 : b];
}

export async function buildPageNumberStampPdf(
  outputPdfPath: string,
  totalPages: number,
  pageWidth: number,
  pageHeight: number,
  opts: PageNumberOptions
): Promise<void> {
  const writer = new PdfWriter();
  const catalogNum = writer.reserveObject();
  const pagesNum = writer.reserveObject();
  const fontNum = writer.addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`);
  const [r, g, b] = hexToRgbFractions(opts.color);
  const margin = Math.min(pageWidth, pageHeight) * 0.035;
  const lastLabel = opts.startAt + totalPages - 1;

  const kids: number[] = [];
  for (let i = 0; i < totalPages; i++) {
    const n = opts.startAt + i;
    const label = opts.format === "number-of-total" ? `${n} / ${lastLabel}` : `${n}`;
    const approxWidth = label.length * opts.fontSize * 0.55;
    let x: number;
    let y: number;
    switch (opts.position) {
      case "top-left":
        x = margin;
        y = pageHeight - margin - opts.fontSize;
        break;
      case "top-right":
        x = pageWidth - margin - approxWidth;
        y = pageHeight - margin - opts.fontSize;
        break;
      case "top-center":
        x = (pageWidth - approxWidth) / 2;
        y = pageHeight - margin - opts.fontSize;
        break;
      case "bottom-left":
        x = margin;
        y = margin;
        break;
      case "bottom-right":
        x = pageWidth - margin - approxWidth;
        y = margin;
        break;
      case "bottom-center":
      default:
        x = (pageWidth - approxWidth) / 2;
        y = margin;
        break;
    }
    const content = `BT\n/F1 ${opts.fontSize} Tf\n${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg\n${x.toFixed(2)} ${y.toFixed(2)} Td\n(${escapePdfString(label)}) Tj\nET\n`;
    const resourcesDict = `<< /Font << /F1 ${fontNum} 0 R >> >>`;
    const contentNum = writer.addStream(`<< >>`, Buffer.from(content, "latin1"));
    const pageNum = writer.addObject(
      `<< /Type /Page /Parent ${pagesNum} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources ${resourcesDict} /Contents ${contentNum} 0 R >>`
    );
    kids.push(pageNum);
  }

  writer.setObject(pagesNum, `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(" ")}] /Count ${kids.length} >>`);
  writer.setObject(catalogNum, `<< /Type /Catalog /Pages ${pagesNum} 0 R >>`);

  await writeFile(outputPdfPath, writer.serialize(catalogNum));
}

/* ---------------------------------------------------------------------- */
/* Organize & watermark tool entry points                                 */
/* ---------------------------------------------------------------------- */

export interface OrganizePageSpec {
  /** 1-based original page number; 0 marks an inserted blank page. */
  pageNum: number;
  rotation: 0 | 90 | 180 | 270;
}

/** Reorders, deletes (by omission), duplicates (by repetition), and inserts blank pages, then applies per-page rotation. */
export async function organizePdf(
  inputPath: string,
  pages: OrganizePageSpec[],
  outputPath: string,
  workDir: string
): Promise<void> {
  if (pages.length === 0) {
    throw new Error("No pages to assemble");
  }
  let blankPath: string | null = null;
  const resolved: OrganizePageInput[] = [];
  for (const p of pages) {
    if (p.pageNum === 0) {
      if (!blankPath) {
        const info = await getPdfInfo(inputPath);
        blankPath = path.join(workDir, "blank.pdf");
        await createBlankPdfPage(blankPath, info.width, info.height);
      }
      resolved.push({ source: blankPath, page: 1, rotation: p.rotation });
    } else {
      resolved.push({ source: inputPath, page: p.pageNum, rotation: p.rotation });
    }
  }
  await buildOrganizedPdf(resolved, outputPath, workDir);
}

export interface TextWatermarkSpec {
  text: string;
  fontSize: number;
  color: string;
  /** 0-1 */
  opacity: number;
  rotation: number;
  position: WatermarkPosition;
  pages: "all" | number[];
}

export async function watermarkPdf(
  inputPath: string,
  outputPath: string,
  spec: TextWatermarkSpec,
  workDir: string
): Promise<void> {
  const info = await getPdfInfo(inputPath);
  const pngPath = path.join(workDir, "watermark.png");
  await renderTextWatermarkPng(pngPath, {
    text: spec.text,
    fontSize: spec.fontSize,
    color: spec.color,
    rotation: spec.position === "tile" ? 0 : spec.rotation,
  });
  const stampPath = path.join(workDir, "stamp.pdf");
  const scalePercent = spec.position === "tile" ? 30 : 40;
  await buildImageStampPdf(
    pngPath,
    info.width,
    info.height,
    { position: spec.position, opacity: spec.opacity, scalePercent },
    stampPath
  );
  await overlayStamp(inputPath, stampPath, outputPath, spec.pages, true);
}
