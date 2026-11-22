/*
  Catch the Glow — game rules, kept separate from anything visual.
  Positions are in pixels inside the playfield. `updateGame` is called every frame
  with the time that passed (dt, in seconds) and the player's input.
  Tuning numbers live at the top so they're easy to adjust.
*/

export const ROUND_SECONDS = 30
export const STAR_RADIUS = 16 // px — matches the star's drawn size
const CATCH_PADDING = 12 // extra px of forgiveness around the blob's body
const MOVE_SPEED = 0.95 // fraction of the playfield width per second (keyboard)
const SPAWN_GAP_START = 1.0 // seconds between stars at the start…
const SPAWN_GAP_END = 0.42 // …and at the end (gentle ramp)
const FALL_SPEED_START = 0.3 // fraction of playfield height per second
const FALL_SPEED_END = 0.52
const NO_SPAWN_FINAL_SECONDS = 0.8 // don't drop stars nobody can catch in time
const BURST_SECONDS = 0.5

const lerp = (a, b, t) => a + (b - a) * t
const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

export function blobSizeFor(width) {
  return clamp(Math.round(width * 0.16), 76, 120)
}

export function createGame({ width, height, random = Math.random, speedMultiplier = 1 }) {
  return {
    width,
    height,
    random,
    speedMultiplier: clamp(speedMultiplier, 0.8, 1.2), // from the blob's Energy, kept fair
    blobSize: blobSizeFor(width),
    time: 0,
    score: 0,
    blobX: width / 2,
    blobVX: 0,
    stars: [],
    bursts: [],
    nextSpawnAt: 0.6,
    nextId: 1,
    catchCount: 0,
    ended: false,
  }
}

// Keep everything in proportion if the window is resized mid-round.
export function resizeGame(game, width, height) {
  const sx = width / game.width
  const sy = height / game.height
  game.blobX *= sx
  for (const s of game.stars) {
    s.x *= sx
    s.y *= sy
    s.speed *= sy
  }
  game.width = width
  game.height = height
  game.blobSize = blobSizeFor(width)
  const half = game.blobSize / 2
  game.blobX = clamp(game.blobX, half, width - half)
}

export function maxSpeedOf(game) {
  return game.width * MOVE_SPEED * game.speedMultiplier
}

function spawnStar(game, progress) {
  const margin = STAR_RADIUS + 8
  game.stars.push({
    id: game.nextId++,
    x: margin + game.random() * (game.width - margin * 2),
    y: -STAR_RADIUS,
    speed: game.height * lerp(FALL_SPEED_START, FALL_SPEED_END, progress) * lerp(0.9, 1.1, game.random()),
  })
}

/**
 * Advance the game by `dt` seconds.
 * input.direction: -1 (left), 0, or 1 (right) from the keyboard.
 * input.targetX: a pixel x to move toward (pointer/touch), or null.
 */
export function updateGame(game, dt, input) {
  if (game.ended) return game

  game.time = Math.min(ROUND_SECONDS, game.time + dt)
  const progress = game.time / ROUND_SECONDS

  // --- Blob movement ---
  const maxSpeed = maxSpeedOf(game)
  const half = game.blobSize / 2
  if (input.targetX != null) {
    // Pointer/drag: glide quickly toward the finger, never overshoot.
    game.blobVX = clamp((input.targetX - game.blobX) * 12, -maxSpeed * 1.5, maxSpeed * 1.5)
  } else {
    // Keyboard: quick acceleration so it feels responsive but not twitchy.
    const wanted = input.direction * maxSpeed
    game.blobVX = lerp(game.blobVX, wanted, Math.min(1, dt * 18))
  }
  const nextX = game.blobX + game.blobVX * dt
  game.blobX = clamp(nextX, half, game.width - half)
  if (game.blobX !== nextX) game.blobVX = 0

  // --- Spawning ---
  while (game.time >= game.nextSpawnAt && game.time < ROUND_SECONDS - NO_SPAWN_FINAL_SECONDS) {
    spawnStar(game, progress)
    game.nextSpawnAt += lerp(SPAWN_GAP_START, SPAWN_GAP_END, progress) * lerp(0.85, 1.15, game.random())
  }

  // --- Falling + catching ---
  const blobTop = game.height - game.blobSize * 0.88
  const blobFeet = game.height - game.blobSize * 0.15
  const reach = game.blobSize * 0.36 + STAR_RADIUS + CATCH_PADDING
  const remaining = []
  for (const star of game.stars) {
    star.y += star.speed * dt
    const inHeight = star.y + STAR_RADIUS >= blobTop && star.y - STAR_RADIUS <= blobFeet
    if (inHeight && Math.abs(star.x - game.blobX) <= reach) {
      game.score += 1
      game.catchCount += 1
      game.bursts.push({ id: star.id, x: star.x, y: star.y, age: 0 })
    } else if (star.y - STAR_RADIUS <= game.height) {
      remaining.push(star) // missed stars simply fall away — no penalty
    }
  }
  game.stars = remaining

  for (const b of game.bursts) b.age += dt
  game.bursts = game.bursts.filter((b) => b.age < BURST_SECONDS)

  if (game.time >= ROUND_SECONDS) game.ended = true
  return game
}
