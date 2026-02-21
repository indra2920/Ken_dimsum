import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const stores = await prisma.store.findMany({
            select: {
                id: true,
                storeName: true,
                ownerName: true,
            }
        });
        return NextResponse.json(stores);
    } catch (error) {
        console.error('List stores error:', error);
        return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
    }
}
