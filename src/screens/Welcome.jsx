import Blob from '../components/Blob.jsx'
import Sparkle from '../components/Sparkle.jsx'
import './Welcome.css'

export default function Welcome({ onStart }) {
  return (
    <main className="screen welcome">
      <header className="welcome-brand">
        <Sparkle className="welcome-brand-mark" />
        <span>BLOB LAB</span>
      </header>

      <section className="welcome-hero">
        <h1 className="welcome-title">Make something alive.</h1>
        <p className="welcome-lede">Mix a little magic. Meet your new blob.</p>

        <div className="welcome-stage">
          <Sparkle className="welcome-star welcome-star--a" />
          <Sparkle className="welcome-star welcome-star--b" />
          <Sparkle className="welcome-star welcome-star--c" />
          <Blob size={300} label="A friendly blob" />
        </div>

        <button type="button" className="btn btn-primary welcome-cta" onClick={onStart}>
          Create my blob
        </button>
        <p className="welcome-hint">Create · Play · Share</p>
      </section>
    </main>
  )
}
