/**
 * Deal Detail Page
 * 
 * Design: Executive Clarity
 * - Conditional rendering based on investment type (M&A vs Greenfield)
 * - Left-right split layout for investor and target info
 * - Deal specifics section with type-specific fields
 * - Data completeness indicator
 */

import { useParams, Link } from 'wouter';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Building2, Briefcase, Calendar, MapPin, Factory, DollarSign, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInvestmentById } from '@/lib/data';
import { 
  formatCurrency, 
  formatDate, 
  isMASpecifics, 
  isGreenfieldSpecifics,
  getDataCompleteness 
} from '@/lib/types';
import type { MASpecifics, GreenfieldSpecifics } from '@/lib/types';

function TypeBadge({ type }: { type: 'M&A' | 'Greenfield' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
        type === 'M&A'
          ? 'bg-[oklch(0.585_0.233_292.717/0.12)] text-[oklch(0.485_0.233_292.717)]'
          : 'bg-[oklch(0.696_0.17_162.48/0.12)] text-[oklch(0.55_0.17_162.48)]'
      )}
    >
      {type === 'M&A' ? <Briefcase className="h-4 w-4 mr-1.5" /> : <Building2 className="h-4 w-4 mr-1.5" />}
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: 'Completed' | 'Pending' | 'Terminated' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
        status === 'Completed' && 'bg-[oklch(0.696_0.17_162.48/0.12)] text-[oklch(0.55_0.17_162.48)]',
        status === 'Pending' && 'bg-[oklch(0.769_0.188_70.08/0.12)] text-[oklch(0.6_0.188_70.08)]',
        status === 'Terminated' && 'bg-[oklch(0.577_0.245_27.325/0.12)] text-[oklch(0.5_0.245_27.325)]'
      )}
    >
      {status}
    </span>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: string | React.ReactNode; icon?: any }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium mt-0.5">{value || <span className="text-muted-foreground italic">Not disclosed</span>}</p>
      </div>
    </div>
  );
}

