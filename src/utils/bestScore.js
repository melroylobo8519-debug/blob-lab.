/*
  Best score, remembered only in this player's own browser (localStorage).
  Nothing is sent anywhere. If storage is blocked (private mode, etc.), it quietly does nothing.
*/
const KEY = 'blob-lab-best-score'

export function readBest() {
  try {
    const value = Number.parseInt(localStorage.getItem(KEY) ?? '', 10)
    return Number.isFinite(value) && value >= 0 ? value : null
  } catch {
    return null
  }
}

// Saves the score if it beats the previous best. Returns { best, previous, isNewBest }.
export function recordScore(score) {
  const previous = readBest()
  const isNewBest = score > 0 && (previous == null || score > previous)
  if (isNewBest) {
    try {
      localStorage.setItem(KEY, String(score))
    } catch {
      // storage unavailable — the badge still shows for this round
    }
  }
  return { best: isNewBest ? score : previous ?? score, previous, isNewBest }
}
