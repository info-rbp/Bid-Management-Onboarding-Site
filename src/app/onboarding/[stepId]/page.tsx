
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  LayoutDashboard,
  CheckCircle2,
  Zap,
  Building2,
  AlertCircle,
  FileText,
  Award,
  ShoppingCart,
  Users,
  Target,
  DollarSign,
  Globe,
  ShieldCheck,
  FileBadge,
  Gift,
  BarChart3,
  Send,
  MessageSquare,
  Library,
  Scale,
  Loader2,
  HelpCircle,
  Mail,
  Phone,
  User as UserIcon,
  MapPin,
  ExternalLink,
  Info,
  Clock,
  Calendar as CalendarIcon,
  Upload,
  AlertTriangle,
  Target as TargetIcon,
  Quote,
  Sparkles,
  Heart,
  Plus,
  Trash2,
  Briefcase,
  FileStack,
  MessageSquareQuote,
  Image as ImageIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  { id: 'welcome', title: '1. Welcome & Expectations', icon: Zap },
  { id: 'snapshot', title: '2. Business Snapshot', icon: Building2 },
  { id: 'triage', title: '3. Opportunity Triage', icon: AlertCircle },
  { id: 'selection', title: '4. Service Selection', icon: FileText },
  { id: 'profile', title: '5. Business Profile', icon: Award },
  { id: 'menu', title: '6. Offer Menu', icon: ShoppingCart },
  { id: 'capacity', title: '7. Team & Capacity', icon: Users },
  { id: 'proof', title: '8. Proof & Evidence', icon: CheckCircle2 },
  { id: 'goals', title: '9. Goals & Strategy', icon: Target },
  { id: 'commercial', title: '10. Pricing & Commercial', icon: DollarSign },
  { id: 'platform', title: '11. Platform Setup', icon: Globe },
  { id: 'compliance', title: '12. Compliance & Insurance', icon: ShieldCheck },
  { id: 'readiness', title: '13. Tender Readiness', icon: FileBadge, conditional: 'tenderSupplier' },
  { id: 'grants', title: '14. Grants', icon: Gift, conditional: 'grants' },
  { id: 'marketplace', title: '15. Marketplace Strategy', icon: BarChart3, conditional: 'marketplace' },
  { id: 'outreach', title: '16. Outreach Strategy', icon: Send, conditional: 'directProposal' },
  { id: 'quote', title: '17. Quote Support', icon: MessageSquare, conditional: 'quoteRequests' },
  { id: 'workflow', title: '18. Workflow Rules', icon: MessageSquare },
  { id: 'library', title: '19. Document Library', icon: Library },
  { id: 'authority', title: '20. Authority Matrix', icon: Scale },
];

