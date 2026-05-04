
"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { UploadCloud, Plus, Trash2, ShieldCheck } from 'lucide-react';

interface ComplianceInsuranceProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
}

const insuranceTypes = [
  { key: 'publicLiability', label: 'Public Liability', defaultLimit: '10M' },
  { key: 'professionalIndemnity', label: 'Professional Indemnity', defaultLimit: '1M' },
  { key: 'workersComp', label: 'Workers Compensation', defaultLimit: 'N/A' },
  { key: 'productLiability', label: 'Product Liability', defaultLimit: '' },
  { key: 'cyberInsurance', label: 'Cyber Insurance', defaultLimit: '' },
  { key: 'other', label: 'Other', defaultLimit: '' },
];

const complianceTypes = [
  { key: 'iso9001', label: 'ISO 9001 (Quality)' },
  { key: 'iso14001', label: 'ISO 14001 (Environmental)' },
  { key: 'iso45001', label: 'ISO 45001 (OH&S)' },
  { key: 'iso27001', label: 'ISO 27001 (InfoSec)' },
  { key: 'soc2', label: 'SOC 2' },
  { key: 'disp', label: 'DISP' },
  { key: 'other', label: 'Other' },
];

export function ComplianceInsurance({ data, onChange, isLocked }: ComplianceInsuranceProps) {
  const insurances = data.insurances || {};
  const compliances = data.compliances || {};

  const handleInsuranceChange = (type: string, field: string, value: any) => {
    onChange('insurances', {
      ...insurances,
      [type]: { ...insurances[type], [field]: value },
    });
  };

  const handleComplianceChange = (type: string, field: string, value: any) => {
    onChange('compliances', {
      ...compliances,
      [type]: { ...compliances[type], [field]: value },
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-4xl font-headline font-bold text-slate-900">Compliance & Insurance</h2>
        <p className="text-slate-500 text-lg">Detail your insurance coverage and compliance certifications.</p>
      </div>

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle className="flex items-center gap-2 text-primary"><ShieldCheck className="w-5 h-5" /> Insurance Details</CardTitle></CardHeader>
        <CardContent className="p-6 space-y-6">
          {insuranceTypes.map(type => (
            <div key={type.key} className="p-4 border rounded-2xl bg-slate-50/50">
              <div className="flex items-start gap-4">
                <Checkbox 
                  id={`ins-check-${type.key}`} 
                  checked={!!insurances[type.key]}
                  onCheckedChange={(checked) => handleInsuranceChange(type.key, 'held', checked)}
                  disabled={isLocked}
                />
                <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Label htmlFor={`ins-check-${type.key}`} className="font-bold col-span-3">{type.label}</Label>
                  {insurances[type.key] && (
                    <>
                      <div className="space-y-2"><Label>Limit</Label><Input value={insurances[type.key]?.limit || type.defaultLimit} onChange={(e) => handleInsuranceChange(type.key, 'limit', e.target.value)} disabled={isLocked} /></div>
                      <div className="space-y-2"><Label>Expiry</Label><Input type="date" value={insurances[type.key]?.expiry || ''} onChange={(e) => handleInsuranceChange(type.key, 'expiry', e.target.value)} disabled={isLocked} /></div>
                      <div className="space-y-2 self-end"><Button variant="outline" size="sm" disabled={isLocked}><UploadCloud className="w-4 h-4 mr-2" />Certificate</Button></div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle>Compliance & Certifications</CardTitle></CardHeader>
        <CardContent className="p-6 space-y-6">
           {complianceTypes.map(type => (
            <div key={type.key} className="p-4 border rounded-2xl bg-slate-50/50">
              <div className="flex items-start gap-4">
                <Checkbox 
                  id={`comp-check-${type.key}`} 
                  checked={!!compliances[type.key]}
                  onCheckedChange={(checked) => handleComplianceChange(type.key, 'held', checked)}
                  disabled={isLocked}
                />
                <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Label htmlFor={`comp-check-${type.key}`} className="font-bold col-span-3">{type.label}</Label>
                  {compliances[type.key] && (
                    <>
                      <div className="space-y-2"><Label>Certification ID</Label><Input value={compliances[type.key]?.id || ''} onChange={(e) => handleComplianceChange(type.key, 'id', e.target.value)} disabled={isLocked} /></div>
                      <div className="space-y-2"><Label>Expiry</Label><Input type="date" value={compliances[type.key]?.expiry || ''} onChange={(e) => handleComplianceChange(type.key, 'expiry', e.target.value)} disabled={isLocked} /></div>
                      <div className="space-y-2 self-end"><Button variant="outline" size="sm" disabled={isLocked}><UploadCloud className="w-4 h-4 mr-2" />Certificate</Button></div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
