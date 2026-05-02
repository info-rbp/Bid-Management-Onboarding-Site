
"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, UserPlus, Building, MapPin, Phone, Mail, Link as LinkIcon, Users } from 'lucide-react';

interface BusinessSnapshotProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
}

const contactResponsibilities = [
  "Primary contact",
  "Secondary contact",
  "Final decision-maker",
  "Pricing/commercial approval",
  "Compliance documents",
  "Insurance documents",
  "Licences/certifications",
  "Document collection",
  "Platform access coordination",
  "Urgent approvals",
  "Technical questions",
  "General backup contact",
  "Other",
];

export function BusinessSnapshot({ data, onChange, isLocked }: BusinessSnapshotProps) {
  const contacts = data.contacts || [];

  const handleContactChange = (index: number, field: string, value: any) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    onChange('contacts', newContacts);
  };

  const handleAddContact = () => {
    if (contacts.length < 5) {
      const newContacts = [...contacts, { id: Date.now(), fullName: '', role: '', email: '', phone: '', responsibilities: [] }];
      onChange('contacts', newContacts);
    }
  };

  const handleRemoveContact = (index: number) => {
    const newContacts = contacts.filter((_: any, i: number) => i !== index);
    onChange('contacts', newContacts);
  };

  const handleContactCountChange = (value: string) => {
    const count = parseInt(value, 10);
    const currentCount = contacts.length;
    if (count > currentCount) {
      const newContacts = Array.from({ length: count - currentCount }, () => ({ id: Date.now(), fullName: '', role: '', email: '', phone: '', responsibilities: [] }));
      onChange('contacts', [...contacts, ...newContacts]);
    } else if (count < currentCount) {
      onChange('contacts', contacts.slice(0, count));
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-4xl font-headline font-bold text-slate-900">Business Snapshot</h2>
        <p className="text-slate-500 text-lg leading-relaxed">Provide your core business details and identify key contacts for our team.</p>
      </div>

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-primary"><Building className="w-5 h-5" /> <span>Business Details</span></CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2"><Label>Registered Business Name</Label><Input value={data.registeredName || ''} onChange={(e) => onChange('registeredName', e.target.value)} disabled={isLocked} /></div>
          <div className="space-y-2"><Label>Trading Name</Label><Input value={data.tradingName || ''} onChange={(e) => onChange('tradingName', e.target.value)} disabled={isLocked} /></div>
          <div className="space-y-2"><Label>ABN</Label><Input value={data.abn || ''} onChange={(e) => onChange('abn', e.target.value)} disabled={isLocked} /></div>
          <div className="space-y-2"><Label>ACN</Label><Input value={data.acn || ''} onChange={(e) => onChange('acn', e.target.value)} disabled={isLocked} /></div>
          <div className="space-y-2">
            <Label>Business Structure</Label>
            <Select value={data.structure || ''} onValueChange={(v) => onChange('structure', v)} disabled={isLocked}>
              <SelectTrigger><SelectValue placeholder="Select structure" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sole_trader">Sole Trader</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="trust">Trust</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Year Started</Label><Input type="number" value={data.yearStarted || ''} onChange={(e) => onChange('yearStarted', e.target.value)} disabled={isLocked} /></div>
          <div className="md:col-span-2 space-y-2"><Label>Registered Address</Label><Input value={data.registeredAddress || ''} onChange={(e) => onChange('registeredAddress', e.target.value)} disabled={isLocked} /></div>
          <div className="md:col-span-2 space-y-2"><Label>Operating Address</Label><Input value={data.operatingAddress || ''} onChange={(e) => onChange('operatingAddress', e.target.value)} disabled={isLocked} /></div>
          <div className="md:col-span-2 space-y-2"><Label>Postal Address</Label><Input value={data.postalAddress || ''} onChange={(e) => onChange('postalAddress', e.target.value)} disabled={isLocked} /></div>
          <div className="space-y-2"><Label>Business Phone</Label><Input value={data.businessPhone || ''} onChange={(e) => onChange('businessPhone', e.target.value)} disabled={isLocked} /></div>
          <div className="space-y-2"><Label>Business Email</Label><Input type="email" value={data.businessEmail || ''} onChange={(e) => onChange('businessEmail', e.target.value)} disabled={isLocked} /></div>
          <div className="md:col-span-2 space-y-2"><Label>Website</Label><Input value={data.website || ''} onChange={(e) => onChange('website', e.target.value)} disabled={isLocked} /></div>
          <div className="md:col-span-2 space-y-2"><Label>Social Media Links</Label><Input value={data.socialMedia || ''} onChange={(e) => onChange('socialMedia', e.target.value)} disabled={isLocked} /></div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary"><Users className="w-5 h-5" /> <span>Key Contacts</span></CardTitle>
          <div className="flex items-center gap-2">
            <Label className="text-sm">How many contacts?</Label>
            <Select value={contacts.length.toString()} onValueChange={handleContactCountChange} disabled={isLocked}>
              <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {contacts.map((contact: any, index: number) => (
            <div key={contact.id} className="p-6 border rounded-2xl bg-slate-50/50 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-lg text-slate-800">Contact #{index + 1}</h4>
                {index > 0 && <Button variant="ghost" size="icon" onClick={() => handleRemoveContact(index)} disabled={isLocked}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Full Name</Label><Input value={contact.fullName} onChange={(e) => handleContactChange(index, 'fullName', e.target.value)} disabled={isLocked} /></div>
                <div className="space-y-2"><Label>Role/Title</Label><Input value={contact.role} onChange={(e) => handleContactChange(index, 'role', e.target.value)} disabled={isLocked} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={contact.email} onChange={(e) => handleContactChange(index, 'email', e.target.value)} disabled={isLocked} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={contact.phone} onChange={(e) => handleContactChange(index, 'phone', e.target.value)} disabled={isLocked} /></div>
              </div>
              <div className="space-y-2">
                <Label>Responsibilities</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {contactResponsibilities.map(resp => (
                    <div key={resp} className="flex items-center gap-2">
                      <input type="checkbox" id={`resp-${index}-${resp}`} checked={(contact.responsibilities || []).includes(resp)} onChange={(e) => {
                        const newResps = e.target.checked ? [...(contact.responsibilities || []), resp] : (contact.responsibilities || []).filter((r: string) => r !== resp);
                        handleContactChange(index, 'responsibilities', newResps);
                      }} disabled={isLocked} />
                      <Label htmlFor={`resp-${index}-${resp}`} className="text-sm">{resp}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
