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
    } catch (error: any) {
        console.error('List stores error details:', error);
        return NextResponse.json({
            error: 'Failed to fetch stores',
            details: error.message
        }, { status: 500 });
    }
}
