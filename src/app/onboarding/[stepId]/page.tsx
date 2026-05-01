
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  LogOut, 
  LayoutDashboard,
  CheckCircle2,
  Circle,
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
  Loader2
} from 'lucide-react';
import Link from 'next/link';
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
  const [saving, setSaving] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // Find current step index
  const currentStepIndex = STEPS.findIndex(s => s.id === stepId);
  const currentStep = STEPS[currentStepIndex];

  // Fetch or create onboarding submission
  const submissionsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, 'onboardingSubmissions'), where('userId', '==', user.uid));
  }, [user, db]);

  const { data: submissions, isLoading: loadingSubmissions } = useDoc(
    submissionId ? doc(db, 'onboardingSubmissions', submissionId) : null
  );

  // Effect to handle submission lookup/creation
  useEffect(() => {
    async function initSubmission() {
      if (!user || !db || submissionId) return;

      const q = query(collection(db, 'onboardingSubmissions'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setSubmissionId(querySnapshot.docs[0].id);
      } else {
        // Create new submission
        const newDoc = await addDoc(collection(db, 'onboardingSubmissions'), {
          userId: user.uid,
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

  const submission = submissions; // for clarity

  const handleSave = async (next: boolean = false) => {
    if (!submissionId || !db) return;
    setSaving(true);
    try {
      const nextStep = next && currentStepIndex < STEPS.length - 1 ? STEPS[currentStepIndex + 1].id : stepId;
      
      const updateData: any = {
        updatedAt: serverTimestamp(),
        lastSavedAt: serverTimestamp(),
      };

      if (next) {
        updateData.currentStep = nextStep;
        // Logic for completedSteps would go here
      }

      await updateDoc(doc(db, 'onboardingSubmissions', submissionId), updateData);
      
      if (next) {
        if (currentStepIndex < STEPS.length - 1) {
          router.push(`/onboarding/${nextStep}`);
        } else {
          router.push('/dashboard');
        }
      } else {
        toast({ title: "Progress Saved", description: "Your changes have been saved." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Save Failed", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loadingSubmissions || !currentStep) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-body">
      {/* Step Sidebar */}
      <aside className="w-80 bg-white border-r hidden xl:flex flex-col shrink-0">
        <div className="p-6 border-b">
          <Logo />
          <div className="mt-6 space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Progress</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">{Math.round(((currentStepIndex + 1) / STEPS.length) * 100)}% Complete</span>
              <span className="text-xs text-muted-foreground">{currentStepIndex + 1} of {STEPS.length}</span>
            </div>
            <Progress value={((currentStepIndex + 1) / STEPS.length) * 100} className="h-1.5" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {STEPS.map((step, idx) => (
            <div 
              key={step.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-default ${
                step.id === stepId 
                ? 'bg-primary/10 text-primary font-bold shadow-sm' 
                : idx < currentStepIndex 
                ? 'text-green-600' 
                : 'text-muted-foreground'
              }`}
            >
              <div className={`shrink-0 ${idx < currentStepIndex ? 'text-green-600' : ''}`}>
                {idx < currentStepIndex ? <CheckCircle2 className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
              </div>
              <span className="text-xs truncate">{step.title}</span>
            </div>
          ))}
        </div>
        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-muted-foreground rounded-xl"
            onClick={() => router.push('/dashboard')}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-sm font-medium">Exit to Dashboard</span>
          </Button>
        </div>
      </aside>

      {/* Wizard Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 rounded-lg">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            <div className="h-4 w-px bg-slate-200" />
            <h1 className="text-sm font-bold text-slate-900">{currentStep.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => handleSave(false)} disabled={saving} className="gap-2 rounded-lg">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Save Draft
            </Button>
            <Button size="sm" onClick={() => handleSave(true)} disabled={saving} className="gap-2 rounded-lg">
              Next Step <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="max-w-4xl mx-auto p-8 lg:p-12">
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-8 lg:p-12 space-y-8">
                <StepContent stepId={stepId as string} />
              </CardContent>
            </Card>
            
            <div className="mt-8 flex justify-between items-center text-xs text-muted-foreground px-4">
              <p>Your progress is autosaved.</p>
              <p>Need help? Contact support@bidmanager.com</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StepContent({ stepId }: { stepId: string }) {
  // This component will render the specific fields for each step
  switch (stepId) {
    case 'welcome':
      return (
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-headline font-bold">Welcome to Onboarding</h2>
            <p className="text-muted-foreground text-lg">We've designed this process to be as thorough as possible to ensure your bid success.</p>
          </div>
          
          <div className="grid gap-6">
            <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
              <h3 className="font-bold flex items-center gap-2"><Zap className="w-5 h-5 text-primary" /> What to Expect</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  Approximately 45 minutes to complete.
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  You can save and return at any time.
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  You'll need business registration info and core certificates.
                </li>
              </ul>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-3 space-y-0">
                <Checkbox id="terms" />
                <Label htmlFor="terms" className="text-sm leading-relaxed">
                  I acknowledge and accept the Bid Manager Terms and Conditions.
                </Label>
              </div>
              <div className="flex items-start space-x-3 space-y-0">
                <Checkbox id="authority" />
                <Label htmlFor="authority" className="text-sm leading-relaxed">
                  I confirm I have the authority to complete this onboarding on behalf of the business.
                </Label>
              </div>
              <div className="flex items-start space-x-3 space-y-0">
                <Checkbox id="passwords" />
                <Label htmlFor="passwords" className="text-sm leading-relaxed">
                  I understand that I should never provide passwords to internal systems or platforms through this form.
                </Label>
              </div>
            </div>
          </div>
        </div>
      );

    case 'snapshot':
      return (
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-headline font-bold">Business Snapshot</h2>
            <p className="text-muted-foreground text-lg">Tell us about your organization's identity and structure.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="regName">Registered Business Name</Label>
              <Input id="regName" placeholder="e.g. Acme Pty Ltd" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tradingName">Trading Name (if different)</Label>
              <Input id="tradingName" placeholder="e.g. Acme Solutions" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="abn">ABN</Label>
              <Input id="abn" placeholder="00 000 000 000" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acn">ACN (if applicable)</Label>
              <Input id="acn" placeholder="000 000 000" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="structure">Business Structure</Label>
              <Input id="structure" placeholder="e.g. Company, Trust, Partnership" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearStarted">Year Started</Label>
              <Input id="yearStarted" placeholder="YYYY" className="h-12 rounded-xl" />
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <h3 className="font-bold text-lg">Business Addresses</h3>
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="regAddress">Registered Address</Label>
                <Input id="regAddress" placeholder="Full legal address" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opAddress">Operating Address (if different)</Label>
                <Input id="opAddress" placeholder="Head office or physical location" className="h-12 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="py-20 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold">Questions Coming Soon</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            This section ({stepId}) is currently being updated with specific questionnaire fields. You can save your progress and continue to other steps.
          </p>
        </div>
      );
  }
}
