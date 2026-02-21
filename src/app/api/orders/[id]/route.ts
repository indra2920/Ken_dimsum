import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT update order status
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { storeId, status } = body;

        if (!storeId) {
            return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
        }

        const order = await prisma.order.update({
            where: { id, storeId },
            data: { status: status },
        });
        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
