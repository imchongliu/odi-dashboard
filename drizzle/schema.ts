import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Investments table for ODI data
 * Updated schema to support real investment data from Chinese listed companies
 */
export const investments = mysqlTable("investments", {
  id: int("id").autoincrement().primaryKey(),
  
  // Data source and quality
  sourceFile: varchar("source_file", { length: 500 }),
  extractionModel: varchar("extraction_model", { length: 100 }),
  extractionTokens: int("extraction_tokens"),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 4 }),
  validatedAt: timestamp("validated_at"),
  dataCompleteness: mysqlEnum("data_completeness", ["high", "medium", "low"]).default("high"),
  
  // Announcement information
  announcementDate: date("announcement_date").notNull(),
  announcementTitle: varchar("announcement_title", { length: 500 }),
  announcementStage: mysqlEnum("announcement_stage", ["筹划", "进展", "完成"]).default("筹划"),
  
  // Investor information
  stockCode: varchar("stock_code", { length: 50 }),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  exchange: varchar("exchange", { length: 100 }),
  companyProvince: varchar("company_province", { length: 100 }),
  companyIndustry: varchar("company_industry", { length: 100 }),
  
  // Investment information
  investmentType: mysqlEnum("investment_type", ["M&A", "Greenfield", "Other"]).notNull(),
  investmentRationale: text("investment_rationale"),
  
  // Target company information
  targetName: varchar("target_name", { length: 255 }),
  targetIndustry: varchar("target_industry", { length: 100 }),
  targetCountryCode: varchar("target_country_code", { length: 10 }),
  targetCountryName: varchar("target_country_name", { length: 100 }).notNull(),
  targetRegion: varchar("target_region", { length: 100 }),
  
  // Deal information
  dealSizeOriginal: decimal("deal_size_original", { precision: 20, scale: 2 }),
  originalCurrency: varchar("original_currency", { length: 10 }),
  dealSizeUsd: decimal("deal_size_usd", { precision: 20, scale: 2 }).notNull(),
  
  // Flexible field for type-specific data (M&A or Greenfield specifics)
  dealSpecifics: json("deal_specifics"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = typeof investments.$inferInsert;

// TypeScript types for deal_specifics JSON field
export interface GreenfieldSpecifics {
  type: 'greenfield';
  projectDescription?: string;
  investmentPhase?: 'Planning' | 'Construction' | 'Operational';
}

export interface PaymentStructure {
  cash?: number;
  stock?: number;
  debt?: number;
  description?: string;
}

export interface Earnout {
  exists: boolean;
  description?: string;
}

export interface TargetDetails {
  publicStatus?: 'Public' | 'Private';
  stockCode?: string;
  exchange?: string;
}

export interface MASpecifics {
  type: 'ma';
  transactionType?: 'Share Deal' | 'Asset Deal' | 'JV' | 'Other';
  paymentStructure?: PaymentStructure;
  premiumPercentage?: number;
  earnout?: Earnout;
  conditions?: string[];
  targetDetails?: TargetDetails;
  otherTerms?: string;
}

export type DealSpecifics = GreenfieldSpecifics | MASpecifics | null;
