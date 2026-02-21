import * as dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local (Next.js convention) — ignored if file doesn't exist (e.g. on Vercel)
dotenv.config({ path: ".env.local" });

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    // Use process.env directly with fallback so prisma generate doesn't fail
    // if DATABASE_URL is not yet available (e.g. during Vercel postinstall phase)
    datasource: {
        url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/placeholder",
    },
});
