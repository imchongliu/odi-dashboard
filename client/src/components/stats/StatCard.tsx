/**
 * StatCard Component
 * 
 * Design: Executive Clarity
 * - KPI card with trend indicator
 * - Hover effect with subtle elevation
 * - Clear hierarchy: value > label > trend
 */

import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'ma' | 'greenfield';
  className?: string;
}

export function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
  className,
}: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        'stat-card relative overflow-hidden',
        className
      )}
    >
      {/* Accent bar for variant types */}
      {variant !== 'default' && (
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg',
            variant === 'ma' && 'bg-[oklch(0.585_0.233_292.717)]',
            variant === 'greenfield' && 'bg-[oklch(0.696_0.17_162.48)]'
          )}
        />
      )}

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          {subValue && (
            <p className="text-sm text-muted-foreground">{subValue}</p>
          )}
        </div>
        
        {Icon && (
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              variant === 'default' && 'bg-primary/10 text-primary',
              variant === 'ma' && 'bg-[oklch(0.585_0.233_292.717/0.1)] text-[oklch(0.485_0.233_292.717)]',
              variant === 'greenfield' && 'bg-[oklch(0.696_0.17_162.48/0.1)] text-[oklch(0.596_0.17_162.48)]'
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {trend && trendValue && (
        <div className="mt-3 flex items-center gap-1.5">
          <TrendIcon
            className={cn(
              'h-4 w-4',
              trend === 'up' && 'text-[oklch(0.596_0.17_162.48)]',
              trend === 'down' && 'text-destructive',
              trend === 'neutral' && 'text-muted-foreground'
            )}
          />
          <span
            className={cn(
              'text-sm font-medium',
              trend === 'up' && 'text-[oklch(0.596_0.17_162.48)]',
              trend === 'down' && 'text-destructive',
              trend === 'neutral' && 'text-muted-foreground'
            )}
          >
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
}
