'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface StoreProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const defaultProfile = {
    id: '',
    storeName: '',
    ownerName: '',
    address: '',
    whatsapp: '',
    bankAccount: '',
    qrisImage: null as string | null,
    paymentMethods: ['Tunai'] as string[],
};

export default function StoreProfileModal({ isOpen, onClose }: StoreProfileModalProps) {
    const { storeProfile, updateProfile } = useAuth();
    const [formData, setFormData] = useState(storeProfile || defaultProfile);

    useEffect(() => {
        if (isOpen && storeProfile) {
            setFormData(storeProfile);
        }
    }, [isOpen, storeProfile]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            updateProfile(formData);
            onClose();
            alert('Profil toko berhasil diperbarui!');
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
            backdropFilter: 'blur(4px)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: 'white', borderRadius: '12px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Pengaturan Toko</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nama Toko</label>
                        <input
                            type="text"
                            value={formData.storeName}
                            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nama Pemilik</label>
                        <input
                            type="text"
                            value={formData.ownerName}
                            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Alamat Toko</label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', minHeight: '80px' }}
                            placeholder="Alamat lengkap toko fisik (jika ada)"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nomor WhatsApp (untuk order)</label>
                        <input
                            type="text"
                            value={formData.whatsapp}
                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                            placeholder="Contoh: 628123456789 (Gunakan kode negara)"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Info Rekening / Pembayaran</label>
                        <textarea
                            value={formData.bankAccount}
                            onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', minHeight: '80px' }}
                            placeholder="Nomor rekening bank, e-wallet, dll"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>QRIS (Upload Gambar Baru)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        const img = new Image();
                                        img.onload = () => {
                                            const canvas = document.createElement('canvas');
                                            let width = img.width;
                                            let height = img.height;
                                            const MAX_DIM = 800;
                                            if (width > height) {
                                                if (width > MAX_DIM) {
                                                    height *= MAX_DIM / width;
                                                    width = MAX_DIM;
                                                }
                                            } else {
                                                if (height > MAX_DIM) {
                                                    width *= MAX_DIM / height;
                                                    height = MAX_DIM;
                                                }
                                            }
                                            canvas.width = width;
                                            canvas.height = height;
                                            const ctx = canvas.getContext('2d');
                                            ctx?.drawImage(img, 0, 0, width, height);
                                            setFormData({ ...formData, qrisImage: canvas.toDataURL('image/jpeg', 0.7) });
                                        };
                                        img.src = event.target?.result as string;
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                            style={{ fontSize: '0.9rem' }}
                        />
                        {formData.qrisImage && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <img src={formData.qrisImage} alt="QRIS" style={{ height: '100px', borderRadius: '4px', border: '1px solid #ddd' }} />
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Metode Pembayaran:</label>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {['Tunai', 'Transfer Bank', 'QRIS'].map(method => (
                                <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.paymentMethods?.includes(method) || false}
                                        onChange={() => {
                                            const current = formData.paymentMethods || [];
                                            const updated = current.includes(method)
                                                ? current.filter(m => m !== method)
                                                : [...current, method];
                                            setFormData({ ...formData, paymentMethods: updated });
                                        }}
                                    />
                                    {method}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
