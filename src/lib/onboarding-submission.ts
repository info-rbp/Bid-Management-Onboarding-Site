import { allSteps } from './onboarding-steps';

export type SubmissionStatus =
  | 'in_progress'
  | 'needs_attention'
  | 'validation_blocked'
  | 'submitted'
  | 'completed'
  | 'cancelled'
  | 'archived';

export const ACTIVE_ONBOARDING_STATUSES = [
  'in_progress',
  'needs_attention',
  'validation_blocked',
] as const;

export const TERMINAL_ONBOARDING_STATUSES = [
  'submitted',
  'completed',
  'cancelled',
  'archived',
] as const;

export function isTerminalOnboardingStatus(status: unknown): boolean {
  return (
    typeof status === 'string' &&
    TERMINAL_ONBOARDING_STATUSES.includes(
      status as (typeof TERMINAL_ONBOARDING_STATUSES)[number]
    )
  );
}

export function isActiveOnboardingStatus(status: unknown): boolean {
  if (typeof status !== 'string') return true;
  if (isTerminalOnboardingStatus(status)) return false;

  return (
    status.length === 0 ||
    ACTIVE_ONBOARDING_STATUSES.includes(
      status as (typeof ACTIVE_ONBOARDING_STATUSES)[number]
    )
  );
}

export function getFallbackOnboardingStep(): string {
  return 'welcome_expectations';
}

export function getSubmissionResumeStep(
  submission: { currentStep?: unknown; visibleStepKeys?: unknown },
  fallback = getFallbackOnboardingStep()
): string {
  const currentStep =
    typeof submission.currentStep === 'string'
      ? submission.currentStep.trim()
      : '';

  const visibleStepKeys = Array.isArray(submission.visibleStepKeys)
    ? submission.visibleStepKeys.filter(
        (step): step is string => typeof step === 'string'
      )
    : allSteps.map((step) => step.key);

  if (currentStep && visibleStepKeys.includes(currentStep)) {
    return currentStep;
  }

  return visibleStepKeys[0] || fallback;
}

export function buildInitialSubmission(params: {
  userId: string;
  businessName: string;
  currentStep?: string;
}) {
  const currentStep = params.currentStep || getFallbackOnboardingStep();

  return {
    userId: params.userId,
    businessName: params.businessName || 'My Business',
    status: 'in_progress' as SubmissionStatus,
    currentStep,
    visibleStepKeys: allSteps.map((s) => s.key),
    completionPercentage: 0,
    selectedServices: [],
    enabledModules: {
      tenderReadiness: false,
      grants: false,
      marketplaceStrategy: false,
      outreachStrategy: false,
      quoteSupport: false,
    },
    completedSteps: [],
    sections: {},
    sectionStatuses: allSteps.reduce((acc, step) => {
      acc[step.key] = {
        sectionKey: step.key,
        status: 'not_started',
        required: step.required,
        missingFields: [],
        lastUpdatedAt: null,
        completion: 0,
        updatedAt: null,
      };
      return acc;
    }, {} as Record<string, any>),
    submittedAt: null,
    adminReopened: false,
    googleDriveFolderId: null,
    googleDriveFolderUrl: null,
  };
}