import { useSequencer } from '../context/SequencerContext'

const DrumControls = () => {
  const {
    drumEnabled,
    drumVolume,
    currentDrumPattern,
    drumPatterns,
    toggleDrums,
    setDrumVolume,
    selectDrumPattern
  } = useSequencer()

  return (
    <div className="bg-gray-900 rounded-lg p-4 border-2 border-lcars-orange w-64">
      <h2 className="text-lcars-orange font-bold mb-4">DRUM MACHINE</h2>

      <div className="space-y-4">
        {/* Drum Enable Toggle */}
        <div>
          <button
            onClick={toggleDrums}
            className={`w-full px-4 py-2 rounded font-bold text-sm ${
              drumEnabled
                ? 'bg-lcars-orange text-black'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            DRUMS {drumEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Drum Volume */}
        <div>
          <label className="text-lcars-orange text-sm flex justify-between">
            <span>DRUM VOLUME</span>
            <span className="text-xs">{drumVolume}dB</span>
          </label>
          <input
            type="range"
            min="-24"
            max="0"
            value={drumVolume}
            onChange={(e) => setDrumVolume(Number(e.target.value))}
            className="w-full"
            disabled={!drumEnabled}
          />
        </div>

        {/* Drum Pattern Selector */}
        <div>
          <label className="text-lcars-orange text-sm mb-2 block">PATTERN</label>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {drumPatterns.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => selectDrumPattern(pattern.id)}
                disabled={!drumEnabled}
                className={`w-full px-3 py-2 rounded text-xs text-left ${
                  currentDrumPattern === pattern.id && drumEnabled
                    ? 'bg-lcars-orange text-black'
                    : drumEnabled
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-800 text-gray-500'
                }`}
              >
                <div className="font-bold">{pattern.name}</div>
                <div className="text-xs opacity-75">{pattern.genre}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DrumControls