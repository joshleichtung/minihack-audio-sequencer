import Grid from './components/Grid'
import Transport from './components/Transport'
import SynthControls from './components/SynthControls'
import PresetButtons from './components/PresetButtons'
import { SequencerProvider } from './context/SequencerContext'

function App() {
  return (
    <SequencerProvider>
      <div className="min-h-screen bg-black p-4">
        {/* LCARS Frame */}
        <div className="max-w-7xl mx-auto">
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
            <div className="flex flex-col gap-4">
              <div className="bg-lcars-peach rounded-t-lg rounded-b-3xl w-20 h-32" />
              <SynthControls />
            </div>

            {/* Center - Grid */}
            <div className="flex-1">
              <Grid />
            </div>

            {/* Right Panel */}
            <div className="flex flex-col gap-4">
              <PresetButtons />
              <div className="bg-lcars-pink rounded-t-3xl rounded-b-lg w-20 h-32" />
            </div>
          </div>

          {/* Bottom Bar - Transport */}
          <div className="mt-4">
            <Transport />
          </div>
        </div>
      </div>
    </SequencerProvider>
  )
}

export default App
