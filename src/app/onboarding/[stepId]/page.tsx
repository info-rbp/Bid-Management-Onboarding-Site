
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
  User,
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
  Heart
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

    // Save current step data before navigating
    if (submissionId && db) {
      const updateData: any = {
        updatedAt: serverTimestamp(),
        lastSavedAt: serverTimestamp(),
      };
      updateData[`sections.${stepId}`] = formData;
      
      // If we are on selection step, sync enabledModules to root
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
      const brand = data.brandPositioning || {};
      const points = valProp.topThreePoints || [];

      if (!overview.plainEnglishDescription) return "Business description is required.";
      if (!overview.problemSolved) return "Problem solved is required.";
      if (!valProp.clientOutcomes) return "Client outcomes are required.";
      if (!valProp.differentiators) return "Differentiators are required.";
      if (!valProp.clientsChooseUsBecause) return "The 'Clients choose us because...' field is required.";
      if (points.length < 3 || points.some((p: string) => !p)) return "All three key points are required.";
      if (!brand.tonePreference) return "Tone preference is required.";
    }

    return null;
  };

  const handleSave = (next: boolean = false) => {
    if (!submissionId || !db) return;
    
    const isLastStep = currentStepIndex === STEPS.length - 1;
    const nextStepId = next && !isLastStep ? STEPS[currentStepIndex + 1].id : stepId;
    
    // Validation for next
    if (next) {
      const error = validateStep(stepId as string, formData);
      if (error) {
        toast({
          variant: "destructive",
          title: "Incomplete Section",
          description: error
        });
        return;
      }
    }

    const updateData: any = {
      updatedAt: serverTimestamp(),
      lastSavedAt: serverTimestamp(),
    };

    updateData[`sections.${stepId}`] = formData;
    
    // Sync module visibility
    if (stepId === 'selection') {
      updateData.enabledModules = formData.enabledModules || {};
    }

    if (next) {
      updateData.currentStep = nextStepId;
      const currentCompleted = submission?.completedSteps || [];
      if (!currentCompleted.includes(stepId as string)) {
        updateData.completedSteps = [...currentCompleted, stepId as string];
      }
      
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
        description: "Your progress for this section has been saved." 
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

  // Filter sidebar steps based on enabled modules
  const visibleSteps = STEPS.filter(s => {
    if (!s.conditional) return true;
    const enabled = submission?.enabledModules?.[s.conditional];
    const unsureSelected = submission?.sections?.selection?.selectedServices?.includes('Unsure, please recommend');
    return enabled || unsureSelected;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-body">
      {/* Wizard Sidebar */}
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
                <p>Progress is synced with your account.</p>
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
                  <div 
                    key={ack.id} 
                    className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => onChange(ack.id, !data[ack.id])}
                  >
                    <Checkbox 
                      id={ack.id} 
                      checked={data[ack.id] || false} 
                      onCheckedChange={() => {}} 
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
      const bizDetails = data.businessDetails || {};
      const contactSetup = data.contactSetup || { numberOfContacts: 2, contacts: [] };
      const contacts = contactSetup.contacts || [];
      const numContacts = contactSetup.numberOfContacts || 2;

      const handleBizChange = (field: string, val: any) => {
        onChange('businessDetails', { ...bizDetails, [field]: val });
      };

      const handleContactChange = (index: number, field: string, val: any) => {
        const newContacts = [...contacts];
        if (!newContacts[index]) {
          newContacts[index] = { contactNumber: index + 1, responsibilities: [] };
        }
        newContacts[index] = { ...newContacts[index], [field]: val };
        onChange('contactSetup', { ...contactSetup, contacts: newContacts });
      };

      const handleRespToggle = (index: number, resp: string) => {
        const newContacts = [...contacts];
        if (!newContacts[index]) {
          newContacts[index] = { contactNumber: index + 1, responsibilities: [] };
        }
        const currentResps = newContacts[index].responsibilities || [];
        const newResps = currentResps.includes(resp)
          ? currentResps.filter((r: string) => r !== resp)
          : [...currentResps, resp];
        newContacts[index] = { ...newContacts[index], responsibilities: newResps };
        onChange('contactSetup', { ...contactSetup, contacts: newContacts });
      };

      const hasDecisionMaker = contacts.slice(0, numContacts).some(c => c.responsibilities?.includes('Final decision-maker'));
      const hasPricing = contacts.slice(0, numContacts).some(c => c.responsibilities?.includes('Pricing/commercial approval'));
      const hasUrgent = contacts.slice(0, numContacts).some(c => c.responsibilities?.includes('Urgent approvals'));

      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Business Snapshot and Contact Details</h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Provide your official business details and key contact people so we can create your client profile, confirm who can approve decisions, and know who to contact for business, pricing, compliance, documents, and urgent matters.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Business Details</h3>
            </div>
            
            <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Registered Business Name *</Label>
                    <Input 
                      value={bizDetails.registeredBusinessName || ''} 
                      onChange={(e) => handleBizChange('registeredBusinessName', e.target.value)}
                      placeholder="e.g. Acme Industries Pty Ltd" 
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Trading Name (if different)</Label>
                    <Input 
                      value={bizDetails.tradingName || ''} 
                      onChange={(e) => handleBizChange('tradingName', e.target.value)}
                      placeholder="Acme Solutions" 
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">ABN *</Label>
                    <Input 
                      value={bizDetails.abn || ''} 
                      onChange={(e) => handleBizChange('abn', e.target.value)}
                      placeholder="00 000 000 000" 
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">ACN (if applicable)</Label>
                    <Input 
                      value={bizDetails.acn || ''} 
                      onChange={(e) => handleBizChange('acn', e.target.value)}
                      placeholder="000 000 000" 
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Business Structure *</Label>
                    <Select 
                      value={bizDetails.businessStructure || ''} 
                      onValueChange={(val) => handleBizChange('businessStructure', val)}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select structure" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Sole trader", "Company", "Partnership", "Trust", "Not-for-profit", "Incorporated association", "Indigenous business", "Social enterprise", "Other", "Unsure"].map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Year Started Operating</Label>
                    <Input 
                      value={bizDetails.yearStarted || ''} 
                      onChange={(e) => handleBizChange('yearStarted', e.target.value)}
                      placeholder="YYYY" 
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Registered Business Address *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={bizDetails.registeredAddress || ''} 
                        onChange={(e) => handleBizChange('registeredAddress', e.target.value)}
                        placeholder="Street address, Suburb, State, Postcode" 
                        className="pl-10 h-12 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Business Phone Number *</Label>
                    <Input 
                      value={bizDetails.businessPhone || ''} 
                      onChange={(e) => handleBizChange('businessPhone', e.target.value)}
                      placeholder="+61 0 0000 0000" 
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Business Email Address *</Label>
                    <Input 
                      type="email"
                      value={bizDetails.businessEmail || ''} 
                      onChange={(e) => handleBizChange('businessEmail', e.target.value)}
                      placeholder="hello@company.com" 
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Contact Setup</h3>
            </div>

            <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <Label className="text-lg font-bold text-slate-800">How many contacts would you like to add?</Label>
                  <div className="max-w-[240px]">
                    <Select 
                      value={numContacts.toString()} 
                      onValueChange={(val) => onChange('contactSetup', { ...contactSetup, numberOfContacts: parseInt(val) })}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map(n => (
                          <SelectItem key={n} value={n.toString()}>{n} contact{n > 1 ? 's' : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-6">
                  {Array.from({ length: numContacts }).map((_, idx) => {
                    const contact = contacts[idx] || { responsibilities: [] };
                    const label = idx === 0 ? "Primary Contact" : idx === 1 ? "Secondary Contact" : "Additional Contact";
                    
                    return (
                      <div key={idx} className="p-8 border border-slate-100 bg-slate-50/30 rounded-[2rem] space-y-6">
                        <h4 className="font-bold text-slate-900 text-lg">Contact {idx + 1}: <span className="text-primary">{label}</span></h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Full Name *</Label>
                            <Input 
                              value={contact.fullName || ''} 
                              onChange={(e) => handleContactChange(idx, 'fullName', e.target.value)}
                              placeholder="e.g. John Smith" 
                              className="h-12 rounded-xl bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Role / Title</Label>
                            <Input 
                              value={contact.roleTitle || ''} 
                              onChange={(e) => handleContactChange(idx, 'roleTitle', e.target.value)}
                              placeholder="e.g. Commercial Manager" 
                              className="h-12 rounded-xl bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Email Address *</Label>
                            <Input 
                              type="email"
                              value={contact.email || ''} 
                              onChange={(e) => handleContactChange(idx, 'email', e.target.value)}
                              placeholder="john@company.com" 
                              className="h-12 rounded-xl bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Phone Number *</Label>
                            <Input 
                              value={contact.phone || ''} 
                              onChange={(e) => handleContactChange(idx, 'phone', e.target.value)}
                              placeholder="+61 400 000 000" 
                              className="h-12 rounded-xl bg-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-4 pt-2">
                          <Label className="font-bold text-slate-900 block pb-2">Responsibilities / Permissions *</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {[
                              "Primary contact", "Secondary contact", "Final decision-maker", 
                              "Pricing/commercial approval", "Compliance documents", 
                              "Insurance documents", "Licences/certifications", 
                              "Document collection", "Platform access coordination", 
                              "Urgent approvals", "Technical questions", 
                              "General backup contact", "Other"
                            ].map((resp) => {
                              const isRestricted = idx === 0 && resp === "Primary contact";
                              const checked = contact.responsibilities?.includes(resp) || (idx === 0 && resp === "Primary contact");
                              
                              return (
                                <div 
                                  key={resp} 
                                  className={`flex items-center space-x-2 p-3 rounded-xl border transition-all cursor-pointer ${checked ? 'border-primary/30 bg-primary/5 shadow-sm' : 'border-slate-100 hover:bg-slate-50'}`}
                                  onClick={() => !isRestricted && handleRespToggle(idx, resp)}
                                >
                                  <Checkbox id={`resp-${idx}-${resp}`} checked={checked} disabled={isRestricted} onCheckedChange={() => {}} />
                                  <Label htmlFor={`resp-${idx}-${resp}`} className="text-xs font-medium cursor-pointer">{resp}</Label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4 pt-4">
                  {!hasDecisionMaker && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Nomination Required</AlertTitle><AlertDescription>Please nominate at least one final decision-maker.</AlertDescription></Alert>}
                  {!hasPricing && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Nomination Required</AlertTitle><AlertDescription>Please nominate who can approve pricing and commercial decisions.</AlertDescription></Alert>}
                  {!hasUrgent && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Nomination Required</AlertTitle><AlertDescription>Please nominate who we should contact for urgent approvals.</AlertDescription></Alert>}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Additional Contact Notes</h3>
            </div>
            <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <CardContent className="p-8">
                <Textarea 
                  value={data.additionalContactNotes || ''} 
                  onChange={(e) => onChange('additionalContactNotes', e.target.value)}
                  placeholder="For example, preferred contact times, people who should only be contacted for specific matters..."
                  className="min-h-[120px] rounded-2xl"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      );

    case 'triage':
      const hasOpp = data.hasLiveOpportunity;
      const details = data.opportunityDetails || { supportRequired: [] };
      
      const handleDetailsChange = (field: string, val: any) => {
        onChange('opportunityDetails', { ...details, [field]: val });
      };

      const handleSupportToggle = (opt: string) => {
        const current = details.supportRequired || [];
        const next = current.includes(opt) ? current.filter((i: string) => i !== opt) : [...current, opt];
        handleDetailsChange('supportRequired', next);
      };

      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Immediate Need and Live Opportunity Triage</h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Tell us whether you currently have a tender, grant, or other opportunity that needs urgent review.
            </p>
          </div>

          <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <Label className="text-lg font-bold text-slate-800">Do you currently have a live opportunity? *</Label>
                <RadioGroup value={hasOpp} onValueChange={(val) => onChange('hasLiveOpportunity', val)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Yes', 'No', 'Unsure'].map((opt) => (
                    <div key={opt} className="relative">
                      <RadioGroupItem value={opt} id={`status-${opt}`} className="peer sr-only" />
                      <Label htmlFor={`status-${opt}`} className="flex items-center justify-center h-14 border-2 rounded-2xl cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-slate-50 transition-all font-bold">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {hasOpp === 'No' && <Alert className="bg-green-50 text-green-700 border-green-100"><CheckCircle2 className="h-4 w-4" /><AlertDescription>No live opportunity recorded. You can continue.</AlertDescription></Alert>}
              {hasOpp === 'Unsure' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <Label className="font-bold text-slate-700">Briefly explain what you are unsure about *</Label>
                  <Textarea value={data.unsureExplanation || ''} onChange={(e) => onChange('unsureExplanation', e.target.value)} className="min-h-[100px] rounded-2xl" />
                </div>
              )}
            </CardContent>
          </Card>

          {hasOpp === 'Yes' && (
            <Card className="border border-amber-200 bg-amber-50/5 rounded-3xl overflow-hidden shadow-sm">
              <CardContent className="p-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="font-bold text-slate-700">Opportunity Type *</Label>
                    <Select value={details.opportunityType || ''} onValueChange={(val) => handleDetailsChange('opportunityType', val)}>
                      <SelectTrigger className="h-12 rounded-xl bg-white"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {["Government tender", "Private tender", "Grant", "Panel or supplier registration", "Marketplace lead", "Direct proposal", "Quote request", "Other"].map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="font-bold text-slate-700">Opportunity Name *</Label>
                    <Input value={details.opportunityTitle || ''} onChange={(e) => handleDetailsChange('opportunityTitle', e.target.value)} className="h-12 rounded-xl bg-white" />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-bold text-slate-700">Deadline *</Label>
                    <Input type="date" value={details.deadlineDate || ''} onChange={(e) => handleDetailsChange('deadlineDate', e.target.value)} className="h-12 rounded-xl bg-white" />
                  </div>
                </div>

                <div className="space-y-6">
                  <Label className="font-bold text-slate-800 text-lg">What support do you need? *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {["Review only", "Draft response", "Prepare pricing", "Submit on our behalf", "Unsure"].map((opt) => (
                      <div key={opt} className={`flex items-center space-x-2 p-4 rounded-xl border cursor-pointer ${details.supportRequired?.includes(opt) ? 'border-primary bg-primary/5' : 'bg-white'}`} onClick={() => handleSupportToggle(opt)}>
                        <Checkbox id={`support-${opt}`} checked={details.supportRequired?.includes(opt)} onCheckedChange={() => {}} />
                        <Label htmlFor={`support-${opt}`} className="text-xs font-medium cursor-pointer">{opt}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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
        if (next.includes('Unsure, please recommend')) {
          modules.tenderSupplier = modules.grants = modules.marketplace = modules.directProposal = modules.quoteRequests = true;
        }
        onChange('selectedServices', next);
        onChange('enabledModules', modules);
      };

      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Service Selection & Engagement Scope</h2>
            <p className="text-slate-500 text-lg leading-relaxed">Select the services you want support with.</p>
          </div>

          <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <CardContent className="p-8 space-y-6">
              <Label className="text-lg font-bold text-slate-800">Which services would you like support with? *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["Government Tenders", "Private Tenders", "Panel or Supplier Registrations", "Grants", "Marketplace Leads", "Direct Proposals", "Quote Requests", "Unsure, please recommend"].map((service) => (
                  <div key={service} className={`flex items-center space-x-3 p-4 rounded-2xl border cursor-pointer ${selectedServices.includes(service) ? 'border-primary bg-primary/5' : 'bg-white'}`} onClick={() => handleServiceToggle(service)}>
                    <Checkbox id={`service-${service}`} checked={selectedServices.includes(service)} onCheckedChange={() => {}} />
                    <Label htmlFor={`service-${service}`} className="text-sm font-medium cursor-pointer">{service}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <CardContent className="p-8 space-y-6">
              <Label className="font-bold text-slate-700">Highest Priority Service *</Label>
              <Select value={data.highestPriorityService || ''} onValueChange={(val) => onChange('highestPriorityService', val)}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select priority" /></SelectTrigger>
                <SelectContent>
                  {["Government Tenders", "Private Tenders", "Grants", "Marketplace Leads", "Direct Proposals", "Quote Requests", "Unsure"].map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label className="font-bold text-slate-700 pt-4 block">Why are these services important now? *</Label>
              <Textarea value={data.reasonForSupport || ''} onChange={(e) => onChange('reasonForSupport', e.target.value)} className="min-h-[120px] rounded-2xl" />

              <Label className="font-bold text-slate-700 pt-4 block text-lg">How involved should Bid Manager be? *</Label>
              <RadioGroup value={data.supportLevel || ''} onValueChange={(val) => onChange('supportLevel', val)} className="space-y-3">
                {["Full end-to-end management", "Opportunity review only", "Drafting only", "Submission support only", "Unsure"].map((lvl) => (
                  <div key={lvl} className="relative">
                    <RadioGroupItem value={lvl} id={`lvl-${lvl}`} className="peer sr-only" />
                    <Label htmlFor={`lvl-${lvl}`} className="flex items-center p-4 border-2 rounded-2xl cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-slate-50 font-medium text-sm">{lvl}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      );

    case 'profile':
      const overview = data.businessOverview || {};
      const valProp = data.valueProposition || {};
      const brand = data.brandPositioning || {};
      const values = data.businessValues || {};
      const points = valProp.topThreePoints || ['', '', ''];

      const handleOverviewChange = (field: string, val: string) => onChange('businessOverview', { ...overview, [field]: val });
      const handleValPropChange = (field: string, val: any) => onChange('valueProposition', { ...valProp, [field]: val });
      const handleBrandChange = (field: string, val: any) => onChange('brandPositioning', { ...brand, [field]: val });
      const handleValuesChange = (field: string, val: string) => onChange('businessValues', { ...values, [field]: val });

      const handleDescriptiveToggle = (word: string) => {
        const current = brand.descriptiveWords || [];
        const next = current.includes(word) ? current.filter((w: string) => w !== word) : [...current, word];
        handleBrandChange('descriptiveWords', next);
      };

      const handlePointChange = (idx: number, val: string) => {
        const nextPoints = [...points];
        nextPoints[idx] = val;
        handleValPropChange('topThreePoints', nextPoints);
      };

      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Business Profile, Positioning & Value Proposition</h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Help us understand who your business is, what you do, and how we should position you in proposal responses.
            </p>
          </div>

          <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><Building2 className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold text-slate-900">Business Overview</h3>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">In plain English, what does your business do? *</Label>
                <Textarea value={overview.plainEnglishDescription || ''} onChange={(e) => handleOverviewChange('plainEnglishDescription', e.target.value)} placeholder="e.g. We provide civil engineering and road maintenance services..." className="min-h-[100px] rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Why was the business started?</Label>
                <Textarea value={overview.whyStarted || ''} onChange={(e) => handleOverviewChange('whyStarted', e.target.value)} className="min-h-[100px] rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">What problem does your business solve for clients? *</Label>
                <Textarea value={overview.problemSolved || ''} onChange={(e) => handleOverviewChange('problemSolved', e.target.value)} className="min-h-[100px] rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Who do you mainly help?</Label>
                <Textarea value={overview.mainClients || ''} onChange={(e) => handleOverviewChange('mainClients', e.target.value)} className="min-h-[100px] rounded-2xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><Sparkles className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold text-slate-900">Value Proposition</h3>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">What outcomes or results do clients receive? *</Label>
                <Textarea value={valProp.clientOutcomes || ''} onChange={(e) => handleValPropChange('clientOutcomes', e.target.value)} className="min-h-[100px] rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">What makes your business different from competitors? *</Label>
                <Textarea value={valProp.differentiators || ''} onChange={(e) => handleValPropChange('differentiators', e.target.value)} className="min-h-[100px] rounded-2xl" />
              </div>
              <div className="space-y-4">
                <Label className="font-bold text-slate-700">Complete this sentence: “Clients choose us because...” *</Label>
                <div className="flex gap-4 items-start">
                  <Quote className="w-8 h-8 text-primary/20 shrink-0" />
                  <Textarea value={valProp.clientsChooseUsBecause || ''} onChange={(e) => handleValPropChange('clientsChooseUsBecause', e.target.value)} className="min-h-[80px] rounded-2xl" />
                </div>
              </div>
              <div className="space-y-4 pt-4">
                <Label className="font-bold text-slate-700">Top three things clients should remember about you *</Label>
                <div className="space-y-3">
                  {points.map((p: string, i: number) => (
                    <div key={i} className="flex gap-4 items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500 shrink-0">{i + 1}</div>
                      <Input value={p} onChange={(e) => handlePointChange(i, e.target.value)} placeholder={`Key point ${i + 1}`} className="h-12 rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><TargetIcon className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold text-slate-900">Brand and Positioning</h3>
            </div>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <Label className="font-bold text-slate-700">Which words best describe your business?</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {["Reliable", "Professional", "Fast", "Responsive", "Experienced", "Specialist", "Local", "Affordable", "Premium", "Innovative", "Practical", "Safety-focused", "Other"].map(word => (
                    <div key={word} className={`flex items-center space-x-2 p-3 rounded-xl border cursor-pointer ${brand.descriptiveWords?.includes(word) ? 'border-primary bg-primary/5' : 'bg-white'}`} onClick={() => handleDescriptiveToggle(word)}>
                      <Checkbox id={`word-${word}`} checked={brand.descriptiveWords?.includes(word)} onCheckedChange={() => {}} />
                      <Label htmlFor={`word-${word}`} className="text-xs font-medium cursor-pointer">{word}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <Label className="font-bold text-slate-700">What tone should we use in your proposals? *</Label>
                <RadioGroup value={brand.tonePreference || ''} onValueChange={(val) => handleBrandChange('tonePreference', val)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {["Formal and professional", "Clear and practical", "Warm and approachable", "Confident and persuasive", "Technical and detailed", "Simple and plain English", "Unsure, please recommend"].map(tone => (
                    <div key={tone} className="relative">
                      <RadioGroupItem value={tone} id={`tone-${tone}`} className="peer sr-only" />
                      <Label htmlFor={`tone-${tone}`} className="flex items-center p-4 border-2 rounded-2xl cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-slate-50 text-sm font-medium">{tone}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><Heart className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold text-slate-900">Business Values</h3>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">What are your business values or principles?</Label>
                <Textarea value={values.values || ''} onChange={(e) => handleValuesChange('values', e.target.value)} className="min-h-[100px] rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">What do clients usually say about working with you?</Label>
                <Textarea value={values.clientFeedbackThemes || ''} onChange={(e) => handleValuesChange('clientFeedbackThemes', e.target.value)} className="min-h-[100px] rounded-2xl" />
              </div>
            </CardContent>
          </Card>
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
