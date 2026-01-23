/**
 * InvestmentDetailModal Component
 * 
 * Displays detailed information about an investment in a modal dialog
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/api';
import { Building2, Globe, Factory, Calendar, DollarSign, FileText, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';

interface Investment {
  id: number;
  announcementDate: string | Date;
  announcementTitle: string | null;
  announcementStage: string | null;
  stockCode: string | null;
  companyName: string;
  exchange: string | null;
  companyProvince: string | null;
  companyIndustry: string | null;
  investmentType: string;
  investmentRationale: string | null;
  targetName: string | null;
  targetIndustry: string | null;
  targetCountryCode: string | null;
  targetCountryName: string;
  targetRegion: string | null;
  dealSizeOriginal: string | null;
  originalCurrency: string | null;
  dealSizeUsd: string;
  dealSpecifics: any;
}

interface InvestmentDetailModalProps {
  investment: Investment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function TypeBadge({ type }: { type: string }) {
  const isMA = type === 'M&A';
  const isGreenfield = type === 'Greenfield';
  const isOther = type === 'Other';
  return (
    <Badge
      className={cn(
        isMA
          ? 'bg-[oklch(0.585_0.233_292.717/0.12)] text-[oklch(0.485_0.233_292.717)] hover:bg-[oklch(0.585_0.233_292.717/0.2)]'
          : isGreenfield
          ? 'bg-[oklch(0.696_0.17_162.48/0.12)] text-[oklch(0.55_0.17_162.48)] hover:bg-[oklch(0.696_0.17_162.48/0.2)]'
          : isOther
          ? 'bg-[oklch(0.75_0.15_50/0.12)] text-[oklch(0.65_0.15_50)] hover:bg-[oklch(0.75_0.15_50/0.2)]'
          : 'bg-muted text-muted-foreground'
      )}
    >
      {type}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isCompleted = status === '完成' || status === 'Completed';
  const isPending = status === '筹划' || status === 'Pending';
  const isInProgress = status === '进展' || status === 'In Progress';
  
  return (
    <Badge
      className={cn(
        isCompleted && 'bg-[oklch(0.696_0.17_162.48/0.12)] text-[oklch(0.55_0.17_162.48)] hover:bg-[oklch(0.696_0.17_162.48/0.2)]',
        isPending && 'bg-[oklch(0.769_0.188_70.08/0.12)] text-[oklch(0.6_0.188_70.08)] hover:bg-[oklch(0.769_0.188_70.08/0.2)]',
        isInProgress && 'bg-[oklch(0.585_0.233_292.717/0.12)] text-[oklch(0.485_0.233_292.717)] hover:bg-[oklch(0.585_0.233_292.717/0.2)]'
      )}
    >
      {status}
    </Badge>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string | null | undefined }) {
  if (!value || value === 'null' || value === 'N/A') return null;
  
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

export function InvestmentDetailModal({ investment, open, onOpenChange }: InvestmentDetailModalProps) {
  const { t, translateCountry, translateIndustry, translateProvince, translateExchange, language } = useLanguage();
  const [translatedIndustry, setTranslatedIndustry] = useState<string | null>(null);
  const [translatedRegion, setTranslatedRegion] = useState<string | null>(null);
  const [translatedCompanyName, setTranslatedCompanyName] = useState<string | null>(null);
  const [translatedTargetName, setTranslatedTargetName] = useState<string | null>(null);
  const [translatedRationale, setTranslatedRationale] = useState<string | null>(null);
  const [translatedAnnouncement, setTranslatedAnnouncement] = useState<string | null>(null);
  
  // Use tRPC mutation to translate text
  const translateMutation = trpc.investments.translate.useMutation();
  
  // Translate Target Industry when modal opens and language is English
  useEffect(() => {
    if (investment?.targetIndustry && language === 'en' && !translatedIndustry) {
      translateMutation.mutate(
        { text: investment.targetIndustry, type: 'industry' },
        {
          onSuccess: (data) => {
            if (data?.translated) {
              setTranslatedIndustry(data.translated);
            } else {
              setTranslatedIndustry(investment.targetIndustry);
            }
          },
          onError: (error) => {
            console.error('Failed to translate industry:', error);
            setTranslatedIndustry(investment.targetIndustry);
          },
        }
      );
    } else if (language === 'zh') {
      setTranslatedIndustry(null);
    }
  }, [investment?.targetIndustry, language]);
  
  // Translate Target Region when modal opens and language is English
  useEffect(() => {
    if (investment?.targetRegion && language === 'en' && !translatedRegion) {
      translateMutation.mutate(
        { text: investment.targetRegion, type: 'region' },
        {
          onSuccess: (data) => {
            if (data?.translated) {
              setTranslatedRegion(data.translated);
            } else {
              setTranslatedRegion(investment.targetRegion);
            }
          },
          onError: (error) => {
            console.error('Failed to translate region:', error);
            setTranslatedRegion(investment.targetRegion);
          },
        }
      );
    } else if (language === 'zh') {
      setTranslatedRegion(null);
    }
  }, [investment?.targetRegion, language]);
  
  // Translate Company Name
  useEffect(() => {
    if (investment?.companyName && language === 'en') {
      translateMutation.mutate(
        { text: investment.companyName, type: 'company' },
        {
          onSuccess: (data) => {
            setTranslatedCompanyName(data?.translated || investment.companyName);
          },
          onError: () => {
            setTranslatedCompanyName(investment.companyName);
          },
        }
      );
    } else if (language === 'zh') {
      setTranslatedCompanyName(null);
    }
  }, [investment?.companyName, language, open]);
  
  // Translate Target Name
  useEffect(() => {
    if (investment?.targetName && language === 'en') {
      translateMutation.mutate(
        { text: investment.targetName, type: 'target' },
        {
          onSuccess: (data) => {
            setTranslatedTargetName(data?.translated || investment.targetName);
          },
          onError: () => {
            setTranslatedTargetName(investment.targetName);
          },
        }
      );
    } else if (language === 'zh') {
      setTranslatedTargetName(null);
    }
  }, [investment?.targetName, language, open]);
  
  // Translate Investment Rationale
  useEffect(() => {
    if (investment?.investmentRationale && language === 'en') {
      translateMutation.mutate(
        { text: investment.investmentRationale, type: 'rationale' },
        {
          onSuccess: (data) => {
            setTranslatedRationale(data?.translated || investment.investmentRationale);
          },
          onError: () => {
            setTranslatedRationale(investment.investmentRationale);
          },
        }
      );
    } else if (language === 'zh') {
      setTranslatedRationale(null);
    }
  }, [investment?.investmentRationale, language, open]);
  
  // Translate Announcement Details
  useEffect(() => {
    if (investment?.announcementTitle && language === 'en') {
      translateMutation.mutate(
        { text: investment.announcementTitle, type: 'announcement' },
        {
          onSuccess: (data) => {
            setTranslatedAnnouncement(data?.translated || investment.announcementTitle);
          },
          onError: () => {
            setTranslatedAnnouncement(investment.announcementTitle);
          },
        }
      );
    } else if (language === 'zh') {
      setTranslatedAnnouncement(null);
    }
  }, [investment?.announcementTitle, language, open]);
  
  if (!investment) return null;

  const dealSizeUsd = parseFloat(investment.dealSizeUsd || '0');
  const formattedDate = formatDate(investment.announcementDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl break-words">
                {language === 'en' && translatedCompanyName ? translatedCompanyName : investment.companyName}
              </DialogTitle>
              <DialogDescription className="mt-1 break-words">
                {language === 'en' && translatedTargetName ? translatedTargetName : (investment.targetName || 'New Investment Project')}
              </DialogDescription>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <TypeBadge type={investment.investmentType} />
              {investment.announcementStage && (
                <StatusBadge status={investment.announcementStage} />
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Deal Overview */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t.modal.dealOverview}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                icon={Calendar}
                label={t.modal.announcementDate}
                value={formattedDate}
              />
              <InfoRow
                icon={DollarSign}
                label={t.modal.dealSize}
                value={dealSizeUsd > 0 ? formatCurrency(dealSizeUsd) : 'Undisclosed'}
              />
              {investment.dealSizeOriginal && investment.originalCurrency && (
                <InfoRow
                  icon={DollarSign}
                  label={t.modal.originalAmount}
                  value={`${investment.dealSizeOriginal} ${investment.originalCurrency}`}
                />
              )}
              {investment.stockCode && (
                <InfoRow
                  icon={Building2}
                  label={t.modal.stockCode}
                  value={`${investment.stockCode}${investment.exchange ? ` (${translateExchange(investment.exchange)})` : ''}`}
                />
              )}
            </div>
          </div>

          <Separator />

          {/* Investor Information */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t.modal.investorInfo}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                icon={Building2}
                label={t.modal.companyName}
                value={language === 'en' && translatedCompanyName ? translatedCompanyName : investment.companyName}
              />
              <InfoRow
                icon={Factory}
                label={t.modal.industry}
                value={investment.companyIndustry ? translateIndustry(investment.companyIndustry) : null}
              />
              <InfoRow
                icon={Globe}
                label={t.modal.province}
                value={investment.companyProvince ? translateProvince(investment.companyProvince) : null}
              />
            </div>
          </div>

          <Separator />

          {/* Target Information */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t.modal.targetInfo}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                icon={Building2}
                label={t.modal.targetName}
                value={language === 'en' && translatedTargetName ? translatedTargetName : (investment.targetName || 'New Project')}
              />
              <InfoRow
                icon={Globe}
                label={t.modal.country}
                value={translateCountry(investment.targetCountryName)}
              />
              <InfoRow
                icon={Factory}
                label={t.modal.targetIndustry}
                value={language === 'en' && translatedIndustry ? translatedIndustry : (investment.targetIndustry ? translateIndustry(investment.targetIndustry) : null)}
              />
              <InfoRow
                icon={Globe}
                label={t.modal.region}
                value={language === 'en' && translatedRegion ? translatedRegion : (investment.targetRegion ? translateProvince(investment.targetRegion) : null)}
              />
            </div>
          </div>

          {/* Investment Rationale */}
          {investment.investmentRationale && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t.modal.investmentRationale}
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                  {language === 'en' && translatedRationale ? translatedRationale : investment.investmentRationale}
                </p>
              </div>
            </>
          )}

          {/* Announcement Details */}
          {investment.announcementTitle && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t.modal.announcementDetails}
                </h3>
                <p className="text-sm text-muted-foreground break-words">
                  {language === 'en' && translatedAnnouncement ? translatedAnnouncement : investment.announcementTitle}
                </p>
              </div>
            </>
          )}

          {/* Deal Specifics */}
          {investment.dealSpecifics && typeof investment.dealSpecifics === 'object' && Object.keys(investment.dealSpecifics).length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Deal Specifics
                </h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  {Object.entries(investment.dealSpecifics).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <span className="font-medium">{key}:</span>
                      <span className="break-words">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
