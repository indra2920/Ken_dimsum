'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useState } from 'react';
import StoreProfileModal from '@/components/StoreProfileModal';
import { useSearchParams } from 'next/navigation';

export default function LoginTopBar() {
    const { isLoggedIn, login, logout, register, storeProfile } = useAuth();
    const searchParams = useSearchParams();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Login State
    const [loginStoreName, setLoginStoreName] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Register State
    const [regStoreName, setRegStoreName] = useState('');
    const [regOwnerName, setRegOwnerName] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regAddress, setRegAddress] = useState('');
    const [regWhatsapp, setRegWhatsapp] = useState('');
    const [regBankName, setRegBankName] = useState('');
    const [regBankAccount, setRegBankAccount] = useState('');
    const [regQrisImage, setRegQrisImage] = useState<string>('');
    const [regPaymentMethods, setRegPaymentMethods] = useState<string[]>(['Tunai']);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await login(loginStoreName, loginPassword);
        if (success) {
            setShowLoginModal(false);
            setLoginStoreName('');
            setLoginPassword('');
            setLoginError('');
        } else {
            setLoginError('Nama toko atau password salah!');
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (regPassword.length < 5) {
            alert('Password minimal 5 karakter!');
            return;
        }

        try {
            await register({
                password: regPassword,
                storeName: regStoreName,
                ownerName: regOwnerName,
                address: regAddress,
                whatsapp: regWhatsapp,
                bankAccount: `${regBankName} - ${regBankAccount}`,
                qrisImage: regQrisImage,
                paymentMethods: regPaymentMethods
            });
            setShowRegisterModal(false);
            alert(`Selamat bergabung, ${regOwnerName}! Toko "${regStoreName}" berhasil didaftarkan.`);
        } catch (error) {
            // Error managed in register function
        }
    };

    const handleQrisFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                    setRegQrisImage(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const togglePaymentMethod = (method: string) => {
        setRegPaymentMethods(prev =>
            prev.includes(method)
                ? prev.filter(m => m !== method)
                : [...prev, method]
        );
    };

    return (
        <>
            <div style={{
                background: '#2D0A0A',
                color: 'rgba(255,255,255,0.8)',
                padding: '8px 0',
                fontSize: '0.85rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Store name / logo on left */}
                    <span style={{ fontWeight: '700', color: 'var(--secondary-color)', letterSpacing: '0.5px' }}>
                        🥟 {storeProfile?.storeName || 'Ken Dimsum'}
                    </span>

                    {/* Nav on right */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'nowrap', overflowX: 'auto' }}>
                        {isLoggedIn ? (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span
                                    style={{ fontWeight: '600', color: 'var(--secondary-color)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                    onClick={() => setShowProfileModal(true)}
                                >
                                    Hi, {storeProfile?.ownerName || 'Owner'}
                                </span>
                                {/* Aggregator Link */}
                                {searchParams?.get('storeId') && (
                                    <Link
                                        href="/"
                                        style={{ color: 'white', textDecoration: 'none', fontSize: '0.85rem', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '4px' }}
                                    >
                                        🏠 Semua Menu
                                    </Link>
                                )}
                                <span
                                    style={{ color: 'white', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.85rem' }}
                                    onClick={() => setShowProfileModal(true)}
                                >
                                    ⚙️ Pengaturan
                                </span>
                                <Link href="/admin/orders" style={{ color: 'white', whiteSpace: 'nowrap' }}>Pesanan</Link>
                                <Link href="/admin" style={{ color: 'white', whiteSpace: 'nowrap' }}>Produk</Link>
                                <Link href="/pos" style={{ color: 'white', whiteSpace: 'nowrap' }}>POS</Link>
                                <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontWeight: '500', whiteSpace: 'nowrap' }}>Logout</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <span style={{ cursor: 'pointer', fontWeight: '600', color: 'white', whiteSpace: 'nowrap' }} onClick={() => setShowRegisterModal(true)}>Daftar</span>
                                <span style={{ cursor: 'pointer', fontWeight: '600', color: 'var(--secondary-color)', whiteSpace: 'nowrap' }} onClick={() => setShowLoginModal(true)}>Login sebagai Pemilik Toko</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Login Modal */}
            {showLoginModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div className="card" style={{ width: '350px', padding: '2rem', background: 'white', borderRadius: '8px' }}>
                        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Login Pemilik Toko</h2>
                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nama Toko</label>
                                <input
                                    type="text"
                                    required
                                    value={loginStoreName}
                                    onChange={(e) => setLoginStoreName(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="Masukkan nama toko"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                                <input
                                    type="password"
                                    required
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="Masukkan password admin"
                                />
                            </div>
                            {loginError && <p style={{ color: 'red', fontSize: '0.9rem' }}>{loginError}</p>}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Login</button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    style={{ flex: 1, background: '#eee' }}
                                    onClick={() => setShowLoginModal(false)}
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Register Modal */}
            {showRegisterModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    padding: '20px'
                }}>
                    <div className="card" style={{ width: '500px', maxWidth: '100%', padding: '2rem', background: 'white', borderRadius: '12px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Pendaftaran Toko Baru</h2>
                        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Nama Toko</label>
                                    <input
                                        required
                                        type="text"
                                        value={regStoreName}
                                        onChange={(e) => setRegStoreName(e.target.value)}
                                        style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #ddd' }}
                                        placeholder="Contoh: Ken Dimsum Cabang 2"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Nama Pemilik</label>
                                    <input
                                        required
                                        type="text"
                                        value={regOwnerName}
                                        onChange={(e) => setRegOwnerName(e.target.value)}
                                        style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #ddd' }}
                                        placeholder="Nama Lengkap"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Alamat Toko</label>
                                <textarea
                                    required
                                    value={regAddress}
                                    onChange={(e) => setRegAddress(e.target.value)}
                                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #ddd', minHeight: '60px' }}
                                    placeholder="Alamat lengkap toko fisik"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Nomor WhatsApp</label>
                                    <input
                                        required
                                        type="text"
                                        value={regWhatsapp}
                                        onChange={(e) => setRegWhatsapp(e.target.value)}
                                        style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #ddd' }}
                                        placeholder="Contoh: 628123456789"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Password Admin</label>
                                    <input
                                        required
                                        type="password"
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #ddd' }}
                                        placeholder="Password untuk login"
                                    />
                                </div>
                            </div>

                            <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px', border: '1px solid #eee' }}>
                                <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, fontSize: '0.95rem', color: 'var(--primary-color)' }}>💳 Info Pembayaran</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Nama Bank / Dompet</label>
                                        <input
                                            required
                                            type="text"
                                            value={regBankName}
                                            onChange={(e) => setRegBankName(e.target.value)}
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                            placeholder="BCA / Mandiri / GoPay"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Nomor Rekening</label>
                                        <input
                                            required
                                            type="text"
                                            value={regBankAccount}
                                            onChange={(e) => setRegBankAccount(e.target.value)}
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                            placeholder="123-456-7890"
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Upload QRIS (Opsional)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleQrisFileChange}
                                        style={{ fontSize: '0.8rem' }}
                                    />
                                    {regQrisImage && (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <img src={regQrisImage} alt="QRIS Preview" style={{ height: '60px', borderRadius: '4px', border: '1px solid #ddd' }} />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem' }}>Metode Pembayaran yang Diterima:</label>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        {['Tunai', 'Transfer Bank', 'QRIS'].map(method => (
                                            <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={regPaymentMethods.includes(method)}
                                                    onChange={() => togglePaymentMethod(method)}
                                                />
                                                {method}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>Daftar Sekarang</button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    style={{ flex: 1, background: '#eee', padding: '12px' }}
                                    onClick={() => setShowRegisterModal(false)}
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <StoreProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
        </>
    );
}
