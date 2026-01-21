/**
 * TopDealsTable Component
 * 
 * Design: Executive Clarity
 * - Ranked list of top deals by deal size
 * - Shows investor, target, country, and deal amount
 * - Link to view more deals
 */

import { formatCurrency, formatDate } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

interface Deal {
  id: number;
  companyName: string;
  targetName: string | null;
  targetCountryName: string;
  dealSizeUsd: string;
  announcementDate: Date | string;
  investmentType: string;
}

interface TopDealsTableProps {
  deals: Deal[];
  limit?: number;
}

export function TopDealsTable({ deals, limit = 10 }: TopDealsTableProps) {
  const { t, translateCountry } = useLanguage();
  
  // Sort by deal size and take top N
  const topDeals = [...deals]
    .sort((a, b) => parseFloat(b.dealSizeUsd || '0') - parseFloat(a.dealSizeUsd || '0'))
    .slice(0, limit);

  return (
    <div className="chart-container">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t.overview.topCountries}</h3>
          <p className="text-sm text-muted-foreground">
            {t.overview.topDealsSubtitle || 'Largest deals by transaction value'}
          </p>
        </div>
        <Link href="/deals">
          <a className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            {t.common.viewAll}
            <ArrowRight className="h-4 w-4" />
          </a>
        </Link>
      </div>
      
      <div className="space-y-3">
        {topDeals.map((deal, index) => {
          const dealSize = parseFloat(deal.dealSizeUsd || '0');
          const maxDealSize = parseFloat(topDeals[0]?.dealSizeUsd || '1');
          const percentage = (dealSize / maxDealSize) * 100;
          
          return (
            <div key={deal.id} className="group">
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold shrink-0',
                      index < 3
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{deal.companyName}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="truncate">
                        {deal.targetName || 'New project'}
                      </span>
                      <span>•</span>
                      <span>{translateCountry(deal.targetCountryName)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <div className="font-semibold tabular-nums">
                    {formatCurrency(dealSize, true)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(deal.announcementDate)}
                  </div>
                </div>
              </div>
              <div className="ml-9 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/70 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
