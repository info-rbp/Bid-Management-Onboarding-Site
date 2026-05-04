
"use client";

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Info } from 'lucide-react';
import { deriveServiceModules } from '@/lib/onboarding-steps';

interface ServiceSelectionProps {
  data: {
    selectedServices?: string[];
    highestPriorityService?: string;
    serviceImportanceReason?: string;
    engagementLevel?: string;
    excludedServicesOrChannels?: string;
    opportunityRecommendationConsent?: string;
  };
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
}

const serviceOptions = [
  { label: "Government tenders", value: "government_tenders" },
  { label: "Private tenders", value: "private_tenders" },
  { label: "Grants", value: "grants" },
  { label: "Panel or supplier registrations", value: "panel_supplier_registrations" },
  { label: "Marketplace leads", value: "marketplace_leads" },
  { label: "Direct proposals", value: "direct_proposals" },
  { label: "Quote requests", value: "quote_requests" },
  { label: "Unsure, please recommend", value: "unsure_recommend" },
];

const priorityOptions = [
  ...serviceOptions.filter(o => o.value !== "unsure_recommend"),
  { label: "Unsure", value: "unsure" }
];

const engagementOptions = [
  { label: "Full end-to-end management", value: "full_end_to_end" },
  { label: "Opportunity review and recommendations only", value: "opportunity_review_recommendations_only" },
  { label: "Drafting and document preparation only", value: "drafting_document_preparation_only" },
  { label: "Submission support only", value: "submission_support_only" },
  { label: "Marketplace and lead response support only", value: "marketplace_lead_response_support_only" },
  { label: "Unsure, please recommend", value: "unsure_recommend" },
];

const consentOptions = [
  { label: "Yes", value: "yes" },
  { label: "Yes, but only within agreed criteria", value: "yes_within_agreed_criteria" },
  { label: "No, we will provide opportunities ourselves", value: "no_client_provides_opportunities" },
  { label: "Unsure", value: "unsure" },
];

