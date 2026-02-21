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

            for (const sId of storeIds) {
                const storeItems = itemsByStore[sId];
                const storeTotal = storeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const storeName = storeItems[0].storeName || 'Toko';

                // Save to In-App Order System (Modified to pass storeId explicitly)
                await addOrder({
                    customerName: formData.name,
                    customerWhatsapp: formData.whatsapp,
                    tableNumber: formData.deliveryMethod === 'pickup' ? 'Ambil Sendiri' : formData.address,
                    items: storeItems,
                    total: storeTotal,
                    notes: formData.notes,
                    paymentMethod: formData.paymentMethod,
                    paymentProof: paymentProof,
                    deliveryMethod: formData.deliveryMethod as 'pickup' | 'delivery'
                }, sId); // Passing storeId as second argument

                // Reduce stock
                storeItems.forEach(item => {
                    const product = products.find(p => p.id === item.id);
                    if (product) {
                        const newStock = Math.max(0, product.stock - item.quantity);
                        updateStock(item.id, newStock);
                    }
                });

                // Prepare WhatsApp Message for this store
                const message = `Halo ${storeName}, saya ingin pesan:
            
${storeItems.map(item => `- ${item.name} (${item.quantity}x) - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`).join('\n')}

Total: Rp ${storeTotal.toLocaleString('id-ID')}

---------------------------
Data Pemesan:
Nama: ${formData.name}
WhatsApp: ${formData.whatsapp}
Metode: ${formData.deliveryMethod === 'pickup' ? 'Ambil di Resto' : 'Diantar ke Alamat'}
${formData.deliveryMethod === 'delivery' ? `Alamat: ${formData.address}` : ''}
Pembayaran: ${formData.paymentMethod}
Catatan: ${formData.notes || '-'}
${paymentProof ? 'Bukti Transfer: (Terlampir di Aplikasi)' : ''}

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
            alert("Semua pesanan Anda telah berhasil dikirim ke masing-masing toko!");
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
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px',
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: 'white',
                padding: '32px',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)' }}>Formulir Pemesanan</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Nama Lengkap</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem' }}
                            placeholder="Masukkan nama Anda"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Nomor WhatsApp</label>
                        <input
                            required
                            type="tel"
                            value={formData.whatsapp}
                            onChange={e => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val)) { // Only allow digits
                                    setFormData({ ...formData, whatsapp: val });
                                }
                            }}
                            pattern="[0-9]*" // Mobile numeric keypad hint
                            inputMode="numeric"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem' }}
                            placeholder="Contoh: 08123456789"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Metode Pengantaran</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, deliveryMethod: 'delivery' })}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: formData.deliveryMethod === 'delivery' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                                    background: formData.deliveryMethod === 'delivery' ? '#fff5f5' : 'white',
                                    fontWeight: formData.deliveryMethod === 'delivery' ? 'bold' : 'normal',
                                    cursor: 'pointer'
                                }}
                            >
                                🛵 Diantar ke Alamat
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, deliveryMethod: 'pickup' })}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: formData.deliveryMethod === 'pickup' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                                    background: formData.deliveryMethod === 'pickup' ? '#fff5f5' : 'white',
                                    fontWeight: formData.deliveryMethod === 'pickup' ? 'bold' : 'normal',
                                    cursor: 'pointer'
                                }}
                            >
                                🛍️ Ambil di Resto
                            </button>
                        </div>
                    </div>

                    {formData.deliveryMethod === 'delivery' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Alamat Lengkap</label>
                            <textarea
                                required
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem', minHeight: '80px' }}
                                placeholder="Jalan, Nomor Rumah, RT/RW, Patokan..."
                            />
                        </div>
                    )}

                    {/* Payment Method Selection */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Metode Pembayaran</label>
                        <select
                            value={formData.paymentMethod}
                            onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem' }}
                        >
                            {(storeProfile?.paymentMethods || ['Tunai', 'Transfer Bank', 'QRIS']).map(method => (
                                <option key={method} value={method}>{method}</option>
                            ))}
                        </select>
                    </div>

                    {/* Bank Info & QRIS Display */}
                    {(formData.paymentMethod === 'Transfer Bank' || formData.paymentMethod === 'QRIS') && (
                        <div style={{ background: '#e3f2fd', padding: '16px', borderRadius: '8px', border: '1px solid #90caf9' }}>
                            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#0d47a1', fontSize: '1.05rem' }}>💳 Info Pembayaran:</p>

                            {formData.paymentMethod === 'Transfer Bank' && (
                                <div style={{ fontSize: '1rem', color: '#333', marginBottom: storeProfile?.qrisImage ? '12px' : '0' }}>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#666' }}>Tujuan Transfer:</p>
                                    <strong>{storeProfile?.bankAccount || 'Hubungi admin.'}</strong>
                                </div>
                            )}

                            {formData.paymentMethod === 'QRIS' && (
                                <div style={{ textAlign: 'center' }}>
                                    {storeProfile?.qrisImage ? (
                                        <>
                                            <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>Silakan scan QRIS di bawah ini:</p>
                                            <img
                                                src={storeProfile.qrisImage}
                                                alt="Store QRIS"
                                                style={{ width: '100%', maxWidth: '250px', borderRadius: '8px', border: '1px solid #ddd', padding: '10px', background: 'white' }}
                                            />
                                        </>
                                    ) : (
                                        <p style={{ fontStyle: 'italic', color: '#666' }}>QRIS belum tersedia. Gunakan metode lainnya.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payment Proof Upload */}
                    {(formData.paymentMethod === 'Transfer Bank' || formData.paymentMethod === 'QRIS') && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Bukti Transfer (Wajib) <span style={{ color: 'red' }}>*</span></label>
                            <input
                                required
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                            />
                            {paymentProof && (
                                <div style={{ marginTop: '8px' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'green', margin: '0 0 4px 0' }}>✓ Gambar berhasil dipilih</p>
                                    <img src={paymentProof} alt="Bukti Transfer" style={{ height: '60px', borderRadius: '4px', border: '1px solid #ddd' }} />
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Catatan Tambahan (Opsional)</label>
                        <input
                            type="text"
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem' }}
                            placeholder="Contoh: Jangan terlalu pedas"
                        />
                    </div>

                    <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontWeight: 'bold' }}>
                            <span>Total Tagihan:</span>
                            <span style={{ color: 'var(--primary-color)' }}>Rp {total.toLocaleString('id-ID')}</span>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '14px', fontSize: '1.1rem' }}
                        >
                            Buat Pesanan Sekarang 🚀
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
