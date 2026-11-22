// Four-point sparkle: the Blob Lab star. Used for the wordmark, decorations, and game stars.
export default function Sparkle({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 0 C13 7 17 11 24 12 C17 13 13 17 12 24 C11 17 7 13 0 12 C7 11 11 7 12 0 Z" />
    </svg>
  )
}
