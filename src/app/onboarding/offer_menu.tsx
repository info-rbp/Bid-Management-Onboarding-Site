
"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, CheckCircle2, Info, AlertTriangle, Package, Zap, Target } from 'lucide-react';
import { deriveOfferReadiness } from '@/lib/onboarding-steps';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OfferMenuProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
  allData?: any;
}

const deliveryMethodOptions = [
  { label: "In person", value: "in_person" },
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Depends on service", value: "depends_on_service" },
];

const channelOptions = [
  { label: "Government tenders", value: "government_tenders" },
  { label: "Private tenders", value: "private_tenders" },
  { label: "Grants", value: "grants" },
  { label: "Panel or supplier registrations", value: "panel_supplier_registrations" },
  { label: "Marketplace leads", value: "marketplace_leads" },
  { label: "Direct proposals", value: "direct_proposals" },
  { label: "Quote requests", value: "quote_requests" },
  { label: "Other", value: "other" },
  { label: "Unsure", value: "unsure" },
];

const statusOptions = [
  { label: "Current offer", value: "current_offer" },
  { label: "Idea only", value: "idea_only" },
  { label: "Help needed", value: "help_needed" },
  { label: "Not applicable", value: "not_applicable" },
];

export function OfferMenu({ data, onChange, isLocked }: OfferMenuProps) {
  const offerItems = data.offerItems || [{}];
  const existingPackages = data.existingPackages || [];
  const offerMenu = data.offerMenu || {
    entryLevel: { status: 'help_needed' },
    core: { status: 'help_needed' },
    premium: { status: 'help_needed' },
    emergency: { status: 'help_needed' },
    retainer: { status: 'help_needed' },
    grantFunded: { status: 'help_needed' },
    governmentReady: { status: 'help_needed' },
  };

  const handleAddOfferItem = () => {
    onChange('offerItems', [...offerItems, { id: Math.random().toString(36).substr(2, 9) }]);
  };

  const handleRemoveOfferItem = (index: number) => {
    const newItems = offerItems.filter((_: any, i: number) => i !== index);
    onChange('offerItems', newItems);
  };

  const handleOfferItemChange = (index: number, field: string, value: any) => {
    const newItems = [...offerItems];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange('offerItems', newItems);
  };

  const handleAddPackage = () => {
    onChange('existingPackages', [...existingPackages, { id: Math.random().toString(36).substr(2, 9) }]);
  };

  const handleRemovePackage = (index: number) => {
    const newPackages = existingPackages.filter((_: any, i: number) => i !== index);
    onChange('existingPackages', newPackages);
  };

  const handlePackageChange = (index: number, field: string, value: any) => {
    const newPackages = [...existingPackages];
    newPackages[index] = { ...newPackages[index], [field]: value };
    onChange('existingPackages', newPackages);
  };

  const handleOfferMenuChange = (rowKey: string, field: string, value: any) => {
    onChange('offerMenu', {
      ...offerMenu,
      [rowKey]: { ...offerMenu[rowKey], [field]: value }
    });
  };

  const readiness = deriveOfferReadiness(data);

  return (
    <div className="space-y-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Services, Products and Offer Menu</h2>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-blue-800 text-sm leading-relaxed space-y-3">
          <p>“This section helps us understand what you sell, how your services are delivered, which offers are most important, what should be promoted, what should be avoided, and how each service can be described clearly in future materials.”</p>
          <div className="flex flex-col gap-1 pt-2 font-semibold">
            <p>• List each major service or product separately where possible.</p>
            <p>• If you do not have formal packages yet, write ‘Help needed’ and provide any current pricing or service information you do have.</p>
          </div>
        </div>
      </div>

      {/* GROUP 1: OFFER OVERVIEW */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">1</div>
          <h3 className="text-xl font-bold text-slate-900">Offer Overview</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-base font-bold">5.1 What are your main services or products?</Label>
            <p className="text-sm text-muted-foreground">List the main services, products or solutions your business provides.</p>
            <Textarea 
              value={data.mainServicesProducts || ''} 
              onChange={(e) => onChange('mainServicesProducts', e.target.value)} 
              disabled={isLocked}
              className="rounded-xl min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">5.2 How would you group your services? (Optional)</Label>
            <p className="text-sm text-muted-foreground">Examples: residential, commercial, emergency, consulting, maintenance, installation, training.</p>
            <Textarea 
              value={data.serviceGroups?.join(', ') || ''} 
              onChange={(e) => onChange('serviceGroups', e.target.value.split(',').map(s => s.trim()))} 
              disabled={isLocked}
              className="rounded-xl"
              placeholder="Service group 1, Service group 2..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">5.3 Which services are most profitable or strategically important?</Label>
            <p className="text-sm text-muted-foreground">List the services you most want to promote because they are profitable, strategic or important to growth.</p>
            <Textarea 
              value={data.strategicOrProfitableServices || ''} 
              onChange={(e) => onChange('strategicOrProfitableServices', e.target.value)} 
              disabled={isLocked}
              className="rounded-xl min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">5.4 Which services should we avoid promoting unless specifically approved? (Optional)</Label>
            <p className="text-sm text-muted-foreground">List any services, locations, or job types that should not be promoted unless you specifically approve them.</p>
            <Textarea 
              value={data.servicesToAvoidPromoting || ''} 
              onChange={(e) => onChange('servicesToAvoidPromoting', e.target.value)} 
              disabled={isLocked}
              className="rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* GROUP 2: SERVICE / PRODUCT OFFER CARDS */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">2</div>
          <h3 className="text-xl font-bold text-slate-900">Service / Product Offer Cards</h3>
        </div>

        <div className="space-y-8">
          {offerItems.map((item: any, index: number) => (
            <Card key={index} className="border-2 border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <h4 className="font-bold text-slate-900">Service or Product Details</h4>
                  </div>
                  {offerItems.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveOfferItem(index)} disabled={isLocked} className="text-destructive hover:text-destructive hover:bg-destructive/5 rounded-full">
                      <Trash2 className="w-4 h-4 mr-2" /> Remove Card
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Service or product name</Label>
                    <Input value={item.name || ''} onChange={(e) => handleOfferItemChange(index, 'name', e.target.value)} disabled={isLocked} className="rounded-xl" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</Label>
                    <p className="text-[10px] text-muted-foreground">Describe what this service or product includes in plain English.</p>
                    <Textarea value={item.description || ''} onChange={(e) => handleOfferItemChange(index, 'description', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Ideal customer</Label>
                    <Textarea value={item.idealCustomer || ''} onChange={(e) => handleOfferItemChange(index, 'idealCustomer', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Inclusions</Label>
                    <p className="text-[10px] text-muted-foreground">What is included when this service or product is provided?</p>
                    <Textarea value={item.inclusions || ''} onChange={(e) => handleOfferItemChange(index, 'inclusions', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Exclusions (Optional)</Label>
                    <p className="text-[10px] text-muted-foreground">What is not included or requires separate approval?</p>
                    <Textarea value={item.exclusions || ''} onChange={(e) => handleOfferItemChange(index, 'exclusions', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Delivery timeframe</Label>
                    <p className="text-[10px] text-muted-foreground">Example: same day, 2-3 business days, monthly.</p>
                    <Input value={item.deliveryTimeframe || ''} onChange={(e) => handleOfferItemChange(index, 'deliveryTimeframe', e.target.value)} disabled={isLocked} className="rounded-xl" />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Delivery method</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {deliveryMethodOptions.map(opt => (
                        <div key={opt.value} className="flex items-center gap-2">
                          <Checkbox 
                            id={`delivery-${index}-${opt.value}`}
                            checked={item.deliveryMethod?.includes(opt.value)}
                            onCheckedChange={(checked) => {
                              const current = item.deliveryMethod || [];
                              const next = checked ? [...current, opt.value] : current.filter((v: string) => v !== opt.value);
                              handleOfferItemChange(index, 'deliveryMethod', next);
                            }}
                            disabled={isLocked}
                          />
                          <Label htmlFor={`delivery-${index}-${opt.value}`} className="text-xs font-medium cursor-pointer">{opt.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Price or pricing method</Label>
                    <p className="text-[10px] text-muted-foreground">Fixed price, hourly rate, package pricing, etc.</p>
                    <Textarea value={item.priceOrPricingMethod || ''} onChange={(e) => handleOfferItemChange(index, 'priceOrPricingMethod', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[60px]" />
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Suitable opportunity channels</Label>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {channelOptions.map(opt => (
                        <div key={opt.value} className="flex items-center gap-2">
                          <Checkbox 
                            id={`channel-${index}-${opt.value}`}
                            checked={item.suitableOpportunityChannels?.includes(opt.value)}
                            onCheckedChange={(checked) => {
                              const current = item.suitableOpportunityChannels || [];
                              const next = checked ? [...current, opt.value] : current.filter((v: string) => v !== opt.value);
                              handleOfferItemChange(index, 'suitableOpportunityChannels', next);
                            }}
                            disabled={isLocked}
                          />
                          <Label htmlFor={`channel-${index}-${opt.value}`} className="text-xs font-medium cursor-pointer">{opt.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Button onClick={handleAddOfferItem} disabled={isLocked} variant="outline" className="w-full h-16 border-dashed border-2 rounded-2xl hover:bg-slate-50 font-bold gap-2">
            <Plus className="w-4 h-4" /> Add Another Service/Product
          </Button>
        </div>
      </section>

      {/* GROUP 3: PACKAGES AND OFFER MENU */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">3</div>
          <h3 className="text-xl font-bold text-slate-900">Packages and Offer Menu</h3>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <Label className="text-base font-bold">5.8 Do you have any additional services, products or packages that should be included? (Optional)</Label>
            <Textarea value={data.additionalServicesProductsPackages || ''} onChange={(e) => onChange('additionalServicesProductsPackages', e.target.value)} disabled={isLocked} className="rounded-xl" />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-bold">5.9 Can any of your services be packaged into fixed-price offers?</Label>
            <RadioGroup value={data.fixedPricePackagePotential} onValueChange={(v) => onChange('fixedPricePackagePotential', v)} disabled={isLocked} className="flex gap-6">
              {['yes', 'no', 'unsure'].map(val => (
                <div key={val} className="flex items-center gap-2">
                  <RadioGroupItem value={val} id={`potential-${val}`} />
                  <Label htmlFor={`potential-${val}`} className="capitalize">{val}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-bold">5.10 Describe any existing service packages, bundles, retainers or fixed-price offers. (Optional)</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {existingPackages.map((pkg: any, idx: number) => (
                <Card key={idx} className="border-2 border-slate-100 rounded-3xl relative pt-8">
                  <Button variant="ghost" size="sm" onClick={() => handleRemovePackage(idx)} disabled={isLocked} className="absolute top-2 right-2 text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Package Name</Label>
                      <Input value={pkg.packageName || ''} onChange={(e) => handlePackageChange(idx, 'packageName', e.target.value)} disabled={isLocked} className="rounded-lg h-8" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Inclusions</Label>
                      <Textarea value={pkg.inclusions || ''} onChange={(e) => handlePackageChange(idx, 'inclusions', e.target.value)} disabled={isLocked} className="rounded-lg min-h-[60px] text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Price</Label>
                      <Input value={pkg.price || ''} onChange={(e) => handlePackageChange(idx, 'price', e.target.value)} disabled={isLocked} className="rounded-lg h-8" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button onClick={handleAddPackage} variant="outline" disabled={isLocked} className="h-full min-h-[150px] border-dashed border-2 rounded-3xl flex flex-col gap-2">
                <Plus className="w-4 h-4" />
                <span className="text-xs font-bold">Add Package Card</span>
              </Button>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-base font-bold">5.11 Structured Offer Menu Matrix</Label>
              <p className="text-sm text-muted-foreground">If unsure, write ‘Help needed’ in the name or description fields.</p>
            </div>
            
            <div className="overflow-x-auto rounded-3xl border border-slate-100 shadow-sm">
              <table className="w-full text-left border-collapse bg-white">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-1/4">Offer Category</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-1/4">Name / Idea</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-1/4">Description</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-1/6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {['entryLevel', 'core', 'premium', 'emergency', 'retainer', 'grantFunded', 'governmentReady'].map((key) => {
                    const row = offerMenu[key] || { status: 'help_needed' };
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                    return (
                      <tr key={key}>
                        <td className="p-4 font-bold text-slate-700 text-sm">{label}</td>
                        <td className="p-4">
                          <Input 
                            value={row.offerNameOrIdea || ''} 
                            onChange={(e) => handleOfferMenuChange(key, 'offerNameOrIdea', e.target.value)} 
                            disabled={isLocked || row.status === 'not_applicable'} 
                            placeholder="Offer name"
                            className="h-8 rounded-lg text-xs"
                          />
                        </td>
                        <td className="p-4">
                          <Textarea 
                            value={row.description || ''} 
                            onChange={(e) => handleOfferMenuChange(key, 'description', e.target.value)} 
                            disabled={isLocked || row.status === 'not_applicable'} 
                            placeholder="Short description"
                            className="min-h-[40px] rounded-lg text-xs py-2"
                          />
                        </td>
                        <td className="p-4">
                          <Select 
                            value={row.status} 
                            onValueChange={(v) => handleOfferMenuChange(key, 'status', v)}
                            disabled={isLocked}
                          >
                            <SelectTrigger className="h-8 text-xs rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* GROUP 4: DELIVERY AND CONDITIONS */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">4</div>
          <h3 className="text-xl font-bold text-slate-900">Delivery and Conditions</h3>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <Label className="text-base font-bold">5.12 How quickly can you usually deliver your main services?</Label>
            <p className="text-sm text-muted-foreground italic">Include turnaround options, waiting periods, booking requirements.</p>
            <Textarea value={data.generalDeliverySpeed || ''} onChange={(e) => onChange('generalDeliverySpeed', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-bold">5.13 Are your services delivered in person, remotely or both?</Label>
            <div className="flex flex-wrap gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {deliveryMethodOptions.map(opt => (
                <div key={opt.value} className="flex items-center gap-2">
                  <Checkbox 
                    id={`mode-${opt.value}`}
                    checked={data.businessDeliveryModes?.includes(opt.value)}
                    onCheckedChange={(checked) => {
                      const current = data.businessDeliveryModes || [];
                      const next = checked ? [...current, opt.value] : current.filter((v: string) => v !== opt.value);
                      onChange('businessDeliveryModes', next);
                    }}
                    disabled={isLocked}
                  />
                  <Label htmlFor={`mode-${opt.value}`} className="text-sm font-medium cursor-pointer">{opt.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">5.14 What locations, regions or service areas can you cover?</Label>
            <p className="text-sm text-muted-foreground">Include suburbs, cities, regions, states, or travel limits.</p>
            <Textarea value={data.serviceAreas || ''} onChange={(e) => onChange('serviceAreas', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">5.15 What does the client or customer need to provide or do for you to deliver successfully?</Label>
            <p className="text-sm text-muted-foreground">Examples: site access, approvals, documents, photos, deposits, briefing calls.</p>
            <Textarea value={data.clientResponsibilities || ''} onChange={(e) => onChange('clientResponsibilities', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">5.16 What terms, assumptions or conditions should be included? (Optional)</Label>
            <p className="text-sm text-muted-foreground italic">Travel, validity periods, client responsibilities, scope assumptions.</p>
            <Textarea value={data.serviceTermsAssumptionsConditions || ''} onChange={(e) => onChange('serviceTermsAssumptionsConditions', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" />
          </div>
        </div>
      </section>

      {/* Summary Card */}
      {data.mainServicesProducts && (
        <Card className="bg-slate-900 border-none rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardContent className="p-10 space-y-10">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Offer Readiness Summary</h3>
                <p className="text-slate-400 text-sm">Based on your provided details.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Package className="w-3 h-3" /> Offer Structure
                </p>
                <div className="space-y-3">
                  <ReadinessBadge active={readiness.hasStructuredServiceItems} label="Structured Offer Items" />
                  <ReadinessBadge active={readiness.hasPricingGuidance} label="Pricing Guidance Provided" />
                  <ReadinessBadge active={readiness.hasFixedPricePotential} label="Fixed-Price Potential" />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-3 h-3" /> Channel Readiness
                </p>
                <div className="space-y-3">
                  <ReadinessBadge active={readiness.hasMarketplaceReadyOffers} label="Marketplace Ready" />
                  <ReadinessBadge active={readiness.hasTenderReadyOffers} label="Tender Ready" />
                  <ReadinessBadge active={readiness.hasGrantFundedOfferIdeas} label="Grant Funded Ideas" />
                  <ReadinessBadge active={readiness.hasQuoteReadyInformation} label="Quote Ready" />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-3 h-3" /> Delivery & Scope
                </p>
                <div className="space-y-2">
                   <p className="text-xs text-slate-300 font-medium">Areas: <span className="text-slate-500">{data.serviceAreas}</span></p>
                   <p className="text-xs text-slate-300 font-medium">Speed: <span className="text-slate-500 line-clamp-1">{data.generalDeliverySpeed}</span></p>
                   {readiness.hasServiceRestrictions && (
                     <div className="mt-4 flex items-center gap-2 text-orange-400">
                       <AlertTriangle className="w-4 h-4" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">Service Restrictions Active</span>
                     </div>
                   )}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 text-center">
              <p className="text-sm text-slate-400 italic">
                “Based on your offer details, we can prepare service descriptions for marketplace profiles, direct proposals, quotes and tender responses.”
              </p>
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
      <span className="text-xs font-bold">{label}</span>
    </div>
  );
}
