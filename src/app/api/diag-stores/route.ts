import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const stores = await prisma.store.findMany({
            select: {
                storeName: true,
                ownerName: true,
                createdAt: true
            }
        });
        return NextResponse.json(stores);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
