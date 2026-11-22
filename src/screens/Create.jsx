import { useState } from 'react'
import Blob from '../components/Blob.jsx'
import { BLOB_COLORS, EARS, HATS, ITEMS, MOODS, NAME_MAX, randomLook } from '../utils/blobLook.js'
import './Create.css'

function ChipField({ id, label, options, value, onPick }) {
  return (
    <div className="field">
      <span className="field-label" id={`${id}-label`}>
        {label}
      </span>
      <div className="chips" role="radiogroup" aria-labelledby={`${id}-label`}>
        {options.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={value === o.id} className="chip" onClick={() => onPick(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function SliderField({ id, label, low, high, value, onChange }) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="slider"
        type="range"
        min="0"
        max="100"
        value={value}
        style={{ '--fill': `${value}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="slider-ends" aria-hidden="true">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  )
}

export default function Create({ look, fallbackName, onChange, onBack, onPlay }) {
  const [bounce, setBounce] = useState(0)
  const update = (changes) => onChange({ ...look, ...changes })
  const react = () => setBounce((b) => b + 1)

  const surprise = () => {
    update(randomLook()) // keeps the name the player typed
    react()
  }

  return (
    <main className="screen create">
      <header className="create-top">
        <button type="button" className="btn-link" onClick={onBack}>
          ← Back
        </button>
        <h1 className="create-title">Meet your blob.</h1>
      </header>

      <div className="create-body">
        <section className="create-stage" aria-label="Your blob preview">
          <div className="create-blob">
            <Blob {...look} size={320} bounce={bounce} label={look.name.trim() || fallbackName} />
          </div>
          <p className="create-stage-name">{look.name.trim() || fallbackName}</p>
        </section>

        <section className="create-panel" aria-label="Customize your blob">
          <div className="field">
            <span className="field-label" id="color-label">
              Color
            </span>
            <div className="swatches" role="radiogroup" aria-labelledby="color-label">
              {Object.entries(BLOB_COLORS).map(([id, c]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={look.color === id}
                  aria-label={c.name}
                  title={c.name}
                  className="swatch"
                  style={{ '--swatch': c.body, '--swatch-light': c.light }}
                  onClick={() => {
                    update({ color: id })
                    react()
                  }}
                />
              ))}
            </div>
          </div>

          <SliderField id="shape" label="Shape" low="Round" high="Stretchy" value={look.shape} onChange={(shape) => update({ shape })} />
          <SliderField id="fluff" label="Fluffiness" low="Sleek" high="Extra fluffy" value={look.fluff} onChange={(fluff) => update({ fluff })} />
          <SliderField id="energy" label="Energy" low="Chill" high="Zippy" value={look.energy} onChange={(energy) => update({ energy })} />
          <SliderField id="glow" label="Glow" low="Soft" high="Radiant" value={look.glow} onChange={(glow) => update({ glow })} />

          <div className="field">
            <span className="field-label" id="mood-label">
              Mood
            </span>
            <div className="segmented" role="radiogroup" aria-labelledby="mood-label">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={look.mood === m.id}
                  className="segmented-option"
                  onClick={() => {
                    update({ mood: m.id })
                    react()
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-divider">
            <span>Extras</span>
          </div>
          <ChipField id="ears" label="Ears" options={EARS} value={look.ears} onPick={(ears) => { update({ ears }); react() }} />
          <ChipField id="hat" label="Hat" options={HATS} value={look.hat} onPick={(hat) => { update({ hat }); react() }} />
          <ChipField id="item" label="Holding" options={ITEMS} value={look.item} onPick={(item) => { update({ item }); react() }} />

          <div className="field">
            <label className="field-label" htmlFor="blob-name">
              Name <span className="field-optional">(optional)</span>
            </label>
            <input
              id="blob-name"
              className="text-input"
              type="text"
              maxLength={NAME_MAX}
              placeholder={fallbackName}
              value={look.name}
              autoComplete="off"
              onChange={(e) => update({ name: e.target.value.slice(0, NAME_MAX) })}
            />
          </div>

          <div className="create-actions">
            <button type="button" className="btn btn-ghost" onClick={surprise}>
              Surprise me
            </button>
            <button type="button" className="btn btn-primary create-play" onClick={onPlay}>
              Let's play
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
