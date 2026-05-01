
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
  HelpCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

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
  { id: 'readiness', title: '13. Tender Readiness', icon: FileBadge },
  { id: 'grants', title: '14. Grants', icon: Gift },
  { id: 'marketplace', title: '15. Marketplace Strategy', icon: BarChart3 },
  { id: 'outreach', title: '16. Outreach Strategy', icon: Send },
  { id: 'quote', title: '17. Quote Support', icon: MessageSquare },
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
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setSubmissionId(newDoc.id);
      }
    }
    initSubmission();
  }, [user, db, stepId, submissionId]);

  useEffect(() => {
    // Only sync from server when stepId changes or when the submission first loads for this step
    // This prevents local user input from being overwritten by delayed server snapshots
    const sid = stepId as string;
    if (submission && !initialSyncDone.current[sid]) {
      if (submission.sections?.[sid]) {
        setFormData(submission.sections[sid]);
      } else {
        setFormData({});
      }
      initialSyncDone.current[sid] = true;
    }
  }, [submission, stepId]);

  // Reset sync tracking when step changes to ensure fresh data for the new step
  useEffect(() => {
    const sid = stepId as string;
    if (!initialSyncDone.current[sid] && submission?.sections?.[sid]) {
      setFormData(submission.sections[sid]);
      initialSyncDone.current[sid] = true;
    } else if (!initialSyncDone.current[sid]) {
      setFormData({});
    }
  }, [stepId]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = (next: boolean = false) => {
    if (!submissionId || !db) return;
    
    const isLastStep = currentStepIndex === STEPS.length - 1;
    const nextStepId = next && !isLastStep ? STEPS[currentStepIndex + 1].id : stepId;
    
    const updateData: any = {
      updatedAt: serverTimestamp(),
      lastSavedAt: serverTimestamp(),
    };

    // Update form data for the current section
    updateData[`sections.${stepId}`] = formData;

    if (next) {
      updateData.currentStep = nextStepId;
      const currentCompleted = submission?.completedSteps || [];
      if (!currentCompleted.includes(stepId as string)) {
        updateData.completedSteps = [...currentCompleted, stepId as string];
      }
      
      const completedCount = updateData.completedSteps?.length || currentCompleted.length;
      updateData.completionPercentage = (completedCount / STEPS.length) * 100;
    }

    // Initiate non-blocking update
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
      } else {
        // Finalize submission
        updateDoc(doc(db, 'onboardingSubmissions', submissionId), {
          status: 'submitted',
          submittedAt: serverTimestamp()
        });
        toast({ 
          title: "Onboarding Complete", 
          description: "All steps have been submitted successfully. Welcome to Bid Manager!" 
        });
        router.push('/dashboard');
      }
    } else {
      toast({ 
        title: "Draft Saved", 
        description: "Your progress for this section has been saved to your profile." 
      });
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
      {/* Wizard Sidebar */}
      <aside className="w-80 bg-white border-r hidden xl:flex flex-col shrink-0">
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
          {STEPS.map((step, idx) => {
            const isCompleted = submission?.completedSteps?.includes(step.id);
            const isCurrent = step.id === stepId;
            return (
              <div 
                key={step.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-default group ${
                  isCurrent 
                  ? 'bg-primary/10 text-primary font-bold shadow-sm' 
                  : isCompleted 
                  ? 'text-green-600 hover:bg-green-50' 
                  : 'text-muted-foreground hover:bg-slate-50'
                }`}
              >
                <div className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-full ${
                  isCurrent ? 'bg-primary text-white' : isCompleted ? 'bg-green-100' : 'bg-slate-100'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <step.icon className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-medium truncate">{step.title}</span>
              </div>
            );
          })}
        </div>
        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground rounded-xl transition-colors"
            onClick={() => router.push('/dashboard')}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-sm font-medium">Return to Dashboard</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 rounded-lg text-muted-foreground">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <currentStep.icon className="w-3.5 h-3.5 text-primary" />
              </span>
              <h1 className="text-sm font-bold text-slate-900">{currentStep.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleSave(false)} 
              className="gap-2 rounded-lg border-2"
            >
              <Save className="w-3 h-3" />
              Save Draft
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleSave(true)} 
              className="gap-2 rounded-lg font-bold px-6 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
            >
              {currentStepIndex === STEPS.length - 1 ? 'Finish Onboarding' : 'Next Step'} <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50/30">
          <div className="max-w-4xl mx-auto p-8 lg:p-12">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-10 lg:p-14">
                <StepContent 
                  stepId={stepId as string} 
                  data={formData} 
                  onChange={handleFieldChange} 
                />
              </CardContent>
            </Card>
            
            <div className="mt-10 flex justify-between items-center text-[11px] font-medium text-slate-400 px-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p>Changes are saved to your account in real-time.</p>
              </div>
              {submission?.lastSavedAt && (
                <p>Last synced: {new Date(submission.lastSavedAt.seconds * 1000).toLocaleTimeString()}</p>
              )}
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
              <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" /> What to Expect
              </h3>
              <ul className="space-y-4 text-sm text-blue-800/80 font-medium">
                {[
                  "This process usually takes approximately 45–75 minutes.",
                  "You can save your progress and return later.",
                  "You will be asked for business details, service information, team and capacity details, pricing rules, compliance information, opportunity preferences, and approval instructions.",
                  "You can upload supporting documents where relevant.",
                  "Please do not provide passwords, login credentials, or MFA codes through this portal."
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 border border-blue-200 text-[10px] font-bold shadow-sm">
                      {i + 1}
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6 pt-4">
              <div className="space-y-1">
                <h4 className="font-bold text-lg text-slate-900">Before You Continue</h4>
                <p className="text-sm text-muted-foreground">Please confirm the acknowledgements below before moving to the next step.</p>
              </div>
              
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
                  <div key={ack.id} className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                    <Checkbox 
                      id={ack.id} 
                      checked={data[ack.id] || false} 
                      onCheckedChange={(checked) => onChange(ack.id, checked)} 
                      className="mt-0.5"
                    />
                    <Label htmlFor={ack.id} className="text-sm leading-snug cursor-pointer font-medium text-slate-700">
                      {ack.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'snapshot':
      return (
        <div className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-3xl font-headline font-bold text-slate-900">Business Snapshot</h2>
            <p className="text-slate-500">Provide the foundational details for your organization's bid profile.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label htmlFor="registeredName" className="font-bold text-slate-700">Registered Business Name</Label>
              <Input 
                id="registeredName" 
                value={data.registeredName || ''} 
                onChange={(e) => onChange('registeredName', e.target.value)}
                placeholder="e.g. Acme Industries Ltd" 
                className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tradingName" className="font-bold text-slate-700">Trading Name (if different)</Label>
              <Input 
                id="tradingName" 
                value={data.tradingName || ''} 
                onChange={(e) => onChange('tradingName', e.target.value)}
                placeholder="Acme Solutions" 
                className="h-12 rounded-xl bg-slate-50 border-slate-200" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="abn" className="font-bold text-slate-700">ABN / Tax ID</Label>
              <Input 
                id="abn" 
                value={data.abn || ''} 
                onChange={(e) => onChange('abn', e.target.value)}
                placeholder="00 000 000 000" 
                className="h-12 rounded-xl bg-slate-50 border-slate-200" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearStarted" className="font-bold text-slate-700">Year of Establishment</Label>
              <Input 
                id="yearStarted" 
                value={data.yearStarted || ''} 
                onChange={(e) => onChange('yearStarted', e.target.value)}
                placeholder="YYYY" 
                className="h-12 rounded-xl bg-slate-50 border-slate-200" 
              />
            </div>
          </div>

          <div className="space-y-6 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-slate-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Primary Contact</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100">
              <div className="space-y-2">
                <Label htmlFor="contactName" className="font-bold text-slate-700">Full Name</Label>
                <Input 
                  id="contactName" 
                  value={data.contactName || ''} 
                  onChange={(e) => onChange('contactName', e.target.value)}
                  placeholder="Jane Doe" 
                  className="h-12 rounded-xl bg-white border-slate-200" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactRole" className="font-bold text-slate-700">Official Role</Label>
                <Input 
                  id="contactRole" 
                  value={data.contactRole || ''} 
                  onChange={(e) => onChange('contactRole', e.target.value)}
                  placeholder="Managing Director" 
                  className="h-12 rounded-xl bg-white border-slate-200" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="font-bold text-slate-700">Email Address</Label>
                <Input 
                  id="contactEmail" 
                  value={data.contactEmail || ''} 
                  onChange={(e) => onChange('contactEmail', e.target.value)}
                  type="email"
                  placeholder="jane@acme.com" 
                  className="h-12 rounded-xl bg-white border-slate-200" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="font-bold text-slate-700">Phone Number</Label>
                <Input 
                  id="contactPhone" 
                  value={data.contactPhone || ''} 
                  onChange={(e) => onChange('contactPhone', e.target.value)}
                  placeholder="+61 400 000 000" 
                  className="h-12 rounded-xl bg-white border-slate-200" 
                />
              </div>
            </div>
          </div>
        </div>
      );

    case 'triage':
      return (
        <div className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-3xl font-headline font-bold text-slate-900">Immediate Need & Live Triage</h2>
            <p className="text-slate-500">Are there any pressing opportunities we should focus on immediately?</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-lg font-bold text-slate-800">Do you have a live bid opportunity that requires immediate attention?</Label>
              <div className="flex gap-4">
                {['Yes', 'No'].map((opt) => (
                  <Button
                    key={opt}
                    variant={data.hasLiveOpportunity === opt ? 'default' : 'outline'}
                    onClick={() => onChange('hasLiveOpportunity', opt)}
                    className="flex-1 h-14 rounded-2xl text-lg font-bold transition-all"
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>

            {data.hasLiveOpportunity === 'Yes' && (
              <div className="space-y-6 p-8 bg-amber-50/30 rounded-[2rem] border border-amber-100/50 animate-in fade-in slide-in-from-top-4">
                <h3 className="font-bold text-amber-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> Opportunity Details
                </h3>
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="oppTitle" className="font-bold text-amber-800/80">Opportunity Title / Tender Reference</Label>
                    <Input 
                      id="oppTitle" 
                      value={data.opportunityTitle || ''} 
                      onChange={(e) => onChange('opportunityTitle', e.target.value)}
                      placeholder="e.g. RFT-2023-001 Facility Management" 
                      className="h-12 rounded-xl border-amber-200 bg-white" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oppDeadline" className="font-bold text-amber-800/80">Submission Deadline</Label>
                    <Input 
                      id="oppDeadline" 
                      type="date"
                      value={data.opportunityDeadline || ''} 
                      onChange={(e) => onChange('opportunityDeadline', e.target.value)}
                      className="h-12 rounded-xl border-amber-200 bg-white" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oppSummary" className="font-bold text-amber-800/80">Quick Summary of Requirements</Label>
                    <Textarea 
                      id="oppSummary" 
                      value={data.opportunitySummary || ''} 
                      onChange={(e) => onChange('opportunitySummary', e.target.value)}
                      placeholder="Briefly describe what is needed..." 
                      className="min-h-[120px] rounded-2xl border-amber-200 bg-white" 
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <Label className="text-lg font-bold text-slate-800">What is your primary goal for the next 90 days?</Label>
              <Textarea 
                value={data.primary90DayGoal || ''} 
                onChange={(e) => onChange('primary90DayGoal', e.target.value)}
                placeholder="e.g. Secure 3 new government contracts, Refresh bid library..." 
                className="min-h-[100px] rounded-2xl bg-slate-50" 
              />
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="py-24 text-center space-y-6">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <FileText className="w-10 h-10 text-slate-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Section Under Development</h2>
            <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
              We're currently preparing the specialized questionnaire for the <span className="text-primary font-bold">"{STEPS.find(s => s.id === stepId)?.title}"</span> section.
            </p>
          </div>
          <Button variant="outline" onClick={() => handleSave(true)} className="rounded-xl border-2 px-8">
            Skip for now <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      );
  }
}
