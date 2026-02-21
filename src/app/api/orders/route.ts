import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET all orders by store
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const storeId = searchParams.get('storeId');

        if (!storeId) {
            return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
        }

        const orders = await prisma.order.findMany({
            where: { storeId },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

// POST create new order
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { storeId, ...data } = body;

        if (!storeId) {
            return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
        }

        const order = await prisma.order.create({
            data: {
                customerName: data.customerName,
                customerWhatsapp: data.customerWhatsapp,
                tableNumber: data.tableNumber,
                items: data.items,
                total: data.total,
                status: 'BARU',
                notes: data.notes ?? null,
                paymentMethod: data.paymentMethod,
                paymentProof: data.paymentProof ?? null,
                deliveryMethod: data.deliveryMethod,
                storeId: storeId,
            },
        });
        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
