import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all orders
export async function GET() {
    try {
        const orders = await prisma.order.findMany({
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
        const order = await prisma.order.create({
            data: {
                customerName: body.customerName,
                customerWhatsapp: body.customerWhatsapp,
                tableNumber: body.tableNumber,
                items: body.items,
                total: body.total,
                status: 'BARU',
                notes: body.notes ?? null,
                paymentMethod: body.paymentMethod,
                paymentProof: body.paymentProof ?? null,
                deliveryMethod: body.deliveryMethod,
            },
        });
        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
