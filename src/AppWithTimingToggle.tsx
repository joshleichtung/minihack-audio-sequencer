import { useState, useEffect } from 'react'
import Grid from './components/Grid'
import Transport from './components/Transport'
import SynthControls from './components/SynthControls'
import PresetButtons from './components/PresetButtons'
import DrumControls from './components/DrumControls'
import EffectsControls from './components/EffectsControls'
import Visualizer from './components/Visualizer'
import { SequencerProvider as OldSequencerProvider, useSequencer } from './context/SequencerContext'
import { SequencerProvider as NewSequencerProvider, useSequencer as useNewSequencer } from './context/SequencerContextImproved'

const AppContent = ({ useImprovedTiming }: { useImprovedTiming: boolean }) => {
  const { togglePlayback } = useImprovedTiming ? useNewSequencer() : useSequencer()

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
        {/* Top Bar with Timing Toggle */}
        <div className="flex gap-2 mb-4">
          <div className="bg-lcars-orange rounded-l-full rounded-r-lg h-16 flex-1 flex items-center px-8">
            <h1 className="text-black text-2xl font-bold tracking-wider">VIBELOOP</h1>
          </div>
          <div className="bg-lcars-purple rounded-lg w-32 h-16" />
          <div className="bg-lcars-blue rounded-lg w-24 h-16" />
        </div>

        {/* Main Content */}
        <div className="flex gap-4">
          {/* Left Panel */}
          <div className="flex gap-4 w-auto">
            <EffectsControls />
            <SynthControls />
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

function AppWithTimingToggle() {
  const [useImprovedTiming, setUseImprovedTiming] = useState(true)

  return (
    <>
      {/* Timing Toggle Button */}
      <div className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur p-2 rounded-lg border border-lcars-blue">
        <button
          onClick={() => setUseImprovedTiming(!useImprovedTiming)}
          className={`px-4 py-2 rounded transition-colors ${
            useImprovedTiming
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          Timing: {useImprovedTiming ? 'IMPROVED ✓' : 'ORIGINAL'}
        </button>
        <div className="text-xs text-gray-400 mt-1">
          {useImprovedTiming
            ? 'Using lookahead scheduling'
            : 'Using basic scheduling'}
        </div>
      </div>

      {/* Use appropriate provider based on toggle */}
      {useImprovedTiming ? (
        <NewSequencerProvider>
          <AppContent useImprovedTiming={true} />
        </NewSequencerProvider>
      ) : (
        <OldSequencerProvider>
          <AppContent useImprovedTiming={false} />
        </OldSequencerProvider>
      )}
    </>
  )
}

export default AppWithTimingToggle