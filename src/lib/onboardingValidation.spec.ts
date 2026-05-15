import { describe, expect, it } from 'vitest';
import { validateOnboardingSection } from './onboardingValidation';

const validMarketplaceLeads = {
  openMarketplacePlatforms: ['airtasker'],
  suitableServices: ['offer-1'],
  worthwhileLeadTypes: 'Small service jobs',
  minimumJobValue: '$500',
  urgentWorkCapacity: ['same-day'],
  jobsToIgnore: 'Anything outside service area',
  responseApprovalRequirement: 'yes',
  canSubmitUnderThreshold: 'no',
};

const marketplaceContext = (offerItems: any[] = []) => ({
  sections: {
    service_selection: {
      selectedServices: ['marketplace_leads'],
    },
    offer_menu: {
      offerItems,
    },
  },
});

const marketplaceSuitableServiceErrors = (suitableServices: string[], offerItems: any[] = []) => {
  const result = validateOnboardingSection(
    'service_modules',
    {
      marketplaceLeads: {
        ...validMarketplaceLeads,
        suitableServices,
      },
    },
    marketplaceContext(offerItems)
  );

  return result.missingFields.filter(
    (field) => field.fieldKey === 'marketplaceLeads.suitableServices'
  );
};

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
    expect(marketplaceSuitableServiceErrors(['__need_help_defining__'])).toHaveLength(0);
    expect(marketplaceSuitableServiceErrors(['__offer_menu_pending__'])).toHaveLength(0);
  });

  it('rejects empty marketplace suitable services when no offer items exist', () => {
    const errors = marketplaceSuitableServiceErrors([]);

    expect(errors).toHaveLength(1);
    expect(errors[0].fieldKey).toBe('marketplaceLeads.suitableServices');
  });

  it('rejects fallback-only marketplace suitable services when real offer items exist', () => {
    const errors = marketplaceSuitableServiceErrors(
      ['__need_help_defining__'],
      [{ id: 'offer-1', name: 'Test Offer' }]
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(
      '12C.2 Select at least one suitable service from your Offer Menu.'
    );
  });

  it('accepts a real Offer Menu item when real offer items exist', () => {
    expect(
      marketplaceSuitableServiceErrors(['offer-1'], [{ id: 'offer-1', name: 'Test Offer' }])
    ).toHaveLength(0);
  });

  it('accepts mixed fallback and real Offer Menu values because a real offer is selected', () => {
    expect(
      marketplaceSuitableServiceErrors(
        ['__need_help_defining__', 'offer-1'],
        [{ id: 'offer-1', name: 'Test Offer' }]
      )
    ).toHaveLength(0);
  });
});
