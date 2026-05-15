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
  contacts: "Key contacts",
  primaryContact: "Primary contact assignment",
  finalDecisionMaker: "Final decision-maker assignment",
  complianceContact: "Compliance document contact assignment",
  pricingCommercialContact: "Pricing/commercial approval contact assignment",
  urgentApprovalContact: "Urgent approval contact assignment",
  'tenderSupplierReadiness.previousTenderSupplierExperience': '12A.1 Experience',
  'tenderSupplierReadiness.previousPortalsUsed': '12A.2 Portals',
  'tenderSupplierReadiness.targetBuyers': '12A.3 Target Buyers',
  'tenderSupplierReadiness.realisticContractSizes': '12A.4 Contract Sizes',
  'tenderSupplierReadiness.preparedForComplianceRequirements': '12A.5 Compliance Preparedness',
  'tenderSupplierReadiness.previousMaterialsAvailable': '12A.6 Previous Materials',
  'tenderSupplierReadiness.submissionApprover': '12A.8 Submission Approver',
  'tenderSupplierReadiness.contractTermsApprover': '12A.9 Contract Terms Approver',
  'grants.interestedInGrantSupport': '12B.1 Grant Interest',
  'grants.fundingUse': '12B.2 Funding Use',
  'grants.projectNeed': '12B.3 Project Need',
  'grants.projectBeneficiaries': '12B.4 Beneficiaries',
  'grants.projectLocation': '12B.5 Location',
  'grants.projectTiming': '12B.6 Timing',
  'grants.estimatedTotalProjectCost': '12B.7 Project Cost',
  'grants.fundingAmountNeeded': '12B.8 Funding Amount',
  'grants.clientContribution': '12B.9 Contribution',
  'grants.projectOutcomes': '12B.10 Outcomes',
  'grants.afterFundingPlan': '12B.14 Future Plan',
  'marketplaceLeads.openMarketplacePlatforms': '12C.1 Platforms',
  'marketplaceLeads.suitableServices': '12C.2 Suitable Services',
  'marketplaceLeads.worthwhileLeadTypes': '12C.3 Lead Types',
  'marketplaceLeads.minimumJobValue': '12C.4 Min Value',
  'marketplaceLeads.urgentWorkCapacity': '12C.5 Urgent Capacity',
  'marketplaceLeads.jobsToIgnore': '12C.6 Jobs to Ignore',
  'marketplaceLeads.responseApprovalRequirement': '12C.8 Response Approval',
  'marketplaceLeads.canSubmitUnderThreshold': '12C.9 Submit Under Threshold',
  'directProposalOutreach.interestedInDirectBusinessDevelopment': '12D.1 Outreach Interest',
  'directProposalOutreach.directGrowthChannels': '12D.2 Growth Channels',
  'directProposalOutreach.targetOrganisationsSectors': '12D.3 Target Sectors',
  'directProposalOutreach.interestedCampaigns': '12D.8 Campaigns',
  'quoteRequests.quoteRequestTypes': '12E.1 Request Types',
  'quoteRequests.informationNeededToQuote': '12E.2 Info Needed',
  'quoteRequests.quotePrerequisites': '12E.3 Prerequisites',
  'quoteRequests.standardQuoteAssumptions': '12E.4 Assumptions',
  'quoteRequests.standardQuoteExclusions': '12E.5 Exclusions',
  'quoteRequests.quoteValidityPeriod': '12E.6 Validity Period',
  'quoteRequests.quoteApprover': '12E.7 Quote Approver',
  'quoteRequests.canPrepareDraftQuotes': '12E.8 Prepare Drafts',
  'quoteRequests.canSendQuotesUnderThreshold': '12E.9 Send Under Threshold',
};

const marketplaceFallbackSuitableServiceValues = [
  '__need_help_defining__',
  '__offer_menu_pending__',
];

const toError = (fieldKey: string, message: string, section = 'general', anchorId?: string): ValidationError => ({
  fieldKey,
  fieldLabel: snapshotFieldLabels[fieldKey] || fieldKey,
  message,
  section,
  anchorId: anchorId || fieldKey
});

const isEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
const digitsOnly = (value: string) => (value || '').replace(/\D/g, '');

