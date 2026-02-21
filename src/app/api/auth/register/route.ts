import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
    } catch (error: any) {
        console.error('Registration error details:', error);

        // Handle Prisma specific errors (like unique constraint)
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Nama toko sudah digunakan. Silakan gunakan nama lain.' }, { status: 400 });
        }

        return NextResponse.json({
            error: 'Gagal dalam proses database',
            details: error.message
        }, { status: 500 });
    }
}
