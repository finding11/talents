import { getCloudflareContext } from "@opennextjs/cloudflare";

export function readRuntimeEnv(key: string): string | undefined {
  try {
    const workerEnv = getCloudflareContext().env as Record<string, unknown>;
    const value = workerEnv[key];
    if (typeof value === "string" && value.length > 0) {
      process.env[key] ??= value;
      return value;
    }
  } catch {
    // Build step or local dev without worker context.
  }

  const fromProcess = process.env[key];
  if (typeof fromProcess === "string" && fromProcess.length > 0) return fromProcess;
  return undefined;
}

export function requireRuntimeEnv(key: string): string {
  const value = readRuntimeEnv(key);
  if (!value) throw new Error(`${key} is not set`);
  return value;
}
