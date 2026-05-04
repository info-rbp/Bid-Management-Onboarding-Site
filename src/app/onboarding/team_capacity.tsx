
"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, CheckCircle2, Info, AlertTriangle, Users, GitMerge, BarChart3, ShieldCheck, PlusCircle, MoveUp, MoveDown } from 'lucide-react';
import { deriveTeamReadiness } from '@/lib/onboarding-steps';

interface TeamCapacityProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
}

export function TeamCapacity({ data, onChange, isLocked }: TeamCapacityProps) {
  const keyPeople = data.keyPeople || [{}];
  const teamCredentials = data.teamCredentials || [];
  const deliveryPartners = data.deliveryPartners || [];
  const deliveryProcess = data.standardDeliveryProcess || { steps: [
    { id: '1', stepName: 'Enquiry received', order: 0 },
    { id: '2', stepName: 'Scope confirmed', order: 1 },
    { id: '3', stepName: 'Quote or proposal prepared', order: 2 },
    { id: '4', stepName: 'Approval received', order: 3 },
    { id: '5', stepName: 'Work scheduled', order: 4 },
    { id: '6', stepName: 'Delivery completed', order: 5 },
    { id: '7', stepName: 'Quality checked', order: 6 },
    { id: '8', stepName: 'Client handover or follow-up', order: 7 },
  ] };

  const handleAddKeyPerson = () => {
    onChange('keyPeople', [...keyPeople, { id: Math.random().toString(36).substr(2, 9) }]);
  };

  const handleRemoveKeyPerson = (index: number) => {
    const newItems = keyPeople.filter((_: any, i: number) => i !== index);
    onChange('keyPeople', newItems);
  };

  const handleKeyPersonChange = (index: number, field: string, value: any) => {
    const newItems = [...keyPeople];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange('keyPeople', newItems);
  };

  const handleAddPartner = () => {
    onChange('deliveryPartners', [...deliveryPartners, { id: Math.random().toString(36).substr(2, 9) }]);
  };

  const handleRemovePartner = (index: number) => {
    const newItems = deliveryPartners.filter((_: any, i: number) => i !== index);
    onChange('deliveryPartners', newItems);
  };

  const handlePartnerChange = (index: number, field: string, value: any) => {
    const newItems = [...deliveryPartners];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange('deliveryPartners', newItems);
  };

  const handleAddCredential = () => {
    onChange('teamCredentials', [...teamCredentials, { id: Math.random().toString(36).substr(2, 9) }]);
  };

  const handleRemoveCredential = (index: number) => {
    const newItems = teamCredentials.filter((_: any, i: number) => i !== index);
    onChange('teamCredentials', newItems);
  };

  const handleCredentialChange = (index: number, field: string, value: any) => {
    const newItems = [...teamCredentials];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange('teamCredentials', newItems);
  };

  const handleAddProcessStep = () => {
    const nextOrder = deliveryProcess.steps.length;
    const newSteps = [...deliveryProcess.steps, { id: Math.random().toString(36).substr(2, 9), stepName: '', order: nextOrder }];
    onChange('standardDeliveryProcess', { ...deliveryProcess, steps: newSteps });
  };

  const handleRemoveProcessStep = (id: string) => {
    const newSteps = deliveryProcess.steps.filter((s: any) => s.id !== id).map((s: any, i: number) => ({ ...s, order: i }));
    onChange('standardDeliveryProcess', { ...deliveryProcess, steps: newSteps });
  };

  const handleProcessStepChange = (id: string, field: string, value: any) => {
    const newSteps = deliveryProcess.steps.map((s: any) => s.id === id ? { ...s, [field]: value } : s);
    onChange('standardDeliveryProcess', { ...deliveryProcess, steps: newSteps });
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...deliveryProcess.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    const updatedSteps = newSteps.map((s, i) => ({ ...s, order: i }));
    onChange('standardDeliveryProcess', { ...deliveryProcess, steps: updatedSteps });
  };

  const readiness = deriveTeamReadiness(data);

  return (
    <div className="space-y-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Team, Capacity and Delivery Model</h2>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-blue-800 text-sm leading-relaxed">
          “Buyers and funders often need to understand who will deliver the work and whether the business has enough capacity, experience and systems to deliver successfully. This section helps us prepare team profiles, capability summaries, resourcing statements and delivery methodology content.”
        </div>
      </div>

      {/* GROUP 1: KEY PEOPLE */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">1</div>
          <h3 className="text-xl font-bold text-slate-900">Key People</h3>
        </div>

        <div className="space-y-8">
          {keyPeople.map((person: any, index: number) => (
            <Card key={index} className="border-2 border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">{index + 1}</div>
                    <h4 className="font-bold text-slate-900">Team Member Details</h4>
                  </div>
                  {keyPeople.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveKeyPerson(index)} disabled={isLocked} className="text-destructive hover:text-destructive hover:bg-destructive/5 rounded-full">
                      <Trash2 className="w-4 h-4 mr-2" /> Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</Label>
                    <Input value={person.fullName || ''} onChange={(e) => handleKeyPersonChange(index, 'fullName', e.target.value)} disabled={isLocked} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Role / Title</Label>
                    <Input value={person.roleTitle || ''} onChange={(e) => handleKeyPersonChange(index, 'roleTitle', e.target.value)} disabled={isLocked} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Years of Experience</Label>
                    <Input value={person.yearsExperience || ''} onChange={(e) => handleKeyPersonChange(index, 'yearsExperience', e.target.value)} disabled={isLocked} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Qualifications</Label>
                    <Input value={person.qualifications || ''} onChange={(e) => handleKeyPersonChange(index, 'qualifications', e.target.value)} disabled={isLocked} className="rounded-xl" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Responsibilities</Label>
                    <Textarea value={person.responsibilities || ''} onChange={(e) => handleKeyPersonChange(index, 'responsibilities', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Licences, Tickets or Checks</Label>
                    <Input value={person.licencesTicketsChecks || ''} onChange={(e) => handleKeyPersonChange(index, 'licencesTicketsChecks', e.target.value)} disabled={isLocked} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Short Bio or Notes</Label>
                    <Textarea value={person.shortBio || ''} onChange={(e) => handleKeyPersonChange(index, 'shortBio', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button onClick={handleAddKeyPerson} disabled={isLocked} variant="outline" className="w-full h-14 border-dashed border-2 rounded-2xl font-bold gap-2">
            <Plus className="w-4 h-4" /> Add Team Member
          </Button>
        </div>

        <div className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label className="text-base font-bold">6.2 Do you have staff CVs, bios or resumes available?</Label>
            <RadioGroup value={data.staffProfilesAvailable} onValueChange={(v) => onChange('staffProfilesAvailable', v)} disabled={isLocked} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['yes', 'no', 'some', 'need_updating'].map(val => (
                <div key={val} className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <RadioGroupItem value={val} id={`profiles-${val}`} />
                  <Label htmlFor={`profiles-${val}`} className="capitalize text-xs font-semibold">{val.replace('_', ' ')}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-bold">6.3 What qualifications, licences, tickets or checks do your team hold? (Optional)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamCredentials.map((cred: any, idx: number) => (
                <Card key={idx} className="border-2 border-slate-100 rounded-2xl p-4 relative pt-10">
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveCredential(idx)} disabled={isLocked} className="absolute top-2 right-2 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  <div className="space-y-3">
                    <Input placeholder="Credential Name" value={cred.credentialName || ''} onChange={(e) => handleCredentialChange(idx, 'credentialName', e.target.value)} disabled={isLocked} className="h-8 text-xs rounded-lg" />
                    <Input placeholder="Holder Name" value={cred.holderName || ''} onChange={(e) => handleCredentialChange(idx, 'holderName', e.target.value)} disabled={isLocked} className="h-8 text-xs rounded-lg" />
                    <div className="flex gap-2">
                      <Input placeholder="Issuing Body" value={cred.issuingBody || ''} onChange={(e) => handleCredentialChange(idx, 'issuingBody', e.target.value)} disabled={isLocked} className="h-8 text-xs rounded-lg" />
                      <Input type="date" value={cred.expiryDate || ''} onChange={(e) => handleCredentialChange(idx, 'expiryDate', e.target.value)} disabled={isLocked} className="h-8 text-xs rounded-lg" />
                    </div>
                  </div>
                </Card>
              ))}
              <Button onClick={handleAddCredential} variant="outline" disabled={isLocked} className="h-full min-h-[120px] border-dashed border-2 rounded-2xl flex flex-col gap-2">
                <PlusCircle className="w-5 h-5" />
                <span className="text-xs font-bold">Add Credential</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">6.4 What specialist skills or experience does your team have? (Optional)</Label>
            <Textarea value={data.specialistSkillsExperience || ''} onChange={(e) => onChange('specialistSkillsExperience', e.target.value)} disabled={isLocked} className="rounded-xl" placeholder="Describe niche expertise, technical skills, regional knowledge..." />
          </div>
        </div>
      </section>

      {/* GROUP 2: DELIVERY PARTNERS */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">2</div>
          <h3 className="text-xl font-bold text-slate-900">Delivery Partners</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-bold">6.5 Do you use subcontractors, suppliers or delivery partners?</Label>
            <RadioGroup value={data.usesDeliveryPartners} onValueChange={(v) => onChange('usesDeliveryPartners', v)} disabled={isLocked} className="flex gap-6">
              {['yes', 'no', 'sometimes', 'unsure'].map(val => (
                <div key={val} className="flex items-center gap-2">
                  <RadioGroupItem value={val} id={`partners-${val}`} />
                  <Label htmlFor={`partners-${val}`} className="capitalize">{val}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {(data.usesDeliveryPartners === 'yes' || data.usesDeliveryPartners === 'sometimes') && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
              <Label className="text-sm font-bold text-slate-500">6.6 Describe the subcontractors, suppliers or partners you use.</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {deliveryPartners.map((partner: any, idx: number) => (
                  <Card key={idx} className="border-2 border-slate-100 rounded-3xl p-6 relative pt-12">
                    <Button variant="ghost" size="sm" onClick={() => handleRemovePartner(idx)} disabled={isLocked} className="absolute top-2 right-2 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Partner Name</Label>
                        <Input value={partner.businessName || ''} onChange={(e) => handlePartnerChange(idx, 'businessName', e.target.value)} disabled={isLocked} className="rounded-lg h-9" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Services Provided</Label>
                        <Textarea value={partner.servicesProvided || ''} onChange={(e) => handlePartnerChange(idx, 'servicesProvided', e.target.value)} disabled={isLocked} className="rounded-lg min-h-[60px] text-xs" />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-1">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Regular Use?</Label>
                          <Select value={partner.usedRegularly} onValueChange={(v) => handlePartnerChange(idx, 'usedRegularly', v)} disabled={isLocked}>
                             <option value="yes">Yes</option><option value="no">No</option><option value="sometimes">Sometimes</option>
                          </Select>
                        </div>
                        <div className="flex-1 space-y-1">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Can Scale?</Label>
                          <Select value={partner.canSupportLargerContracts} onValueChange={(v) => handlePartnerChange(idx, 'canSupportLargerContracts', v)} disabled={isLocked}>
                             <option value="yes">Yes</option><option value="no">No</option><option value="maybe">Maybe</option>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                <Button onClick={handleAddPartner} variant="outline" disabled={isLocked} className="h-full min-h-[180px] border-dashed border-2 rounded-3xl flex flex-col gap-2">
                  <Plus className="w-5 h-5" />
                  <span className="text-xs font-bold">Add Delivery Partner</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* GROUP 3: CAPACITY AND SCALABILITY */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">3</div>
          <h3 className="text-xl font-bold text-slate-900">Capacity and Scalability</h3>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <Label className="text-base font-bold">6.7 How many jobs, projects or contracts can you handle at once?</Label>
            <p className="text-sm text-muted-foreground">Describe your normal capacity, including number of clients or projects managed simultaneously.</p>
            <Textarea value={data.currentCapacity || ''} onChange={(e) => onChange('currentCapacity', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[100px]" />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-bold">6.8 Could you scale up if you won a larger contract?</Label>
            <RadioGroup value={data.canScaleForLargerContract} onValueChange={(v) => onChange('canScaleForLargerContract', v)} disabled={isLocked} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
                { label: 'Maybe, with partners/new staff', value: 'maybe_with_subcontractors_or_new_staff' },
                { label: 'Unsure', value: 'unsure' },
              ].map(opt => (
                <div key={opt.value} className="flex items-center gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <RadioGroupItem value={opt.value} id={`scale-${opt.value}`} />
                  <Label htmlFor={`scale-${opt.value}`} className="text-sm font-semibold">{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {data.canScaleForLargerContract && data.canScaleForLargerContract !== 'yes' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label className="text-base font-bold">6.9 What would need to happen for you to scale delivery? (Optional)</Label>
              <p className="text-sm text-muted-foreground">Hire staff, buy equipment, secure finance, expand systems...</p>
              <Textarea value={data.scalingRequirements || ''} onChange={(e) => onChange('scalingRequirements', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[80px]" />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-base font-bold">6.10 What happens if a key person is unavailable?</Label>
            <p className="text-sm text-muted-foreground">Describe backup arrangements, delegation, or continuity planning.</p>
            <Textarea value={data.keyPersonUnavailablePlan || ''} onChange={(e) => onChange('keyPersonUnavailablePlan', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[100px]" />
          </div>
        </div>
      </section>

      {/* GROUP 4: DELIVERY ASSETS AND QUALITY */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">4</div>
          <h3 className="text-xl font-bold text-slate-900">Delivery Assets and Quality</h3>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <Label className="text-base font-bold">6.11 What equipment, technology or facilities do you use? (Optional)</Label>
            <Textarea value={data.deliveryAssets || ''} onChange={(e) => onChange('deliveryAssets', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[100px]" />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">6.12 What quality checks or review steps are used during delivery?</Label>
            <p className="text-sm text-muted-foreground">Checklists, supervisor review, client sign-off, safety checks...</p>
            <Textarea value={data.qualityChecksAndSupervision || ''} onChange={(e) => onChange('qualityChecksAndSupervision', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[100px]" />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-bold">6.13 Describe your standard delivery process from enquiry to completion.</Label>
              <p className="text-sm text-muted-foreground italic">Add, remove or reorder steps to match your workflow.</p>
            </div>
            
            <div className="space-y-3 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
              {deliveryProcess.steps.map((step: any, idx: number) => (
                <div key={step.id} className="flex gap-4 items-start group">
                  <div className="flex flex-col gap-1 pt-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => moveStep(idx, 'up')} disabled={isLocked || idx === 0} className="w-6 h-6 rounded-md"><MoveUp className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => moveStep(idx, 'down')} disabled={isLocked || idx === deliveryProcess.steps.length - 1} className="w-6 h-6 rounded-md"><MoveDown className="w-3 h-3" /></Button>
                  </div>
                  <div className="shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400 mt-2 shadow-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input value={step.stepName} onChange={(e) => handleProcessStepChange(step.id, 'stepName', e.target.value)} placeholder="Step name" disabled={isLocked} className="rounded-xl h-10 border-none shadow-sm" />
                    <Textarea value={step.description || ''} onChange={(e) => handleProcessStepChange(step.id, 'description', e.target.value)} placeholder="Optional details..." disabled={isLocked} className="rounded-xl min-h-[60px] border-none shadow-sm text-xs py-2" />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveProcessStep(step.id)} disabled={isLocked || deliveryProcess.steps.length <= 3} className="shrink-0 text-slate-300 hover:text-destructive mt-2"><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
              <Button onClick={handleAddProcessStep} disabled={isLocked} variant="ghost" className="w-full h-12 border-dashed border-2 rounded-2xl text-slate-400 hover:text-primary hover:bg-white hover:border-primary font-bold gap-2 mt-4">
                <Plus className="w-4 h-4" /> Add Delivery Step
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Card */}
      {keyPeople[0]?.fullName && (
        <Card className="bg-slate-900 border-none rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardContent className="p-10 space-y-10">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Team & Capacity Summary</h3>
                <p className="text-slate-400 text-sm">Review your delivery foundations.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-3 h-3" /> People & Partners
                </p>
                <div className="space-y-3">
                  <ReadinessBadge active={readiness.hasKeyPeople} label={`${keyPeople.length} Key People Listed`} />
                  <ReadinessBadge active={readiness.hasStaffProfiles} label="Staff Profiles Available" />
                  <ReadinessBadge active={readiness.usesPartners ? readiness.partnerDetailsComplete : true} label={readiness.usesPartners ? "Partner Details Complete" : "No Subcontractors Used"} />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 className="w-3 h-3" /> Capacity & Scale
                </p>
                <div className="space-y-3">
                  <ReadinessBadge active={readiness.hasCapacityStatement} label="Capacity Defined" />
                  <ReadinessBadge active={readiness.canScale} label="Scalable Model" />
                  <ReadinessBadge active={readiness.hasContinuityPlan} label="Continuity Plan Ready" />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <GitMerge className="w-3 h-3" /> Quality & Process
                </p>
                <div className="space-y-3">
                  <ReadinessBadge active={readiness.hasQualityProcess} label="Quality Checks Defined" />
                  <ReadinessBadge active={readiness.hasDeliveryMethodology} label="Methodology Mapped" />
                  {readiness.scalingRiskFlag && (
                    <div className="mt-4 flex items-center gap-2 text-orange-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Scaling Risk Flagged</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 text-center">
              <p className="text-sm text-slate-400 italic">
                “Based on your team and delivery information, we can prepare team profiles, capability summaries, resourcing statements and delivery methodology content.”
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

function Select({ value, onValueChange, disabled, children }: any) {
  return (
    <select 
      value={value} 
      onChange={(e) => onValueChange(e.target.value)} 
      disabled={disabled}
      className="w-full bg-white border border-slate-200 rounded-lg h-9 px-2 text-xs focus:ring-primary/20 focus:border-primary outline-none"
    >
      {children}
    </select>
  );
}
