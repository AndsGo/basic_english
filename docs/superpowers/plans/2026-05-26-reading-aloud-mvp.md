# Reading Aloud MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add MVP reading-aloud support for Words and Patterns using the browser Web Speech API, with settings for enabling/disabling reading, choosing slow/normal speed, and choosing the English voice language/accent.

**Architecture:** Add a small `speech` module that wraps `window.speechSynthesis`, plus a React provider that owns the current speaking state. UI components render a reusable `SpeechButton` beside readable English content; buttons call the provider instead of touching browser APIs directly.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, Playwright, Web Speech API.

---

## File Structure

- Create `src/speech/speechService.ts`: browser API wrapper; no React imports.
- Create `src/speech/speechService.test.ts`: unit tests for supported/unsupported speech behavior.
- Create `src/speech/SpeechProvider.tsx`: React context/provider and `useSpeech` hook.
- Create `src/speech/SpeechProvider.test.tsx`: hook/provider tests through a test component.
- Create `src/components/SpeechButton.tsx`: accessible button for speaking/stopping text.
- Create `src/components/SpeechButton.test.tsx`: component behavior tests.
- Modify `src/App.tsx`: persist reading settings, wrap app in `SpeechProvider`, pass settings into `MePage`.
- Modify `src/components/MePage.tsx`: add `Enable reading aloud`, `Voice speed`, and `Voice language` settings.
- Modify `src/components/WordCards.tsx`: add speech buttons for word, English definition, and example.
- Modify `src/components/WordsPage.tsx`: add speech buttons for word, English definition, and example.
- Modify `src/components/PatternCards.tsx`: add speech buttons for pattern title, structure, and examples.
- Modify `src/components/TodayPage.test.tsx`: cover speech buttons in Today words/patterns and Me settings.
- Modify `src/App.test.tsx`: cover persisted reading setting flow.
- Modify `tests/e2e/basic-english.spec.ts`: cover visible speech controls and settings without requiring real audio playback.

## Current Behavior Notes

- Reading uses the browser Web Speech API. The app does not bundle a fixed voice package.
- `SpeechProvider` passes both rate and language into the speech service.
- The speech service sets `SpeechSynthesisUtterance.lang` from the selected language.
- Supported language options are:
  - American English: `en-US`
  - British English: `en-GB`
  - Australian English: `en-AU`
  - Canadian English: `en-CA`
- The selected language is persisted in `localStorage` under `basic-english-reading-language`.
- The default remains American English (`en-US`) so existing users keep the previous behavior unless they change it.

---

### Task 1: Speech Service

**Files:**
- Create: `src/speech/speechService.ts`
- Create: `src/speech/speechService.test.ts`

- [ ] **Step 1: Write the failing service tests**

