import { useEffect, useState } from 'react'
import Grid from './components/Grid'
import Transport from './components/Transport'
import SynthControls from './components/SynthControls'
import PresetButtons from './components/PresetButtons'
import DrumControls from './components/DrumControls'
import EffectsControls from './components/EffectsControls'
import Visualizer from './components/Visualizer'
import { SequencerProvider, useSequencer } from './context/SequencerContext'

const useSpacebarToggle = (togglePlayback: () => void): void => {
  useEffect((): (() => void) => {
    const handleKeyPress = (event: KeyboardEvent): void => {
      if (event.code === 'Space' && event.target instanceof HTMLElement) {
        const tagName = event.target.tagName.toLowerCase()
        if (tagName !== 'input' && tagName !== 'textarea' && !event.target.isContentEditable) {
          event.preventDefault()
          togglePlayback()
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return (): void => document.removeEventListener('keydown', handleKeyPress)
  }, [togglePlayback])
}

const useIsLargeScreen = (): boolean => {
  const [isLargeScreen, setIsLargeScreen] = useState(false)

  useEffect(() => {
    const checkScreenSize = (): void => {
      setIsLargeScreen(window.innerWidth >= 1024) // lg breakpoint
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return (): void => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return isLargeScreen
}

const LCARSTopBar = (): JSX.Element => (
  <div className="flex gap-2 mb-4">
    <div className="bg-lcars-orange rounded-l-full rounded-r-lg h-12 sm:h-16 flex-1 flex items-center px-4 sm:px-8">
      <h1 className="text-black text-lg sm:text-2xl font-bold tracking-wider">VIBELOOP</h1>
    </div>
    <div className="bg-lcars-purple rounded-lg w-16 sm:w-32 h-12 sm:h-16" />
    <div className="bg-lcars-blue rounded-lg w-12 sm:w-24 h-12 sm:h-16" />
  </div>
)

const LeftPanel = (): JSX.Element => (
  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
    <EffectsControls />
    <SynthControls />
  </div>
)

const RightPanel = (): JSX.Element => (
  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-4 w-full sm:w-auto">
    <PresetButtons />
    <DrumControls />
    <div className="bg-lcars-pink rounded-t-3xl rounded-b-lg w-full sm:w-20 h-8 sm:h-32 hidden sm:block" />
  </div>
)

const MainContent = (): JSX.Element => {
  const isLargeScreen = useIsLargeScreen()

  if (isLargeScreen) {
    // Desktop Layout
    return (
      <div className="flex flex-row gap-4">
        <LeftPanel />
        <div className="flex items-center">
          <Visualizer side="left" />
        </div>
        <div className="flex-1 min-w-0">
          <Grid />
        </div>
        <div className="flex items-center">
          <Visualizer side="right" />
        </div>
        <RightPanel />
      </div>
    )
  }

  // Mobile Layout
  return (
    <div className="flex flex-col gap-4">
      <Grid />
      <div className="flex gap-4">
        <div className="flex-1">
          <LeftPanel />
        </div>
        <div className="flex-1">
          <RightPanel />
        </div>
      </div>
    </div>
  )
}

const AppContent = (): JSX.Element => {
  const { togglePlayback } = useSequencer()
  useSpacebarToggle(togglePlayback)

  return (
    <div className="min-h-screen bg-black p-2 sm:p-4">
      <div className="max-w-none mx-auto px-2 sm:px-4">
        <LCARSTopBar />
        <MainContent />
        <div className="mt-4">
          <Transport />
        </div>
      </div>
    </div>
  )
}

function App(): JSX.Element {
  return (
    <SequencerProvider>
      <AppContent />
    </SequencerProvider>
  )
}

export default App
