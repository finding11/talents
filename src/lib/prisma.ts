import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function normalizeDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("channel_binding");
    return parsed.toString();
  } catch {
    return url.replace(/([?&])channel_binding=[^&]*&?/g, "$1").replace(/[?&]$/, "");
  }
}

function readDatabaseUrl(): string {
  let url: string | undefined;

  try {
    const workerEnv = getCloudflareContext().env as { DATABASE_URL?: string };
    if (typeof workerEnv.DATABASE_URL === "string") {
      url = workerEnv.DATABASE_URL;
    }
  } catch {
    // Build step or dev without worker context.
  }

  url ??= process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  process.env.DATABASE_URL ??= url;
  return normalizeDatabaseUrl(url);
}

function createPrismaClient(): PrismaClient {
  const connectionString = readDatabaseUrl();

  neonConfig.fetchFunction = fetch;

  const adapter = new PrismaNeonHTTP(connectionString, {});

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/** Lazy singleton — avoids requiring DATABASE_URL during Next.js build. */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
