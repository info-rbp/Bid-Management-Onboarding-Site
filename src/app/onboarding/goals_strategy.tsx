
"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, CheckCircle2, Info, AlertTriangle, Target, Compass, Gauge, Ban, Flag, Trophy, TrendingUp, Search } from 'lucide-react';
import { deriveStrategyReadiness } from '@/lib/onboarding-steps';

interface GoalsStrategyProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
  fieldErrors?: Record<string, string>;
}

const mainGoalOptions = [
  { label: "Win government contracts", value: "win_government_contracts" },
  { label: "Win private sector contracts", value: "win_private_sector_contracts" },
  { label: "Apply for grants", value: "apply_for_grants" },
  { label: "Join supplier panels or registers", value: "join_supplier_panels_or_registers" },
  { label: "Win marketplace leads", value: "win_marketplace_leads" },
  { label: "Build proposal documents", value: "build_proposal_documents" },
  { label: "Improve credibility", value: "improve_credibility" },
  { label: "Create a capability statement", value: "create_capability_statement" },
  { label: "Develop case studies", value: "develop_case_studies" },
  { label: "Build recurring client pipeline", value: "build_recurring_client_pipeline" },
  { label: "Enter a new market", value: "enter_new_market" },
  { label: "Increase revenue", value: "increase_revenue" },
  { label: "Improve win rate", value: "improve_win_rate" },
  { label: "Other", value: "other" },
];

const channelOptions = [
  { label: "Government tenders", value: "government_tenders" },
  { label: "Private tenders", value: "private_tenders" },
  { label: "Grants", value: "grants" },
  { label: "Panels and supplier registers", value: "panels_supplier_registers" },
  { label: "Airtasker", value: "airtasker" },
  { label: "Bark", value: "bark" },
  { label: "ServiceSeeking", value: "serviceseeking" },
  { label: "Oneflare", value: "oneflare" },
  { label: "hipages", value: "hipages" },
  { label: "Upwork", value: "upwork" },
  { label: "Freelancer", value: "freelancer" },
  { label: "Fiverr", value: "fiverr" },
  { label: "LinkedIn outreach", value: "linkedin_outreach" },
  { label: "Email outreach", value: "email_outreach" },
  { label: "Direct proposals", value: "direct_proposals" },
  { label: "Partnerships", value: "partnerships" },
  { label: "Local procurement", value: "local_procurement" },
  { label: "Corporate supplier registrations", value: "corporate_supplier_registrations" },
  { label: "Quote requests", value: "quote_requests" },
  { label: "Other", value: "other" },
];

const factorRows = [
  { label: "Contract value", key: "contractValue" },
  { label: "Location", key: "location" },
  { label: "Profitability", key: "profitability" },
  { label: "Buyer relationship potential", key: "buyerRelationshipPotential" },
  { label: "Strategic fit", key: "strategicFit" },
  { label: "Ease of delivery", key: "easeOfDelivery" },
  { label: "Compliance requirements", key: "complianceRequirements" },
  { label: "Deadline", key: "deadline" },
  { label: "Competition level", key: "competitionLevel" },
  { label: "Review potential", key: "reviewPotential" },
  { label: "Cashflow speed", key: "cashflowSpeed" },
];

