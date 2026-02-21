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
            <div className="glass" style={{
                position: 'sticky',
                top: 0,
                left: 0,
                right: 0,
                color: 'var(--text-rich)',
                padding: '12px 0',
                zIndex: 1000,
                borderBottom: '1px solid var(--gold-border)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Store name / logo on left */}
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <span style={{
                            fontWeight: '800',
                            color: 'var(--primary-color)',
                            letterSpacing: '1px',
                            fontSize: '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontFamily: 'Playfair Display SC, serif'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>🥟</span> {storeProfile?.storeName || 'KEN DIMSUM'}
                        </span>
                    </Link>

                    {/* Nav on right */}
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'nowrap' }}>
                        {isLoggedIn ? (
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <span
                                    style={{
                                        fontWeight: '600',
                                        color: 'var(--text-gold)',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.9rem'
                                    }}
                                    onClick={() => setShowProfileModal(true)}
                                >
                                    👑 Hi, {storeProfile?.ownerName || 'Owner'}
                                </span>
                                {/* Aggregator Link */}
                                {searchParams?.get('storeId') && (
                                    <Link
                                        href="/"
                                        className="btn-secondary"
                                        style={{ padding: '6px 14px', borderRadius: '50px', fontSize: '0.8rem' }}
                                    >
                                        🏠 Semua Menu
                                    </Link>
                                )}

                                <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem', fontWeight: 500 }}>
                                    <Link href="/admin/orders" style={{ color: 'var(--text-rich)', whiteSpace: 'nowrap' }}>Pesanan</Link>
                                    <Link href="/admin" style={{ color: 'var(--text-rich)', whiteSpace: 'nowrap' }}>Produk</Link>
                                    <Link href="/pos" style={{ color: 'var(--text-rich)', whiteSpace: 'nowrap' }}>POS</Link>
                                </div>

                                <button
                                    onClick={logout}
                                    style={{
                                        background: 'rgba(128, 0, 0, 0.05)',
                                        border: '1px solid var(--maroon-border)',
                                        cursor: 'pointer',
                                        color: 'var(--primary-color)',
                                        fontWeight: '600',
                                        whiteSpace: 'nowrap',
                                        padding: '6px 12px',
                                        borderRadius: '50px',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <span style={{ cursor: 'pointer', fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.9rem' }} onClick={() => setShowRegisterModal(true)}>Daftar</span>
                                <span
                                    className="btn btn-primary"
                                    style={{ cursor: 'pointer', padding: '8px 18px', fontSize: '0.85rem' }}
                                    onClick={() => setShowLoginModal(true)}
                                >
                                    Login Owner
                                </span>
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
                    backgroundColor: 'rgba(26, 10, 10, 0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div className="card animate-fade-in-up" style={{ width: '400px', padding: '2.5rem', background: 'white' }}>
                        <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>KEMBALI BERBISNIS</h2>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Masuk ke akun toko Anda</p>

                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>NAMA TOKO</label>
                                <input
                                    type="text"
                                    required
                                    value={loginStoreName}
                                    onChange={(e) => setLoginStoreName(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--maroon-border)',
                                        background: 'var(--bg-creamy)',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Nama toko Anda"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>KATASANDI</label>
                                <input
                                    type="password"
                                    required
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--maroon-border)',
                                        background: 'var(--bg-creamy)',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Kata sandi admin"
                                />
                            </div>
                            {loginError && <p style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 500 }}>⚠️ {loginError}</p>}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary">MASUK SEKARANG</button>
                                <button
                                    type="button"
                                    onClick={() => setShowLoginModal(false)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer' }}
                                >
                                    KEMBALI
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
                    backgroundColor: 'rgba(26, 10, 10, 0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    padding: '20px'
                }}>
                    <div className="card animate-fade-in-up" style={{ width: '550px', maxWidth: '100%', padding: '3rem', background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>GABUNG KE DUNIA DIMSUM</h2>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Mulai perjalanan kuliner Anda bersama kami</p>

                        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>NAMA TOKO</label>
                                    <input
                                        required
                                        type="text"
                                        value={regStoreName}
                                        onChange={(e) => setRegStoreName(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--maroon-border)', background: 'var(--bg-creamy)' }}
                                        placeholder="Ken Dimsum Royale"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>NAMA PEMILIK</label>
                                    <input
                                        required
                                        type="text"
                                        value={regOwnerName}
                                        onChange={(e) => setRegOwnerName(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--maroon-border)', background: 'var(--bg-creamy)' }}
                                        placeholder="Nama Lengkap"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>ALAMAT LENGKAP</label>
                                <textarea
                                    required
                                    value={regAddress}
                                    onChange={(e) => setRegAddress(e.target.value)}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--maroon-border)', background: 'var(--bg-creamy)', minHeight: '80px' }}
                                    placeholder="Alamat fisik toko Anda"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>WHATSAPP</label>
                                    <input
                                        required
                                        type="text"
                                        value={regWhatsapp}
                                        onChange={(e) => setRegWhatsapp(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--maroon-border)', background: 'var(--bg-creamy)' }}
                                        placeholder="628123456789"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>KATASANDI</label>
                                    <input
                                        required
                                        type="password"
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--maroon-border)', background: 'var(--bg-creamy)' }}
                                        placeholder="Min. 5 karakter"
                                    />
                                </div>
                            </div>

                            <div style={{ background: 'rgba(212, 175, 55, 0.05)', padding: '1.5rem', borderRadius: '15px', border: '1px dashed var(--secondary-color)' }}>
                                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 700, fontSize: '1rem', color: 'var(--primary-color)' }}>🏺 INFO PEMBAYARAN</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>BANK / E-WALLET</label>
                                        <input
                                            required
                                            type="text"
                                            value={regBankName}
                                            onChange={(e) => setRegBankName(e.target.value)}
                                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--gold-border)', background: 'white' }}
                                            placeholder="BCA / GoPay"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>NOMOR REKENING</label>
                                        <input
                                            required
                                            type="text"
                                            value={regBankAccount}
                                            onChange={(e) => setRegBankAccount(e.target.value)}
                                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--gold-border)', background: 'white' }}
                                            placeholder="123-456-789"
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>UPLOAD QRIS (OPSIONAL)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleQrisFileChange}
                                        style={{ fontSize: '0.8rem' }}
                                    />
                                    {regQrisImage && (
                                        <div style={{ marginTop: '0.8rem' }}>
                                            <img src={regQrisImage} alt="QRIS Preview" style={{ height: '70px', borderRadius: '4px', border: '1px solid var(--gold-border)' }} />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>METODE DITERIMA:</label>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        {['Tunai', 'Transfer Bank', 'QRIS'].map(method => (
                                            <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
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

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ padding: '14px' }}>DAFTARKAN TOKO SAYA</button>
                                <button
                                    type="button"
                                    onClick={() => setShowRegisterModal(false)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer' }}
                                >
                                    KEMBALI
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
