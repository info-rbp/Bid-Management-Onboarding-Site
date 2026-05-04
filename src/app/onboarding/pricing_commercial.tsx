
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
import { Plus, Trash2, CheckCircle2, Info, AlertTriangle, Calculator, CreditCard, UserCheck, ShieldCheck, DollarSign, Receipt, BadgePercent } from 'lucide-react';
import { derivePricingReadiness } from '@/lib/onboarding-steps';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PricingCommercialProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
  allData?: any;
}

const pricingMethodOptions = [
  { label: "Hourly rate", value: "hourly_rate" },
  { label: "Daily rate", value: "daily_rate" },
  { label: "Fixed fee", value: "fixed_fee" },
  { label: "Package pricing", value: "package_pricing" },
  { label: "Schedule of rates", value: "schedule_of_rates" },
  { label: "Quote after inspection", value: "quote_after_inspection" },
  { label: "Project-based pricing", value: "project_based_pricing" },
  { label: "Subscription or retainer", value: "subscription_or_retainer" },
  { label: "Cost-plus", value: "cost_plus" },
  { label: "Grant budget", value: "grant_budget" },
  { label: "Other", value: "other" },
];

export function PricingCommercial({ data, onChange, isLocked, allData }: PricingCommercialProps) {
  const pricingItems = data.pricingItems || [];
  const contacts = allData?.sections?.business_snapshot?.contacts || [];
  const pricingApprover = data.pricingApprover || { contactType: '' };

  const handleAddPricingItem = () => {
    onChange('pricingItems', [...pricingItems, { id: Math.random().toString(36).substr(2, 9) }]);
  };

  const handleRemovePricingItem = (index: number) => {
    onChange('pricingItems', pricingItems.filter((_: any, i: number) => i !== index));
  };

  const handlePricingItemChange = (index: number, field: string, value: any) => {
    const next = [...pricingItems];
    next[index] = { ...next[index], [field]: value };
    onChange('pricingItems', next);
  };

  const readiness = derivePricingReadiness(data, allData?.authority);

  return (
    <div className="space-y-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Pricing, Quoting and Commercial Rules</h2>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-blue-800 text-sm leading-relaxed">
          “This section provides the commercial guidance needed to prepare draft pricing, quotes, proposals and response assumptions. Final pricing authority is confirmed again in the Authority to Act section.”
        </div>
      </div>

      {/* GROUP 1: PRICING METHODS */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">1</div>
          <h3 className="text-xl font-bold text-slate-900">Pricing Methods</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-bold">9.1 How do you usually price your work?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              {pricingMethodOptions.map(opt => (
                <div key={opt.value} className="flex items-center gap-2">
                  <Checkbox 
                    id={`method-${opt.value}`}
                    checked={data.pricingMethods?.includes(opt.value)}
                    onCheckedChange={(checked) => {
                      const current = data.pricingMethods || [];
                      const next = checked ? [...current, opt.value] : current.filter((v: string) => v !== opt.value);
                      onChange('pricingMethods', next);
                    }}
                    disabled={isLocked}
                  />
                  <Label htmlFor={`method-${opt.value}`} className="text-xs font-medium cursor-pointer leading-tight">{opt.label}</Label>
                </div>
              ))}
            </div>
            {data.pricingMethods?.includes('other') && (
              <Input value={data.otherPricingMethod || ''} onChange={(e) => onChange('otherPricingMethod', e.target.value)} placeholder="Please specify other method" disabled={isLocked} className="rounded-xl mt-2" />
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-base font-bold">9.2 Standard rates, packages or pricing guidance</Label>
            <p className="text-sm text-muted-foreground italic">Include rates, minimum charges, inclusions and exclusions.</p>
            <Textarea value={data.standardRatesPackagesGuidance || ''} onChange={(e) => onChange('standardRatesPackagesGuidance', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[120px]" />
            
            <div className="space-y-4 pt-4">
              <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Structured Pricing Rows (Optional)</Label>
              <div className="grid grid-cols-1 gap-4">
                {pricingItems.map((item: any, idx: number) => (
                  <Card key={idx} className="border-2 border-slate-100 rounded-2xl p-4 relative pt-10">
                    <Button variant="ghost" size="sm" onClick={() => handleRemovePricingItem(idx)} disabled={isLocked} className="absolute top-2 right-2 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input placeholder="Item name" value={item.itemName || ''} onChange={(e) => handlePricingItemChange(idx, 'itemName', e.target.value)} disabled={isLocked} className="h-9 rounded-lg" />
                      <Input placeholder="Amount / Range" value={item.amountOrRange || ''} onChange={(e) => handlePricingItemChange(idx, 'amountOrRange', e.target.value)} disabled={isLocked} className="h-9 rounded-lg" />
                      <Input placeholder="Unit (e.g., hr, m2)" value={item.unit || ''} onChange={(e) => handlePricingItemChange(idx, 'unit', e.target.value)} disabled={isLocked} className="h-9 rounded-lg" />
                    </div>
                  </Card>
                ))}
                <Button onClick={handleAddPricingItem} variant="outline" disabled={isLocked} className="w-full h-12 border-dashed border-2 rounded-xl font-bold gap-2">
                  <Plus className="w-4 h-4" /> Add Pricing Row
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">9.3 Do you have a minimum required profit margin? (Optional)</Label>
            <Input value={data.minimumRequiredProfitMargin || ''} onChange={(e) => onChange('minimumRequiredProfitMargin', e.target.value)} placeholder="e.g., 20%, 30%" disabled={isLocked} className="rounded-xl max-w-xs" />
          </div>
        </div>
      </section>

      {/* GROUP 2: FEES, DISCOUNTS AND PAYMENT TERMS */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">2</div>
          <h3 className="text-xl font-bold text-slate-900">Fees, Discounts and Payment Terms</h3>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-base font-bold">9.4 Can discounts be offered?</Label>
            <RadioGroup value={data.discountPolicy} onValueChange={(v) => onChange('discountPolicy', v)} disabled={isLocked} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['yes', 'no', 'only_with_approval', 'depends_on_opportunity'].map(val => (
                <div key={val} className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <RadioGroupItem value={val} id={`disc-${val}`} />
                  <Label htmlFor={`disc-${val}`} className="capitalize text-xs font-semibold">{val.replace(/_/g, ' ')}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">9.5 Additional Fees (Travel, Mobilisation, Admin, etc.)</Label>
            <Textarea value={data.additionalFees || ''} onChange={(e) => onChange('additionalFees', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">9.6 What payment terms do you require?</Label>
            <p className="text-sm text-muted-foreground italic">e.g., Upfront deposit, 14 days, Milestones.</p>
            <Textarea value={data.paymentTerms || ''} onChange={(e) => onChange('paymentTerms', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" />
          </div>
        </div>
      </section>

      {/* GROUP 3: PRICING APPROVAL RULES */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">3</div>
          <h3 className="text-xl font-bold text-slate-900">Pricing Approval Rules</h3>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-base font-bold">9.7 Who must approve pricing before submission?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={pricingApprover.contactType} onValueChange={(v) => onChange('pricingApprover', { ...pricingApprover, contactType: v })} disabled={isLocked}>
                <SelectTrigger className="rounded-xl h-12">
                  <SelectValue placeholder="Select approver role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary_contact">Primary Contact</SelectItem>
                  <SelectItem value="secondary_contact">Secondary Contact</SelectItem>
                  <SelectItem value="section_2_pricing_contact">Pricing/Commercial Contact</SelectItem>
                  <SelectItem value="section_2_final_decision_maker">Final Decision Maker</SelectItem>
                  <SelectItem value="section_2_urgent_approval_contact">Urgent Approval Contact</SelectItem>
                  <SelectItem value="custom">Custom Approver</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {pricingApprover.contactType === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                <Input placeholder="Full Name" value={pricingApprover.fullName || ''} onChange={(e) => onChange('pricingApprover', { ...pricingApprover, fullName: e.target.value })} disabled={isLocked} className="rounded-xl" />
                <Input placeholder="Email" value={pricingApprover.email || ''} onChange={(e) => onChange('pricingApprover', { ...pricingApprover, email: e.target.value })} disabled={isLocked} className="rounded-xl" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-base font-bold">9.8 Can Bid Manager prepare draft pricing using your guidance?</Label>
            <RadioGroup value={data.canPrepareDraftPricing} onValueChange={(v) => onChange('canPrepareDraftPricing', v)} disabled={isLocked} className="grid grid-cols-1 gap-3">
              {[
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
                { label: 'Yes, but all must be approved before submission', value: 'yes_but_requires_approval_before_submission' },
              ].map(opt => (
                <div key={opt.value} className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <RadioGroupItem value={opt.value} id={`draft-${opt.value}`} />
                  <Label htmlFor={`draft-${opt.value}`} className="text-sm font-semibold">{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-bold">9.9 Can Bid Manager submit pricing without approval under an agreed threshold?</Label>
            <RadioGroup value={data.canSubmitPricingUnderThreshold} onValueChange={(v) => onChange('canSubmitPricingUnderThreshold', v)} disabled={isLocked} className="flex gap-6">
              {['yes', 'no', 'maybe_to_be_discussed'].map(val => (
                <div key={val} className="flex items-center gap-2">
                  <RadioGroupItem value={val} id={`thresh-${val}`} />
                  <Label htmlFor={`thresh-${val}`} className="capitalize text-sm font-semibold">{val.replace(/_/g, ' ')}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {(data.canSubmitPricingUnderThreshold === 'yes' || data.canSubmitPricingUnderThreshold === 'maybe_to_be_discussed') && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label className="text-base font-bold">9.10 Maximum quote value without final approval</Label>
              <p className="text-[10px] text-muted-foreground italic">e.g., $500, $2,500, or "None until agreed"</p>
              <Input value={data.maximumQuoteValueWithoutFinalApproval || ''} onChange={(e) => onChange('maximumQuoteValueWithoutFinalApproval', e.target.value)} disabled={isLocked} className="rounded-xl max-w-xs" />
            </div>
          )}
        </div>
      </section>

      {/* GROUP 4: COMMERCIAL RULES AND ASSUMPTIONS */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">4</div>
          <h3 className="text-xl font-bold text-slate-900">Commercial Rules and Assumptions</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base font-bold">9.11 Pricing rules, commercial terms, assumptions or exclusions</Label>
            <p className="text-sm text-muted-foreground leading-relaxed italic">Include validity periods, deposit requirements, scope limits, site access, etc.</p>
            <Textarea value={data.pricingRulesCommercialTermsAssumptions || ''} onChange={(e) => onChange('pricingRulesCommercialTermsAssumptions', e.target.value)} disabled={isLocked} className="rounded-2xl min-h-[120px]" />
          </div>
        </div>
      </section>

      {/* Summary Card */}
      {data.pricingMethods?.length > 0 && (
        <Card className="bg-slate-900 border-none rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardContent className="p-10 space-y-10">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Calculator className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Pricing Readiness Summary</h3>
                <p className="text-slate-400 text-sm">Commercial rules & authority parameters.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <BadgePercent className="w-3 h-3" /> Method & Rates
                </p>
                <div className="space-y-3">
                  <ReadinessBadge active={readiness.hasPricingMethod} label="Methods Defined" />
                  <ReadinessBadge active={readiness.hasPricingGuidance} label="Pricing Guidance Set" />
                  <ReadinessBadge active={readiness.hasStructuredPricingItems} label="Structured Rates List" />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard className="w-3 h-3" /> Terms & Fees
                </p>
                <div className="space-y-3">
                  <ReadinessBadge active={readiness.hasPaymentTerms} label="Payment Terms Set" />
                  <ReadinessBadge active={readiness.hasAdditionalFeesGuidance} label="Extra Fees Defined" />
                  <ReadinessBadge active={readiness.hasCommercialTerms} label="Commercial Terms Set" />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3" /> Approval & Authority
                </p>
                <div className="space-y-3">
                  <ReadinessBadge active={readiness.hasPricingApprover} label="Approver Designated" />
                  <ReadinessBadge active={readiness.canDraftPricing} label="Drafting Authorized" />
                  {readiness.thresholdSubmissionRequested && (
                    <div className="flex items-center gap-2 text-orange-400 px-4 py-2 bg-orange-400/5 rounded-xl border border-orange-400/20">
                      <DollarSign className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase">Threshold Authority: {data.maximumQuoteValueWithoutFinalApproval || 'Pending'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 text-center space-y-4">
              <p className="text-sm text-slate-400 italic">
                “Based on your pricing details, Bid Manager can prepare draft pricing guidance and quote assumptions, subject to the approval rules confirmed in Authority.”
              </p>
              <div className="flex justify-center gap-3">
                <ChannelStatus active={readiness.pricingReadyForDrafting} label="Drafting Ready" />
                <ChannelStatus active={readiness.pricingReadyForSubmission} label="Submission Ready" />
              </div>
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

function ChannelStatus({ active, label }: { active: boolean, label: string }) {
  return (
    <Badge variant="outline" className={`border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${active ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
      {label}
    </Badge>
  );
}