export function GoalsStrategy({ data, onChange, isLocked }: GoalsStrategyProps) {
  const readiness = deriveStrategyReadiness(data);
  const factorPriorities = data.opportunityFactorPriorities || {};

  const handleFactorChange = (key: string, value: string) => {
    if (isLocked) return;
    onChange('opportunityFactorPriorities', {
      ...factorPriorities,
      [key]: value
    });
  };

  return (
    <div className="space-y-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Goals, Opportunity Strategy and Bid/No-Bid Rules</h2>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-blue-800 text-sm leading-relaxed">
          “This section helps us understand what opportunities are worth pursuing and which should be avoided. Clear opportunity rules help protect your time, budget, capacity and commercial position.”
        </div>
      </div>

      {/* GROUP 1: BUSINESS GOALS */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">1</div>
          <h3 className="text-xl font-bold text-slate-900">Business Goals</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-bold">8.1 What are your main goals for using Bid Manager?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              {mainGoalOptions.map(opt => (
                <div key={opt.value} className="flex items-center gap-2">
                  <Checkbox 
                    id={`goal-${opt.value}`}
                    checked={data.mainGoals?.includes(opt.value)}
                    onCheckedChange={(checked) => {
                      const current = data.mainGoals || [];
                      const next = checked ? [...current, opt.value] : current.filter((v: string) => v !== opt.value);
                      onChange('mainGoals', next);
                    }}
                    disabled={isLocked}
                  />
                  <Label htmlFor={`goal-${opt.value}`} className="text-xs font-medium cursor-pointer leading-tight">{opt.label}</Label>
                </div>
              ))}
            </div>
            {data.mainGoals?.includes('other') && (
              <div className="animate-in fade-in slide-in-from-top-1">
                <Input value={data.otherGoal || ''} onChange={(e) => onChange('otherGoal', e.target.value)} placeholder="Please specify other goal" disabled={isLocked} className="rounded-xl mt-2" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">8.2 What does success look like for your business over the next 12 months?</Label>
            <p className="text-sm text-muted-foreground italic">Include measurable goals like revenue, contracts won, or leads per month.</p>
            <Textarea value={data.success12Months || ''} onChange={(e) => onChange('success12Months', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[100px]" />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">8.3 What does success look like over the next 24-36 months? (Optional)</Label>
            <Textarea value={data.success24To36Months || ''} onChange={(e) => onChange('success24To36Months', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[100px]" />
          </div>
        </div>
      </section>

      {/* GROUP 2: OPPORTUNITY CHANNELS */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">2</div>
          <h3 className="text-xl font-bold text-slate-900">Opportunity Channels</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-bold">8.4 Which opportunity channels are you interested in?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              {channelOptions.map(opt => (
                <div key={opt.value} className="flex items-center gap-2">
                  <Checkbox 
                    id={`channel-${opt.value}`}
                    checked={data.interestedOpportunityChannels?.includes(opt.value)}
                    onCheckedChange={(checked) => {
                      const current = data.interestedOpportunityChannels || [];
                      const next = checked ? [...current, opt.value] : current.filter((v: string) => v !== opt.value);
                      onChange('interestedOpportunityChannels', next);
                    }}
                    disabled={isLocked}
                  />
                  <Label htmlFor={`channel-${opt.value}`} className="text-xs font-medium cursor-pointer leading-tight">{opt.label}</Label>
                </div>
              ))}
            </div>
            {data.interestedOpportunityChannels?.includes('other') && (
              <div className="animate-in fade-in slide-in-from-top-1">
                <Input value={data.otherOpportunityChannel || ''} onChange={(e) => onChange('otherOpportunityChannel', e.target.value)} placeholder="Please specify other channel" disabled={isLocked} className="rounded-xl mt-2" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-base font-bold">8.5 Do you prefer fast lead generation, long-term positioning, or both?</Label>
            <RadioGroup value={data.growthPreference} onValueChange={(v) => onChange('growthPreference', v)} disabled={isLocked} className="flex flex-wrap gap-6">
              {['fast_lead_generation', 'long_term_procurement_positioning', 'both', 'unsure'].map(val => (
                <div key={val} className="flex items-center gap-2">
                  <RadioGroupItem value={val} id={`pref-${val}`} />
                  <Label htmlFor={`pref-${val}`} className="capitalize text-sm font-semibold">{val.replace(/_/g, ' ')}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </section>

      {/* GROUP 3: OPPORTUNITY VALUE AND TARGET FIT */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">3</div>
          <h3 className="text-xl font-bold text-slate-900">Opportunity Value and Target Fit</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label className="text-sm font-bold">8.6 Smallest worthwhile value</Label>
            <p className="text-[10px] text-muted-foreground italic">e.g., "$2,000 minimum" or "Unsure"</p>
            <Input value={data.minimumWorthwhileValue || ''} onChange={(e) => onChange('minimumWorthwhileValue', e.target.value)} disabled={isLocked} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold">8.7 Ideal opportunity value range</Label>
            <p className="text-[10px] text-muted-foreground italic">e.g., "$5,000 - $20,000"</p>
            <Input value={data.idealOpportunityValueRange || ''} onChange={(e) => onChange('idealOpportunityValueRange', e.target.value)} disabled={isLocked} className="rounded-xl" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-bold">8.8 Largest realistic opportunity</Label>
            <p className="text-[10px] text-muted-foreground italic">Consider staffing, cashflow and delivery capacity.</p>
            <Input value={data.largestRealisticOpportunity || ''} onChange={(e) => onChange('largestRealisticOpportunity', e.target.value)} disabled={isLocked} className="rounded-xl" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-base font-bold">8.9 Preferred clients, sectors or locations</Label>
            <Textarea value={data.preferredTargets || ''} onChange={(e) => onChange('preferredTargets', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[100px]" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-base font-bold">8.10 Clients, sectors or locations to avoid (Optional)</Label>
            <Textarea value={data.targetsToAvoid || ''} onChange={(e) => onChange('targetsToAvoid', e.target.value)} disabled={isLocked} className="rounded-xl" />
          </div>
        </div>
      </section>

      {/* GROUP 4: BID/NO-BID RULES */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">4</div>
          <h3 className="text-xl font-bold text-slate-900">Bid/No-Bid Rules</h3>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-base font-bold">8.11 Would you accept lower-margin work for strategic entry?</Label>
            <RadioGroup value={data.lowerMarginStrategicWork} onValueChange={(v) => onChange('lowerMarginStrategicWork', v)} disabled={isLocked} className="flex flex-wrap gap-6">
              {['yes', 'no', 'maybe_with_approval', 'unsure'].map(val => (
                <div key={val} className="flex items-center gap-2">
                  <RadioGroupItem value={val} id={`margin-${val}`} />
                  <Label htmlFor={`margin-${val}`} className="capitalize text-sm font-semibold">{val.replace(/_/g, ' ')}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">8.12 What would make an opportunity an automatic no?</Label>
            <p className="text-sm text-muted-foreground italic">Distance, low value, poor terms, high risk, etc.</p>
            <Textarea value={data.automaticNoRules || ''} onChange={(e) => onChange('automaticNoRules', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[100px]" />
          </div>

          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-base font-bold">8.13 Rate the importance of each opportunity factor.</Label>
              <p className="text-sm text-muted-foreground">Every factor must be assigned a priority level.</p>
            </div>
            
            <div className="rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <table className="w-full text-left bg-white">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 text-xs font-bold uppercase text-slate-500">Opportunity Factor</th>
                    <th className="p-4 text-xs font-bold uppercase text-slate-500 text-center">Low</th>
                    <th className="p-4 text-xs font-bold uppercase text-slate-500 text-center">Medium</th>
                    <th className="p-4 text-xs font-bold uppercase text-slate-500 text-center">High</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {factorRows.map((row) => (
                    <tr key={row.key}>
                      <td className="p-4 font-bold text-slate-700 text-sm">{row.label}</td>
                      {['low', 'medium', 'high'].map((level) => (
                        <td key={level} className="p-4 text-center">
                          <RadioGroup 
                            value={factorPriorities[row.key]} 
                            onValueChange={(v) => handleFactorChange(row.key, v)}
                            disabled={isLocked}
                            className="flex justify-center"
                          >
                            <div className="flex items-center">
                              <RadioGroupItem value={level} id={`${row.key}-${level}`} className="w-5 h-5" />
                              <Label htmlFor={`${row.key}-${level}`} className="sr-only">{level}</Label>
                            </div>
                          </RadioGroup>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Card */}
      {data.mainGoals?.length > 0 && (
        <Card className="bg-slate-900 border-none rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardContent className="p-10 space-y-10">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Strategy Summary</h3>
                <p className="text-slate-400 text-sm">Targeting & bid/no-bid parameters.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Compass className="w-3 h-3" /> Focus & Channels
                </p>
                <div className="space-y-3">
                  <ReadinessBadge active={readiness.hasClearGoals} label="Clear Success Goals" />
                  <ReadinessBadge active={readiness.hasTargetChannels} label={`${data.interestedOpportunityChannels?.length || 0} Channels Selected`} />
                  <ReadinessBadge active={readiness.supportsFastLeadGeneration} label="Fast Leads Pipeline" />
                  <ReadinessBadge active={readiness.supportsProcurementPositioning} label="Long-term Procurement" />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Gauge className="w-3 h-3" /> Value & Suitability
                </p>
                <div className="space-y-3">
                  <ReadinessBadge active={readiness.hasValueThresholds} label="Value Limits Defined" />
                  <ReadinessBadge active={readiness.hasPreferredTargets} label="Target Clients Mapped" />
                  <ReadinessBadge active={readiness.allowsStrategicLowMarginWork} label="Strategic Margin Rule" />
                  {readiness.lowMarginRequiresApproval && (
                     <div className="flex items-center gap-2 text-orange-400 px-4 py-2 bg-orange-400/5 rounded-xl border border-orange-400/20">
                        <Flag className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase">Margin Approval Required</span>
                     </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Ban className="w-3 h-3" /> Filtration & Rules
                </p>
                <div className="space-y-3">
                  <ReadinessBadge active={readiness.hasAutomaticNoRules} label="Automatic No-Rules Set" />
                  <ReadinessBadge active={readiness.recommendationRulesReady} label="Factor Priorities Set" />
                  {readiness.hasAvoidanceRules && (
                     <div className="flex items-center gap-2 text-red-400 px-4 py-2 bg-red-400/5 rounded-xl border border-red-400/20">
                        <Search className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase">Avoidance Filters Active</span>
                     </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 text-center">
              <p className="text-sm text-slate-400 italic">
                “Based on your goals and bid/no-bid rules, Bid Manager can assess which opportunities are worth pursuing and which should be avoided.”
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReadinessBadge({ active, label }: { active: boolean, label: string }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${active ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-slate-800/50 border-slate-800 text-slate-600'}`}>
      {active ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-700" />}
      <span className="text-xs font-bold">{label}</span>
    </div>
  );
}
