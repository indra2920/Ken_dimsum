'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    description: string;
    stock: number;
}

interface ProductContextType {
    products: Product[];
    categories: string[];
    lowStockAlerts: Product[];
    isLoading: boolean;
    addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    updateStock: (id: string, newStock: number) => Promise<void>;
    addCategory: (category: string) => void;
    refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>(['Kukus', 'Goreng', 'Minuman']);
    const [lowStockAlerts, setLowStockAlerts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const checkLowStock = (currentProducts: Product[]) => {
        setLowStockAlerts(currentProducts.filter(p => p.stock < 10));
    };

    const fetchProducts = async (retries = 3) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const res = await fetch('/api/products');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data: Product[] = await res.json();
                setProducts(data);
                checkLowStock(data);

                // Derive unique categories from products
                const uniqueCategories = Array.from(new Set(data.map(p => p.category)));
                if (uniqueCategories.length > 0) {
                    setCategories(prev => Array.from(new Set([...prev, ...uniqueCategories])));
                }
                setIsLoading(false);
                return;
            } catch (error) {
                console.warn(`Products fetch attempt ${attempt} failed:`, error);
                if (attempt < retries) {
                    await new Promise(r => setTimeout(r, 2000 * attempt));
                } else {
                    console.error('Failed to fetch products after retries.');
                    setIsLoading(false);
                }
            }
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);


    const addProduct = async (newProduct: Omit<Product, 'id'>) => {
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct),
        });
        if (!res.ok) throw new Error('Failed to add product');
        const created: Product = await res.json();
        setProducts(prev => [created, ...prev]);
        checkLowStock([created, ...products]);
    };

    const updateProduct = async (updatedProduct: Product) => {
        const res = await fetch(`/api/products/${updatedProduct.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProduct),
        });
        if (!res.ok) throw new Error('Failed to update product');
        const updated: Product = await res.json();
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
        checkLowStock(products.map(p => p.id === updated.id ? updated : p));
    };

    const deleteProduct = async (id: string) => {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete product');
        const remaining = products.filter(p => p.id !== id);
        setProducts(remaining);
        checkLowStock(remaining);
    };

    const updateStock = async (id: string, newStock: number) => {
        const product = products.find(p => p.id === id);
        if (!product) return;
        await updateProduct({ ...product, stock: newStock });
    };

    const addCategory = (category: string) => {
        if (!categories.includes(category)) {
            setCategories(prev => [...prev, category]);
        }
    };

    return (
        <ProductContext.Provider value={{
            products, categories, lowStockAlerts, isLoading,
            addProduct, updateProduct, deleteProduct, updateStock, addCategory,
            refreshProducts: fetchProducts
        }}>
            {children}
        </ProductContext.Provider>
    );
}

export function useProducts() {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
}
