
"use client";

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { type AuthorityConflict, detectAuthorityConflicts } from '@/lib/conflict_detector';
import { Label } from '@/components/ui/label';

interface Acknowledgement {
  id: string;
  text: string;
}

const acknowledgements: Acknowledgement[] = [
  {
    id: 'confirmInformationAccurate',
    text: "I confirm that the information provided in this form is accurate to the best of my knowledge."
  },
  {
    id: 'confirmAuthorisedToSubmit',
    text: "I confirm I am authorised by my organisation to submit this onboarding pack."
  },
  {
    id: 'acknowledgeInformationUse',
    text: "I acknowledge Bid Manager will rely on this information to deliver the selected services.",
  },
  {
    id: 'acknowledgeReviewApprovalResponsibility',
    text: "I acknowledge responsibility for internal review and approvals required by my organisation.",
  },
  {
    id: 'acknowledgeTermsApply',
    text: "I acknowledge applicable terms and service agreements apply to this onboarding submission.",
  },
];

export function FinalSubmission({ data, onChange, isLocked, allData, onSubmit, onEdit }: any) {
  const checkedState = data.acknowledgements || {};
  const statuses = allData?.sectionStatuses || {};
  const visibleStepKeys: string[] = allData?.visibleStepKeys || [];

  const authorityConflicts = detectAuthorityConflicts(allData);

  const normalisedConflicts = authorityConflicts.map((conflict: string | AuthorityConflict) =>
    typeof conflict === 'string'
      ? ({
          id: conflict,
          severity: 'warning' as const,
          title: 'Potential conflict',
          message: conflict,
          sourceSections: [],
          recommendedAction: 'Review related sections and authority settings.'
        })
      : conflict
  );

  const statusLabelMap: Record<string, string> = {
    complete: 'Complete',
    needs_attention: 'Needs attention',
    in_progress: 'In progress',
    not_started: 'Not started',
    skipped: 'Skipped',
  };

  const sectionSummary = useMemo(() => {
    return visibleStepKeys.map((stepKey: string) => {
      const step = (allData?.allSteps || []).find((s: any) => s.key === stepKey);
      const statusInfo = statuses?.[stepKey] || {};
      return {
        key: stepKey,
        title: step?.title || stepKey,
        required: Boolean(step?.required),
        status: statusInfo.status || 'not_started',
        missingFields: statusInfo.missingFields || [],
      };
    });
  }, [allData, statuses, visibleStepKeys]);

  const incompleteRequiredSections = sectionSummary.filter((section: any) => section.required && section.key !== 'final_submission' && section.status !== 'complete');

  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (isLocked) return;
    onChange('acknowledgements', { ...checkedState, [id]: checked });
  };

  const allDeclarationsChecked = acknowledgements.every((ack) => checkedState[ack.id]);
  const canSubmit = incompleteRequiredSections.length === 0 && allDeclarationsChecked && !isLocked;

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Final Submission & Acknowledgements</h2>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-green-800">
          <p className="font-bold">Congratulations on completing the onboarding process!</p>
          <p className="text-sm">Please review and acknowledge the statements below to finalise your submission. This ensures that we have a clear and shared understanding of our collaboration moving forward.</p>
        </div>
      </div>

      {normalisedConflicts.length > 0 && (
        <Alert variant="destructive" className="border-2 border-orange-500/50 bg-orange-50 rounded-2xl">
          <AlertTriangle className="h-5 w-5 !text-orange-500" />
          <AlertTitle className="font-bold text-lg text-orange-800">Potential Authority Conflicts Detected</AlertTitle>
          <AlertDescription className="text-orange-700 space-y-2 mt-2">
            <p>We noticed some inconsistencies between your service selections, workflow rules, and authority matrix. Please review these items before submitting:</p>
            <ul className="list-disc pl-5 text-xs font-mono space-y-1">
              {normalisedConflicts.map((conflict) => (
                <li key={conflict.id}>
                  <p className="font-semibold">{conflict.title} ({conflict.severity})</p>
                  <p>{conflict.message}</p>
                  {conflict.sourceSections.length > 0 && <p>Source: {conflict.sourceSections.join(' ↔ ')}</p>}
                  <p>Recommended action: {conflict.recommendedAction}</p>
                </li>
              ))}
            </ul>
            <p className="text-xs pt-2">You can still submit, but resolving these conflicts will ensure a smoother workflow.</p>
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-slate-200 rounded-3xl">
        <CardHeader>
          <CardTitle>Acknowledgements</CardTitle>
          <CardDescription>Please check each box to confirm your understanding and agreement.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {acknowledgements.map((ack) => (
            <div 
              key={ack.id} 
              className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${checkedState[ack.id] ? 'bg-green-50 border-green-200' : 'bg-slate-50'}`}>
              <Checkbox
                id={ack.id}
                checked={checkedState[ack.id] || false}
                onCheckedChange={(checked) => handleCheckboxChange(ack.id, checked as boolean)}
                disabled={isLocked}
                className="mt-1"
              />
              <Label htmlFor={ack.id} className="text-sm font-medium leading-relaxed -mt-1 w-full">
                {ack.text}
                <span className="text-destructive-500 ml-1">*</span>
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-slate-200 rounded-3xl">
        <CardHeader>
          <CardTitle>Final comments</CardTitle>
          <CardDescription>Optional notes for Bid Manager before final submission.</CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="finalComments" className="text-sm font-medium">Final comments or notes for Bid Manager</Label>
          <textarea
            id="finalComments"
            value={data.finalComments || ''}
            onChange={(e) => onChange('finalComments', e.target.value)}
            disabled={isLocked}
            className="mt-2 min-h-28 w-full rounded-lg border border-slate-300 p-3 text-sm"
          />
        </CardContent>
      </Card>

      {incompleteRequiredSections.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 rounded-3xl">
          <CardHeader>
            <CardTitle className="text-orange-800">Incomplete Sections</CardTitle>
            <CardDescription className="text-orange-700">The following required sections must be completed before you can submit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {incompleteRequiredSections.map((section) => (
              <div key={section.key} className="p-4 border border-orange-200 bg-white rounded-xl">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800">{section.title}</h4>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(section.key)} className="gap-2 text-primary hover:text-primary">
                    Go to Section <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
                {section.missingFields && section.missingFields.length > 0 && (
                   <ul className="mt-2 list-disc list-inside text-xs text-slate-500 space-y-1">
                    {section.missingFields.slice(0, 3).map((mf: any, i: number) => (
                      <li key={i}>{typeof mf === 'string' ? mf : mf.message}</li>
                    ))}
                    {section.missingFields.length > 3 && <li>...and {section.missingFields.length - 3} more.</li>}
                  </ul>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {!allDeclarationsChecked && (
        <Alert className="border-blue-200 bg-blue-50 text-blue-800 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-blue-500" />
            <AlertTitle>Confirm Acknowledgements</AlertTitle>
            <AlertDescription>Please check all the boxes in the Acknowledgements section above.</AlertDescription>
        </Alert>
      )}

      <div className="text-center space-y-4 pt-6 border-t border-slate-200">
        <Button 
          size="lg" 
          className="rounded-full font-bold h-12 w-64 shadow-lg bg-primary hover:bg-primary/90 disabled:bg-slate-300"
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Complete Onboarding
        </Button>
        <p className="text-xs text-slate-500">After submission, this onboarding will be read-only unless an administrator reopens it.</p>
      </div>
    </div>
  );
}
