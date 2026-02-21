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

  // No longer blocking with store selector. We show aggregator by default.
  const currentStoreName = storeProfile?.storeName || (activeStoreId ? availableStores.find(s => s.id === activeStoreId)?.storeName : 'Ken Dimsum Platform');

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

      {/* Premium Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        marginBottom: '60px',
        overflow: 'hidden',
        background: 'var(--primary-dark)'
      }}>
        {/* Background Layer with absolute positioning to control scaling better */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'url("/images/hero-dimsum.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.6,
          filter: 'brightness(0.7) contrast(1.1)',
          transform: 'scale(1.02)',
          zIndex: 1
        }}></div>

        {/* Gradient Overlay for luxury feel */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at center, rgba(61, 12, 17, 0.1) 0%, rgba(26, 10, 10, 0.8) 100%)',
          zIndex: 2
        }}></div>

        {/* Decorative Gold Frame */}
        <div style={{
          position: 'absolute',
          top: '30px', left: '30px', right: '30px', bottom: '30px',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          pointerEvents: 'none',
          zIndex: 3,
          borderRadius: '8px'
        }}></div>

        <div className="container animate-fade-in-up" style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '900px',
          textAlign: 'center'
        }}>
          {/* Glassmorphic Content Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            padding: '70px 40px',
            borderRadius: '32px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{
              display: 'inline-block',
              background: 'var(--secondary-color)',
              color: 'var(--primary-dark)',
              padding: '10px 30px',
              borderRadius: '100px',
              fontSize: '0.85rem',
              fontWeight: '900',
              marginBottom: '35px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              boxShadow: '0 8px 25px rgba(212, 175, 55, 0.4)'
            }}>
              Ken Dimsum
            </div>

            <h1 style={{
              fontSize: 'clamp(2.5rem, 8vw, 6rem)',
              marginBottom: '20px',
              lineHeight: '1',
              color: 'white',
              fontFamily: 'Playfair Display SC, serif',
              textShadow: '0 4px 20px rgba(0,0,0,0.6)',
              fontWeight: '900'
            }}>
              {currentStoreName}
            </h1>

            <div style={{
              width: '100px',
              height: '3px',
              background: 'linear-gradient(to right, transparent, var(--secondary-color), transparent)',
              margin: '0 auto 40px auto'
            }}></div>

            <p style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
              color: 'rgba(255, 255, 255, 0.95)',
              marginBottom: '50px',
              fontWeight: '400',
              maxWidth: '700px',
              margin: '0 auto 50px auto',
              lineHeight: '1.8',
              fontFamily: 'Outfit, sans-serif'
            }}>
              "Artisan Dimsum Handmade dengan sentuhan kemewahan. Rasakan kelezatan yang tiada tara dalam setiap suapan."
            </p>

            <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary btn-hover-scale"
                onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  padding: '20px 60px',
                  fontSize: '1.2rem',
                  borderRadius: '100px',
                  fontWeight: '800',
                  letterSpacing: '1px',
                  boxShadow: '0 15px 35px rgba(128, 0, 0, 0.4)',
                }}
              >
                Pesan Sekarang
              </button>
            </div>
          </div>
        </div>

        {/* Floating Cart Trigger (Mobile focused only inside section context if needed, but here absolute is fine) */}
        <button
          onClick={() => setIsCartOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--primary-color)',
            color: 'white',
            border: '4px solid white',
            boxShadow: '0 8px 32px rgba(128, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            zIndex: 900,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          className="btn-hover-scale"
        >
          🛒
          {cartTotalItems > 0 && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              background: 'var(--secondary-color)',
              color: 'var(--primary-dark)',
              borderRadius: '50%',
              minWidth: '24px',
              height: '24px',
              padding: '0 4px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              fontWeight: '800'
            }}>
              {cartTotalItems}
            </span>
          )}
        </button>
      </section>

      <div className="container" id="menu" style={{ paddingBottom: '100px', flex: 1 }}>
        <main>
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', marginBottom: '12px' }}>Signature Menu</h2>
            <div className="title-underline" style={{ margin: '0 auto 30px auto' }}></div>

            {/* Improved Category Pills */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              overflowX: 'auto',
              padding: '10px 5px',
              WebkitOverflowScrolling: 'touch' as const,
              scrollbarWidth: 'none' as const,
            }}>
              {['Semua', 'Kukus', 'Goreng', 'Minuman', 'Paket Hemat'].map(cat => (
                <button key={cat} className="btn" style={{
                  background: cat === 'Semua' ? 'var(--primary-color)' : 'white',
                  color: cat === 'Semua' ? 'white' : 'var(--text-rich)',
                  border: cat === 'Semua' ? 'none' : '1px solid var(--gold-border)',
                  boxShadow: cat === 'Semua' ? 'var(--shadow-premium)' : 'none',
                  padding: '10px 24px',
                  borderRadius: '50px',
                  flexShrink: 0,
                  fontSize: '0.9rem',
                  fontWeight: cat === 'Semua' ? '600' : '500'
                }}>{cat}</button>
              ))}
            </div>
          </div>

          {isLoadingProducts ? (
            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Memuat menu lezat... 🥟</p>
          ) : products.length > 0 ? (
            <div className="grid product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px', background: 'var(--bg-creamy)', borderRadius: '24px', border: '1px dashed var(--gold-border)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🍲</div>
              <h3 style={{ fontFamily: 'Playfair Display SC, serif', color: 'var(--text-rich)' }}>Dapur Belum Dibuka</h3>
              <p style={{ color: 'var(--text-muted)' }}>Belum ada menu tersedia di toko ini saat ini.</p>
            </div>
          )}
        </main>
      </div>

      <footer style={{
        background: 'var(--bg-dark)',
        color: 'rgba(255,255,255,0.6)',
        padding: '60px 20px',
        marginTop: 'auto',
        textAlign: 'center',
        borderTop: '1px solid rgba(212, 175, 55, 0.2)'
      }}>
        <div className="container">
          <h2 style={{
            color: 'white',
            fontSize: '1.8rem',
            marginBottom: '12px',
            fontFamily: 'Playfair Display SC, serif',
            letterSpacing: '2px'
          }}>
            {currentStoreName}
          </h2>
          <p style={{
            fontSize: '0.9rem',
            maxWidth: '500px',
            margin: '0 auto 24px auto',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            Dedikasi pada rasa dan kualitas dimsum artisan terbaik.
          </p>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', fontSize: '0.8rem' }}>
            &copy; {new Date().getFullYear()} {currentStoreName}. Crafted for Perfection.
          </div>
        </div>
      </footer>
    </div>
  );
}
