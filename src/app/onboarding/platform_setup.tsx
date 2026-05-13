
"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, CheckCircle2, Info, AlertTriangle, ShieldCheck, Globe, Key, Settings, Bell, DollarSign, Ban, Smartphone } from 'lucide-react';
import { derivePlatformReadiness } from '@/lib/onboarding-steps';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PlatformSetupProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
  fieldErrors?: Record<string, string>;
  allData?: any;
}

const existingPlatformOptions = [
  { label: "Airtasker", value: "airtasker" },
  { label: "Bark", value: "bark" },
  { label: "ServiceSeeking", value: "serviceseeking" },
  { label: "Oneflare", value: "oneflare" },
  { label: "hipages", value: "hipages" },
  { label: "Upwork", value: "upwork" },
  { label: "Freelancer", value: "freelancer" },
  { label: "Fiverr", value: "fiverr" },
  { label: "TenderLink", value: "tenderlink" },
  { label: "AusTender", value: "austender" },
  { label: "GrantConnect", value: "grantconnect" },
  { label: "Local council portals", value: "local_council_portals" },
  { label: "State government tender portals", value: "state_government_tender_portals" },
  { label: "Corporate supplier portals", value: "corporate_supplier_portals" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "Other", value: "other" },
  { label: "None", value: "none" },
  { label: "Unsure", value: "unsure" },
];

const setupImproveOptions = existingPlatformOptions.filter(opt => !['none', 'unsure'].includes(opt.value)).concat([
  { label: "Unsure, please recommend", value: "unsure_recommend" }
]);

const accessMethodOptions = [
  { label: "We submit internally using documents prepared by Bid Manager", value: "client_submits_internally_using_bid_manager_documents" },
  { label: "We provide delegated access where possible", value: "delegated_access_where_possible" },
  { label: "We screen-share when needed", value: "screen_share_when_needed" },
  { label: "We will decide case by case", value: "decide_case_by_case" },
  { label: "Unsure", value: "unsure" },
];

