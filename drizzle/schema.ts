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
 * Uses JSONB-style field (deal_specifics) for flexible M&A/Greenfield specific data
 */
export const investments = mysqlTable("investments", {
  id: int("id").autoincrement().primaryKey(),
  
  // Announcement date
  announcementDate: date("announcement_date").notNull(),
  
  // Investor information
  investorName: varchar("investor_name", { length: 255 }).notNull(),
  investorStockCode: varchar("investor_stock_code", { length: 50 }),
  
  // Target information
  targetCountry: varchar("target_country", { length: 100 }),
  targetCompanyName: varchar("target_company_name", { length: 255 }),
  targetIndustry: varchar("target_industry", { length: 100 }),
  
  // Deal basic information
  investmentType: mysqlEnum("investment_type", ["M&A", "Greenfield"]).notNull(),
  dealSizeUsd: decimal("deal_size_usd", { precision: 15, scale: 2 }),
  status: mysqlEnum("status", ["Completed", "Pending", "Terminated"]).default("Pending").notNull(),
  
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
