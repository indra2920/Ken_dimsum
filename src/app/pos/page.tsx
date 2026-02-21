'use client';

import { useState, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/context/ProductContext';
import { useProducts } from '@/context/ProductContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface CartItem extends Product {
    quantity: number;
}

export default function POSPage() {
    const { products } = useProducts();
    const { isLoggedIn } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    if (!isLoggedIn) {
        return (
            <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                <h1>Akses Ditolak</h1>
                <p>Anda harus login sebagai pemilik toko untuk mengakses halaman ini.</p>
                <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Kembali ke Beranda</Link>
            </div>
        );
    }

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        }));
    };

    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Left Side: Product Grid */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: 'var(--background-color)' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                        <span style={{ fontSize: '1.5rem' }}>⬅</span> Kembali
                    </Link>
                    <input
                        type="text"
                        placeholder="Cari produk..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: '1px solid #ccc',
                            width: '300px'
                        }}
                    />
                </header>

                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {filteredProducts.map(product => (
                        <div key={product.id} onClick={() => addToCart(product)} style={{ cursor: 'pointer' }}>
                            <ProductCard product={product} onAddToCart={() => { }} />
                            {/* Reusing ProductCard but disabling its internal button logic largely since we wrap it in a click handler, 
                   or we can pass addToCart. Actually passing addToCart is better ux for the button.
                   But for POS, often clicking the whole card adds it. 
                   Let's just pass addToCart to the card.
               */}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side: Cart / Order Summary */}
            <div style={{
                width: '400px',
                background: 'white',
                borderLeft: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-4px 0 10px rgba(0,0,0,0.05)'
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--primary-color)', color: 'white' }}>
                    <h2 style={{ margin: 0 }}>Pesanan</h2>
                    <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Order #{Math.floor(Math.random() * 10000)}</p>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>
                            <div style={{ fontSize: '3rem' }}>🛒</div>
                            <p>Belum ada item</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {cart.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid #eee' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#666' }}>Rp {item.price.toLocaleString()}</div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >-</button>
                                        <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >+</button>
                                    </div>

                                    <div style={{ fontWeight: 600, minWidth: '70px', textAlign: 'right' }}>
                                        Rp {(item.price * item.quantity).toLocaleString()}
                                    </div>

                                    <button onClick={() => removeFromCart(item.id)} style={{ color: 'red', marginLeft: '0.5rem' }}>&times;</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', background: '#f9f9f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Subtotal</span>
                        <span>Rp {subtotal.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#666' }}>
                        <span>Pajak (10%)</span>
                        <span>Rp {tax.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--primary-color)' }}>Rp {total.toLocaleString()}</span>
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                        Bayar / Checkout
                    </button>
                </div>
            </div>
        </div>
    );
}
