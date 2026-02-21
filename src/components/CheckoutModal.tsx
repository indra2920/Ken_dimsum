import { useState } from 'react';
import { Product } from '@/context/ProductContext';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrderContext';
import { useProducts } from '@/context/ProductContext';

interface CartItem extends Product {
    quantity: number;
}

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    total: number;
    onClearCart: () => void;
}

export default function CheckoutModal({ isOpen, onClose, cartItems, total, onClearCart }: CheckoutModalProps) {
    const { storeProfile } = useAuth();
    const { addOrder } = useOrders();
    const { products, updateStock } = useProducts(); // Get products and stock updater
    const [formData, setFormData] = useState({
        name: '',
        whatsapp: '',
        address: '',
        paymentMethod: 'Transfer Bank',
        deliveryMethod: 'delivery', // Default to delivery
        notes: ''
    });

    const [paymentProof, setPaymentProof] = useState<string>('');

    // Pre-calculate items by store for rendering payment info
    const itemsByStore: Record<string, CartItem[]> = {};
    cartItems.forEach(item => {
        if (!itemsByStore[item.storeId]) {
            itemsByStore[item.storeId] = [];
        }
        itemsByStore[item.storeId].push(item);
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // VALIDASI MANUAL
        if (!formData.name || !formData.whatsapp) {
            alert("Nama dan Nomor WhatsApp wajib diisi!");
            return;
        }

        if (formData.whatsapp.length < 9) {
            alert("Nomor WhatsApp tidak valid (minimal 10 digit)!");
            return;
        }

        if (formData.deliveryMethod === 'delivery' && !formData.address) {
            alert("Alamat wajib diisi untuk pengantaran!");
            return;
        }

        if ((formData.paymentMethod === 'Transfer Bank' || formData.paymentMethod === 'QRIS') && !paymentProof) {
            alert("Wajib upload bukti transfer untuk pembayaran Non-Tunai!");
            return;
        }

        // 0. Group items by storeId
        const itemsByStore: Record<string, CartItem[]> = {};
        cartItems.forEach(item => {
            if (!itemsByStore[item.storeId]) {
                itemsByStore[item.storeId] = [];
            }
            itemsByStore[item.storeId].push(item);
        });

        // 1. Stock Validation for each store
        for (const item of cartItems) {
            const product = products.find(p => p.id === item.id);
            if (!product) continue;
            if (product.stock < item.quantity) {
                alert(`Stok untuk ${item.name} tinggal ${product.stock}. Mohon kurangi jumlah pesanan.`);
                return;
            }
        }

        try {
            // 2. Process orders for each store
            const storeIds = Object.keys(itemsByStore);
            const createdOrders: any[] = [];

            for (const sId of storeIds) {
                const storeItems = itemsByStore[sId];
                const storeTotal = storeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const storeName = storeItems[0].storeName || 'Toko';

                // Save to In-App Order System (Modified to pass storeId explicitly)
                const res = await addOrder({
                    customerName: formData.name,
                    customerWhatsapp: formData.whatsapp,
                    tableNumber: formData.deliveryMethod === 'pickup' ? 'Ambil Sendiri' : formData.address,
                    items: storeItems,
                    total: storeTotal,
                    notes: formData.notes,
                    paymentMethod: formData.paymentMethod,
                    paymentProof: paymentProof,
                    deliveryMethod: formData.deliveryMethod as 'pickup' | 'delivery'
                }, sId);

                if (res) {
                    createdOrders.push(res);
                }

                // Reduce stock
                storeItems.forEach(item => {
                    const product = products.find(p => p.id === item.id);
                    if (product) {
                        const newStock = Math.max(0, product.stock - item.quantity);
                        updateStock(item.id, newStock);
                    }
                });

                // Prepare WhatsApp Message for this store
                const trackingUrl = res ? `${window.location.origin}/orders/${res.id}` : '';
                const message = `Halo ${storeName}, saya ingin pesan:
            
${storeItems.map(item => `- ${item.name} (${item.quantity}x) - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`).join('\n')}

Total: Rp ${storeTotal.toLocaleString('id-ID')}

${trackingUrl ? `Lacak Pesanan: ${trackingUrl}` : ''}

---------------------------
Data Pemesan:
Nama: ${formData.name}
WhatsApp: ${formData.whatsapp}
Metode: ${formData.deliveryMethod === 'pickup' ? 'Ambil di Resto' : 'Diantar ke Alamat'}
${formData.deliveryMethod === 'delivery' ? `Alamat: ${formData.address}` : ''}
Pembayaran: ${formData.paymentMethod}
Catatan: ${formData.notes || '-'}

Mohon diproses ya! Terima kasih.`;

                // User Feedback & Action (One by one for each store)
                if (confirm(`Pesanan untuk ${storeName} berhasil dibuat! \n\nKlik OK untuk mengirim konfirmasi ke WhatsApp ${storeName}.`)) {
                    const encodedMessage = encodeURIComponent(message);
                    // For the aggregator, we might not have the store's wa number in storeProfile.
                    // Ideally each product should have storeWhatsapp, but for now we'll use a placeholder or 
                    // we might need to fetch store details. 
                    // Let's assume for now we use the one from storeProfile if available, or just alert.
                    // IMPROVEMENT: Products in aggregator should ideally bring store detail.
                    alert("Membuka WhatsApp untuk " + storeName);
                    window.open(`https://wa.me/6281234567890?text=${encodedMessage}`, '_blank');
                }
            }

            onClearCart();
            onClose();

            // Final feedback with all tracking links
            const orderLinks = createdOrders.map(o => `- ${o.storeName || 'Toko'}: ${window.location.origin}/orders/${o.id}`).join('\n');
            alert(`Semua pesanan Anda telah berhasil dikirim!\n\nSimpan link pelacakan Anda:\n${orderLinks}`);
        } catch (error) {
            console.error("Multi-store checkout error:", error);
            alert("Terjadi kesalahan saat memproses pesanan Anda.");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validasi ukuran awal (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert("Ukuran file terlalu besar! Maksimal 10MB.");
                e.target.value = ''; // Reset input
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Canvas untuk resize
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Max dimensi (misal 800px) agar file kecil untuk localStorage
                    const MAX_DIMENSION = 800;

                    if (width > height) {
                        if (width > MAX_DIMENSION) {
                            height *= MAX_DIMENSION / width;
                            width = MAX_DIMENSION;
                        }
                    } else {
                        if (height > MAX_DIMENSION) {
                            width *= MAX_DIMENSION / height;
                            height = MAX_DIMENSION;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Kompresi ke JPEG kualitas 0.7
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    setPaymentProof(compressedDataUrl);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(26, 10, 10, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
        }}>
            <div className="card animate-fade-in-up" style={{
                background: 'white',
                padding: '40px',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-rich)', fontFamily: 'Playfair Display SC, serif' }}>Checkout Royale</h2>
                        <div style={{ height: '3px', width: '50px', background: 'var(--secondary-color)', marginTop: '8px', borderRadius: '2px' }}></div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#f5f5f5',
                            border: 'none',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-muted)'
                        }}
                    >&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-gold)', letterSpacing: '1px' }}>NAMA LENGKAP</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', background: '#fcfcfc', fontSize: '1rem' }}
                                placeholder="E.g. Ken Dimsum"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-gold)', letterSpacing: '1px' }}>WHATSAPP</label>
                            <input
                                required
                                type="tel"
                                value={formData.whatsapp}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (/^\d*$/.test(val)) {
                                        setFormData({ ...formData, whatsapp: val });
                                    }
                                }}
                                pattern="[0-9]*"
                                inputMode="numeric"
                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', background: '#fcfcfc', fontSize: '1rem' }}
                                placeholder="0812..."
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-gold)', letterSpacing: '1px' }}>METODE PENYAJIAN</label>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, deliveryMethod: 'delivery' })}
                                style={{
                                    flex: 1,
                                    padding: '16px',
                                    borderRadius: '16px',
                                    border: formData.deliveryMethod === 'delivery' ? '2px solid var(--primary-color)' : '1px solid #eee',
                                    background: formData.deliveryMethod === 'delivery' ? '#fff5f5' : 'white',
                                    fontWeight: formData.deliveryMethod === 'delivery' ? '800' : '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>🛵</span>
                                <span>Antar ke Alamat</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, deliveryMethod: 'pickup' })}
                                style={{
                                    flex: 1,
                                    padding: '16px',
                                    borderRadius: '16px',
                                    border: formData.deliveryMethod === 'pickup' ? '2px solid var(--primary-color)' : '1px solid #eee',
                                    background: formData.deliveryMethod === 'pickup' ? '#fff5f5' : 'white',
                                    fontWeight: formData.deliveryMethod === 'pickup' ? '800' : '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>🛍️</span>
                                <span>Ambil di Resto</span>
                            </button>
                        </div>
                    </div>

                    {formData.deliveryMethod === 'delivery' && (
                        <div className="animate-fade-in-up">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-gold)', letterSpacing: '1px' }}>ALAMAT PENGIRIMAN</label>
                            <textarea
                                required
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', background: '#fcfcfc', fontSize: '1rem', minHeight: '100px' }}
                                placeholder="Detail alamat lengkap Anda..."
                            />
                        </div>
                    )}

                    <div style={{ background: 'var(--bg-creamy)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                        <label style={{ display: 'block', marginBottom: '16px', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-gold)', letterSpacing: '1px' }}>PEMBAYARAN ROYAL</label>
                        <select
                            value={formData.paymentMethod}
                            onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '12px',
                                border: '1px solid var(--gold-border)',
                                fontSize: '1rem',
                                background: 'white',
                                marginBottom: '20px',
                                fontWeight: '600',
                                color: 'var(--primary-dark)'
                            }}
                        >
                            {(storeProfile?.paymentMethods || ['Tunai', 'Transfer Bank', 'QRIS']).map(method => (
                                <option key={method} value={method}>{method}</option>
                            ))}
                        </select>

                        {(formData.paymentMethod === 'Transfer Bank' || formData.paymentMethod === 'QRIS') && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {Object.keys(itemsByStore).map(sId => {
                                    const storeItems = itemsByStore[sId];
                                    const storeName = storeItems[0].storeName || 'Toko';
                                    const bankAccount = storeItems[0].bankAccount;
                                    const qrisImage = storeItems[0].qrisImage;

                                    return (
                                        <div key={sId} style={{
                                            background: 'white',
                                            padding: '20px',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(0,0,0,0.05)',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                                        }}>
                                            <p style={{ margin: '0 0 12px 0', fontWeight: '800', color: 'var(--primary-color)', fontSize: '0.9rem', borderBottom: '1px solid #f5f5f5', paddingBottom: '8px' }}>
                                                {storeName.toUpperCase()}
                                            </p>

                                            {formData.paymentMethod === 'Transfer Bank' && (
                                                <div>
                                                    <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>VIRTUAL ACCOUNT / BANK:</p>
                                                    <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-rich)', border: '1px dashed var(--gold-border)' }}>
                                                        {bankAccount || 'Hubungi admin di WhatsApp'}
                                                    </div>
                                                </div>
                                            )}

                                            {formData.paymentMethod === 'QRIS' && (
                                                <div style={{ textAlign: 'center' }}>
                                                    {qrisImage ? (
                                                        <img
                                                            src={qrisImage}
                                                            alt={`QRIS ${storeName}`}
                                                            style={{ width: '100%', maxWidth: '220px', borderRadius: '12px', border: '4px solid white', boxShadow: '0 5px 20px rgba(0,0,0,0.1)', padding: '10px', background: 'white' }}
                                                        />
                                                    ) : (
                                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>QRIS segera hadir.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-rich)' }}>UPLOAD BUKTI PEMBAYARAN <span style={{ color: 'red' }}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            required
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '2px dashed var(--gold-border)',
                                                borderRadius: '12px',
                                                background: 'white',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>
                                    {paymentProof && (
                                        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <img src={paymentProof} alt="Proof" style={{ height: '50px', width: '50px', objectFit: 'cover', borderRadius: '8px', border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                                            <span style={{ fontSize: '0.85rem', color: '#27ae60', fontWeight: '700' }}>✓ Bukti Terunggah</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-gold)', letterSpacing: '1px' }}>CATATAN (OPTIONAL)</label>
                        <input
                            type="text"
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', background: '#fcfcfc', fontSize: '1rem' }}
                            placeholder="Contoh: Sangat pedas, atau jangan pakai kecap..."
                        />
                    </div>

                    <div style={{ marginTop: '20px', borderTop: '2px solid #f5f5f5', paddingTop: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Pembayaran:</span>
                            <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary-color)' }}>
                                <span style={{ fontSize: '1.2rem', marginRight: '4px' }}>Rp</span>
                                {total.toLocaleString('id-ID')}
                            </span>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary btn-hover-scale"
                            style={{
                                width: '100%',
                                padding: '20px',
                                fontSize: '1.2rem',
                                borderRadius: '18px',
                                boxShadow: '0 15px 35px rgba(128, 0, 0, 0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px'
                            }}
                        >
                            <span>KONFIRMASI PESANAN</span>
                            <span style={{ fontSize: '1.5rem' }}>🚀</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
