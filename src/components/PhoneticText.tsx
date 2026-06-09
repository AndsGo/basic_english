interface PhoneticTextProps {
  value: string;
}

export function PhoneticText({ value }: PhoneticTextProps) {
  return (
    <span className="phonetic-text">
      <span className="sr-only">British pronunciation </span>
      {value}
    </span>
  );
}
