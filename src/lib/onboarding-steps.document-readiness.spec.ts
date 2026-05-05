import { describe, expect, it } from 'vitest';
import { deriveDocumentReadiness } from './onboarding-steps';

describe('deriveDocumentReadiness', () => {
  it('marks categories as received when documents uploaded in earlier sections', () => {
    const docs = [
      { documentCategory: 'insurance_certificates', sourceSection: 'section_11_compliance_insurance', status: 'received' },
      { documentCategory: 'staff_cvs_bios_qualifications_tickets', sourceSection: 'section_6_team_capacity', status: 'received' }
    ];

    const readiness = deriveDocumentReadiness([], docs, []);
    expect(readiness.hasInsuranceCertificates).toBe(true);
    expect(readiness.hasStaffDocuments).toBe(true);
  });
});
