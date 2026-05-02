"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { 
  ChevronRight, 
  LayoutDashboard,
  CheckCircle2,
  Building2,
  ShieldCheck,
  DollarSign,
  Users,
  Briefcase,
  Plus,
  Trash2,
  UploadCloud,
  Check,
  Lock,
  Files,
  Loader2,
  AlertTriangle,
  AlertCircle,
  FileStack,
  Gift
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
import { getVisibleOnboardingSteps } from '@/lib/onboarding-steps';

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
    return getVisibleOnboardingSteps(selectedServices);
  }, [selectedServices]);

  const currentStep = useMemo(() => visibleSteps.find(s => s.key === stepId), [visibleSteps, stepId]);
  const currentVisibleIndex = useMemo(() => visibleSteps.findIndex(s => s.key === stepId), [visibleSteps, stepId]);

  useEffect(() => {
    if (!loadingSubmissions && submission && !currentStep && stepId) {
      const firstValidStep = visibleSteps[0];
      if (firstValidStep) {
        toast({ title: "Section Hidden", description: "This section is no longer in your scope based on your service selections." });
        router.push(firstValidStep.route);
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
    const targetStep = visibleSteps.find(s => s.key === targetStepKey);
    if (!targetStep) return;

    if (submissionId && db && submission?.status !== 'submitted') {
      const updateData: any = { updatedAt: serverTimestamp(), lastSavedAt: serverTimestamp() };
      updateData[`sections.${stepId}`] = formData;
      updateDoc(doc(db, 'onboardingSubmissions', submissionId), updateData).catch((error: any) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `onboardingSubmissions/${submissionId}`, operation: 'update', requestResourceData: updateData }));
      });
    }
    initialSyncDone.current[targetStepKey] = false;
    router.push(targetStep.route);
  };

  const handleSave = (next: boolean = false) => {
    if (!submissionId || !db || !currentStep || submission?.status === 'submitted') return;
    
    const updateData: any = { updatedAt: serverTimestamp(), lastSavedAt: serverTimestamp() };
    updateData[`sections.${stepId}`] = formData;

    if (stepId === 'service_selection') {
      const services = formData.selectedServices || [];
      const enabledModules = {
        tenderReadiness: services.includes("Government Tenders") || services.includes("Private Tenders") || services.includes("Panel or Supplier Registrations") || services.includes("Unsure, please recommend"),
        grants: services.includes("Grants") || services.includes("Unsure, please recommend"),
        marketplaceStrategy: services.includes("Marketplace Leads") || services.includes("Unsure, please recommend"),
        directOutreachStrategy: services.includes("Direct Proposals") || services.includes("Unsure, please recommend"),
        quoteSupport: services.includes("Quote Requests") || services.includes("Marketplace Leads") || services.includes("Direct Proposals") || services.includes("Unsure, please recommend"),
      };
      updateData.enabledModules = enabledModules;
      updateData.visibleStepKeys = getVisibleOnboardingSteps(services).map(s => s.key);
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
        router.push(nextVisibleStep.route);
        initialSyncDone.current[nextVisibleStep.key] = false;
      }
    } else {
      toast({ title: "Draft Saved", description: "Your progress has been saved." });
    }
  };

  const handleSubmitPack = async () => {
    if (!submissionId || !db || !user) return;

    try {
      await updateDoc(doc(db, 'onboardingSubmissions', submissionId), {
        status: 'submitted',
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        [`sections.final_submission`]: formData
      });

      await updateDoc(doc(db, 'users', user.uid), {
        onboardingStatus: 'submitted',
        updatedAt: serverTimestamp()
      });

      toast({ title: "Submission Successful", description: "Your onboarding pack has been locked and sent to our team." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Submission Failed", description: error.message });
    }
  };

  if (loadingSubmissions || !submission) {
    return <div className="h-screen flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-primary w-10 h-10" /><p className="text-sm font-medium text-muted-foreground">Preparing your workspace...</p></div>;
  }

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

  if (!currentStep) return null;

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
  
  if (submission.status === 'submitted' && stepId === 'final_submission') {
    return (
      <div className="space-y-10 text-center py-6">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 text-green-600 mb-2">
          <Check className="w-12 h-12" strokeWidth={3} />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-headline font-bold text-slate-900">Onboarding Submitted</h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Thank you for submitting your Bid Manager onboarding pack. We will review your responses and supporting documents.
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
            <p className="text-sm text-slate-600 leading-relaxed">This process usually takes about 45 minutes. You can save your draft and return at any time.</p>
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
            <div className="space-y-2"><Label>What are your "Red Flags"? (Opportunities to ignore)</Label><Textarea value={data.redFlags || ''} onChange={(e) => onChange('redFlags', e.target.value)} placeholder="e.g. Clients with poor credit history" /></div>
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
            <div className="space-y-2"><Label>Service Categories</Label><Textarea value={data.serviceCategories || ''} onChange={(e) => onChange('serviceCategories', e.target.value)} placeholder="e.g. Consulting, Civil Works" /></div>
            <div className="space-y-2"><Label>Unique Selling Propositions (USPs)</Label><Textarea value={data.usps || ''} onChange={(e) => onChange('usps', e.target.value)} placeholder="Why choose you over a competitor?" /></div>
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
                <div className="flex items-center space-x-2"><RadioGroupItem value="high" id="c1" /><Label htmlFor="c1">High</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="medium" id="c2" /><Label htmlFor="c2">Medium</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="low" id="c3" /><Label htmlFor="c3">Low</Label></div>
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
      const PLATFORMS = ["Airtasker", "Bark", "ServiceSeeking", "Oneflare", "hipages", "Upwork", "Freelancer", "Fiverr", "TenderLink", "AusTender", "GrantConnect", "Local council portals", "LinkedIn", "Other", "None"];
      const existing = data.existingPlatforms || [];
      return (
        <div className="space-y-12">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Platform and Channel Setup</h2><p className="text-slate-500 text-lg">Tell us which platforms you already use.</p></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PLATFORMS.map(p => (
              <div key={p} onClick={() => { const next = existing.includes(p) ? existing.filter((s: string) => s !== p) : [...existing, p]; onChange('existingPlatforms', next); }} className={`p-4 rounded-xl border-2 cursor-pointer text-xs font-bold transition-all ${existing.includes(p) ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 hover:border-slate-200 text-slate-600'}`}>{p}</div>
            ))}
          </div>
        </div>
      );
    }

    case 'compliance_insurance': {
      const READINESS_ROWS = ["ABN/ACN records", "Public liability insurance", "Professional indemnity insurance", "Workers compensation insurance", "Industry licences", "Police checks", "ISO certifications", "WHS policy", "Privacy policy"];
      const COLUMNS = ["Available and current", "Needs updating", "Do not have", "Unsure"];
      return (
        <div className="space-y-12">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Compliance & Readiness</h2><p className="text-slate-500 text-lg">Identify readiness gaps.</p></div>
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
        </div>
      );
    }

    case 'tender_readiness': {
      return (
        <div className="space-y-8">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Tender Readiness</h2><p className="text-slate-500 text-lg">Formal procurement opportunities.</p></div>
          <div className="space-y-6">
            <div className="space-y-2"><Label>Have you submitted tenders before?</Label>
              <RadioGroup value={data.experience || ''} onValueChange={(v) => onChange('experience', v)} className="flex gap-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="t1" /><Label htmlFor="t1">Yes</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="t2" /><Label htmlFor="t2">No</Label></div>
              </RadioGroup>
            </div>
            <div className="space-y-2"><Label>Who approves final tender submissions?</Label><Input value={data.approver || ''} onChange={(e) => onChange('approver', e.target.value)} /></div>
          </div>
        </div>
      );
    }

    case 'grants': {
      return (
        <div className="space-y-8">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Grants</h2><p className="text-slate-500 text-lg">Identify projects that need funding.</p></div>
          <div className="space-y-6">
            <div className="space-y-2"><Label>Are you interested in grant funding support?</Label>
              <RadioGroup value={data.interest || ''} onValueChange={(v) => onChange('interest', v)} className="flex gap-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="g1" /><Label htmlFor="g1">Yes</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="g2" /><Label htmlFor="g2">No</Label></div>
              </RadioGroup>
            </div>
            {data.interest === 'yes' && (
              <div className="space-y-4">
                <Label>Primary project for grant funding</Label>
                <Textarea value={data.project || ''} onChange={(e) => onChange('project', e.target.value)} />
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'marketplace_strategy': {
      return (
        <div className="space-y-8">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Marketplace Lead Strategy</h2><p className="text-slate-500 text-lg">Rules for marketplace leads.</p></div>
          <div className="space-y-6">
            <div className="space-y-2"><Label>Minimum job value to pursue</Label><Input value={data.minValue || ''} onChange={(e) => onChange('minValue', e.target.value)} /></div>
            <div className="space-y-2"><Label>Monthly budget for leads</Label><Input value={data.budget || ''} onChange={(e) => onChange('budget', e.target.value)} /></div>
          </div>
        </div>
      );
    }

    case 'direct_outreach_strategy': {
      return (
        <div className="space-y-8">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Outreach Strategy</h2><p className="text-slate-500 text-lg">Direct growth channels.</p></div>
          <div className="space-y-6">
            <div className="space-y-2"><Label>Target Organisations</Label><Textarea value={data.targets || ''} onChange={(e) => onChange('targets', e.target.value)} /></div>
          </div>
        </div>
      );
    }

    case 'quote_support': {
      return (
        <div className="space-y-8">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Quote Support</h2><p className="text-slate-500 text-lg">Define quoting rules.</p></div>
          <div className="space-y-6">
            <div className="space-y-2"><Label>What must be included in every quote?</Label><Textarea value={data.inclusions || ''} onChange={(e) => onChange('inclusions', e.target.value)} /></div>
          </div>
        </div>
      );
    }

    case 'workflow_rules': {
      return (
        <div className="space-y-8">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Workflow Rules</h2><p className="text-slate-500 text-lg">Response expectations.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><Label>Primary Review Contact</Label><Input value={data.reviewer || ''} onChange={(e) => onChange('reviewer', e.target.value)} /></div>
            <div className="space-y-2">
              <Label>Response Time Expectation</Label>
              <Select value={data.responseTime || ''} onValueChange={(v) => onChange('responseTime', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="24h">24 hours</SelectItem><SelectItem value="48h">48 hours</SelectItem></SelectContent></Select>
            </div>
          </div>
        </div>
      );
    }

    case 'document_upload_library': {
      const handleFileUpload = async (fieldId: string, files: FileList | null) => {
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

      const DOCUMENT_CATEGORIES = [
        { id: 'business', title: 'Business Profile', icon: Building2, fields: [{ id: 'capabilityStatement', label: 'Capability statement' }, { id: 'logoFiles', label: 'Logo files' }] },
        { id: 'compliance', title: 'Compliance & Insurance', icon: ShieldCheck, fields: [{ id: 'publicLiability', label: 'Public liability' }, { id: 'workersComp', label: 'Workers compensation' }] }
      ];

      return (
        <div className="space-y-12">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Document Upload Library</h2><p className="text-slate-500 text-lg">Central supporting documentation.</p></div>
          <Accordion type="single" collapsible className="space-y-6">
            {DOCUMENT_CATEGORIES.map((cat) => (
              <AccordionItem key={cat.id} value={cat.id} className="border-none">
                <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <AccordionTrigger className="px-8 py-6"><div className="flex items-center gap-4"><cat.icon className="w-5 h-5 text-primary" /><span className="text-lg font-bold">{cat.title}</span></div></AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 space-y-8">
                    {cat.fields.map((field) => (
                      <div key={field.id} className="space-y-4 pt-4">
                        <div className="flex items-center justify-between"><Label className="font-bold">{field.label}</Label><div className="flex items-center gap-3"><input type="file" id={`up-${field.id}`} className="sr-only" multiple onChange={(e) => handleFileUpload(field.id, e.target.files)} /><Button asChild variant="outline" size="sm" className="rounded-xl border-2"><label htmlFor={`up-${field.id}`} className="cursor-pointer gap-2"><UploadCloud className="w-4 h-4" /> Upload</label></Button></div></div>
                        <div className="grid gap-2">{(data.documents?.[field.id]?.files || []).map((file: any) => (<div key={file.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between"><span className="text-xs font-bold truncate max-w-[300px]">{file.name}</span><Button variant="ghost" size="icon" className="text-slate-400 hover:text-destructive"><Trash2 className="w-4 h-4" /></Button></div>))}</div>
                      </div>
                    ))}
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      );
    }

    case 'authority_matrix': {
      const ROWS = ["Search for opportunities", "Submit tenders", "Provide pricing", "Accept terms"];
      const LEVELS = ["Authorised", "Requires approval", "Not authorised"];
      return (
        <div className="space-y-12">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Authority Matrix</h2><p className="text-slate-500 text-lg">What can Bid Manager do?</p></div>
          <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader><TableRow><TableHead className="w-[40%] pl-8">Action</TableHead>{LEVELS.map(level => <TableHead key={level} className="text-center text-[10px] uppercase">{level}</TableHead>)}</TableRow></TableHeader>
              <TableBody>
                {ROWS.map((row) => (
                  <TableRow key={row}>
                    <TableCell className="font-medium pl-8 py-4">{row}</TableCell>
                    {LEVELS.map(level => <TableCell key={level} className="text-center p-0"><RadioGroup value={data.matrix?.[row] || ''} onValueChange={(v) => onChange('matrix', { ...data.matrix, [row]: v })} className="flex justify-center"><RadioGroupItem value={level} /></RadioGroup></TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      );
    }

    case 'final_submission': {
      const isComplete = (visibleSteps.length - 1) === (submission?.completedSteps?.length || 0);
      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Final Declaration</h2>
            <p className="text-slate-500 text-lg">Review status and confirm declarations.</p>
          </div>
          <Card className="p-8 rounded-3xl bg-white border border-slate-100 space-y-6">
            <div className="flex justify-between items-end">
              <div><p className="text-[10px] font-bold text-muted-foreground uppercase">Progress</p><p className="text-3xl font-black text-primary">{Math.round(submission?.completionPercentage || 0)}%</p></div>
              <Badge>{isComplete ? 'Ready' : 'Incomplete'}</Badge>
            </div>
            <Progress value={submission?.completionPercentage || 0} className="h-3" />
          </Card>
          <Button size="lg" className="w-full h-20 rounded-[2rem] text-xl font-black" disabled={!isComplete} onClick={onSubmit}><Send className="w-6 h-6 mr-2" /> Submit Onboarding Pack</Button>
        </div>
      );
    }

    default:
      return null;
  }
}

function Send({ className }: { className?: string }) {
  return <ChevronRight className={className} />;
}
