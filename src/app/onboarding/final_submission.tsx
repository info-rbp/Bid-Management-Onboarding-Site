
"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  AlertTriangle, 
  FileWarning, 
  ListTodo, 
  Users, 
  Briefcase, 
  FileText, 
  Lightbulb, 
  PocketKnife, 
  Anchor, 
  MessageCircleQuestion, 
  Paperclip, 
  Flag, 
  Building2, 
  Search, 
  Sparkles, 
  BookUser, 
  GanttChartSquare, 
  Goal, 
  Scale, 
  Globe, 
  ShieldCheck, 
  Workflow 
} from 'lucide-react';
import { getVisibleOnboardingSteps, OnboardingStep } from '@/lib/onboarding-steps';

interface FinalSubmissionProps {
  data: any;
  allData: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
  onEdit: (step: string) => void;
  onSubmit: () => void;
}

const declarations = [
  { id: 'accurateAndComplete', label: 'I confirm the information provided is accurate and complete to the best of my knowledge.' },
  { id: 'authorisedToSubmit', label: 'I confirm I am authorised to submit this onboarding pack on behalf of the business.' },
  { id: 'termsAccepted', label: 'I acknowledge and accept the Bid Manager Terms and Conditions.' },
  { id: 'informationUseAcknowledged', label: 'I understand Bid Manager may use the information provided to prepare proposal content, opportunity recommendations, marketplace profiles, tender responses, grant applications, quote responses, supplier registrations, and business development materials.' },
  { id: 'approvalResponsibilityAcknowledged', label: 'I understand final content, pricing, submissions, communications, and commitments may require approval depending on the authority settings I have provided.' },
  { id: 'noPasswordsAcknowledged', label: 'I understand I must not provide platform passwords, login credentials, or MFA codes through this onboarding portal.' },
  { id: 'submissionLockAcknowledged', label: 'I understand submitted onboarding information will be locked unless Bid Manager reopens it for edits.' },
];

const SectionReviewCard = ({ step, status, onEdit, missingFields, isLocked }: { step: OnboardingStep, status: string, onEdit: (step:string) => void, missingFields: string[], isLocked: boolean }) => (
  <Card className="bg-white shadow-sm rounded-2xl">
    <CardHeader className="flex flex-row items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${status === 'complete' ? 'bg-green-100' : status === 'needs_attention' ? 'bg-orange-100' : 'bg-slate-100'}`}>
            <step.icon className={`w-5 h-5 ${status === 'complete' ? 'text-green-600' : status === 'needs_attention' ? 'text-orange-600' : 'text-slate-500'}`} />
        </div>
        <CardTitle className="text-base font-bold">{step.title}</CardTitle>
      </div>
      {!isLocked && <Button variant="outline" size="sm" onClick={() => onEdit(step.key)}>Edit</Button>}
    </CardHeader>
    {status === 'needs_attention' && missingFields.length > 0 && (
        <CardContent className="pt-0">
            <Alert variant="destructive" className="bg-orange-50/50 border-orange-200/80">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="font-semibold text-xs">Missing Fields</AlertTitle>
                <AlertDescription className="text-xs">
                    {missingFields.join(', ')}
                </AlertDescription>
            </Alert>
        </CardContent>
    )}
  </Card>
);

export function FinalSubmission({ data, allData, onChange, isLocked, onEdit, onSubmit }: FinalSubmissionProps) {
  const visibleSteps = getVisibleOnboardingSteps(allData.enabledModules);
  const submissionSteps = visibleSteps.filter(s => s.key !== 'final_submission' && s.key !== 'welcome_expectations');

  const sectionStatuses = allData.sectionStatuses || {};
  const completedRequiredSteps = submissionSteps.filter(s => s.required && sectionStatuses[s.key]?.status === 'complete').length;
  const totalRequiredSteps = submissionSteps.filter(s => s.required).length;
  const incompleteRequiredSections = submissionSteps.filter(s => s.required && sectionStatuses[s.key]?.status !== 'complete');
  const allDeclarationsChecked = declarations.every(d => data.declarations?.[d.id]);
  const canSubmit = completedRequiredSteps === totalRequiredSteps && allDeclarationsChecked && !isLocked;

  if (isLocked) {
    return (
      <div className="space-y-8 py-12 text-center">
          <div className="inline-block bg-green-100 p-4 rounded-full">
              <CheckCircle2 className="w-16 h-16 text-green-600"/>
          </div>
          <div className="space-y-4">
              <h2 className="text-4xl font-headline font-bold text-slate-900">Onboarding Submitted</h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">Thank you for submitting your Bid Manager onboarding pack. We will review your responses and supporting documents shortly.</p>
              <div className="flex justify-center gap-4 pt-4">
                  <Button variant="outline">Return to Dashboard</Button>
                  <Button>View Submitted Onboarding</Button>
              </div>
          </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-4xl font-headline font-bold text-slate-900">Final Review & Submission</h2>
        <p className="text-slate-500 text-lg">Please review all your responses, complete any missing sections, and provide your final declarations before submitting.</p>
      </div>

      <Card className="border-orange-200 bg-orange-50/30 shadow-sm rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-orange-700"><AlertTriangle/> Before You Submit</CardTitle>
          <CardDescription className="text-orange-600">All required sections must be marked as 'complete' before you can submit your onboarding pack.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p className="text-sm text-slate-700">Status: <strong>{completedRequiredSteps} of {totalRequiredSteps}</strong> required sections complete.</p>
            {incompleteRequiredSections.length > 0 &&
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Incomplete Required Sections</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc list-inside mt-2">
                            {incompleteRequiredSections.map(s => <li key={s.key}><button className="text-left underline" onClick={() => onEdit(s.key)}>{s.title}</button></li>)}
                        </ul>
                    </AlertDescription>
                </Alert>
            }
        </CardContent>
      </Card>

      <div>
        <h3 className="text-2xl font-bold mb-4">Review Your Responses</h3>
        <div className="space-y-4">
            {submissionSteps.map(step => (
                <SectionReviewCard 
                    key={step.key} 
                    step={step} 
                    status={sectionStatuses[step.key]?.status || 'not_started'} 
                    missingFields={sectionStatuses[step.key]?.missingFields || []}
                    onEdit={onEdit}
                    isLocked={isLocked}
                />
            ))}
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardHeader><CardTitle>Final Declaration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
              {declarations.map(dec => (
                  <div key={dec.id} className="flex items-start gap-3">
                      <Checkbox id={dec.id} checked={data.declarations?.[dec.id] || false} onCheckedChange={(checked) => onChange('declarations', {...data.declarations, [dec.id]: checked})} disabled={isLocked} />
                      <Label htmlFor={dec.id} className="text-sm font-normal text-slate-600">{dec.label}</Label>
                  </div>
              ))}
              <div className="pt-4 border-t">
                  <Label className="font-bold">Is there anything else we should know?</Label>
                  <Textarea value={data.finalNotes || ''} onChange={(e) => onChange('finalNotes', e.target.value)} disabled={isLocked} placeholder="Optional final notes for our team..."/>
              </div>
          </CardContent>
      </Card>

      <div className="text-center">
          <Button size="lg" onClick={onSubmit} disabled={!canSubmit} className="w-full md:w-auto font-bold text-base px-12 py-6 rounded-full shadow-lg shadow-primary/30">
              Submit Onboarding Pack
          </Button>
          {!canSubmit && <p className="text-xs text-muted-foreground mt-2">Please complete all required sections and check all declarations.</p>}
      </div>
    </div>
  );
}
