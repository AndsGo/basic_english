import type { FrequencyPresentation } from '../content/frequencyPresentations';

export function FrequencyVisual({ presentation, image }: {
  presentation: FrequencyPresentation;
  image?: string;
}) {
  return (
    <div className="frequency-visual">
      {image && <img className="flashcard-image" src={image} alt={presentation.scene} />}
      <div className="frequency-record" role="group" aria-label={`${presentation.action}: example week`}>
        <p className="frequency-meaning">{presentation.meaning}</p>
        <p className="frequency-action">{presentation.action}</p>
        <ol className="frequency-days" aria-label="Daily record">
          {presentation.occasions.map((occurred, index) => (
            <li key={index} className={occurred ? 'frequency-yes' : 'frequency-no'}
              aria-label={`Day ${index + 1}: ${presentation.action}: ${occurred ? 'yes' : 'no'}`}>
              <span>{index + 1}</span>
              <strong>{occurred ? 'Yes' : 'No'}</strong>
            </li>
          ))}
        </ol>
        <p className="frequency-caption">One example week</p>
      </div>
    </div>
  );
}
