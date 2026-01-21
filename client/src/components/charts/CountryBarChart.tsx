/**
 * CountryBarChart Component
 * 
 * Design: Executive Clarity
 * - Horizontal bar chart for country distribution
 * - Sorted by total amount
 * - Clean, minimal styling
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

interface CountryData {
  country: string;
  count: number;
  totalAmount: number;
}

interface CountryBarChartProps {
  data: CountryData[];
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

export function CountryBarChart({ data, limit = 8 }: CountryBarChartProps) {
  const { t, translateCountry } = useLanguage();
  const chartData = data.slice(0, limit).map(d => ({
    ...d,
    country: translateCountry(d.country)
  }));

  return (
    <div className="chart-container">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{t.overview.topDestinationsByValue}</h3>
        <p className="text-sm text-muted-foreground">Investment amount by country</p>
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
              dataKey="country"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'oklch(0.35 0.02 260)' }}
              width={100}
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
                  fill={`oklch(0.623 0.214 259.815 / ${1 - index * 0.08})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