Create `src/speech/speechService.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { createSpeechService, type SpeechRate } from './speechService';

function createSupportedWindow() {
  const speak = vi.fn();
  const cancel = vi.fn();
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();

  class TestSpeechSynthesisUtterance {
    text: string;
    lang = '';
    rate = 1;
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;

    constructor(text: string) {
      this.text = text;
    }
  }

  return {
    speechSynthesis: { speak, cancel },
    SpeechSynthesisUtterance: TestSpeechSynthesisUtterance,
    addEventListener,
    removeEventListener,
  } as unknown as Window & typeof globalThis;
}

describe('speechService', () => {
  it('reports support when speechSynthesis and SpeechSynthesisUtterance exist', () => {
    const service = createSpeechService(createSupportedWindow());

    expect(service.isSupported()).toBe(true);
  });

  it('reports unsupported when browser speech APIs are missing', () => {
    const service = createSpeechService({} as Window & typeof globalThis);

    expect(service.isSupported()).toBe(false);
  });

  it('speaks English text with the configured rate and cancels previous speech first', () => {
    const windowRef = createSupportedWindow();
    const service = createSpeechService(windowRef);

    service.speak('My name is Li.', 'slow');

    expect(windowRef.speechSynthesis.cancel).toHaveBeenCalledTimes(1);
    expect(windowRef.speechSynthesis.speak).toHaveBeenCalledTimes(1);
    const utterance = vi.mocked(windowRef.speechSynthesis.speak).mock.calls[0][0] as SpeechSynthesisUtterance;
    expect(utterance.text).toBe('My name is Li.');
    expect(utterance.lang).toBe('en-US');
    expect(utterance.rate).toBe(0.75);
  });

  it.each<SpeechRate>(['normal', 'slow'])('maps %s rate to a browser utterance rate', (rate) => {
    const windowRef = createSupportedWindow();
    const service = createSpeechService(windowRef);

    service.speak('name', rate);

    const utterance = vi.mocked(windowRef.speechSynthesis.speak).mock.calls[0][0] as SpeechSynthesisUtterance;
    expect(utterance.rate).toBe(rate === 'slow' ? 0.75 : 1);
  });

  it('does nothing when asked to speak blank text', () => {
    const windowRef = createSupportedWindow();
    const service = createSpeechService(windowRef);

    service.speak('   ', 'normal');

    expect(windowRef.speechSynthesis.cancel).not.toHaveBeenCalled();
    expect(windowRef.speechSynthesis.speak).not.toHaveBeenCalled();
  });

  it('does nothing in unsupported browsers', () => {
    const service = createSpeechService({} as Window & typeof globalThis);

    expect(() => service.speak('name', 'normal')).not.toThrow();
    expect(() => service.stop()).not.toThrow();
  });
});
```

- [ ] **Step 2: Run service tests to verify RED**

Run:

```powershell
npm test -- src/speech/speechService.test.ts
```

Expected: FAIL because `src/speech/speechService.ts` does not exist.

- [ ] **Step 3: Implement minimal speech service**

Create `src/speech/speechService.ts`:

```ts
export type SpeechRate = 'slow' | 'normal';

export interface SpeechService {
  isSupported: () => boolean;
  speak: (text: string, rate: SpeechRate) => SpeechSynthesisUtterance | null;
  stop: () => void;
}

const rateMap: Record<SpeechRate, number> = {
  slow: 0.75,
  normal: 1,
};

export function createSpeechService(windowRef: Window & typeof globalThis): SpeechService {
  const isSupported = () =>
    typeof windowRef.speechSynthesis !== 'undefined' && typeof windowRef.SpeechSynthesisUtterance !== 'undefined';

  return {
    isSupported,
    speak(text, rate) {
      const trimmedText = text.trim();
      if (!trimmedText || !isSupported()) return null;

      windowRef.speechSynthesis.cancel();
      const utterance = new windowRef.SpeechSynthesisUtterance(trimmedText);
      utterance.lang = 'en-US';
      utterance.rate = rateMap[rate];
      windowRef.speechSynthesis.speak(utterance);
      return utterance;
    },

    stop() {
      if (!isSupported()) return;
      windowRef.speechSynthesis.cancel();
    },
  };
}

export const browserSpeechService = createSpeechService(window);
```

- [ ] **Step 4: Run service tests to verify GREEN**

Run:

```powershell
npm test -- src/speech/speechService.test.ts
```

Expected: PASS.

---

### Task 2: Speech Provider and Hook

**Files:**
- Create: `src/speech/SpeechProvider.tsx`
- Create: `src/speech/SpeechProvider.test.tsx`

- [ ] **Step 1: Write failing provider tests**

