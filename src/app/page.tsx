'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/context/ProductContext';
import { useProducts } from '@/context/ProductContext';
import { useAuth } from '@/context/AuthContext';
import LoginTopBar from '@/components/LoginTopBar';
import Link from 'next/link';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import { useSearchParams } from 'next/navigation';

interface CartItem extends Product {
  quantity: number;
}

interface StoreListItem {
  id: string;
  storeName: string;
  ownerName: string;
}

export default function Home() {
  const { products, isLoading: isLoadingProducts } = useProducts();
  const { isLoggedIn, storeProfile, isLoadingSettings } = useAuth();
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [availableStores, setAvailableStores] = useState<StoreListItem[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  const activeStoreId = searchParams.get('storeId') || storeProfile?.id;

  useEffect(() => {
    if (!activeStoreId) {
      const fetchStores = async () => {
        setIsLoadingStores(true);
        try {
          const res = await fetch('/api/stores');
          if (res.ok) {
            const data = await res.json();
            setAvailableStores(data);
          }
        } catch (error) {
          console.error('Failed to fetch stores:', error);
        } finally {
          setIsLoadingStores(false);
        }
      };
      fetchStores();
    }
  }, [activeStoreId]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // If no store is selected and not logged in, show store selector
  if (!activeStoreId && !isLoggedIn && !isLoadingSettings) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <LoginTopBar />
        <div className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Selamat Datang di Ken Dimsum</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Silakan pilih toko untuk melihat menu </p>

            {isLoadingStores ? (
              <p>Memuat daftar toko...</p>
            ) : availableStores.length > 0 ? (
              <div style={{ display: 'grid', gap: '16px' }}>
                {availableStores.map(store => (
                  <Link
                    key={store.id}
                    href={`/?storeId=${store.id}`}
                    className="card"
                    style={{
                      padding: '24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'transform 0.2s',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary-color)' }}>{store.storeName}</h3>
                      <p style={{ margin: '4px 0 0', fontSize: '0.9rem', opacity: 0.7 }}>Pemilik: {store.ownerName}</p>
                    </div>
                    <span style={{ fontSize: '1.5rem' }}>👉</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px', background: '#f9f9f9', borderRadius: '12px' }}>
                <p>Belum ada toko yang terdaftar.</p>
                <p style={{ fontSize: '0.9rem' }}>Silakan "Daftar" di atas untuk membuat toko pertama!</p>
              </div>
            )}
          </div>
        </div>
        <footer style={{ background: '#2D0A0A', color: 'rgba(255,255,255,0.6)', padding: '40px 0', textAlign: 'center' }}>
          <p>&copy; 2024 Ken Dimsum Platform. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  const currentStoreName = storeProfile?.storeName || 'Ken Dimsum';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <LoginTopBar />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={updateQuantity}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutModalOpen(true);
        }}
      />
      {isCheckoutModalOpen && (
        <CheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          cartItems={cart}
          total={cartTotalItems > 0 ? cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0}
          onClearCart={() => setCart([])}
        />
      )}

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary-color) 0%, #2D0A0A 100%)',
        color: 'white',
        padding: 'clamp(32px, 6vw, 60px) 0',
        marginBottom: '32px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ flex: '1', minWidth: '260px' }}>
            <span style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.1)',
              padding: '6px 14px',
              borderRadius: '50px',
              fontSize: '0.85rem',
              marginBottom: '12px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              ✨ Cita Rasa Otentik
            </span>
            <h1 style={{
              fontSize: 'clamp(2rem, 6vw, 3.5rem)',
              marginBottom: '12px',
              lineHeight: '1.2',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              {currentStoreName}
            </h1>
            <p style={{
              fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)',
              opacity: 0.9,
              marginBottom: '24px',
              fontWeight: 300,
              maxWidth: '480px'
            }}>
              {storeProfile?.address || 'Dibuat dengan bahan pilihan dan resep warisan untuk pengalaman dimsum terbaik.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                className="btn"
                onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  background: 'var(--secondary-color)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 28px',
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                }}
              >
                👉 Pesan Sekarang
              </button>
            </div>
          </div>
          <div style={{ fontSize: 'clamp(4rem, 12vw, 8rem)', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))' }}>
            🥟
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingBottom: '80px', flex: 1 }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingTop: '16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!isLoggedIn && (
              <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                ← Ganti Toko
              </Link>
            )}
          </div>
          <button
            className="btn btn-primary"
            style={{ position: 'relative' }}
            onClick={() => setIsCartOpen(true)}
          >
            🛒 Keranjang
            {cartTotalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: 'var(--secondary-color)',
                color: 'var(--text-primary)',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
                fontWeight: 'bold'
              }}>
                {cartTotalItems}
              </span>
            )}
          </button>
        </header>

        <main>
          <section id="menu">
            <div style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', marginBottom: '8px' }}>Menu Andalan</h2>
                <div style={{ height: '4px', width: '60px', background: 'var(--secondary-color)', borderRadius: '2px' }}></div>
              </div>
              <div style={{
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                paddingBottom: '6px',
                WebkitOverflowScrolling: 'touch' as const,
                scrollbarWidth: 'none' as const,
              }}>
                {['Semua', 'Kukus', 'Goreng', 'Minuman'].map(cat => (
                  <button key={cat} className="btn" style={{
                    background: cat === 'Semua' ? 'var(--primary-color)' : 'white',
                    color: cat === 'Semua' ? 'white' : 'var(--text-primary)',
                    border: cat === 'Semua' ? 'none' : '1px solid var(--border-color)',
                    boxShadow: cat === 'Semua' ? 'var(--shadow-md)' : 'none',
                    padding: '7px 18px',
                    borderRadius: '50px',
                    flexShrink: 0,
                    fontSize: '0.88rem'
                  }}>{cat}</button>
                ))}
              </div>
            </div>

            {isLoadingProducts ? (
              <p style={{ textAlign: 'center', padding: '40px' }}>Memuat menu...</p>
            ) : products.length > 0 ? (
              <div className="grid product-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', background: '#f9f9f9', borderRadius: '12px' }}>
                <p style={{ fontSize: '1.2rem', color: '#888' }}>Belum ada menu tersedia di toko ini.</p>
              </div>
            )}
          </section>
        </main>
      </div>

      <footer style={{
        background: '#2D0A0A',
        color: 'rgba(255,255,255,0.6)',
        padding: '60px 0',
        marginTop: 'auto'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: '16px' }}>{currentStoreName}</h2>
          <p style={{ marginBottom: '32px' }}>{storeProfile?.ownerName ? `Powered by ${storeProfile.ownerName}` : 'Premium Dimsum & Authentic Taste'}</p>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px', fontSize: '0.9rem' }}>
            &copy; 2024 {currentStoreName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div >
  );
}
