import { PrismaClient } from '@prisma/client';
import { localPrisma } from './local-db';

const storageMode = process.env.EHR_STORAGE_MODE ?? (process.env.DATABASE_URL ? 'postgres' : 'local');
export const isLocalDataMode = storageMode !== 'postgres';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  localPrisma: typeof localPrisma | undefined;
};

const prismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient;
  globalForPrisma.localPrisma = localPrisma;
}

export const prisma = isLocalDataMode ? (globalForPrisma.localPrisma ?? localPrisma) : prismaClient;

export async function resetPrismaConnection() {
  if (!isLocalDataMode && globalForPrisma.prisma) {
    await globalForPrisma.prisma.$disconnect();
    globalForPrisma.prisma = undefined;
  }
}
