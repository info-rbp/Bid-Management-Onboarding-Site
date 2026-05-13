import { allSteps } from './onboarding-steps';

export type SubmissionStatus = 'in_progress' | 'submitted';

export function buildInitialSubmission(params: { userId: string; businessName: string; currentStep: string }) {
  return {
    userId: params.userId,
    businessName: params.businessName || 'My Business',
    status: 'in_progress' as SubmissionStatus,
    currentStep: params.currentStep,
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
    sections: {},
    sectionStatuses: allSteps.reduce((acc, step) => {
      acc[step.key] = {
        status: 'not_started',
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
