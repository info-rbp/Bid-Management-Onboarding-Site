
"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Lightbulb, 
  PocketKnife, 
  Anchor, 
  MessageCircleQuestion,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Briefcase,
  Target,
  ShieldCheck,
  UserCheck,
  Rocket
} from 'lucide-react';
import { deriveActiveServiceModules } from '@/lib/onboarding-steps';

interface ServiceModulesProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
  allData: any;
}

export default function ServiceModules({ data, onChange, isLocked, allData }: ServiceModulesProps) {
  const selectedServices = allData?.sections?.service_selection?.selectedServices || [];
  const activeModules = deriveActiveServiceModules(selectedServices);
  const contacts = allData?.sections?.business_snapshot?.contacts || [];
  const offers = allData?.sections?.offer_menu?.offerItems || [];

  const [expanded, setExpanded] = useState<string[]>(
    Object.entries(activeModules).filter(([_, v]) => v).map(([k]) => k)
  );

  const toggleExpand = (key: string) => {
    setExpanded(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleModuleChange = (moduleKey: string, field: string, value: any) => {
    const moduleData = data[moduleKey] || {};
    onChange(moduleKey, { ...moduleData, [field]: value });
  };

  const renderContactSelector = (label: string, value: any, onSelect: (val: any) => void) => (
    <div className="space-y-3">
      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select 
          value={value?.contactType || ''} 
          onChange={(e) => onSelect({ ...value, contactType: e.target.value })}
          disabled={isLocked}
          className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Select approver...</option>
          <option value="primary_contact">Primary Contact</option>
          <option value="secondary_contact">Secondary Contact</option>
          <option value="section_2_final_decision_maker">Final Decision Maker</option>
          <option value="section_2_urgent_approval_contact">Urgent Approver</option>
          <option value="custom">Custom Approver</option>
        </select>
      </div>
      {value?.contactType === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
          <Input placeholder="Full Name" value={value?.fullName || ''} onChange={(e) => onSelect({ ...value, fullName: e.target.value })} disabled={isLocked} className="rounded-xl h-10" />
          <Input placeholder="Email" value={value?.email || ''} onChange={(e) => onSelect({ ...value, email: e.target.value })} disabled={isLocked} className="rounded-xl h-10" />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Service Modules</h2>
        <p className="text-slate-500 leading-relaxed">
          Based on your service selections, please provide the following specific information to help us support you effectively.
        </p>
      </div>

      <div className="space-y-6">
        {/* 12A: TENDER & SUPPLIER READINESS */}
        {activeModules.tenderSupplierReadiness && (
          <ModuleCard 
            title="12A. Tender and Supplier Registration Readiness" 
            icon={FileText} 
            isExpanded={expanded.includes('tenderSupplierReadiness')}
            onToggle={() => toggleExpand('tenderSupplierReadiness')}
          >
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-base font-bold">12A.1 Previous experience with tenders or panels?</Label>
                <RadioGroup 
                  value={data.tenderSupplierReadiness?.previousTenderSupplierExperience} 
                  onValueChange={(v) => handleModuleChange('tenderSupplierReadiness', 'previousTenderSupplierExperience', v)}
                  className="flex flex-wrap gap-4"
                  disabled={isLocked}
                >
                  {['yes', 'no', 'some', 'unsure'].map(v => (
                    <div key={v} className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                      <RadioGroupItem value={v} id={`t1-${v}`} /><Label htmlFor={`t1-${v}`} className="capitalize text-sm font-semibold">{v}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {(data.tenderSupplierReadiness?.previousTenderSupplierExperience === 'yes' || data.tenderSupplierReadiness?.previousTenderSupplierExperience === 'some') && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                  <Label className="text-sm font-bold">12A.2 Which tender or supplier portals have you used before?</Label>
                  <Textarea value={data.tenderSupplierReadiness?.previousPortalsUsed || ''} onChange={(e) => handleModuleChange('tenderSupplierReadiness', 'previousPortalsUsed', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-bold">12A.3 What types of buyers or organisations do you want to target?</Label>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">e.g., Local councils, schools, mining companies, health providers.</p>
                <Textarea value={data.tenderSupplierReadiness?.targetBuyers || ''} onChange={(e) => handleModuleChange('tenderSupplierReadiness', 'targetBuyers', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">12A.4 What contract sizes are realistic for your business?</Label>
                <p className="text-xs text-muted-foreground italic">Consider staffing, equipment, insurance and cashflow.</p>
                <Textarea value={data.tenderSupplierReadiness?.realisticContractSizes || ''} onChange={(e) => handleModuleChange('tenderSupplierReadiness', 'realisticContractSizes', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-sm font-bold">12A.5 Prepared for compliance requirements?</Label>
                  <RadioGroup value={data.tenderSupplierReadiness?.preparedForComplianceRequirements} onValueChange={(v) => handleModuleChange('tenderSupplierReadiness', 'preparedForComplianceRequirements', v)} className="flex flex-wrap gap-3" disabled={isLocked}>
                    {['yes', 'no', 'partly', 'unsure'].map(v => <div key={v} className="flex items-center gap-2"><RadioGroupItem value={v} id={`t5-${v}`} /><Label htmlFor={`t5-${v}`} className="capitalize text-xs font-medium">{v}</Label></div>)}
                  </RadioGroup>
                </div>
                <div className="space-y-4">
                  <Label className="text-sm font-bold">12A.6 Previous materials available for review?</Label>
                  <RadioGroup value={data.tenderSupplierReadiness?.previousMaterialsAvailable} onValueChange={(v) => handleModuleChange('tenderSupplierReadiness', 'previousMaterialsAvailable', v)} className="flex flex-wrap gap-3" disabled={isLocked}>
                    {['yes', 'no', 'some', 'unsure'].map(v => <div key={v} className="flex items-center gap-2"><RadioGroupItem value={v} id={`t6-${v}`} /><Label htmlFor={`t6-${v}`} className="capitalize text-xs font-medium">{v}</Label></div>)}
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">12A.7 Tender categories or requirements to avoid? (Optional)</Label>
                <Textarea value={data.tenderSupplierReadiness?.tenderAvoidanceRules || ''} onChange={(e) => handleModuleChange('tenderSupplierReadiness', 'tenderAvoidanceRules', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
                {renderContactSelector('12A.8 Submission Approver', data.tenderSupplierReadiness?.submissionApprover, (v) => handleModuleChange('tenderSupplierReadiness', 'submissionApprover', v))}
                {renderContactSelector('12A.9 Contract Terms Approver', data.tenderSupplierReadiness?.contractTermsApprover, (v) => handleModuleChange('tenderSupplierReadiness', 'contractTermsApprover', v))}
              </div>
            </div>
          </ModuleCard>
        )}

        {/* 12B: GRANTS */}
        {activeModules.grants && (
          <ModuleCard title="12B. Grants" icon={Lightbulb} isExpanded={expanded.includes('grants')} onToggle={() => toggleExpand('grants')}>
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-base font-bold">12B.1 Are you interested in grant funding support?</Label>
                <RadioGroup value={data.grants?.interestedInGrantSupport} onValueChange={(v) => handleModuleChange('grants', 'interestedInGrantSupport', v)} className="flex flex-wrap gap-6" disabled={isLocked}>
                   {['yes', 'no', 'maybe_please_advise'].map(v => <div key={v} className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100"><RadioGroupItem value={v} id={`g1-${v}`} /><Label htmlFor={`g1-${v}`} className="capitalize text-sm font-semibold">{v.replace(/_/g, ' ')}</Label></div>)}
                </RadioGroup>
              </div>

              {data.grants?.interestedInGrantSupport !== 'no' && (
                <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">12B.2 What would you use grant funding for?</Label>
                    <p className="text-xs text-muted-foreground italic">e.g., Equipment, technology, staff training, community project.</p>
                    <Textarea value={data.grants?.fundingUse || ''} onChange={(e) => handleModuleChange('grants', 'fundingUse', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2"><Label className="text-sm font-bold">12B.3 Why is this project needed?</Label><Textarea value={data.grants?.projectNeed || ''} onChange={(e) => handleModuleChange('grants', 'projectNeed', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" /></div>
                    <div className="space-y-2"><Label className="text-sm font-bold">12B.4 Who benefits from the project?</Label><Textarea value={data.grants?.projectBeneficiaries || ''} onChange={(e) => handleModuleChange('grants', 'projectBeneficiaries', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" /></div>
                    <div className="space-y-2"><Label className="text-sm font-bold">12B.5 Where will it happen?</Label><Input value={data.grants?.projectLocation || ''} onChange={(e) => handleModuleChange('grants', 'projectLocation', e.target.value)} disabled={isLocked} className="rounded-xl" /></div>
                    <div className="space-y-2"><Label className="text-sm font-bold">12B.6 Start and finish timing?</Label><Input value={data.grants?.projectTiming || ''} onChange={(e) => handleModuleChange('grants', 'projectTiming', e.target.value)} disabled={isLocked} className="rounded-xl" /></div>
                    <div className="space-y-2"><Label className="text-sm font-bold">12B.7 Estimated total cost</Label><Input value={data.grants?.estimatedTotalProjectCost || ''} onChange={(e) => handleModuleChange('grants', 'estimatedTotalProjectCost', e.target.value)} disabled={isLocked} className="rounded-xl" /></div>
                    <div className="space-y-2"><Label className="text-sm font-bold">12B.8 Funding amount needed</Label><Input value={data.grants?.fundingAmountNeeded || ''} onChange={(e) => handleModuleChange('grants', 'fundingAmountNeeded', e.target.value)} disabled={isLocked} className="rounded-xl" /></div>
                  </div>
                  <div className="space-y-2"><Label className="text-sm font-bold">12B.9 Can you contribute resources (cash, labour, etc.)?</Label><Textarea value={data.grants?.clientContribution || ''} onChange={(e) => handleModuleChange('grants', 'clientContribution', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" /></div>
                  <div className="space-y-2"><Label className="text-sm font-bold">12B.10 Main outcomes (Jobs, productivity, community benefit)?</Label><Textarea value={data.grants?.projectOutcomes || ''} onChange={(e) => handleModuleChange('grants', 'projectOutcomes', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" /></div>
                  <div className="space-y-2"><Label className="text-sm font-bold">12B.14 What happens after grant funding ends?</Label><Textarea value={data.grants?.afterFundingPlan || ''} onChange={(e) => handleModuleChange('grants', 'afterFundingPlan', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" /></div>
                </div>
              )}
            </div>
          </ModuleCard>
        )}

        {/* 12C: MARKETPLACE LEADS */}
        {activeModules.marketplaceLeads && (
          <ModuleCard title="12C. Marketplace Lead Strategy" icon={PocketKnife} isExpanded={expanded.includes('marketplaceLeads')} onToggle={() => toggleExpand('marketplaceLeads')}>
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-sm font-bold">12C.1 Marketplace platforms you are open to using?</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  {['Airtasker', 'Bark', 'ServiceSeeking', 'Oneflare', 'hipages', 'Upwork', 'Freelancer', 'Fiverr'].map(p => (
                    <div key={p} className="flex items-center gap-2">
                      <Checkbox 
                        id={`m1-${p}`} 
                        checked={data.marketplaceLeads?.openMarketplacePlatforms?.includes(p.toLowerCase())} 
                        onCheckedChange={(checked) => {
                          const current = data.marketplaceLeads?.openMarketplacePlatforms || [];
                          const next = checked ? [...current, p.toLowerCase()] : current.filter((v: string) => v !== p.toLowerCase());
                          handleModuleChange('marketplaceLeads', 'openMarketplacePlatforms', next);
                        }}
                        disabled={isLocked}
                      />
                      <Label htmlFor={`m1-${p}`} className="text-xs font-medium cursor-pointer">{p}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">12C.2 Which services are suitable for marketplaces?</Label>
                <p className="text-xs text-muted-foreground italic">Linked to your offer menu.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {offers.map((offer: any) => (
                    <div key={offer.id} className="flex items-center gap-2 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                       <Checkbox 
                        id={`mo-${offer.id}`}
                        checked={data.marketplaceLeads?.suitableServices?.includes(offer.id)}
                        onCheckedChange={(checked) => {
                          const current = data.marketplaceLeads?.suitableServices || [];
                          const next = checked ? [...current, offer.id] : current.filter((v: string) => v !== offer.id);
                          handleModuleChange('marketplaceLeads', 'suitableServices', next);
                        }}
                        disabled={isLocked}
                       />
                       <Label htmlFor={`mo-${offer.id}`} className="text-xs font-bold text-slate-700 truncate">{offer.name}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2"><Label className="text-sm font-bold">12C.3 Worthwhile lead types?</Label><Textarea value={data.marketplaceLeads?.worthwhileLeadTypes || ''} onChange={(e) => handleModuleChange('marketplaceLeads', 'worthwhileLeadTypes', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" /></div>
                <div className="space-y-2"><Label className="text-sm font-bold">12C.4 Minimum job value?</Label><Input value={data.marketplaceLeads?.minimumJobValue || ''} onChange={(e) => handleModuleChange('marketplaceLeads', 'minimumJobValue', e.target.value)} disabled={isLocked} className="rounded-xl" /></div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-bold">12C.5 Urgent work capacity?</Label>
                <div className="flex flex-wrap gap-4">
                  {['Same-day', 'Next-day', 'Within 2-3 days', 'Within 1 week'].map(v => (
                    <div key={v} className="flex items-center gap-2">
                       <Checkbox 
                        id={`u-${v}`}
                        checked={data.marketplaceLeads?.urgentWorkCapacity?.includes(v.toLowerCase().replace(/ /g, '_'))}
                        onCheckedChange={(checked) => {
                          const current = data.marketplaceLeads?.urgentWorkCapacity || [];
                          const next = checked ? [...current, v.toLowerCase().replace(/ /g, '_')] : current.filter((val: string) => val !== v.toLowerCase().replace(/ /g, '_'));
                          handleModuleChange('marketplaceLeads', 'urgentWorkCapacity', next);
                        }}
                        disabled={isLocked}
                       />
                       <Label htmlFor={`u-${v}`} className="text-xs font-medium">{v}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">12C.6 Types of jobs to ignore?</Label>
                <Textarea value={data.marketplaceLeads?.jobsToIgnore || ''} onChange={(e) => handleModuleChange('marketplaceLeads', 'jobsToIgnore', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
                <div className="space-y-4">
                  <Label className="text-sm font-bold">12C.8 Approve responses before sending?</Label>
                  <RadioGroup value={data.marketplaceLeads?.responseApprovalRequirement} onValueChange={(v) => handleModuleChange('marketplaceLeads', 'responseApprovalRequirement', v)} className="space-y-2" disabled={isLocked}>
                    {['yes', 'no', 'only_above_agreed_value', 'unsure'].map(v => <div key={v} className="flex items-center gap-2"><RadioGroupItem value={v} id={`ma-${v}`} /><Label htmlFor={`ma-${v}`} className="text-xs capitalize">{v.replace(/_/g, ' ')}</Label></div>)}
                  </RadioGroup>
                </div>
                <div className="space-y-4">
                   <Label className="text-sm font-bold">12C.9 Submit under threshold?</Label>
                   <RadioGroup value={data.marketplaceLeads?.canSubmitUnderThreshold} onValueChange={(v) => handleModuleChange('marketplaceLeads', 'canSubmitUnderThreshold', v)} className="space-y-2" disabled={isLocked}>
                    {['yes', 'no', 'maybe_to_be_discussed'].map(v => <div key={v} className="flex items-center gap-2"><RadioGroupItem value={v} id={`mt-${v}`} /><Label htmlFor={`mt-${v}`} className="text-xs capitalize">{v.replace(/_/g, ' ')}</Label></div>)}
                  </RadioGroup>
                </div>
              </div>
            </div>
          </ModuleCard>
        )}

        {/* 12D: DIRECT PROPOSAL & OUTREACH */}
        {activeModules.directProposalOutreach && (
          <ModuleCard title="12D. Direct Proposal and Outreach Strategy" icon={Anchor} isExpanded={expanded.includes('directProposalOutreach')} onToggle={() => expandModule('directProposalOutreach')}>
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-base font-bold">12D.1 Interested in direct business development support?</Label>
                <RadioGroup value={data.directProposalOutreach?.interestedInDirectBusinessDevelopment} onValueChange={(v) => handleModuleChange('directProposalOutreach', 'interestedInDirectBusinessDevelopment', v)} className="flex flex-wrap gap-6" disabled={isLocked}>
                  {['yes', 'no', 'maybe_please_advise'].map(v => <div key={v} className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100"><RadioGroupItem value={v} id={`d1-${v}`} /><Label htmlFor={`d1-${v}`} className="capitalize text-sm font-semibold">{v.replace(/_/g, ' ')}</Label></div>)}
                </RadioGroup>
              </div>

              {data.directProposalOutreach?.interestedInDirectBusinessDevelopment !== 'no' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-2">
                   <div className="space-y-4">
                     <Label className="text-sm font-bold">12D.2 Growth channels you are open to?</Label>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {['Direct proposals', 'Email outreach', 'LinkedIn outreach', 'Referral partner outreach', 'Capability statement campaign'].map(c => (
                          <div key={c} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                            <Checkbox id={`dc-${c}`} checked={data.directProposalOutreach?.directGrowthChannels?.includes(c.toLowerCase().replace(/ /g, '_'))} onCheckedChange={(checked) => {
                              const current = data.directProposalOutreach?.directGrowthChannels || [];
                              const next = checked ? [...current, c.toLowerCase().replace(/ /g, '_')] : current.filter((v: string) => v !== c.toLowerCase().replace(/ /g, '_'));
                              handleModuleChange('directProposalOutreach', 'directGrowthChannels', next);
                            }} disabled={isLocked} />
                            <Label htmlFor={`dc-${c}`} className="text-xs font-semibold">{c}</Label>
                          </div>
                        ))}
                     </div>
                   </div>
                   <div className="space-y-2"><Label className="text-sm font-bold">12D.3 Target organisations or sectors?</Label><Textarea value={data.directProposalOutreach?.targetOrganisationsSectors || ''} onChange={(e) => handleModuleChange('directProposalOutreach', 'targetOrganisationsSectors', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" /></div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2"><Label className="text-sm font-bold">12D.4 Existing relationships?</Label><Textarea value={data.directProposalOutreach?.existingTargetRelationships || ''} onChange={(e) => handleModuleChange('directProposalOutreach', 'existingTargetRelationships', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" /></div>
                     <div className="space-y-2"><Label className="text-sm font-bold">12D.5 Dormant contacts to re-engage?</Label><Textarea value={data.directProposalOutreach?.previousClientsDormantContacts || ''} onChange={(e) => handleModuleChange('directProposalOutreach', 'previousClientsDormantContacts', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" /></div>
                   </div>
                   <div className="space-y-4">
                     <Label className="text-sm font-bold">12D.8 Creative campaigns of interest?</Label>
                     <div className="grid grid-cols-2 gap-3">
                       {['First Contract Starter Pack', 'Local Supplier Intro', 'Marketplace Review Builder', 'Dormant Client Reactivation'].map(c => (
                         <div key={c} className="flex items-center gap-2">
                           <Checkbox id={`camp-${c}`} checked={data.directProposalOutreach?.interestedCampaigns?.includes(c.toLowerCase().replace(/ /g, '_'))} onCheckedChange={(checked) => {
                             const current = data.directProposalOutreach?.interestedCampaigns || [];
                             const next = checked ? [...current, c.toLowerCase().replace(/ /g, '_')] : current.filter((v: string) => v !== c.toLowerCase().replace(/ /g, '_'));
                             handleModuleChange('directProposalOutreach', 'interestedCampaigns', next);
                           }} disabled={isLocked} />
                           <Label htmlFor={`camp-${c}`} className="text-xs">{c}</Label>
                         </div>
                       ))}
                     </div>
                   </div>
                </div>
              )}
            </div>
          </ModuleCard>
        )}

        {/* 12E: QUOTE REQUEST SUPPORT */}
        {activeModules.quoteRequests && (
          <ModuleCard title="12E. Quote Request Support" icon={MessageCircleQuestion} isExpanded={expanded.includes('quoteRequests')} onToggle={() => toggleExpand('quoteRequests')}>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2"><Label className="text-sm font-bold">12E.1 Types of quote requests received?</Label><Textarea value={data.quoteRequests?.quoteRequestTypes || ''} onChange={(e) => handleModuleChange('quoteRequests', 'quoteRequestTypes', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" /></div>
                <div className="space-y-2"><Label className="text-sm font-bold">12E.2 Information needed to quote accurately?</Label><Textarea value={data.quoteRequests?.informationNeededToQuote || ''} onChange={(e) => handleModuleChange('quoteRequests', 'informationNeededToQuote', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" /></div>
              </div>
              <div className="space-y-2"><Label className="text-sm font-bold">12E.4 Standard quote assumptions?</Label><Textarea value={data.quoteRequests?.standardQuoteAssumptions || ''} onChange={(e) => handleModuleChange('quoteRequests', 'standardQuoteAssumptions', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" /></div>
              <div className="space-y-2"><Label className="text-sm font-bold">12E.5 Standard quote exclusions?</Label><Textarea value={data.quoteRequests?.standardQuoteExclusions || ''} onChange={(e) => handleModuleChange('quoteRequests', 'standardQuoteExclusions', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" /></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
                <div className="space-y-2"><Label className="text-sm font-bold">12E.6 Quote validity period?</Label><Input value={data.quoteRequests?.quoteValidityPeriod || ''} onChange={(e) => handleModuleChange('quoteRequests', 'quoteValidityPeriod', e.target.value)} disabled={isLocked} className="rounded-xl" placeholder="e.g., 30 days" /></div>
                {renderContactSelector('12E.7 Who approves quotes?', data.quoteRequests?.quoteApprover, (v) => handleModuleChange('quoteRequests', 'quoteApprover', v))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <Label className="text-sm font-bold">12E.8 Prepare draft quotes?</Label>
                   <RadioGroup value={data.quoteRequests?.canPrepareDraftQuotes} onValueChange={(v) => handleModuleChange('quoteRequests', 'canPrepareDraftQuotes', v)} className="space-y-2" disabled={isLocked}>
                    {['yes', 'no', 'yes_but_all_quotes_must_be_reviewed'].map(v => <div key={v} className="flex items-center gap-2"><RadioGroupItem value={v} id={`qd-${v}`} /><Label htmlFor={`qd-${v}`} className="text-xs capitalize">{v.replace(/_/g, ' ')}</Label></div>)}
                  </RadioGroup>
                </div>
                <div className="space-y-4">
                   <Label className="text-sm font-bold">12E.9 Send quotes under threshold?</Label>
                   <RadioGroup value={data.quoteRequests?.canSendQuotesUnderThreshold} onValueChange={(v) => handleModuleChange('quoteRequests', 'canSendQuotesUnderThreshold', v)} className="space-y-2" disabled={isLocked}>
                    {['yes', 'no', 'maybe_to_be_discussed'].map(v => <div key={v} className="flex items-center gap-2"><RadioGroupItem value={v} id={`qt-${v}`} /><Label htmlFor={`qt-${v}`} className="text-xs capitalize">{v.replace(/_/g, ' ')}</Label></div>)}
                  </RadioGroup>
                </div>
              </div>
            </div>
          </ModuleCard>
        )}

        {Object.values(activeModules).every(v => !v) && (
          <div className="py-20 text-center space-y-6">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">No Service Modules Required</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Based on your service selections, no additional service-specific modules are currently required.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Card */}
      {Object.values(activeModules).some(v => v) && (
        <Card className="bg-slate-900 border-none rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardContent className="p-10 space-y-10">
             <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Rocket className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Service Module Summary</h3>
                <p className="text-slate-400 text-sm">Deep-dive readiness parameters.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {activeModules.tenderSupplierReadiness && <ModuleSummaryBadge label="Tenders & Panels" icon={FileText} />}
               {activeModules.grants && <ModuleSummaryBadge label="Grant Projects" icon={Lightbulb} />}
               {activeModules.marketplaceLeads && <ModuleSummaryBadge label="Marketplace Strategy" icon={PocketKnife} />}
               {activeModules.directProposalOutreach && <ModuleSummaryBadge label="Outreach & BD" icon={Anchor} />}
               {activeModules.quoteRequests && <ModuleSummaryBadge label="Quote Support" icon={MessageCircleQuestion} />}
            </div>

            <div className="pt-8 border-t border-slate-800 text-center">
              <p className="text-sm text-slate-400 italic">
                “This information allows Bid Manager to assess suitability and prepare responses accurately for your selected services.”
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ModuleCard({ title, icon: Icon, isExpanded, onToggle, children }: any) {
  return (
    <Card className="border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
      <div 
        className="p-8 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <Badge variant="secondary" className="mt-1 bg-slate-100 text-slate-500 border-none text-[10px] uppercase font-bold tracking-wider">
              Triggered by selection
            </Badge>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-6 h-6 text-slate-400" /> : <ChevronDown className="w-6 h-6 text-slate-400" />}
      </div>
      {isExpanded && (
        <CardContent className="px-8 pb-12 pt-4 border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

function ModuleSummaryBadge({ label, icon: Icon }: any) {
  return (
    <div className="flex items-center gap-3 bg-slate-800/50 rounded-2xl p-4 border border-slate-800">
      <Icon className="w-5 h-5 text-primary" />
      <span className="text-xs font-bold text-slate-300">{label}</span>
    </div>
  );
}
