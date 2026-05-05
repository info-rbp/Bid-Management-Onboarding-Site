import { describe, expect, it } from 'vitest';
import { detectAuthorityConflicts } from './conflict_detector';

const base = {
  sections: {
    pricing_commercial: {},
    platform_setup: {},
    service_modules: {},
    workflow_rules: {},
    document_upload_library: {},
    authority_matrix: {
      authorityPreferences: {},
      approvalLevels: {},
    },
  },
};

describe('detectAuthorityConflicts', () => {
  it('detects pricing threshold conflict', () => {
    const conflicts = detectAuthorityConflicts({
      ...base,
      sections: {
        ...base.sections,
        pricing_commercial: { maximumQuoteValueWithoutFinalApproval: '$1,000' },
        authority_matrix: { authorityPreferences: {}, approvalLevels: {}, approvalThresholdAmount: '$2,000' },
      },
    });

    expect(conflicts.some(c => c.id === 'pricing-threshold-mismatch')).toBe(true);
  });

  it('detects marketplace threshold conflict', () => {
    const conflicts = detectAuthorityConflicts({
      ...base,
      sections: {
        ...base.sections,
        service_modules: { marketplaceLeads: { canSubmitUnderThreshold: 'yes' } },
        authority_matrix: {
          authorityPreferences: { submitMarketplaceResponses: 'not_authorised' },
          approvalLevels: { sendingMarketplaceResponses: 'final_written_approval_required' },
        },
      },
    });
    expect(conflicts.some(c => c.id === 'marketplace-submit-conflict')).toBe(true);
  });

  it('detects quote threshold conflict', () => {
    const conflicts = detectAuthorityConflicts({
      ...base,
      sections: {
        ...base.sections,
        service_modules: { quoteRequests: { canSendQuotesUnderThreshold: 'yes' } },
        authority_matrix: {
          authorityPreferences: { submitQuoteRequests: 'authorised_after_approval' },
          approvalLevels: { submittingQuotesUnderThreshold: 'final_written_approval_required' },
        },
      },
    });
    expect(conflicts.some(c => c.id === 'quote-submit-conflict')).toBe(true);
  });

  it('detects workflow vs authority submit conflict', () => {
    const conflicts = detectAuthorityConflicts({
      ...base,
      sections: {
        ...base.sections,
        workflow_rules: { finalSubmissionApprover: { contactType: 'primary_contact' } },
        authority_matrix: {
          authorityPreferences: { submitTendersOrGrants: 'not_authorised' },
          approvalLevels: {},
        },
      },
    });
    expect(conflicts.some(c => c.id === 'workflow-final-submit-conflict')).toBe(true);
  });

  it('detects document use conflict', () => {
    const conflicts = detectAuthorityConflicts({
      ...base,
      sections: {
        ...base.sections,
        document_upload_library: { confirmUseOfSuppliedDocuments: true },
        authority_matrix: {
          authorityPreferences: { useSuppliedDocuments: 'not_authorised' },
          approvalLevels: {},
        },
      },
    });
    expect(conflicts.some(c => c.id === 'document-use-conflict')).toBe(true);
  });

  it('returns no conflicts on happy path', () => {
    const conflicts = detectAuthorityConflicts({
      ...base,
      sections: {
        pricing_commercial: { canPrepareDraftPricing: 'no', canSubmitPricingUnderThreshold: 'no' },
        platform_setup: { paidPlatformWillingness: 'no' },
        service_modules: {
          marketplaceLeads: { canSubmitUnderThreshold: 'no' },
          quoteRequests: { canPrepareDraftQuotes: 'no', canSendQuotesUnderThreshold: 'no' },
        },
        workflow_rules: {},
        document_upload_library: { confirmUseOfSuppliedDocuments: false },
        authority_matrix: {
          authorityPreferences: {
            draftResponses: 'authorised',
            submitQuoteRequests: 'authorised',
            submitMarketplaceResponses: 'authorised',
            submitTendersOrGrants: 'authorised',
            useSuppliedDocuments: 'authorised',
          },
          approvalLevels: {
            submittingQuotesUnderThreshold: 'no_approval_needed',
            sendingMarketplaceResponses: 'no_approval_needed',
            paidPlatformRegistration: 'no_approval_needed',
          },
        },
      },
    });

    expect(conflicts).toHaveLength(0);
  });
});
