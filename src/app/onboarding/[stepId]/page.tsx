
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
  Megaphone
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

const RANKING_FACTORS = [
  "Contract value", "Location", "Profitability", "Buyer relationship potential", "Strategic fit",
  "Ease of delivery", "Compliance requirements", "Deadline", "Competition level",
  "Review or testimonial potential", "Cashflow speed", "Risk level"
];

const RANKING_COLUMNS = ["Low priority", "Medium priority", "High priority", "Critical"];

const PLATFORM_OPTIONS = [
  "Airtasker", "Bark", "ServiceSeeking", "Oneflare", "hipages", "Upwork", "Freelancer", "Fiverr", 
  "TenderLink", "AusTender", "GrantConnect", "Local council portals", "State government tender portals", 
  "Corporate supplier portals", "LinkedIn", "Other", "None", "Unsure"
];

const MARKETPLACE_PLATFORMS = [
  "Airtasker", "Bark", "ServiceSeeking", "Oneflare", "hipages", "Upwork", "Freelancer", "Fiverr", "Other service-based marketplaces", "Unsure, please recommend"
];

const COMPLIANCE_ITEMS = [
  "ABN/ACN records", "Public liability insurance", "Professional indemnity insurance", "Workers compensation insurance",
  "Cyber insurance", "Motor vehicle insurance", "Industry licences", "Staff tickets or licences", "Police checks",
  "Working with Children Checks", "NDIS screening checks", "ISO certifications", "WHS policy", "Quality policy",
  "Environmental policy", "Privacy policy", "Risk management process", "Complaints handling process",
  "Business continuity plan", "Modern slavery statement", "Capability statement", "Pricing schedule"
];

const READINESS_COLUMNS = ["Available and current", "Available but needs updating", "Do not have", "Unsure", "Not applicable"];

const BUYER_TYPES = [
  "Local government", "State government", "Federal government", "Universities", "Schools",
  "Hospitals/health services", "Mining/resources", "Construction companies", "Corporate buyers",
  "Not-for-profits", "Small business buyers", "Other"
];

const FUNDING_USES = [
  "Equipment", "Technology", "Staff training", "Expansion", "Community project", 
  "Sustainability", "Innovation", "Export", "Marketing", "Accessibility", "Safety upgrades", "Other"
];

const GRANT_OUTCOMES = [
  "Create jobs", "Improve productivity", "Increase revenue", "Reduce risk", 
  "Improve safety", "Deliver community benefit", "Support regional development", 
  "Improve accessibility", "Improve environmental outcomes", "Other"
];

const OUTREACH_CHANNELS = [
  "Direct proposals", "Email outreach", "LinkedIn outreach", "Referral partner outreach",
  "Local council supplier registration", "Corporate supplier registration", "Subcontractor positioning",
  "Industry association opportunities", "Previous client reactivation", "Capability statement campaign", "Other"
];

