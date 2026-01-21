/**
 * Destinations Page
 * 
 * Design: Executive Clarity
 * - Country ranking with charts and deal lists
 * - Aggregates all investment types (M&A + Greenfield)
 * - Click on country to filter deals
 */

import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { MapPin, ArrowRight, DollarSign, Briefcase, Building2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';
import { formatCurrency, formatDate } from '@/lib/api';
import { InvestmentDetailModal } from '@/components/deals/InvestmentDetailModal';
import { InvestmentMap } from '@/components/destinations/InvestmentMap';
import { useLanguage } from '@/contexts/LanguageContext';

function TypeBadge({ type }: { type: string }) {
  const isMA = type === 'M&A';
  const isGreenfield = type === 'Greenfield';
  const isOther = type === 'Other';
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium text-sm mb-1">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Deals:</span>
            <span className="text-sm font-medium">{payload[0]?.payload?.count}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className="text-sm font-medium">{formatCurrency(payload[0]?.value, true)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function Destinations() {
  const { t, translateCountry } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedInvestment, setSelectedInvestment] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Fetch data from database via tRPC
  const { data: investments, isLoading } = trpc.investments.list.useQuery({});
  const { data: stats } = trpc.investments.stats.useQuery();

  // Calculate country stats from investments
  const countryStats = useMemo(() => {
    if (!investments) return [];
    
    const countryMap = new Map<string, { count: number; totalAmount: number }>();
    
    investments.forEach(inv => {
      // Skip multi-country records (code = 'MULTI')
      if (inv.targetCountryCode === 'MULTI') return;
      
      const country = inv.targetCountryName || 'Unknown';
      const amount = parseFloat(inv.dealSizeUsd || '0');
      
      if (countryMap.has(country)) {
        const existing = countryMap.get(country)!;
        existing.count += 1;
        existing.totalAmount += amount;
      } else {
        countryMap.set(country, { count: 1, totalAmount: amount });
      }
    });
    
    return Array.from(countryMap.entries())
      .map(([country, data]) => ({
        country,
        count: data.count,
        totalAmount: data.totalAmount,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, [investments]);

  const topCountries = countryStats.slice(0, 10);
  
  // Get deals for selected country
  const countryDeals = useMemo(() => {
    if (!selectedCountry || !investments) return [];
    return investments.filter(inv => inv.targetCountryName === selectedCountry);
  }, [selectedCountry, investments]);

  // Calculate type breakdown for selected country
  const typeBreakdown = useMemo(() => {
    if (!selectedCountry || !investments) return [];
    const deals = investments.filter(inv => inv.targetCountryName === selectedCountry);
    const maDeals = deals.filter(d => d.investmentType === 'M&A');
    const gfDeals = deals.filter(d => d.investmentType === 'Greenfield');
    return [
      { name: 'M&A', value: maDeals.length, color: 'oklch(0.585 0.233 292.717)' },
      { name: 'Greenfield', value: gfDeals.length, color: 'oklch(0.696 0.17 162.48)' },
    ].filter(d => d.value > 0);
  }, [selectedCountry, investments]);

  // Summary stats
  const totalCountries = countryStats.length;
  const totalAmount = countryStats.reduce((sum, c) => sum + c.totalAmount, 0);
  const maCount = investments?.filter(i => i.investmentType === 'M&A').length || 0;
  const gfCount = investments?.filter(i => i.investmentType === 'Greenfield').length || 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading destinations...</p>
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
            <h1 className="text-2xl font-bold tracking-tight">{t.destinations.title}</h1>
            <p className="text-muted-foreground mt-1">
              {t.destinations.subtitle}
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.destinations.countries}</p>
                  <p className="text-xl font-bold">{totalCountries}</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.destinations.totalValue}</p>
                  <p className="text-xl font-bold">{formatCurrency(totalAmount, true)}</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[oklch(0.585_0.233_292.717/0.1)]">
                  <Briefcase className="h-5 w-5 text-[oklch(0.485_0.233_292.717)]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.destinations.maDeals}</p>
                  <p className="text-xl font-bold">{maCount}</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[oklch(0.696_0.17_162.48/0.1)]">
                  <Building2 className="h-5 w-5 text-[oklch(0.55_0.17_162.48)]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.destinations.greenfield}</p>
                  <p className="text-xl font-bold">{gfCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Map */}
          <div className="mb-6">
            <div className="chart-container">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">{t.destinations.mapTitle}</h3>
                <p className="text-sm text-muted-foreground">{t.destinations.mapSubtitle}</p>
              </div>
              <div className="h-[500px]">
                <InvestmentMap 
                  countryStats={countryStats} 
                  onCountryClick={(country) => setSelectedCountry(country)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Country Ranking */}
            <div className="lg:col-span-2 space-y-6" style={{height: '766px'}}>
              {/* Country Table */}
              <div className="chart-container">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.destinations.allDestinations}</h3>
                  <p className="text-sm text-muted-foreground">{t.destinations.allDestinationsSubtitle}</p>
                </div>
                <div className="overflow-x-auto max-h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[50px]">{t.destinations.columns.rank}</TableHead>
                        <TableHead>{t.destinations.columns.country}</TableHead>
                        <TableHead className="text-center">{t.destinations.columns.deals}</TableHead>
                        <TableHead className="text-right">{t.destinations.columns.totalValue}</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {countryStats.map((country, index) => (
                        <TableRow
                          key={country.country}
                          className={cn(
                            'table-row-hover cursor-pointer',
                            selectedCountry === country.country && 'bg-primary/5'
                          )}
                          onClick={() => setSelectedCountry(country.country)}
                        >
                          <TableCell className="font-medium text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {translateCountry(country.country)}
                          </TableCell>
                          <TableCell className="text-center tabular-nums">
                            {country.count}
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            {formatCurrency(country.totalAmount, true)}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Right Column - Selected Country Details */}
            <div className="space-y-6">
              {selectedCountry ? (
                <>
                  {/* Country Header */}
                  <div className="chart-container">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{translateCountry(selectedCountry)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {countryDeals.length} deal{countryDeals.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    {/* Type Breakdown */}
                    {typeBreakdown.length > 0 && (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-32 h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={typeBreakdown}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={55}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {typeBreakdown.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="ml-4 space-y-2">
                          {typeBreakdown.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-sm" 
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-sm">{item.name}: {item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Deals List */}
                  <div className="chart-container">
                    <h4 className="font-medium mb-3">Deals in {selectedCountry}</h4>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {countryDeals.map((deal) => (
                        <div
                          key={deal.id}
                          onClick={() => {
                            setSelectedInvestment(deal);
                            setModalOpen(true);
                          }}
                          className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-medium text-sm truncate flex-1">
                              {deal.companyName}
                            </span>
                            <TypeBadge type={deal.investmentType || 'Other'} />
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {deal.targetName || 'New project'}
                          </p>
                          <div className="flex items-center justify-between mt-2 text-sm">
                            <span className="text-muted-foreground">
                              {formatDate(deal.announcementDate instanceof Date 
                                ? deal.announcementDate.toISOString() 
                                : String(deal.announcementDate))}
                            </span>
                            <span className="font-medium tabular-nums">
                              {formatCurrency(parseFloat(deal.dealSizeUsd || '0'), true)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="chart-container">
                  <div className="text-center py-12 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">{t.destinations.selectCountry}</p>
                    <p className="text-sm mt-1">{t.destinations.selectCountrySubtitle}</p>
                  </div>
                </div>
              )}
            </div>
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
