
"use client";

import React, { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  AlertTriangle, 
  FileWarning, 
  ListTodo, 
  Circle,
  HelpCircle,
  AlertCircle,
  Info,
  ShieldAlert,
  FileCheck
} from 'lucide-react';
import { getVisibleOnboardingSteps, OnboardingStep } from '@/lib/onboarding-steps';
import { cn } from '@/lib/utils';

interface FinalSubmissionProps {
  data: any;
  allData: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
  onEdit: (step: string) => void;
  onSubmit: () => void;
}

const declarationList = [
  { id: 'confirmInformationAccurate', label: '16.1 I confirm the information provided is accurate and complete to the best of my knowledge.', firestoreField: 'confirmInformationAccurate' },
  { id: 'confirmAuthorisedToSubmit', label: '16.2 I confirm I am authorised to submit this onboarding form on behalf of the business.', firestoreField: 'confirmAuthorisedToSubmit' },
  { id: 'acknowledgeInformationUse', label: '16.3 I acknowledge that Bid Manager may use this information to prepare proposal content, opportunity recommendations, marketplace profiles, tender responses, grant applications, quote responses, supplier registrations and business development materials, subject to agreed approvals and engagement terms.', firestoreField: 'acknowledgeInformationUse' },
  { id: 'acknowledgeReviewApprovalResponsibility', label: '16.4 I understand I am responsible for reviewing and approving final content, pricing and submissions where approval is required.', firestoreField: 'acknowledgeReviewApprovalResponsibility' },
  { id: 'acknowledgeTermsApply', label: '16.5 I acknowledge and agree that the Bid Manager Terms and Conditions apply to the requested services, subject to any separate written agreement, quote, proposal or service schedule.', firestoreField: 'acknowledgeTermsApply' },
];

const SectionStatusItem = ({ step, status, onEdit, isLocked }: { step: OnboardingStep, status: string, onEdit: (step: string) => void, isLocked: boolean }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'complete':
        return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Complete', badge: 'bg-green-100 text-green-700' };
      case 'needs_attention':
        return { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Needs attention', badge: 'bg-orange-100 text-orange-700' };
      case 'in_progress':
        return { icon: Circle, color: 'text-blue-600', bg: 'bg-blue-50', label: 'In progress', badge: 'bg-blue-100 text-blue-700' };
      case 'not_required':
        return { icon: HelpCircle, color: 'text-slate-400', bg: 'bg-slate-50', label: 'Not required', badge: 'bg-slate-100 text-slate-700' };
      default:
        return { icon: Circle, color: 'text-slate-300', bg: 'bg-white', label: 'Not started', badge: 'bg-slate-100 text-slate-500' };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={cn("flex items-center justify-between p-3 rounded-xl border transition-colors", config.bg)}>
      <div className="flex items-center gap-3">
        <config.icon className={cn("w-5 h-5", config.color)} />
        <div>
          <p className="text-sm font-bold text-slate-900">{step.title}</p>
          <Badge variant="secondary" className={cn("text-[10px] uppercase tracking-wider", config.badge)}>
            {config.label}
          </Badge>
        </div>
      </div>
      {!isLocked && (
        <Button variant="ghost" size="sm" onClick={() => onEdit(step.key)} className="text-xs text-slate-500 hover:text-primary">
          {status === 'complete' ? 'Review' : 'Complete'}
        </Button>
      )}
    </div>
  );
};

