

export function validateOnboardingSection(stepId: string, data: any): { isValid: boolean; missingFields: string[] } {
  let missingFields: string[] = [];

  switch (stepId) {
    case 'welcome_expectations': {
      const fields = ['terms', 'authority', 'infoUse', 'accuracy', 'saveAndReturn', 'passwordWarning'];
      fields.forEach(f => { if (!data[f]) missingFields.push(f) });
      break;
    }
    case 'business_snapshot': {
        const requiredBusinessFields = ['registeredBusinessName', 'abn', 'businessStructure', 'registeredAddress', 'businessPhone', 'businessEmail'];
        requiredBusinessFields.forEach(field => {
            if (!data[field]) missingFields.push(field);
        });

        if (!data.contacts || data.contacts.length === 0) {
            missingFields.push('contacts');
        } else {
            if (!data.contacts[0].fullName) missingFields.push('Contact 1 fullName');
            if (!data.contacts[0].email) missingFields.push('Contact 1 email');
            if (!data.contacts[0].phone) missingFields.push('Contact 1 phone');
            if (!data.contacts[0].responsibilities?.includes('Primary contact')) missingFields.push('Contact 1 must be Primary contact');

            if (!data.contacts.some((c: any) => c.responsibilities?.includes('Final decision-maker'))) {
                missingFields.push('at least one Final decision-maker');
            }
            if (!data.contacts.some((c: any) => c.responsibilities?.includes('Pricing/commercial approval'))) {
                missingFields.push('at least one Pricing/commercial approver');
            }
            if (!data.contacts.some((c: any) => c.responsibilities?.includes('Urgent approvals'))) {
                missingFields.push('at least one Urgent approver');
            }

            data.contacts.forEach((contact: any, index: number) => {
                if (contact.email && !/\S+@\S+\.\S+/.test(contact.email)) {
                    missingFields.push(`Contact ${index + 1} email format`);
                }
            });
        }
        break;
    }
    case 'service_selection': {
        if (!data.selectedServices || data.selectedServices.length === 0) missingFields.push('selectedServices');
        break;
    }
    case 'offer_menu': {
        if (!data.offers || data.offers.length === 0) missingFields.push('offers');
        break;
    }
    case 'document_upload_library': {
        if (!data.acknowledged) missingFields.push('acknowledged');
        break;
    }
    case 'authority_matrix': {
        const authorityActions = ['search_ops', 'recommend_ops', 'update_profiles', 'register_free', 'register_paid', 'assist_regs', 'draft_responses', 'ask_questions', 'communicate_buyers', 'prepare_market_res', 'submit_market_res', 'submit_quotes', 'submit_tenders', 'submit_grants', 'provide_pricing', 'accept_terms', 'use_docs', 'maintain_library', 'follow_up'];
        authorityActions.forEach(action => {
            if(!data.matrix || !data.matrix[action]) missingFields.push(action);
        });
        if(!data.finalApprover) missingFields.push('finalApprover');
        if(!data.pricingApprover) missingFields.push('pricingApprover');
        if(!data.termsApprover) missingFields.push('termsApprover');
        if(!data.paidApprover) missingFields.push('paidApprover');
        break;
    }
    case 'opportunity_triage': {
        if (!data.revenueThreshold) missingFields.push('revenueThreshold');
        if (!data.contractTerm) missingFields.push('contractTerm');
        if (!data.geographicalFocus) missingFields.push('geographicalFocus');
        break;
    }
    case 'business_profile': {
        if (!data.what) missingFields.push('what');
        if (!data.who) missingFields.push('who');
        if (!data.how) missingFields.push('how');
        break;
    }
    case 'team_capacity': {
        if (!data.team || data.team.length === 0) missingFields.push('team');
        break;
    }
    case 'proof_evidence': {
        if (!data.caseStudies || data.caseStudies.length === 0) missingFields.push('caseStudies');
        break;
    }
    case 'goals_strategy': {
        if (!data.mainGoals) missingFields.push('mainGoals');
        break;
    }
    case 'pricing_commercial': {
        if (!data.pricingGuidance) missingFields.push('pricingGuidance');
        break;
    }
    case 'platform_setup': {
        if (!data.selectedPlatforms || data.selectedPlatforms.length === 0) missingFields.push('selectedPlatforms');
        break;
    }
    case 'compliance_insurance': {
        if (!data.readiness) missingFields.push('readiness');
        break;
    }
    case 'tender_readiness': {
        if (data.hasApprovedTemplates === undefined) missingFields.push('hasApprovedTemplates');
        if (data.hasTenderRegister === undefined) missingFields.push('hasTenderRegister');
        break;
    }
    case 'grants': {
        if (data.hasGrantStrategy === undefined) missingFields.push('hasGrantStrategy');
        break;
    }
    case 'marketplace_strategy': {
        if (data.hasProfile === undefined) missingFields.push('hasProfile');
        break;
    }
    case 'outreach_strategy': {
        if (data.hasTargetList === undefined) missingFields.push('hasTargetList');
        break;
    }
    case 'quote_support': {
        if (data.hasQuoteTemplate === undefined) missingFields.push('hasQuoteTemplate');
        break;
    }
    case 'workflow_rules': {
        if (!data.communicationMethods) missingFields.push('communicationMethods');
        if (!data.draftReviewer) missingFields.push('draftReviewer');
        if (!data.finalApprover) missingFields.push('finalApprover');
        break;
    }
    case 'final_submission': {
        const declarations = ['accurateAndComplete', 'authorisedToSubmit', 'termsAccepted', 'informationUseAcknowledged', 'approvalResponsibilityAcknowledged', 'noPasswordsAcknowledged', 'submissionLockAcknowledged'];
        declarations.forEach(dec => {
            if(!data.declarations || !data.declarations[dec]) missingFields.push(dec);
        });
        break;
    }
  }

  return { isValid: missingFields.length === 0, missingFields };
}
