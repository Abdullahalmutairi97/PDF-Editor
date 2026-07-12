import { randomUUID } from "crypto";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "fs/promises";
import path from "path";

export const STORAGE_ROOT = process.env.ARABITOOLS_TMP_DIR || "/tmp/arabitools";

export const MAX_UPLOAD_SIZE_BYTES = Number(process.env.ARABITOOLS_MAX_UPLOAD_MB || 25) * 1024 * 1024;

const EXTENSION_MIME_MAP: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".zip": "application/zip",
  ".txt": "text/plain",
  ".json": "application/json",
};

export function mimeForFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return EXTENSION_MIME_MAP[ext] || "application/octet-stream";
}

async function ensureStorageRoot(): Promise<void> {
  await mkdir(STORAGE_ROOT, { recursive: true });
}

function sanitizeFilename(name: string): string {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._؀-ۿ-]/g, "_");
  return base.length > 0 ? base : "file";
}

export interface StoredFile {
  fileId: string;
  filename: string;
  filePath: string;
  size: number;
  mimeType: string;
}

/**
 * Every stored file (uploaded or generated) lives in its own directory named
 * after its fileId, containing exactly one file. This keeps the original
 * filename/extension intact without needing a separate metadata store.
 */
export async function saveBuffer(buffer: Buffer, originalName: string): Promise<StoredFile> {
  await ensureStorageRoot();
  const fileId = randomUUID();
  const dir = path.join(STORAGE_ROOT, fileId);
  await mkdir(dir, { recursive: true });
  const filename = sanitizeFilename(originalName);
  const filePath = path.join(dir, filename);
  await writeFile(filePath, buffer);
  return {
    fileId,
    filename,
    filePath,
    size: buffer.length,
    mimeType: mimeForFilename(filename),
  };
}

export async function getFileDir(fileId: string): Promise<string> {
  if (!/^[0-9a-f-]{36}$/i.test(fileId)) {
    throw new Error("Invalid file id");
  }
  return path.join(STORAGE_ROOT, fileId);
}

export async function getStoredFile(fileId: string): Promise<StoredFile | null> {
  const dir = await getFileDir(fileId);
  try {
    const entries = await readdir(dir);
    if (entries.length === 0) return null;
    const filename = entries[0];
    const filePath = path.join(dir, filename);
    const stats = await stat(filePath);
    return {
      fileId,
      filename,
      filePath,
      size: stats.size,
      mimeType: mimeForFilename(filename),
    };
  } catch {
    return null;
  }
}

export async function readStoredFileBuffer(fileId: string): Promise<{ buffer: Buffer; file: StoredFile } | null> {
  const file = await getStoredFile(fileId);
  if (!file) return null;
  const buffer = await readFile(file.filePath);
  return { buffer, file };
}

export async function removeStoredFile(fileId: string): Promise<void> {
  const dir = await getFileDir(fileId);
  await rm(dir, { recursive: true, force: true });
}

export function downloadUrlFor(fileId: string): string {
  return `/api/download/${fileId}`;
}

/** Creates a fresh empty directory for a tool run's intermediate/output files, outside the fileId scheme. */
export async function createWorkDir(): Promise<string> {
  await ensureStorageRoot();
  const dir = path.join(STORAGE_ROOT, `work-${randomUUID()}`);
  await mkdir(dir, { recursive: true });
  return dir;
}
