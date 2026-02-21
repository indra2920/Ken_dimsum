import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient() {
    const url = process.env.DATABASE_URL;

    if (!url) {
        console.error('DATABASE_URL is not defined in environment variables');
        return new PrismaClient(); // Fallback to standard client which will likely fail but prevents crash during init
    }

    try {
        const adapter = new PrismaNeon({
            connectionString: url,
        });
        return new PrismaClient({ adapter } as any);
    } catch (error) {
        console.error('Failed to create Prisma Neon adapter:', error);
        return new PrismaClient();
    }
}

export const prisma: PrismaClient =
    globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
