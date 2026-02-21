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
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(26, 10, 10, 0.4)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 1000,
                        transition: 'opacity 0.3s ease'
                    }}
                />
            )}

            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                maxWidth: 'min(450px, 100vw)',
                background: 'white',
                boxShadow: '-10px 0 40px rgba(0,0,0,0.15)',
                transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                zIndex: 1001,
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '30px 24px',
                    background: 'var(--primary-dark)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{
                        fontSize: '1.6rem',
                        margin: 0,
                        fontFamily: 'Playfair Display SC, serif',
                        color: 'var(--secondary-color)',
                        letterSpacing: '1px'
                    }}>KERANJANG SAYA</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >&times;</button>
                </div>

                {/* Items */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--bg-creamy)' }}>
                    {cartItems.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '60px' }}>
                            <div style={{ fontSize: '5rem', marginBottom: '24px', opacity: 0.3 }}>🥡</div>
                            <h3 style={{ fontFamily: 'Playfair Display SC, serif', color: 'var(--text-rich)' }}>Kosong Bagai Langit</h3>
                            <p style={{ maxWidth: '250px', margin: '12px auto' }}>Mulailah petualangan rasa Anda dengan memilih menu andalan kami.</p>
                            <button
                                onClick={onClose}
                                className="btn btn-primary"
                                style={{ marginTop: '32px', padding: '12px 30px' }}
                            >
                                JELAJAHI MENU
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {cartItems.map(item => (
                                <div key={item.id} className="card-hover-bright" style={{
                                    display: 'flex',
                                    gap: '16px',
                                    background: 'white',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(212, 175, 55, 0.15)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                                }}>
                                    <div style={{
                                        width: '90px',
                                        height: '90px',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        background: '#fcfcfc',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid rgba(0,0,0,0.05)'
                                    }}>
                                        {(item.image?.startsWith('data:') || item.image?.startsWith('http')) ? (
                                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ fontSize: '2.5rem' }}>{item.image}</span>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <h4 style={{
                                            margin: '0 0 4px 0',
                                            fontSize: '1.1rem',
                                            color: 'var(--text-rich)',
                                            fontFamily: 'Outfit, sans-serif',
                                            fontWeight: 600
                                        }}>{item.name}</h4>
                                        <p style={{
                                            margin: '0 0 14px 0',
                                            color: 'var(--primary-color)',
                                            fontWeight: '800',
                                            fontSize: '1rem'
                                        }}>Rp {item.price.toLocaleString('id-ID')}</p>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '14px',
                                                background: '#f8f8f8',
                                                padding: '4px 8px',
                                                borderRadius: '50px',
                                                border: '1px solid #eee'
                                            }}>
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, -1)}
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '50%',
                                                        border: 'none',
                                                        background: 'white',
                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        fontSize: '1.2rem',
                                                        color: 'var(--text-rich)'
                                                    }}
                                                >-</button>
                                                <span style={{ fontWeight: 700, width: '20px', textAlign: 'center', fontSize: '0.9rem' }}>{item.quantity}</span>
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, 1)}
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '50%',
                                                        border: 'none',
                                                        background: 'var(--primary-color)',
                                                        color: 'white',
                                                        boxShadow: '0 2px 10px rgba(128,0,0,0.2)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        fontSize: '1.2rem'
                                                    }}
                                                >+</button>
                                            </div>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                Sub: Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div style={{
                        padding: '30px 24px',
                        background: 'white',
                        borderTop: '1px solid rgba(212, 175, 55, 0.1)',
                        boxShadow: '0 -10px 30px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Total Estimasi</span>
                                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                                    <span style={{ fontSize: '1rem', marginRight: '4px' }}>Rp</span>
                                    {total.toLocaleString('id-ID')}
                                </span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-gold)', fontWeight: 800, letterSpacing: '1px' }}>
                                {cartItems.reduce((s, i) => s + i.quantity, 0)} ITEMS
                            </span>
                        </div>
                        <button
                            onClick={onCheckout}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: '20px',
                                fontSize: '1.1rem',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px'
                            }}
                        >
                            <span style={{ fontSize: '1.4rem' }}>📱</span>
                            PESAN VIA WHATSAPP
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '16px' }}>
                            *Pesanan Anda akan diteruskan langsung ke WhatsApp Toko.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
