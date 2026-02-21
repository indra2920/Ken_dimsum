// Deployment trigger: 2026-02-21 v3 (Proxy Fix)
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProductProvider } from "@/context/ProductContext";
import { AuthProvider } from "@/context/AuthContext";
import { OrderProvider } from "@/context/OrderContext";
import OrderNotification from "@/components/OrderNotification";
import { Suspense } from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ken Dimsum - Multi Store Platform",
  description: "Platform pemesanan dimsum premium untuk berbagai toko.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>}>
          <AuthProvider>
            <OrderProvider>
              <ProductProvider>
                {children}
              </ProductProvider>
              <OrderNotification />
            </OrderProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
