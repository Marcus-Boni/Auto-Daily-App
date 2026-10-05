import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL || "file:local.db",
    // Vazio no .env.example: um banco local (file:) não usa token.
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  },
});
