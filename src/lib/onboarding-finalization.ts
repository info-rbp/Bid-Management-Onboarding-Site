import { getVisibleOnboardingSteps } from './onboarding-steps';
import { validateOnboardingSection } from './onboardingValidation';

export type SubmissionBlocker = {
  stepKey: string;
  message: string;
};

export function collectSectionSubmissionBlockers(
  submissionData: Record<string, any>
): SubmissionBlocker[] {
  const visibleSteps = getVisibleOnboardingSteps(submissionData.enabledModules);
  const requiredSteps = visibleSteps.filter((step) => step.required);
  const blockers: SubmissionBlocker[] = [];

  for (const step of requiredSteps) {
    if (step.key === 'final_submission') {
      continue;
    }

    const validation = validateOnboardingSection(
      step.key,
      submissionData.sections?.[step.key] || {},
      submissionData
    );

    if (!validation.isValid) {
      blockers.push({
        stepKey: step.key,
        message: `Section ${step.title} is incomplete.`,
      });
    }
  }

  return blockers;
}

export function collectFinalSubmissionBlockers(params: {
  submissionData: Record<string, any>;
  acknowledgements?: Record<string, unknown> | null;
}): SubmissionBlocker[] {
  const blockers = collectSectionSubmissionBlockers(params.submissionData);

  const finalValidation = validateOnboardingSection(
    'final_submission',
    {
      acknowledgements: params.acknowledgements || {},
    },
    params.submissionData
  );

  if (!finalValidation.isValid) {
    blockers.push({
      stepKey: 'final_submission',
      message: 'Final submission acknowledgements are incomplete.',
    });
  }

  return blockers;
}
