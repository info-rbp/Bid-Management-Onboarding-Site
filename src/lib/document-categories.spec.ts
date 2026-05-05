import { describe, expect, it } from 'vitest';
import { buildDocumentMetadata, getSourceSectionLabel } from './document-categories';

describe('document metadata and source labels', () => {
  it('maps Section 11 uploads into canonical metadata and renders Section 11 source label', () => {
    const metadata = buildDocumentMetadata({
      documentId: 'doc-1',
      clientId: 'client-1',
      originalFileName: 'insurance.pdf',
      storedFileName: 'doc-1_insurance.pdf',
      fileType: 'application/pdf',
      fileExtension: 'pdf',
      fileSize: 1234,
      storagePath: 'clients/client-1/documents/insurance_certificates/doc-1_insurance.pdf',
      downloadUrl: 'https://example.com/doc-1',
      documentCategory: 'insurance_certificates',
      sourceSection: 'section_11_compliance_insurance'
    });

    expect(metadata.documentCategory).toBe('insurance_certificates');
    expect(metadata.status).toBe('received');
    expect(getSourceSectionLabel(metadata.sourceSection)).toBe('Section 11');
  });

  it('maps Section 14 uploads into canonical metadata and renders Section 14 source label', () => {
    const metadata = buildDocumentMetadata({
      documentId: 'doc-2',
      clientId: 'client-1',
      originalFileName: 'insurance.pdf',
      storedFileName: 'doc-2_insurance.pdf',
      fileType: 'application/pdf',
      fileExtension: 'pdf',
      fileSize: 1234,
      storagePath: 'clients/client-1/documents/insurance_certificates/doc-2_insurance.pdf',
      downloadUrl: 'https://example.com/doc-2',
      documentCategory: 'insurance_certificates',
      sourceSection: 'section_14_documents'
    });

    expect(metadata.status).toBe('received');
    expect(getSourceSectionLabel(metadata.sourceSection)).toBe('Section 14');
  });

  it('renders labels for all supported source sections', () => {
    expect(getSourceSectionLabel('section_6_team_capacity')).toBe('Section 6');
    expect(getSourceSectionLabel('section_7_proof_evidence')).toBe('Section 7');
    expect(getSourceSectionLabel('section_9_pricing_commercial')).toBe('Section 9');
    expect(getSourceSectionLabel('section_11_compliance_insurance')).toBe('Section 11');
    expect(getSourceSectionLabel('section_12_service_modules')).toBe('Section 12');
    expect(getSourceSectionLabel('section_14_documents')).toBe('Section 14');
  });

  it('builds metadata for each newly supported source section', () => {
    const sources = [
      'section_6_team_capacity',
      'section_7_proof_evidence',
      'section_9_pricing_commercial',
      'section_11_compliance_insurance',
      'section_12_service_modules'
    ] as const;

    for (const source of sources) {
      const metadata = buildDocumentMetadata({
        documentId: `doc-${source}`,
        clientId: 'client-1',
        originalFileName: 'file.pdf',
        storedFileName: `doc-${source}_file.pdf`,
        fileType: 'application/pdf',
        fileExtension: 'pdf',
        fileSize: 100,
        storagePath: `clients/client-1/documents/insurance_certificates/doc-${source}_file.pdf`,
        downloadUrl: 'https://example.com/file',
        documentCategory: 'insurance_certificates',
        sourceSection: source
      });

      expect(metadata.sourceSection).toBe(source);
      expect(metadata.linkedSections).toEqual([source]);
      expect(metadata.linkedRequirementIds).toEqual(['insurance_certificates']);
    }
  });
});
