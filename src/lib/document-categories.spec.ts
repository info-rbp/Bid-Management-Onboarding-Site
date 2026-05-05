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
});
