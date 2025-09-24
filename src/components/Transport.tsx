import { Play, Pause, RotateCcw } from 'lucide-react'
import { useSequencer } from '../context/SequencerContext'

const Transport = () => {
  const { isPlaying, togglePlayback, tempo, setTempo, clearGrid } = useSequencer()

  return (
    <div className="bg-lcars-gray rounded-lg p-4 flex items-center gap-4">
      <button
        onClick={togglePlayback}
        className="bg-lcars-orange text-black rounded-lg px-6 py-3 flex items-center gap-2 hover:bg-lcars-yellow transition-colors"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        <span className="font-bold">{isPlaying ? 'STOP' : 'PLAY'}</span>
      </button>

      <button
        onClick={clearGrid}
        className="bg-lcars-red text-white rounded-lg px-6 py-3 flex items-center gap-2 hover:bg-red-700 transition-colors"
      >
        <RotateCcw size={20} />
        <span className="font-bold">CLEAR</span>
      </button>

      <div className="flex items-center gap-2 ml-auto">
        <label className="text-white font-bold">TEMPO</label>
        <input
          type="range"
          min="60"
          max="180"
          value={tempo}
          onChange={(e) => setTempo(Number(e.target.value))}
          className="w-32"
        />
        <span className="text-lcars-orange font-bold w-12">{tempo}</span>
      </div>
    </div>
  )
}

export default Transport