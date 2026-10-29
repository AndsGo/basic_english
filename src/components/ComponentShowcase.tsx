import { useEffect, useState } from 'react';
import { AnswerOption, Button, IconButton } from './ui/Button';
import { FieldGroup } from './ui/FormField';
import { Checkbox, RadioGroup, Switch } from './ui/SelectionControls';
import { Select, TextArea, TextField } from './ui/TextFields';
import './ui/ui.css';
import './componentShowcase.css';

const voiceOptions = [{ value: 'normal', label: 'Normal', hint: 'A comfortable everyday pace.' }, { value: 'slow', label: 'Slow', hint: 'More time to hear each word.' }];
const playIcon = <svg viewBox="0 0 24 24"><path d="m9 5 11 7-11 7ZM4 8v8" /></svg>;
const stopIcon = <svg viewBox="0 0 24 24"><path d="M6 6h12v12H6Z" /></svg>;

export default function ComponentShowcase() {
  const [theme, setTheme] = useState('light');
  const [chinese, setChinese] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('Try an action. Demo changes stay on this page.');
  const [checked, setChecked] = useState(false);
  const [audio, setAudio] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [voice, setVoice] = useState('normal');
  const [confidence, setConfidence] = useState('building');
  const [query, setQuery] = useState('');
  const [sentence, setSentence] = useState('I give a book to my friend.');
  const [requiredWord, setRequiredWord] = useState('');
  const [stage, setStage] = useState('1');
  const [answer, setAnswer] = useState('');
  const [answerCount, setAnswerCount] = useState(0);

  useEffect(() => {
    const previous = document.documentElement.dataset.theme;
    document.documentElement.dataset.theme = theme;
    return () => {
      if (previous) document.documentElement.dataset.theme = previous;
      else delete document.documentElement.dataset.theme;
    };
  }, [theme]);

  return <main className="component-showcase">
    <header className="showcase-header">
      <div><p className="showcase-kicker">Basic English / Design workshop</p><h1>A calmer way to choose.</h1>
        <p className="showcase-lead">Real components. Clear states. One familiar learning space.</p>
        <p className="ui-field-hint">Phase 1 · Component review only. Learning records, speech, and personal settings are not changed.</p>
      </div>
      <a className="showcase-back" href={import.meta.env.BASE_URL}>Back to the app ↗</a>
    </header>

    <section className="showcase-toolbar" aria-label="Preview settings">
      <RadioGroup label="Preview theme" options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} value={theme} onValueChange={setTheme} />
      <Switch label="Show Chinese examples" checked={chinese} onChange={event => setChinese(event.target.checked)} hint="Help text for checking bilingual layouts." />
    </section>
    <nav className="showcase-index" aria-label="Component sections">
      <a href="#showcase-buttons">Buttons</a><a href="#showcase-choices">Choices</a><a href="#showcase-fields">Fields</a><a href="#showcase-answers">Learning states</a><a href="#showcase-keyboard">Keyboard review</a>
    </nav>

    <section className="showcase-section" id="showcase-buttons" aria-labelledby="buttons-title">
      <div className="showcase-section-heading"><p className="showcase-kicker">01 / Actions</p><h2 id="buttons-title">An action has a clear place.</h2><p>One primary action per task. Quiet actions and playback stay distinct.</p></div>
      <div className="showcase-grid">
        <article className="showcase-panel"><h3>Default actions</h3><div className="showcase-actions">
          <Button onClick={() => setMessage('Demo saved. No learning records changed.')}>Save example</Button>
          <Button variant="secondary" onClick={() => setMessage('Demo returned to the previous page.')}>Previous page</Button>
          <Button variant="quiet" onClick={() => setMessage('Demo help is available next to each field.')}>Show help</Button>
        </div><p className="showcase-feedback" role="status">{message}</p></article>
        <article className="showcase-panel"><h3>Pending and unavailable</h3>
          <Switch label="Simulate saving" checked={saving} onChange={event => setSaving(event.target.checked)} />
          <div className="showcase-actions"><Button loading={saving} loadingLabel="Saving…" onClick={() => setMessage('Demo save activated.')}>Save sentence</Button><Button variant="secondary" disabled>Continue</Button></div>
          <p className="ui-field-hint">Turn the switch off to end the pending state. Button width stays stable.</p>
        </article>
        <article className="showcase-panel"><h3>Playback control</h3><div className="showcase-actions">
          <IconButton icon={playing ? stopIcon : playIcon} label={playing ? 'Stop playback demo' : 'Play playback demo'} aria-pressed={playing} onClick={() => setPlaying(current => !current)} />
          <IconButton icon={playIcon} label="Playback unavailable demo" disabled />
        </div><p className="ui-field-hint">{playing ? 'Playing state shown.' : 'Ready state shown.'} This example does not play sound.</p></article>
      </div>
    </section>

    <section className="showcase-section" id="showcase-choices" aria-labelledby="choices-title">
      <div className="showcase-section-heading"><p className="showcase-kicker">02 / Selection</p><h2 id="choices-title">A whole row you can touch.</h2><p>Settings, self-checks, and exclusive choices keep their own meaning.</p></div>
      <div className="showcase-grid">
        <article className="showcase-panel"><h3>Self-check · checkbox</h3><FieldGroup label="Check your meaning" hint="Each statement is independent.">
          <Checkbox label="I used the word in my own sentence." checked={checked} onChange={event => setChecked(event.target.checked)} hint={chinese ? '我在自己的句子中使用了这个词。' : 'Select or clear this statement.'} />
          <Checkbox label="A checked, unavailable example" checked disabled hint="The checked mark remains visible." />
          <Checkbox label="An unavailable example" checked={false} disabled />
          <Checkbox label="I described who gives the book, what is given, and who receives it, so another person can understand my meaning without seeing the picture." defaultChecked hint={chinese ? '长文本检查：我说明了谁给出什么、给谁；窄屏与文字放大后，句子和控件仍应完整可见。' : 'A long label checks wrapping without moving or shrinking the marker.'} />
        </FieldGroup></article>
        <article className="showcase-panel"><h3>One preference · radio</h3><RadioGroup label="Voice speed" options={voiceOptions} value={voice} onValueChange={setVoice} />
          <p className="ui-field-hint">Arrow keys change this preference. They never submit an answer.</p>
          <RadioGroup label="Unavailable preference" options={voiceOptions} value="slow" disabled onValueChange={() => {}} />
        </article>
        <article className="showcase-panel"><h3>Immediate setting · switch</h3>
          <Switch label="Enable audio examples" checked={audio} onChange={event => setAudio(event.target.checked)} hint={chinese ? '演示开关，不改变应用的实际语音设置。' : 'Changes only the demo state; no speech is started.'} />
          <Switch label="An unavailable switch" checked disabled />
          <RadioGroup label="How clear is your meaning?" value={confidence} onValueChange={setConfidence} options={[
            { value: 'clear', label: 'Clear' }, { value: 'building', label: 'Still building', hint: chinese ? '我还需要再练习。' : 'I need a little more practice.' }, { value: 'later', label: 'Not available in this example', disabled: true },
          ]} />
        </article>
      </div>
    </section>

    <section className="showcase-section" id="showcase-fields" aria-labelledby="fields-title">
      <div className="showcase-section-heading"><p className="showcase-kicker">03 / Writing</p><h2 id="fields-title">Labels stay. Your words stay.</h2><p>Help and errors belong to the field they explain.</p></div>
      <div className="showcase-grid">
        <article className="showcase-panel"><h3>Search and selection</h3>
          <TextField type="search" label="Search stories" value={query} onChange={event => setQuery(event.target.value)} placeholder="Title or word" hint={chinese ? '输入书名或重点词，例如 give。' : 'Try a word such as give.'} />
          <Select label="Course stage" value={stage} onChange={event => setStage(event.target.value)} hint="This native select keeps the platform picker.">
            {[1, 2, 3, 4].map(number => <option key={number} value={number}>Weeks {(number - 1) * 13 + 1}–{number * 13}</option>)}
          </Select>
          <p className="ui-field-hint">Demo search: {query || 'empty'} · Stage {stage}</p>
        </article>
        <article className="showcase-panel"><h3>Write a little English</h3>
          <TextArea label="Your sentence" value={sentence} onChange={event => setSentence(event.target.value)} hint={chinese ? '示例输入只在当前展示页保留，不会保存到学习记录。' : 'Example input stays in this preview only.'} />
          <TextField label="A field that needs attention" value={requiredWord} onChange={event => setRequiredWord(event.target.value)} hint="Type a word to clear the error." error={requiredWord.trim() ? undefined : 'Please write at least one word.'} />
        </article>
        <article className="showcase-panel"><h3>Read-only and disabled</h3>
          <TextField label="Reference sentence" value="I give a book to my friend." readOnly hint="You can focus and copy a read-only value." />
          <TextField label="Unavailable input" value="Waiting for a previous task" disabled />
          <TextArea label="Unavailable writing area" value="Complete the current task first." disabled />
          <Select label="Unavailable stage" disabled defaultValue="1"><option value="1">Weeks 1–13</option></Select>
        </article>
      </div>
    </section>

    <section className="showcase-section" id="showcase-answers" aria-labelledby="answers-title">
      <div className="showcase-section-heading"><p className="showcase-kicker">04 / Learning states</p><h2 id="answers-title">Selected is different from correct.</h2><p>These are visual examples, separate from the course assessment system.</p></div>
      <div className="showcase-grid">
        <article className="showcase-panel"><h3>Explicit answer action</h3><p>Who has the book after I give it to my friend?</p>
          <div className="showcase-answer-list" role="group" aria-label="Demo answer actions">
            {['My friend has the book.', 'I keep the book.'].map(option => <AnswerOption key={option} className="showcase-answer" selected={answer === option} onClick={() => { setAnswer(option); setAnswerCount(count => count + 1); }}>{option}</AnswerOption>)}
          </div><p className="showcase-feedback" role="status">Answer activations: {answerCount}. {answer ? 'Demo selection recorded on this page only.' : 'Activate an answer button to choose.'}</p>
        </article>
        <article className="showcase-panel"><h3>Correct and locked</h3><AnswerOption className="showcase-answer" disabled selected result="correct">My friend has the book.</AnswerOption>
          <p className="showcase-feedback">✓ Correct answer · locked</p><p className="ui-field-hint">A locked answer retains its selected mark and meaning.</p>
        </article>
        <article className="showcase-panel"><h3>Try again</h3><AnswerOption className="showcase-answer" selected result="retry" onClick={() => setMessage('Retry example activated. No assessment was saved.')}>I keep the book.</AnswerOption>
          <p className="showcase-feedback">Look again at who receives the book.</p><p className="ui-field-hint">Feedback uses words as well as color. A retry never erases an input automatically.</p>
        </article>
      </div>
    </section>

    <section className="showcase-keyboard" id="showcase-keyboard" aria-labelledby="keyboard-title"><p className="showcase-kicker">Review checklist</p><h2 id="keyboard-title">Try it with a keyboard.</h2>
      <ul><li>Tab moves between controls. Space toggles a checkbox or switch.</li><li>Arrow keys move within a radio group. They do not activate answer buttons.</li><li>Disabled controls stay unavailable. Read-only fields can still be copied.</li><li>Check light and dark themes, 320px width, long text, and Chinese examples.</li><li>In high-contrast mode, native selection markers remain visible.</li></ul>
      <p className="ui-field-hint">Production pages use the shared controls shown here. This workshop keeps its demo state separate from your learning records.</p>
    </section>
  </main>;
}
