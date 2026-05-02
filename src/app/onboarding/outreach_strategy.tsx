
"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface OutreachStrategyProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
}

const channels = ["Direct proposals", "Email outreach", "LinkedIn outreach", "Referral partner outreach", "Local council supplier registration", "Corporate supplier registration", "Subcontractor positioning", "Industry association opportunities", "Previous client reactivation", "Capability statement campaign", "Other"];
const campaigns = ["First Contract Starter Pack", "Local Supplier Introduction Campaign", "Marketplace Review Builder", "Case Study Harvest Campaign", "Grant Project Pipeline", "Subcontractor Positioning Pack", "Preferred Supplier Registration Sprint", "Dormant Client Reactivation", "Industry Partner Outreach", "Capability Statement Campaign", "Please recommend"];

const TargetCard = ({ target, index, onChange, onRemove, isLocked }: any) => {
  const handleChange = (field: string, value: any) => {
    onChange(index, { ...target, [field]: value });
  };
  return (
    <Card className="border-none shadow-sm rounded-3xl bg-slate-50">
      <CardHeader className="border-b flex flex-row items-center justify-between">
        <CardTitle>Target #{index + 1}</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => onRemove(index)} disabled={isLocked}><Trash2 className="w-4 h-4 text-destructive" /></Button>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 col-span-2"><Label>Target organisation, sector, or buyer type</Label><Input value={target.name || ''} onChange={(e) => handleChange('name', e.target.value)} disabled={isLocked} /></div>
          <div className="space-y-2"><Label>Why is this target attractive?</Label><Textarea value={target.reason || ''} onChange={(e) => handleChange('reason', e.target.value)} disabled={isLocked} /></div>
          <div className="space-y-2"><Label>Existing relationship?</Label><Input value={target.relationship || ''} onChange={(e) => handleChange('relationship', e.target.value)} disabled={isLocked} /></div>
          <div className="space-y-2"><Label>Known contact</Label><Input value={target.contact || ''} onChange={(e) => handleChange('contact', e.target.value)} disabled={isLocked} /></div>
          <div className="space-y-2"><Label>Preferred approach</Label><Input value={target.approach || ''} onChange={(e) => handleChange('approach', e.target.value)} disabled={isLocked} /></div>
          <div className="space-y-2 col-span-2"><Label>Notes</Label><Textarea value={target.notes || ''} onChange={(e) => handleChange('notes', e.target.value)} disabled={isLocked} /></div>
      </CardContent>
    </Card>
  );
}

export function OutreachStrategy({ data, onChange, isLocked }: OutreachStrategyProps) {
    const targets = data.targets || [];

    const handleCheckboxChange = (field: string, item: string) => {
        const current = data[field] || [];
        const updated = current.includes(item) ? current.filter((i: string) => i !== item) : [...current, item];
        onChange(field, updated);
    };

    const handleAddTarget = () => {
        onChange('targets', [...targets, {}]);
    };

    const handleRemoveTarget = (index: number) => {
        onChange('targets', targets.filter((_: any, i: number) => i !== index));
    };

    const handleTargetChange = (index: number, targetData: any) => {
        const updated = [...targets];
        updated[index] = targetData;
        onChange('targets', updated);
    };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-4xl font-headline font-bold text-slate-900">Outreach Strategy</h2>
        <p className="text-slate-500 text-lg">Define your strategy for direct proposals, outreach, referrals, and target accounts.</p>
      </div>

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle>Direct Growth Channels</CardTitle></CardHeader>
        <CardContent className="p-6 grid grid-cols-2 gap-4">
            {channels.map(c => (
                <div key={c} className="flex items-center gap-2"><Checkbox id={`channel-${c}`} checked={data.channels?.includes(c)} onCheckedChange={() => handleCheckboxChange('channels', c)} disabled={isLocked} /><label htmlFor={`channel-${c}`}>{c}</label></div>
            ))}
        </CardContent>
      </Card>

       <div className="space-y-6">
            <div className="space-y-4 text-center pt-6 border-t">
                <h3 className="text-2xl font-bold">Target Organisations / Sectors</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">Who are your ideal customers? Add specific companies, industries, or customer types you want to target.</p>
            </div>
            {targets.map((t: any, i: number) => (
                <TargetCard key={i} target={t} index={i} onChange={handleTargetChange} onRemove={handleRemoveTarget} isLocked={isLocked} />
            ))}
            <div className="text-center">
                <Button onClick={handleAddTarget} disabled={isLocked}><Plus className="w-4 h-4 mr-2"/>Add Target</Button>
            </div>
        </div>

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle>Relationships & Referrals</CardTitle></CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2"><Label>Previous clients to re-engage</Label><Textarea value={data.clientsToReengage || ''} onChange={(e) => onChange('clientsToReengage', e.target.value)} disabled={isLocked} /></div>
            <div className="space-y-2 col-span-2"><Label>Current referrers</Label><Textarea value={data.currentReferrers || ''} onChange={(e) => onChange('currentReferrers', e.target.value)} disabled={isLocked} /></div>
            <div className="space-y-2 col-span-2"><Label>Non-competing businesses serving same clients</Label><Textarea value={data.nonCompetingBiz || ''} onChange={(e) => onChange('nonCompetingBiz', e.target.value)} disabled={isLocked} /></div>
            <div className="space-y-2"><Label>Organisations not to contact</Label><Textarea value={data.orgsToAvoid || ''} onChange={(e) => onChange('orgsToAvoid', e.target.value)} disabled={isLocked} /></div>
            <div className="space-y-2"><Label>Sectors to avoid</Label><Textarea value={data.sectorsToAvoid || ''} onChange={(e) => onChange('sectorsToAvoid', e.target.value)} disabled={isLocked} /></div>
        </CardContent>
      </Card>

       <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle>Campaigns & Tone</CardTitle></CardHeader>
        <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
                <Label>Which campaign themes are you interested in?</Label>
                <div className="grid grid-cols-2 gap-4">
                {campaigns.map(c => (
                    <div key={c} className="flex items-center gap-2"><Checkbox id={`campaign-${c}`} checked={data.campaigns?.includes(c)} onCheckedChange={() => handleCheckboxChange('campaigns', c)} disabled={isLocked} /><label htmlFor={`campaign-${c}`}>{c}</label></div>
                ))}
                </div>
            </div>
            <div className="space-y-2"><Label>Outreach Tone</Label><Textarea value={data.outreachTone || ''} onChange={(e) => onChange('outreachTone', e.target.value)} disabled={isLocked} placeholder="e.g., Formal, friendly, direct, value-focused..."/></div>
            <div className="space-y-2"><Label>Claims, offers, or promises to avoid</Label><Textarea value={data.claimsToAvoid || ''} onChange={(e) => onChange('claimsToAvoid', e.target.value)} disabled={isLocked} /></div>
        </CardContent>
      </Card>

    </div>
  );
}
