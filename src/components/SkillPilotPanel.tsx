import { useEffect, useRef, useState } from 'react';
import type { SkillLessonContent, SpeakingTaskContent } from '../content/skillLessons';
import { createSkillAttempt, type LocalRecording, type SpeakingSelfMark } from '../domain/skillTraining';
import { useSpeech } from '../speech/SpeechProvider';
import type { ProgressRepository } from '../storage/progressRepository';

type RecorderState = 'idle' | 'requesting' | 'recording' | 'saving' | 'error';

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
}

function preferredMimeType() {
  if (typeof MediaRecorder === 'undefined') return undefined;
  return ['audio/webm;codecs=opus', 'audio/mp4'].find((type) => MediaRecorder.isTypeSupported(type));
}

function SpeakingPractice({
  task,
  dayId,
  revision,
  repository,
  onChanged,
}: {
  task: SpeakingTaskContent;
  dayId: string;
  revision: number;
  repository: ProgressRepository;
  onChanged: () => void;
}) {
  const speech = useSpeech();
  const [state, setState] = useState<RecorderState>('idle');
  const [message, setMessage] = useState('');
  const [recording, setRecording] = useState<LocalRecording | null>(null);
  const [hasPlayedRecording, setHasPlayedRecording] = useState(false);
  const [selfMark, setSelfMark] = useState<SpeakingSelfMark | null>(null);
  const [showKeywords, setShowKeywords] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);

  const recordSupported = typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== 'undefined';

  useEffect(() => () => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const recordHint = async (kind: 'keywords' | 'reference') => {
    if (kind === 'keywords') setShowKeywords(true);
    else setShowReference(true);
    if (!repository.saveSkillAttempt) return;
    const now = new Date().toISOString();
    await repository.saveSkillAttempt({ ...createSkillAttempt({
      id: newId('hint'), dayId, taskId: task.id, skill: 'speaking', revision, createdAt: new Date().toISOString(),
    }), hintEvents: [{ kind, at: now }] });
  };

  const startRecording = async () => {
    if (!recordSupported || state !== 'idle') return;
    speech.stop();
    setState('requesting');
    setMessage('Waiting for microphone permission...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = preferredMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      startedAtRef.current = Date.now();
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        setState('error');
        setMessage('Recording stopped before it could be saved. Try again or skip this practice.');
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || 'audio/webm' });
        if (blob.size === 0 || blob.size > 5 * 1024 * 1024) {
          setState('error');
          setMessage(blob.size === 0 ? 'No audio was saved. Check your microphone and try again.' : 'This recording is too large. Keep it under one minute.');
          return;
        }
        setState('saving');
        const now = new Date().toISOString();
        const attemptId = newId('speaking-attempt');
        const nextRecording: LocalRecording = {
          id: newId('recording'), dayId, taskId: task.id, attemptId, blob, mimeType: blob.type, bytes: blob.size,
          durationMs: Date.now() - startedAtRef.current, createdAt: now,
        };
        try {
          await repository.saveLocalRecording?.(nextRecording);
          await repository.saveSkillAttempt?.({ ...createSkillAttempt({
            id: attemptId, dayId, taskId: task.id, skill: 'speaking', revision, createdAt: now, recordingId: nextRecording.id,
          }), hintEvents: [
            ...(showKeywords ? [{ kind: 'keywords' as const, at: now }] : []),
            ...(showReference ? [{ kind: 'reference' as const, at: now }] : []),
          ] });
          setRecording(nextRecording);
          setHasPlayedRecording(false);
          setSelfMark(null);
          setState('idle');
          setMessage('Saved on this device. Play it once, then choose your self-check.');
          onChanged();
        } catch {
          setState('error');
          setMessage('The recording could not be saved. Clear some recordings or try again.');
        }
      };
      recorderRef.current = recorder;
      recorder.start();
      setState('recording');
      setMessage('Recording. Select Stop when you finish.');
      window.setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, 60_000);
    } catch {
      setState('error');
      setMessage('Microphone permission is unavailable. You can try again or skip this practice.');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  };

  const playRecording = () => {
    if (!recording) return;
    speech.stop();
    const url = URL.createObjectURL(recording.blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      setMessage('This recording cannot be played. Record it again.');
    };
    void audio.play();
    setHasPlayedRecording(true);
    setMessage('Playing your recording.');
    onChanged();
  };

  const saveSelfMark = async (mark: SpeakingSelfMark) => {
    if (!recording || !hasPlayedRecording) return;
    const now = new Date().toISOString();
    await repository.saveSkillAttempt?.(createSkillAttempt({
      id: newId('speaking-check'), dayId, taskId: task.id, skill: 'speaking', revision, createdAt: now,
      recordingId: recording.id, playbackStartedAt: now, selfMark: mark,
    }));
    setSelfMark(mark);
    setMessage(mark === 'clear' ? 'Practice saved. You can continue.' : 'Saved for another practice later.');
    onChanged();
  };

  return <article className="skill-task speaking-task">
    <div className="section-header"><h4>{task.model ? 'Repeat' : 'Say it yourself'}</h4><span className="skill-status">Speaking</span></div>
    <p>{task.goal}</p>
    {task.model && <button type="button" className="secondary-button" onClick={() => speech.speak(task.model, `pilot-model-${task.id}`)} disabled={state === 'recording'}>{speech.activeId === `pilot-model-${task.id}` ? 'Stop model' : 'Play model'}</button>}
    <div className="hint-actions">
      <button type="button" className="text-button" onClick={() => void recordHint('keywords')}>Show keywords</button>
      <button type="button" className="text-button" onClick={() => void recordHint('reference')}>Show reference</button>
    </div>
    {showKeywords && <p className="hint-content">{task.keywords.join(' · ')}</p>}
    {showReference && <p className="hint-content">{task.reference}</p>}
    <div className="recording-actions">
      {state === 'recording' ? <button type="button" className="primary-button" onClick={stopRecording}>Stop recording</button> : <button type="button" className="primary-button" onClick={() => void startRecording()} disabled={!recordSupported || state === 'requesting' || state === 'saving'}>{state === 'requesting' ? 'Waiting...' : state === 'saving' ? 'Saving...' : 'Record answer'}</button>}
      {recording && <button type="button" className="secondary-button" onClick={playRecording}>Play recording</button>}
    </div>
    {recording && !selfMark && <div className="self-check" aria-label="Speaking self-check"><p>{hasPlayedRecording ? 'After listening, was your meaning clear?' : 'Play your recording once before your self-check.'}</p><button type="button" className="secondary-button" disabled={!hasPlayedRecording} onClick={() => void saveSelfMark('clear')}>Clear</button><button type="button" className="secondary-button" disabled={!hasPlayedRecording} onClick={() => void saveSelfMark('try_again')}>Try again</button></div>}
    {message && <p className="helper-text" role="status">{message}</p>}
    {!recordSupported && <p role="alert">Recording is unavailable in this browser. You can use the text model and continue with the lesson.</p>}
  </article>;
}

