
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
  Rocket,
} from 'lucide-react';
import { deriveActiveServiceModules } from '@/lib/onboarding-steps';
import { ClientDocumentUploader } from './client_document_uploader';
import {
  FieldError,
  getFieldError,
  getFieldErrorId,
  isFieldInvalid,
} from '@/components/FieldError';

interface ServiceModulesProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
  fieldErrors?: Record<string, string>;
  allData: any;
}

const MARKETPLACE_FALLBACK_OPTIONS = [
  {
    value: '__need_help_defining__',
    label: 'No suitable services are defined yet and I need help mapping them.',
  },
  {
    value: '__offer_menu_pending__',
    label: 'I still need to finish the Offer Menu before choosing marketplace services.',
  },
];

export default function ServiceModules({
  data,
  onChange,
  isLocked,
  allData,
  fieldErrors,
}: ServiceModulesProps) {
  const selectedServices = allData?.sections?.service_selection?.selectedServices || [];
  const activeModules = deriveActiveServiceModules(selectedServices);
  const offers = (allData?.sections?.offer_menu?.offerItems || []).filter(
    (offer: any) => offer?.id && offer?.name
  );
  const hasOfferItems = offers.length > 0;
  const hasActiveModules = Object.values(activeModules).some(Boolean);
  const marketplaceSuitableServices = Array.isArray(
    data.marketplaceLeads?.suitableServices
  )
    ? data.marketplaceLeads.suitableServices
    : [];
  const marketplaceFallbackSelection =
    marketplaceSuitableServices.find(
      (value: string) => typeof value === 'string' && value.startsWith('__')
    ) || '';

  const [expanded, setExpanded] = useState<string[]>(
    Object.entries(activeModules)
      .filter(([_, value]) => value)
      .map(([key]) => key)
  );

  const expandModule = (key: string) => {
    setExpanded((prev) =>
      prev.includes(key) ? prev.filter((existing) => existing !== key) : [...prev, key]
    );
  };

  const handleModuleChange = (moduleKey: string, field: string, value: any) => {
    const moduleData = data[moduleKey] || {};
    onChange(moduleKey, { ...moduleData, [field]: value });
  };

  const validationProps = (fieldKey: string) => {
    const error = getFieldError(fieldErrors, fieldKey);
    return {
      id: fieldKey,
      'aria-invalid': isFieldInvalid(fieldErrors, fieldKey),
      'aria-describedby': error ? getFieldErrorId(fieldKey) : undefined,
      'data-validation-anchor': fieldKey,
    } as const;
  };

  const renderFieldError = (fieldKey: string) => (
    <FieldError id={getFieldErrorId(fieldKey)} message={getFieldError(fieldErrors, fieldKey)} />
  );

  const renderContactSelector = (
    label: string,
    value: any,
    onSelect: (val: any) => void,
    fieldKey?: string
  ) => (
    <div className="space-y-3" id={fieldKey} data-validation-anchor={fieldKey}>
      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          value={value?.contactType || ''}
          onChange={(e) => onSelect({ ...value, contactType: e.target.value })}
          disabled={isLocked}
          className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          aria-invalid={fieldKey ? isFieldInvalid(fieldErrors, fieldKey) : false}
          aria-describedby={
            fieldKey && getFieldError(fieldErrors, fieldKey)
              ? getFieldErrorId(fieldKey)
              : undefined
          }
        >
          <option value="">Select approver...</option>
          <option value="primary_contact">Primary Contact</option>
          <option value="secondary_contact">Secondary Contact</option>
          <option value="section_2_final_decision_maker">Final Decision Maker</option>
          <option value="section_2_urgent_approval_contact">Urgent Approver</option>
          <option value="custom">Custom Approver</option>
        </select>
      </div>
      {fieldKey && renderFieldError(fieldKey)}
      {value?.contactType === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
          <Input
            placeholder="Full Name"
            value={value?.fullName || ''}
            onChange={(e) => onSelect({ ...value, fullName: e.target.value })}
            disabled={isLocked}
            className="rounded-xl h-10"
          />
          <Input
            placeholder="Email"
            value={value?.email || ''}
            onChange={(e) => onSelect({ ...value, email: e.target.value })}
            disabled={isLocked}
            className="rounded-xl h-10"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Service Modules</h2>
        <p className="text-slate-500 leading-relaxed">
          Based on your service selections, please provide the following specific
          information to help us support you effectively.
        </p>
      </div>

      <div className="space-y-6">
        <div id="grants.interestedInGrantSupport" data-validation-anchor="grants.interestedInGrantSupport" className="sr-only" />
        <div id="grants.fundingUse" data-validation-anchor="grants.fundingUse" className="sr-only" />
        <div id="grants.projectNeed" data-validation-anchor="grants.projectNeed" className="sr-only" />
        <div id="grants.projectBeneficiaries" data-validation-anchor="grants.projectBeneficiaries" className="sr-only" />
        <div id="grants.projectLocation" data-validation-anchor="grants.projectLocation" className="sr-only" />
        <div id="grants.projectTiming" data-validation-anchor="grants.projectTiming" className="sr-only" />
        <div id="grants.estimatedTotalProjectCost" data-validation-anchor="grants.estimatedTotalProjectCost" className="sr-only" />
        <div id="grants.fundingAmountNeeded" data-validation-anchor="grants.fundingAmountNeeded" className="sr-only" />
        <div id="grants.clientContribution" data-validation-anchor="grants.clientContribution" className="sr-only" />
        <div id="grants.projectOutcomes" data-validation-anchor="grants.projectOutcomes" className="sr-only" />
        <div id="grants.afterFundingPlan" data-validation-anchor="grants.afterFundingPlan" className="sr-only" />
        <div id="marketplaceLeads.openMarketplacePlatforms" data-validation-anchor="marketplaceLeads.openMarketplacePlatforms" className="sr-only" />
        <div id="marketplaceLeads.suitableServices" data-validation-anchor="marketplaceLeads.suitableServices" className="sr-only" />
        <div id="marketplaceLeads.worthwhileLeadTypes" data-validation-anchor="marketplaceLeads.worthwhileLeadTypes" className="sr-only" />
        <div id="marketplaceLeads.minimumJobValue" data-validation-anchor="marketplaceLeads.minimumJobValue" className="sr-only" />
        <div id="marketplaceLeads.urgentWorkCapacity" data-validation-anchor="marketplaceLeads.urgentWorkCapacity" className="sr-only" />
        <div id="marketplaceLeads.jobsToIgnore" data-validation-anchor="marketplaceLeads.jobsToIgnore" className="sr-only" />
        <div id="marketplaceLeads.responseApprovalRequirement" data-validation-anchor="marketplaceLeads.responseApprovalRequirement" className="sr-only" />
        <div id="marketplaceLeads.canSubmitUnderThreshold" data-validation-anchor="marketplaceLeads.canSubmitUnderThreshold" className="sr-only" />
        <div id="directProposalOutreach.interestedInDirectBusinessDevelopment" data-validation-anchor="directProposalOutreach.interestedInDirectBusinessDevelopment" className="sr-only" />
        <div id="directProposalOutreach.directGrowthChannels" data-validation-anchor="directProposalOutreach.directGrowthChannels" className="sr-only" />
        <div id="directProposalOutreach.targetOrganisationsSectors" data-validation-anchor="directProposalOutreach.targetOrganisationsSectors" className="sr-only" />
        <div id="directProposalOutreach.interestedCampaigns" data-validation-anchor="directProposalOutreach.interestedCampaigns" className="sr-only" />
        <div id="quoteRequests.quoteRequestTypes" data-validation-anchor="quoteRequests.quoteRequestTypes" className="sr-only" />
        <div id="quoteRequests.informationNeededToQuote" data-validation-anchor="quoteRequests.informationNeededToQuote" className="sr-only" />
        <div id="quoteRequests.quotePrerequisites" data-validation-anchor="quoteRequests.quotePrerequisites" className="sr-only" />
        <div id="quoteRequests.standardQuoteAssumptions" data-validation-anchor="quoteRequests.standardQuoteAssumptions" className="sr-only" />
        <div id="quoteRequests.standardQuoteExclusions" data-validation-anchor="quoteRequests.standardQuoteExclusions" className="sr-only" />
        <div id="quoteRequests.quoteValidityPeriod" data-validation-anchor="quoteRequests.quoteValidityPeriod" className="sr-only" />
        <div id="quoteRequests.canPrepareDraftQuotes" data-validation-anchor="quoteRequests.canPrepareDraftQuotes" className="sr-only" />
        <div id="quoteRequests.canSendQuotesUnderThreshold" data-validation-anchor="quoteRequests.canSendQuotesUnderThreshold" className="sr-only" />

        {!hasActiveModules && (
          <Card className="border-2 border-dashed border-slate-200 bg-slate-50">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Clock className="w-4 h-4" />
                <span>Pending service selection</span>
              </div>
              <p className="text-sm text-slate-500">
                Service-specific modules will appear here once services are selected in
                Section 3.
              </p>
            </CardContent>
          </Card>
        )}

        {activeModules.tenderSupplierReadiness && (
          <ModuleCard
            title="12A. Tender and Supplier Registration Readiness"
            icon={FileText}
            isExpanded={expanded.includes('tenderSupplierReadiness')}
            onToggle={() => expandModule('tenderSupplierReadiness')}
          >
            <div className="space-y-8">
              <div className="space-y-4" {...validationProps('tenderSupplierReadiness.previousTenderSupplierExperience')}>
                <Label className="text-base font-bold">
                  12A.1 Previous experience with tenders or panels?
                </Label>
                <RadioGroup
                  value={data.tenderSupplierReadiness?.previousTenderSupplierExperience}
                  onValueChange={(value) =>
                    handleModuleChange(
                      'tenderSupplierReadiness',
                      'previousTenderSupplierExperience',
                      value
                    )
                  }
                  className="flex flex-wrap gap-4"
                  disabled={isLocked}
                >
                  {['yes', 'no', 'some', 'unsure'].map((value) => (
                    <div
                      key={value}
                      className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100"
                    >
                      <RadioGroupItem value={value} id={`t1-${value}`} />
                      <Label htmlFor={`t1-${value}`} className="capitalize text-sm font-semibold">
                        {value}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {renderFieldError('tenderSupplierReadiness.previousTenderSupplierExperience')}
              </div>

              {(data.tenderSupplierReadiness?.previousTenderSupplierExperience === 'yes' ||
                data.tenderSupplierReadiness?.previousTenderSupplierExperience === 'some') && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1" {...validationProps('tenderSupplierReadiness.previousPortalsUsed')}>
                  <Label className="text-sm font-bold">
                    12A.2 Which tender or supplier portals have you used before?
                  </Label>
                  <Textarea
                    value={data.tenderSupplierReadiness?.previousPortalsUsed || ''}
                    onChange={(e) =>
                      handleModuleChange(
                        'tenderSupplierReadiness',
                        'previousPortalsUsed',
                        e.target.value
                      )
                    }
                    disabled={isLocked}
                    className="rounded-xl min-h-[80px]"
                    {...validationProps('tenderSupplierReadiness.previousPortalsUsed')}
                  />
                  {renderFieldError('tenderSupplierReadiness.previousPortalsUsed')}
                </div>
              )}

              <div className="space-y-2" {...validationProps('tenderSupplierReadiness.targetBuyers')}>
                <Label className="text-sm font-bold">
                  12A.3 What types of buyers or organisations do you want to target?
                </Label>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                  e.g., Local councils, schools, mining companies, health providers.
                </p>
                <Textarea
                  value={data.tenderSupplierReadiness?.targetBuyers || ''}
                  onChange={(e) =>
                    handleModuleChange(
                      'tenderSupplierReadiness',
                      'targetBuyers',
                      e.target.value
                    )
                  }
                  disabled={isLocked}
                  className="rounded-xl min-h-[80px]"
                  {...validationProps('tenderSupplierReadiness.targetBuyers')}
                />
                {renderFieldError('tenderSupplierReadiness.targetBuyers')}
              </div>

              <div className="space-y-2" {...validationProps('tenderSupplierReadiness.realisticContractSizes')}>
                <Label className="text-sm font-bold">
                  12A.4 What contract sizes are realistic for your business?
                </Label>
                <p className="text-xs text-muted-foreground italic">
                  Consider staffing, equipment, insurance and cashflow.
                </p>
                <Textarea
                  value={data.tenderSupplierReadiness?.realisticContractSizes || ''}
                  onChange={(e) =>
                    handleModuleChange(
                      'tenderSupplierReadiness',
                      'realisticContractSizes',
                      e.target.value
                    )
                  }
                  disabled={isLocked}
                  className="rounded-xl min-h-[80px]"
                  {...validationProps('tenderSupplierReadiness.realisticContractSizes')}
                />
                {renderFieldError('tenderSupplierReadiness.realisticContractSizes')}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4" {...validationProps('tenderSupplierReadiness.preparedForComplianceRequirements')}>
                  <Label className="text-sm font-bold">12A.5 Prepared for compliance requirements?</Label>
                  <RadioGroup
                    value={data.tenderSupplierReadiness?.preparedForComplianceRequirements}
                    onValueChange={(value) =>
                      handleModuleChange(
                        'tenderSupplierReadiness',
                        'preparedForComplianceRequirements',
                        value
                      )
                    }
                    className="flex flex-wrap gap-3"
                    disabled={isLocked}
                  >
                    {['yes', 'no', 'partly', 'unsure'].map((value) => (
                      <div key={value} className="flex items-center gap-2">
                        <RadioGroupItem value={value} id={`t5-${value}`} />
                        <Label htmlFor={`t5-${value}`} className="capitalize text-xs font-medium">
                          {value}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {renderFieldError('tenderSupplierReadiness.preparedForComplianceRequirements')}
                </div>
                <div className="space-y-4" {...validationProps('tenderSupplierReadiness.previousMaterialsAvailable')}>
                  <Label className="text-sm font-bold">12A.6 Previous materials available for review?</Label>
                  <RadioGroup
                    value={data.tenderSupplierReadiness?.previousMaterialsAvailable}
                    onValueChange={(value) =>
                      handleModuleChange(
                        'tenderSupplierReadiness',
                        'previousMaterialsAvailable',
                        value
                      )
                    }
                    className="flex flex-wrap gap-3"
                    disabled={isLocked}
                  >
                    {['yes', 'no', 'some', 'unsure'].map((value) => (
                      <div key={value} className="flex items-center gap-2">
                        <RadioGroupItem value={value} id={`t6-${value}`} />
                        <Label htmlFor={`t6-${value}`} className="capitalize text-xs font-medium">
                          {value}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {renderFieldError('tenderSupplierReadiness.previousMaterialsAvailable')}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">
                  12A.7 Tender categories or requirements to avoid? (Optional)
                </Label>
                <Textarea
                  value={data.tenderSupplierReadiness?.tenderAvoidanceRules || ''}
                  onChange={(e) =>
                    handleModuleChange(
                      'tenderSupplierReadiness',
                      'tenderAvoidanceRules',
                      e.target.value
                    )
                  }
                  disabled={isLocked}
                  className="rounded-xl min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
                {renderContactSelector(
                  '12A.8 Submission Approver',
                  data.tenderSupplierReadiness?.submissionApprover,
                  (value) => handleModuleChange('tenderSupplierReadiness', 'submissionApprover', value),
                  'tenderSupplierReadiness.submissionApprover'
                )}
                {renderContactSelector(
                  '12A.9 Contract Terms Approver',
                  data.tenderSupplierReadiness?.contractTermsApprover,
                  (value) => handleModuleChange('tenderSupplierReadiness', 'contractTermsApprover', value),
                  'tenderSupplierReadiness.contractTermsApprover'
                )}
              </div>
            </div>
          </ModuleCard>
        )}

        {activeModules.grants && (
          <ModuleCard
            title="12B. Grants"
            icon={Lightbulb}
            isExpanded={expanded.includes('grants')}
            onToggle={() => expandModule('grants')}
          >
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-base font-bold">12B.1 Are you interested in grant funding support?</Label>
                <RadioGroup
                  value={data.grants?.interestedInGrantSupport}
                  onValueChange={(value) =>
                    handleModuleChange('grants', 'interestedInGrantSupport', value)
                  }
                  className="flex flex-wrap gap-6"
                  disabled={isLocked}
                >
                  {['yes', 'no', 'maybe_please_advise'].map((value) => (
                    <div
                      key={value}
                      className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100"
                    >
                      <RadioGroupItem value={value} id={`g1-${value}`} />
                      <Label htmlFor={`g1-${value}`} className="capitalize text-sm font-semibold">
                        {value.replace(/_/g, ' ')}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {data.grants?.interestedInGrantSupport !== 'no' && (
                <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">
                      12B.2 What would you use grant funding for?
                    </Label>
                    <p className="text-xs text-muted-foreground italic">
                      e.g., Equipment, technology, staff training, community project.
                    </p>
                    <Textarea
                      value={data.grants?.fundingUse || ''}
                      onChange={(e) => handleModuleChange('grants', 'fundingUse', e.target.value)}
                      disabled={isLocked}
                      className="rounded-xl min-h-[80px]"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">12B.3 Why is this project needed?</Label>
                      <Textarea
                        value={data.grants?.projectNeed || ''}
                        onChange={(e) => handleModuleChange('grants', 'projectNeed', e.target.value)}
                        disabled={isLocked}
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">12B.4 Who benefits from the project?</Label>
                      <Textarea
                        value={data.grants?.projectBeneficiaries || ''}
                        onChange={(e) =>
                          handleModuleChange('grants', 'projectBeneficiaries', e.target.value)
                        }
                        disabled={isLocked}
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">12B.5 Where will it happen?</Label>
                      <Input
                        value={data.grants?.projectLocation || ''}
                        onChange={(e) => handleModuleChange('grants', 'projectLocation', e.target.value)}
                        disabled={isLocked}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">12B.6 Start and finish timing?</Label>
                      <Input
                        value={data.grants?.projectTiming || ''}
                        onChange={(e) => handleModuleChange('grants', 'projectTiming', e.target.value)}
                        disabled={isLocked}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">12B.7 Estimated total cost</Label>
                      <Input
                        value={data.grants?.estimatedTotalProjectCost || ''}
                        onChange={(e) =>
                          handleModuleChange('grants', 'estimatedTotalProjectCost', e.target.value)
                        }
                        disabled={isLocked}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">12B.8 Funding amount needed</Label>
                      <Input
                        value={data.grants?.fundingAmountNeeded || ''}
                        onChange={(e) =>
                          handleModuleChange('grants', 'fundingAmountNeeded', e.target.value)
                        }
                        disabled={isLocked}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">
                      12B.9 Can you contribute resources (cash, labour, etc.)?
                    </Label>
                    <Textarea
                      value={data.grants?.clientContribution || ''}
                      onChange={(e) => handleModuleChange('grants', 'clientContribution', e.target.value)}
                      disabled={isLocked}
                      className="rounded-xl min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">
                      12B.10 Main outcomes (Jobs, productivity, community benefit)?
                    </Label>
                    <Textarea
                      value={data.grants?.projectOutcomes || ''}
                      onChange={(e) => handleModuleChange('grants', 'projectOutcomes', e.target.value)}
                      disabled={isLocked}
                      className="rounded-xl min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">
                      12B.14 What happens after grant funding ends?
                    </Label>
                    <Textarea
                      value={data.grants?.afterFundingPlan || ''}
                      onChange={(e) => handleModuleChange('grants', 'afterFundingPlan', e.target.value)}
                      disabled={isLocked}
                      className="rounded-xl min-h-[80px]"
                    />
                  </div>
                </div>
              )}
            </div>
          </ModuleCard>
        )}

        {activeModules.marketplaceLeads && (
          <ModuleCard
            title="12C. Marketplace Lead Strategy"
            icon={PocketKnife}
            isExpanded={expanded.includes('marketplaceLeads')}
            onToggle={() => expandModule('marketplaceLeads')}
          >
            <div className="space-y-8">
              <div className="space-y-4" {...validationProps('marketplaceLeads.openMarketplacePlatforms')}>
                <Label className="text-sm font-bold">
                  12C.1 Marketplace platforms you are open to using?
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  {['Airtasker', 'Bark', 'ServiceSeeking', 'Oneflare', 'hipages', 'Upwork', 'Freelancer', 'Fiverr'].map((platform) => (
                    <div key={platform} className="flex items-center gap-2">
                      <Checkbox
                        id={`m1-${platform}`}
                        checked={Boolean(
                          data.marketplaceLeads?.openMarketplacePlatforms?.includes(
                            platform.toLowerCase()
                          )
                        )}
                        onCheckedChange={(checked) => {
                          const current = Array.isArray(
                            data.marketplaceLeads?.openMarketplacePlatforms
                          )
                            ? data.marketplaceLeads.openMarketplacePlatforms
                            : [];
                          const next = checked
                            ? [...current, platform.toLowerCase()]
                            : current.filter((value: string) => value !== platform.toLowerCase());
                          handleModuleChange(
                            'marketplaceLeads',
                            'openMarketplacePlatforms',
                            next
                          );
                        }}
                        disabled={isLocked}
                      />
                      <Label htmlFor={`m1-${platform}`} className="text-xs font-medium cursor-pointer">
                        {platform}
                      </Label>
                    </div>
                  ))}
                </div>
                {renderFieldError('marketplaceLeads.openMarketplacePlatforms')}
              </div>

              <div className="space-y-2" {...validationProps('marketplaceLeads.suitableServices')}>
                <Label className="text-sm font-bold">12C.2 Which services are suitable for marketplaces?</Label>
                <p className="text-xs text-muted-foreground italic">Linked to your offer menu.</p>
                {hasOfferItems ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {offers.map((offer: any) => {
                      const selectedOfferIds = marketplaceSuitableServices.filter(
                        (value: string) => !value.startsWith('__')
                      );

                      return (
                        <div
                          key={offer.id}
                          className="flex items-center gap-2 p-3 bg-white border border-slate-100 rounded-xl shadow-sm"
                        >
                          <Checkbox
                            id={`mo-${offer.id}`}
                            checked={Boolean(selectedOfferIds.includes(offer.id))}
                            onCheckedChange={(checked) => {
                              const next = checked
                                ? [...selectedOfferIds, offer.id]
                                : selectedOfferIds.filter((value: string) => value !== offer.id);
                              handleModuleChange('marketplaceLeads', 'suitableServices', next);
                            }}
                            disabled={isLocked}
                          />
                          <Label htmlFor={`mo-${offer.id}`} className="text-xs font-bold text-slate-700 truncate">
                            {offer.name}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4 rounded-3xl border border-amber-200 bg-amber-50 p-5">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-amber-900">
                        No Offer Menu services are available yet.
                      </p>
                      <p className="text-xs leading-relaxed text-amber-800">
                        Finish Section 5 Offer Menu later if you need to, but choose one option
                        below so this section can still save cleanly today.
                      </p>
                    </div>
                    <RadioGroup
                      value={marketplaceFallbackSelection}
                      onValueChange={(value) =>
                        handleModuleChange(
                          'marketplaceLeads',
                          'suitableServices',
                          value ? [value] : []
                        )
                      }
                      className="space-y-3"
                      disabled={isLocked}
                    >
                      {MARKETPLACE_FALLBACK_OPTIONS.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-white px-4 py-3"
                        >
                          <RadioGroupItem value={option.value} id={`marketplace-fallback-${option.value}`} />
                          <Label
                            htmlFor={`marketplace-fallback-${option.value}`}
                            className="text-sm leading-relaxed text-slate-700"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}
                {renderFieldError('marketplaceLeads.suitableServices')}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">12C.3 Worthwhile lead types?</Label>
                  <Textarea
                    value={data.marketplaceLeads?.worthwhileLeadTypes || ''}
                    onChange={(e) =>
                      handleModuleChange('marketplaceLeads', 'worthwhileLeadTypes', e.target.value)
                    }
                    disabled={isLocked}
                    className="rounded-xl min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">12C.4 Minimum job value?</Label>
                  <Input
                    value={data.marketplaceLeads?.minimumJobValue || ''}
                    onChange={(e) =>
                      handleModuleChange('marketplaceLeads', 'minimumJobValue', e.target.value)
                    }
                    disabled={isLocked}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-bold">12C.5 Urgent work capacity?</Label>
                <div className="flex flex-wrap gap-4">
                  {['Same-day', 'Next-day', 'Within 2-3 days', 'Within 1 week'].map((value) => {
                    const normalizedValue = value.toLowerCase().replace(/ /g, '_');
                    const current = Array.isArray(data.marketplaceLeads?.urgentWorkCapacity)
                      ? data.marketplaceLeads.urgentWorkCapacity
                      : [];

                    return (
                      <div key={value} className="flex items-center gap-2">
                        <Checkbox
                          id={`u-${value}`}
                          checked={Boolean(current.includes(normalizedValue))}
                          onCheckedChange={(checked) => {
                            const next = checked
                              ? [...current, normalizedValue]
                              : current.filter((entry: string) => entry !== normalizedValue);
                            handleModuleChange('marketplaceLeads', 'urgentWorkCapacity', next);
                          }}
                          disabled={isLocked}
                        />
                        <Label htmlFor={`u-${value}`} className="text-xs font-medium">
                          {value}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">12C.6 Types of jobs to ignore?</Label>
                <Textarea
                  value={data.marketplaceLeads?.jobsToIgnore || ''}
                  onChange={(e) => handleModuleChange('marketplaceLeads', 'jobsToIgnore', e.target.value)}
                  disabled={isLocked}
                  className="rounded-xl min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
                <div className="space-y-4">
                  <Label className="text-sm font-bold">12C.8 Approve responses before sending?</Label>
                  <RadioGroup
                    value={data.marketplaceLeads?.responseApprovalRequirement}
                    onValueChange={(value) =>
                      handleModuleChange('marketplaceLeads', 'responseApprovalRequirement', value)
                    }
                    className="space-y-2"
                    disabled={isLocked}
                  >
                    {['yes', 'no', 'only_above_agreed_value', 'unsure'].map((value) => (
                      <div key={value} className="flex items-center gap-2">
                        <RadioGroupItem value={value} id={`ma-${value}`} />
                        <Label htmlFor={`ma-${value}`} className="text-xs capitalize">
                          {value.replace(/_/g, ' ')}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-4">
                  <Label className="text-sm font-bold">12C.9 Submit under threshold?</Label>
                  <RadioGroup
                    value={data.marketplaceLeads?.canSubmitUnderThreshold}
                    onValueChange={(value) =>
                      handleModuleChange('marketplaceLeads', 'canSubmitUnderThreshold', value)
                    }
                    className="space-y-2"
                    disabled={isLocked}
                  >
                    {['yes', 'no', 'maybe_to_be_discussed'].map((value) => (
                      <div key={value} className="flex items-center gap-2">
                        <RadioGroupItem value={value} id={`mt-${value}`} />
                        <Label htmlFor={`mt-${value}`} className="text-xs capitalize">
                          {value.replace(/_/g, ' ')}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>
          </ModuleCard>
        )}

        {activeModules.directProposalOutreach && (
          <ModuleCard
            title="12D. Direct Proposal and Outreach Strategy"
            icon={Anchor}
            isExpanded={expanded.includes('directProposalOutreach')}
            onToggle={() => expandModule('directProposalOutreach')}
          >
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-base font-bold">
                  12D.1 Interested in direct business development support?
                </Label>
                <RadioGroup
                  value={data.directProposalOutreach?.interestedInDirectBusinessDevelopment}
                  onValueChange={(value) =>
                    handleModuleChange(
                      'directProposalOutreach',
                      'interestedInDirectBusinessDevelopment',
                      value
                    )
                  }
                  className="flex flex-wrap gap-6"
                  disabled={isLocked}
                >
                  {['yes', 'no', 'maybe_please_advise'].map((value) => (
                    <div
                      key={value}
                      className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100"
                    >
                      <RadioGroupItem value={value} id={`d1-${value}`} />
                      <Label htmlFor={`d1-${value}`} className="capitalize text-sm font-semibold">
                        {value.replace(/_/g, ' ')}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {data.directProposalOutreach?.interestedInDirectBusinessDevelopment !== 'no' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-4">
                    <Label className="text-sm font-bold">12D.2 Growth channels you are open to?</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        'Direct proposals',
                        'Email outreach',
                        'LinkedIn outreach',
                        'Referral partner outreach',
                        'Capability statement campaign',
                      ].map((channel) => {
                        const normalizedValue = channel.toLowerCase().replace(/ /g, '_');
                        const current = Array.isArray(data.directProposalOutreach?.directGrowthChannels)
                          ? data.directProposalOutreach.directGrowthChannels
                          : [];

                        return (
                          <div key={channel} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                            <Checkbox
                              id={`dc-${channel}`}
                              checked={Boolean(current.includes(normalizedValue))}
                              onCheckedChange={(checked) => {
                                const next = checked
                                  ? [...current, normalizedValue]
                                  : current.filter((value: string) => value !== normalizedValue);
                                handleModuleChange('directProposalOutreach', 'directGrowthChannels', next);
                              }}
                              disabled={isLocked}
                            />
                            <Label htmlFor={`dc-${channel}`} className="text-xs font-semibold">
                              {channel}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">12D.3 Target organisations or sectors?</Label>
                    <Textarea
                      value={data.directProposalOutreach?.targetOrganisationsSectors || ''}
                      onChange={(e) =>
                        handleModuleChange(
                          'directProposalOutreach',
                          'targetOrganisationsSectors',
                          e.target.value
                        )
                      }
                      disabled={isLocked}
                      className="rounded-xl min-h-[80px]"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">12D.4 Existing relationships?</Label>
                      <Textarea
                        value={data.directProposalOutreach?.existingTargetRelationships || ''}
                        onChange={(e) =>
                          handleModuleChange(
                            'directProposalOutreach',
                            'existingTargetRelationships',
                            e.target.value
                          )
                        }
                        disabled={isLocked}
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">12D.5 Dormant contacts to re-engage?</Label>
                      <Textarea
                        value={data.directProposalOutreach?.previousClientsDormantContacts || ''}
                        onChange={(e) =>
                          handleModuleChange(
                            'directProposalOutreach',
                            'previousClientsDormantContacts',
                            e.target.value
                          )
                        }
                        disabled={isLocked}
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-sm font-bold">12D.8 Creative campaigns of interest?</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        'First Contract Starter Pack',
                        'Local Supplier Intro',
                        'Marketplace Review Builder',
                        'Dormant Client Reactivation',
                      ].map((campaign) => {
                        const normalizedValue = campaign.toLowerCase().replace(/ /g, '_');
                        const current = Array.isArray(data.directProposalOutreach?.interestedCampaigns)
                          ? data.directProposalOutreach.interestedCampaigns
                          : [];

                        return (
                          <div key={campaign} className="flex items-center gap-2">
                            <Checkbox
                              id={`camp-${campaign}`}
                              checked={Boolean(current.includes(normalizedValue))}
                              onCheckedChange={(checked) => {
                                const next = checked
                                  ? [...current, normalizedValue]
                                  : current.filter((value: string) => value !== normalizedValue);
                                handleModuleChange('directProposalOutreach', 'interestedCampaigns', next);
                              }}
                              disabled={isLocked}
                            />
                            <Label htmlFor={`camp-${campaign}`} className="text-xs">
                              {campaign}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ModuleCard>
        )}

        {activeModules.quoteRequests && (
          <ModuleCard
            title="12E. Quote Request Support"
            icon={MessageCircleQuestion}
            isExpanded={expanded.includes('quoteRequests')}
            onToggle={() => expandModule('quoteRequests')}
          >
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">12E.1 Types of quote requests received?</Label>
                  <Textarea
                    value={data.quoteRequests?.quoteRequestTypes || ''}
                    onChange={(e) => handleModuleChange('quoteRequests', 'quoteRequestTypes', e.target.value)}
                    disabled={isLocked}
                    className="rounded-xl min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">12E.2 Information needed to quote accurately?</Label>
                  <Textarea
                    value={data.quoteRequests?.informationNeededToQuote || ''}
                    onChange={(e) =>
                      handleModuleChange('quoteRequests', 'informationNeededToQuote', e.target.value)
                    }
                    disabled={isLocked}
                    className="rounded-xl min-h-[80px]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold">
                  12E.3 Do quotes usually require inspection, photos, measurements, client
                  documents or a call before pricing?
                </Label>
                <Textarea
                  value={data.quoteRequests?.quotePrerequisites || ''}
                  onChange={(e) => handleModuleChange('quoteRequests', 'quotePrerequisites', e.target.value)}
                  disabled={isLocked}
                  className="rounded-xl min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold">12E.4 Standard quote assumptions?</Label>
                <Textarea
                  value={data.quoteRequests?.standardQuoteAssumptions || ''}
                  onChange={(e) =>
                    handleModuleChange('quoteRequests', 'standardQuoteAssumptions', e.target.value)
                  }
                  disabled={isLocked}
                  className="rounded-xl min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold">12E.5 Standard quote exclusions?</Label>
                <Textarea
                  value={data.quoteRequests?.standardQuoteExclusions || ''}
                  onChange={(e) =>
                    handleModuleChange('quoteRequests', 'standardQuoteExclusions', e.target.value)
                  }
                  disabled={isLocked}
                  className="rounded-xl min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">12E.6 Quote validity period?</Label>
                  <Input
                    value={data.quoteRequests?.quoteValidityPeriod || ''}
                    onChange={(e) =>
                      handleModuleChange('quoteRequests', 'quoteValidityPeriod', e.target.value)
                    }
                    disabled={isLocked}
                    className="rounded-xl"
                    placeholder="e.g., 30 days"
                  />
                </div>
                {renderContactSelector(
                  '12E.7 Who approves quotes?',
                  data.quoteRequests?.quoteApprover,
                  (value) => handleModuleChange('quoteRequests', 'quoteApprover', value),
                  'quoteRequests.quoteApprover'
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-sm font-bold">12E.8 Prepare draft quotes?</Label>
                  <RadioGroup
                    value={data.quoteRequests?.canPrepareDraftQuotes}
                    onValueChange={(value) =>
                      handleModuleChange('quoteRequests', 'canPrepareDraftQuotes', value)
                    }
                    className="space-y-2"
                    disabled={isLocked}
                  >
                    {['yes', 'no', 'yes_but_all_quotes_must_be_reviewed'].map((value) => (
                      <div key={value} className="flex items-center gap-2">
                        <RadioGroupItem value={value} id={`qd-${value}`} />
                        <Label htmlFor={`qd-${value}`} className="text-xs capitalize">
                          {value.replace(/_/g, ' ')}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-4">
                  <Label className="text-sm font-bold">12E.9 Send quotes under threshold?</Label>
                  <RadioGroup
                    value={data.quoteRequests?.canSendQuotesUnderThreshold}
                    onValueChange={(value) =>
                      handleModuleChange('quoteRequests', 'canSendQuotesUnderThreshold', value)
                    }
                    className="space-y-2"
                    disabled={isLocked}
                  >
                    {['yes', 'no', 'maybe_to_be_discussed'].map((value) => (
                      <div key={value} className="flex items-center gap-2">
                        <RadioGroupItem value={value} id={`qt-${value}`} />
                        <Label htmlFor={`qt-${value}`} className="text-xs capitalize">
                          {value.replace(/_/g, ' ')}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>
          </ModuleCard>
        )}

        {Object.values(activeModules).every((value) => !value) && (
          <div className="py-20 text-center space-y-6">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">No Service Modules Required</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Based on your service selections, no additional service-specific modules
                are currently required.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-900">
        <p className="font-semibold">Uploads and form answers save separately here.</p>
        <p className="mt-1 leading-relaxed text-blue-800">
          Files uploaded below are saved immediately to your document library. Use Save Draft
          or Next Step to save the written answers in this section.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ClientDocumentUploader
          documentCategory="previous_tenders_grants_proposals_quotes_feedback"
          sourceSection="section_12_service_modules"
          linkedSections={["section_12_service_modules"]}
          linkedRequirementIds={["previous_tenders_grants_proposals_quotes_feedback"]}
          label="Upload tender readiness materials"
          disabled={isLocked}
        />
        <ClientDocumentUploader
          documentCategory="grant_project_documents_budgets_supplier_quotes_support_letters"
          sourceSection="section_12_service_modules"
          linkedSections={["section_12_service_modules"]}
          linkedRequirementIds={["grant_project_documents_budgets_supplier_quotes_support_letters"]}
          label="Upload grant project and support files"
          disabled={isLocked}
        />
        <ClientDocumentUploader
          documentCategory="pricing_schedules_rate_cards_package_lists_budget_templates"
          sourceSection="section_12_service_modules"
          linkedSections={["section_12_service_modules"]}
          linkedRequirementIds={["pricing_schedules_rate_cards_package_lists_budget_templates"]}
          label="Upload quote/pricing templates"
          disabled={isLocked}
        />
      </div>

      {Object.values(activeModules).some((value) => value) && (
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
              {activeModules.tenderSupplierReadiness && (
                <ModuleSummaryBadge label="Tenders & Panels" icon={FileText} />
              )}
              {activeModules.grants && (
                <ModuleSummaryBadge label="Grant Projects" icon={Lightbulb} />
              )}
              {activeModules.marketplaceLeads && (
                <ModuleSummaryBadge label="Marketplace Strategy" icon={PocketKnife} />
              )}
              {activeModules.directProposalOutreach && (
                <ModuleSummaryBadge label="Outreach & BD" icon={Anchor} />
              )}
              {activeModules.quoteRequests && (
                <ModuleSummaryBadge label="Quote Support" icon={MessageCircleQuestion} />
              )}
            </div>

            <div className="pt-8 border-t border-slate-800 text-center">
              <p className="text-sm text-slate-400 italic">
                “This information allows Bid Manager to assess suitability and prepare
                responses accurately for your selected services.”
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
            <Badge
              variant="secondary"
              className="mt-1 bg-slate-100 text-slate-500 border-none text-[10px] uppercase font-bold tracking-wider"
            >
              Triggered by selection
            </Badge>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-6 h-6 text-slate-400" />
        ) : (
          <ChevronDown className="w-6 h-6 text-slate-400" />
        )}
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
