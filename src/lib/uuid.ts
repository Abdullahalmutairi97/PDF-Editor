/** Generate a UUID v4 without requiring crypto.randomUUID (works over HTTP) */
export function generateUUID(): string {
  // Prefer crypto.randomUUID if available (HTTPS)
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // fall through to polyfill
    }
  }
  // RFC 4122 v4 UUID polyfill
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}