export function SkillPilotPanel({ lesson, repository }: { lesson: SkillLessonContent; repository: ProgressRepository }) {
  const speech = useSpeech();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [showTranscript, setShowTranscript] = useState<Record<string, boolean>>({});
  const [speakingPending, setSpeakingPending] = useState(false);

  const saveListening = async (taskId: string, answer: string) => {
    const task = lesson.listening.find((item) => item.id === taskId);
    if (!task) return;
    const now = new Date().toISOString();
    await repository.saveSkillAttempt?.(createSkillAttempt({ id: newId('listening-attempt'), dayId: lesson.dayId, taskId, skill: 'listening', revision: lesson.revision, createdAt: now, answer, correct: answer === task.answer }));
    setSubmitted((current) => ({ ...current, [taskId]: true }));
    const complete = lesson.listening.every((item) => item.id === taskId || submitted[item.id]);
    if (complete) await repository.saveSkillDayProgress?.({ id: lesson.dayId, dayId: lesson.dayId, revision: lesson.revision, listeningComplete: true, speakingPending, updatedAt: now });
  };

  const skipSpeaking = async () => {
    const now = new Date().toISOString();
    setSpeakingPending(true);
    await repository.saveSkillDayProgress?.({ id: lesson.dayId, dayId: lesson.dayId, revision: lesson.revision, listeningComplete: lesson.listening.every((item) => submitted[item.id]), speakingPending: true, updatedAt: now });
  };

  return <section className="skill-pilot panel" aria-label="Listen and speak practice">
    <div className="section-header"><div><p className="eyebrow">Pilot practice</p><h3>Listen and speak</h3></div><span className="skill-status">Day 1</span></div>
    <p className="helper-text">Listen without the text first. Record your own answer on this device.</p>
    <section className="skill-section"><h4>Listen</h4>{lesson.listening.map((task) => <article key={task.id} className="skill-task">
      <button type="button" className="secondary-button" onClick={() => speech.speak(task.script, `pilot-listen-${task.id}`)}>{speech.activeId === `pilot-listen-${task.id}` ? 'Stop audio' : 'Play audio'}</button>
      <p>{task.question}</p><div className="option-list">{task.options.map((option) => <button key={option} type="button" aria-pressed={answers[task.id] === option} className={answers[task.id] === option ? 'selected-option' : ''} disabled={submitted[task.id]} onClick={() => setAnswers((current) => ({ ...current, [task.id]: option }))}>{option}</button>)}</div>
      {!submitted[task.id] ? <button type="button" className="text-button" onClick={() => setShowTranscript((current) => ({ ...current, [task.id]: true }))}>Show transcript</button> : <p className={answers[task.id] === task.answer ? 'answer-correct' : 'answer-review'}>{answers[task.id] === task.answer ? 'Correct. ' : 'Review. '}{task.feedback}</p>}
      {showTranscript[task.id] && <p className="hint-content">{task.script}</p>}
      {!submitted[task.id] && <button type="button" className="secondary-button" disabled={!answers[task.id]} onClick={() => void saveListening(task.id, answers[task.id])}>Check answer</button>}
    </article>)}</section>
    <section className="skill-section"><div className="section-header"><h4>Speak</h4>{!speakingPending && <button type="button" className="text-button" onClick={() => void skipSpeaking()}>Skip for now</button>}</div>{speakingPending && <p className="pending-note">Speaking pending. You can return to this Day 1 practice later.</p>}{lesson.speaking.map((task) => <SpeakingPractice key={task.id} task={task} dayId={lesson.dayId} revision={lesson.revision} repository={repository} onChanged={() => undefined} />)}</section>
  </section>;
}