export default function OnboardingStepPage() {
  const { stepId } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const initialSyncDone = useRef<Record<string, boolean>>({});

  const currentStepIndex = STEPS.findIndex(s => s.id === stepId);
  const currentStep = STEPS[currentStepIndex];

  const submissionRef = useMemoFirebase(() => {
    if (!submissionId || !db) return null;
    return doc(db, 'onboardingSubmissions', submissionId);
  }, [submissionId, db]);

  const { data: submission, isLoading: loadingSubmissions } = useDoc(submissionRef);

  useEffect(() => {
    async function initSubmission() {
      if (!user || !db || submissionId) return;

      const q = query(collection(db, 'onboardingSubmissions'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setSubmissionId(querySnapshot.docs[0].id);
      } else {
        const newDoc = await addDoc(collection(db, 'onboardingSubmissions'), {
          userId: user.uid,
          businessName: user.displayName || 'My Business',
          status: 'in_progress',
          currentStep: stepId,
          completedSteps: [],
          sections: {},
          enabledModules: {},
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          completionPercentage: 0,
        });
        setSubmissionId(newDoc.id);
      }
    }
    initSubmission();
  }, [user, db, submissionId, stepId]);

  useEffect(() => {
    const sid = stepId as string;
    if (submission && !initialSyncDone.current[sid]) {
      if (submission.sections?.[sid]) {
        setFormData(submission.sections[sid]);
      } else {
        // Initialize defaults based on step
        if (sid === 'snapshot') {
          setFormData({
            businessDetails: {},
            contactSetup: { numberOfContacts: 2, contacts: [] },
            additionalContactNotes: ''
          });
        } else if (sid === 'triage') {
          setFormData({
            hasLiveOpportunity: null,
            unsureExplanation: '',
            opportunityDetails: {
              supportRequired: []
            }
          });
        } else if (sid === 'selection') {
          setFormData({
            selectedServices: [],
            desiredOutcomes: [],
            enabledModules: {}
          });
        } else if (sid === 'profile') {
          setFormData({
            businessOverview: {},
            valueProposition: { topThreePoints: ['', '', ''] },
            brandPositioning: { descriptiveWords: [] },
            businessValues: {}
          });
        } else if (sid === 'menu') {
          setFormData({
            serviceSetup: { numberOfServices: 3, services: [] },
            promotionRules: {},
            offerMenu: {}
          });
        } else if (sid === 'capacity') {
          setFormData({
            teamSetup: { numberOfMembers: 2, members: [] },
            subcontractors: { usePartners: null, numberOfPartners: 1, partners: [] },
            capacityScaling: { scalingRequirements: [] },
            equipmentSystems: { systemsUsed: [] }
          });
        } else if (sid === 'proof') {
          setFormData({
            caseStudySetup: { numberOfCaseStudies: '1', caseStudies: [] },
            reviewsTestimonials: { hasReviews: '', locations: [], links: '' },
            evidenceGaps: {}
          });
        } else {
          setFormData({});
        }
      }
      initialSyncDone.current[sid] = true;
    }
  }, [submission, stepId]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNavigate = (targetStepId: string) => {
    if (targetStepId === stepId) return;

    if (submissionId && db) {
      const updateData: any = {
        updatedAt: serverTimestamp(),
        lastSavedAt: serverTimestamp(),
      };
      updateData[`sections.${stepId}`] = formData;
      
      if (stepId === 'selection') {
        updateData.enabledModules = formData.enabledModules || {};
      }

      updateDoc(doc(db, 'onboardingSubmissions', submissionId), updateData)
        .catch((error: any) => {
          const contextualError = new FirestorePermissionError({
            path: `onboardingSubmissions/${submissionId}`,
            operation: 'update',
            requestResourceData: updateData,
          });
          errorEmitter.emit('permission-error', contextualError);
        });
    }

    initialSyncDone.current[targetStepId] = false;
    router.push(`/onboarding/${targetStepId}`);
  };

  const validateStep = (sid: string, data: any) => {
    if (sid === 'welcome') {
      const acks = ['ack1', 'ack2', 'ack3', 'ack4', 'ack5', 'ack6', 'ack7'];
      if (!acks.every(ack => data[ack])) return "Please confirm all acknowledgements before proceeding.";
    }

    if (sid === 'snapshot') {
      const biz = data.businessDetails || {};
      const contacts = data.contactSetup?.contacts || [];
      const numContacts = data.contactSetup?.numberOfContacts || 0;
      const missingBiz = !biz.registeredBusinessName || !biz.abn || !biz.businessStructure || !biz.businessEmail || !biz.businessPhone || !biz.registeredAddress;
      const visibleContacts = contacts.slice(0, numContacts);
      const contact1 = visibleContacts[0];
      const missingContact1 = !contact1?.fullName || !contact1?.email || !contact1?.phone || !contact1?.responsibilities?.includes('Primary contact');
      const missingContact2 = numContacts >= 2 && (!visibleContacts[1]?.fullName || !visibleContacts[1]?.email || !visibleContacts[1]?.phone);
      const hasDecisionMaker = visibleContacts.some((c: any) => c.responsibilities?.includes('Final decision-maker'));
      const hasPricing = visibleContacts.some((c: any) => c.responsibilities?.includes('Pricing/commercial approval'));
      const hasUrgent = visibleContacts.some((c: any) => c.responsibilities?.includes('Urgent approvals'));
      if (missingBiz || missingContact1 || missingContact2 || !hasDecisionMaker || !hasPricing || !hasUrgent) {
        return "Please fill in all required fields and nominate required roles before proceeding.";
      }
    }

    if (sid === 'triage') {
      if (!data.hasLiveOpportunity) return "Please answer whether you have a live opportunity.";
      if (data.hasLiveOpportunity === 'Unsure' && !data.unsureExplanation) return "Please explain what you are unsure about.";
      if (data.hasLiveOpportunity === 'Yes') {
        const details = data.opportunityDetails || {};
        if (!details.opportunityType) return "Opportunity type is required.";
        if (!details.opportunityTitle) return "Opportunity name/project title is required.";
        if (!details.deadlineDate && details.urgencyLevel !== 'No confirmed deadline') return "Deadline is required.";
        if (!details.supportRequired || details.supportRequired.length === 0) return "Please select at least one type of support required.";
      }
    }

    if (sid === 'selection') {
      if (!data.selectedServices || data.selectedServices.length === 0) return "At least one service must be selected.";
      if (!data.highestPriorityService) return "Highest priority service is required.";
      if (!data.reasonForSupport) return "Reason for support is required.";
      if (!data.supportLevel) return "Level of support is required.";
    }

    if (sid === 'profile') {
      const overview = data.businessOverview || {};
      const valProp = data.valueProposition || {};
      const points = valProp.topThreePoints || [];
      if (!overview.plainEnglishDescription) return "Business description is required.";
      if (!overview.problemSolved) return "Problem solved is required.";
      if (!valProp.clientOutcomes) return "Client outcomes are required.";
      if (!valProp.differentiators) return "Differentiators are required.";
      if (!valProp.clientsChooseUsBecause) return "The 'Clients choose us because...' field is required.";
      if (points.length < 3 || points.some((p: string) => !p)) return "All three key points are required.";
      if (!data.brandPositioning?.tonePreference) return "Tone preference is required.";
    }

    if (sid === 'menu') {
      const setup = data.serviceSetup || { services: [] };
      const numServicesRaw = setup.numberOfServices || '3';
      const numServices = numServicesRaw === '6 or more' ? 6 : (parseInt(numServicesRaw) || 0);
      const services = setup.services || [];
      if (numServices === 0) return "Please add at least one service.";
      for (let i = 0; i < numServices; i++) {
        const s = services[i];
        if (!s?.name || !s?.description || !s?.inclusions || !s?.exclusions || !s?.deliveryMethods?.length || !s?.pricingMethod || !s?.suitableChannels?.length) {
          return `Please complete all required fields for Service ${i + 1}.`;
        }
      }
    }

    if (sid === 'capacity') {
      const setup = data.teamSetup || { members: [] };
      const numMembersRaw = setup.numberOfMembers || '2';
      const numMembers = numMembersRaw === '6 or more' ? 6 : (parseInt(numMembersRaw) || 0);
      const members = setup.members || [];
      if (numMembers === 0) return "Please add at least one team member.";
      for (let i = 0; i < numMembers; i++) {
        const m = members[i];
        if (!m?.fullName || !m?.roleTitle || !m?.responsibilities) return `Please complete required fields for Team Member ${i + 1}.`;
      }
      if (!data.capacityScaling?.jobsAtOnce || !data.capacityScaling?.currentCapacity || !data.capacityScaling?.couldScale || !data.capacityScaling?.backupPlan) return "Please complete all capacity and scaling fields.";
      if (!data.equipmentSystems?.qualityChecks) return "Please describe your quality checks and supervision processes.";
    }

    if (sid === 'proof') {
      const setup = data.caseStudySetup || { caseStudies: [] };
      const numRaw = setup.numberOfCaseStudies || '1';
      if (numRaw !== 'None yet') {
        const num = numRaw === '5 or more' ? 5 : parseInt(numRaw);
        const studies = setup.caseStudies || [];
        for (let i = 0; i < num; i++) {
          const s = studies[i];
          if (!s?.projectTitle || !s?.clientType || !s?.deliveredSummary || !s?.outcomeSummary) return `Please complete all required fields for Case Study ${i + 1}.`;
        }
      }
      if (!data.reviewsTestimonials?.hasReviews) return "Please select whether you have reviews or testimonials.";
    }

    return null;
  };

  const handleSave = (next: boolean = false) => {
    if (!submissionId || !db) return;
    const isLastStep = currentStepIndex === STEPS.length - 1;
    const nextStepId = next && !isLastStep ? STEPS[currentStepIndex + 1].id : stepId;
    
    if (next) {
      const error = validateStep(stepId as string, formData);
      if (error) {
        toast({ variant: "destructive", title: "Incomplete Section", description: error });
        return;
      }
    }

    const updateData: any = { updatedAt: serverTimestamp(), lastSavedAt: serverTimestamp() };
    updateData[`sections.${stepId}`] = formData;
    if (stepId === 'selection') updateData.enabledModules = formData.enabledModules || {};

    if (next) {
      updateData.currentStep = nextStepId;
      const currentCompleted = submission?.completedSteps || [];
      if (!currentCompleted.includes(stepId as string)) updateData.completedSteps = [...currentCompleted, stepId as string];
      const completedCount = updateData.completedSteps?.length || currentCompleted.length;
      updateData.completionPercentage = (completedCount / STEPS.length) * 100;
    }

    updateDoc(doc(db, 'onboardingSubmissions', submissionId), updateData)
      .catch((error: any) => {
        const contextualError = new FirestorePermissionError({
          path: `onboardingSubmissions/${submissionId}`,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', contextualError);
      });

    if (next) {
      if (!isLastStep) {
        router.push(`/onboarding/${nextStepId}`);
        initialSyncDone.current[nextStepId] = false;
      } else {
        updateDoc(doc(db, 'onboardingSubmissions', submissionId), { status: 'submitted', submittedAt: serverTimestamp() });
        toast({ title: "Onboarding Complete", description: "All steps have been submitted successfully. Welcome to Bid Manager!" });
        router.push('/dashboard');
      }
    } else {
      toast({ title: "Draft Saved", description: "Your progress for this section has been saved." });
    }
  };

  if (loadingSubmissions || !currentStep || !submissionId) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
        <p className="text-sm font-medium text-muted-foreground">Preparing your workspace...</p>
      </div>
    );
  }

  const visibleSteps = STEPS.filter(s => {
    if (!s.conditional) return true;
    const enabled = submission?.enabledModules?.[s.conditional];
    const unsureSelected = submission?.sections?.selection?.selectedServices?.includes('Unsure, please recommend');
    return enabled || unsureSelected;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-body">
      <aside className="w-80 bg-white border-r hidden lg:flex flex-col shrink-0">
        <div className="p-6 border-b">
          <Logo />
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>Overall Progress</span>
              <span>{Math.round(submission?.completionPercentage || 0)}%</span>
            </div>
            <Progress value={submission?.completionPercentage || 0} className="h-2 bg-slate-100" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {visibleSteps.map((step) => {
            const isCompleted = submission?.completedSteps?.includes(step.id);
            const isCurrent = step.id === stepId;
            return (
              <div 
                key={step.id}
                onClick={() => handleNavigate(step.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group ${
                  isCurrent ? 'bg-primary/10 text-primary font-bold shadow-sm' : isCompleted ? 'text-green-600 hover:bg-green-50' : 'text-muted-foreground hover:bg-slate-50'
                }`}
              >
                <div className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-full ${isCurrent ? 'bg-primary text-white' : isCompleted ? 'bg-green-100' : 'bg-slate-100'}`}>
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <step.icon className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-medium truncate">{step.title}</span>
              </div>
            );
          })}
        </div>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground rounded-xl transition-colors" onClick={() => router.push('/dashboard')}>
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-sm font-medium">Return to Dashboard</span>
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 rounded-lg text-muted-foreground"><ChevronLeft className="w-4 h-4" /> Back</Button>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <currentStep.icon className="w-3.5 h-3.5 text-primary" />
              </span>
              <h1 className="text-sm font-bold text-slate-900">{currentStep.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => handleSave(false)} className="gap-2 rounded-lg border-2"><Save className="w-3 h-3" />Save Draft</Button>
            <Button size="sm" onClick={() => handleSave(true)} className="gap-2 rounded-lg font-bold px-6 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">{currentStepIndex === STEPS.length - 1 ? 'Finish Onboarding' : 'Next Step'} <ChevronRight className="w-4 h-4" /></Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50/30">
          <div className="max-w-4xl mx-auto p-8 lg:p-12">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-10 lg:p-14">
                <StepContent stepId={stepId as string} data={formData} onChange={handleFieldChange} />
              </CardContent>
            </Card>
            <div className="mt-10 flex justify-between items-center text-[11px] font-medium text-slate-400 px-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p>Progress is synced with your account.</p>
              </div>
              {submission?.lastSavedAt && <p>Last synced: {new Date(submission.lastSavedAt.seconds * 1000).toLocaleTimeString()}</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StepContent({ stepId, data, onChange }: { stepId: string, data: any, onChange: (field: string, value: any) => void }) {
  switch (stepId) {
    case 'welcome':
      return (
        <div className="space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold tracking-tight text-slate-900">Welcome to Your Bid Manager Onboarding</h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              This onboarding process helps us collect the information we need to understand your business, prepare proposal-ready content, assess your opportunity readiness, and support you across tenders, grants, supplier registrations, marketplace leads, quote requests, and direct proposals.
            </p>
          </div>
          <div className="grid gap-8">
            <div className="p-8 bg-blue-50/40 rounded-3xl border border-blue-100/50 space-y-5">
              <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-primary" /> What to Expect</h3>
              <ul className="space-y-4 text-sm text-blue-800/80 font-medium">
                {["This process usually takes approximately 45–75 minutes.", "You can save your progress and return later.", "You will be asked for business details, service information, team and capacity details, pricing rules, compliance information, opportunity preferences, and approval instructions.", "You can upload supporting documents where relevant.", "Please do not provide passwords, login credentials, or MFA codes through this portal."].map((item, i) => (
                  <li key={i} className="flex gap-4 items-start"><div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 border border-blue-200 text-[10px] font-bold shadow-sm">{i + 1}</div>{item}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-6 pt-4">
              <div className="space-y-1"><h4 className="font-bold text-lg text-slate-900">Before You Continue</h4><p className="text-sm text-muted-foreground">Please confirm the acknowledgements below before moving to the next step.</p></div>
              <div className="space-y-5">
                {[
                  { id: 'ack1', label: 'I confirm I have read, or have had the opportunity to read, the Bid Manager Terms and Conditions.' },
                  { id: 'ack2', label: 'I confirm I am authorised to complete this onboarding process on behalf of the business.' },
                  { id: 'ack3', label: 'I understand that Bid Manager may use the information I provide to prepare client profiles, proposal content, opportunity recommendations, marketplace profiles, tender responses, grant applications, supplier registrations, quote responses, and business development materials, subject to agreed approvals and engagement terms.' },
                  { id: 'ack4', label: 'I understand that final content, pricing, submissions, communications, and commitments may require approval depending on the authority and approval settings I provide later in this onboarding process.' },
                  { id: 'ack5', label: 'I understand that I must not provide passwords, login credentials, or multi-factor authentication codes through this onboarding portal.' },
                  { id: 'ack6', label: 'I understand I can save my progress and return later to continue from where I left off.' },
                  { id: 'ack7', label: 'I understand that the quality and completeness of the information I provide will affect the accuracy of the documents, recommendations, profiles, and action plans Bid Manager prepares.' }
                ].map((ack) => (
                  <div key={ack.id} className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onChange(ack.id, !data[ack.id])}><Checkbox id={ack.id} checked={data[ack.id] || false} onCheckedChange={() => {}} className="mt-0.5"/><Label htmlFor={ack.id} className="text-sm leading-snug cursor-pointer font-medium text-slate-700">{ack.label}</Label></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'snapshot':
      const bizDetails = data.businessDetails || {};
      const contactSetup = data.contactSetup || { numberOfContacts: 2, contacts: [] };
      const contacts = contactSetup.contacts || [];
      const numContacts = contactSetup.numberOfContacts || 2;
      const handleBizChange = (field: string, val: any) => onChange('businessDetails', { ...bizDetails, [field]: val });
      const handleContactChange = (index: number, field: string, val: any) => {
        const next = [...contacts];
        if (!next[index]) next[index] = { contactNumber: index + 1, responsibilities: [] };
        next[index] = { ...next[index], [field]: val };
        onChange('contactSetup', { ...contactSetup, contacts: next });
      };
      const handleRespToggle = (index: number, resp: string) => {
        const next = [...contacts];
        if (!next[index]) next[index] = { contactNumber: index + 1, responsibilities: [] };
        const current = next[index].responsibilities || [];
        const nextResps = current.includes(resp) ? current.filter((r: string) => r !== resp) : [...current, resp];
        next[index] = { ...next[index], responsibilities: nextResps };
        onChange('contactSetup', { ...contactSetup, contacts: next });
      };
      const hasDecisionMaker = contacts.slice(0, numContacts).some(c => c.responsibilities?.includes('Final decision-maker'));
      const hasPricing = contacts.slice(0, numContacts).some(c => c.responsibilities?.includes('Pricing/commercial approval'));
      const hasUrgent = contacts.slice(0, numContacts).some(c => c.responsibilities?.includes('Urgent approvals'));
      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Business Snapshot and Contact Details</h2>
            <p className="text-slate-500 text-lg leading-relaxed">Provide your official business details and key contact people so we can create your client profile, confirm who can approve decisions, and know who to contact for business, pricing, compliance, documents, and urgent matters.</p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-xl"><Building2 className="w-5 h-5 text-primary" /></div><h3 className="text-xl font-bold text-slate-900">Business Details</h3></div>
            <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm"><CardContent className="p-8 space-y-8"><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><Label className="font-bold text-slate-700">Registered Business Name *</Label><Input value={bizDetails.registeredBusinessName || ''} onChange={(e) => handleBizChange('registeredBusinessName', e.target.value)} placeholder="e.g. Acme Industries Pty Ltd" className="h-12 rounded-xl"/></div><div className="space-y-2"><Label className="font-bold text-slate-700">ABN *</Label><Input value={bizDetails.abn || ''} onChange={(e) => handleBizChange('abn', e.target.value)} placeholder="00 000 000 000" className="h-12 rounded-xl"/></div><div className="space-y-2"><Label className="font-bold text-slate-700">Business Structure *</Label><Select value={bizDetails.businessStructure || ''} onValueChange={(val) => handleBizChange('businessStructure', val)}><SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select structure" /></SelectTrigger><SelectContent>{["Sole trader", "Company", "Partnership", "Trust", "Not-for-profit", "Indigenous business", "Other"].map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label className="font-bold text-slate-700">Business Email Address *</Label><Input type="email" value={bizDetails.businessEmail || ''} onChange={(e) => handleBizChange('businessEmail', e.target.value)} placeholder="hello@company.com" className="h-12 rounded-xl"/></div></div><div className="space-y-2"><Label className="font-bold text-slate-700">Registered Business Address *</Label><div className="relative"><MapPin className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" /><Input value={bizDetails.registeredAddress || ''} onChange={(e) => handleBizChange('registeredAddress', e.target.value)} placeholder="Full address" className="pl-10 h-12 rounded-xl"/></div></div><div className="space-y-2"><Label className="font-bold text-slate-700">Business Phone Number *</Label><Input value={bizDetails.businessPhone || ''} onChange={(e) => handleBizChange('businessPhone', e.target.value)} placeholder="+61 0 0000 0000" className="h-12 rounded-xl"/></div></CardContent></Card>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-xl"><Users className="w-5 h-5 text-primary" /></div><h3 className="text-xl font-bold text-slate-900">Contact Setup</h3></div>
            <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm"><CardContent className="p-8 space-y-8"><div className="space-y-4"><Label className="text-lg font-bold text-slate-800">How many contacts would you like to add?</Label><div className="max-w-[240px]"><Select value={numContacts.toString()} onValueChange={(val) => onChange('contactSetup', { ...contactSetup, numberOfContacts: parseInt(val) })}><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={n.toString()}>{n} contact{n > 1 ? 's' : ''}</SelectItem>)}</SelectContent></Select></div></div>
            <div className="space-y-6">{Array.from({ length: numContacts }).map((_, idx) => {
              const contact = contacts[idx] || { responsibilities: [] };
              const label = idx === 0 ? "Primary Contact" : idx === 1 ? "Secondary Contact" : "Additional Contact";
              return (<div key={idx} className="p-8 border border-slate-100 bg-slate-50/30 rounded-[2rem] space-y-6"><h4 className="font-bold text-slate-900 text-lg">Contact {idx + 1}: <span className="text-primary">{label}</span></h4><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><Label className="font-bold text-slate-700">Full Name *</Label><Input value={contact.fullName || ''} onChange={(e) => handleContactChange(idx, 'fullName', e.target.value)} className="h-12 rounded-xl bg-white"/></div><div className="space-y-2"><Label className="font-bold text-slate-700">Role / Title</Label><Input value={contact.roleTitle || ''} onChange={(e) => handleContactChange(idx, 'roleTitle', e.target.value)} className="h-12 rounded-xl bg-white"/></div><div className="space-y-2"><Label className="font-bold text-slate-700">Email Address *</Label><Input type="email" value={contact.email || ''} onChange={(e) => handleContactChange(idx, 'email', e.target.value)} className="h-12 rounded-xl bg-white"/></div><div className="space-y-2"><Label className="font-bold text-slate-700">Phone Number *</Label><Input value={contact.phone || ''} onChange={(e) => handleContactChange(idx, 'phone', e.target.value)} className="h-12 rounded-xl bg-white"/></div></div>
              <div className="space-y-4 pt-2"><Label className="font-bold text-slate-900 block pb-2">Responsibilities / Permissions *</Label><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{["Primary contact", "Secondary contact", "Final decision-maker", "Pricing/commercial approval", "Compliance documents", "Insurance documents", "Licences/certifications", "Urgent approvals", "Technical questions", "Other"].map((resp) => {
                const isRestricted = idx === 0 && resp === "Primary contact";
                const checked = contact.responsibilities?.includes(resp) || (idx === 0 && resp === "Primary contact");
                return (<div key={resp} className={`flex items-center space-x-2 p-3 rounded-xl border cursor-pointer ${checked ? 'border-primary/30 bg-primary/5 shadow-sm' : 'border-slate-100 bg-white'}`} onClick={() => !isRestricted && handleRespToggle(idx, resp)}><Checkbox id={`resp-${idx}-${resp}`} checked={checked} disabled={isRestricted} onCheckedChange={() => {}} /><Label htmlFor={`resp-${idx}-${resp}`} className="text-xs font-medium cursor-pointer">{resp}</Label></div>);
              })}</div></div></div>);
            })}</div><div className="space-y-4 pt-4">{!hasDecisionMaker && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>Please nominate at least one final decision-maker.</AlertDescription></Alert>}{!hasPricing && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>Please nominate who can approve pricing and commercial decisions.</AlertDescription></Alert>}{!hasUrgent && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>Please nominate who we should contact for urgent approvals.</AlertDescription></Alert>}</div></CardContent></Card>
          </div>
        </div>
      );

    case 'triage':
      const hasOpp = data.hasLiveOpportunity;
      const details = data.opportunityDetails || { supportRequired: [] };
      const handleDetailsChange = (field: string, val: any) => onChange('opportunityDetails', { ...details, [field]: val });
      const handleSupportToggle = (opt: string) => {
        const current = details.supportRequired || [];
        const next = current.includes(opt) ? current.filter((i: string) => i !== opt) : [...current, opt];
        handleDetailsChange('supportRequired', next);
      };
      return (
        <div className="space-y-12">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Immediate Need and Live Opportunity Triage</h2><p className="text-slate-500 text-lg leading-relaxed">Tell us whether you currently have a tender, grant, or other opportunity that needs urgent review.</p></div>
          <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm"><CardContent className="p-8 space-y-8"><div className="space-y-4"><Label className="text-lg font-bold text-slate-800">Do you currently have a live opportunity? *</Label><RadioGroup value={hasOpp} onValueChange={(val) => onChange('hasLiveOpportunity', val)} className="grid grid-cols-1 md:grid-cols-3 gap-4">{['Yes', 'No', 'Unsure'].map((opt) => (<div key={opt} className="relative"><RadioGroupItem value={opt} id={`status-${opt}`} className="peer sr-only" /><Label htmlFor={`status-${opt}`} className="flex items-center justify-center h-14 border-2 rounded-2xl cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-slate-50 transition-all font-bold">{opt}</Label></div>))}</RadioGroup></div>
          {hasOpp === 'No' && <Alert className="bg-green-50 text-green-700 border-green-100"><CheckCircle2 className="h-4 w-4" /><AlertDescription>No live opportunity recorded. You can continue.</AlertDescription></Alert>}
          {hasOpp === 'Unsure' && (<div className="space-y-4 animate-in fade-in slide-in-from-top-2"><Label className="font-bold text-slate-700">Briefly explain what you are unsure about *</Label><Textarea value={data.unsureExplanation || ''} onChange={(e) => onChange('unsureExplanation', e.target.value)} className="min-h-[100px] rounded-2xl" /></div>)}</CardContent></Card>
          {hasOpp === 'Yes' && (<Card className="border border-amber-200 bg-amber-50/5 rounded-3xl overflow-hidden shadow-sm"><CardContent className="p-8 space-y-10"><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="space-y-3"><Label className="font-bold text-slate-700">Opportunity Type *</Label><Select value={details.opportunityType || ''} onValueChange={(val) => handleDetailsChange('opportunityType', val)}><SelectTrigger className="h-12 rounded-xl bg-white"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent>{["Government tender", "Private tender", "Grant", "Panel or supplier registration", "Marketplace lead", "Direct proposal", "Quote request", "Other"].map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select></div><div className="space-y-3"><Label className="font-bold text-slate-700">Opportunity Name *</Label><Input value={details.opportunityTitle || ''} onChange={(e) => handleDetailsChange('opportunityTitle', e.target.value)} className="h-12 rounded-xl bg-white" /></div><div className="space-y-3"><Label className="font-bold text-slate-700">Deadline *</Label><Input type="date" value={details.deadlineDate || ''} onChange={(e) => handleDetailsChange('deadlineDate', e.target.value)} className="h-12 rounded-xl bg-white" /></div></div><div className="space-y-6"><Label className="font-bold text-slate-800 text-lg">What support do you need? *</Label><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{["Review only", "Draft response", "Prepare pricing", "Submit on our behalf", "Unsure"].map((opt) => (<div key={opt} className={`flex items-center space-x-2 p-4 rounded-xl border cursor-pointer ${details.supportRequired?.includes(opt) ? 'border-primary bg-primary/5' : 'bg-white'}`} onClick={() => handleSupportToggle(opt)}><Checkbox id={`support-${opt}`} checked={details.supportRequired?.includes(opt)} onCheckedChange={() => {}} /><Label htmlFor={`support-${opt}`} className="text-xs font-medium cursor-pointer">{opt}</Label></div>))}</div></div></CardContent></Card>)}
        </div>
      );

    case 'selection':
      const selectedServices = data.selectedServices || [];
      const handleServiceToggle = (service: string) => {
        const next = selectedServices.includes(service) ? selectedServices.filter((s: string) => s !== service) : [...selectedServices, service];
        const modules = {
          tenderSupplier: next.includes('Government Tenders') || next.includes('Private Tenders') || next.includes('Panel or Supplier Registrations'),
          grants: next.includes('Grants'),
          marketplace: next.includes('Marketplace Leads'),
          directProposal: next.includes('Direct Proposals'),
          quoteRequests: next.includes('Quote Requests'),
        };
        if (next.includes('Unsure, please recommend')) modules.tenderSupplier = modules.grants = modules.marketplace = modules.directProposal = modules.quoteRequests = true;
        onChange('selectedServices', next);
        onChange('enabledModules', modules);
      };
      return (
        <div className="space-y-12">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Service Selection & Engagement Scope</h2><p className="text-slate-500 text-lg leading-relaxed">Select the services you want support with.</p></div>
          <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm"><CardContent className="p-8 space-y-6"><Label className="text-lg font-bold text-slate-800">Which services would you like support with? *</Label><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{["Government Tenders", "Private Tenders", "Panel or Supplier Registrations", "Grants", "Marketplace Leads", "Direct Proposals", "Quote Requests", "Unsure, please recommend"].map((service) => (<div key={service} className={`flex items-center space-x-3 p-4 rounded-2xl border cursor-pointer ${selectedServices.includes(service) ? 'border-primary bg-primary/5' : 'bg-white'}`} onClick={() => handleServiceToggle(service)}><Checkbox id={`service-${service}`} checked={selectedServices.includes(service)} onCheckedChange={() => {}} /><Label htmlFor={`service-${service}`} className="text-sm font-medium cursor-pointer">{service}</Label></div>))}</div></CardContent></Card>
          <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm"><CardContent className="p-8 space-y-6"><Label className="font-bold text-slate-700">Highest Priority Service *</Label><Select value={data.highestPriorityService || ''} onValueChange={(val) => onChange('highestPriorityService', val)}><SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select priority" /></SelectTrigger><SelectContent>{["Government Tenders", "Private Tenders", "Grants", "Marketplace Leads", "Direct Proposals", "Quote Requests", "Unsure"].map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select><Label className="font-bold text-slate-700 pt-4 block">Why are these services important now? *</Label><Textarea value={data.reasonForSupport || ''} onChange={(e) => onChange('reasonForSupport', e.target.value)} className="min-h-[120px] rounded-2xl" /><Label className="font-bold text-slate-700 pt-4 block text-lg">How involved should Bid Manager be? *</Label><RadioGroup value={data.supportLevel || ''} onValueChange={(val) => onChange('supportLevel', val)} className="space-y-3">{["Full end-to-end management", "Opportunity review only", "Drafting only", "Submission support only", "Unsure"].map((lvl) => (<div key={lvl} className="relative"><RadioGroupItem value={lvl} id={`lvl-${lvl}`} className="peer sr-only" /><Label htmlFor={`lvl-${lvl}`} className="flex items-center p-4 border-2 rounded-2xl cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-slate-50 font-medium text-sm">{lvl}</Label></div>))}</RadioGroup></CardContent></Card>
        </div>
      );

    case 'profile':
      const overview = data.businessOverview || {};
      const valProp = data.valueProposition || {};
      const handleOverviewChange = (field: string, val: string) => onChange('businessOverview', { ...overview, [field]: val });
      const handleValPropChange = (field: string, val: any) => onChange('valueProposition', { ...valProp, [field]: val });
      const handlePointChange = (idx: number, val: string) => {
        const next = [...(valProp.topThreePoints || ['', '', ''])];
        next[idx] = val;
        handleValPropChange('topThreePoints', next);
      };
      return (
        <div className="space-y-12">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Business Profile & Positioning</h2><p className="text-slate-500 text-lg leading-relaxed">Help us understand who your business is and how we should position you.</p></div>
          <Card className="border border-slate-200 rounded-3xl shadow-sm"><div className="p-8 border-b bg-slate-50/50 font-bold text-xl flex items-center gap-3"><Building2 className="w-5 h-5 text-primary"/>Business Overview</div><CardContent className="p-8 space-y-6"><Label className="font-bold text-slate-700">In plain English, what does your business do? *</Label><Textarea value={overview.plainEnglishDescription || ''} onChange={(e) => handleOverviewChange('plainEnglishDescription', e.target.value)} className="min-h-[100px] rounded-2xl" /><Label className="font-bold text-slate-700">What problem does your business solve? *</Label><Textarea value={overview.problemSolved || ''} onChange={(e) => handleOverviewChange('problemSolved', e.target.value)} className="min-h-[100px] rounded-2xl" /></CardContent></Card>
          <Card className="border border-slate-200 rounded-3xl shadow-sm"><div className="p-8 border-b bg-slate-50/50 font-bold text-xl flex items-center gap-3"><Sparkles className="w-5 h-5 text-primary"/>Value Proposition</div><CardContent className="p-8 space-y-6"><Label className="font-bold text-slate-700">What outcomes do clients receive? *</Label><Textarea value={valProp.clientOutcomes || ''} onChange={(e) => handleValPropChange('clientOutcomes', e.target.value)} className="min-h-[100px] rounded-2xl" /><Label className="font-bold text-slate-700">“Clients choose us because...” *</Label><Textarea value={valProp.clientsChooseUsBecause || ''} onChange={(e) => handleValPropChange('clientsChooseUsBecause', e.target.value)} className="min-h-[80px] rounded-2xl" /><Label className="font-bold text-slate-700">Top three things clients should remember *</Label><div className="space-y-3">{[0, 1, 2].map(i => <Input key={i} value={(valProp.topThreePoints || [])[i] || ''} onChange={(e) => handlePointChange(i, e.target.value)} placeholder={`Point ${i + 1}`} className="h-12 rounded-xl" />)}</div></CardContent></Card>
        </div>
      );

    case 'menu':
      const setup = data.serviceSetup || { services: [] };
      const numServicesRaw = setup.numberOfServices || '3';
      const numServices = numServicesRaw === '6 or more' ? 6 : (parseInt(numServicesRaw) || 3);
      const handleSChange = (i: number, f: string, v: any) => {
        const next = [...(setup.services || [])];
        if (!next[i]) next[i] = { serviceNumber: i + 1, deliveryMethods: [], suitableChannels: [] };
        next[i] = { ...next[i], [f]: v };
        onChange('serviceSetup', { ...setup, services: next });
      };
      return (
        <div className="space-y-12">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Services & Offer Menu</h2><p className="text-slate-500 text-lg leading-relaxed">Define what you offer and how it should be presented.</p></div>
          <Card className="border border-slate-200 rounded-3xl shadow-sm"><div className="p-8 border-b bg-slate-50/50 font-bold text-xl">Service Setup</div><CardContent className="p-8 space-y-10"><Label className="text-lg font-bold">Number of services</Label><div className="max-w-[240px]"><Select value={numServicesRaw} onValueChange={(v) => onChange('serviceSetup', { ...setup, numberOfServices: v })}><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{["1", "2", "3", "4", "5", "6 or more"].map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-8">{Array.from({ length: numServices }).map((_, i) => (<div key={i} className="p-8 border rounded-[2rem] bg-slate-50/30 space-y-6"><h4 className="font-bold text-lg">Service {i + 1}</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><Label className="font-bold">Name *</Label><Input value={(setup.services || [])[i]?.name || ''} onChange={(e) => handleSChange(i, 'name', e.target.value)} className="h-12 rounded-xl bg-white" /></div><div className="space-y-2"><Label className="font-bold">Pricing Method *</Label><Select value={(setup.services || [])[i]?.pricingMethod || ''} onValueChange={(v) => handleSChange(i, 'pricingMethod', v)}><SelectTrigger className="h-12 rounded-xl bg-white"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["Hourly rate", "Fixed fee", "Package", "Quote", "Other"].map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select></div></div><div className="space-y-2"><Label className="font-bold">Description *</Label><Textarea value={(setup.services || [])[i]?.description || ''} onChange={(e) => handleSChange(i, 'description', e.target.value)} className="min-h-[80px] rounded-2xl bg-white" /></div></div>))}</div></CardContent></Card>
        </div>
      );

    case 'capacity':
      const team = data.teamSetup || { members: [] };
      const numMembersRaw = team.numberOfMembers || '2';
      const numMembers = numMembersRaw === '6 or more' ? 6 : (parseInt(numMembersRaw) || 2);
      const handleMChange = (i: number, f: string, v: any) => {
        const next = [...(team.members || [])];
        if (!next[i]) next[i] = { memberNumber: i + 1 };
        next[i] = { ...next[i], [f]: v };
        onChange('teamSetup', { ...team, members: next });
      };
      return (
        <div className="space-y-12">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Team & Capacity</h2><p className="text-slate-500 text-lg leading-relaxed">Who delivers the work and what is your capacity?</p></div>
          <Card className="border border-slate-200 rounded-3xl shadow-sm"><div className="p-8 border-b bg-slate-50/50 font-bold text-xl">Team Setup</div><CardContent className="p-8 space-y-10"><Label className="text-lg font-bold">Number of members</Label><div className="max-w-[240px]"><Select value={numMembersRaw} onValueChange={(v) => onChange('teamSetup', { ...team, numberOfMembers: v })}><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{["1", "2", "3", "4", "5", "6 or more"].map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-8">{Array.from({ length: numMembers }).map((_, i) => (<div key={i} className="p-8 border rounded-[2rem] bg-slate-50/30 space-y-6"><h4 className="font-bold text-lg">Member {i + 1}</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><Label className="font-bold">Full Name *</Label><Input value={(team.members || [])[i]?.fullName || ''} onChange={(e) => handleMChange(i, 'fullName', e.target.value)} className="h-12 rounded-xl bg-white" /></div><div className="space-y-2"><Label className="font-bold">Role *</Label><Input value={(team.members || [])[i]?.roleTitle || ''} onChange={(e) => handleMChange(i, 'roleTitle', e.target.value)} className="h-12 rounded-xl bg-white" /></div></div></div>))}</div></CardContent></Card>
        </div>
      );

    case 'proof':
      const proofSetup = data.caseStudySetup || { numberOfCaseStudies: '1', caseStudies: [] };
      const studiesNumRaw = proofSetup.numberOfCaseStudies || '1';
      const studiesNum = studiesNumRaw === 'None yet' ? 0 : (studiesNumRaw === '5 or more' ? 5 : parseInt(studiesNumRaw));
      const handleStudyChange = (i: number, f: string, v: any) => {
        const next = [...(proofSetup.caseStudies || [])];
        if (!next[i]) next[i] = { studyNumber: i + 1, evidence: [] };
        next[i] = { ...next[i], [f]: v };
        onChange('caseStudySetup', { ...proofSetup, caseStudies: next });
      };
      const handleEvidenceToggle = (i: number, opt: string) => {
        const next = [...(proofSetup.caseStudies || [])];
        if (!next[i]) next[i] = { studyNumber: i + 1, evidence: [] };
        const current = next[i].evidence || [];
        const nextEv = current.includes(opt) ? current.filter((o: string) => o !== opt) : [...current, opt];
        next[i] = { ...next[i], evidence: nextEv };
        onChange('caseStudySetup', { ...proofSetup, caseStudies: next });
      };
      const reviews = data.reviewsTestimonials || { hasReviews: '', locations: [], links: '' };
      const handleReviewLocToggle = (opt: string) => {
        const current = reviews.locations || [];
        const next = current.includes(opt) ? current.filter((o: string) => o !== opt) : [...current, opt];
        onChange('reviewsTestimonials', { ...reviews, locations: next });
      };
      const gaps = data.evidenceGaps || {};

      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Proof, Case Studies & Evidence</h2>
            <p className="text-slate-500 text-lg leading-relaxed">Add examples of completed work, client outcomes, testimonials, and references we can use to support your bids.</p>
          </div>

          <Card className="border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><FileStack className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold text-slate-900">Case Study Setup</h3>
            </div>
            <CardContent className="p-8 space-y-10">
              <div className="space-y-4">
                <Label className="text-lg font-bold">How many case studies would you like to add?</Label>
                <div className="max-w-[240px]">
                  <Select value={studiesNumRaw} onValueChange={(v) => onChange('caseStudySetup', { ...proofSetup, numberOfCaseStudies: v })}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{["None yet", "1", "2", "3", "4", "5 or more"].map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {studiesNumRaw === 'None yet' && (
                <Alert className="bg-slate-50 border-slate-200"><Info className="h-4 w-4" /><AlertDescription>No case studies recorded yet. We will treat this as a content gap to review later.</AlertDescription></Alert>
              )}

              <div className="space-y-8">
                {Array.from({ length: studiesNum }).map((_, i) => {
                  const study = (proofSetup.caseStudies || [])[i] || {};
                  return (
                    <div key={i} className="p-8 border border-slate-100 bg-slate-50/30 rounded-[2.5rem] space-y-8">
                      <h4 className="font-bold text-xl flex items-center gap-3">
                        <Badge variant="secondary" className="w-8 h-8 rounded-full p-0 flex items-center justify-center font-bold text-primary bg-primary/10">{i + 1}</Badge>
                        Case Study {i + 1}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2"><Label className="font-bold">Project Title *</Label><Input value={study.projectTitle || ''} onChange={(e) => handleStudyChange(i, 'projectTitle', e.target.value)} placeholder="e.g. Bridge Construction Upgrade" className="h-12 rounded-xl bg-white" /></div>
                        <div className="space-y-2"><Label className="font-bold">Client Name</Label><Input value={study.clientName || ''} onChange={(e) => handleStudyChange(i, 'clientName', e.target.value)} className="h-12 rounded-xl bg-white" /></div>
                        <div className="space-y-2">
                          <Label className="font-bold">Client Type *</Label>
                          <Select value={study.clientType || ''} onValueChange={(v) => handleStudyChange(i, 'clientType', v)}>
                            <SelectTrigger className="h-12 rounded-xl bg-white"><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>{["Residential", "Commercial", "Government", "Corporate", "Not-for-profit", "Small business", "Confidential", "Other"].map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2"><Label className="font-bold">Approximate Value</Label><Input value={study.approxValue || ''} onChange={(e) => handleStudyChange(i, 'approxValue', e.target.value)} placeholder="e.g. $500k" className="h-12 rounded-xl bg-white" /></div>
                      </div>
                      <div className="space-y-2"><Label className="font-bold">What did your business deliver? *</Label><Textarea value={study.deliveredSummary || ''} onChange={(e) => handleStudyChange(i, 'deliveredSummary', e.target.value)} className="min-h-[80px] rounded-2xl bg-white" /></div>
                      <div className="space-y-2"><Label className="font-bold">What was the result or outcome? *</Label><Textarea value={study.outcomeSummary || ''} onChange={(e) => handleStudyChange(i, 'outcomeSummary', e.target.value)} className="min-h-[80px] rounded-2xl bg-white" /></div>
                      <div className="space-y-4">
                        <Label className="font-bold">What evidence is available?</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {["Photos", "Before/After", "Completion cert", "Testimonial", "Online review", "Referee contact", "Other"].map(opt => (
                            <div key={opt} className={`flex items-center space-x-2 p-3 rounded-xl border cursor-pointer ${study.evidence?.includes(opt) ? 'border-primary bg-primary/5' : 'bg-white'}`} onClick={() => handleEvidenceToggle(i, opt)}>
                              <Checkbox id={`ev-${i}-${opt}`} checked={study.evidence?.includes(opt)} onCheckedChange={() => {}} />
                              <Label htmlFor={`ev-${i}-${opt}`} className="text-xs font-medium cursor-pointer">{opt}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><MessageSquareQuote className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold text-slate-900">Reviews and Testimonials</h3>
            </div>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <Label className="text-lg font-bold">Do you have testimonials, reviews, or references? *</Label>
                <RadioGroup value={reviews.hasReviews} onValueChange={(v) => onChange('reviewsTestimonials', { ...reviews, hasReviews: v })} className="flex flex-wrap gap-6">
                  {["Yes", "No", "Some, but need organising", "Unsure"].map(opt => (
                    <div key={opt} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`rev-${opt}`} />
                      <Label htmlFor={`rev-${opt}`}>{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-4">
                <Label className="font-bold">Where are they located?</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["Google reviews", "Facebook", "Airtasker", "hipages", "Website", "Written emails", "Other"].map(opt => (
                    <div key={opt} className={`flex items-center space-x-2 p-3 rounded-xl border cursor-pointer ${reviews.locations?.includes(opt) ? 'border-primary bg-primary/5' : 'bg-white'}`} onClick={() => handleReviewLocToggle(opt)}>
                      <Checkbox id={`loc-${opt}`} checked={reviews.locations?.includes(opt)} onCheckedChange={() => {}} />
                      <Label htmlFor={`loc-${opt}`} className="text-xs font-medium cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2"><Label className="font-bold">Links to review pages or testimonials</Label><Textarea value={reviews.links || ''} onChange={(e) => onChange('reviewsTestimonials', { ...reviews, links: e.target.value })} placeholder="Paste URLs here..." className="min-h-[100px] rounded-2xl" /></div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><ImageIcon className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold text-slate-900">Evidence Gaps</h3>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2"><Label className="font-bold">What proof or evidence do you wish you had but do not yet have?</Label><Textarea value={gaps.missingProof || ''} onChange={(e) => onChange('evidenceGaps', { ...gaps, missingProof: e.target.value })} className="min-h-[80px] rounded-2xl" /></div>
              <div className="space-y-2"><Label className="font-bold">Are there clients we should help turn into case studies later?</Label><Textarea value={gaps.candidates || ''} onChange={(e) => onChange('evidenceGaps', { ...gaps, candidates: e.target.value })} className="min-h-[80px] rounded-2xl" /></div>
            </CardContent>
          </Card>
        </div>
      );

    default:
      return (
        <div className="py-24 text-center space-y-6">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto shadow-inner"><FileText className="w-10 h-10 text-slate-400" /></div>
          <div className="space-y-2"><h2 className="text-2xl font-bold text-slate-900">Section Under Development</h2><p className="text-slate-500 max-w-md mx-auto leading-relaxed">We're currently preparing the specialized questionnaire for the <span className="text-primary font-bold">"{STEPS.find(s => s.id === stepId)?.title}"</span> section.</p></div>
          <Button variant="outline" onClick={() => handleSave(true)} className="rounded-xl border-2 px-8">Skip for now <ChevronRight className="ml-2 w-4 h-4" /></Button>
        </div>
      );
  }
}
