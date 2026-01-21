/**
 * TopDealsTable Component
 * 
 * Design: Executive Clarity
 * - Table format matching Deals Database page
 * - Shows top 10 deals sorted by deal size
 * - Link to view more deals
 */

import { formatCurrency, formatDate } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Deal {
  id: number;
  companyName: string;
  targetName: string | null;
  targetCountryName: string;
  companyIndustry: string | null;
  dealSizeUsd: string;
  announcementDate: Date | string;
  announcementStage: string | null;
  investmentType: string;
}

interface TopDealsTableProps {
  deals: Deal[];
  limit?: number;
}

function TypeBadge({ type }: { type: string }) {
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
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();
  
  // Translate status value (handles both Chinese and English)
  const translatedStatus = t.status[status as keyof typeof t.status] || status;
  
  // Determine color based on status value
  const isCompleted = status === 'Completed' || status === '完成';
  const isPlanning = status === 'Planning' || status === '筹划';
  const isProgress = status === 'In Progress' || status === '进展';
  const isTerminated = status === 'Terminated' || status === '终止';
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        isCompleted && 'bg-[oklch(0.696_0.17_162.48/0.12)] text-[oklch(0.55_0.17_162.48)]', // Green for Completed
        isPlanning && 'bg-[oklch(0.769_0.188_70.08/0.12)] text-[oklch(0.6_0.188_70.08)]', // Yellow for Planning
        isProgress && 'bg-[oklch(0.585_0.233_292.717/0.12)] text-[oklch(0.485_0.233_292.717)]', // Blue for In Progress
        isTerminated && 'bg-[oklch(0.577_0.245_27.325/0.12)] text-[oklch(0.5_0.245_27.325)]' // Red for Terminated
      )}
    >
      {translatedStatus}
    </span>
  );
}

export function TopDealsTable({ deals, limit = 10 }: TopDealsTableProps) {
  const { t, translateCountry, translateIndustry } = useLanguage();
  
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
      
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px]">{t.deals.columns.date}</TableHead>
                <TableHead className="w-[90px]">{t.deals.columns.type}</TableHead>
                <TableHead>{t.deals.columns.investor}</TableHead>
                <TableHead>{t.deals.columns.target}</TableHead>
                <TableHead>{t.deals.columns.country}</TableHead>
                <TableHead>{t.deals.columns.industry}</TableHead>
                <TableHead className="text-right">{t.deals.columns.dealSize}</TableHead>
                <TableHead className="w-[100px]">{t.deals.columns.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topDeals.map((deal) => (
                <TableRow
                  key={deal.id}
                  className="table-row-hover"
                >
                  <TableCell className="font-medium tabular-nums text-muted-foreground">
                    {formatDate(deal.announcementDate instanceof Date 
                      ? deal.announcementDate.toISOString() 
                      : String(deal.announcementDate))}
                  </TableCell>
                  <TableCell>
                    <TypeBadge type={deal.investmentType || 'Other'} />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="max-w-[180px] truncate" title={deal.companyName}>
                      {deal.companyName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[160px] truncate text-muted-foreground" title={deal.targetName || 'N/A'}>
                      {deal.targetName || <span className="italic">New project</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {translateCountry(deal.targetCountryName) || 'N/A'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="max-w-[140px] truncate" title={deal.companyIndustry || 'N/A'}>
                      {translateIndustry(deal.companyIndustry || 'N/A')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(parseFloat(deal.dealSizeUsd || '0'), true)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={deal.announcementStage || 'Pending'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
