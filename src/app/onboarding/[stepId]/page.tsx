
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
  ChevronLeft,
  LayoutDashboard,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Plus,
  Trash2,
  UploadCloud,
  Check,
  Lock,
  Files,
  Loader2,
  Briefcase,
  Clock,
  AlertCircle,
  FileText,
  HelpCircle,
  Info
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getVisibleOnboardingSteps } from '@/lib/onboarding-steps';
import { AuthGuard } from '@/components/auth/AuthGuard';

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

  // Sync currentStep in Firestore when the page is opened
  useEffect(() => {
    if (submissionId && db && stepId && submission && submission.status !== 'submitted') {
      if (submission.currentStep !== stepId) {
        updateDoc(doc(db, 'onboardingSubmissions', submissionId), {
          currentStep: stepId,
          updatedAt: serverTimestamp()
        });
      }
    }
  }, [stepId, submissionId, db, submission]);

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
      const updateData: any = { 
        updatedAt: serverTimestamp(), 
        lastSavedAt: serverTimestamp(),
        currentStep: targetStepKey // Ensure we return to where we navigated to
      };
      updateData[`sections.${stepId}`] = formData;
      updateDoc(doc(db, 'onboardingSubmissions', submissionId), updateData).catch((error: any) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `onboardingSubmissions/${submissionId}`, operation: 'update', requestResourceData: updateData }));
      });
    }
    initialSyncDone.current[targetStepKey] = false;
    router.push(targetStep.route);
  };

  const handleSave = (direction: 'next' | 'prev' | 'stay' = 'stay') => {
    if (!submissionId || !db || !currentStep || submission?.status === 'submitted') {
      if (direction === 'next' && currentVisibleIndex < visibleSteps.length - 1) {
        router.push(visibleSteps[currentVisibleIndex + 1].route);
      } else if (direction === 'prev' && currentVisibleIndex > 0) {
        router.push(visibleSteps[currentVisibleIndex - 1].route);
      }
      return;
    }
    
    const updateData: any = { updatedAt: serverTimestamp(), lastSavedAt: serverTimestamp() };
    updateData[`sections.${stepId}`] = formData;

    // Default target for currentStep is the same step unless moving
    let targetStepKey = stepId as string;

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

    if (direction === 'next') {
      const currentCompleted = submission?.completedSteps || [];
      if (!currentCompleted.includes(stepId as string)) {
        updateData.completedSteps = [...currentCompleted, stepId as string];
      }
      const completedCount = updateData.completedSteps?.length || currentCompleted.length;
      updateData.completionPercentage = (completedCount / visibleSteps.length) * 100;
      
      // Update currentStep to the next visible step
      if (currentVisibleIndex < visibleSteps.length - 1) {
        targetStepKey = visibleSteps[currentVisibleIndex + 1].key;
      }
    } else if (direction === 'prev') {
      // Update currentStep to the previous visible step
      if (currentVisibleIndex > 0) {
        targetStepKey = visibleSteps[currentVisibleIndex - 1].key;
      }
    }

    updateData.currentStep = targetStepKey;

    updateDoc(doc(db, 'onboardingSubmissions', submissionId), updateData).catch((error: any) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `onboardingSubmissions/${submissionId}`, operation: 'update', requestResourceData: updateData }));
    });

    if (direction === 'next') {
      const isLastStep = currentVisibleIndex === visibleSteps.length - 1;
      if (!isLastStep) {
        const nextVisibleStep = visibleSteps[currentVisibleIndex + 1];
        router.push(nextVisibleStep.route);
        initialSyncDone.current[nextVisibleStep.key] = false;
      }
    } else if (direction === 'prev') {
      if (currentVisibleIndex > 0) {
        const prevVisibleStep = visibleSteps[currentVisibleIndex - 1];
        router.push(prevVisibleStep.route);
        initialSyncDone.current[prevVisibleStep.key] = false;
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
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
        <p className="text-sm font-medium text-muted-foreground">Preparing your workspace...</p>
      </div>
    );
  }

  if (!currentStep) return null;

  return (
    <AuthGuard>
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
            <div className="flex items-center gap-3">
              {currentVisibleIndex > 0 && (
                <Button variant="ghost" size="sm" onClick={() => handleSave('prev')} className="gap-2 rounded-lg text-muted-foreground"><ChevronLeft className="w-4 h-4" /> Previous</Button>
              )}
              {submission?.status !== 'submitted' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => handleSave('stay')} className="gap-2 rounded-lg border-2">Save Draft</Button>
                  <Button size="sm" onClick={() => handleSave('next')} className="gap-2 rounded-lg font-bold px-6 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20" disabled={currentVisibleIndex === visibleSteps.length - 1}>Next Step <ChevronRight className="w-4 h-4" /></Button>
                </>
              )}
              {submission?.status === 'submitted' && currentVisibleIndex < visibleSteps.length - 1 && (
                <Button size="sm" onClick={() => handleSave('next')} className="gap-2 rounded-lg font-bold px-6 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">Next Step <ChevronRight className="w-4 h-4" /></Button>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto bg-slate-50/30">
            <div className="max-w-4xl mx-auto p-8 lg:p-12">
              {submission.status === 'submitted' && stepId !== 'final_submission' && (
                <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 text-blue-800 animate-in fade-in slide-in-from-top-2">
                  <Lock className="w-5 h-5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Read-Only View</p>
                    <p className="text-xs">Your onboarding pack has been submitted and is locked for review. You can navigate through your responses but edits are disabled.</p>
                  </div>
                </div>
              )}

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
                    currentStep={currentStep}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

function StepContent({ stepId, data, onChange, submission, onNavigate, onSubmit, visibleSteps, currentStep }: { stepId: string, data: any, onChange: (field: string, value: any) => void, submission: any, onNavigate: (key: string) => void, onSubmit: () => void, visibleSteps: any[], currentStep: any }) {
  
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

  const isLocked = submission.status === 'submitted';

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
              <Checkbox id="ready" checked={data.isReady} onCheckedChange={(v) => !isLocked && onChange('isReady', v)} disabled={isLocked} />
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
            <div className="space-y-2"><Label>Australian Business Number (ABN)</Label><Input value={data.abn || ''} onChange={(e) => onChange('abn', e.target.value)} placeholder="00 000 000 000" disabled={isLocked} /></div>
            <div className="space-y-2"><Label>Years in Business</Label><Input type="number" value={data.yearsInBusiness || ''} onChange={(e) => onChange('yearsInBusiness', e.target.value)} disabled={isLocked} /></div>
            <div className="space-y-2"><Label>Full-time Equivalent (FTE) Staff</Label><Input type="number" value={data.staffCount || ''} onChange={(e) => onChange('staffCount', e.target.value)} disabled={isLocked} /></div>
            <div className="space-y-2">
              <Label>Annual Turnover Range</Label>
              <Select value={data.turnover || ''} onValueChange={(v) => onChange('turnover', v)} disabled={isLocked}>
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
            <div className="space-y-2"><Label>Describe your ideal project or client</Label><Textarea value={data.idealClient || ''} onChange={(e) => onChange('idealClient', e.target.value)} placeholder="e.g. Local government landscaping contracts over $50k" disabled={isLocked} /></div>
            <div className="space-y-2"><Label>Minimum project value you will consider</Label><Input value={data.minValue || ''} onChange={(e) => onChange('minValue', e.target.value)} placeholder="$10,000" disabled={isLocked} /></div>
            <div className="space-y-2"><Label>What are your "Red Flags"? (Opportunities to ignore)</Label><Textarea value={data.redFlags || ''} onChange={(e) => onChange('redFlags', e.target.value)} placeholder="e.g. Clients with poor credit history" disabled={isLocked} /></div>
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
                onClick={() => { if (isLocked) return; const current = data.selectedServices || []; const next = current.includes(service) ? current.filter((s: string) => s !== service) : [...current, service]; onChange('selectedServices', next); }}
                className={`p-6 rounded-2xl border-2 transition-all flex items-center justify-between ${isLocked ? 'cursor-default' : 'cursor-pointer'} ${selected.includes(service) ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <span className="font-bold text-slate-700">{service}</span><Checkbox checked={selected.includes(service)} onCheckedChange={() => {}} disabled={isLocked} />
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
            <div className="space-y-2"><Label>Business Mission & Purpose</Label><Textarea value={data.mission || ''} onChange={(e) => onChange('mission', e.target.value)} placeholder="Why do you do what you do?" disabled={isLocked} /></div>
            <div className="space-y-2"><Label>Key Business Values</Label><Textarea value={data.values || ''} onChange={(e) => onChange('values', e.target.value)} placeholder="e.g. Safety, Integrity, Innovation" disabled={isLocked} /></div>
            <div className="space-y-2"><Label>Brief History / Background</Label><Textarea value={data.history || ''} onChange={(e) => onChange('history', e.target.value)} placeholder="How did the business start?" disabled={isLocked} /></div>
          </div>
        </div>
      );
    }

    case 'offer_menu': {
      return (
        <div className="space-y-8">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Offer Menu</h2><p className="text-slate-500 text-lg">List your key products and services.</p></div>
          <div className="space-y-6">
            <div className="space-y-2"><Label>Service Categories</Label><Textarea value={data.serviceCategories || ''} onChange={(e) => onChange('serviceCategories', e.target.value)} placeholder="e.g. Consulting, Civil Works" disabled={isLocked} /></div>
            <div className="space-y-2"><Label>Unique Selling Propositions (USPs)</Label><Textarea value={data.usps || ''} onChange={(e) => onChange('usps', e.target.value)} placeholder="Why choose you over a competitor?" disabled={isLocked} /></div>
          </div>
        </div>
      );
    }

    case 'team_capacity': {
      return (
        <div className="space-y-8">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Team & Capacity</h2><p className="text-slate-500 text-lg">Help us understand who is delivering the work.</p></div>
          <div className="space-y-6">
            <div className="space-y-2"><Label>Organisational Structure Overview</Label><Textarea value={data.orgOverview || ''} onChange={(e) => onChange('orgOverview', e.target.value)} placeholder="Who reports to whom?" disabled={isLocked} /></div>
            <div className="space-y-2">
              <Label>Current Capacity Level</Label>
              <RadioGroup value={data.capacity || ''} onValueChange={(v) => onChange('capacity', v)} className="flex gap-4" disabled={isLocked}>
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
            <div className="space-y-2"><Label>Top 3 Projects (Name, Client, Value, Year)</Label><Textarea className="h-40" value={data.topProjects || ''} onChange={(e) => onChange('topProjects', e.target.value)} placeholder="1. Project X - Client Y - $100k - 2023" disabled={isLocked} /></div>
            <div className="space-y-2"><Label>Contact Details for 3 Professional References</Label><Textarea value={data.references || ''} onChange={(e) => onChange('references', e.target.value)} disabled={isLocked} /></div>
          </div>
        </div>
      );
    }

    case 'goals_strategy': {
      return (
        <div className="space-y-8">
          <div className="space-y-4"><h2 className="text-4xl font-headline font-bold text-slate-900">Goals & Strategy</h2><p className="text-slate-500 text-lg">Where are we heading?</p></div>
          <div className="space-y-6">
            <div className="space-y-2"><Label>Revenue Goal for the Next 12 Months</Label><Input value={data.revenueGoal || ''} onChange={(e) => onChange('revenueGoal', e.target.value)} placeholder="$2,000,000" disabled={isLocked} /></div>
            <div className="space-y-2"><Label>Target Market Sectors</Label><Textarea value={data.targetSectors || ''} onChange={(e) => onChange('targetSectors', e.target.value)} placeholder="e.g. Healthcare, Education" disabled={isLocked} /></div>
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
              <Select value={data.pricingModel || ''} onValueChange={(v) => onChange('pricingModel', v)} disabled={isLocked}>
                <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                  <SelectItem value="retainer">Retainer</SelectItem>
                  <SelectItem value="hybrid">Hybrid / Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>General Payment Terms</Label><Input value={data.paymentTerms || ''} onChange={(e) => onChange('paymentTerms', e.target.value)} placeholder="e.g. Net 30" disabled={isLocked} /></div>
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
              <div key={p} onClick={() => { if (isLocked) return; const next = existing.includes(p) ? existing.filter((s: string) => s !== p) : [...existing, p]; onChange('existingPlatforms', next); }} className={`p-4 rounded-xl border-2 transition-all text-xs font-bold ${isLocked ? 'cursor-default' : 'cursor-pointer'} ${existing.includes(p) ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 hover:border-slate-200 text-slate-600'}`}>{p}</div>
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
                    {COLUMNS.map(c => <TableCell key={c} className="text-center"><RadioGroup value={data.grid?.[row] || ''} onValueChange={(v) => !isLocked && onChange('grid', { ...data.grid, [row]: v })} className="flex justify-center" disabled={isLocked}><RadioGroupItem value={c} /></RadioGroup></TableCell>)}
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
              <RadioGroup value={data.experience || ''} onValueChange={(v) => onChange('experience', v)} className="flex gap-4" disabled={isLocked}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="t1" /><Label htmlFor="t1">Yes</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="t2" /><Label htmlFor="t2">No</Label></div>
              </RadioGroup>
            </div>
            <div className="space-y-2"><Label>Who approves final tender submissions?</Label><Input value={data.approver || ''} onChange={(e) => onChange('approver', e.target.value)} disabled={isLocked} /></div>
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
              <RadioGroup value={data.interest || ''} onValueChange={(v) => onChange('interest', v)} className="flex gap-4" disabled={isLocked}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="g1" /><Label htmlFor="g1">Yes</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="g2" /><Label htmlFor="g2">No</Label></div>
              </RadioGroup>
            </div>
            {data.interest === 'yes' && (
              <div className="space-y-4">
                <Label>Primary project for grant funding</Label>
                <Textarea value={data.project || ''} onChange={(e) => onChange('project', e.target.value)} disabled={isLocked} />
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'marketplace_strategy': {
      const PLATFORMS = ["Airtasker", "Bark", "ServiceSeeking", "Oneflare", "hipages", "Upwork", "Freelancer", "Fiverr", "Other service-based marketplaces", "Unsure, please recommend"];
      const selectedPlatforms = data.selectedPlatforms || [];
      const platformStrategies = data.platformStrategies || {};

      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Marketplace Lead Strategy</h2>
            <p className="text-slate-500 text-lg leading-relaxed">Complete this section if you want support with marketplace lead platforms.</p>
          </div>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b p-8">
              <CardTitle className="text-xl">Marketplace Platform Selection</CardTitle>
              <CardDescription>Which marketplace platforms are you open to using?</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PLATFORMS.map(p => (
                  <div 
                    key={p} 
                    onClick={() => {
                      if (isLocked) return;
                      const next = selectedPlatforms.includes(p) ? selectedPlatforms.filter((s: string) => s !== p) : [...selectedPlatforms, p];
                      onChange('selectedPlatforms', next);
                    }}
                    className={`p-6 rounded-2xl border-2 transition-all flex items-center justify-between ${isLocked ? 'cursor-default' : 'cursor-pointer'} ${selectedPlatforms.includes(p) ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <span className="font-bold text-slate-700">{p}</span>
                    <Checkbox checked={selectedPlatforms.includes(p)} disabled={isLocked} onCheckedChange={() => {}} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedPlatforms.filter((p: string) => p !== "Unsure, please recommend").map((platform: string) => (
            <Card key={platform} className="border-2 border-primary/10 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-white border-primary/20 text-primary uppercase font-bold tracking-widest text-[10px] py-1 px-3">Platform Strategy</Badge>
                  <CardTitle className="text-2xl font-bold">{platform}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-slate-900 font-bold">Current Account Status</Label>
                    <Select 
                      value={platformStrategies[platform]?.status || ''} 
                      onValueChange={(v) => onChange('platformStrategies', { ...platformStrategies, [platform]: { ...platformStrategies[platform], status: v } })}
                      disabled={isLocked}
                    >
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        {["No account yet", "Account exists", "Active profile", "Profile needs updating", "Unsure"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-slate-900 font-bold">Paid Lead / Credit Comfort Level</Label>
                    <Select 
                      value={platformStrategies[platform]?.comfort || ''} 
                      onValueChange={(v) => onChange('platformStrategies', { ...platformStrategies, [platform]: { ...platformStrategies[platform], comfort: v } })}
                      disabled={isLocked}
                    >
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select level" /></SelectTrigger>
                      <SelectContent>
                        {["Yes, willing to pay", "Only with approval", "No paid leads", "Unsure"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-slate-900 font-bold">Minimum Job Value for {platform}</Label>
                  <Input 
                    value={platformStrategies[platform]?.minValue || ''} 
                    onChange={(e) => onChange('platformStrategies', { ...platformStrategies, [platform]: { ...platformStrategies[platform], minValue: e.target.value } })}
                    placeholder="e.g. $500"
                    className="h-12 rounded-xl"
                    disabled={isLocked}
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-slate-900 font-bold">Services suitable for this platform</Label>
                  <Textarea 
                    value={platformStrategies[platform]?.services || ''} 
                    onChange={(e) => onChange('platformStrategies', { ...platformStrategies, [platform]: { ...platformStrategies[platform], services: e.target.value } })}
                    className="rounded-2xl"
                    disabled={isLocked}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-slate-900 font-bold">Preferred Lead Types</Label>
                    <Textarea 
                      value={platformStrategies[platform]?.preferred || ''} 
                      onChange={(e) => onChange('platformStrategies', { ...platformStrategies, [platform]: { ...platformStrategies[platform], preferred: e.target.value } })}
                      className="rounded-2xl"
                      disabled={isLocked}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-slate-900 font-bold">Lead Types to Ignore</Label>
                    <Textarea 
                      value={platformStrategies[platform]?.ignore || ''} 
                      onChange={(e) => onChange('platformStrategies', { ...platformStrategies, [platform]: { ...platformStrategies[platform], ignore: e.target.value } })}
                      className="rounded-2xl"
                      disabled={isLocked}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    case 'direct_outreach_strategy': {
      const CHANNELS = ["Direct proposals", "Email outreach", "LinkedIn outreach", "Referral partner outreach", "Local council supplier registration", "Corporate supplier registration", "Subcontractor positioning", "Industry association opportunities", "Previous client reactivation", "Capability statement campaign", "Other"];
      const targetCount = parseInt(data.targetCount || "1");
      const targets = data.targets || Array(5).fill({});

      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Direct Proposal and Outreach Strategy</h2>
            <p className="text-slate-500 text-lg leading-relaxed">Complete this section if you want support with direct proposals, campaigns, or target account development.</p>
          </div>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b p-8">
              <CardTitle className="text-xl">Direct Growth Channels</CardTitle>
              <CardDescription>Which direct growth channels are you open to?</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CHANNELS.map(c => (
                  <div 
                    key={c} 
                    onClick={() => {
                      if (isLocked) return;
                      const next = (data.channels || []).includes(c) ? data.channels.filter((s: string) => s !== c) : [...(data.channels || []), c];
                      onChange('channels', next);
                    }}
                    className={`p-6 rounded-2xl border-2 transition-all flex items-center justify-between ${isLocked ? 'cursor-default' : 'cursor-pointer'} ${(data.channels || []).includes(c) ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <span className="font-bold text-slate-700">{c}</span>
                    <Checkbox checked={(data.channels || []).includes(c)} disabled={isLocked} onCheckedChange={() => {}} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    case 'quote_support': {
      const QUOTE_TYPES = ["Fixed-price quotes", "Hourly rate quotes", "Project quotes", "Service packages", "Maintenance quotes", "Emergency work quotes", "Inspection-based quotes", "Marketplace responses", "Supplier quote requests", "Other"];

      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Quote Request Support</h2>
            <p className="text-slate-500 text-lg leading-relaxed">Complete this section if you want Bid Manager to help prepare, structure, review, or respond to quote requests.</p>
          </div>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b p-8">
              <CardTitle className="text-xl">Quote Types</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <Label className="font-bold">What quote types do you regularly prepare?</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {QUOTE_TYPES.map(q => (
                    <div 
                      key={q} 
                      onClick={() => { if (isLocked) return; const next = (data.quoteTypes || []).includes(q) ? data.quoteTypes.filter((s: string) => s !== q) : [...(data.quoteTypes || []), q]; onChange('quoteTypes', next); }}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${isLocked ? 'cursor-default' : 'cursor-pointer'} ${(data.quoteTypes || []).includes(q) ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <span className="font-bold text-xs text-slate-700">{q}</span>
                      <Checkbox checked={(data.quoteTypes || []).includes(q)} disabled={isLocked} onCheckedChange={() => {}} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    case 'workflow_rules': {
      const CHANNELS = ["Email", "Phone", "SMS", "Microsoft Teams", "Google Meet", "Zoom", "WhatsApp", "Shared Google Drive", "Project management tool", "Other"];
      const selectedChannels = data.channels || [];

      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Communication & Workflow Rules</h2>
            <p className="text-slate-500 text-lg leading-relaxed">Set your preferred communication methods, review process, and response expectations.</p>
          </div>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b p-8">
              <CardTitle className="text-xl">Communication Preferences</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <Label className="font-bold">Preferred communication methods</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {CHANNELS.map(c => (
                    <div 
                      key={c} 
                      onClick={() => { if (isLocked) return; const next = selectedChannels.includes(c) ? selectedChannels.filter((s: string) => s !== c) : [...selectedChannels, c]; onChange('channels', next); }}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${isLocked ? 'cursor-default' : 'cursor-pointer'} ${selectedChannels.includes(c) ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <span className="font-bold text-[10px] uppercase text-slate-700">{c}</span>
                      <Checkbox checked={selectedChannels.includes(c)} disabled={isLocked} onCheckedChange={() => {}} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    case 'document_upload_library': {
      const categories = [
        { key: 'profile', title: 'Business Profile and Brand', fields: ['Capability statement', 'Brochure', 'Logo files', 'Style guide'] },
        { key: 'compliance', title: 'Compliance and Insurance', fields: ['Public liability', 'Prof. indemnity', 'Workers compensation', 'Licences'] },
        { key: 'team', title: 'Team and Capability', fields: ['Staff CVs', 'Bios', 'Qualifications', 'Org chart'] },
        { key: 'proof', title: 'Case Studies and Proof', fields: ['Project examples', 'Testimonials', 'Reviews', 'Photos'] },
        { key: 'commercial', title: 'Pricing and Commercial', fields: ['Rate cards', 'Package lists', 'Terms and conditions'] }
      ];

      const handleFileUpload = async (categoryKey: string, field: string, files: FileList | null) => {
        if (!files || !submissionId || !user) return;
        const storage = getStorage();
        const uploadedItems = data.uploads || [];
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileName = `${Date.now()}_${file.name}`;
          const path = `onboardingUploads/${user.uid}/${submissionId}/${categoryKey}/${fileName}`;
          const fileRef = ref(storage, path);
          
          try {
            const snapshot = await uploadBytes(fileRef, file);
            const url = await getDownloadURL(snapshot.ref);
            uploadedItems.push({
              id: fileName,
              name: file.name,
              size: file.size,
              category: categoryKey,
              field,
              url,
              path,
              uploadedAt: new Date().toISOString()
            });
          } catch (e) { toast({ variant: "destructive", title: "Upload failed" }); }
        }
        onChange('uploads', uploadedItems);
      };

      const handleRemoveFile = (fileId: string) => {
        if (isLocked) return;
        const next = (data.uploads || []).filter((f: any) => f.id !== fileId);
        onChange('uploads', next);
      };

      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Document Upload Library</h2>
            <p className="text-slate-500 text-lg leading-relaxed">Upload the documents we need to build your profiles and proposal library.</p>
          </div>

          <div className="grid gap-8">
            {categories.map(cat => (
              <Card key={cat.key} className="border-none shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b p-8">
                  <CardTitle className="text-xl">{cat.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {cat.fields.map(field => {
                    const fieldFiles = (data.uploads || []).filter((f: any) => f.category === cat.key && f.field === field);
                    return (
                      <div key={field} className="space-y-4 p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                        <div className="flex items-center justify-between">
                          <Label className="font-bold">{field}</Label>
                          <div className="relative">
                            <input 
                              type="file" 
                              id={`up-${cat.key}-${field}`} 
                              className="sr-only" 
                              multiple 
                              onChange={(e) => handleFileUpload(cat.key, field, e.target.files)}
                              disabled={isLocked}
                            />
                            <Button asChild variant="outline" size="sm" className="rounded-xl border-2 cursor-pointer" disabled={isLocked}>
                              <label htmlFor={`up-${cat.key}-${field}`} className="gap-2">
                                <UploadCloud className="w-4 h-4" /> {fieldFiles.length > 0 ? 'Upload More' : 'Upload File'}
                              </label>
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {fieldFiles.map((file: any) => (
                            <div key={file.id} className="bg-white p-3 rounded-xl border flex items-center justify-between shadow-sm animate-in fade-in zoom-in-95">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-[8px] uppercase font-black tracking-widest shrink-0">{(file.size / 1024 / 1024).toFixed(2)} MB</Badge>
                                <span className="text-xs font-bold truncate max-w-[300px] text-slate-700">{file.name}</span>
                              </div>
                              {!isLocked && (
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-destructive h-8 w-8" onClick={() => handleRemoveFile(file.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    case 'authority_matrix': {
      const ROWS = ["Search for opportunities", "Recommend opportunities", "Create or update platform profiles", "Register on free platforms", "Register on paid platforms", "Assist with registrations", "Draft responses and quotes", "Ask clarification questions", "Communicate with buyers/leads", "Submit marketplace responses", "Submit quote requests", "Submit tenders", "Submit grants", "Provide pricing", "Accept terms or contract conditions", "Use supplied documents", "Maintain reusable bid library", "Follow up with buyers/leads"];
      const COLUMNS = ["Authorised", "Authorised after approval", "Not authorised", "Unsure"];

      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Authority Matrix</h2>
            <p className="text-slate-500 text-lg">Confirm what Bid Manager can do on your behalf.</p>
          </div>

          <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="w-[40%] pl-8 py-6 font-bold text-slate-900">Action</TableHead>
                    {COLUMNS.map(c => <TableHead key={c} className="text-center text-[10px] uppercase font-black tracking-widest text-slate-400 px-4">{c}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ROWS.map(row => (
                    <TableRow key={row} className="hover:bg-slate-50/30 transition-colors">
                      <TableCell className="font-bold text-sm pl-8 py-5 text-slate-700">{row}</TableCell>
                      {COLUMNS.map(c => (
                        <TableCell key={c} className="text-center p-0">
                          <RadioGroup value={data.matrix?.[row] || ''} onValueChange={(v) => !isLocked && onChange('matrix', { ...data.matrix, [row]: v })} className="flex justify-center" disabled={isLocked}>
                            <RadioGroupItem value={c} />
                          </RadioGroup>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      );
    }

    case 'final_submission': {
      const isComplete = (visibleSteps.length - 1) <= (submission?.completedSteps?.length || 0);

      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Final Declaration & Submission</h2>
            <p className="text-slate-500 text-lg">Review your onboarding status and confirm the final declarations.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm rounded-3xl p-8 bg-white flex flex-col justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Completion</p>
                <p className="text-4xl font-black text-primary">{Math.round(submission?.completionPercentage || 0)}%</p>
              </div>
              <Progress value={submission?.completionPercentage || 0} className="h-2" />
            </Card>
          </div>

          <div className="pt-8">
            <Button 
              size="lg" 
              className="w-full h-20 rounded-[2.5rem] text-xl font-black shadow-2xl shadow-primary/30 transition-transform active:scale-[0.98]" 
              disabled={!isComplete || isLocked} 
              onClick={onSubmit}
            >
              {isLocked ? "Submission Finalised" : "Submit Onboarding Pack"}
            </Button>
          </div>
        </div>
      );
    }

    default:
      return (
        <div className="py-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
            <HelpCircle className="w-10 h-10 text-slate-300" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900">Coming Soon</h3>
            <p className="text-slate-400 max-w-md mx-auto">The content for this section (<strong>{stepId}</strong>) is currently being populated.</p>
          </div>
          <Button variant="outline" onClick={() => onNavigate(visibleSteps[0].key)}>Return to Start</Button>
        </div>
      );
  }
}
