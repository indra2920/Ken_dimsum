import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const initialProducts = [
    { name: 'Siomay Ayam', price: 15000, category: 'Kukus', image: 'https://placehold.co/400x300/f8f9fa/212529?text=Siomay+Ayam', description: 'Siomay ayam klasik dengan bumbu kacang', stock: 50 },
    { name: 'Hakau Udang', price: 18000, category: 'Kukus', image: 'https://placehold.co/400x300/f8f9fa/212529?text=Hakau+Udang', description: 'Pangsit udang kristal yang lembut', stock: 30 },
    { name: 'Lumpia Kulit Tahu', price: 16000, category: 'Goreng', image: 'https://placehold.co/400x300/f8f9fa/212529?text=Lumpia+Kulit+Tahu', description: 'Lumpia kulit tahu goreng renyah', stock: 40 },
    { name: 'Ceker Ayam', price: 15000, category: 'Kukus', image: 'https://placehold.co/400x300/f8f9fa/212529?text=Ceker+Ayam', description: 'Ceker ayam merah empuk', stock: 25 },
    { name: 'Bakpao Pasir Emas', price: 12000, category: 'Kukus', image: 'https://placehold.co/400x300/f8f9fa/212529?text=Bakpao+Pasir+Emas', description: 'Bakpao isi telur asin cair meleleh', stock: 20 },
    { name: 'Onde-Onde', price: 5000, category: 'Goreng', image: 'https://placehold.co/400x300/f8f9fa/212529?text=Onde-Onde', description: 'Bola wijen isi kacang hijau manis', stock: 40 },
    { name: 'Es Teh Manis', price: 5000, category: 'Minuman', image: 'https://placehold.co/400x300/f8f9fa/212529?text=Es+Teh+Manis', description: 'Teh manis dingin segar', stock: 100 },
    { name: 'Liang Teh', price: 8000, category: 'Minuman', image: 'https://placehold.co/400x300/f8f9fa/212529?text=Liang+Teh', description: 'Teh herbal segar untuk kesehatan', stock: 50 },
];

// POST - seed initial product data
export async function POST() {
    try {
        const count = await prisma.product.count();
        if (count > 0) {
            return NextResponse.json({ message: `Database already has ${count} products. Skipping seed.` });
        }
        await prisma.product.createMany({ data: initialProducts });
        return NextResponse.json({ message: `Seeded ${initialProducts.length} products successfully.` });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 });
    }
}
