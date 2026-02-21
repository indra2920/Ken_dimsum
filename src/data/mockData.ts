export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string; // Placeholder or emoji for now
  description: string;
  stock: number;
}

export const products: Product[] = [
  { id: '1', name: 'Siomay Ayam', price: 15000, category: 'Kukus', image: 'https://placehold.co/400x300/f8f9fa/212529?text=Siomay+Ayam', description: 'Siomay ayam klasik dengan bumbu kacang', stock: 50 },
  { id: '2', name: 'Hakau Udang', price: 18000, category: 'Kukus', image: 'https://placehold.co/400x300/f8f9fa/212529?text=Hakau+Udang', description: 'Pangsit udang kristal yang lembut', stock: 30 },
  { id: '3', name: 'Lumpia Kulit Tahu', price: 16000, category: 'Goreng', image: 'https://placehold.co/400x300/f8f9fa/212529?text=Lumpia+Kulit+Tahu', description: 'Lumpia kulit tahu goreng renyah', stock: 40 },
  { id: '4', name: 'Ceker Ayam', price: 15000, category: 'Kukus', image: 'https://placehold.co/400x300/f8f9fa/212529?text=Ceker+Ayam', description: 'Ceker ayam merah empuk', stock: 25 },
  { id: '5', name: 'Bakpao Pasir Emas', price: 12000, category: 'Kukus', image: 'https://placehold.co/400x300/f8f9fa/212529?text=Bakpao+Pasir+Emas', description: 'Bakpao isi telur asin cair meleleh', stock: 20 },
  { id: '6', name: 'Onde-Onde', price: 5000, category: 'Goreng', image: 'https://placehold.co/400x300/f8f9fa/212529?text=Onde-Onde', description: 'Bola wijen isi kacang hijau manis', stock: 40 },
  { id: '7', name: 'Es Teh Manis', price: 5000, category: 'Minuman', image: 'https://placehold.co/400x300/f8f9fa/212529?text=Es+Teh+Manis', description: 'Teh manis dingin segar', stock: 100 },
  { id: '8', name: 'Liang Teh', price: 8000, category: 'Minuman', image: 'https://placehold.co/400x300/f8f9fa/212529?text=Liang+Teh', description: 'Teh herbal segar untuk kesehatan', stock: 50 },
];
