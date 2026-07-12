import { NextRequest, NextResponse } from "next/server";
import { MAX_UPLOAD_SIZE_BYTES, saveBuffer } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ success: false, error: "No files provided" }, { status: 400 });
  }

  const results = [];

  for (const file of files) {
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: `File ${file.name} exceeds the maximum allowed size` },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await saveBuffer(buffer, file.name);
    results.push({
      fileId: stored.fileId,
      originalName: file.name,
      size: stored.size,
      mimeType: stored.mimeType,
    });
  }

  return NextResponse.json({ success: true, files: results });
}
