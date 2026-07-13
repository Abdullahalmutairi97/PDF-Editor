import { NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { getThumbsDir } from "@/lib/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ fileId: string; page: string }> }) {
  const { fileId, page } = await params;
  const pageNum = parseInt(page, 10);
  if (!Number.isFinite(pageNum) || pageNum < 1) {
    return NextResponse.json({ success: false, error: "Invalid page number" }, { status: 400 });
  }

  try {
    const thumbsDir = await getThumbsDir(fileId);
    const entries = (await readdir(thumbsDir))
      .filter((name) => name.endsWith(".jpg"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const filename = entries[pageNum - 1];
    if (!filename) {
      return NextResponse.json({ success: false, error: "Thumbnail not found" }, { status: 404 });
    }

    const buffer = await readFile(path.join(thumbsDir, filename));
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Thumbnail not found" }, { status: 404 });
  }
}
