import { PrismaClient } from "@prisma/client";

declare global {
  var __minHonPrisma__: PrismaClient | undefined;
}

export const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

let prismaInitError: Error | null = null;

function createPrismaClient() {
  if (!hasDatabaseUrl) {
    return null;
  }

  try {
    return (
      globalThis.__minHonPrisma__ ??
      new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      })
    );
  } catch (error) {
    prismaInitError =
      error instanceof Error ? error : new Error("Unable to initialize Prisma client.");
    return null;
  }
}

export const prisma = createPrismaClient();

if (prisma && process.env.NODE_ENV !== "production") {
  globalThis.__minHonPrisma__ = prisma;
}

export function isDatabaseAvailable() {
  return Boolean(prisma);
}

export function getDatabaseUnavailableMessage(feature = "database-backed features") {
  if (!hasDatabaseUrl) {
    return `${feature} are running in fallback mode because DATABASE_URL is not configured.`;
  }

  return `${feature} are unavailable because Prisma could not initialize${
    prismaInitError?.message ? `: ${prismaInitError.message}` : "."
  }`;
}