Create `src/speech/SpeechProvider.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SpeechProvider, useSpeech } from './SpeechProvider';
import type { SpeechService } from './speechService';

function createService(overrides: Partial<SpeechService> = {}): SpeechService {
  return {
    isSupported: vi.fn(() => true),
    speak: vi.fn(() => ({ onend: null, onerror: null }) as SpeechSynthesisUtterance),
    stop: vi.fn(),
    ...overrides,
  };
}

function TestControls() {
  const speech = useSpeech();
  return (
    <div>
      <p data-testid="active-text">{speech.activeText ?? 'none'}</p>
      <p data-testid="supported">{String(speech.isSupported)}</p>
      <button type="button" onClick={() => speech.speak('name')}>
        Speak name
      </button>
      <button type="button" onClick={() => speech.speak('My name is Li.')}>
        Speak sentence
      </button>
      <button type="button" onClick={speech.stop}>
        Stop
      </button>
    </div>
  );
}

describe('SpeechProvider', () => {
  it('speaks text using the configured rate and tracks the active text', async () => {
    const user = userEvent.setup();
    const service = createService();

    render(
      <SpeechProvider service={service} enabled rate="slow">
        <TestControls />
      </SpeechProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Speak name' }));

    expect(service.speak).toHaveBeenCalledWith('name', 'slow');
    expect(screen.getByTestId('active-text')).toHaveTextContent('name');
  });

  it('stops current speech before speaking a different text', async () => {
    const user = userEvent.setup();
    const service = createService();

    render(
      <SpeechProvider service={service} enabled rate="normal">
        <TestControls />
      </SpeechProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Speak name' }));
    await user.click(screen.getByRole('button', { name: 'Speak sentence' }));

    expect(service.stop).toHaveBeenCalledTimes(1);
    expect(service.speak).toHaveBeenLastCalledWith('My name is Li.', 'normal');
    expect(screen.getByTestId('active-text')).toHaveTextContent('My name is Li.');
  });

  it('clicking the same active text stops it instead of speaking again', async () => {
    const user = userEvent.setup();
    const service = createService();

    render(
      <SpeechProvider service={service} enabled rate="normal">
        <TestControls />
      </SpeechProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Speak name' }));
    await user.click(screen.getByRole('button', { name: 'Speak name' }));

    expect(service.speak).toHaveBeenCalledTimes(1);
    expect(service.stop).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('active-text')).toHaveTextContent('none');
  });

  it('does not speak when reading is disabled', async () => {
    const user = userEvent.setup();
    const service = createService();

    render(
      <SpeechProvider service={service} enabled={false} rate="normal">
        <TestControls />
      </SpeechProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Speak name' }));

    expect(service.speak).not.toHaveBeenCalled();
    expect(screen.getByTestId('active-text')).toHaveTextContent('none');
  });

  it('exposes unsupported state from the service', () => {
    const service = createService({ isSupported: vi.fn(() => false) });

    render(
      <SpeechProvider service={service} enabled rate="normal">
        <TestControls />
      </SpeechProvider>,
    );

    expect(screen.getByTestId('supported')).toHaveTextContent('false');
  });
});
```

- [ ] **Step 2: Run provider tests to verify RED**

Run:

```powershell
npm test -- src/speech/SpeechProvider.test.tsx
```

Expected: FAIL because `SpeechProvider.tsx` does not exist.

- [ ] **Step 3: Implement provider and hook**

Create `src/speech/SpeechProvider.tsx`:

```tsx
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';
import { browserSpeechService, type SpeechRate, type SpeechService } from './speechService';

interface SpeechContextValue {
  activeText: string | null;
  enabled: boolean;
  isSupported: boolean;
  rate: SpeechRate;
  speak: (text: string) => void;
  stop: () => void;
}

const SpeechContext = createContext<SpeechContextValue | null>(null);

export function SpeechProvider({
  children,
  enabled,
  rate,
  service = browserSpeechService,
}: {
  children: ReactNode;
  enabled: boolean;
  rate: SpeechRate;
  service?: SpeechService;
}) {
  const [activeText, setActiveText] = useState<string | null>(null);
  const isSupported = service.isSupported();

  const value = useMemo<SpeechContextValue>(() => {
    const stop = () => {
      service.stop();
      setActiveText(null);
    };

    return {
      activeText,
      enabled,
      isSupported,
      rate,
      speak(text) {
        const trimmedText = text.trim();
        if (!enabled || !isSupported || !trimmedText) return;
        if (activeText === trimmedText) {
          stop();
          return;
        }
        if (activeText) service.stop();

        const utterance = service.speak(trimmedText, rate);
        if (!utterance) return;
        utterance.onend = () => setActiveText(null);
        utterance.onerror = () => setActiveText(null);
        setActiveText(trimmedText);
      },
      stop,
    };
  }, [activeText, enabled, isSupported, rate, service]);

  return <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>;
}

export function useSpeech() {
  const value = useContext(SpeechContext);
  if (!value) {
    throw new Error('useSpeech must be used within SpeechProvider');
  }
  return value;
}
```

