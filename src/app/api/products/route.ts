import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET all products (optionally filtered by store)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const storeId = searchParams.get('storeId');

        let products;
        if (storeId) {
            products = await prisma.product.findMany({
                where: { storeId },
                include: { store: { select: { storeName: true } } }
            });
        } else {
            // Aggregator mode: fetch all products from all stores
            products = await prisma.product.findMany({
                include: { store: { select: { storeName: true } } }
            });
        }

        // Flatten storeName into product object for easier frontend use
        const formattedProducts = products.map(p => ({
            ...p,
            storeName: p.store.storeName
        }));

        return NextResponse.json(formattedProducts);
    } catch (error) {
        console.error('Fetch products error:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

// POST create new product
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { storeId, ...data } = body;

        if (!storeId) {
            return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                name: data.name,
                price: parseFloat(data.price),
                category: data.category,
                image: data.image,
                description: data.description,
                stock: parseInt(data.stock),
                storeId: storeId,
            },
        });
        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Create product error:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
