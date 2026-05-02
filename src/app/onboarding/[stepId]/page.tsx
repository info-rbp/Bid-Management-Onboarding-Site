
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { 
  ChevronRight, 
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
  AlertTriangle,
  UploadCloud,
  ShieldAlert,
  Trash2,
  Files,
  FileStack,
  UserCheck,
  Flag,
  Clock
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const ALL_STEPS = [
  {
    key: "welcome_expectations",
    title: "1. Welcome & Expectations",
    shortTitle: "Welcome & Expectations",
    icon: Zap,
    required: true,
    conditional: false
  },
  {
    key: "business_snapshot",
    title: "2. Business Snapshot",
    shortTitle: "Business Snapshot",
    icon: Building2,
    required: true,
    conditional: false
  },
  {
    key: "opportunity_triage",
    title: "3. Opportunity Triage",
    shortTitle: "Opportunity Triage",
    icon: AlertCircle,
    required: true,
    conditional: false
  },
  {
    key: "service_selection",
    title: "4. Service Selection",
    shortTitle: "Service Selection",
    icon: FileText,
    required: true,
    conditional: false
  },
  {
    key: "business_profile",
    title: "5. Business Profile",
    shortTitle: "Business Profile",
    icon: Award,
    required: true,
    conditional: false
  },
  {
    key: "offer_menu",
    title: "6. Offer Menu",
    shortTitle: "Offer Menu",
    icon: ShoppingCart,
    required: true,
    conditional: false
  },
  {
    key: "team_capacity",
    title: "7. Team & Capacity",
    shortTitle: "Team & Capacity",
    icon: Users,
    required: true,
    conditional: false
  },
  {
    key: "proof_evidence",
    title: "8. Proof & Evidence",
    shortTitle: "Proof & Evidence",
    icon: CheckCircle2,
    required: true,
    conditional: false
  },
  {
    key: "goals_strategy",
    title: "9. Goals & Strategy",
    shortTitle: "Goals & Strategy",
    icon: Target,
    required: true,
    conditional: false
  },
  {
    key: "pricing_commercial",
    title: "10. Pricing & Commercial",
    shortTitle: "Pricing & Commercial",
    icon: DollarSign,
    required: true,
    conditional: false
  },
  {
    key: "platform_setup",
    title: "11. Platform Setup",
    shortTitle: "Platform Setup",
    icon: Globe,
    required: true,
    conditional: false
  },
  {
    key: "compliance_insurance",
    title: "12. Compliance & Insurance",
    shortTitle: "Compliance & Insurance",
    icon: ShieldCheck,
    required: true,
    conditional: false
  },
  {
    key: "tender_readiness",
    title: "13. Tender Readiness",
    shortTitle: "Tender Readiness",
    icon: FileBadge,
    required: false,
    conditional: true,
    isEnabled: (selectedServices: string[]) =>
      selectedServices.includes("Government Tenders") ||
      selectedServices.includes("Private Tenders") ||
      selectedServices.includes("Panel or Supplier Registrations") ||
      selectedServices.includes("Unsure, please recommend")
  },
  {
    key: "grants",
    title: "14. Grants",
    shortTitle: "Grants",
    icon: Gift,
    required: false,
    conditional: true,
    isEnabled: (selectedServices: string[]) =>
      selectedServices.includes("Grants") ||
      selectedServices.includes("Unsure, please recommend")
  },
  {
    key: "marketplace_strategy",
    title: "15. Marketplace Strategy",
    shortTitle: "Marketplace Strategy",
    icon: BarChart3,
    required: false,
    conditional: true,
    isEnabled: (selectedServices: string[]) =>
      selectedServices.includes("Marketplace Leads") ||
      selectedServices.includes("Unsure, please recommend")
  },
  {
    key: "direct_outreach_strategy",
    title: "16. Outreach Strategy",
    shortTitle: "Outreach Strategy",
    icon: Send,
    required: false,
    conditional: true,
    isEnabled: (selectedServices: string[]) =>
      selectedServices.includes("Direct Proposals") ||
      selectedServices.includes("Unsure, please recommend")
  },
  {
    key: "quote_support",
    title: "17. Quote Support",
    shortTitle: "Quote Support",
    icon: MessageSquare,
    required: false,
    conditional: true,
    isEnabled: (selectedServices: string[]) =>
      selectedServices.includes("Quote Requests") ||
      selectedServices.includes("Marketplace Leads") ||
      selectedServices.includes("Direct Proposals") ||
      selectedServices.includes("Unsure, please recommend")
  },
  {
    key: "workflow_rules",
    title: "18. Workflow Rules",
    shortTitle: "Workflow Rules",
    icon: Clock,
    required: true,
    conditional: false
  },
  {
    key: "document_upload_library",
    title: "19. Document Upload Library",
    shortTitle: "Document Upload Library",
    icon: Library,
    required: true,
    conditional: false
  },
  {
    key: "authority_matrix",
    title: "20. Authority Matrix",
    shortTitle: "Authority Matrix",
    icon: Scale,
    required: true,
    conditional: false
  },
  {
    key: "final_submission",
    title: "21. Final Submission",
    shortTitle: "Final Submission",
    icon: Flag,
    required: true,
    conditional: false
  }
];

const AUTHORITY_ROWS = [
  "Search for opportunities",
  "Recommend opportunities",
  "Create or update platform profiles",
  "Register on free platforms",
  "Register on paid platforms",
  "Assist with supplier, tender, or grant registrations",
  "Draft responses, quotes, and applications",
  "Ask clarification questions",
  "Communicate with buyers, funders, or leads",
  "Prepare marketplace responses",
  "Submit marketplace responses",
  "Submit quote requests",
  "Submit tenders",
  "Submit grants",
  "Provide pricing",
  "Accept terms or contract conditions",
  "Use supplied documents in submissions",
  "Maintain a reusable bid library",
  "Follow up with buyers, funders, or leads"
];

const AUTHORITY_LEVELS = [
  "Authorised",
  "Authorised after approval",
  "Not authorised",
  "Unsure"
];

const HIGH_RISK_AUTHORITY_ITEMS = [
  "Submit tenders",
  "Submit grants",
  "Provide pricing",
  "Accept terms or contract conditions",
  "Register on paid platforms"
];

const CRITICAL_DOC_FIELDS = [
  'capabilityStatement',
  'publicLiability',
  'professionalIndemnity',
  'workersComp',
  'licences',
  'certifications',
  'pricingSchedules'
];

const DOCUMENT_CATEGORIES = [
  {
    id: 'business',
    title: '1. Business Profile and Brand',
    icon: Building2,
    fields: [
      { id: 'capabilityStatement', label: 'Capability statement' },
      { id: 'businessProfile', label: 'Business profile or brochure' },
      { id: 'logoFiles', label: 'Logo files' },
      { id: 'brandAssets', label: 'Brand assets' },
      { id: 'styleGuide', label: 'Style guide' },
      { id: 'marketingCopy', label: 'Website or marketing copy' },
    ]
  },
  {
    id: 'compliance',
    title: '2. Compliance and Insurance',
    icon: ShieldCheck,
    fields: [
      { id: 'publicLiability', label: 'Public liability insurance' },
      { id: 'professionalIndemnity', label: 'Professional indemnity insurance' },
      { id: 'workersComp', label: 'Workers compensation insurance' },
      { id: 'cyberInsurance', label: 'Cyber insurance' },
      { id: 'motorVehicle', label: 'Motor vehicle insurance' },
      { id: 'licences', label: 'Licences' },
      { id: 'certifications', label: 'Certifications' },
      { id: 'staffChecks', label: 'Staff checks (Police, WWCC, etc)' },
      { id: 'policiesProcedures', label: 'Policies and procedures' },
    ]
  },
  {
    id: 'team',
    title: '3. Team and Capability',
    icon: Users,
    fields: [
      { id: 'staffCvs', label: 'Staff CVs' },
      { id: 'staffBios', label: 'Staff bios' },
      { id: 'qualifications', label: 'Qualifications' },
      { id: 'tickets', label: 'Tickets' },
      { id: 'trainingCertificates', label: 'Training certificates' },
      { id: 'orgChart', label: 'Organisational chart' },
    ]
  },
  {
    id: 'proof',
    title: '4. Case Studies and Proof',
    icon: CheckCircle2,
    fields: [
      { id: 'projectExamples', label: 'Project examples' },
      { id: 'caseStudies', label: 'Case studies' },
      { id: 'photos', label: 'Photos' },
      { id: 'beforeAfter', label: 'Before and after images' },
      { id: 'testimonials', label: 'Testimonials' },
      { id: 'reviews', label: 'Reviews' },
      { id: 'referenceLetters', label: 'Reference letters' },
      { id: 'completionCertificates', label: 'Completion certificates' },
      { id: 'reports', label: 'Reports' },
    ]
  },
  {
    id: 'submissions',
    title: '5. Previous Submissions and Feedback',
    icon: FileStack,
    fields: [
      { id: 'previousTenders', label: 'Previous tenders' },
      { id: 'previousGrants', label: 'Previous grants' },
      { id: 'previousProposals', label: 'Previous proposals' },
      { id: 'previousQuotes', label: 'Previous quotes' },
      { id: 'supplierRegistrations', label: 'Supplier registrations' },
      { id: 'buyerFeedback', label: 'Buyer feedback' },
      { id: 'grantFeedback', label: 'Grant feedback' },
      { id: 'debriefNotes', label: 'Debrief notes' },
    ]
  },
  {
    id: 'pricing',
    title: '6. Pricing and Commercial',
    icon: DollarSign,
    fields: [
      { id: 'pricingSchedules', label: 'Pricing schedules' },
      { id: 'rateCards', label: 'Rate cards' },
      { id: 'packageLists', label: 'Package lists' },
      { id: 'quoteTemplates', label: 'Quote templates' },
      { id: 'termsConditions', label: 'Terms and conditions' },
      { id: 'budgetTemplates', label: 'Budget templates' },
      { id: 'grantBudgetDocs', label: 'Grant budget documents' },
    ]
  },
  {
    id: 'grantDocs',
    title: '7. Grant Project Documents',
    icon: Gift,
    fields: [
      { id: 'supplierQuotes', label: 'Supplier quotes' },
      { id: 'projectBudgets', label: 'Project budgets' },
      { id: 'supportLetters', label: 'Letters of support' },
      { id: 'projectPlans', label: 'Project plans' },
      { id: 'evidenceNeed', label: 'Evidence of need' },
      { id: 'partnerDocuments', label: 'Partner documents' },
    ]
  },
  {
    id: 'other',
    title: '8. Other Relevant Documents',
    icon: Files,
    fields: [
      { id: 'otherDocuments', label: 'Other documents' },
    ]
  }
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

  const submissionRef = useMemoFirebase(() => {
    if (!submissionId || !db) return null;
    return doc(db, 'onboardingSubmissions', submissionId);
  }, [submissionId, db]);

  const { data: submission, isLoading: loadingSubmissions } = useDoc(submissionRef);

  const selectedServices = submission?.sections?.service_selection?.selectedServices || [];

  const visibleSteps = useMemo(() => {
    return ALL_STEPS.filter(step => {
      if (!step.conditional) return true;
      return step.isEnabled?.(selectedServices);
    });
  }, [selectedServices]);

  const currentStep = useMemo(() => visibleSteps.find(s => s.key === stepId), [visibleSteps, stepId]);
  const currentVisibleIndex = useMemo(() => visibleSteps.findIndex(s => s.key === stepId), [visibleSteps, stepId]);

  // Handle Redirect if step is disabled
  useEffect(() => {
    if (!loadingSubmissions && submission && !currentStep && stepId) {
      const firstValidStep = visibleSteps[0];
      if (firstValidStep) {
        toast({
          title: "Section Hidden",
          description: "This section is no longer in your scope based on your service selections."
        });
        router.push(`/onboarding/${firstValidStep.key}`);
      }
    }
  }, [currentStep, loadingSubmissions, submission, visibleSteps, stepId, router, toast]);

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
      const savedData = submission.sections?.[sid];
      if (savedData) {
        setFormData(savedData);
      } else {
        // Defaults
        if (sid === 'authority_matrix') {
          setFormData({
            matrix: {},
            acks: {},
            quoteThresholdAuthority: 'No',
            marketplaceAuthority: 'No'
          });
        } else if (sid === 'document_upload_library') {
          setFormData({
            documents: {},
            acks: { docsConfirmed: false }
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

  const handleNavigate = (targetStepKey: string) => {
    if (targetStepKey === stepId) return;

    if (submissionId && db) {
      const updateData: any = {
        updatedAt: serverTimestamp(),
        lastSavedAt: serverTimestamp(),
      };
      updateData[`sections.${stepId}`] = formData;
      
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

    initialSyncDone.current[targetStepKey] = false;
    router.push(`/onboarding/${targetStepKey}`);
  };

  const validateStep = (sid: string, data: any) => {
    if (sid === 'authority_matrix') {
      const matrix = data.matrix || {};
      const allRowsAnswered = AUTHORITY_ROWS.every(row => matrix[row]);
      if (!allRowsAnswered) return "Please select an authority level for every action in the matrix.";
      if (!data.submissionApprover) return "Please specify who provides final approval for submissions.";
      if (!data.pricingApprover) return "Please specify who provides final approval for pricing.";
      if (!data.contractApprover) return "Please specify who provides final approval for contract terms.";
      if (!data.paidPlatformApprover) return "Please specify who provides final approval for paid platforms.";
      if (!data.neverActions) return "Please specify actions Bid Manager must never take.";
      
      const acks = data.acks || {};
      const allAcks = ['relied', 'auto', 'consequence', 'accurate'].every(id => acks[id]);
      if (!allAcks) return "Please confirm all acknowledgments.";
    } else if (sid === 'document_upload_library') {
      if (!data.acks?.docsConfirmed) {
        return "Please confirm your upload status.";
      }
    }
    return null;
  };

  const handleSave = (next: boolean = false) => {
    if (!submissionId || !db || !currentStep) return;
    
    if (next) {
      const error = validateStep(stepId as string, formData);
      if (error) {
        toast({ variant: "destructive", title: "Incomplete Section", description: error });
        return;
      }
    }

    const updateData: any = { updatedAt: serverTimestamp(), lastSavedAt: serverTimestamp() };
    updateData[`sections.${stepId}`] = formData;

    if (stepId === 'service_selection') {
      const enabledModules = {
        tenderReadiness: ALL_STEPS.find(s => s.key === 'tender_readiness')?.isEnabled?.(formData.selectedServices || []),
        grants: ALL_STEPS.find(s => s.key === 'grants')?.isEnabled?.(formData.selectedServices || []),
        marketplaceStrategy: ALL_STEPS.find(s => s.key === 'marketplace_strategy')?.isEnabled?.(formData.selectedServices || []),
        directOutreachStrategy: ALL_STEPS.find(s => s.key === 'direct_outreach_strategy')?.isEnabled?.(formData.selectedServices || []),
        quoteSupport: ALL_STEPS.find(s => s.key === 'quote_support')?.isEnabled?.(formData.selectedServices || []),
      };
      const newVisibleSteps = ALL_STEPS.filter(s => !s.conditional || s.isEnabled?.(formData.selectedServices || []));
      updateData.enabledModules = enabledModules;
      updateData.visibleStepKeys = newVisibleSteps.map(s => s.key);
    }

    if (next) {
      const nextVisibleStep = visibleSteps[currentVisibleIndex + 1];
      if (nextVisibleStep) {
        updateData.currentStep = nextVisibleStep.key;
      }
      
      const currentCompleted = submission?.completedSteps || [];
      if (!currentCompleted.includes(stepId as string)) {
        updateData.completedSteps = [...currentCompleted, stepId as string];
      }
      const completedCount = updateData.completedSteps?.length || currentCompleted.length;
      updateData.completionPercentage = (completedCount / visibleSteps.length) * 100;
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
      const isLastStep = currentVisibleIndex === visibleSteps.length - 1;
      if (!isLastStep) {
        const nextVisibleStep = visibleSteps[currentVisibleIndex + 1];
        router.push(`/onboarding/${nextVisibleStep.key}`);
        initialSyncDone.current[nextVisibleStep.key] = false;
      } else {
        updateDoc(doc(db, 'onboardingSubmissions', submissionId), { status: 'submitted', submittedAt: serverTimestamp() });
        toast({ title: "Onboarding Complete", description: "All steps have been submitted successfully." });
        router.push('/dashboard');
      }
    } else {
      toast({ title: "Draft Saved", description: "Your progress has been saved." });
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
          {visibleSteps.map((step, idx) => {
            const isCompleted = submission?.completedSteps?.includes(step.key);
            const isCurrent = step.key === stepId;
            return (
              <div 
                key={step.key}
                onClick={() => handleNavigate(step.key)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group ${
                  isCurrent ? 'bg-primary/10 text-primary font-bold shadow-sm' : isCompleted ? 'text-green-600 hover:bg-green-50' : 'text-muted-foreground hover:bg-slate-50'
                }`}
              >
                <div className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-full ${isCurrent ? 'bg-primary text-white' : isCompleted ? 'bg-green-100' : 'bg-slate-100'}`}>
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <step.icon className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-medium truncate">
                  {idx + 1}. {step.shortTitle}
                </span>
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
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="gap-2 rounded-lg text-muted-foreground"><LayoutDashboard className="w-4 h-4" /> Back to Dashboard</Button>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <currentStep.icon className="w-3.5 h-3.5 text-primary" />
              </span>
              <h1 className="text-sm font-bold text-slate-900">{currentVisibleIndex + 1}. {currentStep.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => handleSave(false)} className="gap-2 rounded-lg border-2">Save Draft</Button>
            <Button size="sm" onClick={() => handleSave(true)} className="gap-2 rounded-lg font-bold px-6 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">{currentVisibleIndex === visibleSteps.length - 1 ? 'Finish Onboarding' : 'Next Step'} <ChevronRight className="w-4 h-4" /></Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50/30">
          <div className="max-w-4xl mx-auto p-8 lg:p-12">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-10 lg:p-14">
                <StepContent stepId={stepId as string} data={formData} onChange={handleFieldChange} submissionId={submissionId} uid={user?.uid} lastSynced={submission?.lastSavedAt} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function StepContent({ stepId, data, onChange, submissionId, uid, lastSynced }: { stepId: string, data: any, onChange: (field: string, value: any) => void, submissionId?: string | null, uid?: string, lastSynced?: any }) {
  const { toast } = useToast();
  
  switch (stepId) {
    case 'service_selection': {
      const SERVICES = [
        "Government Tenders",
        "Private Tenders",
        "Panel or Supplier Registrations",
        "Grants",
        "Marketplace Leads",
        "Direct Proposals",
        "Quote Requests",
        "Unsure, please recommend"
      ];
      const selected = data.selectedServices || [];
      return (
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Service Selection</h2>
            <p className="text-slate-500 text-lg">Select the services you want Bid Manager to support you with.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SERVICES.map(service => (
              <div 
                key={service} 
                onClick={() => {
                  const current = data.selectedServices || [];
                  const next = current.includes(service) ? current.filter((s: string) => s !== service) : [...current, service];
                  onChange('selectedServices', next);
                }}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${selected.includes(service) ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <span className="font-bold text-slate-700">{service}</span>
                <Checkbox checked={selected.includes(service)} onCheckedChange={() => {}} />
              </div>
            ))}
          </div>
        </div>
      );
    }
    case 'authority_matrix': {
      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Authority Matrix</h2>
            <p className="text-slate-500 text-lg">Confirm what actions Bid Manager is authorised to take.</p>
          </div>
          <Card className="border border-slate-200 rounded-3xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%] pl-8">Action</TableHead>
                  {AUTHORITY_LEVELS.map(level => (
                    <TableHead key={level} className="text-center text-[10px] uppercase">{level}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {AUTHORITY_ROWS.map((row) => {
                  const currentVal = data.matrix?.[row];
                  const isHighRisk = HIGH_RISK_AUTHORITY_ITEMS.includes(row) && currentVal === 'Authorised';
                  return (
                    <React.Fragment key={row}>
                      <TableRow className={isHighRisk ? 'bg-amber-50/50' : ''}>
                        <TableCell className="font-medium pl-8 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm">{row}</span>
                            {isHighRisk && <span className="text-[10px] font-bold text-amber-600 uppercase">High Risk Item</span>}
                          </div>
                        </TableCell>
                        {AUTHORITY_LEVELS.map(level => (
                          <TableCell key={level} className="text-center p-0">
                            <RadioGroup value={currentVal} onValueChange={(v) => onChange('matrix', { ...data.matrix, [row]: v })}>
                              <div className="flex justify-center"><RadioGroupItem value={level} /></div>
                            </RadioGroup>
                          </TableCell>
                        ))}
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
          
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Approval Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold">Final submission approval contact *</Label>
                <Input value={data.submissionApprover || ''} onChange={(e) => onChange('submissionApprover', e.target.value)} placeholder="Full name or role" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Pricing approval contact *</Label>
                <Input value={data.pricingApprover || ''} onChange={(e) => onChange('pricingApprover', e.target.value)} placeholder="Full name or role" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Actions Bid Manager must NEVER take *</Label>
              <Textarea value={data.neverActions || ''} onChange={(e) => onChange('neverActions', e.target.value)} placeholder="If none, write 'None known'." />
            </div>
          </div>

          <div className="space-y-6 pt-10 border-t">
            <h3 className="text-xl font-bold">Final Acknowledgements</h3>
            {[
              { id: 'relied', label: 'I understand that Bid Manager will rely on these authority settings.' },
              { id: 'auto', label: 'Actions marked as “Authorised” may be performed without further approval.' },
              { id: 'consequence', label: 'I understand that pricing and contract terms carry commercial consequences.' },
              { id: 'accurate', label: 'I confirm these settings are accurate to the best of my knowledge.' },
            ].map((ack) => (
              <div key={ack.id} className="flex items-start space-x-4 p-4 border rounded-xl">
                <Checkbox checked={data.acks?.[ack.id]} onCheckedChange={() => onChange('acks', { ...data.acks, [ack.id]: !data.acks?.[ack.id] })} />
                <Label className="text-sm font-medium">{ack.label} *</Label>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case 'document_upload_library': {
      const handleFileUpload = async (fieldId: string, categoryId: string, files: FileList | null) => {
        if (!files || !submissionId || !uid) return;
        const storage = getStorage();
        const uploadedFiles = [...(data.documents?.[fieldId]?.files || [])];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileName = `${Date.now()}_${file.name}`;
          const storagePath = `onboardingUploads/${uid}/${submissionId}/${fieldId}/${fileName}`;
          const fileRef = ref(storage, storagePath);
          try {
            const snapshot = await uploadBytes(fileRef, file);
            const url = await getDownloadURL(snapshot.ref);
            uploadedFiles.push({ id: fileName, name: file.name, size: file.size, url, path: storagePath, uploadedAt: new Date().toISOString() });
          } catch (e) { toast({ variant: "destructive", title: "Upload Failed" }); }
        }
        onChange('documents', { ...data.documents, [fieldId]: { ...data.documents?.[fieldId], files: uploadedFiles, status: 'available' } });
      };

      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Document Upload Library</h2>
            <p className="text-slate-500 text-lg">Central library for all supporting corporate documentation.</p>
          </div>
          <Accordion type="single" collapsible className="space-y-6">
            {DOCUMENT_CATEGORIES.map((cat) => (
              <AccordionItem key={cat.id} value={cat.id} className="border-none">
                <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <AccordionTrigger className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <cat.icon className="w-5 h-5 text-primary" />
                      <span className="text-lg font-bold">{cat.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 space-y-8">
                    {cat.fields.map((field) => (
                      <div key={field.id} className="space-y-4 pt-4 first:pt-0">
                        <div className="flex items-center justify-between">
                          <Label className="font-bold">{field.label}</Label>
                          <div className="flex items-center gap-3">
                            <input type="file" id={`up-${field.id}`} className="sr-only" multiple onChange={(e) => handleFileUpload(field.id, cat.id, e.target.files)} />
                            <Button asChild variant="outline" size="sm" className="rounded-xl border-2">
                              <label htmlFor={`up-${field.id}`} className="cursor-pointer gap-2"><UploadCloud className="w-4 h-4" /> Upload</label>
                            </Button>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          {(data.documents?.[field.id]?.files || []).map((file: any) => (
                            <div key={file.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
                              <span className="text-xs font-bold truncate max-w-[300px]">{file.name}</span>
                              <Button variant="ghost" size="icon" onClick={() => {}} className="text-slate-400 hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="pt-10 border-t">
            <div className="flex items-start space-x-4 p-6 border-2 rounded-3xl bg-primary/5 border-primary">
              <Checkbox checked={data.acks?.docsConfirmed} onCheckedChange={() => onChange('acks', { ...data.acks, docsConfirmed: !data.acks?.docsConfirmed })} />
              <Label className="text-sm font-bold">I have uploaded the documents currently available to me, or marked unavailable documents where relevant. *</Label>
            </div>
          </div>
        </div>
      );
    }
    default:
      return (
        <div className="py-24 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-slate-200 mx-auto" />
          <p className="text-slate-400 font-medium">This section ({stepId}) is currently being developed.</p>
        </div>
      );
  }
}
