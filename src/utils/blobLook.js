/*
  Everything that describes how a blob looks, in one place (art-direct here).
  A "look" is: { color, shape, energy, glow, mood, name }.
*/

// Color presets from design.md §3. Each has a highlight (light) and shadow (dark) hue.
export const BLOB_COLORS = {
  lavender: { name: 'Lavender', body: '#A28BFF', light: '#D2C6FF', dark: '#7A62E8' },
  bubblegum: { name: 'Bubblegum', body: '#FF82B2', light: '#FFC2DA', dark: '#E45A92' },
  lagoon: { name: 'Lagoon', body: '#65DCC2', light: '#B4F2E4', dark: '#3BB89D' },
  sky: { name: 'Sky', body: '#78BFFF', light: '#C0E1FF', dark: '#4E9BE6' },
  mango: { name: 'Mango', body: '#FFBE72', light: '#FFE0B5', dark: '#EC9A45' },
}

export const MOODS = [
  { id: 'happy', label: 'Happy' },
  { id: 'sleepy', label: 'Sleepy' },
  { id: 'mischievous', label: 'Mischievous' },
]

// Extras (accessories). Add an option here, then draw it in Blob.jsx.
export const EARS = [
  { id: 'none', label: 'None' },
  { id: 'cat', label: 'Cat' },
  { id: 'bunny', label: 'Bunny' },
  { id: 'bear', label: 'Bear' },
]

export const HATS = [
  { id: 'none', label: 'None' },
  { id: 'party', label: 'Party hat' },
  { id: 'crown', label: 'Crown' },
  { id: 'beanie', label: 'Beanie' },
]

export const ITEMS = [
  { id: 'none', label: 'None' },
  { id: 'wand', label: 'Star wand' },
  { id: 'sword', label: 'Toy sword' },
  { id: 'shield', label: 'Shield' },
]

export const NAME_MAX = 20

export const DEFAULT_LOOK = {
  color: 'lavender',
  shape: 35,
  fluff: 40,
  energy: 50,
  glow: 35,
  mood: 'happy',
  ears: 'none',
  hat: 'none',
  item: 'none',
  name: '',
}

const FIRST = ['Squishy', 'Fuzzy', 'Sparkly', 'Wobbly', 'Snuggly', 'Bouncy', 'Dozy', 'Cosmic', 'Puffy', 'Velvet']
const LAST = ['Mochi', 'Puff', 'Bean', 'Noodle', 'Pip', 'Dumpling', 'Marsh', 'Biscuit', 'Bloop', 'Tofu']
const pick = (list) => list[Math.floor(Math.random() * list.length)]

export function randomName() {
  return `${pick(FIRST)} ${pick(LAST)}`
}

const randomInt = (min, max) => Math.round(min + Math.random() * (max - min))

export function randomLook() {
  return {
    color: pick(Object.keys(BLOB_COLORS)),
    shape: randomInt(0, 100),
    fluff: randomInt(15, 100),
    energy: randomInt(15, 95),
    glow: randomInt(10, 90),
    mood: pick(MOODS).id,
    ears: pick(EARS).id,
    hat: pick(HATS).id,
    item: pick(ITEMS).id,
  }
}

// 0–100 slider → a value between a and b
export const mix = (a, b, percent) => a + (b - a) * (Math.min(100, Math.max(0, Number(percent) || 0)) / 100)

// Energy also nudges game movement speed, kept within a fair range.
export const energyToGameSpeed = (energy) => mix(0.9, 1.15, energy)
