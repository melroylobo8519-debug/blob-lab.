/*
  Blob accessories, drawn in SVG (viewBox 0–200).
  Each piece is drawn around (0,0) and then placed on the body with `at(x, y)`,
  which follows the blob's Shape slider so ears/hats stay on the head.
*/

const SPARKLE = 'M12 0 C13 7 17 11 24 12 C17 13 13 17 12 24 C11 17 7 13 0 12 C7 11 11 7 12 0 Z'

// ---------- Ears (drawn behind the body, with the same fur) ----------
function EarShape({ type }) {
  if (type === 'cat')
    return (
      <>
        <path d="M-17 8 L-5 -28 Q0 -33 6 -26 L17 8 Z" />
        <path className="blob-ear-inner" d="M-9 4 L-3 -18 L8 4 Z" />
      </>
    )
  if (type === 'bunny')
    return (
      <>
        <ellipse cx="0" cy="-30" rx="12" ry="34" />
        <ellipse className="blob-ear-inner" cx="0" cy="-28" rx="5.5" ry="25" />
      </>
    )
  if (type === 'bear')
    return (
      <>
        <circle cx="0" cy="-6" r="17" />
        <circle className="blob-ear-inner" cx="0" cy="-6" r="9" />
      </>
    )
  return null
}

export function Ears({ type, at, furFilter, fill }) {
  if (!type || type === 'none') return null
  const [lx, ly] = at(64, 46)
  const [rx, ry] = at(136, 46)
  const tilt = type === 'bunny' ? 14 : 24
  return (
    <g filter={furFilter} fill={fill}>
      <g transform={`translate(${lx} ${ly}) rotate(${-tilt})`}>
        <EarShape type={type} />
      </g>
      <g transform={`translate(${rx} ${ry}) rotate(${tilt}) scale(-1 1)`}>
        <EarShape type={type} />
      </g>
    </g>
  )
}

// ---------- Extra-fluffy hair tuft (only when Fluffiness is high and no hat) ----------
export function Tuft({ at, furFilter, fill }) {
  const [x, y] = at(100, 26)
  return (
    <g filter={furFilter} fill={fill} transform={`translate(${x} ${y})`}>
      <ellipse cx="-9" cy="-4" rx="6" ry="11" transform="rotate(-24 -9 -4)" />
      <ellipse cx="0" cy="-8" rx="6.5" ry="13" />
      <ellipse cx="9" cy="-4" rx="6" ry="11" transform="rotate(24 9 -4)" />
    </g>
  )
}

// ---------- Hats (in front of the head) ----------
export function Hat({ type, at, scale }) {
  if (!type || type === 'none') return null
  if (type === 'party') {
    const [x, y] = at(100, 30)
    return (
      <g className="blob-hat" transform={`translate(${x} ${y}) rotate(12) scale(${scale})`}>
        <path d="M-21 4 L0 -46 L21 4 Z" fill="#FF82B2" />
        <path d="M-15 -10 L15 -10 M-8.5 -26 L8.5 -26" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
        <ellipse cx="0" cy="4" rx="22" ry="4.5" fill="#E45A92" />
        <circle cx="0" cy="-48" r="7" fill="#FFD36B" />
      </g>
    )
  }
  if (type === 'crown') {
    const [x, y] = at(100, 30)
    return (
      <g className="blob-hat" transform={`translate(${x} ${y}) rotate(-6) scale(${scale})`}>
        <path d="M-25 6 L-25 -16 L-12 -5 L0 -26 L12 -5 L25 -16 L25 6 Z" fill="#FFD36B" stroke="#E8A93A" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="0" cy="-3" r="3.6" fill="#FF82B2" />
        <circle cx="-15" cy="0" r="2.6" fill="#65DCC2" />
        <circle cx="15" cy="0" r="2.6" fill="#78BFFF" />
        <circle cx="-25" cy="-17" r="2.4" fill="#FFE7A8" />
        <circle cx="0" cy="-27" r="2.4" fill="#FFE7A8" />
        <circle cx="25" cy="-17" r="2.4" fill="#FFE7A8" />
      </g>
    )
  }
  if (type === 'beanie') {
    const [x, y] = at(100, 42)
    return (
      <g className="blob-hat" transform={`translate(${x} ${y}) scale(${scale})`}>
        <path d="M-44 8 Q-44 -36 0 -36 Q44 -36 44 8 Z" fill="#65DCC2" />
        <path d="M-22 -28 Q-26 -10 -26 6 M0 -36 L0 6 M22 -28 Q26 -10 26 6" stroke="#4FC8AE" strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="-47" y="0" width="94" height="14" rx="7" fill="#3BB89D" />
        <circle cx="0" cy="-38" r="9" fill="#FFFFFF" />
      </g>
    )
  }
  return null
}

// ---------- Held items (in front of the arms) ----------
export function HeldItem({ type, at, scale }) {
  if (!type || type === 'none') return null
  if (type === 'wand') {
    const [hx, hy] = at(112, 160)
    const [tx, ty] = at(148, 102)
    return (
      <g className="blob-item">
        <line x1={hx} y1={hy} x2={tx} y2={ty} stroke="#9B6B4A" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx={tx} cy={ty} r={16 * scale} fill="#FFD36B" opacity="0.3" />
        <path d={SPARKLE} fill="#FFD36B" stroke="#F0B43C" strokeWidth="0.8" transform={`translate(${tx} ${ty}) scale(${1.25 * scale}) translate(-12 -12)`} />
      </g>
    )
  }
  if (type === 'sword') {
    const [x, y] = at(116, 160)
    return (
      <g className="blob-item" transform={`translate(${x} ${y}) rotate(32) scale(${scale})`}>
        <rect x="-3.5" y="-2" width="7" height="16" rx="3" fill="#9B6B4A" />
        <circle cx="0" cy="16" r="4" fill="#FFD36B" />
        <path d="M-6 -6 L-6 -54 Q0 -64 6 -54 L6 -6 Z" fill="#E3EAF6" stroke="#A9B6CC" strokeWidth="1.5" />
        <path d="M-1.5 -10 L-1.5 -50" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
        <rect x="-13" y="-8" width="26" height="6" rx="3" fill="#FFD36B" stroke="#E8A93A" strokeWidth="1" />
      </g>
    )
  }
  if (type === 'shield') {
    const [x, y] = at(74, 146)
    return (
      <g className="blob-item" transform={`translate(${x} ${y}) rotate(-8) scale(${scale})`}>
        <circle r="23" fill="#78BFFF" stroke="#4E9BE6" strokeWidth="3" />
        <circle r="15" fill="none" stroke="#fff" strokeWidth="2" opacity="0.6" />
        <path d="M0 9 C-14 0 -10 -10 -4 -10 C-1.5 -10 0 -8 0 -6 C0 -8 1.5 -10 4 -10 C10 -10 14 0 0 9 Z" fill="#FF82B2" />
      </g>
    )
  }
  return null
}
