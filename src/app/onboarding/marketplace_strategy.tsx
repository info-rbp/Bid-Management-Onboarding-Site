
"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface MarketplaceStrategyProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
}

const platforms = ["Airtasker", "Bark", "ServiceSeeking", "Oneflare", "hipages", "Upwork", "Freelancer", "Fiverr", "Other", "Unsure"];

const PlatformStrategyCard = ({ platform, strategy, onChange, isLocked }: any) => {
  const handleChange = (field: string, value: any) => {
    onChange(platform, { ...strategy, [field]: value });
  };

  return (
    <Card className="border-none shadow-sm rounded-3xl bg-slate-50">
      <CardHeader className="border-b"><CardTitle>{platform} Strategy</CardTitle></CardHeader>
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2"><Label>Account Status</Label><Input value={strategy?.accountStatus || ''} onChange={(e) => handleChange('accountStatus', e.target.value)} disabled={isLocked} /></div>
        <div className="space-y-2"><Label>Suitable Services</Label><Input value={strategy?.suitableServices || ''} onChange={(e) => handleChange('suitableServices', e.target.value)} disabled={isLocked} /></div>
        <div className="space-y-2"><Label>Minimum Job Value</Label><Input type="number" value={strategy?.minJobValue || ''} onChange={(e) => handleChange('minJobValue', e.target.value)} disabled={isLocked} /></div>
        <div className="space-y-2"><Label>Preferred Lead Types</Label><Input value={strategy?.preferredLeadTypes || ''} onChange={(e) => handleChange('preferredLeadTypes', e.target.value)} disabled={isLocked} /></div>
        <div className="space-y-2"><Label>Lead Types to Ignore</Label><Input value={strategy?.leadTypesToIgnore || ''} onChange={(e) => handleChange('leadTypesToIgnore', e.target.value)} disabled={isLocked} /></div>
        <div className="space-y-2"><Label>Response Speed Expectation</Label><Input value={strategy?.responseSpeed || ''} onChange={(e) => handleChange('responseSpeed', e.target.value)} disabled={isLocked} /></div>
        <div className="space-y-2"><Label>Comfort with Paid Leads/Credits</Label><Input value={strategy?.paidLeadComfort || ''} onChange={(e) => handleChange('paidLeadComfort', e.target.value)} disabled={isLocked} /></div>
        <div className="space-y-2 col-span-2"><Label>Notes</Label><Textarea value={strategy?.notes || ''} onChange={(e) => handleChange('notes', e.target.value)} disabled={isLocked} /></div>
      </CardContent>
    </Card>
  );
};

