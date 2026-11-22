import Blob from '../components/Blob.jsx'
import './Results.css'

// A ~42-star round: a sitting-still player catches ~10, a sharp one 35+.
function messageFor(score) {
  if (score < 10) return 'A gentle warm-up. Your blob believes in you.'
  if (score < 20) return 'Nice catching! Your blob is glowing with pride.'
  if (score < 32) return 'Star magnet! Your blob is absolutely beaming.'
  return 'Legendary. The stars never stood a chance.'
}

export default function Results({ look, name, score, onPlayAgain, onCustomize }) {
  return (
    <main className="screen results">
      <p className="results-kicker results-step">Look what you made!</p>
      <div className="results-blob results-step">
        <Blob {...look} size={220} label={name} bounce={1} />
      </div>
      <p className="results-name results-step">{name}</p>
      <h1 className="results-score results-step">
        <span className="results-score-num">{score}</span> {score === 1 ? 'star' : 'stars'} caught
      </h1>
      <p className="results-message results-step">{messageFor(score)}</p>
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
