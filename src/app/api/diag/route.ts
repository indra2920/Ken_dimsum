import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const hasUrl = !!process.env.DATABASE_URL;
    const urlLength = process.env.DATABASE_URL?.length || 0;
    const env = process.env.NODE_ENV;

    // Check other common vars to see if any env vars are visible
    const hasNextAuthUrl = !!process.env.NEXTAUTH_URL;

    return NextResponse.json({
        diagnostics: {
            database_url_exists: hasUrl,
            database_url_length: urlLength,
            node_env: env,
            vercel_env: process.env.VERCEL_ENV || 'unknown',
            nextauth_url_exists: hasNextAuthUrl,
            timestamp: new Date().toISOString()
        },
        instruction: hasUrl
            ? "Database logic should work now. Try hard refresh (Ctrl+F5)."
            : "DATABASE_URL masih kosong di runtime. Pastikan sudah klik SAVE di Vercel dan REDEPLOY."
    });
}
