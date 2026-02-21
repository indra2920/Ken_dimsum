import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient() {
    const url = process.env.DATABASE_URL;

    // During build, DATABASE_URL might be missing. 
    // We must NOT return a standard PrismaClient() if the schema has no URL, 
    // as it will crash looking for a datasource.
    if (!url) {
        if (process.env.NODE_ENV === 'production') {
            console.log('Skipping Prisma initialization during build (no DATABASE_URL)');
        }
        return null as unknown as PrismaClient;
    }

    try {
        const adapter = new PrismaNeon({
            connectionString: url,
        });
        return new PrismaClient({ adapter } as any);
    } catch (error) {
        console.error('Failed to create Prisma Neon adapter:', error);
        return null as unknown as PrismaClient;
    }
}

export const prisma: PrismaClient =
    globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
