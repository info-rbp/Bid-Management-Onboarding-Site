
"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Workflow, UserCheck, MessageCircle, FileClock, CheckCircle2 } from 'lucide-react';

interface WorkflowRulesProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
}

export function WorkflowRules({ data, onChange, isLocked }: WorkflowRulesProps) {

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-4xl font-headline font-bold text-slate-900">Workflow & Authority</h2>
        <p className="text-slate-500 text-lg">Define who has authority for key decisions and how you want to collaborate with Bid Manager.</p>
      </div>

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle className="flex items-center gap-2 text-primary"><UserCheck className="w-5 h-5" /> Key Contacts & Approvers</CardTitle></CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label>Primary day-to-day contact</Label>
                <Input value={data.primaryContact || ''} onChange={(e) => onChange('primaryContact', e.target.value)} disabled={isLocked} placeholder="Name and email" />
            </div>
            <div className="space-y-2">
                <Label>Commercial approver (pricing, liability)</Label>
                <Input value={data.commercialApprover || ''} onChange={(e) => onChange('commercialApprover', e.target.value)} disabled={isLocked} placeholder="Name and email" />
            </div>
            <div className="space-y-2">
                <Label>Technical approver (scope, solution)</Label>
                <Input value={data.technicalApprover || ''} onChange={(e) => onChange('technicalApprover', e.target.value)} disabled={isLocked} placeholder="Name and email" />
            </div>
            <div className="space-y-2">
                <Label>Final submission approver</Label>
                <Input value={data.finalApprover || ''} onChange={(e) => onChange('finalApprover', e.target.value)} disabled={isLocked} placeholder="Name and email" />
            </div>
             <div className="space-y-2 col-span-2">
                <Label>Escalation contact for urgent issues</Label>
                <Input value={data.escalationContact || ''} onChange={(e) => onChange('escalationContact', e.target.value)} disabled={isLocked} placeholder="Name and email" />
            </div>
        </CardContent>
      </Card>

       <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><MessageCircle className="w-5 h-5" /> Communication</CardTitle></CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
                <Label>Preferred communication channel</Label>
                <RadioGroup value={data.commChannel} onValueChange={(v) => onChange('commChannel', v)} className="mt-2">
                    <div className="flex items-center gap-2"><RadioGroupItem value="email" id="comm-email" /><Label htmlFor="comm-email">Email</Label></div>
                    <div className="flex items-center gap-2"><RadioGroupItem value="slack" id="comm-slack" /><Label htmlFor="comm-slack">Slack</Label></div>
                    <div className="flex items-center gap-2"><RadioGroupItem value="teams" id="comm-teams" /><Label htmlFor="comm-teams">Microsoft Teams</Label></div>
                    <div className="flex items-center gap-2"><RadioGroupItem value="other" id="comm-other" /><Label htmlFor="comm-other">Other</Label></div>
                </RadioGroup>
                 {data.commChannel === 'other' && <Input value={data.commChannelOther || ''} onChange={(e) => onChange('commChannelOther', e.target.value)} disabled={isLocked} placeholder="Please specify" />}
            </div>
            <div className="space-y-3">
                <Label>Meeting cadence preference</Label>
                <RadioGroup value={data.meetingCadence} onValueChange={(v) => onChange('meetingCadence', v)} className="mt-2">
                    <div className="flex items-center gap-2"><RadioGroupItem value="weekly" id="cadence-weekly" /><Label htmlFor="cadence-weekly">Weekly</Label></div>
                    <div className="flex items-center gap-2"><RadioGroupItem value="fortnightly" id="cadence-fortnightly" /><Label htmlFor="cadence-fortnightly">Fortnightly</Label></div>
                    <div className="flex items-center gap-2"><RadioGroupItem value="monthly" id="cadence-monthly" /><Label htmlFor="cadence-monthly">Monthly</Label></div>
                    <div className="flex items-center gap-2"><RadioGroupItem value="as_needed" id="cadence-as-needed" /><Label htmlFor="cadence-as-needed">As needed</Label></div>
                </RadioGroup>
            </div>
            <div className="space-y-2">
                 <Label>Preferred time for meetings</Label>
                <Input value={data.meetingTime || ''} onChange={(e) => onChange('meetingTime', e.target.value)} disabled={isLocked} placeholder="e.g., Tuesday afternoons" />
            </div>
            <div className="space-y-2">
                 <Label>Standard response time for your team</Label>
                <Input value={data.teamResponseTime || ''} onChange={(e) => onChange('teamResponseTime', e.target.value)} disabled={isLocked} placeholder="e.g., within 48 hours" />
            </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><FileClock className="w-5 h-5" /> Review & Approval Process</CardTitle></CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label>Standard turnaround time for your reviews</Label>
                <Input value={data.reviewTurnaround || ''} onChange={(e) => onChange('reviewTurnaround', e.target.value)} disabled={isLocked} placeholder="e.g., 2 business days" />
            </div>
            <div className="space-y-2">
                <Label>Who provides feedback on draft content?</Label>
                <Input value={data.feedbackProvider || ''} onChange={(e) => onChange('feedbackProvider', e.target.value)} disabled={isLocked} placeholder="Name / role" />
            </div>
             <div className="space-y-2 col-span-2">
                <Label>What is the process for final sign-off?</Label>
                <Textarea value={data.signOffProcess || ''} onChange={(e) => onChange('signOffProcess', e.target.value)} disabled={isLocked} placeholder="e.g., Email approval from Commercial Approver, then verbal from Final Approver"/>
            </div>
        </CardContent>
      </Card>

       <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Definition of Done</CardTitle></CardHeader>
        <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
                <Label>What does a successful engagement look like to you?</Label>
                <Textarea value={data.successDefinition || ''} onChange={(e) => onChange('successDefinition', e.target.value)} disabled={isLocked} placeholder="e.g., increased win rate, reduced time on tenders, access to new markets..."/>
            </div>
            <div className="space-y-2">
                <Label>Key Performance Indicators (KPIs) to track</Label>
                <Textarea value={data.kpis || ''} onChange={(e) => onChange('kpis', e.target.value)} disabled={isLocked} placeholder="e.g., Number of submissions, Win rate (by value/volume), Triage-to-submission rate..."/>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
