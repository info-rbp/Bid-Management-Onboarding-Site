import { describe, expect, it } from 'vitest';
import { getSafeReturnUrl } from './auth-return-url';

describe('getSafeReturnUrl', () => {
  it('defaults null to /dashboard', () => {
    expect(getSafeReturnUrl(null)).toBe('/dashboard');
  });

  it('allows internal dashboard path', () => {
    expect(getSafeReturnUrl('/dashboard')).toBe('/dashboard');
  });

  it('allows onboarding internal path', () => {
    expect(getSafeReturnUrl('/onboarding/welcome_expectations')).toBe('/onboarding/welcome_expectations');
  });

  it('rejects https urls', () => {
    expect(getSafeReturnUrl('https://example.com')).toBe('/dashboard');
  });

  it('rejects protocol-relative urls', () => {
    expect(getSafeReturnUrl('//example.com')).toBe('/dashboard');
  });

  it('rejects javascript urls', () => {
    expect(getSafeReturnUrl('javascript:alert(1)')).toBe('/dashboard');
  });
});
