import { useEffect } from 'react'
import Grid from './components/Grid'
import Transport from './components/Transport'
import SynthControls from './components/SynthControls'
import PresetButtons from './components/PresetButtons'
import DrumControls from './components/DrumControls'
import EffectsControls from './components/EffectsControls'
import Visualizer from './components/Visualizer'
import { SequencerProvider, useSequencer } from './context/SequencerContext'

const AppContent = () => {
  const { togglePlayback } = useSequencer()

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if spacebar is pressed and not in an input/textarea
      if (event.code === 'Space' && event.target instanceof HTMLElement) {
        const tagName = event.target.tagName.toLowerCase()
        if (tagName !== 'input' && tagName !== 'textarea' && !event.target.isContentEditable) {
          event.preventDefault()
          togglePlayback()
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [togglePlayback])

  return (
    <div className="min-h-screen bg-black p-4">
      {/* LCARS Frame */}
      <div className="max-w-none mx-auto px-4">
        {/* Top Bar */}
        <div className="flex gap-2 mb-4">
          <div className="bg-lcars-orange rounded-l-full rounded-r-lg h-16 flex-1 flex items-center px-8">
            <h1 className="text-black text-2xl font-bold tracking-wider">MINIHACK SEQUENCER</h1>
          </div>
          <div className="bg-lcars-purple rounded-lg w-32 h-16" />
          <div className="bg-lcars-blue rounded-lg w-24 h-16" />
        </div>

        {/* Main Content */}
        <div className="flex gap-4">
          {/* Left Panel */}
          <div className="flex flex-col gap-4 w-auto">
            <div className="bg-lcars-peach rounded-t-lg rounded-b-3xl w-20 h-32" />
            <div className="flex gap-4">
              <EffectsControls />
              <SynthControls />
            </div>
          </div>

          {/* Left Visualizer */}
          <div className="flex items-center">
            <Visualizer side="left" />
          </div>

          {/* Center - Grid */}
          <div className="flex-1 min-w-0">
            <Grid />
          </div>

          {/* Right Visualizer */}
          <div className="flex items-center">
            <Visualizer side="right" />
          </div>

          {/* Right Panel */}
          <div className="flex flex-col gap-4 w-auto">
            <PresetButtons />
            <DrumControls />
            <div className="bg-lcars-pink rounded-t-3xl rounded-b-lg w-20 h-32" />
          </div>
        </div>

        {/* Bottom Bar - Transport */}
        <div className="mt-4">
          <Transport />
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <SequencerProvider>
      <AppContent />
    </SequencerProvider>
  )
}

export default App
