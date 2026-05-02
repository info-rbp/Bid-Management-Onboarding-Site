
"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Search } from 'lucide-react';


interface OpportunityTriageProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
}

const redFlagKeywords = ['insolvent', 'bankrupt', 'dispute', 'urgent (unrealistic)', 'lowest price', 'must be cheap', 'no budget', 'exposure', 'quick question'];

export function OpportunityTriage({ data, onChange, isLocked }: OpportunityTriageProps) {

    const handleKeywordChange = (keyword: string) => {
        const current = data.redFlagKeywordsList || [];
        const updated = current.includes(keyword) 
            ? current.filter((k: string) => k !== keyword)
            : [...current, keyword];
        onChange('redFlagKeywordsList', updated);
    };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-4xl font-headline font-bold text-slate-900">Opportunity Triage</h2>
        <p className="text-slate-500 text-lg">Define the rules for how Bid Manager should identify and evaluate new opportunities for you.</p>
      </div>

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle className="flex items-center gap-2 text-primary"><Search className="w-5 h-5" /> Triage Rules</CardTitle></CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
                <Label>What are the key criteria for a 'good' opportunity?</Label>
                <Textarea value={data.goodCriteria || ''} onChange={(e) => onChange('goodCriteria', e.target.value)} disabled={isLocked} placeholder="e.g., aligns with core services, long-term potential, specific technologies..." />
            </div>
            <div className="space-y-2 col-span-2">
                <Label>What are the immediate red flags or deal-breakers?</Label>
                <Textarea value={data.redFlags || ''} onChange={(e) => onChange('redFlags', e.target.value)} disabled={isLocked} placeholder="e.g., unrealistic timeline, unclear scope, history of poor payment..." />
            </div>
             <div className="space-y-4 col-span-2">
                <Label>Red Flag Keywords to monitor</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {redFlagKeywords.map(keyword => (
                        <div key={keyword} className="flex items-center gap-2"><Checkbox id={`keyword-${keyword}`} checked={data.redFlagKeywordsList?.includes(keyword)} onCheckedChange={() => handleKeywordChange(keyword)} disabled={isLocked} /><label htmlFor={`keyword-${keyword}`}>{keyword}</label></div>
                    ))}
                </div>
                <Input value={data.customKeywords || ''} onChange={(e) => onChange('customKeywords', e.target.value)} disabled={isLocked} placeholder="Add your own comma-separated keywords" />
            </div>
        </CardContent>
      </Card>

       <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle>Information Gathering</CardTitle></CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
                <Label>What key information must be gathered for every opportunity?</Label>
                <Textarea value={data.infoToGather || ''} onChange={(e) => onChange('infoToGather', e.target.value)} disabled={isLocked} placeholder="e.g., budget, timeline, decision-maker, key requirements, submission format..." />
            </div>
            <div className="space-y-2 col-span-2">
                <Label>Standard clarification questions to ask</Label>
                <Textarea value={data.clarificationQuestions || ''} onChange={(e) => onChange('clarificationQuestions', e.target.value)} disabled={isLocked} placeholder="List questions to ask when scope is unclear, e.g., 'What is the budget for this project?'"/>
            </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle>Triage Authority & Workflow</CardTitle></CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><Label>Can Bid Manager dismiss opportunities that are a clear bad fit?</Label><RadioGroup value={data.canDismiss} onValueChange={(v) => onChange('canDismiss', v)} className="mt-2"><div className="flex items-center gap-4"><RadioGroupItem value="yes" id="dismiss-yes" /><Label htmlFor="dismiss-yes">Yes</Label></div><div className="flex items-center gap-4"><RadioGroupItem value="no" id="dismiss-no" /><Label htmlFor="dismiss-no">No, show me everything</Label></div></RadioGroup></div>
            <div className="space-y-2">
                <Label>Who should be notified of new opportunities?</Label>
                <Input value={data.notificationRecipients || ''} onChange={(e) => onChange('notificationRecipients', e.target.value)} disabled={isLocked} placeholder="e.g., email addresses, Slack channel" />
            </div>
            <div className="space-y-2">
                <Label>What is the expected triage response time?</Label>
                <Input value={data.responseTime || ''} onChange={(e) => onChange('responseTime', e.target.value)} disabled={isLocked} placeholder="e.g., within 24 hours" />
            </div>
             <div className="space-y-2 col-span-2">
                <Label>Notes on triage process</Label>
                <Textarea value={data.triageNotes || ''} onChange={(e) => onChange('triageNotes', e.target.value)} disabled={isLocked} placeholder="Any other instructions or context for the triage process."/>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