const CAMPAIGN_IDEAS = [
  "First Contract Starter Pack", "Local Supplier Introduction Campaign", "Marketplace Review Builder",
  "Case Study Harvest Campaign", "Grant Project Pipeline", "Subcontractor Positioning Pack",
  "Preferred Supplier Registration Sprint", "Dormant Client Reactivation", "Industry Partner Outreach",
  "Capability Statement Campaign", "Please recommend"
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
            opportunityDetails: { supportRequired: [] }
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
        } else if (sid === 'menu') {
          setFormData({
            serviceSetup: { numberOfServices: 3, services: [] },
            promotionRules: {},
            offerMenu: {}
          });
        } else if (sid === 'capacity') {
          setFormData({
            teamSetup: { numberOfMembers: 2, members: [] },
            subcontractors: { usePartners: null, numberOfPartners: 1, partners: [] },
            capacityScaling: { scalingRequirements: [] },
            equipmentSystems: { systemsUsed: [] }
          });
        } else if (sid === 'proof') {
          setFormData({
            caseStudySetup: { numberOfCaseStudies: '1', caseStudies: [] },
            reviewsTestimonials: { hasReviews: '', locations: [], links: '' },
            evidenceGaps: {}
          });
        } else if (sid === 'goals') {
          setFormData({
            businessGoals: { selectedGoals: [] },
            opportunityChannels: { selectedChannels: [] },
            valueRules: { lowerMarginReasons: [] },
            targetAvoidRules: {},
            factorRanking: {}
          });
        } else if (sid === 'commercial') {
          setFormData({
            pricingMethod: { methods: [] },
            commercialRules: { paymentTerms: [] },
            quoteRules: {},
            pricingApproval: {}
          });
        } else if (sid === 'platform') {
          setFormData({
            existingPlatforms: [],
            platformDetails: {},
            setupPlatforms: [],
            setupDetails: {},
            accessSecurity: { credentialManager: '', preferredAccessMethod: '', passwordAcknowledgement: false },
            costsAlerts: { willingToPay: '', monthlyBudget: '', notificationRecipients: '', restrictedPlatforms: '', profileStyleNotes: '' }
          });
        } else if (sid === 'compliance') {
          setFormData({
            readinessChecklist: {},
            insuranceDetails: { numberOfPolicies: '1', policies: [] },
            licenceDetails: { numberOfLicences: '1', licences: [] },
            practicalProcesses: { writtenPolicies: [] },
            complianceIssues: ''
          });
        } else if (sid === 'readiness') {
          setFormData({
            tenderExperience: { submittedTypes: [] },
            targetOpportunities: { targetBuyers: [] },
            readinessCheck: {},
            supplierSetup: {}
          });
        } else if (sid === 'grants') {
          setFormData({
            grantInterest: '',
            projectSetup: { numberOfProjects: '1', projects: [] }
          });
        } else if (sid === 'marketplace') {
          setFormData({
            selectedPlatforms: [],
            platformStrategies: {},
            leadRules: { urgencyHandling: [] },
            authority: {}
          });
        } else if (sid === 'outreach') {
          setFormData({
            directChannels: [],
            targetSetup: { numberOfTargets: '1', targets: [] },
            relationships: {},
            campaigns: { selectedCampaigns: [] }
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
      const hasDecisionMaker = visibleContacts.some((c: any) => c.responsibilities?.includes('Final decision-maker'));
      const hasPricing = visibleContacts.some((c: any) => c.responsibilities?.includes('Pricing/commercial approval'));
      const hasUrgent = visibleContacts.some((c: any) => c.responsibilities?.includes('Urgent approvals'));
      if (missingBiz || missingContact1 || !hasDecisionMaker || !hasPricing || !hasUrgent) {
        return "Please fill in all required fields and nominate required roles before proceeding.";
      }
    }

    if (sid === 'triage') {
      if (!data.hasLiveOpportunity) return "Please answer whether you have a live opportunity.";
      if (data.hasLiveOpportunity === 'Unsure' && !data.unsureExplanation) return "Please explain what you are unsure about.";
      if (data.hasLiveOpportunity === 'Yes') {
        const details = data.opportunityDetails || {};
        if (!details.opportunityType || !details.opportunityTitle) return "Type and title are required.";
        if (!details.deadlineDate && details.urgencyLevel !== 'No confirmed deadline') return "Deadline is required.";
        if (!details.supportRequired?.length) return "Please select support required.";
      }
    }

    if (sid === 'selection') {
      if (!data.selectedServices?.length) return "At least one service must be selected.";
      if (!data.highestPriorityService || !data.reasonForSupport || !data.supportLevel) return "Required fields missing.";
    }

    if (sid === 'profile') {
      if (!data.businessOverview?.plainEnglishDescription || !data.businessOverview?.problemSolved) return "Overview fields missing.";
      if (!data.valueProposition?.clientOutcomes || !data.valueProposition?.differentiators || !data.valueProposition?.clientsChooseUsBecause) return "Value prop missing.";
      if (!data.valueProposition?.topThreePoints?.every((p: string) => p)) return "Top three points missing.";
    }

    if (sid === 'outreach') {
      if (!data.directChannels?.length) return "At least one growth channel required.";
      const setup = data.targetSetup || {};
      const num = setup.numberOfTargets === '5 or more' ? 5 : parseInt(setup.numberOfTargets || '1');
      const targets = setup.targets || [];
      if (!targets[0]?.name) return "At least one target organisation is required.";
      if (!data.campaigns?.selectedCampaigns?.length) return "Campaign preference required.";
      if (!data.relationships?.doNotContact) return "The 'Organisations not to contact' field is required (write 'None' if applicable).";
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
    if (stepId === 'selection') updateData.enabledModules = formData.enabledModules || {};

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
    const enabled = submission?.enabledModules?.[s.conditional];
    const unsureSelected = submission?.sections?.selection?.selectedServices?.includes('Unsure, please recommend');
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
    case 'welcome': {
      return (
        <div className="space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold tracking-tight text-slate-900">Welcome to Your Bid Manager Onboarding</h2>
            <p className="text-slate-500 text-lg leading-relaxed">This process helps us collect the information we need to understand your business and support you across all bidding channels.</p>
          </div>
          <div className="space-y-5">
            {[
              { id: 'ack1', label: 'I confirm I have read, or have had the opportunity to read, the Bid Manager Terms and Conditions.' },
              { id: 'ack2', label: 'I confirm I am authorised to complete this onboarding process on behalf of the business.' },
              { id: 'ack3', label: 'I understand that Bid Manager may use the information I provide to prepare client profiles and proposal content.' },
              { id: 'ack4', label: 'I understand that final content, pricing, and submissions require approval.' },
              { id: 'ack5', label: 'I understand that I must not provide passwords or MFA codes through this portal.' },
              { id: 'ack6', label: 'I understand I can save my progress and return later.' },
              { id: 'ack7', label: 'I understand that the quality of information provided affects the accuracy of our work.' }
            ].map((ack) => (
              <div key={ack.id} className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onChange(ack.id, !data[ack.id])}>
                <Checkbox checked={data[ack.id] || false} onCheckedChange={() => {}} className="mt-0.5" />
                <Label className="text-sm leading-snug cursor-pointer font-medium text-slate-700">{ack.label}</Label>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'outreach': {
      const targetSetup = data.targetSetup || { numberOfTargets: '1', targets: [] };
      const targets = targetSetup.targets || [];
      const numTargetsRaw = targetSetup.numberOfTargets || '1';
      const numTargets = numTargetsRaw === '5 or more' ? 5 : parseInt(numTargetsRaw);
      
      const rel = data.relationships || {};
      const camp = data.campaigns || { selectedCampaigns: [] };

      const handleTargetChange = (i: number, f: string, v: any) => {
        const next = [...targets];
        if (!next[i]) next[i] = { targetNumber: i + 1, preferredApproach: [] };
        next[i] = { ...next[i], [f]: v };
        onChange('targetSetup', { ...targetSetup, targets: next });
      };

      const handleChannelToggle = (ch: string) => {
        const current = data.directChannels || [];
        const next = current.includes(ch) ? current.filter((c: string) => c !== ch) : [...current, ch];
        onChange('directChannels', next);
      };

      return (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900">Direct Proposal and Outreach Strategy</h2>
            <p className="text-slate-500 text-lg leading-relaxed">Complete this section if you want support with direct proposals, outreach campaigns, and target account development.</p>
          </div>

          <Card className="border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><Send className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold text-slate-900">Direct Growth Channels</h3>
            </div>
            <CardContent className="p-8 space-y-6">
              <Label className="text-lg font-bold">Which direct growth channels are you open to? *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {OUTREACH_CHANNELS.map(ch => (
                  <div key={ch} className={`flex items-center space-x-2 p-3 rounded-xl border cursor-pointer ${(data.directChannels || []).includes(ch) ? 'border-primary bg-primary/5' : 'bg-white'}`} onClick={() => handleChannelToggle(ch)}>
                    <Checkbox checked={(data.directChannels || []).includes(ch)} onCheckedChange={() => {}} />
                    <Label className="text-xs cursor-pointer">{ch}</Label>
                  </div>
                ))}
              </div>
              {(data.directChannels || []).includes('Other') && (
                <div className="pt-2 animate-in slide-in-from-top-2">
                  <Label className="font-bold">Please specify *</Label>
                  <Input value={data.otherDirectChannel || ''} onChange={(e) => onChange('otherDirectChannel', e.target.value)} className="h-12 rounded-xl" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><UserPlus className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold text-slate-900">Target Organisations</h3>
            </div>
            <CardContent className="p-8 space-y-10">
              <div className="space-y-4">
                <Label className="text-lg font-bold">How many target organisations or sectors would you like to add?</Label>
                <div className="max-w-[240px]">
                  <Select value={numTargetsRaw} onValueChange={(v) => onChange('targetSetup', { ...targetSetup, numberOfTargets: v })}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{["1", "2", "3", "4", "5 or more"].map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-8">
                {Array.from({ length: numTargets }).map((_, i) => {
                  const target = targets[i] || {};
                  return (
                    <div key={i} className="p-8 border border-slate-100 bg-slate-50/30 rounded-[2.5rem] space-y-8">
                      <h4 className="font-bold text-lg">Target {i + 1}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2"><Label className="font-bold">Target Organisation/Sector *</Label><Input value={target.name || ''} onChange={(e) => handleTargetChange(i, 'name', e.target.value)} placeholder="e.g. City Council" className="h-12 rounded-xl bg-white" /></div>
                        <div className="space-y-2"><Label className="font-bold">Existing Relationship?</Label>
                          <Select value={target.relationship || ''} onValueChange={(v) => handleTargetChange(i, 'relationship', v)}>
                            <SelectTrigger className="h-12 rounded-xl bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>{["Yes", "No", "Weak connection", "Previous client", "Referral possible", "Unsure"].map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2"><Label className="font-bold">Why is this target attractive?</Label><Textarea value={target.whyAttractive || ''} onChange={(e) => handleTargetChange(i, 'whyAttractive', e.target.value)} className="min-h-[80px] rounded-2xl bg-white" /></div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><Handshake className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold text-slate-900">Relationships and Referrals</h3>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2"><Label className="font-bold">Organisations Bid Manager must NOT contact *</Label><Textarea value={rel.doNotContact || ''} onChange={(e) => onChange('relationships', { ...rel, doNotContact: e.target.value })} placeholder="List names or write 'None known'..." className="min-h-[80px] rounded-2xl border-amber-200 bg-amber-50/10" /></div>
              <div className="space-y-2"><Label className="font-bold">Previous clients or dormant contacts to re-engage?</Label><Textarea value={rel.dormantContacts || ''} onChange={(e) => onChange('relationships', { ...rel, dormantContacts: e.target.value })} className="min-h-[80px] rounded-2xl" /></div>
              <div className="space-y-2"><Label className="font-bold">Who currently refers work to you?</Label><Textarea value={rel.referralSources || ''} onChange={(e) => onChange('relationships', { ...rel, referralSources: e.target.value })} className="min-h-[80px] rounded-2xl" /></div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><Megaphone className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold text-slate-900">Campaign Preferences</h3>
            </div>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <Label className="text-lg font-bold">Which campaign ideas interest you? *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CAMPAIGN_IDEAS.map(idea => (
                    <div key={idea} className={`flex items-center space-x-2 p-3 rounded-xl border cursor-pointer ${camp.selectedCampaigns?.includes(idea) ? 'border-primary bg-primary/5' : 'bg-white'}`} onClick={() => {
                      const current = camp.selectedCampaigns || [];
                      const next = current.includes(idea) ? current.filter((i: string) => i !== idea) : [...current, idea];
                      onChange('campaigns', { ...camp, selectedCampaigns: next });
                    }}>
                      <Checkbox checked={camp.selectedCampaigns?.includes(idea)} onCheckedChange={() => {}} />
                      <Label className="text-xs cursor-pointer">{idea}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <Label className="font-bold">Preferred tone for outreach</Label>
                <RadioGroup value={camp.preferredTone} onValueChange={(v) => onChange('campaigns', { ...camp, preferredTone: v })} className="flex flex-wrap gap-6">
                  {["Formal", "Warm", "Short and direct", "Detailed and professional", "Unsure"].map(opt => (
                    <div key={opt} className="flex items-center space-x-2"><RadioGroupItem value={opt} id={`tone-${opt}`} /><Label htmlFor={`tone-${opt}`}>{opt}</Label></div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    default:
      return (
        <div className="py-24 text-center space-y-6">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto shadow-inner"><FileText className="w-10 h-10 text-slate-400" /></div>
          <div className="space-y-2"><h2 className="text-2xl font-bold text-slate-900">Section Under Development</h2><p className="text-slate-500 max-w-md mx-auto leading-relaxed">We're currently preparing the specialized questionnaire for the <span className="text-primary font-bold">"{STEPS.find(s => s.id === stepId)?.title}"</span> section.</p></div>
          <Button variant="outline" onClick={() => handleSave(true)} className="rounded-xl border-2 px-8">Skip for now <ChevronRight className="ml-2 w-4 h-4" /></Button>
        </div>
      );
  }
}
