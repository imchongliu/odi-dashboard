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
import { TrendingUp, Database, MapPin, BarChart3, Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', key: 'overview' as const, icon: TrendingUp },
  { href: '/deals', key: 'deals' as const, icon: Database },
  { href: '/destinations', key: 'destinations' as const, icon: MapPin },
  { href: '/ma-insights', key: 'insights' as const, icon: BarChart3 },
];

export function Header() {
  const [location] = useLocation();
  const { language, setLanguage, t } = useLanguage();

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
        <div className="flex items-center gap-4">
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
                <span>{t.nav[item.key]}</span>
              </Link>
            );
          })}
          </nav>
          
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
            className="gap-2"
          >
            <Languages className="h-4 w-4" />
            <span className="text-sm font-medium">{language === 'en' ? '中文' : 'EN'}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
