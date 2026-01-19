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
}

function TypeBadge({ type }: { type: 'M&A' | 'Greenfield' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        type === 'M&A'
          ? 'bg-[oklch(0.585_0.233_292.717/0.12)] text-[oklch(0.485_0.233_292.717)]'
          : 'bg-[oklch(0.696_0.17_162.48/0.12)] text-[oklch(0.55_0.17_162.48)]'
      )}
    >
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: 'Completed' | 'Pending' | 'Terminated' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        status === 'Completed' && 'bg-[oklch(0.696_0.17_162.48/0.12)] text-[oklch(0.55_0.17_162.48)]',
        status === 'Pending' && 'bg-[oklch(0.769_0.188_70.08/0.12)] text-[oklch(0.6_0.188_70.08)]',
        status === 'Terminated' && 'bg-[oklch(0.577_0.245_27.325/0.12)] text-[oklch(0.5_0.245_27.325)]'
      )}
    >
      {status}
    </span>
  );
}

export function RecentDealsTable({ deals, showViewAll = true }: RecentDealsTableProps) {
  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Recent Deals</h3>
          <p className="text-sm text-muted-foreground">Latest investment announcements</p>
        </div>
        {showViewAll && (
          <Link
            href="/deals"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead className="w-[80px]">Type</TableHead>
              <TableHead>Investor</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="text-right">Deal Size</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => (
              <TableRow
                key={deal.id}
                className="table-row-hover cursor-pointer"
                onClick={() => window.location.href = `/deals/${deal.id}`}
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
                  {deal.target_country || 'N/A'}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(deal.deal_size_usd, true)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={deal.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
