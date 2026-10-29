import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

window.scrollTo = () => undefined;

// jsdom does not implement matchMedia; provide a minimal light-mode stub for theme logic.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
