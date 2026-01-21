import { eq, desc, sql, and, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, investments, InsertInvestment, Investment } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// Investment queries
// ============================================

export interface InvestmentFilters {
  type?: 'M&A' | 'Greenfield' | 'Other' | null;
  country?: string | null;
  industry?: string | null;
  stage?: '筹划' | '进展' | '完成' | null;
  search?: string | null;
}

export async function getAllInvestments(filters?: InvestmentFilters): Promise<Investment[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get investments: database not available");
    return [];
  }

  try {
    let query = db.select().from(investments);
    
    const conditions = [];
    
    if (filters?.type) {
      conditions.push(eq(investments.investmentType, filters.type));
    }
    if (filters?.country) {
      conditions.push(eq(investments.targetCountryName, filters.country));
    }
    if (filters?.industry) {
      // Use company_industry (investor's industry) instead of target_industry
      conditions.push(eq(investments.companyIndustry, filters.industry));
    }
    if (filters?.stage) {
      conditions.push(eq(investments.announcementStage, filters.stage));
    }
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          like(investments.companyName, searchTerm),
          like(investments.targetName, searchTerm)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    
    const result = await query.orderBy(desc(investments.announcementDate));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get investments:", error);
    return [];
  }
}

export async function getInvestmentById(id: number): Promise<Investment | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get investment: database not available");
    return null;
  }

  try {
    const result = await db.select().from(investments).where(eq(investments.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get investment:", error);
    return null;
  }
}

export async function createInvestment(data: InsertInvestment): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create investment: database not available");
    return null;
  }

  try {
    const result = await db.insert(investments).values(data);
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to create investment:", error);
    return null;
  }
}

export async function createManyInvestments(data: InsertInvestment[]): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create investments: database not available");
    return false;
  }

  try {
    await db.insert(investments).values(data);
    return true;
  } catch (error) {
    console.error("[Database] Failed to create investments:", error);
    return false;
  }
}

export async function getInvestmentStats() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get stats: database not available");
    return null;
  }

  try {
    // Get all investments for aggregation (exclude multi-country records)
    const allInvestments = await db.select().from(investments);
    
    // Calculate stats
    const maDeals = allInvestments.filter(i => i.investmentType === 'M&A');
    const greenfieldDeals = allInvestments.filter(i => i.investmentType === 'Greenfield');
    const otherDeals = allInvestments.filter(i => i.investmentType === 'Other');
    
    const maTotal = maDeals.reduce((sum, i) => sum + (parseFloat(i.dealSizeUsd || '0')), 0);
    const greenfieldTotal = greenfieldDeals.reduce((sum, i) => sum + (parseFloat(i.dealSizeUsd || '0')), 0);
    const otherTotal = otherDeals.reduce((sum, i) => sum + (parseFloat(i.dealSizeUsd || '0')), 0);
    
    // Country stats - group by target_country_code to avoid duplicates
    // Exclude multi-country records (code = 'MULTI')
    const countryMap = new Map<string, { count: number; total: number; name: string }>();
    allInvestments.forEach(i => {
      const countryCode = i.targetCountryCode || 'Unknown';
      // Skip multi-country records
      if (countryCode === 'MULTI') return;
      
      const countryName = i.targetCountryName || 'Unknown';
      const current = countryMap.get(countryCode) || { count: 0, total: 0, name: countryName };
      countryMap.set(countryCode, {
        count: current.count + 1,
        total: current.total + (parseFloat(i.dealSizeUsd || '0')),
        name: countryName // Keep the first name encountered for this code
      });
    });
    
    // Industry stats - use company_industry (investor's industry) instead of target_industry
    const industryMap = new Map<string, { count: number; total: number }>();
    allInvestments.forEach(i => {
      const industry = i.companyIndustry || 'Unknown';
      const current = industryMap.get(industry) || { count: 0, total: 0 };
      industryMap.set(industry, {
        count: current.count + 1,
        total: current.total + (parseFloat(i.dealSizeUsd || '0'))
      });
    });
    
    // Monthly stats
    const monthlyMap = new Map<string, { ma: number; greenfield: number }>();
    allInvestments.forEach(i => {
      const date = new Date(i.announcementDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = monthlyMap.get(monthKey) || { ma: 0, greenfield: 0 };
      if (i.investmentType === 'M&A') {
        current.ma++;
      } else {
        current.greenfield++;
      }
      monthlyMap.set(monthKey, current);
    });
    
    return {
      typeStats: {
        ma: { count: maDeals.length, total: maTotal },
        greenfield: { count: greenfieldDeals.length, total: greenfieldTotal },
        other: { count: otherDeals.length, total: otherTotal }
      },
      countryStats: Array.from(countryMap.entries())
        .map(([countryCode, stats]) => ({ 
          countryCode, 
          country: stats.name, 
          count: stats.count, 
          total: stats.total 
        }))
        .sort((a, b) => b.total - a.total),
      industryStats: Array.from(industryMap.entries())
        .map(([industry, stats]) => ({ industry, ...stats }))
        .sort((a, b) => b.total - a.total),
      monthlyStats: Array.from(monthlyMap.entries())
        .map(([month, stats]) => ({ month, ...stats }))
        .sort((a, b) => a.month.localeCompare(b.month)),
      totalDeals: allInvestments.length,
      totalAmount: maTotal + greenfieldTotal + otherTotal
    };
  } catch (error) {
    console.error("[Database] Failed to get stats:", error);
    return null;
  }
}

export async function getDistinctCountries(): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    // Get distinct country codes to avoid duplicates like "香港", "中国香港", etc.
    const result = await db.selectDistinct({ 
      code: investments.targetCountryCode,
      name: investments.targetCountryName 
    }).from(investments);
    
    // Group by code and return the first name for each code
    // Exclude multi-country records (code = 'MULTI')
    const countryMap = new Map<string, string>();
    result.forEach(r => {
      if (r.code && r.name && r.code !== 'MULTI' && !countryMap.has(r.code)) {
        countryMap.set(r.code, r.name);
      }
    });
    
    return Array.from(countryMap.values());
  } catch (error) {
    console.error("[Database] Failed to get countries:", error);
    return [];
  }
}

export async function getDistinctIndustries(): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    // Use company_industry (investor's industry) instead of target_industry
    const result = await db.selectDistinct({ industry: investments.companyIndustry }).from(investments);
    return result.map(r => r.industry).filter((i): i is string => i !== null);
  } catch (error) {
    console.error("[Database] Failed to get industries:", error);
    return [];
  }
}
