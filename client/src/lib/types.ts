/**
 * Type Definitions for China ODI Dashboard
 * 
 * Design: Layered data model to handle heterogeneity between M&A and Greenfield investments
 * - Core fields cover all investment types
 * - deal_specifics JSONB stores type-specific details
 */

// Greenfield specific fields
export interface GreenfieldSpecifics {
  type: 'greenfield';
  project_description?: string;
  investment_phase?: 'Planning' | 'Construction' | 'Operational';
}

// M&A specific fields (all optional - record what's available)
export interface MASpecifics {
  type: 'ma';
  transaction_type?: 'Share Deal' | 'Asset Deal' | 'JV' | 'Other';

  payment_structure?: {
    cash?: number;
    stock?: number;
    debt?: number;
    description?: string;
  };

  premium_percentage?: number;

  earnout?: {
    exists: boolean;
    description?: string;
  };

  conditions?: string[];

  target_details?: {
    public_status?: 'Public' | 'Private';
    stock_code?: string;
    exchange?: string;
  };

  other_terms?: string;
}

export type DealSpecifics = GreenfieldSpecifics | MASpecifics | null;

// Investment type enum
export type InvestmentType = 'M&A' | 'Greenfield';

// Investment status enum
export type InvestmentStatus = 'Completed' | 'Pending' | 'Terminated';

// Main investment interface
export interface Investment {
  id: number;
  announcement_date: string;
  investor_name: string;
  investor_stock_code: string | null;
  target_country: string | null;
  target_company_name: string | null;
  target_industry: string | null;
  investment_type: InvestmentType;
  deal_size_usd: number | null;
  status: InvestmentStatus;
  deal_specifics: DealSpecifics;
  created_at: string;
}

// Statistics interfaces
export interface TypeStats {
  type: InvestmentType;
  count: number;
  totalAmount: number;
}

export interface CountryStats {
  country: string;
  count: number;
  totalAmount: number;
  maCount: number;
  greenfieldCount: number;
}

export interface IndustryStats {
  industry: string;
  count: number;
  totalAmount: number;
}

export interface MonthlyStats {
  month: string;
  count: number;
  totalAmount: number;
  maCount: number;
  greenfieldCount: number;
}

// Filter options
export interface FilterOptions {
  type: InvestmentType | 'all';
  country: string | 'all';
  industry: string | 'all';
  status: InvestmentStatus | 'all';
  search: string;
}

// M&A Insights specific interfaces
export interface PaymentStructureStats {
  method: string;
  count: number;
  percentage: number;
}

export interface PremiumRangeStats {
  range: string;
  count: number;
  percentage: number;
}

export interface TransactionTypeStats {
  type: string;
  count: number;
  percentage: number;
}

// Helper type guards
export function isMASpecifics(specs: DealSpecifics): specs is MASpecifics {
  return specs?.type === 'ma';
}

export function isGreenfieldSpecifics(specs: DealSpecifics): specs is GreenfieldSpecifics {
  return specs?.type === 'greenfield';
}

// Utility function to get data completeness score
export function getDataCompleteness(investment: Investment): number {
  let score = 0;
  const total = 5;

  if (investment.deal_size_usd) score++;
  if (investment.target_company_name) score++;
  if (investment.deal_specifics) score++;
  
  if (isMASpecifics(investment.deal_specifics)) {
    if (investment.deal_specifics.payment_structure) score++;
    if (investment.deal_specifics.conditions?.length) score++;
  } else {
    // Greenfield doesn't need these fields
    score += 2;
  }

  return Math.round((score / total) * 100);
}

// Format currency
export function formatCurrency(amount: number | null, compact = false): string {
  if (amount === null || amount === undefined) return 'N/A';
  
  if (compact) {
    if (amount >= 1e9) {
      return `$${(amount / 1e9).toFixed(1)}B`;
    }
    if (amount >= 1e6) {
      return `$${(amount / 1e6).toFixed(1)}M`;
    }
    if (amount >= 1e3) {
      return `$${(amount / 1e3).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
