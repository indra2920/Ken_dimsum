'use client';

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/context/ProductContext';
import { useProducts } from '@/context/ProductContext';
import { useAuth } from '@/context/AuthContext';
import LoginTopBar from '@/components/LoginTopBar';
import Link from 'next/link';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';

interface CartItem extends Product {
  quantity: number;
}

export default function Home() {
  const { products } = useProducts();
  const { isLoggedIn } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

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
              Ken Dimsum
            </h1>
            <p style={{
              fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)',
              opacity: 0.9,
              marginBottom: '24px',
              fontWeight: 300,
              maxWidth: '480px'
            }}>
              Dibuat dengan bahan pilihan dan resep warisan untuk pengalaman dimsum terbaik.
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
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: '24px',
          paddingTop: '16px',
        }}>
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

            <div className="grid product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
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
          <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: '16px' }}>Ken Dimsum</h2>
          <p style={{ marginBottom: '32px' }}>Premium Dimsum & Authentic Taste</p>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px', fontSize: '0.9rem' }}>
            &copy; 2024 Ken Dimsum. All rights reserved.
          </div>
        </div>
      </footer>
    </div >
  );
}
