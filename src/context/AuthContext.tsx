'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface StoreProfile {
    storeName: string;
    ownerName: string;
    address: string;
    whatsapp: string;
    bankAccount: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    isLoadingSettings: boolean;
    storeProfile: StoreProfile;
    login: (storeName: string, password: string) => Promise<boolean>;
    register: (password: string, storeName: string, ownerName: string) => Promise<void>;
    updateProfile: (data: Partial<StoreProfile>) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const [dbPassword, setDbPassword] = useState('admin123');
    const [storeProfile, setStoreProfile] = useState<StoreProfile>({
        storeName: 'Ken Dimsum',
        ownerName: 'Owner',
        address: 'Jl. Contoh No. 123',
        whatsapp: '6281234567890',
        bankAccount: 'BCA 1234567890 a.n Ken Dimsum',
    });

    // Load settings and session from DB/localStorage on mount
    useEffect(() => {
        // Recovery login session
        const savedLogin = localStorage.getItem('isLoggedIn');
        if (savedLogin === 'true') {
            setIsLoggedIn(true);
        }

        const fetchSettings = async (retries = 3) => {
            for (let attempt = 1; attempt <= retries; attempt++) {
                try {
                    const res = await fetch('/api/settings');
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    const data = await res.json();
                    setDbPassword(data.password);
                    setStoreProfile({
                        storeName: data.storeName,
                        ownerName: data.ownerName,
                        address: data.address,
                        whatsapp: data.whatsapp,
                        bankAccount: data.bankAccount,
                    });
                    setIsLoadingSettings(false);
                    return; // success
                } catch (error) {
                    console.warn(`Settings fetch attempt ${attempt} failed:`, error);
                    if (attempt < retries) {
                        await new Promise(r => setTimeout(r, 2000 * attempt)); // wait 2s, 4s
                    } else {
                        console.error('Failed to load settings after retries. Using defaults.');
                        setIsLoadingSettings(false);
                    }
                }
            }
        };
        fetchSettings();
    }, []);

    const login = async (storeName: string, password: string): Promise<boolean> => {
        // Normalize for comparison: lowercase and trimmed
        const normalizedInputName = storeName.toLowerCase().trim();
        const normalizedStoreName = storeProfile.storeName.toLowerCase().trim();

        if (normalizedInputName === normalizedStoreName && password === dbPassword) {
            setIsLoggedIn(true);
            localStorage.setItem('isLoggedIn', 'true');
            return true;
        }
        return false;
    };

    const register = async (password: string, storeName: string, ownerName: string) => {
        try {
            const newProfile = { ...storeProfile, storeName, ownerName };
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newProfile, password }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to register store');
            }

            setDbPassword(password);
            setStoreProfile(newProfile);
            setIsLoggedIn(true);
            localStorage.setItem('isLoggedIn', 'true');
        } catch (error) {
            console.error('Registration error:', error);
            alert('Gagal mendaftarkan toko. Silakan coba lagi.');
            throw error;
        }
    };

    const updateProfile = async (data: Partial<StoreProfile>) => {
        const updated = { ...storeProfile, ...data };
        setStoreProfile(updated);
        await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...updated, password: dbPassword }),
        });
    };

    const logout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('isLoggedIn');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, isLoadingSettings, storeProfile, login, logout, register, updateProfile }}>
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
