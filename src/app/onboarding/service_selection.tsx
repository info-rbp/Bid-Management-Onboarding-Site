
"use client";

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Star, Target, ShieldQuestion, Construction } from 'lucide-react';

interface ServiceSelectionProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
}

const SERVICES = [
  "Government Tenders",
  "Private Tenders",
  "Panel or Supplier Registrations",
  "Grants",
  "Marketplace Leads",
  "Direct Proposals",
  "Quote Requests",
  "Unsure, please recommend",
];

export function ServiceSelection({ data, onChange, isLocked }: ServiceSelectionProps) {
  const selectedServices = data.selectedServices || [];

  const handleServiceChange = (service: string) => {
    if (isLocked) return;
    const next = selectedServices.includes(service)
      ? selectedServices.filter((s: string) => s !== service)
      : [...selectedServices, service];
    onChange('selectedServices', next);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-4xl font-headline font-bold text-slate-900">Service Selection</h2>
        <p className="text-slate-500 text-lg leading-relaxed">Select the services you want Bid Manager to support. Your choices here will unlock relevant sections in the sidebar.</p>
      </div>

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-primary"><Sparkles className="w-5 h-5" /> <span>Available Services</span></CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SERVICES.map(service => (
              <div
                key={service}
                onClick={() => handleServiceChange(service)}
                className={`p-6 rounded-2xl border-2 transition-all flex items-center justify-between ${isLocked ? 'cursor-default' : 'cursor-pointer'} ${selectedServices.includes(service) ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <span className="font-bold text-slate-700">{service}</span>
                <Checkbox checked={selectedServices.includes(service)} readOnly disabled={isLocked} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedServices.length > 0 && (
        <>
          <Card className="border-none shadow-sm rounded-3xl bg-white">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-primary"><Star className="w-5 h-5" /> <span>Priorities</span></CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="font-bold">Which is your single highest priority service?</Label>
                <RadioGroup value={data.priority || ''} onValueChange={(v) => onChange('priority', v)} disabled={isLocked} className="mt-2 space-y-2">
                  {selectedServices.map((s: string) => (
                    <div key={s} className="flex items-center gap-2"><RadioGroupItem value={s} id={s} /><Label htmlFor={s}>{s}</Label></div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl bg-white">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-primary"><Target className="w-5 h-5" /> <span>Goals & Exclusions</span></CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Why are these services important to you right now?</Label>
                <Textarea value={data.importance || ''} onChange={(e) => onChange('importance', e.target.value)} disabled={isLocked} />
              </div>
              <div className="space-y-2">
                <Label>What are your desired outcomes from our support?</Label>
                <Textarea value={data.outcomes || ''} onChange={(e) => onChange('outcomes', e.target.value)} disabled={isLocked} />
              </div>
              <div className="space-y-2">
                <Label>Are there any services or activities we should specifically exclude?</Label>
                <Textarea value={data.exclusions || ''} onChange={(e) => onChange('exclusions', e.target.value)} disabled={isLocked} />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
