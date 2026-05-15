
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
import {
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  ClipboardCheck,
  FileText,
  Gavel,
  FileWarning,
  HelpCircle,
} from 'lucide-react';
import { deriveComplianceReadiness } from '@/lib/onboarding-steps';
import { ClientDocumentUploader } from './client_document_uploader';

interface ComplianceInsuranceProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
  fieldErrors?: Record<string, string>;
}

const checklistRows = [
  { label: 'ABN/ACN records', key: 'abnAcnRecords' },
  { label: 'Public liability', key: 'publicLiability' },
  { label: 'Professional indemnity', key: 'professionalIndemnity' },
  { label: 'Workers compensation', key: 'workersCompensation' },
  { label: 'Cyber insurance', key: 'cyberInsurance' },
  { label: 'Motor vehicle insurance', key: 'motorVehicleInsurance' },
  { label: 'Industry licences', key: 'industryLicences' },
  { label: 'Staff tickets', key: 'staffTickets' },
  { label: 'Checks', key: 'checks' },
  { label: 'ISO certifications', key: 'isoCertifications' },
  { label: 'WHS policy', key: 'whsPolicy' },
  { label: 'Quality policy', key: 'qualityPolicy' },
  { label: 'Environmental policy', key: 'environmentalPolicy' },
  { label: 'Privacy policy', key: 'privacyPolicy' },
  { label: 'Risk process', key: 'riskProcess' },
  { label: 'Complaints process', key: 'complaintsProcess' },
  { label: 'Business continuity plan', key: 'businessContinuityPlan' },
  { label: 'Modern slavery statement', key: 'modernSlaveryStatement' },
  { label: 'Capability statement', key: 'capabilityStatement' },
  { label: 'Pricing schedule', key: 'pricingSchedule' },
];

const checklistColumns = [
  { label: 'Available and current', value: 'available_current' },
  { label: 'Available but needs updating', value: 'needs_updating' },
  { label: 'Do not have', value: 'do_not_have' },
  { label: 'Unsure', value: 'unsure' },
  { label: 'Not applicable', value: 'not_applicable' },
];

const policyOptions = [
  { label: 'WHS', value: 'whs' },
  { label: 'Quality', value: 'quality' },
  { label: 'Environmental', value: 'environmental' },
  { label: 'Privacy', value: 'privacy' },
  { label: 'Risk', value: 'risk' },
  { label: 'Complaints', value: 'complaints' },
  { label: 'Incident management', value: 'incident_management' },
  { label: 'Business continuity', value: 'business_continuity' },
  { label: 'Modern slavery', value: 'modern_slavery' },
  { label: 'Diversity and inclusion', value: 'diversity_and_inclusion' },
  { label: 'Cybersecurity', value: 'cybersecurity' },
  { label: 'None', value: 'none' },
  { label: 'Unsure', value: 'unsure' },
];

