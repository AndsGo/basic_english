import { describe, expect, it } from 'vitest';
import { resolveEffectiveTheme } from './theme';

describe('resolveEffectiveTheme', () => {
  it('honors explicit light and dark preferences regardless of the system setting', () => {
    expect(resolveEffectiveTheme('light', true)).toBe('light');
    expect(resolveEffectiveTheme('light', false)).toBe('light');
    expect(resolveEffectiveTheme('dark', false)).toBe('dark');
    expect(resolveEffectiveTheme('dark', true)).toBe('dark');
  });

  it('follows the system preference when set to system', () => {
    expect(resolveEffectiveTheme('system', true)).toBe('dark');
    expect(resolveEffectiveTheme('system', false)).toBe('light');
  });
});
