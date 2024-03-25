import type { Config } from "drizzle-kit";
export default {
    schema: "./app/schema.ts",
    out: "./drizzle",
    // dbCredentials: {
        // uri: process.env.DATABASE_URL,
    // }
} satisfies Config;