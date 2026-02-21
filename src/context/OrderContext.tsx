'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';

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
    addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>, storeId?: string) => Promise<Order | null>;
    updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
    newOrderAlert: Order | null;
    clearAlert: () => void;
    refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
    const { storeProfile } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const knownOrderIds = useRef<Set<string>>(new Set());
    const isFirstLoad = useRef(true);

    const storeId = storeProfile?.id;

    const fetchOrders = async () => {
        if (!storeId) {
            setIsLoading(false);
            return;
        }
        try {
            const res = await fetch(`/api/orders?storeId=${storeId}`);
            if (!res.ok) throw new Error('Failed to fetch orders');
            const data: Order[] = await res.json();

            if (!isFirstLoad.current) {
                // Check for new orders since last fetch
                const newOrders = data.filter(o => !knownOrderIds.current.has(o.id) && o.status === 'BARU');
                if (newOrders.length > 0) {
                    setNewOrderAlert(newOrders[0]);

                    // Simple notification sound using Web Audio API
                    // Prominent "Ding-Dong" melody using Web Audio API
                    const playNotificationSound = () => {
                        try {
                            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

                            const playTone = (freq: number, start: number, duration: number) => {
                                const osc = audioCtx.createOscillator();
                                const gain = audioCtx.createGain();
                                osc.connect(gain);
                                gain.connect(audioCtx.destination);

                                osc.type = 'sine';
                                osc.frequency.setValueAtTime(freq, start);
                                gain.gain.setValueAtTime(0, start);
                                gain.gain.linearRampToValueAtTime(0.2, start + 0.05);
                                gain.gain.exponentialRampToValueAtTime(0.01, start + duration);

                                osc.start(start);
                                osc.stop(start + duration);
                            };

                            const now = audioCtx.currentTime;
                            // Ding
                            playTone(660, now, 0.6); // E5
                            // Dong
                            playTone(523, now + 0.5, 0.8); // C5
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
        if (!storeId) return;
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [storeId]);

    const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>, forcedStoreId?: string): Promise<Order | null> => {
        const targetStoreId = forcedStoreId || storeId;
        if (!targetStoreId) return null;
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...orderData, storeId: targetStoreId }),
        });
        if (!res.ok) throw new Error('Failed to create order');
        const created: Order = await res.json();
        knownOrderIds.current.add(created.id); // Don't alert for own order
        setOrders(prev => [created, ...prev]);
        return created;
    };

    const updateOrderStatus = async (orderId: string, status: Order['status']) => {
        if (!storeId) return;
        const res = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, storeId }),
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
