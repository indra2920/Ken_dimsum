import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET store settings
export async function GET() {
    try {
        let settings = await prisma.settings.findUnique({ where: { id: 'store' } });
        if (!settings) {
            // Create default settings if they don't exist
            settings = await prisma.settings.create({
                data: {
                    id: 'store',
                    storeName: 'Ken Dimsum',
                    ownerName: 'Owner',
                    address: 'Jl. Contoh No. 123',
                    whatsapp: '6281234567890',
                    bankAccount: 'BCA 1234567890 a.n Ken Dimsum',
                    password: 'admin123',
                },
            });
        }
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// PUT update store settings
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const settings = await prisma.settings.upsert({
            where: { id: 'store' },
            update: {
                storeName: body.storeName,
                ownerName: body.ownerName,
                address: body.address,
                whatsapp: body.whatsapp,
                bankAccount: body.bankAccount,
                ...(body.password ? { password: body.password } : {}),
            },
            create: {
                id: 'store',
                storeName: body.storeName,
                ownerName: body.ownerName,
                address: body.address,
                whatsapp: body.whatsapp,
                bankAccount: body.bankAccount,
                password: body.password ?? 'admin123',
            },
        });
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
