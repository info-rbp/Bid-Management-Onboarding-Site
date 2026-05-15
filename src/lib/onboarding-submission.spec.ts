import { describe, expect, it } from 'vitest';
import { isActiveOnboardingStatus, isTerminalOnboardingStatus } from './onboarding-submission';

describe('onboarding submission statuses', () => {
  it('treats submitted as terminal', () => {
    expect(isTerminalOnboardingStatus('submitted')).toBe(true);
  });

  it('does not treat submitted as active', () => {
    expect(isActiveOnboardingStatus('submitted')).toBe(false);
  });
});
