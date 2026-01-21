/**
 * TopCountriesTable Component
 * 
 * Design: Executive Clarity
 * - Ranked list of top investment destinations
 * - Progress bar visualization for relative comparison
 * - Clean, scannable layout
 */

import { formatCurrency } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface CountryData {
  country: string;
  count: number;
  totalAmount: number;
}

interface TopCountriesTableProps {
  data: CountryData[];
  limit?: number;
}

export function TopCountriesTable({ data, limit = 10 }: TopCountriesTableProps) {
  const { t, translateCountry } = useLanguage();
  const topCountries = data.slice(0, limit);
  const maxAmount = topCountries[0]?.totalAmount || 1;

  return (
    <div className="chart-container">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{t.overview.topCountries}</h3>
        <p className="text-sm text-muted-foreground">{t.overview.topCountriesSubtitle || 'Countries ranked by investment value'}</p>
      </div>
      
      <div className="space-y-3">
        {topCountries.map((country, index) => {
          const percentage = (country.totalAmount / maxAmount) * 100;
          
          return (
            <div key={country.country} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                      index < 3
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="font-medium">{translateCountry(country.country)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {country.count} {t.common.deals.toLowerCase()}
                  </span>
                  <span className="font-semibold tabular-nums min-w-[80px] text-right">
                    {formatCurrency(country.totalAmount, true)}
                  </span>
                </div>
              </div>
              <div className="ml-9 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/70 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
