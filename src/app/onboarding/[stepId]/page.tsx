"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  AlertTriangle,
  UploadCloud,
  Trash2,
  Files,
  FileStack,
  Flag,
  Clock,
  Briefcase,
  TrendingUp,
  ShieldAlert,
  Plus,
  ArrowLeft,
  Check,
  Lock,
  ExternalLink,
  ChevronLeft
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

const ALL_STEPS = [
  { key: "welcome_expectations", title: "1. Welcome & Expectations", shortTitle: "Welcome & Expectations", icon: Zap, required: true, conditional: false },
  { key: "business_snapshot", title: "2. Business Snapshot", shortTitle: "Business Snapshot", icon: Building2, required: true, conditional: false },
  { key: "opportunity_triage", title: "3. Opportunity Triage", shortTitle: "Opportunity Triage", icon: AlertCircle, required: true, conditional: false },
  { key: "service_selection", title: "4. Service Selection", shortTitle: "Service Selection", icon: FileText, required: true, conditional: false },
  { key: "business_profile", title: "5. Business Profile", shortTitle: "Business Profile", icon: Award, required: true, conditional: false },
  { key: "offer_menu", title: "6. Offer Menu", shortTitle: "Offer Menu", icon: ShoppingCart, required: true, conditional: false },
  { key: "team_capacity", title: "7. Team & Capacity", shortTitle: "Team & Capacity", icon: Users, required: true, conditional: false },
  { key: "proof_evidence", title: "8. Proof & Evidence", shortTitle: "Proof & Evidence", icon: CheckCircle2, required: true, conditional: false },
  { key: "goals_strategy", title: "9. Goals & Strategy", shortTitle: "Goals & Strategy", icon: Target, required: true, conditional: false },
  { key: "pricing_commercial", title: "10. Pricing & Commercial", shortTitle: "Pricing & Commercial", icon: DollarSign, required: true, conditional: false },
  { key: "platform_setup", title: "11. Platform Setup", shortTitle: "Platform Setup", icon: Globe, required: true, conditional: false },
  { key: "compliance_insurance", title: "12. Compliance & Insurance", shortTitle: "Compliance & Insurance", icon: ShieldCheck, required: true, conditional: false },
  {
    key: "tender_readiness",
    title: "13. Tender Readiness",
    shortTitle: "Tender Readiness",
    icon: FileBadge,
    required: true,
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
    required: true,
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
    required: true,
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
    required: true,
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
    required: true,
    conditional: true,
    isEnabled: (selectedServices: string[]) =>
      selectedServices.includes("Quote Requests") ||
      selectedServices.includes("Marketplace Leads") ||
      selectedServices.includes("Direct Proposals") ||
      selectedServices.includes("Unsure, please recommend")
  },
  { key: "workflow_rules", title: "18. Workflow Rules", shortTitle: "Workflow Rules", icon: Clock, required: true, conditional: false },
  { key: "document_upload_library", title: "19. Document Upload Library", shortTitle: "Document Upload Library", icon: Library, required: true, conditional: false },
  { key: "authority_matrix", title: "20. Authority Matrix", shortTitle: "Authority Matrix", icon: Scale, required: true, conditional: false },
  { key: "final_submission", title: "21. Final Submission", shortTitle: "Final Submission", icon: Flag, required: true, conditional: false }
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

  useEffect(() => {
    if (!loadingSubmissions && submission && !currentStep && stepId) {
      const firstValidStep = visibleSteps[0];
      if (firstValidStep) {
        toast({ title: "Section Hidden", description: "This section is no longer in your scope based on your service selections." });
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
        setFormData({});
      }
      initialSyncDone.current[sid] = true;
    }
  }, [submission, stepId]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNavigate = (targetStepKey: string) => {
    if (targetStepKey === stepId) return;
    if (submissionId && db && submission?.status !== 'submitted') {
      const updateData: any = { updatedAt: serverTimestamp(), lastSavedAt: serverTimestamp() };
      updateData[`sections.${stepId}`] = formData;
      updateDoc(doc(db, 'onboardingSubmissions', submissionId), updateData).catch((error: any) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `onboardingSubmissions/${submissionId}`, operation: 'update', requestResourceData: updateData }));
      });
    }
    initialSyncDone.current[targetStepKey] = false;
    router.push(`/onboarding/${targetStepKey}`);
  };

  const handleSave = (next: boolean = false) => {
    if (!submissionId || !db || !currentStep || submission?.status === 'submitted') return;
    
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
      const currentCompleted = submission?.completedSteps || [];
      if (!currentCompleted.includes(stepId as string)) updateData.completedSteps = [...currentCompleted, stepId as string];
      const completedCount = updateData.completedSteps?.length || currentCompleted.length;
      updateData.completionPercentage = (completedCount / visibleSteps.length) * 100;
    }

    updateDoc(doc(db, 'onboardingSubmissions', submissionId), updateData).catch((error: any) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `onboardingSubmissions/${submissionId}`, operation: 'update', requestResourceData: updateData }));
    });

    if (next) {
      const isLastStep = currentVisibleIndex === visibleSteps.length - 1;
      if (!isLastStep) {
        const nextVisibleStep = visibleSteps[currentVisibleIndex + 1];
        router.push(`/onboarding/${nextVisibleStep.key}`);
        initialSyncDone.current[nextVisibleStep.key] = false;
      }
    } else {
      toast({ title: "Draft Saved", description: "Your progress has been saved." });
    }
  };

  const handleSubmitPack = async () => {
    if (!submissionId || !db || !user) return;

    try {
      // 1. Update submission status and lock
      await updateDoc(doc(db, 'onboardingSubmissions', submissionId), {
        status: 'submitted',
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        [`sections.final_submission`]: formData
      });

      // 2. Update user status
      await updateDoc(doc(db, 'users', user.uid), {
        onboardingStatus: 'submitted',
        updatedAt: serverTimestamp()
      });

      toast({ title: "Submission Successful", description: "Your onboarding pack has been locked and sent to our team." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Submission Failed", description: error.message });
    }
  };

  if (loadingSubmissions || !currentStep || !submissionId || !submission) {
    return <div className="h-screen flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-primary w-10 h-10" /><p className="text-sm font-medium text-muted-foreground">Preparing your workspace...</p></div>;
  }

  // If already submitted and NOT on final_submission step, show lock message or redirect
  if (submission.status === 'submitted' && stepId !== 'final_submission') {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
          <Lock className="w-10 h-10 text-slate-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Onboarding Locked</h2>
          <p className="text-muted-foreground max-w-md mx-auto">This onboarding pack has been submitted and is currently being reviewed. Edits are disabled until re-opened by an administrator.</p>
        </div>
        <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group ${isCurrent ? 'bg-primary/10 text-primary font-bold shadow-sm' : isCompleted ? 'text-green-600 hover:bg-green-50' : 'text-muted-foreground hover:bg-slate-50'}`}
              >
                <div className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-full ${isCurrent ? 'bg-primary text-white' : isCompleted ? 'bg-green-100' : 'bg-slate-100'}`}>
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <step.icon className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-medium truncate">{idx + 1}. {step.shortTitle}</span>
              </div>
            );
          })}
        </div>
        <div className="p-4 border-t"><Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground rounded-xl transition-colors" onClick={() => router.push('/dashboard')}><LayoutDashboard className="w-4 h-4" /><span className="text-sm font-medium">Return to Dashboard</span></Button></div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="gap-2 rounded-lg text-muted-foreground"><LayoutDashboard className="w-4 h-4" /> Back to Dashboard</Button>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center"><currentStep.icon className="w-3.5 h-3.5 text-primary" /></span>
              <h1 className="text-sm font-bold text-slate-900">{currentVisibleIndex + 1}. {currentStep.title}</h1>
            </div>
          </div>
          {submission.status !== 'submitted' && (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => handleSave(false)} className="gap-2 rounded-lg border-2">Save Draft</Button>
              <Button size="sm" onClick={() => handleSave(true)} className="gap-2 rounded-lg font-bold px-6 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20" disabled={currentVisibleIndex === visibleSteps.length - 1}>Next Step <ChevronRight className="w-4 h-4" /></Button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50/30">
          <div className="max-w-4xl mx-auto p-8 lg:p-12">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-10 lg:p-14">
                <StepContent 
                  stepId={stepId as string} 
                  data={formData} 
                  onChange={handleFieldChange} 
                  submission={submission}
                  onNavigate={handleNavigate}
                  onSubmit={handleSubmitPack}
                  visibleSteps={visibleSteps}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function StepContent({ stepId, data, onChange, submission, onNavigate, onSubmit, visibleSteps }: { stepId: string, data: any, onChange: (field: string, value: any) => void, submission: any, onNavigate: (key: string) => void, onSubmit: () => void, visibleSteps: any[] }) {
  
  // Submitted state UI
  if (submission.status === 'submitted' && stepId === 'final_submission') {
    return (
      <div className="space-y-10 text-center py-6">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 text-green-600 mb-2">
          <Check className="w-12 h-12" strokeWidth={3} />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-headline font-bold text-slate-900">Onboarding Submitted</h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Thank you for submitting your Bid Manager onboarding pack. We will review your responses and supporting documents. Your information will be used to prepare your client profile, proposal-ready content, opportunity preferences, compliance checklist, platform setup recommendations, approval workflow, and action plan.
          </p>
        </div>

        <Card className="border-none bg-slate-50 rounded-3xl p-8 max-w-lg mx-auto text-left space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400 uppercase font-bold text-[10px] tracking-widest">Submission Status</p>
              <Badge className="mt-1 bg-green-500 text-white hover:bg-green-500">Submitted</Badge>
            </div>
            <div>
              <p className="text-slate-400 uppercase font-bold text-[10px] tracking-widest">Submitted At</p>
              <p className="font-bold text-slate-700 mt-1">
                {submission.submittedAt?.toDate ? submission.submittedAt.toDate().toLocaleString() : 'Just now'}
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-primary" /> What's happening now?
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex gap-2"><span>•</span> Our team is reviewing your digital bid library.</li>
              <li className="flex gap-2"><span>•</span> Your shared Google Drive workspace is being provisioned.</li>
              <li className="flex gap-2"><span>•</span> A Bid Manager will contact you to schedule your strategy session.</li>
            </ul>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="outline" size="lg" className="h-14 px-8 rounded-2xl border-2 gap-2" onClick={() => onNavigate('welcome_expectations')}>
            <Files className="w-5 h-5" /> View Submitted Responses
          </Button>
          <Button size="lg" className="h-14 px-10 rounded-2xl gap-2 bg-primary shadow-lg shadow-primary/20" onClick={() => window.location.href = '/dashboard'}>
            <LayoutDashboard className="w-5 h-5" /> Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  switch (stepId) {
    case 'welcome_expectations': {
      return (
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Welcome & Expectations</h2>
            <p className="text-slate-500 text-lg leading-relaxed">We're excited to partner with you. This automated onboarding process is designed to gather all the strategic intelligence we need to manage your bids effectively.</p>
          </div>
          <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10 space-y-4">
            <h3 className="font-bold text-primary flex items-center gap-2"><Clock className="w-5 h-5" /> Time Commitment</h3>
            <p className="text-sm text-slate-600 leading-relaxed">This process usually takes about 45 minutes. You can save your draft and return at any time. We recommend completing it in one session for the best outcome.</p>
            <div className="flex items-center gap-3 pt-4">
              <Checkbox id="ready" checked={data.isReady} onCheckedChange={(v) => onChange('isReady', v)} />
              <Label htmlFor="ready" className="text-sm font-bold text-slate-700">I am ready to provide business details and upload documents.</Label>
            </div>
          </div>
        </div>
      );
    }

    case 'business_snapshot': {
      return (
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Business Snapshot</h2>
            <p className="text-slate-500 text-lg">Provide core details about your organization's scale and structure.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><Label>Australian Business Number (ABN)</Label><Input value={data.abn || ''} onChange={(e) => onChange('abn', e.target.value)} placeholder="00 000 000 000" /></div>
            <div className="space-y-2"><Label>Years in Business</Label><Input type="number" value={data.yearsInBusiness || ''} onChange={(e) => onChange('yearsInBusiness', e.target.value)} /></div>
            <div className="space-y-2"><Label>Full-time Equivalent (FTE) Staff</Label><Input type="number" value={data.staffCount || ''} onChange={(e) => onChange('staffCount', e.target.value)} /></div>
            <div className="space-y-2">
              <Label>Annual Turnover Range</Label>
              <Select value={data.turnover || ''} onValueChange={(v) => onChange('turnover', v)}>
                <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_500k">Under $500k</SelectItem>
                  <SelectItem value="500k_2m">$500k - $2M</SelectItem>
                  <SelectItem value="2m_5m">$2M - $5M</SelectItem>
                  <SelectItem value="5m_10m">$5M - $10M</SelectItem>
                  <SelectItem value="over_10m">Over $10M</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );
    }

    case 'opportunity_triage': {
      return (
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Opportunity Triage</h2>
            <p className="text-slate-500 text-lg">Help us understand which opportunities are a "YES" and which are a "NO".</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-2"><Label>Describe your ideal project or client</Label><Textarea value={data.idealClient || ''} onChange={(e) => onChange('idealClient', e.target.value)} placeholder="e.g. Local government landscaping contracts over $50k" /></div>
            <div className="space-y-2"><Label>Minimum project value you will consider</Label><Input value={data.minValue || ''} onChange={(e) => onChange('minValue', e.target.value)} placeholder="$10,000" /></div>
            <div className="space-y-2"><Label>What are your "Red Flags"? (Opportunities to ignore)</Label><Textarea value={data.redFlags || ''} onChange={(e) => onChange('redFlags', e.target.value)} placeholder="e.g. Clients with poor credit history, projects outside 100km radius" /></div>
          </div>
        </div>
      );
    }

    case 'service_selection': {
      const SERVICES = ["Government Tenders", "Private Tenders", "Panel or Supplier Registrations", "Grants", "Marketplace Leads", "Direct Proposals", "Quote Requests", "Unsure, please recommend"];
      const selected = data.selectedServices || [];
      return (
        <div className="space-y-8">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Service Selection</h2><p className="text-slate-500 text-lg">Select the services you want Bid Manager to support you with.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SERVICES.map(service => (
              <div 
                key={service} 
                onClick={() => { const current = data.selectedServices || []; const next = current.includes(service) ? current.filter((s: string) => s !== service) : [...current, service]; onChange('selectedServices', next); }}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${selected.includes(service) ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <span className="font-bold text-slate-700">{service}</span><Checkbox checked={selected.includes(service)} onCheckedChange={() => {}} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'business_profile': {
      return (
        <div className="space-y-8">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Business Profile</h2><p className="text-slate-500 text-lg">Tell us the story of your business to help us write compelling narratives.</p></div>
          <div className="space-y-6">
            <div className="space-y-2"><Label>Business Mission & Purpose</Label><Textarea value={data.mission || ''} onChange={(e) => onChange('mission', e.target.value)} placeholder="Why do you do what you do?" /></div>
            <div className="space-y-2"><Label>Key Business Values</Label><Textarea value={data.values || ''} onChange={(e) => onChange('values', e.target.value)} placeholder="e.g. Safety, Integrity, Innovation" /></div>
            <div className="space-y-2"><Label>Brief History / Background</Label><Textarea value={data.history || ''} onChange={(e) => onChange('history', e.target.value)} placeholder="How did the business start?" /></div>
          </div>
        </div>
      );
    }

    case 'offer_menu': {
      return (
        <div className="space-y-8">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Offer Menu</h2><p className="text-slate-500 text-lg">List your key products and services.</p></div>
          <div className="space-y-6">
            <div className="space-y-2"><Label>Service Categories</Label><Textarea value={data.serviceCategories || ''} onChange={(e) => onChange('serviceCategories', e.target.value)} placeholder="e.g. Consulting, Civil Works, Software Development" /></div>
            <div className="space-y-2"><Label>Unique Selling Propositions (USPs)</Label><Textarea value={data.usps || ''} onChange={(e) => onChange('usps', e.target.value)} placeholder="Why choose you over a competitor?" /></div>
            <div className="space-y-2"><Label>Key Product or Package Names</Label><Textarea value={data.productNames || ''} onChange={(e) => onChange('productNames', e.target.value)} placeholder="e.g. Premium Support Plan, Eco-Friendly Construction Kit" /></div>
          </div>
        </div>
      );
    }

    case 'team_capacity': {
      return (
        <div className="space-y-8">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Team & Capacity</h2><p className="text-slate-500 text-lg">Help us understand who is delivering the work.</p></div>
          <div className="space-y-6">
            <div className="space-y-2"><Label>Organisational Structure Overview</Label><Textarea value={data.orgOverview || ''} onChange={(e) => onChange('orgOverview', e.target.value)} placeholder="Who reports to whom?" /></div>
            <div className="space-y-2">
              <Label>Current Capacity Level</Label>
              <RadioGroup value={data.capacity || ''} onValueChange={(v) => onChange('capacity', v)} className="flex gap-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="high" id="c1" /><Label htmlFor="c1">High (Looking for work)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="medium" id="c2" /><Label htmlFor="c2">Medium (Balanced)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="low" id="c3" /><Label htmlFor="c3">Low (Near Capacity)</Label></div>
              </RadioGroup>
            </div>
          </div>
        </div>
      );
    }

    case 'proof_evidence': {
      return (
        <div className="space-y-8">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Proof & Evidence</h2><p className="text-slate-500 text-lg">Tenders are won on proof. List your strongest project examples.</p></div>
          <div className="space-y-6">
            <div className="space-y-2"><Label>Top 3 Projects (Name, Client, Value, Year)</Label><Textarea className="h-40" value={data.topProjects || ''} onChange={(e) => onChange('topProjects', e.target.value)} placeholder="1. Project X - Client Y - $100k - 2023" /></div>
            <div className="space-y-2"><Label>Contact Details for 3 Professional References</Label><Textarea value={data.references || ''} onChange={(e) => onChange('references', e.target.value)} /></div>
          </div>
        </div>
      );
    }

    case 'goals_strategy': {
      return (
        <div className="space-y-8">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Goals & Strategy</h2><p className="text-slate-500 text-lg">Where are we heading?</p></div>
          <div className="space-y-6">
            <div className="space-y-2"><Label>Revenue Goal for the Next 12 Months</Label><Input value={data.revenueGoal || ''} onChange={(e) => onChange('revenueGoal', e.target.value)} placeholder="$2,000,000" /></div>
            <div className="space-y-2"><Label>Target Market Sectors</Label><Textarea value={data.targetSectors || ''} onChange={(e) => onChange('targetSectors', e.target.value)} placeholder="e.g. Healthcare, Education" /></div>
          </div>
        </div>
      );
    }

    case 'pricing_commercial': {
      return (
        <div className="space-y-8">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Pricing & Commercial</h2><p className="text-slate-500 text-lg">Standardise your pricing approach.</p></div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Standard Pricing Model</Label>
              <Select value={data.pricingModel || ''} onValueChange={(v) => onChange('pricingModel', v)}>
                <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                  <SelectItem value="retainer">Retainer</SelectItem>
                  <SelectItem value="hybrid">Hybrid / Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>General Payment Terms</Label><Input value={data.paymentTerms || ''} onChange={(e) => onChange('paymentTerms', e.target.value)} placeholder="e.g. Net 30" /></div>
          </div>
        </div>
      );
    }

    case 'platform_setup': {
      const PLATFORMS = ["Airtasker", "Bark", "ServiceSeeking", "Oneflare", "hipages", "Upwork", "Freelancer", "Fiverr", "TenderLink", "AusTender", "GrantConnect", "Local council portals", "State government tender portals", "Corporate supplier portals", "LinkedIn", "Other", "None", "Unsure"];
      const existing = data.existingPlatforms || [];
      return (
        <div className="space-y-12">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Platform and Channel Setup</h2><p className="text-slate-500 text-lg">Tell us which platforms you already use and where you need help.</p></div>
          <Card className="p-8 rounded-3xl border-none shadow-sm space-y-6">
            <h3 className="text-xl font-bold">Existing Platforms</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PLATFORMS.map(p => (
                <div key={p} onClick={() => { const next = existing.includes(p) ? existing.filter((s: string) => s !== p) : [...existing, p]; onChange('existingPlatforms', next); }} className={`p-4 rounded-xl border-2 cursor-pointer text-xs font-bold transition-all ${existing.includes(p) ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 hover:border-slate-200 text-slate-600'}`}>{p}</div>
              ))}
            </div>
          </Card>
          <div className="space-y-6 pt-10 border-t">
            <h3 className="text-xl font-bold">Access and Security</h3>
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700 rounded-2xl"><ShieldAlert className="w-5 h-5" /><AlertDescription className="font-bold">NEVER provide passwords or login credentials in this portal. We will use delegated access or screen-sharing.</AlertDescription></Alert>
            <div className="space-y-2"><Label>Who controls access and MFA currently?</Label><Input value={data.accessManager || ''} onChange={(e) => onChange('accessManager', e.target.value)} /></div>
            <div className="flex items-start space-x-4 p-4 border rounded-xl bg-slate-50"><Checkbox id="acc" checked={data.isSecurityAware} onCheckedChange={(v) => onChange('isSecurityAware', v)} /><Label htmlFor="acc" className="text-xs font-bold leading-relaxed">I understand I should not provide passwords or login credentials through this portal. *</Label></div>
          </div>
        </div>
      );
    }

    case 'compliance_insurance': {
      const READINESS_ROWS = ["ABN/ACN records", "Public liability insurance", "Professional indemnity insurance", "Workers compensation insurance", "Cyber insurance", "Motor vehicle insurance", "Industry licences", "Staff tickets or licences", "Police checks", "Working with Children Checks", "NDIS screening checks", "ISO certifications", "WHS policy", "Quality policy", "Environmental policy", "Privacy policy", "Risk management process", "Complaints handling process", "Business continuity plan", "Modern slavery statement", "Capability statement", "Pricing schedule"];
      const COLUMNS = ["Available and current", "Available but needs updating", "Do not have", "Unsure", "Not applicable"];
      return (
        <div className="space-y-12">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Compliance & Readiness</h2><p className="text-slate-500 text-lg">Identify readiness gaps before pursuing major opportunities.</p></div>
          <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
            <Table>
              <TableHeader><TableRow><TableHead className="pl-8">Compliance Item</TableHead>{COLUMNS.map(c => <TableHead key={c} className="text-center text-[10px] uppercase font-bold px-2">{c}</TableHead>)}</TableRow></TableHeader>
              <TableBody>
                {READINESS_ROWS.map(row => (
                  <TableRow key={row}>
                    <TableCell className="font-bold text-sm pl-8">{row}</TableCell>
                    {COLUMNS.map(c => <TableCell key={c} className="text-center"><RadioGroup value={data.grid?.[row] || ''} onValueChange={(v) => onChange('grid', { ...data.grid, [row]: v })} className="flex justify-center"><RadioGroupItem value={c} /></RadioGroup></TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-amber-600"><AlertTriangle className="w-6 h-6" /> Potential Readiness Gaps</h3>
            <div className="flex flex-wrap gap-2">
              {READINESS_ROWS.filter(row => data.grid?.[row] === "Do not have" || data.grid?.[row] === "Unsure").map(gap => <Badge key={gap} variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">{gap}</Badge>)}
              {READINESS_ROWS.filter(row => data.grid?.[row] === "Do not have" || data.grid?.[row] === "Unsure").length === 0 && <p className="text-sm text-slate-400 italic">No gaps identified yet.</p>}
            </div>
          </div>
        </div>
      );
    }

    case 'tender_readiness': {
      return (
        <div className="space-y-8">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Tender Readiness</h2><p className="text-slate-500 text-lg">Complete this if you are targeting formal procurement opportunities.</p></div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Have you submitted tenders before?</Label>
              <RadioGroup value={data.experience || ''} onValueChange={(v) => onChange('experience', v)} className="flex gap-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="t1" /><Label htmlFor="t1">Yes</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="t2" /><Label htmlFor="t2">No</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="started" id="t3" /><Label htmlFor="t3">Started but not submitted</Label></div>
              </RadioGroup>
            </div>
            <div className="space-y-2"><Label>Who approves final tender submissions? *</Label><Input value={data.approver || ''} onChange={(e) => onChange('approver', e.target.value)} placeholder="Full name or Role" /></div>
            <div className="space-y-2"><Label>What tender risks should we watch for? *</Label><Textarea value={data.risks || ''} onChange={(e) => onChange('risks', e.target.value)} placeholder="e.g. Unrealistic delivery dates, low profit margins" /></div>
          </div>
        </div>
      );
    }

    case 'grants': {
      const PROJECTS = Array.from({ length: Number(data.projectCount) || 1 });
      return (
        <div className="space-y-12">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Grants</h2><p className="text-slate-500 text-lg">Identify projects that need funding.</p></div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>How many grant project ideas would you like to add?</Label>
              <Select value={data.projectCount || '1'} onValueChange={(v) => onChange('projectCount', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem><SelectItem value="3">3</SelectItem><SelectItem value="4">4 or more</SelectItem></SelectContent></Select>
            </div>
            {PROJECTS.map((_, i) => (
              <Card key={i} className="p-8 rounded-3xl border-slate-100 shadow-sm space-y-6">
                <h3 className="font-bold">Project {i + 1}</h3>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Project name or idea *</Label><Input value={data.projects?.[i]?.name || ''} onChange={(e) => { const ps = [...(data.projects || [])]; ps[i] = { ...ps[i], name: e.target.value }; onChange('projects', ps); }} /></div>
                  <div className="space-y-2"><Label>What would the funding be used for? *</Label><Textarea value={data.projects?.[i]?.purpose || ''} onChange={(e) => { const ps = [...(data.projects || [])]; ps[i] = { ...ps[i], purpose: e.target.value }; onChange('projects', ps); }} /></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    case 'marketplace_strategy': {
      const PLATFORMS = ["Airtasker", "Bark", "ServiceSeeking", "Oneflare", "hipages", "Upwork", "Freelancer", "Fiverr", "Other", "Unsure"];
      const selected = data.selected || [];
      return (
        <div className="space-y-12">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Marketplace Lead Strategy</h2><p className="text-slate-500 text-lg">Set rules for how we handle marketplace leads.</p></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PLATFORMS.map(p => (
              <div key={p} onClick={() => { const next = selected.includes(p) ? selected.filter((s: string) => s !== p) : [...selected, p]; onChange('selected', next); }} className={`p-4 rounded-xl border-2 cursor-pointer text-xs font-bold transition-all text-center ${selected.includes(p) ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 hover:border-slate-200 text-slate-600'}`}>{p}</div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="space-y-2"><Label>Minimum job value to pursue *</Label><Input value={data.minValue || ''} onChange={(e) => onChange('minValue', e.target.value)} placeholder="$500" /></div>
            <div className="space-y-2"><Label>Monthly budget for paid leads/credits</Label><Input value={data.budget || ''} onChange={(e) => onChange('budget', e.target.value)} placeholder="$200" /></div>
          </div>
        </div>
      );
    }

    case 'direct_outreach_strategy': {
      return (
        <div className="space-y-12">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Outreach Strategy</h2><p className="text-slate-500 text-lg">Strategize your direct growth channels.</p></div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Growth Channels</Label>
              <div className="grid grid-cols-2 gap-3">
                {["Direct proposals", "Email outreach", "LinkedIn outreach", "Referral partners", "Client reactivation"].map(c => (
                  <div key={c} onClick={() => { const s = data.channels || []; const n = s.includes(c) ? s.filter((x:string)=>x!==c) : [...s, c]; onChange('channels', n); }} className={`p-4 rounded-xl border-2 cursor-pointer text-xs font-bold transition-all ${data.channels?.includes(c) ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 text-slate-600'}`}>{c}</div>
                ))}
              </div>
            </div>
            <div className="space-y-2"><Label>Organisations NOT to contact *</Label><Textarea value={data.noContact || ''} onChange={(e) => onChange('noContact', e.target.value)} placeholder="If none, write 'None known'." /></div>
          </div>
        </div>
      );
    }

    case 'quote_support': {
      return (
        <div className="space-y-12">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Quote Support</h2><p className="text-slate-500 text-lg">Define the rules for your quotes.</p></div>
          <div className="space-y-6">
            <div className="space-y-2"><Label>What must be included in every quote? *</Label><Textarea value={data.inclusions || ''} onChange={(e) => onChange('inclusions', e.target.value)} /></div>
            <div className="space-y-2"><Label>Maximum quote value Bid Manager can send without approval *</Label><Input value={data.threshold || ''} onChange={(e) => onChange('threshold', e.target.value)} placeholder="$0 (All need approval)" /></div>
          </div>
        </div>
      );
    }

    case 'workflow_rules': {
      return (
        <div className="space-y-12">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Workflow Rules</h2><p className="text-slate-500 text-lg">Set the operational cadence.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><Label>Primary Review Contact *</Label><Input value={data.reviewer || ''} onChange={(e) => onChange('reviewer', e.target.value)} /></div>
            <div className="space-y-2">
              <Label>Response Time Expectation *</Label>
              <Select value={data.responseTime || ''} onValueChange={(v) => onChange('responseTime', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="24h">Within 24 hours</SelectItem><SelectItem value="48h">Within 48 hours</SelectItem><SelectItem value="3d">2-3 business days</SelectItem></SelectContent></Select>
            </div>
          </div>
        </div>
      );
    }

    case 'document_upload_library': {
      const handleFileUpload = async (fieldId: string, categoryId: string, files: FileList | null) => {
        if (!files || !submission.id || !submission.userId) return;
        const storage = getStorage();
        const uploadedFiles = [...(data.documents?.[fieldId]?.files || [])];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileName = `${Date.now()}_${file.name}`;
          const storagePath = `onboardingUploads/${submission.userId}/${submission.id}/${fieldId}/${fileName}`;
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
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Document Upload Library</h2><p className="text-slate-500 text-lg">Central library for all supporting corporate documentation.</p></div>
          <Accordion type="single" collapsible className="space-y-6">
            {DOCUMENT_CATEGORIES.map((cat) => (
              <AccordionItem key={cat.id} value={cat.id} className="border-none">
                <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <AccordionTrigger className="px-8 py-6"><div className="flex items-center gap-4"><cat.icon className="w-5 h-5 text-primary" /><span className="text-lg font-bold">{cat.title}</span></div></AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 space-y-8">
                    {cat.fields.map((field) => (
                      <div key={field.id} className="space-y-4 pt-4 first:pt-0">
                        <div className="flex items-center justify-between"><Label className="font-bold">{field.label}</Label><div className="flex items-center gap-3"><input type="file" id={`up-${field.id}`} className="sr-only" multiple onChange={(e) => handleFileUpload(field.id, cat.id, e.target.files)} /><Button asChild variant="outline" size="sm" className="rounded-xl border-2"><label htmlFor={`up-${field.id}`} className="cursor-pointer gap-2"><UploadCloud className="w-4 h-4" /> Upload</label></Button></div></div>
                        <div className="grid gap-2">{(data.documents?.[field.id]?.files || []).map((file: any) => (<div key={file.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between"><span className="text-xs font-bold truncate max-w-[300px]">{file.name}</span><Button variant="ghost" size="icon" onClick={() => {}} className="text-slate-400 hover:text-destructive"><Trash2 className="w-4 h-4" /></Button></div>))}</div>
                      </div>
                    ))}
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="pt-10 border-t"><div className="flex items-start space-x-4 p-6 border-2 rounded-3xl bg-primary/5 border-primary"><Checkbox checked={data.acks?.docsConfirmed} onCheckedChange={() => onChange('acks', { ...data.acks, docsConfirmed: !data.acks?.docsConfirmed })} /><Label className="text-sm font-bold">I have uploaded the documents currently available to me, or marked unavailable documents where relevant. *</Label></div></div>
        </div>
      );
    }

    case 'authority_matrix': {
      return (
        <div className="space-y-12">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Authority Matrix</h2><p className="text-slate-500 text-lg">Confirm what actions Bid Manager is authorised to take.</p></div>
          <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader><TableRow><TableHead className="w-[40%] pl-8">Action</TableHead>{AUTHORITY_LEVELS.map(level => <TableHead key={level} className="text-center text-[10px] uppercase">{level}</TableHead>)}</TableRow></TableHeader>
              <TableBody>
                {AUTHORITY_ROWS.map((row) => {
                  const currentVal = data.matrix?.[row];
                  const isHighRisk = HIGH_RISK_AUTHORITY_ITEMS.includes(row) && currentVal === 'Authorised';
                  return (
                    <TableRow key={row} className={isHighRisk ? 'bg-amber-50/50' : ''}>
                      <TableCell className="font-medium pl-8 py-4"><div className="flex flex-col gap-1"><span className="text-sm">{row}</span>{isHighRisk && <span className="text-[10px] font-bold text-amber-600 uppercase">High Risk Item</span>}</div></TableCell>
                      {AUTHORITY_LEVELS.map(level => <TableCell key={level} className="text-center p-0"><RadioGroup value={currentVal || ''} onValueChange={(v) => onChange('matrix', { ...data.matrix, [row]: v })} className="flex justify-center"><RadioGroupItem value={level} /></RadioGroup></TableCell>)}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
          <div className="space-y-6 pt-10 border-t"><h3 className="text-xl font-bold">Final Acknowledgements</h3>{[{ id: 'relied', label: 'I understand that Bid Manager will rely on these authority settings.' }, { id: 'auto', label: 'Actions marked as “Authorised” may be performed without further approval.' }, { id: 'consequence', label: 'I understand that pricing and contract terms carry commercial consequences.' }, { id: 'accurate', label: 'I confirm these settings are accurate to the best of my knowledge.' }].map((ack) => (<div key={ack.id} className="flex items-start space-x-4 p-4 border rounded-xl"><Checkbox checked={data.acks?.[ack.id]} onCheckedChange={() => onChange('acks', { ...data.acks, [ack.id]: !data.acks?.[ack.id] })} /><Label className="text-sm font-medium">{ack.label} *</Label></div>))}</div>
        </div>
      );
    }

    case 'final_submission': {
      const isComplete = (visibleSteps.length - 1) === (submission?.completedSteps?.length || 0);
      const incompleteSteps = visibleSteps.filter(s => s.key !== 'final_submission' && !submission?.completedSteps?.includes(s.key));
      const hasDeclarations = data.declarations?.accurateAndComplete && data.declarations?.authorisedToSubmit && data.declarations?.termsAccepted;
      const canSubmit = isComplete && hasDeclarations;

      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Final Declaration and Submission</h2>
            <p className="text-slate-500 text-lg">Review your onboarding status and confirm the final declarations to lock your submission.</p>
          </div>

          <Card className="border-none shadow-sm rounded-3xl bg-white border border-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Onboarding Completion Summary</CardTitle>
              <CardDescription>Review the status of your requirements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Progress</span>
                  <p className="text-3xl font-black text-primary">{Math.round(submission?.completionPercentage || 0)}%</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</span>
                  <p className="font-bold text-slate-700">{isComplete ? 'Ready to Submit' : 'Incomplete'}</p>
                </div>
              </div>
              <Progress value={submission?.completionPercentage || 0} className="h-3" />
              
              {!isComplete && (
                <Alert variant="destructive" className="bg-red-50 border-red-100 rounded-2xl">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertTitle className="font-bold">Required sections incomplete</AlertTitle>
                  <AlertDescription>
                    <p className="mb-3">You must complete the following sections before submitting:</p>
                    <div className="flex flex-wrap gap-2">
                      {incompleteSteps.map(s => (
                        <Button key={s.key} variant="outline" size="sm" className="h-7 text-[10px] rounded-full border-red-200 bg-white" onClick={() => onNavigate(s.key)}>
                          {s.shortTitle}
                        </Button>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl bg-white border border-slate-100">
            <CardHeader>
              <CardTitle className="text-xl">Final Declarations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: 'accurateAndComplete', label: 'I confirm the information provided is accurate and complete to the best of my knowledge.' },
                { id: 'authorisedToSubmit', label: 'I confirm I am authorised to submit this onboarding pack on behalf of the business.' },
                { id: 'termsAccepted', label: 'I acknowledge and accept the Bid Manager Terms and Conditions.' },
                { id: 'informationUseAcknowledged', label: 'I understand Bid Manager may use the information provided to prepare proposal content, recommendations, and applications.' },
                { id: 'approvalResponsibilityAcknowledged', label: 'I understand final commitments may require approval depending on my authority settings.' },
                { id: 'noPasswordsAcknowledged', label: 'I understand I must not provide platform passwords or MFA codes through this portal.' },
                { id: 'submissionLockAcknowledged', label: 'I understand submitted onboarding information will be locked unless Bid Manager reopens it.' }
              ].map(decl => (
                <div key={decl.id} className="flex items-start gap-4 p-4 border rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onChange('declarations', { ...data.declarations, [decl.id]: !data.declarations?.[decl.id] })}>
                  <Checkbox checked={data.declarations?.[decl.id]} onCheckedChange={() => {}} className="mt-1" />
                  <Label className="text-sm font-medium leading-relaxed cursor-pointer">{decl.label}</Label>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Label className="text-lg font-bold">Final Notes (Optional)</Label>
            <Textarea 
              placeholder="Is there anything else we should know before reviewing your onboarding pack?"
              className="min-h-[150px] rounded-3xl p-6"
              value={data.finalNotes || ''}
              onChange={(e) => onChange('finalNotes', e.target.value)}
            />
          </div>

          <div className="p-8 bg-amber-50 border border-amber-200 rounded-[2rem] flex gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <div className="space-y-1">
              <p className="font-bold text-amber-900">Submission Lock Warning</p>
              <p className="text-sm text-amber-700">After submission, your onboarding pack will be locked unless Bid Manager reopens it for edits. Humanity has enough half-submitted paperwork already—please ensure your answers are final.</p>
            </div>
          </div>

          <Button 
            size="lg" 
            className="w-full h-20 rounded-[2rem] text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 gap-4"
            disabled={!canSubmit}
            onClick={onSubmit}
          >
            <Send className="w-6 h-6" /> Submit Onboarding Pack
          </Button>
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

const AUTHORITY_ROWS = [
  "Search for opportunities", "Recommend opportunities", "Create or update platform profiles",
  "Register on free platforms", "Register on paid platforms", "Assist with supplier, tender, or grant registrations",
  "Draft responses, quotes, and applications", "Ask clarification questions", "Communicate with buyers, funders, or leads",
  "Prepare marketplace responses", "Submit marketplace responses", "Submit quote requests", "Submit tenders",
  "Submit grants", "Provide pricing", "Accept terms or contract conditions", "Use supplied documents in submissions",
  "Maintain a reusable bid library", "Follow up with buyers, funders, or leads"
];

const AUTHORITY_LEVELS = ["Authorised", "Authorised after approval", "Not authorised", "Unsure"];
const HIGH_RISK_AUTHORITY_ITEMS = ["Submit tenders", "Submit grants", "Provide pricing", "Accept terms or contract conditions", "Register on paid platforms"];

const DOCUMENT_CATEGORIES = [
  { id: 'business', title: '1. Business Profile and Brand', icon: Building2, fields: [{ id: 'capabilityStatement', label: 'Capability statement' }, { id: 'businessProfile', label: 'Business profile or brochure' }, { id: 'logoFiles', label: 'Logo files' }, { id: 'brandAssets', label: 'Brand assets' }, { id: 'styleGuide', label: 'Style guide' }, { id: 'marketingCopy', label: 'Website or marketing copy' }] },
  { id: 'compliance', title: '2. Compliance and Insurance', icon: ShieldCheck, fields: [{ id: 'publicLiability', label: 'Public liability insurance' }, { id: 'professionalIndemnity', label: 'Professional indemnity insurance' }, { id: 'workersComp', label: 'Workers compensation insurance' }, { id: 'cyberInsurance', label: 'Cyber insurance' }, { id: 'motorVehicle', label: 'Motor vehicle insurance' }, { id: 'licences', label: 'Licences' }, { id: 'certifications', label: 'Certifications' }, { id: 'staffChecks', label: 'Staff checks (Police, WWCC, etc)' }, { id: 'policiesProcedures', label: 'Policies and procedures' }] },
  { id: 'team', title: '3. Team and Capability', icon: Users, fields: [{ id: 'staffCvs', label: 'Staff CVs' }, { id: 'staffBios', label: 'Staff bios' }, { id: 'qualifications', label: 'Qualifications' }, { id: 'tickets', label: 'Tickets' }, { id: 'trainingCertificates', label: 'Training certificates' }, { id: 'orgChart', label: 'Organisational chart' }] },
  { id: 'proof', title: '4. Case Studies and Proof', icon: CheckCircle2, fields: [{ id: 'projectExamples', label: 'Project examples' }, { id: 'caseStudies', label: 'Case studies' }, { id: 'photos', label: 'Photos' }, { id: 'beforeAfter', label: 'Before and after images' }, { id: 'testimonials', label: 'Testimonials' }, { id: 'reviews', label: 'Reviews' }, { id: 'referenceLetters', label: 'Reference letters' }, { id: 'completionCertificates', label: 'Completion certificates' }, { id: 'reports', label: 'Reports' }] },
  { id: 'submissions', title: '5. Previous Submissions and Feedback', icon: FileStack, fields: [{ id: 'previousTenders', label: 'Previous tenders' }, { id: 'previousGrants', label: 'Previous grants' }, { id: 'previousProposals', label: 'Previous proposals' }, { id: 'previousQuotes', label: 'Previous quotes' }, { id: 'supplierRegistrations', label: 'Supplier registrations' }, { id: 'buyerFeedback', label: 'Buyer feedback' }, { id: 'grantFeedback', label: 'Grant feedback' }, { id: 'debriefNotes', label: 'Debrief notes' }] },
  { id: 'pricing', title: '6. Pricing and Commercial', icon: DollarSign, fields: [{ id: 'pricingSchedules', label: 'Pricing schedules' }, { id: 'rateCards', label: 'Rate cards' }, { id: 'packageLists', label: 'Package lists' }, { id: 'quoteTemplates', label: 'Quote templates' }, { id: 'termsConditions', label: 'Terms and conditions' }, { id: 'budgetTemplates', label: 'Budget templates' }, { id: 'grantBudgetDocs', label: 'Grant budget documents' }] },
  { id: 'grantDocs', title: '7. Grant Project Documents', icon: Gift, fields: [{ id: 'supplierQuotes', label: 'Supplier quotes' }, { id: 'projectBudgets', label: 'Project budgets' }, { id: 'supportLetters', label: 'Letters of support' }, { id: 'projectPlans', label: 'Project plans' }, { id: 'evidenceNeed', label: 'Evidence of need' }, { id: 'partnerDocuments', label: 'Partner documents' }] },
  { id: 'other', title: '8. Other Relevant Documents', icon: Files, fields: [{ id: 'otherDocuments', label: 'Other documents' }] }
];
