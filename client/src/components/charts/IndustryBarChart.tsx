/**
 * IndustryBarChart Component
 * 
 * Design: Executive Clarity
 * - Horizontal bar chart for industry distribution
 * - Sorted by total amount
 * - Consistent styling with CountryBarChart
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface IndustryData {
  industry: string;
  count: number;
  totalAmount: number;
}

interface IndustryBarChartProps {
  data: IndustryData[];
  limit?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useLanguage();
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium text-sm mb-1">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">{t.common.deals}:</span>
            <span className="text-sm font-medium">{payload[0]?.payload?.count}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">{t.common.total}:</span>
            <span className="text-sm font-medium">{formatCurrency(payload[0]?.value, true)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Color palette for industries
const industryColors = [
  'oklch(0.585 0.233 292.717)', // Violet (M&A color)
  'oklch(0.696 0.17 162.48)',   // Emerald (Greenfield color)
  'oklch(0.623 0.214 259.815)', // Blue (Primary)
  'oklch(0.769 0.188 70.08)',   // Amber
  'oklch(0.704 0.191 22.216)',  // Red
  'oklch(0.6 0.15 200)',        // Teal
  'oklch(0.65 0.18 320)',       // Pink
  'oklch(0.55 0.12 100)',       // Olive
];

export function IndustryBarChart({ data, limit = 8 }: IndustryBarChartProps) {
  const { t, translateIndustry } = useLanguage();
  const chartData = data.slice(0, limit).map(d => ({
    ...d,
    industry: translateIndustry(d.industry)
  }));

  return (
    <div className="chart-container">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{t.overview.topIndustriesByValue}</h3>
        <p className="text-sm text-muted-foreground">Investment amount by sector</p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" horizontal={false} />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'oklch(0.55 0.02 260)' }}
              tickFormatter={(value) => formatCurrency(value, true)}
            />
            <YAxis
              type="category"
              dataKey="industry"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'oklch(0.35 0.02 260)' }}
              width={140}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'oklch(0.95 0 0)' }} />
            <Bar
              dataKey="totalAmount"
              radius={[0, 4, 4, 0]}
              maxBarSize={24}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={industryColors[index % industryColors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
