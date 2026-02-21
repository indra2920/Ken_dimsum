import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all products by store
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const storeId = searchParams.get('storeId');

        if (!storeId) {
            // If no storeId, return empty or all? For multi-tenant, we usually want to be strict.
            // But for the customer page, we might need a way to find a store.
            // Let's return all for now if no storeId, but the plan says filter.
            return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
        }

        const products = await prisma.product.findMany({
            where: { storeId }
        });
        return NextResponse.json(products);
    } catch (error) {
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
