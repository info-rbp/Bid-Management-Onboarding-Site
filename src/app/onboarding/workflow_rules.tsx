
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
import { Plus, Trash2, CheckCircle2, Info, AlertTriangle, MessageSquare, Clock, UserCheck, Timer, Siren, RotateCcw, ShieldCheck, Mail, Phone, Users } from 'lucide-react';
import { deriveWorkflowReadiness } from '@/lib/onboarding-steps';

interface WorkflowRulesProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
  fieldErrors?: Record<string, string>;
  allData?: any;
}

const commMethodOptions = [
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
  { label: "SMS", value: "sms" },
  { label: "Microsoft Teams", value: "microsoft_teams" },
  { label: "Google Meet", value: "google_meet" },
  { label: "Zoom", value: "zoom" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Shared Google Drive", value: "shared_google_drive" },
  { label: "Project management tool", value: "project_management_tool" },
  { label: "Other", value: "other" },
];

const feedbackOptions = [
  { label: "Comments in document", value: "comments_in_document" },
  { label: "Email summary", value: "email_summary" },
  { label: "Phone call", value: "phone_call" },
  { label: "Video meeting", value: "video_meeting" },
  { label: "Shared task list", value: "shared_task_list" },
  { label: "Other", value: "other" },
];

export function WorkflowRules({ data, onChange, isLocked, allData }: WorkflowRulesProps) {
  const commMethods = data.preferredCommunicationMethods || [];
  const feedbackPrefs = data.reviewFeedbackPreferences || [];
  const draftReviewers = data.draftReviewers || [];
  const finalSubmissionApprover = data.finalSubmissionApprover || { contactType: '' };
  const emergencyApprovalContact = data.emergencyApprovalContact || { contactType: '' };

  const handleCommToggle = (value: string) => {
    if (isLocked) return;
    const next = commMethods.includes(value) ? commMethods.filter((v: string) => v !== value) : [...commMethods, value];
    onChange('preferredCommunicationMethods', next);
  };

  const handleFeedbackToggle = (value: string) => {
    if (isLocked) return;
    const next = feedbackPrefs.includes(value) ? feedbackPrefs.filter((v: string) => v !== value) : [...feedbackPrefs, value];
    onChange('reviewFeedbackPreferences', next);
  };

  const handleAddReviewer = () => {
    onChange('draftReviewers', [...draftReviewers, { id: Math.random().toString(36).substr(2, 9) }]);
  };

  const handleRemoveReviewer = (index: number) => {
    onChange('draftReviewers', draftReviewers.filter((_: any, i: number) => i !== index));
  };

  const handleReviewerChange = (index: number, field: string, value: any) => {
    const next = [...draftReviewers];
    // Special handling for the contact selector within the array
    if (field === '') {
        next[index] = { ...next[index], ...value };
    } else {
        next[index] = { ...next[index], [field]: value };
    }
    onChange('draftReviewers', next);
  };

  const renderContactSelector = (label: string, value: any, onSelect: (val: any) => void, allowUrgent: boolean = false) => (
    <div className="space-y-4">
      {label && <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</Label>}
      <div className="grid grid-cols-1 gap-4">
        <select 
          value={value?.contactType || ''} 
          onChange={(e) => onSelect({ ...value, contactType: e.target.value })}
          disabled={isLocked}
          className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Select contact...</option>
          <option value="primary_contact">Primary Contact</option>
          <option value="secondary_contact">Secondary Contact</option>
          <option value="section_2_final_decision_maker">Final Decision Maker</option>
          {allowUrgent && <option value="section_2_urgent_approval_contact">Urgent Approval Contact</option>}
          <option value="section_2_pricing_contact">Pricing Contact</option>
          <option value="section_2_compliance_contact">Compliance Contact</option>
          <option value="custom">Custom Person</option>
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

  const readiness = deriveWorkflowReadiness(data);

  return (
    <div className="space-y-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Communication, Review and Workflow Rules</h2>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-blue-800 text-sm leading-relaxed">
          “This section helps us establish a clear workflow for active opportunities, drafts, reviews, approvals and urgent requests.”
        </div>
      </div>

      {/* GROUP 1: COMMUNICATION PREFERENCES */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">1</div>
          <h3 className="text-xl font-bold text-slate-900">Communication Preferences</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-bold">13.1 Preferred communication method(s)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              {commMethodOptions.map(opt => (
                <div key={opt.value} className="flex items-center gap-2">
                  <Checkbox 
                    id={`comm-${opt.value}`}
                    checked={commMethods.includes(opt.value)}
                    onCheckedChange={() => handleCommToggle(opt.value)}
                    disabled={isLocked}
                  />
                  <Label htmlFor={`comm-${opt.value}`} className="text-xs font-medium cursor-pointer leading-tight">{opt.label}</Label>
                </div>
              ))}
            </div>
            {commMethods.includes('other') && (
              <Input value={data.otherCommunicationMethod || ''} onChange={(e) => onChange('otherCommunicationMethod', e.target.value)} placeholder="Specify other method" disabled={isLocked} className="rounded-xl mt-2" />
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-base font-bold">13.9 Preferred feedback method for reviews</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              {feedbackOptions.map(opt => (
                <div key={opt.value} className="flex items-center gap-2">
                  <Checkbox 
                    id={`fb-${opt.value}`}
                    checked={feedbackPrefs.includes(opt.value)}
                    onCheckedChange={() => handleFeedbackToggle(opt.value)}
                    disabled={isLocked}
                  />
                  <Label htmlFor={`fb-${opt.value}`} className="text-xs font-medium cursor-pointer leading-tight">{opt.label}</Label>
                </div>
              ))}
            </div>
            {feedbackPrefs.includes('other') && (
              <Input value={data.otherReviewFeedbackPreference || ''} onChange={(e) => onChange('otherReviewFeedbackPreference', e.target.value)} placeholder="Specify other preference" disabled={isLocked} className="rounded-xl mt-2" />
            )}
          </div>
        </div>
      </section>

      {/* GROUP 2: RESPONSE TIMING */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">2</div>
          <h3 className="text-xl font-bold text-slate-900">Response Timing</h3>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-base font-bold">13.2 How quickly can you usually respond during active opportunities?</Label>
            <RadioGroup value={data.activeOpportunityResponseTime} onValueChange={(v) => onChange('activeOpportunityResponseTime', v)} disabled={isLocked} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Same day', value: 'same_day' },
                { label: 'Within 24 hours', value: 'within_24_hours' },
                { label: 'Within 48 hours', value: 'within_48_hours' },
                { label: '2-3 business days', value: 'two_to_three_business_days' },
                { label: 'Depends on the request', value: 'depends_on_request' },
              ].map(opt => (
                <div key={opt.value} className="flex items-center gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <RadioGroupItem value={opt.value} id={`time-${opt.value}`} />
                  <Label htmlFor={`time-${opt.value}`} className="text-sm font-semibold">{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">13.8 Difficult response days or times (Optional)</Label>
            <p className="text-sm text-muted-foreground italic">e.g., Weekends, outside business hours, Fridays after 3pm.</p>
            <Textarea value={data.difficultResponseTimes || ''} onChange={(e) => onChange('difficultResponseTimes', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" />
          </div>
        </div>
      </section>

      {/* GROUP 3: REVIEW AND APPROVAL ROLES */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">3</div>
          <h3 className="text-xl font-bold text-slate-900">Review and Approval Roles</h3>
        </div>

        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-bold">13.3 Who should review draft responses or proposals?</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {draftReviewers.map((rec: any, idx: number) => (
                <Card key={idx} className="border-2 border-slate-100 rounded-2xl p-4 relative pt-10 shadow-sm">
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveReviewer(idx)} disabled={isLocked} className="absolute top-2 right-2 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  {renderContactSelector('', rec, (v) => handleReviewerChange(idx, '', v))}
                </Card>
              ))}
              <Button onClick={handleAddReviewer} variant="outline" disabled={isLocked} className="h-full min-h-[120px] border-dashed border-2 rounded-2xl flex flex-col gap-2 hover:bg-slate-50">
                <Users className="w-5 h-5" />
                <span className="text-xs font-bold">Add Reviewer</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-slate-100 pt-8">
             {renderContactSelector('13.4 Who approves final submissions?', finalSubmissionApprover, (v) => onChange('finalSubmissionApprover', v), true)}
             {renderContactSelector('13.7 Who is the emergency approval contact?', emergencyApprovalContact, (v) => onChange('emergencyApprovalContact', v), true)}
          </div>
        </div>
      </section>

      {/* GROUP 4: DEADLINE RULES */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">4</div>
          <h3 className="text-xl font-bold text-slate-900">Deadline Rules</h3>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-base font-bold">13.5 How much time do you need to review drafts?</Label>
            <RadioGroup value={data.draftReviewTimeNeeded} onValueChange={(v) => onChange('draftReviewTimeNeeded', v)} disabled={isLocked} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Less than 24 hours', value: 'less_than_24_hours' },
                { label: '1 business day', value: 'one_business_day' },
                { label: '2 business days', value: 'two_to_three_business_days' },
                { label: '3 business days', value: 'three_business_days' },
                { label: 'More than 3 business days', value: 'more_than_three_business_days' },
                { label: 'Depends on complexity', value: 'depends_on_complexity' },
              ].map(opt => (
                <div key={opt.value} className="flex items-center gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <RadioGroupItem value={opt.value} id={`rev-${opt.value}`} />
                  <Label htmlFor={`rev-${opt.value}`} className="text-sm font-semibold">{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-bold">13.6 How far before the official deadline should final approval be completed?</Label>
            <RadioGroup value={data.finalApprovalDeadlinePreference} onValueChange={(v) => onChange('finalApprovalDeadlinePreference', v)} disabled={isLocked} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: '24 hours before', value: 'twenty_four_hours_before' },
                { label: '48 hours before', value: 'forty_eight_hours_before' },
                { label: '3 business days before', value: 'three_business_days_before' },
                { label: '5 business days before', value: 'five_business_days_before' },
                { label: 'Depends on opportunity', value: 'depends_on_opportunity' },
              ].map(opt => (
                <div key={opt.value} className="flex items-center gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <RadioGroupItem value={opt.value} id={`dead-${opt.value}`} />
                  <Label htmlFor={`dead-${opt.value}`} className="text-sm font-semibold">{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </section>

      {/* Summary Card */}
      {commMethods.length > 0 && (
        <Card className="bg-slate-900 border-none rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardContent className="p-10 space-y-10">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Timer className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Workflow Readiness Summary</h3>
                <p className="text-slate-400 text-sm">Communication & review benchmarks.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" /> Communication
                </p>
                <div className="space-y-3">
                  <ReadinessBadge active={readiness.hasCommunicationMethods} label="Methods Mapped" />
                  <ReadinessBadge active={readiness.hasReviewFeedbackPreference} label="Feedback Preference Set" />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {commMethods.slice(0, 3).map((m: string) => <Badge key={m} className="bg-slate-800 text-slate-400 border-none text-[8px] uppercase">{m.replace('_', ' ')}</Badge>)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Timing & Risk
                </p>
                <div className="space-y-3">
                  <ReadinessBadge active={readiness.hasResponseTime} label={`Speed: ${data.activeOpportunityResponseTime?.replace(/_/g, ' ')}`} />
                  <ReadinessBadge active={readiness.hasDraftReviewWindow} label="Review Window Set" />
                  
                  <div className={`mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-bold uppercase ${
                    readiness.reviewDeadlineRiskLevel === 'high' ? 'bg-red-400/5 border-red-400/20 text-red-400' :
                    readiness.reviewDeadlineRiskLevel === 'medium' ? 'bg-orange-400/5 border-orange-400/20 text-orange-400' :
                    'bg-green-400/5 border-green-400/20 text-green-400'
                  }`}>
                    <AlertTriangle className="w-3 h-3" />
                    Deadline Risk: {readiness.reviewDeadlineRiskLevel}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <UserCheck className="w-3 h-3" /> Governance
                </p>
                <div className="space-y-3">
                  <ReadinessBadge active={readiness.hasDraftReviewers} label={`${draftReviewers.length} Draft Reviewers`} />
                  <ReadinessBadge active={readiness.hasFinalApprover} label="Final Approver Set" />
                  {readiness.urgentWorkflowReady ? (
                    <div className="flex items-center gap-2 text-green-400 px-3 py-1.5 bg-green-400/5 rounded-lg border border-green-400/20">
                      <Siren className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase">Urgent Flow Ready</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400 px-3 py-1.5 bg-red-400/5 rounded-lg border border-red-400/20">
                      <Siren className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase">Urgent Flow Gaps</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 text-center space-y-4">
              <p className="text-sm text-slate-400 italic">
                “Based on your workflow settings, Bid Manager can plan draft reviews, approval deadlines and urgent escalation pathways.”
              </p>
              <div className="flex justify-center">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${readiness.workflowReadyForActiveOpportunities ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                   {readiness.workflowReadyForActiveOpportunities ? <CheckCircle2 className="w-3 h-3" /> : <RotateCcw className="w-3 h-3" />}
                   {readiness.workflowReadyForActiveOpportunities ? 'Workflow Fully Defined' : 'Workflow Setup Incomplete'}
                </div>
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
      <span className="text-xs font-bold truncate">{label}</span>
    </div>
  );
}
