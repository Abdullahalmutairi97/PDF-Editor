import { NextResponse } from "next/server";
import { readStoredFileBuffer } from "@/lib/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;
  const result = await readStoredFileBuffer(fileId).catch(() => null);

  if (!result) {
    return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
  }

  const { buffer, file } = result;
  const asciiFallback = file.filename.replace(/[^\x20-\x7E]/g, "_");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
      "Content-Length": String(file.size),
      "Cache-Control": "no-store",
    },
  });
}
