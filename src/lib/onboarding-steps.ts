import {
  Activity,
  Anchor,
  Award,
  BookUser,
  Building2,
  Check,
  ClipboardList,
  FileText,
  Flag,
  GanttChartSquare,
  Globe,
  Goal,
  HeartHandshake,
  Info,
  LayoutGrid,
  Lightbulb,
  MessageCircleQuestion,
  Paperclip,
  PocketKnife,
  Presentation,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Siren,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";

export interface OnboardingStep {
  key: string;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
  description: string;
  required: boolean;
  isConditional?: boolean;
  moduleKey?: keyof EnabledModules;
  route: string;
}

export interface EnabledModules {
  tenderReadiness: boolean;
  grants: boolean;
  marketplaceStrategy: boolean;
  outreachStrategy: boolean;
  quoteSupport: boolean;
}

export const allSteps: OnboardingStep[] = [
  // Phase 1: Core Setup
  {
    key: "welcome_expectations",
    title: "Welcome & Expectations",
    shortTitle: "Welcome",
    icon: HeartHandshake,
    description: "Understand the onboarding process and what to expect.",
    required: true,
    route: "/onboarding/welcome_expectations",
  },
  {
    key: "business_snapshot",
    title: "Business Snapshot",
    shortTitle: "Snapshot",
    icon: Building2,
    description: "Core details about your organization's scale and structure.",
    required: true,
    route: "/onboarding/business_snapshot",
  },
    {
    key: "service_selection",
    title: "Service Selection & Engagement Scope",
    shortTitle: "Services",
    icon: Sparkles,
    description: "Select the services you want Bid Manager to support you with.",
    required: true,
    route: "/onboarding/service_selection",
  },
  // Phase 2: Strategic Foundation
  {
    key: "business_profile",
    title: "Business Profile, Positioning and Value Proposition",
    shortTitle: "Profile",
    icon: BookUser,
    description: "Tell us the story of your business for compelling narratives.",
    required: true,
    route: "/onboarding/business_profile",
  },
    {
    key: "offer_menu",
    title: "Services, Products and Offer Menu",
    shortTitle: "Offers",
    icon: GanttChartSquare,
    description: "List your key products and services.",
    required: true,
    route: "/onboarding/offer_menu",
  },
    {
    key: "team_capacity",
    title: "Team, Capacity and Delivery Model",
    shortTitle: "Team",
    icon: Users,
    description: "Help us understand who is delivering the work.",
    required: true,
    route: "/onboarding/team_capacity",
  },
    {
    key: "proof_evidence",
    title: "Proof, Case Studies, Reviews and Evidence",
    shortTitle: "Proof",
    icon: Award,
    description: "Tenders are won on proof. List your strongest examples.",
    required: true,
    route: "/onboarding/proof_evidence",
  },
   {
    key: "goals_strategy",
    title: "Goals, Opportunity Strategy and Bid/No-Bid Rules",
    shortTitle: "Goals",
    icon: Goal,
    description: "Where are we heading?",
    required: true,
    route: "/onboarding/goals_strategy",
  },
  {
    key: "pricing_commercial",
    title: "Pricing, Quoting and Commercial Rules",
    shortTitle: "Pricing",
    icon: Scale,
    description: "Standardise your pricing approach.",
    required: true,
    route: "/onboarding/pricing_commercial",
  },
  {
    key: "platform_setup",
    title: "Platform and Channel Setup",
    shortTitle: "Platforms",
    icon: Globe,
    description: "Tell us which platforms you already use.",
    required: true,
    route: "/onboarding/platform_setup",
  },
  {
    key: "compliance_insurance",
    title: "Compliance, Insurance and Readiness",
    shortTitle: "Compliance",
    icon: ShieldCheck,
    description: "A readiness check for critical compliance documents.",
    required: true,
    route: "/onboarding/compliance_insurance",
  },
  {
    key: "service_modules",
    title: "Service Modules",
    shortTitle: "Service Modules",
    icon: LayoutGrid,
    description: "Service-specific requirements and readiness.",
    required: true,
    route: "/onboarding/service_modules",
  },
  {
    key: "workflow_rules",
    title: "Communication, Review and Workflow Rules",
    shortTitle: "Workflow",
    icon: Workflow,
    description: "Set your preferences for communication and approvals.",
    required: true,
    route: "/onboarding/workflow_rules",
  },
  {
    key: "document_upload_library",
    title: "Document Upload Library",
    shortTitle: "Documents",
    icon: Paperclip,
    description: "Upload documents for your bid library.",
    required: true,
    route: "/onboarding/document_upload_library",
  },
  {
    key: "authority_matrix",
    title: "Authority Matrix",
    shortTitle: "Authority",
    icon: Flag,
    description: "Confirm what Bid Manager can do on your behalf.",
    required: true,
    route: "/onboarding/authority_matrix",
  },
  {
    key: "final_submission",
    title: "Final Submission",
    shortTitle: "Submission",
    icon: Check,
    description: "Final review and submission of your onboarding pack.",
    required: true,
    route: "/onboarding/final_submission",
  },
];

export function getVisibleOnboardingSteps(
  enabledModules?: EnabledModules
): OnboardingStep[] {
  return allSteps;
}

export function deriveServiceModules(selectedServices: string[]) {
  return {
    tenderReadiness:
      selectedServices.includes("government_tenders") ||
      selectedServices.includes("private_tenders") ||
      selectedServices.includes("panel_supplier_registrations"),

    grants:
      selectedServices.includes("grants") ||
      selectedServices.includes("unsure_recommend"),

    marketplaceStrategy:
      selectedServices.includes("marketplace_leads"),

    outreachStrategy:
      selectedServices.includes("direct_proposals"),

    quoteSupport:
      selectedServices.includes("quote_requests") ||
      selectedServices.includes("marketplace_leads") ||
      selectedServices.includes("direct_proposals")
  };
}

export function deriveProfileUseCases(selectedServices: string[]) {
  const includes = (service: string) => selectedServices.includes(service);

  return {
    companyProfile:
      true,

    proposalIntroduction:
      includes("government_tenders") ||
      includes("private_tenders") ||
      includes("direct_proposals") ||
      includes("unsure_recommend"),

    capabilityStatementWording:
      includes("government_tenders") ||
      includes("private_tenders") ||
      includes("panel_supplier_registrations") ||
      includes("unsure_recommend"),

    marketplaceBio:
      includes("marketplace_leads") ||
      includes("unsure_recommend"),

    tenderSupplierProfile:
      includes("government_tenders") ||
      includes("private_tenders") ||
      includes("panel_supplier_registrations") ||
      includes("unsure_recommend"),

    grantApplicantProfile:
      includes("grants") ||
      includes("unsure_recommend"),

    directProposalPositioning:
      includes("direct_proposals") ||
      includes("unsure_recommend"),

    quoteRequestBusinessSummary:
      includes("quote_requests") ||
      includes("marketplace_leads") ||
      includes("direct_proposals") ||
      includes("unsure_recommend")
  };
}

export function deriveOfferReadiness(offers: any) {
  const offerItems = offers.offerItems || [];

  const hasStructuredServiceItems =
    offerItems.length >= 1 &&
    Boolean(
      offerItems[0].name &&
      offerItems[0].description &&
      offerItems[0].idealCustomer &&
      offerItems[0].inclusions &&
      offerItems[0].deliveryMethod?.length &&
      offerItems[0].deliveryTimeframe &&
      offerItems[0].priceOrPricingMethod &&
      offerItems[0].suitableOpportunityChannels?.length
    );

  const hasPricingGuidance =
    offerItems.some((item: any) => item.priceOrPricingMethod) ||
    (offers.existingPackages || []).some((pkg: any) => pkg.price);

  const hasFixedPricePotential =
    offers.fixedPricePackagePotential === "yes" ||
    (offers.existingPackages || []).length > 0;

  const hasMarketplaceReadyOffers =
    offerItems.some((item: any) => item.suitableOpportunityChannels?.includes("marketplace_leads"));

  const hasTenderReadyOffers =
    offerItems.some((item: any) =>
      item.suitableOpportunityChannels?.includes("government_tenders") ||
      item.suitableOpportunityChannels?.includes("private_tenders") ||
      item.suitableOpportunityChannels?.includes("panel_supplier_registrations")
    );

  const hasGrantFundedOfferIdeas =
    offerItems.some((item: any) => item.suitableOpportunityChannels?.includes("grants")) ||
    offers.offerMenu?.grantFunded?.status !== "not_applicable";

  const hasQuoteReadyInformation =
    offerItems.some((item: any) => item.suitableOpportunityChannels?.includes("quote_requests")) &&
    Boolean(offers.clientResponsibilities);

  const hasServiceRestrictions =
    Boolean(offers.servicesToAvoidPromoting || offers.serviceTermsAssumptionsConditions);

  return {
    hasStructuredServiceItems,
    hasPricingGuidance,
    hasFixedPricePotential,
    hasMarketplaceReadyOffers,
    hasTenderReadyOffers,
    hasGrantFundedOfferIdeas,
    hasQuoteReadyInformation,
    hasServiceRestrictions
  };
}

export function deriveTeamReadiness(team: any) {
  const keyPeople = team.keyPeople || [];
  const deliveryPartners = team.deliveryPartners || [];

  const hasKeyPeople =
    keyPeople.length >= 1 &&
    Boolean(keyPeople[0].fullName && keyPeople[0].roleTitle && keyPeople[0].responsibilities);

  const hasStaffProfiles =
    team.staffProfilesAvailable === "yes" ||
    team.staffProfilesAvailable === "some";

  const needsStaffProfileUpdates =
    team.staffProfilesAvailable === "no" ||
    team.staffProfilesAvailable === "need_updating";

  const hasCredentialsListed =
    Boolean((team.teamCredentials || []).length) ||
    keyPeople.some((person: any) => person.qualifications || person.licencesTicketsChecks);

  const usesPartners =
    team.usesDeliveryPartners === "yes" ||
    team.usesDeliveryPartners === "sometimes";

  const partnerDetailsRequired = usesPartners;

  const partnerDetailsComplete =
    !partnerDetailsRequired ||
    deliveryPartners.some((partner: any) => partner.businessName && partner.servicesProvided);

  const hasCapacityStatement = Boolean(team.currentCapacity);

  const canScale =
    team.canScaleForLargerContract === "yes" ||
    team.canScaleForLargerContract === "maybe_with_subcontractors_or_new_staff";

  const scalingRiskFlag =
    team.canScaleForLargerContract === "no" ||
    team.canScaleForLargerContract === "unsure";

  const hasContinuityPlan = Boolean(team.keyPersonUnavailablePlan);

  const hasQualityProcess = Boolean(team.qualityChecksAndSupervision);

  const hasDeliveryMethodology =
    Boolean(team.standardDeliveryProcess?.summary) ||
    (team.standardDeliveryProcess?.steps || []).length >= 3;

  return {
    hasKeyPeople,
    hasStaffProfiles,
    needsStaffProfileUpdates,
    hasCredentialsListed,
    usesPartners,
    partnerDetailsRequired,
    partnerDetailsComplete,
    hasCapacityStatement,
    canScale,
    scalingRiskFlag,
    hasContinuityPlan,
    hasQualityProcess,
    hasDeliveryMethodology
  };
}

export function deriveProofReadiness(proof: any) {
  const caseStudies = proof.caseStudies || [];

  const completedCaseStudies = caseStudies.filter((cs: any) =>
    cs.projectTitle &&
    cs.clientCustomerType?.length &&
    cs.whatWasDelivered &&
    cs.problemSolvedAndOutcome
  );

  const hasCaseStudyExamples =
    proof.caseStudyExamplesAvailable === "yes" ||
    proof.caseStudyExamplesAvailable === "examples_need_help";

  const caseStudyDetailsRequired = hasCaseStudyExamples;

  const caseStudyDetailsComplete =
    !caseStudyDetailsRequired || completedCaseStudies.length >= 1;

  const hasMultipleCaseStudies = completedCaseStudies.length >= 2;

  const hasEvidenceAssetsListed =
    caseStudies.some((cs: any) => cs.availableEvidence?.length);

  const hasRefereePotential =
    caseStudies.some((cs: any) =>
      cs.refereePermission === "yes" ||
      cs.refereePermission === "maybe_with_approval"
    );

  const hasTestimonialsOrReviews =
    proof.testimonialsReviewsReferencesAvailable === "yes" ||
    proof.testimonialsReviewsReferencesAvailable === "some_need_organising";

  const reviewsNeedOrganising =
    proof.testimonialsReviewsReferencesAvailable === "some_need_organising";

  const hasReviewLocations =
    (proof.reviewLocations || []).length > 0 &&
    !(proof.reviewLocations.length === 1 && proof.reviewLocations[0] === "not_applicable");

  const restrictions = (proof.evidenceUsageRestrictions || "").trim().toLowerCase();

  const hasUsageRestrictions =
    restrictions.length > 0 &&
    restrictions !== "none known" &&
    restrictions !== "none";

  const marketplaceProofReady =
    hasTestimonialsOrReviews ||
    hasReviewLocations ||
    caseStudies.some((cs: any) =>
      cs.availableEvidence?.includes("photos") ||
      cs.availableEvidence?.includes("online_review") ||
      cs.availableEvidence?.includes("client_testimonial") ||
      cs.availableEvidence?.includes("before_after_evidence")
    );

  const tenderProofReady =
    completedCaseStudies.length >= 1 &&
    (hasEvidenceAssetsListed || hasRefereePotential);

  const grantProofReady =
    completedCaseStudies.some((cs: any) => cs.problemSolvedAndOutcome);

  const directProposalProofReady =
    completedCaseStudies.length >= 1 || hasTestimonialsOrReviews;

  const quoteProofReady =
    completedCaseStudies.length >= 1 || marketplaceProofReady;

  return {
    hasCaseStudyExamples,
    caseStudyDetailsRequired,
    caseStudyDetailsComplete,
    hasMultipleCaseStudies,
    hasEvidenceAssetsListed,
    hasRefereePotential,
    hasTestimonialsOrReviews,
    reviewsNeedOrganising,
    hasReviewLocations,
    hasUsageRestrictions,
    marketplaceProofReady,
    tenderProofReady,
    grantProofReady,
    directProposalProofReady,
    quoteProofReady
  };
}

export function deriveStrategyReadiness(goals: any) {
  const priorities = goals.opportunityFactorPriorities || {};

  const requiredPriorityKeys = [
    "contractValue",
    "location",
    "profitability",
    "buyerRelationshipPotential",
    "strategicFit",
    "easeOfDelivery",
    "complianceRequirements",
    "deadline",
    "competitionLevel",
    "reviewPotential",
    "cashflowSpeed"
  ];

  const prioritiesComplete = requiredPriorityKeys.every(
    key => ["low", "medium", "high"].includes(priorities[key])
  );

  const hasClearGoals =
    (goals.mainGoals || []).length > 0 &&
    Boolean(goals.success12Months);

  const hasTargetChannels =
    (goals.interestedOpportunityChannels || []).length > 0;

  const hasValueThresholds =
    Boolean(
      goals.minimumWorthwhileValue &&
      goals.idealOpportunityValueRange &&
      goals.largestRealisticOpportunity
    );

  const hasPreferredTargets = Boolean(goals.preferredTargets);

  const hasAvoidanceRules = Boolean(goals.targetsToAvoid);

  const hasAutomaticNoRules = Boolean(goals.automaticNoRules);

  const allowsStrategicLowMarginWork =
    goals.lowerMarginStrategicWork === "yes" ||
    goals.lowerMarginStrategicWork === "maybe_with_approval";

  const lowMarginRequiresApproval =
    goals.lowerMarginStrategicWork === "maybe_with_approval";

  const supportsFastLeadGeneration =
    goals.growthPreference === "fast_lead_generation" ||
    goals.growthPreference === "both";

  const supportsProcurementPositioning =
    goals.growthPreference === "long_term_procurement_positioning" ||
    goals.growthPreference === "both";

  const opportunityCriteriaReady =
    hasTargetChannels &&
    hasValueThresholds &&
    hasPreferredTargets &&
    hasAutomaticNoRules;

  const recommendationRulesReady =
    opportunityCriteriaReady && prioritiesComplete;

  return {
    hasClearGoals,
    hasTargetChannels,
    hasValueThresholds,
    hasPreferredTargets,
    hasAvoidanceRules,
    hasAutomaticNoRules,
    allowsStrategicLowMarginWork,
    lowMarginRequiresApproval,
    supportsFastLeadGeneration,
    supportsProcurementPositioning,
    opportunityCriteriaReady,
    recommendationRulesReady
  };
}

export function derivePricingReadiness(pricing: any, authority?: any) {
  const hasPricingMethod =
    (pricing.pricingMethods || []).length > 0;

  const hasPricingGuidance =
    Boolean(pricing.standardRatesPackagesGuidance);

  const hasStructuredPricingItems =
    (pricing.pricingItems || []).some((item: any) =>
      item.itemName && item.amountOrRange
    );

  const hasProfitMarginGuidance =
    Boolean(pricing.minimumRequiredProfitMargin);

  const discountRequiresApproval =
    pricing.discountPolicy === "only_with_approval" ||
    pricing.discountPolicy === "depends_on_opportunity";

  const hasAdditionalFeesGuidance =
    Boolean(pricing.additionalFees);

  const hasPaymentTerms =
    Boolean(pricing.paymentTerms);

  const hasPricingApprover =
    Boolean(pricing.pricingApprover?.contactType) &&
    (
      pricing.pricingApprover.contactType !== "custom" ||
      Boolean(
        pricing.pricingApprover.fullName &&
        (pricing.pricingApprover.email || pricing.pricingApprover.phone)
      )
    );

  const canDraftPricing =
    pricing.canPrepareDraftPricing === "yes" ||
    pricing.canPrepareDraftPricing === "yes_but_requires_approval_before_submission";

  const draftPricingRequiresApproval =
    pricing.canPrepareDraftPricing === "yes_but_requires_approval_before_submission";

  const thresholdSubmissionRequested =
    pricing.canSubmitPricingUnderThreshold === "yes" ||
    pricing.canSubmitPricingUnderThreshold === "maybe_to_be_discussed";

  const thresholdSubmissionConfirmedByPricing =
    pricing.canSubmitPricingUnderThreshold === "yes" &&
    Boolean(pricing.maximumQuoteValueWithoutFinalApproval);

  const thresholdSubmissionNeedsAuthorityConfirmation =
    thresholdSubmissionRequested;

  const hasCommercialTerms =
    Boolean(pricing.pricingRulesCommercialTermsAssumptions);

  const pricingReadyForDrafting =
    hasPricingMethod &&
    hasPricingGuidance &&
    hasAdditionalFeesGuidance &&
    hasPaymentTerms &&
    canDraftPricing;

  const pricingReadyForSubmission =
    pricingReadyForDrafting &&
    hasPricingApprover &&
    Boolean(authority?.pricingSubmissionAuthorityConfirmed);

  return {
    hasPricingMethod,
    hasPricingGuidance,
    hasStructuredPricingItems,
    hasProfitMarginGuidance,
    discountRequiresApproval,
    hasAdditionalFeesGuidance,
    hasPaymentTerms,
    hasPricingApprover,
    canDraftPricing,
    draftPricingRequiresApproval,
    thresholdSubmissionRequested,
    thresholdSubmissionConfirmedByPricing,
    thresholdSubmissionNeedsAuthorityConfirmation,
    hasCommercialTerms,
    pricingReadyForDrafting,
    pricingReadyForSubmission
  };
}

export function derivePlatformReadiness(platforms: any) {
  const existing = platforms.existingAccounts || [];
  const setup = platforms.setupOrImprove || [];
  const allPlatforms = [...existing, ...setup];

  const marketplaceValues = [
    "airtasker",
    "bark",
    "serviceseeking",
    "oneflare",
    "hipages",
    "upwork",
    "freelancer",
    "fiverr"
  ];

  const tenderValues = [
    "tenderlink",
    "austender",
    "local_council_portals",
    "state_government_tender_portals",
    "corporate_supplier_portals"
  ];

  const hasExistingPlatforms =
    existing.some((value: string) => value !== "none" && value !== "unsure");

  const hasNoExistingPlatforms =
    existing.includes("none");

  const existingPlatformsUnknown =
    existing.includes("unsure");

  const setupPrioritiesSelected =
    setup.length > 0;

  const marketplacePlatformsSelected =
    allPlatforms.some((value: string) => marketplaceValues.includes(value));

  const tenderPlatformsSelected =
    allPlatforms.some((value: string) => tenderValues.includes(value));

  const grantPlatformsSelected =
    allPlatforms.includes("grantconnect");

  const directOutreachPlatformsSelected =
    allPlatforms.includes("linkedin");

  const accessControllerIdentified =
    Boolean(platforms.accessController?.notes) ||
    Boolean(
      platforms.accessController?.contactType &&
      platforms.accessController.contactType !== "unknown"
    );

  const delegatedAccessPreferred =
    platforms.preferredAccessMethod === "delegated_access_where_possible";

  const clientSubmissionPreferred =
    platforms.preferredAccessMethod === "client_submits_internally_using_bid_manager_documents";

  const screenSharePreferred =
    platforms.preferredAccessMethod === "screen_share_when_needed";

  const paidPlatformsAllowed =
    platforms.paidPlatformWillingness === "yes";

  const paidPlatformsRequireApproval =
    platforms.paidPlatformWillingness === "maybe_with_approval" ||
    platforms.paidPlatformWillingness === "depends_on_platform_and_cost";

  const hasPlatformBudget =
    Boolean(platforms.monthlyPlatformBudget);

  const hasAlertRecipients =
    (platforms.alertRecipients || []).length > 0;

  const hasProfileInstructions =
    Boolean(platforms.profileToneOfferContactProcess);

  const hasPlatformRestrictions =
    Boolean(platforms.platformRestrictions);

  const platformSetupReady =
    setupPrioritiesSelected &&
    accessControllerIdentified &&
    Boolean(platforms.preferredAccessMethod) &&
    hasAlertRecipients;

  return {
    hasExistingPlatforms,
    hasNoExistingPlatforms,
    existingPlatformsUnknown,
    setupPrioritiesSelected,
    marketplacePlatformsSelected,
    tenderPlatformsSelected,
    grantPlatformsSelected,
    directOutreachPlatformsSelected,
    accessControllerIdentified,
    delegatedAccessPreferred,
    clientSubmissionPreferred,
    screenSharePreferred,
    paidPlatformsAllowed,
    paidPlatformsRequireApproval,
    hasPlatformBudget,
    hasAlertRecipients,
    hasProfileInstructions,
    hasPlatformRestrictions,
    platformSetupReady
  };
}

export function deriveComplianceReadiness(compliance: any) {
  const checklist = compliance.documentReadinessChecklist || {};
  const values = Object.values(checklist);

  const checklistComplete =
    values.length >= 20 && values.every(Boolean);

  const countStatus = (status: string) =>
    values.filter(value => value === status).length;

  const complianceIssuesText =
    (compliance.legalRegulatoryInsuranceEligibilityIssues || "").trim().toLowerCase();

  const hasComplianceIssues =
    complianceIssuesText.length > 0 &&
    complianceIssuesText !== "none known" &&
    complianceIssuesText !== "none";

  const policySelections = compliance.writtenPoliciesProcedures || [];

  const hasWrittenPolicies =
    policySelections.some((value: string) => value !== "none" && value !== "unsure");

  const hasNoWrittenPolicies =
    policySelections.includes("none");

  const policiesUnknown =
    policySelections.includes("unsure");

  const insurancePolicies = compliance.insurancePolicies || [];

  const hasCriticalInsurance =
    checklist.publicLiability === "available_current" ||
    checklist.publicLiability === "needs_updating" ||
    insurancePolicies.some((policy: any) =>
      (policy.policyType || "").toLowerCase().includes("public liability")
    );

  const insuranceNeedsReview =
    [
      checklist.publicLiability,
      checklist.professionalIndemnity,
      checklist.workersCompensation,
      checklist.cyberInsurance,
      checklist.motorVehicleInsurance
    ].some(value =>
      value === "needs_updating" ||
      value === "do_not_have" ||
      value === "unsure"
    );

  const hasLicenceOrCertificationInfo =
    (compliance.currentLicencesRegistrationsCertifications || []).length > 0 ||
    checklist.industryLicences !== "not_applicable";

  const hasKnownComplianceGaps =
    Boolean(compliance.knownComplianceGaps);

  const hasPracticalProcesses =
    Boolean(compliance.practicalProcesses);

  const tenderComplianceReady =
    checklist.publicLiability === "available_current" &&
    (
      checklist.whsPolicy === "available_current" ||
      checklist.whsPolicy === "needs_updating" ||
      checklist.qualityPolicy === "available_current" ||
      checklist.qualityPolicy === "needs_updating"
    ) &&
    hasPracticalProcesses;

  const grantComplianceReady =
    checklist.abnAcnRecords === "available_current" &&
    hasPracticalProcesses &&
    !hasComplianceIssues;

  const marketplaceComplianceReady =
    (
      checklist.publicLiability === "available_current" ||
      checklist.publicLiability === "needs_updating"
    ) &&
    (
      checklist.industryLicences !== "do_not_have" ||
      checklist.industryLicences === "not_applicable"
    );

  const supplierRegistrationReady =
    checklist.abnAcnRecords === "available_current" &&
    (
      checklist.publicLiability === "available_current" ||
      checklist.publicLiability === "needs_updating"
    ) &&
    (
      checklist.capabilityStatement === "available_current" ||
      checklist.capabilityStatement === "needs_updating"
    );

  return {
    checklistComplete,
    hasCriticalInsurance,
    insuranceNeedsReview,
    hasLicenceOrCertificationInfo,
    hasKnownComplianceGaps,
    hasWrittenPolicies,
    hasNoWrittenPolicies,
    policiesUnknown,
    hasPracticalProcesses,
    hasComplianceIssues,
    tenderComplianceReady,
    grantComplianceReady,
    marketplaceComplianceReady,
    supplierRegistrationReady,
    complianceGapCount: countStatus("do_not_have"),
    updateRequiredCount: countStatus("needs_updating"),
    unsureCount: countStatus("unsure"),
    notApplicableCount: countStatus("not_applicable")
  };
}

export function deriveActiveServiceModules(selectedServices: string[]) {
  return {
    tenderSupplierReadiness:
      selectedServices.includes("government_tenders") ||
      selectedServices.includes("private_tenders") ||
      selectedServices.includes("panel_supplier_registrations"),

    grants:
      selectedServices.includes("grants") ||
      selectedServices.includes("unsure_recommend"),

    marketplaceLeads:
      selectedServices.includes("marketplace_leads"),

    directProposalOutreach:
      selectedServices.includes("direct_proposals"),

    quoteRequests:
      selectedServices.includes("quote_requests") ||
      selectedServices.includes("marketplace_leads") ||
      selectedServices.includes("direct_proposals")
  };
}

export function deriveServiceModuleReadiness(serviceModules: any) {
  const active = serviceModules.activeModules || {};

  const activeModuleCount =
    Object.values(active).filter(Boolean).length;

  const tenderSupplierReady =
    Boolean(active.tenderSupplierReadiness && serviceModules.tenderSupplierReadiness?.moduleStatus?.isComplete);

  const grantProjectReady =
    Boolean(
      active.grants &&
      serviceModules.grants?.moduleStatus?.isComplete &&
      serviceModules.grants?.interestedInGrantSupport !== "no"
    );

  const marketplaceStrategyReady =
    Boolean(active.marketplaceLeads && serviceModules.marketplaceLeads?.moduleStatus?.isComplete);

  const directOutreachReady =
    Boolean(
      active.directProposalOutreach &&
      serviceModules.directProposalOutreach?.moduleStatus?.isComplete &&
      serviceModules.directProposalOutreach?.interestedInDirectBusinessDevelopment !== "no"
    );

  const quoteSupportReady =
    Boolean(active.quoteRequests && serviceModules.quoteRequests?.moduleStatus?.isComplete);

  const authorityConfirmationRequired =
    serviceModules.marketplaceLeads?.canSubmitUnderThreshold === "yes" ||
    serviceModules.marketplaceLeads?.canSubmitUnderThreshold === "maybe_to_be_discussed" ||
    serviceModules.quoteRequests?.canSendQuotesUnderThreshold === "yes" ||
    serviceModules.quoteRequests?.canSendQuotesUnderThreshold === "maybe_to_be_discussed" ||
    Boolean(serviceModules.tenderSupplierReadiness?.submissionApprover) ||
    Boolean(serviceModules.tenderSupplierReadiness?.contractTermsApprover) ||
    serviceModules.quoteRequests?.canPrepareDraftQuotes === "yes" ||
    serviceModules.quoteRequests?.canPrepareDraftQuotes === "yes_but_all_quotes_must_be_reviewed";

  return {
    activeModuleCount,
    tenderSupplierModuleActive: Boolean(active.tenderSupplierReadiness),
    grantModuleActive: Boolean(active.grants),
    marketplaceModuleActive: Boolean(active.marketplaceLeads),
    directProposalModuleActive: Boolean(active.directProposalOutreach),
    quoteRequestModuleActive: Boolean(active.quoteRequests),

    tenderSupplierReady,
    grantProjectReady,
    marketplaceStrategyReady,
    directOutreachReady,
    quoteSupportReady,

    authorityConfirmationRequired,
    documentUploadsRecommended: [],
    approvalWarnings: []
  };
}

export function deriveWorkflowReadiness(workflow: any) {
  const hasCommunicationMethods =
    (workflow.preferredCommunicationMethods || []).length > 0;

  const hasResponseTime =
    Boolean(workflow.activeOpportunityResponseTime);

  const responseDelayRisk =
    workflow.activeOpportunityResponseTime === "two_to_three_business_days" ||
    workflow.activeOpportunityResponseTime === "depends_on_request";

  const hasDraftReviewers =
    (workflow.draftReviewers || []).length > 0;

  const hasFinalApprover =
    Boolean(workflow.finalSubmissionApprover?.contactType);

  const hasDraftReviewWindow =
    Boolean(workflow.draftReviewTimeNeeded);

  const hasFinalApprovalDeadline =
    Boolean(workflow.finalApprovalDeadlinePreference);

  const hasEmergencyApprovalContact =
    Boolean(workflow.emergencyApprovalContact?.contactType);

  const hasDifficultResponseTimes =
    Boolean(workflow.difficultResponseTimes);

  const hasReviewFeedbackPreference =
    (workflow.reviewFeedbackPreferences || []).length > 0;

  const workflowReadyForActiveOpportunities =
    hasCommunicationMethods &&
    hasResponseTime &&
    hasDraftReviewers &&
    hasFinalApprover &&
    hasDraftReviewWindow &&
    hasFinalApprovalDeadline &&
    hasReviewFeedbackPreference;

  const urgentWorkflowReady =
    hasEmergencyApprovalContact &&
    (
      workflow.activeOpportunityResponseTime === "same_day" ||
      workflow.activeOpportunityResponseTime === "within_24_hours"
    );

  const authorityAlignmentRequired = true;

  let reviewDeadlineRiskLevel: "low" | "medium" | "high" = "low";

  if (
    workflow.activeOpportunityResponseTime === "two_to_three_business_days" ||
    workflow.draftReviewTimeNeeded === "more_than_three_business_days"
  ) {
    reviewDeadlineRiskLevel = "high";
  } else if (
    workflow.activeOpportunityResponseTime === "within_48_hours" ||
    workflow.draftReviewTimeNeeded === "three_business_days" ||
    workflow.finalApprovalDeadlinePreference === "depends_on_opportunity"
  ) {
    reviewDeadlineRiskLevel = "medium";
  }

  return {
    hasCommunicationMethods,
    hasResponseTime,
    responseDelayRisk,
    hasDraftReviewers,
    hasFinalApprover,
    hasDraftReviewWindow,
    hasFinalApprovalDeadline,
    hasEmergencyApprovalContact,
    hasDifficultResponseTimes,
    hasReviewFeedbackPreference,
    workflowReadyForActiveOpportunities,
    urgentWorkflowReady,
    authorityAlignmentRequired,
    reviewDeadlineRiskLevel
  };
}

export function deriveAuthorityReadiness(authority: any, relatedSections?: any) {
  const authorityValues = Object.values(authority.authorityPreferences || {});
  const approvalValues = Object.values(authority.approvalLevels || {});

  const authorityMatrixComplete =
    authorityValues.length >= 14 && authorityValues.every(Boolean);

  const approvalMatrixComplete =
    approvalValues.length >= 12 && approvalValues.every(Boolean);

  const writtenRestrictionsText =
    (authority.actionsNeverWithoutWrittenApproval || "").trim().toLowerCase();

  const hasWrittenApprovalRestrictions =
    writtenRestrictionsText.length > 0 &&
    writtenRestrictionsText !== "none known" &&
    writtenRestrictionsText !== "none";

  const hasRestrictedClaims =
    Boolean(authority.restrictedWordsClaimsGuaranteesCommitments);

  const hasFinalSubmissionApprover =
    Boolean(authority.finalSubmissionApprovalContact?.contactType);

  const hasFinalPricingApprover =
    Boolean(authority.finalPricingCommercialApprovalContact?.contactType);

  const thresholdAuthorityRequested =
    relatedSections?.pricing?.canSubmitPricingUnderThreshold === "yes" ||
    relatedSections?.pricing?.canSubmitPricingUnderThreshold === "maybe_to_be_discussed" ||
    relatedSections?.serviceModules?.marketplaceLeads?.canSubmitUnderThreshold === "yes" ||
    relatedSections?.serviceModules?.marketplaceLeads?.canSubmitUnderThreshold === "maybe_to_be_discussed" ||
    relatedSections?.serviceModules?.quoteRequests?.canSendQuotesUnderThreshold === "yes" ||
    relatedSections?.serviceModules?.quoteRequests?.canSendQuotesUnderThreshold === "maybe_to_be_discussed";

  const thresholdText =
    (authority.maximumValueWithoutFinalWrittenApproval || "").trim().toLowerCase();

  const thresholdAuthorityConfirmed =
    Boolean(thresholdText) &&
    thresholdText !== "none" &&
    authority.approvalLevels?.submittingQuotesUnderThreshold !== "not_authorised";

  const thresholdAuthorityNotAuthorised =
    authority.approvalLevels?.submittingQuotesUnderThreshold === "not_authorised" ||
    !thresholdText ||
    thresholdText === "none";

  const hasUnsureAuthorityItems =
    authorityValues.includes("unsure");

  const hasNotAuthorisedItems =
    authorityValues.includes("not_authorised") ||
    approvalValues.includes("not_authorised");

  const finalWrittenApprovalRequiredForSubmissions =
    authority.approvalLevels?.submittingTenderOrGrantApplications === "final_written_approval_required" ||
    authority.approvalLevels?.sendingMarketplaceResponses === "final_written_approval_required";

  const finalWrittenApprovalRequiredForPricing =
    authority.approvalLevels?.providingPricing === "final_written_approval_required";

  const paidPlatformApprovalRequired =
    authority.approvalLevels?.paidPlatformRegistration === "draft_approval_required" ||
    authority.approvalLevels?.paidPlatformRegistration === "final_written_approval_required";

  const buyerFunderContactApprovalRequired =
    authority.approvalLevels?.contactingBuyersFunders === "draft_approval_required" ||
    authority.approvalLevels?.contactingBuyersFunders === "final_written_approval_required";

  const documentUseRestricted =
    authority.authorityPreferences?.useSuppliedDocuments === "authorised_after_approval" ||
    authority.authorityPreferences?.useSuppliedDocuments === "not_authorised" ||
    authority.authorityPreferences?.useSuppliedDocuments === "unsure";

  const reusableBidLibraryAuthorised =
    authority.authorityPreferences?.maintainReusableBidLibrary === "authorised";

  const conflictWarnings = [];

  if (
    thresholdAuthorityRequested &&
    thresholdAuthorityNotAuthorised
  ) {
    conflictWarnings.push(
      "Earlier sections requested threshold authority, but Section 15 does not confirm it."
    );
  }

  if (
    relatedSections?.platforms?.paidPlatformWillingness === "yes" &&
    (
      authority.approvalLevels?.paidPlatformRegistration === "final_written_approval_required" ||
      authority.approvalLevels?.paidPlatformRegistration === "not_authorised"
    )
  ) {
    conflictWarnings.push(
      "Platform section allows paid platforms, but Authority requires approval or does not authorise paid platform registration."
    );
  }

  if (
    relatedSections?.workflow?.finalSubmissionApprover?.contactType &&
    authority.finalSubmissionApprovalContact?.contactType &&
    relatedSections.workflow.finalSubmissionApprover.contactType !== authority.finalSubmissionApprovalContact.contactType
  ) {
    conflictWarnings.push(
      "Workflow final approver differs from Authority final submission approver."
    );
  }

  const authorityConflictsDetected =
    conflictWarnings.length > 0;

  const authorityReadyForOperations =
    authorityMatrixComplete &&
    approvalMatrixComplete &&
    hasFinalSubmissionApprover &&
    hasFinalPricingApprover &&
    !authorityConflictsDetected;

  return {
    authorityMatrixComplete,
    approvalMatrixComplete,
    hasWrittenApprovalRestrictions,
    hasRestrictedClaims,
    hasFinalSubmissionApprover,
    hasFinalPricingApprover,
    thresholdAuthorityRequested,
    thresholdAuthorityConfirmed,
    thresholdAuthorityNotAuthorised,
    hasUnsureAuthorityItems,
    hasNotAuthorisedItems,
    finalWrittenApprovalRequiredForSubmissions,
    finalWrittenApprovalRequiredForPricing,
    paidPlatformApprovalRequired,
    buyerFunderContactApprovalRequired,
    documentUseRestricted,
    reusableBidLibraryAuthorised,
    authorityReadyForOperations,
    authorityConflictsDetected,
    conflictWarnings
  };
}

export function deriveDocumentReadiness(documentRequirements: any[], documents: any[], selectedServices: string[]) {
  const countByStatus = (status: string) =>
    documentRequirements.filter(req => req.status === status).length;

  const hasCategory = (category: string) =>
    documents.some(doc =>
      doc.documentCategory === category &&
      doc.status !== "do_not_use"
    );

  const hasBusinessProfileDocs =
    hasCategory("business_profile_capability_brochures");

  const hasBrandAssets =
    hasCategory("logos_brand_assets_style_guides");

  const hasInsuranceCertificates =
    hasCategory("insurance_certificates");

  const hasLicenceCertificationDocs =
    hasCategory("licences_registrations_certifications_checks");

  const hasPoliciesProcedures =
    hasCategory("policies_and_procedures");

  const hasStaffDocuments =
    hasCategory("staff_cvs_bios_qualifications_tickets");

  const hasProofDocuments =
    hasCategory("project_examples_case_studies_photos_reports_testimonials");

  const hasPreviousSubmissionDocuments =
    hasCategory("previous_tenders_grants_proposals_quotes_feedback");

  const hasPricingDocuments =
    hasCategory("pricing_schedules_rate_cards_package_lists_budget_templates");

  const hasGrantDocuments =
    hasCategory("grant_project_documents_budgets_supplier_quotes_support_letters");

  const acceptableFollowUpStatuses = [
    "received",
    "approved_for_use",
    "will_provide_later",
    "need_help_creating",
    "not_applicable"
  ];

  const requirementsHandled =
    documentRequirements.every(req =>
      req.priority !== "required" ||
      acceptableFollowUpStatuses.includes(req.status)
    );

  const tenderSelected =
    selectedServices.includes("government_tenders") ||
    selectedServices.includes("private_tenders") ||
    selectedServices.includes("panel_supplier_registrations");

  const grantSelected =
    selectedServices.includes("grants");

  const marketplaceSelected =
    selectedServices.includes("marketplace_leads");

  const directProposalSelected =
    selectedServices.includes("direct_proposals");

  const quoteSelected =
    selectedServices.includes("quote_requests");

  const documentGapsExist =
    documentRequirements.some(req =>
      ["missing", "will_provide_later", "need_help_creating"].includes(req.status)
    );

  const documentReviewRequired =
    documents.some(doc => doc.status === "needs_review" || doc.approvedForUse !== true);

  return {
    totalRequirements: documentRequirements.length,
    receivedCount:
      countByStatus("received") + countByStatus("approved_for_use"),
    missingCount: countByStatus("missing"),
    willProvideLaterCount: countByStatus("will_provide_later"),
    needHelpCreatingCount: countByStatus("need_help_creating"),
    notApplicableCount: countByStatus("not_applicable"),
    needsReviewCount: countByStatus("needs_review"),

    hasBusinessProfileDocs,
    hasBrandAssets,
    hasInsuranceCertificates,
    hasLicenceCertificationDocs,
    hasPoliciesProcedures,
    hasStaffDocuments,
    hasProofDocuments,
    hasPreviousSubmissionDocuments,
    hasPricingDocuments,
    hasGrantDocuments,

    tenderDocumentReady:
      !tenderSelected ||
      hasInsuranceCertificates ||
      hasProofDocuments ||
      hasPreviousSubmissionDocuments ||
      requirementsHandled,

    grantDocumentReady:
      !grantSelected ||
      hasGrantDocuments ||
      requirementsHandled,

    marketplaceDocumentReady:
      !marketplaceSelected ||
      hasProofDocuments ||
      hasBrandAssets ||
      requirementsHandled,

    directProposalDocumentReady:
      !directProposalSelected ||
      hasBusinessProfileDocs ||
      hasBrandAssets ||
      hasProofDocuments ||
      requirementsHandled,

    quoteDocumentReady:
      !quoteSelected ||
      hasPricingDocuments ||
      requirementsHandled,

    documentGapsExist,
    documentReviewRequired
  };
}
