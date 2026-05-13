
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
import { Plus, Trash2, CheckCircle2, Info, AlertTriangle, FileCheck, Star, ShieldAlert, Award, Image, UserCheck, MessageSquareQuote } from 'lucide-react';
import { deriveProofReadiness } from '@/lib/onboarding-steps';
import { ClientDocumentUploader } from './client_document_uploader';

interface ProofEvidenceProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
  fieldErrors?: Record<string, string>;
}

const clientTypeOptions = [
  { label: "Residential", value: "residential" },
  { label: "Commercial", value: "commercial" },
  { label: "Government", value: "government" },
  { label: "Not-for-profit", value: "not_for_profit" },
  { label: "Corporate", value: "corporate" },
  { label: "Small business", value: "small_business" },
  { label: "Community organisation", value: "community_organisation" },
  { label: "Confidential", value: "confidential" },
  { label: "Other", value: "other" },
];

const evidenceTypeOptions = [
  { label: "Photos", value: "photos" },
  { label: "Completion certificate", value: "completion_certificate" },
  { label: "Client testimonial", value: "client_testimonial" },
  { label: "Online review", value: "online_review" },
  { label: "Report", value: "report" },
  { label: "Invoice", value: "invoice" },
  { label: "Contract", value: "contract" },
  { label: "Email feedback", value: "email_feedback" },
  { label: "Before-and-after evidence", value: "before_after_evidence" },
  { label: "Referee contact", value: "referee_contact" },
  { label: "Other", value: "other" },
];

const reviewLocationOptions = [
  { label: "Google reviews", value: "google_reviews" },
  { label: "Facebook", value: "facebook" },
  { label: "Airtasker", value: "airtasker" },
  { label: "Bark", value: "bark" },
  { label: "hipages", value: "hipages" },
  { label: "ServiceSeeking", value: "serviceseeking" },
  { label: "Oneflare", value: "oneflare" },
  { label: "Website", value: "website" },
  { label: "Written emails", value: "written_emails" },
  { label: "Letters", value: "letters" },
  { label: "Other", value: "other" },
  { label: "Not applicable", value: "not_applicable" },
];

