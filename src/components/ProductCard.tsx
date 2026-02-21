import React from 'react';
import { Product } from '@/context/ProductContext';

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
    return (
        <div className="card product-card" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            background: 'white',
            padding: '12px'
        }}>
            {/* Image Section */}
            <div className="product-image" style={{
                width: '100%',
                height: '240px',
                borderRadius: '15px',
                overflow: 'hidden',
                position: 'relative',
                background: '#fcfcfc',
                border: '1px solid rgba(0,0,0,0.03)'
            }}>
                {(product.image.startsWith('data:') || product.image.startsWith('http')) ? (
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} className="hover-zoom" />
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', background: '#FDF7F2' }}>
                        {product.image}
                    </div>
                )}

                {/* Status Badges */}
                <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {product.storeName && (
                        <div style={{
                            background: 'rgba(26, 10, 10, 0.85)',
                            color: 'var(--secondary-color)',
                            padding: '4px 12px',
                            borderRadius: '50px',
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid var(--secondary-color)',
                            letterSpacing: '0.5px'
                        }}>
                            {product.storeName.toUpperCase()}
                        </div>
                    )}
                </div>

                {product.stock < 10 && product.stock > 0 && (
                    <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        background: 'var(--primary-color)',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        LTD: {product.stock} LEFT
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div style={{ padding: '16px 8px 8px 8px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        color: 'var(--text-gold)',
                        letterSpacing: '1px'
                    }}>{product.category.toUpperCase()}</span>
                </div>

                <h3 style={{
                    margin: '0 0 10px 0',
                    fontSize: '1.4rem',
                    color: 'var(--text-rich)',
                    fontFamily: 'Playfair Display SC, serif',
                    lineHeight: '1.2'
                }}>{product.name}</h3>

                <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    lineHeight: '1.6',
                    marginBottom: '20px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>{product.description}</p>

                <div style={{
                    marginTop: 'auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(212, 175, 55, 0.15)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-color)' }}>
                            <span style={{ fontSize: '0.9rem', marginRight: '2px' }}>Rp</span> {product.price.toLocaleString('id-ID')}
                        </span>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={() => onAddToCart(product)}
                        disabled={product.stock <= 0}
                        style={{
                            padding: '10px 24px',
                            background: product.stock <= 0 ? '#BDC3C7' : undefined,
                            borderRadius: '12px',
                            fontSize: '0.85rem'
                        }}
                    >
                        {product.stock > 0 ? 'ADICART' : 'SOLD OUT'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
