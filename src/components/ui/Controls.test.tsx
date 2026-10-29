import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AnswerOption, Button, IconButton } from './Button';
import { Checkbox, RadioGroup, Switch } from './SelectionControls';
import { Select, TextArea, TextField } from './TextFields';

afterEach(cleanup);

describe('UI control contracts', () => {
  it('keeps locked answers selected without activating them again', async () => {
    const activate = vi.fn();
    render(<AnswerOption selected result="retry" disabled onClick={activate}>A book</AnswerOption>);
    const answer = screen.getByRole('button', { name: 'A book' });
    expect(answer).toHaveAttribute('aria-pressed', 'true');
    expect(answer).toHaveAttribute('data-result', 'retry');
    await userEvent.click(answer);
    expect(activate).not.toHaveBeenCalled();
  });

  it('makes the complete checkbox label clickable and separates its description', async () => {
    render(<Checkbox label="I used the word." hint="A self-check, not a score." defaultChecked={false} />);
    const checkbox = screen.getByRole('checkbox', { name: 'I used the word.' });
    expect(checkbox).toHaveAccessibleDescription('A self-check, not a score.');
    await userEvent.click(screen.getByText('I used the word.'));
    expect(checkbox).toBeChecked();
    await userEvent.keyboard(' ');
    expect(checkbox).not.toBeChecked();
  });

  it('keeps a switch label stable while its native checked state changes', async () => {
    function Example() {
      const [enabled, setEnabled] = useState(false);
      return <Switch label="Reading aloud" checked={enabled} onChange={event => setEnabled(event.target.checked)} />;
    }
    render(<Example />);
    const control = screen.getByRole('switch', { name: 'Reading aloud' });
    await userEvent.click(control);
    expect(control).toBeChecked();
    expect(control).toHaveAccessibleName('Reading aloud');
    await userEvent.keyboard(' ');
    expect(control).not.toBeChecked();
  });

  it('does not activate disabled controls and retains their selected state', async () => {
    const change = vi.fn();
    render(<><Checkbox label="Saved check" checked disabled onChange={change} /><Switch label="Saved setting" checked disabled onChange={change} /></>);
    for (const role of ['checkbox', 'switch']) {
      const control = screen.getByRole(role);
      expect(control).toBeDisabled();
      await userEvent.click(control);
      expect(control).toBeChecked();
    }
    expect(change).not.toHaveBeenCalled();
  });

  it('isolates radio groups even when they have the same option values', async () => {
    const options = [{ value: 'normal', label: 'Normal' }, { value: 'slow', label: 'Slow' }];
    function Example() {
      const [first, setFirst] = useState('normal');
      const [second, setSecond] = useState('normal');
      return <><RadioGroup label="First speed" options={options} value={first} onValueChange={setFirst} />
        <RadioGroup label="Second speed" options={options} value={second} onValueChange={setSecond} /></>;
    }
    render(<Example />);
    const slow = screen.getAllByRole('radio', { name: 'Slow' });
    expect(slow[0].getAttribute('name')).not.toBe(slow[1].getAttribute('name'));
    await userEvent.click(slow[0]);
    expect(slow[0]).toBeChecked();
    expect(slow[1]).not.toBeChecked();
    expect(screen.getAllByRole('radio', { name: 'Normal' })[1]).toBeChecked();
  });

  it('defaults actions to button type and prevents activation while loading', async () => {
    const submit = vi.fn(event => event.preventDefault());
    const activate = vi.fn();
    const view = render(<form onSubmit={submit}><Button onClick={activate}>Save</Button></form>);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(activate).toHaveBeenCalledOnce();
    expect(submit).not.toHaveBeenCalled();
    view.rerender(<Button loading loadingLabel="Saving…" onClick={activate}>Save</Button>);
    const pending = screen.getByRole('button', { name: 'Saving…' });
    expect(pending).toHaveAttribute('aria-busy', 'true');
    expect(pending).toBeDisabled();
    await userEvent.click(pending);
    expect(activate).toHaveBeenCalledOnce();
  });

  it('requires a usable name for icon-only actions', () => {
    render(<IconButton label="Play example" icon={<svg />} />);
    expect(screen.getByRole('button', { name: 'Play example' })).toBeEnabled();
  });

  it('connects labels, help, and errors without colliding generated ids', async () => {
    function Example() {
      const [word, setWord] = useState('');
      return <><TextField label="Word" value={word} onChange={event => setWord(event.target.value)} hint="Use English." error={word ? undefined : 'Write a word.'} />
        <TextField label="Another word" /><TextArea label="Your sentence" hint="Make it your own." />
        <Select label="Stage" hint="Choose a course stage."><option value="1">First stage</option></Select></>;
    }
    render(<Example />);
    const word = screen.getByRole('textbox', { name: 'Word' });
    expect(word).toHaveAttribute('aria-invalid', 'true');
    expect(word).toHaveAccessibleDescription('Use English. Write a word.');
    expect(word.id).not.toBe(screen.getByRole('textbox', { name: 'Another word' }).id);
    expect(screen.getByRole('textbox', { name: 'Your sentence' })).toHaveAccessibleDescription('Make it your own.');
    expect(screen.getByRole('combobox', { name: 'Stage' })).toHaveAccessibleDescription('Choose a course stage.');
    await userEvent.type(word, 'give');
    expect(word).not.toHaveAttribute('aria-invalid', 'true');
    expect(word).toHaveAccessibleDescription('Use English.');
  });
});