export function PlatformSetup({ data, onChange, isLocked, allData }: PlatformSetupProps) {
  const existingAccounts = data.existingAccounts || [];
  const setupOrImprove = data.setupOrImprove || [];
  const alertRecipients = data.alertRecipients || [];
  const accessController = data.accessController || { notes: '' };

  const handleExistingToggle = (value: string) => {
    if (isLocked) return;
    let next = [...existingAccounts];
    if (value === 'none') {
      next = ['none'];
    } else {
      next = next.filter(v => v !== 'none');
      if (next.includes(value)) {
        next = next.filter(v => v !== value);
      } else {
        next.push(value);
      }
    }
    onChange('existingAccounts', next);
  };

  const handleSetupToggle = (value: string) => {
    if (isLocked) return;
    const next = setupOrImprove.includes(value) 
      ? setupOrImprove.filter((v: string) => v !== value) 
      : [...setupOrImprove, value];
    onChange('setupOrImprove', next);
  };

  const handleAddAlertRecipient = () => {
    onChange('alertRecipients', [...alertRecipients, { id: Math.random().toString(36).substr(2, 9) }]);
  };

  const handleRemoveAlertRecipient = (index: number) => {
    onChange('alertRecipients', alertRecipients.filter((_: any, i: number) => i !== index));
  };

  const handleAlertRecipientChange = (index: number, field: string, value: any) => {
    const next = [...alertRecipients];
    next[index] = { ...next[index], [field]: value };
    onChange('alertRecipients', next);
  };

  const readiness = derivePlatformReadiness(data);

  return (
    <div className="space-y-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Platform and Channel Setup</h2>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-blue-800 text-sm leading-relaxed space-y-2">
          <p>“This section helps us understand what platforms you already use, what profiles or accounts may need to be created or improved, and how access should be managed securely.”</p>
          <div className="flex items-center gap-2 font-bold pt-2 text-red-600">
            <ShieldCheck className="w-4 h-4" />
            <span>Do not provide passwords in this form.</span>
          </div>
        </div>
      </div>

      {/* GROUP 1: EXISTING PLATFORMS */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">1</div>
          <h3 className="text-xl font-bold text-slate-900">Existing Platforms</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-bold">10.1 Which platforms do you already have accounts for?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              {existingPlatformOptions.map(opt => (
                <div key={opt.value} className="flex items-center gap-2">
                  <Checkbox 
                    id={`exist-${opt.value}`}
                    checked={existingAccounts.includes(opt.value)}
                    onCheckedChange={() => handleExistingToggle(opt.value)}
                    disabled={isLocked}
                  />
                  <Label htmlFor={`exist-${opt.value}`} className="text-xs font-medium cursor-pointer leading-tight">{opt.label}</Label>
                </div>
              ))}
            </div>
            {existingAccounts.includes('other') && (
              <Input value={data.otherExistingPlatform || ''} onChange={(e) => onChange('otherExistingPlatform', e.target.value)} placeholder="Please specify other platform" disabled={isLocked} className="rounded-xl mt-2" />
            )}
          </div>
        </div>
      </section>

      {/* GROUP 2: PLATFORM SETUP PRIORITIES */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">2</div>
          <h3 className="text-xl font-bold text-slate-900">Platform Setup Priorities</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-bold">10.2 Which platforms do you want help setting up or improving?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              {setupImproveOptions.map(opt => (
                <div key={opt.value} className="flex items-center gap-2">
                  <Checkbox 
                    id={`setup-${opt.value}`}
                    checked={setupOrImprove.includes(opt.value)}
                    onCheckedChange={() => handleSetupToggle(opt.value)}
                    disabled={isLocked}
                  />
                  <Label htmlFor={`setup-${opt.value}`} className="text-xs font-medium cursor-pointer leading-tight">{opt.label}</Label>
                </div>
              ))}
            </div>
            {setupOrImprove.includes('other') && (
              <Input value={data.otherSetupOrImprovePlatform || ''} onChange={(e) => onChange('otherSetupOrImprovePlatform', e.target.value)} placeholder="Please specify other platform" disabled={isLocked} className="rounded-xl mt-2" />
            )}
          </div>
        </div>
      </section>

      {/* GROUP 3: ACCESS AND SECURITY */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">3</div>
          <h3 className="text-xl font-bold text-slate-900">Access and Security</h3>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <Label className="text-base font-bold">10.3 Who controls usernames, passwords and multi-factor authentication?</Label>
              <div className="flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" />
                Do not provide passwords here.
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={accessController.contactType} onValueChange={(v) => onChange('accessController', { ...accessController, contactType: v })} disabled={isLocked}>
                <SelectTrigger className="rounded-xl h-12">
                  <SelectValue placeholder="Select access controller" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary_contact">Primary Contact</SelectItem>
                  <SelectItem value="secondary_contact">Secondary Contact</SelectItem>
                  <SelectItem value="section_2_final_decision_maker">Final Decision Maker</SelectItem>
                  <SelectItem value="section_2_urgent_approval_contact">Urgent Approval Contact</SelectItem>
                  <SelectItem value="custom">Custom Person</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {accessController.contactType === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                <Input placeholder="Full Name" value={accessController.fullName || ''} onChange={(e) => onChange('accessController', { ...accessController, fullName: e.target.value })} disabled={isLocked} className="rounded-xl" />
                <Input placeholder="Email" value={accessController.email || ''} onChange={(e) => onChange('accessController', { ...accessController, email: e.target.value })} disabled={isLocked} className="rounded-xl" />
              </div>
            )}
            <Textarea 
              placeholder="Access notes (e.g., 'Stored in LastPass', 'Requires SMS to CEO's mobile')..." 
              value={accessController.notes || ''} 
              onChange={(e) => onChange('accessController', { ...accessController, notes: e.target.value })} 
              disabled={isLocked} 
              className="rounded-xl min-h-[80px]"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-bold">10.4 What access method do you prefer?</Label>
            <RadioGroup value={data.preferredAccessMethod} onValueChange={(v) => onChange('preferredAccessMethod', v)} disabled={isLocked} className="grid grid-cols-1 gap-3">
              {accessMethodOptions.map(opt => (
                <div key={opt.value} className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <RadioGroupItem value={opt.value} id={`access-${opt.value}`} />
                  <Label htmlFor={`access-${opt.value}`} className="text-sm font-semibold">{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </section>

      {/* GROUP 4: COSTS, ALERTS AND RESTRICTIONS */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">4</div>
          <h3 className="text-xl font-bold text-slate-900">Costs, Alerts and Restrictions</h3>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-base font-bold">10.5 Are you willing to pay for platform memberships or lead fees?</Label>
            <RadioGroup value={data.paidPlatformWillingness} onValueChange={(v) => onChange('paidPlatformWillingness', v)} disabled={isLocked} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
                { label: 'Maybe, with approval', value: 'maybe_with_approval' },
                { label: 'Depends on cost', value: 'depends_on_platform_and_cost' },
              ].map(opt => (
                <div key={opt.value} className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <RadioGroupItem value={opt.value} id={`pay-${opt.value}`} />
                  <Label htmlFor={`pay-${opt.value}`} className="text-xs font-semibold">{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">10.6 Monthly budget for paid platforms (Optional)</Label>
            <p className="text-sm text-muted-foreground italic">e.g., "$100", "$200-$500", or "Unsure"</p>
            <Input value={data.monthlyPlatformBudget || ''} onChange={(e) => onChange('monthlyPlatformBudget', e.target.value)} disabled={isLocked} className="rounded-xl max-w-xs" />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-bold">10.7 Who should receive platform alerts and notifications?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alertRecipients.map((rec: any, idx: number) => (
                <Card key={idx} className="border-2 border-slate-100 rounded-2xl p-4 relative pt-10">
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveAlertRecipient(idx)} disabled={isLocked} className="absolute top-2 right-2 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  <div className="space-y-3">
                    <Select value={rec.contactType} onValueChange={(v) => handleAlertRecipientChange(idx, 'contactType', v)} disabled={isLocked}>
                       <SelectTrigger className="h-9 rounded-lg">
                          <SelectValue placeholder="Select contact type" />
                       </SelectTrigger>
                       <SelectContent>
                          <SelectItem value="primary_contact">Primary Contact</SelectItem>
                          <SelectItem value="secondary_contact">Secondary Contact</SelectItem>
                          <SelectItem value="section_2_final_decision_maker">Final Decision Maker</SelectItem>
                          <SelectItem value="section_2_urgent_approval_contact">Urgent Approver</SelectItem>
                          <SelectItem value="section_2_pricing_contact">Pricing Contact</SelectItem>
                          <SelectItem value="section_2_compliance_contact">Compliance Contact</SelectItem>
                          <SelectItem value="custom">Custom Recipient</SelectItem>
                       </SelectContent>
                    </Select>
                    {rec.contactType === 'custom' && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                        <Input placeholder="Name" value={rec.fullName || ''} onChange={(e) => handleAlertRecipientChange(idx, 'fullName', e.target.value)} disabled={isLocked} className="h-8 text-xs rounded-lg" />
                        <Input placeholder="Email" value={rec.email || ''} onChange={(e) => handleAlertRecipientChange(idx, 'email', e.target.value)} disabled={isLocked} className="h-8 text-xs rounded-lg" />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              <Button onClick={handleAddAlertRecipient} variant="outline" disabled={isLocked} className="h-full min-h-[100px] border-dashed border-2 rounded-2xl flex flex-col gap-2">
                <Bell className="w-5 h-5" />
                <span className="text-xs font-bold">Add Recipient</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">10.8 Brand tone, service offer or profile process requirements (Optional)</Label>
            <p className="text-sm text-muted-foreground leading-relaxed italic">Preferred tone, contact process, brand requirements, etc.</p>
            <Textarea value={data.profileToneOfferContactProcess || ''} onChange={(e) => onChange('profileToneOfferContactProcess', e.target.value)} disabled={isLocked} className="rounded-2xl min-h-[100px]" />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">10.9 Are there any platform restrictions or 'no-go' profiles? (Optional)</Label>
            <p className="text-sm text-muted-foreground leading-relaxed italic">Platforms Bid Manager should not access or update without approval.</p>
            <Textarea value={data.platformRestrictions || ''} onChange={(e) => onChange('platformRestrictions', e.target.value)} disabled={isLocked} className="rounded-2xl min-h-[100px]" />
          </div>
        </div>
      </section>

      {/* Summary Card */}
      {(existingAccounts.length > 0 || setupOrImprove.length > 0) && (
        <Card className="bg-slate-900 border-none rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardContent className="p-10 space-y-10">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Globe className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Platform Setup Summary</h3>
                <p className="text-slate-400 text-sm">Channel configuration & access model.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Settings className="w-3 h-3" /> Priorities
                </p>
                <div className="space-y-3">
                  <ReadinessBadge active={readiness.hasExistingPlatforms} label="Existing Accounts Identified" />
                  <ReadinessBadge active={readiness.setupPrioritiesSelected} label={`${setupOrImprove.length} Setup Priorities`} />
                  <ReadinessBadge active={readiness.marketplacePlatformsSelected} label="Marketplace Integration" />
                  <ReadinessBadge active={readiness.tenderPlatformsSelected} label="Procurement Portals" />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Key className="w-3 h-3" /> Access & Budget
                </p>
                <div className="space-y-3">
                  <ReadinessBadge active={readiness.accessControllerIdentified} label="Access Controller Mapped" />
                  <ReadinessBadge active={readiness.paidPlatformsAllowed} label="Paid Channels Authorized" />
                  <ReadinessBadge active={readiness.hasPlatformBudget} label="Budget Defined" />
                  <ReadinessBadge active={readiness.delegatedAccessPreferred} label="Delegated Access Model" />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Smartphone className="w-3 h-3" /> Governance
                </p>
                <div className="space-y-3">
                  <ReadinessBadge active={readiness.hasAlertRecipients} label="Notifications Routing Active" />
                  <ReadinessBadge active={readiness.hasProfileInstructions} label="Brand Guidelines Provided" />
                  {readiness.hasPlatformRestrictions && (
                    <div className="flex items-center gap-2 text-red-400 px-4 py-2 bg-red-400/5 rounded-xl border border-red-400/20">
                      <Ban className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase">Usage Restrictions Active</span>
                    </div>
                  )}
                  {readiness.paidPlatformsRequireApproval && (
                    <div className="flex items-center gap-2 text-orange-400 px-4 py-2 bg-orange-400/5 rounded-xl border border-orange-400/20">
                      <DollarSign className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase">Budget Approval Needed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 text-center space-y-4">
              <p className="text-sm text-slate-400 italic">
                “Based on your platform details, Bid Manager can prepare platform setup recommendations, profile improvements and opportunity notification workflows.”
              </p>
              <div className="flex justify-center">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${readiness.platformSetupReady ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  {readiness.platformSetupReady ? 'Platform Configuration Ready' : 'Setup Information Incomplete'}
                </div>
              </div>
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
