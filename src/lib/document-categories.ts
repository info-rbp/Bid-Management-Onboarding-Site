export const DOCUMENT_CATEGORIES = {
  business_profile_capability_brochures: {
    id: 'business_profile_capability_brochures',
    label: 'Business Profile & Capability',
    description: 'Business profiles, capability statements, or brochures.'
  },
  logos_brand_assets_style_guides: {
    id: 'logos_brand_assets_style_guides',
    label: 'Logos & Brand Assets',
    description: 'Logos, style guides, and brand identity files.'
  },
  insurance_certificates: {
    id: 'insurance_certificates',
    label: 'Insurance Certificates',
    description: 'Public liability, indemnity, and workers compensation certificates.'
  },
  licences_registrations_certifications_checks: {
    id: 'licences_registrations_certifications_checks',
    label: 'Licences & Certifications',
    description: 'Industry licences, staff tickets, and business registrations.'
  },
  policies_and_procedures: {
    id: 'policies_and_procedures',
    label: 'Policies & Procedures',
    description: 'WHS, Quality, Environmental, and Privacy policies.'
  },
  staff_cvs_bios_qualifications_tickets: {
    id: 'staff_cvs_bios_qualifications_tickets',
    label: 'Staff Documentation',
    description: 'CVs, staff bios, and qualification records.'
  },
  project_examples_case_studies_photos_reports_testimonials: {
    id: 'project_examples_case_studies_photos_reports_testimonials',
    label: 'Proof & Evidence',
    description: 'Case studies, project photos, and testimonials.'
  },
  previous_tenders_grants_proposals_quotes_feedback: {
    id: 'previous_tenders_grants_proposals_quotes_feedback',
    label: 'Previous Submissions',
    description: 'Past tender responses, grant applications, and feedback.'
  },
  pricing_schedules_rate_cards_package_lists_budget_templates: {
    id: 'pricing_schedules_rate_cards_package_lists_budget_templates',
    label: 'Pricing & Budgets',
    description: 'Rate cards, pricing schedules, and budget templates.'
  },
  grant_project_documents_budgets_supplier_quotes_support_letters: {
    id: 'grant_project_documents_budgets_supplier_quotes_support_letters',
    label: 'Grant Specific Files',
    description: 'Project plans, supplier quotes, and support letters for grants.',
    conditional: true
  },
  other_relevant_documents: {
    id: 'other_relevant_documents',
    label: 'Other Documents',
    description: 'Any other files that support your application.'
  }
} as const;

export type DocumentCategory = keyof typeof DOCUMENT_CATEGORIES;

export const SOURCE_SECTIONS = {
  section_11_compliance_insurance: 'Section 11',
  section_14_documents: 'Section 14'
} as const;

export type SourceSection = keyof typeof SOURCE_SECTIONS;

export const getSourceSectionLabel = (sourceSection?: string) =>
  sourceSection ? SOURCE_SECTIONS[sourceSection as SourceSection] || sourceSection.replace(/_/g, ' ') : 'Unknown';

export function buildDocumentMetadata(params: {
  documentId: string;
  clientId: string;
  originalFileName: string;
  storedFileName: string;
  fileType: string;
  fileExtension: string;
  fileSize: number;
  storagePath: string;
  downloadUrl: string;
  documentCategory: DocumentCategory;
  sourceSection: SourceSection;
}) {
  const { sourceSection, documentCategory, ...rest } = params;

  return {
    ...rest,
    documentCategory,
    sourceSection,
    linkedSections: [sourceSection],
    linkedRequirementIds: [documentCategory],
    status: 'received' as const,
    approvedForUse: false
  };
}
