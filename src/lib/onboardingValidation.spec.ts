import { describe, expect, it } from 'vitest';
import { validateOnboardingSection } from './onboardingValidation';

describe('validateOnboardingSection', () => {
  it('requires all final submission acknowledgements', () => {
    const result = validateOnboardingSection('final_submission', {
      acknowledgements: {
        confirmInformationAccurate: true,
      },
    });

    expect(result.isValid).toBe(false);
    expect(result.missingFields.map((field) => field.fieldKey)).toContain(
      'acknowledgements.confirmAuthorisedToSubmit'
    );
    expect(result.missingFields.map((field) => field.fieldKey)).toContain(
      'acknowledgements.acknowledgeTermsApply'
    );
  });

  it('only validates the active service modules', () => {
    const result = validateOnboardingSection(
      'service_modules',
      {},
      {
        sections: {
          service_selection: {
            selectedServices: ['grants'],
          },
          offer_menu: {
            offerItems: [],
          },
        },
      }
    );

    expect(result.missingFields.map((field) => field.fieldKey)).toContain(
      'grants.interestedInGrantSupport'
    );
    expect(result.missingFields.map((field) => field.fieldKey)).not.toContain(
      'tenderSupplierReadiness.previousTenderSupplierExperience'
    );
  });

  it('allows the marketplace fallback selection when no offer items exist', () => {
    const baseContext = {
      sections: {
        service_selection: {
          selectedServices: ['marketplace_leads'],
        },
        offer_menu: {
          offerItems: [],
        },
      },
    };

    const missingSelection = validateOnboardingSection(
      'service_modules',
      {
        marketplaceLeads: {
          openMarketplacePlatforms: ['airtasker'],
          worthwhileLeadTypes: 'Small local jobs',
          minimumJobValue: '$500',
          urgentWorkCapacity: ['same-day'],
          jobsToIgnore: 'Weekend work',
          responseApprovalRequirement: 'yes',
          canSubmitUnderThreshold: 'no',
        },
      },
      baseContext
    );

    expect(missingSelection.missingFields.map((field) => field.fieldKey)).toContain(
      'marketplaceLeads.suitableServices'
    );

    const validFallback = validateOnboardingSection(
      'service_modules',
      {
        marketplaceLeads: {
          openMarketplacePlatforms: ['airtasker'],
          suitableServices: ['__need_help_defining__'],
          worthwhileLeadTypes: 'Small local jobs',
          minimumJobValue: '$500',
          urgentWorkCapacity: ['same-day'],
          jobsToIgnore: 'Weekend work',
          responseApprovalRequirement: 'yes',
          canSubmitUnderThreshold: 'no',
        },
      },
      baseContext
    );

    expect(validFallback.missingFields.map((field) => field.fieldKey)).not.toContain(
      'marketplaceLeads.suitableServices'
    );
  });
});
