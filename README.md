# Blob Lab

**Make something alive.** A tiny browser toy: create a fluffy creature, take it into a 30-second star-catching game, and play again.

**Play it:** _public link coming soon_

## Features

- **Meet your blob:** pick a color, then use sliders for shape, fluffiness, energy, and glow. Choose a mood (Happy, Sleepy, Mischievous) and a name, or press **Surprise me**.
- **Extras:** cat, bunny, or bear ears, a party hat, crown, or beanie, and a star wand, toy sword, or shield to hold.
- **Catch the Glow:** a 30-second round. Catch falling stars, and the pace ramps up gently. Missing a star costs nothing.
- **Results:** your blob, its name, your score, then **Play again** or **Customize**.
- **Music:** an original tune and catch chimes, generated in the browser. It's off by default, and the button in the corner turns it on.
- Works on desktop and phones, and respects the "reduce motion" accessibility setting.

## Controls

| Device | How to move |
|---|---|
| Keyboard | ← → arrow keys or A / D |
| Mouse | Move the pointer over the playfield |
| Touch | Drag on the playfield |

## Tech stack

- [React](https://react.dev) + [Vite](https://vite.dev), with plain JavaScript and CSS
- The creature, accessories, and stars are original SVG artwork
- Sound comes from the Web Audio API (no audio files)
- No backend, accounts, or tracking

## Run it locally

You need [Node.js](https://nodejs.org) installed.

```bash
npm install      # download the project's packages (first time only)
npm run dev      # start a local preview at http://localhost:5173
npm run build    # create the production version in /dist
```

## Project structure

```text
src/
  components/   Blob (the creature), BlobExtras (ears, hats, items), Sparkle, SoundToggle
  screens/      Welcome, Create, Play, Results
  game/         gameLogic.js: game rules (timer, spawning, catching)
  utils/        blobLook.js (colors, moods, extras, names), sound.js (music + effects)
  styles/       tokens.css (design tokens), global.css
```

Design tokens such as colors, fonts, spacing, and animation timings are in `src/styles/tokens.css`.
