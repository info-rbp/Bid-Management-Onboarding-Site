
"use client";

import React, { useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Flag, AlertTriangle, CheckCircle2, User, Info, AlertCircle, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Contact {
  fullName: string;
  role?: string;
  email?: string;
  phone?: string;
  responsibilities?: string[];
  [key: string]: any;
}

interface AuthorityMatrixProps {
  data: any;
  allData: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
}

const authorityPreferenceRows = [
  { key: 'searchForOpportunities', label: 'Search for opportunities' },
  { key: 'recommendOpportunities', label: 'Recommend opportunities' },
  { key: 'createOrUpdatePlatformProfiles', label: 'Create or update platform profiles' },
  { key: 'assistWithRegistrations', label: 'Assist with registrations' },
  { key: 'draftResponses', label: 'Draft responses' },
  { key: 'askClarificationQuestions', label: 'Ask clarification questions' },
  { key: 'communicateWithBuyersFundersLeads', label: 'Communicate with buyers/funders/leads' },
  { key: 'prepareMarketplaceResponses', label: 'Prepare marketplace responses' },
  { key: 'submitMarketplaceResponses', label: 'Submit marketplace responses' },
  { key: 'submitQuoteRequests', label: 'Submit quote requests' },
  { key: 'submitTendersOrGrants', label: 'Submit tenders or grants' },
  { key: 'followUp', label: 'Follow up' },
  { key: 'useSuppliedDocuments', label: 'Use supplied documents' },
  { key: 'maintainReusableBidLibrary', label: 'Maintain a reusable bid library' },
];

const authorityPreferenceColumns = [
  { value: 'authorised', label: 'Authorised' },
  { value: 'authorised_after_approval', label: 'Authorised after approval' },
  { value: 'not_authorised', label: 'Not authorised' },
  { value: 'unsure', label: 'Unsure' },
];

const approvalLevelRows = [
  { key: 'searchingOpportunities', label: 'Searching opportunities' },
  { key: 'shortlisting', label: 'Shortlisting' },
  { key: 'freePlatformRegistration', label: 'Free platform registration' },
  { key: 'paidPlatformRegistration', label: 'Paid platform registration' },
  { key: 'draftingProposalContent', label: 'Drafting proposal content' },
  { key: 'sendingMarketplaceResponses', label: 'Sending marketplace responses' },
  { key: 'submittingQuotesUnderThreshold', label: 'Submitting quotes under threshold' },
  { key: 'submittingTenderOrGrantApplications', label: 'Submitting tender or grant applications' },
  { key: 'acceptingTerms', label: 'Accepting terms' },
  { key: 'providingPricing', label: 'Providing pricing' },
  { key: 'contactingBuyersFunders', label: 'Contacting buyers/funders' },
  { key: 'updatingMarketplaceProfiles', label: 'Updating marketplace profiles' },
];

const approvalLevelColumns = [
  { value: 'no_approval_needed', label: 'No approval needed' },
  { value: 'draft_approval_required', label: 'Draft approval required' },
  { value: 'final_written_approval_required', label: 'Final written approval required' },
  { value: 'not_authorised', label: 'Not authorised' },
];

export function AuthorityMatrix({ data, allData, onChange, isLocked }: AuthorityMatrixProps) {
  const authorityPreferences = data.authorityPreferences || {};
  const approvalLevels = data.approvalLevels || {};
  const [prefBulkAction, setPrefBulkAction] = useState('');
  const [prefBulkValue, setPrefBulkValue] = useState('');
  const [levelBulkAction, setLevelBulkAction] = useState('');
  const [levelBulkValue, setLevelBulkValue] = useState('');

  const handlePreferenceChange = (rowKey: string, value: string) => {
    onChange('authorityPreferences', { ...authorityPreferences, [rowKey]: value });
  };

  const handleLevelChange = (rowKey: string, value: string) => {
    onChange('approvalLevels', { ...approvalLevels, [rowKey]: value });
  };

  const handleBulkApply = (
    type: 'preferences' | 'levels',
    action: string,
    value?: string
  ) => {
    if (!action) return;

    const apply = (currentData: any, rows: { key: string }[]) => {
        let newData = { ...currentData };
        if (action === 'apply_all' && value) {
            rows.forEach(row => { newData[row.key] = value; });
        } else if (action === 'apply_visible' && value) {
            rows.forEach(row => { newData[row.key] = value; });
        } else if (action === 'copy_first') {
            const firstRowKey = rows[0].key;
            const firstRowValue = newData[firstRowKey];
            if (firstRowValue) {
                rows.forEach(row => {
                    if (!newData[row.key]) {
                        newData[row.key] = firstRowValue;
                    }
                });
            }
        }
        return newData;
    };

    if (type === 'preferences') {
        onChange('authorityPreferences', apply(authorityPreferences, authorityPreferenceRows));
    } else {
        onChange('approvalLevels', apply(approvalLevels, approvalLevelRows));
    }
  };
  
  const section2Contacts: Contact[] = allData?.sections?.business_snapshot?.contacts || [];
  
  const section13FinalApprover = allData?.sections?.workflow_rules?.finalSubmissionApprover;
  
  const section9PricingApprover = allData?.sections?.pricing_commercial?.pricingApprover;

  const getContactOptions = (type: 'submission' | 'pricing') => {
    const options: { label: string; value: string; contact?: any }[] = [];

    const primary = section2Contacts.find(c => c.responsibilities?.includes('Primary contact'));
    if (primary) options.push({ label: `Primary Contact (${primary.fullName})`, value: 'primary_contact', contact: primary });

    const secondary = section2Contacts.find(c => c.responsibilities?.includes('Secondary contact'));
    if (secondary) options.push({ label: `Secondary Contact (${secondary.fullName})`, value: 'secondary_contact', contact: secondary });

    const decisionMaker = section2Contacts.find(c => c.responsibilities?.includes('Final decision-maker'));
    if (decisionMaker) options.push({ label: `Final Decision-Maker (${decisionMaker.fullName})`, value: 'section_2_final_decision_maker', contact: decisionMaker });

    const urgent = section2Contacts.find(c => c.responsibilities?.includes('Urgent approvals'));
    if (urgent) options.push({ label: `Urgent Approval Contact (${urgent.fullName})`, value: 'section_2_urgent_approval_contact', contact: urgent });

    if (type === 'submission') {
      if (section13FinalApprover && section13FinalApprover.contactType !== 'custom') {
        options.push({ label: `Workflow Final Approver`, value: 'section_13_final_submission_approver', contact: section13FinalApprover });
      }
    }

    if (type === 'pricing') {
      const pricing = section2Contacts.find(c => c.responsibilities?.includes('Pricing/commercial approval'));
      if (pricing) options.push({ label: `Pricing/Commercial Contact (${pricing.fullName})`, value: 'section_2_pricing_contact', contact: pricing });

      if (section9PricingApprover && section9PricingApprover.contactType !== 'custom') {
        options.push({ label: `Pricing Approver from Section 9`, value: 'section_9_pricing_approver', contact: section9PricingApprover });
      }
    }

    options.push({ label: 'Add another approver (Custom)', value: 'custom' });
    return options;
  };

  const submissionContactOptions = getContactOptions('submission');
  const pricingContactOptions = getContactOptions('pricing');

  const handleContactChange = (field: string, contactType: string) => {
    const options = field === 'finalSubmissionApprovalContact' ? submissionContactOptions : pricingContactOptions;
    const selectedOption = options.find(o => o.value === contactType);
    
    if (contactType === 'custom') {
      onChange(field, { contactType: 'custom', fullName: '', roleTitle: '', email: '', phone: '', notes: '' });
    } else if (selectedOption?.contact) {
      const c = selectedOption.contact;
      onChange(field, {
        contactType,
        fullName: c.fullName || '',
        roleTitle: c.role || c.roleTitle || '',
        email: c.email || '',
        phone: c.phone || '',
        notes: ''
      });
    }
  };

  const pricingSection = allData?.sections?.pricing_commercial || {};
  const marketplaceSection = allData?.sections?.service_modules?.marketplaceLeads || {};
  const quoteSection = allData?.sections?.service_modules?.quoteRequests || {};

  const showThreshold = useMemo(() => {
    return (
      pricingSection.canSubmitPricingUnderThreshold === 'yes' ||
      pricingSection.canSubmitPricingUnderThreshold === 'maybe_to_be_discussed' ||
      marketplaceSection.canSubmitUnderThreshold === 'yes' ||
      marketplaceSection.canSubmitUnderThreshold === 'maybe_to_be_discussed' ||
      quoteSection.canSendQuotesUnderThreshold === 'yes' ||
      quoteSection.canSendQuotesUnderThreshold === 'maybe_to_be_discussed' ||
      approvalLevels.submittingQuotesUnderThreshold === 'no_approval_needed' ||
      approvalLevels.submittingQuotesUnderThreshold === 'draft_approval_required' ||
      approvalLevels.submittingQuotesUnderThreshold === 'final_written_approval_required' ||
      authorityPreferences.submitQuoteRequests === 'authorised' ||
      authorityPreferences.submitQuoteRequests === 'authorised_after_approval' ||
      authorityPreferences.submitMarketplaceResponses === 'authorised' ||
      authorityPreferences.submitMarketplaceResponses === 'authorised_after_approval'
    );
  }, [pricingSection, marketplaceSection, quoteSection, approvalLevels, authorityPreferences]);

  const isComplete = data?.sectionStatus?.isComplete;

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-4xl font-headline font-bold text-slate-900">Authority to Act and Approval Matrix</h2>
            <p className="text-slate-500 text-lg">Confirm how Bid Manager may use your information and what actions we are authorised to take on your behalf.</p>
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 text-sm italic">
          “This section confirms how Bid Manager may use your information and what actions we are authorised to take on your behalf. This operational authority should align with your formal engagement agreement, quote, proposal, service schedule or written authority.”
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white">Group 1</Badge>
          <h3 className="text-2xl font-bold text-slate-800">Authority Preferences</h3>
        </div>
        <p className="text-sm text-slate-500">15.1 Complete the authority preferences matrix.</p>
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <div className="p-4 bg-slate-50/50 flex items-center gap-2">
            <Select value={prefBulkAction} onValueChange={setPrefBulkAction}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Bulk Actions..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="apply_all">Apply to all rows</SelectItem>
                <SelectItem value="apply_visible">Apply to all visible rows</SelectItem>
                <SelectItem value="copy_first">Copy first row to blank rows</SelectItem>
              </SelectContent>
            </Select>
            {prefBulkAction.startsWith('apply') && (
              <Select value={prefBulkValue} onValueChange={setPrefBulkValue}>
                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select a value..." /></SelectTrigger>
                <SelectContent>
                  {authorityPreferenceColumns.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <Button onClick={() => handleBulkApply('preferences', prefBulkAction, prefBulkValue)} disabled={!prefBulkAction || (prefBulkAction.startsWith('apply') && !prefBulkValue)}>Apply</Button>
          </div>
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[40%] font-bold text-slate-900">Action</TableHead>
                {authorityPreferenceColumns.map(col => (
                  <TableHead key={col.value} className="text-center font-bold text-slate-900 text-xs px-2">
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {authorityPreferenceRows.map(row => (
                <TableRow key={row.key} className="hover:bg-slate-50/30 transition-colors">
                  <TableCell className="font-medium text-slate-700">{row.label}</TableCell>
                  {authorityPreferenceColumns.map(col => (
                    <TableCell key={col.value} className="text-center p-2">
                      <RadioGroup
                        value={authorityPreferences[row.key] || ''}
                        onValueChange={(v) => handlePreferenceChange(row.key, v)}
                        disabled={isLocked}
                        className="flex justify-center"
                      >
                        <RadioGroupItem value={col.value} className="w-5 h-5 border-2" />
                      </RadioGroup>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white">Group 2</Badge>
          <h3 className="text-2xl font-bold text-slate-800">Approval Levels</h3>
        </div>
        <p className="text-sm text-slate-500">15.2 Complete the approval level matrix.</p>

        <Card className="border-none shadow-sm rounded-3xl bg-white">
        <div className="p-4 bg-slate-50/50 flex items-center gap-2">
            <Select value={levelBulkAction} onValueChange={setLevelBulkAction}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Bulk Actions..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="apply_all">Apply to all rows</SelectItem>
                <SelectItem value="apply_visible">Apply to all visible rows</SelectItem>
                <SelectItem value="copy_first">Copy first row to blank rows</SelectItem>
              </SelectContent>
            </Select>
            {levelBulkAction.startsWith('apply') && (
              <Select value={levelBulkValue} onValueChange={setLevelBulkValue}>
                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select a value..." /></SelectTrigger>
                <SelectContent>
                  {approvalLevelColumns.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <Button onClick={() => handleBulkApply('levels', levelBulkAction, levelBulkValue)} disabled={!levelBulkAction || (levelBulkAction.startsWith('apply') && !levelBulkValue)}>Apply</Button>
          </div>
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[40%] font-bold text-slate-900">Process Step</TableHead>
                {approvalLevelColumns.map(col => (
                  <TableHead key={col.value} className="text-center font-bold text-slate-900 text-[10px] uppercase tracking-wider px-1">
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvalLevelRows.map(row => (
                <TableRow key={row.key} className="hover:bg-slate-50/30 transition-colors">
                  <TableCell className="font-medium text-slate-700">{row.label}</TableCell>
                  {approvalLevelColumns.map(col => (
                    <TableCell key={col.value} className="text-center p-2">
                      <RadioGroup
                        value={approvalLevels[row.key] || ''}
                        onValueChange={(v) => handleLevelChange(row.key, v)}
                        disabled={isLocked}
                        className="flex justify-center"
                      >
                        <RadioGroupItem value={col.value} className="w-5 h-5 border-2" />
                      </RadioGroup>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white">Group 3</Badge>
          <h3 className="text-2xl font-bold text-slate-800">Restrictions and Prohibited Actions</h3>
        </div>

        <div className="grid gap-6">
          <div className="space-y-3">
            <Label className="text-base font-bold">15.3 Are there any actions Bid Manager must never take without your written approval?</Label>
            <p className="text-xs text-slate-400">“Examples: submit pricing, accept terms, agree to contracts, contact clients, register for paid platforms, disclose confidential information, send quotes, submit tenders, submit grants, use client logos, make guarantees or commit to delivery dates.”</p>
            <p className="text-xs font-medium text-slate-500 italic">If none, write ‘None known’.</p>
            <Textarea 
              value={data.actionsNeverWithoutWrittenApproval || ''} 
              onChange={(e) => onChange('actionsNeverWithoutWrittenApproval', e.target.value)}
              placeholder="e.g. None known"
              disabled={isLocked}
              className="min-h-[120px] rounded-2xl border-slate-200"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-bold">15.4 Are there any specific words, claims, guarantees or commitments we should not make on your behalf?</Label>
            <p className="text-xs text-slate-400">“Examples: guarantees, unsupported claims, certifications not verified, 24/7 availability, industry-leading claims, fixed delivery promises, client names, logos or commitments that require prior approval.”</p>
            <Textarea 
              value={data.restrictedWordsClaimsGuaranteesCommitments || ''} 
              onChange={(e) => onChange('restrictedWordsClaimsGuaranteesCommitments', e.target.value)}
              placeholder="Enter any messaging restrictions..."
              disabled={isLocked}
              className="min-h-[120px] rounded-2xl border-slate-200"
            />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white">Group 4</Badge>
          <h3 className="text-2xl font-bold text-slate-800">Final Approval Contacts</h3>
        </div>

        <div className="grid gap-8">
          <Card className="border-none shadow-sm rounded-3xl bg-white border border-slate-100">
            <CardHeader>
              <CardTitle className="text-lg">15.5 Who provides final approval for tenders, grants, supplier registrations, marketplace responses, quotes and proposals?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Contact</Label>
                <Select 
                  value={data.finalSubmissionApprovalContact?.contactType || ''} 
                  onValueChange={(v) => handleContactChange('finalSubmissionApprovalContact', v)}
                  disabled={isLocked}
                >
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue placeholder="Choose a contact..." />
                  </SelectTrigger>
                  <SelectContent>
                    {submissionContactOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {data.finalSubmissionApprovalContact?.contactType === 'custom' && (
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      value={data.finalSubmissionApprovalContact?.fullName || ''} 
                      onChange={(e) => onChange('finalSubmissionApprovalContact', { ...data.finalSubmissionApprovalContact, fullName: e.target.value })}
                      disabled={isLocked}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role Title</Label>
                    <Input 
                      value={data.finalSubmissionApprovalContact?.roleTitle || ''} 
                      onChange={(e) => onChange('finalSubmissionApprovalContact', { ...data.finalSubmissionApprovalContact, roleTitle: e.target.value })}
                      disabled={isLocked}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={data.finalSubmissionApprovalContact?.email || ''} 
                      onChange={(e) => onChange('finalSubmissionApprovalContact', { ...data.finalSubmissionApprovalContact, email: e.target.value })}
                      disabled={isLocked}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input 
                      value={data.finalSubmissionApprovalContact?.phone || ''} 
                      onChange={(e) => onChange('finalSubmissionApprovalContact', { ...data.finalSubmissionApprovalContact, phone: e.target.value })}
                      disabled={isLocked}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl bg-white border border-slate-100">
            <CardHeader>
              <CardTitle className="text-lg">15.6 Who provides final approval for pricing and commercial terms?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Contact</Label>
                <Select 
                  value={data.finalPricingCommercialApprovalContact?.contactType || ''} 
                  onValueChange={(v) => handleContactChange('finalPricingCommercialApprovalContact', v)}
                  disabled={isLocked}
                >
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue placeholder="Choose a contact..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pricingContactOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {data.finalPricingCommercialApprovalContact?.contactType === 'custom' && (
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      value={data.finalPricingCommercialApprovalContact?.fullName || ''} 
                      onChange={(e) => onChange('finalPricingCommercialApprovalContact', { ...data.finalPricingCommercialApprovalContact, fullName: e.target.value })}
                      disabled={isLocked}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role Title</Label>
                    <Input 
                      value={data.finalPricingCommercialApprovalContact?.roleTitle || ''} 
                      onChange={(e) => onChange('finalPricingCommercialApprovalContact', { ...data.finalPricingCommercialApprovalContact, roleTitle: e.target.value })}
                      disabled={isLocked}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={data.finalPricingCommercialApprovalContact?.email || ''} 
                      onChange={(e) => onChange('finalPricingCommercialApprovalContact', { ...data.finalPricingCommercialApprovalContact, email: e.target.value })}
                      disabled={isLocked}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input 
                      value={data.finalPricingCommercialApprovalContact?.phone || ''} 
                      onChange={(e) => onChange('finalPricingCommercialApprovalContact', { ...data.finalPricingCommercialApprovalContact, phone: e.target.value })}
                      disabled={isLocked}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {showThreshold && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white">Group 5</Badge>
            <h3 className="text-2xl font-bold text-slate-800">Threshold Authority</h3>
          </div>

          <Card className="border-none shadow-sm rounded-3xl bg-white">
            <CardHeader>
              <CardTitle className="text-lg">15.7 What is the maximum value, if any, Bid Manager may submit without final written approval?</CardTitle>
              <CardDescription>Example: $500, $1,000, only pre-approved package prices, none, or not authorised.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input 
                value={data.maximumValueWithoutFinalWrittenApproval || ''} 
                onChange={(e) => onChange('maximumValueWithoutFinalWrittenApproval', e.target.value)}
                placeholder="Enter value or 'None'"
                disabled={isLocked}
                className="max-w-md rounded-xl border-slate-200"
              />
              <p className="mt-4 text-xs text-slate-400 italic">
                Note: If this field is empty, says “None”, or if approval levels for submitting quotes is not authorised, threshold authority is treated as not authorised.
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {(isComplete || isLocked) && data.derivedAuthorityReadiness && (
        <Card className="border-2 border-primary/20 bg-primary/5 rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-primary/10 border-b border-primary/10">
            <CardTitle className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="w-5 h-5" />
              <span>Authority Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  Operational Permissions
                </h4>
                <ul className="space-y-2">
                  <li className="flex justify-between text-sm">
                    <span className="text-slate-500">Authorised Actions:</span>
                    <span className="font-bold text-green-600">
                      {Object.values(authorityPreferences).filter(v => v === 'authorised').length}
                    </span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="text-slate-500">Require Approval:</span>
                    <span className="font-bold text-blue-600">
                      {Object.values(authorityPreferences).filter(v => v === 'authorised_after_approval').length + 
                       Object.values(approvalLevels).filter(v => v === 'draft_approval_required' || v === 'final_written_approval_required').length}
                    </span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="text-slate-500">Not Authorised:</span>
                    <span className="font-bold text-red-600">
                      {Object.values(authorityPreferences).filter(v => v === 'not_authorised').length +
                       Object.values(approvalLevels).filter(v => v === 'not_authorised').length}
                    </span>
                  </li>
                  {Object.values(authorityPreferences).includes('unsure') && (
                    <li className="flex justify-between text-sm">
                      <span className="text-slate-500">Unsure Items:</span>
                      <span className="font-bold text-orange-600">
                        {Object.values(authorityPreferences).filter(v => v === 'unsure').length}
                      </span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  Key Approvers
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Final Submission</p>
                    <p className="text-sm font-bold">{data.finalSubmissionApprovalContact?.fullName || 'Not specified'}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Pricing & Commercial</p>
                    <p className="text-sm font-bold">{data.finalPricingCommercialApprovalContact?.fullName || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white rounded-2xl border border-primary/10">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm text-slate-600 leading-relaxed">
                  “Based on your authority settings, Bid Manager can only act within the permissions confirmed here. Any action marked as requiring approval or not authorised must be escalated before action is taken.”
                </p>
              </div>
            </div>

            {data.derivedAuthorityReadiness.conflictWarnings?.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-bold text-orange-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Potential Conflicts Detected
                </h4>
                {data.derivedAuthorityReadiness.conflictWarnings.map((warning: string, i: number) => (
                  <div key={i} className="text-xs text-orange-800 bg-orange-50 p-2 rounded-lg border border-orange-100">
                    {warning}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
