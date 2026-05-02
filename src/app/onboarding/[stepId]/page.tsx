
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
  MapPin,
  Sparkles,
  FileStack,
  MessageSquareQuote,
  Target as TargetIcon,
  Flag,
  SlidersHorizontal,
  Plus,
  Info,
  ShieldAlert,
  Wallet,
  Monitor,
  FileCheck,
  History,
  AlertTriangle,
  UploadCloud,
  ArrowRight,
  Handshake,
  Lightbulb,
  Clock,
  ShieldQuestion,
  Search,
  UserPlus,
  Megaphone,
  AlertOctagon,
  Coins,
  Phone,
  Mail,
  MessageCircle,
  Stethoscope
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  { id: 'workflow', title: '18. Communication, Review and Workflow Rules', icon: MessageSquare },
  { id: 'library', title: '19. Document Upload Library', icon: Library },
  { id: 'authority', title: '20. Authority to Act and Approval Matrix', icon: Scale },
];

const QUOTE_TYPES = [
  "Fixed-price quotes", "Hourly rate quotes", "Project quotes", "Service packages", 
  "Maintenance quotes", "Emergency work quotes", "Inspection-based quotes", 
  "Marketplace responses", "Supplier quote requests", "Other"
];

const COMMUNICATION_METHODS = [
  "Email", "Phone", "SMS", "Microsoft Teams", "Google Meet", "Zoom", "WhatsApp", "Shared Google Drive", "Project management tool", "Other"
];

const RESPONSE_TIMES = [
  "Same day", "Within 24 hours", "Within 48 hours", "2-3 business days", "Depends on the request"
];

const REVIEW_TIMES = [
  "Less than 24 hours", "1 business day", "2 business days", "3 business days", "More than 3 business days", "Depends on complexity"
];

const DEADLINE_BUFFERS = [
  "24 hours before", "48 hours before", "3 business days before", "5 business days before", "Depends on opportunity"
];

const FEEDBACK_METHODS = [
  "Comments in document", "Email summary", "Phone call", "Video meeting", "Shared task list", "Other"
];

