
"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { UploadCloud, Plus, Trash2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface TenderReadinessProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
}

const contractTypes = ["Fixed Price", "Time & Materials", "Retainer/Subscription", "Panel Agreement", "Subcontract"];
const buyerTypes = ["Federal Government", "State Government", "Local Government", "Public Companies (ASX)", "Large Private Companies", "SMEs", "Startups", "Non-profits"];
const insuranceTypes = ["Public Liability", "Professional Indemnity", "Workers Comp"];
const complianceTypes = ["ISO 9001 (Quality)", "ISO 27001 (InfoSec)", "ISO 14001 (Environmental)", "SOC 2", "DISP"];

export function TenderReadiness({ data, onChange, isLocked }: TenderReadinessProps) {
    
    const handleCheckboxChange = (field: string, item: string) => {
        const current = data[field] || [];
        const updated = current.includes(item) ? current.filter((i: string) => i !== item) : [...current, item];
        onChange(field, updated);
    };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-4xl font-headline font-bold text-slate-900">Tender Readiness</h2>
        <p className="text-slate-500 text-lg">Assess your readiness for tenders, panels, supplier registrations, and procurement opportunities.</p>
      </div>

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle>Experience</CardTitle></CardHeader>
        <CardContent className="p-6 space-y-4">
            <div><Label>Have you submitted tenders, panels, or supplier registrations before?</Label>
                <RadioGroup value={data.previousExperience} onValueChange={(v) => onChange('previousExperience', v)} className="mt-2"><div className="flex items-center gap-4"><RadioGroupItem value="yes" id="exp-yes" /><Label htmlFor="exp-yes">Yes</Label></div><div className="flex items-center gap-4"><RadioGroupItem value="no" id="exp-no" /><Label htmlFor="exp-no">No</Label></div></RadioGroup>
            </div>
            {data.previousExperience === 'yes' && <div className="space-y-4 pt-4 border-t">
                 <div className="space-y-2"><Label>What types have you submitted?</Label><Textarea value={data.submissionTypes || ''} onChange={(e) => onChange('submissionTypes', e.target.value)} disabled={isLocked} /></div>
                 <div className="space-y-2"><Label>How many in the last 12 months?</Label><Input type="number" value={data.submissionsLast12Months || ''} onChange={(e) => onChange('submissionsLast12Months', e.target.value)} disabled={isLocked} /></div>
                 <div className="space-y-2"><Label>What was your success history?</Label><Textarea value={data.successHistory || ''} onChange={(e) => onChange('successHistory', e.target.value)} disabled={isLocked} /></div>
                 <div className="space-y-2"><Label>What feedback have you received?</Label><Textarea value={data.feedbackReceived || ''} onChange={(e) => onChange('feedbackReceived', e.target.value)} disabled={isLocked} /></div>
                 <Button variant="outline" disabled={isLocked}><UploadCloud className="w-4 h-4 mr-2" /> Upload Past Submissions or Feedback</Button>
            </div>}
        </CardContent>
      </Card>

       <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle>Targeting</CardTitle></CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
               <Label>Target Buyer Types</Label>
               {buyerTypes.map(type => <div key={type} className="flex items-center gap-2"><Checkbox id={`buyer-${type}`} checked={data.targetBuyerTypes?.includes(type)} onCheckedChange={() => handleCheckboxChange('targetBuyerTypes', type)} disabled={isLocked} /><label htmlFor={`buyer-${type}`}>{type}</label></div>)}
           </div>
           <div className="space-y-2">
               <Label>Preferred Contract Types</Label>
               {contractTypes.map(type => <div key={type} className="flex items-center gap-2"><Checkbox id={`contract-${type}`} checked={data.preferredContractTypes?.includes(type)} onCheckedChange={() => handleCheckboxChange('preferredContractTypes', type)} disabled={isLocked} /><label htmlFor={`contract-${type}`}>{type}</label></div>)}
           </div>
           <div className="space-y-2"><Label>Preferred Contract Value Range</Label><Input value={data.preferredContractValue || ''} onChange={(e) => onChange('preferredContractValue', e.target.value)} disabled={isLocked} /></div>
           <div className="space-y-2"><Label>Maximum realistic contract value</Label><Input value={data.maxContractValue || ''} onChange={(e) => onChange('maxContractValue', e.target.value)} disabled={isLocked} /></div>
           <div className="space-y-2"><Label>Preferred Locations</Label><Textarea value={data.preferredLocations || ''} onChange={(e) => onChange('preferredLocations', e.target.value)} disabled={isLocked} /></div>
           <div className="space-y-2"><Label>Locations/Contract Types to Avoid</Label><Textarea value={data.locationsToAvoid || ''} onChange={(e) => onChange('locationsToAvoid', e.target.value)} disabled={isLocked} /></div>
           <div className="space-y-2 col-span-2"><Label>Categories of Work to Pursue</Label><Textarea value={data.workToPursue || ''} onChange={(e) => onChange('workToPursue', e.target.value)} disabled={isLocked} /></div>
           <div className="space-y-2 col-span-2"><Label>Categories to Avoid</Label><Textarea value={data.workToAvoid || ''} onChange={(e) => onChange('workToAvoid', e.target.value)} disabled={isLocked} /></div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle>Readiness & Governance</CardTitle></CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
               <Label>Insurance Readiness</Label>
               {insuranceTypes.map(type => <div key={type} className="flex items-center gap-2"><Checkbox id={`ins-${type}`} checked={data.insuranceReadiness?.includes(type)} onCheckedChange={() => handleCheckboxChange('insuranceReadiness', type)} disabled={isLocked} /><label htmlFor={`ins-${type}`}>{type}</label></div>)}
           </div>
            <div className="space-y-2">
               <Label>Compliance Readiness</Label>
               {complianceTypes.map(type => <div key={type} className="flex items-center gap-2"><Checkbox id={`comp-${type}`} checked={data.complianceReadiness?.includes(type)} onCheckedChange={() => handleCheckboxChange('complianceReadiness', type)} disabled={isLocked} /><label htmlFor={`comp-${type}`}>{type}</label></div>)}
           </div>
           <div className="space-y-2"><Label>Comfort with formal contract terms/reporting?</Label><Input value={data.comfortWithTerms || ''} onChange={(e) => onChange('comfortWithTerms', e.target.value)} disabled={isLocked} /></div>
           <div className="space-y-2"><Label>Final tender submission approver</Label><Input value={data.submissionApprover || ''} onChange={(e) => onChange('submissionApprover', e.target.value)} disabled={isLocked} /></div>
           <div className="space-y-2"><Label>Contract terms approver</Label><Input value={data.termsApprover || ''} onChange={(e) => onChange('termsApprover', e.target.value)} disabled={isLocked} /></div>
           <div className="space-y-2"><Label>Tender risks to watch for</Label><Textarea value={data.tenderRisks || ''} onChange={(e) => onChange('tenderRisks', e.target.value)} disabled={isLocked} /></div>
        </CardContent>
      </Card>

    </div>
  );
}
