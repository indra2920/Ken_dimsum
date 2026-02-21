'use client';

import { useState } from 'react';
import { useProducts } from '@/context/ProductContext';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/context/ProductContext';
import Link from 'next/link';
import StoreProfileModal from '@/components/StoreProfileModal';

export default function AdminPage() {
    const { products, categories, addProduct, updateProduct, deleteProduct, addCategory } = useProducts();
    const { isLoggedIn } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        category: 'Kukus',
        price: 0,
        stock: 0,
        description: '',
        image: ''
    });

    if (!isLoggedIn) {
        return (
            <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                <h1>Akses Ditolak</h1>
                <p>Anda harus login sebagai pemilik toko untuk mengakses halaman ini.</p>
                <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Kembali ke Beranda</Link>
            </div>
        );
    }

    const handleOpenAdd = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            category: 'Kukus',
            price: 0,
            stock: 0,
            description: '',
            image: ''
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData(product);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            deleteProduct(id);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingProduct) {
            updateProduct({ ...editingProduct, ...formData } as Product);
        } else {
            addProduct(formData as Omit<Product, 'id'>);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="container" style={{ padding: 'clamp(1rem, 3vw, 2rem)' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
                <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)' }}>Inventory Management</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setIsProfileModalOpen(true)}
                        style={{ fontSize: '0.85rem', padding: '8px 16px', backgroundColor: '#f0f0f0', color: '#333' }}
                    >
                        ⚙️ Pengaturan Toko
                    </button>
                    <Link href="/" className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>Back to Store</Link>
                </div>
            </header>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h2>Product List</h2>
                    <button className="btn btn-primary" onClick={handleOpenAdd}>+ Add Product</button>
                </div>

                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '1rem' }}>ID</th>
                                <th style={{ padding: '1rem' }}>Product Name</th>
                                <th style={{ padding: '1rem' }}>Category</th>
                                <th style={{ padding: '1rem' }}>Price</th>
                                <th style={{ padding: '1rem' }}>Stock</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem' }}>#{product.id}</td>
                                    <td style={{ padding: '1rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '48px', height: '48px',
                                            background: '#f5f5f5',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {product.image.startsWith('data:') || product.image.startsWith('http') ? (
                                                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span style={{ fontSize: '1.5rem' }}>{product.image}</span>
                                            )}
                                        </div>
                                        {product.name}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            background: product.category === 'Steamed' ? '#e3f2fd' : product.category === 'Fried' ? '#fff3e0' : '#f5f5f5',
                                            color: product.category === 'Steamed' ? '#1565c0' : product.category === 'Fried' ? '#ef6c00' : '#616161',
                                            borderRadius: '20px',
                                            fontSize: '0.85rem'
                                        }}>
                                            {product.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>Rp {product.price.toLocaleString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ color: product.stock < 10 ? 'red' : 'inherit', fontWeight: product.stock < 10 ? 'bold' : 'normal' }}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button
                                            style={{ color: 'blue', marginRight: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}
                                            onClick={() => handleOpenEdit(product)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                                            onClick={() => handleDelete(product.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Product Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '95%', maxWidth: '500px', padding: 'clamp(1rem, 4vw, 2rem)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newCat = prompt('Enter new category name:');
                                                if (newCat) {
                                                    addCategory(newCat);
                                                    setFormData({ ...formData, category: newCat });
                                                }
                                            }}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: '#eee',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            + New
                                        </button>
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Foto Produk</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData({ ...formData, image: reader.result as string });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                    {formData.image && (
                                        <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                                            <img
                                                src={formData.image}
                                                alt="Preview"
                                                style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Price</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Stock</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    {editingProduct ? 'Update' : 'Create'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    style={{ flex: 1, background: '#eee' }}
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Store Profile Modal */}
            <StoreProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </div>
    );
}
