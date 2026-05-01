
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
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
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

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
  const [formData, setFormData] = useState<any>({});

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
    if (submission?.sections?.[stepId as string]) {
      setFormData(submission.sections[stepId as string]);
    } else {
      setFormData({});
    }
  }, [submission, stepId]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (next: boolean = false) => {
    if (!submissionId || !db) return;
    setSaving(true);
    try {
      const isLastStep = currentStepIndex === STEPS.length - 1;
      const nextStep = next && !isLastStep ? STEPS[currentStepIndex + 1].id : stepId;
      
      const updateData: any = {
        updatedAt: serverTimestamp(),
        lastSavedAt: serverTimestamp(),
      };

      // Only save form data if there are changes to avoid bloat
      if (Object.keys(formData).length > 0) {
        updateData[`sections.${stepId}`] = formData;
      }

      if (next) {
        updateData.currentStep = nextStep;
        if (!submission?.completedSteps?.includes(stepId as string)) {
          // Use a set-like approach for unique steps
          const currentCompleted = submission?.completedSteps || [];
          if (!currentCompleted.includes(stepId as string)) {
            updateData.completedSteps = [...currentCompleted, stepId as string];
          }
        }
      }

      await updateDoc(doc(db, 'onboardingSubmissions', submissionId), updateData);
      
      if (next) {
        if (!isLastStep) {
          router.push(`/onboarding/${nextStep}`);
        } else {
          // Final submission handling
          await updateDoc(doc(db, 'onboardingSubmissions', submissionId), {
            status: 'submitted',
            submittedAt: serverTimestamp()
          });
          toast({ title: "Onboarding Complete", description: "All steps have been submitted successfully." });
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
          {STEPS.map((step, idx) => {
            const isCompleted = submission?.completedSteps?.includes(step.id);
            const isCurrent = step.id === stepId;
            return (
              <div 
                key={step.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-default ${
                  isCurrent 
                  ? 'bg-primary/10 text-primary font-bold shadow-sm' 
                  : isCompleted 
                  ? 'text-green-600' 
                  : 'text-muted-foreground'
                }`}
              >
                <div className={`shrink-0 ${isCompleted ? 'text-green-600' : ''}`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                </div>
                <span className="text-xs truncate">{step.title}</span>
              </div>
            );
          })}
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
              {currentStepIndex === STEPS.length - 1 ? 'Finish Onboarding' : 'Next Step'} <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="max-w-4xl mx-auto p-8 lg:p-12">
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-8 lg:p-12 space-y-8">
                <StepContent 
                  stepId={stepId as string} 
                  data={formData} 
                  onChange={handleFieldChange} 
                />
              </CardContent>
            </Card>
            
            <div className="mt-8 flex justify-between items-center text-xs text-muted-foreground px-4">
              <p>Your progress is autosaved.</p>
              {submission?.lastSavedAt && (
                <p>Last saved at: {new Date(submission.lastSavedAt.seconds * 1000).toLocaleTimeString()}</p>
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
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-headline font-bold">Welcome to Your Bid Manager Onboarding</h2>
            <p className="text-muted-foreground text-lg">
              This onboarding process helps us collect the information we need to understand your business, prepare proposal-ready content, assess your opportunity readiness, and support you across tenders, grants, supplier registrations, marketplace leads, quote requests, and direct proposals.
            </p>
          </div>
          
          <div className="grid gap-6">
            <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
              <h3 className="font-bold flex items-center gap-2"><Zap className="w-5 h-5 text-primary" /> What to Expect</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                {[
                  "This process usually takes approximately 45–75 minutes.",
                  "You can save your progress and return later.",
                  "You will be asked for business details, service information, team and capacity details, pricing rules, compliance information, opportunity preferences, and approval instructions.",
                  "You can upload supporting documents where relevant.",
                  "Please do not provide passwords, login credentials, or MFA codes through this portal."
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">Before You Continue</h4>
                <p className="text-sm text-muted-foreground">Please confirm the acknowledgements below before moving to the next step.</p>
              </div>
              
              <div className="space-y-4">
                {[
                  { id: 'ackTerms', label: 'I confirm I have read, or have had the opportunity to read, the Bid Manager Terms and Conditions.' },
                  { id: 'ackAuthority', label: 'I confirm I am authorised to complete this onboarding process on behalf of the business.' },
                  { id: 'ackInfoUsage', label: 'I understand that Bid Manager may use the information I provide to prepare client profiles, proposal content, opportunity recommendations, marketplace profiles, tender responses, grant applications, supplier registrations, quote responses, and business development materials, subject to agreed approvals and engagement terms.' },
                  { id: 'ackApprovals', label: 'I understand that final content, pricing, submissions, communications, and commitments may require approval depending on the authority and approval settings I provide later in this onboarding process.' },
                  { id: 'ackNoPasswords', label: 'I understand that I must not provide passwords, login credentials, or multi-factor authentication codes through this onboarding portal.' },
                  { id: 'ackSaveReturn', label: 'I understand I can save my progress and return later to continue from where I left off.' },
                  { id: 'ackQuality', label: 'I understand that the quality and completeness of the information I provide will affect the accuracy of the documents, recommendations, profiles, and action plans Bid Manager prepares.' }
                ].map((ack) => (
                  <div key={ack.id} className="flex items-start space-x-3 space-y-0">
                    <Checkbox 
                      id={ack.id} 
                      checked={data[ack.id] || false} 
                      onCheckedChange={(checked) => onChange(ack.id, checked)} 
                    />
                    <Label htmlFor={ack.id} className="text-sm leading-relaxed cursor-pointer font-normal">
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
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-headline font-bold">Business Snapshot & Contact Details</h2>
            <p className="text-muted-foreground text-lg">Tell us about your organization's identity and key personnel.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="regName">Registered Business Name</Label>
              <Input 
                id="regName" 
                value={data.registeredName || ''} 
                onChange={(e) => onChange('registeredName', e.target.value)}
                placeholder="e.g. Acme Pty Ltd" 
                className="h-12 rounded-xl" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tradingName">Trading Name (if different)</Label>
              <Input 
                id="tradingName" 
                value={data.tradingName || ''} 
                onChange={(e) => onChange('tradingName', e.target.value)}
                placeholder="e.g. Acme Solutions" 
                className="h-12 rounded-xl" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="abn">ABN</Label>
              <Input 
                id="abn" 
                value={data.abn || ''} 
                onChange={(e) => onChange('abn', e.target.value)}
                placeholder="00 000 000 000" 
                className="h-12 rounded-xl" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acn">ACN (if applicable)</Label>
              <Input 
                id="acn" 
                value={data.acn || ''} 
                onChange={(e) => onChange('acn', e.target.value)}
                placeholder="000 000 000" 
                className="h-12 rounded-xl" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="structure">Business Structure</Label>
              <Input 
                id="structure" 
                value={data.structure || ''} 
                onChange={(e) => onChange('structure', e.target.value)}
                placeholder="e.g. Company, Trust, Partnership" 
                className="h-12 rounded-xl" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearStarted">Year Started</Label>
              <Input 
                id="yearStarted" 
                value={data.yearStarted || ''} 
                onChange={(e) => onChange('yearStarted', e.target.value)}
                placeholder="YYYY" 
                className="h-12 rounded-xl" 
              />
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <h3 className="font-bold text-lg">Key Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="primaryContact">Primary Contact Full Name</Label>
                <Input 
                  id="primaryContact" 
                  value={data.primaryContactName || ''} 
                  onChange={(e) => onChange('primaryContactName', e.target.value)}
                  placeholder="Jane Smith" 
                  className="h-12 rounded-xl" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryRole">Primary Contact Role</Label>
                <Input 
                  id="primaryRole" 
                  value={data.primaryContactRole || ''} 
                  onChange={(e) => onChange('primaryContactRole', e.target.value)}
                  placeholder="e.g. Managing Director" 
                  className="h-12 rounded-xl" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryEmail">Primary Contact Email</Label>
                <Input 
                  id="primaryEmail" 
                  value={data.primaryContactEmail || ''} 
                  onChange={(e) => onChange('primaryContactEmail', e.target.value)}
                  type="email"
                  placeholder="jane@company.com" 
                  className="h-12 rounded-xl" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryPhone">Primary Contact Phone</Label>
                <Input 
                  id="primaryPhone" 
                  value={data.primaryContactPhone || ''} 
                  onChange={(e) => onChange('primaryContactPhone', e.target.value)}
                  placeholder="+61 400 000 000" 
                  className="h-12 rounded-xl" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <Input 
              id="website" 
              value={data.website || ''} 
              onChange={(e) => onChange('website', e.target.value)}
              placeholder="https://www.company.com" 
              className="h-12 rounded-xl" 
            />
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
