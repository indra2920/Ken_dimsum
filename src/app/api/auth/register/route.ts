import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            storeName,
            ownerName,
            password,
            address,
            whatsapp,
            bankAccount,
            qrisImage,
            paymentMethods
        } = body;

        // Check if store name already exists
        const existingStore = await prisma.store.findUnique({
            where: { storeName }
        });

        if (existingStore) {
            return NextResponse.json({ error: 'Nama toko sudah terdaftar' }, { status: 400 });
        }

        const store = await prisma.store.create({
            data: {
                storeName,
                ownerName,
                password,
                address: address || '',
                whatsapp: whatsapp || '',
                bankAccount: bankAccount || '',
                qrisImage: qrisImage || null,
                paymentMethods: paymentMethods || ["Tunai"],
            },
        });

        return NextResponse.json(store);
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Failed to register store' }, { status: 500 });
    }
}
