import { readdir, rm, stat } from "fs/promises";
import path from "path";
import { STORAGE_ROOT } from "./storage";

const ONE_HOUR_MS = 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000;

export async function cleanupOldFiles(maxAgeMs: number = ONE_HOUR_MS): Promise<number> {
  let removed = 0;
  let entries: string[];
  try {
    entries = await readdir(STORAGE_ROOT);
  } catch {
    return 0;
  }

  const now = Date.now();
  await Promise.all(
    entries.map(async (entry) => {
      const dirPath = path.join(STORAGE_ROOT, entry);
      try {
        const stats = await stat(dirPath);
        if (now - stats.mtimeMs > maxAgeMs) {
          await rm(dirPath, { recursive: true, force: true });
          removed += 1;
        }
      } catch {
        // Directory may have been removed concurrently; ignore.
      }
    })
  );

  return removed;
}

let intervalStarted = false;

export function startCleanupInterval(): void {
  if (intervalStarted) return;
  intervalStarted = true;
  setInterval(() => {
    cleanupOldFiles().catch(() => {
      // Best-effort cleanup; failures are silently ignored.
    });
  }, CLEANUP_INTERVAL_MS);
  cleanupOldFiles().catch(() => {});
}
