import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { storeName: rawStoreName, password } = body;
        const storeName = rawStoreName?.trim();

        // Find store by name (case-insensitive search would be better, but prisma findUnique is case sensitive for string IDs/uniques)
        // Using findFirst for case-insensitive simulation or just strict check for now
        const store = await prisma.store.findFirst({
            where: {
                storeName: {
                    equals: storeName,
                    mode: 'insensitive'
                }
            }
        });

        if (!store || store.password !== password) {
            return NextResponse.json({ error: 'Nama toko atau password salah' }, { status: 401 });
        }

        return NextResponse.json(store);
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
    }
}
