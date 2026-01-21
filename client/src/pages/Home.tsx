/**
 * Home Page
 * 
 * Design: Executive Clarity
 * - Hero section with key metrics
 * - Type-specific stat cards (M&A vs Greenfield)
 * - Charts section with monthly trend and distributions
 * - Deal Size Top 10 table
 * 
 * Layout: Top KPI cards → Charts grid → Deal Size Top 10 table
 */

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StatCard } from '@/components/stats/StatCard';
import { TypeStatCards } from '@/components/stats/TypeStatCards';
import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart';
import { CountryBarChart } from '@/components/charts/CountryBarChart';
import { IndustryBarChart } from '@/components/charts/IndustryBarChart';
import { TopCountriesTable } from '@/components/stats/TopCountriesTable';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { formatCurrency } from '@/lib/api';
import { DollarSign, TrendingUp, Globe, Factory, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const { t, translateCountry, translateIndustry } = useLanguage();

  
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
            <p className="text-muted-foreground">{t.common.loading}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Extract stats from API response
  const typeStats = stats?.typeStats || { ma: { count: 0, total: 0 }, greenfield: { count: 0, total: 0 }, other: { count: 0, total: 0 } };
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
  


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-muted/50 to-background">
          <div className="container py-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">
                {t.overview.title}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t.overview.subtitle}
              </p>
            </div>
            
            {/* Type-specific cards */}
            <TypeStatCards
              maCount={typeStats.ma.count}
              maTotal={typeStats.ma.total}
              greenfieldCount={typeStats.greenfield.count}
              greenfieldTotal={typeStats.greenfield.total}
              otherCount={typeStats.other?.count || 0}
              otherTotal={typeStats.other?.total || 0}
            />
            
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <StatCard
                label={t.overview.totalDeals}
                value={totalDeals}
                icon={TrendingUp}
              />
              <StatCard
                label={t.overview.totalValue}
                value={formatCurrency(totalAmount, true)}
                icon={DollarSign}
              />
              <StatCard
                label={t.overview.topDestination}
                value={translateCountry(topCountry)}
                icon={Globe}
              />
              <StatCard
                label={t.overview.topIndustry}
                value={translateIndustry(topIndustry)}
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


      </main>

      <Footer />
    </div>
  );
}
