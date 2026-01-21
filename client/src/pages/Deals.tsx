/**
 * Deals Database Page
 * 
 * Design: Executive Clarity
 * - Filterable and searchable deals table
 * - Left sidebar with filters (collapsible on mobile)
 * - Pagination for large datasets
 * - Dynamic columns based on investment type filter
 */

import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Filter, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';
import { formatCurrency, formatDate } from '@/lib/api';
import { InvestmentDetailModal } from '@/components/deals/InvestmentDetailModal';

const ITEMS_PER_PAGE = 12;

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
  const isCompleted = status === '完成' || status === 'Completed';
  const isPending = status === '筹划' || status === 'Pending';
  const isTerminated = status === '终止' || status === 'Terminated';
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        isCompleted && 'bg-[oklch(0.696_0.17_162.48/0.12)] text-[oklch(0.55_0.17_162.48)]',
        isPending && 'bg-[oklch(0.769_0.188_70.08/0.12)] text-[oklch(0.6_0.188_70.08)]',
        isTerminated && 'bg-[oklch(0.577_0.245_27.325/0.12)] text-[oklch(0.5_0.245_27.325)]'
      )}
    >
      {status}
    </span>
  );
}

export default function Deals() {
  const [filters, setFilters] = useState({
    type: 'all',
    country: 'all',
    industry: 'all',
    status: 'all',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvestment, setSelectedInvestment] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch data from database via tRPC
  const { data: investments, isLoading } = trpc.investments.list.useQuery({});
  const { data: countriesData } = trpc.investments.countries.useQuery();
  const { data: industriesData } = trpc.investments.industries.useQuery();

  const countries: string[] = countriesData || [];
  const industries: string[] = industriesData || [];

  // Filter investments
  const filteredDeals = useMemo(() => {
    if (!investments) return [];
    
    return investments.filter(inv => {
      // Type filter
      if (filters.type !== 'all' && inv.investmentType !== filters.type) {
        return false;
      }
      
      // Country filter
      if (filters.country !== 'all' && inv.targetCountryName !== filters.country) {
        return false;
      }
      
      // Industry filter - use company_industry (investor's industry)
      if (filters.industry !== 'all' && inv.companyIndustry !== filters.industry) {
        return false;
      }
      
      // Status filter
      if (filters.status !== 'all') {
        const statusMap: Record<string, string[]> = {
          'Completed': ['完成', 'Completed'],
          'Pending': ['筹划', 'Pending'],
          'Terminated': ['终止', 'Terminated'],
        };
        const validStatuses = statusMap[filters.status] || [];
        if (!validStatuses.includes(inv.announcementStage || '')) {
          return false;
        }
      }
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesInvestor = inv.companyName?.toLowerCase().includes(searchLower);
        const matchesTarget = inv.targetName?.toLowerCase().includes(searchLower);
        const matchesCountry = inv.targetCountryName?.toLowerCase().includes(searchLower);
        if (!matchesInvestor && !matchesTarget && !matchesCountry) {
          return false;
        }
      }
      
      return true;
    }).sort((a, b) => new Date(b.announcementDate).getTime() - new Date(a.announcementDate).getTime());
  }, [investments, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredDeals.length / ITEMS_PER_PAGE);
  const paginatedDeals = filteredDeals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      country: 'all',
      industry: 'all',
      status: 'all',
      search: '',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    filters.type !== 'all' ||
    filters.country !== 'all' ||
    filters.industry !== 'all' ||
    filters.status !== 'all' ||
    filters.search !== '';

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading deals...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container py-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Deals Database</h1>
            <p className="text-muted-foreground mt-1">
              Browse and filter all investment transactions
            </p>
          </div>

          {/* Filters */}
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search investor, target, or country..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Type Filter */}
              <Select
                value={filters.type}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="M&A">M&A</SelectItem>
                  <SelectItem value="Greenfield">Greenfield</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

              {/* Country Filter */}
              <Select
                value={filters.country}
                onValueChange={(value) => handleFilterChange('country', value)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((country: string) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Industry Filter */}
              <Select
                value={filters.industry}
                onValueChange={(value) => handleFilterChange('industry', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((industry: string) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* Results count */}
            <div className="mt-3 text-sm text-muted-foreground">
              Showing {paginatedDeals.length} of {filteredDeals.length} deals
            </div>
          </div>

          {/* Deals Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[100px]">Date</TableHead>
                    <TableHead className="w-[90px]">Type</TableHead>
                    <TableHead>Investor</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead className="text-right">Deal Size</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDeals.map((deal) => (
                    <TableRow
                      key={deal.id}
                      className="table-row-hover cursor-pointer"
                      onClick={() => {
                        setSelectedInvestment(deal);
                        setModalOpen(true);
                      }}
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
                        {deal.targetCountryName || 'N/A'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="max-w-[140px] truncate" title={deal.companyIndustry || 'N/A'}>
                          {deal.companyIndustry || 'N/A'}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Investment Detail Modal */}
      <InvestmentDetailModal
        investment={selectedInvestment}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
