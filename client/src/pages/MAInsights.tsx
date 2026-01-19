/**
 * M&A Insights Page
 * 
 * Design: Executive Clarity
 * - Deep analysis of M&A type investments only
 * - Payment structure distribution
 * - Premium distribution
 * - Earnout usage analysis
 * - Transaction type breakdown
 * - Conditional rendering: only show charts with sufficient data
 */

import { useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
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
import { Briefcase, DollarSign, TrendingUp, Percent, FileCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { investments } from '@/lib/data';
import { formatCurrency, isMASpecifics } from '@/lib/types';
import type { Investment, MASpecifics } from '@/lib/types';

// Get all M&A deals
const maDeals = investments.filter(i => i.investment_type === 'M&A' && isMASpecifics(i.deal_specifics));

// Color palette
const colors = {
  primary: 'oklch(0.585 0.233 292.717)',
  secondary: 'oklch(0.623 0.214 259.815)',
  tertiary: 'oklch(0.696 0.17 162.48)',
  quaternary: 'oklch(0.769 0.188 70.08)',
  quinary: 'oklch(0.704 0.191 22.216)',
};

const pieColors = [colors.primary, colors.secondary, colors.tertiary, colors.quaternary, colors.quinary];

function StatCard({ label, value, subValue, icon: Icon, color = 'primary' }: {
  label: string;
  value: string | number;
  subValue?: string;
  icon: any;
  color?: 'primary' | 'ma';
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          {subValue && (
            <p className="text-sm text-muted-foreground">{subValue}</p>
          )}
        </div>
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          color === 'ma' 
            ? 'bg-[oklch(0.585_0.233_292.717/0.1)] text-[oklch(0.485_0.233_292.717)]'
            : 'bg-primary/10 text-primary'
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium text-sm">{payload[0]?.name}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {payload[0]?.value} deal{payload[0]?.value !== 1 ? 's' : ''} ({payload[0]?.payload?.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

export default function MAInsights() {
  // Calculate statistics
  const stats = useMemo(() => {
    const totalDeals = maDeals.length;
    const totalValue = maDeals.reduce((sum, d) => sum + (d.deal_size_usd || 0), 0);
    
    // Payment structure analysis
    const paymentMethods: Record<string, number> = {
      'All Cash': 0,
      'Cash + Stock': 0,
      'Cash + Debt': 0,
      'Mixed': 0,
      'Not Disclosed': 0,
    };
    
    maDeals.forEach(deal => {
      const specs = deal.deal_specifics as MASpecifics;
      if (!specs.payment_structure) {
        paymentMethods['Not Disclosed']++;
      } else {
        const { cash, stock, debt } = specs.payment_structure;
        const hasCash = cash !== undefined && cash > 0;
        const hasStock = stock !== undefined && stock > 0;
        const hasDebt = debt !== undefined && debt > 0;
        
        if (hasCash && !hasStock && !hasDebt) {
          paymentMethods['All Cash']++;
        } else if (hasCash && hasStock && !hasDebt) {
          paymentMethods['Cash + Stock']++;
        } else if (hasCash && !hasStock && hasDebt) {
          paymentMethods['Cash + Debt']++;
        } else {
          paymentMethods['Mixed']++;
        }
      }
    });

    const paymentData = Object.entries(paymentMethods)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({
        name,
        value: count,
        percentage: Math.round((count / totalDeals) * 100),
      }));

    // Transaction type analysis
    const transactionTypes: Record<string, number> = {};
    maDeals.forEach(deal => {
      const specs = deal.deal_specifics as MASpecifics;
      const type = specs.transaction_type || 'Not Disclosed';
      transactionTypes[type] = (transactionTypes[type] || 0) + 1;
    });

    const transactionData = Object.entries(transactionTypes)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({
        name,
        value: count,
        percentage: Math.round((count / totalDeals) * 100),
      }))
      .sort((a, b) => b.value - a.value);

    // Premium analysis
    const premiums: number[] = [];
    maDeals.forEach(deal => {
      const specs = deal.deal_specifics as MASpecifics;
      if (specs.premium_percentage !== undefined) {
        premiums.push(specs.premium_percentage);
      }
    });

    const premiumRanges: Record<string, number> = {
      '0-10%': 0,
      '10-20%': 0,
      '20-30%': 0,
      '30-40%': 0,
      '40%+': 0,
    };

    premiums.forEach(p => {
      if (p < 10) premiumRanges['0-10%']++;
      else if (p < 20) premiumRanges['10-20%']++;
      else if (p < 30) premiumRanges['20-30%']++;
      else if (p < 40) premiumRanges['30-40%']++;
      else premiumRanges['40%+']++;
    });

    const premiumData = Object.entries(premiumRanges)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({
        name,
        value: count,
        percentage: Math.round((count / premiums.length) * 100),
      }));

    const avgPremium = premiums.length > 0 
      ? (premiums.reduce((a, b) => a + b, 0) / premiums.length).toFixed(1)
      : null;

    // Earnout analysis
    let earnoutYes = 0;
    let earnoutNo = 0;
    let earnoutNotDisclosed = 0;

    maDeals.forEach(deal => {
      const specs = deal.deal_specifics as MASpecifics;
      if (!specs.earnout) {
        earnoutNotDisclosed++;
      } else if (specs.earnout.exists) {
        earnoutYes++;
      } else {
        earnoutNo++;
      }
    });

    const earnoutData = [
      { name: 'With Earnout', value: earnoutYes, percentage: Math.round((earnoutYes / totalDeals) * 100) },
      { name: 'No Earnout', value: earnoutNo, percentage: Math.round((earnoutNo / totalDeals) * 100) },
      { name: 'Not Disclosed', value: earnoutNotDisclosed, percentage: Math.round((earnoutNotDisclosed / totalDeals) * 100) },
    ].filter(d => d.value > 0);

    return {
      totalDeals,
      totalValue,
      paymentData,
      transactionData,
      premiumData,
      avgPremium,
      premiumCount: premiums.length,
      earnoutData,
      earnoutRate: totalDeals > 0 ? Math.round((earnoutYes / totalDeals) * 100) : 0,
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container py-8">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[oklch(0.585_0.233_292.717/0.12)] text-[oklch(0.485_0.233_292.717)]">
                <Briefcase className="h-4 w-4 mr-1.5" />
                M&A Only
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">M&A Deal Insights</h1>
            <p className="text-muted-foreground mt-1">
              Deep analysis of merger and acquisition transactions
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="M&A Deals"
              value={stats.totalDeals}
              icon={Briefcase}
              color="ma"
            />
            <StatCard
              label="Total Value"
              value={formatCurrency(stats.totalValue, true)}
              icon={DollarSign}
              color="ma"
            />
            <StatCard
              label="Avg. Premium"
              value={stats.avgPremium ? `${stats.avgPremium}%` : 'N/A'}
              subValue={stats.premiumCount > 0 ? `Based on ${stats.premiumCount} deals` : undefined}
              icon={Percent}
            />
            <StatCard
              label="Earnout Rate"
              value={`${stats.earnoutRate}%`}
              subValue="Deals with earnout provisions"
              icon={FileCheck}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Structure */}
            {stats.paymentData.length > 0 && (
              <div className="chart-container">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Payment Structure</h3>
                  <p className="text-sm text-muted-foreground">How deals are financed</p>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.paymentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {stats.paymentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="ml-6 space-y-2">
                    {stats.paymentData.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-sm shrink-0" 
                          style={{ backgroundColor: pieColors[index % pieColors.length] }}
                        />
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm text-muted-foreground ml-auto">
                          {item.value} ({item.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Type */}
            {stats.transactionData.length > 0 && (
              <div className="chart-container">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Transaction Type</h3>
                  <p className="text-sm text-muted-foreground">Deal structure breakdown</p>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.transactionData}
                      layout="vertical"
                      margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" horizontal={false} />
                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'oklch(0.55 0.02 260)' }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'oklch(0.35 0.02 260)' }}
                        width={100}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'oklch(0.95 0 0)' }} />
                      <Bar
                        dataKey="value"
                        radius={[0, 4, 4, 0]}
                        maxBarSize={28}
                        fill={colors.primary}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Premium Distribution */}
            {stats.premiumData.length > 0 && (
              <div className="chart-container">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Premium Distribution</h3>
                  <p className="text-sm text-muted-foreground">Acquisition premium ranges</p>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.premiumData}
                      margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" vertical={false} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'oklch(0.55 0.02 260)' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'oklch(0.55 0.02 260)' }}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'oklch(0.95 0 0)' }} />
                      <Bar
                        dataKey="value"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={50}
                      >
                        {stats.premiumData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`oklch(0.585 0.233 292.717 / ${1 - index * 0.15})`}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Earnout Analysis */}
            {stats.earnoutData.length > 0 && (
              <div className="chart-container">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Earnout Provisions</h3>
                  <p className="text-sm text-muted-foreground">Performance-based payment terms</p>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.earnoutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {stats.earnoutData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.name === 'With Earnout' 
                                ? colors.tertiary 
                                : entry.name === 'No Earnout' 
                                  ? colors.secondary 
                                  : 'oklch(0.8 0 0)'
                              } 
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="ml-6 space-y-2">
                    {stats.earnoutData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-sm shrink-0" 
                          style={{ 
                            backgroundColor: item.name === 'With Earnout' 
                              ? colors.tertiary 
                              : item.name === 'No Earnout' 
                                ? colors.secondary 
                                : 'oklch(0.8 0 0)'
                          }}
                        />
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm text-muted-foreground ml-auto">
                          {item.value} ({item.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Note about data */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">About this analysis</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This page only analyzes M&A transactions. Greenfield investments are excluded as they have different deal structures. 
                  Some metrics may be based on a subset of deals where the relevant data was disclosed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
