/*
  Blob Lab sound — original music and effects generated live with the Web Audio API.
  No audio files, nothing to license. Off by default; only starts after the player
  presses the music button (browsers also require a click before any sound).
*/

const TEMPO = 92 // beats per minute
const STEP = 60 / TEMPO / 2 // one eighth-note, in seconds
const LOOKAHEAD = 0.25 // schedule notes this far ahead (seconds)

// Notes (Hz)
const N = {
  F2: 87.31, G2: 98.0, A2: 110.0, C3: 130.81,
  A3: 220.0, C4: 261.63, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0, C6: 1046.5,
}

// A light, bouncy 4-bar loop: C – Am – F – G (8 steps per bar).
const MELODY = [
  'E5', null, 'G5', 'E5', 'D5', null, 'C5', null,
  'C5', null, 'E5', null, 'A4', null, null, null,
  'A4', 'C5', 'F4', 'A4', 'C5', null, 'D5', null,
  'B4', null, 'D5', 'G5', 'E5', null, 'D5', null,
]
const BASS = ['C3', 'A2', 'F2', 'G2']
const CHORDS = [
  ['C4', 'E4', 'G4'],
  ['A3', 'C4', 'E4'],
  ['F4', 'A4', 'C5'],
  ['G4', 'B4', 'D5'],
]

let ctx = null
let master = null
let musicBus = null
let enabled = false
let timer = 0
let nextTime = 0
let step = 0

function getContext() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return null // very old browser: stay silent, never crash
    ctx = new AudioCtx()
    master = ctx.createGain()
    master.gain.value = 0.6
    master.connect(ctx.destination)
    musicBus = ctx.createGain()
    musicBus.gain.value = 0
    musicBus.connect(master)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// One soft note with a quick attack and gentle fade.
function tone(freq, start, duration, { type = 'triangle', gain = 0.2, dest = master } = {}) {
  const osc = ctx.createOscillator()
  const env = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  env.gain.setValueAtTime(0.0001, start)
  env.gain.exponentialRampToValueAtTime(gain, start + 0.02)
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(env)
  env.connect(dest)
  osc.start(start)
  osc.stop(start + duration + 0.05)
}

function scheduleStep(i, t) {
  const bar = Math.floor(i / 8)
  const note = MELODY[i]
  if (note) tone(N[note], t, STEP * 1.8, { type: 'triangle', gain: 0.16, dest: musicBus })
  if (i % 4 === 0) tone(N[BASS[bar]], t, STEP * 3.5, { type: 'sine', gain: 0.22, dest: musicBus })
  if (i % 8 === 0) {
    for (const c of CHORDS[bar]) tone(N[c], t, STEP * 7.5, { type: 'sine', gain: 0.04, dest: musicBus })
  }
}

function scheduler() {
  while (nextTime < ctx.currentTime + LOOKAHEAD) {
    scheduleStep(step, nextTime)
    nextTime += STEP
    step = (step + 1) % MELODY.length
  }
}

function startMusic() {
  if (!getContext() || timer) return
  musicBus.gain.cancelScheduledValues(ctx.currentTime)
  musicBus.gain.setTargetAtTime(1, ctx.currentTime, 0.2)
  nextTime = ctx.currentTime + 0.05
  timer = setInterval(scheduler, 50)
}

function stopMusic() {
  clearInterval(timer)
  timer = 0
  if (ctx) musicBus.gain.setTargetAtTime(0, ctx.currentTime, 0.08)
}

// Pause the music while the tab is hidden; resume when it's back.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!enabled) return
    if (document.hidden) stopMusic()
    else startMusic()
  })
}

export function setSoundEnabled(on) {
  enabled = on
  if (on) startMusic()
  else stopMusic()
}

// Bright chime on each catch; the pitch climbs a little with each catch in a row.
export function playCatch(count) {
  if (!enabled || !ctx) return
  const t = ctx.currentTime
  const scale = [N.C5, N.D5, N.E5, N.G5, N.A5]
  const f = scale[count % scale.length]
  tone(f, t, 0.22, { type: 'sine', gain: 0.22 })
  tone(f * 2, t + 0.03, 0.18, { type: 'sine', gain: 0.06 })
}

// Little "ta-da" when the round ends.
export function playFinish() {
  if (!enabled || !ctx) return
  const t = ctx.currentTime
  ;[N.C5, N.E5, N.G5, N.C6].forEach((f, i) => tone(f, t + i * 0.09, 0.4, { type: 'triangle', gain: 0.18 }))
}
