import { useEffect, useState } from 'react'
import Blob from '../components/Blob.jsx'
import Sparkle from '../components/Sparkle.jsx'
import './Results.css'

// A ~42-star round (some golden, worth 3): sitting still scores ~5–10, a sharp player 45+.
function ratingFor(score) {
  if (score >= 30) return 3
  if (score >= 15) return 2
  return 1
}

function messageFor(score) {
  if (score < 12) return 'A gentle warm-up. Your blob believes in you.'
  if (score < 25) return 'Nice catching! Your blob is glowing with pride.'
  if (score < 38) return 'Star magnet! Your blob is absolutely beaming.'
  return 'Legendary. The stars never stood a chance.'
}

const CONFETTI_COLORS = ['#FFD36B', '#FF82B2', '#65DCC2', '#78BFFF', '#A28BFF']
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Score counts up from 0 for a little drama (instant if reduced motion is on).
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(() => (reducedMotion() ? target : 0))
  useEffect(() => {
    if (reducedMotion()) return
    let frame = 0
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])
  return value
}

export default function Results({ look, name, result, onPlayAgain, onCustomize }) {
  const { score, bestCombo, goldenCaught, best, isNewBest } = result
  const rating = ratingFor(score)
  const shown = useCountUp(score)
  const [confetti] = useState(() =>
    Array.from({ length: 10 + rating * 8 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.5}s`,
      duration: `${1.6 + Math.random() * 1.2}s`,
      drift: `${Math.random() * 80 - 40}px`,
      spin: `${Math.random() * 720 - 360}deg`,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      round: i % 3 === 0,
    })),
  )

  return (
    <main className="screen results">
      <div className="results-confetti" aria-hidden="true">
        {confetti.map((c, i) => (
          <span
            key={i}
            className={c.round ? 'is-round' : ''}
            style={{ left: c.left, background: c.color, animationDelay: c.delay, animationDuration: c.duration, '--drift': c.drift, '--spin': c.spin }}
          />
        ))}
      </div>

      <p className="results-kicker results-step">Look what you made!</p>
      <div className={`results-blob results-step dance-${rating}`}>
        <Blob {...look} size={220} label={name} bounce={1} />
      </div>
      <p className="results-name results-step">{name}</p>

      <div className="results-stars results-step" role="img" aria-label={`${rating} out of 3 stars`}>
        {[1, 2, 3].map((n) => (
          <Sparkle key={n} className={`results-star${n <= rating ? ' is-earned' : ''}`} />
        ))}
      </div>

      <h1 className="results-score results-step" aria-label={`${score} points`}>
        <span className="results-score-num">{shown}</span> {score === 1 ? 'point' : 'points'}
      </h1>
      {isNewBest ? (
        <p className="results-best is-new results-step">New best!</p>
      ) : (
        <p className="results-best results-step">Best: {best}</p>
      )}
      <p className="results-message results-step">{messageFor(score)}</p>
      <p className="results-stats results-step">
        Longest streak ×{bestCombo}
        {goldenCaught > 0 && ` · ${goldenCaught} golden ${goldenCaught === 1 ? 'star' : 'stars'}`}
      </p>

      <div className="results-actions results-step">
        {/* autoFocus: keyboard players can press Enter to replay straight away */}
        <button type="button" className="btn btn-primary" onClick={onPlayAgain} autoFocus>
          Play again
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCustomize}>
          Customize
        </button>
      </div>
    </main>
  )
}
