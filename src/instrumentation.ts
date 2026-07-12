export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startCleanupInterval } = await import("./lib/cleanup");
    startCleanupInterval();
  }
}
