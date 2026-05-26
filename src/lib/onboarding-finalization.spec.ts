import { describe, expect, it } from 'vitest';
import { collectFinalSubmissionBlockers } from './onboarding-finalization';

describe('collectFinalSubmissionBlockers', () => {
  it('flags incomplete required sections', () => {
    const blockers = collectFinalSubmissionBlockers({
      submissionData: {
        enabledModules: {
          tenderReadiness: false,
          grants: false,
          marketplaceStrategy: false,
          outreachStrategy: false,
          quoteSupport: false,
        },
        sections: {},
      },
      acknowledgements: {
        confirmInformationAccurate: true,
        confirmAuthorisedToSubmit: true,
        acknowledgeInformationUse: true,
        acknowledgeReviewApprovalResponsibility: true,
        acknowledgeTermsApply: true,
      },
    });

    expect(blockers.some((blocker) => blocker.stepKey === 'welcome_expectations')).toBe(true);
  });

  it('flags missing final submission acknowledgements', () => {
    const blockers = collectFinalSubmissionBlockers({
      submissionData: {
        enabledModules: {
          tenderReadiness: false,
          grants: false,
          marketplaceStrategy: false,
          outreachStrategy: false,
          quoteSupport: false,
        },
        sections: {},
      },
      acknowledgements: {},
    });

    expect(blockers.some((blocker) => blocker.stepKey === 'final_submission')).toBe(true);
  });
});
