

export function validateOnboardingSection(stepId: string, data: any): { isValid: boolean; missingFields: string[] } {
  let missingFields: string[] = [];

  switch (stepId) {
    case 'welcome_expectations': {
      const fields = ['terms', 'authority', 'infoUse', 'accuracy', 'saveAndReturn', 'passwordWarning'];
      fields.forEach(f => { if (!data[f]) missingFields.push(f) });
      break;
    }
    case 'business_snapshot': {
      if (!data.contacts || data.contacts.length === 0) missingFields.push('contacts');
      else {
        if (!data.contacts.some((c: any) => c.responsibilities?.includes('Final decision-maker'))) missingFields.push('final decision maker');
        if (!data.contacts.some((c: any) => c.responsibilities?.includes('Pricing/commercial approval'))) missingFields.push('pricing approver');
        if (!data.contacts.some((c: any) => c.responsibilities?.includes('Urgent approvals'))) missingFields.push('urgent approver');
        data.contacts.forEach((c: any, i: number) => {
          if (!c.email || !/\S+@\S+\.\S+/.test(c.email)) missingFields.push(`contact ${i+1} email`);
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
      if (!data.hasLiveOpportunity) missingFields.push('hasLiveOpportunity');
      if (data.hasLiveOpportunity === 'yes') {
          if(!data.opportunityName) missingFields.push('opportunityName');
          if(!data.deadlineDate) missingFields.push('deadlineDate');
      }
      break;
    }
    case 'business_profile': {
      if (!data.what) missingFields.push('what');
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
    case 'workflow_rules': {
        if (!data.communicationMethods) missingFields.push('communicationMethods');
        if (!data.draftReviewer) missingFields.push('draftReviewer');
        if (!data.finalApprover) missingFields.push('finalApprover');
        break;
    }
  }

  return { isValid: missingFields.length === 0, missingFields };
}
