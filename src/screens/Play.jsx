import { useEffect, useRef, useState } from 'react'
import Blob from '../components/Blob.jsx'
import Sparkle from '../components/Sparkle.jsx'
import { ROUND_SECONDS, createGame, maxSpeedOf, resizeGame, updateGame } from '../game/gameLogic.js'
import { energyToGameSpeed } from '../utils/blobLook.js'
import { playCatch, playFinish } from '../utils/sound.js'
import SoundToggle from '../components/SoundToggle.jsx'
import './Play.css'

const LEFT_KEYS = new Set(['ArrowLeft', 'a', 'A'])
const RIGHT_KEYS = new Set(['ArrowRight', 'd', 'D'])
const RESULTS_DELAY_MS = 1100 // brief "Time!" celebration before Results
const BURST_DOTS = [0, 60, 120, 180, 240, 300]

// A plain copy of what's on screen, so React knows what to draw this frame.
function snapshot(game) {
  return {
    score: game.score,
    timeLeft: Math.ceil(ROUND_SECONDS - game.time),
    progress: game.time / ROUND_SECONDS,
    blobX: game.blobX,
    lean: Math.max(-1, Math.min(1, game.blobVX / maxSpeedOf(game))) * 10,
    blobSize: game.blobSize,
    stars: game.stars.map(({ id, x, y }) => ({ id, x, y })),
    bursts: game.bursts.map(({ id, x, y }) => ({ id, x, y })),
    catchCount: game.catchCount,
    ended: game.ended,
  }
}

export default function Play({ look, name, onFinish, soundOn, onToggleSound }) {
  const speedRef = useRef(energyToGameSpeed(look.energy))
  const fieldRef = useRef(null)
  const gameRef = useRef(null)
  const inputRef = useRef({ left: false, right: false, targetX: null })
  const onFinishRef = useRef(onFinish)
  const [view, setView] = useState(null)
  const [hintVisible, setHintVisible] = useState(true)

  useEffect(() => {
    onFinishRef.current = onFinish
  }, [onFinish])

  // Measure the playfield; create the game once, then keep it in proportion on resize.
  useEffect(() => {
    const field = fieldRef.current
    const measure = () => {
      const { width, height } = field.getBoundingClientRect()
      if (!width || !height) return
      if (!gameRef.current) gameRef.current = createGame({ width, height, speedMultiplier: speedRef.current })
      else resizeGame(gameRef.current, width, height)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(field)
    return () => observer.disconnect()
  }, [])

  // The game loop: one update per animation frame.
  useEffect(() => {
    let frame = 0
    let last = null
    let finishTimer = 0
    let finished = false
    let heardCatches = gameRef.current?.catchCount ?? 0
    const loop = (now) => {
      frame = requestAnimationFrame(loop)
      const game = gameRef.current
      if (!game) return
      // Cap the step so a hidden tab or slow frame can't teleport stars.
      const dt = last == null ? 0 : Math.min(0.05, (now - last) / 1000)
      last = now
      const input = inputRef.current
      updateGame(game, dt, {
        direction: (input.right ? 1 : 0) - (input.left ? 1 : 0),
        targetX: input.targetX,
      })
      setView(snapshot(game))
      if (game.catchCount > heardCatches) {
        heardCatches = game.catchCount
        playCatch(game.catchCount) // silent unless music/sound is on
      }
      if (game.ended && !finished) {
        finished = true // guarantees Results is requested exactly once
        cancelAnimationFrame(frame)
        playFinish()
        finishTimer = setTimeout(() => onFinishRef.current(game.score), RESULTS_DELAY_MS)
      }
    }
    frame = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(finishTimer)
    }
  }, [])

  // Keyboard: arrows and A/D. preventDefault stops arrow keys scrolling the page.
  useEffect(() => {
    const handle = (event, pressed) => {
      if (LEFT_KEYS.has(event.key)) inputRef.current.left = pressed
      else if (RIGHT_KEYS.has(event.key)) inputRef.current.right = pressed
      else return
      event.preventDefault()
      inputRef.current.targetX = null
      if (pressed) setHintVisible(false)
    }
    const down = (e) => handle(e, true)
    const up = (e) => handle(e, false)
    const release = () => {
      inputRef.current.left = false
      inputRef.current.right = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', release)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', release)
    }
  }, [])

  // The hint fades by itself after a moment.
  useEffect(() => {
    const t = setTimeout(() => setHintVisible(false), 2800)
    return () => clearTimeout(t)
  }, [])

  // Mouse: blob follows the pointer. Touch/pen: blob follows while dragging.
  const pointerX = (event) => event.clientX - fieldRef.current.getBoundingClientRect().left
  const onPointerDown = (event) => {
    event.currentTarget.setPointerCapture?.(event.pointerId)
    inputRef.current.targetX = pointerX(event)
    setHintVisible(false)
  }
  const onPointerMove = (event) => {
    if (event.pointerType === 'mouse' || event.buttons) {
      inputRef.current.targetX = pointerX(event)
      setHintVisible(false)
    }
  }

  const score = view?.score ?? 0
  const timeLeft = view?.timeLeft ?? ROUND_SECONDS
  const progress = view?.progress ?? 0

  return (
    <main className="screen play">
      <div className="play-hud">
        <div className="hud-pill" aria-label={`Score: ${score}`}>
          <Sparkle className="hud-star" />
          <span key={score} className="hud-value hud-value--pop">
            {score}
          </span>
        </div>
        <p className="play-title">Catch the Glow</p>
        <div className="play-hud-right">
          <SoundToggle on={soundOn} onToggle={onToggleSound} />
          <div className={`hud-pill hud-timer${timeLeft <= 5 ? ' is-urgent' : ''}`} aria-label={`${timeLeft} seconds left`}>
            <span className="hud-value">0:{String(timeLeft).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
      <div className="play-progress" aria-hidden="true">
        <div className="play-progress-fill" style={{ transform: `scaleX(${1 - progress})` }} />
      </div>

      <div
        ref={fieldRef}
        className="play-field"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        role="application"
        aria-label="Catch the Glow. Move with the left and right arrow keys, A and D, the mouse, or by dragging."
      >
        {view?.stars.map((s) => (
          <div key={s.id} className="play-star" style={{ transform: `translate(${s.x}px, ${s.y}px)` }}>
            <Sparkle className="play-star-shape" />
          </div>
        ))}

        {view?.bursts.map((b) => (
          <div key={b.id} className="play-burst" style={{ transform: `translate(${b.x}px, ${b.y}px)` }}>
            {BURST_DOTS.map((angle) => (
              <span key={angle} className="play-burst-dot" style={{ '--angle': `${angle}deg` }} />
            ))}
            <span className="play-burst-plus">+1</span>
          </div>
        ))}

        {view && (
          <div
            className="play-blob"
            style={{ width: view.blobSize, transform: `translateX(${view.blobX - view.blobSize / 2}px) rotate(${view.lean}deg)` }}
          >
            <Blob {...look} size={view.blobSize} interactive={false} bounce={view.catchCount} label={name} />
          </div>
        )}

        <div className={`play-hint${hintVisible ? '' : ' is-hidden'}`} aria-hidden={!hintVisible}>
          <strong>Move to catch the stars!</strong>
          <span>← → or A D · mouse · drag</span>
        </div>

        {view?.ended && (
          <div className="play-timeup" role="status">
            Time!
          </div>
        )}
      </div>
    </main>
  )
}
