export interface OnboardingData {
  sections?: {
    pricing_commercial?: any;
    platform_setup?: any;
    service_modules?: any;
    workflow_rules?: any;
    document_upload_library?: any;
    authority_matrix?: any;
    [key: string]: any;
  };
  selectedServices?: string[];
  [key: string]: any;
}

export interface AuthorityConflict {
  id: string;
  severity: 'warning' | 'blocking';
  title: string;
  message: string;
  sourceSections: string[];
  recommendedAction: string;
}

const isYesOrMaybe = (value?: string) => value === 'yes' || value === 'maybe_to_be_discussed';

const parseAmount = (value?: string): number | null => {
  if (!value) return null;
  const cleaned = String(value).replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  if (!cleaned?.[0]) return null;
  const parsed = Number(cleaned[0]);
  return Number.isFinite(parsed) ? parsed : null;
};

const hasContact = (contact?: any) => Boolean(contact?.contactType || contact?.fullName || contact?.email);

const pushConflict = (conflicts: AuthorityConflict[], conflict: AuthorityConflict) => {
  conflicts.push(conflict);
};

export function detectAuthorityConflicts(allData: OnboardingData): AuthorityConflict[] {
  const conflicts: AuthorityConflict[] = [];
  const sections = allData?.sections || {};
  const pricing = sections.pricing_commercial || {};
  const platform = sections.platform_setup || {};
  const services = sections.service_modules || {};
  const workflow = sections.workflow_rules || {};
  const documents = sections.document_upload_library || {};
  const authority = sections.authority_matrix || {};

  const preferences = authority.authorityPreferences || {};
  const approvals = authority.approvalLevels || {};

  const pricingThreshold = parseAmount(pricing.maximumQuoteValueWithoutFinalApproval);
  const authorityThreshold = parseAmount(authority.approvalThresholdAmount);

  if (isYesOrMaybe(pricing.canPrepareDraftPricing) && preferences.draftResponses === 'not_authorised') {
    pushConflict(conflicts, {
      id: 'pricing-draft-vs-authority',
      severity: 'blocking',
      title: 'Draft pricing authority conflict',
      message: 'Section 9 permits draft pricing, but Section 15 marks drafting responses as not authorised.',
      sourceSections: ['Section 9', 'Section 15'],
      recommendedAction: 'Either change Section 9 draft pricing permissions or authorise drafting in Section 15.'
    });
  }

  if (isYesOrMaybe(pricing.canSubmitPricingUnderThreshold) && (preferences.submitQuoteRequests === 'not_authorised' || approvals.submittingQuotesUnderThreshold !== 'no_approval_needed')) {
    pushConflict(conflicts, {
      id: 'pricing-submit-vs-authority',
      severity: 'blocking',
      title: 'Pricing submission threshold conflict',
      message: 'Section 9 allows submitting pricing under threshold, but Section 15 requires approval or marks quote submission as not authorised.',
      sourceSections: ['Section 9', 'Section 15'],
      recommendedAction: 'Align Section 9 threshold submission with Section 15 quote submission authority and approval level.'
    });
  }

  if (pricingThreshold !== null && authorityThreshold !== null && pricingThreshold !== authorityThreshold) {
    pushConflict(conflicts, {
      id: 'pricing-threshold-mismatch',
      severity: 'warning',
      title: 'Threshold amount mismatch',
      message: `Section 9 threshold (${pricing.maximumQuoteValueWithoutFinalApproval}) differs from Section 15 threshold (${authority.approvalThresholdAmount}).`,
      sourceSections: ['Section 9', 'Section 15'],
      recommendedAction: 'Use one consistent threshold amount across Sections 9 and 15.'
    });
  }

  if (['yes', 'maybe_with_approval', 'depends_on_platform_and_cost'].includes(platform.paidPlatformWillingness) && approvals.paidPlatformRegistration === 'not_authorised') {
    pushConflict(conflicts, {
      id: 'platform-paid-registration-conflict', severity: 'blocking', title: 'Paid platform registration conflict',
      message: 'Section 10 indicates willingness to pay for platform fees, but Section 15 marks paid platform registration as not authorised.',
      sourceSections: ['Section 10', 'Section 15'], recommendedAction: 'Update paid platform approval level or adjust Section 10 platform willingness.'
    });
  }

  if (platform.preferredAccessMethod === 'delegated_access_where_possible' && (preferences.createOrUpdatePlatformProfiles === 'not_authorised' || preferences.assistWithRegistrations === 'not_authorised')) {
    pushConflict(conflicts, {
      id: 'platform-delegated-access-conflict', severity: 'warning', title: 'Delegated access vs authority conflict',
      message: 'Section 10 prefers delegated access, but Section 15 forbids profile updates and/or registrations.',
      sourceSections: ['Section 10', 'Section 15'], recommendedAction: 'Permit platform profile/registration actions in Section 15 or change access method in Section 10.'
    });
  }

  const marketplace = services.marketplaceLeads || {};
  if (isYesOrMaybe(marketplace.canSubmitUnderThreshold) && (preferences.submitMarketplaceResponses === 'not_authorised' || approvals.sendingMarketplaceResponses !== 'no_approval_needed')) {
    pushConflict(conflicts, {
      id: 'marketplace-submit-conflict', severity: 'blocking', title: 'Marketplace submission authority conflict',
      message: 'Section 12 marketplace settings allow under-threshold submissions, but Section 15 does not fully authorise marketplace responses without approval.',
      sourceSections: ['Section 12', 'Section 15'], recommendedAction: 'Align Section 12 under-threshold marketplace settings with Section 15 response authority.'
    });
  }

  if (marketplace.responseApprovalRequirement && approvals.sendingMarketplaceResponses && marketplace.responseApprovalRequirement !== approvals.sendingMarketplaceResponses) {
    pushConflict(conflicts, {
      id: 'marketplace-approval-level-mismatch', severity: 'warning', title: 'Marketplace approval level mismatch',
      message: 'Section 12 marketplace response approval requirement differs from Section 15 marketplace approval level.',
      sourceSections: ['Section 12', 'Section 15'], recommendedAction: 'Use the same marketplace approval requirement in both sections.'
    });
  }

  const quoteRequests = services.quoteRequests || {};
  if (isYesOrMaybe(quoteRequests.canSendQuotesUnderThreshold) && (preferences.submitQuoteRequests === 'not_authorised' || approvals.submittingQuotesUnderThreshold === 'final_written_approval_required' || approvals.submittingQuotesUnderThreshold === 'not_authorised')) {
    pushConflict(conflicts, {
      id: 'quote-submit-conflict', severity: 'blocking', title: 'Quote submission authority conflict',
      message: 'Section 12 quote settings allow under-threshold quote sending, but Section 15 forbids it or requires final written approval.',
      sourceSections: ['Section 12', 'Section 15'], recommendedAction: 'Revise quote submission permissions so Section 12 and Section 15 match.'
    });
  }

  if (quoteRequests.canPrepareDraftQuotes === 'yes' && (preferences.draftResponses === 'not_authorised' || approvals.providingPricing === 'not_authorised')) {
    pushConflict(conflicts, {
      id: 'quote-draft-pricing-conflict', severity: 'blocking', title: 'Quote drafting authority conflict',
      message: 'Section 12 allows preparing draft quotes, but Section 15 forbids drafting responses or providing pricing.',
      sourceSections: ['Section 12', 'Section 15'], recommendedAction: 'Authorise drafting/pricing in Section 15 or disable draft quote preparation in Section 12.'
    });
  }

  if (hasContact(workflow.finalSubmissionApprover) && preferences.submitTendersOrGrants === 'not_authorised') {
    pushConflict(conflicts, {
      id: 'workflow-final-submit-conflict', severity: 'blocking', title: 'Final submission approver conflict',
      message: 'Section 13 defines a final submission approver, but Section 15 marks tender/grant submission as not authorised.',
      sourceSections: ['Section 13', 'Section 15'], recommendedAction: 'Allow submissions in Section 15 or remove/clarify final submission approver in Section 13.'
    });
  }

  if ((workflow.draftReviewers || []).length > 0 && preferences.draftResponses === 'not_authorised') {
    pushConflict(conflicts, {
      id: 'workflow-draft-review-conflict', severity: 'warning', title: 'Draft reviewer conflict',
      message: 'Section 13 has draft reviewers, but Section 15 states drafting responses is not authorised.',
      sourceSections: ['Section 13', 'Section 15'], recommendedAction: 'Enable draft response authority or remove draft review workflow.'
    });
  }

  if (hasContact(workflow.emergencyApprovalContact) && preferences.submitTendersOrGrants === 'not_authorised' && preferences.submitQuoteRequests === 'not_authorised') {
    pushConflict(conflicts, {
      id: 'workflow-emergency-conflict', severity: 'warning', title: 'Emergency approval authority conflict',
      message: 'Section 13 lists an emergency approval contact, but Section 15 does not authorise submission actions.',
      sourceSections: ['Section 13', 'Section 15'], recommendedAction: 'Clarify which emergency actions are authorised in Section 15.'
    });
  }

  if (hasContact(workflow.finalSubmissionApprover) && hasContact(authority.finalSubmissionApprovalContact) && workflow.finalSubmissionApprover.contactType !== authority.finalSubmissionApprovalContact.contactType) {
    pushConflict(conflicts, {
      id: 'workflow-final-approver-mismatch', severity: 'warning', title: 'Final approver mismatch',
      message: 'Final submission approver in Section 13 differs from final submission approval contact in Section 15.',
      sourceSections: ['Section 13', 'Section 15'], recommendedAction: 'Nominate the same final approver contact in both sections.'
    });
  }

  if ((documents.confirmUseOfSuppliedDocuments === true || documents.confirmUseOfSuppliedDocuments === 'yes') && preferences.useSuppliedDocuments === 'not_authorised') {
    pushConflict(conflicts, {
      id: 'document-use-conflict', severity: 'blocking', title: 'Document use authority conflict',
      message: 'Section 14 confirms supplied documents can be used, but Section 15 marks document use as not authorised.',
      sourceSections: ['Section 14', 'Section 15'], recommendedAction: 'Permit supplied document use in Section 15 or revoke confirmation in Section 14.'
    });
  }

  if ((documents.enableReusableBidLibrary === true || documents.enableReusableBidLibrary === 'yes') && preferences.maintainReusableBidLibrary === 'not_authorised') {
    pushConflict(conflicts, {
      id: 'document-library-conflict', severity: 'warning', title: 'Reusable library authority conflict',
      message: 'Section 14 enables a reusable bid library, but Section 15 marks library maintenance as not authorised.',
      sourceSections: ['Section 14', 'Section 15'], recommendedAction: 'Align reusable bid library permissions between Sections 14 and 15.'
    });
  }

  return conflicts;
}
