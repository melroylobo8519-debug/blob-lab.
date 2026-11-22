import { useEffect, useRef, useState } from 'react'
import Blob from '../components/Blob.jsx'
import Sparkle from '../components/Sparkle.jsx'
import SoundToggle from '../components/SoundToggle.jsx'
import { ROUND_SECONDS, createGame, maxSpeedOf, resizeGame, updateGame } from '../game/gameLogic.js'
import { energyToGameSpeed } from '../utils/blobLook.js'
import { playCatch, playFinish } from '../utils/sound.js'
import './Play.css'

const LEFT_KEYS = new Set(['ArrowLeft', 'a', 'A'])
const RIGHT_KEYS = new Set(['ArrowRight', 'd', 'D'])
const RESULTS_DELAY_MS = 1100 // brief "Time!" celebration before Results
const RING_RADIUS = 17
const RING_LENGTH = 2 * Math.PI * RING_RADIUS
const BURST_ANGLES = [0, 60, 120, 180, 240, 300]
const GOLDEN_BURST_ANGLES = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324]

// Background twinkles: fixed positions so they don't jump around between frames.
const TWINKLES = Array.from({ length: 16 }, (_, i) => {
  const r = (n) => ((Math.sin(i * 127.1 + n * 311.7) * 43758.5453) % 1 + 1) % 1
  return { left: `${4 + r(1) * 92}%`, top: `${4 + r(2) * 52}%`, size: 2 + r(3) * 3, delay: `${-r(4) * 3}s` }
})

const clamp1 = (v) => Math.max(-1, Math.min(1, v))
const round2 = (v) => Math.round(v * 100) / 100

