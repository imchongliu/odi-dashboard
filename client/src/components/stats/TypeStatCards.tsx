/**
 * TypeStatCards Component
 * 
 * Design: Executive Clarity
 * - Side-by-side cards for M&A and Greenfield stats
 * - Color-coded badges for quick identification
 * - Clear value hierarchy
 */

import { Briefcase, Building2, PlusCircle } from 'lucide-react';
import { StatCard } from './StatCard';
import { formatCurrency } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface TypeStatCardsProps {
  maCount: number;
  maTotal: number;
  greenfieldCount: number;
  greenfieldTotal: number;
  otherCount?: number;
  otherTotal?: number;
}

export function TypeStatCards({
  maCount,
  maTotal,
  greenfieldCount,
  greenfieldTotal,
  otherCount = 0,
  otherTotal = 0,
}: TypeStatCardsProps) {
  const { t } = useLanguage();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        label={t.investmentType.ma}
        value={maCount}
        subValue={formatCurrency(maTotal, true)}
        icon={Briefcase}
        variant="ma"
      />
      <StatCard
        label={t.investmentType.greenfield}
        value={greenfieldCount}
        subValue={formatCurrency(greenfieldTotal, true)}
        icon={Building2}
        variant="greenfield"
      />
      <StatCard
        label={t.investmentType.other}
        value={otherCount}
        subValue={formatCurrency(otherTotal, true)}
        icon={PlusCircle}
        variant="other"
      />
    </div>
  );
}