- [ ] **Step 4: Run provider tests to verify GREEN**

Run:

```powershell
npm test -- src/speech/SpeechProvider.test.tsx
```

Expected: PASS.

---

### Task 3: Speech Button Component

**Files:**
- Create: `src/components/SpeechButton.tsx`
- Create: `src/components/SpeechButton.test.tsx`

- [ ] **Step 1: Write failing button tests**

Create `src/components/SpeechButton.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SpeechProvider } from '../speech/SpeechProvider';
import type { SpeechService } from '../speech/speechService';
import { SpeechButton } from './SpeechButton';

function createService(overrides: Partial<SpeechService> = {}): SpeechService {
  return {
    isSupported: vi.fn(() => true),
    speak: vi.fn(() => ({ onend: null, onerror: null }) as SpeechSynthesisUtterance),
    stop: vi.fn(),
    ...overrides,
  };
}

function renderButton({
  enabled = true,
  supported = true,
  text = 'name',
}: {
  enabled?: boolean;
  supported?: boolean;
  text?: string;
} = {}) {
  const service = createService({ isSupported: vi.fn(() => supported) });
  render(
    <SpeechProvider service={service} enabled={enabled} rate="normal">
      <SpeechButton text={text} label={`Read ${text}`} />
    </SpeechProvider>,
  );
  return service;
}

describe('SpeechButton', () => {
  it('speaks the provided text when clicked', async () => {
    const user = userEvent.setup();
    const service = renderButton();

    await user.click(screen.getByRole('button', { name: 'Read name' }));

    expect(service.speak).toHaveBeenCalledWith('name', 'normal');
  });

  it('marks itself pressed while its text is active', async () => {
    const user = userEvent.setup();
    renderButton();

    const button = screen.getByRole('button', { name: 'Read name' });
    await user.click(button);

    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('is disabled when reading is disabled', () => {
    renderButton({ enabled: false });

    expect(screen.getByRole('button', { name: 'Read name' })).toBeDisabled();
  });

  it('is disabled when speech is unsupported', () => {
    renderButton({ supported: false });

    expect(screen.getByRole('button', { name: 'Read name' })).toBeDisabled();
  });

  it('is disabled for blank text', () => {
    renderButton({ text: '   ' });

    expect(screen.getByRole('button', { name: 'Read    ' })).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run button tests to verify RED**

Run:

```powershell
npm test -- src/components/SpeechButton.test.tsx
```

Expected: FAIL because `SpeechButton.tsx` does not exist.

- [ ] **Step 3: Implement `SpeechButton`**

Create `src/components/SpeechButton.tsx`:

```tsx
import { useSpeech } from '../speech/SpeechProvider';

export function SpeechButton({ text, label }: { text: string; label: string }) {
  const speech = useSpeech();
  const trimmedText = text.trim();
  const isActive = speech.activeText === trimmedText;
  const isDisabled = !speech.enabled || !speech.isSupported || !trimmedText;

  return (
    <button
      type="button"
      className="secondary-button speech-button"
      aria-label={label}
      aria-pressed={isActive}
      disabled={isDisabled}
      onClick={() => speech.speak(trimmedText)}
    >
      {isActive ? 'Stop' : 'Read'}
    </button>
  );
}
```

- [ ] **Step 4: Run button tests to verify GREEN**

Run:

```powershell
npm test -- src/components/SpeechButton.test.tsx
```

Expected: PASS.

---

### Task 4: App Settings and Provider Wiring

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/MePage.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/components/TodayPage.test.tsx`

