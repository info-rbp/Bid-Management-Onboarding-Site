import { serverTimestamp } from 'firebase/firestore';
import { allSteps, getVisibleOnboardingSteps } from '@/lib/onboarding-steps';

export type InitialSubmissionInput = {
  userId: string;
  businessName?: string | null;
  currentStep?: string | null;
};

export function buildSectionStatus(
  currentStatus: any,
  newStatus: 'in_progress' | 'needs_attention' | 'complete' | 'skipped' | 'not_started',
  missingFields: string[] = []
) {
  return {
    ...(currentStatus || {}),
    status: newStatus,
    missingFields,
    lastUpdatedAt: serverTimestamp(),
  };
}

export function buildInitialSectionStatuses() {
  return allSteps.reduce((acc, step) => {
    acc[step.key] = {
      sectionKey: step.key,
      status: 'not_started',
      required: step.required,
      missingFields: [],
      lastUpdatedAt: null,
    };
    return acc;
  }, {} as Record<string, any>);
}

export function buildInitialSubmission({
  userId,
  businessName,
  currentStep = 'welcome_expectations',
}: InitialSubmissionInput) {
  const visibleSteps = getVisibleOnboardingSteps();

  return {
    userId,
    businessName: businessName || 'My Business',
    status: 'in_progress',
    currentStep: currentStep || 'welcome_expectations',
    visibleStepKeys: visibleSteps.map((step) => step.key),
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
    sectionStatuses: buildInitialSectionStatuses(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastSavedAt: serverTimestamp(),
    submittedAt: null,
    completedAt: null,
    adminReopened: false,
    googleDriveFolderId: null,
    googleDriveFolderUrl: null,
  };
}
