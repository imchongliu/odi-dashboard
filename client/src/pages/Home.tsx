/**
 * Home Page
 * 
 * Design: Executive Clarity
 * - Hero section with key metrics
 * - Type-specific stat cards (M&A vs Greenfield)
 * - Charts section with monthly trend and distributions
 * - Recent deals table
 * 
 * Layout: Top KPI cards → Charts grid → Recent deals table
 */

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StatCard } from '@/components/stats/StatCard';
import { TypeStatCards } from '@/components/stats/TypeStatCards';
import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart';
import { CountryBarChart } from '@/components/charts/CountryBarChart';
import { IndustryBarChart } from '@/components/charts/IndustryBarChart';
import { TopCountriesTable } from '@/components/stats/TopCountriesTable';
import { RecentDealsTable } from '@/components/deals/RecentDealsTable';
import { trpc } from '@/lib/trpc';
import { formatCurrency } from '@/lib/api';
import { DollarSign, TrendingUp, Globe, Factory, Loader2 } from 'lucide-react';

export default function Home() {
  // Fetch data from database via tRPC
  const { data: stats, isLoading: statsLoading } = trpc.investments.stats.useQuery();
  const { data: investments, isLoading: investmentsLoading } = trpc.investments.list.useQuery({});
  
  const isLoading = statsLoading || investmentsLoading;
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading investment data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Extract stats from API response
  const typeStats = stats?.typeStats || { ma: { count: 0, total: 0 }, greenfield: { count: 0, total: 0 } };
  const rawCountryStats = stats?.countryStats || [];
  const rawIndustryStats = stats?.industryStats || [];
  const rawMonthlyStats = stats?.monthlyStats || [];
  
  // Transform monthly stats to match component interface
  const monthlyStats = rawMonthlyStats.map(m => ({
    month: m.month,
    count: m.ma + m.greenfield,
    maCount: m.ma,
    greenfieldCount: m.greenfield,
    totalAmount: 0 // Not available from API, using 0
  }));
  const totalDeals = stats?.totalDeals || 0;
  const totalAmount = stats?.totalAmount || 0;
  
  // Transform country stats to match component interface
  const countryStats = rawCountryStats.map(c => ({
    country: c.country,
    count: c.count,
    totalAmount: c.total
  }));
  
  // Transform industry stats to match component interface
  const industryStats = rawIndustryStats.map(i => ({
    industry: i.industry,
    count: i.count,
    totalAmount: i.total
  }));
  
  const topCountry = countryStats[0]?.country || 'N/A';
  const topIndustry = industryStats[0]?.industry || 'N/A';
  
  // Get recent deals (last 8) - transform to match Investment interface
  const recentDeals = (investments || [])
    .sort((a, b) => new Date(b.announcementDate).getTime() - new Date(a.announcementDate).getTime())
    .slice(0, 8)
    .map(inv => ({
      id: inv.id,
      announcement_date: inv.announcementDate instanceof Date 
        ? inv.announcementDate.toISOString().split('T')[0] 
        : String(inv.announcementDate).split('T')[0],
      investor_name: inv.companyName,
      investor_stock_code: inv.stockCode || null,
      target_country: inv.targetCountryName,
      target_company_name: inv.targetName || 'New project',
      target_industry: inv.targetIndustry || null,
      investment_type: (inv.investmentType === 'M&A' || inv.investmentType === 'Greenfield' 
        ? inv.investmentType : 'M&A') as 'M&A' | 'Greenfield',
      deal_size_usd: parseFloat(inv.dealSizeUsd || '0'),
      status: (inv.announcementStage === '完成' ? 'Completed' : 
               inv.announcementStage === '筹划' ? 'Pending' : 'Pending') as 'Completed' | 'Pending' | 'Terminated',
      deal_specifics: null as any,
      created_at: inv.createdAt instanceof Date 
        ? inv.createdAt.toISOString() 
        : String(inv.createdAt || new Date().toISOString()),
    }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-muted/50 to-background">
          <div className="container py-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">
                China Outbound Investment Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Track M&A and Greenfield investments by Chinese listed companies worldwide
              </p>
            </div>
            
            {/* Type-specific cards */}
            <TypeStatCards
              maCount={typeStats.ma.count}
              maTotal={typeStats.ma.total}
              greenfieldCount={typeStats.greenfield.count}
              greenfieldTotal={typeStats.greenfield.total}
            />
            
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <StatCard
                label="Total Deals"
                value={totalDeals}
                icon={TrendingUp}
              />
              <StatCard
                label="Total Value"
                value={formatCurrency(totalAmount, true)}
                icon={DollarSign}
              />
              <StatCard
                label="Top Destination"
                value={topCountry}
                icon={Globe}
              />
              <StatCard
                label="Top Industry"
                value={topIndustry}
                icon={Factory}
              />
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section className="container py-8">
          {/* Monthly Trend - Full Width */}
          <div className="mb-6">
            <MonthlyTrendChart data={monthlyStats} />
          </div>
          
          {/* Country and Industry Charts - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <CountryBarChart data={countryStats} limit={8} />
            <IndustryBarChart data={industryStats} limit={8} />
          </div>
          
          {/* Top Countries Table */}
          <div className="mb-6">
            <TopCountriesTable data={countryStats} limit={10} />
          </div>
        </section>

        {/* Recent Deals Section */}
        <section className="container pb-12">
          <RecentDealsTable deals={recentDeals} showViewAll={true} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
