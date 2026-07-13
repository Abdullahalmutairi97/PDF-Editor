import path from "path";
import zlib from "zlib";
import { writeFile } from "fs/promises";
import { runCommand } from "./exec";
import { PdfWriter } from "./pdfWriter";
import { assemblePages, createBlankPdfPage, getPdfInfo, readPngRaw, type PageSpec } from "./pdf";

export type AnnotationType = "text" | "pen" | "highlight" | "rectangle" | "line" | "arrow" | "signature";

export interface AnnotationPoint {
  x: number;
  y: number;
}

export interface Annotation {
  id: string;
  type: AnnotationType;
  /** 1-based page number */
  page: number;
  /** percentage of page width (0-100) */
  x: number;
  /** percentage of page height (0-100) */
  y: number;
  /** percentage of page width */
  width: number;
  /** percentage of page height */
  height: number;
  color: string;
  /** 0-1 */
  opacity: number;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
  /** percentage-of-page points, used by the pen/line/arrow tools */
  points?: AnnotationPoint[];
  /** base64 data URL PNG, used by the signature tool */
  dataUrl?: string;
}

/** Pixels-per-point used to rasterize the annotation overlay (matches the 150 DPI used elsewhere for page thumbnails). */
const RENDER_SCALE = 150 / 72;

function pixelDimensions(pageWidthPt: number, pageHeightPt: number): { pxW: number; pxH: number } {
  return {
    pxW: Math.max(1, Math.round(pageWidthPt * RENDER_SCALE)),
    pxH: Math.max(1, Math.round(pageHeightPt * RENDER_SCALE)),
  };
}

function pct(value: number, dimension: number): number {
  return (value / 100) * dimension;
}

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function clampOpacity(opacity: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(opacity) ? opacity : 1));
}

