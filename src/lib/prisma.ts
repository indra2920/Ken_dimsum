import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * Creates a new Prisma client with the Neon adapter.
 * Only called when actually needed during runtime.
 */
function createPrismaClient() {
    const url = process.env.DATABASE_URL;

    if (!url) {
        throw new Error(
            'Koneksi database (DATABASE_URL) tidak ditemukan. ' +
            'Pastikan Environment Variables sudah terpasang di Vercel.'
        );
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
        console.error('Gagal inisialisasi Prisma Neon:', error);
        throw new Error(`Gagal menghubungkan ke database: ${error.message}`);
    }
}

// Export a Proxy that initializes the real Prisma client on first access.
// This prevents build-time errors while allowing runtime functionality.
export const prisma = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        if (!globalForPrisma.prisma) {
            globalForPrisma.prisma = createPrismaClient();
        }
        return (globalForPrisma.prisma as any)[prop];
    }
});
