import { NextRequest, NextResponse } from "next/server";
import { mkdir, readdir } from "fs/promises";
import { getStoredFile, getThumbsDir } from "@/lib/storage";
import { getPdfInfo, pdfToImages } from "@/lib/processing/pdf";

export interface PdfPreviewPage {
  pageNum: number;
  thumbUrl: string;
}

export async function POST(request: NextRequest) {
  let body: { fileId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const fileId = body.fileId;
  if (!fileId) {
    return NextResponse.json({ success: false, error: "Missing fileId" }, { status: 400 });
  }

  try {
    const file = await getStoredFile(fileId);
    if (!file) {
      return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
    }

    const info = await getPdfInfo(file.filePath);
    const thumbsDir = await getThumbsDir(fileId);
    await mkdir(thumbsDir, { recursive: true });

    const existing = (await readdir(thumbsDir).catch(() => [])).filter((name) => name.endsWith(".jpg"));
    if (existing.length !== info.pageCount) {
      await pdfToImages(file.filePath, thumbsDir, 150, "jpeg");
    }

    const pages: PdfPreviewPage[] = Array.from({ length: info.pageCount }, (_, i) => ({
      pageNum: i + 1,
      thumbUrl: `/api/pdf/thumb/${fileId}/${i + 1}`,
    }));

    return NextResponse.json({
      success: true,
      pageCount: info.pageCount,
      width: info.width,
      height: info.height,
      pages,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate page previews";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