export function ProofEvidence({ data, onChange, isLocked }: ProofEvidenceProps) {
  const caseStudies = data.caseStudies || [{}, {}, {}];

  const handleAddCaseStudy = () => {
    onChange('caseStudies', [...caseStudies, { id: Math.random().toString(36).substr(2, 9) }]);
  };

  const handleRemoveCaseStudy = (index: number) => {
    const newItems = caseStudies.filter((_: any, i: number) => i !== index);
    onChange('caseStudies', newItems);
  };

  const handleCaseStudyChange = (index: number, field: string, value: any) => {
    const newItems = [...caseStudies];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange('caseStudies', newItems);
  };

  const handleRefereeDetailChange = (index: number, field: string, value: any) => {
    const newItems = [...caseStudies];
    const refereeDetails = newItems[index].refereeDetails || {};
    newItems[index] = { 
      ...newItems[index], 
      refereeDetails: { ...refereeDetails, [field]: value } 
    };
    onChange('caseStudies', newItems);
  };

  const readiness = deriveProofReadiness(data);
  const detailsRequired = readiness.caseStudyDetailsRequired;

  return (
    <div className="space-y-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Proof, Case Studies, Reviews and Evidence</h2>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-blue-800 text-sm leading-relaxed">
          “This section helps us identify the strongest proof that your business can deliver. Where possible, provide specific examples, outcomes, photos, testimonials, reviews, completion evidence or referee details.”
        </div>
      </div>

      <ClientDocumentUploader documentCategory="project_examples_case_studies_photos_reports_testimonials" sourceSection="section_7_proof_evidence" linkedSections={["section_7_proof_evidence"]} linkedRequirementIds={["project_examples_case_studies_photos_reports_testimonials"]} label="Upload proof and evidence files" disabled={isLocked} />
      <ClientDocumentUploader documentCategory="previous_tenders_grants_proposals_quotes_feedback" sourceSection="section_7_proof_evidence" linkedSections={["section_7_proof_evidence"]} linkedRequirementIds={["previous_tenders_grants_proposals_quotes_feedback"]} label="Upload past tenders/proposals/feedback" disabled={isLocked} />

      {/* GROUP 1: PROOF OVERVIEW */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">1</div>
          <h3 className="text-xl font-bold text-slate-900">Proof Overview</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-base font-bold">7.1 Do you have examples of completed work we can use as case studies?</Label>
            <RadioGroup value={data.caseStudyExamplesAvailable} onValueChange={(v) => onChange('caseStudyExamplesAvailable', v)} disabled={isLocked} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
                { label: 'Unsure', value: 'unsure' },
                { label: 'We have examples but need help', value: 'examples_need_help' },
              ].map(opt => (
                <div key={opt.value} className="flex items-center gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <RadioGroupItem value={opt.value} id={`available-${opt.value}`} />
                  <Label htmlFor={`available-${opt.value}`} className="text-sm font-semibold">{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">7.2 How many strong examples of past work can you provide?</Label>
            <RadioGroup value={data.numberOfStrongExamples} onValueChange={(v) => onChange('numberOfStrongExamples', v)} disabled={isLocked} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'None yet', value: 'none_yet' },
                { label: '1', value: 'one' },
                { label: '2-3', value: 'two_to_three' },
                { label: '4-5', value: 'four_to_five' },
                { label: 'More than 5', value: 'more_than_five' },
                { label: 'Unsure', value: 'unsure' },
              ].map(opt => (
                <div key={opt.value} className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <RadioGroupItem value={opt.value} id={`count-${opt.value}`} />
                  <Label htmlFor={`count-${opt.value}`} className="text-xs font-semibold">{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </section>

      {/* GROUP 2: CASE STUDY BUILDER */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">2</div>
          <h3 className="text-xl font-bold text-slate-900">Case Study Builder</h3>
        </div>

        {detailsRequired ? (
          <div className="space-y-8">
      <div id="caseStudies.0.projectTitle" data-validation-anchor="caseStudies.0.projectTitle" className="sr-only" />
      <div id="caseStudies.0.clientCustomerType" data-validation-anchor="caseStudies.0.clientCustomerType" className="sr-only" />
      <div id="caseStudies.0.whatWasDelivered" data-validation-anchor="caseStudies.0.whatWasDelivered" className="sr-only" />
      <div id="caseStudies.0.problemSolvedAndOutcome" data-validation-anchor="caseStudies.0.problemSolvedAndOutcome" className="sr-only" />
            {caseStudies.map((cs: any, index: number) => (
              <Card key={index} className="border-2 border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">{index + 1}</div>
                      <h4 className="font-bold text-slate-900">Case Study Details</h4>
                    </div>
                    {caseStudies.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveCaseStudy(index)} disabled={isLocked} className="text-destructive hover:text-destructive hover:bg-destructive/5 rounded-full">
                        <Trash2 className="w-4 h-4 mr-2" /> Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Project or job title</Label>
                      <Input value={cs.projectTitle || ''} onChange={(e) => handleCaseStudyChange(index, 'projectTitle', e.target.value)} disabled={isLocked} className="rounded-xl" placeholder="e.g., Major Office Refurbishment - City Center" />
                    </div>

                    <div className="space-y-4 md:col-span-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Client or customer type</Label>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        {clientTypeOptions.map(opt => (
                          <div key={opt.value} className="flex items-center gap-2">
                            <Checkbox 
                              id={`client-${index}-${opt.value}`}
                              checked={cs.clientCustomerType?.includes(opt.value)}
                              onCheckedChange={(checked) => {
                                const current = cs.clientCustomerType || [];
                                const next = checked ? [...current, opt.value] : current.filter((v: string) => v !== opt.value);
                                handleCaseStudyChange(index, 'clientCustomerType', next);
                              }}
                              disabled={isLocked}
                            />
                            <Label htmlFor={`client-${index}-${opt.value}`} className="text-xs font-medium cursor-pointer">{opt.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">What did you deliver?</Label>
                      <p className="text-[10px] text-muted-foreground">Describe the work completed, service provided or project scope.</p>
                      <Textarea value={cs.whatWasDelivered || ''} onChange={(e) => handleCaseStudyChange(index, 'whatWasDelivered', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[100px]" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Approximate value (Optional)</Label>
                      <Input value={cs.approximateValue || ''} onChange={(e) => handleCaseStudyChange(index, 'approximateValue', e.target.value)} disabled={isLocked} className="rounded-xl" placeholder="e.g., $50,000" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Location and date completed (Optional)</Label>
                      <Input value={cs.locationAndDateCompleted || ''} onChange={(e) => handleCaseStudyChange(index, 'locationAndDateCompleted', e.target.value)} disabled={isLocked} className="rounded-xl" placeholder="e.g., Sydney, March 2024" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">What problem did you solve and what was the outcome?</Label>
                      <p className="text-[10px] text-muted-foreground">Include measurable outcomes like time saved, cost reduced or quality improved.</p>
                      <Textarea value={cs.problemSolvedAndOutcome || ''} onChange={(e) => handleCaseStudyChange(index, 'problemSolvedAndOutcome', e.target.value)} disabled={isLocked} className="rounded-xl min-h-[100px]" />
                    </div>

                    <div className="space-y-4 md:col-span-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">What evidence is available?</Label>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        {evidenceTypeOptions.map(opt => (
                          <div key={opt.value} className="flex items-center gap-2">
                            <Checkbox 
                              id={`evidence-${index}-${opt.value}`}
                              checked={cs.availableEvidence?.includes(opt.value)}
                              onCheckedChange={(checked) => {
                                const current = cs.availableEvidence || [];
                                const next = checked ? [...current, opt.value] : current.filter((v: string) => v !== opt.value);
                                handleCaseStudyChange(index, 'availableEvidence', next);
                              }}
                              disabled={isLocked}
                            />
                            <Label htmlFor={`evidence-${index}-${opt.value}`} className="text-xs font-medium cursor-pointer">{opt.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 md:col-span-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Can the client be contacted as a referee?</Label>
                      <RadioGroup value={cs.refereePermission} onValueChange={(v) => handleCaseStudyChange(index, 'refereePermission', v)} disabled={isLocked} className="flex flex-wrap gap-4">
                        {['yes', 'no', 'maybe_with_approval', 'confidential'].map(val => (
                          <div key={val} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100">
                            <RadioGroupItem value={val} id={`ref-${index}-${val}`} />
                            <Label htmlFor={`ref-${index}-${val}`} className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{val.replace(/_/g, ' ')}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {(cs.refereePermission === 'yes' || cs.refereePermission === 'maybe_with_approval') && (
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                         <div className="space-y-1">
                           <Label className="text-[10px] font-bold uppercase text-slate-400">Referee Name</Label>
                           <Input value={cs.refereeDetails?.name || ''} onChange={(e) => handleRefereeDetailChange(index, 'name', e.target.value)} disabled={isLocked} className="h-8 text-xs rounded-lg" />
                         </div>
                         <div className="space-y-1">
                           <Label className="text-[10px] font-bold uppercase text-slate-400">Referee Role</Label>
                           <Input value={cs.refereeDetails?.role || ''} onChange={(e) => handleRefereeDetailChange(index, 'role', e.target.value)} disabled={isLocked} className="h-8 text-xs rounded-lg" />
                         </div>
                         <div className="space-y-1">
                           <Label className="text-[10px] font-bold uppercase text-slate-400">Organisation</Label>
                           <Input value={cs.refereeDetails?.organisation || ''} onChange={(e) => handleRefereeDetailChange(index, 'organisation', e.target.value)} disabled={isLocked} className="h-8 text-xs rounded-lg" />
                         </div>
                         <div className="space-y-1">
                           <Label className="text-[10px] font-bold uppercase text-slate-400">Email / Phone</Label>
                           <Input value={cs.refereeDetails?.email || ''} onChange={(e) => handleRefereeDetailChange(index, 'email', e.target.value)} disabled={isLocked} className="h-8 text-xs rounded-lg" placeholder="Contact info" />
                         </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button onClick={handleAddCaseStudy} disabled={isLocked} variant="outline" className="w-full h-16 border-dashed border-2 rounded-2xl font-bold gap-2">
              <Plus className="w-4 h-4" /> Add Another Case Study
            </Button>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-12 text-center space-y-4">
             <Info className="w-12 h-12 text-slate-300 mx-auto" />
             <div className="space-y-1">
               <h4 className="text-lg font-bold text-slate-900">Case studies not currently required</h4>
               <p className="text-sm text-slate-500 max-w-md mx-auto">Select 'Yes' or 'Need Help' in Group 1 to enable the Case Study Builder.</p>
             </div>
          </div>
        )}
      </section>

      {/* GROUP 3: TESTIMONIALS, REVIEWS AND REFERENCES */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">3</div>
          <h3 className="text-xl font-bold text-slate-900">Testimonials, Reviews and References</h3>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <Label className="text-base font-bold">7.13 Do you have testimonials, reviews or references we can use?</Label>
            <RadioGroup value={data.testimonialsReviewsReferencesAvailable} onValueChange={(v) => onChange('testimonialsReviewsReferencesAvailable', v)} disabled={isLocked} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
                { label: 'Some, but need organising', value: 'some_need_organising' },
                { label: 'Unsure', value: 'unsure' },
              ].map(opt => (
                <div key={opt.value} className="flex items-center gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <RadioGroupItem value={opt.value} id={`testimonials-${opt.value}`} />
                  <Label htmlFor={`testimonials-${opt.value}`} className="text-sm font-semibold">{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-bold">7.14 Where are your reviews or testimonials currently located?</Label>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              {reviewLocationOptions.map(opt => (
                <div key={opt.value} className="flex items-center gap-2">
                  <Checkbox 
                    id={`loc-${opt.value}`}
                    checked={data.reviewLocations?.includes(opt.value)}
                    onCheckedChange={(checked) => {
                      const current = data.reviewLocations || [];
                      const next = checked ? [...current, opt.value] : current.filter((v: string) => v !== opt.value);
                      onChange('reviewLocations', next);
                    }}
                    disabled={isLocked}
                  />
                  <Label htmlFor={`loc-${opt.value}`} className="text-xs font-medium cursor-pointer">{opt.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {data.reviewLocations?.includes('other') && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
              <Label className="text-xs font-bold uppercase text-slate-500">Other review/testimonial location</Label>
              <Input value={data.otherReviewLocation || ''} onChange={(e) => onChange('otherReviewLocation', e.target.value)} disabled={isLocked} className="rounded-xl" />
            </div>
          )}
        </div>
      </section>

      {/* GROUP 4: EVIDENCE USAGE RESTRICTIONS */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">4</div>
          <h3 className="text-xl font-bold text-slate-900">Evidence Usage Restrictions</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base font-bold">7.15 Are there any restrictions on using client names, logos, photos, or details?</Label>
            <p className="text-sm text-muted-foreground leading-relaxed">Include any confidentiality restrictions or approval requirements. If none, write ‘None known’.</p>
            <Textarea value={data.evidenceUsageRestrictions || ''} onChange={(e) => onChange('evidenceUsageRestrictions', e.target.value)} disabled={isLocked} className="rounded-2xl min-h-[120px]" placeholder="Type restrictions here..." />
          </div>
        </div>
      </section>

      {/* Summary Card */}
      {data.caseStudyExamplesAvailable && (
        <Card className="bg-slate-900 border-none rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardContent className="p-10 space-y-10">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Award className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Proof & Evidence Summary</h3>
                <p className="text-slate-400 text-sm">Validating your business capability.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <FileCheck className="w-3 h-3" /> Case Studies
                </p>
                <div className="space-y-3">
                  <ReadinessBadge active={readiness.hasCaseStudyExamples} label="Examples Available" />
                  <ReadinessBadge active={readiness.hasMultipleCaseStudies} label="Multiple Studies Mapped" />
                  <ReadinessBadge active={readiness.hasRefereePotential} label="Referee Potential" />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Star className="w-3 h-3" /> Social Proof
                </p>
                <div className="space-y-3">
                  <ReadinessBadge active={readiness.hasTestimonialsOrReviews} label="Testimonials Available" />
                  <ReadinessBadge active={readiness.hasReviewLocations} label="Review Sources Linked" />
                  <ReadinessBadge active={readiness.hasEvidenceAssetsListed} label="Visual Evidence Listed" />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquareQuote className="w-3 h-3" /> Channel Readiness
                </p>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <ChannelBadge active={readiness.tenderProofReady} label="Tenders" />
                    <ChannelBadge active={readiness.marketplaceProofReady} label="Marketplace" />
                    <ChannelBadge active={readiness.grantProofReady} label="Grants" />
                    <ChannelBadge active={readiness.quoteProofReady} label="Quotes" />
                  </div>
                  {readiness.hasUsageRestrictions && (
                    <div className="mt-4 flex items-center gap-2 text-orange-400">
                      <ShieldAlert className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Usage Restrictions Active</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 text-center">
              <p className="text-sm text-slate-400 italic">
                “Based on your proof details, we can prepare case studies, credibility statements, marketplace proof points and evidence-backed proposal content.”
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

function ChannelBadge({ active, label }: { active: boolean, label: string }) {
  return (
    <Badge variant="outline" className={`border-none px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${active ? 'bg-primary text-white' : 'bg-slate-800 text-slate-500'}`}>
      {label}
    </Badge>
  );
}
