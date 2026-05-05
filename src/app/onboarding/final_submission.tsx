
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { detectAuthorityConflicts } from '@/lib/conflict_detector';
import { Label } from '@/components/ui/label';

interface Acknowledgement {
  id: string;
  text: string;
  isGated?: boolean; 
}

const acknowledgements: Acknowledgement[] = [
  {
    id: 'accuracy',
    text: "I confirm that the information provided in this form is accurate to the best of my knowledge."
  },
  {
    id: 'authority',
    text: "I am authorised by my organisation to provide this information and to agree to the terms of service."
  },
  {
    id: 'serviceAgreement',
    text: "I understand this onboarding form is subject to the Service Agreement, which governs our engagement and the use of information provided.",
  },
  {
    id: 'changes',
    text: "I agree to notify Bid Manager in writing if any of the information provided in this form changes.",
  },
  {
    id: 'finalCheck',
    text: "I have reviewed the information in all sections and confirm it is ready for Bid Manager to use.",
    isGated: true,
  },
];

export function FinalSubmission({ data, onChange, isLocked, allData, onSubmit }: any) {
  const checkedState = data.acknowledgements || {};

  const authorityConflicts = detectAuthorityConflicts(allData);

  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (isLocked) return;
    onChange('acknowledgements', { ...checkedState, [id]: checked });
  };

  const allGatedChecked = acknowledgements
    .filter(ack => ack.isGated)
    .every(ack => checkedState[ack.id]);

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Final Submission & Acknowledgements</h2>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-green-800">
          <p className="font-bold">Congratulations on completing the onboarding process!</p>
          <p className="text-sm">Please review and acknowledge the statements below to finalise your submission. This ensures that we have a clear and shared understanding of our collaboration moving forward.</p>
        </div>
      </div>

      {authorityConflicts.length > 0 && (
        <Alert variant="destructive" className="border-2 border-orange-500/50 bg-orange-50 rounded-2xl">
          <AlertTriangle className="h-5 w-5 !text-orange-500" />
          <AlertTitle className="font-bold text-lg text-orange-800">Potential Authority Conflicts Detected</AlertTitle>
          <AlertDescription className="text-orange-700 space-y-2 mt-2">
            <p>We noticed some inconsistencies between your service selections, workflow rules, and authority matrix. Please review these items before submitting:</p>
            <ul className="list-disc pl-5 text-xs font-mono space-y-1">
              {authorityConflicts.map((conflict, index) => (
                <li key={index}>{conflict}</li>
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
                {ack.isGated && <span className="text-destructive-500 ml-1">*</span>}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="text-center space-y-4">
        <Button 
          size="lg" 
          className="rounded-full font-bold h-12 w-64 shadow-lg"
          disabled={!allGatedChecked || isLocked}
          onClick={onSubmit}
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Complete Onboarding
        </Button>
        <p className="text-xs text-slate-500">You will be able to edit your responses later by navigating to the relevant section.</p>
      </div>
    </div>
  );
}
