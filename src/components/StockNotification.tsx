'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import Link from 'next/link';

export default function StockNotification() {
    const { isLoggedIn } = useAuth();
    const { lowStockAlerts } = useProducts();
    const [isVisible, setIsVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        if (lowStockAlerts.length > 0 && isLoggedIn && !dismissed) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [lowStockAlerts, isLoggedIn, dismissed]);

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            borderLeft: '6px solid #ff9800', // Orange for warning
            padding: '16px',
            zIndex: 9998, // Slightly lower than order notification
            width: '320px',
            animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#f57c00' }}>⚠️ Stok Menipis!</h4>
                <button
                    onClick={() => { setIsVisible(false); setDismissed(true); }}
                    style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#999' }}
                >
                    &times;
                </button>
            </div>

            <div style={{ marginBottom: '12px', maxHeight: '150px', overflowY: 'auto' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#666' }}>
                    Beberapa produk memiliki stok di bawah 10:
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#333' }}>
                    {lowStockAlerts.map(product => (
                        <li key={product.id} style={{ marginBottom: '4px' }}>
                            <strong>{product.name}</strong>: {product.stock}
                        </li>
                    ))}
                </ul>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                    href="/admin"
                    style={{
                        flex: 1,
                        background: '#ff9800',
                        color: 'white',
                        padding: '8px',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        textDecoration: 'none'
                    }}
                    onClick={() => {
                        // Optional: maybe verify if we are already on admin page, but link handles it
                    }}
                >
                    Kelola Stok
                </Link>
            </div>

            <style jsx>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