export function ComplianceInsurance({ data, onChange, isLocked }: ComplianceInsuranceProps) {
  const checklist = data.documentReadinessChecklist || {};
  const insurancePolicies = data.insurancePolicies || [];
  const licences = data.currentLicencesRegistrationsCertifications || [];
  const writtenPolicies = data.writtenPoliciesProcedures || [];

  const handleChecklistChange = (key: string, value: string) => {
    if (isLocked) return;
    onChange('documentReadinessChecklist', { ...checklist, [key]: value });
  };

  const handlePolicyToggle = (value: string) => {
    if (isLocked) return;
    let next = [...writtenPolicies];
    if (value === 'none') {
      next = ['none'];
    } else {
      next = next.filter((entry) => entry !== 'none');
      if (next.includes(value)) {
        next = next.filter((entry) => entry !== value);
      } else {
        next.push(value);
      }
    }
    onChange('writtenPoliciesProcedures', next);
  };

  const handleAddInsurance = () => {
    onChange('insurancePolicies', [
      ...insurancePolicies,
      { id: Math.random().toString(36).substr(2, 9) },
    ]);
  };

  const handleRemoveInsurance = (index: number) => {
    onChange(
      'insurancePolicies',
      insurancePolicies.filter((_: any, currentIndex: number) => currentIndex !== index)
    );
  };

  const handleInsuranceChange = (index: number, field: string, value: any) => {
    const next = [...insurancePolicies];
    next[index] = { ...next[index], [field]: value };
    onChange('insurancePolicies', next);
  };

  const handleAddLicence = () => {
    onChange('currentLicencesRegistrationsCertifications', [
      ...licences,
      { id: Math.random().toString(36).substr(2, 9) },
    ]);
  };

  const handleRemoveLicence = (index: number) => {
    onChange(
      'currentLicencesRegistrationsCertifications',
      licences.filter((_: any, currentIndex: number) => currentIndex !== index)
    );
  };

  const handleLicenceChange = (index: number, field: string, value: any) => {
    const next = [...licences];
    next[index] = { ...next[index], [field]: value };
    onChange('currentLicencesRegistrationsCertifications', next);
  };

  const readiness = deriveComplianceReadiness(data);

  return (
    <div className="space-y-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Compliance, Insurance and Readiness
        </h2>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-blue-800 text-sm leading-relaxed">
          “Many opportunities require current insurance, licences, policies,
          registrations or documented procedures. This section helps us understand what
          you already have and what may need to be created, updated or clarified before
          particular opportunities are pursued.”
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ClientDocumentUploader
          documentCategory="insurance_certificates"
          sourceSection="section_11_compliance_insurance"
          linkedSections={["section_11_compliance_insurance"]}
          linkedRequirementIds={["insurance_certificates"]}
          label="Upload insurance certificates"
          disabled={isLocked}
        />
        <ClientDocumentUploader
          documentCategory="licences_registrations_certifications_checks"
          sourceSection="section_11_compliance_insurance"
          linkedSections={["section_11_compliance_insurance"]}
          linkedRequirementIds={["licences_registrations_certifications_checks"]}
          label="Upload licences/certifications"
          disabled={isLocked}
        />
        <ClientDocumentUploader
          documentCategory="policies_and_procedures"
          sourceSection="section_11_compliance_insurance"
          linkedSections={["section_11_compliance_insurance"]}
          linkedRequirementIds={["policies_and_procedures"]}
          label="Upload policies/procedures"
          disabled={isLocked}
        />
      </div>

      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            1
          </div>
          <h3 className="text-xl font-bold text-slate-900">Document Readiness Checklist</h3>
        </div>

        <div className="rounded-3xl border border-slate-100 overflow-hidden shadow-sm bg-white">
          <div className="hidden md:grid grid-cols-[minmax(220px,1.7fr)_repeat(5,minmax(0,1fr))] gap-3 bg-slate-50 border-b border-slate-100 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Document / Record
            </div>
            {checklistColumns.map((column) => (
              <div
                key={column.value}
                className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-500"
              >
                {column.label}
              </div>
            ))}
          </div>

          <div className="divide-y divide-slate-50">
            {checklistRows.map((row) => (
              <RadioGroup
                key={row.key}
                value={checklist[row.key] || ''}
                onValueChange={(value) => handleChecklistChange(row.key, value)}
                disabled={isLocked}
                className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[minmax(220px,1.7fr)_repeat(5,minmax(0,1fr))] md:items-center"
              >
                <div className="text-sm font-semibold text-slate-700">{row.label}</div>
                {checklistColumns.map((column) => (
                  <Label
                    key={column.value}
                    htmlFor={`${row.key}-${column.value}`}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600 cursor-pointer transition-colors hover:border-slate-200 hover:bg-slate-100 md:justify-center md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-0"
                  >
                    <span className="md:hidden">{column.label}</span>
                    <RadioGroupItem
                      value={column.value}
                      id={`${row.key}-${column.value}`}
                      className="w-5 h-5 border-slate-300"
                    />
                  </Label>
                ))}
              </RadioGroup>
            ))}
          </div>
        </div>

        <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-2">
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <Label className="text-base font-bold text-slate-900">
                Do you need assistance in creating any of the documents above?
              </Label>
            </div>
            <p className="text-sm text-muted-foreground pl-13 leading-relaxed">
              Our team can help you develop compliant policies, capability statements,
              and procedural documents.
              <span className="font-bold text-primary block mt-1">
                Note: This service comes with an additional cost.
              </span>
            </p>
            <div className="pl-13">
              <RadioGroup
                value={data.assistanceRequired}
                onValueChange={(value) => onChange('assistanceRequired', value)}
                disabled={isLocked}
                className="flex flex-wrap gap-6"
              >
                {['yes', 'no', 'maybe_discuss'].map((value) => (
                  <div key={value} className="flex items-center gap-2">
                    <RadioGroupItem value={value} id={`assist-${value}`} />
                    <Label htmlFor={`assist-${value}`} className="capitalize text-sm font-semibold cursor-pointer">
                      {value.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            2
          </div>
          <h3 className="text-xl font-bold text-slate-900">Insurance</h3>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insurancePolicies.map((policy: any, index: number) => (
              <Card key={index} className="border-2 border-slate-100 rounded-3xl p-6 relative pt-12 shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveInsurance(index)}
                  disabled={isLocked}
                  className="absolute top-4 right-4 text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Policy Type</Label>
                    <Input
                      placeholder="e.g., Public Liability"
                      value={policy.policyType || ''}
                      onChange={(e) => handleInsuranceChange(index, 'policyType', e.target.value)}
                      disabled={isLocked}
                      className="h-9 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Insurer</Label>
                      <Input
                        value={policy.insurer || ''}
                        onChange={(e) => handleInsuranceChange(index, 'insurer', e.target.value)}
                        disabled={isLocked}
                        className="h-9 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Coverage Amount</Label>
                      <Input
                        placeholder="e.g., $20M"
                        value={policy.coverageAmount || ''}
                        onChange={(e) =>
                          handleInsuranceChange(index, 'coverageAmount', e.target.value)
                        }
                        disabled={isLocked}
                        className="h-9 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Expiry Date</Label>
                      <Input
                        type="date"
                        value={policy.expiryDate || ''}
                        onChange={(e) => handleInsuranceChange(index, 'expiryDate', e.target.value)}
                        disabled={isLocked}
                        className="h-9 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">
                        Certificate Available?
                      </Label>
                      <select
                        value={policy.certificateAvailable}
                        onChange={(e) =>
                          handleInsuranceChange(index, 'certificateAvailable', e.target.value)
                        }
                        disabled={isLocked}
                        className="w-full h-9 bg-white border border-slate-200 rounded-lg px-2 text-xs"
                      >
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="unsure">Unsure</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <Button
              onClick={handleAddInsurance}
              variant="outline"
              disabled={isLocked}
              className="h-full min-h-[200px] border-dashed border-2 rounded-3xl flex flex-col gap-2 hover:bg-slate-50"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs font-bold">Add Insurance Policy</span>
            </Button>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-500">Insurance Policy Notes</Label>
            <Textarea
              value={data.insurancePolicyNotes || ''}
              onChange={(e) => onChange('insurancePolicyNotes', e.target.value)}
              placeholder="Provide any additional insurance details or notes here..."
              disabled={isLocked}
              className="rounded-xl min-h-[80px]"
            />
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            3
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Licences, Registrations and Certifications
          </h3>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {licences.map((licence: any, index: number) => (
              <Card key={index} className="border-2 border-slate-100 rounded-3xl p-6 relative pt-12 shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveLicence(index)}
                  disabled={isLocked}
                  className="absolute top-4 right-4 text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">
                      Licence / Cert Name
                    </Label>
                    <Input
                      value={licence.name || ''}
                      onChange={(e) => handleLicenceChange(index, 'name', e.target.value)}
                      disabled={isLocked}
                      className="h-9 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Number</Label>
                      <Input
                        value={licence.registrationNumber || ''}
                        onChange={(e) =>
                          handleLicenceChange(index, 'registrationNumber', e.target.value)
                        }
                        disabled={isLocked}
                        className="h-9 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Expiry Date</Label>
                      <Input
                        type="date"
                        value={licence.expiryDate || ''}
                        onChange={(e) => handleLicenceChange(index, 'expiryDate', e.target.value)}
                        disabled={isLocked}
                        className="h-9 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <Button
              onClick={handleAddLicence}
              variant="outline"
              disabled={isLocked}
              className="h-full min-h-[150px] border-dashed border-2 rounded-3xl flex flex-col gap-2 hover:bg-slate-50"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs font-bold">Add Licence/Cert</span>
            </Button>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-bold text-slate-900">
              11.4 Known Compliance Gaps (Optional)
            </Label>
            <p className="text-sm text-muted-foreground italic">
              List any licences or certifications you know you need but don't yet have.
            </p>
            <Textarea
              value={data.knownComplianceGaps || ''}
              onChange={(e) => onChange('knownComplianceGaps', e.target.value)}
              disabled={isLocked}
              className="rounded-xl min-h-[100px]"
            />
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            4
          </div>
          <h3 className="text-xl font-bold text-slate-900">Policies, Procedures and Issues</h3>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-base font-bold">
              11.5 Do you currently have written policies or procedures?
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              {policyOptions.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`policy-${option.value}`}
                    checked={Boolean(writtenPolicies.includes(option.value))}
                    onCheckedChange={() => handlePolicyToggle(option.value)}
                    disabled={isLocked}
                  />
                  <Label
                    htmlFor={`policy-${option.value}`}
                    className="text-xs font-medium cursor-pointer leading-tight"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold text-slate-900">
              11.6 Practical Processes and Service Delivery
            </Label>
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              Even without written policies, how do you manage safety, quality and risk in practice?
            </p>
            <Textarea
              value={data.practicalProcesses || ''}
              onChange={(e) => onChange('practicalProcesses', e.target.value)}
              disabled={isLocked}
              className="rounded-2xl min-h-[120px]"
              placeholder="Describe safety checks, checklists, sign-offs..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold text-slate-900">
              11.7 Legal, Regulatory or Eligibility Issues
            </Label>
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              Are there any issues we should be aware of? If none, write ‘None known’.
            </p>
            <Textarea
              value={data.legalRegulatoryInsuranceEligibilityIssues || ''}
              onChange={(e) =>
                onChange('legalRegulatoryInsuranceEligibilityIssues', e.target.value)
              }
              disabled={isLocked}
              className="rounded-2xl min-h-[120px]"
              placeholder="Disclose any current or historic compliance issues..."
            />
          </div>
        </div>
      </section>

      {checklistRows.some((row) => checklist[row.key]) && (
        <Card className="bg-slate-900 border-none rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardContent className="p-10 space-y-10">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Compliance Readiness Summary</h3>
                <p className="text-slate-400 text-sm">Document status & risk parameters.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ClipboardCheck className="w-3 h-3" /> Document Health
                </p>
                <div className="space-y-3">
                  <ReadinessBadge active={readiness.checklistComplete} label="Readiness Grid Complete" />
                  <div className="flex flex-col gap-1.5 pl-7">
                    <StatusCount count={readiness.complianceGapCount} label="Gaps (Do not have)" color="text-red-400" />
                    <StatusCount count={readiness.updateRequiredCount} label="Need updating" color="text-orange-400" />
                    <StatusCount count={readiness.unsureCount} label="Unsure items" color="text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Core Compliance
                </p>
                <div className="space-y-3">
                  <ReadinessBadge active={readiness.hasCriticalInsurance} label="Critical Insurance Held" />
                  <ReadinessBadge active={readiness.hasWrittenPolicies} label="Written Policies Set" />
                  <ReadinessBadge active={readiness.hasPracticalProcesses} label="Practical Processes Defined" />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Gavel className="w-3 h-3" /> Channel Eligibility
                </p>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <ChannelBadge active={readiness.tenderComplianceReady} label="Tender Ready" />
                    <ChannelBadge active={readiness.grantComplianceReady} label="Grant Ready" />
                    <ChannelBadge active={readiness.marketplaceComplianceReady} label="Marketplace Ready" />
                  </div>
                  {readiness.hasComplianceIssues && (
                    <div className="mt-4 flex items-center gap-2 text-red-400 px-4 py-2 bg-red-400/5 rounded-xl border border-red-400/20">
                      <FileWarning className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">
                        Compliance Issues Flagged
                      </span>
                    </div>
                  )}
                  {readiness.insuranceNeedsReview && (
                    <div className="mt-2 flex items-center gap-2 text-orange-400 px-4 py-2 bg-orange-400/5 rounded-xl border border-orange-400/20">
                      <ShieldCheck className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">
                        Insurance Review Needed
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 text-center">
              <p className="text-sm text-slate-400 italic">
                “Based on your compliance information, Bid Manager can identify
                readiness gaps before recommending tenders, grants, supplier
                registrations or proposals.”
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReadinessBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${
        active
          ? 'bg-green-500/10 border-green-500/20 text-green-400'
          : 'bg-slate-800/50 border-slate-800 text-slate-600'
      }`}
    >
      {active ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-slate-700" />
      )}
      <span className="text-xs font-bold">{label}</span>
    </div>
  );
}

function StatusCount({
  count,
  label,
  color,
}: {
  count: number;
  label: string;
  color: string;
}) {
  if (count === 0) return null;
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-slate-500 font-medium">{label}</span>
      <span className={`text-[10px] font-bold ${color}`}>{count}</span>
    </div>
  );
}

function ChannelBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <Badge
      variant="outline"
      className={`border-none px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
        active ? 'bg-primary text-white' : 'bg-slate-800 text-slate-500'
      }`}
    >
      {label}
    </Badge>
  );
}