function MADetailsSection({ specs }: { specs: MASpecifics }) {
  return (
    <div className="space-y-6">
      {/* Transaction Type */}
      {specs.transaction_type && (
        <InfoRow label="Transaction Type" value={specs.transaction_type} />
      )}

      {/* Payment Structure */}
      {specs.payment_structure && (
        <div className="py-2">
          <p className="text-sm text-muted-foreground mb-2">Payment Structure</p>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            {specs.payment_structure.cash !== undefined && (
              <div className="flex justify-between">
                <span className="text-sm">Cash</span>
                <span className="font-medium tabular-nums">{formatCurrency(specs.payment_structure.cash)}</span>
              </div>
            )}
            {specs.payment_structure.stock !== undefined && (
              <div className="flex justify-between">
                <span className="text-sm">Stock</span>
                <span className="font-medium tabular-nums">{formatCurrency(specs.payment_structure.stock)}</span>
              </div>
            )}
            {specs.payment_structure.debt !== undefined && (
              <div className="flex justify-between">
                <span className="text-sm">Debt Assumption</span>
                <span className="font-medium tabular-nums">{formatCurrency(specs.payment_structure.debt)}</span>
              </div>
            )}
            {specs.payment_structure.description && (
              <p className="text-sm text-muted-foreground pt-2 border-t border-border">
                {specs.payment_structure.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Premium */}
      {specs.premium_percentage !== undefined && (
        <InfoRow 
          label="Premium" 
          value={`${specs.premium_percentage}%`} 
        />
      )}

      {/* Earnout */}
      {specs.earnout && (
        <div className="py-2">
          <p className="text-sm text-muted-foreground mb-2">Earnout Provision</p>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                specs.earnout.exists 
                  ? 'bg-[oklch(0.696_0.17_162.48/0.12)] text-[oklch(0.55_0.17_162.48)]'
                  : 'bg-muted text-muted-foreground'
              )}>
                {specs.earnout.exists ? 'Yes' : 'No'}
              </span>
            </div>
            {specs.earnout.description && (
              <p className="text-sm">{specs.earnout.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Conditions */}
      {specs.conditions && specs.conditions.length > 0 && (
        <div className="py-2">
          <p className="text-sm text-muted-foreground mb-2">Closing Conditions</p>
          <ul className="space-y-1.5">
            {specs.conditions.map((condition, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                {condition}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Target Details */}
      {specs.target_details && (
        <div className="py-2">
          <p className="text-sm text-muted-foreground mb-2">Target Company Details</p>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            {specs.target_details.public_status && (
              <div className="flex justify-between">
                <span className="text-sm">Status</span>
                <span className="font-medium">{specs.target_details.public_status}</span>
              </div>
            )}
            {specs.target_details.stock_code && (
              <div className="flex justify-between">
                <span className="text-sm">Stock Code</span>
                <span className="font-medium">{specs.target_details.stock_code}</span>
              </div>
            )}
            {specs.target_details.exchange && (
              <div className="flex justify-between">
                <span className="text-sm">Exchange</span>
                <span className="font-medium">{specs.target_details.exchange}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Other Terms */}
      {specs.other_terms && (
        <div className="py-2">
          <p className="text-sm text-muted-foreground mb-2">Other Terms</p>
          <p className="text-sm">{specs.other_terms}</p>
        </div>
      )}
    </div>
  );
}

function GreenfieldDetailsSection({ specs }: { specs: GreenfieldSpecifics }) {
  return (
    <div className="space-y-4">
      {specs.investment_phase && (
        <InfoRow label="Investment Phase" value={specs.investment_phase} />
      )}
      {specs.project_description && (
        <div className="py-2">
          <p className="text-sm text-muted-foreground mb-2">Project Description</p>
          <p className="text-sm">{specs.project_description}</p>
        </div>
      )}
    </div>
  );
}

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const deal = getInvestmentById(Number(id));

  if (!deal) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Deal Not Found</h1>
            <p className="text-muted-foreground mb-4">The deal you're looking for doesn't exist.</p>
            <Link href="/deals">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Deals
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const completeness = getDataCompleteness(deal);
  const isMA = isMASpecifics(deal.deal_specifics);
  const isGreenfield = isGreenfieldSpecifics(deal.deal_specifics);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container py-8">
          {/* Back Button */}
          <Link href="/deals">
            <Button variant="ghost" size="sm" className="mb-6 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Deals
            </Button>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <TypeBadge type={deal.investment_type} />
              <StatusBadge status={deal.status} />
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {deal.investor_name} → {deal.target_company_name || 'New Project'}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(deal.announcement_date)}
              </span>
              {deal.target_country && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {deal.target_country}
                </span>
              )}
              {deal.target_industry && (
                <span className="flex items-center gap-1.5">
                  <Factory className="h-4 w-4" />
                  {deal.target_industry}
                </span>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Deal Size */}
              <InfoCard title="Deal Size">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums">
                      {formatCurrency(deal.deal_size_usd, true)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(deal.deal_size_usd)}
                    </p>
                  </div>
                </div>
              </InfoCard>

              {/* Investor Info */}
              <InfoCard title="Investor">
                <div className="space-y-1">
                  <p className="font-medium">{deal.investor_name}</p>
                  {deal.investor_stock_code && (
                    <p className="text-sm text-muted-foreground">{deal.investor_stock_code}</p>
                  )}
                </div>
              </InfoCard>

              {/* Target Info */}
              <InfoCard title="Target">
                <div className="space-y-3">
                  <InfoRow 
                    label="Company" 
                    value={deal.target_company_name || 'New project'} 
                  />
                  <InfoRow 
                    label="Country" 
                    value={deal.target_country} 
                    icon={MapPin}
                  />
                  <InfoRow 
                    label="Industry" 
                    value={deal.target_industry} 
                    icon={Factory}
                  />
                </div>
              </InfoCard>

              {/* Data Completeness */}
              <InfoCard title="Data Completeness">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{completeness}% complete</span>
                  </div>
                  <Progress value={completeness} className="h-2" />
                  {completeness < 100 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-2">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Some deal terms are not disclosed
                    </p>
                  )}
                </div>
              </InfoCard>
            </div>

            {/* Right Column - Deal Specifics */}
            <div className="lg:col-span-2">
              <InfoCard title={isMA ? 'M&A Transaction Details' : 'Greenfield Investment Details'}>
                {isMA && <MADetailsSection specs={deal.deal_specifics as MASpecifics} />}
                {isGreenfield && <GreenfieldDetailsSection specs={deal.deal_specifics as GreenfieldSpecifics} />}
                {!deal.deal_specifics && (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No detailed information available for this deal.</p>
                  </div>
                )}
              </InfoCard>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
