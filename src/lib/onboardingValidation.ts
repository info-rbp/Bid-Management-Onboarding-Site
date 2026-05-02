/**
 * @fileOverview Onboarding validation logic.
 */

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  errors: Record<string, string>;
}

export function validateOnboardingSection(stepKey: string, data: any, submission?: any): ValidationResult {
  const missingFields: string[] = [];
  const errors: Record<string, string> = {};

  const check = (field: string, label: string) => {
    const value = data?.[field];
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      missingFields.push(field);
      errors[field] = `${label} is required`;
    }
  };

  switch (stepKey) {
    case 'welcome_expectations':
      check('isReady', 'Acknowledgement');
      break;
    case 'business_snapshot':
      check('abn', 'ABN');
      check('yearsInBusiness', 'Years in Business');
      check('staffCount', 'Staff Count');
      check('turnover', 'Annual Turnover');
      break;
    case 'opportunity_triage':
      check('idealClient', 'Ideal Client Description');
      check('minValue', 'Minimum Project Value');
      check('redFlags', 'Red Flags');
      break;
    case 'service_selection':
      check('selectedServices', 'Selected Services');
      break;
    case 'business_profile':
      check('mission', 'Mission & Purpose');
      check('values', 'Business Values');
      check('history', 'Business History');
      break;
    case 'offer_menu':
      check('serviceCategories', 'Service Categories');
      check('usps', 'Unique Selling Propositions');
      break;
    case 'team_capacity':
      check('orgOverview', 'Organisational Overview');
      check('capacity', 'Current Capacity');
      break;
    case 'proof_evidence':
      check('topProjects', 'Top Projects');
      check('references', 'Professional References');
      break;
    case 'goals_strategy':
      check('revenueGoal', 'Revenue Goal');
      check('targetSectors', 'Target Market Sectors');
      break;
    case 'pricing_commercial':
      check('pricingModel', 'Pricing Model');
      check('paymentTerms', 'Payment Terms');
      break;
    case 'platform_setup':
      check('existingPlatforms', 'Platform Usage Selection');
      break;
    case 'compliance_insurance':
      const readinessRows = ["ABN/ACN records", "Public liability insurance", "Professional indemnity insurance", "Workers compensation insurance", "Industry licences", "Police checks", "ISO certifications", "WHS policy", "Privacy policy"];
      readinessRows.forEach(row => {
        if (!data?.grid?.[row]) {
          missingFields.push(`grid.${row}`);
          errors[`grid.${row}`] = `${row} status is required`;
        }
      });
      break;
    case 'tender_readiness':
      check('experience', 'Tender Experience');
      check('approver', 'Final Approver');
      break;
    case 'grants':
      check('interest', 'Grant Interest');
      if (data?.interest === 'yes') {
        check('project', 'Grant Project Details');
      }
      break;
    case 'marketplace_strategy':
      check('selectedPlatforms', 'Marketplace Platform Selection');
      // For each selected platform (except unsure), check the strategy details
      const selectedPlatforms = data?.selectedPlatforms || [];
      selectedPlatforms.filter((p: string) => p !== "Unsure, please recommend").forEach((platform: string) => {
        const strategy = data?.platformStrategies?.[platform];
        if (!strategy?.status) missingFields.push(`${platform}.status`);
        if (!strategy?.comfort) missingFields.push(`${platform}.comfort`);
        if (!strategy?.minValue) missingFields.push(`${platform}.minValue`);
        if (!strategy?.services) missingFields.push(`${platform}.services`);
      });
      break;
    case 'direct_outreach_strategy':
      check('channels', 'Growth Channels');
      break;
    case 'quote_support':
      check('quoteTypes', 'Quote Types');
      break;
    case 'workflow_rules':
      check('channels', 'Communication Methods');
      break;
    case 'document_upload_library':
      // Validation for library: requires acknowledgement checkbox or similar if defined
      // For now we check if they've at least viewed or done something
      if (!data?.acknowledged) {
        missingFields.push('acknowledged');
        errors['acknowledged'] = 'Confirmation of document upload is required';
      }
      break;
    case 'authority_matrix':
      const matrixRows = ["Search for opportunities", "Recommend opportunities", "Create or update platform profiles", "Register on free platforms", "Register on paid platforms", "Assist with registrations", "Draft responses and quotes", "Ask clarification questions", "Communicate with buyers/leads", "Submit marketplace responses", "Submit quote requests", "Submit tenders", "Submit grants", "Provide pricing", "Accept terms or contract conditions", "Use supplied documents", "Maintain reusable bid library", "Follow up with buyers/leads"];
      matrixRows.forEach(row => {
        if (!data?.matrix?.[row]) {
          missingFields.push(`matrix.${row}`);
          errors[`matrix.${row}`] = `Authority for ${row} is required`;
        }
      });
      break;
    case 'final_submission':
      const decs = data?.declarations || {};
      const requiredDecs = ["accurateAndComplete", "authorisedToSubmit", "termsAccepted", "informationUseAcknowledged", "approvalResponsibilityAcknowledged", "noPasswordsAcknowledged", "submissionLockAcknowledged"];
      requiredDecs.forEach(d => {
        if (!decs[d]) {
          missingFields.push(`declaration.${d}`);
        }
      });
      break;
    default:
      break;
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    errors,
  };
}
