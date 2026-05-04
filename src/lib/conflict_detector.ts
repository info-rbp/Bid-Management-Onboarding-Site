export interface OnboardingData {
  sections: {
    workflow_rules?: any;
    authority_matrix?: any;
    service_modules?: any;
  };
}

export function detectAuthorityConflicts(allData: OnboardingData): string[] {
  const conflicts: string[] = [];
  const workflow = allData?.sections?.workflow_rules || {};
  const authority = allData?.sections?.authority_matrix || {};
  const services = allData?.sections?.service_modules || {};

  // CONFLICT 1: Final Approver set, but submitting is forbidden.
  if (
    (workflow.finalSubmissionApprover?.contactType) &&
    authority.authorityPreferences?.submitTendersOrGrants === 'not_authorised'
  ) {
    conflicts.push(
      "Workflow has a 'Final Submission Approver' set, but the Authority Matrix forbids submitting tenders or grants. Please clarify if Bid Manager is responsible for submissions."
    );
  }

  // CONFLICT 2: Draft reviewers assigned, but drafting is forbidden.
  if (
    (workflow.draftReviewers?.length > 0) &&
    authority.authorityPreferences?.draftResponses === 'not_authorised'
  ) {
    conflicts.push(
      "Workflow specifies 'Draft Reviewers', but the Authority Matrix forbids drafting responses. Please clarify if Bid Manager is responsible for drafting."
    );
  }

  // CONFLICT 3: Emergency contact assigned, but submitting is forbidden.
  if (
    (workflow.emergencyApprovalContact?.contactType) &&
    authority.authorityPreferences?.submitTendersOrGrants === 'not_authorised'
  ) {
    conflicts.push(
      "Workflow defines an 'Emergency Approval Contact', but the Authority Matrix forbids submitting tenders or grants. Please review the emergency workflow's purpose."
    );
  }

  // CONFLICT 4: Quote service is on, but submitting quotes is forbidden.
  if (
    (services.quoteRequests?.enabled) &&
    authority.authorityPreferences?.submitQuoteRequests === 'not_authorised'
  ) {
    conflicts.push(
      "The service selection includes managing quote requests, but the Authority Matrix forbids submitting quotes. Please align the service scope and authority."
    );
  }
  
  // CONFLICT 5: Marketplace service is on, but submitting is forbidden.
  if (
    (services.marketplaceLeads?.enabled) &&
    authority.authorityPreferences?.submitMarketplaceResponses === 'not_authorised'
  ) {
    conflicts.push(
      "The service selection includes managing marketplace leads, but the Authority Matrix forbids submitting marketplace responses. Please align the service scope and authority."
    );
  }

  return conflicts;
}
