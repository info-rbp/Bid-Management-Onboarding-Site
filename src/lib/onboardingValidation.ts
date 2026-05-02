

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
  }

  return { isValid: missingFields.length === 0, missingFields };
}
