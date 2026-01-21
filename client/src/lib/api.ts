/**
 * API hooks for investment data
 * 
 * Uses tRPC for type-safe API calls to the backend
 */

import { trpc } from './trpc';

// Re-export types from schema for frontend use
export type { Investment, DealSpecifics, MASpecifics, GreenfieldSpecifics } from '../../../drizzle/schema';

export interface InvestmentFilters {
  type?: 'M&A' | 'Greenfield' | 'Other' | null;
  country?: string | null;
  industry?: string | null;
  stage?: '筹划' | '进展' | '完成' | null;
  search?: string | null;
}

// Hook to get all investments with optional filters
export function useInvestments(filters?: InvestmentFilters) {
  return trpc.investments.list.useQuery(filters || {});
}

// Hook to get a single investment by ID
export function useInvestment(id: number) {
  return trpc.investments.detail.useQuery({ id });
}

// Hook to get aggregated statistics
export function useInvestmentStats() {
  return trpc.investments.stats.useQuery();
}

// Hook to get distinct countries for filter dropdown
export function useCountries() {
  return trpc.investments.countries.useQuery();
}

// Hook to get distinct industries for filter dropdown
export function useIndustries() {
  return trpc.investments.industries.useQuery();
}

// Hook for bulk creating investments
export function useBulkCreateInvestments() {
  return trpc.investments.bulkCreate.useMutation();
}

// Helper function to format currency
export function formatCurrency(amount: number | string | null | undefined, compact = false): string {
  if (amount === null || amount === undefined) return 'N/A';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return 'N/A';
  
  if (compact) {
    if (numAmount >= 1000000000) {
      return `$${(numAmount / 1000000000).toFixed(1)}B`;
    } else if (numAmount >= 1000000) {
      return `$${(numAmount / 1000000).toFixed(1)}M`;
    } else if (numAmount >= 1000) {
      return `$${(numAmount / 1000).toFixed(1)}K`;
    }
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
}

// Helper to check if deal specifics is M&A type
export function isMADeal(specifics: unknown): specifics is { type: 'ma' } {
  return specifics !== null && typeof specifics === 'object' && 'type' in specifics && (specifics as { type: string }).type === 'ma';
}

// Helper to check if deal specifics is Greenfield type
export function isGreenfieldDeal(specifics: unknown): specifics is { type: 'greenfield' } {
  return specifics !== null && typeof specifics === 'object' && 'type' in specifics && (specifics as { type: string }).type === 'greenfield';
}

// Helper function to format date
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
