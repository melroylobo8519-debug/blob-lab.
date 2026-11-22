import './SoundToggle.css'

// Music on/off button. Off by default; shows its state with icon + text, not color alone.
export default function SoundToggle({ on, onToggle, className = '' }) {
  return (
    <button
      type="button"
      className={`sound-toggle${on ? ' is-on' : ''} ${className}`}
      aria-pressed={on}
      aria-label={on ? 'Music on. Turn music off' : 'Music off. Turn music on'}
      title={on ? 'Turn music off' : 'Turn music on'}
      onClick={onToggle}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M9 18V6l10-2v12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6.5" cy="18" r="2.5" fill="currentColor" />
        <circle cx="16.5" cy="16" r="2.5" fill="currentColor" />
        {!on && <path d="M4 4l16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
      </svg>
      <span className="sound-toggle-text">{on ? 'Music on' : 'Music off'}</span>
    </button>
  )
}
