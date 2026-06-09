export type ThemePreference = 'system' | 'light' | 'dark';
export type EffectiveTheme = 'light' | 'dark';

/** Resolve the theme that should actually render from the user's preference and the OS setting. */
export function resolveEffectiveTheme(preference: ThemePreference, prefersDark: boolean): EffectiveTheme {
  if (preference === 'system') return prefersDark ? 'dark' : 'light';
  return preference;
}