- [ ] **Step 1: Add failing settings tests**

Modify `src/App.test.tsx` by adding this test inside `describe('App shell', ...)`:

```tsx
  it('lets the learner disable reading aloud and choose slow voice speed', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Me' }));
    expect(screen.getByRole('checkbox', { name: 'Enable reading aloud' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Normal' })).toBeChecked();

    await user.click(screen.getByRole('checkbox', { name: 'Enable reading aloud' }));
    await user.click(screen.getByRole('radio', { name: 'Slow' }));

    expect(window.localStorage.getItem('basic-english-reading-enabled')).toBe('false');
    expect(window.localStorage.getItem('basic-english-reading-rate')).toBe('slow');
  });
```

Modify `src/components/TodayPage.test.tsx` in `describe('MePage', ...)` by adding:

```tsx
  it('shows reading aloud settings when setting handlers are provided', async () => {
    const user = userEvent.setup();
    const onReadingEnabledChange = vi.fn();
    const onSpeechRateChange = vi.fn();
    const repository = createTestRepository();

    render(
      <MePage
        repository={repository}
        readingEnabled
        speechRate="normal"
        onReadingEnabledChange={onReadingEnabledChange}
        onSpeechRateChange={onSpeechRateChange}
      />,
    );

    await user.click(screen.getByRole('checkbox', { name: 'Enable reading aloud' }));
    await user.click(screen.getByRole('radio', { name: 'Slow' }));

    expect(onReadingEnabledChange).toHaveBeenCalledWith(false);
    expect(onSpeechRateChange).toHaveBeenCalledWith('slow');
  });
```

Also update the existing import in `src/components/TodayPage.test.tsx`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
```

- [ ] **Step 2: Run settings tests to verify RED**

Run:

```powershell
npm test -- src/App.test.tsx src/components/TodayPage.test.tsx
```

Expected: FAIL because `MePage` does not expose reading settings and `App` does not persist reading settings.

- [ ] **Step 3: Wire settings in `App.tsx`**

Modify `src/App.tsx` to include these imports and constants:

```tsx
import { SpeechProvider } from './speech/SpeechProvider';
import type { SpeechRate } from './speech/speechService';

const CHINESE_HELP_STORAGE_KEY = 'basic-english-show-chinese-help';
const READING_ENABLED_STORAGE_KEY = 'basic-english-reading-enabled';
const SPEECH_RATE_STORAGE_KEY = 'basic-english-reading-rate';
```

Replace the current setting readers with:

```tsx
function readInitialChineseHelpSetting() {
  return window.localStorage.getItem(CHINESE_HELP_STORAGE_KEY) === 'true';
}

function readInitialReadingEnabledSetting() {
  return window.localStorage.getItem(READING_ENABLED_STORAGE_KEY) !== 'false';
}

function readInitialSpeechRateSetting(): SpeechRate {
  return window.localStorage.getItem(SPEECH_RATE_STORAGE_KEY) === 'slow' ? 'slow' : 'normal';
}
```

Inside `App`, add state/effects:

```tsx
  const [readingEnabled, setReadingEnabled] = useState(readInitialReadingEnabledSetting);
  const [speechRate, setSpeechRate] = useState<SpeechRate>(readInitialSpeechRateSetting);

  useEffect(() => {
    window.localStorage.setItem(READING_ENABLED_STORAGE_KEY, String(readingEnabled));
  }, [readingEnabled]);

  useEffect(() => {
    window.localStorage.setItem(SPEECH_RATE_STORAGE_KEY, speechRate);
  }, [speechRate]);