export function ServiceSelection({ data, onChange, isLocked }: ServiceSelectionProps) {
  const selectedServices = data.selectedServices || [];
  const derivedModules = deriveServiceModules(selectedServices);
  const activeModules = Object.entries(derivedModules)
    .filter(([_, active]) => active)
    .map(([key]) => key);

  const handleServiceToggle = (value: string) => {
    if (isLocked) return;
    const current = [...selectedServices];
    const index = current.indexOf(value);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(value);
    }
    onChange('selectedServices', current);
  };

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Service Selection & Engagement Scope</h2>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-blue-800 text-sm leading-relaxed">
          “Please select the services you want Bid Manager to assist with. You can select more than one option. If you are unsure, select ‘Unsure, please recommend’ and we will assess which services are most suitable based on your business, goals, capacity and current readiness.”
        </div>
      </div>

      {/* 3.1 Which Bid Manager services would you like support with? */}
      <section className="space-y-6">
        <div className="space-y-1">
          <Label className="text-base font-bold text-slate-900">3.1 Which Bid Manager services would you like support with?</Label>
          <p className="text-sm text-muted-foreground">Select all that apply.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {serviceOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleServiceToggle(option.value)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                selectedServices.includes(option.value)
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
              } ${isLocked ? 'pointer-events-none opacity-70' : ''}`}
            >
              <span className={`text-sm font-semibold ${selectedServices.includes(option.value) ? 'text-primary' : 'text-slate-700'}`}>
                {option.label}
              </span>
              <Checkbox 
                checked={selectedServices.includes(option.value)} 
                onCheckedChange={() => handleServiceToggle(option.value)}
                disabled={isLocked}
                className="rounded-md"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 3.2 Which service is your highest priority right now? */}
      <section className="space-y-6">
        <div className="space-y-1">
          <Label className="text-base font-bold text-slate-900">3.2 Which service is your highest priority right now?</Label>
        </div>
        <RadioGroup
          value={data.highestPriorityService}
          onValueChange={(v) => onChange('highestPriorityService', v)}
          disabled={isLocked}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {priorityOptions.map((option) => {
            const isSelectedInList = selectedServices.includes(option.value);
            return (
              <div
                key={option.value}
                onClick={() => !isLocked && onChange('highestPriorityService', option.value)}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  data.highestPriorityService === option.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                } ${isLocked ? 'pointer-events-none opacity-70' : ''}`}
              >
                <div className="flex flex-col gap-1">
                  <span className={`text-sm font-semibold ${data.highestPriorityService === option.value ? 'text-primary' : 'text-slate-700'}`}>
                    {option.label}
                  </span>
                  {isSelectedInList && (
                    <Badge variant="secondary" className="w-fit text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-none uppercase tracking-wider font-bold">
                      Selected Above
                    </Badge>
                  )}
                </div>
                <RadioGroupItem value={option.value} id={`priority-${option.value}`} className="sr-only" />
              </div>
            );
          })}
        </RadioGroup>
      </section>

      {/* 3.3 Why are these services important to your business right now? */}
      <section className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="serviceImportanceReason" className="text-base font-bold text-slate-900">
            3.3 Why are these services important to your business right now?
          </Label>
          <p className="text-sm text-muted-foreground">
            Consider growth, funding, recurring clients, market entry, credibility, cashflow, or formalising proposals.
          </p>
        </div>
        <Textarea
          id="serviceImportanceReason"
          value={data.serviceImportanceReason || ''}
          onChange={(e) => onChange('serviceImportanceReason', e.target.value)}
          disabled={isLocked}
          placeholder="Enter your reason here..."
          className="min-h-[120px] rounded-2xl border-slate-200 focus:ring-primary/20"
        />
        {data.serviceImportanceReason && data.serviceImportanceReason.length < 20 && (
          <p className="text-xs text-orange-500 font-medium flex items-center gap-1">
            <Info className="w-3 h-3" /> Minimum recommended length: 20 characters
          </p>
        )}
      </section>

      {/* 3.4 How involved do you want Bid Manager to be? */}
      <section className="space-y-6">
        <div className="space-y-1">
          <Label className="text-base font-bold text-slate-900">3.4 How involved do you want Bid Manager to be?</Label>
        </div>
        <RadioGroup
          value={data.engagementLevel}
          onValueChange={(v) => onChange('engagementLevel', v)}
          disabled={isLocked}
          className="grid grid-cols-1 gap-3"
        >
          {engagementOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => !isLocked && onChange('engagementLevel', option.value)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                data.engagementLevel === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
              }`}
            >
              <RadioGroupItem value={option.value} id={`engagement-${option.value}`} />
              <Label htmlFor={`engagement-${option.value}`} className="cursor-pointer text-sm font-semibold text-slate-700 flex-1">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </section>

      {/* 3.5 Are there any services, opportunity types or channels you do not want support with? */}
      <section className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="excludedServicesOrChannels" className="text-base font-bold text-slate-900">
            3.5 Are there any services, opportunity types or channels you do not want support with? (Optional)
          </Label>
          <p className="text-sm text-muted-foreground">
            Examples: no grants, no paid lead platforms, no government tenders, no residential work, no low-value quotes, no interstate work, no urgent jobs, or no opportunities requiring particular licences.
          </p>
        </div>
        <Textarea
          id="excludedServicesOrChannels"
          value={data.excludedServicesOrChannels || ''}
          onChange={(e) => onChange('excludedServicesOrChannels', e.target.value)}
          disabled={isLocked}
          placeholder="Enter any exclusions here..."
          className="min-h-[100px] rounded-2xl border-slate-200 focus:ring-primary/20"
        />
      </section>

      {/* 3.6 Are you comfortable with Bid Manager identifying and recommending opportunities on your behalf? */}
      <section className="space-y-6">
        <div className="space-y-1">
          <Label className="text-base font-bold text-slate-900">3.6 Are you comfortable with Bid Manager identifying and recommending opportunities on your behalf?</Label>
        </div>
        <RadioGroup
          value={data.opportunityRecommendationConsent}
          onValueChange={(v) => onChange('opportunityRecommendationConsent', v)}
          disabled={isLocked}
          className="grid grid-cols-1 gap-3"
        >
          {consentOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => !isLocked && onChange('opportunityRecommendationConsent', option.value)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                data.opportunityRecommendationConsent === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
              }`}
            >
              <RadioGroupItem value={option.value} id={`consent-${option.value}`} />
              <Label htmlFor={`consent-${option.value}`} className="cursor-pointer text-sm font-semibold text-slate-700 flex-1">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </section>

      {/* Summary Card */}
      {selectedServices.length > 0 && (
        <Card className="bg-slate-900 border-none rounded-[2rem] overflow-hidden shadow-2xl">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white">Selection Summary</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Modules</p>
                <div className="flex flex-wrap gap-2">
                  {activeModules.length > 0 ? activeModules.map(m => (
                    <Badge key={m} className="bg-slate-800 text-slate-300 border-none px-3 py-1 text-[11px] font-bold capitalize">
                      {m.replace(/([A-Z])/g, ' $1')}
                    </Badge>
                  )) : <p className="text-sm text-slate-400 italic">No specific modules triggered</p>}
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Onboarding Path</p>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {activeModules.length > 0 
                    ? `Based on your selections, we will show additional questions for ${activeModules.map(m => m.replace(/([A-Z])/g, ' $1').toLowerCase()).join(', ')}.`
                    : "Your onboarding will follow our standard business foundation path."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
