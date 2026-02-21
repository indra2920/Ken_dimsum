'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    description: string;
    stock: number;
    quantity: number;
}

export interface Order {
    id: string;
    customerName: string;
    customerWhatsapp: string;
    tableNumber: string;
    items: OrderItem[];
    total: number;
    status: 'BARU' | 'DIPROSES' | 'SELESAI' | 'BATAL';
    createdAt: string; // ISO string from DB
    notes?: string;
    paymentMethod: string;
    paymentProof?: string;
    deliveryMethod: 'pickup' | 'delivery';
}

interface OrderContextType {
    orders: Order[];
    isLoading: boolean;
    addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<void>;
    updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
    newOrderAlert: Order | null;
    clearAlert: () => void;
    refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const knownOrderIds = useRef<Set<string>>(new Set());
    const isFirstLoad = useRef(true);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            if (!res.ok) throw new Error('Failed to fetch orders');
            const data: Order[] = await res.json();

            if (!isFirstLoad.current) {
                // Check for new orders since last fetch
                const newOrders = data.filter(o => !knownOrderIds.current.has(o.id) && o.status === 'BARU');
                if (newOrders.length > 0) {
                    setNewOrderAlert(newOrders[0]);

                    // Simple notification sound using Web Audio API
                    const playNotificationSound = () => {
                        try {
                            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                            const oscillator = audioCtx.createOscillator();
                            const gainNode = audioCtx.createGain();

                            oscillator.connect(gainNode);
                            gainNode.connect(audioCtx.destination);

                            oscillator.type = 'sine';
                            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
                            oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5); // A4

                            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

                            oscillator.start();
                            oscillator.stop(audioCtx.currentTime + 0.5);
                        } catch (err) {
                            console.warn('Could not play notification sound:', err);
                        }
                    };

                    playNotificationSound();

                    // Vibration for mobile/tablet
                    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                        window.navigator.vibrate([200, 100, 200]); // Vibrate pattern
                    }

                    console.log('DING! New Order:', newOrders[0].customerName);
                }
            }

            // Update known IDs
            data.forEach(o => knownOrderIds.current.add(o.id));
            isFirstLoad.current = false;

            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load + polling every 10 seconds
    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
        });
        if (!res.ok) throw new Error('Failed to create order');
        const created: Order = await res.json();
        knownOrderIds.current.add(created.id); // Don't alert for own order
        setOrders(prev => [created, ...prev]);
    };

    const updateOrderStatus = async (orderId: string, status: Order['status']) => {
        const res = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error('Failed to update order status');
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    };

    const clearAlert = () => setNewOrderAlert(null);

    return (
        <OrderContext.Provider value={{
            orders, isLoading, addOrder, updateOrderStatus,
            newOrderAlert, clearAlert, refreshOrders: fetchOrders
        }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrders() {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrders must be used within a OrderProvider');
    }
    return context;
}