```

Wrap the existing `Layout` return in `SpeechProvider`:

```tsx
  return (
    <SpeechProvider enabled={readingEnabled} rate={speechRate}>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'today' && <TodayPage course={week1Course} repository={repository} showChineseHelp={showChineseHelp} />}
        {activeTab === 'course' && <CoursePage course={week1Course} />}
        {activeTab === 'review' && <ReviewPage />}
        {activeTab === 'words' && <WordsPage course={week1Course} showChineseHelp={showChineseHelp} />}
        {activeTab === 'me' && (
          <MePage
            repository={repository}
            showChineseHelp={showChineseHelp}
            onShowChineseHelpChange={setShowChineseHelp}
            readingEnabled={readingEnabled}
            onReadingEnabledChange={setReadingEnabled}
            speechRate={speechRate}
            onSpeechRateChange={setSpeechRate}
          />
        )}
      </Layout>
    </SpeechProvider>
  );
```

- [ ] **Step 4: Add reading settings to `MePage.tsx`**

Modify `src/components/MePage.tsx` imports:

```tsx
import type { SpeechRate } from '../speech/speechService';
```

Extend props:

```tsx
  readingEnabled?: boolean;
  onReadingEnabledChange?: (readingEnabled: boolean) => void;
  speechRate?: SpeechRate;
  onSpeechRateChange?: (speechRate: SpeechRate) => void;
```

Default destructured values:

```tsx
  readingEnabled = true,
  onReadingEnabledChange,
  speechRate = 'normal',
  onSpeechRateChange,
```

Add this section below the Chinese help checkbox inside the existing `Settings` section. If there is not already a single `Settings` section, create one section containing all settings:

```tsx
          {onReadingEnabledChange && (
            <label>
              <input
                type="checkbox"
                checked={readingEnabled}
                onChange={(event) => onReadingEnabledChange(event.target.checked)}
              />{' '}
              Enable reading aloud
            </label>
          )}
          {onSpeechRateChange && (
            <fieldset className="self-rating">
              <legend>Voice speed</legend>
              <label>
                <input
                  type="radio"
                  name="speech-rate"
                  checked={speechRate === 'normal'}
                  onChange={() => onSpeechRateChange('normal')}
                />{' '}
                Normal
              </label>
              <label>
                <input
                  type="radio"
                  name="speech-rate"
                  checked={speechRate === 'slow'}
                  onChange={() => onSpeechRateChange('slow')}
                />{' '}
                Slow
              </label>
            </fieldset>
          )}
```

- [ ] **Step 5: Run settings tests to verify GREEN**

Run:

```powershell
npm test -- src/App.test.tsx src/components/TodayPage.test.tsx
```

Expected: PASS.

---

### Task 5: Words Integration

**Files:**
- Modify: `src/components/WordCards.tsx`
- Modify: `src/components/WordsPage.tsx`
- Modify: `src/components/TodayPage.test.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Add failing Words tests**

In `src/components/TodayPage.test.tsx`, add this helper near `renderTodayWithChineseHelp`:

```tsx
function renderTodayWithSpeech(repository = createTestRepository()) {
  render(
    <SpeechProvider service={createSpeechServiceForTests()} enabled rate="normal">
      <TodayPage course={week1Course} repository={repository} />
    </SpeechProvider>,
  );
  return repository;
}
```

Add this test service helper near `createTestRepository`:

```tsx
function createSpeechServiceForTests() {
  return {
    isSupported: vi.fn(() => true),
    speak: vi.fn(() => ({ onend: null, onerror: null }) as SpeechSynthesisUtterance),
    stop: vi.fn(),
  };
}
```

Add import:

```tsx
import { SpeechProvider } from '../speech/SpeechProvider';
```

Add this test in `describe('TodayPage', ...)`:

```tsx
  it('adds read controls for Today word text, definition, and example', async () => {
    const user = userEvent.setup();

    renderTodayWithSpeech();

    await user.click(await getEnabledContinueButton());

    expect(screen.getByRole('button', { name: 'Read word name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read definition for name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read example for name' })).toBeInTheDocument();
  });
```

