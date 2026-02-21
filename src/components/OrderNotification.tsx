'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrderContext';

export default function OrderNotification() {
    const { isLoggedIn } = useAuth();
    const { newOrderAlert, clearAlert } = useOrders();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (newOrderAlert && isLoggedIn) {
            setIsVisible(true);
            // Auto hide after 10 seconds if not clicked
            const timer = setTimeout(() => {
                setIsVisible(false);
                clearAlert();
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [newOrderAlert, isLoggedIn, clearAlert]);

    if (!isVisible || !newOrderAlert) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            borderLeft: '6px solid var(--primary-color)',
            padding: '16px',
            zIndex: 9999, // Very high z-index
            width: '320px',
            animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary-color)' }}>🔔 Pesanan Baru!</h4>
                <button
                    onClick={() => { setIsVisible(false); clearAlert(); }}
                    style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#999' }}
                >
                    &times;
                </button>
            </div>

            <div style={{ marginBottom: '12px' }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{newOrderAlert.customerName}</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                    {newOrderAlert.tableNumber} &bull; {newOrderAlert.items.length} Menu
                </p>
                <p style={{ margin: '4px 0 0 0', color: 'var(--secondary-color)', fontWeight: 'bold' }}>
                    Rp {newOrderAlert.total.toLocaleString('id-ID')}
                </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    style={{
                        flex: 1,
                        background: 'var(--primary-color)',
                        color: 'white',
                        padding: '8px',
                        borderRadius: '6px',
                        fontSize: '0.9rem'
                    }}
                    onClick={() => {
                        window.location.href = '/admin/orders'; // We will create this page next
                        setIsVisible(false);
                        clearAlert();
                    }}
                >
                    Lihat Pesanan
                </button>
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
