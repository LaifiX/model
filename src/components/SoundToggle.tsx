import { setSoundEnabled, useSoundEnabled } from '../lib/sfx';

export function SoundToggle({ className = '' }: { className?: string }) {
  const on = useSoundEnabled();
  return (
    <button
      type="button"
      className={`round-btn ${className}`}
      onClick={() => setSoundEnabled(!on)}
      aria-pressed={on}
      aria-label={on ? 'Vypnúť zvuk' : 'Zapnúť zvuk'}
      title={on ? 'Vypnúť zvuk' : 'Zapnúť zvuk'}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
        {on ? (
          <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
        ) : (
          <path d="M16 9.5l5 5M21 9.5l-5 5" />
        )}
      </svg>
    </button>
  );
}
