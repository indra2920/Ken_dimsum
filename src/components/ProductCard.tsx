import React from 'react';
import { Product } from '../data/mockData';

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
    return (
        <div className="card product-card" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px',
            height: '100%',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div className="product-image" style={{
                width: '100%',
                height: '220px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#F8F5F2',
                borderRadius: 'var(--border-radius-sm)',
                overflow: 'hidden',
                marginBottom: '4px'
            }}>
                {(product.image.startsWith('data:') || product.image.startsWith('http')) ? (
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
                ) : (
                    <span style={{ fontSize: '5rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}>{product.image}</span>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <span style={{
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: 'var(--secondary-color)',
                        fontWeight: 700
                    }}>{product.category}</span>
                    <h3 style={{
                        margin: '4px 0',
                        fontSize: '1.25rem',
                        color: 'var(--text-primary)',
                        fontFamily: 'Playfair Display, serif'
                    }}>{product.name}</h3>
                </div>
            </div>

            <p style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                flex: 1,
                lineHeight: '1.5',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
            }}>{product.description}</p>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px dashed var(--divider-color)'
            }}>
                <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block' }}>Harga</span>
                    <span style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--primary-color)' }}>
                        Rp {product.price.toLocaleString('id-ID')}
                    </span>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock <= 0}
                    style={{
                        padding: '8px 20px',
                        fontSize: '0.9rem',
                        background: product.stock <= 0 ? '#ccc' : 'var(--primary-color)',
                        boxShadow: product.stock <= 0 ? 'none' : 'var(--shadow-md)'
                    }}
                >
                    {product.stock > 0 ? (
                        <>
                            <span>+</span> Tambah
                        </>
                    ) : 'Habis'}
                </button>
            </div>

            {product.stock < 10 && product.stock > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(212, 175, 55, 0.9)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    backdropFilter: 'blur(4px)'
                }}>
                    Sisa {product.stock}
                </div>
            )}
        </div>
    );
};

export default ProductCard;
