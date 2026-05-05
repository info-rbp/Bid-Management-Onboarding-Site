
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs, addDoc, getDoc, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { 
  ChevronRight, 
  ChevronLeft,
  LayoutDashboard,
  CheckCircle2,
  Lock,
  Files,
  Loader2,
  Briefcase,
  AlertTriangle,
  RefreshCw,
  CloudOff
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { getVisibleOnboardingSteps, allSteps, EnabledModules, OnboardingStep, deriveServiceModules, deriveAuthorityReadiness } from '@/lib/onboarding-steps';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { validateOnboardingSection, ValidationResult } from '@/lib/onboardingValidation';
import { ValidationSummary } from '@/components/ValidationSummary';
import { WelcomeExpectations } from '../welcome_expectations';
import { BusinessSnapshot } from '../business_snapshot';
import { ServiceSelection } from '../service_selection';
import { BusinessProfile } from '../business_profile';
import { OfferMenu } from '../offer_menu';
import { TeamCapacity } from '../team_capacity';
import { ProofEvidence } from '../proof_evidence';
import { GoalsStrategy } from '../goals_strategy';
import { PricingCommercial } from '../pricing_commercial';
import { PlatformSetup } from '../platform_setup';
import { DocumentUploadLibrary } from '../document_upload_library';
import { AuthorityMatrix } from '../authority_matrix';
import { OpportunityTriage } from '../opportunity_triage';
import { ComplianceInsurance } from '../compliance_insurance';
import { WorkflowRules } from '../workflow_rules';
import { TenderReadiness } from '../tender_readiness';
import { Grants } from '../grants';
import { MarketplaceStrategy } from '../marketplace_strategy';
import { OutreachStrategy } from '../outreach_strategy';
import { QuoteSupport } from '../quote_support';
import { FinalSubmission } from '../final_submission';
import ServiceModules from '../service_modules';

const buildSectionStatus = (currentStatus: any, newStatus: 'in_progress' | 'needs_attention' | 'complete' | 'skipped' | 'not_started', missingFields: string[] = []) => ({
  ...(currentStatus || {}),
  status: newStatus,
  missingFields,
  lastUpdatedAt: serverTimestamp(),
});

export default function OnboardingStepPage() {
  const { stepId } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  
  const initialSyncDone = useRef<Record<string, boolean>>({});
  const lastSavedDataRef = useRef<string>("{}");

  const submissionRef = useMemoFirebase(() => {
    if (!submissionId || !db) return null;
    return doc(db, 'onboardingSubmissions', submissionId);
  }, [submissionId, db]);

  const { data: submission, isLoading: loadingSubmissions } = useDoc(submissionRef);

  const enabledModules = submission?.enabledModules;

  const visibleSteps = useMemo(() => {
    return getVisibleOnboardingSteps(enabledModules);
  }, [enabledModules]);

  const currentStep = useMemo(() => visibleSteps.find(s => s.key === stepId), [visibleSteps, stepId]);
  const currentVisibleIndex = useMemo(() => visibleSteps.findIndex(s => s.key === stepId), [visibleSteps, stepId]);

  const isLocked = submission?.status === 'submitted' && !submission?.adminReopened;

  // Initial Data Sync
  useEffect(() => {
    const sid = stepId as string;
    if (submission && !initialSyncDone.current[sid]) {
      const savedData = submission.sections?.[sid] || {};
      setFormData(savedData);
      lastSavedDataRef.current = JSON.stringify(savedData);
      initialSyncDone.current[sid] = true;
      
      if (submission.lastSavedAt?.toDate) {
        setLastSavedTime(submission.lastSavedAt.toDate());
      }
    }
  }, [submission, stepId]);

  // Update current step in DB on mount
  useEffect(() => {
    if (submissionId && db && stepId && submission && !isLocked) {
      if (submission.currentStep !== stepId) {
        updateDoc(doc(db, 'onboardingSubmissions', submissionId), {
          currentStep: stepId,
          updatedAt: serverTimestamp()
        });
      }
    }
  }, [stepId, submissionId, db, submission, isLocked]);

  // Autosave Logic
  useEffect(() => {
    const sid = stepId as string;
    if (isLocked || !submissionId || !db || !initialSyncDone.current[sid] || sid === 'final_submission') return;

    const dataString = JSON.stringify(formData);
    if (dataString === lastSavedDataRef.current) return;

    setSaveStatus('saving');

    const timeout = setTimeout(async () => {
      try {
        const updateData: any = {
          updatedAt: serverTimestamp(),
          lastSavedAt: serverTimestamp(),
          currentStep: sid
        };

        let processedFormData = { ...formData };
        if (sid === 'authority_matrix') {
          const readiness = deriveAuthorityReadiness(formData, {
            pricing: submission.sections?.pricing_commercial,
            serviceModules: submission.sections?.service_modules,
            platforms: submission.sections?.platform_setup,
            workflow: submission.sections?.workflow_rules
          });
          processedFormData.derivedAuthorityReadiness = readiness;
          processedFormData.updatedAt = serverTimestamp();
          
          const validation = validateOnboardingSection(sid, formData, submission);
          processedFormData.sectionStatus = {
            isComplete: validation.isValid,
            requiredFieldsComplete: validation.isValid,
            validationErrors: validation.missingFields,
            updatedAt: serverTimestamp()
          };
          if (validation.isValid) {
            processedFormData.completedAt = serverTimestamp();
          }
        }

        updateData[`sections.${sid}`] = processedFormData;
        updateData[`sectionStatuses.${sid}`] = buildSectionStatus(submission.sectionStatuses[sid], 'in_progress');

        await updateDoc(doc(db, 'onboardingSubmissions', submissionId), updateData);
        
        lastSavedDataRef.current = dataString;
        setSaveStatus('saved');
        setLastSavedTime(new Date());
      } catch (error) {
        console.error("Autosave failed", error);
        setSaveStatus('error');
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [formData, stepId, submissionId, db, isLocked, submission]);

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
          visibleStepKeys: allSteps.map(s => s.key),
          completionPercentage: 0,
          selectedServices: [],
          enabledModules: {
            tenderReadiness: false,
            grants: false,
            marketplaceStrategy: false,
            outreachStrategy: false,
            quoteSupport: false,
          },
          sections: {},
          sectionStatuses: allSteps.reduce((acc, step) => {
            acc[step.key] = buildSectionStatus(null, 'not_started');
            return acc;
          }, {} as { [key: string]: any }),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastSavedAt: serverTimestamp(),
          submittedAt: null,
          adminReopened: false,
          googleDriveFolderId: null,
          googleDriveFolderUrl: null,
        });
        setSubmissionId(newDoc.id);
      }
    }
    initSubmission();
  }, [user, db, submissionId, stepId]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNavigate = (targetStepKey: string) => {
    if (targetStepKey === stepId) return;
    const targetStep = visibleSteps.find(s => s.key === targetStepKey);
    if (!targetStep) return;

    if (submissionId && db && !isLocked) {
      const updateData: any = { 
        updatedAt: serverTimestamp(), 
        lastSavedAt: serverTimestamp(),
        currentStep: targetStepKey 
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
    if (!submissionId || !db || !currentStep || isLocked) {
      if (direction === 'next' && currentVisibleIndex < visibleSteps.length - 1) {
        router.push(visibleSteps[currentVisibleIndex + 1].route);
      } else if (direction === 'prev' && currentVisibleIndex > 0) {
        router.push(visibleSteps[currentVisibleIndex - 1].route);
      }
      return;
    }
    
    if (direction === 'next' && stepId !== 'final_submission') {
      const validation = validateOnboardingSection(stepId as string, formData, submission);
      setValidationResult(validation);
      if (!validation.isValid) {
        const updateData: any = { updatedAt: serverTimestamp() };
        updateData[`sections.${stepId}`] = formData;
        updateData[`sectionStatuses.${stepId}`] = buildSectionStatus(submission.sectionStatuses[stepId as string], 'needs_attention', [...validation.missingFields, ...validation.invalidFields].map((e) => e.message));
        
        updateDoc(doc(db, 'onboardingSubmissions', submissionId), updateData);
        
        setTimeout(() => {
          const first = [...validation.missingFields, ...validation.invalidFields].find((e) => e.anchorId);
          if (!first?.anchorId) return;
          const el = document.getElementById(first.anchorId);
          if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); (el as HTMLElement).focus?.(); }
        }, 0);
        return;
      }
    }

    const updateData: any = { updatedAt: serverTimestamp(), lastSavedAt: serverTimestamp() };
    
    let processedFormData = { ...formData };
    if (stepId === 'authority_matrix') {
      const readiness = deriveAuthorityReadiness(formData, {
        pricing: submission.sections?.pricing_commercial,
        serviceModules: submission.sections?.service_modules,
        platforms: submission.sections?.platform_setup,
        workflow: submission.sections?.workflow_rules
      });
      processedFormData.derivedAuthorityReadiness = readiness;
      processedFormData.updatedAt = serverTimestamp();
      
      const validation = validateOnboardingSection(stepId as string, formData, submission);
      processedFormData.sectionStatus = {
        isComplete: validation.isValid,
        requiredFieldsComplete: validation.isValid,
        validationErrors: validation.missingFields,
        updatedAt: serverTimestamp()
      };
      if (validation.isValid) {
        processedFormData.completedAt = serverTimestamp();
      }
    }

    setValidationResult(null);
    updateData[`sections.${stepId}`] = processedFormData;

    let targetStepKey = stepId as string;
    let postSaveNavigation = true;
    let tempEnabledModules = submission.enabledModules;

    if (stepId === 'service_selection') {
      const services = formData.selectedServices || [];
      const newEnabledModules: EnabledModules = deriveServiceModules(services);
      tempEnabledModules = newEnabledModules;

      const newVisibleSteps = getVisibleOnboardingSteps(newEnabledModules);
      const newVisibleStepKeys = newVisibleSteps.map(s => s.key);
      const currentStatuses = { ...submission.sectionStatuses };
      let shouldRedirect = false;

      for (const step of allSteps) {
        const isNowVisible = newVisibleStepKeys.includes(step.key);
        const wasVisible = submission.visibleStepKeys.includes(step.key);

        if (isNowVisible && !wasVisible) {
            currentStatuses[step.key] = buildSectionStatus(currentStatuses[step.key], 'not_started');
        } else if (!isNowVisible && wasVisible) {
            currentStatuses[step.key] = buildSectionStatus(currentStatuses[step.key], 'skipped');
            if (stepId === step.key) {
                shouldRedirect = true;
            }
        }
      }

      updateData.enabledModules = newEnabledModules;
      updateData.visibleStepKeys = newVisibleStepKeys;
      updateData.selectedServices = services;
      updateData.sectionStatuses = currentStatuses;

      if(shouldRedirect){
        const nextPageIndex = visibleSteps.findIndex(s => s.key === stepId);
        if (nextPageIndex !== -1 && nextPageIndex + 1 < newVisibleSteps.length) {
            targetStepKey = newVisibleSteps[nextPageIndex + 1].key;
        } else {
            targetStepKey = 'final_submission';
        }
        postSaveNavigation = false;
        toast({ title: "Section Hidden", description: "This section has been hidden because it is no longer in scope." });
        router.push(allSteps.find(s => s.key === targetStepKey)!.route);
      }
    }

    if (direction === 'next') {
      const finalVisibleSteps = getVisibleOnboardingSteps(tempEnabledModules);
      const finalVisibleRequiredSteps = finalVisibleSteps.filter(s => s.required);
      
      if (finalVisibleRequiredSteps.length === 0) {
        updateData.completionPercentage = 100;
      } else {
        const completedRequiredStepsCount = finalVisibleRequiredSteps.reduce((count, step) => {
          const isCurrentStep = step.key === stepId;
          const isCompleted = submission.sectionStatuses[step.key]?.status === 'complete';
          if ((!isCurrentStep && isCompleted) || (isCurrentStep)) {
             return count + 1;
          }
          return count;
        }, 0);
        const completionPercentage = (completedRequiredStepsCount / finalVisibleRequiredSteps.length) * 100;
        updateData.completionPercentage = completionPercentage;
      }
      
      updateData[`sectionStatuses.${stepId}`] = buildSectionStatus(submission.sectionStatuses[stepId as string], 'complete');
      
      if (currentVisibleIndex < visibleSteps.length - 1) {
        targetStepKey = visibleSteps[currentVisibleIndex + 1].key;
      }
    } else if (direction === 'prev') {
      if (currentVisibleIndex > 0) {
        targetStepKey = visibleSteps[currentVisibleIndex - 1].key;
      }
    } else {
      updateData[`sectionStatuses.${stepId}`] = buildSectionStatus(submission.sectionStatuses[stepId as string], 'in_progress');
    }

    updateData.currentStep = targetStepKey;

    setSaveStatus('saving');
    updateDoc(doc(db, 'onboardingSubmissions', submissionId), updateData).then(() => {
      setSaveStatus('saved');
      setLastSavedTime(new Date());
      lastSavedDataRef.current = JSON.stringify(formData);
    }).catch((error: any) => {
      setSaveStatus('error');
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `onboardingSubmissions/${submissionId}`, operation: 'update', requestResourceData: updateData }));
    });

    if (direction !== 'stay' && postSaveNavigation) {
      const nextStep = visibleSteps.find(s => s.key === targetStepKey);
      if(nextStep) {
        router.push(nextStep.route);
        initialSyncDone.current[nextStep.key] = false;
      }
    } else if(direction === 'stay') {
      toast({ title: "Draft Saved", description: "Your progress has been saved." });
    }
  };

  const handleSubmitPack = async () => {
    if (!submissionId || !db || !user || !submission) return;

    setIsSubmitting(true);
    try {
      // 1. First, save current section data to Firestore
      const updateData: any = { 
        updatedAt: serverTimestamp(),
        [`sections.final_submission`]: formData 
      };
      await updateDoc(doc(db, 'onboardingSubmissions', submissionId), updateData);

      // 2. Call the Finalize API which handles Google Drive and Status Updates
      const response = await fetch('/api/onboarding/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, userId: user.uid }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to finalize submission');
      }
      
      // 3. NEW: Call the notification API
      await fetch('/api/notifications/submission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              submissionId: submissionId,
              businessName: submission.businessName || 'N/A',
          }),
      });

      toast({ 
        title: "Submission Successful", 
        description: "Your onboarding pack has been submitted and a notification has been sent." 
      });

      // 4. Redirect to a confirmation page
      router.push(`/onboarding/submitted?id=${submissionId}`);
      
    } catch (error: any) {
      toast({ variant: "destructive", title: "Submission Failed", description: error.message });
      setIsSubmitting(false); // Only set this on failure
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

  const renderSaveStatus = () => {
    if (isLocked) return null;
    
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Saving draft...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-2 text-xs text-green-600">
            <CheckCircle2 className="w-3 h-3" />
            <span>Saved {lastSavedTime ? `at ${lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-xs text-destructive">
            <CloudOff className="w-3 h-3" />
            <span>Save failed</span>
          </div>
        );
      default:
        return lastSavedTime ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3 h-3 opacity-50" />
            <span>Last saved {lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ) : null;
    }
  };

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
              const statusInfo = submission?.sectionStatuses?.[step.key];
              const status = statusInfo?.status || 'not_started';
              const isCurrent = step.key === stepId;
              
              const getIcon = () => {
                if (status === 'complete') return <CheckCircle2 className="w-3.5 h-3.5" />;
                if (status === 'needs_attention') return <AlertTriangle className="w-3.5 h-3.5" />;
                return <step.icon className="w-3.5 h-3.5" />;
              };

              const getColors = () => {
                if (isCurrent) return 'bg-primary/10 text-primary font-bold shadow-sm';
                if (status === 'complete') return 'text-green-600 hover:bg-green-50';
                if (status === 'needs_attention') return 'text-orange-600 hover:bg-orange-50';
                if (status === 'skipped') return 'text-slate-400 hover:bg-slate-50';
                return 'text-muted-foreground hover:bg-slate-50';
              };

              const getDotColor = () => {
                if (isCurrent) return 'bg-primary text-white';
                if (status === 'complete') return 'bg-green-100';
                if (status === 'needs_attention') return 'bg-orange-100';
                if (status === 'skipped') return 'bg-slate-100';
                return 'bg-slate-100';
              };

              return (
                <div 
                  key={step.key}
                  onClick={() => handleNavigate(step.key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group ${getColors()}`}
                >
                  <div className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-full ${getDotColor()}`}>
                    {getIcon()}
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
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="gap-2 rounded-lg text-muted-foreground"><LayoutDashboard className="w-4 h-4" /> Dashboard</Button>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center"><currentStep.icon className="w-3.5 h-3.5 text-primary" /></span>
                <h1 className="text-sm font-bold text-slate-900">{currentVisibleIndex + 1}. {currentStep.title}</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {renderSaveStatus()}
              <div className="flex items-center gap-3">
                {currentVisibleIndex > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => handleSave('prev')} className="gap-2 rounded-lg text-muted-foreground"><ChevronLeft className="w-4 h-4" /> Previous</Button>
                )}
                {!isLocked && stepId !== 'final_submission' && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => handleSave('stay')} className="gap-2 rounded-lg border-2">Save Draft</Button>
                    <Button size="sm" onClick={() => handleSave('next')} className="gap-2 rounded-lg font-bold px-6 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20" disabled={currentVisibleIndex === visibleSteps.length - 1}>Next Step <ChevronRight className="w-4 h-4" /></Button>
                  </>
                )}
                {isLocked && currentVisibleIndex < visibleSteps.length - 1 && (
                  <Button size="sm" onClick={() => handleSave('next')} className="gap-2 rounded-lg font-bold px-6 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">Next Step <ChevronRight className="w-4 h-4" /></Button>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto bg-slate-50/30">
            <div className="max-w-4xl mx-auto p-8 lg:p-12">
              {stepId === 'business_snapshot' && process.env.NODE_ENV !== 'production' && validationResult && (
                <pre className="mb-6 rounded-xl border bg-slate-900 text-slate-100 p-4 text-xs overflow-auto">{JSON.stringify({ section: 'Snapshot', ...validationResult, raw: formData }, null, 2)}</pre>
              )}

              {isLocked && stepId !== 'final_submission' && (
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
                  {isSubmitting ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                      <Loader2 className="animate-spin text-primary w-12 h-12" />
                      <div className="text-center">
                        <h3 className="text-lg font-bold">Finalizing Onboarding</h3>
                        <p className="text-sm text-muted-foreground">Creating your Google Drive workspace and locking files...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                    {validationResult && !validationResult.isValid && <ValidationSummary validationResult={validationResult} />}
                    <StepContent 
                      stepId={stepId as string} 
                      data={formData} 
                      allData={submission}
                      onChange={handleFieldChange} 
                      isLocked={isLocked}
                      submissionId={submissionId}
                      onEdit={handleNavigate}
                      onSubmit={handleSubmitPack}
                      validationResult={validationResult}
                    />
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

function StepContent({ stepId, data, allData, onChange, isLocked, submissionId, onEdit, onSubmit, validationResult }: { stepId: string, data: any, allData: any, onChange: (field: string, value: any) => void, isLocked: boolean, submissionId: string | null, onEdit: (step: string) => void, onSubmit: () => void, validationResult?: ValidationResult | null }) {
  if (!submissionId) return null;

  switch (stepId) {
    case 'welcome_expectations':
      return <WelcomeExpectations data={data} onChange={onChange} isLocked={isLocked} />;
    case 'business_snapshot':
      return <BusinessSnapshot data={data} onChange={onChange} isLocked={isLocked} fieldErrors={Object.fromEntries([...(validationResult?.missingFields || []), ...(validationResult?.invalidFields || [])].map((e) => [e.fieldKey, e.message]))} />;
    case 'service_selection':
      return <ServiceSelection data={data} onChange={onChange} isLocked={isLocked} />;
    case 'business_profile':
      return <BusinessProfile data={data} onChange={onChange} isLocked={isLocked} allData={allData} />;
    case 'offer_menu':
      return <OfferMenu data={data} onChange={onChange} isLocked={isLocked} />;
    case 'team_capacity':
      return <TeamCapacity data={data} onChange={onChange} isLocked={isLocked} />;
    case 'proof_evidence':
      return <ProofEvidence data={data} onChange={onChange} isLocked={isLocked} />;
    case 'goals_strategy':
      return <GoalsStrategy data={data} onChange={onChange} isLocked={isLocked} />;
    case 'pricing_commercial':
      return <PricingCommercial data={data} onChange={onChange} isLocked={isLocked} allData={allData} />;
    case 'platform_setup':
      return <PlatformSetup data={data} onChange={onChange} isLocked={isLocked} allData={allData} />;
    case 'document_upload_library':
      return <DocumentUploadLibrary data={data} onChange={onChange} isLocked={isLocked} submissionId={submissionId} />;
    case 'authority_matrix':
      return <AuthorityMatrix data={data} allData={allData} onChange={onChange} isLocked={isLocked} />;
    case 'opportunity_triage':
      return <OpportunityTriage data={data} onChange={onChange} isLocked={isLocked} />;
    case 'compliance_insurance':
      return <ComplianceInsurance data={data} onChange={onChange} isLocked={isLocked} />;
    case 'service_modules':
      return <ServiceModules data={data} onChange={onChange} isLocked={isLocked} allData={allData} />;
    case 'tender_readiness':
      return <TenderReadiness data={data} onChange={onChange} isLocked={isLocked} />;
    case 'grants':
      return <Grants data={data} onChange={onChange} isLocked={isLocked} />;
    case 'marketplace_strategy':
      return <MarketplaceStrategy data={data} onChange={onChange} isLocked={isLocked} />;
    case 'outreach_strategy':
      return <OutreachStrategy data={data} onChange={onChange} isLocked={isLocked} />;
    case 'quote_support':
      return <QuoteSupport data={data} onChange={onChange} isLocked={isLocked} />;
    case 'workflow_rules':
      return <WorkflowRules data={data} onChange={onChange} isLocked={isLocked} />;
    case 'final_submission':
      return <FinalSubmission data={data} allData={allData} onChange={onChange} isLocked={isLocked} onEdit={onEdit} onSubmit={onSubmit} />;
    default:
      return (
        <div className="py-20 text-center space-y-6">
          <h3 className="text-2xl font-bold text-slate-900">Coming Soon</h3>
          <p className="text-slate-400 max-w-md mx-auto">The content for this section (<strong>{stepId}</strong>) is currently being populated.</p>
        </div>
      );
  }
}