const ESCALATION_RULES = [
  "Email primary contact", "Call primary contact", "Contact secondary contact", "Contact urgent approval contact", "Pause work until response", "Other"
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
        if (sid === 'workflow') {
          setFormData({
            commMethods: [],
            primaryComm: '',
            responseTimes: '',
            reviewTime: '',
            deadlineBuffer: '',
            feedbackMethods: [],
            escalationRule: ''
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
    if (sid === 'workflow') {
      if (!data.commMethods?.length) return "Please select at least one communication method.";
      if (!data.primaryComm) return "Please select a primary communication method.";
      if (!data.responseTimes) return "Response time selection is required.";
      if (!data.draftReviewer) return "Please specify who reviews draft responses.";
      if (!data.finalApprover) return "Please specify who approves final submissions.";
      if (!data.reviewTime) return "Review time selection is required.";
      if (!data.deadlineBuffer) return "Deadline buffer selection is required.";
      if (!data.escalationRule) return "Escalation rule selection is required.";
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
    
    // Logic for conditional steps
    const selection = submission?.sections?.selection?.selectedServices || [];
    const enabled = submission?.enabledModules?.[s.conditional];
    const unsureSelected = selection.includes('Unsure, please recommend');

    if (s.id === 'quote') {
      return (
        enabled || 
        selection.includes('Marketplace Leads') || 
        selection.includes('Direct Proposals') ||
        unsureSelected
      );
    }

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
            <Button variant="outline" size="sm" onClick={() => handleSave(false)} className="gap-2 rounded-lg border-2">Save Draft</Button>
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
    case 'workflow': {
      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Communication, Review and Workflow Rules</h2>
            <p className="text-slate-500 text-lg leading-relaxed">Define how we'll work together during active opportunities, reviews, and approvals.</p>
          </div>

          <Card className="border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><MessageSquare className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold text-slate-900">Communication Preferences</h3>
            </div>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <Label className="text-lg font-bold">Preferred communication methods *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {COMMUNICATION_METHODS.map(method => (
                    <div 
                      key={method} 
                      className={`flex items-center space-x-2 p-3 rounded-xl border cursor-pointer transition-all ${data.commMethods?.includes(method) ? 'border-primary bg-primary/5' : 'bg-white hover:bg-slate-50'}`}
                      onClick={() => {
                        const current = data.commMethods || [];
                        const next = current.includes(method) ? current.filter((m: string) => m !== method) : [...current, method];
                        onChange('commMethods', next);
                      }}
                    >
                      <Checkbox checked={data.commMethods?.includes(method)} onCheckedChange={() => {}} />
                      <Label className="text-xs cursor-pointer">{method}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {data.commMethods?.includes('Other') && (
                <div className="animate-in slide-in-from-top-2">
                  <Label className="font-bold">Please specify other communication method *</Label>
                  <Input 
                    value={data.otherCommMethod || ''} 
                    onChange={(e) => onChange('otherCommMethod', e.target.value)} 
                    placeholder="e.g. Signal, Discord..."
                    className="h-12 rounded-xl mt-2" 
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="font-bold">Primary communication preference *</Label>
                <Select value={data.primaryComm} onValueChange={(v) => onChange('primaryComm', v)}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select primary method" />
                  </SelectTrigger>
                  <SelectContent>
                    {(data.commMethods || []).map((method: string) => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">What days or times are usually difficult for your team to respond?</Label>
                <Textarea 
                  value={data.difficultTimes || ''} 
                  onChange={(e) => onChange('difficultTimes', e.target.value)} 
                  placeholder="e.g. Monday mornings during stand-ups, Fridays after 3 PM..."
                  className="min-h-[80px] rounded-2xl" 
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Any communication preferences or restrictions?</Label>
                <Textarea 
                  value={data.commRestrictions || ''} 
                  onChange={(e) => onChange('commRestrictions', e.target.value)} 
                  placeholder="e.g. No calls before 9 AM, preferred primary point of contact is Jane..."
                  className="min-h-[80px] rounded-2xl" 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><Clock className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold text-slate-900">Response Times</h3>
            </div>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <Label className="text-lg font-bold">How quickly can you usually respond during active opportunities? *</Label>
                <RadioGroup value={data.responseTimes} onValueChange={(v) => onChange('responseTimes', v)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {RESPONSE_TIMES.map(opt => (
                    <div key={opt} className={`flex items-center space-x-2 p-3 rounded-xl border hover:bg-slate-50 transition-colors ${data.responseTimes === opt ? 'border-primary bg-primary/5' : 'bg-white'}`}>
                      <RadioGroupItem value={opt} id={`resp-${opt}`} />
                      <Label htmlFor={`resp-${opt}`} className="cursor-pointer flex-1 py-1">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {data.responseTimes === 'Depends on the request' && (
                <div className="animate-in slide-in-from-top-2">
                  <Label className="font-bold">Please explain what affects response time *</Label>
                  <Textarea 
                    value={data.responseTimeExplanation || ''} 
                    onChange={(e) => onChange('responseTimeExplanation', e.target.value)} 
                    className="min-h-[80px] rounded-2xl mt-2" 
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="font-bold">What should be treated as urgent?</Label>
                <Textarea 
                  value={data.urgentDefinition || ''} 
                  onChange={(e) => onChange('urgentDefinition', e.target.value)} 
                  placeholder="e.g. Deadline within 24 hours, request for final price change..."
                  className="min-h-[80px] rounded-2xl" 
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Who should be contacted for urgent approvals?</Label>
                <Input 
                  value={data.urgentContact || ''} 
                  onChange={(e) => onChange('urgentContact', e.target.value)} 
                  placeholder="Name and phone number"
                  className="h-12 rounded-xl" 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><FileCheck className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold text-slate-900">Review and Approval Workflow</h3>
            </div>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold">Who should review draft responses? *</Label>
                  <Input value={data.draftReviewer || ''} onChange={(e) => onChange('draftReviewer', e.target.value)} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Who approves final submissions? *</Label>
                  <Input value={data.finalApprover || ''} onChange={(e) => onChange('finalApprover', e.target.value)} className="h-12 rounded-xl" />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="font-bold">How much time do you need to review drafts? *</Label>
                <RadioGroup value={data.reviewTime} onValueChange={(v) => onChange('reviewTime', v)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {REVIEW_TIMES.map(opt => (
                    <div key={opt} className={`flex items-center space-x-2 p-3 rounded-xl border hover:bg-slate-50 transition-colors ${data.reviewTime === opt ? 'border-primary bg-primary/5' : 'bg-white'}`}>
                      <RadioGroupItem value={opt} id={`review-${opt}`} />
                      <Label htmlFor={`review-${opt}`} className="cursor-pointer flex-1 py-1">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label className="font-bold">How far before the deadline should final approval be done? *</Label>
                <RadioGroup value={data.deadlineBuffer} onValueChange={(v) => onChange('deadlineBuffer', v)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DEADLINE_BUFFERS.map(opt => (
                    <div key={opt} className={`flex items-center space-x-2 p-3 rounded-xl border hover:bg-slate-50 transition-colors ${data.deadlineBuffer === opt ? 'border-primary bg-primary/5' : 'bg-white'}`}>
                      <RadioGroupItem value={opt} id={`buffer-${opt}`} />
                      <Label htmlFor={`buffer-${opt}`} className="cursor-pointer flex-1 py-1">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label className="font-bold">Preferred feedback method</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {FEEDBACK_METHODS.map(method => (
                    <div 
                      key={method} 
                      className={`flex items-center space-x-2 p-3 rounded-xl border cursor-pointer transition-all ${data.feedbackMethods?.includes(method) ? 'border-primary bg-primary/5' : 'bg-white hover:bg-slate-50'}`}
                      onClick={() => {
                        const current = data.feedbackMethods || [];
                        const next = current.includes(method) ? current.filter((m: string) => m !== method) : [...current, method];
                        onChange('feedbackMethods', next);
                      }}
                    >
                      <Checkbox checked={data.feedbackMethods?.includes(method)} onCheckedChange={() => {}} />
                      <Label className="text-xs cursor-pointer">{method}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {data.feedbackMethods?.includes('Other') && (
                <div className="animate-in slide-in-from-top-2">
                  <Label className="font-bold">Please specify other feedback method *</Label>
                  <Input 
                    value={data.otherFeedbackMethod || ''} 
                    onChange={(e) => onChange('otherFeedbackMethod', e.target.value)} 
                    className="h-12 rounded-xl mt-2" 
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><AlertOctagon className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold text-slate-900">Escalation Rules</h3>
            </div>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <Label className="text-lg font-bold">What should Bid Manager do if a deadline is approaching and we have not received a response? *</Label>
                <RadioGroup value={data.escalationRule} onValueChange={(v) => onChange('escalationRule', v)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ESCALATION_RULES.map(opt => (
                    <div key={opt} className={`flex items-center space-x-2 p-3 rounded-xl border hover:bg-slate-50 transition-colors ${data.escalationRule === opt ? 'border-primary bg-primary/5' : 'bg-white'}`}>
                      <RadioGroupItem value={opt} id={`esc-${opt}`} />
                      <Label htmlFor={`esc-${opt}`} className="cursor-pointer flex-1 py-1">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {data.escalationRule === 'Other' && (
                <div className="animate-in slide-in-from-top-2">
                  <Label className="font-bold">Please specify other escalation action *</Label>
                  <Input 
                    value={data.otherEscalation || ''} 
                    onChange={(e) => onChange('otherEscalation', e.target.value)} 
                    className="h-12 rounded-xl mt-2" 
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="font-bold">Are there any people who should not be contacted unless specifically approved? (Write "None" if N/A)</Label>
                <Textarea 
                  value={data.noContactList || ''} 
                  onChange={(e) => onChange('noContactList', e.target.value)} 
                  className="min-h-[80px] rounded-2xl" 
                />
              </div>
            </CardContent>
          </Card>

          <div className="p-6 bg-slate-900 text-white rounded-[2rem] shadow-lg flex items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl"><Zap className="w-6 h-6 text-accent" /></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Workflow Summary</p>
                <p className="text-lg font-medium">Standard response within {data.responseTimes || '...'} | Approval needed {data.deadlineBuffer || '...'} before deadline.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    case 'quote': {
      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Quote Request Support</h2>
            <p className="text-slate-500 text-lg leading-relaxed">Tell us how you manage quotes so we can help prepare, structure, and review your responses.</p>
          </div>

          <Card className="border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><FileText className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold text-slate-900">Quote Types</h3>
            </div>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <Label className="text-lg font-bold">What quote types do you regularly prepare? *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {QUOTE_TYPES.map(type => (
                    <div key={type} className={`flex items-center space-x-2 p-3 rounded-xl border cursor-pointer ${data.quoteTypes?.includes(type) ? 'border-primary bg-primary/5' : 'bg-white'}`} onClick={() => {
                      const current = data.quoteTypes || [];
                      const next = current.includes(type) ? current.filter((t: string) => t !== type) : [...current, type];
                      onChange('quoteTypes', next);
                    }}>
                      <Checkbox checked={data.quoteTypes?.includes(type)} onCheckedChange={() => {}} />
                      <Label className="text-xs cursor-pointer">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">What information is needed before you can quote? *</Label>
                <Textarea value={data.infoNeededBeforeQuote || ''} onChange={(e) => onChange('infoNeededBeforeQuote', e.target.value)} placeholder="e.g. Dimensions, site photos, material preferences..." className="min-h-[100px] rounded-2xl" />
              </div>
              <div className="space-y-4">
                <Label className="font-bold">Do you need inspection, photos, or documents before quoting?</Label>
                <RadioGroup value={data.needsInspection} onValueChange={(v) => onChange('needsInspection', v)} className="flex flex-wrap gap-6">
                  {["Yes", "No", "Sometimes", "Unsure"].map(opt => (
                    <div key={opt} className="flex items-center space-x-2"><RadioGroupItem value={opt} id={`insp-${opt}`} /><Label htmlFor={`insp-${opt}`}>{opt}</Label></div>
                  ))}
                </RadioGroup>
              </div>
              {(data.needsInspection === 'Yes' || data.needsInspection === 'Sometimes') && (
                <div className="pt-2 animate-in slide-in-from-top-2">
                  <Label className="font-bold">What must be collected before a quote can be prepared? *</Label>
                  <Input value={data.inspectionRequirementDetails || ''} onChange={(e) => onChange('inspectionRequirementDetails', e.target.value)} className="h-12 rounded-xl" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><Scale className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold text-slate-900">Quote Content Rules</h3>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="font-bold">What should normally be INCLUDED? *</Label><Textarea value={data.quoteInclusions || ''} onChange={(e) => onChange('quoteInclusions', e.target.value)} className="min-h-[80px] rounded-2xl" /></div>
                <div className="space-y-2"><Label className="font-bold">What should normally be EXCLUDED? *</Label><Textarea value={data.quoteExclusions || ''} onChange={(e) => onChange('quoteExclusions', e.target.value)} className="min-h-[80px] rounded-2xl" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="font-bold">Standard Assumptions</Label><Textarea value={data.quoteAssumptions || ''} onChange={(e) => onChange('quoteAssumptions', e.target.value)} className="min-h-[80px] rounded-2xl" /></div>
                <div className="space-y-2"><Label className="font-bold">Terms & Conditions</Label><Textarea value={data.quoteTerms || ''} onChange={(e) => onChange('quoteTerms', e.target.value)} className="min-h-[80px] rounded-2xl" /></div>
              </div>
              <div className="space-y-2"><Label className="font-bold">Quote Validity Period (e.g. 30 days)</Label><Input value={data.quoteValidity || ''} onChange={(e) => onChange('quoteValidity', e.target.value)} className="h-12 rounded-xl" /></div>
              <div className="space-y-4 pt-2">
                <Label className="font-bold">Are deposits required?</Label>
                <RadioGroup value={data.depositsRequired} onValueChange={(v) => onChange('depositsRequired', v)} className="flex flex-wrap gap-6">
                  {["Yes", "No", "Sometimes", "Unsure"].map(opt => (
                    <div key={opt} className="flex items-center space-x-2"><RadioGroupItem value={opt} id={`dep-${opt}`} /><Label htmlFor={`dep-${opt}`}>{opt}</Label></div>
                  ))}
                </RadioGroup>
              </div>
              {(data.depositsRequired === 'Yes' || data.depositsRequired === 'Sometimes') && (
                <div className="pt-2 animate-in slide-in-from-top-2">
                  <Label className="font-bold">Please explain deposit requirements *</Label>
                  <Input value={data.depositDetails || ''} onChange={(e) => onChange('depositDetails', e.target.value)} className="h-12 rounded-xl" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><ShieldCheck className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold text-slate-900">Quote Approval Rules</h3>
            </div>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-2"><Label className="font-bold">Who approves quotes? *</Label><Input value={data.quoteApprover || ''} onChange={(e) => onChange('quoteApprover', e.target.value)} className="h-12 rounded-xl" /></div>
              
              <div className="space-y-4">
                <Label className="font-bold">Can Bid Manager prepare draft quotes? *</Label>
                <RadioGroup value={data.draftQuoteAuthority} onValueChange={(v) => onChange('draftQuoteAuthority', v)} className="flex flex-col gap-3">
                  {["Yes", "No", "Yes, but approval required"].map(opt => (
                    <div key={opt} className="flex items-center space-x-2 p-3 rounded-xl border hover:bg-slate-50 transition-colors">
                      <RadioGroupItem value={opt} id={`draft-${opt}`} />
                      <Label htmlFor={`draft-${opt}`} className="cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-4 p-6 bg-amber-50 rounded-2xl border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-4 w-full">
                    <div>
                      <Label className="font-bold text-amber-900">Can Bid Manager send quotes without approval under a threshold?</Label>
                      <p className="text-xs text-amber-700 mt-1">Exercise caution when granting submission authority.</p>
                    </div>
                    <RadioGroup value={data.sendUnderThreshold} onValueChange={(v) => onChange('sendUnderThreshold', v)} className="flex gap-6">
                      {["Yes", "No", "Maybe, to be discussed"].map(opt => (
                        <div key={opt} className="flex items-center space-x-2"><RadioGroupItem value={opt} id={`thresh-${opt}`} /><Label htmlFor={`thresh-${opt}`}>{opt}</Label></div>
                      ))}
                    </RadioGroup>
                    {(data.sendUnderThreshold === 'Yes' || data.sendUnderThreshold === 'Maybe, to be discussed') && (
                      <div className="pt-2 animate-in slide-in-from-top-2">
                        <Label className="font-bold text-amber-900">What is the maximum quote value or rule? *</Label>
                        <Input value={data.thresholdRule || ''} onChange={(e) => onChange('thresholdRule', e.target.value)} placeholder="e.g. $500 max for repeat clients" className="h-12 rounded-xl bg-white border-amber-300" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2"><Label className="font-bold">Are there any quote types we must NEVER send without approval?</Label><Textarea value={data.neverSendWithoutApproval || ''} onChange={(e) => onChange('neverSendWithoutApproval', e.target.value)} className="min-h-[80px] rounded-2xl" /></div>
              <div className="space-y-2"><Label className="font-bold">Are there any prices, discounts, or claims we should avoid?</Label><Textarea value={data.avoidClaims || ''} onChange={(e) => onChange('avoidClaims', e.target.value)} className="min-h-[80px] rounded-2xl" /></div>
            </CardContent>
          </Card>
        </div>
      );
    }
    default:
      return <div className="py-24 text-center">Section under development.</div>;
  }
}
