import * as dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load .env.local which is used by Next.js
dotenv.config({ path: ".env.local" });

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: env("DATABASE_URL"),
    },
});
