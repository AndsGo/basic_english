import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { week1Course } from './content/week1';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('App shell', () => {
  it('opens on Today and switches between mobile navigation tabs', async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(screen.getByRole('heading', { name: 'My Name' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quick Review' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Course' }));
    expect(screen.getByRole('heading', { name: week1Course.weeks[0].title })).toBeInTheDocument();
    expect(screen.getAllByText(/Day \d:/)).toHaveLength(7);

    await user.click(screen.getByRole('button', { name: 'Words' }));
    expect(screen.getByRole('heading', { name: 'Week 1 Words' })).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('what a person is called')).toBeInTheDocument();
    expect(screen.queryByText(/名字/)).not.toBeInTheDocument();
    expect(screen.getByText('My name is Li.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read word name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read definition for name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read example for name' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Review' }));
    expect(screen.getByRole('heading', { name: 'Review' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Me' }));
    expect(screen.getByRole('heading', { name: 'My Progress' })).toBeInTheDocument();
  });

  it('shows Chinese word help only after the learner enables it', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Words' }));
    expect(screen.getByText('what a person is called')).toBeInTheDocument();
    expect(screen.queryByText(/名字/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Me' }));
    await user.click(screen.getByRole('checkbox', { name: 'Show Chinese help' }));
    await user.click(screen.getByRole('button', { name: 'Words' }));

    expect(screen.getByText('what a person is called')).toBeInTheDocument();
    expect(screen.getByText(/名字/)).toBeInTheDocument();
  });

  it('persists reading aloud settings from the Me page', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Me' }));

    const readingCheckbox = screen.getByRole('checkbox', { name: 'Enable reading aloud' });
    expect(readingCheckbox).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Normal' })).toBeChecked();

    await user.click(readingCheckbox);
    await user.click(screen.getByRole('radio', { name: 'Slow' }));

    expect(window.localStorage.getItem('basic-english-reading-enabled')).toBe('false');
    expect(window.localStorage.getItem('basic-english-reading-rate')).toBe('slow');
  });

  it('uses default reading settings when localStorage reads fail during initial render', async () => {
    const user = userEvent.setup();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('localStorage read failed');
    });

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Me' }));

    expect(screen.getByRole('heading', { name: 'My Progress' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Enable reading aloud' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Normal' })).toBeChecked();
  });

  it('keeps reading settings in memory when localStorage writes fail after a change', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Me' }));
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('localStorage write failed');
    });

    await user.click(screen.getByRole('checkbox', { name: 'Enable reading aloud' }));
    await user.click(screen.getByRole('radio', { name: 'Slow' }));

    expect(screen.getByRole('checkbox', { name: 'Enable reading aloud' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Slow' })).toBeChecked();
  });
});
