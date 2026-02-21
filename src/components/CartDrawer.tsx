'use client';

import { Product } from '@/context/ProductContext';

interface CartItem extends Product {
    quantity: number;
}

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    onUpdateQuantity: (id: string, delta: number) => void;
    onCheckout: () => void;
}

export default function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onCheckout }: CartDrawerProps) {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            maxWidth: 'min(400px, 100vw)',
            background: 'var(--background-color)',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid var(--border-color)'
        }}>
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Keranjang Belanja</h2>
                <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                {cartItems.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🛒</div>
                        <p>Keranjang belanja Anda masih kosong.</p>
                        <button
                            onClick={onClose}
                            className="btn btn-primary"
                            style={{ marginTop: '24px' }}
                        >
                            Mulai Belanja
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {cartItems.map(item => (
                            <div key={item.id} style={{ display: 'flex', gap: '16px', background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {(item.image?.startsWith('data:') || item.image?.startsWith('http')) ? (
                                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '2rem' }}>{item.image}</span>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>{item.name}</h4>
                                    <p style={{ margin: '0 0 12px 0', color: 'var(--primary-color)', fontWeight: 'bold' }}>Rp {item.price.toLocaleString('id-ID')}</p>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <button
                                            onClick={() => onUpdateQuantity(item.id, -1)}
                                            style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        >-</button>
                                        <span style={{ fontWeight: 500, width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                        <button
                                            onClick={() => onUpdateQuantity(item.id, 1)}
                                            style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--primary-color)', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        >+</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
                <div style={{ padding: '24px', background: 'white', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Total Pesanan</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)' }}>Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                    <button
                        onClick={onCheckout}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
                    >
                        Checkout via WhatsApp
                    </button>
                </div>
            )}
        </div>
    );
}
