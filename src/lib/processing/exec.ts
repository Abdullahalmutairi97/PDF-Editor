import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export class ProcessingError extends Error {}

export async function runCommand(command: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      maxBuffer: 1024 * 1024 * 100,
    });
    return { stdout, stderr };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ProcessingError(`Command failed: ${command} — ${message}`);
  }
}
