import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { capabilityChecksByDayId } from '../content/capabilityChecks';
import { SpeechProvider } from '../speech/SpeechProvider';
import type { SpeechService } from '../speech/speechService';
import { createIndexedDbProgressRepository } from '../storage/indexedDbProgressRepository';
import { CapabilityCheckPanel } from './CapabilityCheckPanel';

afterEach(() => cleanup());

function renderPanel(dbName: string) {
  const repository = createIndexedDbProgressRepository(dbName);
  const service: SpeechService = {
    isSupported: () => true,
    speak: vi.fn(() => ({ text: '', rate: 1, lang: 'en-US' })),
    stop: vi.fn(),
  };
  render(
    <SpeechProvider enabled rate="normal" service={service}>
      <CapabilityCheckPanel task={capabilityChecksByDayId['day-001']} repository={repository} />
    </SpeechProvider>,
  );
  return repository;
}

function renderPanelWithProps(dbName: string, onCompletionChange: (isComplete: boolean) => void) {
  const repository = createIndexedDbProgressRepository(dbName);
  const listAttempts = vi.spyOn(repository, 'listCapabilityCheckAttempts');
  const service: SpeechService = {
    isSupported: () => true,
    speak: vi.fn(() => ({ text: '', rate: 1, lang: 'en-US' })),
    stop: vi.fn(),
  };
  const view = render(
    <SpeechProvider enabled rate="normal" service={service}>
      <CapabilityCheckPanel
        task={capabilityChecksByDayId['day-001']}
        repository={repository}
        onCompletionChange={onCompletionChange}
      />
    </SpeechProvider>,
  );

  return { repository, service, view, listAttempts };
}

describe('CapabilityCheckPanel', () => {
  it('saves clear output without hints as independent', async () => {
    const user = userEvent.setup();
    const repository = renderPanel('capability-check-independent');

    await screen.findByRole('heading', { name: 'Introduce yourself' });
    await user.click(screen.getByRole('button', { name: 'Play mission audio' }));
    await user.click(screen.getByLabelText('She is a student.'));
    await user.type(screen.getByLabelText('Your answer'), 'My name is Li. I am from China. I am a student.');
    await user.click(screen.getByLabelText('My answer includes all three ideas.'));
    await user.click(screen.getByLabelText('Clear'));
    await user.click(screen.getByRole('button', { name: 'Save capability check' }));

    expect(await screen.findByText('Independent')).toBeInTheDocument();
    await expect(repository.listCapabilityCheckAttempts!('introduce-myself')).resolves.toEqual([
      expect.objectContaining({ result: 'independent', usedHints: [] }),
    ]);
  });

  it('records opened support and saves a clear answer as with help', async () => {
    const user = userEvent.setup();
    const repository = renderPanel('capability-check-with-help');

    await screen.findByRole('heading', { name: 'Introduce yourself' });
    await user.click(screen.getByRole('button', { name: 'Play mission audio' }));
    await user.click(screen.getByLabelText('She is a student.'));
    await user.click(screen.getByRole('button', { name: 'Show keywords' }));
    await user.type(screen.getByLabelText('Your answer'), 'My name is Li. I am from China. I am a student.');
    await user.click(screen.getByLabelText('My answer includes all three ideas.'));
    await user.click(screen.getByLabelText('Clear'));
    await user.click(screen.getByRole('button', { name: 'Save capability check' }));

    expect(await screen.findByText('With help')).toBeInTheDocument();
    await waitFor(async () => {
      await expect(repository.listCapabilityCheckAttempts!('introduce-myself')).resolves.toEqual([
        expect.objectContaining({ result: 'with-help', usedHints: ['keywords'] }),
      ]);
    });
  });

  it('does not reload or stop speech when the parent replaces its completion callback', async () => {
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();
    const { repository, service, view, listAttempts } = renderPanelWithProps('capability-check-stable-callback', firstCallback);

    await screen.findByRole('heading', { name: 'Introduce yourself' });
    expect(firstCallback).toHaveBeenCalledWith(false);
    expect(listAttempts).toHaveBeenCalledTimes(1);

    view.rerender(
      <SpeechProvider enabled rate="normal" service={service}>
        <CapabilityCheckPanel
          task={capabilityChecksByDayId['day-001']}
          repository={repository}
          onCompletionChange={secondCallback}
        />
      </SpeechProvider>,
    );

    expect(screen.queryByText('Loading your latest check...')).not.toBeInTheDocument();
    expect(listAttempts).toHaveBeenCalledTimes(1);
    expect(service.stop).not.toHaveBeenCalled();
  });
});
