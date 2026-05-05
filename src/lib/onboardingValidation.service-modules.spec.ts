import { describe, expect, it } from 'vitest';
import { validateOnboardingSection } from './onboardingValidation';

const buildQuoteRequestsData = (quotePrerequisites?: string) => ({
  quoteRequests: {
    quoteRequestTypes: 'Residential maintenance quotes',
    informationNeededToQuote: 'Site address, scope, and timeline',
    quotePrerequisites,
    standardQuoteAssumptions: 'Safe site access and standard business hours',
    standardQuoteExclusions: 'Major remediation and specialist reports',
    quoteValidityPeriod: '30 days',
    quoteApprover: { contactType: 'primary' },
    canPrepareDraftQuotes: 'yes',
    canSendQuotesUnderThreshold: 'no',
  },
});

const allDataWithQuoteRequests = {
  sections: {
    service_selection: {
      selectedServices: ['quote_requests'],
    },
  },
};

describe('service_modules quote request prerequisites validation', () => {
  it('fails when quotePrerequisites is missing for active quote request support', () => {
    const result = validateOnboardingSection(
      'service_modules',
      buildQuoteRequestsData(),
      allDataWithQuoteRequests
    );

    expect(result.isValid).toBe(false);

    expect(result.missingFields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fieldLabel: '12E.3 Prerequisites',
        }),
      ])
    );
  });

  it('passes 12E.3 requirement when quotePrerequisites is provided', () => {
    const result = validateOnboardingSection(
      'service_modules',
      buildQuoteRequestsData('Inspection photos and client brief are required'),
      allDataWithQuoteRequests
    );

    expect(result.missingFields).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fieldLabel: '12E.3 Prerequisites',
        }),
      ])
    );
  });
});