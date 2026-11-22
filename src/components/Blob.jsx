import { useEffect, useId, useRef, useState } from 'react'
import { BLOB_COLORS, mix } from '../utils/blobLook.js'
import { Ears, Hat, HeldItem, Tuft } from './BlobExtras.jsx'
import './Blob.css'

const clamp = (value, max) => Math.max(-max, Math.min(max, value))
const EYE_HEIGHT_FROM_FEET = 96 // eyes sit this far above the feet (viewBox units)

/**
 * The Blob Lab creature: an original fluffy SVG character.
 * Look: color, shape (round→stretchy), energy (idle bounce), glow (aura), mood (eyes).
 * Life: breathes, blinks, face follows the pointer, squashes when poked or when `bounce` increases.
 */
export default function Blob({
  color = 'lavender',
  shape = 35,
  fluff = 40,
  energy = 50,
  glow = 35,
  mood = 'happy',
  ears = 'none',
  hat = 'none',
  item = 'none',
  size = 300,
  label = 'Your blob',
  interactive = true,
  bounce = 0,
  gaze = null, // [x, y] from -1 to 1: where the eyes look (game). null = follow the pointer.
}) {
  const palette = BLOB_COLORS[color] ?? BLOB_COLORS.lavender
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const [blinking, setBlinking] = useState(false)
  const rootRef = useRef(null)
  const svgRef = useRef(null)
  const faceRef = useRef(null)
  const squashRef = useRef(null)
  const cheerTimer = useRef(0)
  const gazeRef = useRef(gaze)
  const gazeX = gaze ? gaze[0] : null
  const gazeY = gaze ? gaze[1] : null

  // Shape: stretch the body from the feet; the face moves with the head but never distorts.
  const scaleX = mix(1.12, 0.86, shape)
  const scaleY = mix(0.88, 1.14, shape)
  const faceLift = -EYE_HEIGHT_FROM_FEET * (scaleY - 1)
  // Where a point on the unstretched body ends up after the Shape stretch (keeps extras attached).
  const at = (x, y) => [100 + (x - 100) * scaleX, 182 - (182 - y) * scaleY]

  // Fluffiness: how far the fur filter pushes the edges (longer, softer fur when high).
  const furScale = mix(3, 15, fluff).toFixed(1)
  const furFrequency = mix(0.9, 0.55, fluff).toFixed(2)
  const furFilter = `url(#${uid}-fur)`
  const bodyFill = `url(#${uid}-body)`

  // Energy: how fast and how big the idle breathing bounce is.
  const breathStyle = {
    '--blob-size': `${size}px`,
    '--breath-dur': `${mix(4.2, 1.5, energy).toFixed(2)}s`,
    '--breath-scale': mix(1.012, 1.045, energy).toFixed(3),
    '--breath-lift': `${mix(-1, -7, energy).toFixed(1)}px`,
  }

  // Blink at irregular intervals; Sleepy blinks slower and longer.
  useEffect(() => {
    const sleepy = mood === 'sleepy'
    let waitTimer
    let closeTimer
    const scheduleBlink = () => {
      waitTimer = setTimeout(
        () => {
          setBlinking(true)
          closeTimer = setTimeout(() => {
            setBlinking(false)
            scheduleBlink()
          }, sleepy ? 360 : 140)
        },
        (sleepy ? 2200 : 3000) + Math.random() * 3000,
      )
    }
    scheduleBlink()
    return () => {
      clearTimeout(waitTimer)
      clearTimeout(closeTimer)
    }
  }, [mood])

  const lookAt = (x, y) => {
    if (faceRef.current) faceRef.current.style.transform = `translate(${clamp(x * 7, 7)}px, ${clamp(y * 5, 5)}px)`
  }

  // In the game, the eyes follow the star the blob is chasing.
  useEffect(() => {
    gazeRef.current = gazeX == null ? null : [gazeX, gazeY]
    if (gazeX != null) lookAt(gazeX, gazeY)
  }, [gazeX, gazeY])

  // Elsewhere, the face follows the pointer (one update per frame, no re-render).
  // If the pointer rests for a while, the blob glances around on its own.
  useEffect(() => {
    let frame = 0
    let lastEvent = null
    let lastMoveAt = performance.now()
    let glanceBack = 0
    const onMove = (event) => {
      lastEvent = event
      lastMoveAt = performance.now()
      if (frame || gazeRef.current) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const svg = svgRef.current
        if (!svg || !lastEvent) return
        const rect = svg.getBoundingClientRect()
        const dx = (lastEvent.clientX - (rect.left + rect.width / 2)) / rect.width
        const dy = (lastEvent.clientY - (rect.top + rect.height / 2)) / rect.height
        lookAt(dx * 1.7, dy * 1.8)
      })
    }
    const idle = setInterval(() => {
      if (gazeRef.current || performance.now() - lastMoveAt < 2500) return
      if (Math.random() < 0.55) return // irregular, not on a beat
      lookAt(Math.random() * 2 - 1, Math.random() * 1.4 - 0.9)
      clearTimeout(glanceBack)
      glanceBack = setTimeout(() => !gazeRef.current && lookAt(0, 0), 900)
    }, 1600)
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
      clearInterval(idle)
      clearTimeout(glanceBack)
    }
  }, [])

  // Restart the squash animation on every poke, even mid-bounce, and flash happy ^ ^ eyes.
  const poke = () => {
    const el = squashRef.current
    const root = rootRef.current
    if (!el || !root) return
    el.classList.remove('is-squishing')
    void el.getBoundingClientRect() // forces the browser to notice the class was removed
    el.classList.add('is-squishing')
    root.classList.add('is-cheering')
    clearTimeout(cheerTimer.current)
    cheerTimer.current = setTimeout(() => root.classList.remove('is-cheering'), 480)
  }

  useEffect(() => () => clearTimeout(cheerTimer.current), [])

  useEffect(() => {
    if (bounce > 0) poke()
  }, [bounce])

  const Root = interactive ? 'button' : 'div'
  const rootProps = interactive
    ? { type: 'button', onClick: poke, 'aria-label': `${label}. Poke it!` }
    : { role: 'img', 'aria-label': label }

  const eyeLeft = (
    <g className="blob-eye-l">
      <circle className="blob-eye" cx="78" cy="86" r="9" />
      <circle className="blob-catchlight" cx="75" cy="83" r="3" />
      <circle className="blob-catchlight blob-catchlight--small" cx="81.5" cy="89.5" r="1.3" />
    </g>
  )
  const eyeRight = (
    <g className={`blob-eye-r${mood === 'mischievous' ? ' is-squinting' : ''}`}>
      <circle className="blob-eye" cx="122" cy="86" r="9" />
      <circle className="blob-catchlight" cx="119" cy="83" r="3" />
      <circle className="blob-catchlight blob-catchlight--small" cx="125.5" cy="89.5" r="1.3" />
    </g>
  )

  return (
    <Root ref={rootRef} className={`blob mood-${mood}`} style={breathStyle} {...rootProps}>
      <svg ref={svgRef} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id={`${uid}-body`} cx="38%" cy="30%" r="80%">
            <stop offset="0%" style={{ stopColor: palette.light }} />
            <stop offset="55%" style={{ stopColor: palette.body }} />
            <stop offset="100%" style={{ stopColor: palette.dark }} />
          </radialGradient>
          <radialGradient id={`${uid}-aura`}>
            <stop offset="0%" style={{ stopColor: palette.light, stopOpacity: 0.95 }} />
            <stop offset="55%" style={{ stopColor: palette.body, stopOpacity: 0.35 }} />
            <stop offset="100%" style={{ stopColor: palette.body, stopOpacity: 0 }} />
          </radialGradient>
          <filter id={`${uid}-fur`} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency={furFrequency} numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={furScale} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {/* Sleepy: only the lower part of each eye shows under a heavy lid */}
          <clipPath id={`${uid}-lid`}>
            <rect x="0" y="85" width="200" height="40" />
          </clipPath>
        </defs>

        <ellipse className="blob-shadow" cx="100" cy="188" rx={70 * scaleX} ry="8" />

        <g className="blob-breathe">
          <g ref={squashRef} className="blob-squash" onAnimationEnd={(e) => e.currentTarget.classList.remove('is-squishing')}>
            <g className="blob-ears-wrap">
              <Ears type={ears} at={at} furFilter={furFilter} fill={bodyFill} />
            </g>
            <g className="blob-shape" style={{ transform: `scale(${scaleX}, ${scaleY})` }}>
              <ellipse
                className="blob-aura"
                cx="100"
                cy="108"
                rx={mix(80, 104, glow)}
                ry={mix(78, 100, glow)}
                fill={`url(#${uid}-aura)`}
                style={{ opacity: mix(0, 0.9, glow) }}
              />
              <g filter={furFilter} fill={bodyFill}>
                <path d="M100 22 C142 22 166 52 166 92 C166 112 160 124 164 140 C170 166 140 182 100 182 C60 182 30 166 36 140 C40 124 34 112 34 92 C34 52 58 22 100 22 Z" />
                <ellipse cx="66" cy="172" rx="30" ry="16" />
                <ellipse cx="134" cy="172" rx="30" ry="16" />
                <ellipse className="blob-limb-shadow" cx="75" cy="137" rx="18" ry="35" transform="rotate(-48 75 137)" />
                <ellipse className="blob-limb-shadow" cx="125" cy="137" rx="18" ry="35" transform="rotate(48 125 137)" />
                <ellipse cx="74" cy="133" rx="17" ry="34" transform="rotate(-48 74 133)" />
                <ellipse cx="126" cy="133" rx="17" ry="34" transform="rotate(48 126 133)" />
              </g>
            </g>

            <g className="blob-face-lift" style={{ transform: `translateY(${faceLift}px)` }}>
              <g ref={faceRef} className="blob-face">
                <ellipse className="blob-muzzle" cx="100" cy="102" rx="20" ry="13" />
                <g className="blob-glance">
                  <g className={`blob-eyes${blinking ? ' is-blinking' : ''}`}>
                    <g clipPath={mood === 'sleepy' ? `url(#${uid}-lid)` : undefined}>
                      {eyeLeft}
                      {eyeRight}
                    </g>
                    {mood === 'sleepy' && (
                      <>
                        <path className="blob-lid" d="M68.5 85.5 Q78 82.5 87.5 85.5" />
                        <path className="blob-lid" d="M112.5 85.5 Q122 82.5 131.5 85.5" />
                      </>
                    )}
                  </g>
                  {mood === 'mischievous' && (
                    <>
                      <path className="blob-brow" d="M69 72 Q77 67.5 86 70.5" />
                      <path className="blob-brow" d="M113 74 Q122 73.5 130 78" />
                    </>
                  )}
                  {/* Happy ^ ^ eyes, shown briefly when poked or catching a star */}
                  <g className="blob-happy-eyes">
                    <path d="M69.5 89 Q78 78 86.5 89" />
                    <path d="M113.5 89 Q122 78 130.5 89" />
                  </g>
                </g>
                <ellipse className="blob-cheek" cx="64" cy="104" rx="8" ry="4.5" />
                <ellipse className="blob-cheek" cx="136" cy="104" rx="8" ry="4.5" />
                <path className="blob-nose" d="M94.5 97 Q100 95 105.5 97 Q104 103 100 104.5 Q96 103 94.5 97 Z" />
              </g>
            </g>

            {fluff >= 65 && hat === 'none' && <Tuft at={at} furFilter={furFilter} fill={bodyFill} />}
            <g className="blob-hat-wrap">
              <Hat type={hat} at={at} scale={scaleX} />
            </g>
            <g className="blob-item-wrap">
              <HeldItem type={item} at={at} scale={scaleX} />
            </g>
          </g>
        </g>
      </svg>
    </Root>
  )
}
