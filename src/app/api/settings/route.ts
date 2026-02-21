import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET store settings
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const storeId = searchParams.get('storeId');

        if (!storeId) {
            return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
        }

        const store = await prisma.store.findUnique({
            where: { id: storeId }
        });

        if (!store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        return NextResponse.json(store);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// PUT update store settings
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { storeId, ...data } = body;

        if (!storeId) {
            return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
        }

        const settings = await prisma.store.update({
            where: { id: storeId },
            data: {
                storeName: data.storeName,
                ownerName: data.ownerName,
                address: data.address,
                whatsapp: data.whatsapp,
                bankAccount: data.bankAccount,
                qrisImage: data.qrisImage,
                paymentMethods: data.paymentMethods,
                ...(data.password ? { password: data.password } : {}),
            },
        });
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
