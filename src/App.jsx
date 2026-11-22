import { useState } from 'react'
import Welcome from './screens/Welcome.jsx'
import Create from './screens/Create.jsx'
import Play from './screens/Play.jsx'
import Results from './screens/Results.jsx'
import SoundToggle from './components/SoundToggle.jsx'
import { DEFAULT_LOOK, randomName } from './utils/blobLook.js'
import { setSoundEnabled } from './utils/sound.js'

// App decides which screen is showing: welcome → create → play → results → (play | create),
// and remembers the blob's look (and the music setting) across screens.
export default function App() {
  const [screen, setScreen] = useState('welcome')
  const [look, setLook] = useState(DEFAULT_LOOK)
  const [fallbackName] = useState(randomName) // used when the name field is left blank
  const [lastScore, setLastScore] = useState(0)
  const [round, setRound] = useState(0)
  const [soundOn, setSoundOn] = useState(false) // muted by default (design.md)

  const name = look.name.trim() || fallbackName

  const toggleSound = () => {
    setSoundEnabled(!soundOn) // called inside the click, which browsers require to allow audio
    setSoundOn(!soundOn)
  }

  // Each round gets a new `key`, so Play starts completely fresh: timer, score, stars.
  const startRound = () => {
    setRound((r) => r + 1)
    setScreen('play')
  }

  const finishRound = (score) => {
    setLastScore(score)
    setScreen('results')
  }

  if (screen === 'play') {
    return <Play key={round} look={look} name={name} onFinish={finishRound} soundOn={soundOn} onToggleSound={toggleSound} />
  }

  let content
  if (screen === 'create') {
    content = <Create look={look} fallbackName={fallbackName} onChange={setLook} onBack={() => setScreen('welcome')} onPlay={startRound} />
  } else if (screen === 'results') {
    content = <Results look={look} name={name} score={lastScore} onPlayAgain={startRound} onCustomize={() => setScreen('create')} />
  } else {
    content = <Welcome onStart={() => setScreen('create')} />
  }

  return (
    <>
      <SoundToggle on={soundOn} onToggle={toggleSound} className="sound-toggle--floating" />
      {content}
    </>
  )
}