In `src/App.test.tsx`, after navigating to Words, add:

```tsx
    expect(screen.getByRole('button', { name: 'Read word name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read definition for name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read example for name' })).toBeInTheDocument();
```

- [ ] **Step 2: Run Words tests to verify RED**

Run:

```powershell
npm test -- src/components/TodayPage.test.tsx src/App.test.tsx
```

Expected: FAIL because Words components do not render speech buttons.

- [ ] **Step 3: Add speech buttons to `WordCards.tsx`**

Modify `src/components/WordCards.tsx`:

```tsx
import { SpeechButton } from './SpeechButton';
```

Replace the word content block with:

```tsx
            <div>
              <p className="word-text">{word.text}</p>
              <SpeechButton text={word.text} label={`Read word ${word.text}`} />
              <p className="muted">{word.definition}</p>
              <SpeechButton text={word.definition} label={`Read definition for ${word.text}`} />
              {showChineseHelp && <p className="muted">Chinese: {word.chinese}</p>}
            </div>
            <p className="example">{word.example}</p>
            <SpeechButton text={word.example} label={`Read example for ${word.text}`} />
```

- [ ] **Step 4: Add speech buttons to `WordsPage.tsx`**

Modify `src/components/WordsPage.tsx`:

```tsx
import { SpeechButton } from './SpeechButton';
```

Replace each word bank item body with:

```tsx
            <strong>{word.text}</strong>
            <SpeechButton text={word.text} label={`Read word ${word.text}`} />
            <span>{word.definition}</span>
            <SpeechButton text={word.definition} label={`Read definition for ${word.text}`} />
            {showChineseHelp && <span>Chinese: {word.chinese}</span>}
            <small>{word.example}</small>
            <SpeechButton text={word.example} label={`Read example for ${word.text}`} />
```

- [ ] **Step 5: Run Words tests to verify GREEN**

Run:

```powershell
npm test -- src/components/TodayPage.test.tsx src/App.test.tsx
```

Expected: PASS.

---

### Task 6: Patterns Integration

**Files:**
- Modify: `src/components/PatternCards.tsx`
- Modify: `src/components/TodayPage.test.tsx`

- [ ] **Step 1: Add failing Patterns test**

Add this test in `src/components/TodayPage.test.tsx`:

```tsx
  it('adds read controls for pattern text, structure, and examples', async () => {
    const user = userEvent.setup();

    renderTodayWithSpeech();

    await user.click(await getEnabledContinueButton());
    await user.click(await getEnabledContinueButton());

    expect(screen.getByRole('button', { name: 'Read pattern My name is ___.' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read structure My name is {name}.' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read example My name is Li.' })).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run Patterns test to verify RED**

Run:

```powershell
npm test -- src/components/TodayPage.test.tsx
```

Expected: FAIL because `PatternCards` has no speech buttons.

- [ ] **Step 3: Add speech buttons to `PatternCards.tsx`**

Modify `src/components/PatternCards.tsx`:

```tsx
import { SpeechButton } from './SpeechButton';
```

Replace the pattern card body with:

```tsx
            <div>
              <p className="pattern-title">{pattern.title}</p>
              <SpeechButton text={pattern.title} label={`Read pattern ${pattern.title}`} />
              <p className="muted">Use: {pattern.use}</p>
            </div>
            <p className="structure">{pattern.structure}</p>
            <SpeechButton text={pattern.structure} label={`Read structure ${pattern.structure}`} />
            <div className="example-list">
              {pattern.examples.map((example) => (
                <div key={example}>
                  <p className="example">{example}</p>
                  <SpeechButton text={example} label={`Read example ${example}`} />
                </div>
              ))}
            </div>
