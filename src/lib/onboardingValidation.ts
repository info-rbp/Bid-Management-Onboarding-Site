
export type ValidationError = {
  fieldKey: string;
  fieldLabel: string;
  message: string;
  section: string;
  anchorId?: string;
};

export type ValidationResult = {
  isValid: boolean;
  missingFields: ValidationError[];
  invalidFields: ValidationError[];
  warningFields: ValidationError[];
};

export const snapshotFieldLabels: Record<string, string> = {
  registeredBusinessName: "Registered business name",
  tradingName: "Trading name",
  abn: "ABN",
  acn: "ACN",
  businessStructure: "Business structure",
  yearStarted: "Year business started",
  registeredBusinessAddress: "Registered business address",
  operatingAddress: "Main operating address",
  postalAddress: "Postal address",
  businessPhone: "Business phone number",
  businessEmail: "Business email address",
  website: "Website",
  socialMediaLinks: "Business social media links",
  "primaryContact.fullName": "Primary contact full name",
  "primaryContact.roleTitle": "Primary contact role/title",
  "primaryContact.email": "Primary contact email address",
  "primaryContact.phone": "Primary contact phone number",
  "secondaryContact.fullName": "Secondary contact full name",
  "secondaryContact.roleTitle": "Secondary contact role/title",
  "secondaryContact.email": "Secondary contact email address",
  "secondaryContact.phone": "Secondary contact phone number",
  "secondaryContact.usage": "Secondary contact usage",
  "secondaryContact.otherUsage": "Other secondary contact usage",
  finalDecisionMaker: "Final decision-maker",
  complianceContact: "Compliance document contact",
  pricingCommercialContact: "Pricing/commercial approval contact",
  urgentApprovalContact: "Urgent approval contact"
};

const toError = (fieldKey: string, message: string, section = 'general', anchorId?: string): ValidationError => ({
  fieldKey,
  fieldLabel: snapshotFieldLabels[fieldKey] || fieldKey,
  message,
  section,
  anchorId: anchorId || fieldKey
});

const isEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
const digitsOnly = (value: string) => (value || '').replace(/\D/g, '');

function isContactReferenceComplete(contact: any) {
  if (!contact) return false;
  if (contact.contactType === "primary") return true;
  if (contact.contactType === "secondary") return true;
  if (contact.contactType === "custom") {
    return Boolean(contact.fullName && contact.roleTitle && (contact.email || contact.phone));
  }
  return false;
}

