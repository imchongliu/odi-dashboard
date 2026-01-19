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
import {
  investments,
  getTypeStats,
  getCountryStats,
  getIndustryStats,
  getMonthlyStats,
  getRecentDeals,
} from '@/lib/data';
import { formatCurrency } from '@/lib/types';
import { DollarSign, TrendingUp, Globe, Factory } from 'lucide-react';

export default function Home() {
  // Compute statistics
  const typeStats = getTypeStats();
  const countryStats = getCountryStats();
  const industryStats = getIndustryStats();
  const monthlyStats = getMonthlyStats();
  const recentDeals = getRecentDeals(8);
  
  const totalDeals = investments.length;
  const totalAmount = investments.reduce((sum, i) => sum + (i.deal_size_usd || 0), 0);
  const topCountry = countryStats[0]?.country || 'N/A';
  const topIndustry = industryStats[0]?.industry || 'N/A';

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
