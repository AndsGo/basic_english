import { useSpeech } from '../speech/SpeechProvider';

type SpeechButtonProps = {
  text: string;
  label: string;
};

export function SpeechButton({ text, label }: SpeechButtonProps) {
  const speech = useSpeech();
  const trimmedText = text.trim();
  const isActive = speech.activeId === label;
  const isDisabled = !speech.enabled || !speech.isSupported || !trimmedText;
  const icon = isActive ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <rect x="7" y="6" width="4" height="12" rx="1.2" />
      <rect x="13" y="6" width="4" height="12" rx="1.2" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="M4 10v4h4l5 4V6l-5 4H4Z" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M18.8 6.2a8.5 8.5 0 0 1 0 11.6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );

  return (
    <button
      type="button"
      className="secondary-button speech-button"
      aria-label={label}
      aria-pressed={isActive}
      disabled={isDisabled}
      onClick={() => speech.speak(trimmedText, label)}
    >
      {icon}
    </button>
  );
}
