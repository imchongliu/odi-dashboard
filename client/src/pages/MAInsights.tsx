/**
 * M&A Insights Page - Under Development
 */

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Construction, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function MAInsights() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative bg-primary/10 p-8 rounded-full">
                <Construction className="h-20 w-20 text-primary" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">
              {t.maInsights.underDevelopment}
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              {t.maInsights.underDevelopmentDesc}
            </p>
          </div>

          {/* Features Coming Soon */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
            <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">{t.maInsights.feature1Title}</h3>
              <p className="text-sm text-muted-foreground">{t.maInsights.feature1Desc}</p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">{t.maInsights.feature2Title}</h3>
              <p className="text-sm text-muted-foreground">{t.maInsights.feature2Desc}</p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <PieChart className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">{t.maInsights.feature3Title}</h3>
              <p className="text-sm text-muted-foreground">{t.maInsights.feature3Desc}</p>
            </div>
          </div>

          {/* Note */}
          <div className="pt-8">
            <p className="text-sm text-muted-foreground">
              {t.maInsights.note}
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
