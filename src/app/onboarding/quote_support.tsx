
"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface QuoteSupportProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
}

const quoteTypes = ["Fixed-price quotes", "Hourly rate quotes", "Project quotes", "Service packages", "Maintenance quotes", "Emergency work quotes", "Inspection-based quotes", "Marketplace responses", "Supplier quote requests", "Other"];

export function QuoteSupport({ data, onChange, isLocked }: QuoteSupportProps) {

    const handleCheckboxChange = (field: string, item: string) => {
        const current = data[field] || [];
        const updated = current.includes(item) ? current.filter((i: string) => i !== item) : [...current, item];
        onChange(field, updated);
    };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-4xl font-headline font-bold text-slate-900">Quote Support</h2>
        <p className="text-slate-500 text-lg">Define rules for preparing and approving quotes, including types, inclusions, and authority.</p>
      </div>

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle>Quote Types & Requirements</CardTitle></CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-3 col-span-2">
               <Label>What types of quotes do you provide?</Label>
               <div className="grid grid-cols-2 gap-2">
                    {quoteTypes.map(type => <div key={type} className="flex items-center gap-2"><Checkbox id={`type-${type}`} checked={data.quoteTypes?.includes(type)} onCheckedChange={() => handleCheckboxChange('quoteTypes', type)} disabled={isLocked} /><label htmlFor={`type-${type}`}>{type}</label></div>)}
               </div>
           </div>
           <div className="space-y-2 col-span-2"><Label>What information is absolutely needed before quoting?</Label><Textarea value={data.infoNeeded || ''} onChange={(e) => onChange('infoNeeded', e.target.value)} disabled={isLocked} /></div>
           <div className="space-y-2 col-span-2"><Label>Are inspections, photos, documents, or calls required?</Label><Textarea value={data.requirements || ''} onChange={(e) => onChange('requirements', e.target.value)} disabled={isLocked} /></div>
           <div className="space-y-2 col-span-2"><Label>What MUST be collected from the client before a quote is sent?</Label><Textarea value={data.mustCollect || ''} onChange={(e) => onChange('mustCollect', e.target.value)} disabled={isLocked} /></div>
        </CardContent>
      </Card>

       <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle>Standard Quote Components</CardTitle></CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><Label>Standard Inclusions</Label><Textarea value={data.inclusions || ''} onChange={(e) => onChange('inclusions', e.target.value)} disabled={isLocked} /></div>
            <div className="space-y-2"><Label>Standard Exclusions</Label><Textarea value={data.exclusions || ''} onChange={(e) => onChange('exclusions', e.target.value)} disabled={isLocked} /></div>
            <div className="space-y-2"><Label>Standard Assumptions</Label><Textarea value={data.assumptions || ''} onChange={(e) => onChange('assumptions', e.target.value)} disabled={isLocked} /></div>
            <div className="space-y-2"><Label>Standard Terms & Conditions</Label><Textarea value={data.terms || ''} onChange={(e) => onChange('terms', e.target.value)} disabled={isLocked} /></div>
            <div className="space-y-2"><Label>Quote Validity Period</Label><Input value={data.validityPeriod || ''} onChange={(e) => onChange('validityPeriod', e.target.value)} disabled={isLocked} /></div>
            <div className="space-y-2"><Label>Deposit Requirements</Label><Input value={data.depositRequirements || ''} onChange={(e) => onChange('depositRequirements', e.target.value)} disabled={isLocked} /></div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle>Quoting Authority & Rules</CardTitle></CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><Label>Who is the final approver for quotes?</Label><Input value={data.quoteApprover || ''} onChange={(e) => onChange('quoteApprover', e.target.value)} disabled={isLocked} /></div>
            <div><Label>Can Bid Manager prepare draft quotes?</Label><RadioGroup value={data.canPrepareDrafts} onValueChange={(v) => onChange('canPrepareDrafts', v)} className="mt-2"><div className="flex items-center gap-4"><RadioGroupItem value="yes" id="draft-yes" /><Label htmlFor="draft-yes">Yes</Label></div><div className="flex items-center gap-4"><RadioGroupItem value="no" id="draft-no" /><Label htmlFor="draft-no">No</Label></div></RadioGroup></div>
            <div><Label>Can Bid Manager send quotes under a threshold?</Label><RadioGroup value={data.canSendUnderThreshold} onValueChange={(v) => onChange('canSendUnderThreshold', v)} className="mt-2"><div className="flex items-center gap-4"><RadioGroupItem value="yes" id="send-yes" /><Label htmlFor="send-yes">Yes</Label></div><div className="flex items-center gap-4"><RadioGroupItem value="no" id="send-no" /><Label htmlFor="send-no">No</Label></div></RadioGroup></div>
            {data.canSendUnderThreshold === 'yes' && <div className="space-y-2"><Label>Maximum quote value or rule</Label><Input value={data.maxQuoteValue || ''} onChange={(e) => onChange('maxQuoteValue', e.target.value)} disabled={isLocked} /></div>}
            <div className="space-y-2 col-span-2"><Label>Quote types NEVER to send without approval</Label><Textarea value={data.neverSendTypes || ''} onChange={(e) => onChange('neverSendTypes', e.target.value)} disabled={isLocked} /></div>
            <div className="space-y-2 col-span-2"><Label>Prices, discounts, guarantees, or claims to avoid</Label><Textarea value={data.claimsToAvoid || ''} onChange={(e) => onChange('claimsToAvoid', e.target.value)} disabled={isLocked} /></div>
        </CardContent>
      </Card>

    </div>
  );
}
