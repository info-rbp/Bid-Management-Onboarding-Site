
"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Package } from 'lucide-react';

interface OfferMenuProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
}

const channels = [
  "Government tenders",
  "Private tenders",
  "Grants",
  "Supplier registrations",
  "Marketplace leads",
  "Direct proposals",
  "Quote requests",
  "Existing clients only",
  "Unsure",
];

export function OfferMenu({ data, onChange, isLocked }: OfferMenuProps) {
  const offers = data.offers || [];

  const handleOfferChange = (index: number, field: string, value: any) => {
    const newOffers = [...offers];
    newOffers[index] = { ...newOffers[index], [field]: value };
    onChange('offers', newOffers);
  };

  const handleAddOffer = () => {
    const newOffers = [...offers, { id: Date.now(), name: '', category: '', description: '' }];
    onChange('offers', newOffers);
  };

  const handleRemoveOffer = (index: number) => {
    const newOffers = offers.filter((_: any, i: number) => i !== index);
    onChange('offers', newOffers);
  };

  const handleOfferCountChange = (value: string) => {
    const count = value === '6+' ? 6 : parseInt(value, 10);
    const currentCount = offers.length;

    if (count > currentCount) {
      const newOffers = Array.from({ length: count - currentCount }, () => ({ id: Date.now(), name: '', category: '', description: '' }));
      onChange('offers', [...offers, ...newOffers]);
    } else if (count < currentCount) {
      onChange('offers', offers.slice(0, count));
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-4xl font-headline font-bold text-slate-900">Offer Menu</h2>
        <p className="text-slate-500 text-lg leading-relaxed">Define your core services, products, or packages. This helps us match you with the right opportunities.</p>
      </div>

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary"><Package className="w-5 h-5" /> <span>Your Offers</span></CardTitle>
          <div className="flex items-center gap-2">
            <Label className="text-sm">How many offers to add?</Label>
            <Select value={offers.length > 5 ? '6+' : offers.length.toString()} onValueChange={handleOfferCountChange} disabled={isLocked}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, '6+'].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {offers.map((offer: any, index: number) => (
            <div key={offer.id} className="p-6 border rounded-2xl bg-slate-50/50 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-lg text-slate-800">Offer #{index + 1}</h4>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveOffer(index)} disabled={isLocked}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Service/Product Name</Label><Input value={offer.name} onChange={(e) => handleOfferChange(index, 'name', e.target.value)} disabled={isLocked} /></div>
                <div className="space-y-2"><Label>Category</Label><Input value={offer.category} onChange={(e) => handleOfferChange(index, 'category', e.target.value)} disabled={isLocked} /></div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={offer.description} onChange={(e) => handleOfferChange(index, 'description', e.target.value)} disabled={isLocked} /></div>
              <div className="space-y-2"><Label>Ideal Client</Label><Textarea value={offer.idealClient} onChange={(e) => handleOfferChange(index, 'idealClient', e.target.value)} disabled={isLocked} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Inclusions</Label><Textarea value={offer.inclusions} onChange={(e) => handleOfferChange(index, 'inclusions', e.target.value)} disabled={isLocked} /></div>
                <div className="space-y-2"><Label>Exclusions</Label><Textarea value={offer.exclusions} onChange={(e) => handleOfferChange(index, 'exclusions', e.target.value)} disabled={isLocked} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Indicative Price/Range</Label><Input value={offer.price} onChange={(e) => handleOfferChange(index, 'price', e.target.value)} disabled={isLocked} /></div>
                  <div className="space-y-2">
                    <Label>Profitability/Priority</Label>
                    <Select value={offer.priority || ''} onValueChange={(v) => handleOfferChange(index, 'priority', v)} disabled={isLocked}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              </div>
              <div className="space-y-2">
                <Label>Suitable Channels</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {channels.map(c => (
                    <div key={c} className="flex items-center gap-2">
                      <input type="checkbox" id={`ch-${index}-${c}`} checked={(offer.channels || []).includes(c)} onChange={(e) => {
                        const newChannels = e.target.checked ? [...(offer.channels || []), c] : (offer.channels || []).filter((i: string) => i !== c);
                        handleOfferChange(index, 'channels', newChannels);
                      }} disabled={isLocked} />
                      <Label htmlFor={`ch-${index}-${c}`} className="text-sm">{c}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle>Overall Offer Strategy</CardTitle></CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2"><Label>Which are your most profitable or strategic services?</Label><Textarea value={data.strategicServices || ''} onChange={(e) => onChange('strategicServices', e.target.value)} disabled={isLocked} /></div>
          <div className="space-y-2"><Label>Are there any services to avoid promoting?</Label><Textarea value={data.avoidServices || ''} onChange={(e) => onChange('avoidServices', e.target.value)} disabled={isLocked} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
