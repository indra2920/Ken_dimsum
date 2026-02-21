import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined | null;
};

function createPrismaClient() {
    const url = process.env.DATABASE_URL;

    if (!url) {
        // Return null instead of throwing to let the module load during build
        return null;
    }

    try {
        const adapter = new PrismaNeon({
            connectionString: url,
        });
        const client = new PrismaClient({ adapter } as any);

        if (process.env.NODE_ENV !== 'production') {
            globalForPrisma.prisma = client;
        }

        return client;
    } catch (error: any) {
        console.error('Failed to create Prisma Neon adapter:', error);
        return null;
    }
}

// Super-Safe Proxy: Prevents both build-time crashes and runtime "null" errors
export const prisma = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        // Initialize once on first access
        if (globalForPrisma.prisma === undefined) {
            globalForPrisma.prisma = createPrismaClient();
        }

        const client = globalForPrisma.prisma;

        if (!client) {
            // Return a dummy proxy for any property access if DB URL is missing
            return new Proxy({}, {
                get: () => {
                    return () => {
                        throw new Error(
                            'Database Error: DATABASE_URL tidak ditemukan di Vercel. ' +
                            'Pastikan Anda sudah menyalin variabel environment dari Dashboard Neon ke Dashboard Vercel.'
                        );
                    };
                }
            });
        }

        return (client as any)[prop];
    }
});