export function MarketplaceStrategy({ data, onChange, isLocked }: MarketplaceStrategyProps) {
    const selectedPlatforms = data.selectedPlatforms || [];
    const platformStrategies = data.platformStrategies || {};

    const handlePlatformChange = (platform: string) => {
        const updated = selectedPlatforms.includes(platform) 
            ? selectedPlatforms.filter((p: string) => p !== platform)
            : [...selectedPlatforms, platform];
        onChange('selectedPlatforms', updated);
    };

    const handleStrategyChange = (platform: string, strategyData: any) => {
        onChange('platformStrategies', { ...platformStrategies, [platform]: strategyData });
    };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-4xl font-headline font-bold text-slate-900">Marketplace Strategy</h2>
        <p className="text-slate-500 text-lg">Define your strategy for marketplace platforms, including lead rules, budget, and response authority.</p>
      </div>

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle>Platform Selection</CardTitle></CardHeader>
        <CardContent className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            {platforms.map(p => (
                <div key={p} className="flex items-center gap-2"><Checkbox id={`platform-${p}`} checked={selectedPlatforms.includes(p)} onCheckedChange={() => handlePlatformChange(p)} disabled={isLocked} /><label htmlFor={`platform-${p}`}>{p}</label></div>
            ))}
        </CardContent>
      </Card>

      {selectedPlatforms.filter((p: string) => p !== 'Unsure').map((p: string) => (
          <PlatformStrategyCard key={p} platform={p} strategy={platformStrategies[p]} onChange={handleStrategyChange} isLocked={isLocked} />
      ))}

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle>General Lead Rules & Authority</CardTitle></CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2"><Label>What job types are worthwhile?</Label><Textarea value={data.worthwhileJobs || ''} onChange={(e) => onChange('worthwhileJobs', e.target.value)} disabled={isLocked} /></div>
            <div className="space-y-2 col-span-2"><Label>What job types should we ignore?</Label><Textarea value={data.jobsToIgnore || ''} onChange={(e) => onChange('jobsToIgnore', e.target.value)} disabled={isLocked} /></div>
            <div className="space-y-2"><Label>Are you available for urgent work?</Label><Input value={data.urgentWorkAvailability || ''} onChange={(e) => onChange('urgentWorkAvailability', e.target.value)} disabled={isLocked} /></div>
            <div className="space-y-2"><Label>What is your absolute minimum job value?</Label><Input type="number" value={data.minJobValueGeneral || ''} onChange={(e) => onChange('minJobValueGeneral', e.target.value)} disabled={isLocked} /></div>
            <div><Label>Are you open to lower-value work to build reviews?</Label><RadioGroup value={data.lowerValueForReviews} onValueChange={(v) => onChange('lowerValueForReviews', v)} className="mt-2"><div className="flex items-center gap-4"><RadioGroupItem value="yes" id="reviews-yes" /><Label htmlFor="reviews-yes">Yes</Label></div><div className="flex items-center gap-4"><RadioGroupItem value="no" id="reviews-no" /><Label htmlFor="reviews-no">No</Label></div></RadioGroup></div>
            <div className="space-y-2"><Label>Monthly budget for paid leads/credits</Label><Input type="number" value={data.monthlyBudget || ''} onChange={(e) => onChange('monthlyBudget', e.target.value)} disabled={isLocked} /></div>
            <div className="col-span-2 border-t pt-6 space-y-4">
                <h3 className="font-semibold">Response Authority</h3>
                <div><Label>Can Bid Manager prepare responses?</Label><RadioGroup value={data.canPrepare} onValueChange={(v) => onChange('canPrepare', v)} className="mt-2"><div className="flex items-center gap-4"><RadioGroupItem value="yes" id="prepare-yes" /><Label htmlFor="prepare-yes">Yes</Label></div><div className="flex items-center gap-4"><RadioGroupItem value="no" id="prepare-no" /><Label htmlFor="prepare-no">No</Label></div></RadioGroup></div>
                <div><Label>Can Bid Manager send responses under a certain threshold?</Label><RadioGroup value={data.canSend} onValueChange={(v) => onChange('canSend', v)} className="mt-2"><div className="flex items-center gap-4"><RadioGroupItem value="yes" id="send-yes" /><Label htmlFor="send-yes">Yes</Label></div><div className="flex items-center gap-4"><RadioGroupItem value="no" id="send-no" /><Label htmlFor="send-no">No</Label></div></RadioGroup></div>
                {data.canSend === 'yes' && <div className="space-y-2"><Label>What is the threshold/rule?</Label><Input value={data.sendThreshold || ''} onChange={(e) => onChange('sendThreshold', e.target.value)} disabled={isLocked} /></div>}
                <div><Label>Should all responses be reviewed before sending?</Label><RadioGroup value={data.reviewAll} onValueChange={(v) => onChange('reviewAll', v)} className="mt-2"><div className="flex items-center gap-4"><RadioGroupItem value="yes" id="review-yes" /><Label htmlFor="review-yes">Yes</Label></div><div className="flex items-center gap-4"><RadioGroupItem value="no" id="review-no" /><Label htmlFor="review-no">No</Label></div></RadioGroup></div>
                <div className="space-y-2 col-span-2"><Label>Claims or prices to avoid</Label><Textarea value={data.claimsToAvoid || ''} onChange={(e) => onChange('claimsToAvoid', e.target.value)} disabled={isLocked} /></div>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