```

- [ ] **Step 4: Run Patterns test to verify GREEN**

Run:

```powershell
npm test -- src/components/TodayPage.test.tsx
```

Expected: PASS.

---

### Task 7: E2E Coverage

**Files:**
- Modify: `tests/e2e/basic-english.spec.ts`

- [ ] **Step 1: Add failing E2E assertions**

In `tests/e2e/basic-english.spec.ts`, update the Day 1 flow test after `await continueTo(page, 'name');`:

```ts
    await expect(page.getByRole('button', { name: 'Read word name' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Read definition for name' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Read example for name' })).toBeVisible();
```

After `await continueTo(page, 'Patterns');`, add:

```ts
    await expect(page.getByRole('button', { name: 'Read pattern My name is ___.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Read structure My name is {name}.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Read example My name is Li.' })).toBeVisible();
```

In the navigation/settings test after opening `Me`, add:

```ts
    await expect(page.getByLabel('Enable reading aloud')).toBeChecked();
    await page.getByLabel('Enable reading aloud').uncheck();
    await page.getByRole('button', { name: 'Words' }).click();
    await expect(page.getByRole('button', { name: 'Read word name' })).toBeDisabled();
```

- [ ] **Step 2: Run E2E to verify RED**

Run:

```powershell
npm run test:e2e
```

Expected: FAIL because speech buttons/settings are not fully implemented yet if this task is run before Tasks 4-6, or PASS if Tasks 4-6 are already complete. If it passes immediately after Tasks 4-6, this is acceptable because the behavior was already test-covered at lower levels first.

- [ ] **Step 3: Adjust E2E only if browser speech support makes disabled-state flaky**

If the disabled assertion fails because the button is already disabled due missing `speechSynthesis` in the browser, replace:

```ts
    await expect(page.getByRole('button', { name: 'Read word name' })).toBeDisabled();
```

with:

```ts
    const readWordButton = page.getByRole('button', { name: 'Read word name' });
    await expect(readWordButton).toBeVisible();
    await expect(readWordButton).toBeDisabled();
```

Do not assert that audio actually plays in E2E. Browser audio output is not a reliable automated test target here.

- [ ] **Step 4: Run E2E to verify GREEN**

Run:

```powershell
npm run test:e2e
```

Expected: PASS with `5 passed, 1 skipped`.

---

### Task 8: Final Verification

**Files:**
- No source changes unless verification exposes a concrete issue.

- [ ] **Step 1: Run all unit tests**

Run:

```powershell
npm test
```

Expected: all Vitest files pass.

- [ ] **Step 2: Run production build**

Run:

```powershell
npm run build
```

Expected: TypeScript and Vite build complete successfully.

- [ ] **Step 3: Run full E2E**

Run:

```powershell
npm run test:e2e
```

Expected: Playwright reports all non-skipped tests passing.

- [ ] **Step 4: Manual browser smoke check**

Run:

```powershell
npm run dev -- --port 5188 --strictPort
```

Open `http://127.0.0.1:5188/` and verify:

- Today Words step shows `Read` buttons beside word, definition, and example.
- Today Patterns step shows `Read` buttons beside pattern, structure, and examples.
- Clicking a `Read` button starts speech in a supported browser.
- Clicking the same active button stops speech.
- `Me > Enable reading aloud` disables the `Read` buttons.
- `Me > Voice speed > Slow` makes future speech use slow rate.

Stop the dev server after checking.

---

## Self-Review

- Spec coverage: MVP click-to-read for Words and Patterns is covered by Tasks 1-7. Settings for enable/disable and slow/normal speed are covered by Task 4. E2E covers visible controls and disabled state without requiring real audio output.
- Scope control: Automatic playback and follow-reading are deliberately excluded from this plan; they remain future phases.
- Placeholder scan: No `TBD`, `TODO`, or unspecified implementation steps remain.
- Type consistency: `SpeechRate`, `SpeechService`, `SpeechProvider`, `useSpeech`, and `SpeechButton` signatures are consistent across tasks.
