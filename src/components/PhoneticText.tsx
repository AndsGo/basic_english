interface PhoneticTextProps {
  value: string;
}

export function PhoneticText({ value }: PhoneticTextProps) {
  return (
    <span className="phonetic-text" aria-label={`British pronunciation ${value}`}>
      {value}
    </span>
  );
}
