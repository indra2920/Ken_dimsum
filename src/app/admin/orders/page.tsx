'use client';

import { useAuth } from '@/context/AuthContext';
import { useOrders, Order } from '@/context/OrderContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminOrdersPage() {
    const { isLoggedIn } = useAuth();
    const { orders, updateOrderStatus, clearAlert } = useOrders();
    const [filter, setFilter] = useState<'ALL' | 'BARU' | 'DIPROSES' | 'SELESAI'>('ALL');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Sort orders: Newest first
    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const filteredOrders = filter === 'ALL'
        ? sortedOrders
        : sortedOrders.filter(o => o.status === filter);

    useEffect(() => {
        // Clear alert when visiting this page
        clearAlert();
    }, [clearAlert]);

    if (!isLoggedIn) {
        return (
            <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                <h1>Akses Ditolak</h1>
                <p>Anda harus login sebagai pemilik toko.</p>
                <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Kembali ke Beranda</Link>
            </div>
        );
    }

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'BARU': return '#ffc107'; // Yellow/Orange
            case 'DIPROSES': return '#17a2b8'; // Blue
            case 'SELESAI': return '#28a745'; // Green
            case 'BATAL': return '#dc3545'; // Red
            default: return '#6c757d';
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem' }}>Daftar Pesanan</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Kelola pesanan masuk secara real-time</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/admin" className="btn btn-secondary">Kelola Produk</Link>
                    <Link href="/" className="btn btn-secondary">Ke Toko</Link>
                </div>
            </header>

            {/* Metrics Cards */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--primary-color)' }}>
                        {orders.filter(o => o.status === 'BARU').length}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Pesanan Baru</p>
                </div>
                <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2.5rem', margin: 0, color: '#17a2b8' }}>
                        {orders.filter(o => o.status === 'DIPROSES').length}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Sedang Diproses</p>
                </div>
                <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2.5rem', margin: 0, color: '#28a745' }}>
                        {orders.filter(o => o.status === 'SELESAI').length}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Selesai Hari Ini</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {['ALL', 'BARU', 'DIPROSES', 'SELESAI'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '50px',
                            border: filter === f ? 'none' : '1px solid var(--border-color)',
                            background: filter === f ? 'var(--primary-color)' : 'white',
                            color: filter === f ? 'white' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        {f === 'ALL' ? 'Semua' : f.charAt(0) + f.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {filteredOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface-color)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Belum ada pesanan.</p>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.id} className="card" style={{ padding: '0', overflow: 'hidden', borderLeft: `6px solid ${getStatusColor(order.status)}` }}>
                            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', background: 'rgba(0,0,0,0.02)' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <h3 style={{ margin: 0 }}>{order.customerName}</h3>
                                        <span style={{ fontSize: '0.9rem', color: '#666' }}>({order.customerWhatsapp})</span>
                                        <span style={{
                                            background: getStatusColor(order.status),
                                            color: 'white',
                                            padding: '4px 12px',
                                            borderRadius: '50px',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                                        {/* Display logic for delivery method */}
                                        {order.deliveryMethod === 'pickup' ? (
                                            <span style={{ color: '#28a745', fontWeight: 'bold' }}>🛍️ Ambil di Resto</span>
                                        ) : (
                                            <span>🛵 {order.tableNumber}</span> // tableNumber now holds address for delivery
                                        )}
                                        &nbsp;&bull; {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} &bull; {order.paymentMethod}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                        Rp {order.total.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                                            <span>{item.quantity}x {item.name}</span>
                                            <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                        </div>
                                    ))}
                                </div>

                                {order.notes && (
                                    <div style={{ background: '#fff3cd', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', color: '#856404' }}>
                                        <strong>Catatan:</strong> {order.notes}
                                    </div>
                                )}

                                {order.paymentProof && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Bukti Transfer:</p>
                                        <div
                                            style={{
                                                maxWidth: '200px',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                cursor: 'zoom-in',
                                                position: 'relative'
                                            }}
                                            onClick={() => setSelectedImage(order.paymentProof!)}
                                        >
                                            <img
                                                src={order.paymentProof}
                                                alt="Bukti Transfer"
                                                style={{ width: '100%', display: 'block' }}
                                            />
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                background: 'rgba(0,0,0,0.6)',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                padding: '4px',
                                                textAlign: 'center'
                                            }}>
                                                Klik untuk memperbesar
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                    {order.status === 'BARU' && (
                                        <button
                                            className="btn"
                                            style={{ background: '#17a2b8', color: 'white' }}
                                            onClick={() => updateOrderStatus(order.id, 'DIPROSES')}
                                        >
                                            Terima Pesanan (Proses)
                                        </button>
                                    )}
                                    {order.status === 'DIPROSES' && (
                                        <button
                                            className="btn"
                                            style={{ background: '#28a745', color: 'white' }}
                                            onClick={() => updateOrderStatus(order.id, 'SELESAI')}
                                        >
                                            Selesai
                                        </button>
                                    )}
                                    {(order.status === 'BARU' || order.status === 'DIPROSES') && (
                                        <button
                                            className="btn"
                                            style={{ background: '#dc3545', color: 'white' }}
                                            onClick={() => {
                                                if (confirm('Batalkan pesanan ini?')) updateOrderStatus(order.id, 'BATAL');
                                            }}
                                        >
                                            Tolak / Batal
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Image Modal (Lightbox) */}
            {selectedImage && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        zIndex: 3000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        cursor: 'zoom-out'
                    }}
                    onClick={() => setSelectedImage(null)}
                >
                    <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%' }}>
                        <img
                            src={selectedImage}
                            alt="Bukti Transfer Full"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '90vh',
                                objectFit: 'contain',
                                borderRadius: '8px',
                                boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                            }}
                        />
                        <button
                            onClick={() => setSelectedImage(null)}
                            style={{
                                position: 'absolute',
                                top: '-40px',
                                right: '0',
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontSize: '2rem',
                                cursor: 'pointer'
                            }}
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
