import { Play, Pause, RotateCcw } from 'lucide-react'
import { useSequencer } from '../context/SequencerContext'

const Transport = (): JSX.Element => {
  const { isPlaying, togglePlayback, tempo, setTempo, clearGrid } = useSequencer()

  return (
    <div className="bg-lcars-gray rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-4" data-testid="transport">
      <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
        <button
          onClick={togglePlayback}
          className="bg-lcars-orange text-black rounded-lg px-4 sm:px-6 py-3 flex items-center gap-2 hover:bg-lcars-yellow transition-colors min-h-[48px] touch-manipulation flex-1 sm:flex-none justify-center"
          data-testid="play-button"
          aria-pressed={isPlaying ? "true" : "false"}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          <span className="font-bold">{isPlaying ? 'STOP' : 'PLAY'}</span>
        </button>

        <button
          onClick={clearGrid}
          className="bg-lcars-red text-white rounded-lg px-4 sm:px-6 py-3 flex items-center gap-2 hover:bg-red-700 transition-colors min-h-[48px] touch-manipulation flex-1 sm:flex-none justify-center"
        >
          <RotateCcw size={20} />
          <span className="font-bold">CLEAR</span>
        </button>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto sm:ml-auto">
        <label className="text-white font-bold text-sm sm:text-base">TEMPO</label>
        <input
          type="range"
          min="60"
          max="180"
          value={tempo}
          onChange={(e) => setTempo(Number(e.target.value))}
          className="flex-1 sm:w-32 h-8 sm:h-auto touch-manipulation"
          data-testid="bpm-slider"
        />
        <span className="text-lcars-orange font-bold w-10 sm:w-12 text-sm sm:text-base">{tempo}</span>
      </div>
    </div>
  )
}

export default Transport