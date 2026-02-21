'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface OrderDetail {
    id: string;
    customerName: string;
    status: string;
    total: number;
    items: any[];
    createdAt: string;
    paymentMethod: string;
    deliveryMethod: string;
    tableNumber: string;
    store: {
        storeName: string;
        whatsapp: string;
    };
}

export default function OrderTrackingPage() {
    const { id } = useParams();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${id}`);
            if (!res.ok) throw new Error('Order tidak ditemukan');
            const data = await res.json();
            setOrder(data);
            setError('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
        // Poll for updates every 15 seconds
        const interval = setInterval(fetchOrder, 15000);
        return () => clearInterval(interval);
    }, [id]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '15px', background: 'var(--bg-creamy)' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary-color)', borderRadius: '50%' }}></div>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: 'var(--primary-dark)' }}>Menyiapkan status pesanan Anda...</p>
        </div>
    );

    if (error || !order) return (
        <div style={{ padding: '80px 40px', textAlign: 'center', minHeight: '100vh', background: 'var(--bg-creamy)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🥟</div>
            <h2 style={{ color: 'var(--primary-color)', fontFamily: 'Playfair Display SC, serif' }}>⚠️ {error || 'Pesanan tidak ditemukan'}</h2>
            <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Pastikan ID pesanan benar atau hubungi toko kami.</p>
            <Link href="/" className="btn btn-primary" style={{ marginTop: '30px', display: 'inline-block', padding: '12px 30px' }}>Kembali ke Beranda</Link>
        </div>
    );

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'BARU': return '⏳';
            case 'DIPROSES': return '👨‍🍳';
            case 'SELESAI': return '✨';
            case 'BATAL': return '❌';
            default: return '❓';
        }
    };

    return (
        <div style={{
            maxWidth: '700px',
            margin: '0 auto',
            padding: '40px 20px',
            minHeight: '100vh',
            background: 'var(--bg-creamy)',
            display: 'flex',
            flexDirection: 'column',
            gap: '30px'
        }}>
            <div className="card animate-fade-in-up" style={{
                background: 'white',
                borderRadius: '24px',
                padding: '40px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
                border: '1px solid rgba(212, 175, 55, 0.15)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        display: 'inline-block',
                        background: 'var(--bg-creamy)',
                        padding: '10px 20px',
                        borderRadius: '50px',
                        marginBottom: '16px',
                        border: '1px solid var(--gold-border)'
                    }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-gold)', fontWeight: '800', letterSpacing: '2px' }}>LACAK PESANAN</span>
                    </div>
                    <h1 style={{
                        color: 'var(--primary-dark)',
                        margin: '0 0 10px 0',
                        fontFamily: 'Playfair Display SC, serif',
                        fontSize: '2.2rem'
                    }}>Status Hidangan Anda</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>ID Referensi: {order.id.slice(-8).toUpperCase()}</p>
                </div>

                <div style={{
                    background: order.status === 'BATAL' ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : 'linear-gradient(135deg, var(--primary-dark), var(--primary-color))',
                    color: 'white',
                    padding: '40px 30px',
                    borderRadius: '24px',
                    textAlign: 'center',
                    marginBottom: '40px',
                    boxShadow: '0 15px 35px rgba(128, 0, 0, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '-20px',
                        right: '-20px',
                        fontSize: '8rem',
                        opacity: 0.1,
                        transform: 'rotate(-15deg)'
                    }}>🥟</div>

                    <div style={{
                        fontSize: '4rem',
                        marginBottom: '15px',
                        filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))'
                    }}>{getStatusIcon(order.status)}</div>

                    <h2 style={{
                        margin: '0 0 10px 0',
                        fontSize: '2rem',
                        fontWeight: '900',
                        fontFamily: 'Outfit, sans-serif',
                        letterSpacing: '1px'
                    }}>{order.status}</h2>

                    <p style={{
                        margin: 0,
                        opacity: 0.95,
                        fontSize: '1.1rem',
                        fontWeight: '500',
                        maxWidth: '300px',
                        margin: '0 auto'
                    }}>
                        {order.status === 'BARU' && 'Menunggu konfirmasi dapur kami...'}
                        {order.status === 'DIPROSES' && 'Chef kami sedang menyiapkan keajaiban...'}
                        {order.status === 'SELESAI' && 'Hidangan siap dinikmati. Selamat makan!'}
                        {order.status === 'BATAL' && 'Maaf, pesanan ini tidak dapat dilanjutkan.'}
                    </p>
                </div>

                <div style={{ padding: '0 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ height: '1px', flex: 1, background: '#eee' }}></div>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-gold)', fontWeight: '800', letterSpacing: '2px', margin: 0 }}>Rincian Menu</h3>
                        <div style={{ height: '1px', flex: 1, background: '#eee' }}></div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {order.items.map((item: any, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingBottom: '16px',
                                borderBottom: '1px solid #f9f9f9'
                            }}>
                                <div>
                                    <p style={{ margin: '0 0 4px 0', fontWeight: '700', color: 'var(--text-rich)' }}>{item.name}</p>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                                        {item.quantity} Servings &times; Rp {item.price.toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <p style={{ margin: 0, fontWeight: '800', color: 'var(--text-rich)' }}>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        marginTop: '30px',
                        background: 'var(--bg-creamy)',
                        padding: '24px',
                        borderRadius: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid rgba(212, 175, 55, 0.1)'
                    }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-muted)' }}>Investasi Rasa:</span>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary-color)' }}>
                                <span style={{ fontSize: '1rem', marginRight: '4px' }}>Rp</span>
                                {order.total.toLocaleString('id-ID')}
                            </span>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-gold)', fontWeight: '700' }}>{order.paymentMethod}</p>
                        </div>
                    </div>
                </div>

                <div style={{
                    marginTop: '40px',
                    background: 'white',
                    padding: '24px',
                    borderRadius: '20px',
                    border: '2px solid #f8f8f8',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Lokasi Toko</span>
                        <span style={{ fontWeight: '700', color: 'var(--primary-dark)' }}>🏰 {order.store.storeName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Metode</span>
                        <span style={{ fontWeight: '700' }}>{order.deliveryMethod === 'pickup' ? '🛍️ Ambil di Resto' : '🛵 Diantar Kurir'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tujuan</span>
                        <span style={{ fontWeight: '700', maxWidth: '200px', textAlign: 'right' }}>{order.tableNumber}</span>
                    </div>
                </div>

                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <Link href="/" className="btn btn-secondary btn-hover-scale" style={{
                        padding: '16px 40px',
                        borderRadius: '50px',
                        textDecoration: 'none',
                        background: 'white',
                        color: 'var(--primary-dark)',
                        fontWeight: '700',
                        border: '2px solid var(--primary-dark)',
                        display: 'inline-block'
                    }}>
                        KEMBALI KE BERANDA
                    </Link>
                </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                <span className="animate-pulse">●</span> Diperbarui secara otomatis setiap 15 detik
            </p>
        </div>
    );
}