// A plain copy of what's on screen, so React knows what to draw this frame.
function snapshot(game, motion) {
  const speed = clamp1(game.blobVX / maxSpeedOf(game))
  // Eyes look at the lowest star still above the blob (the one it's chasing).
  const blobTop = game.height - game.blobSize
  const target = game.stars.filter((s) => s.y < blobTop).sort((a, b) => b.y - a.y)[0]
  const gaze = target
    ? [round2(clamp1((target.x - game.blobX) / (game.width * 0.35))), round2(clamp1((target.y - blobTop) / (game.height * 0.5)))]
    : [0, 0]
  return {
    score: game.score,
    combo: game.combo,
    timeLeft: Math.ceil(ROUND_SECONDS - game.time),
    progress: game.time / ROUND_SECONDS,
    height: game.height,
    blobX: game.blobX,
    blobSize: game.blobSize,
    lean: motion.angle,
    stretch: Math.abs(speed),
    gaze,
    stars: game.stars.map(({ id, x, y, golden }) => ({ id, x, y, golden })),
    bursts: game.bursts.map(({ id, x, y, value, golden }) => ({ id, x, y, value, golden })),
    callouts: game.callouts.map(({ id, text }) => ({ id, text })),
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
    // Springy lean: the blob tilts into its movement and wobbles a little when it stops.
    const motion = { angle: 0, velocity: 0 }
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
      const targetAngle = clamp1(game.blobVX / maxSpeedOf(game)) * 11
      motion.velocity += ((targetAngle - motion.angle) * 170 - motion.velocity * 11) * dt
      motion.angle += motion.velocity * dt
      setView(snapshot(game, motion))
      if (game.catchCount > heardCatches) {
        heardCatches = game.catchCount
        const latest = game.bursts[game.bursts.length - 1]
        playCatch(game.combo, latest?.golden) // silent unless sound is on
      }
      if (game.ended && !finished) {
        finished = true // guarantees Results is requested exactly once
        cancelAnimationFrame(frame)
        playFinish()
        const stats = { score: game.score, bestCombo: game.bestCombo, goldenCaught: game.goldenCaught }
        finishTimer = setTimeout(() => onFinishRef.current(stats), RESULTS_DELAY_MS)
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
  const combo = view?.combo ?? 0
  const timeLeft = view?.timeLeft ?? ROUND_SECONDS
  const progress = view?.progress ?? 0
  const urgent = timeLeft <= 5

  return (
    <main className="screen play">
      <div className="play-hud">
        <div className="play-hud-left">
          <div key={`score-${score}`} className={`hud-pill hud-score${score > 0 ? ' is-bumped' : ''}`} aria-label={`Score: ${score}`}>
            <Sparkle className="hud-star" />
            <span className="hud-value">{score}</span>
          </div>
          {combo >= 2 && (
            <span key={`combo-${combo}`} className="hud-combo" aria-label={`Streak: ${combo} in a row`}>
              ×{combo}
            </span>
          )}
        </div>
        <p className="play-title">Catch the Glow</p>
        <div className="play-hud-right">
          <SoundToggle on={soundOn} onToggle={onToggleSound} />
          <div className={`hud-pill hud-timer${urgent ? ' is-urgent' : ''}`} aria-label={`${timeLeft} seconds left`}>
            <svg className="hud-ring" viewBox="0 0 40 40" aria-hidden="true">
              <circle className="hud-ring-track" cx="20" cy="20" r={RING_RADIUS} />
              <circle
                className="hud-ring-fill"
                cx="20"
                cy="20"
                r={RING_RADIUS}
                strokeDasharray={RING_LENGTH}
                strokeDashoffset={RING_LENGTH * progress}
              />
            </svg>
            <span className="hud-value">{timeLeft}</span>
          </div>
        </div>
      </div>

      <div
        ref={fieldRef}
        className="play-field"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        role="application"
        aria-label="Catch the Glow. Move with the left and right arrow keys, A and D, the mouse, or by dragging."
      >
        {/* ---- Environment (decorative, behind the action) ---- */}
        <div className="play-dusk" style={{ opacity: progress * 0.9 }} aria-hidden="true" />
        <div className="play-twinkles" style={{ opacity: 0.35 + progress * 0.65 }} aria-hidden="true">
          {TWINKLES.map((t, i) => (
            <span key={i} style={{ left: t.left, top: t.top, width: t.size, height: t.size, animationDelay: t.delay }} />
          ))}
        </div>
        <div className="play-cloud play-cloud--a" aria-hidden="true" />
        <div className="play-cloud play-cloud--b" aria-hidden="true" />
        <svg className="play-hills" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">
          <path className="play-hill-back" d="M0 55 C60 20 120 30 170 50 C230 72 290 18 400 40 L400 100 L0 100 Z" />
          <path className="play-hill-front" d="M0 78 C70 58 140 66 200 76 C270 88 330 60 400 70 L400 100 L0 100 Z" />
        </svg>

        {/* ---- Action ---- */}
        {view?.stars.map((s) => (
          <div key={`star-${s.id}`} className={`play-star${s.golden ? ' play-star--golden' : ''}`} style={{ transform: `translate(${s.x}px, ${s.y}px)` }}>
            <Sparkle className="play-star-shape" />
          </div>
        ))}

        {view?.bursts.map((b) => (
          <div key={`burst-${b.id}`} className={`play-burst${b.golden ? ' play-burst--golden' : ''}`} style={{ transform: `translate(${b.x}px, ${b.y}px)` }}>
            <span className="play-burst-ring" />
            {(b.golden ? GOLDEN_BURST_ANGLES : BURST_ANGLES).map((angle) => (
              <span key={angle} className="play-burst-dot" style={{ '--angle': `${angle}deg` }} />
            ))}
            <span className="play-burst-plus">+{b.value}</span>
          </div>
        ))}

        {view && (
          <div
            className="play-blob"
            style={{
              width: view.blobSize,
              transform: `translateX(${view.blobX - view.blobSize / 2}px) rotate(${view.lean}deg) scale(${1 + view.stretch * 0.08}, ${1 - view.stretch * 0.06})`,
            }}
          >
            <Blob {...look} size={view.blobSize} interactive={false} bounce={view.catchCount} gaze={view.gaze} label={name} />
          </div>
        )}

        {view?.callouts.map((c) => (
          <div
            key={`callout-${c.id}`}
            className="play-callout"
            style={{ transform: `translate(${view.blobX}px, ${view.height - view.blobSize - 34}px)` }}
          >
            <span>{c.text}</span>
          </div>
        ))}

        {urgent && !view?.ended && timeLeft > 0 && (
          <div key={timeLeft} className="play-countdown" aria-hidden="true">
            {timeLeft}
          </div>
        )}

        <div className={`play-hint${hintVisible ? '' : ' is-hidden'}`} aria-hidden={!hintVisible}>
          <strong>Move to catch the stars!</strong>
          <span>← → or A D · mouse · drag</span>
          <span className="play-hint-gold">
            <Sparkle className="play-hint-star" /> Golden stars = +3
          </span>
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
