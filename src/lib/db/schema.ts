import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ==========================================
// Better Auth Core Tables
// ==========================================

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// ==========================================
// Auto Daily App Domain Tables
// ==========================================

export const userIntegrations = sqliteTable("user_integrations", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),

  // Azure DevOps Configuration
  azureOrganization: text("azure_organization"),
  azureProject: text("azure_project"),
  azureRepository: text("azure_repository"),
  azureUserEmail: text("azure_user_email"),
  encryptedAzurePat: text("encrypted_azure_pat"), // AES-256-GCM: iv:authTag:ciphertext

  // OptSolv Time Tracker Configuration
  optsolvUserEmail: text("optsolv_user_email"),
  encryptedOptsolvToken: text("encrypted_optsolv_token"), // AES-256-GCM: iv:authTag:ciphertext

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const dailies = sqliteTable("dailies", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  mode: text("mode").notNull(), // "azure-only" | "optsolv-only" | "combined-auto" | "combined-custom"
  period: text("period").notNull(), // "24h" | "48h" | "72h" | "7d" | "14d" | "30d"
  periodHours: integer("period_hours").notNull(),
  reportFormat: text("report_format").notNull(), // "standard" | "professional"
  customPrompt: text("custom_prompt"),
  sourcesSummary: text("sources_summary"), // JSON string
  windowStart: text("window_start"),
  windowEnd: text("window_end"),
  generatedAt: integer("generated_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type UserIntegrations = typeof userIntegrations.$inferSelect;
export type DailyRecord = typeof dailies.$inferSelect;
export type NewDailyRecord = typeof dailies.$inferInsert;
