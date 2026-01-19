/**
 * MonthlyTrendChart Component
 * 
 * Design: Executive Clarity
 * - Line chart showing monthly deal trends
 * - Stacked area for M&A vs Greenfield breakdown
 * - Clean grid, minimal decoration
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/types';

interface MonthlyData {
  month: string;
  count: number;
  maCount: number;
  greenfieldCount: number;
  totalAmount: number;
}

interface MonthlyTrendChartProps {
  data: MonthlyData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium text-sm mb-2">{label}</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[oklch(0.585_0.233_292.717)]" />
            <span className="text-sm text-muted-foreground">M&A:</span>
            <span className="text-sm font-medium">{payload[0]?.value || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[oklch(0.696_0.17_162.48)]" />
            <span className="text-sm text-muted-foreground">Greenfield:</span>
            <span className="text-sm font-medium">{payload[1]?.value || 0}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  // Format month labels
  const formattedData = data.map(d => ({
    ...d,
    monthLabel: new Date(d.month + '-01').toLocaleDateString('en-US', { 
      month: 'short',
      year: '2-digit'
    }),
  }));

  return (
    <div className="chart-container">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Monthly Deal Trend</h3>
        <p className="text-sm text-muted-foreground">Number of deals by month</p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorMA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.585 0.233 292.717)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.585 0.233 292.717)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorGreenfield" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.696 0.17 162.48)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.696 0.17 162.48)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" vertical={false} />
            <XAxis
              dataKey="monthLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'oklch(0.55 0.02 260)' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'oklch(0.55 0.02 260)' }}
              dx={-10}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="square"
              iconSize={10}
              wrapperStyle={{ paddingBottom: 20 }}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="maCount"
              name="M&A"
              stackId="1"
              stroke="oklch(0.585 0.233 292.717)"
              strokeWidth={2}
              fill="url(#colorMA)"
            />
            <Area
              type="monotone"
              dataKey="greenfieldCount"
              name="Greenfield"
              stackId="1"
              stroke="oklch(0.696 0.17 162.48)"
              strokeWidth={2}
              fill="url(#colorGreenfield)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