function renderAnnotationsSvg(annotations: Annotation[], pxW: number, pxH: number): string {
  const parts: string[] = [];

  for (const ann of annotations) {
    const opacity = clampOpacity(ann.opacity);
    const color = ann.color || "#000000";
    const strokeWidth = Math.max(0.5, (ann.strokeWidth ?? 2) * RENDER_SCALE);

    switch (ann.type) {
      case "text": {
        if (!ann.text) break;
        const x = pct(ann.x, pxW);
        const y = pct(ann.y, pxH);
        const fontSize = Math.max(4, (ann.fontSize ?? 16) * RENDER_SCALE);
        const lines = ann.text.split("\n");
        const lineParts = lines
          .map(
            (line, i) =>
              `<tspan x="${x.toFixed(2)}" dy="${i === 0 ? "0" : `${(fontSize * 1.2).toFixed(2)}`}">${escapeXml(line)}</tspan>`
          )
          .join("");
        parts.push(
          `<text x="${x.toFixed(2)}" y="${(y + fontSize * 0.85).toFixed(2)}" font-family="'Noto Sans Arabic', 'Arial', sans-serif" font-size="${fontSize.toFixed(2)}" fill="${color}" opacity="${opacity}">${lineParts}</text>`
        );
        break;
      }
      case "pen": {
        const points = ann.points ?? [];
        if (points.length < 2) break;
        const pointsAttr = points.map((p) => `${pct(p.x, pxW).toFixed(2)},${pct(p.y, pxH).toFixed(2)}`).join(" ");
        parts.push(
          `<polyline points="${pointsAttr}" fill="none" stroke="${color}" stroke-width="${strokeWidth.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}" />`
        );
        break;
      }
      case "highlight": {
        const x = pct(ann.x, pxW);
        const y = pct(ann.y, pxH);
        const w = pct(ann.width, pxW);
        const h = pct(ann.height, pxH);
        parts.push(
          `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" fill="${color}" opacity="${opacity}" />`
        );
        break;
      }
      case "rectangle": {
        const x = pct(ann.x, pxW);
        const y = pct(ann.y, pxH);
        const w = pct(ann.width, pxW);
        const h = pct(ann.height, pxH);
        parts.push(
          `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" fill="none" stroke="${color}" stroke-width="${strokeWidth.toFixed(2)}" opacity="${opacity}" />`
        );
        break;
      }
      case "line":
      case "arrow": {
        const points = ann.points ?? [];
        const [p1, p2] =
          points.length >= 2
            ? points
            : [
                { x: ann.x, y: ann.y },
                { x: ann.x + ann.width, y: ann.y + ann.height },
              ];
        const x1 = pct(p1.x, pxW);
        const y1 = pct(p1.y, pxH);
        const x2 = pct(p2.x, pxW);
        const y2 = pct(p2.y, pxH);
        parts.push(
          `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${color}" stroke-width="${strokeWidth.toFixed(2)}" stroke-linecap="round" opacity="${opacity}" />`
        );
        if (ann.type === "arrow") {
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const headLen = Math.max(10, strokeWidth * 4);
          const a1x = x2 - headLen * Math.cos(angle - Math.PI / 6);
          const a1y = y2 - headLen * Math.sin(angle - Math.PI / 6);
          const a2x = x2 - headLen * Math.cos(angle + Math.PI / 6);
          const a2y = y2 - headLen * Math.sin(angle + Math.PI / 6);
          parts.push(
            `<polygon points="${x2.toFixed(2)},${y2.toFixed(2)} ${a1x.toFixed(2)},${a1y.toFixed(2)} ${a2x.toFixed(2)},${a2y.toFixed(2)}" fill="${color}" opacity="${opacity}" />`
          );
        }
        break;
      }
      // signature annotations are rasterized separately and composited onto the canvas PNG.
      case "signature":
        break;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxH}" viewBox="0 0 ${pxW} ${pxH}">${parts.join("")}</svg>`;
}

async function rasterizeAnnotations(
  pageAnnotations: Annotation[],
  pxW: number,
  pxH: number,
  workDir: string,
  pageIndex: number
): Promise<string> {
  const vectorAnnotations = pageAnnotations.filter((a) => a.type !== "signature");
  const signatureAnnotations = pageAnnotations.filter((a) => a.type === "signature" && a.dataUrl);

  const svg = renderAnnotationsSvg(vectorAnnotations, pxW, pxH);
  const svgPath = path.join(workDir, `overlay-${pageIndex}.svg`);
  await writeFile(svgPath, svg, "utf-8");

  let pngPath = path.join(workDir, `overlay-${pageIndex}.png`);
  await runCommand("convert", ["-background", "none", svgPath, "-alpha", "on", pngPath]);

  for (let i = 0; i < signatureAnnotations.length; i++) {
    const ann = signatureAnnotations[i];
    const base64 = (ann.dataUrl as string).replace(/^data:image\/\w+;base64,/, "");
    const sigRawPath = path.join(workDir, `overlay-${pageIndex}-sig-${i}-raw.png`);
    await writeFile(sigRawPath, Buffer.from(base64, "base64"));

    const sw = Math.max(1, Math.round(pct(ann.width, pxW)));
    const sh = Math.max(1, Math.round(pct(ann.height, pxH)));
    const sx = Math.round(pct(ann.x, pxW));
    const sy = Math.round(pct(ann.y, pxH));

    const sigResizedPath = path.join(workDir, `overlay-${pageIndex}-sig-${i}-resized.png`);
    await runCommand("convert", [sigRawPath, "-resize", `${sw}x${sh}!`, sigResizedPath]);

    const composedPath = path.join(workDir, `overlay-${pageIndex}-composed-${i}.png`);
    await runCommand("convert", [pngPath, sigResizedPath, "-geometry", `+${sx}+${sy}`, "-composite", composedPath]);
    pngPath = composedPath;
  }

  return pngPath;
}

/** Embeds a full-page transparent PNG as a single-page PDF stamp, stretched to exactly cover the page. */
async function buildFullPageStamp(pngPath: string, pageWidth: number, pageHeight: number, outputPdfPath: string): Promise<void> {
  const { width: pxW, height: pxH, rgb, alpha } = await readPngRaw(pngPath);

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

  const content = `q\n${pageWidth.toFixed(2)} 0 0 ${pageHeight.toFixed(2)} 0 0 cm\n/Im1 Do\nQ\n`;
  const resourcesDict = `<< /XObject << /Im1 ${imgNum} 0 R >> >>`;
  const contentNum = writer.addStream(`<< >>`, Buffer.from(content, "latin1"));
  const pageNum = writer.addObject(
    `<< /Type /Page /Parent ${pagesNum} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources ${resourcesDict} /Contents ${contentNum} 0 R >>`
  );

  writer.setObject(pagesNum, `<< /Type /Pages /Kids [${pageNum} 0 R] /Count 1 >>`);
  writer.setObject(catalogNum, `<< /Type /Catalog /Pages ${pagesNum} 0 R >>`);

  await writeFile(outputPdfPath, writer.serialize(catalogNum));
}

/**
 * Builds a full-document overlay PDF (one output page per source page) from a flat list of
 * annotations. Pages without annotations get a genuinely blank stamp page so the overlay's page
 * count always matches the source PDF, which lets qpdf's 1:1 page overlay merge it directly.
 */
export async function generateAnnotationOverlay(
  annotations: Annotation[],
  originalPdfPath: string,
  outputOverlayPath: string,
  workDir: string
): Promise<void> {
  const info = await getPdfInfo(originalPdfPath);
  const { pxW, pxH } = pixelDimensions(info.width, info.height);

  const blankPath = path.join(workDir, "overlay-blank.pdf");
  await createBlankPdfPage(blankPath, info.width, info.height);

  const byPage = new Map<number, Annotation[]>();
  for (const ann of annotations) {
    if (!byPage.has(ann.page)) byPage.set(ann.page, []);
    byPage.get(ann.page)!.push(ann);
  }

  const specs: PageSpec[] = [];
  for (let page = 1; page <= info.pageCount; page++) {
    const pageAnnotations = byPage.get(page);
    if (!pageAnnotations || pageAnnotations.length === 0) {
      specs.push({ source: blankPath, page: 1 });
      continue;
    }
    const pngPath = await rasterizeAnnotations(pageAnnotations, pxW, pxH, workDir, page);
    const stampPath = path.join(workDir, `overlay-page-${page}.pdf`);
    await buildFullPageStamp(pngPath, info.width, info.height, stampPath);
    specs.push({ source: stampPath, page: 1 });
  }

  await assemblePages(specs, outputOverlayPath);
}