export function validateOnboardingSection(stepId: string, data: any, allData?: any): ValidationResult {
  let missingFields: string[] = [];
  const result: ValidationResult = { isValid: true, missingFields: [], invalidFields: [], warningFields: [] };

  switch (stepId) {
    case 'welcome_expectations': {
      const fields = ['terms', 'authority', 'infoUse', 'accuracy', 'saveAndReturn', 'passwordWarning'];
      fields.forEach(f => { if (!data[f]) missingFields.push(f) });
      break;
    }
    case 'business_snapshot': {
      const section = 'snapshot';
      const addMissing = (k: string, m: string) => result.missingFields.push(toError(k, m, section, k));
      const addInvalid = (k: string, m: string) => result.invalidFields.push(toError(k, m, section, k));
      const required = ['registeredBusinessName','businessStructure','yearStarted','registeredBusinessAddress','businessPhone','businessEmail'];
      required.forEach((k) => { if (!data?.[k]) addMissing(k, `${snapshotFieldLabels[k]} is required.`); });
      if (!data?.abn) addMissing('abn', 'ABN is required.');
      else if (digitsOnly(data.abn).length !== 11) addInvalid('abn', 'ABN must contain 11 digits.');
      if (data?.acn && digitsOnly(data.acn).length !== 9) addInvalid('acn', 'ACN must contain 9 digits.');
      if (data?.businessEmail && !isEmail(data.businessEmail)) addInvalid('businessEmail', 'Business email address must be a valid email.');
      const primary = data?.primaryContact || {};
      const secondary = data?.secondaryContact || {};
      ['fullName','roleTitle','email','phone'].forEach((f) => { if (!primary[f]) addMissing(`primaryContact.${f}`, `${snapshotFieldLabels[`primaryContact.${f}`]} is required.`); });
      ['fullName','roleTitle','email','phone'].forEach((f) => { if (!secondary[f]) addMissing(`secondaryContact.${f}`, `${snapshotFieldLabels[`secondaryContact.${f}`]} is required.`); });
      if (primary.email && !isEmail(primary.email)) addInvalid('primaryContact.email', 'Primary contact email address must be a valid email.');
      if (secondary.email && !isEmail(secondary.email)) addInvalid('secondaryContact.email', 'Secondary contact email address must be a valid email.');
      if (!Array.isArray(secondary.usage) || secondary.usage.length === 0) addMissing('secondaryContact.usage', 'Select at least one use for the secondary contact.');
      if (Array.isArray(secondary.usage) && secondary.usage.includes('other') && !secondary.otherUsage) addMissing('secondaryContact.otherUsage', 'Please specify the other secondary contact usage.');
      ['finalDecisionMaker','complianceContact','pricingCommercialContact','urgentApprovalContact'].forEach((k) => {
        if (!data?.[k]) addMissing(k, `${snapshotFieldLabels[k]} is required.`);
        else if (!isContactReferenceComplete(data[k])) addInvalid(k, `${snapshotFieldLabels[k]} is incomplete.`);
      });
      result.isValid = result.missingFields.length === 0 && result.invalidFields.length === 0;
      return result;
    }
    case 'service_selection': {
        if (!data.selectedServices || data.selectedServices.length === 0) missingFields.push('selectedServices');
        if (!data.highestPriorityService) missingFields.push('highestPriorityService');
        if (!data.serviceImportanceReason) missingFields.push('serviceImportanceReason');
        if (!data.engagementLevel) missingFields.push('engagementLevel');
        if (!data.opportunityRecommendationConsent) missingFields.push('opportunityRecommendationConsent');
        break;
    }
    case 'business_profile': {
        const requiredFields = [
            'plainEnglishDescription',
            'originStory',
            'problemSolved',
            'idealClients',
            'clientOutcomes',
            'clientsChooseUsBecause',
            'competitiveDifference'
        ];
        requiredFields.forEach(f => { if (!data[f]) missingFields.push(f) });
        
        if (!data.keyMessages || !Array.isArray(data.keyMessages) || data.keyMessages.length !== 3 || data.keyMessages.some((m: string) => !m || m.trim() === '')) {
            missingFields.push('keyMessages (exactly 3 required)');
        }
        break;
    }
    case 'offer_menu': {
        const section = 'offer_menu';
        const addMissing = (fieldKey: string, fieldLabel: string, message: string, anchorId: string) => {
          result.missingFields.push({ fieldKey, fieldLabel, message, section, anchorId });
        };

        if (!data.mainServicesProducts) addMissing('mainServicesProducts', 'Main services or products', 'Main services or products is required.', 'offer-main-services-products');
        if (!data.strategicOrProfitableServices) addMissing('strategicOrProfitableServices', 'Strategic or profitable services', 'Strategic or profitable services is required.', 'offer-strategic-services');

        const offerItems = data.offerItems || [];
        if (offerItems.length === 0) {
          addMissing('offerItems', 'Service/product offer card', 'Add at least one service or product offer card.', 'offer-item-1-name');
        } else {
          const first = offerItems[0] || {};
          if (!first.name) addMissing('offerItems.0.name', 'Offer item 1 name', 'Offer item 1 name is required.', 'offer-item-1-name');
          if (!first.description) addMissing('offerItems.0.description', 'Offer item 1 description', 'Offer item 1 description is required.', 'offer-item-1-description');
          if (!first.idealCustomer) addMissing('offerItems.0.idealCustomer', 'Offer item 1 ideal customer', 'Offer item 1 ideal customer is required.', 'offer-item-1-ideal-customer');
          if (!first.inclusions) addMissing('offerItems.0.inclusions', 'Offer item 1 inclusions', 'Offer item 1 inclusions is required.', 'offer-item-1-inclusions');
          if (!first.deliveryMethod || first.deliveryMethod.length === 0) addMissing('offerItems.0.deliveryMethod', 'Offer item 1 delivery method', 'Select at least one delivery method for offer item 1.', 'offer-item-1-delivery-method');
          if (!first.deliveryTimeframe) addMissing('offerItems.0.deliveryTimeframe', 'Offer item 1 delivery timeframe', 'Offer item 1 delivery timeframe is required.', 'offer-item-1-delivery-timeframe');
          if (!first.priceOrPricingMethod) addMissing('offerItems.0.priceOrPricingMethod', 'Offer item 1 pricing method', 'Offer item 1 price or pricing method is required.', 'offer-item-1-price-method');
          if (!first.suitableOpportunityChannels || first.suitableOpportunityChannels.length === 0) addMissing('offerItems.0.suitableOpportunityChannels', 'Offer item 1 channels', 'Select at least one suitable opportunity channel for offer item 1.', 'offer-item-1-channels');
        }

        if (!data.fixedPricePackagePotential) addMissing('fixedPricePackagePotential', 'Fixed-price package potential', 'Select whether services can be packaged into fixed-price offers.', 'offer-fixed-price-potential');

        const menuKeys = ['entryLevel', 'core', 'premium', 'emergency', 'retainer', 'grantFunded', 'governmentReady'];
        menuKeys.forEach((key) => {
          const row = data.offerMenu?.[key];
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase());
          if (!row) {
            addMissing(`offerMenu.${key}`, `${label} offer row`, `${label} offer row is required.`, `offer-menu-${key}`);
          } else if (row.status !== 'help_needed' && row.status !== 'not_applicable' && !row.offerNameOrIdea && !row.description) {
            addMissing(`offerMenu.${key}.details`, `${label} offer details`, `Provide a name or description for ${label}.`, `offer-menu-${key}`);
          }
        });

        if (!data.generalDeliverySpeed) addMissing('generalDeliverySpeed', 'General delivery speed', 'General delivery speed is required.', 'offer-general-delivery-speed');
        if (!data.businessDeliveryModes || data.businessDeliveryModes.length === 0) addMissing('businessDeliveryModes', 'Business delivery modes', 'Select at least one business delivery mode.', 'offer-business-delivery-modes');
        if (!data.serviceAreas) addMissing('serviceAreas', 'Service areas', 'Service areas is required.', 'offer-service-areas');
        if (!data.clientResponsibilities) addMissing('clientResponsibilities', 'Client responsibilities', 'Client responsibilities is required.', 'offer-client-responsibilities');

        result.isValid = result.missingFields.length === 0 && result.invalidFields.length === 0;
        return result;
    }
    case 'team_capacity': {
        const keyPeople = data.keyPeople || [];
        if (keyPeople.length === 0) {
            missingFields.push('at least one key person');
        } else {
            const first = keyPeople[0];
            if (!first.fullName) missingFields.push('Key Person 1 Full Name');
            if (!first.roleTitle) missingFields.push('Key Person 1 Role');
            if (!first.responsibilities) missingFields.push('Key Person 1 Responsibilities');
        }

        if (!data.staffProfilesAvailable) missingFields.push('staffProfilesAvailable');
        if (!data.usesDeliveryPartners) missingFields.push('usesDeliveryPartners');
        
        if (data.usesDeliveryPartners === 'yes' || data.usesDeliveryPartners === 'sometimes') {
            const partners = data.deliveryPartners || [];
            if (partners.length === 0) {
                missingFields.push('at least one delivery partner');
            } else if (!partners.some((p: any) => p.businessName && p.servicesProvided)) {
                missingFields.push('completed delivery partner details');
            }
        }

        if (!data.currentCapacity) missingFields.push('currentCapacity');
        if (!data.canScaleForLargerContract) missingFields.push('canScaleForLargerContract');
        if (!data.keyPersonUnavailablePlan) missingFields.push('keyPersonUnavailablePlan');
        if (!data.qualityChecksAndSupervision) missingFields.push('qualityChecksAndSupervision');
        
        const process = data.standardDeliveryProcess;
        if (!process || !process.steps || process.steps.length < 3) {
            missingFields.push('delivery process (at least 3 steps)');
        }
        break;
    }
    case 'proof_evidence': {
        if (!data.caseStudyExamplesAvailable) missingFields.push('caseStudyExamplesAvailable');
        if (!data.numberOfStrongExamples) missingFields.push('numberOfStrongExamples');
        
        const hasExamples = data.caseStudyExamplesAvailable === 'yes' || data.caseStudyExamplesAvailable === 'examples_need_help';
        if (hasExamples) {
            const caseStudies = data.caseStudies || [];
            if (caseStudies.length === 0) {
                missingFields.push('at least one case study');
            } else {
                const first = caseStudies[0];
                if (!first.projectTitle) missingFields.push('Case Study 1 Title');
                if (!first.clientCustomerType || first.clientCustomerType.length === 0) missingFields.push('Case Study 1 Client Type');
                if (!first.whatWasDelivered) missingFields.push('Case Study 1 Delivery');
                if (!first.problemSolvedAndOutcome) missingFields.push('Case Study 1 Outcome');
            }
        }

        if (!data.testimonialsReviewsReferencesAvailable) missingFields.push('testimonialsReviewsReferencesAvailable');
        if (!data.evidenceUsageRestrictions) missingFields.push('evidenceUsageRestrictions');
        break;
    }
    case 'goals_strategy': {
        if (!data.mainGoals || data.mainGoals.length === 0) missingFields.push('mainGoals');
        if (data.mainGoals?.includes('other') && !data.otherGoal) missingFields.push('otherGoal');
        if (!data.success12Months) missingFields.push('success12Months');
        if (!data.interestedOpportunityChannels || data.interestedOpportunityChannels.length === 0) missingFields.push('interestedOpportunityChannels');
        if (data.interestedOpportunityChannels?.includes('other') && !data.otherOpportunityChannel) missingFields.push('otherOpportunityChannel');
        if (!data.growthPreference) missingFields.push('growthPreference');
        if (!data.minimumWorthwhileValue) missingFields.push('minimumWorthwhileValue');
        if (!data.idealOpportunityValueRange) missingFields.push('idealOpportunityValueRange');
        if (!data.largestRealisticOpportunity) missingFields.push('largestRealisticOpportunity');
        if (!data.preferredTargets) missingFields.push('preferredTargets');
        if (!data.lowerMarginStrategicWork) missingFields.push('lowerMarginStrategicWork');
        if (!data.automaticNoRules) missingFields.push('automaticNoRules');
        
        const priorities = data.opportunityFactorPriorities || {};
        const factorKeys = ["contractValue", "location", "profitability", "buyerRelationshipPotential", "strategicFit", "easeOfDelivery", "complianceRequirements", "deadline", "competitionLevel", "reviewPotential", "cashflowSpeed"];
        factorKeys.forEach(k => {
          if (!priorities[k]) missingFields.push(`Factor Priority: ${k}`);
        });
        break;
    }
    case 'pricing_commercial': {
        if (!data.pricingMethods || data.pricingMethods.length === 0) missingFields.push('pricingMethods');
        if (data.pricingMethods?.includes('other') && !data.otherPricingMethod) missingFields.push('otherPricingMethod');
        if (!data.standardRatesPackagesGuidance) missingFields.push('standardRatesPackagesGuidance');
        if (!data.discountPolicy) missingFields.push('discountPolicy');
        if (!data.additionalFees) missingFields.push('additionalFees');
        if (!data.paymentTerms) missingFields.push('paymentTerms');
        if (!data.pricingApprover || !data.pricingApprover.contactType) missingFields.push('pricingApprover');
        if (data.pricingApprover?.contactType === 'custom' && (!data.pricingApprover.fullName || (!data.pricingApprover.email && !data.pricingApprover.phone))) {
          missingFields.push('custom approver details');
        }
        if (!data.canPrepareDraftPricing) missingFields.push('canPrepareDraftPricing');
        if (!data.canSubmitPricingUnderThreshold) missingFields.push('canSubmitPricingUnderThreshold');
        if ((data.canSubmitPricingUnderThreshold === 'yes' || data.canSubmitPricingUnderThreshold === 'maybe_to_be_discussed') && !data.maximumQuoteValueWithoutFinalApproval) {
          missingFields.push('maximumQuoteValue');
        }
        break;
    }
    case 'platform_setup': {
        if (!data.existingAccounts || data.existingAccounts.length === 0) missingFields.push('existingAccounts');
        if (data.existingAccounts?.includes('other') && !data.otherExistingPlatform) missingFields.push('otherExistingPlatform');
        if (!data.setupOrImprove || data.setupOrImprove.length === 0) missingFields.push('setupOrImprove');
        if (data.setupOrImprove?.includes('other') && !data.otherSetupOrImprovePlatform) missingFields.push('otherSetupOrImprovePlatform');
        if (!data.accessController || (!data.accessController.notes && !data.accessController.contactType)) missingFields.push('accessController');
        if (!data.preferredAccessMethod) missingFields.push('preferredAccessMethod');
        if (!data.paidPlatformWillingness) missingFields.push('paidPlatformWillingness');
        if (!data.alertRecipients || data.alertRecipients.length === 0) missingFields.push('alertRecipients');
        break;
    }
    case 'compliance_insurance': {
        const checklist = data.documentReadinessChecklist || {};
        const requiredRows = [
            "abnAcnRecords", "publicLiability", "professionalIndemnity", "workersCompensation", 
            "cyberInsurance", "motorVehicleInsurance", "industryLicences", "staffTickets", 
            "checks", "isoCertifications", "whsPolicy", "qualityPolicy", "environmentalPolicy", 
            "privacyPolicy", "riskProcess", "complaintsProcess", "businessContinuityPlan", 
            "modernSlaveryStatement", "capabilityStatement", "pricingSchedule"
        ];
        requiredRows.forEach(row => {
          if (!checklist[row]) missingFields.push(`Checklist: ${row}`);
        });

        const hasInsurance = (data.insurancePolicies || []).length > 0 || data.insurancePolicyNotes;
        if (!hasInsurance) missingFields.push('insurancePolicies or notes');

        if (!data.writtenPoliciesProcedures || data.writtenPoliciesProcedures.length === 0) missingFields.push('writtenPoliciesProcedures');
        if (!data.practicalProcesses) missingFields.push('practicalProcesses');
        if (!data.legalRegulatoryInsuranceEligibilityIssues) missingFields.push('legalRegulatoryInsuranceEligibilityIssues');
        break;
    }
    case 'service_modules': {
        const selectedServices = allData?.sections?.service_selection?.selectedServices || [];
        
        // 12A Tender & Supplier
        if (selectedServices.includes('government_tenders') || selectedServices.includes('private_tenders') || selectedServices.includes('panel_supplier_registrations')) {
            const m = data.tenderSupplierReadiness || {};
            if (!m.previousTenderSupplierExperience) missingFields.push('12A.1 Experience');
            if ((m.previousTenderSupplierExperience === 'yes' || m.previousTenderSupplierExperience === 'some') && !m.previousPortalsUsed) missingFields.push('12A.2 Portals');
            if (!m.targetBuyers) missingFields.push('12A.3 Target Buyers');
            if (!m.realisticContractSizes) missingFields.push('12A.4 Contract Sizes');
            if (!m.preparedForComplianceRequirements) missingFields.push('12A.5 Compliance Preparedness');
            if (!m.previousMaterialsAvailable) missingFields.push('12A.6 Previous Materials');
            if (!m.submissionApprover?.contactType) missingFields.push('12A.8 Submission Approver');
            if (!m.contractTermsApprover?.contactType) missingFields.push('12A.9 Contract Terms Approver');
        }

        // 12B Grants
        if (selectedServices.includes('grants') || selectedServices.includes('unsure_recommend')) {
            const m = data.grants || {};
            if (!m.interestedInGrantSupport) missingFields.push('12B.1 Grant Interest');
            if (m.interestedInGrantSupport === 'yes' || m.interestedInGrantSupport === 'maybe_please_advise') {
                if (!m.fundingUse) missingFields.push('12B.2 Funding Use');
                if (!m.projectNeed) missingFields.push('12B.3 Project Need');
                if (!m.projectBeneficiaries) missingFields.push('12B.4 Beneficiaries');
                if (!m.projectLocation) missingFields.push('12B.5 Location');
                if (!m.projectTiming) missingFields.push('12B.6 Timing');
                if (!m.estimatedTotalProjectCost) missingFields.push('12B.7 Project Cost');
                if (!m.fundingAmountNeeded) missingFields.push('12B.8 Funding Amount');
                if (!m.clientContribution) missingFields.push('12B.9 Contribution');
                if (!m.projectOutcomes) missingFields.push('12B.10 Outcomes');
                if (!m.afterFundingPlan) missingFields.push('12B.14 Future Plan');
            }
        }

        // 12C Marketplace Leads
        if (selectedServices.includes('marketplace_leads')) {
            const m = data.marketplaceLeads || {};
            if (!m.openMarketplacePlatforms || m.openMarketplacePlatforms.length === 0) missingFields.push('12C.1 Platforms');
            if (!m.suitableServices || m.suitableServices.length === 0) missingFields.push('12C.2 Suitable Services');
            if (!m.worthwhileLeadTypes) missingFields.push('12C.3 Lead Types');
            if (!m.minimumJobValue) missingFields.push('12C.4 Min Value');
            if (!m.urgentWorkCapacity || m.urgentWorkCapacity.length === 0) missingFields.push('12C.5 Urgent Capacity');
            if (!m.jobsToIgnore) missingFields.push('12C.6 Jobs to Ignore');
            if (!m.responseApprovalRequirement) missingFields.push('12C.8 Response Approval');
            if (!m.canSubmitUnderThreshold) missingFields.push('12C.9 Submit Under Threshold');
        }

        // 12D Direct Proposal
        if (selectedServices.includes('direct_proposals')) {
            const m = data.directProposalOutreach || {};
            if (!m.interestedInDirectBusinessDevelopment) missingFields.push('12D.1 Outreach Interest');
            if (m.interestedInDirectBusinessDevelopment === 'yes' || m.interestedInDirectBusinessDevelopment === 'maybe_please_advise') {
                if (!m.directGrowthChannels || m.directGrowthChannels.length === 0) missingFields.push('12D.2 Growth Channels');
                if (!m.targetOrganisationsSectors) missingFields.push('12D.3 Target Sectors');
                if (!m.interestedCampaigns || m.interestedCampaigns.length === 0) missingFields.push('12D.8 Campaigns');
            }
        }

        // 12E Quote Request
        if (selectedServices.includes('quote_requests') || selectedServices.includes('marketplace_leads') || selectedServices.includes('direct_proposals')) {
            const m = data.quoteRequests || {};
            if (!m.quoteRequestTypes) missingFields.push('12E.1 Request Types');
            if (!m.informationNeededToQuote) missingFields.push('12E.2 Info Needed');
            if (!m.quotePrerequisites) missingFields.push('12E.3 Prerequisites');
            if (!m.standardQuoteAssumptions) missingFields.push('12E.4 Assumptions');
            if (!m.standardQuoteExclusions) missingFields.push('12E.5 Exclusions');
            if (!m.quoteValidityPeriod) missingFields.push('12E.6 Validity Period');
            if (!m.quoteApprover?.contactType) missingFields.push('12E.7 Quote Approver');
            if (!m.canPrepareDraftQuotes) missingFields.push('12E.8 Prepare Drafts');
            if (!m.canSendQuotesUnderThreshold) missingFields.push('12E.9 Send Under Threshold');
        }
        break;
    }
    case 'tender_readiness': {
        const fields = ['previousExperience', 'submissionFrequency', 'selectionCriteriaPriorities', 'internalOrExternalResources', 'awareOfReportingObligations', 'handlesSubcontractors'];
        fields.forEach(f => { if (!data[f]) missingFields.push(f) });
        if (data.previousExperience === 'yes' && !data.previousExperienceDetails) {
            missingFields.push('previousExperienceDetails');
        }
        if (data.awareOfReportingObligations === 'yes' && !data.reportingObligationsDetails) {
            missingFields.push('reportingObligationsDetails');
        }
        if (data.handlesSubcontractors === 'yes' && !data.subcontractorManagementProcess) {
            missingFields.push('subcontractorManagementProcess');
        }
        break;
    }
    case 'grants': {
        const fields = ['grantWritingExperience', 'grantTypes', 'strategicAlignment', 'grantWishlist'];
        fields.forEach(f => { if (!data[f]) missingFields.push(f) });
        if (data.grantWritingExperience === 'yes' && !data.grantWritingExperienceDetails) {
            missingFields.push('grantWritingExperienceDetails');
        }
        break;
    }
    case 'marketplace_strategy': {
        const fields = ['relevantMarketplaces', 'profileCompletion', 'leadGenerationStrategy', 'reviewManagement'];
        fields.forEach(f => { if (!data[f]) missingFields.push(f) });
        if (data.relevantMarketplaces === 'yes' && !data.marketplaceExamples) {
            missingFields.push('marketplaceExamples');
        }
        break;
    }
    case 'outreach_strategy': {
        const fields = ['outreachChannels', 'targetAudience', 'messaging', 'trackingAndReporting'];
        fields.forEach(f => { if (!data[f]) missingFields.push(f) });
        if (data.outreachChannels?.includes('other') && !data.otherOutreachChannel) {
            missingFields.push('otherOutreachChannel');
        }
        break;
    }
    case 'quote_support': {
        const fields = ['quoteTurnaround', 'quoteFormat', 'pricingStrategy', 'followUpProcess'];
        fields.forEach(f => { if (!data[f]) missingFields.push(f) });
        break;
    }
    case 'workflow_rules': {
        if (!data.preferredCommunicationMethods || data.preferredCommunicationMethods.length === 0) missingFields.push('preferredCommunicationMethods');
        if (data.preferredCommunicationMethods?.includes('other') && !data.otherCommunicationMethod) missingFields.push('otherCommunicationMethod');
        if (!data.activeOpportunityResponseTime) missingFields.push('activeOpportunityResponseTime');
        if (!data.draftReviewers || data.draftReviewers.length === 0) missingFields.push('draftReviewers');
        if (!data.finalSubmissionApprover?.contactType) missingFields.push('finalSubmissionApprover');
        if (!data.emergencyApprovalContact?.contactType) missingFields.push('emergencyApprovalContact');
        if (data.emergencyApprovalContact?.contactType === 'custom' && (!data.emergencyApprovalContact.fullName || !data.emergencyApprovalContact.roleTitle || !data.emergencyApprovalContact.email || !data.emergencyApprovalContact.phone)) {
           missingFields.push('custom emergency contact details');
        }
        if (!data.draftReviewTimeNeeded) missingFields.push('draftReviewTimeNeeded');
        if (!data.finalApprovalDeadlinePreference) missingFields.push('finalApprovalDeadlinePreference');
        if (!data.reviewFeedbackPreferences || data.reviewFeedbackPreferences.length === 0) missingFields.push('reviewFeedbackPreferences');
        if (data.reviewFeedbackPreferences?.includes('other') && !data.otherReviewFeedbackPreference) missingFields.push('otherReviewFeedbackPreference');
        break;
    }
    case 'document_upload_library': {
        if (!data.clientDocumentConfirmation) missingFields.push('clientDocumentConfirmation');
        break;
    }
    case 'authority_matrix': {
        const preferenceKeys = [
          'searchForOpportunities', 'recommendOpportunities', 'createOrUpdatePlatformProfiles',
          'assistWithRegistrations', 'draftResponses', 'askClarificationQuestions',
          'communicateWithBuyersFundersLeads', 'prepareMarketplaceResponses', 'submitMarketplaceResponses',
          'submitQuoteRequests', 'submitTendersOrGrants', 'followUp', 'useSuppliedDocuments',
          'maintainReusableBidLibrary'
        ];
        preferenceKeys.forEach(k => {
          if (!data.authorityPreferences || !data.authorityPreferences[k]) missingFields.push(`Preference: ${k}`);
        });

        const levelKeys = [
          'searchingOpportunities', 'shortlisting', 'freePlatformRegistration', 'paidPlatformRegistration',
          'draftingProposalContent', 'sendingMarketplaceResponses', 'submittingQuotesUnderThreshold',
          'submittingTenderOrGrantApplications', 'acceptingTerms', 'providingPricing',
          'contactingBuyersFunders', 'updatingMarketplaceProfiles'
        ];
        levelKeys.forEach(k => {
          if (!data.approvalLevels || !data.approvalLevels[k]) missingFields.push(`Level: ${k}`);
        });

        if (!data.actionsNeverWithoutWrittenApproval) missingFields.push('actionsNeverWithoutWrittenApproval');
        
        if (!data.finalSubmissionApprovalContact || !data.finalSubmissionApprovalContact.contactType) {
          missingFields.push('finalSubmissionApprovalContact');
        } else if (data.finalSubmissionApprovalContact.contactType === 'custom') {
          if (!data.finalSubmissionApprovalContact.fullName || (!data.finalSubmissionApprovalContact.email && !data.finalSubmissionApprovalContact.phone)) {
            missingFields.push('finalSubmissionApprovalContact custom details');
          }
        }

        if (!data.finalPricingCommercialApprovalContact || !data.finalPricingCommercialApprovalContact.contactType) {
          missingFields.push('finalPricingCommercialApprovalContact');
        } else if (data.finalPricingCommercialApprovalContact.contactType === 'custom') {
          if (!data.finalPricingCommercialApprovalContact.fullName || (!data.finalPricingCommercialApprovalContact.email && !data.finalPricingCommercialApprovalContact.phone)) {
            missingFields.push('finalPricingCommercialApprovalContact custom details');
          }
        }

        // Conditional Threshold
        const pricingSection = allData?.sections?.pricing_commercial || {};
        const marketplaceSection = allData?.sections?.service_modules?.marketplaceLeads || {};
        const quoteSection = allData?.sections?.service_modules?.quoteRequests || {};

        const showThreshold = (
          pricingSection.canSubmitPricingUnderThreshold === 'yes' ||
          pricingSection.canSubmitPricingUnderThreshold === 'maybe_to_be_discussed' ||
          marketplaceSection.canSubmitUnderThreshold === 'yes' ||
          marketplaceSection.canSubmitUnderThreshold === 'maybe_to_be_discussed' ||
          quoteSection.canSendQuotesUnderThreshold === 'yes' ||
          quoteSection.canSendQuotesUnderThreshold === 'maybe_to_be_discussed' ||
          data.approvalLevels?.submittingQuotesUnderThreshold === 'no_approval_needed' ||
          data.approvalLevels?.submittingQuotesUnderThreshold === 'draft_approval_required' ||
          data.approvalLevels?.submittingQuotesUnderThreshold === 'final_written_approval_required' ||
          data.authorityPreferences?.submitQuoteRequests === 'authorised' ||
          data.authorityPreferences?.submitQuoteRequests === 'authorised_after_approval' ||
          data.authorityPreferences?.submitMarketplaceResponses === 'authorised' ||
          data.authorityPreferences?.submitMarketplaceResponses === 'authorised_after_approval'
        );

        if (showThreshold && !data.maximumValueWithoutFinalWrittenApproval) {
          missingFields.push('maximumValueWithoutFinalWrittenApproval');
        }

        break;
    }
    case 'opportunity_triage': {
        if (!data.revenueThreshold) missingFields.push('revenueThreshold');
        if (!data.contractTerm) missingFields.push('contractTerm');
        if (!data.geographicalFocus) missingFields.push('geographicalFocus');
        break;
    }
    case 'final_submission': {
        const declarations = ['confirmInformationAccurate', 'confirmAuthorisedToSubmit', 'acknowledgeInformationUse', 'acknowledgeReviewApprovalResponsibility', 'acknowledgeTermsApply'];
        const acknowledgementState = data?.acknowledgements || {};
        declarations.forEach((dec) => {
            if (!acknowledgementState[dec]) missingFields.push(`acknowledgements.${dec}`);
        });
        break;
    }
  }

  result.missingFields = missingFields.map((f) => ({ fieldKey: f, fieldLabel: f, message: `${f} is required.`, section: stepId }));
  result.isValid = result.missingFields.length === 0;
  return result;
}
