
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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
  AlertTriangle,
  UploadCloud,
  ShieldAlert,
  Clock,
  Trash2,
  X,
  Files,
  FileStack,
  Flag,
  UserCheck,
  ShieldQuestion,
  FileSearch,
  Handshake,
  Star
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
  { id: 'library', title: '19. Document Upload Library', icon: Library },
  { id: 'authority', title: '20. Authority Matrix', icon: Scale },
];

const SECTION_KEY_MAP: Record<string, string> = {
  welcome: 'welcome',
  snapshot: 'business_snapshot',
  triage: 'opportunity_triage',
  selection: 'service_selection',
  profile: 'business_profile',
  menu: 'offer_menu',
  capacity: 'team_capacity',
  proof: 'proof_evidence',
  goals: 'goals_strategy',
  commercial: 'pricing_commercial',
  platform: 'platform_setup',
  compliance: 'compliance_insurance',
  readiness: 'tender_supplier_readiness',
  grants: 'grants',
  marketplace: 'marketplace_strategy',
  outreach: 'direct_outreach_strategy',
  quote: 'quote_request_support',
  workflow: 'communication_workflow',
  library: 'document_upload_library',
  authority: 'authority_matrix',
};

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

  const currentStepIndex = STEPS.findIndex(s => s.id === stepId);
  const currentStep = STEPS[currentStepIndex];
  const sectionKey = SECTION_KEY_MAP[stepId as string] || stepId as string;

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
      const savedData = submission.sections?.[sectionKey];
      if (savedData) {
        setFormData(savedData);
      } else {
        // Defaults
        if (sid === 'authority') {
          setFormData({
            matrix: {},
            acks: {},
            quoteThresholdAuthority: 'No',
            marketplaceAuthority: 'No'
          });
        } else if (sid === 'library') {
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
  }, [submission, stepId, sectionKey]);

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
      updateData[`sections.${sectionKey}`] = formData;
      
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
    if (sid === 'authority') {
      const matrix = data.matrix || {};
      const allRowsAnswered = AUTHORITY_ROWS.every(row => matrix[row]);
      if (!allRowsAnswered) return "Please select an authority level for every action in the matrix.";
      if (!data.submissionApprover) return "Please specify who provides final approval for submissions.";
      if (!data.pricingApprover) return "Please specify who provides final approval for pricing.";
      if (!data.contractApprover) return "Please specify who provides final approval for contract terms.";
      if (!data.paidPlatformApprover) return "Please specify who provides final approval for paid platforms.";
      if (!data.neverActions) return "Please specify actions Bid Manager must never take (write 'None known' if applicable).";
      
      const acks = data.acks || {};
      const allAcks = ['relied', 'auto', 'consequence', 'accurate'].every(id => acks[id]);
      if (!allAcks) return "Please confirm all acknowledgments in the final authority section.";

      if ((data.quoteThresholdAuthority === 'Yes' || data.quoteThresholdAuthority === 'Maybe, to be discussed') && !data.quoteThresholdValue) {
        return "Please specify a maximum value threshold for quotes.";
      }
    } else if (sid === 'library') {
      if (!data.acks?.docsConfirmed) {
        return "Please confirm that you have uploaded available documents or marked them unavailable.";
      }
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
    updateData[`sections.${sectionKey}`] = formData;

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
    const selection = submission?.sections?.service_selection?.selectedServices || [];
    const enabled = submission?.enabledModules?.[s.conditional];
    const unsureSelected = selection.includes('Unsure, please recommend');
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
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="gap-2 rounded-lg text-muted-foreground"><LayoutDashboard className="w-4 h-4" /> Back to Dashboard</Button>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <currentStep.icon className="w-3.5 h-3.5 text-primary" />
              </span>
              <h1 className="text-sm font-bold text-slate-900">{currentStep.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => handleSave(false)} className="gap-2 rounded-lg border-2">Save Draft</Button>
            <Button size="sm" onClick={() => handleSave(true)} className="gap-2 rounded-lg font-bold px-6 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">{currentStepIndex === STEPS.length - 1 ? 'Finish Onboarding' : 'Next Step'} <ChevronRight className="w-4 h-4" /></Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50/30">
          <div className="max-w-4xl mx-auto p-8 lg:p-12">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-10 lg:p-14">
                <StepContent stepId={stepId as string} data={formData} onChange={handleFieldChange} submissionId={submissionId} uid={user?.uid} lastSynced={submission?.lastSavedAt} />
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

function StepContent({ stepId, data, onChange, submissionId, uid, lastSynced }: { stepId: string, data: any, onChange: (field: string, value: any) => void, submissionId?: string | null, uid?: string, lastSynced?: any }) {
  const { toast } = useToast();
  
  switch (stepId) {
    case 'authority': {
      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Authority to Act and Approval Matrix</h2>
            <p className="text-slate-500 text-lg leading-relaxed">Confirm what Bid Manager is authorised to do on your behalf, what requires approval, and what actions are not authorised.</p>
          </div>

          <Card className="border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><Scale className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold text-slate-900">Authority Matrix</h3>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="w-[40%] pl-8">Action</TableHead>
                      {AUTHORITY_LEVELS.map(level => (
                        <TableHead key={level} className="text-center px-2 text-[10px] uppercase tracking-wider">{level}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {AUTHORITY_ROWS.map((row) => {
                      const currentVal = data.matrix?.[row];
                      const isHighRisk = HIGH_RISK_AUTHORITY_ITEMS.includes(row) && currentVal === 'Authorised';
                      return (
                        <React.Fragment key={row}>
                          <TableRow className={isHighRisk ? 'bg-amber-50/50 border-amber-100' : 'hover:bg-slate-50/50'}>
                            <TableCell className="font-medium pl-8 py-4">
                              <div className="flex flex-col gap-1">
                                <span className="text-sm text-slate-700">{row}</span>
                                {isHighRisk && (
                                  <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1 uppercase tracking-wider animate-pulse">
                                    <AlertTriangle className="w-3 h-3" /> High Risk Item
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            {AUTHORITY_LEVELS.map(level => (
                              <TableCell key={level} className="text-center p-0">
                                <label className="flex items-center justify-center w-full h-full cursor-pointer py-4 group">
                                  <RadioGroup
                                    value={currentVal}
                                    onValueChange={(v) => {
                                      const newMatrix = { ...(data.matrix || {}), [row]: v };
                                      onChange('matrix', newMatrix);
                                    }}
                                    className="flex items-center justify-center"
                                  >
                                    <div className="relative">
                                      <RadioGroupItem value={level} id={`${row}-${level}`} className="sr-only peer" />
                                      <div className="w-5 h-5 rounded-full border-2 border-slate-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary flex items-center justify-center transition-all group-hover:border-slate-300">
                                        <div className="w-2 h-2 rounded-full bg-white scale-0 peer-data-[state=checked]:scale-100 transition-transform" />
                                      </div>
                                    </div>
                                  </RadioGroup>
                                </label>
                              </TableCell>
                            ))}
                          </TableRow>
                          {isHighRisk && (
                            <TableRow className="bg-amber-50/30 border-none no-hover">
                              <TableCell colSpan={5} className="py-2 px-8">
                                <Alert className="bg-amber-100/50 border-amber-200 text-amber-900 py-3 rounded-2xl flex items-center gap-3">
                                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                                  <AlertDescription className="text-[11px] font-bold">
                                    This action may create commercial, legal, or financial commitments. Please confirm this authority carefully.
                                  </AlertDescription>
                                </Alert>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {Object.entries(data.matrix || {}).some(([_, v]) => v === 'Unsure') && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <Card className="bg-slate-900 border-none text-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Scale className="w-32 h-32" />
                </div>
                <div className="relative flex flex-col md:flex-row gap-10 items-start">
                  <div className="p-4 bg-white/10 rounded-[2rem]"><HelpCircle className="w-10 h-10 text-accent" /></div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">Authority items to clarify</h3>
                      <p className="text-slate-400">We will discuss these items during your strategy kick-off call to ensure we have clear boundaries.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(data.matrix || {})
                        .filter(([_, v]) => v === 'Unsure')
                        .map(([row]) => (
                          <div key={row} className="flex items-center gap-2 text-sm font-medium text-slate-300 bg-white/5 py-2 px-4 rounded-xl">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                            {row}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          <Card className="border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><UserCheck className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold text-slate-900">Approval Rules</h3>
            </div>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <Label className="font-bold">Who provides final approval for submissions? *</Label>
                   <Input value={data.submissionApprover || ''} onChange={(e) => onChange('submissionApprover', e.target.value)} className="h-12 rounded-xl" placeholder="Full name or role" />
                 </div>
                 <div className="space-y-2">
                   <Label className="font-bold">Who provides final approval for pricing? *</Label>
                   <Input value={data.pricingApprover || ''} onChange={(e) => onChange('pricingApprover', e.target.value)} className="h-12 rounded-xl" placeholder="Full name or role" />
                 </div>
                 <div className="space-y-2">
                   <Label className="font-bold">Who provides final approval for contract terms? *</Label>
                   <Input value={data.contractApprover || ''} onChange={(e) => onChange('contractApprover', e.target.value)} className="h-12 rounded-xl" placeholder="Full name or role" />
                 </div>
                 <div className="space-y-2">
                   <Label className="font-bold">Who provides final approval for paid platforms or subscriptions? *</Label>
                   <Input value={data.paidPlatformApprover || ''} onChange={(e) => onChange('paidPlatformApprover', e.target.value)} className="h-12 rounded-xl" placeholder="Full name or role" />
                 </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Are there any actions Bid Manager must NEVER take without written approval? *</Label>
                <Textarea 
                  value={data.neverActions || ''} 
                  onChange={(e) => onChange('neverActions', e.target.value)} 
                  placeholder="If none, write 'None known'."
                  className="min-h-[100px] rounded-2xl" 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Are there any specific words, claims, guarantees, prices, or commitments we should not make?</Label>
                <Textarea 
                  value={data.forbiddenClaims || ''} 
                  onChange={(e) => onChange('forbiddenClaims', e.target.value)} 
                  placeholder="e.g. Never guarantee delivery date before final scope..."
                  className="min-h-[100px] rounded-2xl" 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><DollarSign className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold text-slate-900">Threshold Authority</h3>
            </div>
            <CardContent className="p-8 space-y-10">
              <div className="space-y-4">
                <Label className="font-bold">Can Bid Manager submit quotes or responses under an agreed value threshold?</Label>
                <RadioGroup value={data.quoteThresholdAuthority} onValueChange={(v) => onChange('quoteThresholdAuthority', v)} className="flex flex-wrap gap-4">
                  {['Yes', 'No', 'Maybe, to be discussed'].map(opt => (
                    <div key={opt} className={`flex items-center space-x-2 bg-white border-2 p-3 px-5 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer ${data.quoteThresholdAuthority === opt ? 'border-primary bg-primary/5' : 'border-slate-100'}`}>
                      <RadioGroupItem value={opt} id={`qthresh-${opt}`} />
                      <Label htmlFor={`qthresh-${opt}`} className="cursor-pointer font-bold">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {(data.quoteThresholdAuthority === 'Yes' || data.quoteThresholdAuthority === 'Maybe, to be discussed') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-6 bg-slate-50 rounded-2xl animate-in slide-in-from-top-4 duration-500">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Maximum value threshold</Label>
                      <Input value={data.quoteThresholdValue || ''} onChange={(e) => onChange('quoteThresholdValue', e.target.value)} placeholder="e.g. $500" className="h-12 rounded-xl bg-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Applicable service types / Restrictions</Label>
                      <Input value={data.quoteThresholdRestrictions || ''} onChange={(e) => onChange('quoteThresholdRestrictions', e.target.value)} placeholder="e.g. Only repeat maintenance" className="h-12 rounded-xl bg-white" />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-10 border-t">
                <Label className="font-bold">Can Bid Manager respond to marketplace leads without approval under agreed rules?</Label>
                <RadioGroup value={data.marketplaceAuthority} onValueChange={(v) => onChange('marketplaceAuthority', v)} className="flex flex-wrap gap-4">
                  {['Yes', 'No', 'Maybe'].map(opt => (
                    <div key={opt} className={`flex items-center space-x-2 bg-white border-2 p-3 px-5 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer ${data.marketplaceAuthority === opt ? 'border-primary bg-primary/5' : 'border-slate-100'}`}>
                      <RadioGroupItem value={opt} id={`mthresh-${opt}`} />
                      <Label htmlFor={`mthresh-${opt}`} className="cursor-pointer font-bold">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {(data.marketplaceAuthority === 'Yes' || data.marketplaceAuthority === 'Maybe') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-6 bg-slate-50 rounded-2xl animate-in slide-in-from-top-4 duration-500">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Marketplace response rules / Max lead value</Label>
                      <Input value={data.marketplaceThresholdValue || ''} onChange={(e) => onChange('marketplaceThresholdValue', e.target.value)} placeholder="e.g. $1000 max" className="h-12 rounded-xl bg-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Platforms covered</Label>
                      <Input value={data.marketplacePlatforms || ''} onChange={(e) => onChange('marketplacePlatforms', e.target.value)} placeholder="e.g. Airtasker, Bark" className="h-12 rounded-xl bg-white" />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[3px] border-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden bg-white">
            <div className="p-10 border-b bg-slate-900 text-white flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl"><ShieldCheck className="w-8 h-8 text-accent" /></div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold">Final Authority Confirmation</h3>
                <p className="text-slate-400 text-sm">Please review and acknowledge the following statements to protect your business.</p>
              </div>
            </div>
            <CardContent className="p-10 space-y-4">
              {[
                { id: 'relied', label: 'I understand that Bid Manager will rely on the authority settings provided in this section.' },
                { id: 'auto', label: 'I understand that actions marked as “Authorised” may be performed without further approval unless otherwise stated.' },
                { id: 'consequence', label: 'I understand that pricing, submissions, paid platforms, and contract terms may carry commercial or legal consequences.' },
                { id: 'accurate', label: 'I confirm the authority settings provided are accurate to the best of my knowledge.' },
              ].map((ack) => (
                <div 
                  key={ack.id} 
                  className={`flex items-start space-x-6 p-6 rounded-[2rem] border-2 transition-all cursor-pointer group ${data.acks?.[ack.id] ? 'border-primary bg-primary/5 shadow-inner' : 'border-slate-50 hover:border-slate-200'}`}
                  onClick={() => {
                    const current = data.acks || {};
                    onChange('acks', { ...current, [ack.id]: !current[ack.id] });
                  }}
                >
                  <Checkbox checked={data.acks?.[ack.id]} onCheckedChange={() => {}} className="mt-1 w-6 h-6 rounded-lg" />
                  <Label className="text-sm font-bold leading-snug cursor-pointer flex-1 text-slate-700 group-hover:text-slate-900">{ack.label} *</Label>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      );
    }
    case 'library': {
      const allFiles = Object.values(data.documents || {}).flatMap((doc: any) => doc.files || []);
      const uploadedCount = allFiles.length;
      const criticalCount = allFiles.filter((f: any) => CRITICAL_DOC_FIELDS.includes(f.field)).length;
      const categoriesAnswered = Object.keys(data.documents || {}).length;
      const lastFile = allFiles.length > 0 ? allFiles[allFiles.length - 1] : null;

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
            const downloadUrl = await getDownloadURL(snapshot.ref);
            
            uploadedFiles.push({
              id: fileName,
              name: file.name,
              size: file.size,
              type: file.type,
              url: downloadUrl,
              path: storagePath,
              category: categoryId,
              field: fieldId,
              uploadedAt: new Date().toISOString(),
              notes: ''
            });
          } catch (error) {
            console.error("Upload failed", error);
            toast({ variant: "destructive", title: "Upload Failed", description: `Could not upload ${file.name}` });
          }
        }

        const newDocs = { 
          ...(data.documents || {}), 
          [fieldId]: { 
            ...(data.documents?.[fieldId] || {}), 
            files: uploadedFiles,
            status: 'available'
          } 
        };
        onChange('documents', newDocs);
      };

      const handleFileDelete = async (fieldId: string, fileId: string) => {
        const fileToDelete = data.documents?.[fieldId]?.files?.find((f: any) => f.id === fileId);
        if (!fileToDelete) return;

        const storage = getStorage();
        const fileRef = ref(storage, fileToDelete.path);

        try {
          await deleteObject(fileRef);
          const newFiles = data.documents?.[fieldId]?.files?.filter((f: any) => f.id !== fileId);
          const newDocs = { 
            ...(data.documents || {}), 
            [fieldId]: { 
              ...(data.documents?.[fieldId] || {}), 
              files: newFiles 
            } 
          };
          onChange('documents', newDocs);
          toast({ title: "File deleted" });
        } catch (error) {
          console.error("Delete failed", error);
          toast({ variant: "destructive", title: "Delete Failed" });
        }
      };

      const handleFileNoteChange = (fieldId: string, fileId: string, note: string) => {
        const newFiles = data.documents?.[fieldId]?.files?.map((f: any) => 
          f.id === fileId ? { ...f, notes: note } : f
        );
        const newDocs = { 
          ...(data.documents || {}), 
          [fieldId]: { 
            ...(data.documents?.[fieldId] || {}), 
            files: newFiles 
          } 
        };
        onChange('documents', newDocs);
      };

      const handleStatusChange = (fieldId: string, status: string) => {
        const newDocs = { 
          ...(data.documents || {}), 
          [fieldId]: { 
            ...(data.documents?.[fieldId] || {}), 
            status 
          } 
        };
        onChange('documents', newDocs);
      };

      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Document Upload Library</h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Upload the documents we may need to build your profile, compliance checklist, and opportunity support library.
            </p>
          </div>

          <Card className="border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden bg-slate-50/50">
             <div className="p-8 border-b bg-white flex items-center gap-3">
               <div className="p-2 bg-primary/10 rounded-xl"><Files className="w-5 h-5 text-primary" /></div>
               <h3 className="text-lg font-bold">Upload Summary</h3>
             </div>
             <CardContent className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Files</p>
                    <p className="text-2xl font-bold text-primary">{uploadedCount}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Critical Docs</p>
                    <p className="text-2xl font-bold text-amber-600">{criticalCount}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Missing Categories</p>
                    <p className="text-2xl font-bold text-slate-700">{DOCUMENT_CATEGORIES.length - categoriesAnswered}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Activity</p>
                    <p className="text-xs font-bold text-slate-600">{lastSynced ? new Date(lastSynced.seconds * 1000).toLocaleTimeString() : 'No activity'}</p>
                  </div>
                </div>
                {lastFile && (
                  <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm"><FileText className="w-4 h-4 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">Latest: {lastFile.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase">{new Date(lastFile.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
             </CardContent>
          </Card>

          <Accordion type="single" collapsible className="space-y-6">
            {DOCUMENT_CATEGORIES.map((cat) => (
              <AccordionItem key={cat.id} value={cat.id} className="border-none">
                <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <AccordionTrigger className="hover:no-underline px-8 py-6 bg-white data-[state=open]:bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl group-data-[state=open]:bg-primary/10 group-data-[state=open]:text-primary transition-colors">
                        <cat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-lg font-bold text-slate-900">{cat.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 pt-4 space-y-10">
                    {cat.fields.map((field) => {
                      const fieldData = data.documents?.[field.id] || { files: [], status: 'pending' };
                      const isCritical = CRITICAL_DOC_FIELDS.includes(field.id);
                      return (
                        <div key={field.id} className="space-y-4 border-b border-slate-100 last:border-0 pb-8 last:pb-0 pt-4 first:pt-0">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Label className="text-base font-bold text-slate-800">{field.label}</Label>
                                {isCritical && <Badge variant="destructive" className="text-[9px] h-4 font-bold uppercase py-0 px-1.5 rounded-sm">Critical</Badge>}
                              </div>
                              {fieldData.files.length === 0 && fieldData.status === 'pending' && (
                                <p className="text-xs text-amber-600 flex items-center gap-1 font-medium">
                                  <AlertCircle className="w-3 h-3" /> recommended upload
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <Select value={fieldData.status} onValueChange={(v) => handleStatusChange(field.id, v)}>
                                <SelectTrigger className="w-44 h-10 rounded-xl text-xs font-medium border-slate-200">
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  <SelectItem value="pending">Upload Pending</SelectItem>
                                  <SelectItem value="available">Available & Current</SelectItem>
                                  <SelectItem value="not_available">Not available yet</SelectItem>
                                  <SelectItem value="needs_updating">Needs updating</SelectItem>
                                  <SelectItem value="na">Not applicable</SelectItem>
                                  <SelectItem value="unsure">Unsure</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="relative">
                                <input 
                                  type="file" 
                                  id={`upload-${field.id}`} 
                                  className="sr-only" 
                                  multiple 
                                  onChange={(e) => handleFileUpload(field.id, cat.id, e.target.files)} 
                                />
                                <Button asChild variant="outline" size="sm" className="h-10 px-5 rounded-xl border-2 hover:bg-slate-50 cursor-pointer">
                                  <label htmlFor={`upload-${field.id}`} className="cursor-pointer gap-2">
                                    <UploadCloud className="w-4 h-4" /> Upload
                                  </label>
                                </Button>
                              </div>
                            </div>
                          </div>

                          {fieldData.files.length > 0 && (
                            <div className="grid grid-cols-1 gap-3 pt-2">
                              {fieldData.files.map((file: any) => (
                                <div key={file.id} className="flex flex-col gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                                        <FileText className="w-4 h-4 text-primary" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold truncate max-w-[200px]">{file.name}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-medium">
                                          {Math.round(file.size / 1024)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleFileDelete(field.id, file.id)} className="h-8 w-8 text-slate-400 hover:text-destructive rounded-lg">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <Input 
                                    value={file.notes || ''} 
                                    onChange={(e) => handleFileNoteChange(field.id, file.id, e.target.value)}
                                    placeholder="Add notes to this file..." 
                                    className="h-8 text-[11px] rounded-lg bg-white border-slate-200"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>

          <Card className="border-[3px] border-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden bg-white mt-12">
            <div className="p-10 border-b bg-slate-900 text-white flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl"><ShieldCheck className="w-8 h-8 text-accent" /></div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold">Document Confirmation</h3>
                <p className="text-slate-400 text-sm">Please confirm your upload status before proceeding.</p>
              </div>
            </div>
            <CardContent className="p-10">
              <div 
                className={`flex items-start space-x-6 p-8 rounded-[2rem] border-2 transition-all cursor-pointer group ${data.acks?.docsConfirmed ? 'border-primary bg-primary/5 shadow-inner' : 'border-slate-100 hover:border-slate-200'}`}
                onClick={() => {
                  const currentAcks = data.acks || {};
                  onChange('acks', { ...currentAcks, docsConfirmed: !currentAcks.docsConfirmed });
                }}
              >
                <Checkbox checked={data.acks?.docsConfirmed} onCheckedChange={() => {}} className="mt-1 w-6 h-6 rounded-lg" />
                <Label className="text-sm font-bold leading-snug cursor-pointer flex-1 text-slate-700 group-hover:text-slate-900">
                  I have uploaded the documents currently available to me, or marked unavailable documents where relevant. *
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    default:
      return <div className="py-24 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-slate-200 mx-auto" />
        <p className="text-slate-400 font-medium">This section ({stepId}) is currently being developed.</p>
      </div>;
  }
}