export function validateOnboardingSection(stepId: string, data: any, allData?: any): ValidationResult {
  const result: ValidationResult = { isValid: true, missingFields: [], invalidFields: [], warningFields: [] };
  const section = stepId.replace(/_/g, ' ');

  switch (stepId) {
    case 'welcome_expectations': {
      const fields = ['terms', 'authority', 'infoUse', 'accuracy', 'saveAndReturn', 'passwordWarning'];
      fields.forEach(f => { if (!data[f]) result.missingFields.push(toError(f, `${f} is required`, section)); });
      break;
    }
    case 'business_snapshot': {
      const section = 'snapshot';
      const addMissing = (k: string, m: string, anchorId?: string) => result.missingFields.push(toError(k, m, section, anchorId || k));
      const addInvalid = (k: string, m: string, anchorId?: string) => result.invalidFields.push(toError(k, m, section, anchorId || k));
      
      const required = ['registeredBusinessName', 'businessStructure', 'yearStarted', 'registeredBusinessAddress', 'businessPhone', 'businessEmail'];
      required.forEach((k) => { if (!data?.[k]) addMissing(k, `${snapshotFieldLabels[k]} is required.`); });
      if (!data?.abn) addMissing('abn', 'ABN is required.');
      else if (digitsOnly(data.abn).length !== 11) addInvalid('abn', 'ABN must contain 11 digits.');
      if (data?.acn && digitsOnly(data.acn).length !== 9) addInvalid('acn', 'ACN must contain 9 digits.');
      if (data?.businessEmail && !isEmail(data.businessEmail)) addInvalid('businessEmail', 'Business email address must be a valid email.');

      const contacts = data?.contacts || [];
      if (contacts.length === 0) {
        addMissing('contacts', 'At least one contact is required.', 'contacts');
      } else {
        contacts.forEach((contact: any, index: number) => {
          const contactPrefix = `contacts.${index}`;
          const anchorPrefix = `contacts.${index}`;
          if (!contact.fullName) addMissing(`${contactPrefix}.fullName`, `Full name for contact #${index + 1} is required.`, `${anchorPrefix}.fullName`);
          if (!contact.roleTitle) addMissing(`${contactPrefix}.roleTitle`, `Role/Title for contact #${index + 1} is required.`, `${anchorPrefix}.roleTitle`);
          if (!contact.email) addMissing(`${contactPrefix}.email`, `Email for contact #${index + 1} is required.`, `${anchorPrefix}.email`);
          else if (!isEmail(contact.email)) addInvalid(`${contactPrefix}.email`, `Email for contact #${index + 1} is invalid.`, `${anchorPrefix}.email`);
          if (!contact.phone) addMissing(`${contactPrefix}.phone`, `Phone for contact #${index + 1} is required.`, `${anchorPrefix}.phone`);
          
          if ((contact.responsibilities || []).includes('Other') && !contact.otherResponsibility) {
            addMissing(`${contactPrefix}.otherResponsibility`, `Please specify the 'Other' responsibility for contact #${index + 1}.`, `${anchorPrefix}.otherResponsibility`);
          }
        });

        const allResponsibilities = contacts.flatMap((c: any) => c.responsibilities || []);
        
        const requiredRoles: Record<string, string> = {
          'Primary contact': 'primaryContact',
          'Final decision-maker': 'finalDecisionMaker',
          'Compliance documents': 'complianceContact',
          'Pricing/commercial approval': 'pricingCommercialContact',
          'Urgent approvals': 'urgentApprovalContact',
        };

        Object.entries(requiredRoles).forEach(([role, fieldKey]) => {
          if (!allResponsibilities.includes(role)) {
            addMissing(fieldKey, `A contact must be assigned the '${role}' responsibility.`, 'contacts');
          }
        });
      }
      break;
    }
    case 'service_selection': {
        if (!data.selectedServices || data.selectedServices.length === 0) result.missingFields.push(toError('selectedServices', 'selectedServices is required', section));
        if (!data.highestPriorityService) result.missingFields.push(toError('highestPriorityService', 'highestPriorityService is required', section));
        if (!data.serviceImportanceReason) result.missingFields.push(toError('serviceImportanceReason', 'serviceImportanceReason is required', section));
        if (!data.engagementLevel) result.missingFields.push(toError('engagementLevel', 'engagementLevel is required', section));
        if (!data.opportunityRecommendationConsent) result.missingFields.push(toError('opportunityRecommendationConsent', 'opportunityRecommendationConsent is required', section));
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
        requiredFields.forEach(f => { if (!data[f]) result.missingFields.push(toError(f, `${f} is required`, section)); });
        
        if (!data.keyMessages || !Array.isArray(data.keyMessages) || data.keyMessages.length !== 3 || data.keyMessages.some((m: string) => !m || m.trim() === '')) {
            result.missingFields.push(toError('keyMessages', 'keyMessages (exactly 3 required) is required', section));
        }
        break;
    }
    case 'offer_menu': {
        const addMissing = (fieldKey: string, fieldLabel: string, message: string, anchorId: string) => {
          result.missingFields.push({ fieldKey, fieldLabel, message, section: 'offer_menu', anchorId });
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
        break;
    }
    case 'team_capacity': {
        const keyPeople = data.keyPeople || [];
        if (keyPeople.length === 0) {
            result.missingFields.push(toError('keyPeople', 'at least one key person is required', section));
        } else {
            const first = keyPeople[0];
            if (!first.fullName) result.missingFields.push(toError('keyPeople.0.fullName', 'Key Person 1 Full Name is required', section));
            if (!first.roleTitle) result.missingFields.push(toError('keyPeople.0.roleTitle', 'Key Person 1 Role is required', section));
            if (!first.responsibilities) result.missingFields.push(toError('keyPeople.0.responsibilities', 'Key Person 1 Responsibilities is required', section));
        }

        if (!data.staffProfilesAvailable) result.missingFields.push(toError('staffProfilesAvailable', 'staffProfilesAvailable is required', section));
        if (!data.usesDeliveryPartners) result.missingFields.push(toError('usesDeliveryPartners', 'usesDeliveryPartners is required', section));
        
        if (data.usesDeliveryPartners === 'yes' || data.usesDeliveryPartners === 'sometimes') {
            const partners = data.deliveryPartners || [];
            if (partners.length === 0) {
                result.missingFields.push(toError('deliveryPartners', 'at least one delivery partner is required', section));
            } else if (!partners.some((p: any) => p.businessName && p.servicesProvided)) {
                result.missingFields.push(toError('deliveryPartners', 'completed delivery partner details is required', section));
            }
        }

        if (!data.currentCapacity) result.missingFields.push(toError('currentCapacity', 'currentCapacity is required', section));
        if (!data.canScaleForLargerContract) result.missingFields.push(toError('canScaleForLargerContract', 'canScaleForLargerContract is required', section));
        if (!data.keyPersonUnavailablePlan) result.missingFields.push(toError('keyPersonUnavailablePlan', 'keyPersonUnavailablePlan is required', section));
        if (!data.qualityChecksAndSupervision) result.missingFields.push(toError('qualityChecksAndSupervision', 'qualityChecksAndSupervision is required', section));
        
        const process = data.standardDeliveryProcess;
        if (!process || !process.steps || process.steps.length < 3) {
            result.missingFields.push(toError('standardDeliveryProcess', 'delivery process (at least 3 steps) is required', section));
        }
        break;
    }
    case 'proof_evidence': {
        if (!data.caseStudyExamplesAvailable) result.missingFields.push(toError('caseStudyExamplesAvailable', 'caseStudyExamplesAvailable is required', section));
        if (!data.numberOfStrongExamples) result.missingFields.push(toError('numberOfStrongExamples', 'numberOfStrongExamples is required', section));
        
        const hasExamples = data.caseStudyExamplesAvailable === 'yes' || data.caseStudyExamplesAvailable === 'examples_need_help';
        if (hasExamples) {
            const caseStudies = data.caseStudies || [];
            if (caseStudies.length === 0) {
                result.missingFields.push(toError('caseStudies', 'at least one case study is required', section));
            } else {
                const first = caseStudies[0];
                if (!first.projectTitle) result.missingFields.push(toError('caseStudies.0.projectTitle', 'Case Study 1 Title is required', section));
                if (!first.clientCustomerType || first.clientCustomerType.length === 0) result.missingFields.push(toError('caseStudies.0.clientCustomerType', 'Case Study 1 Client Type is required', section));
                if (!first.whatWasDelivered) result.missingFields.push(toError('caseStudies.0.whatWasDelivered', 'Case Study 1 Delivery is required', section));
                if (!first.problemSolvedAndOutcome) result.missingFields.push(toError('caseStudies.0.problemSolvedAndOutcome', 'Case Study 1 Outcome is required', section));
            }
        }

        if (!data.testimonialsReviewsReferencesAvailable) result.missingFields.push(toError('testimonialsReviewsReferencesAvailable', 'testimonialsReviewsReferencesAvailable is required', section));
        if (!data.evidenceUsageRestrictions) result.missingFields.push(toError('evidenceUsageRestrictions', 'evidenceUsageRestrictions is required', section));
        break;
    }
    case 'goals_strategy': {
        if (!data.mainGoals || data.mainGoals.length === 0) result.missingFields.push(toError('mainGoals', 'mainGoals is required', section));
        if (data.mainGoals?.includes('other') && !data.otherGoal) result.missingFields.push(toError('otherGoal', 'otherGoal is required', section));
        if (!data.success12Months) result.missingFields.push(toError('success12Months', 'success12Months is required', section));
        if (!data.interestedOpportunityChannels || data.interestedOpportunityChannels.length === 0) result.missingFields.push(toError('interestedOpportunityChannels', 'interestedOpportunityChannels is required', section));
        if (data.interestedOpportunityChannels?.includes('other') && !data.otherOpportunityChannel) result.missingFields.push(toError('otherOpportunityChannel', 'otherOpportunityChannel is required', section));
        if (!data.growthPreference) result.missingFields.push(toError('growthPreference', 'growthPreference is required', section));
        if (!data.minimumWorthwhileValue) result.missingFields.push(toError('minimumWorthwhileValue', 'minimumWorthwhileValue is required', section));
        if (!data.idealOpportunityValueRange) result.missingFields.push(toError('idealOpportunityValueRange', 'idealOpportunityValueRange is required', section));
        if (!data.largestRealisticOpportunity) result.missingFields.push(toError('largestRealisticOpportunity', 'largestRealisticOpportunity is required', section));
        if (!data.preferredTargets) result.missingFields.push(toError('preferredTargets', 'preferredTargets is required', section));
        if (!data.lowerMarginStrategicWork) result.missingFields.push(toError('lowerMarginStrategicWork', 'lowerMarginStrategicWork is required', section));
        if (!data.automaticNoRules) result.missingFields.push(toError('automaticNoRules', 'automaticNoRules is required', section));
        
        const priorities = data.opportunityFactorPriorities || {};
        const factorKeys = ["contractValue", "location", "profitability", "buyerRelationshipPotential", "strategicFit", "easeOfDelivery", "complianceRequirements", "deadline", "competitionLevel", "reviewPotential", "cashflowSpeed"];
        factorKeys.forEach(k => {
          if (!priorities[k]) result.missingFields.push(toError(`opportunityFactorPriorities.${k}`, `Factor Priority: ${k} is required`, section));
        });
        break;
    }
    case 'pricing_commercial': {
        if (!data.pricingMethods || data.pricingMethods.length === 0) result.missingFields.push(toError('pricingMethods', 'pricingMethods is required', section));
        if (data.pricingMethods?.includes('other') && !data.otherPricingMethod) result.missingFields.push(toError('otherPricingMethod', 'otherPricingMethod is required', section));
        if (!data.standardRatesPackagesGuidance) result.missingFields.push(toError('standardRatesPackagesGuidance', 'standardRatesPackagesGuidance is required', section));
        if (!data.discountPolicy) result.missingFields.push(toError('discountPolicy', 'discountPolicy is required', section));
        if (!data.additionalFees) result.missingFields.push(toError('additionalFees', 'additionalFees is required', section));
        if (!data.paymentTerms) result.missingFields.push(toError('paymentTerms', 'paymentTerms is required', section));
        if (!data.pricingApprover || !data.pricingApprover.contactType) result.missingFields.push(toError('pricingApprover', 'pricingApprover is required', section));
        if (data.pricingApprover?.contactType === 'custom' && (!data.pricingApprover.fullName || (!data.pricingApprover.email && !data.pricingApprover.phone))) {
          result.missingFields.push(toError('pricingApprover', 'custom approver details is required', section));
        }
        if (!data.canPrepareDraftPricing) result.missingFields.push(toError('canPrepareDraftPricing', 'canPrepareDraftPricing is required', section));
        if (!data.canSubmitPricingUnderThreshold) result.missingFields.push(toError('canSubmitPricingUnderThreshold', 'canSubmitPricingUnderThreshold is required', section));
        if ((data.canSubmitPricingUnderThreshold === 'yes' || data.canSubmitPricingUnderThreshold === 'maybe_to_be_discussed') && !data.maximumQuoteValueWithoutFinalApproval) {
          result.missingFields.push(toError('maximumQuoteValueWithoutFinalApproval', 'maximumQuoteValueWithoutFinalApproval is required', section));
        }
        break;
    }
    case 'platform_setup': {
        if (!data.existingAccounts || data.existingAccounts.length === 0) result.missingFields.push(toError('existingAccounts', 'existingAccounts is required', section));
        if (data.existingAccounts?.includes('other') && !data.otherExistingPlatform) result.missingFields.push(toError('otherExistingPlatform', 'otherExistingPlatform is required', section));
        if (!data.setupOrImprove || data.setupOrImprove.length === 0) result.missingFields.push(toError('setupOrImprove', 'setupOrImprove is required', section));
        if (data.setupOrImprove?.includes('other') && !data.otherSetupOrImprovePlatform) result.missingFields.push(toError('otherSetupOrImprovePlatform', 'otherSetupOrImprovePlatform is required', section));
        if (!data.accessController || (!data.accessController.notes && !data.accessController.contactType)) result.missingFields.push(toError('accessController', 'accessController is required', section));
        if (!data.preferredAccessMethod) result.missingFields.push(toError('preferredAccessMethod', 'preferredAccessMethod is required', section));
        if (!data.paidPlatformWillingness) result.missingFields.push(toError('paidPlatformWillingness', 'paidPlatformWillingness is required', section));
        if (!data.alertRecipients || data.alertRecipients.length === 0) result.missingFields.push(toError('alertRecipients', 'alertRecipients is required', section));
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
          if (!checklist[row]) result.missingFields.push(toError(`documentReadinessChecklist.${row}`, `Checklist: ${row} is required`, section));
        });

        const hasInsurance = (data.insurancePolicies || []).length > 0 || data.insurancePolicyNotes;
        if (!hasInsurance) result.missingFields.push(toError('insurancePolicies', 'insurancePolicies or notes is required', section));

        if (!data.writtenPoliciesProcedures || data.writtenPoliciesProcedures.length === 0) result.missingFields.push(toError('writtenPoliciesProcedures', 'writtenPoliciesProcedures is required', section));
        if (!data.practicalProcesses) result.missingFields.push(toError('practicalProcesses', 'practicalProcesses is required', section));
        if (!data.legalRegulatoryInsuranceEligibilityIssues) result.missingFields.push(toError('legalRegulatoryInsuranceEligibilityIssues', 'legalRegulatoryInsuranceEligibilityIssues is required', section));
        break;
    }
    case 'service_modules': {
        const selectedServices = allData?.sections?.service_selection?.selectedServices || [];
        
        if (selectedServices.includes('government_tenders') || selectedServices.includes('private_tenders') || selectedServices.includes('panel_supplier_registrations')) {
            const m = data.tenderSupplierReadiness || {};
            if (!m.previousTenderSupplierExperience) result.missingFields.push(toError('tenderSupplierReadiness.previousTenderSupplierExperience', '12A.1 Experience is required', section));
            if ((m.previousTenderSupplierExperience === 'yes' || m.previousTenderSupplierExperience === 'some') && !m.previousPortalsUsed) result.missingFields.push(toError('tenderSupplierReadiness.previousPortalsUsed', '12A.2 Portals is required', section));
            if (!m.targetBuyers) result.missingFields.push(toError('tenderSupplierReadiness.targetBuyers', '12A.3 Target Buyers is required', section));
            if (!m.realisticContractSizes) result.missingFields.push(toError('tenderSupplierReadiness.realisticContractSizes', '12A.4 Contract Sizes is required', section));
            if (!m.preparedForComplianceRequirements) result.missingFields.push(toError('tenderSupplierReadiness.preparedForComplianceRequirements', '12A.5 Compliance Preparedness is required', section));
            if (!m.previousMaterialsAvailable) result.missingFields.push(toError('tenderSupplierReadiness.previousMaterialsAvailable', '12A.6 Previous Materials is required', section));
            if (!m.submissionApprover?.contactType) result.missingFields.push(toError('tenderSupplierReadiness.submissionApprover', '12A.8 Submission Approver is required', section));
            if (!m.contractTermsApprover?.contactType) result.missingFields.push(toError('tenderSupplierReadiness.contractTermsApprover', '12A.9 Contract Terms Approver is required', section));
        }

        if (selectedServices.includes('grants') || selectedServices.includes('unsure_recommend')) {
            const m = data.grants || {};
            if (!m.interestedInGrantSupport) result.missingFields.push(toError('grants.interestedInGrantSupport', '12B.1 Grant Interest is required', section));
            if (m.interestedInGrantSupport === 'yes' || m.interestedInGrantSupport === 'maybe_please_advise') {
                if (!m.fundingUse) result.missingFields.push(toError('grants.fundingUse', '12B.2 Funding Use is required', section));
                if (!m.projectNeed) result.missingFields.push(toError('grants.projectNeed', '12B.3 Project Need is required', section));
                if (!m.projectBeneficiaries) result.missingFields.push(toError('grants.projectBeneficiaries', '12B.4 Beneficiaries is required', section));
                if (!m.projectLocation) result.missingFields.push(toError('grants.projectLocation', '12B.5 Location is required', section));
                if (!m.projectTiming) result.missingFields.push(toError('grants.projectTiming', '12B.6 Timing is required', section));
                if (!m.estimatedTotalProjectCost) result.missingFields.push(toError('grants.estimatedTotalProjectCost', '12B.7 Project Cost is required', section));
                if (!m.fundingAmountNeeded) result.missingFields.push(toError('grants.fundingAmountNeeded', '12B.8 Funding Amount is required', section));
                if (!m.clientContribution) result.missingFields.push(toError('grants.clientContribution', '12B.9 Contribution is required', section));
                if (!m.projectOutcomes) result.missingFields.push(toError('grants.projectOutcomes', '12B.10 Outcomes is required', section));
                if (!m.afterFundingPlan) result.missingFields.push(toError('grants.afterFundingPlan', '12B.14 Future Plan is required', section));
            }
        }

        if (selectedServices.includes('marketplace_leads')) {
            const m = data.marketplaceLeads || {};
            const offerItems = allData?.sections?.offer_menu?.offerItems || [];
            const validOfferIds = Array.isArray(offerItems)
              ? offerItems
                  .map((offer: any) => offer?.id)
                  .filter((id: unknown): id is string => typeof id === 'string' && id.trim().length > 0)
              : [];
            const selectedSuitableServices = Array.isArray(m.suitableServices)
              ? m.suitableServices.filter((value: unknown): value is string => typeof value === 'string')
              : [];

            if (!m.openMarketplacePlatforms || m.openMarketplacePlatforms.length === 0) result.missingFields.push(toError('marketplaceLeads.openMarketplacePlatforms', '12C.1 Platforms is required', section));

            if (validOfferIds.length === 0) {
              const hasAllowedFallback = selectedSuitableServices.some((value: string) =>
                marketplaceFallbackSuitableServiceValues.includes(value)
              );

              if (!hasAllowedFallback) {
                result.missingFields.push(toError('marketplaceLeads.suitableServices', '12C.2 Suitable Services is required', section));
              }
            } else {
              const hasRealOfferSelection = selectedSuitableServices.some((value: string) =>
                validOfferIds.includes(value)
              );

              if (!hasRealOfferSelection) {
                result.missingFields.push(toError('marketplaceLeads.suitableServices', '12C.2 Select at least one suitable service from your Offer Menu.', section));
              }
            }

            if (!m.worthwhileLeadTypes) result.missingFields.push(toError('marketplaceLeads.worthwhileLeadTypes', '12C.3 Lead Types is required', section));
            if (!m.minimumJobValue) result.missingFields.push(toError('marketplaceLeads.minimumJobValue', '12C.4 Min Value is required', section));
            if (!m.urgentWorkCapacity || m.urgentWorkCapacity.length === 0) result.missingFields.push(toError('marketplaceLeads.urgentWorkCapacity', '12C.5 Urgent Capacity is required', section));
            if (!m.jobsToIgnore) result.missingFields.push(toError('marketplaceLeads.jobsToIgnore', '12C.6 Jobs to Ignore is required', section));
            if (!m.responseApprovalRequirement) result.missingFields.push(toError('marketplaceLeads.responseApprovalRequirement', '12C.8 Response Approval is required', section));
            if (!m.canSubmitUnderThreshold) result.missingFields.push(toError('marketplaceLeads.canSubmitUnderThreshold', '12C.9 Submit Under Threshold is required', section));
        }

        if (selectedServices.includes('direct_proposals')) {
            const m = data.directProposalOutreach || {};
            if (!m.interestedInDirectBusinessDevelopment) result.missingFields.push(toError('directProposalOutreach.interestedInDirectBusinessDevelopment', '12D.1 Outreach Interest is required', section));
            if (m.interestedInDirectBusinessDevelopment === 'yes' || m.interestedInDirectBusinessDevelopment === 'maybe_please_advise') {
                if (!m.directGrowthChannels || m.directGrowthChannels.length === 0) result.missingFields.push(toError('directProposalOutreach.directGrowthChannels', '12D.2 Growth Channels is required', section));
                if (!m.targetOrganisationsSectors) result.missingFields.push(toError('directProposalOutreach.targetOrganisationsSectors', '12D.3 Target Sectors is required', section));
                if (!m.interestedCampaigns || m.interestedCampaigns.length === 0) result.missingFields.push(toError('directProposalOutreach.interestedCampaigns', '12D.8 Campaigns is required', section));
            }
        }

        if (selectedServices.includes('quote_requests') || selectedServices.includes('marketplace_leads') || selectedServices.includes('direct_proposals')) {
            const m = data.quoteRequests || {};
            if (!m.quoteRequestTypes) result.missingFields.push(toError('quoteRequests.quoteRequestTypes', '12E.1 Request Types is required', section));
            if (!m.informationNeededToQuote) result.missingFields.push(toError('quoteRequests.informationNeededToQuote', '12E.2 Info Needed is required', section));
            if (!m.quotePrerequisites) result.missingFields.push(toError('quoteRequests.quotePrerequisites', '12E.3 Prerequisites is required', section));
            if (!m.standardQuoteAssumptions) result.missingFields.push(toError('quoteRequests.standardQuoteAssumptions', '12E.4 Assumptions is required', section));
            if (!m.standardQuoteExclusions) result.missingFields.push(toError('quoteRequests.standardQuoteExclusions', '12E.5 Exclusions is required', section));
            if (!m.quoteValidityPeriod) result.missingFields.push(toError('quoteRequests.quoteValidityPeriod', '12E.6 Validity Period is required', section));
            if (!m.quoteApprover?.contactType) result.missingFields.push(toError('quoteRequests.quoteApprover', '12E.7 Quote Approver is required', section));
            if (!m.canPrepareDraftQuotes) result.missingFields.push(toError('quoteRequests.canPrepareDraftQuotes', '12E.8 Prepare Drafts is required', section));
            if (!m.canSendQuotesUnderThreshold) result.missingFields.push(toError('quoteRequests.canSendQuotesUnderThreshold', '12E.9 Send Under Threshold is required', section));
        }
        break;
    }
    case 'tender_readiness': {
        const fields = ['previousExperience', 'submissionFrequency', 'selectionCriteriaPriorities', 'internalOrExternalResources', 'awareOfReportingObligations', 'handlesSubcontractors'];
        fields.forEach(f => { if (!data[f]) result.missingFields.push(toError(f, `${f} is required`, section)); });
        if (data.previousExperience === 'yes' && !data.previousExperienceDetails) {
            result.missingFields.push(toError('previousExperienceDetails', 'previousExperienceDetails is required', section));
        }
        if (data.awareOfReportingObligations === 'yes' && !data.reportingObligationsDetails) {
            result.missingFields.push(toError('reportingObligationsDetails', 'reportingObligationsDetails is required', section));
        }
        if (data.handlesSubcontractors === 'yes' && !data.subcontractorManagementProcess) {
            result.missingFields.push(toError('subcontractorManagementProcess', 'subcontractorManagementProcess is required', section));
        }
        break;
    }
    case 'grants': {
        const fields = ['grantWritingExperience', 'grantTypes', 'strategicAlignment', 'grantWishlist'];
        fields.forEach(f => { if (!data[f]) result.missingFields.push(toError(f, `${f} is required`, section)); });
        if (data.grantWritingExperience === 'yes' && !data.grantWritingExperienceDetails) {
            result.missingFields.push(toError('grantWritingExperienceDetails', 'grantWritingExperienceDetails is required', section));
        }
        break;
    }
    case 'marketplace_strategy': {
        const fields = ['relevantMarketplaces', 'profileCompletion', 'leadGenerationStrategy', 'reviewManagement'];
        fields.forEach(f => { if (!data[f]) result.missingFields.push(toError(f, `${f} is required`, section)); });
        if (data.relevantMarketplaces === 'yes' && !data.marketplaceExamples) {
            result.missingFields.push(toError('marketplaceExamples', 'marketplaceExamples is required', section));
        }
        break;
    }
    case 'outreach_strategy': {
        const fields = ['outreachChannels', 'targetAudience', 'messaging', 'trackingAndReporting'];
        fields.forEach(f => { if (!data[f]) result.missingFields.push(toError(f, `${f} is required`, section)); });
        if (data.outreachChannels?.includes('other') && !data.otherOutreachChannel) {
            result.missingFields.push(toError('otherOutreachChannel', 'otherOutreachChannel is required', section));
        }
        break;
    }
    case 'quote_support': {
        const fields = ['quoteTurnaround', 'quoteFormat', 'pricingStrategy', 'followUpProcess'];
        fields.forEach(f => { if (!data[f]) result.missingFields.push(toError(f, `${f} is required`, section)); });
        break;
    }
    case 'workflow_rules': {
        if (!data.preferredCommunicationMethods || data.preferredCommunicationMethods.length === 0) result.missingFields.push(toError('preferredCommunicationMethods', 'preferredCommunicationMethods is required', section));
        if (data.preferredCommunicationMethods?.includes('other') && !data.otherCommunicationMethod) result.missingFields.push(toError('otherCommunicationMethod', 'otherCommunicationMethod is required', section));
        if (!data.activeOpportunityResponseTime) result.missingFields.push(toError('activeOpportunityResponseTime', 'activeOpportunityResponseTime is required', section));
        if (!data.draftReviewers || data.draftReviewers.length === 0) result.missingFields.push(toError('draftReviewers', 'draftReviewers is required', section));
        if (!data.finalSubmissionApprover?.contactType) result.missingFields.push(toError('finalSubmissionApprover', 'finalSubmissionApprover is required', section));
        if (!data.emergencyApprovalContact?.contactType) result.missingFields.push(toError('emergencyApprovalContact', 'emergencyApprovalContact is required', section));
        if (data.emergencyApprovalContact?.contactType === 'custom' && (!data.emergencyApprovalContact.fullName || !data.emergencyApprovalContact.roleTitle || !data.emergencyApprovalContact.email || !data.emergencyApprovalContact.phone)) {
           result.missingFields.push(toError('emergencyApprovalContact', 'custom emergency contact details is required', section));
        }
        if (!data.draftReviewTimeNeeded) result.missingFields.push(toError('draftReviewTimeNeeded', 'draftReviewTimeNeeded is required', section));
        if (!data.finalApprovalDeadlinePreference) result.missingFields.push(toError('finalApprovalDeadlinePreference', 'finalApprovalDeadlinePreference is required', section));
        if (!data.reviewFeedbackPreferences || data.reviewFeedbackPreferences.length === 0) result.missingFields.push(toError('reviewFeedbackPreferences', 'reviewFeedbackPreferences is required', section));
        if (data.reviewFeedbackPreferences?.includes('other') && !data.otherReviewFeedbackPreference) result.missingFields.push(toError('otherReviewFeedbackPreference', 'otherReviewFeedbackPreference is required', section));
        break;
    }
    case 'document_upload_library': {
        if (!data.clientDocumentConfirmation) result.missingFields.push(toError('clientDocumentConfirmation', 'clientDocumentConfirmation is required', section));
        break;
    }
    case 'authority_matrix': {
        const addMissing = (fieldKey: string, message: string) => result.missingFields.push(toError(fieldKey, message, section));

        const preferenceKeys = [
          'searchForOpportunities', 'recommendOpportunities', 'createOrUpdatePlatformProfiles',
          'assistWithRegistrations', 'draftResponses', 'askClarificationQuestions',
          'communicateWithBuyersFundersLeads', 'prepareMarketplaceResponses', 'submitMarketplaceResponses',
          'submitQuoteRequests', 'submitTendersOrGrants', 'followUp', 'useSuppliedDocuments',
          'maintainReusableBidLibrary'
        ];
        preferenceKeys.forEach(k => {
          if (!data.authorityPreferences || !data.authorityPreferences[k]) {
            addMissing(`authorityPreferences.${k}`, `Preference for '${k.replace(/([A-Z])/g, ' $1')}' is required.`);
          }
        });

        const levelKeys = [
          'searchingOpportunities', 'shortlisting', 'freePlatformRegistration', 'paidPlatformRegistration',
          'draftingProposalContent', 'sendingMarketplaceResponses', 'submittingQuotesUnderThreshold',
          'submittingTenderOrGrantApplications', 'acceptingTerms', 'providingPricing',
          'contactingBuyersFunders', 'updatingMarketplaceProfiles'
        ];
        levelKeys.forEach(k => {
          if (!data.approvalLevels || !data.approvalLevels[k]) {
            addMissing(`approvalLevels.${k}`, `Approval level for '${k.replace(/([A-Z])/g, ' $1')}' is required.`);
          }
        });

        if (!data.actionsNeverWithoutWrittenApproval) addMissing('actionsNeverWithoutWrittenApproval', 'Actions never to be taken without approval must be specified.');
        
        if (!data.finalSubmissionApprovalContact || !data.finalSubmissionApprovalContact.contactType) {
            addMissing('finalSubmissionApprovalContact', 'Final submission approval contact is required.');
        } else if (data.finalSubmissionApprovalContact.contactType === 'custom' && (!data.finalSubmissionApprovalContact.fullName || (!data.finalSubmissionApprovalContact.email && !data.finalSubmissionApprovalContact.phone))) {
            addMissing('finalSubmissionApprovalContact', 'Custom final submission approval contact details are incomplete.');
        }

        if (!data.finalPricingCommercialApprovalContact || !data.finalPricingCommercialApprovalContact.contactType) {
            addMissing('finalPricingCommercialApprovalContact', 'Final pricing/commercial approval contact is required.');
        } else if (data.finalPricingCommercialApprovalContact.contactType === 'custom' && (!data.finalPricingCommercialApprovalContact.fullName || (!data.finalPricingCommercialApprovalContact.email && !data.finalPricingCommercialApprovalContact.phone))) {
            addMissing('finalPricingCommercialApprovalContact', 'Custom final pricing/commercial approval contact details are incomplete.');
        }

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
          addMissing('maximumValueWithoutFinalWrittenApproval', 'Maximum value for submission without approval is required.');
        }

        break;
    }
    case 'opportunity_triage': {
        if (!data.revenueThreshold) result.missingFields.push(toError('revenueThreshold', 'revenueThreshold is required', section));
        if (!data.contractTerm) result.missingFields.push(toError('contractTerm', 'contractTerm is required', section));
        if (!data.geographicalFocus) result.missingFields.push(toError('geographicalFocus', 'geographicalFocus is required', section));
        break;
    }
    case 'final_submission': {
        const declarations = ['confirmInformationAccurate', 'confirmAuthorisedToSubmit', 'acknowledgeInformationUse', 'acknowledgeReviewApprovalResponsibility', 'acknowledgeTermsApply'];
        const acknowledgementState = data?.acknowledgements || {};
        declarations.forEach((dec) => {
            if (!acknowledgementState[dec]) result.missingFields.push(toError(`acknowledgements.${dec}`, `acknowledgements.${dec} is required`, section));
        });
        break;
    }
  }

  result.isValid = result.missingFields.length === 0 && result.invalidFields.length === 0;
  return result;
}
