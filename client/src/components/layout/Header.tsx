/**
 * Header Component
 * 
 * Design: Executive Clarity
 * - Clean top navigation with clear hierarchy
 * - Logo on left, navigation links on right
 * - Subtle border bottom for separation
 */

import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { TrendingUp, Database, MapPin, BarChart3 } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Overview', icon: TrendingUp },
  { href: '/deals', label: 'Deals Database', icon: Database },
  { href: '/destinations', label: 'Destinations', icon: MapPin },
  { href: '/ma-insights', label: 'M&A Insights', icon: BarChart3 },
];

export function Header() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">ODI</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold leading-tight">China ODI</span>
            <span className="text-xs text-muted-foreground leading-tight">Dashboard</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location === item.href || 
              (item.href !== '/' && location.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
