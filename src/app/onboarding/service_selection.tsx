
"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface ServiceSelectionProps {
  data: {
    selectedServices?: string[];
  };
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
}

const availableServices = [
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

  const handleServiceChange = (service: string, checked: boolean) => {
    if (isLocked) return;
    const newSelection = checked
      ? [...selectedServices, service]
      : selectedServices.filter(s => s !== service);
    onChange('selectedServices', newSelection);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800">Service Selection</h2>
      <p className="mt-2 text-sm text-slate-500">Select the services you're interested in to tailor your onboarding experience.</p>
      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableServices.map((service) => (
            <div
              key={service}
              onClick={() => handleServiceChange(service, !selectedServices.includes(service))}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedServices.includes(service) ? 'border-primary bg-primary/5' : 'border-slate-200'} ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}`}
            >
              <span className="font-bold text-slate-700">{service}</span>
              <Checkbox checked={selectedServices.includes(service)} disabled={isLocked} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
