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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '15px' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary-color)', borderRadius: '50%' }}></div>
            <p>Memuat status pesanan...</p>
        </div>
    );

    if (error || !order) return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2 style={{ color: 'red' }}>⚠️ {error || 'Pesanan tidak ditemukan'}</h2>
            <p style={{ marginTop: '10px' }}>Pastikan ID pesanan benar atau hubungi toko.</p>
            <Link href="/" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>Kembali ke Beranda</Link>
        </div>
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'BARU': return '#f39c12';
            case 'DIPROSES': return '#3498db';
            case 'SELESAI': return '#2ecc71';
            case 'BATAL': return '#e74c3c';
            default: return '#7f8c8d';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'BARU': return '⏳';
            case 'DIPROSES': return '🍳';
            case 'SELESAI': return '✅';
            case 'BATAL': return '❌';
            default: return '❓';
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', minHeight: '100vh', background: '#f8f9fa' }}>
            <div style={{ background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: 'var(--primary-color)', margin: '0 0 5px 0' }}>Lacak Pesanan</h1>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>ID: {order.id}</p>
                </div>

                <div style={{
                    background: getStatusColor(order.status),
                    color: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    marginBottom: '30px',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{getStatusIcon(order.status)}</div>
                    <h2 style={{ margin: '0 0 5px 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{order.status}</h2>
                    <p style={{ margin: 0, opacity: 0.9 }}>
                        {order.status === 'BARU' && 'Menunggu konfirmasi penjual...'}
                        {order.status === 'DIPROSES' && 'Pesanan sedang disiapkan...'}
                        {order.status === 'SELESAI' && 'Pesanan sudah siap dinikmati!'}
                        {order.status === 'BATAL' && 'Maaf, pesanan telah dibatalkan.'}
                    </p>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', fontWeight: '600' }}>Detail Pesanan:</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {order.items.map((item: any, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: '500' }}>{item.name}</p>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{item.quantity}x @ Rp {item.price.toLocaleString('id-ID')}</p>
                                </div>
                                <p style={{ margin: 0, fontWeight: '600' }}>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '20px', borderTop: '2px solid #f8f9fa', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Total Bayar:</span>
                        <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary-color)' }}>
                            Rp {order.total.toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>

                <div style={{ marginTop: '30px', background: '#fff9f0', padding: '15px', borderRadius: '10px', border: '1px dashed #ffd8a8' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                        <span>🏪</span>
                        <span style={{ fontWeight: '600' }}>{order.store.storeName}</span>
                    </div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#666' }}>
                        Metode: {order.deliveryMethod === 'pickup' ? 'Ambil di Resto' : 'Antar ke Alamat'}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                        Tujuan: {order.tableNumber}
                    </p>
                </div>

                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <Link href="/" className="btn btn-secondary" style={{ padding: '12px 25px', borderRadius: '30px', textDecoration: 'none', background: '#eee', color: '#333' }}>
                        🏠 Kembali ke Menu
                    </Link>
                </div>
            </div>

            <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '0.8rem', color: '#999' }}>
                Halaman ini diperbarui otomatis setiap 15 detik.
            </p>
        </div>
    );
}
