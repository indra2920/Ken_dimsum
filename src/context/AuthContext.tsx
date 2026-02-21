'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

interface StoreProfile {
    id: string;
    storeName: string;
    ownerName: string;
    address: string;
    whatsapp: string;
    bankAccount: string;
    qrisImage?: string | null;
    paymentMethods?: string[];
}

interface AuthContextType {
    isLoggedIn: boolean;
    isLoadingSettings: boolean;
    storeProfile: StoreProfile | null;
    login: (storeName: string, password: string) => Promise<boolean>;
    register: (data: {
        password: string;
        storeName: string;
        ownerName: string;
        address: string;
        whatsapp: string;
        bankAccount: string;
        qrisImage?: string;
        paymentMethods?: string[];
    }) => Promise<void>;
    updateProfile: (data: Partial<StoreProfile>) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const [storeProfile, setStoreProfile] = useState<StoreProfile | null>(null);
    const searchParams = useSearchParams();

    // Detect storeId from URL or session
    useEffect(() => {
        const urlStoreId = searchParams.get('storeId');
        const savedLogin = localStorage.getItem('isLoggedIn');
        const savedStoreId = localStorage.getItem('storeId');

        const activeStoreId = urlStoreId || savedStoreId;

        const fetchStore = async (sid: string) => {
            try {
                const res = await fetch(`/api/settings?storeId=${sid}`);
                if (!res.ok) throw new Error('Failed to fetch store settings');
                const data = await res.json();
                setStoreProfile(data);

                // If it matches session, keep logged in
                if (savedLogin === 'true' && sid === savedStoreId) {
                    setIsLoggedIn(true);
                }
            } catch (error) {
                console.error('Store fetch failed:', error);
                if (sid === savedStoreId) {
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('storeId');
                }
            } finally {
                setIsLoadingSettings(false);
            }
        };

        if (activeStoreId) {
            fetchStore(activeStoreId);
        } else {
            setIsLoadingSettings(false);
        }
    }, [searchParams]);

    const login = async (storeName: string, password: string): Promise<boolean> => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeName, password }),
            });

            if (!res.ok) return false;

            const store = await res.json();
            setStoreProfile(store);
            setIsLoggedIn(true);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('storeId', store.id);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const register = async (data: {
        password: string;
        storeName: string;
        ownerName: string;
        address: string;
        whatsapp: string;
        bankAccount: string;
        qrisImage?: string;
        paymentMethods?: string[];
    }) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to register store');
            }

            const store = await res.json();
            setStoreProfile(store);
            setIsLoggedIn(true);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('storeId', store.id);
        } catch (error) {
            console.error('Registration error:', error);
            alert('Gagal mendaftarkan toko: ' + (error as Error).message);
            throw error;
        }
    };

    const updateProfile = async (data: Partial<StoreProfile>) => {
        if (!storeProfile) return;
        try {
            const updated = { ...storeProfile, ...data };
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...updated, storeId: storeProfile.id }),
            });
            if (res.ok) {
                setStoreProfile(updated);
            }
        } catch (error) {
            console.error('Update profile error:', error);
        }
    };

    const logout = () => {
        setIsLoggedIn(false);
        setStoreProfile(null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('storeId');
    };

    return (
        <AuthContext.Provider value={{
            isLoggedIn,
            isLoadingSettings,
            storeProfile,
            login,
            logout,
            register,
            updateProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
}
