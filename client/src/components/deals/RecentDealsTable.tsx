/**
 * RecentDealsTable Component
 * 
 * Design: Executive Clarity
 * - Clean table with hover effects
 * - Type badges for M&A/Greenfield
 * - Status badges with color coding
 * - Clickable rows linking to detail pages
 */

import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Investment } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface RecentDealsTableProps {
  deals: Investment[];
  showViewAll?: boolean;
  onDealClick?: (deal: Investment) => void;
}

function TypeBadge({ type }: { type: string }) {
  const { t } = useLanguage();
  const isMA = type === 'M&A';
  const isGreenfield = type === 'Greenfield';
  const isOther = type === 'Other';
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        isMA
          ? 'bg-[oklch(0.585_0.233_292.717/0.12)] text-[oklch(0.485_0.233_292.717)]'
          : isGreenfield
          ? 'bg-[oklch(0.696_0.17_162.48/0.12)] text-[oklch(0.55_0.17_162.48)]'
          : isOther
          ? 'bg-[oklch(0.75_0.15_50/0.12)] text-[oklch(0.65_0.15_50)]'
          : 'bg-muted text-muted-foreground'
      )}
    >
      {t.investmentType[type.toLowerCase() as 'ma' | 'greenfield' | 'other'] || type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();
  
  // Translate status value (handles both Chinese and English)
  const translatedStatus = t.status[status as keyof typeof t.status] || status;
  
  // Determine color based on status value
  const isCompleted = status === 'Completed' || status === '完成';
  const isPending = status === 'Pending' || status === '筹划';
  const isProgress = status === 'In Progress' || status === '进展';
  const isTerminated = status === 'Terminated' || status === '终止';
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        isCompleted && 'bg-[oklch(0.696_0.17_162.48/0.12)] text-[oklch(0.55_0.17_162.48)]',
        (isPending || isProgress) && 'bg-[oklch(0.769_0.188_70.08/0.12)] text-[oklch(0.6_0.188_70.08)]',
        isTerminated && 'bg-[oklch(0.577_0.245_27.325/0.12)] text-[oklch(0.5_0.245_27.325)]'
      )}
    >
      {translatedStatus}
    </span>
  );
}

export function RecentDealsTable({ deals, showViewAll = true, onDealClick }: RecentDealsTableProps) {
  const { t, translateCountry } = useLanguage();
  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{t.overview.recentDeals}</h3>
          <p className="text-sm text-muted-foreground">{t.overview.recentDealsSubtitle}</p>
        </div>
        {showViewAll && (
          <Link
            href="/deals"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {t.common.viewAll}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[100px]">{t.deals.columns.date}</TableHead>
              <TableHead className="w-[80px]">{t.deals.columns.type}</TableHead>
              <TableHead>{t.deals.columns.investor}</TableHead>
              <TableHead>{t.deals.columns.target}</TableHead>
              <TableHead>{t.deals.columns.country}</TableHead>
              <TableHead className="text-right">{t.deals.columns.dealSize}</TableHead>
              <TableHead className="w-[100px]">{t.deals.columns.status}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => (
              <TableRow
                key={deal.id}
                className="table-row-hover cursor-pointer"
                onClick={() => onDealClick?.(deal)}
              >
                <TableCell className="font-medium tabular-nums text-muted-foreground">
                  {formatDate(deal.announcement_date)}
                </TableCell>
                <TableCell>
                  <TypeBadge type={deal.investment_type} />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="max-w-[200px] truncate" title={deal.investor_name}>
                    {deal.investor_name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[180px] truncate text-muted-foreground" title={deal.target_company_name || 'N/A'}>
                    {deal.target_company_name || <span className="italic">New project</span>}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {deal.target_country ? translateCountry(deal.target_country) : 'N/A'}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(deal.deal_size_usd, true)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={(deal as any).announcementStage || (deal as any).announcement_stage || '筹划'} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