export function FinalSubmission({ data, allData, onChange, isLocked, onEdit, onSubmit }: FinalSubmissionProps) {
  const visibleSteps = getVisibleOnboardingSteps(allData.enabledModules);
  const sectionStatuses = allData.sectionStatuses || {};

  // Group 1 Logic: Section Completion Summary
  const submissionReadiness = useMemo(() => {
    const requiredSections = [
      "welcome_expectations",
      "business_snapshot",
      "service_selection",
      "business_profile",
      "offer_menu",
      "team_capacity",
      "proof_evidence",
      "goals_strategy",
      "pricing_commercial",
      "platform_setup",
      "compliance_insurance",
      "workflow_rules",
      "document_upload_library",
      "authority_matrix"
    ];

    const requiredCoreSectionsComplete = requiredSections.every(
      key => sectionStatuses[key]?.status === 'complete'
    );

    const hasServiceModules = visibleSteps.some(s => s.key === 'service_modules');
    const serviceModulesComplete = !hasServiceModules || sectionStatuses['service_modules']?.status === 'complete';

    const requiredDeclarationsComplete = declarationList.every(d => data[d.id] === true);

    const authoritySection = allData.sections?.authority_matrix || {};
    const authorityConflictsExist = authoritySection.derivedAuthorityReadiness?.authorityConflictsDetected === true;

    const blockingErrors = [];
    if (!requiredCoreSectionsComplete) blockingErrors.push("One or more required core sections are incomplete.");
    if (!serviceModulesComplete) blockingErrors.push("Service Modules section needs attention.");
    if (!requiredDeclarationsComplete) blockingErrors.push("Final declarations are required.");

    return {
      requiredCoreSectionsComplete,
      serviceModulesComplete,
      requiredDeclarationsComplete,
      authorityConflictsExist,
      blockingErrors,
      canSubmit: blockingErrors.length === 0 && (authorityConflictsExist ? data.authorityConflictsAcknowledged : true)
    };
  }, [allData, sectionStatuses, data, visibleSteps]);

  if (isLocked) {
    return (
      <div className="space-y-10 py-12 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl font-headline font-bold text-slate-900">Submission Successful</h2>
          <div className="p-6 bg-white border border-slate-200 rounded-[2rem] text-left space-y-4 shadow-sm">
            <p className="text-slate-600 text-sm leading-relaxed">
              Thank you for completing the Bid Manager Client Onboarding & Growth Opportunity Setup form. We will review your responses and supporting documents and use them to prepare your initial setup materials, which may include your client profile summary, proposal-ready business overview, service descriptions, opportunity preferences, compliance gap checklist, authority matrix, platform setup recommendations and recommended 30-day action plan.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              Please allow up to 10 business days after we receive your completed onboarding form and supporting documents for the initial setup materials to be prepared. If critical information is missing, we may contact you for clarification.
            </p>
          </div>
          <div className="flex justify-center gap-4 pt-6">
            <Button variant="outline" className="rounded-xl px-8" onClick={() => window.location.href = '/dashboard'}>Return to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <FileCheck className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-4xl font-headline font-bold text-slate-900">Final Declaration and Submission</h2>
        </div>
        <p className="text-slate-500 text-lg">
          Please review your responses before submitting. Your onboarding information will be used to prepare your Bid Manager setup materials and guide how we support your business.
        </p>
      </div>

      {/* Group 1: Review Before Submission */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white">Group 1</Badge>
          <h3 className="text-2xl font-bold text-slate-800">Review Before Submission</h3>
        </div>
        <p className="text-sm text-slate-500 italic">
          “Please review the section status below before submitting. Any section marked Needs attention must be completed before submission.”
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {visibleSteps.map((step) => (
            <SectionStatusItem 
              key={step.key} 
              step={step} 
              status={step.key === 'service_modules' ? (allData.enabledModules ? (Object.values(allData.enabledModules).some(v => v) ? (sectionStatuses[step.key]?.status || 'not_started') : 'not_required') : 'not_required') : (sectionStatuses[step.key]?.status || 'not_started')}
              onEdit={onEdit}
              isLocked={isLocked}
            />
          ))}
        </div>
      </section>

      {/* Group 2: Final Declarations */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white">Group 2</Badge>
          <h3 className="text-2xl font-bold text-slate-800">Final Declarations</h3>
        </div>

        <Card className="border-none shadow-sm rounded-3xl bg-white border border-slate-100">
          <CardContent className="p-8 space-y-6">
            {declarationList.map((dec) => (
              <div key={dec.id} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <Checkbox 
                  id={dec.id} 
                  checked={data[dec.id] === true} 
                  onCheckedChange={(checked) => onChange(dec.id, checked)}
                  disabled={isLocked}
                  className="mt-1 w-5 h-5 border-2"
                />
                <Label htmlFor={dec.id} className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                  {dec.label}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Group 3: Final Comments */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white">Group 3</Badge>
          <h3 className="text-2xl font-bold text-slate-800">Final Comments</h3>
        </div>
        
        <div className="space-y-3">
          <Label className="text-base font-bold">16.6 Is there anything else we should know before reviewing your onboarding information?</Label>
          <p className="text-xs text-slate-400">
            “Include any final notes, missing information, urgent priorities, documents to follow, authority concerns, pricing updates, compliance issues or anything else we should know before review.”
          </p>
          <Textarea 
            value={data.finalComments || ''} 
            onChange={(e) => onChange('finalComments', e.target.value)}
            placeholder="Enter any final notes..."
            disabled={isLocked}
            className="min-h-[150px] rounded-2xl border-slate-200"
          />
        </div>
      </section>

      {/* Group 4: Submit */}
      <section className="space-y-6 pt-6 border-t">
        {submissionReadiness.blockingErrors.length > 0 && (
          <Alert variant="destructive" className="rounded-2xl border-red-200 bg-red-50">
            <AlertCircle className="w-5 h-5" />
            <AlertTitle className="font-bold">Cannot Submit Yet</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 text-sm">
                {submissionReadiness.blockingErrors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {submissionReadiness.authorityConflictsExist && (
          <Card className="border-orange-200 bg-orange-50 rounded-2xl overflow-hidden">
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-bold text-orange-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Authority Conflicts Detected
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-4 space-y-4">
              <p className="text-xs text-orange-700">
                Authority conflicts have been identified between Section 15 and earlier sections. Bid Manager will review these before acting on your behalf.
              </p>
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="ackConflicts" 
                  checked={data.authorityConflictsAcknowledged === true}
                  onCheckedChange={(v) => onChange('authorityConflictsAcknowledged', v)}
                />
                <Label htmlFor="ackConflicts" className="text-xs font-bold text-orange-800 cursor-pointer">
                  I acknowledge these authority conflicts exist and require review.
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {submissionReadiness.canSubmit && (
          <Alert className="rounded-2xl border-blue-200 bg-blue-50">
            <Info className="w-5 h-5 text-blue-600" />
            <AlertDescription className="text-blue-700 text-sm italic">
              “Your onboarding can be submitted, but some items will require Bid Manager review before action is taken.”
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center pt-4">
          <Button 
            size="lg" 
            onClick={onSubmit} 
            disabled={!submissionReadiness.canSubmit || isLocked} 
            className="w-full md:w-auto font-bold text-lg px-16 py-8 rounded-[2rem] shadow-xl shadow-primary/20 transition-all active:scale-95"
          >
            Submit onboarding form
          </Button>
          {!submissionReadiness.canSubmit && !isLocked && (
            <p className="mt-4 text-xs text-slate-400">
              Some required sections need attention before you can submit.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
