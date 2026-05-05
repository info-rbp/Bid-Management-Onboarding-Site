import { describe, it, expect } from 'vitest';
import { deriveServiceModules, deriveActiveServiceModules } from './onboarding-steps';

describe('Section 3 service selection transitions', () => {
  it('government_tenders enables tender module activity', () => {
    const enabled = deriveServiceModules(['government_tenders']);
    const active = deriveActiveServiceModules(['government_tenders']);

    expect(enabled.tenderReadiness).toBe(true);
    expect(active.tenderSupplierReadiness).toBe(true);
  });

  it('marketplace_leads enables marketplace and quote support modules', () => {
    const enabled = deriveServiceModules(['marketplace_leads']);
    const active = deriveActiveServiceModules(['marketplace_leads']);

    expect(enabled.marketplaceStrategy).toBe(true);
    expect(enabled.quoteSupport).toBe(true);
    expect(active.marketplaceLeads).toBe(true);
    expect(active.quoteRequests).toBe(true);
  });
});
