'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useState } from 'react';
import StoreProfileModal from '@/components/StoreProfileModal';

export default function LoginTopBar() {
    const { isLoggedIn, login, logout, register, storeProfile } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Login State
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Register State
    const [regStoreName, setRegStoreName] = useState('');
    const [regOwnerName, setRegOwnerName] = useState('');
    const [regPassword, setRegPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(loginPassword)) {
            setShowLoginModal(false);
            setLoginPassword('');
            setLoginError('');
        } else {
            setLoginError('Password salah!');
        }
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (regPassword.length < 5) {
            alert('Password minimal 5 karakter!');
            return;
        }
        register(regPassword);
        setShowRegisterModal(false);
        alert(`Selamat bergabung, ${regOwnerName}! Toko "${regStoreName}" berhasil didaftarkan.`);
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
                <div className="container" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Bantuan</span>
                        <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Bahasa Indonesia</span>
                        <div style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.2)' }}></div>
                        {isLoggedIn ? (
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <span
                                    style={{ fontWeight: '600', color: 'var(--secondary-color)', cursor: 'pointer' }}
                                    onClick={() => setShowProfileModal(true)}
                                >
                                    Hi, {storeProfile?.ownerName || 'Owner'}
                                </span>
                                <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', fontWeight: '500' }}>Logout</button>

                                <Link href="/admin/orders" style={{ color: 'white' }}>Pesanan</Link>
                                <Link href="/admin" style={{ color: 'white' }}>Tambah Produk</Link>
                                <Link href="/pos" style={{ color: 'white' }}>POS</Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <span style={{ cursor: 'pointer', fontWeight: '600', color: 'white' }} onClick={() => setShowRegisterModal(true)}>Daftar Toko</span>
                                <div style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.2)' }}></div>
                                <span style={{ cursor: 'pointer', fontWeight: '600', color: 'white' }} onClick={() => setShowLoginModal(true)}>Log In Toko</span>
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
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                                <input
                                    type="password"
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
                            <p style={{ fontSize: '0.8rem', color: '#888', textAlign: 'center', marginTop: '1rem' }}>
                                Hint: password is <b>admin123</b>
                            </p>
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
                    zIndex: 2000
                }}>
                    <div className="card" style={{ width: '400px', padding: '2rem', background: 'white', borderRadius: '8px' }}>
                        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Pendaftaran Toko Baru</h2>
                        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nama Toko</label>
                                <input
                                    required
                                    type="text"
                                    value={regStoreName}
                                    onChange={(e) => setRegStoreName(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="Contoh: Ken Dimsum Cabang 2"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nama Pemilik</label>
                                <input
                                    required
                                    type="text"
                                    value={regOwnerName}
                                    onChange={(e) => setRegOwnerName(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="Nama Lengkap"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password Admin</label>
                                <input
                                    required
                                    type="password"
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="Buat password untuk login"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Daftar Sekarang</button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    style={{ flex: 1, background: '#eee' }}
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
